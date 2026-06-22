// bud-economics — model cenowy + unit economics e-commerce + symulacja sprzedaży.
// Lejek "Zbuduję / Sklep" (AWE — e-commerce fizyczny; tomekniedzwiecki.pl/sklep).
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy bud-economics --no-verify-jwt
//
// Model zwraca WEJŚCIA + uzasadnienia (cena, COGS/marża, AOV, CAC, ROAS, zwroty,
// budżet reklam) i cennik/warianty; ARYTMETYKĘ (zysk/szt., payback, breakeven,
// symulacja) liczy frontend w JS.
//
// API: stały SYSTEM_PROMPT (zasady + schemat JSON) w roli `system` — identyczny
// między sesjami, więc OpenAI go cache'uje (tańszy input). Dynamiczny projekt
// idzie w `user`. Auto-retry ×1 na pustą/niepoprawną odpowiedź. Limit 4 gen/sesja.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl','https://www.tomekniedzwiecki.pl','https://crm.tomekniedzwiecki.pl','https://tn-crm.vercel.app','http://localhost:5500','http://127.0.0.1:5500']
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_GENERATIONS = 4
const OPENAI_MODEL = Deno.env.get('BUD_ECONOMICS_MODEL') || 'gpt-5.1'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }
function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }) }

// Model biznesowy — JEDNO źródło (settings.budowanie_model_biznesowy), ładowane raz w handlerze.
let MODEL_BLOCK = ''

// ── Stały prompt systemowy (cache'owalny — bez danych sesji) ──
let SYSTEM_PROMPT = ''

function buildUser(brief: Record<string, unknown>, karta: Record<string, unknown>, plan: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ') : ''
  const fakty: string[] = []
  fakty.push(`Sklep: „${s(brief.nazwa, 80) || 'Sklep'}" — ${s(brief.opis)}`)
  if (karta.produkt || karta.problem) fakty.push(`Produkt / co sprzedaje: ${s(karta.produkt) || s(karta.problem)}`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`Dla kogo: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.kto_placi) fakty.push(`Kto kupuje: ${s(karta.kto_placi)}`)
  if (karta.sygnal_budzetu) fakty.push(`Sygnał ceny/budżetu z rozmowy: ${s(karta.sygnal_budzetu)}`)
  if (list(karta.ekrany)) fakty.push(`Asortyment / zakres pierwszej oferty: ${list(karta.ekrany)}`)
  if (plan && typeof plan.cena === 'number') fakty.push(`GŁÓWNA CENA produktu już pokazana klientowi w zakładce „Plan przychodu": ${plan.cena} ${s(plan.cena_jednostka, 20) || 'zł'} (${s(plan.model_przychodu, 80)}). Wariant „polecany" / cena bazowa MUSI mieć DOKŁADNIE tę cenę; pozostałe warianty (np. zestaw, multipack) zbuduj wokół niej. NIE zmieniaj tej głównej ceny — inaczej zakładki przeczą sobie.`)
  return `PROJEKT:\n${fakty.join('\n')}\n\nZwróć JSON dokładnie wg schematu z instrukcji systemowej.`
}

// deno-lint-ignore no-explicit-any
function saneEconomics(e: any): boolean {
  if (!e || typeof e !== 'object') return false
  const o = e.oferta, w = e.wejscia
  if (!o || typeof o !== 'object' || !Array.isArray(o.warianty) || o.warianty.length < 1) return false
  if (!o.warianty.every((t: unknown) => !!t && typeof t === 'object' && typeof (t as Record<string, unknown>).nazwa === 'string' && typeof (t as Record<string, unknown>).cena === 'number')) return false
  if (!w || typeof w !== 'object') return false
  const num = (x: unknown) => typeof x === 'number' && isFinite(x) && x > 0
  // e-com: cena detaliczna + marża jednostkowa (zł) + koszt zamówienia z reklam + budżet reklam (bez churnu SaaS)
  return num(w.cena_detaliczna) && num(w.marza_jednostkowa) && num(w.koszt_zamowienia) && num(w.budzet_reklam_mies)
}

// Jedno wywołanie OpenAI; zwraca {obj, usage} albo {obj:null}. Loguje koszt każdej próby.
async function callOnce(apiKey: string, user: string, maxTokens: number): Promise<{ obj: Record<string, unknown> | null; usage: { i: number; c: number; o: number } | null }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: (MODEL_BLOCK ? MODEL_BLOCK + '\n\n' : '') + SYSTEM_PROMPT }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: maxTokens, reasoning_effort: 'low' }),
  })
  if (!res.ok) { console.error('[bud-economics] openai error:', res.status, (await res.text().catch(() => '')).slice(0, 400)); return { obj: null, usage: null } }
  const data = await res.json()
  const u = data?.usage || {}
  const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
  const content = data?.choices?.[0]?.message?.content
  try { return { obj: JSON.parse(content), usage } }
  catch { console.error('[bud-economics] zły JSON, finish:', data?.choices?.[0]?.finish_reason, String(content).slice(0, 200)); return { obj: null, usage } }
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
    if (!MODEL_BLOCK) { try { const { data: mb } = await supabase.from('settings').select('value').eq('key', 'budowanie_model_biznesowy').single(); MODEL_BLOCK = (mb as { value?: string } | null)?.value || '' } catch (_e) { /* fallback: pusty blok */ } }
    if (!SYSTEM_PROMPT) { try { const { data: __pd } = await supabase.from('settings').select('key, value').in('key', ['budowanie_prompt_economics_system']); const __pv = (k: string) => ((__pd || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''; SYSTEM_PROMPT = __pv('budowanie_prompt_economics_system') } catch (_e) { /* fallback: puste prompty */ } }
    const { data: session, error: sErr } = await supabase.from('bud_sessions').select('id, preview_brief, problem_summary, business_plan, economics, auth_user_id').eq('id', sessionId).maybeSingle()
    if (sErr) { console.error('[bud-economics] session fetch error:', sErr); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)
    // Bramka właściciela: sesja przypięta do konta wymaga JWT tego konta
    // (link ?id= przestaje działać jak hasło — lustrzane odbicie bud-chat).
    {
      const authUser = await verifyAuthUser(req, supabase)
      if (ownerDenied(session.auth_user_id as string | null, authUser)) {
        return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
      }
    }
    const karta = session.problem_summary as Record<string, unknown> | null
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    const plan = session.business_plan as Record<string, unknown> | null
    if (!karta) return jsonResponse({ error: 'brak_karty' }, 400, cors)
    const existing = session.economics as Record<string, unknown> | null
    const meta = (existing && existing._meta) as Record<string, unknown> | null
    const genCount = (meta && typeof meta.gen === 'number') ? meta.gen : (existing ? 1 : 0)
    if (existing && !body.force) { const { _meta: _d, ...eco } = existing; return jsonResponse({ economics: eco, cached: true }, 200, cors) }
    if (genCount >= MAX_GENERATIONS) { if (existing) { const { _meta: _d, ...eco } = existing; return jsonResponse({ economics: eco, cached: true }, 200, cors) } return jsonResponse({ error: 'limit_generacji' }, 429, cors) }
    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'economics', p_ttl_sec: 180 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    const user = buildUser(brief, karta, plan)
    const logUsage = async (usage: { i: number; c: number; o: number } | null) => {
      if (!usage) return
      try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']; await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'economics', model: OPENAI_MODEL, input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o, cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000 }) } catch (uErr) { console.error('[bud-economics] usage insert error:', uErr) }
    }
    // Auto-retry ×1: druga próba z większym budżetem tokenów
    let eco: Record<string, unknown> | null = null
    for (let attempt = 0; attempt < 2 && !eco; attempt++) {
      const { obj, usage } = await callOnce(OPENAI_API_KEY, user, 6000 + attempt * 2000)
      await logUsage(usage)
      if (obj && saneEconomics(obj)) eco = obj
      else if (attempt === 0) console.warn('[bud-economics] próba 1 nieudana — ponawiam')
    }
    if (!eco) {
      console.error('[bud-economics] obie próby nieudane')
      await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'economics' })
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }
    // Spójność: cena_detaliczna (napędza rachunek) = cena wariantu „polecany".
    try {
      // deno-lint-ignore no-explicit-any
      const warianty = (eco.oferta as any)?.warianty
      if (Array.isArray(warianty) && eco.wejscia) {
        // deno-lint-ignore no-explicit-any
        const ref = warianty.find((t: any) => t && t.polecany && typeof t.cena === 'number') || warianty.find((t: any) => t && typeof t.cena === 'number')
        // #2: spójność cen między zakładkami — kotwiczymy w cenie z „Planu przychodu"
        // (już pokazanej klientowi); polecany wariant + cena_detaliczna = plan.cena.
        const planCena = plan && typeof plan.cena === 'number' ? plan.cena as number : null
        if (ref && planCena) (ref as Record<string, unknown>).cena = planCena
        if (ref) (eco.wejscia as Record<string, unknown>).cena_detaliczna = (ref as Record<string, unknown>).cena
      }
    } catch { /* zostaw */ }

    const toSave = { ...eco, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL } }
    const { error: uErr } = await supabase.from('bud_sessions').update({ economics: toSave, updated_at: new Date().toISOString() }).eq('id', sessionId)
    if (uErr) console.error('[bud-economics] save error:', uErr)
    await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'economics' })
    return jsonResponse({ economics: eco, cached: false }, 200, cors)
  } catch (e) { console.error('[bud-economics] ERROR:', e); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
})
