// spar-gtm — go-to-market: playbook pierwszych 50 klientów + pakiet startowy
// (3 reklamy z copy + posty + maile powitalne). Model gpt-5.5.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-gtm --no-verify-jwt
//
// API: stały SYSTEM_PROMPT (zasady + schemat) w roli `system` (cache OpenAI),
// dynamiczny projekt w `user`. Auto-retry ×1 na pustą/niepoprawną/za-słabą
// odpowiedź (jakość: dokładnie 3 reklamy + nagłówki ≤10 słów). Limit 4 gen/sesja.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl','https://www.tomekniedzwiecki.pl','https://crm.tomekniedzwiecki.pl','https://tn-crm.vercel.app','http://localhost:5500','http://127.0.0.1:5500']
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_GENERATIONS = 4
const OPENAI_MODEL = Deno.env.get('SPAR_GTM_MODEL') || 'gpt-5.5'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }
function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }) }

const SYSTEM_PROMPT = `Jesteś szefem sprzedaży i marketingu, który wielokrotnie wprowadzał na polski rynek niszowe narzędzia SaaS B2B od zera do pierwszych klientów. Tworzysz konkretny, wykonalny plan zdobycia pierwszych klientów ORAZ gotowe materiały sprzedażowe. Piszesz po polsku, językiem grupy docelowej, zero korpomowy, zero lania wody.

KONTEKST: właściciel pomysłu po starcie ma sam (z pomocą Tomka) zdobyć pierwszych płacących klientów. Potrzebuje wiedzieć DOKŁADNIE gdzie ich szukać i mieć gotowe materiały, żeby ruszyć pierwszego dnia — nie ogólniki typu „buduj markę w social media".

ZASADY:
- Kanały: podaj KONKRETNE miejsca, gdzie ta grupa już jest (realistyczne nazwy grup FB, fora/subreddity, stowarzyszenia branżowe, katalogi, wydarzenia, miejsca offline). Dla każdego: czemu tam i jaki PIERWSZY ruch wykonać. Bez wymyślania nieistniejących, konkretnych URL-i — opisz miejsce tak, by dało się je znaleźć.
- Skrypty: gotowe do wklejenia, krótkie, ludzkie, bez nachalności. Najpierw wartość, nie „kup".
- Reklamy (DOKŁADNIE 3 różne KĄTY, nie warianty tego samego): każda to spójny koncept — nagłówek (MAKS 10 słów, trafia w ból), tekst główny (2-4 zdania), CTA, oraz brief wizualny (co ma być na grafice/wideo — dla fotografa/projektanta, NIE generujemy obrazu). To reklama narzędzia SaaS (nie e-commerce): ZAKAZ zmyślonej pilności, fałszywych liczb, obietnic „za pobraniem/dostawa 24h". Zamiast tego: konkretny ból + jak narzędzie go zdejmuje + dowód mechaniki.
- ANTY-AI-POETIC: pisz co narzędzie ROBI (akcja + efekt), nie co user ma POCZUĆ. Zero „odzyskaj spokój", „aplikacja, która rozumie".
- Maile powitalne: sekwencja 3, każdy prowadzi do pierwszego realnego użycia / rozmowy.

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown), dokładnie wg schematu:
{
  "playbook": {
    "kanaly": [
      {"miejsce": "konkretna nazwa miejsca", "typ": "grupa Facebook | forum/subreddit | stowarzyszenie | katalog | wydarzenie | offline", "wielkosc": "np. ~28 tys. członków albo „kilkaset firm”", "dlaczego": "1 zdanie", "jak_zaczac": "konkretny pierwszy ruch — 1-2 zdania"}
    ],
    "skrypt_dm": {"kanal": "wiadomość prywatna / komentarz / DM", "tresc": "gotowy tekst pierwszego kontaktu, 3-5 zdań"},
    "skrypt_email": {"temat": "krótki temat", "tresc": "gotowy mail cold, 4-6 zdań"},
    "obiekcje": [{"obiekcja": "realna obiekcja grupy docelowej", "odpowiedz": "krótka, konkretna odpowiedź"}]
  },
  "pakiet": {
    "reklamy": [
      {"koncept": "nazwa kąta, np. „Oszczędność czasu”", "naglowek": "maks 10 słów", "tekst": "2-4 zdania primary text", "cta": "np. Wypróbuj za darmo / Zobacz demo", "wizual_brief": "co na grafice/wideo — konkretnie, dla projektanta", "format": "feed 1:1 | reel 9:16 | karuzela"}
    ],
    "posty": [
      {"haczyk": "pierwsza linia, która zatrzymuje scroll", "tresc": "post organiczny 3-5 zdań", "gdzie": "FB/LinkedIn/grupa branżowa"}
    ],
    "maile_powitalne": [
      {"kiedy": "od razu po zapisie", "temat": "...", "tresc": "3-5 zdań, prowadzi do pierwszego użycia"},
      {"kiedy": "dzień 2", "temat": "...", "tresc": "..."},
      {"kiedy": "dzień 5", "temat": "...", "tresc": "..."}
    ]
  }
}

Wymagania ilościowe: kanaly 4-6, obiekcje 4-5, reklamy DOKŁADNIE 3 (różne kąty, każdy nagłówek ≤10 słów), posty 2-3, maile_powitalne 3.`

function buildUser(brief: Record<string, unknown>, karta: Record<string, unknown>, plan: Record<string, unknown> | null, raport: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ') : ''
  const fakty: string[] = []
  const nazwa = s(brief.nazwa, 80) || 'Narzędzie'
  fakty.push(`Narzędzie: „${nazwa}" — ${s(brief.opis)}`)
  if (karta.problem) fakty.push(`Problem: ${s(karta.problem)}`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`Grupa docelowa: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.kto_placi) fakty.push(`Kto płaci: ${s(karta.kto_placi)}`)
  if (list(karta.ekrany)) fakty.push(`Główne funkcje: ${list(karta.ekrany)}`)
  if (plan && typeof plan.cena === 'number') fakty.push(`Cena: ${plan.cena} ${s(plan.cena_jednostka, 20) || 'zł/mies.'}`)
  if (raport) {
    if (Array.isArray(raport.konkurenci) && raport.konkurenci.length) { const k = (raport.konkurenci as Record<string, unknown>[]).slice(0, 4).map((c) => s(c.nazwa, 40)).filter(Boolean).join(', '); if (k) fakty.push(`Konkurenci z researchu: ${k}`) }
    if (raport.luka_rynkowa) fakty.push(`Okno rynkowe: ${s(raport.luka_rynkowa, 240)}`)
  }
  return `PROJEKT:\n${fakty.join('\n')}\n\nZwróć JSON dokładnie wg schematu z instrukcji systemowej.`
}

// deno-lint-ignore no-explicit-any
function saneGtm(g: any): boolean {
  if (!g || typeof g !== 'object') return false
  const p = g.playbook, k = g.pakiet
  if (!p || typeof p !== 'object' || !Array.isArray(p.kanaly) || p.kanaly.length < 2) return false
  if (!Array.isArray(p.obiekcje) || p.obiekcje.length < 1) return false
  if (!k || typeof k !== 'object' || !Array.isArray(k.reklamy) || k.reklamy.length < 1) return false
  if (!k.reklamy.every((r: unknown) => !!r && typeof r === 'object' && typeof (r as Record<string, unknown>).naglowek === 'string' && typeof (r as Record<string, unknown>).tekst === 'string')) return false
  if (!Array.isArray(k.maile_powitalne) || k.maile_powitalne.length < 1) return false
  return true
}
// Jakość (do decyzji o retry): dokładnie 3 reklamy + każdy nagłówek ≤10 słów.
// deno-lint-ignore no-explicit-any
function qualityGtm(g: any): boolean {
  const r = g?.pakiet?.reklamy
  if (!Array.isArray(r) || r.length !== 3) return false
  return r.every((a: any) => typeof a?.naglowek === 'string' && a.naglowek.trim().split(/\s+/).length <= 10)
}

async function callOnce(apiKey: string, user: string, maxTokens: number): Promise<{ obj: Record<string, unknown> | null; usage: { i: number; c: number; o: number } | null }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: maxTokens, reasoning_effort: 'low' }),
  })
  if (!res.ok) { console.error('[spar-gtm] openai error:', res.status, (await res.text().catch(() => '')).slice(0, 400)); return { obj: null, usage: null } }
  const data = await res.json()
  const u = data?.usage || {}
  const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
  const content = data?.choices?.[0]?.message?.content
  try { return { obj: JSON.parse(content), usage } }
  catch { console.error('[spar-gtm] zły JSON, finish:', data?.choices?.[0]?.finish_reason, String(content).slice(0, 200)); return { obj: null, usage } }
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
    const { data: session, error: sErr } = await supabase.from('spar_sessions').select('id, preview_brief, problem_summary, business_plan, market_report, gtm').eq('id', sessionId).maybeSingle()
    if (sErr) { console.error('[spar-gtm] session fetch error:', sErr); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)
    const karta = session.problem_summary as Record<string, unknown> | null
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    const plan = session.business_plan as Record<string, unknown> | null
    const raport = session.market_report as Record<string, unknown> | null
    if (!karta) return jsonResponse({ error: 'brak_karty' }, 400, cors)
    const existing = session.gtm as Record<string, unknown> | null
    const meta = (existing && existing._meta) as Record<string, unknown> | null
    const genCount = (meta && typeof meta.gen === 'number') ? meta.gen : (existing ? 1 : 0)
    if (existing && !body.force) { const { _meta: _d, ...gtm } = existing; return jsonResponse({ gtm, cached: true }, 200, cors) }
    if (genCount >= MAX_GENERATIONS) { if (existing) { const { _meta: _d, ...gtm } = existing; return jsonResponse({ gtm, cached: true }, 200, cors) } return jsonResponse({ error: 'limit_generacji' }, 429, cors) }
    const { data: lock } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'gtm', p_ttl_sec: 240 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    const user = buildUser(brief, karta, plan, raport)
    const logUsage = async (usage: { i: number; c: number; o: number } | null) => {
      if (!usage) return
      try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.5']; await supabase.from('spar_usage').insert({ session_id: sessionId, kind: 'gtm', model: OPENAI_MODEL, input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o, cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000 }) } catch (uErr) { console.error('[spar-gtm] usage insert error:', uErr) }
    }
    // Auto-retry ×1: ponawiamy gdy odpowiedź niepoprawna LUB nie spełnia jakości
    // (≠3 reklamy / za długi nagłówek). Trzymamy ostatni POPRAWNY jako fallback.
    let best: Record<string, unknown> | null = null
    for (let attempt = 0; attempt < 2; attempt++) {
      const { obj, usage } = await callOnce(OPENAI_API_KEY, user, 9000 + attempt * 1500)
      await logUsage(usage)
      if (obj && saneGtm(obj)) {
        best = obj
        if (qualityGtm(obj)) break
        if (attempt === 0) console.warn('[spar-gtm] próba 1 poniżej jakości (reklamy/nagłówki) — ponawiam')
      } else if (attempt === 0) {
        console.warn('[spar-gtm] próba 1 niepoprawna — ponawiam')
      }
    }
    if (!best) {
      console.error('[spar-gtm] obie próby nieudane')
      await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm' })
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }
    const toSave = { ...best, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL } }
    const { error: uErr } = await supabase.from('spar_sessions').update({ gtm: toSave, updated_at: new Date().toISOString() }).eq('id', sessionId)
    if (uErr) console.error('[spar-gtm] save error:', uErr)
    await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm' })
    return jsonResponse({ gtm: best, cached: false }, 200, cors)
  } catch (e) { console.error('[spar-gtm] ERROR:', e); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
})
