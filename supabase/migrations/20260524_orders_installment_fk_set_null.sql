-- Fix: usuwanie harmonogramu platnosci bylo blokowane przez FK orders.installment_id
-- bez klauzuli ON DELETE (default = NO ACTION). Po skasowaniu raty wszystkie powiazane
-- zamowienia powinny zostac bez referencji, nie blokowac usuwania.

ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS orders_installment_id_fkey;

ALTER TABLE orders
    ADD CONSTRAINT orders_installment_id_fkey
    FOREIGN KEY (installment_id)
    REFERENCES payment_installments(id)
    ON DELETE SET NULL;
