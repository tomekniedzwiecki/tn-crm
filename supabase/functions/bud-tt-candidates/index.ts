// bud-tt-candidates — worklist + zapis kandydatów AliExpress dla reverse-image (panel /trendy).
// Dwie operacje (admin-gated: team_member JWT LUB x-tools-secret):
//   {op:'list', limit}                        → produkty pending bez image-searcha (ali_search_url IS NULL)
//   {op:'set', key, ali_candidates, ali_search_url} → CHIRURGICZNY UPDATE (NIE rusza metryk/kategorii
//        jak bud-tt-ingest). ali_search_url zawsze ustawiane → re-run pomija zrobione (resumability).
// Deploy: --no-verify-jwt (własny gate).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-tools-secret",
  "access-control-allow-methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("method", { status: 405, headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await adminGate(req, supabase)))
    return new Response(JSON.stringify({ error: "wymagane_logowanie_admin" }), { status: 403, headers: { ...cors, "content-type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const j = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, "content-type": "application/json" } });

  if (body.op === "list") {
    const limit = Math.min(body.limit || 400, 1000);
    const { data, error } = await supabase
      .from("bud_tt_products")
      .select("key,pl_name,query,tiktok_url,heat,tt_shop")
      .eq("status", "pending")
      .not("tiktok_url", "is", null)
      .is("ali_search_url", null)
      .order("heat", { ascending: false })
      .limit(limit);
    if (error) return j({ error: error.message }, 500);
    // Packshoty produktu z TikTok Shop (czyste zdjęcia) — priorytet nad okładką wideo w reverse-image.
    // shop_img = najlepszy pojedynczy (images_hosted[0] || images[0] || null),
    // shop_imgs = pełna lista (max 3, images_hosted preferowane, potem images CDN — mogą wygasać).
    const products = (data || []).map((p: Record<string, unknown>) => {
      const shop = (p.tt_shop || {}) as Record<string, unknown>;
      const hosted = (Array.isArray(shop.images_hosted) ? shop.images_hosted : []).filter(
        (u: unknown): u is string => typeof u === "string" && !!u,
      );
      const cdn = (Array.isArray(shop.images) ? shop.images : []).filter(
        (u: unknown): u is string => typeof u === "string" && !!u,
      );
      const shop_imgs = [...hosted, ...cdn].slice(0, 3);
      const shop_img = hosted[0] || cdn[0] || null;
      const { tt_shop: _drop, ...rest } = p;
      return { ...rest, shop_img, shop_imgs };
    });
    return j({ products });
  }

  if (body.op === "set") {
    if (!body.key) return j({ error: "brak_key" }, 400);
    const patch: Record<string, unknown> = {
      ali_candidates: Array.isArray(body.ali_candidates) ? body.ali_candidates : [],
      ali_search_url: body.ali_search_url || "attempted",   // zawsze non-null → resumability
    };
    const { error } = await supabase.from("bud_tt_products").update(patch).eq("key", body.key);
    if (error) return j({ error: error.message }, 500);
    return j({ ok: true });
  }

  return j({ error: "nieznane_op" }, 400);
});
