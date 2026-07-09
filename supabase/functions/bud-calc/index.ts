// bud-calc — AI-owy SEED do kalkulatora potencjału na zakładce/karcie współpracy
// (lejek "Zbuduję / Sklep", AWE e-commerce fizyczny; tomekniedzwiecki.pl/sklep).
//
// Po co: zamiast sztywnej heurystyki kategorii we froncie — jeden tani strzał do
// OpenAI liczy REALISTYCZNE wejścia kalkulatora USZYTE NA PRODUKT z researchu raportu:
// cena detaliczna (aov), marża %, koszt reklamy na zamówienie (cac), realny wolumen
// zamówień/mies po rozkręceniu sprzedaży przez Tomka. Optymizm idzie z wolumenu, nie
// ze zmyślonej marży. Front pokazuje heurystykę natychmiast i podmienia tym seedem.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy bud-calc --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
//
// Cache: bud_sessions.calc_seed (jsonb). Limit 3 generacji/sesja. Lock przez bud_claim_lock.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl', 'https://www.tomekniedzwiecki.pl', 'https://crm.tomekniedzwiecki.pl', 'https://tn-crm.vercel.app', 'http://localhost:5500', 'http://127.0.0.1:5500']
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_GENERATIONS = 3
const OPENAI_MODEL = Deno.env.get('BUD_CALC_MODEL') || 'gpt-5.1'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }
function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }) }

let MODEL_BLOCK = ''
const SYSTEM_PROMPT = `Jesteś analitykiem unit-economics polskiego e-commerce z FIZYCZNYM produktem (model: dropshipping / własny sklep + płatne reklamy Meta/TikTok/Google, często płatność przy odbiorze). Dostajesz produkt, grupę odbiorców i wyciąg z researchu rynku. Oszacuj REALISTYCZNE, lekko optymistyczne wejścia do kalkulatora potencjału dla sklepu, który zespół Tomka buduje i ROZKRĘCA do pierwszych 1000+ zamówień, a potem przekazuje klientowi.

Zasady (trzymaj się realiów researchu, nie z sufitu):
- aov (cena detaliczna w zł): realna polska półka rynkowa TEGO produktu wg researchu. Dobry landing sprzedaje jeden produkt-bohatera lub zestaw — możesz przyjąć cenę zestawu, jeśli to typowe dla kategorii.
- marza (% po koszcie towaru): typowa marża dropshippingu PL dla tej kategorii — zwykle 50–70% (tanie impulsowe wyżej, drogie elektroniczne niżej). NIGDY nie podawaj absurdów (>85%).
- cac (koszt reklamy na zamówienie w zł): realny koszt pozyskania zamówienia dla tej ceny/kategorii (impuls taniej, drogie/rozważne zakupy drożej). NIGDY śmiesznie nisko (<5 zł).
- zam (zamówień/miesiąc): realistyczny poziom PO rozkręceniu sprzedaży przez Tomka — optymistyczny, ale osiągalny dla pojedynczego viralowego produktu (zwykle 250–800). TO jest miejsce na optymizm, nie marża.
- Lepiej wiarygodnie niż efektownie. Liczby mają wytrzymać kontakt z rozsądnym, sceptycznym klientem.

Zwróć WYŁĄCZNIE JSON: {"aov": <liczba całkowita zł>, "marza": <liczba całkowita %>, "cac": <liczba całkowita zł>, "zam": <liczba całkowita/mies>, "nota": "<1 krótkie zdanie po polsku: dlaczego te liczby — odwołaj się do produktu/kategorii/ceny rynkowej. PROSTYM językiem, dla osoby BEZ doświadczenia w biznesie: ZERO skrótów i żargonu (nie ROAS/CAC/AOV/COGS/marża jednostkowa); pisz zwykłymi słowami>"}.`

// Kompaktowy odczyt rynku z raportu /sklep (sekcje[] z markdownem) — daje modelowi realne ceny.
function raportDigest(raport: Record<string, unknown> | null): string {
  if (!raport || typeof raport !== 'object') return ''
  // deno-lint-ignore no-explicit-any
  const r = raport as any
  const flat = (t: unknown) => (typeof t === 'string' ? t.replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim() : '')
  const out: string[] = []
  if (typeof r.naglowek === 'string') out.push('Produkt/temat raportu: ' + flat(r.naglowek).slice(0, 120))
  if (Array.isArray(r.sekcje)) {
    const sek = r.sekcje as Array<Record<string, unknown>>
    const pick = (re: RegExp) => { const x = sek.find((y) => typeof y?.tytul === 'string' && re.test(y.tytul as string)); return x ? flat(x.tresc) : '' }
    const pot = pick(/cen|marż|marz|potencja|popyt|rynk|konkuren/i)
    if (pot) out.push('Z researchu rynku (realne ceny i konkurencja — UŻYJ jako wejście, nie podawaj sprzecznych liczb): ' + pot.slice(0, 700))
  }
  return out.join('\n')
}
function buildUser(ustalenia: Record<string, unknown> | null, raport: Record<string, unknown> | null, productInput: string): string {
  const s = (v: unknown, m = 200) => (typeof v === 'string' ? v.slice(0, m) : '')
  const u = ustalenia || {}
  const produkt = s(u.nazwa) || (raport && typeof (raport as Record<string, unknown>).naglowek === 'string' ? s((raport as Record<string, unknown>).naglowek, 120) : '') || s(productInput, 120) || 'produkt fizyczny'
  const fakty: string[] = []
  fakty.push(`Produkt: ${produkt}`)
  if (u.kat) fakty.push(`Kategoria: ${s(u.kat)}`)
  if (u.dla_kogo) fakty.push(`Grupa odbiorców: ${s(u.dla_kogo)}`)
  if (Array.isArray(u.korzysci) && u.korzysci.length) fakty.push(`Korzyści/pozycjonowanie: ${(u.korzysci as unknown[]).filter((x) => typeof x === 'string').slice(0, 4).join(', ')}`)
  const dig = raportDigest(raport); if (dig) fakty.push(dig)
  return `PROJEKT:\n${fakty.join('\n')}\n\nZwróć JSON dokładnie wg schematu z instrukcji systemowej.`
}

function clampInt(x: unknown, lo: number, hi: number): number | null {
  const n = typeof x === 'number' ? x : (typeof x === 'string' ? parseFloat(x.replace(/[^\d.]/g, '')) : NaN)
  if (!isFinite(n) || n <= 0) return null
  return Math.min(hi, Math.max(lo, Math.round(n)))
}
// deno-lint-ignore no-explicit-any
function sanitizeSeed(o: any): { aov: number; marza: number; cac: number; zam: number; nota: string } | null {
  if (!o || typeof o !== 'object') return null
  const aov = clampInt(o.aov, 19, 3000)
  const marza = clampInt(o.marza, 35, 85)
  const cac = clampInt(o.cac, 3, 300)
  const zam = clampInt(o.zam, 50, 5000)
  if (aov === null || marza === null || cac === null || zam === null) return null
  // Sanity: koszt reklamy nie może zjadać całego zysku jednostkowego (inaczej kalkulator pokazuje 0).
  const zyskSzt = aov * (marza / 100)
  const cac2 = cac >= zyskSzt ? Math.max(3, Math.round(zyskSzt * 0.45)) : cac
  const nota = typeof o.nota === 'string' ? o.nota.slice(0, 240) : ''
  return { aov, marza, cac: cac2, zam, nota }
}

async function callOnce(apiKey: string, user: string, maxTokens: number): Promise<{ obj: Record<string, unknown> | null; usage: { i: number; c: number; o: number } | null }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: (MODEL_BLOCK ? MODEL_BLOCK + '\n\n' : '') + SYSTEM_PROMPT }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: maxTokens, reasoning_effort: 'low' }),
  })
  if (!res.ok) { console.error('[bud-calc] openai error:', res.status, (await res.text().catch(() => '')).slice(0, 400)); return { obj: null, usage: null } }
  const data = await res.json()
  const u = data?.usage || {}
  const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
  const content = data?.choices?.[0]?.message?.content
  try { return { obj: JSON.parse(content), usage } }
  catch { console.error('[bud-calc] zły JSON:', String(content).slice(0, 200)); return { obj: null, usage } }
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
    if (!MODEL_BLOCK) { try { const { data: mb } = await supabase.from('settings').select('value').eq('key', 'budowanie_model_biznesowy').single(); MODEL_BLOCK = (mb as { value?: string } | null)?.value || '' } catch (_e) { /* pusty blok ok */ } }
    const { data: session, error: sErr } = await supabase.from('bud_sessions').select('id, ustalenia, market_report, product_input, calc_seed, auth_user_id').eq('id', sessionId).maybeSingle()
    if (sErr) { console.error('[bud-calc] session fetch error:', sErr); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)
    {
      const authUser = await verifyAuthUser(req, supabase)
      if (ownerDenied(session.auth_user_id as string | null, authUser)) return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
    }
    const ustalenia = session.ustalenia as Record<string, unknown> | null
    const raport = session.market_report as Record<string, unknown> | null
    const productInput = (session.product_input as string | null) || ''
    if (!ustalenia && !raport && !productInput) return jsonResponse({ error: 'brak_danych_projektu' }, 400, cors)

    const existing = session.calc_seed as Record<string, unknown> | null
    const meta = (existing && existing._meta) as Record<string, unknown> | null
    const genCount = (meta && typeof meta.gen === 'number') ? meta.gen : (existing ? 1 : 0)
    if (existing && !body.force) { const { _meta: _d, ...seed } = existing; return jsonResponse({ seed, cached: true }, 200, cors) }
    if (genCount >= MAX_GENERATIONS) { if (existing) { const { _meta: _d, ...seed } = existing; return jsonResponse({ seed, cached: true }, 200, cors) } return jsonResponse({ error: 'limit_generacji' }, 429, cors) }

    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'calc', p_ttl_sec: 120 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    const user = buildUser(ustalenia, raport, productInput)
    const logUsage = async (usage: { i: number; c: number; o: number } | null) => {
      if (!usage) return
      try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']; await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'calc', model: OPENAI_MODEL, input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o, cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000 }) } catch (uErr) { console.error('[bud-calc] usage insert error:', uErr) }
    }
    let seed: { aov: number; marza: number; cac: number; zam: number; nota: string } | null = null
    for (let attempt = 0; attempt < 2 && !seed; attempt++) {
      const { obj, usage } = await callOnce(OPENAI_API_KEY, user, 1200 + attempt * 800)
      await logUsage(usage)
      seed = sanitizeSeed(obj)
      if (!seed && attempt === 0) console.warn('[bud-calc] próba 1 nieudana — ponawiam')
    }
    if (!seed) {
      await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'calc' })
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }
    const toSave = { ...seed, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL } }
    const { error: uErr } = await supabase.from('bud_sessions').update({ calc_seed: toSave, updated_at: new Date().toISOString() }).eq('id', sessionId)
    if (uErr) console.error('[bud-calc] save error:', uErr)
    await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'calc' })
    return jsonResponse({ seed, cached: false }, 200, cors)
  } catch (e) { console.error('[bud-calc] ERROR:', e); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
})
