-- SEZONOWOŚĆ produktów radaru (decyzja Tomka 2026-07-16: nie sprzedawać po sezonie)
-- + img_hash (obrazkowy dedup po packshotach TikTok Shop, phash 64-bit).
-- season_type: 'all_year' | 'seasonal'. sell_from/sell_to: 'MM-DD' = OKNO SPRZEDAŻOWE
-- (start ~4-6 tyg. przed sezonem, koniec ~2-3 tyg. przed końcem; wrap-around dozwolony).
-- Karuzela /sklep (bud-tt-featured) filtruje seasonal poza oknem NA ŻYWO z daty.
-- APPLIED 2026-07-16 przez MCP — plik dla spójności repo.
alter table bud_tt_products add column if not exists season_type text;
alter table bud_tt_products add column if not exists season_label text;
alter table bud_tt_products add column if not exists sell_from text;
alter table bud_tt_products add column if not exists sell_to text;
alter table bud_tt_products add column if not exists img_hash jsonb;

alter table workflow_products add column if not exists season_label text;
alter table workflow_products add column if not exists sell_from text;
alter table workflow_products add column if not exists sell_to text;
