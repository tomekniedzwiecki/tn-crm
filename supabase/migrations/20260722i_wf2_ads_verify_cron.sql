-- =============================================
-- WF2 — WERYFIKATOR ŚRODOWISKA REKLAMOWEGO (pg_cron + pg_net)
-- SSOT: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md (sekcja „WERYFIKATOR wf2-ads-verify").
-- Funkcja: wf2-ads-verify (action:'sweep'). Wzorzec 1:1 z 20260718b_wf2_orders_cron.sql.
-- =============================================
--
-- Raz dziennie (06:40 PL) odpytuje konta reklamowe projektów (meta_ad_account_id NOT NULL)
-- przez Graph API (partner access BM Tomka) i auto-odhacza w checklistcie to, czego Leadsie
-- NIE potwierdza (waluta/strefa, środki/limit wydatków, strona przypięta), a rozjazd
-- waluty/strefy zgłasza notą „⚠️ AUTOMAT: środowisko …". Funkcja ma własny deadline 300 s.
--
-- BEZ WF2_META_TOKEN funkcja zwraca 200 {skipped:'no_token'} — cron jest cichy, nie failuje
-- (fail-closed do czasu dodania system-user tokenu partner access BM).
--
-- AUTH DO EDGE: gate nagłówkiem `x-wf2-secret` (env WF2_GEN_SECRET) — ten sam sekret co
-- wf2-orders-sync / wf2-platform / wf2-gen. Sekret siedzi w Supabase Vault pod nazwą
-- `wf2_gen_secret` (patrz 20260718b_wf2_orders_cron.sql / 20260508_use_vault_for_cron_auth.sql);
-- migracja czyta go PO NAZWIE, nigdy literalnie (sekret NIE trafia do repo). Rotacja = jeden
-- UPDATE vault.secrets, bez migracji.
--
-- KRYTYCZNE (pg_net domyślny timeout = 5 s!): job MUSI mieć timeout_milliseconds, inaczej pg_net
-- zerwie połączenie po 5 s i nie zapisze statusu. Ustawiamy 350000 (350 s) z zapasem ponad
-- wewnętrzny deadline funkcji (300 s) — spójnie z wf2-orders-sync / bud-radar / bud-season.
--
-- 4:40 UTC = 6:40 czasu letniego PL (pg_cron tej instancji nie ma schedule_in_time_zone);
-- 20 min po wf2-ads-sync (4:20 UTC) — najpierw sync wyników, potem weryfikacja środowiska.
-- =============================================

-- Sanity: sekret musi istnieć i być niepusty (inaczej cron dostanie 403 z funkcji).
DO $$
DECLARE v_secret text;
BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets WHERE name = 'wf2_gen_secret';
    IF v_secret IS NULL OR length(v_secret) < 16 THEN
        RAISE EXCEPTION 'Vault secret "wf2_gen_secret" missing/too short. '
                        'Run vault.create_secret(<WF2_GEN_SECRET>, ''wf2_gen_secret'', ...) first.';
    END IF;
END $$;

-- =============================================
-- JOB: wf2-ads-verify — raz dziennie 04:40 UTC (06:40 PL); action:'sweep'
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('wf2-ads-verify');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule wf2-ads-verify'; END $$;

SELECT cron.schedule(
    'wf2-ads-verify',
    '40 4 * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-ads-verify',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-wf2-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'wf2_gen_secret')
        ),
        body := '{"action":"sweep"}'::jsonb,
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- =============================================
-- Weryfikacja:
--   SELECT jobname, schedule FROM cron.job WHERE jobname = 'wf2-ads-verify';
--   SELECT jobname, status, return_message, start_time
--     FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- Rotacja sekretu:
--   UPDATE vault.secrets SET secret = '<nowy>' WHERE name = 'wf2_gen_secret';
-- =============================================
