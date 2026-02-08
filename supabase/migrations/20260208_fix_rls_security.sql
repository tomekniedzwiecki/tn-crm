-- =====================================================
-- CRITICAL SECURITY FIX: Enable RLS on all sensitive data
-- =====================================================
-- Problem: Views and some tables were UNRESTRICTED (publicly accessible)
-- Solution: Enable RLS + create policies for authenticated users only
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON CORE TABLES (if not already enabled)
-- =====================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. DROP EXISTING POLICIES (clean slate)
-- =====================================================

-- Leads policies
DROP POLICY IF EXISTS "leads_auth" ON leads;
DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_insert" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;
DROP POLICY IF EXISTS "leads_delete" ON leads;

-- Orders policies
DROP POLICY IF EXISTS "orders_auth" ON orders;
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_delete" ON orders;

-- Workflow progress policies
DROP POLICY IF EXISTS "workflow_progress_auth" ON workflow_progress;
DROP POLICY IF EXISTS "workflow_progress_select" ON workflow_progress;
DROP POLICY IF EXISTS "workflow_progress_insert" ON workflow_progress;
DROP POLICY IF EXISTS "workflow_progress_update" ON workflow_progress;
DROP POLICY IF EXISTS "workflow_progress_delete" ON workflow_progress;

-- =====================================================
-- 3. CREATE NEW RESTRICTIVE POLICIES
-- =====================================================

-- LEADS: Only authenticated users can access
CREATE POLICY "leads_authenticated_all"
    ON leads
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ORDERS: Only authenticated users can access
CREATE POLICY "orders_authenticated_all"
    ON orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- WORKFLOW_PROGRESS: Only authenticated users can access
CREATE POLICY "workflow_progress_authenticated_all"
    ON workflow_progress
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 4. RECREATE VIEWS WITH SECURITY_INVOKER
-- =====================================================
-- This ensures views respect the RLS policies of underlying tables

-- Drop existing views
DROP VIEW IF EXISTS biznes_pipeline_summary CASCADE;
DROP VIEW IF EXISTS biznes_plan_realization CASCADE;
DROP VIEW IF EXISTS biznes_monthly_summary CASCADE;
DROP VIEW IF EXISTS biznes_all_revenues CASCADE;

-- Recreate with security_invoker = true
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

-- Monthly summary
CREATE OR REPLACE VIEW biznes_monthly_summary
WITH (security_invoker = true) AS
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

-- Plan realization
CREATE OR REPLACE VIEW biznes_plan_realization
WITH (security_invoker = true) AS
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
CREATE OR REPLACE VIEW biznes_pipeline_summary
WITH (security_invoker = true) AS
SELECT
    DATE_TRUNC('month', CURRENT_DATE) AS month,
    COUNT(*) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')) AS active_leads,
    SUM(deal_value) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')) AS pipeline_value,
    COUNT(*) FILTER (WHERE status = 'won' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS won_this_month,
    COUNT(*) FILTER (WHERE status = 'lost' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS lost_this_month
FROM leads;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Allow authenticated users to SELECT from views
GRANT SELECT ON biznes_all_revenues TO authenticated;
GRANT SELECT ON biznes_monthly_summary TO authenticated;
GRANT SELECT ON biznes_plan_realization TO authenticated;
GRANT SELECT ON biznes_pipeline_summary TO authenticated;

-- =====================================================
-- VERIFICATION COMMENTS
-- =====================================================

COMMENT ON POLICY "leads_authenticated_all" ON leads IS 'SECURITY: Only authenticated users can access leads data';
COMMENT ON POLICY "orders_authenticated_all" ON orders IS 'SECURITY: Only authenticated users can access orders data';
COMMENT ON POLICY "workflow_progress_authenticated_all" ON workflow_progress IS 'SECURITY: Only authenticated users can access workflow progress';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- After running this migration:
-- - All sensitive tables now require authentication
-- - All views now respect RLS policies (security_invoker = true)
-- - No data is publicly accessible without authentication
-- =====================================================
