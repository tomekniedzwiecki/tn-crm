 
import { createClient } from 'jsr:@supabase/supabase-js@2'
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
const META_API_VERSION = 'v23.0'

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
    // Get fbclid from lead_tracking if order has lead_id
    let fbc: string | null = null
    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('fbclid')
        .eq('lead_id', order.lead_id)
        .single()

      if (tracking?.fbclid) {
        // Format fbc: fb.1.{timestamp}.{fbclid}
        const timestamp = Date.now()
        fbc = `fb.1.${timestamp}.${tracking.fbclid}`
        console.log('[meta] Found fbclid, using fbc:', fbc.substring(0, 30) + '...')
      }
    }

    // Build user data with hashed PII
    const userData: Record<string, any> = {}

    if (order.customer_email) {
      userData.em = [await sha256Hash(order.customer_email)]
    }

    if (order.customer_phone) {
      const normalizedPhone = normalizePhone(order.customer_phone)
      userData.ph = [await sha256Hash(normalizedPhone)]
    }

    if (fbc) {
      userData.fbc = fbc
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
            value: parseFloat(order.amount),
            content_name: order.description,
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
      has_fbc: !!fbc
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

    // Get ttclid from lead_tracking if order has lead_id
    if (order.lead_id) {
      const { data: tracking } = await supabase
        .from('lead_tracking')
        .select('ttclid')
        .eq('lead_id', order.lead_id)
        .single()

      if (tracking?.ttclid) {
        userData.ttclid = tracking.ttclid
        console.log('[tiktok] Found ttclid from lead_tracking')
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
            value: parseFloat(order.amount),
            currency: 'PLN',
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
      has_phone: !!userData.phone
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
      newStatus = 'paid'
      paidAt = new Date().toISOString()
      console.log('[tpay-webhook] Payment successful!')

      // Send Slack notification for successful payment
      await sendSlackPaidNotification({ ...order, payment_source: order.payment_source || 'tpay' }, supabase)

      // Send Meta Conversions API event
      await sendMetaConversion(order, supabase)

      // Send TikTok Events API event
      await sendTikTokConversion(order, supabase)

      // Increment discount code usage only on successful payment
      if (order.discount_code_id) {
        try {
          await supabase.rpc('use_discount_code', { p_code_id: order.discount_code_id })
          console.log('[tpay-webhook] Discount code usage incremented:', order.discount_code_id)
        } catch (discountErr) {
          console.error('[tpay-webhook] Failed to increment discount code usage:', discountErr)
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
