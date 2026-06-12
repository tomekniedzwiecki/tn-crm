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
//
// Wysyłka przez send-email (Resend, format direct + sygnatura Tomka),
// okno 8:00–20:00 Europe/Warsaw, max 30 maili/run.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SPARING_URL = 'https://tomekniedzwiecki.pl/stworze/sparing/'
const MAX_PER_RUN = 30

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function warsawHour(): number {
  return parseInt(new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false,
  }).format(new Date()), 10)
}

function chatLink(sessionId: string, campaign: string, hash = ''): string {
  return `${SPARING_URL}?id=${sessionId}&utm_source=email&utm_medium=followup&utm_campaign=${campaign}${hash}`
}

function btn(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr><td style="border-radius:999px;background:linear-gradient(135deg,#6db3ff,#4d9fff);">
    <a href="${href}" style="display:inline-block;padding:13px 30px;color:#061320;font-weight:700;font-size:15px;text-decoration:none;">${label}</a>
  </td></tr></table>`
}

function emailHtml(inner: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;max-width:560px;">${inner}</div>`
}

interface SessionRow {
  id: string
  email: string | null
  name: string | null
  verdict: string | null
  preview_brief: Record<string, unknown> | null
  business_plan: Record<string, unknown> | null
  lead_id: string | null
  paid_at: string | null
  last_user_at: string | null
}

function firstName(s: SessionRow): string {
  return (s.name || '').trim().split(' ')[0] || ''
}
function toolName(s: SessionRow): string {
  const n = s.preview_brief && typeof s.preview_brief.nazwa === 'string' ? s.preview_brief.nazwa : ''
  return n || 'Twoje narzędzie'
}

function buildEmail(kind: string, s: SessionRow): { subject: string; html: string } {
  const hi = firstName(s) ? `Cześć ${firstName(s)}!` : 'Cześć!'
  const nazwa = toolName(s)
  if (kind === 'abandoned_chat') {
    return {
      subject: `Twój projekt narzędzia czeka dokończony w połowie`,
      html: emailHtml(`
        <p>${hi}</p>
        <p>Zacząłeś projektować swoje narzędzie w rozmowie z moim AI — i zatrzymaliśmy się w pół drogi.
        Cała rozmowa jest zapisana, wracasz dokładnie w to samo miejsce.</p>
        <p>Kilka minut dzieli Cię od karty projektu i pierwszych ekranów.</p>
        ${btn(chatLink(s.id, 'abandoned_chat'), 'Wracam do rozmowy →')}
      `),
    }
  }
  if (kind === 'verdict_no_payment') {
    return {
      subject: `${nazwa}: karta projektu i plan przychodu gotowe`,
      html: emailHtml(`
        <p>${hi}</p>
        <p>Projekt <strong>${nazwa}</strong> ma zielony werdykt — karta projektu, ekrany
        i wstępny plan przychodu czekają w Twoim panelu.</p>
        <p>Następny krok to rezerwacja wspólnej rozmowy (500 zł, <strong>w pełni zwrotne</strong>):
        przygotowuję wtedy osobiście plan przedsięwzięcia i odzywam się do Ciebie.
        Nie wchodzimy we współpracę — oddaję całość.</p>
        ${btn(chatLink(s.id, 'verdict_no_payment', '#projekt-plan'), 'Zobacz projekt i plan przychodu →')}
      `),
    }
  }
  if (kind === 'verdict_last_call') {
    // ostatni dzwonek — inny kąt: liczby z planu przychodu (jeśli policzony)
    let liczby = ''
    const plan = s.business_plan
    if (plan && Array.isArray(plan.kamienie) && plan.kamienie.length) {
      const goal = plan.kamienie[plan.kamienie.length - 1] as Record<string, unknown>
      if (typeof goal.mies === 'number' && typeof goal.klienci === 'number') {
        const mies = Math.round(goal.mies).toLocaleString('pl-PL')
        liczby = `<p>Dla przypomnienia jedna liczba z Twojego planu: przy ${goal.klienci} klientach
        to około <strong>${mies} zł miesięcznie</strong> — a pierwszych 50 klientów pozyskuję ja.</p>`
      }
    }
    return {
      subject: `${nazwa} — domykam miejsce na ten projekt`,
      html: emailHtml(`
        <p>${hi}</p>
        <p>Tydzień temu Twój projekt <strong>${nazwa}</strong> dostał zielony werdykt.
        Karta, ekrany i plan przychodu wciąż czekają w panelu — nic nie przepadło.</p>
        ${liczby}
        <p>Jeśli to nie ten moment — w porządku, projekt zostaje zapisany.
        Jeśli jednak chcesz go ruszyć: rezerwacja to 500 zł, <strong>w pełni zwrotne</strong>.</p>
        ${btn(chatLink(s.id, 'verdict_last_call', '#projekt'), 'Wracam do projektu →')}
      `),
    }
  }
  // paid_welcome
  return {
    subject: `Rezerwacja przyjęta — co teraz?`,
    html: emailHtml(`
      <p>${hi}</p>
      <p>Dzięki za rezerwację! Projekt <strong>${nazwa}</strong> trafia teraz na moje biurko —
      przygotowuję plan przedsięwzięcia (zakres pierwszej wersji, model przychodów,
      droga do 50 klientów, harmonogram) i odezwę się do Ciebie osobiście
      w ciągu 2–3 dni roboczych.</p>
      <p>Przypominam: 500 zł jest w pełni zwrotne — jeśli którykolwiek z nas uzna,
      że to nie ten moment, oddaję całość.</p>
      <p>Do usłyszenia,<br>Tomek</p>
    `),
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'metoda_niedozwolona' }, 405)
  }
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500)

    // Funkcja jest --no-verify-jwt (woła ją pg_cron przez pg_net) — sekret
    // w nagłówku odcina anonimowe triggerowanie runów z internetu
    const cronSecret = Deno.env.get('SPAR_CRON_SECRET')
    if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
      return jsonResponse({ error: 'unauthorized' }, 401)
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

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

      const { subject, html } = buildEmail(kind, s)
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

    const SESSION_COLS = 'id, email, name, verdict, preview_brief, business_plan, lead_id, paid_at, last_user_at'

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

    // ── 3) ZIELONY WERDYKT BEZ WPŁATY: cisza 20–96 h ──────────────────────
    const { data: noPay, error: npErr } = await supabase
      .from('spar_sessions')
      .select(SESSION_COLS)
      .eq('is_test', false)
      .eq('verdict', 'zielony')
      .is('paid_at', null)
      .not('email', 'is', null)
      .gte('last_user_at', hoursAgo(96))
      .lte('last_user_at', hoursAgo(20))
      .limit(60)
    if (npErr) console.error('[spar-followups] no-payment fetch error:', npErr)
    for (const s of (noPay || []) as SessionRow[]) {
      await sendOnce('verdict_no_payment', s)
    }

    // ── 4) OSTATNI DZWONEK: zielony bez wpłaty, cisza 5–8 dni (drugi,
    //        ostatni follow-up tego wątku — inny kąt: liczby z planu) ──────
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
    for (const s of (lastCall || []) as SessionRow[]) {
      await sendOnce('verdict_last_call', s)
    }

    return jsonResponse({ ok: true, sent }, 200)
  } catch (e) {
    console.error('[spar-followups] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500)
  }
})
