-- Stworzę → produkcja: koszty AI, follow-upy mailowe, telefon/auth, RLS dla
-- panelu admina TN Aplikacje, cron follow-upów. (2026-06-13)

-- ── Koszt każdego wywołania AI (chat / plan / image) ──────────────────
-- cost_usd liczony w edge function przy zapisie (cennik w kodzie funkcji);
-- panel przelicza na PLN wg settings 'usd_pln_rate'
CREATE TABLE IF NOT EXISTS spar_usage (
  id bigserial PRIMARY KEY,
  session_id uuid REFERENCES spar_sessions(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('chat','plan','image')),
  model text,
  input_tokens int NOT NULL DEFAULT 0,
  cached_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  images int NOT NULL DEFAULT 0,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spar_usage_session ON spar_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_spar_usage_created ON spar_usage(created_at);

-- ── Follow-upy mailowe: max 1 mail danego rodzaju per sesja ───────────
CREATE TABLE IF NOT EXISTS spar_emails (
  id bigserial PRIMARY KEY,
  session_id uuid REFERENCES spar_sessions(id) ON DELETE CASCADE,
  kind text NOT NULL,
  email text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  resend_id text,
  UNIQUE(session_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_spar_emails_session ON spar_emails(session_id);

-- ── spar_sessions: telefon, auth, płatność, ostatnia aktywność ────────
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS auth_provider text;
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS last_user_at timestamptz;
-- sesje testowe (Tomek/dev) — wykluczane z metryk, pipeline'u i follow-upów
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
UPDATE spar_sessions SET last_user_at = updated_at WHERE last_user_at IS NULL;
UPDATE spar_sessions SET is_test = true
WHERE email LIKE '%@test.local' OR email = 'tomekniedzwiecki@gmail.com'
   OR id::text LIKE 'dddddddd-%' OR id::text LIKE '99999999-%';
CREATE INDEX IF NOT EXISTS idx_spar_sessions_created ON spar_sessions(created_at);

-- ── RLS: panel admina (authenticated) czyta; pisze wyłącznie service_role ──
ALTER TABLE spar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spar_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE spar_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE spar_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE spar_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spar_sessions_admin_read ON spar_sessions;
CREATE POLICY spar_sessions_admin_read ON spar_sessions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS spar_messages_admin_read ON spar_messages;
CREATE POLICY spar_messages_admin_read ON spar_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS spar_feedback_admin_read ON spar_feedback;
CREATE POLICY spar_feedback_admin_read ON spar_feedback FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS spar_usage_admin_read ON spar_usage;
CREATE POLICY spar_usage_admin_read ON spar_usage FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS spar_emails_admin_read ON spar_emails;
CREATE POLICY spar_emails_admin_read ON spar_emails FOR SELECT TO authenticated USING (true);

-- Panel może przestawiać WYŁĄCZNIE flagę is_test (grant kolumnowy)
DROP POLICY IF EXISTS spar_sessions_admin_update ON spar_sessions;
CREATE POLICY spar_sessions_admin_update ON spar_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
REVOKE UPDATE ON spar_sessions FROM authenticated;
GRANT UPDATE (is_test) ON spar_sessions TO authenticated;

-- ── Kurs USD→PLN do przeliczeń kosztów w panelu ───────────────────────
INSERT INTO settings (key, value)
VALUES ('usd_pln_rate', '4.00')
ON CONFLICT (key) DO NOTHING;

-- ── Agregacja kosztów per dzień (panel: wykres + zakres dat) ──────────
CREATE OR REPLACE FUNCTION spar_costs_daily(p_from date, p_to date)
RETURNS TABLE(day date, kind text, cost_usd numeric, calls bigint)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT (created_at AT TIME ZONE 'Europe/Warsaw')::date AS day,
         kind,
         SUM(cost_usd) AS cost_usd,
         COUNT(*) AS calls
  FROM spar_usage
  WHERE (created_at AT TIME ZONE 'Europe/Warsaw')::date BETWEEN p_from AND p_to
  GROUP BY 1, 2
  ORDER BY 1;
$$;
REVOKE ALL ON FUNCTION spar_costs_daily(date, date) FROM anon, public;
GRANT EXECUTE ON FUNCTION spar_costs_daily(date, date) TO authenticated;

-- ── Cron follow-upów (co 30 min; funkcja idempotentna przez UNIQUE) ───
-- Zaaplikowane 2026-06-13 przez MCP (jobid 22):
-- SELECT cron.schedule('spar-followups-cron', '*/30 * * * *', $cron$
--   SELECT net.http_post(
--     url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/spar-followups',
--     headers := '{"Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb);
--   $cron$);
