# DOPASOWANIE — NAKRĘCIK · F7.1/F7.4 · 2026-07-24

⚠️ ODSTĘPSTWO: brak pełnostronicowych makiet (tor gpt-image = sceny produkcyjne, jednocześnie
makieta i grafika). Kompozyty makieta↔render (NN-*.png) i wiersze SSIM = **N/A** (brak makiet do
diffowania). Miara dopasowania = **wierność żywego renderu** (GESTALT live, visual-verify,
desktop 1440 + mobile 390) + WIERNOSC.md. Gate `dopasowanie` (kompozyty) pozostaje FAIL jako znany
skutek odstępstwa — NIE defekt strony (jak migotek).

## Werdykt per sekcja (żywy render, desktop 1440)
Rubryka: render zgodny ze sceną/intencją · produkt wierny · copy z Karty · layout bez defektu · czytelność. (T = tak)

| # | Sekcja | render | produkt | copy | layout | czyt. | WERDYKT |
|---|---|---|---|---|---|---|---|
| 1 | hero (TYP A) | T | T | T | T | T | PASS (scena full-bleed + hero-video gra) |
| 2 | zaufanie | T | — | T | T | T | PASS |
| 3 | problem | T | T(real) | T | T | T | PASS (bez produktu) |
| 4 | rozwiazanie | T | T | T | T | T | PASS |
| 5 | demo (TOR-I) | T | T | T | T | T | PASS (taby 1-2-3 działają) |
| 6 | zastosowania | T | T | T | T | T | PASS (mozaika 2×2, crop OK) |
| 7 | korzysci | T | T | T | T | T | PASS (ikony grafit, packshot) |
| 8 | tryby (TOR-I) | T | T | T | T | T | PASS (przełącznik orientacji) |
| 9 | porownanie | T | — | T | T | T | PASS (1 uczciwy minus) |
| 10 | mid-cta | T | T | T | T | T | PASS (dark, dark-fallback) |
| 11 | opinie | T | — | T | T | T | PASS (count-up ★4,8/187) |
| 12 | zdjecia-kupujacych | T | T | T | T | T | PASS (5 foto, podpisy VERBATIM) |
| 13 | galeria | T | T | T | T | T | PASS (lightbox działa) |
| 14 | zamow | T | — | T | T | T | PASS (checkout-inline; fallback lokalnie = OK, hydratuje po publish) |
| 15 | faq | T | — | T | T | T | PASS (akordeon) |
| 16 | final | T | T | T | T | T | PASS (dark, CTA) |

## F7.4 GESTALT (świeże oko, żywy render — visual-verify) — **WERDYKT: CZYSTY**
- Hero TYP A: scena full-bleed + **hero-video odtwarza się** (nie biała klatka); copy na scrimie
  czytelne; karta mikro-oferty 124,90 zł + CTA **nad foldem (desktop + mobile)**; pas trust; rogi
  kadru + zielona kropka REC.
- Wszystkie 16 sekcji renderują się kompletnie; interakcje działają (demo taby, tryby przełącznik,
  faq akordeon, galeria lightbox, count-up opinii, sticky-buy mobile).
- **0 błędów konsoli, 0 poziomego scrolla** (desktop 1440 + mobile 390). Obrazy ładują się.
- Emerald akcent spójny (CTA/★/REC); tło ciepła kość; Space Grotesk + Hanken Grotesk.
- `#zamow` lokalnie = fallback „Zamówienie chwilowo niedostępne" (placeholder {{WF2_PRODUCT_ID}}
  niepodstawiony) — **OCZEKIWANE**, hydratuje pełny formularz po publish. Sekcja renderuje się
  (nagłówek, packshot, cena).

## MOBILE-390 — PASS
- 0 poziomego scrolla, 0 błędów konsoli. Hero-video mobilne (hero-loop-m) + scrim + copy czytelne.
- CTA nad foldem; sticky-buy po zjechaniu z hero; mozaika 2×2 stackuje się czysto; touch-target
  nagłówka/stopki ≥44px.

## Poprawki po gate-check (przed publish)
- JSON-LD USUNIĘTY (AggregateRating = FAIL manifest-check rich-snippet; migotek też bez JSON-LD).
- `--muted` #8A8378 → #655F55 (kontrast ≥4,5:1 na wszystkich odcieniach papieru).
- Mozaika `zastosowania`: kafle „wide" (crop 63%) → 2×2 „big" (AR 1,37, crop ~27%).
- Touch-target: hero wordmark + linki stopki min-height 44px (mobile).
- P0 duplikaty usunięte: zastosowania (usunięty 5. kafel = sc-demo-3) + galeria (sc-rozwiazanie → sc-og).

## Kosmetyki store-wide (NIE blokują, odnotowane — poza tym landingiem)
- count-up opinii start 3,5→ (globalny komponent) · scrim #final plateau (heurystyka F3.1b).

## Residua gate całościowego (nie-defekty)
Tor makieta-diff: kompozyty per sekcja / IR / SSIM / pary mobile / demo-sandbox = N/A (pivot na
sceny gpt-image, brak WF2_GEN_SECRET). manifest-check + published-gate = **0 FAIL** (bramki twarde).
