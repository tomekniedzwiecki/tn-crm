// wf2-landing-api — PUBLICZNY endpoint runtime dla landingów sklepów (workflow v2).
// Landing pobiera stąd aktualną cenę + link do kasy (źródło: wf2_products; cena na
// platformie jest ustawiana z tego samego wiersza, więc DB = spójne źródło bez
// odpytywania partner API w request-path — limit 120 req/min zostaje nietknięty).
//
// GET ?product=<wf2_products.id>
// → { name, price, currency, checkout_url, cod, status }
//
// Bez auth — zwraca WYŁĄCZNIE dane jawnie publikowane na landingu (cena, link kasy,
// nazwa wyświetleniowa). Zero PII, zero kosztów, zero linków do paneli.
// ⚠️ DEPLOY: --no-verify-jwt (woła go przeglądarka klienta końcowego).

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...extra },
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "GET") return json({ error: "GET only" }, 405);

  const id = new URL(req.url).searchParams.get("product") || "";
  if (!UUID_RE.test(id)) return json({ error: "product (uuid) required" }, 400);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase
      .from("wf2_products")
      .select("name, price, checkout_url, status, margin_mode")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "not_found" }, 404);

    return json(
      {
        name: data.name,
        price: data.price != null ? Number(data.price) : null,
        currency: "PLN",
        checkout_url: data.checkout_url || null,
        // COD komunikujemy narracyjnie w treści landinga; flaga na przyszłość
        cod: true,
        status: data.status,
      },
      200,
      // cena zmienia się rzadko (test→scale) — 5 min cache na edge'ach/CDN wystarcza
      { "Cache-Control": "public, max-age=300" },
    );
  } catch (e) {
    console.error("[wf2-landing-api] ERROR:", e);
    return json({ error: "server_error" }, 500);
  }
});
