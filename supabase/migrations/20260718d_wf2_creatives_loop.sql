-- ═══════════════════════════════════════════════════════════════════════════
-- PĘTLA WYNIKÓW KREACJI (fabryka AI-video → Meta → wyniki → nauka do KART)
-- Audyt 18.07: produkcja+bramki dojrzałe, ale fabryka ślepa na własną skuteczność.
-- 1. wf2_creatives  = rejestr kreacji z RODOWODEM (archetyp, wzorzec TikTok, silniki,
--                     koszt, meta_ad_ids) — bez tego hipoteza „dziedziczenia
--                     viralowości" jest niesprawdzalna.
-- 2. wf2_ad_stats   + metryki video ad-level (thumbstop/p25-100) + creative_id
--                     + unikalny klucz upsertu dla wf2-ads-sync.
-- 3. Widoki wf2_creative_perf / wf2_pattern_perf = agregaty per kreacja i per
--                     wzorzec/archetyp (wnioski wracają do KART i playbooków).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. REJESTR KREACJI ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wf2_creatives (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  project_id          uuid REFERENCES public.wf2_projects(id) ON DELETE SET NULL,
  product_id          uuid REFERENCES public.wf2_products(id) ON DELETE SET NULL,
  slug                text NOT NULL UNIQUE,   -- katalog fabryki: scripts/video-factory/projekty/<slug>
  archetype           text,                   -- gadzet-handsPOV | beauty-talkinghead | auto-POV
  pattern_tiktok_url  text,                   -- wzorzec viralowy (rodowód!)
  engine_mix          text,                   -- np. 'flf' / 'omnihuman+mc+flf'
  duration_s          numeric(5,1),
  cost_usd            numeric(10,2),          -- est z ledgera (realny koszt: fal.balance() delta)
  ai_labeled          boolean NOT NULL DEFAULT false,
  status              text NOT NULL DEFAULT 'ready',  -- draft|ready|published|retired
  storage_path        text,                   -- ARCHIWUM: wf2-video/... (bucket PRIVATE)
  public_url          text,                   -- FINAŁ dla panelu/Meta: attachments/bud-assets/<slug>/ads/...
  variants            jsonb,                  -- {refined, subs, poster, ...} (ścieżki w archiwum)
  meta_video_id       text,
  meta_ad_ids         text[] NOT NULL DEFAULT '{}',  -- ad_id z Meta → dopasowanie statystyk ad-level
  notes               text,
  meta                jsonb
);
CREATE INDEX IF NOT EXISTS wf2_creatives_product_idx ON public.wf2_creatives(product_id);

ALTER TABLE public.wf2_creatives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wf2_creatives_team_all ON public.wf2_creatives;
CREATE POLICY wf2_creatives_team_all ON public.wf2_creatives FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()));

-- ── 2. METRYKI VIDEO w wf2_ad_stats + klucz upsertu ────────────────────────
ALTER TABLE public.wf2_ad_stats
  ADD COLUMN IF NOT EXISTS creative_id       uuid REFERENCES public.wf2_creatives(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS video_3s_views    integer,   -- actions[video_view] (3-sekundowe)
  ADD COLUMN IF NOT EXISTS video_p25         integer,
  ADD COLUMN IF NOT EXISTS video_p50         integer,
  ADD COLUMN IF NOT EXISTS video_p75         integer,
  ADD COLUMN IF NOT EXISTS video_p100        integer,
  ADD COLUMN IF NOT EXISTS video_thruplay    integer,
  ADD COLUMN IF NOT EXISTS video_avg_watch_s numeric(6,2);
ALTER TABLE public.wf2_ad_stats ALTER COLUMN level SET DEFAULT 'campaign';
-- P&L liczy WYŁĄCZNIE level='campaign' (CENNIK-PLAN: anty-podwójne liczenie);
-- level='ad' istnieje dla pętli wyników kreacji (metryki video).
-- ad_id NOT NULL DEFAULT '' (wiersze campaign-level = '') — PostgREST on_conflict
-- nie obsługuje indeksów wyrażeniowych, klucz musi być na zwykłych kolumnach.
UPDATE public.wf2_ad_stats SET ad_id = '' WHERE ad_id IS NULL;
ALTER TABLE public.wf2_ad_stats
  ALTER COLUMN ad_id SET DEFAULT '',
  ALTER COLUMN ad_id SET NOT NULL;
UPDATE public.wf2_ad_stats SET level = 'campaign' WHERE level IS NULL;
ALTER TABLE public.wf2_ad_stats ALTER COLUMN level SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS wf2_ad_stats_upsert_key
  ON public.wf2_ad_stats(campaign_id, level, ad_id, date);
CREATE INDEX IF NOT EXISTS wf2_ad_stats_creative_idx
  ON public.wf2_ad_stats(creative_id, date) WHERE creative_id IS NOT NULL;

-- ── 3. WIDOKI WYNIKÓW ──────────────────────────────────────────────────────
-- thumbstop = video_3s/impr (hook); hold_50 = p50/3s (utrzymanie); p100_rate = doogląd.
CREATE OR REPLACE VIEW public.wf2_creative_perf WITH (security_invoker = true) AS
SELECT c.id AS creative_id, c.slug, c.archetype, c.pattern_tiktok_url, c.product_id,
       c.status, c.cost_usd,
       count(DISTINCT s.date)                                              AS days,
       COALESCE(sum(s.spend), 0)                                          AS spend,
       COALESCE(sum(s.impressions), 0)                                    AS impressions,
       COALESCE(sum(s.clicks), 0)                                         AS clicks,
       COALESCE(sum(s.purchases), 0)                                      AS purchases,
       COALESCE(sum(s.purchase_value), 0)                                 AS purchase_value,
       round(sum(s.video_3s_views)::numeric / NULLIF(sum(s.impressions), 0), 4) AS thumbstop,
       round(sum(s.video_p50)::numeric     / NULLIF(sum(s.video_3s_views), 0), 4) AS hold_50,
       round(sum(s.video_p100)::numeric    / NULLIF(sum(s.impressions), 0), 4) AS p100_rate,
       round(sum(s.clicks)::numeric        / NULLIF(sum(s.impressions), 0), 4) AS ctr
FROM public.wf2_creatives c
LEFT JOIN public.wf2_ad_stats s ON s.creative_id = c.id AND s.level = 'ad'
GROUP BY c.id;

CREATE OR REPLACE VIEW public.wf2_pattern_perf WITH (security_invoker = true) AS
SELECT c.archetype,
       count(DISTINCT c.id)                                               AS creatives,
       COALESCE(sum(s.spend), 0)                                          AS spend,
       COALESCE(sum(s.impressions), 0)                                    AS impressions,
       COALESCE(sum(s.purchases), 0)                                      AS purchases,
       round(sum(s.video_3s_views)::numeric / NULLIF(sum(s.impressions), 0), 4) AS thumbstop,
       round(sum(s.video_p100)::numeric    / NULLIF(sum(s.impressions), 0), 4) AS p100_rate,
       round(sum(s.clicks)::numeric        / NULLIF(sum(s.impressions), 0), 4) AS ctr
FROM public.wf2_creatives c
LEFT JOIN public.wf2_ad_stats s ON s.creative_id = c.id AND s.level = 'ad'
GROUP BY c.archetype;

-- ── 4. SEED: 6 kreacji fabryki (archiwum finałów już w wf2-video) ──────────
INSERT INTO public.wf2_creatives
  (slug, archetype, pattern_tiktok_url, engine_mix, duration_s, cost_usd, status,
   storage_path, variants, notes)
VALUES
  ('lokowka', 'beauty-talkinghead',
   NULL,  -- pilot sprzed BRIEF-ów; wzorzec = trendujący TikTok lokówki z /trendy (uzupełnić z bud_tt_products)
   'omnihuman+mc+flf', 15, 33.38, 'ready',
   'wf2-video/video-factory/lokowka/kreacja_a_15s.mp4',
   '{"b_wariant":"wf2-video/video-factory/lokowka/kreacja_b_15s.mp4","ad_v7_30s":"wf2-video/video-factory/lokowka/ad_v7.mp4"}',
   'Pilot 7 iteracji — koszt obejmuje całą naukę fabryki, nie samą kreację'),
  ('glosnik', 'gadzet-handsPOV',
   'https://www.tiktok.com/@6857245188058776581/video/7608286806974434590',
   'flf', 15, 4.15, 'ready',
   'wf2-video/video-factory/glosnik/kreacja_15s.mp4',
   '{"refined":"wf2-video/video-factory/glosnik/kreacja_15s_refined.mp4","subs":"wf2-video/video-factory/glosnik/kreacja_15s_refined_subs.mp4"}',
   'Nocna walidacja E2E — PASS za 1. przebiegiem; wersja z napisami (styl rolek)'),
  ('sluchawka', 'gadzet-handsPOV',
   'https://www.tiktok.com/@7571397978733741070/video/7642649433464655118',
   'flf', 15, 2.57, 'ready',
   'wf2-video/video-factory/sluchawka/kreacja_15s.mp4',
   '{"refined":"wf2-video/video-factory/sluchawka/kreacja_15s_refined.mp4"}',
   'Test generalizacji (operator z samej dokumentacji); est ledgera zaniżony — przyjęto śr. $2.57'),
  ('srubokret', 'gadzet-handsPOV',
   'https://www.tiktok.com/@7446313038841611310/video/7558800566105738510',
   'flf', 15, 2.29, 'ready',
   'wf2-video/video-factory/srubokret/kreacja_15s.mp4', NULL,
   'Test generalizacji; audyt spisał drobne defekty do ew. re-renderu'),
  ('uchwyt', 'auto-POV',
   'https://www.tiktok.com/@7590526401808647223/video/7650837627590937886',
   'flf', 15, 2.79, 'ready',
   'wf2-video/video-factory/uchwyt/kreacja_15s.mp4', NULL,
   'Test generalizacji; archetyp auto-POV (dłonie + kokpit, zero twarzy)'),
  ('myjka', 'gadzet-handsPOV',
   'https://www.tiktok.com/@alisa.juki/video/7648994013772549390',
   'flf', 15, 3.96, 'ready',
   'wf2-video/video-factory/myjka/kreacja_15s.mp4', NULL,
   'Walidacja 18.07 noc — werdykt 7/10, zero defektów krytycznych')
ON CONFLICT (slug) DO NOTHING;
