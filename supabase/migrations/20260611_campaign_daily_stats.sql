-- Dzienne metryki per kampania Meta — zrodlo dla Centrum Kampanii (filtr po dowolnym zakresie dat).
-- Zasilane przez Claude/rutyne z Meta MCP: ads_get_ad_entities (level=campaign, time_increment=1) -> upsert.
-- Mid-funnel (koszyk/produkt) zostaje w workflow_ad_reports (pixel = poziom konta), tu sa metryki platformowe per kampania.

CREATE TABLE IF NOT EXISTS public.campaign_daily_stats (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workflow_id     uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    meta_ad_account_id text,
    campaign_id     text,
    campaign_name   text,
    stat_date       date NOT NULL,
    spend           numeric(12,2) DEFAULT 0,
    impressions     integer DEFAULT 0,
    reach           integer DEFAULT 0,
    clicks          integer DEFAULT 0,
    link_clicks     integer DEFAULT 0,
    purchases       integer DEFAULT 0,
    purchase_value  numeric(12,2) DEFAULT 0,
    purchase_roas   numeric(10,4) DEFAULT 0,
    cpc             numeric(10,4) DEFAULT 0,
    cpm             numeric(10,4) DEFAULT 0,
    ctr             numeric(8,4) DEFAULT 0,
    frequency       numeric(8,4) DEFAULT 0,
    currency        text DEFAULT 'PLN',
    source          text DEFAULT 'mcp',
    collected_at    timestamptz DEFAULT now(),
    CONSTRAINT campaign_daily_stats_uniq UNIQUE (workflow_id, campaign_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_cds_workflow_date ON public.campaign_daily_stats (workflow_id, stat_date);
CREATE INDEX IF NOT EXISTS idx_cds_date ON public.campaign_daily_stats (stat_date);

ALTER TABLE public.campaign_daily_stats ENABLE ROW LEVEL SECURITY;

-- Panel kampanie.html dziala na zalogowanym adminie (rola authenticated) -> pelny CRUD
DROP POLICY IF EXISTS cds_authenticated_all ON public.campaign_daily_stats;
CREATE POLICY cds_authenticated_all ON public.campaign_daily_stats
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- service_role (rutyna/backfill) tez pelny dostep
DROP POLICY IF EXISTS cds_service_all ON public.campaign_daily_stats;
CREATE POLICY cds_service_all ON public.campaign_daily_stats
    FOR ALL TO service_role USING (true) WITH CHECK (true);
