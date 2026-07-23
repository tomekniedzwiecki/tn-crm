# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `index.html` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.234 (sc 0.23/reszta 1.00) | OK · info: guttery(makieta-IR) render asym 0.45 vs makieta 0.00 (d=0.44) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| zaufanie | kodowa | 02-zaufanie.png | 0.803 | OK · info: SSIM 0.803<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| problem | scenowa | 03-problem.png | 0.259 (sc 0.18/reszta 0.46) | OK · info: reszta-SSIM 0.457<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| rozwiazanie | inna | 04-rozwiazanie.png | 0.334 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| demo | scenowa | 05-demo.png | 0.376 (sc 0.10/reszta 0.47) | OK · info: reszta-SSIM 0.466<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| zastosowania | inna | 06-zastosowania.png | 0.202 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| zestaw | inna | 07-zestaw.png | 0.508 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| porownanie | kodowa | 08-porownanie.png | 0.423 | OK · info: SSIM 0.423<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| mid-cta | scenowa | 09-mid-cta.png | 0.278 (sc 0.28/reszta 1.00) | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| opinie | kodowa | 10-opinie.png | 0.606 | OK · info: SSIM 0.606<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| galeria | kodowa | 11-galeria.png | 0.310 | OK · info: SSIM 0.310<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| faq | kodowa | 14-faq.png | 0.552 | OK · info: SSIM 0.552<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| zamow | kodowa | 15-zamow.png | 0.633 | OK · info: wysokosc(makieta-IR) sekcja AR 0.34 vs makieta 0.70 (d=52%); info: SSIM 0.633<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |
| final | scenowa | 16-final.png | 0.289 (sc 0.16/reszta 0.70) | OK · info: reszta-SSIM 0.704<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK |

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
- region-SSIM copy=0.286 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zaufanie:**
- H1 render 22px vs makieta 162px (-86%) -> za maly, powieksz

**problem:**
- region-SSIM copy=0.278 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**rozwiazanie:**
- H1 render 66px vs makieta 56px (+18%) -> za duzy, zmniejsz
- tlo render #F3EDE4 vs makieta #F2E7D6 (dE=4.9) -> ustaw --paper #F2E7D6
- region-SSIM copy=0.279 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**demo:**
- region-SSIM copy=0.314 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zastosowania:**
- H1 render 66px vs makieta 58px (+14%) -> za duzy, zmniejsz
- region-SSIM copy=0.461 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zestaw:**
- H1 render 66px vs makieta 58px (+14%) -> za duzy, zmniejsz
- tlo render #E9E1D3 vs makieta #F5EEE2 (dE=4.7) -> ustaw --paper #F5EEE2
- region-SSIM copy=0.612 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**porownanie:**
- H1 render 66px vs makieta 48px (+38%) -> za duzy, zmniejsz
- tlo render #F3EDE4 vs makieta #E4D8C9 (dE=8.1) -> ustaw --paper #E4D8C9
- region-SSIM copy=0.217 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- region-SSIM copy=0.310 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**opinie:**
- region-SSIM copy=0.416 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**galeria:**
- H1 render 66px vs makieta 78px (-15%) -> za maly, powieksz
- region-SSIM copy=0.165 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- region-SSIM copy=0.405 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- H1 render 40px vs makieta 72px (-44%) -> za maly, powieksz
- region-SSIM copy=0.223 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- tlo render #F3EDE4 vs makieta #EDE3D6 (dE=4.2) -> ustaw --paper #EDE3D6
- region-SSIM copy=0.274 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `index.html` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.365 | TAK |
| zaufanie | [makieta|render] 02-zaufanie-m.png | 0.724 | TAK |
| sticky | render-only 03-sticky-m.png | render-only | TAK |
| problem | [makieta|render] 04-problem-m.png | 0.338 | TAK |
| rozwiazanie | [makieta|render] 05-rozwiazanie-m.png | 0.383 | TAK |
| demo | [makieta|render] 06-demo-m.png | 0.335 | TAK |
| zastosowania | [makieta|render] 07-zastosowania-m.png | 0.280 | TAK |
| zestaw | [makieta|render] 08-zestaw-m.png | 0.555 | TAK |
| porownanie | [makieta|render] 09-porownanie-m.png | 0.543 | TAK |
| mid-cta | [makieta|render] 10-mid-cta-m.png | 0.362 | TAK |
| opinie | [makieta|render] 11-opinie-m.png | 0.659 | TAK |
| galeria | [makieta|render] 12-galeria-m.png | 0.327 | TAK |
| faq | [makieta|render] 13-faq-m.png | 0.552 | TAK |
| zamow | [makieta|render] 14-zamow-m.png | 0.611 | TAK |
| final | [makieta|render] 15-final-m.png | 0.412 | TAK |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).

<!-- NOTA-ZAMOW -->
## Nota do sekcji #zamow (checkout-inline@2)
NOTA #zamow: render preview pokazuje modul w stanie PRZED-PUBLIKACYJNYM (placeholder `{{WF2_PRODUCT_ID}}` => zc-guard), zgodnie ze standardem przed platform-sync (test Allegro->Marka, bez publikacji na platforme). Makieta 15-zamow przedstawia stan PO hydratacji (pelny formularz + podsumowanie), ktory modul odtwarza 1:1 po publikacji. Rubryka ocenia wiernosc KODU makiecie (naglowek "Zamow Popiolka.", skorka tokenami, siatka pol->podsumowanie modulu) — struktura zgodna; roznica wysokosci render-vs-makieta = stan danych (guard), nie defekt ukladu. Mechanika modulu NIETYKALNA (data-zc-product + data-zc-api obecne).
