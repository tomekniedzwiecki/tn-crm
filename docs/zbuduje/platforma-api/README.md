# API platformy e-commerce (Trevio / sklepy.niedzwiecki.ai) — stan 2026-07-16

Partner API platformy, na którą wystawiamy sklepy Workflow v2. Przetestowane end-to-end 16.07.2026.

- **Base URL:** `https://gateway.trevio.pl/partner/v1`
- **Auth:** nagłówek `X-Api-Key: <klucz>` przy KAŻDYM żądaniu; klucz scoped per partner (dostęp do wszystkich sklepów partnera).
- **Klucz:** edge secret Supabase **`ecom_platform_API`** (tn-crm, yxmavwkwnfuphjqbelws). NIEODCZYTYWALNY po zapisie — używać wyłącznie przez adapter.
- **Rate limit:** 120 req/min per klucz → 429 + `Retry-After` (+ nagłówki `RateLimit-*`).
- **Docs maszynowe:** `GET /docs` (wymaga klucza; bez klucza Cloudflare zwraca 403). Zrzut: [`docs-raw.json`](docs-raw.json).

## Adapter: edge `wf2-platform` (JEDYNE miejsce znające API — plan §API platformy)

Deploy: `npx supabase functions deploy wf2-platform --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws`.
Gate jak w wf2-gen: team JWT (adminGate) **lub** `x-wf2-secret == WF2_GEN_SECRET`. Na razie tryb `raw`
(discovery/testy); akcje typowane dojdą przy wdrożeniu fazy B (`wf2-orders-sync` itd.).

```
POST https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-platform
{ "action":"raw", "method":"GET", "path":"/stores", "query":{...}, "body":{...} }
→ { "status": <status z platformy>, "content_type": "...", "data": <odpowiedź> }
```

## Endpointy (17) i wyniki testów

| Endpoint | Test 16.07 | Uwagi |
|---|---|---|
| `GET /docs` | ✅ 200 | katalog maszynowy wszystkich endpointów |
| `GET /stores` | ✅ 200 | id + name + activeDomain; 5 sklepów testowych |
| `GET /stores/{id}/pages` | ✅ 200 | id strony = **locationId** do PUT html; path + url; świeży sklep „test" ma pages:[] |
| `POST /stores/{id}/pages` | ✅ 200 (naprawione 16.07 wieczór; wcześniej 502) | body `{path, name}` → od razu `{id, path, name, url}` |
| `PUT /stores/{id}/pages/{locationId}/html` | ✅ 200 (WDROŻONE 16.07 wieczór) | body **`{isHtml: bool, html: string}`** — storefront serwuje HTML zamiast sekcji; `isHtml:false` = powrót do sekcji. Działa też na stronie głównej (locationId strony z `path:""`) — tak ustawia się główna vs podstrona. **Serwowanie = statyczny HTML 1:1 z serwera** (bez wrappera Next.js — wymóg GEO §5b(f) SPEŁNIONY). Zweryfikowane publikacją Uśmieszka (93 KB, UTF-8/polskie znaki OK): https://test.shop.tomekniedzwiecki.pl/usmieszek |
| `GET /stores/{id}/products` | ✅ 200 | paginacja + `Search`; warianty z price/currency/checkoutSlug/checkoutUrl |
| `POST /stores/{id}/products` | ✅ 200 | body TYLKO `{name, price}` → `{id}`; bez opisu/zdjęć/wariantów; **brak DELETE** |
| `PUT /stores/{id}/products/{pid}/variants/{vid}/checkout-link` | ✅ 200 | body `{checkoutSlug}`; `checkoutUrl` materializuje się z OPÓŹNIENIEM (tuż po zapisie null; po chwili `https://{activeDomain}/checkout?p={checkoutSlug}` — zweryfikowane, kasa odpowiada 200) |
| `GET /stores/{id}/orders` | ✅ 200 | `From/To` (date-time) + `Page/PageSize`; sort po dacie desc; bez danych klienta |
| `GET /stores/{id}/domains` | ✅ 200 | starterDomain/activeDomain/isOnCustomDomain + lista custom domen z rekordami DNS |
| `POST /stores/{id}/domains` | 🔸 nietestowane (side-effect) | body `{domain}` → rekordy DNS (z www) |
| `POST /stores/{id}/domains/{domainId}/activate` | 🔸 nietestowane | promuje domenę na aktywną |
| `PUT /stores/{id}/branding/logo` | ✅ 200 (test 16.07: PNG 200 KB raw base64) | → `{url}` na CDN platformy (DO Spaces); storefront podmienia logo NATYCHMIAST (header+stopka przez next/image) |
| `PUT /stores/{id}/branding/favicon` | 🔸 nietestowane | kontrakt jak logo |
| `GET /stores/{id}/delivery-methods` | ✅ 200 | ma **`isCashOnDelivery`** (COD istnieje w modelu!) + priceGroups |
| `GET /stores/{id}/delivery-methods/options` | ✅ 200 | brokerzy: **Apaczka** + Sandbox; priceGroups |
| `POST /stores/{id}/delivery-methods` | 🔸 nietestowane | pełny body (broker, priceGroup, deliveryMode enum, COD flag, freeAboveThreshold) |

Artefakty testów na sklepie „test" (`019f650b-8d9b-7225-b0aa-c5455f6298a1`): produkt **„API Test Produkt"**
(id `019f6baf-8ea0-75c5-89e0-c16bdbd9ba93`, slug `api-test-produkt`) — brak endpointu DELETE, zostaje.

## Integracje + dostawy (doszły w API 17.07 — przetestowane)

**`GET /stores/{id}/integrations`** — 8 typów per sklep: FacebookPixel, TikTokPixel, GoogleAnalytics,
GoogleTagManager, HotJar, LiveChat, Sms, **WpPixel**; każdy z `integrationId`, `isActive` i polami
konfiguracji (pixelId/apiKey/containerId/hotjarId/senderId/liveChatId).
**`PUT /integrations/{integrationId}`** — wysyłać tylko pola danego typu; **UWAGA: PUT z wartością
AUTO-WŁĄCZA integrację** (isActive:true). **`PUT .../toggle`** — flip stanu (bez body).

Test 17.07 (FacebookPixel, sklep „test", pixelId testowy, po teście wyczyszczone): pixel
wstrzykiwany server-side na WSZYSTKICH stronach storefrontu — home, checkout **i naszych
podstronach isHtml**. Konsekwencje:
- **Wymóg §7 TESTY.md „ten sam pixel na obu domenach" REALIZUJE PLATFORMA** — ustawiamy
  pixelId per sklep przez API, checkout jest pokryty.
- **⚠️ REGUŁA LANDINGÓW: init-guard.** Skoro platforma wstrzykuje pixel także w strony isHtml,
  exec-script landingu przy podmienionym `{{PIXEL_ID}}` NIE może drugi raz init/PageView
  (dubel eventów) — ma tylko dowieszać VC/ATC/IC (sprawdzenie `window.fbq` przed loaderem).
- `apiKey` przy FacebookPixel = najpewniej token Conversions API — **pytanie do Adriana:
  czy platforma emituje Purchase server-side (CAPI) z `event_id` (dedup) i czy przenosi
  `fbclid/_fbp/_fbc` z wejścia do zdarzenia?** To ostatni brakujący klocek trackingu.

Dostawy (nowe endpointy, nietestowane): `PUT/DELETE /delivery-methods/{id}`, `PUT /delivery-methods/order`,
`GET /delivery-brokers/{id}/services`, **`PUT /delivery-brokers/{id}/cod-bank-account`** (konto do pobrań
— COD potwierdzone na poziomie brokera).

## Analityka storefrontu: `window.trevio` (guide z GET /docs, 17.07 wieczór)

Strony custom-HTML dostają SDK analityki platformy jako **`window.trevio`**. `PageView` +
heartbeat lecą AUTOMATYCZNIE — nigdy ich nie wołać. Metody (każda bierze 1 obiekt; ceny =
liczby; currency='PLN'; item = {productId, name, price, quantity}):
`viewItem · viewItemList · selectItem · addToCart · removeFromCart · viewCart · beginCheckout ·
addShippingInfo · addPaymentInfo · paymentInitiated · purchase{isCashOnDelivery} ·
purchaseOnDelivery · search · identify{EmailHash|PhoneHash|CustomerId} · newsletterSubscribe ·
emailCampaignClick` + generyczny `trevio.track(eventType, fields)`.
**Mapowanie na landing 1-produktowy** (snippet: `docs/zbuduje/assets/landing-runtime-snippet.html`):
viewItem @load · addToCart+beginCheckout @klik CTA. Purchase emituje platforma na checkoucie.

## Typed actions `wf2-platform` (od 2026-07-18; raw zostaje do diagnostyki)

`stores · pages · publish_landing{shop_id,path,html} (path:''=home) · unpublish_landing ·
products{search} · ensure_product{name,price} (idempotentny po nazwie — brak DELETE!) ·
set_checkout_slug{product_id,variant_id,slug} (+odczyt checkoutUrl) · integrations ·
set_integration{type,config} (PUT AUTO-WŁĄCZA) · toggle_integration · upload_logo/upload_favicon
{base64,file_name} · domains · add_domain · activate_domain · orders{from,to,page} · delivery ·
delivery_options · add_delivery{body} · set_cod_account{broker_id,nrb} · set_delivery_order{items} ·
order_detail{order_id} · order_attribution{order_id} · set_price{product_id,variant_id,price}`.
Retry na 429 (Retry-After) wbudowany. Cena na landingu: publiczny edge **`wf2-landing-api`**
(GET ?product=<wf2_products.id> → {price, checkout_url}; cache 5 min; DB = źródło prawdy).

**⚠️ REGUŁA ZMIANY CENY (test→scale, audyt 19.07):** hydratacja runtime nadpisuje TYLKO
widoczny DOM (`data-price`). Zapieczone w HTML zostają: `<title>`, meta/OG description
i **JSON-LD `"price"`** — a to czytają boty bez JS (wymóg GEO: cena feed↔strona 1:1).
Zmiana ceny produktu = (1) update `wf2_products.price` → landing-api od razu serwuje nową,
(2) **RE-PUBLISH landinga** z podmienioną ceną zapieczoną (title/meta/JSON-LD/fallback),
(3) zmiana ceny na platformie (do czasu endpointu ceny: klient w panelu; strażnik
wf2-orders-sync audytuje rozjazd `platform_price` ↔ `price`).

## Fabryka: `scripts/mockup-tools/platform-sync.py` (19.07) — jedyny zalecany sposób użycia

Sesje fabryki NIE wołają adaptera ręcznie — używają mostu (idempotentne komendy + DOWODY):
`shops · link-shop · status · branding · product · publish · home · page · unpublish`.
`product` = ensure_product + slug + kolumny platform_* + test kasy; `publish` = placeholdery
({{WF2_PRODUCT_ID}}/{{CANONICAL_URL}}/{{PIXEL_ID}}) + noindex wg domeny (starter = zostaje)
+ weryfikacja 200/runtime + platform_page_url + link w Podglądach. Panel: picker sklepu
i live-stan w kroku pl_sklep. Sekrety z `tn-crm/.env` (WF2_GEN_SECRET + service key).

## Analityka zamówień (doszła w API ~20.07 — WDROŻONA w wf2 20.07, sonda E2E zamówieniem COD 95677872)

**Nowe endpointy:** `GET /orders/{id}` (detal z payments), **`GET /orders/{id}/attribution`**
(404 = brak sesji), `payments[]` w liście `/orders`, **`PUT /products/{pid}/variants/{vid}/price`**
`{price}` (endpoint ceny z §3.4 CENNIK — JEST), plus produktowe: `variants` GET/PUT, `multi-variant`,
`variants/{vid}/details`, `media` GET/PUT/DELETE (produkt i sklep) — nietestowane jeszcze.

**payments[] (potwierdzone):** `{id, publicId, type, status, amount:{amount,currency},
isCashOnDelivery, isBlik, provider, isSandbox, externalPaymentId, createdAt}`.
COD po złożeniu = `status:"Pending"` → opłacone dopiero po odbiorze. Semantyka wf2:
`is_paid` = którakolwiek płatność ze statusem success (paid/completed/…); NULL gdy payments puste.

**attribution (potwierdzone, BOGATE):** `sessions[]` (landingPage z pełnym query, source/channel,
utm_*, device, duration, pageViews, orderId), `firstTouch`/`lastTouch`, `clickIds{fbclid,gclid,ttclid,…}`,
`journey[]` (PageView→AddToCart→AddShippingInfo→PaymentInitiated→Purchase z productId!),
`primarySession{reason:'PurchaseMatch'}`. Sesja łapie UTM z wejścia na landing (ta sama domena
landing↔checkout) — **konwencja: URL reklamy z `utm_campaign={nazwa kampanii Meta}` +
`utm_content={nazwa kreacji}` daje przychód per kampania/kreacja BEZ pixela.**
**⚠️ PII:** `identity.identities[].valueHashedOrId` zwraca SUROWY email/telefon mimo „no PII" —
zgłosić Adrianowi; wf2 wycina pole `identity` przed zapisem do bazy.

**Warstwa wf2 (migracja `20260720b_wf2_analityka`):** `wf2_orders` + payments/is_paid/paid_at/
payment_method + attribution (jsonb bez identity) / attributed_source ('facebook/paid') /
attribution_campaign / attribution_entry_path / attribution_click_ids / attribution_status
(pending→ok|none, retry 24h, okno 14 dni, limit 20 GET/projekt/run); `wf2_sales` + orders_paid/
revenue_paid (księga PAID obok całości); `wf2_products.orders_confirmed` (opłacone; `orders_paid`
zostaje proxy-licznikiem do 1000). Wszystko liczy cron `wf2-orders-sync`.
Nowe typed actions adaptera: `order_detail · order_attribution · set_price{product_id,variant_id,price}`.

## Rozwiązane / otwarte luki

1. ~~PUT html not implemented~~ **WDROŻONE i przetestowane 16.07 wieczór** (kontrakt `{isHtml, html}`; pilot: Uśmieszek na sklepie „test").
2. ~~POST /pages = 502~~ **NAPRAWIONE 16.07 wieczór.**
3. **Produkt = tylko name+price przy CREATE** → ~~brak endpointu zmiany ceny~~ **JEST
   (`PUT variants/{vid}/price`, 20.07)**; doszły też `variants/details`, `media`, `multi-variant`
   (nietestowane — do sprawdzenia czy pokrywają opis/zdjęcia/EAN). Nadal brak DELETE/ukrycia produktu.
4. ~~`checkoutUrl` null po ustawieniu sluga~~ ROZWIĄZANE: materializuje się asynchronicznie
   (kilka minut); format `https://{activeDomain}/checkout?p={checkoutSlug}`. Przy publikacji
   landingu: polling do skutku albo składanie URL z domeny+sluga.
5. ~~Brak pixel/CAPI per sklep~~ integracje SĄ (17.07) + ~~brak statusu płatności~~ **payments[]
   SĄ (20.07)**; ~~COD w checkoucie?~~ **POTWIERDZONE sondą E2E 20.07**: checkout przełącza się
   na „Płatność przy odbiorze" przy metodzie COD, branding sklepu w kasie pełny. OTWARTE:
   pytanie CAPI (czy platforma emituje Purchase server-side z event_id + fbclid/_fbp/_fbc)
   i lista realnych metod płatności produkcyjnej bramki (sandbox pokazuje tylko symulator).
5b. **⚠️ PII w /orders/{id}/attribution** (`identity.identities[].valueHashedOrId` = surowy
   email/telefon mimo deklaracji „no personal data") — DO ZGŁOSZENIA Adrianowi (RODO).
6. Brak robots.txt/sitemap/llms.txt endpointów (wymagania GEO §5b — po stronie platformy).
7. **Brak meta/SEO po API dla stron renderowanych przez platformę** (zbadane 17.07: title
   i description = „Default" na home/products/product/{nr}; title produktu = „{nazwa} | Default").
   Nasz HTML (isHtml) ma meta pod kontrolą — luka dotyczy auto-stron: potrzebne ustawienia
   SEO sklepu (nazwa do szablonu title, description, OG-image) + meta per produkt. Auto-strony
   produktów będą się indeksować z „Default" równolegle z landingami.
