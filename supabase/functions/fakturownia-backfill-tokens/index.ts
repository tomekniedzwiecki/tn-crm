// Edge Function: Backfill invoice_token dla starych faktur w orders
// Pobiera tokeny z Fakturownia API dla zamówień które mają invoice_id ale nie mają invoice_token

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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const log: string[] = []
  const results = { total: 0, updated: 0, failed: 0, skipped: 0, details: [] as any[] }

  try {
    const apiToken = Deno.env.get('fakturownia_api_token')
    let subdomain = Deno.env.get('fakturownia_subdomain')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!apiToken || !subdomain) throw new Error('Brak konfiguracji Fakturownia w secrets')
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Brak SUPABASE_URL / SERVICE_ROLE_KEY')

    subdomain = subdomain.replace(/^https?:\/\//, '').replace(/\.fakturownia\.pl.*$/, '').trim()

    // 1. Pobierz orders z invoice_id ale bez invoice_token
    const ordersResp = await fetch(
      `${supabaseUrl}/rest/v1/orders?invoice_id=not.is.null&invoice_token=is.null&select=id,order_number,invoice_id,invoice_number`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    )

    if (!ordersResp.ok) {
      throw new Error(`Supabase fetch error (${ordersResp.status}): ${await ordersResp.text()}`)
    }

    const orders = await ordersResp.json()
    results.total = orders.length
    log.push(`[backfill] Znaleziono ${orders.length} zamówień do uzupełnienia`)

    // 2. Dla każdego pobierz token z Fakturowni i update'uj
    for (const order of orders) {
      try {
        const apiUrl = `https://${subdomain}.fakturownia.pl/invoices/${order.invoice_id}.json?api_token=${apiToken}`
        const fakturResp = await fetch(apiUrl)

        if (!fakturResp.ok) {
          const errText = await fakturResp.text()
          log.push(`[FAIL] order ${order.order_number} (invoice ${order.invoice_id}): ${fakturResp.status} ${errText.substring(0, 100)}`)
          results.failed++
          results.details.push({ order_number: order.order_number, invoice_id: order.invoice_id, status: 'failed', reason: `${fakturResp.status} ${errText.substring(0, 100)}` })
          continue
        }

        const invoice = await fakturResp.json()

        if (!invoice.token) {
          log.push(`[SKIP] order ${order.order_number}: brak pola token w response`)
          results.skipped++
          results.details.push({ order_number: order.order_number, invoice_id: order.invoice_id, status: 'skipped', reason: 'no token in response' })
          continue
        }

        // Update orders
        const updateResp = await fetch(
          `${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ invoice_token: invoice.token })
          }
        )

        if (!updateResp.ok) {
          log.push(`[FAIL UPDATE] order ${order.order_number}: ${updateResp.status} ${await updateResp.text()}`)
          results.failed++
          results.details.push({ order_number: order.order_number, invoice_id: order.invoice_id, status: 'failed', reason: 'db update failed' })
          continue
        }

        log.push(`[OK] order ${order.order_number} → token ${invoice.token.substring(0, 8)}...`)
        results.updated++
        results.details.push({ order_number: order.order_number, invoice_id: order.invoice_id, status: 'updated', token_preview: invoice.token.substring(0, 8) + '...' })

        // Rate limit ~700ms — Fakturownia ma ~100req/min limit
        await sleep(700)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        log.push(`[ERR] order ${order.order_number}: ${msg}`)
        results.failed++
        results.details.push({ order_number: order.order_number, invoice_id: order.invoice_id, status: 'error', reason: msg })
      }
    }

    log.push(`[DONE] total=${results.total} updated=${results.updated} failed=${results.failed} skipped=${results.skipped}`)

    return new Response(
      JSON.stringify({ success: true, ...results, log }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[fakturownia-backfill-tokens] Error:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, ...results, log }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
