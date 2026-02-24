-- =====================================================
-- EMPLOYEE BONUSES - Bonusy jednorazowe i okolicznosciowe
-- =====================================================

CREATE TABLE employee_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- Pierwszy dzien miesiaca, np. '2026-02-01'

    name TEXT NOT NULL, -- np. "Bonus okolicznosciowy", "Premia swiateczna"
    amount DECIMAL(10,2) NOT NULL,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indeksy
CREATE INDEX idx_employee_bonuses_team_member ON employee_bonuses(team_member_id);
CREATE INDEX idx_employee_bonuses_month ON employee_bonuses(month);

-- RLS
ALTER TABLE employee_bonuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee_bonuses_auth" ON employee_bonuses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
