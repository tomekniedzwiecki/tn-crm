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
  contact: OutreachContact
}

interface Campaign {
  id: string
  name: string
  daily_limit: number
  email_1_subject: string
  email_1_body: string
  sent_count: number
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
    console.log('[outreach-send] Starting daily send job')

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

    console.log(`[outreach-send] Using from address: ${fromAddress}`)

    // Get active campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('outreach_campaigns')
      .select('*')
      .eq('status', 'active')

    if (campaignsError) {
      throw new Error(`Error fetching campaigns: ${campaignsError.message}`)
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('[outreach-send] No active campaigns')
      return new Response(
        JSON.stringify({ success: true, message: 'No active campaigns', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[outreach-send] Found ${campaigns.length} active campaigns`)

    let totalSent = 0
    const results: { campaign: string; sent: number; errors: number }[] = []

    for (const campaign of campaigns as Campaign[]) {
      console.log(`[outreach-send] Processing campaign: ${campaign.name}`)

      // Get pending sends for this campaign
      // Fetch more than daily limit to account for contacts without valid email
      // Use !inner to only get sends with existing contacts
      const fetchLimit = campaign.daily_limit * 2 // Fetch 2x to have buffer
      const { data: pendingSends, error: sendsError } = await supabase
        .from('outreach_sends')
        .select(`
          id,
          campaign_id,
          contact_id,
          contact:outreach_contacts!inner (
            id,
            email,
            phone,
            ltv_pln,
            products
          )
        `)
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending')
        .order('random_sort', { ascending: true, nullsFirst: false })
        .limit(fetchLimit)

      if (sendsError) {
        console.error(`[outreach-send] Error fetching sends for ${campaign.name}:`, sendsError)
        continue
      }

      if (!pendingSends || pendingSends.length === 0) {
        console.log(`[outreach-send] No pending sends for ${campaign.name}`)

        // Check if campaign is complete
        const { count } = await supabase
          .from('outreach_sends')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'pending')

        if (count === 0) {
          // Mark campaign as completed
          await supabase
            .from('outreach_campaigns')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', campaign.id)
          console.log(`[outreach-send] Campaign ${campaign.name} marked as completed`)
        }
        continue
      }

      // Filter to only those with valid email and limit to daily_limit
      const validSends = (pendingSends as unknown as OutreachSend[])
        .filter(s => s.contact && s.contact.email && s.contact.email.includes('@'))
        .slice(0, campaign.daily_limit)

      console.log(`[outreach-send] Fetched ${pendingSends.length}, valid: ${validSends.length}, sending up to ${campaign.daily_limit} for ${campaign.name}`)

      if (validSends.length === 0) {
        console.log(`[outreach-send] No valid sends for ${campaign.name}`)
        continue
      }

      let campaignSent = 0
      let campaignErrors = 0

      for (const send of validSends) {
        const contact = send.contact

        try {
          // Prepare email (no signature for cold outreach)
          const subject = replaceVariables(campaign.email_1_subject, contact)
          const body = replaceVariables(campaign.email_1_body, contact)

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
              status: 'sent',
              email_1_sent_at: sentAt,
              email_1_resend_id: result.id
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
          console.log(`[outreach-send] Sent to ${contact.email}`)

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (emailError: unknown) {
          const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
          console.error(`[outreach-send] Error sending to ${contact.email}:`, errorMessage)

          // Mark as excluded if bounce/invalid
          if (errorMessage.includes('bounce') || errorMessage.includes('invalid')) {
            await supabase
              .from('outreach_sends')
              .update({ status: 'bounced', excluded_reason: errorMessage })
              .eq('id', send.id)
          }

          campaignErrors++
        }
      }

      // Update campaign stats
      await supabase
        .from('outreach_campaigns')
        .update({ sent_count: campaign.sent_count + campaignSent })
        .eq('id', campaign.id)

      results.push({ campaign: campaign.name, sent: campaignSent, errors: campaignErrors })
    }

    console.log(`[outreach-send] Completed. Total sent: ${totalSent}`)

    return new Response(
      JSON.stringify({ success: true, sent: totalSent, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[outreach-send] ERROR:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
