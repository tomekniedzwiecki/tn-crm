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
import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

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
