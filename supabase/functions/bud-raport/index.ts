// bud-raport — raport potencjału rynkowego sklepu z lejka "Zbuduję / Sklep"
// (AWE — e-commerce fizyczny; tomekniedzwiecki.pl/sklep), zakładka „Potencjał rynku".
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy bud-raport --no-verify-jwt
//
// POST { sessionId, force? } ->
//   - jeśli market_report istnieje i !force -> zwraca zapisany (cached)
//   - inaczej: REALNY research przez OpenAI Responses API z narzędziem
//     web_search (konkurenci po nazwach z cenami detalicznymi w zł, wielkość
//     rynku/popyt, trendy, sezonowość — z cytowanymi źródłami, nie z pamięci
//     modelu), zapis w bud_sessions.market_report i zwrot
//
// Charakter raportu: profesjonalny i analityczny, ma pokazywać potencjał
// produktu fizycznego liczbami i źródłami — bez tonu sprzedażowego.
// Wiarygodność budują: realne nazwy konkurentów (sklepy/Allegro/Amazon/IG),
// linki do źródeł i sekcja uczciwych zastrzeżeń. Gate jak bud-plan: wymaga
// karty (zielony werdykt). Limit 3 generacji/sesja (_meta.gen) — web search
// jest droższy niż plan.
//
// Sekrety:
//   OPENAI_API_KEY     — klucz OpenAI (już ustawiony)
//   BUD_RAPORT_MODEL   — opcjonalny override (default: BUD_OPENAI_MODEL -> gpt-5.5)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

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
const OPENAI_MODEL = Deno.env.get('BUD_RAPORT_MODEL') || Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.5'
const MAX_OUTPUT_TOKENS = 10000
// $10 / 1000 wywołań web_search (doliczane do kosztu tokenów)
const WEB_SEARCH_CALL_USD = 0.01

function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function buildRaportPrompt(brief: Record<string, unknown>, karta: Record<string, unknown>, assessment: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v)
    ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ')
    : ''
  const fakty: string[] = []
  fakty.push(`Sklep: „${s(brief.nazwa, 80) || 'Sklep'}" — ${s(brief.opis)}`)
  if (karta.produkt || karta.problem) fakty.push(`Produkt / co sprzedaje: ${s(karta.produkt) || s(karta.problem)}`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`Grupa docelowa: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.kto_placi) fakty.push(`Kto kupuje: ${s(karta.kto_placi)}`)
  if (karta.dzisiejsze_obejscie) fakty.push(`Jak grupa kupuje dziś: ${s(karta.dzisiejsze_obejscie)}`)
  if (list(karta.ekrany)) fakty.push(`Asortyment / zakres pierwszej oferty: ${list(karta.ekrany)}`)
  if (karta.konkurencja) fakty.push(`Konkurencja wskazana w rozmowie: ${s(karta.konkurencja)}`)

  // Reuse wyniku bramki potencjału (bud-assess) jako punktu wyjścia: spójność
  // z tym, co usłyszał rozmówca + mniej duplikatu researchu. Null = stara sesja.
  const a = assessment && typeof assessment === 'object' ? assessment : null
  const aZrodla = a && Array.isArray(a.zrodla)
    ? (a.zrodla as Record<string, unknown>[]).slice(0, 5).map((z) => `${s(z?.tytul, 80)}${z?.url ? ' (' + s(z.url, 120) + ')' : ''}`).filter((x) => x.trim()).join('; ')
    : ''
  const blokBramki = a ? `
PUNKT WYJŚCIA — wstępne badanie rynku w rozmowie JUŻ to ustaliło (zachowaj SPÓJNOŚĆ; potwierdź i POGŁĘB, nie zaczynaj od zera, nie zaprzeczaj bez nowego źródła):
- Konkurencja: ${s(a.konkurencja, 600)}
- Wielkość/charakter rynku: ${s(a.odczyt_rynku, 500)}
- Najmocniejszy kąt / luka: ${s(a.kierunek, 600)}
- Czy ludzie to kupują: ${s(a.platnosc, 400)}${aZrodla ? '\n- Źródła z bramki: ' + aZrodla : ''}
Masz już nazwanych konkurentów i ceny — NIE szukaj ich od zera. Wyszukiwań użyj OSZCZĘDNIE, tylko by UZUPEŁNIĆ (świeższe liczby rynku, brakujący konkurent, trendy, sezonowość) i potwierdzić. Rozwiń powyższe w pełną analizę, spójną z tym, co usłyszał rozmówca.
` : ''

  return `Jesteś analitykiem rynku e-commerce przygotowującym ZWIĘZŁY raport potencjału dla osoby, która chce uruchomić sklep internetowy z produktem FIZYCZNYM w polskiej niszy. Piszesz po polsku, rzeczowo i bez tonu sprzedażowego — jak analityk, nie jak copywriter. Zero wykrzykników, zero superlatyw („niesamowity", „rewolucyjny"); potencjał mają pokazywać LICZBY i FAKTY ze źródeł.

PROJEKT:
${fakty.join('\n')}
${blokBramki}
ZADANIE — zrób realny research w internecie (web search; szukaj po polsku I angielsku) i ustal:
1. Wielkość rynku / popyt w Polsce na tę kategorię produktu (liczby z możliwie świeżych źródeł: GUS, raporty branżowe e-commerce, dane sprzedażowe, popularność na Allegro/Amazon, trendy wyszukiwań).
2. Konkurencję: 3-5 ISTNIEJĄCYCH sprzedawców tego (lub bardzo podobnego) produktu — po nazwie, z realnymi cenami DETALICZNYMI w zł. Szukaj na: Allegro, Amazon.pl, sklepach internetowych w tej niszy, Instagramie/TikToku marek. Dla każdego: co sprzedaje, w jakiej cenie i jaka luka dzieli go od tego sklepu (np. brak polskiej marki, słaba prezentacja, wysoka cena, brak budowania społeczności).
3. Niszę / lukę rynkową: jakiej kombinacji (produkt + grupa + pozycjonowanie + cena) NIE MA dobrze obsłużonej na polskim rynku — to serce raportu, wyprowadź z researchu, nie z życzeń.
4. Sezonowość i trendy: 2-3 zjawiska wspierające (lub komplikujące) sprzedaż tego produktu, z liczbami; zaznacz, czy popyt jest sezonowy.
5. Marżę: orientacyjny przedział marży detalicznej w tej kategorii (ceny detaliczne vs typowy koszt zakupu/produkcji), jeśli da się ustalić ze źródeł.

ZASADY WIARYGODNOŚCI (kluczowe):
- Każda liczba i każdy konkurent musi pochodzić z wyszukiwania; jeśli czegoś nie znalazłeś — napisz wprost „brak danych", nie zmyślaj.
- Każdą liczbę cytuj DOKŁADNIE jak w źródle (jednostka, zakres, czego dotyczy); NIE podawaj w raporcie dwóch sprzecznych wartości dla tej samej wielkości, a danych z różnych źródeł nie mieszaj w jedną liczbę. Nie zawężaj kategorii bez źródła wprost na węższą grupę.
- Bądź uczciwy: jeśli konkurencja jest silna, marża niska albo rynek nasycony, napisz to w zastrzeżeniach. Raport z samymi plusami jest niewiarygodny.
- Liczby podawaj po ludzku („ok. 15–25 tys."), kwoty w zł (ceny zagraniczne przelicz i zaznacz).
- Indeksy w polach "zrodla" odwołują się do tablicy głównej "zrodla" (numeracja od 1).

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez tekstu przed/po):
{
  "teza": "jedno rzeczowe zdanie — najważniejszy wniosek całego researchu",
  "ocena_potencjalu": "wysoki" | "umiarkowany" | "niszowy",
  "ocena_uzasadnienie": "1-2 zdania dlaczego taka ocena",
  "rynek": {
    "liczba": "np. 15–25 tys. sprzedawanych sztuk/mies. lub wartość rynku",
    "kogo": "np. właścicieli psów w Polsce kupujących akcesoria premium",
    "opis": "2-3 zdania o wielkości rynku, popycie i charakterze niszy, z liczbami z researchu",
    "zrodla": [1]
  },
  "konkurenci": [
    { "nazwa": "...", "kanal": "Allegro / sklep / Amazon / IG (gdzie sprzedaje)", "cena": "np. od 89 zł", "czym_jest": "jedno zdanie", "luka": "czego mu brakuje względem tego sklepu", "zrodla": [2] }
  ],
  "luka_rynkowa": "3-4 zdania — jakiej kombinacji nie ma dobrze obsłużonej na polskim rynku i dlaczego to realne okno",
  "marza": "orientacyjny przedział marży detalicznej w tej kategorii lub „brak danych"",
  "sezonowosc": "1-2 zdania o sezonowości popytu lub „popyt całoroczny"",
  "trendy": [
    { "tytul": "krótki", "opis": "1-2 zdania z liczbą", "zrodla": [3] }
  ],
  "co_to_oznacza": ["3-4 rzeczowe wnioski dla TEGO sklepu — co z researchu wynika dla oferty, pozycjonowania i sprzedaży"],
  "zastrzezenia": ["1-3 uczciwe ryzyka lub braki danych"],
  "zrodla": [ { "nr": 1, "tytul": "nazwa źródła", "url": "https://..." } ]
}`
}

// Mail „raport gotowy" wysyła bud-followups (kind 'raport_ready') z celowym
// opóźnieniem ≥15 min od _meta.at — followup „coś się dla Ciebie zbudowało"
// zamiast natychmiastowego maila.

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
      .from('bud_sessions')
      .select('id, preview_brief, problem_summary, market_report, assessment, auth_user_id')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr) {
      console.error('[bud-raport] session fetch error:', sErr)
      return jsonResponse({ error: 'blad_serwera' }, 500, cors)
    }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)

    // Bramka właściciela: sesja przypięta do konta wymaga JWT tego konta
    // (link ?id= przestaje działać jak hasło — lustrzane odbicie bud-chat).
    const authUser = await verifyAuthUser(req, supabase)
    if (ownerDenied(session.auth_user_id as string | null, authUser)) {
      return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
    }

    const karta = session.problem_summary as Record<string, unknown> | null
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    if (!karta) {
      // raport liczymy dopiero, gdy jest karta (werdykt) — gate jak bud-plan
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

    // Lock: research trwa ~2 min i kosztuje ~$0.85 — reload/drugi tab nie może
    // odpalić duplikatu; pending → frontend dociąga syncem
    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'raport', p_ttl_sec: 300 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    // ── OpenAI Responses API + web_search ────────────────────────────────────
    const res = await openaiFetchRetry('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        tools: [{ type: 'web_search' }],
        input: buildRaportPrompt(brief, karta, (session.assessment as Record<string, unknown> | null) ?? null),
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[bud-raport] openai error:', res.status, errText.slice(0, 500))
      await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'raport' })
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

    // Koszt → bud_usage (kind='raport'; tokeny + $0.01 per wyszukiwanie)
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
        console.warn(`[bud-raport] nieznany model w cenniku: ${OPENAI_MODEL} — stawki gpt-5.5`)
        p = prices['gpt-5.5']
      }
      await supabase.from('bud_usage').insert({
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
      console.error('[bud-raport] usage insert error:', uErr)
    }

    const raport = extractJson(text)
    if (!raport || !saneRaport(raport)) {
      console.error('[bud-raport] raport nie przeszedł sanity-check:', String(text).slice(0, 300))
      await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'raport' })
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }

    const toSave = { ...raport, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL, searches: searchCalls } }
    const { error: updErr } = await supabase
      .from('bud_sessions')
      .update({ market_report: toSave, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (updErr) console.error('[bud-raport] save error:', updErr)
    await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'raport' })

    return jsonResponse({ raport, cached: false }, 200, cors)
  } catch (e) {
    console.error('[bud-raport] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
