-- ══════════════════════════════════════════════════════════════════════════
-- 20260721d_wf2_ceny3 — moduł cen „CENY 3.0" (silnik decyzji cenowych wf2)
-- SSOT: docs/zbuduje/CENNIK-PLAN.md v3.1 (§5.1 model danych, §8 config KANONICZNE).
-- MUSI wejść PRZED pushem kodu silnika (edge wf2-price-engine) — F1 planu.
--
-- Zakres (addytywny, idempotentny):
--   1) wf2_engine_runs        — heartbeat + dziennik decyzji + lifecycle (kind/ok, 1 aktywny run)
--   2) wf2_products           — autonomia + cooldown + rollback-lock + snapshot celu +
--                               kontrakt landingu + rodzina multipaków
--   3) wf2_price_events       — trace run_id / proposal_id (luźne referencje)
--   4) wf2_proposals          — expires_at + kind 'landing_republish'
--   5) wf2_projects           — orders_unmapped_last + shipping_free_threshold (ściana psych)
--   6) wf2_product_daily      — widok agregacji dziennej (security_invoker)
--   7) settings.wf2_price_config → v3.1 (backup v2 + COALESCE kill-switcha + asercje)
--   8) cron wf2-price-engine  — */10 min, pg_net + Vault, timeout 350 s
--
-- ⚠ NIE dotykamy: kolumny unit_profit (GENERATED — price NULL → NULL) ani tabel tpay.
-- ⚠ RLS: WYŁĄCZNIE team_members (ZERO polityk anon — portal klienta idzie edge'em).
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1) wf2_engine_runs — heartbeat + dziennik decyzji + lifecycle (P10) ─────
-- kind: 'decision' (pętla dzienna), 'sweep' (dokończenia co 10 min), 'manual'
-- (uruchomienie z panelu). ok: ustawiane na końcu UDANEGO przebiegu — NULL/false
-- = crash (nie blokuje ponowienia; chronią atomic claim + dedup kart).
CREATE TABLE IF NOT EXISTS public.wf2_engine_runs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at         timestamptz NOT NULL DEFAULT now(),
  finished_at        timestamptz,                          -- NULL = run w toku
  kind               text NOT NULL CHECK (kind IN ('decision','sweep','manual')),
  trigger            text NOT NULL DEFAULT 'cron',          -- 'cron'|'manual': źródło wywołania (kind='decision' gubi ślad manual)
  dry_run            boolean NOT NULL DEFAULT true,         -- FAIL-CLOSED domyślnie
  ok                 boolean,                               -- NULL/false = crash / stale
  products_evaluated integer NOT NULL DEFAULT 0,
  actions_executed   integer NOT NULL DEFAULT 0,
  cards_created      integer NOT NULL DEFAULT 0,
  errors             jsonb   NOT NULL DEFAULT '[]'::jsonb,
  decisions          jsonb   NOT NULL DEFAULT '[]'::jsonb,  -- [{product_id,phase,action,reason_pl,metrics,delta_revenue_zl}]
  note               text
);

-- JEDEN aktywny run naraz: unikat na wyrażeniu-stałej ograniczony do runów w toku.
-- INSERT łapiący unique-violation → funkcja zwraca 200 {already_running}, nie 500.
CREATE UNIQUE INDEX IF NOT EXISTS wf2_engine_runs_one_active
  ON public.wf2_engine_runs ((1)) WHERE finished_at IS NULL;

CREATE INDEX IF NOT EXISTS wf2_engine_runs_kind_started_idx
  ON public.wf2_engine_runs (kind, started_at DESC);

ALTER TABLE public.wf2_engine_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wf2_engine_runs_team_all ON public.wf2_engine_runs;
CREATE POLICY wf2_engine_runs_team_all ON public.wf2_engine_runs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()));

COMMENT ON TABLE public.wf2_engine_runs IS
  'CENY 3.0: heartbeat + dziennik decyzji silnika wf2-price-engine (kind/ok lifecycle; 1 aktywny run). CENNIK-PLAN.md §5.1.';

-- ── 2) wf2_products — stan cyklu cenowego CENY 3.0 (§5.1 pkt 2) ─────────────
ALTER TABLE public.wf2_products
  ADD COLUMN IF NOT EXISTS pricing_autonomy       text NOT NULL DEFAULT 'propose',  -- 'auto'|'propose'|'off'
  ADD COLUMN IF NOT EXISTS last_price_change_at    timestamptz,                      -- denormalizacja cooldownu
  ADD COLUMN IF NOT EXISTS platform_apply_after    timestamptz,                      -- odroczenie set_price o cache_grace
  ADD COLUMN IF NOT EXISTS rollback_lock_until      timestamptz,                     -- P2: blokada re-podwyżki po collapse
  ADD COLUMN IF NOT EXISTS target_snapshot          jsonb,                           -- P5: {target, first_seen} — stabilność celu
  ADD COLUMN IF NOT EXISTS landing_price_contract   text NOT NULL DEFAULT 'legacy',  -- P19: 'hydrated'|'legacy'|'none'
  ADD COLUMN IF NOT EXISTS parent_product_id        uuid REFERENCES public.wf2_products(id) ON DELETE SET NULL;  -- P20: rodzina multipaków (NULL=baza)

-- CHECK-i osobno (wzorzec 20260719 — idempotentne przez duplicate_object)
DO $$ BEGIN
  ALTER TABLE public.wf2_products
    ADD CONSTRAINT wf2_products_pricing_autonomy_chk
    CHECK (pricing_autonomy IN ('auto','propose','off'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.wf2_products
    ADD CONSTRAINT wf2_products_landing_contract_chk
    CHECK (landing_price_contract IN ('hydrated','legacy','none'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Backfill last_price_change_at: ostatnia realna zmiana ceny z historii (applied/confirmed).
-- Tylko tam, gdzie kolumna jeszcze pusta (idempotentne — nie nadpisuje późniejszych zapisów silnika).
UPDATE public.wf2_products p
   SET last_price_change_at = e.max_at
  FROM (
         SELECT product_id, max(at) AS max_at
           FROM public.wf2_price_events
          WHERE status IN ('applied','confirmed')
          GROUP BY product_id
       ) e
 WHERE e.product_id = p.id
   AND p.last_price_change_at IS NULL;

-- ── 3) wf2_price_events — trace karta→event / run→event (luźne referencje) ──
-- Bez twardych FK (run i proposal mogą być czyszczone niezależnie); index na run_id.
ALTER TABLE public.wf2_price_events
  ADD COLUMN IF NOT EXISTS run_id      uuid,
  ADD COLUMN IF NOT EXISTS proposal_id uuid;
CREATE INDEX IF NOT EXISTS wf2_price_events_run_idx
  ON public.wf2_price_events(run_id) WHERE run_id IS NOT NULL;

-- ── 4) wf2_proposals — expires_at + kind 'landing_republish' (P19, P24) ────
-- expires_at NULL = karta nie wygasa (winner_reco — eskalacja WIZUALNA w panelu).
ALTER TABLE public.wf2_proposals
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Rozszerz CHECK kind o 'landing_republish'. Inline CHECK z 20260719 nazywa się
-- wf2_proposals_kind_check; drop obu możliwych nazw → dodaj pełną listę.
ALTER TABLE public.wf2_proposals DROP CONSTRAINT IF EXISTS wf2_proposals_kind_check;
ALTER TABLE public.wf2_proposals DROP CONSTRAINT IF EXISTS wf2_proposals_kind_chk;
ALTER TABLE public.wf2_proposals
  ADD CONSTRAINT wf2_proposals_kind_chk CHECK (kind IN (
    'winner_reco','price_scale','price_opt_over_ceiling','rollback',
    'campaign_kill','creative_refresh','budget_scale','budget_realloc',
    'manual_price_platform','landing_republish'
  ));

-- ── 5) wf2_projects — DQ unmapped + próg darmowej dostawy (P12, P21) ────────
ALTER TABLE public.wf2_projects
  ADD COLUMN IF NOT EXISTS orders_unmapped_last    integer NOT NULL DEFAULT 0,  -- wf2-orders-sync liczy; rosnące = pauza DQ (NIE rollback)
  ADD COLUMN IF NOT EXISTS shipping_free_threshold numeric(10,2);               -- ręcznie; przecięcie = ściana psych → KARTA

-- ── 6) Widok wf2_product_daily — agregacja per produkt × dzień (§5.1 pkt 7) ─
-- security_invoker=true → RLS tabel bazowych (team_members) egzekwowana prawami
-- pytającego. spend/impr/clicks/purchases/frequency z ad_stats level='campaign'
-- (anty-podwójne liczenie — CENNIK-PLAN §2b); orders/revenue + paid z wf2_sales.
-- Źródło sprzedaży = source IN ('takedrop','platform') za §5.1 pkt 7 (live Trevio
-- pisze source='platform' — patrz 20260715b; filtr wyłącznie 'takedrop' byłby ślepy
-- na dane produkcyjne). FULL OUTER JOIN po (product_id, date) — produkt może mieć
-- spend bez sprzedaży i sprzedaż bez spendu tego dnia.
DROP VIEW IF EXISTS public.wf2_product_daily;
CREATE VIEW public.wf2_product_daily
  WITH (security_invoker = true) AS
WITH ads AS (
  SELECT product_id,
         date,
         COALESCE(sum(spend), 0)       AS spend,
         COALESCE(sum(impressions), 0) AS impressions,
         COALESCE(sum(clicks), 0)      AS clicks,
         COALESCE(sum(purchases), 0)   AS purchases,
         COALESCE(max(frequency), 0)   AS frequency
    FROM public.wf2_ad_stats
   WHERE level = 'campaign'
     AND product_id IS NOT NULL
   GROUP BY product_id, date
),
sales AS (
  SELECT product_id,
         date,
         COALESCE(sum(orders), 0)       AS orders,
         COALESCE(sum(revenue), 0)      AS revenue,
         COALESCE(sum(orders_paid), 0)  AS orders_paid,
         COALESCE(sum(revenue_paid), 0) AS revenue_paid
    FROM public.wf2_sales
   WHERE source IN ('takedrop','platform')
     AND product_id IS NOT NULL
   GROUP BY product_id, date
)
SELECT COALESCE(a.product_id, s.product_id)   AS product_id,
       COALESCE(a.date, s.date)               AS date,
       COALESCE(a.spend, 0)                    AS spend,
       COALESCE(a.impressions, 0)              AS impressions,
       COALESCE(a.clicks, 0)                   AS clicks,
       COALESCE(a.purchases, 0)                AS purchases,
       COALESCE(a.frequency, 0)                AS frequency,
       COALESCE(s.orders, 0)                   AS orders,
       COALESCE(s.revenue, 0)                  AS revenue,
       COALESCE(s.orders_paid, 0)              AS orders_paid,
       COALESCE(s.revenue_paid, 0)             AS revenue_paid
  FROM ads a
  FULL OUTER JOIN sales s
    ON a.product_id = s.product_id
   AND a.date = s.date;

COMMENT ON VIEW public.wf2_product_daily IS
  'CENY 3.0: agregacja dzienna per produkt (spend z ad_stats campaign-level ⋈ sprzedaż z wf2_sales takedrop). CENNIK-PLAN.md §5.1 pkt 7.';

-- ── 7) settings.wf2_price_config → v3.1 (P8) ───────────────────────────────
-- (a) backup starej wartości (raz — ON CONFLICT DO NOTHING zachowuje oryginał v2).
INSERT INTO public.settings (key, value)
SELECT 'wf2_price_config_backup_v2', value
  FROM public.settings WHERE key = 'wf2_price_config'
ON CONFLICT (key) DO NOTHING;

-- Guard czytelny: config musi istnieć (seed z 20260719_wf2_cennik). Standalone-apply
-- bez niego = STOP z jasnym komunikatem (zamiast kryptycznej asercji niżej).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.settings WHERE key = 'wf2_price_config') THEN
    RAISE EXCEPTION 'settings.wf2_price_config nie istnieje — zaaplikuj najpierw 20260719_wf2_cennik.sql';
  END IF;
END $$;

-- (b) UPDATE na pełny JSON v3.1 (§8 KANONICZNE) z PRZENIESIENIEM kill-switcha:
-- engine_enabled/dry_run brane z ISTNIEJĄCEJ wartości (COALESCE do bezpiecznych
-- defaultów). value = TEXT → parsujemy nowy JSON (::jsonb), podmieniamy dwa klucze
-- (jsonb_set), zapisujemy z powrotem (::text). Klucze DEPRECATED pominięte (silnik
-- czyta wyłącznie kanoniczne v3.1).
UPDATE public.settings AS s
   SET value = jsonb_set(
                 jsonb_set(
                   $json${
  "config_version": "3.1",
  "engine_enabled": false,
  "dry_run": true,
  "autonomy_default": "propose",
  "pilot_project_ids": ["baacc66f-3dd0-462a-9799-de9c7aaea639"],
  "decision_hour": 7,
  "no_raise_weekdays": [4, 5],

  "winner_orders": 3,
  "winner_spend": 300,
  "winner_needs_cp2": true,
  "cp2_atc_rate": 5.0,
  "cp2_cost_atc_max": 12,
  "winner_high_confidence_orders": 5,
  "winner_orders_no_ads": 5,
  "min_prepaid_orders": 1,

  "ramp_orders": 3,
  "ramp_spend": 150,
  "ramp_hold_days": 7,
  "ramp_wall_snap": true,
  "walls": [100, 150],

  "collapse_quantile": 0.10,
  "collapse_baseline_days": 7,
  "collapse_min_spend": 150,
  "collapse_max_days": 5,
  "collapse_min_expected": 5,
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

  "market_gap_flag": 0.75,
  "cooldown_days": 7,
  "min_margin_floor_pct": 5,
  "anomaly_min_orders": 12,
  "anomaly_window_days": 14,
  "cache_grace_min": 6,
  "max_price_changes_per_run": 5,
  "decision_ttl_days": 14,
  "proposal_ttl_days": 7,
  "paid_definition": "synced",
  "client_price_consent": "notify"
}$json$::jsonb,
                   '{engine_enabled}',
                   to_jsonb( COALESCE( (s.value::jsonb ->> 'engine_enabled')::boolean, false ) )
                 ),
                 '{dry_run}',
                 to_jsonb( COALESCE( (s.value::jsonb ->> 'dry_run')::boolean, true ) )
               )::text
 WHERE s.key = 'wf2_price_config';

-- (c) Asercje fail-fast po UPDATE:
--   • TWARDO: config_version = '3.1' i contribution_keep_frac = 0.80 (kanon musi się zgadzać).
--   • kill-switch (engine_enabled/dry_run): NIE zakładamy false/true na sztywno —
--     weryfikujemy, że zostały WIERNIE przeniesione ze starego configu (backup v2).
--     Gdyby ktoś włączył engine_enabled=true w starym seedzie, COALESCE go przeniósł
--     i porównanie do backupu też przejdzie (a twarde false FAILOWAŁOBY błędnie).
DO $$
DECLARE
  v_new        jsonb;
  v_old        jsonb;
  v_new_engine boolean;
  v_new_dry    boolean;
  v_exp_engine boolean;
  v_exp_dry    boolean;
BEGIN
  SELECT value::jsonb INTO v_new FROM public.settings WHERE key = 'wf2_price_config';
  SELECT value::jsonb INTO v_old FROM public.settings WHERE key = 'wf2_price_config_backup_v2';

  IF (v_new ->> 'config_version') IS DISTINCT FROM '3.1' THEN
    RAISE EXCEPTION 'wf2_price_config: config_version != 3.1 (jest %)', v_new ->> 'config_version';
  END IF;

  IF (v_new ->> 'contribution_keep_frac')::numeric IS DISTINCT FROM 0.80 THEN
    RAISE EXCEPTION 'wf2_price_config: contribution_keep_frac != 0.80 (jest %)', v_new ->> 'contribution_keep_frac';
  END IF;

  v_new_engine := COALESCE((v_new ->> 'engine_enabled')::boolean, false);
  v_new_dry    := COALESCE((v_new ->> 'dry_run')::boolean, true);
  v_exp_engine := COALESCE((v_old ->> 'engine_enabled')::boolean, false);
  v_exp_dry    := COALESCE((v_old ->> 'dry_run')::boolean, true);

  IF v_new_engine IS DISTINCT FROM v_exp_engine THEN
    RAISE EXCEPTION 'wf2_price_config: engine_enabled (%) != wartość przeniesiona ze starego configu (%)',
      v_new_engine, v_exp_engine;
  END IF;

  IF v_new_dry IS DISTINCT FROM v_exp_dry THEN
    RAISE EXCEPTION 'wf2_price_config: dry_run (%) != wartość przeniesiona ze starego configu (%)',
      v_new_dry, v_exp_dry;
  END IF;
END $$;

-- ── 8) Cron wf2-price-engine — */10 min (P11) ──────────────────────────────
-- Sweep (co wywołanie) + decyzje (raz dziennie, gate decision_hour w kodzie).
-- Auth do edge = nagłówek x-wf2-secret (env WF2_GEN_SECRET; Vault name 'wf2_gen_secret',
-- ten sam co wf2-orders-sync). pg_net domyślny timeout = 5 s! → timeout_milliseconds
-- 350000 (350 s) z zapasem ponad wewnętrzny deadline funkcji (300 s).
--
-- WYMAGANE PRZED APLIKACJĄ (raz, spoza migracji — sekret NIE trafia do repo):
--   SELECT vault.create_secret('<WF2_GEN_SECRET>', 'wf2_gen_secret', '...');   -- jeśli nie istnieje
--   (istnieje już z 20260718b_wf2_orders_cron — ta sama wartość).

-- Sanity: sekret musi istnieć i być niepusty (inaczej cron dostanie 403 z funkcji).
DO $$
DECLARE v_secret text;
BEGIN
    SELECT decrypted_secret INTO v_secret
      FROM vault.decrypted_secrets WHERE name = 'wf2_gen_secret';
    IF v_secret IS NULL OR length(v_secret) < 16 THEN
        RAISE EXCEPTION 'Vault secret "wf2_gen_secret" missing/too short. '
                        'Run vault.create_secret(<WF2_GEN_SECRET>, ''wf2_gen_secret'', ...) first.';
    END IF;
END $$;

-- Idempotencja: usuń istniejący job przed założeniem nowego.
DO $$ BEGIN PERFORM cron.unschedule('wf2-price-engine');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule wf2-price-engine'; END $$;

SELECT cron.schedule(
    'wf2-price-engine',
    '*/10 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-price-engine',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-wf2-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'wf2_gen_secret')
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- ══════════════════════════════════════════════════════════════════════════
-- Po aplikacji zweryfikuj:
--   1) Tabela + unikat aktywnego runu:
--      SELECT to_regclass('public.wf2_engine_runs');
--      SELECT indexdef FROM pg_indexes WHERE indexname = 'wf2_engine_runs_one_active';
--   2) Kolumny wf2_products (7 nowych):
--      SELECT column_name FROM information_schema.columns
--       WHERE table_name='wf2_products'
--         AND column_name IN ('pricing_autonomy','last_price_change_at','platform_apply_after',
--             'rollback_lock_until','target_snapshot','landing_price_contract','parent_product_id');
--   3) CHECK kind proposals zawiera 'landing_republish':
--      SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname='wf2_proposals_kind_chk';
--   4) Widok działa i respektuje RLS (security_invoker):
--      SELECT count(*) FROM public.wf2_product_daily;
--      SELECT reloptions FROM pg_class WHERE relname='wf2_product_daily';  -- {security_invoker=true}
--   5) Config v3.1 (kill-switch FAIL-CLOSED):
--      SELECT value::jsonb->>'config_version', value::jsonb->>'engine_enabled',
--             value::jsonb->>'dry_run', value::jsonb->>'contribution_keep_frac'
--        FROM public.settings WHERE key='wf2_price_config';   -- 3.1 / false / true / 0.80
--      SELECT key FROM public.settings WHERE key='wf2_price_config_backup_v2';  -- backup istnieje
--   6) Cron:
--      SELECT jobname, schedule FROM cron.job WHERE jobname='wf2-price-engine';  -- */10 * * * *
--      SELECT status, return_message, start_time FROM cron.job_run_details
--        WHERE jobname='wf2-price-engine' ORDER BY start_time DESC LIMIT 5;
--   7) Deploy edge wf2-price-engine PRZED pierwszym tickiem crona (inaczej 404 w job_run_details —
--      nieszkodliwe: engine_enabled=false, dry_run=true = FAIL-CLOSED do czasu wdrożenia F2).
-- ══════════════════════════════════════════════════════════════════════════
