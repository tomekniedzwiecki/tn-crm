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
2. **`render-diff.py <sekcja-url/plik> <makieta.png> <szerokość>`** → kompozyt
   (makieta | render | heatmapa pixelmatch) + **SSIM skalar** + lista regionów różnic.
   Render headless Chrome w KANONICZNEJ szerokości = szerokość makiety (skala musi się
   zgadzać!). Tracking **keep-best** (zachowuj najlepszą wersję wg SSIM, nie ostatnią).

## PROCEDURA (per sekcja)
**Krok 0 — IR:** mockup-ir.py na parze makiet (desktop+mobile).
**Krok 1 — CALL KODERA** (gpt-5.6-sol, effort=high cap ~5k; 504 → medium):
- obrazy: makieta ANOTOWANA (detail high) [+ mobile-makieta];
- tekst: **DOKŁADNE copy sekcji = treść z PROMPTU makiety** (nie każ czytać z PNG — render
  tekstu gpt-image bywa niedokładny; treść w prompcie i na makiecie jest IDENTYCZNA, bo
  prompt podaje ją w cudzysłowach — Z2/F2 ⚓). Rozjazd treści prompt↔makieta zauważony przy
  kodowaniu = poprawka GRAFIKI, nie decyzja kodera;
- IR jako tekst: „PALETA (użyj DOKŁADNIE): #… (tło 62%), …; SKALA TYPO: H1≈52px…;
  BLOKI: #1 karta zdjęcia x=0-460 y=… (0-1000)"; słownik klas; realne URL-e assetów;
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
**Dowód jest DWUKROTNY: desktop (1280) I mobile (390) — `sekcja-diff.py --viewport 390`;
mobile bez makiety = składanka render-only z werdyktem jakości (incydent Loczek 17.07: mobile
nie było sprawdzane wcale).** Mobilne kompozyty = `dopasowanie/NN-<sekcja>-m.png`, werdykty w
sekcji `<!-- MOBILE-390 -->` DOPASOWANIE.md; gate-check egzekwuje komplet `-m` + werdykty.
**📏 PRÓG MINIMALNY ZAMKNIĘCIA (twardy, po hero Uśmieszka 0.7829): desktop <0.85 albo
mobile <0.78 ⇒ sekcja NIE jest DONE — niezależnie od werdyktu wizualnego.** Werdykt
„ten sam projekt?" jest WSPÓŁ-warunkiem (może zaostrzyć, nie obniżyć). Przy tle
scene-from-mockup (STANDARD F3.1) cap assetowy nie istnieje — niski SSIM to kod albo
grafika do poprawy, nie „sufit danych".

**🔒 RUBRYKA WERDYKTU (R13 — OBOWIĄZKOWA w DOPASOWANIE.md, egzekwowana przez `gate-check.py`).**
Każdy werdykt sekcji NIE jest prozą — to 5 pól T/N + WERDYKT. Format wiersza (kolumna „werdykt"):
`skala_elem:T · AR_proporcje:T · guttery:T · tresc_od_krawedzi:T · wys_vs_makieta:T → WERDYKT: TAK`.
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
- Sekcja bardzo złożona (gęsta siatka) → potnij makietę na pod-bloki (DCGen/LaTCoder),
  koduj blokami, składaj wg bboxów.
- Assety (zdjęcia/ikony) — realne pliki (kadry z makiety tylko jako [D]-ozdobniki);
  layout ZAWSZE kodem, nigdy „PNG jako strona".
- Obraz do modelu: detail=high; pamiętaj o kafelkowaniu (1536×1024 traci detal —
  dlatego liczby idą TEKSTEM, nie „z oka").
- Werdykt końcowy nadal wizualny (kompozyt, „czy to ten sam projekt?") — SSIM steruje
  pętlą, człowiek/krytyk ocenia charakter.
- **Zrzuty do diff/kompozytów ZAWSZE z force-reveal + eager-img** (narzędzie `capture.py`
  w mockup-tools — wymusza `.reveal.in`, czeka naturalWidth>0, wykrywa h-scroll/broken-img);
  bez tego kolumna RENDER jest „wyprana" (opacity:0) = fałszywy alarm.
- **SZABLON BRIEFU KODERA sekcji** (luka wykryta w teście Uśmieszka — używać zawsze):
  {sekcja+cel · anotowana makieta URL (desktop+mobile) · IR tekstem (PALETA DOKŁADNIE /
  SKALA TYPO / BLOKI 0-1000) · DOKŁADNE copy w cudzysłowach · realne URL-e assetów/scen ·
  słownik klas z prefiksem sekcji · kontrakt hooków JS (nazwa+zakres+jednostka!) ·
  format odpowiedzi: `<section>` + scoped `<style>`, marker `<!--PAYBADGES-->` BEZ
  własnego wrappera · zakazy + dane twarde · „NAJPIERW siatka, POTEM kod"}.
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
