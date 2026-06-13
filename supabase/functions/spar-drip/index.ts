// spar-drip — „sekwencja odkrywania": progresywne generowanie i odkrywanie
// artefaktów projektu (prototyp, rynek, economics, landing, gtm) rozłożone w
// czasie i BRAMKOWANE ZAANGAŻOWANIEM (otwarcia maili + aktywność w panelu).
// Zamiast wysypać wszystko naraz — odkrywamy po kolei, każdy = mail-„wow" z
// akcją do panelu + CTA rezerwacji 500 zł. Zimny lead → pauza (nie palimy kasy).
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-drip --no-verify-jwt
//
// AKCJE (POST JSON):
//   {} (cron, x-cron-secret)         → seed + przetwórz due reveale (gate)
//   { action:'status', sessionId }   → plan reveali + zaangażowanie (panel admina)
//   { action:'seed', sessionId }     → utwórz wiersze planu (idempotentne)
//   { action:'fire', sessionId, key? }  → ADMIN TEST: wymuś najbliższy (lub dany)
//                                         reveal teraz, z pominięciem bramki/due
//   wszystkie akcje admina wymagają nagłówka x-admin-secret == SPAR_CRON_SECRET.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SPARING_URL = 'https://tomekniedzwiecki.pl/aplikacja/sparing/'
const CHECKOUT_URL = 'https://crm.tomekniedzwiecki.pl/checkout/v2/'
const OFFER_ID = Deno.env.get('SPAR_OFFER_ID') || 'a1656695-db0d-4ae7-b107-230832042076'
const FN = (name: string) => `${Deno.env.get('SUPABASE_URL')}/functions/v1/${name}`

// Plan sekwencji — kolejność + kadencja (dni od zielonego werdyktu).
// day = kiedy reveal staje się due; gate bramkuje od R2 w górę.
// Prototyp (klikalne, działające narzędzie) celowo NA KOŃCU — to najmocniejszy
// argument, finał sekwencji dla niezdecydowanych. Wcześniej budujemy kontekst:
// rynek → opłacalność → strona → sprzedaż, a potem „dotknij swojej aplikacji".
const REVEAL_PLAN: { key: string; seq: number; day: number; emailKind: string }[] = [
  { key: 'rynek', seq: 1, day: 1, emailKind: 'reveal_rynek' },
  { key: 'economics', seq: 2, day: 3, emailKind: 'reveal_economics' },
  { key: 'landing', seq: 3, day: 5, emailKind: 'reveal_landing' },
  { key: 'gtm', seq: 4, day: 8, emailKind: 'reveal_gtm' },
  { key: 'prototyp', seq: 5, day: 11, emailKind: 'reveal_prototyp' },
]
const ENGAGE_WINDOW_DAYS = 10   // aktywność w panelu/rozmowie w tym oknie = zaangażowany
const MAX_FIRES_PER_RUN = 12

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}
function warsawHour(): number {
  return parseInt(new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false }).format(new Date()), 10)
}
function panelLink(sid: string, campaign: string, hash = ''): string {
  return `${SPARING_URL}?id=${sid}&utm_source=email&utm_medium=drip&utm_campaign=${campaign}${hash}`
}
function checkoutLink(leadId: string | null): string {
  return `${CHECKOUT_URL}?offer=${OFFER_ID}${leadId ? `&lead=${encodeURIComponent(leadId)}` : ''}&utm_source=email&utm_medium=drip`
}
// Model do personalizacji treści maili (tani gpt-5.1; ~kilka groszy/mail).
const OPENAI_MODEL = Deno.env.get('SPAR_EMAIL_MODEL') || 'gpt-5.1'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }

function escHtml(s: string): string { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// Body od GPT (zwykły tekst) -> minimalny HTML „jak pisany w skrzynce".
// Linki TYLKO przez tokeny [tekst](LINK_VIEW)/[tekst](LINK_RESERVE) — żadnych
// wymyślonych adresów, żadnych buttonów. Podpis dokleja send-email.
function mdToHtml(body: string, viewUrl: string, reserveUrl: string | null): string {
  let t = escHtml(body || '')
  t = t.replace(/\[([^\]]+)\]\(LINK_VIEW\)/g, (_m, l) => `<a href="${viewUrl}" style="color:#2563eb;">${l}</a>`)
  t = t.replace(/\[([^\]]+)\]\(LINK_RESERVE\)/g, (_m, l) => reserveUrl ? `<a href="${reserveUrl}" style="color:#2563eb;">${l}</a>` : String(l))
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // resztki markdown -> sam tekst
  if (t.indexOf(viewUrl) < 0) t += `\n\nZobacz tutaj: <a href="${viewUrl}" style="color:#2563eb;">${viewUrl}</a>`
  const paras = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const inner = paras.map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br>')}</p>`).join('')
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">${inner}</div>`
}

// deno-lint-ignore no-explicit-any
function firstName(s: any): string { return (s.name || '').trim().split(' ')[0] || '' }
// deno-lint-ignore no-explicit-any
function toolName(s: any): string { const n = s.preview_brief && typeof s.preview_brief.nazwa === 'string' ? s.preview_brief.nazwa : ''; return n || 'Twoje narzędzie' }

// Najnowszy URL prototypu (z spar_usage meta.url)
async function prototypeUrl(supabase: ReturnType<typeof createClient>, sid: string): Promise<string | null> {
  const { data } = await supabase.from('spar_usage').select('meta').eq('session_id', sid).eq('kind', 'prototype').order('created_at', { ascending: false }).limit(1).maybeSingle()
  const u = data?.meta && typeof (data.meta as Record<string, unknown>).url === 'string' ? (data.meta as Record<string, unknown>).url as string : null
  return u || null
}

// Czy artefakt danego reveala jest już GOTOWY (do wysłania maila)
// deno-lint-ignore no-explicit-any
async function artifactReady(supabase: ReturnType<typeof createClient>, key: string, s: any): Promise<boolean> {
  if (key === 'prototyp') return !!(await prototypeUrl(supabase, s.id))
  if (key === 'rynek') return !!s.market_report
  if (key === 'economics') return !!s.economics
  if (key === 'landing') return !!s.landing_url
  if (key === 'gtm') return !!s.gtm
  return false
}

// Odpal generację artefaktu (woła istniejącą funkcję spar-*). Idempotentne —
// funkcje zwracają cached jeśli już jest.
async function triggerGeneration(key: string, sid: string, serviceKey: string): Promise<void> {
  const map: Record<string, string> = { prototyp: 'spar-prototype', rynek: 'spar-raport', economics: 'spar-economics', landing: 'spar-landing', gtm: 'spar-gtm' }
  const fn = map[key]
  if (!fn) return
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }
  try {
    await fetch(FN(fn), { method: 'POST', headers, body: JSON.stringify({ sessionId: sid }) })
    // gtm: po copy dociągamy banery (osobna akcja w tle)
    if (key === 'gtm') {
      await fetch(FN('spar-gtm'), { method: 'POST', headers, body: JSON.stringify({ sessionId: sid, action: 'banners' }) }).catch(() => {})
    }
  } catch (e) { console.error('[spar-drip] trigger', key, 'error:', e instanceof Error ? e.message : String(e)) }
}

// Adres podglądu artefaktu (link „zobacz" w mailu)
// deno-lint-ignore no-explicit-any
async function revealView(supabase: ReturnType<typeof createClient>, s: any, key: string): Promise<string> {
  if (key === 'prototyp') return (await prototypeUrl(supabase, s.id)) || panelLink(s.id, 'reveal_prototyp', '#projekt-prototyp')
  if (key === 'landing') return (s.landing_url as string) || panelLink(s.id, 'reveal_landing', '#projekt-strona')
  if (key === 'rynek') return panelLink(s.id, 'reveal_rynek', '#rynek')
  if (key === 'economics') return panelLink(s.id, 'reveal_economics', '#projekt-economics')
  return panelLink(s.id, 'reveal_gtm', '#projekt-gtm')
}

// Cel maila + prawdziwe dane z tego etapu (do promptu GPT i fallbacku)
// deno-lint-ignore no-explicit-any
function revealBrief(s: any, key: string): { goal: string; facts: string } {
  const r = s.market_report || {}, p = s.business_plan || {}, e = s.economics || {}, g = s.gtm || {}
  if (key === 'rynek') {
    const oc = typeof r.ocena_potencjalu === 'string' ? r.ocena_potencjalu : ''
    const nk = Array.isArray(r.konkurenci) ? r.konkurenci.length : 0
    return { goal: 'Ogłaszasz, że zrobiłeś realny research rynku (w internecie, nie „z głowy"): konkurenci z cenami, wielkość niszy, trendy, z podlinkowanymi źródłami. Zachęć, żeby otworzył raport.', facts: [oc && `ocena potencjału: ${oc}`, nk && `${nk} konkurentów z cenami`, typeof r.teza === 'string' && r.teza && `Twoja teza po researchu: ${r.teza}`].filter(Boolean).join('; ') }
  }
  if (key === 'economics') {
    const cena = typeof p.cena === 'number' ? `${p.cena} ${p.cena_jednostka || 'zł/mies.'}` : ''
    const cac = e.wejscia && typeof e.wejscia.cac === 'number' ? `CAC ~${e.wejscia.cac} zł` : ''
    return { goal: 'Ogłaszasz, że policzyłeś, czy to się spina: model cenowy, koszt pozyskania klienta, wartość klienta, moment zwrotu budowy i droga do 50 klientów. W panelu są suwaki do pokręcenia.', facts: [cena && `cena: ${cena}`, cac].filter(Boolean).join('; ') }
  }
  if (key === 'landing') return { goal: 'Ogłaszasz, że zbudowała się DZIAŁAJĄCA strona sprzedażowa jego narzędzia — prawdziwa strona w przeglądarce, nie grafika. Można ją otworzyć, przewinąć, pokazać znajomym z branży.', facts: '' }
  if (key === 'prototyp') return { goal: 'To FINAŁ sekwencji i najmocniejszy element. Ogłaszasz KLIKALNY, działający prototyp jego narzędzia — nie obrazek, działająca apka (można kliknąć, wpisać, zobaczyć jak reaguje). Nawiąż delikatnie, że przeszliście już przez rynek, liczby, stronę i plan sprzedaży, a to zostawiłeś na koniec. To dobry moment, by delikatnie zaprosić do rezerwacji wspólnej rozmowy. Niech wejdzie i kliknie.', facts: '' }
  const nk = g.playbook && Array.isArray(g.playbook.kanaly) ? g.playbook.kanaly.length : 0
  const nr = g.pakiet && Array.isArray(g.pakiet.reklamy) ? g.pakiet.reklamy.length : 0
  return { goal: 'Ogłaszasz konkretny plan zdobycia pierwszych klientów: gdzie oni są (kanały), gotowe skrypty i odpowiedzi na obiekcje, oraz gotowe reklamy z kreacjami.', facts: [nk && `${nk} kanałów`, nr && `${nr} gotowych reklam`].filter(Boolean).join('; ') }
}

// Statyczny fallback (plain, „z palca") — gdy GPT niedostępny + do galerii szablonów.
// deno-lint-ignore no-explicit-any
function staticReveal(s: any, key: string, viewUrl: string, reserveUrl: string | null): { subject: string; html: string } {
  const im = firstName(s) ? ` ${firstName(s)}` : ''
  const n = toolName(s)
  const M: Record<string, { subject: string; body: string }> = {
    rynek: { subject: `${n}: sprawdziłem Twój rynek`, body: `Cześć${im}!\n\nSprawdziłem rynek wokół ${n} — naprawdę, w internecie, nie „z głowy": konkurenci z cenami, wielkość niszy, trendy, wszystko z linkami do źródeł.\n\nMożesz zobaczyć cały raport [tutaj](LINK_VIEW). Ciekaw jestem, co o nim powiesz.` },
    economics: { subject: `${n}: czy to się spina?`, body: `Cześć${im}!\n\nPoliczyłem najważniejszą rzecz przy każdym biznesie — czy ${n} się spina: cena, koszt pozyskania klienta, ile klient jest wart i kiedy zwraca się budowa.\n\nW panelu możesz [pokręcić suwakami](LINK_VIEW) i zobaczyć, jak liczby zmieniają się przy Twoich założeniach.` },
    landing: { subject: `${n} ma już stronę`, body: `Cześć${im}!\n\nZbudowała się działająca strona sprzedażowa ${n} — to prawdziwa strona w przeglądarce, nie grafika.\n\n[Otwórz ją tutaj](LINK_VIEW), przewiń, możesz nawet pokazać komuś z branży i zapytać, co myśli.` },
    gtm: { subject: `${n}: skąd wziąć pierwszych klientów`, body: `Cześć${im}!\n\nPrzygotowałem konkretny plan zdobycia pierwszych klientów dla ${n}: gdzie oni są, gotowe skrypty, odpowiedzi na obiekcje i gotowe reklamy z kreacjami.\n\nWszystko jest [tutaj](LINK_VIEW).` },
    prototyp: { subject: `${n} — dotknij swojej aplikacji`, body: `Cześć${im}!\n\nPrzeszliśmy przez rynek, liczby, stronę i plan sprzedaży — a na koniec zostawiłem to, co robi największe wrażenie.\n\nZbudowałem klikalny prototyp ${n}. To nie obrazek — działająca apka: [wejdź, kliknij, wpisz coś](LINK_VIEW) i zobacz, jak reaguje. Tak będzie wyglądać Twój produkt.` },
  }
  const m = M[key] || M.rynek
  return { subject: m.subject, html: mdToHtml(m.body, viewUrl, reserveUrl) }
}

// GPT-personalizowany mail (zwraca null przy błędzie -> fallback statyczny)
// deno-lint-ignore no-explicit-any
async function generateRevealEmail(s: any, key: string, viewUrl: string, reserveUrl: string | null): Promise<{ subject: string; html: string; usage: { i: number; c: number; o: number } | null } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return null
  const brief = revealBrief(s, key)
  const b = s.preview_brief || {}
  const karta = (s.problem_summary || {}) as Record<string, unknown>
  const ctx = [
    `Narzędzie: ${toolName(s)}`,
    typeof b.opis === 'string' && b.opis && `Opis: ${b.opis}`,
    typeof b.dla_kogo === 'string' && b.dla_kogo && `Dla kogo: ${b.dla_kogo}`,
    typeof karta.problem === 'string' && karta.problem && `Problem, który rozwiązuje: ${karta.problem}`,
    brief.facts && `Dane z tego etapu: ${brief.facts}`,
    firstName(s) && `Imię odbiorcy: ${firstName(s)}`,
  ].filter(Boolean).join('\n')
  const SYSTEM = `Jesteś Tomkiem Niedźwieckim. Piszesz krótkiego, OSOBISTEGO maila do osoby, która zaprojektowała z Twoim AI pomysł na własne narzędzie (SaaS). Ma wyglądać, jakbyś napisał go z palca w skrzynce — nie marketing.
ZASADY: po polsku, na „Ty", ciepło i konkretnie. KRÓTKO (3–5 krótkich akapitów). Bez korpomowy, bez emoji, bez clickbaitu, bez przesadnych obietnic — Twój styl jest brutalnie szczery, system ważniejszy niż magia. Odnieś się KONKRETNIE do JEGO pomysłu: użyj nazwy narzędzia i 1–2 prawdziwych szczegółów z kontekstu (problem, dla kogo, liczba, ocena). Ma być czuć, że piszesz o TYM pomyśle. NIE podpisuj się imieniem ani stopką (dokleja się automatycznie). Bez nagłówków, list i buttonów — zwykły tekst akapitami.
LINKI: wstaw dokładnie JEDEN link do podglądu jako [naturalny tekst](LINK_VIEW), wpleciony w zdanie. Opcjonalnie, DELIKATNIE i max raz, możesz wspomnieć o rezerwacji wspólnej rozmowy (500 zł, w pełni zwrotne, rozpoczyna pracę) jako [tekst](LINK_RESERVE) — tylko jeśli naturalnie pasuje. Nie wymyślaj żadnych innych adresów.
Zwróć WYŁĄCZNIE JSON: {"subject": string, "body": string}. subject: krótki (do ~55 znaków), konkretny, budzi ciekawość, bez wielkich liter i wykrzykników, najlepiej nawiązuje do jego pomysłu. body: sam tekst maila z \\n między akapitami.`
  const user = `KONTEKST POMYSŁU:\n${ctx}\n\nCEL TEGO MAILA: ${brief.goal}`
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 1200, reasoning_effort: 'low' }),
    })
    if (!res.ok) { console.error('[spar-drip] email openai', res.status, (await res.text().catch(() => '')).slice(0, 300)); return null }
    const data = await res.json()
    const u = data?.usage || {}
    const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
    const obj = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const subject = typeof obj.subject === 'string' && obj.subject.trim() ? obj.subject.trim() : null
    const body = typeof obj.body === 'string' && obj.body.trim() ? obj.body.trim() : null
    if (!subject || !body) return null
    return { subject, html: mdToHtml(body, viewUrl, reserveUrl), usage }
  } catch (e) { console.error('[spar-drip] email gen error:', e instanceof Error ? e.message : String(e)); return null }
}

// Mail reveala: cache w spar_reveals.meta.email -> GPT (raz) -> fallback statyczny.
// Dzięki cache podgląd == wysyłka i koszt GPT pada tylko raz na odsłonę.
// deno-lint-ignore no-explicit-any
async function getRevealEmail(supabase: ReturnType<typeof createClient>, reveal: any, s: any): Promise<{ subject: string; html: string }> {
  const cached = reveal && reveal.meta && reveal.meta.email
  if (cached && typeof cached.subject === 'string' && typeof cached.html === 'string') return { subject: cached.subject, html: cached.html }
  const key = reveal.key
  const viewUrl = await revealView(supabase, s, key)
  const reserveUrl = s.email ? checkoutLink(s.lead_id || null) : null
  let email: { subject: string; html: string }
  let model: string | null = null
  const gen = await generateRevealEmail(s, key, viewUrl, reserveUrl)
  if (gen) {
    email = { subject: gen.subject, html: gen.html }; model = OPENAI_MODEL
    if (gen.usage) { try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']; await supabase.from('spar_usage').insert({ session_id: s.id, kind: 'email', model: OPENAI_MODEL, input_tokens: gen.usage.i, cached_tokens: gen.usage.c, output_tokens: gen.usage.o, cost_usd: (Math.max(0, gen.usage.i - gen.usage.c) * p.i + gen.usage.c * p.c + gen.usage.o * p.o) / 1_000_000, meta: { view: 'reveal_email', key } }) } catch (uErr) { console.error('[spar-drip] email usage insert:', uErr) } }
  } else {
    email = staticReveal(s, key, viewUrl, reserveUrl)
  }
  try { if (reveal.id) await supabase.from('spar_reveals').update({ meta: { ...(reveal.meta || {}), email: { subject: email.subject, html: email.html, model, at: new Date().toISOString() } }, updated_at: new Date().toISOString() }).eq('id', reveal.id) } catch (cErr) { console.error('[spar-drip] email cache:', cErr) }
  return email
}

// Przykładowa sesja do PODGLĄDU szablonów (bez realnego leada) — id-zero, więc
// prototypeUrl/landing nie znajdą się w bazie i wskoczą sensowne fallbacki.
// deno-lint-ignore no-explicit-any
function sampleSession(): any {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'przyklad@email.pl', name: 'Anna Kowalska', lead_id: null, paid_at: null,
    preview_brief: { nazwa: 'TwojeNarzędzie' },
    market_report: { teza: 'Nisza jest realna, a konkurencja rozdrobniona — jest miejsce na prostsze, tańsze narzędzie.', ocena_potencjalu: 'umiarkowany' },
    business_plan: { cena: 149, cena_jednostka: 'zł/mies.', kamienie: [{ mies: 18000, klienci: 50 }] },
    economics: {}, gtm: { playbook: { kanaly: [1, 2, 3] }, pakiet: { reklamy: [{ banner_url: '' }, { banner_url: '' }, { banner_url: '' }] } },
    landing_url: null,
  }
}

const SESSION_COLS = 'id, email, name, verdict, paid_at, preview_brief, problem_summary, business_plan, market_report, economics, gtm, landing_url, lead_id, last_user_at, last_panel_at, created_at, is_test'

// Czy lead jest ZAANGAŻOWANY (bramka): aktywność w panelu/rozmowie w oknie LUB
// otworzył którykolwiek reveal-mail.
// deno-lint-ignore no-explicit-any
async function isEngaged(supabase: ReturnType<typeof createClient>, s: any): Promise<boolean> {
  const win = Date.now() - ENGAGE_WINDOW_DAYS * 86400000
  const lp = s.last_panel_at ? Date.parse(s.last_panel_at) : 0
  const lu = s.last_user_at ? Date.parse(s.last_user_at) : 0
  if (lp >= win || lu >= win) return true
  // otwarcie reveala liczy się TYLKO w oknie — inaczej jeden klik sprzed
  // tygodni trzymałby zimnego leada „gorącym" w nieskończoność
  const { count } = await supabase.from('spar_emails').select('id', { count: 'exact', head: true })
    .eq('session_id', s.id).like('kind', 'reveal_%').gte('opened_at', new Date(win).toISOString())
  return (count ?? 0) > 0
}

// Utwórz wiersze planu dla sesji (idempotentne)
async function seedReveals(supabase: ReturnType<typeof createClient>, sid: string, verdictAt: number): Promise<void> {
  const rows = REVEAL_PLAN.map((r) => ({
    session_id: sid, key: r.key, seq: r.seq, email_kind: r.emailKind,
    due_at: new Date(verdictAt + r.day * 86400000).toISOString(), status: 'pending',
  }))
  await supabase.from('spar_reveals').upsert(rows, { onConflict: 'session_id,key', ignoreDuplicates: true })
}

// Wyślij reveal-mail (idempotentnie przez spar_emails). Zwraca true gdy poszedł.
// deno-lint-ignore no-explicit-any
async function sendReveal(supabase: ReturnType<typeof createClient>, SUPABASE_URL: string, SERVICE_KEY: string, reveal: any, s: any): Promise<boolean> {
  if (!s.email) return false
  const emailKind = reveal.email_kind
  const { data: claim, error: claimErr } = await supabase.from('spar_emails')
    .upsert([{ session_id: s.id, kind: emailKind, email: s.email }], { onConflict: 'session_id,kind', ignoreDuplicates: true }).select('id')
  if (claimErr) { console.error('[spar-drip] claim error:', claimErr); return false }
  if (!claim || !claim.length) return true // już wysłany
  const { subject, html } = await getRevealEmail(supabase, reveal, s)
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ to: s.email, subject, html, lead_id: s.lead_id || undefined }),
    })
    if (!res.ok) throw new Error(`send-email ${res.status}`)
    // zapisz resend_id (z odpowiedzi) do śledzenia otwarć
    try { const j = await res.json(); const rid = j?.id || j?.resend_id || j?.data?.id; if (rid) await supabase.from('spar_emails').update({ resend_id: rid }).eq('session_id', s.id).eq('kind', emailKind) } catch { /* ignoruj */ }
    return true
  } catch (e) {
    console.error('[spar-drip] send error:', e instanceof Error ? e.message : String(e))
    await supabase.from('spar_emails').delete().eq('session_id', s.id).eq('kind', emailKind)
    return false
  }
}

// Przetwórz jeden reveal: generuj jeśli trzeba, wyślij gdy gotowy.
// deno-lint-ignore no-explicit-any
async function processReveal(supabase: ReturnType<typeof createClient>, SUPABASE_URL: string, SERVICE_KEY: string, s: any, reveal: any): Promise<string> {
  const ready = await artifactReady(supabase, reveal.key, s)
  if (!ready) {
    await triggerGeneration(reveal.key, s.id, SERVICE_KEY)
    await supabase.from('spar_reveals').update({ status: 'generating', updated_at: new Date().toISOString() }).eq('id', reveal.id)
    return 'generating'
  }
  if (!reveal.generated_at) await supabase.from('spar_reveals').update({ generated_at: new Date().toISOString() }).eq('id', reveal.id)
  const ok = await sendReveal(supabase, SUPABASE_URL, SERVICE_KEY, reveal, s)
  if (ok) { await supabase.from('spar_reveals').update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reveal.id); return 'sent' }
  return 'ready'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405)
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const CRON_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (!SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500)
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    let body: { action?: string; sessionId?: string; key?: string; send?: boolean } = {}
    try { body = await req.json() } catch { /* cron bez body */ }
    let isAdmin = !!(CRON_SECRET && req.headers.get('x-admin-secret') === CRON_SECRET)
    const isCron = !!(CRON_SECRET && req.headers.get('x-cron-secret') === CRON_SECRET)
    // Fallback dla panelu admina (przeglądarka): zalogowany użytkownik CRM.
    // Nie osadzamy sekretu w kliencie — weryfikujemy JWT z nagłówka Authorization.
    if (!isAdmin && !isCron) {
      const auth = req.headers.get('Authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (token && token !== SERVICE_KEY) {
        try { const { data: u } = await supabase.auth.getUser(token); if (u?.user?.id) isAdmin = true } catch { /* nie-admin */ }
      }
    }

    // ── action: status (panel admina) ──
    if (body.action === 'status') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = (body.sessionId || '').trim()
      const { data: s } = await supabase.from('spar_sessions').select(SESSION_COLS).eq('id', sid).maybeSingle()
      const { data: reveals } = await supabase.from('spar_reveals').select('*').eq('session_id', sid).order('seq')
      const { data: emails } = await supabase.from('spar_emails').select('kind, sent_at, opened_at, clicked_at').eq('session_id', sid).like('kind', 'reveal_%')
      const engaged = s ? await isEngaged(supabase, s) : false
      return jsonResponse({ session: s ? { email: s.email, name: s.name, last_panel_at: s.last_panel_at, last_user_at: s.last_user_at, verdict: s.verdict, paid_at: s.paid_at, engaged } : null, reveals: reveals || [], emails: emails || [], plan: REVEAL_PLAN }, 200)
    }

    // ── action: seed ──
    if (body.action === 'seed') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = (body.sessionId || '').trim()
      const { data: s } = await supabase.from('spar_sessions').select('id, created_at, verdict').eq('id', sid).maybeSingle()
      if (!s) return jsonResponse({ error: 'brak_sesji' }, 404)
      await seedReveals(supabase, sid, Date.parse(s.created_at as string) || Date.now())
      return jsonResponse({ ok: true, seeded: REVEAL_PLAN.length }, 200)
    }

    // ── action: fire (ADMIN TEST — wymuś reveal teraz, bez bramki/due) ──
    //    domyślnie PODGLĄD (zwraca HTML maila bez wysyłki); send:true wysyła
    if (body.action === 'fire') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = (body.sessionId || '').trim()
      const { data: s } = await supabase.from('spar_sessions').select(SESSION_COLS).eq('id', sid).maybeSingle()
      if (!s) return jsonResponse({ error: 'brak_sesji' }, 404)
      await seedReveals(supabase, sid, Date.parse(s.created_at as string) || Date.now())
      const { data: reveals } = await supabase.from('spar_reveals').select('*').eq('session_id', sid).order('seq')
      const target = (reveals || []).find((r) => body.key ? r.key === body.key : r.status !== 'sent')
      if (!target) return jsonResponse({ ok: true, info: 'brak reveala do odpalenia' }, 200)
      // upewnij się, że artefakt istnieje (generuj jeśli brak) — żeby podgląd miał treść
      const ready = await artifactReady(supabase, target.key, s)
      if (!ready) { await triggerGeneration(target.key, sid, SERVICE_KEY); await supabase.from('spar_reveals').update({ status: 'generating', updated_at: new Date().toISOString() }).eq('id', target.id); return jsonResponse({ ok: true, key: target.key, result: 'generating', info: 'artefakt w generacji — ponów za chwilę' }, 200) }
      if (body.send) {
        const result = await processReveal(supabase, SUPABASE_URL, SERVICE_KEY, s, target)
        return jsonResponse({ ok: true, key: target.key, result, sent: result === 'sent' }, 200)
      }
      // podgląd bez wysyłki — ten sam mail, który pójdzie (cache w meta)
      const { subject, html } = await getRevealEmail(supabase, target, s)
      return jsonResponse({ ok: true, key: target.key, result: 'preview', preview: { subject, html, to: s.email } }, 200)
    }

    // ── action: templates (ADMIN — galeria szablonów reveali, dane przykładowe) ──
    if (body.action === 'templates') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      // Galeria pokazuje STYL/strukturę (statyczny szablon, bez kosztu GPT).
      // Realne maile per lead są personalizowane przez GPT (podgląd w karcie leada).
      const sample = sampleSession()
      const out: { group: string; kind: string; key: string; seq: number; subject: string; html: string }[] = []
      for (const r of REVEAL_PLAN) {
        const viewUrl = await revealView(supabase, sample, r.key)
        const { subject, html } = staticReveal(sample, r.key, viewUrl, checkoutLink(null))
        out.push({ group: 'drip', kind: r.emailKind, key: r.key, seq: r.seq, subject, html })
      }
      return jsonResponse({ templates: out }, 200)
    }

    // ── CRON RUN ──
    if (!isCron && !isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
    const hour = warsawHour()
    if (hour < 8 || hour >= 20) return jsonResponse({ ok: true, quiet_hours: true }, 200)

    // 1) seed: zielone sesje bez planu
    const { data: green } = await supabase.from('spar_sessions')
      .select('id, created_at').eq('is_test', false).eq('verdict', 'zielony').is('paid_at', null).limit(200)
    for (const g of green || []) {
      const { count } = await supabase.from('spar_reveals').select('id', { count: 'exact', head: true }).eq('session_id', g.id)
      if (!count) await seedReveals(supabase, g.id, Date.parse(g.created_at as string) || Date.now())
    }

    // 2) przetwórz due reveale (pending/generating, due_at<=now) z bramką
    const nowIso = new Date().toISOString()
    const { data: due } = await supabase.from('spar_reveals')
      .select('*').in('status', ['pending', 'generating']).lte('due_at', nowIso).order('due_at').limit(120)
    let fired = 0
    const processed: Record<string, number> = {}
    for (const rv of due || []) {
      if (fired >= MAX_FIRES_PER_RUN) break
      const { data: s } = await supabase.from('spar_sessions').select(SESSION_COLS).eq('id', rv.session_id).maybeSingle()
      if (!s || s.is_test || !s.email || s.paid_at || s.verdict !== 'zielony') continue
      // R1 leci zawsze; R2+ wymaga zaangażowania, inaczej PAUZA
      if (rv.seq > 1 && rv.status === 'pending') {
        const engaged = await isEngaged(supabase, s)
        if (!engaged) { await supabase.from('spar_reveals').update({ status: 'paused', updated_at: nowIso }).eq('id', rv.id); continue }
      }
      const result = await processReveal(supabase, SUPABASE_URL, SERVICE_KEY, s, rv)
      processed[result] = (processed[result] || 0) + 1
      if (result === 'sent') fired++
    }

    // 3) wznowienie: zapauzowane reveale, których lead znów się zaangażował
    const { data: paused } = await supabase.from('spar_reveals').select('*').eq('status', 'paused').limit(120)
    for (const rv of paused || []) {
      const { data: s } = await supabase.from('spar_sessions').select(SESSION_COLS).eq('id', rv.session_id).maybeSingle()
      if (!s || s.paid_at || s.verdict !== 'zielony') continue
      if (await isEngaged(supabase, s)) {
        await supabase.from('spar_reveals').update({ status: 'pending', due_at: nowIso, updated_at: nowIso }).eq('id', rv.id)
      }
    }

    return jsonResponse({ ok: true, processed, fired }, 200)
  } catch (e) {
    console.error('[spar-drip] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500)
  }
})
