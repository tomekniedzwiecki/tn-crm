-- 2026-06-14 — Bezpieczeństwo RLS sparingu (spar_*)
-- Problem: polityki SELECT z USING(true) dla roli authenticated pozwalały
-- KAŻDEMU zalogowanemu (publiczna rejestracja w aplikacji sparingu) odczytać
-- przez PostgREST WSZYSTKIE cudze sesje, wiadomości, uwagi, SMS-y i short-linki,
-- omijając kontrolę własności w edge function spar-project.
-- Fundament: legalne odczyty idą przez edge function (service_role, omija RLS)
-- lub przez polityki admina (team_members). Frontend nie czyta spar_* bezpośrednio.

-- 1) spar_sessions: zalogowany widzi WYŁĄCZNIE własne sesje.
DROP POLICY IF EXISTS spar_sessions_auth_select ON public.spar_sessions;
CREATE POLICY spar_sessions_owner_select ON public.spar_sessions
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- 2) spar_messages: brak bezpośredniego odczytu przez klienta (historia czatu
--    wyłącznie przez edge function z weryfikacją własności). Admin: team_members.
DROP POLICY IF EXISTS spar_messages_auth_select ON public.spar_messages;

-- 3) spar_feedback: jak wyżej.
DROP POLICY IF EXISTS spar_feedback_auth_select ON public.spar_feedback;

-- 4) spar_sms: numery telefonów — tylko zespół.
DROP POLICY IF EXISTS "spar_sms admin read" ON public.spar_sms;
CREATE POLICY spar_sms_admin_read ON public.spar_sms
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));

-- 5) spar_short_links: tylko zespół.
DROP POLICY IF EXISTS "spar_short_links admin read" ON public.spar_short_links;
CREATE POLICY spar_short_links_admin_read ON public.spar_short_links
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));
