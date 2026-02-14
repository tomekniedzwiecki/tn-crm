-- Add report screenshot PDF column to products
ALTER TABLE workflow_products ADD COLUMN IF NOT EXISTS report_screenshot_url TEXT;

COMMENT ON COLUMN workflow_products.report_screenshot_url IS 'URL to PDF screenshot used for report generation';
