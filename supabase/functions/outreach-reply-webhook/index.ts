import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Resend Inbound Webhook Handler
 *
 * Receives incoming email replies and marks contacts as replied in outreach campaigns.
 *
 * Resend Inbound payload structure:
 * {
 *   "from": "sender@example.com",
 *   "to": "you@yourdomain.com",
 *   "subject": "Re: Your subject",
 *   "text": "Plain text body",
 *   "html": "<p>HTML body</p>",
 *   "headers": {...},
 *   "attachments": [...]
 * }
 */

interface ResendInboundPayload {
  from: string
  to: string
  subject: string
  text?: string
  html?: string
  headers?: Record<string, string>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[outreach-reply-webhook] Received webhook')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase config')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse incoming email
    const payload: ResendInboundPayload = await req.json()

    const fromEmail = payload.from.toLowerCase()
    const subject = payload.subject || ''
    const body = payload.text || payload.html || ''

    console.log(`[outreach-reply-webhook] Reply from: ${fromEmail}, Subject: ${subject.substring(0, 50)}`)

    // Extract email address if it's in format "Name <email@example.com>"
    const emailMatch = fromEmail.match(/<([^>]+)>/)
    const cleanEmail = emailMatch ? emailMatch[1] : fromEmail

    // Find the contact by email
    const { data: contacts, error: contactError } = await supabase
      .from('outreach_contacts')
      .select('id')
      .ilike('email', cleanEmail)

    if (contactError || !contacts || contacts.length === 0) {
      console.log(`[outreach-reply-webhook] Contact not found for email: ${cleanEmail}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Contact not found', processed: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const contactId = contacts[0].id

    // Find active/sent outreach_sends for this contact
    const { data: sends, error: sendsError } = await supabase
      .from('outreach_sends')
      .select('id, campaign_id, status')
      .eq('contact_id', contactId)
      .in('status', ['sent', 'followed_up'])
      .order('email_1_sent_at', { ascending: false })
      .limit(1)

    if (sendsError || !sends || sends.length === 0) {
      console.log(`[outreach-reply-webhook] No active sends found for contact: ${contactId}`)
      return new Response(
        JSON.stringify({ success: true, message: 'No active sends', processed: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const send = sends[0]

    // Update send as replied
    const { error: updateError } = await supabase
      .from('outreach_sends')
      .update({
        status: 'replied',
        replied_at: new Date().toISOString(),
        reply_content: body.substring(0, 5000), // Limit content size
        reply_from_email: cleanEmail
      })
      .eq('id', send.id)

    if (updateError) {
      throw new Error(`Error updating send: ${updateError.message}`)
    }

    // Update campaign reply count
    const { data: campaign } = await supabase
      .from('outreach_campaigns')
      .select('replied_count')
      .eq('id', send.campaign_id)
      .single()

    if (campaign) {
      await supabase
        .from('outreach_campaigns')
        .update({ replied_count: (campaign.replied_count || 0) + 1 })
        .eq('id', send.campaign_id)
    }

    console.log(`[outreach-reply-webhook] Marked as replied: ${cleanEmail} (send: ${send.id})`)

    // Optional: Send Slack notification about reply
    const slackWebhookUrl = Deno.env.get('slack_webhook_url')
    if (slackWebhookUrl) {
      try {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: [
              {
                type: 'header',
                text: { type: 'plain_text', text: 'Odpowiedź na kampanię outreach', emoji: false }
              },
              {
                type: 'section',
                text: { type: 'mrkdwn', text: `*Od:* ${cleanEmail}\n*Temat:* ${subject}` }
              },
              {
                type: 'section',
                text: { type: 'mrkdwn', text: `*Treść:*\n${body.substring(0, 500)}${body.length > 500 ? '...' : ''}` }
              }
            ]
          })
        })
      } catch (slackError) {
        console.error('[outreach-reply-webhook] Slack notification error:', slackError)
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: true, email: cleanEmail }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[outreach-reply-webhook] ERROR:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
