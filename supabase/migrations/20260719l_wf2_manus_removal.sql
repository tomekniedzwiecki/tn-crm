-- 20260719l_wf2_manus_removal.sql
-- Decyzja Tomka 19.07: fabryka banerów wf2 = WYŁĄCZNIE ad-forge/fal (nano-banana-pro/nb2),
-- Manus USUNIĘTY z modułu wf2. Funkcja edge wf2-ads skasowana, gałąź routingu w manus-webhook
-- wycięta, panel /tn-sklepy nie odwołuje się już do kolumn ads_manus_*.
-- ⚠️ ZAKRES = TYLKO wf2. Workflow v1 (workflow_ads / manus_task_id) oraz lejek /sklep
-- (bud_sessions.ads_manus_*, funkcja bud-ads) POZOSTAJĄ NIETKNIĘTE — tam Manus zostaje.
-- ads_creatives NIE jest usuwane — ad-forge zapisuje tam gotowe banery (galeria + akcept w panelu).

DROP INDEX IF EXISTS public.idx_wf2_products_ads_manus;
DROP INDEX IF EXISTS public.idx_wf2_products_ads_task;

ALTER TABLE public.wf2_products
  DROP COLUMN IF EXISTS ads_manus_task_id,
  DROP COLUMN IF EXISTS ads_manus_status,
  DROP COLUMN IF EXISTS ads_manus_step,
  DROP COLUMN IF EXISTS ads_manus_started_at,
  DROP COLUMN IF EXISTS ads_manus_completed_at;
