# Wyspanka — Design Manifesto & Brief

> Produkt: profilowana poduszka z pianki termoelastycznej (memory foam). Tagline: „Obudź się wreszcie wyspany". Workflow: cfe0e335-f9bd-4dc7-a171-d39bc82826f6.
> ⚠️ **OGRANICZENIE PRAWNE (z raportu str. 10-11):** produkt NIE jest zarejestrowanym wyrobem medycznym → w świetle prawa „wyrób tekstylno-użytkowy". **ZAKAZ słów:** „medyczny", „ortopedyczny" (jako wyrób med.), „leczy", „rehabilitacja", „certyfikowany do leczenia", diagnozowanie/leczenie chorób. **Dozwolone:** „wspomaga komfort", „redukuje uczucie napięcia", „profilowana konstrukcja", „ergonomiczne wsparcie relaksu", „wygodna pozycja".

## 1. Kierunek manifesta — Clinical Warmth — Anatomia spokojnego snu

- [x] **Clinical Warmth** (adaptacja z fontami klienta) — ciepła apteczna precyzja: szeryfowo-geometryczna elegancja + ciepły lniany papier + jeden ciepły akcent glinki. Evidence (zaufanie do konstrukcji) i jednocześnie spokój regeneracji.
- [ ] inny

**Argumentacja Style Pick:** marka sama opisuje swój ton jako „nowoczesność i kliniczna czystość z nutą ciepła" (raport str. 6) — to dosłownie DNA stylu Clinical Warmth (refs: Aesop, Maude, Bang & Olufsen). Paleta marki (lniany papier #F5F1EA + nocny granat #1E3D59 + ciepła glinka #D9A689) mapuje się 1:1 na 60/30/10 tego stylu.

**LRU:** Top-1 `clinical-warmth` użyty w 1 z 2 ostatnich landingów (ciepluna), NIE w obu (vapoflow = apothecary-label) → override LRU NIE wymagany. Różnicowanie vs ciepluna przez własną paletę navy/sage/glinka + fonty Sora/Inter/Fraunces (branding > Atlas) + sygnaturę „4 strefy".

## Tempo
**ciche** — spokój regeneracji. Duże padding sekcji (≥120px), powolne fade-in, gęstość tekstu niska. Sen = cisza, nie energia.

## Typografia
> **Branding > Atlas** (klient zaakceptował fonty). Clinical Warmth natywnie chce Cormorant+Manrope — nadpisane fontami marki (precedens: vapoflow). Patrz STYLE LOCK sekcja 10.

- Display/heading: **Sora** 500/600/700 — geometryczny grotesk = precyzja konstrukcji, kliniczny spokój; poprawne polskie „Ł" w uppercase
- Body: **Inter** 400/500/600 — neutralny, czytelny w spec-rows 15-17px (natywny też dla Clinical Warmth)
- Accent: **Fraunces** 400/500 (+ italic) — szeryf na „nutę ciepła": big-statement separatory + `<em>` w hero; użyty w 3 miejscach max
- Label/mono-rola: **Sora** uppercase letter-spaced (.14em) — sec-meta, jednostki, numeracja stref `01-04`

## Paleta 60/30/10
| Rola | Nazwa (workflow_branding) | Hex | Gdzie |
|------|---------|-----|-------|
| Dominant 60% | Lniana Biel (ciepły papier) | `#F5F1EA` | tło wszystkich sekcji (NIE czysta biel poza headerem) |
| Secondary 30% | Grafitowa Noc (ink) | `#2A2E35` | body text, headings |
| Accent 10% | Nocny Granat (brand primary) | `#1E3D59` | CTA, akcenty, `<em>` highlight, final-cta solid |
| Support 1 | Szałwiowa Mięta | `#8FB9AE` | sec-meta, karty, dividery, spokojny medyczny akcent |
| Support 2 (ciepły) | Ciepła Glinka | `#D9A689` | 1 ciepła akcenta per sekcja (numeracja, podkreślenie, gwiazdki) |
| Neutral | Chłodny Kamień | `#9AA3A8` | tekst drugorzędny, footnotes |

**Filozofia:** ciepły monochrome papier + granat (noc/uspokojenie) + glinka (ciepło). Zero czerwieni/neonów (raport: „obniżają postrzeganą wartość"). Cień zamiast glow. Zero gradientów w tłach sekcji.

## 2. Moodboard — 3 realne marki (spoza landing-pages/)

1. **Aesop** — etykieta-jako-design, ciepły off-white papier, typograficzna powściągliwość, jawne parametry bez krzyku. Biorę: spec-label „karta wyrobu" w ramce + apteczna uczciwość footnote.
2. **Bang & Olufsen** — precyzja i cisza premium, pojedynczy akcent. Biorę: ogromny whitespace + jeden ciepły akcent (glinka) zamiast palety kolorów.
3. **Maude (sleep/wellness)** — clean wellness, ciepła paleta, spokój bez sterylności. Biorę: ciepły papier jako tło + miękka, ludzka mikro-typografia stref.

## 3. Paleta
(jak wyżej — 6 kolorów z workflow_branding, wszystkie HEX wypełnione: #F5F1EA / #2A2E35 / #1E3D59 / #8FB9AE / #D9A689 / #9AA3A8)

## 4. Typografia
(jak wyżej — Sora heading / Inter body / Fraunces accent; Google Fonts BEZ subset=latin-ext)

## 5. Persona główna (z report_pdf)
**Anna — 35-50 lat, pracująca profesjonalistka, większe miasto.** Praca biurowa/zdalna, „tech-neck" od pochylania nad ekranem. Perfekcjonistka, wieczorem analizuje miniony dzień → długo zasypia. Rano: zesztywniały kark, tępy napięciowy ból potylicy, kawa „żeby w ogóle ruszyć". Testowała tanie nakładki i jednorazowe masaże — bez efektu.
- **Pain:** sztywny kark rano, mrowienie/drętwienie dłoni (spanie na boku), poranne zmęczenie, przegrzewanie głowy, chrapanie.
- **Motywacja:** „life-hacking" — jeden pasywny produkt zamiast godzin rehabilitacji; budzić się z energią.
- **Główna obiekcja:** cynizm wobec obietnic marketingowych + obawa, że trzeba zmienić ulubioną pozycję snu (boczna).
- **Persona wtórna:** Tomasz 60+ (lub jego dorosłe dzieci kupujące w prezencie) — strukturalne dolegliwości, chrapanie; potrzebuje transparentności, dowodu społecznego, pewności zwrotu.

## 6. Anty-referencje (co JUŻ JEST w landing-pages/, czego NIE powtarzam)
- **ciepluna** (clinical-warmth, ostatni) — NIE powtarzam jej palety ani układu hero; Wyspanka ma własny navy/sage/glinka + sygnaturę „4 strefy" w spec-label (anatomia) zamiast jakiejkolwiek sygnatury ciepluny.
- **paromia** (Editorial/Luxury) — NIE Fraunces jako display + Nº + złoto; Fraunces tylko jako wąski accent na separatory.
- **vitrix** (Panoramic Calm) — NIE Plus Jakarta + paper/navy/teal w tym układzie; własna typografia Sora.
- Anty-konkurent estetyczny: **Derila** (raport str. 2) — agresywne „ostatnia sztuka!", ukryte koszty zwrotu. Wyspanka świadomie przeciwnie: transparentność, polska obsługa, spokojny ton „Wspierającego Eksperta".
- AI-slop do unikania: purple→blue gradient, checkmark ✓/✗ tabele, neon glow orbs, generic bento 2×2, border-left 4px.

## 7. Test anty-generic
- [x] **Unikalność:** manifest NIE pasuje do 5 innych produktów — sygnatura „4 strefy podparcia w karcie wyrobu" + lniany papier + zakaz słów medycznych są specyficzne dla profilowanej poduszki tekstylnej w wąskim korytarzu prawnym.
- [x] **Ryzyko:** szeryfowy Fraunces-italic na ciepłym papierze zamiast bezpiecznego białego SaaS-a; rezygnacja z czerwieni „problemu" (granat zamiast alarmu) — ryzyko mniejszego „pierwszego wow", zysk = spokój premium.
- [x] **Portfolio:** tak — spec-label anatomii + apteczna footnote to case-study-level detal.
- [x] **Konflikt z brandem:** brak — paleta i fonty 1:1 z workflow_branding; ton „kliniczna czystość z nutą ciepła" = dokładnie Clinical Warmth.

## 8. Signature element
**Anatomiczna spec-label „4 STREFY PODPARCIA"** — pełnoszerokościowa karta w ramce 2px granat, z wielką liczbą `04` (js-counter) i tabelarycznymi wpisami `01 · Wgłębienie centralne — głowa w jednej osi`, `02 · Wsparcie krzywizny szyi`, `03 · Wyprofilowanie barku`, `04 · Strefa odciążenia ramion`. Numeracja w Sora uppercase, ciepła glinka. To „rentgen" konstrukcji — klient zapamięta 4 strefy.

## Krok 7 — Mapowanie manifesto → decyzje ETAP 4
| Decyzja | Wartość |
|---|---|
| Hero background | Lniany papier #F5F1EA, subtelny radial sage w prawym górnym rogu (opacity .15), bez gradientu pełnego |
| Hero headline font | Sora 700, kluczowe słowa `<em>` Fraunces italic granat |
| Hero headline styl | regular + 1-2 słowa Fraunces italic em („wyspany", „pierwszej nocy") |
| Signature HTML | `.spec-label` ramka 2px granat, `.spec-count` 04 js-counter, spec-rows 01-04 |
| Dark section rytm | 0 ciemnych sekcji (styl quiet/papier); jedyny solid-color = final-cta granat |
| Animacja hero | subtle fade-in + delikatny radial sage (bez glow orbs, bez parallax) |
| Border-radius globalny | 6px (etykieta, nie playful) |
| Shadow styl | miękki, ciepły: `0 12px 40px rgba(42,46,53,.08)` |
| Divider | cienka linia 1px sage + sec-meta strip uppercase |

## 9. Warianty sekcji (autonomicznie wybrane)

- **Hero:** H1 Split klasyczny — clinical-warmth dopuszcza [H1,H5,H8]; H6 persona (wellness) zakazany w stylu; default H1, premium-spokojny, copy+CTA z ceną lewo + hero-figure prawo (zgodny z przykładem stylu i CRO hero z raportu: nagłówek korzyści + gwiazdki + CTA).
- **Features:** F3 Linear stack — jedyny dozwolony w clinical-warmth; pasuje do 4 stref anatomii z dłuższymi opisami feature→benefit (raport: „Anatomia Sukcesu").
- **Testimonials:** T2 Before/After (evidence-style, jakościowy bez fabrykowanych liczb medycznych) — produkt transformacyjny (przed: sztywny kark/przerywany sen → po: przespana noc); dozwolony w clinical-warmth (T2/T5).
- **Problem:** P2 Mini-narracja poranka — awareness solution-aware + codzienny moment (poranek), agitacja przez scenę „6:40, sztywny kark" zamiast tabeli strat.
- **How:** W3 Spec-strip — clinical-warmth ∈ evidence-cluster.
- **Comparison:** C3 Spec-bar — styl quiet + 1 dominująca metryka (reakcja na ciepło vs sprężynowanie zwykłej gąbki); vs KATEGORIA „zwykła płaska poduszka", nigdy nazwany konkurent.
- **Offer:** O1 Single (kanon H) + opcja „Zestaw dla pary" (2 szt −15%) jako upsell AOV (raport str. 9; persona Tomasz = prezent od dzieci). Produkt NIE zużywalny → O2 multipack guardrail wyklucza, zostaje O1.

## 10. STYLE LOCK (Clinical Warmth — adaptacja fontami klienta)

**Style ID:** `clinical-warmth` (adaptacja z fontami klienta: Sora/Inter/Fraunces zamiast Cormorant/Manrope — branding > Atlas, sekcja 4)

```
lock-style: clinical-warmth
lock-font-display: Sora
lock-font-body: Inter
lock-font-accent: Fraunces
lock-hex: #F5F1EA
lock-hex: #1E3D59
lock-hex: #D9A689
lock-hex: #8FB9AE
lock-hex: #2A2E35
```
> Branding override: Atlas natywnie chce Cormorant+Manrope; klient zaakceptował Sora/Inter/Fraunces → lock fontów nadpisany. Papier #F5F1EA jako tło sekcji (NIE #FFFFFF poza headerem), zero gradientów w tłach.

### 10.3 MUSZĄ być użyte
- Fonty: `Sora` (display) + `Inter` (body) + `Fraunces` (accent) w `font-family`
- Min 1 `<table>` lub `.spec-*-list` (Comparison spec-bar + spec-rows 01-04)
- Padding sekcji ≥ `100px 0`
- Primitive 1 (spec-label „4 strefy") obecny
- Ciepły papier `#F5F1EA` jako tło sekcji (czysta biel TYLKO header)
- Brand primary `#1E3D59` jako akcent; ciepła glinka `#D9A689` 1× per sekcja
- `.fade-in` (subtle) + `.js-counter` min 1 (liczba „04 strefy")
- Footnoted claims `[n]` + stopka źródłowa (apteczna uczciwość)

### 10.4 NIE WOLNO użyć
- **Słowa (PRAWNE!):** „medyczny", „ortopedyczny" jako wyrób med., „leczy", „rehabilitacja", „certyfikowany medycznie", diagnoza/leczenie chorób
- **Słowa (voice):** „premium", „luxury", „innowacyjne", „rewolucyjne", purple prose, AI-poetic
- **Płatności/dostawa:** „24h", „magazyn w Polsce", „za pobraniem"/COD, „raty"/PayPo/Klarna/Twisto
- **Fonty:** NIE Cormorant (zastąpiony Sora), NIE Fredoka/Nunito-jako-display, NIE dodatkowy 4. font
- **Layout:** NIE bento 2×2 (`grid-template-columns:1fr 1fr` dla features), NIE dark trust-strip z icon-circles (→ sec-meta strip)
- **Kolory:** NIE czysta biel `#FFFFFF` tło sekcji, NIE linear-gradient w tłach sekcji, NIE czerwień/neon dla „problemu"
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`, NIE glow orbs

## 11. Wow Moments (3 — finalizacja w ETAP 4)
1. **Hero:** szeryfowy Fraunces-italic em „wyspany" na ciepłym papierze + spec-stack „4 strefy" (dual-bank) — pierwsze wrażenie spokoju + precyzji.
- selector: hero-spec-stack
2. **Mid (spec-label):** „rentgen" konstrukcji — wielka `04` (counter) + 4 ponumerowane strefy w karcie-wyrobie, glinka akcent.
- selector: spec-label
3. **Conversion (comparison spec-bar):** jedna metryka „reaguje na ciepło ciała" vs „sprężynuje jak zwykła gąbka" — wizualny pasek różnicy zamiast tabeli ✓/✗.
- selector: vs-bar

## 12. Mapa obiekcji (5)
- Cynizm wobec obietnic („kolejny gadżet") → sekcja: Problem/Founder → rozbrojenie: spokojny ton „Wspierającego Eksperta", konkret konstrukcji zamiast superlatyw, footnote źródeł.
- „Będę musiał zmienić ulubioną pozycję snu (boczną)" → sekcja: How/FAQ → rozbrojenie: profil barku + strefa odciążenia ramion działa właśnie dla śpiących na boku, kładziesz się jak zwykle.
- „Pianka zapadnie się pod ciężarem do zera" (persona Tomasz) → sekcja: Features/FAQ → rozbrojenie: termoelastyczna pianka wraca do kształtu po kilkunastu sekundach po wstaniu.
- „Chemiczny zapach / bezpieczeństwo materiału" → sekcja: Trust/FAQ → rozbrojenie: zgodność z REACH (zakaz szkodliwych substancji), oddychająca siatka — bez nazw certyfikatów med.
- Ryzyko zwrotu / „a jak nie zadziała" → sekcja: Offer/Trust → rozbrojenie: 30 nocy na test, zwrot bez pytań, polska obsługa (anty-Derila).

## 13. Big Idea + VOC + Liczby kanoniczne

**Big Idea (maszynowo):**
```
big-idea: Jedna poduszka, która układa się pod ciepłem Twojego ciała i trzyma kark w jednej osi — budzisz się wyspany, nie obolały, śpiąc w swojej ulubionej pozycji.
mechanism: Pianka termoelastyczna reaguje na ciepło ciała (nie tylko nacisk) — „roztapia się" pod karkiem tworząc beznapięciowy odlew, a centralne wgłębienie + wyprofilowanie barku trzymają głowę w osi i odciążają ramię śpiących na boku.
awareness: solution-aware
```

**Język klienta (VOC):**
`VOC: BRAK DANYCH — workflow_products puste (brak source_url do AliExpress), workflow_reviews puste.` Język bólu/benefitu zaczerpnięty z person raportu (NIE z opinii): pain = „sztywny kark rano", „mrowienie/drętwienie dłoni", „kawa żeby w ogóle ruszyć"; benefit = „obudzić się wyspanym", „przespana noc bez wybudzeń".

**Liczby kanoniczne:**

| Wartość | Jednostka / znaczenie | Źródło |
|---|---|---|
| 149 | zł — cena promocyjna | raport str. 2 (okno D2C 139-189 zł) |
| 189 | zł — cena regularna / anchor | raport str. 2 (górna granica okna D2C) |
| 253 | zł — zestaw dla pary 2 szt (−15%) | raport str. 9; 2×149 −15% |
| 4,8 | / 5 — ocena | whitelist pasmo 4,6-4,8 (placeholder; realne wstawi klient) |
| 30 | nocy — test / zwrot | oferta, raport str. 8 |
| 14 | dni — zwrot ustawowy | prawo konsumenckie (whitelist) |
| 4 | strefy podparcia | brand_info + raport str. 2 |
| 3-7 | nocy — czas adaptacji ciała | raport str. 8 (FAQ) |
| 4-5 | kg — waga głowy (czemu zwykła poduszka się zapada) | raport str. 3 |
| 41,4 | % Polaków źle ocenia sen | raport str. 1 |
Reguła: żadnych liczb-sierot poza powyższymi. Liczba opinii NIE jest twardo podawana (brak źródła) — gwiazdki 4,8 + ogólne „prześpane noce" jako placeholder; klient wstawi realny review count.
