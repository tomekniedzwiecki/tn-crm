-- Add report_video type to workflow_reports
ALTER TABLE workflow_reports DROP CONSTRAINT IF EXISTS workflow_reports_type_check;
ALTER TABLE workflow_reports ADD CONSTRAINT workflow_reports_type_check
  CHECK (type IN ('analytics', 'performance', 'sales', 'custom', 'product_analysis', 'report_pdf', 'report_infographic', 'report_presentation', 'report_video'));
