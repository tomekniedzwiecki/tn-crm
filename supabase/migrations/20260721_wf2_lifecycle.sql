-- 20260721_wf2_lifecycle.sql
-- Osobny wymiar "stan cyklu życia" projektu — NIEZALEŻNY od pipeline `status`
-- (start|budowa|sklep|kampanie|testy|stery|monthly|zamkniety). `status` = gdzie w
-- procesie jest projekt; `lifecycle` = czy jest aktywny/wstrzymany/anulowany/zakończony.
-- Idempotentne (ADD COLUMN IF NOT EXISTS).

ALTER TABLE public.wf2_projects
  ADD COLUMN IF NOT EXISTS lifecycle text NOT NULL DEFAULT 'active'
  CHECK (lifecycle IN ('active','paused','cancelled','completed'));

-- Backfill: projekty w pipeline-statusie "zamkniety" = zakończone.
UPDATE public.wf2_projects SET lifecycle = 'completed' WHERE status = 'zamkniety';
