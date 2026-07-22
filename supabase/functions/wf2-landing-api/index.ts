// wf2-landing-api — PUBLICZNY endpoint runtime dla landingów sklepów (workflow v2).
// Landing pobiera stąd aktualną cenę + link do kasy (źródło: wf2_products; cena na
// platformie jest ustawiana z tego samego wiersza, więc DB = spójne źródło bez
// odpytywania partner API w request-path — limit 120 req/min zostaje nietknięty).
//
// GET ?product=<wf2_products.id>
// → { name, price, currency, checkout_url, cod, status, sold,
//     platform: { website_id, product_id, variant_id } }
//   Blok `platform` (dodany 2026-07-20) zasila moduł checkout-inline@1 — własny checkout
//   na landingu przez Public Storefront API Trevio. Te ID są jawne w publicznym storefroncie.
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
    // ⚠️ ENDPOINT PUBLICZNY NA SERVICE-ROLE: lista kolumn poniżej = JEDYNA bariera
    // przed wyciekiem. NIGDY select('*'); dokładasz kolumnę = upewnij się, że jest
    // jawnie publikowana na landingu (zero PII/kosztów/marż zakupu).
    // ALLOWLISTA (dozwolone jako JAWNE PUBLICZNIE):
    //   project_id            — klucz wewnętrzny (do policzenia sold / pobrania sklepu),
    //   name, price, checkout_url, status, margin_mode — cena i link kasy widoczne na landingu,
    //   platform_product_id, platform_variant_id — ID produktu/wariantu w Public Storefront
    //     API Trevio (api.trevio.pl/storefront/*); te ID są JAWNE w publicznym storefroncie
    //     (koszyk/checkout keyed nimi bez klucza), zero PII/kosztów — potrzebne modułowi
    //     checkout-inline@1 do złożenia zamówienia z poziomu landinga.
    const { data, error } = await supabase
      .from("wf2_products")
      .select("project_id, name, platform_name, price, checkout_url, status, margin_mode, platform_product_id, platform_variant_id")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "not_found" }, 404);

    // websiteId sklepu (Public Storefront API keyuje wszystko websiteId+clientId).
    // wf2_projects.platform_shop_id = JAWNY identyfikator sklepu w storefroncie — zero PII.
    let websiteId: string | null = null;
    try {
      const { data: proj } = await supabase
        .from("wf2_projects")
        .select("platform_shop_id")
        .eq("id", data.project_id)
        .maybeSingle();
      websiteId = proj?.platform_shop_id ?? null;
    } catch (_) { /* brak sklepu ≠ brak ceny — landing i tak działa z fallbackiem kasy */ }

    // social-proof: ile zamówień z platformy zawiera ten produkt (mapowanie robi wf2-orders-sync).
    // Uczciwe liczby własnego sklepu — landing pokazuje TYLKO przy sensownym progu (decyzja frontu).
    let sold = 0;
    try {
      const { count } = await supabase
        .from("wf2_orders")
        .select("id", { count: "exact", head: true })
        .eq("project_id", data.project_id)
        .contains("lines", [{ product_id: id }]);
      sold = count || 0;
    } catch (_) { /* brak liczby ≠ brak ceny */ }

    return json(
      {
        // nazwa KLIENTOWA (LL-046): platform_name = marketingowa mini-marka (trafia do
        // podsumowania checkoutu); robocze wf2_products.name tylko fallbackiem
        name: data.platform_name || data.name,
        price: data.price != null ? Number(data.price) : null,
        currency: "PLN",
        checkout_url: data.checkout_url || null,
        // COD komunikujemy narracyjnie w treści landinga; flaga na przyszłość
        cod: true,
        status: data.status,
        sold,
        // blok dla modułu checkout-inline@1 (własny checkout na landingu przez
        // Public Storefront API). null-e gdy sklep/produkt jeszcze nie zsynchronizowane
        // z platformą — moduł spada wtedy na fallback „bezpieczna kasa" (checkout_url).
        platform: {
          website_id: websiteId,
          product_id: data.platform_product_id ?? null,
          variant_id: data.platform_variant_id ?? null,
        },
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
