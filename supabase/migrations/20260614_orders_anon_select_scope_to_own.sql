-- 2026-06-14 — KRYTYCZNE: zamkniecie enumeracji zamowien przez anon.
-- "Anyone can view orders by id" mialo anon SELECT USING(true) -> kazdy z
-- publishable key (jawny w kazdej stronie) jednym `GET /rest/v1/orders` pobieral
-- wszystkie 325 zamowien: imiona, e-maile, adresy, telefony, kwoty. Wyciek RODO.
-- Zawezamy do WLASNEGO zamowienia, identyfikowanego naglowkiem zadania
-- (PostgREST request.headers), ktory wysyla front (KROK 1, juz wdrozony):
--   x-order-id       -> checkout/success/error/retry + poll statusu (po id)
--   x-customer-email -> checkout: dedup pending + insert().select() read-back
--   x-offer-token    -> client-offer-v2: zamowienia leada danej oferty (po lead_id)
-- Bez pasujacego naglowka -> 0 wierszy (koniec enumeracji). Admin czyta przez
-- osobna polityke "Team members can view all orders". INSERT (status='pending')
-- i UPDATE pending bez zmian -> checkout tworzy/aktualizuje zamowienia normalnie.
-- Zweryfikowane (curl anon): GET /orders bez naglowka = []; z x-order-id = 1;
-- z x-customer-email = wlasne; insert+read-back z x-customer-email = OK.
ALTER POLICY "Anyone can view orders by id" ON public.orders
  USING (
    id::text = (current_setting('request.headers', true)::json->>'x-order-id')
    OR customer_email = (current_setting('request.headers', true)::json->>'x-customer-email')
    OR EXISTS (
      SELECT 1 FROM public.client_offers co
      WHERE co.lead_id = orders.lead_id
        AND co.unique_token = (current_setting('request.headers', true)::json->>'x-offer-token')
    )
  );

-- ODLOZONE (mniejsza waga, ta sama klasa anon-enumeracji): payment_schedules,
-- payment_installments, discount_codes (anon czyta po kodzie -> walidacja),
-- offers (katalog). Wymagaja analogicznych naglowkow/RPC per sciezka.
