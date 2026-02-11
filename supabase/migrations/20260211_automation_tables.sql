-- =============================================
-- TN Automations - Email Flow Builder
-- =============================================

-- Tabela główna: definicje automatyzacji
CREATE TABLE IF NOT EXISTS automation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- Trigger configuration
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        -- Offer triggers
        'offer_created',
        'offer_viewed',
        'offer_reminder',
        'offer_expired',
        -- Payment triggers
        'payment_received',
        -- Workflow triggers
        'workflow_created',
        'stage_completed',
        'products_shared',
        'report_published',
        'branding_delivered',
        'sales_page_shared',
        'contract_signed'
    )),

    -- Filters for trigger (e.g. offer_type, stage_name)
    trigger_filters JSONB DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Kroki w automatyzacji (actions, conditions, delays)
CREATE TABLE IF NOT EXISTS automation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES automation_flows(id) ON DELETE CASCADE,

    -- Order in flow (0 = first step after trigger)
    step_order INTEGER NOT NULL DEFAULT 0,

    -- Step type
    step_type TEXT NOT NULL CHECK (step_type IN (
        'action',      -- wykonaj akcję (wyślij email, slack, etc.)
        'condition',   -- sprawdź warunek (if/else)
        'delay'        -- poczekaj X czasu
    )),

    -- Configuration based on step_type
    -- For action: { action_type: 'send_email', email_type: 'offer_created', ... }
    -- For condition: { field: 'email_opened', operator: 'eq', value: true }
    -- For delay: { delay_value: 2, delay_unit: 'days' }
    config JSONB NOT NULL DEFAULT '{}',

    -- Branching (for conditions)
    -- null = continue to next step_order
    -- UUID = jump to specific step
    next_step_on_true UUID REFERENCES automation_steps(id),
    next_step_on_false UUID REFERENCES automation_steps(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wykonania automatyzacji (tracking)
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES automation_flows(id) ON DELETE CASCADE,

    -- What entity triggered this (lead, workflow, client_offer, etc.)
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,

    -- Current state
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',     -- waiting to start
        'running',     -- in progress
        'waiting',     -- waiting for delay/condition
        'completed',   -- finished successfully
        'cancelled',   -- cancelled (e.g. user purchased)
        'failed'       -- error occurred
    )),

    -- Current step (null = not started yet)
    current_step_id UUID REFERENCES automation_steps(id),

    -- When to execute next step (for delays)
    scheduled_for TIMESTAMPTZ,

    -- Execution log
    logs JSONB DEFAULT '[]',

    -- Metadata (e.g. email address, offer details for variable replacement)
    context JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Prevent duplicate executions
    UNIQUE(flow_id, entity_type, entity_id)
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_automation_flows_trigger ON automation_flows(trigger_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_steps_flow ON automation_steps(flow_id, step_order);
CREATE INDEX IF NOT EXISTS idx_automation_executions_scheduled ON automation_executions(scheduled_for)
    WHERE status IN ('pending', 'waiting');
CREATE INDEX IF NOT EXISTS idx_automation_executions_entity ON automation_executions(entity_type, entity_id);

-- RLS policies
ALTER TABLE automation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to automation_flows"
    ON automation_flows FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to automation_steps"
    ON automation_steps FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to automation_executions"
    ON automation_executions FOR ALL
    USING (auth.role() = 'authenticated');

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_automation_flows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER automation_flows_updated_at
    BEFORE UPDATE ON automation_flows
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_flows_updated_at();

-- Global settings for automations
INSERT INTO settings (key, value) VALUES
    ('automations_master_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- Predefiniowane szablony automatyzacji
-- =============================================

-- Offer Flow: Full Package
INSERT INTO automation_flows (id, name, description, trigger_type, trigger_filters, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Oferta Full - Sekwencja email',
    'Automatyczne maile po wysłaniu oferty pełnego pakietu',
    'offer_created',
    '{"offer_type": "full"}',
    false
);

-- Steps for Full Offer flow
INSERT INTO automation_steps (flow_id, step_order, step_type, config) VALUES
-- Step 0: Wyślij email z ofertą
('a0000000-0000-0000-0000-000000000001', 0, 'action',
 '{"action_type": "send_email", "email_type": "offer_created"}'),
-- Step 1: Czekaj 3 dni
('a0000000-0000-0000-0000-000000000001', 1, 'delay',
 '{"delay_value": 3, "delay_unit": "days"}'),
-- Step 2: Sprawdź czy kupił
('a0000000-0000-0000-0000-000000000001', 2, 'condition',
 '{"field": "has_purchased", "operator": "eq", "value": false}'),
-- Step 3: Wyślij follow-up
('a0000000-0000-0000-0000-000000000001', 3, 'action',
 '{"action_type": "send_email", "email_type": "offer_reminder_halfway"}');

-- Offer Flow: Starter Package
INSERT INTO automation_flows (id, name, description, trigger_type, trigger_filters, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'Oferta Starter - Sekwencja email',
    'Automatyczne maile po wysłaniu oferty startowej',
    'offer_created',
    '{"offer_type": "starter"}',
    false
);

-- Steps for Starter Offer flow
INSERT INTO automation_steps (flow_id, step_order, step_type, config) VALUES
-- Step 0: Wyślij email z ofertą
('a0000000-0000-0000-0000-000000000002', 0, 'action',
 '{"action_type": "send_email", "email_type": "offer_created"}'),
-- Step 1: Czekaj 2 dni
('a0000000-0000-0000-0000-000000000002', 1, 'delay',
 '{"delay_value": 2, "delay_unit": "days"}'),
-- Step 2: Wyślij reminder
('a0000000-0000-0000-0000-000000000002', 2, 'action',
 '{"action_type": "send_email", "email_type": "offer_reminder_halfway"}');

-- Workflow Created Flow
INSERT INTO automation_flows (id, name, description, trigger_type, trigger_filters, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'Workflow - Powitalny email',
    'Email po otrzymaniu płatności i utworzeniu projektu',
    'workflow_created',
    '{}',
    false
);

INSERT INTO automation_steps (flow_id, step_order, step_type, config) VALUES
('a0000000-0000-0000-0000-000000000003', 0, 'action',
 '{"action_type": "send_email", "email_type": "workflow_created"}');

-- Stage Completed Flow
INSERT INTO automation_flows (id, name, description, trigger_type, trigger_filters, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000004',
    'Etap ukończony - Powiadomienie',
    'Email do klienta gdy etap workflow zostaje ukończony',
    'stage_completed',
    '{}',
    false
);

INSERT INTO automation_steps (flow_id, step_order, step_type, config) VALUES
('a0000000-0000-0000-0000-000000000004', 0, 'action',
 '{"action_type": "send_email", "email_type": "workflow_stage_completed"}');

COMMENT ON TABLE automation_flows IS 'Definicje automatyzacji email (flow builder)';
COMMENT ON TABLE automation_steps IS 'Kroki w automatyzacji (akcje, warunki, opóźnienia)';
COMMENT ON TABLE automation_executions IS 'Historia wykonań automatyzacji';
