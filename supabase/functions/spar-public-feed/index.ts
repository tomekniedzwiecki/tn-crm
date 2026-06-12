// spar-public-feed — ostatnie wygenerowane projekty dla strony tomekniedzwiecki.pl/stworze
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-public-feed --no-verify-jwt
//
// GET/POST -> { projekty: [{ nazwa, img }] }
// Anon-safe: ZERO PII — tylko nazwa narzędzia z briefu + URL grafiki panelu.
// Frontend dokleja transformację render API (format=webp&width=480) — obrazy
// na stronie głównej są lekkie niezależnie od oryginałów.
// Cache w pamięci instancji 10 min (strona główna nie tłucze bazy).

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }
}

// 60 s (nie 10 min): oznaczenie sesji jako testowej w panelu musi szybko
// zdjąć ją z publicznego feedu na stronie głównej
const CACHE_TTL_MS = 60 * 1000
const FEED_LIMIT = 12
let cache: { data: unknown; at: number } | null = null

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cache.data), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: 'brak_konfiguracji' }), { status: 500, headers: cors })
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // Ostatnie realne sesje z wygenerowanym panelem (testowe wykluczone);
    // bierzemy z zapasem — część może nie mieć panelu albo nazwy
    const { data, error } = await supabase
      .from('spar_sessions')
      .select('preview_brief, preview_images, created_at')
      .eq('is_test', false)
      .not('preview_images', 'is', null)
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT * 3)

    if (error) {
      console.error('[spar-public-feed] fetch error:', error)
      return new Response(JSON.stringify({ error: 'blad_serwera' }), { status: 500, headers: cors })
    }

    const projekty: { nazwa: string; img: string }[] = []
    const seen = new Set<string>()
    for (const row of data || []) {
      const imgs = (row.preview_images || {}) as Record<string, unknown>
      const img = (typeof imgs.panel === 'string' && imgs.panel)
        || (typeof imgs.glowna === 'string' && imgs.glowna) || null
      const brief = (row.preview_brief || {}) as Record<string, unknown>
      const nazwa = typeof brief.nazwa === 'string' ? brief.nazwa.slice(0, 60) : null
      if (!img || !nazwa || seen.has(nazwa)) continue
      seen.add(nazwa)
      projekty.push({ nazwa, img })
      if (projekty.length >= FEED_LIMIT) break
    }

    const payload = { projekty }
    cache = { data: payload, at: Date.now() }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    })
  } catch (e) {
    console.error('[spar-public-feed] ERROR:', e)
    return new Response(JSON.stringify({ error: 'blad_serwera' }), { status: 500, headers: cors })
  }
})
