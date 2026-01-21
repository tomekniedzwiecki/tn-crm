-- Tabela zamówień
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_company TEXT,
    customer_phone TEXT,
    customer_nip TEXT,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    payment_source TEXT CHECK (payment_source IN ('stripe', 'bank_transfer', 'installments', 'cash')),
    payment_reference TEXT,
    notes TEXT,
    paid_at TIMESTAMPTZ,
    created_by UUID REFERENCES team_members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_lead_id ON orders(lead_id);

-- Funkcja generowania numeru zamówienia
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 'ORD-' || year_month || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_month || '-%';

    NEW.order_number := 'ORD-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Trigger aktualizacji updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view all orders"
    ON orders FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can insert orders"
    ON orders FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Team members can update orders"
    ON orders FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Team members can delete orders"
    ON orders FOR DELETE
    TO authenticated
    USING (true);
