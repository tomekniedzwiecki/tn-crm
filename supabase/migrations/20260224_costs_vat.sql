-- =====================================================
-- COSTS VAT - Dodaj pole VAT do kosztow
-- =====================================================

-- Dodaj kolumne vat_rate do biznes_costs
-- 0 = brak VAT (np. pracownik), 0.23 = 23% VAT
ALTER TABLE biznes_costs ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,4) DEFAULT 0.23;

-- Ustaw koszty pracownikow na 0% VAT (nie odliczamy VAT od wynagrodzen)
UPDATE biznes_costs SET vat_rate = 0 WHERE category = 'pracownik';

-- Dodaj też do szablonow kosztow stałych
ALTER TABLE biznes_recurring_costs ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,4) DEFAULT 0.23;
