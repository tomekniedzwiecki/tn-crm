-- ZAKUP NA FIRMĘ (decyzja Tomka 23.07.2026): NIP w zamówieniu = umowa zawarta w celach
-- zarobkowych — konsumenckie prawo odstąpienia nie ma zastosowania. Edge wf2-portal pomija
-- pełnoekranową bramkę zgody i odnotowuje klasyfikację work_consent_source='b2b-nip'
-- (lazy przy pierwszym wejściu do portalu; to zapis KLASYFIKACJI, nie zgody klienta).
-- Fabryka: source='b2b-nip' = zielone światło do startu prac bez czekania na zgodę/15 dni.

ALTER TABLE public.wf2_projects DROP CONSTRAINT IF EXISTS wf2_projects_work_consent_source_chk;
ALTER TABLE public.wf2_projects
  ADD CONSTRAINT wf2_projects_work_consent_source_chk
  CHECK (work_consent_source IS NULL OR work_consent_source IN ('portal','checkout','pre-regulamin','wait14','b2b-nip'));

COMMENT ON COLUMN public.wf2_projects.work_consent_source IS
  'Źródło/decyzja: portal (checkbox w /twoj-biznes) | checkout (kasa) | pre-regulamin (grandfathering) | wait14 (testowe) | b2b-nip (zakup na firmę — NIP w zamówieniu, bramka konsumencka pominięta).';
