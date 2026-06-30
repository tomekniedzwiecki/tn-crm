// bud-followups — follow-upy mailowe lejka /sklep „Zbuduję" (wersja ODCHUDZONA).
//
// Fork spar-followups, OKROJONY do dwóch rzeczy:
//   1) SEKWENCJA PORZUCONEJ ROZMOWY (przed raportem): 3 maile
//      (abandoned_chat / _2 / _3) w progach 3h/24h/48h od last_user_at + SMS
//      powrotu (abandoned_sms) na +72h. Cała trójka + SMS pre-generowane JEDNYM
//      callem GPT i zapisane w bud_abandoned_emails (pending→sent); cron wysyła
//      dokładnie zapisaną treść.
//   2) paid_welcome — raz po wykryciu rezerwacji (paid_at w ciągu 72h).
//
// CELOWO USUNIĘTE z forka spar-followups (NIE przenosić):
//   • SYNC PŁATNOŚCI z orders → paid_at — robi to już tpay-webhook (bud_sessions
//     paid_at/full_paid_at). Duplikat = ryzyko rozjazdu.
//   • SYNC PEŁNEJ PŁATNOŚCI (full_paid_at + know-how) — j.w., tpay-webhook.
//   • Sekwencja reveal/odsłon (raport/makiety/reklamy/strona/rezerwacja) — to
//     domena bud-drip (REVEAL_PLAN). Tu obsługujemy WYŁĄCZNIE leady, które
//     porzucili PRZED raportem (market_report IS NULL) — żeby NIE dublować dripu.
//   • nurture_* (pielęgnacja zielonych) — nieobecne w lejku /sklep.
//   • verdict_no_payment / verdict_last_call / komplet_gotowy — j.w.
//   • SMS „powrotu z ekranu" (sms_badanie_back / sms_ekrany_back, beacon
//     left_screen_at) — nie przenoszone do odchudzonej wersji.
//
// ⚠️ FLAGA BEZPIECZEŃSTWA (KRYTYCZNE): realna wysyłka maila wymaga
//    BUD_FOLLOWUPS_ENABLED==='1'; SMS dodatkowo SMS_ENABLED==='1'. Bez flagi:
//    generowanie / preview / seed (zapis pending) DZIAŁAJĄ normalnie (smoke bez
//    wysyłki), ale realnej wysyłki NIE ma (log 'BUD_FOLLOWUPS_ENABLED off — skip send').
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (wołane przez pg_cron + pg_net):
//   npx supabase functions deploy bud-followups --no-verify-jwt
//
// Cron sekret: SPAR_CRON_SECRET (współdzielony). Wysyłka maili: send-email
// (bez zmian). SMS: send-sms (bez zmian).

import { createClient } from "jsr:@supabase/supabase-js@2";

const PANEL_URL = 'https://tomekniedzwiecki.pl/sklep/'
const RESERVE_URL = 'https://crm.tomekniedzwiecki.pl/checkout'
const MAX_PER_RUN = 30

// Sekwencja powrotu (rozmowa W TOKU, przed raportem): 3 maile, progi w GODZINACH
// od ostatniej aktywności. Treść generowana RAZ (jeden prompt → 3 maile + SMS) i
// zapisana w bud_abandoned_emails jako „do wysłania"; cron wysyła zapisaną treść.
const ABANDON_KINDS = ['abandoned_chat', 'abandoned_chat_2', 'abandoned_chat_3']
const ABANDON_THRESH_H = [3, 24, 48]
// SMS „powrotu" — godziny od ostatniej aktywności (24h po ostatnim mailu #3 +48h).
const ABANDON_SMS_THRESH_H = 72

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// Koszt SMS = liczba segmentów (points z SMSAPI) × 0,10 zł. bud_usage trzyma koszt w USD,
// więc przeliczamy bieżącym kursem z settings.usd_pln_rate (ten sam, którym panel wyświetla).
const SMS_PLN_PER_POINT = 0.10
let _usdPln: number | null = null
async function usdPlnRate(supabase: ReturnType<typeof createClient>): Promise<number> {
  if (_usdPln != null) return _usdPln
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', 'usd_pln_rate').maybeSingle()
    const v = data && (data as { value?: unknown }).value
    _usdPln = v ? Number(v) : 4.0
  } catch { _usdPln = 4.0 }
  return _usdPln && _usdPln > 0 ? _usdPln : 4.0
}

function warsawHour(): number {
  return parseInt(new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false,
  }).format(new Date()), 10)
}

const OPENAI_MODEL = Deno.env.get('BUD_EMAIL_MODEL') || 'gpt-5.5'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }
// Bramki realnej wysyłki. BUD_FOLLOWUPS_ENABLED gatuje EMAIL (i pośrednio cały
// blok SMS — bo SMS bez maili nie ma sensu); SMS_ENABLED to druga, niezależna
// bramka SMS (send-sms ma jeszcze własną). Gdy '0'/brak — generujemy i zapisujemy
// pending, ale realnie NIE wysyłamy.
const FOLLOWUPS_ENABLED = (Deno.env.get('BUD_FOLLOWUPS_ENABLED') || '') === '1'
const SMS_ENABLED = (Deno.env.get('SMS_ENABLED') || '') === '1'

function panelLink(sessionId: string, campaign: string, hash = ''): string {
  return `${PANEL_URL}?id=${sessionId}&utm_source=email&utm_medium=followup&utm_campaign=${campaign}${hash}`
}
function reserveLink(leadId: string | null): string {
  return `${RESERVE_URL}?utm_source=email&utm_medium=followup${leadId ? `&lead=${encodeURIComponent(leadId)}` : ''}`
}

// GSM-7 safe: transliteracja znaków spoza podstawowego GSM (polskie diakrytyki,
// typograficzne cudzysłowy/myślniki/…), które inaczej wymuszają UCS-2 (drożej).
const GSM_MAP: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  '„': '"', '”': '"', '“': '"', '‟': '"', '«': '"', '»': '"',
  '‚': "'", '’': "'", '‘': "'", '‛': "'", '–': '-', '—': '-', '‑': '-', '…': '...',
}
function gsmSafe(str: unknown): string {
  return String(str || '').split('').map((c) => (c in GSM_MAP ? GSM_MAP[c] : c)).join('')
}
// Brandowany krótki link do SMS: tomekniedzwiecki.pl/p/{code} (rewrite → bud-go).
// Jeden kod na sesję (bud_short_links), odporny na równoległy insert.
const SHORT_BASE = 'https://tomekniedzwiecki.pl'
function shortLink(code: string): string { return `${SHORT_BASE}/p/${code}` }
function randCode(len = 7): string {
  const a = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  const buf = new Uint8Array(len); crypto.getRandomValues(buf)
  let out = ''; for (let i = 0; i < len; i++) out += a[buf[i] % a.length]
  return out
}
async function getOrCreateShortCode(supabase: ReturnType<typeof createClient>, sid: string): Promise<string> {
  const { data: ex } = await supabase.from('bud_short_links').select('code').eq('session_id', sid).maybeSingle()
  if (ex && ex.code) return ex.code as string
  for (let i = 0; i < 3; i++) {
    const code = randCode()
    const { error } = await supabase.from('bud_short_links').insert({ code, session_id: sid })
    if (!error) return code
    const { data: again } = await supabase.from('bud_short_links').select('code').eq('session_id', sid).maybeSingle()
    if (again && again.code) return again.code as string
  }
  return randCode()
}
// Złóż finalny SMS: tekst (GSM-safe) + krótki link w nowej linii, max 2 segmenty.
function composeSms(text: string, code: string): string {
  const link = shortLink(code)
  const max = 306 - link.length - 1
  const clean = gsmSafe((text || '').trim()).replace(/\s+$/g, '').slice(0, max)
  return `${clean}\n${link}`
}
// Statyczny fallback SMS „powrotu" (gdy GPT nie dał pola sms) — bez PL znaków.
function staticAbandonedSms(s: SessionRow): string {
  const imie = firstName(s)
  const n = productName(s)
  const co = n && n !== 'Twój sklep' ? gsmSafe(n) : 'Twoj pomysl'
  return `${imie ? 'Czesc ' + gsmSafe(imie) + '! ' : 'Czesc! '}Zaczelismy projektowac ${co} i zatrzymalismy sie w pol drogi. Wrocisz dokladnie w to samo miejsce - dokonczenie to kilka minut. ~Tomek`
}
function escHtml(s: string): string { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// Body (zwykły tekst) -> minimalny HTML „jak pisany w skrzynce". Linki TYLKO
// przez tokeny [tekst](LINK_VIEW)/[tekst](LINK_RESERVE). Podpis dokleja send-email.
function mdToHtml(body: string, viewUrl: string | null, reserveUrl: string | null, viewFallback = 'Wszystko jest w Twoim panelu'): string {
  let t = escHtml(body || '')
  if (viewUrl) t = t.replace(/\[([^\]]+)\]\(LINK_VIEW\)/g, (_m, l) => `<a href="${viewUrl}" style="color:#2563eb;">${l}</a>`)
  t = t.replace(/\[([^\]]+)\]\(LINK_RESERVE\)/g, (_m, l) => reserveUrl ? `<a href="${reserveUrl}" style="color:#2563eb;">${l}</a>` : String(l))
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  if (viewUrl && t.indexOf(viewUrl) < 0) t += `\n\n${viewFallback}: <a href="${viewUrl}" style="color:#2563eb;">${viewUrl}</a>`
  const paras = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const inner = paras.map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br>')}</p>`).join('')
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">${inner}</div>`
}

// Podgląd 1:1 — finalny HTML z doklejoną stopką (send-email preview), bez wysyłki.
async function withSignature(SUPABASE_URL: string, SERVICE_KEY: string, subject: string, html: string, to: string | null): Promise<string> {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ to: to || 'podglad@example.com', subject, html, preview: true }),
    })
    if (r.ok) { const j = await r.json(); if (j && typeof j.html === 'string') return j.html }
  } catch { /* ignore */ }
  return html
}

interface SessionRow {
  id: string
  email: string | null
  name: string | null
  verdict: string | null
  ustalenia: Record<string, unknown> | null
  market_report: Record<string, unknown> | null
  problem_summary: Record<string, unknown> | null
  preview_brief: Record<string, unknown> | null
  landing_html: string | null
  lead_id: string | null
  paid_at: string | null
  full_paid_at: string | null
  last_user_at: string | null
  last_panel_at: string | null
  phone: string | null
  sms_consent_at: string | null
  sms_opt_out: boolean | null
  sequence_cancelled_at: string | null
  created_at: string | null
}

// Ostatnie wymiany rozmowy (kanał sparing) → zwięzły kontekst do GPT, żeby mail
// realnie nawiązywał do TEGO, co padło, a nie był generyczny. Markery <ustalenia>/
// <makieta> i tagi HTML wycinamy; każdą wiadomość przycinamy do ~280 zn.
async function fetchConvo(supabase: ReturnType<typeof createClient>, sessionId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('bud_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('channel', 'sparing')
      .order('id', { ascending: false })
      .limit(6)
    if (!data || !data.length) return ''
    const rows = (data as { role: string; content: string }[]).reverse()
    return rows.map((m) => {
      const clean = String(m.content || '')
        .replace(/<(ustalenia|makieta|ocena|projekt)>[\s\S]*?<\/\1>/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 280)
      return `${m.role === 'user' ? 'On/Ona' : 'Ty (AI)'}: ${clean}`
    }).filter((l) => l.length > 12).join('\n')
  } catch { return '' }
}

// Dotyki per sesja z OBU kanałów: maile (bud_emails.sent_at) + SMS
// (bud_sms.created_at). Zbiór wysłanych kindów + czas ostatniego dotyku.
// Służy do (a) liczenia, ile maili z sekwencji już poszło, (b) bramki
// MIĘDZY-KANAŁOWEJ (nie wysyłaj maila tuż po SMS i odwrotnie).
async function loadTouches(supabase: ReturnType<typeof createClient>, ids: string[]): Promise<Map<string, { kinds: Set<string>; last: number; opened: Set<string>; delivered: Set<string> }>> {
  const m = new Map<string, { kinds: Set<string>; last: number; opened: Set<string>; delivered: Set<string> }>()
  if (!ids.length) return m
  const get = (sid: string) => {
    let e = m.get(sid)
    if (!e) { e = { kinds: new Set<string>(), last: 0, opened: new Set<string>(), delivered: new Set<string>() }; m.set(sid, e) }
    return e
  }
  const add = (sid: string, kind: string, ts: string | null) => {
    const e = get(sid); e.kinds.add(kind)
    const t = ts ? Date.parse(ts) : 0
    if (t > e.last) e.last = t
  }
  const [emails, sms] = await Promise.all([
    supabase.from('bud_emails').select('session_id, kind, sent_at, opened_at, delivered_at').in('session_id', ids),
    supabase.from('bud_sms').select('session_id, kind, created_at').in('session_id', ids),
  ])
  if (emails.error) console.error('[bud-followups] loadTouches emails error:', emails.error)
  if (sms.error) console.error('[bud-followups] loadTouches sms error:', sms.error)
  for (const r of (emails.data || []) as { session_id: string; kind: string; sent_at: string; opened_at: string | null; delivered_at: string | null }[]) {
    add(r.session_id, r.kind, r.sent_at)
    if (r.opened_at) get(r.session_id).opened.add(r.kind)
    if (r.delivered_at) get(r.session_id).delivered.add(r.kind)
  }
  for (const r of (sms.data || []) as { session_id: string; kind: string; created_at: string }[]) add(r.session_id, r.kind, r.created_at)
  return m
}

function firstName(s: SessionRow): string {
  return (s.name || '').trim().split(' ')[0] || ''
}
// Nazwa produktu/marki: ustalenia.nazwa → market_report.naglowek → problem_summary.
// (kolumny ustalenia/market_report istnieją na bud_sessions; chosen_product NIE istnieje).
function productName(s: SessionRow): string {
  const u = s.ustalenia as Record<string, unknown> | null
  if (u && typeof u.nazwa === 'string' && u.nazwa.trim()) return u.nazwa.trim()
  const mr = s.market_report as Record<string, unknown> | null
  if (mr && typeof mr.naglowek === 'string' && mr.naglowek.trim()) return (mr.naglowek as string).replace(/^Raport strategiczny\s*[—-]\s*/i, '').trim() || (mr.naglowek as string).trim()
  const ps = s.problem_summary as Record<string, unknown> | null
  if (ps && typeof ps.nazwa === 'string' && ps.nazwa.trim()) return ps.nazwa.trim()
  return 'Twój sklep'
}
function forKogo(s: SessionRow): string {
  const u = s.ustalenia as Record<string, unknown> | null
  if (u && typeof u.dla_kogo === 'string' && u.dla_kogo.trim()) return u.dla_kogo.trim()
  const ps = s.problem_summary as Record<string, unknown> | null
  if (ps && typeof ps.dla_kogo === 'string' && ps.dla_kogo.trim()) return ps.dla_kogo.trim()
  return ''
}

function followupView(kind: string, s: SessionRow): string {
  return panelLink(s.id, kind) // abandoned_chat / _2 / _3 → utm_campaign per mail
}
function viewFor(kind: string, s: SessionRow): string | null { return kind === 'paid_welcome' ? null : followupView(kind, s) }
function reserveFor(_kind: string, _s: SessionRow): string | null { return null }

// Statyczny mail (plain, „z palca") — fallback gdy GPT off / nieparsowalny.
function staticEmail(kind: string, s: SessionRow): { subject: string; html: string } {
  const im = firstName(s) ? ` ${firstName(s)}` : ''
  const n = productName(s)
  const co = n && n !== 'Twój sklep' ? n : 'Twój pomysł na sklep'
  const T: Record<string, { subject: string; body: string }> = {
    abandoned_chat: { subject: 'Twój sklep czeka — zatrzymaliśmy się w pół drogi', body: `Cześć${im}!\n\nZacząłeś projektować ${co} w rozmowie z moim AI i zatrzymaliśmy się w pół drogi. Cała rozmowa jest zapisana — wracasz dokładnie w to samo miejsce.\n\nKilka minut dzieli Cię od raportu rynku i pierwszych makiet sklepu. [Dokończmy to](LINK_VIEW).` },
    abandoned_chat_2: { subject: 'Co czeka na Ciebie za darmo', body: `Cześć${im}!\n\nWczoraj zaczęliśmy projektować ${co} i utknęliśmy w pół drogi. Chcę tylko, żebyś wiedział, co dokładnie się dla Ciebie zbuduje, jeśli dokończymy rozmowę: sprawdzenie Twojego rynku i konkurencji na żywo, makiety sklepu w kilku stylach i gotowe pomysły na reklamy. To realna robota — nic za nią nie płacisz.\n\nTo Ty masz na tym skorzystać. Jak będziesz miał chwilę, [wróć i dokończ](LINK_VIEW).` },
    abandoned_chat_3: { subject: 'Zostawiam Twój projekt zapisany', body: `Cześć${im}!\n\nNie chcę zawracać Ci głowy — to ostatnia wiadomość w tej sprawie. Twój projekt jest zapisany i wraca dokładnie tam, gdzie skończyliśmy. Drzwi są otwarte, decyzja należy do Ciebie.\n\nJeśli kiedyś zechcesz to ruszyć, [link masz tutaj](LINK_VIEW).` },
    paid_welcome: { subject: 'Rezerwacja przyjęta — co dalej', body: `Cześć${im}!\n\nDzięki za rezerwację. Biorę ${co} na warsztat — przygotowuję plan przedsięwzięcia (zakres pierwszej wersji sklepu, produkty, droga do pierwszej sprzedaży) i odezwę się do Ciebie osobiście w ciągu 2–3 dni roboczych.\n\nPrzypominam: 500 zł jest w pełni zwrotne.` },
  }
  const t = T[kind] || T.abandoned_chat
  const fallback = kind.startsWith('abandoned_chat') ? 'Wróć do rozmowy tutaj' : 'Wszystko jest w Twoim panelu'
  return { subject: t.subject, html: mdToHtml(t.body, viewFor(kind, s), reserveFor(kind, s), fallback) }
}

// ── Prompty maili: JEDNO źródło = settings (klucze budowanie_mail_*). Ładowane
//    raz na cold-start; pusty fallback = bezpiecznik (→ statyczny mail), NIE kopia
//    treści. SITUATION wstawiana w {{SYTUACJA}} system-promptów. ──
let MAIL_SITUATION = ''
let EMAIL_SYSTEM = ''
let SEQUENCE_SYSTEM = ''
let MAIL_CELE: Record<string, string> = {}
async function ensureMailPrompts(supabase: ReturnType<typeof createClient>): Promise<void> {
  if (EMAIL_SYSTEM) return
  try {
    const { data } = await supabase.from('settings').select('key, value')
      .in('key', ['budowanie_mail_sytuacja', 'budowanie_mail_email_system', 'budowanie_mail_sequence_system', 'budowanie_mail_cele'])
    const ev = (k: string) => ((data || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''
    MAIL_SITUATION = ev('budowanie_mail_sytuacja')
    const sub = (t: string) => t.split('{{SYTUACJA}}').join(MAIL_SITUATION) // literalnie (bez $-magii replace)
    EMAIL_SYSTEM = sub(ev('budowanie_mail_email_system'))
    SEQUENCE_SYSTEM = sub(ev('budowanie_mail_sequence_system'))
    try { MAIL_CELE = JSON.parse(ev('budowanie_mail_cele') || '{}') } catch (pErr) { console.error('[bud-followups] cele JSON parse:', pErr); MAIL_CELE = {} }
  } catch (_e) { /* fallback: puste prompty → statyczny mail (bezpiecznik) */ }
}

// Cel maila + dane (do GPT) dla kindów, które warto personalizować.
function followupBrief(kind: string, s: SessionRow): { goal: string; facts: string } {
  const n = productName(s)
  // ── ABANDONED (rozmowa W TOKU, PRZED raportem): 3 maile = eskalacja
  //    argumentów-artefaktów. Artefakty (raport rynku, makiety, reklamy, strona)
  //    JESZCZE NIE ISTNIEJĄ — to NAGRODA za dokończenie rozmowy, NIE coś, co
  //    „czeka w panelu" (guard w `links` pilnuje). Każdy mail wyciąga INNY mocny
  //    argument: #1 kontekst+lekki haczyk, #2 co dostajesz za darmo, #3 domknięcie. ──
  if (kind.startsWith('abandoned_chat')) {
    const dk = forKogo(s)
    const ps = s.problem_summary as Record<string, unknown> | null
    const f = (key: string) => (ps && typeof ps[key] === 'string') ? ps[key] as string : ''
    const abFacts = [`produkt/sklep: ${n}`, dk && `dla kogo: ${dk}`, f('problem') && `problem: ${f('problem')}`, f('dzisiejsze_obejscie') && `jak radzą dziś: ${f('dzisiejsze_obejscie')}`].filter(Boolean).join('; ')
    const wspolne = MAIL_CELE._wspolne || ''
    if (kind === 'abandoned_chat') return { goal: (MAIL_CELE['abandoned_chat'] || '') + wspolne, facts: abFacts }
    if (kind === 'abandoned_chat_2') return { goal: (MAIL_CELE['abandoned_chat_2'] || '') + wspolne, facts: abFacts }
    return { goal: (MAIL_CELE['abandoned_chat_3'] || '') + wspolne, facts: abFacts }
  }
  // paid_welcome
  return { goal: MAIL_CELE['paid_welcome'] || '', facts: `produkt/sklep: ${n}` }
}

async function generateFollowupEmail(supabase: ReturnType<typeof createClient>, kind: string, s: SessionRow, viewUrl: string | null, reserveUrl: string | null, logUsage: boolean): Promise<{ subject: string; html: string } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return null
  if (!EMAIL_SYSTEM) return null // prompty z settings nie załadowane → statyczny fallback (bezpiecznik)
  const brief = followupBrief(kind, s)
  const tn = productName(s)
  const hasName = !!tn && tn !== 'Twój sklep'
  const dk = forKogo(s)
  const ctx = [
    hasName ? `Produkt/sklep: ${tn}` : 'Pomysł nie ma JESZCZE nazwy — NIE wymyślaj nazwy. Pisz „Twój sklep"/„Twój pomysł" albo opisz po produkcie z rozmowy.',
    dk && `Dla kogo: ${dk}`,
    brief.facts && `Dane: ${brief.facts}`,
    firstName(s) && `Imię odbiorcy: ${firstName(s)}`,
    `Dostępne linki: ${kind === 'paid_welcome' ? 'brak linków' : 'LINK_VIEW = powrót do ROZMOWY (czatu) w tym samym miejscu. To NIE jest gotowy projekt/panel — raport rynku, makiety i reklamy POWSTANĄ DOPIERO, gdy dokończy rozmowę. NIE pisz, że coś „czeka w panelu". Opisz link jako „wróć do rozmowy" / „dokończ".'}`,
  ].filter(Boolean).join('\n')
  const user = `KONTEKST:\n${ctx}\n\nCEL TEGO MAILA: ${brief.goal}`
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: EMAIL_SYSTEM }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 1000, reasoning_effort: 'low' }),
    })
    if (!res.ok) { console.error('[bud-followups] email openai', res.status); return null }
    const data = await res.json()
    const u = data?.usage || {}
    const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
    if (logUsage) { try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.5']; await supabase.from('bud_usage').insert({ session_id: s.id, kind: 'email', model: OPENAI_MODEL, input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o, cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000, meta: { view: 'followup_email', kind } }) } catch (uErr) { console.error('[bud-followups] email usage:', uErr) } }
    const obj = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const subject = typeof obj.subject === 'string' && obj.subject.trim() ? obj.subject.trim() : null
    const body = typeof obj.body === 'string' && obj.body.trim() ? obj.body.trim() : null
    if (!subject || !body) return null
    return { subject, html: mdToHtml(body, viewUrl, reserveUrl, kind.startsWith('abandoned_chat') ? 'Wróć do rozmowy tutaj' : 'Wszystko jest w Twoim panelu') }
  } catch (e) { console.error('[bud-followups] email gen error:', e instanceof Error ? e.message : String(e)); return null }
}

// GPT dla paid_welcome (pojedynczy mail) + log kosztu; sekwencja abandoned ma
// własny generator (generateAbandonedSequence). logUsage=false → PODGLĄD w adminie.
async function getEmailFor(supabase: ReturnType<typeof createClient>, kind: string, s: SessionRow, logUsage = true): Promise<{ subject: string; html: string }> {
  const gen = await generateFollowupEmail(supabase, kind, s, viewFor(kind, s), reserveFor(kind, s), logUsage)
  if (gen) return gen
  return staticEmail(kind, s)
}

// Jeden GPT-call → 3 maile + 1 SMS sekwencji powrotu. Zwraca {emails,sms} (lub null).
async function generateAbandonedSequence(supabase: ReturnType<typeof createClient>, s: SessionRow, convo: string): Promise<{ emails: { kind: string; seq: number; subject: string; html: string }[]; sms: string | null } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return null
  if (!SEQUENCE_SYSTEM) return null // prompty z settings nie załadowane → statyczny fallback (bezpiecznik)
  const tn = productName(s)
  const hasName = !!tn && tn !== 'Twój sklep'
  const dk = forKogo(s)
  const facts = followupBrief('abandoned_chat', s).facts
  const ctx = [
    hasName ? `Produkt/sklep: ${tn}` : 'Pomysł nie ma JESZCZE nazwy — NIE wymyślaj nazwy. Pisz „Twój sklep"/„Twój pomysł" albo opisz po produkcie z rozmowy.',
    dk && `Dla kogo: ${dk}`,
    facts && `Dane: ${facts}`,
    firstName(s) && `Imię odbiorcy: ${firstName(s)}`,
    convo && `FRAGMENT ROZMOWY (ostatnie wiadomości — nawiąż do tego konkretnie):\n${convo}`,
  ].filter(Boolean).join('\n')
  const zadania = ABANDON_KINDS.map((k, i) => `MAIL ${i + 1} (${k}):\n${followupBrief(k, s).goal}`).join('\n\n')
  const user = `KONTEKST:\n${ctx}\n\nNAPISZ 3 MAILE WG CELÓW (każdy inny mocny argument):\n\n${zadania}`
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: SEQUENCE_SYSTEM }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 2400, reasoning_effort: 'low' }),
    })
    if (!res.ok) { console.error('[bud-followups] sequence openai', res.status); return null }
    const data = await res.json()
    const u = data?.usage || {}
    // log kosztu RAZ (cała trójka jednym callem)
    try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.5']; await supabase.from('bud_usage').insert({ session_id: s.id, kind: 'email', model: OPENAI_MODEL, input_tokens: u.prompt_tokens || 0, cached_tokens: u.prompt_tokens_details?.cached_tokens || 0, output_tokens: u.completion_tokens || 0, cost_usd: (Math.max(0, (u.prompt_tokens || 0) - (u.prompt_tokens_details?.cached_tokens || 0)) * p.i + (u.prompt_tokens_details?.cached_tokens || 0) * p.c + (u.completion_tokens || 0) * p.o) / 1_000_000, meta: { view: 'abandoned_sequence' } }) } catch (uErr) { console.error('[bud-followups] sequence usage:', uErr) }
    const obj = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const arr = Array.isArray(obj.emails) ? obj.emails : []
    const out: { kind: string; seq: number; subject: string; html: string }[] = []
    for (let i = 0; i < ABANDON_KINDS.length; i++) {
      const kind = ABANDON_KINDS[i]
      const e = arr.find((x: Record<string, unknown>) => Number(x.seq) === i + 1) || arr[i]
      const subject = e && typeof e.subject === 'string' && e.subject.trim() ? e.subject.trim() : null
      const body = e && typeof e.body === 'string' && e.body.trim() ? e.body.trim() : null
      if (!subject || !body) return null
      out.push({ kind, seq: i + 1, subject, html: mdToHtml(body, followupView(kind, s), null, 'Wróć do rozmowy tutaj') })
    }
    const sms = typeof obj.sms === 'string' && obj.sms.trim() ? gsmSafe(obj.sms.trim()) : null
    return { emails: out, sms }
  } catch (e) { console.error('[bud-followups] sequence gen error:', e instanceof Error ? e.message : String(e)); return null }
}

// Pre-generuj i ZAPISZ całą trójkę + SMS (idempotentnie, raz na sesję). GPT jednym
// strzałem; gdy padnie — statyczny fallback (zawsze coś zapiszemy „do wysłania").
// scheduled_at = orientacyjna godzina (last_user_at + próg) do pokazania w adminie.
// UWAGA: NIE bramkowane flagą — seed/generowanie ma działać do smoke'u bez wysyłki.
async function ensureAbandonedRows(supabase: ReturnType<typeof createClient>, s: SessionRow): Promise<void> {
  const { data: ex } = await supabase.from('bud_abandoned_emails').select('id').eq('session_id', s.id).limit(1)
  if (ex && ex.length) return
  const convo = await fetchConvo(supabase, s.id)
  const gen = await generateAbandonedSequence(supabase, s, convo)
  const emails = gen?.emails || ABANDON_KINDS.map((k, i) => { const e = staticEmail(k, s); return { kind: k, seq: i + 1, subject: e.subject, html: e.html } })
  const smsText = gen?.sms || staticAbandonedSms(s)
  const base = s.last_user_at ? Date.parse(s.last_user_at) : Date.now()
  // deno-lint-ignore no-explicit-any
  const rows: Record<string, any>[] = emails.map((e) => ({
    session_id: s.id, kind: e.kind, seq: e.seq, subject: e.subject, html: e.html,
    status: 'pending', scheduled_at: new Date(base + ABANDON_THRESH_H[e.seq - 1] * 3600000).toISOString(),
  }))
  // SMS „powrotu" — osobny wiersz (kind abandoned_sms, seq 4), +72h, po serii maili.
  rows.push({
    session_id: s.id, kind: 'abandoned_sms', seq: 4, subject: null, html: null, sms: smsText,
    status: 'pending', scheduled_at: new Date(base + ABANDON_SMS_THRESH_H * 3600000).toISOString(),
  })
  const { error } = await supabase.from('bud_abandoned_emails').upsert(rows, { onConflict: 'session_id,kind', ignoreDuplicates: true })
  if (error) console.error('[bud-followups] ensureAbandonedRows insert:', error)
  // Reconcile z sesjami „w locie": kindy wysłane już do bud_emails oznacz jako 'sent'.
  const { data: alreadySent } = await supabase.from('bud_emails').select('kind, sent_at').eq('session_id', s.id).in('kind', ABANDON_KINDS)
  for (const e of (alreadySent || []) as { kind: string; sent_at: string | null }[]) {
    await supabase.from('bud_abandoned_emails').update({ status: 'sent', sent_at: e.sent_at }).eq('session_id', s.id).eq('kind', e.kind).neq('status', 'sent')
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'metoda_niedozwolona' }, 405)
  }
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500)

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    await ensureMailPrompts(supabase) // prompty maili z settings (raz na cold-start) — przed każdą generacją

    // Funkcja jest --no-verify-jwt (woła ją pg_cron przez pg_net). Cron = sekret
    // w nagłówku; admin (panel) = x-admin-secret LUB ważny JWT zalogowanego admina.
    const cronSecret = Deno.env.get('SPAR_CRON_SECRET')
    const isCron = !!(cronSecret && req.headers.get('x-cron-secret') === cronSecret)
    let isAdmin = !!(cronSecret && req.headers.get('x-admin-secret') === cronSecret)
    let body: { action?: string } = {}
    try { body = await req.json() } catch { /* cron bez body */ }
    if (!isAdmin && !isCron) {
      const auth = req.headers.get('Authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (token && token !== SERVICE_KEY) {
        try { const { data: u } = await supabase.auth.getUser(token); if (u?.user?.id) isAdmin = true } catch { /* nie-admin */ }
      }
    }

    const SESSION_COLS = 'id, email, name, verdict, ustalenia, market_report, problem_summary, preview_brief, landing_html, lead_id, paid_at, full_paid_at, last_user_at, last_panel_at, phone, sms_consent_at, sms_opt_out, sequence_cancelled_at, created_at'

    // ── action: preview_session (ADMIN — podgląd treści follow-upa dla
    //    konkretnego leada). Dla sekwencji powrotu (abandoned_chat*) zwraca
    //    DOKŁADNIE zapisaną treść (bud_abandoned_emails). Dla paid_welcome —
    //    odtwarza na żywo (bez wysyłki, bez logowania kosztu). ──
    if (body.action === 'preview_session') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = ((body as { sessionId?: string }).sessionId || '').trim()
      const kind = ((body as { kind?: string }).kind || '').trim()
      if (!sid || !kind) return jsonResponse({ error: 'brak_parametrow' }, 400)
      const { data: s } = await supabase.from('bud_sessions').select(SESSION_COLS).eq('id', sid).maybeSingle()
      if (!s) return jsonResponse({ error: 'brak_sesji' }, 404)
      if (kind.startsWith('abandoned_chat') || kind === 'abandoned_sms') {
        const { data: row } = await supabase.from('bud_abandoned_emails').select('subject, html, sms, status, scheduled_at, sent_at').eq('session_id', sid).eq('kind', kind).maybeSingle()
        if (row) {
          const r = row as { subject: string | null; html: string | null; sms: string | null; status: string; scheduled_at: string | null; sent_at: string | null }
          const finalHtml = r.html ? await withSignature(SUPABASE_URL, SERVICE_KEY, r.subject || '', r.html, (s.email as string | null) || null) : null
          return jsonResponse({ ok: true, kind, stored: true, status: r.status, scheduled_at: r.scheduled_at, sent_at: r.sent_at, preview: { subject: r.subject, html: finalHtml, sms: r.sms, to: s.email } }, 200)
        }
        // brak zapisanego wiersza (lead przed progiem) — odtwórz podgląd statyczny/GPT poniżej
      }
      const { subject, html } = await getEmailFor(supabase, kind, s as unknown as SessionRow, false)
      const finalHtml = await withSignature(SUPABASE_URL, SERVICE_KEY, subject, html, (s.email as string | null) || null)
      return jsonResponse({ ok: true, kind, stored: false, preview: { subject, html: finalHtml, to: s.email } }, 200)
    }

    // ── action: generate_abandoned (ADMIN — wymuś pre-generację sekwencji
    //    powrotu TERAZ, bez czekania na próg 3h/okno). Idempotentne. Działa
    //    BEZ flagi BUD_FOLLOWUPS_ENABLED (sam seed, nie wysyłka). ──
    if (body.action === 'generate_abandoned') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = ((body as { sessionId?: string }).sessionId || '').trim()
      if (!sid) return jsonResponse({ error: 'brak_parametrow' }, 400)
      const { data: s } = await supabase.from('bud_sessions').select(SESSION_COLS).eq('id', sid).maybeSingle()
      if (!s) return jsonResponse({ error: 'brak_sesji' }, 404)
      await ensureAbandonedRows(supabase, s as unknown as SessionRow)
      const { data: rows } = await supabase.from('bud_abandoned_emails').select('kind, seq, subject, sms, status, scheduled_at, sent_at').eq('session_id', sid).order('seq')
      return jsonResponse({ ok: true, rows: rows || [] }, 200)
    }

    // Run crona: tylko cron-secret lub admin
    if (!isCron && !isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)

    const sent: Record<string, number> = { paid_welcome: 0, abandoned_chat: 0, abandoned_chat_2: 0, abandoned_chat_3: 0, abandoned_sms: 0, skipped_flag_off: 0 }
    let mailBudget = MAX_PER_RUN
    const hour = warsawHour()
    const inWindow = hour >= 8 && hour < 23
    const now = Date.now()
    const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString()
    const CHANNEL_GAP_MS = 10 * 3600 * 1000

    // claim → send → (rollback przy błędzie). Zwraca true gdy mail poszedł.
    // FLAGA: bez BUD_FOLLOWUPS_ENABLED realnej wysyłki NIE robimy (i NIE claimujemy,
    // żeby po włączeniu flagi mail mógł pójść). Loguj skip.
    async function sendOnce(kind: string, s: SessionRow, prebuilt?: { subject: string; html: string }): Promise<boolean> {
      if (!s.email || mailBudget <= 0) return false
      if (!FOLLOWUPS_ENABLED) { console.log(`[bud-followups] BUD_FOLLOWUPS_ENABLED off — skip send (${kind}, ${s.id})`); sent.skipped_flag_off = (sent.skipped_flag_off || 0) + 1; return false }
      const { data: claim, error: claimErr } = await supabase
        .from('bud_emails')
        .upsert([{ session_id: s.id, kind, email: s.email }], { onConflict: 'session_id,kind', ignoreDuplicates: true })
        .select('id')
      if (claimErr) { console.error('[bud-followups] claim error:', claimErr); return false }
      if (!claim || !claim.length) return false // już wysłany wcześniej

      const { subject, html } = prebuilt || await getEmailFor(supabase, kind, s)
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ to: s.email, subject, html, lead_id: s.lead_id || undefined }),
        })
        if (!res.ok) throw new Error(`send-email ${res.status}: ${await res.text()}`)
        // backfill resend_id → resend-webhook stempluje opened_at/clicked_at (bramka #3).
        try { const j = await res.json(); const rid = j?.id || j?.resend_id || j?.data?.id; if (rid) await supabase.from('bud_emails').update({ resend_id: rid }).eq('session_id', s.id).eq('kind', kind) } catch { /* ignoruj */ }
        mailBudget--
        sent[kind] = (sent[kind] || 0) + 1
        return true
      } catch (sendErr) {
        console.error(`[bud-followups] send ${kind} error:`, sendErr)
        await supabase.from('bud_emails').delete().eq('session_id', s.id).eq('kind', kind) // zwolnij claim — retry
        return false
      }
    }

    // Wyślij SMS i zaloguj do bud_sms (send → log). Dedup per (session_id, kind)
    // zapewnia wołający + UNIQUE w tabeli. FLAGA: BUD_FOLLOWUPS_ENABLED + SMS_ENABLED.
    async function sendSmsOnce(kind: string, s: SessionRow, message: string): Promise<boolean> {
      if (!s.phone) return false
      if (!FOLLOWUPS_ENABLED || !SMS_ENABLED) { console.log(`[bud-followups] BUD_FOLLOWUPS_ENABLED off — skip send (sms ${kind}, ${s.id})`); sent.skipped_flag_off = (sent.skipped_flag_off || 0) + 1; return false }
      try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-cron-secret': cronSecret || '' },
          body: JSON.stringify({ action: 'send', to: s.phone, message }),
        })
        const res = await r.json().catch(() => ({})) as Record<string, unknown>
        if (!r.ok || !res.ok) throw new Error(`send-sms ${r.status}: ${JSON.stringify(res)}`)
        const pts = typeof res.points === 'number' && res.points > 0 ? res.points : 1
        await supabase.from('bud_sms').insert({
          session_id: s.id, kind, phone: s.phone, message,
          smsapi_id: res.id ? String(res.id) : null,
          points: typeof res.points === 'number' ? res.points : null,
          status: (res.status as string) || 'SENT',
        })
        // KOSZT SMS → bud_usage (panel widzi koszt SMS przy leadzie i w zakładce Koszty)
        try {
          const rate = await usdPlnRate(supabase)
          const pln = pts * SMS_PLN_PER_POINT
          await supabase.from('bud_usage').insert({
            session_id: s.id, kind: 'sms', model: 'smsapi', input_tokens: 0, cached_tokens: 0, output_tokens: 0, images: 0,
            cost_usd: pln / rate, meta: { view: 'sms', kind, points: pts, pln, rate },
          })
        } catch (uErr) { console.error('[bud-followups] sms usage:', uErr) }
        sent[kind] = (sent[kind] || 0) + 1
        return true
      } catch (smsErr) {
        console.error(`[bud-followups] sms ${kind} error:`, smsErr)
        return false
      }
    }

    // ── 1) WELCOME po wpłacie (rezerwacja) — oparte o paid_at (paid_at ustawia
    //       tpay-webhook; tu TYLKO wysyłka raz). Tylko w oknie 8–23, by nocny run
    //       nie „zjadał" maila — poranny run nadrobi. ──────────────────────────
    if (inWindow) {
      const { data: paidRecent, error: prErr } = await supabase
        .from('bud_sessions')
        .select(SESSION_COLS)
        .eq('is_test', false)
        .is('archived_at', null)
        .not('paid_at', 'is', null)
        .is('full_paid_at', null) // welcome dotyczy rezerwacji; po pełnej płatności klient jest dalej w lejku
        .not('email', 'is', null)
        .gte('paid_at', hoursAgo(72))
        .limit(40)
      if (prErr) console.error('[bud-followups] paid recent fetch error:', prErr)
      for (const s of (paidRecent || []) as SessionRow[]) {
        await sendOnce('paid_welcome', s)
      }
    }

    // ── Pozostałe follow-upy tylko w oknie 8–23 Europe/Warsaw ─────────────
    if (!inWindow) {
      return jsonResponse({ ok: true, quiet_hours: true, flag: FOLLOWUPS_ENABLED, sent }, 200)
    }

    // ── 2) ABANDONED: sekwencja 3 maili + SMS dla rozmów PORZUCONYCH PRZED
    //    RAPORTEM. KWALIFIKACJA (krytyczne — żeby NIE dublować bud-drip):
    //      email NOT NULL, market_report IS NULL (porzucił PRZED raportem —
    //      sesje z raportem obsługuje bud-drip), paid_at IS NULL, full_paid_at
    //      IS NULL, sequence_cancelled_at IS NULL, is_test=false,
    //      last_user_at ∈ (-96h, -3h). Okna 3h/24h/48h od last_user_at;
    //      kolejność wymusza LICZBA wysłanych maili; bramka międzykanałowa ≥10h.
    //    (UWAGA: bud_sessions nie ma kolumny archived_at — hygiena przez is_test
    //     + sequence_cancelled_at; gdyby kolumna powstała, dodać .is('archived_at', null).) ──

    // 2a) STOP sekwencji: lead, który doszedł do RAPORTU (market_report) — wtedy
    //   pielęgnację przejmuje bud-drip — albo zapłacił/wstrzymano — domknij jego
    //   niewysłane wiersze jako 'cancelled'.
    const { data: pend } = await supabase.from('bud_abandoned_emails').select('session_id').eq('status', 'pending')
    const pendIds = [...new Set(((pend || []) as { session_id: string }[]).map((r) => r.session_id))]
    if (pendIds.length) {
      const { data: ss } = await supabase.from('bud_sessions').select('id, market_report, paid_at, full_paid_at, sequence_cancelled_at').in('id', pendIds)
      const stopIds = ((ss || []) as { id: string; market_report: Record<string, unknown> | null; paid_at: string | null; full_paid_at: string | null; sequence_cancelled_at: string | null }[])
        .filter((x) => x.market_report || x.paid_at || x.full_paid_at || x.sequence_cancelled_at).map((x) => x.id)
      if (stopIds.length) await supabase.from('bud_abandoned_emails').update({ status: 'cancelled' }).in('session_id', stopIds).eq('status', 'pending')
    }

    // 2b) Pre-generuj trójkę + SMS (raz na sesję) i wyślij DOKŁADNIE zapisaną treść.
    const { data: abandoned, error: abErr } = await supabase
      .from('bud_sessions')
      .select(SESSION_COLS)
      .eq('is_test', false)
      .is('archived_at', null)     // nie zaczepiaj skasowanych rozmów (archived_at istnieje)
      .is('market_report', null)   // KLUCZ: porzucił PRZED raportem (po raporcie → bud-drip)
      .is('paid_at', null)
      .is('full_paid_at', null)
      .is('sequence_cancelled_at', null)
      .not('email', 'is', null)
      .gte('last_user_at', hoursAgo(96))
      .lte('last_user_at', hoursAgo(3))
      .limit(80)
    if (abErr) console.error('[bud-followups] abandoned fetch error:', abErr)
    const abandonRows = (abandoned || []) as SessionRow[]
    const abTouches = await loadTouches(supabase, abandonRows.map((s) => s.id))
    for (const s of abandonRows) {
      // pre-generacja całej trójki + SMS (raz na sesję) — działa też bez flagi (smoke)
      await ensureAbandonedRows(supabase, s)
      const t = abTouches.get(s.id)
      const emailsSent = ABANDON_KINDS.filter((k) => t?.kinds.has(k)).length
      if (emailsSent >= ABANDON_KINDS.length) continue // wszystkie 3 już poszły
      const hoursSince = s.last_user_at ? (now - Date.parse(s.last_user_at)) / 3_600_000 : 0
      if (hoursSince < ABANDON_THRESH_H[emailsSent]) continue // za wcześnie na następny
      if (t && t.last && now - t.last < CHANNEL_GAP_MS) continue // świeży dotyk — nie przeciążaj
      // Bramka reputacji: NIE dosyłaj #3, jeśli ani #1, ani #2 nie zostały DOSTARCZONE.
      if (emailsSent === 2 && !t?.delivered.has('abandoned_chat') && !t?.delivered.has('abandoned_chat_2')) continue
      const kind = ABANDON_KINDS[emailsSent]
      const { data: row } = await supabase.from('bud_abandoned_emails').select('subject, html, status').eq('session_id', s.id).eq('kind', kind).maybeSingle()
      if (!row || row.status === 'cancelled') continue
      const ok = await sendOnce(kind, s, { subject: row.subject as string, html: row.html as string })
      if (ok) {
        const { data: em } = await supabase.from('bud_emails').select('resend_id').eq('session_id', s.id).eq('kind', kind).maybeSingle()
        await supabase.from('bud_abandoned_emails').update({ status: 'sent', sent_at: new Date().toISOString(), resend_id: (em as { resend_id: string | null } | null)?.resend_id || null }).eq('session_id', s.id).eq('kind', kind)
      }
    }

    // ── 2c) SMS POWROTU sekwencji — pre-generowany (kind=abandoned_sms),
    //   wysyłany +72h od ostatniej aktywności, TYLKO gdy lead dalej milczy.
    //   Telefon+zgoda, nie zapłacił/nie wstrzymany/przed raportem; bramka ≥10h. ──
    if (FOLLOWUPS_ENABLED && SMS_ENABLED) {
      const { data: smsDue } = await supabase.from('bud_abandoned_emails')
        .select('session_id, sms, status').eq('kind', 'abandoned_sms').eq('status', 'pending')
        .lte('scheduled_at', new Date(now).toISOString()).limit(40)
      const dueIds = [...new Set(((smsDue || []) as { session_id: string }[]).map((r) => r.session_id))]
      if (dueIds.length) {
        const { data: ss } = await supabase.from('bud_sessions').select(SESSION_COLS).eq('is_test', false).in('id', dueIds)
        const byId = new Map(((ss || []) as SessionRow[]).map((x) => [x.id, x]))
        const smsTouchA = await loadTouches(supabase, dueIds)
        for (const r of (smsDue || []) as { session_id: string; sms: string | null }[]) {
          const s = byId.get(r.session_id)
          if (!s || s.paid_at || s.full_paid_at || s.market_report || s.sequence_cancelled_at) continue
          if (!s.phone || !s.sms_consent_at || s.sms_opt_out) continue
          const lastAct = s.last_user_at ? Date.parse(s.last_user_at) : 0
          if (!lastAct || (now - lastAct) < ABANDON_SMS_THRESH_H * 3600000) continue   // wrócił/za wcześnie → pomiń
          const tt = smsTouchA.get(s.id)
          if (tt && tt.last && now - tt.last < CHANNEL_GAP_MS) continue                 // świeży dotyk z innego kanału
          if (tt?.kinds.has('abandoned_sms')) { await supabase.from('bud_abandoned_emails').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('session_id', s.id).eq('kind', 'abandoned_sms'); continue }
          const code = await getOrCreateShortCode(supabase, s.id)
          const msg = composeSms(r.sms || staticAbandonedSms(s), code)
          const ok = await sendSmsOnce('abandoned_sms', s, msg)
          if (ok) await supabase.from('bud_abandoned_emails').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('session_id', s.id).eq('kind', 'abandoned_sms')
        }
      }
    }

    return jsonResponse({ ok: true, flag: FOLLOWUPS_ENABLED, sms_flag: SMS_ENABLED, sent }, 200)
  } catch (e) {
    console.error('[bud-followups] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500)
  }
})
