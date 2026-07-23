# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `index.html` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.308 (sc 0.31/reszta 1.00) | OK · info: guttery(makieta-IR) render asym 0.55 vs makieta 0.01 (d=0.54) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| problem | scenowa | 02-problem.png | 0.630 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| jak-cwiczysz | inna | 03-jak-cwiczysz.png | 0.594 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| regulacja | inna | 04-regulacja.png | 0.559 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| wideo | kodowa | 05-wideo.png | 0.350 | OK · info: wysokosc(makieta-IR) sekcja AR 0.93 vs makieta 0.63 (d=48%); info: SSIM 0.350<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| wiele-partii | inna | 06-wiele-partii.png | 0.440 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| wytrzymalosc | inna | 07-wytrzymalosc.png | 0.595 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| mid-cta | scenowa | 08-mid-cta.png | 0.601 (sc 0.42/reszta 0.68) | OK · info: reszta-SSIM 0.677<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| skladanie | inna | 09-skladanie.png | 0.431 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zamow | kodowa | 10-zamow.png | 0.602 | OK · info: SSIM 0.602<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| final | scenowa | 11-final.png | 0.691 | OK · info: guttery(makieta-IR) render asym 0.04 vs makieta 0.50 (d=0.46) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |

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
- H1 render 38px vs makieta 47px (-19%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~8px (+50%)
- tlo render #F0ECF7 vs makieta #F7F6FA (dE=4.9) -> ustaw --paper #F7F6FA
- chip-trust cx 0.23 vs makieta 0.94 -> przenies inline-right
- region-SSIM copy=0.316 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**problem:**
- H1 render 60px vs makieta 77px (-22%) -> za maly, powieksz
- region-SSIM copy=0.135 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**jak-cwiczysz:**
- region-SSIM copy=0.267 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**regulacja:**
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.433 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wideo:**
- H1 render 60px vs makieta 50px (+20%) -> za duzy, zmniejsz
- region-SSIM copy=0.245 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wiele-partii:**
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.453 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wytrzymalosc:**
- region-SSIM copy=0.365 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- region-SSIM copy=0.467 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**skladanie:**
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.317 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- eyebrow render 17px vs makieta ~9px (+89%)
- tlo render #F7F5FB vs makieta #FDFDFD (dE=4.0) -> ustaw --paper #FDFDFD
- region-SSIM copy=0.565 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- H1 render 60px vs makieta 45px (+33%) -> za duzy, zmniejsz
- eyebrow render 12px vs makieta ~8px (+50%)
- tlo render #F7F5FB vs makieta #FDFDFD (dE=4.0) -> ustaw --paper #FDFDFD
- region-SSIM copy=0.606 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `index.html` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.463 |  |
| problem | [makieta|render] 02-problem-m.png | 0.621 |  |
| sticky | render-only 03-sticky-m.png | render-only |  |
| jak-cwiczysz | [makieta|render] 04-jak-cwiczysz-m.png | 0.651 |  |
| regulacja | [makieta|render] 05-regulacja-m.png | 0.581 |  |
| wideo | [makieta|render] 06-wideo-m.png | 0.446 |  |
| wiele-partii | [makieta|render] 07-wiele-partii-m.png | 0.465 |  |
| wytrzymalosc | [makieta|render] 08-wytrzymalosc-m.png | 0.626 |  |
| mid-cta | [makieta|render] 09-mid-cta-m.png | 0.664 |  |
| skladanie | [makieta|render] 10-skladanie-m.png | 0.454 |  |
| zamow | [makieta|render] 11-zamow-m.png | 0.639 |  |
| final | [makieta|render] 12-final-m.png | 0.676 |  |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).