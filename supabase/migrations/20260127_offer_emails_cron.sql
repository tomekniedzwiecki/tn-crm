-- =============================================
-- OFFER EMAILS CRON JOB - INSTRUKCJA
-- =============================================
--
-- Flow mailowe po wygenerowaniu oferty.
-- Cron uruchamia się co 5 minut i przetwarza zaplanowane emaile.
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

-- Job: Przetwarzanie scheduled_emails co 5 minut (Europe/Warsaw)
/*
SELECT cron.schedule_in_time_zone(
    'offer-emails-cron',
    '*/5 * * * *',
    'Europe/Warsaw',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/offer-emails-cron',
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
-- SELECT cron.unschedule('offer-emails-cron');

-- =============================================
-- Test ręczny (bez crona):
-- =============================================
-- SELECT net.http_post(
--     url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/offer-emails-cron',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{}'::jsonb
-- );

-- =============================================
-- Sprawdzenie zaplanowanych emaili:
-- =============================================
-- SELECT id, lead_id, email_type, scheduled_for, sent_at, cancelled_at
-- FROM scheduled_emails
-- ORDER BY scheduled_for DESC
-- LIMIT 20;

-- =============================================
-- Ręczne oznaczenie jako wysłane (do testów):
-- =============================================
-- UPDATE scheduled_emails SET sent_at = NOW() WHERE id = 'uuid-here';
