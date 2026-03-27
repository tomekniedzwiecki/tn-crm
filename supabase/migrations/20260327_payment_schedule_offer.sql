-- ============================================
-- POWIAZANIE HARMONOGRAMU Z OFERTA
-- ============================================

-- Dodaj kolumne client_offer_id do payment_schedules
ALTER TABLE payment_schedules
ADD COLUMN IF NOT EXISTS client_offer_id UUID REFERENCES client_offers(id) ON DELETE SET NULL;

-- Indeks dla wydajnosci
CREATE INDEX IF NOT EXISTS idx_payment_schedules_offer ON payment_schedules(client_offer_id);

-- Komentarz
COMMENT ON COLUMN payment_schedules.client_offer_id IS 'Powiazanie z oferta klienta';
