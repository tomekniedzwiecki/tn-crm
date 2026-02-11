-- =============================================
-- AUTOMATION CATEGORY COLUMN
-- =============================================
-- Dodaje kolumnę category do automation_flows
-- Pozwala na ręczne kategoryzowanie automatyzacji

ALTER TABLE automation_flows
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'workflow';

-- Dodaj constraint dla dozwolonych wartości
ALTER TABLE automation_flows
ADD CONSTRAINT automation_flows_category_check
CHECK (category IN ('offer', 'workflow', 'payment'));

-- Uzupełnij category na podstawie trigger_type dla istniejących rekordów
UPDATE automation_flows
SET category = CASE
    WHEN trigger_type LIKE 'offer%' THEN 'offer'
    WHEN trigger_type IN ('payment_received', 'contract_signed') THEN 'payment'
    ELSE 'workflow'
END
WHERE category IS NULL OR category = 'workflow';

-- Indeks dla szybszego filtrowania
CREATE INDEX IF NOT EXISTS idx_automation_flows_category ON automation_flows(category);

COMMENT ON COLUMN automation_flows.category IS 'Kategoria automatyzacji: offer, workflow, payment';
