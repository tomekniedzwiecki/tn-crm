// spar-landing — generacja DZIAŁAJĄCEGO landinga HTML dla projektu z lejka
// "Aplikacja" (tomekniedzwiecki.pl/aplikacja). Następny poziom po statycznych
// podglądach spar-image: gpt-5.5 pisze kompletny, samowystarczalny plik HTML
// (copy direct-response + design z brief.design + cennik z business_plan),
// zapisywany w publicznym Storage → link live do oglądania i udostępniania.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-landing --no-verify-jwt
//
// DOSTĘP (od 2026-06-12 wieczór, integracja z frontendem sparingu):
//   - sesyjny: sesja musi mieć preview_brief ORAZ zielony werdykt (landing
//     to element pakietu po domkniętej rozmowie); limity: 3/sesja (z
//     spar_usage kind='landing') + 5/dobę/IP — endpoint publiczny, każde
//     wywołanie pali ~$0.45 na gpt-5.5
//   - admin: nagłówek x-admin-secret == SPAR_CRON_SECRET omija werdykt
//     i limit IP (rerolle z panelu / testy)
//
// Flow: POST {sessionId} → 202 {status:'started', url} natychmiast; generacja
// (1-4 min) leci w tle przez EdgeRuntime.waitUntil — bramka Supabase ucina
// bezczynne odpowiedzi po ~150 s, a klient i tak nie powinien wisieć. Gotowość
// sprawdzasz: HEAD na zwrócony url (200 = plik jest) albo wpis w spar_usage
// (kind='landing', meta.url).
//
// OGLĄDANIE: ⚠️ cała domena *.supabase.co neutralizuje HTML (anty-phishing):
// Storage public URL ORAZ odpowiedzi edge functions dostają wymuszone
// Content-Type: text/plain + CSP "default-src 'none'; sandbox" — przeglądarka
// pokazuje surowy kod (sprawdzone empirycznie 2026-06-12, GET handler tutaj
// nie pomógł i został usunięty). Landing renderuje strona-wrapper na NASZEJ
// domenie: https://tomekniedzwiecki.pl/aplikacja/podglad/?sid=<uuid>&t=<ts>
// (fetch ze Storage — CORS '*' — i render w sandboxowanym iframe srcdoc).
//
// Koszty: spar_usage kind='landing' (tokeny + cost_usd wg cennika modelu) —
// panel TN Aplikacje liczy z tego PLN jak dla chat/plan/image.
//
// Sekrety:
//   OPENAI_API_KEY      — klucz OpenAI (już ustawiony)
//   SPAR_LANDING_MODEL  — opcjonalny override modelu (default gpt-5.5;
//                         decyzja Tomka 2026-06-12: jakość > koszt)
//   SPAR_CRON_SECRET    — sekret admina (współdzielony ze spar-followups)

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'https://crm.tomekniedzwiecki.pl',
  'https://tn-crm.vercel.app',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const LANDING_MODEL = Deno.env.get('SPAR_LANDING_MODEL') || 'gpt-5.5'
// HTML landinga to 15-25k tokenów + reasoning; 3000 ze spar-chat by ucięło plik
const MAX_COMPLETION_TOKENS = 40000
const MAX_LANDINGS_PER_SESSION = 3
const MAX_LANDINGS_PER_IP_PER_DAY = parseInt(Deno.env.get('SPAR_LANDING_IP_DAILY') || '5', 10)
const STORAGE_BUCKET = 'attachments'

// Cennik USD per 1M tokenów (jak w spar-chat) — do logu kosztów w spar_usage
const PRICING: Record<string, { input: number; cached: number; output: number }> = {
  'gpt-5.5': { input: 5.0, cached: 0.5, output: 30.0 },
  'gpt-5.1': { input: 1.25, cached: 0.125, output: 10.0 },
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ── Prompt ──────────────────────────────────────────────────────────────────
// Esencja wytycznych z docs/landing/ (copy.md: hero headline + anty-AI-poetic;
// 04-design.md: dokładnie 3 wow momenty hero/mid/conversion) przeniesiona do
// kontekstu "landing SaaS-u, który jeszcze nie istnieje" — bez reguł
// e-commerce (COD/wysyłka/testimoniale nie dotyczą podglądu koncepcyjnego).
const SYSTEM_PROMPT = `Jesteś zespołem w jednej osobie: senior front-end designer (poziom top shotów Dribbble, ale produkcyjny kod) + polski copywriter direct response z 15-letnim doświadczeniem. Piszesz JEDEN kompletny plik HTML — landing page narzędzia SaaS, które JESZCZE NIE ISTNIEJE. To podgląd koncepcyjny dla osoby, która wymyśliła to narzędzie: ma zobaczyć swoją wizję jako gotową, profesjonalną stronę sprzedażową i pomyśleć "to wygląda jak prawdziwy produkt".

FORMAT ODPOWIEDZI (bezwzględne):
- Zwróć WYŁĄCZNIE czysty HTML: od <!DOCTYPE html> do </html>. Zero markdownu, zero \`\`\`, zero komentarza przed ani po.
- Jeden samowystarczalny plik: cały CSS w <style>, cały JS w <script> na końcu <body>. ŻADNYCH zewnętrznych bibliotek, frameworków, obrazków (<img> z URL-ami = zakaz). Jedyny dozwolony zasób zewnętrzny: Google Fonts.
- Fonty: wybierz 1-2 z PEŁNĄ obsługą polskich znaków (np. Inter, Sora, Manrope, Outfit, Space Grotesk, Fraunces, Instrument Serif). Dobierz charakter fontu do charakteru produktu.
- Wszystkie wizualizacje produktu (mockup telefonu, okno aplikacji, dymki czatu, wykresy) budujesz czystym HTML/CSS — wypełnione realistycznymi POLSKIMI danymi wynikającymi z briefu (prawdziwie brzmiące imiona, daty, kwoty w zł). Zero lorem ipsum, zero angielskich placeholderów.

JĘZYK I COPY (najważniejsza część — to odróżnia profesjonalny landing od ładnego szablonu):
- Bezbłędna polszczyzna z pełnymi znakami diakrytycznymi.
- NAGŁÓWEK HERO: trafia w konkretny ból grupy docelowej + obiecuje rozwiązanie, maks 10 słów, działa nawet bez nazwy marki. Subheadline dodaje mechanizm działania (jak to robi) w 1-2 zdaniach.
- ANTY-AI-POETIC — pięć grzechów, których NIE WOLNO popełnić:
  1. Personifikacja przedmiotów ("aplikacja, która rozumie Twoje poranki") — przedmioty robią rzeczy fizyczne, nie ludzkie.
  2. "Oddaje/zwraca/przywraca Ci [wieczór/spokój/kontrolę]" — zamiast metafory wymiany podaj konkret: liczbę godzin, czynność, moment.
  3. Imperatyw "wracaj do X / odkupuj X" — brzmi jak coach motywacyjny.
  4. Pisanie co użytkownik ma POCZUĆ zamiast co produkt ROBI — zawsze akcja + liczba.
  5. Puste frazy: "innowacyjna technologia", "najlepszy na rynku", "wysoka jakość w przystępnej cenie".
- Nagłówki sekcji: konkretne, mówią co user zyskuje albo co produkt robi. Body text krótki, ścinany do esencji.
- ZAKAZ sekcji z opiniami klientów / liczbą użytkowników / logo firm — produkt nie istnieje, zmyślony social proof podważa wiarygodność całego podglądu. Zamiast tego: scenariusz użycia, liczby z mechaniki produktu, sekcja "dla kogo".

STRUKTURA (8-10 sekcji, kolejność dobierz pod projekt):
sticky nav (logo tekstowe + 2-3 kotwice + CTA) → hero z mockupem produktu w akcji → pasek 3 konkretnych liczb → problem (z perspektywy grupy docelowej, ich językiem) → jak działa (3 kroki) → pokaz głównej funkcji Z INTERAKCJĄ (patrz niżej) → co dostajesz (funkcje z briefu) → cennik (DOKŁADNIE liczby z briefu — karta główna + kontekst) → FAQ 4-5 pytań, które naprawdę zadałaby grupa docelowa → finalne CTA → stopka.

3 WOW MOMENTY (dokładnie trzy, po jednym na strefę; element, który pomysłodawca opisze znajomym "ten z..."):
- HERO: np. mockup z animowanym scenariuszem użycia (elementy wjeżdżają sekwencyjnie jak żywa aplikacja), oversized stat 120px+ z narracją, split-screen 60/40 z edge-to-edge mockupem.
- MID: np. interaktywny pokaz funkcji (taby/przełącznik/suwak zmieniający zawartość mockupu), porównanie "dziś vs z narzędziem" jako wertykalna oś czasu, pull-quote full-bleed z bólem klienta.
- CONVERSION: np. animowany gradient-beam wokół karty cennika, FAQ jako rozmowa z personą, finalne CTA z gigantycznym numerem/statem w tle.
NIE liczą się jako wow: fade-iny, countery, accordion, sticky CTA, bento grid — to baseline, który i tak masz zrobić porządnie.

INTERAKTYWNOŚĆ (vanilla JS, krótki i niezawodny):
- Reveal-on-scroll przez IntersectionObserver (subtelny, 0.6s).
- MINIMUM jedna realna interakcja pokazująca produkt: np. klikalne taby szablonów/funkcji zmieniające zawartość mockupu, przełącznik scenariuszy, symulacja "dnia z narzędziem".
- Smooth scroll do kotwic. Wszystko działa bez konsoli błędów.

DESIGN:
- Jeśli brief zawiera obiekt "design" (hexy tła/akcentów, geometria, typografia, podpis) — odwzoruj go DOKŁADNIE, to design system tego projektu spójny z resztą podglądów. Pole "styl" (życzenia klienta) ma najwyższy priorytet.
- Jakość: czysta siatka, świadoma hierarchia typograficzna (clamp), dużo światła, cienie miękkie i oszczędne, spójne zaokrąglenia. Strona ma wyglądać jak produkt zaprojektowany przez studio, nie jak szablon.
- Pełna responsywność: na 375px wszystko czytelne, grid łamie się sensownie, mockup nie wystaje poza viewport.

KONTEKST PODGLĄDU:
- Wszystkie CTA prowadzą do "#" (strona koncepcyjna).
- W stopce dyskretny dopisek: "Podgląd koncepcyjny — projekt powstał w tomekniedzwiecki.pl/aplikacja" (link do https://tomekniedzwiecki.pl/aplikacja/).

WZORZEC POZIOMU WYKONANIA (przykład GĘSTOŚCI DETALU mockupu w hero — NIE kopiuj układu, palety ani treści; to pokazuje oczekiwany poziom dopracowania: realne dane, sekwencyjna animacja, pływający element):
<div class="phone"><div class="screen">
  <div class="app-top"><span class="app-logo">⚡ Nazwa</span><span class="app-time">dziś, 7:30</span></div>
  <div class="app-stats"><div class="stat"><b>5</b><span>do kontaktu dziś</span></div><div class="stat"><b>2</b><span>ryzyko rezygnacji</span></div><div class="stat"><b>3</b><span>odpowiedzi czekają</span></div></div>
  <div class="app-list">
    <div class="row" style="animation-delay:.3s"><span class="ava">KN</span><span class="row-info"><b>Kasia Nowak</b><span>Po treningu — feedback · 2 dni</span></span><button class="row-cta">Napisz</button></div>
    <div class="row" style="animation-delay:.55s"><span class="ava">MW</span><span class="row-info"><b>Michał Wiśniewski</b><span>Brak obecności — 7 dni</span></span><button class="row-cta">Napisz</button></div>
  </div>
</div></div>
<div class="float-msg" style="animation-delay:1.4s"><span class="fm-top">● gotowa wiadomość</span>Cześć Kasia! Jak samopoczucie po wczorajszym treningu? 💪</div>
/* .row { opacity:0; transform:translateY(14px); animation: rise .5s ease forwards; } — elementy wjeżdżają sekwencyjnie jak żywa aplikacja */`

// ── Pakiet jakości v2 (2026-06-12): rotacja wariantów + walidacja + krytyk ──
//
// (2) RÓŻNORODNOŚĆ: bez menu wariantów wszystkie landingi zbiegają do jednego
// układu (lekcja z grafik — „granatowy SaaS"). Losujemy per generacja 3 hero
// do wyboru (adaptacja banku docs/landing/reference/section-variants.md pod
// SaaS) — model wybiera świadomie pod charakter produktu.
const HERO_VARIANTS: { id: string; opis: string }[] = [
  { id: 'split', opis: 'Split 60/40: lewa kolumna headline+lead+CTA, prawa mockup produktu zbudowany w CSS (telefon albo okno aplikacji) z animowanym scenariuszem użycia i 1-2 pływającymi elementami (dymek powiadomienia, mini-karta).' },
  { id: 'oversized-stat', opis: 'Oversized stat: gigantyczna liczba-korzyść (120px+, np. „3 min dziennie") jako kotwica hero, headline i opis obok, mockup produktu mniejszy poniżej linii zgięcia.' },
  { id: 'type-led', opis: 'Type-led: typografia wypełnia hero — headline na 2-3 linie wielkim drukiem (clamp do 96px+), jedno słowo wyróżnione (marker/kolor/italic), mockup wjeżdża dopiero w drugiej sekcji; pasek zaufania tuż pod headline.' },
  { id: 'dashboard-first', opis: 'Product-first: duży mockup narzędzia (okno przeglądarki albo telefon, edge-to-edge u dołu hero) jako bohater, nad nim krótki headline i CTA wycentrowane; mockup częściowo ścięty linią zgięcia — zachęta do scrolla.' },
  { id: 'before-after', opis: 'Before/After split: hero podzielone na „dziś" (chaos — notatki, karteczki, zapomniane wiadomości, przygaszone) i „z narzędziem" (uporządkowany ekran produktu, żywe kolory); headline spina oba światy.' },
  { id: 'conversation', opis: 'Conversation-led: hero zbudowane wokół odtworzonej wymiany wiadomości (dymki czatu pojawiające się sekwencyjnie), pokazującej moment, w którym narzędzie rozwiązuje problem; headline nad albo obok rozmowy.' },
]

function shuffledPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function variantsBlock(): string {
  const heros = shuffledPick(HERO_VARIANTS, 3)
  return `WARIANTY HERO DO WYBORU (wybierz JEDEN, najlepiej pasujący do charakteru tego produktu i jego grupy docelowej — nie wybieraj odruchowo pierwszego):\n` +
    heros.map((h, i) => `${i + 1}. [${h.id}] ${h.opis}`).join('\n')
}

// (3) TWARDE WALIDACJE — automatyczne grep-checki; znalezione problemy
// wchodzą jako obowiązkowe poprawki do przebiegu krytyka.
function validateHtml(
  html: string,
  brief: Record<string, unknown>,
  plan: Record<string, unknown> | null,
): string[] {
  const issues: string[] = []
  const diacritics = (html.match(/[ąćęłńóśźż]/gi) || []).length
  if (diacritics < 20) issues.push(`Podejrzanie mało polskich znaków diakrytycznych (${diacritics}) — tekst wygląda na pisany bez ą/ę/ł itd.; popraw całą polszczyznę.`)
  if (/lorem ipsum/i.test(html)) issues.push('W treści jest „lorem ipsum" — zastąp realistyczną polską treścią.')
  if (/<img[^>]+src=["']https?:/i.test(html)) issues.push('Strona ładuje zewnętrzne obrazki <img> — usuń, wszystkie wizualizacje mają być zbudowane w HTML/CSS.')
  if (/<script[^>]+src=/i.test(html)) issues.push('Strona ładuje zewnętrzny skrypt — cały JS ma być inline.')
  if (/<link[^>]+href=["']https?:\/\/(?!fonts\.googleapis\.com|fonts\.gstatic\.com)/i.test(html)) {
    issues.push('Strona linkuje zewnętrzny zasób inny niż Google Fonts — usuń.')
  }
  if (!/name=["']viewport["']/i.test(html)) issues.push('Brak meta viewport — strona nie będzie responsywna na telefonie.')
  if (/```/.test(html)) issues.push('W pliku zostały płotki markdown ``` — usuń.')
  if (/\b(TODO|PLACEHOLDER|Get started|Sign up|Learn more|Buy now)\b/i.test(html)) {
    issues.push('W treści są angielskie frazy albo placeholdery (TODO/Get started/Sign up…) — przepisz na polski.')
  }
  const nazwa = typeof brief.nazwa === 'string' ? brief.nazwa.trim() : ''
  if (nazwa && !html.includes(nazwa)) issues.push(`Nazwa narzędzia „${nazwa}" nie pojawia się w treści strony.`)
  const cena = plan && typeof plan.cena === 'number' ? plan.cena : null
  if (cena && !html.includes(String(cena))) {
    issues.push(`Cennik nie zawiera ceny ${cena} zł z planu przychodu — sekcja cennika MUSI używać liczb z planu.`)
  }
  return issues
}

// (1) KRYTYK — drugi przebieg: art director + senior copywriter dostaje
// wygenerowaną stronę i zwraca PODNIESIONĄ wersję (pełny plik). Wersja 1 jest
// już opublikowana — krytyk podmienia plik pod tym samym adresem.
const CRITIC_SYSTEM = `Jesteś bezlitosnym art directorem i polskim senior copywriterem direct response. Dostajesz JEDEN plik HTML — landing page narzędzia SaaS (podgląd koncepcyjny dla pomysłodawcy) — oraz brief projektu. Twoje zadanie: PODNIEŚĆ jakość tej strony i zwrócić POPRAWIONY, KOMPLETNY plik.

AUDYT (sprawdź każdy punkt, popraw wszystko, co odstaje):
1. WOW MOMENTY: strona ma mieć DOKŁADNIE trzy — po jednym w hero / środku / strefie konwersji. Każdy to konkretny, nazywalny element HTML/CSS (animowany scenariusz w mockupie, oversized stat, interaktywny pokaz funkcji, oś czasu „dziś vs z narzędziem", animowany gradient wokół cennika, FAQ jako rozmowa). Fade-iny, countery i accordion się NIE liczą. Brakuje — dodaj; jest słaby — wymień.
2. HERO HEADLINE: maks 10 słów, trafia w ból grupy docelowej, działa bez nazwy marki. Subheadline z mechanizmem działania.
3. COPY: wytnij 5 grzechów AI (personifikacja przedmiotów; „oddaje/zwraca Ci [abstrakt]"; imperatyw „wracaj do X"; pisanie co user ma POCZUĆ zamiast co produkt ROBI; puste frazy typu „innowacyjna technologia"). Wszędzie konkret: akcja + liczba. Bezbłędna polszczyzna z diakrytykami.
4. HIERARCHIA I RYTM: świadoma skala typograficzna (clamp), wyraźny kontrast rozmiarów nagłówek/tekst, spójny rytm odstępów między sekcjami, cienie i zaokrąglenia z jednej rodziny. Strona ma wyglądać jak projekt studia, nie szablon.
5. SPÓJNOŚĆ Z BRIEFEM: paleta i charakter z pola design/styl; cennik DOKŁADNIE z liczbami z planu; treści mockupów realistyczne i po polsku.
6. MOBILE 375px: grid łamie się sensownie, mockup nie wystaje poza viewport, fonty czytelne, przyciski klikalne kciukiem.
7. MIKRODETALE: stany hover, płynne przejścia, spójne ikony, dopracowane drobiazgi (badge, separatory, stopka).
8. JS: bez błędów konsoli, IntersectionObserver na reveal, minimum jedna realna interakcja pokazująca produkt; wszystkie ID spójne między HTML a skryptem.

ZASADY ODPOWIEDZI:
- Zwróć WYŁĄCZNIE kompletny plik: od <!DOCTYPE html> do </html>. Zero markdownu, zero komentarza przed/po.
- Zachowaj wszystko, co już jest dobre (układ, treści, dane) — poprawiaj, nie przepisuj od zera. NIE skracaj treści sekcji.
- Strona pozostaje w pełni samowystarczalna (inline CSS/JS, jedyny zasób zewnętrzny: Google Fonts).`

function buildCriticUser(
  html: string,
  brief: Record<string, unknown>,
  plan: Record<string, unknown> | null,
  issues: string[],
): string {
  const briefClean = { ...brief }
  delete briefClean.zmien
  const parts = [
    `BRIEF PROJEKTU:\n${JSON.stringify(briefClean, null, 1)}`,
  ]
  if (plan) {
    parts.push(`PLAN PRZYCHODU (liczby do cennika): ${JSON.stringify({ cena: (plan as Record<string, unknown>).cena, cena_jednostka: (plan as Record<string, unknown>).cena_jednostka, model_przychodu: (plan as Record<string, unknown>).model_przychodu })}`)
  }
  if (issues.length) {
    parts.push(`WYKRYTE AUTOMATYCZNIE PROBLEMY (NAPRAW WSZYSTKIE, obowiązkowo):\n- ${issues.join('\n- ')}`)
  }
  parts.push(`PLIK DO PODNIESIENIA JAKOŚCI:\n${html}`)
  return parts.join('\n\n')
}

// Pojedyncze wywołanie chat completions; zwraca treść + tokeny (do logu)
async function openaiChat(
  apiKey: string,
  system: string,
  user: string,
  reasoningEffort: string | null,
): Promise<{ content: string | null; finish: string | null; input: number; cached: number; output: number }> {
  const body: Record<string, unknown> = {
    model: LANDING_MODEL,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  }
  if (reasoningEffort) body.reasoning_effort = reasoningEffort
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('[spar-landing] OpenAI error:', res.status, errText.slice(0, 500))
    return { content: null, finish: null, input: 0, cached: 0, output: 0 }
  }
  const data = await res.json()
  const usage = data?.usage || {}
  return {
    content: typeof data?.choices?.[0]?.message?.content === 'string' ? data.choices[0].message.content : null,
    finish: data?.choices?.[0]?.finish_reason || null,
    input: usage.prompt_tokens ?? 0,
    cached: usage.prompt_tokens_details?.cached_tokens ?? 0,
    output: usage.completion_tokens ?? 0,
  }
}

function buildUserPrompt(
  brief: Record<string, unknown>,
  plan: Record<string, unknown> | null,
): string {
  // Brief przekazujemy w całości (bez pól technicznych) — model ma widzieć
  // wszystko, co ustalono w rozmowie; plan dostarcza realne liczby do cennika.
  const briefClean = { ...brief }
  delete briefClean.zmien
  const parts = [
    `BRIEF PROJEKTU (ustalenia z rozmowy z pomysłodawcą — jedyne źródło prawdy o produkcie):`,
    JSON.stringify(briefClean, null, 1),
  ]
  if (plan) {
    const p = plan as Record<string, unknown>
    parts.push(
      `PLAN PRZYCHODU (źródło liczb do sekcji cennika — cena i model rozliczenia MUSZĄ się zgadzać):`,
      JSON.stringify({
        cena: p.cena,
        cena_jednostka: p.cena_jednostka,
        model_przychodu: p.model_przychodu,
        cena_uzasadnienie: p.cena_uzasadnienie,
      }, null, 1),
    )
  }
  parts.push(variantsBlock())
  parts.push(`Wygeneruj kompletny landing page tego narzędzia zgodnie ze wszystkimi zasadami.`)
  return parts.join('\n\n')
}

// Mail „strona gotowa" wysyła spar-followups (kind 'landing_ready') z celowym
// opóźnieniem ≥15 min od timestampu t= w landing_url — decyzja Tomka
// 2026-06-12: followup „coś się dla Ciebie zbudowało" zamiast
// natychmiastowego maila, gdy user jeszcze siedzi na stronie.

// Model potrafi mimo zakazu owinąć odpowiedź w ```html — zdejmujemy płotki
// i ucinamy wszystko przed <!DOCTYPE / po </html>.
function extractHtml(raw: string): string | null {
  let text = raw.trim()
  text = text.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.search(/<!DOCTYPE html/i)
  const end = text.lastIndexOf('</html>')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + '</html>'.length)
}

function landingCostUsd(model: string, input: number, cached: number, output: number): number {
  const p = PRICING[model]
  if (!p) {
    console.warn(`[spar-landing] nieznany cennik modelu ${model} — koszt 0`)
    return 0
  }
  const fresh = Math.max(0, input - cached)
  return (fresh * p.input + cached * p.cached + output * p.output) / 1_000_000
}

// Właściwa generacja — odpalana w tle przez EdgeRuntime.waitUntil (pełny
// landing to 1-4 min; bramka Supabase nie utrzyma tak długiego requestu).
//
// PIPELINE 2-PASS (pakiet jakości, 2026-06-12):
//   pass 1: generator → walidacja twarda → PUBLIKACJA wersji 1 (landing_url)
//           — użytkownik dostaje działającą stronę po ~3 min
//   pass 2: krytyk (art director, reasoning_effort=low) dostaje wersję 1
//           + listę twardych problemów → podmienia plik POD TYM SAMYM adresem
//           (Storage serwuje no-cache, podmiana widoczna od razu)
// Wall-clock edge functions to 400 s, a sam pass 1 potrafi zająć 180-215 s —
// dlatego pass 2 dostaje WŁASNĄ inwokację: po pass 1 funkcja wywołuje samą
// siebie (POST action='critic' + x-admin-secret) i krytyk ma pełne 400 s.
// Koszt obu passów w JEDNYM wpisie spar_usage, znajdowanym po meta.path
// (limit 3/sesja liczy wpisy = landingi, nie calle).

async function generateAndStore(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  sessionId: string,
  brief: Record<string, unknown>,
  plan: Record<string, unknown> | null,
  storagePath: string,
  viewUrl: string,
): Promise<void> {
  const startedAt = Date.now()
  try {
    // ── PASS 1: generator ──
    const gen = await openaiChat(apiKey, SYSTEM_PROMPT, buildUserPrompt(brief, plan), null)
    if (!gen.content) return
    const html1 = extractHtml(gen.content)
    if (!html1) {
      console.error('[spar-landing] pass1 bez kompletnego HTML, finish:', gen.finish, 'len:', gen.content.length)
      return
    }
    const issues = validateHtml(html1, brief, plan)
    if (issues.length) console.log('[spar-landing] pass1 issues:', JSON.stringify(issues))

    const upload = async (html: string) => {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, new TextEncoder().encode(html), {
          contentType: 'text/html; charset=utf-8',
          upsert: true,
        })
      return error
    }
    const uploadError = await upload(html1)
    if (uploadError) {
      console.error('[spar-landing] upload error:', uploadError)
      return
    }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

    // Publikacja wersji 1: landing_url + mail (krytyk podmieni plik w tle)
    const { error: sessErr } = await supabase
      .from('spar_sessions')
      .update({ landing_url: viewUrl, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (sessErr) console.error('[spar-landing] landing_url save error:', sessErr)

    // Log kosztów pass 1 (panel TN Aplikacje); pass 2 dopisuje się UPDATE'em
    const meta: Record<string, unknown> = {
      url: viewUrl,
      storage_url: pub?.publicUrl || null,
      path: storagePath,
      html_bytes: html1.length,
      duration_ms: Date.now() - startedAt,
      finish_reason: gen.finish,
      hard_issues: issues.length,
      critic: 'pending',
    }
    const { error: usageErr } = await supabase.from('spar_usage').insert({
      session_id: sessionId,
      kind: 'landing',
      model: LANDING_MODEL,
      input_tokens: gen.input,
      cached_tokens: gen.cached,
      output_tokens: gen.output,
      cost_usd: landingCostUsd(LANDING_MODEL, gen.input, gen.cached, gen.output),
      meta,
    })
    if (usageErr) console.error('[spar-landing] usage insert error:', usageErr)

    console.log(`[spar-landing] pass1 OK ${sessionId} ${html1.length}B ${Date.now() - startedAt}ms`)

    // ── PASS 2 w osobnej inwokacji (pełne 400 s dla krytyka) ──
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const ADMIN_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (SUPABASE_URL && ADMIN_SECRET) {
      try {
        const trig = await fetch(`${SUPABASE_URL}/functions/v1/spar-landing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
          body: JSON.stringify({ action: 'critic', sessionId, path: storagePath }),
        })
        if (!trig.ok) console.error('[spar-landing] critic trigger error:', trig.status, await trig.text().catch(() => ''))
      } catch (trigErr) {
        console.error('[spar-landing] critic trigger fetch error:', trigErr)
      }
    }
  } catch (err) {
    console.error('[spar-landing] background ERROR:', err instanceof Error ? err.message : String(err))
  }
}

// PASS 2 — osobna inwokacja: pobiera opublikowaną wersję 1 ze Storage,
// krytyk ją podnosi, plik podmienia się pod tym samym adresem, koszty
// dopisują się do wpisu usage z pass 1 (po meta.path).
async function runCriticTask(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  sessionId: string,
  storagePath: string,
): Promise<void> {
  const startedAt = Date.now()
  try {
    const { data: session, error: sErr } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, business_plan')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr || !session || !session.preview_brief) {
      console.error('[spar-landing] critic: brak sesji/briefu', sErr)
      return
    }
    const brief = session.preview_brief as Record<string, unknown>
    const plan = session.business_plan as Record<string, unknown> | null

    const { data: file, error: dlErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath)
    if (dlErr || !file) {
      console.error('[spar-landing] critic: download error', dlErr)
      return
    }
    const html1 = await file.text()
    const issues = validateHtml(html1, brief, plan)

    let criticStatus = 'api_error'
    let finalLen = html1.length
    const critic = await openaiChat(apiKey, CRITIC_SYSTEM, buildCriticUser(html1, brief, plan, issues), 'low')
    if (critic.content) {
      const candidate = extractHtml(critic.content)
      // sanity: krytyk ma poprawiać, nie skracać — okrojony plik = odrzucamy
      if (candidate && candidate.length >= html1.length * 0.6) {
        const issues2 = validateHtml(candidate, brief, plan)
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, new TextEncoder().encode(candidate), {
            contentType: 'text/html; charset=utf-8',
            upsert: true,
          })
        if (!upErr) {
          criticStatus = 'applied'
          finalLen = candidate.length
          if (issues2.length) console.log('[spar-landing] critic remaining issues:', JSON.stringify(issues2))
        } else {
          console.error('[spar-landing] critic upload error:', upErr)
          criticStatus = 'upload_failed'
        }
      } else {
        console.error('[spar-landing] critic odrzucony (brak HTML albo plik okrojony), len:',
          candidate ? candidate.length : null, 'finish:', critic.finish)
        criticStatus = 'rejected'
      }
    }

    // dopisz koszty pass 2 do wpisu z pass 1
    const { data: usageRow, error: findErr } = await supabase
      .from('spar_usage')
      .select('id, input_tokens, cached_tokens, output_tokens, meta')
      .eq('session_id', sessionId)
      .eq('kind', 'landing')
      .eq('meta->>path', storagePath)
      .maybeSingle()
    if (findErr || !usageRow) {
      console.error('[spar-landing] critic: brak wpisu usage do aktualizacji', findErr)
    } else {
      const totalIn = (usageRow.input_tokens || 0) + critic.input
      const totalCached = (usageRow.cached_tokens || 0) + critic.cached
      const totalOut = (usageRow.output_tokens || 0) + critic.output
      const { error: updErr } = await supabase.from('spar_usage').update({
        input_tokens: totalIn,
        cached_tokens: totalCached,
        output_tokens: totalOut,
        cost_usd: landingCostUsd(LANDING_MODEL, totalIn, totalCached, totalOut),
        meta: {
          ...(usageRow.meta as Record<string, unknown> || {}),
          critic: criticStatus,
          html_bytes: finalLen,
          critic_ms: Date.now() - startedAt,
        },
      }).eq('id', usageRow.id)
      if (updErr) console.error('[spar-landing] critic usage update error:', updErr)
    }
    console.log(`[spar-landing] critic ${criticStatus} ${sessionId} ${finalLen}B ${Date.now() - startedAt}ms`)
  } catch (err) {
    console.error('[spar-landing] critic ERROR:', err instanceof Error ? err.message : String(err))
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'metoda_niedozwolona' }, 405, corsHeaders)
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const ADMIN_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_SECRET) {
      console.error('[spar-landing] brak konfiguracji')
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, corsHeaders)
    }

    const isAdmin = req.headers.get('x-admin-secret') === ADMIN_SECRET

    let body: { sessionId?: string; action?: string; path?: string }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, corsHeaders)
    }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, corsHeaders)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // ── action 'critic': pass 2 w osobnej inwokacji (wewnętrzne wywołanie
    //    po pass 1 — pełny budżet 400 s tylko dla krytyka) ──────────────────
    if (body.action === 'critic') {
      if (!isAdmin) return jsonResponse({ error: 'brak_dostepu' }, 401, corsHeaders)
      const path = (body.path || '').trim()
      if (path !== `spar/${sessionId}/` + path.split('/').pop() || !/^landing-\d{10,16}\.html$/.test(path.split('/').pop() || '')) {
        return jsonResponse({ error: 'nieprawidlowa_sciezka' }, 400, corsHeaders)
      }
      const criticTask = runCriticTask(supabase, OPENAI_API_KEY, sessionId, path)
      // deno-lint-ignore no-explicit-any
      const rt = (globalThis as any).EdgeRuntime
      if (rt?.waitUntil) rt.waitUntil(criticTask)
      else criticTask.catch(() => {})
      return jsonResponse({ status: 'critic_started', path }, 202, corsHeaders)
    }

    const { data: session, error: sessionError } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, business_plan, verdict, landing_url')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError) {
      console.error('[spar-landing] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if (!session) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, corsHeaders)
    }
    const brief = session.preview_brief as Record<string, unknown> | null
    if (!brief) {
      return jsonResponse({ error: 'brak_projektu' }, 400, corsHeaders)
    }
    // Landing = element pakietu po domkniętej rozmowie (zielony werdykt);
    // admin może wcześniej (testy / rerolle)
    if (!isAdmin && session.verdict !== 'zielony') {
      return jsonResponse({ error: 'brak_werdyktu' }, 400, corsHeaders)
    }
    // Istniejąca strona wraca bez generacji (czyste urządzenie woła ensure*
    // zanim sync przyniesie landing_url — wyścig paliłby ~$0.45/wywołanie);
    // nową wersję wymusza tylko admin
    if (!isAdmin && typeof session.landing_url === 'string' && session.landing_url) {
      return jsonResponse({ status: 'exists', viewUrl: session.landing_url }, 200, corsHeaders)
    }

    const { count: landingCount, error: countErr } = await supabase
      .from('spar_usage')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('kind', 'landing')
    if (countErr) {
      console.error('[spar-landing] usage count error:', countErr)
    } else if ((landingCount ?? 0) >= MAX_LANDINGS_PER_SESSION) {
      return jsonResponse({ error: 'limit_landingow' }, 429, corsHeaders)
    }

    // Limit dzienny per IP — landingi z 24 h po wszystkich sesjach tego IP
    // (wzorzec spar-image; liczone z spar_usage.created_at, nie z wieku sesji)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    if (!isAdmin && ip) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ipSessions, error: ipErr } = await supabase
        .from('spar_sessions')
        .select('id')
        .eq('ip', ip)
      if (ipErr) {
        console.error('[spar-landing] ip sessions query error:', ipErr)
      } else if (ipSessions && ipSessions.length) {
        const { count: ipCount, error: ipUsageErr } = await supabase
          .from('spar_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'landing')
          .in('session_id', ipSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (ipUsageErr) {
          console.error('[spar-landing] ip usage count error:', ipUsageErr)
        } else if ((ipCount ?? 0) >= MAX_LANDINGS_PER_IP_PER_DAY) {
          return jsonResponse({ error: 'limit_landingow_dzienny' }, 429, corsHeaders)
        }
      }
    }

    const ts = Date.now()
    const storagePath = `spar/${sessionId}/landing-${ts}.html`
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
    // Link do OGLĄDANIA — wrapper na naszej domenie (patrz nagłówek pliku)
    const viewUrl = `https://tomekniedzwiecki.pl/aplikacja/podglad/?sid=${sessionId}&t=${ts}`

    const task = generateAndStore(
      supabase, OPENAI_API_KEY, sessionId,
      brief, session.business_plan as Record<string, unknown> | null,
      storagePath, viewUrl,
    )
    // deno-lint-ignore no-explicit-any
    const runtime = (globalThis as any).EdgeRuntime
    if (runtime?.waitUntil) runtime.waitUntil(task)
    else task.catch(() => {})

    return jsonResponse({ status: 'started', viewUrl, url: pub?.publicUrl || null, path: storagePath, model: LANDING_MODEL }, 202, corsHeaders)
  } catch (error) {
    console.error('[spar-landing] ERROR:', error instanceof Error ? error.message : String(error))
    return jsonResponse({ error: 'blad_serwera' }, 502, corsHeaders)
  }
})
