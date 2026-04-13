-- =============================================
-- MANUS ADS FETCH CRON JOB - INSTRUKCJA
-- =============================================
--
-- Cron uruchamiający pobieranie danych Meta Ads co 48 godzin.
-- Tworzy taski Manus dla workflow z ustawionym meta_ad_account_id.
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

-- Job: Pobieranie danych Meta Ads co 48 godzin (2 dni)
-- Uruchamia się o 6:00 rano co drugi dzień
/*
SELECT cron.schedule_in_time_zone(
    'manus-fetch-ads-cron',
    '0 6 */2 * *',
    'Europe/Warsaw',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/manus-fetch-ads-cron',
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
-- WHERE jobname = 'manus-fetch-ads-cron'
-- ORDER BY start_time DESC LIMIT 20;

-- Usuń job:
-- SELECT cron.unschedule('manus-fetch-ads-cron');

-- =============================================
-- Test ręczny (bez crona):
-- =============================================
-- SELECT net.http_post(
--     url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/manus-fetch-ads-cron',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{}'::jsonb
-- );
