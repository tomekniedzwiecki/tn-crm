-- =============================================
-- EMAIL TEMPLATE: TakeDrop Account Created
-- =============================================

INSERT INTO email_templates (email_type, subject, body, variables, is_active)
VALUES (
  'takedrop_account_created',
  'Świetnie! Twoje konto TakeDrop zostało założone',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <div style="font-size: 24px; font-weight: 600; color: #fff;">Etap 2: TakeDrop</div>
              <div style="font-size: 14px; color: #666; margin-top: 4px;">Konto założone pomyślnie</div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 32px;">
              <div style="font-size: 15px; color: #e5e5e5; line-height: 1.6;">
                <p style="margin: 0 0 16px 0;">Cześć {{customer_name}},</p>

                <p style="margin: 0 0 16px 0;">Dziękuję za założenie konta w TakeDrop! To świetny krok — teraz możemy przejść do kolejnych etapów konfiguracji Twojego sklepu.</p>

                <p style="margin: 0 0 24px 0;">Twoje konto zostało zarejestrowane na adres: <strong style="color: #fff;">{{takedrop_email}}</strong></p>

                <!-- CTA -->
                <div style="text-align: center; padding: 16px 0;">
                  <a href="{{project_url}}" style="display: inline-block; background: #fff; color: #000; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Zobacz swój projekt</a>
                </div>

                <p style="margin: 24px 0 0 0; color: #888; font-size: 14px;">W razie pytań — jestem do dyspozycji.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <div style="font-size: 12px; color: #555;">
                tomekniedzwiecki.pl
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  '["customer_name", "takedrop_email", "project_url"]',
  true
)
ON CONFLICT (email_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active;
