-- Add cover_image column to todo_tasks for image covers
ALTER TABLE todo_tasks ADD COLUMN IF NOT EXISTS cover_image TEXT;

COMMENT ON COLUMN todo_tasks.cover_image IS 'URL to cover image uploaded to Supabase storage';
