-- Dodaj kolumnę na custom HTML umowy per workflow
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_custom_html TEXT;

COMMENT ON COLUMN workflows.contract_custom_html IS 'Custom HTML umowy - nadpisuje domyślny szablon';
