-- =============================================
-- EMAIL TRACKING - Opens & Clicks
-- =============================================
-- Adds tracking columns and creates webhook support

-- 1. Add tracking columns to email_messages
ALTER TABLE email_messages
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_links JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bounce_type TEXT,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS automation_flow_id UUID REFERENCES automation_flows(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS automation_execution_id UUID REFERENCES automation_executions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS email_type TEXT;

-- 2. Add index for automation tracking
CREATE INDEX IF NOT EXISTS idx_email_messages_automation ON email_messages(automation_flow_id) WHERE automation_flow_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_messages_email_type ON email_messages(email_type);
CREATE INDEX IF NOT EXISTS idx_email_messages_opened ON email_messages(opened_at) WHERE opened_at IS NOT NULL;

-- 3. Update status check to include new statuses
ALTER TABLE email_messages DROP CONSTRAINT IF EXISTS email_messages_status_check;
ALTER TABLE email_messages ADD CONSTRAINT email_messages_status_check
    CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'received'));

-- 4. Function to update email tracking from webhook
CREATE OR REPLACE FUNCTION update_email_tracking(
    p_resend_id TEXT,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_email_id UUID;
    v_link TEXT;
BEGIN
    -- Find email by resend_id
    SELECT id INTO v_email_id
    FROM email_messages
    WHERE resend_id = p_resend_id
    LIMIT 1;

    IF v_email_id IS NULL THEN
        RETURN FALSE;
    END IF;

    CASE p_event_type
        WHEN 'email.delivered' THEN
            UPDATE email_messages
            SET delivered_at = COALESCE(delivered_at, NOW()),
                status = 'delivered'
            WHERE id = v_email_id;

        WHEN 'email.opened' THEN
            UPDATE email_messages
            SET opened_at = COALESCE(opened_at, NOW()),
                opened_count = opened_count + 1,
                status = CASE WHEN status NOT IN ('clicked', 'bounced') THEN 'opened' ELSE status END
            WHERE id = v_email_id;

        WHEN 'email.clicked' THEN
            v_link := p_event_data->>'link';
            UPDATE email_messages
            SET clicked_at = COALESCE(clicked_at, NOW()),
                clicked_count = clicked_count + 1,
                clicked_links = CASE
                    WHEN v_link IS NOT NULL THEN clicked_links || jsonb_build_object('link', v_link, 'at', NOW())
                    ELSE clicked_links
                END,
                status = 'clicked'
            WHERE id = v_email_id;

        WHEN 'email.bounced' THEN
            UPDATE email_messages
            SET bounced_at = NOW(),
                bounce_type = p_event_data->>'type',
                status = 'bounced'
            WHERE id = v_email_id;

        ELSE
            RETURN FALSE;
    END CASE;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. View for email statistics by lead
CREATE OR REPLACE VIEW lead_email_stats AS
SELECT
    lead_id,
    COUNT(*) as total_emails,
    COUNT(*) FILTER (WHERE direction = 'outbound') as sent_count,
    COUNT(*) FILTER (WHERE direction = 'inbound') as received_count,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened_count,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked_count,
    COUNT(*) FILTER (WHERE status = 'bounced') as bounced_count,
    MAX(created_at) as last_email_at,
    MAX(opened_at) as last_opened_at
FROM email_messages
WHERE lead_id IS NOT NULL
GROUP BY lead_id;

-- 6. View for email statistics by automation
CREATE OR REPLACE VIEW automation_email_stats AS
SELECT
    automation_flow_id,
    email_type,
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE delivered_at IS NOT NULL) as delivered_count,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened_count,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked_count,
    COUNT(*) FILTER (WHERE status = 'bounced') as bounced_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE opened_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as open_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as click_rate
FROM email_messages
WHERE automation_flow_id IS NOT NULL OR email_type IS NOT NULL
GROUP BY automation_flow_id, email_type;

COMMENT ON COLUMN email_messages.opened_at IS 'First open timestamp';
COMMENT ON COLUMN email_messages.opened_count IS 'Total number of opens';
COMMENT ON COLUMN email_messages.clicked_at IS 'First click timestamp';
COMMENT ON COLUMN email_messages.clicked_links IS 'Array of clicked links with timestamps';
COMMENT ON COLUMN email_messages.automation_flow_id IS 'Reference to automation that sent this email';
COMMENT ON COLUMN email_messages.email_type IS 'Type of email (offer_created, workflow_created, etc.)';
