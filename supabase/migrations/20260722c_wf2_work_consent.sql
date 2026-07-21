-- ============================================================================
-- BRAMKA ZGODY KONSUMENCKIEJ — żądanie rozpoczęcia prac przed upływem 14 dni
-- Plan: docs/zbuduje/prawne-usluga/BRAMKA-ZGODY-PORTAL-PLAN.md
-- Podstawa prawna: art. 15 ust. 3, art. 21 ust. 2, art. 35, art. 38 ust. 1 pkt 1 i 13 UoPK.
--
-- Zasada: prace nad projektem NIE ruszają, dopóki klient nie złoży żądania
-- rozpoczęcia prac (checkbox w portalu → work_consent_at + automatyczny e-mail
-- = trwały nośnik). Do tego czasu klient może odstąpić i odzyskać całą wpłatę.
--
-- Kolumny:
--   work_consent_at      — moment złożenia żądania (NULL = bramka aktywna)
--   work_consent_version — wersja treści oświadczenia (np. 'v1-2026-07-21', 'pre-regulamin')
--   work_consent_text    — snapshot pełnej treści oświadczenia (trwały ślad)
--   work_consent_source  — skąd: 'portal' | 'checkout' | 'pre-regulamin'
--   customer_nip         — NIP klienta (kopia z orders; wariantowanie treści dla firm)
--   customer_company     — nazwa firmy klienta (kopia z orders)
-- ============================================================================

ALTER TABLE public.wf2_projects ADD COLUMN IF NOT EXISTS work_consent_at      timestamptz;
ALTER TABLE public.wf2_projects ADD COLUMN IF NOT EXISTS work_consent_version text;
ALTER TABLE public.wf2_projects ADD COLUMN IF NOT EXISTS work_consent_text    text;
ALTER TABLE public.wf2_projects ADD COLUMN IF NOT EXISTS work_consent_source  text;
ALTER TABLE public.wf2_projects ADD COLUMN IF NOT EXISTS customer_nip         text;
ALTER TABLE public.wf2_projects ADD COLUMN IF NOT EXISTS customer_company     text;

-- CHECK na źródło zgody (dopuszcza NULL = brak zgody). Drop+recreate = migracja idempotentna
-- i bezpieczna przy poszerzeniu zbioru wartości (dodano 'wait14' — klient woli poczekać 14 dni).
ALTER TABLE public.wf2_projects DROP CONSTRAINT IF EXISTS wf2_projects_work_consent_source_chk;
ALTER TABLE public.wf2_projects
  ADD CONSTRAINT wf2_projects_work_consent_source_chk
  CHECK (work_consent_source IS NULL OR work_consent_source IN ('portal','checkout','pre-regulamin','wait14'));

-- Dowody zgody (art. 21 ust. 2): IP + user-agent w logu aktywności. wf2_activities.meta
-- = jsonb (default {}), reszta wpisów działa bez zmian (kolumna dopisywana z domyślną).
ALTER TABLE public.wf2_activities ADD COLUMN IF NOT EXISTS meta jsonb NOT NULL DEFAULT '{}'::jsonb;
COMMENT ON COLUMN public.wf2_activities.meta IS 'Metadane wpisu (np. dowody zgody: {ip, ua, choice, version}).';

COMMENT ON COLUMN public.wf2_projects.work_consent_at      IS 'Żądanie rozpoczęcia prac przed upływem 14-dniowego terminu odstąpienia (NULL = bramka aktywna, prace wstrzymane).';
COMMENT ON COLUMN public.wf2_projects.work_consent_version IS 'Wersja treści oświadczenia zgody (np. v1-2026-07-21; pre-regulamin = grandfathering).';
COMMENT ON COLUMN public.wf2_projects.work_consent_text    IS 'Snapshot pełnej treści oświadczenia w chwili zgody (trwały ślad).';
COMMENT ON COLUMN public.wf2_projects.work_consent_source  IS 'Źródło/decyzja: portal (checkbox w /twoj-biznes) | checkout (kasa) | pre-regulamin (grandfathering) | wait14 (klient woli poczekać do upływu 14 dni — work_consent_at pozostaje NULL).';

-- ── BACKFILL 1: grandfathering — projekty z pracami JUŻ w toku sprzed wdrożenia ──
-- Bramka nie może zablokować klientów, u których fabryka już coś zrobiła. Kryterium:
-- projekt NIE-testowy z co najmniej jednym krokiem done/in_progress POZA krokiem 'wybor'
-- (sam 'wybor' = dopiero kompletowanie portfela, prace jeszcze nie ruszyły).
UPDATE public.wf2_projects p
   SET work_consent_at      = now(),
       work_consent_version = 'pre-regulamin',
       work_consent_source  = 'pre-regulamin',
       work_consent_text    = 'Grandfathering — prace nad projektem rozpoczęto przed wdrożeniem bramki zgody konsumenckiej (21.07.2026). Zgoda uznana za dorozumianą z faktu prowadzenia realizacji.'
 WHERE p.work_consent_at IS NULL
   AND p.is_test = false
   AND p.created_at < now()
   AND EXISTS (
     SELECT 1 FROM public.wf2_steps s
      WHERE s.project_id = p.id
        AND s.status IN ('done','in_progress')
        AND s.step_key <> 'wybor'
   );

-- ── BACKFILL 2: kopia NIP / nazwy firmy z zamówienia rezerwacji ──
-- Źródło: orders.customer_nip / orders.customer_company po reservation_order_id.
UPDATE public.wf2_projects p
   SET customer_nip     = COALESCE(p.customer_nip, o.customer_nip),
       customer_company = COALESCE(p.customer_company, o.customer_company)
  FROM public.orders o
 WHERE p.reservation_order_id = o.id
   AND (
     (p.customer_nip     IS NULL AND o.customer_nip     IS NOT NULL) OR
     (p.customer_company IS NULL AND o.customer_company IS NOT NULL)
   );
