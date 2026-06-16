-- 2026-06-15: Dziennik zmian na koncie reklamowym marki Tomka (act 1537659320657091).
-- Konto NIE jest sklepem klienta -> nie loguje sie do campaign_actions (te wymagaja workflow_id klienta).
-- Kazda zmiana wykonana przez Claude/MCP na tym koncie MUSI trafic tutaj z wartoscia przed/po.
create table if not exists tn_ad_change_log (
  id              bigint generated always as identity primary key,
  changed_at      timestamptz not null default now(),
  ad_account_id   text not null,
  level           text not null,                 -- 'account'|'campaign'|'adset'|'ad'
  entity_id       text not null,
  entity_name     text,
  field           text not null,                 -- 'daily_budget'|'lifetime_budget'|'status'|...
  old_value       text,
  new_value       text,
  action          text not null,                 -- 'budget_change'|'pause'|'resume'|'reactivate'|'create'|'other'
  reason          text,
  performed_by    text not null default 'claude',-- 'claude'|'tomek'|'routine'
  source          text,                          -- kontekst sesji / skad zmiana
  tool_call       text,                          -- np. 'ads_update_entity'
  metadata        jsonb not null default '{}'::jsonb
);
create index if not exists tn_ad_change_log_acct_time_idx on tn_ad_change_log (ad_account_id, changed_at desc);
create index if not exists tn_ad_change_log_entity_idx on tn_ad_change_log (entity_id);

alter table tn_ad_change_log enable row level security;
-- spojnie z reszta tn_ad_*: anon tylko SELECT; zapis wylacznie service/MCP
drop policy if exists "anon read tn_ad_change_log" on tn_ad_change_log;
create policy "anon read tn_ad_change_log" on tn_ad_change_log for select to anon using (true);
