-- =============================================
-- SCORING v3 + BREAKOUT — radar trendów „Zbuduję"
-- =============================================
-- Kontekst (decyzja Tomka 2026-07-17, podstawa EMPIRYCZNA na 450 produktach):
--   corr(review_count, sold) = 0.968  → recenzje to mocne proxy sprzedaży
--   corr(heat, sold)         = -0.105 → heat degradujemy (waga 0.20 → 0.05)
--
-- Ta migracja NIE dotyka scoringu (to logika edge bud-tt-shop). Robi dwie rzeczy:
--   1) Przestawia cron `bud-radar-refresh-pending` z niedzieli na wt+pt → szybsza DRUGA
--      migawka sold_count → szybsza delta (dziś 0 kluczy ma ≥2 snapshoty: history powstało
--      2026-07-16, a refresh biegał dopiero raz; guard <20h+ten sam sold jest OK).
--   2) Tworzy widok `bud_breakout_v` — tempo sprzedaży per key (delta / growth% / velocity)
--      liczone z bud_tt_shop_history. security_invoker=true → dziedziczy RLS history (2 recenzentów).
--
-- Sekret cronu: Vault `bud_tools_secret` (jak w 20260716c_radar_cron.sql). pg_net timeout 350s.
-- APPLIED przez MCP execute_sql — plik dla spójności repo.
-- =============================================

-- =============================================
-- 1) CRON: refresh sprzedaży (pending) — z niedzieli (0) na wtorek+piątek (2,5) 05:00 UTC.
--    Druga migawka w tygodniu przychodzi po ~3 dniach zamiast po 7 → delta widoczna szybciej.
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('bud-radar-refresh-pending');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule bud-radar-refresh-pending'; END $$;

SELECT cron.schedule(
    'bud-radar-refresh-pending',
    '0 5 * * 2,5',
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
-- 2) WIDOK bud_breakout_v — tempo sprzedaży per key (tylko klucze z ≥2 snapshotami sold).
--    prev = NAJBLIŻSZY snapshot oddalony o ≥4 dni od ostatniego (świeża, ale sensowna baza).
--    security_invoker=true → SELECT egzekwuje RLS bud_tt_shop_history (uid Tomka+Maćka).
-- =============================================
DROP VIEW IF EXISTS bud_breakout_v;
CREATE VIEW bud_breakout_v WITH (security_invoker = true) AS
WITH last_snap AS (
    SELECT DISTINCT ON (key)
        key, sold_count AS last_sold, captured_at AS last_at
    FROM bud_tt_shop_history
    WHERE sold_count IS NOT NULL
    ORDER BY key, captured_at DESC
),
prev_snap AS (
    SELECT DISTINCT ON (h.key)
        h.key, h.sold_count AS prev_sold, h.captured_at AS prev_at
    FROM bud_tt_shop_history h
    JOIN last_snap l ON l.key = h.key
    WHERE h.sold_count IS NOT NULL
      AND h.captured_at <= l.last_at - INTERVAL '4 days'
    ORDER BY h.key, h.captured_at DESC   -- najbliższy do granicy 4 dni = najświeższa kwalifikująca się baza
)
SELECT
    l.key,
    l.last_sold,
    p.prev_sold,
    l.last_at,
    p.prev_at,
    (l.last_sold - p.prev_sold)                                                        AS delta,
    CASE WHEN p.prev_sold > 0
         THEN round((l.last_sold - p.prev_sold)::numeric / p.prev_sold * 100, 1)
         ELSE NULL END                                                                 AS growth_pct,
    round(EXTRACT(EPOCH FROM (l.last_at - p.prev_at)) / 86400.0, 2)                     AS days_span,
    CASE WHEN EXTRACT(EPOCH FROM (l.last_at - p.prev_at)) > 0
         THEN round((l.last_sold - p.prev_sold)::numeric
                    / (EXTRACT(EPOCH FROM (l.last_at - p.prev_at)) / 86400.0), 2)
         ELSE NULL END                                                                 AS daily_velocity
FROM last_snap l
JOIN prev_snap p ON p.key = l.key;

GRANT SELECT ON bud_breakout_v TO authenticated;

-- =============================================
-- Weryfikacja:
--   SELECT jobname, schedule FROM cron.job WHERE jobname = 'bud-radar-refresh-pending';  -- 0 5 * * 2,5
--   SELECT * FROM bud_breakout_v ORDER BY growth_pct DESC NULLS LAST;                     -- pusto do 2. migawki
-- =============================================
