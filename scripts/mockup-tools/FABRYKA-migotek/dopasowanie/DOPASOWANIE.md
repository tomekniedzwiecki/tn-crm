# DOPASOWANIE — MIGOTEK · F7.1 · 2026-07-24

⚠️ ODSTĘPSTWO: brak pełnostronicowych makiet (tor gpt-image wf2-gen niedostępny → pivot na sceny
fal). Kompozyty makieta↔render (NN-*.png) i wiersze SSIM = **N/A** (brak makiet do diffowania).
Miara dopasowania = **wierność żywego renderu** (GESTALT live, 3 viewporty) + WIERNOSC.md. Gate
`dopasowanie` (kompozyty) pozostaje FAIL jako znany skutek odstępstwa.

## Werdykt per sekcja (żywy render https://sprytko.pl/migotek, desktop 1280)
Rubryka: render zgodny ze sceną/intencją · produkt wierny · copy z Karty · layout bez defektu ·
czytelność. (T = tak)

| # | Sekcja | render | produkt | copy | layout | czyt. | WERDYKT |
|---|---|---|---|---|---|---|---|
| 1 | hero | T | T | T | T | T | PASS |
| 2 | zaufanie | T | — | T | T | T | PASS |
| 3 | problem | T | T(real) | T | T | T | PASS |
| 4 | rozwiazanie | T | T | T | T | T | PASS |
| 5 | zastosowania | T | T | T | T | T | PASS |
| 6 | demo | T | T | T | T | T | PASS |
| 7 | korzysci | T | — | T | T | T | PASS |
| 8 | unoszace | T | T | T | T | T | PASS |
| 9 | porownanie | T | — | T | T | T | PASS |
| 10 | mid-cta | T | T | T | T | T | PASS |
| 11 | opinie | T | — | T | T | T | PASS |
| 12 | zdjecia-kupujacych | T | T | T | T | T | PASS |
| 13 | galeria | T | T | T | T | T | PASS |
| 14 | zamow | T | — | T | T | T | PASS (checkout-inline działa) |
| 15 | faq | T | — | T | T | T | PASS |
| 16 | final | T | T | T | T | T | PASS |

## MOBILE-390 (Playwright 390 px, visual-verify)
- 0 poziomego scrolla (scrollWidth == innerWidth). 0 błędów konsoli.
- Hero-video mobilne (`hero-loop-m`) odtwarza; scrim + copy czytelne; mikro-oferta OK.
- Sticky-buy pojawia się po zjechaniu z hero („Migotek · 89,90 zł · płatność przy odbiorze").
- Checkout stackuje się czysto (karta → akordeon → „Razem do zapłaty").
- Kosmetyka (nie-bloker): linia zaufania w headerze zawija się do 2 linii <400 px — czytelna.
WERDYKT MOBILE-390: PASS (drobna kosmetyka headera).
