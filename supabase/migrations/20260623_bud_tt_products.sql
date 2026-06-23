-- AWE radar trendów TikTok → AliExpress: baza filmów + dopasowani kandydaci + panel weryfikacji pracownika.
CREATE TABLE IF NOT EXISTS public.bud_tt_products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key              text UNIQUE NOT NULL,          -- znormalizowana nazwa produktu (dedup/upsert)
  pl_name          text NOT NULL,
  category         text DEFAULT 'Inne',
  query            text,
  -- TikTok
  tiktok_url       text,
  cover            text,
  -- sygnały potencjału
  videos           integer DEFAULT 0,
  max_plays        bigint  DEFAULT 0,
  total_plays      bigint  DEFAULT 0,
  comments         integer DEFAULT 0,
  heat             numeric DEFAULT 0,
  newest_days      integer,
  tags             text[]  DEFAULT '{}',
  -- AliExpress (image-search)
  ali_candidates   jsonb   DEFAULT '[]'::jsonb,   -- [{id,title,price,link,img}]
  ali_search_url   text,
  -- weryfikacja pracownika
  chosen_link      text,
  status           text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  reviewed_by      text,
  reviewed_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bud_tt_status_check CHECK (status = ANY (ARRAY['pending','approved','rejected']))
);
CREATE INDEX IF NOT EXISTS idx_bud_tt_status   ON public.bud_tt_products(status);
CREATE INDEX IF NOT EXISTS idx_bud_tt_category ON public.bud_tt_products(category);
CREATE INDEX IF NOT EXISTS idx_bud_tt_heat     ON public.bud_tt_products(heat DESC);

CREATE OR REPLACE FUNCTION public.bud_tt_touch() RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $fn$;
DROP TRIGGER IF EXISTS trg_bud_tt_touch ON public.bud_tt_products;
CREATE TRIGGER trg_bud_tt_touch BEFORE UPDATE ON public.bud_tt_products
  FOR EACH ROW EXECUTE FUNCTION public.bud_tt_touch();

ALTER TABLE public.bud_tt_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bud_tt_admin_read ON public.bud_tt_products;
CREATE POLICY bud_tt_admin_read ON public.bud_tt_products FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));
DROP POLICY IF EXISTS bud_tt_admin_update ON public.bud_tt_products;
CREATE POLICY bud_tt_admin_update ON public.bud_tt_products FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bud_tt_products TO service_role;
GRANT SELECT ON public.bud_tt_products TO authenticated;
GRANT UPDATE (status, chosen_link, category, reviewed_by, reviewed_at) ON public.bud_tt_products TO authenticated;
