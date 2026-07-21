# API platformy e-commerce (Trevio / sklepy.niedzwiecki.ai) — stan 2026-07-16

Partner API platformy, na którą wystawiamy sklepy Workflow v2. Przetestowane end-to-end 16.07.2026.

- **Base URL:** `https://gateway.trevio.pl/partner/v1`
- **Auth:** nagłówek `X-Api-Key: <klucz>` przy KAŻDYM żądaniu; klucz scoped per partner (dostęp do wszystkich sklepów partnera).
- **Klucz:** edge secret Supabase **`ecom_platform_API`** (tn-crm, yxmavwkwnfuphjqbelws). NIEODCZYTYWALNY po zapisie — używać wyłącznie przez adapter.
- **Rate limit:** 120 req/min per klucz → 429 + `Retry-After` (+ nagłówki `RateLimit-*`).
- **Docs maszynowe:** `GET /docs` (wymaga klucza; bez klucza Cloudflare zwraca 403). Zrzut: [`docs-raw.json`](docs-raw.json).

## MERCHANT API — tworzenie konta merchanta i sklepu (edge `wf2-merchant`, 2026-07-21)

**Dwa RÓŻNE API Trevio.** Powyższy `partner/v1` (X-Api-Key) ZARZĄDZA istniejącymi sklepami, ale
**NIE tworzy sklepu**. Zakładanie konta merchanta + utworzenie sklepu robi **API MERCHANTA**
(`gateway.trevio.pl/auth/*` + `/organization/*`, auth per-konto Bearer JWT). Adapter: edge
**`wf2-merchant`** (deploy `npm run deploy:wf2-merchant`, `--no-verify-jwt`; gate:
`x-wf2-secret==WF2_GEN_SECRET` **lub** service-role key w Authorization **lub** team JWT — anon NIGDY).
Tenant `panel.niedzwiecki.ai` = `019f1eb3-95d4-79e7-aa42-ca56ece13021` (env `TREVIO_TENANT_ID`, fallback stały).

**KLUCZOWE (zweryfikowane 21.07): sklep założony przez API merchanta OD RAZU widnieje na liście
`stores` API partnera** (test: nowy sklep Trafionka pojawił się na liście `wf2-platform stores`) →
po utworzeniu całe zarządzanie idzie przez `wf2-platform`.

**Kontrakt end-to-end** (nagłówki każdego żądania: `Content-Type: application/json`,
`Origin: https://panel.niedzwiecki.ai`):
1. `GET /auth/registration-documents?tenantId=<TENANT>` → ID regulaminu + polityki do akceptacji.
   Kształt (21.07): `{ regulation:{id,...}, privacyPolicy:{id,...} }` — POBIERAĆ DYNAMICZNIE (mogą
   rotować; edge zbiera WSZYSTKIE `id` z wartości-obiektów, fallback na tablicę `{documents|data|items:[...]}`).
2. `POST /auth/register` (bez auth) `{firstName,email,password,acceptedDocumentIds:[reg,priv],tenantId}`
   → 200 `{accessToken}`. **BEZ weryfikacji e-mail** (od razu ważny JWT, auto-tworzy organizację).
   Hasło: min 8 zn., wielka+mała+cyfra. **Email zajęty = 409.** Puste `acceptedDocumentIds` = 400 (walidacja).
3. `POST /auth/token` (bez auth) `{email,password,tenantId}` → 200 `{accessToken}` (re-login).
4. `POST /organization/onboarding/setup/physical-product` (Bearer) `{name,isCompany:false}`
   → 200 `{success,websiteId}` = **TWORZY SKLEP** fizyczny.
5. (aktywacja trialu 0 zł, best-effort — błąd NIE przerywa, sklep i tak jest na trialu):
   `GET /organization/payment-plan/website-pricing-payment-plans` (Bearer) → `internalOffer.id`
   planu fizycznego; `POST /auth/refresh {}` → świeży token; `POST /organization/internal-order?organizationId=<ORG>`
   `{internalOfferId,websiteId}`. `organizationId` = claim z JWT (register/refresh). Przy Trafionku
   ten krok przeszedł bez ostrzeżeń (trial aktywny od razu).
6. `GET /organization/website` (Bearer) → potwierdzenie: id, name, domena startowa
   `<slug>.shop.tomekniedzwiecki.pl`.

**Akcje `wf2-merchant`:**
- `create_store {email, first_name, store_name, project_id?, is_company?, password?, link_project?}`
  → pełny flow 1-6. **IDEMPOTENCJA**: konto już w `wf2_merchant_accounts` z hasłem → re-auth (`created:false`,
  NIE zakłada drugiego). register 409 bez zapisanych creds → `{error:'email_taken_no_creds', needs_manual:true}`
  (wołający ma użyć adresu systemowego `<slug>@tomekniedzwiecki.pl` i powtórzyć). Po sukcesie UPSERT do
  `wf2_merchant_accounts` (trzyma HASŁO) + gdy `link_project` (default true) UPDATE
  `wf2_projects.platform_shop_id` + `platform_merchant_email`. Zwraca `{website_id, subdomain, org_id, email, created, warnings}`.
- `token {email}` → re-auth ze stored creds, zwraca `{access_token}` (debug/wewn.; hasła NIE loguje).
- `list_accounts {project_id?}` → wiersze BEZ pola `password` (zredagowane).

**Tabela `wf2_merchant_accounts`** (migracja `20260721d_wf2_merchant_accounts`): trzyma hasła kont
merchanta → **RLS ENABLED, ZERO polityk** (service-role only — anon/authenticated nie widzą wiersza).
Kolumna `wf2_projects.platform_merchant_email` = szybka referencja. WebAuthn/passkey na logowaniu
wspierany — konto passkey-only może NIE mieć hasła (brak drogi API bez interakcji właściciela).

**Pierwsze użycie produkcyjne (21.07): Trafionek** — sklep `019f847d-57bf-7a84-ba72-34bf870d1ddf`
(`trafionek.shop.tomekniedzwiecki.pl`), adres systemowy `trafionek@tomekniedzwiecki.pl` (gmail klienta
zajęty w Trevio → 409). Krok `pl_sklep` panelu zakłada sklep AUTONOMICZNIE (paczka `pl_sklep` pkt 0).

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

**⚠️ CACHE DOMENY CUSTOM (empirycznie 21.07, trafionek.pl):** subdomena starter serwuje
świeży HTML od razu po PUT; **domena custom trzyma snapshot per host >2h** (query-param
z MISS też daje starą wersję — cache origin Trevio, nie edge). **FLUSH = `unpublish` →
`publish` na tej samej ścieżce** (propagacja kilka sekund–2 min; działa też dla home
path:"" — w oknie flushu platforma chwilowo pokazuje swój default). Po każdym re-publish
na domenie custom rób flush albo licz się z wielogodzinnym opóźnieniem. DO ADRIANA:
revalidate przy PUT.

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

## ⛔ TESTOWANIE ZAMÓWIEŃ = ZAWSZE SANDBOX (decyzja Tomka 21.07 — „płacimy prowizję")

Platforma nalicza prowizję od zamówień — TAKŻE na sklepie testowym, jeśli zamówienie idzie
realnymi metodami. Każdy test E2E (checkout-inline, kasa platformy, smoke po publikacji):
- **Dostawa: WYŁĄCZNIE metody „[Test]"/„[Tryb testowy]"** (broker **Sandbox**; NIGDY Apaczka
  ani inne realne — nawet na sklepie test).
- **Płatność online: provider Sandbox** (`isSandbox:true`). **COD tylko w parze z dostawą
  testową** (COD na realnym kurierze = realne zamówienie z prowizją).
- W promptach dla agentów E2E ZAWSZE jawnie wpisywać ten wymóg.
- **API NIE MA anulowania zamówienia** (ani partner, ani storefront — sprawdzone 21.07)
  — pomyłkowe zamówienia testowe anuluje się ręcznie w panelu platformy. LUKA DO ADRIANA:
  endpoint anulowania/oznaczania zamówienia jako testowe.

## PUBLIC STOREFRONT API (odkryte 20.07 wieczór — WŁASNY CHECKOUT MOŻLIWY)

`GET /docs` (partner) ma sekcję **`publicStorefront`**: 59 publicznych endpointów `https://api.trevio.pl/storefront/*`
— to samo API, którym działa storefront (katalog, koszyk, checkout, zamówienia, płatności, kody rabatowe,
zwroty, opinie, feedy Google/FB/Ceneo, lookup NIP w GUS). **BEZ klucza API**; sklep identyfikowany po
`websiteId` lub `domain`. (Osobne `gateway.trevio.pl/front/v1` = 401 — NIE jest nam potrzebne.)

**FLOW WŁASNEGO CHECKOUTU — POTWIERDZONY EMPIRYCZNIE 20.07 (zamówienie 17998771, sklep test, COD):**
1. `clientId` = UUID generowany PRZEZ NAS (localStorage landinga; zero ciastek platformy — koszyk
   żyje serwerowo pod kluczem clientId+websiteId).
2. `POST /storefront/cart/item` `{clientId, websiteId, productVariantId, quantity}` → 200.
3. `POST /storefront/cart/checkout-details` `{clientId, websiteId, fullName, street, houseNumber,
   postCode, city, countryCode, phoneNumber, email, invoice:false, deliveryMethodId, …}` → 200.
   (deliveryMethodId z `GET /storefront/delivery-method`; paczkomaty: `pickupPoint*` + broker-config.)
4. `POST /storefront/order/cart` `{clientId, websiteId, websitePaymentProviderId|null, languageCode:'PL',
   deliveryMethodId, deliveryMethodPriceGroupId, blikCode|null, isCashOnDelivery}` →
   `{orderId, orderNumber, paymentId, redirectUrl, orderValue}`.
5. Płatność online: `GET /storefront/payment-provider` → provider; **BLIK inline**: kod w `order/cart`
   albo `POST /storefront/payment/{paymentId}/initiate {websitePaymentProviderId, blikCode}`;
   polling `GET /storefront/payment/{paymentId}/status`; fallback redirect na `redirectUrl`.
Ceny/warianty: `GET /storefront/product/resolve-checkout-slug` (slug→produkt+wariant) — spina się
z naszymi checkout-slugami z partner API.

Konsekwencje: (a) checkout 1-click COD NA LANDINGU = wykonalny (formularz + 3 requesty; dane klienta
NIE przechodzą przez nasz backend — browser→api.trevio.pl bezpośrednio, RODO zostaje po stronie platformy);
(b) atrybucja: zamówienie złożone po API MA sesję storefrontu tylko gdy klient wszedł na domenę sklepu —
landing na domenie sklepu (isHtml) = sesja jest, zewnętrzny origin = sprawdzić; (c) ⚠️ endpoint `order/cart`
bez captchy/klucza = wektor spamu zamówień COD — zgłosić Adrianowi (rate-limit/turnstile);
(d) Adrian dopisuje do docs przewodniki narracyjne (flow+ciastka) — nasza empiria powyżej już to pokrywa,
zweryfikować zgodność gdy wyjdą. Guides w docs: na razie 1 (`custom-html-pages`).

### ⚠️ CACHE STRON isHtml (odkryte 20/21.07 przy iteracji demo checkoutu)

`PUT pages/{id}/html` na ISTNIEJĄCEJ ścieżce NIE propaguje się od razu — storefront (Vercel,
`X-Vercel-Cache: HIT`) serwuje starą wersję **>10 minut**, i to nawet po cyklu
`isHtml:false → true`. NOWA ścieżka = świeży kod natychmiast. Konsekwencje:
1. **Iteracja/hotfix landinga:** po PUT odczekaj i ZWERYFIKUJ live (grep markera nowej wersji)
   zanim uznasz publikację za skuteczną; w praktyce publikuj poprawki krytyczne pod nową
   ścieżką albo czekaj na wygaśnięcie cache.
2. **DO ADRIANA:** PUT html powinien rewalidować cache storefrontu (revalidatePath) — bez tego
   hotfix buga na landingu w trakcie kampanii czeka w kolejce cache'u. (Zgłoszone 21.07.)

### Przewodniki w docs (LIVE 20.07 późny wieczór): `visitor-identity` + `checkout-flow` (+custom-html-pages)

Zgodne 1:1 z naszym flow empirycznym. Doprecyzowania z przewodników:
1. **`clientId` MUSI być UUIDv7** (platforma używa v7 wszędzie) — nasz test przeszedł na v4,
   ale standard fabryki = v7. Mintujemy go SAMI, raz per odwiedzający, reuse we wszystkich
   wywołaniach; storefront trzyma go w ciastku **`trv_cid`** (2 lata).
2. **⚠️ PUŁAPKA `trv_cid` na stronach isHtml:** nasze landingi na domenie sklepu dostają
   window.trevio SDK, który MA JUŻ clientId w ciastku `trv_cid`. Własny checkout na landingu
   MUSI użyć clientId Z TEGO CIASTKA (nie generować nowego!) — inaczej koszyk/zamówienie
   będą na innym clientId niż sesja analityczna SDK i atrybucja zamówienia będzie PUSTA
   (attribution wiąże się po sesjach analytics tego samego clientId).
3. Ciastka atrybucji (standalone front musiałby prowadzić je sam; na isHtml robi to SDK):
   `trv_attr` = last-touch UTM+referrer (30 dni), `trv_click` = click ids gclid/fbclid/msclkid/
   ttclid/trvclid (90 dni).
4. `deliveryMethodPriceGroupId` dobierać PO WALUCIE z price tiers metody dostawy (jedyny
   nierozpisany wprost szczegół wg Adriana; dla PL sklepów = grupa PLN).
5. Produkty cyfrowe omijają koszyk: `POST /order/digital/one-time-payment`.
