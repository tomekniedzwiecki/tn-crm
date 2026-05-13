# Design Brief — Cremio

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [x] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia) — **sub-mood: „Roastery Editorial"** (espresso magazine, paper + copper + espresso noir zamiast paper + ink + gold)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [ ] Nowy (opisz poniżej):

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):

Cremio sprzedaje **rytuał espresso w mobilnym kontekście** — to nie kawomat, to ceremonia, którą zabierasz ze sobą (kierowca TIR-a, vanlife, mobilny przedsiębiorca). Persona kupuje uczucie „dobre espresso się ze mną liczy", nie kofeinę — dlatego editorial-magazine register (Fraunces + italic + monumentalna liczba) lepiej odda klimat niż utility/clinical. Branding klienta (Fraunces + paleta copper/espresso) zamyka decyzję — Japandi Serenity (DNA match 7/7) odrzucone bo zakazuje Fraunces, a brand_info ma priorytet (safety #4.4).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Cereal magazine** — pionowa centralna kolumna + Fraunces-like serif + figcaption pod każdym obrazem + dużo pustego paper między sekcjami. Pożyczamy: numerację Nº per sekcja i editorial figure caption pod hero.
2. **La Colombe Coffee Roasters (US)** — copper/brass akcenty na ciepłym off-white tle + spec tabela w mono ("20 BAR · 580 ML · 1× CHARGE"). Pożyczamy: spec-row w DM Mono pod hero headline (zamiast czystego marketingowego "high quality").
3. **Snow Peak (titanium gear)** — produkt zawsze z lewej 45% viewport, prawa 55% to pustka z opisem-szeptem. Asymetria zamiast centered. Pożyczamy: hero composition i breathable margin wokół produktu w sekcjach.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #C77A4B — Crema Copper (rola: primary brand, headline em italic, CTA tła)
- **Ink (główny tekst):** #1A0F0A — Espresso Noir (rola: tekst body, headers, dark sekcje)
- **Paper (tło):** #FAF6F0 — Latte Foam (rola: tło 60% strony)
- **Accent / Gold (opcjonalny):** #E8B07A — Steam Brass (rola: italic eyebrow, divider, Nº rzadkie)
- **Support deep:** #0A0807 — Roast Black (rola: dark section bg — trust strip, final CTA)
- **Support warm:** #6B5544 — Roasted Bean (rola: meta text, captions)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** `Fraunces` 500/600/700/900 + `&display=swap&subset=latin-ext` (italic enabled dla em w headline)
- **Body (treść):** `Inter` 400/500/600/700 + `&display=swap&subset=latin-ext`
- **Mono / Caption:** `DM Mono` 400/500 — dla spec rows ("20 BAR · 580 ML · 350 g · 1× CHARGE") + Nº eyebrow

> ⚠️ Sprawdź polskie „Ł" w UPPERCASE — patrz [`docs/landing/reference/safety.md` reguła #7](../../docs/landing/reference/safety.md). Italiana ❌, Fraunces ✅.
> Max 3 rodziny fontów. **3/3 użyte, no headroom** — żadnych innych fontów.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** 32–48 lat, profesjonalista mobilny — kierowca zawodowy (TIR/bus), vanlife/digital nomad, sales rep z autem służbowym, outdoor profesjonalista (przewodnik górski, ranger). Mężczyzna lub kobieta (60/40), zwykle dochód +6000 net, fan rzemiosła (taki sam typ co kupuje nóż Damasco lub plecak Filsona).
- **Kluczowy pain point** (co najbardziej frustruje): „600 km od domu i muszę pić brązową wodę z dyspensera albo czekać 40 minut do najbliższego mocco." Espresso na trasie = nie do dostania, a kapsułki nie mieszczą się w schemacie życia.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): chce zachować rytuał porannego espresso bez kompromisu — niezależnie od miejsca. To kwestia tożsamości („nie jestem typem co pije byle co"), nie wygody.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Codziennie 800 km i wcześniej moja pierwsza kawa to było pół godziny czekania na MOPie. Cremio mam w uchwycie na kubek. Crema jak w domu — sprawdzałem z barystą, śmiał się że mam lepszą niż jego ekspres za 4 tysiące."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** `paromia/` (Editorial/Luxury — wino premium)
- **Czego unikam (signature elements paromii):**
  - NIE kopiuję palety `paper/ink/gold` — Cremio ma `paper/espresso/copper` (copper zamiast gold = ciepło rzemieślnicze zamiast luksus salonu)
  - NIE kopiuję monumentalnej italic „PAROMIA" w hero — Cremio użyje **monumentalnej liczby „20" (barów ciśnienia)** jako anchor speca, nie nazwy marki
  - NIE kopiuję wine ritual narrative (długie zdania o „domowych wieczorach") — Cremio ma kierowcy/vanlife register: krótkie zdania, sensoryczne, „kabina TIR-a o świcie", „parking między spotkaniami"
  - NIE kopiuję Cormorant Garamond accent (paromia używa) — Cremio dla accent ma `DM Mono` (spec-driven, nie poetic)
  - NIE kopiuję dark trust strip z ikonami w kółkach — Cremio ma trust strip jako jeden monoline z liczbami w DM Mono (`20 BAR · 580 ML · 8H · 350 G · IP54`)

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? — Cereal magazine (print), La Colombe (B&M coffee chain), Snow Peak (outdoor gear).
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? — Tak, copper + espresso paleta + spec-row mono = coffee/craft niezależnie od logo.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? — Tak. Kierowca-mobilny-rzemieślnik NIE pasuje do vitrix (tech), pupilnik (zabawa), h2vital (wellness), vibestrike (gaming) ani paromia (wino salonowe).
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — Tak. „Espresso bez adresu. 20 barów ciśnienia w urządzeniu mniejszym niż termos. Twoja crema jedzie z Tobą — nie ważne czy w kabinie TIR-a, kamperze czy parkingu między spotkaniami."

## 8. Signature element

**Monumentalna italic liczba „20" (barów ciśnienia) w Fraunces 320-440px** w tle hero, koloru Crema Copper #C77A4B z opacity 0.18, layered za H1. Liczba mówi „to jest dane techniczne, nie marketing" — i jednocześnie staje się ornamentem editorial. Pod headline pojawia się **spec-row w DM Mono**: `20 BAR · 580 ML · 8H BATTERY · 350 G · IP54`. Każda kolejna sekcja ma swój **Nº eyebrow** w Cormorant-italic… nie — w **Fraunces italic** (bo Cormorant zakazane przez safety dla UPPERCASE „Ł"), w kolorze Steam Brass.

## 9. Warianty sekcji (z [`section-variants.md`](../../docs/landing/reference/section-variants.md), LIMITED przez allowed_variants w Style Lock)

- **Hero:** H4 Editorial numerał — monumentalna liczba „20" w tle, headline „Espresso *bez adresu*" + spec-row DM Mono pod nim, asymetryczna kompozycja z produktem 45/55. (Editorial Print allowed: H4 ✅)
- **Features:** F2 Bento asymetryczny — 6 nierównych pól dla dimensions Cremio (ciśnienie, akumulator, pojemność, waga, czas zaparzania, certyfikat IP54). Każdy bento ma własny Nº. (Editorial Print allowed: F2 ✅)
- **Testimonials:** T5 Single hero testimonial — 1 kierowca/vanlife cytat magazine-style + zdjęcie persony w kabinie (lewa 45%, cytat 55%), Fraunces italic. (Editorial Print allowed: T5 ✅)

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `editorial-print`
- **Plik:** [`docs/landing/style-atlas/editorial-print.md`](../../docs/landing/style-atlas/editorial-print.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **ritual** (espresso to ceremonia, kotwice: Aesop hand wash, Matcha ceremony tea set — produkt jest doświadczeniem, nie tylko ciśnieniem)
- Precision↔Expression: **balanced** (20 BAR i 580 ML to specy, ALE komunikacja jest poetic „crema jedzie z Tobą" — pomiędzy precyzją a charakterem; kotwice: Power bank mAh + Aesop apothecary)
- Evidence↔Feeling: **feeling** (klient kupuje rytuał i tożsamość, nie czyste liczby; kotwice: Byredo perfume, Kinfolk magazine — purchases by emotion)
- Solo↔Community: **solo** (kierowca w kabinie, vanlife sam — kotwice: Meditation app, Skincare serum)
- Quiet↔Loud: **quiet** (paleta espresso + copper, copy short-sentence — kotwice: Aesop apothecary, Japanese tea)
- Tradition↔Future: **tradition** (espresso to włoska tradycja XIX w., crema, baryści — kotwice: Moka pot, Fraunces magazine)
- Intimate↔Public: **intimate** (osobisty poranny rytuał kierowcy w kabinie; kotwice: Skincare routine, Sleep tracker)

Match z wybranym stylem (Editorial Print: ritual·expression·feeling·solo·quiet·tradition·social): **6/7**. Argumentacja (1 zdanie): Editorial Print pasuje DNA ritual+feeling+solo+quiet+tradition (5/5 critical axes) + branding klienta (Fraunces + Inter + copper/espresso paleta) jest natywny dla tego stylu; różnica precision↔balanced i intimate↔social to nuance, kompensowana w copy registerze (krótsze zdania, mniej „salon", więcej „kabina").

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: `Fraunces` 400/500/600/700/900 w font-family (italic enabled)
- Font body: `Inter` 400/500/600/700
- Font accent: `DM Mono` 400/500 (zamiast Cormorant Garamond — branding klienta nadrzędny + Cormorant jest ryzykowne dla PL „Ł" UPPERCASE, safety #7)
- Paleta (min 3 z 5): `#FAF6F0` (Latte Foam paper), `#1A0F0A` (Espresso Noir ink), `#C77A4B` (Crema Copper accent), `#E8B07A` (Steam Brass support)
- Layout DNA: **editorial column + magazine page numbers Nº 01-14**
- Signature primitives obecne:
  1. **Nº eyebrow** w każdej sekcji (`Nº 03 — ATELIER` → `Nº 03 — CHARAKTERYSTYKA`)
  2. **Oversized italic numeral „20"** w tle hero (Fraunces 320-440px, copper z opacity 0.18)
  3. **Figure + figcaption** pod hero („Cremio w kabinie TIR-a, świt nad A4, 05:42")
  4. **Magazine page numbers** per sekcja (`Nº 01/14`, `Nº 02/14`, …)
  5. **Dark trust strip** (Espresso Noir bg) z liczbami w DM Mono zamiast ikon
- Section architecture min: **14 sekcji** (all standard — Editorial Print wymaga full set)

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Italiana` (Łł problem), NIE `Cormorant Garamond` (Łł problem — safety #7 + DM Mono z brandingu nadrzędny), NIE `Archivo Black`, NIE inne niż 3 z brandingu
- **Layout:** NIE bento 2×2 symmetric (F1) — Editorial Print preferuje F2 asymetryczny; NIE dashboardy
- **Elementy:** NIE checkmark ✓ tabele (AI slop), NIE neon gradient orbs, NIE `border-left: 4px solid` jako jedyny ornament, NIE „24h dostawa", NIE „magazyn w Polsce", NIE COD / raty / PayPo / Klarna / Twisto (safety #6)
- **Kolory:** NIE neon, NIE pure black #000000 (używaj Espresso Noir #1A0F0A albo Roast Black #0A0807), NIE czysta biel #FFFFFF poza solid header (safety #9), NIE purple-to-blue gradient
- **Motion:** wszystkie 5 JS effects MUSZĄ być (split, parallax, magnetic, tilt, counter) — Editorial Print to moderate motion budget; ale subtelnie (counter min 2 dla `20 barów` i `580 ml`)

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (14 sekcji): Header (solid white #FFFFFF — safety #9), Mobile Menu, Hero (H4), Trust Bar (mono spec-row), Problem (kierowca/MOP/dyspenser), Solution/Bento (F2 — 6 features asymetryczne), How It Works (3 kroki: ładuj → wsyp → wciśnij), Comparison (Cremio vs kawomat MOP vs domowy ekspres vs kapsułki), Testimonials (T5 — single hero kierowca), FAQ, Offer (offer box H), Final CTA, Footer, Sticky CTA mobile.
Forbidden: brak (Editorial Print pozwala na pełen zestaw)

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-split, .js-parallax, .magnetic, .js-tilt, .js-counter]
js_effects_count:
  split_min: 1      # hero headline split
  counter_min: 2    # „20 BAR" i „580 ML" w trust strip
  magnetic_min: 2   # 2× CTA primary
  tilt_min: 2       # produkt w hero + offer box
  parallax_min: 1   # monumentalna liczba „20" w hero
```

### 10.7 Mapping manifesto → decyzje w kodzie (Krok 7 z 01-direction.md)

| Decyzja | Wartość z manifesto |
|---|---|
| Hero background | `#FAF6F0` Latte Foam paper + monumentalna „20" Crema Copper z opacity 0.18 layered |
| Hero headline font-family | `Fraunces` |
| Hero headline font-style | `font-weight: 600`, `em` italic dla słowa „bez adresu" (Fraunces italic 600) |
| Signature element HTML | `<span class="hero-numeral">20</span>` absolute pozycja, font-size: clamp(220px, 32vw, 440px), opacity: 0.18, color: var(--copper) |
| Dark section rytm | 2 dark sekcje: Trust strip (Roast Black #0A0807) + Final CTA (Espresso Noir #1A0F0A). 11 jasnych + 2 dark + footer = 14 |
| Animacja hero | subtle — `.fade-in` na slow stagger + `.js-parallax` na monumentalnej liczbie (translateY 0 → -20px na scroll) |
| Border-radius globalny | `8px` (Editorial standard, jeden rytm dla bento + buttons + cards) |
| Shadow styl | `0 8px 32px rgba(26, 15, 10, 0.08)` — soft espresso-tinted shadow, NIE black |
| Divider między sekcjami | numbered `Nº 01/14` w Cormorant-italic… nie — w Fraunces italic 600 small, Steam Brass kolor |
