-- =============================================
-- Dodanie kolumny is_default do tabeli offers
-- =============================================

-- Dodaj kolumnę is_default do tabeli offers
ALTER TABLE offers
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Dodaj indeks dla szybkiego wyszukiwania domyślnej oferty
CREATE INDEX IF NOT EXISTS idx_offers_is_default ON offers(is_default) WHERE is_default = true;

-- Upewnij się, że tylko jedna oferta może być domyślna
-- (constraint zostanie wymuszony w aplikacji poprzez logikę biznesową)

COMMENT ON COLUMN offers.is_default IS 'Czy oferta jest domyślną ofertą dla nowych leadów';
