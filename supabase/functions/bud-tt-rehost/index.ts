// bud-tt-rehost — trwałe miniatury produktów /sklep.
// PROBLEM: cover z TikTok CDN to PODPISANY URL z krótkim TTL (x-expires ~godziny) →
// zapisany przy ingescie gnije w ~dobę → w przeglądarce ERR_BLOCKED_BY_ORB (TikTok
// oddaje błąd zamiast obrazka dla wygasłego podpisu).
// FIX: pobierz ŚWIEŻY thumbnail przez DARMOWY TikTok oEmbed (bez klucza) → wgraj BAJTY
// do storage Supabase (bucket `attachments`, ścieżka bud-covers/<videoId>.jpg) →
// podmień `cover` na TRWAŁY publiczny URL storage. Idempotentne: pomija już-przeniesione
// (chyba że force). Re-runnable: backfill (status=approved) + hook po zatwierdzeniu (keys[]).
// Gate: adminGate (team_member JWT z panelu /trendy LUB x-tools-secret z backendu).
// Deploy: --no-verify-jwt (własny gate).
// OP {op:'shop_images', limit?:50}: osobny backfill TRWAŁYCH PACKSHOTÓW TikTok Shop
// (tt_shop.images = podpisane URL-e CDN, wygasają) → storage → tt_shop.images_hosted (patrz _shared/shop-images.ts).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";
import { rehostShopImages } from "../_shared/shop-images.ts";

const BUCKET = "attachments";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tools-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function vidId(url: string): string {
  const m = (url || "").match(/video\/(\d+)/);
  if (m) return m[1];
  // fallback: deterministyczny slug z URL
  return (url || "x").replace(/[^a-z0-9]/gi, "").slice(-40) || "x";
}

async function freshThumb(ttUrl: string): Promise<string | null> {
  // TikTok oEmbed — publiczny, bez klucza, zawsze świeży thumbnail_url.
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch("https://www.tiktok.com/oembed?url=" + encodeURIComponent(ttUrl), { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = await r.json();
    return (j && typeof j.thumbnail_url === "string" && j.thumbnail_url) || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("method", { status: 405, headers: cors });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  if (!(await adminGate(req, supabase)))
    return new Response(JSON.stringify({ error: "wymagane_logowanie_admin" }), { status: 403, headers: { ...cors, "content-type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const jsonRes = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "content-type": "application/json" } });

  // ── OP shop_images: backfill trwałych PACKSHOTÓW produktów TikTok Shop.
  // Wiersze status in (pending,approved) z tt_shop->images ale BEZ tt_shop->images_hosted → helper
  // (rehost bajtów do storage) → update tt_shop.images_hosted (+ cover = pierwszy hosted, gdy cover
  // jeszcze nie jest storage'owy). Zwraca {processed, rehosted_images, failed}. Wołane w pętli aż processed=0.
  if (body.op === "shop_images") {
    const lim: number = Math.min(body.limit || 50, 100);
    const topUp = !!body.topUp; // dorabianie brakujących: hosted istnieje, ale krótsze niż images (limit był 3, teraz 8)
    // Kandydaci: images obecne; bez topUp — images_hosted brak; z topUp — filtr długości w JS (PostgREST
    // nie porówna długości dwóch tablic jsonb).
    let q = supabase
      .from("bud_tt_products")
      .select("key,cover,tt_shop")
      .in("status", ["pending", "approved"])
      .not("tt_shop->images", "is", null);
    if (!topUp) q = q.is("tt_shop->images_hosted", null);
    const { data: cand, error: cErr } = await q.limit(topUp ? 1000 : lim);
    if (cErr) return jsonRes({ error: cErr.message }, 500);
    let processed = 0, rehosted_images = 0, failed = 0;
    const results: Array<Record<string, unknown>> = [];
    for (const row of (cand || [])) {
      if (processed >= lim) break;
      // deno-lint-ignore no-explicit-any
      const ts: any = row.tt_shop;
      const imgs: string[] = Array.isArray(ts?.images) ? ts.images : [];
      const hostedNow: string[] = Array.isArray(ts?.images_hosted) ? ts.images_hosted : [];
      if (!imgs.length) continue;
      if (topUp) { if (hostedNow.length >= Math.min(imgs.length, 30)) continue; } // komplet — pomiń
      else if (hostedNow.length) continue; // guard trybu podstawowego
      processed++;
      const key = row.key as string;
      try {
        const hosted = await rehostShopImages(supabase, key, imgs, 30);
        if (!hosted.length) { failed++; results.push({ key, err: "no-hosted" }); continue; }
        // deno-lint-ignore no-explicit-any
        const patch: Record<string, any> = { tt_shop: { ...ts, images_hosted: hosted } };
        const cov = String((row.cover as string) || "");
        if (!cov.includes("/storage/v1/")) patch.cover = hosted[0]; // podmień wygasający cover z shop CDN
        const { error: uErr } = await supabase.from("bud_tt_products").update(patch).eq("key", key);
        if (uErr) { failed++; results.push({ key, err: "db-" + uErr.message.slice(0, 40) }); continue; }
        rehosted_images += hosted.length;
        results.push({ key, hosted: hosted.length });
      } catch (e) {
        failed++;
        results.push({ key, err: String(e).slice(0, 80) });
      }
    }
    return jsonRes({ processed, rehosted_images, failed, results });
  }

  const status: string = body.status || "approved";
  const keys: string[] | null = Array.isArray(body.keys) && body.keys.length ? body.keys : null;
  const limit: number = Math.min(body.limit || 200, 500);
  const force: boolean = !!body.force;

  // Wybór produktów do przeniesienia.
  let q = supabase.from("bud_tt_products").select("key,tiktok_url,cover").not("tiktok_url", "is", null);
  if (keys) q = q.in("key", keys);
  else if (status !== "all") q = q.eq("status", status);
  const { data: rows, error: selErr } = await q.limit(limit);
  if (selErr) return new Response(JSON.stringify({ error: selErr.message }), { status: 500, headers: { ...cors, "content-type": "application/json" } });

  const results: Array<Record<string, unknown>> = [];
  let ok = 0;
  for (const r of (rows || [])) {
    const key = r.key as string;
    const cover = (r.cover as string) || "";
    if (!force && cover.includes("/storage/v1/")) { results.push({ key, skip: "already" }); continue; }
    try {
      // 1) świeży thumbnail (oEmbed) → fallback: bieżący cover (gdy jeszcze ważny)
      let thumb = await freshThumb(r.tiktok_url as string);
      if (!thumb) thumb = cover || null;
      if (!thumb) { results.push({ key, err: "no-thumb" }); continue; }
      // 2) pobierz bajty
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const ir = await fetch(thumb, { signal: ctrl.signal });
      clearTimeout(t);
      if (!ir.ok) { results.push({ key, err: "img-" + ir.status }); continue; }
      const ct = ir.headers.get("content-type") || "image/jpeg";
      if (!ct.startsWith("image/")) { results.push({ key, err: "notimg-" + ct.slice(0, 24) }); continue; }
      const bytes = new Uint8Array(await ir.arrayBuffer());
      if (bytes.length < 1000) { results.push({ key, err: "tiny-" + bytes.length }); continue; }
      // 3) upload do storage (upsert — re-host nadpisuje)
      const path = "bud-covers/" + vidId(r.tiktok_url as string) + ".jpg";
      const up = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: "image/jpeg", upsert: true });
      if (up.error) { results.push({ key, err: "up-" + up.error.message.slice(0, 40) }); continue; }
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      // 4) podmień cover na trwały URL
      const { error: upErr } = await supabase.from("bud_tt_products").update({ cover: pub.publicUrl }).eq("key", key);
      if (upErr) { results.push({ key, err: "db-" + upErr.message.slice(0, 40) }); continue; }
      ok++;
      results.push({ key, ok: true });
    } catch (e) {
      results.push({ key, err: String(e).slice(0, 80) });
    }
  }
  return new Response(JSON.stringify({ total: (rows || []).length, ok, results }), { headers: { ...cors, "content-type": "application/json" } });
});
