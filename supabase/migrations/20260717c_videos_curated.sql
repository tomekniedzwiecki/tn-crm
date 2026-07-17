-- Kuracja wideo TikToka (mirror gallery_curated) — inwentarz kafli sekcji WIDEO.
-- Vision-gate po POSTERZE (on-product w obie strony), ranking plays→eng-rate→dywersyfikacja,
-- sekcja buduje kafle WYŁĄCZNIE z keep:true. Kształt:
--   {source_ok, product_id, curated_at, items:[{url, author, plays, likes, cover_src, typ,
--    werdykt, keep, kolejnosc, poster_hosted, mp4_hosted, alt_pl, powod}]}
-- Plan: docs/zbuduje/STANDARD-LANDING-SKLEPY.md (sekcja 3 WIDEO, 5 pipeline, 7c).

alter table public.bud_tt_products add column if not exists videos_curated jsonb;

comment on column public.bud_tt_products.videos_curated is
  'Kuracja wideo TikToka (mirror gallery_curated): items keep:true = kafle sekcji WIDEO; poster/mp4 rehostowane do bud-assets/<slug>/tt/. SSOT: docs/zbuduje/STANDARD-LANDING-SKLEPY.md';
