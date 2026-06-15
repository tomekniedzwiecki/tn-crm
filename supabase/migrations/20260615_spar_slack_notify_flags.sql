-- =====================================================================
-- Powiadomienia Slack dla lejka Sparing/Aplikacja (#sparing)
-- =====================================================================
-- Dwa znaczniki dedup na sesji sparingu — żeby każde powiadomienie poszło
-- na #sparing DOKŁADNIE RAZ, mimo że spar-chat może wielokrotnie trafić w te
-- same warunki (kontakt dopisywany w wielu turach; zielony werdykt pada przez
-- kilka kolejnych tur). spar-chat stempluje kolumnę warunkowo
-- (UPDATE ... WHERE col IS NULL) i wysyła powiadomienie tylko, gdy wygrał
-- wyścig (zwrócony wiersz) — to domyka też równoległe requesty.
--
--   slack_contact_notified_at — lead zostawił JEDNOCZEŚNIE e-mail i telefon
--   slack_green_notified_at   — sesja dostała werdykt „zielony"
-- =====================================================================

ALTER TABLE public.spar_sessions
  ADD COLUMN IF NOT EXISTS slack_contact_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS slack_green_notified_at   timestamptz;

COMMENT ON COLUMN public.spar_sessions.slack_contact_notified_at IS
  'Kiedy wysłano powiadomienie #sparing o pełnym kontakcie (e-mail + telefon). Dedup w spar-chat.';
COMMENT ON COLUMN public.spar_sessions.slack_green_notified_at IS
  'Kiedy wysłano powiadomienie #sparing o zielonym werdykcie. Dedup w spar-chat.';
