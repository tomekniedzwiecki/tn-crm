-- =============================================
-- EMAIL TEMPLATE: Payment Gateway Required
-- =============================================
-- Wysylany gdy klient zlozyl dane prawne (legal_documents_ready=true) i ma nastepny krok:
-- zalozyc konto PayU (jesli ma NIP) lub Stripe (osoba prywatna) i skonfigurowac bramke w TakeDrop.
-- Zmienne: {{clientName}}, {{gatewayName}} (PayU lub Stripe), {{projectUrl}}

INSERT INTO settings (key, value) VALUES (
  'email_template_payment_gateway_required_subject',
  '{{clientName}}, czas na bramkę płatności ({{gatewayName}})'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_payment_gateway_required_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#a855f7;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Bramka płatności</p><h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">{{clientName}}, następny krok — bramka {{gatewayName}}</h1><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Dane do dokumentów prawnych masz złożone — przygotowuję regulamin i politykę prywatności. W międzyczasie czeka na Ciebie ostatni element konfiguracji sklepu: <strong style="color:#ffffff;">bramka płatności {{gatewayName}}</strong>.</p><p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">W panelu klienta znajdziesz instrukcję krok po kroku — od założenia konta po wpisanie kluczy w TakeDrop.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td align="center"><a href="{{projectUrl}}#bramka-platnosci" style="display:inline-block;background:linear-gradient(135deg,#a855f7 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Skonfiguruj bramkę →</a></td></tr></table><p style="margin:0;color:#737373;font-size:13px;line-height:1.5;">Bez bramki sklep nie przyjmie płatności online — to ostatni krok przed testami.</p></td></tr><tr><td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- TRIGGER TYPE: legal_data_submitted
-- =============================================
-- Odpalany z client-projekt.html po confirmLegalDataSave() (legal_documents_ready=true)

ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check
CHECK (trigger_type IN (
    'lead_created', 'lead_status_changed',
    'offer_created', 'offer_viewed', 'offer_expired', 'offer_reminder_halfway',
    'payment_received', 'contract_signed', 'contract_sent',
    'invoice_sent', 'proforma_generated',
    'workflow_created', 'stage_completed',
    'products_shared', 'report_published', 'branding_delivered', 'sales_page_shared',
    'video_activated', 'scenarios_shared', 'video_recordings_complete',
    'takedrop_activated', 'takedrop_account_revoked', 'landing_page_connected',
    'legal_data_submitted',
    'test_ready',
    'ads_activated', 'partner_step_completed', 'ads_completed',
    'content_ready', 'campaign_launched', 'budget_not_funded',
    'optimization_started', 'reviews_shared',
    'videos_shared', 'videos_reminder', 'videos_skipped',
    'tools_started', 'tools_script_received', 'tools_notes_received', 'tools_completed',
    'analysis_started',
    'partner_access_granted', 'budget_funded'
));

-- =============================================
-- AUTOMATION FLOW: Etap 3 - Bramka platnosci wymagana
-- =============================================

DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'legal_data_submitted' LIMIT 1;

  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Etap 3 - Bramka platnosci wymagana',
      'Wysyla email do klienta gdy zlozyl dane prawne i czeka go konfiguracja bramki (PayU lub Stripe)',
      'legal_data_submitted',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "payment_gateway_required"}');

    RAISE NOTICE 'Created automation flow: %', v_flow_id;
  ELSE
    RAISE NOTICE 'Flow already exists: %', v_flow_id;
  END IF;
END $$;
