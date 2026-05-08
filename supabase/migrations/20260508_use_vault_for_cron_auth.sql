-- =============================================
-- Vault-based service_role JWT for cron jobs
-- =============================================
--
-- Zastępuje hardcoded JWT w cron jobs przez Supabase Vault.
-- Token siedzi w `vault.secrets` (zaszyfrowany) i jest pobierany
-- przy każdym odpaleniu joba — rotacja = jeden UPDATE, bez migracji.
--
-- Joby objęte: manus-auto-reports, manus-check-pending, payment-reminder-daily.
--
-- =============================================
-- WYMAGANE PRZED ZAAPLIKOWANIEM
-- =============================================
-- W SQL Editor wykonaj (raz, po rotacji service_role w Dashboard):
--
--   SELECT vault.create_secret(
--     '<NOWY_SERVICE_ROLE_JWT>',
--     'service_role_key',
--     'Service role JWT for internal cron jobs (manus + payment-reminder)'
--   );
--
-- Jeśli sekret już istnieje (np. powtórna aplikacja migracji), zamiast tego:
--
--   UPDATE vault.secrets
--   SET secret = '<NOWY_SERVICE_ROLE_JWT>'
--   WHERE name = 'service_role_key';
--
-- =============================================

-- Sanity check: sekret musi istnieć i być niepusty.
DO $$
DECLARE
    v_secret text;
BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'service_role_key';

    IF v_secret IS NULL OR length(v_secret) < 30 THEN
        RAISE EXCEPTION 'Vault secret "service_role_key" missing or too short. '
                        'Run vault.create_secret(<key>, ''service_role_key'', ...) first.';
    END IF;
END $$;

-- =============================================
-- 1. manus-auto-reports — codziennie 4:00 UTC
-- =============================================
DO $$ BEGIN
    PERFORM cron.unschedule('manus-auto-reports');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping unschedule manus-auto-reports';
END $$;

SELECT cron.schedule(
    'manus-auto-reports',
    '0 4 * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/manus-auto-reports',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (
                SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'
            )
        ),
        body := '{}'::jsonb
    ) AS request_id
    $$
);

-- =============================================
-- 2. manus-check-pending — co 5 min
-- =============================================
DO $$ BEGIN
    PERFORM cron.unschedule('manus-check-pending');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping unschedule manus-check-pending';
END $$;

SELECT cron.schedule(
    'manus-check-pending',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/manus-check-pending',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (
                SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'
            )
        ),
        body := '{}'::jsonb
    ) AS request_id
    $$
);

-- =============================================
-- 3. payment-reminder-daily — codziennie 7:00 UTC (= 9:00 CEST / 8:00 CET)
-- =============================================
-- Uwaga: pg_cron w Supabase nie ma cron.schedule_in_time_zone, więc UTC.
-- 7:00 UTC = 9:00 Europe/Warsaw latem (CEST), 8:00 zimą (CET).
-- Drift DST akceptowalny dla powiadomień o ratach.
DO $$ BEGIN
    PERFORM cron.unschedule('payment-reminder-daily');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping unschedule payment-reminder-daily';
END $$;

SELECT cron.schedule(
    'payment-reminder-daily',
    '0 7 * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/payment-reminder-cron',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (
                SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'
            )
        ),
        body := '{}'::jsonb
    ) AS request_id
    $$
);

-- =============================================
-- Po aplikacji zweryfikuj:
--   SELECT jobname, schedule FROM cron.job
--   WHERE jobname IN ('manus-auto-reports','manus-check-pending','payment-reminder-daily');
--
-- Aby sprawdzić, czy odpalenia nie zwracają 401:
--   SELECT jobname, status, return_message, start_time
--   FROM cron.job_run_details
--   ORDER BY start_time DESC LIMIT 20;
--
-- Przyszła rotacja service_role:
--   1. Klik "Reset service_role secret" w Dashboard
--   2. UPDATE vault.secrets SET secret = '<nowy>' WHERE name = 'service_role_key';
--   3. Gotowe — żadnej migracji.
-- =============================================
