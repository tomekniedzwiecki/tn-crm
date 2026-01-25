import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'http://localhost:3000',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

interface OutreachContact {
  id: string
  email: string
  phone: string | null
  ltv_pln: number | null
  products: string[] | null
}

interface OutreachSend {
  id: string
  campaign_id: string
  contact_id: string
  email_1_sent_at: string
  contact: OutreachContact
}

interface Campaign {
  id: string
  name: string
  follow_up_delay_days: number
  email_2_subject: string | null
  email_2_body: string | null
  followed_up_count: number
}

// Replace template variables
function replaceVariables(template: string, contact: OutreachContact): string {
  let result = template

  result = result.replace(/\{\{email\}\}/g, contact.email)
  result = result.replace(/\{\{phone\}\}/g, contact.phone || '')
  result = result.replace(/\{\{ltv\}\}/g, contact.ltv_pln?.toLocaleString('pl-PL') || '0')
  result = result.replace(/\{\{products\}\}/g, contact.products?.join(', ') || '')

  return result
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

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[outreach-followup] Starting follow-up job')

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

    // Fetch email domain settings
    const { data: emailSettings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['email_from_name_outreach', 'email_from_outreach'])

    const settingsMap: Record<string, string> = {}
    emailSettings?.forEach(s => { settingsMap[s.key] = s.value })

    const fromName = settingsMap.email_from_name_outreach || 'Tomek Niedzwiecki'
    const fromEmail = settingsMap.email_from_outreach || 'biuro@tomekniedzwiecki.pl'
    const fromAddress = `${fromName} <${fromEmail}>`

    console.log(`[outreach-followup] Using from address: ${fromAddress}`)

    // Get active campaigns with follow-up configured
    const { data: campaigns, error: campaignsError } = await supabase
      .from('outreach_campaigns')
      .select('*')
      .eq('status', 'active')
      .not('email_2_subject', 'is', null)
      .not('email_2_body', 'is', null)

    if (campaignsError) {
      throw new Error(`Error fetching campaigns: ${campaignsError.message}`)
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('[outreach-followup] No campaigns with follow-up configured')
      return new Response(
        JSON.stringify({ success: true, message: 'No follow-ups to send', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[outreach-followup] Found ${campaigns.length} campaigns with follow-up`)

    let totalSent = 0
    const results: { campaign: string; sent: number; errors: number }[] = []

    for (const campaign of campaigns as Campaign[]) {
      console.log(`[outreach-followup] Processing campaign: ${campaign.name}`)

      // Calculate cutoff date (emails sent X days ago that haven't been replied or followed up)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - campaign.follow_up_delay_days)

      // Get sends that need follow-up
      // Use !inner to only get sends with existing contacts
      const { data: needsFollowup, error: sendsError } = await supabase
        .from('outreach_sends')
        .select(`
          id,
          campaign_id,
          contact_id,
          email_1_sent_at,
          contact:outreach_contacts!inner (
            id,
            email,
            phone,
            ltv_pln,
            products
          )
        `)
        .eq('campaign_id', campaign.id)
        .eq('status', 'sent')
        .lt('email_1_sent_at', cutoffDate.toISOString())
        .is('email_2_sent_at', null)
        .limit(campaign.follow_up_delay_days > 0 ? 100 : 0) // Limit per run

      if (sendsError) {
        console.error(`[outreach-followup] Error fetching sends for ${campaign.name}:`, sendsError)
        continue
      }

      // Filter to only those with valid email
      const validFollowups = (needsFollowup || [])
        .filter((s: any) => s.contact && s.contact.email && s.contact.email.includes('@')) as unknown as OutreachSend[]

      if (validFollowups.length === 0) {
        console.log(`[outreach-followup] No valid follow-ups for ${campaign.name}`)
        continue
      }

      console.log(`[outreach-followup] Sending ${validFollowups.length} follow-ups for ${campaign.name}`)

      let campaignSent = 0
      let campaignErrors = 0

      for (const send of validFollowups) {
        const contact = send.contact

        try {
          // Prepare email
          const subject = replaceVariables(campaign.email_2_subject!, contact)
          const body = replaceVariables(campaign.email_2_body!, contact)

          // Send via Resend with inbound reply-to for tracking
          const replyTo = `reply+${send.id}@inbound.tomekniedzwiecki.pl`

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: fromAddress,
              reply_to: replyTo,
              to: contact.email,
              subject: subject,
              html: body
            })
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.message || 'Resend API error')
          }

          const sentAt = new Date().toISOString()

          // Update send status
          await supabase
            .from('outreach_sends')
            .update({
              status: 'followed_up',
              email_2_sent_at: sentAt,
              email_2_resend_id: result.id
            })
            .eq('id', send.id)

          // Log to email_messages for history
          await supabase
            .from('email_messages')
            .insert({
              direction: 'outbound',
              from_email: fromEmail,
              from_name: fromName,
              to_email: contact.email,
              subject: subject,
              body_html: body,
              outreach_send_id: send.id,
              outreach_contact_id: contact.id,
              resend_id: result.id,
              status: 'sent',
              sent_at: sentAt
            })

          campaignSent++
          totalSent++
          console.log(`[outreach-followup] Follow-up sent to ${contact.email}`)

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (emailError: unknown) {
          const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
          console.error(`[outreach-followup] Error sending follow-up to ${contact.email}:`, errorMessage)
          campaignErrors++
        }
      }

      // Update campaign stats
      await supabase
        .from('outreach_campaigns')
        .update({ followed_up_count: campaign.followed_up_count + campaignSent })
        .eq('id', campaign.id)

      results.push({ campaign: campaign.name, sent: campaignSent, errors: campaignErrors })
    }

    console.log(`[outreach-followup] Completed. Total follow-ups sent: ${totalSent}`)

    return new Response(
      JSON.stringify({ success: true, sent: totalSent, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[outreach-followup] ERROR:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
