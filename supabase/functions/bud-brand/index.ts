// bud-brand — TOŻSAMOŚĆ MARKI sklepu e-com dla lejka „Zbuduję" (AWE).
//
// Generuje markę dla sklepu z produktem fizycznym: nazwa + warianty + tagline +
// paleta (6 hex) + fonty (3) + opis + sugestia domeny .pl, a następnie LOGO.
// Wynik zapisuje do bud_sessions.brand (jsonb) — z tego źródła bud-image trzyma
// spójność wszystkich makiet (sklep / karta produktu / logo / lifestyle).
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy bud-brand --no-verify-jwt
//
// Body: { sessionId, force? }
//   Bez force i gdy brand już istnieje → zwraca istniejący (idempotencja).
//
// Sekrety:
//   OPENAI_API_KEY     — klucz OpenAI
//   BUD_BRAND_MODEL    — override modelu marki (default BUD_OPENAI_MODEL -> gpt-5.1)
//   SPAR_CRON_SECRET   — sekret, którym uwierzytelniamy się do generate-image (logo)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const OPENAI_MODEL = Deno.env.get('BUD_BRAND_MODEL') || Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.1'
// gpt-5.x: JSON-call MUSI mieć zapas tokenów (reasoning zjada budżet) + effort low,
// inaczej content wraca pusty. Hojny budżet bo marka to mały, jednorazowy koszt.
const MAX_TOKENS = 5000
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }
const HEX_RE = /^#?[0-9a-fA-F]{6}$/

function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

// ── Prompt marki ────────────────────────────────────────────────────────────
function buildPrompt(
  niche: string,
  brief: Record<string, unknown> | null,
  karta: Record<string, unknown> | null,
  track: string,
): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const fakty: string[] = []
  const produkt = s(brief?.produkt) || s(karta?.produkt) || s(brief?.opis)
  if (niche) fakty.push(`Nisza / kategoria: ${niche.slice(0, 200)}`)
  if (produkt) fakty.push(`Produkt: ${produkt}`)
  if (s(brief?.dla_kogo) || s(karta?.dla_kogo)) fakty.push(`Dla kogo: ${s(brief?.dla_kogo) || s(karta?.dla_kogo)}`)
  if (s(brief?.problem) || s(karta?.problem)) fakty.push(`Obietnica / problem: ${s(brief?.problem) || s(karta?.problem)}`)
  if (karta?.kierunek) fakty.push(`Kierunek / pozycjonowanie: ${s(karta.kierunek)}`)
  if (track) fakty.push(`Kierunek rozmowy: ${track.toUpperCase()}`)

  return `Jesteś dyrektorem kreatywnym tworzącym markę dla polskiego SKLEPU INTERNETOWEGO sprzedającego PRODUKT FIZYCZNY. Mówisz głosem Tomka Niedźwieckiego: konkretnie, bez anglicyzmów i korpo-bełkotu, prosto i z charakterem.

KONTEKST:
${fakty.join('\n')}

ZAPROJEKTUJ markę gotową do uruchomienia sklepu i kampanii reklamowych Meta/TikTok + COD. Zasady:
- NAZWA: krótka (1-2 słowa), łatwa do wymówienia i zapamiętania, dobrze wyglądająca w logo i adresie. Może być polska albo neutralna/międzynarodowa, ale BEZ sztucznych anglicyzmów i bez generycznych „shop/store/online". Unikaj nazw zajętych przez znane marki.
- PALETA: dokładnie 6 kolorów HEX pasujących do produktu i grupy docelowej (1 dominujący/tło, 1 mocny akcent na przyciski „Do koszyka"/CTA, reszta wspierające). Kontrastowe i czytelne.
- FONTY: dokładnie 3 realne kroje (np. nagłówkowy, tekstowy, ewentualnie akcentowy) — istniejące, dostępne fonty (np. z Google Fonts), pasujące do charakteru produktu.
- TAGLINE: jedno krótkie, konkretne polskie hasło sprzedażowe (co produkt daje klientowi), bez patosu.
- DOMENA: jedna sensowna sugestia domeny .pl wyprowadzona z nazwy (sama nazwa domeny, np. „nazwa.pl" lub „nazwasklep.pl"). To tylko SUGESTIA — nie sprawdzamy dostępności.

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez tekstu przed/po):
{
  "nazwa": "Nazwa Marki",
  "alt_nazwy": ["3-4 alternatywne nazwy zapasowe"],
  "tagline": "krótkie polskie hasło sprzedażowe",
  "paleta": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"],
  "fonty": ["Font Nagłówkowy", "Font Tekstowy", "Font Akcentowy"],
  "opis": "2-3 zdania o marce: co sprzedaje, dla kogo, jaki ma charakter (głos Tomka, po polsku)",
  "domena_pl_sugestia": "nazwa.pl"
}`
}

// deno-lint-ignore no-explicit-any
function saneBrand(b: any): boolean {
  if (!b || typeof b !== 'object') return false
  if (typeof b.nazwa !== 'string' || !b.nazwa.trim()) return false
  if (!Array.isArray(b.paleta) || b.paleta.length < 1) return false
  if (!b.paleta.every((x: unknown) => typeof x === 'string' && HEX_RE.test(x.trim()))) return false
  if (!Array.isArray(b.fonty) || b.fonty.length < 1) return false
  if (!b.fonty.every((x: unknown) => typeof x === 'string' && (x as string).trim().length > 0)) return false
  return true
}

// Normalizacja: hex z „#", przycięcie list do oczekiwanych długości.
// deno-lint-ignore no-explicit-any
function normalizeBrand(b: any): Record<string, unknown> {
  const hex = (x: string) => { const t = x.trim(); return t.startsWith('#') ? t.toLowerCase() : '#' + t.toLowerCase() }
  const paleta = (b.paleta as unknown[]).filter((x) => typeof x === 'string' && HEX_RE.test((x as string).trim())).map((x) => hex(x as string)).slice(0, 6)
  const fonty = (b.fonty as unknown[]).filter((x) => typeof x === 'string' && (x as string).trim()).map((x) => (x as string).trim()).slice(0, 3)
  const altNazwy = Array.isArray(b.alt_nazwy) ? (b.alt_nazwy as unknown[]).filter((x) => typeof x === 'string' && (x as string).trim()).map((x) => (x as string).trim()).slice(0, 5) : []
  return {
    nazwa: (b.nazwa as string).trim().slice(0, 80),
    alt_nazwy: altNazwy,
    tagline: typeof b.tagline === 'string' ? b.tagline.trim().slice(0, 160) : '',
    paleta,
    fonty,
    opis: typeof b.opis === 'string' ? b.opis.trim().slice(0, 600) : '',
    domena_pl_sugestia: typeof b.domena_pl_sugestia === 'string' ? b.domena_pl_sugestia.trim().slice(0, 120) : '',
  }
}

// Jedno wywołanie OpenAI (chat/completions, JSON). Zwraca {obj, usage}.
async function callOnce(apiKey: string, prompt: string, maxTokens: number): Promise<{ obj: Record<string, unknown> | null; usage: { i: number; c: number; o: number } | null }> {
  const isGpt5 = /^gpt-5/.test(OPENAI_MODEL)
  // deno-lint-ignore no-explicit-any
  const payload: Record<string, any> = {
    model: OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_completion_tokens: maxTokens,
  }
  if (isGpt5) payload.reasoning_effort = 'low'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  })
  if (!res.ok) { console.error('[bud-brand] openai error:', res.status, (await res.text().catch(() => '')).slice(0, 400)); return { obj: null, usage: null } }
  const data = await res.json()
  const u = data?.usage || {}
  const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
  const content = data?.choices?.[0]?.message?.content
  try { return { obj: JSON.parse(content), usage } }
  catch { console.error('[bud-brand] zły JSON, finish:', data?.choices?.[0]?.finish_reason, String(content).slice(0, 200)); return { obj: null, usage } }
}

// Prompt dla logo (przekazywany do generate-image; type:'logo').
function buildLogoPrompt(brand: Record<string, unknown>, niche: string, brief: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')
  const nazwa = (brand.nazwa as string) || 'Marka'
  const paleta = Array.isArray(brand.paleta) ? (brand.paleta as string[]).slice(0, 4).join(', ') : ''
  const produkt = s(brief?.produkt) || niche || s(brief?.opis)
  return `Profesjonalne LOGO marki e-commerce „${nazwa}" — czysty, nowoczesny znak na jednolitym, bardzo jasnym/białym tle. Wektorowy, minimalistyczny charakter: prosty symbol/sygnet + nazwa „${nazwa}" zapisana czytelnym, zapamiętywalnym krojem. Marka sprzedaje: ${produkt}. ${paleta ? `Kolory logo z palety marki: ${paleta}.` : ''} Nazwa „${nazwa}" napisana DOKŁADNIE tak, bezbłędnie (z polskimi znakami jeśli występują). Pixel-perfect, ostre krawędzie, bez efektu zdjęcia, bez znaków wodnych, bez logotypów firm trzecich, bez dodatkowego tekstu poza nazwą marki.`
}

// Wywołanie wspólnej funkcji generate-image dla logo. Zwraca URL albo null.
// Auth: service-role Bearer (akceptowany przez generate-image) + x-cron-secret
// (pamięć: dla generate-image zwykły sb_secret_ Bearer daje 401 — service_role
// Bearer JEST akceptowany, a x-cron-secret to drugi, pewny tor).
async function generateLogo(
  supabaseUrl: string,
  serviceKey: string,
  cronSecret: string,
  prompt: string,
): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    }
    if (cronSecret) headers['x-cron-secret'] = cronSecret
    const res = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        type: 'logo',
        quality: 'medium',
        provider: 'gpt-image-2',
        aspect_ratio: '1:1',
      }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) { console.error('[bud-brand] generate-image error:', res.status, JSON.stringify(data).slice(0, 300)); return null }
    const url = data?.images?.[0]?.url
    return (typeof url === 'string' && url) ? url : null
  } catch (e) {
    console.error('[bud-brand] generate-image exception:', e)
    return null
  }
}

// ── H2: nazwy + sprawdzanie domen .pl + 3 logo ──────────────────────────────
function slugifyPl(s: string): string {
  const map: Record<string, string> = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' }
  return (s || '').toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => map[c] || c).replace(/[^a-z0-9]/g, '').slice(0, 40)
}
// Wolna domena .pl: RDAP oficjalnego rejestru NASK (rdap.dns.pl) — 404 = WOLNA, 200 = ZAJĘTA.
// RDAP łapie też domeny ZAPARKOWANE bez rekordów DNS (DoH przepuszczał je jako „wolne" — fałszywie).
// Fallback na DoH (Cloudflare NS) tylko gdy RDAP odmówi (429/błąd), żeby nie stracić wszystkich checków.
// Konserwatywnie: niepewne → zajęta (nie sugerujemy wątpliwych).
async function plDomainFree(domain: string): Promise<boolean> {
  try {
    const r = await fetch('https://rdap.dns.pl/domain/' + encodeURIComponent(domain), { headers: { accept: 'application/rdap+json' } })
    if (r.status === 404) return true
    if (r.status === 200) return false
    // 429 / inny status → fallback DoH niżej
  } catch { /* sieć — fallback DoH */ }
  try {
    const r2 = await fetch('https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(domain) + '&type=NS', { headers: { accept: 'application/dns-json' } })
    if (!r2.ok) return false
    // deno-lint-ignore no-explicit-any
    const d: any = await r2.json()
    if (d.Status === 3) return true
    return false
  } catch { return false }
}
function brandCtx(ust: Record<string, unknown> | null, niche: string, brief: Record<string, unknown> | null): string {
  const s = (v: unknown, m = 200) => (typeof v === 'string' ? v.slice(0, m) : '')
  const parts: string[] = []
  if (ust) {
    if (s(ust.dla_kogo)) parts.push('Dla kogo: ' + s(ust.dla_kogo))
    // deno-lint-ignore no-explicit-any
    if (s(ust.kat) || s((ust as any)['kąt'])) parts.push('Kąt: ' + (s(ust.kat) || s((ust as any)['kąt'])))
    if (s(ust.ton_marki) || s(ust.ton)) parts.push('Ton: ' + (s(ust.ton_marki) || s(ust.ton)))
    if (Array.isArray(ust.korzysci)) parts.push('Korzyści: ' + (ust.korzysci as unknown[]).slice(0, 4).join('; '))
  }
  if (niche) parts.push('Nisza/produkt: ' + niche.slice(0, 160))
  if (brief && s(brief.produkt)) parts.push('Produkt: ' + s(brief.produkt))
  return parts.join('\n')
}
type Usage = { i: number; c: number; o: number }
async function genNameCandidatesOnce(apiKey: string, ctx: string, n: number, acc?: Usage): Promise<string[]> {
  const prompt = 'Jesteś namingowcem marek e-commerce (rynek PL). Zaproponuj ' + n + ' KRÓTKICH nazw marki jednoproduktowego sklepu. ZASADY: 1-2 słowa, MAX 12 znaków, łatwe do wymówienia i zapamiętania, brandowalne i dobrze wyglądające w domenie .pl, sugerują kategorię/emocję produktu. Mix: część polskich (bezpośrednie, fachowe), część krótkich nowoczesnych w stylu DTC (premium, neutralne). ZAKAZ: generycznych shop/store/sklep, nazw znanych marek, anglicyzmów-wypełniaczy. KONTEKST:\n' + ctx + '\nZwróć WYŁĄCZNIE JSON: {"nazwy":["...", ...]}'
  // deno-lint-ignore no-explicit-any
  const payload: any = { model: OPENAI_MODEL, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, max_completion_tokens: 1600 }
  if (/^gpt-5/.test(OPENAI_MODEL)) payload.reasoning_effort = 'low'
  try {
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(payload) }, 'brand-names')
    if (!res.ok) { console.warn('[bud-brand] names openai !ok:', res.status); return [] }
    const data = await res.json().catch(() => null)
    // Akumuluj koszt KAŻDEJ próby (także retry) — wołający zaloguje sumę do bud_usage.
    if (acc && data?.usage) { acc.i += data.usage.prompt_tokens || 0; acc.c += data.usage.prompt_tokens_details?.cached_tokens || 0; acc.o += data.usage.completion_tokens || 0 }
    const o = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    return Array.isArray(o.nazwy) ? o.nazwy.filter((x: unknown) => typeof x === 'string').map((x: string) => x.trim()).filter(Boolean) : []
  } catch (e) { console.warn('[bud-brand] names exception:', String(e).slice(0, 200)); return [] }
}
// ZAWSZE coś zwróć (req Tomka: nazwy mają się generować bez błędów ani klikania). openaiFetchRetry
// łapie 429/5xx; tu dokładamy retry na PUSTĄ odpowiedź, a gdy OpenAI całkiem padnie — deterministyczny
// fallback z kontekstu, żeby front NIGDY nie dostał pustej listy.
async function genNameCandidates(apiKey: string, ctx: string, n: number, acc?: Usage): Promise<string[]> {
  for (let i = 0; i < 3; i++) {
    const r = await genNameCandidatesOnce(apiKey, ctx, n, acc)
    if (r.length >= 5) return r
    if (i < 2) await new Promise((res) => setTimeout(res, 700 * (i + 1)))
  }
  const last = await genNameCandidatesOnce(apiKey, ctx, n, acc)
  if (last.length) return last
  return fallbackNames(ctx)
}
// Deterministyczny generator nazw z kontekstu — used ONLY gdy OpenAI niedostępny. Brandowalne warianty PL.
function fallbackNames(ctx: string): string[] {
  const stop = new Set(['sklep', 'produkt', 'kogo', 'marka', 'online', 'biznes', 'fizyczny', 'rynek', 'polski', 'oraz', 'który', 'która', 'dla'])
  const words = (ctx || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9\s]/gi, ' ').split(/\s+/).filter((w) => w.length >= 4 && !stop.has(w))
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
  const r = cap((words[0] || 'marka').replace(/[^a-ząćęłńóśźż]/gi, '')).slice(0, 8)
  const fromCtx = [r, r + 'go', r + 'la', 'Moje' + r, r + 'Pro']
  const neutral = ['Lumo', 'Nivo', 'Brava', 'Kori', 'Vena', 'Salto', 'Nuvo']
  const seen = new Set<string>(); const out: string[] = []
  for (const nm of [...fromCtx, ...neutral]) { const k = nm.toLowerCase(); if (nm.length >= 3 && nm.length <= 14 && !seen.has(k)) { seen.add(k); out.push(nm) } }
  return out.slice(0, 10)
}
function logoPromptVariant(name: string, ctx: string, variant: number): string {
  const styles = [
    'minimalistyczny wektorowy sygnet, czyste linie, nowoczesny',
    'elegancki geometryczny sygnet, premium, wyrazisty',
    'przyjazny, zaokrąglony sygnet z prostym symbolem, ciepły charakter',
  ]
  // UKŁAD OBOWIĄZKOWY: sygnet po LEWEJ, nazwa po PRAWEJ, jedna linia (poziomy lockup) — bo trafia do
  // nagłówka sklepu. Nigdy sygnet nad nazwą ani w innym miejscu.
  return `Profesjonalne, POZIOME LOGO marki e-commerce „${name}" do nagłówka sklepu. UKŁAD OBOWIĄZKOWY: SYGNET (ikona/symbol) po LEWEJ stronie, a NAZWA „${name}" po PRAWEJ, w JEDNEJ linii (poziomy lockup, jak logo w headerze) — NIGDY sygnet nad nazwą, pod nazwą ani w innym miejscu. Sygnet: ${styles[variant % 3]}, ale PRZEDE WSZYSTKIM oddaj STYL i KIERUNEK marki z kontekstu niżej — symbol i krój pisma mają pasować do TEJ konkretnej marki (premium = elegancko i oszczędnie; energetyczny/viralowy = odważnie i dynamicznie; ciepły/organiczny = miękko i przyjaźnie; techniczny = geometrycznie i ostro). Jednolite, bardzo jasne/białe tło, równy margines wokół. Nazwa „${name}" zapisana DOKŁADNIE tak, bezbłędnie (z polskimi znakami jeśli są), krojem dopasowanym do charakteru marki, wyrównana w pionie do środka sygnetu. KIERUNEK MARKI (dopasuj sygnet i typografię do tego): ${ctx.slice(0, 400)}. Pixel-perfect, ostre krawędzie, wektorowy charakter, bez efektu zdjęcia, bez znaków wodnych, bez obcych logotypów, bez dodatkowego tekstu poza nazwą.`
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)
    const CRON_SECRET = Deno.env.get('SPAR_CRON_SECRET') || ''

    let body: { sessionId?: string; force?: boolean }
    try { body = await req.json() } catch { return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors) }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, cors)

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: session, error: sErr } = await supabase
      .from('bud_sessions')
      .select('id, niche, preview_brief, problem_summary, brand, track, auth_user_id, ustalenia, ip')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr) { console.error('[bud-brand] session fetch error:', sErr); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)

    // Bramka właściciela: sesja przypięta do konta wymaga JWT tego konta
    // (link ?id= przestaje działać jak hasło — lustrzane odbicie bud-chat).
    {
      const authUser = await verifyAuthUser(req, supabase)
      if (ownerDenied(session.auth_user_id as string | null, authUser)) {
        return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
      }
    }

    const brief = (session.preview_brief && typeof session.preview_brief === 'object' && !Array.isArray(session.preview_brief))
      ? session.preview_brief as Record<string, unknown> : null
    const karta = (session.problem_summary && typeof session.problem_summary === 'object' && !Array.isArray(session.problem_summary))
      ? session.problem_summary as Record<string, unknown> : null
    const niche = typeof session.niche === 'string' ? session.niche : ''
    const track = typeof session.track === 'string' ? session.track : ''

    // ── H2: akcje nazwy/logo (osobny tor od pełnej marki) ──────────────────────
    // deno-lint-ignore no-explicit-any
    const action = typeof (body as any).action === 'string' ? (body as any).action : ''
    if (action === 'names' || action === 'logos' || action === 'pick') {
      const ust = (session.ustalenia && typeof session.ustalenia === 'object' && !Array.isArray(session.ustalenia)) ? session.ustalenia as Record<string, unknown> : null
      // deno-lint-ignore no-explicit-any
      const _prod: any = ((body as any).product && typeof (body as any).product === 'object') ? (body as any).product : null
      const ctx = [brandCtx(ust, niche, brief), (_prod && _prod.name) ? ('Produkt: ' + String(_prod.name).slice(0, 120) + (_prod.category ? ' (kategoria: ' + String(_prod.category).slice(0, 60) + ')' : '')) : ''].filter(Boolean).join('\n')
      const existingBrand = (session.brand && typeof session.brand === 'object' && !Array.isArray(session.brand)) ? session.brand as Record<string, unknown> : null
      // deno-lint-ignore no-explicit-any
      const b = body as any

      // ── CAPY anty-nadużycie (tylko płatne akcje; pick jest bezkosztowe → bez capa).
      //    names = 24× RDAP + 1× OpenAI; logos = 3× gpt-image-2. Te ścieżki returnują
      //    PRZED lockiem marki (l.~360), więc bez capa „reload/regeneruj" pali realny
      //    koszt. Sprawdzane PRZED generacją. Admin (x-admin-secret) omija. Fail-open.
      if (action === 'names' || action === 'logos') {
        const isAdmin = !!CRON_SECRET && req.headers.get('x-admin-secret') === CRON_SECRET
        if (!isAdmin) {
          // deno-lint-ignore no-explicit-any
          const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || (typeof (session as any).ip === 'string' ? (session as any).ip : null)
          const kind = action === 'logos' ? 'image' : 'brand-names'
          const fromMeta = action === 'logos' ? 'bud-brand/logos' : 'bud-brand/names'
          const sessionMax = action === 'logos'
            ? parseInt(Deno.env.get('BUD_BRAND_LOGOS_PER_SESSION') || '6', 10)
            : parseInt(Deno.env.get('BUD_BRAND_NAMES_PER_SESSION') || '8', 10)
          const ipMax = action === 'logos'
            ? parseInt(Deno.env.get('BUD_BRAND_LOGOS_IP_DAILY') || '12', 10)
            : parseInt(Deno.env.get('BUD_BRAND_NAMES_IP_DAILY') || '20', 10)
          // (a) cap per sesja — marker: logos=image/bud-brand/logos, names=brand-names/bud-brand/names
          const { count: sessCount, error: sessErr } = await supabase
            .from('bud_usage').select('id', { count: 'exact', head: true })
            .eq('session_id', sessionId).eq('kind', kind).eq('meta->>from', fromMeta)
          if (sessErr) { console.error('[bud-brand] session cap error (fail-open):', sessErr) }
          else if ((sessCount ?? 0) >= sessionMax) {
            return jsonResponse({ error: action === 'logos' ? 'limit_logo' : 'limit_nazw' }, 429, cors)
          }
          // (b) dzienny cap per IP (wzorzec bud-landing/bud-mockup) — fail-open na braku IP/błędzie
          if (ip) {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            const { data: ipSessions, error: ipSessErr } = await supabase
              .from('bud_sessions').select('id').eq('ip', ip)
            if (ipSessErr) { console.error('[bud-brand] ip sessions error (fail-open):', ipSessErr) }
            else if (ipSessions && ipSessions.length) {
              const { count: ipCount, error: ipErr } = await supabase
                .from('bud_usage').select('id', { count: 'exact', head: true })
                .eq('kind', kind).eq('meta->>from', fromMeta)
                .in('session_id', ipSessions.map((r) => r.id)).gte('created_at', dayAgo)
              if (ipErr) { console.error('[bud-brand] ip usage error (fail-open):', ipErr) }
              else if ((ipCount ?? 0) >= ipMax) {
                return jsonResponse({ error: action === 'logos' ? 'limit_logo_dzienny' : 'limit_nazw_dzienny' }, 429, cors)
              }
            }
          } else { console.warn('[bud-brand] brak IP do capa dziennego — fail-open') }
        }
      }

      if (action === 'names') {
        // Większa pula kandydatów (jak w procedurze brandingu) → więcej szans na 5 z WOLNĄ domeną wg RDAP.
        const namesUsage: Usage = { i: 0, c: 0, o: 0 }
        let cands = await genNameCandidates(OPENAI_API_KEY, ctx || niche || 'sklep z produktem fizycznym', 24, namesUsage)
        if (!cands.length) cands = fallbackNames(ctx || niche || 'sklep z produktem fizycznym')   // double-safety: NIGDY pusto
        const seen = new Set<string>()
        const out: Array<{ name: string; domain: string; available: boolean }> = []
        // T9: RDAP BATCHAMI po 4 równolegle (było: sekwencyjnie z pauzą 110 ms → 10-20 s
        // gapienia się w spinner). 4 naraz + 150 ms przerwy między batchami = łagodnie dla
        // NASK (anty-429; plDomainFree ma fallback DoH), a picker nazw spada do ~2-4 s.
        const uniq: Array<{ nm: string; slug: string }> = []
        for (const nm of cands) {
          const slug = slugifyPl(nm); if (!slug || slug.length < 3 || seen.has(slug)) continue; seen.add(slug)
          uniq.push({ nm, slug })
        }
        for (let i = 0; i < uniq.length && out.length < 5; i += 4) {
          const batch = uniq.slice(i, i + 4)
          const checked = await Promise.all(batch.map(async (x) => {
            let free = false; try { free = await plDomainFree(x.slug + '.pl') } catch { free = false }   // RDAP padło → nie wywracaj całości
            return { ...x, free }
          }))
          for (const r of checked) { if (r.free && out.length < 5) out.push({ name: r.nm, domain: r.slug + '.pl', available: true }) }
          if (out.length < 5 && i + 4 < uniq.length) await new Promise((r) => setTimeout(r, 150))
        }
        if (out.length < 5) {
          // awaryjnie dopełnij do 5 (gdyby RDAP masowo odmawiał) — oznaczone available:false
          for (const nm of cands) {
            const slug = slugifyPl(nm); if (!slug || slug.length < 3) continue
            if (out.some((o) => o.domain === slug + '.pl')) continue
            out.push({ name: nm, domain: slug + '.pl', available: false })
            if (out.length >= 5) break
          }
        }
        // OSTATECZNY bezpiecznik — front NIGDY nie dostaje pustej listy (req Tomka).
        if (!out.length) {
          for (const nm of (cands.length ? cands : fallbackNames('sklep')).slice(0, 5)) {
            const slug = slugifyPl(nm) || ('marka' + (out.length + 1))
            out.push({ name: nm, domain: slug + '.pl', available: false })
          }
        }
        await supabase.from('bud_sessions').update({ brand: { ...(existingBrand || {}), names: out }, updated_at: new Date().toISOString() }).eq('id', sessionId)
        // Realny koszt nazw (suma wszystkich prób OpenAI) — nie 0. Marker capa nazw zostaje.
        try {
          const pn = PRICES[OPENAI_MODEL] || PRICES['gpt-5.5']
          const namesCost = (Math.max(0, namesUsage.i - namesUsage.c) * pn.i + namesUsage.c * pn.c + namesUsage.o * pn.o) / 1_000_000
          await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'brand-names', model: OPENAI_MODEL, input_tokens: namesUsage.i, cached_tokens: namesUsage.c, output_tokens: namesUsage.o, cost_usd: namesCost, meta: { from: 'bud-brand/names' } })
        } catch (uErr) { console.error('[bud-brand] names usage:', uErr) }
        return jsonResponse({ names: out }, 200, cors)
      }

      if (action === 'logos') {
        const name = String(b.name || '').trim().slice(0, 80)
        if (!name) return jsonResponse({ error: 'brak_nazwy' }, 400, cors)
        const domain = String(b.domain || (slugifyPl(name) + '.pl')).slice(0, 120)
        const logos = (await Promise.all([0, 1, 2].map((v) => generateLogo(SUPABASE_URL, SERVICE_KEY, CRON_SECRET, logoPromptVariant(name, ctx, v))))).filter((u): u is string => !!u)
        try { await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'image', model: 'gpt-image-2', images: logos.length, cost_usd: 0.041 * logos.length, meta: { view: 'logo', from: 'bud-brand/logos' } }) } catch { /* */ }
        await supabase.from('bud_sessions').update({ brand: { ...(existingBrand || {}), chosen_name: name, nazwa: name, chosen_domain: domain, logos }, updated_at: new Date().toISOString() }).eq('id', sessionId)
        return jsonResponse({ logos, name, domain }, 200, cors)
      }

      // action === 'pick'
      const logoUrl = String(b.logo_url || '').slice(0, 600)
      const merged: Record<string, unknown> = { ...(existingBrand || {}) }
      if (logoUrl) { merged.chosen_logo = logoUrl; merged.logo_url = logoUrl }
      if (b.name) { merged.chosen_name = String(b.name).slice(0, 80); merged.nazwa = String(b.name).slice(0, 80) }
      if (b.domain) merged.chosen_domain = String(b.domain).slice(0, 120)
      await supabase.from('bud_sessions').update({ brand: merged, updated_at: new Date().toISOString() }).eq('id', sessionId)
      return jsonResponse({ ok: true, brand: merged }, 200, cors)
    }

    if (!niche && !brief && !karta) {
      // Bez żadnego kontekstu produktu nie ma z czego budować marki
      return jsonResponse({ error: 'brak_kontekstu' }, 400, cors)
    }

    // Idempotencja: gotowa marka (z nazwą) wraca bez force.
    const existing = (session.brand && typeof session.brand === 'object' && !Array.isArray(session.brand))
      ? session.brand as Record<string, unknown> : null
    if (existing && typeof existing.nazwa === 'string' && existing.nazwa.trim() && !body.force) {
      return jsonResponse({ brand: existing, cached: true }, 200, cors)
    }

    // Lock (TTL 180s) — równoległe wywołania nie generują dwóch marek.
    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'brand', p_ttl_sec: 180 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    try {
      const prompt = buildPrompt(niche, brief, karta, track)
      const logUsage = async (usage: { i: number; c: number; o: number } | null) => {
        if (!usage) return
        try {
          const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']
          await supabase.from('bud_usage').insert({
            session_id: sessionId, kind: 'brand', model: OPENAI_MODEL,
            input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o,
            cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000,
          })
        } catch (uErr) { console.error('[bud-brand] usage insert error:', uErr) }
      }

      // Auto-retry ×1: druga próba z większym budżetem tokenów (gpt-5.x bywa pusty)
      let brandObj: Record<string, unknown> | null = null
      for (let attempt = 0; attempt < 2 && !brandObj; attempt++) {
        const { obj, usage } = await callOnce(OPENAI_API_KEY, prompt, MAX_TOKENS + attempt * 2000)
        await logUsage(usage)
        if (obj && saneBrand(obj)) brandObj = normalizeBrand(obj)
        else if (attempt === 0) console.warn('[bud-brand] próba 1 nieudana — ponawiam')
      }
      if (!brandObj) {
        console.error('[bud-brand] obie próby nieudane')
        await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'brand' })
        return jsonResponse({ error: 'blad_generowania' }, 502, cors)
      }

      // Zapis marki (merge z istniejącą, żeby NIE zgubić logo_url z poprzedniego biegu).
      const merged: Record<string, unknown> = { ...(existing || {}), ...brandObj }

      // LOGO przez wspólną funkcję generate-image. generate-image samo loguje swój
      // koszt? NIE dla tego trybu (brak osobnego usage); zaliczamy logo jako kind
      // 'image' do bud_usage, żeby panel widział koszt obrazu (1 obraz medium).
      const logoPrompt = buildLogoPrompt(merged, niche, brief)
      const logoUrl = await generateLogo(SUPABASE_URL, SERVICE_KEY, CRON_SECRET, logoPrompt)
      if (logoUrl) {
        merged.logo_url = logoUrl
        // Zapis do galerii widoków (view 'logo' nie zużywa puli image_count)
        try {
          await supabase.rpc('bud_record_image', { p_session: sessionId, p_view: 'logo', p_url: logoUrl })
        } catch (e) { console.error('[bud-brand] bud_record_image(logo) error:', e) }
        // Koszt obrazu logo → bud_usage kind 'image' (generate-image nie loguje do bud_usage)
        try {
          await supabase.from('bud_usage').insert({
            session_id: sessionId, kind: 'image', model: 'gpt-image-2',
            images: 1, cost_usd: 0.041, meta: { view: 'logo', quality: 'medium', from: 'bud-brand' },
          })
        } catch (e) { console.error('[bud-brand] logo usage insert error:', e) }
      } else {
        console.warn('[bud-brand] logo nie wygenerowane — zapisuję markę bez logo_url')
      }

      const { error: uErr } = await supabase
        .from('bud_sessions')
        .update({ brand: merged, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
      if (uErr) console.error('[bud-brand] save error:', uErr)

      await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'brand' })
      return jsonResponse({ brand: merged, cached: false, logo: !!logoUrl }, 200, cors)
    } catch (inner) {
      // Zwolnij lock przy każdym błędzie wewnątrz sekcji generowania
      await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'brand' }).catch(() => {})
      throw inner
    }
  } catch (e) {
    console.error('[bud-brand] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
