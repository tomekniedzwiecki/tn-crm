-- RADAR v2 "sold-first": fundament wyboru produktów pod sklepy jednoproduktowe.
-- 1) bud_tt_shop_history — snapshoty sold_count w czasie (tempo sprzedaży = delta/tydzień;
--    żadne API nie daje szeregów czasowych, budujemy własne)
-- 2) bud_tt_products.origin — skąd produkt trafił do radaru (hashtag-skan vs shop-radar)
-- 3) bud_tt_products.ali_mismatch — auto-flaga "chosen_link/snapshot to inny produkt niż nazwa"
--    (detekcja automatyczna, decyzja ręczna w /trendy)
-- 4) workflow_products.bud_key — stabilne łączenie biblioteki CRM z radarem (nazwy się zmieniają,
--    key nie); orders_sold przepisywane z tt_shop przy eksporcie
-- APPLIED 2026-07-16 przez MCP — plik dla spójności repo.

create table if not exists bud_tt_shop_history (
  id bigint generated always as identity primary key,
  key text not null,
  sold_count bigint,
  price_usd numeric,
  stock bigint,
  captured_at timestamptz not null default now()
);
create index if not exists bud_tt_shop_history_key_at on bud_tt_shop_history (key, captured_at desc);
alter table bud_tt_shop_history enable row level security;
-- odczyt jak bud_tt_products (recenzenci); zapis wyłącznie service_role (edge)
create policy bud_tt_shop_history_select on bud_tt_shop_history for select to authenticated
  using (auth.uid() in ('93675a5a-ea02-488c-a6c2-4adf687ea435','7cd1830f-fca0-44d4-a419-7a822f77f919'));

alter table bud_tt_products add column if not exists origin text not null default 'hashtag';
alter table bud_tt_products add column if not exists ali_mismatch boolean;

alter table workflow_products add column if not exists bud_key text;
alter table workflow_products add column if not exists orders_sold_source text; -- 'tiktok_shop' gdy przepisane z radaru
