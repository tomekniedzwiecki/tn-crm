-- wf2-docs: PRYWATNY bucket na dokumenty fabryki landingów (KARTA-PRAWDY/PASZPORT/PLAN/
-- PRZEWODNIK/TOKENS/MAPA-ASSETOW/WIERNOSC/LEDGER/RETRO itd.).
-- Powód (Tomek 19.07): doki żyły TYLKO na Desktopie (storage='desktop' = martwy chip w panelu) —
-- mają być dostępne z każdego miejsca. Publiczny 'attachments' odpada: KARTA-PRAWDY/LEDGER niosą
-- koszty zakupu i marże (wrażliwe biznesowo) — wzorzec = bucket 'contracts' (private + team_members).
-- Panel czyta przez createSignedUrl (sesja team) — patrz tn-sklepy/projekt.html openPrivateDoc().

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wf2-docs', 'wf2-docs', false, 10485760,
        array['text/plain','text/plain; charset=utf-8','text/markdown','application/json'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "wf2_docs_team_all" on storage.objects;
create policy "wf2_docs_team_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'wf2-docs' and auth.uid() in (select user_id from team_members))
  with check (bucket_id = 'wf2-docs' and auth.uid() in (select user_id from team_members));
