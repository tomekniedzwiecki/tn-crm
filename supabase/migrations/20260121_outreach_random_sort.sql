-- Add random_sort column for randomized sending order
-- This column gets a random value (0-1) when sends are created
-- and is used to randomize which contacts receive emails each day

ALTER TABLE outreach_sends ADD COLUMN IF NOT EXISTS random_sort DOUBLE PRECISION DEFAULT random();

-- Index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_outreach_sends_random ON outreach_sends(campaign_id, status, random_sort);

-- Comment
COMMENT ON COLUMN outreach_sends.random_sort IS 'Random value 0-1 for randomized sending order within campaign';
