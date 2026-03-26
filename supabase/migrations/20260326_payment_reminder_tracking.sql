-- Add reminder tracking to payment_installments
ALTER TABLE payment_installments
ADD COLUMN IF NOT EXISTS last_reminder_type TEXT,
ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;

-- Add index for efficient querying of pending installments
CREATE INDEX IF NOT EXISTS idx_payment_installments_due_date_status
ON payment_installments(due_date, status)
WHERE status = 'pending';

COMMENT ON COLUMN payment_installments.last_reminder_type IS 'Type of last reminder sent: before_3d, due_today, overdue_3d, overdue_7d';
COMMENT ON COLUMN payment_installments.last_reminder_sent_at IS 'When the last reminder was sent';
