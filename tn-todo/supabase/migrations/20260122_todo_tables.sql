-- =============================================
-- TN TODO SYSTEM TABLES
-- Trello-like boards, lists, and tasks
-- =============================================

-- 1. Boards table
CREATE TABLE IF NOT EXISTS todo_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'violet', -- violet, blue, emerald, amber, pink, cyan
    is_archived BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lists (columns) table
CREATE TABLE IF NOT EXISTS todo_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES todo_boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks (cards) table
CREATE TABLE IF NOT EXISTS todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,

    -- Assignment
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,

    -- Due date
    due_date TIMESTAMPTZ,

    -- Priority: low, medium, high, urgent
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Labels (array of color names)
    labels TEXT[] DEFAULT '{}',

    -- Status tracking
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,

    -- Metadata
    created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Task comments
CREATE TABLE IF NOT EXISTS todo_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todo_tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Task checklists
CREATE TABLE IF NOT EXISTS todo_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todo_tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Checklist',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Checklist items
CREATE TABLE IF NOT EXISTS todo_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES todo_checklists(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Board members (who has access to which board)
CREATE TABLE IF NOT EXISTS todo_board_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES todo_boards(id) ON DELETE CASCADE,
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(board_id, team_member_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_todo_boards_created_by ON todo_boards(created_by);
CREATE INDEX IF NOT EXISTS idx_todo_boards_archived ON todo_boards(is_archived);

CREATE INDEX IF NOT EXISTS idx_todo_lists_board ON todo_lists(board_id);
CREATE INDEX IF NOT EXISTS idx_todo_lists_position ON todo_lists(board_id, position);

CREATE INDEX IF NOT EXISTS idx_todo_tasks_list ON todo_tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_position ON todo_tasks(list_id, position);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_assigned ON todo_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_due_date ON todo_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_completed ON todo_tasks(is_completed);

CREATE INDEX IF NOT EXISTS idx_todo_comments_task ON todo_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_todo_checklists_task ON todo_checklists(task_id);
CREATE INDEX IF NOT EXISTS idx_todo_checklist_items_checklist ON todo_checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_todo_board_members_board ON todo_board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_todo_board_members_member ON todo_board_members(team_member_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_todo_boards_updated_at ON todo_boards;
CREATE TRIGGER update_todo_boards_updated_at
    BEFORE UPDATE ON todo_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todo_lists_updated_at ON todo_lists;
CREATE TRIGGER update_todo_lists_updated_at
    BEFORE UPDATE ON todo_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todo_tasks_updated_at ON todo_tasks;
CREATE TRIGGER update_todo_tasks_updated_at
    BEFORE UPDATE ON todo_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todo_comments_updated_at ON todo_comments;
CREATE TRIGGER update_todo_comments_updated_at
    BEFORE UPDATE ON todo_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE todo_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_board_members ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Authenticated users can view todo_boards" ON todo_boards
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_boards" ON todo_boards
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update todo_boards" ON todo_boards
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete todo_boards" ON todo_boards
    FOR DELETE TO authenticated USING (true);

-- Same for lists
CREATE POLICY "Authenticated users can view todo_lists" ON todo_lists
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_lists" ON todo_lists
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update todo_lists" ON todo_lists
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete todo_lists" ON todo_lists
    FOR DELETE TO authenticated USING (true);

-- Same for tasks
CREATE POLICY "Authenticated users can view todo_tasks" ON todo_tasks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_tasks" ON todo_tasks
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update todo_tasks" ON todo_tasks
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete todo_tasks" ON todo_tasks
    FOR DELETE TO authenticated USING (true);

-- Same for comments
CREATE POLICY "Authenticated users can view todo_comments" ON todo_comments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_comments" ON todo_comments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update todo_comments" ON todo_comments
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete todo_comments" ON todo_comments
    FOR DELETE TO authenticated USING (true);

-- Same for checklists
CREATE POLICY "Authenticated users can view todo_checklists" ON todo_checklists
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_checklists" ON todo_checklists
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update todo_checklists" ON todo_checklists
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete todo_checklists" ON todo_checklists
    FOR DELETE TO authenticated USING (true);

-- Same for checklist items
CREATE POLICY "Authenticated users can view todo_checklist_items" ON todo_checklist_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_checklist_items" ON todo_checklist_items
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update todo_checklist_items" ON todo_checklist_items
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete todo_checklist_items" ON todo_checklist_items
    FOR DELETE TO authenticated USING (true);

-- Same for board members
CREATE POLICY "Authenticated users can view todo_board_members" ON todo_board_members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert todo_board_members" ON todo_board_members
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update todo_board_members" ON todo_board_members
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete todo_board_members" ON todo_board_members
    FOR DELETE TO authenticated USING (true);

-- Service role policies
CREATE POLICY "Service role full access to todo_boards" ON todo_boards
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to todo_lists" ON todo_lists
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to todo_tasks" ON todo_tasks
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to todo_comments" ON todo_comments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to todo_checklists" ON todo_checklists
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to todo_checklist_items" ON todo_checklist_items
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to todo_board_members" ON todo_board_members
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE todo_boards IS 'Kanban boards for task management';
COMMENT ON TABLE todo_lists IS 'Columns/lists within a board';
COMMENT ON TABLE todo_tasks IS 'Task cards within lists';
COMMENT ON TABLE todo_comments IS 'Comments on tasks';
COMMENT ON TABLE todo_checklists IS 'Checklists within tasks';
COMMENT ON TABLE todo_checklist_items IS 'Individual items in checklists';
COMMENT ON TABLE todo_board_members IS 'Board membership and roles';
