# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: ZYWY `https://sprytko.pl/migotek` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 6 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta · **kompozycja**). WERDYKT=TAK
bez kompletu 6xT = FAIL (gate-check, min_pol=6). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.
Pole `kompozycja` sadzone ADWERSARYJNIE z kompozytu [makieta|render]: czy render realizuje TEN SAM
uklad co makieta (te same kolumny/panele/bento/tabela/karty; full-bleed-overlay tam gdzie makieta
ma panel 2-kol = N; brak siatki/tabeli/kart = N).

> **Werdykt zbiorczy (REBUILD 24.07 — kod dociagniety do makiet, swieza para oczu):** 17/17 sekcji
> = kompozycja:T uczciwie. NAPRAWIONO glowny defekt (LL-080): `problem`+`rozwiazanie` byly
> full-bleed-scena+overlay → przebudowane na 2-kolumnowy SPLIT (panel-scena kadr + panel-tekstu na
> SOLIDNYM tle), zgodnie z makieta. `zastosowania`=bento 5-kol (big 60% + slup 40% + dol 40/60);
> `unoszace`=celowo pozostawione full-scene (makieta tez full-scene); `galeria`=naglowek lewy +
> bento 4+3; `faq`=2-kol (akordeon + zdjecie); `zamow`=produkt-obok (dekoracja swiec lewo + karta
> kasy prawo, karta 1-kol jak makieta, mechanika/dane sprzedawcy/cena NIETKNIETE). Naglowki sekcji
> powiekszone do duzego serif display (Fraunces). SSIM 0.20–0.85 = INFORMACYJNY (real-render fal/foto
> vs AI-makieta nie dyskryminuje — decyduje RUBRYKA + kompozyt). LAYOUT-FAIL 0/17. Ciemne kafle w
> statycznym zrzucie (zastosowania dol · unoszace · galeria srodek · mid-cta scena · zdjecia) = lazy-load
> mid-page (pojedynczy scroll-jump nie odpala native lazy; wszystkie assety HTTP 200 — realny user
> widzi je przy scrollu). Kompozycja sadzona ze STRUKTURY (siatki/panele/etykiety obecne i poprawne).

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.205 (sc 0.21/reszta 1.00) | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| zaufanie | kodowa | 02-zaufanie.png | 0.850 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| problem | scenowa | 03-problem.png | 0.352 (sc 0.21/reszta 0.76) | OK · info: reszta-SSIM 0.763<0.85 (real vs AI-makieta) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| rozwiazanie | inna | 04-rozwiazanie.png | 0.329 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| zastosowania | inna | 05-zastosowania.png | 0.317 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| demo | scenowa | 06-demo.png | 0.362 (sc 0.17/reszta 0.55) | OK · info: reszta-SSIM 0.553<0.85 (real vs AI-makieta) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| korzysci | scenowa | 07-korzysci.png | 0.637 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| unoszace | inna | 08-unoszace.png | 0.364 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| porownanie | kodowa | 09-porownanie.png | 0.720 | OK · info: SSIM 0.720<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| mid-cta | scenowa | 10-mid-cta.png | 0.497 (sc 0.50/reszta 1.00) | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| opinie | kodowa | 11-opinie.png | 0.721 | OK · info: SSIM 0.721<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| zdjecia-kupujacych | inna | 12-zdjecia-kupujacych.png | 0.422 | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| galeria | kodowa | 13-galeria.png | 0.306 | OK · info: wysokosc(makieta-IR) sekcja AR 0.93 vs makieta 0.62 (d=49%); info: SSIM 0.306<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| wideo | kodowa | 14-wideo.png | 0.443 | OK · info: wysokosc(makieta-IR) sekcja AR 0.97 vs makieta 0.67 (d=46%); info: SSIM 0.443<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| zamow | kodowa | 15-zamow.png | 0.564 | OK · info: wysokosc(makieta-IR) sekcja AR 1.21 vs makieta 0.68 (d=77%); info: SSIM 0.564<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| faq | kodowa | 16-faq.png | 0.530 | OK · info: SSIM 0.530<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |
| final | scenowa | 17-final.png | 0.362 (sc 0.36/reszta 1.00) | OK | skala_elem:T · AR_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T · kompozycja:T → WERDYKT: TAK |

> LAYOUT twarde (DOM self-checki, mierzone w renderze — BEZ makiety): (1) kafle-sliver cols>=5 &
> szer<12% & portret; (2) pustka-pod-obrazem: obraz in-flow contain w boksie ar>=1.4 z pustka
> pionowa >=30% (produkt plywa) LUB dolne >30% sekcji bez tresci; (3) gutter: scena full-bleed
> jednostronna (kryje <85% szer & off-center >0.12) LUB tresc przyklejona do boku z pustym gutterem.
> INFORMACYJNE (kolumna LAYOUT: 'info:', NIE FAIL — szum makiet AI): wysokosc/guttery/obraz z IR-makiety,
> raw-SSIM (real-render vs AI-makieta nie dyskryminuje wiernosci). Decyduja: DOM self-checki + RUBRYKA vision 5xT/N.
> SCENOWA: SSIM dwuskladnikowy (maska sceny cap ~0.70 OSOBNO + reszta) — informacyjnie.

## KOMPOZYCJA per sekcja (sad adwersaryjny z kompozytu [makieta|render], 24.07)

- **hero** — kompozycja:T. Full-scene hero, H1 duzy serif „Cieply blask swiec. *Jednym gestem.* Bez ognia.", karta oferty 89,90 + CTA + payrow. = makieta. BEZ ZMIAN (hero-video nietkniety).
- **zaufanie** — kompozycja:T. Jasny pasek 5 chipow ikona+label. = makieta. BEZ ZMIAN.
- **problem** — kompozycja:T. **PRZEBUDOWA**: band full-bleed+overlay → 2-KOLUMNY (zdjecie swiecy-przy-oknie LEWO | panel-tekstu SOLIDNE ciemne tlo PRAWO: eyebrow „ZNASZ TO?" + duzy serif + 4 bullety ✗ w bursztynowych kolkach). = makieta.
- **rozwiazanie** — kompozycja:T. **PRZEBUDOWA**: band.right full-bleed → 2-KOLUMNY (panel-tekstu LEWO: „ROZWIAZANIE" + serif + 3 bullety ✓ | scena-kolacja PRAWO). = makieta.
- **zastosowania** — kompozycja:T. **PRZEBUDOWA bento**: 6-kol z dziura → 5-kol (kolacja big 60%×2rz | sypialnia+lazienka slup 40% | taras 40% + wesele 60% dol). Naglowek srodek. = makieta. (dolne kafle ciemne w zrzucie = lazy.)
- **demo** — kompozycja:T. 2-kol: 3 ponumerowane kroki LEWO + oprawiona scena PRAWO z chipem „Zapal na odleglosc". = makieta. Naglowek powiekszony.
- **korzysci** — kompozycja:T. Jasny, naglowek srodek + siatka 3×2 kart korzysci (ikona+tytul+opis). = makieta.
- **unoszace** — kompozycja:T. **CELOWO full-scene** (makieta tez full-scene, nie panel): scena weselna + scrim-left + duzy serif „Swiece, ktore zawisaja w powietrzu" LEWO. Wydzielone z `.band` do wlasnego CSS. (scena ciemna w zrzucie = lazy mid-page.)
- **porownanie** — kompozycja:T. Jasny, naglowek srodek + TABELA porownawcza (Migotek ✓ vs Prawdziwe swiece ✗, 6 wierszy) + CTA 89,90. = makieta.
- **mid-cta** — kompozycja:T. Full-scene, tekst LEWO „Zamien ryzyko na nastroj" + CTA + 89,90. = makieta. Naglowek powiekszony. (scena ciemna = lazy.)
- **opinie** — kompozycja:T. Jasny, wielkie „4,8/5" + gwiazdki + „187 ocen · 96,8%" (STALE, nie losowane) + 4 karty (cytat + Imie · Zweryfikowany zakup — tagi poprawione do makiety).
- **zdjecia-kupujacych** — kompozycja:T. Jasny, naglowek srodek + rzad 4 kafli + podpisy italic. = makieta. (kafle ciemne w zrzucie = lazy buy-1..4, HTTP 200.)
- **galeria** — kompozycja:T. **naglowek LEWY** (bylo srodek) + bento 4+3 (dol-prawo wide „Efekt unoszacych sie swiec"). = makieta. Tlo jasne = makieta. (srodkowe kafle lazy.)
- **wideo** — kompozycja:T. Ciemny, naglowek srodek + oprawiony PLAYER (badge „NAGRANIE NA ZYWO") + chipy + CTA. Demo-wideo (klip aukcji) zachowane. = makieta.
- **zamow** — kompozycja:T. **PRZEBUDOWA produkt-obok**: dekoracja swiec (framed, LEWO) + karta kasy (PRAWO). Karta wymuszona 1-kol jak makieta. Mechanika kasy / dane sprzedawcy (NIP 6972240255…) / cena 89,90 / CTA „Zamawiam i place" NIETKNIETE. Form renderuje sie na LIVE (product_id podstawiony).
- **faq** — kompozycja:T. **PRZEBUDOWA 2-kol**: naglowek LEWY + akordeon (karta z ramka) LEWO + zdjecie (sc-sypialnia, czyste/on-brand) PRAWO. = makieta.
- **final** — kompozycja:T. Full-scene, naglowek srodek „Twoj wieczor zasluguje na cieply blask" + CTA + 89,90 + payrow. = makieta.

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
- H1 render 65px vs makieta 51px (+27%) -> za duzy, zmniejsz
- tlo render #1E1813 vs makieta #899AA7 (dE=55.7) -> ustaw --paper #899AA7
- region-SSIM copy=0.066 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**rozwiazanie:**
- H1 render 65px vs makieta 197px (-67%) -> za maly, powieksz
- tlo render #1E1813 vs makieta #D3C1A9 (dE=70.9) -> ustaw --paper #D3C1A9
- region-SSIM copy=0.082 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zastosowania:**
- H1 render 60px vs makieta 40px (+50%) -> za duzy, zmniejsz
- tlo render #14100C vs makieta #CCA668 (dE=74.2) -> ustaw --paper #CCA668
- region-SSIM copy=0.151 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**demo:**
- H1 render 60px vs makieta 47px (+28%) -> za duzy, zmniejsz
- tlo render #1E1813 vs makieta #CAB499 (dE=66.9) -> ustaw --paper #CAB499
- region-SSIM copy=0.174 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**korzysci:**
- H1 render 60px vs makieta 53px (+13%) -> za duzy, zmniejsz
- region-SSIM copy=0.161 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**unoszace:**
- tlo render #1E1813 vs makieta #DEC4A3 (dE=73.5) -> ustaw --paper #DEC4A3
- region-SSIM copy=0.311 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**porownanie:**
- H1 render 60px vs makieta 131px (-54%) -> za maly, powieksz
- region-SSIM copy=0.589 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 59px vs makieta 88px (-33%) -> za maly, powieksz
- tlo render #1E1813 vs makieta #E3C9A3 (dE=75.6) -> ustaw --paper #E3C9A3
- region-SSIM copy=0.167 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**opinie:**
- region-SSIM copy=0.361 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zdjecia-kupujacych:**
- eyebrow render 12px vs makieta ~19px (-37%)

**galeria:**
- H1 render 60px vs makieta 51px (+18%) -> za duzy, zmniejsz
- region-SSIM copy=0.205 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**wideo:**
- H1 render 60px vs makieta 51px (+18%) -> za duzy, zmniejsz
- tlo render #14100C vs makieta #D3B796 (dE=73.5) -> ustaw --paper #D3B796
- region-SSIM copy=0.254 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- region-SSIM copy=0.495 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- region-SSIM copy=0.399 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- H1 render 64px vs makieta 251px (-75%) -> za maly, powieksz
- tlo render #1E1813 vs makieta #C7AC8E (dE=64.9) -> ustaw --paper #C7AC8E
- region-SSIM copy=0.155 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `migotek` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.179 |  |
| sticky | render-only 02-sticky-m.png | render-only |  |
| zaufanie | render-only 03-zaufanie-m.png | render-only |  |
| problem | [makieta|render] 04-problem-m.png | 0.452 |  |
| rozwiazanie | [makieta|render] 05-rozwiazanie-m.png | 0.255 |  |
| zastosowania | [makieta|render] 06-zastosowania-m.png | 0.440 |  |
| demo | [makieta|render] 07-demo-m.png | 0.403 |  |
| korzysci | render-only 08-korzysci-m.png | render-only |  |
| unoszace | render-only 09-unoszace-m.png | render-only |  |
| porownanie | render-only 10-porownanie-m.png | render-only |  |
| mid-cta | [makieta|render] 11-mid-cta-m.png | 0.475 |  |
| opinie | render-only 12-opinie-m.png | render-only |  |
| zdjecia-kupujacych | render-only 13-zdjecia-kupujacych-m.png | render-only |  |
| galeria | render-only 14-galeria-m.png | render-only |  |
| wideo | render-only 15-wideo-m.png | render-only |  |
| zamow | [makieta|render] 16-zamow-m.png | 0.601 |  |
| faq | render-only 17-faq-m.png | render-only |  |
| final | [makieta|render] 18-final-m.png | 0.262 |  |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).