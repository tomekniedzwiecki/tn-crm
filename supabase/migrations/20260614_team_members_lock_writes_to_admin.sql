-- 2026-06-14 — KRYTYCZNE: team_members — zapis tylko dla admina.
-- team_members_insert mial WITH CHECK(true) dla authenticated → po otwarciu
-- publicznej rejestracji KAZDY user mogl dopisac SIEBIE jako 'admin' i przejac
-- caly CRM (caly model dostepu opiera sie na team_members). team_members_update
-- mial USING(true). Zawezamy INSERT/UPDATE/DELETE do istniejacego ADMINA.
-- is_team_admin() = SECURITY DEFINER (czyta team_members z pominieciem RLS →
-- brak rekurencji). Zweryfikowane: atak (non-admin INSERT) → RLS blokuje;
-- admin (Tomek) → przechodzi; manager (Maciej) → zablokowany (tylko rola admin).
CREATE OR REPLACE FUNCTION public.is_team_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin');
$$;
REVOKE EXECUTE ON FUNCTION public.is_team_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_team_admin() TO authenticated;

ALTER POLICY team_members_insert ON public.team_members WITH CHECK (public.is_team_admin());
ALTER POLICY team_members_update ON public.team_members USING (public.is_team_admin()) WITH CHECK (public.is_team_admin());

DROP POLICY IF EXISTS team_members_delete ON public.team_members;
CREATE POLICY team_members_delete ON public.team_members FOR DELETE TO authenticated USING (public.is_team_admin());
