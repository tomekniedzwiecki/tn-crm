-- =============================================
-- Dodanie typu oferty: 'full' (pełen pakiet) vs 'starter' (startowy)
-- =============================================

-- Dodaj kolumnę offer_type do tabeli offers
ALTER TABLE offers
ADD COLUMN IF NOT EXISTS offer_type TEXT DEFAULT 'full' CHECK (offer_type IN ('full', 'starter'));

-- Ustaw domyślną wartość dla istniejących ofert
UPDATE offers SET offer_type = 'full' WHERE offer_type IS NULL;

-- Dodaj kolumnę offer_type do tabeli client_offers (aby wiedzieć jaki typ oferty został wygenerowany)
ALTER TABLE client_offers
ADD COLUMN IF NOT EXISTS offer_type TEXT DEFAULT 'full' CHECK (offer_type IN ('full', 'starter'));

-- Ustaw domyślną wartość dla istniejących client_offers
UPDATE client_offers SET offer_type = 'full' WHERE offer_type IS NULL;

COMMENT ON COLUMN offers.offer_type IS 'Typ oferty: full = pełen pakiet z umową, starter = oferta startowa bez umowy';
COMMENT ON COLUMN client_offers.offer_type IS 'Typ oferty wygenerowanej dla klienta';
