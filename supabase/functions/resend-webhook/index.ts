import { createClient } from 'jsr:@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// Resend webhook events we care about
type ResendEventType = 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained'

// Verify SVIX webhook signature
async function verifySvixSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): Promise<boolean> {
  try {
    const signatures = signature.split(' ')
    const signedPayload = `${timestamp}.${payload}`

    // Secret is in format "whsec_..." - remove prefix and decode from base64
    const secretBytes = Uint8Array.from(atob(secret.replace('whsec_', '')), c => c.charCodeAt(0))

    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const expectedSignature = 'v1,' + btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))

    return signatures.some(sig => sig === expectedSignature)
  } catch (error) {
    console.error('[resend-webhook] Signature verification error:', error)
    return false
  }
}

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

    // Get body as text for signature verification
    const bodyText = await req.text()

    // Verify webhook signature (if secret is configured)
    if (webhookSecret) {
      const signature = req.headers.get('svix-signature')
      const timestamp = req.headers.get('svix-timestamp')

      if (!signature || !timestamp) {
        console.error('[resend-webhook] Missing signature headers - rejecting')
        return new Response('Missing signature', { status: 401 })
      }

      const isValid = await verifySvixSignature(bodyText, signature, timestamp, webhookSecret)
      if (!isValid) {
        console.error('[resend-webhook] Invalid signature - rejecting')
        return new Response('Invalid signature', { status: 401 })
      }
      console.log('[resend-webhook] Signature verified')
    }

    const payload: ResendWebhookPayload = JSON.parse(bodyText)
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
