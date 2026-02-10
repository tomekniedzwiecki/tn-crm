-- Workflow Activities - tracking admin actions on workflows
CREATE TABLE IF NOT EXISTS workflow_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    -- Activity details
    action TEXT NOT NULL, -- e.g., 'task_completed', 'milestone_completed', 'status_changed', 'branding_shared', etc.
    description TEXT NOT NULL, -- Human readable description

    -- Who did it
    performed_by UUID REFERENCES team_members(id),
    performed_by_name TEXT, -- Cached name for display

    -- Additional context
    metadata JSONB DEFAULT '{}', -- Extra data like old_value, new_value, etc.

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workflow_activities_workflow_id ON workflow_activities(workflow_id);
CREATE INDEX idx_workflow_activities_created_at ON workflow_activities(created_at DESC);
CREATE INDEX idx_workflow_activities_action ON workflow_activities(action);

-- RLS Policies
ALTER TABLE workflow_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view workflow_activities"
    ON workflow_activities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can insert workflow_activities"
    ON workflow_activities FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on workflow_activities"
    ON workflow_activities FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Update workflow_progress view to include last activity
DROP VIEW IF EXISTS workflow_progress;
CREATE OR REPLACE VIEW workflow_progress AS
SELECT
    w.id AS workflow_id,
    w.customer_email,
    w.customer_name,
    w.customer_company,
    w.offer_name,
    w.status,
    w.started_at,
    w.unique_token,
    w.contract_status,
    w.selected_product_id,
    w.products_shared_at,
    w.branding_shared_at,
    w.sales_page_shared_at,
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
    (
        SELECT wa.created_at
        FROM workflow_activities wa
        WHERE wa.workflow_id = w.id
        ORDER BY wa.created_at DESC
        LIMIT 1
    ) AS last_activity_at,
    (
        SELECT wa.description
        FROM workflow_activities wa
        WHERE wa.workflow_id = w.id
        ORDER BY wa.created_at DESC
        LIMIT 1
    ) AS last_activity_description
FROM workflows w
LEFT JOIN workflow_tasks wt ON wt.workflow_id = w.id
GROUP BY w.id;

COMMENT ON TABLE workflow_activities IS 'Tracks all admin actions on workflows for audit and activity feed';
