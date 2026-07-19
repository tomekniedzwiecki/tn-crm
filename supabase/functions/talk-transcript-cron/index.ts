// talk-transcript-cron — po zakończonej rozmowie AI (lead wyszedł z okna i nie wrócił
// przez ≥3 min) wysyła TRANSKRYPCJĘ do wątku Slack pod powiadomieniem o tym leadzie.
// Kolejna aktywność + kolejna cisza → dosyłka „ciąg dalszy" (tylko delta) w tym samym wątku.
//
// Detekcja ciszy: talk_sessions.last_seen_at (front pinguje co 30 s tylko przy widocznej karcie).
// Wątek: leads.slack_ts + slack_channel (zapisywane przez slack-notify w trybie bota).
// Tryby wysyłki: (1) SLACK_BOT_TOKEN + leads.slack_ts → chat.postMessage w wątku;
// (2) SLACK_BOT_TOKEN bez ts (stary lead) → nowa wiadomość w SLACK_LEADS_CHANNEL,
//     jej ts zapisujemy do leads → dosyłki trafią już w wątek;
// (3) bez bota → fallback: incoming webhook slack_webhook_new_lead (bez wątku).
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
const WEBHOOK_FALLBACK = Deno.env.get('slack_webhook_new_lead') || ''
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

async function postToSlack(text: string, channel: string | null, threadTs: string | null):
  Promise<{ ok: boolean; ts?: string; channel?: string; via: string }> {
  if (BOT && (threadTs ? channel : LEADS_CHANNEL)) {
    const body: Record<string, unknown> = {
      channel: threadTs ? channel : LEADS_CHANNEL,
      text,
      unfurl_links: false,
    }
    if (threadTs) body.thread_ts = threadTs
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${BOT}`, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    })
    const j = await res.json().catch(() => null)
    if (j?.ok) return { ok: true, ts: j.ts, channel: j.channel, via: threadTs ? 'thread' : 'bot' }
    console.error('[talk-transcript] slack bot fail', j?.error)
  }
  if (WEBHOOK_FALLBACK) {
    const res = await fetch(WEBHOOK_FALLBACK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (res.ok) return { ok: true, via: 'webhook' }
  }
  return { ok: false, via: 'none' }
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

  const text = buildTranscript(lead, all, s.slack_transcript_count || 0)
  const sent = await postToSlack(text, lead.slack_channel, lead.slack_ts)
  if (!sent.ok) return 'fail:slack'

  // start wątku dla starych leadów bez kotwicy — kolejne dosyłki trafią w wątek
  if (sent.via === 'bot' && sent.ts) {
    await supabase.from('leads').update({ slack_ts: sent.ts, slack_channel: sent.channel }).eq('id', lead.id)
  }
  await supabase.from('talk_sessions').update({
    slack_transcript_at: new Date().toISOString(),
    slack_transcript_count: all.length,
  }).eq('id', s.id)
  return `sent:${sent.via}`
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
