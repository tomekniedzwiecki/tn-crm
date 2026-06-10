# Design Brief — MALUJEK

<!-- Robot rysujący dla dzieci 3-8 lat. Klient: Paweł Wróblewski. -->
<!-- Kierunek: Cottagecore Botanical (warm Montessori craft) — quiet, ciepły, pastelowy. -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Cottagecore Botanical** — „Montessori Craft Warmth": ciepły papier, pastelowa szałwia, ręcznie kreślona kreska (jak rysunek dziecka). Quiet, NIE krzykliwy playful-toy.

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Raport żąda estetyki „diametralnie odbiegającej od krzykliwych kartonów" — stonowane, pastelowe odcienie Montessori (szałwia, pudrowy róż, błękit), bo Marta „preferuje stonowane barwy". Product DNA wychodzi 7/7 na Cottagecore Botanical (quiet + tradition + intimate + feeling), nie na Playful Toy (loud) mimo że to zabawka — emocja marki to spokój i ciepło, nie hałas.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Sezane (linia dziecięca / papeteria)** — ciepły kremowy papier + szałwia, centrowana typografia, ręczny detal; vibe „francuskiej wsi", nie sklepu z zabawkami.
2. **Maileg (duńskie zabawki)** — pastelowy, spokojny świat zabawek premium fotografowany w naturalnym świetle domu; dowód że zabawka dziecięca może być „cicha" wizualnie.
3. **Lovevery (edukacyjne zabawki Montessori)** — czysta, ciepła paleta + fotografia rodzic-dziecko w realnym wnętrzu + ton „mądrego opiekuna" (Caregiver+Sage), zero krzykliwych obietnic.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent / CTA):** #FF8A75  (koral ciepły — jak terracotta cottagecore)
- **Secondary (szałwia, sekcje):** #9CBF9A
- **Ink (główny tekst):** #2B3A4A  (granat atramentowy)
- **Paper (tło):** #FAF6EF  (ciepły kremowy papier)
- **Support (błękit robota / linki):** #4FA8DC   ·   **Muted (podpisy):** #8A93A0

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** `Nunito` 800/900 — rounded humanist; zastępuje brandową Fredokę (safety #10: Fredoka renderuje PL niespójnie w Chromium/Playwright — incydent KidSnap). Nunito 800/900 trzyma ten sam ciepły, zaokrąglony charakter i jest PL-bulletproof.
- **Body (treść):** `Nunito` 400/600/700
- **Accent / script:** `Caveat` 400/700 — ręczne pismo (jak podpis dziecka / notka rodzica). Zastępuje cottagecore'owy `La Belle Aurore` — idealnie spina się z motywem „kreska po kresce".

> Bez `&subset=latin-ext` (safety #10 — Google Fonts v2 sam serwuje subsety). Max 3 rodziny.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Marta, 34 lata. Duże/średnie miasto, wyższe wykształcenie, korpo lub własna DG. Matka 5-latka. Budżet 250-400 zł na zakup edukacyjny — jeśli to „inwestycja", nie „wydatek".
- **Kluczowy pain point:** Permanentny brak czasu dla siebie + poczucie winy, gdy włącza dziecku bajki na YouTube, żeby w spokoju odpisać na maile. Strach, że ekrany opóźnią rozwój mowy dziecka i że „w tyle" za rówieśnikami z angielskiego.
- **Kluczowa motywacja zakupu:** „Usprawiedliwiony" spokój — zabawka, która zajmuje dziecko na godziny w zdrowy, rozwijający sposób (motoryka, skupienie, pierwsze angielskie słowa), bez ekranu. Inwestycja w talent dziecka = rozgrzeszenie dla rodzica.
- **Cytat brzmiący jak wypowiedź persony:** „Pierwszy raz od miesięcy wypiłam całą kawę na ciepło — a Tymek przez godzinę rysował lisa i powtarzał »fox«. Bez awantury o tablet."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** `pupilnik` — kierunek Playful/Toy (rounded bouncy + emoji + loud). To najbliższy „kuzyn" kategorii (zabawka dla dzieci), więc świadomie idę w PRZECIWNYM tonie.
- **Czego unikam (signature elements istniejącego):** zero emoji-spamu, zero bouncy/confetti, zero nasyconych krzykliwych kolorów i grubych kreskówkowych obrysów z pupilnika. Malujek jest CICHY: pastel, papier, ręczna kreska Caveat, dużo oddechu. Brak `playful-toy` energii — to differentiator wobec generycznych robotów z Allegro.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Sezane/Maileg/Lovevery — marki, nie landingi z naszej biblioteki)
- [x] Czy odwracając logo nadal zgaduję branżę? (pastelowy Montessori papier + ręczna kreska = zabawka edukacyjna premium, nie generyczny gadżet)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (Marta = świadoma milenialka Montessori — nie pasuje do kafiny/vibestrike/paromii)
- [x] Czy manifest da się zacytować bez „premium/luxury/wysoka jakość"? (TAK — „papier zamiast ekranu, kreska po kresce, cicho i ciepło")

## 8. Signature element

**Twój signature element:** **Ręcznie kreślona kreska Malujka** — animowany SVG pen-stroke (stroke-dashoffset), który „dorysowuje się" pod kluczowym słowem nagłówka w foncie Caveat, dokładnie tak jak robot kreska po kresce rysuje lisa na papierze. Powtarza się jako podkreślenia akcentów i jako galeria „przyklejonych" rysunków dziecka (lis / rakieta / żaglówka) niczym na lodówce (washi tape). Dodatkowo botaniczny SVG w rogach sekcji (cottagecore primitive).

## 9. Warianty sekcji (LIMITED przez allowed_variants w Style Lock)

- **Hero:** H1 Split klasyczny — headline + script accent po lewej, lifestyle (dziecko + robot) po prawej. (allowed: H1/H5/H6; H1 bo mam mocne zdjęcie lifestyle)
- **Features:** F2 Bento asymetryczny — karty-„recipe" korzyści w editorialnym rytmie. (allowed: F3/F2)
- **Testimonials:** T1 Voices quote grid — 3 głosy mam (społeczność matek = dowód). (allowed: T5/T1)
- **Problem:** P1 Stat — jedna mocna konsekwencja ekranów (PAS z raportu).
- **How:** W1 Horizontal — 3 kroki: włóż kartę → robot mówi po ang. i rysuje → dziecko naśladuje.
- **Comparison:** C1 Table — Malujek vs projektory świetlne / generyczne roboty z Allegro (opisowo, BEZ ✓/✗).
- **Offer:** O3 Guarantee — gwarancja 30 dni jako oś oferty (risk reversal z raportu).

---

## 10. STYLE LOCK — wybrany styl z Atlas

### 10.1 Wybrany styl
- **Style ID:** `cottagecore-botanical`
- **Plik:** [`docs/landing/style-atlas/cottagecore-botanical.md`](../../docs/landing/style-atlas/cottagecore-botanical.md)

<!-- Maszynowe tokeny lock (branding > Atlas — paleta i fonty BRANDU uchylają Atlas) -->
lock-font-display: Nunito
lock-font-body: Nunito
lock-hex: #FAF6EF
lock-hex: #9CBF9A
lock-hex: #FF8A75
lock-hex: #2B3A4A
lock-hex: #4FA8DC

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **ritual** (zestaw ceremonialny / pióro — codzienny rytuał twórczy, nie „robi pracę")
- Precision↔Expression: **expression** (art poster / Bark — chodzi o kreatywność i talent)
- Evidence↔Feeling: **feeling** (La Mer / Kinfolk — zakup z emocji: ulga, ambicja, miłość; dane to tylko podpora)
- Solo↔Community: **dual** (dziecko bawi się samo = czas rodzica, ale aktywność rodzic-dziecko + „rekomendacje matek")
- Quiet↔Loud: **quiet** (Muji / Aesop — raport: „stonowane, pastelowe, NIE krzykliwe"; Marta woli stonowane barwy)
- Tradition↔Future: **tradition** (pióro Pelikan / papier — świat papieru, kredek, craftu Montessori, nie chłodny tech)
- Intimate↔Public: **intimate** (krem / rutyna — dom, chwila rodzica, ukryte poczucie winy = sprawa prywatna)

Match z wybranym stylem: **7/7**. Argumentacja: Cottagecore Botanical to jedyny styl o profilu `ritual·expression·feeling·dual·quiet·tradition·intimate` — chwyta „cichy, ciepły, craftowy" mood, którego raport żąda dla zabawki, jednocześnie unikając krzykliwego Playful Toy (loud). LRU: 2 ostatnie landingi = specification-sheet, editorial-print (brak kolizji).

### 10.3 MUSZĄ być użyte
- Font display: `Nunito` 800/900 (brand override Fredoki — safety #10)
- Font body: `Nunito`; script: `Caveat`
- Paleta (min 3): #FAF6EF papier + #9CBF9A szałwia + #FF8A75 koral
- Layout DNA: editorial column + karty w ciepłym rytmie
- Signature primitive #1: `.botanical-corner` SVG w rogach
- Signature primitive #2: `.script-accent` (Caveat) w hero
- Section architecture min: 10 (rozszerzone do 14 wg kanonu verify-landing)

### 10.4 NIE WOLNO użyć
- **Fonty:** NIE Inter w h1, NIE Fredoka One, NIE Patrick Hand, NIE Archivo Black
- **Layout:** NIE bento 2×2 hard grid, NIE dashboards/charts, NIE Swiss grid
- **Elementy:** NIE neon, NIE saturated/krzykliwe kolory, NIE rotated stickers raw, NIE ✓/✗ w porównaniu, NIE złoto (koral zamiast)
- **Kolory:** NIE cool/neonowe spoza palety
- **Motion:** NIE .js-split, NIE .js-parallax, NIE .magnetic, NIE .js-tilt, NIE .js-counter

### 10.5 Section Architecture
Required (14 wg verify-landing): Header · Mobile Menu · Hero(H1) · Trust Bar (light) · Problem(P1) · Solution/Features(F2) · How It Works(W1) · Comparison(C1) · Testimonials(T1) · FAQ · Offer(O3) · Final CTA · Footer · Sticky CTA
Forbidden (Atlas): Trust Bar dark · Bento 2×2 square · Dashboards/Charts · neon

### 10.6 Motion Budget
```yaml
js_effects_required: [.fade-in]
js_effects_forbidden: [.js-split, .js-parallax, .magnetic, .js-tilt, .js-counter]
js_effects_count: { tilt_min: 0, parallax_min: 0 }
```

## 11. Wow Moments (audyt z ETAP 4)

### Wow Moment 1
- **Strefa:** hero zone
- **Lokalizacja:** Hero — nagłówek
- **Element:** Ręcznie kreślona kreska, która „dorysowuje się" (SVG stroke-dashoffset) pod słowem-akcentem w foncie Caveat — jak robot rysujący kreska po kresce.
- **Czemu unique:** żaden premium landing nie animuje odręcznego podkreślenia jako metafory mechanizmu produktu; tu kreska = dosłownie to, co robi robot.
- pattern-id: custom-pen-stroke
- selector: .hero-scribble
- **Implementation status:** ✅ obecny w HTML

### Wow Moment 2
- **Strefa:** mid zone
- **Lokalizacja:** sekcja „Co narysuje Twoje dziecko" (galeria)
- **Element:** Galeria dziecięcych rysunków (lis, rakieta, żaglówka) przyklejonych washi-tape jak na lodówce — lekko obrócone karty z ciepłym cieniem.
- **Czemu unique:** zamiast packshotów na białym — autentyczna „ściana dumy" rodzica; replikuje rysunki z mockupów produktu.
- pattern-id: custom-fridge-gallery
- selector: .fridge-gallery
- **Implementation status:** ✅ obecny w HTML

### Wow Moment 3
- **Strefa:** conversion zone
- **Lokalizacja:** sekcja przed Ofertą — notka od robota
- **Element:** Odręczna notka powitalna od Malujka (Caveat) na papierowej karcie z washi tape: „Cześć! Od dziś rysujemy razem — kreska po kresce." + podpis.
- **Czemu unique:** personifikacja robota jako ciepłego „nauczyciela sztuki" (archetyp Opiekun+Mędrzec z raportu), nie generyczny badge gwarancji.
- pattern-id: custom-robot-note
- selector: .robot-note
- **Implementation status:** ✅ obecny w HTML

## 12. Mapa obiekcji (v5.0)

- „Czy to nie będzie za trudne dla mojego 4-latka?" → sekcja: How It Works → rozbrojenie: trzy kroki tak proste, że dziecko obsługuje samo — włóż kartę, słuchaj, rysuj.
- „Czy szybko się znudzi jak inne zabawki?" → sekcja: Features/Galeria → rozbrojenie: 100 kart i wciąż nowe kształty — godziny skupienia, nie 10 minut.
- „Czy to bezpieczne dla dziecka?" → sekcja: Trust Bar / FAQ → rozbrojenie: nietoksyczny ABS, zaokrąglone krawędzie, zasilanie USB-C poza zasięgiem dziecka.
- „Czy ekran w robocie to nie to samo zło co tablet?" → sekcja: Problem/How → rozbrojenie: zero ekranu — robot rysuje na papierze, dziecko trzyma prawdziwy pisak.
- „Po co przepłacać, skoro na Allegro są tańsze roboty?" (produkt-specyficzna) → sekcja: Comparison → rozbrojenie: tamte to anonimowi sprzedawcy bez certyfikatów i polskiej obsługi — tu masz markę, gwarancję i wsparcie.

## 13. Big Idea + VOC + Liczby kanoniczne

### 13.1 Big Idea
big-idea: Robot daje dziecku „ekranową" dawkę emocji (ruch, głos, angielskie słowa) — ale na papierze, nie na ekranie; rodzic zyskuje usprawiedliwiony spokój zamiast poczucia winy.
mechanism: Robot skanuje jedną ze 100 kart, mówi słowo po angielsku i mechanicznie kreśli pisakiem kształt na papierze (lis, rakieta, żaglówka) — dziecko naśladuje linie własnym pisakiem (motoryka mała + skupienie + pierwsze ang. słowa).
awareness: problem-aware (rodzic zna ból ekranów i czuje winę — Hero pain+promise, Problem PRZED benefitami; ton afirmatywny, NIE fear-porn)

### 13.2 Język klienta — VOC
VOC: BRAK DANYCH — brak `workflow_products.source_url` i `workflow_reviews` (produkt w fazie pre-launch). Persona i język oparte na report_pdf (awatar „Marta").

### 13.3 Liczby kanoniczne
| wartość | jednostka | źródło |
|---------|-----------|--------|
| 199 | zł (cena startowa) | oferta workflow (MSRP raport 199-249) |
| 249 | zł (cena regularna / anchor) | raport str. 3 (MSRP) |
| 50 | zł (oszczędność) | wyliczenie 249-199 |
| 100 | kart | brand_info + raport |
| 30 | dni (gwarancja zwrotu) | raport str. 9 (oferta) |
| 129 | minut (śr. czas ekranowy dwulatka) | raport str. 4 |
| 60 | minut (limit WHO) | raport str. 4 |
| 4,7 | /5 rating | pasmo 4,6-4,8 + disclaimer stopka (faza wprowadzenia) |
| 3 | lata (od wieku) | raport str. 9 (3+) |
