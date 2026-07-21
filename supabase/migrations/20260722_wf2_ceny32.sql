-- ══════════════════════════════════════════════════════════════════════════
-- 20260722_wf2_ceny32 — moduł cen „CENY 3.0", iteracja v3.2
--   (koszty tax-aware + twardy próg 5 zamówień + poprawki symulacyjne S1–S9)
-- SSOT: docs/zbuduje/CENNIK-PLAN.md v3.2. Uzasadnienie: SIM-ENGINE-V3-WYNIKI.md
--   (Monte Carlo 12 scen. ×500) + research podatkowy (VAT/cło/hurt) + spec-v32.
-- MUSI wejść PRZED pushem kodu silnika v3.2 (edge wf2-price-engine) — F1.
-- Baza: 20260721d_wf2_ceny3 (v3.1) MUSI być już zaaplikowana.
--
-- Zakres (addytywny, idempotentny):
--   1) wf2_products     — kolumny client_cost_* (cena zakupu podana przez klienta,
--                         priorytetowa z sanity-band; CHECK na source dropship/wholesale)
--   2) wf2_proposals    — CHECK kind rozszerzony o 'client_cost_review' (pełna lista 11)
--   3) settings.wf2_price_config → v3.2 (backup v3.1 + COALESCE kill-switcha + asercje):
--        hard_min_orders 5, winner/ramp_orders 5, collapse_min_expected 8,
--        collapse_rel_floor 0.6, no_ads_max_steps 2, proposal_ttl_days 14, cost_model {…}
--
-- ⚠ NIE dotykamy: kolumny unit_profit (GENERATED — legacy „uproszczona brutto"; marża
--    netto liczona w LOCIE w silniku/panelu/portalu) ani tabel tpay.
-- ⚠ RLS: WYŁĄCZNIE team_members (ZERO polityk anon — portal klienta idzie edge'em).
-- ⚠ Kill-switch PRZENOSZONY z OBECNEJ wartości (COALESCE) — dziś engine_enabled=true,
--    dry_run=true (pilot). Asercja: dry_run MUSI zostać true (pilot nie może „wejść na
--    żywo" przy bumpie configu).
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1) wf2_products — cena zakupu podana przez KLIENTA (spec §4 pkt 1) ──────
-- client_cost_purchase: kwota podana przez klienta w portalu (sekcja „Ceny").
--   Gdy ustawiona ORAZ w sanity band [0.4, 1.6] × cost_purchase → jest NAJWAŻNIEJSZA
--   (znormalizowana wg source: dropship=brutto/VAT nieodliczalny, wholesale=netto/odliczalny).
--   Poza pasmem → NIE stosuj + karta 'client_cost_review' (Tomek przenosi ręcznie).
-- client_cost_is_net: czy klient podał kwotę NETTO (true) czy BRUTTO (false/NULL).
-- client_cost_source: 'dropship' | 'wholesale' — steruje normalizacją VAT.
-- client_cost_note: notatka klienta (≤300 zn. walidowane w edge wf2-portal).
-- client_cost_set_at: znacznik ostatniego zapisu klienta.
ALTER TABLE public.wf2_products
  ADD COLUMN IF NOT EXISTS client_cost_purchase numeric(10,2),
  ADD COLUMN IF NOT EXISTS client_cost_is_net   boolean,
  ADD COLUMN IF NOT EXISTS client_cost_source   text NOT NULL DEFAULT 'dropship',
  ADD COLUMN IF NOT EXISTS client_cost_note     text,
  ADD COLUMN IF NOT EXISTS client_cost_set_at   timestamptz;

-- CHECK osobno (wzorzec 20260721d — idempotentne przez duplicate_object).
DO $$ BEGIN
  ALTER TABLE public.wf2_products
    ADD CONSTRAINT wf2_products_client_cost_source_chk
    CHECK (client_cost_source IN ('dropship','wholesale'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN public.wf2_products.client_cost_purchase IS
  'CENY 3.2: cena zakupu podana przez klienta (portal, sekcja Ceny). W sanity band = priorytetowa nad cost_purchase; poza pasmem → karta client_cost_review. CENNIK-PLAN.md §2g/§7b.';

-- ── 2) wf2_proposals — kind + 'client_cost_review' (spec §4 pkt 2) ─────────
-- Karta INFORMACYJNA (bez auto-wykonania): klient podał koszt odbiegający od
-- Ali (poza pasmem [0.4,1.6]) — Tomek decyduje, czy przenieść wartość do
-- cost_purchase ręcznie w panelu. DROP+ADD z PEŁNĄ listą 11 kindów (10 z v3.1 + nowy).
ALTER TABLE public.wf2_proposals DROP CONSTRAINT IF EXISTS wf2_proposals_kind_check;
ALTER TABLE public.wf2_proposals DROP CONSTRAINT IF EXISTS wf2_proposals_kind_chk;
ALTER TABLE public.wf2_proposals
  ADD CONSTRAINT wf2_proposals_kind_chk CHECK (kind IN (
    'winner_reco','price_scale','price_opt_over_ceiling','rollback',
    'campaign_kill','creative_refresh','budget_scale','budget_realloc',
    'manual_price_platform','landing_republish','client_cost_review'
  ));

-- ── 3) settings.wf2_price_config → v3.2 (spec §4 pkt 3) ────────────────────
-- (a) backup OBECNEJ wartości (raz — ON CONFLICT DO NOTHING zachowuje oryginał v3.1).
INSERT INTO public.settings (key, value)
SELECT 'wf2_price_config_backup_v31', value
  FROM public.settings WHERE key = 'wf2_price_config'
ON CONFLICT (key) DO NOTHING;

-- Guard czytelny: config musi istnieć (z 20260721d_wf2_ceny3). Standalone-apply bez
-- niego = STOP z jasnym komunikatem (zamiast kryptycznej asercji niżej).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.settings WHERE key = 'wf2_price_config') THEN
    RAISE EXCEPTION 'settings.wf2_price_config nie istnieje — zaaplikuj najpierw 20260721d_wf2_ceny3.sql (v3.1)';
  END IF;
END $$;

-- (b) UPDATE na pełny JSON v3.2 (§8 KANONICZNE) z PRZENIESIENIEM kill-switcha:
-- engine_enabled/dry_run brane z ISTNIEJĄCEJ wartości (COALESCE do bezpiecznych
-- defaultów — dziś oba żyją w pilocie: enabled=true, dry_run=true). value = TEXT →
-- parsujemy nowy JSON (::jsonb), podmieniamy dwa klucze (jsonb_set), zapisujemy z
-- powrotem (::text). WSZYSTKIE klucze v3.1 zachowane; zmienione: config_version 3.2,
-- winner_orders/ramp_orders 5, collapse_min_expected 8, proposal_ttl_days 14; NOWE:
-- hard_min_orders 5, collapse_rel_floor 0.6, no_ads_max_steps 2, cost_model {…}.
UPDATE public.settings AS s
   SET value = jsonb_set(
                 jsonb_set(
                   $json${
  "config_version": "3.2",
  "engine_enabled": false,
  "dry_run": true,
  "autonomy_default": "propose",
  "pilot_project_ids": ["baacc66f-3dd0-462a-9799-de9c7aaea639"],
  "decision_hour": 7,
  "no_raise_weekdays": [4, 5],

  "hard_min_orders": 5,

  "winner_orders": 5,
  "winner_spend": 300,
  "winner_needs_cp2": true,
  "cp2_atc_rate": 5.0,
  "cp2_cost_atc_max": 12,
  "winner_high_confidence_orders": 5,
  "winner_orders_no_ads": 5,
  "min_prepaid_orders": 1,

  "ramp_orders": 5,
  "ramp_spend": 150,
  "ramp_hold_days": 7,
  "ramp_wall_snap": true,
  "walls": [100, 150],

  "collapse_quantile": 0.10,
  "collapse_baseline_days": 7,
  "collapse_min_spend": 150,
  "collapse_max_days": 5,
  "collapse_min_expected": 8,
  "collapse_rel_floor": 0.6,
  "learning_grace_days": 3,
  "rollback_lock_days": 21,
  "q4_cpm_uplift": 40,

  "small_step_no_adset_pct": 10,
  "fresh_adset_days": 10,
  "target_change_min_pct": 10,
  "target_stability_runs": 2,
  "cpa_ewma_alpha": 0.3,

  "opt_probe_pct_min": 15,
  "opt_probe_pct_max": 20,
  "opt_window_days": 14,
  "opt_window_days_cod": 21,
  "contribution_keep_frac": 0.80,
  "mer_be_mult": 1.2,
  "mer_gate_min_margin": 0.30,
  "wall_cross_requires_human": true,
  "allow_downward_proposals": true,
  "auto_step_max_pct": 20,

  "frequency_decline": 3.5,
  "harvest_cpm_rise_pct": 20,
  "harvest_window_days": 14,

  "scale_margin_survival": 0.12,
  "scale_margin_target": 0.40,
  "cpa_ci_quantile": 0.65,

  "effective_factor_bands": {"do60": 0.92, "do100": 0.85, "do150": 0.78, "powyzej": 0.70},
  "cod_settled_gating_share": 0.60,
  "cod_cooldown_days": 21,
  "sms_verify_required_above": 100,

  "ads_fresh_hours": 48,
  "ads_min_spend_active": 1,
  "dq_unmapped_ratio": 0.2,
  "no_ads_window_days": 30,
  "no_ads_max_steps": 2,

  "market_gap_flag": 0.75,
  "cooldown_days": 7,
  "min_margin_floor_pct": 5,
  "anomaly_min_orders": 12,
  "anomaly_window_days": 14,
  "cache_grace_min": 6,
  "max_price_changes_per_run": 5,
  "decision_ttl_days": 14,
  "proposal_ttl_days": 14,
  "paid_definition": "synced",
  "client_price_consent": "notify",

  "cost_model": {
    "vat_rate": 0.23,
    "dropship_customs_fee_pln": 13,
    "wholesale_discount": 0.40,
    "wholesale_extras_pct": 0.15,
    "wholesale_local_ship_pln": 14,
    "client_cost_sanity_band": [0.4, 1.6],
    "tax_model_default": "goods"
  }
}$json$::jsonb,
                   '{engine_enabled}',
                   to_jsonb( COALESCE( (s.value::jsonb ->> 'engine_enabled')::boolean, false ) )
                 ),
                 '{dry_run}',
                 to_jsonb( COALESCE( (s.value::jsonb ->> 'dry_run')::boolean, true ) )
               )::text
 WHERE s.key = 'wf2_price_config';

-- (c) Asercje fail-fast po UPDATE (spec §4 pkt 3):
--   • config_version = '3.2' (kanon musi się zgadzać).
--   • dry_run = true (TWARDO — pilot MUSI przetrwać bump configu; gdyby ktoś zdjął
--     dry_run w OBECNYM configu, COALESCE przeniósłby false → ta asercja przerywa
--     migrację, zamiast po cichu wystartować silnik „na żywo").
--   • hard_min_orders = 5 (nowy twardy próg — dyrektywa Tomka).
--   • contribution_keep_frac = 0.80 (kanon v3.1 nietknięty).
DO $$
DECLARE
  v_new jsonb;
BEGIN
  SELECT value::jsonb INTO v_new FROM public.settings WHERE key = 'wf2_price_config';

  IF (v_new ->> 'config_version') IS DISTINCT FROM '3.2' THEN
    RAISE EXCEPTION 'wf2_price_config: config_version != 3.2 (jest %)', v_new ->> 'config_version';
  END IF;

  IF COALESCE((v_new ->> 'dry_run')::boolean, true) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'wf2_price_config: dry_run != true (jest %) — pilot musi zostać w dry_run przy bumpie configu', v_new ->> 'dry_run';
  END IF;

  IF (v_new ->> 'hard_min_orders')::int IS DISTINCT FROM 5 THEN
    RAISE EXCEPTION 'wf2_price_config: hard_min_orders != 5 (jest %)', v_new ->> 'hard_min_orders';
  END IF;

  IF (v_new ->> 'contribution_keep_frac')::numeric IS DISTINCT FROM 0.80 THEN
    RAISE EXCEPTION 'wf2_price_config: contribution_keep_frac != 0.80 (jest %)', v_new ->> 'contribution_keep_frac';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════
-- Po aplikacji zweryfikuj:
--   1) Kolumny wf2_products (5 nowych):
--      SELECT column_name FROM information_schema.columns
--       WHERE table_name='wf2_products'
--         AND column_name IN ('client_cost_purchase','client_cost_is_net',
--             'client_cost_source','client_cost_note','client_cost_set_at');
--      SELECT pg_get_constraintdef(oid) FROM pg_constraint
--       WHERE conname='wf2_products_client_cost_source_chk';   -- IN ('dropship','wholesale')
--   2) CHECK kind proposals zawiera 'client_cost_review' (11 kindów):
--      SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname='wf2_proposals_kind_chk';
--   3) Config v3.2 (kill-switch przeniesiony; dry_run=true przetrwał):
--      SELECT value::jsonb->>'config_version', value::jsonb->>'engine_enabled',
--             value::jsonb->>'dry_run', value::jsonb->>'hard_min_orders',
--             value::jsonb->>'proposal_ttl_days', value::jsonb->>'collapse_min_expected',
--             value::jsonb->'cost_model'
--        FROM public.settings WHERE key='wf2_price_config';   -- 3.2 / (przeniesione) / true / 5 / 14 / 8 / {…}
--      SELECT key FROM public.settings WHERE key='wf2_price_config_backup_v31';  -- backup istnieje
--   4) Deploy edge wf2-price-engine v3.2 PRZED pierwszym tickiem crona (config_version
--      guard: silnik waliduje '3.2' — przy '3.1' po backupie i przed deployem = run z
--      błędem, ZERO akcji = fail-closed do czasu wdrożenia F2).
-- ══════════════════════════════════════════════════════════════════════════
