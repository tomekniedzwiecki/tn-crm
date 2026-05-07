-- =============================================
-- ETAP 5 / KROK 4 — Narzedzia (GA + Hotjar + Sesje)
-- =============================================

-- Schema: 8 nowych kolumn
ALTER TABLE workflow_optimization
  ADD COLUMN IF NOT EXISTS tools_ga_script TEXT,
  ADD COLUMN IF NOT EXISTS tools_ga_script_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tools_ga_connected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tools_hotjar_script TEXT,
  ADD COLUMN IF NOT EXISTS tools_hotjar_script_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tools_hotjar_connected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tools_session_notes TEXT,
  ADD COLUMN IF NOT EXISTS tools_session_notes_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_optimization.tools_ga_script IS 'Skrypt Google Analytics dostarczony przez klienta (do osadzenia w sklepie)';
COMMENT ON COLUMN workflow_optimization.tools_ga_script_at IS 'Data wyslania skryptu GA przez klienta';
COMMENT ON COLUMN workflow_optimization.tools_ga_connected_at IS 'Admin osadzil GA w sklepie TakeDrop i potwierdzil';
COMMENT ON COLUMN workflow_optimization.tools_hotjar_script IS 'Skrypt Hotjar dostarczony przez klienta';
COMMENT ON COLUMN workflow_optimization.tools_hotjar_script_at IS 'Data wyslania skryptu Hotjar przez klienta';
COMMENT ON COLUMN workflow_optimization.tools_hotjar_connected_at IS 'Admin osadzil Hotjar w sklepie TakeDrop i potwierdzil';
COMMENT ON COLUMN workflow_optimization.tools_session_notes IS 'Uwagi klienta po przeanalizowaniu 2-3 sesji w Hotjar';
COMMENT ON COLUMN workflow_optimization.tools_session_notes_at IS 'Data wyslania uwag przez klienta';

-- Trigger types (dodaj 4 nowe)
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
    'optimization_started'::text, 'reviews_shared'::text, 'videos_shared'::text,
    'videos_reminder'::text, 'videos_skipped'::text,
    'tools_started'::text, 'tools_script_received'::text, 'tools_notes_received'::text, 'tools_completed'::text
  ])
);


-- ─── EMAIL TEMPLATES ─────────────────────────────

-- tools_started: klient dostaje gdy admin odpala krok
INSERT INTO settings (key, value) VALUES (
  'email_template_tools_started_subject',
  'Ostatni krok Etapu 5 — narzędzia analityczne 🔧'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_tools_started_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🔧 Narzędzia analityczne</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">To ostatni krok Etapu 5. Twój sklep już zarabia, mamy opinie i Reels — teraz zobaczmy <strong style="color:#fbbf24;">co konkretnie robią klienci</strong> na Twojej stronie i gdzie możemy poprawić konwersję.</p><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Czekają na Ciebie 3 zadania:</p><ol style="margin:0 0 24px 0;padding-left:20px;color:#a3a3a3;font-size:15px;line-height:1.8;"><li><strong style="color:#ffffff;">Załóż Google Analytics i prześlij mi skrypt</strong> — wkleisz go w panelu, ja osadzę w sklepie</li><li><strong style="color:#ffffff;">Załóż Hotjar i prześlij mi skrypt</strong> — analogicznie, ja osadzę u Ciebie w sklepie</li><li><strong style="color:#ffffff;">Przeanalizuj 2-3 sesje</strong> w Hotjar (po 24-48h od osadzenia) i napisz mi co zauważyłeś</li></ol><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">W panelu projektu masz instrukcje krok po kroku, pola do wklejania skryptów i pole na uwagi po analizie sesji.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#000000;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Otwórz panel narzędzi →</a></td></tr></table><p style="margin:24px 0 0 0;padding:18px;background:#171717;border-radius:8px;color:#737373;font-size:13px;line-height:1.55;">Masz problem z założeniem konta lub konfiguracją? Napisz na <a href="mailto:pomoc@takedrop.pl" style="color:#fbbf24;text-decoration:none;">pomoc@takedrop.pl</a> — wsparcie TakeDrop pomoże.</p></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- tools_script_received: admin dostaje powiadomienie ze klient wyslal skrypt (GA lub Hotjar)
INSERT INTO settings (key, value) VALUES (
  'email_template_tools_script_received_subject',
  '{{clientName}} przesłał skrypt {{toolName}} do osadzenia 🔧'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_tools_script_received_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🔧 Skrypt do osadzenia</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:24px;font-weight:600;line-height:1.3;">{{clientName}} przesłał skrypt {{toolName}}</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Klient wkleił skrypt <strong style="color:#fbbf24;">{{toolName}}</strong> w panelu projektu. Otwórz workflow w admin, skopiuj skrypt i osadź go w sklepie TakeDrop klienta.</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Po osadzeniu kliknij „Osadzone" w panelu admina, żeby klient zobaczył status.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{adminUrl}}" style="display:inline-block;background:#262626;color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;border:1px solid #404040;">Otwórz workflow w admin →</a></td></tr></table></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- tools_notes_received: admin dostaje powiadomienie ze klient wpisal uwagi
INSERT INTO settings (key, value) VALUES (
  'email_template_tools_notes_received_subject',
  '{{clientName}} wpisał uwagi po analizie sesji 📝'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_tools_notes_received_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#06b6d4;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📝 Uwagi klienta</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:24px;font-weight:600;line-height:1.3;">{{clientName}} przeanalizował sesje</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Klient wpisał uwagi w kroku „Narzędzia" Etapu 5. Sprawdź co napisał i zatwierdź krok aby przejść do Serwisów.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{adminUrl}}" style="display:inline-block;background:#262626;color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;border:1px solid #404040;">Otwórz workflow w admin →</a></td></tr></table></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- tools_completed: klient dostaje info ze krok zakonczony i przechodzimy do serwisow
INSERT INTO settings (key, value) VALUES (
  'email_template_tools_completed_subject',
  'Etap 5 zakończony — lecimy dalej 🚀'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES (
  'email_template_tools_completed_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">✓ Etap 5 ukończony</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Brawo {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Dziękuję za uwagi. Etap 5 — Optymalizacja sprzedaży — jest <strong style="color:#10b981;">zakończony</strong>.</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Teraz przechodzimy do <strong style="color:#ffffff;">Serwisów</strong> — pokażę Ci dodatkowe narzędzia i procesy które dalej będą rozwijać Twój sklep. W panelu zobaczysz nową zakładkę.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Otwórz panel projektu →</a></td></tr></table></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- ─── AUTOMATION FLOWS ──────────────────────────
DO $$
DECLARE
  v_flow_id UUID;
BEGIN
  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'tools_started' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES ('Etap 5/Krok 4 — Narzedzia aktywowane', 'Email do klienta gdy admin odpala krok narzedzia (GA + Hotjar + analiza sesji)', 'tools_started', '{}', true)
    RETURNING id INTO v_flow_id;
    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "tools_started"}');
  END IF;

  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'tools_script_received' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES ('Etap 5/Krok 4 — Skrypt narzedzia otrzymany', 'Email do admina gdy klient wkleje skrypt GA lub Hotjar do osadzenia', 'tools_script_received', '{}', true)
    RETURNING id INTO v_flow_id;
    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "tools_script_received", "to_admin": true}');
  END IF;

  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'tools_notes_received' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES ('Etap 5/Krok 4 — Uwagi klienta otrzymane', 'Email do admina gdy klient wpisze uwagi po analizie sesji', 'tools_notes_received', '{}', true)
    RETURNING id INTO v_flow_id;
    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "tools_notes_received", "to_admin": true}');
  END IF;

  SELECT id INTO v_flow_id FROM automation_flows WHERE trigger_type = 'tools_completed' LIMIT 1;
  IF v_flow_id IS NULL THEN
    INSERT INTO automation_flows (name, description, trigger_type, trigger_filters, is_active)
    VALUES ('Etap 5/Krok 4 — Narzedzia zakonczone', 'Email do klienta gdy admin zatwierdzi uwagi i Etap 5 jest ukonczony', 'tools_completed', '{}', true)
    RETURNING id INTO v_flow_id;
    INSERT INTO automation_steps (flow_id, step_type, step_order, config)
    VALUES (v_flow_id, 'action', 0, '{"action_type": "send_email", "email_type": "tools_completed"}');
  END IF;
END $$;
