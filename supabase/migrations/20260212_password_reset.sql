-- =============================================
-- PASSWORD RESET FEATURE
-- =============================================
-- Adds password reset token support for workflows

-- 1. Add password reset columns to workflows table
ALTER TABLE workflows
ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- 2. Add index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_workflows_password_reset_token
ON workflows(password_reset_token)
WHERE password_reset_token IS NOT NULL;

-- 3. Add comments for documentation
COMMENT ON COLUMN workflows.password_reset_token IS 'Token for password reset, should be unique and temporary';
COMMENT ON COLUMN workflows.password_reset_expires IS 'Expiration timestamp for the password reset token';
