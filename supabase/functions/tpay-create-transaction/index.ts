import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tpay API URLs
const TPAY_API_URL = 'https://api.tpay.com'
const TPAY_SANDBOX_URL = 'https://openapi.sandbox.tpay.com'

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

// Get OAuth2 access token from Tpay
async function getTpayToken(clientId: string, clientSecret: string, useSandbox: boolean): Promise<string> {
  const baseUrl = useSandbox ? TPAY_SANDBOX_URL : TPAY_API_URL

  const response = await fetch(`${baseUrl}/oauth/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[tpay] Token error:', response.status, errorText)
    throw new Error(`Błąd autoryzacji Tpay: ${response.status}`)
  }

  const data: TpayTokenResponse = await response.json()
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
    paymentType?: string // 'one_time' or 'installments'
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

  // For installments, we can use Tpay's installment payment groups
  // Group 109 = PayU Raty, Group 169 = Twisto, etc.
  // Or we can let user choose on Tpay's payment page
  if (params.paymentType === 'installments') {
    // Enable installments payment groups
    payload.pay = {
      groupId: 109, // PayU Raty - can be configured
    }
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
    throw new Error(`Błąd tworzenia transakcji Tpay: ${response.status}`)
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
    const { orderId, successUrl, errorUrl, paymentType } = await req.json()

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
    const { data: sandboxSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'tpay_sandbox_mode')
      .single()

    const useSandbox = sandboxSetting?.value === 'true'
    console.log('[tpay] Sandbox mode:', useSandbox)

    // Get base URL for callbacks
    const { data: baseUrlSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'app_base_url')
      .single()

    const appBaseUrl = baseUrlSetting?.value || 'https://crm.tomekniedzwiecki.pl'

    // Build callback URLs - use dedicated success/error pages
    const finalSuccessUrl = successUrl || `${appBaseUrl}/checkout/success.html?order=${orderId}`
    const finalErrorUrl = errorUrl || `${appBaseUrl}/checkout/error.html?order=${orderId}`
    const notifyUrl = `${supabaseUrl}/functions/v1/tpay-webhook`

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
      paymentType: paymentType || 'one_time',
    })

    // Update order with Tpay transaction ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_reference: transaction.transactionId,
        payment_source: 'tpay',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[tpay] Failed to update order:', updateError)
    }

    console.log('[tpay-create-transaction] SUCCESS - Payment URL generated')

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.transactionId,
        paymentUrl: transaction.transactionPaymentUrl,
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
