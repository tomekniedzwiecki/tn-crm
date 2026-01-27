
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

interface ScheduledEmail {
  id: string
  lead_id: string
  client_offer_id: string
  email_type: 'offer_created' | 'offer_personal' | 'offer_reminder_halfway' | 'offer_expired'
  scheduled_for: string
  metadata: Record<string, any>
}

interface Lead {
  id: string
  email: string
  name: string | null
  company: string | null
}

interface ClientOffer {
  id: string
  lead_id: string
  offer_id: string
  unique_token: string
  valid_until: string
  offer: {
    id: string
    name: string
    price: number
  }
}

// Email signature
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

// Replace template variables
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

// Get client offer URL
function getOfferUrl(token: string): string {
  return `https://crm.tomekniedzwiecki.pl/p/${token}`
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[offer-emails-cron] Starting offer emails job')

    const resendApiKey = Deno.env.get('resend_api_key')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!resendApiKey) {
      throw new Error('Missing resend_api_key')
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase config')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch email settings
    const { data: emailSettings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', [
        'email_from_name_transactional',
        'email_from_transactional',
        'offer_flow_reply_to',
        // Templates
        'email_template_offer_created_subject',
        'email_template_offer_created_body',
        'email_template_offer_personal_subject',
        'email_template_offer_personal_body',
        'email_template_offer_reminder_halfway_subject',
        'email_template_offer_reminder_halfway_body',
        'email_template_offer_expired_subject',
        'email_template_offer_expired_body'
      ])

    const settings: Record<string, string> = {}
    emailSettings?.forEach(s => { settings[s.key] = s.value })

    const fromName = settings.email_from_name_transactional || 'Tomek Niedzwiecki'
    const fromEmail = settings.email_from_transactional || 'biuro@tomekniedzwiecki.pl'
    const fromAddress = `${fromName} <${fromEmail}>`
    const replyTo = settings.offer_flow_reply_to || 'ceo@tomekniedzwiecki.pl'

    console.log(`[offer-emails-cron] Using from: ${fromAddress}, reply-to: ${replyTo}`)

    // Get pending scheduled emails
    const now = new Date().toISOString()
    const { data: pendingEmails, error: pendingError } = await supabase
      .from('scheduled_emails')
      .select('*')
      .lte('scheduled_for', now)
      .is('sent_at', null)
      .is('cancelled_at', null)
      .order('scheduled_for', { ascending: true })
      .limit(50) // Process max 50 per run

    if (pendingError) {
      throw new Error(`Error fetching pending emails: ${pendingError.message}`)
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('[offer-emails-cron] No pending emails')
      return new Response(
        JSON.stringify({ success: true, message: 'No pending emails', sent: 0, cancelled: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[offer-emails-cron] Found ${pendingEmails.length} pending emails`)

    let totalSent = 0
    let totalCancelled = 0
    const errors: string[] = []

    for (const scheduledEmail of pendingEmails as ScheduledEmail[]) {
      try {
        // Fetch lead
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('id, email, name, company')
          .eq('id', scheduledEmail.lead_id)
          .single()

        if (leadError || !lead) {
          console.error(`[offer-emails-cron] Lead not found for ${scheduledEmail.id}`)
          await markAsCancelled(supabase, scheduledEmail.id, 'lead_not_found')
          totalCancelled++
          continue
        }

        // Check if lead has purchased (orders with same email, status='paid', last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: paidOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_email', lead.email)
          .eq('status', 'paid')
          .gte('created_at', sevenDaysAgo)
          .limit(1)
          .single()

        if (paidOrder) {
          console.log(`[offer-emails-cron] Lead ${lead.email} has purchased - cancelling all pending emails`)
          // Cancel ALL pending emails for this lead
          await supabase
            .from('scheduled_emails')
            .update({ cancelled_at: new Date().toISOString(), cancel_reason: 'purchased' })
            .eq('lead_id', scheduledEmail.lead_id)
            .is('sent_at', null)
            .is('cancelled_at', null)

          totalCancelled++
          continue
        }

        // Fetch client offer with offer details
        const { data: clientOffer, error: offerError } = await supabase
          .from('client_offers')
          .select(`
            id,
            lead_id,
            offer_id,
            unique_token,
            valid_until,
            offer:offers (
              id,
              name,
              price
            )
          `)
          .eq('id', scheduledEmail.client_offer_id)
          .single()

        if (offerError || !clientOffer) {
          console.error(`[offer-emails-cron] Client offer not found for ${scheduledEmail.id}`)
          await markAsCancelled(supabase, scheduledEmail.id, 'client_offer_not_found')
          totalCancelled++
          continue
        }

        // For offer_expired, check if offer actually expired
        if (scheduledEmail.email_type === 'offer_expired') {
          const validUntilDate = new Date(clientOffer.valid_until + 'T23:59:59')
          if (validUntilDate > new Date()) {
            // Offer hasn't expired yet - skip (will be picked up later)
            console.log(`[offer-emails-cron] Offer ${clientOffer.id} hasn't expired yet - skipping`)
            continue
          }
        }

        // Get template
        const subjectKey = `email_template_${scheduledEmail.email_type}_subject`
        const bodyKey = `email_template_${scheduledEmail.email_type}_body`

        const subjectTemplate = settings[subjectKey]
        const bodyTemplate = settings[bodyKey]

        if (!subjectTemplate || !bodyTemplate) {
          console.error(`[offer-emails-cron] Template not found for ${scheduledEmail.email_type}`)
          await markAsCancelled(supabase, scheduledEmail.id, 'template_not_found')
          totalCancelled++
          continue
        }

        // Prepare template data
        const offerData = clientOffer.offer as any
        const templateData = {
          clientName: lead.name || lead.company || 'Cześć',
          offerName: offerData?.name || '',
          offerPrice: offerData?.price || 0,
          validUntil: clientOffer.valid_until,
          offerUrl: getOfferUrl(clientOffer.unique_token),
          email: lead.email,
          senderName: 'Tomek Niedzwiecki'
        }

        const subject = replaceVariables(subjectTemplate, templateData)
        let body = replaceVariables(bodyTemplate, templateData)

        // Add signature for offer_personal type
        if (scheduledEmail.email_type === 'offer_personal') {
          body = body + getEmailSignature('Tomek Niedzwiecki')
        }

        // Send email via Resend
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromAddress,
            to: lead.email,
            subject: subject,
            html: body,
            reply_to: replyTo
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Resend API error')
        }

        const sentAt = new Date().toISOString()

        // Mark as sent
        await supabase
          .from('scheduled_emails')
          .update({ sent_at: sentAt })
          .eq('id', scheduledEmail.id)

        // Log to email_messages
        await supabase
          .from('email_messages')
          .insert({
            direction: 'outbound',
            from_email: fromEmail,
            from_name: fromName,
            to_email: lead.email,
            subject: subject,
            body_html: body,
            lead_id: lead.id,
            resend_id: result.id,
            status: 'sent',
            sent_at: sentAt
          })

        totalSent++
        console.log(`[offer-emails-cron] Sent ${scheduledEmail.email_type} to ${lead.email}`)

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
        console.error(`[offer-emails-cron] Error processing ${scheduledEmail.id}:`, errorMessage)
        errors.push(`${scheduledEmail.id}: ${errorMessage}`)
      }
    }

    console.log(`[offer-emails-cron] Completed. Sent: ${totalSent}, Cancelled: ${totalCancelled}`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: totalSent,
        cancelled: totalCancelled,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[offer-emails-cron] ERROR:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function markAsCancelled(supabase: any, emailId: string, reason: string) {
  await supabase
    .from('scheduled_emails')
    .update({
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason
    })
    .eq('id', emailId)
}
