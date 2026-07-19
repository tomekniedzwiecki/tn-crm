// lead-talk — nowe okno rozmowy AI dla leadów z /zapisy (lejek /zbuduje, przywrócony 17.07.2026).
// CZYSTA ROZMOWA — zero artefaktów (makiet/raportów/landingów). Cele: zaangażować,
// zakwalifikować naturalnie, opowiedzieć warunki, dać wizję modelu, doprowadzić do
// rezerwacji 500 zł (zwrotnej). Transkrypcja: talk_sessions/talk_messages → lead.html (CRM).
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (front wywołuje bez JWT):
//   npx supabase functions deploy lead-talk --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
//
// Sekrety: OPENAI_API_KEY (jest), TALK_OPENAI_MODEL (opcjonalny override, default gpt-5.1),
//          SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (wbudowane).
// System prompt: settings key='rozmowa_prompt' (cache 5 min — zmiana wymaga redeployu
// albo odczekania TTL). Kill-switch: settings key='rozmowa_enabled' (FAIL-OPEN).
//
// Kontrakt:
//   POST {action:'init', leadId, isTest?}  → JSON { sessionId, prefill, messages[] }
//       (nowa sesja = generuje pierwszą wiadomość otwierającą od słów leada z ankiety)
//   POST {action:'message', sessionId, message} → SSE (content_block_delta/text_delta + talk_meta)
//
// Markery w odpowiedziach modelu (ukrywane na froncie):
//   <opcje>["...","..."]</opcje> — chipy szybkich odpowiedzi (max 3)
//   <faza>nazwa</faza>           — stempel dramaturgii/obiekcji → talk_sessions.tags (CRM)
//   <rezerwacja>                 — front pokazuje lekką kartę rezerwacji 500 zł

import { createClient } from "jsr:@supabase/supabase-js@2";

// ── CORS — whitelist originów (wzorzec bud-chat) ─────────────────────────────
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

// ── Limity ───────────────────────────────────────────────────────────────────
const MAX_TURNS = 40                 // tur asystenta per sesja
const MAX_MESSAGE_LENGTH = 2000
const MAX_MESSAGES_PER_HOUR = 60     // COUNT talk_messages/h per sesja
const HISTORY_CAP = 40               // wiadomości wysyłanych do modelu

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = Deno.env.get('TALK_OPENAI_MODEL') || 'gpt-5.1'
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || ''

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// ── Prompt z settings (cache 5 min; redeploy = świeży fetch) ─────────────────
const promptCache = new Map<string, { value: string; at: number }>()
const PROMPT_CACHE_TTL_MS = 5 * 60 * 1000
async function getSetting(key: string): Promise<string> {
  const hit = promptCache.get(key)
  if (hit && Date.now() - hit.at < PROMPT_CACHE_TTL_MS) return hit.value
  const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle()
  const value = (data?.value || '').trim()
  promptCache.set(key, { value, at: Date.now() })
  return value
}
// Kill-switch FAIL-OPEN: wyłącza TYLKO jawne 'false'
async function isEnabled(): Promise<boolean> {
  try { return (await getSetting('rozmowa_enabled')).toLowerCase() !== 'false' } catch { return true }
}

// ── OpenAI fetch z retry; insufficient_quota = fast-fail (gotcha: przychodzi jako 429) ──
async function openaiFetch(body: unknown): Promise<Response> {
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
  let lastStatus = 0
  for (let i = 0; i < 3; i++) {
    const res = await fetch(OPENAI_URL, init)
    if (res.ok) return res
    lastStatus = res.status
    if (res.status === 429 || res.status >= 500) {
      const txt = await res.text().catch(() => '')
      if (txt.includes('insufficient_quota')) throw new Error('insufficient_quota')
      if (i < 2) { await new Promise((r) => setTimeout(r, 800 * (i + 1))); continue }
      throw new Error(`openai HTTP ${res.status}`)
    }
    const txt = await res.text().catch(() => '')
    throw new Error(`openai HTTP ${res.status}: ${txt.slice(0, 300)}`)
  }
  throw new Error(`openai retry exhausted (HTTP ${lastStatus})`)
}

// ── Kontekst leada z ankiety /zapisy ─────────────────────────────────────────
function cleanStr(s: unknown, max = 900): string {
  return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, max).trim()
}
// Tłumaczenie chipów ankiety „Co już próbowałeś w biznesie online?" na ludzki opis
const DIRECTION_LABELS: Record<string, string> = {
  sklep_online: 'własny sklep online', allegro: 'sprzedaż na Allegro', vinted_olx: 'Vinted/OLX',
  dropshipping: 'dropshipping', takedrop: 'TakeDrop (platforma Tomka!)', amazon: 'Amazon',
  kursy: 'kursy online', freelance: 'freelance', afiliacja: 'afiliacja', trading: 'trading/krypto',
  nigdy: 'NIC — zaczyna zupełnie od zera',
}
// deno-lint-ignore no-explicit-any
function leadContext(lead: any): string {
  const parts: string[] = []
  if (lead.name) parts.push(`Imię: ${cleanStr(lead.name, 80)}`)
  if (lead.direction) {
    const tried = cleanStr(lead.direction, 200).split(',')
      .map((d) => DIRECTION_LABELS[d.trim()] || d.trim()).filter(Boolean).join(', ')
    if (tried) parts.push(`Co już próbował w biznesie online (ankieta): ${tried}`)
  }
  if (lead.current_income) parts.push(`Obecny dochód mies.: ${cleanStr(lead.current_income, 20)}`)
  if (lead.budget) parts.push(`Deklarowany budżet na start: ${cleanStr(lead.budget, 30)} zł`)
  if (lead.weekly_hours) parts.push(`Czas tygodniowo na biznes: ${cleanStr(lead.weekly_hours, 20)}`)
  const about = cleanStr(lead.experience || lead.open_question, 900)
  parts.push(about
    ? `„O sobie" (własne słowa leada — OD TEGO ZACZNIJ):\n"""${about}"""`
    : `Pole „O sobie" PUSTE — użyj otwarcia neutralnego (poproś w 1 pytaniu, żeby opowiedział skąd pomysł).`)
  return parts.join('\n')
}

// ── Stemple <faza> ───────────────────────────────────────────────────────────
function extractFazy(text: string): string[] {
  const out: string[] = []
  const re = /<faza>\s*([a-z0-9_:ąćęłńóśźż-]{2,60})\s*<\/faza>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) out.push(m[1].toLowerCase())
  return out
}

function jsonResponse(obj: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

// ── Budowa messages dla OpenAI ───────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function buildMessages(lead: any, session: any, history: { role: string; content: string }[]) {
  const base = await getSetting('rozmowa_prompt')
  if (!base) throw new Error('brak rozmowa_prompt w settings')
  const tags = Array.isArray(session.tags) ? session.tags.map((t: { t: string }) => t.t).slice(-12).join(', ') : ''
  const system = base
    + `\n\n## KONTEKST LEADA (z ankiety /zapisy — używaj naturalnie, nie recytuj)\n${leadContext(lead)}`
    + (tags ? `\n\n## DOTYCHCZASOWE STEMPLE ROZMOWY (nie powtarzaj przerobionych beatów)\n${tags}` : '')
  return [{ role: 'system', content: system }, ...history.slice(-HISTORY_CAP)]
}

// deno-lint-ignore no-explicit-any
async function persistAssistant(session: any, text: string) {
  if (!text.trim()) return
  await supabase.from('talk_messages').insert({ session_id: session.id, role: 'assistant', content: text })
  const fazy = extractFazy(text)
  const now = new Date().toISOString()
  const tags = Array.isArray(session.tags) ? session.tags : []
  for (const f of fazy) tags.push({ t: f, at: now })
  if (/<rezerwacja>/i.test(text) && !fazy.includes('faza_okno_rezerwacji')) tags.push({ t: 'faza_okno_rezerwacji', at: now })
  await supabase.from('talk_sessions').update({
    turns: (session.turns || 0) + 1,
    tags,
    last_phase: fazy.length ? fazy[fazy.length - 1] : session.last_phase,
    updated_at: now,
  }).eq('id', session.id)
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'method' }, 405, cors)

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return jsonResponse({ error: 'bad_json' }, 400, cors) }

  if (!(await isEnabled())) return jsonResponse({ error: 'rozmowa_wylaczona' }, 503, cors)

  const action = String(body.action || 'message')

  // ════════════════════ INIT ════════════════════
  if (action === 'init') {
    const leadId = String(body.leadId || '')
    if (!/^[0-9a-f-]{36}$/i.test(leadId)) return jsonResponse({ error: 'bad_lead' }, 400, cors)
    const { data: lead } = await supabase.from('leads')
      .select('id,name,email,phone,direction,current_income,budget,weekly_hours,experience,open_question')
      .eq('id', leadId).maybeSingle()
    if (!lead) return jsonResponse({ error: 'lead_nie_istnieje' }, 404, cors)

    // jedna sesja per lead — wznawiamy ostatnią
    let { data: session } = await supabase.from('talk_sessions')
      .select('*').eq('lead_id', leadId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!session) {
      const { data: created, error } = await supabase.from('talk_sessions')
        .insert({ lead_id: leadId, is_test: body.isTest === true }).select('*').single()
      if (error || !created) return jsonResponse({ error: 'sesja_fail' }, 500, cors)
      session = created
    }

    const { data: msgs } = await supabase.from('talk_messages')
      .select('role,content').eq('session_id', session.id).order('id', { ascending: true })
    let messages = msgs || []

    // nowa sesja → wygeneruj otwarcie (nie-streaming; front pokazuje "pisze…")
    if (messages.length === 0) {
      try {
        const openaiMessages = await buildMessages(lead, session, [{
          role: 'user',
          content: '[SYSTEM: To sam początek rozmowy — lead właśnie złożył aplikację (ankietę). Napisz PIERWSZĄ wiadomość wg sekcji OTWARCIE promptu, struktura obowiązkowa: (1) potwierdź przyjęcie aplikacji, (2) rama selekcji w jednym zdaniu (zanim aplikacja trafi na biurko Tomka, dopytasz o parę rzeczy — on bierze kilka osób naraz), (3) jedno pytanie zbudowane na konkrecie z jego ankiety (albo neutralne, jeśli pola puste). MAX 3 krótkie zdania + pytanie, do ~320 znaków. Dodaj chipy <opcje> z 2-3 odpowiedziami głosem leada i stempel <faza> profilu.]',
        }])
        const res = await openaiFetch({ model: MODEL, messages: openaiMessages, max_completion_tokens: 700 })
        const j = await res.json()
        const opening = (j?.choices?.[0]?.message?.content || '').trim()
        if (opening) {
          await persistAssistant(session, opening)
          messages = [{ role: 'assistant', content: opening }]
        }
      } catch (e) {
        console.error('[lead-talk] opening fail', e)
        // fallback statyczny — rozmowa nie może umrzeć na starcie
        const fallback = 'Cześć! Przeczytałem, co napisałeś w ankiecie. Zanim wejdziemy w konkrety wspólnego biznesu z Tomkiem — powiedz mi w dwóch zdaniach, co Cię tu sprowadza właśnie teraz? <opcje>["Chcę dodatkowego dochodu","Próbowałem i nie wyszło","Chcę zmienić życie"]</opcje>'
        await persistAssistant(session, fallback)
        messages = [{ role: 'assistant', content: fallback }]
      }
    }

    return jsonResponse({
      sessionId: session.id,
      prefill: { name: lead.name || '', email: lead.email || '', phone: lead.phone || '' },
      messages,
    }, 200, cors)
  }

  // ════════════════════ MESSAGE (SSE) ════════════════════
  if (action !== 'message') return jsonResponse({ error: 'bad_action' }, 400, cors)
  const sessionId = String(body.sessionId || '')
  const userMsg = cleanStr(body.message, MAX_MESSAGE_LENGTH)
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return jsonResponse({ error: 'bad_session' }, 400, cors)
  if (!userMsg) return jsonResponse({ error: 'pusta_wiadomosc' }, 400, cors)

  const { data: session } = await supabase.from('talk_sessions').select('*').eq('id', sessionId).maybeSingle()
  if (!session) return jsonResponse({ error: 'sesja_nie_istnieje' }, 404, cors)
  if ((session.turns || 0) >= MAX_TURNS) return jsonResponse({ error: 'limit_tur' }, 429, cors)

  const hourAgo = new Date(Date.now() - 3600_000).toISOString()
  const { count } = await supabase.from('talk_messages')
    .select('id', { count: 'exact', head: true }).eq('session_id', sessionId).gte('created_at', hourAgo)
  if ((count || 0) >= MAX_MESSAGES_PER_HOUR) return jsonResponse({ error: 'limit_wiadomosci' }, 429, cors)

  const { data: lead } = await supabase.from('leads')
    .select('id,name,email,phone,direction,current_income,budget,weekly_hours,experience,open_question')
    .eq('id', session.lead_id).maybeSingle()
  if (!lead) return jsonResponse({ error: 'lead_nie_istnieje' }, 404, cors)

  await supabase.from('talk_messages').insert({ session_id: sessionId, role: 'user', content: userMsg })

  const { data: hist } = await supabase.from('talk_messages')
    .select('role,content').eq('session_id', sessionId).order('id', { ascending: true })
  const history = (hist || []).map((m) => ({ role: m.role, content: m.content }))

  let openaiRes: Response
  try {
    const openaiMessages = await buildMessages(lead, session, history)
    openaiRes = await openaiFetch({
      model: MODEL,
      messages: openaiMessages,
      stream: true,
      stream_options: { include_usage: true },
      max_completion_tokens: 1500,
    })
  } catch (e) {
    console.error('[lead-talk] openai fail', e)
    return jsonResponse({ error: 'blad_ai' }, 502, cors)
  }

  // Normalizacja SSE: OpenAI delta → content_block_delta/text_delta + talk_meta (wzorzec bud-chat)
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (event: string, data: unknown) =>
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      let full = ''
      try {
        const reader = openaiRes.body!.getReader()
        const dec = new TextDecoder()
        let buf = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += dec.decode(value, { stream: true })
          const parts = buf.split('\n\n')
          buf = parts.pop() || ''
          for (const part of parts) {
            const line = part.split('\n').find((l) => l.startsWith('data:'))
            if (!line) continue
            const payload = line.slice(5).trim()
            if (payload === '[DONE]') continue
            try {
              const j = JSON.parse(payload)
              if (j.error) throw new Error(j.error.message || 'stream error')
              const delta = j.choices?.[0]?.delta?.content
              if (delta) {
                full += delta
                send('content_block_delta', { type: 'content_block_delta', delta: { type: 'text_delta', text: delta } })
              }
            } catch (e) {
              if (String(e).includes('stream error')) throw e
              /* niepełny JSON chunka — ignoruj */
            }
          }
        }
        await persistAssistant(session, full)
        send('talk_meta', {
          sessionId,
          phase: extractFazy(full).pop() || session.last_phase || null,
          reservation: /<rezerwacja>/i.test(full),
        })
      } catch (e) {
        console.error('[lead-talk] stream fail', e)
        await persistAssistant(session, full).catch(() => {})
        send('talk_meta', { sessionId, error: 'stream' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
})
