 
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

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
async function sendSlackPaidNotification(order: any) {
  const webhookUrl = Deno.env.get('SLACK_PAID_WEBHOOK')
  if (!webhookUrl) {
    console.log('[slack] SLACK_PAID_WEBHOOK not configured, skipping notification')
    return
  }

  try {
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
              text: `*Email:*\n${order.customer_email}`
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

  console.log('[tpay-webhook] Signature verification:', {
    received: receivedMd5,
    calculated: calculatedMd5,
    match: calculatedMd5 === receivedMd5,
  })

  return calculatedMd5 === receivedMd5
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

    console.log('[tpay-webhook] Notification data:', JSON.stringify(notification))

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
        // Return 403 Forbidden for invalid signature - this is a security issue
        return new Response('FALSE', { headers: corsHeaders, status: 403 })
      }
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
      await sendSlackPaidNotification({ ...order, payment_source: order.payment_source || 'tpay' })

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
