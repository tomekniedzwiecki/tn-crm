-- ============================================================================
-- ZBUDUJĘ (AWE) — Biblioteka sklepów-wzorców + sourcing produktów na AliExpress
-- ----------------------------------------------------------------------------
-- Model: znajdujemy dropshipowe sklepy-wzorce (jak Dino), kopiujemy asortyment,
-- sourcujemy każdy produkt na AliExpress (vision-verify), Tomek akceptuje pary
-- zdjęć i PRZYPISUJE sklep klientowi (anty-kanibalizacja).
-- Biblioteka jest GLOBALNA (własność admina) — NIE wiązana z bud_sessions.
--
-- Wzorzec RLS: gate team_members (admin). Zapis ciężki = service_role (edge fn).
-- Panel: SELECT przez RLS + kolumnowy GRANT UPDATE (jak spar_sessions/bud_sessions).
-- Idempotentne (IF NOT EXISTS / DROP IF EXISTS).
-- ============================================================================

-- A. TABELE -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bud_stores (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id              text UNIQUE NOT NULL,          -- FB Ad Library page id (dedup biblioteki)
  name                 text NOT NULL,
  domain               text,
  market               text DEFAULT 'US',             -- 'US' | 'PL' | ...
  likes                integer DEFAULT 0,
  categories           text[] DEFAULT '{}',
  assort_count         integer DEFAULT 0,             -- ile aktywnych produktów w reklamach (/company/ads)
  assortment           jsonb DEFAULT '[]'::jsonb,     -- surowy asortyment [{title,link,img}] do sourcingu
  status               text NOT NULL DEFAULT 'candidate', -- candidate | active | archived
  -- przypisanie klientowi (anty-kanibalizacja, poziom sklepu; soft-link bez twardego FK)
  assigned_lead_id     uuid,
  assigned_client_name text,
  assigned_at          timestamptz,
  notes                text,
  -- statystyki sourcingu
  sourced_count        integer DEFAULT 0,
  matched_count        integer DEFAULT 0,
  last_sourced_at      timestamptz,
  discovered_at        timestamptz NOT NULL DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bud_stores_status_check CHECK (status = ANY (ARRAY['candidate','active','archived']))
);

CREATE TABLE IF NOT EXISTS public.bud_store_products (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           uuid NOT NULL REFERENCES public.bud_stores(id) ON DELETE CASCADE,
  -- źródło (sklep-wzorzec)
  source_title       text,
  source_link        text,
  source_img         text,                          -- og:image ze strony produktu (publiczne CDN)
  query              text,                          -- fraza użyta do AliExpress
  pl_name            text,                          -- polska nazwa handlowa
  -- dopasowanie AliExpress
  ali_id             text,
  ali_title          text,
  ali_img            text,
  ali_cost_pln       integer,
  ali_retail_pln     integer,
  ali_link           text,                          -- kanoniczny https://www.aliexpress.com/item/<id>.html
  match_status       text NOT NULL DEFAULT 'pending', -- matched | no_match | pending
  -- recenzja Tomka
  review_status      text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bud_store_products_match_check  CHECK (match_status  = ANY (ARRAY['matched','no_match','pending'])),
  CONSTRAINT bud_store_products_review_check CHECK (review_status = ANY (ARRAY['pending','approved','rejected'])),
  CONSTRAINT bud_store_products_uniq UNIQUE (store_id, source_link)
);

-- B. INDEKSY ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bud_stores_market_status ON public.bud_stores(market, status);
CREATE INDEX IF NOT EXISTS idx_bud_stores_assigned      ON public.bud_stores(assigned_client_name);
CREATE INDEX IF NOT EXISTS idx_bud_sp_store             ON public.bud_store_products(store_id);
CREATE INDEX IF NOT EXISTS idx_bud_sp_review            ON public.bud_store_products(review_status);

-- C. TRIGGER updated_at -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.bud_stores_touch()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$fn$;

DROP TRIGGER IF EXISTS trg_bud_stores_touch ON public.bud_stores;
CREATE TRIGGER trg_bud_stores_touch BEFORE UPDATE ON public.bud_stores
  FOR EACH ROW EXECUTE FUNCTION public.bud_stores_touch();

DROP TRIGGER IF EXISTS trg_bud_sp_touch ON public.bud_store_products;
CREATE TRIGGER trg_bud_sp_touch BEFORE UPDATE ON public.bud_store_products
  FOR EACH ROW EXECUTE FUNCTION public.bud_stores_touch();

-- D. RLS (admin = team_members) ---------------------------------------------
ALTER TABLE public.bud_stores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bud_store_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bud_stores_admin_read ON public.bud_stores;
CREATE POLICY bud_stores_admin_read ON public.bud_stores FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));

DROP POLICY IF EXISTS bud_stores_admin_update ON public.bud_stores;
CREATE POLICY bud_stores_admin_update ON public.bud_stores FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));

DROP POLICY IF EXISTS bud_sp_admin_read ON public.bud_store_products;
CREATE POLICY bud_sp_admin_read ON public.bud_store_products FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));

DROP POLICY IF EXISTS bud_sp_admin_update ON public.bud_store_products;
CREATE POLICY bud_sp_admin_update ON public.bud_store_products FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));

-- E. GRANTY -----------------------------------------------------------------
-- service_role (edge functions) = pełny dostęp
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER ON public.bud_stores         TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER ON public.bud_store_products TO service_role;
-- panel (authenticated) = SELECT przez RLS + UPDATE tylko kolumn recenzji/przypisania
GRANT SELECT ON public.bud_stores, public.bud_store_products TO authenticated;
GRANT UPDATE (status, assigned_lead_id, assigned_client_name, assigned_at, notes) ON public.bud_stores TO authenticated;
GRANT UPDATE (review_status, ali_retail_pln) ON public.bud_store_products TO authenticated;
