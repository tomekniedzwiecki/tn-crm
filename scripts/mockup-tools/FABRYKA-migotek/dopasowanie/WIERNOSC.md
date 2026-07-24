# WIERNOŚĆ — MIGOTEK · F7.1 · 2026-07-24

Dowód wierności: (a) produkt na scenach 1:1 z PASZPORT.md, (b) strona 1:1 ze scenami/kartą,
(c) żywy render zweryfikowany GESTALT-em (świeże oko, 3 viewporty).

## ⚠️ ODSTĘPSTWO OD TORU MAKIET (świadome, LEDGER + gate `dopasowanie`)
Standardowy F7.1 = kompozyty makieta↔render per sekcja (SSIM). Ten landing NIE ma pełnostronicowych
makiet — tor makiet gpt-image (wf2-gen) był NIEDOSTĘPNY (brak WF2_GEN_SECRET, 403). Pivot: **9 scen
produkcyjnych fal nano-banana-pro** = jednocześnie makieta i grafika. Dlatego „dopasowanie" mierzymy
**wiernością żywego renderu do scen + Karty**, a proof = **weryfikacja GESTALT live** (subagent
visual-verify, Playwright, 390/768/1280), nie kompozyty makieta-diff. Gate `dopasowanie` (kompozyty
NN-*.png) pozostaje FAIL — to znany skutek odstępstwa, nie defekt strony.

## Wierność PRODUKTU per grafika (PASZPORT → sceny) — vision-gate _SHEET.png
| Grafika | Produkt wierny? | Uwaga |
|---|---|---|
| sc-hero-d.webp | T | świece soplowe + różdżka bursztynowy grot; dłoń bez twarzy; zero drift |
| sc-hero-m.webp | T | pion; jw.; scrim-safe dół |
| sc-problem.webp | T (real) | REALNA świeca (wosk+dym) — „stary sposób", BEZ produktu (poprawne) |
| sc-kolacja.webp | T | smukłe białe świece + wino; ciepły migot |
| sc-sypialnia.webp | T | świece + książka; brak ognia/kabla |
| sc-lazienka.webp | T | świece na brzegu wanny; brak drift |
| sc-taras.webp | T | świece na stole ogrodowym; różdżka |
| sc-mid.webp | T | klaster świec; ciemne pole pod CTA |
| sc-final.webp | T | świece nad kominkiem; różdżka; domknięcie |
Wszystkie z ref g0 + zamek anty-drift: smukła biała świeca, ciepły grot LED, czarna różdżka. 9/9
wierne, zero dorobionych cech (brak realnego ognia/wosku/kabli/marki na produkcie).

## Wierność STRONY (żywy render, GESTALT 2026-07-24)
Weryfikacja live https://sprytko.pl/migotek (visual-verify, 3 viewporty) — werdykt **GESTALT CZYSTY**:
- 16/16 sekcji renderuje poprawnie; wszystkie tła scenowe załadowane; zdjęcia kupujących + galeria OK.
- Hero-video odtwarza się (readyState 4, currentTime rośnie, klatki się różnią), poster ustawiony,
  dark-fallback bez białego błysku.
- 0 błędów konsoli, 0 nieudanych requestów, **0 poziomego scrolla** @390/768/1280.
- CTA → #zamow; sticky-buy na mobile/tablet; checkout-inline 4-kroki (89,90 + 9,99 + COD = 99,89 zł).
- Diakrytyki poprawne; brak „TAILI"; cena 89,90 zł spójna (7×).
- Jedyny placeholder: dane sprzedawcy/NIP w stopce kasy (znana blokada klienta — nie blokuje go-live).

## Wierność DANYCH (Karta → copy)
Anty-mismatch: każdy claim zakotwiczony (patrz PLAN §anty-mismatch). Baterie = „do dokupienia"
(nagłówek) + „~13× AAA wg opinii" (FAQ). Opinie 4,8/187 1:1. Zero zmyślonych liczb/specs.
