-- /stworze: podglad graficzny narzedzia w czacie (marker <projekt> -> spar-image)
-- Migracja JUZ ZAAPLIKOWANA na produkcji przez MCP 2026-06-11 (plik dla historii).
ALTER TABLE public.spar_sessions
  ADD COLUMN IF NOT EXISTS preview_brief jsonb,
  ADD COLUMN IF NOT EXISTS preview_image_url text,
  ADD COLUMN IF NOT EXISTS image_count int NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.spar_sessions.preview_brief IS
  'JSON z markera <projekt>: nazwa, dla_kogo, problem, opis, ekrany[] — input do spar-image.';
COMMENT ON COLUMN public.spar_sessions.preview_image_url IS
  'URL ostatniego wygenerowanego podgladu (storage attachments/spar/...).';
COMMENT ON COLUMN public.spar_sessions.image_count IS
  'Licznik wygenerowanych podgladow (limit 3/sesja egzekwuje spar-image).';
