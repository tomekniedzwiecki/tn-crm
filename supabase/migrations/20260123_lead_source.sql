-- ============================================
-- LEAD SOURCE - Źródło pozyskania leada w CRM
-- ============================================
-- Oddzielne od utm_source (marketing attribution)
-- lead_source = skąd lead trafił do CRM
-- utm_source = skąd lead trafił na stronę (marketing)

ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT
    CHECK (lead_source IN ('website', 'outreach', 'manual'));

-- Ustaw domyślne wartości dla istniejących leadów
-- Leady z utm_source = 'outreach' -> lead_source = 'outreach'
UPDATE leads SET lead_source = 'outreach' WHERE utm_source = 'outreach' AND lead_source IS NULL;

-- Leady bez utm_source i bez kampanii -> manual
UPDATE leads SET lead_source = 'manual'
WHERE lead_source IS NULL
  AND utm_source IS NULL
  AND utm_medium IS NULL
  AND utm_campaign IS NULL;

-- Pozostałe (z danymi marketingowymi) -> website
UPDATE leads SET lead_source = 'website' WHERE lead_source IS NULL;

-- Wyczyść 'outreach' z utm_source (nie jest to źródło marketingowe)
UPDATE leads SET utm_source = NULL WHERE utm_source = 'outreach';

-- Index
CREATE INDEX IF NOT EXISTS idx_leads_lead_source ON leads(lead_source);

COMMENT ON COLUMN leads.lead_source IS 'Źródło pozyskania leada: website (formularz), outreach (kampania mailingowa), manual (dodany ręcznie)';
