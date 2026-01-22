-- =============================================
-- TN TODO - ADDITIONAL FEATURES
-- Covers, Attachments, Activity Log
-- =============================================

-- 1. Add cover_color to tasks
ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS cover_color TEXT;
-- Colors: red, orange, yellow, green, teal, blue, purple, pink, gray

-- 2. Attachments table
CREATE TABLE IF NOT EXISTS todo_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todo_tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT, -- mime type
    file_size INTEGER, -- bytes
    created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activity log table
CREATE TABLE IF NOT EXISTS todo_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todo_tasks(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'created', 'moved', 'updated', 'comment', 'attachment', 'assigned', 'due_date', 'completed'
    details JSONB DEFAULT '{}', -- flexible storage for action details
    created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_todo_attachments_task ON todo_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_todo_activity_task ON todo_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_todo_activity_created_at ON todo_activity(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE todo_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_activity ENABLE ROW LEVEL SECURITY;

-- Attachments policies
CREATE POLICY "Authenticated users can view todo_attachments" ON todo_attachments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_attachments" ON todo_attachments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete todo_attachments" ON todo_attachments
    FOR DELETE TO authenticated USING (true);

-- Activity policies
CREATE POLICY "Authenticated users can view todo_activity" ON todo_activity
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_activity" ON todo_activity
    FOR INSERT TO authenticated WITH CHECK (true);

-- Service role policies
CREATE POLICY "Service role full access to todo_attachments" ON todo_attachments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to todo_activity" ON todo_activity
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE todo_attachments IS 'File attachments for tasks';
COMMENT ON TABLE todo_activity IS 'Activity history log for tasks';
COMMENT ON COLUMN todo_tasks.cover_color IS 'Card cover color (red, orange, yellow, green, teal, blue, purple, pink, gray)';
