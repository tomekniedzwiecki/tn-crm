-- Biblioteka sklepów — sygnały „radaru trendów USA" (świeżość reklam, wideo, intensywność testów, gem-score).
-- Dodatkowe kolumny na bud_stores. Idempotentne.
ALTER TABLE public.bud_stores ADD COLUMN IF NOT EXISTS gem_score    numeric    DEFAULT 0;   -- ranking dropship-perełki
ALTER TABLE public.bud_stores ADD COLUMN IF NOT EXISTS newest_ad_at timestamptz;            -- najświeższa aktywna reklama (świeżość trendu)
ALTER TABLE public.bud_stores ADD COLUMN IF NOT EXISTS active_ads   integer    DEFAULT 0;   -- liczba aktywnych reklam
ALTER TABLE public.bud_stores ADD COLUMN IF NOT EXISTS video_ratio  integer    DEFAULT 0;   -- % kreacji wideo (0-100)
ALTER TABLE public.bud_stores ADD COLUMN IF NOT EXISTS fresh_ads    integer    DEFAULT 0;   -- reklamy uruchomione w ost. 45 dni
ALTER TABLE public.bud_stores ADD COLUMN IF NOT EXISTS signals      jsonb      DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_bud_stores_gem ON public.bud_stores(gem_score DESC);
