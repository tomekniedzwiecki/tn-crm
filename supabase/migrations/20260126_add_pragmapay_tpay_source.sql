-- Add pragmapay and tpay to allowed payment sources
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_source_check;

ALTER TABLE orders ADD CONSTRAINT orders_payment_source_check
    CHECK (payment_source IN ('stripe', 'bank_transfer', 'installments', 'cash', 'tpay', 'pragmapay'));
