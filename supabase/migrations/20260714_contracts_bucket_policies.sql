-- 2026-07-14 — Prywatny bucket `contracts` na umowy (wcześniej w publicznym `attachments`,
-- przez co podpisane umowy z PESEL były pobieralne bez logowania).
-- Bucket tworzony przez storage API (public=false). Tu tylko polityki storage.objects:
-- admin (team_members) uploaduje/czyta/nadpisuje/kasuje; klient NIE dotyka storage.objects —
-- pobiera przez edge function `contract-file` (service-role omija RLS, gate: x-wf-token / admin JWT).
DROP POLICY IF EXISTS "team_members manage contracts bucket" ON storage.objects;
CREATE POLICY "team_members manage contracts bucket" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'contracts' AND auth.uid() IN (SELECT user_id FROM public.team_members))
  WITH CHECK (bucket_id = 'contracts' AND auth.uid() IN (SELECT user_id FROM public.team_members));
