import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const resendApiKey = Deno.env.get('resend_api_key')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body = await req.json()
    const { unique_token } = body

    if (!unique_token) {
      throw new Error('Brak tokenu projektu')
    }

    // Validate unique_token format (basic protection)
    if (typeof unique_token !== 'string' || unique_token.length < 8 || unique_token.length > 100) {
      throw new Error('Nieprawidłowy token')
    }

    // Find workflow by unique_token
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id, customer_email, customer_name, unique_token, password_reset_expires')
      .eq('unique_token', unique_token)
      .single()

    // Generic error message to prevent enumeration
    if (workflowError || !workflow) {
      // Return success to prevent enumeration attacks
      console.log('[password-reset] Workflow not found for token (returning success to prevent enumeration)')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jeśli email istnieje w systemie, link do resetu został wysłany'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!workflow.customer_email) {
      // Return success to prevent enumeration
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jeśli email istnieje w systemie, link do resetu został wysłany'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting: check if reset was requested recently (within 5 minutes)
    if (workflow.password_reset_expires) {
      const lastResetExpires = new Date(workflow.password_reset_expires)
      // Token expires in 1 hour, so subtract 55 minutes to get ~5 min cooldown
      const cooldownEnd = new Date(lastResetExpires.getTime() - 55 * 60 * 1000)

      if (new Date() < cooldownEnd) {
        const waitMinutes = Math.ceil((cooldownEnd.getTime() - Date.now()) / 60000)
        console.log('[password-reset] Rate limited, wait minutes:', waitMinutes)
        return new Response(
          JSON.stringify({
            success: false,
            error: `Proszę poczekać ${waitMinutes} minut przed ponowną próbą`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
    }

    // Generate secure reset token
    const resetToken = crypto.randomUUID() + '-' + crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Save token to database
    const { error: updateError } = await supabase
      .from('workflows')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: expiresAt.toISOString()
      })
      .eq('id', workflow.id)

    if (updateError) {
      console.error('Error saving reset token:', updateError)
      throw new Error('Błąd zapisu tokenu')
    }

    // Build reset URL
    const resetUrl = `https://crm.tomekniedzwiecki.pl/projekt/${workflow.unique_token}?reset_token=${resetToken}`

    // Send email via Resend
    if (!resendApiKey) {
      throw new Error('Brak klucza API Resend')
    }

    const clientName = workflow.customer_name?.split(' ')[0] || 'Cześć'

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;">
                    <tr>
                        <td style="padding:48px 40px 40px 40px;">
                            <p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Reset hasła</p>
                            <h1 style="margin:0 0 24px 0;color:#ffffff;font-size:28px;font-weight:600;line-height:1.3;">${clientName}, zresetuj swoje hasło</h1>
                            <p style="margin:0 0 20px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Otrzymaliśmy prośbę o reset hasła do Twojego panelu projektu.</p>
                            <p style="margin:0 0 32px 0;color:#a3a3a3;font-size:15px;line-height:1.6;">Kliknij poniższy przycisk, aby ustawić nowe hasło. Link jest ważny przez 1 godzinę.</p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;font-weight:600;text-align:center;">Ustaw nowe hasło →</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0;color:#737373;font-size:13px;line-height:1.5;">Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px;border-top:1px solid #262626;text-align:center;">
                            <a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Tomek Niedzwiecki <ceo@tomekniedzwiecki.pl>',
        to: workflow.customer_email,
        subject: 'Reset hasła do panelu projektu',
        html: emailHtml
      })
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend error:', emailResult)
      throw new Error('Błąd wysyłki emaila')
    }

    console.log(`[password-reset] Reset email sent to ${workflow.customer_email}, resend_id: ${emailResult.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Link do resetu hasła został wysłany na email'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[password-reset] Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
