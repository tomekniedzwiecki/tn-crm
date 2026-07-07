-- LEJEK V2 — analityka końcówki (decyzja Tomka 2026-07-07): queryowalny log zdarzeń
-- per sesja /sklep (zielone → karta budżetu → deklaracja → karta rezerwacji → paywall
-- → BLIK → wpłata). GA zostaje (piksele), ale wnioski wyciągamy z bazy — join z
-- bud_sessions/orders. Insert WYŁĄCZNIE service_role (bud-project action 'track',
-- whitelista+dedup+cap po stronie funkcji); zero polityk anon; SELECT tylko team.

create table if not exists bud_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references bud_sessions(id) on delete cascade,
  event text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bud_events_session_idx on bud_events (session_id, event);
create index if not exists bud_events_event_time_idx on bud_events (event, created_at);

alter table bud_events enable row level security;

-- Panel /tn-sklep (authenticated, zawężone do team_members — NIGDY samo authenticated)
drop policy if exists bud_events_team_read on bud_events;
create policy bud_events_team_read on bud_events
  for select to authenticated
  using (auth.uid() in (select team_members.user_id from team_members));
