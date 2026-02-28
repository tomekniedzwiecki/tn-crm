import { createClient } from 'jsr:@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Meta Conversions API configuration
const META_PIXEL_ID = '1668188210820080'
const META_API_VERSION = 'v25.0'

// SHA256 hash for Meta
async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Normalize phone
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)]/g, '')
  if (normalized.startsWith('0')) {
    normalized = '48' + normalized.substring(1)
  } else if (!normalized.startsWith('+') && !normalized.startsWith('48')) {
    normalized = '48' + normalized
  }
  return normalized.replace('+', '')
}

// Send Purchase event to Meta
async function sendMetaConversion(order: any, supabase: any, accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get fbclid and fbp from lead_tracking
    let fbc: string | null = null
    let fbp: string | null = null

    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('fbclid, fbp')
        .eq('lead_id', order.lead_id)
        .single()

      if (tracking?.fbclid) {
        // Use original payment time for fbc
        const timestamp = new Date(order.paid_at).getTime()
        fbc = `fb.1.${timestamp}.${tracking.fbclid}`
      }
      if (tracking?.fbp) {
        fbp = tracking.fbp
      }
    }

    // Build user data (all PII must be hashed in v25.0)
    const userData: Record<string, any> = {
      country: [await sha256Hash('pl')],
    }

    if (order.customer_email) {
      userData.em = [await sha256Hash(order.customer_email)]
    }

    if (order.customer_phone) {
      const normalizedPhone = normalizePhone(order.customer_phone)
      userData.ph = [await sha256Hash(normalizedPhone)]
    }

    if (order.lead_id) {
      userData.external_id = [await sha256Hash(order.lead_id)]
    }

    if (fbc) userData.fbc = fbc
    if (fbp) userData.fbp = fbp

    // Use original payment time
    const eventTime = Math.floor(new Date(order.paid_at).getTime() / 1000)

    const eventData = {
      data: [
        {
          event_name: 'Purchase',
          event_time: eventTime,
          event_id: order.id,
          event_source_url: 'https://crm.tomekniedzwiecki.pl/checkout',
          action_source: 'website',
          user_data: userData,
          custom_data: {
            currency: 'PLN',
            value: parseFloat(order.amount) / 1.23,
            content_name: order.description,
            content_type: 'product',
            content_ids: [order.order_number],
            order_id: order.order_number,
          }
        }
      ]
    }

    const pixelId = Deno.env.get('META_PIXEL_ID') || META_PIXEL_ID
    // Meta prefers access_token as query param
    const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    })

    const result = await response.json()

    if (response.ok && !result.error) {
      return { success: true }
    } else {
      // Return full error details
      const errorMsg = result.error?.message
        || result.error?.error_user_msg
        || result.error?.error_subcode
        || JSON.stringify(result)
      return { success: false, error: `${result.error?.code || 'ERR'}: ${errorMsg}` }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const accessToken = Deno.env.get('meta_conversions_token')
    if (!accessToken) {
      throw new Error('meta_conversions_token not configured')
    }

    // Get parameters from request
    const params = await req.json().catch(() => ({}))
    const daysBack = params.days || 7

    // Test mode - send a test event
    if (params.test) {
      const pixelId = Deno.env.get('META_PIXEL_ID') || META_PIXEL_ID
      const testUrl = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`

      const testEvent = {
        data: [{
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          event_id: 'test-' + Date.now(),
          event_source_url: 'https://crm.tomekniedzwiecki.pl/test',
          action_source: 'website',
          user_data: {
            em: [await sha256Hash('test@test.com')],
            country: [await sha256Hash('pl')]
          }
        }],
        test_event_code: 'TEST12345'  // This makes it a test event
      }

      const testResp = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEvent)
      })
      const testResult = await testResp.json()
      return new Response(
        JSON.stringify({ test: true, pixel_id: pixelId, api_version: META_API_VERSION, response: testResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get paid orders from last X days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'paid')
      .gte('paid_at', cutoffDate.toISOString())
      .order('paid_at', { ascending: true })

    if (error) throw error

    console.log(`[resend-conversions] Found ${orders?.length || 0} paid orders from last ${daysBack} days`)

    const results = {
      total: orders?.length || 0,
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each order
    for (const order of orders || []) {
      console.log(`[resend-conversions] Processing order ${order.order_number}`)

      const result = await sendMetaConversion(order, supabase, accessToken)

      if (result.success) {
        results.success++
        console.log(`[resend-conversions] OK: ${order.order_number}`)
      } else {
        results.failed++
        results.errors.push(`${order.order_number}: ${result.error}`)
        console.error(`[resend-conversions] FAILED: ${order.order_number} - ${result.error}`)
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200))
    }

    console.log(`[resend-conversions] Done: ${results.success}/${results.total} success`)

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[resend-conversions] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
