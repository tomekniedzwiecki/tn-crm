-- =============================================
-- WF2 — SYNC ZAMÓWIEŃ Z PLATFORMY (pg_cron + pg_net)
-- SSOT algorytmu: R3 sekcja „(d) SYNC ZAMÓWIEŃ". Funkcja: wf2-orders-sync.
-- =============================================
--
-- Co 30 min ściąga zamówienia projektów z platform_shop_id (przez adapter wf2-platform)
-- do wf2_orders (dedup po id = dokładny licznik do 1000) i agreguje do wf2_sales.
-- Funkcja chunkuje (≤10 projektów/run) i ma własny deadline 300 s — cron tylko ją wyzwala.
--
-- AUTH DO EDGE: wf2-orders-sync jest gate'owany nagłówkiem `x-wf2-secret` (env WF2_GEN_SECRET;
-- ta sama wartość, którą przyjmują wf2-platform / wf2-gen). Sekret siedzi w Supabase Vault pod
-- nazwą `wf2_gen_secret` (wzorzec jak `service_role_key` w 20260508_use_vault_for_cron_auth.sql
-- oraz `bud_tools_secret` w 20260716c_radar_cron.sql) — migracja czyta go PO NAZWIE, nigdy
-- literalnie (sekret NIE trafia do repo). Rotacja = jeden UPDATE vault.secrets, bez migracji.
--
-- KRYTYCZNE (pg_net domyślny timeout = 5 s!): job MUSI mieć timeout_milliseconds, inaczej pg_net
-- zerwie połączenie po 5 s i nie zapisze statusu. Ustawiamy 350000 (350 s) z zapasem ponad
-- wewnętrzny deadline funkcji (300 s) — spójnie z bud-radar / bud-season.
--
-- WYMAGANE PRZED APLIKACJĄ (raz, spoza migracji — sekret NIE trafia do repo):
--   Wartość = WF2_GEN_SECRET (edge secret; identyczna jak w tn-crm/.env klucz WF2_GEN_SECRET).
--     SELECT vault.create_secret('<WF2_GEN_SECRET>', 'wf2_gen_secret',
--            'Secret x-wf2-secret dla cronów wf2-* (wf2-orders-sync)');
--   Jeśli sekret już istnieje:
--     UPDATE vault.secrets SET secret = '<WF2_GEN_SECRET>' WHERE name = 'wf2_gen_secret';
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
-- JOB: wf2-orders-sync — co 30 min (chunk 10 projektów; reszta w kolejnym runie gdy partial)
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('wf2-orders-sync');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule wf2-orders-sync'; END $$;

SELECT cron.schedule(
    'wf2-orders-sync',
    '*/30 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-orders-sync',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-wf2-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'wf2_gen_secret')
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- =============================================
-- Weryfikacja:
--   SELECT jobname, schedule FROM cron.job WHERE jobname = 'wf2-orders-sync';
--   SELECT jobname, status, return_message, start_time
--     FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- Rotacja sekretu:
--   UPDATE vault.secrets SET secret = '<nowy>' WHERE name = 'wf2_gen_secret';
-- =============================================
