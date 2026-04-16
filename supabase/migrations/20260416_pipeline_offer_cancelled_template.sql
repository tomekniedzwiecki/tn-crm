-- Szablon: pipeline_offer_cancelled
-- Prosty, Gmail-style email informujący że oferta nie jest już aktualna.
-- Kategoria: pipeline (nowa sekcja dla maili wysyłanych w ramach lead pipeline automation).

INSERT INTO email_templates (email_type, subject, body, variables, is_active, updated_at)
VALUES (
  'pipeline_offer_cancelled',
  'anulowanie',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#222;font-size:14px;line-height:1.5;">
  <div style="max-width:600px;">
    <p style="margin:0 0 14px 0;">Cześć,</p>
    <p style="margin:0 0 14px 0;">daję znać, że oferta którą Ci przedstawiłem nie jest już aktualna.</p>
    <p style="margin:0 0 20px 0;">Pozdrawiam,</p>
    <table cellpadding="0" cellspacing="0" border="0" width="380">
      <tr>
        <td style="background:linear-gradient(135deg,#065f46 0%,#0d9488 100%);padding:20px 24px;border-radius:12px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="78" style="vertical-align:top;padding-right:18px;">
                <img src="https://tomekniedzwiecki.pl/img/tn_kwadrat.png" width="78" height="78" style="border-radius:12px;border:2px solid rgba(255,255,255,0.2);display:block;" alt="TN">
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:17px;font-weight:600;color:#fff;margin-bottom:4px;">Tomek Niedzwiecki</div>
                <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:12px;">Budujemy i automatyzujemy biznesy online</div>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right:8px;"><a href="https://tomekniedzwiecki.pl" style="display:inline-block;font-size:12px;color:#fff;text-decoration:none;background:rgba(255,255,255,0.18);padding:6px 14px;border-radius:6px;">tomekniedzwiecki.pl →</a></td>
                    <td style="padding-right:4px;"><a href="https://www.youtube.com/@TomekNiedzwiecki" style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.6);font-size:9px;font-weight:600;text-decoration:none;">YT</a></td>
                    <td style="padding-right:4px;"><a href="https://www.instagram.com/tomekniedzwiecki/" style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.6);font-size:9px;font-weight:600;text-decoration:none;">IG</a></td>
                    <td><a href="https://www.linkedin.com/in/tomasz-niedzwiecki/" style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.6);font-size:9px;font-weight:600;text-decoration:none;">IN</a></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>',
  '[]'::jsonb,
  true,
  NOW()
)
ON CONFLICT (email_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = NOW();
