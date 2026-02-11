-- =============================================
-- ADD VIDEO_SHARED FIELD TO WORKFLOW_VIDEO
-- =============================================
-- Dodaje pole oznaczające, że klient udostępnił nagrane video

ALTER TABLE workflow_video
ADD COLUMN IF NOT EXISTS video_shared BOOLEAN DEFAULT FALSE;

ALTER TABLE workflow_video
ADD COLUMN IF NOT EXISTS video_shared_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_video.video_shared IS 'Admin oznacza gdy klient udostępnił nagrane video';
COMMENT ON COLUMN workflow_video.video_shared_at IS 'Data oznaczenia video jako udostępnione';
