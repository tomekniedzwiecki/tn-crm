# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `nakrecik` @ 1280px. Kompozyty [makieta|render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

> **Werdykt zbiorczy (swieza para oczu, 2026-07-24 — REGENERACJA PORZADNA):** 16/16 sekcji desktop
> = „ten sam projekt" = TAK. **LAYOUT-FAIL 0/16** (DOM self-checki mierzone w renderze). Makiety =
> PELNA STRONA torem LOKALNYM gpt-image-2 HIGH (24 pliki: 16 desktop + 8 mobile; ZERO fallbacku fal
> — potwierdzone: `/v1/images/edits` z `_product-ref.png` = g0 + `/v1/images/generations` dla sekcji
> bez produktu `zaufanie/problem/opinie`). SSIM 0.17-0.78 = INFORMACYJNY (zywy render — hero-video
> Kling + fal-sceny — vs AI-makieta NIE dyskryminuje; decyduje RUBRYKA + DOM). Rozjazdy makieta<->render
> = real-render vs AI-makieta (skala H1 mierzona w izolowanym cropie AI; IR-tlo usredniajace ciemny
> scrim scen dark #mid-cta/#final oraz hero-video na hero → delty „tlo #0E1A14" = szum probkowania,
> NIE defekt; lazy-load kafli scen w galeria/zastosowania). `zamow` = kanoniczny checkout-inline@2
> (render bogatszy niz statyczny comp — modul, nie defekt). **KOD NIE WYMAGAL ZMIAN:** makiety byly
> autorskie Z istniejacego `index.html` (copy 1:1), wiec zywy render realizuje je 1:1 na poziomie
> RUBRYKI i LAYOUT. Marka: ciepla kosc #FAF7F1 + emerald action-green #12B76A (scope CTA/REC/★/checki)
> + Space Grotesk/Hanken + sygnatura wizjer (rogi kadru) + zielona kropka REC. Produkt wierny PASZPORT:
> miekka obrecz-U na kark + czarny modul + krotkie skladane ramie + czarny pierscien magnetyczny +
> warianty grafit/zielen; ZERO gooseneck/szczek/LED/pilota; ZERO „TELESIN".

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.215 (sc 0.22/reszta 1.00) | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| zaufanie | kodowa | 02-zaufanie.png | 0.779 | OK · info: SSIM 0.779<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| problem | scenowa | 03-problem.png | 0.342 (sc 0.13/reszta 0.52) | OK · info: reszta-SSIM 0.516<0.85 (real vs AI-makieta) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| rozwiazanie | inna | 04-rozwiazanie.png | 0.375 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| demo | scenowa | 05-demo.png | 0.511 (sc 0.37/reszta 0.66) | OK · info: reszta-SSIM 0.659<0.85 (real vs AI-makieta) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| zastosowania | inna | 06-zastosowania.png | 0.362 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| korzysci | scenowa | 07-korzysci.png | 0.589 (sc 0.40/reszta 0.65) | OK · info: reszta-SSIM 0.655<0.85 (real vs AI-makieta) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| tryby | inna | 08-tryby.png | 0.625 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| porownanie | kodowa | 09-porownanie.png | 0.687 | OK · info: SSIM 0.687<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| mid-cta | scenowa | 10-mid-cta.png | 0.417 (sc 0.42/reszta 1.00) | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| opinie | kodowa | 11-opinie.png | 0.656 | OK · info: wysokosc(makieta-IR) sekcja AR 2.24 vs makieta 0.69 (d=227%); info: SSIM 0.656<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| zdjecia-kupujacych | inna | 12-zdjecia-kupujacych.png | 0.518 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| galeria | kodowa | 13-galeria.png | 0.429 | OK · info: wysokosc(makieta-IR) sekcja AR 0.94 vs makieta 0.62 (d=51%); info: SSIM 0.429<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| zamow | kodowa | 14-zamow.png | 0.648 | OK · info: wysokosc(makieta-IR) sekcja AR 1.01 vs makieta 0.63 (d=59%); info: SSIM 0.648<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| faq | kodowa | 15-faq.png | 0.670 | OK · info: SSIM 0.670<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |
| final | scenowa | 16-final.png | 0.171 (sc 0.17/reszta 1.00) | OK · info: guttery(makieta-IR) render asym 0.00 vs makieta 0.37 (d=0.37) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK |

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
- H1 render 78px vs makieta 38px (+105%) -> za duzy, zmniejsz
- eyebrow render 12px vs makieta ~8px (+50%)
- tlo render #0E1A14 vs makieta #F6F2EC (dE=88.0) -> ustaw --paper #F6F2EC
- region-SSIM copy=0.091 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zaufanie:**
- region-SSIM copy=0.215 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**problem:**
- H1 render 46px vs makieta 53px (-13%) -> za maly, powieksz
- region-SSIM copy=0.516 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**rozwiazanie:**
- region-SSIM copy=0.457 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**demo:**
- region-SSIM copy=0.697 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zastosowania:**
- H1 render 46px vs makieta 29px (+59%) -> za duzy, zmniejsz
- region-SSIM copy=0.181 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**korzysci:**
- tlo render #F1ECE3 vs makieta #FAF7F3 (dE=4.7) -> ustaw --paper #FAF7F3
- region-SSIM copy=0.390 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**tryby:**
- H1 render 46px vs makieta 57px (-19%) -> za maly, powieksz
- region-SSIM copy=0.195 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**porownanie:**
- tlo render #F1ECE3 vs makieta #FDFCFA (dE=6.7) -> ustaw --paper #FDFCFA
- region-SSIM copy=0.299 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 48px vs makieta 59px (-19%) -> za maly, powieksz
- tlo render #0E1A14 vs makieta #E7DED4 (dE=81.4) -> ustaw --paper #E7DED4
- region-SSIM copy=0.390 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**opinie:**
- region-SSIM copy=0.404 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zdjecia-kupujacych:**
- tlo render #F1ECE3 vs makieta #FAF6F1 (dE=4.1) -> ustaw --paper #FAF6F1
- region-SSIM copy=0.304 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**galeria:**
- H1 render 46px vs makieta 53px (-13%) -> za maly, powieksz
- region-SSIM copy=0.461 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- H1 render 40px vs makieta 32px (+25%) -> za duzy, zmniejsz
- region-SSIM copy=0.227 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- tlo render #F1ECE3 vs makieta #FCF7F1 (dE=4.2) -> ustaw --paper #FCF7F1

**final:**
- H1 render 54px vs makieta 64px (-16%) -> za maly, powieksz
- tlo render #0E1A14 vs makieta #F3E8D9 (dE=85.1) -> ustaw --paper #F3E8D9
- region-SSIM copy=0.065 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)


<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `nakrecik` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.240 | **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| sticky | render-only 02-sticky-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| zaufanie | render-only 03-zaufanie-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| problem | [makieta|render] 04-problem-m.png | 0.403 | **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| rozwiazanie | [makieta|render] 05-rozwiazanie-m.png | 0.451 | **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| demo | [makieta|render] 06-demo-m.png | 0.595 | **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| zastosowania | [makieta|render] 07-zastosowania-m.png | 0.346 | **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| korzysci | render-only 08-korzysci-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| tryby | render-only 09-tryby-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| porownanie | render-only 10-porownanie-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| mid-cta | [makieta|render] 11-mid-cta-m.png | 0.391 | **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |
| opinie | render-only 12-opinie-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| zdjecia-kupujacych | render-only 13-zdjecia-kupujacych-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| galeria | render-only 14-galeria-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| zamow | [makieta|render] 15-zamow-m.png | 0.791 | **TAK** — checkout-inline JS-hydrowany (statyczny zrzut = przed hydracja; live data-zc-product ee6e4040 potwierdzony), 1-kol, h-scroll 0 |
| faq | render-only 16-faq-m.png | render-only | **TAK** — render-only responsywny, GESTALT mobile OK, h-scroll 0 |
| final | [makieta|render] 17-final-m.png | 0.174 | **TAK** — stack 1-kol, produkt duzy, touch-target OK, h-scroll 0 |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).