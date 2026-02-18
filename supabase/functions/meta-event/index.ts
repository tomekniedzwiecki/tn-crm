import { createClient } from "jsr:@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Meta Conversions API configuration
const META_PIXEL_ID = '1182495496498498'
const META_API_VERSION = 'v23.0'

// Supported events
type MetaEventType = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Lead' | 'CompleteRegistration' | 'Purchase'

interface MetaEventRequest {
  event: MetaEventType
  email?: string
  phone?: string
  lead_id?: string
  content_name?: string
  content_id?: string
  content_ids?: string[]
  value?: number
  currency?: string
  event_id?: string  // For deduplication with browser pixel
  url?: string
  user_agent?: string
  ip?: string
  fbc?: string  // Facebook click ID cookie
  fbp?: string  // Facebook browser pixel cookie
}

// SHA256 hash (Meta requires lowercase hex)
async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Normalize phone to E.164 format (Meta requirement)
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)\.]/g, '')
  // Add Poland country code if not present
  if (normalized.startsWith('0')) {
    normalized = '48' + normalized.substring(1)
  } else if (!normalized.startsWith('+') && !normalized.startsWith('48')) {
    normalized = '48' + normalized
  }
  return normalized.replace('+', '')
}

// Send event to Meta Conversions API
async function sendMetaEvent(data: MetaEventRequest, supabase?: any, reqHeaders?: Headers): Promise<{ success: boolean; error?: string }> {
  const accessToken = Deno.env.get('meta_conversions_token')
  if (!accessToken) {
    console.log('[meta] meta_conversions_token not configured, skipping')
    return { success: false, error: 'Token not configured' }
  }

  try {
    // Build user data with hashed PII
    const userData: Record<string, any> = {
      country: ['pl'], // Always Poland
    }

    // Get fbclid and fbp from lead_tracking if we have lead_id
    let fbc = data.fbc
    let fbp = data.fbp

    if (data.lead_id && supabase && (!fbc || !fbp)) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('fbclid, fbp')
        .eq('lead_id', data.lead_id)
        .single()

      if (tracking?.fbclid && !fbc) {
        // Format fbc: fb.1.{timestamp}.{fbclid}
        const timestamp = Date.now()
        fbc = `fb.1.${timestamp}.${tracking.fbclid}`
        console.log('[meta] Found fbclid from lead_tracking')
      }
      if (tracking?.fbp && !fbp) {
        fbp = tracking.fbp
        console.log('[meta] Found fbp from lead_tracking')
      }
    }

    // Hash email and phone
    if (data.email) {
      userData.em = [await sha256Hash(data.email)]
    }

    if (data.phone) {
      const normalizedPhone = normalizePhone(data.phone)
      userData.ph = [await sha256Hash(normalizedPhone)]
    }

    // Add external_id (lead_id) for cross-device matching
    if (data.lead_id) {
      userData.external_id = [await sha256Hash(data.lead_id)]
    }

    if (fbc) {
      userData.fbc = fbc
    }

    if (fbp) {
      userData.fbp = fbp
    }

    // Add IP address (from request headers or provided)
    if (data.ip) {
      userData.client_ip_address = data.ip
    } else if (reqHeaders) {
      const ip = reqHeaders.get('cf-connecting-ip')
        || reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
        || reqHeaders.get('x-real-ip')
      if (ip) {
        userData.client_ip_address = ip
      }
    }

    // Add user agent
    if (data.user_agent) {
      userData.client_user_agent = data.user_agent
    } else if (reqHeaders) {
      const ua = reqHeaders.get('user-agent')
      if (ua) {
        userData.client_user_agent = ua
      }
    }

    // Build custom_data based on event type
    const customData: Record<string, any> = {}

    if (data.value !== undefined) {
      customData.value = data.value
      customData.currency = data.currency || 'PLN'
    }

    if (data.content_name) {
      customData.content_name = data.content_name
      customData.content_type = 'product'
    }

    if (data.content_id) {
      customData.content_ids = [data.content_id]
    } else if (data.content_ids) {
      customData.content_ids = data.content_ids
    }

    // Build the event
    const eventTime = Math.floor(Date.now() / 1000)
    const eventId = data.event_id || `${data.event}-${eventTime}-${Math.random().toString(36).substr(2, 9)}`

    const eventPayload: Record<string, any> = {
      event_name: data.event,
      event_time: eventTime,
      event_id: eventId,
      event_source_url: data.url || 'https://crm.tomekniedzwiecki.pl',
      action_source: 'website',
      user_data: userData,
    }

    if (Object.keys(customData).length > 0) {
      eventPayload.custom_data = customData
    }

    const requestBody: Record<string, any> = {
      data: [eventPayload]
    }

    // Test event code for Meta Events Manager testing
    const testEventCode = Deno.env.get('META_TEST_EVENT_CODE')
    if (testEventCode) {
      requestBody.test_event_code = testEventCode
      console.log('[meta] Using test_event_code:', testEventCode)
    }

    console.log('[meta] Sending event:', JSON.stringify({
      event: data.event,
      event_id: eventId,
      has_email: !!userData.em,
      has_phone: !!userData.ph,
      has_external_id: !!userData.external_id,
      has_fbc: !!fbc,
      has_fbp: !!fbp,
      has_ip: !!userData.client_ip_address,
      has_ua: !!userData.client_user_agent,
      value: customData.value
    }))

    const pixelId = Deno.env.get('META_PIXEL_ID') || META_PIXEL_ID
    const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('[meta] Event sent successfully:', result)
      return { success: true }
    } else {
      console.error('[meta] Failed to send event:', result)
      return { success: false, error: result.error?.message || JSON.stringify(result) }
    }
  } catch (err) {
    console.error('[meta] Error sending event:', err)
    return { success: false, error: err.message }
  }
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[meta-event] Request received')

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const data: MetaEventRequest = await req.json()
    console.log('[meta-event] Event data:', JSON.stringify({
      event: data.event,
      has_email: !!data.email,
      has_fbc: !!data.fbc,
      has_fbp: !!data.fbp,
      lead_id: data.lead_id
    }))

    if (!data.event) {
      throw new Error('Event type is required')
    }

    // Validate event type
    const validEvents: MetaEventType[] = ['ViewContent', 'AddToCart', 'InitiateCheckout', 'Lead', 'CompleteRegistration', 'Purchase']
    if (!validEvents.includes(data.event)) {
      throw new Error(`Invalid event type. Must be one of: ${validEvents.join(', ')}`)
    }

    const result = await sendMetaEvent(data, supabase, req.headers)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      }
    )

  } catch (error) {
    console.error('[meta-event] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// Export for use in other functions
export { sendMetaEvent, sha256Hash, normalizePhone }
export type { MetaEventRequest }
