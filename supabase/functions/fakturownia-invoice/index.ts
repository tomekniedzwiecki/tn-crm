// Edge Function: Wystawianie Faktury VAT w Fakturownia.pl

const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'http://localhost:3000',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get secrets
    const apiToken = Deno.env.get('fakturownia_api_token')
    let subdomain = Deno.env.get('fakturownia_subdomain')

    if (!apiToken || !subdomain) {
      throw new Error('Brak konfiguracji Fakturownia w secrets')
    }

    // Normalize subdomain
    subdomain = subdomain
      .replace(/^https?:\/\//, '')
      .replace(/\.fakturownia\.pl.*$/, '')
      .trim()

    // Parse request body
    const { order, seller } = await req.json()

    if (!order) {
      throw new Error('Brak danych zamowienia')
    }

    // Prepare invoice data
    const today = new Date().toISOString().split('T')[0]

    // Calculate netto from brutto (23% VAT)
    const brutto = parseFloat(order.amount)
    const netto = brutto / 1.23
    const vat = brutto - netto

    // Build buyer info
    let buyerName = order.customer_company || order.customer_name || order.customer_email

    // If company and NIP, add proper business info
    const buyerData: Record<string, string> = {
      buyer_name: buyerName,
      buyer_email: order.customer_email || '',
    }

    if (order.customer_nip) {
      buyerData.buyer_tax_no = order.customer_nip
    }

    if (order.customer_address) {
      // Parse address if provided as object
      if (typeof order.customer_address === 'object') {
        buyerData.buyer_street = order.customer_address.street || ''
        buyerData.buyer_post_code = order.customer_address.postal_code || ''
        buyerData.buyer_city = order.customer_address.city || ''
        buyerData.buyer_country = order.customer_address.country || 'Polska'
      } else {
        buyerData.buyer_street = order.customer_address
      }
    }

    const invoiceData = {
      api_token: apiToken,
      invoice: {
        kind: 'vat', // Faktura VAT
        number: null, // Auto-generated
        sell_date: order.paid_at ? order.paid_at.split('T')[0] : today,
        issue_date: today,
        payment_to: today, // Already paid
        payment_type: 'transfer', // Przelew
        status: 'paid', // Oplacona
        paid: brutto.toFixed(2),
        ...buyerData,
        seller_name: seller?.name || 'Tomasz Niedzwiecki',
        seller_tax_no: seller?.nip || '',
        positions: [{
          name: order.description || 'Usluga',
          tax: 23,
          total_price_gross: brutto,
          quantity: 1
        }],
        // Additional fields
        buyer_phone: order.customer_phone || '',
        description: `Zamowienie ${order.order_number || ''}`,
        internal_note: `Order ID: ${order.id}`,
      }
    }

    console.log('[fakturownia-invoice] Creating VAT invoice for order:', order.order_number)

    // Call Fakturownia API
    const response = await fetch(`https://${subdomain}.fakturownia.pl/invoices.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('[fakturownia-invoice] API error:', result)
      throw new Error(result.message || result.error || 'Blad API Fakturownia')
    }

    console.log('[fakturownia-invoice] Invoice created:', result.id, result.number)

    // Get PDF URL
    const pdfUrl = `https://${subdomain}.fakturownia.pl/invoices/${result.id}.pdf?api_token=${apiToken}`

    // Get view URL (for sending to client)
    const viewUrl = `https://${subdomain}.fakturownia.pl/invoice/${result.token}`

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: result.id,
        invoiceNumber: result.number,
        pdfUrl: pdfUrl,
        viewUrl: viewUrl,
        token: result.token
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('[fakturownia-invoice] Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
