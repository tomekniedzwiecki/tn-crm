-- Add 'tpay' to allowed payment_source values
-- Drop old constraint and create new one with tpay

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_source_check;

ALTER TABLE orders ADD CONSTRAINT orders_payment_source_check
CHECK (payment_source IN ('tpay', 'stripe', 'bank_transfer', 'installments', 'cash'));
