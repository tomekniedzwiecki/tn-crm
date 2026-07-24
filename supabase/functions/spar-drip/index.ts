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
import { REVEAL_PLAN, PANEL_VISITS_GATE } from "../_shared/spar-reveal-plan.ts";

const SPARING_URL = 'https://tomekniedzwiecki.pl/aplikacja/sparing/'
const CHECKOUT_URL = 'https://crm.tomekniedzwiecki.pl/checkout/v2/'
const OFFER_ID = Deno.env.get('SPAR_OFFER_ID') || 'a1656695-db0d-4ae7-b107-230832042076'
const FN = (name: string) => `${Deno.env.get('SUPABASE_URL')}/functions/v1/${name}`

// Plan sekwencji — kolejność + kadencja (dni od zielonego werdyktu).
// day = kiedy reveal staje się due; gate bramkuje od R2 w górę.
// Prototyp (klikalne, działające narzędzie) celowo NA KOŃCU — to najmocniejszy
// argument, finał sekwencji dla niezdecydowanych. Wcześniej budujemy kontekst:
// rynek → opłacalność → strona → sprzedaż, a potem „dotknij swojej aplikacji".
// Kadencja skompresowana do ~tygodnia (2026-06-13): lead najgorętszy tuż po
// werdykcie, finał (prototyp) ma trafić póki ciepły. Odstępy 1–2 dni.
// v2 „drip tanich + bramka drogich" (2026-06-15, decyzja Tomka):
//  • TANIE (rynek/economics/gtm) — generowane od razu i wysyłane KAŻDY OSOBNYM
//    mailem w krótkim odstępie (0h / 5h / 10h od werdyktu), BEZ bramki — to one
//    są driverem do panelu i przerywają pętlę „nie zaangażuje się, bo nie dostał
//    maila". Zastępują jeden zbiorczy „komplet gotowy" (wyłączony w spar-followups).
//  • GATED (landing/prototyp) — DROGIE (~$0,45/szt.); ~day 1/2, generowane i
//    wysyłane TYLKO gdy lead realnie wszedł do panelu (last_panel_at) i nie
//    zapłacił. Brak zaangażowania → nie palimy kasy.
// Offsety w GODZINACH od werdyktu (sub-dobowe, by tanie maile nie szły naraz).
// REVEAL_PLAN + bramki (gate per reveal) = JEDNO źródło w ../_shared/spar-reveal-plan.ts
// (import wyżej). Tu już NIE definiujemy planu — rozjazd kopii był źródłem bugów.
const ENGAGE_WINDOW_DAYS = 3    // brak aktywności dłużej niż to → PAUZA kolejnych odsłon (odwracalne)
const LOST_WINDOW_DAYS = 7      // brak aktywności dłużej niż to → PRZEGRANY (twardy koniec, bez wznawiania)
// Min. odstęp między DWOMA odsłonami tej samej sesji — bezpiecznik na „nadrabianie"
// wielu zaległych due naraz (lead z wieczora/nocy: rynek/economics/gtm wpadają rano
// w jedno okno 8–23). 90 min => 3 zaległe rozłożą się na ~3h rano, nie w serię i nie
// na cały dzień. Świeży lead w godzinach ma odstępy 5h/5h, więc i tak nie kąsa.
const REVEAL_MIN_GAP_MS = 90 * 60 * 1000
const MAX_FIRES_PER_RUN = 12

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}
// Koszt SMS = segmenty (points z SMSAPI) × 0,10 zł → USD bieżącym kursem settings.usd_pln_rate.
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
  return parseInt(new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false }).format(new Date()), 10)
}
function panelLink(sid: string, campaign: string, hash = ''): string {
  return `${SPARING_URL}?id=${sid}&utm_source=email&utm_medium=drip&utm_campaign=${campaign}${hash}`
}
function checkoutLink(leadId: string | null): string {
  return `${CHECKOUT_URL}?offer=${OFFER_ID}${leadId ? `&lead=${encodeURIComponent(leadId)}` : ''}&utm_source=email&utm_medium=drip`
}
// Model do personalizacji treści maili (tani gpt-5.1; ~kilka groszy/mail).
const OPENAI_MODEL = Deno.env.get('SPAR_EMAIL_MODEL') || 'gpt-5.6-sol'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.6-sol': { i: 5, c: 0.5, o: 30 }, 'gpt-5.6-terra': { i: 2.5, c: 0.25, o: 15 }, 'gpt-5.6-luna': { i: 1, c: 0.1, o: 6 }, 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }

// Prompty dripu: JEDNO źródło = settings (rejestr _shared/spar-prompts.ts).
// SITUATION + SYSTEM ładowane raz na cold-start (ensureDripPrompts). W szablonie
// SYSTEM placeholdery {{SYTUACJA}} i {{MODEL_BLOCK}} podstawiane przy budowie promptu.
// Pusty fallback = bezpiecznik (→ statyczny reveal), NIE kopia treści.
let DRIP_SITUATION = ''
let DRIP_SYSTEM = ''
let DRIP_CELE: Record<string, string> = {}
async function ensureDripPrompts(supabase: ReturnType<typeof createClient>): Promise<void> {
  if (DRIP_SYSTEM) return
  try {
    const { data } = await supabase.from('settings').select('key, value')
      .in('key', ['aplikacja_drip_sytuacja', 'aplikacja_drip_system', 'aplikacja_drip_cele'])
    const ev = (k: string) => ((data || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''
    DRIP_SITUATION = ev('aplikacja_drip_sytuacja')
    DRIP_SYSTEM = ev('aplikacja_drip_system')
    try { DRIP_CELE = JSON.parse(ev('aplikacja_drip_cele') || '{}') } catch (pErr) { console.error('[spar-drip] cele JSON parse:', pErr); DRIP_CELE = {} }
  } catch (_e) { /* fallback: puste → statyczny reveal (bezpiecznik) */ }
}

// Model biznesowy — JEDNO źródło (settings.aplikacja_model_biznesowy), ładowane raz w handlerze.
let MODEL_BLOCK = ''

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
// funkcje zwracają cached jeśli już jest. Zwraca wynik, by processReveal wiedział,
// czy generacja padła CICHO (403 owner-gate / 502 openai / wyjątek) — inaczej reveal
// wisiał wiecznie w 'generating' i nic tego nie wykrywało.
// Autoryzacja: klucz serwisowy → generatory rozpoznają go jako zaufany internal
// (isTrustedInternalCall) i OMIJAJĄ bramkę właściciela (sesje przypięte do konta).
async function triggerGeneration(key: string, sid: string, serviceKey: string): Promise<{ ok: boolean; error?: string }> {
  const map: Record<string, string> = { prototyp: 'spar-prototype', rynek: 'spar-raport', economics: 'spar-economics', landing: 'spar-landing', gtm: 'spar-gtm' }
  const fn = map[key]
  if (!fn) return { ok: false, error: 'nieznany_artefakt' }
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }
  try {
    const res = await fetch(FN(fn), { method: 'POST', headers, body: JSON.stringify({ sessionId: sid }) })
    // gtm: po copy dociągamy banery (osobna akcja w tle)
    if (key === 'gtm') {
      await fetch(FN('spar-gtm'), { method: 'POST', headers, body: JSON.stringify({ sessionId: sid, action: 'banners' }) }).catch(() => {})
    }
    // 200 = wygenerowane/cache; 202 = w toku (lock zajęty) — OBA OK (artefakt dojdzie).
    // 4xx/5xx (403 owner-gate, 400 brak_karty, 502 openai) = realny błąd generacji.
    if (res.ok || res.status === 202) return { ok: true }
    const body = (await res.text().catch(() => '')).slice(0, 180)
    console.error('[spar-drip] trigger', key, 'HTTP', res.status, body)
    return { ok: false, error: `${fn} HTTP ${res.status}${body ? ' ' + body : ''}` }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[spar-drip] trigger', key, 'error:', msg)
    return { ok: false, error: `${fn} wyjątek: ${msg}` }
  }
}

// ── Alert #sparing: definitywny pad generacji artefaktu (/aplikacja) ──
// Wysyłka przez slack-notify (typ 'spar_gen_error', kanał #sparing). Fire-and-forget
// z perspektywy logiki — błąd Slacka nie może wywrócić crona. Dedup NATURALNY: alert
// leci tylko przy przejściu reveala w 'failed' (a ten wypada z kolejki due) → RAZ na
// artefakt/sesję.
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) return
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error('[spar-drip] slack-notify', type, 'HTTP', res.status)
  } catch (e) { console.error('[spar-drip] slack-notify', type, 'exception:', e instanceof Error ? e.message : String(e)) }
}
// deno-lint-ignore no-explicit-any
async function notifyGenErrorSlack(s: any, key: string, error: string, count: number): Promise<void> {
  const brief = (s.preview_brief && typeof s.preview_brief === 'object') ? s.preview_brief as Record<string, unknown> : null
  await postSlackSparing('spar_gen_error', {
    session_id: s.id, funnel: 'aplikacja',
    name: s.name ?? null, email: s.email ?? null,
    project_name: (brief && brief.nazwa) ?? null,
    artifact: key, error: String(error || '').slice(0, 280), count,
  })
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

function clipJson(o: unknown, n: number): string { try { const t = JSON.stringify(o); return t && t !== '{}' && t !== 'null' ? t.slice(0, n) : '' } catch { return '' } }

// Cel maila + PRAWDZIWE dane z tego etapu (surowe, by GPT cytował konkrety).
// deno-lint-ignore no-explicit-any
function revealBrief(s: any, key: string): { goal: string; facts: string } {
  const r = s.market_report || {}, p = s.business_plan || {}, e = s.economics || {}, g = s.gtm || {}
  if (key === 'rynek') {
    return {
      goal: DRIP_CELE['rynek'] || '',
      facts: clipJson({ teza: r.teza, ocena_potencjalu: r.ocena_potencjalu, uzasadnienie: r.ocena_uzasadnienie, konkurenci: Array.isArray(r.konkurenci) ? r.konkurenci.slice(0, 4) : undefined, rynek: r.rynek, trendy: Array.isArray(r.trendy) ? r.trendy.slice(0, 3) : undefined, wnioski: Array.isArray(r.co_to_oznacza) ? r.co_to_oznacza.slice(0, 4) : undefined }, 2600),
    }
  }
  if (key === 'economics') {
    return {
      goal: DRIP_CELE['economics'] || '',
      facts: clipJson({ cennik: e.cennik, wejscia: e.wejscia, komentarz: e.komentarz, cena_z_planu: p.cena, kamienie: Array.isArray(p.kamienie) ? p.kamienie : undefined }, 2400),
    }
  }
  if (key === 'landing') return { goal: DRIP_CELE['landing'] || '', facts: '' }
  if (key === 'prototyp') return { goal: DRIP_CELE['prototyp'] || '', facts: '' }
  return {
    goal: DRIP_CELE['gtm'] || '',
    facts: clipJson({ kanaly: g.playbook && Array.isArray(g.playbook.kanaly) ? g.playbook.kanaly.slice(0, 5) : undefined, obiekcje: g.playbook && Array.isArray(g.playbook.obiekcje) ? g.playbook.obiekcje.slice(0, 3) : undefined, reklamy: g.pakiet && Array.isArray(g.pakiet.reklamy) ? g.pakiet.reklamy.slice(0, 3).map((x: Record<string, unknown>) => ({ koncept: x.koncept, naglowek: x.naglowek })) : undefined }, 2200),
  }
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
async function generateRevealEmail(s: any, key: string, viewUrl: string, reserveUrl: string | null): Promise<{ subject: string; html: string; sms: string | null; usage: { i: number; c: number; o: number } | null } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return null
  if (!DRIP_SYSTEM) return null // prompt z settings nie załadowany → statyczny reveal (bezpiecznik)
  const brief = revealBrief(s, key)
  const b = s.preview_brief || {}
  const karta = (s.problem_summary || {}) as Record<string, unknown>
  const ekrany = Array.isArray(b.ekrany) ? b.ekrany.slice(0, 6).map((x: unknown) => typeof x === 'string' ? x : (((x as Record<string, unknown>) || {}).nazwa || '')).filter(Boolean).join(', ') : ''
  const kartaTxt = clipJson(karta, 900)
  const ctx = [
    `Narzędzie: ${toolName(s)}`,
    typeof b.opis === 'string' && b.opis && `Opis: ${b.opis}`,
    typeof b.dla_kogo === 'string' && b.dla_kogo && `Dla kogo: ${b.dla_kogo}`,
    ekrany && `Ekrany/funkcje narzędzia: ${ekrany}`,
    kartaTxt && `Karta projektu (problem, klienci, zakres): ${kartaTxt}`,
    firstName(s) && `Imię odbiorcy: ${firstName(s)}`,
  ].filter(Boolean).join('\n')
  // SYSTEM z settings (aplikacja_drip_system) — placeholdery podstawiane literalnie (bez $-magii replace).
  const SYSTEM = DRIP_SYSTEM.split('{{SYTUACJA}}').join(DRIP_SITUATION).split('{{MODEL_BLOCK}}').join(MODEL_BLOCK)
  const user = `DANE TEGO LEADA I JEGO POMYSŁU:\n${ctx}\n\nPRAWDZIWE DANE Z TEGO ETAPU (cytuj stąd konkrety):\n${brief.facts || '(brak dodatkowych — oprzyj się na pomyśle i karcie)'}\n\nCEL TEGO MAILA: ${brief.goal}`
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
    const sms = typeof obj.sms === 'string' && obj.sms.trim() ? obj.sms.trim() : null
    if (!subject || !body) return null
    return { subject, html: mdToHtml(body, viewUrl, reserveUrl), sms, usage }
  } catch (e) { console.error('[spar-drip] email gen error:', e instanceof Error ? e.message : String(e)); return null }
}

// Brandowany KRÓTKI link do panelu: tomekniedzwiecki.pl/p/{code} (rewrite Vercel
// → edge fn spar-go → 302 do panelu). Krótko, marka, zero UUID i utm w treści SMS
// (utm dokleja spar-go server-side). Kod = jeden na sesję (spar_short_links).
const SHORT_BASE = 'https://tomekniedzwiecki.pl'
function shortLink(code: string): string { return `${SHORT_BASE}/p/${code}` }
// Kod bez mylących znaków (0/O/1/l/I). 7 znaków z 54-znakowego alfabetu ≈ 1e12.
function randCode(len = 7): string {
  const a = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  const buf = new Uint8Array(len); crypto.getRandomValues(buf)
  let out = ''; for (let i = 0; i < len; i++) out += a[buf[i] % a.length]
  return out
}
// Pobierz/utwórz krótki kod dla sesji (idempotentne, odporne na równoległy insert).
async function getOrCreateShortCode(supabase: ReturnType<typeof createClient>, sid: string): Promise<string> {
  const { data: ex } = await supabase.from('spar_short_links').select('code').eq('session_id', sid).maybeSingle()
  if (ex && ex.code) return ex.code as string
  for (let i = 0; i < 3; i++) {
    const code = randCode()
    const { error } = await supabase.from('spar_short_links').insert({ code, session_id: sid })
    if (!error) return code
    const { data: again } = await supabase.from('spar_short_links').select('code').eq('session_id', sid).maybeSingle()
    if (again && again.code) return again.code as string   // równoległy insert — użyj istniejącego
  }
  return randCode()   // skrajna ostateczność
}
// Statyczny fallback SMS (gdy GPT nie dał pola sms) — bez polskich znaków.
// deno-lint-ignore no-explicit-any
function staticSms(s: any, key: string): string {
  const imie = firstName(s)
  const co: Record<string, string> = {
    rynek: 'raport Twojego rynku', economics: 'wyliczenie oplacalnosci',
    landing: 'Twoja strona', gtm: 'plan sprzedazy', prototyp: 'klikalny prototyp narzedzia',
  }
  const what = co[key] || 'nowy material'
  return `${imie ? 'Czesc ' + imie + '! ' : 'Czesc! '}W panelu czeka ${what} przygotowane pod Twoj pomysl - zerknij, jest na co popatrzec. ~Tomek`
}
// GSM-7 safe: transliteruje znaki spoza podstawowego GSM (polskie diakrytyki,
// typograficzne cudzysłowy „"''«», myślniki – —, wielokropek …), które inaczej
// wymuszają UCS-2 (70 zn./segment zamiast 160). Trzymamy cache czysty = to, co
// widać w adminie, jest tym, co realnie pójdzie.
const GSM_MAP: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  '„': '"', '”': '"', '“': '"', '‟': '"', '«': '"', '»': '"',
  '‚': "'", '’': "'", '‘': "'", '‛': "'", '–': '-', '—': '-', '‑': '-', '…': '...',
}
function gsmSafe(str: string): string {
  return String(str || '').split('').map((c) => (c in GSM_MAP ? GSM_MAP[c] : c)).join('')
}
// Złóż finalny SMS: tekst (GPT lub statyczny), GSM-safe, + krótki link w nowej linii.
function composeSms(text: string, code: string): string {
  const link = shortLink(code)
  // 306 = górna granica 2 segmentów GSM-7 (153×2). Tniemy TEKST, nie link —
  // link musi zostać klikalny. Margines na "\n" + długość linku.
  const max = 306 - link.length - 1
  const clean = gsmSafe((text || '').trim()).replace(/\s+$/g, '').slice(0, max)
  return `${clean}\n${link}`
}

// Mail reveala: cache w spar_reveals.meta.email -> GPT (raz) -> fallback statyczny.
// Dzięki cache podgląd == wysyłka i koszt GPT pada tylko raz na odsłonę.
// Przy okazji jednego strzału GPT cache'ujemy też SMS reaktywacyjny (meta.sms).
// deno-lint-ignore no-explicit-any
async function getRevealEmail(supabase: ReturnType<typeof createClient>, reveal: any, s: any): Promise<{ subject: string; html: string }> {
  const cached = reveal && reveal.meta && reveal.meta.email
  if (cached && typeof cached.subject === 'string' && typeof cached.html === 'string') return { subject: cached.subject, html: cached.html }
  const key = reveal.key
  const viewUrl = await revealView(supabase, s, key)
  const reserveUrl = s.email ? checkoutLink(s.lead_id || null) : null
  let email: { subject: string; html: string }
  let model: string | null = null
  let smsText: string
  const gen = await generateRevealEmail(s, key, viewUrl, reserveUrl)
  if (gen) {
    email = { subject: gen.subject, html: gen.html }; model = OPENAI_MODEL
    smsText = gen.sms || staticSms(s, key)
    if (gen.usage) { try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']; await supabase.from('spar_usage').insert({ session_id: s.id, kind: 'email', model: OPENAI_MODEL, input_tokens: gen.usage.i, cached_tokens: gen.usage.c, output_tokens: gen.usage.o, cost_usd: (Math.max(0, gen.usage.i - gen.usage.c) * p.i + gen.usage.c * p.c + gen.usage.o * p.o) / 1_000_000, meta: { view: 'reveal_email', key } }) } catch (uErr) { console.error('[spar-drip] email usage insert:', uErr) } }
  } else {
    email = staticReveal(s, key, viewUrl, reserveUrl)
    smsText = staticSms(s, key)
  }
  const code = await getOrCreateShortCode(supabase, s.id)
  const sms = composeSms(smsText, code)
  try { if (reveal.id) await supabase.from('spar_reveals').update({ meta: { ...(reveal.meta || {}), email: { subject: email.subject, html: email.html, model, at: new Date().toISOString() }, sms: { text: sms, model: gen && gen.sms ? model : null, at: new Date().toISOString() } }, updated_at: new Date().toISOString() }).eq('id', reveal.id) } catch (cErr) { console.error('[spar-drip] email cache:', cErr) }
  return email
}

// Treść SMS reaktywacyjnego dla danej odsłony: cache meta.sms (złożony przy mailu)
// -> fallback statyczny. SMS leci +24h po mailu, więc meta.sms zwykle już istnieje.
// deno-lint-ignore no-explicit-any
async function getRevealSms(supabase: ReturnType<typeof createClient>, reveal: any, s: any): Promise<string> {
  const cached = reveal && reveal.meta && reveal.meta.sms
  if (cached && typeof cached.text === 'string' && cached.text.trim()) return cached.text
  const key = (reveal && reveal.key) || 'rynek'
  const code = await getOrCreateShortCode(supabase, s.id)
  return composeSms(staticSms(s, key), code)
}

// Wyślij SMS przez funkcję send-sms (autoryzacja x-cron-secret). Zwraca wynik JSON.
// HARDENING: własny AbortController (timeout 20s) + 1 retry przy braku odpowiedzi.
// Diagnoza (2026-07-10): przy zamuleniu SMSAPI send-sms nie odpowiadał, a edge
// wall-clock potrafił ubić CAŁY cron dripa (19/32 reveal_rynek padło „no_response").
// send-sms ma już własny timeout 12s + retry; tu bronimy tylko crona przed zawisem
// jednego SMS-a (max ~2×20s). Retry TYLKO gdy brak/niepełna odpowiedź (timeout/wyjątek/
// nie-ok) — send-sms jest idempotentne po swojej stronie, więc nie mnożymy wysyłek.
async function sendSms(CRON_SECRET: string, to: string, message: string): Promise<{ ok?: boolean; id?: string; points?: number; status?: string; error?: unknown } | null> {
  const attempt = async (): Promise<{ ok: boolean; json: { ok?: boolean; id?: string; points?: number; status?: string; error?: unknown } | null }> => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 20000)
    try {
      const r = await fetch(FN('send-sms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON_SECRET },
        body: JSON.stringify({ action: 'send', to, message }),
        signal: ctrl.signal,
      })
      const json = await r.json().catch(() => null)
      return { ok: r.ok && !!json, json }
    } finally { clearTimeout(timer) }
  }
  for (let i = 0; i < 2; i++) {
    try {
      const { ok, json } = await attempt()
      if (ok) return json
      if (i === 0) { console.warn('[spar-drip] sms send: brak/niepełna odpowiedź — ponawiam raz'); continue }
      return json   // druga próba — oddaj co jest (send-sms zaloguje pad w spar_sms)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`[spar-drip] sms send error (próba ${i + 1}/2):`, msg)
      if (i === 0) continue
      return null
    }
  }
  return null
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

const SESSION_COLS = 'id, email, name, verdict, paid_at, full_paid_at, preview_brief, problem_summary, business_plan, market_report, economics, gtm, landing_url, lead_id, last_user_at, last_panel_at, panel_visits, seen_landing_at, sequence_cancelled_at, created_at, is_test, gen_error_count, wniosek_status'

// Po tylu NIEUDANYCH ponowieniach generacji (reveal wisi w 'generating', artefakt
// nie powstaje) uznajemy odsłonę za PADŁĄ: status 'failed' + alert #sparing.
// 'failed' wypada z kolejki due, więc przestaje wisieć i zżerać wywołania generatorów.
const MAX_GEN_ATTEMPTS = 3

// Czy lead jest ZAANGAŻOWANY (bramka): aktywność w panelu/rozmowie w oknie LUB
// otworzył którykolwiek reveal-mail.
// deno-lint-ignore no-explicit-any
// Najświeższy sygnał aktywności leada (ms): wejście do panelu, aktywność w
// rozmowie albo otwarcie któregoś maila sekwencji. To jedno źródło prawdy dla
// obu progów — „stygnący" (pauza) i „przegrany" (twardy koniec).
async function lastActivityMs(_supabase: ReturnType<typeof createClient>, s: any): Promise<number> {
  // Sygnał aktywności = wejście do panelu + aktywność w rozmowie. Otwarcia maili
  // celowo pominięte (wyłączone w Resend / niewiarygodne — false pos/neg).
  const lp = s.last_panel_at ? Date.parse(s.last_panel_at) : 0
  const lu = s.last_user_at ? Date.parse(s.last_user_at) : 0
  return Math.max(lp || 0, lu || 0)
}
async function isEngaged(supabase: ReturnType<typeof createClient>, s: any): Promise<boolean> {
  return (Date.now() - await lastActivityMs(supabase, s)) < ENGAGE_WINDOW_DAYS * 86400000
}
// Czas ostatniej WYSŁANEJ odsłony tej sesji (ms) — do wymuszenia min. odstępu
// między dwoma odsłonami (anti-burst przy nadrabianiu zaległych due).
async function lastRevealSentMs(supabase: ReturnType<typeof createClient>, sid: string): Promise<number> {
  const { data } = await supabase.from('spar_reveals').select('sent_at')
    .eq('session_id', sid).eq('status', 'sent').not('sent_at', 'is', null)
    .order('sent_at', { ascending: false }).limit(1)
  return data && data[0] && data[0].sent_at ? Date.parse(data[0].sent_at as string) : 0
}
// Bramka MIĘDZY-KANAŁOWA (spójna z spar-followups): czas ostatniego dotyku z
// INNEGO kanału — mail abandoned (kind ≠ reveal_*) lub dowolny SMS. Reveale są
// strukturalnie ≥~1 dzień po werdykcie, więc to zapas bezpieczeństwa, by reveal
// nie poszedł tuż po mailu/SMS gdyby harmonogram się kiedyś zmienił.
const CROSS_CHANNEL_GAP_MS = 10 * 3600 * 1000
// deno-lint-ignore no-explicit-any
async function recentNonRevealTouchMs(supabase: ReturnType<typeof createClient>, sid: string): Promise<number> {
  const since = new Date(Date.now() - CROSS_CHANNEL_GAP_MS).toISOString()
  const [em, sm] = await Promise.all([
    supabase.from('spar_emails').select('sent_at').eq('session_id', sid).not('kind', 'like', 'reveal_%').gte('sent_at', since).order('sent_at', { ascending: false }).limit(1),
    supabase.from('spar_sms').select('created_at').eq('session_id', sid).gte('created_at', since).order('created_at', { ascending: false }).limit(1),
  ])
  let m = 0
  const e = (em.data as { sent_at: string }[] | null)?.[0]?.sent_at
  const c = (sm.data as { created_at: string }[] | null)?.[0]?.created_at
  if (e) m = Math.max(m, Date.parse(e))
  if (c) m = Math.max(m, Date.parse(c))
  return m
}
// Zamknij leada-przegranego: wszystkie nie-wysłane odsłony → 'skipped'
// (koniec wysyłki, generowania i wznawiania). Idempotentne.
async function closeLost(supabase: ReturnType<typeof createClient>, sid: string, nowIso: string): Promise<void> {
  await supabase.from('spar_reveals').update({ status: 'skipped', updated_at: nowIso })
    .eq('session_id', sid).in('status', ['pending', 'generating', 'paused'])
}

// Utwórz wiersze planu dla sesji (idempotentne)
async function seedReveals(supabase: ReturnType<typeof createClient>, sid: string, verdictAt: number): Promise<void> {
  const rows = REVEAL_PLAN.map((r) => ({
    session_id: sid, key: r.key, seq: r.seq, email_kind: r.emailKind,
    due_at: new Date(verdictAt + r.h * 3600000).toISOString(), status: 'pending',
  }))
  await supabase.from('spar_reveals').upsert(rows, { onConflict: 'session_id,key', ignoreDuplicates: true })
}

// Podgląd 1:1 — składa finalny HTML (z doklejoną stopką) przez send-email (preview),
// bez wysyłki. Dzięki temu admin widzi dokładnie to, co dostanie odbiorca.
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
    const gen = await triggerGeneration(reveal.key, s.id, SERVICE_KEY)
    const nowIso = new Date().toISOString()
    // Licznik prób: rośnie, gdy reveal BYŁ już 'generating' (poprzedni przebieg
    // odpalił generację), a artefaktu wciąż nie ma — czyli realny nieudany retry.
    // Świeże 'pending' → 'generating' liczymy jako próbę 0 (dajemy generacji czas
    // do kolejnego crona; nie karzemy za normalną asynchroniczność).
    const wasGenerating = reveal.status === 'generating'
    const nextCount = (reveal.error_count || 0) + (wasGenerating ? 1 : 0)
    const errMsg = gen.error || (wasGenerating ? 'artefakt nie powstał mimo ponowienia (stale)' : null)
    if (wasGenerating && nextCount >= MAX_GEN_ATTEMPTS) {
      // Definitywny pad: zdejmij z kolejki (status 'failed'), policz na sesji, zaalarmuj.
      await supabase.from('spar_reveals').update({ status: 'failed', error_count: nextCount, last_error: (errMsg || 'generacja padła').slice(0, 500), last_error_at: nowIso, updated_at: nowIso }).eq('id', reveal.id)
      try { await supabase.from('spar_sessions').update({ gen_error_count: ((s.gen_error_count as number) || 0) + 1 }).eq('id', s.id) } catch (bErr) { console.error('[spar-drip] gen_error_count bump:', bErr) }
      await notifyGenErrorSlack(s, reveal.key, errMsg || 'generacja padła', nextCount)
      return 'failed'
    }
    await supabase.from('spar_reveals').update({ status: 'generating', error_count: nextCount, last_error: errMsg ? errMsg.slice(0, 500) : (reveal.last_error ?? null), last_error_at: errMsg ? nowIso : (reveal.last_error_at ?? null), updated_at: nowIso }).eq('id', reveal.id)
    return 'generating'
  }
  if (!reveal.generated_at) await supabase.from('spar_reveals').update({ generated_at: new Date().toISOString() }).eq('id', reveal.id)
  // v2: KAŻDA odsłona (też rynek/economics/gtm) idzie osobnym mailem. Tanie nie
  // są już ciche — to one budują zaangażowanie i prowadzą do panelu.
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
    if (!MODEL_BLOCK) { try { const { data: mb } = await supabase.from('settings').select('value').eq('key', 'aplikacja_model_biznesowy').single(); MODEL_BLOCK = (mb as { value?: string } | null)?.value || '' } catch (_e) { /* fallback: pusty blok */ } }
    await ensureDripPrompts(supabase) // SITUATION/SYSTEM/cele dripu z settings (raz na cold-start)

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
      return jsonResponse({ session: s ? { email: s.email, name: s.name, last_panel_at: s.last_panel_at, last_user_at: s.last_user_at, panel_visits: s.panel_visits, seen_landing_at: s.seen_landing_at, verdict: s.verdict, paid_at: s.paid_at, sequence_cancelled_at: s.sequence_cancelled_at, engaged } : null, reveals: reveals || [], emails: emails || [], plan: REVEAL_PLAN }, 200)
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
      // podgląd bez wysyłki — ten sam mail, który pójdzie (cache w meta) + stopka 1:1
      const { subject, html } = await getRevealEmail(supabase, target, s)
      const finalHtml = await withSignature(SUPABASE_URL, SERVICE_KEY, subject, html, s.email)
      return jsonResponse({ ok: true, key: target.key, result: 'preview', preview: { subject, html: finalHtml, to: s.email } }, 200)
    }

    // ── action: cancel / resume (ADMIN — ręczne wstrzymanie/wznowienie automatu) ──
    //    cancel: wstrzymuje sekwencję + follow-upy + SMS (flaga sequence_cancelled_at)
    //    i zamyka niewysłane odsłony. NIE blokuje ręcznego generowania z karty leada.
    //    resume: zdejmuje flagę i wznawia niewysłane odsłony (skipped → pending).
    if (body.action === 'cancel' || body.action === 'resume') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = (body.sessionId || '').trim()
      if (!sid) return jsonResponse({ error: 'brak_sesji' }, 400)
      const nowIso = new Date().toISOString()
      if (body.action === 'cancel') {
        await supabase.from('spar_sessions').update({ sequence_cancelled_at: nowIso, updated_at: nowIso }).eq('id', sid)
        await closeLost(supabase, sid, nowIso)   // pending/generating/paused → skipped
        return jsonResponse({ ok: true, cancelled: true }, 200)
      }
      await supabase.from('spar_sessions').update({ sequence_cancelled_at: null, updated_at: nowIso }).eq('id', sid)
      // Wznów niewysłane (skipped) ORAZ padłe (failed — reset licznika, świeża szansa
      // po naprawie root-cause). Nie ruszamy sent/paused.
      await supabase.from('spar_reveals').update({ status: 'pending', error_count: 0, last_error: null, updated_at: nowIso }).eq('session_id', sid).in('status', ['skipped', 'failed'])
      return jsonResponse({ ok: true, cancelled: false }, 200)
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
        out.push({ group: 'drip', kind: r.emailKind, key: r.key, seq: r.seq, subject, html: await withSignature(SUPABASE_URL, SERVICE_KEY, subject, html, null) })
      }
      return jsonResponse({ templates: out }, 200)
    }

    // ── CRON RUN ──
    if (!isCron && !isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
    const hour = warsawHour()
    // SEED działa 24/7 (plan reveali istnieje od razu po werdykcie — panel i bramki
    // działają też w nocy), ale WYSYŁKA maili i SMS tylko w oknie 8–23 PL (cutoff 23,
    // decyzja Tomka 2026-06-16 — łapie wieczorne odsłony, póki lead gorący).
    const inWindow = hour >= 8 && hour < 23

    // 1) seed: zielone sesje bez planu
    const { data: green } = await supabase.from('spar_sessions')
      .select('id, created_at').eq('is_test', false).eq('verdict', 'zielony').is('paid_at', null).is('full_paid_at', null).is('sequence_cancelled_at', null).limit(200)
    for (const g of green || []) {
      const { count } = await supabase.from('spar_reveals').select('id', { count: 'exact', head: true }).eq('session_id', g.id)
      if (!count) await seedReveals(supabase, g.id, Date.parse(g.created_at as string) || Date.now())
    }

    // Poza oknem 8–23: plan zaseedowany, ale nic nie wysyłamy do rana.
    if (!inWindow) return jsonResponse({ ok: true, quiet_hours: true, seeded: (green || []).length }, 200)

    // 2) przetwórz due reveale (pending/generating, due_at<=now) z bramką
    const nowIso = new Date().toISOString()
    // 2a) Reaktywacja najmocniejszych assetów dla ZAKWALIFIKOWANYCH: landing/prototyp
    // porzucone (skipped) — bo lead wypadł z sekwencji zanim się zakwalifikował, albo
    // zakwalifikował się po jej wygaśnięciu. Wniosek przyjęty = argument domykający
    // należy się mimo bramki. skipped → pending (idempotentne: po wysyłce = sent, nie wraca).
    const { data: qSess } = await supabase.from('spar_sessions')
      .select('id').eq('is_test', false).eq('verdict', 'zielony').eq('wniosek_status', 'accepted')
      .is('paid_at', null).is('full_paid_at', null).is('sequence_cancelled_at', null).limit(200)
    const qIds = (qSess || []).map((x: { id: string }) => x.id)
    if (qIds.length) {
      await supabase.from('spar_reveals')
        .update({ status: 'pending', due_at: nowIso, error_count: 0, last_error: null, updated_at: nowIso })
        .in('session_id', qIds).in('key', ['landing', 'prototyp']).eq('status', 'skipped')
    }
    const { data: due } = await supabase.from('spar_reveals')
      .select('*').in('status', ['pending', 'generating']).lte('due_at', nowIso).order('due_at').order('seq').limit(120)
    let fired = 0
    const processed: Record<string, number> = {}
    const lostNow = new Set<string>()
    const sentThisRun = new Set<string>()   // max 1 odsłona / sesję / przebieg
    for (const rv of due || []) {
      if (fired >= MAX_FIRES_PER_RUN) break
      if (lostNow.has(rv.session_id)) continue   // sesja już zamknięta w tym przebiegu
      const { data: s } = await supabase.from('spar_sessions').select(SESSION_COLS).eq('id', rv.session_id).maybeSingle()
      if (!s || s.is_test || !s.email || s.paid_at || s.full_paid_at || s.verdict !== 'zielony' || s.sequence_cancelled_at) continue
      // Bramka między-kanałowa: świeży dotyk mailem/SMS z innego kanału → odpuść
      // ten przebieg (reveal zostaje pending/generating, ponowi się później).
      const xTouch = await recentNonRevealTouchMs(supabase, s.id)
      if (xTouch && Date.now() - xTouch < CROSS_CHANNEL_GAP_MS) continue
      // Bramka zaangażowania per reveal (plan w _shared): landing wymaga >=2
      // ODRĘBNYCH wizyt w panelu (panel_visits), prototyp — obejrzenia strony
      // sprzedażowej (seen_landing_at). Transakcyjne (rynek/economics/gtm) = 'none',
      // wysyłane zawsze. Brak zaangażowania → zostaw pending (nie pal kasy na drogi
      // artefakt); twardo zimny po LOST_WINDOW → zamknij, by reveal nie wisiał wiecznie.
      const step = REVEAL_PLAN.find((p) => p.key === rv.key)
      const gate = step ? step.gate : 'none'
      // Zakwalifikowani (wniosek przyjęty, brak rezerwacji) dostają najmocniejsze
      // assety (landing/prototyp) BEZ bramki zaangażowania — powiedzieli „tak", więc
      // generacja jest uzasadniona, a prototyp to argument domykający rezerwację.
      // Ich też NIE zamykamy jako „przegranych" po 7 dniach ciszy.
      const qualified = s.wniosek_status === 'accepted'
      if (gate !== 'none' && !qualified) {
        const inactive = Date.now() - await lastActivityMs(supabase, s)
        if (inactive >= LOST_WINDOW_DAYS * 86400000) { await closeLost(supabase, s.id, nowIso); lostNow.add(s.id); continue }
        if (gate === 'visits2' && (s.panel_visits || 0) < PANEL_VISITS_GATE) continue       // <2 wizyt → czekaj
        if (gate === 'seen_landing' && !s.seen_landing_at) continue                          // nie zobaczył strony → czekaj
      }
      // Anti-burst: jedna odsłona na sesję na przebieg + min. odstęp od poprzedniej
      // wysłanej (chroni przed serią maili przy nadrabianiu zaległych due).
      if (sentThisRun.has(rv.session_id)) continue
      const lastRev = await lastRevealSentMs(supabase, s.id)
      if (lastRev && Date.now() - lastRev < REVEAL_MIN_GAP_MS) continue
      const result = await processReveal(supabase, SUPABASE_URL, SERVICE_KEY, s, rv)
      processed[result] = (processed[result] || 0) + 1
      if (result === 'sent') { fired++; sentThisRun.add(rv.session_id) }
    }

    // 3) zapauzowane reveale: wznów (wrócił), zamknij (przegrany) albo zostaw
    const { data: paused } = await supabase.from('spar_reveals').select('*').eq('status', 'paused').limit(120)
    const closedLost = new Set<string>()
    for (const rv of paused || []) {
      if (closedLost.has(rv.session_id)) continue
      const { data: s } = await supabase.from('spar_sessions').select(SESSION_COLS).eq('id', rv.session_id).maybeSingle()
      if (!s || s.paid_at || s.full_paid_at || s.verdict !== 'zielony' || s.sequence_cancelled_at) continue
      const inactive = Date.now() - await lastActivityMs(supabase, s)
      // Zakwalifikowanych NIE zamykamy jako przegranych — wznawiamy ich odsłony niezależnie od ciszy.
      if (s.wniosek_status === 'accepted') {
        await supabase.from('spar_reveals').update({ status: 'pending', due_at: nowIso, updated_at: nowIso }).eq('id', rv.id)
      } else if (inactive >= LOST_WINDOW_DAYS * 86400000) {
        await closeLost(supabase, s.id, nowIso); closedLost.add(s.id)   // przegrany → koniec
      } else if (inactive < ENGAGE_WINDOW_DAYS * 86400000) {
        await supabase.from('spar_reveals').update({ status: 'pending', due_at: nowIso, updated_at: nowIso }).eq('id', rv.id)  // wrócił → wznów
      }
      // pomiędzy (3–7 dni ciszy) → zostaje w pauzie
    }

    // 4) SMS reaktywacyjny: mail odsłony sprzed >24h, lead nie-przegrany, z numerem
    //    + zgodą (bez opt-out), SMS jeszcze nie poszedł → wyślij przez send-sms.
    //    Bramka „nieaktywny" liczona dalej przez lastActivityMs (panel + rozmowa),
    //    NIE przez otwarcie maila (wyłączone/niewiarygodne).
    //    Cały przebieg za flagą SMS_ENABLED (przed pełną aktywacją konta SMSAPI = OFF).
    const SMS_ENABLED = (Deno.env.get('SMS_ENABLED') || '') === '1'
    let smsSent = 0
    if (SMS_ENABLED && CRON_SECRET) {
      const dayAgo = new Date(Date.now() - 86400000).toISOString()
      const { data: unopened } = await supabase.from('spar_emails')
        .select('session_id, kind, sent_at')
        .like('kind', 'reveal_%').lte('sent_at', dayAgo)
        .order('sent_at', { ascending: false }).limit(80)
      for (const em of unopened || []) {
        if (smsSent >= MAX_FIRES_PER_RUN) break
        const { count: smsDone } = await supabase.from('spar_sms').select('id', { count: 'exact', head: true }).eq('session_id', em.session_id).eq('kind', em.kind)
        if (smsDone) continue   // już wysłany SMS dla tej odsłony
        // Limit częstotliwości: max 1 SMS / 48h na leada (kilka nieotwartych odsłon
        // nie może zamienić się w serię SMS-ów pod rząd).
        const { count: recentSms } = await supabase.from('spar_sms').select('id', { count: 'exact', head: true }).eq('session_id', em.session_id).gte('created_at', new Date(Date.now() - 2 * 86400000).toISOString())
        if (recentSms) continue
        const { data: s } = await supabase.from('spar_sessions').select('id, name, email, phone, verdict, paid_at, full_paid_at, is_test, last_user_at, last_panel_at, sms_consent_at, sms_opt_out, sequence_cancelled_at').eq('id', em.session_id).maybeSingle()
        if (!s || s.is_test || s.paid_at || s.full_paid_at || s.verdict !== 'zielony' || s.sequence_cancelled_at) continue
        if (!s.phone || !s.sms_consent_at || s.sms_opt_out) continue   // brak numeru/zgody albo opt-out
        const inactive = Date.now() - await lastActivityMs(supabase, s)
        if (inactive < 86400000) continue                              // aktywny w ostatniej dobie → SMS redundantny
        if (inactive >= LOST_WINDOW_DAYS * 86400000) continue          // przegrany — nie zaczepiamy
        const { data: rv } = await supabase.from('spar_reveals').select('key, meta').eq('session_id', em.session_id).eq('email_kind', em.kind).maybeSingle()
        const text = await getRevealSms(supabase, rv || { key: (em.kind as string).replace('reveal_', ''), meta: null }, s)
        const res = await sendSms(CRON_SECRET, s.phone as string, text)
        await supabase.from('spar_sms').insert({
          session_id: s.id, kind: em.kind, phone: s.phone, message: text,
          smsapi_id: res && res.id ? res.id : null,
          points: res && typeof res.points === 'number' ? res.points : null,
          status: res && res.ok ? (res.status || 'SENT') : 'ERROR',
          meta: res && res.ok ? null : { error: res ? res.error : 'no_response' },
        })
        if (res && res.ok) {
          // KOSZT SMS → spar_usage (widoczny przy leadzie i w zakładce Koszty)
          try {
            const pts = typeof res.points === 'number' && res.points > 0 ? res.points : 1
            const rate = await usdPlnRate(supabase)
            const pln = pts * SMS_PLN_PER_POINT
            await supabase.from('spar_usage').insert({
              session_id: s.id, kind: 'sms', model: 'smsapi', input_tokens: 0, cached_tokens: 0, output_tokens: 0, images: 0,
              cost_usd: pln / rate, meta: { view: 'sms', kind: em.kind, points: pts, pln, rate },
            })
          } catch (uErr) { console.error('[spar-drip] sms usage insert:', uErr) }
          smsSent++
        }
      }
    }

    return jsonResponse({ ok: true, processed, fired, smsSent }, 200)
  } catch (e) {
    console.error('[spar-drip] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500)
  }
})
