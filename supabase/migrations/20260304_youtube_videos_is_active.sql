-- Add is_active and privacy_status columns to content_youtube_videos
ALTER TABLE content_youtube_videos
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE content_youtube_videos
ADD COLUMN IF NOT EXISTS privacy_status TEXT DEFAULT 'public';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_content_youtube_videos_is_active
ON content_youtube_videos(is_active) WHERE is_active = true;
