# Design Brief — Cervila

<!-- ETAP 1 DIRECTION — wypełniony z danych Supabase (workflow 70c33f61-998a-46c1-a62c-203193489f11) -->
<!-- Produkt: Ergonomiczna poduszka ortopedyczna 2-w-1, profil motylkowy, pianka memory 45-65 kg/m³ -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Clinical Warmth** — ciepła apteczna precyzja. Medyczna karta wyrobu (etykieta składu / strefy anatomiczne) renderowana w ciepłej palecie i eleganckiej szeryfowej typografii zamiast sterylnego laboratorium. Łączy autorytet medyczny (segment Tomasz) z premium spokojem regeneracji (segment Magdalena).

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Raport strategiczny ramuje produkt jako **rozwiązanie problemu poparte dowodem** — klient kupuje rezultat (bezbolesne poranki, ochrona skóry), a funnel opiera się na anatomii, 5 strefach wsparcia, certyfikatach OEKO-TEX i autorytecie fizjoterapeuty. To utility·precision·evidence — profil **Clinical Warmth** (7/7, patrz sekcja 10), nowy styl Atlasu wyodrębniony z Apothecary Label i ocieplony pod branding klienta (szeryf Cormorant + ciepła paleta cervical-blue/krem/coral) — medyczna etykieta w ciepłym, premium wydaniu.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Aesop** — etykieta-jako-design: pełnoszerokościowy blok specyfikacji składu, typograficzna powściągliwość, ciepły off-white papier zamiast czystej bieli. Ton apteczny bez kliniki-zimna.
2. **Necessaire (body care)** — „technical disclosure as design": spec-first, jawne ujawnienie parametrów (gęstość pianki, strefy, certyfikaty) jako element wizualny, nie ukryte w drobnym druku.
3. **Bang & Olufsen** — precyzja monogramu i cisza premium: pojedynczy akcent, dużo pustki, geometryczna dyscyplina (referencja z briefu logo Cervili — sygnet C jako łuk kręgosłupa szyjnego).

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #2D4A6B  <!-- Cervical Blue — autorytet medyczny, CTA i akcenty -->
- **Ink (główny tekst):** #1A2332  <!-- Midnight Spine — nagłówki i body -->
- **Paper (tło):** #F7F4ED  <!-- Morning Light — ciepły off-white, tło sekcji -->
- **Accent / Gold (opcjonalny):** #C8826B  <!-- Therapy Coral — jedna ciepła akcenta per sekcja (highlight, korzyść beauty) -->

Wsparcie: Linen Cream #E8DCC4 (karty, dividery), Vertebra Gray #6B7785 (meta, jednostki, captiony).

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Cormorant Garamond — `&display=swap` (branding override per Krok 4.4 — zamiast IBM Plex Sans stylu; elegancki szeryf = medyczny autorytet + ciepło, nie sterylność)
- **Body (treść):** Inter — `&display=swap`
- **Mono / Caption (akcent):** Manrope — uppercase + letter-spacing dla pasków sec-meta / jednostek / numeracji stref (rola „mono-like" zamiast IBM Plex Mono)

> ⚠️ Polskie znaki: Cormorant Garamond, Inter, Manrope mają pełny zakres PL w Google Fonts v2 — NIE dodawać `&subset=latin-ext` (memory: feedback-landing-fonts-polish). „Ł" w UPPERCASE w Cormorant Garamond renderuje się poprawnie (line-height ≥ 1.4 dla uppercase). Max 3 rodziny.

## 5. Persona główna (z report_pdf)

Segment główny = **Tomasz (Korpo-Sufferer / Ortho)**; segment wtórny = Magdalena (Beauty) obsłużony w sekcji „Dualny kąt korzyści".

- **Wiek / zawód / status:** Mężczyzna 30–48 lat, specjalista IT / manager / kierownik projektów / kierowca zawodowy. Praca siedząca 8–10h przy biurku.
- **Kluczowy pain point** (co najbardziej frustruje): poranna sztywność karku, napięciowe bóle ramion, drętwienie rąk i palców w nocy, migrenowe poranne bóle głowy → spadek koncentracji i produktywności mimo „przespanych" 8 godzin.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): eliminacja bólu fizycznego, głęboka regeneracja, wstanie rano z pełnią energii. Pragmatyk — szuka dowodu (anatomia, certyfikaty, opinie fizjoterapeutów) i gwarancji bez ryzyka (30 dni na test).
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Kupiłem już dwie poduszki ortopedyczne i były tak twarde, że nie dało się na nich spać. Przy tej pierwsze dwie noce były dziwne, trzeciej rano wstałem bez chwytania się za kark."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** `h2vital` — Organic/Natural (wellness). Najbliższy kategorią (zdrowie/sen), ale inny kierunek. NIE powtarzam zaokrąglonego sans + zielono-beżowej organiki + „miękkiego spa" — Cervila jest **kliniczna-precyzyjna** (szeryf + cervical blue + spec-label), nie organiczno-roślinna.
- **Już istnieje:** `vapoflow`, `steamla` — również Apothecary Label. NIE powtarzam ich palety ani sterylnego IBM Plex labu. Cervila różni się: ciepły **Cormorant Garamond** szeryf (nie geometric sans), paleta **cervical-blue/krem/coral** (ciepła, nie zimna), oraz sygnatura **anatomicznej etykiety 5 stref** unikalna dla poduszki.
- **Czego unikam (signature elements istniejącego):** brak gigantycznego pojedynczego „H₂O 160px" jak Steamla — moja spec-label to numerowana karta 5 stref anatomicznych (01–05), nie jeden monolityczny składnik.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Aesop, Necessaire, Bang & Olufsen — premium care/audio, nie sklepy z poduszkami)
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? (etykieta składu + strefy anatomiczne + cervical blue = zdrowie kręgosłupa/sen)
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? (Tomasz korpo-pragmatyk-evidence ≠ playful/retro/rugged/luxury)
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (mówimy: anatomia, strefy, gęstość, certyfikat, dowód — nie przymiotniki)

## 8. Signature element

**Anatomiczna etykieta 5 stref (spec-label „karta wyrobu medycznego").** Pełnoszerokościowy blok w ramce 2px (ink), numeracja `01–05` w Manrope mono-uppercase, każda strefa = nazwa anatomiczna (ARC wsparcia szyjnego, wgłębienie centralne, kontur barków, panele na ramiona, wycięcie ochrony policzka) + jednozdaniowy opis działania. Każda kluczowa liczba (gęstość pianki, °C termoregulacji, 5 stref) z przypisem `[n]` i stopką źródłową — apteczna uczciwość zamiast marketingowych superlatyw. To wizualny „dowód anatomiczny", którego oczekuje Tomasz.

## 9. Warianty sekcji (LIMITED przez allowed_variants w Style Lock — clinical-warmth)

- **Hero:** H1 Split klasyczny — lewa kolumna headline + CTA + odznaki gwarancji, prawa kolumna placeholder zdjęcia produktu (poduszka motylkowa) z paskiem sec-meta nad hero.
- **Features:** F3 Linear stack (spec-rows) — 5 stref anatomicznych jako tabelaryczne wpisy `01 · Strefa …` (NIE bento 2×2).
- **Testimonials:** T2 Before/After stats — evidence-style (poranna sztywność „przed" vs „po"), zgodne z tonem dowodowym; dodatkowo pojedyncze cytaty w formacie spec-row.

---

## 10. STYLE LOCK — wybrany styl z Atlas (apothecary-label)

> Kontrakt na cały landing. Branding klienta (Cormorant + ciepła paleta) nakładam przez **Krok 4.4 (branding ma priorytet)** — adnotacje override poniżej. Gate deployu (verify-landing.sh) egzekwuje budżet JS-motion stylu: zachowuję go 1:1.

### 10.1 Wybrany styl
- **Style ID:** `clinical-warmth`
- **Plik:** docs/landing/style-atlas/clinical-warmth.md
- **Pochodzenie:** nowy styl wyodrębniony z Apothecary Label (ten sam DNA), ocieplony pod branding klienta. Dodany do Atlasu 2026-05-29 (procedura Krok: „jeśli żaden styl nie pasuje → dodaj nowy"). Apothecary forbidził Cormorant/cream, Japandi forbidził konwersję — stąd nowy archetyp.

### 10.2 Product DNA (z Kroku 9a.1) — match 7/7
- Utility↔Ritual: **utility** — produkt wykonuje pracę (likwiduje ból karku), klient kupuje rezultat nie rytuał. Kotwice: Shark steam mop, mono-olej squalane.
- Precision↔Expression: **precision** — anatomia, 5 stref, gęstość 45-65 kg/m³. Kotwice: thermometer medical, scale Withings.
- Evidence↔Feeling: **evidence** — funnel oparty na fizjoterapeucie, certyfikatach, tabeli porównawczej. Kotwice: Medela clinical trials, Dyson „99%".
- Solo↔Community: **solo** — osobisty sen, indywidualna regeneracja. Kotwice: skincare serum, meditation app.
- Quiet↔Loud: **quiet** — ton „wyrafinowany, unika nachalnej sprzedaży" (archetyp Mędrzec). Kotwice: Aesop apothecary, Muji.
- Tradition↔Future: **present** — współczesny wyrób kliniczny (pianka memory to obecna technologia, nie retro/futur). Kotwice: Native deodorant, Seventh Generation.
- Intimate↔Public: **intimate** — sypialnia, sen, pielęgnacja. Kotwice: skincare routine, sleep tracker.

Match z wybranym stylem: **7/7**. Argumentacja (1 zdanie): produkt to „precyzyjne, poparte dowodem, jednofunkcyjne narzędzie do prywatnego użytku komunikowane cicho" — profil Clinical Warmth (ten sam DNA co Apothecary, ale ocieplona egzekucja: szeryf + ciepły papier + brand color).

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Display font: **Cormorant Garamond** w `font-family`
- Label font: **Manrope** uppercase letter-spaced — min 1 występ per sekcja (sec-meta / jednostki / numeracja stref)
- Min 1 `<table>` lub `.spec-*-list` (Comparison Table + spec-rows stref)
- Primitive 1: `.spec-label` section obecny (anatomiczna karta 5 stref) — sygnatura
- Padding sekcji ≥ `100px 0` desktop (empty-space as design)
- Ciepły papier `#F7F4ED` jako tło sekcji + sec-meta strip ZAMIAST dark trust-bar
- Footnoted claims: liczby z przypisem `[n]` + stopka źródłowa
- Motion: `.fade-in` (zawsze) + `.js-counter` (1–3, dla 5 stref / 65 kg/m³ / 12 000 klientów)

### 10.4 NIE WOLNO użyć (auto-paste z pliku stylu)
- **Fonty:** NIE Fraunces, IBM Plex, Archivo Black, Caveat, Fredoka, Nunito
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz) — features jako spec-rows pionowe
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic numeral), NIE dark `.trust-strip` z icon-circles
- **Kolory:** NIE czysta biel `#FFFFFF` jako tło sekcji, NIE `linear-gradient` w tłach sekcji, NIE złoto bright `#C9A961`
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 10): Header · Mobile Menu · Hero (spec-label vibe) · Sec Meta Strip · Spec Label Big (5 stref) · Features as Spec Rows · How It Works (proces adaptacji 3 kroki) · Comparison Table · FAQ (5-7) · Offer (konfigurator pakietów) · Footer.
Dodatkowe (optional dozwolone): Problem (agitacja), Testimonials spec-style, Sticky CTA mobile.
Forbidden: Trust Bar dark z icon-circles, Social Proof Marquee, Final CTA Banner (wide).

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-counter]
js_effects_forbidden: [.js-split, .js-parallax, .magnetic, .js-tilt]
js_effects_count: { counter_min: 1, counter_max: 3, magnetic_min: 0, tilt_min: 0, parallax_min: 0 }
```
