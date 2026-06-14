-- 2026-06-14 — WYCIEK SEKRETU: settings 'Allow anon read fakturownia settings'.
-- Polityka pozwalala KAZDEMU anonimowemu (publishable key, bez logowania) odczytac
-- fakturownia_api_token = token API do Fakturowni (dostep do faktur i PII klientow:
-- nazwy, adresy, NIP-y, kwoty; tworzenie faktur). Zaden klient nie czyta tokenu po
-- stronie przegladarki — edge functions (fakturownia-proforma/invoice) czytaja go
-- serwerowo (service_role), panel admina settings.html jako team_member. Polityka
-- anon to relikt. Usuwamy. UWAGA: token byl publicznie dostepny → ZROTOWAC w Fakturowni.
DROP POLICY IF EXISTS "Allow anon read fakturownia settings" ON public.settings;
