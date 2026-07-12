// spar-project — dane panelu projektu /stworze (stworze-projekt.html)
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-project --no-verify-jwt
//
// Akcje (POST JSON):
//   { sessionId, action: 'get' }                  -> sanitized projekt + feedback[]
//                                                    (+ historia sparingu, gdy JWT właściciela)
//   { sessionId, action: 'feedback', text }       -> dodaje uwagę, zwraca feedback[]
//   { action: 'list' }                            -> rozmowy KONTA (wymaga JWT w Authorization)
//
// Model dostępu:
//  • Sesja PRZYPIĘTA DO KONTA (auth_user_id != null): zawartość panelu dostaje
//    WYŁĄCZNIE zweryfikowany właściciel (JWT). Sam link ?id= NIE wystarcza —
//    przestaje działać jak hasło (lustrzane odbicie spar-chat). Dotyczy akcji
//    'get' / 'feedback' / 'seen_landing'.
//  • Sesja ANONIMOWA (auth_user_id == null, np. darmowa pierwsza rozmowa bez
//    konta): nadal działa po sessionId (uuid z localStorage), jak dotychczas.
//  • 'public' = read-only galeria inspiracji (zero PII, bramka kompletności).
//  • 'admin_get' / 'list' / 'conversations' = wymagają JWT (team_members / konta).
// Czytamy/piszemy service_role'em; panel dostaje zsanityzowany podzbiór pól
// (bez ip, bez pełnego e-maila).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { REVEAL_PLAN, VISIT_DEBOUNCE_MS } from "../_shared/spar-reveal-plan.ts";
import { bumpLeadStage } from "../_shared/lead-stage.ts";

const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tn-crm.vercel.app',
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5503',
  'http://127.0.0.1:5503',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Sekwencja odkrywania: JEDNO źródło w ../_shared/spar-reveal-plan.ts (import wyżej),
// wspólne z spar-drip. Eager-seed (action 'get') i cron-seed dają te same due_at (h).
const MAX_FEEDBACK_PER_SESSION = 30
const MAX_FEEDBACK_LENGTH = 1000
const MAX_LIST_SESSIONS = 30
const MAX_HISTORY_MESSAGES = 200
// Opis zamówienia „kolejnej rozmowy" — JEDNO źródło dla insertu (buy_conversation)
// i liczenia limitu (action 'conversations'). NIE używać offer.name (edytowalne w DB).
const CONVO_DESCRIPTION = 'Aplikacja — kolejna rozmowa'

// Konto z JWT w Authorization (Supabase Auth) — null gdy brak/nieważny token
async function verifyAuthUser(
  req: Request,
  supabase: ReturnType<typeof createClient>,
): Promise<{ id: string; email: string | null } | null> {
  const m = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  const token = m[1].trim()
  if (!token || token.startsWith('sb_publishable_') || token.startsWith('sb_secret_')) return null
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return null
    return { id: data.user.id, email: data.user.email || null }
  } catch (err) {
    console.error('[spar-project] auth getUser error:', err)
    return null
  }
}

// Nazwa rozmowy do listy konta (jak projName w panelu TN Aplikacje)
function sessionTitle(brief: Record<string, unknown> | null, profession: string | null): string {
  if (brief && typeof brief.nazwa === 'string' && brief.nazwa.trim()) return brief.nazwa.trim()
  return profession || 'Rozmowa bez nazwy'
}

function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)

    let body: { sessionId?: string; action?: string; text?: string; email?: string }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors)
    }

    const sessionId = (body.sessionId || '').trim()
    const action = (body.action || 'get').trim()

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const authUser = await verifyAuthUser(req, supabase)

    // ── action 'conversations': ile DODATKOWYCH rozmów konto ma opłacone ─────
    // (1. rozmowa darmowa; każda kolejna = zakup oferty „Aplikacja — kolejna
    //  rozmowa" 49 zł albo grant admina = pseudo-order amount 0). Liczymy po
    //  spar_user_id zapisanym przy checkout. Front: dozwolone = 1 + paid.
    if (action === 'conversations') {
      if (!authUser) return jsonResponse({ error: 'wymagane_logowanie' }, 401, cors)
      const { count, error: convErr } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('spar_user_id', authUser.id)
        .eq('status', 'paid')
        .eq('description', CONVO_DESCRIPTION) // INWARIANT: identyczny literał wstawia buy_conversation (NIE offer.name)
      if (convErr) {
        console.error('[spar-project] conversations count error:', convErr)
        return jsonResponse({ error: 'blad_serwera' }, 500, cors)
      }
      return jsonResponse({ paidConversations: count || 0 }, 200, cors)
    }

    // ── action 'buy_conversation': utwórz pending order na „kolejną rozmowę" ──
    // (BLIK inline w sparingu: front bierze orderId i woła tpay-create-transaction).
    // Cena z oferty, e-mail z JWT, spar_user_id z JWT, skip_workflow=true (to nie
    // budowa → bez workflow CRM). Webhook tpay oznaczy paid → conversations +1.
    if (action === 'buy_conversation') {
      if (!authUser) return jsonResponse({ error: 'wymagane_logowanie' }, 401, cors)
      const CONVO_OFFER_ID = '2a1fbbfe-32fe-4aa3-9f96-3a812da103d4'
      const { data: offer, error: offErr } = await supabase
        .from('offers').select('id, name, price').eq('id', CONVO_OFFER_ID).maybeSingle()
      if (offErr || !offer) {
        console.error('[spar-project] buy_conversation offer error:', offErr)
        return jsonResponse({ error: 'brak_oferty' }, 500, cors)
      }
      const email = (authUser.email || body.email || '').toString().trim()
      if (!email) return jsonResponse({ error: 'brak_emaila' }, 400, cors)
      const { data: order, error: ordErr } = await supabase
        .from('orders')
        .insert({
          customer_email: email,
          // STAŁY opis — MUSI być identyczny z CONVO_DESCRIPTION w action 'conversations' (liczenie limitu).
          // NIE offer.name: zmiana nazwy oferty w DB rozspójniłaby liczenie (user płaci, a limit nie rośnie).
          description: CONVO_DESCRIPTION,
          amount: offer.price,
          status: 'pending',
          payment_source: 'tpay',
          spar_user_id: authUser.id,
          skip_workflow: true,
        })
        .select('id')
        .single()
      if (ordErr || !order) {
        console.error('[spar-project] buy_conversation insert error:', ordErr)
        return jsonResponse({ error: 'blad_zamowienia' }, 500, cors)
      }
      return jsonResponse({ orderId: order.id, amount: offer.price }, 200, cors)
    }

    // ── action 'buy_reservation': pending order na rezerwację 500 zł ─────────
    // (BLIK inline w sparingu — front bierze orderId i woła tpay-create-transaction;
    //  fallback „inne metody" dalej idzie przez checkout/v2). Order MUSI wyglądać
    //  jak z checkout/v2: description = offer.name (tpay-webhook stempluje paid_at
    //  po 'rezerwacj'+'aplikac'), spar_session_id + lead_id + customer_email =
    //  ścieżki dopasowania sesji w webhooku. Zgoda art. 15 u.p.k. OBOWIĄZKOWA
    //  (checkout ma checkbox — tu front przysyła consent:true po zaznaczeniu).
    if (action === 'buy_reservation') {
      const RESV_OFFER_ID = 'a1656695-db0d-4ae7-b107-230832042076'
      if (!sessionId) return jsonResponse({ error: 'brak_sesji' }, 400, cors)
      const consent = (body as Record<string, unknown>).consent === true
      if (!consent) return jsonResponse({ error: 'brak_zgody' }, 400, cors)
      const { data: sess, error: sessErr } = await supabase
        .from('spar_sessions')
        .select('id, email, lead_id, auth_user_id, paid_at')
        .eq('id', sessionId)
        .maybeSingle()
      if (sessErr || !sess) return jsonResponse({ error: 'brak_sesji' }, 404, cors)
      // Owner-gate: sesja przypięta do konta wydaje order tylko właścicielowi.
      const ownerId = (sess.auth_user_id as string | null) || null
      if (ownerId && (!authUser || authUser.id !== ownerId)) {
        return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
      }
      if (sess.paid_at) return jsonResponse({ alreadyPaid: true }, 200, cors)
      const email = ((sess.email as string | null) || authUser?.email || (body.email || '')).toString().trim()
      if (!email) return jsonResponse({ error: 'brak_emaila' }, 400, cors)
      const { data: offer, error: offErr } = await supabase
        .from('offers').select('id, name, price').eq('id', RESV_OFFER_ID).maybeSingle()
      if (offErr || !offer) {
        console.error('[spar-project] buy_reservation offer error:', offErr)
        return jsonResponse({ error: 'brak_oferty' }, 500, cors)
      }
      const { data: order, error: ordErr } = await supabase
        .from('orders')
        .insert({
          customer_email: email,
          description: offer.name, // parytet z checkout/v2 — webhook matchuje po opisie
          offer_id: offer.id,
          amount: offer.price,
          status: 'pending',
          payment_source: 'tpay',
          notes: `Sparing inline BLIK: ${offer.name} | Metoda: blik | Zgoda na wykonanie uslugi przed uplywem 14 dni: TAK`,
          consent_digital_service: true,
          consented_at: new Date().toISOString(),
          spar_session_id: sessionId,
          ...(sess.lead_id ? { lead_id: sess.lead_id } : {}),
        })
        .select('id')
        .single()
      if (ordErr || !order) {
        console.error('[spar-project] buy_reservation insert error:', ordErr)
        return jsonResponse({ error: 'blad_zamowienia' }, 500, cors)
      }
      return jsonResponse({ orderId: order.id, amount: offer.price }, 200, cors)
    }

    // ── action 'list': rozmowy zalogowanego konta (cross-device) ─────────────
    if (action === 'list') {
      if (!authUser) return jsonResponse({ error: 'wymagane_logowanie' }, 401, cors)
      const { data: rows, error: listErr } = await supabase
        .from('spar_sessions')
        .select('id, profession, verdict, status, turns, created_at, updated_at, preview_brief, preview_images')
        .eq('auth_user_id', authUser.id)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(MAX_LIST_SESSIONS)
      if (listErr) {
        console.error('[spar-project] list error:', listErr)
        return jsonResponse({ error: 'blad_serwera' }, 500, cors)
      }
      const sessions = (rows || []).map((r) => {
        const brief = (r.preview_brief || null) as Record<string, unknown> | null
        const imgs = (r.preview_images || {}) as Record<string, unknown>
        return {
          id: r.id,
          nazwa: sessionTitle(brief, r.profession as string | null),
          verdict: r.verdict || null,
          status: r.status || 'active',
          turns: r.turns || 0,
          thumb: typeof imgs.panel === 'string' ? imgs.panel : (typeof imgs.glowna === 'string' ? imgs.glowna : null),
          created_at: r.created_at,
          updated_at: r.updated_at,
        }
      })
      return jsonResponse({ sessions }, 200, cors)
    }

    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, cors)
    }

    const { data: session, error: sErr } = await supabase
      .from('spar_sessions')
      .select('id, name, status, verdict, problem_summary, preview_brief, preview_image_url, preview_images, preview_history, image_count, business_plan, market_report, economics, gtm, landing_url, lead_id, paid_at, full_paid_at, knowhow_closed_at, idea_source, created_at, last_panel_at, panel_visits, seen_landing_at, is_test, hidden_from_feed, auth_user_id')
      .eq('id', sessionId)
      .maybeSingle()

    if (sErr) {
      console.error('[spar-project] session fetch error:', sErr)
      return jsonResponse({ error: 'blad_serwera' }, 500, cors)
    }
    // Panel istnieje tylko dla sesji, w których jest już projekt (karta lub brief)
    if (!session || (!session.problem_summary && !session.preview_brief)) {
      return jsonResponse({ error: 'brak_projektu' }, 404, cors)
    }

    // ── action 'public': READ-ONLY podgląd dla galerii inspiracji — ZERO PII ──
    //    Pokazujemy WYŁĄCZNIE KOMPLETNE projekty: zielony werdykt + nie-test +
    //    nie-ukryty (hidden_from_feed) + gotowa strona (landing_url) ORAZ klikalny
    //    prototyp. Świeży projekt z samymi grafikami panelu NIE wchodzi — efekt
    //    „wow" wymaga kompletu. Output BEZ PII: bez imienia, e-maila, uwag, rozmowy,
    //    lead_id, paid_at — czego endpoint nie wyśle, tego front nie pokaże.
    if (action === 'public') {
      const { data: protoRow } = await supabase.from('spar_usage')
        .select('meta').eq('session_id', sessionId).eq('kind', 'prototype')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      const protoMeta = (protoRow?.meta || null) as Record<string, unknown> | null
      const protoUrl = protoMeta && typeof protoMeta.url === 'string' ? protoMeta.url as string : null
      if (session.verdict !== 'zielony' || session.is_test || session.hidden_from_feed || !session.landing_url || !protoUrl) {
        return jsonResponse({ error: 'niedostepny' }, 404, cors)
      }
      const pBrief = (session.preview_brief || {}) as Record<string, unknown>
      const stripMeta = (o: unknown): Record<string, unknown> | null => {
        if (!o || typeof o !== 'object') return null
        const { _meta: _drop, ...rest } = o as Record<string, unknown>
        return rest
      }
      return jsonResponse({ projekt: {
        nazwa: (pBrief.nazwa as string) || 'Narzędzie',
        opis: (pBrief.opis as string) || null,
        dla_kogo: (pBrief.dla_kogo as string) || null,
        ekrany: Array.isArray(pBrief.ekrany) ? pBrief.ekrany : [],
        karta: (session.problem_summary as Record<string, unknown> | null) || null,
        preview_image_url: session.preview_image_url || null,
        preview_images: session.preview_images || null,
        preview_history: session.preview_history || null,
        image_count: session.image_count || 0,
        business_plan: stripMeta(session.business_plan),
        market_report: stripMeta(session.market_report),
        economics: stripMeta(session.economics),
        gtm: stripMeta(session.gtm),
        landing_url: session.landing_url,
        prototyp_url: protoUrl,
        verdict: 'zielony',
        created_at: session.created_at,
      } }, 200, cors)
    }

    // ── action 'admin_get': READ-ONLY podgląd panelu dla ADMINA (panel TN Aplikacje) ──
    //    Jak 'public', ale BEZ bramki kompletności i restrykcji galerii — admin widzi
    //    panel KAŻDEGO leada (też niedomknięty: bez landinga/prototypu/werdyktu).
    //    KRYTYCZNE: ZERO efektów ubocznych — NIE stempluje last_panel_at / panel_visits /
    //    nie seeduje reveals (inaczej podgląd admina psułby bramkowanie dripa leada).
    //    Autoryzacja: JWT członka zespołu (team_members) — sam 'authenticated' nie wystarcza
    //    (publiczna rejestracja w sparingu daje tę rolę każdemu; wzorzec invoice-pdf/spar-landing).
    //    Kształt 'projekt' 1:1 z 'public' → renderer /aplikacja/projekt/ działa bez przeróbek.
    if (action === 'admin_get') {
      if (!authUser) return jsonResponse({ error: 'wymagane_logowanie' }, 401, cors)
      const { data: tm } = await supabase
        .from('team_members').select('user_id').eq('user_id', authUser.id).maybeSingle()
      if (!tm) return jsonResponse({ error: 'brak_uprawnien' }, 403, cors)
      const { data: protoRow } = await supabase.from('spar_usage')
        .select('meta').eq('session_id', sessionId).eq('kind', 'prototype')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      const protoMeta = (protoRow?.meta || null) as Record<string, unknown> | null
      const protoUrl = protoMeta && typeof protoMeta.url === 'string' ? protoMeta.url as string : null
      const pBrief = (session.preview_brief || {}) as Record<string, unknown>
      const stripMeta = (o: unknown): Record<string, unknown> | null => {
        if (!o || typeof o !== 'object') return null
        const { _meta: _drop, ...rest } = o as Record<string, unknown>
        return rest
      }
      return jsonResponse({ projekt: {
        nazwa: (pBrief.nazwa as string) || 'Narzędzie',
        opis: (pBrief.opis as string) || null,
        dla_kogo: (pBrief.dla_kogo as string) || null,
        ekrany: Array.isArray(pBrief.ekrany) ? pBrief.ekrany : [],
        karta: (session.problem_summary as Record<string, unknown> | null) || null,
        preview_image_url: session.preview_image_url || null,
        preview_images: session.preview_images || null,
        preview_history: session.preview_history || null,
        image_count: session.image_count || 0,
        business_plan: stripMeta(session.business_plan),
        market_report: stripMeta(session.market_report),
        economics: stripMeta(session.economics),
        gtm: stripMeta(session.gtm),
        landing_url: session.landing_url || null,
        prototyp_url: protoUrl,
        verdict: session.verdict || null,
        created_at: session.created_at,
      } }, 200, cors)
    }

    // ── Własność sesji: rozmowa przypięta do konta wymaga JWT tego konta ──────
    //    (link ?id= przestaje działać jak hasło — lustrzane odbicie spar-chat).
    //    Akcje 'public' (galeria, zero PII) i 'admin_get' (JWT team_members) mają
    //    własny model dostępu i zwróciły wynik wyżej. Poniżej zostają akcje
    //    właściciela ('seen_landing', 'feedback', 'get') zwracające pełną zawartość
    //    panelu (karta, brief, plan, raport, economics, gtm, strona, uwagi, rozmowa).
    //    Sesja anonimowa (auth_user_id == null, np. darmowa pierwsza rozmowa bez
    //    konta) nadal działa po sessionId — jak w spar-chat.
    const ownerId = (session.auth_user_id as string | null) || null
    if (ownerId && (!authUser || authUser.id !== ownerId)) {
      return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
    }

    // ── action 'seen_landing': lead obejrzał stronę sprzedażową (wszedł w panelu do
    //    zakładki 'strona' albo otworzył landing). Bramka prototypu (plan w _shared).
    //    Stempluj RAZ i tylko gdy strona realnie istnieje (jest co oglądać) — pusta
    //    zakładka nie może przedwcześnie odblokować prototypu. Idempotentne, lekkie.
    if (action === 'seen_landing') {
      if (session.landing_url && !session.seen_landing_at) {
        const { error: slErr } = await supabase.from('spar_sessions')
          .update({ seen_landing_at: new Date().toISOString() }).eq('id', sessionId)
        if (slErr) console.error('[spar-project] seen_landing stamp error:', slErr)
        // Pipeline: projekt obejrzany → „Skontaktowany" (contacted). Sygnał pasywny
        // → bez wskrzeszania ręcznie odrzuconych leadów (parytet ze /sklep).
        await bumpLeadStage(supabase, (session.lead_id as string | null) || null, 'contacted', { channel: '/aplikacja' })
      }
      return jsonResponse({ ok: true, seen: !!session.landing_url }, 200, cors)
    }

    if (action === 'feedback') {
      const text = (body.text || '').trim()
      if (!text) return jsonResponse({ error: 'pusta_uwaga' }, 400, cors)
      if (text.length > MAX_FEEDBACK_LENGTH) return jsonResponse({ error: 'uwaga_za_dluga' }, 400, cors)

      const { count } = await supabase
        .from('spar_feedback')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
      if ((count ?? 0) >= MAX_FEEDBACK_PER_SESSION) {
        return jsonResponse({ error: 'limit_uwag' }, 429, cors)
      }

      const { error: insErr } = await supabase
        .from('spar_feedback')
        .insert({ session_id: sessionId, text })
      if (insErr) {
        console.error('[spar-project] feedback insert error:', insErr)
        return jsonResponse({ error: 'blad_serwera' }, 500, cors)
      }
    }

    const { data: feedback, error: fErr } = await supabase
      .from('spar_feedback')
      .select('text, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(MAX_FEEDBACK_PER_SESSION)
    if (fErr) console.error('[spar-project] feedback fetch error:', fErr)

    // Historia czatu współpracy (panel odtwarza rozmowę po odświeżeniu)
    const { data: collabMessages, error: cmErr } = await supabase
      .from('spar_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('channel', 'wspolpraca')
      .order('id', { ascending: true })
      .limit(80)
    if (cmErr) console.error('[spar-project] collab messages fetch error:', cmErr)

    // Historia GŁÓWNEJ rozmowy (sparing) — tylko dla zweryfikowanego WŁAŚCICIELA
    // sesji (JWT). Pozwala odtworzyć rozmowę po zalogowaniu na innym urządzeniu;
    // sam sessionId (link ?id=) historii nie dostaje.
    let sparingMessages: { role: string; content: string }[] | null = null
    if (authUser && ownerId && authUser.id === ownerId) {
      const { data: sm, error: smErr } = await supabase
        .from('spar_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .eq('channel', 'sparing')
        .order('id', { ascending: true })
        .limit(MAX_HISTORY_MESSAGES)
      if (smErr) console.error('[spar-project] sparing messages fetch error:', smErr)
      else sparingMessages = (sm || []) as { role: string; content: string }[]
    }

    const brief = (session.preview_brief || {}) as Record<string, unknown>
    const karta = (session.problem_summary || null) as Record<string, unknown> | null
    // business_plan / market_report bez _meta (licznik generacji to wewnętrzna kuchnia)
    let bizplan: Record<string, unknown> | null = null
    if (session.business_plan && typeof session.business_plan === 'object') {
      const { _meta: _drop, ...rest } = session.business_plan as Record<string, unknown>
      bizplan = rest
    }
    let raport: Record<string, unknown> | null = null
    if (session.market_report && typeof session.market_report === 'object') {
      const { _meta: _drop, ...rest } = session.market_report as Record<string, unknown>
      raport = rest
    }
    let economics: Record<string, unknown> | null = null
    if (session.economics && typeof session.economics === 'object') {
      const { _meta: _drop, ...rest } = session.economics as Record<string, unknown>
      economics = rest
    }
    let gtm: Record<string, unknown> | null = null
    if (session.gtm && typeof session.gtm === 'object') {
      const { _meta: _drop, ...rest } = session.gtm as Record<string, unknown>
      gtm = rest
    }
    const firstName = typeof session.name === 'string' && session.name
      ? session.name.split(' ')[0]
      : null

    // ── Sekwencja odkrywania ──────────────────────────────────────────────
    // Wejście do panelu = sygnał zaangażowania → stempluj last_panel_at (bramka
    // dripa odblokowuje dalsze odsłony / wznawia zapauzowane). Tylko dla 'get'.
    const isGreen = session.verdict === 'zielony'
    const isPaid = !!session.paid_at
    let revealsMap: Record<string, string> = {}
    if (action === 'get') {
      // Wejście do panelu = sygnał zaangażowania. last_panel_at stempluj ZAWSZE
      // (najświeższy dotyk), ale panel_visits inkrementuj tylko gdy to ODRĘBNA wizyta
      // (poprzednie wejście >30 min temu lub brak) — inaczej polling i odświeżenia
      // („get" leci wielokrotnie podczas generowania) zawyżałyby licznik. Bramka
      // landing (strona sprzedażowa) wymaga panel_visits >= 2.
      const lastPanelMs = session.last_panel_at ? Date.parse(session.last_panel_at as string) : 0
      const nowMs = Date.now()
      const isNewVisit = !lastPanelMs || (nowMs - lastPanelMs) > VISIT_DEBOUNCE_MS
      const visitPatch: Record<string, unknown> = { last_panel_at: new Date(nowMs).toISOString() }
      if (isNewVisit) visitPatch.panel_visits = ((session.panel_visits as number) || 0) + 1
      // AWAIT (nie fire-and-forget): last_panel_at/panel_visits napędzają bramkę
      // 'visits2' landingu w spar-drip — niezastempowany dotyk gubił odblokowanie.
      { const { error: vErr } = await supabase.from('spar_sessions').update(visitPatch).eq('id', sessionId)
        if (vErr) console.error('[spar-project] panel visit stamp error:', vErr) }
      if (isGreen && !isPaid && !session.full_paid_at) {
        // Eager-seed planu (idempotentne) — żeby bramkowanie działało od razu po
        // werdykcie, nie dopiero po przebiegu crona dripa. Kadencja w GODZINACH (h)
        // z _shared/spar-reveal-plan.ts (jedno źródło z spar-drip).
        // Po pełnej płatności (know-how) NIE seedujemy — spójnie z gate'em seed-query
        // w spar-drip (.is('full_paid_at', null)); inaczej martwe 'pending' śmiecą KPI.
        const verdictAt = Date.parse(session.created_at as string) || Date.now()
        const seedRows = REVEAL_PLAN.map((r) => ({
          session_id: sessionId, key: r.key, seq: r.seq, email_kind: r.emailKind,
          due_at: new Date(verdictAt + r.h * 3600000).toISOString(), status: 'pending',
        }))
        await supabase.from('spar_reveals').upsert(seedRows, { onConflict: 'session_id,key', ignoreDuplicates: true })
      }
      const { data: rvs } = await supabase.from('spar_reveals').select('key, status').eq('session_id', sessionId)
      for (const r of rvs || []) revealsMap[(r as { key: string }).key] = (r as { status: string }).status

      // ── Pipeline CRM: awans leada do NAJWYŻSZEGO osiągniętego etapu (monotonicznie) ──
      // Lejek /aplikacja — wariant GRANULARNY (wybór Tomka 2026-07-01). Każdy realny
      // sygnał rozmowy ma swoją kolumnę, żeby tablica pokazywała progres DO REZERWACJI:
      //   Nowy(kontakt, w spar-chat) → Skontaktowany(werdykt żółty/czerwony — AI oceniło,
      //   dopracowuje kierunek) → Oferta(podgląd projektu pokazany) → Zakwalifikowany
      //   (ZIELONY werdykt = pomysł zwalidowany) → Rezerwacja(paid_at) → Wygrany(full_paid_at).
      // Liczone z trwałego stanu sesji przy każdym sync 'get' (front polluje), więc status
      // dogania rzeczywistość bez dotykania tpay-webhook. Sygnały płatności wskrzeszają
      // (allowRevive), pasywne nie. UWAGA: to NIE parytet ze /sklep (tam zielony = Oferta,
      // powrót po zielonym = Zakwalifikowany) — /aplikacja świadomie awansuje zielony wyżej.
      if (session.lead_id) {
        const lead_id = session.lead_id as string
        const hasPreview = !!session.preview_brief         // AI pokazało podgląd narzędzia (podgląd projektu)
        const otherVerdict = session.verdict === 'zolty' || session.verdict === 'czerwony' // AI oceniło, nie-zielony
        if (session.full_paid_at) {
          await bumpLeadStage(supabase, lead_id, 'won', { allowRevive: true, channel: '/aplikacja' })          // WYGRANY
        } else if (session.paid_at) {
          await bumpLeadStage(supabase, lead_id, 'negotiation', { allowRevive: true, channel: '/aplikacja' })  // REZERWACJA
        } else if (isGreen) {
          await bumpLeadStage(supabase, lead_id, 'proposal', { channel: '/aplikacja' })    // ZAKWALIFIKOWANY (zielony werdykt)
        } else if (hasPreview) {
          await bumpLeadStage(supabase, lead_id, 'qualified', { channel: '/aplikacja' })   // OFERTA (podgląd projektu)
        } else if (otherVerdict) {
          await bumpLeadStage(supabase, lead_id, 'contacted', { channel: '/aplikacja' })   // SKONTAKTOWANY (werdykt żółty/czerwony)
        }
      }
    }

    return jsonResponse({
      projekt: {
        nazwa: (brief.nazwa as string) || 'Twoje narzędzie',
        opis: (brief.opis as string) || null,
        dla_kogo: (brief.dla_kogo as string) || null,
        ekrany: Array.isArray(brief.ekrany) ? brief.ekrany : [],
        karta,
        preview_image_url: session.preview_image_url || null,
        preview_images: session.preview_images || null,
        preview_history: session.preview_history || null,
        image_count: session.image_count || 0,
        business_plan: bizplan,
        market_report: raport,
        economics: economics,
        gtm: gtm,
        landing_url: session.landing_url || null,
        verdict: session.verdict || null,
        status: session.status || 'active',
        lead_id: session.lead_id || null,
        paid_at: session.paid_at || null,
        full_paid_at: session.full_paid_at || null,
        knowhow_closed_at: session.knowhow_closed_at || null,
        idea_source: session.idea_source || null,
        reveals: revealsMap,
        imie: firstName,
        created_at: session.created_at,
      },
      feedback: feedback || [],
      wspolpraca: collabMessages || [],
      // null = brak uprawnień (anonimowy dostęp przez sessionId); [] = właściciel bez wiadomości
      historia: sparingMessages,
      // front po zalogowaniu wie, czy rozmowa należy do tego konta
      wlasciciel: !!(authUser && ownerId && authUser.id === ownerId),
    }, 200, cors)
  } catch (e) {
    console.error('[spar-project] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
