-- 20260723g_wfp_suppression.sql — Prospektor: trwała lista wykluczeń (suppression) + higiena adresów.
-- Wynik audytu compliance/deliverability PRZED skalą (3 audyty, 2026-07-23).
--
-- Po co osobna tabela suppression (a nie tylko flaga wfp_prospects.opted_out):
--   * usunięcie prospekta (żądanie art. 17) kasowało wiersz i jedyną „kotwicę" e-maila →
--     ponowny import ożywiał osobę, którą wykluczono. Suppression PRZEŻYWA usunięcie rekordu.
--   * sprzeciw „STOP" z adresu NIEDOPASOWANego do żadnego prospekta (mail poszedł na biuro@,
--     odpowiada Jan z gmaila) nie miał gdzie wylądować. Teraz ląduje po from_email.
--   * twarda skarga (complaint) z Resend → auto opt-out + suppression.
--
-- ⚠️ ŚWIADOMIE plaintext lower(email), NIE hash: suppression musi być sprawdzalne z panelu
-- (podgląd importu w prospektor.html) ORAZ z edge (wysyłka) BEZ wspólnej soli/HMAC. Tabela
-- stoi za RLS team-only (jak reszta wfp_*), więc PII nie wycieka. Data-minimalizacja: trzymamy
-- WYŁĄCZNIE lower(email) + powód + datę — żadnego profilu, researchu ani treści maili.
--
-- Idempotentne. Aplikacja: scripts/apply-* przez Supabase Management API (database/query).

-- ── 1. Tabela suppression (lower(email) = PK) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wfp_suppression (
  email_lower text PRIMARY KEY,
  reason      text NOT NULL,                       -- 'opt_out' | 'complaint' | 'manual' | ...
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wfp_suppression IS
  'Prospektor: trwała lista wykluczeń (suppression). Plaintext lower(email) — świadomie, sprawdzalne z panelu i edge bez wspólnej soli; PII chroniona wyłącznie przez RLS team-only. Przeżywa usunięcie wfp_prospects (art. 17 vs art. 21).';

-- ── 2. Higiena adresów na wfp_prospects ──────────────────────────────────────
ALTER TABLE public.wfp_prospects ADD COLUMN IF NOT EXISTS source_detail text;  -- konkretne źródło art. 14 (np. „lista biegłych … stan na …")
ALTER TABLE public.wfp_prospects ADD COLUMN IF NOT EXISTS bounced_at    timestamptz;  -- twardy bounce z Resend → wykluczenie z ponownej wysyłki

COMMENT ON COLUMN public.wfp_prospects.source_detail IS
  'Konkretne źródło pozyskania (art. 14 ust. 2 lit. f RODO) — np. „lista biegłych sądowych Sądu Okręgowego w Warszawie, stan na 2026-07-14". Podstawiane jako {{ZRODLO_LISTA}} w stopce dla osób fizycznych.';
COMMENT ON COLUMN public.wfp_prospects.bounced_at IS
  'Znacznik twardego bounce (resend-webhook, email.bounced Permanent) — adres wykluczony z ponownej wysyłki.';

-- ── 3. RLS team-only (wzorzec wfp_*: FOR ALL TO authenticated, gate team_members) ─
ALTER TABLE public.wfp_suppression ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wfp_suppression_team_all ON public.wfp_suppression;
CREATE POLICY wfp_suppression_team_all ON public.wfp_suppression
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()));

-- service_role (edge: wfp-engine, resend-webhook) — jawny grant (bypass RLS, ale trzymamy explicite).
GRANT ALL ON public.wfp_suppression TO service_role;

-- ── 4. Seed suppression z już opted-out (nie tracimy dotychczasowych wykluczeń) ─
INSERT INTO public.wfp_suppression (email_lower, reason)
SELECT lower(email), 'opt_out'
FROM public.wfp_prospects
WHERE opted_out AND email IS NOT NULL AND email <> ''
ON CONFLICT (email_lower) DO NOTHING;

-- ── 5. Stopka dla osób fizycznych (biegli/rzeczoznawcy) — art. 14 RODO ────────
-- Prompt maila v2 i wfp_prompt_mail_osoba wgrywa siostrzana migracja
-- 20260723g_wfp_prompt_mail_v2.sql (audyt jakości). TU tylko stopka osobowa, bo używa
-- {{ZRODLO_LISTA}} = source_detail dodanego wyżej (art. 14 ust. 2 lit. f — konkretne źródło).
-- composeStopka() w wfp-engine wybiera ją dla source='sad-okregowy'; brak source_detail = blokada
-- wysyłki. Guard save_setting wymaga STOP + RODO (są). Idempotentne.
INSERT INTO public.settings (key, value) VALUES
('wfp_stopka_prawna_osoba', $wfp$--
{{DANE_NADAWCY}}

Skąd mam Twój adres: Twoje imię, nazwisko i adres e-mail pochodzą z publicznie dostępnego
źródła — {{ZRODLO_LISTA}}. Administratorem tych danych jestem ja jako nadawca tej wiadomości
(dane wyżej). Cel kontaktu: propozycja współpracy zawodowej. Podstawa prawna: mój prawnie
uzasadniony interes (art. 6 ust. 1 lit. f RODO), którym jest nawiązanie kontaktu w celu
współpracy. Nie łączę tych danych z żadnymi innymi zbiorami i nie przekazuję ich dalej.

Masz prawo: dostępu do swoich danych, ich sprostowania, usunięcia i ograniczenia przetwarzania,
przenoszenia, a także — w każdej chwili — prawo SPRZECIWU wobec tego kontaktu; po sprzeciwie nie
będę Cię już kontaktować. Przysługuje Ci też skarga do Prezesa UODO. Dane przechowuję do czasu
sprzeciwu, nie dłużej niż 6 miesięcy od tej wiadomości.

Jeśli nie chcesz, żebym pisał ponownie — odpisz jednym słowem: STOP. Usuwam Cię z listy
natychmiast i trwale.$wfp$)
ON CONFLICT (key) DO NOTHING;
