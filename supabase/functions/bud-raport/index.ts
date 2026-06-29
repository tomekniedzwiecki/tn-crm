// bud-raport — RAPORT STRATEGICZNY produktu z lejka "Zbuduję / Sklep" (AWE).
// Dedykowany przewodnik dla osoby, która ZDECYDOWAŁA się sprzedawać dany
// viralowy produkt: od wprowadzenia na rynek PL, przez budowę marki, po skalowanie.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy bud-raport --no-verify-jwt
//
// POST { sessionId, product:{name,category,product_link,saves,plays,comments,...}, recipient?, force? } ->
//   - jeśli market_report istnieje i !force -> zwraca zapisany (cached)
//   - inaczej: REALNY research (OpenAI Responses API + web_search) -> 6-sekcyjny
//     przewodnik strategiczny (produkt+potencjał / problem+emocje / avatar /
//     marka+5 nazw / plan marketingowy / skalowanie), personalizowany imieniem,
//     zapis w bud_sessions.market_report i zwrot.
//   Picker-first: produkt przychodzi z frontu (wybór z karuzeli) — NIE wymaga karty.
//
// Sekrety:
//   OPENAI_API_KEY     — klucz OpenAI (już ustawiony)
//   BUD_RAPORT_MODEL   — opcjonalny override (default: BUD_OPENAI_MODEL -> gpt-5.5)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
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
const MAX_GENERATIONS = 3
// Dzienny cap per IP — raport to NAJDROŻSZA generacja (gpt-5.5 + web_search),
// więc bez tego limitu ktoś w pętli (force=true / wiele sesji z jednego IP)
// pali realny budżet OpenAI. Liczone z bud_usage po sesjach tego IP w 24 h
// (wzorzec bud-landing/bud-image). Default 5/dobę/IP.
const MAX_RAPORTS_PER_IP_PER_DAY = parseInt(Deno.env.get('BUD_RAPORT_IP_DAILY') || '5', 10)
const OPENAI_MODEL = Deno.env.get('BUD_RAPORT_MODEL') || Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.5'
const MAX_OUTPUT_TOKENS = 14000
// $10 / 1000 wywołań web_search (doliczane do kosztu tokenów)
const WEB_SEARCH_CALL_USD = 0.01

function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// deno-lint-ignore no-explicit-any
function buildRaportPrompt(product: any, recipient: string, aliData = ''): string {
  const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')
  const n = (v: unknown) => Number(v) || 0
  const name = s(product?.nazwa ?? product?.name, 160) || 'produkt'
  const cat = s(product?.kategoria ?? product?.category, 80)
  const link = s(product?.link ?? product?.product_link, 320)
  const saves = n(product?.saves), plays = n(product?.plays), comments = n(product?.comments)
  const dla = s(recipient, 80)
  const sig = [plays ? `~${plays} wyświetleń` : '', saves ? `~${saves} zapisów` : '', comments ? `~${comments} komentarzy` : ''].filter(Boolean).join(', ')

  return `Jesteś czołowym STRATEGIEM e-commerce i brand-builderem. Przygotowujesz DEDYKOWANY raport strategiczny dla konkretnej osoby, która JUŻ ZDECYDOWAŁA, że chce sprzedawać poniższy produkt na rynku polskim. Raport to jej przewodnik: jak wprowadzić produkt, zbudować wokół niego markę i maksymalizować zyski. Po polsku, konkretnie, z energią praktyka — ma się go DOBRZE CZYTAĆ i realnie pomagać. Treściwy, ale NIE 50-stronicowy elaborat: każda sekcja zwarta, mięsista, bez lania wody i bez suchych jednolinijkowców.

ODBIORCA RAPORTU: ${dla || '(klient)'}. Pisz tak, by czuł, że to przygotowane SPECJALNIE dla niego — zwracaj się bezpośrednio („Ty"), użyj jego imienia w "lead" i raz–dwa w treści (z umiarem, naturalnie). To ma być dedykowany dokument, nie szablon.

PRODUKT:
- Nazwa robocza: ${name}
- Kategoria: ${cat || 'do ustalenia z analizy'}
- Dowód popytu: to aktualny HIT na TikToku${sig ? ` (${sig})` : ''} — ludzie już masowo reagują, więc popyt jest realny (research ma potwierdzić skalę, nie zaczynać od zera).
${link ? `- Referencja produktu (analiza cech, ceny, wariantów): ${link}` : ''}
${aliData ? `\nDANE PRODUKTU — REALNE, z aukcji źródłowej (OPIERAJ na nich sekcje 2 „czułe punkty", 3 „avatar/język klienta" i 6 „zestawy/upsell"; web_search użyj TYLKO do cen rynkowych i konkurencji w PL, NIE do zgadywania cech/popytu, które JUŻ masz poniżej):\n${aliData}\n` : ''}
KONTEKST BIZNESOWY (wpleć w strategię — to realny plan działania):
- Start: dropshipping z AliExpress (pierwsze zamówienia, walidacja oferty bez ryzyka magazynu).
- Docelowo: import przez agenta w Chinach z PEŁNYM brandingiem (własne opakowanie, logo na produkcie, wkładki do paczki, branded unboxing experience), a potem magazyn w Polsce (szybka wysyłka, wyższa marża).
- Kanał sprzedaży: dedykowany landing page (one-product store).
- Rynek docelowy: Polska.

ZADANIE: zrób realny research (web_search, po polsku I angielsku — popyt, konkurencja w PL z cenami, trendy, słowa-klucze) i zbuduj kompletny przewodnik. Trzymaj się DOKŁADNIE tych 6 sekcji (w tej kolejności):
1. PRODUKT I POTENCJAŁ RYNKOWY — co to za produkt i jak działa, dlaczego TERAZ, skala popytu w PL (liczby ze źródeł), kto już to sprzedaje i po ile (konkurenci po nazwie + ceny), największa LUKA = otwarte okno.
2. PROBLEM, POTRZEBY I EMOCJE — jaki problem realnie rozwiązuje, jakie potrzeby zaspokaja; wypisz konkretne CZUŁE PUNKTY, w które warto uderzać, by klient poczuł SILNĄ potrzebę zakupu; jak grać na emocjach (strach/aspiracja/wygoda/duma/miłość do bliskich/zwierzęcia). Konkretne kąty, nie ogólniki.
3. GRUPA DOCELOWA — zbuduj konkretny AVATAR (kto to, wiek, sytuacja życiowa, dzień z życia, język jakim mówi, gdzie bywa online, co go boli, co go kręci, co go powstrzymuje przed zakupem). Może 1 główny + 1 poboczny.
4. MARKA I POZYCJONOWANIE — jak zbudować markę pod TEN produkt: zaproponuj 5 NAZW (PL i/lub EN, łatwe, z wolną szansą na domenę), do każdej 1 zdanie uzasadnienia; ton i styl komunikacji, wartości do eksponowania, pozycjonowanie (premium vs przystępne) i dlaczego.
5. PLAN KOMUNIKACJI MARKETINGOWEJ — kanały (Meta/TikTok ads jako główny, organic TikTok, ewentualnie Google), 3-4 KĄTY reklamowe z przykładowymi hookami (gotowe do użycia), struktura lejka, oferta zdejmująca ryzyko (płatność przy odbiorze / gwarancja zwrotu), pomysły na kreacje (UGC, demo, before/after).
6. STRATEGIA ROZWOJU I SKALOWANIA — droga: pierwsze zamówienia (dropship) → walidacja → import z brandingiem przez agenta → magazyn PL → skalowanie (rozszerzenie linii/zestawy/upsell, kolejne kanały, retencja i powracający klienci, ewentualnie eksport). Konkretne kamienie milowe.

ZASADY:
- Konkret i liczby ZE ŹRÓDEŁ (web_search). NIE zmyślaj liczb ani konkurentów — brak twardej danej = napisz jakościowo, bez fałszywej cyfry.
- TON pod osobę, która WCHODZI w ten produkt: pewny, motywujący, pokazujący szansę i drogę — nie strasz, nie rób listy ryzyk. Ma dodawać energii i dawać plan.
- Każda sekcja: kilka akapitów lub konkretne listy — w polu "tresc" MARKDOWN (### podnagłówki, **pogrubienia**, listy „- ", numerację). Nowe linie zapisuj jako \n. Poprawny JSON (jedna wartość = jeden string), tylko podwójne cudzysłowy.
- Indeksy w "zrodla" sekcji odwołują się do głównej tablicy "zrodla" (od 1).

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown wokół, bez tekstu przed/po):
{
  "dla": "${dla}",
  "naglowek": "Raport strategiczny — <krótka, ludzka nazwa produktu>",
  "lead": "2-3 zdania osobistego wprowadzenia po imieniu, KONKRETNIE o TYM produkcie — nazwij go i jego realny atut/kąt (co rozwiązuje, dla kogo, czym się wyróżnia). NIE ogólniki typu „tani/prosty/emocjonalny", które pasują do każdego produktu; ma czuć, że to dedykowane pod JEGO konkretny wybór.",
  "sekcje": [
    {"tytul":"Produkt i potencjał rynkowy","tresc":"markdown…","zrodla":[1]},
    {"tytul":"Problem, potrzeby i emocje","tresc":"markdown…"},
    {"tytul":"Grupa docelowa — avatar","tresc":"markdown…"},
    {"tytul":"Marka i pozycjonowanie","tresc":"markdown…","nazwy":["Nazwa 1","Nazwa 2","Nazwa 3","Nazwa 4","Nazwa 5"]},
    {"tytul":"Plan komunikacji marketingowej","tresc":"markdown…"},
    {"tytul":"Strategia rozwoju i skalowania","tresc":"markdown…"}
  ],
  "zrodla": [ { "nr": 1, "tytul": "nazwa źródła", "url": "https://..." } ]
}`
}

// Mail „raport gotowy" wysyła bud-followups (kind 'raport_ready') z celowym
// opóźnieniem ≥15 min od _meta.at.

// deno-lint-ignore no-explicit-any
function saneRaport(r: any): boolean {
  // Prompt wymaga DOKŁADNIE 6 sekcji — odrzucamy niekompletny raport (regeneracja),
  // żeby etap Ustalenia nie dostał urwanego dokumentu i nie zawieszał się na „raport
  // niekompletny". gpt-5.5 wg sztywnego szablonu JSON niemal zawsze zwraca 6.
  return !!r && typeof r === 'object'
    && typeof r.lead === 'string' && r.lead.length > 10
    && Array.isArray(r.sekcje) && r.sekcje.length >= 6
    && r.sekcje.every((x: any) => x && typeof x.tytul === 'string' && typeof x.tresc === 'string' && x.tresc.length > 25)
    && Array.isArray(r.zrodla)
}

// Model mimo zakazu potrafi owinąć JSON w płotki / dopisać zdanie
function extractJson(raw: string): Record<string, unknown> | null {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)
    }

    // deno-lint-ignore no-explicit-any
    let body: { sessionId?: string; force?: boolean; product?: any; recipient?: string; email?: string }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors)
    }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, cors)
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: session, error: sErr } = await supabase
      .from('bud_sessions')
      .select('id, preview_brief, problem_summary, market_report, assessment, auth_user_id, name, email, raport_available_at')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr) {
      console.error('[bud-raport] session fetch error:', sErr)
      return jsonResponse({ error: 'blad_serwera' }, 500, cors)
    }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)

    // Bramka właściciela: sesja przypięta do konta wymaga JWT tego konta
    // (link ?id= przestaje działać jak hasło — lustrzane odbicie bud-chat).
    const authUser = await verifyAuthUser(req, supabase)
    if (ownerDenied(session.auth_user_id as string | null, authUser)) {
      return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
    }

    // Picker-first: produkt z frontu (wybór z karuzeli). Fallback do karty (stary flow).
    const karta = session.problem_summary as Record<string, unknown> | null
    // deno-lint-ignore no-explicit-any
    const bodyProduct = (body.product && typeof body.product === 'object') ? body.product as any : null
    // deno-lint-ignore no-explicit-any
    const product: any = bodyProduct || (karta ? { name: karta.produkt, category: (karta as any).nisza, product_link: null } : null)
    if (!product || !(product.nazwa || product.name)) {
      return jsonResponse({ error: 'brak_produktu' }, 400, cors)
    }
    const recipient = (typeof body.recipient === 'string' && body.recipient.trim())
      ? body.recipient.trim()
      : (typeof (session as Record<string, unknown>).name === 'string' ? (session as Record<string, unknown>).name as string : '')

    // Bramka kontaktu (cel Tomka: ZERO anonimowych generacji). Raport rusza dopiero, gdy
    // sesja ma e-mail — front zbiera imię+nazwisko+e-mail PRZED raportem. body.email to
    // fallback na wyścig zapisu kontaktu (front zapisuje kontakt i zaraz odpala raport).
    const sessEmail = typeof (session as Record<string, unknown>).email === 'string' ? (session as Record<string, unknown>).email as string : ''
    const hasContact = !!(sessEmail || (typeof body.email === 'string' && body.email.trim()))
    if (!hasContact) return jsonResponse({ needs_contact: true }, 200, cors)

    // MIN. ODSŁONA RAPORTU (decyzja Tomka): raport — nawet z cache — staje się dostępny
    // dopiero ~25 s od startu, żeby nie „błyskał" natychmiast (ma wyglądać na realny
    // research). raport_available_at ustawiamy raz (pierwsze wejście z kontaktem); do tego
    // czasu zwracamy pending i NIE kopiujemy cache do market_report → front, bud-chat i
    // panel spójnie widzą „jeszcze nie gotowy". Świeża generacja trwa >25 s, więc jej nie hamuje.
    const MIN_REVEAL_MS = 25_000
    let availAtIso = (session as Record<string, unknown>).raport_available_at as string | null
    if (!availAtIso) {
      availAtIso = new Date(Date.now() + MIN_REVEAL_MS).toISOString()
      // #10 (R4): utrwal wybrany produkt na sesji — bud-project zwróci go w 'get',
      // front zhydratuje state.chosenProduct i pipeline wznawia się na świeżym urządzeniu.
      await supabase.from('bud_sessions').update({ raport_available_at: availAtIso, chosen_product: product }).eq('id', sessionId)
    }
    const notReadyYet = Date.now() < new Date(availAtIso).getTime()

    // Klucz cache per-PRODUKT: ten sam produkt = ten sam raport (reużycie między userami, bez TTL).
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()
    const productKey = String(product.id || product.product_id || norm(product.nazwa || product.name || '')) || sessionId

    // 1) CACHE PRODUKTU (współdzielony) — hit = oddaj (skopiuj też do sesji dla resume),
    //    ale dopiero po MIN. ODSŁONIE (wcześniej pending, bez kopiowania).
    if (!body.force) {
      const { data: pkg } = await supabase.from('bud_product_packages').select('report').eq('product_key', productKey).maybeSingle()
      if (pkg && pkg.report) {
        if (notReadyYet) return jsonResponse({ pending: true }, 200, cors)
        await supabase.from('bud_sessions').update({ market_report: pkg.report, updated_at: new Date().toISOString() }).eq('id', sessionId)
        const { _meta: _d, ...raport } = pkg.report as Record<string, unknown>
        return jsonResponse({ raport, cached: true }, 200, cors)
      }
    }
    // 2) CACHE SESJI (np. refresh tej samej rozmowy) — też po MIN. ODSŁONIE.
    const existing = session.market_report as Record<string, unknown> | null
    if (existing && !body.force) {
      if (notReadyYet) return jsonResponse({ pending: true }, 200, cors)
      const { _meta: _drop, ...raport } = existing
      return jsonResponse({ raport, cached: true }, 200, cors)
    }
    const meta = (existing && existing._meta) as Record<string, unknown> | null
    const genCount = (meta && typeof meta.gen === 'number') ? meta.gen : (existing ? 1 : 0)
    if (genCount >= MAX_GENERATIONS) {
      if (existing) {
        const { _meta: _drop2, ...raport } = existing
        return jsonResponse({ raport, cached: true }, 200, cors)
      }
      return jsonResponse({ error: 'limit_generacji' }, 429, cors)
    }

    // Lock: research trwa >150s — reload/drugi tab nie może odpalić duplikatu.
    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'raport', p_ttl_sec: 400 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    // Dzienny cap per IP — raporty z 24 h po wszystkich sesjach tego IP (wzorzec
    // bud-landing; liczone z bud_usage.created_at, nie z wieku sesji). Obejmuje
    // też force=true (regeneracja pali dokładnie tę samą generację gpt-5.5+web_search).
    // FAIL-OPEN: brak IP / błąd zapytania / brak tabeli → NIE blokuj (loguj),
    // żeby nie wywalić legalnych userów. Po przekroczeniu zwalniamy lock, by reload
    // nie wisiał na pending i nie trzymał locka 400 s.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    if (ip) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ipSessions, error: ipErr } = await supabase
        .from('bud_sessions')
        .select('id')
        .eq('ip', ip)
      if (ipErr) {
        console.error('[bud-raport] ip sessions query error (fail-open):', ipErr)
      } else if (ipSessions && ipSessions.length) {
        const { count: ipCount, error: ipUsageErr } = await supabase
          .from('bud_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'raport')
          .in('session_id', ipSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (ipUsageErr) {
          console.error('[bud-raport] ip usage count error (fail-open):', ipUsageErr)
        } else if ((ipCount ?? 0) >= MAX_RAPORTS_PER_IP_PER_DAY) {
          try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'raport' }) } catch (_) { /* */ }
          return jsonResponse({ error: 'limit_raportow_dzienny' }, 429, cors)
        }
      }
    } else {
      console.warn('[bud-raport] brak x-forwarded-for — pomijam dzienny cap IP (fail-open)')
    }

    // [Audyt kontekstu] REALNE dane produktu z aukcji (ali_snapshot) — raport ma je CYTOWAĆ
    // (czułe punkty z opinii, avatar, realne warianty/zestawy, twardy dowód popytu z liczby ocen),
    // a web_search ograniczyć do cen/konkurencji. Wzór jak bud-mockup. Tani input, cache per-produkt.
    let aliData = ''
    try {
      const pkId = String(product.id || '')
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pkId)) {
        const { data: row } = await supabase.from('bud_tt_products').select('ali_snapshot').eq('id', pkId).maybeSingle()
        // deno-lint-ignore no-explicit-any
        const snap = (row?.ali_snapshot || null) as any
        if (snap) {
          // deno-lint-ignore no-explicit-any
          const specs = Array.isArray(snap.specs) ? snap.specs.slice(0, 12).map((x: any) => (x && x.name) ? `${x.name}: ${x.value}` : '').filter(Boolean) : []
          const variants = Array.isArray(snap.variants) ? snap.variants.slice(0, 12).map((x: any) => String(x)).filter(Boolean) : []
          // deno-lint-ignore no-explicit-any
          const revLines = (Array.isArray(snap.reviews) ? snap.reviews.slice(0, 8) : []).map((r: any) => `${r.stars || 5}★ ${String(r.text_pl || r.text || '').replace(/\s+/g, ' ').slice(0, 150)}`).filter((x: string) => x.length > 5)
          const rs = snap.review_stats || {}
          const parts: string[] = []
          if (snap.title) parts.push(`Pełny tytuł (aukcja): ${String(snap.title).slice(0, 200)}`)
          if (rs.avg) parts.push(`Dowód popytu (aukcja): ocena ${String(rs.avg).replace('.', ',')}/5 z ${rs.numRatings || 0} ocen${rs.positivePct ? `, ${rs.positivePct}% pozytywnych` : ''}`)
          if (specs.length) parts.push(`Specyfikacja: ${specs.join('; ')}`)
          if (variants.length) parts.push(`Warianty/zestawy: ${variants.join(', ')}`)
          if (revLines.length) parts.push(`OPINIE KUPUJĄCYCH (realne):\n${revLines.join('\n')}`)
          aliData = parts.join('\n').slice(0, 2400)
        }
      }
    } catch { /* brak snapshotu — raport jak dotąd */ }

    // GENEROWANIE W TLE: pełny raport (web_search + gpt-5.5) trwa dłużej niż 150s
    // bramki request/response (→ 504). Zwracamy 202 OD RAZU, a robotę kończymy
    // przez EdgeRuntime.waitUntil. Gdy market_report się zapisze, kolejny POST
    // (front pollinguje) zwróci wersję cached.
    const genTask = (async () => {
      let saved = false
      try {
        const res = await openaiFetchRetry('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            tools: [{ type: 'web_search' }],
            input: buildRaportPrompt(product, recipient, aliData),
            max_output_tokens: MAX_OUTPUT_TOKENS,
          }),
        })
        if (!res.ok) {
          const errText = await res.text().catch(() => '')
          console.error('[bud-raport] openai error:', res.status, errText.slice(0, 500))
          return
        }
        const data = await res.json()
        const output = Array.isArray(data?.output) ? data.output : []
        const searchCalls = output.filter((o: Record<string, unknown>) => o?.type === 'web_search_call').length
        let text = typeof data?.output_text === 'string' ? data.output_text : ''
        if (!text) {
          for (const item of output) {
            if (item?.type === 'message' && Array.isArray(item.content)) {
              for (const c of item.content) {
                if (c?.type === 'output_text' && typeof c.text === 'string') text += c.text
              }
            }
          }
        }

        try {
          const u = data?.usage || {}
          const input = u.input_tokens || 0
          const cachedTok = u.input_tokens_details?.cached_tokens || 0
          const out = u.output_tokens || 0
          const prices: Record<string, { i: number; c: number; o: number }> = {
            'gpt-5.5': { i: 5, c: 0.5, o: 30 },
            'gpt-5.1': { i: 1.25, c: 0.125, o: 10 },
          }
          const p = prices[OPENAI_MODEL] || prices['gpt-5.5']
          await supabase.from('bud_usage').insert({
            session_id: sessionId, kind: 'raport', model: OPENAI_MODEL,
            input_tokens: input, cached_tokens: cachedTok, output_tokens: out,
            cost_usd: (Math.max(0, input - cachedTok) * p.i + cachedTok * p.c + out * p.o) / 1_000_000 + searchCalls * WEB_SEARCH_CALL_USD,
            meta: { web_search_calls: searchCalls },
          })
        } catch (uErr) { console.error('[bud-raport] usage insert error:', uErr) }

        const raport = extractJson(text)
        if (!raport || !saneRaport(raport)) {
          console.error('[bud-raport] sanity-check fail:', String(text).slice(0, 300))
          return
        }
        const toSave = { ...raport, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL, searches: searchCalls } }
        const { error: updErr } = await supabase
          .from('bud_sessions')
          .update({ market_report: toSave, updated_at: new Date().toISOString() })
          .eq('id', sessionId)
        if (updErr) console.error('[bud-raport] save error:', updErr)
        else saved = true
        // CACHE PRODUKTU: zapisz raport pod kluczem produktu → kolejni userzy reużyją bez generowania.
        try {
          await supabase.from('bud_product_packages').upsert({
            product_key: productKey,
            product_name: String(product.nazwa || product.name || ''),
            category: String(product.kategoria || product.category || ''),
            report: toSave,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'product_key' })
        } catch (pkgErr) { console.error('[bud-raport] product cache upsert error:', pkgErr) }
      } catch (e) {
        console.error('[bud-raport] gen task error:', e)
      } finally {
        // Po BŁĘDZIE (raport NIE zapisany) ZWOLNIJ lock — żeby kolejny poll/strzał wygenerował
        // OD RAZU, zamiast czekać 400s na wygaśnięcie TTL (to był objaw „raport nie generuje się
        // w ogóle": genTask padł na 429/timeout/sanity, lock trzymał 400s, klient pollował pending
        // do wyczerpania prób). Po sukcesie locka NIE ruszamy — wygaśnie sam, a kolejny poll i tak
        // zwróci cached. Spójne z bud-ads/brand/economics/gtm (one też releasują po zakończeniu).
        if (!saved) { try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'raport' }) } catch (_) { /* */ } }
      }
    })()

    // Kontynuuj robotę po zwróceniu odpowiedzi (Supabase Edge background task).
    try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(genTask) } catch (_) { /* brak waitUntil — task i tak wystartował */ }

    return jsonResponse({ pending: true }, 202, cors)
  } catch (e) {
    console.error('[bud-raport] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
