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
