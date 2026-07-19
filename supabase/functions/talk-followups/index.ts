// talk-followups — followupy mailowe lejka /rozmowa (lead-talk).
//
// SERIA DLA LEADÓW BEZ WYSTAWIONEJ OFERTY (talk_sessions.offer_token IS NULL);
// leady z ofertą obsłuży osobna, przyszła seria. Dwie podgrupy w jednej osi:
//   B) rozmawiał z AI i ucichł  → personalizacja z TRANSKRYPTU + ankiety,
//   A) zarejestrował się na /zapisy i NIE wszedł w rozmowę → personalizacja
//      z ankiety + zaproszenie do rozmowy.
//
// Oś: 5 maili od „kotwicy" (ostatnia aktywność w rozmowie albo rejestracja):
//   talk_followup_1  +3 h    miękki powrót (recap + jedno pytanie, bez ceny)
//   talk_followup_2  +24 h   rozbrojenie głównej obiekcji z rozmowy
//   talk_followup_3  +72 h   dowód + opłacalność (bez żargonu, bez gwarancji)
//   talk_followup_4  +168 h  jedno jasne CTA (dokończ rozmowę → oferta)
//   talk_followup_5  +336 h  break-up (krótki, drzwi otwarte)
// Kotwica PRZESUWA SIĘ, gdy lead wraca do rozmowy → seria naturalnie czeka.
//
// TREŚĆ: generowana JUST-IN-TIME (przy wysyłce) przez model TALK_FOLLOWUP_MODEL
// (default gpt-5.6) — świeży kontekst, zero pre-generowanych draftów. BRAK
// statycznego fallbacku: gdy LLM padnie, mail NIE wychodzi (retry następny
// przebieg) — celowo, Tomek nie chce szablonów.
// Fundament + cel per krok = settings (rozmowa_followup_system, _krok1..5),
// edytowalne w crm/settings, wchodzą w najbliższym przebiegu crona.
//
// WYSYŁKA: edge send-email (stopka Tomka doklejana automatycznie, from/reply-to
// ceo@, List-Unsubscribe przez unsubscribe:true) z email_type='talk_followup_N'
// → mail ląduje w email_messages i jest widoczny w lead.html (sekcja E-mail).
//
// ⚠️ FLAGA: realna wysyłka wymaga settings talk_followups_enabled === 'true'
// (FAIL-CLOSED). Bez flagi cron tylko loguje kandydatów (skipped_flag_off) —
// NIE claimuje, więc po włączeniu flagi maile generują się świeżo.
//
// ⚠️ DEPLOY: npx supabase functions deploy talk-followups --no-verify-jwt
// Cron: pg_cron 'talk-followups-cron' co 30 min z x-cron-secret==SPAR_CRON_SECRET
// i JAWNYM timeout_milliseconds (pg_net default 5 s ubija edge!).
//
// Akcje admin (x-admin-secret==SPAR_CRON_SECRET lub JWT team_members):
//   {action:'preview',  lead_id, kind?}      → generuje treść bez wysyłki (html 1:1 ze stopką)
//   {action:'send_test', lead_id, kind?, to} → generuje i wysyła na WSKAZANY adres (nie do leada)
//   {action:'status',   lead_id}             → stan serii leada

import { createClient } from "jsr:@supabase/supabase-js@2";

const TALK_URL_BASE = 'https://tomekniedzwiecki.pl/rozmowa/?lid='
const KINDS = ['talk_followup_1', 'talk_followup_2', 'talk_followup_3', 'talk_followup_4', 'talk_followup_5']
const THRESH_H = [3, 24, 72, 168, 336]
// Minimalny odstęp od POPRZEDNIEGO maila serii (delta progów). Bez tego leady z
// zaległą kotwicą (np. rejestracja sprzed 3 tyg.) mają „spełnione" wszystkie progi
// naraz i seria skompresowałaby się do rytmu bramki 10 h.
const MIN_SPACING_H = [0, 21, 48, 96, 168]
const MAX_START_AGE_H = 30 * 24      // nie zaczynaj serii, gdy kotwica starsza niż 30 dni
const CHANNEL_GAP_MS = 10 * 3600 * 1000
const MAX_PER_RUN = 6
const DAILY_CAP = 60                 // twardy sufit wysyłek/dobę (higiena reputacji domeny)
const DEADLINE_MS = 300_000          // soft-deadline (edge wall-clock 400 s)
const HISTORY_CAP = 30               // wypowiedzi rozmowy podawanych modelowi
const OPENAI_MODEL = Deno.env.get('TALK_FOLLOWUP_MODEL') || 'gpt-5.6'
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || ''

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

function warsawHour(): number {
  return parseInt(new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false,
  }).format(new Date()), 10)
}

function cleanStr(s: unknown, max = 900): string {
  return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, max).trim()
}
function escHtml(s: string): string { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// Markery rozmowy (chipy/fazy/rezerwacja) — wycinane z transkryptu przed podaniem modelowi.
function stripMarkers(s: string): string {
  return String(s || '')
    .replace(/<faza>[\s\S]*?<\/faza>/gi, '')
    .replace(/<\/?(faza|rezerwacja)\s*\/?>/gi, '')
    .replace(/<opcje>[\s\S]*?(<\/opcje>|$)/gi, '')
    .replace(/\n{3,}/g, '\n\n').trim()
}

// Body (zwykły tekst od GPT) → minimalny HTML „jak pisany w skrzynce".
// Jedyny dopuszczalny link = token [tekst](LINK_ROZMOWA); inne linki wycinane
// (model NIE może wstawiać własnych URL-i). Stopka dokleja się w send-email.
function mdToHtml(body: string, talkUrl: string): string {
  let t = escHtml(body || '')
  t = t.replace(/\[([^\]]+)\]\(LINK_ROZMOWA\)/g, (_m, l) => `<a href="${talkUrl}" style="color:#2563eb;">${l}</a>`)
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  if (t.indexOf(talkUrl) < 0) t += `\n\nWrócisz do rozmowy tutaj: <a href="${talkUrl}" style="color:#2563eb;">${talkUrl}</a>`
  const paras = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const inner = paras.map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br>')}</p>`).join('')
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">${inner}</div>`
}

// ── Kontekst leada z ankiety /zapisy (lustro lead-talk) ──────────────────────
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
    if (tried) parts.push(`Co już próbował w biznesie online: ${tried}`)
  }
  if (lead.current_income) parts.push(`Obecny dochód mies.: ${cleanStr(lead.current_income, 20)}`)
  if (lead.budget) parts.push(`Deklarowany budżet na start: ${cleanStr(lead.budget, 30)} zł`)
  if (lead.weekly_hours) parts.push(`Czas tygodniowo na biznes: ${cleanStr(lead.weekly_hours, 20)}`)
  const about = cleanStr(lead.experience || lead.open_question, 900)
  if (about) parts.push(`„O sobie" (własne słowa leada):\n"""${about}"""`)
  return parts.join('\n') || 'Brak danych z ankiety (tylko email).'
}

// Stemple faz/obiekcji z talk_sessions.tags → ludzkie sygnały dla modelu.
const TAG_LABELS: Record<string, string> = {
  obj_scam: 'obawa „czy to nie oszustwo"',
  obj_chiny_ai: 'obiekcja „produkty z Chin / wszystko robi AI"',
  obj_pieniadze: 'obiekcja finansowa (brak środków)',
  obj_wedka_ryba: 'pytał(a), czy nauczy się prowadzić biznes samodzielnie',
  wahanie_cena: 'zawahał(a) się po poznaniu ceny',
  raty_temat: 'pytał(a) o raty',
  pytanie_o_zarobki: 'pytał(a) o możliwe zarobki',
  pytanie_o_cene: 'pytał(a) o cenę',
  faza_okno_rezerwacji: 'dotarł(a) do propozycji rezerwacji, ale nie kliknął/-ęła',
  faza_warunki_cena: 'poznał(a) cenę i warunki współpracy',
  faza_ratunek: 'dostał(a) propozycję startu ratalnego od 2000 zł',
  lead_zimny_dojrzewanie: 'zakończył(a) rozmowę w trybie „muszę to przemyśleć"',
  powrot_z_oferty: 'był(a) na stronie oferty i wrócił(a) bez rezerwacji',
  wyzwalacz_zyciowy: 'wspomniał(a) o życiowej motywacji do zmiany',
  faza_model: 'poznawał(a) model współpracy z Tomkiem',
  faza_wizja: 'rozmowa o wizji i zarobkach',
  faza_diagnoza: 'etap diagnozy sytuacji',
  profil_swiezy: 'ledwo zaczął/zaczęła rozmowę i odbił(a)',
}
// deno-lint-ignore no-explicit-any
function sessionSignals(sess: any): string {
  const tags: string[] = Array.isArray(sess?.tags) ? sess.tags.map((t: { t?: string }) => String(t?.t || '')) : []
  const uniq = [...new Set(tags)].filter(Boolean)
  const labeled = uniq.map((t) => TAG_LABELS[t] || null).filter(Boolean) as string[]
  return labeled.join('; ')
}

// ── OpenAI (wzorzec lead-talk: retry 429/5xx, insufficient_quota fast-fail) ──
// deno-lint-ignore no-explicit-any
async function openaiFetch(body: Record<string, unknown>): Promise<any> {
  if (!OPENAI_KEY) throw new Error('brak OPENAI_API_KEY')
  let lastErr: Error | null = null
  for (let i = 0; i < 3; i++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(body),
    })
    if (res.ok) return await res.json()
    const txt = await res.text().catch(() => '')
    if (txt.includes('insufficient_quota')) throw new Error('insufficient_quota')
    lastErr = new Error(`OpenAI ${res.status}: ${txt.slice(0, 300)}`)
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 800 * (i + 1))); continue }
    throw lastErr
  }
  throw lastErr || new Error('OpenAI: nieznany błąd')
}

// ── Generacja treści maila (JIT, zero szablonów) ─────────────────────────────
// deno-lint-ignore no-explicit-any
async function generateMail(supabase: any, prompts: Record<string, string>, lead: any, sess: any, kindIdx: number): Promise<{ subject: string; body: string }> {
  const system = `${prompts.rozmowa_followup_system}\n\n=== CEL TEGO MAILA (krok ${kindIdx + 1}/5) ===\n${prompts['rozmowa_followup_krok' + (kindIdx + 1)]}`

  // transkrypt rozmowy (jeśli była) + wiek kotwicy (model dopasowuje naturalność po czasie)
  let talkBlock = 'Lead NIE rozpoczął jeszcze rozmowy z AI Tomka — jedyny kontekst to ankieta. CTA maila = zacznij rozmowę (dostanie w niej konkretny plan i wycenę, bez zobowiązań).'
  let anchorMs = Date.parse(lead.created_at || '') || 0
  if (sess) {
    const { data: msgs } = await supabase.from('talk_messages')
      .select('role, content, created_at').eq('session_id', sess.id).order('id', { ascending: true }).limit(500)
    const history = (msgs || []) as { role: string; content: string; created_at?: string }[]
    for (const m of history) {
      if (m.role === 'user') anchorMs = Math.max(anchorMs, Date.parse(m.created_at || '') || 0)
    }
    anchorMs = Math.max(anchorMs, Date.parse(sess.last_seen_at || '') || 0, Date.parse(sess.created_at || '') || 0)
    const userCnt = history.filter((m) => m.role === 'user').length
    if (userCnt > 0) {
      const transcript = history.slice(-HISTORY_CAP)
        .map((m) => (m.role === 'user' ? 'LEAD: ' : 'AI: ') + cleanStr(stripMarkers(m.content), 400))
        .filter((l) => l.replace(/^(LEAD|AI): /, '').length > 1).join('\n')
      const signals = sessionSignals(sess)
      talkBlock = [
        signals ? `Wykryte sygnały z rozmowy: ${signals}.` : null,
        `TRANSKRYPT (ostatnie wypowiedzi, chronologicznie):\n${transcript}`,
      ].filter(Boolean).join('\n')
    } else {
      talkBlock = 'Lead otworzył rozmowę z AI Tomka, ale NIC nie napisał (zobaczył tylko otwarcie). Traktuj jak brak rozmowy — CTA = wróć i odpisz.'
    }
  }

  // wcześniejsze maile serii — zakaz powtórzeń
  const { data: prev } = await supabase.from('talk_followups')
    .select('kind, subject, body_text').eq('lead_id', lead.id).eq('status', 'sent').order('sent_at', { ascending: true }).limit(10)
  const prevBlock = (prev || []).length
    ? (prev as { kind: string; subject: string; body_text: string }[])
        .map((p, i) => `${i + 1}. Temat: „${cleanStr(p.subject, 90)}" — treść (skrót): ${cleanStr(p.body_text, 280)}`).join('\n')
    : 'brak (to pierwszy mail serii)'

  const ageH = anchorMs ? Math.round((Date.now() - anchorMs) / 3_600_000) : 0
  const ageStr = !anchorMs ? 'nieznany' : ageH < 48 ? `${ageH} godz.` : `${Math.round(ageH / 24)} dni`
  const user = [
    `DANE LEADA Z ANKIETY /zapisy:\n${leadContext(lead)}`,
    `CZAS OD OSTATNIEJ AKTYWNOŚCI LEADA (rozmowa/rejestracja): ${ageStr} temu — dopasuj do tego naturalność (świeże = nawiąż wprost; po tygodniach NIE udawaj, że zgłoszenie „właśnie dotarło" — nawiąż uczciwie po czasie).`,
    `STAN ROZMOWY Z AI:\n${talkBlock}`,
    `WCZEŚNIEJSZE MAILE TEJ SERII (NIE powtarzaj ich treści, argumentów ani tematów):\n${prevBlock}`,
    `LINK: dokładnie JEDEN link w treści, wyłącznie tokenem [tekst kotwicy](LINK_ROZMOWA) — prowadzi z powrotem do TEJ SAMEJ rozmowy (zapisany stan, lead wraca w to samo miejsce). Nie wypisuj żadnych innych URL-i.`,
  ].join('\n\n')

  const j = await openaiFetch({
    model: OPENAI_MODEL,
    response_format: { type: 'json_object' },
    max_completion_tokens: 2000,
    reasoning_effort: 'medium',
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  })
  const raw = j?.choices?.[0]?.message?.content || ''
  let parsed: { subject?: unknown; body?: unknown }
  try { parsed = JSON.parse(raw) } catch { throw new Error('LLM: nieparsowalny JSON') }
  const subject = cleanStr(parsed.subject, 90).replace(/[\r\n]+/g, ' ').trim()
  const body = String(parsed.body ?? '').replace(/\r/g, '').trim()
  if (subject.length < 3 || subject.length > 80) throw new Error(`LLM: zły temat (${subject.length} zn)`)
  if (body.length < 120 || body.length > 1800) throw new Error(`LLM: złe body (${body.length} zn)`)
  return { subject, body }
}

// Podgląd 1:1 — finalny HTML ze stopką (send-email preview), bez wysyłki.
async function withSignature(SUPABASE_URL: string, SERVICE_KEY: string, subject: string, html: string): Promise<string> {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ to: 'podglad@example.com', subject, html, preview: true }),
    })
    if (r.ok) { const j = await r.json(); if (j && typeof j.html === 'string') return j.html }
  } catch { /* ignore */ }
  return html
}

const LEAD_COLS = 'id, name, email, phone, direction, current_income, budget, weekly_hours, experience, open_question, created_at, followups_muted_at'
const SESS_COLS = 'id, lead_id, offer_token, last_seen_at, last_phase, tags, turns, is_test, created_at'
const PROMPT_KEYS = ['rozmowa_followup_system', 'rozmowa_followup_krok1', 'rozmowa_followup_krok2', 'rozmowa_followup_krok3', 'rozmowa_followup_krok4', 'rozmowa_followup_krok5']

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  const t0 = Date.now()
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500)
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // Gate: cron = x-cron-secret; admin (panel/testy) = x-admin-secret LUB JWT team_members.
    const cronSecret = Deno.env.get('SPAR_CRON_SECRET')
    const isCron = !!(cronSecret && req.headers.get('x-cron-secret') === cronSecret)
    let isAdmin = !!(cronSecret && req.headers.get('x-admin-secret') === cronSecret)
    let body: { action?: string; lead_id?: string; kind?: string; to?: string } = {}
    try { body = await req.json() } catch { /* cron bez body */ }
    if (!isAdmin && !isCron) {
      const auth = req.headers.get('Authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (token && token !== SERVICE_KEY) {
        try { const { data: u } = await supabase.auth.getUser(token); if (u?.user?.id) isAdmin = true } catch { /* nie-admin */ }
      } else if (token === SERVICE_KEY) isAdmin = true
    }
    if (!isCron && !isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)

    // settings: flaga + prompty (bez cache — cron i tak chodzi co 30 min)
    const { data: settingsRows } = await supabase.from('settings')
      .select('key, value').in('key', ['talk_followups_enabled', ...PROMPT_KEYS])
    const settings: Record<string, string> = {}
    for (const r of (settingsRows || []) as { key: string; value: string }[]) settings[r.key] = r.value
    const ENABLED = settings.talk_followups_enabled === 'true'
    const promptsReady = PROMPT_KEYS.every((k) => (settings[k] || '').trim().length > 40)

    // ── Akcje admina ─────────────────────────────────────────────────────────
    if (isAdmin && (body.action === 'preview' || body.action === 'send_test' || body.action === 'status')) {
      if (!body.lead_id) return jsonResponse({ error: 'brak_lead_id' }, 400)
      const { data: lead } = await supabase.from('leads').select(LEAD_COLS).eq('id', body.lead_id).maybeSingle()
      if (!lead) return jsonResponse({ error: 'brak_leada' }, 404)
      const { data: sess } = await supabase.from('talk_sessions').select(SESS_COLS).eq('lead_id', body.lead_id).maybeSingle()
      const { data: rows } = await supabase.from('talk_followups')
        .select('kind, status, subject, sent_at, created_at').eq('lead_id', body.lead_id).order('created_at')

      if (body.action === 'status') {
        return jsonResponse({ ok: true, enabled: ENABLED, session_id: sess?.id || null, offer_token: !!sess?.offer_token, rows: rows || [] }, 200)
      }
      if (!promptsReady) return jsonResponse({ error: 'prompty_niekompletne', missing: PROMPT_KEYS.filter((k) => !(settings[k] || '').trim()) }, 500)
      const sentCnt = (rows || []).filter((r: { status: string }) => r.status === 'sent').length
      const kindIdx = body.kind && KINDS.includes(body.kind) ? KINDS.indexOf(body.kind) : Math.min(sentCnt, KINDS.length - 1)
      const { subject, body: mailBody } = await generateMail(supabase, settings, lead, sess || null, kindIdx)
      const talkUrl = `${TALK_URL_BASE}${lead.id}`
      const html = mdToHtml(mailBody, talkUrl)

      if (body.action === 'preview') {
        const full = await withSignature(SUPABASE_URL, SERVICE_KEY, subject, html)
        return jsonResponse({ ok: true, kind: KINDS[kindIdx], subject, body: mailBody, html: full }, 200)
      }
      // send_test → na wskazany adres, BEZ lead_id (nie zaśmieca historii leada)
      const to = cleanStr(body.to, 120)
      if (!to || !to.includes('@')) return jsonResponse({ error: 'brak_adresu_to' }, 400)
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ to, subject, html, email_type: 'talk_followup_test' }),
      })
      if (!res.ok) return jsonResponse({ error: `send-email ${res.status}: ${await res.text()}` }, 502)
      return jsonResponse({ ok: true, kind: KINDS[kindIdx], subject, to }, 200)
    }

    // ── Przebieg crona ───────────────────────────────────────────────────────
    const now = Date.now()
    const hour = warsawHour()
    const out: Record<string, number> = { sent: 0, skipped_flag_off: 0, cancelled: 0, errors: 0, candidates: 0 }
    if (hour < 8 || hour >= 21) return jsonResponse({ ok: true, window: 'closed', hour }, 200)
    if (!promptsReady) return jsonResponse({ ok: false, error: 'prompty_niekompletne — uzupełnij w crm/settings' }, 200)

    // Kandydaci: realne sesje talk + leady website (30 dni) z emailem.
    const { data: sessAll } = await supabase.from('talk_sessions').select(SESS_COLS).eq('is_test', false).limit(2000)
    const sessions = (sessAll || []) as Record<string, unknown>[]
    // deno-lint-ignore no-explicit-any
    const sessByLead = new Map<string, any>()
    for (const s of sessions) sessByLead.set(String(s.lead_id), s)

    const since30d = new Date(now - MAX_START_AGE_H * 3600 * 1000).toISOString()
    const { data: leadsWeb } = await supabase.from('leads').select(LEAD_COLS)
      .eq('lead_source', 'website').not('email', 'is', null).neq('email', '').gte('created_at', since30d).limit(1000)
    // deno-lint-ignore no-explicit-any
    const leadById = new Map<string, any>()
    for (const l of (leadsWeb || [])) leadById.set(String(l.id), l)
    const missingIds = [...sessByLead.keys()].filter((id) => !leadById.has(id))
    if (missingIds.length) {
      const { data: extra } = await supabase.from('leads').select(LEAD_COLS).in('id', missingIds).limit(1000)
      for (const l of (extra || [])) {
        if (l.email && String(l.email).includes('@')) leadById.set(String(l.id), l)
      }
    }
    const leadIds = [...leadById.keys()]
    if (!leadIds.length) return jsonResponse({ ok: true, ...out }, 200)

    // Ostatnia wiadomość USERA per sesja (kotwica ciszy).
    const sessIds = sessions.map((s) => String(s.id))
    const lastUserBySess = new Map<string, number>()
    if (sessIds.length) {
      const { data: umsgs } = await supabase.from('talk_messages')
        .select('session_id, created_at').eq('role', 'user').in('session_id', sessIds)
        .order('created_at', { ascending: false }).limit(5000)
      for (const m of (umsgs || []) as { session_id: string; created_at: string }[]) {
        if (!lastUserBySess.has(m.session_id)) lastUserBySess.set(m.session_id, Date.parse(m.created_at) || 0)
      }
    }

    // Dotyki serii (talk_followups) per lead.
    const touches = new Map<string, { sentKinds: Set<string>; lastSent: number }>()
    {
      const { data: tf } = await supabase.from('talk_followups')
        .select('lead_id, kind, status, sent_at').in('lead_id', leadIds).limit(5000)
      for (const r of (tf || []) as { lead_id: string; kind: string; status: string; sent_at: string | null }[]) {
        const t = touches.get(r.lead_id) || { sentKinds: new Set<string>(), lastSent: 0 }
        if (r.status === 'sent') {
          t.sentKinds.add(r.kind)
          const ts = r.sent_at ? Date.parse(r.sent_at) : 0
          if (ts > t.lastSent) t.lastSent = ts
        }
        touches.set(r.lead_id, t)
      }
    }

    // Ostatni outbound mail do leada (bramka między-dotykowa 10 h) — okno 24 h wystarcza.
    const lastMailByLead = new Map<string, number>()
    {
      const { data: em } = await supabase.from('email_messages')
        .select('lead_id, created_at').eq('direction', 'outbound').in('lead_id', leadIds)
        .gte('created_at', new Date(now - 24 * 3600 * 1000).toISOString()).limit(2000)
      for (const m of (em || []) as { lead_id: string; created_at: string }[]) {
        const ts = Date.parse(m.created_at) || 0
        if (ts > (lastMailByLead.get(m.lead_id) || 0)) lastMailByLead.set(m.lead_id, ts)
      }
    }
    // Bramka reputacji: mail #3+ wymaga ≥1 DOSTARCZONEGO wcześniejszego followupu
    // (otwarcia w Resend są OFF — liczy się wyłącznie delivered_at).
    const deliveredLeads = new Set<string>()
    {
      const { data: dm } = await supabase.from('email_messages')
        .select('lead_id, delivered_at').like('email_type', 'talk_followup%').in('lead_id', leadIds)
        .not('delivered_at', 'is', null).limit(2000)
      for (const m of (dm || []) as { lead_id: string }[]) deliveredLeads.add(m.lead_id)
    }
    // Opłacone zamówienia → twardy stop serii.
    const paidLeads = new Set<string>()
    {
      const { data: po } = await supabase.from('orders')
        .select('lead_id').eq('status', 'paid').in('lead_id', leadIds).limit(2000)
      for (const o of (po || []) as { lead_id: string }[]) if (o.lead_id) paidLeads.add(o.lead_id)
    }

    async function cancelPending(leadId: string) {
      const { count } = await supabase.from('talk_followups')
        .update({ status: 'cancelled' }, { count: 'exact' }).eq('lead_id', leadId).eq('status', 'pending')
      if (count) out.cancelled += count
    }

    // Najstarsza cisza pierwsza.
    // deno-lint-ignore no-explicit-any
    const anchored: { lead: any; sess: any; anchorMs: number }[] = []
    for (const lead of leadById.values()) {
      const sess = sessByLead.get(String(lead.id)) || null
      const anchorMs = sess
        ? Math.max(lastUserBySess.get(String(sess.id)) || 0, Date.parse(sess.last_seen_at || '') || 0, Date.parse(sess.created_at || '') || 0)
        : (Date.parse(lead.created_at || '') || 0)
      if (anchorMs) anchored.push({ lead, sess, anchorMs })
    }
    anchored.sort((a, b) => a.anchorMs - b.anchorMs)

    // dzienny sufit: ile followupów już wyszło dziś (od północy Warszawy w przybliżeniu UTC-dnia)
    let mailBudget = MAX_PER_RUN
    {
      const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0)
      const { count: sentToday } = await supabase.from('talk_followups')
        .select('id', { count: 'exact', head: true }).eq('status', 'sent').gte('sent_at', dayStart.toISOString())
      if ((sentToday || 0) >= DAILY_CAP) mailBudget = 0
      else mailBudget = Math.min(MAX_PER_RUN, DAILY_CAP - (sentToday || 0))
    }
    for (const { lead, sess, anchorMs } of anchored) {
      if (mailBudget <= 0 || Date.now() - t0 > DEADLINE_MS) break
      const id = String(lead.id)
      if (lead.followups_muted_at) continue
      if (paidLeads.has(id)) { await cancelPending(id); continue }
      if (sess?.offer_token) { await cancelPending(id); continue } // dostał ofertę → inna seria (przyszła)

      const hoursSince = (now - anchorMs) / 3_600_000
      if (hoursSince < THRESH_H[0]) continue // świeża aktywność — może wciąż rozmawia
      const t = touches.get(id)
      const sentCnt = KINDS.filter((k) => t?.sentKinds.has(k)).length
      if (sentCnt >= KINDS.length) continue
      if (sentCnt === 0 && hoursSince > MAX_START_AGE_H) continue // za stare, nie zaczynaj
      if (hoursSince < THRESH_H[sentCnt]) continue                // za wcześnie na kolejny
      if (sentCnt > 0 && t?.lastSent && now - t.lastSent < MIN_SPACING_H[sentCnt] * 3_600_000) continue // rytm serii
      if (t?.lastSent && now - t.lastSent < CHANNEL_GAP_MS) continue
      const lastMail = lastMailByLead.get(id) || 0
      if (lastMail && now - lastMail < CHANNEL_GAP_MS) continue   // świeży inny mail (np. zapisy_confirmation)
      if (sentCnt >= 2 && !deliveredLeads.has(id)) continue       // reputacja: nic nie doszło → nie dosyłaj

      out.candidates++
      if (!ENABLED) { out.skipped_flag_off++; continue }

      // claim-before-send (UNIQUE lead_id,kind); pusty wynik = już claimowane.
      const kind = KINDS[sentCnt]
      const { data: claim, error: claimErr } = await supabase.from('talk_followups')
        .upsert([{ lead_id: id, session_id: sess?.id || null, kind }], { onConflict: 'lead_id,kind', ignoreDuplicates: true })
        .select('id')
      if (claimErr) { console.error('[talk-followups] claim:', claimErr); out.errors++; continue }
      if (!claim || !claim.length) continue

      try {
        const { subject, body: mailBody } = await generateMail(supabase, settings, lead, sess, sentCnt)
        const talkUrl = `${TALK_URL_BASE}${id}`
        const html = mdToHtml(mailBody, talkUrl)
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
          // unsubscribe:true → List-Unsubscribe; email_type → rozróżnialne w email_messages/lead.html
          body: JSON.stringify({ to: lead.email, subject, html, lead_id: id, unsubscribe: true, email_type: kind }),
        })
        if (!res.ok) throw new Error(`send-email ${res.status}: ${await res.text()}`)
        let resendId: string | null = null
        try { const j = await res.json(); resendId = j?.id || j?.resend_id || j?.data?.id || null } catch { /* ignoruj */ }
        await supabase.from('talk_followups')
          .update({ subject, body_text: mailBody, html, status: 'sent', sent_at: new Date().toISOString(), resend_id: resendId })
          .eq('lead_id', id).eq('kind', kind)
        mailBudget--; out.sent++
      } catch (e) {
        // rollback claimu → retry w następnym przebiegu; ZERO statycznego fallbacku.
        console.error(`[talk-followups] ${kind} dla ${id}:`, e)
        await supabase.from('talk_followups').delete().eq('lead_id', id).eq('kind', kind)
        out.errors++
        if (String(e).includes('insufficient_quota')) break // OpenAI leży — nie młóć reszty
      }
    }

    return jsonResponse({ ok: true, enabled: ENABLED, ...out }, 200)
  } catch (e) {
    console.error('[talk-followups] fatal:', e)
    return jsonResponse({ error: String(e) }, 500)
  }
})
