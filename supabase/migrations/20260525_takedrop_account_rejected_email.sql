-- =============================================
-- EMAIL TEMPLATE + AUTOMATION: takedrop_account_rejected
-- Etap 3/TakeDrop — admin cofnal aktywacje konta klienta
-- bo haslo wpisane w panelu nie dziala. Klient dostaje mail
-- z prosba o poprawienie hasla i ponowne potwierdzenie aktywacji.
-- Trigger: takedrop_account_revoked (z workflow.html adminToggleAccountActive)
-- =============================================

-- 1. Rozszerz constraint trigger_type o takedrop_account_revoked
ALTER TABLE automation_flows DROP CONSTRAINT IF EXISTS automation_flows_trigger_type_check;
ALTER TABLE automation_flows ADD CONSTRAINT automation_flows_trigger_type_check CHECK (
  trigger_type = ANY (ARRAY[
    'lead_created'::text, 'lead_status_changed'::text,
    'offer_created'::text, 'offer_viewed'::text, 'offer_expired'::text, 'offer_reminder_halfway'::text,
    'payment_received'::text, 'contract_signed'::text, 'contract_sent'::text, 'invoice_sent'::text, 'proforma_generated'::text,
    'workflow_created'::text, 'stage_completed'::text,
    'products_shared'::text, 'report_published'::text, 'branding_delivered'::text, 'sales_page_shared'::text,
    'video_activated'::text, 'scenarios_shared'::text, 'video_recordings_complete'::text,
    'takedrop_activated'::text, 'takedrop_account_revoked'::text, 'landing_page_connected'::text, 'test_ready'::text,
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
  'email_template_takedrop_account_rejected_subject',
  'Hasło do TakeDrop niepoprawne — popraw je w panelu'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_takedrop_account_rejected_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">⚠️ Hasło niepoprawne</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Próbowałem zalogować się do Twojego konta TakeDrop danymi, które wpisałeś w panelu, ale <strong style="color:#fbbf24;">hasło nie działa</strong>. Cofnąłem aktywację konta — bez prawidłowego loginu nie możemy iść dalej z konfiguracją sklepu.</p><p style="margin:0 0 24px 0;color:#a3a3a3;font-size:15px;line-height:1.65;"><strong style="color:#ffffff;">Co zrobić:</strong></p><ol style="margin:0 0 28px 0;padding-left:20px;color:#a3a3a3;font-size:15px;line-height:1.85;"><li>Zaloguj się na <a href="https://app.takedrop.pl/login" style="color:#fbbf24;text-decoration:none;">app.takedrop.pl</a> żeby potwierdzić, że hasło faktycznie działa (jeśli nie pamiętasz — użyj „Zapomniałem hasła")</li><li>Wróć do panelu projektu i w zakładce <strong style="color:#ffffff;">TakeDrop</strong> wpisz <strong style="color:#fbbf24;">aktualne</strong> hasło</li><li>Kliknij <strong style="color:#ffffff;">„Konto działa — potwierdzam aktywację"</strong></li></ol><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Otwórz panel TakeDrop →</a></td></tr></table><p style="margin:24px 0 0 0;padding:18px;background:#171717;border-radius:8px;color:#737373;font-size:13px;line-height:1.55;">Jak tylko potwierdzę, że konto działa — wracamy do podłączania strony i konfiguracji płatności.</p></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- 3. Automation flow + krok wysylki maila
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'takedrop_account_revoked' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active, category)
    VALUES (
      'Etap 3 — Cofnięcie aktywacji TakeDrop (złe hasło)',
      'Mail do klienta gdy admin cofnie aktywację konta TakeDrop, bo hasło wpisane przez klienta nie działa. Prosi o poprawienie hasła w panelu i ponowne potwierdzenie aktywacji.',
      'takedrop_account_revoked',
      '{}',
      true,
      'workflow'
    )
    RETURNING id INTO v_flow_id;

    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "takedrop_account_rejected"}');

    RAISE NOTICE 'Created automation flow: %', v_flow_id;
  ELSE
    RAISE NOTICE 'Flow already exists: %', v_flow_id;
  END IF;
END $$;
