-- ============================================
-- HARMONOGRAM PLATNOSCI RATALNYCH
-- ============================================
-- Umozliwia rozbicie platnosci na raty z indywidualnymi
-- terminami i sledzeniem statusu kazdej raty.

-- 1. Tabela glowna harmonogramu
-- UWAGA: Harmonogram tworzony jest na etapie leada (oferty),
-- a po oplaceniu pierwszej raty i utworzeniu workflow - automatycznie przenoszony.
CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Powiazanie z leadem (przed platnoscia) lub workflow (po platnosci)
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,

    -- Dane harmonogramu
    total_amount DECIMAL(10,2) NOT NULL,
    installments_count INTEGER NOT NULL DEFAULT 1,

    -- Metadane
    created_by UUID REFERENCES team_members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela poszczegolnych rat
CREATE TABLE IF NOT EXISTS payment_installments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES payment_schedules(id) ON DELETE CASCADE,

    -- Dane raty
    installment_number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    paid_at TIMESTAMPTZ,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

    -- Metadane
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(schedule_id, installment_number)
);

-- 3. Rozszerzenie tabeli orders o powiazanie z rata
ALTER TABLE orders ADD COLUMN IF NOT EXISTS installment_id UUID REFERENCES payment_installments(id);

-- 4. Rozszerzenie tabeli workflows o status platnosci
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'partial', 'fully_paid', 'overdue'));

-- 5. Indeksy dla wydajnosci
CREATE INDEX IF NOT EXISTS idx_payment_schedules_lead ON payment_schedules(lead_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_workflow ON payment_schedules(workflow_id);
CREATE INDEX IF NOT EXISTS idx_payment_installments_schedule ON payment_installments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_payment_installments_status ON payment_installments(status);
CREATE INDEX IF NOT EXISTS idx_payment_installments_due_date ON payment_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_orders_installment ON orders(installment_id);

-- 6. RLS Policies
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

-- Policy dla payment_schedules
CREATE POLICY "payment_schedules_select_policy" ON payment_schedules
    FOR SELECT USING (true);

CREATE POLICY "payment_schedules_insert_policy" ON payment_schedules
    FOR INSERT WITH CHECK (true);

CREATE POLICY "payment_schedules_update_policy" ON payment_schedules
    FOR UPDATE USING (true);

CREATE POLICY "payment_schedules_delete_policy" ON payment_schedules
    FOR DELETE USING (true);

-- Policy dla payment_installments
CREATE POLICY "payment_installments_select_policy" ON payment_installments
    FOR SELECT USING (true);

CREATE POLICY "payment_installments_insert_policy" ON payment_installments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "payment_installments_update_policy" ON payment_installments
    FOR UPDATE USING (true);

CREATE POLICY "payment_installments_delete_policy" ON payment_installments
    FOR DELETE USING (true);

-- 7. Funkcja do aktualizacji statusu platnosci workflow
CREATE OR REPLACE FUNCTION update_workflow_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    v_schedule_id UUID;
    v_workflow_id UUID;
    v_total_installments INTEGER;
    v_paid_installments INTEGER;
    v_overdue_installments INTEGER;
    v_new_status TEXT;
BEGIN
    -- Pobierz schedule_id i workflow_id
    SELECT ps.id, ps.workflow_id INTO v_schedule_id, v_workflow_id
    FROM payment_schedules ps
    WHERE ps.id = NEW.schedule_id;

    IF v_workflow_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Policz raty
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'paid'),
        COUNT(*) FILTER (WHERE status = 'overdue')
    INTO v_total_installments, v_paid_installments, v_overdue_installments
    FROM payment_installments
    WHERE schedule_id = v_schedule_id;

    -- Okresl nowy status
    IF v_paid_installments = v_total_installments THEN
        v_new_status := 'fully_paid';
    ELSIF v_overdue_installments > 0 THEN
        v_new_status := 'overdue';
    ELSIF v_paid_installments > 0 THEN
        v_new_status := 'partial';
    ELSE
        v_new_status := 'pending';
    END IF;

    -- Zaktualizuj workflow
    UPDATE workflows
    SET payment_status = v_new_status
    WHERE id = v_workflow_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger aktualizujacy status po zmianie raty
DROP TRIGGER IF EXISTS trigger_update_workflow_payment_status ON payment_installments;
CREATE TRIGGER trigger_update_workflow_payment_status
    AFTER INSERT OR UPDATE OF status ON payment_installments
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_payment_status();

-- 9. Funkcja do automatycznego oznaczania zaległych rat (do wywołania przez cron)
CREATE OR REPLACE FUNCTION mark_overdue_installments()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE payment_installments
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Funkcja przenosząca harmonogram z leada do workflow
-- Wywoływana automatycznie gdy tworzony jest nowy workflow (po pierwszej płatności)
CREATE OR REPLACE FUNCTION transfer_payment_schedule_to_workflow()
RETURNS TRIGGER AS $$
DECLARE
    v_lead_id UUID;
BEGIN
    -- Znajdz leada po emailu klienta
    SELECT id INTO v_lead_id
    FROM leads
    WHERE email = NEW.customer_email
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_lead_id IS NOT NULL THEN
        -- Przenies harmonogram z leada do workflow
        UPDATE payment_schedules
        SET workflow_id = NEW.id, lead_id = NULL
        WHERE lead_id = v_lead_id AND workflow_id IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Trigger przenoszacy harmonogram przy tworzeniu workflow
DROP TRIGGER IF EXISTS trigger_transfer_payment_schedule ON workflows;
CREATE TRIGGER trigger_transfer_payment_schedule
    AFTER INSERT ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION transfer_payment_schedule_to_workflow();

-- 12. Komentarze
COMMENT ON TABLE payment_schedules IS 'Harmonogramy płatności ratalnych - tworzone przy leadzie, przenoszone do workflow';
COMMENT ON TABLE payment_installments IS 'Poszczególne raty w harmonogramie płatności';
COMMENT ON COLUMN payment_schedules.lead_id IS 'Powiązanie z leadem (przed pierwszą płatnością)';
COMMENT ON COLUMN payment_schedules.workflow_id IS 'Powiązanie z workflow (po pierwszej płatności, ustawiane przez trigger)';
COMMENT ON COLUMN payment_installments.status IS 'pending=oczekuje, paid=opłacona, overdue=zaległa, cancelled=anulowana';
COMMENT ON COLUMN workflows.payment_status IS 'pending=brak wpłat, partial=częściowo, fully_paid=w pełni, overdue=zaległości';
