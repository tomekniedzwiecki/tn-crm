 

// Allowed origins for CORS
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

    // Normalize subdomain - extract just the subdomain part if full URL/domain provided
    subdomain = subdomain
      .replace(/^https?:\/\//, '')  // Remove http:// or https://
      .replace(/\.fakturownia\.pl.*$/, '')  // Remove .fakturownia.pl and anything after
      .trim()

    // Parse request body
    const { buyer, offer, validUntil } = await req.json()

    if (!buyer || !offer) {
      throw new Error('Brak wymaganych danych (buyer, offer)')
    }

    // Prepare invoice data
    const today = new Date().toISOString().split('T')[0]
    const paymentDate = validUntil ? new Date(validUntil).toISOString().split('T')[0] : today

    const invoiceData = {
      api_token: apiToken,
      invoice: {
        kind: 'proforma',
        sell_date: today,
        issue_date: today,
        payment_to: paymentDate,
        buyer_name: buyer.company || buyer.name || buyer.email,
        buyer_email: buyer.email || '',
        buyer_tax_no: buyer.nip || '',
        buyer_post_code: buyer.postCode || '',
        buyer_city: buyer.city || '',
        buyer_street: buyer.street || '',
        positions: [{
          name: offer.name + (offer.description ? ' - ' + offer.description.substring(0, 50) : ''),
          tax: 23,
          total_price_gross: offer.price, // offer.price is already gross (brutto)
          quantity: 1
        }]
      }
    }

    // Call Fakturownia API
    const response = await fetch(`https://${subdomain}.fakturownia.pl/invoices.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Błąd API Fakturownia')
    }

    // Return public URLs using invoice token (no api_token exposure)
    const pdfUrl = `https://${subdomain}.fakturownia.pl/invoice/${result.token}.pdf`
    const viewUrl = `https://${subdomain}.fakturownia.pl/invoice/${result.token}`

    // Trigger automation for email notification
    if (buyer.email) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        console.log('[fakturownia-proforma] Triggering automation for:', buyer.email)

        const triggerResponse = await fetch(`${supabaseUrl}/functions/v1/automation-trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            trigger_type: 'proforma_generated',
            entity_type: 'offer',
            entity_id: offer.id || result.id,
            context: {
              email: buyer.email,
              clientName: buyer.name || buyer.company || 'Cześć',
              offerName: offer.name,
              amount: offer.price?.toLocaleString('pl-PL', { minimumFractionDigits: 2 }) || '',
              pdfUrl: pdfUrl,
              viewUrl: viewUrl,
              invoiceNumber: result.number
            }
          })
        })

        const triggerResult = await triggerResponse.json()
        console.log('[fakturownia-proforma] Automation trigger result:', triggerResult)
      } catch (emailError) {
        console.warn('[fakturownia-proforma] Automation trigger error (proforma still created):', emailError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: result.id,
        invoiceNumber: result.number,
        pdfUrl: pdfUrl,
        viewUrl: viewUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Fakturownia error:', error)
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
