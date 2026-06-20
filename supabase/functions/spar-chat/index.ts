// spar-chat — sparing AI dla lejka "Stworzę" (tomekniedzwiecki.pl/aplikacja)
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy spar-chat --no-verify-jwt
// lub zbiorczo: npm run deploy:functions (upewnij się, że skrypt ma --no-verify-jwt)
//
// Sekrety (Supabase Dashboard > Edge Functions > Secrets):
//   OPENAI_API_KEY               — klucz OpenAI (już ustawiony)
//   SPAR_OPENAI_MODEL            — opcjonalny override modelu (default gpt-5.1)
//   SUPABASE_URL                 — wbudowany
//   SUPABASE_SERVICE_ROLE_KEY    — wbudowany
//
// System prompt: tabela settings, key='stworze_sparing_prompt' (cache w module 5 min).
// Streaming: OpenAI /v1/chat/completions (stream) NORMALIZOWANY server-side do
// formatu content_block_delta/text_delta + własny event "spar_meta" na końcu —
// frontend ma jeden kontrakt SSE niezależnie od providera (łatwa podmiana GPT/Claude).
//
// TRYB: 'sparing' — lejek definiowania projektu (tomekniedzwiecki.pl/aplikacja/sparing/).
//   Po zielonym werdykcie ten sam czat przechodzi w fazę współpracy (sekcja
//   PRZEŁAMYWANIE OBIEKCJI w prompcie + COLLAB_PHASE_INSTRUCTION). Dawny osobny
//   tryb 'wspolpraca' (stary model 20%/30k, niepodłączony) USUNIĘTY 2026-06-16.

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
const MAX_MESSAGES_PER_HOUR = 60      // wiadomości/h per sesja (COUNT spar_messages)
const MAX_SESSIONS_PER_HOUR_PER_IP = 10 // nowych sesji/h per IP (anty-abuse: mnożenie sessionId)
const MAX_SESSIONS_PER_DAY_PER_USER = parseInt(Deno.env.get('SPAR_SESSIONS_USER_DAILY') || '10', 10) // nowych sesji/dobę per konto
const MAX_TURNS_BEZ_KONTAKTU = 5      // tur asystenta zanim wymagamy konta/maila (bramka inline w czacie)
const MAX_TURNS_HARD_GATE = 7        // #10: twardy backstop — kontakt wymuszany najpóźniej po tylu turach,
                                     // nawet bez podglądu (normalnie pytamy DOPIERO po pierwszym <projekt>)
// SPAR_REQUIRE_ACCOUNT=true → bramkę przechodzi TYLKO zweryfikowane konto (JWT);
// false (default, okres przejściowy) → wystarczy e-mail w sesji jak dotąd
const REQUIRE_ACCOUNT = (Deno.env.get('SPAR_REQUIRE_ACCOUNT') || 'false') === 'true'
const OPENAI_MODEL = Deno.env.get('SPAR_OPENAI_MODEL') || 'gpt-5.1'
// 3000: odpowiedź z markerem <projekt> (pełny brief z 4 widokami) potrafi
// przekroczyć 1500 — ucięty </projekt> = parseProjekt zwraca null i brief
// NIE trafia do bazy (podgląd się nie generuje mimo zapowiedzi w tekście)
const OPENAI_MAX_COMPLETION_TOKENS = 3000

// ── Cache system promptów (mapa per klucz settings, 5 min) ───────────────────
const PROMPT_CACHE_TTL_MS = 5 * 60 * 1000
const promptCache = new Map<string, { value: string; fetchedAt: number }>()

const PROMPT_KEYS: Record<string, string> = {
  sparing: 'stworze_sparing_prompt',
}

interface SparChatRequest {
  sessionId: string
  profession: string
  problemHint?: string | null
  email: string
  name?: string | null
  phone?: string | null
  message: string
  tracking?: Record<string, unknown> | null
  mode?: string
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
    console.error('[spar-chat] auth getUser error:', err)
    return null
  }
}

// ── Cloudflare Turnstile (anty-bot na nowe sesje anonimowe) ──────────────────
// Fail-open przy awarii weryfikatora (bot protection to warstwa, nie ściana —
// padnięty Cloudflare nie może blokować całego lejka).
async function verifyTurnstile(token: string | null | undefined, ip: string | null): Promise<boolean> {
  // Przełącznik operacyjny (TYLKO na czas testów E2E): SPAR_TURNSTILE_OFF=true
  // wyłącza weryfikację anty-bota dla wszystkich. Pamiętaj wrócić na false.
  if ((Deno.env.get('SPAR_TURNSTILE_OFF') || '') === 'true') return true
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
    if (!data?.success) console.warn('[spar-chat] turnstile odrzucony:', JSON.stringify(data?.['error-codes'] || []))
    return !!data?.success
  } catch (err) {
    console.error('[spar-chat] turnstile verify error (fail-open):', err)
    return true
  }
}

// ── Cennik USD per 1M tokenów (logowanie kosztów do spar_usage) ──────────────
const CHAT_PRICES: Record<string, { input: number; cached: number; output: number }> = {
  'gpt-5.5': { input: 5, cached: 0.5, output: 30 },
  'gpt-5.1': { input: 1.25, cached: 0.125, output: 10 },
  'gpt-4o': { input: 2.5, cached: 1.25, output: 10 },
  'gpt-4o-mini': { input: 0.15, cached: 0.075, output: 0.6 },
}
function chatCostUsd(model: string, input: number, cached: number, output: number): number {
  let p = CHAT_PRICES[model]
  if (!p) {
    console.warn(`[spar-chat] nieznany model w cenniku: ${model} — liczę po stawkach gpt-5.5 (dopisz do CHAT_PRICES!)`)
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
    console.error('[spar-chat] settings fetch error:', error)
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
    console.error('[spar-chat] nieznany kolor werdyktu:', kolor)
  } catch (err) {
    console.error('[spar-chat] błąd parsowania markera werdyktu:', err)
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
      console.error('[spar-chat] marker <projekt> NIEDOMKNIĘTY — odpowiedź ucięta? len:', fullText.length)
    }
    return null
  }
  try {
    const parsed = JSON.parse(matches[matches.length - 1][1])
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch (err) {
    console.error('[spar-chat] błąd parsowania markera projekt:', err, '| inner:', matches[matches.length - 1][1].slice(0, 300))
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
  const lines: string[] = ['Sparing /aplikacja — werdykt: ZIELONY']
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
        // FIX 2026-06-13: wcześniej szło jako `source` (pole nieczytane przez
        // lead-upsert) — leady ze Stworzę lądowały jako lead_source='website'
        lead_source: 'stworze',
        notes: buildLeadNotes(payload.profession, payload.karta),
        tracking: payload.tracking,
      }),
    })
    if (!res.ok) {
      console.error('[spar-chat] lead-upsert HTTP error:', res.status, await res.text())
      return null
    }
    const data = await res.json()
    if (!data?.success || !data?.lead_id) {
      console.error('[spar-chat] lead-upsert bez lead_id:', JSON.stringify(data))
      return null
    }
    return data.lead_id as string
  } catch (err) {
    console.error('[spar-chat] lead-upsert exception:', err)
    return null
  }
}

// ── Powiadomienia Slack #sparing ─────────────────────────────────────────────
// Wysyłka przez edge function slack-notify (centralne formatowanie + sekret
// webhooka). Fire-and-forget z perspektywy logiki — błąd Slacka NIGDY nie może
// wywrócić rozmowy, więc tylko logujemy.
async function postSlackSparing(
  type: 'spar_contact' | 'spar_green',
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) { console.error('[spar-chat] slack-notify: brak SUPABASE_URL/KEY'); return }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[spar-chat] slack-notify ${type} HTTP`, res.status, await res.text())
  } catch (err) {
    console.error(`[spar-chat] slack-notify ${type} exception:`, err)
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
      .from('spar_sessions')
      .update({ slack_contact_notified_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('slack_contact_notified_at', null)
      .not('email', 'is', null)
      .not('phone', 'is', null)
      .eq('is_test', false)
      .select('id, email, name, phone, profession, problem_summary, preview_brief')
    if (error) { console.error('[spar-chat] contact slack claim error:', error); return }
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
    console.error('[spar-chat] maybeNotifyContactSlack exception:', err)
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
      .from('spar_sessions')
      .update({ slack_green_notified_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('slack_green_notified_at', null)
      .eq('is_test', false)
      .select('id')
    if (error) { console.error('[spar-chat] green slack claim error:', error); return }
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
    console.error('[spar-chat] maybeNotifyGreenSlack exception:', err)
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
        .from('spar_messages')
        .insert({ session_id: sessionId, role: 'assistant', content: assistantText, channel })
      if (msgError) console.error('[spar-chat] insert assistant message error:', msgError)
    }

    // Koszt tej tury (stream_options.include_usage) → spar_usage (panel TN Aplikacje)
    if (usage) {
      const input = usage.prompt_tokens || 0
      const cached = usage.prompt_tokens_details?.cached_tokens || 0
      const output = usage.completion_tokens || 0
      const { error: usageErr } = await supabase.from('spar_usage').insert({
        session_id: sessionId,
        kind: 'chat',
        model: OPENAI_MODEL,
        input_tokens: input,
        cached_tokens: cached,
        output_tokens: output,
        cost_usd: chatCostUsd(OPENAI_MODEL, input, cached, output),
        meta: { channel },
      })
      if (usageErr) console.error('[spar-chat] usage insert error:', usageErr)
    } else if (assistantText.trim()) {
      // Stream przerwany przez klienta — chunk z usage nie dotarł. Logujemy
      // SZACOWANY koszt outputu (≈4 znaki/token; input nieznany → pomijamy),
      // z flagą estimated — lepsze niż cicha dziura w kosztach
      const estOut = Math.round(assistantText.length / 4)
      const { error: abortUsageErr } = await supabase.from('spar_usage').insert({
        session_id: sessionId,
        kind: 'chat',
        model: OPENAI_MODEL,
        input_tokens: 0,
        cached_tokens: 0,
        output_tokens: estOut,
        cost_usd: chatCostUsd(OPENAI_MODEL, 0, 0, estOut),
        meta: { channel, aborted: true, estimated: true },
      })
      if (abortUsageErr) console.error('[spar-chat] aborted usage insert error:', abortUsageErr)
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
      .from('spar_sessions')
      .update(update)
      .eq('id', sessionId)
    if (sessError) console.error('[spar-chat] update session error:', sessError)
  } catch (err) {
    console.error('[spar-chat] persistAfterStream exception:', err)
  }
}

// ── KNOW-HOW: cicha ekstrakcja wiedzy z ostatniej wymiany (tryb dopracowania) ──
// Wołane w tle (waitUntil) PO odpowiedzi, tylko w trybie know-how. Drugi, krótki
// call modelu wyciąga konkrety z ostatniej tury i zapisuje do spar_knowhow_items.
// Brak markerów w treści czatu → front nietknięty; błąd = zero wpływu na rozmowę.
// Trwały ślad błędu ścieżki know-how (ekstrakcja/handoff) — żeby cicha awaria nie
// zostawiała Tomka z pustą Bazą wiedzy bez sygnału. Wzór jak spar_sessions.lead_error.
async function stampKnowhowError(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  leadId: string | null,
  field: 'extract_error' | 'handoff_error',
  msg: string,
): Promise<void> {
  try {
    const patch: Record<string, unknown> = { session_id: sessionId, lead_id: leadId }
    patch[field] = msg.slice(0, 300)
    patch[field === 'extract_error' ? 'extract_error_at' : 'handoff_error_at'] = new Date().toISOString()
    await supabase.from('spar_knowhow_summary').upsert(patch, { onConflict: 'session_id' })
  } catch (e) { console.error('[spar-chat] stampKnowhowError', field, e) }
}

async function refreshKnowhowSummary(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  leadId: string | null,
  ideaSource: string,
): Promise<void> {
  try {
    const { data } = await supabase.from('spar_knowhow_items').select('kind').eq('session_id', sessionId)
    const rows = (data || []) as Array<{ kind: string }>
    // UWAGA: NIE ustawiamy tu `status`. Tła ekstrakcja leci też „po fakcie" (po
    // knowhow_closed_at — isKnowHowMode = full_paid_at zostaje true), a sztywne
    // status:'active' cofało 'closed' z knowhow_close → sprzeczny wiersz. Status
    // jest własnością wyłącznie knowhow_close / tpay-webhook (start='active').
    await supabase.from('spar_knowhow_summary').upsert({
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
    console.error('[spar-chat] refreshKnowhowSummary error:', e)
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
    if (!res.ok) { console.error('[spar-chat] knowhow-extract http', res.status); await stampKnowhowError(supabase, sessionId, leadId, 'extract_error', `OpenAI HTTP ${res.status}`); return }
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
      const { error } = await supabase.from('spar_knowhow_items').insert(rows)
      if (error) { console.error('[spar-chat] knowhow insert error:', error); await stampKnowhowError(supabase, sessionId, leadId, 'extract_error', `insert: ${error.message || '?'}`); return }
    }
    await refreshKnowhowSummary(supabase, sessionId, leadId, ideaSource)
  } catch (e) {
    console.error('[spar-chat] extractKnowhowAsync error:', e)
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
    const { data: sess } = await supabase.from('spar_sessions').select('problem_summary, preview_brief, lead_id, idea_source').eq('id', sessionId).maybeSingle()
    const { data: itemsRaw } = await supabase.from('spar_knowhow_items').select('kind, scope, source_tag, content, url').eq('session_id', sessionId).order('created_at', { ascending: true })
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
    if (!res.ok) { console.error('[spar-chat] handoff http', res.status); await stampKnowhowError(supabase, sessionId, hpLead, 'handoff_error', `OpenAI HTTP ${res.status}`); return }
    const data = await res.json().catch(() => null) as { choices?: Array<{ message?: { content?: string } }> } | null
    const text = data?.choices?.[0]?.message?.content || ''
    if (text.trim()) {
      await supabase.from('spar_knowhow_summary').upsert({
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
    console.error('[spar-chat] generateHandoffPack error:', e)
    await stampKnowhowError(supabase, sessionId, null, 'handoff_error', String(e))
  }
}

// ── BRAMKA POTENCJAŁU (GA) ───────────────────────────────────────────────────
// Instrukcja wstrzykiwana do sessionContext (kanał sparing): model po domknięciu
// rdzenia wystawia <ocena> zamiast samodzielnego werdyktu/podglądu, a backend
// odpala spar-assess i steruje drugą turą. Trzymana w kodzie (nie w 31k promptcie
// settings) — to mechanika bramki, nie głos; łatwa do tuningu/rewersji.
const GATE_INSTRUCTION = `[OCENA POTENCJAŁU — KROK OBOWIĄZKOWY PRZED PODGLĄDEM]
Gdy rdzeń narzędzia jest z grubsza zdefiniowany (wiesz: co robi, dla kogo, kto płaci, 1–2 ekrany), NIE oceniaj sam, czy to dobry biznes, i NIE pokazuj jeszcze podglądu. Zamiast tego napisz JEDNO naturalne zdanie do rozmówcy w stylu „Daj mi chwilę — sprawdzę na żywo Twój rynek i konkurencję", a potem wystaw marker w osobnej linii:
<ocena>{"nazwa":"…","opis":"…","problem":"…","dla_kogo":"…","kto_placi":"…","dzisiejsze_obejscie":"…","ekrany":["…","…"],"konkurencja":"…"}</ocena>
i ZAKOŃCZ turę (nic po markerze). Wynik badania dostaniesz w następnej turze i wtedy poprowadzisz dalej — potwierdzasz kierunek i pokazujesz podgląd albo prowadzisz do mocniejszej wersji. Oceniaj, gdy masz materiał; powtórz, jeśli pomysł istotnie się zmienił.`

// WYBÓR KIERUNKU — karty rozwidlenia (marker <kierunki>). Wstrzykiwane tylko
// gdy SPAR_KIERUNKI_ENABLED=1 (bezpiecznik: front renderuje <kierunki> dopiero
// po deployu redesignu; przed flipem flagi model nie zna markera → zero wycieków).
const KIERUNKI_ENABLED = (Deno.env.get('SPAR_KIERUNKI_ENABLED') || '') === '1'
const KIERUNKI_INSTRUCTION = `[WYBÓR KIERUNKU — KARTY ROZWIDLENIA (opcjonalne, NAJWYŻEJ RAZ)]
Jeśli rozmówca podał SZEROKI lub niejednoznaczny obszar (np. branża/grupa bez sprecyzowanego rdzenia) i widzisz 2–3 RÓŻNE, sensowne kierunki narzędzia — zamiast wybierać jeden ZA niego, pokaż mu rozwidlenie. Napisz JEDNO krótkie, naturalne zdanie, w którym WSKAZUJESZ, na co wstępnie byś postawił, dodajesz, że sprawdzisz to na żywo, i zostawiasz wybór rozmówcy (np. „Wstępnie stawiałbym na odzysk odwołań — najbliżej pieniędzy — ale to Ty wybierasz; sprawdzę potem każdy wariant na żywo."). Potem w osobnej linii wystaw marker:
<kierunki>[{"nazwa":"krótka nazwa kierunku","opis":"jedno zdanie: co to narzędzie robi","tag":"3–4 słowa: czemu ciekawe","dalej":"1–2 zdania: co konkretnie zrobimy, jeśli wybierze ten kierunek","polecany":true}]</kierunki>
i ZAKOŃCZ turę (nic po markerze). ZASADY: DOKŁADNIE jedna pozycja ma "polecany":true (Twoja rekomendacja — najbliżej pieniędzy / najszybciej do pierwszego płacącego); każdy kierunek wyraźnie INNY (nie warianty tego samego). NIE łącz z <opcje> w tej samej turze.
ILE POZYCJI: tylko tyle, ile jest NAPRAWDĘ różnych i sensownych — 2 w zupełności wystarczą, NIE dopychaj do 3 na siłę słabą alternatywą. Jeśli jeden kierunek wyraźnie dominuje — NIE pokazuj kart, po prostu poprowadź ten jeden.
SZCZEROŚĆ: "polecany" i tag to Twoja WSTĘPNA intuicja przed badaniem — nie obiecuj pewności; realnie zweryfikujesz to dopiero bramką <ocena>.
KIEDY NIE UŻYWAĆ: gdy rozmówca ma już ostry, konkretny pomysł; gdy dopracowujecie JUŻ wybrany kierunek; gdy nie ma 2 naprawdę różnych dróg. Najwyżej RAZ w rozmowie — to wybór strategicznej drogi, nie nawyk.
PO WYBORZE: rozmówca odpisze „Wybieram kierunek: …". Potwierdź krótko ten wybór i prowadź dopracowanie TEGO kierunku ku rdzeniowi (potem normalnie bramka <ocena>).`

// Wstrzykiwane w turze PO „zielonym" badaniu, gdy rozmówca zareagował na
// zaproponowane wyostrzenie — wtedy (i dopiero wtedy) pokazujemy podgląd.
const PREVIEW_AFTER_GATE_INSTRUCTION = `[PODGLĄD PO DOPRACOWANIU KIERUNKU]
Po badaniu rynku rozmówca właśnie zareagował na zaproponowane wyostrzenie narzędzia. Jeśli akceptuje lub doprecyzował kierunek — POKAŻ teraz, jak to może wyglądać: wystaw marker <projekt>{…} wg ustaleń (uwzględnij wyostrzenie z badania; rdzeń + maks. 1–2 funkcje wspierające, NIGDY kombajn). Zielony <werdykt> wystaw jak zwykle, po podglądzie/akceptacji. Jeśli rozmówca chce ZUPEŁNIE innego kierunku — krótko dopytaj, zamiast wymuszać podgląd. NIE wystawiaj już markera <ocena>.`

// Wstrzykiwane PO zielonym werdykcie (mode sparing) — ZAMIAST bramki oceny.
// Trzyma agenta w fazie współpracy (rezerwacja + przełamywanie obiekcji), zamiast
// ciągnąć go z powrotem do badania pomysłu. Mechanika w kodzie (nie w 41k prompcie)
// — łatwa do tuningu/rewersji. Treść retoryki (bank obiekcji) jest w prompcie.
const COLLAB_PHASE_INSTRUCTION = `[FAZA WSPÓŁPRACY — PO ZIELONYM WERDYKCIE]
Projekt jest już zdefiniowany (werdykt zielony) — karta i ekrany są w panelu obok. NIE wracaj do badania pomysłu i NIE wystawiaj już markera <ocena>; głównym tematem jest teraz WSPÓŁPRACA, a następny krok to rezerwacja wspólnej rozmowy. Trzymaj się sekcji „OFERTA I WSPÓŁPRACA" oraz „PRZEŁAMYWANIE OBIEKCJI": gdy wyczuwasz wahanie lub obawę, rozwiewaj ją jak doradca, nie sprzedawca — zwięźle (2–4 zdania, jeden wątek). Jeśli rozmówca naprawdę chce zmienić pomysł, możesz odesłać do dokończenia rozmowy definiującej; domyślnie jednak rozmawiacie o tym, jak zbudować to razem.`

// REZYGNACJA — bezpieczne, DWUSTOPNIOWE oznaczenie „zrezygnował". Model NIE
// oznacza od razu: najpierw upewnia się co do intencji, marker <rezygnacja/>
// wystawia DOPIERO po wyraźnym potwierdzeniu w kolejnej turze. Backend mapuje
// marker na etap lejka „przegrany: zrezygnował" + wstrzymuje automat maili/SMS.
// Mechanika w kodzie (nie w prompcie settings) — łatwa do tuningu/rewersji.
const RESIGNATION_INSTRUCTION = `[REZYGNACJA — OZNACZ TYLKO PRZY JEDNOZNACZNEJ, WYRAŹNEJ INTENCJI]
„Rezygnacja" = rozmówca WPROST chce zakończyć temat: rezygnuje z pomysłu albo ze współpracy, nie chce dalej. To NIE jest rezygnacja, gdy: odrzuca konkretną funkcję, kierunek albo cenę; waha się; „musi to przemyśleć"; narzeka; pyta dalej; chce węższego/innego narzędzia. W takich razach normalnie pomagaj lub dopytuj i NIE oznaczaj.
• Sygnał MIĘKKI lub niejasny (zniechęcenie, cena, „nie wiem", „muszę pomyśleć") — NIE oznaczaj. Najpierw zareaguj po ludzku JEDNYM zdaniem, które rozbraja obawę i zostawia otwarte drzwi; marker wystaw dopiero, jeśli w odpowiedzi rozmówca POTWIERDZI wprost, że kończy.
• Rezygnacja WPROST i jednoznaczna (np. „rezygnuję", „dziękuję, to nie dla mnie", „nie jestem zainteresowany", „odpuszczam to") — NIE przepytuj po raz drugi: pożegnaj się ciepło JEDNYM zdaniem (zostaw otwarte drzwi na powrót), a w OSOBNEJ, OSTATNIEJ linii wystaw marker <rezygnacja/> — nic po nim.
W razie realnej wątpliwości NIE oznaczaj.`

// ── TRYB „DOPRACOWANIE WIZJI" (KNOW-HOW) — po pełnej płatności ────────────────
// Włączany WYŁĄCZNIE serwerowo, gdy spar_sessions.full_paid_at IS NOT NULL i
// knowhow_closed_at IS NULL. Dla każdej innej sesji ta gałąź nie istnieje —
// sparing pozostaje niezmieniony. Zbieranie wiedzy do spar_knowhow_* odbywa się
// CICHO w tle (extractKnowhowAsync), bez markerów w treści czatu.
// ── Prompty SPOWIEDNIKA (know-how) — JEDYNE źródło = settings (klucze aplikacja_knowhow_*).
// Ładowane raz na cold-start (ensureKnowhowPrompts); pusty fallback to bezpiecznik, nie treść.
// Edycja z panelu „Źródło prawdy". (Faza 1 single-source 2026-06-20.)
let KH_LOADED = false
const KH = { base: '', src_wlasny: '', src_ai: '', src_wspolny: '', resume: '', extract: '', handoff: '', idea_hint: '' }
async function ensureKnowhowPrompts(supabase: ReturnType<typeof createClient>): Promise<void> {
  if (KH_LOADED) return
  try {
    const { data } = await supabase.from('settings').select('key, value').in('key', [
      'aplikacja_knowhow_base', 'aplikacja_knowhow_src_wlasny', 'aplikacja_knowhow_src_ai', 'aplikacja_knowhow_src_wspolny',
      'aplikacja_knowhow_resume', 'aplikacja_knowhow_extract', 'aplikacja_knowhow_handoff', 'aplikacja_knowhow_idea_source_hint',
    ])
    const v = (k: string) => ((data || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''
    KH.base = v('aplikacja_knowhow_base'); KH.src_wlasny = v('aplikacja_knowhow_src_wlasny'); KH.src_ai = v('aplikacja_knowhow_src_ai')
    KH.src_wspolny = v('aplikacja_knowhow_src_wspolny'); KH.resume = v('aplikacja_knowhow_resume'); KH.extract = v('aplikacja_knowhow_extract')
    KH.handoff = v('aplikacja_knowhow_handoff'); KH.idea_hint = v('aplikacja_knowhow_idea_source_hint')
    KH_LOADED = true
  } catch (e) { console.error('[spar-chat] ensureKnowhowPrompts', e) }
}
function knowhowInstruction(ideaSource: string): string {
  const src = ideaSource === 'ai' ? KH.src_ai : ideaSource === 'wspolny' ? KH.src_wspolny : KH.src_wlasny
  return `${KH.base}\n${src}`

}

// Wywołanie bramki spar-assess (server-to-server). Zwraca obiekt oceny lub null.
async function runGate(
  supabaseUrl: string,
  serviceKey: string,
  projekt: Record<string, unknown>,
  sessionId: string,
  onProgress?: (label: string) => void,
): Promise<Record<string, unknown> | null> {
  const url = `${supabaseUrl}/functions/v1/spar-assess`
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` }
  // Próba STREAMOWANA — realny postęp przez onProgress (etykiety wg wyszukań).
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ projekt, sessionId, stream: true }) })
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
      console.error('[spar-chat] spar-assess stream: brak werdyktu → fallback buforowany')
    } else {
      console.error('[spar-chat] spar-assess stream HTTP:', res.status)
    }
  } catch (err) {
    console.error('[spar-chat] runGate stream exception → fallback:', err)
  }
  // FALLBACK: buforowany strzał (pewny werdykt, bez postępu). Gwarantuje, że
  // bramka nie pada przez kruchość streamu — niezawodność zachowana.
  try {
    const res2 = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ projekt, sessionId }) })
    if (!res2.ok) { console.error('[spar-chat] spar-assess fallback HTTP:', res2.status); return null }
    const data = await res2.json()
    return (data && typeof data.ocena === 'object') ? data.ocena as Record<string, unknown> : null
  } catch (err) {
    console.error('[spar-chat] runGate fallback exception:', err)
    return null
  }
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
TO ZIELONY KIERUNEK. Po wnioskach zaproponuj KONKRETNE wyostrzenie aplikacji wynikające z luki: „Dlatego proponuję, żeby narzędzie …" — co podkreślić / dodać / odjąć, by trafić dokładnie w tę lukę (rdzeń + maks. 1–2 funkcje wspierające, NIGDY kombajn).
NIE wystawiaj jeszcze <projekt> ani <werdykt> — najpierw chcemy JEDNĄ rundę dopracowania kierunku z rozmówcą (podgląd ekranów pokażesz w następnej turze). Zakończ podpowiedziami: marker <opcje>["Tak, w tę stronę","Wolę inny akcent","Pokaż, jak to wygląda"] — tak, by rozmówca miał realny wpływ na wyostrzenie.`
  }
  return `${wspolne}
TO JESZCZE NIE JEST ZIELONE — NIE wystawiaj podglądu <projekt> ani zielonego <werdykt>. Po wnioskach przekaż „${kierunek}" jako MOCNĄ, pewną rekomendację (nie jako porażkę — jako „mam dla Ciebie lepszą wersję, bo dane pokazują…"), wprost wyprowadzoną z tych danych.
ZAWSZE zakończ podpowiedziami: marker <opcje>["…","…","…"] z 2–4 krótkimi, klikalnymi odpowiedziami, które popychają DOKŁADNIE w stronę tego kierunku (zgoda na pivot, doprecyzowanie grupy/bólu, „drąż dalej"). Podpowiedzi mają brzmieć jak słowa rozmówcy, nie jak instrukcje.`
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
        console.warn(`[spar-chat] ${label} retry ${i + 1} po ${last}`)
        continue
      }
      return res // nieretryowalny albo ostatnia próba — oddaj, caller obsłuży !ok
    } catch (err) {
      last = String(err)
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)))
        console.warn(`[spar-chat] ${label} retry ${i + 1} po wyjątku ${last}`)
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
      console.error('[spar-chat] second call HTTP error po retry:', resp.status)
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
    console.error('[spar-chat] streamSecondCall exception:', err)
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
      console.error('[spar-chat] OPENAI_API_KEY nie skonfigurowany')
      return jsonResponse({ error: 'brak_konfiguracji_ai' }, 500, corsHeaders)
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[spar-chat] brak konfiguracji Supabase')
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, corsHeaders)
    }

    // ── Walidacja inputu ─────────────────────────────────────────────────────
    let body: SparChatRequest
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
    // body.authUserId / body.authProvider: DEPRECATED, ignorowane (patrz verifyAuthUser)

    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, corsHeaders)
    }

    // ── Beacon „wyszedł z ekranu generowania" — bez message, wczesny return ──
    //   Wołany z pagehide/visibilitychange, gdy user opuszcza kartę będąc na
    //   ekranie badania rynku lub generowania ekranów. Stempluje left_screen_at,
    //   z czego spar-followups robi precyzyjny SMS powrotu (a nie z heurystyki).
    if (body.event === 'leave_screen') {
      const screen = (body.screen === 'ekrany' || body.screen === 'badanie') ? body.screen : null
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      await sb.from('spar_sessions').update({ left_screen_at: new Date().toISOString(), left_screen: screen, updated_at: new Date().toISOString() }).eq('id', sessionId)
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
        .from('spar_sessions')
        .select('id, email, name, phone, auth_user_id')
        .eq('id', sessionId)
        .maybeSingle()
      if (!sess) return jsonResponse({ ok: false }, 200, corsHeaders)
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
        await sb.from('spar_sessions').update(upd).eq('id', sessionId)
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
      const { data: sess } = await sb.from('spar_sessions').select('id, lead_id, auth_user_id').eq('id', sessionId).maybeSingle()
      if (!sess) return jsonResponse({ ok: false }, 200, corsHeaders)
      const ownerId = (sess.auth_user_id as string | null) || null
      if (ownerId && (!au || au.id !== ownerId)) return jsonResponse({ error: 'wymagane_logowanie' }, 403, corsHeaders)
      const now = new Date().toISOString()
      // Idempotencja: domknij i odpal drogi handoff TYLKO przy pierwszym zamknięciu.
      // Atomowy claim (WHERE knowhow_closed_at IS NULL) chroni przed podwójnym
      // klikiem / retry sieciowym / ponownym wejściem „po fakcie" — inaczej każdy
      // re-call regenerowałby handoff (call modelu 6000 tok.) i nadpisywał poprzedni.
      const { data: claimed } = await sb.from('spar_sessions')
        .update({ knowhow_closed_at: now, updated_at: now })
        .eq('id', sessionId).is('knowhow_closed_at', null).select('id')
      if (!claimed || !claimed.length) return jsonResponse({ ok: true, already: true }, 200, corsHeaders)
      await sb.from('spar_knowhow_summary').upsert({ session_id: sessionId, lead_id: (sess.lead_id as string | null) || null, status: 'closed', closed_at: now }, { onConflict: 'session_id' })
      // Handoff pack w tle (nie blokuje odpowiedzi na przycisk)
      const erHp = (globalThis as { EdgeRuntime?: { waitUntil?: (pr: Promise<unknown>) => void } }).EdgeRuntime
      const hpPromise = generateHandoffPack(sb, sessionId)
      if (erHp && typeof erHp.waitUntil === 'function') erHp.waitUntil(hpPromise)
      else hpPromise.catch((e) => console.error('[spar-chat] handoff bg error:', e))
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
    if (!message && body.knowhowResume !== true) {
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
      console.error(`[spar-chat] brak klucza ${promptKey} w settings`)
      return jsonResponse({ error: 'brak_promptu' }, 500, corsHeaders)
    }

    // ── Sesja: pobierz lub utwórz ────────────────────────────────────────────
    const { data: existingSession, error: sessionError } = await supabase
      .from('spar_sessions')
      .select('id, turns, profession, problem_hint, email, name, phone, auth_user_id, verdict, problem_summary, preview_brief, preview_image_url, is_test, assessment, paid_at, lead_id, full_paid_at, knowhow_closed_at, idea_source')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error('[spar-chat] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }

    // ── Własność sesji: rozmowa przypięta do konta wymaga JWT tego konta ─────
    // (link ?id= przestaje działać jak hasło).
    const sessionOwnerId = (existingSession?.auth_user_id as string | null | undefined) || null
    if (sessionOwnerId && (!authUser || authUser.id !== sessionOwnerId)) {
      return jsonResponse({ error: 'wymagane_logowanie' }, 403, corsHeaders)
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
          .from('spar_sessions')
          .update(contactUpdate)
          .eq('id', sessionId)
        if (contactError) console.error('[spar-chat] contact update error:', contactError)
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
          .from('spar_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('ip', ip)
          .gte('created_at', ipHourAgo)
        if (ipCountError) {
          console.error('[spar-chat] ip rate-limit count error:', ipCountError)
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
          .from('spar_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('auth_user_id', authUser.id)
          .gte('created_at', dayAgo)
        if (userCountError) {
          console.error('[spar-chat] user rate-limit count error:', userCountError)
        } else if ((userSessions ?? 0) >= MAX_SESSIONS_PER_DAY_PER_USER) {
          return jsonResponse({ error: 'limit_sesji' }, 429, corsHeaders)
        }
      }

      // upsert + ignoreDuplicates: odporne na wyścig dwóch równoległych requestów
      const { error: insertError } = await supabase
        .from('spar_sessions')
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
            ip,
            last_user_at: new Date().toISOString(),
          }],
          { onConflict: 'id', ignoreDuplicates: true },
        )
      if (insertError) {
        console.error('[spar-chat] session insert error:', insertError)
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
    const previewShown = !!existingSession?.preview_brief
    const contactDue = (turnsBefore >= MAX_TURNS_BEZ_KONTAKTU && previewShown)
      || turnsBefore >= MAX_TURNS_HARD_GATE
    if (!isKnowHowMode && !gateSatisfied && contactDue) {
      return jsonResponse({ error: REQUIRE_ACCOUNT ? 'wymagane_konto' : 'wymagany_email' }, 403, corsHeaders)
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentCount, error: countError } = await supabase
      .from('spar_messages')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .gte('created_at', hourAgo)

    if (countError) {
      console.error('[spar-chat] rate-limit count error:', countError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if ((recentCount ?? 0) >= MAX_MESSAGES_PER_HOUR) {
      return jsonResponse({ error: 'limit_wiadomosci' }, 429, corsHeaders)
    }

    // ── Historia rozmowy (przed dopisaniem nowej wiadomości; per kanał) ──────
    const { data: history, error: historyError } = await supabase
      .from('spar_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('channel', mode)
      .order('id', { ascending: true })

    if (historyError) {
      console.error('[spar-chat] history fetch error:', historyError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }

    // ── Append wiadomości usera ──────────────────────────────────────────────
    // Zaczepka know-how (knowhowResume): brak realnej wiadomości usera → NIE zapisujemy
    // jej do historii. Model dostaje syntetyczny wyzwalacz jako ostatnią turę.
    if (!knowhowResume) {
      const { error: userMsgError } = await supabase
        .from('spar_messages')
        .insert({ session_id: sessionId, role: 'user', content: message, channel: mode })
      if (userMsgError) {
        console.error('[spar-chat] insert user message error:', userMsgError)
        return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
      }
    }

    const RESUME_TRIGGER = '[SYSTEM: Rozmówca wrócił do rozmowy i czeka — zagadnij go zgodnie z instrukcją POWRÓT DO ROZMOWY.]'
    const messages = [
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: knowhowResume ? RESUME_TRIGGER : message },
    ]

    // Kontekst sesji dla modelu: profesja + punkt wyjścia (kafelek lub własne
    // słowa rozmówcy). Źródłem prawdy jest wiersz sesji w DB; dla nowej sesji
    // — wartości z requestu. Osobny blok system PO bloku cache'owanym
    // (cache_control wyznacza granicę prefiksu — duży prompt dalej się cache'uje).
    const sessionProfession = (existingSession?.profession as string | null | undefined) || profession || null
    let sessionContext =
      `KONTEKST SESJI — profesja rozmówcy: ${sessionProfession || 'jeszcze nieustalona — ustal w pierwszych turach, czym rozmówca się zajmuje'}.`

    // Bramka potencjału: model wystawia <ocena> po domknięciu rdzenia, backend
    // odpala spar-assess i steruje drugą turą wg wyniku (tylko kanał sparing).
    // Jeśli poprzednia tura zamknęła badanie „zielonym" i czekamy na podgląd po
    // dopracowaniu kierunku — wstrzykujemy instrukcję podglądu zamiast bramki
    // (jednorazowo; flaga awaiting_preview w assessment, czyszczona poniżej).
    {
      await ensureKnowhowPrompts(supabase)
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
      } else if (existingSession?.verdict === 'zielony') {
        // PO ZIELONYM WERDYKCIE: nie bramkuj już oceną — agent jest w fazie
        // współpracy (rezerwacja + przełamywanie obiekcji), nie badania pomysłu.
        // Bez tego GATE_INSTRUCTION ciągnął agenta z powrotem do <ocena>.
        sessionContext += `\n\n${COLLAB_PHASE_INSTRUCTION}`
      } else if (asmt && asmt.awaiting_preview === true) {
        sessionContext += `\n\n${PREVIEW_AFTER_GATE_INSTRUCTION}`
        supabase.from('spar_sessions')
          .update({ assessment: { ...asmt, awaiting_preview: false }, updated_at: new Date().toISOString() })
          .eq('id', sessionId)
          .then(({ error }: { error: unknown }) => { if (error) console.error('[spar-chat] clear awaiting_preview error:', error) })
      } else {
        sessionContext += `\n\n${GATE_INSTRUCTION}`
        // Karty rozwidlenia kierunku — tylko gdy front je renderuje (flaga)
        if (KIERUNKI_ENABLED) sessionContext += `\n\n${KIERUNKI_INSTRUCTION}`
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
            { role: 'system', content: `${systemPrompt}\n\n${sessionContext}` },
            ...messages,
          ],
        }),
      }, 'chat-main')
    } catch (err) {
      console.error('[spar-chat] OpenAI fetch wyjątek po retry:', err)
      return jsonResponse({ error: 'blad_ai' }, 502, corsHeaders)
    }

    if (!openaiResponse.ok || !openaiResponse.body) {
      const errorText = await openaiResponse.text().catch(() => '')
      console.error('[spar-chat] OpenAI API error po retry:', openaiResponse.status, errorText)
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
                  console.error('[spar-chat] OpenAI stream error:', JSON.stringify(evt.error))
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

          // ── BRAMKA POTENCJAŁU (GA) ─────────────────────────────────────────
          // Gdy model domknął rdzeń i wystawił <ocena>, odpalamy realny research
          // (spar-assess) i DRUGĄ turą model steruje wg wyniku. Werdykt z bramki.
          let gateOcena: Record<string, unknown> | null = null
          {
            const om = assistantText.match(/<ocena>([\s\S]*?)<\/ocena>/)
            if (om) {
              try {
                const projektDoOceny = JSON.parse(om[1]) as Record<string, unknown>
                controller.enqueue(encoder.encode(`event: spar_ocena\ndata: ${JSON.stringify({ status: 'badam' })}\n\n`))
                gateOcena = await runGate(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, projektDoOceny, sessionId, (label) => {
                  try { controller.enqueue(encoder.encode(`event: spar_ocena\ndata: ${JSON.stringify({ status: 'progress', label })}\n\n`)) } catch { /* klient rozłączony */ }
                })
                if (gateOcena) {
                  await supabase.from('spar_sessions')
                    .update({ assessment: { ...gateOcena, at: new Date().toISOString(), awaiting_preview: gateOcena.ocena === 'mocny' }, updated_at: new Date().toISOString() })
                    .eq('id', sessionId)
                  controller.enqueue(encoder.encode(`event: spar_ocena\ndata: ${JSON.stringify({ status: 'gotowe', ocena: gateOcena })}\n\n`))
                  const second = await streamSecondCall(controller, encoder, OPENAI_API_KEY, OPENAI_MODEL, [
                    { role: 'system', content: `${systemPrompt}\n\n${sessionContext}\n\n${buildSteerInstruction(gateOcena)}` },
                    ...messages,
                    { role: 'assistant', content: assistantText },
                    { role: 'user', content: '[SYSTEM] Wynik badania rynku gotowy — zareaguj zgodnie z instrukcją STEROWANIA.' },
                  ])
                  assistantText += '\n' + second.text
                  if (second.usage) {
                    const u2 = second.usage
                    const inp = u2.prompt_tokens || 0, cch = u2.prompt_tokens_details?.cached_tokens || 0, out = u2.completion_tokens || 0
                    supabase.from('spar_usage').insert({
                      session_id: sessionId, kind: 'chat', model: OPENAI_MODEL,
                      input_tokens: inp, cached_tokens: cch, output_tokens: out,
                      cost_usd: chatCostUsd(OPENAI_MODEL, inp, cch, out), meta: { channel: mode, phase: 'steer' },
                    }).then(({ error }: { error: unknown }) => { if (error) console.error('[spar-chat] steer usage insert error:', error) })
                  }
                }
              } catch (gErr) {
                console.error('[spar-chat] bramka/ocena error:', gErr)
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
            console.log('[spar-chat] hard-gate downgrade zielony→zolty (ocena=', gateOcena.ocena, ')')
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
            // woła spar-image, a ten czyta brief Z BAZY — bez zapisu tutaj
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
              .from('spar_sessions')
              .update(briefUpdate)
              .eq('id', sessionId)
            if (briefErr) console.error('[spar-chat] brief pre-save error:', briefErr)

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
                console.error('[spar-chat] [ALERT] zielony werdykt NIE utworzył leada — session:', sessionId, 'email:', effectiveEmail)
                supabase.from('spar_sessions')
                  .update({ lead_error: `lead-upsert bez lead_id @ ${new Date().toISOString()}` })
                  .eq('id', sessionId)
                  .then(({ error }: { error: unknown }) => { if (error) console.error('[spar-chat] lead_error stamp failed:', error) })
              }
            } else {
              console.error('[spar-chat] zielony werdykt bez maila w sesji:', sessionId)
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
            else khPromise.catch((e) => console.error('[spar-chat] knowhow extract bg error:', e))
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
          console.error('[spar-chat] stream passthrough error:', err)
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
            console.error('[spar-chat] persist after abort error:', persistErr)
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
        console.log('[spar-chat] klient przerwał stream:', reason)
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
    console.error('[spar-chat] ERROR:', error)
    return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
  }
})
