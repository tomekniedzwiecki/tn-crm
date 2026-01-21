-- =============================================
-- OUTREACH CRON JOBS - INSTRUKCJA
-- =============================================
--
-- WAŻNE: Używamy strefy czasowej Europe/Warsaw, więc godziny
-- automatycznie dostosowują się do czasu letniego/zimowego!
--
-- Harmonogram:
-- - Wysyłka emaili: codziennie o 10:00 czasu polskiego
-- - Follow-upy: codziennie o 13:00 czasu polskiego
--
-- =============================================
-- KROK 1: Włącz rozszerzenia w Supabase Dashboard
-- =============================================
-- Idź do: Database > Extensions
-- Włącz: pg_cron i pg_net
--
-- =============================================
-- KROK 2: Uruchom poniższy SQL w SQL Editor
-- =============================================
-- UWAGA: Zamień YOUR_SERVICE_ROLE_KEY na prawdziwy klucz
-- z Settings > API > service_role (secret)
-- =============================================

-- Job 1: Wysyłka emaili o 10:00 czasu polskiego (Europe/Warsaw)
/*
SELECT cron.schedule_in_time_zone(
    'outreach-send-daily',
    '0 10 * * 1-5',
    'Europe/Warsaw',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/outreach-send',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);
*/

-- Job 2: Follow-upy o 13:00 czasu polskiego (Europe/Warsaw)
/*
SELECT cron.schedule_in_time_zone(
    'outreach-followup-daily',
    '0 13 * * 1-5',
    'Europe/Warsaw',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/outreach-followup',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);
*/

-- =============================================
-- Pomocne komendy:
-- =============================================

-- Zobacz zaplanowane joby (z informacją o timezone):
-- SELECT jobid, jobname, schedule, timezone, active FROM cron.job;

-- Zobacz historię uruchomień:
-- SELECT jobname, status, start_time AT TIME ZONE 'Europe/Warsaw' as start_pl,
--        return_message
-- FROM cron.job_run_details
-- ORDER BY start_time DESC LIMIT 20;

-- Usuń job:
-- SELECT cron.unschedule('outreach-send-daily');
-- SELECT cron.unschedule('outreach-followup-daily');

-- Zmień harmonogram (np. na 11:00):
-- UPDATE cron.job SET schedule = '0 11 * * 1-5' WHERE jobname = 'outreach-send-daily';

-- Wyłącz tymczasowo (bez usuwania):
-- UPDATE cron.job SET active = false WHERE jobname = 'outreach-send-daily';

-- Włącz ponownie:
-- UPDATE cron.job SET active = true WHERE jobname = 'outreach-send-daily';

-- =============================================
-- Test ręczny (bez crona):
-- =============================================
-- SELECT net.http_post(
--     url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/outreach-send',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{}'::jsonb
-- );

-- =============================================
-- Cron schedule cheatsheet:
-- =============================================
-- '0 10 * * 1-5'  = 10:00, pon-pt
-- '0 10 * * *'    = 10:00, codziennie
-- '30 9 * * 1-5'  = 9:30, pon-pt
-- '0 10,15 * * 1-5' = 10:00 i 15:00, pon-pt
