import { createClient } from "jsr:@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// TikTok Events API configuration
const TIKTOK_PIXEL_ID = 'D6AP4E3C77U3L7SP8O7G'
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

// Supported events
type TikTokEventType = 'SubmitForm' | 'CompleteRegistration' | 'CompletePayment' | 'ViewContent' | 'AddToCart'

interface TikTokEventRequest {
  event: TikTokEventType
  email?: string
  phone?: string
  ttclid?: string
  value?: number
  currency?: string
  content_name?: string
  content_id?: string
  order_id?: string
  lead_id?: string
  event_id?: string  // For deduplication with browser pixel
  url?: string
  user_agent?: string
  ip?: string  // Will be extracted from request headers if not provided
}

// SHA256 hash (TikTok requires lowercase hex)
async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Normalize phone to E.164 format (TikTok requirement)
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

// Send event to TikTok Events API
async function sendTikTokEvent(data: TikTokEventRequest, supabase?: any, reqHeaders?: Headers): Promise<{ success: boolean; error?: string }> {
  const accessToken = Deno.env.get('tiktok_API_ads')
  if (!accessToken) {
    console.log('[tiktok] tiktok_API_ads not configured, skipping')
    return { success: false, error: 'Token not configured' }
  }

  try {
    // Build user data
    const userData: Record<string, any> = {}

    // Add ttclid if available (most important for attribution)
    if (data.ttclid) {
      userData.ttclid = data.ttclid
    } else if (data.lead_id && supabase) {
      // Try to get ttclid from lead_tracking
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('ttclid')
        .eq('lead_id', data.lead_id)
        .single()

      if (tracking?.ttclid) {
        userData.ttclid = tracking.ttclid
        console.log('[tiktok] Found ttclid from lead_tracking')
      }
    }

    // Hash email and phone (TikTok accepts hashed or unhashed, but hashed is preferred)
    if (data.email) {
      userData.email = await sha256Hash(data.email)
    }

    if (data.phone) {
      const normalizedPhone = normalizePhone(data.phone)
      userData.phone = await sha256Hash(normalizedPhone)
    }

    // Add external_id (lead_id) for better matching - TikTok recommends this
    if (data.lead_id) {
      userData.external_id = await sha256Hash(data.lead_id)
    }

    // Add IP address (from request headers or provided)
    if (data.ip) {
      userData.ip = data.ip
    } else if (reqHeaders) {
      // Try to get IP from various headers (Cloudflare, standard proxy, etc.)
      const ip = reqHeaders.get('cf-connecting-ip')
        || reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
        || reqHeaders.get('x-real-ip')
      if (ip) {
        userData.ip = ip
      }
    }

    // Add user agent (from request body or headers)
    if (data.user_agent) {
      userData.user_agent = data.user_agent
    } else if (reqHeaders) {
      const ua = reqHeaders.get('user-agent')
      if (ua) {
        userData.user_agent = ua
      }
    }

    // Build properties based on event type
    const properties: Record<string, any> = {}

    if (data.value !== undefined) {
      properties.value = data.value
      properties.currency = data.currency || 'PLN'
    }

    if (data.content_name) {
      properties.content_name = data.content_name
      properties.content_type = 'product'
    }

    if (data.content_id) {
      properties.content_id = data.content_id
    }

    if (data.order_id) {
      properties.order_id = data.order_id
    }

    // Build the event payload
    const eventTime = Math.floor(Date.now() / 1000)
    const eventId = data.event_id || `${data.event}-${eventTime}-${Math.random().toString(36).substr(2, 9)}`

    const payload = {
      event_source: 'web',
      event_source_id: Deno.env.get('TIKTOK_PIXEL_ID') || TIKTOK_PIXEL_ID,
      data: [
        {
          event: data.event,
          event_time: eventTime,
          event_id: eventId,
          user: userData,
          properties: Object.keys(properties).length > 0 ? properties : undefined,
          page: data.url ? { url: data.url } : undefined,
        }
      ],
      // Test event code for debugging (remove in production or set via env)
      ...(Deno.env.get('TIKTOK_TEST_EVENT_CODE') && {
        test_event_code: Deno.env.get('TIKTOK_TEST_EVENT_CODE')
      })
    }

    console.log('[tiktok] Sending event:', JSON.stringify({
      event: data.event,
      event_id: eventId,
      has_ttclid: !!userData.ttclid,
      has_email: !!userData.email,
      has_phone: !!userData.phone,
      has_external_id: !!userData.external_id,
      has_ip: !!userData.ip,
      has_user_agent: !!userData.user_agent,
      value: properties.value
    }))

    const response = await fetch(TIKTOK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (response.ok && result.code === 0) {
      console.log('[tiktok] Event sent successfully:', result.message)
      return { success: true }
    } else {
      console.error('[tiktok] Failed to send event:', result)
      return { success: false, error: result.message || 'Unknown error' }
    }
  } catch (err) {
    console.error('[tiktok] Error sending event:', err)
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
    console.log('[tiktok-event] Request received')

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const data: TikTokEventRequest = await req.json()
    console.log('[tiktok-event] Event data:', JSON.stringify({
      event: data.event,
      has_email: !!data.email,
      has_ttclid: !!data.ttclid,
      lead_id: data.lead_id
    }))

    if (!data.event) {
      throw new Error('Event type is required')
    }

    // Validate event type
    const validEvents: TikTokEventType[] = ['SubmitForm', 'CompleteRegistration', 'CompletePayment', 'ViewContent', 'AddToCart']
    if (!validEvents.includes(data.event)) {
      throw new Error(`Invalid event type. Must be one of: ${validEvents.join(', ')}`)
    }

    // Extract IP from headers for storing
    const clientIp = req.headers.get('cf-connecting-ip')
      || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')

    // Store IP in lead_tracking if we have lead_id and IP (for future events like CompletePayment)
    if (data.lead_id && clientIp) {
      try {
        await supabase
          .from('lead_tracking')
          .update({ ip: clientIp })
          .eq('lead_id', data.lead_id)
        console.log('[tiktok-event] Stored IP in lead_tracking')
      } catch (e) {
        console.warn('[tiktok-event] Could not update IP:', e)
      }
    }

    const result = await sendTikTokEvent(data, supabase, req.headers)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      }
    )

  } catch (error) {
    console.error('[tiktok-event] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// Export for use in other functions (like tpay-webhook)
export { sendTikTokEvent, sha256Hash, normalizePhone }
export type { TikTokEventRequest }
