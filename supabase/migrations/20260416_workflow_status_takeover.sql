-- Rozszerz CHECK constraint na workflows.status o wartość 'takeover'
-- używaną dla workflow oznaczonych jako "biznes do przejęcia" (sales tool).

ALTER TABLE workflows DROP CONSTRAINT IF EXISTS workflows_status_check;

ALTER TABLE workflows ADD CONSTRAINT workflows_status_check
CHECK (status IN ('active', 'completed', 'paused', 'cancelled', 'takeover'));
