-- Kurowane zdjęcie główne produktu (panel /trendy) — najsilniejsza referencja generatora
-- makiet/reklam; niezależne od jakości ali_snapshot (source='search' bywa INNYM produktem).
alter table bud_tt_products add column if not exists curated_image text;
