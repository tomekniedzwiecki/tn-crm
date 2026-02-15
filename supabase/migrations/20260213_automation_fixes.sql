-- =============================================
-- Automation System Fixes
-- =============================================

-- 1. Add missing trigger types (video_activated, takedrop_activated)
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;

ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
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
    -- New triggers
    'video_activated',
    'takedrop_activated'
));

-- 2. Add idempotency tracking for emails
ALTER TABLE automation_executions
ADD COLUMN IF NOT EXISTS sent_email_ids TEXT[] DEFAULT '{}';

COMMENT ON COLUMN automation_executions.sent_email_ids IS 'Array of Resend email IDs to prevent duplicate sends';

-- 3. Create function to safely insert execution (prevent race condition)
CREATE OR REPLACE FUNCTION create_automation_execution(
    p_flow_id UUID,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_context JSONB,
    p_logs JSONB
) RETURNS UUID AS $$
DECLARE
    v_execution_id UUID;
BEGIN
    -- Try to insert, if conflict return existing id
    INSERT INTO automation_executions (flow_id, entity_type, entity_id, status, context, logs)
    VALUES (p_flow_id, p_entity_type, p_entity_id, 'pending', p_context, p_logs)
    ON CONFLICT (flow_id, entity_type, entity_id) DO NOTHING
    RETURNING id INTO v_execution_id;

    -- If nothing inserted (already exists), get existing id
    IF v_execution_id IS NULL THEN
        SELECT id INTO v_execution_id
        FROM automation_executions
        WHERE flow_id = p_flow_id
          AND entity_type = p_entity_type
          AND entity_id = p_entity_id;
    END IF;

    RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Add index for faster idempotency checks
CREATE INDEX IF NOT EXISTS idx_automation_executions_flow_entity
ON automation_executions(flow_id, entity_type, entity_id);
