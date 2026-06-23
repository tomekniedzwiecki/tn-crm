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

  return `Jesteś doświadczonym STRATEGIEM rynku e-commerce, który przygotowuje raport POTENCJAŁU dla osoby rozważającej wejście w konkretny produkt fizyczny (polski rynek, własny sklep internetowy). Ten produkt został już wstępnie WYSELEKCJONOWANY jako hit, który sprzedaje się właśnie teraz (viral na TikToku z realnym popytem) — więc punktem wyjścia jest „to już działa", a Twoim zadaniem jest pokazać SKALĘ tej szansy i otwartą drogę do zbudowania na nim marki.

CEL RAPORTU: po lekturze czytelnik ma poczuć, że to MOCNY produkt z dużym potencjałem i że warto w to wejść. To przekonanie budujesz FAKTAMI ustawionymi pod kątem szansy — nie pustym hype'em. Prowadzisz wzrok: silny popyt → otwarta luka → co konkretnie ma z tego czytelnik.

PROJEKT:
${fakty.join('\n')}
${blokBramki}
ZADANIE — zrób realny research (web search; szukaj po polsku I angielsku) i zbuduj obraz OKAZJI:
1. Popyt i wielkość rynku w Polsce — pokaż SKALĘ liczbami ze źródeł (trendy wyszukiwań, popularność na Allegro/Amazon, wzrost kategorii, dane branżowe). Wybieraj te ujęcia liczb, które pokazują, że rynek jest duży i rośnie.
2. Konkurencja jako DOWÓD POPYTU: 3-5 sprzedawców tego (lub bardzo podobnego) produktu — po nazwie, z realnymi cenami DETALICZNYMI w zł (Allegro, Amazon.pl, sklepy w niszy, marki na IG/TikToku). Każdy konkurent = dowód, że ludzie JUŻ za to płacą; dla każdego nazwij LUKĘ (brak polskiej marki, słaba prezentacja, anonimowość produktu, zawyżona cena) = otwarte wejście dla tego sklepu.
3. Luka / okno rynkowe — serce raportu: jakiej kombinacji (produkt + grupa + marka + cena) NIE MA dobrze obsłużonej na polskim rynku, więc jest miejsce na nową markę. Przedstaw to jako realne, OTWARTE OKNO — teraz.
4. Trendy i wiatr w żagle: 2-3 zjawiska, które NAPĘDZAJĄ sprzedaż tego produktu (viral, rosnące zainteresowanie, zmiana zachowań kupujących), z liczbami.
5. Marża: jeśli ze źródeł wynika atrakcyjny przedział marży detalicznej — pokaż go jako argument; jeśli nie da się ustalić, pomiń ten wątek (nie eksponuj słabych stron).

JAK BUDOWAĆ PRZEKONANIE (kluczowe):
- Eksponuj to, co MOCNE: popyt, wzrost, skalę, sygnały „ludzie to kupują". Każdy fakt podawaj pod kątem „dlatego to szansa".
- Konkurencję ZAWSZE ustawiaj jako potwierdzenie, że jest tu pieniądz (rynek udowodniony) + ich słabości jako Twoją przewagę — NIGDY jako mur nie do przejścia.
- Na TYM etapie NIE rozwodzisz się nad ryzykami, nasyceniem, niską marżą ani trudnościami i NIE dajesz listy zastrzeżeń. Jeśli jakiś wymiar jest trudny — pomiń go albo przekształć w konstruktywne „na czym zbudować przewagę", nie strasz.
- TON: pewny, rzeczowy, budujący zapał — ale wiarygodny. Bez tandetnych wykrzykników i pustych superlatywów rodem z reklamy („rewelacyjny!!!") — to brzmi jak naciągacz i ZABIJA zaufanie. Siła ma płynąć z konkretnych faktów ustawionych pod szansę.
- ocena_potencjalu: wybierz NAJBARDZIEJ KORZYSTNĄ obronioną ocenę. Skoro to pre-wyselekcjonowany, aktualny hit z realnym popytem — domyślnie „wysoki"; „umiarkowany" tylko, gdy dane naprawdę nie dają podstaw do „wysoki". Graj na „wysoki".

GRANICE (nie do złamania — chronią wiarygodność, nie tonują wymowy):
- NIE zmyślaj liczb ani konkurentów — każda liczba z wyszukiwania (zmyślone dane łatwo obalić i zabijają zaufanie). Jeśli brak twardej liczby — opisz skalę jakościowo, bez podawania zmyślonej cyfry.
- NIE obiecuj gwarantowanego zysku ani konkretnego dochodu czytelnika — pokazujesz POTENCJAŁ rynku, nie obietnicę wyniku.
- Liczby po ludzku („ok. 15–25 tys."), kwoty w zł (ceny zagraniczne przelicz i zaznacz). Indeksy w "zrodla" odwołują się do tablicy "zrodla" (od 1).

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez tekstu przed/po):
{
  "teza": "jedno mocne, konkretne zdanie — najważniejszy powód, dla którego to duża szansa",
  "ocena_potencjalu": "wysoki" | "umiarkowany" | "niszowy",
  "ocena_uzasadnienie": "1-2 zdania budujące przekonanie, dlaczego potencjał jest taki wysoki — na faktach",
  "rynek": {
    "liczba": "skala rynku/popytu pokazana jak największa, ale obroniona ze źródła (np. „15–25 tys. sztuk/mies." lub wartość rynku)",
    "kogo": "np. właściciele psów w Polsce szukający bezpieczeństwa w aucie",
    "opis": "2-3 zdania o tym, jak DUŻY i ROSNĄCY jest rynek/popyt, z liczbami z researchu",
    "zrodla": [1]
  },
  "konkurenci": [
    { "nazwa": "...", "kanal": "Allegro / sklep / Amazon / IG (gdzie sprzedaje)", "cena": "np. od 89 zł", "czym_jest": "jedno zdanie", "luka": "czego mu brakuje = Twoje otwarte wejście", "zrodla": [2] }
  ],
  "luka_rynkowa": "3-4 zdania — jakie OKNO jest teraz otwarte na polską markę z tym produktem i dlaczego to realna szansa",
  "marza": "atrakcyjny przedział marży detalicznej, jeśli wynika ze źródeł; inaczej pomiń ten wątek",
  "sezonowosc": "1-2 zdania — najlepiej „popyt całoroczny / rosnący"; eksponuj stabilność popytu",
  "trendy": [
    { "tytul": "krótki", "opis": "1-2 zdania z liczbą — co NAPĘDZA sprzedaż tego produktu", "zrodla": [3] }
  ],
  "co_to_oznacza": ["3-4 KONKRETNE, motywujące wnioski dla czytelnika — co ta szansa znaczy dla JEGO sklepu: jak wejść, czym wygrać z konkurencją, dlaczego teraz jest dobry moment"],
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
