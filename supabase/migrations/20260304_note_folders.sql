-- Note folders for organizing notes
CREATE TABLE IF NOT EXISTS note_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#52525b',
    icon TEXT DEFAULT 'folder',
    position INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add folder_id to notes
ALTER TABLE notes ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES note_folders(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_note_folders_created_by ON note_folders(created_by);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);

-- RLS policies for note_folders
ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own folders" ON note_folders
    FOR SELECT USING (
        created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own folders" ON note_folders
    FOR INSERT WITH CHECK (
        created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own folders" ON note_folders
    FOR UPDATE USING (
        created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own folders" ON note_folders
    FOR DELETE USING (
        created_by IN (
            SELECT id FROM team_members WHERE user_id = auth.uid()
        )
    );
