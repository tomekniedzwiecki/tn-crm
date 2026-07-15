-- WF2 produkcja: fundament koncepcji 2026-07-15
-- (1) wf2_notes — uwagi Tomka wstrzykiwane do promptów sesji (wzorzec wfa_notes)
-- (2) milestone_label na step_defs — kamienie milowe (portal klienta)
-- (3) deadline_at na projekcie
-- (4) kolumny pod API platformy sklepy.niedzwiecki.ai (shop/product/checkout/page)

create table if not exists wf2_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references wf2_projects(id) on delete cascade,
  product_id uuid references wf2_products(id) on delete set null,
  created_at timestamptz not null default now(),
  author text not null default 'tomek',
  status text not null default 'open' check (status in ('open','done','dismissed')),
  tag text,
  body text not null default '',
  resolved_at timestamptz,
  resolution text
);
create index if not exists wf2_notes_project_open_idx on wf2_notes(project_id) where status = 'open';

alter table wf2_notes enable row level security;
drop policy if exists wf2_notes_team_all on wf2_notes;
create policy wf2_notes_team_all on wf2_notes
  for all to authenticated
  using (exists (select 1 from team_members tm where tm.user_id = auth.uid()))
  with check (exists (select 1 from team_members tm where tm.user_id = auth.uid()));

alter table wf2_step_defs add column if not exists milestone_label text;
alter table wf2_projects  add column if not exists deadline_at date;

-- API platformy (white label): identyfikatory i linki
alter table wf2_projects  add column if not exists platform_shop_id text;
alter table wf2_products  add column if not exists platform_product_id text;
alter table wf2_products  add column if not exists checkout_url text;
alter table wf2_products  add column if not exists platform_page_url text;

-- Kamienie startowe (project-scope; rozszerzymy przy portalu)
update wf2_step_defs set milestone_label = 'Sklep działa — test zakupowy zaliczony' where key = 'td_test';
update wf2_step_defs set milestone_label = 'Stery przekazane' where key = 'stery';
