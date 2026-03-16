-- =============================================
-- Dodanie offer_type do tabeli workflows
-- =============================================

ALTER TABLE workflows
ADD COLUMN IF NOT EXISTS offer_type TEXT DEFAULT 'full' CHECK (offer_type IN ('full', 'starter'));

-- Ustaw wartość na podstawie nazwy oferty dla istniejących workflow
UPDATE workflows
SET offer_type = CASE
    WHEN LOWER(offer_name) LIKE '%starter%' THEN 'starter'
    ELSE 'full'
END
WHERE offer_type IS NULL;

COMMENT ON COLUMN workflows.offer_type IS 'Typ oferty: full = pełen pakiet, starter = oferta startowa';
