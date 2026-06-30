// bud-products — MÓZG DOBORU PRODUKTU K1 lejka „Zbuduję" (AWE, e-commerce fizyczny).
//
// Fork bud-assess. K1 (osoba nie ma jeszcze produktu) NIE zgaduje produktu z głowy —
// po zawężeniu kategorii model robi REALNY research live (Responses API + web_search:
// AliExpress orders, Allegro „sprzedane" + ceny PL, Amazon Best Sellers, TikTok/Reels)
// i zwraca 8–10 kandydatów ProductCandidate (backend serwuje 5, resztę front trzyma pod
// „pokaż inne"). Każdy kandydat MUSI mieć dowód popytu (sygnal_popytu) + źródło (ref_url) —
// brak = odrzut w sanity-check. Rubryka „winning product": 80–300 zł, marża ≥2,5–3×,
// kompaktowy/paczkomatowy; czerwone flagi (odzież z rozmiarówką, suplementy, szkło,
// markup<2×) ODRZUCANE. Spec: docs/zbuduje/PLAN-K1-DOBOR-PRODUKTU.md.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy bud-products --no-verify-jwt
//
// Endpoint WEWNĘTRZNY (jak bud-assess) — wywołuje go WYŁĄCZNIE bud-chat server-to-server
// kluczem service-role. Front go NIE woła; bud-chat zapisuje wynik do bud_sessions.product_input.
//
// POST { sessionId, kategoria, budzet, styl, wyklucz:[], page } (Bearer = SUPABASE_SERVICE_ROLE_KEY)
//   → { items: ProductCandidate[], page }
//
// Sekrety: OPENAI_API_KEY; BUD_PRODUCTS_MODEL (override) → BUD_ASSESS_MODEL → gpt-5.5

import { createClient } from "jsr:@supabase/supabase-js@2";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'https://crm.tomekniedzwiecki.pl',
  'https://tn-crm.vercel.app',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
]
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const OPENAI_MODEL = Deno.env.get('BUD_PRODUCTS_MODEL') || Deno.env.get('BUD_ASSESS_MODEL') || 'gpt-5.5'
const KW_MODEL = Deno.env.get('BUD_PRODUCTS_KW_MODEL') || 'gpt-5.5'  // frazy = NAJWAŻNIEJSZA robota → mocniejszy model (decyzja Tomka)
const MAX_OUTPUT_TOKENS = 8000
const WEB_SEARCH_CALL_USD = 0.01
// Pipeline 3-etapowy (perełki): ile konceptów odpytać w ETAP 2, cap calli RapidAPI.
// Ile FRAZ-konceptów odpytać (każda × 2 endpointy: hot-products + search). User: 10-20 fraz.
const MAX_KEYWORDS = (() => { const n = parseInt(Deno.env.get('BUD_PRODUCTS_MAX_KEYWORDS') || '', 10); return (isFinite(n) && n > 0) ? n : 20 })()
// Throttling: ile calli RÓWNOLEGLE naraz (reszta czeka) — przeciw rate-limit 429 RapidAPI,
// który wcześniej GUBIŁ całe frazy przy 12+ jednoczesnych callach.
const RAPID_CONCURRENCY = (() => { const n = parseInt(Deno.env.get('BUD_PRODUCTS_RAPID_CONCURRENCY') || '', 10); return (isFinite(n) && n > 0) ? n : 5 })()
const SCORING_WEBSEARCH = Deno.env.get('BUD_PRODUCTS_SCORING_WEBSEARCH') === '1' || Deno.env.get('BUD_PRODUCTS_SCORING_WEBSEARCH') === 'true'
const SCORE_THRESHOLD = 70          // próg score do TOP (rubryka A3)
const SCORING_MAX_TOKENS = 18000    // zapas na reasoning + 10 perełek z polami (cel: TOP 10)
const SCORING_MAX_CANDIDATES = 55   // ile kandydatów max wysłać do scoringu (top po wolumenie) — kontrola kosztu/latencji
const TOP_PERELKI = (() => { const n = parseInt(Deno.env.get('BUD_PRODUCTS_TOP') || '', 10); return (isFinite(n) && n > 0) ? n : 10 })() // ile perełek serwujemy (decyzja Tomka: 10)

// ── ADAPTER AliExpress Affiliate API (GATED env) ────────────────────────────
// Gdy ustawione wszystkie 3 sekrety, ścieżka AliExpress daje REALNE produkty
// (zdjęcie + cena PLN + liczba zamówień + link afiliacyjny) bez palenia tokenów
// OpenAI. Bez kluczy hasAliexpress()=false → kod spada do ścieżki web_search
// (NIE psujemy jej). Gateway „/sync": HMAC-SHA256(app_secret, sortedConcat),
// sign_method=sha256, timestamp=epoch ms; method (kropkowa, bez „/") jest
// zwykłym parametrem (NIE prefiksuje base-stringa — to robi tylko route „/rest").
const ALI_GATEWAY = 'https://api-sg.aliexpress.com/sync'
const ALI_SIGN_METHOD = 'sha256'
const ALI_TIMEOUT_MS = 15000

// ── RapidAPI „Aliexpress True API" (ŚCIEŻKA PRIORYTETOWA) ────────────────────
// Uniwersalny search po słowie po całym AliExpress (NIE afiliacja). Gate na
// BUD_ALIEXPRESS_RAPIDAPI_KEY. Host domyślny w kodzie (NIE secret). Zwraca
// realne produkty (zdjęcie + cena USD + link). Przeliczamy USD→PLN wg settings
// 'usd_pln_rate' i stosujemy model dropshippingowy (koszt = cena Ali, detal = ~2,7×).
const RAPID_HOST_DEFAULT = 'aliexpress-true-api.p.rapidapi.com'
const RAPID_TIMEOUT_MS = 15000
const RAPID_RETAIL_MARKUP = 2.7   // markup detal/koszt (rubryka: marża ≥2,5–3×)
// Pipeline perełek: twardy filtr sweet-spotu ZDJĘTY z ETAP 2 — właściwą ocenę ceny robi
// scoring (ETAP 3, oś marża). Backend odsiewa tylko SKRAJNOŚCI do rezerwy (<40 / >500 zł detalu).
const RAPID_PRICE_MIN_PL = 40     // skrajność dolna ceny DETALICZNEJ (do rezerwy, priorytet niżej)
const RAPID_PRICE_MAX_PL = 500    // skrajność górna ceny DETALICZNEJ (do rezerwy)
// TWARDY filtr ceny ZAKUPU na AliExpress (decyzja Tomka 2026-06-21): koszt zakupu <30 zł lub
// >400 zł = NIGDY nie proponujemy (całkowity odrzut, nawet nie do rezerwy). Tani = brak marży/
// percepcja śmiecia; drogi = poza strefą impulsu + ryzyko. env BUD_PRODUCTS_MIN/MAX_KOSZT_ZAKUP.
const MIN_KOSZT_ZAKUP = (() => { const n = parseFloat(Deno.env.get('BUD_PRODUCTS_MIN_KOSZT_ZAKUP') || ''); return (isFinite(n) && n >= 0) ? n : 30 })()
const MAX_KOSZT_ZAKUP = (() => { const n = parseFloat(Deno.env.get('BUD_PRODUCTS_MAX_KOSZT_ZAKUP') || ''); return (isFinite(n) && n > 0) ? n : 400 })()
// TWARDY PRÓG „winning product" (decyzja Tomka 2026-06-21): produkt musi mieć REALNY
// dowód popytu i jakości — min. liczba sprzedaży ORAZ min. ocena. AliExpress podaje ocenę
// jako PROCENT pozytywnych opinii (evaluate_rate, np. „98.6%"); „ocena 4,6/5" = 92% (4.6÷5).
// Dane bierzemy z /api/v3/hot-products (search /api/v3/products zwraca lastest_volume=0 i
// NIE ma oceny — bezużyteczny pod ten próg). Produkty bez wolumenu/oceny ODPADAJĄ (brak dowodu).
const MIN_VOLUME = (() => { const n = parseInt(Deno.env.get('BUD_PRODUCTS_MIN_VOLUME') || '', 10); return (isFinite(n) && n >= 0) ? n : 50 })()
// PRÓG ADAPTACYJNY (decyzja Tomka): mass-market = MIN_VOLUME(50). Gdy w danej (wąskiej) niszy
// <3 produkty mają ≥50 sprzedaży — schodzimy z wymogu SPRZEDAŻY do MIN_VOLUME_NISZA(15),
// ale OCENA zostaje twarda (MIN_RATE_PCT). Nisza ma z natury mniejszy wolumen; jakość bez kompromisu.
const MIN_VOLUME_NISZA = (() => { const n = parseInt(Deno.env.get('BUD_PRODUCTS_MIN_VOLUME_NISZA') || '', 10); return (isFinite(n) && n >= 0) ? n : 15 })()
const MIN_RATE_PCT = (() => { const n = parseFloat(Deno.env.get('BUD_PRODUCTS_MIN_RATE_PCT') || ''); return (isFinite(n) && n >= 0) ? n : 92 })()
const RAPID_PAGE_SIZE = (() => { const n = parseInt(Deno.env.get('BUD_PRODUCTS_RAPID_PAGE_SIZE') || '', 10); return (isFinite(n) && n > 0) ? n : 40 })() // pobieramy SZEROKO — twardy próg 50/92% przepuszcza tylko ułamek

function hasAliexpressRapid(): boolean {
  return !!Deno.env.get('BUD_ALIEXPRESS_RAPIDAPI_KEY')
}
function rapidHost(): string {
  return Deno.env.get('BUD_ALIEXPRESS_RAPIDAPI_HOST') || RAPID_HOST_DEFAULT
}

function hasAliexpress(): boolean {
  return !!(Deno.env.get('BUD_ALIEXPRESS_APP_KEY') &&
    Deno.env.get('BUD_ALIEXPRESS_APP_SECRET') &&
    Deno.env.get('BUD_ALIEXPRESS_TRACKING_ID'))
}
function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

// Kurs USD→PLN z settings 'usd_pln_rate' (string, np. '4.00'). Fallback 4.0.
async function fetchUsdPlnRate(): Promise<number> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return 4.0
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data } = await supabase.from('settings').select('value').eq('key', 'usd_pln_rate').maybeSingle()
    const n = Number((data as { value?: unknown } | null)?.value)
    return (isFinite(n) && n > 0) ? n : 4.0
  } catch { return 4.0 }
}

// Ładuje wartości settings dla listy kluczy → mapa key→value (pusty string gdy brak).
// Single-source promptów pipeline'u (playbook/keywordgen/scoring) — kod nie trzyma treści.
async function loadSettings(keys: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  for (const k of keys) out[k] = ''
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return out
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data } = await supabase.from('settings').select('key, value').in('key', keys)
    for (const row of ((data || []) as Array<{ key: string; value: unknown }>)) {
      if (typeof row.value === 'string') out[row.key] = row.value
    }
  } catch (e) { console.error('[bud-products] loadSettings error:', e) }
  return out
}

// Stały prompt systemowy (rubryka + research + kontrakt JSON) — ładowany raz z settings.
let SYSTEM_PROMPT = ''

// Buduje user-message z filtrów K1. Treść stałą (rubryka/kontrakt) trzyma SYSTEM_PROMPT.
function buildUser(p: Record<string, unknown>): string {
  const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => (x as string).slice(0, 120)).slice(0, 40) : []
  const kategoria = s(p.kategoria, 200)
  const budzet = s(p.budzet, 120)
  const styl = s(p.styl, 120)
  const wyklucz = list(p.wyklucz)

  const fakty: string[] = []
  fakty.push(`KATEGORIA / zainteresowania klienta: ${kategoria || 'bez zawężenia — dobierz najmocniejszą niszę pod te kryteria'}`)
  if (budzet) fakty.push(`BUDŻET / pułap cenowy produktu wskazany przez klienta: ${budzet}`)
  if (styl) fakty.push(`STYL / pozycjonowanie: ${styl}`)
  if (wyklucz.length) fakty.push(`NIE proponuj ponownie (już pokazane / odrzucone) — pomiń te i znajdź INNE: ${wyklucz.join('; ')}`)

  return `KRYTERIA DOBORU PRODUKTU (kierunek K1 — klient nie ma jeszcze produktu, szuka, w co wejść):
${fakty.join('\n')}

Zrób SZYBKI research live (web_search, polski i angielski rynek; MAKSYMALNIE 3 wyszukania — użytkownik czeka na ekranie) i zwróć 6 kandydatów ProductCandidate dokładnie wg kontraktu JSON z instrukcji systemowej. Opisy krótkie i konkretne. RÓŻNORODNOŚĆ — NAJWAŻNIEJSZE: NAJPIERW wybierz 6 RÓŻNYCH podkategorii/zastosowań w obrębie kategorii, potem do KAŻDEJ znajdź po JEDNYM bestsellerze. MAKSYMALNIE JEDEN produkt z danej podkategorii — dwa produkty o tym samym przeznaczeniu (np. oba do przypraw, oba to organizery/pojemniki) = BŁĄD, zastąp jeden czymś z zupełnie innego obszaru. Sześć kart = sześć różnych problemów/momentów użycia/grup odbiorców, nie sześć odmian jednej rzeczy. Każdy MUSI mieć realny dowód popytu (sygnal_popytu) i źródło (ref_url). DOKŁADNIE jeden kandydat ma najmocniejszy:true.`
}

// Sanity per kandydat (analog saneOcena): odrzuca kandydatów bez twardych pól.
// deno-lint-ignore no-explicit-any
function saneCandidate(c: any): boolean {
  if (!c || typeof c !== 'object') return false
  const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0
  const num = (v: unknown) => typeof v === 'number' && isFinite(v) && v > 0
  return str(c.nazwa)
    && str(c.sygnal_popytu)
    && str(c.ref_url)
    && num(c.est_cena_detaliczna_pl)
}

// Normalizuje surowego kandydata do pełnego kontraktu ProductCandidate (uzupełnia brakujące
// pola wartościami bezpiecznymi; liczby dolicza, gdy model ich nie podał).
// deno-lint-ignore no-explicit-any
function normalizeCandidate(c: any, idx: number): Record<string, unknown> {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0)
  const cena = num(c.est_cena_detaliczna_pl)
  const koszt = num(c.est_koszt_zakupu)
  // est_marza_zl: użyj podanej, a gdy brak/niespójna — policz z ceny i kosztu.
  let marza = num(c.est_marza_zl)
  if (!marza && cena && koszt) marza = Math.max(0, cena - koszt)
  const base: Record<string, unknown> = {
    id: str(c.id) || `cand-${idx + 1}`,
    nazwa: str(c.nazwa),
    opis_1zd: str(c.opis_1zd),
    czemu_sie_sprzedaje: str(c.czemu_sie_sprzedaje),
    est_cena_detaliczna_pl: cena,
    est_koszt_zakupu: koszt,
    est_marza_zl: marza,
    sygnal_popytu: str(c.sygnal_popytu),
    kategoria: str(c.kategoria),
    ref_url: str(c.ref_url),
    // image: URL zdjęcia produktu. Ścieżka web_search zostawia '' (front pokaże
    // placeholder/brief), ścieżka AliExpress wypełnia realnym zdjęciem.
    image: str(c.image),
    najmocniejszy: c.najmocniejszy === true,
  }
  // Warstwa inteligentna ze scoringu (ETAP 3) — przepuszczana tylko gdy obecna,
  // by nie zaśmiecać kart ze ścieżek web_search/HMAC pustymi polami.
  if (str(c.problem_wow)) base.problem_wow = str(c.problem_wow)
  if (str(c.kat_wow)) base.kat_wow = str(c.kat_wow)
  if (str(c.dlaczego_pl)) base.dlaczego_pl = str(c.dlaczego_pl)
  if (str(c.pomysl_landing)) base.pomysl_landing = str(c.pomysl_landing)
  if (str(c.przewaga_brandowa)) base.przewaga_brandowa = str(c.przewaga_brandowa)
  if (str(c.perceived_value)) base.perceived_value = str(c.perceived_value)
  if (str(c.pomysl_bundle)) base.pomysl_bundle = str(c.pomysl_bundle)
  if (typeof c.score === 'number' && isFinite(c.score)) base.score = c.score
  if (c.score_osie && typeof c.score_osie === 'object') base.score_osie = c.score_osie
  return base
}

// Wyciąga tablicę kandydatów z surowego tekstu modelu. Akceptuje { kandydaci:[...] },
// { items:[...] } albo gołą tablicę. Tnie ```json fence.
function extractCandidates(raw: string): unknown[] | null {
  const text = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  // Goła tablica
  const aStart = text.indexOf('['); const aEnd = text.lastIndexOf(']')
  const oStart = text.indexOf('{'); const oEnd = text.lastIndexOf('}')
  // Preferuj obiekt z kluczem kandydaci/items, jeśli klamra obejmuje całość
  if (oStart !== -1 && oEnd > oStart && (aStart === -1 || oStart < aStart)) {
    try {
      const obj = JSON.parse(text.slice(oStart, oEnd + 1)) as Record<string, unknown>
      const arr = (obj.kandydaci || obj.items || obj.produkty) as unknown
      if (Array.isArray(arr)) return arr
    } catch { /* spróbuj gołej tablicy niżej */ }
  }
  if (aStart !== -1 && aEnd > aStart) {
    try { const arr = JSON.parse(text.slice(aStart, aEnd + 1)); if (Array.isArray(arr)) return arr } catch { /* niżej */ }
  }
  // Ostatnia próba: cały tekst jako obiekt
  if (oStart !== -1 && oEnd > oStart) {
    try {
      const obj = JSON.parse(text.slice(oStart, oEnd + 1)) as Record<string, unknown>
      const arr = (obj.kandydaci || obj.items || obj.produkty) as unknown
      if (Array.isArray(arr)) return arr
    } catch { /* poddaj się */ }
  }
  return null
}

// Składa finalną listę: parse → sanity → normalize → gwarancja DOKŁADNIE jednego najmocniejszego.
function finalizeItems(text: string): Record<string, unknown>[] {
  const raw = extractCandidates(text)
  if (!raw) return []
  const items = raw.filter(saneCandidate).map((c, i) => normalizeCandidate(c, i))
  if (items.length === 0) return []
  // Dokładnie jeden najmocniejszy: jeśli żaden albo kilka — ustaw pierwszego, resetuj resztę.
  const strongIdx = items.findIndex((x) => x.najmocniejszy === true)
  items.forEach((x, i) => { x.najmocniejszy = i === (strongIdx >= 0 ? strongIdx : 0) })
  return items
}

// Log kosztu do bud_usage (kind 'products' — już w bud_usage_kind_check).
async function logCost(sessionId: string, model: string, u: Record<string, unknown> | null, searchCalls: number, served: number): Promise<void> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const input = (u?.input_tokens as number) || 0
    const cached = ((u?.input_tokens_details as Record<string, unknown>)?.cached_tokens as number) || 0
    const out = (u?.output_tokens as number) || 0
    const prices: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
    const p = prices[model] || prices['gpt-5.5']
    await supabase.from('bud_usage').insert({
      session_id: sessionId, kind: 'products', model,
      input_tokens: input, cached_tokens: cached, output_tokens: out,
      cost_usd: (Math.max(0, input - cached) * p.i + cached * p.c + out * p.o) / 1_000_000 + searchCalls * WEB_SEARCH_CALL_USD,
      meta: { source: 'web_search', web_search_calls: searchCalls, served },
    })
  } catch (e) { console.error('[bud-products] logCost error:', e) }
}

// Log do bud_usage dla ścieżki AliExpress: koszt 0 (API afiliacyjne darmowe),
// kind 'products', meta.source='aliexpress' + liczba odpytań.
async function logAliUsage(sessionId: string, apiCalls: number, served: number): Promise<void> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    await supabase.from('bud_usage').insert({
      session_id: sessionId, kind: 'products', model: 'aliexpress',
      input_tokens: 0, cached_tokens: 0, output_tokens: 0,
      cost_usd: 0,
      meta: { source: 'aliexpress', api_calls: apiCalls, served },
    })
  } catch (e) { console.error('[bud-products] logAliUsage error:', e) }
}

// Liczy koszt OpenAI (USD) z usage wg cennika modelu (gpt-5.5/5.1; per 1M tok.).
function openaiCostUsd(model: string, u: Record<string, unknown> | null): number {
  if (!u) return 0
  const input = (u.input_tokens as number) || (u.prompt_tokens as number) || 0
  const cached = ((u.input_tokens_details as Record<string, unknown>)?.cached_tokens as number)
    || ((u.prompt_tokens_details as Record<string, unknown>)?.cached_tokens as number) || 0
  const out = (u.output_tokens as number) || (u.completion_tokens as number) || 0
  const prices: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
  const p = prices[model] || prices['gpt-5.5']
  return (Math.max(0, input - cached) * p.i + cached * p.c + out * p.o) / 1_000_000
}

// Log do bud_usage dla ścieżki RapidAPI (pipeline perełek): realny koszt OpenAI
// (ETAP 1 keywordgen + ETAP 3 scoring; RapidAPI = limit miesięczny, nie per-call),
// kind 'products', meta.source='rapidapi_scored' + rozbicie etapów.
async function logRapidUsage(
  sessionId: string,
  stages: { keywordgen: { model: string; usage: Record<string, unknown> | null; calls: number }; rapid_calls: number; scoring: { model: string; usage: Record<string, unknown> | null; calls: number }; websearch_calls: number; counts?: { kw: number; kw_fallback: boolean; stage2: number; scored: number; odrzut_prog?: number; rezerwa?: number; relaxed?: boolean; pula?: number; nisza?: boolean; kw_sample?: string[]; surowe?: number } },
  served: number,
  source = 'rapidapi_scored',
): Promise<void> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const kwU = stages.keywordgen.usage
    const scU = stages.scoring.usage
    const inTok = (((kwU?.input_tokens as number) || (kwU?.prompt_tokens as number) || 0) + ((scU?.input_tokens as number) || (scU?.prompt_tokens as number) || 0))
    const outTok = (((kwU?.output_tokens as number) || (kwU?.completion_tokens as number) || 0) + ((scU?.output_tokens as number) || (scU?.completion_tokens as number) || 0))
    const cost = openaiCostUsd(stages.keywordgen.model, kwU) + openaiCostUsd(stages.scoring.model, scU) + stages.websearch_calls * WEB_SEARCH_CALL_USD
    await supabase.from('bud_usage').insert({
      session_id: sessionId, kind: 'products', model: 'rapidapi+openai',
      input_tokens: inTok, cached_tokens: 0, output_tokens: outTok,
      cost_usd: cost,
      meta: {
        source,
        served,
        counts: stages.counts || null,
        stages: {
          keywordgen: { model: stages.keywordgen.model, calls: stages.keywordgen.calls },
          rapid_calls: stages.rapid_calls,
          scoring: { model: stages.scoring.model, calls: stages.scoring.calls },
          websearch_calls: stages.websearch_calls,
        },
      },
    })
  } catch (e) { console.error('[bud-products] logRapidUsage error:', e) }
}

// HMAC-SHA256 base-stringa kluczem app_secret → uppercase hex (Deno crypto.subtle).
async function aliSign(params: Record<string, string>, appSecret: string): Promise<string> {
  // 1) sortuj klucze ASCII, 2) sklej name+value bez separatorów (z pominięciem 'sign').
  const basestring = Object.keys(params)
    .filter((k) => k !== 'sign' && params[k] != null && params[k] !== '')
    .sort()
    .reduce((acc, k) => acc + k + params[k], '')
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(basestring))
  return Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

// Jedno wywołanie metody AliExpress (np. aliexpress.affiliate.product.query).
// Buduje system-params + podpis, POST query-string na gateway „/sync".
// deno-lint-ignore no-explicit-any
async function aliCall(method: string, bizParams: Record<string, string>): Promise<any> {
  const appKey = Deno.env.get('BUD_ALIEXPRESS_APP_KEY') || ''
  const appSecret = Deno.env.get('BUD_ALIEXPRESS_APP_SECRET') || ''
  const params: Record<string, string> = {
    ...bizParams,
    method,
    app_key: appKey,
    sign_method: ALI_SIGN_METHOD,
    timestamp: String(Date.now()), // epoch ms (gateway api-sg „/sync")
    format: 'json',
    v: '2.0',
    simplify: 'true',
  }
  params.sign = await aliSign(params, appSecret)
  const qs = Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')

  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ALI_TIMEOUT_MS)
  try {
    const res = await fetch(`${ALI_GATEWAY}?${qs}`, { method: 'POST', signal: ctrl.signal })
    if (!res.ok) { console.error('[bud-products] ali http', res.status); return null }
    return await res.json()
  } finally { clearTimeout(t) }
}

// aliCall z 1 retry przy transientach (abort/5xx/null).
// deno-lint-ignore no-explicit-any
async function aliCallRetry(method: string, bizParams: Record<string, string>): Promise<any> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const out = await aliCall(method, bizParams)
      if (out) return out
    } catch (e) {
      console.error('[bud-products] aliCall attempt', attempt, e instanceof Error ? e.message : e)
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 600))
  }
  return null
}

// Wyciąga tablicę produktów z koperty odpowiedzi product.query / hotproduct.query.
// deno-lint-ignore no-explicit-any
function aliExtractProducts(data: any): any[] {
  if (!data || typeof data !== 'object') return []
  const resp = data.aliexpress_affiliate_product_query_response ||
    data.aliexpress_affiliate_hotproduct_query_response || null
  const result = resp?.resp_result?.result || resp?.result || null
  const products = result?.products?.product || result?.products || null
  return Array.isArray(products) ? products : []
}

// Z „zadania"/kategorii wyprowadza 5–6 RÓŻNYCH słów-kluczy (różnorodność nisz).
// Najpierw bierze gotowe podkierunki z wykluczeń-antymateriału? Nie — z kategorii:
// rozbija po separatorach, a gdy za mało, dokłada generyczne modyfikatory zakupowe.
function deriveKeywords(kategoria: string, budzet: string, styl: string): string[] {
  const base = `${kategoria} ${styl}`.toLowerCase()
  // Rozbij wejście po typowych separatorach na odrębne nisze.
  const parts = base
    .split(/[,;/\n·•|]+|\band\b|\boraz\b|\bi\b/gi)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3)
  const uniq: string[] = []
  for (const p of parts) { if (!uniq.includes(p)) uniq.push(p) }
  // Gdy kategoria to jeden temat — rozszerz na różne zastosowania/grupy odbiorców,
  // żeby 6 kart = 6 różnych nisz, nie 6 odmian jednej rzeczy.
  if (uniq.length < 5) {
    const seed = (kategoria || styl || 'gadżety').trim()
    const modifiers = ['gift', 'organizer', 'accessories', 'kit', 'set', 'gadget', 'tool', 'travel']
    for (const m of modifiers) {
      if (uniq.length >= 6) break
      const kw = `${seed} ${m}`.trim()
      if (!uniq.includes(kw)) uniq.push(kw)
    }
  }
  return uniq.slice(0, 6)
}

// Fallback ANGIELSKI dla ETAP 2 (gdy generateConcepts zwróci <3). AliExpress search
// działa po angielsku — frazy PL dają ~0 wyników (np. „akcesoria dla zwierząt"=0 vs
// „pet grooming"=tysiące). Mapuje typowe PL kategorie → EN, a gdy kategorii nie ma
// w słowniku, używa puli sprawdzonych haseł bestsellerowych (gwarantowane wyniki).
// To bezpiecznik ostateczny — ścieżką właściwą jest generateConcepts (15–20 konceptów EN).
function deriveKeywordsEN(kategoria: string, styl: string): string[] {
  const base = `${kategoria} ${styl}`.toLowerCase()
  // Słownik PL/EN-fraza → konkretne, „kupne" hasła EN dające realne produkty.
  const MAP: Array<{ re: RegExp; kw: string[] }> = [
    { re: /(zwierz|pies|kot|pupil|pet|dog|cat)/, kw: ['pet grooming glove', 'cat water fountain', 'dog chew toy', 'pet hair remover', 'slow feeder bowl', 'pet car seat cover'] },
    { re: /(kuchni|gotow|kitchen|cook)/, kw: ['kitchen gadget', 'vegetable chopper', 'spice organizer rack', 'silicone cooking utensils', 'coffee gadget', 'food storage container'] },
    { re: /(dom|wnętrz|home|wystr|decor|organiz)/, kw: ['home organizer', 'storage box', 'led strip lights', 'cable organizer', 'wall hook', 'drawer divider'] },
    { re: /(auto|samoch|car|moto)/, kw: ['car organizer', 'car phone holder', 'car gap filler', 'car trunk organizer', 'car cleaning gel', 'car seat hook'] },
    { re: /(dziec|baby|kid|niemowl)/, kw: ['baby silicone bib', 'kids night light', 'baby food masher', 'toddler learning toy', 'baby bath toy', 'kids drawing board'] },
    { re: /(uroda|kosmet|beauty|makij|skin)/, kw: ['facial cleansing brush', 'makeup organizer', 'gua sha tool', 'led face mask', 'hair styling tool', 'nail art kit'] },
    { re: /(sport|fitn|gym|trening)/, kw: ['resistance bands set', 'fitness tracker', 'yoga mat accessories', 'massage gun', 'gym water bottle', 'posture corrector'] },
    { re: /(ogr[oó]d|garden|balkon|roślin|plant)/, kw: ['garden tool set', 'plant watering globe', 'self watering planter', 'garden kneeler', 'plant grow light', 'hose nozzle'] },
    { re: /(elektronik|tech\b|telefon|smartfon|phone)/, kw: ['phone holder stand', 'wireless charger', 'mini projector', 'bluetooth tracker', 'cable management', 'laptop stand'] },
    { re: /(biuro|office|praca biur|desk)/, kw: ['desk organizer', 'cable organizer', 'laptop stand', 'desk mat', 'monitor stand', 'pen holder'] },
  ]
  const out: string[] = []
  for (const m of MAP) { if (m.re.test(base)) { for (const k of m.kw) if (!out.includes(k)) out.push(k) } }
  if (out.length >= 3) return out.slice(0, 10)
  // NIEZNANA nisza (np. tenis, wędkarstwo, hobby spoza słownika) → NIE zwracaj generycznych
  // bestsellerów (to dałoby produkty spoza świata klienta — np. „gadżety dla tenisistów"
  // → cable organizer/led strip). Lepiej PUSTO → caller zwróci „brak / zmień kategorię"
  // niż bezsensowne propozycje. Słowo „gadżet"/„gadget" CELOWO usunięte z regexu (łapało
  // „fun gadżety dla X" → generyczna elektronika).
  return []
}

// Mapuje surowy produkt AliExpress → ProductCandidate (kontrakt z normalizeCandidate).
// deno-lint-ignore no-explicit-any
function mapAliProduct(p: any, idx: number): Record<string, unknown> | null {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : (typeof v === 'number' ? String(v) : ''))
  const numFrom = (v: unknown) => { const n = parseFloat(str(v).replace(',', '.')); return isFinite(n) && n > 0 ? n : 0 }
  const title = str(p.product_title)
  // Cena PLN: preferuj target_app_sale_price (zależna od target_currency=PLN), potem target_sale_price/app_sale_price.
  const cena = numFrom(p.target_app_sale_price) || numFrom(p.target_sale_price) || numFrom(p.app_sale_price) || numFrom(p.sale_price)
  const image = str(p.product_main_image_url)
  if (!title || !cena || !image) return null // sanity: bez tytułu/ceny/obrazu odrzut
  const volume = parseInt(str(p.lastest_volume), 10)
  const rate = str(p.evaluate_rate)
  const sygnalParts: string[] = []
  if (isFinite(volume) && volume > 0) sygnalParts.push(`ponad ${volume} zamówień na AliExpress`)
  if (rate) sygnalParts.push(`ocena ${rate}`)
  const sygnal = sygnalParts.join(', ') || 'bestseller AliExpress (wysoka sprzedaż)'
  const nazwa = title.length > 70 ? title.slice(0, 67).trim() + '…' : title
  return {
    id: `ali-${str(p.product_id) || idx + 1}`,
    nazwa,
    opis_1zd: '',
    czemu_sie_sprzedaje: '',
    est_cena_detaliczna_pl: cena,
    est_koszt_zakupu: 0, // AliExpress nie zwraca ceny hurtowej — null/0; marżę dolicza front/bud-chat
    est_marza_zl: 0,
    sygnal_popytu: sygnal,
    kategoria: str(p.first_level_category_name),
    ref_url: str(p.promotion_link) || str(p.product_detail_url),
    image,
    _volume: (isFinite(volume) && volume > 0) ? volume : 0, // pomocnicze: wybór najmocniejszego
    najmocniejszy: false,
  }
}

// Główny adapter: per słowo-klucz odpyta product.query (sort=LAST_VOLUME_DESC,
// page_size=3), bierze TOP 1–2 z każdej niszy → łączy w ≤max RÓŻNYCH produktów.
// Dedup po product_id i tytule. Zwraca { items, apiCalls }.
async function fetchAliexpressCandidates(
  zadanie: { kategoria: string; budzet: string; styl: string; wyklucz: string[] },
  max: number,
): Promise<{ items: Record<string, unknown>[]; apiCalls: number }> {
  const trackingId = Deno.env.get('BUD_ALIEXPRESS_TRACKING_ID') || ''
  const keywords = deriveKeywords(zadanie.kategoria, zadanie.budzet, zadanie.styl)
  const wyklSet = new Set((zadanie.wyklucz || []).map((w) => w.toLowerCase().trim()).filter(Boolean))
  const seenId = new Set<string>()
  const seenTitle = new Set<string>()
  const out: Record<string, unknown>[] = []
  let apiCalls = 0

  for (const kw of keywords) {
    if (out.length >= max) break
    const data = await aliCallRetry('aliexpress.affiliate.product.query', {
      keywords: kw,
      sort: 'LAST_VOLUME_DESC',
      page_size: '3',
      page_no: '1',
      target_currency: 'PLN',
      target_language: 'PL',
      ship_to_country: 'PL',
      tracking_id: trackingId,
      fields: 'product_title,target_app_sale_price,target_sale_price,app_sale_price,sale_price,product_main_image_url,lastest_volume,evaluate_rate,product_detail_url,promotion_link,first_level_category_name,product_id',
    })
    apiCalls++
    const products = aliExtractProducts(data)
    let takenFromNiche = 0
    for (let i = 0; i < products.length; i++) {
      if (out.length >= max || takenFromNiche >= 2) break
      const cand = mapAliProduct(products[i], out.length)
      if (!cand) continue
      const idKey = String(cand.id)
      const titleKey = String(cand.nazwa).toLowerCase()
      if (seenId.has(idKey) || seenTitle.has(titleKey)) continue
      // Pomiń wykluczone (już pokazane/odrzucone) — dopasowanie podłańcuchem.
      const titleLc = titleKey
      let excluded = false
      for (const w of wyklSet) { if (w.length >= 4 && titleLc.includes(w)) { excluded = true; break } }
      if (excluded) continue
      seenId.add(idKey); seenTitle.add(titleKey)
      out.push(cand)
      takenFromNiche++
    }
  }

  // Najmocniejszy = najwyższy lastest_volume.
  if (out.length > 0) {
    let bestIdx = 0; let bestVol = -1
    out.forEach((c, i) => { const v = (c._volume as number) || 0; if (v > bestVol) { bestVol = v; bestIdx = i } })
    out.forEach((c, i) => { c.najmocniejszy = i === bestIdx; delete c._volume })
  }
  return { items: out, apiCalls }
}

// ── RapidAPI „Aliexpress True API" — pojedyncze wywołanie endpointu produktów ──
// endpoint: 'hot-products' (afiliacyjne „hot", realny lastest_volume + evaluate_rate)
// lub 'products' (uniwersalny search — TEŻ bywa zwraca wolumen, często INNE produkty).
// Łączymy oba źródła dla szerszej puli. target_currency MUSI być USD/EUR/... (PLN nie działa).
// RETRY na 429 (rate-limit!) i 5xx z backoffem — przy wielu frazach API łatwo rzuca 429,
// co wcześniej GUBIŁO całe frazy (np. „tennis ball" → 0 mimo 47 realnych produktów).
// deno-lint-ignore no-explicit-any
async function rapidFetch(keyword: string, endpoint: 'hot-products' | 'products', pageSize: number, shipPL = false): Promise<any[]> {
  const key = Deno.env.get('BUD_ALIEXPRESS_RAPIDAPI_KEY') || ''
  const host = rapidHost()
  const enc = encodeURIComponent(keyword)
  // shipPL=true → ship_to_country=PL: ZWRACA tylko produkty wysyłane do Polski (samo country=PL
  // NIE filtruje dostępności — część była „niedostępna w Twoim kraju"). Używa SOURCING ad-first.
  const ship = shipPL ? '&ship_to_country=PL' : ''
  const url = `https://${host}/api/v3/${endpoint}?keywords=${enc}&page_no=1&page_size=${pageSize}&target_currency=USD&target_language=EN&country=PL${ship}&sort=LAST_VOLUME_DESC`
  for (let attempt = 0; attempt < 4; attempt++) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), RAPID_TIMEOUT_MS)
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': host }, signal: ctrl.signal })
      if (res.status === 429 || res.status >= 500) {
        // rate-limit / transient — backoff rosnący (0.5s, 1.2s, 2.5s) i ponów.
        const wait = [500, 1200, 2500][attempt] ?? 2500
        console.warn(`[bud-products] rapid ${res.status} (${endpoint}) kw:`, keyword, '→ retry za', wait, 'ms')
        await new Promise((r) => setTimeout(r, wait))
        continue
      }
      if (!res.ok) { console.error('[bud-products] rapid http', res.status, endpoint, 'kw:', keyword); return [] }
      const data = await res.json()
      const arr = data?.products?.product
      return Array.isArray(arr) ? arr : []
    } catch (e) {
      console.error('[bud-products] rapidFetch attempt', attempt, endpoint, 'kw:', keyword, e instanceof Error ? e.message : e)
      await new Promise((r) => setTimeout(r, 500 + attempt * 500))
    } finally { clearTimeout(t) }
  }
  return []
}

// Mapuje surowy produkt RapidAPI → ProductCandidate (model dropshippingowy):
// cena z AliExpress (USD→PLN) = KOSZT zakupu; detal = koszt × markup (~2,7×).
// deno-lint-ignore no-explicit-any
function mapRapidProduct(p: any, idx: number, rate: number, keyword: string): Record<string, unknown> | null {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : (typeof v === 'number' ? String(v) : ''))
  const title = str(p.product_title)
  const image = str(p.product_main_image_url)
  const cenaUsd = Number(p.target_sale_price)
  if (!title || !image || !isFinite(cenaUsd) || cenaUsd <= 0) return null // sanity: bez tytułu/obrazu/ceny odrzut

  const kosztPln = Math.round(cenaUsd * rate)
  const cenaDetalPl = Math.round(kosztPln * RAPID_RETAIL_MARKUP)
  const marzaPl = cenaDetalPl - kosztPln

  const volume = Number(p.lastest_volume)
  const hasVol = isFinite(volume) && volume > 0
  const rateStr = str(p.evaluate_rate)
  // evaluate_rate to zwykle PROCENT pozytywnych opinii (np. „98.6%") → liczba 0-100.
  // Defensywnie: część wariantów API zwraca skalę gwiazdkową 0-5 (np. „4.8") BEZ „%" —
  // wtedy (brak „%" i wartość ≤5) przeliczamy gwiazdki→% (×20), by próg działał spójnie.
  const ratePct = (() => {
    const hasPct = rateStr.includes('%')
    const n = parseFloat(rateStr.replace('%', '').replace(',', '.'))
    if (!isFinite(n)) return NaN
    if (!hasPct && n > 0 && n <= 5) return n * 20 // skala gwiazdkowa → %
    return n
  })()
  let sygnal = `Z najczęściej zamawianych na AliExpress dla: ${keyword}`
  if (hasVol) sygnal += `, ponad ${volume} zamówień`
  if (rateStr) sygnal += `, ${rateStr} pozytywnych opinii`

  const kategoria = str(p.second_level_category_name) || str(p.first_level_category_name)
  const czemu = kategoria
    ? `Powtarzalny popyt w niszy „${kategoria}" — produkt z górnej półki sprzedaży na AliExpress.`
    : `Produkt z górnej półki sprzedaży na AliExpress — stabilny, powtarzalny popyt.`
  const nazwa = title.length > 70 ? title.slice(0, 67).trim() + '…' : title

  return {
    id: `rapid-${str(p.product_id) || idx + 1}`,
    nazwa,
    opis_1zd: '',
    czemu_sie_sprzedaje: czemu,
    est_cena_detaliczna_pl: cenaDetalPl,
    est_koszt_zakupu: kosztPln,
    est_marza_zl: marzaPl,
    sygnal_popytu: sygnal,
    kategoria,
    ref_url: str(p.promotion_link) || str(p.product_detail_url),
    image,
    // Pola pomocnicze dla scoringu (ETAP 3); NIE wchodzą do kontraktu ProductCandidate
    // (normalizeCandidate ich nie kopiuje, scoreCandidates czyta surową listę z ETAP 2).
    evaluate_rate: rateStr,
    rate_pct: isFinite(ratePct) ? ratePct : null, // % pozytywnych opinii (do twardego progu)
    category_id: str(p.second_level_category_id) || str(p.first_level_category_id) || '',
    volume_unknown: !hasVol,
    _concept_nisza: keyword,
    lastest_volume: hasVol ? volume : 0,
    _volume: hasVol ? volume : 0, // pomocnicze: wybór najmocniejszego (ścieżka fallback ETAP 2)
    najmocniejszy: false,
  }
}

// ── ETAP 1 — OpenAI: generator KONCEPTÓW (15–20) ────────────────────────────
// Zastępuje stary deriveKeywordsEN (6 fraz). Zamiast listy słów — 15–20 RÓŻNYCH
// konceptów-perełek pod rynek PL. Model gpt-5.1 (BUD_PRODUCTS_KW_MODEL), reasoning
// 'medium' (pomysłowość, nie lista), JSON mode. Czyta prompt z settings
// 'budowanie_produkt_keywordgen' + dokleja 'budowanie_produkt_playbook' (oba przez
// loadSettings). Pusty prompt → fallback do starego deriveKeywords (PL) w callerze.
// Wyjście: { koncepty:[{en,nisza,problem_wow}] } → caller wyciąga listę `en`.
// PL→EN: AliExpress search działa po ANGIELSKU (frazy PL dają ~0 wyników, np.
// „akcesoria dla zwierząt"=0, a „cat water fountain"=6430).
async function generateConcepts(
  zadanie: { kategoria: string; budzet: string; styl: string; wyklucz: string[] },
  prompts: { keywordgen: string; playbook: string },
): Promise<{ koncepty: Array<{ en: string; nisza?: string; problem_wow?: string }>; usage: Record<string, unknown> | null }> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey || !prompts.keywordgen) return { koncepty: [], usage: null } // pusty prompt → fallback PL w callerze
  const sys = (prompts.playbook ? prompts.playbook + '\n\n' : '') + prompts.keywordgen
  const wyklucz = (zadanie.wyklucz || []).filter((x) => typeof x === 'string').slice(0, 40)
  const user = [
    `KATEGORIA / zainteresowania klienta: ${zadanie.kategoria || 'bez zawężenia — dobierz najmocniejszą niszę pod te kryteria'}`,
    zadanie.budzet ? `BUDŻET / pułap cenowy: ${zadanie.budzet}` : '',
    zadanie.styl ? `STYL / pozycjonowanie: ${zadanie.styl}` : '',
    wyklucz.length ? `JUŻ POKAZANE / odrzucone (pomiń, znajdź INNE): ${wyklucz.join('; ')}` : '',
    '',
    'Zwróć WYŁĄCZNIE JSON: {"koncepty":[{"en":"...","nisza":"...","problem_wow":"..."}]} — 18–24 pozycji.',
  ].filter(Boolean).join('\n')
  // gpt-5.x: max_completion_tokens to TWARDY cap obejmujący reasoning + output. System prompt
  // urósł (playbook ~12k + keywordgen ~6k), więc cap podniesiony do 9000 (zapas na reasoning
  // low + JSON 15-20 konceptów). RETRY 2× — gdy pierwsza próba zwróci <3 koncepty (truncacja/
  // blip/JSON), ponawiamy, ZANIM spadniemy do generycznego fallbacku w callerze (incydent:
  // padł → deriveKeywordsEN dla „gadżety" dał produkty spoza niszy).
  let lastUsage: Record<string, unknown> | null = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const body: Record<string, unknown> = { model: KW_MODEL, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 9000 }
      if (/^gpt-5/.test(KW_MODEL)) body.reasoning_effort = 'low'
      const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      }, 'kwgen')
      if (!res.ok) { console.error('[bud-products] keywordgen http', res.status, 'próba', attempt); continue }
      const data = await res.json()
      lastUsage = (data?.usage as Record<string, unknown>) || lastUsage
      const content = data?.choices?.[0]?.message?.content || ''
      const finish = data?.choices?.[0]?.finish_reason
      if (!content || finish === 'length') { console.error('[bud-products] keywordgen pusty/ucięty, finish:', finish, 'próba', attempt, 'usage:', JSON.stringify(data?.usage || {})); continue }
      const parsed = JSON.parse(content)
      const raw = Array.isArray(parsed?.koncepty) ? parsed.koncepty : []
      const koncepty: Array<{ en: string; nisza?: string; problem_wow?: string }> = []
      const seen = new Set<string>()
      for (const k of raw) {
        const en = typeof k?.en === 'string' ? k.en.trim() : ''
        if (en.length < 2) continue
        const low = en.toLowerCase()
        if (seen.has(low)) continue
        seen.add(low)
        koncepty.push({ en, nisza: typeof k?.nisza === 'string' ? k.nisza : '', problem_wow: typeof k?.problem_wow === 'string' ? k.problem_wow : '' })
        if (koncepty.length >= 24) break
      }
      if (koncepty.length >= 3) return { koncepty, usage: lastUsage }
      console.error('[bud-products] keywordgen <3 koncepty (' + koncepty.length + '), próba', attempt, '— retry')
    } catch (e) { console.error('[bud-products] generateConcepts błąd próba', attempt, ':', e instanceof Error ? e.message : e) }
  }
  return { koncepty: [], usage: lastUsage }
}

// ── ETAP 2 — RapidAPI hot-products RÓWNOLEGLE + TWARDY PRÓG → kandydaci ───────
// Bierze 8–10 pierwszych konceptów, odpytuje /api/v3/hot-products RÓWNOLEGLE
// (Promise.allSettled), page_size=RAPID_PAGE_SIZE. TWARDY PRÓG (decyzja Tomka):
// produkt przechodzi TYLKO gdy lastest_volume ≥ MIN_VOLUME (50) ORAZ rate_pct ≥
// MIN_RATE_PCT (92% = ocena 4,6/5). Produkty bez wolumenu/oceny ODPADAJĄ (brak dowodu).
// Dopiero w obrębie zaakceptowanych: skrajności cenowe (<40/>500 zł) → rezerwa.
// Dedup po product_id+tytule, pomija wyklucz. Zwraca { kandydaci, apiCalls, przeszly, odrzut_prog }.
async function fetchCandidatesRapid(
  keywords: string[],
  zadanie: { wyklucz: string[] },
): Promise<{ kandydaci: Record<string, unknown>[]; rezerwa: Record<string, unknown>[]; apiCalls: number; surowe: number; przeszly: number; odrzutProg: number }> {
  const rate = await fetchUsdPlnRate()
  const queryList = keywords.slice(0, MAX_KEYWORDS)
  const wyklSet = new Set((zadanie.wyklucz || []).map((w) => w.toLowerCase().trim()).filter(Boolean))

  // ZADANIA: każda fraza × 2 endpointy (hot-products + search). search też zwraca wolumen
  // i często INNE produkty — łączymy oba dla szerszej puli (user: „20 fraz × ~40 produktów").
  const tasks: Array<{ kw: string; ep: 'hot-products' | 'products' }> = []
  for (const kw of queryList) { tasks.push({ kw, ep: 'hot-products' }, { kw, ep: 'products' }) }

  // THROTTLING: batche po RAPID_CONCURRENCY — przeciw rate-limit 429 (który gubił całe frazy).
  const collected: Array<{ kw: string; products: any[] }> = []
  for (let i = 0; i < tasks.length; i += RAPID_CONCURRENCY) {
    const batch = tasks.slice(i, i + RAPID_CONCURRENCY)
    const settled = await Promise.allSettled(batch.map((t) => rapidFetch(t.kw, t.ep, RAPID_PAGE_SIZE)))
    settled.forEach((s, j) => { if (s.status === 'fulfilled' && Array.isArray(s.value)) collected.push({ kw: batch[j].kw, products: s.value }) })
  }
  const apiCalls = tasks.length

  const seenId = new Set<string>()
  const seenTitle = new Set<string>()
  const main: Record<string, unknown>[] = []          // przeszły próg, w realnym zakresie cen
  const spare: Record<string, unknown>[] = []         // przeszły próg, skrajność cenowa — rezerwa
  const rezerwaPodProg: Record<string, unknown>[] = [] // NIE przeszły progu, ale REALNE z AliExpress (zdjęcie+cena)
  const perKw = new Map<string, number>()              // limit produktów spełniających próg / frazę (różnorodność)
  let runningIdx = 0
  let surowe = 0
  let odrzutProg = 0

  for (const { kw, products } of collected) {
    for (let i = 0; i < products.length; i++) {
      const cand = mapRapidProduct(products[i], runningIdx, rate, kw)
      if (!cand) continue
      runningIdx++; surowe++
      // TWARDY ODRZUT po cenie ZAKUPU (AliExpress): <30 zł lub >400 zł = NIGDY (nawet nie rezerwa).
      const koszt = (cand.est_koszt_zakupu as number) || 0
      if (koszt < MIN_KOSZT_ZAKUP || koszt > MAX_KOSZT_ZAKUP) continue
      const idKey = String(cand.id)
      const titleKey = String(cand.nazwa).toLowerCase()
      if (seenId.has(idKey) || seenTitle.has(titleKey)) continue
      let excluded = false
      for (const w of wyklSet) { if (w.length >= 4 && titleKey.includes(w)) { excluded = true; break } }
      if (excluded) continue
      seenId.add(idKey); seenTitle.add(titleKey) // dedup raz, dla progu I rezerwy
      const vol = (cand.lastest_volume as number) || 0
      const rp = cand.rate_pct as number | null
      if (vol < MIN_VOLUME || rp == null || rp < MIN_RATE_PCT) {
        odrzutProg++
        rezerwaPodProg.push(cand) // rezerwa: realne z AliExpress, pod progiem (do adaptacji w niszy)
        continue
      }
      const taken = perKw.get(kw) || 0
      if (taken >= 10) continue // max 10 spełniających próg / frazę (różnorodność, nie 1 nisza)
      perKw.set(kw, taken + 1)
      const detal = (cand.est_cena_detaliczna_pl as number) || 0
      if (detal < RAPID_PRICE_MIN_PL || detal > RAPID_PRICE_MAX_PL) spare.push(cand)
      else main.push(cand)
    }
  }

  // ANTY-KANIBALIZACJA: sort po wolumenie z LOSOWYM JITTEREM (×0.55–1.45) — najmocniejsi
  // popytowo zostają wysoko, ale kolejność różni się per wywołanie, więc różne osoby pytające
  // o tę samą niszę dostają RÓŻNE podzbiory puli (nie zawsze ten sam top). Jakość trzyma próg+scoring.
  const jit = () => 0.55 + Math.random() * 0.9
  for (const c of main) c._sort = ((c.lastest_volume as number) || 0) * jit()
  for (const c of rezerwaPodProg) c._sort = ((c.lastest_volume as number) || 0) * jit()
  main.sort((a, b) => (b._sort as number) - (a._sort as number))
  rezerwaPodProg.sort((a, b) => (b._sort as number) - (a._sort as number))
  const kandydaci = main.concat(spare).slice(0, 60)          // spełniają próg (szersza pula do scoringu)
  const rezerwa = rezerwaPodProg.slice(0, 60)                // realne z AliExpress, pod progiem
  console.log(`[bud-products] ETAP2: ${queryList.length} fraz × 2 endpointy = ${apiCalls} calli, ${surowe} surowych → próg ${kandydaci.length}, rezerwa ${rezerwa.length} (min_vol=${MIN_VOLUME}, min_rate=${MIN_RATE_PCT}%)`)
  return { kandydaci, rezerwa, apiCalls, surowe, przeszly: kandydaci.length, odrzutProg }
}

// ── ETAP 3 — OpenAI: scoring/re-analiza → TOP 5–6 perełek ────────────────────
// NOWA druga tura. Wysyła realnych kandydatów (id,nazwa,koszt,detal,volume,rate,
// kategoria) jako JSON i każe ocenić wg rubryki 7 osi (playbook). Model gpt-5.5
// (BUD_PRODUCTS_MODEL), JSON mode, czyta 'budowanie_produkt_scoring' + dokleja
// 'budowanie_produkt_playbook'. Web_search DOMYŚLNIE OFF (flaga BUD_PRODUCTS_SCORING_WEBSEARCH
// — na razie no-op szkielet). Wyjście: { perelki:[...] } z polami inteligentnymi +
// PRZENIESIONYM id (caller robi JOIN po id → pewne image/ref_url/ceny). Próg score≥70,
// sortuj malejąco, TOP 5–6, min 3. Zwraca { perelki, usage }.
async function scoreCandidates(
  kandydaci: Record<string, unknown>[],
  prompts: { scoring: string; playbook: string },
): Promise<{ perelki: Record<string, unknown>[]; usage: Record<string, unknown> | null }> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey || !prompts.scoring || kandydaci.length === 0) return { perelki: [], usage: null }
  const sys = (prompts.playbook ? prompts.playbook + '\n\n' : '') + prompts.scoring

  // Lekka projekcja dla modelu — tylko pola do oceny (bez image/ref_url, by nie kusić halucynacją URL).
  // Cap na liczbę kandydatów (top po wolumenie) — kontrola kosztu/latencji scoringu.
  const lekkie = kandydaci.slice(0, SCORING_MAX_CANDIDATES).map((c) => ({
    id: c.id,
    nazwa: c.nazwa,
    est_koszt_zakupu: c.est_koszt_zakupu,
    est_cena_detaliczna_pl: c.est_cena_detaliczna_pl,
    est_marza_zl: c.est_marza_zl,
    lastest_volume: c.lastest_volume,      // realna liczba sprzedaży (≥50 — przeszła próg)
    evaluate_rate: c.evaluate_rate,        // % pozytywnych opinii (≥92% — przeszła próg)
    kategoria: c.kategoria,
    nisza: c._concept_nisza,
  }))
  const user = [
    `Oto REALNI kandydaci z AliExpress (ceny w zł). KAŻDY ma potwierdzoną sprzedaż (co najmniej ${MIN_VOLUME_NISZA} zamówień, zwykle dużo więcej) ORAZ ≥${MIN_RATE_PCT}% pozytywnych opinii (≈ocena ${(MIN_RATE_PCT / 20).toFixed(1)}/5) — popyt i jakość są POTWIERDZONE. lastest_volume = liczba zamówień, evaluate_rate = % pozytywów.`,
    'Oceń KAŻDEGO wg rubryki 7 osi, zastosuj gate\'y i odrzut słabych/nasyconych/nudnych. PRIORYTET = efekt WOW (scroll-stopper), nie zwykłe użytkowe commodity. Wyłoń TOP 10 perełek (score≥70, malejąco, RÓŻNORODNE typy; gdy mniej niż 10 — zwróć ile jest, min 3, NIE naciągaj słabych).',
    'W każdej perełce PRZENIEŚ pole "id" dokładnie z kandydata wejściowego (linkowanie do obrazu/linku/ceny — NIE wymyślaj URL ani cen).',
    'Zwróć WYŁĄCZNIE JSON wg kontraktu {"perelki":[...]}.',
    '',
    'KANDYDACI (JSON):',
    JSON.stringify(lekkie),
  ].join('\n')

  // TODO: web_search w scoringu (Wariant B). Domyślnie OFF; gdy SCORING_WEBSEARCH=true,
  // przepiąć ten call na Responses API + tools:[{type:'web_search'}] + max_tool_calls:2
  // dla 2-3 najlepiej rokujących (walidacja świeżości trendu / gęstości reklam). Na razie no-op.
  if (SCORING_WEBSEARCH) console.warn('[bud-products] SCORING_WEBSEARCH=on, ale web_search w scoringu to na razie szkielet (no-op) — scoruję bez wyszukiwania.')

  try {
    const body: Record<string, unknown> = {
      model: OPENAI_MODEL,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      response_format: { type: 'json_object' },
      max_completion_tokens: SCORING_MAX_TOKENS,
    }
    // gpt-5: NIE ustawiamy 'low' w scoringu (chcemy jakości) — zostaw domyślne.
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    }, 'scoring')
    if (!res.ok) { console.error('[bud-products] scoring http', res.status); return { perelki: [], usage: null } }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content || ''
    const finish = data?.choices?.[0]?.finish_reason
    if (!content || finish === 'length') console.error('[bud-products] scoring pusty/ucięty content, finish_reason:', finish, 'usage:', JSON.stringify(data?.usage || {}))
    const parsed = JSON.parse(content)
    const raw = Array.isArray(parsed?.perelki) ? parsed.perelki : (Array.isArray(parsed?.items) ? parsed.items : [])

    // JOIN po id z listą wejściową → pewne image/ref_url/ceny (model dostarcza tylko warstwę inteligentną).
    const byId = new Map<string, Record<string, unknown>>()
    for (const c of kandydaci) byId.set(String(c.id), c)

    const perelki: Record<string, unknown>[] = []
    for (const p of (raw as Array<Record<string, unknown>>)) {
      const base = byId.get(String(p?.id))
      if (!base) continue // model wymyślił id spoza listy — odrzut (anty-halucynacja)
      const score = Number(p?.score)
      if (isFinite(score) && score < SCORE_THRESHOLD) continue // poniżej progu
      perelki.push({
        ...base, // pewne dane z Ali: id, image, ref_url, ceny, kategoria
        // Warstwa inteligentna z modelu (nadpisuje opisowe pola, NIE URL/ceny):
        nazwa: typeof p?.nazwa === 'string' && p.nazwa ? p.nazwa : base.nazwa,
        opis_1zd: typeof p?.opis_1zd === 'string' ? p.opis_1zd : '',
        czemu_sie_sprzedaje: typeof p?.czemu_sie_sprzedaje === 'string' && p.czemu_sie_sprzedaje ? p.czemu_sie_sprzedaje : (base.czemu_sie_sprzedaje || ''),
        problem_wow: typeof p?.problem_wow === 'string' ? p.problem_wow : '',
        kat_wow: typeof p?.kat_wow === 'string' ? p.kat_wow : '',
        dlaczego_pl: typeof p?.dlaczego_pl === 'string' ? p.dlaczego_pl : '',
        pomysl_landing: typeof p?.pomysl_landing === 'string' ? p.pomysl_landing : '',
        przewaga_brandowa: typeof p?.przewaga_brandowa === 'string' ? p.przewaga_brandowa : '',
        perceived_value: typeof p?.perceived_value === 'string' ? p.perceived_value : '',
        pomysl_bundle: typeof p?.pomysl_bundle === 'string' ? p.pomysl_bundle : '',
        score: isFinite(score) ? score : 0,
        score_osie: (p?.score_osie && typeof p.score_osie === 'object') ? p.score_osie : null,
        najmocniejszy: p?.najmocniejszy === true,
      })
    }
    // Sortuj malejąco po score, TOP N (cel 10).
    perelki.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    const top = perelki.slice(0, TOP_PERELKI)
    return { perelki: top, usage: (data?.usage as Record<string, unknown>) || null }
  } catch (e) { console.error('[bud-products] scoreCandidates error:', e instanceof Error ? e.message : e); return { perelki: [], usage: null } }
}

// Fallback degradacyjny ETAP 2 → ProductCandidate (gdy scoring padł/zwrócił 0).
// Wybiera TOP-N po wolumenie z kandydatów ETAP 2, czyści pola pomocnicze.
function fallbackFromCandidates(kandydaci: Record<string, unknown>[], max: number): Record<string, unknown>[] {
  const out = kandydaci.slice()
  // Najmocniejszy = najwyższy lastest_volume (albo pierwszy).
  if (out.length > 0) {
    let bestIdx = 0; let bestVol = -1
    out.forEach((c, i) => { const v = (c._volume as number) || 0; if (v > bestVol) { bestVol = v; bestIdx = i } })
    out.forEach((c, i) => { c.najmocniejszy = i === bestIdx })
  }
  return out.slice(0, max)
}

// ═══════════════════════════════════════════════════════════════════════════
// AD-FIRST DISCOVERY (ScrapeCreators Facebook Ad Library → AliExpress sourcing)
// Oś danych = AKTYWNE REKLAMY w PL (co ktoś realnie reklamuje = zwalidowany winner),
// NIE wolumen AliExpress. AliExpress = tylko SOURCING (cena/zdjęcie/marża/link).
// Dwa tryby (handler body.mode): 'kierunki' (pre-walidacja) i 'produkty' (dobór).
// ═══════════════════════════════════════════════════════════════════════════
const SC_BASE = 'https://api.scrapecreators.com'
const SC_PATH = '/v1/facebook/adLibrary/search/ads'
const SC_TIMEOUT_MS = 25000
const SC_MIN_ADS = (() => { const n = parseInt(Deno.env.get('BUD_SC_MIN_ADS') || '', 10); return (isFinite(n) && n > 0) ? n : 6 })()
const SC_CREDITS_CAP = (() => { const n = parseInt(Deno.env.get('BUD_SC_CREDITS_CAP') || '', 10); return (isFinite(n) && n > 0) ? n : 8 })() // twardy limit wyszukań SC / wywołanie
const SC_SOURCE_TARGET = 10   // ile gotowych ProductCandidate chcemy zwrócić
const SC_SOURCE_TRY = 16      // ilu AdWinnerów próbujemy sourcować (zapas na dropy w PL/verify)
function hasScrapeCreators(): boolean { return !!Deno.env.get('BUD_SCRAPECREATORS_API_KEY') }

interface AdWinner {
  domena: string; slug: string; nazwa: string; copy: string
  image: string; video: boolean; page_name: string; dni_emisji: number; cta: string
}

// Jedno wyszukanie ScrapeCreators (FB Ad Library) — PL, aktywne. 1 kredyt ≈ 25-30 reklam.
// deno-lint-ignore no-explicit-any
async function scSearch(query: string): Promise<{ ads: any[]; credits: number | null; status: number }> {
  const key = Deno.env.get('BUD_SCRAPECREATORS_API_KEY') || ''
  const url = `${SC_BASE}${SC_PATH}?query=${encodeURIComponent(query)}&country=PL&status=active`
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), SC_TIMEOUT_MS)
    try {
      const res = await fetch(url, { headers: { 'x-api-key': key }, signal: ctrl.signal })
      if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, [600, 1500, 3000][attempt] ?? 3000)); continue }
      if (!res.ok) { console.error('[bud-products] SC http', res.status, 'q:', query); return { ads: [], credits: null, status: res.status } }
      const data = await res.json()
      const ads = Array.isArray(data?.searchResults) ? data.searchResults : []
      const credits = (typeof data?.credits_remaining === 'number') ? data.credits_remaining : null
      return { ads, credits, status: 200 }
    } catch (e) { console.error('[bud-products] scSearch', query, e instanceof Error ? e.message : e); await new Promise((r) => setTimeout(r, 600 + attempt * 600)) }
    finally { clearTimeout(t) }
  }
  return { ads: [], credits: null, status: 0 }
}

function parseLinkUrl(u: string): { domena: string; slug: string } {
  try {
    const url = new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u)
    const domena = url.hostname.replace(/^www\./, '')
    const parts = url.pathname.split('/').filter(Boolean)
    const slug = parts.length ? parts[parts.length - 1] : ''
    return { domena, slug }
  } catch { return { domena: '', slug: '' } }
}

// Wieloryby/nie-ecom do odsiania (apki opowiadań, media, książki) — zalewają wyniki.
const AD_WHALE_CATS = ['book', 'app page', 'media/news', 'news', 'publisher', 'magazine', 'website']
// Surowa reklama SC → AdWinner. Wymaga (slug LUB title) ORAZ (zdjęcie LUB wideo).
// deno-lint-ignore no-explicit-any
function mapAdSnapshot(ad: any): AdWinner | null {
  const snap = ad?.snapshot || {}
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const cats = Array.isArray(snap.page_categories) ? snap.page_categories.map((c: any) => String(c).toLowerCase()) : []
  if (cats.some((c: string) => AD_WHALE_CATS.some((w) => c.includes(w)))) return null
  const { domena, slug } = parseLinkUrl(str(snap.link_url))
  const title = str(snap.title)
  const bodyText = (snap.body && typeof snap.body === 'object') ? str((snap.body as any).text) : str(snap.body)
  const images = Array.isArray(snap.images) ? snap.images : []
  const videos = Array.isArray(snap.videos) ? snap.videos : []
  const img = images.length ? (str(images[0]?.original_image_url) || str(images[0]?.resized_image_url) || str(images[0]?.url)) : ''
  const hasVideo = videos.length > 0
  if (!title && !slug) return null
  if (!img && !hasVideo) return null
  const start = Number(ad?.start_date) || 0
  const dni = start > 0 ? Math.max(0, Math.round((Math.floor(Date.now() / 1000) - start) / 86400)) : 0
  return {
    domena, slug,
    nazwa: title || slug.replace(/[-_]/g, ' '),
    copy: bodyText.slice(0, 400),
    image: img,
    video: hasVideo,
    page_name: str(ad?.page_name) || str(snap.page_name),
    dni_emisji: dni,
    cta: str(snap.cta_type),
  }
}

function adWinnerKey(w: AdWinner): string {
  if (w.domena && w.slug) return w.domena + '|' + w.slug
  return (w.nazwa || '').toLowerCase().slice(0, 40)
}
// Dedup po (domena+slug) + ranking WOW: preferuj wideo i dłuższą emisję (=zwalidowany winner).
function dedupRankAds(raw: AdWinner[]): AdWinner[] {
  const seen = new Map<string, AdWinner>()
  const score = (x: AdWinner) => (x.video ? 1000 : 0) + x.dni_emisji
  for (const w of raw) {
    const k = adWinnerKey(w); if (!k) continue
    const prev = seen.get(k)
    if (!prev || score(w) > score(prev)) seen.set(k, w)
  }
  return Array.from(seen.values()).sort((a, b) => score(b) - score(a))
}

// Zbiera AdWinnerów dla listy fraz (każda = 1 kredyt SC), dedup+rank. Zwraca też zużyte kredyty.
async function collectAdWinners(frazy: string[]): Promise<{ winners: AdWinner[]; credits: number; lastRemaining: number | null }> {
  const raw: AdWinner[] = []
  let credits = 0; let lastRemaining: number | null = null
  for (const f of frazy) {
    const r = await scSearch(f)
    credits++
    if (r.credits != null) lastRemaining = r.credits
    for (const ad of r.ads) { const w = mapAdSnapshot(ad); if (w) raw.push(w) }
  }
  return { winners: dedupRankAds(raw), credits, lastRemaining }
}

// GPT #1: dla każdego AdWinnera → angielska fraza zakupowa do AliExpress + krótka polska nazwa.
// Slug/tytuł reklamy bywa PL/marketingowy — Ali szuka po EN. JSON, gpt-5 low.
async function adQueriesAndNames(winners: AdWinner[]): Promise<Array<{ en: string; nazwa_pl: string }>> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  const fallback = winners.map((w) => ({ en: (w.slug || w.nazwa).replace(/[-_]/g, ' '), nazwa_pl: w.nazwa.slice(0, 70) }))
  if (!apiKey || winners.length === 0) return fallback
  const lista = winners.map((w, i) => `${i}. tytuł:"${w.nazwa}" slug:"${w.slug}" opis:"${w.copy.slice(0, 120)}"`).join('\n')
  const sys = 'Jesteś asystentem sourcingu produktów. Dla każdej reklamy podaj: en = KRÓTKA angielska fraza wyszukiwania na AliExpress identyfikująca TEN produkt (2-4 słowa, typ produktu, nie marka sklepu), nazwa_pl = zwięzła polska nazwa produktu (do 60 znaków). Zwróć WYŁĄCZNIE JSON.'
  const user = `Reklamy:\n${lista}\n\nZwróć JSON: {"q":[{"i":<indeks>,"en":"...","nazwa_pl":"..."}]} dla każdej reklamy.`
  try {
    const body: Record<string, unknown> = { model: KW_MODEL, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 4000 }
    if (/^gpt-5/.test(KW_MODEL)) body.reasoning_effort = 'low'
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(body) }, 'adq')
    if (!res.ok) return fallback
    const data = await res.json()
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const arr = Array.isArray(parsed?.q) ? parsed.q : []
    const out = winners.map((w, i) => ({ en: fallback[i].en, nazwa_pl: fallback[i].nazwa_pl }))
    for (const r of arr) {
      const i = Number(r?.i)
      if (Number.isInteger(i) && i >= 0 && i < out.length) {
        if (typeof r.en === 'string' && r.en.trim()) out[i].en = r.en.trim()
        if (typeof r.nazwa_pl === 'string' && r.nazwa_pl.trim()) out[i].nazwa_pl = r.nazwa_pl.trim().slice(0, 70)
      }
    }
    return out
  } catch (e) { console.error('[bud-products] adQueriesAndNames błąd:', e instanceof Error ? e.message : e); return fallback }
}

// GPT #2: weryfikacja zgodności — dla każdej reklamy wskaż, który kandydat AliExpress to TEN SAM
// produkt (typ/funkcja), albo -1 gdy żaden nie pasuje (tekstowe dopasowanie myli się ~50%).
// deno-lint-ignore no-explicit-any
async function verifyAliMatches(pairs: Array<{ nazwa_pl: string; copy: string; cands: any[] }>): Promise<number[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  const fb = pairs.map((p) => (p.cands.length ? 0 : -1)) // fallback: pierwszy kandydat (lub brak)
  if (!apiKey || pairs.length === 0) return fb
  const blocks = pairs.map((p, i) => {
    const cl = p.cands.map((c: any, j: number) => `   [${j}] ${String(c.nazwa).slice(0, 70)} (${c.est_koszt_zakupu} zł zakup)`).join('\n')
    return `${i}. PRODUKT Z REKLAMY: "${p.nazwa_pl}" — ${p.copy.slice(0, 100)}\n  kandydaci AliExpress:\n${cl || '   (brak)'}`
  }).join('\n\n')
  const sys = 'Jesteś weryfikatorem sourcingu. Dla każdej reklamy wskaż indeks kandydata AliExpress, który jest TYM SAMYM produktem co w reklamie (ten sam typ/funkcja). Jeśli żaden nie pasuje (inny produkt, akcesorium, część zamienna, drastycznie inna cena/typ) → -1. Bądź surowy: lepiej -1 niż złe dopasowanie. Zwróć WYŁĄCZNIE JSON.'
  const user = `${blocks}\n\nZwróć JSON: {"m":[{"i":<indeks reklamy>,"c":<indeks kandydata lub -1>}]}`
  try {
    const body: Record<string, unknown> = { model: OPENAI_MODEL, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 3000 }
    if (/^gpt-5/.test(OPENAI_MODEL)) body.reasoning_effort = 'low'
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(body) }, 'verify')
    if (!res.ok) return fb
    const data = await res.json()
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const arr = Array.isArray(parsed?.m) ? parsed.m : []
    const out = fb.slice()
    for (const r of arr) { const i = Number(r?.i); const c = Number(r?.c); if (Number.isInteger(i) && i >= 0 && i < out.length) out[i] = Number.isInteger(c) ? c : -1 }
    return out
  } catch (e) { console.error('[bud-products] verifyAliMatches błąd:', e instanceof Error ? e.message : e); return fb }
}

// Pre-walidacja kierunków: dla każdego {nazwa,fraza} 1 search SC; ok gdy ≥ SC_MIN_ADS winnerów.
// Zwraca też bufor reklam per kierunek (bud-chat zapisze go → discovery serwuje bez nowych kredytów).
// deno-lint-ignore no-explicit-any
async function prevalidateKierunki(kierunki: any[], _sessionId: string): Promise<{ kierunki: Array<{ nazwa: string; fraza: string; ok: boolean; count: number; ads: AdWinner[] }>; credits: number; remaining: number | null }> {
  const out: Array<{ nazwa: string; fraza: string; ok: boolean; count: number; ads: AdWinner[] }> = []
  let credits = 0; let remaining: number | null = null
  for (const k of (kierunki || []).slice(0, 4)) {
    const nazwa = typeof k?.nazwa === 'string' ? k.nazwa.trim() : ''
    const fraza = typeof k?.fraza === 'string' ? k.fraza.trim() : nazwa
    if (!fraza) { out.push({ nazwa, fraza: '', ok: false, count: 0, ads: [] }); continue }
    const r = await scSearch(fraza); credits++
    if (r.credits != null) remaining = r.credits
    const winners = dedupRankAds(r.ads.map(mapAdSnapshot).filter((w): w is AdWinner => !!w))
    out.push({ nazwa, fraza, ok: winners.length >= SC_MIN_ADS, count: winners.length, ads: winners.slice(0, 30) })
  }
  console.log('[bud-products] prevalidateKierunki:', out.map((o) => `${o.nazwa}=${o.count}${o.ok ? '✓' : '✗'}`).join(', '), '| kredyty:', credits)
  return { kierunki: out, credits, remaining }
}

// GPT #0: z kierunku/klimatu klienta → 6-8 KONKRETNYCH polskich fraz produktowych do Ad Library.
// Konkretne (typ produktu), NIE ogólniki („do domu"/„gadżety") — ogólniki łapią szum/wieloryby.
// Każda fraza = inny typ produktu (różnorodność karuzeli). JSON, gpt-5 low.
async function generateAdQueries(kierunek: string, wyklucz: string[]): Promise<string[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey || !kierunek) return kierunek ? [kierunek] : []
  const wy = (wyklucz || []).filter((x) => typeof x === 'string').slice(0, 30)
  const sys = 'Jesteś łowcą winning-productów pod reklamy Facebook/TikTok na rynek PL. Z KLIMATU/świata klienta generujesz konkretne POLSKIE frazy produktowe do wyszukania AKTYWNYCH reklam (Ad Library). Zasady: (1) każda fraza = KONKRETNY typ produktu fizycznego, jaki ludzie realnie reklamują (np. „projektor gwiazd", „masażer karku", „lampka księżyc"), NIE ogólniki („do domu", „gadżety", „akcesoria") — ogólniki łapią szum i wieloryby (apki, książki). (2) Produkty z efektem WOW / scroll-stopper, luźno powiązane z klimatem (nie tylko dosłowny rdzeń). (3) Każda fraza INNY typ produktu. (4) 6-8 fraz. Zwróć WYŁĄCZNIE JSON.'
  const user = `KLIMAT/świat klienta: ${kierunek}${wy.length ? `\nPOMIŃ (już pokazane): ${wy.join('; ')}` : ''}\n\nZwróć JSON: {"frazy":["...","..."]} — 6-8 konkretnych polskich fraz produktowych.`
  try {
    const body: Record<string, unknown> = { model: KW_MODEL, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 2000 }
    if (/^gpt-5/.test(KW_MODEL)) body.reasoning_effort = 'low'
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(body) }, 'adqueries')
    if (!res.ok) return [kierunek]
    const data = await res.json()
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const frazy = Array.isArray(parsed?.frazy) ? parsed.frazy.filter((x: unknown) => typeof x === 'string' && (x as string).trim().length > 1).map((x: string) => x.trim()) : []
    return frazy.length ? frazy.slice(0, 8) : [kierunek]
  } catch (e) { console.error('[bud-products] generateAdQueries błąd:', e instanceof Error ? e.message : e); return [kierunek] }
}

// Dobór produktów ad-first: bufor reklam (z pre-walidacji) LUB świeży search po frazach →
// dedup → sourcing AliExpress (ship_to_country=PL) → GPT weryfikacja → ≤10 ProductCandidate.
async function runAdFirstProdukty(
  inp: { kierunek: string; frazy: string[]; adBuffer: AdWinner[]; wyklucz: string[]; page: number },
  sessionId: string,
): Promise<{ items: Record<string, unknown>[]; source: string; ad_buffer: AdWinner[]; credits: number; remaining: number | null }> {
  const rate = await fetchUsdPlnRate()
  let credits = 0; let remaining: number | null = null
  // 1) Pula reklam: preferuj bufor (0 kredytów); dobierz świeżo gdy płytki.
  let winners: AdWinner[] = Array.isArray(inp.adBuffer) ? inp.adBuffer.filter((w) => w && (w.slug || w.nazwa)) : []
  if (winners.length < SC_SOURCE_TRY) {
    // Frazy: z markera (jeśli model podał) ALBO wygenerowane z kierunku (konkretne PL, anty-wieloryb).
    let frazy = inp.frazy.filter((f) => f && f.trim().length > 1)
    if (!frazy.length) frazy = await generateAdQueries(inp.kierunek, inp.wyklucz)
    const got = await collectAdWinners(frazy.slice(0, SC_CREDITS_CAP))
    credits += got.credits; remaining = got.lastRemaining
    const seen = new Set(winners.map(adWinnerKey))
    for (const w of got.winners) { const k = adWinnerKey(w); if (!seen.has(k)) { seen.add(k); winners.push(w) } }
    winners = dedupRankAds(winners)
  }
  // wyklucz już pokazane (po nazwie/slug)
  const wyklSet = new Set((inp.wyklucz || []).map((x) => x.toLowerCase().trim()).filter(Boolean))
  winners = winners.filter((w) => { const n = (w.nazwa + ' ' + w.slug).toLowerCase(); for (const x of wyklSet) { if (x.length >= 4 && n.includes(x)) return false } return true })
  if (winners.length === 0) return { items: [], source: 'brak_reklam', ad_buffer: [], credits, remaining }

  // 2) Bierzemy pierwszych SC_SOURCE_TRY do sourcingu (reszta zostaje w buforze na „pokaż inne").
  const toSource = winners.slice(0, SC_SOURCE_TRY)
  const rest = winners.slice(SC_SOURCE_TRY)
  // 3) GPT #1: EN-fraza + nazwa_pl per winner.
  const qn = await adQueriesAndNames(toSource)
  // 4) Sourcing AliExpress RÓWNOLEGLE (ship_to_country=PL), batchami.
  const sourced: Array<{ w: AdWinner; nazwa_pl: string; cands: Record<string, unknown>[] }> = []
  const CONC = 5
  for (let i = 0; i < toSource.length; i += CONC) {
    const batch = toSource.slice(i, i + CONC)
    const settled = await Promise.allSettled(batch.map((_w, j) => rapidFetch(qn[i + j].en, 'products', 5, true)))
    settled.forEach((s, j) => {
      const w = batch[j]; const meta = qn[i + j]
      const prods = (s.status === 'fulfilled' && Array.isArray(s.value)) ? s.value : []
      const cands: Record<string, unknown>[] = []
      for (let k = 0; k < prods.length && cands.length < 5; k++) {
        const c = mapRapidProduct(prods[k], k, rate, meta.en)
        if (!c) continue
        const koszt = (c.est_koszt_zakupu as number) || 0
        if (koszt < MIN_KOSZT_ZAKUP || koszt > MAX_KOSZT_ZAKUP) continue // sanity strefy impulsu
        cands.push(c)
      }
      if (cands.length) sourced.push({ w, nazwa_pl: meta.nazwa_pl, cands })
    })
  }
  if (sourced.length === 0) return { items: [], source: 'brak_pl', ad_buffer: rest, credits, remaining }

  // 5) GPT #2: weryfikacja — który kandydat Ali = produkt z reklamy (lub -1).
  const picks = await verifyAliMatches(sourced.map((s) => ({ nazwa_pl: s.nazwa_pl, copy: s.w.copy, cands: s.cands })))

  // 6) Składanie ProductCandidate: nazwa z reklamy (PL), zdjęcie+ceny z Ali, sygnal = dowód reklamowy.
  // DEDUP finalny: różne reklamy tego samego produktu trafiają w ten sam produkt Ali → 1 karta.
  const seenAliId = new Set<string>()
  const seenName = new Set<string>()
  const normName = (n: string) => n.toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  const rawItems: Record<string, unknown>[] = []
  sourced.forEach((s, i) => {
    const ci = picks[i]
    if (!Number.isInteger(ci) || ci < 0 || ci >= s.cands.length) return // brak dopasowania → drop
    const c = s.cands[ci]
    const aliId = String(c.id || '')
    const nk = normName(String(s.nazwa_pl || c.nazwa || ''))
    if ((aliId && seenAliId.has(aliId)) || (nk && seenName.has(nk))) return // duplikat → pomiń
    if (aliId) seenAliId.add(aliId)
    if (nk) seenName.add(nk)
    const dni = s.w.dni_emisji
    const sygnal = s.w.page_name
      ? `Reklama aktywna${dni > 0 ? ` od ~${dni} dni` : ''} — ${s.w.page_name}`
      : `Produkt aktywnie reklamowany w Polsce${dni > 0 ? ` (~${dni} dni)` : ''}`
    rawItems.push({
      id: c.id,
      nazwa: s.nazwa_pl || (c.nazwa as string),
      opis_1zd: s.w.copy.slice(0, 140),
      czemu_sie_sprzedaje: `Realnie reklamowany w PL${s.w.video ? ' (wideo)' : ''} — sprawdzony scroll-stopper, nie commodity z półki.`,
      est_cena_detaliczna_pl: c.est_cena_detaliczna_pl,
      est_koszt_zakupu: c.est_koszt_zakupu,
      est_marza_zl: c.est_marza_zl,
      sygnal_popytu: sygnal,
      kategoria: inp.kierunek,
      ref_url: c.ref_url,
      image: c.image,
      najmocniejszy: false,
    })
    if (rawItems.length >= SC_SOURCE_TARGET) return
  })

  const items = rawItems.slice(0, SC_SOURCE_TARGET).filter(saneCandidate).map((c, i) => normalizeCandidate(c, i))
  if (items.length) { const si = 0; items.forEach((x, i) => { x.najmocniejszy = i === si }) }
  console.log('[bud-products] ad-first:', { winners: winners.length, toSource: toSource.length, sourced: sourced.length, dopasowane: items.length, credits })
  if (sessionId) { try { await logRapidUsage(sessionId, { source: 'adfirst', counts: { winners: winners.length, sourced: sourced.length, items: items.length, sc_credits: credits } }, items.length, 'adfirst') } catch (_e) { /* */ } }
  return { items, source: items.length ? 'adfirst' : 'brak_dopasowan', ad_buffer: rest, credits, remaining }
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)
  // Endpoint WEWNĘTRZNY — jedynym wywołującym jest bud-chat (server-to-server)
  // z kluczem service-role. Front go NIE woła. Bramka jak w bud-assess: bez niej
  // publiczny endpoint (--no-verify-jwt) pozwalałby palić tokeny OpenAI + web_search
  // dowolnemu, kto zna URL. Wymóg klucza service-role zamyka to w 100%.
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authToken = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!SERVICE_KEY || authToken !== SERVICE_KEY) {
    return jsonResponse({ error: 'brak_dostepu' }, 401, cors)
  }
  try {
    // OPENAI_API_KEY potrzebny TYLKO dla ścieżki web_search (fallback). Gdy działa
    // adapter AliExpress, brak klucza OpenAI nie jest błędem — sprawdzamy go niżej,
    // dopiero gdy faktycznie wchodzimy w ścieżkę web_search.
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    let body: { sessionId?: string; kategoria?: string; budzet?: string; styl?: string; wyklucz?: unknown; page?: number; mode?: string; kierunki?: unknown; frazy?: unknown; ad_buffer?: unknown }
    try { body = await req.json() } catch { return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors) }

    // ── AD-FIRST (ScrapeCreators) — NOWA oś, tryby przez body.mode. Gdy klucz SC jest
    //    i mode pasuje, obsługujemy tu i WYCHODZIMY; inaczej spadamy do starych ścieżek niżej.
    const mode = typeof body.mode === 'string' ? body.mode : ''
    if (hasScrapeCreators() && (mode === 'kierunki' || mode === 'produkty')) {
      const sid = (typeof body.sessionId === 'string' ? body.sessionId : '').trim()
      if (mode === 'kierunki') {
        const kierunki = Array.isArray(body.kierunki) ? body.kierunki : []
        if (!kierunki.length) return jsonResponse({ error: 'brak_kierunkow' }, 400, cors)
        const pv = await prevalidateKierunki(kierunki, sid)
        return jsonResponse({ mode: 'kierunki', kierunki: pv.kierunki, sc_credits: pv.credits, sc_remaining: pv.remaining }, 200, cors)
      }
      // mode === 'produkty'
      const kierunek = typeof body.kategoria === 'string' ? body.kategoria : ''
      const frazy = Array.isArray(body.frazy) ? (body.frazy as unknown[]).filter((x): x is string => typeof x === 'string') : []
      const adBuffer = Array.isArray(body.ad_buffer) ? (body.ad_buffer as AdWinner[]) : []
      const wyklP = Array.isArray(body.wyklucz) ? (body.wyklucz as unknown[]).filter((x): x is string => typeof x === 'string') : []
      const pageP = (typeof body.page === 'number' && body.page > 0) ? Math.floor(body.page) : 1
      if (!frazy.length && !adBuffer.length && !kierunek) return jsonResponse({ error: 'brak_kryteriow' }, 400, cors)
      // frazy puste → runAdFirstProdukty wygeneruje konkretne PL frazy z kierunku (generateAdQueries)
      const r = await runAdFirstProdukty({ kierunek, frazy, adBuffer, wyklucz: wyklP, page: pageP }, sid)
      return jsonResponse({ items: r.items, page: pageP, source: r.source, ad_buffer: r.ad_buffer, sc_credits: r.credits, sc_remaining: r.remaining }, 200, cors)
    }

    const kategoria = typeof body.kategoria === 'string' ? body.kategoria : ''
    const budzet = typeof body.budzet === 'string' ? body.budzet : ''
    const styl = typeof body.styl === 'string' ? body.styl : ''
    const wyklucz = Array.isArray(body.wyklucz) ? body.wyklucz : []
    const page = (typeof body.page === 'number' && body.page > 0) ? Math.floor(body.page) : 1
    // Kategoria może być pusta (opcja „dobierz za mnie") — wtedy model sam dobiera niszę.
    if (!kategoria && !budzet && !styl && wyklucz.length === 0) {
      // Brak JAKICHKOLWIEK kryteriów = błędne wywołanie (bud-chat zawsze ma chociaż kategorię/budżet).
      return jsonResponse({ error: 'brak_kryteriow' }, 400, cors)
    }

    const sessionId = (body.sessionId || '').trim()
    const wykluczStr = wyklucz.filter((x) => typeof x === 'string') as string[]

    // ── ŚCIEŻKA 0 (PRIORYTET): pipeline 3-etapowy „perełki" na RapidAPI ──────────
    // Gate BUD_ALIEXPRESS_RAPIDAPI_KEY. ETAP 1 (OpenAI: 15–20 konceptów) → ETAP 2
    // (RapidAPI RÓWNOLEGLE: 20–40 realnych kandydatów) → ETAP 3 (OpenAI scoring 7-osi:
    // TOP 5–6 perełek, join po id → pewne image/ceny). Fallback degradacyjny: scoring
    // padł/0 → TOP-N z ETAP 2; ETAP 2 <3 lub błąd → ścieżka web_search NIŻEJ (NIETKNIĘTA).
    // BEZ cache i BEZ hot-products-download w tej wersji (TODO: B4/B6 — oszczędność RapidAPI).
    if (hasAliexpressRapid()) {
      try {
        const prompts = await loadSettings(['budowanie_produkt_playbook', 'budowanie_produkt_keywordgen', 'budowanie_produkt_scoring'])
        const playbook = prompts['budowanie_produkt_playbook'] || ''

        // ETAP 1 — koncepty (15–20). Pusty prompt/awaria → fallback ANGIELSKI (bezpiecznik).
        const gen = await generateConcepts({ kategoria, budzet, styl, wyklucz: wykluczStr }, { keywordgen: prompts['budowanie_produkt_keywordgen'] || '', playbook })
        let keywords = gen.koncepty.map((k) => k.en)
        const kwCalls = gen.usage ? 1 : 0
        const kwFallback = keywords.length < 3
        if (kwFallback) {
          console.error('[bud-products] ETAP 1 dał <3 koncepty (' + keywords.length + ') → fallback EN deriveKeywordsEN')
          keywords = deriveKeywordsEN(kategoria, styl) // fallback EN (AliExpress nie szuka po PL)
        }

        // ETAP 2 — realne produkty RÓWNOLEGLE: spełniające twardy próg (≥50 sprzedaży ∧ ≥92%).
        const stage2 = await fetchCandidatesRapid(keywords, { wyklucz: wykluczStr })
        // PRÓG ADAPTACYJNY: gdy <3 z ≥50 sprzedaży (wąska nisza, np. tenis) — dobierz z rezerwy
        // produkty z mniejszą, ale REALNĄ sprzedażą (≥MIN_VOLUME_NISZA) i WCIĄŻ ≥92% opinii.
        // Jakość oceny bez kompromisu; tylko wymóg wolumenu schodzi, bo nisza ma mniejszy rynek.
        let pulaProg = stage2.kandydaci
        let nisza = false
        // Dobieramy niszowe gdy mocnych (≥MIN_VOLUME sprzedaży) jest MAŁO (<8) — nie dopiero <3.
        // Inaczej w niszy (np. tenis po filtrze ceny) scoring dostaje 3 kandydatów i łatwo daje <3
        // perełek → niestabilny „brak". Cel: scoring ma ~12+ realnych kandydatów do wyboru.
        if (pulaProg.length < 8) {
          const niszowe = stage2.rezerwa.filter((c) => ((c.lastest_volume as number) || 0) >= MIN_VOLUME_NISZA && (c.rate_pct as number | null) != null && (c.rate_pct as number) >= MIN_RATE_PCT)
          if (niszowe.length > 0) {
            pulaProg = stage2.kandydaci.concat(niszowe).slice(0, 40)
            nisza = true
            console.warn('[bud-products] PRÓG ADAPTACYJNY (nisza): tylko ' + stage2.kandydaci.length + ' z ≥' + MIN_VOLUME + ' → dobrano ' + niszowe.length + ' z ≥' + MIN_VOLUME_NISZA + ' sprzedaży i ≥' + MIN_RATE_PCT + '%. Pula:', pulaProg.length)
          }
        }
        if (pulaProg.length >= 3) {
          // ETAP 3 — scoring → TOP 5–6 perełek (z produktów spełniających próg, z adaptacją w niszy).
          const scored = await scoreCandidates(pulaProg, { scoring: prompts['budowanie_produkt_scoring'] || '', playbook })
          if (scored.perelki.length >= 3) {
            const items = scored.perelki.map((c, i) => normalizeCandidate(c, i))
            const strongIdx = items.findIndex((x) => x.najmocniejszy === true)
            items.forEach((x, i) => { x.najmocniejszy = i === (strongIdx >= 0 ? strongIdx : 0) })
            const src = nisza ? 'rapidapi_scored_nisza' : 'rapidapi_scored'
            if (sessionId) {
              await logRapidUsage(sessionId, {
                keywordgen: { model: KW_MODEL, usage: gen.usage, calls: kwCalls },
                rapid_calls: stage2.apiCalls,
                scoring: { model: OPENAI_MODEL, usage: scored.usage, calls: scored.usage ? 1 : 0 },
                websearch_calls: 0,
                counts: { kw: keywords.length, kw_fallback: kwFallback, stage2: stage2.kandydaci.length, pula: pulaProg.length, nisza, rezerwa: stage2.rezerwa.length, scored: scored.perelki.length, odrzut_prog: stage2.odrzutProg },
              }, items.length, src)
            }
            return jsonResponse({ items, page, source: src, api_calls: stage2.apiCalls }, 200, cors)
          }
          // Scoring <3 perełki → „jakość albo nic": NIE pokazujemy surowych angielskich produktów
          // (bez analizy). Zwracamy BRAK — bud-chat poprowadzi do zmiany kategorii / linku Ali.
          console.warn('[bud-products] scoring <3 perełki → BRAK (jakość albo nic). scored:', scored.perelki.length, 'z', stage2.kandydaci.length, 'spełniających próg')
          if (sessionId) {
            await logRapidUsage(sessionId, {
              keywordgen: { model: KW_MODEL, usage: gen.usage, calls: kwCalls },
              rapid_calls: stage2.apiCalls,
              scoring: { model: OPENAI_MODEL, usage: scored.usage, calls: scored.usage ? 1 : 0 },
              websearch_calls: 0,
              counts: { kw: keywords.length, kw_fallback: kwFallback, stage2: stage2.kandydaci.length, rezerwa: stage2.rezerwa.length, scored: scored.perelki.length, odrzut_prog: stage2.odrzutProg, surowe: stage2.surowe },
            }, 0, 'brak_perelek')
          }
          return jsonResponse({ items: [], page, source: 'brak_perelek', api_calls: stage2.apiCalls }, 200, cors)
        }
        // <3 produkty spełniają twardy próg → BRAK (jakość albo nic; NIE web_search/Allegro).
        console.warn('[bud-products] <3 perełek spełnia próg → BRAK. spełnia:', stage2.kandydaci.length, 'pod progiem:', stage2.rezerwa.length)
        if (sessionId) {
          await logRapidUsage(sessionId, {
            keywordgen: { model: KW_MODEL, usage: gen.usage, calls: kwCalls },
            rapid_calls: stage2.apiCalls,
            scoring: { model: OPENAI_MODEL, usage: null, calls: 0 },
            websearch_calls: 0,
            counts: { kw: keywords.length, kw_fallback: kwFallback, stage2: stage2.kandydaci.length, rezerwa: stage2.rezerwa.length, scored: 0, odrzut_prog: stage2.odrzutProg },
          }, 0, 'brak_perelek')
        }
        return jsonResponse({ items: [], page, source: 'brak_perelek', api_calls: stage2.apiCalls }, 200, cors)
      } catch (e) {
        console.error('[bud-products] pipeline RapidAPI błąd, fallback HMAC/web_search:', e instanceof Error ? e.message : e)
      }
    }

    // ── ŚCIEŻKA 1 (GATED): AliExpress Affiliate API — realne produkty ──────────
    // Gdy są klucze i adapter zwróci ≥3 RÓŻNYCH produktów, zwracamy je od razu
    // (zdjęcie + cena PLN + liczba zamówień + link). Inaczej (brak kluczy lub <3)
    // spadamy do ścieżki web_search NIŻEJ — NIE psujemy jej.
    if (hasAliexpress()) {
      try {
        const ali = await fetchAliexpressCandidates({ kategoria, budzet, styl, wyklucz: wykluczStr }, 6)
        if (ali.items.length >= 3) {
          const items = ali.items.map((c, i) => normalizeCandidate(c, i))
          // Dokładnie jeden najmocniejszy (na wypadek gdyby map nie ustawił).
          const strongIdx = items.findIndex((x) => x.najmocniejszy === true)
          items.forEach((x, i) => { x.najmocniejszy = i === (strongIdx >= 0 ? strongIdx : 0) })
          if (sessionId) await logAliUsage(sessionId, ali.apiCalls, items.length)
          return jsonResponse({ items, page, source: 'aliexpress', api_calls: ali.apiCalls }, 200, cors)
        }
        console.error('[bud-products] AliExpress dał <3 kandydatów, fallback web_search:', ali.items.length)
      } catch (e) {
        console.error('[bud-products] AliExpress błąd, fallback web_search:', e instanceof Error ? e.message : e)
      }
    }

    // ── ŚCIEŻKA 2 (FALLBACK): web_search (OpenAI Responses API) — bez zmian ────
    if (!OPENAI_API_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)

    // System prompt z settings (jak w innych bud-*; pusty fallback — kod nie trzyma treści).
    if (!SYSTEM_PROMPT) {
      try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        if (SUPABASE_URL && SERVICE_KEY) {
          const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
          const { data: __pd } = await supabase.from('settings').select('key, value').in('key', ['budowanie_prompt_products_system'])
          const __pv = (k: string) => ((__pd || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''
          SYSTEM_PROMPT = __pv('budowanie_prompt_products_system')
        }
      } catch (_e) { /* fallback: pusty prompt */ }
    }

    const input = (SYSTEM_PROMPT ? SYSTEM_PROMPT + '\n\n' : '') + buildUser({ kategoria, budzet, styl, wyklucz })

    const res = await openaiFetchRetry('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      // max_tool_calls: twardy sufit liczby wyszukań. 3 (nie 6) — SZYBKOŚĆ: 6 sekwencyjnych
      // wyszukań na gpt-5.5 dawało ~74 s (user czekał za długo). 3 wyszukania + gpt-5.1
      // (env BUD_PRODUCTS_MODEL) tną to ~2-3×; głębię i tak domyka bramka bud-assess na wybranym.
      body: JSON.stringify({
        model: OPENAI_MODEL,
        tools: [{ type: 'web_search' }],
        max_tool_calls: 3,
        input,
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[bud-products] openai error:', res.status, errText.slice(0, 500))
      return jsonResponse({ error: 'blad_propozycji' }, 502, cors)
    }
    const data = await res.json()
    const output = Array.isArray(data?.output) ? data.output : []
    const searchCalls = output.filter((o: Record<string, unknown>) => o?.type === 'web_search_call').length
    let text = typeof data?.output_text === 'string' ? data.output_text : ''
    if (!text) {
      for (const item of output) {
        if (item?.type === 'message' && Array.isArray(item.content)) {
          for (const c of item.content) { if (c?.type === 'output_text' && typeof c.text === 'string') text += c.text }
        }
      }
    }

    const items = finalizeItems(text)
    // Zwracamy min. 3 (rubryka). Mniej = research zawiódł → 502, bud-chat ma fallback/retry.
    if (items.length < 3) {
      console.error('[bud-products] za mało sanych kandydatów:', items.length, 'searches:', searchCalls, 'sample:', String(text).slice(0, 300))
      if (sessionId) await logCost(sessionId, OPENAI_MODEL, data?.usage || null, searchCalls, 0)
      return jsonResponse({ error: 'blad_propozycji' }, 502, cors)
    }

    if (sessionId) await logCost(sessionId, OPENAI_MODEL, data?.usage || null, searchCalls, items.length)
    // Zwracamy WSZYSTKICH sanych kandydatów (bufor 8–10) — bud-chat decyduje, ilu pokazać
    // (serwuje 5, resztę trzyma w product_input.kandydaci pod „pokaż inne").
    return jsonResponse({ items, page, source: 'web_search', searches: searchCalls }, 200, cors)
  } catch (e) {
    console.error('[bud-products] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
