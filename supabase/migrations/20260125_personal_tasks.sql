-- =============================================
-- PERSONAL TASKS - tasks independent of boards
-- =============================================

-- Add is_personal column to todo_tasks
ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false;

-- Make list_id nullable (for personal tasks)
ALTER TABLE todo_tasks ALTER COLUMN list_id DROP NOT NULL;

-- Add constraint: personal tasks don't need list_id, board tasks do
ALTER TABLE todo_tasks DROP CONSTRAINT IF EXISTS check_personal_or_list;
ALTER TABLE todo_tasks ADD CONSTRAINT check_personal_or_list
    CHECK (
        (is_personal = true AND list_id IS NULL) OR
        (is_personal = false AND list_id IS NOT NULL) OR
        (is_personal IS NULL AND list_id IS NOT NULL)
    );

-- Index for personal tasks query
CREATE INDEX IF NOT EXISTS idx_todo_tasks_personal ON todo_tasks(assigned_to, is_personal) WHERE is_personal = true;

-- Comment
COMMENT ON COLUMN todo_tasks.is_personal IS 'True for personal tasks not associated with any board';
