# Plan Testow TN-CRM

## Spis tresci
1. [Podsumowanie](#podsumowanie)
2. [Architektura systemu](#architektura-systemu)
3. [Testy Leads](#1-testy-leads)
4. [Testy Ofert (client_offers)](#2-testy-ofert-client_offers)
5. [Testy Platnosci](#3-testy-platnosci)
6. [Testy Integracyjne E2E](#4-testy-integracyjne-e2e)
7. [Testy RLS Security](#5-testy-rls-security)
8. [Narzedzia i konfiguracja](#narzedzia-i-konfiguracja)

---

## Podsumowanie

### Krytyczne obszary (najwyzszy priorytet)
| Obszar | Ryzyko | Uzasadnienie |
|--------|--------|--------------|
| Platnosci (tpay-webhook) | CRITICAL | Bezposredni wplyw na przychody, integracja z zewnetrznym API |
| Checkout flow | CRITICAL | Konwersja klientow, tworzenie zamowien |
| Leads RLS | HIGH | Dane osobowe klientow, bezpieczenstwo |
| client_offers token access | HIGH | Dostep anonimowy przez token, potencjalny wyciek danych |
| Orders RLS | HIGH | Dane finansowe, bezpieczenstwo |

### Stack testowy
- **Unit testy**: Deno test (dla edge functions)
- **Integration testy**: Vitest + @supabase/supabase-js
- **E2E testy**: Playwright
- **RLS testy**: psql / Supabase SQL Editor

---

## Architektura systemu

### Flow: Lead -> Offer -> Checkout -> Payment -> Workflow

```
1. Lead utworzony (lead-upsert edge function)
   |
2. Oferta wyslana (client_offers + offer)
   |
3. Klient otwiera link z tokenem (client-offer.html)
   |
4. Klient przechodzi do checkout (checkout/index.html)
   |
5. Tworzenie zamowienia (orders table)
   |
6. Tworzenie transakcji Tpay (tpay-create-transaction)
   |
7. Klient placi (przekierowanie do Tpay)
   |
8. Webhook od Tpay (tpay-webhook)
   |
9. Zamowienie oznaczone jako paid
   |
10. Tworzenie workflow (trigger)
```

### Kluczowe tabele
- `leads` - dane leadow, ankiety
- `offers` - definicje ofert (cena, nazwa)
- `client_offers` - oferty przypisane do leadow (token dostepowy, custom_price)
- `orders` - zamowienia (status: pending/paid/cancelled)
- `workflows` - projekty klientow
- `automation_flows` / `automation_executions` - automatyzacje

### Kluczowe edge functions
- `lead-upsert` - tworzenie/aktualizacja leadow
- `tpay-create-transaction` - tworzenie transakcji Tpay
- `tpay-webhook` - odbieranie webhookow platnosci
- `automation-trigger` - wyzwalanie automatyzacji
- `automation-executor` - wykonywanie krokow automatyzacji

---

## 1. Testy Leads

### 1.1 Unit testy - lead-upsert edge function

#### TEST-LEAD-001: Tworzenie nowego leada
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Tworzenie nowego leada z wymaganymi polami |
| **Co testuje** | Edge function lead-upsert - INSERT |
| **Dane wejsciowe** | `{ email: "test@example.com", name: "Jan Kowalski" }` |
| **Oczekiwany wynik** | Lead utworzony, zwrocone `{ success: true, lead_id: UUID, is_new: true }` |
| **Priorytet** | CRITICAL |

```typescript
// tests/unit/lead-upsert.test.ts
Deno.test("lead-upsert: creates new lead", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/lead-upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test-new@example.com",
      name: "Jan Kowalski"
    })
  });

  const result = await response.json();
  assertEquals(result.success, true);
  assertEquals(result.is_new, true);
  assertExists(result.lead_id);
});
```

#### TEST-LEAD-002: Aktualizacja istniejacego leada
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Aktualizacja leada z tym samym emailem |
| **Co testuje** | Edge function lead-upsert - UPDATE (upsert logic) |
| **Dane wejsciowe** | `{ email: "existing@example.com", name: "Nowa Nazwa", phone: "+48500600700" }` |
| **Oczekiwany wynik** | Lead zaktualizowany, `{ success: true, is_new: false }` |
| **Priorytet** | CRITICAL |

#### TEST-LEAD-003: Walidacja emaila
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Odrzucenie requesta bez emaila |
| **Co testuje** | Walidacja wymaganych pol |
| **Dane wejsciowe** | `{ name: "Jan Kowalski" }` (brak email) |
| **Oczekiwany wynik** | HTTP 400, `{ success: false, error: "Email jest wymagany" }` |
| **Priorytet** | HIGH |

#### TEST-LEAD-004: Normalizacja emaila
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Email normalizowany do lowercase |
| **Co testuje** | Normalizacja emaila w lead-upsert |
| **Dane wejsciowe** | `{ email: "TEST@EXAMPLE.COM" }` |
| **Oczekiwany wynik** | Lead zapisany z emailem `test@example.com` |
| **Priorytet** | MEDIUM |

#### TEST-LEAD-005: Ankieta - survey_completed_at
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Ustawienie survey_completed_at przy danych ankiety |
| **Co testuje** | Automatyczne ustawienie timestampa przy danych ankiety |
| **Dane wejsciowe** | `{ email: "test@example.com", weekly_hours: "20-40", target_income: "10000" }` |
| **Oczekiwany wynik** | Lead ma ustawione `survey_completed_at` |
| **Priorytet** | HIGH |

### 1.2 Integration testy - Leads RLS

#### TEST-LEAD-RLS-001: Anon nie moze czytac leadow
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Anonimowy uzytkownik nie ma dostepu do tabeli leads |
| **Co testuje** | RLS policy na leads |
| **Dane wejsciowe** | SELECT z klientem anon |
| **Oczekiwany wynik** | Pusta tablica lub blad RLS |
| **Priorytet** | CRITICAL |

```sql
-- Test w Supabase SQL Editor (jako anon)
SET ROLE anon;
SELECT * FROM leads LIMIT 1;
-- Oczekiwany wynik: 0 wierszy (RLS blokuje)
```

#### TEST-LEAD-RLS-002: Authenticated moze czytac wszystkie leady
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Zalogowany uzytkownik ma dostep do leadow |
| **Co testuje** | RLS policy "leads_authenticated_all" |
| **Dane wejsciowe** | SELECT z klientem authenticated |
| **Oczekiwany wynik** | Zwrocone leady |
| **Priorytet** | HIGH |

---

## 2. Testy Ofert (client_offers)

### 2.1 Unit testy - Generowanie linkow

#### TEST-OFFER-001: Tworzenie client_offer z tokenem
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Tworzenie oferty dla leada generuje unikalny token |
| **Co testuje** | INSERT do client_offers |
| **Dane wejsciowe** | lead_id, offer_id |
| **Oczekiwany wynik** | Rekord z wygenerowanym access_token |
| **Priorytet** | CRITICAL |

#### TEST-OFFER-002: custom_price nadpisuje offer.price
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Custom price w client_offer ma priorytet |
| **Co testuje** | Logika custom_price w checkout |
| **Dane wejsciowe** | client_offer z custom_price = 500, offer.price = 1000 |
| **Oczekiwany wynik** | Checkout pokazuje 500 PLN |
| **Priorytet** | HIGH |

```javascript
// Test w checkout/index.html logice
// Gdy client_offer ma custom_price, uzywamy go zamiast offer.price
const { data: clientOffer } = await supabase
  .from('client_offers')
  .select('custom_price')
  .eq('id', clientOfferId)
  .single();

if (clientOffer?.custom_price) {
  currentOffer.price = parseFloat(clientOffer.custom_price);
}
```

### 2.2 Integration testy - Dostep przez token

#### TEST-OFFER-ACCESS-001: Anon moze czytac client_offer przez token
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Dostep anonimowy przez access_token |
| **Co testuje** | RLS policy "Anon can view shared client_offers" |
| **Dane wejsciowe** | SELECT WHERE access_token = 'valid_token' |
| **Oczekiwany wynik** | Zwrocony rekord client_offer |
| **Priorytet** | CRITICAL |

```sql
-- Test RLS dla anon z tokenem
SET ROLE anon;
SELECT * FROM client_offers WHERE access_token = 'test-token-123';
-- Oczekiwany wynik: 1 wiersz (jesli istnieje)
```

#### TEST-OFFER-ACCESS-002: Anon NIE moze czytac BEZ tokena
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Blokada dostepu bez tokena |
| **Co testuje** | RLS nie pozwala na SELECT bez warunku token |
| **Dane wejsciowe** | SELECT * FROM client_offers (bez WHERE) |
| **Oczekiwany wynik** | 0 wierszy |
| **Priorytet** | CRITICAL |

#### TEST-OFFER-ACCESS-003: Wygasla oferta
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Oferta po valid_until jest niedostepna |
| **Co testuje** | Walidacja daty waznosci w client-offer.html |
| **Dane wejsciowe** | client_offer z valid_until = wczoraj |
| **Oczekiwany wynik** | Wyswietlony ekran "Oferta wygasla" |
| **Priorytet** | HIGH |

#### TEST-OFFER-TRACK-001: Rejestracja otwarcia oferty
| Pole | Wartosc |
|------|---------|
| **Nazwa** | viewed_at aktualizowane przy otwarciu |
| **Co testuje** | UPDATE viewed_at w client_offers |
| **Dane wejsciowe** | Otwarcie strony client-offer.html |
| **Oczekiwany wynik** | viewed_at ustawione na aktualny czas |
| **Priorytet** | MEDIUM |

---

## 3. Testy Platnosci

### 3.1 Unit testy - tpay-create-transaction

#### TEST-PAY-001: Tworzenie transakcji BLIK
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Tworzenie transakcji z kodem BLIK |
| **Co testuje** | tpay-create-transaction z blikCode |
| **Dane wejsciowe** | `{ orderId: UUID, paymentType: "blik", blikCode: "123456" }` |
| **Oczekiwany wynik** | `{ success: true, transactionId, paymentUrl, blikInline: true }` |
| **Priorytet** | CRITICAL |

```typescript
// tests/unit/tpay-create-transaction.test.ts
Deno.test("tpay-create-transaction: BLIK inline", async () => {
  // Najpierw utworz order
  const orderId = await createTestOrder();

  const response = await fetch(`${SUPABASE_URL}/functions/v1/tpay-create-transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      orderId,
      paymentType: "blik",
      blikCode: "123456"
    })
  });

  const result = await response.json();
  assertEquals(result.success, true);
  assertEquals(result.blikInline, true);
  assertExists(result.transactionId);
});
```

#### TEST-PAY-002: Tworzenie transakcji przelew
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Tworzenie transakcji przelewem |
| **Co testuje** | tpay-create-transaction z groupId = 0 |
| **Dane wejsciowe** | `{ orderId: UUID, paymentType: "transfer" }` |
| **Oczekiwany wynik** | `{ success: true, paymentUrl }` - URL do wyboru banku |
| **Priorytet** | HIGH |

#### TEST-PAY-003: Zamowienie juz oplacone
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Blokada platnosci dla oplaconego zamowienia |
| **Co testuje** | Walidacja status !== 'paid' |
| **Dane wejsciowe** | orderId zamowienia ze statusem 'paid' |
| **Oczekiwany wynik** | HTTP 400, `{ error: "Zamowienie jest juz oplacone" }` |
| **Priorytet** | HIGH |

#### TEST-PAY-004: Nieistniejace zamowienie
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Blad dla nieistniejacego orderId |
| **Co testuje** | Walidacja istnienia zamowienia |
| **Dane wejsciowe** | `{ orderId: "non-existent-uuid" }` |
| **Oczekiwany wynik** | HTTP 400, `{ error: "Zamowienie nie znalezione" }` |
| **Priorytet** | HIGH |

### 3.2 Unit testy - tpay-webhook

#### TEST-WEBHOOK-001: Platnosc udana (TRUE)
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Webhook z tr_status=TRUE aktualizuje zamowienie |
| **Co testuje** | tpay-webhook - sukces platnosci |
| **Dane wejsciowe** | `tr_id=TX123&tr_status=TRUE&tr_amount=1000&tr_crc=ORDER_ID` |
| **Oczekiwany wynik** | Order.status = 'paid', paid_at ustawione |
| **Priorytet** | CRITICAL |

```bash
# Test curl (uzywany w scripts/test-webhooks.sh)
curl -X POST "$SUPABASE_URL/functions/v1/tpay-webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "tr_id=TX123&tr_status=TRUE&tr_amount=1000&tr_crc=$ORDER_ID"
```

#### TEST-WEBHOOK-002: Platnosc nieudana (FALSE)
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Webhook z tr_status=FALSE nie zmienia statusu |
| **Co testuje** | tpay-webhook - nieudana platnosc |
| **Dane wejsciowe** | `tr_id=TX123&tr_status=FALSE&tr_amount=1000` |
| **Oczekiwany wynik** | Order.status pozostaje 'pending' |
| **Priorytet** | HIGH |

#### TEST-WEBHOOK-003: Chargeback/refund
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Webhook z tr_status=CHARGEBACK anuluje zamowienie |
| **Co testuje** | tpay-webhook - zwrot/chargeback |
| **Dane wejsciowe** | `tr_id=TX123&tr_status=CHARGEBACK` |
| **Oczekiwany wynik** | Order.status = 'cancelled' |
| **Priorytet** | HIGH |

#### TEST-WEBHOOK-004: Brak tr_id
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Webhook bez transaction ID |
| **Co testuje** | Walidacja wymaganych pol |
| **Dane wejsciowe** | `tr_status=TRUE&tr_amount=1000` (brak tr_id) |
| **Oczekiwany wynik** | HTTP 400, response "FALSE" |
| **Priorytet** | HIGH |

#### TEST-WEBHOOK-005: Webhook dostepny bez JWT
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Endpoint nie wymaga autoryzacji JWT |
| **Co testuje** | Deploy z --no-verify-jwt |
| **Dane wejsciowe** | Request bez headera Authorization |
| **Oczekiwany wynik** | HTTP 200 (nie 401) |
| **Priorytet** | CRITICAL |

```bash
# Juz zaimplementowane w scripts/test-webhooks.sh
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPABASE_URL/tpay-webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "tr_id=test123&tr_status=TRUE&tr_amount=100")
# Oczekiwane: 200, NIE 401
```

#### TEST-WEBHOOK-006: Weryfikacja podpisu MD5 (opcjonalna)
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Weryfikacja md5sum gdy skonfigurowane |
| **Co testuje** | verifyTpaySignature() |
| **Dane wejsciowe** | Poprawny md5sum = md5(merchant_id + tr_id + amount + crc + secret) |
| **Oczekiwany wynik** | Request zaakceptowany |
| **Priorytet** | MEDIUM |

#### TEST-WEBHOOK-007: Inkrementacja kodu rabatowego
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Uzycie kodu rabatowego przy platnosci |
| **Co testuje** | RPC use_discount_code przy sukcesie platnosci |
| **Dane wejsciowe** | Order z discount_code_id |
| **Oczekiwany wynik** | discount_codes.current_uses++ |
| **Priorytet** | HIGH |

### 3.3 Integration testy - Checkout flow

#### TEST-CHECKOUT-001: Ladowanie oferty
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Checkout laduje dane oferty |
| **Co testuje** | checkout/index.html - loadOffer() |
| **Dane wejsciowe** | URL: /checkout?offer=UUID |
| **Oczekiwany wynik** | Wyswietlona nazwa, cena, opis oferty |
| **Priorytet** | CRITICAL |

#### TEST-CHECKOUT-002: Walidacja formularza
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Walidacja pol email, telefon, zgody |
| **Co testuje** | validateForm() |
| **Dane wejsciowe** | Pusty formularz |
| **Oczekiwany wynik** | Bledy walidacji, brak submita |
| **Priorytet** | HIGH |

#### TEST-CHECKOUT-003: Tworzenie zamowienia
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Submit tworzy rekord w orders |
| **Co testuje** | handleSubmit() -> INSERT orders |
| **Dane wejsciowe** | Poprawny formularz |
| **Oczekiwany wynik** | Nowy rekord w orders ze statusem 'pending' |
| **Priorytet** | CRITICAL |

#### TEST-CHECKOUT-004: Kod rabatowy
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Aplikowanie kodu rabatowego |
| **Co testuje** | validateDiscountCode() -> RPC |
| **Dane wejsciowe** | Poprawny kod rabatowy |
| **Oczekiwany wynik** | Cena obnizena, discount_amount zapisane |
| **Priorytet** | HIGH |

#### TEST-CHECKOUT-005: Custom payment (bez workflow)
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Jednorazowa platnosc bez oferty |
| **Co testuje** | Custom payment mode (?amount=&description=) |
| **Dane wejsciowe** | URL: /checkout?amount=500&description=Konsultacja |
| **Oczekiwany wynik** | Order z skip_workflow=true |
| **Priorytet** | MEDIUM |

---

## 4. Testy Integracyjne E2E

### 4.1 Pelny flow: Lead -> Payment

#### TEST-E2E-001: Kompletny flow zakupu
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Od leada do oplaconego zamowienia |
| **Co testuje** | Caly flow integracji |
| **Kroki** | 1. Utworz lead, 2. Utworz client_offer, 3. Otworz oferte, 4. Przejdz checkout, 5. Symuluj webhook |
| **Oczekiwany wynik** | Order.status = 'paid', workflow utworzony |
| **Priorytet** | CRITICAL |

```typescript
// tests/e2e/full-purchase-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete purchase flow', async ({ page }) => {
  // 1. Create lead via API
  const leadResponse = await page.request.post(`${API_URL}/lead-upsert`, {
    data: { email: 'e2e-test@example.com', name: 'E2E Test' }
  });
  const { lead_id } = await leadResponse.json();

  // 2. Create client_offer (via Supabase admin)
  const clientOffer = await createClientOffer(lead_id, offerId);

  // 3. Open offer page
  await page.goto(`/client-offer?token=${clientOffer.access_token}`);
  await page.fill('#email-input', 'e2e-test@example.com');
  await page.click('#login-btn');

  // 4. Verify offer is displayed
  await expect(page.locator('#offer-name')).toBeVisible();

  // 5. Click checkout button
  await page.click('#checkout-btn');

  // 6. Fill checkout form
  await page.fill('#customer-email', 'e2e-test@example.com');
  await page.fill('#customer-phone', '+48500600700');
  await page.check('#consent-terms');

  // 7. Select BLIK
  await page.click('[data-method="blik"]');
  await page.fill('[data-index="0"]', '1');
  await page.fill('[data-index="1"]', '2');
  await page.fill('[data-index="2"]', '3');
  await page.fill('[data-index="3"]', '4');
  await page.fill('[data-index="4"]', '5');
  await page.fill('[data-index="5"]', '6');

  // 8. Submit (in test mode, mock Tpay response)
  await page.click('#pay-button-desktop');

  // 9. Verify redirect state
  await expect(page.locator('#blik-processing-state')).toBeVisible();

  // 10. Simulate webhook
  await simulateTpayWebhook(orderId, 'TRUE');

  // 11. Verify order status
  const order = await getOrder(orderId);
  expect(order.status).toBe('paid');
});
```

#### TEST-E2E-002: Flow z kodem rabatowym
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Zakup z kodem rabatowym |
| **Co testuje** | Discount code integration |
| **Kroki** | 1. Otworz checkout z ?code=RABAT10, 2. Weryfikuj obnizka ceny, 3. Zaplac |
| **Oczekiwany wynik** | Order.discount_amount > 0, prawidlowa kwota |
| **Priorytet** | HIGH |

#### TEST-E2E-003: Retry po bledzie platnosci
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Ponowna proba platnosci |
| **Co testuje** | /checkout/error -> retry flow |
| **Kroki** | 1. Platnosc nieudana, 2. Przekierowanie na error, 3. Klik retry, 4. Powrot do checkout |
| **Oczekiwany wynik** | Formularz wypelniony danymi z poprzedniego zamowienia |
| **Priorytet** | MEDIUM |

### 4.2 Automatyzacje

#### TEST-E2E-AUTO-001: Trigger automatyzacji po platnosci
| Pole | Wartosc |
|------|---------|
| **Nazwa** | payment_received trigger |
| **Co testuje** | automation-trigger po webhook |
| **Kroki** | 1. Aktywna automatyzacja dla payment_received, 2. Webhook z TRUE, 3. Sprawdz execution |
| **Oczekiwany wynik** | automation_execution utworzony |
| **Priorytet** | HIGH |

---

## 5. Testy RLS Security

### 5.1 Testy bezpieczenstwa tabel

#### TEST-RLS-001: leads - anon blocked
| Pole | Wartosc |
|------|---------|
| **Tabela** | leads |
| **Role** | anon |
| **Operacja** | SELECT/INSERT/UPDATE/DELETE |
| **Oczekiwany wynik** | Wszystkie operacje zablokowane (0 wierszy / blad) |
| **Priorytet** | CRITICAL |

```sql
-- Test script: tests/sql/rls-leads.sql
BEGIN;
SET LOCAL ROLE anon;

-- SELECT should return 0 rows
SELECT count(*) FROM leads; -- Expected: 0

-- INSERT should fail
INSERT INTO leads (email) VALUES ('hacker@evil.com'); -- Expected: ERROR

-- UPDATE should affect 0 rows
UPDATE leads SET name = 'Hacked' WHERE true; -- Expected: 0 rows

-- DELETE should affect 0 rows
DELETE FROM leads WHERE true; -- Expected: 0 rows

ROLLBACK;
```

#### TEST-RLS-002: orders - anon blocked
| Pole | Wartosc |
|------|---------|
| **Tabela** | orders |
| **Role** | anon |
| **Operacja** | SELECT/INSERT/UPDATE/DELETE |
| **Oczekiwany wynik** | Wszystkie operacje zablokowane |
| **Priorytet** | CRITICAL |

#### TEST-RLS-003: client_offers - anon token access
| Pole | Wartosc |
|------|---------|
| **Tabela** | client_offers |
| **Role** | anon |
| **Operacja** | SELECT z WHERE access_token = X |
| **Oczekiwany wynik** | Zwrocony rekord tylko dla podanego tokena |
| **Priorytet** | CRITICAL |

```sql
-- Test script: tests/sql/rls-client-offers.sql
BEGIN;
SET LOCAL ROLE anon;

-- Without token - should return 0
SELECT count(*) FROM client_offers; -- Expected: 0

-- With valid token - should return 1
SELECT count(*) FROM client_offers
WHERE access_token = 'valid-test-token'; -- Expected: 1

-- Cannot INSERT
INSERT INTO client_offers (lead_id, offer_id)
VALUES ('uuid', 'uuid'); -- Expected: ERROR

ROLLBACK;
```

#### TEST-RLS-004: workflow_progress - anon blocked
| Pole | Wartosc |
|------|---------|
| **Tabela** | workflow_progress |
| **Role** | anon |
| **Operacja** | SELECT |
| **Oczekiwany wynik** | 0 wierszy |
| **Priorytet** | HIGH |

#### TEST-RLS-005: Views security_invoker
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Views respektuja RLS |
| **Co testuje** | security_invoker = true na views |
| **Views** | biznes_all_revenues, biznes_pipeline_summary |
| **Oczekiwany wynik** | Anon widzi 0 wierszy |
| **Priorytet** | HIGH |

### 5.2 Macierz RLS

| Tabela | anon SELECT | anon INSERT | auth SELECT | auth ALL |
|--------|-------------|-------------|-------------|----------|
| leads | NO | NO | YES | YES |
| orders | NO | NO* | YES | YES |
| client_offers | TOKEN ONLY | NO | YES | YES |
| offers | YES (active) | NO | YES | YES |
| workflows | NO | NO | YES | YES |
| workflow_progress | NO | NO | YES | YES |
| automation_flows | NO | NO | YES | YES |

*orders: anon moze INSERT przez edge function (service role)

---

## 6. Narzedzia i konfiguracja

### 6.1 Setup srodowiska testowego

```bash
# Instalacja zaleznosci
npm install -D vitest @playwright/test @supabase/supabase-js

# Konfiguracja env
cp .env.example .env.test
# Uzupelnij:
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_ANON_KEY=xxx
# SUPABASE_SERVICE_KEY=xxx (tylko dla testow admin)
```

### 6.2 Struktura folderow testow

```
tests/
├── unit/
│   ├── lead-upsert.test.ts
│   ├── tpay-create-transaction.test.ts
│   └── tpay-webhook.test.ts
├── integration/
│   ├── leads-rls.test.ts
│   ├── offers-access.test.ts
│   └── checkout-flow.test.ts
├── e2e/
│   ├── full-purchase-flow.spec.ts
│   └── automation-trigger.spec.ts
├── sql/
│   ├── rls-leads.sql
│   ├── rls-orders.sql
│   └── rls-client-offers.sql
├── fixtures/
│   ├── test-lead.json
│   └── test-offer.json
└── helpers/
    ├── supabase-client.ts
    └── test-utils.ts
```

### 6.3 Package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:rls": "psql $DATABASE_URL -f tests/sql/rls-all.sql",
    "test:webhooks": "bash scripts/test-webhooks.sh",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:webhooks"
  }
}
```

### 6.4 CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run webhook tests
        run: npm run test:webhooks
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: npm run test:e2e
```

---

## Priorytety implementacji

### Faza 1 - CRITICAL (tydzien 1)
1. TEST-WEBHOOK-005: Webhook dostepny bez JWT
2. TEST-WEBHOOK-001: Platnosc udana
3. TEST-LEAD-001: Tworzenie leada
4. TEST-RLS-001: leads anon blocked
5. TEST-RLS-002: orders anon blocked
6. TEST-OFFER-ACCESS-001: Token access

### Faza 2 - HIGH (tydzien 2)
1. TEST-PAY-001: BLIK transaction
2. TEST-PAY-003: Zamowienie juz oplacone
3. TEST-CHECKOUT-001: Ladowanie oferty
4. TEST-CHECKOUT-003: Tworzenie zamowienia
5. TEST-LEAD-005: Survey completed_at
6. TEST-OFFER-002: Custom price

### Faza 3 - E2E (tydzien 3)
1. TEST-E2E-001: Kompletny flow
2. TEST-E2E-002: Flow z rabatem
3. TEST-E2E-AUTO-001: Automatyzacje

### Faza 4 - MEDIUM (ongoing)
- Pozostale testy walidacji
- Testy edge cases
- Performance testy

---

## Metryki sukcesu

| Metryka | Cel |
|---------|-----|
| Pokrycie CRITICAL testow | 100% |
| Pokrycie HIGH testow | 90% |
| Czas wykonania test suite | < 5 min |
| Flaky tests | 0 |
| Testy RLS | 100% tabel krytycznych |

---

---

## 7. Testy Workflows (Projekty klientow)

### 7.1 Unit testy - Tworzenie workflow

#### TEST-WF-001: Automatyczne tworzenie workflow po platnosci
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Trigger create_workflow_on_payment |
| **Co testuje** | Trigger SQL na orders |
| **Dane wejsciowe** | Order.status zmieniony na 'paid' |
| **Oczekiwany wynik** | Nowy rekord w workflows z danymi klienta |
| **Priorytet** | CRITICAL |

#### TEST-WF-002: Kopiowanie milestones z oferty
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Milestones snapshot z offer.milestones |
| **Co testuje** | Tworzenie workflow_milestones |
| **Dane wejsciowe** | Oferta z 3 milestone'ami |
| **Oczekiwany wynik** | 3 rekordy w workflow_milestones |
| **Priorytet** | HIGH |

#### TEST-WF-003: Generowanie unique_token
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Unikalny token dostepu dla klienta |
| **Co testuje** | DEFAULT encode(gen_random_bytes(16), 'hex') |
| **Dane wejsciowe** | Nowy workflow |
| **Oczekiwany wynik** | 32-znakowy hex token |
| **Priorytet** | CRITICAL |

### 7.2 Integration testy - Dostep klienta

#### TEST-WF-ACCESS-001: Dostep przez token (login.html)
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Wyszukiwanie projektu po emailu |
| **Co testuje** | SELECT workflows WHERE customer_email |
| **Dane wejsciowe** | Email klienta |
| **Oczekiwany wynik** | Lista projektow z tokenami |
| **Priorytet** | HIGH |

#### TEST-WF-ACCESS-002: Ustawianie hasla (RPC)
| Pole | Wartosc |
|------|---------|
| **Nazwa** | set_workflow_client_password RPC |
| **Co testuje** | Bezpieczne ustawianie hasla |
| **Dane wejsciowe** | token + bcrypt hash |
| **Oczekiwany wynik** | client_password_hash zaktualizowany |
| **Priorytet** | HIGH |

#### TEST-WF-ACCESS-003: Reset hasla
| Pole | Wartosc |
|------|---------|
| **Nazwa** | reset_workflow_client_password RPC |
| **Co testuje** | Walidacja reset_token + zmiana hasla |
| **Dane wejsciowe** | token + reset_token + nowy hash |
| **Oczekiwany wynik** | Haslo zmienione, reset_token wyczyszczony |
| **Priorytet** | HIGH |

### 7.3 Unit testy - Zadania i postep

#### TEST-WF-TASK-001: Oznaczanie zadania jako ukonczone
| Pole | Wartosc |
|------|---------|
| **Nazwa** | UPDATE workflow_tasks.completed |
| **Co testuje** | Zmiana statusu zadania |
| **Dane wejsciowe** | task_id, completed=true |
| **Oczekiwany wynik** | completed_at ustawione |
| **Priorytet** | MEDIUM |

#### TEST-WF-TASK-002: Obliczanie progresu
| Pole | Wartosc |
|------|---------|
| **Nazwa** | View workflow_progress |
| **Co testuje** | Kalkulacja % ukonczenia |
| **Dane wejsciowe** | Workflow z 10 taskami, 5 ukonczonych |
| **Oczekiwany wynik** | progress_percent = 50 |
| **Priorytet** | MEDIUM |

---

## 8. Testy Automatyzacji

### 8.1 Unit testy - automation-trigger

#### TEST-AUTO-001: Trigger payment_received
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Wyzwalanie automatyzacji po platnosci |
| **Co testuje** | automation-trigger edge function |
| **Dane wejsciowe** | `{ trigger_type: "payment_received", entity_type: "order", entity_id: UUID }` |
| **Oczekiwany wynik** | Matching automation_flows triggered |
| **Priorytet** | HIGH |

#### TEST-AUTO-002: Trigger wymaga JWT
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Endpoint zabezpieczony JWT |
| **Co testuje** | Deploy BEZ --no-verify-jwt |
| **Dane wejsciowe** | Request bez Authorization |
| **Oczekiwany wynik** | HTTP 401 |
| **Priorytet** | CRITICAL |

### 8.2 Unit testy - automation-executor

#### TEST-AUTO-EXEC-001: Wykonanie kroku send_email
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Wysylka emaila z automatyzacji |
| **Co testuje** | automation-executor -> send-email |
| **Dane wejsciowe** | Step z action_type: "send_email" |
| **Oczekiwany wynik** | Email wyslany, step_execution.status = "completed" |
| **Priorytet** | HIGH |

#### TEST-AUTO-EXEC-002: Delay step
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Opoznienie wykonania |
| **Co testuje** | Step z delay_hours |
| **Dane wejsciowe** | Step z delay_hours: 24 |
| **Oczekiwany wynik** | scheduled_at = teraz + 24h |
| **Priorytet** | MEDIUM |

#### TEST-AUTO-EXEC-003: Warunek if
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Warunki w automatyzacji |
| **Co testuje** | condition evaluation |
| **Dane wejsciowe** | Warunek: order.amount > 1000 |
| **Oczekiwany wynik** | Step wykonany tylko gdy warunek spelniony |
| **Priorytet** | MEDIUM |

---

## 9. Testy Email

### 9.1 Unit testy - send-email

#### TEST-EMAIL-001: Wysylka emaila przez Resend
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Podstawowa wysylka emaila |
| **Co testuje** | send-email edge function |
| **Dane wejsciowe** | `{ to, subject, html, template_id }` |
| **Oczekiwany wynik** | Email wyslany, resend_id zwrocony |
| **Priorytet** | CRITICAL |

#### TEST-EMAIL-002: Templating zmiennych
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Podmiana {{variables}} |
| **Co testuje** | Template variable replacement |
| **Dane wejsciowe** | Template z {{customer_name}}, context z name |
| **Oczekiwany wynik** | Zmienna podmieniona w tresci |
| **Priorytet** | HIGH |

#### TEST-EMAIL-003: Walidacja adresu email
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Odrzucenie niepoprawnego emaila |
| **Co testuje** | Email validation |
| **Dane wejsciowe** | to: "invalid-email" |
| **Oczekiwany wynik** | HTTP 400, blad walidacji |
| **Priorytet** | HIGH |

### 9.2 Unit testy - email-inbound

#### TEST-EMAIL-IN-001: Odbior odpowiedzi od klienta
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Inbound email webhook |
| **Co testuje** | email-inbound edge function |
| **Dane wejsciowe** | Resend inbound webhook payload |
| **Oczekiwany wynik** | email_messages INSERT, lead_id powiazany |
| **Priorytet** | HIGH |

#### TEST-EMAIL-IN-002: Parsowanie reply-to UUID
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Ekstrakcja outreach_send_id z adresu |
| **Co testuje** | Regex na reply+UUID@inbound... |
| **Dane wejsciowe** | to: reply+abc123@inbound.tomekniedzwiecki.pl |
| **Oczekiwany wynik** | outreach_send_id = abc123 |
| **Priorytet** | MEDIUM |

### 9.3 Unit testy - resend-webhook

#### TEST-RESEND-001: Email delivered event
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Tracking dostarczenia |
| **Co testuje** | resend-webhook -> update_email_tracking |
| **Dane wejsciowe** | `{ type: "email.delivered", data: { email_id } }` |
| **Oczekiwany wynik** | email_tracking.delivered_at ustawione |
| **Priorytet** | MEDIUM |

#### TEST-RESEND-002: Email bounced event
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Tracking odbicia |
| **Co testuje** | Bounce handling |
| **Dane wejsciowe** | `{ type: "email.bounced" }` |
| **Oczekiwany wynik** | Status zmieniony, bounce zapisany |
| **Priorytet** | HIGH |

---

## 10. Testy Outreach

### 10.1 Unit testy - outreach-send

#### TEST-OUTREACH-001: Wysylka kampanii
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Dzienna wysylka cold emaili |
| **Co testuje** | outreach-send edge function |
| **Dane wejsciowe** | Aktywna kampania z pending sends |
| **Oczekiwany wynik** | Emaile wyslane, status = 'sent' |
| **Priorytet** | HIGH |

#### TEST-OUTREACH-002: Daily limit
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Respektowanie daily_limit |
| **Co testuje** | Limit wysylek dziennych |
| **Dane wejsciowe** | Kampania z daily_limit: 10, 20 pending |
| **Oczekiwany wynik** | Wyslano dokladnie 10 |
| **Priorytet** | HIGH |

#### TEST-OUTREACH-003: Walidacja emaila
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Pomijanie niepoprawnych emaili |
| **Co testuje** | isValidEmail() filter |
| **Dane wejsciowe** | Kontakt z email: "invalid" |
| **Oczekiwany wynik** | Kontakt pominity, nie wyslano |
| **Priorytet** | MEDIUM |

### 10.2 Integration testy - RLS

#### TEST-OUTREACH-RLS-001: Kontakty tylko authenticated
| Pole | Wartosc |
|------|---------|
| **Nazwa** | outreach_contacts RLS |
| **Co testuje** | Anon nie widzi kontaktow |
| **Dane wejsciowe** | SELECT jako anon |
| **Oczekiwany wynik** | 0 wierszy |
| **Priorytet** | HIGH |

---

## 11. Testy tn-todo

### 11.1 Unit testy - Tablice i zadania

#### TEST-TODO-001: Tworzenie tablicy
| Pole | Wartosc |
|------|---------|
| **Nazwa** | INSERT do todo_boards |
| **Co testuje** | Tworzenie nowej tablicy |
| **Dane wejsciowe** | `{ name: "Nowa tablica", created_by: UUID }` |
| **Oczekiwany wynik** | Tablica utworzona z domyslnymi kolumnami |
| **Priorytet** | MEDIUM |

#### TEST-TODO-002: Przenoszenie zadania
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Drag & drop zadania |
| **Co testuje** | UPDATE todo_tasks.column_id, position |
| **Dane wejsciowe** | task_id, nowa kolumna, nowa pozycja |
| **Oczekiwany wynik** | Zadanie przeniesione |
| **Priorytet** | MEDIUM |

#### TEST-TODO-003: Sanityzacja notatek
| Pole | Wartosc |
|------|---------|
| **Nazwa** | XSS protection w notatkach |
| **Co testuje** | sanitizeHtml() |
| **Dane wejsciowe** | Notatka z `<script>alert(1)</script>` |
| **Oczekiwany wynik** | Script usuniety |
| **Priorytet** | HIGH |

### 11.2 Integration testy - RLS

#### TEST-TODO-RLS-001: Prywatne tablice
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Tablice widoczne tylko dla wlasciciela |
| **Co testuje** | RLS na todo_boards |
| **Dane wejsciowe** | is_private = true |
| **Oczekiwany wynik** | Inni uzytkownicy nie widza |
| **Priorytet** | MEDIUM |

---

## 12. Testy tn-biznes

### 12.1 Unit testy - Przychody i koszty

#### TEST-BIZNES-001: Sumowanie przychodow
| Pole | Wartosc |
|------|---------|
| **Nazwa** | View biznes_monthly_summary |
| **Co testuje** | Agregacja przychodow z orders + biznes_revenues |
| **Dane wejsciowe** | Zamowienia i manualne przychody |
| **Oczekiwany wynik** | Poprawna suma miesieczna |
| **Priorytet** | MEDIUM |

#### TEST-BIZNES-002: Realizacja planu
| Pole | Wartosc |
|------|---------|
| **Nazwa** | View biznes_plan_realization |
| **Co testuje** | Procent realizacji celu |
| **Dane wejsciowe** | Plan z target_revenue: 10000, actual: 5000 |
| **Oczekiwany wynik** | revenue_realization_percent = 50 |
| **Priorytet** | MEDIUM |

### 12.2 Security testy

#### TEST-BIZNES-RLS-001: Views z security_invoker
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Views respektuja RLS |
| **Co testuje** | security_invoker = true |
| **Dane wejsciowe** | SELECT jako anon |
| **Oczekiwany wynik** | 0 wierszy (orders RLS blokuje) |
| **Priorytet** | HIGH |

---

## 13. Testy Products

### 13.1 Unit testy

#### TEST-PROD-001: Tworzenie produktu
| Pole | Wartosc |
|------|---------|
| **Nazwa** | INSERT do workflow_products |
| **Co testuje** | Dodawanie produktu do workflow |
| **Dane wejsciowe** | workflow_id, nazwa, opis, gallery |
| **Oczekiwany wynik** | Produkt utworzony |
| **Priorytet** | MEDIUM |

#### TEST-PROD-002: Udostepnianie produktow
| Pole | Wartosc |
|------|---------|
| **Nazwa** | shared_at timestamp |
| **Co testuje** | Oznaczanie produktow jako udostepnione |
| **Dane wejsciowe** | UPDATE shared_at = NOW() |
| **Oczekiwany wynik** | Klient widzi produkty |
| **Priorytet** | MEDIUM |

---

## 14. Testy Branding

### 14.1 Unit testy

#### TEST-BRAND-001: Zapis danych brandingu
| Pole | Wartosc |
|------|---------|
| **Nazwa** | INSERT/UPDATE workflow_branding |
| **Co testuje** | Zapisywanie danych brandingu |
| **Dane wejsciowe** | colors, fonts, logo URL |
| **Oczekiwany wynik** | Dane zapisane |
| **Priorytet** | MEDIUM |

#### TEST-BRAND-002: Udostepnianie brandingu
| Pole | Wartosc |
|------|---------|
| **Nazwa** | shared_at dla brandingu |
| **Co testuje** | Widocznosc dla klienta |
| **Dane wejsciowe** | UPDATE shared_at |
| **Oczekiwany wynik** | Klient widzi branding w projekcie |
| **Priorytet** | MEDIUM |

---

## 15. Testy Reports

### 15.1 Unit testy

#### TEST-REPORT-001: Upload raportu
| Pole | Wartosc |
|------|---------|
| **Nazwa** | INSERT workflow_reports |
| **Co testuje** | Dodawanie raportu |
| **Dane wejsciowe** | workflow_id, type, title, content |
| **Oczekiwany wynik** | Raport utworzony |
| **Priorytet** | MEDIUM |

#### TEST-REPORT-002: Typy raportow
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Rozne typy: image, video, document |
| **Co testuje** | CHECK constraint na type |
| **Dane wejsciowe** | type: "invalid_type" |
| **Oczekiwany wynik** | Blad walidacji |
| **Priorytet** | LOW |

---

## 16. Testy Settings

### 16.1 Unit testy

#### TEST-SETTINGS-001: Odczyt ustawien
| Pole | Wartosc |
|------|---------|
| **Nazwa** | SELECT z settings |
| **Co testuje** | Pobieranie konfiguracji |
| **Dane wejsciowe** | key: "email_from_transactional" |
| **Oczekiwany wynik** | Zwrocona wartosc |
| **Priorytet** | MEDIUM |

#### TEST-SETTINGS-002: Anon moze czytac wybrane
| Pole | Wartosc |
|------|---------|
| **Nazwa** | RLS na settings dla anon |
| **Co testuje** | Policy dla publicznych ustawien |
| **Dane wejsciowe** | SELECT jako anon |
| **Oczekiwany wynik** | Tylko publiczne klucze |
| **Priorytet** | MEDIUM |

---

## 17. Testy Team Members / Auth

### 17.1 Unit testy

#### TEST-AUTH-001: Logowanie
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Supabase Auth signIn |
| **Co testuje** | Logowanie uzytkownika |
| **Dane wejsciowe** | email + haslo |
| **Oczekiwany wynik** | Session utworzona |
| **Priorytet** | CRITICAL |

#### TEST-AUTH-002: Weryfikacja sesji
| Pole | Wartosc |
|------|---------|
| **Nazwa** | getSession() |
| **Co testuje** | Sprawdzenie aktywnej sesji |
| **Dane wejsciowe** | Wazny token |
| **Oczekiwany wynik** | user object |
| **Priorytet** | CRITICAL |

#### TEST-AUTH-003: Wylogowanie
| Pole | Wartosc |
|------|---------|
| **Nazwa** | signOut() |
| **Co testuje** | Zakonczenie sesji |
| **Dane wejsciowe** | Aktywna sesja |
| **Oczekiwany wynik** | Sesja zakonczona |
| **Priorytet** | HIGH |

### 17.2 Integration testy

#### TEST-TEAM-001: Team member powiazany z auth
| Pole | Wartosc |
|------|---------|
| **Nazwa** | team_members.auth_user_id |
| **Co testuje** | Powiazanie z Supabase Auth |
| **Dane wejsciowe** | Zalogowany uzytkownik |
| **Oczekiwany wynik** | Odpowiedni team_member |
| **Priorytet** | HIGH |

---

## 18. Testy Fakturownia

### 18.1 Unit testy

#### TEST-INVOICE-001: Tworzenie faktury
| Pole | Wartosc |
|------|---------|
| **Nazwa** | fakturownia-invoice edge function |
| **Co testuje** | Generowanie faktury przez API |
| **Dane wejsciowe** | order_id |
| **Oczekiwany wynik** | Faktura utworzona w Fakturownia |
| **Priorytet** | HIGH |

#### TEST-INVOICE-002: Bezpieczny URL PDF
| Pole | Wartosc |
|------|---------|
| **Nazwa** | public_token zamiast api_token |
| **Co testuje** | Generowanie linku do PDF |
| **Dane wejsciowe** | invoice_id |
| **Oczekiwany wynik** | URL z public_token |
| **Priorytet** | HIGH |

---

## 19. Testy Password Reset

### 19.1 Unit testy

#### TEST-PWRESET-001: Generowanie tokena
| Pole | Wartosc |
|------|---------|
| **Nazwa** | password-reset edge function |
| **Co testuje** | Tworzenie reset_token |
| **Dane wejsciowe** | unique_token workflow |
| **Oczekiwany wynik** | Email wyslany z linkiem |
| **Priorytet** | HIGH |

#### TEST-PWRESET-002: Rate limiting
| Pole | Wartosc |
|------|---------|
| **Nazwa** | 5 min cooldown |
| **Co testuje** | Ochrona przed spamem |
| **Dane wejsciowe** | 2 requesty w 1 minucie |
| **Oczekiwany wynik** | Drugi request odrzucony |
| **Priorytet** | HIGH |

#### TEST-PWRESET-003: Token expiry
| Pole | Wartosc |
|------|---------|
| **Nazwa** | Token wygasa po 1h |
| **Co testuje** | password_reset_expires |
| **Dane wejsciowe** | Token sprzed 2h |
| **Oczekiwany wynik** | Reset odrzucony |
| **Priorytet** | HIGH |

---

## 20. Testy Discount Codes

### 20.1 Unit testy

#### TEST-DISCOUNT-001: Walidacja kodu
| Pole | Wartosc |
|------|---------|
| **Nazwa** | RPC validate_discount_code |
| **Co testuje** | Sprawdzanie poprawnosci kodu |
| **Dane wejsciowe** | code: "RABAT20" |
| **Oczekiwany wynik** | discount_amount lub discount_percent |
| **Priorytet** | HIGH |

#### TEST-DISCOUNT-002: Kod wygasly
| Pole | Wartosc |
|------|---------|
| **Nazwa** | valid_until w przeszlosci |
| **Co testuje** | Walidacja daty |
| **Dane wejsciowe** | Kod z valid_until = wczoraj |
| **Oczekiwany wynik** | Blad: kod wygasl |
| **Priorytet** | HIGH |

#### TEST-DISCOUNT-003: Limit uzyc
| Pole | Wartosc |
|------|---------|
| **Nazwa** | current_uses >= max_uses |
| **Co testuje** | Limit wykorzystania |
| **Dane wejsciowe** | Kod z max_uses=10, current_uses=10 |
| **Oczekiwany wynik** | Blad: limit wyczerpany |
| **Priorytet** | HIGH |

---

## Podsumowanie wszystkich testow

| Modul | Liczba testow | CRITICAL | HIGH | MEDIUM | LOW |
|-------|---------------|----------|------|--------|-----|
| Leads | 7 | 3 | 3 | 1 | 0 |
| Oferty | 5 | 3 | 1 | 1 | 0 |
| Platnosci | 13 | 4 | 7 | 2 | 0 |
| E2E | 4 | 1 | 2 | 1 | 0 |
| RLS Security | 5 | 3 | 2 | 0 | 0 |
| **Workflows** | 6 | 2 | 3 | 1 | 0 |
| **Automatyzacje** | 5 | 1 | 2 | 2 | 0 |
| **Email** | 6 | 1 | 3 | 2 | 0 |
| **Outreach** | 4 | 0 | 3 | 1 | 0 |
| **tn-todo** | 4 | 0 | 1 | 3 | 0 |
| **tn-biznes** | 3 | 0 | 1 | 2 | 0 |
| **Products** | 2 | 0 | 0 | 2 | 0 |
| **Branding** | 2 | 0 | 0 | 2 | 0 |
| **Reports** | 2 | 0 | 0 | 1 | 1 |
| **Settings** | 2 | 0 | 0 | 2 | 0 |
| **Auth** | 5 | 2 | 2 | 1 | 0 |
| **Fakturownia** | 2 | 0 | 2 | 0 | 0 |
| **Password Reset** | 3 | 0 | 3 | 0 | 0 |
| **Discount Codes** | 3 | 0 | 3 | 0 | 0 |
| **RAZEM** | **83** | **20** | **38** | **24** | **1** |

---

## Kontakt

W razie pytan o testy kontaktuj sie z:
- Dokumentacja: `CLAUDE.md`
- Edge functions: `supabase/functions/`
- RLS policies: `supabase/migrations/`
