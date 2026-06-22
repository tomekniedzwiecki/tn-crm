-- =====================================================================
-- Powiadomienie Slack #sparing o gotowym PODGLĄDZIE APLIKACJI (ekrany PNG)
-- =====================================================================
-- Trzeci znacznik dedup na sesji sparingu (obok slack_contact/green_notified_at,
-- migracja 20260615_spar_slack_notify_flags). spar-image stempluje kolumnę
-- warunkowo (UPDATE ... WHERE col IS NULL) w momencie, gdy startowy zestaw
-- ekranów (panel/glowna/dodatkowa/landing) jest kompletny, i wysyła JEDNĄ
-- wiadomość-galerię na #sparing tylko jeśli wygrał wyścig (zwrócony wiersz) —
-- co domyka też 4 równoległe generacje ekranów. Regeneracje/poprawki nie
-- pingują ponownie (kolumna już niepusta).
-- =====================================================================

ALTER TABLE public.spar_sessions
  ADD COLUMN IF NOT EXISTS slack_preview_notified_at timestamptz;

COMMENT ON COLUMN public.spar_sessions.slack_preview_notified_at IS
  'Kiedy wysłano powiadomienie #sparing z galerią ekranów aplikacji (PNG). Dedup w spar-image — raz na sesję, przy kompletnym zestawie startowym.';
