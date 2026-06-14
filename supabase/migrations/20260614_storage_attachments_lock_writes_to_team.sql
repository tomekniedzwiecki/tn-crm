-- 2026-06-14 — storage: bucket 'attachments' (publiczny, 3530 plikow) mial
-- INSERT/DELETE dla KAZDEGO authenticated → po otwarciu rejestracji ryzyko
-- wandalizmu (skasowanie brandingu/obrazow landingow). Upload/usuwanie robia
-- tylko strony admina (tn-workflow/workflow, products, tn-todo/board = team) i
-- edge functions (service_role). Zawezamy do team_members. SELECT zostaje
-- (bucket publiczny — odczyt i tak po publicznym URL).
ALTER POLICY "Allow authenticated uploads 1mt4rzk_2" ON storage.objects
  USING (bucket_id = 'attachments' AND auth.uid() IN (SELECT user_id FROM public.team_members));
ALTER POLICY "Allow authenticated uploads 1mt4rzk_1" ON storage.objects
  WITH CHECK (bucket_id = 'attachments' AND auth.uid() IN (SELECT user_id FROM public.team_members));
