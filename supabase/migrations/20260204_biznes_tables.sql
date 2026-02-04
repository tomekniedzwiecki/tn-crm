-- =====================================================
-- TN BIZNES - Tabele do zarzadzania finansami
-- Wersja z szablonem kosztow stalych
-- =====================================================

-- Usuniecie starych tabel i widokow (jesli istnieja)
DROP VIEW IF EXISTS biznes_pipeline_summary CASCADE;
DROP VIEW IF EXISTS biznes_plan_realization CASCADE;
DROP VIEW IF EXISTS biznes_monthly_summary CASCADE;
DROP VIEW IF EXISTS biznes_all_revenues CASCADE;

DROP TABLE IF EXISTS biznes_costs CASCADE;
DROP TABLE IF EXISTS biznes_recurring_costs CASCADE;
DROP TABLE IF EXISTS biznes_cost_versions CASCADE;
DROP TABLE IF EXISTS biznes_cost_definitions CASCADE;
DROP TABLE IF EXISTS biznes_revenues CASCADE;
DROP TABLE IF EXISTS biznes_plans CASCADE;

-- =====================================================
-- TABELE
-- =====================================================

-- 1. Szablon kosztow stalych (miesieczne, powtarzalne)
CREATE TABLE biznes_recurring_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Rzeczywiste koszty (wygenerowane z szablonu + jednorazowe)
CREATE TABLE biznes_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurring_cost_id UUID REFERENCES biznes_recurring_costs(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    cost_type TEXT NOT NULL CHECK (cost_type IN ('recurring', 'one_time')),
    month DATE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Przychody reczne (spoza CRM)
CREATE TABLE biznes_revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    is_received BOOLEAN DEFAULT false,
    received_at TIMESTAMPTZ,
    invoice_number TEXT,
    client_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Plany finansowe
CREATE TABLE biznes_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'quarterly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    target_revenue DECIMAL(10,2) NOT NULL,
    target_costs_limit DECIMAL(10,2),
    target_profit DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(plan_type, period_start)
);

-- =====================================================
-- WIDOKI
-- =====================================================

-- Polaczone przychody (CRM + reczne)
CREATE OR REPLACE VIEW biznes_all_revenues AS
SELECT
    id,
    description AS name,
    customer_name AS client_name,
    customer_company,
    amount,
    COALESCE(paid_at, created_at)::DATE AS date,
    'crm_order' AS source,
    order_number AS reference
FROM orders
WHERE status = 'paid'

UNION ALL

SELECT
    id,
    name,
    client_name,
    NULL AS customer_company,
    amount,
    date,
    'manual' AS source,
    invoice_number AS reference
FROM biznes_revenues
WHERE is_received = true;

-- Podsumowanie miesieczne
CREATE OR REPLACE VIEW biznes_monthly_summary AS
WITH monthly_revenues AS (
    SELECT
        DATE_TRUNC('month', date) AS month,
        SUM(amount) AS total
    FROM biznes_all_revenues
    GROUP BY DATE_TRUNC('month', date)
),
monthly_costs AS (
    SELECT
        DATE_TRUNC('month', month) AS month,
        SUM(amount) AS total
    FROM biznes_costs
    GROUP BY DATE_TRUNC('month', month)
)
SELECT
    COALESCE(r.month, c.month) AS month,
    COALESCE(r.total, 0) AS total_revenues,
    COALESCE(c.total, 0) AS total_costs,
    COALESCE(r.total, 0) - COALESCE(c.total, 0) AS profit
FROM monthly_revenues r
FULL OUTER JOIN monthly_costs c ON r.month = c.month
ORDER BY month DESC;

-- Realizacja planu
CREATE OR REPLACE VIEW biznes_plan_realization AS
SELECT
    p.*,
    COALESCE((
        SELECT SUM(amount) FROM biznes_all_revenues
        WHERE date BETWEEN p.period_start AND p.period_end
    ), 0) AS actual_revenue,
    COALESCE((
        SELECT SUM(amount) FROM biznes_costs c
        WHERE c.month BETWEEN p.period_start AND p.period_end
    ), 0) AS actual_costs,
    CASE
        WHEN p.target_revenue > 0 THEN
            ROUND((COALESCE((SELECT SUM(amount) FROM biznes_all_revenues
                             WHERE date BETWEEN p.period_start AND p.period_end), 0)
                   / p.target_revenue * 100)::numeric, 1)
        ELSE 0
    END AS revenue_realization_percent,
    COALESCE((SELECT SUM(amount) FROM biznes_all_revenues
              WHERE date BETWEEN p.period_start AND p.period_end), 0)
    - COALESCE((SELECT SUM(amount) FROM biznes_costs c
                WHERE c.month BETWEEN p.period_start AND p.period_end), 0)
    AS actual_profit
FROM biznes_plans p;

-- Pipeline summary
CREATE OR REPLACE VIEW biznes_pipeline_summary AS
SELECT
    DATE_TRUNC('month', CURRENT_DATE) AS month,
    COUNT(*) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')) AS active_leads,
    SUM(deal_value) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')) AS pipeline_value,
    COUNT(*) FILTER (WHERE status = 'won' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS won_this_month,
    COUNT(*) FILTER (WHERE status = 'lost' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS lost_this_month
FROM leads;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE biznes_recurring_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE biznes_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE biznes_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE biznes_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "biznes_recurring_costs_auth" ON biznes_recurring_costs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "biznes_costs_auth" ON biznes_costs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "biznes_revenues_auth" ON biznes_revenues FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "biznes_plans_auth" ON biznes_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- INDEKSY
-- =====================================================

CREATE INDEX idx_biznes_recurring_costs_active ON biznes_recurring_costs(is_active);
CREATE INDEX idx_biznes_costs_month ON biznes_costs(month);
CREATE INDEX idx_biznes_costs_type ON biznes_costs(cost_type);
CREATE INDEX idx_biznes_costs_recurring ON biznes_costs(recurring_cost_id);
CREATE INDEX idx_biznes_revenues_date ON biznes_revenues(date);
CREATE INDEX idx_biznes_plans_period ON biznes_plans(period_start, period_end);
