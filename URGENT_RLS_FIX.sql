-- =====================================================
-- CRITICAL SECURITY FIX - RUN IMMEDIATELY IN SUPABASE DASHBOARD
-- =====================================================
-- Go to: https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/sql/new
-- Paste this entire file and click RUN
-- =====================================================

-- 1. ENABLE RLS ON TABLES
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_progress ENABLE ROW LEVEL SECURITY;

-- 2. DROP AND RECREATE POLICIES
DROP POLICY IF EXISTS "leads_authenticated_all" ON leads;
DROP POLICY IF EXISTS "orders_authenticated_all" ON orders;
DROP POLICY IF EXISTS "workflow_progress_authenticated_all" ON workflow_progress;

CREATE POLICY "leads_authenticated_all" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "orders_authenticated_all" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "workflow_progress_authenticated_all" ON workflow_progress FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. RECREATE VIEWS WITH SECURITY_INVOKER
DROP VIEW IF EXISTS biznes_pipeline_summary CASCADE;
DROP VIEW IF EXISTS biznes_plan_realization CASCADE;
DROP VIEW IF EXISTS biznes_monthly_summary CASCADE;
DROP VIEW IF EXISTS biznes_all_revenues CASCADE;

CREATE OR REPLACE VIEW biznes_all_revenues
WITH (security_invoker = true) AS
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
    id, name, client_name,
    NULL AS customer_company,
    amount, date,
    'manual' AS source,
    invoice_number AS reference
FROM biznes_revenues
WHERE is_received = true;

CREATE OR REPLACE VIEW biznes_monthly_summary
WITH (security_invoker = true) AS
WITH monthly_revenues AS (
    SELECT DATE_TRUNC('month', date) AS month, SUM(amount) AS total
    FROM biznes_all_revenues GROUP BY DATE_TRUNC('month', date)
),
monthly_costs AS (
    SELECT DATE_TRUNC('month', month) AS month, SUM(amount) AS total
    FROM biznes_costs GROUP BY DATE_TRUNC('month', month)
)
SELECT
    COALESCE(r.month, c.month) AS month,
    COALESCE(r.total, 0) AS total_revenues,
    COALESCE(c.total, 0) AS total_costs,
    COALESCE(r.total, 0) - COALESCE(c.total, 0) AS profit
FROM monthly_revenues r
FULL OUTER JOIN monthly_costs c ON r.month = c.month
ORDER BY month DESC;

CREATE OR REPLACE VIEW biznes_plan_realization
WITH (security_invoker = true) AS
SELECT p.*,
    COALESCE((SELECT SUM(amount) FROM biznes_all_revenues WHERE date BETWEEN p.period_start AND p.period_end), 0) AS actual_revenue,
    COALESCE((SELECT SUM(amount) FROM biznes_costs c WHERE c.month BETWEEN p.period_start AND p.period_end), 0) AS actual_costs,
    CASE WHEN p.target_revenue > 0 THEN
        ROUND((COALESCE((SELECT SUM(amount) FROM biznes_all_revenues WHERE date BETWEEN p.period_start AND p.period_end), 0) / p.target_revenue * 100)::numeric, 1)
        ELSE 0 END AS revenue_realization_percent,
    COALESCE((SELECT SUM(amount) FROM biznes_all_revenues WHERE date BETWEEN p.period_start AND p.period_end), 0) -
    COALESCE((SELECT SUM(amount) FROM biznes_costs c WHERE c.month BETWEEN p.period_start AND p.period_end), 0) AS actual_profit
FROM biznes_plans p;

CREATE OR REPLACE VIEW biznes_pipeline_summary
WITH (security_invoker = true) AS
SELECT
    DATE_TRUNC('month', CURRENT_DATE) AS month,
    COUNT(*) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')) AS active_leads,
    SUM(deal_value) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')) AS pipeline_value,
    COUNT(*) FILTER (WHERE status = 'won' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS won_this_month,
    COUNT(*) FILTER (WHERE status = 'lost' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS lost_this_month
FROM leads;

-- 4. GRANT PERMISSIONS
GRANT SELECT ON biznes_all_revenues TO authenticated;
GRANT SELECT ON biznes_monthly_summary TO authenticated;
GRANT SELECT ON biznes_plan_realization TO authenticated;
GRANT SELECT ON biznes_pipeline_summary TO authenticated;

-- =====================================================
-- SECURITY FIX COMPLETE
-- All sensitive data is now protected!
-- =====================================================
