-- ═══════════════════════════════════════════════════════════════════════════
-- FABRYKA STATYCZNYCH GRAFIK ADS (krok ads_grafiki, Etap 5 „Materiały i kampania")
-- Decyzja 19.07 (rev2 „Manus albo nic"): ads_grafiki dostaje pełną fabrykę na wzór landingów i wideo —
-- SSOT + playbooki + bramki QA + rejestr z rodowodem + pętla wyników. Migracja
-- domyka warstwę danych:
--   1. wf2_creatives  = rejestr obsługuje teraz też OBRAZY (media_type='image'),
--                       z kątem/formatem/wzorcem — bez tego pętla wyników nie
--                       odróżni grafiki od wideo ani kąta demo/problem/proof.
--   2. wf2_creative_perf = wspólny widok kreacji rozszerzony o media_type/kąt/
--                       format + koszty efektywności (cpc/cpa); metryki video
--                       (thumbstop/hold) zostają NULL dla obrazów.
--   3. wf2_angle_perf  = NOWY widok tylko dla obrazów, agregat per kąt+format
--                       (który kąt sprzedaje) → wnioski wracają do playbooków.
--   4. Sub-kroki agr_* = timeline fabryki grafik w panelu (wzorzec avi_*).
-- UWAGA CREATE OR REPLACE VIEW: Postgres pozwala tylko DOŁOŻYĆ kolumny na końcu
-- listy SELECT — istniejące 17 kolumn wf2_creative_perf (…ctr na końcu) zostaje
-- 1:1, nowe kolumny lądują ZA nimi (inaczej REPLACE padnie).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. REJESTR: obsługa obrazów ────────────────────────────────────────────
ALTER TABLE public.wf2_creatives
  ADD COLUMN IF NOT EXISTS media_type  text NOT NULL DEFAULT 'video'
    CHECK (media_type IN ('video','image')),
  ADD COLUMN IF NOT EXISTS angle       text,   -- demo | problem | proof (tylko obrazy)
  ADD COLUMN IF NOT EXISTS format       text,   -- '45' (1080×1350) | '916' (1080×1920)
  ADD COLUMN IF NOT EXISTS pattern_ref  text;   -- rodowód: referencja wzorca/inspiracji grafiki
CREATE INDEX IF NOT EXISTS wf2_creatives_media_idx
  ON public.wf2_creatives(media_type, angle);

-- ── 2. WIDOK KREACJI: media_type/kąt/format + cpc/cpa (append-only!) ────────
-- Istniejące kolumny (creative_id … ctr) NIENARUSZONE; nowe dołożone na końcu.
-- thumbstop/hold_50/p100_rate zostają — dla obrazów wychodzą NULL (brak metryk video).
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
       round(sum(s.clicks)::numeric        / NULLIF(sum(s.impressions), 0), 4) AS ctr,
       -- ── nowe (append-only) ──
       c.media_type,
       c.angle,
       c.format,
       round(sum(s.spend)::numeric / NULLIF(sum(s.clicks), 0), 4)         AS cpc,
       round(sum(s.spend)::numeric / NULLIF(sum(s.purchases), 0), 4)      AS cpa
FROM public.wf2_creatives c
LEFT JOIN public.wf2_ad_stats s ON s.creative_id = c.id AND s.level = 'ad'
GROUP BY c.id;

-- ── 3. WIDOK KĄTÓW (tylko obrazy): który kąt+format sprzedaje ───────────────
CREATE OR REPLACE VIEW public.wf2_angle_perf WITH (security_invoker = true) AS
SELECT c.angle, c.format,
       count(DISTINCT c.id)                                               AS creatives,
       COALESCE(sum(s.spend), 0)                                          AS spend,
       COALESCE(sum(s.impressions), 0)                                    AS impressions,
       COALESCE(sum(s.clicks), 0)                                         AS clicks,
       COALESCE(sum(s.purchases), 0)                                      AS purchases,
       round(sum(s.clicks)::numeric / NULLIF(sum(s.impressions), 0), 4)   AS ctr,
       round(sum(s.spend)::numeric  / NULLIF(sum(s.purchases), 0), 4)     AS cpa
FROM public.wf2_creatives c
LEFT JOIN public.wf2_ad_stats s ON s.creative_id = c.id AND s.level = 'ad'
WHERE c.media_type = 'image'
GROUP BY c.angle, c.format;

-- ── 4. SUB-KROKI FABRYKI GRAFIK (timeline w warsztacie ads_grafiki) ─────────
-- Marker sub_of='ads_grafiki' wyklucza je z kolumn matrycy (jak avi_*); artefakty/
-- koszty/checklisty wiszą na (product_id, step_key) — sub-kroki dostają je za darmo.
INSERT INTO public.wf2_step_defs (key, stage, stage_label, label, icon, sort, owner, scope, sub_of, milestone_label, active) VALUES
 ('agr_brief',     5, 'Materiały i kampania', 'Brief per kąt',            'ph-note-pencil',    351, 'auto', 'product', 'ads_grafiki', NULL, true),
 ('agr_generacja', 5, 'Materiały i kampania', 'Generacja (Manus)',        'ph-magic-wand',     352, 'auto', 'product', 'ads_grafiki', NULL, true),
 ('agr_qa',        5, 'Materiały i kampania', 'Bramki QA + dowody',       'ph-shield-check',   353, 'auto', 'product', 'ads_grafiki', NULL, true),
 ('agr_final',     5, 'Materiały i kampania', 'Finał i rejestr',          'ph-flag-checkered', 354, 'auto', 'product', 'ads_grafiki', 'Grafiki gotowe (bramki + AI-flag + rejestr)', true)
ON CONFLICT (key) DO NOTHING;

-- ── 5. Przesiew instancji dla wszystkich projektów (idempotentne) ──────────
SELECT public.wf2_ensure_steps(id) FROM public.wf2_projects;
