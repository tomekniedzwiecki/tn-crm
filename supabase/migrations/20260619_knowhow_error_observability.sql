-- Obserwowalność ekstrakcji know-how: gdy tłowa ekstrakcja dossier albo generacja
-- handoff packu padnie (HTTP po retry, pusta odpowiedź, błąd insertu), zostawiamy
-- trwały ślad — inaczej Tomek dostaje chudą/pustą Bazę wiedzy bez żadnego sygnału.
-- Wzór jak spar_sessions.lead_error (queryable alert). Udane przebiegi czyszczą błąd.
ALTER TABLE spar_knowhow_summary
  ADD COLUMN IF NOT EXISTS extract_error    text,
  ADD COLUMN IF NOT EXISTS extract_error_at timestamptz,
  ADD COLUMN IF NOT EXISTS handoff_error    text,
  ADD COLUMN IF NOT EXISTS handoff_error_at timestamptz;

COMMENT ON COLUMN spar_knowhow_summary.extract_error IS
  'Ostatni błąd tłowej ekstrakcji know-how (HTTP/insert/wyjątek); czyszczony przy udanym przebiegu.';
COMMENT ON COLUMN spar_knowhow_summary.handoff_error IS
  'Ostatni błąd generacji handoff packu (HTTP/pusta odpowiedź/wyjątek); czyszczony przy udanej generacji.';
