-- 20260724b_wf2_consent_old.sql
-- Klienci OLD (przeniesieni z TN Workflow 1) — AUTOMATYCZNA akceptacja realizacji zlecenia.
-- Decyzja Tomka (24.07.2026): OLD NIE przechodzą bramki 14-dniowego terminu odstąpienia
-- (realizacja uzgodniona w ramach wcześniejszej współpracy = grandfathering). Ustawiamy
-- work_consent_at, dzięki czemu bramka zgody nie pokazuje się NIGDZIE: ani w portalu klienta
-- (edge wf2-portal: needs_work_consent=false gdy work_consent_at ustawione), ani jako czerwony
-- pasek w panelu, ani jako blokada startu fabryki. Nowe źródło: 'old-workflow1'.
-- Idempotentne (drop+recreate CHECK; backfill tylko gdy work_consent_at IS NULL).

ALTER TABLE public.wf2_projects DROP CONSTRAINT IF EXISTS wf2_projects_work_consent_source_chk;
ALTER TABLE public.wf2_projects
  ADD CONSTRAINT wf2_projects_work_consent_source_chk
  CHECK (work_consent_source IS NULL OR work_consent_source IN
    ('portal','checkout','pre-regulamin','wait14','b2b-nip','old-workflow1'));

COMMENT ON COLUMN public.wf2_projects.work_consent_source IS
  'Źródło/decyzja: portal | checkout | pre-regulamin (grandfathering) | wait14 (testowe) | b2b-nip (zakup na firmę) | old-workflow1 (klient z Workflow 1 — auto-akcept realizacji, bramka 14 dni pominięta).';

-- Backfill: wszyscy OLD bez zgody = auto-akcept realizacji (grandfathering Workflow 1).
UPDATE public.wf2_projects
   SET work_consent_at      = now(),
       work_consent_version = 'old-workflow1',
       work_consent_source  = 'old-workflow1',
       work_consent_text    = 'Klient przeniesiony z TN Workflow 1 — realizacja zlecenia uzgodniona w ramach wcześniejszej współpracy; bramka 14-dniowego terminu odstąpienia pominięta (decyzja Tomka, 24.07.2026).'
 WHERE is_old = true
   AND work_consent_at IS NULL;
