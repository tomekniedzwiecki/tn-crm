-- CRON: wf2-ads-sync-daily — ZAPLANOWANY 18.07 przez MCP (jobid 39).
-- Dzienny sync wyników Meta (campaign-level dla P&L + ad-level dla pętli wyników kreacji)
-- + health-scan kont klientów. Funkcja zwraca {skipped} dopóki sekret WF2_META_TOKEN
-- (system-user token, partner access BM) nie zostanie dodany — cron jest cichy, nie failuje.
-- 4:20 UTC = 6:20 czasu letniego PL (pg_cron tej instancji nie ma schedule_in_time_zone).
-- Zapis wykonany (dokumentacja — NIE uruchamiać ponownie, cron już istnieje):
/*
SELECT cron.schedule(
  'wf2-ads-sync-daily',
  '20 4 * * *',
  $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-ads-sync',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-wf2-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'wf2_gen_secret')
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 350000   -- pg_net default 5 s zabija edge! (pamięć)
    ) AS request_id
  $$
);
*/
