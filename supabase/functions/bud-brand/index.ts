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
      .select('id, niche, preview_brief, problem_summary, brand, track, auth_user_id')
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
