-- Dodanie pola branding_shared_at do workflows
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS branding_shared_at TIMESTAMPTZ;
