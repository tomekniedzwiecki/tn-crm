# ŻYCIE (F5) — Brzuszek · raport

Landing: https://ulepszek.pl/brzuszek · kod: `sklepy/patryk-skrzypniak/brzuszek/index.html`
Źródło: `FABRYKA-merach/MOTION-DNA.md`. Test: Playwright (Chromium 145), 1280×800 + 390×844.
Dowody surowe: `test-results.json`, `ssim-results.json`, screenshoty stanów w tym katalogu.

## Wdrożone (per pozycja MOTION-DNA)

- **Tokeny** `--dur-xs/s/m/l` (120/180/320/560), `--ease-out/standard/in-out/spring`; `--mo-dist` 16→24 px @≥900.
- **Scroll-reveal** — jeden współdzielony IO; stan startowy TYLKO gdy `html.mo` (guard: IO + brak reduced-motion,
  ustawiany w `<head>` przed paintem). Bez JS/IO/reduced-motion nic nie jest ukryte. once + `unobserve`. Stagger
  70/90 ms (mobile/desktop), cap 270 ms, w obrębie partii wejścia. Odporność na „minięcie górą" (bez sierot).
- **Count-upy** — `5` (650 ms) / `2` (560 ms, +90 ms), próg 0.55, start +320 ms; `≈200 kg` (1100 ms, próg 0.55,
  prefix/suffix statyczne, bez overshootu). `tabular-nums` + `min-width` (3ch dla 200) = brak CLS. Hidden-tab → finał.
- **Sticky-buy** — translateY(calc(100%+16px))+opacity, wejście spring/320, wyjście standard/180; pokaz dopiero gdy
  hero całkowicie powyżej viewportu (stabilne 120 ms) i `#zamow` poniżej; chowany od wejścia `#zamow` przez checkout+final;
  `env(safe-area-inset-bottom)`; fixed = zero CLS. Sterowanie geometryczne (rAF-throttle) — deterministyczne.
- **Sygnatura `.reps`** — 5 segmentów `scaleX(0→1)`+`opacity .35→1`, origin left, stagger 60 ms (seria 420 ms), 5. segment
  akcent `--cta` (kolor nieanimowany), osobny IO próg 0.35, gra raz.
- **TOR-I stepper** — mechanika nietknięta; dopieszczone przejścia (callout opacity `--ease-standard`, aktywny dot scale 1.14).
- **TOR-I toggle** — thumb `translateX(0↔100%)` (spring), etykiety opacity .56↔1, overlay stanu „Trudniej" na scenie
  (opacity 0↔.12 przez `:has()`); logika `aria-selected` nietknięta.
- **FAQ** — natywny `<details>` (wysokość NATYCHMIAST, usunięta animacja height); chevron 180 ms, opacity odpowiedzi 160 ms,
  tap-scale nagłówka.
- **Hero** — scena LCP widoczna od 1. paintu (bez opacity/transform/clip); karta = opacity + `clip-path` (bez translate).
- **Checkout `#zamow`** — tylko subtelne wejście wrappera (opacity 240 ms), zero staggeru dzieci; logika NIETKNIĘTA. LL-052 działa (smooth, reduced → instant).
- **Mikrointerakcje** — CTA hover gated `hover:hover` (bez „zawieszonego" hoveru na touch), press/release spring;
  fokus-ring 3px/offset 3px. Pola checkoutu bez zmian.
- **Reduced-motion** — pełna treść bez ruchu; county/`.reps`/reveale od razu finalne; sticky bez transformacji czasowej.
- **Budżet** — animowane wyłącznie transform/opacity (+ jednorazowy clip-path karty hero); `will-change` niestosowany na stałe.

## TEST-PLAN — wyniki (1280 / 390)

- TOR-I: dokładnie **1 aktywny krok + 1 aktywny callout** w każdym z 3 stanów (oba viewporty). ✔
- Reveal-audyt: po pełnym scrollu **0 elementów `reveal:not(.in)`, 0 elementów opacity<0.05**. ✔ (bez JS/reduced → wszystko widoczne)
- Count-upy: kończą dokładnie na **5 / 2 / 200** (oba viewporty; reduced-motion → od razu finał). ✔
- Sticky-buy (390): ukryty na górze (hero widoczny) → **pokaz mid-page** (hero poza, przed `#zamow`) → **ukryty na `#zamow`** → ukryty na górze po powrocie. ✔ (desktop: `display:none` wg makiety)
- LL-052: klik CTA → `.zc-form` `inView:true`, top≈76. ✔ (na live formularz widoczny; w lokalnym preview `display:none` bo brak `product_id` — wymuszony do testu)
- Konsola: **0 błędów, 0 pageerror** (d / m / reduced). ✔
- H-scroll @390: **overflow 0** (cała strona + nowa sekcja). ✔
- Reduced-motion: pełna treść dostępna, county finalne, FAQ otwiera natychmiast. ✔

### SSIM stanów (RGB multichannel)

- **Toggle (region stanu, `.rg-actions`): d=0.711 · m=0.682 → <0.90 PASS.** (thumb + etykiety + helper + overlay)
- Toggle full-wrap (obraz+liczby+toggle): d=0.957 · m=0.947 — zdominowane niezmiennym obrazem profilu.
- Stepper „jak-cwiczysz" = **single-image click-tablist** (jedna makieta packshotu + 3 callouty; NIE scena-swap). SSIM
  zdominowany niezmienną strukturą (grid d≈0.98; mobilny 1↔2 i 1↔3 = 0.84 PASS, 2↔3 = 0.98). Wg **doktryny F7.1
  (LEDGER: „SSIM = informacyjny; progi nieosiągalne strukturalnie")** gate wierności stanu = semantyka: dokładnie 1
  aktywny krok + 1 callout (zweryfikowane 1280+390), nie SSIM. Zwiększenie różnicy wymagałoby ciemnego tła
  (⛔ zakaz) lub nowej grafiki (⛔ zakaz) — świadomie pominięte.

## Rozszerzenie 23.07

- **Hero-video** — `hero-loop-pp.mp4` (1070 KB) w slocie `.hr-video-inject`; poster = obraz `sc-hero` (zero CLS/FOUC),
  fade-in po `playing`, IO pauza poza viewportem, reduced-motion/save-data → sam poster. Test: `paused:false`, `.on`,
  `currentTime` rośnie (d/m); reduced → `videoMounted:false`, `posterVisible:true`. ✔ Wideo NIE dostaje `.reveal`/transform.
- **Sekcja `zdjecia-kupujacych` (5b)** — między `wideo` a `wiele-partii`. Vision-gate 9 klatek `bud-reviews/1005010132139175`:
  - `0-0`, `1-1` — wariant **NIEBIESKI** → ODRZUT (niezgodny z paszportem biało-róż).
  - `2-0` — biało-róż OK, ale **już użyta w składaniu** → bez duplikatu.
  - `3-1` — pełny produkt w domu OK, ale widoczne **MERACH** (retusz smużył) → ODRZUT.
  - `4-2` — konsola LCD; **wybrana** po kadrze (0,0,540,560) usuwającym logo MERACH → `ugc-1`.
  - `5-0` — rozpakowanie w kartonie; **wybrana** → `ugc-3`.
  - `6-1` — części flat-lay OK (rezerwa, niewykorzystana).
  - `7-2` — U-kształtny wałek makro; **wybrana** → `ugc-2`.
  - `8-3` — wspornik z zarysowaniem → pominięta (słaba).
  - Wybrane 3 (różnorodne, bez twarzy/marek/ocen): rehost `bud-assets/brzuszek/assets/ugc/ugc-1..3.webp` (WebP q80, 12–14 KB).
  - Skórka wg TOKENS (lila-mgła, radius 24/12), podpis „zdjęcia od kupujących", ZERO ocen/gwiazdek/liczb.
  - Test: sekcja obecna, 3/3 obrazy `loaded`, brak h-scroll (1280+390), UGC 200.
- Manifest: dopisana poz. `5b` w `PLAN.md`; wpis w `LEDGER.md` („Naprawa 23.07").

## Re-publish

- `platform-sync publish 448f2395… brzuszek --file …` (BEZ ensure_product) → **HTTP 200, 215 941 B, product_id: TAK, noindex ZDJĘTY**, build `574dd6bb746d`.
- Live: `data-zc-api` na `.zc-checkout` ✔ · `data-zc-product`=`6dd560cf-…` ✔ · token `--dur-m:320ms` ✔ · `hr-video-inject`+`hero-loop-pp.mp4` ✔ · sekcja `zdjecia-kupujacych`+3× `assets/ugc/` ✔.

## Problemy / uwagi

- TPAY nietknięty; checkout (logika/timeouty/walidacja/submit) NIETKNIĘTE — tylko wejście wrappera + istniejące fokus-ringi.
- Nie ruszano `rozmrozik/` ani `rozgrzewek/` (agenty równoległe).
- Stepper SSIM<0.90 nieosiągalny strukturalnie bez łamania zakazów (ciemne tło / nowa grafika) — gate = semantyka (zgodnie z doktryną F7.1).
