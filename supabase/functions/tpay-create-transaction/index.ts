import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tpay API URLs
// Production: https://api.tpay.com (confirmed from docs-api.tpay.com)
// Sandbox: https://openapi.sandbox.tpay.com
const TPAY_API_URL = 'https://api.tpay.com'
const TPAY_SANDBOX_URL = 'https://openapi.sandbox.tpay.com'

// Slack webhook for payment attempts (from environment variable)

// Send Slack notification for checkout attempt
async function sendSlackCheckoutNotification(order: any, paymentMethod: string) {
  const webhookUrl = Deno.env.get('SLACK_CHECKOUT_WEBHOOK')
  if (!webhookUrl) {
    console.log('[slack] SLACK_CHECKOUT_WEBHOOK not configured, skipping notification')
    return
  }

  try {
    const methodNames: Record<string, string> = {
      'blik': 'BLIK',
      'card': 'Karta',
      'transfer': 'Przelew',
      'installments': 'Raty',
      'pragmapay': 'PragmaPay',
    }

    const methodName = methodNames[paymentMethod] || paymentMethod

    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🛒 Nowa próba płatności',
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
              text: `*Kwota:*\n${parseFloat(order.amount).toFixed(2)} PLN`
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
              text: `*Metoda:*\n${methodName}`
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

    console.log('[slack] Checkout notification sent')
  } catch (err) {
    console.error('[slack] Failed to send checkout notification:', err)
  }
}

// Tpay Payment Group IDs
const PAYMENT_GROUPS = {
  blik: 150,
  card: 103,
  google_pay: 166,
  apple_pay: 167,
  transfer: 0, // 0 = let user choose bank on Tpay page
  installments: 169, // Pekao Raty 0%
  // twisto: 170, // Twisto BNPL - not available on this account
}

interface TpayTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface TpayTransactionResponse {
  result: string
  transactionId: string
  title: string
  transactionPaymentUrl: string
}

// Get OAuth2 access token from Tpay using client credentials flow
async function getTpayToken(clientId: string, clientSecret: string, useSandbox: boolean): Promise<string> {
  const baseUrl = useSandbox ? TPAY_SANDBOX_URL : TPAY_API_URL
  const tokenUrl = `${baseUrl}/oauth/auth`

  console.log('[tpay] Requesting token from:', tokenUrl)
  console.log('[tpay] Sandbox mode:', useSandbox)
  console.log('[tpay] Client ID (first 8 chars):', clientId?.substring(0, 8))

  // Tpay expects client_id and client_secret in the body
  const formData = new URLSearchParams()
  formData.append('client_id', clientId)
  formData.append('client_secret', clientSecret)

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[tpay] Token error:', response.status, errorText)
    console.error('[tpay] Using URL:', tokenUrl)
    throw new Error(`Błąd autoryzacji Tpay: ${response.status} - ${errorText}`)
  }

  const data: TpayTokenResponse = await response.json()
  console.log('[tpay] Token obtained successfully, expires in:', data.expires_in)
  return data.access_token
}

// Create transaction in Tpay
async function createTpayTransaction(
  token: string,
  useSandbox: boolean,
  params: {
    amount: number
    description: string
    email: string
    name?: string
    phone?: string
    orderId: string
    successUrl: string
    errorUrl: string
    notifyUrl: string
    groupId?: number
    blikCode?: string
  }
): Promise<TpayTransactionResponse> {
  const baseUrl = useSandbox ? TPAY_SANDBOX_URL : TPAY_API_URL

  const payload: Record<string, any> = {
    amount: params.amount,
    description: params.description,
    hiddenDescription: params.orderId,
    lang: 'pl',
    payer: {
      email: params.email,
      name: params.name || '',
      phone: params.phone || '',
    },
    callbacks: {
      payerUrls: {
        success: params.successUrl,
        error: params.errorUrl,
      },
      notification: {
        url: params.notifyUrl,
      },
    },
  }

  // Add payment group if specified and valid
  // groupId 0 means let user choose on Tpay page (bank transfers)
  if (params.groupId && params.groupId > 0) {
    payload.pay = {
      groupId: params.groupId,
    }
    console.log('[tpay] Using payment group:', params.groupId)
  }

  // Add BLIK code for inline BLIK payment
  if (params.blikCode) {
    payload.pay = {
      ...payload.pay,
      groupId: 150, // BLIK group ID
      blikPaymentData: {
        blikToken: params.blikCode,
      },
    }
    console.log('[tpay] Using BLIK inline with code')
  }

  console.log('[tpay] Creating transaction:', JSON.stringify(payload))

  const response = await fetch(`${baseUrl}/transactions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[tpay] Transaction error:', response.status, errorText)
    // Parse error details if available
    let errorDetails = ''
    try {
      const errorJson = JSON.parse(errorText)
      errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson)
    } catch {
      errorDetails = errorText
    }
    throw new Error(`Błąd Tpay (${response.status}): ${errorDetails}`)
  }

  const data: TpayTransactionResponse = await response.json()
  console.log('[tpay] Transaction created:', data.transactionId)
  return data
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[tpay-create-transaction] Request received')

    // Get credentials from secrets
    const tpayClientId = Deno.env.get('tpay_client_id')
    const tpayClientSecret = Deno.env.get('tpay_client_secret')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!tpayClientId || !tpayClientSecret) {
      throw new Error('Brak konfiguracji Tpay (client_id, client_secret)')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Brak konfiguracji Supabase')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { orderId, successUrl, errorUrl, paymentType, groupId, blikCode } = await req.json()

    if (!orderId) {
      throw new Error('Brak ID zamówienia')
    }

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error(`Zamówienie nie znalezione: ${orderId}`)
    }

    if (order.status === 'paid') {
      throw new Error('Zamówienie jest już opłacone')
    }

    console.log('[tpay] Order found:', order.order_number, 'Amount:', order.amount)

    // Check if using sandbox mode (from settings)
    // Default to production (false) if setting doesn't exist or is not explicitly 'true'
    const { data: sandboxSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'tpay_sandbox_mode')
      .single()

    // Force production mode - user confirmed they have production credentials
    const useSandbox = false // sandboxSetting?.value === 'true'
    console.log('[tpay] Sandbox mode:', useSandbox, '(forced production)')

    // Get base URL for callbacks
    const { data: baseUrlSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'app_base_url')
      .single()

    const appBaseUrl = baseUrlSetting?.value || 'https://crm.tomekniedzwiecki.pl'

    // Build callback URLs - use clean URLs without .html
    const finalSuccessUrl = successUrl || `${appBaseUrl}/checkout/success?order=${orderId}`
    const finalErrorUrl = errorUrl || `${appBaseUrl}/checkout/error?order=${orderId}`
    const notifyUrl = `${supabaseUrl}/functions/v1/tpay-webhook`

    // Determine payment group
    let finalGroupId = groupId

    // If no groupId provided, use default based on payment type
    if (!finalGroupId && paymentType) {
      switch (paymentType) {
        case 'blik':
          finalGroupId = PAYMENT_GROUPS.blik
          break
        case 'card':
          finalGroupId = PAYMENT_GROUPS.card
          break
        case 'transfer':
          finalGroupId = PAYMENT_GROUPS.transfer
          break
        case 'installments':
          finalGroupId = PAYMENT_GROUPS.installments
          break
      }
    }

    console.log('[tpay] Payment type:', paymentType, 'Group ID:', finalGroupId, 'BLIK code:', blikCode ? 'provided' : 'none')

    // Get OAuth token
    const token = await getTpayToken(tpayClientId, tpayClientSecret, useSandbox)

    // Create transaction
    const transaction = await createTpayTransaction(token, useSandbox, {
      amount: parseFloat(order.amount),
      description: order.description || `Zamówienie ${order.order_number}`,
      email: order.customer_email,
      name: order.customer_name,
      phone: order.customer_phone,
      orderId: order.id,
      successUrl: finalSuccessUrl,
      errorUrl: finalErrorUrl,
      notifyUrl: notifyUrl,
      groupId: finalGroupId,
      blikCode: blikCode,
    })

    // Determine payment source
    let paymentSource = 'tpay'
    if (blikCode) {
      paymentSource = 'blik'
    } else if (paymentType === 'installments') {
      paymentSource = 'installments'
    } else if (paymentType === 'pragmapay') {
      paymentSource = 'pragmapay'
    }

    // Update order with Tpay transaction ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_reference: transaction.transactionId,
        payment_source: paymentSource,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[tpay] Failed to update order:', updateError)
    }

    console.log('[tpay-create-transaction] SUCCESS - Payment URL generated')

    // Send Slack notification for checkout attempt
    await sendSlackCheckoutNotification(order, paymentType || selectedMethod || 'unknown')

    // For BLIK inline, we don't redirect - the payment is processed immediately
    // Frontend should poll for status
    const isBlikInline = !!blikCode

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.transactionId,
        paymentUrl: transaction.transactionPaymentUrl,
        blikInline: isBlikInline,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('[tpay-create-transaction] ERROR:', error.message, error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
