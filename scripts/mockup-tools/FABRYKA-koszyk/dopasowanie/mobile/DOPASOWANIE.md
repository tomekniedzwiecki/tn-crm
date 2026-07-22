

<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `odsaczek` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.421 |  |
| jeden-ruch | [makieta|render] 02-jeden-ruch-m.png | 0.437 |  |
| sticky | render-only 03-sticky-m.png | render-only |  |
| zawies | [makieta|render] 04-zawies-m.png | 0.501 |  |
| zloz | [makieta|render] 05-zloz-m.png | 0.523 |  |
| durszlak | [makieta|render] 06-durszlak-m.png | 0.497 |  |
| mycie | [makieta|render] 07-mycie-m.png | 0.558 |  |
| wideo | [makieta|render] 08-wideo-m.png | 0.385 |  |
| mid-cta | [makieta|render] 09-mid-cta-m.png | 0.429 |  |
| zamow | [makieta|render] 10-zamow-m.png | 0.626 |  |
| faq | [makieta|render] 11-faq-m.png | 0.656 |  |
| final | [makieta|render] 12-final-m.png | 0.527 |  |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).