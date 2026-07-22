# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `ugniatek` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.235 (sc 0.19/reszta 0.60) | OK · info: reszta-SSIM 0.596<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| dwie-formy | inna | 02-dwie-formy.png | 0.533 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| anatomia | inna | 03-anatomia.png | 0.500 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| sterowanie | inna | 04-sterowanie.png | 0.493 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| wieczorem | inna | 05-wieczorem.png | 0.364 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| wideo | kodowa | 05-wideo.png | 0.448 | OK · info: SSIM 0.448<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| mid-cta | scenowa | 06-mid-cta.png | 0.559 (sc 0.37/reszta 0.69) | OK · info: reszta-SSIM 0.692<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zestaw | inna | 07-zestaw.png | 0.564 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zamow | kodowa | 08-zamow.png | 0.666 | OK · info: wysokosc(makieta-IR) sekcja AR 0.86 vs makieta 0.18 (d=364%); info: SSIM 0.666<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| faq | kodowa | 09-faq.png | 0.756 | OK · info: wysokosc(makieta-IR) sekcja AR 0.63 vs makieta 0.18 (d=250%); info: SSIM 0.756<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| final | scenowa | 10-final.png | 0.445 (sc 0.20/reszta 0.49) | OK · info: reszta-SSIM 0.491<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |

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
- H1 render 30px vs makieta 55px (-45%) -> za maly, powieksz
- region-SSIM copy=0.247 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**dwie-formy:**
- H1 render 28px vs makieta 35px (-20%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.565 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**anatomia:**
- H1 render 32px vs makieta 49px (-35%) -> za maly, powieksz
- region-SSIM copy=0.582 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**sterowanie:**
- H1 render 28px vs makieta 48px (-42%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.481 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wieczorem:**
- H1 render 28px vs makieta 52px (-46%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.262 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wideo:**
- H1 render 28px vs makieta 43px (-35%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~7px (+71%)
- swash/podkreslenie .hi: 1 el. bez piksela akcentu (0) -> dodaj podkreslenie w kolorze --cta
- region-SSIM copy=0.577 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 26px vs makieta 14px (+86%) -> za duzy, zmniejsz

**zestaw:**
- region-SSIM copy=0.596 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- H1 render 26px vs makieta 12px (+117%) -> za duzy, zmniejsz
- region-SSIM copy=0.207 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- H1 render 28px vs makieta 14px (+100%) -> za duzy, zmniejsz

**final:**
- region-SSIM copy=0.468 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)
