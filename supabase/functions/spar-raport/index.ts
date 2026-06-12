// spar-raport — raport potencjału rynkowego projektu z lejka "Aplikacja"
// (zakładka „Potencjał rynku" w sparingu).
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy spar-raport --no-verify-jwt
//
// POST { sessionId, force? } ->
//   - jeśli market_report istnieje i !force -> zwraca zapisany (cached)
//   - inaczej: REALNY research przez OpenAI Responses API z narzędziem
//     web_search (konkurenci z nazwami i cenami, wielkość niszy, trendy —
//     z cytowanymi źródłami, nie z pamięci modelu), zapis w
//     spar_sessions.market_report i zwrot
//
// Charakter raportu (decyzja Tomka 2026-06-12): profesjonalny i analityczny,
// ma pokazywać potencjał pomysłu liczbami i źródłami — bez tonu sprzedażowego.
// Wiarygodność budują: realne nazwy konkurentów, linki do źródeł i sekcja
// uczciwych zastrzeżeń. Gate jak spar-plan: wymaga karty (zielony werdykt).
// Limit 3 generacji/sesja (_meta.gen) — web search jest droższy niż plan.
//
// Sekrety:
//   OPENAI_API_KEY     — klucz OpenAI (już ustawiony)
//   SPAR_RAPORT_MODEL  — opcjonalny override (default: SPAR_OPENAI_MODEL -> gpt-5.5)

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
const MAX_GENERATIONS = 3
const OPENAI_MODEL = Deno.env.get('SPAR_RAPORT_MODEL') || Deno.env.get('SPAR_OPENAI_MODEL') || 'gpt-5.5'
const MAX_OUTPUT_TOKENS = 10000
// $10 / 1000 wywołań web_search (doliczane do kosztu tokenów)
const WEB_SEARCH_CALL_USD = 0.01

function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function buildRaportPrompt(brief: Record<string, unknown>, karta: Record<string, unknown>): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v)
    ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ')
    : ''
  const fakty: string[] = []
  fakty.push(`Narzędzie: „${s(brief.nazwa, 80) || 'Narzędzie'}" — ${s(brief.opis)}`)
  if (karta.problem) fakty.push(`Problem, który rozwiązuje: ${s(karta.problem)}`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`Grupa docelowa: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.kto_placi) fakty.push(`Kto płaci: ${s(karta.kto_placi)}`)
  if (karta.dzisiejsze_obejscie) fakty.push(`Jak grupa radzi sobie dziś: ${s(karta.dzisiejsze_obejscie)}`)
  if (list(karta.ekrany)) fakty.push(`Zakres pierwszej wersji: ${list(karta.ekrany)}`)
  if (karta.konkurencja) fakty.push(`Konkurencja wskazana w rozmowie: ${s(karta.konkurencja)}`)

  return `Jesteś analitykiem rynku SaaS przygotowującym ZWIĘZŁY raport potencjału dla pomysłodawcy narzędzia w polskiej niszy. Piszesz po polsku, rzeczowo i bez tonu sprzedażowego — jak analityk, nie jak copywriter. Zero wykrzykników, zero superlatyw („niesamowity", „rewolucyjny"); potencjał mają pokazywać LICZBY i FAKTY ze źródeł.

PROJEKT:
${fakty.join('\n')}

ZADANIE — zrób realny research w internecie (web search; szukaj po polsku I angielsku) i ustal:
1. Wielkość grupy docelowej w Polsce (liczby z możliwie świeżych źródeł: GUS, raporty branżowe, portale branżowe).
2. Konkurencję: 3-5 ISTNIEJĄCYCH narzędzi najbliższych temu projektowi (po nazwie, z realnymi cenami). Najpierw polskie; gdy brak polskich — zagraniczne z adnotacją w polu kraj. Dla każdego: czym jest i jaka luka dzieli je od tego projektu (np. brak polskiej wersji, cena dla dużych firm, kombajn zamiast jednej funkcji).
3. Lukę rynkową: jakiej kombinacji (funkcja + nisza + język + cena) NIE MA na polskim rynku — to serce raportu, wyprowadź z researchu, nie z życzeń.
4. Trendy: 2-3 zjawiska wspierające (lub komplikujące) ten projekt, z liczbami.

ZASADY WIARYGODNOŚCI (kluczowe):
- Każda liczba i każdy konkurent musi pochodzić z wyszukiwania; jeśli czegoś nie znalazłeś — napisz wprost „brak danych", nie zmyślaj.
- Bądź uczciwy: jeśli konkurencja jest silna albo nisza mała, napisz to w zastrzeżeniach. Raport z samymi plusami jest niewiarygodny.
- Liczby podawaj po ludzku („ok. 15–25 tys."), kwoty w zł (ceny zagraniczne przelicz i zaznacz).
- Indeksy w polach "zrodla" odwołują się do tablicy głównej "zrodla" (numeracja od 1).

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez tekstu przed/po):
{
  "teza": "jedno rzeczowe zdanie — najważniejszy wniosek całego researchu",
  "ocena_potencjalu": "wysoki" | "umiarkowany" | "niszowy",
  "ocena_uzasadnienie": "1-2 zdania dlaczego taka ocena",
  "rynek": {
    "liczba": "np. 15–25 tys.",
    "kogo": "np. aktywnych trenerów personalnych w Polsce",
    "opis": "2-3 zdania o wielkości i charakterze niszy, z liczbami z researchu",
    "zrodla": [1]
  },
  "konkurenci": [
    { "nazwa": "...", "kraj": "PL/zagraniczny (skąd)", "cena": "np. od 99 zł/mies.", "czym_jest": "jedno zdanie", "luka": "czego mu brakuje względem tego projektu", "zrodla": [2] }
  ],
  "luka_rynkowa": "3-4 zdania — jakiej kombinacji nie ma na polskim rynku i dlaczego to realne okno",
  "trendy": [
    { "tytul": "krótki", "opis": "1-2 zdania z liczbą", "zrodla": [3] }
  ],
  "co_to_oznacza": ["3-4 rzeczowe wnioski dla TEGO projektu — co z researchu wynika dla pierwszej wersji i sprzedaży"],
  "zastrzezenia": ["1-3 uczciwe ryzyka lub braki danych"],
  "zrodla": [ { "nr": 1, "tytul": "nazwa źródła", "url": "https://..." } ]
}`
}

// Mail „raport gotowy" wysyła spar-followups (kind 'raport_ready') z celowym
// opóźnieniem ≥15 min od _meta.at — decyzja Tomka 2026-06-12: followup
// „coś się dla Ciebie zbudowało" zamiast natychmiastowego maila.

// deno-lint-ignore no-explicit-any
function saneRaport(r: any): boolean {
  return !!r && typeof r === 'object'
    && typeof r.teza === 'string' && r.teza.length > 10
    && !!r.rynek && typeof r.rynek === 'object'
    && Array.isArray(r.konkurenci) && r.konkurenci.length >= 2
    && typeof r.luka_rynkowa === 'string'
    && Array.isArray(r.zrodla) && r.zrodla.length >= 2
}

// Model mimo zakazu potrafi owinąć JSON w płotki / dopisać zdanie
function extractJson(raw: string): Record<string, unknown> | null {
  let text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
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
      .select('id, preview_brief, problem_summary, market_report')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr) {
      console.error('[spar-raport] session fetch error:', sErr)
      return jsonResponse({ error: 'blad_serwera' }, 500, cors)
    }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)

    const karta = session.problem_summary as Record<string, unknown> | null
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    if (!karta) {
      // raport liczymy dopiero, gdy jest karta (werdykt) — gate jak spar-plan
      return jsonResponse({ error: 'brak_karty' }, 400, cors)
    }

    const existing = session.market_report as Record<string, unknown> | null
    const meta = (existing && existing._meta) as Record<string, unknown> | null
    const genCount = (meta && typeof meta.gen === 'number') ? meta.gen : (existing ? 1 : 0)

    if (existing && !body.force) {
      const { _meta: _drop, ...raport } = existing
      return jsonResponse({ raport, cached: true }, 200, cors)
    }
    if (genCount >= MAX_GENERATIONS) {
      if (existing) {
        const { _meta: _drop2, ...raport } = existing
        return jsonResponse({ raport, cached: true }, 200, cors)
      }
      return jsonResponse({ error: 'limit_generacji' }, 429, cors)
    }

    // ── OpenAI Responses API + web_search ────────────────────────────────────
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        tools: [{ type: 'web_search' }],
        input: buildRaportPrompt(brief, karta),
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[spar-raport] openai error:', res.status, errText.slice(0, 500))
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }
    const data = await res.json()

    // Tekst końcowy + liczba wyszukiwań (do kosztu)
    const output = Array.isArray(data?.output) ? data.output : []
    const searchCalls = output.filter((o: Record<string, unknown>) => o?.type === 'web_search_call').length
    let text = typeof data?.output_text === 'string' ? data.output_text : ''
    if (!text) {
      for (const item of output) {
        if (item?.type === 'message' && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c?.type === 'output_text' && typeof c.text === 'string') text += c.text
          }
        }
      }
    }

    // Koszt → spar_usage (kind='raport'; tokeny + $0.01 per wyszukiwanie)
    try {
      const u = data?.usage || {}
      const input = u.input_tokens || 0
      const cached = u.input_tokens_details?.cached_tokens || 0
      const out = u.output_tokens || 0
      const prices: Record<string, { i: number; c: number; o: number }> = {
        'gpt-5.5': { i: 5, c: 0.5, o: 30 },
        'gpt-5.1': { i: 1.25, c: 0.125, o: 10 },
      }
      let p = prices[OPENAI_MODEL]
      if (!p) {
        console.warn(`[spar-raport] nieznany model w cenniku: ${OPENAI_MODEL} — stawki gpt-5.5`)
        p = prices['gpt-5.5']
      }
      await supabase.from('spar_usage').insert({
        session_id: sessionId,
        kind: 'raport',
        model: OPENAI_MODEL,
        input_tokens: input,
        cached_tokens: cached,
        output_tokens: out,
        cost_usd: (Math.max(0, input - cached) * p.i + cached * p.c + out * p.o) / 1_000_000
          + searchCalls * WEB_SEARCH_CALL_USD,
        meta: { web_search_calls: searchCalls },
      })
    } catch (uErr) {
      console.error('[spar-raport] usage insert error:', uErr)
    }

    const raport = extractJson(text)
    if (!raport || !saneRaport(raport)) {
      console.error('[spar-raport] raport nie przeszedł sanity-check:', String(text).slice(0, 300))
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }

    const toSave = { ...raport, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL, searches: searchCalls } }
    const { error: updErr } = await supabase
      .from('spar_sessions')
      .update({ market_report: toSave, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (updErr) console.error('[spar-raport] save error:', updErr)

    return jsonResponse({ raport, cached: false }, 200, cors)
  } catch (e) {
    console.error('[spar-raport] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
