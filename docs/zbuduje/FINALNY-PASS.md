# FINALNY-PASS — pixel-perfect przegląd detali (F7.3, „sprawdzenie na koniec wszystkiego")

**Status: OBOWIĄZUJE (2026-07-16, research Sonnet: impeccable/design-auditor/UICrit/Polypane
+ żądanie Tomka po incydencie oferty Uśmieszka).** Uruchamiany DOPIERO gdy SSIM-dopasowanie
i ogólny krytyk są zielone (polerowanie niedokończonego = strata). Pętla do wyczerpania:
powtarzaj passy aż runda wróci CZYSTA.

## METODYKA — 4 PASSY KASKADOWO (osobny pass = osobna intencja; warstwa-po-warstwie
bije „oceń wszystko naraz")

**PASS 0 — DESIGN-LINTER (skrypt, deterministyczny; python+CDP `getComputedStyle` +
`getBoundingClientRect`):** spacing poza skalą 4/8 · kolaps/podwójne marginesy styków
sekcji · padding kart tego samego typu identyczny · liczba fontów ≤2-3, rozmiary ze skali,
„prawie takie same" (17 vs 18px) · Delta-E clustering prawie-identycznych akcentów ·
kontrast WCAG (tekst + najgorszy piksel tła pod tekstem) · focus-ring nie usunięty ·
touch-target ≥44px · aspect-ratio naturalne vs box (stretch/squish), upscaling
(naturalWidth < renderWidth) · CLS/sticky zasłaniające · placeholdery/TODO/{{}}/lorem ·
zakazane frazy, podwójne spacje, format cen · polskie cudzysłowy „ ".

**PASS 1 — VISION WARSTWOWY na crop'ach hi-res per sekcja** (osobny prompt PER WARSTWA:
typografia → obrazy → spacing; thumbnail dla kontekstu + crop dla detalu):
- typografia: wdowy/sieroty · brzydkie łamania (przyimek na końcu → &nbsp;) · optyczne
  wyrównanie ikon do baseline · hierarchia (H1>H2>body wyraźnie) · tracking wersalików;
- obrazy: pełna lista z `OBRAZY-ROLE.md` (kadrowanie, światło, spójność obróbki, miks
  ikon, obraz-na-obrazie, realizm cutoutów);
- spacing: rytm sekcji · oddech CTA · grupowanie przez proximity · symetria gutterów.

**PASS 2 — SQUINT/BLUR (skrypt robi input, vision ocenia):** gaussian-blur screenshotu
+ wariant „placeholdified" (bloki koloru zamiast tekstu/obrazów). Pytania: gdzie fokus?
czy TŁO PRZEBIJA na produkt (kolizja warstw)? czy drugorzędne dominuje? czy CTA czytelne
bez detali? — łapie dokładnie to, co SSIM przepuszcza.

**PASS 3 — PROWENIENCJA ASSETÓW (skrypt):** hash/`src` wszystkich obrazów per sekcja →
**ten sam asset w dwóch rolach = FLAGA** (dokładnie „zdjęcie z opinii w karcie oferty") ·
zgodność klasy (P/U/S/R z mapy assetów) z allowlistą slotu (OBRAZY-ROLE) · brakujące alt ·
obrazy-placeholdery.

**PASS 4 — DETALE OSADZENIA (skrypt + hit-test per viewport; kalibracja po Latarku 17.07).**
Cztery klasy uszczelnień, wszystkie w `detail-lint.py`:
- **ODSTĘPY BLOKÓW:** sąsiadujące bloki interaktywne/wizualne (CTA · pay-badges · pill · form ·
  figure) w tym samym kontenerze — pionowy gap <8px bez wspólnej intencji grupującej =
  „przyklejone" P1; 8-12px = ciasno P2. Twardy przypadek: `.pay-badges` tuż pod `.btn`.
- **CROP/ROZDZIELCZOŚĆ W KAFLACH:** `img object-fit:cover` w kaflu o stałym AR — crop =
  1−min(imgAR,boxAR)/max(imgAR,boxAR); >25% = P1 (podmień AR kafla albo obraz o AR≈box).
  Upscaling przy DPR2: (render·2)/natural >1.3× = P2, >1.6× = P1.
- **DOPASOWANIE OBRAZ↔BOKS PER VIEWPORT (`img-fit.py`, render CDP 390+1280).** Statyczny crop-lint
  liczy AR z deklaracji, ale NIE widzi `@media` nadpisań aspektu boksa — dlatego łapać to trzeba
  na RENDERZE per viewport (incydent Drapek 18.07: benefit/porownanie/oferta/demo ucinane 20-64%
  TYLKO na mobile, bo `@media` odwracał aspect-ratio boksa vs obraz; desktop 0%). Dla KAŻDEGO `<img>`
  mierzy natywny AR vs AR realnego boksa → % ucięcia + oś (poziom/pion) + `object-position`.
  **Ucięcie ≥40% przy pos DOMYŚLNYM (`50% 50%`) = FAIL** — niedopatrzenie: dopasuj `aspect-ratio`
  boksa do obrazu (portret↔portret, kwadrat↔kwadrat). **Gdy ucięcie nieuniknione** (scena-tło
  full-bleed) — `object-position` MUSI wskazać część z produktem/psem/twarzą, nie center; ustawiony
  pos + duże ucięcie = WARN (zweryfikuj crop wizualnie, zwykle OK). Zasada: aspekt boksa ≈ aspekt
  obrazu; jeśli MUSI być ucięte — steruj którą część pokazać, nigdy center „na ślepo".
- **INTERAKCJE PER VIEWPORT (rozszerzenie F6b):** każdy widget sterujący na 1280 I 390 —
  (a) `elementFromPoint(center)` == kontrolka/potomek (inaczej P0 zasłonięte), (b)
  `pointer-events≠none` (inaczej P0), (c) driven-property (styl obliczony LUB custom-prop `--t`)
  RÓŻNI się przy min i max — identyczna = P1 „martwa interakcja". PROBE uruchamia drugi
  viewport 390 (druga instancja Chrome).
- **OVERLAY-CAPTION NA OBRAZIE (label/tytuł absolutny na scenie — TOR-I `demo-cap`, badge na kaflu,
  chip na hero):** na mobile obraz jest MAŁY, a overlay z pełnym tekstem (tytuł+opis) + przyciemnienie
  zasłania scenę — „nic nie widać" (incydent Drapek `demo-cap` 18.07). Render 390: jeśli overlay
  (caption/shade) zajmuje **>~30% wysokości obrazu** LUB jego treść jest **ZDUPLIKOWANA** w
  kontrolkach/kafelkach pod obrazem → **ukryj overlay na mobile** (`display:none` w `@media`), obraz
  pełny; aktywny stan czyta się z podświetlenia kontrolek. Overlay zostaje tylko na desktopie (duży
  obraz). Overlay zasłaniający scenę produktową na mobile = **P1**.
- **PAY-BADGES KANON:** `paybadges_guard` — pigułki płatności tylko z SSOT
  `assets/pay-badges.html`; tekstowe imitacje marek (poza `.pay-badges`) = P1 pojedynczy /
  P0 klaster (≥2 chipy w kontenerze) / P2 brak kanonu przy CTA; `--fix` = auto-swap klastra
  na blok SSOT (innerHTML kontenera → kanon; wrapper layoutu zachowany; re-run detektora).
- **SCRIM = PLATEAU (`check_scrim_plateau`, kalibracja masażer 19.07 — most makieta→kod,
  `STANDARD-LANDING-SKLEPY.md §F3.1b`):** sekcje scenowe desktop (@1280) z full-bleed sceną +
  blokiem treści nad nią. Pomiar EFEKTU pikselowo (nie implementacji scrimu): eager-load scen →
  ukryj dzieci bloku (tło bloku + scrim + scena zostają) → screenshot bboxu bloku (captureBeyondViewport,
  DPR1) → **RAMP = dE między średnim kolorem lewego a prawego pasa bloku (15% szer.)**. Plateau
  (solidny `--paper` LUB dowolny jednolity panel do krawędzi bloku) = pole płaskie, ramp≈0; miękki
  fade = scena prześwituje pod prawą krawędzią tekstu, ramp>1.5 = **P1**. Ramp jest odporny na
  panel w innym jednolitym kolorze niż `--paper` (lewy=prawy → ramp≈0, brak false-positive) — łapie
  tylko realny poziomy fade. Zmierzone: masażer HEAD ramp {0.1/0/0/0} vs defekt 90712e46 {6.8/2.4/18.4/7.7};
  Drapek problem ramp 39.6 = realny prześwit POC (framuga+podłoga pod tekstem).
- **FADE-LINE = KADR SCENY W PASIE (`check_fade_line`, kalibracja masażer 20.07 — most makieta→kod,
  `STANDARD-LANDING-SKLEPY.md §2` „KADR SCENY = BOHATER + LINIA FADE"):** pasy scenowe MOBILE (@390) —
  sceny 1024×1536 z foto w połowie kadru + wbudowaną linią fade do `--paper`. Gdy `object-position` ślepe
  (`center` / wcięte w górę), linia fade wypada za wysoko → **MARTWY PAS jednolitego --paper w boksie**, a
  karta/treść wisi pod pustką (hero/problem/final mobile — trzeci incydent klasy po Drapku i ster-hero).
  Pomiar EFEKTU pikselowo (nie implementacji): detekcja pasa scenowego (full-bleed ≥85% szer., `object-fit:cover`,
  host = BAND 25-80% wys. sekcji z treścią PONIŻEJ) → screenshot boksu (captureBeyondViewport, DPR1) →
  **najdłuższy CIĄGŁY pas wierszy „płaski krem" (dist do --paper <20 I horiz-std <8) jako frakcja wys. boksa**.
  Metryka jest odporna na nachodzenie karty ujemnym marginesem (karta zasłania dół → pas kremu w środku/górze,
  więc liczymy najdłuższy run GDZIEKOLWIEK, nie od dołu). **Martwy pas ≥25% = P1** (defekt A — pewny).
  Dodatkowo heurystyka „bohater przy górnej krawędzi" (top-tekstura wysoka + kontekst złego kadru) = **P2**
  (defekt B — top-cut pikselowo zawodny sam w sobie: naprawiony hero też ma top-teksturę, więc B bramkowany
  obecnością martwego pasa ≥18%, potwierdzać zrzutem). Zmierzone dead%: masażer HEAD (naprawiony center-top/88%)
  {hero 0, problem 13, cta 6, final 5, bezk 5} (max 13) vs DEFEKT d48a8f24 (ślepe center 30%/18%)
  {hero 31, problem 71, bezk 35, final 35} → próg 25% = ~12pp marginesu po obu stronach; Drapek 0 P1 (max 8%).
  Komplementarny do scrim_plateau (desktop) i img-fit (% ucięcia, ale NIE mówi CO ucięte — %≠oczy, §2).

**PASS 5 — SEMANTYKA (vision krzyżowy; OBOWIĄZKOWY po incydencie Odpalaka 17.07: audyt
live znalazł błędy WYŁĄCZNIE znaczeniowe, których SSIM/linty fizycznie nie widzą — podpisy
galerii przesunięte względem zdjęć, rendery udające zdjęcia klientów w opiniach, SREBRNE
urządzenie z UGC obok naszego CZARNEGO, „20000-30000 mAh" z zakresu wariantów, „diesle
do 10 L").** Agent OGLĄDA stronę i odpowiada na PYTANIA KRZYŻOWE — każde z werdyktem
per wystąpienie, zapisane do `dopasowanie/SEMANTYKA.md` (gate-check wymaga pliku):
1. **PODPIS↔OBRAZ:** czy KAŻDY podpis/etykieta/alt przy obrazie opisuje to, co REALNIE
   widać na tym obrazie? (galeria, opinie, demo, kafle) — czytaj parami, nie osobno.
2. **TOŻSAMOŚĆ PRODUKTU cross-section:** czy na WSZYSTKICH ujęciach (sceny, galeria,
   opinie, wideo-postery, packshot) jest TEN SAM produkt (kolor/model/kształt wg
   PASZPORTU)? Inny egzemplarz/kolor z UGC = wymiana kadru albo usunięcie.
3. **AUTENTYCZNOŚĆ:** czy żaden render/scena S nie udaje zdjęcia klienta (klasa U)?
   Sekcja opinii = TYLKO realne kadry, dopasowane do TREŚCI opinii; brak pasującego =
   opinia bez zdjęcia.
4. **REALNOŚĆ DANYCH NA OBRAZACH:** LCD/wyświetlacze pokazują sensowne odczyty (nie
   all-segments „1888" w scenach generowanych); liczby w copy = KONKRET kupowanego
   wariantu (zakres z aukcji ≠ kotwica!), wartości fizycznie realne (sanity: pojemność
   silnika, temperatury, czasy).
5. **OBIETNICE SEKCJI:** nagłówki nie obiecują więcej niż treść (np. „nagrania naszych
   klientów" przy obcym UGC = kłamstwo; „realne zdjęcia" przy renderach = kłamstwo).
6. **ROLA NARRACYJNA / EMOCJA↔PRODUKT (Drapek 18.07):** czy nasz produkt pojawia się
   WYŁĄCZNIE w kontekście pozytywnym / rozwiązania (hero, rozwiązanie/USP, demo, efekt/po,
   oferta, final)? Przejrzyj sekcje z negatywną emocją (problem/„przed", porównanie ze
   starym sposobem, ból) — **czy KTÓRAKOLWIEK łączy NASZ produkt z negatywną emocją
   (strach/stres/walka/opór/odrzucenie/ból)? = FAIL** (oko czyta „nasz produkt = źródło
   problemu", niezależnie od copy). Scena PROBLEM/„przed" MUSI pokazywać stary sposób
   (obcinaczki/gilotynka + opór psa) / frustrację / sam problem — BEZ naszego produktu w
   kadrze. Negatywna emocja dozwolona TYLKO przy starym sposobie lub samym problemie.
7. **PROPORCJE / PROFIL PRODUKTU (Drapek 18.07):** czy bryła produktu — grubość, profil,
   proporcje wymiarów — na KAŻDEJ scenie zgadza się z oryginałem/paszportem? Produkt PŁASKI
   w oryginale (np. cienka deska, krawędź ~2–3 cm) **NIE może być gruby/bryłowaty na scenie**
   (gruby blok/pudełko/klocek); smukły/wysoki nie może być przysadzisty. **= FAIL, gdy
   proporcje/grubość dryfują od oryginału** (uzupełnia F3A — gate cech łapał kolor/elementy,
   NIE proporcje; incydent: cienka deska Drapek wyszła jako gruby drewniany klocek we wszystkich scenach).
Werdykt FAIL któregokolwiek pytania = naprawa + powtórka PASS 5 (pętla do czystej rundy).

**🔗 KOMPLEMENTARNOŚĆ z F3A (GATE WIERNOŚCI DO SKUTKU, `GRAFIKA-Z-MAKIETY.md §4b`).** PASS 5 i F3A
to DWA różne cięcia i oba są wymagane: **F3A działa PER GRAFIKA, PRZED kodem** (trójkąt grafika +
tabela „Cechy dyskryminujące" paszportu + realny kadr Ali × dwie pary oczu — „czy ten render to
TEN produkt, cecha-po-cesze?"; dowód `dopasowanie/WIERNOSC.md`). **PASS 5 działa na CAŁEJ stronie,
PO kodzie** (podpisy↔obraz, tożsamość cross-section, autentyczność, dane, obietnice sekcji). F3A
nie zwalnia z PASS 5, a PASS 5 nie zastępuje F3A — grafika wierna produktowi (F3A) może wciąż
dostać zły podpis/rolę na stronie (PASS 5), a spójna strona może nieść grafikę z dryfem cechy,
którego semantyka całości nie złapie.

## ZASADY
- Porównujemy z REGUŁAMI (ta checklista + OBRAZY-ROLE + zakazy standardu), nie z makietą
  (makieta przeszła na etapie SSIM). Few-shot 2-3 przykłady dobrze/źle w promptach vision.
- Vision generuje NAJPIERW opis problemu, POTEM lokalizację (UICrit: lepsza jakość).
- Skrypt podaje vision twardych kandydatów (np. bbox-overlap) do potwierdzenia —
  redukcja halucynacji.
- Naprawy: drobne = edit kodem GPT (low); strukturalne = rewrite sekcji procedurą
  SEKCJA-Z-MAKIETY. Po naprawach CAŁY pass od nowa (do czystej rundy).

## FORMAT FINDINGU (jednolity)
```json
{"warstwa":"obrazy","lokalizacja":"sekcja 'Zamów' / .offer-card img",
 "problem":"asset z sekcji opinii (hash a1b2) użyty jako packshot oferty",
 "severity":"P0","fix":"podmień na packshot; UGC tylko w opiniach",
 "wykryte_przez":"skrypt"}
```
Severity: P0 = łamie zaufanie/rolę (dropship-tell, UGC w ofercie, kolizja warstw) ·
P1 = wyraźny zgrzyt (kontrast, ucięty produkt, wdowa w H1) · P2 = szlif (tracking,
optyczne wyrównanie). P0/P1 blokują oddanie; P2 naprawiać dopóki tanie.

## CHECKLISTA SKRÓCONA WG CZĘSTOŚCI (pełne wyjaśnienia w researchu 16.07)
1. SPACING/WYRÓWNANIE (10 punktów — największe źródło „surowizny")
2. TYPOGRAFIA (12: wdowy, sieroty, skala, łamania, hierarchia, PL-interpunkcja)
3. KOLOR/KONTRAST (9: WCAG, akcent CTA jedyny, jasne tła, stany)
4. OBRAZY (11: role P/U/S/R, dedup cross-sekcja, kolizje warstw, kadry, światło, ikony)
5. STANY/INTERAKCJE (6: hover/focus/disabled, empty/error, touch, sticky, reduced-motion)
6. TREŚĆ (6: placeholdery, zakazane frazy, ceny/format, ton, duplikaty)
7. OSADZENIE (6: odstępy bloków „przyklejone", crop/upscaling w kaflach, martwa interakcja
   per viewport, pay-badges kanon vs imitacje, scrim=plateau pod blokiem treści §F3.1b,
   fade_line pasów scenowych mobile — martwy pas kremu / zła linia fade §2) — PASS 4,
   pokrywa `detail-lint.py`

## NARZĘDZIA (zbudowane — reużywalne)
- **`scripts/mockup-tools/detail-lint.py <html> [--out f.json] [--fix]`** — PASS 0 + PASS 4
  skryptowo (CDP `getComputedStyle`/`getBoundingClientRect` + PIL na obrazach). **PASS 0:**
  spacing 4/8, near-same fonty, Delta-E akcentów, WCAG (tekst na tle + worst-pixel pod tekstem
  na scenie), focus-ring, touch≥44, aspect/upscaling, **hash-dedup obrazów cross-sekcja**,
  bbox-overlap fotografii, zakazane frazy/placeholdery/podwójne spacje/proste cudzysłowy, sticky
  geometry. **PASS 4:** odstępy bloków (gap<12px różny kind), crop cover >25% + upscaling DPR2,
  interakcja per viewport (hit-test 1280/390 + martwa-property PROBE), pay-badges kanon vs
  imitacje (`--fix` auto-swap klastra na SSOT), **scrim=plateau** (ramp lewy→prawy pas bloku sceny
  >1.5 = scena prześwituje pod tekstem, §F3.1b), **fade_line** (pasy scenowe mobile @390 —
  najdłuższy pas jednolitego --paper ≥25% wys. boksa = martwy pas / zła linia fade, §2 KADR=BOHATER+LINIA FADE = P1).
  **[TODO domknięcia — właściciel detail-lint, SPEC F7]:** (1) detail-lint NIE emituje jeszcze
  **h-scroll** (`scrollWidth-clientWidth==0`) — dziura do dodania (blok `finalny_pass`
  w `gate-manifest.json` już to odnotowuje). (2) Lista zakazanych fraz `bad` trzymana W KODZIE
  detail-lint = **DUPLIKAT** SSOT-u zakazów tekstowych → przepiąć na `gate-manifest.json
  grep_forbidden` (JEDYNE źródło; dwie kopie mogą się rozjechać).
- **`scripts/mockup-tools/capture-lint.py <html> <outdir>`** — full 1280/390, crop'y sekcji
  hi-res, `blur.jpg`+`placeholdified.jpg` do PASS 2 squint.

## WNIOSKI WYKONAWCZE (F8 — konsolidować tematycznie)
- **Kalibracja lintera (z przebiegu Uśmieszek 16.07, 0 P0):**
  - **Gwiazdki dekoracyjne `aria-hidden` NIE podlegają progowi kontrastu TEKSTU WCAG** — info
    niesie sąsiedni tekst („4,9/5 · 76 ocen"). Złoty (#F5A623) fizycznie nie osiągnie 4.5:1
    na bieli bez zejścia w bursztyn kolidujący z CTA → to konwencja, nie zgrzyt. Linter musi
    wykluczać `aria-hidden`/ikony z checku tekstowego (inaczej fałszywe P1).
  - **near-same font-size:** `clamp()` daje kontinuum ułamków → filtrować do INTEGER-tokenów
    (n≥3) i raportować JEDEN wniosek „skala ma N rozmiarów 12–22px", nie 8 par-szumu.
  - **worst-pixel pod tekstem na scenie** liczony jako globalne min-luminance CAŁEJ sceny =
    fałszywy (tekst siedzi w strefie scrim/negative-space, nie nad ciemnym produktem po
    drugiej stronie kadru). Poprawnie: mapować bbox tekstu → region sceny (object-fit:cover),
    do tego czasu traktować jako KANDYDAT vision, nie P1.
  - **Delta-E akcentów:** próg dE<3 (nie <10) — celowe warianty papieru (#F7F3EC/#FBF8F2/
    #F6F1E9, dE≈4.5) to zaplanowana warstwa, nie błąd.
- **Skuteczność passów (dojrzała strona po F7.1/F7.2):** PASS 0 skrypt złapał WSZYSTKIE realne
  findingi (3× kontrast tekstu pomocniczego <4.5, touch 42/31px, sticky bez prześwitu) —
  naprawione tanim CSS. PASS 1/2 vision = potwierdzenie NEGATYWNE (0 nowych P0/P1) + odsiew
  false-positive lintera (hero-text nad sceną czytelny dzięki scrimowi). PASS 3 proweniencja
  (hash-dedup + inspekcja ról) = czysty. **Wniosek: po zielonym F7.1/F7.2 skrypt jest głównym
  źródłem findingów; vision waliduje i odsiewa FP, rzadko generuje nowe** → uzasadnia niski
  budżet vision (ten przebieg: $0 na wf2-gpt — vision przez Read PNG agenta; wf2-gpt rezerwować
  wyłącznie na PRZEBUDOWY sekcji).
- **UGC data-ceiling:** realne zdjęcie kupującego bywa z obcym pudełkiem („WHITENING") — surowa
  autentyczność vs sygnał white-label; NIE fabrykować podmianki. Przy vision-gate F0 preferować
  UGC bez widocznego obcego brandingu GDY jest wybór; inaczej zostawić (limit danych ≠ wina kodu).
- **Typowy zestaw tanich P1/P2 fabryki (do prewencji w F4/F5):** microcopy/caption na `--muted`
  (#8996A0) daje ~3:1 na jasnym tle → default `--body` (#54636E, ~5:1); przyciski CTA 18–18.5px
  bold są TUŻ pod progiem large-text WCAG (18.66px) — dawać ≥19px by obowiązywał próg 3:1;
  sticky-buy fixed wymaga `body{padding-bottom}` na mobile (prześwit stopki); brand/logo link
  potrzebuje `min-height:44px` (tap-target).
