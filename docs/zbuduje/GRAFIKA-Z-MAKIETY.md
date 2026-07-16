# GRAFIKA-Z-MAKIETY — warstwa graficzna sekcji: rozpoznanie i ekstrakcja 1:1

**Status: OBOWIĄZUJE (2026-07-16 późny wieczór; zasada Tomka + synteza 2× research Sonnet).**

**ZASADA (Tomek):** grafiki nadają stronie styl i robią największe wrażenie — używamy ich jak
najwięcej. Dla KAŻDEJ sekcji makiety trzeba rozpoznać, co jest **WARSTWĄ GRAFICZNĄ** (sceny,
foto-pasy — np. „morze" w 02-trust, duże zdjęcia sekcji — np. 05-benefits, ornamenty), a co
**ELEMENTEM KODOWYM** (tekst, przyciski, karty, ikony, listy). Każdy element graficzny musi
zostać dostarczony jako OSOBNY plik wyciągnięty z zaakceptowanej makiety (1:1), a kod buduje
na nim resztę. Dotyczy każdej sekcji — nie tylko hero.

## 1. ROZPOZNANIE WARSTW (per makieta, PRZED kodowaniem)

**Vision-checklist (agent ogląda makietę + bboxy z IR; NIE liczy pikseli):** dla każdego
dużego regionu orzeknij:
1. WARSTWA: grafika (foto/scena/pas/ornament) czy KOD (tekst/przycisk/karta/ikona/lista)?
   Przycisk/pill/karta z gradientem i tekstem = KOD (mała powierzchnia + ostry prostokąt
   + tekst). Foto-pas / scena / blask / łuk = GRAFIKA.
2. TYP grafiki: `scena-fullbleed` | `pas-dekoracyjny` | `zdjecie-w-karcie` | `ornament`.
3. Czy zawiera PRODUKT? Czy ma wypalony TEKST/UI (overlay)?
4. Rekomendacja: crop czy regeneracja (drzewo niżej).
5. Klasa OBRAZY-ROLE (P/U/S) + zgodność z allowlistą slotu.
Frosted-glass karta na scenie = KOD, ale tło POD nią to część sceny-fullbleed (nie wycinać
dziury — scena idzie w całości, kod nakłada glass).

**Detektor algorytmiczny `detect_graphic_regions` (mockup-ir.py) — SPEC gotowy, do
implementacji:** klasyfikacja kafli 24px w Lab (kluczowy dyskryminator foto/flat =
`chroma_spread`>10 + `lum_var`>14; flat = `delta_bg`<18 + `lum_var`<6; UI = OCR-hit /
gęste krawędzie w małym prostokącie), morfologia + typowanie geometrią (pas = ≥0.9·W przy
krawędzi; fullbleed = ≥30% area + 2 krawędzie; ornament = fill<0.35), wynik w IR.json jako
`graphic_regions[{bbox,typ,ma_overlay_tekstu,rekomendacja,confidence}]`, confidence<0.65 ⇒
werdykt vision. Pseudokod: raport researchu 16.07 (transkrypt sesji fabryki).

## 2. DRZEWO DECYZYJNE EKSTRAKCJI (per element graficzny)

```
1. Region BEZ wypalonego tekstu/UI?
   ├─ TAK → 2
   └─ NIE → 4
2. Rozdzielczość regionu w makiecie ≥ potrzeba wyświetlania? (full-bleed 1x ≤1536px = OK)
   ├─ TAK → ► CROP (pixel-perfect, darmowy — DOMYŚLNY)
   ├─ NIE, content miękki (woda/bokeh/gradient) → ► CROP + LANCZOS ×1.3-2.0 + UnsharpMask
   └─ NIE, content ostry → ► REGEN (świadom sufitu 1536 — wyższej rozdz. NIE będzie)
3. Potrzebny inny aspekt / reframe / rozszerzenie kadru? → ► REGEN
4. Tekst/UI NA grafice:
   ├─ na PŁASKIM kolorze → ► CROP + paint-over płaskim #HEX w PIL (pixel-perfect, darmowy)
   └─ na FAKTURZE/scenie → ► EDITS+MASK input_fidelity=high (najbliższe zachowanie tła;
      wymaga rozszerzenia generate-image — sekcja 5) LUB REGEN referencyjny (akcept
      „semantycznie ta sama")
```

## 3. RECEPTURY

**CROP:** bbox z IR (0-1000 → px), `Image.crop`, krawędzie wchodzące w treść = feather
(alfa-rampa numpy) albo wypełnienie próbkowanym płaskim `#HEX` tła + gradient alfy; pasy
bezszwowe = mirror+blend końców. Eksport PNG (alfa jeśli feather) → upload `attachments`.
⚠️ Storage render API NIE upscaluje (resize-only) — nie używać do powiększania.

**REGEN referencyjny (gpt-image-2):** ref = zaakceptowana makieta + CZYSTY packshot
(NIGDY infografika — zatruwa paletę). Prompt: **numerowane REQUIREMENTS** (giną w prozie):
#1 same room/framing/light · #2 produkt SAME size and position as reference (+ krótki opis
sylwetki — edit potrafi zmienić kształt) · #3 strefy treści „fade seamlessly into flat solid
#HEX" · #4 REMOVE all text/UI, leave empty negative space. Dryf rekwizytów = cecha metody
(SSIM cap ~0.7) — oceniaj kierunkowo + werdykt vision.

**EDITS+MASK (inpainting):** `/v1/images/edits`, `image[]`=makieta (baza pierwsza),
`mask`=PNG tych samych wymiarów (alfa=0 = edytuj; z bboxów tekstu z IR + feather),
`input_fidelity=high`. **NIE pixel-perfect** (soft-mask, rerender całości) — tylko dla
tekstu na fakturze. Wymaga rozszerzenia `generate-image/index.ts` (pola `edit_image_url`,
`mask_url`, `input_fidelity`; gałąź edits ~l.199-237); `wf2-gen` = proxy, bez zmian. [TODO]

## 4. WERYFIKACJA 1:1 — REGION-SSIM (nie cała sekcja!)

Wytnij TEN SAM bbox z makiety i z grafiki/renderu → wspólny rozmiar → SSIM sub-rectu;
bboxy usuniętego tekstu MASKUJ przed pomiarem. Progi: crop → ~1.0 z definicji (sanity
wyrównania); regen/edits → kierunkowo (cap ~0.7), twardy pomiar tylko na warstwie treści.
[TODO] `render-diff.py --region x,y,w,h [--mask-bbox ...]`.

## 5. FAKTY TWARDE (nie odkrywać ponownie)

- Makiety i output gpt-image-2 = max **1536×1024 / 1024×1536** — regen nie podnosi rozdz.
- `generate-image` z referencjami JUŻ woła `/images/edits` (bez maski/input_fidelity) —
  stąd dryf rekwizytów przy scene-from-mockup.
- Edits+mask w gpt-image = soft-mask + pełny rerender (nie DALL·E-2-style podstawienie).
- Jedyna prawdziwie pixel-perfect ścieżka = CROP (+ paint-over na płaskim).
