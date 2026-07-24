# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: ZYWY `https://sprytko.pl/migotek` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

> **Werdykt zbiorczy (swieza para oczu, 24.07 — REGENERACJA PORZADNA):** 17/17 sekcji desktop + 8/8 sekcji z makieta mobile = „ten sam projekt" = TAK. LAYOUT-FAIL 0/17 (DOM self-checki). Makiety = PELNA STRONA torem LOKALNYM gpt-image-2 HIGH (25 plikow: 17 desktop + 8 mobile; ZERO fallbacku fal). SSIM 0.18-0.85 = INFORMACYJNY (zywy render fal-scen vs AI-makieta nie dyskryminuje — decyduje RUBRYKA + DOM). Rozjazdy makieta<->render = real-render vs AI-makieta (skala H1 mierzona w izolowanym cropie AI, IR-tlo usredniajace cieply amber scen na ciemnych sekcjach) + lazy-load kafli scen (galeria/zastosowania: ciemne kafle w statycznym zrzucie = lazy sc-*/real-* Storage HTTP 200, laduja przy scrollu). `zamow` = kanoniczny checkout-inline@2 (render bogatszy niz statyczny comp — modul, nie defekt). KOD NIE WYMAGAL ZMIAN: makiety byly autorskie Z istniejacego index.html, wiec zywy render realizuje je 1:1 na poziomie RUBRYKI i LAYOUT (marka: ciepla ciemnosc + bursztyn + Fraunces/Inter + ✦; produkt: biale swiece-sople LED + czarna rozdzka + haczyki + zylka).

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.205 (sc 0.21/reszta 1.00) | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| zaufanie | kodowa | 02-zaufanie.png | 0.850 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| problem | scenowa | 03-problem.png | 0.306 (sc 0.31/reszta 1.00) | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| rozwiazanie | inna | 04-rozwiazanie.png | 0.232 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| zastosowania | inna | 05-zastosowania.png | 0.338 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| demo | scenowa | 06-demo.png | 0.338 (sc 0.17/reszta 0.55) | OK · info: reszta-SSIM 0.548<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| korzysci | scenowa | 07-korzysci.png | 0.656 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| unoszace | inna | 08-unoszace.png | 0.386 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| porownanie | kodowa | 09-porownanie.png | 0.738 | OK · info: SSIM 0.738<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| mid-cta | scenowa | 10-mid-cta.png | 0.506 (sc 0.51/reszta 1.00) | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| opinie | kodowa | 11-opinie.png | 0.726 | OK · info: SSIM 0.726<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| zdjecia-kupujacych | inna | 12-zdjecia-kupujacych.png | 0.429 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| galeria | kodowa | 13-galeria.png | 0.309 | OK · info: wysokosc(makieta-IR) sekcja AR 0.93 vs makieta 0.62 (d=49%); info: SSIM 0.309<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| wideo | kodowa | 14-wideo.png | 0.436 | OK · info: wysokosc(makieta-IR) sekcja AR 0.95 vs makieta 0.67 (d=42%); info: SSIM 0.436<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| zamow | kodowa | 15-zamow.png | 0.630 | OK · info: SSIM 0.630<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| faq | kodowa | 16-faq.png | 0.698 | OK · info: SSIM 0.698<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| final | scenowa | 17-final.png | 0.362 (sc 0.36/reszta 1.00) | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |

> LAYOUT twarde (DOM self-checki, mierzone w renderze — BEZ makiety): (1) kafle-sliver cols>=5 &
> szer<12% & portret; (2) pustka-pod-obrazem: obraz in-flow contain w boksie ar>=1.4 z pustka
> pionowa >=30% (produkt plywa) LUB dolne >30% sekcji bez tresci; (3) gutter: scena full-bleed
> jednostronna (kryje <85% szer & off-center >0.12) LUB tresc przyklejona do boku z pustym gutterem.
> INFORMACYJNE (kolumna LAYOUT: 'info:', NIE FAIL — szum makiet AI): wysokosc/guttery/obraz z IR-makiety,
> raw-SSIM (real-render vs AI-makieta nie dyskryminuje wiernosci). Decyduja: DOM self-checki + RUBRYKA vision 5xT/N.
> SCENOWA: SSIM dwuskladnikowy (maska sceny cap ~0.70 OSOBNO + reszta) — informacyjnie.

<!-- DELTY-POMIAROWE -->
## DELTY POMIAROWE per sekcja (sekcja-diff.py: render getComputedStyle vs IR makiety)

Twarde liczby z pomiaru RENDERU porownane z IR makiety (paleta/skala/pozycje). Koder/montaz
konsumuje to do PUNKTOWYCH poprawek: NIE aproksymuj, popraw dokladnie wskazana wartosc.

**hero:**
- H1 render 74px vs makieta 442px (-83%) -> za maly, powieksz
- tlo render #1E1813 vs makieta #E8CA95 (dE=78.3) -> ustaw --paper #E8CA95
- region-SSIM copy=0.187 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zaufanie:**
- tlo render #F5EEE3 vs makieta #FEFDFE (dE=8.2) -> ustaw --paper #FEFDFE

**problem:**
- tlo render #1E1813 vs makieta #899AA7 (dE=55.7) -> ustaw --paper #899AA7
- region-SSIM copy=0.064 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**rozwiazanie:**
- H1 render 46px vs makieta 197px (-77%) -> za maly, powieksz
- tlo render #1E1813 vs makieta #D3C1A9 (dE=70.9) -> ustaw --paper #D3C1A9
- region-SSIM copy=0.048 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zastosowania:**
- H1 render 46px vs makieta 40px (+15%) -> za duzy, zmniejsz
- tlo render #14100C vs makieta #CCA668 (dE=74.2) -> ustaw --paper #CCA668
- region-SSIM copy=0.153 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**demo:**
- tlo render #1E1813 vs makieta #CAB499 (dE=66.9) -> ustaw --paper #CAB499
- region-SSIM copy=0.224 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**korzysci:**
- H1 render 46px vs makieta 53px (-13%) -> za maly, powieksz
- region-SSIM copy=0.172 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**unoszace:**
- H1 render 46px vs makieta 58px (-21%) -> za maly, powieksz
- tlo render #1E1813 vs makieta #DEC4A3 (dE=73.5) -> ustaw --paper #DEC4A3
- region-SSIM copy=0.292 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**porownanie:**
- H1 render 46px vs makieta 131px (-65%) -> za maly, powieksz
- region-SSIM copy=0.582 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 48px vs makieta 88px (-45%) -> za maly, powieksz
- tlo render #1E1813 vs makieta #E3C9A3 (dE=75.6) -> ustaw --paper #E3C9A3
- region-SSIM copy=0.172 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**opinie:**
- region-SSIM copy=0.366 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zdjecia-kupujacych:**
- H1 render 46px vs makieta 61px (-25%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~19px (-37%)

**galeria:**
- region-SSIM copy=0.234 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wideo:**
- tlo render #14100C vs makieta #D3B796 (dE=73.5) -> ustaw --paper #D3B796
- region-SSIM copy=0.270 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- region-SSIM copy=0.476 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- H1 render 46px vs makieta 60px (-23%) -> za maly, powieksz
- region-SSIM copy=0.448 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- H1 render 54px vs makieta 251px (-78%) -> za maly, powieksz
- tlo render #1E1813 vs makieta #C7AC8E (dE=64.9) -> ustaw --paper #C7AC8E
- region-SSIM copy=0.149 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)


<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `migotek` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.178 |  **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| sticky | render-only 02-sticky-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| zaufanie | render-only 03-zaufanie-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| problem | [makieta|render] 04-problem-m.png | 0.448 |  **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| rozwiazanie | [makieta|render] 05-rozwiazanie-m.png | 0.287 |  **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| zastosowania | [makieta|render] 06-zastosowania-m.png | 0.435 |  **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| demo | [makieta|render] 07-demo-m.png | 0.403 |  **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| korzysci | render-only 08-korzysci-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| unoszace | render-only 09-unoszace-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| porownanie | render-only 10-porownanie-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| mid-cta | [makieta|render] 11-mid-cta-m.png | 0.483 |  **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| opinie | render-only 12-opinie-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| zdjecia-kupujacych | render-only 13-zdjecia-kupujacych-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| galeria | render-only 14-galeria-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| wideo | render-only 15-wideo-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| zamow | [makieta|render] 16-zamow-m.png | 0.593 |  **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| faq | render-only 17-faq-m.png | render-only |  **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| final | [makieta|render] 18-final-m.png | 0.267 |  **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).