-- =====================================================
-- EMPLOYEE CONTRACTS - Umowy i koszty pracownikow
-- Dynamiczne obliczanie kosztow na podstawie sprzedazy
-- =====================================================

-- 1. Tabela umow pracownikow
CREATE TABLE employee_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,

    -- Podstawowe dane umowy
    contract_type TEXT NOT NULL CHECK (contract_type IN ('B2B', 'UoP')),
    base_salary DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Progi prowizji (JSONB array)
    -- Format: [{"min": 0, "max": 30000, "rate": 0}, {"min": 30000, "max": 50000, "rate": 0.09}, ...]
    -- UWAGA: Kwoty w progach sa NETTO!
    commission_tiers JSONB NOT NULL DEFAULT '[]',

    -- Prowizja od sklepow (sprzedaz nie powiazana z leadami)
    shop_commission_rate DECIMAL(5,4) DEFAULT 0, -- np. 0.02 dla 2%

    -- Bonus miesieczny (kwoty NETTO)
    monthly_bonus_threshold DECIMAL(10,2), -- np. 100000
    monthly_bonus_amount DECIMAL(10,2),    -- np. 2000

    -- Bonus kwartalny (kwoty NETTO)
    quarterly_bonus_threshold DECIMAL(10,2), -- np. 300000
    quarterly_bonus_amount DECIMAL(10,2),    -- np. 3000

    -- Okres obowiazywania
    effective_from DATE NOT NULL,
    effective_to DATE, -- NULL = aktualna umowa

    -- Metadane
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Tylko jedna aktywna umowa na pracownika w danym okresie
    UNIQUE(team_member_id, effective_from)
);

-- 2. Tabela obliczonych kosztow miesiecznych
CREATE TABLE employee_monthly_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- Pierwszy dzien miesiaca, np. '2026-02-01'

    -- Rozklad kosztow
    base_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission DECIMAL(10,2) NOT NULL DEFAULT 0,
    monthly_bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
    quarterly_bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Dane zrodlowe (do referencji)
    total_sales_netto DECIMAL(10,2) NOT NULL DEFAULT 0,
    orders_count INTEGER NOT NULL DEFAULT 0,

    -- Powiazanie z biznes_costs
    biznes_cost_id UUID REFERENCES biznes_costs(id) ON DELETE SET NULL,

    -- Snapshot umowy uzytej do obliczen
    contract_snapshot JSONB,
    calculated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(team_member_id, month)
);

-- =====================================================
-- INDEKSY
-- =====================================================

CREATE INDEX idx_employee_contracts_team_member ON employee_contracts(team_member_id);
CREATE INDEX idx_employee_contracts_effective ON employee_contracts(effective_from, effective_to);
CREATE INDEX idx_employee_monthly_costs_month ON employee_monthly_costs(month);
CREATE INDEX idx_employee_monthly_costs_team_member ON employee_monthly_costs(team_member_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE employee_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_monthly_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee_contracts_auth" ON employee_contracts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "employee_monthly_costs_auth" ON employee_monthly_costs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- TRIGGER dla updated_at
-- =====================================================

CREATE TRIGGER update_employee_contracts_updated_at
    BEFORE UPDATE ON employee_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - Maciej Kanczewski
-- =====================================================

INSERT INTO employee_contracts (
    team_member_id,
    contract_type,
    base_salary,
    commission_tiers,
    shop_commission_rate,
    monthly_bonus_threshold,
    monthly_bonus_amount,
    quarterly_bonus_threshold,
    quarterly_bonus_amount,
    effective_from,
    notes
)
SELECT
    id,
    'B2B',
    10000.00,
    '[
        {"min": 0, "max": 30000, "rate": 0},
        {"min": 30000, "max": 50000, "rate": 0.09},
        {"min": 50000, "max": 70000, "rate": 0.10},
        {"min": 70000, "max": 100000, "rate": 0.12},
        {"min": 100000, "max": 150000, "rate": 0.14}
    ]'::jsonb,
    0.02,
    100000.00,
    2000.00,
    300000.00,
    3000.00,
    '2026-01-01',
    'Pierwsza umowa B2B'
FROM team_members
WHERE name = 'Maciej Kanczewski'
LIMIT 1;
