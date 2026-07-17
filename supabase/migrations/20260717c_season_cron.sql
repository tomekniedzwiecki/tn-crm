-- =============================================
-- SEZONOWOŚĆ v2 — automatyzacja cronem (pg_cron + pg_net)
-- SSOT: docs/zbuduje/SEZONOWOSC.md (sekcja „Harmonogram").
-- =============================================
--
-- Dzienne zadania taniej pielęgnacji sezonowości:
--   1. bud-season-calendar — 05:30 UTC: raport granic okien (kończące/wracające) + liczniki panelu.
--   2. bud-season-verify   — 05:45 UTC: druga opinia GPT dla seasonal !verified (limit 30/dzień).
--
-- AUTH DO EDGE: funkcje bud-* są admin-gated nagłówkiem `x-tools-secret` (env BUD_TOOLS_SECRET;
-- patrz _shared/bud-owner.ts → adminGate). Sekret siedzi w Supabase Vault pod nazwą
-- `bud_tools_secret` — czytamy go PO NAZWIE, nigdy literalnie (rotacja = jeden UPDATE vault.secrets).
--
-- KRYTYCZNE (pg_net domyślny timeout = 5s!): KAŻDY job MUSI mieć timeout_milliseconds, inaczej
-- pg_net zerwie połączenie po 5s. Ustawiamy 350000 (350s) z zapasem (verify robi N calli GPT).
--
-- WYMAGANE PRZED APLIKACJĄ (raz, spoza migracji): vault.create_secret(<BUD_TOOLS_SECRET>, 'bud_tools_secret', ...)
-- (już istnieje po 20260716c_radar_cron.sql — reużywamy tego samego sekretu).
-- =============================================

-- Sanity: sekret musi istnieć i być niepusty (inaczej crony dostaną 403).
DO $$
DECLARE v_secret text;
BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets WHERE name = 'bud_tools_secret';
    IF v_secret IS NULL OR length(v_secret) < 10 THEN
        RAISE EXCEPTION 'Vault secret "bud_tools_secret" missing/too short. '
                        'Run vault.create_secret(<BUD_TOOLS_SECRET>, ''bud_tools_secret'', ...) first.';
    END IF;
END $$;

-- =============================================
-- JOB 1: bud-season-calendar — codziennie 05:30 UTC (tylko raport, zero akcji destrukcyjnych)
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('bud-season-calendar');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule bud-season-calendar'; END $$;

SELECT cron.schedule(
    'bud-season-calendar',
    '30 5 * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/bud-season-calendar',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-tools-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'bud_tools_secret')
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- =============================================
-- JOB 2: bud-season-verify — codziennie 05:45 UTC ({limit:30} seasonal !verified)
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('bud-season-verify');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule bud-season-verify'; END $$;

SELECT cron.schedule(
    'bud-season-verify',
    '45 5 * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/bud-season-verify',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-tools-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'bud_tools_secret')
        ),
        body := jsonb_build_object('limit', 30),
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- =============================================
-- Weryfikacja:
--   SELECT jobname, schedule FROM cron.job WHERE jobname LIKE 'bud-season%';
--   SELECT jobname, status, return_message, start_time
--     FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- =============================================
