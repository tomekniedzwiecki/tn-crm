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
- tekst: **DOKŁADNE copy sekcji** (nie każ czytać z PNG — tekst w makietach gpt-image
  bywa zmyślony; copy bierzemy z planu/danych, „użyj DOKŁADNIE tych treści");
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

## ZASADY DODATKOWE
- Sekcja bardzo złożona (gęsta siatka) → potnij makietę na pod-bloki (DCGen/LaTCoder),
  koduj blokami, składaj wg bboxów.
- Assety (zdjęcia/ikony) — realne pliki (kadry z makiety tylko jako [D]-ozdobniki);
  layout ZAWSZE kodem, nigdy „PNG jako strona".
- Obraz do modelu: detail=high; pamiętaj o kafelkowaniu (1536×1024 traci detal —
  dlatego liczby idą TEKSTEM, nie „z oka").
- Werdykt końcowy nadal wizualny (kompozyt, „czy to ten sam projekt?") — SSIM steruje
  pętlą, człowiek/krytyk ocenia charakter.
