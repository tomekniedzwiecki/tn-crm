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
zgodność klasy (P/U/S z mapy assetów) z allowlistą slotu (OBRAZY-ROLE) · brakujące alt ·
obrazy-placeholdery.

**PASS 4 — DETALE OSADZENIA (skrypt + hit-test per viewport; kalibracja po Latarku 17.07).**
Cztery klasy uszczelnień, wszystkie w `detail-lint.py`:
- **ODSTĘPY BLOKÓW:** sąsiadujące bloki interaktywne/wizualne (CTA · pay-badges · pill · form ·
  figure) w tym samym kontenerze — pionowy gap <8px bez wspólnej intencji grupującej =
  „przyklejone" P1; 8-12px = ciasno P2. Twardy przypadek: `.pay-badges` tuż pod `.btn`.
- **CROP/ROZDZIELCZOŚĆ W KAFLACH:** `img object-fit:cover` w kaflu o stałym AR — crop =
  1−min(imgAR,boxAR)/max(imgAR,boxAR); >25% = P1 (podmień AR kafla albo obraz o AR≈box).
  Upscaling przy DPR2: (render·2)/natural >1.3× = P2, >1.6× = P1.
- **INTERAKCJE PER VIEWPORT (rozszerzenie F6b):** każdy widget sterujący na 1280 I 390 —
  (a) `elementFromPoint(center)` == kontrolka/potomek (inaczej P0 zasłonięte), (b)
  `pointer-events≠none` (inaczej P0), (c) driven-property (styl obliczony LUB custom-prop `--t`)
  RÓŻNI się przy min i max — identyczna = P1 „martwa interakcja". PROBE uruchamia drugi
  viewport 390 (druga instancja Chrome).
- **PAY-BADGES KANON:** `paybadges_guard` — pigułki płatności tylko z SSOT
  `assets/pay-badges.html`; tekstowe imitacje marek (poza `.pay-badges`) = P1 pojedynczy /
  P0 klaster (≥2 chipy w kontenerze) / P2 brak kanonu przy CTA; `--fix` = auto-swap klastra
  na blok SSOT (innerHTML kontenera → kanon; wrapper layoutu zachowany; re-run detektora).

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
4. OBRAZY (11: role P/U/S, dedup cross-sekcja, kolizje warstw, kadry, światło, ikony)
5. STANY/INTERAKCJE (6: hover/focus/disabled, empty/error, touch, sticky, reduced-motion)
6. TREŚĆ (6: placeholdery, zakazane frazy, ceny/format, ton, duplikaty)
7. OSADZENIE (4: odstępy bloków „przyklejone", crop/upscaling w kaflach, martwa interakcja
   per viewport, pay-badges kanon vs imitacje) — PASS 4, pokrywa `detail-lint.py`

## NARZĘDZIA (zbudowane — reużywalne)
- **`scripts/mockup-tools/detail-lint.py <html> [--out f.json] [--fix]`** — PASS 0 + PASS 4
  skryptowo (CDP `getComputedStyle`/`getBoundingClientRect` + PIL na obrazach). **PASS 0:**
  spacing 4/8, near-same fonty, Delta-E akcentów, WCAG (tekst na tle + worst-pixel pod tekstem
  na scenie), focus-ring, touch≥44, aspect/upscaling, **hash-dedup obrazów cross-sekcja**,
  bbox-overlap fotografii, zakazane frazy/placeholdery/podwójne spacje/proste cudzysłowy, sticky
  geometry. **PASS 4:** odstępy bloków (gap<12px różny kind), crop cover >25% + upscaling DPR2,
  interakcja per viewport (hit-test 1280/390 + martwa-property PROBE), pay-badges kanon vs
  imitacje (`--fix` auto-swap klastra na SSOT).
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
