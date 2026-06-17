-- 2026-06-17 — Ręczne nadpisanie etapu w lejku panelu tn-aplikacje
-- Dodaje kategorię „przegrane": etapy 'resigned' (Zrezygnował) i 'lost' (Przegrany),
-- ustawiane RĘCZNIE z karty leada (zakładka Akcje) lub przeciąganiem w tablicy.
-- NULL = etap wyliczany z danych jak dotąd (talk/lead/project/green/paid).
-- Nie wpływa na metryki dashboardu — te liczą wprost z danych (verdict/paid_at),
-- a nie ze stageOf(), więc nadpisanie zmienia tylko widok lejka Leady.
ALTER TABLE public.spar_sessions
  ADD COLUMN IF NOT EXISTS pipeline_override text;

COMMENT ON COLUMN public.spar_sessions.pipeline_override IS
  'Ręczne nadpisanie etapu lejka w panelu tn-aplikacje. NULL = etap wyliczany z danych. Wartości = id etapu (talk/lead/project/green/paid/resigned/lost). Kategoria "przegrane": resigned, lost.';

-- Panel (rola authenticated = zalogowany zespół) zapisuje WYŁĄCZNIE tę kolumnę,
-- spójnie z grantem kolumnowym dla is_test/showcase/hidden_from_feed
-- (REVOKE UPDATE ON spar_sessions FROM authenticated + GRANT per kolumna).
GRANT UPDATE (pipeline_override) ON public.spar_sessions TO authenticated;
