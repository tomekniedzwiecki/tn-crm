// Edge Function: Proxy PDF faktury z Fakturowni
//
// Public token URL Fakturowni przekierowuje na login dla anonimowych użytkowników
// (token sharing aktywuje się dopiero po wysyłce mailem do klienta).
// Serwer pobiera PDF z api_token (server-side) i streamuje do klienta.
//
// Wymaga department_id (konto ma security/department włączone).
// Pobierany ze secret `fakturownia_department_id` lub z faktury JSON jako fallback.
//
// Auth: wymaga zalogowanego użytkownika Supabase (admin CRM).
// Użycie: GET /functions/v1/invoice-pdf?invoice_id=492809828
//         Authorization: Bearer <user_jwt>

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Auth — sprawdź że użytkownik jest zalogowany w Supabase
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': authHeader, 'apikey': supabaseAnonKey! }
    })
    if (!userResp.ok) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Parse params
    const url = new URL(req.url)
    const invoiceId = url.searchParams.get('invoice_id')
    if (!invoiceId || !/^\d+$/.test(invoiceId)) {
      return new Response(JSON.stringify({ error: 'invoice_id required (numeric)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Konfiguracja Fakturowni
    const apiToken = Deno.env.get('fakturownia_api_token')
    let subdomain = Deno.env.get('fakturownia_subdomain')
    if (!apiToken || !subdomain) throw new Error('Brak konfiguracji Fakturownia')
    subdomain = subdomain.replace(/^https?:\/\//, '').replace(/\.fakturownia\.pl.*$/, '').trim()

    // 4. Department ID — z secrets lub fallback do invoice JSON
    let departmentId = Deno.env.get('fakturownia_department_id')
    if (!departmentId) {
      const jsonResp = await fetch(`https://${subdomain}.fakturownia.pl/invoices/${invoiceId}.json?api_token=${apiToken}`)
      if (jsonResp.ok) {
        const inv = await jsonResp.json()
        if (inv.department_id) departmentId = String(inv.department_id)
      }
    }

    // 5. Pobierz PDF
    const fakturUrl = departmentId
      ? `https://${subdomain}.fakturownia.pl/invoices/${invoiceId}.pdf?api_token=${apiToken}&department_id=${departmentId}`
      : `https://${subdomain}.fakturownia.pl/invoices/${invoiceId}.pdf?api_token=${apiToken}`

    const pdfResp = await fetch(fakturUrl)
    if (!pdfResp.ok) {
      const errText = await pdfResp.text()
      return new Response(JSON.stringify({ error: `Fakturownia ${pdfResp.status}: ${errText.substring(0, 200)}` }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Sanity check: response IS PDF (czasem Fakturownia zwraca 200 z HTML)
    const ct = pdfResp.headers.get('content-type') || ''
    if (!ct.includes('pdf')) {
      const buf = await pdfResp.arrayBuffer()
      const isPdfMagic = buf.byteLength >= 4 && new Uint8Array(buf.slice(0, 4)).every((b, i) => [0x25, 0x50, 0x44, 0x46][i] === b)
      if (!isPdfMagic) {
        return new Response(JSON.stringify({ error: `Fakturownia zwróciła non-PDF (content-type: ${ct})` }), {
          status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(buf, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="faktura-${invoiceId}.pdf"`,
          'Cache-Control': 'private, max-age=300'
        }
      })
    }

    return new Response(pdfResp.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="faktura-${invoiceId}.pdf"`,
        'Cache-Control': 'private, max-age=300'
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[invoice-pdf] Error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
