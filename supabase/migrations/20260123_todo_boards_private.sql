-- Add is_private column to todo_boards
ALTER TABLE todo_boards
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Update RLS policy to respect privacy
-- Drop existing select policy if exists
DROP POLICY IF EXISTS "Team members can view boards" ON todo_boards;
DROP POLICY IF EXISTS "Team members can view all boards" ON todo_boards;

-- Create new policy: public boards visible to all, private only to creator
CREATE POLICY "Team members can view public boards or own private boards"
    ON todo_boards FOR SELECT
    TO authenticated
    USING (
        is_private = false
        OR created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Comment for clarity
COMMENT ON COLUMN todo_boards.is_private IS 'If true, only the creator can see this board';
