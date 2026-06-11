// spar-chat — sparing AI dla lejka "Stworzę" (tomekniedzwiecki.pl/stworze)
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
// TRYBY (body.mode):
//   'sparing'    (default) — lejek definiowania projektu (tomekniedzwiecki.pl/stworze/sparing/)
//   'wspolpraca'           — drugi czat w PANELU PROJEKTU (crm: stworze-projekt.html):
//                            rozmowa o modelu współpracy, cel = zamówienie makiety.
//                            Wymaga istniejącej sesji Z projektem; prompt z klucza
//                            'stworze_wspolpraca_prompt'; historia w spar_messages
//                            z channel='wspolpraca'; bez markerów <projekt>/<werdykt>.

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
const MAX_TURNS_BEZ_KONTAKTU = 5      // tur asystenta zanim wymagamy maila (bramka inline w czacie)
const OPENAI_MODEL = Deno.env.get('SPAR_OPENAI_MODEL') || 'gpt-5.1'
const OPENAI_MAX_COMPLETION_TOKENS = 1500

// ── Cache system promptów (mapa per klucz settings, 5 min) ───────────────────
const PROMPT_CACHE_TTL_MS = 5 * 60 * 1000
const promptCache = new Map<string, { value: string; fetchedAt: number }>()

const PROMPT_KEYS: Record<string, string> = {
  sparing: 'stworze_sparing_prompt',
  wspolpraca: 'stworze_wspolpraca_prompt',
}
const MAX_COLLAB_TURNS = 30 // tur asystenta w kanale wspolpraca (osobna pula od sparingu)

interface SparChatRequest {
  sessionId: string
  profession: string
  problemHint?: string | null
  email: string
  name?: string | null
  message: string
  tracking?: Record<string, unknown> | null
  mode?: string
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
}

// Marker werdyktu: <werdykt>{"kolor":"...","karta":{...}}</werdykt>
function parseVerdict(fullText: string): VerdictResult {
  const match = fullText.match(/<werdykt>([\s\S]*?)<\/werdykt>/)
  if (!match) return { verdict: null, karta: null }
  try {
    const parsed = JSON.parse(match[1])
    const kolor = parsed?.kolor
    if (kolor === 'zielony' || kolor === 'zolty' || kolor === 'czerwony') {
      return { verdict: kolor, karta: parsed?.karta ?? null }
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
  if (!matches.length) return null
  try {
    const parsed = JSON.parse(matches[matches.length - 1][1])
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch (err) {
    console.error('[spar-chat] błąd parsowania markera projekt:', err)
    return null
  }
}

// Zwięzły opis Karty Problemu do notatki leada
function buildLeadNotes(profession: string, karta: Record<string, unknown> | null): string {
  const lines: string[] = ['Sparing /stworze — werdykt: ZIELONY']
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
        source: 'stworze',
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

// Zapis po zakończeniu streamu: wiadomość asystenta + update sesji
async function persistAfterStream(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  assistantText: string,
  turnsBefore: number,
  verdict: VerdictResult,
  leadId: string | null,
  projekt: Record<string, unknown> | null,
  channel: string,
): Promise<void> {
  try {
    if (assistantText.trim()) {
      const { error: msgError } = await supabase
        .from('spar_messages')
        .insert({ session_id: sessionId, role: 'assistant', content: assistantText, channel })
      if (msgError) console.error('[spar-chat] insert assistant message error:', msgError)
    }

    const update: Record<string, unknown> = {
      turns: turnsBefore + 1,
      updated_at: new Date().toISOString(),
    }
    if (verdict.verdict) {
      update.verdict = verdict.verdict
      update.problem_summary = verdict.karta
    }
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
    const message = (body.message || '').trim()
    const tracking = body.tracking && typeof body.tracking === 'object' ? body.tracking : null
    const mode = body.mode === 'wspolpraca' ? 'wspolpraca' : 'sparing'
    const isCollab = mode === 'wspolpraca'

    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, corsHeaders)
    }
    // Czat startuje BEZ maila i BEZ profesji (czat-first; bramka inline po
    // MAX_TURNS_BEZ_KONTAKTU turach). Jeśli pola przyszły — walidujemy format.
    if (email && (email.length > 320 || !EMAIL_RE.test(email))) {
      return jsonResponse({ error: 'nieprawidlowy_email' }, 400, corsHeaders)
    }
    if (profession && profession.length > 200) {
      return jsonResponse({ error: 'brak_profesji' }, 400, corsHeaders)
    }
    if (!message) {
      return jsonResponse({ error: 'pusta_wiadomosc' }, 400, corsHeaders)
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: 'wiadomosc_za_dluga' }, 400, corsHeaders)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
      .select('id, turns, profession, problem_hint, email, name, verdict, problem_summary, preview_brief, preview_image_url')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error('[spar-chat] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }

    // Tryb wspolpraca: rozmowa o współpracy istnieje tylko nad zdefiniowanym
    // projektem — sesja musi istnieć i mieć kartę lub brief (jak spar-project).
    if (isCollab && (!existingSession || (!existingSession.problem_summary && !existingSession.preview_brief))) {
      return jsonResponse({ error: 'brak_projektu' }, 404, corsHeaders)
    }

    let turnsBefore = 0
    if (existingSession) {
      turnsBefore = existingSession.turns ?? 0

      // Kontakt z bramki inline: dopisz mail/imię do sesji, gdy przyszły po raz pierwszy
      if (email && !existingSession.email) {
        const { error: contactError } = await supabase
          .from('spar_sessions')
          .update({ email, name, updated_at: new Date().toISOString() })
          .eq('id', sessionId)
        if (contactError) console.error('[spar-chat] contact update error:', contactError)
      }
    } else {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null

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

      // upsert + ignoreDuplicates: odporne na wyścig dwóch równoległych requestów
      const { error: insertError } = await supabase
        .from('spar_sessions')
        .upsert(
          [{
            id: sessionId,
            profession: profession || null,
            problem_hint: problemHint,
            email: email || null,
            name,
            tracking,
            ip,
          }],
          { onConflict: 'id', ignoreDuplicates: true },
        )
      if (insertError) {
        console.error('[spar-chat] session insert error:', insertError)
        return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
      }
    }

    // ── Limity (przed wywołaniem Claude) ─────────────────────────────────────
    if (isCollab) {
      // Osobna pula tur dla czatu współpracy (licznik sesji `turns` jest globalny)
      const { count: collabTurns, error: collabCountError } = await supabase
        .from('spar_messages')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('channel', 'wspolpraca')
        .eq('role', 'assistant')
      if (collabCountError) {
        console.error('[spar-chat] collab turns count error:', collabCountError)
        return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
      }
      if ((collabTurns ?? 0) >= MAX_COLLAB_TURNS) {
        return jsonResponse({ error: 'limit_tur' }, 429, corsHeaders)
      }
    } else if (turnsBefore >= MAX_TURNS) {
      return jsonResponse({ error: 'limit_tur' }, 429, corsHeaders)
    }

    // Bramka kontaktu (backstop server-side; frontend pokazuje formularz wcześniej):
    // bez maila rozmowa nie przechodzi dalej niż MAX_TURNS_BEZ_KONTAKTU tur.
    // W trybie wspolpraca działa od pierwszej wiadomości (mail i tak konieczny
    // przed zamówieniem makiety — panel kieruje wtedy z powrotem do rozmowy).
    const effectiveEmail = (existingSession?.email as string | null | undefined) || email || null
    if (!effectiveEmail && (isCollab || turnsBefore >= MAX_TURNS_BEZ_KONTAKTU)) {
      return jsonResponse({ error: 'wymagany_email' }, 403, corsHeaders)
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
    const { error: userMsgError } = await supabase
      .from('spar_messages')
      .insert({ session_id: sessionId, role: 'user', content: message, channel: mode })
    if (userMsgError) {
      console.error('[spar-chat] insert user message error:', userMsgError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }

    const messages = [
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    // Kontekst sesji dla modelu: profesja + punkt wyjścia (kafelek lub własne
    // słowa rozmówcy). Źródłem prawdy jest wiersz sesji w DB; dla nowej sesji
    // — wartości z requestu. Osobny blok system PO bloku cache'owanym
    // (cache_control wyznacza granicę prefiksu — duży prompt dalej się cache'uje).
    const sessionProfession = (existingSession?.profession as string | null | undefined) || profession || null
    let sessionContext =
      `KONTEKST SESJI — profesja rozmówcy: ${sessionProfession || 'jeszcze nieustalona — ustal w pierwszych turach, czym rozmówca się zajmuje'}.`

    if (isCollab) {
      // Czat współpracy zna projekt: brief (nazwa/opis) + karta + stan werdyktu.
      const brief = (existingSession?.preview_brief || {}) as Record<string, unknown>
      const karta = existingSession?.problem_summary as Record<string, unknown> | null
      const firstName = typeof existingSession?.name === 'string' && existingSession.name
        ? (existingSession.name as string).split(' ')[0]
        : null
      const ctx: string[] = [
        `KONTEKST SESJI — rozmawiasz w panelu projektu.`,
        `Imię rozmówcy: ${firstName || 'nieznane'}. Profesja: ${sessionProfession || 'nieznana'}.`,
        `Projekt: ${(brief.nazwa as string) || 'bez nazwy'} — ${(brief.opis as string) || 'brak opisu'}.`,
        `Karta projektu (JSON): ${karta ? JSON.stringify(karta) : 'jeszcze niedomknięta — rozmowa definiująca trwa'}.`,
        `Stan: ${existingSession?.verdict === 'zielony' ? 'projekt zdefiniowany (werdykt zielony) — można zamawiać makietę' : 'projekt w trakcie definiowania — do zamówienia makiety potrzebne dokończenie rozmowy definiującej'}.`,
        `Podgląd graficzny: ${existingSession?.preview_image_url ? 'wygenerowany, widoczny w panelu' : 'brak'}.`,
      ]
      sessionContext = ctx.join('\n')
    }

    // ── Wywołanie OpenAI /v1/chat/completions (stream) ───────────────────────
    // gpt-5.x: max_completion_tokens (NIE max_tokens), bez temperature.
    // OpenAI cache'uje powtarzalny prefiks promptu automatycznie.
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        stream: true,
        max_completion_tokens: OPENAI_MAX_COMPLETION_TOKENS,
        messages: [
          { role: 'system', content: `${systemPrompt}\n\n${sessionContext}` },
          ...messages,
        ],
      }),
    })

    if (!openaiResponse.ok || !openaiResponse.body) {
      const errorText = await openaiResponse.text().catch(() => '')
      console.error('[spar-chat] OpenAI API error:', openaiResponse.status, errorText)
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
        let persisted = false
        const schedulePersist = (verdict: VerdictResult, leadId: string | null, projekt: Record<string, unknown> | null): Promise<void> | null => {
          if (persisted) return null
          persisted = true
          const p = persistAfterStream(supabase, sessionId, assistantText, turnsBefore, verdict, leadId, projekt, mode)
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

          // Stream zakończony — finalizacja. Markery <projekt>/<werdykt> żyją
          // tylko w sparingu; czat współpracy ich nie wysyła (a gdyby model
          // halucynował — nie nadpisujemy nimi karty projektu).
          const verdict = isCollab ? { verdict: null, karta: null } as VerdictResult : parseVerdict(assistantText)
          const projekt = isCollab ? null : parseProjekt(assistantText)

          // Marker podglądu -> event dla frontendu (strona woła spar-image)
          if (projekt) {
            controller.enqueue(
              encoder.encode(`event: spar_projekt\ndata: ${JSON.stringify(projekt)}\n\n`),
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
                profession: sessionProfession || 'nieznana',
                karta: verdict.karta,
                tracking,
              })
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
        } catch (err) {
          console.error('[spar-chat] stream passthrough error:', err)
          // Klient mógł przerwać stream (zamknięta karta) — zapisz to, co już
          // wygenerowano, żeby historia rozmowy nie gubiła odpowiedzi asystenta.
          try {
            const persistPromise = schedulePersist(
              isCollab ? { verdict: null, karta: null } : parseVerdict(assistantText),
              null,
              isCollab ? null : parseProjekt(assistantText),
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
