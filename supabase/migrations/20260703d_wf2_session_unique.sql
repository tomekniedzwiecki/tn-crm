-- Review 2026-07-03: idempotencja auto-create projektu w tpay-webhook opierała się
-- tylko na SELECT-przed-INSERT — równoległe retry notyfikacji TPay mogłyby utworzyć
-- dwa projekty dla jednej sesji. UNIQUE domyka lukę (drugi INSERT = błąd łapany
-- w try/catch webhooka jako no-op, płatność nietknięta).
CREATE UNIQUE INDEX IF NOT EXISTS wf2_projects_session_uniq
  ON public.wf2_projects(bud_session_id) WHERE bud_session_id IS NOT NULL;
