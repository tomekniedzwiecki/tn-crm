-- Atomowe locki generacji artefaktów (plan/raport/landing): reload strony
-- w trakcie generacji odpalał DUPLIKATY (test 2026-06-12: raport ×3 po $0.85,
-- landing ×3 po ~$0.55). Claim = wpis timestampu w gen_locks, jeśli klucza
-- brak albo starszy niż TTL; konkurencyjne wywołanie dostaje false → 202 pending.
-- Zaaplikowane przez MCP 2026-06-12.
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS gen_locks jsonb DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.spar_claim_lock(p_session uuid, p_key text, p_ttl_sec int)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE spar_sessions
  SET gen_locks = COALESCE(gen_locks, '{}'::jsonb) || jsonb_build_object(p_key, now()::text)
  WHERE id = p_session
    AND (gen_locks->>p_key IS NULL OR (gen_locks->>p_key)::timestamptz < now() - make_interval(secs => p_ttl_sec))
  RETURNING true;
$$;

CREATE OR REPLACE FUNCTION public.spar_release_lock(p_session uuid, p_key text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE spar_sessions
  SET gen_locks = COALESCE(gen_locks, '{}'::jsonb) - p_key
  WHERE id = p_session
  RETURNING true;
$$;
