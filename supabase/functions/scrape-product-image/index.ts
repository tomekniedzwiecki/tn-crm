import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Scrape product image from landing page or e-commerce URL.
 * Checks: og:image, twitter:image, largest <img>, product microdata.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url } = await req.json()
    if (!url) {
      return new Response(JSON.stringify({ success: false, error: 'url required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log(`[scrape] Fetching ${url}`)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TNCrawler/1.0)' }
    })
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const html = await res.text()

    // Spróbuj różnych źródeł
    const candidates: string[] = []

    // 1. og:image (najważniejsze)
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (ogMatch) candidates.push(ogMatch[1])

    // 2. twitter:image
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    if (twMatch) candidates.push(twMatch[1])

    // 3. schema.org product image
    const schemaMatch = html.match(/"image"\s*:\s*"([^"]+)"/i)
    if (schemaMatch) candidates.push(schemaMatch[1])

    // 4. Pierwszy duży <img> (fallback)
    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
    for (const m of imgMatches.slice(0, 5)) {
      const src = m[1]
      if (src && !src.includes('logo') && !src.includes('icon') && !src.startsWith('data:')) {
        candidates.push(src)
      }
    }

    // Znormalizuj URLs (relative → absolute)
    const baseUrl = new URL(url)
    const normalized = candidates.map(c => {
      try {
        if (c.startsWith('//')) return 'https:' + c
        if (c.startsWith('/')) return baseUrl.origin + c
        if (!c.startsWith('http')) return baseUrl.origin + '/' + c
        return c
      } catch { return c }
    }).filter(c => c.startsWith('http'))

    if (normalized.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No image found on page' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log(`[scrape] Found ${normalized.length} candidates, using: ${normalized[0]}`)

    return new Response(
      JSON.stringify({ success: true, image_url: normalized[0], candidates: normalized.slice(0, 5) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[scrape] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
