import { createClient } from 'jsr:@supabase/supabase-js@2'

// Resend webhook events we care about
type ResendEventType = 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained'

interface ResendWebhookPayload {
  type: ResendEventType
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    click?: {
      link: string
    }
    bounce?: {
      type: string
    }
  }
}

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('[resend-webhook] Received webhook')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase config')
    }

    // Verify webhook signature (if secret is configured)
    if (webhookSecret) {
      const signature = req.headers.get('svix-signature')
      // Note: For production, implement proper SVIX signature verification
      // https://docs.resend.com/dashboard/webhooks#verify-webhook-signatures
      if (!signature) {
        console.warn('[resend-webhook] Missing signature header')
        // Continue anyway for now, but log it
      }
    }

    const payload: ResendWebhookPayload = await req.json()
    console.log('[resend-webhook] Event type:', payload.type, 'Email ID:', payload.data.email_id)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Map Resend email_id to our resend_id column
    const resendId = payload.data.email_id

    // Prepare event data for the function
    const eventData: Record<string, any> = {}

    if (payload.data.click?.link) {
      eventData.link = payload.data.click.link
    }

    if (payload.data.bounce?.type) {
      eventData.type = payload.data.bounce.type
    }

    // Call the tracking function
    const { data, error } = await supabase.rpc('update_email_tracking', {
      p_resend_id: resendId,
      p_event_type: payload.type,
      p_event_data: eventData
    })

    if (error) {
      console.error('[resend-webhook] Error updating tracking:', error)
      // Don't fail the webhook - Resend will retry
    } else {
      console.log('[resend-webhook] Tracking updated:', data)
    }

    // Always return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ success: true, processed: payload.type }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[resend-webhook] ERROR:', errorMessage)

    // Return 200 anyway to prevent Resend from retrying on parse errors
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
