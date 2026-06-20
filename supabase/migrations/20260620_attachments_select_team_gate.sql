-- 2026-06-20 — Bezpieczeństwo bucketa 'attachments' (projekt współdzielony CRM + sparing).
-- Problem: SELECT na 'attachments' był otwarty na KAŻDEGO authenticated. Publiczna rejestracja
-- sparingu nadaje rolę `authenticated` dowolnej osobie z internetu, więc każdy zarejestrowany
-- mógł LISTOWAĆ wszystkie załączniki CRM (advisor: public_bucket_allows_listing).
-- Fix: SELECT zawężony do team_members — spójnie z politykami INSERT/DELETE (już team-gated).
-- Publiczny odczyt po URL działa niezależnie (bucket public); to ucina tylko listowanie/.download()
-- przez konto nie-zespołowe. Panele CRM używają upload/getPublicUrl/remove (nie .list) — bez wpływu.
-- Rollback: DROP POLICY "attachments_select_team"; CREATE POLICY "Allow authenticated uploads 1mt4rzk_0"
--           ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Allow authenticated uploads 1mt4rzk_0" ON storage.objects;

CREATE POLICY "attachments_select_team" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'attachments' AND auth.uid() IN (SELECT user_id FROM team_members));
