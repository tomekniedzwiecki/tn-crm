-- Paywall rezerwacji + stempel karty <makieta>: twarde fakty dla bloku [STAN SESJI]
-- w spar-chat (mózg wie, że lead był o krok od płatności) i dla followupów (re-close/rescue).
ALTER TABLE spar_sessions
  ADD COLUMN IF NOT EXISTS paywall_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS paywall_abandoned_at timestamptz,
  ADD COLUMN IF NOT EXISTS makieta_last_at timestamptz;
