// bud-assess — BRAMKA POTENCJAŁU lejka „Zbuduję" (AWE, e-commerce fizyczny).
//
// Fork spar-assess. Osobny, kontrolowalny krok oceny: czy z DANEGO produktu
// fizycznego da się zbudować opłacalny sklep e-commerce (popyt + marża + dosięgalność
// przez Meta/TikTok ads + COD). REALNY research (Responses API + web_search) →
// structured verdict, na którym kod gate'uje rozmowę. NIE kotwiczy w żadnej docelowej
// liczbie sprzedaży/obrotu, NIE ma docelowego % — ocena holistyczna na meritach
// (spec: docs/zbuduje/PLAN-SPARING-ZBUDUJE.md, sekcja 6).
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy bud-assess --no-verify-jwt
//
// POST { projekt: {nazwa,opis,produkt,nisza,dla_kogo,track,cena_detaliczna,koszt_zakupu,kanal,konkurencja,...}, sessionId? }
//   → { ocena: {...verdict...} }   (sessionId opcjonalny — tylko do logu kosztu)
//
// Sekrety: OPENAI_API_KEY; BUD_ASSESS_MODEL (override; default BUD_OPENAI_MODEL -> gpt-5.5)

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
const OPENAI_MODEL = Deno.env.get('BUD_ASSESS_MODEL') || Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.5'
const MAX_OUTPUT_TOKENS = 6000
const WEB_SEARCH_CALL_USD = 0.01
function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

// Etykiety akcentu per kierunek (track). K1 = walidacja niszy od zera,
// K2 = audyt istniejącego produktu, K3 = walidacja własnego pomysłu.
function trackAccent(track: string): string {
  switch ((track || '').toLowerCase()) {
    case 'k1':
      return `KIERUNEK K1 (walidacja niszy od zera): osoba nie ma jeszcze produktu — szuka niszy, w którą warto wejść. Twoim zadaniem jest WSKAZAĆ konkretny produkt/niszę z realnym popytem i sensowną marżą, którą da się rozkręcić przez Meta/TikTok ads + COD. Research ma znaleźć GORĄCY, konkretny produkt-zwycięzcę (nie ogólnik „kosmetyki" — lecz konkretny SKU/kategoria z dowodem popytu).`
    case 'k2':
      return `KIERUNEK K2 (audyt istniejącego produktu): osoba MA już produkt (własny/dostawcy) i pyta, czy się sprzeda. Oceń TEN produkt na meritach — popyt, realna marża przy jego cenie/koszcie, nasycenie rynku, czy da się go sprzedać przez ads+COD. „kierunek" = najostrzejszy kąt/pozycjonowanie tego konkretnego produktu (komu, jak, którym hakiem), a gdy słaby — najbliższy mocniejszy wariant produktu/niszy obok.`
    case 'k3':
      return `KIERUNEK K3 (walidacja własnego pomysłu): osoba ma POMYSŁ na produkt, ale jeszcze go nie sprzedaje. Zweryfikuj, czy pomysł ma realny popyt i marżę, i wyostrz go do wersji z największą szansą; gdy słaby — wskaż mocniejszy produkt/niszę blisko jej pomysłu.`
    default:
      return ''
  }
}

function buildPrompt(p: Record<string, unknown>): string {
  const s = (v: unknown, max = 400) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ') : ''
  const track = (typeof p.track === 'string' ? p.track : '').trim()

  const fakty: string[] = []
  // Produkt/nisza może przyjść z różnych pól zależnie od kierunku (niche, product_input, preview_brief, opis).
  const nazwa = s(p.nazwa, 80) || s(p.produkt, 80) || s(p.nisza, 80)
  fakty.push(`Produkt / pomysł na sklep: „${nazwa || 'bez nazwy'}" — ${s(p.opis) || s(p.produkt)}`)
  if (p.nisza) fakty.push(`Nisza / kategoria: ${s(p.nisza)}`)
  if (p.problem || p.problem_hint) fakty.push(`Potrzeba / problem, który produkt zaspokaja: ${s(p.problem) || s(p.problem_hint)}`)
  if (p.dla_kogo) fakty.push(`Dla kogo / grupa docelowa: ${s(p.dla_kogo)}`)
  if (p.cena_detaliczna) fakty.push(`Planowana cena detaliczna: ${s(p.cena_detaliczna, 80)}`)
  if (p.koszt_zakupu) fakty.push(`Koszt zakupu / COGS (jeśli znany): ${s(p.koszt_zakupu, 80)}`)
  if (p.kanal || p.kanal_sprzedazy) fakty.push(`Planowany / obecny kanał sprzedaży: ${s(p.kanal) || s(p.kanal_sprzedazy)}`)
  if (p.url) fakty.push(`Link do produktu/oferty (jeśli istnieje): ${s(p.url, 200)}`)
  if (list(p.zdjecia)) fakty.push(`Materiały produktowe wskazane przez klienta: ${list(p.zdjecia)}`)
  if (p.konkurencja) fakty.push(`Konkurencja wskazana w rozmowie: ${s(p.konkurencja)}`)
  if (track) fakty.push(`Kierunek rozmowy: ${track.toUpperCase()}`)

  const accent = trackAccent(track)

  return `Jesteś KONSTRUKTYWNYM analitykiem-doradcą e-commerce o nastawieniu „da się". Masz DWA zadania, równie ważne: (1) ocenić, czy z TEGO produktu fizycznego da się zbudować opłacalny sklep internetowy w polskim e-commerce — taki, w którym ludzie REALNIE kupują, zostaje sensowna marża jednostkowa, a klientów da się dowieźć płatnym ruchem (Meta/TikTok ads) z płatnością za pobraniem (COD); (2) gdy w tej formie jeszcze się nie da — WSKAZAĆ konkretny kierunek (mocniejszy produkt/nisza/kąt), w którym się da, i poprowadzić tam. Cel to dochodowy sklep niszowy (już kilkanaście–kilkadziesiąt zamówień dziennie = sukces), NIE marketplace ani marka-jednorożec. NIE jesteś krytykiem szukającym dziur — jesteś doradcą, który ma doprowadzić pomysł do wersji z potencjałem. Domyślnie zakładasz, że SIĘ DA, i szukasz drogi, żeby się dało.

O sukcesie sklepu decyduje WIELE rzeczy, NIE sama unikalność: realny popyt (ludzie tego szukają i kupują), sensowna marża jednostkowa (cena detaliczna minus koszt zakupu zostawia z czego żyć i finansować reklamy), dosięgalność płatnym ruchem (produkt „klika się" na feedzie, da się go pokazać w 15-sekundowym wideo, COD zdejmuje ryzyko klientowi) oraz wykonanie. Produkt NIE musi być unikalny, „nie do podrobienia" ani pierwszy na rynku. Budowę sklepu, kreacje i rozkręcenie sprzedaży bierze na siebie zespół Tomka (model risk-sharing AWE) — więc NIE oceniaj, czy autor „sam to ogarnie" ani czy ma doświadczenie. Liczy się, czy istnieje realny, kupujący popyt i da się go dowieźć rentownie. Istnienie innych sklepów z podobnym produktem to NORMALNY sygnał popytu, nie powód do odrzucenia. Zrób realny research (web search; po polsku i angielsku) — po to, by URZECZYWISTNIĆ i wyostrzyć ofertę oraz znaleźć najlepszy kąt, NIE żeby ją storpedować. Wyszukuj OSZCZĘDNIE i tylko CELOWANE zapytania (najbliżsi sprzedawcy/marki + ich realne ceny detaliczne na Allegro/Amazon/IG, rozmiar/sezonowość niszy) — lepiej kilka trafnych zapytań niż kilkanaście; nie mnóż zapytań ponad realną potrzebę. Priorytet: realne polskie nazwy sklepów/marek i ceny w PLN ze źródeł. Ceny zagraniczne podawaj też orientacyjnie przeliczone na zł (np. „$19.99 ≈ 80 zł"), nie zostawiaj w komunikacji samych dolarów.

PRODUKT:
${fakty.join('\n')}
${accent ? `\n${accent}\n` : ''}
OCEŃ HOLISTYCZNIE — NIE kotwicz w żadnej docelowej liczbie zamówień, obrocie ani procencie, oceń na meritach:
1. POPYT — czy ludzie tego SZUKAJĄ i KUPUJĄ? Wolumen, trend (rośnie/spada/stabilny), czy to żywa kategoria. Excel/zeszyt nie dotyczy — tu liczy się dowód transakcji: liczba ofert/sprzedaży na Allegro, popularność na TikToku/IG, sezon. Brak jakiegokolwiek śladu kupowania = realny sygnał ostrzegawczy.
2. MARŻA — cena detaliczna vs koszt zakupu/COGS. Czy po odjęciu kosztu towaru i opłat zostaje marża, z której da się sfinansować reklamy i wciąż zarobić? Produkty z marżą jednostkową poniżej ~2,5–3× kosztu zakupu są ryzykowne pod płatny ruch — odnotuj to. Gdy klient nie podał liczb, oszacuj na podstawie typowych cen rynkowych ze źródeł i powiedz wprost, że to szacunek.
3. KONKURENCJA — znajdź 2-4 najbliższe sklepy/marki sprzedające ten lub bardzo podobny produkt (nazwy, realne ceny detaliczne ze źródeł; najpierw polskie: Allegro, sklepy, IG; potem Amazon/zagranica). Istnienie konkurentów to NORMA i sygnał popytu, NIE powód do odrzucenia. Zanim uznasz niszę za „nasyconą", AKTYWNIE poszukaj kąta obok (węższa grupa odbiorców, lepszy zestaw/bundle, mocniejszy hak wideo, polski/lokalny kontekst, lepsza obietnica). Realna przeszkoda istnieje TYLKO wtedy, gdy rynek to DOSŁOWNY klon tego samego, taniego produktu sprzedawanego przez wielu, bez ŻADNEGO sensownego kąta (np. wprost „te same generyczne etui z AliExpress, których pełno za 15 zł"). Sprzedawcy CZĘŚCIOWI/sąsiedni NIGDY nie dyskwalifikują — zostawiają kąt.
4. DOSIĘGALNOŚĆ — czy ten produkt da się REALNIE sprzedać przez płatny ruch? Czy „klika się" wizualnie, da się go pokazać/zademonstrować w krótkim wideo, czy COD ma sens przy tej cenie (zbyt drogi produkt słabo idzie za pobraniem). Kanał (Meta/TikTok ads + COD) musi realnie istnieć dla tej kategorii.
5. SEZONOWOŚĆ — ryzyko wahań w roku (produkt całoroczny vs gwałtowny pik świąteczny/letni vs jednorazowa moda, która zgaśnie). Z researchu, jeśli są dane (np. trend Google/TikTok).

KIERUNEK — pole „kierunek" wypełniasz ZAWSZE, przy KAŻDEJ ocenie. To CEL całego badania i Twój najważniejszy produkt: nie ocena dla oceny, lecz użycie researchu (zwłaszcza LUKI) do wyrzeźbienia wersji oferty z NAJWIĘKSZĄ realną szansą na rynku — maksymalizuj szanse, weź najmocniejszy kąt z danych i tak ustaw produkt/pozycjonowanie, żeby mógł realnie wygrać. Gdy masz już taki kąt, podaj go z przekonaniem, jak realną szansę (rozsądny optymizm jest OK), a nie jako „może się uda". Zawsze KONKRETNIE — nie ogólnik („zawęź niszę"), nie lista opcji; jedna pewna rekomendacja, w którą prowadzisz dalej, brzmiąca tak, że user pomyśli „o, to ma sens":
- gdy „mocny": podaj NAJOSTRZEJSZY kąt/pozycjonowanie produktu — komu konkretnie, którym hakiem, jako jaki zestaw/obietnicę go ustawić, żeby miał największy potencjał pod płatny ruch (np. „nie generyczna mata do jogi, tylko zestaw startowy dla początkujących 40+ z wideo-instruktażem i COD — ten kąt na feedzie wygrywa").
- gdy „do_poprawy" / „slaby": podaj mocniejszy produkt/niszę BLISKO tego, co przyniósł klient (ta sama kategoria, sąsiednia grupa, lepszy wariant) — nazwij OSTRZEJSZY produkt i OSTRZEJSZĄ grupę, w które realnie wierzysz. To pivot na wersję z realnymi szansami, nie odrzucenie.

Bądź uczciwy, ale nie czepialski: jeśli czegoś naprawdę brakuje (brak popytu, marża nie do udźwignięcia, dosłowny klon nasyconego rynku), powiedz wprost i OD RAZU wskaż drogę naprzód. ŻADNYCH liczb z głowy — tylko z researchu; gdy nie znalazłeś, napisz „brak danych". Każdą liczbę/cenę cytuj DOKŁADNIE jak w źródle (z walutą i oryginalnym zakresem); NIE podawaj dwóch różnych wartości dla tej samej wielkości w jednej ocenie. W KOMUNIKACJI wolisz orientacyjne PRZEDZIAŁY od fałszywej precyzji: pojedynczą dokładną liczbę podawaj tylko, gdy masz ją pewną ze źródła; gdy pewności brak — powiedz ogólnie („kilkadziesiąt ofert na Allegro", „cena rynkowa ok. 60–90 zł", „niewielka, ale realna nisza") BEZ zmyślonej konkretnej liczby.

Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez tekstu przed/po):
{
  "oplacalne": true,
  "ocena": "mocny",
  "popyt": "1-2 zdania — czy ludzie tego szukają i kupują; wolumen/trend/żywotność kategorii z researchu",
  "marza": "1-2 zdania — cena detaliczna vs koszt zakupu/COGS; czy zostaje sensowna marża jednostkowa (oznacz, jeśli szacunek)",
  "konkurencja": "1-2 zdania — czy nisza nasycona; nazwy sklepów/marek i realne ceny detaliczne ze źródeł",
  "dosiegalnosc": "1 zdanie — czy da się sprzedać przez Meta/TikTok ads + COD; czy kanał realnie istnieje dla tej kategorii",
  "sezonowosc": "1 zdanie — ryzyko wahań w roku (całoroczny vs pik vs moda); z danych jeśli są",
  "kierunek": "ZAWSZE wypełnione — w którą stronę poprowadzić ofertę: gdy mocny = najostrzejszy kąt/pozycjonowanie produktu do budowy; gdy do_poprawy/slaby = konkretny mocniejszy pivot na produkt/niszę blisko tego, co przyniósł klient",
  "powody": ["2-4 krótkie, konkretne powody oceny — wyprowadzone z danych"],
  "zrodla": [ { "tytul": "nazwa źródła", "url": "https://..." } ]
}

KALIBRACJA OCENY (jesteś KONSTRUKTYWNYM doradcą o nastawieniu „da się", ale oceniasz UCZCIWIE i na meritach — werdykt ma COŚ ZNACZYĆ, więc NIE każdy produkt jest od razu „mocny"; wynik wyprowadzasz z DOWODÓW z rozmowy i researchu, nie z uprzejmości):
- "mocny" (oplacalne=true): realnie WIDAĆ trzy fundamenty naraz — (a) realny, żywy popyt (ludzie tego szukają i kupują), (b) sensowna marża jednostkowa (cena detaliczna z zapasem nad kosztem zakupu, do udźwignięcia kosztu reklam), (c) realny kanał dotarcia płatnym ruchem + COD — ORAZ produkt nie jest DOSŁOWNYM klonem taniego, masowego towaru bez żadnego kąta. Kąt NIE musi być unikalny, ale musi być KONKRETNY.
- "do_poprawy" (oplacalne=false): NORMALNY, częsty wynik (NIE porażka) — gdy któregoś fundamentu jeszcze nie widać (mglisty popyt; marża zbyt cienka pod płatny ruch przy podanej cenie; produkt trudny do pokazania na feedzie lub zbyt drogi pod COD), ALBO produkt wchodzi czołowo w nasycony, dosłowny klon i NIE widać kąta obok. W polu „kierunek" domknij brakujący fundament albo wskaż mocniejszy produkt/kąt OBOK. Używaj go ŚMIAŁO, gdy materiał jest słaby — lepszy uczciwy pivot niż pochopne „mocny".
- "slaby" (oplacalne=false): naprawdę brak fundamentu (nikt tego nie kupuje albo marża po prostu nie istnieje / produkt nie nadaje się pod płatny ruch) i nawet wąski kąt nie ratuje TEJ formy → w „kierunek" wskaż INNY realny produkt/niszę blisko świata klienta (nigdy „to się nie da", zawsze „spróbujmy stąd").
ZŁOTE ZASADY: (1) oceniaj na DOWODACH, nie z uprzejmości — gdy fundamentu nie widać, „do_poprawy" jest właściwą, POMOCNĄ odpowiedzią (nie naciągaj na „mocny"). (2) Brak unikalności ani istnienie konkurencji NIGDY same w sobie nie obniżają oceny — to sygnały popytu; obniża dopiero brak realnego popytu/marży albo dosłowny klon nasyconego rynku bez kąta. (3) Pole „kierunek" jest ZAWSZE wypełnione — także przy „mocny" (wtedy = najostrzejszy kąt/pozycjonowanie). Bramka NIGDY nie zostawia użytkownika bez wskazania, w którą stronę iść.
"ocena" ∈ {"mocny","do_poprawy","slaby"}; "oplacalne" = true wyłącznie dla "mocny".`
}

const OCENY = ['mocny', 'do_poprawy', 'slaby']
// deno-lint-ignore no-explicit-any
function saneOcena(o: any): boolean {
  return !!o && typeof o === 'object'
    && typeof o.oplacalne === 'boolean'
    && typeof o.ocena === 'string' && OCENY.includes(o.ocena)
    && typeof o.popyt === 'string'
    && typeof o.marza === 'string'
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

// Log kosztu bramki do bud_usage (używane przez ścieżkę streamingu).
async function logAssessCost(sessionId: string, model: string, u: Record<string, unknown> | null, searchCalls: number): Promise<void> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const input = (u?.input_tokens as number) || 0
    const cached = ((u?.input_tokens_details as Record<string, unknown>)?.cached_tokens as number) || 0
    const out = (u?.output_tokens as number) || 0
    const prices: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
    const p = prices[model] || prices['gpt-5.5']
    await supabase.from('bud_usage').insert({
      session_id: sessionId, kind: 'assess', model,
      input_tokens: input, cached_tokens: cached, output_tokens: out,
      cost_usd: (Math.max(0, input - cached) * p.i + cached * p.c + out * p.o) / 1_000_000 + searchCalls * WEB_SEARCH_CALL_USD,
      meta: { web_search_calls: searchCalls, streamed: true },
    })
  } catch (e) { console.error('[bud-assess] logAssessCost error:', e) }
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)
  // Endpoint WEWNĘTRZNY — jedynym wywołującym jest bud-chat (server-to-server, runGate)
  // z kluczem service-role. Front go NIE woła. Bez tej bramki publiczny endpoint
  // (--no-verify-jwt) pozwalał dowolnemu, kto zna URL, palić tokeny OpenAI bezpośrednim
  // curlem (~$0.28 + web_search za ocenę, bez sesji ani limitu). Wymóg klucza service-role
  // zamyka to w 100%, a bud-chat zawsze go ma — realny ruch nietknięty.
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
    if (!projekt || typeof projekt !== 'object' || (!projekt.opis && !projekt.problem && !projekt.nazwa && !projekt.produkt && !projekt.nisza)) {
      return jsonResponse({ error: 'brak_pomyslu' }, 400, cors)
    }

    // ── Tryb STREAMING (opt-in: body.stream) — postęp na żywo dla frontu ───────
    // Buforowany tryb (poniżej) zostaje DOMYŚLNY i nietknięty. runGate w bud-chat
    // używa streamu dla realnego postępu, z fallbackiem na buforowany.
    if (body.stream === true) {
      const sessionIdS = (body.sessionId || '').trim()
      const upstream = await openaiFetchRetry('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        // max_tool_calls: dokumentowany lever na liczbę wyszukań (bywa ignorowany
        // przez model — patrz audyt 2026-06-14, realnie 6-8 zamiast 2-3 — ale to
        // jedyny twardy sufit, więc ustawiamy; prompt już nie obiecuje konkretnej liczby).
        body: JSON.stringify({ model: OPENAI_MODEL, tools: [{ type: 'web_search' }], max_tool_calls: 4, input: buildPrompt(projekt), max_output_tokens: MAX_OUTPUT_TOKENS, stream: true }),
      })
      if (!upstream.ok || !upstream.body) {
        const errText = await upstream.text().catch(() => '')
        console.error('[bud-assess] openai stream error:', upstream.status, errText.slice(0, 300))
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
                          label = 'Liczę marżę i dane o rynku…'
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
            else { console.error('[bud-assess] stream: ocena nie przeszła sanity-check:', text.slice(0, 200)); send('error', { error: 'blad_oceny' }) }
          } catch (e) {
            console.error('[bud-assess] stream loop error:', e)
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
        max_tool_calls: 4,
        input: buildPrompt(projekt),
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[bud-assess] openai error:', res.status, errText.slice(0, 500))
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

    // Koszt → bud_usage (tylko gdy mamy sessionId i konfigurację bazy)
    const sessionId = (body.sessionId || '').trim()
    if (sessionId) {
      try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (SUPABASE_URL && SERVICE_KEY) {
          const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
          const u = data?.usage || {}
          const input = u.input_tokens || 0, cached = u.input_tokens_details?.cached_tokens || 0, out = u.output_tokens || 0
          const prices: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
          const p = prices[OPENAI_MODEL] || prices['gpt-5.5']
          await supabase.from('bud_usage').insert({
            session_id: sessionId, kind: 'assess', model: OPENAI_MODEL,
            input_tokens: input, cached_tokens: cached, output_tokens: out,
            cost_usd: (Math.max(0, input - cached) * p.i + cached * p.c + out * p.o) / 1_000_000 + searchCalls * WEB_SEARCH_CALL_USD,
            meta: { web_search_calls: searchCalls },
          })
        }
      } catch (uErr) { console.error('[bud-assess] usage insert error:', uErr) }
    }

    const ocena = extractJson(text)
    // Kompatybilność: gdyby model zwrócił stare pole "pivot" zamiast "kierunek" — znormalizuj.
    if (ocena && typeof ocena === 'object' && !(ocena as Record<string, unknown>).kierunek && typeof (ocena as Record<string, unknown>).pivot === 'string') {
      (ocena as Record<string, unknown>).kierunek = (ocena as Record<string, unknown>).pivot
    }
    if (!ocena || !saneOcena(ocena)) {
      console.error('[bud-assess] ocena nie przeszła sanity-check:', String(text).slice(0, 300))
      return jsonResponse({ error: 'blad_oceny' }, 502, cors)
    }
    return jsonResponse({ ocena, searches: searchCalls }, 200, cors)
  } catch (e) {
    console.error('[bud-assess] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
