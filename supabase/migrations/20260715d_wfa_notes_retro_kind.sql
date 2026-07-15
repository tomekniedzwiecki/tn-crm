-- ============================================================================
-- WFA — rejestr RETRO-AKCEPTACJI w panelu (B12).
-- Rozszerza wfa_notes.kind o wartosc 'retro' — bez nowej tabeli.
-- Notatki kind=retro (status=open) to zmiany wykonane przez sesje fabryki, ktore
-- czekaja na swiadoma akceptacje Tomka (sekcja „Do akceptacji Tomka" w projekt.html).
-- AKCEPTUJE → status=done + adnotacja z data (dopisywana do content).
-- ODRZUC → status=done + adnotacja ODRZUCONE (sesja fabryki cofa zmiane).
-- ============================================================================

ALTER TABLE public.wfa_notes DROP CONSTRAINT IF EXISTS wfa_notes_kind_check;
ALTER TABLE public.wfa_notes
  ADD CONSTRAINT wfa_notes_kind_check
  CHECK (kind IN ('uwaga','decyzja','blokada','retro'));

COMMENT ON COLUMN public.wfa_notes.kind IS
  'Rodzaj wpisu: uwaga/decyzja/blokada (wejscie do paczek promptow) + retro (retro-akceptacja zmian fabryki — sekcja „Do akceptacji Tomka").';
