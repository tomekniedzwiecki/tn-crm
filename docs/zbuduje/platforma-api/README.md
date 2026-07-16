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
| `POST /stores/{id}/pages` | ❌ **502** (2×, origin) | body `{path, name}` — BUG po stronie platformy, zgłosić developerowi |
| `PUT /stores/{id}/pages/{locationId}/html` | ⛔ 500 notImplemented | „Custom HTML page override is not available yet" — **blokuje publikację landingów** |
| `GET /stores/{id}/products` | ✅ 200 | paginacja + `Search`; warianty z price/currency/checkoutSlug/checkoutUrl |
| `POST /stores/{id}/products` | ✅ 200 | body TYLKO `{name, price}` → `{id}`; bez opisu/zdjęć/wariantów; **brak DELETE** |
| `PUT /stores/{id}/products/{pid}/variants/{vid}/checkout-link` | ✅ 200 | body `{checkoutSlug}`; zapis potwierdzony; `checkoutUrl` pozostaje null (pytanie do dev.) |
| `GET /stores/{id}/orders` | ✅ 200 | `From/To` (date-time) + `Page/PageSize`; sort po dacie desc; bez danych klienta |
| `GET /stores/{id}/domains` | ✅ 200 | starterDomain/activeDomain/isOnCustomDomain + lista custom domen z rekordami DNS |
| `POST /stores/{id}/domains` | 🔸 nietestowane (side-effect) | body `{domain}` → rekordy DNS (z www) |
| `POST /stores/{id}/domains/{domainId}/activate` | 🔸 nietestowane | promuje domenę na aktywną |
| `PUT /stores/{id}/branding/logo` | 🔸 nietestowane | body `{data: base64/dataURI, fileName}` → URL |
| `PUT /stores/{id}/branding/favicon` | 🔸 nietestowane | jw. |
| `GET /stores/{id}/delivery-methods` | ✅ 200 | ma **`isCashOnDelivery`** (COD istnieje w modelu!) + priceGroups |
| `GET /stores/{id}/delivery-methods/options` | ✅ 200 | brokerzy: **Apaczka** + Sandbox; priceGroups |
| `POST /stores/{id}/delivery-methods` | 🔸 nietestowane | pełny body (broker, priceGroup, deliveryMode enum, COD flag, freeAboveThreshold) |

Artefakty testów na sklepie „test" (`019f650b-8d9b-7225-b0aa-c5455f6298a1`): produkt **„API Test Produkt"**
(id `019f6baf-8ea0-75c5-89e0-c16bdbd9ba93`, slug `api-test-produkt`) — brak endpointu DELETE, zostaje.

## Luki vs wymagania SSOT (do zgłoszenia developerowi)

1. **PUT html not implemented** → nie opublikujemy landingów (kluczowa funkcja fazy B). Czekamy na wdrożenie.
2. **POST /pages = 502** (powtarzalne) → bug originu.
3. **Produkt = tylko name+price** → brak opisu, zdjęć, wariantów, GTIN/EAN (wymóg feedów GEO), brak endpointu zmiany CENY (potrzebny do test→scale) i brak DELETE.
4. `checkoutUrl` null po ustawieniu `checkoutSlug` — jak/kiedy się materializuje?
5. Brak endpointów pixel/CAPI per sklep (wymagania trackingowe §6 SSOT) i metod płatności checkoutu (pytania płatnościowe §5: COD w checkoucie? lista metod Autopay? branding kasy?). Flaga `isCashOnDelivery` w delivery-methods sugeruje COD w modelu — potwierdzić w checkoucie.
6. Brak robots.txt/sitemap/llms.txt endpointów (wymagania GEO §5b — po stronie platformy).
