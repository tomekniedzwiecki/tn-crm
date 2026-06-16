-- spar_abandoned_emails — PRE-WYGENEROWANE maile sekwencji powrotu (abandoned_chat
-- 1/2/3) dla rozmów W TOKU. Generowane RAZ, jednym promptem do GPT (3 maile na
-- jeden strzał = taniej), zapisywane od razu jako „do wysłania" ze znaną godziną.
-- Cron wysyła DOKŁADNIE zapisaną treść (bez regeneracji), więc admin widzi 1:1, co
-- poszło. Status pending→sent gdy wyśle; cancelled gdy lead dojdzie do zielonego
-- werdyktu (sekwencję powrotu przejmuje wtedy drip odkrywania).
create table if not exists public.spar_abandoned_emails (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.spar_sessions(id) on delete cascade,
  kind         text not null,              -- abandoned_chat / abandoned_chat_2 / abandoned_chat_3
  seq          int  not null,              -- 1 / 2 / 3
  subject      text not null,
  html         text not null,
  status       text not null default 'pending',  -- pending | sent | cancelled
  scheduled_at timestamptz,                -- planowana godzina wysyłki (last_user_at + próg)
  sent_at      timestamptz,
  resend_id    text,
  created_at   timestamptz not null default now(),
  unique (session_id, kind)
);

create index if not exists idx_spar_abandoned_session on public.spar_abandoned_emails(session_id);
create index if not exists idx_spar_abandoned_status  on public.spar_abandoned_emails(status);

alter table public.spar_abandoned_emails enable row level security;

-- Zapis WYŁĄCZNIE przez service role (cron/edge — omija RLS). Admin (team_members)
-- czyta treść do podglądu w karcie leada. Wzorzec 1:1 z `spar_emails_admin_read`.
drop policy if exists spar_abandoned_admin_read on public.spar_abandoned_emails;
create policy spar_abandoned_admin_read on public.spar_abandoned_emails
  for select to authenticated
  using (auth.uid() in (select user_id from public.team_members));
