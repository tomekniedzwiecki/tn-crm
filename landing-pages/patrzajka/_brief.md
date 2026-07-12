# Design Brief — Patrzajka

<!-- AUTO-RUN: 2026-05-13. Workflow UUID: a9cc4477-3895-4da7-a7a9-64fd24d95081 -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Field Journal Wonder** — naturalist's notebook dla małych odkrywców, cottagecore z duchem terenu

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):

Patrzajka to mikroskop kieszonkowy dla dzieci 4-10 lat, ale raport jasno mówi: nie sprzedaje się specyfikacji, sprzedaje się rytuał odkrywania i ucieczki od ekranów. Brand_info ma archetyp Odkrywca + Opiekun, paleta z brandingu to leśna zieleń + musztard + terrakota + piasek (warm earth tones) — to Cottagecore Botanical adoptowany na świat dziecięcego naturalisty, z fontami brandu (Fredoka rounded, Nunito body, Caveat jako handwritten dziennik).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Patagonia Stories** — autentyczne portrety rodzin w terenie, ziemiste tony, fotografia która oddycha; pożyczam: hero panorama z dzieckiem w lesie zamiast packshotu na białym tle.
2. **Kinfolk magazine** — kremowa paleta, edytorialna typografia z numerami sekcji, dużo pustego miejsca; pożyczam: oversized `Nº 01–06` w Caveat jako rytm sekcji (wpisy do dziennika).
3. **National Geographic Kids book covers** — field notes aesthetic, botaniczne illustracje w rogach, big bold heading + handwritten captions; pożyczam: Caveat callouts jako „podpisy obserwacji" obok makro-zdjęć.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #C66B47 (Terrakota Odkrywcy)
- **Ink (główny tekst):** #1A1F1B (Głębia Lasu)
- **Paper (tło):** #F5EFE3 (Piasek Łąki)
- **Accent / Gold (opcjonalny):** #E8B14F (Musztardowy Akcent) + #2E5A3D (Leśna Zieleń, dla dark sekcji)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fredoka 500/600/700 + `&display=swap&subset=latin-ext`
- **Body (treść):** Nunito 400/500/600/700 + `&display=swap&subset=latin-ext`
- **Mono / Caption (opcjonalny):** Caveat 400/700 (handwritten dziennika)

> ⚠️ Fredoka (NIE Fredoka One) — full PL support. Caveat ma PL. Sprawdzone w memory/feedback-landing-fonts-polish.md.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Marta, 32–38 lat, wyższe wykształcenie, duże/średnie miasto (Kraków, Poznań, Gdańsk), matka 6-letniego syna i 3-letniej córki, średni-wyższy dochód, świadoma konsumentka.
- **Kluczowy pain point:** Chroniczne poczucie winy z oddawania dziecku telefonu po pracy. Patrzy jak syn skroluje TikToka 2h i wie, że jego ciekawość świata gaśnie — ale jest zmęczona, więc znowu daje ekran.
- **Kluczowa motywacja zakupu:** Chce produktu który wyrwie dziecko z domu, sprawi że samo będzie chciało wyjść do parku, da jej spokój sumienia bez zakazów i krzyku. Unika tanich plastikowych zabawek na baterie — szuka czegoś, co wzbudzi też szacunek koleżanek na urodzinowym prezencie.
- **Cytat brzmiący jak wypowiedź persony:**
  „Szukałam czegoś, co wreszcie wyrwie syna z YouTube. Patrzajka to jedyna rzecz, do której teraz biegnie sam — z latarką po deszczu, żeby zobaczyć dżdżownice." — Marta, Poznań

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge).

- **Już istnieje:** `pupilnik/` — Playful Toy (rounded bouncy + emoji + loud bright primary). Najbliżej kategorii „dla dzieci", ale **inny mood** — Patrzajka jest spokojniejsza, naturalistyczna, moderate (nie loud).
- **Już istnieje:** `h2vital/` — Organic/Natural (greens + beiges). Paleta podobna ale dla wody/wellness, brak signature elementu „dziennika".
- **Czego unikam (signature elements istniejących):**
  - NIE rounded 24-36px bouncy cards w stylu pupilnik — moja paleta jest ziemista, nie pastelowa
  - NIE emoji ikony per feature — używam Phosphor outlined w Mech Polny
  - NIE wave SVG dividers pastelowe — używam wąskich linii sage + numerów Caveat jako dividerów
  - NIE „organic blob shapes" z h2vital — mam ostre crop'y botaniczne SVG w rogach

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? Patagonia Stories (editorial), Kinfolk (magazine), Nat Geo Kids (book covers) — wszystkie spoza DTC e-commerce.
- [x] Czy odwracając logo nadal zgaduję branżę? TAK — handwritten Caveat + makro-foto liścia + Nº 03 wpis w dzienniku = naturalist's tool, czytelne.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? TAK — Marta nie kupiłaby pupilnika (zbyt głośny), ani kafiny (workwear nie dla dziecka), ani paromii (zbyt premium luxe).
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? TAK — mówimy „dziennik odkrywcy", „pierwsze wyprawy", „mech, kora, skrzydło motyla", nie „premium edukacja".

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:**

**„Wpis Nº [01–10] z Dziennika Małego Odkrywcy"** — Caveat handwritten numeracja w pomarańczowej Terrakocie obok każdej kluczowej sekcji, ze stemplem-pieczątką "ZBADANE · MAJ 2026" zrotowaną o -3° w stylu field stamp. Plus dwa botaniczne SVG corner ornaments (gałązka paproci, listek dębu) w przeciwległych rogach sekcji hero i offer. Razem dają wrażenie, że landing JEST stroną z Dziennika.

---

## 9. Warianty sekcji

- **Hero:** H1 Editorial column (Fredoka headline + Caveat script accent + makro-foto + Nº 01 stempel)
- **Features:** F3 Linear stack (recipe card rhythm — każda feature jako „strona z dziennika": Nº + nagłówek + body + makro-foto)
- **Testimonials:** T1 Grid + script pullquote (cytat matki w Caveat italic)

---

## 10. STYLE LOCK — wybrany styl z Atlas

### 10.1 Wybrany styl
- **Style ID:** `cottagecore-botanical` (adaptacja: fonty z brandingu zamiast EB Garamond)
- **Plik:** `docs/landing/style-atlas/cottagecore-botanical.md`

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **ritual** (dziennik + zbieranie naklejek = doświadczenie; kotwice: Pelikan fountain pen, Matcha tea set)
- Precision↔Expression: **expression** (sprzedajemy charakter odkrywcy, nie megapiksele; kotwice: Bark pet toy, Graza)
- Evidence↔Feeling: **feeling** (matka kupuje ulgę od ekranów, nie dane; kotwice: La Mer, Kinfolk)
- Solo↔Community: **dual** (dziecko samo + rodzic + rodzeństwo; kotwice: gaming hardware, party supplies)
- Quiet↔Loud: **moderate** (ciepły zachwyt, nie krzyk; między Aesop a Bark)
- Tradition↔Future: **tradition** (naturalist's notebook, nostalgia za beztroskim dzieciństwem; kotwice: Red Wing, Fraunces)
- Intimate↔Public: **social** (prezent na urodziny, dziadkowie polecają wnukom; kotwice: Sezane, Yeti cooler)

**Match z Cottagecore Botanical: 5/7.** Argumentacja: paleta brandingu (leśna zieleń + musztard + terrakota + piasek) idealnie wpisuje się w cottagecore warm earth tones; jedyna adaptacja to fonty (brand_info ma priorytet — Fredoka zamiast EB Garamond, Caveat zamiast La Belle Aurore), bo „klient zaakceptował fonty" (01-direction.md Krok 4.4) i Caveat to lepszy fit dla dziecięcego dziennika.

### 10.3 MUSZĄ być użyte
- Font display: `Fredoka` (override z brandingu) w h1/h2 — full PL support
- Font body: `Nunito`
- Font accent: `Caveat` (handwritten dziennika, zastępuje La Belle Aurore)
- Paleta (min 3 z 5): `#F5EFE3` Piasek + `#2E5A3D` Leśna Zieleń + `#C66B47` Terrakota + `#E8B14F` Musztard + `#1A1F1B` Głębia Lasu
- Layout DNA: editorial column 680–760px, botaniczne SVG w rogach
- Signature primitive #1: `.botanical-corner` SVG (min 2 sekcje)
- Signature primitive #2: `.script-accent` (Caveat) min 5 użyć
- Section architecture min: 14 sekcji

### 10.4 NIE WOLNO użyć
- **Fonty:** NIE `Archivo Black`, `IBM Plex`, `Fraunces`, `Libre Caslon`, `Inter` w h1, NIE `Fredoka One` (PL issues)
- **Layout:** NIE bento 2×2 hard grid, NIE Swiss grid, NIE dashboards
- **Elementy:** NIE neon, NIE gold (mamy musztard+terrakota), NIE emoji ikony, NIE bouncy rounded cards w stylu pupilnik
- **Kolory:** NIE purple-to-blue, NIE pastel kid colors (różowe/cyjanowe), NIE pure white #FFFFFF jako paper
- **Motion:** NIE parallax, NIE js-split, NIE counter heavy, NIE wobble bounce

### 10.5 Section Architecture
Required (14):
1. Header (centered brand + tagline)
2. Mobile Menu
3. Hero (Fredoka + Caveat script accent + makro-foto + Nº 01 stempel)
4. Trust strip (4 odznaki: CE, EN71, 8 LED, 1000x)
5. Manifesto / Problem (kontrast smartfon vs łąka, dark section)
6. Features as Field Journal entries (4 wpisy Nº 02-05)
7. How It Works (3 steps z botanicznymi divider'ami)
8. Specyfikacja (tłumaczona na korzyści)
9. Testimonials (T1 grid + script pullquote)
10. Comparison (smartfon-pasywny vs Patrzajka-aktywny, dark section)
11. Offer / Pakiety (1 szt., 2 szt. rodzeństwo, +karta SD order bump)
12. Risk reversal (30 dni zwrotu, gwarancja)
13. FAQ (accordion)
14. Footer

Forbidden: bento 2×2, dashboards, full-dark hero, neon

### 10.6 Motion Budget
```yaml
js_effects_required:
  - .fade-in (z html.js gate + safety timeout)

js_effects_forbidden:
  - .js-split
  - .js-parallax
  - .magnetic
  - .js-tilt
  - .js-counter
  - .wobble

motion_level: subtle
```

---

## Mapowanie Krok 7 — manifesto → kod

| Decyzja | Wartość |
|---|---|
| Hero background | Piasek Łąki #F5EFE3 + makro-foto liścia/mchu jako prawa kolumna |
| Hero headline font-family | Fredoka 600/700 |
| Hero headline font-style | Regular + Caveat italic accent na 1-2 słowach |
| Signature element HTML | `<span class="entry-num">Nº 01</span>` + `<div class="field-stamp">ZBADANE · MAJ 2026</div>` + `<svg class="botanical-corner">` |
| Dark section rytm | 2 sekcje dark (Manifesto/Problem + Comparison) na Leśna Zieleń #2E5A3D z kremowym tekstem |
| Animacja hero | Subtle fade-in (z html.js gate + safety timeout) |
| Border-radius globalny | 12px |
| Shadow styl | Soft sage shadow: `0 6px 20px rgba(46,90,61,0.10)` |
| Divider między sekcjami | Cienka linia Mech Polny + numeracja Caveat Nº 0X |

---

## Photo System (generacja obrazów AI — 2026-07-12, Gemini 3 Pro Image)

**Produkt (z referencji AliExpress):** kieszonkowy cyfrowy mikroskop dla dzieci, jaskrawo-żółty korpus; kwadratowy kolorowy ekran IPS na górze w ząbkowanej „koronkowej" ramce; rząd małych okrągłych przycisków na szyjce; pionowo ryflowany walcowy uchwyt; przezroczysta okrągła podstawa z obiektywem (8 LED) u dołu; w zestawie biały kabel USB-C i żółto-biała smycz.

**Lighting:** miękkie naturalne światło poranka / złotej godziny, plenery leśne i łąkowe.
**Paleta w scenach:** leśna zieleń #2E5A3D, terrakota #C66B47, musztard #E8B14F, piasek #F5EFE3 — mech, kora, paprocie, trawa. Żółć produktu współgra z musztardem.
**Kadrowanie:** perspektywa dziecka, low-angle, produkt w małej dłoni, płytka głębia ostrości.
**Post:** 35mm Kodak Portra 400, subtelny grain, ciepłe lekko wypłowiałe tony, candid documentary.
**Negatywy:** żaden tekst/watermark; brak neonu; brak stock-pozowania; produkt ZAWSZE wg referencji (żółty, ryflowany uchwyt, przezroczysta podstawa).

**Wyjątek:** obraz „Problem" (dziecko przy smartfonie) generowany BEZ referencji produktu — to scena „starego sposobu", mikroskop nie może się tam pojawić.
