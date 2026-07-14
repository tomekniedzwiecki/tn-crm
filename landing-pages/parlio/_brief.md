# Design Brief — Parlio

<!-- ETAP 1 (DIRECTION) — wygenerowany 2026-05-29 dla workflow 9329158e-a486-45bf-934d-413482cbc129 (Marek Szpak) -->
<!-- Produkt: inteligentne okulary audio z tłumaczem AI (XG89), Open-Ear, UV400 -->

## 1. Kierunek manifesta (z 01-direction.md)

- [x] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [ ] Nowy (opisz poniżej):

**Mood własny (nie preset):** „**Adriatic Horizon**" — spokojny śródziemnomorski horyzont. Szeroka przestrzeń, ciepłe światło późnego poranka, jeden głos niosący się ponad granicami. Tempo: **spokojne**, pewne siebie, bez pośpiechu (padding sekcji 120–160px).

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Produkt to przyszłościowa technologia (tłumacz AI, Bluetooth 6.0) sprzedawana spokojną, premium, lifestyle'ową narracją wolności w podróży — to architektura Panoramic Calm (future · precision · quiet · solo), ale **ocieplona** śródziemnomorską paletą zamiast zimnego tech-SaaS. Logo marki dosłownie przedstawia falę dźwiękową spotykającą **linię horyzontu** — „głos niosący się przez świat" — co czyni panoramę naturalnym kierunkiem.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Apple (product pages)** — architektoniczne, szerokie ujęcia produktu z dużą ilością światła i pustki; spokojna, minimalna pewność premium bez krzykliwości; whitespace jako luksus.
2. **Kinfolk magazine** — fotografia podróżnicza w ciepłym, bocznym świetle (35mm, golden hour, śródziemnomorskie place i tarasy); pionowa kolumna tekstu, editorial spokój.
3. **Bang & Olufsen** — precyzja i cisza w prezentacji audio; jeden materiałowy akcent, monogram, dotykowa elegancja zauszników; dźwięk jako rzecz premium, nie gadżet.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #0E7C7B  (Adriatic Teal — główny charakter marki, fala dźwiękowa/horyzont, CTA)
- **Ink (główny tekst):** #161E2B  (Ink Slate — nagłówki, body dark)
- **Paper (tło):** #F4EFE8  (Warm Sand — ciepłe tło wszystkich sekcji, NIE zimna biel)
- **Accent / Gold (opcjonalny):** #E8A33D  (Amber Glow — akcent 10%) + #C66B3D (Terracotta Sun — secondary, ciepłe podkreślenia)
- Muted text: #6B7280 (Stone Grey)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fraunces — wagi 400/600/700 (+ italic dla akcentów). Ciepły editorial szeryf, poprawne polskie „Ł" w UPPERCASE.
- **Body (treść):** Inter — 400/500/600/700, neutralny, czytelny.
- **Mono / Caption (opcjonalny):** Space Grotesk — 400/500/700, dla eyebrow, jednostek, paska tłumaczenia, numeracji.

> ⚠️ Wszystkie 3 fonty PL-safe (safety #7 — Fraunces ✅, Inter ✅, Space Grotesk ✅).
> ⚠️ Google Fonts BEZ `&subset=latin-ext` (safety #10 — Google v2 serwuje unicode-range automatycznie; parametr psuje polskie znaki).
> Max 3 rodziny fontów — spełnione (Fraunces + Inter + Space Grotesk).

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Tomasz, 38 lat. Właściciel agencji marketingowej / średniej firmy, Wrocław, żonaty + 1 dziecko, dochód netto 12–16 tys. PLN/mies. Praca hybrydowa, dużo podróży służbowych; 2–3× w roku urlop za granicą z rodziną (Włochy, Hiszpania). Aktywny — rower szosowy, jogging.
- **Kluczowy pain point:** Dyskomfort, gdy w obcym kraju nie potrafi się dogadać (angielski średni — w mniejszych miejscowościach nie wystarcza); nienawidzi słuchawek dousznych — po godzinie bolą uszy i czuje się odcięty od dźwięków otoczenia (rower, ulica).
- **Kluczowa motywacja zakupu:** Chce uprościć życie i czuć się swobodnie i pewnie za granicą, bez gapienia się w telefon. Ceni minimalistyczny design i technologię, która realnie podnosi jakość życia. Patrzeć rozmówcy w oczy, nie w ekran.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Mówię po angielsku nieźle, ale w małej trattorii pod Neapolem i tak czułem się jak natręt z telefonem w dłoni. Teraz po prostu patrzę kelnerowi w oczy i rozmawiam — a uszy mam wolne, słyszę całą ulicę."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** `vitrix` — kierunek Panoramic Calm (myjka do okien smart).
- **Czego unikam (signature elements istniejącego):** NIE kopiuję z vitrix zestawu Plus Jakarta Sans + Instrument Serif ani **zimnej** palety paper/navy/teal SaaS, ani „dashboard-only" chłodnego hero. Parlio ma własną typografię (Fraunces szeryf — ciepły editorial), **ciepłą śródziemnomorską paletę** (terracotta + amber + warm sand) i lifestyle'owe, podróżnicze fotografie zamiast architektonicznego tech-SaaS. Inna temperatura: vitrix = chłodny tech; Parlio = ciepła podróż premium. Forge od zera — zero `cp -r`.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Apple product pages = brand/tech, Kinfolk = magazyn editorial, Bang & Olufsen = marka audio — żadna to sklep DTC fashion)
- [x] Czy odwracając logo nadal zgaduję branżę? (fala dźwiękowa + linia horyzontu + ciepła podróżnicza paleta → audio/translacja w podróży)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (Tomasz — mobilny przedsiębiorca-podróżnik — to nie persona kafiny/workwear ani pupilnika/pet)
- [x] Czy manifest da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (TAK — „jeden głos niosący się ponad granicami; wolne uszy, otwarty horyzont")

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:** **„Pasek tłumaczenia na żywo"** — w hero (i powracający jako divider między sekcjami) spokojnie morfująca dwujęzyczna fraza w Space Grotesk: `Cześć → Ciao → Hello → Hola → Olá`, podkreślona cienką **falą dźwiękową w Adriatic Teal** wpadającą w **linię horyzontu**. To dosłowna wizualizacja magii produktu (tłumaczenie w czasie rzeczywistym prosto do ucha) + echo logotypu (fala+horyzont). Sekundarny motyw: każdy section-divider to cienka pozioma linia horyzontu z jednym tealowym „rozbłyskiem fali" po lewej.

## 9. Warianty sekcji (LIMITED przez allowed_variants w Style Lock — Panoramic Calm)

- **Hero:** H3 Dashboard mockup — aplikacja-tłumacz (telefon z PL⇄IT) obok packshotu okularów + pasek tłumaczenia na żywo. Demonstruje funkcję, zgodne z signature #1 Panoramic („dashboard mockup hero split").
- **Features:** F1 Bento 2×2 — 3 filary wartości (Tłumacz AI / Open-Ear / UV400+lekkość) + 1 kafel „dyskrecja / stealth".
- **Testimonials:** T1 Voices quote grid — 3 krótkie polskie głosy (podróżnik, rowerzysta, przedsiębiorca).

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

> Kontrakt. Fonty/paleta nadpisane brandingiem Parlio (Krok 4.4 — branding ma priorytet; memory `feedback-verify-style-lock-vs-branding`).

<!-- v5.0 maszynowy Style Lock — legalizuje fonty/paletę BRANDU klienta (Parlio) ponad domyślny Atlas Panoramic Calm; przełącza verify-style-lock w tryb BRIEF-LOCK -->
lock-font-display: Fraunces
lock-font-body: Inter
lock-font-accent: Space Grotesk
lock-hex: #0E7C7B
lock-hex: #161E2B
lock-hex: #F4EFE8
lock-hex: #E8A33D
lock-hex: #C66B3D

### 10.1 Wybrany styl
- **Style ID:** `panoramic-calm`
- **Plik:** [`docs/landing/style-atlas/panoramic-calm.md`](../../docs/landing/style-atlas/)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **dual** (robi pracę: tłumaczy/audio/UV ↔ doświadczenie wolnej podróży; kotwice: AirPods Max + Away/Aesop travel)
- Precision↔Expression: **precision** (Apple/Linear/B&O — „clean lines, no gradients, iconic at 32px"; kotwice: Apple, B&O)
- Evidence↔Feeling: **blend** (emocjonalne hero wolności ↔ evidence: 110 języków, 31 g, UV400, BT 6.0; kotwice: Kinfolk feeling + Dyson specs)
- Solo↔Community: **solo** (osobiste urządzenie, „niewidzialny asystent" w uchu; kotwice: skincare serum, meditation app)
- Quiet↔Loud: **quiet** (zero „MEGA -70%", dyskrecja, stealth mode; kotwice: Aesop, Muji)
- Tradition↔Future: **future** (AI, smart glasses, wearable; kotwice: AirPods Max, Tesla accessories)
- Intimate↔Public: **intimate** (głos w uchu, prywatne tłumaczenie, dyskretne słuchanie; kotwice: sleep tracker, face cream)

Match z wybranym stylem: **4/7** (precision · solo · quiet · future zgodne; utility/dual i evidence/blend i public/intimate — różnice). Argumentacja (1 zdanie): spośród remisujących 4/7 (Panoramic Calm / Clinical Kitchen / Clinical Warmth) Panoramic Calm wygrywa tematycznie — marka jest dosłownie o **horyzoncie i głosie niosącym się przez świat** (panorama, podróż, spokojna pewność), jest DR-compatible (14 sekcji, comparison/offer/counters dozwolone — Japandi by je zakazał), a future+quiet+solo+precision pasują wprost do tech premium ocieplonego paletą.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu, z override brandingu)
- Font display: **Fraunces** w font-family (override Panoramic Plus Jakarta — branding Parlio ma priorytet)
- Font body: **Inter**; accent/mono: **Space Grotesk**
- Paleta (min 3 z 5): `#F4EFE8` (paper), `#161E2B` (ink), `#0E7C7B` (teal akcent) + `#C66B3D`, `#E8A33D`
- Layout DNA: Panorama wide — szerokie obrazy 16:9/21:9, architektoniczna siatka overlay, gładkie tła gradientowe, dashboard/app mockup w hero
- Signature primitive #1 obecny: wide panoramic hero + app-mockup + pasek tłumaczenia/linia horyzontu
- Section architecture min: **14 sekcji**

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE Plus Jakarta Sans / Instrument Serif jako baza (zastąpione brandingiem); NIE Italiana, NIE Fredoka One
- **Layout:** NIE używać zimnej tech-SaaS interpretacji dla tej ciepłej marki; NIE `border-left: 4px solid` na kartach; NIE bento z identycznymi kaflami
- **Elementy:** NIE checkmarks ✓/✗ w comparison; NIE neon glow orbs; NIE cursor-follower/glitch/auto-play video w hero
- **Kolory:** NIE czysta zimna biel `#FFFFFF` jako tło sekcji (poza headerem); NIE krzykliwa czerwień/pomarańcz dla statystyk „problemu"
- **Motion:** moderate — NIE przeładowane efekty; zachowaj spokój (subtelne fade/parallax, bez confetti)

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 14): Header, Mobile Menu, Hero, Trust Bar, Problem, Solution, How It Works, Comparison, Testimonials, FAQ, Offer, Final CTA, Footer, Sticky CTA (+ Cookie Banner).
Forbidden: brak specyficznych (Panoramic dopuszcza pełną architekturę DR).

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-split, .js-counter, .magnetic, .js-tilt]
js_effects_forbidden: [glitch, cursor-follower, auto-play-video-hero, confetti]
js_effects_count: { counter_min: 2, magnetic_min: 2, tilt_min: 2 }
```

---

## 11. Wow Moments (audyt z ETAP 4)

### Wow Moment 1
- **Strefa:** hero zone
- **Lokalizacja:** sekcja 3 — Hero
- **Element:** „Pasek tłumaczenia na żywo" — karta `.translate-card` z pulsującą kropką „na żywo" i frazą morfującą PL→IT/EN/ES/FR/JP (Cześć→Ciao→Hello→Hola), animowana fala dźwiękowa `.tc-wave` + ticker `.tk-word` z przerywanym tealowym podkreśleniem (fala+horyzont). Plus oversized parallax glif „语" w tle hero.
- **Czemu unique:** Apple/Linear/Stripe pokazują statyczny dashboard; tu interfejs DEMONSTRUJE rdzeń produktu (tłumaczenie do ucha) w ruchu — nikt z premium tech nie animuje realnej funkcji jako hero proof.
- **Implementation status:** ✅ obecny w HTML (`.translate-card`, `.tc-wave`, `.tk-word`, JS ticker)

### Wow Moment 2
- **Strefa:** mid zone
- **Lokalizacja:** dividery między wszystkimi sekcjami (`.horizon`)
- **Element:** „Linia horyzontu z falą dźwiękową" — cienka pozioma linia z tealowym rozbłyskiem koncentrycznej fali po lewej, powtarzana między sekcjami jako rytm strony. Echo logotypu (fala spotyka horyzont) = „głos niosący się przez świat".
- **Czemu unique:** zamiast generycznych section-borderów lub gradientów, każdy przeskok sekcji niesie motyw marki; spójny system wizualny, którego nie ma żaden baseline.
- **Implementation status:** ✅ obecny w HTML (`.horizon` ×9 + pseudo `::before/::after` ripple)

### Wow Moment 3
- **Strefa:** conversion zone
- **Lokalizacja:** sekcja 12 — Offer
- **Element:** Offer box z animowanym „beam" gradientem (teal→amber→terracotta) na górnej krawędzi, edge-to-edge zdjęciem premium unboxingu po lewej, licznikiem ceny `329` liczonym od zera i dwoma swatchami wariantów (Czarny mat / Biały).
- **Czemu unique:** premium unboxing + ruchomy beam + counter price reveal w jednym boksie scala dowód jakości (etui, akcesoria) z konwersją; nie jest to płaski pricing card.
- **Implementation status:** ✅ obecny w HTML (`.offer-box::before` beam, `.offer-figure` unboxing, `.js-counter` 329, `.offer-variants`)
