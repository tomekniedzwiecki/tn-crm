-- Dodanie pola sales_page_shared_at do workflows
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS sales_page_shared_at TIMESTAMPTZ;
