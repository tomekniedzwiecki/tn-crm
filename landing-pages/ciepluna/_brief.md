# Design Brief — Ciepluna

<!-- FemTech — przenośny pas menstruacyjny (termoterapia + masaż wibracyjny). Marka premium wellness dla kobiet 19-35. -->
<!-- Dane: workflow eae62449-b964-48ae-9be0-de162114489d · brand_info + report_pdf "Raport Strategiczny Produktu dla Rafała Hoffa". -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Clinical Warmth** (Atlas) — ciepła apteczna precyzja: autorytet medyczny (termoterapia skuteczna jak ibuprofen) + emocjonalne ciepło self-care.

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): To wyrób medyczny likwidujący realny ból (potrzebny dowód, bo 159 zł vs 65 zł 4FIZJO), ale komunikacja musi być empatyczna i kojąca, nie szpitalna — dokładnie napięcie, które rozwiązuje Clinical Warmth (Aesop/Necessaire/Maude). Marka NIE może kojarzyć się ani z tanim gadżetem z AliExpress, ani z zimnym sprzętem ortopedycznym z apteki (cytat z raportu str. 7).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`.

1. **Necessaire** — technical disclosure jako design: jawne parametry (45/55/65°C, 6 trybów) podane spokojnie, w szeryfowej kolumnie z dużą ilością pustki; godność zamiast krzyku.
2. **Maude** — clean women's wellness: ciepła pudrowo-beżowa paleta, intymny ton, medyczny spokój bez sterylności (nigdy jaskrawej czerwieni „krwi/bólu").
3. **Aesop** — etykieta-jako-design: ciepły off-white papier, typograficzna powściągliwość, przypisy źródłowe `[n]` budujące apteczną uczciwość zamiast superlatyw.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #C67F81 (Pudrowy Róż — CTA, podkreślenia, gauge ciepła)
- **Ink (główny tekst):** #38302C (Ciepła Mokka — body + nagłówki)
- **Paper (tło):** #F8F2E9 (Kremowy Beż — tło wszystkich sekcji, NIE czysta biel)
- **Accent / Gold (opcjonalny):** #F1B179 (Ciepła Brzoskwinia) + #9CAE96 (Zgaszona Szałwia — sekundarny medyczny akcent)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fraunces (400/500/600/700 + italic) + `&display=swap`
- **Body (treść):** Plus Jakarta Sans (400/500/600/700) + `&display=swap`
- **Mono / Caption (opcjonalny):** Caveat (400/700) — handwritten, akcent w 2-3 miejscach max (insert-card „Odetchnij.", podpis); rola label/uppercase = Plus Jakarta Sans 600 letter-spaced

> ⚠️ Polskie „Ł" UPPERCASE: Fraunces ✅ (safety #7). Caveat ✅ (zamiennik Patrick Hand). BRANDING > ATLAS: Clinical Warmth deklaruje Cormorant/Inter/Manrope i zakazuje Fraunces/Caveat — klient zaakceptował Fraunces+Plus Jakarta+Caveat, więc nadpisujemy zakaz przez lock-* (sekcja 10, reguła rolloutu v5.0).

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Awatar 1 „Zabiegana Profesjonalistka" 26-35 (59% pacjentek), biuro/własny biznes, duże miasto, stabilny dochód (chętnie wyda ~180 zł na komfort). Drugorzędnie: Awatar 2 „Świadoma Trendów Studentka" 19-25 (self-care, naturalność).
- **Kluczowy pain point:** ból wymusza rezygnację z życia — odwołane spotkania, zwolnienia, mgła mózgowa od tabletek; nie może położyć się z termoforem w open space.
- **Kluczowa motywacja zakupu:** dyskretna, mobilna ulga bez tabletek — „tajny asystent w biurze", który nie przerywa dnia (zasilanie z powerbanka, niewidoczny pod ubraniem).
- **Cytat brzmiący jak wypowiedź persony:** „Nikt w pracy nie wie, że to mój pierwszy dzień okresu. Ten ultracienki pas uratował moją prezentację."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** `h2vital` — Organic/Natural (wellness). Najbliższy kierunek tematycznie (zdrowie/wellness).
- **Czego unikam (signature elements istniejącego):** NIE kopiuję rounded sans + greens/beiges + botanicznego, „spa-naturalnego" vibe h2vitala. Ciepluna to FemTech-WYRÓB (tech: ciepło+wibracja+powerbank), nie produkt botaniczny — buduję na szeryfie (Fraunces) + karcie wyrobu ze skalą ciepła + przypisach źródłowych, czego h2vital nie ma. Inna temperatura (apteczna precyzja vs naturalny spa) i inny layout (stack editorial z spec-label, nie bento wellness). Brak istniejącego landinga w stylu Clinical Warmth — to świeży kierunek w portfelu.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Necessaire/Maude/Aesop = brand premium wellness/skincare, nie landingi DR)
- [x] Czy odwracając logo nadal zgaduję branżę? (skala ciepła 45/55/65°C + pudrowo-szałwiowa paleta + szeryf = FemTech/ulga, nie da się pomylić z gamingiem czy AGD)
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? (kobieta z bólem menstruacyjnym szukająca dyskretnej ulgi nie pasuje do Rugged/Playful/Retro/Panoramic — to intymne wellness)
- [x] Czy manifest da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (TAK — „ciepło skuteczne jak ibuprofen, dyskretne jak bielizna, kojące jak koc")

## 8. Signature element

**Twój signature element:** **Karta wyrobu „Skala Ciepła" — pionowy warm-gradient gauge z trzema strefami 45° / 55° / 65 °C** (numeracja stref `01–03` w letter-spaced labelu), powracający motyw temperatury jako rdzeń tożsamości. Towarzyszy mu **footnoted claim** — kluczowa liczba/teza z przypisem `[n]` i stopką źródłową (apteczna uczciwość). To jeden element, który zostaje po obejrzeniu: termiczna skala zamiast glow-orbów.

## 9. Warianty sekcji (LIMITED przez allowed_variants w Style Lock)

- **Hero:** H1 Split — copy + CTA lewo, hero-figure (packshot pasa na ciele pod swetrem) prawo
- **Features:** F3 Linear stack (spec-rows `01 · Termoterapia — opis`), JEDYNY dozwolony dla Clinical Warmth
- **Testimonials:** T2 Before/After / evidence-style (historie transformacji: „przed = tabletki + łóżko / po = spotkanie zarządu")

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `clinical-warmth`
- **Plik:** [`docs/landing/style-atlas/clinical-warmth.md`](../../docs/landing/style-atlas/)

<!-- Maszynowe tokeny lock (v5.0) — FAKTYCZNE fonty/hexy landingu. Paleta + fonty BRANDU (branding > Atlas);
     token wpisany tutaj uchyla zakaz Atlasu na Fraunces/Caveat/paletę. -->
lock-font-display: Fraunces
lock-font-body: Plus Jakarta Sans
lock-font-accent: Caveat
lock-hex: #F8F2E9
lock-hex: #38302C
lock-hex: #C67F81
lock-hex: #9CAE96
lock-hex: #F1B179

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: ritual (kotwice: La Mer face cream, Matcha ceremony — kupowany jako kojący rytuał self-care, nie tylko „naprawa")
- Precision↔Expression: expression (kotwice: Graza, Sezane — charakter/empatia ważniejsze niż surowa dokładność)
- Evidence↔Feeling: feeling (kotwice: La Mer, Byredo — klientka kupuje powrót do normalności; dowód = wsparcie, nie sedno)
- Solo↔Community: solo (kotwice: Skincare serum, Meditation app — intymna, prywatna ulga)
- Quiet↔Loud: quiet (kotwice: Aesop apothecary, Japanese tea — kojące, szept, zero jaskrawości)
- Tradition↔Future: present (kotwice: nowoczesny FemTech startup, kosmetyk wellness — współczesny, nie heritage, nie sci-fi)
- Intimate↔Public: intimate (kotwice: Skincare routine, Sleep tracker — noszony pod ubraniem, temat tabu)

Match z wybranym stylem: 5/7 (różni się Evidence/Feeling i Precision/Expression). Argumentacja (1 zdanie): Clinical Warmth to JEDYNY styl Atlasu wprost zaprojektowany dla „Femtech / fizjoterapia D2C" + „wyrób medyczny likwidujący ból, intimate", a jego refs (Aesop/Necessaire/B&O/Maude) = dokładnie aspiracyjne referencje marki z brand_info — feeling-led copy realizujemy w warm-direct voice tego stylu, dowód medyczny daje przewagę nad tanią konkurencją.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: Fraunces w font-family (branding override Cormorant Garamond)
- Font body: Plus Jakarta Sans (branding override Inter)
- Paleta (min 3 z 5): #F8F2E9 (paper), #38302C (ink), #C67F81 (primary), #9CAE96 + #F1B179 (warm accents)
- Layout DNA: stack editorial — pionowe sekcje, kolumna tekstu max 780px, border-radius mały (4-8px), ZERO bento 2×2
- Signature primitive #1 obecny: anatomiczna spec-label „karta wyrobu" w ramce 2px ink (Skala Ciepła)
- Sec-meta strip ZAMIAST dark trust-bar (MARKA · PARAMETR · ŹRÓDŁO, uppercase letter-spaced)
- Features = F3 spec-rows (`01 · Nazwa — opis`, border-bottom 1px), NIE bento
- Footnoted claims: kluczowe liczby z przypisem `[n]` + stopka źródłowa
- Padding sekcji ≥ 100px desktop / 80px mobile (empty-space as design)
- Min 1 `<table>` (Comparison) + ciepły papier `#F8F2E9` jako tło (NIE #FFFFFF poza headerem)

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE Cormorant (zastąpiony Fraunces przez branding), NIE IBM Plex, NIE Archivo Black, NIE Fredoka, NIE Nunito; (Fraunces/Caveat dozwolone przez lock-* — branding > Atlas)
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz), NIE Bento 2×2
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic w tle), NIE dark `.trust-strip` z icon-circles, NIE Social Proof Marquee
- **Kolory:** NIE czysta biel `#FFFFFF` jako tło sekcji, NIE `linear-gradient` w tłach sekcji, NIE jaskrawa czerwień (kojarzy się z krwią/bólem — raport str. 7), NIE złoto bright `#C9A961`
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 12): `.header` (solid #FFFFFF) · `.mobile-menu` · `.hero` (H1 split) · `.sec-meta` · `.problem` (agitacja PAS) · `.spec-label` (Skala Ciepła, sygnaturowa) · `.how-it-works` (3 kroki) · `.comparison` (table, NIE cards ✓/✗) · `.testimonials` (T2) · `.faq` (5-7) · `.offer` (price anchor + trust) · `.final-cta` (solid brand, NIE gradient) · `<footer>` z footnotes · `.sticky-cta` (mobile). Opcjonalnie: `.personas` (2 segmenty).
Forbidden: Trust Bar dark (icon-circles), Social Proof Marquee, Bento 2×2.

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-counter]
js_effects_forbidden: [.js-split, .js-parallax, .magnetic, .js-tilt]
js_effects_count: { counter_min: 1, counter_max: 3, magnetic_min: 0, tilt_min: 0, parallax_min: 0 }
```


## 11. Wow Moments (audyt z ETAP 4)

### Wow Moment 1
- **Strefa:** hero zone
- **Lokalizacja:** sekcja Hero
- **Element:** koncentryczne ciepłe fale (`warmpulse`) pulsujące zza packshotu pasa — wizualizują promieniujące ciepło 45–65°C, plus italic-em akcent na „nie kolejną tabletką" w headline (Fraunces italic, kolor pudrowy róż)
- **Czemu unique:** termiczna pulsacja jako sygnatura produktu grzejącego — Aesop/Necessaire nie animują ciepła; to nie generyczny glow-orb, tylko ruch przypisany do funkcji
- pattern-id: warm-pulse-rings
- selector: .hero-pulse
- **Implementation status:** ✅ obecny w HTML

### Wow Moment 2
- **Strefa:** mid zone
- **Lokalizacja:** sekcja Spec-label „Skala Ciepła" (na ciemnym tle, signature)
- **Element:** pionowy warm-gradient gauge (czerwień→brzoskwinia→szałwia) z trzema ponumerowanymi strefami 45/55/65 °C jako „karta wyrobu" w ramce 2px
- **Czemu unique:** termometryczna skala = jednoznaczny, zapadający w pamięć motyw temperatury; żaden konkurencyjny pas menstruacyjny nie wizualizuje stopni ciepła jako gauge
- pattern-id: heat-scale-gauge
- selector: .gauge-bar
- **Implementation status:** ✅ obecny w HTML

### Wow Moment 3
- **Strefa:** conversion zone
- **Lokalizacja:** sekcja Final CTA
- **Element:** odręczny akcent „Odetchnij." w Caveat (brzoskwiniowy) nad nagłówkiem zamykającym — ludzki, intymny gest marki-sojusznika tuż przed CTA
- **Czemu unique:** handwritten signature wprowadza ciepło osobistego listu w moment decyzji; kontrast z szeryfowym autorytetem reszty strony
- pattern-id: handwritten-accent
- selector: .accent-line
- **Implementation status:** ✅ obecny w HTML

## 12. Mapa obiekcji (v5.0, OBOWIĄZKOWA)

- „To kolejny gadżet z Allegro, który nie działa" → sekcja: spec-label/how-it-works → rozbrojenie: pokaż mechanizm (ciepło = wazodylatacja, skuteczność porównywalna z ibuprofenem [badania]) + przypis źródłowy zamiast superlatywu
- „Drogie — 4FIZJO kosztuje 65 zł" → sekcja: comparison → rozbrojenie: tabela pokazuje, że to klasa Beurera (229-369 zł) za ułamek ceny, z mobilnością której tańsze nie mają (przepisanie wiersza tabeli, 0 nowych liczb)
- „Boję się, że będzie widać pod ubraniem / w pracy" → sekcja: hero + how-it-works → rozbrojenie: przepisz zdanie o grubości ~1,5 cm i wadze <100 g na „znika pod swetrem i eleganckimi spodniami"
- „Czy ciepło 65°C nie poparzy / czy to bezpieczne dla skóry" → sekcja: faq → rozbrojenie: trzy regulowane stopnie + oddychająca tkanina Lycra; włącz i zapomnij, że go nosisz
- „A jeśli nie pomoże akurat mnie?" (produkt-specyficzna: zmęczenie materiału — leki przestały działać) → sekcja: offer/risk-reversal → rozbrojenie: 30 dni na zwrot — przetestuj w trakcie najbliższej miesiączki, jeśli nie poczujesz ulgi, oddajemy pieniądze

## 13. Big Idea + VOC + Liczby kanoniczne (v5.0, OBOWIĄZKOWE)

### 13.1 Big Idea (Krok 1.7)
big-idea: Wyłącz ból menstruacyjny ciepłem skutecznym jak tabletka — dyskretnie, bez obciążania żołądka, gdziekolwiek jesteś.
mechanism: Termoterapia 45-65°C wywołuje wazodylatację (dotlenia niedokrwioną macicę, rozluźnia skurcze) + 6-stopniowy masaż wibracyjny blokuje sygnał bólu wg teorii bramki bólowej; zasilanie z powerbanka = pełna mobilność (spec produktu, raport str. 1, 4-5).
awareness: solution-aware

### 13.2 Język klienta — VOC (Krok 1.6)
<!-- Frazy z opinii zaadaptowanych w raporcie str. 9 (cite [1] = listing AliExpress 1005007016165705) + język pain z report_pdf. Twardy filtr: bez fraz o dostawie/sprzedawcy. -->
- benefit: „mogę zabrać go do pracy i ustawić temperaturę, żeby znacznie złagodzić skurcze"
- benefit: „można go nosić pod swetrem dyskretnie"
- benefit: „szybko się nagrzewa, idealnie łagodzi spazmy i ból przy mojej endometriozie"
- pain: „połykam kolejną tabletkę w biurowej toalecie"
- pain: „taka kobieca uroda — i każą mi się wziąć w garść"
- pain: „odwołuję spotkania i biorę zwolnienie, bo nie mogę się ruszyć"
- obiekcja: „termofor z wodą jest ciężki i przygniata obolały brzuch"

### 13.3 Liczby kanoniczne
| wartość | jednostka | źródło |
|---------|-----------|--------|
| 159 | zł (cena podstawowa, sam pas) | raport str. 10 (Opcja 1 Basic) |
| 80 | zł (powerbank dedykowany osobno) | wycena składowej zestawu |
| 239 | zł (cena katalogowa: pas 159 + powerbank 80) | suma składowych (anchor) |
| 199 | zł (zestaw z powerbankiem) | raport str. 10 (Opcja 2 Best Seller) |
| 40 | zł (oszczędność w zestawie: 239−199) | matematyka oferty |
| 60 | sekund (czas do ulgi) | raport str. 8 (rekomendowany headline) |
| 45 / 55 / 65 | °C (3 stopnie ciepła) | raport str. 1 (spec) |
| 6 | trybów masażu wibracyjnego | raport str. 1 / str. 9 |
| 1,5 | cm (grubość) | raport str. 1 |
| 100 | g (waga poniżej) | raport str. 1 |
| 30 | dni gwarancji zwrotu | raport str. 9 (risk reversal) |
| 14 | dni (zwrot ustawowy) | prawo konsumenckie |
| 4,8 | /5 rating | pasmo 4,6-4,8 (illustracyjny demo) + disclaimer stopka |
| 300 | opinii (ponad) | raport str. 8 (trust signal) |
| 65-95 / 229-369 | zł (4FIZJO / Beurer) | raport str. 2-3 (comparison) |
