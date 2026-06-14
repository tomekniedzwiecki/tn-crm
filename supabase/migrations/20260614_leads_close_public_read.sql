-- 2026-06-14 — Zamknięcie otwartego odczytu leadów
-- „Allow public read leads" (TO public USING(true)) pozwalał KAŻDEMU — także
-- anonimowemu z publishable key, bez logowania — odczytać wszystkie leady (PII).
-- To nie jest dostęp portalu po tokenie, tylko otwarty wyciek. Zawężamy do zespołu.
-- Wstawianie leadów z formularza (anon INSERT) ma osobną politykę — nietknięte.
ALTER POLICY "Allow public read leads" ON public.leads
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));
