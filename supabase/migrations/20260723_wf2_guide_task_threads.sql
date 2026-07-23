-- ============================================================================
-- WF2 — „PRZEWODNIK AI": wątki rozmowy PER ZADANIE (task_key).
-- Defekt v2: historia była JEDNYM wątkiem per projekt → wiadomości z jednego zadania
-- (np. „Konto reklamowe") pokazywały się w innych zadaniach („Strona firmowa", „Twoja firma").
-- Rozwiązanie: znacznik task_key per wiadomość (edge wf2-ads-guide zapisuje go z body.context,
-- a historia/kontekst modelu filtrują po nim). NULL = wiadomości stare/ogólne (sprzed migracji)
-- lub wywołania bez task_key (np. panel admina czyta całość). SSOT: ADS-ONBOARDING-LEADSIE.md §14.
-- ============================================================================

ALTER TABLE public.wf2_guide_messages ADD COLUMN IF NOT EXISTS task_key text;

-- Wątek per zadanie: history/transkrypt filtrują (project_id, task_key) w kolejności czasu.
CREATE INDEX IF NOT EXISTS wf2_guide_messages_project_task_created_idx
  ON public.wf2_guide_messages (project_id, task_key, created_at);

COMMENT ON COLUMN public.wf2_guide_messages.task_key IS
  'Wątek zadania czatowego (ads_strona/ads_konto/ads_budzet/firma). NULL = stare/ogólne wiadomości albo wywołania bez task_key (panel admina = pełna historia).';
