-- =============================================
-- Email template: lead_intro_video
-- Wysyłany 7 minut po zapisie przez /zapisy
-- =============================================

-- Subject
INSERT INTO settings (key, value) VALUES (
  'email_template_lead_intro_video_subject',
  'Zobacz jak buduję biznesy online'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Body (YouTube video: QH6aJR3bWZw)
INSERT INTO settings (key, value) VALUES (
  'email_template_lead_intro_video_body',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,''Helvetica Neue'',Arial,sans-serif;background-color:#ffffff;color:#333;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;"><tr><td><p style="margin:0 0 24px 0;font-size:16px;line-height:1.5;">{{clientName}},</p><p style="margin:0 0 32px 0;font-size:15px;line-height:1.6;">Nagrałem krótkie video — obejrzyj je, aby lepiej zrozumieć, dlaczego to <strong>ja osobiście buduję biznes dla Ciebie</strong> i potem przekazuję Ci stery.</p><p style="margin:0 0 32px 0;"><a href="https://www.youtube.com/watch?v=QH6aJR3bWZw" target="_blank" style="display:inline-block;text-decoration:none;"><img src="https://img.youtube.com/vi/QH6aJR3bWZw/maxresdefault.jpg" alt="Zobacz video" style="max-width:100%;width:480px;border-radius:12px;border:2px solid #333;"><br><span style="display:inline-block;margin-top:12px;background:#f59e0b;color:#000;padding:10px 24px;border-radius:8px;font-weight:500;font-size:14px;">▶ Obejrzyj video (5 min)</span></a></p><table cellpadding="0" cellspacing="0" border="0" width="380" style="font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Arial,sans-serif;"><tr><td style="background:linear-gradient(135deg,#065f46 0%,#0d9488 100%);padding:20px 24px;border-radius:12px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="78" style="vertical-align:top;padding-right:18px;"><img src="https://tomekniedzwiecki.pl/img/tn_kwadrat.png" width="78" height="78" style="border-radius:12px;border:2px solid rgba(255,255,255,0.2);display:block;" alt="TN"></td><td style="vertical-align:middle;"><div style="font-size:17px;font-weight:600;color:#fff;margin-bottom:4px;">Tomek Niedzwiecki</div><div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:12px;">Budujemy i automatyzujemy biznesy online</div><table cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:8px;"><a href="https://tomekniedzwiecki.pl" style="display:inline-block;font-size:12px;color:#fff;text-decoration:none;background:rgba(255,255,255,0.18);padding:6px 14px;border-radius:6px;">tomekniedzwiecki.pl →</a></td><td style="padding-right:4px;"><a href="https://www.youtube.com/@TomekNiedzwiecki" style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.6);font-size:9px;font-weight:600;text-decoration:none;">YT</a></td><td style="padding-right:4px;"><a href="https://www.instagram.com/tomekniedzwiecki/" style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.6);font-size:9px;font-weight:600;text-decoration:none;">IG</a></td><td><a href="https://www.linkedin.com/in/tomasz-niedzwiecki/" style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.6);font-size:9px;font-weight:600;text-decoration:none;">IN</a></td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Add step to existing lead_created automation (delay 7 min, then send video)
-- First check if step already exists
DO $$
DECLARE
  v_flow_id UUID := 'a0000000-0000-0000-0000-000000000010';
  v_existing_delay UUID;
BEGIN
  -- Check if delay step already exists
  SELECT id INTO v_existing_delay
  FROM automation_steps
  WHERE flow_id = v_flow_id AND step_order = 1;

  IF v_existing_delay IS NULL THEN
    -- Add delay step (7 minutes)
    INSERT INTO automation_steps (id, flow_id, step_order, step_type, config)
    VALUES (
      'b0000000-0000-0000-0000-000000000011',
      v_flow_id,
      1,
      'delay',
      '{"delay_value": 7, "delay_unit": "minutes"}'
    );

    -- Add video email step
    INSERT INTO automation_steps (id, flow_id, step_order, step_type, config)
    VALUES (
      'b0000000-0000-0000-0000-000000000012',
      v_flow_id,
      2,
      'action',
      '{"action_type": "send_email", "email_type": "lead_intro_video"}'
    );
  END IF;
END $$;
