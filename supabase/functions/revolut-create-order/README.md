# Revolut Pay — konfiguracja

Integracja Revolut Merchant API w tn-crm (karta + Apple Pay + Google Pay przez widget Revolut Checkout JS).

## Architektura

```
checkout/index.html
   │
   ├─ klient klika "Revolut Pay"
   │
   ▼
revolut-create-order  (edge fn)
   │  POST /api/orders → Revolut Merchant API
   ▼
RevolutCheckout(public_id).payWithPopup(...)   ← widget JS (popup)
   │  klient płaci kartą / Apple Pay / Google Pay
   ▼
revolut-webhook  (edge fn)   ← Revolut wysyła ORDER_COMPLETED
   │  HMAC-SHA256 verify → mark order as paid → Slack/Meta/TikTok/Google
   ▼
window.location → /checkout/success?order=...
```

## Supabase Secrets (wymagane)

```
revolut_secret_key       sk_xxxxxxxxxxxx              (production lub sk_sandbox_xxx do testów)
revolut_webhook_secret   wsk_xxxxxxxxxxxx             (signing secret z dashboard webhook)
```

`revolut_public_key` (pk_...) **nie jest używany po backendzie** — w tej integracji frontend dostaje `public_id` zamówienia z edge function. Klucz publiczny przyda się tylko jeśli kiedyś przejdziesz na "Inline payment fields" zamiast popupa.

## Co skonfigurować w panelu Revolut Business

### 1. Webhook
- `business.revolut.com` → **Handlowiec** → **API** → **Webhooks** → **Add endpoint**
- URL: `https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/revolut-webhook`
- Events: zaznacz **`ORDER_COMPLETED`** (i opcjonalnie `ORDER_AUTHORISED`, `ORDER_CANCELLED`)
- Skopiuj **Signing Secret** (`wsk_...`) → wrzuć do Supabase jako `revolut_webhook_secret`

### 2. Apple Pay domain verification (tylko jeśli chcesz Apple Pay)
- **Handlowiec** → **API** → **Apple Pay** → **Add domain**
- Wpisz: `crm.tomekniedzwiecki.pl`
- Pobierz plik weryfikacyjny (Revolut go wygeneruje)
- **Zastąp** zawartość `tn-crm/.well-known/apple-developer-merchantid-domain-association` treścią pliku z Revolut
- `git commit + push` → Vercel auto-deploy
- Wróć do panelu Revolut → **Verify** (sprawdzi `https://crm.tomekniedzwiecki.pl/.well-known/apple-developer-merchantid-domain-association`)
- Po sukcesie Apple Pay pokaże się w widgecie

**Bez tego:** Google Pay i karta nadal działają, ale Apple Pay nie pojawi się w popupie.

### 3. Google Pay
- Nie wymaga osobnej konfiguracji domeny. Działa od razu po aktywacji Merchant Account.

## Deploy

```powershell
# Deploy obu funkcji jednym razem
npm run deploy:revolut

# Osobno
npm run deploy:revolut-create
npm run deploy:revolut-webhook
```

⚠️ **Wymagane `--no-verify-jwt`** — webhook musi przyjmować POST bez tokenu Supabase JWT (Revolut nie ma jak go wysłać). Flaga już w `package.json`.

## Testowanie

### Sandbox (przed produkcją)
1. Zarejestruj osobne konto na `sandbox-business.revolut.com` (Tomek aktualnie ma tylko production)
2. W sandboxie wygeneruj `sk_sandbox_...` + osobny webhook secret
3. Tymczasowo podmień Supabase Secrets na sandbox keys
4. Edge function auto-wykryje sandbox po prefixie `sk_sandbox_` (`revolut-create-order/index.ts:118`) i przełączy URL na `sandbox-merchant.revolut.com`
5. Frontend widget też przejdzie na sandbox (parametr `mode: 'sandbox'` zwracany przez edge function)
6. Karty testowe: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)

### Production smoke test
- Zamów coś za 1 PLN realną kartą (najtaniej)
- Sprawdź Slack notification `💰 Nowa płatność (Revolut)!`
- Sprawdź w panelu Revolut → Handlowiec → Orders czy zamówienie ma status `Completed`
- Sprawdź `orders.status = 'paid'` i `orders.payment_source = 'revolut'` w bazie

## Co działa, czego brakuje

✅ Karta debit/credit (Visa, MC, Maestro)
✅ Google Pay (auto-detection na Chrome / Android)
✅ Apple Pay — po domain verification (patrz #2 powyżej)
✅ Webhook z HMAC-SHA256 + timestamp freshness check (5 min replay window)
✅ Defense in depth — webhook robi GET `/api/orders/{id}` żeby zweryfikować state z API (nie ufa samym payloadom webhook)
✅ Te same hooki po sukcesie co Tpay: Slack, Meta CAPI, TikTok Events, Google Ads Enhanced Conversions, audit_log, discount code usage, installment handling

❌ **Recurring / subscriptions** — nie zaimplementowane. Jeśli będziesz chciał cykliczne pobrania (np. abonament Etap 5), trzeba dodać `save_payment_method_for: 'merchant'` + osobny flow `POST /api/orders` z `payment_method_id`.

❌ **Refund flow** — webhook nie obsługuje `ORDER_REFUNDED`. Refundy robisz ręcznie w panelu Revolut, ale order w naszej bazie zostanie ze statusem `paid`. Łatwo dorobić jak będzie potrzeba.

## Pliki

- `supabase/functions/revolut-create-order/index.ts` — tworzy order w Revolut, zwraca `public_id` do widgetu
- `supabase/functions/revolut-webhook/index.ts` — odbiera `ORDER_COMPLETED`, oznacza zamówienie jako paid
- `checkout/index.html` — funkcja `startRevolutCheckout()` otwiera popup widget
- `vercel.json` — CSP dla `merchant.revolut.com` + rewrite dla `.well-known/`
- `.well-known/apple-developer-merchantid-domain-association` — domain verification (zastąp realną treścią)
