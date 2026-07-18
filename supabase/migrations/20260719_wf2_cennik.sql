-- ══════════════════════════════════════════════════════════════════════════
-- 20260719_wf2_cennik — moduł cen W1 (SSOT: docs/zbuduje/CENNIK-PLAN.md v2.0)
-- Drabinka cenowa per produkt + historia zmian (Omnibus) + persystencja
-- propozycji „Do decyzji" + poprawka unit_profit (shipping_paid_by).
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1) wf2_products: kolumny cyklu cenowego ────────────────────────────────
ALTER TABLE public.wf2_products
  ADD COLUMN IF NOT EXISTS price_ladder jsonb,
  ADD COLUMN IF NOT EXISTS price_phase integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS phase_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS platform_variant_id text,
  ADD COLUMN IF NOT EXISTS price_state text NOT NULL DEFAULT 'ok',
  ADD COLUMN IF NOT EXISTS shipping_paid_by text NOT NULL DEFAULT 'client';

DO $$ BEGIN
  ALTER TABLE public.wf2_products
    ADD CONSTRAINT wf2_products_price_state_chk
    CHECK (price_state IN ('ok','pending_platform','mismatch','paused'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.wf2_products
    ADD CONSTRAINT wf2_products_shipping_paid_by_chk
    CHECK (shipping_paid_by IN ('client','shop'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2) unit_profit v2: respektuje shipping_paid_by ─────────────────────────
-- Faza testowa (TESTY.md §3 ⚠): dostawę płaci KLIENT → koszt wysyłki NIE
-- obciąża zysku jednostkowego. Stara definicja zawsze odejmowała
-- cost_shipping = zaniżony unit_profit/BEROAS przy shipping_paid_by='client'
-- (default, zgodny z realnymi kalkulacjami portfela rozwojowego).
ALTER TABLE public.wf2_products DROP COLUMN IF EXISTS unit_profit;
ALTER TABLE public.wf2_products ADD COLUMN unit_profit numeric(10,2)
  GENERATED ALWAYS AS (
    price
    - COALESCE(cost_purchase, 0)
    - CASE WHEN shipping_paid_by = 'shop' THEN COALESCE(cost_shipping, 0) ELSE 0 END
    - price * COALESCE(fees_pct, 0) / 100.0
  ) STORED;

-- ── 3) backfill faz z margin_mode + phase_started_at ───────────────────────
UPDATE public.wf2_products SET price_phase = 3 WHERE margin_mode = 'scale' AND price_phase = 1;
UPDATE public.wf2_products
  SET phase_started_at = COALESCE(test_started_at, created_at)
  WHERE phase_started_at IS NULL;

-- ── 4) wf2_price_events — historia/audit zmian cen (oś czasu + Omnibus 30 dni)
CREATE TABLE IF NOT EXISTS public.wf2_price_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.wf2_products(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  at timestamptz NOT NULL DEFAULT now(),
  old_price numeric(10,2),
  new_price numeric(10,2),
  phase_from integer,
  phase_to integer,
  direction text CHECK (direction IN ('up','down')),
  trigger_kind text NOT NULL CHECK (trigger_kind IN ('rung_auto','ai_proposal','manual','rollback','init')),
  actor text NOT NULL DEFAULT 'engine' CHECK (actor IN ('engine','tomek','claude')),
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','rejected','applied','confirmed','failed')),
  reason_pl text,
  metrics_snapshot jsonb,
  platform jsonb
);
CREATE INDEX IF NOT EXISTS wf2_price_events_product_idx ON public.wf2_price_events(product_id, at DESC);
CREATE INDEX IF NOT EXISTS wf2_price_events_project_idx ON public.wf2_price_events(project_id, at DESC);

-- ── 5) wf2_proposals — persystencja WSZYSTKICH kart „Do decyzji" ───────────
-- (cenowe + kampanijne; bez tego odrzucone karty liczone „w locie" wracałyby
-- po każdym odświeżeniu panelu)
CREATE TABLE IF NOT EXISTS public.wf2_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  project_id uuid REFERENCES public.wf2_projects(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.wf2_products(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN (
    'winner_reco','price_scale','price_opt_over_ceiling','rollback',
    'campaign_kill','creative_refresh','budget_scale','budget_realloc',
    'manual_price_platform'
  )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  dedup_key text UNIQUE,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','rejected','expired')),
  decided_at timestamptz,
  decided_by text
);
CREATE INDEX IF NOT EXISTS wf2_proposals_status_idx ON public.wf2_proposals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS wf2_proposals_product_idx ON public.wf2_proposals(product_id, created_at DESC);

-- ── 6) RLS: wyłącznie team_members (standard wf2 — ZERO anon) ──────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['wf2_price_events','wf2_proposals']
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

-- ── 7) settings: wf2_price_config (JSON-string; value = TEXT) ──────────────
-- Defaulty wg CENNIK-PLAN.md §8. engine_enabled=false + dry_run=true:
-- silnik startuje WYŁĄCZONY (kill-switch FAIL-CLOSED).
INSERT INTO public.settings (key, value) VALUES ('wf2_price_config', '{
  "engine_enabled": false,
  "dry_run": true,
  "advance_orders_test": 5,
  "slow_grad_orders": 3,
  "winner_spend_floor": 200,
  "slow_grad_spend": 300,
  "effective_factor": 0.90,
  "cod_weight": 0.7,
  "min_prepaid_orders": 2,
  "ramp_hold_days": 7,
  "opt_step_pct_min": 8,
  "opt_step_pct_max": 12,
  "opt_advance_orders": 8,
  "opt_advance_days": 21,
  "roas_be_mult": 1.2,
  "contribution_keep_frac": 0.95,
  "max_step_pct": 15,
  "cooldown_days": 7,
  "anomaly_min_orders": 12,
  "anomaly_window_days": 14,
  "cache_grace_min": 6,
  "defer_to_checkpoint": true,
  "max_price_changes_per_run": 5,
  "min_margin_floor_pct": 5,
  "paid_definition": "synced",
  "client_price_consent": "notify",
  "q4_cpm_uplift": 40,
  "test_pricing_mode_default": "cost_plus",
  "target_minus_band_min": 120
}')
ON CONFLICT (key) DO NOTHING;
