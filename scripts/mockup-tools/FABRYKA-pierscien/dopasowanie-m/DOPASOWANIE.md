# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `skrolik` @ 390px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) | uwagi |
|---|---|---|---:|---|---|---|
| hero | scenowa | 01-hero-m.png | 0.545 (sc 0.48/reszta 0.77) | OK · info: reszta-SSIM 0.767<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | stack H1→lead→scena→CTA→micro; hero-video gra na mobile (LL-049, visual-verify) (390) |
| demo | scenowa | 02-demo-m.png | 0.755 (sc 0.74/reszta 0.80) | OK · info: reszta-SSIM 0.802<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | stack packshot→telefon; sticky-buy w cropie = artefakt capture (fixed) (390) |
| sticky | inna | None | BRAK-MAKIETY | SKIP | skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ? |
| ekran-zostaje | inna | 03-ekran-zostaje-m.png | 0.475 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | stack 2 kart 7:5 z captionami (390) |
| ebooki | inna | 04-ebooki-m.png | 0.544 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | stack eyebrow+H2→foto→body→ikony (390) |
| selfie | inna | 05-selfie-m.png | 0.614 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | stack; scena 4:3 po r2 (390) |
| kolory | inna | 06-kolory-m.png | 0.645 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | trójpak full + 2 kol + klips 2:1 cover (r2) + spec — zwarty układ (390) |
| wideo | kodowa | 07-wideo-m.png | 0.457 | OK · info: SSIM 0.457<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | kafel full-width 1:1; autoplay ambient (390) |
| mid-cta | scenowa | 08-mid-cta-m.png | 0.724 (sc 0.72/reszta 0.77) | OK · info: reszta-SSIM 0.774<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | karta stack (390) |
| zamow | kodowa | 09-zamow-m.png | 0.714 | OK · info: wysokosc(makieta-IR) sekcja AR 4.41 vs makieta 1.74 (d=154%); info: SSIM 0.714<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | karta kompakt 96px + zc-summary full-width (LL-050) + formularz steps (390) |
| faq | kodowa | 10-faq-m.png | 0.715 | OK · info: SSIM 0.715<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | akordeon native (390) |
| final | scenowa | 11-final-m.png | 0.611 (sc 0.47/reszta 0.70) | OK · info: reszta-SSIM 0.700<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | karta centrowana (jak makieta mobile); keep5 300px (390) |

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
- H1 render 23px vs makieta 126px (-82%) -> za maly, powieksz
- region-SSIM copy=0.484 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**demo:**
- H1 render 21px vs makieta 106px (-80%) -> za maly, powieksz
- region-SSIM copy=0.261 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**ekran-zostaje:**
- H1 render 21px vs makieta 99px (-79%) -> za maly, powieksz

**ebooki:**
- H1 render 21px vs makieta 105px (-80%) -> za maly, powieksz
- region-SSIM copy=0.308 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**selfie:**
- H1 render 21px vs makieta 168px (-88%) -> za maly, powieksz
- region-SSIM copy=0.527 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**kolory:**
- H1 render 21px vs makieta 88px (-76%) -> za maly, powieksz
- tlo render #F3E8E7 vs makieta #FDFCFC (dE=7.2) -> ustaw --paper #FDFCFC
- region-SSIM copy=0.349 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wideo:**
- H1 render 21px vs makieta 113px (-81%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~28px (-57%)
- region-SSIM copy=0.473 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 24px vs makieta 139px (-83%) -> za maly, powieksz
- tlo render #F3E8E7 vs makieta #FBF6F5 (dE=4.9) -> ustaw --paper #FBF6F5
- region-SSIM copy=0.387 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- H1 render 26px vs makieta 85px (-69%) -> za maly, powieksz
- eyebrow render 13px vs makieta ~23px (-43%)
- tlo render #F8F1F0 vs makieta #FDFCFC (dE=4.0) -> ustaw --paper #FDFCFC
- region-SSIM copy=0.299 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- H1 render 21px vs makieta 104px (-80%) -> za maly, powieksz
- tlo render #F3E8E7 vs makieta #FDFCFB (dE=7.2) -> ustaw --paper #FDFCFB
- region-SSIM copy=0.420 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- tlo render #ECDCDB vs makieta #FDF3F4 (dE=8.0) -> ustaw --paper #FDF3F4
