-- =============================================
-- WORKFLOW VIDEO - Etap 2
-- =============================================
-- Tabela do przechowywania danych etapu Video dla workflow
-- Etap 2: Nagranie video promocyjnego

CREATE TABLE IF NOT EXISTS workflow_video (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    -- Admin controls
    is_active BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMPTZ,

    -- Client acceptance
    stage_accepted BOOLEAN DEFAULT FALSE,
    stage_accepted_at TIMESTAMPTZ,

    -- Voice message (WhatsApp style)
    voice_message_url TEXT,
    voice_message_duration INTEGER, -- seconds

    -- Video scenarios (JSONB array)
    -- Format: [{id, title, description, tips}]
    video_scenarios JSONB DEFAULT '[]',

    -- Social profiles (JSONB) - filled by client
    -- Format: {tiktok: url, youtube: url, instagram: url}
    social_profiles JSONB DEFAULT '{}',

    -- Video links from client (JSONB array)
    -- Format: [{url, title, uploaded_at}]
    video_links JSONB DEFAULT '[]',

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workflow_id)
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_workflow_video_workflow ON workflow_video(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_video_active ON workflow_video(is_active) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE workflow_video ENABLE ROW LEVEL SECURITY;

-- Admin ma pełny dostęp
CREATE POLICY "Admin full access video" ON workflow_video
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Klient widzi tylko aktywowane rekordy
CREATE POLICY "Client read active video" ON workflow_video
    FOR SELECT TO anon USING (is_active = TRUE);

-- Klient może aktualizować swoje dane (akceptacja, profile, linki do video)
CREATE POLICY "Client update own data" ON workflow_video
    FOR UPDATE TO anon
    USING (is_active = TRUE)
    WITH CHECK (is_active = TRUE);

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_workflow_video_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_video_updated_at
    BEFORE UPDATE ON workflow_video
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_video_updated_at();

-- Aktualizuj constraint z nowym trigger_type
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
    'offer_created', 'offer_viewed', 'offer_expired',
    'payment_received', 'contract_signed',
    'workflow_created', 'stage_completed',
    'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared',
    'takedrop_activated', 'video_activated'
));

COMMENT ON TABLE workflow_video IS 'Dane etapu Video dla workflow - etap 2';
COMMENT ON COLUMN workflow_video.is_active IS 'Admin musi ręcznie aktywować aby klient widział tę zakładkę';
COMMENT ON COLUMN workflow_video.stage_accepted IS 'Klient akceptuje etap po obejrzeniu ekranu celebracji';
COMMENT ON COLUMN workflow_video.video_scenarios IS 'Scenariusze video do nagrania przez klienta';
COMMENT ON COLUMN workflow_video.social_profiles IS 'Linki do profili społecznościowych klienta';
COMMENT ON COLUMN workflow_video.video_links IS 'Linki do nagranych video od klienta';
