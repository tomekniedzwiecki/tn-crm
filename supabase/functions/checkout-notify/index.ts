import { createClient } from 'jsr:@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

async function sendSlackNotification(order: any, paymentMethod: string, supabase: any) {
  const webhookUrl = Deno.env.get('SLACK_CHECKOUT_WEBHOOK')
  if (!webhookUrl) {
    console.log('[slack] SLACK_CHECKOUT_WEBHOOK not configured')
    return
  }

  let emailLink = order.customer_email
  if (order.customer_email) {
    const { data: leadMatch } = await supabase
      .from('leads')
      .select('id')
      .eq('email', order.customer_email)
      .maybeSingle()
    if (leadMatch) {
      emailLink = `<https://crm.tomekniedzwiecki.pl/lead?id=${leadMatch.id}|${order.customer_email}>`
    }
  }

  const methodNames: Record<string, string> = {
    'blik': 'BLIK',
    'transfer': 'Przelew',
    'installments': 'Raty',
    'pragmapay': 'PragmaPay',
    'revolut': '💙 Revolut (0% prowizji)',
  }

  const methodName = methodNames[paymentMethod] || paymentMethod

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: paymentMethod === 'revolut' ? '💙 Płatność Revolut' : '🛒 Nowa próba płatności',
          emoji: true
        }
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
          { type: 'mrkdwn', text: `*Metoda:*\n${methodName}` }
        ]
      }
    ]
  }

  // Add note for Revolut
  if (paymentMethod === 'revolut') {
    message.blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⏳ Oczekuje na przelew Revolut → @tomek6n0 | Po otrzymaniu oznacz jako opłacone`
        }
      ]
    } as any)
  }

  // Add discount info
  if (order.discount_amount && order.discount_amount > 0) {
    message.blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `🎟️ Rabat: -${parseFloat(order.discount_amount).toFixed(2)} PLN`
        }
      ]
    } as any)
  }

  // Add customer name/company
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

  console.log('[slack] Checkout notification sent for', paymentMethod)
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase config')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { orderId, paymentMethod } = await req.json()

    if (!orderId) {
      throw new Error('Missing orderId')
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    await sendSlackNotification(order, paymentMethod || 'unknown', supabase)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('[checkout-notify] Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
