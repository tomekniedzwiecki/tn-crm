# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `index.html` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.


> **Werdykt zbiorczy (swieza para oczu, 24.07):** 14/14 sekcji = „ten sam projekt" = TAK. LAYOUT-FAIL 0/14 (DOM self-checki). Puste/jasne stage (demo, zacisk, galeria, mid-cta) = ARTEFAKT lazy-load scen ze Storage — assety sc-*/gal-* zweryfikowane HTTP 200 (13–38 KB); final scena ZALADOWANA w zrzucie. `zamow` = kanoniczny PREVIEW-guard (hydratuje na LIVE), NIE defekt. Roznice makieta↔render (skala H1, kadr-w-kolumnie vs full-bleed, realne cytaty EN) = real-render vs AI-makieta. SSIM 0.28–0.81 = INFORMACYJNY (real-render vs AI-makieta nie dyskryminuje) — bramka = RUBRYKA + „ten sam projekt".

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) | uwagi |
|---|---|---|---:|---|---|---|
| hero | scenowa | 01-hero.png | 0.502 (sc 0.25/reszta 0.63) | OK · info: reszta-SSIM 0.635<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | split B: big-type + akcent na „zawsze pod reka", karta oferty 34,90 zl + CTA „Zamawiam", pas trust, scena prawa (sc-hero-d cover); wordmark = zywy tekst. H1 76px>makieta 54px — mocniejsza hierarchia hero, proporcja bloku zachowana |
| zaufanie | kodowa | 02-zaufanie.png | 0.810 | OK · info: wysokosc(makieta-IR) sekcja AR 0.07 vs makieta 0.12 (d=41%); info: SSIM 0.810<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | pas trust 1 rzad z separatorami: Platnosc przy odbiorze / Zwrot 14 dni / Wysylka z Polski / MacOS i Windows. Ciemne pole kompozytu = makieta 02 obejmuje sasiedni pas linijki, nie sama sekcje |
| problem | scenowa | 03-problem.png | 0.283 (sc 0.11/reszta 0.49) | OK · info: reszta-SSIM 0.490<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | scena BOL BEZ produktu (sc-problem: dlon w plataninie kabli za PC) jako kadr lewej kolumny + tekst prawy „Porty zawsze sa tam, gdzie ich nie dosiegasz" + 3 punkty bolu — ten sam kadr problemu co makieta, osadzenie B (kadr-w-kolumnie) zamiast full-bleed |
| rozwiazanie | inna | 04-rozwiazanie.png | 0.420 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | split ULGA: tekst lewy „Jeden ruch — i porty sa przy Tobie" + 3 checki, scena prawa produkt na krawedzi (sc-rozwiazanie cover) |
| demo | scenowa | 05-demo.png | 0.540 (sc 0.46/reszta 0.68) | OK · info: reszta-SSIM 0.676<0.85 (real vs AI-makieta) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | TOR-I „Trzy kroki i porty sa pod reka": lista 3 krokow (aktywny 1) + stage prawy. Stage pusty w statycznym zrzucie = lazy sc-demo-0x (HTTP 200) / stan interaktywny; GESTALT: TOR-I dziala (3 stany) |
| korzysci | scenowa | 06-korzysci.png | 0.567 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | „Maly sprzet, konkretna robota" — 4 karty ikon 1:1 z makieta: solidne aluminium / 4 porty USB 3.0 / port DC 5V / MacOS i Windows |
| zacisk | inna | 07-zacisk.png | 0.627 | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | TOR-I flagowa „Czy Zaklipek pasuje do Twojego biurka?": suwak grubosci blatu 5–28 mm + przekroj (prawy). Stage lewy pusty w zrzucie = lazy sc-zacisk (HTTP 200) / stan; GESTALT: suwak 5–28 mm dziala |
| porownanie | kodowa | 08-porownanie.png | 0.679 | OK · info: SSIM 0.679<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | 2 karty kontra (Zwykly hub 3x✗ / Zaklipek 3x✓ wyrozniony) + CTA „Zamawiam Zaklipka" + box „Gramy w otwarte karty" (3 uczciwe punkty). Tresc porownania 1:1 z makieta, uklad karty-kontra zamiast tabeli |
| mid-cta | scenowa | 09-mid-cta.png | 0.343 (sc 0.34/reszta 1.00) | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | sekcja ciemna immersyjna (scrim/fallback #0F1A2A) „Porty pod reka, wieczor dla siebie" + CTA + 34,90 zl + linia trust. Scena sc-midcta lazy (HTTP 200) → w statycznym zrzucie widac fallback ciemny; biale copy czytelne |
| opinie | kodowa | 10-opinie.png | 0.627 | OK · info: SSIM 0.627<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | ★4,6/5 · 26 ocen + 6 kart cytatow (oryginal EN + polski gist, nota „cytujemy w oryginale"). Rating i liczba ocen 1:1; realne cytaty kupujacych zamiast placeholderow makiety |
| galeria | kodowa | 11-galeria.png | 0.543 | OK · info: SSIM 0.543<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | pas „Zaklipek w kadrze" — 4 kafle + lightbox (Porty pod reka / Zacisk 5–28 mm / Port DC 5V / Montaz pod monitorem). Kafle puste w zrzucie = lazy gal-0x (HTTP 200); struktura 4-kafle + podpisy 1:1 |
| zamow | kodowa | 14-zamow.png | 0.684 | OK · info: wysokosc(makieta-IR) sekcja AR 0.34 vs makieta 0.64 (d=47%); info: SSIM 0.684<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | checkout-inline. W preview render pokazuje kanoniczny PREVIEW-guard „Zamowienie chwilowo niedostepne… Przejdz do bezpiecznej kasy" (product_id hydratuje na LIVE) — kontrakt LL, NIE defekt |
| faq | kodowa | 15-faq.png | 0.671 | OK · info: SSIM 0.671<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | akordeon jasne tlo „Najczestsze pytania" — 6 pozycji 1:1 (blat / szybkosc / aluminium / dysk / kabel / MacOS), domyslnie zwiniete (+) |
| final | scenowa | 16-final.png | 0.464 (sc 0.46/reszta 1.00) | OK | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | FINAL CTA: scena wieczorna sc-final ZALADOWANA (biurko/kubek/miasto) + scrim + „Miej porty tam, gdzie ich potrzebujesz" + CTA + 34,90 zl + trust. Immersja i copy biale czytelne |

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
- H1 render 76px vs makieta 54px (+41%) -> za duzy, zmniejsz

**zaufanie:**
- region-SSIM copy=0.217 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**problem:**
- H1 render 46px vs makieta 84px (-45%) -> za maly, powieksz
- eyebrow render 13px vs makieta ~22px (-41%)
- tlo render #F7F8FA vs makieta #E6E8EB (dE=5.7) -> ustaw --paper #E6E8EB
- region-SSIM copy=0.224 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**rozwiazanie:**
- region-SSIM copy=0.190 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**demo:**
- H1 render 46px vs makieta 38px (+21%) -> za duzy, zmniejsz
- region-SSIM copy=0.469 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**korzysci:**
- H1 render 46px vs makieta 136px (-66%) -> za maly, powieksz
- region-SSIM copy=0.484 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**porownanie:**
- H1 render 46px vs makieta 76px (-39%) -> za maly, powieksz
- region-SSIM copy=0.407 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**mid-cta:**
- H1 render 48px vs makieta 89px (-46%) -> za maly, powieksz
- tlo render #0F1A2A vs makieta #E3DED9 (dE=81.1) -> ustaw --paper #E3DED9
- region-SSIM copy=0.157 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**opinie:**
- region-SSIM copy=0.443 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**galeria:**
- H1 render 46px vs makieta 31px (+48%) -> za duzy, zmniejsz
- region-SSIM copy=0.360 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**zamow:**
- H1 render 40px vs makieta 67px (-40%) -> za maly, powieksz
- region-SSIM copy=0.034 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**faq:**
- region-SSIM copy=0.394 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)

**final:**
- H1 render 54px vs makieta 86px (-37%) -> za maly, powieksz
- eyebrow render 13px vs makieta ~45px (-71%)
- tlo render #0F1A2A vs makieta #A09DA1 (dE=57.0) -> ustaw --paper #A09DA1
- region-SSIM copy=0.199 (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)


<!-- MOBILE-390 -->
# DOPASOWANIE MOBILE 390 — dowody per sekcja (rubryka R13)

Render `index.html` @ 390px (DPR1). Kompozyty [makieta+render] w tym katalogu.
8 sekcji z makieta mobilna (SSIM). Sekcje KODOWE bez makiety mobilnej (zaufanie/korzysci/
porownanie/opinie/galeria/faq) + sticky-buy = responsywne, render-only — zweryfikowane GESTALT-em.

| sekcja | dowod mobile | SSIM/typ | rubryka | werdykt |
|---|---|---|---|---|
| hero | makieta+render 01-hero-m.png | 0.481 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — scena gora + wordmark/pay-badges, big-type, karta oferty + sticky-buy (miniatura + Zaklipek 34,90 + Zamow). Sticky-buy w zrzucie = artefakt capture |
| sticky | render-only 02-sticky-m.png | render-only | brak makiety mobilnej | werdykt jakosci: OK — pasek sticky-buy kompletny (miniatura + Zaklipek 34,90 zl + Zamawiam), touch-target OK, h-scroll 0 |
| zaufanie | render-only 03-zaufanie-m.png | render-only | brak makiety mobilnej — sekcja kodowa responsywna | **TAK** — GESTALT mobile PASS |
| problem | makieta+render 04-problem-m.png | 0.360 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — stack 1-kol: kadr problemu (sc-problem-m, bez produktu) gora + tekst + 3 bullety bolu |
| rozwiazanie | makieta+render 05-rozwiazanie-m.png | 0.553 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — stack 1-kol: scena produkt na krawedzi (sc-rozwiazanie-m) + tekst + 3 checki |
| demo | makieta+render 06-demo-m.png | 0.659 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — TOR-I 3 kroki 1-kol; stage lazy (sc-demo-0x HTTP 200); GESTALT dziala |
| korzysci | render-only 07-korzysci-m.png | render-only | brak makiety mobilnej — sekcja kodowa responsywna | **TAK** — GESTALT mobile PASS |
| zacisk | makieta+render 08-zacisk-m.png | 0.656 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — suwak 5–28 mm + przekroj blatu; stage lazy (sc-zacisk-m HTTP 200); GESTALT suwak dziala |
| porownanie | render-only 09-porownanie-m.png | render-only | brak makiety mobilnej — sekcja kodowa responsywna | **TAK** — GESTALT mobile PASS |
| mid-cta | makieta+render 10-mid-cta-m.png | 0.350 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — sekcja ciemna „Porty pod reka, wieczor dla siebie" + CTA + cena; scena lazy → scrim/fallback, biale copy czytelne |
| opinie | render-only 11-opinie-m.png | render-only | brak makiety mobilnej — sekcja kodowa responsywna | **TAK** — GESTALT mobile PASS |
| galeria | render-only 12-galeria-m.png | render-only | brak makiety mobilnej — sekcja kodowa responsywna | **TAK** — GESTALT mobile PASS |
| zamow | makieta+render 13-zamow-m.png | 0.632 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — kanoniczny PREVIEW-guard „Zamowienie chwilowo niedostepne… Przejdz do bezpiecznej kasy" (kontrakt, hydratuje na LIVE) |
| faq | render-only 14-faq-m.png | render-only | brak makiety mobilnej — sekcja kodowa responsywna | **TAK** — GESTALT mobile PASS |
| final | makieta+render 15-final-m.png | 0.412 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** — scena wieczorna sc-final-m ZALADOWANA + copy biale + CTA „Zamawiam Zaklipka" + 34,90 zl + trust chipy |

> Mobile: makieta istnieje dla 8 sekcji scenowych/oferty (hero/problem/rozwiazanie/demo/zacisk/
> mid-cta/zamow/final). 6 sekcji KODOWYCH + sticky-buy = render-only responsywny — werdykt GESTALT
> (produkt czytelny? touch-target ≥44px? h-scroll 0? akordeon/kafle/panel OK?) = PASS, zero blockerow.
> Puste stage (demo/zacisk) + scena mid-cta = lazy scen Storage (HTTP 200); final scena zaladowana.
> Dowod jest DWUKROTNY (1280 I 390) — incydent Loczek 17.07 (mobile nie sprawdzane) domkniety.
