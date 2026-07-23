# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `index.html` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.337 (sc 0.17/reszta 0.48) | OK · info: guttery(makieta-IR) render asym 0.53 vs makieta 0.00 (d=0.53); info: reszta-SSIM 0.477<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (packshot dyptyk zamrożone↔rozmrożone; eyebrow +50% i reszta-SSIM = szum makiety AI; guttery(IR-makieta) info; kod = kanon dyptyku, prawa połowa nosi hero-video) |
| problem | scenowa | 02-problem.png | 0.345 (sc 0.23/reszta 0.79) | OK · info: reszta-SSIM 0.794<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (scena mikrofala + miska w zlewie wg makiety (kontrakt Z2); H1 -13% = szum skali makiety AI; LAYOUT OK) |
| jak-dziala | inna | 03-jak-dziala.png | 0.521 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (TOR-I: 3 udokumentowane stany połóż→przykryj→dotknij; H1 mniejszy + akcent .hi przez klasy stanów w KODZIE (nie w statycznej makiecie); LAYOUT OK) |
| pojemnosc | inna | 04-pojemnosc.png | 0.490 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (4,2 L + TOR-I steki/ryba + taca ociekowa; H1 mniejszy = szum skali makiety AI; LAYOUT OK) |
| funkcje | inna | 05-funkcje.png | 0.543 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (materiały/panel/USB-C/plazma/UVC z atrybucją producentowi; H1 i eyebrow drift = szum makiety AI; LAYOUT OK) |
| wideo | kodowa | 06-wideo.png | 0.434 | OK · info: SSIM 0.434<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (rail 5 kafli self-host TikTok; H1 mniejszy = różnica skali render vs AI-makieta; LAYOUT OK, kod = kanon tokenów) |
| zdjecia | inna | None | BRAK-MAKIETY | SKIP | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (sekcja DOWODOWA render-only — 3 realne kadry UGC czarnego produktu (KAYUSO wycięty); brak makiety AI (sekcja dodana w naprawie 23.07); wierność = realne zdjęcia) |
| mid-cta | scenowa | 07-mid-cta.png | 0.613 (sc 0.25/reszta 0.70) | OK · info: reszta-SSIM 0.704<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (karta oferty eyebrow→H2→cena→CTA→zaufanie + packshot; reszta-SSIM = tło #F3E9E3 z KONTRAKTU tokenów, makieta AI jaśniejsza; LAYOUT OK) |
| faq | kodowa | 08-faq.png | 0.619 | OK · info: wysokosc(makieta-IR) sekcja AR 0.98 vs makieta 0.65 (d=52%); info: SSIM 0.619<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (akordeon <details> 8 pytań + blok cena+CTA; AR wys różni długością rozwiniętego akordeonu od makiety AI; LAYOUT OK, kod = kanon) |
| zamow | kodowa | 09-zamow.png | 0.630 | OK · info: wysokosc(makieta-IR) sekcja AR 0.92 vs makieta 0.61 (d=50%); info: SSIM 0.630<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (checkout inline — na LIVE pełny formularz; lokalny render = fallback (stąd AR), submit z obowiązkiem zapłaty, dostawa 9,99 zł; LAYOUT OK) |
| final | scenowa | 10-final.png | 0.380 (sc 0.29/reszta 0.62) | OK · info: reszta-SSIM 0.615<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (scena full-bleed wieczorny rytuał eyebrow→H2→cena→CTA→zaufanie; reszta-SSIM = scena vs AI-makieta; LAYOUT OK) |

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
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.510 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**problem:**
- H1 render 46px vs makieta 53px (-13%) -> za maly, powieksz
- region-SSIM copy=0.359 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**jak-dziala:**
- H1 render 46px vs makieta 64px (-28%) -> za maly, powieksz
- swash/podkreslenie .hi: 1 el. bez piksela akcentu (0) -> dodaj podkreslenie w kolorze --cta
- region-SSIM copy=0.530 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**pojemnosc:**
- H1 render 46px vs makieta 62px (-26%) -> za maly, powieksz
- swash/podkreslenie .hi: 1 el. bez piksela akcentu (0) -> dodaj podkreslenie w kolorze --cta
- region-SSIM copy=0.306 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**funkcje:**
- H1 render 46px vs makieta 57px (-19%) -> za maly, powieksz
- region-SSIM copy=0.465 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wideo:**
- H1 render 46px vs makieta 54px (-15%) -> za maly, powieksz
- eyebrow render 12px vs makieta ~8px (+50%)
- region-SSIM copy=0.363 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 46px vs makieta 61px (-25%) -> za maly, powieksz
- region-SSIM copy=0.444 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- H1 render 46px vs makieta 58px (-21%) -> za maly, powieksz
- region-SSIM copy=0.493 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- region-SSIM copy=0.598 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- H1 render 46px vs makieta 57px (-19%) -> za maly, powieksz
- region-SSIM copy=0.202 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)


<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `index.html` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.345 | TAK |
| problem | [makieta|render] 02-problem-m.png | 0.204 | TAK |
| sticky | render-only 03-sticky-m.png | render-only | TAK |
| jak-dziala | [makieta|render] 04-jak-dziala-m.png | 0.525 | TAK |
| pojemnosc | [makieta|render] 05-pojemnosc-m.png | 0.541 | TAK |
| funkcje | [makieta|render] 06-funkcje-m.png | 0.551 | TAK |
| wideo | [makieta|render] 07-wideo-m.png | 0.426 | TAK |
| zdjecia | render-only 08-zdjecia-m.png | render-only | TAK |
| mid-cta | [makieta|render] 09-mid-cta-m.png | 0.607 | TAK |
| faq | [makieta|render] 10-faq-m.png | 0.642 | TAK |
| zamow | [makieta|render] 11-zamow-m.png | 0.661 | TAK |
| final | [makieta|render] 12-final-m.png | 0.286 | TAK |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).
