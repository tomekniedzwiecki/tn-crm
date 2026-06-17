-- 2026-06-17 — Avatary Google w panelu tn-aplikacje
-- Panel czyta spar_sessions przez PostgREST i NIE ma dostępu do auth.users,
-- gdzie OAuth Google trzyma avatar (raw_user_meta_data->>'avatar_url').
-- Udostępniamy je przez RPC SECURITY DEFINER zawężone do zespołu (team_members),
-- żeby nie wystawiać auth.users publicznie. Zwraca tylko konta z Google + avatarem.
CREATE OR REPLACE FUNCTION public.spar_session_avatars()
RETURNS TABLE(auth_user_id uuid, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- twardy strażnik: tylko zalogowany członek zespołu dostaje cokolwiek
  IF NOT EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid()) THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT DISTINCT s.auth_user_id, (u.raw_user_meta_data->>'avatar_url')
    FROM public.spar_sessions s
    JOIN auth.users u ON u.id = s.auth_user_id
    WHERE s.auth_provider = 'google'
      AND (u.raw_user_meta_data->>'avatar_url') IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.spar_session_avatars() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spar_session_avatars() TO authenticated;
