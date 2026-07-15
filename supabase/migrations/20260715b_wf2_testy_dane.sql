-- Dane pod system decyzji testów (WORKFLOW-V2-TESTY.md §7):
-- ad-level breakdowny + akcje lejka w wf2_ad_stats, źródło 'platform' w wf2_sales,
-- kolumny cyklu testowego na wf2_products.

alter table wf2_ad_stats
  add column if not exists link_clicks integer not null default 0,
  add column if not exists lpv         integer not null default 0,
  add column if not exists atc         integer not null default 0,
  add column if not exists ic          integer not null default 0,
  add column if not exists reach       integer not null default 0,
  add column if not exists frequency   numeric(8,2) not null default 0,
  add column if not exists ad_id       text,
  add column if not exists level       text not null default 'campaign',
  add column if not exists actions     jsonb not null default '{}'::jsonb;

alter table wf2_ad_stats drop constraint if exists wf2_ad_stats_level_check;
alter table wf2_ad_stats add constraint wf2_ad_stats_level_check check (level in ('campaign','ad'));

-- UNIQUE(campaign_id,date) blokował wiersze ad-level → rozdzielenie per poziom
alter table wf2_ad_stats drop constraint if exists wf2_ad_stats_campaign_id_date_key;
create unique index if not exists wf2_ad_stats_campaign_day
  on wf2_ad_stats(campaign_id, date) where level = 'campaign';
create unique index if not exists wf2_ad_stats_ad_day
  on wf2_ad_stats(campaign_id, ad_id, date) where level = 'ad';

-- zamówienia z API platformy sklepy.niedzwiecki.ai
alter table wf2_sales drop constraint if exists wf2_sales_source_check;
alter table wf2_sales add constraint wf2_sales_source_check
  check (source in ('meta','takedrop','platform'));

-- cykl testowy produktu
alter table wf2_products
  add column if not exists price_scale     numeric,
  add column if not exists scale_proposal  jsonb,
  add column if not exists test_started_at timestamptz,
  add column if not exists orders_paid     integer not null default 0,
  add column if not exists validation_cap  numeric;
