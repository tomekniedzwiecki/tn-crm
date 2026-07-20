-- wf2-video (PRYWATNY, cudzy content TikTok = research/archiwum): panel /tn-sklepy dostaje
-- sekcję „Oryginał (wzorzec)" w kroku Wideo (decyzja Tomka 20.07 — porównanie side-by-side
-- kreacji z oryginałem). Panel czyta przez createSignedUrls (sesja team) → potrzebny SELECT
-- dla team_members. TYLKO SELECT: upload robi wyłącznie service-role (panel-sync), bucket
-- zostaje prywatny — cudzego contentu NIGDY nie hostujemy publicznie.

drop policy if exists "wf2_video_team_select" on storage.objects;
create policy "wf2_video_team_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'wf2-video' and auth.uid() in (select user_id from team_members));
