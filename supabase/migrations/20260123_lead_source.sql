-- ============================================
-- LEAD SOURCE - Źródło pozyskania leada w CRM
-- ============================================
-- lead_source = skąd lead trafił do CRM:
--   website = z formularza na stronie
--   outreach = z bazy kontaktów (import z kampanii/outreach)
--   manual = dodany ręcznie w CRM

ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT
    CHECK (lead_source IN ('website', 'outreach', 'manual'));

-- Ustaw domyślne wartości dla istniejących leadów
-- Wszystkie istniejące leady traktujemy jako 'website' (z formularza)
UPDATE leads SET lead_source = 'website' WHERE lead_source IS NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_leads_lead_source ON leads(lead_source);

COMMENT ON COLUMN leads.lead_source IS 'Źródło pozyskania leada: website (formularz), outreach (baza kontaktów), manual (dodany ręcznie)';
