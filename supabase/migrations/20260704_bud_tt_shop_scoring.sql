-- TikTok Shop snapshot + scoring produktu (panel /trendy).
-- tt_shop: dane z /v1/tiktok/product (sold_count, cena rynkowa, stan, ocena sklepu, opinie) —
--   pobierane TYLKO dla zatwierdzonych produktów z shop_url (req Tomka 2026-07-04).
-- product_score: 0–100, zbalansowany (sprzedaż 40 / narzut 25 / heat 20 / ocena 10 / świeżość 5).
-- score_meta: rozbicie znormalizowanych składowych + narzut ×, flaga partial (brak danych Shop).
alter table bud_tt_products add column if not exists tt_shop jsonb;
alter table bud_tt_products add column if not exists product_score numeric;
alter table bud_tt_products add column if not exists score_meta jsonb;
