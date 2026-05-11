-- =============================================
-- WORKFLOW ORDERS — dodatkowe pola
-- =============================================
-- Dodaje: data realizacji, ID u dostawcy, numer tracking, sposób płatności.

ALTER TABLE workflow_orders
    ADD COLUMN IF NOT EXISTS fulfillment_date DATE,
    ADD COLUMN IF NOT EXISTS supplier_order_id TEXT,
    ADD COLUMN IF NOT EXISTS tracking_number TEXT,
    ADD COLUMN IF NOT EXISTS payment_method TEXT
        CHECK (payment_method IS NULL OR payment_method IN ('prepaid', 'cod'));

COMMENT ON COLUMN workflow_orders.fulfillment_date IS 'Data realizacji zamówienia (zamówienie u dostawcy / wysyłka).';
COMMENT ON COLUMN workflow_orders.supplier_order_id IS 'ID zamówienia u dostawcy (AliExpress, etc).';
COMMENT ON COLUMN workflow_orders.tracking_number IS 'Numer przesyłki / tracking.';
COMMENT ON COLUMN workflow_orders.payment_method IS 'prepaid = płatne z góry, cod = za pobraniem.';
