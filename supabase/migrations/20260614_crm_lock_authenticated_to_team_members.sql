-- 2026-06-14 — KRYTYCZNE: domknięcie roli `authenticated` w CRM do zespołu
-- Aplikacja sparingu (tomekniedzwiecki.pl/aplikacja) otworzyła PUBLICZNĄ
-- rejestrację (Google/Facebook/e-mail OTP) na tym samym projekcie Supabase.
-- Tym samym rola `authenticated` przestała oznaczać „admin" — każdy z internetu
-- może ją uzyskać. Wszystkie polityki WYŁĄCZNIE dla `authenticated`
-- z USING(true)/WITH CHECK(true) były odczytem ORAZ zapisem dla dowolnej osoby,
-- która założy konto w sparingu (leady, zamówienia, workflowy, umowy pracowników,
-- WhatsApp itd.). Zawężamy je do członków zespołu (team_members).
-- Admini są w team_members → bez zmian. Portal klienta (anon) i edge functions
-- (service_role) nietknięte. team_members pominięte (rekurencja RLS).
-- Zmiana mechaniczna i odwracalna (ALTER POLICY ... USING (true) cofa).
DO $$
DECLARE
  r record;
  pred text := 'auth.uid() IN (SELECT user_id FROM public.team_members)';
BEGIN
  FOR r IN
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND roles = ARRAY['authenticated']::name[]
      AND tablename NOT LIKE 'spar\_%'
      AND tablename <> 'team_members'
      AND ( btrim(coalesce(qual, '')) IN ('true', '(true)')
         OR btrim(coalesce(with_check, '')) IN ('true', '(true)') )
  LOOP
    IF r.cmd IN ('SELECT', 'DELETE') THEN
      EXECUTE format('ALTER POLICY %I ON public.%I USING (%s)', r.policyname, r.tablename, pred);
    ELSIF r.cmd = 'INSERT' THEN
      EXECUTE format('ALTER POLICY %I ON public.%I WITH CHECK (%s)', r.policyname, r.tablename, pred);
    ELSE  -- UPDATE, ALL
      EXECUTE format('ALTER POLICY %I ON public.%I USING (%s) WITH CHECK (%s)', r.policyname, r.tablename, pred, pred);
    END IF;
  END LOOP;
END $$;
