-- Email template: content_ready — wysyłany gdy pipeline wygeneruje materiały reklamowe

INSERT INTO email_templates (email_type, subject, body, variables, is_active, updated_at)
VALUES (
  'content_ready',
  'Twoje reklamy są gotowe — zobacz materiały!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">
          <tr>
            <td style="padding-bottom: 32px;">
              <div style="font-size: 24px; font-weight: 600; color: #fff;">Twoje reklamy są gotowe!</div>
              <div style="font-size: 14px; color: #666; margin-top: 4px;">Etap 4: Content reklamowy</div>
            </td>
          </tr>
          <tr>
            <td style="background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 32px;">
              <div style="font-size: 15px; color: #e5e5e5; line-height: 1.6;">
                <p style="margin: 0 0 16px 0;">Cześć {{clientName}},</p>

                <p style="margin: 0 0 16px 0;">Świetna wiadomość — przygotowałem dla Twojego sklepu <strong style="color: #fff;">kompletny pakiet reklamowy</strong> gotowy do uruchomienia na Meta Ads:</p>

                <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #d4d4d4;">
                  <li style="margin-bottom: 8px;">🔍 <strong style="color: #fff;">Analiza konkurencji</strong> — co robią inne marki w Twojej niszy na Facebooku i jak się wyróżniamy</li>
                  <li style="margin-bottom: 8px;">✍️ <strong style="color: #fff;">5 wersji copy reklamowego</strong> — każda z innym kątem (myth-busting, social proof, problem-solution i więcej)</li>
                  <li style="margin-bottom: 8px;">🎨 <strong style="color: #fff;">5 gotowych kreacji graficznych</strong> 1080x1080 z Twoim produktem i polskim tekstem na obrazie</li>
                </ul>

                <p style="margin: 0 0 24px 0;">Zobacz podgląd wszystkich reklam w panelu klienta — każdą zobaczysz dokładnie tak, jak będzie wyglądać na Facebooku.</p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="{{projectUrl}}#content" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">Zobacz materiały reklamowe →</a>
                </div>

                <p style="margin: 24px 0 0 0; color: #999; font-size: 13px;">Kolejny krok: uruchamiam kampanię na Meta Ads. Dam znać mailem gdy reklamy zaczną się wyświetlać.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; text-align: center; font-size: 12px; color: #555;">
              Pozdrawiam,<br>Tomek Niedźwiecki
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  '["clientName", "projectUrl"]'::jsonb,
  true,
  NOW()
)
ON CONFLICT (email_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = NOW();
