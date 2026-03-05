-- =====================================================
-- Follow-ups System - Kompletna konfiguracja
-- =====================================================

-- Tabela logów wykonania crona
CREATE TABLE IF NOT EXISTS followup_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_generated INTEGER DEFAULT 0,
    total_skipped INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_followup_logs_executed ON followup_execution_logs(executed_at DESC);

-- RLS dla logów
ALTER TABLE followup_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to followup_execution_logs"
    ON followup_execution_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can read followup_execution_logs"
    ON followup_execution_logs FOR SELECT TO authenticated USING (true);

-- Dodaj ustawienia dla follow-upów (jeśli nie istnieją)
INSERT INTO app_settings (key, value)
VALUES
    ('followup_hours', '24'),
    ('followup_seller_name', 'Tomek')
ON CONFLICT (key) DO NOTHING;

-- Dodaj indeks na whatsapp_followups dla szybszego sprawdzania pending
CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_lead_status
    ON whatsapp_followups(lead_id, status);

-- Funkcja do czyszczenia starych logów (starszych niż 30 dni)
CREATE OR REPLACE FUNCTION cleanup_old_followup_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM followup_execution_logs
    WHERE executed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Harmonogram crona dla generowania follow-upów
-- Odkomentuj po przetestowaniu:
-- SELECT cron.schedule('generate-followups-hourly', '0 9-21 * * *',
--     $$SELECT net.http_post(
--         url:='https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/followups-cron',
--         headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
--         body:='{}'::jsonb
--     ) AS request_id$$
-- );

-- Harmonogram czyszczenia starych logów (raz dziennie o 3:00)
-- SELECT cron.schedule('cleanup-followup-logs', '0 3 * * *', 'SELECT cleanup_old_followup_logs()');
