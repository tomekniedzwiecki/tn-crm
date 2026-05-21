-- =============================================
-- EMAIL TEMPLATE + AUTOMATION: budget_not_funded
-- Etap 4/Budzet — admin oznacza ze klient mimo kliknigcia
-- "potwierdzam doladowanie" nie doladowal faktycznie konta
-- =============================================

-- 1. Rozszerz constraint trigger_type o budget_not_funded
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check CHECK (
  trigger_type = ANY (ARRAY[
    'lead_created'::text, 'lead_status_changed'::text,
    'offer_created'::text, 'offer_viewed'::text, 'offer_expired'::text, 'offer_reminder_halfway'::text,
    'payment_received'::text, 'contract_signed'::text, 'contract_sent'::text, 'invoice_sent'::text, 'proforma_generated'::text,
    'workflow_created'::text, 'stage_completed'::text,
    'products_shared'::text, 'report_published'::text, 'branding_delivered'::text, 'sales_page_shared'::text,
    'video_activated'::text, 'scenarios_shared'::text, 'video_recordings_complete'::text,
    'takedrop_activated'::text, 'landing_page_connected'::text, 'test_ready'::text,
    'ads_activated'::text, 'partner_step_completed'::text, 'ads_completed'::text, 'content_ready'::text, 'campaign_launched'::text,
    'budget_not_funded'::text,
    'optimization_started'::text, 'reviews_shared'::text, 'videos_shared'::text,
    'videos_reminder'::text, 'videos_skipped'::text,
    'tools_started'::text, 'tools_script_received'::text, 'tools_notes_received'::text, 'tools_completed'::text,
    'analysis_started'::text
  ])
);


-- 2. Email template subject + body
INSERT INTO settings (key, value) VALUES (
  'email_template_budget_not_funded_subject',
  'Konto reklamowe wciaz nie zostalo doladowane'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_budget_not_funded_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">⚠️ Brak doładowania</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Sprawdziłem konto reklamowe na Mecie i <strong style="color:#fbbf24;">budżet wciąż nie został doładowany</strong>. W panelu zaznaczyłeś, że doładowałeś — ale faktycznie środki nie dotarły na konto.</p><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Bez doładowania <strong style="color:#ffffff;">nie ruszymy z kampanią</strong>, więc proszę wróć do panelu projektu i dokończ płatność — instrukcja jest w sekcji „Budżet".</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Kwota to <strong style="color:#ffffff;">1000 zł</strong> jednorazowo, doładowane na konto reklamowe Meta (Twoja firma jako platnik). Gdy zobaczę środki na koncie, automatycznie ruszamy z kampanią.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Dokończ doładowanie →</a></td></tr></table><p style="margin:24px 0 0 0;padding:18px;background:#171717;border-radius:8px;color:#737373;font-size:13px;line-height:1.55;">Jeśli wystąpił problem z płatnością (np. karta odrzucona, limit dzienny) — daj znać, pomogę rozwiązać.</p></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- 3. Automation flow
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'budget_not_funded' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES ('Etap 4/Budzet — Konto nie doladowane', 'Email do klienta gdy admin oznaczy ze konto reklamowe nie zostalo faktycznie doladowane (klient kliknal w panelu ale srodki nie doszly)', 'budget_not_funded', '{}', true)
    RETURNING id INTO v_flow_id;
    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "budget_not_funded"}');
  END IF;
END $$;
