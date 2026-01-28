-- Add columns for fully signed contract and send timestamp
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_seller_signed_url TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS contract_sent_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN workflows.contract_seller_signed_url IS 'URL to the fully signed contract (both parties)';
COMMENT ON COLUMN workflows.contract_sent_at IS 'Timestamp when signed contract was added and client notified';

-- Add default email template for contract_sent
INSERT INTO settings (key, value) VALUES
('email_template_contract_sent_subject', 'Umowa podpisana - {{offerName}}'),
('email_template_contract_sent_body', '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #000000;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border-radius: 12px; border: 1px solid #262626;">
                    <tr>
                        <td style="padding: 48px 40px 40px 40px;">
                            <!-- Label -->
                            <p style="margin: 0 0 8px 0; color: #10b981; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                Umowa podpisana
                            </p>

                            <!-- Headline -->
                            <h1 style="margin: 0 0 24px 0; color: #ffffff; font-size: 28px; font-weight: 600; line-height: 1.3;">
                                {{clientName}}, Twoja umowa zostala podpisana!
                            </h1>

                            <!-- Intro text -->
                            <p style="margin: 0 0 32px 0; color: #a3a3a3; font-size: 15px; line-height: 1.6;">
                                Umowa dla projektu <span style="color: #ffffff;">{{offerName}}</span> zostala podpisana przez obie strony. Mozesz ja pobrac na stronie projektu.
                            </p>

                            <!-- Info box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #171717; border-radius: 8px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <div class="flex items-center gap-3" style="margin-bottom: 16px;">
                                            <p style="margin: 0 0 4px 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                                Projekt
                                            </p>
                                            <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                                                {{offerName}}
                                            </p>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>
                                            <span style="color: #10b981; font-size: 13px; font-weight: 500;">Umowa podpisana</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{projectUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center;">
                                            Pobierz umowe
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Note -->
                            <p style="margin: 0; color: #737373; font-size: 13px; line-height: 1.5; text-align: center;">
                                Dziekujemy za zaufanie!
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid #262626; text-align: center;">
                            <a href="https://tomekniedzwiecki.pl" style="color: #525252; font-size: 12px; text-decoration: none;">tomekniedzwiecki.pl</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
