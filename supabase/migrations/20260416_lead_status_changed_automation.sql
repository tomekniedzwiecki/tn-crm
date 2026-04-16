-- =============================================
-- Lead Status Changed automation
-- Nowy trigger: automatyzacje wysyłane gdy lead wejdzie do konkretnego statusu w pipeline.
-- Dedup: UNIQUE(flow_id, entity_type, entity_id) już istnieje — każdy flow poleci do leada tylko raz.
-- Walidacja statusu: executor sprawdzi przy wykonaniu czy lead nadal ma expected_status.
-- =============================================

-- 1. Pole status_entered_at na leads (przyda się w UI i do ewentualnych raportów)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status_entered_at TIMESTAMPTZ;

UPDATE leads
SET status_entered_at = COALESCE(updated_at, created_at, NOW())
WHERE status_entered_at IS NULL;

-- 2. Trigger DB aktualizujący status_entered_at przy zmianie statusu
CREATE OR REPLACE FUNCTION leads_update_status_entered_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_entered_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_status_entered_at_trigger ON leads;
CREATE TRIGGER leads_status_entered_at_trigger
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION leads_update_status_entered_at();

-- 3. Rozszerz CHECK constraint na automation_flows.trigger_type o lead_status_changed
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;

ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type = ANY (ARRAY[
  'lead_created'::text, 'lead_status_changed'::text,
  'offer_created'::text, 'offer_viewed'::text, 'offer_expired'::text,
  'offer_reminder_halfway'::text, 'payment_received'::text, 'contract_signed'::text,
  'contract_sent'::text, 'invoice_sent'::text, 'proforma_generated'::text,
  'workflow_created'::text, 'stage_completed'::text, 'products_shared'::text,
  'report_published'::text, 'branding_delivered'::text, 'sales_page_shared'::text,
  'video_activated'::text, 'scenarios_shared'::text, 'video_recordings_complete'::text,
  'takedrop_activated'::text, 'landing_page_connected'::text, 'test_ready'::text,
  'ads_activated'::text, 'partner_step_completed'::text, 'ads_completed'::text,
  'content_ready'::text, 'campaign_launched'::text
]));

COMMENT ON COLUMN leads.status_entered_at IS 'Kiedy lead wszedł do aktualnego statusu pipeline (auto-updated przez trigger)';
