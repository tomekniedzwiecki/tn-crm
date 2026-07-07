// bud-landing-gen — kompletny LANDING HTML (one-product store) dla wybranego produktu,
// generowany przez gpt-5.5 (multimodal: na bazie wygenerowanego MOCKUPU jako referencji wizualnej).
// Self-contained (inline CSS), po polsku, COD/gwarancja. Cache per-PRODUKT, generowanie w TLE.
// ⚠️ DEPLOY: --no-verify-jwt.
// POST { sessionId, product, mockup_url?, force? } -> { landing_html } | { pending:true }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl', 'https://www.tomekniedzwiecki.pl', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500']
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODEL = Deno.env.get('BUD_LANDING_MODEL') || 'gpt-5.5'
const MAX_OUT = 32000
// T1: capy anty-nadużycie (wzorzec bud-mockup/bud-raport). To NAJDROŻSZA generacja lejka
// (~1 USD: 4× lifestyle + spec + HTML gpt-5.5) i dotąd JEDYNA bez limitów — pętla force=true
// z curla paliła realne $ bez ograniczeń. Marker = wpis 'landing-attempt' (start generacji
// po claimie locka), więc cache-hit NIE liczy się do limitu, a pętla z padającym OpenAI TAK.
const MAX_LANDINGS_PER_SESSION = parseInt(Deno.env.get('BUD_LANDING_MAX_PER_SESSION') || '3', 10)
const MAX_LANDINGS_PER_IP_PER_DAY = parseInt(Deno.env.get('BUD_LANDING_IP_DAILY') || '6', 10)
function json(b: Record<string, unknown>, s: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...c, 'Content-Type': 'application/json' } })
}
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()

// fetch z twardym timeoutem — generate-image (gpt-image-2) potrafi wisieć (wzorzec bud-mockup).
// Bez tego JEDEN zawieszony obraz lifestyle trzyma prewarm dłużej niż TTL locka 'lifestyle'
// (300 s) → główna generacja przejmuje lock i DUBLUJE koszt, a spóźniony prewarm zwalnia
// cudzy lock (audyt regresji 2026-07-02 #1).
async function fetchTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try { return await fetch(url, { ...init, signal: ctrl.signal }) }
  finally { clearTimeout(t) }
}

// deno-lint-ignore no-explicit-any
function prompt(product: any, ust: any, snap: any, images: string[], lifestyle: string[] = [], styleBrief = '', styleLabel = '', logoUrl = '', brandName = '', mockupSpec = ''): string {
  // Polska nazwa produktu (radar) ma PIERWSZEŃSTWO — snap.title to angielski tytuł aukcji,
  // który wchodził do copy strony (a przy snapshotach 'search' bywał INNYM produktem).
  const name = String(product?.nazwa || product?.name || snap?.title || 'produkt').slice(0, 160)
  const cat = String(product?.kategoria || product?.category || '').slice(0, 60)
  const dla = String(ust?.dla_kogo || '').slice(0, 240)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 240)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const brand = String(ust?.nazwa || ust?.brand || '').slice(0, 80)
  const haslo = String(ust?.haslo || '').slice(0, 120)   // hasło wybrane/wpisane przez klienta w rozmowie (sprawczość)
  const korz = Array.isArray(ust?.korzysci) ? ust.korzysci.slice(0, 6).join('; ') : (Array.isArray(ust?.korzyści) ? ust.korzyści.slice(0, 6).join('; ') : '')
  const imgList = (images || []).slice(0, 6)
  // Autor opinii NIGDY „AliExpress Shopper"/marketplace/„Buyer" — pusty => model dorobi polski inicjał.
  const cleanName = (n: unknown): string => {
    const s = (typeof n === 'string' ? n : '').trim()
    if (!s || /aliexpress|ali\s*express|shopper|\bbuyer\b|marketplace|customer|покуп|^user[\s_]?\d/i.test(s)) return ''
    return s
  }
  // REALNE opinie + statystyki z AliExpress (ze snapshotu) — wiarygodność.
  // deno-lint-ignore no-explicit-any
  const reviews = (snap && Array.isArray((snap as any).reviews)) ? (snap as any).reviews.slice(0, 20) : []
  // deno-lint-ignore no-explicit-any
  const revPhoto = reviews.filter((r: any) => r.images && r.images[0]).slice(0, 12)
  // deno-lint-ignore no-explicit-any
  const revText = reviews.filter((r: any) => !(r.images && r.images[0])).slice(0, 5)
  const rstats = (snap && (snap as any).review_stats) || null
  const statsLine = rstats && rstats.avg
    ? `STATYSTYKI OPINII (REALNE z AliExpress — użyj DOKŁADNIE tych liczb w pasku ocen hero i pasku social-proof): ocena ${String(rstats.avg).replace('.', ',')}/5, ${rstats.numRatings || 0} ocen${rstats.positivePct ? `, ${String(rstats.positivePct).replace('.', ',')}% pozytywnych` : ''}. Procent pozytywnych ma być SPÓJNY z liczbą ocen — przy małym n unikaj ułamkowego % (zamiast „94,1% z 52" napisz „49 z 52 osób poleca"). Tej samej liczby ocen/% nie powtarzaj więcej niż 2×.`
    : `STATYSTYKI OPINII: brak realnych — użyj wiarygodnych przykładowych (★ ~4,7/5) z dopiskiem, że klient podmieni.`
  const reviewsBlock = (revPhoto.length || revText.length)
    ? `OPINIE ZE ZDJĘCIEM (REALNE — to RDZEŃ sekcji opinii; ZDJĘCIE KLIENTA jest BOHATEREM kafla, tekst to krótki podpis pod/na zdjęciu):\n${revPhoto.map((r: any, i: number) => `F${i + 1}. zdjecie=${r.images[0]} | ${r.stars || 5}★ | ${cleanName(r.name)} | "${String(r.text_pl || r.text || '').slice(0, 150)}"`).join('\n')}${revText.length ? `\nOPINIE TEKSTOWE (REALNE — dodatkowe, mniejsze cytaty POD ścianą zdjęć):\n${revText.map((r: any, i: number) => `T${i + 1}. ${r.stars || 5}★ ${cleanName(r.name)}: "${String(r.text_pl || r.text || '').slice(0, 160)}"`).join('\n')}` : ''}`
    : `OPINIE: brak realnych — wygeneruj wiarygodny szablon (kilka kafli ze zdjęciem-placeholderem + tekst).`
  return `Jesteś elitarnym front-end developerem i copywriterem direct-response, specjalizującym się w WYSOKOKONWERTUJĄCYCH stronach jednoproduktowych w stylu topowych marek DTC z USA. Zbuduj KOMPLETNĄ, produkcyjnie bliską stronę sprzedażową dla „${name}"${cat ? ` (kategoria: ${cat})` : ''} na rynek polski. CEL NADRZĘDNY: maksymalna skuteczność sprzedaży tego JEDNEGO produktu — każdy element ma popychać do zakupu.

USTALENIA (fundament copy — trzymaj się ściśle):${brand ? `\n- Marka: ${brand}` : ''}${dla ? `\n- Dla kogo: ${dla}` : ''}${kat ? `\n- Kąt/wyróżnik: ${kat}` : ''}${ton ? `\n- Ton: ${ton}` : ''}${korz ? `\n- Korzyści: ${korz}` : ''}${haslo ? `\n- HASŁO OD KLIENTA (jego własne słowa — świętość): „${haslo}"` : ''}

${logoUrl ? `LOGO MARKI (GOTOWE): użyj DOKŁADNIE tego URL jako logo na górze strony (header/hero) — <img src="${logoUrl}" alt="${brandName || 'logo marki'}" style="height:38px;width:auto"> . NIE generuj innego logo i NIE pisz samej nazwy zamiast logo; to oficjalne logo marki${brandName ? ` „${brandName}"` : ''}.\n\n` : (brandName || brand) ? `NAZWA MARKI (BEZ GOTOWEGO LOGO): w headerze na górze strony pokaż nazwę „${brandName || brand}" jako WORDMARK — wyrazisty tekstowy logotyp (mocny font/akcent spójny ze stylem makiety), traktowany jak logo marki; NIE zostawiaj headera bez marki. Powtórz nazwę dyskretnie przy domknięciu strony.\n\n` : ''}ZDJĘCIA DO UŻYCIA (jako <img src="..." loading="lazy">; NIE wymyślaj innych URL-i). Masz DWA rodzaje — używaj ich ZGODNIE Z PRZEZNACZENIEM, oszczędnie, żeby strona wyglądała jak prawdziwa marka, nie „wygenerowana AI":
${lifestyle.length ? `• LIFESTYLE (fotorealistyczne, produkt w realnej scenie; masz ich ${lifestyle.length}) — ROZŁÓŻ po jednym na RÓŻNE sekcje: HERO, „jak działa / w użyciu", demonstracja/efekt oraz lifestyle „w codzienności". Użyj WSZYSTKICH dostępnych, NIE wrzucaj dwóch w to samo miejsce (to one budują pożądanie):\n${lifestyle.map((u, i) => `   L${i + 1}. ${u}`).join('\n')}` : ''}
${imgList.length ? `• PRODUKT (realne zdjęcia z AliExpress — DOKŁADNY wygląd produktu) — wstaw tam, gdzie pokazujesz SAM produkt: sekcja produktu, „przed/po", tabela porównania, dowód:\n${imgList.map((u, i) => `   P${i + 1}. ${u}`).join('\n')}` : '(brak realnych zdjęć — użyj placeholderów [ Zdjęcie: … ])'}
ZASADA OBRAZÓW: nie wrzucaj zdjęcia do każdej sekcji — sekcje korzyści/porównania/FAQ działają lepiej na ikonach/tekście. WYKORZYSTAJ wszystkie ujęcia LIFESTYLE (L*, do 4) — po jednym na hero, „jak działa", demonstrację/efekt i sekcję lifestyle „w codzienności". Realne foto (P*) do prezentacji SAMEGO produktu + mini-galeria. Dozwolona MINI-GALERIA produktu (PDP): w sekcji produktu możesz pokazać 3-4 realne zdjęcia P* jako siatkę miniatur (klikalne na powiększenie przez :target, bez JS) — to NIE wlicza się do limitu obrazów scenicznych; pokazuje DOKŁADNY wygląd tego, co klient dostanie. Realne zdjęcia P* z AliExpress wyświetlaj w kontenerach z ustaloną proporcją i max-width:100% — NIE ładuj pełnej rozdzielczości do małych miniatur.
WYDAJNOŚĆ OBRAZÓW (ważne dla szybkości/LCP): obraz HERO (1.) ładuj NATYCHMIAST — loading="eager" fetchpriority="high"; KAŻDY pozostały <img> ma loading="lazy", decoding="async" oraz ustaloną proporcję/wymiary (width+height albo aspect-ratio w CSS), żeby nie było przeskoku layoutu (CLS). Skaluj obrazy CSS-em do realnego rozmiaru kontenera (max-width:100%; height:auto) — NIE wyświetlaj wielkich zdjęć w małych ramkach. Nie dodawaj ciężkich teł-obrazów. (Podane URL-e LIFESTYLE są już zoptymalizowane do webp — używaj ich bez zmian.)

${statsLine}
${reviewsBlock}

WIERNOŚĆ WIZUALNA DO MAKIETY (KRYTYCZNE): ${product?.__hasMockup ? `Do wiadomości dołączony jest OBRAZ ZATWIERDZONEJ MAKIETY. ODWZORUJ go 1:1 w HTML/CSS: odczytaj i użyj DOKŁADNIE tej palety (kolory jako hex), tej typografii (charakter nagłówków i treści), tego stylu i kształtu przycisków, zaokrągleń, odstępów, nastroju i układu sekcji. Strona ma wyglądać jak ta makieta ożywiona w kodzie — NIE jak inny szablon.${styleBrief ? `\nSTYLE BRIEF (po angielsku — AUTORYTET PALETY, TYPOGRAFII i NASTROJU dla stylu „${styleLabel}"; użyj DOKŁADNIE wymienionych kolorów i charakteru fontów, a gdy podane są hexy — użyj ich 1:1; to instrukcja dla Ciebie, NIE wstawiaj angielskiego do widocznego copy): ${styleBrief}` : ''}${mockupSpec ? `\nSPEC ODCZYTANY Z MAKIETY (TWARDY — użyj DOKŁADNIE tych hexów palety, tej kolejności sekcji i tych motywów; bezpośredni odczyt z obrazu, ma PRIORYTET przy palecie/typografii/układzie): ${mockupSpec}` : ''}\nMOTYWY DEKORACYJNE — odwzoruj CZYSTYM CSS te, które SĄ WIDOCZNE na makiecie (nie dodawaj na siłę, gdy ich nie ma): (a) zdjęcia w ramkach polaroid (biała ramka, lekki obrót, podpis kursywą) jako galeria, gdy makieta ma ich kilka; (b) naklejki/odznaki jak przyklejone stickery przez ::before/::after; (c) subtelny „film grain" przez malutki noise PNG data-URI z background-repeat (NIGDY animowany feTurbulence — kosztowny na mobile); (d) faliste przejścia między sekcjami przez inline SVG path lub clip-path.` : 'Dobierz spójną, premium paletę i typografię dopasowaną do tonu marki; jeden wyrazisty kolor akcentu na CTA.'}

STRUKTURA KONWERSYJNA (kolejność sekcji; każda ma zadanie sprzedażowe):
0. GÓRNY PASEK OGŁOSZENIOWY (cienki pasek na samej górze, nad headerem, pełna szerokość, kontrastowy akcent): 1 krótki UCZCIWY komunikat zaufania („Płatność przy odbiorze · 14 dni na zwrot" albo „Znany z TikToka"). BEZ pilności i obietnic dostawy. Statyczny OK; delikatne przewijanie 2-3 haseł czystym CSS dozwolone.
0a. HEADER (pasek marki, pod paskiem ogłoszeniowym, sticky lub statyczny): ZAWSZE pokaż markę — logo (jeśli podane) albo wyrazisty WORDMARK z nazwą. OBOWIĄZKOWY nawet przy skąpych ustaleniach; gdy brak nazwy — krótka, spójna z tonem (NIE „Sklep"). Bez menu i linków wyprowadzających; opcjonalnie dyskretne ★ ocena albo ikona COD po prawej.
1. STICKY DOLNY PASEK CTA (position:fixed na dole, zawsze widoczny zwł. na mobile): cena + przycisk „Kup teraz". KRYTYCZNE — klient nigdy nie szuka przycisku.
2. HERO (test 3 sekund): ${haslo ? `NAGŁÓWEK h1 = HASŁO KLIENTA „${haslo}" — użyj 1:1 albo z MINIMALNĄ korektą (interpunkcja/szyk), zachowując jego słowa i sens; wolno dopisać krótki podtytuł-wyróżnik. NIE zastępuj hasła własnym pomysłem. ` : ''}nagłówek = KORZYŚĆ/transformacja, nie nazwa produktu (wzór „[efekt] — [wyróżnik]", ≤12 słów); w h1 CO NAJMNIEJ JEDEN człon opisuje konkretne DZIAŁANIE produktu (np. ściskasz / wraca powoli / mierzy / świeci), nie wyłącznie stan emocjonalny — unikaj triady samych uczuć („odstresuj / poczuj ulgę / zrelaksuj"). 1 zdanie podtytułu; DUŻE realne zdjęcie produktu (najlepiej w użyciu); JEDEN kontrastowy przycisk „Kup teraz"; pod nim mikrocopy „płatność przy odbiorze · 14 dni na zwrot"; widoczna cena; pasek ocen ★★★★★ z REALNYMI statystykami opinii (patrz STATYSTYKI OPINII wyżej).
3. PASEK SOCIAL PROOF (zaraz pod hero): ★ ocena + liczba ocen (z realnych statystyk wyżej) + % pozytywnych. Zamiast twardego „viralowy hit" bez dowodu — dyskretna ODZNAKA „Znany z TikToka" (inline SVG TikToka + 1 linijka, BEZ zmyślonych liczb wyświetleń), wyglądająca jak odznaka mediów, nie zwykły tekst. Używaj REALNYCH liczb, nie wymyślaj.
3a. PASEK ZAUFANIA — IKONY (osobny wąski strip pod paskiem ocen, równy rząd 3-4 kafelków inline SVG + krótki podpis): (1) paczka/kurier — „Płatność przy odbiorze"; (2) strzałka zwrotu — „14 dni na zwrot"; (3) kłódka/tarcza — „Bezpieczna płatność"; (4) ogień/TikTok — „Hit z TikToka". To OSOBNA sekcja-pasek, NIE tekst w hero. BEZ obietnic dostawy czasowej.
4. PROBLEM → ROZWIĄZANIE: nazwij ból odbiorcy (z ustaleń), pokaż produkt jako rozwiązanie.
5. KORZYŚCI (3-4 — KORZYŚĆ, nie cecha; inline SVG ikony): co klient ZYSKUJE.
6. JAK DZIAŁA — 3 KROKI (ponumerowane 1·2·3, każdy z inline SVG ikoną i 1 krótkim zdaniem; OSTATNI krok = WYNIK, nie akcja, np. „Rozpakuj" → „Ściśnij" → „Ciesz się efektem") + realne zdjęcie lifestyle. Trzy kroki to standard; 2 tylko gdy produkt naprawdę banalny.
6b. DEMONSTRACJA / EFEKT (gdy produkt ma widoczny rezultat i NIE jest z kategorii wrażliwej): pokaż działanie wizualnie — „przed/po" lub kadr w akcji (realne P*/lifestyle) + krótki podpis, co się zmienia. ZAKAZ before/after dla kategorii wrażliwych (zdrowie, suplementy, kosmetyki, odchudzanie, dzieci, intymne) — tam tylko produkt w użyciu, bez sugerowania efektu zdrowotnego.
6a. O MARCE (krótka historia — buduje zaufanie i odróżnia od anonimowego dropshipu): 2-4 zdania o tym, dlaczego ta marka${brand || brandName ? ` „${brand || brandName}"` : ''} powstała i dla kogo (na bazie kąta/tonu z ustaleń). Wiarygodnie i konkretnie, BEZ zmyślonych faktów, liczb sprzedaży, dat i nazwisk. Spójny ton; nazwa marki użyta konsekwentnie zamiast generycznej nazwy produktu.
7. PORÓWNANIE „nasza marka vs anonimowy odpowiednik z Allegro/Amazon" (2 kolumny/tabela: jakość, gwarancja, wsparcie, marka) — BEZ oczerniania konkretnych firm. Kolumna „nasza marka" MUSI mieć min. 1 wyróżnik KONKRETNY/mierzalny (nie tylko ✓ vs ×); kolumna „zwykły odpowiednik" opisuje cechy KATEGORII, nie nazwanego sprzedawcy; nie używaj „zależy od sprzedawcy" jako jedynego argumentu.
8. OPINIE (dowód społeczny — RDZEŃ strony). AUTOR opinii NIGDY nie może być „AliExpress Shopper", nazwą marketplace'u ani „Buyer/Shopper" — podpisuj polskim imieniem + inicjałem (np. „Ola K.", „Kuba, 17 lat"); opinie mają mówić o DOŚWIADCZENIU z produktem (jak działa, wrażenie, użycie), nie generyczne „jakość ok"; pomijaj opinie sprzeczne logistycznie. DOBÓR FORMY (dopasuj do makiety i realnych danych): jeśli makieta pokazuje KARTY TEKSTOWE opinii (cytat + imię) → zrób 3-4 czytelne KARTY TEKSTOWE w stylu/kolorach makiety jako formę GŁÓWNĄ. ŚCIANĘ ZDJĘĆ w stylu Loox/Judge.me (zdjęcie klienta = bohater kafla) stosuj jako formę główną TYLKO gdy (a) makieta pokazuje siatkę zdjęć klientów, LUB (b) masz ≥3 realne opinie ZE ZDJĘCIEM. Gdy realnych zdjęć jest mniej niż 3 — NIE buduj ściany pustych placeholderów, użyj kart tekstowych z realnych opinii. Cytaty truncuj zawsze na granicy słowa z wielokropkiem, nigdy w połowie wyrazu. Gdy JEDNAK budujesz ścianę zdjęć, trzymaj się zasad:
   • GŁÓWNY element to SIATKA DUŻYCH ZDJĘĆ KLIENTÓW (z listy „OPINIE ZE ZDJĘCIEM"). Każdy kafel: zdjęcie klienta WYPEŁNIA kafel (aspect-ratio 3:4 lub 1:1, object-fit:cover, zaokrąglone rogi) i ZAJMUJE ~75% kafla. Na dole zdjęcia półprzezroczysty gradient, a na nim (albo tuż pod) MAŁE: ★ gwiazdki + JEDNA linijka cytatu (truncate) + zamaskowane imię + „✓ zweryfikowany zakup". ZDJĘCIE DOMINUJE, tekst jest dodatkiem. Siatka: 2 kolumny na mobile, 3-4 na desktopie, drobny gap — efekt „ściany zdjęć od klientów".
   • Klik w kafel → LIGHTBOX BEZ JS, techniką CSS „:target": kafel to <a href="#rev-N">, a osobny <div id="rev-N" class="lb"> (ukryty) pokazuje się przez regułę .lb:target{display:flex}. W lightboxie: duże zdjęcie + PEŁNY tekst opinii + gwiazdki + imię + „✓ zweryfikowany zakup"; zamknięcie to <a href="#" class="lb-close">✕</a> i klik w tło. Każda opinia ze zdjęciem ma swój #rev-N. ZERO JavaScriptu — wyłącznie CSS :target.
   • POD ścianą zdjęć: 3-4 mniejsze cytaty TEKSTOWE (z listy „OPINIE TEKSTOWE") jako uzupełnienie — drobniejsze, drugorzędne.
   • Użyj DOKŁADNIE realnych zdjęć (pole zdjecie=URL), realnych tekstów i zamaskowanych imion z list wyżej. Każde <img> opinii: loading="lazy" decoding="async". NIE wymyślaj zdjęć ani opinii. Gdy brak realnych — analogiczna ściana z placeholderami.
   • POKAŻ WSZYSTKIE realne opinie ZE ZDJĘCIEM z listy (do ~8-10 kafli) — to NAJMOCNIEJSZY social proof, NIE ucinaj ich do kilku. Dopiero gdy realnych zdjęciowych jest mniej niż 6, UZUPEŁNIJ siatkę kafelkami z placeholderem-zdjęciem ([ Zdjęcie klienta ]) w spójnym stylu, by ściana wyglądała pełna (min. 6-8 kafli). Realne opinie ZAWSZE jako pierwsze; placeholderów NIE podpisuj zmyślonym cytatem ani gwiazdkami udającymi realną recenzję.
9. RISK-REVERSAL / GWARANCJA przy CTA (z pieczęcią/badge): płatność przy odbiorze (płacisz, gdy kurier przywiezie — zero ryzyka z góry) + 14 dni na zwrot + ikony bezpiecznej płatności. To NASZ najmocniejszy, uczciwy atut — wyeksponuj.
9a. ZESTAW / OSZCZĘDNOŚĆ (opcjonalnie, gdy ma to sens dla produktu): zaproponuj UCZCIWY pakiet (np. 2+1, zestaw rodzinny/na prezent) z realną korzyścią i delikatnym oznaczeniem „najczęściej wybierany". Każdy multi-pack MUSI mieć REALNĄ oszczędność: cena ZA SZTUKĘ w zestawie niższa niż przy 1 szt., pokazana jawnie (np. „2 szt. = 119 zł zamiast 139,98 — oszczędzasz 21 zł"). ZAKAZ zestawu będącego dokładną wielokrotnością ceny jednostkowej (2× = 2×cena nie daje powodu do zakupu większej ilości). ZAKAZ fałszywych przekreślonych cen i presji czasowej — rabat MUSI być prawdziwy i policzalny. Każdy wariant zestawu z własnym CTA.
10. FAQ (5-6) — rozbij realne obiekcje (czy pasuje/jak działa, jak płacę, zwrot, wysyłka, dla kogo).
11. KOŃCOWE CTA: powtórz korzyść + cena + co w zestawie + „Kup teraz / Zamów za pobraniem" + mikrocopy zaufania. Ta sekcja MUSI mieć id="zamow" (cel wszystkich CTA na stronie).
12. STOPKA (domknięcie marką): logo/wordmark + 1 krótka linijka spójna z tonem + drobne „© [rok] [nazwa marki]". ZERO menu, ZERO linków wyprowadzających.

ZASADY KONWERSJI:
- Korzyści ZAWSZE przed cechami; copy direct-response (hak → ból → rozwiązanie → dowód → CTA).
- WSZYSTKIE przyciski CTA to linki do kotwicy: <a href="#zamow" data-cta="kup" class="...">Kup teraz</a> (href docelowy podmienimy na adres kasy). ZAKAZ href="#" (skok na górę / martwy link). Sticky pasek też linkuje do #zamow. Ustal JEDEN dominujący tekst głównego CTA (np. „Zamawiam za pobraniem") i powtarzaj go konsekwentnie; inny tekst tylko gdy realnie wybiera inny wariant produktu.
- ZERO nawigacji/menu i ZERO linków wyprowadzających; jedyne klikalne = CTA. Stopka DOZWOLONA wyłącznie jako domknięcie marką (logo/nazwa + 1 linijka + „© rok marka") — BEZ menu i BEZ linków.
- Trust layering: 2-3 sygnały zaufania nad foldem, kilka w środku, 2-3 przy końcowym CTA. CTA mocno kontrastowy.
- JĘZYK: wszystkie nagłówki, h2/h3 sekcji, stickery, nazwy zestawów, lista „w zestawie" i znacznik <title> PO POLSKU. Anglicyzmy tylko jako pojedyncze wtręty slangowe w polskim zdaniu (np. „viral", „ASMR"). ZAKAZ angielskich nagłówków, kalek „Idealny gift" (pisz „Idealny prezent"), „Butter stick squishy" jako nagłówka; w <title>/nagłówkach/„w zestawie" używaj WŁASNEJ nazwy produktu marki, nie katalogowego deskryptora kategorii.
- COPY: 2. osoba („Ty/Twój", nie „my/nasz"); liczby zamiast przymiotników („26 sekund", nie „bardzo szybko"); maks 1 „poetycki" obraz na sekcję, reszta = konkret sensoryczny/funkcjonalny. Zakazane wytrychy (zamień na konkret): innowacyjny, najwyższa jakość, profesjonalny, kompleksowy, rozwiązanie. ZAKAZ aforyzmu-podpisu w italic, który nie mówi nic konkretnego o produkcie.
- BUDŻET LICZB: maks ~8-12 konkretnych liczb na całą stronę, ≥3 sekcje „oddechowe" bez metryk (ta sama powtórzona liczba liczy się raz) — nadmiar liczb robi stronę ciężką.

TWARDE ZAKAZY (marka Tomka):
- ZAKAZ zmyślonej pilności: żadnych liczników odliczających, „tylko dziś", „zostały 2 sztuki".
- ZAKAZ „dostawa w 24h" i „magazyn w Polsce" (sygnał dropshipu) — pisz neutralnie „wysyłka pod Twój adres".
- Opinie to szablon do podmiany na realne (nie udawaj, że to zweryfikowane recenzje). Bez „pewnego zysku"/gwarantowanych efektów.
- KATEGORIE WRAŻLIWE (zdrowie, suplementy, kosmetyki, „odchudzanie/wyszczuplanie", produkty dla dzieci, intymne): ZERO obietnic efektów zdrowotnych/leczniczych i medycznych — żadnych „leczy/wyleczy/gwarantowane rezultaty/-X kg/w tydzień". Mów o komforcie użytkowania i cechach produktu, nie składaj obietnic wyników. Bezpieczeństwo prawne ważniejsze niż mocniejszy nagłówek.

TECHNICZNE:
- Jeden plik HTML, SELF-CONTAINED: cały CSS w <style>, ZERO JavaScriptu i zero zewnętrznych bibliotek/fontów (system fonts). Dobierz rodzinę SYSTEMOWĄ pod charakter ze STYLE BRIEF: dla stylów retro/playful/rounded użyj zaokrąglonej (font-family: ui-rounded, "SF Pro Rounded", system-ui) i NIE używaj Georgia/Times (editorial vibe kłóci się z retro); serif systemowy tylko gdy brief mówi o elegancji/editorial. Sticky CTA i lightbox opinii realizujesz CZYSTYM CSS (position:fixed; lightbox przez :target). Mobile-first, lekka i szybka. Inline SVG do ikon.
- INTERAKTYWNOŚĆ: elementy klikalne (summary, .btn, każde a[data-cta], kafel opinii) MUSZĄ mieć cursor:pointer; ZAKAZ cursor:default na <summary> (FAQ ma wyglądać na rozwijane).
- KONTRAST: tekst pomocniczy na ciemnym tle min. 4.5:1 — nie schodź poniżej rgba(255,255,255,.72) dla treści czytanej (komórki tabel, podpisy).

Zwróć WYŁĄCZNIE kod HTML (od <!DOCTYPE html> do </html>), bez komentarzy przed/po, bez bloków \`\`\`.`
}

// Generuje do 4 fotorealistycznych ujęć LIFESTYLE produktu (gpt-image-2, równolegle) z WIELOMA
// zdjęciami referencyjnymi z AliExpress (wierność produktu). Tylko kontekst/użycie/emocja —
// detal produktu zostaje na realnych zdjęciach Ali. Null gdy się nie uda (HTML i tak ma realne foto).
// deno-lint-ignore no-explicit-any
async function genLifestyle(SUPABASE_URL: string, CRON: string, refUrls: string[], product: any, ust: any): Promise<string[]> {
  const refs = (refUrls || []).filter(Boolean).slice(0, 4).map((u) => ({ url: u, type: 'product' as const }))
  if (!refs.length || !CRON) return []
  const name = String(product?.name || product?.nazwa || '').slice(0, 100)
  const dla = String(ust?.dla_kogo || 'codzienny użytkownik').slice(0, 140)
  const kat = String(ust?.kat || ust?.kąt || '').slice(0, 160)
  const base = `Fotorealistyczne zdjęcie produktowe LIFESTYLE. Pokaż DOKŁADNIE ten produkt z obrazów referencyjnych (ten sam kształt, kolor, zestaw) — nie zmieniaj go, nie wymyślaj wariantu. Produkt: ${name}. Naturalne światło, realna codzienna scena, estetyka jak prawdziwa sesja zdjęciowa marki e-commerce (NIE render 3D, NIE grafika AI, bez tekstu/logo/znaków wodnych/ramek).`
  const scenes = [
    `${base} Ujęcie HERO: produkt w użyciu przez odbiorcę (${dla}) w atrakcyjnym, aspiracyjnym kontekście — tak, by od razu było widać korzyść. Kadr czysty, miejsce na nałożenie nagłówka.`,
    `${base} Ujęcie „w użyciu / jak działa": produkt w działaniu, z bliska w realnym kontekście pokazującym jego rolę${kat ? ` (${kat})` : ''}. Detal sceny, autentycznie.`,
    `${base} Ujęcie LIFESTYLE „w codzienności": produkt naturalnie wpleciony w zwykłą scenę z życia odbiorcy (${dla}) — np. na biurku, w torbie, na stoliku, wśród codziennych przedmiotów. Ma wyglądać, jakby już należał do tego świata.`,
    `${base} Ujęcie EMOCJA/EFEKT: ludzki, bliski kadr (dłonie / uśmiech / reakcja) pokazujący przyjemność lub rezultat z użycia produktu${kat ? ` (${kat})` : ''}, ciepły nastrój — bez przesady, autentycznie.`,
  ]
  const one = async (scenePrompt: string): Promise<string | null> => {
    try {
      const r = await fetchTimeout(`${SUPABASE_URL}/functions/v1/generate-image`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON },
        body: JSON.stringify({ prompt: scenePrompt, provider: 'gpt-image-2', quality: 'medium', aspect_ratio: '1:1', type: 'lifestyle', count: 1, reference_images: refs }),
      }, 110_000)
      if (!r.ok) { console.error('[bud-landing-gen] lifestyle HTTP', r.status); return null }
      const d = await r.json().catch(() => null)
      const u = d?.images?.[0]?.url
      return (u && typeof u === 'string' && !u.startsWith('data:')) ? u : null
    } catch (e) { console.error('[bud-landing-gen] lifestyle err', e); return null }
  }
  const res = await Promise.all(scenes.map(one))
  // OPTYMALIZACJA WAGI: surowe PNG z gpt-image-2 to ~1,4 MB — zabójcze dla LCP.
  // Serwujemy przez Supabase render API (resize + kompresja + webp) → ~40-60 KB.
  return res.filter((u): u is string => !!u).map((u) => optimizeImg(u, 1100, 72))
}

// Storage public URL → render (resize+quality+webp). resize=contain (sam width tnie boki).
function optimizeImg(url: string, w = 1000, q = 72): string {
  if (typeof url === 'string' && url.includes('/storage/v1/object/public/')) {
    const sep = url.includes('?') ? '&' : '?'
    return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `${sep}width=${w}&quality=${q}&resize=contain`
  }
  return url
}

// T10: alert #sparing przy definitywnej porażce generacji (wzorzec 1:1 z bud-image).
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) { console.error('[bud-landing-gen] slack-notify: brak SUPABASE_URL/KEY'); return }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[bud-landing-gen] slack-notify ${type} HTTP`, res.status, await res.text())
  } catch (err) {
    console.error(`[bud-landing-gen] slack-notify ${type} exception:`, err)
  }
}

// Publiczny podgląd sklepu = wrapper /sklep/podglad/ na NASZEJ domenie (tomekniedzwiecki.pl),
// który fetchem pobiera landing_html z edge function bud-shop-preview i renderuje w sandboxowanym
// iframe. Nie da się serwować HTML wprost z *.supabase.co (Storage ORAZ functions wymuszają
// content-type text/plain — anty-XSS → przeglądarka pokazałaby ŹRÓDŁO, nie sklep). URL
// deterministyczny z sid; persystujemy w landing_preview_url (sygnał „gotowe" dla panelu;
// NIE landing_url — ten bramkuje publiczny feed w bud-public-feed!).
// deno-lint-ignore no-explicit-any
async function publishShopPreview(supabase: any, sessionId: string): Promise<string | null> {
  try {
    const url = `https://tomekniedzwiecki.pl/sklep/podglad/?sid=${sessionId}`
    const { error: sErr } = await supabase.from('bud_sessions').update({ landing_preview_url: url }).eq('id', sessionId)
    if (sErr) console.error('[bud-landing-gen] landing_preview_url save error:', sErr)
    return url
  } catch (err) {
    console.error('[bud-landing-gen] publishShopPreview exception:', err)
    return null
  }
}

// Strona sklepu (landing_html) opublikowana → JEDNO powiadomienie #sparing (dedup atomowym
// claimem na slack_html_notified_at — wspólna kolumna z legacy bud-landing, w żywym lejku
// tylko ta funkcja ją stempluje). is_test pomijane. shopUrl = publiczny podgląd sklepu
// (Storage) — klikalny „Zobacz sklep". Panel tn-sklep dostaje ten sam URL (landing_preview_url).
// deno-lint-ignore no-explicit-any
async function maybeNotifyHtmlSlack(supabase: any, sessionId: string, shopUrl: string | null): Promise<void> {
  try {
    const { data: claimed, error } = await supabase
      .from('bud_sessions')
      .update({ slack_html_notified_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('slack_html_notified_at', null)
      .eq('is_test', false)
      .select('id, name, email, phone, brand, preview_brief')
    if (error) { console.error('[bud-landing-gen] html slack claim error:', error); return }
    if (!claimed || !claimed.length) return
    const s = claimed[0] as Record<string, unknown>
    const brand = (s.brand && typeof s.brand === 'object') ? s.brand as Record<string, unknown> : null
    const brief = (s.preview_brief && typeof s.preview_brief === 'object') ? s.preview_brief as Record<string, unknown> : null
    await postSlackSparing('bud_html', {
      session_id: sessionId,
      name: s.name ?? null,
      email: s.email ?? null,
      phone: s.phone ?? null,
      project_name: (brand && typeof brand.chosen_name === 'string' && brand.chosen_name)
        ? brand.chosen_name
        : ((brand && typeof brand.nazwa === 'string' && brand.nazwa) ? brand.nazwa : (brief?.nazwa ?? null)),
      shop_url: shopUrl, // publiczny podgląd sklepu (Storage); null → sam przycisk „Otwórz w panelu"
    })
  } catch (err) {
    console.error('[bud-landing-gen] maybeNotifyHtmlSlack exception:', err)
  }
}

function extractHtml(raw: string): string {
  let t = (raw || '').trim().replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '')
  const s = t.search(/<!doctype html|<html/i)
  const e = t.toLowerCase().lastIndexOf('</html>')
  if (s !== -1 && e !== -1) t = t.slice(s, e + 7)
  return t
}

// FAZA 3 (wierność): vision pre-pass — wyciąga TWARDĄ spec z makiety (paleta hex, kolejność sekcji,
// motywy) PRZED generacją HTML. Deterministycznie zbliża paletę/układ — mocniejsze niż „odczytaj z JPEG"
// w prozie. Tani 1 call (gpt-5.1 vision). Pusty string przy błędzie → degradacja do dotychczasowego.
async function extractMockupSpec(apiKey: string, mockupUrl: string, acc?: { i: number; c: number; o: number }): Promise<string> {
  if (!mockupUrl) return ''
  try {
    const p = `Przeanalizuj tę MAKIETĘ strony sprzedażowej i zwróć ZWIĘZŁY system wizualny do wiernego odtworzenia w HTML/CSS. WYŁĄCZNIE JSON:
{"palette":[{"role":"tlo|cta|tekst|akcent|sekcja","hex":"#RRGGBB"}],"headingFont":"charakter nagłówków (np. bold rounded sans / serif editorial / display grotesk)","bodyFont":"charakter tekstu","cta":{"shape":"pill|rounded|sharp","fill":"#RRGGBB"},"sectionsInOrder":["sekcje WIDOCZNE od góry, krótko"],"motifs":["motywy dekoracyjne WIDOCZNE; puste gdy brak"],"mood":"1 fraza"}
Czytaj DOKŁADNIE z obrazu (kolory jako hex, realne sekcje i motywy). NIE dodawaj tego, czego na makiecie nie ma.`
    // deno-lint-ignore no-explicit-any
    const res = await openaiFetchRetry('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-5.1', input: [{ role: 'user', content: [{ type: 'input_text', text: p }, { type: 'input_image', image_url: mockupUrl }] }], max_output_tokens: 1400 }),
    }, 'bud-landing-gen/spec')
    if (!res.ok) return ''
    const data = await res.json()
    if (acc && data?.usage) { acc.i += data.usage.input_tokens || 0; acc.c += data.usage.input_tokens_details?.cached_tokens || 0; acc.o += data.usage.output_tokens || 0 }
    let text = typeof data?.output_text === 'string' ? data.output_text : ''
    // deno-lint-ignore no-explicit-any
    if (!text) { for (const it of (data?.output || [])) { if (it?.type === 'message' && Array.isArray(it.content)) for (const cc of it.content) if (cc?.type === 'output_text' && typeof cc.text === 'string') text += cc.text } }
    const m = text.match(/\{[\s\S]*\}/)
    return m ? m[0].slice(0, 1500) : ''
  } catch (e) { console.error('[bud-landing-gen] spec err', e); return '' }
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c })
  if (req.method !== 'POST') return json({ error: 'metoda_niedozwolona' }, 405, c)
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
    const CRON = Deno.env.get('SPAR_CRON_SECRET') || ''
    // deno-lint-ignore no-explicit-any
    let body: { sessionId?: string; product?: any; mockup_url?: string; force?: boolean; prewarm?: boolean }
    try { body = await req.json() } catch { return json({ error: 'nieprawidlowy_json' }, 400, c) }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) return json({ error: 'nieprawidlowa_sesja' }, 400, c)

    // Admin/wewnętrzne (x-admin-secret == SPAR_CRON_SECRET) omija owner-gate i capy —
    // prewarm z bud-mockup, rerolle z panelu. Pusty CRON nigdy nie autoryzuje.
    const isAdmin = !!CRON && req.headers.get('x-admin-secret') === CRON

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: session } = await supabase.from('bud_sessions').select('id, auth_user_id, ustalenia, chosen_style, mockups, landing_html, brand, ip, landing_lifestyle').eq('id', sessionId).maybeSingle()
    if (!session) return json({ error: 'nieprawidlowa_sesja' }, 404, c)
    if (!isAdmin) {
      const authUser = await verifyAuthUser(req, supabase)
      if (ownerDenied(session.auth_user_id as string | null, authUser)) return json({ error: 'wymagane_logowanie' }, 403, c)
    }

    // deno-lint-ignore no-explicit-any
    const product: any = (body.product && typeof body.product === 'object') ? body.product : null
    if (!product || !(product.nazwa || product.name)) return json({ error: 'brak_produktu' }, 400, c)

    // T7: PREWARM lifestyle (wewnętrzny strzał z bud-mockup po zapisaniu makiet) — generuje
    // TYLKO ujęcia lifestyle do bud_sessions.landing_lifestyle, ŻADNEGO HTML. Główna generacja
    // (po wyborze stylu, ~1-2 min później) reużywa gotowe → landing szybszy o 60-90 s.
    if (body.prewarm) {
      if (!isAdmin) return json({ error: 'brak_uprawnien' }, 403, c)
      const preExisting = Array.isArray((session as Record<string, unknown>).landing_lifestyle) ? ((session as Record<string, unknown>).landing_lifestyle as unknown[]) : []
      if (session.landing_html || preExisting.length) return json({ done: true }, 200, c)
      const { data: plock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'lifestyle', p_ttl_sec: 300 })
      if (!plock) return json({ pending: true }, 202, c)
      let preSnap: Record<string, unknown> | null = null
      try {
        const pkId = String(product.id || '')
        if (pkId && UUID_RE.test(pkId)) { const { data: row } = await supabase.from('bud_tt_products').select('ali_snapshot').eq('id', pkId).maybeSingle(); preSnap = (row && row.ali_snapshot) || null }
      } catch { /* */ }
      // deno-lint-ignore no-explicit-any
      const preImages = (preSnap && Array.isArray((preSnap as any).images)) ? (preSnap as any).images : [String(product.image || ''), String(product.cover || '')].filter(Boolean)
      const preUst = session.ustalenia || {}
      const preTask = (async () => {
        try {
          const lifestyle = await genLifestyle(SUPABASE_URL, CRON, preImages, product, preUst)
          if (lifestyle.length) {
            await supabase.from('bud_sessions').update({ landing_lifestyle: lifestyle }).eq('id', sessionId)
            try { await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'image', images: lifestyle.length, cost_usd: 0.041 * lifestyle.length, meta: { view: 'lifestyle', from: 'bud-landing-gen', prewarm: true } }) } catch (_) { /* */ }
          }
        } catch (e) { console.error('[bud-landing-gen] prewarm err', e) }
        finally { try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'lifestyle' }) } catch { /* */ } }
      })()
      try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(preTask) } catch (_) { /* */ }
      return json({ pending: true }, 202, c)
    }

    // PER-SESJA (landing zależy od ustaleń + wybranej makiety konkretnego usera)
    if (!body.force && session.landing_html) return json({ landing_html: session.landing_html, cached: true }, 200, c)

    // ── KONTEKST GENERACJI (wspólny dla stage1 i stage2) ─────────────────────
    // Wybrana makieta = referencja wizualna; snapshot = realne zdjęcia + tytuł.
    // deno-lint-ignore no-explicit-any
    const mocks = Array.isArray(session.mockups) ? session.mockups : []
    // deno-lint-ignore no-explicit-any
    const chosen = mocks.find((m: any) => m && m.style === session.chosen_style) || mocks[0] || null
    const mockupUrl = String(body.mockup_url || (chosen && (chosen as any).url) || '')
    product.__hasMockup = !!mockupUrl
    // Brief wybranego stylu = AUTORYTET palety/typografii (tekstem, nie tylko z JPEG-a makiety → mniej dryfu)
    // deno-lint-ignore no-explicit-any
    const styleBrief = String((chosen && (chosen as any).brief) || '').slice(0, 600)
    // deno-lint-ignore no-explicit-any
    const styleLabel = String((chosen && (chosen as any).label) || '').slice(0, 80)
    const ust = session.ustalenia || {}
    // Logo marki (z bud-brand) — jeśli wybrane, wplatamy je w stronę zamiast samej nazwy
    // deno-lint-ignore no-explicit-any
    const brandObj: any = (session.brand && typeof session.brand === 'object' && !Array.isArray(session.brand)) ? session.brand : null
    const logoUrl = String((brandObj && (brandObj.chosen_logo || brandObj.logo_url)) || '')
    // deno-lint-ignore no-explicit-any
    const brandName = String((brandObj && (brandObj.chosen_name || brandObj.nazwa)) || (ust && (ust as any).nazwa) || '').slice(0, 80)
    let snap: Record<string, unknown> | null = null
    let curated: string | null = null
    try {
      const pkId = String(product.id || '')
      if (pkId && UUID_RE.test(pkId)) { const { data: row } = await supabase.from('bud_tt_products').select('ali_snapshot, curated_image').eq('id', pkId).maybeSingle(); snap = (row && row.ali_snapshot) || null; curated = (row && (row.curated_image as string)) || null }
    } catch { /* */ }
    // ANTY-ZATRUCIE (2026-07-03, przypadek „materac do Tesli"): snapshot source='search'
    // (fallback wyszukiwarki po nazwie) bywa INNYM produktem — zeruj tytuł/opinie/staty,
    // a zdjęcia bierz z pewnych źródeł (kandydat dopasowany po obrazie + okładka).
    // deno-lint-ignore no-explicit-any
    const searchSnap = !!snap && String((snap as any).source || '') === 'search'
    if (searchSnap) snap = { ...(snap as Record<string, unknown>), title: '', reviews: [], review_stats: null }
    // deno-lint-ignore no-explicit-any
    let images = (!searchSnap && snap && Array.isArray((snap as any).images)) ? ((snap as any).images as string[]).slice() : [String(product.image || ''), String(product.cover || '')].filter(Boolean)
    if (curated) images = [curated, ...images.filter((u: string) => u !== curated)]   // ręczne zdjęcie z /trendy = pierwsza referencja

    // ── STAGE 2 (wewnętrzne, x-admin-secret): SAM call HTML we WŁASNEJ inwokacji ──
    // NIEZAWODNOŚĆ (2026-07-06, sesja 70cb915c: 2 niewidzialne pady jednego wieczora):
    // lifestyle+spec zjadały 1-2 min wall-clocka, a HTML (kilkanaście-30k tokenów przy
    // wolnym OpenAI) nie mieścił się w reszcie limitu 400 s → isolate ubijany BEZ finally
    // (zero usage-faila, zero Slacka, lock wisiał do TTL, front mielił „pending").
    // Stage2 = świeży wall-clock wyłącznie na HTML + deadline guard 330 s, żeby KAŻDA
    // porażka była uczciwa (fail-usage + Slack + release → front sam ponawia w pollingu).
    if ((body as Record<string, unknown>).stage2) {
      if (!isAdmin) return json({ error: 'brak_uprawnien' }, 403, c)
      const { data: lock2 } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'landing', p_ttl_sec: 400 })
      if (!lock2) return json({ pending: true }, 202, c)
      const lifestyle2 = Array.isArray((body as Record<string, unknown>).lifestyle)
        ? ((body as Record<string, unknown>).lifestyle as unknown[]).filter((u): u is string => typeof u === 'string' && !!u).slice(0, 4)
        : []
      const mockupSpec2 = String((body as Record<string, unknown>).mockupSpec || '').slice(0, 1500)
      const htmlTask = (async () => {
        const t0 = Date.now()
        let saved = false
        let failReason = ''
        try {
          // deno-lint-ignore no-explicit-any
          const content: any[] = [{ type: 'input_text', text: prompt(product, ust, snap, images, lifestyle2, styleBrief, styleLabel, logoUrl, brandName, mockupSpec2) }]
          if (mockupUrl) content.push({ type: 'input_image', image_url: mockupUrl })
          const callOnce = (ms: number) => fetchTimeout('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({ model: MODEL, input: [{ role: 'user', content }], max_output_tokens: MAX_OUT }),
          }, ms)
          // Deadline guard: 330 s < wall-clock 400 s → przy timeout/abort finally DZIAŁA.
          // Szybki blip (429/5xx w <90 s) dostaje jedną ponowną próbę w reszcie budżetu.
          let res = await callOnce(330_000)
          if (!res.ok && (res.status === 429 || res.status >= 500) && Date.now() - t0 < 90_000) {
            try { await res.body?.cancel() } catch { /* zwolnij połączenie */ }
            await new Promise((r) => setTimeout(r, 1200))
            res = await callOnce(330_000 - (Date.now() - t0))
          }
          if (!res.ok) { failReason = `openai HTTP ${res.status}`; console.error('[bud-landing-gen] openai', res.status, (await res.text().catch(() => '')).slice(0, 300)); return }
          const data = await res.json()
          // KOSZT: HTML strony (gpt-5.5, responses API) — najdroższy etap lejka
          try {
            const u = data?.usage || {}; const inTok = u.input_tokens || 0, cTok = (u.input_tokens_details?.cached_tokens) || 0, oTok = u.output_tokens || 0
            await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'landing', model: MODEL, input_tokens: inTok, cached_tokens: cTok, output_tokens: oTok, cost_usd: (Math.max(0, inTok - cTok) * 5 + cTok * 0.5 + oTok * 30) / 1_000_000, meta: { from: 'landing-html', duration_ms: Date.now() - t0 } })
          } catch (_) { /* log nie blokuje */ }
          let text = typeof data?.output_text === 'string' ? data.output_text : ''
          if (!text) { for (const it of (data?.output || [])) { if (it?.type === 'message' && Array.isArray(it.content)) for (const cc of it.content) if (cc?.type === 'output_text' && typeof cc.text === 'string') text += cc.text } }
          const html = extractHtml(text)
          if (!html || html.length < 400 || !/<\/html>/i.test(html)) { failReason = 'zły HTML (len ' + html.length + ')'; console.error('[bud-landing-gen] ' + failReason); return }
          await supabase.from('bud_sessions').update({ landing_html: html }).eq('id', sessionId)
          saved = true
          const shopUrl = await publishShopPreview(supabase, sessionId) // publiczny podgląd sklepu (bud-shop-preview)
          await maybeNotifyHtmlSlack(supabase, sessionId, shopUrl) // strona gotowa → #sparing (dedup, raz na sesję)
        } catch (e) {
          failReason = String(e).includes('AbortError') || String(e).toLowerCase().includes('abort')
            ? `timeout ${Math.round((Date.now() - t0) / 1000)}s (deadline guard)` : String(e).slice(0, 280)
          console.error('[bud-landing-gen] stage2 error:', e)
        } finally {
          if (!saved) {
            // Uczciwy fail: ślad w usage (duration!), lock w dół (retry usera od razu), alert Tomka.
            try { await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'landing', cost_usd: 0, meta: { from: 'landing-html-fail', reason: failReason || 'nieznany', duration_ms: Date.now() - t0 } }) } catch { /* */ }
            try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'landing' }) } catch { /* */ }
            await postSlackSparing('bud_gen_error', { session_id: sessionId, stage: 'strona sklepu (bud-landing-gen/stage2)', error: failReason || 'nieznany błąd', product: String(product?.nazwa || product?.name || '') })
          } else {
            try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'landing' }) } catch { /* */ }
          }
        }
      })()
      try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(htmlTask) } catch (_) { /* */ }
      return json({ pending: true }, 202, c)
    }

    // ── T1: CAPY anty-nadużycie (admin omija; wzorzec bud-mockup). Sprawdzane PRZED lockiem;
    //    force=true też tu trafia (cache zwrócił wyżej). Fail-open na błędzie zapytania.
    if (!isAdmin) {
      // (a) cap startów generacji per sesja (marker 'landing-attempt' niżej).
      // OKNO 24 h (audyt regresji #2): bez okna po przejściowej awarii OpenAI polling frontu
      // sam wypalał wszystkie próby i sesja zostawała bez sklepu NA ZAWSZE (429 + martwy retry).
      const capDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: sessCount, error: sessErr } = await supabase
        .from('bud_usage')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('kind', 'landing')
        .eq('meta->>from', 'landing-attempt')
        .gte('created_at', capDayAgo)
      if (sessErr) {
        console.error('[bud-landing-gen] session cap count error (fail-open):', sessErr)
      } else if ((sessCount ?? 0) >= MAX_LANDINGS_PER_SESSION) {
        return json({ error: 'limit_stron' }, 429, c)
      }
      // (b) dzienny cap per IP — starty z 24 h po wszystkich sesjach tego IP
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || (typeof session.ip === 'string' ? session.ip : null)
      if (ip) {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: ipSessions, error: ipSessErr } = await supabase.from('bud_sessions').select('id').eq('ip', ip)
        if (ipSessErr) {
          console.error('[bud-landing-gen] ip sessions query error (fail-open):', ipSessErr)
        } else if (ipSessions && ipSessions.length) {
          const { count: ipCount, error: ipUsageErr } = await supabase
            .from('bud_usage')
            .select('id', { count: 'exact', head: true })
            .eq('kind', 'landing')
            .eq('meta->>from', 'landing-attempt')
            .in('session_id', ipSessions.map((r) => r.id))
            .gte('created_at', dayAgo)
          if (ipUsageErr) {
            console.error('[bud-landing-gen] ip usage count error (fail-open):', ipUsageErr)
          } else if ((ipCount ?? 0) >= MAX_LANDINGS_PER_IP_PER_DAY) {
            return json({ error: 'limit_stron_dzienny' }, 429, c)
          }
        }
      } else {
        console.warn('[bud-landing-gen] brak IP do capa dziennego — fail-open')
      }
    }

    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'landing', p_ttl_sec: 400 })
    if (!lock) return json({ pending: true }, 202, c)
    // T1: marker startu generacji (licznik capów) — wstawiany PO claimie locka, więc
    // polling pending / cache-hit nie nabija licznika; realny start palący $ TAK.
    // Rerolle admina dostają osobny marker (nie zjadają limitu usera — audyt #7).
    try { await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'landing', cost_usd: 0, meta: { from: isAdmin ? 'landing-attempt-admin' : 'landing-attempt' } }) } catch (_) { /* */ }

    const genTask = (async () => {
      let saved = false
      let failReason = ''
      try {
        // T7: lifestyle z PREWARMU (bud-mockup odpalił je przy makietach) — reużyj zamiast
        // generować od nowa. Gdy prewarm właśnie biegnie (lock 'lifestyle' zajęty) — poczekaj
        // na jego wynik zamiast dublować koszt; gdy nic nie ma — wygeneruj sam (i odłóż do
        // landing_lifestyle, żeby force-regen też reużył).
        const getLifestyle = async (): Promise<string[]> => {
          const readPre = async (): Promise<string[]> => {
            const { data: fresh } = await supabase.from('bud_sessions').select('landing_lifestyle').eq('id', sessionId).maybeSingle()
            const arr = Array.isArray(fresh?.landing_lifestyle) ? (fresh.landing_lifestyle as unknown[]) : []
            return arr.filter((u): u is string => typeof u === 'string' && !!u)
          }
          let pre = await readPre()
          if (pre.length) return pre
          const { data: llock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'lifestyle', p_ttl_sec: 240 })
          if (!llock) {
            // prewarm w toku — polluj wynik do ~90 s, potem jedź bez lifestyle (HTML ma realne foto)
            for (let i = 0; i < 18; i++) {
              await new Promise((r) => setTimeout(r, 5000))
              pre = await readPre()
              if (pre.length) return pre
            }
            return []
          }
          try {
            const gen = await genLifestyle(SUPABASE_URL, CRON, images, product, ust)
            if (gen.length) {
              await supabase.from('bud_sessions').update({ landing_lifestyle: gen }).eq('id', sessionId)
              // KOSZT: obrazy lifestyle (gpt-image-2 medium = 0.041 USD/obraz)
              try { await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'image', images: gen.length, cost_usd: 0.041 * gen.length, meta: { view: 'lifestyle', from: 'bud-landing-gen' } }) } catch (_) { /* log nie blokuje */ }
            }
            return gen
          } finally { try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'lifestyle' }) } catch { /* */ } }
        }
        // T7: lifestyle i spec makiety nie zależą od siebie — RÓWNOLEGLE (oszczędza 20-60 s).
        const specUsage = { i: 0, c: 0, o: 0 }
        const [lifestyle, mockupSpec] = await Promise.all([
          getLifestyle(),
          extractMockupSpec(OPENAI_API_KEY, mockupUrl, specUsage),   // FAZA 3: twarda spec z makiety przed HTML
        ])
        // KOSZT: vision pre-pass makiety (gpt-5.1)
        try { if (specUsage.i || specUsage.o) await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'landing', model: 'gpt-5.1', input_tokens: specUsage.i, cached_tokens: specUsage.c, output_tokens: specUsage.o, cost_usd: (Math.max(0, specUsage.i - specUsage.c) * 1.25 + specUsage.c * 0.125 + specUsage.o * 10) / 1_000_000, meta: { from: 'landing-mockup-spec' } }) } catch (_) { /* log nie blokuje */ }
        // HAND-OFF DO STAGE2 (2026-07-06): najcięższy call (HTML) dostaje WŁASNĄ inwokację
        // ze świeżym wall-clockiem — patrz komentarz przy gałęzi stage2. Lock zwalniamy tuż
        // przed self-invoke (stage2 claimuje własny); okno wyścigu z pollingiem ~0,5 s jest
        // akceptowalne (poll co 12 s; przegrany claim po prostu nic nie robi).
        if (CRON) {
          try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'landing' }) } catch { /* stage2 zaraz claimnie */ }
          const selfRes = await fetchTimeout(`${SUPABASE_URL}/functions/v1/bud-landing-gen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': CRON },
            body: JSON.stringify({ stage2: true, sessionId, product, mockup_url: mockupUrl, lifestyle, mockupSpec, force: !!body.force }),
          }, 15_000)
          if (!selfRes.ok) { failReason = `stage2 HTTP ${selfRes.status}`; return }
          saved = true   // odpowiedzialność (lock, save, Slack) przejął stage2
          return
        }
        // FALLBACK bez CRON (brak sekretu = brak self-invoke): stary tryb inline —
        // pojedyncza próba z deadline guardem, żeby pad nigdy nie był niewidzialny.
        const t0 = Date.now()
        // deno-lint-ignore no-explicit-any
        const content: any[] = [{ type: 'input_text', text: prompt(product, ust, snap, images, lifestyle, styleBrief, styleLabel, logoUrl, brandName, mockupSpec) }]
        if (mockupUrl) content.push({ type: 'input_image', image_url: mockupUrl })
        const res = await fetchTimeout('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({ model: MODEL, input: [{ role: 'user', content }], max_output_tokens: MAX_OUT }),
        }, 240_000)
        if (!res.ok) { failReason = `openai HTTP ${res.status}`; console.error('[bud-landing-gen] openai', res.status, (await res.text().catch(() => '')).slice(0, 300)); return }
        const data = await res.json()
        // KOSZT: HTML strony (gpt-5.5, responses API) — najdroższy etap lejka
        try {
          const u = data?.usage || {}; const inTok = u.input_tokens || 0, cTok = (u.input_tokens_details?.cached_tokens) || 0, oTok = u.output_tokens || 0
          await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'landing', model: MODEL, input_tokens: inTok, cached_tokens: cTok, output_tokens: oTok, cost_usd: (Math.max(0, inTok - cTok) * 5 + cTok * 0.5 + oTok * 30) / 1_000_000, meta: { from: 'landing-html', duration_ms: Date.now() - t0 } })
        } catch (_) { /* log nie blokuje */ }
        let text = typeof data?.output_text === 'string' ? data.output_text : ''
        if (!text) { for (const it of (data?.output || [])) { if (it?.type === 'message' && Array.isArray(it.content)) for (const cc of it.content) if (cc?.type === 'output_text' && typeof cc.text === 'string') text += cc.text } }
        const html = extractHtml(text)
        if (!html || html.length < 400 || !/<\/html>/i.test(html)) { failReason = 'zły HTML (len ' + html.length + ')'; console.error('[bud-landing-gen] ' + failReason); return }
        await supabase.from('bud_sessions').update({ landing_html: html }).eq('id', sessionId)
        saved = true
        const shopUrl = await publishShopPreview(supabase, sessionId) // publiczny podgląd sklepu (bud-shop-preview)
        await maybeNotifyHtmlSlack(supabase, sessionId, shopUrl) // strona gotowa → #sparing (dedup, raz na sesję)
      } catch (e) {
        failReason = String(e).slice(0, 280)
        console.error('[bud-landing-gen] gen task error:', e)
      } finally {
        if (!saved) {
          // T2: porażka = lock w dół (retry usera generuje OD RAZU, nie po TTL 400 s)…
          try { await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'landing', cost_usd: 0, meta: { from: 'landing-html-fail', reason: failReason || 'nieznany', stage: 1 } }) } catch { /* */ }
          try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'landing' }) } catch { /* */ }
          // …T10: i Tomek wie o padzie przed userem.
          await postSlackSparing('bud_gen_error', { session_id: sessionId, stage: 'strona sklepu (bud-landing-gen)', error: failReason || 'nieznany błąd', product: String(product?.nazwa || product?.name || '') })
        }
      }
    })()
    try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(genTask) } catch (_) { /* */ }

    return json({ pending: true }, 202, c)
  } catch (e) {
    console.error('[bud-landing-gen] ERROR:', e)
    return json({ error: 'blad_serwera' }, 500, c)
  }
})
