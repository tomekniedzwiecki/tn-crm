-- =====================================================================
-- Powiadomienia Slack #sparing lejka /sklep: MAKIETY i PROPOZYCJA REZERWACJI
-- =====================================================================
-- Dwa nowe znaczniki dedup na sesji /sklep (obok slack_contact/green/preview/
-- html_notified_at). Każdy stemplowany warunkowo (UPDATE ... WHERE col IS NULL),
-- wysyłka na #sparing tylko gdy request wygrał wyścig (zwrócony wiersz) — raz na sesję.
--
--  * slack_mockups_notified_at  — bud-mockup: 4 makiety sklepu (bud_sessions.mockups)
--    gotowe. WŁASNA kolumna, NIE slack_preview_notified_at (ta jest dla bud-image /
--    nazwanych widoków — inna, legacy ścieżka; obie mogą współistnieć bez kolizji).
--  * slack_reservation_notified_at — bud-chat: bot wystawił kartę <makieta> (jawna
--    propozycja wpłaty zwrotnej rezerwacji 500 zł, po zielonym świetle).
--
-- Kolumna slack_html_notified_at (strona sklepu) już istnieje — bud-landing-gen ją
-- reużywa (w żywym lejku tylko on ją stempluje; legacy bud-landing nieużywany).
-- =====================================================================

ALTER TABLE public.bud_sessions
  ADD COLUMN IF NOT EXISTS slack_mockups_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS slack_reservation_notified_at timestamptz;

COMMENT ON COLUMN public.bud_sessions.slack_mockups_notified_at IS
  'Kiedy wysłano powiadomienie #sparing z galerią makiet sklepu (4 style). Dedup w bud-mockup — raz na sesję.';

COMMENT ON COLUMN public.bud_sessions.slack_reservation_notified_at IS
  'Kiedy wysłano powiadomienie #sparing o propozycji rezerwacji 500 zł (marker <makieta>). Dedup w bud-chat — raz na sesję.';
