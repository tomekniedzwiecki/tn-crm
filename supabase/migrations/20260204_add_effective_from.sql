-- Dodanie pola effective_from do biznes_recurring_costs
-- Określa od kiedy dany koszt stały obowiązuje

ALTER TABLE biznes_recurring_costs
ADD COLUMN IF NOT EXISTS effective_from DATE;

-- Dla istniejących rekordów ustaw effective_from na styczeń 2026
-- (zakładamy że wszystkie obecne koszty obowiązują od początku śledzenia)
UPDATE biznes_recurring_costs
SET effective_from = '2026-01-01'
WHERE effective_from IS NULL;

COMMENT ON COLUMN biznes_recurring_costs.effective_from IS 'Data od której koszt stały obowiązuje (początek miesiąca)';
