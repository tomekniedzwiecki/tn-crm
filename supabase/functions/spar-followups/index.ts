// spar-followups — follow-upy mailowe lejka Stworzę + sync płatności rezerwacji
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (wołane przez pg_cron + pg_net):
//   npx supabase functions deploy spar-followups --no-verify-jwt
//
// Cron: co 30 min (jobid 22). Funkcja w pełni idempotentna:
//   - claim wysyłki = INSERT do spar_emails z UNIQUE(session_id, kind);
//     konflikt → mail już poszedł → skip; błąd wysyłki → DELETE claimu (retry)
//   - paid sync: orders(status=paid, opis Stworzę) → spar_sessions.paid_at
//     + leads.status='won' (pipeline CRM spójny z rzeczywistością)
//
// Scenariusze (sesje testowe is_test=true ZAWSZE pomijane):
//   abandoned_chat{,_2,_3} — SEKWENCJA 3 maili dla rozmowy W TOKU (verdict
//        NULL/żółty, bez wpłaty); okna od ostatniej aktywności ~3h/24h/48h,
//        treść GPT pod realny fragment rozmowy (fetchConvo); kolejność wymusza
//        liczba już wysłanych, bramka między-kanałowa ≥10h od ostatniego dotyku
//   sms_badanie_back / sms_ekrany_back — SMS powrotu (gated SMS_ENABLED), gdy
//        user wyszedł z badania (assessment) lub ekranów (preview_brief) 20min–4h
//        temu; tylko telefon + zgoda + brak opt-out; ta sama bramka ≥10h
//   verdict_no_payment — zielony werdykt, brak wpłaty, cisza 20–96 h
//   paid_welcome       — wpłata 500 zł wykryta (wysyłka przy nadaniu paid_at)
//   landing_ready      — działająca strona narzędzia zbudowana ≥15 min temu
//   raport_ready       — raport potencjału rynku policzony ≥15 min temu
//     (artefakty CELOWO z opóźnieniem — decyzja Tomka 2026-06-12: followup
//      „coś się dla Ciebie zbudowało" zamiast natychmiastowego maila, gdy
//      user jeszcze siedzi na stronie; max 1 artefakt-mail per sesja per run
//      → naturalna sekwencja: najpierw strona, ~30 min później raport)
//
// Wysyłka przez send-email (Resend, format direct + sygnatura Tomka),
// okno 8:00–23:00 Europe/Warsaw, max 30 maili/run.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SPARING_URL = 'https://tomekniedzwiecki.pl/aplikacja/sparing/'
const MAX_PER_RUN = 30

// Sekwencja powrotu (rozmowa W TOKU): 3 maile, progi w GODZINACH od ostatniej
// aktywności. Treść generowana RAZ (jeden prompt → 3 maile) i zapisana w
// spar_abandoned_emails jako „do wysłania"; cron wysyła dokładnie zapisaną treść.
const ABANDON_KINDS = ['abandoned_chat', 'abandoned_chat_2', 'abandoned_chat_3']
const ABANDON_THRESH_H = [3, 24, 48]

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

function warsawHour(): number {
  return parseInt(new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false,
  }).format(new Date()), 10)
}

const CHECKOUT_URL = 'https://crm.tomekniedzwiecki.pl/checkout/v2/'
const OFFER_ID = Deno.env.get('SPAR_OFFER_ID') || 'a1656695-db0d-4ae7-b107-230832042076'
const OPENAI_MODEL = Deno.env.get('SPAR_EMAIL_MODEL') || 'gpt-5.1'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }
// Bezpiecznik na czas budowy (SMSAPI rusza w pn.). Gdy '0'/brak — blok SMS się
// NIE odpala (żadnych przedwczesnych claimów w spar_emails). send-sms dodatkowo
// odrzuca realną wysyłkę bez własnego SMS_ENABLED — dwie niezależne bramki.
const SMS_ENABLED = (Deno.env.get('SMS_ENABLED') || '') === '1'

function chatLink(sessionId: string, campaign: string, hash = ''): string {
  return `${SPARING_URL}?id=${sessionId}&utm_source=email&utm_medium=followup&utm_campaign=${campaign}${hash}`
}
// Krótki link do SMS (UUID i tak zjada ~36 zn. — bez utm_medium/campaign,
// żeby zmieścić się w 1–2 segmentach GSM).
function smsLink(sessionId: string): string {
  return `${SPARING_URL}?id=${sessionId}&utm_source=sms`
}
// Próg SMS „powrotu" — godziny od ostatniej aktywności (po serii maili 3h/24h/48h).
const ABANDON_SMS_THRESH_H = 50
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
// Brandowany krótki link do SMS: tomekniedzwiecki.pl/p/{code} (rewrite → spar-go).
// Jeden kod na sesję (spar_short_links), odporny na równoległy insert.
const SHORT_BASE = 'https://tomekniedzwiecki.pl'
function shortLink(code: string): string { return `${SHORT_BASE}/p/${code}` }
function randCode(len = 7): string {
  const a = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  const buf = new Uint8Array(len); crypto.getRandomValues(buf)
  let out = ''; for (let i = 0; i < len; i++) out += a[buf[i] % a.length]
  return out
}
async function getOrCreateShortCode(supabase: ReturnType<typeof createClient>, sid: string): Promise<string> {
  const { data: ex } = await supabase.from('spar_short_links').select('code').eq('session_id', sid).maybeSingle()
  if (ex && ex.code) return ex.code as string
  for (let i = 0; i < 3; i++) {
    const code = randCode()
    const { error } = await supabase.from('spar_short_links').insert({ code, session_id: sid })
    if (!error) return code
    const { data: again } = await supabase.from('spar_short_links').select('code').eq('session_id', sid).maybeSingle()
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
  const n = toolName(s)
  const co = n && n !== 'Twoje narzędzie' ? gsmSafe(n) : 'Twoj pomysl'
  return `${imie ? 'Czesc ' + gsmSafe(imie) + '! ' : 'Czesc! '}Zaczelismy projektowac ${co} i zatrzymalismy sie w pol drogi. Wrocisz dokladnie w to samo miejsce - dokonczenie to kilka minut. ~Tomek`
}
function checkoutLink(leadId: string | null): string {
  return `${CHECKOUT_URL}?offer=${OFFER_ID}${leadId ? `&lead=${encodeURIComponent(leadId)}` : ''}&utm_source=email&utm_medium=followup`
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
  preview_brief: Record<string, unknown> | null
  business_plan: Record<string, unknown> | null
  market_report: Record<string, unknown> | null
  landing_url: string | null
  lead_id: string | null
  paid_at: string | null
  last_user_at: string | null
  last_panel_at: string | null
  assessment: Record<string, unknown> | null
  phone: string | null
  sms_consent_at: string | null
  sms_opt_out: boolean | null
  left_screen_at: string | null
  left_screen: string | null
  problem_summary: Record<string, unknown> | null
  economics: Record<string, unknown> | null
  created_at: string | null
}

// Ostatnie wymiany rozmowy (kanał sparing) → zwięzły kontekst do GPT, żeby mail
// realnie nawiązywał do TEGO, co padło, a nie był generyczny. Markery <ocena>/
// <projekt> i tagi HTML wycinamy; każdą wiadomość przycinamy do ~280 zn.
async function fetchConvo(supabase: ReturnType<typeof createClient>, sessionId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('spar_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('channel', 'sparing')
      .order('id', { ascending: false })
      .limit(6)
    if (!data || !data.length) return ''
    const rows = (data as { role: string; content: string }[]).reverse()
    return rows.map((m) => {
      const clean = String(m.content || '')
        .replace(/<(ocena|projekt)>[\s\S]*?<\/\1>/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 280)
      return `${m.role === 'user' ? 'On/Ona' : 'Ty (AI)'}: ${clean}`
    }).filter((l) => l.length > 12).join('\n')
  } catch { return '' }
}

// Dotyki per sesja z OBU kanałów: maile (spar_emails.sent_at) + SMS
// (spar_sms.created_at). Zbiór wysłanych kindów + czas ostatniego dotyku.
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
    supabase.from('spar_emails').select('session_id, kind, sent_at, opened_at, delivered_at').in('session_id', ids),
    supabase.from('spar_sms').select('session_id, kind, created_at').in('session_id', ids),
  ])
  if (emails.error) console.error('[spar-followups] loadTouches emails error:', emails.error)
  if (sms.error) console.error('[spar-followups] loadTouches sms error:', sms.error)
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
function toolName(s: SessionRow): string {
  const n = s.preview_brief && typeof s.preview_brief.nazwa === 'string' ? s.preview_brief.nazwa : ''
  return n || 'Twoje narzędzie'
}

function followupView(kind: string, s: SessionRow): string {
  if (kind === 'landing_ready') return s.landing_url || chatLink(s.id, 'landing_ready', '#projekt-strona')
  if (kind === 'raport_ready') return chatLink(s.id, 'raport_ready', '#rynek')
  if (kind === 'verdict_no_payment') return chatLink(s.id, 'verdict_no_payment', '#projekt-plan')
  if (kind === 'verdict_last_call') return chatLink(s.id, 'verdict_last_call', '#projekt')
  if (kind === 'paid_welcome') return chatLink(s.id, 'paid_welcome')
  if (kind === 'komplet_gotowy') return chatLink(s.id, 'komplet_gotowy', '#projekt')
  if (kind.startsWith('nurture_')) return chatLink(s.id, kind, '#projekt')
  return chatLink(s.id, kind) // abandoned_chat / abandoned_chat_2 / abandoned_chat_3 → utm_campaign per mail
}
function viewFor(kind: string, s: SessionRow): string | null { return kind === 'paid_welcome' ? null : followupView(kind, s) }
function reserveFor(kind: string, s: SessionRow): string | null { return (kind === 'verdict_last_call' || kind === 'verdict_no_payment' || kind === 'nurture_4' || kind === 'nurture_5' || kind === 'nurture_6') ? checkoutLink(s.lead_id) : null }

// Statyczny mail (plain, „z palca") — gallery podglądu + fallback gdy GPT off.
function staticEmail(kind: string, s: SessionRow): { subject: string; html: string } {
  const im = firstName(s) ? ` ${firstName(s)}` : ''
  const n = toolName(s)
  const T: Record<string, { subject: string; body: string }> = {
    abandoned_chat: { subject: 'Twój projekt czeka dokończony w połowie', body: `Cześć${im}!\n\nZacząłeś projektować swoje narzędzie w rozmowie z moim AI i zatrzymaliśmy się w pół drogi. Cała rozmowa jest zapisana — wracasz dokładnie w to samo miejsce.\n\nKilka minut dzieli Cię od karty projektu i pierwszych ekranów. [Dokończmy to](LINK_VIEW).` },
    abandoned_chat_2: { subject: 'Co czeka na Ciebie za darmo', body: `Cześć${im}!\n\nWczoraj zaczęliśmy projektować Twoje narzędzie i utknęliśmy w pół drogi. Chcę tylko, żebyś wiedział, co dokładnie czeka, jeśli dokończymy rozmowę: sprawdzenie Twojego rynku i konkurencji na żywo, karta projektu i pierwsze ekrany narzędzia. To realna robota — nic za nią nie płacisz.\n\nTo Ty masz na tym skorzystać. Jak będziesz miał chwilę, [wróć i dokończ](LINK_VIEW).` },
    abandoned_chat_3: { subject: 'Zostawiam Twój projekt zapisany', body: `Cześć${im}!\n\nNie chcę zawracać Ci głowy — to ostatnia wiadomość w tej sprawie. Twój projekt jest zapisany i wraca dokładnie tam, gdzie skończyliśmy. Drzwi są otwarte, decyzja należy do Ciebie.\n\nJeśli kiedyś zechcesz to ruszyć, [link masz tutaj](LINK_VIEW).` },
    verdict_no_payment: { subject: `${n}: projekt i plan czekają`, body: `Cześć${im}!\n\nProjekt ${n} ma zielony werdykt — karta, ekrany i wstępny plan przychodu czekają w panelu.\n\nKolejny krok to rezerwacja wspólnej rozmowy (500 zł, w pełni zwrotne): przygotowuję wtedy osobiście plan przedsięwzięcia. Możesz [zarezerwować ją tutaj](LINK_RESERVE), a [projekt zobaczysz w panelu](LINK_VIEW).` },
    verdict_last_call: { subject: `${n} — domykam miejsce na ten projekt`, body: `Cześć${im}!\n\nTydzień temu ${n} dostał zielony werdykt. Karta, ekrany i plan wciąż czekają w panelu — nic nie przepadło.\n\nJeśli to nie ten moment — w porządku, projekt zostaje zapisany. A jeśli chcesz go ruszyć, [rezerwacja](LINK_RESERVE) to 500 zł, w pełni zwrotne.` },
    landing_ready: { subject: `${n} ma już swoją stronę`, body: `Cześć${im}!\n\nZbudowała się działająca strona ${n} — nie grafika, prawdziwa strona w przeglądarce. [Otwórz ją](LINK_VIEW), przewiń, możesz pokazać znajomym z branży.` },
    raport_ready: { subject: `${n}: raport rynku gotowy`, body: `Cześć${im}!\n\nSprawdziłem rynek wokół ${n} — w internecie, nie „z głowy": konkurenci z cenami, wielkość niszy, trendy, z podlinkowanymi źródłami. Cały raport jest [tutaj](LINK_VIEW).` },
    komplet_gotowy: { subject: `${n}: cały projekt gotowy w panelu`, body: `Cześć${im}!\n\nDomknęliśmy ${n} — i to nie jeden ekran, tylko komplet: karta projektu, ekrany narzędzia, sprawdzony na żywo rynek z konkurencją, policzona opłacalność i plan, gdzie szukać pierwszych klientów. Wszystko za darmo, czeka w panelu.\n\n[Wejdź i zobacz](LINK_VIEW) — a jak coś wymaga doprecyzowania, po prostu napisz.` },
    nurture_1: { subject: `Wracam myślami do ${n}`, body: `Cześć${im}!\n\nMyślałem jeszcze o problemie, który ${n} rozwiązuje — to realnie uwiera w codziennej pracy, dlatego ten pomysł ma sens. Cały projekt nadal czeka [w panelu](LINK_VIEW), nic nie przepadło.` },
    nurture_2: { subject: `${n}: czy to się spina`, body: `Cześć${im}!\n\nWróciłem do liczb ${n} — przy rozsądnej liczbie klientów to potrafi się sensownie spinać co miesiąc. [Masz to policzone w panelu](LINK_VIEW). Jak chcesz, możemy pogadać, jak to realnie zbudować.` },
    nurture_3: { subject: `${n} a moment na rynku`, body: `Cześć${im}!\n\nSprawdzałem rynek wokół ${n} — jest realna luka i to dobry moment, żeby ją zająć, zanim zrobi to ktoś inny. [Cały raport jest w panelu](LINK_VIEW).` },
    nurture_4: { subject: `Jak zbudowalibyśmy ${n} razem`, body: `Cześć${im}!\n\nGdybyś chciał ruszyć ${n}, ryzyko po Twojej stronie jest małe: ja buduję i pomagam rozkręcić sprzedaż, a zarabiam dopiero z wyniku. Pierwszy krok to po prostu wspólna rozmowa — [rezerwacja](LINK_RESERVE) to 500 zł, w pełni zwrotne.` },
    nurture_5: { subject: `Co Cię powstrzymuje przed ${n}?`, body: `Cześć${im}!\n\nZgaduję, że gdzieś z tyłu głowy siedzi „nie mam czasu tego ogarniać" albo „a co, jeśli nie wyjdzie". Uczciwie: budowę i całą techniczną stronę biorę na siebie, zaczynamy mało, a 500 zł jest w pełni zwrotne — więc realne ryzyko po Twojej stronie jest naprawdę małe.\n\nJeśli to jedyne, co Cię trzyma, [po prostu pogadajmy](LINK_RESERVE).` },
    nurture_6: { subject: `Zostawiam ${n} otwarte`, body: `Cześć${im}!\n\nNie będę się naprzykrzał — projekt ${n} zostaje zapisany i czeka, kiedy będziesz gotowy. Jeśli kiedyś zechcesz to ruszyć, [rezerwacja jest tutaj](LINK_RESERVE), a [projekt w panelu](LINK_VIEW).` },
    paid_welcome: { subject: 'Rezerwacja przyjęta — co dalej', body: `Cześć${im}!\n\nDzięki za rezerwację. Biorę ${n} na warsztat — przygotowuję plan przedsięwzięcia (zakres pierwszej wersji, model przychodów, droga do 50 klientów, harmonogram) i odezwę się do Ciebie osobiście w ciągu 2–3 dni roboczych.\n\nPrzypominam: 500 zł jest w pełni zwrotne.` },
  }
  const t = T[kind] || T.abandoned_chat
  const fallback = kind.startsWith('abandoned_chat') ? 'Wróć do rozmowy tutaj' : 'Wszystko jest w Twoim panelu'
  return { subject: t.subject, html: mdToHtml(t.body, viewFor(kind, s), reserveFor(kind, s), fallback) }
}

// Cel maila + dane (do GPT) dla kindów, które warto personalizować.
function followupBrief(kind: string, s: SessionRow): { goal: string; facts: string } {
  const n = toolName(s)
  // ── ABANDONED (rozmowa W TOKU, przed werdyktem): 3 maile = eskalacja
  //    argumentów-artefaktów. Artefakty (rynek, opłacalność, strona, plan
  //    sprzedaży, KLIKALNY prototyp) JESZCZE NIE ISTNIEJĄ — to NAGRODA za
  //    dokończenie rozmowy, NIE coś, co „czeka w panelu" (guard w `links`
  //    pilnuje, by model nie napisał, że już jest gotowe). Każdy mail wyciąga
  //    INNY mocny argument: #1 kontekst+lekki haczyk, #2 co dostajesz za darmo,
  //    #3 najmocniejszy pojedynczy hak = klikalny prototyp. ──
  if (kind.startsWith('abandoned_chat')) {
    const k = s.problem_summary as Record<string, unknown> | null
    const f = (key: string) => (k && typeof k[key] === 'string') ? k[key] as string : ''
    const abFacts = [`narzędzie/temat: ${n}`, f('dla_kogo') && `dla kogo: ${f('dla_kogo')}`, f('problem') && `problem: ${f('problem')}`, f('dzisiejsze_obejscie') && `jak radzą dziś: ${f('dzisiejsze_obejscie')}`].filter(Boolean).join('; ')
    // Wspólne reguły serii: zawsze nawiąż do TEGO, co realnie padło (fragment
    // rozmowy), zawsze nieś JEDEN mocny argument-artefakt, mów o artefaktach
    // jako o tym, co SIĘ ZBUDUJE / co odblokuje po dokończeniu — NIE że już jest.
    const wspolne = ' Nawiąż do tego, na czym KONKRETNIE skończyliście (z fragmentu rozmowy) i jednym zdaniem przypomnij, czym jest to narzędzie i jaką niesie obietnicę. Artefakty opisuj jako to, co SIĘ ZBUDUJE / co odblokuje, KIEDY dokończy rozmowę — NIGDY że już jest gotowe albo „czeka w panelu". Jeśli nazwa jest generyczna („Twoje narzędzie") — pisz o „Twoim pomyśle". Bez nacisku i „wróć proszę".'
    if (kind === 'abandoned_chat') return { goal: 'PIERWSZY, lekki sygnał (~3h po przerwaniu, jeszcze przed werdyktem). Krótko i ciepło: rozmowa jest zapisana, wraca dokładnie w to samo miejsce, dzieli ją kilka minut od dokończenia. JEDEN lekki, mocny haczyk: zaraz po dokończeniu sprawdzam na żywo TWÓJ rynek i konkurencję (realnie, w internecie). To wszystko za darmo.' + wspolne, facts: abFacts }
    if (kind === 'abandoned_chat_2') return { goal: 'DRUGI follow-up (~następnego dnia, wciąż cisza). INNY kąt niż pierwszy: konkretnie wylicz, CO ta osoba DOSTAJE ZA DARMO, kiedy dokończy rozmowę — wymień 2–3 artefakty po imieniu: sprawdzony NA ŻYWO rynek i konkurencja (realni gracze z cenami, luka do zajęcia), policzona opłacalność (czy miesięczny abonament się spina), działająca strona sprzedażowa narzędzia. To realna robota, którą normalnie się zleca i płaci. Ustaw to jako JEJ korzyść („to Ty na tym zyskujesz"), nie Twoją prośbę.' + wspolne, facts: abFacts }
    return { goal: 'TRZECI i OSTATNI follow-up (~2 dni, cisza). Zagraj NAJMOCNIEJSZYM pojedynczym argumentem: KLIKALNY prototyp narzędzia — działająca apka (nie obrazek), w której kliknie i sprawdzi swój pomysł od środka — to się zbuduje, gdy dokończy rozmowę. Z godnością: projekt zapisany, drzwi otwarte, decyzja należy do niej. Wpleć JEDNO wciągające pytanie nawiązujące do jej pomysłu z rozmowy. Zero desperacji, zero wyrzutów — lekka, ostatnia wiadomość.' + wspolne, facts: abFacts }
  }
  if (kind.startsWith('nurture_')) {
    const k = s.problem_summary as Record<string, unknown> | null
    const f = (key: string) => (k && typeof k[key] === 'string') ? k[key] as string : ''
    const plan = s.business_plan; let liczba = ''
    if (plan && Array.isArray(plan.kamienie) && plan.kamienie.length) { const g = plan.kamienie[plan.kamienie.length - 1] as Record<string, unknown>; if (typeof g.mies === 'number' && typeof g.klienci === 'number') liczba = `przy ${g.klienci} klientach ~${Math.round(g.mies).toLocaleString('pl-PL')} zł/mies.` }
    const mr = s.market_report as Record<string, unknown> | null
    const teza = mr && typeof mr.teza === 'string' ? (mr.teza as string).slice(0, 220) : ''
    const base = [`narzędzie: ${n}`, f('dla_kogo') && `dla kogo: ${f('dla_kogo')}`, f('kto_placi') && `kto płaci: ${f('kto_placi')}`].filter(Boolean).join('; ')
    // Wspólna zasada serii: GĘSTO nie długo + jeden konkret + jedno CTA.
    const dens = 'GĘSTO, NIE DŁUGO (2–3 krótkie akapity). KAŻDY mail MUSI nieść JEDEN konkret/nową myśl — NIE samo „czeka w panelu" jako jedyną treść — i kończyć się JEDNYM jasnym CTA. '
    if (kind === 'nurture_1') return { goal: dens + 'Seria #1 (~4 dni po werdykcie). Kąt: PROBLEM. Nawiąż do ich konkretnej sytuacji (z karty) i uderz JEDNĄ rzeczą, która otwiera oczy — np. ile ten problem realnie zżera czasu/pieniędzy (oszacuj zdroworozsądkowo, bez zmyślania twardych danych). CTA miękkie: zerknij na projekt w panelu.', facts: [base, f('problem') && `problem: ${f('problem')}`, f('dzisiejsze_obejscie') && `jak radzą dziś: ${f('dzisiejsze_obejscie')}`].filter(Boolean).join('; ') }
    if (kind === 'nurture_2') return { goal: dens + 'Seria #2 (~7 dni). Kąt: PIENIĄDZE. Pokaż liczbę z planu po ludzku + JEDEN wniosek („to się może spinać, bo…"). ZERO żargonu. CTA: zobacz plan w panelu / „pogadajmy, jak to zbudować".', facts: [base, liczba && `liczba z planu: ${liczba}`].filter(Boolean).join('; ') }
    if (kind === 'nurture_3') return { goal: dens + 'Seria #3 (~11 dni). Kąt: RYNEK/TERAZ. JEDNA myśl o luce + czemu moment jest dobry (z tezy badania). CTA: zobacz raport rynku w panelu.', facts: [base, teza && `teza rynku: ${teza}`, f('konkurencja') && `konkurencja: ${f('konkurencja')}`].filter(Boolean).join('; ') }
    if (kind === 'nurture_4') return { goal: dens + 'Seria #4 (~15 dni). Kąt: JAK BUDUJEMY RAZEM. JEDNA myśl rozbrajająca ryzyko (Tomek bierze na siebie budowę i rozkręcenie sprzedaży, zarabia dopiero z wyniku), pierwszy krok = wspólna rozmowa (500 zł, w pełni zwrotne). CTA: zarezerwuj rozmowę.', facts: base }
    if (kind === 'nurture_5') return { goal: dens + 'Seria #5 (~19 dni). Kąt: ROZBROJENIE OBIEKCJI. Nazwij WPROST jeden najczęstszy opór osoby dopiero wchodzącej w biznes (np. „nie mam czasu tego ogarniać" ALBO „a co, jeśli nie wyjdzie" ALBO „brzmi skomplikowanie") i szczerze go rozpuść — bez defensywy, po ludzku: budowę i ryzyko techniczne biorę na siebie, zaczynamy mało, 500 zł jest zwrotne. JEDNA obiekcja, nie lista. CTA: zarezerwuj rozmowę.', facts: base }
    return { goal: dens + 'Seria #6 OSTATNI, z godnością. „Zostawiam projekt otwarty, kiedy będziesz gotowy". Wpleć JEDNO wciągające pytanie nawiązujące do ich pomysłu. Delikatny link do rezerwacji. Zero desperacji, zero wyrzutów — ciepła klamra.', facts: [base, f('problem') && `problem: ${f('problem')}`].filter(Boolean).join('; ') }
  }
  if (kind === 'komplet_gotowy') {
    const plan = s.business_plan; let liczba = ''
    if (plan && Array.isArray(plan.kamienie) && plan.kamienie.length) { const g = plan.kamienie[plan.kamienie.length - 1] as Record<string, unknown>; if (typeof g.mies === 'number' && typeof g.klienci === 'number') liczba = `przy ${g.klienci} klientach ~${Math.round(g.mies).toLocaleString('pl-PL')} zł/mies.` }
    const mr = s.market_report as Record<string, unknown> | null
    const teza = mr && typeof mr.teza === 'string' ? mr.teza : ''
    return { goal: 'Świeży zielony werdykt — projekt jest KOMPLETNY i CZEKA W PANELU za darmo: karta, ekrany, sprawdzony NA ŻYWO rynek+konkurencja, policzona opłacalność, plan gdzie szukać klientów. Cel TEGO maila: ŚCIĄGNĄĆ DO PANELU, żeby to zobaczył (NIE sprzedawaj jeszcze rezerwacji). Krótko, z energią „domknęliśmy to, wejdź zobacz". Wpleć JEDEN twardy konkret (liczba z planu albo teza z rynku). Link do panelu.', facts: [`narzędzie: ${n}`, liczba && `liczba z planu: ${liczba}`, teza && `teza rynku: ${teza.slice(0, 200)}`].filter(Boolean).join('; ') }
  }
  if (kind === 'verdict_last_call') {
    const plan = s.business_plan; let liczba = ''
    if (plan && Array.isArray(plan.kamienie) && plan.kamienie.length) { const g = plan.kamienie[plan.kamienie.length - 1] as Record<string, unknown>; if (typeof g.mies === 'number' && typeof g.klienci === 'number') liczba = `przy ${g.klienci} klientach ~${Math.round(g.mies).toLocaleString('pl-PL')} zł/mies.` }
    return { goal: 'To OSTATNI follow-up tego wątku (≈tydzień po zielonym werdykcie, cisza). Inny kąt niż wcześniej: lekka „domykam miejsce" + konkret. Przypomnij, że projekt dostał zielony werdykt i czeka w panelu. Bez nacisku: jeśli to nie moment — OK, projekt zostaje zapisany; jeśli chce ruszyć, rezerwacja 500 zł w pełni zwrotna. Delikatnie wpleć link do rezerwacji.', facts: [`narzędzie: ${n}`, liczba && `liczba z planu: ${liczba}`].filter(Boolean).join('; ') }
  }
  return { goal: 'Osoba właśnie zarezerwowała wspólną rozmowę (zapłaciła 500 zł, w pełni zwrotne). Podziękuj ciepło i osobiście, potwierdź że bierzesz jej projekt na warsztat: przygotowujesz plan przedsięwzięcia (zakres v1, model przychodów, droga do 50 klientów, harmonogram) i odzywasz się osobiście w 2–3 dni robocze. Bez sprzedaży, krótko. Linku nie musisz dawać.', facts: `narzędzie: ${n}` }
}

const SITUATION = `KONTEKST SYTUACJI:
- To lejek „Aplikacja": osoba rozmawiała z Twoim AI i zaprojektowała pomysł na WŁASNE narzędzie (SaaS). To dopiero ETAP PLANOWANIA — nic nie jest jeszcze realnie zbudowane; pokazywane artefakty to plan/dowód, nie gotowy produkt.
- Rezerwacja (500 zł, w pełni zwrotna) to PIERWSZY KROK do współpracy: umawia wspólną rozmowę z Tobą (Tomkiem), na której osobiście przedstawiasz plan wdrożenia i jak moglibyście to razem zbudować. To umówienie rozmowy, nie zakup produktu.
- Pisz uczciwie, że to plan/projekt („zaprojektowaliśmy", „policzyłem"). Konkretny cel TEGO maila masz w sekcji CEL — trzymaj się go.`

const EMAIL_SYSTEM = `${SITUATION}

JAK MASZ PISAĆ:
Jesteś Tomkiem Niedźwieckim i piszesz krótkiego, OSOBISTEGO maila (follow-up) — jakbyś usiadł, spojrzał na JEGO pomysł i napisał z palca w skrzynce. Nie marketing.
ZASADY: po polsku, na „Ty", ciepło i konkretnie. KRÓTKO (2–4 krótkie akapity). Bez korpomowy, emoji, clickbaitu i przesady — styl brutalnie szczery, system > magia. Jeśli to pasuje, wpleć 1 KONKRET z jego pomysłu (nazwa narzędzia + jeden szczegół/liczba) — nie ogólnik. NIE podpisuj się imieniem ani stopką (dokleja się automatycznie). Bez nagłówków, list i buttonów — zwykły tekst akapitami.
JĘZYK — WAŻNE: to osoby dopiero wchodzące w biznes, NIE znają żargonu. ZAKAZ pojęć: CAC, LTV, churn, MRR, retencja, konwersja, unit economics, runway. Liczby tłumacz po ludzku (np. zamiast „CAC" → „koszt zdobycia jednego klienta").
TON — WAŻNE: nie błagaj i nie naciskaj. To Ty dajesz tej osobie szansę na własne narzędzie — ona ma z niej skorzystać, nie odwrotnie. Zero desperacji i „wróć proszę". Jeśli w kontekście jest FRAGMENT ROZMOWY, nawiąż do tego, co realnie padło (jej pomysł, jej słowa) — tak, żeby było widać, że to ciąg dalszy JEJ wątku, a nie masowy mail. Nie cytuj rozmowy dosłownie ani nie streszczaj jej punkt po punkcie — po prostu pisz tak, jakbyś ją pamiętał.
LINKI: jeśli w kontekście jest LINK_VIEW, wstaw go RAZ jako [naturalny tekst](LINK_VIEW) — ale jego ZNACZENIE bierz z kontekstu (powrót do rozmowy ALBO podgląd projektu) i NIE obiecuj rzeczy, których kontekst nie potwierdza. Jeśli jest LINK_RESERVE, możesz go delikatnie wpleść jako [tekst](LINK_RESERVE). Nie wymyślaj żadnych adresów. Jeśli żaden link nie pasuje (np. samo podziękowanie) — nie dawaj linku.
Zwróć WYŁĄCZNIE JSON: {"subject": string, "body": string}. subject: krótki (do ~55 znaków), konkretny, bez wielkich liter i wykrzykników. body: sam tekst z \\n między akapitami.`

async function generateFollowupEmail(kind: string, s: SessionRow, viewUrl: string | null, reserveUrl: string | null, convo = ''): Promise<{ subject: string; html: string; usage: { i: number; c: number; o: number } | null } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return null
  const brief = followupBrief(kind, s)
  const b = s.preview_brief || {}
  const resume = kind.startsWith('abandoned_chat')
  const links = resume
    // Segment „w toku": pomysł NIE jest jeszcze zbudowany — link wraca do ROZMOWY,
    // nie do gotowego projektu. Bez tego model dopisuje „masz podgląd ekranów".
    ? 'LINK_VIEW = powrót do ROZMOWY (czatu) w tym samym miejscu. To NIE jest gotowy projekt/panel/podgląd — karta projektu, badanie rynku i ekrany POWSTANĄ DOPIERO, gdy dokończy rozmowę. NIE pisz, że coś „czeka w panelu" / „masz podgląd ekranów/planu". Opisz link jako „wróć do rozmowy" / „dokończ".'
    : ([viewUrl && 'jest link do podglądu projektu (LINK_VIEW)', reserveUrl && 'jest link do rezerwacji (LINK_RESERVE)'].filter(Boolean).join('; ') || 'brak linków')
  const tn = toolName(s)
  const hasName = !!tn && tn !== 'Twoje narzędzie'
  const ctx = [
    hasName ? `Narzędzie: ${tn}` : 'Pomysł nie ma JESZCZE nazwy — NIE wymyślaj nazwy i NIE używaj „Twoje narzędzie" jako nazwy własnej (np. w cudzysłowie). Pisz „Twój pomysł" albo opisz go po dziedzinie z rozmowy.',
    typeof b.opis === 'string' && b.opis && `Opis: ${b.opis}`,
    typeof b.dla_kogo === 'string' && b.dla_kogo && `Dla kogo: ${b.dla_kogo}`,
    brief.facts && `Dane: ${brief.facts}`,
    firstName(s) && `Imię odbiorcy: ${firstName(s)}`,
    convo && `FRAGMENT ROZMOWY (ostatnie wiadomości — nawiąż do tego konkretnie):\n${convo}`,
    `Dostępne linki: ${links}`,
  ].filter(Boolean).join('\n')
  const user = `KONTEKST:\n${ctx}\n\nCEL TEGO MAILA: ${brief.goal}`
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: EMAIL_SYSTEM }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 1000, reasoning_effort: 'low' }),
    })
    if (!res.ok) { console.error('[spar-followups] email openai', res.status); return null }
    const data = await res.json()
    const u = data?.usage || {}
    const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
    const obj = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const subject = typeof obj.subject === 'string' && obj.subject.trim() ? obj.subject.trim() : null
    const body = typeof obj.body === 'string' && obj.body.trim() ? obj.body.trim() : null
    if (!subject || !body) return null
    return { subject, html: mdToHtml(body, viewUrl, reserveUrl, resume ? 'Wróć do rozmowy tutaj' : 'Wszystko jest w Twoim panelu'), usage }
  } catch (e) { console.error('[spar-followups] email gen error:', e instanceof Error ? e.message : String(e)); return null }
}

// GPT dla sensownych kindów (abandoned/last_call/welcome) + log kosztu; reszta statyczna.
// logUsage=false → PODGLĄD w adminie: generuj treść, ale NIE zaliczaj kosztu do
// statystyk (inaczej każde otwarcie podglądu zawyżałoby koszt rozmowy).
async function getEmailFor(supabase: ReturnType<typeof createClient>, kind: string, s: SessionRow, logUsage = true): Promise<{ subject: string; html: string }> {
  const GPT_KINDS = ['abandoned_chat', 'abandoned_chat_2', 'abandoned_chat_3', 'komplet_gotowy', 'verdict_last_call', 'paid_welcome']
  if (GPT_KINDS.includes(kind) || kind.startsWith('nurture_')) {
    const convo = kind.startsWith('abandoned_chat') ? await fetchConvo(supabase, s.id) : ''
    const gen = await generateFollowupEmail(kind, s, viewFor(kind, s), reserveFor(kind, s), convo)
    if (gen) {
      if (gen.usage && logUsage) { try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']; await supabase.from('spar_usage').insert({ session_id: s.id, kind: 'email', model: OPENAI_MODEL, input_tokens: gen.usage.i, cached_tokens: gen.usage.c, output_tokens: gen.usage.o, cost_usd: (Math.max(0, gen.usage.i - gen.usage.c) * p.i + gen.usage.c * p.c + gen.usage.o * p.o) / 1_000_000, meta: { view: 'followup_email', kind } }) } catch (uErr) { console.error('[spar-followups] email usage:', uErr) } }
      return { subject: gen.subject, html: gen.html }
    }
  }
  return staticEmail(kind, s)
}

// System prompt dla CAŁEJ trójki w jednym strzale (taniej niż 3 osobne calle).
const SEQUENCE_SYSTEM = `${SITUATION}

PISZESZ JEDNĄ SEKWENCJĘ 3 MAILI „powrotu do rozmowy" do TEJ SAMEJ osoby (rozmowa z Twoim AI urwała się przed werdyktem). Mają iść po sobie w odstępie ~kilku godzin / dnia: mail 2 to kolejna próba, mail 3 jest ostatni. KAŻDY ma INNY mocny argument (wg swojego CELU) — NIE powtarzaj tych samych zdań ani tego samego argumentu między mailami.
JAK MASZ PISAĆ (każdy mail):
Jesteś Tomkiem Niedźwieckim, piszesz krótko i OSOBIŚCIE — jakbyś usiadł, spojrzał na JEGO pomysł i napisał z palca w skrzynce. Nie marketing.
ZASADY: po polsku, na „Ty", ciepło i konkretnie. KRÓTKO (2–4 krótkie akapity). Bez korpomowy, emoji, clickbaitu, przesady. Wpleć 1 KONKRET z jego pomysłu/rozmowy (nazwa, szczegół, branża) — nie ogólnik. NIE podpisuj się ani nie dawaj stopki (dokleja się automatycznie). Bez nagłówków, list i buttonów.
JĘZYK: to osoby dopiero wchodzące w biznes — ZERO żargonu (CAC, LTV, churn, MRR, retencja, konwersja…). Liczby tłumacz po ludzku.
TON: nie błagaj, nie naciskaj, zero „wróć proszę". Nawiąż do tego, co realnie padło w rozmowie (jego pomysł, jego słowa) — ma być czuć ciąg dalszy JEGO wątku, nie masowy mail. Nie cytuj dosłownie ani nie streszczaj punkt po punkcie.
ARTEFAKTY (rynek, opłacalność, strona, plan sprzedaży, KLIKALNY prototyp) JESZCZE NIE ISTNIEJĄ — to NAGRODA za dokończenie rozmowy. Opisuj je jako to, co SIĘ ZBUDUJE / odblokuje, KIEDY dokończy — NIGDY że już są albo „czekają w panelu".
LINKI: w KAŻDYM mailu wstaw DOKŁADNIE RAZ [naturalny tekst](LINK_VIEW) = powrót do ROZMOWY w to samo miejsce (NIE gotowy projekt). Nie wymyślaj adresów.
SMS (osobne pole „sms"): JEDEN krótki SMS „powrotu", który poleci ~2 dni po mailach, jeśli osoba dalej milczy. Ma wzbudzić CIEKAWOŚĆ i ściągnąć ją z powrotem, żeby DOKOŃCZYŁA rozmowę (to kilka minut). Nawiąż do JEJ pomysłu jednym konkretem. NIE obiecuj rzeczy „gotowych w panelu" — rozmowa nie została dokończona, artefakty dopiero powstaną. ŻELAZNE zasady kodowania: BEZ polskich znaków diakrytycznych (pisz „a" nie „ą", „l" nie „ł", „s" nie „ś" itd.); TYLKO ASCII (proste " ' - . ,); ABSOLUTNY ZAKAZ typograficznych „ ” ' ' – — …; BEZ linku/URL (dokleimy sami); 150–200 znaków; po ludzku, na „Ty"; podpis krótko „~Tomek"; bez wielkich krzyczących liter, emoji i wykrzykników.
Zwróć WYŁĄCZNIE JSON: {"emails":[{"seq":1,"subject":...,"body":...},{"seq":2,...},{"seq":3,...}],"sms":string}. subject: krótki (≤~55 zn.), konkretny, bez wielkich liter i wykrzykników. body: sam tekst z \\n między akapitami.`

// Jeden GPT-call → 3 maile + 1 SMS sekwencji powrotu. Zwraca {emails,sms} (lub null).
// deno-lint-ignore no-explicit-any
async function generateAbandonedSequence(supabase: ReturnType<typeof createClient>, s: SessionRow, convo: string): Promise<{ emails: { kind: string; seq: number; subject: string; html: string }[]; sms: string | null } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return null
  const b = s.preview_brief || {}
  const tn = toolName(s)
  const hasName = !!tn && tn !== 'Twoje narzędzie'
  const facts = followupBrief('abandoned_chat', s).facts
  const ctx = [
    hasName ? `Narzędzie: ${tn}` : 'Pomysł nie ma JESZCZE nazwy — NIE wymyślaj nazwy i NIE używaj „Twoje narzędzie" jako nazwy własnej. Pisz „Twój pomysł" albo opisz go po dziedzinie z rozmowy.',
    typeof b.opis === 'string' && b.opis && `Opis: ${b.opis}`,
    typeof b.dla_kogo === 'string' && b.dla_kogo && `Dla kogo: ${b.dla_kogo}`,
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
    if (!res.ok) { console.error('[spar-followups] sequence openai', res.status); return null }
    const data = await res.json()
    const u = data?.usage || {}
    // log kosztu RAZ (cała trójka jednym callem)
    try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']; await supabase.from('spar_usage').insert({ session_id: s.id, kind: 'email', model: OPENAI_MODEL, input_tokens: u.prompt_tokens || 0, cached_tokens: u.prompt_tokens_details?.cached_tokens || 0, output_tokens: u.completion_tokens || 0, cost_usd: (Math.max(0, (u.prompt_tokens || 0) - (u.prompt_tokens_details?.cached_tokens || 0)) * p.i + (u.prompt_tokens_details?.cached_tokens || 0) * p.c + (u.completion_tokens || 0) * p.o) / 1_000_000, meta: { view: 'abandoned_sequence' } }) } catch (uErr) { console.error('[spar-followups] sequence usage:', uErr) }
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
  } catch (e) { console.error('[spar-followups] sequence gen error:', e instanceof Error ? e.message : String(e)); return null }
}

// Pre-generuj i ZAPISZ całą trójkę (idempotentnie, raz na sesję). GPT jednym
// strzałem; gdy padnie — statyczny fallback (zawsze coś zapiszemy „do wysłania").
// scheduled_at = orientacyjna godzina (last_user_at + próg) do pokazania w adminie.
async function ensureAbandonedRows(supabase: ReturnType<typeof createClient>, s: SessionRow): Promise<void> {
  const { data: ex } = await supabase.from('spar_abandoned_emails').select('id').eq('session_id', s.id).limit(1)
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
  // SMS „powrotu" — osobny wiersz (kind abandoned_sms, seq 4), ~+50h, po serii maili.
  rows.push({
    session_id: s.id, kind: 'abandoned_sms', seq: 4, subject: null, html: null, sms: smsText,
    status: 'pending', scheduled_at: new Date(base + ABANDON_SMS_THRESH_H * 3600000).toISOString(),
  })
  const { error } = await supabase.from('spar_abandoned_emails').upsert(rows, { onConflict: 'session_id,kind', ignoreDuplicates: true })
  if (error) console.error('[spar-followups] ensureAbandonedRows insert:', error)
  // Reconcile z sesjami „w locie": kindy wysłane jeszcze starą drogą (są w
  // spar_emails) oznacz od razu jako 'sent', żeby nie wisiały jako „do wysłania".
  const { data: alreadySent } = await supabase.from('spar_emails').select('kind, sent_at').eq('session_id', s.id).in('kind', ABANDON_KINDS)
  for (const e of (alreadySent || []) as { kind: string; sent_at: string | null }[]) {
    await supabase.from('spar_abandoned_emails').update({ status: 'sent', sent_at: e.sent_at }).eq('session_id', s.id).eq('kind', e.kind).neq('status', 'sent')
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

    // ── action: preview (ADMIN — galeria szablonów follow-upów, dane przykładowe) ──
    if (body.action === 'preview') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const DISABLED = ['verdict_no_payment', 'landing_ready', 'raport_ready']
      const sample: SessionRow = {
        id: '00000000-0000-0000-0000-000000000000', email: 'przyklad@email.pl', name: 'Anna Kowalska',
        verdict: 'zielony', preview_brief: { nazwa: 'TwojeNarzędzie' },
        business_plan: { kamienie: [{ mies: 18000, klienci: 50 }] },
        market_report: { teza: 'Nisza jest realna, a konkurencja rozdrobniona.', konkurenci: [1, 2, 3], zrodla: [1, 2, 3, 4] },
        landing_url: 'https://twojenarzedzie.pl', lead_id: null, paid_at: null, last_user_at: null, last_panel_at: null,
        assessment: null, phone: null, sms_consent_at: null, sms_opt_out: null,
      } as unknown as SessionRow
      const kinds = ['abandoned_chat', 'abandoned_chat_2', 'abandoned_chat_3', 'verdict_no_payment', 'verdict_last_call', 'landing_ready', 'raport_ready', 'paid_welcome']
      const templates = await Promise.all(kinds.map(async (k) => { const { subject, html } = staticEmail(k, sample); return { group: 'followup', kind: k, subject, html: await withSignature(SUPABASE_URL, SERVICE_KEY, subject, html, null), disabled: DISABLED.includes(k) } }))
      return jsonResponse({ templates }, 200)
    }

    // ── action: preview_session (ADMIN — podgląd treści follow-upa dla
    //    konkretnego leada). Dla sekwencji powrotu (abandoned_chat*) zwraca
    //    DOKŁADNIE zapisaną treść (spar_abandoned_emails) — 1:1 z tym, co
    //    pójdzie/poszło. Dla pozostałych (nurture itd., nie cache'owane) —
    //    odtwarza na żywo (bez wysyłki, bez logowania kosztu). ──
    if (body.action === 'preview_session') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = ((body as { sessionId?: string }).sessionId || '').trim()
      const kind = ((body as { kind?: string }).kind || '').trim()
      if (!sid || !kind) return jsonResponse({ error: 'brak_parametrow' }, 400)
      const { data: s } = await supabase.from('spar_sessions')
        .select('id, email, name, verdict, preview_brief, business_plan, market_report, landing_url, lead_id, paid_at, last_user_at, last_panel_at, assessment, phone, sms_consent_at, sms_opt_out, left_screen_at, left_screen, problem_summary, economics, created_at')
        .eq('id', sid).maybeSingle()
      if (!s) return jsonResponse({ error: 'brak_sesji' }, 404)
      // sekwencja powrotu → zapisana treść (bez regeneracji)
      if (kind.startsWith('abandoned_chat')) {
        const { data: row } = await supabase.from('spar_abandoned_emails').select('subject, html, status, scheduled_at, sent_at').eq('session_id', sid).eq('kind', kind).maybeSingle()
        if (row) {
          const r = row as { subject: string; html: string; status: string; scheduled_at: string | null; sent_at: string | null }
          const finalHtml = await withSignature(SUPABASE_URL, SERVICE_KEY, r.subject, r.html, (s.email as string | null) || null)
          return jsonResponse({ ok: true, kind, stored: true, status: r.status, scheduled_at: r.scheduled_at, sent_at: r.sent_at, preview: { subject: r.subject, html: finalHtml, to: s.email } }, 200)
        }
        // brak zapisanego wiersza (np. lead jeszcze przed progiem 3h) — odtwórz podgląd
      }
      const { subject, html } = await getEmailFor(supabase, kind, s as unknown as SessionRow, false)
      const finalHtml = await withSignature(SUPABASE_URL, SERVICE_KEY, subject, html, (s.email as string | null) || null)
      return jsonResponse({ ok: true, kind, stored: false, preview: { subject, html: finalHtml, to: s.email } }, 200)
    }

    // ── action: generate_abandoned (ADMIN — wymuś pre-generację sekwencji
    //    powrotu TERAZ, bez czekania na próg 3h/okno). Idempotentne: jeśli
    //    wiersze już są, zwraca istniejące. Po wygenerowaniu zwraca całą trójkę
    //    (status + planowana godzina + treść) do podglądu w karcie leada. ──
    if (body.action === 'generate_abandoned') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = ((body as { sessionId?: string }).sessionId || '').trim()
      if (!sid) return jsonResponse({ error: 'brak_parametrow' }, 400)
      const { data: s } = await supabase.from('spar_sessions')
        .select('id, email, name, verdict, preview_brief, business_plan, market_report, landing_url, lead_id, paid_at, last_user_at, last_panel_at, assessment, phone, sms_consent_at, sms_opt_out, left_screen_at, left_screen, problem_summary, economics, created_at')
        .eq('id', sid).maybeSingle()
      if (!s) return jsonResponse({ error: 'brak_sesji' }, 404)
      await ensureAbandonedRows(supabase, s as unknown as SessionRow)
      const { data: rows } = await supabase.from('spar_abandoned_emails').select('kind, seq, subject, sms, status, scheduled_at, sent_at').eq('session_id', sid).order('seq')
      return jsonResponse({ ok: true, rows: rows || [] }, 200)
    }

    // ── action: stats (ADMIN — skuteczność lejka abandoned + SMS) ─────────
    if (body.action === 'stats') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const EK = ['abandoned_chat', 'abandoned_chat_2', 'abandoned_chat_3']
      const SK = ['sms_badanie_back', 'sms_ekrany_back']
      const { data: erows } = await supabase.from('spar_emails').select('session_id, kind, sent_at, opened_at, clicked_at, delivered_at').in('kind', EK)
      const { data: srows } = await supabase.from('spar_sms').select('session_id, kind, clicked_at').in('kind', SK)
      const mkE = () => ({ sent: 0, opened: 0, clicked: 0, delivered: 0 })
      const perKind: Record<string, { sent: number; opened: number; clicked: number; delivered: number }> = {}
      for (const k of EK) perKind[k] = mkE()
      const firstSent = new Map<string, number>()
      for (const r of (erows || []) as { session_id: string; kind: string; sent_at: string; opened_at: string | null; clicked_at: string | null; delivered_at: string | null }[]) {
        const p = perKind[r.kind]; if (!p) continue
        p.sent++; if (r.opened_at) p.opened++; if (r.clicked_at) p.clicked++; if (r.delivered_at) p.delivered++
        const ts = r.sent_at ? Date.parse(r.sent_at) : 0
        const cur = firstSent.get(r.session_id)
        if (ts && (cur === undefined || ts < cur)) firstSent.set(r.session_id, ts)
      }
      const smsKind: Record<string, { sent: number; clicked: number }> = {}
      for (const k of SK) smsKind[k] = { sent: 0, clicked: 0 }
      for (const r of (srows || []) as { kind: string; clicked_at: string | null }[]) { const p = smsKind[r.kind]; if (!p) continue; p.sent++; if (r.clicked_at) p.clicked++ }
      // Konwersja na poziomie sesji: spośród osób, które dostały KTÓRYKOLWIEK
      // mail abandoned — ile wróciło do rozmowy (aktywność po 1. mailu), doszło
      // do werdyktu, zostało „zielonych", zapłaciło.
      const ids = [...firstSent.keys()]
      const sess = { emailed: ids.length, returned: 0, reachedVerdict: 0, green: 0, paid: 0 }
      for (let i = 0; i < ids.length; i += 200) {
        const chunk = ids.slice(i, i + 200)
        const { data: ss } = await supabase.from('spar_sessions').select('id, verdict, paid_at, last_user_at').in('id', chunk)
        for (const x of (ss || []) as { id: string; verdict: string | null; paid_at: string | null; last_user_at: string | null }[]) {
          const fs = firstSent.get(x.id) || 0
          if (x.last_user_at && Date.parse(x.last_user_at) > fs) sess.returned++
          if (x.verdict) sess.reachedVerdict++
          if (x.verdict === 'zielony') sess.green++
          if (x.paid_at) sess.paid++
        }
      }
      return jsonResponse({ abandoned: { perKind, sessions: sess }, sms: smsKind }, 200)
    }

    // Run crona: tylko cron-secret lub admin
    if (!isCron && !isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)

    const sent: Record<string, number> = { paid_sync: 0, paid_welcome: 0, komplet_gotowy: 0, abandoned_chat: 0, abandoned_chat_2: 0, abandoned_chat_3: 0, verdict_last_call: 0, sms_badanie_back: 0, sms_ekrany_back: 0 }
    let mailBudget = MAX_PER_RUN
    // Okno wysyłek 8–23 PL dotyczy WSZYSTKICH maili (też paid_welcome); cutoff 23
    // (decyzja Tomka 2026-06-16) łapie wieczornych porzucaczy, póki pamiętają
    // rozmowę. Sync płatności (paid_at + lead won) działa niezależnie od pory.
    const hour = warsawHour()
    const inWindow = hour >= 8 && hour < 23

    // claim → send → (rollback przy błędzie). Zwraca true gdy mail poszedł.
    async function sendOnce(kind: string, s: SessionRow, prebuilt?: { subject: string; html: string }): Promise<boolean> {
      if (!s.email || mailBudget <= 0) return false
      const { data: claim, error: claimErr } = await supabase
        .from('spar_emails')
        .upsert([{ session_id: s.id, kind, email: s.email }], { onConflict: 'session_id,kind', ignoreDuplicates: true })
        .select('id')
      if (claimErr) { console.error('[spar-followups] claim error:', claimErr); return false }
      if (!claim || !claim.length) return false // już wysłany wcześniej

      // prebuilt = treść wcześniej WYGENEROWANA i ZAPISANA (sekwencja powrotu):
      // wysyłamy dokładnie ją, bez regeneracji. Inaczej (nurture itd.) — getEmailFor.
      const { subject, html } = prebuilt || await getEmailFor(supabase, kind, s)
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ to: s.email, subject, html, lead_id: s.lead_id || undefined }),
        })
        if (!res.ok) throw new Error(`send-email ${res.status}: ${await res.text()}`)
        // backfill resend_id → resend-webhook stempluje opened_at/clicked_at
        // (bramka zaangażowania dla #3). Bez tego otwarcia byłyby nieśledzone.
        try { const j = await res.json(); const rid = j?.id || j?.resend_id || j?.data?.id; if (rid) await supabase.from('spar_emails').update({ resend_id: rid }).eq('session_id', s.id).eq('kind', kind) } catch { /* ignoruj */ }
        mailBudget--
        sent[kind] = (sent[kind] || 0) + 1
        return true
      } catch (sendErr) {
        console.error(`[spar-followups] send ${kind} error:`, sendErr)
        // zwolnij claim — następny run spróbuje ponownie
        await supabase.from('spar_emails').delete().eq('session_id', s.id).eq('kind', kind)
        return false
      }
    }

    // Wyślij SMS i zaloguj do spar_sms (wzorzec spar-drip: send → log).
    // Dedup per (session_id, kind) zapewnia wołający (sprawdza touch-mapę) +
    // UNIQUE w tabeli. Log piszemy TYLKO przy sukcesie — błąd zostawia kind
    // otwarty na retry w kolejnym runie (w oknie). Gated przez SMS_ENABLED.
    async function sendSmsOnce(kind: string, s: SessionRow, message: string): Promise<boolean> {
      if (!SMS_ENABLED || !s.phone) return false
      try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-cron-secret': cronSecret || '' },
          body: JSON.stringify({ action: 'send', to: s.phone, message }),
        })
        const res = await r.json().catch(() => ({})) as Record<string, unknown>
        if (!r.ok || !res.ok) throw new Error(`send-sms ${r.status}: ${JSON.stringify(res)}`)
        await supabase.from('spar_sms').insert({
          session_id: s.id, kind, phone: s.phone, message,
          smsapi_id: res.id ? String(res.id) : null,
          points: typeof res.points === 'number' ? res.points : null,
          status: (res.status as string) || 'SENT',
        })
        sent[kind] = (sent[kind] || 0) + 1
        return true
      } catch (smsErr) {
        console.error(`[spar-followups] sms ${kind} error:`, smsErr)
        return false
      }
    }

    const SESSION_COLS = 'id, email, name, verdict, preview_brief, business_plan, market_report, landing_url, lead_id, paid_at, last_user_at, last_panel_at, assessment, phone, sms_consent_at, sms_opt_out, left_screen_at, left_screen, problem_summary, economics, sequence_cancelled_at, created_at'

    // ── 1) SYNC PŁATNOŚCI: orders(paid, Stworzę) → paid_at + lead won + welcome ──
    const { data: unpaid, error: unpaidErr } = await supabase
      .from('spar_sessions')
      .select(SESSION_COLS)
      .eq('is_test', false)
      .is('paid_at', null)
      .not('lead_id', 'is', null)
    if (unpaidErr) console.error('[spar-followups] unpaid fetch error:', unpaidErr)

    if (unpaid && unpaid.length) {
      const leadIds = unpaid.map((s) => s.lead_id).filter(Boolean)
      const { data: paidOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('lead_id, paid_at, status, description')
        .in('lead_id', leadIds as string[])
        .eq('status', 'paid')
        // %Aplikacja% = obecna nazwa oferty (rebranding 2026-06-13);
        // warianty Stworzę/Stworze łapią starsze zamówienia i literówki
        .or('description.ilike.%Aplikacja%,description.ilike.%Stworzę%,description.ilike.%Stworze%')
      if (ordersErr) console.error('[spar-followups] orders fetch error:', ordersErr)

      const paidByLead = new Map<string, string>()
      for (const o of paidOrders || []) {
        if (o.lead_id) paidByLead.set(o.lead_id as string, (o.paid_at as string) || new Date().toISOString())
      }
      for (const s of (unpaid as SessionRow[])) {
        const paidAt = s.lead_id ? paidByLead.get(s.lead_id) : null
        if (!paidAt) continue
        const { error: updErr } = await supabase
          .from('spar_sessions')
          .update({ paid_at: paidAt, updated_at: new Date().toISOString() })
          .eq('id', s.id)
        if (updErr) { console.error('[spar-followups] paid_at update error:', updErr); continue }
        sent.paid_sync++
        // pipeline CRM: lead wygrany
        const { error: wonErr } = await supabase
          .from('leads')
          .update({ status: 'won' })
          .eq('id', s.lead_id)
          .neq('status', 'won')
        if (wonErr) console.error('[spar-followups] lead won update error:', wonErr)
      }
    }

    const now = Date.now()
    const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString()

    // ── 1b) WELCOME po wpłacie — osobny krok oparty o paid_at (nie o pętlę
    //        sync), żeby nocny sync nie "zjadał" maila: poranny run znajdzie
    //        opłacone sesje bez wysłanego paid_welcome i nadrobi ──────────
    if (inWindow) {
      const { data: paidRecent, error: prErr } = await supabase
        .from('spar_sessions')
        .select(SESSION_COLS)
        .eq('is_test', false)
        .not('paid_at', 'is', null)
        .not('email', 'is', null)
        .gte('paid_at', hoursAgo(72))
        .limit(40)
      if (prErr) console.error('[spar-followups] paid recent fetch error:', prErr)
      for (const s of (paidRecent || []) as SessionRow[]) {
        await sendOnce('paid_welcome', s)
      }
    }

    // ── Pozostałe follow-upy tylko w oknie 8–23 Europe/Warsaw ─────────────
    if (!inWindow) {
      return jsonResponse({ ok: true, quiet_hours: true, sent }, 200)
    }

    // ── 1d) KOMPLET GOTOWY — WYŁĄCZONE (2026-06-15, decyzja Tomka) ─────────────
    //   Zbiorcze ogłoszenie „cały projekt w panelu" zastąpione przez 3 osobne
    //   odsłony rynek/economics/gtm w spar-drip (każda własnym mailem w krótkim
    //   odstępie). To one są teraz driverem do panelu. Szablon zostaje (podgląd
    //   w adminie), ale cron go nie wysyła, by lead nie dostał 4 maili naraz.
    // (blok wysyłki usunięty — patrz REVEAL_PLAN w spar-drip)

    // ── 1c) ARTEFAKTY GOTOWE (raport_ready / landing_ready) — WYŁĄCZONE ───
    //   Od 2026-06-13 pielęgnację zielonych leadów przejął drip „sekwencja
    //   odkrywania" (spar-drip): rynek/strona są generowane i ogłaszane mailem
    //   (reveal_rynek / reveal_landing) dopiero przy odsłonie, z bramką
    //   zaangażowania. Te followupy odpalały się na samo istnienie artefaktu —
    //   po wprowadzeniu dripu DUBLOWAŁY reveale. Zostawione tu świadomie jako
    //   ślad; nie przywracać bez wyłączenia odpowiednika w spar-drip.

    // ── 2) ABANDONED: sekwencja 3 maili dla rozmów W TOKU (verdict NULL/żółty,
    //        bez wpłaty). Okna od ostatniej aktywności: ~3h / ~24h / ~48h
    //        (decyzja Tomka 2026-06-14: „3 maile w ciągu 3h + 21h + kolejnego
    //        dnia"). Kolejność i odstęp wymusza LICZBA już wysłanych maili z
    //        rodziny (emailsSent), nie sztywno „poprzedni kind" — dzięki temu
    //        mail pominięty przez bramkę kanałów (SMS) i tak pójdzie we właściwej
    //        kolejności, tylko później. Bramka MIĘDZY-KANAŁOWA: ≥10h od
    //        ostatniego dotyku (mail LUB SMS), żeby nie przeciążać. Maile są
    //        personalizowane pod realny fragment rozmowy (fetchConvo w GPT). ──
    const CHANNEL_GAP_MS = 10 * 3600 * 1000

    // ── 2a) STOP sekwencji powrotu: lead, który doszedł do ZIELONEGO werdyktu
    //   (wrócił i dokończył), zapłacił albo ma ręczne wstrzymanie — nie dostaje
    //   już maili abandoned (pielęgnację przejmuje drip odkrywania). Domknij jego
    //   niewysłane wiersze jako 'cancelled'. Zbiór pending jest mały (tylko żywe
    //   sekwencje), więc to tanie. ──
    const { data: pend } = await supabase.from('spar_abandoned_emails').select('session_id').eq('status', 'pending')
    const pendIds = [...new Set(((pend || []) as { session_id: string }[]).map((r) => r.session_id))]
    if (pendIds.length) {
      const { data: ss } = await supabase.from('spar_sessions').select('id, verdict, paid_at, sequence_cancelled_at').in('id', pendIds)
      const stopIds = ((ss || []) as { id: string; verdict: string | null; paid_at: string | null; sequence_cancelled_at: string | null }[])
        .filter((x) => x.verdict === 'zielony' || x.paid_at || x.sequence_cancelled_at).map((x) => x.id)
      if (stopIds.length) await supabase.from('spar_abandoned_emails').update({ status: 'cancelled' }).in('session_id', stopIds).eq('status', 'pending')
    }

    // ── 2b) Sekwencja powrotu (rozmowa W TOKU): pre-generuj trójkę jednym
    //   promptem i ZAPISZ jako „do wysłania", potem wyślij DOKŁADNIE zapisaną
    //   treść w progach ~3h/24h/48h od ostatniej aktywności. Kolejność wymusza
    //   liczba już wysłanych (emailsSent). Bramka międzykanałowa ≥10h. ──
    const { data: abandoned, error: abErr } = await supabase
      .from('spar_sessions')
      .select(SESSION_COLS)
      .eq('is_test', false)
      .or('verdict.is.null,verdict.eq.zolty')
      .is('paid_at', null)
      .is('sequence_cancelled_at', null)
      .not('email', 'is', null)
      .gte('last_user_at', hoursAgo(96))
      .lte('last_user_at', hoursAgo(3))
      .limit(80)
    if (abErr) console.error('[spar-followups] abandoned fetch error:', abErr)
    const abandonRows = (abandoned || []) as SessionRow[]
    const abTouches = await loadTouches(supabase, abandonRows.map((s) => s.id))
    for (const s of abandonRows) {
      // pre-generacja całej trójki (raz na sesję) — od razu widoczne w adminie
      await ensureAbandonedRows(supabase, s)
      const t = abTouches.get(s.id)
      const emailsSent = ABANDON_KINDS.filter((k) => t?.kinds.has(k)).length
      if (emailsSent >= ABANDON_KINDS.length) continue // wszystkie 3 już poszły
      const hoursSince = s.last_user_at ? (now - Date.parse(s.last_user_at)) / 3_600_000 : 0
      if (hoursSince < ABANDON_THRESH_H[emailsSent]) continue // za wcześnie na następny
      if (t && t.last && now - t.last < CHANNEL_GAP_MS) continue // świeży dotyk — nie przeciążaj
      // Bramka reputacji: NIE dosyłaj #3 (ostatniego), jeśli ani #1, ani #2 nie
      // zostały DOSTARCZONE — martwy/odbity adres, 3. mail tylko psuje reputację.
      if (emailsSent === 2 && !t?.delivered.has('abandoned_chat') && !t?.delivered.has('abandoned_chat_2')) continue
      const kind = ABANDON_KINDS[emailsSent]
      // wczytaj ZAPISANĄ treść (pending) i wyślij dokładnie ją
      const { data: row } = await supabase.from('spar_abandoned_emails').select('subject, html, status').eq('session_id', s.id).eq('kind', kind).maybeSingle()
      if (!row || row.status === 'cancelled') continue
      const ok = await sendOnce(kind, s, { subject: row.subject as string, html: row.html as string })
      if (ok) {
        const { data: em } = await supabase.from('spar_emails').select('resend_id').eq('session_id', s.id).eq('kind', kind).maybeSingle()
        await supabase.from('spar_abandoned_emails').update({ status: 'sent', sent_at: new Date().toISOString(), resend_id: (em as { resend_id: string | null } | null)?.resend_id || null }).eq('session_id', s.id).eq('kind', kind)
      }
    }

    // ── 2a-SMS) SMS POWROTU sekwencji — pre-generowany (kind=abandoned_sms),
    //   wysyłany ~+50h po serii maili, TYLKO gdy lead dalej milczy. Treść 1:1 z
    //   zapisanej; telefon+zgoda, nie zielony/nie zapłacił/nie wstrzymany; bramka
    //   międzykanałowa ≥10h. „Cisza" = brak aktywności od ≥ progu (wrócił → pomiń). ──
    if (SMS_ENABLED) {
      const { data: smsDue } = await supabase.from('spar_abandoned_emails')
        .select('session_id, sms, status').eq('kind', 'abandoned_sms').eq('status', 'pending')
        .lte('scheduled_at', new Date(now).toISOString()).limit(40)
      const dueIds = [...new Set(((smsDue || []) as { session_id: string }[]).map((r) => r.session_id))]
      if (dueIds.length) {
        const { data: ss } = await supabase.from('spar_sessions').select(SESSION_COLS).eq('is_test', false).in('id', dueIds)
        const byId = new Map(((ss || []) as SessionRow[]).map((x) => [x.id, x]))
        const smsTouchA = await loadTouches(supabase, dueIds)
        for (const r of (smsDue || []) as { session_id: string; sms: string | null }[]) {
          const s = byId.get(r.session_id)
          if (!s || s.paid_at || (s.verdict && s.verdict !== 'zolty') || s.sequence_cancelled_at) continue
          if (!s.phone || !s.sms_consent_at || s.sms_opt_out) continue
          const lastAct = s.last_user_at ? Date.parse(s.last_user_at) : 0
          if (!lastAct || (now - lastAct) < ABANDON_SMS_THRESH_H * 3600000) continue   // wrócił/za wcześnie → pomiń
          const tt = smsTouchA.get(s.id)
          if (tt && tt.last && now - tt.last < CHANNEL_GAP_MS) continue                 // świeży dotyk z innego kanału
          if (tt?.kinds.has('abandoned_sms')) { await supabase.from('spar_abandoned_emails').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('session_id', s.id).eq('kind', 'abandoned_sms'); continue }
          const code = await getOrCreateShortCode(supabase, s.id)
          const msg = composeSms(r.sms || staticAbandonedSms(s), code)
          const ok = await sendSmsOnce('abandoned_sms', s, msg)
          if (ok) await supabase.from('spar_abandoned_emails').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('session_id', s.id).eq('kind', 'abandoned_sms')
        }
      }
    }

    // ── 2b) SMS POWROTU (gated SMS_ENABLED) — odpalany REALNYM sygnałem wyjścia:
    //        beacon `left_screen_at` (pagehide/visibilitychange na ekranie badania
    //        rynku albo generowania ekranów), NIE samą heurystyką czasową. Warunki:
    //        wyszedł 20 min – 4 h temu, NIE wrócił (last_user_at ≤ left_screen_at),
    //        telefon + zgoda + brak opt-out, brak wpłaty. Rodzaj z `left_screen`
    //        (fallback: preview_brief→ekrany, assessment→badanie). Raz na rodzaj
    //        (dedup spar_sms), ta sama bramka między-kanałowa ≥10h. ─────────────
    if (SMS_ENABLED) {
      const { data: smsCands, error: smsErr } = await supabase
        .from('spar_sessions')
        .select(SESSION_COLS)
        .eq('is_test', false)
        .or('verdict.is.null,verdict.eq.zolty')
        .is('paid_at', null)
        .is('sequence_cancelled_at', null)
        .not('phone', 'is', null)
        .not('sms_consent_at', 'is', null)
        .not('left_screen_at', 'is', null)
        .gte('left_screen_at', hoursAgo(4))
        .lte('left_screen_at', hoursAgo(0.34)) // ≥ ~20 min od wyjścia
        .limit(60)
      if (smsErr) console.error('[spar-followups] sms cands error:', smsErr)
      const smsRows = ((smsCands || []) as SessionRow[]).filter((s) => !s.sms_opt_out)
      const smsTouch = await loadTouches(supabase, smsRows.map((s) => s.id))
      for (const s of smsRows) {
        // wrócił po wyjściu (aktywność po beaconie) → nie nudź SMS-em
        if (s.last_user_at && s.left_screen_at && Date.parse(s.last_user_at) > Date.parse(s.left_screen_at)) continue
        const t = smsTouch.get(s.id)
        if (t && t.last && now - t.last < CHANNEL_GAP_MS) continue // świeży dotyk — nie przeciążaj
        const hasPreview = !!(s.preview_brief && Object.keys(s.preview_brief).length)
        const ekrany = s.left_screen === 'ekrany' || (s.left_screen !== 'badanie' && hasPreview)
        if (ekrany) {
          if (t?.kinds.has('sms_ekrany_back')) continue
          await sendSmsOnce('sms_ekrany_back', s, `Tu Tomek. Pierwsze ekrany Twojego narzedzia sa juz gotowe do obejrzenia - wracasz dokladnie tam, gdzie skonczylismy: ${smsLink(s.id)}`)
        } else {
          if (t?.kinds.has('sms_badanie_back')) continue
          await sendSmsOnce('sms_badanie_back', s, `Tu Tomek. Sprawdzilem na zywo Twoj rynek i konkurencje - mam konkretne wnioski. Wracasz w to samo miejsce w rozmowie: ${smsLink(s.id)}`)
        }
      }
    }

    // ── 3) ZIELONY WERDYKT BEZ WPŁATY (verdict_no_payment) — WYŁĄCZONE ────
    //   Odpalało się 20–96 h po rozmowie, czyli wprost w czasie pierwszych
    //   odsłon dripu (rynek +1 dz., economics +3 dz.) → dwójka maili w tym
    //   samym oknie. Generyczny nudge zastąpiły bogatsze reveale dripu.

    // ── 4) SERIA PIELĘGNACJI (nurture_1..5): ciepłe, kontekstowe maile GPT do
    //   zielonych-niepłatnych, oparte o TO CO USTALILIŚMY W CZACIE/PROJEKCIE
    //   (karta=problem_summary, plan, rynek) — NIEzależnie od zachowania w panelu.
    //   Odstępy od created_at: ~4/7/11/16/22 dni (po hot-finale day 0–2). Kolejność
    //   wymusza liczba już wysłanych (jak w abandoned). Bramka między-kanałowa ≥10h.
    //   „Nie odpuszczamy, ale bez nachalności" — nurture_5 = ciepła klamra (zastępuje
    //   dawny verdict_last_call/scarcity). Reguły głosu/żargonu/anty-desperacji w EMAIL_SYSTEM.
    const NURTURE_KINDS = ['nurture_1', 'nurture_2', 'nurture_3', 'nurture_4', 'nurture_5', 'nurture_6']
    const NURTURE_THRESH_D = [4, 7, 11, 15, 19, 24]
    const { data: nurtureRows, error: nuErr } = await supabase
      .from('spar_sessions')
      .select(SESSION_COLS)
      .eq('is_test', false)
      .eq('verdict', 'zielony')
      .is('paid_at', null)
      .is('sequence_cancelled_at', null)
      .not('email', 'is', null)
      .gte('created_at', hoursAgo(26 * 24)) // nie starsze niż cała seria (+bufor)
      .limit(80)
    if (nuErr) console.error('[spar-followups] nurture fetch error:', nuErr)
    const nurRows = (nurtureRows || []) as SessionRow[]
    const nurTouch = await loadTouches(supabase, nurRows.map((s) => s.id))
    for (const s of nurRows) {
      const t = nurTouch.get(s.id)
      const sentCount = NURTURE_KINDS.filter((k) => t?.kinds.has(k)).length
      if (sentCount >= NURTURE_KINDS.length) continue // cała seria poszła
      const daysSince = s.created_at ? (now - Date.parse(s.created_at)) / 86_400_000 : 0
      if (daysSince < NURTURE_THRESH_D[sentCount]) continue // za wcześnie na następny
      if (t && t.last && now - t.last < CHANNEL_GAP_MS) continue // świeży dotyk — nie przeciążaj
      await sendOnce(NURTURE_KINDS[sentCount], s)
    }

    return jsonResponse({ ok: true, sent }, 200)
  } catch (e) {
    console.error('[spar-followups] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500)
  }
})
