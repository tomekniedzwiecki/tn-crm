-- =============================================
-- ADD SKIPPED FIELD TO WORKFLOW_VIDEO
-- =============================================
-- Pozwala na pominięcie etapu video na życzenie klienta

ALTER TABLE workflow_video
ADD COLUMN IF NOT EXISTS skipped BOOLEAN DEFAULT FALSE;

ALTER TABLE workflow_video
ADD COLUMN IF NOT EXISTS skipped_at TIMESTAMPTZ;

ALTER TABLE workflow_video
ADD COLUMN IF NOT EXISTS skipped_reason TEXT;

COMMENT ON COLUMN workflow_video.skipped IS 'Etap video pominięty na życzenie klienta';
COMMENT ON COLUMN workflow_video.skipped_at IS 'Data pominięcia etapu';
COMMENT ON COLUMN workflow_video.skipped_reason IS 'Powód pominięcia (opcjonalny)';
