-- =============================================
-- UPDATE WORKFLOW_PROGRESS VIEW WITH VIDEO STATUS
-- =============================================
-- Adds video_shared and has_client_video_links to track
-- "waiting for client" state for proper sorting

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
    ) AS completed_milestones,
    -- Video status fields
    (
        SELECT wv.video_shared
        FROM workflow_video wv
        WHERE wv.workflow_id = w.id
        LIMIT 1
    ) AS video_shared,
    (
        SELECT COALESCE(jsonb_array_length(wv.video_links), 0) > 0
        FROM workflow_video wv
        WHERE wv.workflow_id = w.id
        LIMIT 1
    ) AS has_client_video_links,
    -- Waiting for client = video shared but no client links yet
    (
        SELECT wv.video_shared = true AND COALESCE(jsonb_array_length(wv.video_links), 0) = 0
        FROM workflow_video wv
        WHERE wv.workflow_id = w.id
        LIMIT 1
    ) AS waiting_for_client
FROM workflows w
LEFT JOIN workflow_tasks wt ON wt.workflow_id = w.id
GROUP BY w.id;

COMMENT ON VIEW workflow_progress IS 'Aggregated workflow progress with video status for admin dashboard';
