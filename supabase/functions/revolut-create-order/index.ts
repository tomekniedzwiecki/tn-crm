import { createClient } from 'jsr:@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const REVOLUT_API_URL = 'https://merchant.revolut.com'
const REVOLUT_SANDBOX_URL = 'https://sandbox-merchant.revolut.com'
const REVOLUT_API_VERSION = '2024-09-01'

interface RevolutOrderResponse {
  id: string
  token: string
  public_id: string
  state: string
  created_at: string
  updated_at: string
  amount: number
  currency: string
  checkout_url?: string
}

async function sendSlackCheckoutNotification(order: any, supabase?: any) {
  const webhookUrl = Deno.env.get('SLACK_CHECKOUT_WEBHOOK')
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
          text: { type: 'plain_text', text: '🛒 Nowa próba płatności (Revolut)', emoji: true }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Zamówienie:*\n${order.order_number}` },
            { type: 'mrkdwn', text: `*Kwota:*\n${parseFloat(order.amount).toFixed(2)} PLN` }
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
            { type: 'mrkdwn', text: `*Metoda:*\nRevolut Pay (karta/Apple Pay/Google Pay)` }
          ]
        }
      ]
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
  } catch (err) {
    console.error('[slack] Failed to send checkout notification:', err)
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[revolut-create-order] Request received')

    const revolutSecretKey = Deno.env.get('revolut_secret_key')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!revolutSecretKey) {
      throw new Error('Brak konfiguracji Revolut (revolut_secret_key)')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Brak konfiguracji Supabase')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { orderId } = await req.json()

    if (!orderId) {
      throw new Error('Brak ID zamówienia')
    }

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

    console.log('[revolut] Order found:', order.order_number, 'Amount:', order.amount)

    const useSandbox = revolutSecretKey.startsWith('sk_sandbox_')
    const baseUrl = useSandbox ? REVOLUT_SANDBOX_URL : REVOLUT_API_URL
    console.log('[revolut] Mode:', useSandbox ? 'SANDBOX' : 'PRODUCTION')

    // Revolut expects amount in minor units (grosze for PLN)
    const amountMinor = Math.round(parseFloat(order.amount) * 100)

    const payload: Record<string, any> = {
      amount: amountMinor,
      currency: 'PLN',
      description: order.description || `Zamówienie ${order.order_number}`,
      merchant_order_ext_ref: order.id,
      customer: {
        email: order.customer_email,
      },
      capture_mode: 'automatic',
      settlement_currency: 'PLN',
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
    }

    if (order.customer_name) {
      const nameParts = order.customer_name.trim().split(/\s+/)
      payload.customer.full_name = order.customer_name
      if (nameParts.length >= 1) payload.customer.first_name = nameParts[0]
      if (nameParts.length >= 2) payload.customer.last_name = nameParts.slice(1).join(' ')
    }

    if (order.customer_phone) {
      payload.customer.phone = order.customer_phone
    }

    console.log('[revolut] Creating order:', JSON.stringify({ ...payload, customer: { ...payload.customer, phone: '***' } }))

    const response = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${revolutSecretKey}`,
        'Revolut-Api-Version': REVOLUT_API_VERSION,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[revolut] API error:', response.status, errorText)
      let errorDetails = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson)
      } catch { /* keep raw text */ }
      throw new Error(`Błąd Revolut (${response.status}): ${errorDetails}`)
    }

    const revolutOrder: RevolutOrderResponse = await response.json()
    console.log('[revolut] Order created:', revolutOrder.id, 'state:', revolutOrder.state)

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_reference: revolutOrder.id,
        payment_source: 'revolut',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[revolut] Failed to update order:', updateError)
    }

    await sendSlackCheckoutNotification(order, supabase)

    console.log('[revolut-create-order] SUCCESS')

    return new Response(
      JSON.stringify({
        success: true,
        orderId: revolutOrder.id,
        publicId: revolutOrder.public_id,
        token: revolutOrder.token,
        checkoutUrl: revolutOrder.checkout_url,
        mode: useSandbox ? 'sandbox' : 'prod',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('[revolut-create-order] ERROR:', error.message, error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
