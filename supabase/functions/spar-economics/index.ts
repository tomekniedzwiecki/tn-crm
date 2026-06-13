// spar-economics — model cenowy + unit economics + symulacja do 50 klientów.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-economics --no-verify-jwt
//
// Model zwraca WEJŚCIA + uzasadnienia (cena, marża, CAC, churn, budżet) i cennik;
// ARYTMETYKĘ (LTV, payback, breakeven, symulacja) liczy frontend w JS.
//
// API: stały SYSTEM_PROMPT (zasady + schemat JSON) w roli `system` — identyczny
// między sesjami, więc OpenAI go cache'uje (tańszy input). Dynamiczny projekt
// idzie w `user`. Auto-retry ×1 na pustą/niepoprawną odpowiedź. Limit 4 gen/sesja.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl','https://www.tomekniedzwiecki.pl','https://crm.tomekniedzwiecki.pl','https://tn-crm.vercel.app','http://localhost:5500','http://127.0.0.1:5500']
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_GENERATIONS = 4
const OPENAI_MODEL = Deno.env.get('SPAR_ECONOMICS_MODEL') || 'gpt-5.1'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }
function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }) }

// ── Stały prompt systemowy (cache'owalny — bez danych sesji) ──
const SYSTEM_PROMPT = `Jesteś doświadczonym operatorem SaaS i analitykiem unit economics dla polskich nisz. Projektujesz model cenowy i realne wejścia do rachunku opłacalności narzędzia, które dopiero powstaje. Piszesz po polsku, do praktyka — konkretnie, bez korpomowy.

KONTEKST (stały): narzędzie buduje zespół Tomka za 30 000 zł (właściciel wnosi 15 000 zł, drugie 15 000 zł Tomek). Przez ~pół roku Tomek prowadzi sprzedaż do pierwszych 50 płacących klientów. Cel: pokazać właścicielowi, że to się SPINA finansowo — uczciwie, realnymi liczbami, nie hurraoptymizmem.

ZADANIE: zaprojektuj cennik (2-3 tiery) i podaj REALNE wejścia do rachunku. NIE licz LTV, payback ani symulacji — to policzy aplikacja. Twoja rola: wiarygodne liczby i ich uzasadnienie z realiów polskiego rynku SaaS B2B.

Zasady liczb:
- Ceny zaokrąglone po ludzku (99, 149, 199, 299), spójne z sygnałem budżetu i cenami w tej niszy.
- CAC: oszacuj realnie dla polskiego B2B z reklam Meta/Google — typowo koszt leada 15-40 zł i konwersja lead→klient 5-12%, co daje CAC ~150-600 zł. Uzasadnij krótko skąd liczba.
- Churn miesięczny: realny dla małego B2B SaaS w tej niszy (zwykle 2-6%/mies.). Uzasadnij.
- Marża brutto SaaS: zwykle 80-90%.
- Budżet reklam/mies.: realny dla jednoosobowego startu (1000-3000 zł).

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown), dokładnie wg schematu:
{
  "cennik": {
    "model": "krótko, np. abonament miesięczny per gabinet",
    "trial_dni": 14,
    "rabat_roczny_proc": 20,
    "tiery": [
      {"nazwa": "Start", "cena": 99, "jednostka": "zł/mies.", "dla_kogo": "1 zdanie", "funkcje": ["3-5 krótkich pozycji"], "polecany": false},
      {"nazwa": "Pro", "cena": 199, "jednostka": "zł/mies.", "dla_kogo": "1 zdanie", "funkcje": ["..."], "polecany": true}
    ],
    "expansion": "1-2 zdania: jak rośnie przychód z jednego klienta w czasie (upgrade tieru, dodatkowe stanowiska, dodatki)"
  },
  "wejscia": {
    "cena_bazowa": 199,
    "marza_proc": 85,
    "cac": 280,
    "cac_uzasadnienie": "1 zdanie, np. przy CPL ~28 zł i konwersji lead→klient ~10%",
    "churn_mies_proc": 4,
    "churn_uzasadnienie": "1 zdanie",
    "budzet_reklam_mies": 1500,
    "koszt_budowy": 30000
  },
  "zalozenia": ["3-5 krótkich, uczciwych założeń, w tym te doszacowane z wiedzy o rynku"],
  "komentarz": "1-2 zdania: czy i dlaczego to się spina (albo co jest największym ryzykiem dla opłacalności)"
}

cena_bazowa MUSI równać się cenie tieru oznaczonego "polecany": true.`

function buildUser(brief: Record<string, unknown>, karta: Record<string, unknown>, plan: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ') : ''
  const fakty: string[] = []
  fakty.push(`Narzędzie: „${s(brief.nazwa, 80) || 'Narzędzie'}" — ${s(brief.opis)}`)
  if (karta.problem) fakty.push(`Problem: ${s(karta.problem)}`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`Dla kogo: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.kto_placi) fakty.push(`Kto płaci: ${s(karta.kto_placi)}`)
  if (karta.sygnal_budzetu) fakty.push(`Sygnał budżetu z rozmowy: ${s(karta.sygnal_budzetu)}`)
  if (list(karta.ekrany)) fakty.push(`Zakres pierwszej wersji: ${list(karta.ekrany)}`)
  if (plan && typeof plan.cena === 'number') fakty.push(`Wstępna cena z planu przychodu: ${plan.cena} ${s(plan.cena_jednostka, 20) || 'zł/mies.'} (${s(plan.model_przychodu, 80)})`)
  return `PROJEKT:\n${fakty.join('\n')}\n\nZwróć JSON dokładnie wg schematu z instrukcji systemowej.`
}

// deno-lint-ignore no-explicit-any
function saneEconomics(e: any): boolean {
  if (!e || typeof e !== 'object') return false
  const c = e.cennik, w = e.wejscia
  if (!c || typeof c !== 'object' || !Array.isArray(c.tiery) || c.tiery.length < 1) return false
  if (!c.tiery.every((t: unknown) => !!t && typeof t === 'object' && typeof (t as Record<string, unknown>).nazwa === 'string' && typeof (t as Record<string, unknown>).cena === 'number')) return false
  if (!w || typeof w !== 'object') return false
  const num = (x: unknown) => typeof x === 'number' && isFinite(x) && x > 0
  return num(w.cena_bazowa) && num(w.marza_proc) && num(w.cac) && num(w.churn_mies_proc) && num(w.budzet_reklam_mies)
}

// Jedno wywołanie OpenAI; zwraca {obj, usage} albo {obj:null}. Loguje koszt każdej próby.
async function callOnce(apiKey: string, user: string, maxTokens: number): Promise<{ obj: Record<string, unknown> | null; usage: { i: number; c: number; o: number } | null }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: maxTokens, reasoning_effort: 'low' }),
  })
  if (!res.ok) { console.error('[spar-economics] openai error:', res.status, (await res.text().catch(() => '')).slice(0, 400)); return { obj: null, usage: null } }
  const data = await res.json()
  const u = data?.usage || {}
  const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
  const content = data?.choices?.[0]?.message?.content
  try { return { obj: JSON.parse(content), usage } }
  catch { console.error('[spar-economics] zły JSON, finish:', data?.choices?.[0]?.finish_reason, String(content).slice(0, 200)); return { obj: null, usage } }
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY'); const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)
    let body: { sessionId?: string; force?: boolean }
    try { body = await req.json() } catch { return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors) }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, cors)
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: session, error: sErr } = await supabase.from('spar_sessions').select('id, preview_brief, problem_summary, business_plan, economics').eq('id', sessionId).maybeSingle()
    if (sErr) { console.error('[spar-economics] session fetch error:', sErr); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)
    const karta = session.problem_summary as Record<string, unknown> | null
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    const plan = session.business_plan as Record<string, unknown> | null
    if (!karta) return jsonResponse({ error: 'brak_karty' }, 400, cors)
    const existing = session.economics as Record<string, unknown> | null
    const meta = (existing && existing._meta) as Record<string, unknown> | null
    const genCount = (meta && typeof meta.gen === 'number') ? meta.gen : (existing ? 1 : 0)
    if (existing && !body.force) { const { _meta: _d, ...eco } = existing; return jsonResponse({ economics: eco, cached: true }, 200, cors) }
    if (genCount >= MAX_GENERATIONS) { if (existing) { const { _meta: _d, ...eco } = existing; return jsonResponse({ economics: eco, cached: true }, 200, cors) } return jsonResponse({ error: 'limit_generacji' }, 429, cors) }
    const { data: lock } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'economics', p_ttl_sec: 180 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    const user = buildUser(brief, karta, plan)
    const logUsage = async (usage: { i: number; c: number; o: number } | null) => {
      if (!usage) return
      try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']; await supabase.from('spar_usage').insert({ session_id: sessionId, kind: 'economics', model: OPENAI_MODEL, input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o, cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000 }) } catch (uErr) { console.error('[spar-economics] usage insert error:', uErr) }
    }
    // Auto-retry ×1: druga próba z większym budżetem tokenów
    let eco: Record<string, unknown> | null = null
    for (let attempt = 0; attempt < 2 && !eco; attempt++) {
      const { obj, usage } = await callOnce(OPENAI_API_KEY, user, 6000 + attempt * 2000)
      await logUsage(usage)
      if (obj && saneEconomics(obj)) eco = obj
      else if (attempt === 0) console.warn('[spar-economics] próba 1 nieudana — ponawiam')
    }
    if (!eco) {
      console.error('[spar-economics] obie próby nieudane')
      await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'economics' })
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }
    // Spójność: cena_bazowa (napędza rachunek i kafel) = cena tieru „polecany".
    try {
      // deno-lint-ignore no-explicit-any
      const tiery = (eco.cennik as any)?.tiery
      if (Array.isArray(tiery) && eco.wejscia) {
        // deno-lint-ignore no-explicit-any
        const ref = tiery.find((t: any) => t && t.polecany && typeof t.cena === 'number') || tiery.find((t: any) => t && typeof t.cena === 'number')
        if (ref) (eco.wejscia as Record<string, unknown>).cena_bazowa = ref.cena
      }
    } catch { /* zostaw */ }

    const toSave = { ...eco, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL } }
    const { error: uErr } = await supabase.from('spar_sessions').update({ economics: toSave, updated_at: new Date().toISOString() }).eq('id', sessionId)
    if (uErr) console.error('[spar-economics] save error:', uErr)
    await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'economics' })
    return jsonResponse({ economics: eco, cached: false }, 200, cors)
  } catch (e) { console.error('[spar-economics] ERROR:', e); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
})
