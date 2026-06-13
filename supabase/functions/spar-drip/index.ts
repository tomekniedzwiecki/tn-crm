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

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
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
function btn(href: string, label: string, primary = true): string {
  const bg = primary ? 'linear-gradient(135deg,#6db3ff,#4d9fff)' : '#101216'
  const col = primary ? '#061320' : '#cfe0ff'
  const bord = primary ? '' : 'border:1px solid #2b3a52;'
  return `<table cellpadding="0" cellspacing="0" style="margin:14px 0 4px;"><tr><td style="border-radius:999px;background:${bg};${bord}">
    <a href="${href}" style="display:inline-block;padding:13px 28px;color:${col};font-weight:700;font-size:15px;text-decoration:none;">${label}</a>
  </td></tr></table>`
}
function emailWrap(inner: string, sid: string, leadId: string | null, viewHref: string, viewLabel: string): string {
  // Każdy mail: treść + akcja „zobacz" + CTA rezerwacji 500 zł (start budowy).
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;max-width:560px;">
    ${inner}
    ${btn(viewHref, viewLabel, true)}
    <div style="margin-top:26px;padding-top:18px;border-top:1px solid #e6e9ef;font-size:14px;color:#3a3a3a;">
      <p style="margin:0 0 4px;">Chcesz, żebyśmy ruszyli z tym razem i żebym <strong>zbudował ten biznes</strong> z Tobą?</p>
      <p style="margin:0;color:#555;">Zaczynamy od rezerwacji wspólnej rozmowy — 500 zł, <strong>w pełni zwrotne</strong>. Przygotowuję wtedy osobiście plan przedsięwzięcia i odzywam się do Ciebie.</p>
      ${btn(checkoutLink(leadId), 'Zarezerwuję rozmowę → 500 zł', false)}
    </div>
    <p style="margin-top:24px;color:#888;font-size:13px;">— Tomek</p>
  </div>`
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

// Treść reveal-maila per artefakt
// deno-lint-ignore no-explicit-any
async function buildReveal(supabase: ReturnType<typeof createClient>, key: string, s: any): Promise<{ subject: string; html: string }> {
  const hi = firstName(s) ? `Cześć ${firstName(s)}!` : 'Cześć!'
  const nazwa = toolName(s)
  const lead = s.lead_id || null
  if (key === 'prototyp') {
    const url = (await prototypeUrl(supabase, s.id)) || panelLink(s.id, 'reveal_prototyp', '#projekt-prototyp')
    return {
      subject: `${nazwa} — na koniec zostawiłem najlepsze: dotknij swojej aplikacji`,
      html: emailWrap(`<p>${hi}</p>
        <p>Przeszliśmy przez rynek, liczby, stronę i plan sprzedaży. Na koniec zostawiłem to, co robi największe wrażenie: <strong>klikalny prototyp</strong> Twojego narzędzia <strong>${nazwa}</strong>.</p>
        <p>To nie obrazek ani makieta, tylko działająca aplikacja — wejdź, kliknij, wpisz coś i zobacz, jak reaguje. Tak będzie wyglądać i działać Twój produkt.</p>`,
        s.id, lead, url, 'Dotknij swojej aplikacji →'),
    }
  }
  if (key === 'rynek') {
    const r = s.market_report || {}
    const teza = typeof r.teza === 'string' ? r.teza : ''
    const oc = typeof r.ocena_potencjalu === 'string' ? r.ocena_potencjalu : ''
    return {
      subject: `${nazwa}: sprawdziłem Twój rynek (realny research)`,
      html: emailWrap(`<p>${hi}</p>
        <p>Sprawdziłem rynek wokół <strong>${nazwa}</strong> — w internecie, nie „z głowy": konkurenci z cenami, wielkość niszy, trendy, wszystko z podlinkowanymi źródłami.${oc ? ` Ocena potencjału: <strong>${oc}</strong>.` : ''}</p>
        ${teza ? `<p style="border-left:3px solid #4d9fff;padding:2px 0 2px 14px;color:#444;">${teza}</p>` : ''}`,
        s.id, lead, panelLink(s.id, 'reveal_rynek', '#rynek'), 'Zobacz raport rynku →'),
    }
  }
  if (key === 'economics') {
    const p = s.business_plan || {}
    const cena = typeof p.cena === 'number' ? `${p.cena} ${typeof p.cena_jednostka === 'string' ? p.cena_jednostka : 'zł/mies.'}` : ''
    return {
      subject: `${nazwa}: czy to się spina finansowo? Policzyłem`,
      html: emailWrap(`<p>${hi}</p>
        <p>Najważniejsze pytanie przy każdym biznesie: <strong>czy to się spina</strong>. Policzyłem model cenowy${cena ? ` (cena ${cena})` : ''}, koszt pozyskania klienta, wartość klienta i moment, w którym zwraca się budowa.</p>
        <p>W panelu możesz pokręcić suwakami i zobaczyć, jak liczby zmieniają się przy Twoich założeniach — łącznie z drogą do 50 klientów.</p>`,
        s.id, lead, panelLink(s.id, 'reveal_economics', '#projekt-economics'), 'Sprawdź, czy to się spina →'),
    }
  }
  if (key === 'landing') {
    const url = s.landing_url || panelLink(s.id, 'reveal_landing', '#projekt-strona')
    return {
      subject: `${nazwa} ma już stronę sprzedażową — zobacz`,
      html: emailWrap(`<p>${hi}</p>
        <p>Zbudowała się <strong>działająca strona sprzedażowa</strong> Twojego narzędzia <strong>${nazwa}</strong>. To prawdziwa strona w przeglądarce, nie grafika — otwórz, przewiń, pokaż znajomym z branży.</p>`,
        s.id, lead, url, 'Otwieram stronę →'),
    }
  }
  // gtm
  const g = s.gtm || {}
  const nKan = g.playbook && Array.isArray(g.playbook.kanaly) ? g.playbook.kanaly.length : 0
  const nRek = g.pakiet && Array.isArray(g.pakiet.reklamy) ? g.pakiet.reklamy.length : 0
  const banner = (() => {
    const r = g.pakiet && Array.isArray(g.pakiet.reklamy) ? g.pakiet.reklamy.find((x: Record<string, unknown>) => typeof x?.banner_url === 'string' && x.banner_url) : null
    return r ? (r.banner_url as string) : null
  })()
  return {
    subject: `${nazwa}: gdzie znaleźć pierwszych klientów (+ gotowe reklamy)`,
    html: emailWrap(`<p>${hi}</p>
      <p>Przygotowałem konkretny plan zdobycia pierwszych klientów dla <strong>${nazwa}</strong>: ${nKan ? `${nKan} miejsc, gdzie już są (z pierwszym ruchem), ` : ''}gotowe skrypty, obiekcje z odpowiedziami${nRek ? ` i <strong>${nRek} gotowe reklamy</strong> — z copy i kreacjami` : ''}.</p>
      ${banner ? `<p><img src="${banner}" alt="Przykładowa kreacja reklamy" style="width:100%;max-width:420px;border-radius:12px;border:1px solid #e6e9ef;"></p>` : ''}`,
    s.id, lead, panelLink(s.id, 'reveal_gtm', '#projekt-gtm'), 'Zobacz plan sprzedaży →'),
  }
}

const SESSION_COLS = 'id, email, name, verdict, paid_at, preview_brief, business_plan, market_report, economics, gtm, landing_url, lead_id, last_user_at, last_panel_at, created_at, is_test'

// Czy lead jest ZAANGAŻOWANY (bramka): aktywność w panelu/rozmowie w oknie LUB
// otworzył którykolwiek reveal-mail.
// deno-lint-ignore no-explicit-any
async function isEngaged(supabase: ReturnType<typeof createClient>, s: any): Promise<boolean> {
  const win = Date.now() - ENGAGE_WINDOW_DAYS * 86400000
  const lp = s.last_panel_at ? Date.parse(s.last_panel_at) : 0
  const lu = s.last_user_at ? Date.parse(s.last_user_at) : 0
  if (lp >= win || lu >= win) return true
  const { count } = await supabase.from('spar_emails').select('id', { count: 'exact', head: true })
    .eq('session_id', s.id).like('kind', 'reveal_%').not('opened_at', 'is', null)
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
async function sendReveal(supabase: ReturnType<typeof createClient>, SUPABASE_URL: string, SERVICE_KEY: string, emailKind: string, s: any): Promise<boolean> {
  if (!s.email) return false
  const { data: claim, error: claimErr } = await supabase.from('spar_emails')
    .upsert([{ session_id: s.id, kind: emailKind, email: s.email }], { onConflict: 'session_id,kind', ignoreDuplicates: true }).select('id')
  if (claimErr) { console.error('[spar-drip] claim error:', claimErr); return false }
  if (!claim || !claim.length) return true // już wysłany
  const { subject, html } = await buildReveal(supabase, emailKind.replace('reveal_', ''), s)
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
  const ok = await sendReveal(supabase, SUPABASE_URL, SERVICE_KEY, reveal.email_kind, s)
  if (ok) { await supabase.from('spar_reveals').update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reveal.id); return 'sent' }
  return 'ready'
}

Deno.serve(async (req) => {
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
      const { subject, html } = await buildReveal(supabase, target.email_kind.replace('reveal_', ''), s)
      if (body.send) {
        const result = await processReveal(supabase, SUPABASE_URL, SERVICE_KEY, s, target)
        return jsonResponse({ ok: true, key: target.key, result, sent: result === 'sent', subject }, 200)
      }
      // podgląd bez wysyłki
      return jsonResponse({ ok: true, key: target.key, result: 'preview', preview: { subject, html, to: s.email } }, 200)
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
