-- Review fixes 2026-06-13 (zaaplikowane przez MCP):
-- 1) RLS spar_*: SELECT/UPDATE tylko dla team_members (gate admina) — po włączeniu
--    OAuth w sparingu zwykli użytkownicy też są 'authenticated' w tym samym
--    projekcie auth; USING(true) dawałoby im wgląd w cudze sesje/PII.
-- 2) SECURITY DEFINER + SET search_path = public (spar_costs_daily,
--    spar_session_costs, spar_record_image) — hardening schema injection.
-- 3) orders.consent_digital_service + consented_at — strukturalny, datowany
--    dowód zgody konsumenta na wykonanie usługi cyfrowej przed upływem 14 dni
--    (checkout v2 ustawia dla oferty Stworzę).
-- Pełny SQL: patrz historia migracji w Supabase (stworze_security_fixes).

-- UWAGA OPERACYJNA: pozostałe tabele CRM (leads, workflows, settings, ...) mają
-- polityki TO authenticated USING(true) — przed PEŁNYM otwarciem OAuth dla
-- użytkowników Stworzę trzeba je przejrzeć tak samo (albo wydzielić auth
-- użytkowników do osobnego projektu). Zob. docs/stworze/RUNBOOK.md.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS consent_digital_service boolean;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS consented_at timestamptz;

DROP POLICY IF EXISTS spar_sessions_admin_read ON spar_sessions;
CREATE POLICY spar_sessions_admin_read ON spar_sessions FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM team_members));
DROP POLICY IF EXISTS spar_messages_admin_read ON spar_messages;
CREATE POLICY spar_messages_admin_read ON spar_messages FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM team_members));
DROP POLICY IF EXISTS spar_feedback_admin_read ON spar_feedback;
CREATE POLICY spar_feedback_admin_read ON spar_feedback FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM team_members));
DROP POLICY IF EXISTS spar_usage_admin_read ON spar_usage;
CREATE POLICY spar_usage_admin_read ON spar_usage FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM team_members));
DROP POLICY IF EXISTS spar_emails_admin_read ON spar_emails;
CREATE POLICY spar_emails_admin_read ON spar_emails FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM team_members));
DROP POLICY IF EXISTS spar_sessions_admin_update ON spar_sessions;
CREATE POLICY spar_sessions_admin_update ON spar_sessions FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM team_members));
