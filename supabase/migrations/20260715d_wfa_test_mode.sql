-- ============================================================================
-- WFA — moduł „Testy klienta": tryb per projekt (B13 „feedback po starcie").
-- Koncept: docs/stworze/MODUL-TESTY-KLIENTA.md (sekcja „Tryb feedback").
--
-- test_mode zmienia WYŁĄCZNIE system prompt edge wfa-test-chat:
--   'testy'    = spowiednik testów PRZED startem (zgłaszanie bugów) — DOMYŚLNY,
--   'feedback' = zbieranie propozycji rozwoju i problemów od operatora DZIAŁAJĄCEJ
--                aplikacji (severity używana jako kategoria: kosmetyka=pomysł,
--                istotne/krytyczne=problem).
-- Cała reszta (zgłoszenia, panel, statusy, screenshoty, marker <zgloszenie>,
-- walidacja severity) pozostaje WSPÓLNA — zero zmian struktur ani UI.
--
-- Flaga retro: NOT NULL DEFAULT 'testy' → wszystkie istniejące projekty dostają
-- 'testy' (backfill przez DEFAULT). Zmiana na 'feedback' = ręcznie per projekt.
-- ============================================================================

ALTER TABLE public.wfa_projects
  ADD COLUMN IF NOT EXISTS test_mode text NOT NULL DEFAULT 'testy';

ALTER TABLE public.wfa_projects
  DROP CONSTRAINT IF EXISTS wfa_projects_test_mode_check;
ALTER TABLE public.wfa_projects
  ADD CONSTRAINT wfa_projects_test_mode_check CHECK (test_mode IN ('testy','feedback'));

COMMENT ON COLUMN public.wfa_projects.test_mode IS
  'WFA Testy klienta: tryb rozmowy edge wfa-test-chat — testy (bugi przed startem, domyslny) lub feedback (propozycje rozwoju i problemy od operatora dzialajacej aplikacji). Zmienia wylacznie system prompt.';
