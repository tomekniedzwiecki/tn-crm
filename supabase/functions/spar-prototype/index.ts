// spar-prototype — generacja DZIAŁAJĄCEGO, KLIKALNEGO prototypu narzędzia dla
// projektu z lejka "Aplikacja" (tomekniedzwiecki.pl/aplikacja). Następny poziom
// po landingu (spar-landing): tam gpt-5.5 pisze stronę SPRZEDAŻOWĄ narzędzia,
// tu pisze SAMO NARZĘDZIE — interaktywny prototyp głównej funkcji, w którym
// pomysłodawca może kliknąć, wpisać dane i zobaczyć reakcję. Moment "to działa,
// to jest moje" — najmocniejszy bodziec do rezerwacji rozmowy.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-prototype --no-verify-jwt
//
// DOSTĘP (wzorzec spar-landing):
//   - sesyjny: sesja musi mieć preview_brief ORAZ zielony werdykt (prototyp to
//     element pakietu po domkniętej rozmowie); limity: 3/sesja (z spar_usage
//     kind='prototype') + 5/dobę/IP — endpoint publiczny, ~$0.45 na gpt-5.5
//   - admin: nagłówek x-admin-secret == SPAR_CRON_SECRET omija werdykt i limit
//     IP (rerolle z panelu / testy)
//
// STAN bez migracji: w przeciwieństwie do landinga (kolumna landing_url)
// prototyp NIE dostaje kolumny w spar_sessions — gotowość i URL żyją w
// spar_usage (kind='prototype', meta.url). Frontend pyta tę funkcję
// (action:'status') zamiast spar-project. Mniejszy ślad, zero ryzyka PostgREST.
//
// Flow: POST {sessionId} → 202 {status:'started'} natychmiast; generacja
// (1-4 min) leci w tle przez EdgeRuntime.waitUntil. Gotowość:
//   POST {sessionId, action:'status'} → {viewUrl|null}
// albo HEAD na storage url. Powrót na czystym urządzeniu: POST {sessionId} →
// {status:'exists', viewUrl} (bez kosztu).
//
// OGLĄDANIE: ten sam wrapper co landing —
//   https://tomekniedzwiecki.pl/aplikacja/podglad/?sid=<uuid>&t=<ts>&k=prototyp
// (fetch ze Storage + render w sandboxowanym iframe srcdoc; *.supabase.co
// neutralizuje HTML anty-phishingiem, więc renderuje NASZA domena).
// ⚠️ Sandbox to 'allow-scripts' BEZ allow-same-origin → localStorage/cookies
// RZUCAJĄ wyjątkiem; prototyp MUSI trzymać stan w pamięci JS (wymuszone w prompcie).
//
// Sekrety: OPENAI_API_KEY, SPAR_PROTOTYPE_MODEL (opc., default gpt-5.5),
//          SPAR_CRON_SECRET (admin, współdzielony ze spar-landing/followups).

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

const PROTOTYPE_MODEL = Deno.env.get('SPAR_PROTOTYPE_MODEL') || 'gpt-5.5'
const MAX_COMPLETION_TOKENS = 40000
const MAX_PROTOTYPES_PER_SESSION = 3
const MAX_PROTOTYPES_PER_IP_PER_DAY = parseInt(Deno.env.get('SPAR_PROTOTYPE_IP_DAILY') || '5', 10)
const STORAGE_BUCKET = 'attachments'

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
// To NIE jest landing. Model buduje SAMO NARZĘDZIE w działaniu — aplikację,
// którą da się kliknąć i poużywać. Wow = "wpisałem coś i zareagowało jak
// prawdziwa apka", nie "ładna strona o aplikacji".
const SYSTEM_PROMPT = `Jesteś senior product engineerem i product designerem (poziom najlepszych zespołów SaaS). Budujesz JEDEN plik HTML — DZIAŁAJĄCY, KLIKALNY PROTOTYP narzędzia, które JESZCZE NIE ISTNIEJE. To nie jest strona sprzedażowa ani reklama. To samo narzędzie w działaniu: osoba, która je wymyśliła, ma wejść, kliknąć, wpisać własne dane i zobaczyć, jak aplikacja reaguje — i pomyśleć "o cholera, to naprawdę działa, to jest moje".

⭐ NAJWAŻNIEJSZE — SPÓJNOŚĆ Z ZATWIERDZONYMI EKRANAMI:
Dostajesz w tej wiadomości WYGENEROWANE WCZEŚNIEJ GRAFIKI EKRANÓW tego narzędzia (pulpit, ekran głównej funkcji, ekran wspierający). To NIE jest inspiracja — to design referencyjny, który pomysłodawca już zaakceptował. Określają OBOWIĄZUJĄCY styl, układ, kolory, komponenty, nazwy sekcji i FUNKCJE narzędzia. Twoje zadanie: odtworzyć dokładnie te ekrany jako jeden, połączony, KLIKALNY i DZIAŁAJĄCY produkt — tak, żeby ktoś, kto widział te grafiki, rozpoznał je natychmiast, tyle że teraz może w nie kliknąć.
- Odwzoruj WIERNIE: paletę, typografię (charakter), układ, rodzaje kart/list/przycisków, ikonografię, nagłówki sekcji i dane widoczne na grafikach (te same imiona, etykiety, liczby, jeśli są czytelne).
- Każda grafika = jeden ekran prototypu. Połącz je realną nawigacją (pasek/menu/taby), tak jak sugerują same ekrany.
- Jeśli czegoś nie widać na grafice, dobierz spójnie z ich stylem i z briefem — NIE wymyślaj innego designu.
- Brief (tekst) i obiekt "design" doprecyzowują nazwy, dane i funkcje. W razie konfliktu: GRAFIKI mają priorytet nad opisem tekstowym dla wyglądu, brief ma priorytet dla treści/danych.

FORMAT ODPOWIEDZI (bezwzględne):
- Zwróć WYŁĄCZNIE czysty HTML: od <!DOCTYPE html> do </html>. Zero markdownu, zero \`\`\`, zero komentarza przed ani po.
- Jeden samowystarczalny plik: cały CSS w <style>, cały JS w <script> na końcu <body>. ŻADNYCH zewnętrznych bibliotek, frameworków, obrazków (<img> z URL = zakaz). Jedyny dozwolony zasób zewnętrzny: Google Fonts.
- Fonty: 1-2 z PEŁNĄ obsługą polskich znaków (Inter, Sora, Manrope, Outfit, Space Grotesk, Plus Jakarta Sans). Dobierz do charakteru produktu.

⛔ KRYTYCZNE OGRANICZENIE ŚRODOWISKA — prototyp działa w sandboxie iframe BEZ dostępu do origin:
- localStorage, sessionStorage, document.cookie, indexedDB RZUCAJĄ WYJĄTEK przy każdym użyciu. NIE WOLNO ich tknąć — jeden taki call wywala całą apkę białym ekranem.
- Cały stan aplikacji trzymaj w zmiennych JavaScript w pamięci (tablice, obiekty). Reset przy odświeżeniu jest OK — to prototyp.
- Bez fetch/XHR do czegokolwiek. Wszystko działa offline, lokalnie, na danych w pamięci.

⛔ NIEZAWODNOŚĆ JS (najczęstsza przyczyna białego ekranu — bezwzględne):
- OWIŃ CAŁY JavaScript w jedną funkcję IIFE: (function(){ 'use strict'; ...cały kod... })(); — zmienne lądują w zakresie funkcji, nie globalnym.
- NIGDY nie deklaruj na najwyższym poziomie (ani jako const/let/var) nazw kolidujących z globalami okna: top, name, status, length, parent, self, open, closed, location, history, origin, event. W globalnym zakresie „const top = …" rzuca „Identifier 'top' has already been declared" i ZABIJA cały skrypt → biały ekran. (IIFE to neutralizuje, ale i tak unikaj tych nazw.)
- TREŚĆ MUSI BYĆ WIDOCZNA, nawet gdyby skrypt nie wystartował: NIE ustawiaj bazowej zawartości na opacity:0 / display:none / visibility:hidden zdejmowane dopiero przez JS. Ekran startowy renderuje się z samego HTML/CSS; animacje wejścia tylko go WZMACNIAJĄ (element domyślnie widoczny, animacja co najwyżej go „dowozi"). Jeśli używasz reveal-on-scroll, klasa bazowa = widoczna.
- Zero błędów w konsoli: spójne ID między HTML a JS, brak odwołań do nieistniejących elementów.

CZYM TO MA BYĆ (esencja):
- To APLIKACJA, nie strona. Ma mieć app-chrome: górny pasek z nazwą narzędzia i nawigacją (albo bocznym menu / dolnym tab-barem), ekran roboczy, sensowne ekrany. Wygląda jak panel produktu, nie jak landing ze scrollem marketingowym.
- 2-3 POŁĄCZONE widoki z realną nawigacją (klik w menu/tab przełącza widok bez przeładowania). Np. lista → szczegół → ustawienia; albo dashboard → nowy wpis → historia.
- GŁÓWNA FUNKCJA DZIAŁA NAPRAWDĘ. Minimum 3 realne interakcje zmieniające stan na ekranie:
  • dodanie elementu (formularz → rekord pojawia się na liście od razu),
  • filtr / wyszukiwarka / taby zmieniające widoczne dane,
  • akcja z wynikiem (przycisk „Generuj/Policz/Wyślij" → po krótkim spinnerze 600-900 ms pojawia się wynik złożony lokalnie z szablonu opartego na danych wejściowych — ma wyglądać, jakby narzędzie myślało),
  • zmiana statusu (oznacz zrobione, przesuń etap, polub, archiwizuj).
- WYPEŁNIONE DANYMI OD STARTU: 4-8 realistycznych POLSKICH rekordów seedowych wynikających z briefu (prawdziwie brzmiące imiona, daty, kwoty w zł, treści). Zero pustego stanu, zero lorem ipsum, zero angielskich placeholderów. Narzędzie ma wyglądać, jakby ktoś już go używał.
- Każdy klikalny element REAGUJE. Przyciski poboczne, które nie mają pełnej logiki w prototypie, pokazują delikatny toast („W pełnej wersji: …") zamiast wisieć martwo. Zero błędów w konsoli.

ARCHETYP INTERAKCJI — wybierz dominujący wzorzec najlepiej pasujący do TEGO narzędzia (możesz złączyć dwa):
{{ARCHETYPES}}

WOW (to jest sedno tego prototypu): wrażenie żywej aplikacji. Element, który pomysłodawca pokaże znajomemu mówiąc „patrz, wpisuję i ono…". Najmocniej działa realna akcja z wynikiem (generator, kalkulacja na żywo, zmiana danych po kliknięciu). Sekwencyjne wejście ekranu (elementy wjeżdżają 0.4-0.6 s jak ładująca się apka) wzmacnia efekt, ale samo w sobie nie jest wow — wow jest to, że KLIK ROBI COŚ.

⭐ DESIGN — TO NAJWAŻNIEJSZE KRYTERIUM (na podstawie wyglądu pomysłodawca decyduje, czy w ogóle budować ten produkt):
Prototyp ma wyglądać jak GOTOWA, dopracowana aplikacja z najlepszego studia produktowego — nie jak szkic ani szablon. Każdy ekran musi robić wrażenie „to wygląda jak prawdziwy, profesjonalny produkt, za który ludzie płacą". Jakość wizualna jest ważniejsza niż liczba funkcji.
- Brief "design" (hexy tła/akcentów, typografia) odwzoruj DOKŁADNIE; pole "styl" (życzenia klienta) ma najwyższy priorytet. Zachowaj spójność z załączonymi ekranami.
- TYPOGRAFIA: wyraźna skala (np. 12 / 14 / 16 / 20 / 28 / 40 px), mocny kontrast między nagłówkiem a tekstem, jeden spójny krój. Nie rób wszystkiego jednym rozmiarem — to natychmiast wygląda amatorsko.
- PRZESTRZEŃ: konsekwentny system odstępów (4 / 8 / 12 / 16 / 24 px), oddech między sekcjami, nic ściśnięte ani rozjechane. Gęstość jak w realnym produkcie — bez wielkich pustych pól i bez tłoku.
- KOMPONENTY dopracowane: przyciski ze stanami hover/active/focus, karty z subtelnym cieniem i 1px borderem, spójne zaokrąglenia (10-16 px), separatory, badge i tagi statusu (kolorowe, czytelne), avatary z inicjałami, ikony statusu. Detale robią różnicę.
- HIERARCHIA: jedno wyraźne główne CTA na ekran (kolor akcentu), akcje drugorzędne stonowane (ghost/outline). Najważniejsza informacja największa i najmocniejsza.
- STANY: dopracowany pusty stan (ładny, z ikoną i zachętą — nie suche „brak danych"), stan ładowania (skeleton albo spinner), stan aktywny/wybrany, hover na wierszach list.
- MIKROINTERAKCJE: płynne przejścia 150-250 ms (transform/opacity), subtelne; zero krzykliwych, skaczących animacji.
- IKONY: jeden spójny styl liniowy (np. stroke 1.8-2 px), jeden rozmiar w danym kontekście; SVG inline.
- KONTRAST i CZYTELNOŚĆ: tekst czytelny na tle (kontrast min. WCAG AA), wyraźne stany aktywne, brak szarego tekstu na szarym tle.
- Poziom wykonania: ma wyglądać jak Linear / Notion / Stripe Dashboard dla tej niszy — czysto, premium, przemyślanie. Jeśli masz wybór „więcej funkcji" vs „ładniej" — wybierz ładniej.
- FORMAT URZĄDZENIA dobierz do typu narzędzia: aplikacja „w telefonie" (CRM w kieszeni, tracker, asystent) → wyśrodkowana ramka telefonu (max ~430 px) na ciemnym/teksturowanym tle desktopu; narzędzie „przy biurku" (panel, dashboard, edytor) → okno aplikacji (max ~1040 px) z paskiem okna. Na ekranie <600 px ZAWSZE pełna szerokość, bez ramki, wszystko klikalne kciukiem (cele ≥44 px).

JĘZYK:
- Bezbłędna polszczyzna z pełnymi diakrytykami w całym UI i danych.
- Etykiety, przyciski, puste stany, toasty, mikrocopy — naturalne, krótkie, w języku grupy docelowej. Zero korpomowy, zero AI-poetyki.

KONTEKST:
- W dyskretnym miejscu (stopka paska, ekran „o aplikacji" albo mały tekst w rogu ustawień) malutki dopisek: „Prototyp koncepcyjny — zbudowany w tomekniedzwiecki.pl/aplikacja" (link do https://tomekniedzwiecki.pl/aplikacja/). Ma być subtelny, nie psuć wrażenia produktu.

WZORZEC GĘSTOŚCI DETALU (przykład fragmentu listy w narzędziu typu CRM — NIE kopiuj układu, palety ani treści; pokazuje oczekiwany poziom: realne polskie dane, stany, akcja per rekord):
<div class="row" data-id="3">
  <span class="ava">KN</span>
  <div class="row-main"><b>Kasia Nowak</b><span>Po treningu · feedback · 2 dni temu</span></div>
  <span class="tag tag--warn">do kontaktu</span>
  <button class="row-act" data-act="msg">Napisz</button>
</div>
// klik „Napisz" → modal z gotową, spersonalizowaną wiadomością złożoną z imienia i kontekstu rekordu (szablon w JS), przycisk „Wyślij" → toast „Wysłano do Kasi" + zmiana tagu na „odpowiedź czeka".`

// Archetypy interakcji — model wybiera pasujący. Tasujemy kolejność, żeby nie
// zbiegały do pierwszego z brzegu (lekcja z HERO_VARIANTS w spar-landing).
const ARCHETYPES: { id: string; opis: string }[] = [
  { id: 'lista-crm', opis: 'Lista/CRM: rekordy (klienci, zadania, zgłoszenia) z tagami statusu; dodawanie przez formularz, filtr/taby u góry, akcja per rekord (napisz, oznacz, otwórz szczegół w modalu/drugim ekranie).' },
  { id: 'generator', opis: 'Generator: pole/formularz wejścia → przycisk „Generuj" → spinner 600-900 ms → wynik złożony lokalnie z szablonu na danych wejścia (wiadomość, plan, opis, oferta); pod spodem historia wygenerowanych pozycji do podejrzenia.' },
  { id: 'dashboard-tracker', opis: 'Dashboard/tracker: kafle metryk + prosty wykres słupkowy/liniowy zbudowany w CSS/SVG; dodanie wpisu aktualizuje metryki i wykres na żywo; oznaczanie postępu (pasek, checkboxy).' },
  { id: 'kanban-workflow', opis: 'Kanban/workflow: 3 kolumny etapów, karty z polskimi danymi; klik (lub przyciski ◀▶) przesuwa kartę między etapami i aktualizuje liczniki kolumn; dodanie karty do pierwszej kolumny.' },
  { id: 'katalog-marketplace', opis: 'Katalog/marketplace: siatka kart (oferty, produkty, profile) + wyszukiwarka i filtry zmieniające widoczne karty; klik w kartę → ekran szczegółu z akcją (zarezerwuj, zapisz, kontakt).' },
  { id: 'konfigurator-kalkulator', opis: 'Konfigurator/kalkulator: suwaki i pola wejścia → wynik (cena, wycena, plan, dopasowanie) przeliczany na żywo przy każdej zmianie; podsumowanie z rozbiciem i przyciskiem akcji.' },
  { id: 'asystent-czat', opis: 'Asystent/czat: interfejs rozmowy z narzędziem; user klika gotowe podpowiedzi albo wpisuje, „asystent" po krótkim „pisze…" odpowiada treścią złożoną z szablonu na danych briefu; boczny panel z kontekstem/wynikami.' },
]

function shuffledPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function archetypesBlock(): string {
  // pokazujemy wszystkie, ale w losowej kolejności — wybór ma wynikać z dopasowania
  return shuffledPick(ARCHETYPES, ARCHETYPES.length)
    .map((a) => `- [${a.id}] ${a.opis}`)
    .join('\n')
}

// Twarde walidacje — grep-checki; problemy wchodzą jako poprawki do krytyka.
function validateHtml(html: string, brief: Record<string, unknown>): string[] {
  const issues: string[] = []
  const diacritics = (html.match(/[ąćęłńóśźż]/gi) || []).length
  if (diacritics < 20) issues.push(`Podejrzanie mało polskich znaków diakrytycznych (${diacritics}) — popraw całą polszczyznę w UI i danych.`)
  if (/lorem ipsum/i.test(html)) issues.push('W treści jest „lorem ipsum" — zastąp realistyczną polską treścią.')
  if (/<img[^>]+src=["']https?:/i.test(html)) issues.push('Prototyp ładuje zewnętrzne obrazki <img> — usuń, wszystko buduj w HTML/CSS.')
  if (/<script[^>]+src=/i.test(html)) issues.push('Prototyp ładuje zewnętrzny skrypt — cały JS ma być inline.')
  if (/<link[^>]+href=["']https?:\/\/(?!fonts\.googleapis\.com|fonts\.gstatic\.com)/i.test(html)) {
    issues.push('Prototyp linkuje zewnętrzny zasób inny niż Google Fonts — usuń.')
  }
  // ⛔ najważniejsze: storage w sandboxie = biały ekran
  if (/\b(localStorage|sessionStorage|indexedDB)\b/.test(html) || /document\.cookie/.test(html)) {
    issues.push('Prototyp używa localStorage/sessionStorage/cookies/indexedDB — w sandboxie iframe to RZUCA WYJĄTEK i wywala apkę. Przenieś cały stan do zmiennych JS w pamięci, usuń każde odwołanie do storage.')
  }
  if (!/name=["']viewport["']/i.test(html)) issues.push('Brak meta viewport — prototyp nie będzie działał na telefonie.')
  if (/```/.test(html)) issues.push('W pliku zostały płotki markdown ``` — usuń.')
  if (/\b(TODO|PLACEHOLDER|Get started|Sign up|Add new|Submit|Search\.\.\.)\b/.test(html)) {
    issues.push('W treści są angielskie frazy albo placeholdery — przepisz na polski.')
  }
  const nazwa = typeof brief.nazwa === 'string' ? brief.nazwa.trim() : ''
  if (nazwa && !html.includes(nazwa)) issues.push(`Nazwa narzędzia „${nazwa}" nie pojawia się w interfejsie.`)
  if (!/addEventListener|onclick/i.test(html)) issues.push('Brak realnej interakcji w JS — prototyp ma reagować na kliknięcia, nie być statycznym obrazkiem.')
  // ⛔ deklaracja globala okna na najwyższym poziomie = „Identifier already declared" → biały ekran
  if (/^\s*(?:const|let|var)\s+(top|name|status|length|parent|self|closed|origin|event)\b/m.test(html)) {
    issues.push('Deklaracja zmiennej o nazwie globala okna (top/name/status/length/parent/self…) — w globalnym zakresie rzuca wyjątek i wywala apkę. Owiń cały JS w IIFE i/lub zmień nazwę.')
  }
  return issues
}

// Krytyk — drugi przebieg: lead product designer podnosi prototyp.
const CRITIC_SYSTEM = `Jesteś bezlitosnym lead product designerem i senior front-end engineerem. Dostajesz JEDEN plik HTML — klikalny prototyp narzędzia SaaS (do oceny przez pomysłodawcę) — brief projektu ORAZ wygenerowane wcześniej grafiki ekranów tego narzędzia (design referencyjny). Zadanie: PODNIEŚĆ jakość i zwrócić POPRAWIONY, KOMPLETNY plik.

AUDYT (sprawdź każdy punkt, popraw wszystko, co odstaje):
0. ⭐ SPÓJNOŚĆ Z GRAFIKAMI: prototyp ma wyglądać jak działająca wersja załączonych ekranów (paleta, typografia, układ, komponenty, nagłówki, dane). Odstaje od grafik — dociągnij do nich. To priorytet nad Twoimi preferencjami estetycznymi.
1. CZY TO DZIAŁA: prototyp ma mieć minimum 3 realne interakcje zmieniające stan na ekranie (dodawanie, filtr/taby, akcja z wynikiem, zmiana statusu). Każda DZIAŁA bez błędów konsoli, ID spójne między HTML a JS. Brakuje interakcji albo któraś jest martwa — napraw/dodaj.
2. ⛔ STORAGE: jeśli gdziekolwiek jest localStorage/sessionStorage/cookies/indexedDB — USUŃ i przenieś stan do zmiennych JS w pamięci. W sandboxie to wywala całą apkę. Bezwzględne.
2a. ⛔ NIEZAWODNOŚĆ JS: cały JavaScript MUSI być owinięty w IIFE (function(){ 'use strict'; … })(). Żadnych deklaracji najwyższego poziomu o nazwach globali okna (top, name, status, length, parent, self, open, closed, location) — to rzuca „Identifier already declared" i daje biały ekran; zmień nazwy. Treść bazowa widoczna z samego HTML/CSS (nie opacity:0/display:none zdejmowane przez JS) — apka ma się pokazać nawet przy błędzie skryptu.
3. WRAŻENIE PRODUKTU: app-chrome (pasek/nawigacja/ekrany), nie landing. 2-3 połączone widoki z działającą nawigacją. Wypełnione realnymi polskimi danymi od startu (4-8 rekordów), zero pustego stanu, zero lorem.
4. AKCJA Z WYNIKIEM: jeśli narzędzie obiecuje „wynik" (wiadomość, plan, wycena, analiza) — ma być realnie symulowana: krótki spinner, potem wynik złożony z danych wejścia. To główny wow — wzmocnij go.
5. ⭐ DESIGN (NAJWAŻNIEJSZE — na podstawie wyglądu pomysłodawca decyduje, czy budować): podnieś jakość wizualną do poziomu gotowego, premium produktu (Linear/Notion/Stripe dla tej niszy). Sprawdź i popraw: skalę typograficzną (kontrast nagłówek↔tekst, nie wszystko jednym rozmiarem), system odstępów (4/8/16/24 px, oddech między sekcjami), komponenty (przyciski ze stanami, karty z cieniem+borderem, spójne zaokrąglenia, badge/tagi/avatary), jedno wyraźne CTA, dopracowane stany puste i ładowania, subtelne mikroanimacje 150-250 ms, spójne ikony liniowe, kontrast WCAG AA. Wytnij wszystko, co wygląda amatorsko/szablonowo. Jeśli ekran wygląda „ok", a nie „wow" — popraw go.
6. MOBILE <600px: pełna szerokość bez ramki urządzenia, wszystko czytelne i klikalne kciukiem (cele ≥44 px), nic nie wystaje poza viewport.
7. JĘZYK: bezbłędna polszczyzna z diakrytykami w całym UI, danych, toastach; zero angielskiego, zero korpomowy.
8. MARTWE KLIKI: każdy widoczny przycisk reaguje — albo robi swoją akcję, albo pokazuje toast „W pełnej wersji: …".

ZASADY ODPOWIEDZI:
- Zwróć WYŁĄCZNIE kompletny plik: od <!DOCTYPE html> do </html>. Zero markdownu, zero komentarza przed/po.
- Zachowaj wszystko, co działa (układ, dane, logika) — poprawiaj, nie przepisuj od zera. NIE skracaj.
- Plik pozostaje w pełni samowystarczalny (inline CSS/JS, jedyny zasób zewnętrzny: Google Fonts), bez żadnego storage.`

function buildUserPrompt(brief: Record<string, unknown>, hasImages: boolean): string {
  const briefClean = { ...brief }
  delete briefClean.zmien
  const parts: string[] = []
  if (hasImages) {
    parts.push(`ZAŁĄCZONE GRAFIKI EKRANÓW (poniżej) = zatwierdzony design referencyjny tego narzędzia: pulpit, ekran głównej funkcji i ekran wspierający. Odtwórz je wiernie jako jeden, klikalny, działający produkt (kolejność = nawigacja między widokami).`)
  }
  parts.push(
    `BRIEF PROJEKTU (ustalenia z rozmowy z pomysłodawcą — źródło prawdy o nazwie, danych i funkcjach):`,
    JSON.stringify(briefClean, null, 1),
    `ARCHETYPY INTERAKCJI (wybierz dominujący, najlepiej pasujący do tego narzędzia i do tego, co widać na ekranach — możesz złączyć dwa):\n${archetypesBlock()}`,
    `Zbuduj kompletny, działający prototyp tego narzędzia zgodnie ze wszystkimi zasadami${hasImages ? ' i WIERNIE wg załączonych ekranów' : ''}. Klik ma coś robić — to ma wyglądać jak żywa aplikacja, nie obrazek.`,
  )
  return parts.join('\n\n')
}

function buildCriticUser(html: string, brief: Record<string, unknown>, issues: string[], hasImages: boolean): string {
  const briefClean = { ...brief }
  delete briefClean.zmien
  const parts: string[] = []
  if (hasImages) parts.push(`ZAŁĄCZONE GRAFIKI = zatwierdzony design referencyjny narzędzia. Prototyp ma wyglądać jak ich działająca wersja — sprawdź spójność i dociągnij.`)
  parts.push(`BRIEF PROJEKTU:\n${JSON.stringify(briefClean, null, 1)}`)
  if (issues.length) {
    parts.push(`WYKRYTE AUTOMATYCZNIE PROBLEMY (NAPRAW WSZYSTKIE, obowiązkowo):\n- ${issues.join('\n- ')}`)
  }
  parts.push(`PLIK DO PODNIESIENIA JAKOŚCI:\n${html}`)
  return parts.join('\n\n')
}

// Ekrany aplikacji z preview_images — design referencyjny dla prototypu.
// Tylko widoki UI narzędzia (pulpit/główna/wspierająca); pomijamy marketing
// (landing/sklep/telefon) i infografikę (podsumowanie).
function appScreenUrls(previewImages: Record<string, unknown> | null): string[] {
  if (!previewImages || typeof previewImages !== 'object') return []
  const order = ['panel', 'glowna', 'dodatkowa']
  const urls: string[] = []
  for (const k of order) {
    const v = previewImages[k]
    if (typeof v === 'string' && /^https?:\/\//.test(v)) urls.push(v)
  }
  return urls
}

async function openaiChat(
  apiKey: string,
  system: string,
  user: string,
  reasoningEffort: string | null,
  images: string[] = [],
): Promise<{ content: string | null; finish: string | null; input: number; cached: number; output: number }> {
  // Vision: grafiki ekranów wchodzą jako image_url w wiadomości usera —
  // gpt-5.5 „widzi" zatwierdzony design i odtwarza go jako działający produkt.
  const userContent: unknown = images.length
    ? [
        { type: 'text', text: user },
        ...images.map((url) => ({ type: 'image_url', image_url: { url, detail: 'high' } })),
      ]
    : user
  const body: Record<string, unknown> = {
    model: PROTOTYPE_MODEL,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userContent },
    ],
  }
  if (reasoningEffort) body.reasoning_effort = reasoningEffort
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('[spar-prototype] OpenAI error:', res.status, errText.slice(0, 500))
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

function extractHtml(raw: string): string | null {
  let text = raw.trim()
  text = text.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.search(/<!DOCTYPE html/i)
  const end = text.lastIndexOf('</html>')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + '</html>'.length)
}

function protoCostUsd(model: string, input: number, cached: number, output: number): number {
  const p = PRICING[model]
  if (!p) { console.warn(`[spar-prototype] nieznany cennik modelu ${model}`); return 0 }
  const fresh = Math.max(0, input - cached)
  return (fresh * p.input + cached * p.cached + output * p.output) / 1_000_000
}

// Najnowszy gotowy prototyp sesji (meta.url) z spar_usage — strona odczytu bez
// kolumny w spar_sessions. null = jeszcze nie ma (poll trwa).
async function latestPrototypeUrl(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('spar_usage')
    .select('meta, created_at')
    .eq('session_id', sessionId)
    .eq('kind', 'prototype')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) { console.error('[spar-prototype] latestPrototypeUrl error:', error); return null }
  const url = data?.meta && typeof (data.meta as Record<string, unknown>).url === 'string'
    ? (data.meta as Record<string, unknown>).url as string : null
  return url || null
}

// ── Generacja w tle (2-pass, wzorzec spar-landing) ──
async function generateAndStore(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  sessionId: string,
  brief: Record<string, unknown>,
  screens: string[],
  storagePath: string,
  viewUrl: string,
): Promise<void> {
  const startedAt = Date.now()
  const releaseLock = async () => {
    const { error } = await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'prototype' })
    if (error) console.error('[spar-prototype] release lock error:', error)
  }
  try {
    // pass1 reasoning DOMYŚLNY (null) — sprawdzona, niecięta konfiguracja
    // ('high'/'medium' przy 48k zjadały budżet na reasoning → pusty output bez
    // </html>). Skok jakości daje design-first prompt + krytyk 'medium'.
    const gen = await openaiChat(apiKey, SYSTEM_PROMPT, buildUserPrompt(brief, screens.length > 0), null, screens)
    if (!gen.content) { await releaseLock(); return }
    const html1 = extractHtml(gen.content)
    if (!html1) {
      console.error('[spar-prototype] pass1 bez kompletnego HTML, finish:', gen.finish, 'len:', gen.content.length)
      await releaseLock()
      return
    }
    const issues = validateHtml(html1, brief)
    if (issues.length) console.log('[spar-prototype] pass1 issues:', JSON.stringify(issues))

    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, new TextEncoder().encode(html1), {
        contentType: 'text/html; charset=utf-8',
        upsert: true,
      })
    if (upErr) { console.error('[spar-prototype] upload error:', upErr); await releaseLock(); return }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

    // Publikacja wersji 1: wpis usage z meta.url = sygnał gotowości dla frontendu
    const { error: usageErr } = await supabase.from('spar_usage').insert({
      session_id: sessionId,
      kind: 'prototype',
      model: PROTOTYPE_MODEL,
      input_tokens: gen.input,
      cached_tokens: gen.cached,
      output_tokens: gen.output,
      cost_usd: protoCostUsd(PROTOTYPE_MODEL, gen.input, gen.cached, gen.output),
      meta: {
        url: viewUrl,
        storage_url: pub?.publicUrl || null,
        path: storagePath,
        html_bytes: html1.length,
        duration_ms: Date.now() - startedAt,
        finish_reason: gen.finish,
        hard_issues: issues.length,
        critic: 'pending',
      },
    })
    if (usageErr) console.error('[spar-prototype] usage insert error:', usageErr)
    await releaseLock()
    console.log(`[spar-prototype] pass1 OK ${sessionId} ${html1.length}B ${Date.now() - startedAt}ms`)

    // Pass 2 (krytyk) w osobnej inwokacji — pełne 400 s
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const ADMIN_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (SUPABASE_URL && ADMIN_SECRET) {
      try {
        const trig = await fetch(`${SUPABASE_URL}/functions/v1/spar-prototype`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
          body: JSON.stringify({ action: 'critic', sessionId, path: storagePath }),
        })
        if (!trig.ok) console.error('[spar-prototype] critic trigger error:', trig.status, await trig.text().catch(() => ''))
      } catch (trigErr) {
        console.error('[spar-prototype] critic trigger fetch error:', trigErr)
      }
    }
  } catch (err) {
    console.error('[spar-prototype] background ERROR:', err instanceof Error ? err.message : String(err))
    await releaseLock()
  }
}

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
      .select('id, preview_brief, preview_images')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr || !session || !session.preview_brief) {
      console.error('[spar-prototype] critic: brak sesji/briefu', sErr); return
    }
    const brief = session.preview_brief as Record<string, unknown>
    const screens = appScreenUrls(session.preview_images as Record<string, unknown> | null)

    const { data: file, error: dlErr } = await supabase.storage.from(STORAGE_BUCKET).download(storagePath)
    if (dlErr || !file) { console.error('[spar-prototype] critic: download error', dlErr); return }
    const html1 = await file.text()
    const issues = validateHtml(html1, brief)

    let criticStatus = 'api_error'
    let finalLen = html1.length
    const critic = await openaiChat(apiKey, CRITIC_SYSTEM, buildCriticUser(html1, brief, issues, screens.length > 0), 'medium', screens)
    if (critic.content) {
      const candidate = extractHtml(critic.content)
      if (candidate && candidate.length >= html1.length * 0.6) {
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, new TextEncoder().encode(candidate), {
            contentType: 'text/html; charset=utf-8',
            upsert: true,
          })
        if (!upErr) {
          criticStatus = 'applied'
          finalLen = candidate.length
          const issues2 = validateHtml(candidate, brief)
          if (issues2.length) console.log('[spar-prototype] critic remaining issues:', JSON.stringify(issues2))
        } else {
          console.error('[spar-prototype] critic upload error:', upErr)
          criticStatus = 'upload_failed'
        }
      } else {
        console.error('[spar-prototype] critic odrzucony, len:', candidate ? candidate.length : null, 'finish:', critic.finish)
        criticStatus = 'rejected'
      }
    }

    const { data: usageRow, error: findErr } = await supabase
      .from('spar_usage')
      .select('id, input_tokens, cached_tokens, output_tokens, meta')
      .eq('session_id', sessionId)
      .eq('kind', 'prototype')
      .eq('meta->>path', storagePath)
      .maybeSingle()
    if (findErr || !usageRow) {
      console.error('[spar-prototype] critic: brak wpisu usage do aktualizacji', findErr)
    } else {
      const totalIn = (usageRow.input_tokens || 0) + critic.input
      const totalCached = (usageRow.cached_tokens || 0) + critic.cached
      const totalOut = (usageRow.output_tokens || 0) + critic.output
      const { error: updErr } = await supabase.from('spar_usage').update({
        input_tokens: totalIn,
        cached_tokens: totalCached,
        output_tokens: totalOut,
        cost_usd: protoCostUsd(PROTOTYPE_MODEL, totalIn, totalCached, totalOut),
        meta: {
          ...(usageRow.meta as Record<string, unknown> || {}),
          critic: criticStatus,
          html_bytes: finalLen,
          critic_ms: Date.now() - startedAt,
        },
      }).eq('id', usageRow.id)
      if (updErr) console.error('[spar-prototype] critic usage update error:', updErr)
    }
    console.log(`[spar-prototype] critic ${criticStatus} ${sessionId} ${finalLen}B ${Date.now() - startedAt}ms`)
  } catch (err) {
    console.error('[spar-prototype] critic ERROR:', err instanceof Error ? err.message : String(err))
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, corsHeaders)

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const ADMIN_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_SECRET) {
      console.error('[spar-prototype] brak konfiguracji')
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

    // ── action 'status': frontend poll o gotowy URL ──
    if (body.action === 'status') {
      const viewUrl = await latestPrototypeUrl(supabase, sessionId)
      return jsonResponse({ viewUrl: viewUrl || null }, 200, corsHeaders)
    }

    // ── action 'critic': pass 2 w osobnej inwokacji ──
    if (body.action === 'critic') {
      if (!isAdmin) return jsonResponse({ error: 'brak_dostepu' }, 401, corsHeaders)
      const path = (body.path || '').trim()
      const file = path.split('/').pop() || ''
      if (path !== `spar/${sessionId}/${file}` || !/^prototyp-\d{10,16}\.html$/.test(file)) {
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
      .select('id, preview_brief, preview_images, verdict')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError) {
      console.error('[spar-prototype] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, corsHeaders)
    const brief = session.preview_brief as Record<string, unknown> | null
    if (!brief) return jsonResponse({ error: 'brak_projektu' }, 400, corsHeaders)
    if (!isAdmin && session.verdict !== 'zielony') {
      return jsonResponse({ error: 'brak_werdyktu' }, 400, corsHeaders)
    }

    // Istniejący prototyp wraca bez generacji (powrót na czystym urządzeniu;
    // wyścig ensure* paliłby ~$0.45/wywołanie). Reroll wymusza tylko admin.
    if (!isAdmin) {
      const existing = await latestPrototypeUrl(supabase, sessionId)
      if (existing) return jsonResponse({ status: 'exists', viewUrl: existing }, 200, corsHeaders)
    }

    const { count: protoCount, error: countErr } = await supabase
      .from('spar_usage')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('kind', 'prototype')
    if (countErr) {
      console.error('[spar-prototype] usage count error:', countErr)
    } else if ((protoCount ?? 0) >= MAX_PROTOTYPES_PER_SESSION) {
      return jsonResponse({ error: 'limit_prototypow' }, 429, corsHeaders)
    }

    // Lock — reload/drugi tab nie odpala duplikatu (~$0.55/budowa)
    const { data: genLock } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'prototype', p_ttl_sec: 480 })
    if (!genLock) return jsonResponse({ status: 'pending' }, 202, corsHeaders)

    // Limit dzienny per IP (wzorzec spar-image/landing)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    if (!isAdmin && ip) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ipSessions, error: ipErr } = await supabase
        .from('spar_sessions')
        .select('id')
        .eq('ip', ip)
      if (ipErr) {
        console.error('[spar-prototype] ip sessions query error:', ipErr)
      } else if (ipSessions && ipSessions.length) {
        const { count: ipCount, error: ipUsageErr } = await supabase
          .from('spar_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'prototype')
          .in('session_id', ipSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (ipUsageErr) {
          console.error('[spar-prototype] ip usage count error:', ipUsageErr)
        } else if ((ipCount ?? 0) >= MAX_PROTOTYPES_PER_IP_PER_DAY) {
          return jsonResponse({ error: 'limit_prototypow_dzienny' }, 429, corsHeaders)
        }
      }
    }

    const screens = appScreenUrls(session.preview_images as Record<string, unknown> | null)

    const ts = Date.now()
    const storagePath = `spar/${sessionId}/prototyp-${ts}.html`
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
    const viewUrl = `https://tomekniedzwiecki.pl/aplikacja/podglad/?sid=${sessionId}&t=${ts}&k=prototyp`

    const task = generateAndStore(supabase, OPENAI_API_KEY, sessionId, brief, screens, storagePath, viewUrl)
    // deno-lint-ignore no-explicit-any
    const runtime = (globalThis as any).EdgeRuntime
    if (runtime?.waitUntil) runtime.waitUntil(task)
    else task.catch(() => {})

    return jsonResponse({ status: 'started', viewUrl, url: pub?.publicUrl || null, path: storagePath, model: PROTOTYPE_MODEL }, 202, corsHeaders)
  } catch (error) {
    console.error('[spar-prototype] ERROR:', error instanceof Error ? error.message : String(error))
    return jsonResponse({ error: 'blad_serwera' }, 502, corsHeaders)
  }
})
