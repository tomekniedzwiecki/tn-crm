-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — PRZEBUDOWA PANELU POD FABRYKĘ (2026-07-18)
-- 1) wf2_artifacts — artefakty fabryki per produkt/krok (makiety, branding,
--    dowody dopasowania, grafiki reklamowe, wideo) widoczne w panelu.
-- 2) wf2_projects.links — pasek „Podglądy" (wzorzec wfa_projects.links).
-- 3) wf2_products: cache ceny/statusu z platformy Trevio.
-- 4) NOWY SEED wf2_step_defs — etapy odzwierciedlające realny proces fabryki
--    (Portfel → Landing (F0→F8) → Sklep na platformie → Kampanie → Testy → Stery).
--    Wszystko nieprodukcyjne (decyzja Tomka 17.07) — stare kroki i instancje
--    kasujemy, wf2_ensure_steps przesiewa od zera.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. ARTEFAKTY ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wf2_artifacts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  product_id  uuid REFERENCES public.wf2_products(id) ON DELETE CASCADE,  -- NULL = artefakt projektu
  step_key    text,                            -- krok, z którego pochodzi (lp_makiety, lp_branding…)
  kind        text NOT NULL DEFAULT 'image',   -- image | mockup | brand | proof | doc | video | ad_creative | link
  label       text,
  url         text NOT NULL,                   -- Storage / repo raw / zewnętrzny podgląd
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb,  -- np. {viewport:'desktop', section:'03-hero', ssim:0.86}
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wf2_artifacts_project_idx ON public.wf2_artifacts(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wf2_artifacts_product_idx ON public.wf2_artifacts(product_id, step_key);

ALTER TABLE public.wf2_artifacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wf2_artifacts_team ON public.wf2_artifacts;
CREATE POLICY wf2_artifacts_team ON public.wf2_artifacts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()));

-- ── 2. PASEK „PODGLĄDY" ────────────────────────────────────────────────────
ALTER TABLE public.wf2_projects
  ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ── 3. CACHE PLATFORMY NA PRODUKCIE ────────────────────────────────────────
ALTER TABLE public.wf2_products
  ADD COLUMN IF NOT EXISTS platform_price     numeric,        -- cena widziana na platformie (reconcile cronem)
  ADD COLUMN IF NOT EXISTS platform_synced_at timestamptz;    -- ostatni sync produktu z platformą

-- ── 3b. KAMPANIE: stan Manus (3 grafiki) + wideo 15 s per produkt (R4) ─────
ALTER TABLE public.wf2_products
  ADD COLUMN IF NOT EXISTS ads_manus_task_id       text,
  ADD COLUMN IF NOT EXISTS ads_manus_status        text,          -- running|completed|failed
  ADD COLUMN IF NOT EXISTS ads_manus_step          text,          -- diagnostyka (timeout|no_output)
  ADD COLUMN IF NOT EXISTS ads_manus_started_at    timestamptz,
  ADD COLUMN IF NOT EXISTS ads_manus_completed_at  timestamptz,
  ADD COLUMN IF NOT EXISTS ads_creatives           jsonb,         -- [{angle,headline,primary_text,image_url}]
  ADD COLUMN IF NOT EXISTS video_pattern_tiktok_url text,
  ADD COLUMN IF NOT EXISTS video_status            text,          -- planning|rendering|qa|done|failed
  ADD COLUMN IF NOT EXISTS video_url               text,          -- kreacja_15s.mp4 (bucket wf2-video)
  ADD COLUMN IF NOT EXISTS video_cost_usd          numeric(10,2),
  ADD COLUMN IF NOT EXISTS video_ai_labeled        boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_wf2_products_ads_manus
  ON public.wf2_products(ads_manus_status) WHERE ads_manus_status = 'running';
CREATE INDEX IF NOT EXISTS idx_wf2_products_ads_task
  ON public.wf2_products(ads_manus_task_id) WHERE ads_manus_task_id IS NOT NULL;

-- bucket prywatny: materiał badawczy wideo (cudzy content = research) + gotowe kreacje
INSERT INTO storage.buckets (id, name, public) VALUES ('wf2-video','wf2-video', false)
ON CONFLICT (id) DO NOTHING;

-- ── 3c. PRODUKT: slug fabryki + klucz mapowania zamówień + tabela zamówień ─
ALTER TABLE public.wf2_products
  ADD COLUMN IF NOT EXISTS slug          text,     -- slug mini-marki (ścieżki fabryki, path platformy, checkout slug)
  ADD COLUMN IF NOT EXISTS platform_name text;     -- nazwa produktu NA PLATFORMIE (klucz mapowania linii zamówień)

ALTER TABLE public.wf2_projects
  ADD COLUMN IF NOT EXISTS orders_synced_at timestamptz;

-- surowe zamówienia z platformy (dedup po id = dokładny licznik do 1000)
CREATE TABLE IF NOT EXISTS public.wf2_orders (
  id            text PRIMARY KEY,                  -- id zamówienia z platformy
  project_id    uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  shop_id       text NOT NULL,
  number        text,
  order_date    timestamptz NOT NULL,
  value         numeric(12,2) NOT NULL DEFAULT 0,
  delivery_cost numeric(12,2) NOT NULL DEFAULT 0,
  is_cod        boolean,
  lines         jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{name, price, quantity, product_id?}]
  synced_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wf2_orders_project_idx ON public.wf2_orders(project_id, order_date DESC);
ALTER TABLE public.wf2_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wf2_orders_team ON public.wf2_orders;
CREATE POLICY wf2_orders_team ON public.wf2_orders
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()));

-- artefakty: skąd pochodzi URL (podgląd w panelu tylko dla 'supabase'/'external')
ALTER TABLE public.wf2_artifacts
  ADD COLUMN IF NOT EXISTS storage text NOT NULL DEFAULT 'supabase'
    CHECK (storage IN ('supabase','repo','desktop','external'));

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. SEED KROKÓW — proces fabryki (twardy swap; wszystko nieprodukcyjne)
--    Etapy: 1 Portfel · 2 Landing (lp_*) · 3 Sklep na platformie (pl_*) ·
--           4 Kampanie (+ads_wideo) · 5 Testy i skalowanie · 6 Stery.
--    Instancje kroków kasujemy w całości (fresh start); wf2_ensure_steps
--    przesiewa na końcu. instructions_md kluczy ZACHOWANYCH nie ruszamy.
-- ═══════════════════════════════════════════════════════════════════════════

-- 4a. instancje: czysty start
DELETE FROM public.wf2_steps;

-- 4b. usuń defs zastępowane nowym procesem
DELETE FROM public.wf2_step_defs WHERE key IN
  ('branding','design','html_draft','html_final',
   'td_konto','td_konfiguracja','td_dane_prawne','td_bramka',
   'td_strona_prod','td_galeria','td_domena','td_test');

-- 4c. przenumeruj zachowane etapy (Landing wchodzi jako 2, platforma jako 3)
UPDATE public.wf2_step_defs SET stage = 4, stage_label = 'Kampanie'
  WHERE key IN ('ads_konto','ads_budzet','ads_pixel','ads_grafiki','ads_kampanie');
UPDATE public.wf2_step_defs SET stage = 5, stage_label = 'Testy i skalowanie'
  WHERE key IN ('test_wynik','skalowanie','rotacja','sprzedaz_sync');
UPDATE public.wf2_step_defs SET stage = 6, stage_label = 'Przekazanie sterów'
  WHERE key IN ('wdrazanie','przejecie_kampanii','przejecie_operacji','stery','monthly');

-- kamienie + korekty zachowanych kroków
UPDATE public.wf2_step_defs SET milestone_label = 'Pomiar działa (pixel + CAPI + Purchase)' WHERE key = 'ads_pixel';
UPDATE public.wf2_step_defs SET label = '3 grafiki (Manus)', icon = 'ph-images-square', sort = 30 WHERE key = 'ads_grafiki';
UPDATE public.wf2_step_defs SET milestone_label = 'Kampania gotowa (PAUSED — czeka na start)', sort = 40 WHERE key = 'ads_kampanie';
UPDATE public.wf2_step_defs SET owner = 'auto', label = 'Sync zamówień (platforma)' WHERE key = 'sprzedaz_sync';

-- 4d. ETAP 2 — LANDING (fabryka F0→F8; scope=product; sort skokami 100)
INSERT INTO public.wf2_step_defs (key, stage, stage_label, label, icon, sort, owner, scope, milestone_label) VALUES
('lp_dane',        2,'Landing','Dane i weryfikacja źródła',   'ph-database',   100,'admin','product', NULL),
('lp_plan',        2,'Landing','Plan + przewodnik graficzny', 'ph-strategy',   200,'admin','product', NULL),
('lp_styl_marka',  2,'Landing','Styl-master + mini-marka',    'ph-palette',    300,'admin','product', NULL),
('lp_makiety',     2,'Landing','Makiety całej strony',        'ph-layout',     400,'admin','product', 'Makiety zaakceptowane — tak wygląda strona'),
('lp_grafiki',     2,'Landing','Grafiki produkcyjne',         'ph-images',     500,'admin','product', NULL),
('lp_kod',         2,'Landing','Kod strony (1:1 z makiet)',   'ph-code',       600,'admin','product', NULL),
('lp_dopasowanie', 2,'Landing','Dopasowanie do makiet',       'ph-git-diff',   700,'admin','product', NULL),
('lp_zycie',       2,'Landing','Życie: animacje + interakcje','ph-sparkle',    800,'admin','product', NULL),
('lp_finisz',      2,'Landing','Finisz: gate-check + retro',  'ph-seal-check', 900,'admin','product', 'Landing gotowy (gate-check 0 FAIL)')
ON CONFLICT (key) DO NOTHING;

-- 4e. ETAP 3 — SKLEP NA PLATFORMIE (Trevio; pl_*)
INSERT INTO public.wf2_step_defs (key, stage, stage_label, label, icon, sort, owner, scope, milestone_label, instructions_md) VALUES
('pl_sklep',      3,'Sklep na platformie','Sklep na platformie',         'ph-storefront',           10,'auto',  'project','Sklep utworzony na platformie', NULL),
('pl_dane',       3,'Sklep na platformie','Dane rozliczeniowe + prawne', 'ph-identification-card',  20,'client','project', NULL,
 'Podaj 26-cyfrowy numer konta (NRB) — na nie platforma przeleje pieniądze z zamówień za pobraniem. Uzupełnij dane firmy (nazwa, NIP, adres, e-mail sklepu) do regulaminu i polityki prywatności.'),
('pl_branding',   3,'Sklep na platformie','Logo + favicon sklepu',       'ph-paint-brush',          30,'auto',  'project', NULL, NULL),
('pl_dostawy',    3,'Sklep na platformie','Dostawy + pobranie (COD)',    'ph-truck',                40,'auto',  'project', NULL, NULL),
('pl_domena',     3,'Sklep na platformie','Domena marki',                'ph-globe',                50,'client','project','Domena marki działa',
 'Dodaj u swojego rejestratora poniższe rekordy DNS (kopiuj 1:1). Gdy zweryfikujemy propagację, domena włączy się automatycznie — nic więcej nie robisz.'),
('pl_integracje', 3,'Sklep na platformie','Integracje (pixel + GA4)',    'ph-broadcast',            60,'auto',  'project', NULL, NULL),
('pl_produkt',    3,'Sklep na platformie','Produkt + link do kasy',      'ph-package',              70,'auto',  'product', NULL, NULL),
('pl_landing',    3,'Sklep na platformie','Publikacja landinga',         'ph-rocket-launch',        80,'auto',  'product', NULL, NULL),
('pl_glowna',     3,'Sklep na platformie','Strona główna (galeria)',     'ph-squares-four',         90,'auto',  'project', NULL, NULL),
('pl_test',       3,'Sklep na platformie','Test zakupowy',               'ph-check-square',        100,'admin', 'project','Sklep sprzedaje — test zakupowy zaliczony', NULL)
ON CONFLICT (key) DO NOTHING;

-- 4e-bis. ETAP 1 — lustro w repo dla kroku 'marka' (w DB istnieje z wcześniejszego seeda
-- poza migracjami; INSERT defensywny, żeby świeża odbudowa bazy go nie zgubiła)
INSERT INTO public.wf2_step_defs (key, stage, stage_label, label, icon, sort, owner, scope, milestone_label) VALUES
('marka', 1,'Portfel produktów','Marka sklepu','ph-flag-banner', 5,'admin','project','Marka sklepu wybrana')
ON CONFLICT (key) DO NOTHING;

-- 4f. ETAP 4 — nowy krok wideo (między grafikami a kampanią)
INSERT INTO public.wf2_step_defs (key, stage, stage_label, label, icon, sort, owner, scope, milestone_label) VALUES
('ads_wideo', 4,'Kampanie','Wideo 15 s (fabryka)','ph-film-slate', 35,'admin','product', NULL)
ON CONFLICT (key) DO NOTHING;

-- 4g. przesiew instancji dla wszystkich projektów
DO $$
DECLARE pid uuid;
BEGIN
  FOR pid IN SELECT id FROM public.wf2_projects LOOP
    PERFORM public.wf2_ensure_steps(pid);
  END LOOP;
END $$;
