-- =============================================
-- OUTREACH SYSTEM TABLES
-- For email campaigns to existing contact bases
-- =============================================

-- 1. Contacts table (imported databases)
CREATE TABLE IF NOT EXISTS outreach_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    phone TEXT,

    -- LTV data from import
    ltv_pln DECIMAL(12,2),
    transaction_count INTEGER,
    refunded_total_pln DECIMAL(12,2),
    first_purchase TIMESTAMPTZ,
    last_purchase TIMESTAMPTZ,
    unique_products INTEGER,
    products TEXT[],

    -- Flexible additional data
    custom_data JSONB DEFAULT '{}',

    -- Source tracking
    source TEXT NOT NULL DEFAULT 'manual',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique email per source to allow same email in different imports
    UNIQUE(email, source)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_email ON outreach_contacts(email);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_source ON outreach_contacts(source);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_ltv ON outreach_contacts(ltv_pln DESC);


-- 2. Campaigns table
CREATE TABLE IF NOT EXISTS outreach_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,

    -- Sending configuration
    daily_limit INTEGER NOT NULL DEFAULT 50,
    follow_up_delay_days INTEGER NOT NULL DEFAULT 7,

    -- Email 1 (initial)
    email_1_subject TEXT NOT NULL,
    email_1_body TEXT NOT NULL,

    -- Email 2 (follow-up, optional)
    email_2_subject TEXT,
    email_2_body TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),

    -- Filter contacts (optional)
    contact_filter JSONB DEFAULT '{}',  -- e.g., {"min_ltv": 1000, "source": "klienci_ltv"}

    -- Stats (denormalized for quick access)
    total_contacts INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    followed_up_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);


-- 3. Sends tracking (contact-campaign relationship)
CREATE TABLE IF NOT EXISTS outreach_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES outreach_contacts(id) ON DELETE CASCADE,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'followed_up', 'replied', 'bounced', 'excluded')),

    -- Send timestamps
    email_1_sent_at TIMESTAMPTZ,
    email_2_sent_at TIMESTAMPTZ,

    -- Reply tracking (for Resend Inbound)
    replied_at TIMESTAMPTZ,
    reply_content TEXT,
    reply_from_email TEXT,

    -- Exclusion reason if excluded
    excluded_reason TEXT,

    -- Resend message IDs for tracking
    email_1_resend_id TEXT,
    email_2_resend_id TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One entry per contact per campaign
    UNIQUE(campaign_id, contact_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_outreach_sends_campaign ON outreach_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sends_contact ON outreach_sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sends_status ON outreach_sends(status);
CREATE INDEX IF NOT EXISTS idx_outreach_sends_pending ON outreach_sends(campaign_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_outreach_sends_needs_followup ON outreach_sends(campaign_id, status, email_1_sent_at) WHERE status = 'sent';


-- 4. Enable RLS
ALTER TABLE outreach_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_sends ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (CRM admins)
CREATE POLICY "Authenticated users can view outreach_contacts" ON outreach_contacts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert outreach_contacts" ON outreach_contacts
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update outreach_contacts" ON outreach_contacts
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete outreach_contacts" ON outreach_contacts
    FOR DELETE TO authenticated USING (true);

-- Same for campaigns
CREATE POLICY "Authenticated users can view outreach_campaigns" ON outreach_campaigns
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert outreach_campaigns" ON outreach_campaigns
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update outreach_campaigns" ON outreach_campaigns
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete outreach_campaigns" ON outreach_campaigns
    FOR DELETE TO authenticated USING (true);

-- Same for sends
CREATE POLICY "Authenticated users can view outreach_sends" ON outreach_sends
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert outreach_sends" ON outreach_sends
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update outreach_sends" ON outreach_sends
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete outreach_sends" ON outreach_sends
    FOR DELETE TO authenticated USING (true);

-- Service role policies for Edge Functions
CREATE POLICY "Service role full access to outreach_contacts" ON outreach_contacts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to outreach_campaigns" ON outreach_campaigns
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to outreach_sends" ON outreach_sends
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 5. Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_outreach_contacts_updated_at ON outreach_contacts;
CREATE TRIGGER update_outreach_contacts_updated_at
    BEFORE UPDATE ON outreach_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outreach_campaigns_updated_at ON outreach_campaigns;
CREATE TRIGGER update_outreach_campaigns_updated_at
    BEFORE UPDATE ON outreach_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outreach_sends_updated_at ON outreach_sends;
CREATE TRIGGER update_outreach_sends_updated_at
    BEFORE UPDATE ON outreach_sends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
