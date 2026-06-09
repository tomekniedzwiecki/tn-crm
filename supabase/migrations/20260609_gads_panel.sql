-- =============================================
-- GADS PANEL — Google Ads (marka osobista, silnik = Google Ads Scripts, bez API tokena)
-- Prefiks gads_*. RLS: authenticated = admin (panel Tomka). Edge functions = service_role.
-- Plan: c:/tmp/google-ads-panel-plan.md
-- =============================================

-- ---------- 1. CELE (objective config + benchmarki) ----------
CREATE TABLE IF NOT EXISTS gads_goals (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT,
    objective     TEXT NOT NULL CHECK (objective IN
                    ('SUBSCRIBERS','VIEWS','WATCH_TIME','REACH','AUDIENCE','CONVERSIONS')),
    target_metric TEXT,            -- np. 'average_cpm','trueview_average_cpv','cost_per_conversion'
    target_value  NUMERIC,
    benchmark_low  NUMERIC,        -- zakres, NIE pojedynczy próg (benchmarki bywają rozbieżne)
    benchmark_high NUMERIC,
    weight        NUMERIC DEFAULT 1,
    extra         JSONB DEFAULT '{}',   -- KPI wtórne, np. {"view_rate_low":0.26,"view_rate_high":0.32}
    is_template   BOOLEAN DEFAULT false, -- szablon (nie liczony przez recommend), do sklonowania
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- 2. KAMPANIE (mirror konta) ----------
CREATE TABLE IF NOT EXISTS gads_campaigns (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_campaign_id    TEXT UNIQUE NOT NULL,   -- ID kampanii Google
    name              TEXT,
    channel_type      TEXT,                   -- VIDEO | DEMAND_GEN | SEARCH | PERFORMANCE_MAX | DISPLAY
    status            TEXT,                   -- ENABLED | PAUSED | REMOVED
    daily_budget_micros BIGINT,
    goal_id           UUID REFERENCES gads_goals(id) ON DELETE SET NULL,
    last_mutated_at   TIMESTAMPTZ,            -- ochrona Smart Bidding learning (~6 tyg)
    last_synced_at    TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- 3. KOLEJKA KOMEND (panel -> skrypt) ----------
CREATE TABLE IF NOT EXISTS gads_commands (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            TEXT NOT NULL CHECK (type IN
                      ('SET_BUDGET','PAUSE','ENABLE','SET_BID_TARGET')),  -- MVP: tylko bezpieczne
    campaign_ref    TEXT,                 -- ad_campaign_id (NULL = poziom konta)
    payload         JSONB DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN
                      ('pending','claimed','done','error','canceled')),
    idempotency_key TEXT UNIQUE NOT NULL, -- ta sama intencja nie zduplikuje akcji
    run_id          TEXT,                 -- który przebieg skryptu zaclaim'ował
    claimed_at      TIMESTAMPTZ,
    executed_at     TIMESTAMPTZ,
    result          JSONB,
    error           TEXT,
    attempts        INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    created_by      UUID REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_gads_commands_pending ON gads_commands(created_at) WHERE status = 'pending';

-- ---------- 4. MAGAZYN METRYK (GAQL 1:1, nazwy TrueView wg API v22) ----------
CREATE TABLE IF NOT EXISTS gads_metrics_daily (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_ref             TEXT NOT NULL,
    date                     DATE NOT NULL,
    impressions              BIGINT,
    clicks                   BIGINT,
    cost_micros              BIGINT,
    average_cpm              NUMERIC,
    ctr                      NUMERIC,
    -- TrueView (v22; stare video_views/average_cpv/video_view_rate zwracają null od 2026-03-02)
    trueview_views           BIGINT,
    trueview_view_rate       NUMERIC,
    trueview_average_cpv     NUMERIC,
    video_quartile_p25_rate  NUMERIC,
    video_quartile_p50_rate  NUMERIC,
    video_quartile_p75_rate  NUMERIC,
    video_quartile_p100_rate NUMERIC,
    conversions              NUMERIC,
    conversions_value        NUMERIC,
    all_conversions          NUMERIC,
    unique_users             BIGINT,   -- reach (zakres <=92 dni, ~3 dni opóźnienia)
    avg_impression_frequency NUMERIC,
    created_at               TIMESTAMPTZ DEFAULT NOW(),
    updated_at               TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (campaign_ref, date)         -- upsert idempotentny przy re-runach
);
CREATE INDEX IF NOT EXISTS idx_gads_metrics_date ON gads_metrics_daily(date);

-- ---------- 5. REKOMENDACJE (insighty -> komenda po akceptacji) ----------
CREATE TABLE IF NOT EXISTS gads_recommendations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_ref      TEXT,
    kind              TEXT,            -- cpv_above_target | low_view_rate | low_completion | cpa_above_target | zero_conversions | cpm_above_target | in_learning
    severity          TEXT DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
    rationale         TEXT,
    suggested_command JSONB,           -- szablon do wstawienia do gads_commands po "Akceptuj"
    metric_snapshot   JSONB,
    status            TEXT DEFAULT 'new' CHECK (status IN ('new','accepted','dismissed','applied')),
    dedupe_key        TEXT UNIQUE,     -- 'campaign_ref:kind:YYYY-MM-DD' — jedna rekomendacja/dzień
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gads_recs_new ON gads_recommendations(created_at) WHERE status = 'new';

-- ---------- 6. AUDIENCJE (tworzone ręcznie w UI; tu tylko stan + zdrowie listy) ----------
CREATE TABLE IF NOT EXISTS gads_audiences (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT,
    type              TEXT CHECK (type IN
                        ('CUSTOM_SEGMENT','CUSTOMER_LIST','LOOKALIKE_SEED','REMARKETING','YOUTUBE_ENGAGEMENT')),
    resource_name     TEXT,            -- user_list resource z Google
    seed_definition   JSONB,
    reach_signal      TEXT,
    member_count      BIGINT,
    mode              TEXT DEFAULT 'OBSERVE' CHECK (mode IN ('TARGET','OBSERVE','EXCLUDE')),
    last_refreshed_at TIMESTAMPTZ,
    expires_at        TIMESTAMPTZ,     -- 540-dniowy limit; panel ostrzega przed wygaśnięciem
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- 7. METRYKI KANAŁU (YouTube Analytics API — organic, osobny gating) ----------
CREATE TABLE IF NOT EXISTS gads_channel_metrics (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date                     DATE NOT NULL UNIQUE,
    subscribers_gained       INT,
    subscribers_lost         INT,
    views                    BIGINT,
    estimated_minutes_watched BIGINT,
    likes                    INT,
    comments                 INT,
    shares                   INT,
    created_at               TIMESTAMPTZ DEFAULT NOW(),
    updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- 8. DANE RĘCZNE (earned views/subs + Brand Lift — TYLKO w UI Google Ads) ----------
CREATE TABLE IF NOT EXISTS gads_brand_manual (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date               DATE NOT NULL,
    campaign_ref       TEXT,
    earned_views       BIGINT,
    earned_subscribers INT,
    earned_likes       INT,
    earned_shares      INT,
    earned_playlist_adds INT,
    brand_lift_note    TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (date, campaign_ref)
);

-- ---------- RLS: authenticated = admin pełny dostęp (edge functions używają service_role) ----------
ALTER TABLE gads_goals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gads_campaigns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gads_commands         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gads_metrics_daily    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gads_recommendations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gads_audiences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gads_channel_metrics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gads_brand_manual     ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'gads_goals','gads_campaigns','gads_commands','gads_metrics_daily',
    'gads_recommendations','gads_audiences','gads_channel_metrics','gads_brand_manual'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admin_all_%1$s" ON %1$s;', t);
    EXECUTE format(
      'CREATE POLICY "admin_all_%1$s" ON %1$s FOR ALL USING (auth.role() = ''authenticated'');', t);
  END LOOP;
END $$;

-- ---------- updated_at trigger ----------
CREATE OR REPLACE FUNCTION gads_touch_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'gads_goals','gads_campaigns','gads_metrics_daily','gads_audiences',
    'gads_channel_metrics','gads_brand_manual'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated ON %1$s;', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON %1$s
                    FOR EACH ROW EXECUTE FUNCTION gads_touch_updated_at();', t);
  END LOOP;
END $$;

-- ---------- Atomowy claim komend (FOR UPDATE SKIP LOCKED — przeżywa nakładające się przebiegi) ----------
CREATE OR REPLACE FUNCTION gads_claim_commands(p_run_id TEXT, p_limit INT DEFAULT 50)
RETURNS SETOF gads_commands
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  UPDATE gads_commands c
     SET status = 'claimed', claimed_at = NOW(), run_id = p_run_id, attempts = c.attempts + 1
   WHERE c.id IN (
     SELECT id FROM gads_commands
      WHERE status = 'pending'
      ORDER BY created_at
      LIMIT p_limit
      FOR UPDATE SKIP LOCKED
   )
  RETURNING c.*;
END $$;

-- ---------- Globalne włączniki (master switch + kill switch + cap dzienny) ----------
INSERT INTO settings (key, value) VALUES
    ('gads_engine_enabled', 'true'),
    ('gads_kill_switch', 'false'),
    ('gads_daily_spend_cap_micros', '0')   -- 0 = brak limitu; >0 = twardy cap (w micros)
ON CONFLICT (key) DO NOTHING;

-- ---------- Szablony celów z benchmarkami 2026 (kierunkowe, EDYTOWALNE; USD) ----------
INSERT INTO gads_goals (name, objective, target_metric, benchmark_low, benchmark_high, extra, is_template)
SELECT * FROM (VALUES
 ('Zasięg / świadomość'::text, 'REACH'::text,       'average_cpm'::text,          5::numeric, 11::numeric,   '{}'::jsonb, true),
 ('Wyświetlenia',              'VIEWS',              'trueview_average_cpv',       0.018, 0.058, '{"view_rate_low":0.26,"view_rate_high":0.32}'::jsonb, true),
 ('Watch time',                'WATCH_TIME',         'video_quartile_p100_rate',   0.10, 1.0,    '{}'::jsonb, true),
 ('Subskrypcje',               'SUBSCRIBERS',        'cost_per_conversion',        1,    2,      '{}'::jsonb, true),
 ('Konwersje (zapisy)',        'CONVERSIONS',        'cost_per_conversion',        0,    42,     '{}'::jsonb, true)
) AS v(name, objective, target_metric, benchmark_low, benchmark_high, extra, is_template)
WHERE NOT EXISTS (SELECT 1 FROM gads_goals WHERE is_template = true);

COMMENT ON TABLE gads_commands IS 'Kolejka intencji panel->skrypt. Skrypt claimuje atomowo (gads_claim_commands), wykonuje, odsyła wynik.';
COMMENT ON TABLE gads_metrics_daily IS 'Magazyn metryk z Google Ads Script (GAQL). Pola TrueView wg API v22.';
COMMENT ON TABLE gads_recommendations IS 'Deterministyczne insighty (gads-recommend, cron). Akceptacja -> wstawienie suggested_command do gads_commands.';

-- =============================================
-- CRON (po włączeniu pg_cron + pg_net w Dashboard > Database > Extensions).
-- gads-recommend raz dziennie 06:00 Europe/Warsaw (po settle metryk).
-- Zamień YOUR_GADS_AGENT_SECRET na wartość sekretu (ten sam co w skrypcie i w Edge Secrets).
-- =============================================
/*
SELECT cron.schedule_in_time_zone(
    'gads-recommend-daily',
    '0 6 * * *',
    'Europe/Warsaw',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/gads-recommend',
        headers := '{"Content-Type":"application/json","x-agent-key":"YOUR_GADS_AGENT_SECRET"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);
*/
