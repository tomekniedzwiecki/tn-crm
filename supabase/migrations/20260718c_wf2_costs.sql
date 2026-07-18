-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — KOSZTY JEDNOSTKOWE (2026-07-18, życzenie Tomka)
-- Każdy wydatek produkcyjny (OpenAI/Manus/fal/gpt-image/inne) logowany per
-- projekt/produkt/krok; panel liczy rollup per ETAP + podsumowanie całości.
-- Sesje Claude Code dostają INSERT w warstwie panelUpd paczki promptu;
-- wf2-ads loguje koszt kreacji automatycznie.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.wf2_costs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  product_id  uuid REFERENCES public.wf2_products(id) ON DELETE SET NULL,  -- NULL = koszt projektu
  step_key    text,                                   -- krok, którego dotyczy (lp_makiety, ads_grafiki…)
  stage       int,                                    -- etap (denormalizacja do szybkiego rollupu)
  amount      numeric(12,4) NOT NULL CHECK (amount >= 0),
  currency    text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','PLN')),
  kind        text NOT NULL DEFAULT 'inne',           -- openai | manus | fal | gpt-image | gemini | inne
  note        text,
  created_by  text NOT NULL DEFAULT 'admin',          -- admin | auto (sesja/edge)
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wf2_costs_project_idx ON public.wf2_costs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wf2_costs_stage_idx   ON public.wf2_costs(project_id, stage);

ALTER TABLE public.wf2_costs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wf2_costs_team ON public.wf2_costs;
CREATE POLICY wf2_costs_team ON public.wf2_costs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()));
