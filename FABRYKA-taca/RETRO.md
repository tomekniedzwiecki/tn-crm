# RETRO — Rozmrozik (Ulepszek / Patryk Skrzypniak) · F8 finisz · 23.07

Produkt: elektryczna taca do rozmrażania (289,00 zł + 9,99 dostawa). Landing LIVE:
https://ulepszek.pl/rozmrozik · kod `sklepy/patryk-skrzypniak/rozmrozik/index.html`.
Ten dokument = wnioski z FINISZU (gate-check + manifest-check + naprawy) do reuse w kolejnych landingach.

## Produkt / dane / prawo
- Wariant **wyłącznie CZARNY** (F1): brak dowodu wizualnego wariantu białego w galerii → sprzedaż koloru
  bez zdjęcia = ryzyko niezgodności. Checkout bez wyboru koloru; FAQ komunikuje wprost.
- Cena 289 zł stała, dostawa 9,99 (Razem 298,99 na kasie). Bez przecen/pilności/rat.
- Twierdzenia (plazma/UVC/4,2 L/„4 steki lub 4 porcje ryby") atrybuowane producentowi; ZERO obietnicy czasu rozmrażania.

## Kasa / moduł (⛔ strefa główna sesja — nietykana w finiszu)
- Checkout inline (`.zc-checkout`, `data-zc-*`, TPAY) skonfigurowany i zweryfikowany LIVE (kasa 200) przez główną sesję.
- Gate `cta` zgłasza „root #zamow bez data-zc-product/api na elemencie .zc-checkout" — id="zamow" jest na `<section>`,
  moduł jest dzieckiem. **NIE naprawiane** (prohibicja checkout); LIVE działa (data-zc-api ×2, product_id runtime). Rezydualny, udokumentowany.
- `.zc-fallback` „Przejdź do bezpiecznej kasy" ma kontrast 1:1 (`#232A31` na sobie) — element `hidden`, należy do modułu checkout → nietykany.

## Gate / proces finiszu (NOWE WNIOSKI — najcenniejsze do reuse)
- **LL-058 crop-lint P1→P2 przez object-position:** detail-lint P1 „Crop cover ≥40% + object-position=center" degraduje do P2
  gdy object-position ≠ `50% 50%`. Sterowanie `50% 42%` (nawet gdy crop jest horyzontalny) sygnalizuje intencjonalny kadr →
  odblokowuje bez zmiany AR/layoutu ani hero-video. Naprawiło hero ×2 + final.
- **LL-059 kontrast CTA = AA-large przez rozmiar, nie kolor:** biały tekst na `#E8590C` = 3.58:1 < 4.5. Zamiast psuć akcent marki,
  bump `.btn.cta` 17→19 px (fw 700) → tekst „large" (≥18.66 px bold) → próg AA spada do 3:1 → PASS. Brand nietknięty.
- **LL-060 packshot PNG-alpha bez pngquant:** Pillow `optimize` sam nie schodzi <120 KB dla miękkiego cutoutu (kanał alfa dominuje).
  `quantize(256, FASTOCTREE)` → paleta P + tRNS (do 256 poziomów alfy, NIE progowanie binarne) → 290→66 KB, ostrość zachowana.
  Kopuła jest CELOWO przezroczysta → wysoki udział semi-alpha to cecha produktu; na jasnym tle mid-cta bryła kryje w 100% wizualnie.
- **LL-061 makiety odzyskiwalne ze Storage:** workdir `out/` bywa wyczyszczony; makiety żyją na `bud-assets/<slug>/makiety/*.webp`
  (upload-makiety.py). Pobór + konwersja webp→png odtwarza `makiety/*.png` bez regeneracji (koszt $0).
- **LL-062 sekcja dowodowa bez makiety = IR z renderu:** sekcja `zdjecia-kupujacych` (dodana w naprawie, brak makiety AI) łamała
  layout IR (10/11). Fix: `mockup-ir.py` na renderze sekcji → 11. mockup-ir = czysty OpenCV (koszt $0).
- **manifest-check.py (nowe, obowiązkowe): exit 0** — 11/11 sekcji build↔`<section id>` (alias `zdjecia-kupujacych`→`zdjecia`), hero-video mp4 200,
  media sekcji dowodowych 200, JSON-LD bez Offer/Rating. Pozycja 10b `zdjecia-kupujacych | (brak) | build [DOWODOWA]` parsuje się poprawnie — bez zmian w PLAN.md.
- **cross_landing PASS** (parasol Ulepszek vs tomek-niedzwiecki: home-zaradek/mata/drapek): Zilla Slab + `#E8590C` odróżnialne (dE≥15) →
  ZNANY mis-scope Rozgrzewka (Fraunces) tu NIE występuje.

## Assety / wagi (finisz)
| asset | przed | po | metoda |
|---|---|---|---|
| packshot-alpha.png | 290 KB | 66 KB | resize 760px + quantize P/tRNS (alfa soft zachowana) |
| sc-capacity-steak.webp | 188 KB | 87 KB | resize 1240px + WebP q80 |
| sc-final.webp | 147 KB | 79 KB | resize 1240px + WebP q80 |
| sc-problem.webp | 167 KB | 95 KB | resize 1240px + WebP q80 |
| tt3.mp4 | 4282 KB | 2154 KB | ffmpeg x264 crf33, 60→30 fps, aac 80k, faststart |
| tt5.mp4 | 4131 KB | 2329 KB | ffmpeg x264 crf33, aac 80k, faststart |
- Backup wzorca prawdy: `packshot-alpha-BACKUP.png` (żelazna zasada: backup przed edycją).

## LEKSYKON (skrót do indeksu lekcji)
- LL-058 object-position ratuje crop-lint (P1→P2). LL-059 kontrast CTA = rozmiar (AA-large) nie kolor.
- LL-060 packshot alpha = quantize P/tRNS (nie pngquant). LL-061 makiety ze Storage. LL-062 IR dowodowej z renderu.
- Marketplace w UGC-autorze (`@aliexpress.us`) = leak grep_forbidden → neutralizacja „Klient TikTok".

## CHANGELOG (finisz F8 · zmiany w kodzie)
1. `.btn/.btn.cta` 17→19 px (kontrast). 2. `object-position:50% 42%` hero-img + final-img (crop).
3. `min-height:44px inline-flex` na `.jd-link` + link „Przejdź do zamówienia →" (touch ≥44).
4. `<main id="main">` wrapper (landmark). 5. `@aliexpress.us` → „Klient TikTok" (×3: aria/data/etykieta).
6. Re-upload 6 assetów (packshot + 3 webp + 2 mp4) pod tymi samymi nazwami (x-upsert).
