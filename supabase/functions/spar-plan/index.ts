// spar-plan — wstępny plan przychodu dla lejka "Stworzę" (zakładka „Twój projekt")
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy spar-plan --no-verify-jwt
//
// POST { sessionId, force? } ->
//   - jeśli business_plan istnieje i !force -> zwraca zapisany (cached)
//   - inaczej: liczy plan z karty+briefu przez OpenAI (model jak czat),
//     zapisuje w spar_sessions.business_plan i zwraca
//
// To NIE jest pełny biznes plan — wstępne wyliczenia: model przychodu, cena,
// kamienie 10/25/50 klientów (MRR), kontekst rynku, zwrot wkładu 15 000 zł,
// potencjał roku 2 + założenia. Optymistycznie, ale realnie — liczby muszą
// brzmieć wiarygodnie dla praktyka z branży. force używany po poprawce
// projektu (karta się zmienia); limit 4 generacji/sesja (_meta.gen).

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_GENERATIONS = 4
const OPENAI_MODEL = Deno.env.get('SPAR_OPENAI_MODEL') || 'gpt-5.1'

function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function buildPlanPrompt(brief: Record<string, unknown>, karta: Record<string, unknown>): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v)
    ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ')
    : ''
  const fakty: string[] = []
  fakty.push(`Narzędzie: „${s(brief.nazwa, 80) || 'Narzędzie'}" — ${s(brief.opis)}`)
  if (karta.problem) fakty.push(`Problem: ${s(karta.problem)}`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`Dla kogo: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.kto_placi) fakty.push(`Kto płaci: ${s(karta.kto_placi)}`)
  if (karta.sygnal_budzetu) fakty.push(`Sygnał budżetu z rozmowy: ${s(karta.sygnal_budzetu)}`)
  if (karta.dzisiejsze_obejscie) fakty.push(`Dzisiejsze obejście: ${s(karta.dzisiejsze_obejscie)}`)
  if (list(karta.ekrany)) fakty.push(`Zakres pierwszej wersji: ${list(karta.ekrany)}`)
  if (list(karta.kanaly_dystrybucji)) fakty.push(`Kanały dotarcia: ${list(karta.kanaly_dystrybucji)}`)
  if (karta.konkurencja) fakty.push(`Konkurencja: ${s(karta.konkurencja)}`)
  if (list(karta.ryzyka)) fakty.push(`Ryzyka: ${list(karta.ryzyka)}`)

  return `Jesteś analitykiem, który robi WSTĘPNE wyliczenia przychodu dla narzędzia SaaS w polskiej niszy. Piszesz po polsku, prosto, do praktyka z branży (nie do inwestora).

KARTA PROJEKTU:
${fakty.join('\n')}

KONTEKST WSPÓŁPRACY (stały, nie zmieniaj): narzędzie buduje zespół Tomka za 30 000 zł dzielone pół na pół (właściciel wnosi 15 000 zł). Przez pierwsze ~pół roku Tomek osobiście prowadzi sprzedaż do pierwszych 50 płacących klientów — potem właściciel przejmuje rozkręcony biznes.

ZADANIE: policz wstępny plan przychodu. Ton: optymistyczny, ale REALNY — żadnych kosmicznych liczb; ceny i wielkość rynku muszą brzmieć wiarygodnie dla kogoś, kto zna tę branżę od środka. Jeżeli czegoś nie ma w karcie (typowa cena rynkowa, liczba firm w Polsce), oszacuj z własnej wiedzy o polskim rynku i dopisz to do założeń. Kwoty w zł, zaokrąglone po ludzku (149, nie 147,30).

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown):
{
  "model_przychodu": "nazwa modelu, np. abonament miesięczny per salon",
  "cena": 149,
  "cena_jednostka": "zł/mies.",
  "cena_uzasadnienie": "jedno zdanie skąd ta cena (sygnał budżetu / ceny rynkowe)",
  "kamienie": [
    {"klienci": 10, "mies": 1490, "etap": "pierwsi klienci — sprzedaje Tomek"},
    {"klienci": 25, "mies": 3725, "etap": "rozpędzona sprzedaż"},
    {"klienci": 50, "mies": 7450, "etap": "przejmujesz stery"}
  ],
  "rynek": "1-2 zdania: ile takich firm/odbiorców działa w Polsce i jakim ułamkiem rynku jest 50 klientów (ma pokazać, że 50 to realny, mały kawałek)",
  "zwrot_wkladu": "jedno zdanie: po ilu miesiącach od startu sprzedaży skumulowany przychód przekracza wkład 15 000 zł",
  "rok2_potencjal": "jedno zdanie: realny miesięczny przychód w roku 2 przy utrzymaniu tempa (konkretna kwota zł/mies.)",
  "zalozenia": ["3 do 5 krótkich założeń, w tym te doszacowane z wiedzy o rynku"]
}`
}

// deno-lint-ignore no-explicit-any
function sanePlan(p: any): boolean {
  return !!p && typeof p === 'object'
    && typeof p.model_przychodu === 'string'
    && typeof p.cena === 'number' && p.cena > 0
    && Array.isArray(p.kamienie) && p.kamienie.length >= 2
    && p.kamienie.every((k: unknown) => !!k && typeof k === 'object'
      && typeof (k as Record<string, unknown>).klienci === 'number'
      && typeof (k as Record<string, unknown>).mies === 'number')
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)
    }

    let body: { sessionId?: string; force?: boolean }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors)
    }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, cors)
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: session, error: sErr } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, problem_summary, business_plan')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr) {
      console.error('[spar-plan] session fetch error:', sErr)
      return jsonResponse({ error: 'blad_serwera' }, 500, cors)
    }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)

    const karta = session.problem_summary as Record<string, unknown> | null
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    if (!karta) {
      // plan liczymy dopiero, gdy jest karta (werdykt) — gate jak w spar-image
      return jsonResponse({ error: 'brak_karty' }, 400, cors)
    }

    const existing = session.business_plan as Record<string, unknown> | null
    const meta = (existing && existing._meta) as Record<string, unknown> | null
    const genCount = (meta && typeof meta.gen === 'number') ? meta.gen : (existing ? 1 : 0)

    if (existing && !body.force) {
      const { _meta: _drop, ...plan } = existing
      return jsonResponse({ plan, cached: true }, 200, cors)
    }
    if (genCount >= MAX_GENERATIONS) {
      if (existing) {
        const { _meta: _drop2, ...plan } = existing
        return jsonResponse({ plan, cached: true }, 200, cors)
      }
      return jsonResponse({ error: 'limit_generacji' }, 429, cors)
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: buildPlanPrompt(brief, karta) }],
        response_format: { type: 'json_object' },
        max_completion_tokens: 1600,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[spar-plan] openai error:', res.status, errText.slice(0, 500))
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }
    const data = await res.json()
    // Koszt wywołania → spar_usage (panel TN Aplikacje)
    try {
      const u = data?.usage || {}
      const input = u.prompt_tokens || 0
      const cached = u.prompt_tokens_details?.cached_tokens || 0
      const output = u.completion_tokens || 0
      const prices: Record<string, { i: number; c: number; o: number }> = {
        'gpt-5.5': { i: 5, c: 0.5, o: 30 },
        'gpt-5.1': { i: 1.25, c: 0.125, o: 10 },
      }
      const p = prices[OPENAI_MODEL] || prices['gpt-5.5']
      await supabase.from('spar_usage').insert({
        session_id: sessionId,
        kind: 'plan',
        model: OPENAI_MODEL,
        input_tokens: input,
        cached_tokens: cached,
        output_tokens: output,
        cost_usd: (Math.max(0, input - cached) * p.i + cached * p.c + output * p.o) / 1_000_000,
      })
    } catch (uErr) {
      console.error('[spar-plan] usage insert error:', uErr)
    }
    const content = data?.choices?.[0]?.message?.content
    let plan: Record<string, unknown>
    try {
      plan = JSON.parse(content)
    } catch {
      console.error('[spar-plan] niepoprawny JSON od modelu:', String(content).slice(0, 300))
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }
    if (!sanePlan(plan)) {
      console.error('[spar-plan] plan nie przeszedł sanity-check:', JSON.stringify(plan).slice(0, 300))
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }

    const toSave = { ...plan, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL } }
    const { error: uErr } = await supabase
      .from('spar_sessions')
      .update({ business_plan: toSave, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (uErr) console.error('[spar-plan] save error:', uErr)

    return jsonResponse({ plan, cached: false }, 200, cors)
  } catch (e) {
    console.error('[spar-plan] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
