-- 20260722s_wfa_lifecycle.sql
-- Lustro 20260721_wf2_lifecycle.sql dla TN App: osobny wymiar "stan cyklu życia"
-- projektu aplikacji — NIEZALEŻNY od pipeline `status`
-- (fundament|infrastruktura|budowa|jakosc|start|stery|zamkniety). `status` = gdzie
-- w procesie jest projekt; `lifecycle` = czy jest aktywny/wstrzymany/anulowany/zakończony.
-- Idempotentne (ADD COLUMN IF NOT EXISTS).

ALTER TABLE public.wfa_projects
  ADD COLUMN IF NOT EXISTS lifecycle text NOT NULL DEFAULT 'active'
  CHECK (lifecycle IN ('active','paused','cancelled','completed'));

-- Backfill: projekty w pipeline-statusie "zamkniety" = zakończone.
UPDATE public.wfa_projects SET lifecycle = 'completed' WHERE status = 'zamkniety';
