-- =====================================================================
-- Publiczny podgląd sklepu /sklep — URL w bud_sessions.landing_preview_url
-- =====================================================================
-- landing_html renderuje się publicznie przez wrapper tomekniedzwiecki.pl/sklep/podglad/
-- (fetch → edge function bud-shop-preview → sandboxed iframe). NIE da się serwować HTML
-- wprost z *.supabase.co (Storage ORAZ functions wymuszają content-type text/plain, anty-XSS).
-- bud-landing-gen ustawia landing_preview_url po zapisie landing_html; używa go powiadomienie
-- #sparing (przycisk „Zobacz sklep") i panel tn-sklep (link „Otwórz sklep").
--
-- ⚠️ NIE mylić z landing_url — ta kolumna (legacy bud-landing) bramkuje publiczny feed
-- inspiracji w bud-public-feed (row.landing_url część warunku „complete"), więc NIE można
-- jej reużyć bez efektu ubocznego (auto-publikacja w feedzie).
-- =====================================================================

ALTER TABLE public.bud_sessions
  ADD COLUMN IF NOT EXISTS landing_preview_url text;

COMMENT ON COLUMN public.bud_sessions.landing_preview_url IS
  'Publiczny URL podglądu sklepu (wrapper /sklep/podglad/?sid=). Ustawia bud-landing-gen. NIE mylić z landing_url (bramka publicznego feedu bud-public-feed).';
