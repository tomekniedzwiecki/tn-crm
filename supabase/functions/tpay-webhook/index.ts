 
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { bumpLeadStage } from '../_shared/lead-stage.ts'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// Tpay webhook doesn't need CORS - it's server-to-server
// But we keep minimal headers for compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://api.tpay.com',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Tpay notification statuses
// https://docs.tpay.com/#!/Transaction_API/post_transactions
const TPAY_STATUS = {
  TRUE: 'TRUE',       // Payment successful
  FALSE: 'FALSE',     // Payment failed
  CHARGEBACK: 'CHARGEBACK', // Refund/chargeback
}

// Slack webhook for successful payments (from environment variable)

// Send Slack notification for successful payment
async function sendSlackPaidNotification(order: any, supabase?: any) {
  const webhookUrl = Deno.env.get('SLACK_PAID_WEBHOOK')
  if (!webhookUrl) {
    console.log('[slack] SLACK_PAID_WEBHOOK not configured, skipping notification')
    return
  }

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
          text: {
            type: 'plain_text',
            text: '💰 Nowa płatność!',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Zamówienie:*\n${order.order_number}`
            },
            {
              type: 'mrkdwn',
              text: `*Kwota:*\n*${parseFloat(order.amount).toFixed(2)} PLN*`
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Email:*\n${emailLink}`
            },
            {
              type: 'mrkdwn',
              text: `*Telefon:*\n${order.customer_phone || '-'}`
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Produkt:*\n${order.description}`
            },
            {
              type: 'mrkdwn',
              text: `*Źródło:*\n${order.payment_source || 'tpay'}`
            }
          ]
        }
      ]
    }

    // Add discount info if present
    if (order.discount_amount && order.discount_amount > 0) {
      message.blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `🎟️ Rabat: -${parseFloat(order.discount_amount).toFixed(2)} PLN (cena oryginalna: ${parseFloat(order.original_amount).toFixed(2)} PLN)`
          }
        ]
      } as any)
    }

    // Add customer name/company if present
    if (order.customer_name || order.customer_company) {
      message.blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `👤 ${order.customer_name || ''} ${order.customer_company ? `(${order.customer_company})` : ''}`
          }
        ]
      } as any)
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })

    console.log('[slack] Paid notification sent')
  } catch (err) {
    console.error('[slack] Failed to send paid notification:', err)
  }
}

// Meta Conversions API configuration
const META_PIXEL_ID = '1668188210820080'
const META_API_VERSION = 'v25.0'

// SHA256 hash for Meta (they require lowercase hex)
async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Normalize phone for Meta (remove spaces, dashes, ensure country code)
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)]/g, '')
  // Add Poland country code if not present
  if (normalized.startsWith('0')) {
    normalized = '48' + normalized.substring(1)
  } else if (!normalized.startsWith('+') && !normalized.startsWith('48')) {
    normalized = '48' + normalized
  }
  return normalized.replace('+', '')
}

// Send Purchase event to Meta Conversions API
async function sendMetaConversion(order: any, supabase: any) {
  const accessToken = Deno.env.get('meta_conversions_token')
  if (!accessToken) {
    console.log('[meta] meta_conversions_token not configured, skipping')
    return
  }

  try {
    // Get fbclid and fbp from lead_tracking if order has lead_id
    let fbc: string | null = null
    let fbp: string | null = null
    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('fbclid, fbp')
        .eq('lead_id', order.lead_id)
        .single()

      if (tracking?.fbclid) {
        // Format fbc: fb.1.{timestamp}.{fbclid}
        const timestamp = Date.now()
        fbc = `fb.1.${timestamp}.${tracking.fbclid}`
        console.log('[meta] Found fbclid, using fbc:', fbc.substring(0, 30) + '...')
      }
      if (tracking?.fbp) {
        fbp = tracking.fbp
        console.log('[meta] Found fbp cookie')
      }
    }

    // Build user data with hashed PII (v25.0 requires all PII hashed)
    const userData: Record<string, any> = {
      country: [await sha256Hash('pl')], // Always Poland, hashed
    }

    if (order.customer_email) {
      userData.em = [await sha256Hash(order.customer_email)]
    }

    if (order.customer_phone) {
      const normalizedPhone = normalizePhone(order.customer_phone)
      userData.ph = [await sha256Hash(normalizedPhone)]
    }

    // Add external_id (lead_id) for cross-device matching
    if (order.lead_id) {
      userData.external_id = [await sha256Hash(order.lead_id)]
    }

    if (fbc) {
      userData.fbc = fbc
    }

    if (fbp) {
      userData.fbp = fbp
    }

    // Build the event
    // Test event code for Meta Events Manager testing (remove in production or set via env)
    const testEventCode = Deno.env.get('META_TEST_EVENT_CODE') // Set to TEST92533 for testing

    const eventData: Record<string, any> = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: order.id, // Unique event ID for deduplication
          event_source_url: 'https://crm.tomekniedzwiecki.pl/checkout',
          action_source: 'website',
          user_data: userData,
          custom_data: {
            currency: 'PLN',
            value: parseFloat(order.amount) / 1.23, // netto (bez VAT 23%)
            content_name: order.description,
            content_type: 'product',
            content_ids: [order.order_number],
            order_id: order.order_number,
          }
        }
      ]
    }

    // Add test code if configured (for Meta Events Manager testing)
    if (testEventCode) {
      eventData.test_event_code = testEventCode
      console.log('[meta] Using test_event_code:', testEventCode)
    }

    console.log('[meta] Sending Purchase event:', JSON.stringify({
      event_id: order.id,
      value: order.amount,
      has_email: !!userData.em,
      has_phone: !!userData.ph,
      has_external_id: !!userData.external_id,
      has_fbc: !!fbc,
      has_fbp: !!fbp
    }))

    // Meta Pixel ID from environment (fallback to hardcoded for backwards compatibility)
    const pixelId = Deno.env.get('META_PIXEL_ID') || META_PIXEL_ID
    const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(eventData)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('[meta] Purchase event sent successfully:', result)
    } else {
      console.error('[meta] Failed to send event:', result)
    }
  } catch (err) {
    console.error('[meta] Error sending conversion:', err)
  }
}

// TikTok Events API configuration
const TIKTOK_PIXEL_ID = 'D6AP4E3C77U3L7SP8O7G'
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

// Send Purchase event to TikTok Events API
async function sendTikTokConversion(order: any, supabase: any) {
  const accessToken = Deno.env.get('tiktok_API_ads')
  if (!accessToken) {
    console.log('[tiktok] tiktok_API_ads not configured, skipping')
    return
  }

  try {
    // Build user data
    const userData: Record<string, any> = {}

    // Get ttclid, user_agent, ip from lead_tracking if order has lead_id
    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('ttclid, user_agent, ip')
        .eq('lead_id', order.lead_id)
        .single()

      if (tracking?.ttclid) {
        userData.ttclid = tracking.ttclid
        console.log('[tiktok] Found ttclid from lead_tracking')
      }
      if (tracking?.user_agent) {
        userData.user_agent = tracking.user_agent
      }
      if (tracking?.ip) {
        userData.ip = tracking.ip
      }
    }

    // Hash email and phone
    if (order.customer_email) {
      userData.email = await sha256Hash(order.customer_email)
    }

    if (order.customer_phone) {
      const normalizedPhone = normalizePhone(order.customer_phone)
      userData.phone = await sha256Hash(normalizedPhone)
    }

    // Add external_id (lead_id) for better matching
    if (order.lead_id) {
      userData.external_id = await sha256Hash(order.lead_id)
    }

    // Build the event payload
    const eventTime = Math.floor(Date.now() / 1000)
    const pixelId = Deno.env.get('TIKTOK_PIXEL_ID') || TIKTOK_PIXEL_ID

    const payload = {
      event_source: 'web',
      event_source_id: pixelId,
      data: [
        {
          event: 'CompletePayment',
          event_time: eventTime,
          event_id: order.id, // For deduplication
          user: userData,
          properties: {
            value: parseFloat(order.amount) / 1.23, // netto (bez VAT 23%)
            currency: 'PLN',
            content_id: order.order_number, // wymagane przez TikTok
            content_name: order.description,
            content_type: 'product',
            order_id: order.order_number,
          },
          page: {
            url: 'https://crm.tomekniedzwiecki.pl/checkout'
          }
        }
      ],
      // Test event code for debugging (set via env)
      ...(Deno.env.get('TIKTOK_TEST_EVENT_CODE') && {
        test_event_code: Deno.env.get('TIKTOK_TEST_EVENT_CODE')
      })
    }

    console.log('[tiktok] Sending CompletePayment event:', JSON.stringify({
      event_id: order.id,
      value: order.amount,
      has_ttclid: !!userData.ttclid,
      has_email: !!userData.email,
      has_phone: !!userData.phone,
      has_external_id: !!userData.external_id,
      has_user_agent: !!userData.user_agent,
      has_ip: !!userData.ip
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
      console.log('[tiktok] CompletePayment event sent successfully:', result.message)
    } else {
      console.error('[tiktok] Failed to send event:', result)
    }
  } catch (err) {
    console.error('[tiktok] Error sending conversion:', err)
  }
}

// Google Ads Enhanced Conversions configuration
const GOOGLE_ADS_API_VERSION = 'v18'

// Get OAuth access token from refresh token
async function getGoogleAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get('GOOGLE_ADS_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')
  const refreshToken = Deno.env.get('GOOGLE_ADS_REFRESH_TOKEN')

  if (!clientId || !clientSecret || !refreshToken) {
    return null
  }

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
    console.error('[google] Error getting access token:', err)
    return null
  }
}

// Send Purchase conversion to Google Ads via uploadClickConversions (tworzy konwersje z wartoscia)
async function sendGoogleConversion(order: any, supabase: any) {
  const customerId = Deno.env.get('GOOGLE_ADS_CUSTOMER_ID')?.replace(/-/g, '')
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')
  const conversionActionId = Deno.env.get('GOOGLE_ADS_CONVERSION_ACTION_ID')

  if (!customerId || !developerToken || !conversionActionId) {
    console.log('[google] Google Ads credentials not configured, skipping')
    return
  }

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) {
    console.log('[google] Could not get access token, skipping')
    return
  }

  try {
    // Get gclid from lead_tracking if order has lead_id
    let gclid: string | null = null
    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('gclid')
        .eq('lead_id', order.lead_id)
        .single()

      if (tracking?.gclid) {
        gclid = tracking.gclid
        console.log('[google] Found gclid from lead_tracking')
      }
    }

    // Build user identifiers
    const userIdentifiers: any[] = []

    if (order.customer_email) {
      userIdentifiers.push({
        hashedEmail: await sha256Hash(order.customer_email)
      })
    }

    if (order.customer_phone) {
      const normalizedPhone = normalizePhone(order.customer_phone)
      userIdentifiers.push({
        hashedPhoneNumber: await sha256Hash('+' + normalizedPhone)
      })
    }

    if (order.customer_name) {
      const nameParts = order.customer_name.trim().split(/\s+/)
      const addressInfo: any = { countryCode: 'PL' }
      if (nameParts.length >= 1) {
        addressInfo.hashedFirstName = await sha256Hash(nameParts[0])
      }
      if (nameParts.length >= 2) {
        addressInfo.hashedLastName = await sha256Hash(nameParts.slice(1).join(' '))
      }
      userIdentifiers.push({ addressInfo })
    }

    // uploadClickConversions wymaga gclid ALBO userIdentifiers — sam orderId nie wystarczy.
    // Bez zadnego z nich Google odrzuci konwersje, wiec pomijamy.
    if (!gclid && userIdentifiers.length === 0) {
      console.log('[google] Brak gclid i danych uzytkownika — pomijam (nie ma jak atrybuowac)')
      return
    }

    // Czas konwersji w UTC (+00:00) — unikamy bledow DST (PL: +01:00 zima / +02:00 lato)
    const conversionDateTime = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '') + '+00:00'

    // uploadClickConversions TWORZY konwersje z wartoscia (odpowiednik Meta CAPI Purchase),
    // w przeciwienstwie do uploadConversionAdjustments/ENHANCEMENT ktore tylko wzbogacalo istniejaca.
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

    console.log('[google] Sending conversion:', JSON.stringify({
      order_id: order.order_number,
      has_gclid: !!gclid,
      has_email: userIdentifiers.some(u => u.hashedEmail),
      has_phone: userIdentifiers.some(u => u.hashedPhoneNumber),
      value: parseFloat(order.amount) / 1.23
    }))

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
      console.error('[google] Failed to send conversion:', result)
    }
  } catch (err) {
    console.error('[google] Error sending conversion:', err)
  }
}

// GA4 purchase server-side (Measurement Protocol). Backup, gdy browser purchase (success.html)
// nie zdazy/zostanie zablokowany. GA4 deduplikuje purchase po transaction_id (=order_number),
// wiec nie ma podwojnego liczenia z eventem przegladarki.
async function sendGA4Purchase(order: any) {
  const apiSecret = Deno.env.get('GA4_API_SECRET')
  const measurementId = Deno.env.get('GA4_MEASUREMENT_ID') || 'G-W8CLDSHVFC'
  if (!apiSecret) {
    console.log('[ga4] GA4_API_SECRET not configured, skipping')
    return
  }
  try {
    const value = parseFloat(order.amount) / 1.23 // netto (spojnie z browserem i pozostalymi platformami)
    // client_id wymagany przez MP; deterministyczny z zamowienia. Dedup i tak po transaction_id.
    const clientId = `${order.lead_id || order.id}.0`
    const payload = {
      client_id: clientId,
      events: [{
        name: 'purchase',
        params: {
          transaction_id: order.order_number, // == browser -> GA4 dedup
          value: value,
          currency: 'PLN',
          engagement_time_msec: 100, // wymagane by GA4 zarejestrowal/pokazal event MP
          session_id: String(Date.now()),
          items: [{
            item_id: order.id,
            item_name: order.description,
            item_category: 'oferta_awe',
            price: value,
            quantity: 1
          }]
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

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  const encoder = new TextEncoder()
  const bufA = encoder.encode(a)
  const bufB = encoder.encode(b)
  let result = 0
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i]
  }
  return result === 0
}

// Verify Tpay notification signature using MD5 checksum
function verifyTpaySignature(
  merchantId: string,
  transactionId: string,
  amount: string,
  crc: string,
  securityCode: string,
  receivedMd5: string
): boolean {
  // Tpay MD5 checksum formula: md5(merchant_id + transaction_id + amount + crc + security_code)
  const stringToHash = `${merchantId}${transactionId}${amount}${crc}${securityCode}`
  const calculatedMd5 = createHmac('md5', '').update(stringToHash).digest('hex')

  const isMatch = timingSafeEqual(calculatedMd5.toLowerCase(), receivedMd5.toLowerCase())

  console.log('[tpay-webhook] Signature verification:', {
    match: isMatch,
  })

  return isMatch
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[tpay-webhook] Notification received')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const tpaySecurityCode = Deno.env.get('tpay_client_secret') // Used for verification
    const tpayMerchantId = Deno.env.get('tpay_merchant_id') || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Brak konfiguracji Supabase')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse form data or JSON from Tpay
    const contentType = req.headers.get('content-type') || ''
    let notification: Record<string, string> = {}

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      for (const [key, value] of formData.entries()) {
        notification[key] = value.toString()
      }
    } else if (contentType.includes('application/json')) {
      notification = await req.json()
    } else {
      // Try to parse as form data anyway
      const text = await req.text()
      const params = new URLSearchParams(text)
      for (const [key, value] of params.entries()) {
        notification[key] = value
      }
    }

    // Log only non-sensitive fields
    console.log('[tpay-webhook] Notification:', {
      tr_id: notification.tr_id || notification.transactionId,
      tr_status: notification.tr_status || notification.status,
      tr_amount: notification.tr_amount || notification.amount,
      tr_crc: notification.tr_crc || notification.hiddenDescription,
    })

    // Extract key fields from Tpay notification
    const trId = notification.tr_id || notification.transactionId || ''
    const trStatus = notification.tr_status || notification.status || ''
    const trAmount = notification.tr_amount || notification.amount || ''
    const trCrc = notification.tr_crc || notification.hiddenDescription || '' // This is our order ID
    const trMd5sum = notification.md5sum || ''

    if (!trId) {
      console.error('[tpay-webhook] Missing transaction ID - invalid request')
      return new Response('FALSE', { headers: corsHeaders, status: 400 })
    }

    console.log('[tpay-webhook] Transaction:', trId, 'Status:', trStatus, 'OrderId:', trCrc)

    // Verify signature (if security code is set)
    if (tpaySecurityCode && tpayMerchantId && trMd5sum) {
      const isValid = verifyTpaySignature(
        tpayMerchantId,
        trId,
        trAmount,
        trCrc,
        tpaySecurityCode,
        trMd5sum
      )

      if (!isValid) {
        console.error('[tpay-webhook] Invalid signature - rejecting request!')
        return new Response('FALSE', { headers: corsHeaders, status: 403 })
      }
      console.log('[tpay-webhook] Signature verified successfully')
    } else {
      console.log('[tpay-webhook] Signature verification skipped (not configured)')
    }

    // Find order by transaction ID or CRC (order ID)
    let order = null

    // First try by payment_reference (transaction ID)
    const { data: orderByRef } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_reference', trId)
      .single()

    if (orderByRef) {
      order = orderByRef
    } else if (trCrc) {
      // Try by order ID in CRC field
      const { data: orderByCrc } = await supabase
        .from('orders')
        .select('*')
        .eq('id', trCrc)
        .single()

      if (orderByCrc) {
        order = orderByCrc
      }
    }

    if (!order) {
      console.error('[tpay-webhook] Order not found for transaction:', trId)
      // Return TRUE to prevent Tpay from retrying
      return new Response('TRUE', { headers: corsHeaders, status: 200 })
    }

    console.log('[tpay-webhook] Found order:', order.order_number, 'Current status:', order.status)

    // Update order status based on Tpay notification
    let newStatus = order.status
    let paidAt = order.paid_at

    if (trStatus === TPAY_STATUS.TRUE || trStatus === 'correct' || trStatus === 'paid') {
      // Idempotencja: TPay PONAWIA notyfikacje TRUE. Efekty uboczne (Slack, konwersje
      // Meta/TikTok/GA4, licznik użyć kodu rabatowego) MUSZĄ polecieć tylko przy
      // PIERWSZYM zaksięgowaniu — inaczej retry zawyża uses_count rabatu i dubluje
      // powiadomienia. Wzorzec jak w revolut-webhook. Synchronizacje spar_session
      // zostają poza guardem (są idempotentne przez .is(paid_at/full_paid_at,null)).
      const alreadyPaid = order.status === 'paid' && !!order.paid_at
      newStatus = 'paid'
      if (!order.paid_at) paidAt = new Date().toISOString() // nie nadpisuj istniejącego paid_at przy retry
      console.log('[tpay-webhook] Payment successful!', alreadyPaid ? '(duplikat notyfikacji — pomijam efekty uboczne)' : '')

      // Podlinkuj leada po mailu jesli brak (checkout ustawia lead_id tylko gdy ?lead_id w URL).
      // Bez tego konwersje nie znajda gclid/fbclid w lead_tracking, a zakup pada jako "direct".
      if (!order.lead_id && order.customer_email) {
        try {
          const { data: leadMatch } = await supabase
            .from('leads')
            .select('id')
            // ilike: leads.email bywa zapisany z wielkimi literami (21 rekordów) —
            // .eq po samym lowercase zamówienia nie trafiał. NAJNOWSZY lead: to na nim
            // toczy się bieżący lejek (followupy), więc to jego ma chronić stop po płatności.
            .ilike('email', order.customer_email.trim())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (leadMatch?.id) {
            order.lead_id = leadMatch.id
            await supabase.from('orders').update({ lead_id: leadMatch.id }).eq('id', order.id)
            console.log('[tpay-webhook] Linked order to lead by email:', leadMatch.id)
          }
        } catch (linkErr) {
          console.error('[tpay-webhook] Lead link error:', linkErr)
        }
      }

      // ── REZERWACJA APLIKACJA: oznacz sesję sparingu jako opłaconą w CZASIE RZECZYWISTYM ──
      // Dotychczas robił to tylko cron spar-followups (paid_sync, co 30 min) → lead pojawiał
      // się w „Rezerwacja" z opóźnieniem do pół godziny. Tu dopasowujemy sesję od razu:
      // najpierw po lead_id (link per-lead z CRM go niesie), potem fallback po e-mailu
      // (sesje bez lead_id, np. wpłata przed zielonym werdyktem). Idempotentne (tylko gdy paid_at IS NULL).
      try {
        const desc = (order.description || '').toLowerCase()
        const isAplikacjaReservation = desc.includes('rezerwacj') && (desc.includes('aplikac') || desc.includes('stworz'))
        if (isAplikacjaReservation) {
          let sess: { id: string; lead_id: string | null } | null = null
          // 1) Twardy link order→sesja (sid z checkoutu) — pewny, bez zgadywania.
          if (order.spar_session_id) {
            const { data } = await supabase
              .from('spar_sessions')
              .select('id, lead_id')
              .eq('id', order.spar_session_id)
              .is('paid_at', null)
              .maybeSingle()
            sess = data || null
          }
          // 2) Fallback po lead_id, 3) po e-mailu (najnowsza nieopłacona).
          if (!sess && order.lead_id) {
            const { data } = await supabase
              .from('spar_sessions')
              .select('id, lead_id')
              .eq('lead_id', order.lead_id)
              .is('paid_at', null)
              .eq('is_test', false)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()
            sess = data || null
          }
          if (!sess && order.customer_email) {
            const { data } = await supabase
              .from('spar_sessions')
              .select('id, lead_id')
              .ilike('email', order.customer_email.trim())
              .is('paid_at', null)
              .eq('is_test', false)
              .order('last_user_at', { ascending: false, nullsFirst: false }) // najnowsza AKTYWNA, nie najstarsza
              .limit(1)
              .maybeSingle()
            sess = data || null
          }
          if (sess) {
            await supabase.from('spar_sessions').update({ paid_at: paidAt, updated_at: new Date().toISOString() }).eq('id', sess.id)
            console.log('[tpay-webhook] Reservation → spar_session marked paid:', sess.id)
            const leadId = sess.lead_id || order.lead_id
            if (leadId) await supabase.from('leads').update({ status: 'won' }).eq('id', leadId).neq('status', 'won')
          } else {
            console.log('[tpay-webhook] Reservation paid but no matching unpaid spar_session (lead_id/email):', order.lead_id, order.customer_email)
          }
        }
      } catch (sparErr) {
        console.error('[tpay-webhook] spar_session reservation sync error:', sparErr)
      }

      // ── PEŁNA PŁATNOŚĆ APLIKACJA: oznacz full_paid_at → odmraża etap KNOW-HOW ──
      // Lustro logiki rezerwacji powyżej. Pełna płatność = opłacony order oferty
      // "Budowa aplikacji — …" (offer_type=full). Idempotentne (full_paid_at IS NULL).
      try {
        const descF = (order.description || '').toLowerCase()
        const isAplikacjaFull = descF.includes('budowa aplikacji')
        if (isAplikacjaFull) {
          let sessF: { id: string; lead_id: string | null } | null = null
          // 1) Twardy link order→sesja (sid z checkoutu) — pewny, bez zgadywania.
          if (order.spar_session_id) {
            const { data } = await supabase
              .from('spar_sessions')
              .select('id, lead_id')
              .eq('id', order.spar_session_id)
              .is('full_paid_at', null)
              .maybeSingle()
            sessF = data || null
          }
          // 2) Fallback po lead_id, 3) po e-mailu (najnowsza bez full_paid_at).
          if (!sessF && order.lead_id) {
            const { data } = await supabase
              .from('spar_sessions')
              .select('id, lead_id')
              .eq('lead_id', order.lead_id)
              .is('full_paid_at', null)
              .eq('is_test', false)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()
            sessF = data || null
          }
          if (!sessF && order.customer_email) {
            const { data } = await supabase
              .from('spar_sessions')
              .select('id, lead_id')
              .ilike('email', order.customer_email.trim())
              .is('full_paid_at', null)
              .eq('is_test', false)
              .order('last_user_at', { ascending: false, nullsFirst: false }) // najnowsza AKTYWNA, nie najstarsza
              .limit(1)
              .maybeSingle()
            sessF = data || null
          }
          if (sessF) {
            await supabase.from('spar_sessions').update({ full_paid_at: paidAt, updated_at: new Date().toISOString() }).eq('id', sessF.id)
            await supabase.from('spar_knowhow_summary').upsert({ session_id: sessF.id, lead_id: sessF.lead_id || order.lead_id || null, status: 'active' }, { onConflict: 'session_id' })
            console.log('[tpay-webhook] Full payment → spar_session full_paid_at set (know-how):', sessF.id)
          } else {
            // Pełna płatność za budowę, ale nie dopasowano sesji → etap know-how się
            // NIE odmrozi. Twardy [ALERT] w logach (jak lead_error w spar-chat), żeby
            // Tomek ręcznie przypiął full_paid_at z karty leada.
            console.error('[tpay-webhook] [ALERT] Full payment „budowa aplikacji" bez dopasowanej spar_session — przypnij ręcznie. order:', order.id, 'lead:', order.lead_id, 'email:', order.customer_email)
          }
        }
      } catch (fullErr) {
        console.error('[tpay-webhook] spar_session full payment sync error:', fullErr)
      }

      // ── LEJEK BUDOWANIA (/sklep): synchronizacja bud_sessions ──
      // KRYTYCZNE: dotąd tpay-webhook synchronizował WYŁĄCZNIE spar_sessions (aplikacja),
      // więc bud_sessions.paid_at / full_paid_at NIGDY się nie ustawiały → rezerwacja
      // budowania nie oznaczała sesji jako opłaconej, a pełna płatność nie odmrażała
      // etapu know-how. Lustro logiki spar. Match: sid (twardy link order→sesja, pewny —
      // ID bud i spar są z różnych tabel, więc match w bud_sessions = na pewno budowanie)
      // > lead_id > e-mail (najnowsza aktywna: last_user_at DESC). Rezerwacja vs pełna
      // płatność rozstrzygana KWOTĄ (rezerwacja = 100, do 21.07 = 500; budowa ≫ 1000). Idempotentne.
      try {
        const descB = (order.description || '').toLowerCase()
        const isBudReservation = descB.includes('rezerwacj') && (descB.includes('zbuduj') || descB.includes('sklep') || descB.includes('biznes online'))
        // Zakup budowy sklepu z lejka /rozmowa (oferta „Budowa sklepu pełen pakiet")
        // — klient NIE ma bud_session, ale projekt wf2 MUSI powstać (2026-07-23,
        // incydent hen.mir@o2.pl: pełna płatność wpadała do workflow v1, a w
        // /tn-sklepy nie pojawiała się wcale; trigger v1 wyłączony dla sklepów
        // migracją 20260723_skip_classic_workflow_for_sklep)
        const isSklepBuild = descB.includes('budowa sklepu')
        const amt = parseFloat(String(order.amount)) || 0
        const isFull = amt >= 1000 // rezerwacja = 100 zł (do 21.07: 500); pełna budowa ≫ 1000
        const sid = order.spar_session_id || null
        // deno-lint-ignore no-explicit-any
        let bs: any = null
        if (sid) {
          const { data } = await supabase.from('bud_sessions').select('id, lead_id, paid_at, full_paid_at').eq('id', sid).maybeSingle()
          bs = data || null // gdy sid wskazuje spar (nie bud) → null → blok nic nie robi
        }
        if (!bs && isBudReservation && order.lead_id) {
          const { data } = await supabase.from('bud_sessions').select('id, lead_id, paid_at, full_paid_at').eq('lead_id', order.lead_id).is('paid_at', null).eq('is_test', false).order('last_user_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle()
          bs = data || null
        }
        if (!bs && isBudReservation && order.customer_email) {
          const { data } = await supabase.from('bud_sessions').select('id, lead_id, paid_at, full_paid_at').ilike('email', order.customer_email.trim()).is('paid_at', null).eq('is_test', false).order('last_user_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle()
          bs = data || null
        }
        if (bs) {
          if (isFull && !bs.full_paid_at) {
            await supabase.from('bud_sessions').update({ full_paid_at: paidAt, updated_at: new Date().toISOString() }).eq('id', bs.id)
            await supabase.from('bud_knowhow_summary').upsert({ session_id: bs.id, lead_id: bs.lead_id || order.lead_id || null, status: 'active' }, { onConflict: 'session_id' })
            console.log('[tpay-webhook] Budowanie: pełna płatność → bud_session full_paid_at (know-how):', bs.id)
          } else if (!bs.paid_at) {
            await supabase.from('bud_sessions').update({ paid_at: paidAt, updated_at: new Date().toISOString() }).eq('id', bs.id)
            console.log('[tpay-webhook] Budowanie: rezerwacja → bud_session paid_at:', bs.id)
          }
          // WORKFLOW V2 („Sklepy"): PEŁNA płatność → auto-projekt prowadzenia
          // wspólnego biznesu (decyzja Tomka 21.07.2026: sama rezerwacja (100 zł) NIE
          // tworzy projektu — dopiero pełna wpłata). Idempotentne po bud_session_id;
          // własny try/catch — NIGDY nie przerywa obsługi płatności.
          if (isFull) {
            try {
              const { data: exProj } = await supabase.from('wf2_projects').select('id').eq('bud_session_id', bs.id).maybeSingle()
              if (!exProj) {
                const { data: sess } = await supabase.from('bud_sessions')
                  .select('id, name, email, phone, lead_id, chosen_product').eq('id', bs.id).maybeSingle()
                // deno-lint-ignore no-explicit-any
                const prodObj: any = sess?.chosen_product || {}
                const prodName = String(prodObj.nazwa || prodObj.pl_name || prodObj.name || '').trim()
                // projekt NIE ma własnej nazwy (decyzja Tomka 2026-07-03) — identyfikacja
                // po kliencie; docelowo wizytówką będzie link do galerii landingów klienta
                // BRAMKA ZGODY KONSUMENCKIEJ (migracja 20260722c): kopiuj NIP/firmę z zamówienia
                // i — jeśli zgoda na start prac padła już w kasie (consent_digital_service) —
                // przenieś jej znacznik do projektu, żeby portal nie pokazywał bramki drugi raz.
                // deno-lint-ignore no-explicit-any
                const consentCols: Record<string, any> = {
                  customer_nip: order.customer_nip || null,
                  customer_company: order.customer_company || null,
                }
                if (order.consent_digital_service === true && order.consented_at) {
                  consentCols.work_consent_at = order.consented_at
                  consentCols.work_consent_version = 'v2-2026-07-21'
                  consentCols.work_consent_source = 'checkout'
                }
                const { data: proj, error: projErr } = await supabase.from('wf2_projects').insert({
                  customer_name: sess?.name || order.customer_name || null,
                  customer_email: sess?.email || order.customer_email || null,
                  customer_phone: sess?.phone || null,
                  lead_id: bs.lead_id || order.lead_id || null,
                  bud_session_id: bs.id,
                  reservation_order_id: order.id,
                  status: 'start',
                  ...consentCols,
                }).select('id').single()
                if (projErr) {
                  console.error('[tpay-webhook] WF2: insert projektu padł (nieblokujące):', projErr.message)
                } else if (proj) {
                  // produkt z rozmowy = pierwszy kandydat portfela; oryginalna sesja = sesja generatorów
                  if (prodName) {
                    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                    await supabase.from('wf2_products').insert({
                      project_id: proj.id, name: prodName, status: 'kandydat', sort: 0,
                      gen_session_id: bs.id,
                      tt_product_id: uuidRe.test(String(prodObj.id || '')) ? prodObj.id : null,
                      supplier_url: prodObj.ali_url || prodObj.chosen_link || prodObj.supplier_url || null,
                      cover_url: prodObj.curated_image || prodObj.cover || prodObj.image || null,
                    })
                  }
                  await supabase.rpc('wf2_ensure_steps', { p_project: proj.id })
                  // pełna płatność jako pierwsza pozycja harmonogramu — od razu opłacona;
                  // wcześniejsza rezerwacja (jeśli była) dopisywana drugą pozycją
                  await supabase.from('wf2_payments').insert({
                    project_id: proj.id, sort: 0, label: 'Pełna płatność za budowę',
                    amount: amt, order_id: order.id, paid_at: paidAt,
                  })
                  if (bs.paid_at) {
                    // kwota rezerwacji: 100 zł od 2026-07-21 (wpłaty sprzed zmiany = 500 zł)
                    await supabase.from('wf2_payments').insert({
                      project_id: proj.id, sort: 1, label: 'Rezerwacja (zwrotna, wliczona w budowę)',
                      amount: bs.paid_at < '2026-07-21T18:00:00Z' ? 500 : 100, order_id: null, paid_at: bs.paid_at,
                    })
                  }
                  await supabase.from('wf2_activities').insert({
                    project_id: proj.id, actor: 'auto', action: 'created',
                    description: 'Projekt utworzony automatycznie po pełnej płatności za budowę',
                  })
                  console.log('[tpay-webhook] WF2: utworzony projekt', proj.id, 'dla bud_session', bs.id)
                }
              }
            } catch (wf2Err) {
              console.error('[tpay-webhook] WF2 project create error (nieblokujące):', wf2Err)
            }
          }
          const leadId = bs.lead_id || order.lead_id
          // Rezerwacja 100 zł (zwrotna) = etap NEGOCJACJE — rozmowa z Tomkiem dopiero przed
          // nami; „won" WYŁĄCZNIE przy pełnej płatności budowy (decyzja Tomka 2026-07-03;
          // wcześniej każda rezerwacja lądowała w CRM jako wygrany deal i psuła metrykę WON).
          if (leadId) {
            if (isFull) await supabase.from('leads').update({ status: 'won' }).eq('id', leadId).neq('status', 'won')
            else await supabase.from('leads').update({ status: 'negotiation' }).eq('id', leadId).not('status', 'in', '("won","negotiation")')
          }
        } else if (isFull && isSklepBuild) {
          // WORKFLOW V2 bez bud_session: pełna płatność za budowę sklepu z lejka
          // /rozmowa (oferta „Budowa sklepu…"). Idempotentne: (1) po
          // reservation_order_id (retry webhooka), (2) po lead_id/e-mailu —
          // aktywny projekt = dopisz tylko ratę do harmonogramu, nie dubluj.
          try {
            const { data: exByOrder } = await supabase.from('wf2_projects').select('id').eq('reservation_order_id', order.id).maybeSingle()
            let projId: string | null = exByOrder?.id || null
            if (!projId) {
              // deno-lint-ignore no-explicit-any
              let exProj: any = null
              if (order.lead_id) {
                const { data } = await supabase.from('wf2_projects').select('id').eq('lead_id', order.lead_id).neq('lifecycle', 'cancelled').order('created_at', { ascending: false }).limit(1).maybeSingle()
                exProj = data || null
              }
              if (!exProj && order.customer_email) {
                const { data } = await supabase.from('wf2_projects').select('id').ilike('customer_email', order.customer_email.trim()).neq('lifecycle', 'cancelled').order('created_at', { ascending: false }).limit(1).maybeSingle()
                exProj = data || null
              }
              if (exProj) {
                // kolejna rata za budowę → tylko pozycja harmonogramu
                const { data: exPay } = await supabase.from('wf2_payments').select('id').eq('project_id', exProj.id).eq('order_id', order.id).maybeSingle()
                if (!exPay) {
                  const { count } = await supabase.from('wf2_payments').select('id', { count: 'exact', head: true }).eq('project_id', exProj.id)
                  await supabase.from('wf2_payments').insert({
                    project_id: exProj.id, sort: count || 0, label: 'Płatność za budowę (kolejna rata)',
                    amount: amt, order_id: order.id, paid_at: paidAt,
                  })
                  console.log('[tpay-webhook] WF2 (bez bud_session): dopisana rata do projektu', exProj.id)
                }
              } else {
                // deno-lint-ignore no-explicit-any
                const consentCols: Record<string, any> = {
                  customer_nip: order.customer_nip || null,
                  customer_company: order.customer_company || null,
                }
                if (order.consent_digital_service === true && order.consented_at) {
                  consentCols.work_consent_at = order.consented_at
                  consentCols.work_consent_version = 'v2-2026-07-21'
                  consentCols.work_consent_source = 'checkout'
                }
                const { data: proj, error: projErr } = await supabase.from('wf2_projects').insert({
                  customer_name: order.customer_name || null,
                  customer_email: order.customer_email || null,
                  customer_phone: order.customer_phone || null,
                  lead_id: order.lead_id || null,
                  bud_session_id: null,
                  reservation_order_id: order.id,
                  status: 'start',
                  ...consentCols,
                }).select('id').single()
                if (projErr) {
                  console.error('[tpay-webhook] WF2 (bez bud_session): insert projektu padł (nieblokujące):', projErr.message)
                } else if (proj) {
                  projId = proj.id
                  await supabase.rpc('wf2_ensure_steps', { p_project: proj.id })
                  await supabase.from('wf2_payments').insert({
                    project_id: proj.id, sort: 0, label: 'Pełna płatność za budowę',
                    amount: amt, order_id: order.id, paid_at: paidAt,
                  })
                  await supabase.from('wf2_activities').insert({
                    project_id: proj.id, actor: 'auto', action: 'created',
                    description: 'Projekt utworzony automatycznie po pełnej płatności za budowę (zakup z lejka /rozmowa, bez sesji /sklep)',
                  })
                  console.log('[tpay-webhook] WF2 (bez bud_session): utworzony projekt', proj.id, 'dla order', order.id)
                }
              }
            }
          } catch (wf2Err) {
            console.error('[tpay-webhook] WF2 (bez bud_session) create error (nieblokujące):', wf2Err)
          }
          if (order.lead_id) {
            await supabase.from('leads').update({ status: 'won' }).eq('id', order.lead_id).neq('status', 'won')
          }
        } else if (isBudReservation) {
          // Rezerwacja opłacona → kolumna „Rezerwacja" (negotiation) niezależnie od
          // lejka; allowRevive — skoro płaci, żyje (luka /rozmowa 2026-07-23:
          // Tymoteusz po wpłacie 100 zł stał w pipeline jako „Nowy").
          if (order.lead_id) {
            await bumpLeadStage(supabase, order.lead_id, 'negotiation', { allowRevive: true, channel: '/rozmowa' })
          }
          // Format /rozmowa = „Rezerwacja: <nazwa oferty>" — brak bud_session jest tam
          // NORMALNY (klient nie przechodził przez /sklep AI); ALERT tylko dla reszty
          // (rezerwacja z lejka /sklep bez dopasowanej sesji = realna anomalia).
          if (descB.startsWith('rezerwacja:')) {
            console.log('[tpay-webhook] Rezerwacja z lejka /rozmowa (bez bud_session — OK). order:', order.id)
          } else {
            console.error('[tpay-webhook] [ALERT] Rezerwacja budowania bez dopasowanej bud_session — przypnij ręcznie. order:', order.id, 'lead:', order.lead_id, 'email:', order.customer_email)
          }
        }
      } catch (budErr) {
        console.error('[tpay-webhook] bud_session sync error:', budErr)
      }

      // Efekty uboczne TYLKO przy pierwszym zaksięgowaniu (patrz alreadyPaid wyżej).
      if (!alreadyPaid) {
        // Send Slack notification for successful payment
        await sendSlackPaidNotification({ ...order, payment_source: order.payment_source || 'tpay' }, supabase)

        // Rezerwacja budowy sklepu (100 zł) → potwierdzenie z CTA WhatsApp
        // (dyrektywa Tomka 23.07: klient ma od razu dostać jego numer i móc napisać,
        // że wpłacił rezerwację — albo poczekać na kontakt). Szablon
        // bud_reservation_confirmed w settings; pełna płatność (≥1000) NIE dostaje
        // tego maila (tam potwierdzenie idzie ręcznym draftem z linkiem do portalu).
        try {
          const descR = (order.description || '').toLowerCase()
          const amtR = parseFloat(String(order.amount)) || 0
          const isBudResMail = amtR < 1000 && descR.includes('rezerwacj') &&
            (descR.includes('zbuduj') || descR.includes('sklep') || descR.includes('biznes online'))
          if (isBudResMail && order.customer_email) {
            // Prefill WhatsApp z imieniem i nazwiskiem (życzenie Tomka 23.07 — żeby
            // wiedział, kto pisze z obcego numeru). Zakodowany TUTAJ, bo
            // replaceVariables w send-email podstawia zmienne 1:1 bez URL-encode.
            const fullName = (order.customer_name || '').trim()
            const waPrefill = encodeURIComponent(
              `Cześć Tomek! Właśnie wpłaciłem/am rezerwację budowy sklepu${fullName ? ' — ' + fullName : ''}.`)
            const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
              body: JSON.stringify({
                type: 'bud_reservation_confirmed',
                data: {
                  email: order.customer_email,
                  clientName: fullName.split(' ')[0] || 'Cześć',
                  waPrefill,
                },
              }),
            })
            if (!res.ok) console.error('[tpay-webhook] bud_reservation_confirmed mail padł:', res.status, await res.text())
            else console.log('[tpay-webhook] bud_reservation_confirmed mail wysłany:', order.customer_email)
          }
        } catch (mailErr) {
          console.error('[tpay-webhook] bud_reservation_confirmed mail error (nieblokujące):', mailErr)
        }

        // Send Meta Conversions API event
        await sendMetaConversion(order, supabase)

        // Send TikTok Events API event
        await sendTikTokConversion(order, supabase)

        // Google Ads zakup: WYLACZONE celowo. Konwersje zakupu liczymy WYLACZNIE przez
        // import GA4 'purchase' (akcja "tomekniedzwiecki.pl (web) purchase"), zeby nie
        // liczyc tej samej transakcji dwa razy (import GA4 + uploadClickConversions).
        // Funkcja sendGoogleConversion zostaje w kodzie — odkomentuj jesli kiedys chcesz
        // wrocic do uploadu po gclid zamiast importu GA4.
        // await sendGoogleConversion(order, supabase)

        // Send GA4 purchase server-side (Measurement Protocol) — backup gdy browser purchase nie zdazy
        await sendGA4Purchase(order)

        // Increment discount code usage only on successful payment
        if (order.discount_code_id) {
          try {
            await supabase.rpc('use_discount_code', { p_code_id: order.discount_code_id })
            console.log('[tpay-webhook] Discount code usage incremented:', order.discount_code_id)
          } catch (discountErr) {
            console.error('[tpay-webhook] Failed to increment discount code usage:', discountErr)
          }
        }
      }
    } else if (trStatus === TPAY_STATUS.FALSE || trStatus === 'error' || trStatus === 'failed') {
      // Keep as pending or mark as failed if needed
      console.log('[tpay-webhook] Payment failed')
    } else if (trStatus === TPAY_STATUS.CHARGEBACK || trStatus === 'refund') {
      newStatus = 'cancelled'
      console.log('[tpay-webhook] Payment refunded/chargebacked')
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        paid_at: paidAt,
        payment_reference: trId,
        payment_source: 'tpay',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('[tpay-webhook] Failed to update order:', updateError)
    } else {
      console.log('[tpay-webhook] Order updated successfully')
    }

    // Update installment status if this is an installment payment
    if (newStatus === 'paid' && order.installment_id) {
      try {
        console.log('[tpay-webhook] Updating installment:', order.installment_id)

        const { error: installmentError } = await supabase
          .from('payment_installments')
          .update({
            status: 'paid',
            paid_at: paidAt,
            order_id: order.id
          })
          .eq('id', order.installment_id)

        if (installmentError) {
          console.error('[tpay-webhook] Failed to update installment:', installmentError)
        } else {
          console.log('[tpay-webhook] Installment marked as paid')

          // Note: The trigger update_workflow_payment_status() will automatically
          // update the workflow.payment_status based on all installments
        }
      } catch (instError) {
        console.error('[tpay-webhook] Installment update error:', instError)
      }
    }

    // Log to audit if status changed
    if (newStatus !== order.status) {
      try {
        await supabase.from('audit_log').insert({
          entity_type: 'order',
          entity_id: order.id,
          action: 'payment_update',
          changes: {
            old_status: order.status,
            new_status: newStatus,
            tpay_transaction_id: trId,
            tpay_status: trStatus,
          },
          performed_by: null, // System action
        })
      } catch (auditError) {
        console.error('[tpay-webhook] Audit log error:', auditError)
      }
    }

    // Tpay expects "TRUE" response to confirm receipt
    console.log('[tpay-webhook] SUCCESS - Responding TRUE to Tpay')
    return new Response('TRUE', { headers: corsHeaders, status: 200 })

  } catch (error) {
    console.error('[tpay-webhook] ERROR:', error.message, error)
    // Still return TRUE to prevent infinite retries
    return new Response('TRUE', { headers: corsHeaders, status: 200 })
  }
})
