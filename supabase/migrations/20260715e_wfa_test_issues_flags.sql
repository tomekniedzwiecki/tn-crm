-- ============================================================================
-- WFA — moduł „Testy klienta": kolumna flags na zgłoszeniach (U7 „mózg" spowiednika).
-- Koncept: docs/stworze/MODUL-TESTY-KLIENTA.md (sekcja „Mózg spowiednika — konstruktywny sceptycyzm").
--
-- Konstruktywny sceptycyzm: gdy AI podważy pomysł klienta (sprzeczny z decyzją / poza
-- zakresem v1 / przekombinowany), a klient PODTRZYMA — zgłoszenie zapisuje się z adnotacją
-- w flags.ai_pushback (zwięzły argument AI + odpowiedź klienta). Decyzja ZAWSZE = Tomek.
-- flags.poza_v1 = true → propozycja wykracza poza zakres wersji 1 (rozwój aplikacji).
--
-- Zero zmian struktur/UI poza tą jedną kolumną jsonb (default '{}').
-- ============================================================================

ALTER TABLE public.wfa_test_issues
  ADD COLUMN IF NOT EXISTS flags jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.wfa_test_issues.flags IS
  'WFA Testy klienta: adnotacje AI. ai_pushback = zastrzezenie AI + odpowiedz klienta (gdy AI podwazyl pomysl, a klient podtrzymal); poza_v1 = propozycja poza zakresem wersji 1 (rozwoj). Decyzja zawsze po stronie Tomka.';
