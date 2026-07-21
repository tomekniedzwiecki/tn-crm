-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — ETAP 1 „FUNDAMENT SKLEPU": ROZDZIELENIE KROKU 'wybor' (2026-07-21)
--
-- Decyzja: krok 'wybor' („Wybór + kalkulacja") łączył dwie różne czynności —
-- (1) wybór produktu do portfela i (2) kalkulację ceny (koszt zakupu → narzut
-- 10–15% → akcept drabinki cenowej TEST/SCALE/OPT). To zaciemniało postęp:
-- produkt mógł być wybrany, ale bez zamkniętej kalkulacji, a jeden krok pokazywał
-- „done/pending" dla obu spraw naraz. Rozdzielamy na dwa kroki product-scope:
--   • 'wybor'      (sort 5)  — Wybór produktu (produkt w portfelu = wybór dokonany)
--   • 'kalkulacja' (sort 7)  — Kalkulacja ceny (NOWY; niesie kamień milowy)
-- Kamień „Kalkulacja zaakceptowana — produkt gotowy do fabryki" przechodzi z
-- 'wybor' (gdzie osadził go 20260718f) na nowy krok 'kalkulacja' — bo to on
-- reprezentuje gotowość produktu do fabryki. 'wybor' traci kamień.
--
-- Kolejność w Etapie 1: wybor(5) → kalkulacja(7) → marka(10) → pl_domena(15).
--
-- Instancje wf2_steps są kluczowane po step_key; zmiany label/milestone_label na
-- 'wybor' NIE ruszają stanu instancji. Nowe instancje 'kalkulacja' dosiewa
-- wf2_ensure_steps (CROSS JOIN produkty × defs scope=product, status=pending).
--
-- BACKFILL (jednorazowy, idempotentny):
--   1) 'wybor' → done dla produktów już w portfelu (produkt istnieje = wybór
--      dokonany) — kroki pending, których produkt jest w wf2_products.
--   2) 'kalkulacja' → done + checklista odhaczona dla produktów z zaakceptowaną
--      drabinką cenową (price_ladder->>'accepted_at' IS NOT NULL). Checklista
--      VERBATIM z obiektu WS w tn-sklepy/projekt.html (panel merguje po dokładnym
--      tekście `t` — literówka = sierota).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. NOWY krok 'kalkulacja' (product-scope) — niesie kamień milowy ────────
INSERT INTO public.wf2_step_defs
  (key, stage, stage_label, label, icon, sort, owner, scope, milestone_label, instructions_md) VALUES
('kalkulacja', 1, 'Fundament sklepu', 'Kalkulacja ceny', 'ph-calculator', 7,
 'admin', 'product', 'Kalkulacja zaakceptowana — produkt gotowy do fabryki', NULL)
ON CONFLICT (key) DO UPDATE SET
  stage           = EXCLUDED.stage,
  stage_label     = EXCLUDED.stage_label,
  label           = EXCLUDED.label,
  icon            = EXCLUDED.icon,
  sort            = EXCLUDED.sort,
  owner           = EXCLUDED.owner,
  scope           = EXCLUDED.scope,
  milestone_label = EXCLUDED.milestone_label;

-- ── 2. 'wybor' przestaje być „wyborem + kalkulacją" — sam wybór, bez kamienia ─
UPDATE public.wf2_step_defs
   SET label = 'Wybór produktu', milestone_label = NULL
 WHERE key = 'wybor';

-- ── 3. Przesiew instancji dla wszystkich projektów (idempotentne) ──────────
SELECT public.wf2_ensure_steps(id) FROM public.wf2_projects;

-- ── 4. BACKFILL 1: 'wybor' → done tam, gdzie produkt jest już w portfelu ────
UPDATE public.wf2_steps s
   SET status = 'done', completed_at = now(), completed_by = 'backfill'
 WHERE s.step_key = 'wybor'
   AND s.product_id IS NOT NULL
   AND s.status = 'pending'
   AND EXISTS (SELECT 1 FROM public.wf2_products p WHERE p.id = s.product_id);

-- ── 5. BACKFILL 2: 'kalkulacja' → done + checklista dla zaakceptowanych drabinek ─
UPDATE public.wf2_steps s
   SET status       = 'done',
       completed_at = now(),
       completed_by = 'backfill',
       data = jsonb_set(
         COALESCE(s.data, '{}'::jsonb),
         '{checklist}',
         '[{"t":"Cena zakupu potwierdzona — żywa aukcja (source=detail)","done":true},{"t":"Cena sprzedaży ustalona — narzut 10–15% (cena psychologiczna)","done":true},{"t":"Drabinka cenowa zaakceptowana (TEST→SCALE→OPT)","done":true}]'::jsonb
       )
 WHERE s.step_key = 'kalkulacja'
   AND s.product_id IS NOT NULL
   AND EXISTS (
     SELECT 1 FROM public.wf2_products p
      WHERE p.id = s.product_id
        AND p.price_ladder->>'accepted_at' IS NOT NULL
   );
