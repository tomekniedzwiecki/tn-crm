# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `index.html` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.237 (sc 0.24/reszta 1.00) | OK · info: guttery(makieta-IR) render asym 0.45 vs makieta 0.00 (d=0.44) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zaufanie | kodowa | 02-zaufanie.png | 0.803 | OK · info: SSIM 0.803<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| problem | scenowa | 03-problem.png | 0.259 (sc 0.17/reszta 0.46) | OK · info: reszta-SSIM 0.457<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| rozwiazanie | inna | 04-rozwiazanie.png | 0.328 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| demo | scenowa | 05-demo.png | 0.376 (sc 0.10/reszta 0.47) | OK · info: reszta-SSIM 0.466<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zastosowania | inna | 06-zastosowania.png | 0.214 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zestaw | inna | 07-zestaw.png | 0.508 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| porownanie | kodowa | 08-porownanie.png | 0.423 | OK · info: SSIM 0.423<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| mid-cta | scenowa | 09-mid-cta.png | 0.279 (sc 0.28/reszta 1.00) | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| opinie | kodowa | 10-opinie.png | 0.608 | OK · info: SSIM 0.608<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| galeria | kodowa | 11-galeria.png | 0.311 | OK · info: SSIM 0.311<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| faq | kodowa | 14-faq.png | 0.553 | OK · info: SSIM 0.553<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zamow | kodowa | 15-zamow.png | 0.634 | OK · info: wysokosc(makieta-IR) sekcja AR 0.34 vs makieta 0.70 (d=52%); info: SSIM 0.634<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| final | scenowa | 16-final.png | 0.289 (sc 0.16/reszta 0.70) | OK · info: reszta-SSIM 0.705<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |

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
- H1 render 60px vs makieta 33px (+82%) -> za duzy, zmniejsz
- eyebrow render 13px vs makieta ~8px (+62%)
- region-SSIM copy=0.283 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zaufanie:**
- H1 render 22px vs makieta 162px (-86%) -> za maly, powieksz

**problem:**
- region-SSIM copy=0.278 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**rozwiazanie:**
- H1 render 66px vs makieta 56px (+18%) -> za duzy, zmniejsz
- tlo render #F3EDE4 vs makieta #F2E7D6 (dE=4.9) -> ustaw --paper #F2E7D6
- region-SSIM copy=0.253 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**demo:**
- region-SSIM copy=0.314 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zastosowania:**
- H1 render 66px vs makieta 58px (+14%) -> za duzy, zmniejsz
- region-SSIM copy=0.374 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zestaw:**
- H1 render 66px vs makieta 58px (+14%) -> za duzy, zmniejsz
- tlo render #E9E1D3 vs makieta #F5EEE2 (dE=4.7) -> ustaw --paper #F5EEE2
- region-SSIM copy=0.613 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**porownanie:**
- H1 render 66px vs makieta 48px (+38%) -> za duzy, zmniejsz
- tlo render #F3EDE4 vs makieta #E4D8C9 (dE=8.1) -> ustaw --paper #E4D8C9
- region-SSIM copy=0.217 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- region-SSIM copy=0.312 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**opinie:**
- region-SSIM copy=0.417 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**galeria:**
- H1 render 66px vs makieta 78px (-15%) -> za maly, powieksz
- region-SSIM copy=0.165 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- region-SSIM copy=0.404 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- H1 render 40px vs makieta 72px (-44%) -> za maly, powieksz
- region-SSIM copy=0.223 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- tlo render #F3EDE4 vs makieta #EDE3D6 (dE=4.2) -> ustaw --paper #EDE3D6
- region-SSIM copy=0.290 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)


<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `index.html` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.365 |  |
| zaufanie | [makieta|render] 02-zaufanie-m.png | 0.724 |  |
| sticky | render-only 03-sticky-m.png | render-only |  |
| problem | [makieta|render] 04-problem-m.png | 0.338 |  |
| rozwiazanie | [makieta|render] 05-rozwiazanie-m.png | 0.382 |  |
| demo | [makieta|render] 06-demo-m.png | 0.336 |  |
| zastosowania | [makieta|render] 07-zastosowania-m.png | 0.286 |  |
| zestaw | [makieta|render] 08-zestaw-m.png | 0.555 |  |
| porownanie | [makieta|render] 09-porownanie-m.png | 0.543 |  |
| mid-cta | [makieta|render] 10-mid-cta-m.png | 0.363 |  |
| opinie | [makieta|render] 11-opinie-m.png | 0.658 |  |
| galeria | [makieta|render] 12-galeria-m.png | 0.327 |  |
| faq | [makieta|render] 13-faq-m.png | 0.554 |  |
| zamow | [makieta|render] 14-zamow-m.png | 0.605 |  |
| final | [makieta|render] 15-final-m.png | 0.412 |  |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).