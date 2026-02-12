-- =============================================
-- STARRED WORKFLOWS FEATURE
-- =============================================
-- Allows admin to mark workflows as starred/favorites
-- Starred workflows appear first in the list

-- 1. Add starred column to workflows table
ALTER TABLE workflows
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE;

-- 2. Add index for fast starred lookup
CREATE INDEX IF NOT EXISTS idx_workflows_starred
ON workflows(starred DESC, started_at DESC)
WHERE starred = TRUE;

-- 3. Add comment for documentation
COMMENT ON COLUMN workflows.starred IS 'Whether this workflow is starred/favorited by admin for quick access';

-- 4. Update the workflow_progress view to include starred
DROP VIEW IF EXISTS workflow_progress;

CREATE VIEW workflow_progress AS
SELECT
    w.id AS workflow_id,
    w.customer_email,
    w.customer_name,
    w.customer_company,
    w.offer_name,
    w.amount,
    w.status,
    w.started_at,
    w.unique_token,
    w.contract_status,
    w.products_shared_at,
    w.selected_product_id,
    w.branding_shared_at,
    w.sales_page_shared_at,
    w.sales_page_url,
    w.starred,
    w.updated_at,
    COUNT(wt.id) AS total_tasks,
    COUNT(wt.id) FILTER (WHERE wt.completed = true) AS completed_tasks,
    CASE
        WHEN COUNT(wt.id) > 0
        THEN ROUND((COUNT(wt.id) FILTER (WHERE wt.completed = true)::DECIMAL / COUNT(wt.id)) * 100)
        ELSE 0
    END AS progress_percent,
    (
        SELECT wm.title
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id AND wm.status = 'in_progress'
        ORDER BY wm.milestone_index
        LIMIT 1
    ) AS current_milestone_title,
    (
        SELECT wm.deadline
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id AND wm.status = 'in_progress'
        ORDER BY wm.milestone_index
        LIMIT 1
    ) AS current_milestone_deadline,
    (
        SELECT COUNT(*)
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id
    ) AS total_milestones,
    (
        SELECT COUNT(*)
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id AND wm.status = 'completed'
    ) AS completed_milestones
FROM workflows w
LEFT JOIN workflow_tasks wt ON wt.workflow_id = w.id
GROUP BY w.id;
