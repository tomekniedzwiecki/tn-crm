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
sylwetki — edit potrafi zmienić kształt) · **#2b gdy sekcja jest KOLEJNĄ sceną produktową:
wymuś INNY kąt/kontekst niż już użyte pozy („avoid: same upright pose as hero") — inaczej
„SAME placement" produkuje klony (incydent Loczek 17.07: hero=03=12 ta sama poza)** ·
#3 strefy treści „fade seamlessly into flat solid
#HEX" · #4 REMOVE all text/UI, leave empty negative space. Dryf rekwizytów = cecha metody
(SSIM cap ~0.7) — oceniaj kierunkowo + werdykt vision.

**EDITS+MASK (inpainting):** `/v1/images/edits`, `image[]`=makieta (baza pierwsza),
`mask`=PNG tych samych wymiarów (alfa=0 = edytuj; z bboxów tekstu z IR + feather).
**NIE pixel-perfect** (soft-mask, rerender całości) — tylko dla tekstu na fakturze.
Wymaga rozszerzenia `generate-image/index.ts` (pola `edit_image_url`, `mask_url`;
gałąź edits); `wf2-gen` = proxy, bez zmian. [TODO]
⚠️ KOREKTA 17.07: **`input_fidelity` NIE dotyczy gpt-image-2** (parametr odrzucany —
wierność inputu wbudowana); wcześniejsza nota o `input_fidelity` obowiązuje tylko przy
zejściu na gpt-image-1/1.5.

## 3a. ARSENAŁ GRAFICZNY — co generować poza scenami/packshotami (klasa [D-art])

Grafika landingu to nie tylko sceny i packshoty (research 17.07). Dozwolony arsenał
dekoracyjny cięty z arkuszy (biel→alpha, klasa **[D-art]** — reguły w STANDARD F3.4):
- **hand-drawn akcenty** (arkusz: strzałki/podkreślenia markerem/kółka, 1 kolor akcentu,
  felt-tip, na czystej bieli) — najwyższy zwrot „human" przy małym ryzyku; max 2-3/stronę,
  nakładka `mix-blend-mode:multiply`, nigdy POD tekstem wymagającym kontrastu;
- **podkłady badge/pieczęci** (ząbkowany seal/ribbon, flat, 1 kolor, PUSTY środek) —
  **tekst PL zawsze nakłada KOD** (diakrytyki!); prosty seal lepiej w czystym SVG;
- **ramki washi-tape / polaroid / torn-paper** pod realne UGC (rotate ~2°, collage-feel;
  ramka = D-art, zawartość = klasa U — osobne tagi);
- **serie spot-ilustracji** z JEDNEGO arkusza 3×3 (wspólna paleta ≤3 kolorów) — tylko dla
  marek „ciepłych"; clinical/tech → zostać przy flat SVG;
- **tekstury papieru/lnu** — OSTROŻNIE: gpt-image NIE robi prawdziwego seamless; kafel
  1536² jako `cover` bez repeat, albo mirror-blend szwu w PIL (test `np.roll`).
**Reguła WEKTOR-FIRST (twarde NIE dla AI-PNG):** section dividers, wielkie liczby kroków
(typografia!), noise/grain (SVG `feTurbulence`, opacity ≤.05), proste seale, watermark-
patterny, izometryczne 3D-scenki (AI-slop tell), confetti. Format D-art: WebP/PNG z alfą,
512px (drobne) / 1024px (detal), data-URI dla małych.

## 4. WERYFIKACJA 1:1 — REGION-SSIM (nie cała sekcja!)

Wytnij TEN SAM bbox z makiety i z grafiki/renderu → wspólny rozmiar → SSIM sub-rectu;
bboxy usuniętego tekstu MASKUJ przed pomiarem. Progi: crop → ~1.0 z definicji (sanity
wyrównania); regen/edits → kierunkowo (cap ~0.7), twardy pomiar tylko na warstwie treści.
[TODO] `render-diff.py --region x,y,w,h [--mask-bbox ...]`.

## 4a. PODMIANA SCENY PO AKCEPCIE = GATE KOMPOZYCJI (incydent Odpalak 17.07)
Scena już osadzona na landingu (przeszła dowód dopasowania / widział ją Tomek) jest
ZAMROŻONA jak makieta. Każda podmiana (np. „tylko poprawka LCD") wymaga: (a) regen z
ORYGINALNĄ sceną jako ref + „SAME scene, SAME composition and framing, only change: …";
(b) gate PODWÓJNY: wierność paszportu ORAZ kompozycja vs oryginał (vision: to samo
kadrowanie? produkt to samo miejsce/rozmiar? ten sam aspekt!); (c) FAIL → zostaje
oryginał. Incydent: „poprawka LCD" podmieniła sceny 3:2/2:3 na generacje 1:1 (pikselowa
forma aspektu = cichy fallback, „zaakceptowany" przez agenta) → regres kompozycji na
live. **⛔ NIGDY pikselowa forma aspektu ('1536x1024') — ZAWSZE stringowa ('3:2'/'2:3'/
'1:1'); fallback do 1:1 przy scenie niekwadratowej = FAIL, nie „akceptowalne".**

## 5. FAKTY TWARDE (nie odkrywać ponownie)

- Makiety i output gpt-image-2 = max **1536×1024 / 1024×1536** — regen nie podnosi rozdz.
- `generate-image` z referencjami woła `/images/edits` (bez maski) — dryf rekwizytów to
  cecha editów bez maski. **INCYDENT 17.07: do tego dnia `reference_images` jako STRINGI
  były gubione po cichu (ref.url===undefined) — CAŁA fabryka generowała bez referencji,
  czysto z promptu.** Od 17.07: stringi → typ 'ref', produkt/logo wymagają obiektów
  `{url,type}`, brak załadowanej referencji = twardy błąd, produkt sortowany jako image[0].
- Edits+mask w gpt-image = soft-mask + pełny rerender (nie DALL·E-2-style podstawienie).
- Jedyna prawdziwie pixel-perfect ścieżka = CROP (+ paint-over na płaskim).
