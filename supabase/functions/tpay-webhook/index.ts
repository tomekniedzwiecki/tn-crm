import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tpay notification statuses
// https://docs.tpay.com/#!/Transaction_API/post_transactions
const TPAY_STATUS = {
  TRUE: 'TRUE',       // Payment successful
  FALSE: 'FALSE',     // Payment failed
  CHARGEBACK: 'CHARGEBACK', // Refund/chargeback
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

serve(async (req) => {
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
      console.error('[tpay-webhook] Missing transaction ID')
      return new Response('TRUE', { headers: corsHeaders, status: 200 })
    }

    console.log('[tpay-webhook] Transaction:', trId, 'Status:', trStatus, 'OrderId:', trCrc)

    // Optional: Verify signature (if security code is set)
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
        console.error('[tpay-webhook] Invalid signature!')
        // Still return TRUE to prevent Tpay from retrying
        return new Response('TRUE', { headers: corsHeaders, status: 200 })
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
