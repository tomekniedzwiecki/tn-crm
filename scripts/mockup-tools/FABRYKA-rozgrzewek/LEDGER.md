# LEDGER — ROZGRZEWEK

## Naprawa 23.07 (feedback Tomka): hero-video osadzone (wzorzec maty) + wynik protokołu wideo

### A) HERO-VIDEO
Hero (archetyp D) — statyczne medium sceny zamienione na ambient hero-video wzorcem
`sklepy/tomek-niedzwiecki/mata`. Materiał gotowy: `bud-assets/rozgrzewek/video/hero-loop-pp.mp4`
(547 KB, 10,08 s, h264 1764×1176 3:2, produkt statyczny — para z kubka + lampa żyją) + poster
`hero-loop-poster.webp`. Montaż JS: `<video muted loop playsinline preload=metadata>`, fade-in
klasą `.on` po `playing`, IO play/pause, guard `prefers-reduced-motion`/`save-data` → poster.
Jeden klip = brak przełącznika d/m; gra na KAŻDYM viewporcie (LL-049). Cache-bust `?v=1`.
Poster/fallback bez JS = obraz sceny pod spodem (`<picture>` sc-hero). Zero CLS (box = `.hr-image`).
Klamra tła w #zamow: NIE (świadomie — wrażliwy inline-checkout + zakaz ciemnych teł; checkout nietknięty).

### B) SEKCJA WIDEO — protokół wyczerpania (per krok)

**Krok 1 — klip F4 na dysku:** BRAK. W `FABRYKA-rozgrzewek/` nie ma żadnego mp4 (~4,4 MB) —
klip „pobrany w F4" nie persistował. Rescue na pliku niemożliwy → przejście do kroku 2.

**Krok 2 — kandydaci z bazy (TT-produkt 5e1d40a8-a351-4609-a8d7-c9492e2c6dd8):**
Tabele `bud_tt_candidates`/`ali_snapshot` NIE istnieją pod tymi nazwami; właściwe:
`bud_tt_products` (kolumna JSON `ali_snapshot`, `tt_shop`, `videos_curated`). Fakty produktu:
`videos=0`, `videos_curated=None`, `ali_snapshot.video_url=None` (brak wideo AliExpress).
W JSON (tt_shop) znaleziono 12 URL-i TikTok (główny drenażowy + 11 sklepowych). Pobrano yt-dlp
wszystkie 12 (c01–c12, 1080×1920 poza c04=720p), bramka po klatkach:
- c01 (4,58 MB, 29 s) — produkt GRANATOWY (= Rozgrzewek), ALE wypalone „INCOMING STITCH / BEFORE… /
  AFTER! 3 WEEKS OF CONSISTENT USE / FLUID JUST LIKE THIS" (before-after + claim drenażu) → dyskwalifikator.
- c02 — transformacja ciała z datami (before/after), produkt niewidoczny → FAIL.
- c03 — wypalone „…Lymphatic Massage", produkt BIAŁY → FAIL.
- c04 — karta „My arms were a huge insecurity…" (claim rezultatu) → FAIL.
- c05 — „lymphatic drainage massage" + diagram anatomii, głowica z czerwonym LED, ale claim → FAIL.
- c06 — produkt BIAŁY, kontekst drenażu brzucha → FAIL (nie granatowy).
- c07 — „This is what convinced me to try it!", produkt biały → FAIL.
- c08 — produkt GRANATOWY, ale wypalone „INCOMING STITCH"/napisy → FAIL na claimach.
- c09 — czarny PISTOLET do masażu (inny produkt) → FAIL.
- c10 — hiszpańskie wypalone promo, produkt biały → FAIL.
- c11 — „Before Lymphatic massage", produkt biały → FAIL.
- c12 — sypialnia, drobne wypalone napisy, produkt ledwo widoczny → FAIL.

**RATUNEK (c01, jedyny czysty pokaz granatowego produktu):** sekcja before/after + claim
drenażu „FLUID JUST LIKE THIS" mieści się w 0–~11 s; okno 14–26 s to CZYSTY pokaz produktu
(twarz + urządzenie trzymane przy kamerze, LED/ustawienia), z wypalonymi napisami wyłącznie na
DOLE kadru i tylko feature-caption (bez claimu zdrowotnego, bez before/after w tym oknie).
Zastosowano **trim + crop (kombinacja)**:
- TRIM: `-ss 15.0 -to 23.0` (8 s, po zakończeniu claimu drenażu i before/after).
- CROP: `crop=1080:1350:0:250` (9:16 → 4:5; wycięty dolny pasek napisów ~y1710+ oraz górna
  krawędź czoła), następnie `scale=864:1080`.
- ENC: libx264 high, yuv420p, crf 25, preset slow, `-an`, `+faststart` → **864×1080, 8 s, 1,32 MB**.
- Poster: klatka t=4 s → WebP q82, **37 KB**.
Gate OUTPUTU (4 klatki): granatowy Rozgrzewek wyraźny (rose-gold ring, niebieski LED, kopułowa
głowica), ZERO wypalonych napisów, brak before/after i claimu drenażu, realna osoba trzyma produkt,
jakość OK → **PASS UCZCIWY**.

**Wynik protokołu: BUILD** (nie BLOKADA-TOMEK). Self-host wzorcem Rozmrozika:
`bud-assets/rozgrzewek/tt/rozgrzewek-tt1.mp4` + `…-poster.webp`. Sekcja `wideo` (rail 1-kafelkowy,
wyśrodkowany) wpięta po `zdjecia-kupujacych`, spójna ze STYLE-DNA (muszla `--card`, radius 18/10,
brak akcentu poza CTA/swash). Manifest: `video: SKIP → build`.
