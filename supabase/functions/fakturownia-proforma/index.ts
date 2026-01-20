import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
          total_price_gross: offer.price * 1.23,
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

    // Return PDF URL
    const pdfUrl = `https://${subdomain}.fakturownia.pl/invoices/${result.id}.pdf?api_token=${apiToken}`

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: result.id,
        pdfUrl: pdfUrl
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
