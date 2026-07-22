// spar-assess — BRAMKA POTENCJAŁU sparingu (Faza 1 re-architektury).
//
// Osobny, kontrolowalny krok oceny: czy z pomysłu da się zrobić biznes, za który
// ktoś realnie płaci co miesiąc. REALNY research (Responses API + web_search) →
// structured verdict, na którym kod gate'uje rozmowę. NIE kotwiczy w liczbie 50,
// NIE ma docelowego % — ocena holistyczna na meritach (spec:
// data-private/aplikacja-sparing-redesign.md).
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-assess --no-verify-jwt
//
// POST { projekt: {nazwa,opis,problem,dla_kogo,kto_placi,ekrany,konkurencja}, sessionId? }
//   → { ocena: {...verdict...} }   (sessionId opcjonalny — tylko do logu kosztu)
//
// Sekrety: OPENAI_API_KEY; SPAR_ASSESS_MODEL (override; default SPAR_OPENAI_MODEL -> gpt-5.5)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'https://crm.tomekniedzwiecki.pl',
  'https://tn-crm.vercel.app',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
]
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const OPENAI_MODEL = Deno.env.get('SPAR_ASSESS_MODEL') || Deno.env.get('SPAR_OPENAI_MODEL') || 'gpt-5.6-sol'
const MAX_OUTPUT_TOKENS = 6000
const WEB_SEARCH_CALL_USD = 0.01
function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

function buildPrompt(p: Record<string, unknown>): string {
  const s = (v: unknown, max = 400) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ') : ''
  const fakty: string[] = []
  fakty.push(`Pomysł na narzędzie: „${s(p.nazwa, 80) || 'bez nazwy'}" — ${s(p.opis)}`)
  if (p.problem) fakty.push(`Problem, który rozwiązuje: ${s(p.problem)}`)
  if (p.dla_kogo || p.profesja) fakty.push(`Dla kogo / grupa docelowa: ${s(p.dla_kogo) || s(p.profesja)}`)
  if (p.kto_placi) fakty.push(`Kto miałby płacić: ${s(p.kto_placi)}`)
  if (p.dzisiejsze_obejscie) fakty.push(`Jak radzą sobie dziś: ${s(p.dzisiejsze_obejscie)}`)
  if (list(p.ekrany)) fakty.push(`Zakres pierwszej wersji: ${list(p.ekrany)}`)
  if (p.konkurencja) fakty.push(`Konkurencja wskazana w rozmowie: ${s(p.konkurencja)}`)

  return `Jesteś KONSTRUKTYWNYM analitykiem-doradcą biznesowym o nastawieniu „da się". Masz DWA zadania, równie ważne: (1) ocenić, czy z TEGO pomysłu da się zrobić opłacalny MIKRO-produkt cyfrowy (SaaS) w polskiej niszy — taki, za który wąska grupa realnie płaci CO MIESIĄC; (2) gdy jeszcze nie da się w tej formie — WSKAZAĆ konkretny kierunek, w którym się da, i poprowadzić tam. Cel to mikro-biznes (już kilkaset płacących = sukces), NIE jednorożec. NIE jesteś krytykiem szukającym dziur — jesteś doradcą, który ma doprowadzić pomysł do wersji z potencjałem. Domyślnie zakładasz, że SIĘ DA, i szukasz drogi, żeby się dało.

O sukcesie decyduje WIELE rzeczy, NIE sama unikalność: realny, powtarzalny problem, grupa która woli zapłacić kilkadziesiąt zł niż męczyć się ręcznie, dosięgalność i wykonanie. Pomysł NIE musi być unikalny, „nie do podrobienia" ani pierwszy na rynku. Budowę i sprzedaż do pierwszych ~50 klientów bierze na siebie zespół Tomka (to on przez ~pół roku rozkręca sprzedaż i dystrybucję) — więc NIE oceniaj, czy pomysł „obroni się sam" ani czy autor ma kontakty/zasięgi. Liczy się, czy istnieje realna, płacąca potrzeba i da się ją gdzieś znaleźć. Istnienie podobnych narzędzi to NORMALNY sygnał popytu, nie powód do odrzucenia. Zrób realny research (web search; po polsku i angielsku) — po to, by URZECZYWISTNIĆ i wyostrzyć pomysł oraz znaleźć najlepszy kąt, NIE żeby go storpedować. Wyszukuj OSZCZĘDNIE i tylko CELOWANE zapytania (najbliżsi konkurenci + ich realne ceny, rozmiar niszy) — lepiej kilka trafnych zapytań niż kilkanaście; nie mnóż zapytań ponad realną potrzebę. Priorytet: realne polskie nazwy i ceny ze źródeł. Ceny zagraniczne podawaj też orientacyjnie przeliczone na zł (np. „$9.99 ≈ 40 zł/mies."), nie zostawiaj w komunikacji samych dolarów.

POMYSŁ:
${fakty.join('\n')}

OCEŃ HOLISTYCZNIE — NIE kotwicz w żadnej docelowej liczbie klientów ani procencie, oceń na meritach:
1. Czy problem jest realny i powtarzalny? Nie musi być „palący" — wystarczy, że jest na tyle uciążliwy/żmudny, że ktoś woli zapłacić kilkadziesiąt zł, niż robić to ręcznie. UWAGA: jeśli ludzie radzą sobie dziś Excelem/zeszytem/telefonem — to DOWÓD, że job jest realny, a NIE powód do odrzucenia; to właśnie miejsce na narzędzie.
2. Kto i DLACZEGO płaciłby co miesiąc — realnie? Wąska grupa wystarczy.
3. Konkurencja: znajdź 2-4 najbliższe narzędzia (nazwy, realne ceny ze źródeł; najpierw polskie). Istnienie konkurentów to NORMA i sygnał popytu, NIE powód do odrzucenia. Zanim uznasz niszę za „zajętą", AKTYWNIE poszukaj kąta obok (węższa grupa, inny fragment procesu, prostsza obsługa, polski/lokalny kontekst). Realna przeszkoda istnieje TYLKO wtedy, gdy jeden TANI, DOBRY, LUBIANY produkt robi DOKŁADNIE ten sam job dla DOKŁADNIE tej grupy i NIE widać żadnego sensownego kąta obok (np. wprost „kolejny Booksy dla fryzjerów"). Konkurenci CZĘŚCIOWI/sąsiedni (ogólny CRM, LMS, drogie zagraniczne narzędzie, pakiet szablonów) NIGDY nie dyskwalifikują — zostawiają kąt.
4. Dosięgalność: czy tę grupę da się zdefiniować i gdzieś znaleźć (grupy FB, social, polecenia, kanały branżowe)? Dystrybucję skaluje zespół Tomka — wystarczy, że kanał realnie istnieje, nie musi być banalny.
5. Rozmiar i charakter niszy — z researchu (z liczbą, jeśli jest).
6. TEST MODELU (ważny): droga do biznesu prowadzi przez ~50 STAŁYCH PŁACĄCYCH klientów, do których zespół Tomka dociera i sprzedaje 1:1 (jego model). Czy przy ~50 płacących to już sensowny mały biznes (kilka tys. zł/mies.)? Gdy płatnikiem ma być MASA konsumentów po kilka zł (B2C) — 50 osób to kilkaset zł (nie biznes), a aplikacji konsumenckiej nie sprzedaje się ręcznie po jednym → to NIE „mocny", lecz sygnał „do_poprawy": w polu kierunek przekieruj na płatnika, dla którego ~50 klientów ≈ realny przychód (konkretny zawód/firma/segment pro), zwykle blisko świata tej osoby (np. hobby roślinne → narzędzie dla sklepów/szkółek/usług ogrodniczych, nie kolejna apka dla domowych roślin). NIE odrzucaj pomysłu — znajdź wersję B2B/pro tego samego świata.
7. TEST ZABAWKI (twardy): czy to realny PRODUKT NA SPRZEDAŻ, czy projekt-zabawka? Sygnały zabawki: narzędzie „dla mnie i znajomych", hobby bez płacącego, gadżet ciekawostkowy, którego nikt nie potrzebuje CO MIESIĄC, pomysł z kategorii „fajnie by było" bez bólu, za który ktoś płaci. Zabawka NIGDY nie dostaje „mocny" — dostaje „do_poprawy" z kierunkiem na SPRZEDAWALNĄ wersję z tego samego świata (kto w tym świecie ma firmę/zawód i policzalny problem?). Celem całej rozmowy jest biznes, który ZARABIA — nie realizacja fantazji.
8. DŹWIGNIA AI (zawsze wypełniasz): zaprojektuj, jak wbudowana sztuczna inteligencja może wykonywać część pracy ZA użytkownika tego narzędzia — konkretnie pod TEN projekt (np. automatyczna analiza dokumentu/zdjęcia, generowanie gotowej wyceny/oferty/treści, przewidywanie i priorytety, inteligentne dopasowanie, odczyt danych z plików). Wybierz 1–2 zastosowania, które NAJMOCNIEJ podnoszą wartość rdzenia i za które klient realnie dopłaci — nie gadżet „bo modne". To ważny wyróżnik oferty: narzędzie + AI, które robi robotę, a nie tylko formularze.

KIERUNEK — pole „kierunek" wypełniasz ZAWSZE, przy KAŻDEJ ocenie. To CEL całego badania i Twój najważniejszy produkt: nie ocena dla oceny, lecz użycie researchu (zwłaszcza LUKI) do wyrzeźbienia wersji pomysłu z NAJWIĘKSZĄ realną szansą na rynku — maksymalizuj szanse, weź najmocniejszy kąt z danych i tak ustaw produkt, żeby mógł realnie wygrać. Gdy masz już taki kąt, podaj go z przekonaniem, jak realną szansę (rozsądny optymizm jest OK), a nie jako „może się uda". Zawsze KONKRETNIE — nie ogólnik („zawęź niszę"), nie lista opcji; jedna pewna rekomendacja, w którą prowadzisz dalej, brzmiąca tak, że user pomyśli „o, to ma sens":
- gdy „mocny": podaj NAJOSTRZEJSZY kąt/pozycjonowanie — jak to zbudować, żeby miało największy potencjał (np. „buduj to jako ultraproste narzędzie dla małego barbera: link, kalendarz, SMS, zero prowizji — nie jako kolejne generyczne Booksy"). Nawet dobry pomysł wskaż, jak wyostrzyć.
- gdy „do_poprawy" / „slaby": podaj mocniejszy kąt BLISKO świata tej osoby (jej branża, praca, pasja, odbiorcy, których zna) — nazwij OSTRZEJSZĄ grupę i OSTRZEJSZY job, w który realnie wierzysz. To pivot na wersję z realnymi szansami.

Bądź uczciwy, ale nie czepialski: jeśli czegoś naprawdę brakuje, powiedz wprost i OD RAZU wskaż drogę naprzód. ŻADNYCH liczb z głowy — tylko z researchu; gdy nie znalazłeś, napisz „brak danych". Każdą liczbę cytuj DOKŁADNIE jak w źródle (z jednostką i oryginalnym zakresem); NIE podawaj dwóch różnych wartości dla tej samej wielkości w jednej ocenie; jeśli źródło mówi „psy i koty" albo „placówki gastronomiczne", nie zawężaj tego cicho do „psy" czy „restauracje". W KOMUNIKACJI wolisz orientacyjne PRZEDZIAŁY od fałszywej precyzji: pojedynczą dokładną liczbę podawaj tylko, gdy masz ją pewną ze źródła; gdy pewności brak — powiedz ogólnie („kilkanaście tysięcy", „niewielka, ale realna nisza") BEZ konkretnej liczby, zamiast strzelać.

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez tekstu przed/po):
{
  "oplacalne": true,
  "ocena": "mocny",
  "problem_realny": "1 zdanie — czy problem jest realny i bolesny",
  "platnosc": "1 zdanie — czy ktoś realnie zapłaci co miesiąc i dlaczego (lub czemu nie)",
  "konkurencja": "1-2 zdania — czy nisza zajęta; nazwy i ceny ze źródeł",
  "dosiegalnosc": "1 zdanie — czy da się tę grupę dosięgnąć",
  "odczyt_rynku": "1-2 zdania — rozmiar/charakter niszy z researchu, z liczbą jeśli jest",
  "kierunek": "ZAWSZE wypełnione — w którą stronę poprowadzić pomysł: gdy mocny = najostrzejszy kąt/pozycjonowanie do budowy; gdy do_poprawy/slaby = konkretny mocniejszy pivot blisko świata tej osoby",
  "ai_dzwignia": "ZAWSZE wypełnione — 1-2 zdania: jak wbudowana sztuczna inteligencja wzmocni rdzeń TEGO narzędzia (konkretne zastosowanie, które robi robotę za użytkownika)",
  "powody": ["2-4 krótkie, konkretne powody oceny — wyprowadzone z danych"],
  "zrodla": [ { "tytul": "nazwa źródła", "url": "https://..." } ]
}

KALIBRACJA OCENY (jesteś KONSTRUKTYWNYM doradcą o nastawieniu „da się", ale oceniasz UCZCIWIE i na meritach — werdykt ma COŚ ZNACZYĆ, więc NIE każdy pomysł jest od razu „mocny"; wynik wyprowadzasz z DOWODÓW z rozmowy i researchu, nie z uprzejmości):
- "mocny" (oplacalne=true): realnie WIDAĆ trzy fundamenty naraz — (a) konkretny, powtarzalny problem (choćby „tylko" uciążliwy), (b) wąską grupę z realnym powodem, by płacić co miesiąc (kilkaset osób wystarczy), (c) jakikolwiek realny kanał dotarcia — ORAZ pomysł nie jest DOSŁOWNIE „to samo co tani, lubiany dominant, tylko taniej". Kąt NIE musi być unikalny, ale musi być KONKRETNY.
- "do_poprawy" (oplacalne=false): NORMALNY, częsty wynik (NIE porażka) — gdy któregoś fundamentu jeszcze nie widać (mglisty płacący/grupa; narzędzie-gadżet do WŁASNEGO użytku zamiast czegoś sprzedawalnego innym; ból zbyt drobny, by ktoś zapłacił), ALBO pomysł wchodzi czołowo w taniego dominanta i NIE widać kąta obok. W polu „kierunek" domknij brakujący fundament albo wskaż kąt OBOK. Używaj go ŚMIAŁO, gdy materiał jest słaby — lepszy uczciwy pivot niż pochopne „mocny".
- "slaby" (oplacalne=false): naprawdę brak fundamentu (nikt nie odczuwa problemu albo realnie nikt by nie zapłacił) i nawet wąski kąt nie ratuje TEJ formy → w „kierunek" wskaż INNY realny kierunek blisko świata tej osoby (nigdy „to się nie da", zawsze „spróbujmy stąd").
ZŁOTE ZASADY: (1) oceniaj na DOWODACH, nie z uprzejmości — gdy fundamentu nie widać, „do_poprawy" jest właściwą, POMOCNĄ odpowiedzią (nie naciągaj na „mocny"). (2) Brak unikalności, istnienie konkurencji ani darmowe obejście (Excel/zeszyt) NIGDY same w sobie nie obniżają oceny — to sygnały popytu. (3) Pole „kierunek" jest ZAWSZE wypełnione — także przy „mocny" (wtedy = najostrzejszy kąt/pozycjonowanie). Bramka NIGDY nie zostawia użytkownika bez wskazania, w którą stronę iść.
"ocena" ∈ {"mocny","do_poprawy","slaby"}; "oplacalne" = true wyłącznie dla "mocny".`
}

const OCENY = ['mocny', 'do_poprawy', 'slaby']
// deno-lint-ignore no-explicit-any
function saneOcena(o: any): boolean {
  return !!o && typeof o === 'object'
    && typeof o.oplacalne === 'boolean'
    && typeof o.ocena === 'string' && OCENY.includes(o.ocena)
    && typeof o.problem_realny === 'string'
    && typeof o.platnosc === 'string'
    && typeof o.kierunek === 'string' && o.kierunek.trim().length > 0
    && Array.isArray(o.powody) && o.powody.length >= 1
}
function extractJson(raw: string): Record<string, unknown> | null {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.indexOf('{'); const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try { return JSON.parse(text.slice(start, end + 1)) } catch { return null }
}

// Parsuje surowy tekst → obiekt oceny (normalizacja pivot→kierunek + sanity).
function finalizeOcena(text: string): Record<string, unknown> | null {
  const ocena = extractJson(text)
  if (ocena && typeof ocena === 'object' && !(ocena as Record<string, unknown>).kierunek && typeof (ocena as Record<string, unknown>).pivot === 'string') {
    (ocena as Record<string, unknown>).kierunek = (ocena as Record<string, unknown>).pivot
  }
  return (ocena && saneOcena(ocena)) ? ocena : null
}

// Skraca URL do czytelnej formy (domena + krótka ścieżka) dla etykiet postępu.
function prettyUrl(u: string): string {
  try { const x = new URL(u); return (x.hostname.replace(/^www\./, '') + x.pathname).replace(/\/+$/, '').slice(0, 55) } catch { return u.slice(0, 55) }
}

// Log kosztu bramki do spar_usage (używane przez ścieżkę streamingu).
async function logAssessCost(sessionId: string, model: string, u: Record<string, unknown> | null, searchCalls: number): Promise<void> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const input = (u?.input_tokens as number) || 0
    const cached = ((u?.input_tokens_details as Record<string, unknown>)?.cached_tokens as number) || 0
    const out = (u?.output_tokens as number) || 0
    const prices: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.6-sol': { i: 5, c: 0.5, o: 30 }, 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
    const p = prices[model] || prices['gpt-5.5']
    await supabase.from('spar_usage').insert({
      session_id: sessionId, kind: 'assess', model,
      input_tokens: input, cached_tokens: cached, output_tokens: out,
      cost_usd: (Math.max(0, input - cached) * p.i + cached * p.c + out * p.o) / 1_000_000 + searchCalls * WEB_SEARCH_CALL_USD,
      meta: { web_search_calls: searchCalls, streamed: true },
    })
  } catch (e) { console.error('[spar-assess] logAssessCost error:', e) }
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)
  // Endpoint WEWNĘTRZNY — jedynym wywołującym jest spar-chat (server-to-server, runGate)
  // z kluczem service-role. Front go NIE woła. Bez tej bramki publiczny endpoint
  // (--no-verify-jwt) pozwalał dowolnemu, kto zna URL, palić tokeny OpenAI bezpośrednim
  // curlem (~$0.28 + web_search za ocenę, bez sesji ani limitu). Wymóg klucza service-role
  // zamyka to w 100%, a spar-chat zawsze go ma — realny ruch nietknięty.
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authToken = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!SERVICE_KEY || authToken !== SERVICE_KEY) {
    return jsonResponse({ error: 'brak_dostepu' }, 401, cors)
  }
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)

    let body: { projekt?: Record<string, unknown>; sessionId?: string; stream?: boolean; debug?: boolean }
    try { body = await req.json() } catch { return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors) }
    const projekt = body.projekt
    if (!projekt || typeof projekt !== 'object' || (!projekt.opis && !projekt.problem && !projekt.nazwa)) {
      return jsonResponse({ error: 'brak_pomyslu' }, 400, cors)
    }

    // ── Tryb STREAMING (opt-in: body.stream) — postęp na żywo dla frontu ───────
    // Buforowany tryb (poniżej) zostaje DOMYŚLNY i nietknięty. runGate w spar-chat
    // używa streamu dla realnego postępu, z fallbackiem na buforowany.
    if (body.stream === true) {
      const sessionIdS = (body.sessionId || '').trim()
      const upstream = await openaiFetchRetry('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        // max_tool_calls: dokumentowany lever na liczbę wyszukań (bywa ignorowany
        // przez model — patrz audyt 2026-06-14, realnie 6-8 zamiast 2-3 — ale to
        // jedyny twardy sufit, więc ustawiamy; prompt już nie obiecuje konkretnej liczby).
        body: JSON.stringify({ model: OPENAI_MODEL, tools: [{ type: 'web_search' }], max_tool_calls: 4, reasoning: { effort: 'low' }, input: buildPrompt(projekt), max_output_tokens: MAX_OUTPUT_TOKENS, stream: true }),
      })
      if (!upstream.ok || !upstream.body) {
        const errText = await upstream.text().catch(() => '')
        console.error('[spar-assess] openai stream error:', upstream.status, errText.slice(0, 300))
        return jsonResponse({ error: 'blad_oceny' }, 502, cors)
      }
      const enc = new TextEncoder()
      const reader = upstream.body.getReader()
      const sse = new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (event: string, obj: unknown) => controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(obj)}\n\n`))
          let text = ''
          let usage: Record<string, unknown> | null = null
          let searchCalls = 0
          let wroteWriting = false
          let startedSearching = false
          try {
            const dec = new TextDecoder()
            let buf = ''
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              buf += dec.decode(value, { stream: true })
              let i
              while ((i = buf.indexOf('\n\n')) >= 0) {
                const rawEvt = buf.slice(0, i); buf = buf.slice(i + 2)
                let ev = ''; let dataStr = ''
                for (const line of rawEvt.split('\n')) {
                  if (line.startsWith('event:')) ev = line.slice(6).trim()
                  else if (line.startsWith('data:')) dataStr += line.slice(5).replace(/^ /, '')
                }
                if (!dataStr) continue
                let d: Record<string, unknown> | null = null
                try { d = JSON.parse(dataStr) } catch { continue }
                const t = ev || (typeof d?.type === 'string' ? d.type as string : '')
                if (t === 'response.web_search_call.in_progress') {
                  // Natychmiastowy sygnał, zanim znamy treść zapytania
                  if (!startedSearching) { startedSearching = true; send('progress', { label: 'Badam Twój rynek na żywo…' }) }
                } else if (t === 'response.web_search_call.completed') {
                  searchCalls++
                } else if (t === 'response.output_item.done') {
                  // Tu pojawia się REALNA treść: action.queries (zapytanie) lub open_page.url
                  const item = (d?.item || {}) as Record<string, unknown>
                  if (item.type === 'web_search_call') {
                    const action = (item.action || {}) as Record<string, unknown>
                    let label = ''
                    if (action.type === 'search') {
                      const qs = Array.isArray(action.queries) ? action.queries as unknown[] : []
                      let q = ((typeof action.query === 'string' && (action.query as string).trim()) ? action.query as string : (typeof qs[0] === 'string' ? qs[0] as string : '')).trim()
                      if (q) {
                        if (/^calculator:/i.test(q) || /^[\d\s+\-*/().,%]+$/.test(q)) {
                          label = 'Liczę dane o rynku…'
                        } else {
                          q = q.replace(/^site:\S+\s+/i, '').trim()
                          label = 'Sprawdzam: ' + (q.length > 70 ? q.slice(0, 70) + '…' : q)
                        }
                      }
                    } else if (action.type === 'open_page' && typeof action.url === 'string') {
                      label = 'Czytam: ' + prettyUrl(action.url as string)
                    }
                    if (label) send('progress', { label })
                  }
                } else if (t === 'response.output_text.delta') {
                  const delta = typeof d?.delta === 'string' ? d.delta : ''
                  if (delta) {
                    text += delta
                    if (!wroteWriting) { wroteWriting = true; send('progress', { label: 'Układam rekomendację…' }) }
                  }
                } else if (t === 'response.completed' || t === 'response.incomplete') {
                  const r = (d?.response || {}) as Record<string, unknown>
                  usage = (r.usage as Record<string, unknown>) || usage
                  if (!text && typeof r.output_text === 'string') text = r.output_text as string
                }
              }
            }
            const ocena = finalizeOcena(text)
            if (sessionIdS) await logAssessCost(sessionIdS, OPENAI_MODEL, usage, searchCalls)
            if (ocena) send('verdict', { ocena, searches: searchCalls })
            else { console.error('[spar-assess] stream: ocena nie przeszła sanity-check:', text.slice(0, 200)); send('error', { error: 'blad_oceny' }) }
          } catch (e) {
            console.error('[spar-assess] stream loop error:', e)
            try { send('error', { error: 'blad_serwera' }) } catch { /* klient mógł się rozłączyć */ }
          } finally {
            try { controller.close() } catch { /* już zamknięte */ }
          }
        },
      })
      return new Response(sse, { status: 200, headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } })
    }

    const res = await openaiFetchRetry('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        tools: [{ type: 'web_search' }],
        max_tool_calls: 4, reasoning: { effort: 'low' },
        input: buildPrompt(projekt),
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[spar-assess] openai error:', res.status, errText.slice(0, 500))
      return jsonResponse({ error: 'blad_oceny' }, 502, cors)
    }
    const data = await res.json()
    const output = Array.isArray(data?.output) ? data.output : []
    const searchCalls = output.filter((o: Record<string, unknown>) => o?.type === 'web_search_call').length
    let text = typeof data?.output_text === 'string' ? data.output_text : ''
    if (!text) {
      for (const item of output) {
        if (item?.type === 'message' && Array.isArray(item.content)) {
          for (const c of item.content) { if (c?.type === 'output_text' && typeof c.text === 'string') text += c.text }
        }
      }
    }

    // Koszt → spar_usage (tylko gdy mamy sessionId i konfigurację bazy)
    const sessionId = (body.sessionId || '').trim()
    if (sessionId) {
      try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (SUPABASE_URL && SERVICE_KEY) {
          const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
          const u = data?.usage || {}
          const input = u.input_tokens || 0, cached = u.input_tokens_details?.cached_tokens || 0, out = u.output_tokens || 0
          const prices: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.6-sol': { i: 5, c: 0.5, o: 30 }, 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
          const p = prices[OPENAI_MODEL] || prices['gpt-5.5']
          await supabase.from('spar_usage').insert({
            session_id: sessionId, kind: 'assess', model: OPENAI_MODEL,
            input_tokens: input, cached_tokens: cached, output_tokens: out,
            cost_usd: (Math.max(0, input - cached) * p.i + cached * p.c + out * p.o) / 1_000_000 + searchCalls * WEB_SEARCH_CALL_USD,
            meta: { web_search_calls: searchCalls },
          })
        }
      } catch (uErr) { console.error('[spar-assess] usage insert error:', uErr) }
    }

    const ocena = extractJson(text)
    // Kompatybilność: gdyby model zwrócił stare pole "pivot" zamiast "kierunek" — znormalizuj.
    if (ocena && typeof ocena === 'object' && !(ocena as Record<string, unknown>).kierunek && typeof (ocena as Record<string, unknown>).pivot === 'string') {
      (ocena as Record<string, unknown>).kierunek = (ocena as Record<string, unknown>).pivot
    }
    if (!ocena || !saneOcena(ocena)) {
      console.error('[spar-assess] ocena nie przeszła sanity-check:', String(text).slice(0, 300))
      return jsonResponse({ error: 'blad_oceny' }, 502, cors)
    }
    return jsonResponse({ ocena, searches: searchCalls }, 200, cors)
  } catch (e) {
    console.error('[spar-assess] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
