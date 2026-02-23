-- =============================================
-- Add lead_created trigger type and automation
-- =============================================

-- 1. Add lead_created to allowed trigger types
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check CHECK (trigger_type IN (
    -- Lead triggers
    'lead_created',
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
    'contract_signed',
    -- Video/TakeDrop triggers
    'video_activated',
    'takedrop_activated',
    -- Invoice triggers
    'invoice_sent',
    'proforma_generated'
));

-- 2. Create lead_created automation flow
INSERT INTO automation_flows (id, name, description, trigger_type, trigger_filters, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000010',
    'Nowy lead - Potwierdzenie zapisu',
    'Automatyczny email po zapisaniu się przez formularz',
    'lead_created',
    '{}',
    true  -- aktywna od razu
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    trigger_type = EXCLUDED.trigger_type,
    is_active = EXCLUDED.is_active;

-- 3. Create step for sending confirmation email
INSERT INTO automation_steps (id, flow_id, step_order, step_type, config)
VALUES (
    'b0000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000010',
    0,
    'action',
    '{"action_type": "send_email", "email_type": "zapisy_confirmation"}'
) ON CONFLICT (id) DO UPDATE SET
    config = EXCLUDED.config;
