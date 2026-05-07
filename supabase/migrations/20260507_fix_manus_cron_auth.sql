-- FIX: manus-auto-reports padał codziennie z 13.04.2026 z błędem
-- "invalid input syntax for type json" — użycie current_setting('app.settings.service_role_key', true)
-- które zwraca NULL, a string concat z NULL psuje JSON.
-- Stosujemy ten sam wzorzec co payment-reminder-daily (hardcoded service_role JWT).
-- Przy okazji manus-check-pending dla spójności (działa już, bo edge function ma --no-verify-jwt,
-- ale Bearer null nie jest przyszłościowo bezpieczny gdyby ktoś usunął flag).

DO $$ BEGIN PERFORM cron.unschedule('manus-auto-reports');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping unschedule manus-auto-reports'; END $$;

DO $$ BEGIN PERFORM cron.unschedule('manus-check-pending');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping unschedule manus-check-pending'; END $$;

SELECT cron.schedule(
    'manus-auto-reports',
    '0 4 * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/manus-auto-reports',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bWF2d2t3bmZ1cGhqcWJlbHdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2NDI1NSwiZXhwIjoyMDg0MzQwMjU1fQ.6rohrpE3o8FfWt2mBenJntqcGzPIHAZt3bRuR81Yy1I"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id
    $$
);

SELECT cron.schedule(
    'manus-check-pending',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/manus-check-pending',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bWF2d2t3bmZ1cGhqcWJlbHdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2NDI1NSwiZXhwIjoyMDg0MzQwMjU1fQ.6rohrpE3o8FfWt2mBenJntqcGzPIHAZt3bRuR81Yy1I"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id
    $$
);
