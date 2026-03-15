-- Dodanie kolumny do recznego nadpisania handlowca dla prowizji
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_salesperson_id UUID REFERENCES team_members(id);

-- Indeks dla szybszego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_orders_commission_salesperson ON orders(commission_salesperson_id);

-- Komentarz
COMMENT ON COLUMN orders.commission_salesperson_id IS 'Reczne przypisanie handlowca dla prowizji (nadpisuje leads.assigned_to)';
