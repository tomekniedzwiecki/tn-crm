// bud-chat — sparing AI dla lejka "Zbuduję / Sklep" (AWE — e-commerce fizyczny; tomekniedzwiecki.pl/sklep)
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy bud-chat --no-verify-jwt
// lub zbiorczo: npm run deploy:functions (upewnij się, że skrypt ma --no-verify-jwt)
//
// Sekrety (Supabase Dashboard > Edge Functions > Secrets):
//   OPENAI_API_KEY               — klucz OpenAI (już ustawiony)
//   BUD_OPENAI_MODEL             — opcjonalny override modelu (default gpt-5.1)
//   SUPABASE_URL                 — wbudowany
//   SUPABASE_SERVICE_ROLE_KEY    — wbudowany
//
// System prompt: tabela settings, key='budowanie_sparing_prompt' (cache w module 5 min).
// Streaming: OpenAI /v1/chat/completions (stream) NORMALIZOWANY server-side do
// formatu content_block_delta/text_delta + własny event "spar_meta" na końcu —
// frontend ma jeden kontrakt SSE niezależnie od providera (łatwa podmiana GPT/Claude).
//
// TRYB: 'sparing' — lejek definiowania projektu (tomekniedzwiecki.pl/sklep/).
//   Po zielonym werdykcie ten sam czat przechodzi w fazę współpracy (sekcja
//   PRZEŁAMYWANIE OBIEKCJI w prompcie + COLLAB_PHASE_INSTRUCTION). Dawny osobny
//   tryb 'wspolpraca' (stary model 20%/30k, niepodłączony) USUNIĘTY 2026-06-16.
//
// ROUTER 3 KIERUNKÓW (track): front pokazuje ekran wyboru 3 kart (marker <kierunki>).
//   Po kliknięciu user wysyła normalną wiadomość typu „Wybieram kierunek: K1 — …"
//   (front może też dołączyć pole `track` w body). Backend ustala i utrwala
//   bud_sessions.track ('k1'|'k2'|'k3') i wstrzykuje go do kontekstu modelu.

import { createClient } from "jsr:@supabase/supabase-js@2";

// ── CORS — whitelist originów (wzorzec: tpay-create-transaction) ──────────────
const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'https://crm.tomekniedzwiecki.pl',
  'https://tn-crm.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5503',
  'http://127.0.0.1:5503',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// ── Limity z kontraktu ────────────────────────────────────────────────────────
const MAX_TURNS = 30                  // tur asystenta per sesja
const MAX_MESSAGE_LENGTH = 2000       // znaków per wiadomość
const MAX_MESSAGES_PER_HOUR = 60      // wiadomości/h per sesja (COUNT bud_messages)
const MAX_SESSIONS_PER_HOUR_PER_IP = 10 // nowych sesji/h per IP (anty-abuse: mnożenie sessionId)
const MAX_SESSIONS_PER_DAY_PER_USER = parseInt(Deno.env.get('BUD_SESSIONS_USER_DAILY') || '10', 10) // nowych sesji/dobę per konto
const MAX_TURNS_BEZ_KONTAKTU = 5      // tur asystenta zanim wymagamy konta/maila (bramka inline w czacie)
const MAX_TURNS_HARD_GATE = 12       // #10: twardy backstop — kontakt wymuszany najpóźniej po tylu turach,
                                     // nawet bez podglądu (normalnie pytamy DOPIERO po pierwszym <projekt>)
// BUD_REQUIRE_ACCOUNT=true → bramkę przechodzi TYLKO zweryfikowane konto (JWT);
// false (default, okres przejściowy) → wystarczy e-mail w sesji jak dotąd
const REQUIRE_ACCOUNT = (Deno.env.get('BUD_REQUIRE_ACCOUNT') || 'false') === 'true'
const OPENAI_MODEL = Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.1'
// 3000: odpowiedź z markerem <projekt> (pełny brief z 4 widokami) potrafi
// przekroczyć 1500 — ucięty </projekt> = parseProjekt zwraca null i brief
// NIE trafia do bazy (podgląd się nie generuje mimo zapowiedzi w tekście)
const OPENAI_MAX_COMPLETION_TOKENS = 3000

// ── Cache system promptów (mapa per klucz settings, 5 min) ───────────────────
const PROMPT_CACHE_TTL_MS = 5 * 60 * 1000
const promptCache = new Map<string, { value: string; fetchedAt: number }>()

const PROMPT_KEYS: Record<string, string> = {
  sparing: 'budowanie_sparing_prompt',
}

interface BudChatRequest {
  sessionId: string
  profession: string
  problemHint?: string | null
  email: string
  name?: string | null
  phone?: string | null
  message: string
  tracking?: Record<string, unknown> | null
  mode?: string
  // ROUTER KIERUNKÓW: front może dołączyć jawnie wybrany kierunek (k1/k2/k3).
  // Backend i tak waliduje i fallbackuje na regex po treści wiadomości.
  track?: string | null
  // DEPRECATED (2026-06-12): tożsamość konta idzie WYŁĄCZNIE z JWT w nagłówku
  // Authorization (verifyAuthUser) — pola z body były spoofowalne i są ignorowane
  authUserId?: string | null
  authProvider?: string | null
  // Cloudflare Turnstile — wymagany przy tworzeniu NOWEJ sesji bez zalogowania
  // (anty-bot); weryfikacja wyłączona, gdy brak TURNSTILE_SECRET_KEY w env
  turnstileToken?: string | null
  // Beacon „wyszedł z ekranu generowania" (pagehide/visibilitychange) — bez
  // message; stempluje left_screen_at/left_screen dla precyzyjnego SMS powrotu
  event?: string | null
  screen?: string | null
}

// ── Konto z JWT (Supabase Auth) ───────────────────────────────────────────────
// Jedyne wiarygodne źródło tożsamości: access_token usera w Authorization.
// Brak nagłówka / nie-userowy token (publishable key) / nieważny JWT → null
// (rozmowa anonimowa — dozwolona do bramki).
interface AuthUser { id: string; email: string | null; name: string | null; provider: string | null }

async function verifyAuthUser(
  req: Request,
  supabase: ReturnType<typeof createClient>,
): Promise<AuthUser | null> {
  const m = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  const token = m[1].trim()
  if (!token || token.startsWith('sb_publishable_') || token.startsWith('sb_secret_')) return null
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return null
    const u = data.user
    const meta = (u.user_metadata || {}) as Record<string, unknown>
    const appMeta = (u.app_metadata || {}) as Record<string, unknown>
    return {
      id: u.id,
      email: u.email || null,
      name: (typeof meta.full_name === 'string' && meta.full_name.trim()) ? meta.full_name.trim().slice(0, 120)
        : (typeof meta.name === 'string' && meta.name.trim()) ? meta.name.trim().slice(0, 120) : null,
      provider: typeof appMeta.provider === 'string' ? appMeta.provider.slice(0, 30) : null,
    }
  } catch (err) {
    console.error('[bud-chat] auth getUser error:', err)
    return null
  }
}

// ── Cloudflare Turnstile (anty-bot na nowe sesje anonimowe) ──────────────────
// Fail-open przy awarii weryfikatora (bot protection to warstwa, nie ściana —
// padnięty Cloudflare nie może blokować całego lejka).
async function verifyTurnstile(token: string | null | undefined, ip: string | null): Promise<boolean> {
  // Przełącznik operacyjny (TYLKO na czas testów E2E): BUD_TURNSTILE_OFF=true
  // wyłącza weryfikację anty-bota dla wszystkich. Pamiętaj wrócić na false.
  if ((Deno.env.get('BUD_TURNSTILE_OFF') || '') === 'true') return true
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
  if (!secret) return true // rollout bez kluczy: weryfikacja wyłączona
  if (!token || typeof token !== 'string' || token.length > 2048) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip || undefined }),
    })
    const data = await res.json()
    if (!data?.success) console.warn('[bud-chat] turnstile odrzucony:', JSON.stringify(data?.['error-codes'] || []))
    return !!data?.success
  } catch (err) {
    console.error('[bud-chat] turnstile verify error (fail-open):', err)
    return true
  }
}

// ── Cennik USD per 1M tokenów (logowanie kosztów do bud_usage) ──────────────
const CHAT_PRICES: Record<string, { input: number; cached: number; output: number }> = {
  'gpt-5.5': { input: 5, cached: 0.5, output: 30 },
  'gpt-5.1': { input: 1.25, cached: 0.125, output: 10 },
  'gpt-4o': { input: 2.5, cached: 1.25, output: 10 },
  'gpt-4o-mini': { input: 0.15, cached: 0.075, output: 0.6 },
}
function chatCostUsd(model: string, input: number, cached: number, output: number): number {
  let p = CHAT_PRICES[model]
  if (!p) {
    console.warn(`[bud-chat] nieznany model w cenniku: ${model} — liczę po stawkach gpt-5.5 (dopisz do CHAT_PRICES!)`)
    p = CHAT_PRICES['gpt-5.5']
  }
  const freshIn = Math.max(0, input - cached)
  return (freshIn * p.input + cached * p.cached + output * p.output) / 1_000_000
}

interface StreamUsage {
  prompt_tokens?: number
  completion_tokens?: number
  prompt_tokens_details?: { cached_tokens?: number }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ── ROUTER 3 KIERUNKÓW (track) — przechwytywanie wyboru ───────────────────────
// Front pokazuje 3 karty (marker <kierunki>). Po kliknięciu user wysyła normalną
// wiadomość ("Wybieram kierunek: K1 — …") albo front dołącza pole `track` w body.
// Ustalamy track DEFENSYWNIE: jawne body.track > jawny "kierunek: kN" > heurystyka
// po słowach. Gdy nie da się ustalić — null (rozmowa działa dalej jak zwykle).
function normalizeTrack(raw: string | null | undefined): 'k1' | 'k2' | 'k3' | null {
  if (!raw || typeof raw !== 'string') return null
  const t = raw.trim().toLowerCase()
  if (t === 'k1' || t === '1') return 'k1'
  if (t === 'k2' || t === '2') return 'k2'
  if (t === 'k3' || t === '3') return 'k3'
  return null
}

function detectTrackFromMessage(msg: string | null | undefined): 'k1' | 'k2' | 'k3' | null {
  if (!msg || typeof msg !== 'string') return null
  const t = msg.toLowerCase()
  // 1) jawny marker „kierunek: k1/k2/k3" (lub „k1/k2/k3" jako wybór z karty)
  const explicit = t.match(/kierunek[:\s]*\bk?\s*([123])\b/) || t.match(/\bk\s*([123])\b/)
  if (explicit) return (`k${explicit[1]}` as 'k1' | 'k2' | 'k3')
  // 2) heurystyka po słowach (kolejność = priorytet; pierwszy trafiony wygrywa)
  //    K1 — nie mam pomysłu / od zera
  if (/(nie mam pomys[łl]u|od zera|nie wiem co sprzeda|jeszcze nic nie mam|bez pomys[łl]u)/.test(t)) return 'k1'
  //    K2 — mam produkt/markę i już sprzedaję
  if (/(mam produkt|mam mark[ęe]|ju[żz] sprzeda|mam sprzeda|mam sklep|prowadz[ęe] sprzeda)/.test(t)) return 'k2'
  //    K3 — mam pomysł / chcę wprowadzić na rynek
  if (/(mam pomys[łl]|chc[ęe] wprowadzi|wprowadzi[ćc] na rynek|na rynek|mam ide[ęe])/.test(t)) return 'k3'
  return null
}

const TRACK_LABEL: Record<'k1' | 'k2' | 'k3', string> = {
  k1: 'k1 (nie mam pomysłu — od zera)',
  k2: 'k2 (mam produkt/markę i już sprzedaję)',
  k3: 'k3 (mam pomysł — chcę wprowadzić na rynek)',
}

// K1 DOBÓR PRODUKTU — wykrycie ZMIANY KATEGORII (reset licznika 3 rund). Konserwatywne,
// by REFRASE tej samej niszy NIE resetował (model bywa zmienny: „gadżety kuchenne" ↔
// „akcesoria do kuchni"). Reset gdy: stara kategoria niepusta ORAZ nowa nie dzieli z nią
// ŻADNEGO znaczącego tokenu (≥4 zn.). Sygnał jawny `nowa_kategoria:true` z markera ma
// pierwszeństwo (obsługiwany w callerze). Polskie stopwordy odsiane, by „do/dla/na" nie
// fałszowały wspólnego tokenu.
function categoryChanged(prevKat: string, newKat: string): boolean {
  const STOP = new Set(['oraz', 'dla', 'do', 'na', 'po', 'akcesoria', 'gadżety', 'gadzety', 'produkty', 'rzeczy'])
  const toks = (s: string) => (s || '').toLowerCase().replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w))
  const a = toks(prevKat); const b = toks(newKat)
  if (a.length === 0 || b.length === 0) return false // brak danych → nie resetuj
  for (const w of a) { if (b.includes(w)) return false } // wspólny znaczący token → ta sama nisza
  return true
}

// Pobierz system prompt z settings (service role) z cachem modułowym per klucz
async function getSystemPrompt(supabase: ReturnType<typeof createClient>, key: string): Promise<string | null> {
  const cached = promptCache.get(key)
  if (cached && Date.now() - cached.fetchedAt < PROMPT_CACHE_TTL_MS) {
    return cached.value
  }
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()

  if (error) {
    console.error('[bud-chat] settings fetch error:', error)
    return null
  }
  const value = data?.value
  if (!value || typeof value !== 'string' || !value.trim()) {
    return null
  }
  promptCache.set(key, { value, fetchedAt: Date.now() })
  return value
}

interface VerdictResult {
  verdict: 'zielony' | 'zolty' | 'czerwony' | null
  karta: Record<string, unknown> | null
  idea_source?: 'wlasny' | 'ai' | 'wspolny' | null
}

// Marker werdyktu: <werdykt>{"kolor":"...","karta":{...}}</werdykt>
function parseVerdict(fullText: string): VerdictResult {
  const match = fullText.match(/<werdykt>([\s\S]*?)<\/werdykt>/)
  if (!match) return { verdict: null, karta: null }
  try {
    const parsed = JSON.parse(match[1])
    const kolor = parsed?.kolor
    const zrodlo = parsed?.zrodlo
    const idea = (zrodlo === 'wlasny' || zrodlo === 'ai' || zrodlo === 'wspolny') ? zrodlo : null
    if (kolor === 'zielony' || kolor === 'zolty' || kolor === 'czerwony') {
      return { verdict: kolor, karta: parsed?.karta ?? null, idea_source: idea }
    }
    console.error('[bud-chat] nieznany kolor werdyktu:', kolor)
  } catch (err) {
    console.error('[bud-chat] błąd parsowania markera werdyktu:', err)
  }
  return { verdict: null, karta: null }
}

// Marker podglądu: <projekt>{...brief...}</projekt> — bierzemy OSTATNI z odpowiedzi
// (model może iterować podgląd po uwagach klienta)
function parseProjekt(fullText: string): Record<string, unknown> | null {
  const matches = [...fullText.matchAll(/<projekt>([\s\S]*?)<\/projekt>/g)]
  if (!matches.length) {
    if (fullText.includes('<projekt>')) {
      // otwarty marker bez domknięcia = odpowiedź ucięta (limit tokenów / przerwany stream)
      console.error('[bud-chat] marker <projekt> NIEDOMKNIĘTY — odpowiedź ucięta? len:', fullText.length)
    }
    return null
  }
  try {
    const parsed = JSON.parse(matches[matches.length - 1][1])
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch (err) {
    console.error('[bud-chat] błąd parsowania markera projekt:', err, '| inner:', matches[matches.length - 1][1].slice(0, 300))
    return null
  }
}

// Scal nowy marker <projekt> z briefem w bazie. Model przy poprawce potrafi
// wysłać OKROJONY marker (np. tylko widoki.glowna + zmien) — proste nadpisanie
// kasowałoby styl i opisy pozostałych widoków, a kolejne generacje traciłyby
// spójność (ustalenia z rozmowy znikałyby z grafik).
function mergeBrief(
  oldBrief: Record<string, unknown> | null,
  fresh: Record<string, unknown>,
): Record<string, unknown> {
  // #E: pełny pivot — model oznacza nowy <projekt> "reset":true → podgląd OD ZERA,
  // bez mergowania resztek poprzedniego pomysłu (ekrany/styl/design/insighty).
  if (fresh && fresh.reset === true) {
    const { reset: _r, ...rest } = fresh
    return rest
  }
  const old = oldBrief && typeof oldBrief === 'object' ? oldBrief : {}
  const merged: Record<string, unknown> = { ...old, ...fresh }
  const oldW = (old.widoki && typeof old.widoki === 'object') ? old.widoki as Record<string, unknown> : {}
  const freshW = (fresh.widoki && typeof fresh.widoki === 'object') ? fresh.widoki as Record<string, unknown> : {}
  merged.widoki = { ...oldW, ...freshW }
  if ((typeof fresh.styl !== 'string' || !fresh.styl.trim()) && typeof old.styl === 'string') {
    merged.styl = old.styl
  }
  // design (decyzje projektowe AI: tła/akcenty/typografia) — jak styl: okrojony
  // marker poprawki nie może go skasować, bo kolejne generacje straciłyby spójność
  if ((!fresh.design || typeof fresh.design !== 'object' || Array.isArray(fresh.design))
    && old.design && typeof old.design === 'object' && !Array.isArray(old.design)) {
    merged.design = old.design
  }
  if ((!Array.isArray(fresh.insighty) || !fresh.insighty.length) && Array.isArray(old.insighty)) {
    merged.insighty = old.insighty
  }
  return merged
}

// Zwięzły opis Karty Problemu do notatki leada
function buildLeadNotes(profession: string, karta: Record<string, unknown> | null): string {
  const lines: string[] = ['Sparing /sklep — werdykt: ZIELONY']
  const k = karta || {}
  const field = (label: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return
    const text = Array.isArray(value) ? value.join(', ') : String(value)
    if (text.trim()) lines.push(`${label}: ${text}`)
  }
  field('Profesja', k.profesja || profession)
  field('Problem', k.problem)
  field('Kto płaci', k.kto_placi)
  field('Dzisiejsze obejście', k.dzisiejsze_obejscie)
  field('Ekrany', k.ekrany)
  field('Kanały dystrybucji', k.kanaly_dystrybucji)
  field('Sygnał budżetu', k.sygnal_budzetu)
  field('Konkurencja', k.konkurencja)
  field('Ryzyka', k.ryzyka)
  return lines.join('\n')
}

// Zielony werdykt -> lead przez własną funkcję lead-upsert (zwraca lead_id lub null)
async function createLeadForGreenVerdict(
  supabaseUrl: string,
  serviceKey: string,
  payload: {
    email: string
    name: string | null
    phone: string | null
    profession: string
    karta: Record<string, unknown> | null
    tracking: Record<string, unknown> | null
  },
): Promise<string | null> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/lead-upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email: payload.email,
        name: payload.name,
        phone: payload.phone || undefined,
        // Lejek AWE „Zbuduję / Sklep" ma własne źródło (osobny panel sklep-leady;
        // NIE 'stworze' = inny produkt, NIE 'website' = formularz /zapisy).
        lead_source: 'budowanie',
        notes: buildLeadNotes(payload.profession, payload.karta),
        tracking: payload.tracking,
      }),
    })
    if (!res.ok) {
      console.error('[bud-chat] lead-upsert HTTP error:', res.status, await res.text())
      return null
    }
    const data = await res.json()
    if (!data?.success || !data?.lead_id) {
      console.error('[bud-chat] lead-upsert bez lead_id:', JSON.stringify(data))
      return null
    }
    return data.lead_id as string
  } catch (err) {
    console.error('[bud-chat] lead-upsert exception:', err)
    return null
  }
}

// ── Powiadomienia Slack #sparing ─────────────────────────────────────────────
// Wysyłka przez edge function slack-notify (centralne formatowanie + sekret
// webhooka). Fire-and-forget z perspektywy logiki — błąd Slacka NIGDY nie może
// wywrócić rozmowy, więc tylko logujemy.
async function postSlackSparing(
  type: 'spar_contact' | 'spar_green' | 'bud_lead_error' | 'bud_knowhow_error',
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) { console.error('[bud-chat] slack-notify: brak SUPABASE_URL/KEY'); return }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[bud-chat] slack-notify ${type} HTTP`, res.status, await res.text())
  } catch (err) {
    console.error(`[bud-chat] slack-notify ${type} exception:`, err)
  }
}

// Lead zostawił JEDNOCZEŚNIE e-mail i telefon → #sparing (raz na sesję).
// Stempel + warunki w jednym atomowym UPDATE: tylko gdy oba pola wypełnione
// i jeszcze nie powiadomiono — wygrany wiersz = nasze powiadomienie (domyka też
// równoległe requesty). Wołane po każdym dopisaniu kontaktu.
async function maybeNotifyContactSlack(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
): Promise<void> {
  try {
    const { data: claimed, error } = await supabase
      .from('bud_sessions')
      .update({ slack_contact_notified_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('slack_contact_notified_at', null)
      .not('email', 'is', null)
      .not('phone', 'is', null)
      .eq('is_test', false)
      .select('id, email, name, phone, profession, problem_summary, preview_brief')
    if (error) { console.error('[bud-chat] contact slack claim error:', error); return }
    if (!claimed || !claimed.length) return
    const s = claimed[0] as Record<string, unknown>
    const brief = (s.preview_brief && typeof s.preview_brief === 'object') ? s.preview_brief as Record<string, unknown> : null
    await postSlackSparing('spar_contact', {
      session_id: s.id,
      name: s.name ?? null,
      email: s.email ?? null,
      phone: s.phone ?? null,
      profession: s.profession ?? null,
      project_name: brief?.nazwa ?? null,
      project_desc: brief?.opis ?? null,
      karta: (s.problem_summary && typeof s.problem_summary === 'object') ? s.problem_summary : null,
    })
  } catch (err) {
    console.error('[bud-chat] maybeNotifyContactSlack exception:', err)
  }
}

// Sesja dostała werdykt „zielony" → #sparing (raz na sesję).
async function maybeNotifyGreenSlack(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  payload: {
    email: string | null
    name: string | null
    phone: string | null
    profession: string | null
    karta: Record<string, unknown> | null
    brief: Record<string, unknown> | null
  },
): Promise<void> {
  try {
    const { data: claimed, error } = await supabase
      .from('bud_sessions')
      .update({ slack_green_notified_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('slack_green_notified_at', null)
      .eq('is_test', false)
      .select('id')
    if (error) { console.error('[bud-chat] green slack claim error:', error); return }
    if (!claimed || !claimed.length) return
    const brief = payload.brief
    await postSlackSparing('spar_green', {
      session_id: sessionId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      profession: payload.profession,
      project_name: brief?.nazwa ?? null,
      project_desc: brief?.opis ?? null,
      karta: payload.karta,
    })
  } catch (err) {
    console.error('[bud-chat] maybeNotifyGreenSlack exception:', err)
  }
}

// Zapis po zakończeniu streamu: wiadomość asystenta + update sesji + koszt
async function persistAfterStream(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  assistantText: string,
  turnsBefore: number,
  verdict: VerdictResult,
  leadId: string | null,
  projekt: Record<string, unknown> | null,
  channel: string,
  usage: StreamUsage | null,
  isPaid: boolean = false,
  ephemeral: boolean = false,
): Promise<void> {
  try {
    // ephemeral = zaczepka „wróć do rozmowy" (know-how resume): NIE zapisuj jej do
    // historii i NIE ruszaj sesji (turns/last_user_at/werdykt) — to nie tura usera.
    // Koszt (usage) i tak rejestrujemy poniżej.
    if (!ephemeral && assistantText.trim()) {
      const { error: msgError } = await supabase
        .from('bud_messages')
        .insert({ session_id: sessionId, role: 'assistant', content: assistantText, channel })
      if (msgError) console.error('[bud-chat] insert assistant message error:', msgError)
    }

    // Koszt tej tury (stream_options.include_usage) → bud_usage (panel TN Aplikacje)
    if (usage) {
      const input = usage.prompt_tokens || 0
      const cached = usage.prompt_tokens_details?.cached_tokens || 0
      const output = usage.completion_tokens || 0
      const { error: usageErr } = await supabase.from('bud_usage').insert({
        session_id: sessionId,
        kind: 'chat',
        model: OPENAI_MODEL,
        input_tokens: input,
        cached_tokens: cached,
        output_tokens: output,
        cost_usd: chatCostUsd(OPENAI_MODEL, input, cached, output),
        meta: { channel },
      })
      if (usageErr) console.error('[bud-chat] usage insert error:', usageErr)
    } else if (assistantText.trim()) {
      // Stream przerwany przez klienta — chunk z usage nie dotarł. Logujemy
      // SZACOWANY koszt outputu (≈4 znaki/token; input nieznany → pomijamy),
      // z flagą estimated — lepsze niż cicha dziura w kosztach
      const estOut = Math.round(assistantText.length / 4)
      const { error: abortUsageErr } = await supabase.from('bud_usage').insert({
        session_id: sessionId,
        kind: 'chat',
        model: OPENAI_MODEL,
        input_tokens: 0,
        cached_tokens: 0,
        output_tokens: estOut,
        cost_usd: chatCostUsd(OPENAI_MODEL, 0, 0, estOut),
        meta: { channel, aborted: true, estimated: true },
      })
      if (abortUsageErr) console.error('[bud-chat] aborted usage insert error:', abortUsageErr)
    }

    if (ephemeral) return // zaczepka: koszt zapisany, sesji nie dotykamy

    const update: Record<string, unknown> = {
      turns: turnsBefore + 1,
      updated_at: new Date().toISOString(),
      last_user_at: new Date().toISOString(),
    }
    // #4: protokół biernego rozmówcy — model po daniu szansy wystawia <bierny>,
    // a my oznaczamy sesję jako bierną (panel filtruje takie leady).
    if (/<bierny\s*\/?>/.test(assistantText)) update.status = 'bierny'
    // Rezygnacja POTWIERDZONA przez rozmówcę (marker <rezygnacja/>, wystawiany
    // tylko przy jednoznacznej, wyraźnej intencji wg RESIGNATION_INSTRUCTION) →
    // etap lejka „przegrany: zrezygnował" + wstrzymanie automatu maili/SMS (jak
    // ręczny przycisk). Pomijamy opłaconych (nie wyrzucaj ich z „Opłacone").
    // Service-role omija grant kolumnowy.
    if (!isPaid && /<rezygnacja\s*\/?>/.test(assistantText)) {
      update.pipeline_override = 'resigned'
      update.sequence_cancelled_at = new Date().toISOString()
    }
    if (verdict.verdict) {
      update.verdict = verdict.verdict
      update.problem_summary = verdict.karta
    }
    if (verdict.idea_source) update.idea_source = verdict.idea_source
    if (leadId) {
      update.lead_id = leadId
    }
    if (projekt) {
      update.preview_brief = projekt
    }
    const { error: sessError } = await supabase
      .from('bud_sessions')
      .update(update)
      .eq('id', sessionId)
    if (sessError) console.error('[bud-chat] update session error:', sessError)
  } catch (err) {
    console.error('[bud-chat] persistAfterStream exception:', err)
  }
}

// ── KNOW-HOW: cicha ekstrakcja wiedzy z ostatniej wymiany (tryb dopracowania) ──
// Wołane w tle (waitUntil) PO odpowiedzi, tylko w trybie know-how. Drugi, krótki
// call modelu wyciąga konkrety z ostatniej tury i zapisuje do bud_knowhow_items.
// Brak markerów w treści czatu → front nietknięty; błąd = zero wpływu na rozmowę.
// Trwały ślad błędu ścieżki know-how (ekstrakcja/handoff) — żeby cicha awaria nie
// zostawiała Tomka z pustą Bazą wiedzy bez sygnału. Wzór jak bud_sessions.lead_error.
async function stampKnowhowError(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  leadId: string | null,
  field: 'extract_error' | 'handoff_error',
  msg: string,
): Promise<void> {
  try {
    // Dedup alertu: sprawdź, czy ten błąd nie był już ustawiony (ekstrakcja leci co turę,
    // przy padniętym OpenAI stemplowałaby co turę → spam). Alertujemy tylko przy zmianie null→błąd.
    let wasEmpty = true
    try {
      const { data: prev } = await supabase.from('bud_knowhow_summary').select(field).eq('session_id', sessionId).maybeSingle()
      wasEmpty = !((prev as Record<string, unknown> | null)?.[field])
    } catch { /* brak wiersza = puste */ }
    const patch: Record<string, unknown> = { session_id: sessionId, lead_id: leadId }
    patch[field] = msg.slice(0, 300)
    patch[field === 'extract_error' ? 'extract_error_at' : 'handoff_error_at'] = new Date().toISOString()
    await supabase.from('bud_knowhow_summary').upsert(patch, { onConflict: 'session_id' })
    if (wasEmpty) {
      postSlackSparing('bud_knowhow_error', { session_id: sessionId, lead_id: leadId, error_type: field, error_msg: msg.slice(0, 300) })
        .catch((e) => console.error('[bud-chat] knowhow_error slack:', e))
    }
  } catch (e) { console.error('[bud-chat] stampKnowhowError', field, e) }
}

async function refreshKnowhowSummary(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  leadId: string | null,
  ideaSource: string,
): Promise<void> {
  try {
    const { data } = await supabase.from('bud_knowhow_items').select('kind').eq('session_id', sessionId)
    const rows = (data || []) as Array<{ kind: string }>
    // UWAGA: NIE ustawiamy tu `status`. Tła ekstrakcja leci też „po fakcie" (po
    // knowhow_closed_at — isKnowHowMode = full_paid_at zostaje true), a sztywne
    // status:'active' cofało 'closed' z knowhow_close → sprzeczny wiersz. Status
    // jest własnością wyłącznie knowhow_close / tpay-webhook (start='active').
    await supabase.from('bud_knowhow_summary').upsert({
      session_id: sessionId,
      lead_id: leadId,
      items_count: rows.length,
      wymagania_count: rows.filter((r) => r.kind === 'wymaganie').length,
      zalaczniki_count: rows.filter((r) => r.kind === 'zalacznik').length,
      idea_source: ideaSource,
      extract_error: null,    // udany przebieg ekstrakcji czyści poprzedni błąd
      extract_error_at: null,
    }, { onConflict: 'session_id' })
  } catch (e) {
    console.error('[bud-chat] refreshKnowhowSummary error:', e)
  }
}

async function extractKnowhowAsync(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  leadId: string | null,
  ideaSource: string,
  userMsg: string,
  assistantMsg: string,
  problemSummary: Record<string, unknown> | null,
  apiKey: string,
): Promise<void> {
  try {
    await ensureKnowhowPrompts(supabase)
    const ctx = problemSummary ? `KONTEKST PROJEKTU (nie wyodrębniaj z tego — to już wiemy): ${JSON.stringify(problemSummary).slice(0, 900)}\n\n` : ''
    const transcript = `ROZMÓWCA: ${userMsg}\n\nASYSTENT: ${assistantMsg}`
    const res = await openaiFetchRetry({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_completion_tokens: 700,
        messages: [
          { role: 'system', content: KH.extract },
          { role: 'user', content: `${ctx}OSTATNIA WYMIANA:\n${transcript}` },
        ],
      }),
    }, 'knowhow-extract')
    if (!res.ok) { console.error('[bud-chat] knowhow-extract http', res.status); await stampKnowhowError(supabase, sessionId, leadId, 'extract_error', `OpenAI HTTP ${res.status}`); return }
    const data = await res.json().catch(() => null) as { choices?: Array<{ message?: { content?: string } }> } | null
    const content = data?.choices?.[0]?.message?.content || ''
    let items: Array<Record<string, unknown>> = []
    const tryParse = (s: string) => { try { const p = JSON.parse(s) as { items?: unknown }; if (Array.isArray(p?.items)) items = p.items as Array<Record<string, unknown>> } catch (_e) { /* ignore */ } }
    tryParse(content)
    if (!items.length) { const m = content.match(/\{[\s\S]*\}/); if (m) tryParse(m[0]) }
    const VALID = new Set(['wniosek', 'wymaganie', 'link', 'zalacznik', 'uwaga', 'cytat', 'intel_cenowy', 'luka', 'decyzja', 'sprzecznosc', 'zalozenie'])
    const SCOPES = new Set(['v1', 'pozniej', 'poza', 'nieznane'])
    const rows = items
      .filter((it) => it && typeof it.content === 'string' && (it.content as string).trim() && VALID.has(it.kind as string))
      .slice(0, 12)
      .map((it) => ({
        session_id: sessionId,
        lead_id: leadId,
        kind: it.kind as string,
        scope: SCOPES.has(it.scope as string) ? (it.scope as string) : null,
        source_tag: it.source_tag === 'research' ? 'research' : 'klient',
        content: String(it.content).slice(0, 1000),
        url: (it.kind === 'link' && typeof it.url === 'string') ? (it.url as string).slice(0, 2000) : null,
        created_by: null,
        meta: { auto: true },
      }))
    if (rows.length) {
      const { error } = await supabase.from('bud_knowhow_items').insert(rows)
      if (error) { console.error('[bud-chat] knowhow insert error:', error); await stampKnowhowError(supabase, sessionId, leadId, 'extract_error', `insert: ${error.message || '?'}`); return }
    }
    await refreshKnowhowSummary(supabase, sessionId, leadId, ideaSource)
  } catch (e) {
    console.error('[bud-chat] extractKnowhowAsync error:', e)
    await stampKnowhowError(supabase, sessionId, leadId, 'extract_error', String(e))
  }
}

// HANDOFF PACK: przy domknięciu etapu buduje pakiet wykonawczy do budowy v1
// (dla Tomka, niewidoczny dla klienta). Czyta wszystkie elementy + kartę projektu.
async function generateHandoffPack(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
): Promise<void> {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) return
    await ensureKnowhowPrompts(supabase)
    const { data: sess } = await supabase.from('bud_sessions').select('problem_summary, preview_brief, lead_id, idea_source').eq('id', sessionId).maybeSingle()
    const { data: itemsRaw } = await supabase.from('bud_knowhow_items').select('kind, scope, source_tag, content, url').eq('session_id', sessionId).order('created_at', { ascending: true })
    const items = (itemsRaw || []) as Array<Record<string, unknown>>
    const card = (sess?.problem_summary as Record<string, unknown> | null) || (sess?.preview_brief as Record<string, unknown> | null) || {}
    if (!items.length && !Object.keys(card).length) return
    // Źródło pomysłu kształtuje cały etap (insider/AI/wspólny) → pakiet wykonawczy
    // musi je znać (kto wnosi wiedzę branżową: klient czy research Tomka).
    const srcMap: Record<string, string> = {
      wlasny: 'WŁASNY (klient zna branżę od środka — insider; jego wiedza jest wiążąca)',
      ai: 'PODSUNĘŁA AI (klient NIE jest ekspertem branży — wiedzę branżową bierze na siebie Tomek/research)',
      wspolny: 'WSPÓLNY (część wiedzy od klienta, część z researchu)',
    }
    const srcLabel = srcMap[(sess?.idea_source as string | null) || 'wlasny'] || srcMap.wlasny
    const itemsTxt = items.map((i) => `- [${i.kind}${i.scope ? '/' + i.scope : ''}] ${i.content}${i.url ? ' (' + i.url + ')' : ''}`).join('\n')
    const userMsg = `ŹRÓDŁO POMYSŁU: ${srcLabel}\n\nKARTA PROJEKTU:\n${JSON.stringify(card).slice(0, 1500)}\n\nZEBRANE ELEMENTY (baza wiedzy):\n${itemsTxt.slice(0, 8000)}`
    const res = await openaiFetchRetry({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_completion_tokens: 6000,
        messages: [ { role: 'system', content: KH.handoff }, { role: 'user', content: userMsg } ],
      }),
    }, 'knowhow-handoff')
    const hpLead = (sess?.lead_id as string | null) ?? null
    if (!res.ok) { console.error('[bud-chat] handoff http', res.status); await stampKnowhowError(supabase, sessionId, hpLead, 'handoff_error', `OpenAI HTTP ${res.status}`); return }
    const data = await res.json().catch(() => null) as { choices?: Array<{ message?: { content?: string } }> } | null
    const text = data?.choices?.[0]?.message?.content || ''
    if (text.trim()) {
      await supabase.from('bud_knowhow_summary').upsert({
        session_id: sessionId,
        lead_id: hpLead,
        handoff_pack: text.trim(),
        handoff_generated_at: new Date().toISOString(),
        handoff_error: null,    // udana generacja czyści poprzedni błąd
        handoff_error_at: null,
      }, { onConflict: 'session_id' })
    } else {
      // 200 OK, ale pusta treść = handoff się nie wygenerował (deliverable znika cicho)
      await stampKnowhowError(supabase, sessionId, hpLead, 'handoff_error', 'pusta odpowiedź modelu')
    }
  } catch (e) {
    console.error('[bud-chat] generateHandoffPack error:', e)
    await stampKnowhowError(supabase, sessionId, null, 'handoff_error', String(e))
  }
}

// ── BRAMKA POTENCJAŁU (GA) ───────────────────────────────────────────────────
// Instrukcja wstrzykiwana do sessionContext (kanał sparing): model po domknięciu
// rdzenia wystawia <ocena> zamiast samodzielnego werdyktu/podglądu, a backend
// odpala bud-assess i steruje drugą turą. Trzymana w kodzie (nie w 31k prompcie
// settings) — to mechanika bramki, nie głos; łatwa do tuningu/rewersji.
let GATE_INSTRUCTION = ''

// WYBÓR KIERUNKU — karty rozwidlenia (marker <kierunki>). Wstrzykiwane tylko
// gdy BUD_KIERUNKI_ENABLED=1 (bezpiecznik: front renderuje <kierunki> dopiero
// po deployu redesignu; przed flipem flagi model nie zna markera → zero wycieków).
const KIERUNKI_ENABLED = (Deno.env.get('BUD_KIERUNKI_ENABLED') || '') === '1'
let KIERUNKI_INSTRUCTION = ''

// Wstrzykiwane w turze PO „zielonym" badaniu, gdy rozmówca zareagował na
// zaproponowane wyostrzenie — wtedy (i dopiero wtedy) pokazujemy podgląd.
let PREVIEW_AFTER_GATE_INSTRUCTION = ''

// Wstrzykiwane PO zielonym werdykcie (mode sparing) — ZAMIAST bramki oceny.
// Trzyma agenta w fazie współpracy (rezerwacja + przełamywanie obiekcji), zamiast
// ciągnąć go z powrotem do badania pomysłu. Mechanika w kodzie (nie w 41k prompcie)
// — łatwa do tuningu/rewersji. Treść retoryki (bank obiekcji) jest w prompcie.
let COLLAB_PHASE_INSTRUCTION = ''

// FAKTY OFERTY I UMOWY (settings.budowanie_model_biznesowy) — SSOT liczb i zasad
// współpracy. Wstrzykiwane w FAZIE WSPÓŁPRACY, żeby czat odpowiadał na pytania o
// cenę/%/etapy/warunki WPROST z umowy (transparentność — decyzja Tomka), zamiast
// zbywać „to na rozmowie". Cache module-level (jak inne) → po edycji klucza REDEPLOY.
let MODEL_FACTS = ''

// REZYGNACJA — bezpieczne, DWUSTOPNIOWE oznaczenie „zrezygnował". Model NIE
// oznacza od razu: najpierw upewnia się co do intencji, marker <rezygnacja/>
// wystawia DOPIERO po wyraźnym potwierdzeniu w kolejnej turze. Backend mapuje
// marker na etap lejka „przegrany: zrezygnował" + wstrzymuje automat maili/SMS.
// Mechanika w kodzie (nie w prompcie settings) — łatwa do tuningu/rewersji.
let RESIGNATION_INSTRUCTION = ''

// ── HARDKODOWANE FALLBACKI gate'ów ───────────────────────────────────────────
// Używane WYŁĄCZNIE gdy load z settings padnie (awaria DB). Minimalne, ale
// funkcjonalne: utrzymują mechanikę markerów (<ustalenia>, <rezygnacja/>, <makieta>)
// żeby cicha awaria settings nie pozostawiła modelu bez prowadzenia.
const FALLBACK_GATE_INSTRUCTION = `[ETAP USTALENIA] Gdy raport jest gotowy, przeprowadź KRÓTKĄ rozmowę ustalającą fundamenty marki pod TEN produkt: dla kogo dokładnie jest (konkretny avatar), główny kąt wyróżnienia, ton marki i robocza nazwa. Pytaj naturalnie, po jednym wątku. Gdy masz komplet, podsumuj i wystaw marker w osobnej linii:
<ustalenia>{"dla_kogo":"...","kat":"...","ton_marki":"...","nazwa":"...","korzysci":["...","..."]}</ustalenia>
JSON musi być POPRAWNY (tylko podwójne cudzysłowy, bez znaków sterujących). Po markerze front przechodzi do makiet.`
const FALLBACK_RESIGNATION_INSTRUCTION = `[REZYGNACJA] Jeśli rozmówca wyraźnie sygnalizuje, że rezygnuje/nie jest zainteresowany, NIE oznaczaj od razu — dopytaj raz, czy na pewno chce zakończyć. Dopiero po wyraźnym potwierdzeniu w KOLEJNEJ turze wystaw w osobnej linii marker <rezygnacja/>. Nie wymuszaj, reaguj z szacunkiem.`
const FALLBACK_COLLAB_INSTRUCTION = `[FAZA WSPÓŁPRACY] Sklep jest pokazany — to WERSJA WSTĘPNA (finalną dopracujecie razem po starcie współpracy). NIE pytaj „jak Ci się podoba" ani nie proś o akceptację. Gdy rozmówca reaguje pozytywnie — najpierw wystaw <zielone> (pozytywna decyzja + 2-3 mocne strony + 2-3 rzeczy do dopracowania razem), BEZ kwoty. Od kolejnej tury KAŻDA odpowiedź spokojnie prowadzi do REZERWACJI (500 zł, w pełni ZWROTNA — NIGDY „zadatek") jako następnego kroku: odpowiedz na pytanie/obiekcję i wskaż rezerwację rozmowy z Tomkiem przez stronę współpracy. Ton doradcy, bez nacisku i fałszywej pilności, bez zmyślonych kwot. Kartę <makieta> wystawiaj, gdy rozmówca jest gotów lub sam pyta o rezerwację.`
// Minimum faktów na wypadek awarii loadu settings — żeby czat NIGDY nie zmyślał liczb.
const FALLBACK_MODEL_FACTS = `[FAKTY OFERTY — minimum]
- Rezerwacja: 500 zł, w pełni ZWROTNA (nie „zadatek"), wliczana potem w cenę budowy.
- Budowa sklepu: 9400 zł brutto, jednorazowo, pod klucz (po wliczeniu rezerwacji zostaje 8900 zł do zapłaty).
- Udział Tomka: 20% od DOCHODU NETTO (po odjęciu towaru, reklam, wysyłki), bezterminowo, rozliczane miesięcznie — zarabia, gdy zarabia klient.
- Etapy: przygotowania → formalności → materiały reklamowe → uruchomienie kampanii (cel 1000 zamówień) → ~180 dni skalowania i przekazania sterów.
- Budżet reklamowy i koszty operacyjne (towar, wysyłka) pokrywa klient.
- Czego nie ma w tych faktach → „to domknie Tomek po rezerwacji". Nie zmyślaj liczb.`

// PRZEPLATANA NARRACJA „po co to robisz" (decyzja Tomka 2026-06-29). Lead w KAŻDEJ
// fazie ma rozumieć cel i model — wstrzykiwane do systemu każdej tury SPRZEDAŻOWEJ
// (nie w trybie know-how po płatności). Mechanika w kodzie → łatwy tuning/rewersja.
const NARRATIVE_WEAVE = `[PRZEPLATAJ „PO CO TO ROBISZ" — w każdej fazie, naturalnie, 1 zdaniem (nie wykład), zwłaszcza przy przejściach między etapami i ZAWSZE gdy lead się gubi, nie ufa lub pyta „o co właściwie chodzi":]
- TO TWÓJ SKLEP ONLINE — realny biznes e-commerce pod Twoją marką, nie kurs, nie subskrypcja, nie „ściema".
- TOMEK BUDUJE GO DLA CIEBIE jak Twój człowiek od e-commerce: składa cały sklep z zespołem, odpala reklamy i rozkręca sprzedaż (pierwsze ~1000 zamówień), potem ~pół roku skaluje i uczy Cię, aż przejmiesz stery.
- TO WSPÓLNY BIZNES — Tomek wchodzi jako WSPÓLNIK: bierze 20% od ZYSKU (nie fakturę), czyli zarabia DOPIERO, gdy Ty zarabiasz. To jego skóra w grze i dowód, że nie wciska byle czego (rozbraja „a co Ty z tego masz / czy to nie oszustwo").
- TWOJA ROLA: uczysz się przy GOTOWYM, działającym sklepie; obsługa to proste czynności (nie kod), realne przy kilku godzinach tygodniowo. Jeśli lead boi się „nie ogarnę / nie znam się / mam mało czasu" — rozbrój to WPROST i ciepło tym faktem.
- PIENIĄDZE bez iluzji: projekt, raport i podgląd sklepu są DARMOWE i zostają jego; pełną budowę pod klucz robi Tomek — to płatna współpraca (kotwica ceny). Gdy lead pyta o cenę albo sygnalizuje „mam mało / ostatnie pieniądze / jestem spłukany" — odpowiedz UCZCIWIE i z szacunkiem: jest realny próg wejścia, a reklamy i towar są osobno po jego stronie; nie bagatelizuj i nie ciągnij go pod ścianę, której nie udźwignie. Konkretne liczby podajesz, gdy dojdziecie do kroku współpracy (tam masz FAKTY OFERTY) — nigdy nie zmyślaj.
- JAKOŚĆ: makiety i reklamy, które teraz widzi, to SZYBKIE SZKICE kierunku — finalne kreacje robicie po starcie z prawdziwą sesją/realnym twórcą (rozbraja „to mocno AI-owe"). Produkt = sprawdzony popyt pod Twoją marką i marżę; NIGDY nie ujawniaj źródła ani ceny zakupu produktu.
[ROZPOZNAWAJ SYGNAŁY KUPUJĄCEGO i naturalnie dostrajaj ton (z danych: kupują głównie ci, którzy piszą konkretnie i znają temat — NIGDY nie mów leadowi, że go „oceniasz"):]
- Wspomina, że KORZYSTAŁ JUŻ od Tomka/TakeDrop/z kursu/coachingu („kupiłem u was", „mam sklep na TakeDrop", „byłem na coachingu") → NAJCIEPLEJSZY sygnał (kupują ~4× częściej). Odwołaj się ciepło do wspólnej historii, potraktuj jak kogoś, kto już zaufał, i płynnie prowadź do DOKOŃCZENIA tego, co utknęło.
- Mówi językiem e-commerce (marża, skalowanie, kampanie, konwersja) albo opisuje konkretne próby (Allegro/dropshipping/Shopify/Vinted) → rozmawiaj jak z równym, konkretnie i merytorycznie, bez tłumaczenia podstaw — to wysoka intencja zakupowa.
- Pisze długo i szczegółowo o tym, co próbował → wysoka intencja; pokaż, że słyszysz szczegóły, dopytaj.
- Pisze KRÓTKO i deklaruje, że NIGDY nic nie próbował → niższa gotowość: edukuj cieplej, ustaw realne oczekiwania i delikatnie skwalifikuj budżet, zanim zainwestujecie dużo czasu.
Ton: doradca-wspólnik, po polsku, bez nacisku, bez fałszywej pilności, bez żargonu.`

// ── TRYB „DOPRACOWANIE WIZJI" (KNOW-HOW) — po pełnej płatności ────────────────
// Włączany WYŁĄCZNIE serwerowo, gdy bud_sessions.full_paid_at IS NOT NULL i
// knowhow_closed_at IS NULL. Dla każdej innej sesji ta gałąź nie istnieje —
// sparing pozostaje niezmieniony. Zbieranie wiedzy do bud_knowhow_* odbywa się
// CICHO w tle (extractKnowhowAsync), bez markerów w treści czatu.
// ── Prompty SPOWIEDNIKA (know-how) — JEDYNE źródło = settings (klucze budowanie_knowhow_*).
// Ładowane raz na cold-start (ensureKnowhowPrompts); pusty fallback to bezpiecznik, nie treść.
// Edycja z panelu „Źródło prawdy". (Faza 1 single-source 2026-06-20.)
let KH_LOADED = false
const KH = { base: '', src_wlasny: '', src_ai: '', src_wspolny: '', resume: '', extract: '', handoff: '', idea_hint: '' }
async function ensureKnowhowPrompts(supabase: ReturnType<typeof createClient>): Promise<void> {
  if (KH_LOADED) return
  try {
    const { data } = await supabase.from('settings').select('key, value').in('key', [
      'budowanie_knowhow_base', 'budowanie_knowhow_src_wlasny', 'budowanie_knowhow_src_ai', 'budowanie_knowhow_src_wspolny',
      'budowanie_knowhow_resume', 'budowanie_knowhow_extract', 'budowanie_knowhow_handoff', 'budowanie_knowhow_idea_source_hint',
    ])
    const v = (k: string) => ((data || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''
    KH.base = v('budowanie_knowhow_base'); KH.src_wlasny = v('budowanie_knowhow_src_wlasny'); KH.src_ai = v('budowanie_knowhow_src_ai')
    KH.src_wspolny = v('budowanie_knowhow_src_wspolny'); KH.resume = v('budowanie_knowhow_resume'); KH.extract = v('budowanie_knowhow_extract')
    KH.handoff = v('budowanie_knowhow_handoff'); KH.idea_hint = v('budowanie_knowhow_idea_source_hint')
    KH_LOADED = true
  } catch (e) { console.error('[bud-chat] ensureKnowhowPrompts', e) }
}
function knowhowInstruction(ideaSource: string): string {
  const src = ideaSource === 'ai' ? KH.src_ai : ideaSource === 'wspolny' ? KH.src_wspolny : KH.src_wlasny
  return `${KH.base}\n${src}`

}

// Wywołanie bramki bud-assess (server-to-server). Zwraca obiekt oceny lub null.
async function runGate(
  supabaseUrl: string,
  serviceKey: string,
  projekt: Record<string, unknown>,
  sessionId: string,
  track: string | null,
  onProgress?: (label: string) => void,
): Promise<Record<string, unknown> | null> {
  const url = `${supabaseUrl}/functions/v1/bud-assess`
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` }
  // Próba STREAMOWANA — realny postęp przez onProgress (etykiety wg wyszukań).
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ projekt, sessionId, track, stream: true }) })
    if (res.ok && res.body) {
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      let ocena: Record<string, unknown> | null = null
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        let i
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const evt = buf.slice(0, i); buf = buf.slice(i + 2)
          let ev = ''; let ds = ''
          for (const line of evt.split('\n')) {
            if (line.startsWith('event:')) ev = line.slice(6).trim()
            else if (line.startsWith('data:')) ds += line.slice(5).replace(/^ /, '')
          }
          if (!ds) continue
          let d: Record<string, unknown> | null = null
          try { d = JSON.parse(ds) } catch { continue }
          if (ev === 'progress' && d?.label && onProgress) { try { onProgress(String(d.label)) } catch { /* ignore */ } }
          else if (ev === 'verdict' && d?.ocena && typeof d.ocena === 'object') { ocena = d.ocena as Record<string, unknown> }
        }
      }
      if (ocena) return ocena
      console.error('[bud-chat] bud-assess stream: brak werdyktu → fallback buforowany')
    } else {
      console.error('[bud-chat] bud-assess stream HTTP:', res.status)
    }
  } catch (err) {
    console.error('[bud-chat] runGate stream exception → fallback:', err)
  }
  // FALLBACK: buforowany strzał (pewny werdykt, bez postępu). Gwarantuje, że
  // bramka nie pada przez kruchość streamu — niezawodność zachowana.
  try {
    const res2 = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ projekt, sessionId, track }) })
    if (!res2.ok) { console.error('[bud-chat] bud-assess fallback HTTP:', res2.status); return null }
    const data = await res2.json()
    return (data && typeof data.ocena === 'object') ? data.ocena as Record<string, unknown> : null
  } catch (err) {
    console.error('[bud-chat] runGate fallback exception:', err)
    return null
  }
}

// ── K1 DOBÓR PRODUKTU: wywołanie bud-products (server-to-server) ──────────────
// Wzór: runGate (fallback buforowany). bud-products jest WEWNĘTRZNA i woła web_search,
// więc bywa wolna/kapryśna — soft-fail: przy błędzie zwracamy [] (jak runGate null),
// żeby kruchość researchu nie wywracała tury. Retry/timeout analogicznie do runGate.
async function runProducts(
  supabaseUrl: string,
  serviceKey: string,
  zadanie: { kategoria?: string; budzet?: string; styl?: string; wyklucz?: string[]; adBuffer?: unknown[] },
  sessionId: string,
  track: string | null,
  page: number,
): Promise<Record<string, unknown>[]> {
  const url = `${supabaseUrl}/functions/v1/bud-products`
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` }
  // mode:'produkty' → tor AD-FIRST (ScrapeCreators→AliExpress ship-PL→GPT verify) w bud-products.
  // ad_buffer = reklamy z PRE-WALIDACJI kierunku (jeśli są) → 0 dodatkowych kredytów ScrapeCreators.
  // Gdy brak klucza ScrapeCreators, bud-products ignoruje mode i spada na stary tor (bezpiecznie).
  const body = JSON.stringify({
    sessionId, track, page, mode: 'produkty',
    kategoria: zadanie.kategoria, budzet: zadanie.budzet, styl: zadanie.styl, wyklucz: zadanie.wyklucz,
    ad_buffer: Array.isArray(zadanie.adBuffer) ? zadanie.adBuffer : [],
  })
  const attempts = 2
  for (let i = 0; i < attempts; i++) {
    try {
      // Timeout per próba (web_search potrafi wisieć) — bramka Supabase i tak ~150s,
      // ale wolimy kontrolowany abort + ewentualny retry niż jeden długi wis.
      const ctrl = new AbortController()
      const to = setTimeout(() => { try { ctrl.abort() } catch { /* ignore */ } }, 110_000)
      let res: Response
      try {
        res = await fetch(url, { method: 'POST', headers, body, signal: ctrl.signal })
      } finally { clearTimeout(to) }
      if (!res.ok) {
        console.error('[bud-chat] bud-products HTTP:', res.status)
        try { await res.body?.cancel() } catch { /* zwolnij połączenie */ }
        if (i < attempts - 1) { await new Promise((r) => setTimeout(r, 500 * (i + 1))); continue }
        return []
      }
      const data = await res.json().catch(() => null)
      return (data && Array.isArray(data.items)) ? data.items as Record<string, unknown>[] : []
    } catch (err) {
      console.error('[bud-chat] runProducts exception:', err)
      if (i < attempts - 1) { await new Promise((r) => setTimeout(r, 500 * (i + 1))); continue }
      return []
    }
  }
  return []
}

// ── PRE-WALIDACJA KIERUNKÓW (karty): woła bud-products mode='kierunki' ───────
// Dla listy {nazwa,fraza} sprawdza, które kierunki mają realne reklamy w PL (≥próg).
// Zwraca [{nazwa, ok, count, ads}] — bud-chat pokazuje tylko ok=true (gwarancja „nigdy pusty"),
// a ads zapisuje do bufora (discovery po wyborze nie pali kolejnych kredytów). Soft-fail [].
async function runKierunki(
  supabaseUrl: string,
  serviceKey: string,
  kierunki: Array<{ nazwa: string; fraza: string }>,
  sessionId: string,
): Promise<Array<{ nazwa: string; ok: boolean; count: number; ads: unknown[] }>> {
  const url = `${supabaseUrl}/functions/v1/bud-products`
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` }
  const body = JSON.stringify({ sessionId, mode: 'kierunki', kierunki })
  for (let i = 0; i < 2; i++) {
    try {
      const ctrl = new AbortController()
      const to = setTimeout(() => { try { ctrl.abort() } catch { /* */ } }, 90_000)
      let res: Response
      try { res = await fetch(url, { method: 'POST', headers, body, signal: ctrl.signal }) } finally { clearTimeout(to) }
      if (!res.ok) { console.error('[bud-chat] runKierunki HTTP:', res.status); try { await res.body?.cancel() } catch { /* */ } if (i < 1) { await new Promise((r) => setTimeout(r, 500)); continue } return [] }
      const data = await res.json().catch(() => null)
      const arr = (data && Array.isArray(data.kierunki)) ? data.kierunki : []
      return arr.map((k: Record<string, unknown>) => ({ nazwa: String(k?.nazwa || ''), ok: k?.ok === true, count: Number(k?.count) || 0, ads: Array.isArray(k?.ads) ? k.ads : [] }))
    } catch (err) { console.error('[bud-chat] runKierunki exception:', err); if (i < 1) { await new Promise((r) => setTimeout(r, 500)); continue } return [] }
  }
  return []
}

// Instrukcja sterowania dla DRUGIEJ tury (po badaniu rynku). Tu mieszka jakość
// podpowiedzi: przy nie-zielonym ZAWSZE <opcje> prowadzące w stronę kierunku.
function buildSteerInstruction(o: Record<string, unknown>): string {
  const ocena = String(o.ocena || '')
  const kierunek = String(o.kierunek || '')
  const rynek = String(o.odczyt_rynku || '')
  const konk = String(o.konkurencja || '')
  const powody = Array.isArray(o.powody) ? (o.powody as unknown[]).map(String).join(' • ') : ''
  const zrodla = Array.isArray(o.zrodla)
    ? (o.zrodla as Record<string, unknown>[]).slice(0, 4).map((z) => String(z?.tytul || '')).filter(Boolean).join(', ')
    : ''
  const platnosc = String(o.platnosc || '')
  const wspolne = `DANE Z BADANIA RYNKU (na żywo, REALNE — wykorzystaj je, to nie zgadywanie): ocena=${ocena}. Rynek/nisza: ${rynek} Konkurencja+ceny: ${konk} Czy ktoś płaci: ${platnosc} Powody: ${powody}. Najmocniejszy kąt/luka: ${kierunek}${zrodla ? ` Źródła: ${zrodla}.` : ''}
Ten krok ma REALNIE POMÓC, nie tylko powiedzieć „ok / nie ok". Odezwij się jednym naturalnym komunikatem (BEZ markera <ocena>), który ZACZYNA od 2–3 KONKRETNYCH wniosków z badania — najwięksi konkurenci z cenami, wielkość niszy, największa LUKA — krótko, po ludzku, z ORIENTACYJNYMI przedziałami (nie udawaj precyzji); dokładną liczbę podaj tylko, gdy jesteś jej pewien ze źródła, a gdy nie — powiedz ogólnie, bez liczby. Dopiero na tej podstawie prowadź dalej.`
  if (ocena === 'mocny') {
    return `${wspolne}
TO ZIELONY KIERUNEK. Po wnioskach zaproponuj KONKRETNE wyostrzenie sklepu/marki wynikające z luki: „Dlatego proponuję, żeby sklep …" — jaki kąt podkreślić, komu dokładnie sprzedawać, czym odróżnić się od anonimowej konkurencji (rdzeń: jeden produkt-bohater + maks. 1–2 elementy wspierające, NIGDY hurtownia).
NIE wystawiaj jeszcze <projekt> ani <werdykt> — najpierw chcemy JEDNĄ rundę dopracowania kierunku z rozmówcą (podgląd sklepu pokażesz w następnej turze). Zakończ podpowiedziami: marker <opcje>["Tak, w tę stronę","Wolę inny akcent","Pokaż, jak to wygląda"] — tak, by rozmówca miał realny wpływ na wyostrzenie.`
  }
  return `${wspolne}
TO JESZCZE NIE JEST ZIELONE — NIE wystawiaj podglądu <projekt> ani zielonego <werdykt>. Po wnioskach przekaż „${kierunek}" jako MOCNĄ, pewną rekomendację (nie jako porażkę — jako „mam dla Ciebie lepszą wersję, bo dane pokazują…"), wprost wyprowadzoną z tych danych.
ZAWSZE zakończ podpowiedziami: marker <opcje>["…","…","…"] z 2–4 krótkimi, klikalnymi odpowiedziami, które popychają DOKŁADNIE w stronę tego kierunku (zgoda na pivot, doprecyzowanie grupy/kąta, „drąż dalej"). Podpowiedzi mają brzmieć jak słowa rozmówcy, nie jak instrukcje.`
}

// #1: retry na przejściowy błąd OpenAI (429/5xx/sieć) — pojedynczy blip nie może
// gubić całej tury rozmowy (audyt 2026-06-14: realny 502 w środku rozmowy).
// Zwraca Response z NIEKONSUMOWANYM body (dla streamu).
async function openaiFetchRetry(init: RequestInit, label: string, attempts = 3): Promise<Response> {
  let last = ''
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', init)
      if (res.ok) return res
      if ((res.status === 429 || res.status >= 500) && i < attempts - 1) {
        last = `HTTP ${res.status}`
        try { await res.body?.cancel() } catch { /* zwolnij połączenie */ }
        await new Promise((r) => setTimeout(r, 500 * (i + 1)))
        console.warn(`[bud-chat] ${label} retry ${i + 1} po ${last}`)
        continue
      }
      return res // nieretryowalny albo ostatnia próba — oddaj, caller obsłuży !ok
    } catch (err) {
      last = String(err)
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)))
        console.warn(`[bud-chat] ${label} retry ${i + 1} po wyjątku ${last}`)
        continue
      }
      throw err
    }
  }
  throw new Error('openaiFetchRetry exhausted')
}

// Druga tura streamowana do TEGO samego kanału SSE (kontynuacja dymka).
async function streamSecondCall(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  apiKey: string,
  model: string,
  msgs: { role: string; content: string }[],
): Promise<{ text: string; usage: StreamUsage | null }> {
  let text = ''
  let usage: StreamUsage | null = null
  try {
    const resp = await openaiFetchRetry({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        // Druga tura (sterowanie) niesie preambułę + pełny <projekt> z 4 widokami —
        // większy limit niż zwykła tura, by marker <projekt> się nie uciął (ucięty
        // </projekt> = brak podglądu = „generowanie nie działa").
        model, stream: true, stream_options: { include_usage: true },
        max_completion_tokens: 5000, messages: msgs,
      }),
    }, 'chat-steer')
    if (!resp.ok || !resp.body) {
      console.error('[bud-chat] second call HTTP error po retry:', resp.status)
      return { text, usage }
    }
    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      let idx
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).replace(/\r$/, '')
        buf = buf.slice(idx + 1)
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6)
        if (payload === '[DONE]') continue
        try {
          const evt = JSON.parse(payload)
          if (evt?.usage) usage = evt.usage as StreamUsage
          const delta = evt?.choices?.[0]?.delta?.content
          if (typeof delta === 'string' && delta.length) {
            text += delta
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: delta } })}\n\n`,
            ))
          }
        } catch { /* niepełna linia */ }
      }
    }
  } catch (err) {
    console.error('[bud-chat] streamSecondCall exception:', err)
  }
  return { text, usage }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'metoda_niedozwolona' }, 405, corsHeaders)
  }

  try {
    // ── Konfiguracja ─────────────────────────────────────────────────────────
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!OPENAI_API_KEY) {
      console.error('[bud-chat] OPENAI_API_KEY nie skonfigurowany')
      return jsonResponse({ error: 'brak_konfiguracji_ai' }, 500, corsHeaders)
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[bud-chat] brak konfiguracji Supabase')
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, corsHeaders)
    }

    // ── Walidacja inputu ─────────────────────────────────────────────────────
    let body: BudChatRequest
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, corsHeaders)
    }

    const sessionId = (body.sessionId || '').trim()
    const profession = (body.profession || '').trim()
    const problemHint = (body.problemHint || '').trim() || null
    const email = (body.email || '').toLowerCase().trim()
    const name = (body.name || '').trim() || null
    const phone = (body.phone || '').replace(/[^\d+ \-()]/g, '').trim().slice(0, 30) || null
    const message = (body.message || '').trim()
    const tracking = body.tracking && typeof body.tracking === 'object' ? body.tracking : null
    const mode = 'sparing'   // jedyny tryb (relikt mode=wspolpraca usunięty 2026-06-16)
    // ROUTER KIERUNKÓW: jawny wybór z body (front), znormalizowany do k1/k2/k3
    const bodyTrack = normalizeTrack(body.track)
    // body.authUserId / body.authProvider: DEPRECATED, ignorowane (patrz verifyAuthUser)

    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, corsHeaders)
    }

    // ── Beacon „wyszedł z ekranu generowania" — bez message, wczesny return ──
    //   Wołany z pagehide/visibilitychange, gdy user opuszcza kartę będąc na
    //   ekranie badania rynku lub generowania ekranów. Stempluje left_screen_at,
    //   z czego bud-followups robi precyzyjny SMS powrotu (a nie z heurystyki).
    if (body.event === 'leave_screen') {
      const screen = (body.screen === 'ekrany' || body.screen === 'badanie') ? body.screen : null
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      await sb.from('bud_sessions').update({ left_screen_at: new Date().toISOString(), left_screen: screen, updated_at: new Date().toISOString() }).eq('id', sessionId)
      return jsonResponse({ ok: true }, 200, corsHeaders)
    }

    // ── Zapis kontaktu z bramki BEZ wiadomości ──
    //   Wołany po domknięciu bramki, zwłaszcza gdy werdykt już padł i kolejnej
    //   tury może nie być. Bez tego telefon/konto z bramki nie trafiłyby do bazy
    //   (contactUpdate niżej działa tylko w toku wiadomości). Te same reguły:
    //   pola dopisujemy tylko gdy puste, konto z JWT ma pierwszeństwo,
    //   sesja przypięta do konta przyjmuje zmianę tylko od właściciela.
    if (body.event === 'contact') {
      if (email && (email.length > 320 || !EMAIL_RE.test(email))) {
        return jsonResponse({ error: 'nieprawidlowy_email' }, 400, corsHeaders)
      }
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const au = await verifyAuthUser(req, sb)
      const { data: sess } = await sb
        .from('bud_sessions')
        .select('id, email, name, phone, auth_user_id')
        .eq('id', sessionId)
        .maybeSingle()
      if (!sess) {
        // Sesja jeszcze nie istnieje — nowy lejek /sklep prosi o kontakt (imię+nazwisko+e-mail)
        // PRZED pierwszą wiadomością/raportem. Zakładamy wiersz, żeby kontakt NIGDY nie przepadł
        // (cel Tomka: zero anonimowych sesji odpalających generację).
        const ins: Record<string, unknown> = { id: sessionId, last_user_at: new Date().toISOString() }
        const e0 = (au?.email || email) || null
        const n0 = (au?.name || name) || null
        if (e0) ins.email = e0
        if (n0) ins.name = n0
        if (phone) { ins.phone = phone; ins.sms_consent_at = new Date().toISOString() }
        if (au) { ins.auth_user_id = au.id; ins.auth_provider = au.provider }
        await sb.from('bud_sessions').upsert([ins], { onConflict: 'id', ignoreDuplicates: true })
        await maybeNotifyContactSlack(sb, sessionId)
        return jsonResponse({ ok: true }, 200, corsHeaders)
      }
      const ownerId = (sess.auth_user_id as string | null) || null
      if (ownerId && (!au || au.id !== ownerId)) {
        return jsonResponse({ error: 'wymagane_logowanie' }, 403, corsHeaders)
      }
      const upd: Record<string, unknown> = {}
      if (au && !sess.auth_user_id) { upd.auth_user_id = au.id; upd.auth_provider = au.provider }
      const inEmail = (au?.email || email) || null
      const inName = (au?.name || name) || null
      if (inEmail && !sess.email) upd.email = inEmail
      if (inName && !sess.name) upd.name = inName
      if (phone && !sess.phone) { upd.phone = phone; upd.sms_consent_at = new Date().toISOString() }
      if (Object.keys(upd).length) {
        upd.updated_at = new Date().toISOString()
        await sb.from('bud_sessions').update(upd).eq('id', sessionId)
      }
      // E-mail + telefon razem → powiadom #sparing (raz na sesję; helper sam
      // sprawdza oba pola i dedup, więc bezpieczne nawet bez zmiany powyżej)
      await maybeNotifyContactSlack(sb, sessionId)
      return jsonResponse({ ok: true }, 200, corsHeaders)
    }

    // ── Domknięcie etapu „Dopracowanie wizji" (know-how) — przycisk „To już wszystko" ──
    if (body.event === 'knowhow_close') {
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const au = await verifyAuthUser(req, sb)
      const { data: sess } = await sb.from('bud_sessions').select('id, lead_id, auth_user_id').eq('id', sessionId).maybeSingle()
      if (!sess) return jsonResponse({ ok: false }, 200, corsHeaders)
      const ownerId = (sess.auth_user_id as string | null) || null
      if (ownerId && (!au || au.id !== ownerId)) return jsonResponse({ error: 'wymagane_logowanie' }, 403, corsHeaders)
      const now = new Date().toISOString()
      // Idempotencja: domknij i odpal drogi handoff TYLKO przy pierwszym zamknięciu.
      // Atomowy claim (WHERE knowhow_closed_at IS NULL) chroni przed podwójnym
      // klikiem / retry sieciowym / ponownym wejściem „po fakcie" — inaczej każdy
      // re-call regenerowałby handoff (call modelu 6000 tok.) i nadpisywał poprzedni.
      const { data: claimed } = await sb.from('bud_sessions')
        .update({ knowhow_closed_at: now, updated_at: now })
        .eq('id', sessionId).is('knowhow_closed_at', null).select('id')
      if (!claimed || !claimed.length) return jsonResponse({ ok: true, already: true }, 200, corsHeaders)
      await sb.from('bud_knowhow_summary').upsert({ session_id: sessionId, lead_id: (sess.lead_id as string | null) || null, status: 'closed', closed_at: now }, { onConflict: 'session_id' })
      // Handoff pack w tle (nie blokuje odpowiedzi na przycisk)
      const erHp = (globalThis as { EdgeRuntime?: { waitUntil?: (pr: Promise<unknown>) => void } }).EdgeRuntime
      const hpPromise = generateHandoffPack(sb, sessionId)
      if (erHp && typeof erHp.waitUntil === 'function') erHp.waitUntil(hpPromise)
      else hpPromise.catch((e) => console.error('[bud-chat] handoff bg error:', e))
      return jsonResponse({ ok: true }, 200, corsHeaders)
    }
    // Czat startuje BEZ maila i BEZ profesji (czat-first; bramka inline po
    // MAX_TURNS_BEZ_KONTAKTU turach). Jeśli pola przyszły — walidujemy format.
    if (email && (email.length > 320 || !EMAIL_RE.test(email))) {
      return jsonResponse({ error: 'nieprawidlowy_email' }, 400, corsHeaders)
    }
    if (profession && profession.length > 200) {
      return jsonResponse({ error: 'brak_profesji' }, 400, corsHeaders)
    }
    if (!message && body.knowhowResume !== true && body.reportEngage !== true) {
      return jsonResponse({ error: 'pusta_wiadomosc' }, 400, corsHeaders)
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: 'wiadomosc_za_dluga' }, 400, corsHeaders)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // ── Konto z JWT (Authorization) — body.authUserId jest ignorowane ────────
    const authUser = await verifyAuthUser(req, supabase)

    // ── System prompt z settings (cache 5 min, klucz per tryb) ───────────────
    const promptKey = PROMPT_KEYS[mode]
    const systemPrompt = await getSystemPrompt(supabase, promptKey)
    if (!systemPrompt) {
      console.error(`[bud-chat] brak klucza ${promptKey} w settings`)
      return jsonResponse({ error: 'brak_promptu' }, 500, corsHeaders)
    }

    // ── Sesja: pobierz lub utwórz ────────────────────────────────────────────
    const { data: existingSession, error: sessionError } = await supabase
      .from('bud_sessions')
      .select('id, turns, profession, problem_hint, email, name, phone, auth_user_id, verdict, problem_summary, preview_brief, business_plan, preview_image_url, is_test, assessment, paid_at, lead_id, full_paid_at, knowhow_closed_at, idea_source, track, market_report, ustalenia, landing_html, niche, brand, mockups, chosen_style, session_ads, product_input')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error('[bud-chat] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }

    // ── Własność sesji: rozmowa przypięta do konta wymaga JWT tego konta ─────
    // (link ?id= przestaje działać jak hasło).
    const sessionOwnerId = (existingSession?.auth_user_id as string | null | undefined) || null
    if (sessionOwnerId && (!authUser || authUser.id !== sessionOwnerId)) {
      return jsonResponse({ error: 'wymagane_logowanie' }, 403, corsHeaders)
    }

    // Narracja przeplatana — tylko w fazie SPRZEDAŻY (przed pełną płatnością);
    // w trybie know-how/budowa (full_paid_at) NIE wstrzykujemy.
    const _isPostPay = !!(existingSession && (existingSession.full_paid_at || existingSession.knowhow_closed_at))
    const narrativeWeaveTurn = _isPostPay ? '' : `\n\n${NARRATIVE_WEAVE}`

    // ── PRZEŁĄCZENIE KIERUNKU (switch_track) — pełny pivot K1↔K2↔K3 ──────────
    // Front przy „Mam jednak własny produkt" / „Mam własny pomysł" wysyła
    // {event:'switch_track', track:'k2'|'k3', message}. Nadpisujemy track i RESETUJEMY
    // stan pochodny (inaczej nowy kierunek dziedziczyłby artefakty starego: niszę,
    // propozycje, ocenę, werdykt, podgląd, raport/economics/gtm/landing/plan). Po
    // resecie kontynuujemy NORMALNIE — istingSession jest patchowany w pamięci, więc
    // dalszy flow widzi nowy track i wyzerowane artefakty (model dostanie nowy
    // WYBRANY KIERUNEK w sessionContext). message (jeśli jest) leci jak zwykła tura.
    if (body.event === 'switch_track' && existingSession) {
      const newTrack = normalizeTrack(body.track)
      const curTrack = normalizeTrack(existingSession.track as string | null | undefined)
      if (newTrack && newTrack !== curTrack) {
        const nowIso = new Date().toISOString()
        const { error: stErr } = await supabase.from('bud_sessions').update({
          track: newTrack,
          niche: null, product_input: null,
          assessment: null, verdict: null, problem_summary: null,
          preview_brief: null, preview_images: null, preview_history: null,
          market_report: null, economics: null, gtm: null, landing_url: null, business_plan: null,
          updated_at: nowIso,
        }).eq('id', sessionId)
        if (stErr) console.error('[bud-chat] switch_track reset error:', stErr)
        else {
          // Patch in-memory snapshotu — pola czytane dalej do sessionContext.
          existingSession.track = newTrack
          existingSession.assessment = null
          existingSession.verdict = null
          existingSession.problem_summary = null
          existingSession.preview_brief = null
          existingSession.business_plan = null
        }
      }
    }

    // ── ROUTER 3 KIERUNKÓW (track) — ustal i utrwal, jeśli jeszcze nie ustawiony ──
    // Defensywnie: jawne body.track > regex po treści wiadomości usera. Zapisujemy
    // do bud_sessions.track TYLKO gdy sesja go jeszcze nie ma (pierwszy wybór wygrywa
    // — kolejne karty/wiadomości nie nadpisują już ustalonego kierunku). Jeśli nie da
    // się ustalić — null i rozmowa działa dalej jak zwykle (prompt sam poprowadzi).
    const existingTrack = normalizeTrack(existingSession?.track as string | null | undefined)
    let track: 'k1' | 'k2' | 'k3' | null = existingTrack
    if (!track) {
      const detected = bodyTrack || detectTrackFromMessage(message)
      if (detected) {
        track = detected
        const { error: trackErr } = await supabase
          .from('bud_sessions')
          .update({ track, updated_at: new Date().toISOString() })
          .eq('id', sessionId)
          .is('track', null)
        if (trackErr) console.error('[bud-chat] track update error:', trackErr)
      }
    }

    // ── Nowy pipeline /sklep: wybór stylu makiety („Wybieram styl: X") → chosen_style ──
    // Front wysyła LABEL; mapujemy na KLUCZ stylu (mockups[].style), bo bud-landing-gen
    // dobiera makietę po kluczu. Brak dopasowania → zapis surowego tekstu (fallback).
    {
      const sm = message.match(/^\s*Wybieram styl:\s*(.+)$/i)
      if (sm) {
        try {
          const want = sm[1].trim().toLowerCase()
          const { data: ms } = await supabase.from('bud_sessions').select('mockups').eq('id', sessionId).maybeSingle()
          const mocks = Array.isArray(ms?.mockups) ? ms!.mockups as Array<Record<string, unknown>> : []
          const styleOf = (i: number): string | null => (mocks[i] && typeof mocks[i].style === 'string') ? mocks[i].style as string : null
          let styl: string | null = null
          // 1) po labelu/stylu (exact LUB zawieranie — „biorę styl premium, dawaj")
          const hit = mocks.find((m) => {
            const lb = String(m.label || '').toLowerCase(), st = String(m.style || '').toLowerCase()
            return lb === want || st === want || (!!lb && want.includes(lb)) || (!!st && want.includes(st))
          })
          if (hit && typeof hit.style === 'string') styl = hit.style
          // 2) liczebnik porządkowy („ten pierwszy", „drugi", „styl 3", „nr 2")
          if (!styl) {
            const ord = /\b(pierwsz|jeden|1)\b/.test(want) ? 0 : /\b(drug|dwa|2)\b/.test(want) ? 1 : /\b(trzec|trzy|3)\b/.test(want) ? 2 : /\b(czwart|cztery|4)\b/.test(want) ? 3 : -1
            if (ord >= 0) styl = styleOf(ord)
          }
          // 3) fallback: pierwszy styl makiety (NIE surowy tekst usera, QA P2)
          if (!styl) styl = styleOf(0) || sm[1].trim().slice(0, 60)
          await supabase.from('bud_sessions').update({ chosen_style: styl, updated_at: new Date().toISOString() }).eq('id', sessionId)
        } catch (e) { console.error('[bud-chat] błąd zapisu chosen_style:', e) }
      }
    }

    // ── K1 opcja 3: WKLEJONY LINK AliExpress = własny wybrany produkt ────────────
    // Po wyczerpaniu 3 rund (decyzja Tomka) mówimy klientowi „podaj sam link z Ali".
    // Gdy w wiadomości pojawi się link Ali, utrwalamy go jako product_input.wlasny
    // (merge — nie kasujemy kandydatów/licznika). Model w prompt traktuje to jako
    // wybrany produkt i prowadzi dalej do bramki/podglądu. Tylko K1.
    if (track === 'k1' && /https?:\/\/[^\s]*aliexpress\.[a-z.]+\/[^\s]+/i.test(message)) {
      try {
        const m = message.match(/https?:\/\/[^\s]*aliexpress\.[a-z.]+\/[^\s]+/i)
        const url = m ? m[0].replace(/[)\]\.,;]+$/, '') : ''
        const idM = url.match(/\/(?:item|i)\/(\d{6,})/i) || url.match(/[?&]productId=(\d{6,})/i)
        const productId = idM ? idM[1] : null
        if (url) {
          const { data: piSess } = await supabase.from('bud_sessions').select('product_input').eq('id', sessionId).maybeSingle()
          const prev = (piSess?.product_input && typeof piSess.product_input === 'object' && !Array.isArray(piSess.product_input))
            ? piSess.product_input as Record<string, unknown> : {}
          await supabase.from('bud_sessions').update({
            product_input: { ...prev, wlasny: { url, product_id: productId, podany_przez: 'klient_link' } },
            updated_at: new Date().toISOString(),
          }).eq('id', sessionId)
          console.log('[bud-chat] K1: wklejony link Ali utrwalony jako wlasny', productId || '(bez id)')
        }
      } catch (e) { console.error('[bud-chat] capture Ali link error:', e instanceof Error ? e.message : e) }
    }

    // ── Tryb „Dopracowanie wizji" (know-how): po pełnej płatności ────────────────
    // Włączany WYŁĄCZNIE serwerowo. Dla nieopłaconych sesji = false (sparing bez zmian).
    // UWAGA: zostaje WŁĄCZONY także po zamknięciu etapu (knowhow_closed_at) — klient
    // może dopisać szczegóły „po fakcie" i to dalej spowiednik + ekstrakcja, NIE
    // powrót do pre-paymentowego łowcy problemu (werdykty/bramka kontaktu/MAX_TURNS).
    const isKnowHowMode = !!(existingSession?.full_paid_at)
    const knowhowClosed = !!(existingSession?.knowhow_closed_at)
    const ideaSource = ((existingSession?.idea_source as string | null | undefined) || 'wlasny')
    // Zaczepka „wróć do rozmowy" — generujemy proaktywną wiadomość AI bez tury usera.
    // Sensowna tylko w trybie know-how; w innych sesjach ignorujemy (i odrzucamy pustkę).
    const knowhowResume = body.knowhowResume === true && isKnowHowMode
    if (body.knowhowResume === true && !isKnowHowMode) {
      return jsonResponse({ error: 'pusta_wiadomosc' }, 400, corsHeaders)
    }
    // Zaczepka po bramce kontaktu: kontakt właśnie podany, raport ruszył w tle →
    // proaktywna tura AI (bez wiadomości usera), która angażuje rozmówcę pytaniem do
    // ustaleń, żeby rozmowa nie stała w miejscu w trakcie generacji raportu.
    const reportEngage = body.reportEngage === true

    let turnsBefore = 0
    if (existingSession) {
      turnsBefore = existingSession.turns ?? 0

      // Kontakt z bramki inline: każde pole dopisywane NIEZALEŻNIE, gdy przyszło
      // a sesja go nie ma (telefon/OAuth potrafią dojść później niż mail —
      // np. stara sesja sprzed bramki v2 albo powrót z logowania Google).
      // Konto (JWT) ma pierwszeństwo przed polami z body.
      const contactUpdate: Record<string, unknown> = {}
      if (authUser && !existingSession.auth_user_id) {
        contactUpdate.auth_user_id = authUser.id
        contactUpdate.auth_provider = authUser.provider
      }
      const incomingEmail = (authUser?.email || email) || null
      const incomingName = (authUser?.name || name) || null
      if (incomingEmail && !existingSession.email) contactUpdate.email = incomingEmail
      if (incomingName && !existingSession.name) contactUpdate.name = incomingName
      // Numer oddany przez bramkę, która jawnie informuje o SMS-ach o projekcie
      // („…czasem wyślemy SMS… STOP wypisuje") = zgoda przez wyraźną informację.
      if (phone && !existingSession.phone) { contactUpdate.phone = phone; contactUpdate.sms_consent_at = new Date().toISOString() }
      if (Object.keys(contactUpdate).length) {
        contactUpdate.updated_at = new Date().toISOString()
        const { error: contactError } = await supabase
          .from('bud_sessions')
          .update(contactUpdate)
          .eq('id', sessionId)
        if (contactError) console.error('[bud-chat] contact update error:', contactError)
        // Jeśli ta tura dopięła e-mail lub telefon — sprawdź czy lead ma już
        // komplet kontaktu i ewentualnie powiadom #sparing (dedup w helperze).
        if ('email' in contactUpdate || 'phone' in contactUpdate) {
          await maybeNotifyContactSlack(supabase, sessionId)
        }
      }
    } else {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null

      // Anty-bot: nowa sesja BEZ zalogowania wymaga tokena Turnstile.
      // Zalogowany użytkownik (ważny JWT) jest już zweryfikowany — bez captchy.
      if (!authUser) {
        const human = await verifyTurnstile(body.turnstileToken, ip)
        if (!human) {
          return jsonResponse({ error: 'weryfikacja_bot' }, 403, corsHeaders)
        }
      }

      // Anty-abuse: limit NOWYCH sesji per IP (rate-limit per sesję da się ominąć
      // mnożeniem sessionId — ten limit zamyka tę furtkę)
      if (ip) {
        const ipHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { count: ipSessions, error: ipCountError } = await supabase
          .from('bud_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('ip', ip)
          .gte('created_at', ipHourAgo)
        if (ipCountError) {
          console.error('[bud-chat] ip rate-limit count error:', ipCountError)
          return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
        }
        if ((ipSessions ?? 0) >= MAX_SESSIONS_PER_HOUR_PER_IP) {
          return jsonResponse({ error: 'limit_sesji' }, 429, corsHeaders)
        }
      }

      // Limit nowych sesji per KONTO/dobę (IP łatwo zmienić, konto trudniej)
      if (authUser) {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count: userSessions, error: userCountError } = await supabase
          .from('bud_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('auth_user_id', authUser.id)
          .gte('created_at', dayAgo)
        if (userCountError) {
          console.error('[bud-chat] user rate-limit count error:', userCountError)
        } else if ((userSessions ?? 0) >= MAX_SESSIONS_PER_DAY_PER_USER) {
          return jsonResponse({ error: 'limit_sesji' }, 429, corsHeaders)
        }
      }

      // upsert + ignoreDuplicates: odporne na wyścig dwóch równoległych requestów
      const { error: insertError } = await supabase
        .from('bud_sessions')
        .upsert(
          [{
            id: sessionId,
            profession: profession || null,
            problem_hint: problemHint,
            email: email || authUser?.email || null,
            name: name || authUser?.name || null,
            phone,
            sms_consent_at: phone ? new Date().toISOString() : null,   // zgoda przez info przy bramce
            auth_user_id: authUser?.id || null,
            auth_provider: authUser?.provider || null,
            tracking,
            track,   // ROUTER KIERUNKÓW: jeśli front od razu wysłał wybór/treść, zapisz przy tworzeniu
            ip,
            last_user_at: new Date().toISOString(),
          }],
          { onConflict: 'id', ignoreDuplicates: true },
        )
      if (insertError) {
        console.error('[bud-chat] session insert error:', insertError)
        return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
      }
    }

    // ── Limity (przed wywołaniem Claude) ─────────────────────────────────────
    if (!isKnowHowMode && turnsBefore >= MAX_TURNS) {
      return jsonResponse({ error: 'limit_tur' }, 429, corsHeaders)
    }

    // Bramka kontaktu (backstop server-side; frontend pokazuje formularz wcześniej):
    // bez maila rozmowa nie przechodzi dalej niż MAX_TURNS_BEZ_KONTAKTU tur.
    const effectiveEmail = (existingSession?.email as string | null | undefined) || email || authUser?.email || null
    // Bramkę przechodzi: zweryfikowane konto (JWT teraz albo sesja już przypięta),
    // a w okresie przejściowym (REQUIRE_ACCOUNT=false) także sam e-mail jak dotąd.
    const hasAccount = !!authUser || !!sessionOwnerId
    const gateSatisfied = REQUIRE_ACCOUNT ? hasAccount : (hasAccount || !!effectiveEmail)
    // #10: nie wymuszaj kontaktu, zanim rozmówca zobaczył pierwszy podgląd („wow”) —
    // chyba że rozmowa wlecze się bez podglądu (twardy backstop MAX_TURNS_HARD_GATE).
    // „Wow" w nowym lejku /sklep = domknięte USTALENIA (zaraz potem lecą makiety) — wtedy
    // prosimy o kontakt jako naturalna wymiana („zostaw email, przyślę makiety"). Stary
    // preview_brief nigdy nie powstaje w nowym flow, więc bez tego bramka spadała na twardy
    // licznik tur W ŚRODKU ustaleń (za wcześnie, przed jakimkolwiek efektem).
    const previewShown = !!existingSession?.preview_brief || !!existingSession?.ustalenia
    const contactDue = (turnsBefore >= MAX_TURNS_BEZ_KONTAKTU && previewShown)
      || turnsBefore >= MAX_TURNS_HARD_GATE
    if (!isKnowHowMode && !gateSatisfied && contactDue) {
      return jsonResponse({ error: REQUIRE_ACCOUNT ? 'wymagane_konto' : 'wymagany_email' }, 403, corsHeaders)
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentCount, error: countError } = await supabase
      .from('bud_messages')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .gte('created_at', hourAgo)

    if (countError) {
      console.error('[bud-chat] rate-limit count error:', countError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if ((recentCount ?? 0) >= MAX_MESSAGES_PER_HOUR) {
      return jsonResponse({ error: 'limit_wiadomosci' }, 429, corsHeaders)
    }

    // ── Historia rozmowy (przed dopisaniem nowej wiadomości; per kanał) ──────
    const { data: history, error: historyError } = await supabase
      .from('bud_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('channel', mode)
      .order('id', { ascending: true })

    if (historyError) {
      console.error('[bud-chat] history fetch error:', historyError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }

    // ── Append wiadomości usera ──────────────────────────────────────────────
    // Zaczepka know-how (knowhowResume): brak realnej wiadomości usera → NIE zapisujemy
    // jej do historii. Model dostaje syntetyczny wyzwalacz jako ostatnią turę.
    if (!knowhowResume && !reportEngage) {
      const { error: userMsgError } = await supabase
        .from('bud_messages')
        .insert({ session_id: sessionId, role: 'user', content: message, channel: mode })
      if (userMsgError) {
        console.error('[bud-chat] insert user message error:', userMsgError)
        return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
      }
    }

    const RESUME_TRIGGER = '[SYSTEM: Rozmówca wrócił do rozmowy i czeka — zagadnij go zgodnie z instrukcją POWRÓT DO ROZMOWY.]'
    const REPORT_ENGAGE_TRIGGER = '[SYSTEM: Rozmówca właśnie zostawił komplet kontaktu i raport rynku RUSZYŁ w tle (wyników JESZCZE nie ma). Nie zostawiaj ciszy: zagadnij go JEDNYM lekkim, naturalnym pytaniem przydatnym do późniejszych ustaleń (kogo widzi jako klienta / co go w produkcie przekonało / jaki klimat marki / pomysł na nazwę). OBOWIĄZKOWO dołącz marker <opcje> z 2-4 klikalnymi odpowiedziami. NIE twierdź, że raport jest gotowy ani nie podawaj liczb/wyników.]'
    const messages = [
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: knowhowResume ? RESUME_TRIGGER : (reportEngage ? REPORT_ENGAGE_TRIGGER : message) },
    ]

    // Kontekst sesji dla modelu: profesja + punkt wyjścia (kafelek lub własne
    // słowa rozmówcy). Źródłem prawdy jest wiersz sesji w DB; dla nowej sesji
    // — wartości z requestu. Osobny blok system PO bloku cache'owanym
    // (cache_control wyznacza granicę prefiksu — duży prompt dalej się cache'uje).
    const sessionProfession = (existingSession?.profession as string | null | undefined) || profession || null
    // JEDNO FLOW (picker-first): produkt wybiera rozmówca z karuzeli viralowych hitów,
    // nie odkrywamy go z rozmowy. Router kierunków K1/K2/K3 wygaszony — NIE wstrzykujemy
    // „WYBRANY KIERUNEK" ani nie każemy modelowi „ustalać, czym rozmówca się zajmuje".
    let sessionContext =
      `KONTEKST SESJI${sessionProfession ? ` — rozmówca wspomniał, że zajmuje się: ${sessionProfession}` : ''}.`

    // Bramka potencjału: model wystawia <ocena> po domknięciu rdzenia, backend
    // odpala bud-assess i steruje drugą turą wg wyniku (tylko kanał sparing).
    // Jeśli poprzednia tura zamknęła badanie „zielonym" i czekamy na podgląd po
    // dopracowaniu kierunku — wstrzykujemy instrukcję podglądu zamiast bramki
    // (jednorazowo; flaga awaiting_preview w assessment, czyszczona poniżej).
    {
      await ensureKnowhowPrompts(supabase)
if (!GATE_INSTRUCTION) { try { const { data: __ep } = await supabase.from('settings').select('key, value').in('key', ['budowanie_etap_gate', 'budowanie_etap_kierunki', 'budowanie_etap_preview_po_kierunku', 'budowanie_etap_wspolpraca', 'budowanie_etap_rezygnacja', 'budowanie_model_biznesowy']); const __ev = (k: string) => ((__ep || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''; GATE_INSTRUCTION = __ev('budowanie_etap_gate'); KIERUNKI_INSTRUCTION = __ev('budowanie_etap_kierunki'); PREVIEW_AFTER_GATE_INSTRUCTION = __ev('budowanie_etap_preview_po_kierunku'); COLLAB_PHASE_INSTRUCTION = __ev('budowanie_etap_wspolpraca'); RESIGNATION_INSTRUCTION = __ev('budowanie_etap_rezygnacja'); MODEL_FACTS = __ev('budowanie_model_biznesowy') } catch (_e) { /* fallback poniżej */ } }
      // GUARD: gdy load z settings padł (awaria DB), instrukcje zostają puste →
      // detektor rezygnacji omijany, etap ustaleń bez prowadzenia. Wstrzykujemy
      // minimalny hardkod, żeby mechanika gate'ów NIGDY nie zniknęła całkowicie.
      if (!GATE_INSTRUCTION) { console.error('[bud-chat] GATE_INSTRUCTION puste — hardkod fallback'); GATE_INSTRUCTION = FALLBACK_GATE_INSTRUCTION }
      if (!RESIGNATION_INSTRUCTION) { console.error('[bud-chat] RESIGNATION_INSTRUCTION puste — hardkod fallback'); RESIGNATION_INSTRUCTION = FALLBACK_RESIGNATION_INSTRUCTION }
      if (!COLLAB_PHASE_INSTRUCTION) { console.error('[bud-chat] COLLAB_PHASE_INSTRUCTION puste — hardkod fallback'); COLLAB_PHASE_INSTRUCTION = FALLBACK_COLLAB_INSTRUCTION }
      if (!MODEL_FACTS) { console.error('[bud-chat] MODEL_FACTS puste — hardkod fallback'); MODEL_FACTS = FALLBACK_MODEL_FACTS }
      const asmt = existingSession?.assessment as Record<string, unknown> | null
      if (isKnowHowMode) {
        // TRYB DOPRACOWANIA WIZJI (po pełnej płatności): zbieranie know-how,
        // nie ocena. Wariant zależny od źródła pomysłu (insider/AI/wspólny).
        sessionContext += `\n\n${knowhowInstruction(ideaSource)}`
        // Wstrzyknij kartę projektu, żeby AI niezawodnie wiedziało, co budujemy
        // (nie pytało o ustalone) — niezależnie od długości historii rozmowy.
        const khCard = (existingSession?.problem_summary as Record<string, unknown> | null) || (existingSession?.preview_brief as Record<string, unknown> | null)
        if (khCard) sessionContext += `\n\n[CO JUŻ WIEMY O PROJEKCIE — nie pytaj o to ponownie, to ustalone]\n${JSON.stringify(khCard).slice(0, 1600)}`
        // Etap formalnie domknięty (klient kliknął „to już wszystko") — Tomek ma komplet
        // i rusza z budową. Jeśli klient mimo to coś dopisze: podziękuj, dopytaj krótko o
        // jeden szczegół i potwierdź, że dopisujesz to do projektu. Bez ponaglania.
        if (knowhowClosed) sessionContext += `\n\n[ETAP DOPRACOWANIA JUŻ DOMKNIĘTY] Klient zamknął ten etap, a Tomek zaczął budowę. Każda nowa wiadomość to bonusowy szczegół „po fakcie". Reaguj krótko i ciepło: podziękuj, w razie potrzeby dopytaj o jedną rzecz i zapewnij, że trafia to do projektu. Nie zachęcaj do przedłużania rozmowy.`
        // Powrót do rozmowy („wróć do rozmowy") — proaktywna zaczepka zamiast reakcji na turę.
        if (knowhowResume) sessionContext += `\n\n${KH.resume}`
      } else if (existingSession?.landing_html) {
        // PO POKAZANIU SKLEPU (nowy pipeline /sklep): faza współpracy + rezerwacja
        // (przełamywanie obiekcji, <makieta>). Nie bramkuj już niczym wcześniejszym.
        sessionContext += `\n\n${COLLAB_PHASE_INSTRUCTION}`
        // FAKTY OFERTY I UMOWY — żeby czat odpowiadał na pytania o cenę/%/etapy/warunki
        // WPROST z umowy (transparentność), zamiast zbywać. Tylko w fazie współpracy.
        sessionContext += `\n\n[FAKTY OFERTY I UMOWY — to z tego bloku czerpiesz WSZYSTKIE konkrety o współpracy; gdy rozmówca pyta o cenę, procent Tomka, etapy, czas, co wchodzi w cenę, warunki — odpowiadaj WPROST stąd, nie zbywaj „to na rozmowie"; nie zmyślaj niczego spoza tego bloku]\n${MODEL_FACTS}`
        // ZIELONE ŚWIATŁO przed rezerwacją: dopóki verdict != 'zielony', wymuś <zielone> jako PIERWSZE,
        // zero kwoty 500 zł przed nim (QA: 500 zł pitchowane przed zielonym = odruchowy upsell).
        if ((existingSession?.verdict as string | null) !== 'zielony') {
          sessionContext += `\n\n[KOLEJNOŚĆ — TWARDE: rozmówca ma już gotową stronę, ale ZIELONE ŚWIATŁO jeszcze NIE padło w tej rozmowie. W NAJBLIŻSZEJ odpowiedzi (gdy reaguje na stronę albo pyta „co dalej") NAJPIERW wydaj <zielone> (pozytywna decyzja + 2-3 mocne strony z raportu + 2-3 rzeczy „co dopracujemy razem"). NIE wymieniaj kwoty 500 zł ani słowa „rezerwacja", DOPÓKI nie padło zielone światło. Rezerwację (<makieta>) proponujesz DOPIERO po zielonym świetle.]`
        }
        // Wstrzyknij USTALENIA, żeby odpowiedzi o ofercie/zakresie/cenie były pod TEN biznes.
        const collabCard = (existingSession?.ustalenia as Record<string, unknown> | null) || (existingSession?.preview_brief as Record<string, unknown> | null) || (existingSession?.problem_summary as Record<string, unknown> | null)
        if (collabCard) sessionContext += `\n\n[USTALENIA PROJEKTU — przy pytaniach o ofertę/zakres/„co wchodzi"/cenę personalizuj DOKŁADNIE pod to, nie ogólnikuj]\n${JSON.stringify(collabCard).slice(0, 1800)}`
      } else {
        // NOWY PIPELINE /sklep — ETAP 2: raport → USTALENIA. Wstrzyknij raport (gdy gotowy),
        // żeby ustalenia „dla kogo" były na nim oparte. GATE_INSTRUCTION (settings,
        // budowanie_etap_gate) niesie teraz instrukcję etapu ustaleń. Stary <ocena>/kierunki OFF.
        const rep = existingSession?.market_report as Record<string, unknown> | null
        if (rep && typeof rep === 'object') {
          const { _meta: _d, ...r } = rep
          sessionContext += `\n\n[RAPORT STRATEGICZNY PRODUKTU — GOTOWY. PRZEJŚCIE MA BYĆ PŁYNNE, NIE URWANE: jeśli przed chwilą rozmawialiście (czas generowania raportu), NAJPIERW zareaguj na ostatnią wypowiedź rozmówcy i domknij ten wątek jednym naturalnym zdaniem + zasygnalizuj, że raport właśnie wskoczył — NIE ucinaj rozmowy w pół. Dopiero potem przejdź do ustaleń „dla kogo to jest", ŁĄCZĄC DWA ŹRÓDŁA: (1) to, co rozmówca SAM Ci powiedział podczas czekania (idealny klient, klimat/charakter marki, pomysły na nazwę, co go przekonało) — WYKORZYSTAJ to i NIE pytaj o to samo drugi raz; (2) realne wnioski raportu (konkurenci, ceny, luka). Odwołuj się do obu naturalnie.]\n${JSON.stringify(r).slice(0, 2400)}`
        } else if (body.reportGated || !effectiveEmail) {
          // Raport WSTRZYMANY: front trzyma bramkę kontaktu (konto→imię+nazwisko→telefon)
          // i NIE odpalił bud-raport (reportGated), albo kontaktu po prostu brak. Mózg NIE
          // może udawać, że raport się liczy ani pytać o ustalenia — inaczej bramka wygląda
          // na opcjonalną (rozjazd: „zaczynam analizę" przy zagatowanym raporcie).
          sessionContext += `\n\n[RAPORT WSTRZYMANY — KONTAKT NIEPODANY. Raport NIE wystartował i NIE wystartuje, dopóki rozmówca nie zostawi kontaktu (front pokazuje bramkę OBOK: konto → imię i nazwisko → telefon). TWARDE ZAKAZY: NIE mów „zaczynam analizę"/„robię raport"/„raport się liczy"/„raport pojawi się gotowy"/„za ~2 min" — NIC się jeszcze nie liczy; ZERO zmyślonych liczb, konkurencji ani wyników; NIE zadawaj pytań ustaleń („dla kogo", klimat marki, nazwa…) i NIE wystawiaj markera <ustalenia> ani <opcje> do ustaleń — to przyjdzie DOPIERO po kontakcie i po raporcie. ZRÓB: w 1-2 zdaniach ciepło potwierdź wybór produktu i powiedz WPROST, że gdy tylko zostawi kontakt z bramki obok, OD RAZU ruszasz z raportem rynku. Gdy dopytuje o status — spokojnie: „ruszam z raportem, jak tylko zostawisz kontakt". Krótko, bez ponaglania.]`
        } else {
          sessionContext += `\n\n[RAPORT GENERUJE SIĘ W TLE (~2 MIN) — NIE ZOSTAWIAJ CISZY, WYKORZYSTAJ TEN CZAS. ZAANGAŻUJ rozmówcę w lekką, naturalną rozmowę, której odpowiedzi PRZYDADZĄ SIĘ później (do ustaleń „dla kogo", marki, strony sprzedażowej). Zadawaj PO JEDNYM pytaniu na turę i realnie reaguj na odpowiedź — np.: kogo widzi jako idealnego klienta tego produktu; co JEGO samego w nim przekonało / jaki problem rozwiązuje; jaki klimat/charakter marki mu pasuje (premium / energetyczny / ciepły / minimalistyczny…); czy ma już pomysł na nazwę albo skojarzenia. To zwykła, ciepła rozmowa — nie przesłuchanie i nie formularz.
PODPOWIEDZI — OBOWIĄZKOWE PRZY KAŻDYM PYTANIU: pod treścią pytania, w NOWEJ linii, ZAWSZE wstaw marker <opcje>["odp 1","odp 2","odp 3"]</opcje> z 2-4 krótkimi, klikalnymi odpowiedziami DOPASOWANYMI do tego pytania — rozmówca ma móc kliknąć zamiast pisać. Mają realnie pomóc dopracować ustalenia, ale LEKKO: naturalne, ludzkie warianty oddające główne sensowne rozróżnienia, NIE drobiazgowe ani przesadnie precyzyjne. Rekomendację oznacz prefiksem ~. PRZYKŁAD: „kogo najbardziej widzisz z tym produktem?" → <opcje>["~Zwykły Kowalski do domu","Ktoś techniczny, gadżeciarz","Coś pomiędzy"]</opcje>. Pytanie ustaleń BEZ markera <opcje> jest błędem.
TWARDE ZAKAZY (raport JESZCZE się liczy): NIE podawaj ŻADNYCH liczb, konkurencji, cen ani „dla kogo wg danych"; NIE cytuj wniosków „z raportu"; NIE TWIERDŹ, że raport jest „gotowy"/„już powinien być gotowy"/skończony, dopóki nie zobaczysz go w kontekście (dostaniesz wtedy sekcję [RAPORT STRATEGICZNY — GOTOWY]) — po prostu prowadź lekką rozmowę, a gdy raport wskoczy, sam to zauważysz i wtedy go omówisz; nawiasów kwadratowych [ ] NIE używaj JAKO PLACEHOLDERÓW w widocznym tekście (np. [X z raportu]) — to NIE dotyczy markera <opcje>, który JEST wymagany. NIE wystawiaj markera <ustalenia> — FORMALNE ustalenia podsumujesz DOPIERO po gotowym raporcie, opierając je TAKŻE na tym, co teraz zebrałeś od rozmówcy.]`
        }
        // [Audyt kontekstu] MARKA + USTALENIA jako FAKT w ETAP2 — dotąd model ich tu NIE dostawał:
        // mówił „Twój sklep" zamiast nazwy marki i pytał drugi raz „dla kogo to jest".
        {
          const _brand = (existingSession?.brand && typeof existingSession.brand === 'object' && !Array.isArray(existingSession.brand)) ? existingSession.brand as Record<string, unknown> : null
          const _bn = _brand && typeof _brand.chosen_name === 'string' ? _brand.chosen_name : ''
          if (_bn) sessionContext += `\n\n[MARKA — sklep nazywa się „${_bn}". Używaj TEJ nazwy zamiast „Twój sklep".]`
          const _ustE = (existingSession?.ustalenia && typeof existingSession.ustalenia === 'object' && !Array.isArray(existingSession.ustalenia)) ? existingSession.ustalenia as Record<string, unknown> : null
          if (_ustE && Object.keys(_ustE).length) sessionContext += `\n\n[USTALENIA (JUŻ ustalone — NIE pytaj o to ponownie, opieraj odpowiedzi na tym): ${JSON.stringify(_ustE).slice(0, 1000)}]`
        }
        // L5 — strażnik ścieżki: jawny etap środkowy + następna akcja usera (żeby AI nie gubił kierunku ani się nie cofał)
        {
          const _mk = Array.isArray(existingSession?.mockups) && (existingSession?.mockups as unknown[]).length > 0
          const _style = !!existingSession?.chosen_style
          const _ads = Array.isArray(existingSession?.session_ads) && (existingSession?.session_ads as unknown[]).length > 0
          const _ust = !!existingSession?.ustalenia
          let _stage = ''
          if (_style && !_ads) _stage = '[ETAP ŚCIEŻKI: reklamy/sklep w toku — składają się automatycznie po wyborze stylu. Krótko potwierdź; NIE cofaj się do ustaleń/makiet.]'
          else if (_mk && !_style) _stage = '[ETAP ŚCIEŻKI: makiety GOTOWE, czekasz aż rozmówca WYBIERZE styl w zakładce Makiety. Jeśli pyta „co dalej" lub się waha — skieruj go DO WYBORU stylu (kliknij makietę, którą czuje); dalsze etapy ruszają po wyborze. Nic nie generuj sam, nie wracaj do raportu.]'
          else if (_ust && !_mk) _stage = '[ETAP ŚCIEŻKI: ustalenia domknięte; makiety są w drodze (przygotowują się w tle). Krótko i ciepło zapowiedz, że za chwilę pojawią się style sklepu do wyboru w zakładce „Makiety". Nic nie generuj sam — nie deklaruj twardo, że „już gotowe".]'
          if (_stage) sessionContext += `\n\n${_stage}`
        }
        // #10: instrukcja ETAPU USTALENIA tylko gdy raport realnie wystartował/gotowy.
        // Przy reportGated (raport wstrzymany) lub braku maila NIE doklejaj jej — inaczej
        // kłóci się z [RAPORT WSTRZYMANY] (jedno każe „zrób ustalenia", drugie zakazuje).
        if (!body.reportGated && effectiveEmail) sessionContext += `\n\n${GATE_INSTRUCTION}`
      }
      // Bezpieczna detekcja rezygnacji — niezależnie od fazy (badanie i współpraca).
      sessionContext += `\n\n${RESIGNATION_INSTRUCTION}`
      // Sparing: poproś model, by przy werdykcie dołączył źródło pomysłu (idea_source).
      if (!isKnowHowMode) sessionContext += `\n\n${KH.idea_hint}`
    }

    // ── Wywołanie OpenAI /v1/chat/completions (stream) ───────────────────────
    // gpt-5.x: max_completion_tokens (NIE max_tokens), bez temperature.
    // OpenAI cache'uje powtarzalny prefiks promptu automatycznie.
    let openaiResponse: Response
    try {
      openaiResponse = await openaiFetchRetry({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          stream: true,
          // usage w ostatnim chunku streamu — bez tego nie policzymy kosztu tury
          stream_options: { include_usage: true },
          max_completion_tokens: OPENAI_MAX_COMPLETION_TOKENS,
          messages: [
            { role: 'system', content: `${systemPrompt}\n\n${sessionContext}${narrativeWeaveTurn}` },
            ...messages,
          ],
        }),
      }, 'chat-main')
    } catch (err) {
      console.error('[bud-chat] OpenAI fetch wyjątek po retry:', err)
      return jsonResponse({ error: 'blad_ai' }, 502, corsHeaders)
    }

    if (!openaiResponse.ok || !openaiResponse.body) {
      const errorText = await openaiResponse.text().catch(() => '')
      console.error('[bud-chat] OpenAI API error po retry:', openaiResponse.status, errorText)
      return jsonResponse({ error: 'blad_ai' }, 502, corsHeaders)
    }

    // ── Transform SSE: OpenAI delta -> content_block_delta/text_delta ────────
    // Frontend parsuje JEDEN format niezależnie od providera; tekst asystenta
    // akumulujemy w tej samej pętli (bez tee()).
    const encoder = new TextEncoder()
    const upstream = openaiResponse.body.getReader()

    const outStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let assistantText = ''
        let usage: StreamUsage | null = null
        let persisted = false
        const schedulePersist = (verdict: VerdictResult, leadId: string | null, projekt: Record<string, unknown> | null): Promise<void> | null => {
          if (persisted) return null
          persisted = true
          const p = persistAfterStream(supabase, sessionId, assistantText, turnsBefore, verdict, leadId, projekt, mode, usage, !!existingSession?.paid_at, knowhowResume)
          const edgeRuntime = (globalThis as { EdgeRuntime?: { waitUntil?: (pr: Promise<unknown>) => void } }).EdgeRuntime
          if (edgeRuntime && typeof edgeRuntime.waitUntil === 'function') {
            edgeRuntime.waitUntil(p)
            return null
          }
          return p
        }
        try {
          const decoder = new TextDecoder()
          let buf = ''
          while (true) {
            const { done, value } = await upstream.read()
            if (done) break
            buf += decoder.decode(value, { stream: true })
            let idx
            while ((idx = buf.indexOf('\n')) >= 0) {
              const line = buf.slice(0, idx).replace(/\r$/, '')
              buf = buf.slice(idx + 1)
              if (!line.startsWith('data: ')) continue
              const payload = line.slice(6)
              if (payload === '[DONE]') continue
              try {
                const evt = JSON.parse(payload)
                if (evt?.error) {
                  console.error('[bud-chat] OpenAI stream error:', JSON.stringify(evt.error))
                  throw new Error('openai_stream_error')
                }
                if (evt?.usage) usage = evt.usage as StreamUsage // ostatni chunk (include_usage)
                const delta = evt?.choices?.[0]?.delta?.content
                if (typeof delta === 'string' && delta.length) {
                  assistantText += delta
                  controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: delta } })}\n\n`,
                  ))
                }
              } catch (parseErr) {
                if (parseErr instanceof Error && parseErr.message === 'openai_stream_error') throw parseErr
                // niepełna/nie-JSON-owa linia — ignoruj
              }
            }
          }

          // ── USTALENIA (nowy pipeline /sklep) — model domknął „dla kogo to jest" ──
          // Marker <ustalenia>{json}</ustalenia> → zapis do bud_sessions.ustalenia.
          // Front (po wykryciu markera) odpala 4 makiety; bud-mockup czyta te ustalenia.
          {
            const um = assistantText.match(/<ustalenia>([\s\S]*?)<\/ustalenia>/)
            if (um) {
              let raw = um[1].trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
              // Wyłuskaj obiekt {…} przez BALANSOWANIE nawiasów (dopasuj domknięcie do
              // pierwszego '{', z poszanowaniem stringów). Odporne na model dający
              // nadmiarowy '}}' na końcu albo tekst przed/po — lastIndexOf('}') by to psuł.
              const a = raw.indexOf('{')
              if (a !== -1) {
                let depth = 0, end = -1, inStr = false, esc = false
                for (let i = a; i < raw.length; i++) {
                  const ch = raw[i]
                  if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false }
                  else if (ch === '"') inStr = true
                  else if (ch === '{') depth++
                  else if (ch === '}') { depth--; if (depth === 0) { end = i; break } }
                }
                if (end !== -1) raw = raw.slice(a, end + 1)
              }
              let ust: Record<string, unknown> | null = null
              try { const p = JSON.parse(raw); if (p && typeof p === 'object' && !Array.isArray(p)) ust = p } catch { /* fallback niżej */ }
              // FALLBACK: model bywa daje niepoprawny JSON (niezaescape'owany " w wartości,
              // podwójne }}). Ratujemy kluczowe pola regexem, żeby ustalenia nie przepadły
              // (generatory makiet/landingu używają głównie dla_kogo/kat/ton_marki).
              if (!ust) {
                const g = (k: string): string | null => {
                  const m = raw.match(new RegExp('"' + k + '"\\s*:\\s*"([\\s\\S]*?)"\\s*(?:,\\s*"\\w|\\}|\\])'))
                  return m ? m[1].trim() : null
                }
                // Tablica korzyści — best-effort: wyłuskaj stringi z [ ... ] (front oczekuje korzysci).
                const garr = (k: string): string[] | null => {
                  const m = raw.match(new RegExp('"' + k + '"\\s*:\\s*\\[([\\s\\S]*?)\\]'))
                  if (!m) return null
                  const items = (m[1].match(/"((?:[^"\\]|\\.)*)"/g) || []).map((s) => s.slice(1, -1).trim()).filter(Boolean)
                  return items.length ? items : null
                }
                const dk = g('dla_kogo'), kt = g('kat'), tm = g('ton_marki'), nz = g('nazwa')
                const kz = garr('korzysci') || garr('korzyści') || garr('benefits')
                if (dk || kt || tm) ust = { dla_kogo: dk, kat: kt, ton_marki: tm, nazwa: nz, ...(kz ? { korzysci: kz } : {}), _repaired: true }
              }
              if (ust) {
                // Ustalenia pochodzą z ROZMOWY (dla_kogo/kąt/ton/nazwa/korzyści), nie z raportu —
                // zapisuj ZAWSZE. Wcześniej guard wymagał gotowego market_report w `existingSession`
                // (ładowanym na starcie requestu); gdy raport dopiął się równolegle albo brain wystawił
                // <ustalenia> chwilę za wcześnie, ustalenia GINĘŁY na zawsze (NULL) → zakładka „Ustalenia"
                // pokazywała placeholder, a makiety/landing szły z pustymi ustaleniami. Jeśli brain je
                // później dopracuje, po prostu nadpisze. (Prompt i tak każe czekać na raport.)
                await supabase.from('bud_sessions').update({ ustalenia: ust, updated_at: new Date().toISOString() }).eq('id', sessionId)
              } else {
                console.error('[bud-chat] <ustalenia> nieparsowalne, surowe:', raw.slice(0, 300))
              }
            }
          }
          // ── ZIELONE ŚWIATŁO (/sklep) — model wydał pozytywny werdykt <zielone> ──
          // Persist verdict='zielony' → kolejne tury wiedzą, że zielone już padło (gate kolejności
          // <zielone>→rezerwacja w sessionContext) + panel widzi status.
          if (/<zielone[\s/>]/.test(assistantText) && (existingSession?.verdict as string | null) !== 'zielony') {
            try { await supabase.from('bud_sessions').update({ verdict: 'zielony', updated_at: new Date().toISOString() }).eq('id', sessionId) } catch (e) { console.error('[bud-chat] zapis verdict zielony:', e) }
          }

          // ── BRAMKA POTENCJAŁU (GA) ─────────────────────────────────────────
          // Gdy model domknął rdzeń i wystawił <ocena>, odpalamy realny research
          // (bud-assess) i DRUGĄ turą model steruje wg wyniku. Werdykt z bramki.
          let gateOcena: Record<string, unknown> | null = null
          {
            const om = assistantText.match(/<ocena>([\s\S]*?)<\/ocena>/)
            if (om) {
              try {
                const projektDoOceny = JSON.parse(om[1]) as Record<string, unknown>
                controller.enqueue(encoder.encode(`event: spar_ocena\ndata: ${JSON.stringify({ status: 'badam' })}\n\n`))
                gateOcena = await runGate(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, projektDoOceny, sessionId, track, (label) => {
                  try { controller.enqueue(encoder.encode(`event: spar_ocena\ndata: ${JSON.stringify({ status: 'progress', label })}\n\n`)) } catch { /* klient rozłączony */ }
                })
                if (gateOcena) {
                  await supabase.from('bud_sessions')
                    .update({ assessment: { ...gateOcena, at: new Date().toISOString(), awaiting_preview: gateOcena.ocena === 'mocny' }, updated_at: new Date().toISOString() })
                    .eq('id', sessionId)
                  controller.enqueue(encoder.encode(`event: spar_ocena\ndata: ${JSON.stringify({ status: 'gotowe', ocena: gateOcena })}\n\n`))
                  const second = await streamSecondCall(controller, encoder, OPENAI_API_KEY, OPENAI_MODEL, [
                    { role: 'system', content: `${systemPrompt}\n\n${sessionContext}\n\n${buildSteerInstruction(gateOcena)}${narrativeWeaveTurn}` },
                    ...messages,
                    { role: 'assistant', content: assistantText },
                    { role: 'user', content: '[SYSTEM] Wynik badania rynku gotowy — zareaguj zgodnie z instrukcją STEROWANIA.' },
                  ])
                  assistantText += '\n' + second.text
                  if (second.usage) {
                    const u2 = second.usage
                    const inp = u2.prompt_tokens || 0, cch = u2.prompt_tokens_details?.cached_tokens || 0, out = u2.completion_tokens || 0
                    supabase.from('bud_usage').insert({
                      session_id: sessionId, kind: 'chat', model: OPENAI_MODEL,
                      input_tokens: inp, cached_tokens: cch, output_tokens: out,
                      cost_usd: chatCostUsd(OPENAI_MODEL, inp, cch, out), meta: { channel: mode, phase: 'steer' },
                    }).then(({ error }: { error: unknown }) => { if (error) console.error('[bud-chat] steer usage insert error:', error) })
                  }
                }
              } catch (gErr) {
                console.error('[bud-chat] bramka/ocena error:', gErr)
              }
            }
          }

          // ── K1 KIERUNKI (karty pre-walidowane) ─────────────────────────────
          // Model po złapaniu klimatu wystawia <kierunki_zadaj>{kierunki:[{nazwa,opis,fraza}]}.
          // Pre-walidujemy każdy przez bud-products (mode:'kierunki') i pokazujemy TYLKO te z
          // realnymi reklamami w PL (gwarancja „nigdy pusty"). Reklamy → bufor per kierunek
          // (discovery po wyborze nie pali kolejnych kredytów ScrapeCreators). SSE bud_kierunki.
          {
            const km = assistantText.match(/<kierunki_zadaj>([\s\S]*?)<\/kierunki_zadaj>/)
            if (km) {
              try {
                const parsedK = JSON.parse(km[1]) as { kierunki?: Array<{ nazwa?: string; opis?: string; fraza?: string }> }
                const rawK = Array.isArray(parsedK.kierunki) ? parsedK.kierunki : []
                const kier = rawK
                  .map((k) => ({ nazwa: String(k?.nazwa || '').trim(), opis: String(k?.opis || '').trim(), fraza: String(k?.fraza || k?.nazwa || '').trim() }))
                  .filter((k) => k.nazwa && k.fraza).slice(0, 4)
                if (kier.length) {
                  controller.enqueue(encoder.encode(`event: bud_kierunki\ndata: ${JSON.stringify({ status: 'szukam' })}\n\n`))
                  const validated = await runKierunki(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, kier.map((k) => ({ nazwa: k.nazwa, fraza: k.fraza })), sessionId)
                  // dopasuj walidację po nazwie, zachowaj opis z markera; zostaw tylko z pokryciem
                  const okList = kier
                    .map((k) => { const v = validated.find((x) => x.nazwa === k.nazwa); return { nazwa: k.nazwa, opis: k.opis, ok: !!(v && v.ok), ads: (v && v.ads) || [] } })
                    .filter((k) => k.ok)
                  // bufor reklam per kierunek → product_input.kierunki_bufory
                  const { data: piK } = await supabase.from('bud_sessions').select('product_input').eq('id', sessionId).maybeSingle()
                  const prevK = (piK?.product_input && typeof piK.product_input === 'object' && !Array.isArray(piK.product_input)) ? piK.product_input as Record<string, unknown> : {}
                  const bufory: Record<string, unknown> = {}
                  okList.forEach((k) => { bufory[k.nazwa] = k.ads })
                  await supabase.from('bud_sessions').update({ product_input: { ...prevK, kierunki_bufory: bufory }, updated_at: new Date().toISOString() }).eq('id', sessionId)
                  if (okList.length >= 1) {
                    const cards = okList.map((k, i) => ({ nazwa: k.nazwa, opis: k.opis, polecany: i === 0 }))
                    controller.enqueue(encoder.encode(`event: bud_kierunki\ndata: ${JSON.stringify({ status: 'gotowe', kierunki: cards })}\n\n`))
                  } else {
                    // żaden kierunek nie ma pokrycia → front nie pokazuje kart; model w treści
                    // tury proponuje pójście szerzej / inny świat (instrukcja w prompcie).
                    controller.enqueue(encoder.encode(`event: bud_kierunki\ndata: ${JSON.stringify({ status: 'brak' })}\n\n`))
                  }
                }
              } catch (kErr) {
                console.error('[bud-chat] kierunki error:', kErr)
                try { controller.enqueue(encoder.encode(`event: bud_kierunki\ndata: ${JSON.stringify({ status: 'brak' })}\n\n`)) } catch { /* klient rozłączony */ }
              }
            }
          }

          // ── K1 DOBÓR PRODUKTU (propozycje) ─────────────────────────────────
          // Gdy model (K1) wystawi <propozycje_zadaj>{kategoria,budzet,styl,wyklucz},
          // wołamy bud-products (web_search) i streamujemy 5 kart do frontu. Wzór
          // 1:1 jak <ocena>/runGate: enqueue „szukam” → runProducts → zapis stanu →
          // enqueue „gotowe”. „Pokaż inne” = kolejna tura → model znów wystawia
          // marker; page rośnie z iterations, a wyklucz=pokazane_ids → świeże karty.
          {
            const pm = assistantText.match(/<propozycje_zadaj>([\s\S]*?)<\/propozycje_zadaj>/)
            if (pm) {
              try {
                const zadanie = JSON.parse(pm[1]) as { kategoria?: string; budzet?: string; styl?: string; wyklucz?: string[]; nowa_kategoria?: boolean }
                // Stan dotychczasowych propozycji. Czytamy z sesji (źródło prawdy), bo
                // existingSession to snapshot sprzed tury.
                const { data: piSess } = await supabase.from('bud_sessions').select('product_input').eq('id', sessionId).maybeSingle()
                const prev = (piSess?.product_input && typeof piSess.product_input === 'object' && !Array.isArray(piSess.product_input))
                  ? piSess.product_input as Record<string, unknown> : {}
                const prevKat = typeof prev.kategoria === 'string' ? prev.kategoria : ''
                const newKat = typeof zadanie.kategoria === 'string' ? zadanie.kategoria : ''
                // ZMIANA KATEGORII → RESET licznika 3 rund (decyzja Tomka): świeże 15
                // dla nowej kategorii. Jawny sygnał z markera > heurystyka tokenowa.
                const catReset = zadanie.nowa_kategoria === true || categoryChanged(prevKat, newKat)
                const basePokazane = catReset ? [] : (Array.isArray(prev.pokazane_ids) ? (prev.pokazane_ids as unknown[]).map(String) : [])
                const baseIter = catReset ? 0 : (typeof prev.iterations === 'number' ? prev.iterations : 0)

                // ── CAP 3×5: max 3 rundy (15 produktów) na KATEGORIĘ ─────────────────
                // Backstop kosztowy (każda runda = ~$0.36 OpenAI + ~10 calli RapidAPI).
                // Prompt prowadzi model, by po 3. rundzie NIE wystawiał markera, tylko
                // pokazał menu (wróć do najlepszego / zmień kategorię / podaj link Ali).
                // Gdyby mimo to wystawił 4. raz dla TEJ kategorii — odmawiamy generowania.
                if (baseIter >= 3) {
                  console.log('[bud-chat] propozycje CAP: kategoria wyczerpana po', baseIter, 'rundach — odmowa 4. rundy')
                  controller.enqueue(encoder.encode(`event: bud_propozycje\ndata: ${JSON.stringify({ status: 'limit', page: baseIter })}\n\n`))
                  // NIE bumpujemy iterations, NIE wołamy runProducts. Stan bez zmian.
                } else {
                  controller.enqueue(encoder.encode(`event: bud_propozycje\ndata: ${JSON.stringify({ status: 'szukam' })}\n\n`))
                  const page = baseIter
                  // wyklucz = jawnie z markera + dotychczas pokazane (dedup); po resecie pusto.
                  const markerWyklucz = Array.isArray(zadanie.wyklucz) ? zadanie.wyklucz.map(String) : []
                  const wyklucz = Array.from(new Set([...markerWyklucz, ...basePokazane]))
                  const items = await runProducts(
                    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
                    { kategoria: zadanie.kategoria, budzet: zadanie.budzet, styl: zadanie.styl, wyklucz },
                    sessionId, track, page,
                  )
                  if (!items || items.length === 0) {
                    // ZASADA „jakość albo nic": bud-products nie znalazł produktów spełniających
                    // twardy próg (≥50 sprzedaży ∧ ≥92% opinii). NIE pokazujemy słabych. Sygnał 'brak'
                    // → front pokaże komunikat + menu (zmień kategorię / wklej link AliExpress).
                    // NIE bumpujemy iterations — pusta runda nie zużywa limitu 3.
                    controller.enqueue(encoder.encode(`event: bud_propozycje\ndata: ${JSON.stringify({ status: 'brak', kategoria: newKat || prevKat })}\n\n`))
                  } else {
                    const serve5 = items.slice(0, 10) // serwuj do 10 (decyzja Tomka)
                    // Zapis product_input PRZED enqueue (front na event natychmiast renderuje
                    // karty i może odpytać stan — nie może ścigać się z persistem).
                    const newPokazane = [...basePokazane, ...serve5.map((it) => String((it as { nazwa?: unknown }).nazwa ?? '')).filter(Boolean)]
                    const { error: piErr } = await supabase.from('bud_sessions').update({
                      product_input: {
                        kandydaci: items,
                        pokazane_ids: newPokazane,
                        iterations: baseIter + 1,
                        kategoria: newKat || prevKat,
                        wybrany: (prev.wybrany ?? null),
                        wlasny: (prev.wlasny ?? null),
                      },
                      updated_at: new Date().toISOString(),
                    }).eq('id', sessionId)
                    if (piErr) console.error('[bud-chat] product_input zapis error:', piErr)
                    // page+1 = numer właśnie pokazanej rundy (1..3); front pokaże „runda X z 3”.
                    controller.enqueue(encoder.encode(`event: bud_propozycje\ndata: ${JSON.stringify({ status: 'gotowe', items: serve5, page: baseIter + 1, runda: baseIter + 1, max_rund: 3 })}\n\n`))
                  }
                }
              } catch (pErr) {
                console.error('[bud-chat] propozycje error:', pErr)
                // Soft-fail: sygnał 'brak' (nie pusta karuzela), żeby kafelek nie wisiał na „szukam”.
                try { controller.enqueue(encoder.encode(`event: bud_propozycje\ndata: ${JSON.stringify({ status: 'brak' })}\n\n`)) } catch { /* klient rozłączony */ }
              }
            }
          }

          // Stream zakończony — finalizacja. Markery <projekt>/<werdykt> należą do
          // sparingu (badanie pomysłu). W trybie know-how są ZAKAZANE w prompcie, ale
          // gdyby model je halucynował, NIE wolno ich tu przetwarzać: parseProjekt
          // potrafi przez reset:true wyzerować artefakty (raport/economics/gtm/landing)
          // OPŁACONEGO projektu, a zielony werdykt odpaliłby lead/Slack. Twardo gasimy.
          const verdict = isKnowHowMode ? { verdict: null, karta: null, idea_source: null } as VerdictResult : parseVerdict(assistantText)
          // Twarda bramka: zielony przechodzi tylko z oceną „mocny" z badania rynku.
          if (gateOcena && verdict.verdict === 'zielony' && gateOcena.ocena !== 'mocny') {
            console.log('[bud-chat] hard-gate downgrade zielony→zolty (ocena=', gateOcena.ocena, ')')
            verdict.verdict = 'zolty'
          }
          const projektFresh = isKnowHowMode ? null : parseProjekt(assistantText)
          let projekt: Record<string, unknown> | null = null

          if (projektFresh) {
            projekt = mergeBrief(
              (existingSession?.preview_brief as Record<string, unknown> | null) ?? null,
              projektFresh,
            )
            // ZAPIS PRZED eventem spar_projekt: frontend na ten event natychmiast
            // woła bud-image, a ten czyta brief Z BAZY — bez zapisu tutaj
            // generowanie ścigałoby się z persistem i rysowało stary/pusty brief.
            const briefUpdate: Record<string, unknown> = { preview_brief: projekt, updated_at: new Date().toISOString() }
            // Pełny pivot (<projekt> "reset":true): brief budowany OD ZERA, więc
            // pochodne artefakty opisują już NIEISTNIEJĄCY pomysł. Czyścimy analizy
            // (regenerują się leniwie dla nowej wizji przy wejściu w zakładkę) — inaczej
            // panel pokazywałby raport/ekonomię/GTM/stronę starego pomysłu. Makiet nie
            // ruszamy: front i tak je przerysowuje na event spar_projekt.
            if (projektFresh.reset === true) {
              briefUpdate.market_report = null
              briefUpdate.economics = null
              briefUpdate.gtm = null
              briefUpdate.landing_url = null
              briefUpdate.business_plan = null
            }
            const { error: briefErr } = await supabase
              .from('bud_sessions')
              .update(briefUpdate)
              .eq('id', sessionId)
            if (briefErr) console.error('[bud-chat] brief pre-save error:', briefErr)

            // Event niesie zmergowany brief, ale "zmien" zawsze z TEJ tury
            // (stare zmien generowałoby zły podzbiór widoków po stronie frontendu)
            const eventPayload = { ...projekt, zmien: projektFresh.zmien }
            controller.enqueue(
              encoder.encode(`event: spar_projekt\ndata: ${JSON.stringify(eventPayload)}\n\n`),
            )
          }

          // Zielony werdykt -> lead (id musi trafić do spar_meta, więc PRZED eventem).
          // Werdykt pada wiele tur po bramce, więc effectiveEmail praktycznie zawsze
          // istnieje — brak maila logujemy i pomijamy lead zamiast wywracać stream.
          let leadId: string | null = null
          if (verdict.verdict === 'zielony') {
            if (effectiveEmail) {
              leadId = await createLeadForGreenVerdict(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
                email: effectiveEmail,
                name: name || ((existingSession?.name as string | null | undefined) ?? null),
                phone: phone || ((existingSession?.phone as string | null | undefined) ?? null),
                profession: sessionProfession || 'nieznana',
                karta: verdict.karta,
                tracking,
              })
              if (!leadId) {
                // #2: zielony werdykt z mailem, a lead się NIE utworzył = cichy ubytek leada.
                // Zostaw twardy sygnał (log [ALERT] + flaga w sesji do panelu/zapytania).
                console.error('[bud-chat] [ALERT] zielony werdykt NIE utworzył leada — session:', sessionId, 'email:', effectiveEmail)
                const leadErrMsg = `lead-upsert bez lead_id @ ${new Date().toISOString()}`
                supabase.from('bud_sessions')
                  .update({ lead_error: leadErrMsg })
                  .eq('id', sessionId)
                  .is('lead_error', null)  // tylko pierwsze wystąpienie → jeden alert na sesję
                  .select('id')
                  .then(({ data: __claimed, error }: { data: unknown[] | null; error: unknown }) => {
                    if (error) { console.error('[bud-chat] lead_error stamp failed:', error); return }
                    // Alert #sparing TYLKO przy pierwszym oznaczeniu (claim wygrał).
                    if (Array.isArray(__claimed) && __claimed.length) {
                      postSlackSparing('bud_lead_error', {
                        session_id: sessionId, email: effectiveEmail,
                        name: name || ((existingSession?.name as string | null | undefined) ?? null),
                        phone: phone || ((existingSession?.phone as string | null | undefined) ?? null),
                        error: leadErrMsg,
                      }).catch((e) => console.error('[bud-chat] lead_error slack:', e))
                    }
                  })
              }
            } else {
              console.error('[bud-chat] zielony werdykt bez maila w sesji:', sessionId)
            }
          }

          // Własny event SSE doklejony po streamie Anthropic.
          // emailKnown: sesja ma już maila po stronie serwera — frontend przy
          // powrocie z linku ?id= nie zna go lokalnie i bez tej flagi pokazywałby
          // bramkę o imię/mail DRUGI raz.
          const meta = { verdict: verdict.verdict, leadId, emailKnown: !!effectiveEmail }
          controller.enqueue(
            encoder.encode(`event: spar_meta\ndata: ${JSON.stringify(meta)}\n\n`),
          )

          // Zapis do bazy PO zakończeniu streamu — waitUntil z fallbackiem
          const persistPromise = schedulePersist(verdict, leadId, projekt)
          if (persistPromise) await persistPromise

          // Tryb know-how: cicha ekstrakcja wiedzy z tej wymiany → Baza wiedzy (w tle).
          // Zaczepka (knowhowResume) nie niesie treści usera → nie ma czego ekstrahować.
          if (isKnowHowMode && !knowhowResume && assistantText.trim()) {
            const khLead = ((existingSession?.lead_id as string | null | undefined) ?? leadId) ?? null
            const khPromise = extractKnowhowAsync(supabase, sessionId, khLead, ideaSource, message, assistantText, (existingSession?.problem_summary as Record<string, unknown> | null) ?? null, OPENAI_API_KEY)
            const erKh = (globalThis as { EdgeRuntime?: { waitUntil?: (pr: Promise<unknown>) => void } }).EdgeRuntime
            if (erKh && typeof erKh.waitUntil === 'function') erKh.waitUntil(khPromise)
            else khPromise.catch((e) => console.error('[bud-chat] knowhow extract bg error:', e))
          }

          // Zielony werdykt → powiadom #sparing (raz na sesję, dedup w helperze).
          // Brief z TEJ tury (lub zapisany w sesji) daje nazwę/opis do podsumowania.
          if (verdict.verdict === 'zielony') {
            await maybeNotifyGreenSlack(supabase, sessionId, {
              email: effectiveEmail,
              name: name || ((existingSession?.name as string | null | undefined) ?? null),
              phone: phone || ((existingSession?.phone as string | null | undefined) ?? null),
              profession: sessionProfession || 'nieznana',
              karta: verdict.karta,
              brief: projekt ?? ((existingSession?.preview_brief as Record<string, unknown> | null) ?? null),
            })
          }
        } catch (err) {
          console.error('[bud-chat] stream passthrough error:', err)
          // Klient mógł przerwać stream (zamknięta karta) — zapisz to, co już
          // wygenerowano, żeby historia rozmowy nie gubiła odpowiedzi asystenta.
          try {
            // Także na ścieżce abort: w know-how nie tykamy markerów (patrz finalizacja).
            const freshAbort = isKnowHowMode ? null : parseProjekt(assistantText)
            const persistPromise = schedulePersist(
              isKnowHowMode ? { verdict: null, karta: null } : parseVerdict(assistantText),
              null,
              freshAbort
                ? mergeBrief((existingSession?.preview_brief as Record<string, unknown> | null) ?? null, freshAbort)
                : null,
            )
            if (persistPromise) await persistPromise
          } catch (persistErr) {
            console.error('[bud-chat] persist after abort error:', persistErr)
          }
          try {
            controller.enqueue(
              encoder.encode(`event: spar_meta\ndata: ${JSON.stringify({ verdict: null, leadId: null, emailKnown: !!effectiveEmail })}\n\n`),
            )
          } catch {
            // klient mógł się rozłączyć — ignoruj
          }
        } finally {
          try {
            controller.close()
          } catch {
            // już zamknięty
          }
        }
      },
      cancel(reason) {
        console.log('[bud-chat] klient przerwał stream:', reason)
      },
    })

    return new Response(outStream, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[bud-chat] ERROR:', error)
    return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
  }
})
