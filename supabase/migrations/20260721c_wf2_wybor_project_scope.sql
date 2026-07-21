-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — ETAP 1 „FUNDAMENT SKLEPU": 'wybor' PER-PRODUKT → KROK PROJEKTOWY (2026-07-21)
--
-- Decyzja Tomka (21.07): krok „Wybór produktu" per produkt jest bez sensu — jeśli
-- produkt jest już w portfelu, to wybór z definicji jest dokonany (chip zawsze done).
-- Krok nie niósł żadnej realnej roboty. Przebudowa: 'wybor' staje się krokiem
-- DO ZREALIZOWANIA na poziomie PROJEKTU — fabryka SAMA losuje produkty z całej puli
-- approved (/trendy) RÓWNYMI SZANSAMI (bez scoringu — decyzja 17.07) i od razu dodaje
-- je do portfela. Cel portfela = 3 produkty (decyzja 19.07). Wykonanie: komenda
-- `panel-sync.py wybor <projekt>` domyka krok po dodaniu produktów.
--
-- Skutki dla defs:
--   scope           product → project     (jedna instancja per projekt, product_id IS NULL)
--   label           'Wybór produktu' → 'Wybór produktów'
--   milestone_label NULL → 'Portfel skompletowany — produkty wylosowane z całej puli'
--   stage/sort/owner/icon = bez zmian (Etap 1, sort 5, owner admin).
--
-- Instancje wf2_steps kluczowane po (project_id, step_key, product_id). Zmiana scope
-- OSIEROCA dawne instancje per-produkt (product_id NOT NULL): matryca ich już nie
-- pokaże (krok jest teraz projektowy), a unik projektowy `(project_id, step_key)
-- WHERE product_id IS NULL` ich nie obejmuje — więc je USUWAMY, a wf2_ensure_steps
-- dosiewa instancję projektową.
--
-- BACKFILL (jednorazowy, idempotentny): projekt mający ≥1 produkt w wf2_products =
-- portfel istnieje = wybór zrealizowany → projektowy 'wybor' na 'done'. Projekty bez
-- produktów zostają 'pending' (krok DO ZREALIZOWANIA — czeka na losowanie portfela).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. def 'wybor': product-scope → project-scope + label + kamień milowy ────
UPDATE public.wf2_step_defs
   SET scope           = 'project',
       label           = 'Wybór produktów',
       milestone_label = 'Portfel skompletowany — produkty wylosowane z całej puli'
 WHERE key = 'wybor';

-- ── 2. usuń osierocone instancje per-produkt (scope zmienił się na project) ──
DELETE FROM public.wf2_steps
 WHERE step_key = 'wybor'
   AND product_id IS NOT NULL;

-- ── 3. przesiew instancji dla wszystkich projektów (dosiewa projektowy 'wybor') ─
SELECT public.wf2_ensure_steps(id) FROM public.wf2_projects;

-- ── 4. BACKFILL: projektowy 'wybor' → done tam, gdzie portfel już istnieje ───
UPDATE public.wf2_steps s
   SET status = 'done', completed_at = now(), completed_by = 'backfill'
 WHERE s.step_key = 'wybor'
   AND s.product_id IS NULL
   AND s.status = 'pending'
   AND EXISTS (SELECT 1 FROM public.wf2_products p WHERE p.project_id = s.project_id);
