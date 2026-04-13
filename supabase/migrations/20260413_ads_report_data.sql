-- =============================================
-- ADD REPORT DATA FIELDS TO workflow_ads
-- =============================================
-- Rozbudowa kroku "Raport" w Etapie 4
-- - report_data: statystyki kampanii (z Meta Ads via Manus)
-- - report_url: link do wygenerowanego raportu
-- - report_generated_at: kiedy raport zostal wygenerowany

ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS report_data JSONB,
ADD COLUMN IF NOT EXISTS report_url TEXT,
ADD COLUMN IF NOT EXISTS report_generated_at TIMESTAMPTZ;

-- Struktura report_data:
-- {
--   "period": { "from": "2026-04-01", "to": "2026-04-13" },
--   "spend": 1234.56,
--   "impressions": 50000,
--   "clicks": 1500,
--   "ctr": 3.0,
--   "cpc": 0.82,
--   "conversions": 45,
--   "conversion_rate": 3.0,
--   "cost_per_conversion": 27.43,
--   "revenue": 4500.00,
--   "roas": 3.65,
--   "campaigns": [
--     { "name": "Campaign 1", "spend": 600, "conversions": 20 },
--     { "name": "Campaign 2", "spend": 634.56, "conversions": 25 }
--   ],
--   "source": "manus",
--   "fetched_at": "2026-04-13T10:00:00Z"
-- }

-- Comments
COMMENT ON COLUMN workflow_ads.report_data IS 'Campaign statistics data (from Meta Ads via Manus)';
COMMENT ON COLUMN workflow_ads.report_url IS 'URL to generated report file (PDF/HTML)';
COMMENT ON COLUMN workflow_ads.report_generated_at IS 'When report was generated';
