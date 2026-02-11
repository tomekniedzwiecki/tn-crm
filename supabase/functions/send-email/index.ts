 
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// Valid email types
const VALID_EMAIL_TYPES = [
  'zapisy_confirmation',
  'proforma_generated',
  'invoice_sent',
  'contract_sent',
  'offer_created',
  'offer_personal',
  'offer_reminder_halfway',
  'offer_expired',
  'products_shared',
  'workflow_created',
  'workflow_stage_completed',
  'report_published',
  'branding_delivered',
  'sales_page_shared',
  // Etap 2
  'takedrop_activated',
  'takedrop_welcome',
  'direct'
]

// Fallback subjects only (body MUST come from database)
const FALLBACK_SUBJECTS: Record<string, string> = {
  zapisy_confirmation: 'Dziękuję za zgłoszenie',
  proforma_generated: 'Faktura proforma - {{offerName}}',
  invoice_sent: 'Faktura VAT - {{invoiceNumber}}',
  contract_sent: 'Umowa podpisana - {{offerName}}',
  offer_created: 'Twoja oferta jest gotowa - {{offerName}}',
  offer_personal: 'Re: {{offerName}}',
  offer_reminder_halfway: 'Przypomnienie: Twoja oferta wygasa {{validUntil}}',
  offer_expired: 'Twoja oferta wygasła',
  products_shared: 'Propozycje produktowe — wybierz swój produkt',
  workflow_created: 'Płatność przyjęta — podpisz umowę',
  workflow_stage_completed: 'Etap {{stageNumber}} ukończony — {{stageName}}',
  report_published: 'Raport dotyczący Twojego produktu jest gotowy',
  branding_delivered: 'Branding Twojej marki jest gotowy!',
  sales_page_shared: 'Twoja strona sprzedażowa jest gotowa!',
  // Etap 2
  takedrop_activated: 'Załóż konto na platformie sklepowej',
  takedrop_welcome: 'Witaj w TakeDrop — zaczynamy etap 2!'
}

// Offer flow email types (use special reply-to)
const OFFER_FLOW_TYPES = ['offer_created', 'offer_personal', 'offer_reminder_halfway', 'offer_expired']

// Extract first name for reply-to address (e.g. "Tomek Niedzwiecki" -> "tomek")
function getFirstNameForReplyTo(name: string): string {
  const firstName = name.split(' ')[0].toLowerCase()
  // Normalize Polish characters
  return firstName
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/[^a-z]/g, '') // Remove any non-letter characters
}

// Email signature for direct emails
function getEmailSignature(name: string = 'Tomek Niedzwiecki'): string {
  const isMaciej = name.toLowerCase().includes('maciej')
  const photo = isMaciej ? 'mk_kwadrat.png' : 'tn_kwadrat.png'
  const initials = isMaciej ? 'MK' : 'TN'

  return `<br><br><table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <tr>
        <td style="background: linear-gradient(135deg, #065f46 0%, #0d9488 100%); padding: 20px 24px; border-radius: 12px;">
            <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="vertical-align: top; padding-right: 18px;">
                        <img src="https://tomekniedzwiecki.pl/img/${photo}" width="78" height="78" style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.2); display: block;" alt="${initials}">
                    </td>
                    <td style="vertical-align: middle;">
                        <div style="font-size: 17px; font-weight: 600; color: #fff; margin-bottom: 4px;">${name}</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 12px;">Budujemy i automatyzujemy biznesy online</div>
                        <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td>
                                    <a href="https://tomekniedzwiecki.pl" style="display: inline-block; font-size: 12px; color: #fff; text-decoration: none; background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 6px;">tomekniedzwiecki.pl →</a>
                                </td>
                                <td style="padding-left: 12px;">
                                    <a href="https://www.youtube.com/@TomekNiedzwiecki" style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; background: rgba(255,255,255,0.12); border-radius: 50%; color: rgba(255,255,255,0.6); font-size: 9px; font-weight: 600; text-decoration: none;">YT</a>
                                </td>
                                <td style="padding-left: 6px;">
                                    <a href="https://www.instagram.com/tomekniedzwiecki/" style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; background: rgba(255,255,255,0.12); border-radius: 50%; color: rgba(255,255,255,0.6); font-size: 9px; font-weight: 600; text-decoration: none;">IG</a>
                                </td>
                                <td style="padding-left: 6px;">
                                    <a href="https://www.linkedin.com/in/tomasz-niedzwiecki/" style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; background: rgba(255,255,255,0.12); border-radius: 50%; color: rgba(255,255,255,0.6); font-size: 9px; font-weight: 600; text-decoration: none;">IN</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`
}

// Replace template variables with actual values
function replaceVariables(template: string, data: Record<string, any>): string {
  let result = template

  // Format price if present
  if (data.offerPrice !== undefined) {
    data.offerPrice = typeof data.offerPrice === 'number'
      ? data.offerPrice.toLocaleString('pl-PL')
      : data.offerPrice
  }

  // Format date if present
  if (data.validUntil) {
    try {
      // Handle date-only format (YYYY-MM-DD) by adding time component
      const dateStr = String(data.validUntil)
      const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T12:00:00')
      if (!isNaN(date.getTime())) {
        data.validUntil = date.toLocaleDateString('pl-PL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
    } catch (_e) {
      // Keep original value if parsing fails
    }
  }

  // Replace all {{variable}} patterns
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, data[key] ?? '')
  })

  return result
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[send-email] Request received')

    const resendApiKey = Deno.env.get('resend_api_key')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!resendApiKey) {
      throw new Error('Brak klucza API Resend')
    }
    console.log('[send-email] Resend API key present')

    const reqBody = await req.json()
    console.log('[send-email] Request body:', JSON.stringify(reqBody))

    // Support two formats:
    // 1. Template-based: { type: 'zapisy_confirmation', data: { email, ... } }
    // 2. Direct: { to, subject, html, lead_id? }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Fetch email domain settings for transactional emails
    const { data: emailDomainSettings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['email_from_name_transactional', 'email_from_transactional'])

    const domainSettingsMap: Record<string, string> = {}
    emailDomainSettings?.forEach(s => { domainSettingsMap[s.key] = s.value })

    const fromNameTransactional = domainSettingsMap.email_from_name_transactional || 'Tomek Niedzwiecki'
    const fromEmailTransactional = domainSettingsMap.email_from_transactional || 'biuro@tomekniedzwiecki.pl'
    const fromAddressTransactional = `${fromNameTransactional} <${fromEmailTransactional}>`

    console.log('[send-email] Using transactional from address:', fromAddressTransactional)

    let finalSubject: string
    let finalBody: string
    let recipientEmail: string
    let leadId: string | null = null
    let senderName: string = fromNameTransactional
    let emailType: string | null = null

    // Track sender's direct email for reply-to
    let senderDirectEmail: string | null = null

    if (reqBody.to && reqBody.subject && reqBody.html) {
      // Direct email format - add signature automatically
      console.log('[send-email] Direct email mode')
      recipientEmail = reqBody.to
      finalSubject = reqBody.subject
      // Add signature for direct emails (skip if no_signature flag is set)
      senderName = reqBody.sender_name || 'Tomek Niedzwiecki'
      finalBody = reqBody.no_signature ? reqBody.html : reqBody.html + getEmailSignature(senderName)
      leadId = reqBody.lead_id || null
      emailType = 'direct'

      // Custom reply_to takes priority (for test emails, outreach, etc.)
      if (reqBody.reply_to) {
        senderDirectEmail = reqBody.reply_to
        console.log('[send-email] Using custom reply-to:', senderDirectEmail)
      }
      // If sender_id provided, look up their business email for reply-to
      else if (reqBody.sender_id) {
        const { data: sender } = await supabase
          .from('team_members')
          .select('email')
          .eq('id', reqBody.sender_id)
          .single()

        if (sender?.email) {
          senderDirectEmail = sender.email
          console.log('[send-email] Using sender direct email for reply-to:', senderDirectEmail)
        }
      }
    } else {
      // Template-based format
      const { type, data } = reqBody
      emailType = type
      console.log('[send-email] Template mode, type:', type, 'Email:', data?.email)

      if (!type || !data) {
        throw new Error('Brak wymaganych danych (type, data)')
      }

      if (!data.email) {
        throw new Error('Brak adresu email odbiorcy')
      }

      // Validate email type
      if (!VALID_EMAIL_TYPES.includes(type)) {
        throw new Error(`Nieznany typ emaila: ${type}`)
      }

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Brak konfiguracji Supabase')
      }

      recipientEmail = data.email

      // Fetch template from database (REQUIRED)
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          `email_template_${type}_subject`,
          `email_template_${type}_body`,
          'email_reply_to',
          'offer_flow_reply_to'
        ])

      if (settingsError) {
        throw new Error(`Błąd pobierania szablonu: ${settingsError.message}`)
      }

      console.log('[send-email] Settings fetched, count:', settingsData?.length)

      const settingsMap: Record<string, string> = {}
      if (settingsData) {
        settingsData.forEach((s: { key: string; value: string }) => {
          settingsMap[s.key] = s.value
        })
      }

      console.log('[send-email] Settings keys:', Object.keys(settingsMap))

      // Subject: from DB or fallback
      const subject = settingsMap[`email_template_${type}_subject`] || FALLBACK_SUBJECTS[type] || 'Wiadomość'

      // Body: MUST be from database
      const body = settingsMap[`email_template_${type}_body`]
      if (!body) {
        console.log('[send-email] ERROR: Template body not found for type:', type)
        throw new Error(`Brak szablonu email "${type}" w ustawieniach. Skonfiguruj szablon w CRM → Ustawienia → Szablony email.`)
      }

      console.log('[send-email] Template found, subject:', subject.substring(0, 50), 'body length:', body.length)

      // Prepare data for variable replacement
      const templateData: Record<string, any> = {
        email: data.email,
        clientName: data.clientName || 'Cześć',
        offerName: data.offerName || '',
        offerPrice: data.offerPrice,
        pdfUrl: data.pdfUrl || '',
        offerUrl: data.offerUrl || '',
        validUntil: data.validUntil || '',
        checkoutUrl: data.checkoutUrl || '',
        // Invoice-specific variables
        invoiceNumber: data.invoiceNumber || '',
        amount: data.amount || '',
        description: data.description || '',
        viewUrl: data.viewUrl || '',
        // Contract-specific variables
        projectUrl: data.projectUrl || '',
        contractUrl: data.contractUrl || ''
      }

      // Replace variables in subject and body
      finalSubject = replaceVariables(subject, templateData)
      finalBody = replaceVariables(body, templateData)

      // For offer_personal, add signature
      if (type === 'offer_personal') {
        senderName = 'Tomek Niedzwiecki'
        finalBody = finalBody + getEmailSignature(senderName)
      }

      // For offer flow emails, use special reply-to
      if (OFFER_FLOW_TYPES.includes(type)) {
        senderDirectEmail = settingsMap['offer_flow_reply_to'] || 'ceo@tomekniedzwiecki.pl'
        console.log('[send-email] Using offer flow reply-to:', senderDirectEmail)
      }
    }

    // Send via Resend
    const emailPayload: Record<string, any> = {
      from: fromAddressTransactional,
      to: recipientEmail,
      subject: finalSubject,
      html: finalBody
    }

    // Set reply-to for direct emails
    // Priority: 1) Custom reply_to, 2) Sender's business email, 3) Inbound domain (if lead)
    if (senderDirectEmail) {
      // Use custom or sender's business email
      emailPayload.reply_to = senderDirectEmail
      console.log('[send-email] Reply-to set to:', senderDirectEmail)
    } else if (leadId) {
      // Fall back to inbound domain for tracking in CRM
      const replyName = getFirstNameForReplyTo(senderName)
      emailPayload.reply_to = `${replyName}@inbound.tomekniedzwiecki.pl`
      console.log('[send-email] Reply-to set to inbound:', emailPayload.reply_to)
    }

    console.log('[send-email] Sending to Resend API, to:', recipientEmail)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    const result = await response.json()

    console.log('[send-email] Resend response:', response.status, JSON.stringify(result))

    if (!response.ok) {
      throw new Error(result.message || 'Błąd wysyłania emaila')
    }

    console.log('[send-email] SUCCESS - email sent, id:', result.id)

    // Save to email_messages table for history
    const sentAt = new Date().toISOString()

    // If lead_id not provided, try to find lead by recipient email
    if (!leadId) {
      const { data: foundLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', recipientEmail)
        .limit(1)
        .single()

      if (foundLead) {
        leadId = foundLead.id
        console.log('[send-email] Found lead by email:', leadId)
      }
    }

    await supabase
      .from('email_messages')
      .insert({
        direction: 'outbound',
        from_email: fromEmailTransactional,
        from_name: fromNameTransactional,
        to_email: recipientEmail,
        subject: finalSubject,
        body_html: finalBody,
        lead_id: leadId,
        resend_id: result.id,
        status: 'sent',
        sent_at: sentAt,
        email_type: emailType
      })

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[send-email] ERROR:', errorMessage, error)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
