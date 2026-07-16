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
**📏 PRÓG MINIMALNY ZAMKNIĘCIA (twardy, po hero Uśmieszka 0.7829): desktop <0.85 albo
mobile <0.78 ⇒ sekcja NIE jest DONE — niezależnie od werdyktu wizualnego.** Werdykt
„ten sam projekt?" jest WSPÓŁ-warunkiem (może zaostrzyć, nie obniżyć). Przy tle
scene-from-mockup (STANDARD F3.1) cap assetowy nie istnieje — niski SSIM to kod albo
grafika do poprawy, nie „sufit danych".

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
  ocena strukturalna; próg DONE mobile realnie ~0.72–0.80. **Werdykt wizualny rządzi.**
- **SSIM przy scene-from-mockup — DOPRECYZOWANE (hero Uśmieszka 16.07):** scena z OSOBNEJ
  generacji jest „ta sama" semantycznie, ale NIE pikselowo (inne ułożenie rekwizytów/faktur)
  → SSIM całej sekcji ma naturalny sufit ~0.68–0.75 mimo wiernego kodu. Progi twarde (0.85/0.78)
  stosować do sekcji, których assety są 1:1 (packshoty, UGC); dla sekcji z generowaną sceną:
  oceniaj SSIM KIERUNKOWO (rosnący = lepiej) + werdykt vision na kompozycie decyduje o DONE,
  a diffy sprawdzaj na WARSTWIE TREŚCI (kolumna copy/karty — tam kod odpowiada za piksele).
  Sufit zniknie dopiero, gdy tło = dokładnie te same piksele (inpainting makiety — do zbadania).
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
