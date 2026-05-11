-- =============================================
-- WORKFLOW ORDERS (Etap 4 — Sprzedaż)
-- =============================================
-- Tabela do rejestrowania zamówień otrzymanych w sklepie klienta.
-- Aktywuje się gdy workflow_ads.is_active = TRUE (Etap 4 aktywny).
-- Klient i admin oboje mogą dodawać/edytować; admin_note widzi klient, ale edytuje tylko admin.

CREATE TABLE IF NOT EXISTS workflow_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    -- Powiązanie z produktem workflow (zdjęcie + nazwa w UI)
    product_id UUID REFERENCES workflow_products(id) ON DELETE SET NULL,

    -- Dane zamówienia
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    order_number TEXT,
    customer_name TEXT,
    customer_email TEXT,

    -- Finanse
    revenue_gross NUMERIC(10,2) NOT NULL CHECK (revenue_gross >= 0),
    supplier_cost NUMERIC(10,2) CHECK (supplier_cost IS NULL OR supplier_cost >= 0),
    shipping_cost NUMERIC(10,2) CHECK (shipping_cost IS NULL OR shipping_cost >= 0),

    -- Marża obliczana automatycznie z kosztów (NULL gdy brak kosztów)
    margin NUMERIC(10,2) GENERATED ALWAYS AS (
        CASE
            WHEN supplier_cost IS NULL AND shipping_cost IS NULL THEN NULL
            ELSE revenue_gross - COALESCE(supplier_cost, 0) - COALESCE(shipping_cost, 0)
        END
    ) STORED,

    -- Status zamówienia
    status TEXT NOT NULL DEFAULT 'nowe'
        CHECK (status IN ('nowe', 'w_realizacji', 'zrealizowane', 'zwrot')),

    -- Notatki
    notes TEXT,                 -- klient + admin oboje edytują
    admin_note TEXT,            -- tylko admin pisze, klient czyta (komentarz mentora)

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_orders_workflow_id ON workflow_orders(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_orders_order_date ON workflow_orders(workflow_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_orders_status ON workflow_orders(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_orders_customer ON workflow_orders(workflow_id, lower(customer_name))
    WHERE customer_name IS NOT NULL;

-- =============================================
-- RLS
-- =============================================
ALTER TABLE workflow_orders ENABLE ROW LEVEL SECURITY;

-- Admin (staff): pełny dostęp
DROP POLICY IF EXISTS "Authenticated full access" ON workflow_orders;
CREATE POLICY "Authenticated full access"
ON workflow_orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Klient (anon): SELECT swoich zamówień (przez workflow_id — workflow ma RLS)
-- Klient widzi zamówienia tylko gdy workflow_ads jest aktywny dla danego workflow
DROP POLICY IF EXISTS "Anon select orders for active ads" ON workflow_orders;
CREATE POLICY "Anon select orders for active ads"
ON workflow_orders
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM workflow_ads wa
        WHERE wa.workflow_id = workflow_orders.workflow_id
          AND wa.is_active = TRUE
    )
);

-- Klient (anon): INSERT własnych zamówień (bramkowane przez workflow_ads.is_active)
DROP POLICY IF EXISTS "Anon insert orders for active ads" ON workflow_orders;
CREATE POLICY "Anon insert orders for active ads"
ON workflow_orders
FOR INSERT
TO anon
WITH CHECK (
    EXISTS (
        SELECT 1 FROM workflow_ads wa
        WHERE wa.workflow_id = workflow_orders.workflow_id
          AND wa.is_active = TRUE
    )
    AND admin_note IS NULL  -- klient nie może wstawiać komentarza mentora
);

-- Klient (anon): UPDATE swoich zamówień (ale BEZ zmiany admin_note)
DROP POLICY IF EXISTS "Anon update orders for active ads" ON workflow_orders;
CREATE POLICY "Anon update orders for active ads"
ON workflow_orders
FOR UPDATE
TO anon
USING (
    EXISTS (
        SELECT 1 FROM workflow_ads wa
        WHERE wa.workflow_id = workflow_orders.workflow_id
          AND wa.is_active = TRUE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM workflow_ads wa
        WHERE wa.workflow_id = workflow_orders.workflow_id
          AND wa.is_active = TRUE
    )
);

-- Trigger: chroni admin_note przed nadpisaniem przez anon
CREATE OR REPLACE FUNCTION protect_workflow_orders_admin_note()
RETURNS TRIGGER AS $$
BEGIN
    -- Tylko authenticated (admin) może modyfikować admin_note
    IF auth.role() = 'anon' THEN
        NEW.admin_note := OLD.admin_note;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS workflow_orders_protect_admin_note ON workflow_orders;
CREATE TRIGGER workflow_orders_protect_admin_note
    BEFORE UPDATE ON workflow_orders
    FOR EACH ROW
    EXECUTE FUNCTION protect_workflow_orders_admin_note();

-- Klient (anon): DELETE swoich zamówień
DROP POLICY IF EXISTS "Anon delete orders for active ads" ON workflow_orders;
CREATE POLICY "Anon delete orders for active ads"
ON workflow_orders
FOR DELETE
TO anon
USING (
    EXISTS (
        SELECT 1 FROM workflow_ads wa
        WHERE wa.workflow_id = workflow_orders.workflow_id
          AND wa.is_active = TRUE
    )
);

-- =============================================
-- TRIGGER updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_workflow_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workflow_orders_updated_at ON workflow_orders;
CREATE TRIGGER workflow_orders_updated_at
    BEFORE UPDATE ON workflow_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_orders_updated_at();

-- =============================================
-- KOMENTARZE
-- =============================================
COMMENT ON TABLE workflow_orders IS 'Etap 4 — zamówienia z sklepu klienta. Klient i admin oboje edytują, admin_note tylko admin.';
COMMENT ON COLUMN workflow_orders.product_id IS 'FK do workflow_products — pokazuje zdjęcie i nazwę produktu w UI. NULL = ogólne zamówienie.';
COMMENT ON COLUMN workflow_orders.margin IS 'GENERATED: revenue_gross - supplier_cost - shipping_cost. NULL gdy brak żadnego kosztu.';
COMMENT ON COLUMN workflow_orders.status IS 'nowe / w_realizacji / zrealizowane / zwrot';
COMMENT ON COLUMN workflow_orders.admin_note IS 'Komentarz mentora — widoczny dla klienta, edytowalny tylko przez admina (chronione triggerem).';
