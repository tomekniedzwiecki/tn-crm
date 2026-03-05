-- =====================================================
-- Kolejka generowania follow-upów
-- =====================================================

CREATE TABLE IF NOT EXISTS followup_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    contact_name TEXT,
    lead_status TEXT,
    hours_since_contact INTEGER,

    -- Status kolejki
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'done', 'failed')),
    attempts INTEGER DEFAULT 0,
    last_error TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    -- Unikaj duplikatów
    UNIQUE(lead_id, status)
);

CREATE INDEX IF NOT EXISTS idx_followup_queue_status ON followup_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_followup_queue_lead ON followup_queue(lead_id);

-- RLS
ALTER TABLE followup_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to followup_queue"
    ON followup_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
