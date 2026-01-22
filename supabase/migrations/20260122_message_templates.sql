-- Message templates for WhatsApp/SMS outreach
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',  -- 'general', 'followup', 'reactivation', etc.
    created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_created_at ON message_templates(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view templates
CREATE POLICY "Authenticated users can view message_templates" ON message_templates
    FOR SELECT TO authenticated USING (true);

-- All authenticated users can create templates
CREATE POLICY "Authenticated users can insert message_templates" ON message_templates
    FOR INSERT TO authenticated WITH CHECK (true);

-- All authenticated users can update templates
CREATE POLICY "Authenticated users can update message_templates" ON message_templates
    FOR UPDATE TO authenticated USING (true);

-- All authenticated users can delete templates
CREATE POLICY "Authenticated users can delete message_templates" ON message_templates
    FOR DELETE TO authenticated USING (true);

-- Service role full access
CREATE POLICY "Service role full access to message_templates" ON message_templates
    FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE message_templates IS 'Shared message templates for WhatsApp/SMS outreach campaigns';
COMMENT ON COLUMN message_templates.category IS 'Template category: general, followup, reactivation, etc.';
