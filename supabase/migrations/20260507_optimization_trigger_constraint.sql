-- Dodaje 'optimization_started' do dozwolonych trigger_type w automation_flows
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type = ANY (ARRAY[
    'lead_created'::text,
    'lead_status_changed'::text,
    'offer_created'::text,
    'offer_viewed'::text,
    'offer_expired'::text,
    'offer_reminder_halfway'::text,
    'payment_received'::text,
    'contract_signed'::text,
    'contract_sent'::text,
    'invoice_sent'::text,
    'proforma_generated'::text,
    'workflow_created'::text,
    'stage_completed'::text,
    'products_shared'::text,
    'report_published'::text,
    'branding_delivered'::text,
    'sales_page_shared'::text,
    'video_activated'::text,
    'scenarios_shared'::text,
    'video_recordings_complete'::text,
    'takedrop_activated'::text,
    'landing_page_connected'::text,
    'test_ready'::text,
    'ads_activated'::text,
    'partner_step_completed'::text,
    'ads_completed'::text,
    'content_ready'::text,
    'campaign_launched'::text,
    'optimization_started'::text
]));
