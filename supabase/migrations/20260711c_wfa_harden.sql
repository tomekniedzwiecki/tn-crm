-- ============================================================================
-- WFA hardening (findings z security advisors, 2026-07-11):
-- 1) SECURITY DEFINER funkcje wfa_* były wykonywalne przez anon/PUBLIC i KAŻDEGO
--    authenticated (na tym Supabase logują się też klienci sparingu!) — pułapka
--    „authenticated ≠ admin". REVOKE + wewnętrzny gate team_members
--    (auth.uid() IS NULL = kontekst service_role/cron → przepuszczamy,
--    wzorzec „owner-gate przepuszcza service-role").
-- 2) wfa_touch_updated_at: mutable search_path (WARN advisora).
-- ============================================================================

ALTER FUNCTION public.wfa_touch_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.wfa_ensure_steps(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.wfa_sync_projects() FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.wfa_ensure_steps(p_project uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO wfa_steps (project_id, step_key)
  SELECT p_project, d.key FROM wfa_step_defs d
  WHERE d.active
    AND NOT EXISTS (SELECT 1 FROM wfa_steps s
                    WHERE s.project_id = p_project AND s.step_key = d.key);
END $$;

CREATE OR REPLACE FUNCTION public.wfa_sync_projects() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
  created integer := 0;
  new_id uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  FOR r IN
    SELECT ss.id, ss.name, ss.email, ss.phone, ss.lead_id
    FROM spar_sessions ss
    WHERE ss.full_paid_at IS NOT NULL
      AND COALESCE(ss.is_test, false) = false
      AND NOT EXISTS (SELECT 1 FROM wfa_projects p WHERE p.spar_session_id = ss.id)
  LOOP
    INSERT INTO wfa_projects (name, customer_name, customer_email, customer_phone, lead_id, spar_session_id)
    VALUES ('', r.name, r.email, r.phone, r.lead_id, r.id)
    RETURNING id INTO new_id;
    PERFORM wfa_ensure_steps(new_id);
    INSERT INTO wfa_activities (project_id, actor, action, description)
    VALUES (new_id, 'auto', 'project_created', 'Auto-sync z spar_sessions (pełna płatność)');
    created := created + 1;
  END LOOP;
  RETURN created;
END $$;
