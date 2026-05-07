-- Cron dla manus-check-pending: pobiera wyniki pending Manus tasków
-- (raportów reklamowych z manus-auto-reports) i wywołuje manus-get-result.
--
-- Bez tego: cron manus-auto-reports tworzy taski o 4:00 UTC, ale nikt nie
-- pobiera wyników → pending taski wiszą, raporty nie są zapisywane do
-- workflow_ad_reports, email do klienta nie idzie, Etap 5 nie odblokowuje się.
--
-- Co 5 minut wystarcza: Manus zwykle kończy task w 1-5 min, opóźnienie
-- emaila max ~10 min od wygenerowania.

DO $$
BEGIN
    PERFORM cron.unschedule('manus-check-pending');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Cron job manus-check-pending not found, skipping';
END $$;

SELECT cron.schedule(
    'manus-check-pending',
    '*/5 * * * *',  -- Co 5 minut
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/manus-check-pending',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);
