-- Rozszerzenie typów w workflow_branding o mockup i brand_info
ALTER TABLE workflow_branding
  DROP CONSTRAINT IF EXISTS workflow_branding_type_check;

ALTER TABLE workflow_branding
  ADD CONSTRAINT workflow_branding_type_check
  CHECK (type IN ('logo', 'color', 'font', 'guideline', 'mockup', 'brand_info', 'other'));
