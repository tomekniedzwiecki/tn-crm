-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — KROK KLIENCKI „Twoja firma" (2026-07-22)
-- Moduł prowadzenia klienta przez założenie działalności gospodarczej
-- (research: docs/zbuduje/FIRMA-KLIENTA.md). Krok owner='client' w Etapie 3,
-- sort 17 = między pl_konto_klient (15) a pl_dane (20) — dane firmy zasilają
-- potem krok „Dane rozliczeniowe" (regulamin/faktury).
--
-- ⛔ STATUS WDROŻENIA: krok jest UKRYTY przed klientami — edge wf2-portal
-- filtruje go poza trybem podglądu admina (PREVIEW_ONLY_STEPS w index.ts).
-- Udostępnienie klientom = decyzja Tomka (usunięcie klucza z tego seta).
--
-- Idempotentne (ON CONFLICT). RLS bez zmian — portal wchodzi przez edge.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.wf2_step_defs
  (key, stage, stage_label, label, icon, sort, owner, scope, milestone_label, instructions_md, active) VALUES
('firma', 3, 'Sklep na platformie', 'Twoja firma', 'ph-buildings', 17,
 'client', 'project', 'Firma zarejestrowana',
 'Prowadzimy klienta przez założenie działalności gospodarczej: przygotowanie (profil zaufany, dane), rejestracja (darmowa asysta księgowego inFakt z linku polecającego — rabat 100 zł — albo samodzielnie na biznes.gov.pl; podpis SKŁADA KLIENT), po rejestracji NIP w portalu + księgowość + dane do kroku „Dane rozliczeniowe". Zero doradztwa podatkowego — decyzje o formie opodatkowania i VAT klient podejmuje z księgowym.',
 true)
ON CONFLICT (key) DO UPDATE SET
  stage           = EXCLUDED.stage,
  stage_label     = EXCLUDED.stage_label,
  label           = EXCLUDED.label,
  icon            = EXCLUDED.icon,
  sort            = EXCLUDED.sort,
  owner           = EXCLUDED.owner,
  scope           = EXCLUDED.scope,
  milestone_label = EXCLUDED.milestone_label,
  instructions_md = EXCLUDED.instructions_md,
  active          = EXCLUDED.active;

-- Dosiew instancji kroku dla wszystkich projektów
SELECT public.wf2_ensure_steps(id) FROM public.wf2_projects;
