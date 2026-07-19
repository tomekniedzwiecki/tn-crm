// talk-transcript-cron — po zakończonej rozmowie AI (lead wyszedł z okna i nie wrócił
// przez ≥3 min) wysyła TRANSKRYPCJĘ do wątku Slack pod powiadomieniem o tym leadzie.
// Kolejna aktywność + kolejna cisza → dosyłka „ciąg dalszy" (tylko delta) w tym samym wątku.
//
// Detekcja ciszy: talk_sessions.last_seen_at (front pinguje co 30 s tylko przy widocznej karcie).
// Wątek: leads.slack_ts + slack_channel (zapisywane przez slack-notify w trybie bota).
// WYŁĄCZNIE WĄTEK (decyzja Tomka: nigdy osobna wiadomość na kanał):
// (1) leads.slack_ts (zapisany przez slack-notify w trybie bota) → od razu wątek;
// (2) brak ts → bot SZUKA powiadomienia o leadzie w historii kanału
//     (conversations.history, match po lead_id w treści — działa też dla wiadomości
//     wysłanych webhookiem!) i wątkuje pod znalezionym; ts zapamiętywany w leads;
// (3) nie znaleziono / brak bota → skip z retry w kolejnych przebiegach (do MAX_AGE).
// Wymagane scopes bota: chat:write + channels:history (kanał prywatny: groups:history),
// bot musi być członkiem kanału (/invite).
//
// ⚠️ DEPLOY: npx supabase functions deploy talk-transcript-cron --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
// Cron: pg_cron co 2 min, nagłówek x-cron-secret == SPAR_CRON_SECRET,
//       net.http_post z timeout_milliseconds:=15000 (default 5s ubija — gotcha pg_net!).
// Test ręczny: body {"session_id":"<uuid>"} wysyła dla wskazanej sesji (także is_test).

import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const SILENCE_MIN = 3          // minuty ciszy = koniec rozmowy
const MAX_AGE_H = 48           // nie grzeb w starszych sesjach
const BATCH = 8                // sesji na przebieg
const TEXT_CAP = 36000         // limit tekstu wiadomości Slack (~40k twardy)

const BOT = Deno.env.get('SLACK_BOT_TOKEN') || ''
const LEADS_CHANNEL = Deno.env.get('SLACK_LEADS_CHANNEL') || ''
const CRM = 'https://crm.tomekniedzwiecki.pl'

function stripMarkers(s: string): string {
  return String(s || '')
    .replace(/<faza>[\s\S]*?<\/faza>/gi, '')
    .replace(/<\/?(faza|rezerwacja)>/gi, '')
    .replace(/<opcje>[\s\S]*?(<\/opcje>|$)/gi, '')
    .replace(/\n{3,}/g, '\n\n').trim()
}
function slackEsc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// deno-lint-ignore no-explicit-any
function buildTranscript(lead: any, msgs: any[], fromIdx: number): string {
  const isCont = fromIdx > 0
  const who = lead.name || lead.email || 'lead'
  const head = isCont
    ? `💬 *Ciąg dalszy rozmowy AI* — ${slackEsc(who)}`
    : `💬 *Transkrypcja rozmowy AI* — ${slackEsc(who)} · <${CRM}/lead?id=${lead.id}|otwórz w CRM>`
  const lines: string[] = [head, '']
  for (const m of msgs.slice(fromIdx)) {
    const txt = stripMarkers(m.content)
    if (!txt) continue
    lines.push((m.role === 'user' ? '👤 *Lead:* ' : '🤖 *AI:* ') + slackEsc(txt))
    lines.push('')
  }
  let out = lines.join('\n')
  if (out.length > TEXT_CAP) out = out.slice(0, TEXT_CAP) + '\n…(ucięte — całość w CRM)'
  return out
}

// Szukanie kotwicy: powiadomienie o leadzie zawiera link CRM z lead_id — przeszukujemy
// historię kanału (do 3 stron × 200 wiadomości, max ~7 dni wstecz) po lead_id, potem po emailu.
async function findAnchorTs(leadId: string, email: string | null): Promise<string | null> {
  if (!BOT || !LEADS_CHANNEL) return null
  let cursor: string | undefined
  const oldest = String(Math.floor((Date.now() - 7 * 24 * 3600_000) / 1000))
  for (let page = 0; page < 3; page++) {
    const params = new URLSearchParams({ channel: LEADS_CHANNEL, limit: '200', oldest })
    if (cursor) params.set('cursor', cursor)
    const res = await fetch('https://slack.com/api/conversations.history?' + params, {
      headers: { 'Authorization': `Bearer ${BOT}` },
    })
    const j = await res.json().catch(() => null)
    if (!j?.ok) { console.error('[talk-transcript] history fail', j?.error); return null }
    for (const m of j.messages || []) {
      const blob = JSON.stringify(m)
      if (blob.includes(leadId) || (email && blob.includes(email))) return m.ts
    }
    cursor = j.response_metadata?.next_cursor
    if (!cursor) break
  }
  return null
}

async function postToThread(text: string, threadTs: string): Promise<boolean> {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${BOT}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ channel: LEADS_CHANNEL, thread_ts: threadTs, text, unfurl_links: false }),
  })
  const j = await res.json().catch(() => null)
  if (j?.ok) return true
  console.error('[talk-transcript] slack thread fail', j?.error)
  return false
}

// deno-lint-ignore no-explicit-any
async function processSession(s: any): Promise<string> {
  const { data: msgs } = await supabase.from('talk_messages')
    .select('role,content').eq('session_id', s.id).order('id', { ascending: true })
  const all = msgs || []
  const userCount = all.filter((m) => m.role === 'user').length
  if (!userCount) return 'skip:brak-wiadomosci-leada'
  if (all.length <= (s.slack_transcript_count || 0)) return 'skip:brak-nowych'

  const { data: lead } = await supabase.from('leads')
    .select('id,name,email,slack_ts,slack_channel').eq('id', s.lead_id).maybeSingle()
  if (!lead) return 'skip:brak-leada'
  if (!BOT || !LEADS_CHANNEL) return 'skip:brak-bota' // wątek albo nic — bez bota czekamy

  // kotwica wątku: zapisany ts albo znaleziona w historii kanału (po lead_id/emailu)
  let anchorTs: string | null = lead.slack_ts
  if (!anchorTs) {
    anchorTs = await findAnchorTs(lead.id, lead.email)
    if (anchorTs) {
      await supabase.from('leads').update({ slack_ts: anchorTs, slack_channel: LEADS_CHANNEL }).eq('id', lead.id)
    }
  }
  if (!anchorTs) return 'skip:brak-kotwicy' // retry w kolejnych przebiegach (do MAX_AGE)

  const text = buildTranscript(lead, all, s.slack_transcript_count || 0)
  if (!(await postToThread(text, anchorTs))) return 'fail:slack'

  await supabase.from('talk_sessions').update({
    slack_transcript_at: new Date().toISOString(),
    slack_transcript_count: all.length,
  }).eq('id', s.id)
  return 'sent:thread'
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('SPAR_CRON_SECRET') || ''
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
  }
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* cron bez body */ }

  // tryb testowy: konkretna sesja (także is_test), bez warunku ciszy
  if (body.session_id) {
    const { data: s } = await supabase.from('talk_sessions').select('*').eq('id', body.session_id).maybeSingle()
    if (!s) return new Response(JSON.stringify({ error: 'sesja_nie_istnieje' }), { status: 404 })
    const r = await processSession(s)
    return new Response(JSON.stringify({ result: r }), { status: 200 })
  }

  const cutoff = new Date(Date.now() - SILENCE_MIN * 60_000).toISOString()
  const oldest = new Date(Date.now() - MAX_AGE_H * 3600_000).toISOString()
  const { data: sessions } = await supabase.from('talk_sessions')
    .select('*')
    .eq('is_test', false)
    .not('last_seen_at', 'is', null)
    .lt('last_seen_at', cutoff)
    .gt('last_seen_at', oldest)
    .order('last_seen_at', { ascending: true })
    .limit(BATCH * 4)

  const results: Record<string, string> = {}
  let processed = 0
  for (const s of sessions || []) {
    if (processed >= BATCH) break
    // szybki filtr: bez nowych wiadomości nie ruszamy (count sprawdzi processSession dokładnie)
    if (s.slack_transcript_at && s.last_seen_at <= s.slack_transcript_at) continue
    const r = await processSession(s)
    results[s.id] = r
    if (r.startsWith('sent')) processed++
  }
  return new Response(JSON.stringify({ processed, results }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
