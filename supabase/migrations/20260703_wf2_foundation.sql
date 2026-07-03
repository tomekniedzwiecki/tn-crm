-- ============================================================================
-- WORKFLOW V2 („Sklepy") — fundament (F1)
-- Moduł prowadzenia wspólnych biznesów po rezerwacji /sklep.
-- Plan: docs/zbuduje/WORKFLOW-V2-PLAN.md
-- Architektura: kroki = konfiguracja (wf2_step_defs), instancje = wf2_steps
-- (jedno źródło postępu — anty-lekcja z v1, gdzie flagi boolean żyły w tabelach
-- per-etap, a dodanie kroku dotykało ~30 miejsc w kodzie).
-- ============================================================================

-- ── PROJEKTY ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wf2_projects (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  name                 text NOT NULL DEFAULT '',            -- marka / nazwa projektu
  customer_name        text,
  customer_email       text,
  customer_phone       text,
  lead_id              uuid,                                -- leads.id (luźno, bez FK)
  bud_session_id       uuid,                                -- bud_sessions.id — sesja z rozmowy /sklep
  reservation_order_id uuid,                                -- orders.id rezerwacji 500 zł
  status               text NOT NULL DEFAULT 'start'
                       CHECK (status IN ('start','budowa','sklep','kampanie','testy','stery','monthly','zamkniety')),
  unique_token         text UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  client_password_hash text,
  meta_ad_account_id   text,                                -- act_XXX konta klienta
  pixel_id             text,
  td_shop_url          text,
  domain               text,
  target_orders        integer NOT NULL DEFAULT 1000,       -- cel: przekazanie sterów
  notes                text,
  is_test              boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS wf2_projects_session_idx ON public.wf2_projects(bud_session_id);
CREATE INDEX IF NOT EXISTS wf2_projects_status_idx  ON public.wf2_projects(status);

-- ── HARMONOGRAM PŁATNOŚCI (całość / raty / indywidualny) ────────────────────
CREATE TABLE IF NOT EXISTS public.wf2_payments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  sort       integer NOT NULL DEFAULT 0,
  label      text NOT NULL DEFAULT '',                      -- np. „Rezerwacja", „Rata 2/4"
  amount     numeric(10,2) NOT NULL DEFAULT 0,
  due_date   date,
  order_id   uuid,                                          -- orders.id (spięcie z tpay)
  paid_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wf2_payments_project_idx ON public.wf2_payments(project_id);

-- ── PORTFEL PRODUKTÓW ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wf2_products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  sort           integer NOT NULL DEFAULT 0,
  name           text NOT NULL DEFAULT '',
  status         text NOT NULL DEFAULT 'kandydat'
                 CHECK (status IN ('kandydat','zaakceptowany','w_budowie','gotowy','live','test','winner','kill','skala')),
  tt_product_id  uuid,                                      -- bud_tt_products.id (radar /trendy)
  gen_session_id uuid,                                      -- bud_sessions.id dedykowanej sesji generatorów (F2)
  supplier_url   text,
  cover_url      text,
  -- kalkulator marży: tryb TEST celuje w 5–10 zł zysku/szt. (decyzja Tomka 2026-07-03)
  cost_purchase  numeric(10,2),                             -- zakup u dostawcy / szt.
  cost_shipping  numeric(10,2),                             -- wysyłka do klienta / szt.
  fees_pct       numeric(5,2) NOT NULL DEFAULT 2.0,         -- prowizje (płatności/TD), % ceny
  price          numeric(10,2),                             -- cena sprzedaży brutto
  unit_profit    numeric(10,2) GENERATED ALWAYS AS (
                   COALESCE(price,0) - COALESCE(cost_purchase,0) - COALESCE(cost_shipping,0)
                   - COALESCE(price,0) * COALESCE(fees_pct,0) / 100.0
                 ) STORED,
  margin_mode    text NOT NULL DEFAULT 'test' CHECK (margin_mode IN ('test','scale')),
  campaign_id    text,                                      -- Meta campaign ID (mapowanie statystyk, F3)
  td_page_url    text,                                      -- strona produktu w TakeDrop
  repo_path      text,                                      -- tn-crm/sklepy/<projekt>/<produkt>/
  deliverables   jsonb NOT NULL DEFAULT '{}'::jsonb,        -- {report,brand,mockups,landing} refs
  notes          text
);
CREATE INDEX IF NOT EXISTS wf2_products_project_idx ON public.wf2_products(project_id);

-- ── DEFINICJE KROKÓW (konfiguracja — nowy krok = 1 INSERT) ──────────────────
CREATE TABLE IF NOT EXISTS public.wf2_step_defs (
  key             text PRIMARY KEY,
  stage           integer NOT NULL,
  stage_label     text NOT NULL,
  label           text NOT NULL,
  icon            text NOT NULL DEFAULT 'ph-circle',
  sort            integer NOT NULL DEFAULT 0,
  owner           text NOT NULL DEFAULT 'admin' CHECK (owner IN ('admin','client','auto')),
  scope           text NOT NULL DEFAULT 'project' CHECK (scope IN ('project','product')),
  instructions_md text,                                     -- instrukcje dla klienta (portal, F2)
  active          boolean NOT NULL DEFAULT true
);

-- ── INSTANCJE KROKÓW (jedno źródło postępu) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wf2_steps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  product_id   uuid REFERENCES public.wf2_products(id) ON DELETE CASCADE,  -- NULL = scope projektu
  step_key     text NOT NULL REFERENCES public.wf2_step_defs(key),
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','in_progress','done','skipped','blocked')),
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,          -- notatki/linki/pola kroku
  completed_at timestamptz,
  completed_by text,                                        -- 'admin' | 'client' | 'auto'
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS wf2_steps_proj_uniq
  ON public.wf2_steps(project_id, step_key) WHERE product_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS wf2_steps_prod_uniq
  ON public.wf2_steps(project_id, product_id, step_key) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS wf2_steps_project_idx ON public.wf2_steps(project_id);

-- ── SPRZEDAŻ (Meta pixel + import pliku TakeDrop; F3) ───────────────────────
CREATE TABLE IF NOT EXISTS public.wf2_sales (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.wf2_products(id) ON DELETE SET NULL,
  date       date NOT NULL,
  source     text NOT NULL CHECK (source IN ('meta','takedrop')),
  orders     integer NOT NULL DEFAULT 0,
  revenue    numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS wf2_sales_uniq ON public.wf2_sales
  (project_id, COALESCE(product_id, '00000000-0000-0000-0000-000000000000'::uuid), date, source);

-- ── STATYSTYKI REKLAM per kampania/produkt (Meta MCP; F3) ───────────────────
CREATE TABLE IF NOT EXISTS public.wf2_ad_stats (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  product_id     uuid REFERENCES public.wf2_products(id) ON DELETE SET NULL,
  campaign_id    text NOT NULL,
  date           date NOT NULL,
  spend          numeric(12,2) NOT NULL DEFAULT 0,
  impressions    integer NOT NULL DEFAULT 0,
  clicks         integer NOT NULL DEFAULT 0,
  purchases      integer NOT NULL DEFAULT 0,
  purchase_value numeric(12,2) NOT NULL DEFAULT 0,
  roas           numeric(8,2) NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, date)
);
CREATE INDEX IF NOT EXISTS wf2_ad_stats_project_idx ON public.wf2_ad_stats(project_id, date);

-- ── LOG AKTYWNOŚCI ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wf2_activities (
  id          bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  actor       text NOT NULL DEFAULT 'admin',                -- 'admin' | 'client' | 'auto'
  action      text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS wf2_activities_project_idx ON public.wf2_activities(project_id, created_at DESC);

-- ── updated_at ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.wf2_touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS wf2_projects_touch ON public.wf2_projects;
CREATE TRIGGER wf2_projects_touch BEFORE UPDATE ON public.wf2_projects
  FOR EACH ROW EXECUTE FUNCTION public.wf2_touch_updated_at();
DROP TRIGGER IF EXISTS wf2_products_touch ON public.wf2_products;
CREATE TRIGGER wf2_products_touch BEFORE UPDATE ON public.wf2_products
  FOR EACH ROW EXECUTE FUNCTION public.wf2_touch_updated_at();
DROP TRIGGER IF EXISTS wf2_steps_touch ON public.wf2_steps;
CREATE TRIGGER wf2_steps_touch BEFORE UPDATE ON public.wf2_steps
  FOR EACH ROW EXECUTE FUNCTION public.wf2_touch_updated_at();

-- ── ensure steps: dosiewa brakujące instancje kroków (SECURITY DEFINER,
--    bo woła ją też webhook i UI po dodaniu produktu/defa) ───────────────────
CREATE OR REPLACE FUNCTION public.wf2_ensure_steps(p_project uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO wf2_steps (project_id, step_key)
  SELECT p_project, d.key FROM wf2_step_defs d
  WHERE d.active AND d.scope = 'project'
    AND NOT EXISTS (SELECT 1 FROM wf2_steps s
                    WHERE s.project_id = p_project AND s.step_key = d.key AND s.product_id IS NULL);

  INSERT INTO wf2_steps (project_id, product_id, step_key)
  SELECT p_project, p.id, d.key
  FROM wf2_products p CROSS JOIN wf2_step_defs d
  WHERE p.project_id = p_project AND d.active AND d.scope = 'product'
    AND NOT EXISTS (SELECT 1 FROM wf2_steps s
                    WHERE s.project_id = p_project AND s.product_id = p.id AND s.step_key = d.key);
END $$;
GRANT EXECUTE ON FUNCTION public.wf2_ensure_steps(uuid) TO authenticated, service_role;

-- ── RLS: tylko zespół (team_members) — ZERO polityk anon; portal klienta
--    pójdzie przez edge function wf2-portal (F2), nie przez anon RLS ─────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['wf2_projects','wf2_payments','wf2_products','wf2_step_defs',
                           'wf2_steps','wf2_sales','wf2_ad_stats','wf2_activities']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_team_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
       USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
       WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))',
      t || '_team_all', t);
  END LOOP;
END $$;

-- ── SEED: definicje kroków (etapy 1–6 wg WORKFLOW-V2-PLAN.md §2) ────────────
INSERT INTO public.wf2_step_defs (key, stage, stage_label, label, icon, sort, owner, scope, instructions_md) VALUES
-- ETAP 1 — Start
('rozmowa',            1, 'Start',               'Rozmowa + plan',          'ph-chats-circle',    10, 'admin',  'project', NULL),
('umowa',              1, 'Start',               'Umowa',                   'ph-file-text',       20, 'admin',  'project', NULL),
('platnosc',           1, 'Start',               'Płatność',                'ph-credit-card',     30, 'admin',  'project', NULL),
('kickoff',            1, 'Start',               'Kickoff',                 'ph-flag',            40, 'admin',  'project', NULL),
-- ETAP 2 — Portfel produktów (per produkt)
('wybor',              2, 'Portfel produktów',   'Wybór + kalkulacja',      'ph-magnifying-glass',10, 'admin',  'product', NULL),
('raport',             2, 'Portfel produktów',   'Raport',                  'ph-chart-bar',       20, 'admin',  'product', NULL),
('branding',           2, 'Portfel produktów',   'Branding',                'ph-paint-brush',     30, 'admin',  'product', NULL),
('design',             2, 'Portfel produktów',   'Design (makiety)',        'ph-layout',          40, 'admin',  'product', NULL),
('html_draft',         2, 'Portfel produktów',   'HTML draft',              'ph-code',            50, 'auto',   'product', NULL),
('html_final',         2, 'Portfel produktów',   'HTML final',              'ph-seal-check',      60, 'admin',  'product', NULL),
-- ETAP 3 — Sklep TakeDrop
('td_konto',           3, 'Sklep TakeDrop',      'Konto TD',                'ph-user-plus',       10, 'client', 'project', 'Załóż konto w TakeDrop — instrukcja krok po kroku pojawi się tutaj.'),
('td_konfiguracja',    3, 'Sklep TakeDrop',      'Konfiguracja sklepu',     'ph-gear-six',        20, 'client', 'project', 'Skonfiguruj sklep wg checklisty (płatności, wysyłki, maile) — instrukcja wkrótce.'),
('td_dane_prawne',     3, 'Sklep TakeDrop',      'Dane prawne',             'ph-scales',          30, 'client', 'project', 'Uzupełnij regulamin, politykę prywatności i klauzule RODO — dostaniesz szablony.'),
('td_bramka',          3, 'Sklep TakeDrop',      'Bramka płatności',        'ph-bank',            40, 'client', 'project', 'Podłącz bramkę płatności do sklepu — instrukcja wkrótce.'),
('td_galeria',         3, 'Sklep TakeDrop',      'Strona główna (galeria)', 'ph-squares-four',    50, 'admin',  'project', NULL),
('td_strona_prod',     3, 'Sklep TakeDrop',      'Strona produktu w TD',    'ph-browser',         60, 'admin',  'product', NULL),
('td_domena',          3, 'Sklep TakeDrop',      'Domena',                  'ph-globe',           70, 'admin',  'project', NULL),
('td_test',            3, 'Sklep TakeDrop',      'Test zakupowy',           'ph-check-square',    80, 'admin',  'project', NULL),
-- ETAP 4 — Kampanie
('ads_konto',          4, 'Kampanie',            'Konto reklamowe',         'ph-user-gear',       10, 'client', 'project', 'Załóż konto reklamowe i nadaj dostęp partnerski — instrukcja wkrótce.'),
('ads_pixel',          4, 'Kampanie',            'Pixel',                   'ph-broadcast',       20, 'admin',  'project', NULL),
('ads_grafiki',        4, 'Kampanie',            'Grafiki reklamowe',       'ph-image',           30, 'admin',  'product', NULL),
('ads_kampanie',       4, 'Kampanie',            'Kampania Meta',           'ph-rocket-launch',   40, 'admin',  'product', NULL),
('ads_budzet',         4, 'Kampanie',            'Budżet',                  'ph-wallet',          50, 'client', 'project', 'Zasil konto reklamowe budżetem — instrukcja wkrótce.'),
-- ETAP 5 — Testy i skalowanie
('test_wynik',         5, 'Testy i skalowanie',  'Wynik testu',             'ph-flask',           10, 'admin',  'product', NULL),
('skalowanie',         5, 'Testy i skalowanie',  'Skalowanie',              'ph-trend-up',        20, 'admin',  'product', NULL),
('rotacja',            5, 'Testy i skalowanie',  'Kolejne produkty',        'ph-arrows-clockwise',30, 'admin',  'project', NULL),
('sprzedaz_sync',      5, 'Testy i skalowanie',  'Sync sprzedaży',          'ph-arrows-left-right',40,'auto',   'project', NULL),
-- ETAP 6 — Przekazanie sterów
('wdrazanie',          6, 'Przekazanie sterów',  'Wdrażanie klienta',       'ph-graduation-cap',  10, 'admin',  'project', NULL),
('przejecie_kampanii', 6, 'Przekazanie sterów',  'Przejęcie kampanii',      'ph-steering-wheel',  20, 'client', 'project', 'Przejmij prowadzenie kampanii wg checklisty — dostaniesz ją na tym etapie.'),
('przejecie_operacji', 6, 'Przekazanie sterów',  'Przejęcie operacji',      'ph-package',         30, 'client', 'project', 'Przejmij obsługę zamówień i zapytań — checklista pojawi się tutaj.'),
('stery',              6, 'Przekazanie sterów',  'Stery przekazane',        'ph-handshake',       40, 'admin',  'project', NULL),
('monthly',            6, 'Przekazanie sterów',  'Przegląd miesięczny',     'ph-calendar-check',  50, 'admin',  'project', NULL)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.wf2_projects  IS 'Workflow v2: projekty wspólnych biznesów (po rezerwacji /sklep). Plan: docs/zbuduje/WORKFLOW-V2-PLAN.md';
COMMENT ON TABLE public.wf2_step_defs IS 'Workflow v2: definicje kroków — nowy krok = INSERT (zero zmian schematu/frontu)';
COMMENT ON TABLE public.wf2_steps     IS 'Workflow v2: instancje kroków — JEDYNE źródło postępu projektu';
