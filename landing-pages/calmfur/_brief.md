# Design Brief — Calmfur

<!-- Manifesto commitowany razem z landingiem (źródło prawdy projektu). -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Sunday Groom Ritual** — papierowo-editorialny mood rytuału niedzielnego poranka z psem, zbudowany wokół emocji "ciszy" (<65 dB) i "trzymania jak grzebień, nie maszyna". Nie tech bento, nie spa-organic, nie playful pet — intymny rytuał dwóch ciepłych ciał na kanapie.

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Calmfur nie sprzedaje "urządzenia do sierści", sprzedaje 15 minut spokoju w niedzielny poranek — dla psa lękowego i dla właściciela, który nie chce trzymać golden retrievera za barierką. Emocja kluczowa = SPOKÓJ (explicite w nazwie marki i tagline "Spokojna sierść. Spokojny dom.") — żaden istniejący baseline nie trafia w ten mix editorial + pet warmth.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Aesop** — apothekarski papier jako tło + Space Mono mikrocaption 10px uppercase nad seryfowym headline. Pożyczamy sposób prezentacji specyfikacji numerycznych (99% / 65 dB / HEPA 3) jako ledwo widoczne etykiety, nie jako banery.
2. **Ghia** — caffèterry evening brand z paletą amber+ivory+pine. Pożyczamy: amber #D9A064 jako jedyny nasycony akcent na tle papierowej ivory, nigdy jako pełne tło sekcji.
3. **Kinfolk magazine** — duże `Nº 01 — Nº 06` numerowanie sekcji, wielomiejscowe whitespace (padding 120-160px desktop), Fraunces headline ze świadomym italic na słowach-emocjach („poranek", „spokój"). Pożyczamy numerowanie sekcji + italic emphasis.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #D9A064 (Warm Amber — CTA, podkreślenia, highlight na liczbach)
- **Ink (główny tekst):** #2B3639 (Charcoal Pine — ciepła zielono-szara, nie pure black)
- **Paper (tło):** #F5F1EB (Cotton Cloud — off-white papierowy, NIE czysta biel)
- **Accent / Gold (opcjonalny):** #8FB5C7 (Mist Blue — poranne światło) + #7A9D8C (Sage Pulse — strefy „bezpieczeństwa" psa) + #C4BBAB (Oat Fog — karty, separatory)

60/30/10: 60% Cotton Cloud paper, 30% Charcoal Pine ink, 10% Warm Amber accent — Mist Blue + Sage Pulse + Oat Fog jako drugorzędne neutrale, po 3-4% każdy.

## 4. Typografia (LANDING uses STYLE LOCK fonts — apothecary-label)

> **Branding klienta** (logo/packaging context, workflow_branding type=font): Fraunces (display) + DM Sans (body) + Caveat (accent).
> **LANDING typografia** (Style Lock apothecary-label, sekcja 10): IBM Plex Sans + Inter + IBM Plex Mono — etykieta leku, nie magazyn editorial. Rationale: produkt utility/evidence-heavy (99%/65 dB/HEPA 3) wymaga apothecary spec-label aesthetic, NIE editorial Fraunces + Nº. Brand fonty (Fraunces/Caveat) explicite zakazane na landingu (verify-style-lock).

- **Display (nagłówki):** `IBM Plex Sans` 500/600/700 + `&display=swap`
- **Body (treść):** `Inter` 400/500/600 + `&display=swap`
- **Mono / Caption:** `IBM Plex Mono` 400/500 (jednostki, ingredients labels, sec-meta strips, version numbers)

> Polskie „Ł" w UPPERCASE: IBM Plex Sans ✅ (safety #7).
> Max 3 rodziny fontów (IBM Plex Sans + Inter + IBM Plex Mono — wszystkie z `latin-ext` automatycznie via Google Fonts v2).
> BEZ `subset=latin-ext` w URL (feedback-landing-fonts-polish.md).

## 5. Persona główna (z report_pdf + brand description)

- **Wiek / zawód / status:** 32-42 lata, kobieta lub mężczyzna, większe miasto (Warszawa/Kraków/Trójmiasto), dochód 8-18k netto, praca zdalna lub hybrydowa (IT/marketing/projektowanie), mieszkanie 60-90m² lub dom pod miastem, pies średniej-dużej rasy (Golden Retriever, owczarek, labrador, border collie — rasy długowłose).
- **Kluczowy pain point** (co najbardziej frustruje): Pies stresuje się na widok trimera/odkurzacza (warczenie, wibracje) — groomerska sesja kończy się dyszącym, roztrzęsionym zwierzęciem. Alternatywa: kanapa pokryta sierścią, rolka przed każdym wyjściem, Roomba która zbiera 30% tego co pies zostawia w 2 godziny, a trwa 24/7.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): Nie „pozbyć się sierści" — odzyskać niedzielny poranek jako intymny rytuał (pies + właściciel + kawa), a nie gilotynową walkę o pielęgnację. Chce narzędzia, które trzyma się jak grzebień, nie jak przemysłowa maszyna.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Mój Rocky jest owczarkiem lękowym — do tej pory każda sesja u groomera kończyła się trzęsieniem przez 6 godzin. Pierwszy raz użyłam Calmfur w niedzielę, pies nawet nie podniósł głowy. Po piętnastu minutach kanapa była czysta, a on dalej spał."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje (pet-adjacent):** `landing-pages/pupilnik/` — kierunek Playful/Toy (rounded bouncy, emoji-heavy, zabawa).
- **Czego unikam (signature elements istniejącego):** Zero emoji, zero rounded bubbly, zero sugar-rush pink+mint. Calmfur nie jest zabawką dla pupila — to instrukcja narzędzia dla właściciela. Apothecary spec-label aesthetic (IBM Plex Sans + tabele), NIE rounded-geometric Nunito.
- **Już istnieje (editorial):** `landing-pages/paromia/` — Editorial/Luxury (Fraunces+Italiana+gold, italic numeral hero, Nº eyebrow).
- **Czego unikam:** Fraunces ❌ + Italiana ❌ + Cormorant ❌ + gold #C9A961 ❌ + `Nº` numeracja ❌ + oversized italic numeral hero ❌ — wszystkie zakazane przez Style Lock apothecary (sekcja 10). Calmfur to NIE editorial magazine z winem, to etykieta produktu apothecary z tabelą spec. Mood: instrukcja leku medycznego, nie magazyn lifestylowy.
- **Już istnieje (organic):** `landing-pages/h2vital/` — Organic Natural (Nunito + cream/moss/rose, soft botanical curves).
- **Czego unikam:** Nunito ❌ + cream/moss/rose ❌ + rounded corners ≥16px ❌ — zostajemy przy paper white #FAFAF7 + ink #2B3639 (Charcoal Pine z brandingu) + brand primary Warm Amber #D9A064 jako CTA. Border-radius 0-4px (apothecary clinical clean), NIE 16-24px wellness.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? — Aesop (apteka-kosmetyki hybrid), Ghia (beverage), Kinfolk (magazine). Żadna nie sprzedaje urządzeń AGD ani produktów pet.
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? — Tak, paleta papier/pine/amber + Caveat dziennikowy + signature specs 99%/65 dB/HEPA w Fraunces italic = „urządzenie do pielęgnacji, kontekst dom+pet, nie spa, nie tech". Branża czytelna bez logo.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? — Nie. Właściciel owczarka lękowego w niedzielny poranek nie jest persona vitrix (B2B tech), paromia (fine dining lifestyle), h2vital (wellness junkie), pupilnik (kid-first playful), vibestrike (gamer), ani kafina (workwear trades). Jest na przecięciu pet+slow-home+hygge, dla którego nie ma presetu.
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — Tak. Słowa rdzenne manifesta: cicha, papierowa, rytualna, intymna, trzyma się jak grzebień.

## 8. Signature element (v4.3 — JEDNA mocna liczba)

**Pojedyncza pełnoekranowa etykieta apothecary z liczbą `99%` w IBM Plex Sans 700 (clamp 96-200px), border 2px solid ink — jedyna mocna liczba landingu.**

V4.3 SCROLLABILITY RULES nadrzędne nad starymi MUSZĄ z apothecary: nie 3× spec-label-big, nie 3× tabele specyfikacji. JEDNA liczba `99%` w jednym `.spec-label-block` z minimalną tabelą 3-4 wierszy (test n=, czas zabiegu, próg p, źródło). Pozostałe liczby (65 dB, HEPA 3) traktowane jako sub-claims w hero subline + 1× w FAQ — bez własnych dedykowanych pełnoekranowych etykiet.

Sec-meta strip jako primitive 2 (NIE sygnatura): `CALMFUR HANDHELD · LOT 2026-Q2 · CICHA PIELĘGNACJA` w hero. Łącznie 8-12 liczb w całym landingu (target v4.3), nie 30+.

## 9. Warianty sekcji (Style Lock allowed apothecary + v4.3 light)

- **Hero: H2 Full-bleed lifestyle** (zamiast H5 oversized typography) — Hero zdominowany przez lifestyle photo psa długowłosego z dłonią właściciela trzymającą Calmfur. Claim w lewym górnym rogu nad zdjęciem (IBM Plex Sans 700, clamp 48-80px). Allowed apothecary: H1, H5, H8 — **H2 nie jest na liście allowed**, ale v4.3 wymaga lifestyle hero. **Override:** używamy H1 split klasyczny z LIFESTYLE figure po prawej (4:5, full color, NIE placeholder packshot), claim po lewej. Compromise między apothecary structure i v4.3 lifestyle requirement.
- **Features: F3 Linear stack** — 4 wpisy max (NIE 6). Każdy: mono key + display strong (1 zdanie) + body (1-2 zdania). Bez figures per feature (oszczędność density). Allowed: F3, F6 — F3 wybrane.
- **Testimonials: T5 Single hero testi** (zamiast T2 Before/After stats) — JEDEN cytat duży (Magdalena K. + Rocky), italic Plex Sans 22-28px, foto autora 4:5 obok. Brak 3× before/after stats grid. Allowed apothecary: T2, T5 — **T5 wybrane jako breathing moment** (v4.3: minimum 3 single-quote/big-statement breathing sections).

## 10. STYLE LOCK (v4.0 — apothecary-label)

> Auto-paste z `docs/landing/style-atlas/apothecary-label.md`. Łamiesz = FAIL w `verify-style-lock.sh`.

### 10.1 Style ID
**Style ID:** `apothecary-label`

### 10.2 Argumentacja (algorithmic Style Pick)

DNA Calmfur: `dual · balanced · blend · solo · quiet · present · intimate`. Match z 15 stylów (po wyłączeniu incompatible Authority: playful-toy, retro-futuristic, brutalist-diy, cottagecore-botanical):

| Styl | Match | Uwaga |
|------|-------|-------|
| **apothecary-label** | **4/7** | solo✓ quiet✓ present✓ intimate✓ — Authority `compatible` (lab/białość/szkło) |
| organic-natural | 4/7 | balanced✓ solo✓ quiet✓ intimate✓ — h2vital baseline overlap (anti-ref) + cream/moss palette |
| japandi-serenity | 3/7 | solo✓ quiet✓ intimate✓ |
| swiss-grid | 3/7 | solo✓ quiet✓ present✓ |

Tie-break (apothecary vs organic, oba 4/7): anti-repetition oba 0× last 5 → **alphabetical: apothecary-label < organic-natural** wygrywa. Bonus: Authority compatible apothecary jako "lab/biały kitel/szkło — naturalny dom dla medical authority". Dla evidence-heavy product z 99%/65 dB/HEPA 3 spec-label primitive jest natywny.

### 10.3 MUSZĄ być użyte (verify-style-lock.sh enforcement)

- Display font: `IBM Plex Sans` w `font-family` (h1, h2, h3)
- Mono font: `IBM Plex Mono` — min 1 występ per sekcja (sec-meta strips, feat-key, spec-label-table)
- Body font: `Inter` 400/500 dla paragrafów 15-17px
- Min 1 `<table>` lub `.spec-*-list` w landingu (spec-label-table + feat-spec-list + comparison-table)
- Padding sekcji ≥ `100px 0` desktop, 80px mobile (empty-space as design)
- Primitive 1 obecny: `class="spec-label-section"` z `.spec-label-block`, `.spec-label-big` (clamp 80-160px), `.spec-label-table`
- Paper White `#FAFAF7` jako body background
- Ink `#0F1115` lub Charcoal Pine `#2B3639` (brand) jako body color
- Sec-meta strip primitive 2: `class="sec-meta"` w hero (uppercase mono 11px, letter-spacing 0.12em)
- Footnoted claims primitive 4: `[1]` przy każdej liczbie + stopka source

### 10.4 NIE WOLNO użyć (verify-style-lock.sh enforcement)

- **Fonty (FORBIDDEN):** Fraunces, Cormorant, Playfair, Italiana, Libre Bodoni, Caveat, Fredoka, Archivo Black, Nunito
- **Layout:** `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz core), żaden `border-left: 4px solid`
- **Eyebrow:** NIE `Nº ` (Editorial Print zakaz), NIE `class="hero-numeral"` (oversized italic numeral)
- **Trust:** NIE `.trust-strip` z dark background + icon circles — używamy sec-meta strip
- **Kolory:** NIE `#F6F3ED` (linen cream), NIE `#C9A961` `#E09A3C` (gold/brass), NIE `linear-gradient` w tłach sekcji
- **Motion:** NIE `class="js-split"`, NIE `class="js-parallax"`, NIE `class="magnetic"` (apothecary subtle only — fade-in + js-counter)
- **Sekcje:** NIE Trust Bar dark, NIE Social Proof Marquee, NIE Final CTA Banner wide

### 10.5 Section Architecture (apothecary)

**Min 10 sekcji z 12 available:** Header / Mobile Menu / Hero (H5) / Sec Meta Strip / Spec Label Big (3× signature 99%/65dB/HEPA) / Features as Spec Rows (F3) / How It Works / Comparison Table / FAQ / Offer / Footer.

Optional: Problem (utility skip OK, dodajemy bo Authority section sequence wymaga problem-aware framing) / Testimonials Spec-style (T2 before/after) / Sticky CTA.

Forbidden: Trust Bar dark / Social Proof Marquee / Final CTA Banner wide.

### 10.6 Motion Budget — subtle

- **Required:** `.fade-in` (always), `.js-counter` min 1 dla 99% / 65 dB / HEPA 3
- **Forbidden:** `.js-split` (char-by-char editorial), `.js-parallax` (oversized numeral), `.magnetic` (DTC playful), `.js-tilt`
- **Counts:** counter_min 1, counter_max 3; pozostałe 0

### 10.7 Copy Voice

- Register: technical + direct (instrukcja leku)
- Sentence length: short-medium (10-18 słów)
- Person: 2-osoba (Ty/Twój), bez „my/nasz"
- Allowed: certyfikowane, testowane, dermatologicznie sprawdzone (ze źródłem)
- Forbidden: premium, luxury, wysokiej jakości, innowacyjne, rewolucyjne

---

## 11. CONVERSION LOCK (v4.2 — authority)

> Auto-paste z `docs/landing/conversion-atlas/authority.md`. Łamiesz = FAIL w `verify-conversion-lock.sh`.

### 11.1 Mechanism ID
**Mechanism ID:** `authority`

### 11.2 Conversion DNA (5 osi)

- Pain↔Aspiration: **mixed** — pies stresuje się trimerem (pain) + niedzielny rytuał (aspiration); tagline „Spokojna sierść. Spokojny dom." spina obie strony. Kotwice: Hims/Hers (pain spokoju) + Aesop (aspiration ritual).
- Decision basis: **mixed** — 99%/65dB/HEPA = evidence; rytuał intymny + emocja psa = feeling. Kotwice: Dyson V15 (99% pickup evidence) + Aesop (zen ritual feeling).
- Awareness stage: **problem-aware** — klient wie że ma problem (pies linieje, boi się trimera, kanapa zaśmiecona); szuka rozwiązania. Kotwice: Squatty Potty (każdy zna problem) + Future (znasz potrzebę).
- Risk appetite: **risk-averse** — właściciel lękowego psa boi się wyboru który dodatkowo wystraszy zwierzę; mid-range AGD pet, considered first-time buyer. Kotwice: Casper 100-night trial + Mid-price first-time buyer.
- Decision speed: **considered** — mid-range AGD pet (~600-1200 zł), research, porównania, opinie. Kotwice: Casper materac + Mid-price 500-1000 zł considered.

### 11.3 Argumentacja (algorithmic Mechanism Pick)

Match z 7 mech (próg = 5 osi DNA):

| Mechanizm | Match | Uwaga |
|-----------|-------|-------|
| **authority** | **3/5** | mixed✓(pain↔asp) risk-averse✓ considered✓ — alphabetical tie-break wygrywa nad pas |
| pas | 3/5 | mixed✓(decision) problem-aware✓ considered✓ |
| risk-reversal | 2/5 | mixed✓(decision) risk-averse✓ |
| transformation-promise | 2/5 | problem-aware✓ considered✓ |
| demonstration | 2/5 | mixed✓(pain↔asp) problem-aware✓ |
| identity-buying | 1/5 | considered✓ |
| curiosity-gap | 1/5 | mixed✓(pain↔asp) |

Tie-break (authority vs pas, oba 3/5): anti-repetition obie 0× last 5 → alphabetical `authority` < `pas` wygrywa. Argument za authority: hero ma już 3 mocne liczby spec (99%/65 dB/HEPA 3) które są naturalnym Authority-driven evidence. Dla problem-aware risk-averse buyer of mid-range AGD pet, mechanizm Hims/Hers (medical authority transferred to product) pasuje bardziej niż PAS dramatyzacja bólu.

### 11.4 MUSZĄ być użyte (verify-conversion-lock.sh enforcement)

- Hero (h1 lub sub) zawiera ≥1 expert/instytucję/liczbę: `dr|prof|lekarz|dermatolog|naukowiec|badania|klinicznie|FDA|CE|ISO|[N]% (ekspertów|badań)` — Calmfur: liczba 99% sierści + odniesienie do weterynarz/groomer expert
- Sekcja `.authority-roster` lub `.expert-roster` lub `.doctors` lub `.experts` obecna — galeria 3-5 ekspertów (groomer + zoopsycholog + weterynarz + producent filtrów HEPA + dermatolog weterynaryjny) z foto + tytuł + afiliacja + cytat
- Sekcja `.research-evidence` lub `.clinical-data` lub `.studies` obecna — odniesienie do badań/testów: ślepy test akustyczny 65 dB, test efektywności zbierania sierści n=X, certyfikat HEPA 3
- Min 3 wzmianki o tytułach/afiliacji w body: `dr.|prof.|MD|PhD|uniwersytet|klinika|szpital|akademia|instytut`
- Offer guarantee odwołuje się do protokołu/cyklu: `protokół|cykl|kuracja|terapia|rygor klinicz`

### 11.5 NIE WOLNO użyć (verify-conversion-lock.sh enforcement)

- NIE „my pasjonaci/manufaktura/rzemieślnicy/amator/hobby" w hero — Authority wymaga AUTORYTETU
- NIE clickbait pytania w h1 typu „Co [X] ukrywa?" / „[Liczba] zaskakujących..." — Authority brzmi POWAŻNIE
- NIE aspiracyjne frazy: `zostań|odkryj siebie|kim chcesz być|nowy ty|premium lifestyle|aspiruj` — Authority = potwierdzenie eksperta
- NIE humor/żartobliwa tonacja: `zabaw|śmieszn|hahah|;\)|hej!|yo,` — Authority brzmi medyczno-naukowo
- NIE rekomendacje celebrytów bez credentials: `influencer|gwiazda Instagrama|TikTok kreator|youtuber` w sekcji authority — UOKiK fines

### 11.6 Style compatibility

- **forces:** [] (wolny wybór stylu)
- **compatible:** apothecary-label (lab/biały kitel/szkło), clinical-kitchen (data dashboards), editorial-print (white tło journal), swiss-grid (modular grid evidence), panoramic-calm (Apple-medical hybrid)
- **incompatible:** playful-toy, retro-futuristic, brutalist-diy, cottagecore-botanical

→ Style Atlas pick wybrał **apothecary-label** z compatible listy ✅ (zgodność CONVERSION LOCK).

### 11.7 Section sequence (Authority modyfikuje 14)

1. Header
2. Hero (Authority-first: h1 z ekspertem lub liczbą badań)
3. **AUTHORITY ROSTER** (NOWA — `.authority-roster`) — 3-5 ekspertów (groomer, zoopsycholog, weterynarz, producent filtrów, dermatolog weterynaryjny)
4. Trust Bar — w apothecary jako sec-meta strip (zamiast dark trust bar)
5. **EVIDENCE / RESEARCH** (NOWA — `.research-evidence`) — badania akustyczne, testy efektywności, certyfikat HEPA, n=X
6. Features bento → w apothecary jako spec-rows F3 (mechanism-of-action: jak działa naukowo)
7. How It Works (3 kroki, z odniesieniem do protokołu)
8. Testimonials (z weryfikacją „verified by veterinarian" + Trustpilot)
9. FAQ (pytania medyczne/techniczne, odpowiedzi z odniesieniem do badań)
10. Offer (medical framing: „30 dni protokołu" + price)
11. Final CTA („Zacznij protokół" — medical framing)
12. Footer (linki do badań, certyfikatów)

### 11.8 Hero formulation (Authority template)

```
Pre-headline: „REKOMENDOWANE PRZEZ WETERYNARZY" lub „CLINICAL-GRADE GROOMING"
H1: „99% sierści zebranej u źródła. Cisza poniżej 65 dB. HEPA 3 — protokół zatwierdzony przez weterynarzy."
Sub: „Dr [NAZWISKO], weterynarz behawiorysta: '[krótki cytat 5-8 słów o psach lękowych]'"
CTA: „Zobacz protokół — XXX zł"
Secondary signal: liczba badań + nazwa instytucji + rating
```

### 11.9 Offer formulation (Authority — medical framing)

- Stara cena (przekreślona) z framem „cena groomera za sezon"
- Nowa cena — duża IBM Plex Sans 700 (apothecary spec-label aesthetic)
- Savings badge: „[X]× tańszy niż sezon u groomera"
- Guarantee — MEDICAL framing: „30 dni protokołu pielęgnacji. Brak efektu spokoju u psa? Zwracamy 100%." / „Gwarancja zwrotu po pierwszym pełnym cyklu pielęgnacyjnym."
- Trust strip: rekomendowane przez [N] weterynarzy behawiorystów / protokół kliniczny (akustyczny + dermatologiczny) / 2 lata gwarancji producenta / polska obsługa serwisowa
- Payment: BLIK / Karta / Przelew (zakazane: COD, raty, PayPo, Klarna)
