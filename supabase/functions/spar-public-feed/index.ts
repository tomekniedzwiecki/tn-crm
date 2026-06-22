// spar-public-feed — ostatnie wygenerowane projekty dla strony tomekniedzwiecki.pl/aplikacja
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
// podstrona /aplikacja/inspiracje/ pokazuje wszystko (bez sztucznego limitu);
// strona główna bierze z tego pierwsze kilka pozycji
const FEED_LIMIT = 100
const VIEW_ORDER = ['panel', 'glowna', 'dodatkowa', 'landing', 'podsumowanie'] as const
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

    // Wszystkie realne sesje z grafikami; testowe wykluczone CHYBA że showcase;
    // hidden_from_feed pozwala ręcznie zdjąć projekt z publicznych inspiracji
    const { data, error } = await supabase
      .from('spar_sessions')
      .select('id, verdict, landing_url, is_test, preview_brief, preview_images, created_at')
      .or('is_test.eq.false,showcase.eq.true')
      .eq('hidden_from_feed', false)
      .not('preview_images', 'is', null)
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT * 2)

    if (error) {
      console.error('[spar-public-feed] fetch error:', error)
      return new Response(JSON.stringify({ error: 'blad_serwera' }), { status: 500, headers: cors })
    }

    // Które z tych sesji mają KLIKALNY PROTOTYP (spar_usage kind=prototype) —
    // ta sama bramka co publiczny widok /aplikacja/projekt: „complete" = zielony
    // + strona sprzedażowa (landing_url) + prototyp. Tylko takie karty mogą
    // prowadzić w głąb (inaczej /projekt zwróci 404). 1 zapytanie na całą stronę.
    const rowIds = (data || []).map((r) => r.id as string).filter(Boolean)
    const protoSet = new Set<string>()
    if (rowIds.length) {
      const { data: protos } = await supabase
        .from('spar_usage')
        .select('session_id')
        .eq('kind', 'prototype')
        .in('session_id', rowIds)
      for (const p of protos || []) protoSet.add((p as { session_id: string }).session_id)
    }

    const VIEW_LABELS: Record<string, string> = {
      panel: 'Pulpit', glowna: 'Główna funkcja', dodatkowa: 'Dodatkowa funkcja',
      landing: 'Strona sprzedażowa', podsumowanie: 'Projekt w pigułce',
    }
    interface FeedItem {
      id: string
      nazwa: string
      complete: boolean
      img: string
      generated_at: string
      imgs: { view: string; label: string; url: string }[]
    }
    const projekty: FeedItem[] = []
    const seen = new Set<string>()
    for (const row of data || []) {
      const imgsObj = (row.preview_images || {}) as Record<string, unknown>
      const brief = (row.preview_brief || {}) as Record<string, unknown>
      const nazwa = typeof brief.nazwa === 'string' ? brief.nazwa.slice(0, 60) : null
      if (!nazwa || seen.has(nazwa)) continue
      const imgs: FeedItem['imgs'] = []
      let maxTs = 0
      for (const view of VIEW_ORDER) {
        const url = imgsObj[view]
        if (typeof url !== 'string' || !url) continue
        imgs.push({ view, label: VIEW_LABELS[view] || view, url })
        const m = url.match(/-(\d{13})\.png/)
        if (m) maxTs = Math.max(maxTs, parseInt(m[1], 10))
      }
      if (!imgs.length) continue
      seen.add(nazwa)
      // 1:1 z bramką publicznego /aplikacja/projekt (która odrzuca is_test): tylko
      // realny, zielony, kompletny projekt może prowadzić w głąb — inaczej 404.
      const complete = row.verdict === 'zielony' && !row.is_test && !!row.landing_url && protoSet.has(row.id as string)
      projekty.push({
        id: row.id as string,
        nazwa,
        complete, // zielony + strona + prototyp → karta prowadzi do pełnego /projekt
        img: imgs[0].url, // wsteczna zgodność (strona główna)
        generated_at: maxTs ? new Date(maxTs).toISOString() : (row.created_at as string),
        imgs,
      })
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
