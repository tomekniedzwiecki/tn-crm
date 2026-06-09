import { createClient } from 'jsr:@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://merchant.revolut.com',
  'Access-Control-Allow-Headers': 'content-type, revolut-signature, revolut-request-timestamp',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com'
const REVOLUT_SANDBOX_URL = 'https://sandbox-merchant.revolut.com'
const REVOLUT_API_VERSION = '2024-09-01'

// ═══════════════════════════════════════════════════════════════
// Slack notification (analog tpay-webhook)
// ═══════════════════════════════════════════════════════════════
async function sendSlackPaidNotification(order: any, supabase?: any) {
  const webhookUrl = Deno.env.get('SLACK_PAID_WEBHOOK')
  if (!webhookUrl) return

  try {
    let emailLink = order.customer_email
    if (supabase && order.customer_email) {
      const { data: leadMatch } = await supabase.from('leads').select('id').eq('email', order.customer_email).maybeSingle()
      if (leadMatch) {
        emailLink = `<https://crm.tomekniedzwiecki.pl/lead?id=${leadMatch.id}|${order.customer_email}>`
      }
    }

    const message = {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '💰 Nowa płatność (Revolut)!', emoji: true }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Zamówienie:*\n${order.order_number}` },
            { type: 'mrkdwn', text: `*Kwota:*\n*${parseFloat(order.amount).toFixed(2)} PLN*` }
          ]
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Email:*\n${emailLink}` },
            { type: 'mrkdwn', text: `*Telefon:*\n${order.customer_phone || '-'}` }
          ]
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Produkt:*\n${order.description}` },
            { type: 'mrkdwn', text: `*Źródło:*\nrevolut` }
          ]
        }
      ]
    }

    if (order.discount_amount && order.discount_amount > 0) {
      message.blocks.push({
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `🎟️ Rabat: -${parseFloat(order.discount_amount).toFixed(2)} PLN (cena oryginalna: ${parseFloat(order.original_amount).toFixed(2)} PLN)` }
        ]
      } as any)
    }

    if (order.customer_name || order.customer_company) {
      message.blocks.push({
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `👤 ${order.customer_name || ''} ${order.customer_company ? `(${order.customer_company})` : ''}` }
        ]
      } as any)
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
  } catch (err) {
    console.error('[slack] Failed to send paid notification:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
// Meta Conversions API (copy z tpay-webhook)
// ═══════════════════════════════════════════════════════════════
const META_PIXEL_ID = '1668188210820080'
const META_API_VERSION = 'v25.0'

async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)]/g, '')
  if (normalized.startsWith('0')) {
    normalized = '48' + normalized.substring(1)
  } else if (!normalized.startsWith('+') && !normalized.startsWith('48')) {
    normalized = '48' + normalized
  }
  return normalized.replace('+', '')
}

async function sendMetaConversion(order: any, supabase: any) {
  const accessToken = Deno.env.get('meta_conversions_token')
  if (!accessToken) return

  try {
    let fbc: string | null = null
    let fbp: string | null = null
    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('fbclid, fbp')
        .eq('lead_id', order.lead_id)
        .single()

      if (tracking?.fbclid) {
        fbc = `fb.1.${Date.now()}.${tracking.fbclid}`
      }
      if (tracking?.fbp) {
        fbp = tracking.fbp
      }
    }

    const userData: Record<string, any> = {
      country: [await sha256Hash('pl')],
    }

    if (order.customer_email) userData.em = [await sha256Hash(order.customer_email)]
    if (order.customer_phone) userData.ph = [await sha256Hash(normalizePhone(order.customer_phone))]
    if (order.lead_id) userData.external_id = [await sha256Hash(order.lead_id)]
    if (fbc) userData.fbc = fbc
    if (fbp) userData.fbp = fbp

    const testEventCode = Deno.env.get('META_TEST_EVENT_CODE')
    const eventData: Record<string, any> = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
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

    if (testEventCode) eventData.test_event_code = testEventCode

    const pixelId = Deno.env.get('META_PIXEL_ID') || META_PIXEL_ID
    const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(eventData)
    })

    const result = await response.json()
    if (response.ok) {
      console.log('[meta] Purchase event sent successfully')
    } else {
      console.error('[meta] Failed to send event:', result)
    }
  } catch (err) {
    console.error('[meta] Error sending conversion:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
// TikTok Events API (copy z tpay-webhook)
// ═══════════════════════════════════════════════════════════════
const TIKTOK_PIXEL_ID = 'D6AP4E3C77U3L7SP8O7G'
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

async function sendTikTokConversion(order: any, supabase: any) {
  const accessToken = Deno.env.get('tiktok_API_ads')
  if (!accessToken) return

  try {
    const userData: Record<string, any> = {}

    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('ttclid, user_agent, ip')
        .eq('lead_id', order.lead_id)
        .single()

      if (tracking?.ttclid) userData.ttclid = tracking.ttclid
      if (tracking?.user_agent) userData.user_agent = tracking.user_agent
      if (tracking?.ip) userData.ip = tracking.ip
    }

    if (order.customer_email) userData.email = await sha256Hash(order.customer_email)
    if (order.customer_phone) userData.phone = await sha256Hash(normalizePhone(order.customer_phone))
    if (order.lead_id) userData.external_id = await sha256Hash(order.lead_id)

    const pixelId = Deno.env.get('TIKTOK_PIXEL_ID') || TIKTOK_PIXEL_ID
    const payload = {
      event_source: 'web',
      event_source_id: pixelId,
      data: [
        {
          event: 'CompletePayment',
          event_time: Math.floor(Date.now() / 1000),
          event_id: order.id,
          user: userData,
          properties: {
            value: parseFloat(order.amount) / 1.23,
            currency: 'PLN',
            content_id: order.order_number,
            content_name: order.description,
            content_type: 'product',
            order_id: order.order_number,
          },
          page: { url: 'https://crm.tomekniedzwiecki.pl/checkout' }
        }
      ],
      ...(Deno.env.get('TIKTOK_TEST_EVENT_CODE') && {
        test_event_code: Deno.env.get('TIKTOK_TEST_EVENT_CODE')
      })
    }

    const response = await fetch(TIKTOK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Access-Token': accessToken },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    if (response.ok && result.code === 0) {
      console.log('[tiktok] CompletePayment sent successfully')
    } else {
      console.error('[tiktok] Failed:', result)
    }
  } catch (err) {
    console.error('[tiktok] Error:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
// Google Ads Enhanced Conversions (copy z tpay-webhook)
// ═══════════════════════════════════════════════════════════════
const GOOGLE_ADS_API_VERSION = 'v18'

async function getGoogleAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get('GOOGLE_ADS_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')
  const refreshToken = Deno.env.get('GOOGLE_ADS_REFRESH_TOKEN')

  if (!clientId || !clientSecret || !refreshToken) return null

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })

    const data = await response.json()
    return data.access_token || null
  } catch (err) {
    console.error('[google] Token error:', err)
    return null
  }
}

async function sendGoogleConversion(order: any, supabase: any) {
  const customerId = Deno.env.get('GOOGLE_ADS_CUSTOMER_ID')?.replace(/-/g, '')
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')
  const conversionActionId = Deno.env.get('GOOGLE_ADS_CONVERSION_ACTION_ID')

  if (!customerId || !developerToken || !conversionActionId) return

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) return

  try {
    let gclid: string | null = null
    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('gclid')
        .eq('lead_id', order.lead_id)
        .single()
      if (tracking?.gclid) gclid = tracking.gclid
    }

    const userIdentifiers: any[] = []
    if (order.customer_email) {
      userIdentifiers.push({ hashedEmail: await sha256Hash(order.customer_email) })
    }
    if (order.customer_phone) {
      userIdentifiers.push({ hashedPhoneNumber: await sha256Hash('+' + normalizePhone(order.customer_phone)) })
    }
    if (order.customer_name) {
      const nameParts = order.customer_name.trim().split(/\s+/)
      const addressInfo: any = { countryCode: 'PL' }
      if (nameParts.length >= 1) addressInfo.hashedFirstName = await sha256Hash(nameParts[0])
      if (nameParts.length >= 2) addressInfo.hashedLastName = await sha256Hash(nameParts.slice(1).join(' '))
      userIdentifiers.push({ addressInfo })
    }

    // uploadClickConversions wymaga gclid ALBO userIdentifiers — sam orderId nie wystarczy.
    if (!gclid && userIdentifiers.length === 0) {
      console.log('[google] Brak gclid i danych uzytkownika — pomijam (nie ma jak atrybuowac)')
      return
    }

    // Czas konwersji w UTC (+00:00) — unikamy bledow DST (PL: +01:00 zima / +02:00 lato)
    const conversionDateTime = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '') + '+00:00'

    // uploadClickConversions TWORZY konwersje z wartoscia (odpowiednik Meta CAPI Purchase)
    const clickConversion: any = {
      conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
      conversionDateTime,
      conversionValue: parseFloat(order.amount) / 1.23, // netto (bez VAT 23%)
      currencyCode: 'PLN',
      orderId: order.order_number, // dedup po stronie Google
      userIdentifiers: userIdentifiers.length > 0 ? userIdentifiers : undefined
    }

    if (gclid) {
      clickConversion.gclid = gclid
    }

    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}:uploadClickConversions`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'login-customer-id': customerId
      },
      body: JSON.stringify({
        conversions: [clickConversion],
        partialFailure: true
      })
    })

    const result = await response.json()
    if (response.ok && !result.partialFailureError) {
      console.log('[google] Conversion sent successfully')
    } else {
      console.error('[google] Failed:', result)
    }
  } catch (err) {
    console.error('[google] Error:', err)
  }
}

// GA4 purchase server-side (Measurement Protocol) — backup gdy browser purchase nie zdazy.
// GA4 dedupuje purchase po transaction_id (=order_number), brak podwojnego liczenia z browserem.
async function sendGA4Purchase(order: any) {
  const apiSecret = Deno.env.get('GA4_API_SECRET')
  const measurementId = Deno.env.get('GA4_MEASUREMENT_ID') || 'G-W8CLDSHVFC'
  if (!apiSecret) {
    console.log('[ga4] GA4_API_SECRET not configured, skipping')
    return
  }
  try {
    const value = parseFloat(order.amount) / 1.23
    const clientId = `${order.lead_id || order.id}.0`
    const payload = {
      client_id: clientId,
      events: [{
        name: 'purchase',
        params: {
          transaction_id: order.order_number,
          value: value,
          currency: 'PLN',
          engagement_time_msec: 100, // wymagane by GA4 zarejestrowal/pokazal event MP
          session_id: String(Date.now()),
          items: [{ item_id: order.id, item_name: order.description, item_category: 'oferta_awe', price: value, quantity: 1 }]
        }
      }]
    }
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
    const resp = await fetch(url, { method: 'POST', body: JSON.stringify(payload) })
    console.log('[ga4] MP purchase sent:', JSON.stringify({ order_id: order.order_number, value, status: resp.status }))
  } catch (err) {
    console.error('[ga4] MP purchase error:', err)
  }
}

// ═══════════════════════════════════════════════════════════════
// Revolut HMAC-SHA256 signature verification
// ═══════════════════════════════════════════════════════════════
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const encoder = new TextEncoder()
  const bufA = encoder.encode(a)
  const bufB = encoder.encode(b)
  let result = 0
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i]
  }
  return result === 0
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  const bytes = new Uint8Array(signature)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Revolut signature format: "v1=HEX_HMAC,v1=HEX_HMAC,..." (rolling secrets supported)
async function verifyRevolutSignature(
  webhookSecret: string,
  timestamp: string,
  body: string,
  receivedHeader: string
): Promise<boolean> {
  const payload = `v1.${timestamp}.${body}`
  const expected = 'v1=' + await hmacSha256Hex(webhookSecret, payload)

  // Header may contain multiple comma-separated signatures (rolling secret support)
  const signatures = receivedHeader.split(',').map(s => s.trim())
  for (const sig of signatures) {
    if (timingSafeEqual(sig, expected)) return true
  }
  return false
}

// ═══════════════════════════════════════════════════════════════
// Fetch order details from Revolut API (webhook payload is minimal)
// ═══════════════════════════════════════════════════════════════
async function fetchRevolutOrder(orderId: string, secretKey: string, useSandbox: boolean): Promise<any> {
  const baseUrl = useSandbox ? REVOLUT_SANDBOX_URL : REVOLUT_API_URL
  const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Revolut-Api-Version': REVOLUT_API_VERSION,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Revolut GET order failed (${response.status}): ${errorText}`)
  }

  return await response.json()
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[revolut-webhook] Notification received')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const revolutSecretKey = Deno.env.get('revolut_secret_key')
    const revolutWebhookSecret = Deno.env.get('revolut_webhook_secret')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Brak konfiguracji Supabase')
    }
    if (!revolutSecretKey) {
      throw new Error('Brak revolut_secret_key')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Read raw body for HMAC verification
    const rawBody = await req.text()
    const signature = req.headers.get('revolut-signature') || ''
    const timestamp = req.headers.get('revolut-request-timestamp') || ''

    // Verify signature
    if (revolutWebhookSecret && signature && timestamp) {
      const isValid = await verifyRevolutSignature(revolutWebhookSecret, timestamp, rawBody, signature)
      if (!isValid) {
        console.error('[revolut-webhook] Invalid signature - rejecting!')
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        })
      }

      // Also check timestamp freshness (reject if > 5 min old to prevent replay)
      const tsMs = parseInt(timestamp, 10)
      if (!isNaN(tsMs) && Math.abs(Date.now() - tsMs) > 5 * 60 * 1000) {
        console.error('[revolut-webhook] Timestamp too old - rejecting!')
        return new Response(JSON.stringify({ error: 'Timestamp too old' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        })
      }

      console.log('[revolut-webhook] Signature verified')
    } else {
      console.warn('[revolut-webhook] Signature verification skipped (secret/headers missing)')
    }

    let notification: Record<string, any>
    try {
      notification = JSON.parse(rawBody)
    } catch {
      throw new Error('Invalid JSON body')
    }

    const event = notification.event as string
    const revolutOrderId = notification.order_id as string
    const merchantOrderExtRef = notification.merchant_order_ext_ref as string

    console.log('[revolut-webhook] Event:', event, 'Order:', revolutOrderId, 'Ref:', merchantOrderExtRef)

    if (!revolutOrderId) {
      console.error('[revolut-webhook] Missing order_id')
      return new Response(JSON.stringify({ error: 'Missing order_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Find local order — first by payment_reference, then by ID from merchant_order_ext_ref
    let order = null
    const { data: orderByRef } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_reference', revolutOrderId)
      .maybeSingle()

    if (orderByRef) {
      order = orderByRef
    } else if (merchantOrderExtRef) {
      const { data: orderByExt } = await supabase
        .from('orders')
        .select('*')
        .eq('id', merchantOrderExtRef)
        .maybeSingle()
      if (orderByExt) order = orderByExt
    }

    if (!order) {
      console.error('[revolut-webhook] Order not found:', revolutOrderId, merchantOrderExtRef)
      // Return 200 to avoid retries on orphan orders
      return new Response(JSON.stringify({ ok: true, note: 'order_not_found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    console.log('[revolut-webhook] Found order:', order.order_number, 'current status:', order.status)

    // Determine new status based on event type + verify with API call
    let newStatus = order.status
    let paidAt = order.paid_at

    if (event === 'ORDER_COMPLETED' || event === 'ORDER_AUTHORISED') {
      // Verify state by GET (defense in depth — webhook payload alone is not enough)
      const useSandbox = revolutSecretKey.startsWith('sk_sandbox_')
      let revolutState = 'unknown'
      try {
        const revolutOrder = await fetchRevolutOrder(revolutOrderId, revolutSecretKey, useSandbox)
        revolutState = revolutOrder.state
        console.log('[revolut-webhook] Verified state via API:', revolutState)
      } catch (verifyErr) {
        console.error('[revolut-webhook] API verification failed:', verifyErr)
      }

      if (revolutState === 'completed' || revolutState === 'authorised') {
        newStatus = 'paid'
        paidAt = new Date().toISOString()
        console.log('[revolut-webhook] Payment successful!')

        if (order.status !== 'paid') {
          // Podlinkuj leada po mailu jesli brak (checkout ustawia lead_id tylko gdy ?lead_id w URL).
          // Bez tego konwersje nie znajda gclid/fbclid w lead_tracking, a zakup pada jako "direct".
          if (!order.lead_id && order.customer_email) {
            try {
              const { data: leadMatch } = await supabase
                .from('leads')
                .select('id')
                .eq('email', order.customer_email.toLowerCase().trim())
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle()
              if (leadMatch?.id) {
                order.lead_id = leadMatch.id
                await supabase.from('orders').update({ lead_id: leadMatch.id }).eq('id', order.id)
                console.log('[revolut-webhook] Linked order to lead by email:', leadMatch.id)
              }
            } catch (linkErr) {
              console.error('[revolut-webhook] Lead link error:', linkErr)
            }
          }

          await sendSlackPaidNotification({ ...order, payment_source: 'revolut' }, supabase)
          await sendMetaConversion(order, supabase)
          await sendTikTokConversion(order, supabase)
          await sendGoogleConversion(order, supabase)
          await sendGA4Purchase(order)

          if (order.discount_code_id) {
            try {
              await supabase.rpc('use_discount_code', { p_code_id: order.discount_code_id })
            } catch (err) {
              console.error('[revolut-webhook] Discount usage increment failed:', err)
            }
          }
        }
      }
    } else if (event === 'ORDER_CANCELLED') {
      newStatus = 'cancelled'
    }

    // Update order
    if (newStatus !== order.status || !order.paid_at && paidAt) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          paid_at: paidAt,
          payment_reference: revolutOrderId,
          payment_source: 'revolut',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (updateError) {
        console.error('[revolut-webhook] Update failed:', updateError)
      } else {
        console.log('[revolut-webhook] Order updated')
      }

      // Installment handling
      if (newStatus === 'paid' && order.installment_id) {
        try {
          await supabase
            .from('payment_installments')
            .update({ status: 'paid', paid_at: paidAt, order_id: order.id })
            .eq('id', order.installment_id)
        } catch (err) {
          console.error('[revolut-webhook] Installment update error:', err)
        }
      }

      // Audit log
      try {
        await supabase.from('audit_log').insert({
          entity_type: 'order',
          entity_id: order.id,
          action: 'payment_update',
          changes: {
            old_status: order.status,
            new_status: newStatus,
            revolut_order_id: revolutOrderId,
            revolut_event: event,
          },
          performed_by: null,
        })
      } catch (err) {
        console.error('[revolut-webhook] Audit log error:', err)
      }
    }

    console.log('[revolut-webhook] SUCCESS')
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('[revolut-webhook] ERROR:', error.message, error)
    // Return 200 to avoid Revolut infinite retries on our bugs (we have logs to debug)
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }
})
