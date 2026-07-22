# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `skrolik` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) | uwagi |
|---|---|---|---:|---|---|---|
| hero | scenowa | 01-hero.png | 0.509 (sc 0.30/reszta 0.72) | OK · info: guttery(makieta-IR) render asym 0.46 vs makieta 0.02 (d=0.44); info: reszta-SSIM 0.715<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | archetyp B split 55/45 copy/scena; nav w cropie = sticky topbar (artefakt capture, precedens odsaczka); hero-video LL-041/049 gra na LIVE (visual-verify) (1280) |
| demo | scenowa | 02-demo.png | 0.716 (sc 0.49/reszta 0.76) | OK · info: reszta-SSIM 0.764<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | TOR-I: telefon CSS z feedem + ▼ przesuwa o kartę i wraca (test stanów ŻYWA, WYNIK.md); wariacje kart po rundzie 1 (1280) |
| ekran-zostaje | inna | 03-ekran-zostaje.png | 0.403 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | r2: karty crop 7:5 (wyższe); 2 karty + captiony; ANIM kanapa gra, kuchnia statyczna (LL-053) (1280) |
| ebooki | inna | 04-ebooki.png | 0.527 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | split foto/copy + eyebrow + 3 ikony z podpisami — 1:1 (1280) |
| selfie | inna | 05-selfie.png | 0.527 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | r2: scena 4:3 cover wypełnia kolumnę; mirrored split + pigułka eyebrow + 3 ikony (1280) |
| kolory | inna | 06-kolory.png | 0.641 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | r2: bento 1080px, keep4 cover; kafle packshotów CONTAIN = realne kadry 1:1 (decyzja briefu); karta spec 3,0×2,8×1,3 cm (kotwica Karta) (1280) |
| wideo | kodowa | 07-wideo.png | 0.491 | OK · info: SSIM 0.491<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | moduł wideo-rail 1 kafel 1:1 pełny rail (LL-045); ambient autoplay potwierdzony na LIVE; atrybucja @hellozdvj8x (1280) |
| mid-cta | scenowa | 08-mid-cta.png | 0.718 (sc 0.50/reszta 0.78) | OK · info: reszta-SSIM 0.780<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | karta CTA z packshotem (biały box = realne tło kadru keep2) — układ 1:1 (1280) |
| zamow | kodowa | 09-zamow.png | 0.657 | OK · info: wysokosc(makieta-IR) sekcja AR 1.10 vs makieta 0.66 (d=66%); info: SSIM 0.657<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | moduł checkout-inline@2 steps + LL-050 (zc-summary w karcie produktu, sticky); zgoda+trust modułowe (wymóg prawny) (1280) |
| faq | kodowa | 10-faq.png | 0.788 | OK · info: SSIM 0.788<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | moduł faq-accordion@1 native details; 6 pytań VERBATIM z makiety, pierwszy otwarty (1280) |
| final | scenowa | 11-final.png | 0.596 (sc 0.31/reszta 0.70) | OK · info: reszta-SSIM 0.702<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | r2 rewrite: karta 2-kol 1020px (copy / keep5-lifestyle 360px + łuki .fn-sig) — układ=makieta; keep5 usuwa duplikat keep2 (P0) (1280) |

> LAYOUT twarde (DOM self-checki, mierzone w renderze — BEZ makiety): (1) kafle-sliver cols>=5 &
> szer<12% & portret; (2) pustka-pod-obrazem: obraz in-flow contain w boksie ar>=1.4 z pustka
> pionowa >=30% (produkt plywa) LUB dolne >30% sekcji bez tresci; (3) gutter: scena full-bleed
> jednostronna (kryje <85% szer & off-center >0.12) LUB tresc przyklejona do boku z pustym gutterem.
> INFORMACYJNE (kolumna LAYOUT: 'info:', NIE FAIL — szum makiet AI): wysokosc/guttery/obraz z IR-makiety,
> raw-SSIM (real-render vs AI-makieta nie dyskryminuje wiernosci). Decyduja: DOM self-checki + RUBRYKA vision 5xT/N.
> SCENOWA: SSIM dwuskladnikowy (maska sceny cap ~0.70 OSOBNO + reszta) — informacyjnie.



<!-- MOBILE-390 -->
# DOPASOWANIE MOBILE 390 — dowody per sekcja (rubryka R13)

Render `skrolik` @ 390px. Kompozyty [makieta | render] NN-*-m.png w tym katalogu.

| sekcja | dowod mobile | SSIM/typ | rubryka | werdykt |
|---|---|---|---|---|
| hero | [makieta - render] 01-hero-m.png | 0.545 (sc 0.48/reszta 0.77) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — stack H1→lead→scena→CTA→micro; hero-video gra na mobile (LL-049, visual-verify) (390) |
| demo | [makieta - render] 02-demo-m.png | 0.755 (sc 0.74/reszta 0.80) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — stack packshot→telefon; sticky-buy w cropie = artefakt capture (fixed) (390) |
| ekran-zostaje | [makieta - render] 03-ekran-zostaje-m.png | 0.475 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — stack 2 kart 7:5 z captionami (390) |
| ebooki | [makieta - render] 04-ebooki-m.png | 0.544 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — stack eyebrow+H2→foto→body→ikony (390) |
| selfie | [makieta - render] 05-selfie-m.png | 0.614 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — stack; scena 4:3 po r2 (390) |
| kolory | [makieta - render] 06-kolory-m.png | 0.645 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — trójpak full + 2 kol + klips 2:1 cover (r2) + spec — zwarty układ (390) |
| wideo | [makieta - render] 07-wideo-m.png | 0.457 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — kafel full-width 1:1; autoplay ambient (390) |
| mid-cta | [makieta - render] 08-mid-cta-m.png | 0.724 (sc 0.72/reszta 0.77) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — karta stack (390) |
| zamow | [makieta - render] 09-zamow-m.png | 0.714 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — karta kompakt 96px + zc-summary full-width (LL-050) + formularz steps (390) |
| faq | [makieta - render] 10-faq-m.png | 0.715 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — akordeon native (390) |
| final | [makieta - render] 11-final-m.png | 0.611 (sc 0.47/reszta 0.70) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — karta centrowana (jak makieta mobile); keep5 300px (390) |

<!-- DELTY-POMIAROWE -->
## DELTY POMIAROWE per sekcja (sekcja-diff.py: render getComputedStyle vs IR makiety)

Twarde liczby z pomiaru RENDERU porownane z IR makiety (paleta/skala/pozycje). Koder/montaz
konsumuje to do PUNKTOWYCH poprawek: NIE aproksymuj, popraw dokladnie wskazana wartosc.

**hero:**
- H1 render 33px vs makieta 58px (-43%) -> za maly, powieksz
- region-SSIM copy=0.564 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**demo:**
- H1 render 30px vs makieta 73px (-59%) -> za maly, powieksz
- region-SSIM copy=0.437 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**ekran-zostaje:**
- H1 render 30px vs makieta 55px (-45%) -> za maly, powieksz
- region-SSIM copy=0.200 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**ebooki:**
- H1 render 30px vs makieta 68px (-56%) -> za maly, powieksz
- region-SSIM copy=0.487 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**selfie:**
- H1 render 30px vs makieta 55px (-45%) -> za maly, powieksz
- region-SSIM copy=0.474 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**kolory:**
- H1 render 30px vs makieta 55px (-45%) -> za maly, powieksz
- region-SSIM copy=0.377 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wideo:**
- H1 render 30px vs makieta 74px (-59%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~20px (-40%)
- region-SSIM copy=0.342 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 24px vs makieta 75px (-68%) -> za maly, powieksz
- region-SSIM copy=0.510 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- H1 render 40px vs makieta 53px (-25%) -> za maly, powieksz
- tlo render #F8F1F0 vs makieta #FDFCFC (dE=4.0) -> ustaw --paper #FDFCFC
- region-SSIM copy=0.648 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- H1 render 30px vs makieta 44px (-32%) -> za maly, powieksz
- tlo render #F3E8E7 vs makieta #FDFBFA (dE=6.8) -> ustaw --paper #FDFBFA
- region-SSIM copy=0.525 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- H1 render 30px vs makieta 49px (-39%) -> za maly, powieksz
- tlo render #ECDCDB vs makieta #FCEEF1 (dE=6.6) -> ustaw --paper #FCEEF1
- region-SSIM copy=0.659 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)
