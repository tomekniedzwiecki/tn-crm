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
import { verifyAuthUser, ownerDenied } from "../_shared/spar-owner.ts";

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

// Model biznesowy — JEDNO źródło (settings.aplikacja_model_biznesowy), ładowane raz w handlerze.
let MODEL_BLOCK = ''

// Stały prompt systemowy (cache'owalny — bez danych sesji)
let SYSTEM_PROMPT = ''

function buildUser(brief: Record<string, unknown>, karta: Record<string, unknown>, assessment: Record<string, unknown> | null = null): string {
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
  // Spójność liczb: badanie rynku z bramki (to samo, co rozmówca usłyszał w czacie) —
  // pole „rynek" w planie MA być z tym zgodne, nie wymyślone od nowa.
  if (assessment && typeof assessment.odczyt_rynku === 'string') fakty.push(`Badanie rynku z rozmowy (UŻYJ tych liczb/przedziałów w polu „rynek", nie podawaj innych): ${s(assessment.odczyt_rynku, 400)}`)
  return `KARTA PROJEKTU:\n${fakty.join('\n')}\n\nZwróć JSON dokładnie wg schematu z instrukcji systemowej.`
}

// Jedno wywołanie; zwraca {obj, usage}. Loguje koszt każdej próby osobno.
async function callOnce(apiKey: string, user: string, maxTokens: number): Promise<{ obj: Record<string, unknown> | null; usage: { i: number; c: number; o: number } | null }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: (MODEL_BLOCK ? MODEL_BLOCK + '\n\n' : '') + SYSTEM_PROMPT }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: maxTokens, reasoning_effort: 'low' }),
  })
  if (!res.ok) { console.error('[spar-plan] openai error:', res.status, (await res.text().catch(() => '')).slice(0, 400)); return { obj: null, usage: null } }
  const data = await res.json()
  const u = data?.usage || {}
  const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
  const content = data?.choices?.[0]?.message?.content
  try { return { obj: JSON.parse(content), usage } }
  catch { console.error('[spar-plan] niepoprawny JSON, finish:', data?.choices?.[0]?.finish_reason, String(content).slice(0, 200)); return { obj: null, usage } }
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
    if (!MODEL_BLOCK) { try { const { data: mb } = await supabase.from('settings').select('value').eq('key', 'aplikacja_model_biznesowy').single(); MODEL_BLOCK = (mb as { value?: string } | null)?.value || '' } catch (_e) { /* fallback: pusty blok */ } }
    if (!SYSTEM_PROMPT) { try { const { data: __pd } = await supabase.from('settings').select('key, value').in('key', ['aplikacja_prompt_plan_system']); const __pv = (k: string) => ((__pd || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''; SYSTEM_PROMPT = __pv('aplikacja_prompt_plan_system') } catch (_e) { /* fallback: puste prompty */ } }
    const { data: session, error: sErr } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, problem_summary, business_plan, assessment, auth_user_id')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr) {
      console.error('[spar-plan] session fetch error:', sErr)
      return jsonResponse({ error: 'blad_serwera' }, 500, cors)
    }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)

    // Bramka właściciela: sesja przypięta do konta wymaga JWT tego konta
    // (link ?id= przestaje działać jak hasło — lustrzane odbicie spar-chat).
    const authUser = await verifyAuthUser(req, supabase)
    if (ownerDenied(session.auth_user_id as string | null, authUser)) {
      return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
    }

    const karta = session.problem_summary as Record<string, unknown> | null
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    const assessment = session.assessment as Record<string, unknown> | null
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

    // Lock: równoległe wywołania (drugi tab, reload w trakcie) nie odpalają
    // drugiej generacji — dostają pending, frontend dociąga wynik syncem
    const { data: lock } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'plan', p_ttl_sec: 180 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    // Koszt każdej próby → spar_usage. reasoning 'low' wystarcza do wyliczeń.
    const prices: Record<string, { i: number; c: number; o: number }> = {
      'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 },
      'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 },
    }
    const logUsage = async (usage: { i: number; c: number; o: number } | null) => {
      if (!usage) return
      try { const p = prices[OPENAI_MODEL] || prices['gpt-5.5']; await supabase.from('spar_usage').insert({ session_id: sessionId, kind: 'plan', model: OPENAI_MODEL, input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o, cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000 }) } catch (uErr) { console.error('[spar-plan] usage insert error:', uErr) }
    }
    // Auto-retry ×1 na pustą/niepoprawną odpowiedź
    const user = buildUser(brief, karta, assessment)
    let plan: Record<string, unknown> | null = null
    for (let attempt = 0; attempt < 2 && !plan; attempt++) {
      const { obj, usage } = await callOnce(OPENAI_API_KEY, user, 5000 + attempt * 2000)
      await logUsage(usage)
      if (obj && sanePlan(obj)) plan = obj
      else if (attempt === 0) console.warn('[spar-plan] próba 1 nieudana — ponawiam')
    }
    if (!plan) {
      console.error('[spar-plan] obie próby nieudane')
      await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'plan' })
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }

    const toSave = { ...plan, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL } }
    const { error: uErr } = await supabase
      .from('spar_sessions')
      .update({ business_plan: toSave, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (uErr) console.error('[spar-plan] save error:', uErr)
    await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'plan' })

    return jsonResponse({ plan, cached: false }, 200, cors)
  } catch (e) {
    console.error('[spar-plan] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
