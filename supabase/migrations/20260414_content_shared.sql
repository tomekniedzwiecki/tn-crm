-- Ręczne potwierdzenie udostępnienia Content klientowi
ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS content_shared_with_client BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS content_shared_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_ads.content_shared_with_client IS 'Admin explicitly confirmed content is shared with client (visible in their portal + triggers content_ready email)';
COMMENT ON COLUMN workflow_ads.content_shared_at IS 'When admin shared content with client';
