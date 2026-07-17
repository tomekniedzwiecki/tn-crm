-- REJESTR NAZW MINI-MAREK (fabryka landingów) — jedna rezerwacja nazwy/slug per produkt.
-- Rezerwacja w F0 (wybór mini-marki): INSERT ... ON CONFLICT DO NOTHING RETURNING id;
-- 0 wierszy = kolizja → następna kandydatka (pętla). Rezerwacja PRZED generacją favicona.
-- Nazwa zajęta dla innego usera/landingu TEGO produktu NIE wraca (unique per product_id).
-- Plan: docs/zbuduje/STANDARD-LANDING-SKLEPY.md (F0 rejestr, F2.5 branding).

CREATE TABLE IF NOT EXISTS public.bud_brand_names (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.bud_tt_products(id) ON DELETE CASCADE,
  name        text NOT NULL,
  slug        text NOT NULL,
  landing_ref text,                                    -- slug/ścieżka landingu, który zajął nazwę
  user_ref    text,                                    -- kto/co zarezerwował (agent/sesja)
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_bbn_product_name ON public.bud_brand_names (product_id, lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS uq_bbn_product_slug ON public.bud_brand_names (product_id, slug);
CREATE INDEX        IF NOT EXISTS idx_bbn_product     ON public.bud_brand_names (product_id);

-- RLS: TYLKO team_members (wzorzec wf2_*/bud_*), ZERO polityk anon.
ALTER TABLE public.bud_brand_names ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bud_brand_names_team_all ON public.bud_brand_names;
CREATE POLICY bud_brand_names_team_all ON public.bud_brand_names FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bud_brand_names TO service_role;
GRANT SELECT ON public.bud_brand_names TO authenticated;

COMMENT ON TABLE public.bud_brand_names IS
  'Rejestr nazw mini-marek fabryki landingów: unikat (product_id, name) i (product_id, slug). Rezerwacja INSERT-or-fail w F0. SSOT: docs/zbuduje/STANDARD-LANDING-SKLEPY.md';
