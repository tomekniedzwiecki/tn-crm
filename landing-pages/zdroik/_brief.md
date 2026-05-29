# Design Brief — Zdroik

<!-- ETAP 1 DIRECTION — manifesto PRZED HTML. Wypełniony z raportu strategicznego + workflow_branding. -->
<!-- Produkt: Przenośny generator wody wodorowej 420 ml, SPE/PEM DuPont Nafion. Pozycjonowanie: Affordable Premium 299 zł. -->

## 1. Kierunek manifesta (z 01-direction.md)

- [x] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [ ] Nowy (opisz poniżej):

**Manifesto własny: „Spokój źródła"** — kliniczna precyzja podana spokojnie, dużo oddechu, świeży chłód wody z jednym ciepłym akcentem. Tempo: **spokojne**. Marka mówi językiem nauki, ale bez krzyku — to kierunek strategiczny raportu „od biohackingu do bioharmonii".

**Uzasadnienie wyboru** (z auditu produktu): Produkt to urządzenie elektroniczne (generator) kupowane przez sceptycznego optymalizatora, który chce dowodów (evidence) — ale komunikacja ma być spokojna, premium, oddychająca (Apple/Linear vibe). Fonty brandingu (geometryczny Sora + serif Fraunces) i paleta teal/mięta idealnie pasują do Panoramic Calm; pozostałe kliniczne style (Clinical Warmth/Kitchen) wymuszają Cormorant/IBM Plex i ciepły krem, sprzeczne z brandingiem klienta.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Apple (strony produktowe)** — szerokie kadry architektoniczne, ogromny oddech między sekcjami, jedna mocna teza na ekran, spokojna pewność zamiast krzyku.
2. **Aesop** — typograficzna powściągliwość i „uczciwość etykiety": parametry membrany pokazane jak skład — jawnie, bez superlatyw. Balans chłodu i ciepła.
3. **Oura (Ring)** — biohacking-wellness dla sceptyka z danymi; dowód naukowy podany elegancko i czytelnie (dokładnie ekosystem persony, która nosi Oura).

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #0F7A82 (głęboki teal — „źródło")
- **Ink (główny tekst):** #14201F (ciemna zieleń-atrament)
- **Paper (tło):** #F4F8F6 (chłodny, świeży papier)
- **Secondary (mięta):** #8AD9CC
- **Accent / ciepły (rzadki):** #E6A93C (amber — jedyny ciepły akcent „bioharmonii", <10% powierzchni)
- **Muted (szałwia):** #8A9794

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Sora — geometryczny, nowoczesny, świeżo-techniczny (500/600/700). Polskie „Ł" w uppercase OK.
- **Body (treść):** Inter — neutralny, czytelny w specach 15–17px (400/500/600/700).
- **Accent (kursywa emocjonalna + eyebrow):** Fraunces — serif italic dla beatów „żywej wody" i jewelry eyebrow (300/400/600 + italic). ✅ poprawne PL.

> Max 3 rodziny. BEZ `&subset=latin-ext` (Google Fonts v2 anty-wzorzec).

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Tomasz, 34 lata, Senior Product Manager w firmie tech (Kraków), 16 500 zł netto/mies., w związku, bez dzieci.
- **Kluczowy pain point:** popołudniowa mgła mózgowa o 14:00, bóle głowy z odwodnienia, wolna regeneracja po HIIT, zmęczenie „martwą" wodą z plastikowych butelek; głęboki sceptycyzm wobec „cudownych suplementów".
- **Kluczowa motywacja zakupu:** jasność umysłu przez cały dzień bez kolejnej kawy, szybsza regeneracja, spowolnienie starzenia komórkowego — ale tylko jeśli stoją za tym badania.
- **Cytat brzmiący jak wypowiedź persony:** „Jestem sceptykiem — przejrzałem badania, zanim kupiłem. To jedyny nawyk, po którym faktycznie czuję różnicę o 14:00, bez sięgania po trzecią kawę."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** vitrix — Panoramic Calm (myjka do okien smart). cervila — Clinical Warmth (poduszka ortopedyczna, świeży).
- **Czego unikam:** NIE kopiuję z vitrix Plus Jakarta + Instrument Serif ani dashboard-mockup hero ani palety navy/teal/gold — Zdroik ma własne fonty (Sora/Inter/Fraunces), własną paletę teal/mięta/amber i własny signature (numerał −600 mV + bąbelki wodoru). NIE kopiuję z cervila kremowego Cormorant clinical look — Zdroik jest chłodno-świeży, nie ciepło-apteczny. Hero = realne zdjęcie produktu w split, nie mockup aplikacji.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Apple, Aesop, Oura — tak)
- [x] Czy odwracając logo nadal zgaduję branżę? (teal/mięta + bąbelki + „żywa woda" + Fraunces = wellness wodorowy — tak)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (sceptyczny optymalizator-evidence ≠ luksusowa persona paromii ani zabawowa pupilnika — tak)
- [x] Czy manifest da się zacytować bez „premium/luxury/wysoka jakość"? (tak — „spokój źródła, nauka bez krzyku")

## 8. Signature element

**Monumentalny numerał „−600" (Fraunces italic, 280–440px) w tle hero z indeksem górnym „mV"** — ujemny potencjał Redox to naukowe serce „żywej wody" (woda jak ze źródeł w Lourdes/Nordenau). Parallax przy scrollu. Wzmocniony subtelną ambientową animacją unoszących się bąbelków wodoru w hero (echo elektrolizy, opacity 0.1–0.4). Jedna zapadająca w pamięć liczba zamiast tabeli specyfikacji.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez allowed_variants)

- **Hero:** H1 Split klasyczny — produkt fizyczny z realnym zdjęciem; sceptyk chce od razu headline + dowód + CTA, nie mockup aplikacji (brak aplikacji w produkcie). Wzbogacony sygnaturowym numerałem −600 mV.
- **Features:** F1 Bento 2×2 — 4 równe filary korzyści (energia, regeneracja, anti-aging, bezpieczeństwo SPE/PEM); czysty, spokojny, premium z js-tilt.
- **Testimonials:** T1 Voices quote grid — 3 głosy mapujące 3 segmenty (biohacker, sportowiec amator, anti-aging); brak realnych liczb before/after (nowy produkt) → T1 uczciwszy niż T2.

---

## 10. STYLE LOCK — wybrany styl z Atlas

> Branding klienta ma priorytet nad tokenami stylu (01-direction Krok 4.4 + memory `feedback-verify-style-lock-vs-branding.md`). Fonty/paleta = z workflow_branding, NIE z atlasu. Framework (layout DNA, architektura sekcji, motion, copy voice) = Panoramic Calm.

### 10.1 Wybrany styl
- **Style ID:** `panoramic-calm`
- **Plik:** `docs/landing/style-atlas/panoramic-calm.md`

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **dual** (generuje wodę = utility; codzienny nawyk zdrowotny = ritual) — kotwice: Dyson V15 (utility) / matcha ceremony (ritual)
- Precision↔Expression: **precision** — membrana SPE/PEM, ORP mierzalny — kotwice: scale Withings / sous-vide
- Evidence↔Feeling: **evidence** — sceptyk chce PubMed/badań — kotwice: Dyson „99%" / Medela clinical
- Solo↔Community: **solo** — osobisty nawyk przy biurku — kotwice: skincare serum / notebook
- Quiet↔Loud: **quiet** — bioharmonia, spokój premium — kotwice: Muji / Aesop apothecary
- Tradition↔Future: **future** — tech wellness 2026, wodór cząsteczkowy — kotwice: DJI drone / AirPods Max
- Intimate↔Public: **intimate** — prywatne picie wody w domu/biurze — kotwice: skincare routine / sleep tracker

Match z panoramic-calm (utility·precision·evidence·solo·quiet·future·public): **5/7** (różni się utility↔dual, public↔intimate). Argumentacja: spośród 4 stylów remisujących 5/7 (Panoramic Calm, Clinical Kitchen, Clinical Warmth, Apothecary) tylko Panoramic Calm ma filozofię fontów (geometryczny sans + serif italic akcent) i palety (paper/teal/akcent) zgodną z brandingiem Sora+Fraunces+teal — pozostałe wymuszają Cormorant/IBM Plex i zakazują Fraunces.

### 10.3 MUSZĄ być użyte (zaadaptowane do brandingu)
- Font display: **Sora** w font-family (zamiast Plus Jakarta — branding priority)
- Font body: **Inter**
- Font accent: **Fraunces** italic (zamiast Instrument Serif — branding priority)
- Paleta (min 3): #0F7A82, #14201F, #F4F8F6 (+#8AD9CC, #E6A93C)
- Layout DNA: panorama wide — szerokie obrazy, dużo oddechu, architektoniczne siatki
- Signature primitive: oversized numerał −600 mV (parallax) + szerokie kadry lifestyle
- Section architecture min: 14 sekcji

### 10.4 NIE WOLNO użyć
- **Fonty:** NIE inne niż Sora/Inter/Fraunces (max 3 rodziny)
- **Layout:** NIE dashboard-mockup hero z vitrix (anti-referencja), NIE bento z identycznymi kartami AI-slop
- **Elementy:** NIE checkmarki ✓/✗ w comparison, NIE border-left:4px solid na kartach, NIE neon glow
- **Kolory:** NIE pure #FFFFFF jako tło sekcji (poza headerem), NIE czerwone „problem" stats
- **Frazy:** NIE „24h", „magazyn w Polsce", COD, raty, PayPo/Klarna/Twisto (safety #6 — to dropshipping); NIE purple prose, NIE AI-poetic

### 10.5 Section Architecture
Required (14): Header, Mobile Menu, Hero, Trust Bar, Problem, Solution/Bento, How It Works, Comparison, Testimonials, FAQ, Offer, Final CTA, Footer, Sticky CTA.
Forbidden: brak (Panoramic Calm nie zakazuje sekcji).

### 10.6 Motion Budget (Panoramic Calm = moderate)
```yaml
js_effects_required: [.fade-in, .js-split, .js-counter, .magnetic, .js-tilt]
js_effects_forbidden: []
js_effects_count: { counter_min: 2, magnetic_min: 2, tilt_min: 2 }
```
Plus signature: .js-parallax na numeralu −600 mV.

## 11. Wow Moments (3 explicit — ETAP 4)
1. **Hero zone:** monumentalny numerał „−600 mV" (Fraunces italic) z parallaxem + ambient bąbelki wodoru unoszące się za realnym zdjęciem produktu. Unikalny: ujemny Redox to naukowy USP, żaden konkurent go tak nie pokazuje.
2. **Mid (Comparison):** narracja dwóch butelek — tania jednokomorowa (chlor/ozon w wodzie) vs Zdroik SPE/PEM (gaz odprowadzany portem) — split bez checkmarków, akcent amber na ryzyku chemicznym. Rozbraja obiekcję „dlaczego 299 a nie 70 zł".
3. **Conversion (Offer):** animowany border-beam wokół pakietu Bestseller + counter oszczędności (0→200 zł) + gauge ORP jako mini-signature przy cenie. Spokojny, ale z jednym „żywym" momentem przy decyzji.
