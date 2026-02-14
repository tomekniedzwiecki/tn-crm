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
    const departmentId = Deno.env.get('fakturownia_department_id')

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
    // Użyj daty zamówienia (created_at) dla daty sprzedaży i wystawienia
    const orderDate = order.created_at ? order.created_at.split('T')[0] : today

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
        sell_date: orderDate, // Data zamówienia
        issue_date: orderDate, // Data zamówienia
        payment_to: orderDate, // Already paid
        payment_type: 'transfer', // Przelew
        status: 'paid', // Oplacona
        paid: brutto.toFixed(2),
        ...buyerData,
        // Seller data - only set if not using department (department has its own seller data)
        ...(departmentId ? {} : {
          seller_name: seller?.name || 'Tomasz Niedzwiecki',
          seller_tax_no: seller?.nip || '',
        }),
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
        // Department ID - required if account has security settings enabled
        ...(departmentId ? { department_id: parseInt(departmentId) } : {}),
      }
    }

    console.log('[fakturownia-invoice] Creating VAT invoice for order:', order.order_number)
    console.log('[fakturownia-invoice] Subdomain:', subdomain)
    console.log('[fakturownia-invoice] Department ID:', departmentId || 'not set')
    console.log('[fakturownia-invoice] Invoice data:', JSON.stringify(invoiceData.invoice, null, 2))

    // Call Fakturownia API
    const response = await fetch(`https://${subdomain}.fakturownia.pl/invoices.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    })

    const responseText = await response.text()
    console.log('[fakturownia-invoice] Raw API response:', responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Nieprawidlowa odpowiedz API: ${responseText.substring(0, 200)}`)
    }

    if (!response.ok) {
      console.error('[fakturownia-invoice] API error - Status:', response.status)
      console.error('[fakturownia-invoice] API error - Response:', responseText)
      // Include raw response in error for debugging
      throw new Error(`Blad Fakturownia (${response.status}): ${responseText.substring(0, 500)}`)
    }

    console.log('[fakturownia-invoice] Invoice created:', result.id, result.number)

    // Get PDF URL
    const pdfUrl = `https://${subdomain}.fakturownia.pl/invoices/${result.id}.pdf?api_token=${apiToken}`

    // Get view URL (for sending to client)
    const viewUrl = `https://${subdomain}.fakturownia.pl/invoice/${result.token}`

    // Send email notification to customer
    if (order.customer_email) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        console.log('[fakturownia-invoice] Triggering automation for:', order.customer_email)

        const triggerResponse = await fetch(`${supabaseUrl}/functions/v1/automation-trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            trigger_type: 'invoice_sent',
            entity_type: 'order',
            entity_id: order.id,
            context: {
              email: order.customer_email,
              clientName: order.customer_name || order.customer_company || 'Cześć',
              invoiceNumber: result.number,
              amount: brutto.toLocaleString('pl-PL', { minimumFractionDigits: 2 }),
              description: order.description || 'Usługa',
              pdfUrl: pdfUrl,
              viewUrl: viewUrl
            }
          })
        })

        const triggerResult = await triggerResponse.json()
        console.log('[fakturownia-invoice] Automation trigger result:', triggerResult)
      } catch (emailError) {
        console.warn('[fakturownia-invoice] Automation trigger error (invoice still created):', emailError)
      }
    }

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
    // Ensure error message is always a string
    let errorMessage = 'Wystapil nieznany blad'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else {
      try {
        errorMessage = JSON.stringify(error)
      } catch (e) {
        errorMessage = String(error)
      }
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
