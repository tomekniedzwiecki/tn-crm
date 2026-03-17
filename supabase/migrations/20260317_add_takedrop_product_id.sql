-- Add takedrop_product_id column to workflows table
-- This stores the TakeDrop product ID for generating checkout links

ALTER TABLE workflows ADD COLUMN IF NOT EXISTS takedrop_product_id TEXT;

COMMENT ON COLUMN workflows.takedrop_product_id IS 'TakeDrop product ID for checkout link generation (e.g., 103035094-321191805)';

-- Update the workflow_progress view to include the new column
DROP VIEW IF EXISTS workflow_progress;

CREATE OR REPLACE VIEW workflow_progress AS
SELECT
    w.id,
    w.order_id,
    w.customer_email,
    w.customer_name,
    w.customer_company,
    w.customer_phone,
    w.offer_name,
    w.offer_id,
    w.amount,
    w.status,
    w.current_milestone_index,
    w.unique_token,
    w.client_password_hash,
    w.started_at,
    w.completed_at,
    w.milestones_snapshot,
    w.name,
    w.contract_signed_at,
    w.products_shared_at,
    w.branding_shared_at,
    w.sales_page_shared_at,
    w.sales_page_url,
    w.sales_page_status,
    w.starred,
    w.stage1_accepted_at,
    w.takedrop_product_id,
    w.created_at,
    w.updated_at,
    (
        SELECT COUNT(*)::INTEGER
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id AND wm.status = 'completed'
    ) AS completed_milestones,
    (
        SELECT COUNT(*)::INTEGER
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id
    ) AS total_milestones,
    (
        SELECT json_agg(json_build_object(
            'id', wm.id,
            'title', wm.title,
            'status', wm.status,
            'deadline', wm.deadline,
            'milestone_index', wm.milestone_index
        ) ORDER BY wm.milestone_index)
        FROM workflow_milestones wm
        WHERE wm.workflow_id = w.id
    ) AS milestones_summary,
    (
        SELECT wa.created_at
        FROM workflow_activities wa
        WHERE wa.workflow_id = w.id
        AND wa.actor_type = 'admin'
        ORDER BY wa.created_at DESC
        LIMIT 1
    ) AS last_admin_activity,
    (
        SELECT wd.deadline_resets
        FROM workflow_deadlines wd
        WHERE wd.workflow_id = w.id
    ) AS deadline_resets
FROM workflows w;

-- Grant access to the view
GRANT SELECT ON workflow_progress TO anon, authenticated;
