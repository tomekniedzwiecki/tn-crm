# Kafina — Landing Brief

**Status:** 🟢 v1 · **Kierunek:** Rugged Heritage · **Workflow:** `10760f3a-280d-45e9-b7db-ec4d8ece85a5`

---

## 1. Design Manifesto

### Kierunek: **Rugged Heritage**
Estetyka warsztatowa premium. Strona ma czuć się jak otwarty magazyn Cereal Magazine z działu „Tools & Trades" — ciemna skrzynka z mosiężnym zamkiem, w środku coś, co się dziedziczy. Nie „tech-gadget", tylko „sprzęt dla ludzi, którzy zabierają swoje standardy wszędzie".

**Punkt geograficzny:** parking pod Berlinem, 4:30 rano, w kabinie TIRa pachnie kawą.
**Nie:** salon z panoramicznym oknem, golden hour, hygge.

### Tempo: **zimne, pewne, bez ozdobników**
Padding sekcji 120-160px desktop, 72-96px mobile. Animacje krótkie (400-700ms), bez bounce'u. Bliżej Filson/Red Wing niż Kinfolk.

### Typografia
- **Display:** `Archivo` 500/700/800 + **italic 400/500** — geometryczny grotesk z wagą industrial
- **Stamp/Workwear:** `Archivo 800` uppercase z letter-spacing .04em — section titles, product labels, stampy
- **Body:** `Inter` 400/500 — neutralny
- **Technical mono:** `Space Mono` 400/700 — workwear tags (LOT, CAT, ISSUE, SKU, SPEC)
- **Brak editorial italic serif** (Instrument Serif / Fraunces) — Kafina nie jest edytorial

### Paleta 60/25/15
- **60% Dominant:** `#EDE8DD` Ivory + `#F5F2EC` Paper-2 (ciepła kość słoniowa, nie cloud white)
- **25% Secondary:** `#1E3A2F` Pine Forest + `#121315` Coal Black — dwie-trzy głębokie sekcje
- **15% Accent:** `#B8903E` Brushed Brass — wyłącznie: stampy, foil stamps, hover, price rule, metal details
- **Neutral support:** `#7A7264` Stone Khaki (copy/meta), `#2E2E30` Graphite (ink-2)
- **Urgency:** `#B8553E` Rust — wyłącznie przekreślona cena (1× na stronie)

### Signature elements
1. **Stamp badge w hero** — `LOT 2026 · KAFINA · ISSUE 001` — Space Mono 700 w mosiężnym obramowaniu, jak wino/bourbon label
2. **Sekcyjne numerowanie:** `CAT. Nº 01 — HERO` (nie „Nº 01" — dodajemy catalog-style prefix). Space Mono 10px letter-spacing .24em.
3. **Oversized industrial numeral:** „20 BAR" lub „4:30" (pora poranka) w tle sekcji — Archivo 800, NIE italic, kolor paper-3 5% opacity, rotate 0° (workwear nie ma ozdobnej rotacji)
4. **Dark hero (pattern break):** Kafina startuje na coal/pine, nie na paper — od pierwszej sekundy sygnalizuje męski, warsztatowy charakter
5. **Stemple/labels workwear:** w rogu każdej dużej sekcji mały stamp SVG „KAF/001" jak plombownica — SVG 48×48px brass, subtelny

### Od czego uciekam
- Editorial italic serif (Instrument Serif, Italiana, Fraunces) — wszystkie moce Kafiny są BEZ italic, bez „kobiecego" gestu
- Round act-numerals (kółeczka) — używamy kwadratów/prostokątów, jak paletki okuć
- „Golden hour warm tones" w fotografii — nasz ton to 4:30 rano, chłodno-bursztynowy
- Glow orbs, pulsy, sparkle — zero ozdobników optycznych
- Pastel sofa + dąb podłoga (hygge) — zastępujemy ciemnym drewnem, stalą, skórą, mosiądzem

### Co NIE jest dozwolone w copy
- „Nowoczesna", „innowacyjna", „rewolucyjna" technologia — mówimy konkretami (20 bar, 90 sek, 7500 mAh)
- Żargon marketingowy („odmień swoje poranki") — tylko pierwsza osoba, konkretne miejsca, konkretne godziny
- „24h wysyłka" / „polski magazyn" (zakaz z MEMORY.md) — tylko „1–3 dni kurierem, darmowa"
- „Za pobraniem" / „raty" (zakaz z MEMORY.md) — tylko przedpłata

---

## 2. Photo System

### Reference product
Przenośny ekspres espresso 20 bar. Obudowa stal szczotkowana + mosiężne akcenty. Kształt cylindryczny wysokiego termosu, ~14×7 cm. Akumulator lithium-ion, USB-C, portafiltr do kawy mielonej + adapter Nespresso Original.

**Brak fotografii produktu w workflow** — wszystkie kadry produktowe to placeholdery z detailowymi briefami.

### Lighting
- Chłodno-bursztynowe światło 4:30 rano — niebieskie cienie, ciepłe światła samochodowe w tle
- Kierunkowe okno kabiny TIRa, światło boczne niskie
- „Kodak Portra 400 + ziarno", realizm dokumentalny, nigdy studio/packshot-perfect

### Paleta scen
- **Tła:** ciemne drewno dębowe, stalowe deski rozdzielcze, skóra workwear, betonowe parkingi, mgły leśne nad kamperem
- **Akcenty:** mosiądz na 1 elemencie (klamka termosu, znacznik kubka, guzik flanelki) — nigdy całe meble
- **Tekstura:** subtelne kurzy/pył na powierzchni, drobne zadrapania skóry, lived-in
- **Niebo:** szaro-bursztynowy świt, autostrada z bokeh świateł, nigdy blue hour

### Kadrowanie
- **Hero:** Kafina na desce rozdzielczej TIRa, niski kąt, 4:5 pionowy, światło z lewej
- **Features (bento):** detal makro 1:1, crema w filiżance, wskaźnik LED, USB-C w panelu słonecznym, Kafina w plecaku
- **Acts (rytuał):** dłoń (męska, z bliznami), wsyp kawy / wlew wody / przycisk ekstrakcji — 4:3 poziomy
- **Personas:** environmental portrait 4:5 — kierowca TIR przy kabinie, van-lifer w drzwiach kampera, digital nomad w Airbnb

### Stały suffix promptu (realism injector)
```
Shot on 35mm film (Kodak Portra 400), slightly grainy, mild halation,
imperfect hand-held framing with slight tilt, natural imperfections —
faint dust on surfaces, smudged brass, lived-in feel. Cold-amber 4:30am
dawn light, documentary workwear photography session. No text, no
captions, no labels, no watermarks on the product.
```

### Negatywy — NIGDY
- Golden hour warm tones (to vitrix/paromia, nie my)
- Loft 18. piętro, panoramiczne okno, białe ściany
- Linen sofa, oak herringbone, Muji styling
- Młoda modelka w cashmere, instagram-ready
- Stock „outdoor adventurer" z plecakiem markowym i uśmiechem
- Tekst w kadrze, watermarki, wyrazne logo Kafina na produkcie

---

## 3. Personas (z raportu strategicznego)

### Tomasz — 45 l., kierowca międzynarodowy, Poznań
- Trasa Berlin–Madryt, 2 tygodnie w miesiącu za kółkiem
- Workwear: flanelka, kamizelka hi-vis w kabinie, buty skórzane zimą
- Siwiejący zarost, zmęczona twarz, pracowite dłonie
- Zabiera termos Stanley, nóż po ojcu, radio CB
- **Cytat:** „15 lat za kółkiem, 15 lat automatów. Kupiłem Kafinę, dwa tygodnie później chłopaki pytali, co piję."

### Marcin — 38 l., van life, stała lokalizacja: „w trasie"
- Kamper Mercedes Sprinter L3H2 z panelem słonecznym, 8 miesięcy w roku
- Barber-broda, czapka wełniana, flanelki Dickies / Patagonia Workwear
- Pies (border collie) jako współlokator
- Ładuje wszystko z solarów — Kafina pasuje do systemu
- **Cytat:** „Osiem miesięcy na trasie. Ładuję Kafinę z panelu na dachu. Ma mnie to kosztować standard? Nie."

### Kasia — 33 l., digital nomad, roczna trasa 8 krajów
- Backend developer w berlińskim startupie, remote
- Krótki pixie cut, oversized sweter, Apple ekosystem
- Airbnb miesięcznie zmienia — każde mieszkanie ma inną kawę (zwykle złą)
- Kafina jedzie w Away cabin bag, 600 g nie jest problemem
- **Cytat:** „Pracuję w 8 krajach rocznie. Każdy Airbnb ma inną kawę — zwykle złą. Kafina w walizce podróżuje ze mną."

**Kobieca persona (Kasia) jest celowa** — rugged heritage nie oznacza „tylko dla facetów". Filson / Red Wing / Yeti mają kobiece klientki, które cenią dokładnie te same cechy: jakość, niezawodność, standard niezależny od miejsca.

---

## 4. Mapping manifesto → decyzje w kodzie

| Decyzja | Wartość |
|---|---|
| Hero background | `#121315` **coal black** (pattern break vs vitrix light) |
| Hero headline | Archivo 800 uppercase + 1 słowo w brass box (stamp) |
| Signature HTML | `<div class="hero-stamp">LOT 2026 · KAFINA · ISSUE 001</div>` |
| Dark section rytm | 3 ciemne: Hero + Spec Sheet + Finale |
| Animacja hero | Subtle fade-in (500ms), NO parallax na numeral (workwear nie parallaxuje) |
| Border-radius global | 2px (ostrzejsze niż vitrix 4px — blacha) |
| Shadow | `rgba(18,19,21,.15)` coal, nigdy czarny, nigdy kolorowy |
| Divider | `CAT. Nº XX — NAZWA` w Space Mono 700 + linia brass 2px |
| Buttons | Flat, brass lub paper-2 na coal, brak glow |

---

## 5. Referencje moodboard

1. **Filson** (Mackinaw Jacket hero page) — workwear heritage, masywne stampy, skóra + twill
2. **Red Wing Heritage** (boot catalog) — brass eyelets, leather texture, product detail first
3. **Yeti Coolers** (Tundra product page) — tech-outdoor premium, hero dark, spec ledger
4. **Cereal Magazine** (issue 23 "Tools") — oversized industrial numerals, dokumentalna fotografia

**Świadomie nie:** Kinfolk, Dyson, B&O (to vitrix). Instrument Serif italic (to paromia).

---

## 6. Decisions log

- **2026-04-19 v1** Generacja pierwsza. Świadome NIE-kopiowanie vitrix baseline — vitrix = Panoramic Calm, Kafina = Rugged Heritage, ten sam szablon wyprodukowałby generic. Zamiast tego: ta sama 14-section architecture (procedura), własny design language (stamp typography, dark hero, workwear labels). Zobacz CLAUDE_LANDING_PROCEDURE.md — zaktualizowana reguła „baseline mismatch".

---

## 7. JS Effects zaimplementowane

- Fade-in z html.js gate + safety timeout filtering (getBoundingClientRect)
- `.js-split` na hero H1 (charakter-by-charakter stagger, 22ms)
- `.js-counter` na 3 hero stats (20 bar, 90 sek, 30 dni)
- `.magnetic` na CTA — factor 0.12 (mniej „fun" niż vitrix 0.18)
- FAQ accordion (jeden naraz)
- **Brak tile-tilt** — workwear nie robi 3D (rugged ≠ playful)
- **Brak parallax** na numerals — industrial text stoi w miejscu

---

## 8. Live link

https://tn-crm.vercel.app/landing-pages/kafina/
