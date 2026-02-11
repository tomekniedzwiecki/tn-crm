-- =============================================
-- AUTOMATION EXECUTOR CRON JOB - INSTRUKCJA
-- =============================================
--
-- Cron uruchamiający executor automatyzacji co 2 minuty.
-- Przetwarza oczekujące/zaplanowane automatyzacje.
--
-- WAŻNE: Używamy strefy czasowej Europe/Warsaw!
--
-- =============================================
-- KROK 1: Włącz rozszerzenia w Supabase Dashboard
-- =============================================
-- Idź do: Database > Extensions
-- Włącz: pg_cron i pg_net (jeśli jeszcze nie włączone)
--
-- =============================================
-- KROK 2: Uruchom poniższy SQL w SQL Editor
-- =============================================
-- UWAGA: Zamień YOUR_SERVICE_ROLE_KEY na prawdziwy klucz
-- z Settings > API > service_role (secret)
-- =============================================

-- Job: Wykonywanie automatyzacji co 2 minuty (Europe/Warsaw)
/*
SELECT cron.schedule_in_time_zone(
    'automation-executor-cron',
    '*/2 * * * *',
    'Europe/Warsaw',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/automation-executor',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);
*/

-- =============================================
-- Pomocne komendy:
-- =============================================

-- Zobacz zaplanowane joby:
-- SELECT jobid, jobname, schedule, timezone, active FROM cron.job;

-- Zobacz historię uruchomień:
-- SELECT jobname, status, start_time AT TIME ZONE 'Europe/Warsaw' as start_pl,
--        return_message
-- FROM cron.job_run_details
-- ORDER BY start_time DESC LIMIT 20;

-- Usuń job:
-- SELECT cron.unschedule('automation-executor-cron');

-- =============================================
-- Test ręczny (bez crona):
-- =============================================
-- SELECT net.http_post(
--     url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/automation-executor',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{}'::jsonb
-- );

-- =============================================
-- Sprawdzenie wykonań automatyzacji:
-- =============================================
-- SELECT
--     ae.id,
--     af.name as flow_name,
--     ae.entity_type,
--     ae.status,
--     ae.scheduled_for,
--     ae.created_at
-- FROM automation_executions ae
-- JOIN automation_flows af ON ae.flow_id = af.id
-- ORDER BY ae.created_at DESC
-- LIMIT 20;

-- =============================================
-- Ręczne triggerowanie automatyzacji (test):
-- =============================================
-- SELECT net.http_post(
--     url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/automation-trigger',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{
--         "trigger_type": "stage_completed",
--         "entity_type": "workflow_milestone",
--         "entity_id": "some-milestone-uuid",
--         "context": {
--             "email": "test@example.com",
--             "clientName": "Test User",
--             "milestone_title": "Branding"
--         }
--     }'::jsonb
-- );
