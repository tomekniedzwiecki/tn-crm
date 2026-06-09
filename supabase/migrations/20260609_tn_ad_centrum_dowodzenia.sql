-- Centrum Dowodzenia Marketingowego — analityka reklam Meta konta Tomka (act 1537659320657091)
-- Zasilane przez Claude (Meta MCP -> Supabase MCP). Panel (anon/authenticated) tylko SELECT
-- (+ update statusu rekomendacji/alertów). Dane konta NIE są w repo — seed wykonywany przez MCP.

create table if not exists public.tn_ad_metrics_daily (
  id bigint generated always as identity primary key,
  period_type text not null default 'day',          -- 'day' | 'month' | 'ytd'
  date date not null,                                -- dzień, 1-szy dnia miesiąca, lub data snapshotu
  period_end date,
  level text not null,                               -- 'account' | 'campaign' | 'adset' | 'ad'
  campaign_id text not null default '',
  campaign_name text default '',
  objective text default '',                         -- OUTCOME_SALES / OUTCOME_AWARENESS / ...
  layer text default '',                             -- 'conversion' | 'image' | 'traffic'
  adset_id text not null default '',
  adset_name text default '',
  ad_id text not null default '',
  ad_name text default '',
  breakdown_dim text not null default '',            -- '' | 'age' | 'gender' | 'placement'
  breakdown_value text not null default '',
  status text default '',
  spend numeric(14,2) default 0,
  impressions bigint default 0,
  reach bigint default 0,
  frequency numeric(8,2),
  cpm numeric(12,2),
  ctr numeric(8,3),
  cpc numeric(12,2),
  link_clicks bigint default 0,
  thruplays bigint default 0,
  cost_per_thruplay numeric(12,3),
  results numeric(14,2),
  result_type text default '',
  registrations integer default 0,
  registrations_crm integer,
  cost_per_registration numeric(12,2),
  purchases integer default 0,
  purchase_value numeric(16,2) default 0,
  roas numeric(12,2),
  attribution_window text default '7d_click_1d_view',
  synced_at timestamptz default now(),
  unique (period_type, date, level, campaign_id, adset_id, ad_id, breakdown_dim, breakdown_value)
);
create index if not exists tn_ad_metrics_period_idx on public.tn_ad_metrics_daily (period_type, date);
create index if not exists tn_ad_metrics_level_idx on public.tn_ad_metrics_daily (level);
create index if not exists tn_ad_metrics_breakdown_idx on public.tn_ad_metrics_daily (breakdown_dim);

create table if not exists public.tn_ad_recommendations (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  week_of date,
  layer text default '',
  type text default 'insight',                       -- scale|kill|refresh|content_plan|budget_shift|insight
  priority smallint default 3,
  title text not null,
  body text default '',
  related_entity text default '',
  metric_snapshot jsonb,
  status text default 'new'                           -- new|accepted|dismissed|done
);
create index if not exists tn_ad_reco_status_idx on public.tn_ad_recommendations (status);
create index if not exists tn_ad_reco_week_idx on public.tn_ad_recommendations (week_of);

create table if not exists public.tn_ad_alerts (
  id bigint generated always as identity primary key,
  detected_at timestamptz default now(),
  rule_id smallint,
  severity text default 'INFO',                       -- INFO|WARN|ALERT|ACTION
  layer text default '',
  related_entity text default '',
  message text not null,
  metric_snapshot jsonb,
  status text default 'open',                          -- open|resolved
  resolved_at timestamptz,
  unique (rule_id, related_entity, status)
);
create index if not exists tn_ad_alerts_status_idx on public.tn_ad_alerts (status, severity);

-- RLS: odczyt publiczny (panel za auth używa anon/authenticated), zapis przez service/MCP
alter table public.tn_ad_metrics_daily enable row level security;
alter table public.tn_ad_recommendations enable row level security;
alter table public.tn_ad_alerts enable row level security;

create policy "tn_ad_metrics_read" on public.tn_ad_metrics_daily for select using (true);
create policy "tn_ad_reco_read" on public.tn_ad_recommendations for select using (true);
create policy "tn_ad_reco_update" on public.tn_ad_recommendations for update using (true) with check (true);
create policy "tn_ad_alerts_read" on public.tn_ad_alerts for select using (true);
create policy "tn_ad_alerts_update" on public.tn_ad_alerts for update using (true) with check (true);
