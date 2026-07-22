-- 20260722c_spar_wniosek.sql — dwustopniowy filtr rezerwacji (decyzja Tomka 22.07.2026):
-- po zielonym werdykcie najpierw BEZPŁATNE zgłoszenie projektu (wniosek o współpracę),
-- kwalifikacja (auto przy ocenie „mocny" z badania rynku, inaczej ręcznie Tomek
-- w panelu tn-aplikacje), dopiero po akceptacji karta rezerwacji 500 zł.
-- Audyt 426 rozmów: dominująca obiekcja przy paywallu to kolejność zaufania
-- („nie zapłacę zanim człowiek oceni"), nie kwota.

ALTER TABLE spar_sessions
  ADD COLUMN IF NOT EXISTS wniosek_at timestamptz,
  ADD COLUMN IF NOT EXISTS wniosek_status text,
  ADD COLUMN IF NOT EXISTS wniosek_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS wniosek_auto boolean;

ALTER TABLE spar_sessions
  DROP CONSTRAINT IF EXISTS spar_sessions_wniosek_status_check;
ALTER TABLE spar_sessions
  ADD CONSTRAINT spar_sessions_wniosek_status_check
  CHECK (wniosek_status IS NULL OR wniosek_status IN ('pending', 'accepted', 'rejected'));

-- Panel admina (team_members przez RLS UPDATE) decyduje o wnioskach ręcznie:
GRANT UPDATE (wniosek_status, wniosek_decided_at) ON spar_sessions TO authenticated;
