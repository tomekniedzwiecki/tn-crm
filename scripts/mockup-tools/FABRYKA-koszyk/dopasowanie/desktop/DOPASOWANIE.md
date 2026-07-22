# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `odsaczek` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.378 (sc 0.34/reszta 0.75) | OK · info: guttery(makieta-IR) render asym 0.00 vs makieta 0.96 (d=0.96); info: reszta-SSIM 0.749<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| jeden-ruch | inna | 02-jeden-ruch.png | 0.392 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zawies | inna | 03-zawies.png | 0.474 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zloz | inna | 04-zloz.png | 0.486 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| durszlak | inna | 05-durszlak.png | 0.462 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| mycie | inna | 06-mycie.png | 0.494 | OK | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| wideo | kodowa | 06b-wideo.png | 0.486 | OK · info: SSIM 0.486<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| mid-cta | scenowa | 07-mid-cta.png | 0.340 (sc 0.22/reszta 0.62) | OK · info: reszta-SSIM 0.624<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| zamow | kodowa | 08-zamow.png | 0.560 | OK · info: wysokosc(makieta-IR) sekcja AR 1.12 vs makieta 0.67 (d=69%); info: SSIM 0.560<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| faq | kodowa | 09-faq.png | 0.649 | OK · info: wysokosc(makieta-IR) sekcja AR 0.93 vs makieta 0.64 (d=45%); info: SSIM 0.649<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| final | scenowa | 10-final.png | 0.469 (sc 0.40/reszta 0.81) | OK · info: reszta-SSIM 0.805<0.85 (real vs AI-makieta) | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |

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
- H1 render 33px vs makieta 53px (-38%) -> za maly, powieksz
- region-SSIM copy=0.401 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**jeden-ruch:**
- H1 render 30px vs makieta 74px (-59%) -> za maly, powieksz
- region-SSIM copy=0.435 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zawies:**
- H1 render 30px vs makieta 65px (-54%) -> za maly, powieksz
- tlo render #EDE6D8 vs makieta #F7F0E8 (dE=4.8) -> ustaw --paper #F7F0E8
- region-SSIM copy=0.416 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zloz:**
- H1 render 30px vs makieta 58px (-48%) -> za maly, powieksz
- region-SSIM copy=0.291 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**durszlak:**
- H1 render 30px vs makieta 51px (-41%) -> za maly, powieksz
- region-SSIM copy=0.298 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mycie:**
- H1 render 30px vs makieta 51px (-41%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.341 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wideo:**
- H1 render 30px vs makieta 35px (-14%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~6px (+100%)
- swash/podkreslenie .hi: 1 el. bez piksela akcentu (0) -> dodaj podkreslenie w kolorze --cta
- region-SSIM copy=0.397 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 30px vs makieta 61px (-51%) -> za maly, powieksz
- tlo render #EDE6D8 vs makieta #FAF6F0 (dE=7.0) -> ustaw --paper #FAF6F0
- region-SSIM copy=0.310 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- H1 render 40px vs makieta 49px (-18%) -> za maly, powieksz
- eyebrow render 13px vs makieta ~9px (+44%)
- tlo render #F4EFE5 vs makieta #FDFAF6 (dE=5.0) -> ustaw --paper #FDFAF6
- region-SSIM copy=0.227 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- H1 render 30px vs makieta 71px (-58%) -> za maly, powieksz
- tlo render #F4EFE5 vs makieta #FCFAF6 (dE=5.0) -> ustaw --paper #FCFAF6

**final:**
- H1 render 30px vs makieta 52px (-42%) -> za maly, powieksz
- region-SSIM copy=0.401 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)
