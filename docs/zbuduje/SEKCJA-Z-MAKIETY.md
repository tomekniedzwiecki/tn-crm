# SEKCJA-Z-MAKIETY v2 — procedura wiernego kodowania sekcji z makiety PNG

**Status: OBOWIĄZUJE (2026-07-16). Synteza researchu 3× Sonnet 5** (screenshot-to-code,
Design2Code/NAACL, LaTCoder, VisRefiner, 1D-Bench, Set-of-Mark, DCGen + stack narzędziowy).
Zastępuje metodę „pokaż GPT obraz i każ odwzorować 1:1" — twarde liczby: single-pass to
najsłabsza metoda; dekompozycja +15% wierności, pętla z heatmapą 78→85 pkt podobieństwa.

## FILOZOFIA
VLM-y mają 3 udokumentowane ślepoty: **pomiar px/odstępów, dokładne kolory, OCR tekstu** —
te trzy rzeczy ZDEJMUJEMY z modelu i podajemy jako twarde dane policzone algorytmicznie.
Model robi to, w czym jest dobry: strukturę i styl. Wierność domyka MIERZALNA pętla
render→diff→popraw (nie „na oko").

## NARZĘDZIA (scripts/mockup-tools/)
1. **`mockup-ir.py <makieta.png>`** → `IR.json` + `makieta-annotated.png`:
   - paleta: k-means/median-cut → lista hex + % udziału (tło/tekst/akcent);
   - skala typograficzna: OCR (PaddleOCR; fallback tesseract) → wysokości bbox tekstów
     → klastry (H1≈Xpx, H2≈Ypx, body≈Zpx) + pozycje X (wcięcia/wyrównania);
   - bloki: OpenCV findContours → bboxy kart/kolumn/przycisków `[{n,x,y,w,h}]`
     (współrzędne też w skali 0-1000);
   - anotacja SoM: makieta z ponumerowanymi bboxami + siatka 128px + podpis wymiarów.
2. **`render-diff.py <sekcja-url/plik> <makieta.png> <selektor-CSS> <szerokość>`** → kompozyt
   (makieta | render | heatmapa pixelmatch) + **SSIM skalar** + lista regionów różnic.
   (`<selektor-CSS>` = selektor sekcji do wycięcia z renderu, np. `#hero`; pozycyjny, PRZED
   szerokością — patrz sygnatura skryptu `target makieta selector width`.)
   Render headless Chrome w KANONICZNEJ szerokości = szerokość makiety (skala musi się
   zgadzać!). Tracking **keep-best** (zachowuj najlepszą wersję wg SSIM, nie ostatnią).
3. **`sekcja-diff.py <url> <slug> [--viewport 390]`** → batch kompozytów WSZYSTKICH sekcji
   z granic DOM + `dopasowanie/DOPASOWANIE.md` (SSIM typowany + kolumna LAYOUT + rubryka) ORAZ
   **PĘTLA DELT (audyt 18.07): sekcja „DELTY POMIAROWE per sekcja"** (marker
   `<!-- DELTY-POMIAROWE -->`) = render `getComputedStyle`/`getBoundingClientRect` vs IR makiety
   → KONKRETNE delty: font-size H1/eyebrow vs `scale_px_norm`, kolor tła ΔE (`→ ustaw --paper`),
   pozycja chip-trust (cx), swash/podkreślenie `.hi`, **`region-SSIM copy`** (SSIM na blokach
   TEKSTU = sygnał DYSKRYMINUJĄCY, w przeciwieństwie do raw-SSIM real-vs-AI, który wierności NIE
   dyskryminuje). Montaż/koder konsumuje delty do PUNKTOWYCH poprawek (nie rewrite).

## PROCEDURA (per sekcja)
**Krok 0 — IR:** mockup-ir.py na parze makiet (desktop+mobile).
**Krok 1 — CALL KODERA** (gpt-5.6-sol, effort=high cap ~5k; 504 → medium):
- obrazy: makieta ANOTOWANA (detail high) [+ mobile-makieta];
- tekst: **DOKŁADNE copy sekcji = treść z PROMPTU makiety** (nie każ czytać z PNG — render
  tekstu gpt-image bywa niedokładny; treść w prompcie i na makiecie jest IDENTYCZNA, bo
  prompt podaje ją w cudzysłowach — Z2/F2 ⚓). Rozjazd treści prompt↔makieta zauważony przy
  kodowaniu = poprawka GRAFIKI, nie decyzja kodera;
- IR jako tekst — **blok `ir.root.css` DOSŁOWNIE (wdrożenie wierności 18.07)**: koder dostaje
  gotowy `:root{}` (DOKŁADNE hex tła/tekstu/akcentu + `typo_clamp` zmiennych `--typo-*`) i wkleja
  go 1:1. ⛔ **ZAKAZ RE-APROKSYMACJI** zmierzonych hex/px (koder aproksymował #FAF3E6 przy
  zmierzonym #F6F2ED). Zamiast „PALETA: #…" podawaj `ir.root.css` + „SKALA TYPO @1180: H1≈Xpx"
  ze **`scale_px_norm`** (px znormalizowane makieta 1536→render ~1180) — NIE surowe px z makiety
  ani „clamp z głowy". BLOKI: #1 karta zdjęcia x=0-460 y=… (0-1000); słownik klas; realne URL-e assetów;
- CoT wymuszony: „NAJPIERW wypisz siatkę sekcji (wiersze/kolumny/wyrównania z bboxów),
  POTEM kod" (layout-as-thought);
- zakazy + kontrakt jak w standardzie.
**Krok 2 — RENDER-DIFF:** render-diff.py → SSIM + heatmapa + kompozyt.
**Krok 3 — DECYZJA:**
- SSIM ≥ ~0.90 **i** checklist elementów (model odhacza: każdy element makiety obecny
  w kodzie — existence/text/position/color) → DONE;
- SSIM < ~0.80 → **REWRITE od zera** (rewrite-not-patch): nowy call z listą delt jako
  „czego unikać" — BEZ starego kodu;
- 0.80-0.90 → **EDIT punktowy**: feedback ZLOKALIZOWANY po numerach SoM
  („#3 CTA za małe ~30%, tło #F5F5F5→#FFF, karty 2 kolumny→3") + oba obrazy + heatmapa;
  edytuj wskazane bloki, nie regeneruj całości.
**Krok 4 — pętla** aż DONE lub brak poprawy SSIM 2 rundy (→ eskalacja: regeneracja
grafiki sceny / nota). Publikowana jest wersja KEEP-BEST.
**Krok 5 — DOWÓD (OBOWIĄZKOWY, gate):** każda sekcja kończy się zapisem
`FABRYKA-*/<slug>/dopasowanie/NN-<sekcja>.png` (makieta|render|heatmapa) + wierszem w
`dopasowanie/DOPASOWANIE.md` (SSIM · werdykt vision · v#). BEZ tego pliku sekcja NIE jest
DONE — zdanie „przeniesione 1:1" w LEDGER bez kompozytu = niedozwolone (incydent Loczek
06-korzyści 17.07: biały panel+overlap makiety → open+kafel-podium; przepuszczone, bo
kompozytu nie było — jedyna sekcja z dowodem [hero] była jedyną bez dryfu). Batch:
`sekcja-diff.py <url> <slug>` generuje wszystkie NN naraz z granic DOM.
**🎯 PĘTLA DELT (18.07, część F7.1): `sekcja-diff.py` dokłada do DOPASOWANIE.md sekcję
„DELTY POMIAROWE per sekcja" (font-size vs `scale_px_norm` / kolor-ΔE / pozycja chipa / swash
+ `region-SSIM copy` na blokach tekstu — DYSKRYMINUJE, obok noty „raw-SSIM nie dyskryminuje").
Montaż/koder konsumuje delty do PUNKTOWYCH poprawek (nie rewrite całości).** OCR dla IR:
PaddleOCR bywa niedostępny (Py3.14) → fallback Tesseract z auto-językiem; **dla PL doinstaluj
`pol.traineddata`** (bez niego diakrytyki gubione), NIGDY nie akceptuj `[?]` w odczycie tekstu.
**Dowód jest DWUKROTNY: desktop (1280) I mobile (390) — `sekcja-diff.py --viewport 390`;
mobile bez makiety = składanka render-only z werdyktem jakości (incydent Loczek 17.07: mobile
nie było sprawdzane wcale).** Mobilne kompozyty = `dopasowanie/NN-<sekcja>-m.png`, werdykty w
sekcji `<!-- MOBILE-390 -->` DOPASOWANIE.md; gate-check egzekwuje komplet `-m` + werdykty.
**📏 ZAMKNIĘCIE SEKCJI = GATE R13, NIE SUROWY SSIM (po hero Uśmieszka surowy 0.7829): sekcja
jest DONE dopiero gdy 0 LAYOUT-FAIL (DOM self-checki) ∧ RUBRYKA 5×T/N → WERDYKT TAK ∧ SSIM
TYPOWANY OK — KODOWA <0.85 desktop / <0.80 mobile = LAYOUT-FAIL; SCENOWA: maska sceny cap
~0.70 (INFO) + reszta po zamaskowaniu sceny <0.85 = FAIL. Kanon = `gate-manifest.json
layout_diff`.** Surowy SSIM CAŁEJ sekcji STERUJE pętlą (Krok 3: rewrite/edit/keep), NIE zamyka.
Werdykt „ten sam projekt?" jest WSPÓŁ-warunkiem (może zaostrzyć, nie obniżyć). Przy tle
scene-from-mockup (STANDARD F3.1) cap dotyczy TYLKO maski sceny — niski SSIM reszty to kod albo
grafika do poprawy, nie „sufit danych".

**🔒 RUBRYKA WERDYKTU (R13 — OBOWIĄZKOWA w DOPASOWANIE.md, egzekwowana przez `gate-check.py`).**
Każdy werdykt sekcji NIE jest prozą — to 5 pól T/N + WERDYKT. Format wiersza (kolumna „werdykt"):
`skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK`.
(⚠️ pole 4 = `krawedz`, NIE `tresc_od_krawedzi` — gate matchuje `\bkraw` i podkreślnik przed
„kraw" psuje match = cichy FAIL 4/5 pól; masażer 19.07.)
- **WERDYKT=TAK bez kompletu 5×T = FAIL** (nie wolno „zaliczyć" sekcji z otwartym defektem).
- **Sekcje KODOWE:** fraza-wytrych w wierszu werdyktu = FAIL. Zbanowane: `bez wpływu`, `reflow`,
  `sufit`, `cap ~0`, `świadoma`, `pomijalne`, `do decyzji` (to były usprawiedliwienia odpuszczające
  defekty — incydent Odpalak wideo). Chcesz zamknąć mimo różnicy? Napraw albo postaw pole na `N`
  i uzasadnij MERYTORYCZNIE poza wierszem werdyktu.
- 5 pól = te same osie co LAYOUT-DIFF: skala elementów, AR/proporcje, guttery, treść od krawędzi,
  wysokość vs makieta. `sekcja-diff.py` wypełnia kolumnę LAYOUT (OK / LAYOUT-FAIL: …) strukturalnie;
  vision wypełnia rubrykę — rozjazd LAYOUT=FAIL a rubryka=5×T sam się rzuca w oczy.

**🔩 TWARDE LAYOUT-FAIL = DOM SELF-CHECKI (mierzone w SAMYM renderze, BEZ makiety — 18.07).**
Trzy siatki obrony, NIE jedna: (a) **DOM self-checki** = twarde LAYOUT-FAIL; (b) **IR-compare + raw-SSIM**
= tylko „info:" (szum makiet AI — mockup-ir/OCR na pastelowych full-bleed kanwach jest zawodny; SSIM
real-render vs AI-makieta nie dyskryminuje wierności); (c) **rubryka vision 5×T/N** = trzecia siatka.
Powód: faza 4 Drapka słusznie zdemotowała checki oparte na IR-makiety, ale przez to rozbroiła 3/4
strażników geometrii z R13 — przywrócone jako self-checki, które mierzą PATOLOGIĘ SAMĄ W SOBIE:
- **kafle-sliver** (DOM): kolumny kafli cols≥5 & med. szer <12% & portret (ar<0.8) → siatka „drzazgi".
- **pustka-pod-obrazem** (DOM): dominujący obraz IN-FLOW `object-fit:contain` w za WYSOKIM boksie
  (H/W ≥ 1.40) z pustką pionową (letterbox box-vs-`naturalWidth/Height`) ≥ 30% → produkt pływa w białym
  boksie; wariant B: dolne >30% sekcji bez żadnej treści (`contentBlock.B` ≤ 0.70). Łapie „obraz za
  wysoko podnosi sekcję" (Odpalak zamów). NIE liczy `contain`, który się mieści (Loczek faq), ani `fill`
  (Loczek zamów), ani kwadratowego boksu (Drapek zamów, boxAR 1.00).
- **gutter-asymetria** (DOM): (3a) scena full-bleed kryjąca TYLKO jeden bok (wpct<0.85) i off-center
  (|cx−0.5|>0.12), treść po drugiej stronie → „scena zła strona / treść wciśnięta w gutter" (Odpalak
  hero/final: scena 57–60% cx 0.70–0.72 vs wierne full-bleed cx 0.50); (3b) blok treści przyklejony do
  boku względem `.wrap`, a przeciwny gutter PUSTY (nie kryty żadnym obrazem).
Progi w `gate-manifest.json` → `layout_diff.progi` (`pustka_*`, `gutter_*`), kalibrowane empirycznie:
FAIL Odpalak (wideo+zamów+hero+final), PASS Drapek (0/13) + Loczek (0/12). Self-checki nie wymagają IR.

## ZASADY DODATKOWE
- **Splice: auto-fix id sekcji na KAŻDE odstępstwo** (lekcja Skrolik 22.07): koder mimo
  briefu daje własne id (`02-demo`, `final-cta`) — splice() ma przemapować id PIERWSZEGO
  `<section id="...">` na kanoniczny sid, wraz z selektorami `#id` w CSS/JS i
  `getElementById` (wzór: FABRYKA-pierscien/call-sections.py). Twardy fail tylko gdy
  brak jakiegokolwiek `<section id>`.
- Sekcja bardzo złożona (gęsta siatka) → potnij makietę na pod-bloki (DCGen/LaTCoder),
  koduj blokami, składaj wg bboxów.
- Assety (zdjęcia/ikony) — realne pliki (kadry z makiety tylko jako [D]-ozdobniki);
  layout ZAWSZE kodem, nigdy „PNG jako strona".
- Obraz do modelu: detail=high; pamiętaj o kafelkowaniu (1536×1024 traci detal —
  dlatego liczby idą TEKSTEM, nie „z oka").
- Werdykt końcowy nadal wizualny (kompozyt, „czy to ten sam projekt?") — SSIM steruje
  pętlą, człowiek/krytyk ocenia charakter.
- **Zrzuty do diff/kompozytów ZAWSZE z force-reveal + eager-img** (narzędzie `capture-lint.py`
  w mockup-tools — wymusza `.reveal.in`, czeka naturalWidth>0, wykrywa h-scroll/broken-img);
  bez tego kolumna RENDER jest „wyprana" (opacity:0) = fałszywy alarm.
- **SZABLON BRIEFU KODERA sekcji** (luka wykryta w teście Uśmieszka — używać zawsze):
  {sekcja+cel · anotowana makieta URL (desktop+mobile) · IR tekstem = blok `ir.root.css`
  DOSŁOWNIE (`:root{}` + `typo_clamp`, wklej 1:1, ZAKAZ re-aproksymacji) / SKALA TYPO ze
  `scale_px_norm` @1180 / BLOKI 0-1000 · DOKŁADNE copy w cudzysłowach · realne URL-e assetów/scen ·
  słownik klas z prefiksem sekcji · kontrakt hooków JS (nazwa+zakres+jednostka!) ·
  format odpowiedzi: `<section>` + scoped `<style>`, marker `<!--PAYBADGES-->` BEZ
  własnego wrappera · zakazy + dane twarde · „NAJPIERW siatka, POTEM kod"}.
- **Klasy globalne szkieletu w briefie = TYLKO te bez pułapek bazowych stylów (LL-032,
  Ugniatek F4).** Jeśli szkielet definiuje klasę „nazwaną ogólnie" z agresywną bazą
  (np. `.callout{position:absolute;height:1px}` = hairline), a brief wymienia ją jako
  „globalną do użycia", koder wiesza na niej CHIPY/etykiety → collapse do kreski 1px,
  absolute wypada z siatek (3 defekty mobile w jednym przebiegu). Zasada: w briefie
  wymieniaj tylko klasy „bezpieczne" (.wrap/.h2/.btn.cta/.reveal); klasy z bazą
  pozycjonującą LUB rozmiarową dawaj z JEDNOZDANIOWYM kontraktem („.callout = hairline
  ze spanem — do chipów NIE używać / resetuj position+height+width"). Smoke-test
  wizualny mobile PRZED done kroku wyłapuje tę klasę błędów.
- **`<img>` z atrybutami wymiarów + CSS `aspect-ratio` = OBOWIĄZKOWE `height:auto` (LL-033).**
  Atrybut `height` to prezentacyjny hint UA: autorski `width:100%` nadpisuje szerokość, ale
  wysokość z atrybutu zostaje i `aspect-ratio` jest martwe (Ugniatek: kwadraty 1/1 → paski
  144×800). Self-check: porównaj computed AR z zadeklarowanym na każdym img.
- **Centrowanie NIGDY transformem na elementach `.reveal` (LL-033).** `.reveal.in{transform:none}`
  kasuje `translateX(-50%)` po animacji — karta „ucieka" z osi. Centrowanie = marginesy/inset.
- **Wstawki montażowe = markery jednoznaczne, nigdy replace pierwszego `</body>` (LL-035).**
  Pierwsze wystąpienie bywa w KOMENTARZU dokumentacyjnym (runtime-snippet); treść wnoszona
  obok komentarzy sprawdzaj na `-->` (przedwczesne domknięcie = wyciek dokumentacji do DOM —
  u Ugniatka przykładowy `data-price-raw` nadpisał cenę na całej stronie). Ekstrakcję bloków
  z out-*.md kotwicz od ` ```html `, nie od tekstu nagłówka. Po montażu: smoke koniec strony
  + assert ceny w renderze.
- Ceny psychologiczne — przykłady: 84,90 / 99,90 / 129,90 / 149 (płaska OK przy „ładnej"
  kwocie pod barierą) / 249 (≥150 → pełne lub 9,00).
- ~~„Przy grafika-first pętla często zamyka się na v1 (SSIM 0.69-0.90 z werdyktem TAK =
  gotowe)"~~ — **USUNIĘTE (pivot MAKIETA JEST ŚWIĘTA, 16.07):** ta furtka przepuściła hero
  Uśmieszka z 0.78. Obowiązują progi twarde z Kroku 4.

## WNIOSKI Z PILOTA (sekcja demo Świtka, 2026-07-16) — TWARDE
- **Hosting makiet obowiązkowy.** `wf2-gpt` odrzuca input >400000 znaków (`input_za_dlugi`),
  więc data-URI makiety (base64 ~2-5 MB) NIE przejdzie. Anotowane makiety wgraj do
  publicznego bucketa `attachments` (service-role, `x-upsert:true`) i podaj URL —
  model dostaje pełny detal, body zostaje krótkie.
- **Effort/tokeny.** `high` na złożonej sekcji często daje 504 → domyślnie `medium`.
  `max_output_tokens=5000` za mało na pełną sekcję z RWD (obcina `@media`) → dawaj **8000**.
- **Detekcja bloków na miękkich pastelowych makietach** (blask świtu, full-bleed gradient):
  same `findContours` zlewają wszystko w 1 blob. Skuteczne: karty obrazu = **wysoki próg
  delty od koloru tła** (odrzuca subtelne dekory) + **grupy tekstu z OCR** (klastrowanie słów
  → linie → bloki). Tak powstaje sensowna siatka SoM.
- **SSIM mobile jest systemowo zaniżony przez aspect mismatch.** Kanwa mockupu
  (np. 1024×1536) jest bardziej ściśnięta w pionie niż realna sekcja RWD, więc kontrolki
  wypadają poza porównywany (nakładający się od góry) kadr → SSIM ~0.72 mimo wiernego layoutu.
  Rekomendacja narzędziowa: dla mobile **letterbox obu obrazów do wspólnego aspektu** albo
  ocena strukturalna. **⚠️ R13: „werdykt wizualny rządzi" USUNIĘTE** — sam werdykt vision
  odpuszczał defekty mechaniki (Odpalak wideo: „kafle mniejsze niż makieta — bez wpływu na
  charakter"). Werdykt vision jest teraz WSPÓŁ-warunkiem w RUBRYCE (Krok 5), a mechanikę i
  proporcje twardo pilnuje LAYOUT-DIFF strukturalny (patrz niżej) — vision może zaostrzyć, nie
  odpuścić.
- **Naturalny sufit SSIM ~0.68–0.75 dotyczy TYLKO MASKI SCENY (R13 — nie całej sekcji).**
  Scena z OSOBNEJ generacji jest „ta sama" semantycznie, ale NIE pikselowo (inne ułożenie
  rekwizytów/faktur). Dlatego dla sekcji SCENOWEJ SSIM liczymy **DWUSKŁADNIKOWO** (`sekcja-diff.py`,
  `ssim_split_scene`): (a) **maska bboxa sceny** (z IR lub selektorów `.hero-media` / `.prob-scene`
  / `.final-scene` / `img[data-scene]`) — cap ~0.70 OSOBNO, tu sufit jest legalny; (b) **RESZTA
  sekcji po zamaskowaniu sceny** (kolumny copy/karty — tam kod odpowiada za piksele) — próg 0.85.
  Zakaz stosowania sufitu ~0.7 do CAŁEJ sekcji (to była furtka, którą przeszły zepsute sekcje).
  Dla sekcji KODOWEJ (patrz „TYPY SEKCJI") sceny nie ma → SSIM twardy < 0.85 desktop / 0.80 mobile
  = LAYOUT-FAIL. **Uwaga empiryczna R13:** SSIM real-render vs makieta AI ma niski sufit na OBU
  landingach (dobry i zły) → SSIM sam NIE dyskryminuje wierności; robi to LAYOUT-DIFF + RUBRYKA.

## TYPY SEKCJI (R13 — źródło: `gate-manifest.json` → `sekcja_typy`)
- **KODOWA** (mechanika 1:1 z makiety, brak generowanej sceny): `wideo, porownanie, faq, opinie,
  zamow, zaufanie, galeria`. SSIM twardy < 0.85 = LAYOUT-FAIL. Musi bazować na MODULE KANONICZNYM
  gdy istnieje (`docs/zbuduje/moduly/`).
- **SCENOWA** (dominuje generowana scena): `hero, problem, demo, final, korzysci`. SSIM
  dwuskładnikowy (maska sceny cap ~0.70 + reszta 0.85). Aliasy DOM→typ: `trust→zaufanie`,
  `benefits→korzysci`, `video→wideo`, `reviews→opinie`, `oferta→zamow`, `finalcta→final`.
  Nadpisanie per landing: `sekcja_typy.override_per_landing`.
- **Pomiar hero ze `svh`: viewport-diff.py (NOWE narzędzie)** — render-diff.py ma domyślny
  viewport 2400px wysokości, co rozciąga sekcje `min-height:100svh` i psuje crop `cover`
  (fałszywy SSIM). Pierwszy ekran porównuj: `viewport-diff.py <plik> <makieta> 1536 1024`
  (viewport = wymiary makiety, force-reveal, zrzut bez captureBeyondViewport).
- **KALIBRACJA TYPOGRAFII POMIAREM, NIE OKIEM (Tomek 16.07 — obowiązkowe):**
  `viewport-diff.py <plik> x <W> <H> --measure "#hero .hero-title, ..."` zwraca font-size,
  wysokość glifów (canvas TextMetrics) i bbox elementu w viewporcie makiety — porównuj
  z bboxami OCR z `IR.json` (mockup-ir). ⚠️ Wysokość glifów NIE wystarcza przy INNYM foncie
  niż na makiecie (Cormorant jest wąski — przy tej samej wysokości linia wygląda mniejsza):
  kalibruj po SZEROKOŚCI LINII nagłówka (canvas `measureText` dla kilku font-size → wybierz
  rozmiar, przy którym najdłuższa linia ≈ szerokość linii z makiety). Hero Uśmieszka:
  OCR-bloki H1 y153-336, linie ~630-660px → Cormorant 600 potrzebował 104px (nie 74px
  „z clampa"), cena 82px. Iteruj: zmiana CSS → --measure → zgodność → dopiero werdykt vision.
- **Kontrakt zmiennych CSS w briefingu (jednostki!).** Koder generuje własne nazwy/typy
  (np. `--sun-p` jako `%`), a istniejący JS podaje `0..1` → animacja martwa. W briefingu
  podaj DOKŁADNY kontrakt hooków (nazwa, zakres, jednostka), albo reconciluj przy montażu
  (`circle at calc(var(--sun-p)*100%)`). Zweryfikuj suwak skryptem CDP (nie „na oko").
- **Montaż markerowy:** usuń stary scoped CSS sekcji z `<head>` (konflikt selektorów) i wklej
  `<section>`+`<style>` kodera w `<body>`; zachowaj id/klasy hooków JS. Weryfikacja twarda:
  `scrollWidth-clientWidth==0`, `img.naturalWidth>0`, suwak aktualizuje `.demo-time b`.
