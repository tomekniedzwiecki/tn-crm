# STANDARD-LANDING-SKLEPY — fabryka landingów pod maksymalną konwersję (workflow v2)

**Status: OBOWIĄZUJE — wersja 2.0 (przepisana na czysto 2026-07-16 po dopracowaniu flow
na Świtku; wersja 1.x z 15.07 + kilkanaście korekt Tomka skonsolidowane).**
Research CRO: Baymard/CWV/Gemius/tpay/FTC — źródła na końcu. Rzemiosło self-contained
i przegranie do platformy: PROCEDURA-HTML-PRODUKTU.md.

**🎯 Cel: sklepy mają SPRZEDAWAĆ. Benchmark: CR 3%+ (zimny ruch Meta, mobile, COD).**
Kontekst: ~90% ruchu mobile z Reels/FB (impuls), rynek PL (19% kupujących oszukanych 2024 —
lęk #1 = scam), checkout na osobnej domenie platformy (CTA → checkout_url), COD dostępny.

---

## 0. ZASADY NADRZĘDNE (rozstrzygają każdy konflikt niżej)

**Z1 — MESSAGE MATCH.** Landing kontynuuje rozmowę z kreacji: hero = echo hooka (ta sama
obietnica + motyw wizualny; case'y +34…66% CR). Mapa `HOOKS={1..3}` w skrypcie, `?h=N`
podmienia h1+sub; kreacja N linkuje `?h=N`. Nie budujemy osobnych landingów per kreacja.

**Z2 — 🎨 GRAFIKA-FIRST. PRIORYTET #1 CAŁEGO PROCESU (Tomek 16.07): finalna strona ma
wyglądać JAK GRAFIKI KAŻDEJ SEKCJI z gpt-image — proces budowy dopracowujemy tak długo,
aż ten efekt jest osiągany POWTARZALNIE; każda rozbieżność render↔makieta to dług
do spłacenia w pętli dopasowania, nie „wystarczająco dobrze".** „Grafiki robią bardzo dużą część roboty wizualnej — posługujmy
się nimi tak bardzo, jak tylko się da; kod nie zawsze umie zrobić tak dobrze" (Tomek 16.07).
Sceny generowane niosą wygląd; kod robi WYŁĄCZNIE to, co musi być kodem: typografia, CTA,
listy/tabele/FAQ, opinie (realne zdjęcia), dane, interakcje. **Scena = TŁO CAŁEJ SEKCJI,
FULL-BLEED** (absolutny `<img>` `object-fit:cover` pod treścią; hero = pełny pierwszy ekran);
NIGDY scena jako obrazek w kolumnie. Zero tekstu wypalonego w grafice (nagłówki/ceny/przyciski
zawsze HTML — SEO/GEO/dostępność/edycja).

**Z3 — BOGATO ALE SPÓJNIE.** Landing jak od agencyjnego seniora „za wielkie pieniądze".
Nie oszczędzamy na grafikach/JS/animacjach/funkcjach — oszczędzamy na marnotrawstwie.
**Budżet 25 zł/landing (~$6.75; podniesiony przez Tomka 16.07)** — plan alokacji:
makiety F2 ~$1.7-2.0 (24-30 obrazów) · grafiki produkcyjne F3 ~$0.6-0.9 (hero×3+sceny+OG) ·
kod+efekty F4/F5 ~$0.8-1.2 · pętle F7 ~$0.8-1.2 · rezerwa na regeneracje i iteracje
W GÓRĘ ~$1.5-2.0. Landing za 2-3 zł = za ubogi = FAIL kalibracji.
Spójność robi styl-master jako referencja KAŻDEJ generacji + mapa assetów (chaos = brak DNA
stylu, nie liczba grafik). Krytyk pyta: „czy to wygląda na DROGI projekt?" — ubogi landing
iterujemy W GÓRĘ.

**Z4 — KOD PISZE ZAWSZE gpt-5.6-sol** (via edge `wf2-gpt`): sekcje, poprawki, iteracje.
Agent Claude: dane, spec, montaż markerowy, weryfikacja, fixy integracyjne <5% (raportowane).

**Z5 — UCZCIWOŚĆ = KONWERSJA (rynek PL).** Dane twarde 1:1 ze snapshotu aukcji, uczciwe N
opinii, jeden prawdziwy minus w porównaniu, zero fałszywej pilności. Szczegóły: sekcja 4.

---

## 1. FLOW FABRYKI (fazy F0→F8; wykonawca = agent, koder = gpt-5.6-sol)

**F0 — DANE + VISION-GATE.** Snapshot z `bud_tt_products.ali_snapshot` (tytuł, opinie
z text_pl, review_stats, sku_prices; PUSTE specs = tylko komunikaty jakościowe, zero
zmyślonych cm/kg). Vision-gate KAŻDEGO materiału: zdjęcia aukcji (infografiki z obcym
tekstem/marką = odrzut z galerii, treść wolno cytować), zdjęcia opinii (zrzuty apki
AliExpress/obce marki/off-topic = odrzut), WIDEO (poster/klatka — off-product w obie strony
= sekcję pominąć, nawet przy milionach wyświetleń). Cena = półka rynkowa kategorii PL +
zdrowa marża (nie sztywny mnożnik); końcówki: <150 → ,90; ≥150 → pełne/9,00. Mini-marka:
USP-first zdrobnienie korzyści (Zmieścik/Świtek/Blasik…), slug lowercase bez znaków.

**F1 — PLAN OD GPT (zawsze pierwszy krok).** Briefing (wzór: scratchpad zmiescik-plan-
briefing.md, aktualizowany o ten standard): cel+kontekst, zdjęcia produktu jako input_image
(MAX 2 — limit edge), dane F0, pełne opinie, wymagania-zawsze, zakazy, kalibracja Z2/Z3.
GPT zwraca: koncepcję pod TEN produkt (motyw przewodni = wizualna metafora korzyści,
NIGDY „clean e-commerce"), dobór i kolejność sekcji z uzasadnieniem, paletę+font+charakter,
listę grafik, funkcje konwersji. FILTR PLANU (my): zakazy, formularz→CTA checkout_url,
esencja produktu na scenach kluczowych, jasne tła.

**F2 — MAKIETY (projekt całej strony).**
1. **STYL-MASTER ×1** (pełna scena z motywem; gate: motyw↔korzyść, jasno, hierarchia,
   produkt wierny, minimalny fake-tekst; FAIL→regeneracja promptu).
2. **HERO-MAKIETA** (pełny 1. ekran: topbar, nagłówek PL, scena z produktem, karta wtopiona
   w scenę, pay-row; gate WOW — iterować max 3, wybrać najlepszą).
3. **MAKIETY WSZYSTKICH SEKCJI planu** (pokrycie CAŁEGO planu — tylko czysta stopka bez
   makiety), przyrostowo: hero+1 → po 2. Każda: ref = styl-master + realne zdjęcie produktu
   gdy w kadrze; 3:2 DUŻE; polskie teksty przykładowe; pełny układ UI.
4. **PARY desktop+mobile**: z każdej makiety desktop wariant MOBILE 2:3. ⚠️ NIE „adaptuj
   referencję" generycznie — gpt-image nie odwzorowuje tekstu z obrazu, regeneruje z priora
   i WSTRZYKUJE dropship-claims (przekreślenia, „NR 1 W POLSCE", darmowa dostawa)! Mobile
   generować per-sekcja z DOKŁADNĄ treścią wypisaną w prompcie (jak desktop); referencja
   desktop tylko dla stylu/układu. Mobile-makieta WIĄŻE dla 390px, desktopowa dla ≥768px.

**🎛️ RZEMIOSŁO PROMPTÓW MAKIET (research D, 16.07 — OpenAI cookbook + praktycy; UNIWERSALNE):**
- **Szablon promptu = struktura stała** {rola, sekcja, layout, TREŚĆ w "cudzysłowach",
  style-DNA, wykluczenia, wymiar}: język UI („high-fidelity product UI screenshot,
  Figma-style, pixel-perfect, clean design system"), ZERO języka concept-art
  („beautiful/render/artwork" → daje ilustrację zamiast makiety). Opisuj interfejs
  „jakby już istniał".
- **STYLE-DNA tekstowe w KAŻDYM prompcie** (niezmienny akapit serii): dokładne hexy,
  font+wagi+skala, spacing/gęstość, radius, cienie, ton fotografii — obraz-master
  + tekst-DNA razem są stabilniejsze niż sam obraz.
- **Obrazy wejściowe: indeksuj i przypisuj ROLĘ**: „Image 1: style reference (match
  palette/typography/spacing). Image 2: previous section (match visual system, do NOT
  copy its text)." Bez tego model kopiuje treść sąsiedniej makiety. Kolejność:
  styl-master pierwszy; ZAAKCEPTOWANE hero jako druga kotwica dla kolejnych sekcji
  (baseline-first loop).
- **Stały blok wykluczeń w każdym prompcie**: no browser chrome/URL bar/tabs/window
  controls, no device frame, no mockup shadow („flat edge-to-edge section screenshot"),
  no watermark/signature, no lorem ipsum, no crossed-out prices, no bestseller/„NR 1"
  badges, no free-shipping unless specified, no extra text beyond quoted, no abstract
  blobs/random 3D/decorative gradients unless in style DNA.
- **Tekst PL**: krótkie stringi w "cudzysłowach" (nagłówek/cena/CTA); długie bloki (FAQ,
  opisy) = paski/linie o właściwej długości zamiast fałszywego copy (treść i tak nadpisuje
  kod); quality high dla drobnego tekstu.
- Wymiary natywne (1536×1024 / 1024×1536), NIGDY tagów `--ar` w treści promptu.
- **CZEGO NIE ZMIENIAĆ (anty-regresja):** pary jako OSOBNE generacje (nie cięcie desktopu,
  nie multi-frame) · styl-master jako ref obrazkowa · gpt-image-2 jako model całej serii
  (spójność serii > lokalna jakość tekstu; Ideogram/v0 tylko jako testowany wyjątek) ·
  nadpisywanie treści w kodzie.
- **⚠️ MAKIETA = LAYOUT, NIGDY ŹRÓDŁO DANYCH (test Uśmieszek 16.07):** gpt-image regularnie
  wstrzykuje FAKE-SPECS (IPX7, „X dni baterii", „silikon medyczny", „dla dzieci") — twardy
  gate przy montażu: specs WYŁĄCZNIE ze snapshotu.
- **✅ KANON MAKIET (rozstrzygnięty testem Uśmieszek, 0 odrzutów, $1.67):** makiety UI
  całego planu (layout) + OSOBNE sceny text-free jako tła full-bleed (nie mieszać treści
  z tłem w jednej generacji). Przy 0-reject prompt-crafcie NISKI koszt ≠ uboga strona
  (bogactwo mierzy się OUTPUTEM: sceny/interakcje/jakość na stronie, nie wydanymi $).

**F3 — GRAFIKI PRODUKCYJNE (grafika-first).**
1. **HERO = pełna scena Z PRODUKTEM w środku** (ref = hero-makieta jako wzór kompozycji
   + realny packshot; wierność wg 3 WARUNKÓW — sekcja 2). Puste strefy negatywne dokładnie
   tam, gdzie makieta ma nagłówek/CTA/kartę. **TRZY warianty: mobile 2:3 · tablet ~1:1 ·
   desktop 3:2** (`<picture>`). NIE „plate + wycięty packshot" (szwy/skala/światło = źle).
   Mobile: `object-position` uniesiony (produkt nie może zniknąć za blokiem oferty) +
   oferta/CTA w wydzielonej JASNEJ karcie na dole (nie „na produkcie" i nie ghost-poświata);
   układ stref: tekst-góra / produkt-środek / karta-dół.
2. **Sceny pozostałych sekcji wizualnych**: gdzie makieta ma bogatą scenę — JEDNA grafika
   sceny (z produktem gdy makieta go tam ma) jako tło full-bleed; kod dodaje warstwę treści.
   **2b. OCENA ZDJĘCIA PER SEKCJA (Tomek 16.07):** dla KAŻDEJ sekcji z obrazem produktu
   zdecyduj świadomie, jakie zdjęcie tam być powinno — WZORUJĄC SIĘ NA SCENIE Z MAKIETY
   (sceny z gpt-image są na bardzo wysokim poziomie — to wzór nastroju/kadru/kontekstu).
   Packshot z aukcji tylko tam, gdzie makieta ma packshot (karta oferty); gdzie makieta ma
   scenę lifestyle/kontekst użycia → WYGENERUJ scenę produktu (wierność wg 3 warunków,
   ref = realne zdjęcie + makieta jako wzór kadru). Surowy packshot wklejony w sekcję
   sceniczna = rozjazd z makietą (lekcja demo Świtka: to była główna różnica SSIM).
3. **MAPA ASSETÓW (gate przed kodem):** tabela asset → sekcja → sposób użycia; taksonomia
   **[P] produkt/użycie/efekt** (wierność 3 warunków) / **[D] design związany z motywem**
   (nigdy generic). **Każdy asset dostaje też TAG KLASY OBRAZU (P=packshot / U=UGC /
   S=scena AI), a każdy slot sekcji ma ALLOWLISTĘ klas wg `docs/zbuduje/OBRAZY-ROLE.md`**
   (karta oferty = TYLKO packshot, NIGDY UGC; opinie = TYLKO UGC; zakaz obrazu-na-obrazie
   — na scenie tylko cutout z alfą). Klasa spoza allowlisty = BLOK. Arkusze (ikony) z planem cięcia (PIL, biel→alpha) i adresem każdego
   wycinka. 100% assetów użytych; 0 sekcji bez assetu. OG = 1200×630 w stylu master.
4. KAŻDA generacja obejrzana (Read) przed użyciem; wtopiony tekst/UI w tle = odrzut.

**F4 — KOD (gpt-5.6-sol).** Szkielet-kontrakt z najnowszego wzorca (head: canonical/OG/
noindex `{{CANONICAL_URL}}`, JSON-LD @graph, JEDEN exec-script: pixel `{{PIXEL_ID}}`
VC/ATC/IC + link decoration + HOOKS + sticky IO + wideo autoplay-on-visible; lightboxy;
pay-badges). Potem sekcja po sekcji **WYŁĄCZNIE procedurą `docs/zbuduje/SEKCJA-Z-MAKIETY.md` (v2,
z researchu 16.07)**: ekstrakcja IR z makiety (paleta hex, skala typo px, bboxy — narzędzia
scripts/mockup-tools/) → anotowana makieta + IR i DOKŁADNE copy jako TEKST → koder
z layout-as-thought → mierzalna pętla render-diff (SSIM-bramka ~0.90, heatmapa, keep-best,
rewrite<0.80 / edit-punktowy 0.80-0.90). Odstępstwa od makiety tylko: realne zdjęcia,
prawdziwe pay-badges, prawdziwe liczby. Sekcje czysto-danowe mogą iść z kontraktu.
Montaż markerowy + cross-check klas body↔CSS + grep gołych `<svg>`.

**F5 — ETAP ŻYCIA I ZAANGAŻOWANIA — OSOBNY, SEKWENCYJNY PRZEBIEG (wzmocnione przez Tomka
16.07: „brakuje animacji w JS, czegoś co doda życia, pokaże profesjonalizm i ZAANGAŻUJE;
nie robić wszystkiego naraz — etapami").** Wykonywany DOPIERO po zamknięciu dopasowania
wizualnego (F7.1) i audytu grafika-first — na stabilnej stronie, jako dedykowana runda:
1. **CREATIVE TECHNOLOGIST** (gpt-5.6-sol; wybór wzorców z **`docs/zbuduje/
   INTERAKCJE-KATALOG.md`** — katalog 15 wzorców per typ produktu + szablon SPEC-a +
   anty-wzorce; research 16.07). **FILTR SENSU (twardy):** interakcja musi demonstrować
   KORZYŚĆ produktu w momencie wątpliwości klienta — kontrolka zmieniająca tylko liczbę/
   jedną wartość = gadżet = FAIL (przeprojektować wg wzorca-matki #3: kontrolka steruje
   CAŁĄ SCENĄ przez jedną zmienną `--t`). Interakcję FLAGOWĄ landingu spec-ować szablonem
   z katalogu (storyboard+stany+kryteria liczbowe, BEZ gotowego kodu) i kodować na
   NAJWYŻSZYM wykonalnym efforcie.
2. **ZESTAW OBOWIĄZKOWY:** scroll-reveal ze staggerem · JEDNA animacja-motyw korzyści
   (np. łuk świtu rysowany scrollem) · count-up (statyczna liczba w źródle!) · sticky
   slide-in · mikrointerakcje CTA/kart (hover/press states) · **ELEMENT ANGAŻUJĄCY (wymóg!):**
   co najmniej jedna interakcja, która WCIĄGA użytkownika w produkt (interaktywne demo:
   suwak symulacji efektu, wybór kolorów/wariantów na packshocie, porównanie przed/po —
   z auto-zajawką przy pierwszym pokazaniu, żeby było widać że to interaktywne).
3. Filtr (celowe, zero tandety/particles/tilt/confetti, transform/opacity, fallbacki,
   reduced-motion→off, 60fps bez layout thrashing) → implementacja kodem GPT → test na żywo
   (scroll przez całą stronę, klik każdej interakcji, pomiar jank).
Ruch prowadzi wzrok do dowodu i CTA. Strona bez etapu życia = niekompletna (gate F6).

**🔁 SEKWENCYJNOŚĆ ETAPÓW (Tomek 16.07: „nie próbować robić wszystkiego naraz"):**
F4 kod-struktura → F7.1 dopasowanie wizualne → audyt grafika-first → **F5 życie** →
F7.2 krytyk końcowy. Każdy etap kończy się weryfikacją i zapisem wersji PRZED startem
następnego; jeden etap = jedna intencja (nie mieszać dopasowania z animacjami w jednym callu).

**F6 — WERYFIKACJA TWARDA.** 0 błędów konsoli · 0 h-scrolla (390/768/1280) · wszystkie
`<img>` naturalWidth>0 (eager-wait) · assety 200 · reduced-motion pokazuje pełną treść ·
grep zakazów i liczb · JSON-LD parse · `node --check` exec-scriptu · placeholdery+noindex ·
sticky nie zasłania (padding-bottom stopki) · lightbox/taby/wideo działają ·
**AUDYT GRAFIKA-FIRST (RETRO 16.07 — Świtek użył 2/47 grafik!): hero ma `<picture>`
z 3 wariantami scen; liczba unikalnych scen AI w kodzie == mapa assetów (grep URL-i
ai-generated/bud-assets vs mapa); sekcja z makietą-sceną bez grafiki full-bleed = FAIL.**

**F7 — PĘTLE JAKOŚCI (sekcja po sekcji).**
1. **ETAP DOPASOWANIA — OSOBNA FAZA, DO WYCZERPANIA (wzmocnione przez Tomka 16.07: „strona
   ma wyglądać tak jak makiety"):** dla KAŻDEJ sekcji buduj KOMPOZYT side-by-side (PIL:
   makieta | screenshot, 390 i 1280, wyrównane szerokości) → lista KONKRETNYCH rozjazdów
   (hexy, font-size/wagi, spacing, cienie, zaokrąglenia, brakujące elementy SCENY, kompozycja,
   hierarchia) → poprawka kodem GPT (effort low/medium) → re-render → werdykt vision na
   kompozycie: „czy to ten sam projekt? TAK/NIE + czego brakuje" → iteruj AŻ TAK.
   **🔁 REWRITE-NOT-PATCH (Tomek 16.07: „jak się poprawia, zmiany są niewielkie — lepiej
   zrobić jeszcze raz"):** jeśli werdykt kompozytu = NIE (sekcja odbiega istotnie), NIE
   łatać istniejącego kodu — **przepisać sekcję OD ZERA świeżym callem** z pełnym pakietem
   wytycznych (makieta + wyekstrahowane tokens/wymiary + wnioski z poprzedniej wersji jako
   „czego unikać", NIE jako kod do poprawy) i NAJWYŻSZYM wykonalnym effortem (high przy
   capie ~5k; 504 → medium). Łatki (patch) tylko dla drobnych rozjazdów przy werdykcie
   „prawie TAK". Iteracje: rewrite → kompozyt → werdykt;
   **BEZ limitu iteracji** (pętla do wyczerpania — limit tylko: brak postępu 2 rundy z rzędu
   ⇒ eskalacja: regeneracja grafiki sceny albo nota do nadzorcy). Start od hero. Kompozyty
   archiwizować per sekcja/iteracja (`FABRYKA-*/<slug>/dopasowanie/<sekcja>-vN.png`) —
   postęp ma być widoczny dla Tomka. Podział pracy (RETRO 16.07): analizę rozjazdów na
   kompozytach może robić agent (vision) — GPT wołać do PRZEBUDÓW sekcji; mechaniczne fixy
   CSS/typografii <5% pliku = fixy integracyjne (dozwolone agentowi, raportowane).
2. **Pętla KRYTYKA**: krytyk gpt-5.6-sol vision (bezlitosny art director + CRO: „czy czuć
   produkt, który chce się kupić? co tandetne? czy wygląda na DROGI projekt?") NAPRZEMIENNIE
   ze świeżym subagentem visual-verify (SEKWENCYJNIE — jedna przeglądarka) → filtr uwag WZGLĘDEM
   TEGO STANDARDU → poprawki kodem GPT → STOP gdy zero realnych P0/P1 i poziom agencyjny
   potwierdzony (P2-kosmetyki nie iterować w nieskończoność).
   Każda wersja archiwizowana: `Desktop\TN-Sklepy-grafiki\FABRYKA-*\<slug>\vN\`
   (index.html + full-1280 + full-390 + KRYTYKA.md); grafiki w `assets\`.
3. **F7.3 FINALNY PASS DETALI — OBOWIĄZKOWY, ostatni gate przed oddaniem (Tomek 16.07:
   „musi być sprawdzenie na koniec wszystkiego, pixel-perfect"):** pełna procedura
   `docs/zbuduje/FINALNY-PASS.md` — 4 passy kaskadowo (design-linter skryptowy → vision
   warstwowy na crop'ach → squint/blur → proweniencja assetów z tagami P/U/S wg
   `docs/zbuduje/OBRAZY-ROLE.md`), format findingów P0-P2, pętla do czystej rundy.
   Uruchamiany PO zielonym dopasowaniu (F7.1) i krytyku (F7.2). Landing bez czystego
   F7.3 = NIEGOTOWY.

**F8 — RETRO (mechanizm uczenia — obowiązkowy).** Raport wykonawcy MUSI zawierać sekcję
„NOWE WNIOSKI" (co zawiodło / co zaskoczyło / co dodać do promptów). Nadzorca po każdym
landingu: konsoliduje wnioski do sekcji 7 (LEKSYKON) **tematycznie** (nie chronologicznie),
usuwa zdublowane, sprzeczności rozstrzyga najnowszą decyzją Tomka, i wpisuje datę+produkt
do CHANGELOG (koniec pliku). Brief każdego kolejnego wykonawcy zaczyna się od „przeczytaj
CAŁY standard" — tak lekcje wchodzą do następnej generacji automatycznie.

---

## 2. ZASADY WIZUALNE

**JASNE TŁA — zawsze.** Tła stron/sekcji wyłącznie jasne (kremy/biele/pastele); ciemne tylko
jako akcenty tekstu/ikon. Footer JASNY. (Badania: jasne = wierność zdjęć, czytelność, zaufanie
masowego B2C; „ciemne+neon" = AI-slop; dark wygrywa tylko w niszach premium/B2B.)
**CTA: kontrast + izolacja** — jeden ciepły kolor, WYŁĄCZNIE na przycisku zakupu.

**WIERNOŚĆ PRODUKTU — 3 WARUNKI (każda generacja z produktem w kadrze):**
(1) zdjęcie referencyjne produktu w input (2 ujęcia); (2) w prompcie WPROST: „Faithfully
reproduce the product EXACTLY as shown in the reference — same shape, proportions, colors
and details; do NOT redesign" + MINIMALNY opis słowny (opis konkuruje z referencją!);
(3) gate porównawczy side-by-side z realnym zdjęciem; drift = regeneracja; uporczywy drift
małych gadżetów → scena bez produktu + realny `<img>`.
**Wyjątek — produkt CUSTOM** (personalizowany ze zdjęcia klienta): AI TYLKO sceneria,
produkt niosą wyłącznie realne zdjęcia i UGC.

**ESENCJA PRODUKTU.** Sceny kluczowe (hero, demo/PRZED-PO, zastosowania) MUSZĄ pokazywać
mechanizm/efekt działania (pompka → ściśnięte worki; budzik → światło świtu). Plan GPT
proponujący „no product" na scenach kluczowych = nadpisać. Gate całości: z samych grafik
widać, CO produkt robi i po co go kupić.

**PAY-BADGES — kanoniczny blok `docs/zbuduje/assets/pay-badges.html`** (prawdziwe logotypy:
Visa wordmark-path, Mastercard geometria kół, BLIK znak słowny; białe pigułki z borderem
i cieniem + „ZA POBRANIEM"). Wklejać 1:1; ZAKAZ odtwarzania logotypów z pamięci.

**DNA TYPOGRAFICZNE MAKIET (RETRO dopasowania 16.07 — najtańszy fix o największym wpływie):**
makiety mają zwykle KURSYWNY SERIF-AKCENT na słowie-kluczu nagłówka — koder MUSI wczytać
font szeryfowy (np. Fraunces italic) + klasę `.ac` i owinąć akcenty; każda sekcja treściowa
MUSI mieć eyebrow+`<h2>` zgodny z makietą (gate: sekcja bez nagłówka = błąd); wyrównanie
nagłówków wg makiety (edytorialne=lewa, nie domyślne centrowanie). Grafika-first: scena
w interaktywnym stage'u NIE może być wyprana ani mała (tło stage=transparent, spoczynkowy
glow ≤0.42, kadr ≥520px desktop) — biały wash marnuje bogatą generację.

**Detale rzemiosła:** media kart = jeden `aspect-ratio`+`object-fit:cover` na sekcję
(UWAGA: atrybut HTML `height` na `<img>` BIJE CSS aspect-ratio — dla kafli dawać w CSS
i width, i height) · hero mobile: jasny panel/scrim pod copy (tekst nie może nachodzić
na scenę/twarz) · UGC podpisywać „zdjęcia od kupujących" — NIGDY „z AliExpress" (zdradzanie
źródła = sygnał dropshippingu; uczciwość ≠ zdradzanie źródła) ·
zakaz ornamentów-PNG (wstążki/chmurki/ściegi — cukierkowe; akcenty czystym CSS; wycinki
z arkuszy tylko wg mapy assetów) · UGC z normalizacją CSS (brightness/contrast/saturate) ·
PRZED/PO bez sparowanego realnego kadru = statyczny panel z JEDNĄ spójną sceną (nie mieszać
realnego zdjęcia ze sceną AI w suwaku) · „świecenie" na jasnym packshocie = spotlight
normal-blend ~0.55 (nie mix-blend screen) · grid 2-kol zawsze z mobilnym resetem 1-kol.

---

## 3. WYMAGANIA-ZAWSZE (niezależnie od planu GPT)

- pay-badges z kanonicznego bloku (hero/oferta/sticky wg mapy anty-duplikacji);
- sticky przycisk zamówienia (mobile, po hero, IO) + KAŻDE CTA `data-checkout` → checkout_url;
- prawdziwe opinie z aukcji ZE ZDJĘCIAMI (kafle + lightbox z pełną treścią; wzorzec:
  drukarka-3d ~l.1324; ae-pic rehost do `bud-assets/<slug>/` przed użyciem);
- realne zdjęcia produktu w karcie/galerii/ofercie (AI nie zastępuje dowodu);
- hit z TikToka: self-host MP4 bez ramki odtwarzacza (pipeline i ryzyko: sekcja 5),
  TYLKO po vision-gate on-product;
- pomiar (sekcja 5), JSON-LD @graph, `{{PIXEL_ID}}`/`{{CANONICAL_URL}}`+noindex;
- dane twarde 1:1, zakazy (sekcja 4), jasne tła, tech budżet (sekcja 5).

---

## 4. TREŚĆ I ZAUFANIE (rynek PL)

**Biblioteka sekcji** (checklist pokrycia — dobór/kolejność ustala plan GPT): topbar mini ·
HERO = kompletna mikro-oferta 1. ekranu (h1-echo → sub „dla kogo+efekt" → scena z produktem →
chip ★ z uczciwym N → cena → JEDNO CTA → mikrocopy) · pas zaufania/COD 1-2-3 (narracja
procesu) · problem→rozwiązanie · demo „jak działa" 1-2-3 · hit z TikToka · korzyści
(konkrety z aukcji) · UCZCIWE porównanie z JEDNYM prawdziwym minusem · galeria (lazy,
lightbox, wpleść UGC) · social proof (3-6 opinii ze zdjęciami; małe N uczciwie; 0 opinii →
sekcję pomiń) · oferta box #zamow („co dostajesz", warianty-buttony gdy API poda, gwarancja
zwrotu) · FAQ tuż nad finałem (COD? zwrot jak? wysyłka „pod Twój adres" BEZ terminów ·
1 produktowe) · FINAL CTA + mini-opinia · sticky bar.

**MAPA ANTY-DUPLIKACJI TRUST** (każda informacja zaufania max 1× per sekcja):
| topbar | „Płatność online lub przy odbiorze · 14 dni na zwrot" |
|---|---|
| header | chip „★ x,x/5 · N ocen" (jedyne ★ nad foldem) |
| HERO | pod CTA+ceną JEDEN rząd: pay-badges + badge „14 DNI NA ZWROT" |
| COD-strip | narracja 1-2-3 (proces, nie badge) |
| OFERTA | lista „co dostajesz" + pay-badges bez powtórek mikrocopy |
| FINAL | jedyne pełne zdanie płatności + mini-opinia |
| sticky | skrót „BLIK · karta · za pobraniem — 14 dni na zwrot" |
Gate: policz wystąpienia „14 dni"/„pobranie"/„BLIK" per sekcja.

**CTA**: jedno działanie ×3-4 (hero/po dowodzie/finał/sticky); „Zamawiam — zapłacę przy
odbiorze"; mikrocopy: „Płatność przy odbiorze · 14 dni na zwrot · Wysyłka pod Twój adres".

**PŁATNOŚCI**: pełen wachlarz (BLIK/karta/COD) — COD jako główny risk-reversal w narracji,
nie jedyna forma. Pokazujemy TYLKO metody realnie dostępne w checkoucie platformy.

**ZAKAZY:** zmyślona pilność/liczniki/„ostatnie sztuki"/„tylko dziś" · JAKIEKOLWIEK obietnice
czasu dostawy („24h", „magazyn w PL") — dotyczy też CYTATÓW opinii (przycinać do zgodnej
części) · przekreślone ceny · obietnice zdrowotne/medyczne (beauty = język kosmetyczny;
zabawki antystres = język zabawowy) · liczby spoza snapshotu · klejmy niepotwierdzone
w aukcji · stockowe twarze · kalki językowe (polszczyzna natywna).

**Pilność wyłącznie realna** (sezon). **Ceny psychologiczne**: <150 → ,90; ≥150 → pełne/9,00;
spójne końcówki w portfelu.

---

## 5. TECH · POMIAR · GEO

**Tech budżet:** LCP<2,5s · CLS<0,1 · INP<200ms (mobile 4G) · MAX 1 font custom (preload
woff2, swap, latin-ext; body = system stack) · hero przez Storage render API (eager+preload,
width wg viewportu), reszta lazy, wszystkie width/height · self-contained: 1 plik, CSS
inline, JEDEN exec-`<script>`, zero bibliotek · overflow-x zablokowany.

**Pomiar (spięty z WORKFLOW-V2-TESTY.md):** pixel `{{PIXEL_ID}}` (init tylko po podmianie):
PageView+ViewContent (load), **AddToCart na klik KAŻDEGO CTA** (zasila CP2!),
InitiateCheckout (wyjście na kasę) + link decoration (fbclid/_fbp/_fbc na checkout_url) +
HOOKS `?h=N`.

**Wideo TikToka (self-host, decyzja Tomka):** `python -m yt_dlp` → ffmpeg H.264
`scale=720:1280,fps=30 crf 26-28 +faststart` (HEVC nie gra w Chrome; frame-extract
`-pix_fmt yuvj420p`) → upload edge `wf2-asset-rehost` → `<video muted loop playsinline
preload="none">` + IO autoplay/pause + przycisk głośnika + reduced-motion→controls; poster
z bud-covers; podpis „wideo: @autor (TikTok) · ponad X mln wyświetleń" (W DÓŁ). ⚠️ Ryzyko
licencyjne odnotowane: atrybucja zostaje, zdjęcie na żądanie twórcy, NIGDY w kreacjach Meta.

**GEO (pełna wiedza: GEO-LLM.md):** każdy fakt w serwerowym HTML (boty nie wykonują JS;
count-up = statyczna liczba w źródle) · answer-first (hero-sub 2-3 zdania, akapity 40-75
słów, zero tonu promocyjnego) · JSON-LD @graph (Organization/OnlineStore + Product
z brand=mini-marka, liczby 1:1 z widocznymi, price kropką; BreadcrumbList; FAQPage =
widoczne FAQ; pól bez danych nie zmyślać) · anty-doorway (każdy landing genuinnie unikalny)
· poziom domeny (robots/sitemap/feedy) = wymagania do platformy.

---

## 6. CHECKLIST PRZED PUBLIKACJĄ (gate — wszystkie PASS)

1. grep zakazów (24h/magazyn/ostatnie/tylko dziś/liczniki/przekreślenia/obietnice medyczne).
2. Liczby == `ali_snapshot.review_stats` i dane aukcji (nic ponad).
3. Message match: h1==hook główny; `?h=2`/`?h=3` działa.
4. Pixel: placeholder bez błędów; po podmianie VC/ATC/IC w Test Events.
5. LCP<2,5s (4G) · CLS<0,1 · waga 1. ekranu sensowna.
6. 390/768/1440: zero h-scrolla, sticky nie zasłania, lightbox działa.
7. Wszystkie CTA → #zamow z data-checkout; mikrocopy pod każdym.
8. Pętla dopasowania (F7.1) zamknięta: sekcje == makiety.
9. Pętla krytyka (F7.2) czysta: zero P0/P1 + potwierdzony poziom agencyjny.
10. Wersje + grafiki zarchiwizowane na pulpicie; koszty w ledgerze.

---

## 7. LEKSYKON WYKONAWCZY (lekcje skonsolidowane TEMATYCZNIE — F8 dopisuje tu nowe)

### 7a. wf2-gpt / koder
- **`reasoning.effort` — STERUJ per zadanie (wf2-gpt przekazuje pole; wf2gpt-call.py: env
  `WF2_EFFORT`). Kalibracja EMPIRYCZNA (Blasik 16.07):** PLAN i KRYTYK vision = **`medium`**
  (`high` na edge jest niewykonalny: 504 przy dużym capie, a przy małym cały budżet idzie
  w reasoning i tekst wraca pusty) · `high` TYLKO krótkie calle tekstowe bez obrazów
  (creative technologist, koncepcje) z capem ~4k · KOD sekcji = `medium` · drobne poprawki /
  przycinanie copy = `low`.
- **Chunki: ≤~4 sekcje na chunk; lightboxy + JS interakcji ZAWSZE OSOBNYM wywołaniem**
  (5 sekcji + 12 lightboxów + JS = pewny 504).
- Marker `<!--PAYBADGES-->`: instruować kodera „NIE dodawaj własnego wrappera .pay-badges"
  (GPT owija — po wklejce kanonicznej robi się zagnieżdżenie); montaż deduplikuje.
- 504 = wall-clock edge, nie tylko rozmiar: kod w chunkach ≤~5k out (literalny HTML — FAQ/
  stopka — zapas 7k); plan-call MAX 2 obrazy i cap ~4-5k; `max_output_tokens` ≠ bezpiecznik.
- Limit inputu 400k znaków (`input_za_dlugi`): screenshoty jako data-URI JPEG q~47 szer.400
  w body (nie argv); wysoki mobile na 2 wywołania.
- Odpowiedź czytać jako SUROWE BAJTY UTF-8 (python/urllib); PS Invoke-RestMethod = mojibake.
- SŁOWNIK KLAS wspólny dla chunków (inaczej CSS↔body rozjazd, gołe `<svg>` = ikony 300px);
  lightboxy w JEDNYM chunku (inaczej zduplikowane ID). Montaż: cross-check + grep.
- Sekcje z dużym literalnym HTML/SVG (hero, opinie): cap 7-8k; po KAŻDYM chunku grep
  niedomkniętego patha (`d="[^"]*$`) — ucięcie w środku atrybutu rozwala parsing dalszych sekcji.

### 7b. Screenshoty / krytycy
- Przed zrzutem: eager-load wszystkich img aż `naturalWidth>0` (inaczej fałszywe P0),
  wymusić klasy reveal, DPR1 (DPR3 kafelkuje = fałszywe „powtórzenia").
- Full-page ze `svh`: chrome-devtools MCP (captureBeyondViewport), nie goły CLI
  (fallback z override `.hero{min-height:0}`).
- Uwagi o foldzie/sticky/nachodzeniu weryfikować NA ŻYWO (getBoundingClientRect), nie z obrazu.
- Bardzo długie strony do krytyka: zrzuty przez upload do storage + URL (resize ~760/360)
  pewniejsze niż data-URI.
- Uwagi krytyków filtrować względem TEGO standardu (np. COD jest WYMAGANY — „zakaz COD"
  z landing-pages nie obowiązuje). visual-verify i chrome-devtools dzielą przeglądarkę —
  sekwencjonować; zombie-lock profilu → fallback headless z tmp user-data-dir.

### 7c. Materiał źródłowy (aukcja/snapshot)
- Dane ZAWSZE ze snapshotu (nie z odziedziczonego briefu); puste specs → komunikaty jakościowe.
- Vision-gate zdjęć, opinii i WIDEO (off-product w obie strony) — obowiązkowy (F0).
- Rehost zewnętrznych obrazów TYLKO do `bud-assets/<slug>/` — to PREFIX w buckecie
  `attachments` (upload: `/object/attachments/bud-assets/<slug>/...`), nie osobny bucket.
- Treść odrzuconych infografik producenta wolno cytować (dane z aukcji, nie fantazja).
- **Limit realnego dowodu**: ubogie UGC (same packshoty) = social-proof zawsze „słaby" u krytyka —
  to sufit danych, nie kodu; NIE nadrabiać fabrykacją (uwagę krytyka odrzucić z tą notą).

### 7d. Rzemiosło UI (szczegóły w sekcji 2)
- Tabela porównania od razu wzorcem tabela→karty z `data-label` (390!).
- Sticky-buy: `padding-bottom` na body/stopce.
- Count-up: statyczna wartość w źródle; `data-to` bez treści = błąd GEO.
- **Kadr produktu (RETRO 16.07):** kontener `aspect-ratio` + obraz `position:absolute;
  inset:0;width/height:100%;object-fit:contain` (dziecko z height:100% w aspect-ratio
  przelewa się i przycina!); media w kartach split `align-self:center` z własną proporcją
  (stretch = pionowy słup od wysokiej kolumny treści).
- **CSS nie animuje gradientów (background-image snapuje):** zmiana koloru glow/sceny =
  2 warstwy + crossfade `opacity` — standard dla wszystkich „zmieniających kolor" scen.
- **Auto-zajawka każdego interaktywnego demo** (teaser 1 cykl → natychmiastowe oddanie
  kontroli przy 1. interakcji → hint; reduced-motion → bez teasera) — wzorzec F5.

### 7e. Narzędzia
- yt-dlp przez `python -m yt_dlp` (winget-shim myli); payloady PL przez plik UTF-8 (cp1250!);
  node ścieżki `c:/...`; jq brak — python/node.

---

## 8. ŹRÓDŁA (research 15.07)

Baymard · KlientBoost/Leadpages (message match +34…66%) · CWV studies (0,1s ⇒ +8,4% CR) ·
DebugBear · Gemius E-commerce PL 2024 (39% COD) · tpay (19% oszukanych) · FTC Dark Patterns ·
Contentsquare (sticky ATC +11…31%) · senja/convert-via (UGC) · landerlab/replo (benchmarki).

## CHANGELOG DECYZJI (F8)

- **2026-07-15**: v1 standardu (research CRO) → FLOW v3/v4 → FLOW V5 (plan GPT); nocna pętla
  R0-R4 (Zmieścik/Świtek/Blasik/Mordulek/Blatek) — lekcje 1-30 (skonsolidowane w sekcji 7).
- **2026-07-16 (Świtek, fabryka od zera)**: kod ZAWSZE gpt-5.6-sol (Z4) · BOGATO ALE SPÓJNIE
  (Z3) · makiety sekcyjne przywrócone + pokrycie całego planu + pary desktop/mobile (F2) ·
  GRAFIKA-FIRST + hero 3 warianty + full-bleed (Z2/F3) · pay-badges kanoniczne · pętla
  dopasowania sekcja-po-sekcji (F7.1) · creative technologist (F5) · RETRO jako obowiązkowa
  faza (F8). Nocne landingi R1-R4 skasowane — rebuild pełnym flow.
- **2026-07-16 wieczór (RETRO Świtek+Blasik)**: effort skalibrowany empirycznie (plan/krytyk
  = medium; high tylko krótkie calle bez obrazów) · mobile-makiety z DOKŁADNĄ treścią
  w prompcie (generyczna adaptacja wstrzykuje dropship-claims) · chunki ≤4 sekcje, lightboxy
  +JS osobno, grep niedomkniętych `d="` · PAYBADGES bez wrappera · height-attr vs
  aspect-ratio · „zdjęcia od kupujących" nie „z AliExpress" · hero mobile: panel pod copy,
  object-position, karta oferty · limit realnego dowodu (ubogie UGC ≠ wina kodu) ·
  bud-assets = prefix attachments. OTWARTE do decyzji Tomka: czy przy grafika-first sceny
  produkcyjne full-bleed mogą pełnić rolę makiet dla sekcji SCENICZNYCH (2-w-1, jak Blasik
  $1.15), czy zawsze pełne pary makiet UI całego planu (jak Świtek $4.03).
