-- =============================================
-- RADAR TRENDÓW — automatyzacja cronem (pg_cron + pg_net)
-- =============================================
--
-- Automatyzuje lejek discovery „Zbuduję" (TikTok Shop, persony AWE 25-45):
--   1. bud-radar-scan          — skan sold-first 2×/tydz (pon, czw 06:00 UTC)
--   2. bud-radar-refresh-*     — refresh sprzedaży (sob approved, niedz pending 05:00 UTC)
--   3. bud-radar-dedup         — dedup po skanach (pon, czw 07:00 UTC)
--
-- AUTH DO EDGE: funkcje bud-* są admin-gated nagłówkiem `x-tools-secret`
-- (env BUD_TOOLS_SECRET; patrz _shared/bud-owner.ts → adminGate). Sekret siedzi
-- w Supabase Vault pod nazwą `bud_tools_secret` (wzorzec jak `service_role_key`
-- w 20260508_use_vault_for_cron_auth.sql) — migracja czyta go PO NAZWIE, nigdy
-- literalnie. Rotacja sekretu = jeden UPDATE vault.secrets, bez migracji.
--
-- KRYTYCZNE (pg_net domyślny timeout = 5s!): bud-shop-radar potrafi mielić do
-- ~300s (DEADLINE_MS=300_000 w edge). KAŻDY job MUSI mieć timeout_milliseconds,
-- inaczej pg_net zerwie połączenie po 5s. Ustawiamy 350000 (350s) z zapasem.
--
-- WYMAGANE PRZED APLIKACJĄ (raz, spoza migracji — sekret NIE trafia do repo):
--   SELECT vault.create_secret('<BUD_TOOLS_SECRET>', 'bud_tools_secret', '...');
--   (lub UPDATE vault.secrets ... jeśli już istnieje)
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
-- Tabela rotacji zapytań + zasiew (persony AWE 25-45)
-- =============================================
CREATE TABLE IF NOT EXISTS bud_radar_queries (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    query        text NOT NULL UNIQUE,
    last_used_at timestamptz
);

INSERT INTO bud_radar_queries (query) VALUES
    ('car accessories'),
    ('kitchen gadgets'),
    ('cleaning supplies'),
    ('home organization'),
    ('dog accessories'),
    ('cat accessories'),
    ('beauty tools'),
    ('hair styling tools'),
    ('massage recovery'),
    ('posture back pain'),
    ('home gym fitness'),
    ('camping hiking gear'),
    ('fishing gear'),
    ('garden tools'),
    ('power tools'),
    ('kids toys'),
    ('baby products'),
    ('travel accessories'),
    ('phone accessories'),
    ('led lighting'),
    ('bathroom accessories'),
    ('grill bbq'),
    ('pool summer'),
    ('golf accessories'),
    ('bike cycling'),
    ('desk office'),
    ('sleep aid'),
    ('laundry')
ON CONFLICT (query) DO NOTHING;

-- =============================================
-- Funkcja rotacji: zwraca n najdawniej użytych zapytań i stempluje last_used_at.
-- NULLS FIRST → nigdy-nieużyte mają priorytet. Data-modifying CTE = atomowy pick+bump.
-- =============================================
CREATE OR REPLACE FUNCTION bud_radar_next_queries(n int)
RETURNS TABLE(query text)
LANGUAGE sql
VOLATILE
AS $$
    WITH picked AS (
        SELECT id FROM bud_radar_queries
        ORDER BY last_used_at ASC NULLS FIRST, id ASC
        LIMIT GREATEST(n, 0)
    ), bumped AS (
        UPDATE bud_radar_queries q
        SET last_used_at = now()
        FROM picked
        WHERE q.id = picked.id
        RETURNING q.query
    )
    SELECT query FROM bumped;
$$;

-- =============================================
-- JOB 1: skan sold-first — pon i czw 06:00 UTC (rotacja 4 zapytań / run)
-- Body budowany DYNAMICZNIE: bud_radar_next_queries(4) → jsonb array.
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('bud-radar-scan');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule bud-radar-scan'; END $$;

SELECT cron.schedule(
    'bud-radar-scan',
    '0 6 * * 1,4',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/bud-shop-radar',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-tools-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'bud_tools_secret')
        ),
        body := jsonb_build_object(
            'op', 'scan',
            'minSold', 1000,
            'maxPerQuery', 30,
            'queries', (SELECT coalesce(jsonb_agg(query), '[]'::jsonb) FROM bud_radar_next_queries(4))
        ),
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- =============================================
-- JOB 2: refresh sprzedaży (approved) — sob 05:00 UTC
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('bud-radar-refresh-approved');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule bud-radar-refresh-approved'; END $$;

SELECT cron.schedule(
    'bud-radar-refresh-approved',
    '0 5 * * 6',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/bud-tt-shop',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-tools-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'bud_tools_secret')
        ),
        body := jsonb_build_object('op', 'backfill', 'scope', 'approved', 'limit', 200),
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- =============================================
-- JOB 3: refresh sprzedaży (pending) — niedz 05:00 UTC
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('bud-radar-refresh-pending');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule bud-radar-refresh-pending'; END $$;

SELECT cron.schedule(
    'bud-radar-refresh-pending',
    '0 5 * * 0',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/bud-tt-shop',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-tools-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'bud_tools_secret')
        ),
        body := jsonb_build_object('op', 'backfill', 'scope', 'pending', 'limit', 200),
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- =============================================
-- JOB 4: dedup po skanach — pon i czw 07:00 UTC (godzinę po skanie)
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('bud-radar-dedup');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule bud-radar-dedup'; END $$;

SELECT cron.schedule(
    'bud-radar-dedup',
    '0 7 * * 1,4',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/bud-tt-dedup',
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
-- Weryfikacja:
--   SELECT jobname, schedule FROM cron.job WHERE jobname LIKE 'bud-radar%';
--   SELECT * FROM bud_radar_next_queries(4);  -- (uwaga: stempluje last_used_at)
--   SELECT jobname, status, return_message, start_time
--     FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- Rotacja sekretu:
--   UPDATE vault.secrets SET secret = '<nowy>' WHERE name = 'bud_tools_secret';
-- =============================================
