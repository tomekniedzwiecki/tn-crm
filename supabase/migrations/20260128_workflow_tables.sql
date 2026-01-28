-- =============================================
-- WORKFLOW MANAGEMENT SYSTEM
-- =============================================
-- System do zarządzania projektami klientów po opłaceniu zamówienia
-- Automatyczne tworzenie workflow z harmonogramem oferty

-- 1. Główna tabela workflows
CREATE TABLE IF NOT EXISTS workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Dane klienta (snapshot z zamówienia)
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_company TEXT,
    customer_phone TEXT,

    -- Dane oferty (snapshot)
    offer_name TEXT NOT NULL,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    current_milestone_index INTEGER DEFAULT 0,

    -- Dostęp klienta
    unique_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    client_password_hash TEXT,  -- NULL = bez hasła

    -- Daty
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Milestones snapshot (JSONB - kopia z oferty dla referencji)
    milestones_snapshot JSONB NOT NULL DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy workflows
CREATE INDEX idx_workflows_order_id ON workflows(order_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_customer_email ON workflows(customer_email);
CREATE INDEX idx_workflows_unique_token ON workflows(unique_token);
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);

-- 2. Tabela workflow_milestones
CREATE TABLE IF NOT EXISTS workflow_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    milestone_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER DEFAULT 1,

    -- Daty obliczone z duration_days
    start_date DATE,
    deadline DATE,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Deliverables snapshot
    deliverables JSONB DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workflow_id, milestone_index)
);

-- Indeksy workflow_milestones
CREATE INDEX idx_workflow_milestones_workflow_id ON workflow_milestones(workflow_id);
CREATE INDEX idx_workflow_milestones_status ON workflow_milestones(status);
CREATE INDEX idx_workflow_milestones_deadline ON workflow_milestones(deadline);

-- 3. Tabela workflow_tasks
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    milestone_id UUID NOT NULL REFERENCES workflow_milestones(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    task_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    responsible TEXT DEFAULT 'team' CHECK (responsible IN ('team', 'client', 'shared')),

    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES team_members(id),

    -- Notatki i linki (admin może dodawać)
    notes TEXT,
    links JSONB DEFAULT '[]',  -- [{url, title}]

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy workflow_tasks
CREATE INDEX idx_workflow_tasks_milestone_id ON workflow_tasks(milestone_id);
CREATE INDEX idx_workflow_tasks_workflow_id ON workflow_tasks(workflow_id);
CREATE INDEX idx_workflow_tasks_completed ON workflow_tasks(completed);

-- 4. Tabela workflow_access_log
CREATE TABLE IF NOT EXISTS workflow_access_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Indeksy workflow_access_log
CREATE INDEX idx_workflow_access_log_workflow_id ON workflow_access_log(workflow_id);
CREATE INDEX idx_workflow_access_log_accessed_at ON workflow_access_log(accessed_at DESC);

-- =============================================
-- TRIGGER: Automatyczne tworzenie workflow przy płatności
-- =============================================

CREATE OR REPLACE FUNCTION create_workflow_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_offer RECORD;
    v_workflow_id UUID;
    v_milestone JSONB;
    v_milestone_id UUID;
    v_task JSONB;
    v_milestone_index INTEGER := 0;
    v_task_index INTEGER;
    v_start_date DATE;
    v_deadline DATE;
    v_milestones JSONB;
BEGIN
    -- Tylko gdy status zmienia się na 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN

        -- Sprawdź czy workflow już istnieje
        IF EXISTS (SELECT 1 FROM workflows WHERE order_id = NEW.id) THEN
            RETURN NEW;
        END IF;

        -- Znajdź ofertę po nazwie (order.description = offer.name)
        SELECT id, name, milestones
        INTO v_offer
        FROM offers
        WHERE name = NEW.description
        LIMIT 1;

        -- Jeśli nie znaleziono oferty, stwórz pusty workflow
        IF v_offer.id IS NULL THEN
            v_milestones := '[]'::JSONB;
        ELSE
            v_milestones := COALESCE(v_offer.milestones, '[]'::JSONB);
        END IF;

        -- Utwórz workflow
        INSERT INTO workflows (
            order_id,
            customer_email,
            customer_name,
            customer_company,
            customer_phone,
            offer_name,
            offer_id,
            amount,
            started_at,
            milestones_snapshot
        ) VALUES (
            NEW.id,
            NEW.customer_email,
            NEW.customer_name,
            NEW.customer_company,
            NEW.customer_phone,
            COALESCE(NEW.description, 'Zamówienie'),
            v_offer.id,
            NEW.amount,
            COALESCE(NEW.paid_at, NOW()),
            v_milestones
        )
        RETURNING id INTO v_workflow_id;

        -- Ustaw datę startową na dzień płatności
        v_start_date := COALESCE(NEW.paid_at::DATE, CURRENT_DATE);

        -- Iteruj przez milestones i twórz rekordy
        FOR v_milestone IN SELECT * FROM jsonb_array_elements(v_milestones)
        LOOP
            -- Oblicz deadline
            v_deadline := v_start_date + (COALESCE((v_milestone->>'duration_days')::INTEGER, 1) - 1);

            -- Utwórz milestone
            INSERT INTO workflow_milestones (
                workflow_id,
                milestone_index,
                title,
                description,
                duration_days,
                start_date,
                deadline,
                deliverables,
                status
            ) VALUES (
                v_workflow_id,
                v_milestone_index,
                COALESCE(v_milestone->>'title', 'Etap ' || (v_milestone_index + 1)),
                v_milestone->>'description',
                COALESCE((v_milestone->>'duration_days')::INTEGER, 1),
                v_start_date,
                v_deadline,
                COALESCE(v_milestone->'deliverables', '[]'::JSONB),
                CASE WHEN v_milestone_index = 0 THEN 'in_progress' ELSE 'pending' END
            )
            RETURNING id INTO v_milestone_id;

            -- Utwórz tasks dla tego milestone
            v_task_index := 0;
            FOR v_task IN SELECT * FROM jsonb_array_elements(COALESCE(v_milestone->'tasks', '[]'::JSONB))
            LOOP
                INSERT INTO workflow_tasks (
                    milestone_id,
                    workflow_id,
                    task_index,
                    title,
                    responsible
                ) VALUES (
                    v_milestone_id,
                    v_workflow_id,
                    v_task_index,
                    COALESCE(v_task->>'title', 'Zadanie ' || (v_task_index + 1)),
                    COALESCE(v_task->>'responsible', 'team')
                );

                v_task_index := v_task_index + 1;
            END LOOP;

            -- Następny milestone zaczyna się dzień po deadline poprzedniego
            v_start_date := v_deadline + 1;
            v_milestone_index := v_milestone_index + 1;
        END LOOP;

        -- Ustaw pierwszy milestone jako aktualny
        IF v_milestone_index > 0 THEN
            UPDATE workflow_milestones
            SET status = 'in_progress', started_at = NOW()
            WHERE workflow_id = v_workflow_id AND milestone_index = 0;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na orders
DROP TRIGGER IF EXISTS trigger_create_workflow_on_payment ON orders;
CREATE TRIGGER trigger_create_workflow_on_payment
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_workflow_on_payment();

-- Trigger też dla INSERT (gdy zamówienie jest tworzone jako już opłacone)
DROP TRIGGER IF EXISTS trigger_create_workflow_on_payment_insert ON orders;
CREATE TRIGGER trigger_create_workflow_on_payment_insert
    AFTER INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'paid')
    EXECUTE FUNCTION create_workflow_on_payment();

-- =============================================
-- TRIGGER: Aktualizacja updated_at
-- =============================================

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view all workflows"
    ON workflows FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can insert workflows"
    ON workflows FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Team members can update workflows"
    ON workflows FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Team members can delete workflows"
    ON workflows FOR DELETE
    TO authenticated
    USING (true);

-- Anon może czytać przez token
CREATE POLICY "Anyone can view workflow by token"
    ON workflows FOR SELECT
    TO anon
    USING (true);  -- Token sprawdzany w aplikacji

-- Service role
CREATE POLICY "Service role can do everything on workflows"
    ON workflows FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Workflow Milestones
ALTER TABLE workflow_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view all workflow_milestones"
    ON workflow_milestones FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can insert workflow_milestones"
    ON workflow_milestones FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Team members can update workflow_milestones"
    ON workflow_milestones FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Team members can delete workflow_milestones"
    ON workflow_milestones FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Anyone can view workflow_milestones"
    ON workflow_milestones FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Service role can do everything on workflow_milestones"
    ON workflow_milestones FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Workflow Tasks
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view all workflow_tasks"
    ON workflow_tasks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can insert workflow_tasks"
    ON workflow_tasks FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Team members can update workflow_tasks"
    ON workflow_tasks FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Team members can delete workflow_tasks"
    ON workflow_tasks FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Anyone can view workflow_tasks"
    ON workflow_tasks FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Service role can do everything on workflow_tasks"
    ON workflow_tasks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Workflow Access Log
ALTER TABLE workflow_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view all workflow_access_log"
    ON workflow_access_log FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone can insert workflow_access_log"
    ON workflow_access_log FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on workflow_access_log"
    ON workflow_access_log FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- Widok z progress dla każdego workflow
CREATE OR REPLACE VIEW workflow_progress AS
SELECT
    w.id AS workflow_id,
    w.customer_email,
    w.customer_name,
    w.offer_name,
    w.status,
    w.started_at,
    w.unique_token,
    COUNT(wt.id) AS total_tasks,
    COUNT(wt.id) FILTER (WHERE wt.completed = true) AS completed_tasks,
    CASE
        WHEN COUNT(wt.id) > 0
        THEN ROUND((COUNT(wt.id) FILTER (WHERE wt.completed = true)::DECIMAL / COUNT(wt.id)) * 100)
        ELSE 0
    END AS progress_percent,
    (
        SELECT wm.title
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id AND wm.status = 'in_progress'
        ORDER BY wm.milestone_index
        LIMIT 1
    ) AS current_milestone_title,
    (
        SELECT wm.deadline
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id AND wm.status = 'in_progress'
        ORDER BY wm.milestone_index
        LIMIT 1
    ) AS current_milestone_deadline,
    (
        SELECT COUNT(*)
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id
    ) AS total_milestones,
    (
        SELECT COUNT(*)
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id AND wm.status = 'completed'
    ) AS completed_milestones
FROM workflows w
LEFT JOIN workflow_tasks wt ON wt.workflow_id = w.id
GROUP BY w.id;
