# ŻYCIE-RAPORT — Rozmrozik (F5 + F6 + sekcja UGC + publish) · 2026-07-23

Wdrożenie MOTION-DNA (F5), hero-video (F6) i nowej sekcji „zdjęcia od kupujących" w
`sklepy/patryk-skrzypniak/rozmrozik/index.html` + publikacja na https://ulepszek.pl/rozmrozik.
Źródło prawdy: `FABRYKA-taca/MOTION-DNA.md`. Wzorce: rozgrzewek (F5 guard/IO/will-change), mata (hero-video mount).

## A. F5 ŻYCIE (MOTION-DNA)
- **Guard reveal:** klasa `.rmz-motion` nadawana w `<head>` TYLKO gdy JS + brak reduced-motion.
  `.rmz-motion .reveal{opacity:0}` — bez JS / reduced-motion strona w 100% czytelna (brak boxa-pułapki).
- **Tokeny MOTION-DNA:** `--ease-out/-in-out/-spring`, `--dur-xs..l` (120/220/420/680), `--enter-y-m/d` (16/24).
- **Reveal:** jeden współdzielony IntersectionObserver, `once`, `will-change` nadawany tylko na czas
  animacji i zdejmowany po `transitionend` (limit budżetu). Guard `display:none|contents` → od razu `.in`.
- **Count-up „4,2 L":** locale pl-PL, threshold 0.45, 1200 ms, ease-out, ≤30 aktualizacji/s, tabular-nums,
  kończy DOKŁADNIE „4,2 L"; reduced-motion → statyczne „4,2 L".
- **Sticky-buy:** dual-gate (hero + #zamow) — chowany nad checkoutem (MOTION-DNA §sticky).
- **Hero diptych BEZ reveal** — ochrona LCP (MOTION-DNA: media dyptyku widoczne od 1. klatki).
- TOR-I (stepper 03, toggle 04) z F4 zachowane; przejścia crossfade (reduced-motion-safe), stany różne.

## B. F6 HERO-VIDEO
- Pętla `hero-loop-pp.mp4` (486 KB, 10 s ping-pong) wpięta JS-em w PRAWĄ połowę dyptyku
  (`.hr-thaw-vid` nad statycznym posterem `sc-hero-thawed.webp`; fade-in po `playing`; IO play/pause).
- Lewa połowa (ZAMROŻONE) statyczna — kontrast zimno|ciepło. reduced-motion/save-data = sam poster.
- Zero CLS (kontener = `.hr-frame`, aspect bez zmian). Gra na obu viewportach (desktop + mobile).
- Klamra tła #zamow: POMINIĘTA świadomie (ochrona czytelności formularza — opcjonalna w brief).

## C. SEKCJA „zdjęcia od kupujących" (klasa dowodowa — naprawa błędnej diagnozy F0)
- Materiał: `bud-reviews/1005011774118215/` (6 klatek). Vision-gate per klatka:
  | klatka | werdykt | powód |
  |---|---|---|
  | 5-0 | **PASS → ugc-1** | czarny moduł (kratka + panel LED), zgodny z PASZPORT |
  | 2-0 | **PASS → ugc-2** | top-down: czarna taca + perforowana płyta + kopuła (rozpakowanie) |
  | 4-0 | **PASS → ugc-3** | kabel USB-C (detal akcesoria) |
  | 0-0 | ODRZUT | wariant BIAŁY — sprzedajemy czarny (ryzyko niezgodności) |
  | 1-0 | ODRZUT | ściana brandu KAYUSO, blistry, hala magazynowa |
  | 3-1 | ODRZUT | pudełko z claimem „PLASMA LOCK FRESHNESS" (obca marka + nieuczciwy claim) |
- Rehost: `bud-assets/rozmrozik/assets/ugc/ugc-{1,2,3}.webp` (WebP q80, 11.9 / 15.7 / 9.6 KB — ≤120 KB).
  KAYUSO wycięty crop-em (fragmenty filmu sub-legible na tle — nieczytelne jako marka). ZERO ocen/liczb.
- Skórka w tokenach Rozmrozika (lodowy błękit, `#E8590C`, radius 12/8, Zilla Slab); podpis „Wariant czarny".
- Miejsce: po sekcji wideo (06), przed mid-cta (06b).

## D. TEST-PLAN (MOTION-DNA, 1280×800 + 390×844) — 10/10 PASS
1. **TOR-I SSIM** (crop dynamiczny, <0.9): jd place↔cover 0.606 · cover↔touch 0.615 · place↔touch 0.575 ·
   pj steki↔ryba 0.407 — wszystkie PASS (patrz `ssim.txt`). Stany kompletne po przełączeniu.
   Odporność: 12 szybkich klików steppera / 13 toggle → ostatni wybór wygrywa, 1 aktywny panel, brak martwej klatki.
2. **Reveal-audyt:** `.reveal:not(.in)` = 0 (desktop i mobile po pełnym scrollu). (`display:contents` pj-media → obsłużone).
3. **Count-up:** kończy „4,2 L" (locale pl); reduced-motion od razu „4,2 L".
4. **Sticky-buy:** ukryty na hero → widoczny w środku → ukryty na #zamow (dual-gate); position:fixed → 0 CLS.
5. **Konsola:** 0 błędów/warningów (desktop + mobile + live).
6. **H-scroll:** `scrollWidth == innerWidth` na 390 (overflow to kontrolowany rail wideo wewn. `.vid__grid`).
7. **CLS:** 0.0000 (PerformanceObserver, pełny scroll z animacjami + hero-video).
8. **FPS:** animujemy tylko transform/opacity, will-change zdejmowany po transitionend — brak long-tasków z animacji.
9. **Reduced-motion:** `.rmz-motion` NIE nadana → treść od razu widoczna (opacity 1); count-up statyczny;
   hero-video NIE montowany (poster); TOR-I W PEŁNI funkcjonalny.
10. **LL-052:** CTA hero → scroll do `.zc-form` (formTop=0); checkout NIETKNIĘTY (`data-zc-api` ×2 na `.zc-checkout`).

## E. PUBLISH (⛔ bez ensure_product)
- `platform-sync publish 448f2395-… rozmrozik --file …/index.html`
- DOWÓD: https://ulepszek.pl/rozmrozik → HTTP 200, 205566 B, runtime product_id TAK, noindex ZDJĘTY.
- Weryfikacja live: hero-loop-pp.mp4 ×1 · data-zc-api ×2 · id="zdjecia" · ugc-1.webp · product_id 60215… ×2 ·
  noindex 0 · **kasa https://ulepszek.pl/checkout?p=rozmrozik → HTTP 200**. Smoke live: 0 konsoli, hero-video gra,
  checkout data-zc-product = realny UUID. Wypchnięte razem: 27 poprawek F7.1 + hotfix kasy + F5 + F6 + UGC.

## Dowody (pliki)
- `shots/jd_{place,cover,touch}_1280.png` · `shots/pj_{steak,fish}_1280.png` (stany TOR-I → SSIM)
- `shots/hero_video_1280.png` · `shots/hero_390.png` (hero + wideo prawej połowy dyptyku)
- `shots/zdjecia_1280.png` · `shots/zdjecia_390.png` (nowa sekcja desktop + mobile)
- `shots/hero_reduced-motion_1280.png` (poster bez animacji)
- `ssim.txt` (wartości SSIM par stanów)
