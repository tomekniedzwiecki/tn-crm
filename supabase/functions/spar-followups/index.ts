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
//   abandoned_chat     — email jest, brak werdyktu, ostatnia aktywność 3–48 h temu
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
// okno 8:00–20:00 Europe/Warsaw, max 30 maili/run.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SPARING_URL = 'https://tomekniedzwiecki.pl/aplikacja/sparing/'
const MAX_PER_RUN = 30

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

function chatLink(sessionId: string, campaign: string, hash = ''): string {
  return `${SPARING_URL}?id=${sessionId}&utm_source=email&utm_medium=followup&utm_campaign=${campaign}${hash}`
}
function checkoutLink(leadId: string | null): string {
  return `${CHECKOUT_URL}?offer=${OFFER_ID}${leadId ? `&lead=${encodeURIComponent(leadId)}` : ''}&utm_source=email&utm_medium=followup`
}
function escHtml(s: string): string { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// Body (zwykły tekst) -> minimalny HTML „jak pisany w skrzynce". Linki TYLKO
// przez tokeny [tekst](LINK_VIEW)/[tekst](LINK_RESERVE). Podpis dokleja send-email.
function mdToHtml(body: string, viewUrl: string | null, reserveUrl: string | null): string {
  let t = escHtml(body || '')
  if (viewUrl) t = t.replace(/\[([^\]]+)\]\(LINK_VIEW\)/g, (_m, l) => `<a href="${viewUrl}" style="color:#2563eb;">${l}</a>`)
  t = t.replace(/\[([^\]]+)\]\(LINK_RESERVE\)/g, (_m, l) => reserveUrl ? `<a href="${reserveUrl}" style="color:#2563eb;">${l}</a>` : String(l))
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  if (viewUrl && t.indexOf(viewUrl) < 0) t += `\n\nWszystko jest w Twoim panelu: <a href="${viewUrl}" style="color:#2563eb;">${viewUrl}</a>`
  const paras = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const inner = paras.map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br>')}</p>`).join('')
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">${inner}</div>`
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
  return chatLink(s.id, 'abandoned_chat')
}
function viewFor(kind: string, s: SessionRow): string | null { return kind === 'paid_welcome' ? null : followupView(kind, s) }
function reserveFor(kind: string, s: SessionRow): string | null { return (kind === 'verdict_last_call' || kind === 'verdict_no_payment') ? checkoutLink(s.lead_id) : null }

// Statyczny mail (plain, „z palca") — gallery podglądu + fallback gdy GPT off.
function staticEmail(kind: string, s: SessionRow): { subject: string; html: string } {
  const im = firstName(s) ? ` ${firstName(s)}` : ''
  const n = toolName(s)
  const T: Record<string, { subject: string; body: string }> = {
    abandoned_chat: { subject: 'Twój projekt czeka dokończony w połowie', body: `Cześć${im}!\n\nZacząłeś projektować swoje narzędzie w rozmowie z moim AI i zatrzymaliśmy się w pół drogi. Cała rozmowa jest zapisana — wracasz dokładnie w to samo miejsce.\n\nKilka minut dzieli Cię od karty projektu i pierwszych ekranów. [Dokończmy to](LINK_VIEW).` },
    verdict_no_payment: { subject: `${n}: projekt i plan czekają`, body: `Cześć${im}!\n\nProjekt ${n} ma zielony werdykt — karta, ekrany i wstępny plan przychodu czekają w panelu.\n\nKolejny krok to rezerwacja wspólnej rozmowy (500 zł, w pełni zwrotne): przygotowuję wtedy osobiście plan przedsięwzięcia. Możesz [zarezerwować ją tutaj](LINK_RESERVE), a [projekt zobaczysz w panelu](LINK_VIEW).` },
    verdict_last_call: { subject: `${n} — domykam miejsce na ten projekt`, body: `Cześć${im}!\n\nTydzień temu ${n} dostał zielony werdykt. Karta, ekrany i plan wciąż czekają w panelu — nic nie przepadło.\n\nJeśli to nie ten moment — w porządku, projekt zostaje zapisany. A jeśli chcesz go ruszyć, [rezerwacja](LINK_RESERVE) to 500 zł, w pełni zwrotne.` },
    landing_ready: { subject: `${n} ma już swoją stronę`, body: `Cześć${im}!\n\nZbudowała się działająca strona ${n} — nie grafika, prawdziwa strona w przeglądarce. [Otwórz ją](LINK_VIEW), przewiń, możesz pokazać znajomym z branży.` },
    raport_ready: { subject: `${n}: raport rynku gotowy`, body: `Cześć${im}!\n\nSprawdziłem rynek wokół ${n} — w internecie, nie „z głowy": konkurenci z cenami, wielkość niszy, trendy, z podlinkowanymi źródłami. Cały raport jest [tutaj](LINK_VIEW).` },
    paid_welcome: { subject: 'Rezerwacja przyjęta — co dalej', body: `Cześć${im}!\n\nDzięki za rezerwację. Biorę ${n} na warsztat — przygotowuję plan przedsięwzięcia (zakres pierwszej wersji, model przychodów, droga do 50 klientów, harmonogram) i odezwę się do Ciebie osobiście w ciągu 2–3 dni roboczych.\n\nPrzypominam: 500 zł jest w pełni zwrotne.` },
  }
  const t = T[kind] || T.abandoned_chat
  return { subject: t.subject, html: mdToHtml(t.body, viewFor(kind, s), reserveFor(kind, s)) }
}

// Cel maila + dane (do GPT) dla kindów, które warto personalizować.
function followupBrief(kind: string, s: SessionRow): { goal: string; facts: string } {
  const n = toolName(s)
  if (kind === 'abandoned_chat') return { goal: 'Osoba zaczęła projektować z Twoim AI pomysł na własne narzędzie i PRZERWAŁA w połowie (jeszcze przed werdyktem). Napisz krótko, ciepło, bez nacisku: rozmowa jest zapisana, wraca dokładnie w to samo miejsce, dzieli ją kilka minut od karty projektu i pierwszych ekranów. Zachęć delikatnie do powrotu. Jeśli nazwa narzędzia jest generyczna („Twoje narzędzie"), pisz o „Twoim pomyśle".', facts: `narzędzie/temat: ${n}` }
  if (kind === 'verdict_last_call') {
    const plan = s.business_plan; let liczba = ''
    if (plan && Array.isArray(plan.kamienie) && plan.kamienie.length) { const g = plan.kamienie[plan.kamienie.length - 1] as Record<string, unknown>; if (typeof g.mies === 'number' && typeof g.klienci === 'number') liczba = `przy ${g.klienci} klientach ~${Math.round(g.mies).toLocaleString('pl-PL')} zł/mies.` }
    return { goal: 'To OSTATNI follow-up tego wątku (≈tydzień po zielonym werdykcie, cisza). Inny kąt niż wcześniej: lekka „domykam miejsce" + konkret. Przypomnij, że projekt dostał zielony werdykt i czeka w panelu. Bez nacisku: jeśli to nie moment — OK, projekt zostaje zapisany; jeśli chce ruszyć, rezerwacja 500 zł w pełni zwrotna. Delikatnie wpleć link do rezerwacji.', facts: [`narzędzie: ${n}`, liczba && `liczba z planu: ${liczba}`].filter(Boolean).join('; ') }
  }
  return { goal: 'Osoba właśnie zarezerwowała wspólną rozmowę (zapłaciła 500 zł, w pełni zwrotne). Podziękuj ciepło i osobiście, potwierdź że bierzesz jej projekt na warsztat: przygotowujesz plan przedsięwzięcia (zakres v1, model przychodów, droga do 50 klientów, harmonogram) i odzywasz się osobiście w 2–3 dni robocze. Bez sprzedaży, krótko. Linku nie musisz dawać.', facts: `narzędzie: ${n}` }
}

const EMAIL_SYSTEM = `Jesteś Tomkiem Niedźwieckim. Piszesz krótkiego, OSOBISTEGO maila (follow-up) do osoby, która projektowała z Twoim AI pomysł na własne narzędzie (SaaS). Ma wyglądać, jakbyś napisał go z palca w skrzynce — nie marketing.
ZASADY: po polsku, na „Ty", ciepło i konkretnie. KRÓTKO (2–4 krótkie akapity). Bez korpomowy, bez emoji, bez clickbaitu, bez przesadnych obietnic — styl brutalnie szczery, system > magia. Jeśli to pasuje, odnieś się konkretnie do JEGO pomysłu (nazwa, 1 szczegół). NIE podpisuj się imieniem ani stopką (dokleja się automatycznie). Bez nagłówków, list i buttonów — zwykły tekst akapitami.
LINKI: jeśli w kontekście podano link do podglądu, wstaw go RAZ jako [naturalny tekst](LINK_VIEW). Jeśli podano link do rezerwacji, możesz go delikatnie wpleść jako [tekst](LINK_RESERVE). Nie wymyślaj żadnych adresów. Jeśli żaden link nie pasuje (np. samo podziękowanie) — nie dawaj linku.
Zwróć WYŁĄCZNIE JSON: {"subject": string, "body": string}. subject: krótki (do ~55 znaków), konkretny, bez wielkich liter i wykrzykników. body: sam tekst z \\n między akapitami.`

async function generateFollowupEmail(kind: string, s: SessionRow, viewUrl: string | null, reserveUrl: string | null): Promise<{ subject: string; html: string; usage: { i: number; c: number; o: number } | null } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return null
  const brief = followupBrief(kind, s)
  const b = s.preview_brief || {}
  const links = [viewUrl && 'jest link do podglądu (LINK_VIEW)', reserveUrl && 'jest link do rezerwacji (LINK_RESERVE)'].filter(Boolean).join('; ') || 'brak linków'
  const ctx = [
    `Narzędzie: ${toolName(s)}`,
    typeof b.opis === 'string' && b.opis && `Opis: ${b.opis}`,
    typeof b.dla_kogo === 'string' && b.dla_kogo && `Dla kogo: ${b.dla_kogo}`,
    brief.facts && `Dane: ${brief.facts}`,
    firstName(s) && `Imię odbiorcy: ${firstName(s)}`,
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
    return { subject, html: mdToHtml(body, viewUrl, reserveUrl), usage }
  } catch (e) { console.error('[spar-followups] email gen error:', e instanceof Error ? e.message : String(e)); return null }
}

// GPT dla sensownych kindów (abandoned/last_call/welcome) + log kosztu; reszta statyczna.
async function getEmailFor(supabase: ReturnType<typeof createClient>, kind: string, s: SessionRow): Promise<{ subject: string; html: string }> {
  const GPT_KINDS = ['abandoned_chat', 'verdict_last_call', 'paid_welcome']
  if (GPT_KINDS.includes(kind)) {
    const gen = await generateFollowupEmail(kind, s, viewFor(kind, s), reserveFor(kind, s))
    if (gen) {
      if (gen.usage) { try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.1']; await supabase.from('spar_usage').insert({ session_id: s.id, kind: 'email', model: OPENAI_MODEL, input_tokens: gen.usage.i, cached_tokens: gen.usage.c, output_tokens: gen.usage.o, cost_usd: (Math.max(0, gen.usage.i - gen.usage.c) * p.i + gen.usage.c * p.c + gen.usage.o * p.o) / 1_000_000, meta: { view: 'followup_email', kind } }) } catch (uErr) { console.error('[spar-followups] email usage:', uErr) } }
      return { subject: gen.subject, html: gen.html }
    }
  }
  return staticEmail(kind, s)
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
      } as unknown as SessionRow
      const kinds = ['abandoned_chat', 'verdict_no_payment', 'verdict_last_call', 'landing_ready', 'raport_ready', 'paid_welcome']
      const templates = kinds.map((k) => { const { subject, html } = staticEmail(k, sample); return { group: 'followup', kind: k, subject, html, disabled: DISABLED.includes(k) } })
      return jsonResponse({ templates }, 200)
    }

    // Run crona: tylko cron-secret lub admin
    if (!isCron && !isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)

    const sent: Record<string, number> = { paid_sync: 0, paid_welcome: 0, abandoned_chat: 0, verdict_no_payment: 0 }
    let mailBudget = MAX_PER_RUN
    // Okno wysyłek 8–20 PL dotyczy WSZYSTKICH maili (też paid_welcome);
    // sync płatności (paid_at + lead won) działa niezależnie od pory
    const hour = warsawHour()
    const inWindow = hour >= 8 && hour < 20

    // claim → send → (rollback przy błędzie). Zwraca true gdy mail poszedł.
    async function sendOnce(kind: string, s: SessionRow): Promise<boolean> {
      if (!s.email || mailBudget <= 0) return false
      const { data: claim, error: claimErr } = await supabase
        .from('spar_emails')
        .upsert([{ session_id: s.id, kind, email: s.email }], { onConflict: 'session_id,kind', ignoreDuplicates: true })
        .select('id')
      if (claimErr) { console.error('[spar-followups] claim error:', claimErr); return false }
      if (!claim || !claim.length) return false // już wysłany wcześniej

      const { subject, html } = await getEmailFor(supabase, kind, s)
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ to: s.email, subject, html, lead_id: s.lead_id || undefined }),
        })
        if (!res.ok) throw new Error(`send-email ${res.status}: ${await res.text()}`)
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

    const SESSION_COLS = 'id, email, name, verdict, preview_brief, business_plan, market_report, landing_url, lead_id, paid_at, last_user_at, last_panel_at'

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

    // ── Pozostałe follow-upy tylko w oknie 8–20 Europe/Warsaw ─────────────
    if (!inWindow) {
      return jsonResponse({ ok: true, quiet_hours: true, sent }, 200)
    }

    // ── 1c) ARTEFAKTY GOTOWE (raport_ready / landing_ready) — WYŁĄCZONE ───
    //   Od 2026-06-13 pielęgnację zielonych leadów przejął drip „sekwencja
    //   odkrywania" (spar-drip): rynek/strona są generowane i ogłaszane mailem
    //   (reveal_rynek / reveal_landing) dopiero przy odsłonie, z bramką
    //   zaangażowania. Te followupy odpalały się na samo istnienie artefaktu —
    //   po wprowadzeniu dripu DUBLOWAŁY reveale. Zostawione tu świadomie jako
    //   ślad; nie przywracać bez wyłączenia odpowiednika w spar-drip.

    // ── 2) ABANDONED: email jest, brak domkniętego werdyktu (NULL lub żółty
    //        = rozmowa w toku), cisza 3–48 h ──────────────────────────────
    const { data: abandoned, error: abErr } = await supabase
      .from('spar_sessions')
      .select(SESSION_COLS)
      .eq('is_test', false)
      .or('verdict.is.null,verdict.eq.zolty')
      .not('email', 'is', null)
      .gte('last_user_at', hoursAgo(48))
      .lte('last_user_at', hoursAgo(3))
      .limit(60)
    if (abErr) console.error('[spar-followups] abandoned fetch error:', abErr)
    for (const s of (abandoned || []) as SessionRow[]) {
      await sendOnce('abandoned_chat', s)
    }

    // ── 3) ZIELONY WERDYKT BEZ WPŁATY (verdict_no_payment) — WYŁĄCZONE ────
    //   Odpalało się 20–96 h po rozmowie, czyli wprost w czasie pierwszych
    //   odsłon dripu (rynek +1 dz., economics +3 dz.) → dwójka maili w tym
    //   samym oknie. Generyczny nudge zastąpiły bogatsze reveale dripu.

    // ── 4) OSTATNI DZWONEK (verdict_last_call): JEDYNY domykacz, który
    //   zostaje — ale tylko dla ZIMNYCH leadów. Drip pauzuje niezaangażowanych
    //   po 1. odsłonie; ten mail (cisza w rozmowie 5–8 dni + brak wizyt w
    //   panelu) to ostatnia próba reaktywacji scarcity, by „przekonać
    //   nieprzekonanych". Zaangażowanych (świeża wizyta w panelu) pomijamy —
    //   ich obsługuje drip, nie dublujemy. ─────────────────────────────────
    const { data: lastCall, error: lcErr } = await supabase
      .from('spar_sessions')
      .select(SESSION_COLS)
      .eq('is_test', false)
      .eq('verdict', 'zielony')
      .is('paid_at', null)
      .not('email', 'is', null)
      .gte('last_user_at', hoursAgo(192))
      .lte('last_user_at', hoursAgo(120))
      .limit(60)
    if (lcErr) console.error('[spar-followups] last-call fetch error:', lcErr)
    const PANEL_WARM_MS = 7 * 24 * 3600 * 1000
    for (const s of (lastCall || []) as SessionRow[]) {
      // zaangażowany w panelu = drip go pielęgnuje, nie dublujemy domykaczem
      if (s.last_panel_at && now - Date.parse(s.last_panel_at) < PANEL_WARM_MS) continue
      await sendOnce('verdict_last_call', s)
    }

    return jsonResponse({ ok: true, sent }, 200)
  } catch (e) {
    console.error('[spar-followups] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500)
  }
})
