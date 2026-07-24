-- 20260724_wf2_is_old.sql
-- Flaga „OLD" = klient przeniesiony z TN Workflow v1 (workflows). Osobny, niezależny
-- wymiar od pipeline `status` i od `lifecycle` — mówi WYŁĄCZNIE „to stary klient,
-- obsługiwany w innym tempie niż nowi". Nie wpływa na proces fabryki.
-- Idempotentne (ADD COLUMN IF NOT EXISTS).

ALTER TABLE public.wf2_projects
  ADD COLUMN IF NOT EXISTS is_old boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.wf2_projects.is_old IS
  'Klient przeniesiony z TN Workflow v1 (oznaczenie OLD) — obsługiwany w innym tempie niż nowi. Niezależny od status/lifecycle.';

-- Indeks częściowy — lista projektów filtruje/sortuje po tej fladze (starych jest garść).
CREATE INDEX IF NOT EXISTS wf2_projects_is_old_idx ON public.wf2_projects(is_old) WHERE is_old;
