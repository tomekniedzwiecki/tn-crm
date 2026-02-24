-- =====================================================
-- Tabela wydatkow reklamowych
-- =====================================================

CREATE TABLE IF NOT EXISTS ad_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('google', 'meta', 'tiktok')),
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: jeden wpis na dzien na zrodlo
    UNIQUE(date, source)
);

-- RLS
ALTER TABLE ad_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage ad_expenses"
    ON ad_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ad_expenses_date ON ad_expenses(date);
CREATE INDEX IF NOT EXISTS idx_ad_expenses_source ON ad_expenses(source);
CREATE INDEX IF NOT EXISTS idx_ad_expenses_date_source ON ad_expenses(date, source);
