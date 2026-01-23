-- ============================================
-- TN STACK - Tool Management Tables
-- ============================================

-- Kategorie narzędzi (własne)
CREATE TABLE IF NOT EXISTS tool_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1', -- kolor do wyświetlania
    icon TEXT DEFAULT 'ph-folder', -- ikona phosphor
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domyślne kategorie
INSERT INTO tool_categories (name, color, icon, sort_order) VALUES
    ('AI', '#8b5cf6', 'ph-brain', 1),
    ('Dev Tools', '#3b82f6', 'ph-code', 2),
    ('Design', '#ec4899', 'ph-palette', 3),
    ('Infrastructure', '#f59e0b', 'ph-cloud', 4),
    ('Marketing', '#10b981', 'ph-megaphone', 5),
    ('Analytics', '#06b6d4', 'ph-chart-line', 6),
    ('Communication', '#6366f1', 'ph-chat-circle', 7),
    ('Productivity', '#84cc16', 'ph-lightning', 8),
    ('Other', '#71717a', 'ph-folder', 99)
ON CONFLICT DO NOTHING;

-- Narzędzia
CREATE TABLE IF NOT EXISTS tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    icon_url TEXT, -- URL do logo narzędzia
    category_id UUID REFERENCES tool_categories(id) ON DELETE SET NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'paused', 'cancelled')),

    -- Plan i koszty
    plan_name TEXT, -- Free, Pro, Enterprise, etc.
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'one_time', 'free', 'lifetime')),
    cost DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'PLN' CHECK (currency IN ('PLN', 'USD', 'EUR', 'GBP')),

    -- Daty
    next_payment_date DATE,
    trial_ends_at DATE,
    subscription_started_at DATE,

    -- Karta Revolut
    card_name TEXT, -- nazwa karty w Revolut
    card_last_four TEXT, -- ostatnie 4 cyfry

    -- Dodatkowe
    login_email TEXT, -- email użyty do rejestracji
    notes TEXT,
    tags TEXT[], -- własne tagi

    -- Meta
    created_by UUID REFERENCES team_members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historia płatności
CREATE TABLE IF NOT EXISTS tool_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'PLN',
    paid_at DATE NOT NULL,
    payment_method TEXT, -- card, bank_transfer
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_next_payment ON tools(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_tools_billing_cycle ON tools(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_tool_payments_tool ON tool_payments(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_payments_paid_at ON tool_payments(paid_at DESC);

-- Trigger aktualizacji updated_at
CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_categories_updated_at
    BEFORE UPDATE ON tool_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_payments ENABLE ROW LEVEL SECURITY;

-- Policies dla tool_categories
CREATE POLICY "Team members can view categories"
    ON tool_categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can manage categories"
    ON tool_categories FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policies dla tools
CREATE POLICY "Team members can view tools"
    ON tools FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can insert tools"
    ON tools FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Team members can update tools"
    ON tools FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Team members can delete tools"
    ON tools FOR DELETE
    TO authenticated
    USING (true);

-- Policies dla tool_payments
CREATE POLICY "Team members can view payments"
    ON tool_payments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can manage payments"
    ON tool_payments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- REVOLUT BUSINESS INTEGRATION
-- ============================================

-- Ustawienia integracji Revolut
CREATE TABLE IF NOT EXISTS revolut_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT, -- Client ID z Revolut API
    -- Uwaga: klucze API powinny być przechowywane w secrets Supabase, nie w DB
    sandbox_mode BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_from_date DATE DEFAULT CURRENT_DATE - INTERVAL '90 days',
    auto_sync_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transakcje z Revolut (do dopasowania)
CREATE TABLE IF NOT EXISTS revolut_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revolut_id TEXT UNIQUE NOT NULL, -- ID transakcji z Revolut
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'PLN',
    description TEXT,
    merchant_name TEXT,
    card_last_four TEXT,
    transaction_date TIMESTAMPTZ NOT NULL,
    matched_tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
    matched_at TIMESTAMPTZ,
    auto_matched BOOLEAN DEFAULT false, -- czy dopasowano automatycznie
    ignored BOOLEAN DEFAULT false, -- czy zignorować (nie dotyczy narzędzi)
    raw_data JSONB, -- pełne dane z API
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla Revolut
CREATE INDEX IF NOT EXISTS idx_revolut_tx_date ON revolut_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_revolut_tx_matched ON revolut_transactions(matched_tool_id);
CREATE INDEX IF NOT EXISTS idx_revolut_tx_merchant ON revolut_transactions(merchant_name);
CREATE INDEX IF NOT EXISTS idx_revolut_tx_unmatched ON revolut_transactions(matched_tool_id) WHERE matched_tool_id IS NULL AND ignored = false;

-- Reguły auto-dopasowania (merchant_name -> tool)
CREATE TABLE IF NOT EXISTS revolut_matching_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_pattern TEXT NOT NULL, -- wzorzec do dopasowania (ILIKE)
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0, -- wyższy = ważniejszy
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revolut_rules_tool ON revolut_matching_rules(tool_id);

-- Trigger aktualizacji updated_at dla revolut_settings
CREATE TRIGGER update_revolut_settings_updated_at
    BEFORE UPDATE ON revolut_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS dla Revolut
ALTER TABLE revolut_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE revolut_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revolut_matching_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can manage revolut settings"
    ON revolut_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Team members can manage revolut transactions"
    ON revolut_transactions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Team members can manage matching rules"
    ON revolut_matching_rules FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- VIEWS
-- ============================================

-- Widok pomocniczy: narzędzia z kategorią i sumą płatności
CREATE OR REPLACE VIEW tools_with_details AS
SELECT
    t.*,
    tc.name as category_name,
    tc.color as category_color,
    tc.icon as category_icon,
    COALESCE(p.total_paid, 0) as total_paid,
    COALESCE(p.payment_count, 0) as payment_count,
    p.last_payment_date
FROM tools t
LEFT JOIN tool_categories tc ON t.category_id = tc.id
LEFT JOIN (
    SELECT
        tool_id,
        SUM(amount) as total_paid,
        COUNT(*) as payment_count,
        MAX(paid_at) as last_payment_date
    FROM tool_payments
    GROUP BY tool_id
) p ON t.id = p.tool_id;
