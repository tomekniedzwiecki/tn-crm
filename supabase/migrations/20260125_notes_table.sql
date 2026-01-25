-- =============================================
-- NOTES TABLE - PRIVATE NOTES
-- Each user can only see their own notes
-- =============================================

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    color TEXT DEFAULT 'zinc' CHECK (color IN ('zinc', 'blue', 'emerald', 'amber', 'pink', 'violet')),
    is_pinned BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_created_by ON notes(created_by);
CREATE INDEX IF NOT EXISTS idx_notes_position ON notes(created_by, position);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned DESC, position ASC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies - PRIVATE NOTES (user sees only their own)
CREATE POLICY "Users can view own notes"
    ON notes FOR SELECT
    TO authenticated
    USING (
        created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own notes"
    ON notes FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own notes"
    ON notes FOR UPDATE
    TO authenticated
    USING (
        created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own notes"
    ON notes FOR DELETE
    TO authenticated
    USING (
        created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Comment
COMMENT ON TABLE notes IS 'Private notes - each user can only see their own notes';
