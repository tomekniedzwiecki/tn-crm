-- 20260723f: RPC offer_deposit_paid — karta oferty /p/ (v2) i /o/ (v3) sprawdzała
-- opłaconą rezerwację bezpośrednim SELECT-em na orders, którego RLS blokuje dla anon
-- (puste wyniki bez błędu) — stan „dopłać pozostałość" nigdy się nie włączał i klient
-- po wpłacie 100 zł mógł zapłacić pełne 4900 (incydent 23.07, nadpłata 100 zł).
-- Wąski RPC gated tokenem oferty: zwraca WYŁĄCZNIE boolean, zero danych zamówień.
create or replace function public.offer_deposit_paid(p_offer_token text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.client_offers co
      join public.orders o on o.lead_id = co.lead_id
     where co.unique_token = p_offer_token
       and o.status = 'paid'
       and o.amount in (100, 500)
       and (o.description ilike 'Zadatek%' or o.description ilike 'Rezerwacja%')
  );
$$;

revoke all on function public.offer_deposit_paid(text) from public;
grant execute on function public.offer_deposit_paid(text) to anon, authenticated, service_role;
