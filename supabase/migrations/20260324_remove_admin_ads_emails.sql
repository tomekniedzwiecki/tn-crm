-- =============================================
-- REMOVE ADMIN EMAILS: partner_access_granted, budget_funded
-- These were sending emails to admin - not needed
-- =============================================

-- 1. Delete automation flows and their steps
DELETE FROM automation_steps WHERE flow_id IN (
    SELECT id FROM automation_flows WHERE trigger_type IN ('partner_access_granted', 'budget_funded')
);

DELETE FROM automation_flows WHERE trigger_type IN ('partner_access_granted', 'budget_funded');

-- 2. Delete email templates from settings
DELETE FROM settings WHERE key IN (
    'email_template_partner_access_granted_subject',
    'email_template_partner_access_granted_body',
    'email_template_budget_funded_subject',
    'email_template_budget_funded_body'
);

-- 3. Update constraint - remove partner_access_granted and budget_funded triggers
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
    'lead_created',
    'offer_created', 'offer_viewed', 'offer_expired', 'offer_reminder_halfway',
    'payment_received', 'contract_signed', 'invoice_sent', 'proforma_generated',
    'workflow_created', 'stage_completed',
    'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared',
    'video_activated', 'scenarios_shared',
    'takedrop_activated', 'landing_page_connected', 'test_ready',
    'ads_activated', 'partner_step_completed', 'ads_completed'
));
