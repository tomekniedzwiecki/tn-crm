-- =============================================
-- Payment Reminder Cron - Przypomnienia o płatnościach
-- =============================================
--
-- KROK 1: Upewnij się że pg_cron i pg_net są włączone
-- Dashboard > Database > Extensions > pg_cron, pg_net
--
-- KROK 2: Uruchom poniższy SQL w SQL Editor
-- Zamień YOUR_SERVICE_ROLE_KEY na prawdziwy klucz
--
-- =============================================

-- Job: Przypomnienia o ratach codziennie o 9:00 (Europe/Warsaw)
-- Wysyła maile: 3 dni przed, w dniu terminu, 3 dni po, 7 dni po

/*
SELECT cron.schedule_in_time_zone(
    'payment-reminder-daily',
    '0 9 * * *',
    'Europe/Warsaw',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/payment-reminder-cron',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id
    $$
);
*/

-- =============================================
-- Usuwanie joba (jeśli trzeba zmienić):
-- SELECT cron.unschedule('payment-reminder-daily');
-- =============================================

-- =============================================
-- Sprawdzenie aktywnych jobów:
-- SELECT * FROM cron.job;
-- =============================================

-- =============================================
-- Sprawdzenie historii wykonań:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- =============================================
