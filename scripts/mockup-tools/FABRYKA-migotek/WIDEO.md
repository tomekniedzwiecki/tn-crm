# WIDEO — kuracja · MIGOTEK · 2026-07-24

## Materiał dostępny
- `ali_snapshot.video_url` = `https://video.aliexpress-media.com/play/u/ae_sg_item/250720418/p/1/e/6/t/10301/1100200657411.mp4`
  (1 klip aukcji; 32 s, 640×360 16:9, h264+aac). Status: **✅ UŻYTY (F5.3, 2026-07-24)** — patrz werdykt niżej.
- `tiktok_url` = `https://www.tiktok.com/@6892336024308777990/video/7407254119779405098`
  — WZORZEC ruchu/hooka (nie self-host bez zgody; referencja do avi_* i hero-video).

## videos_curated — WERDYKT VISION-GATE (F5.3, 2026-07-24)
Klip aukcji przeszedł vision-gate **WARUNKOWO → PASS PO PRZYCIĘCIU**. Klatki 0/3/6/9/12/15/18/21/24/27/30 s
+ granice (1.5/2/7/7.5/8/8.5/25/26/28/29 s) obejrzane:
- **ON-PRODUCT: TAK.** Te same świece LED (białe smukłe „taper", wiszące na żyłce, ciepły bursztynowy
  migot) + różdżka-pilot w akcji: ok. 27 s dłoń unosi różdżkę i macha nad zestawem, ~29–31 s świece
  gasną jedna po drugiej (dowód sterowania pilotem). Zgodne z produktem.
- **WHITE-LABEL: czysty od marki** (zero logo). JEDYNA skaza = **wypalony ANG napis-caption**
  („Light On / Candle Flickering / Turn ON / Turn OFF / …Timer") na lewej krawędzi **tylko w oknie
  ~2,0–7,7 s** (opis funkcji różdżki). „Green leaf" w tle = **rekwizyt** (obraz w ramce na regale),
  nie overlay → OK.
- **Jakość:** ostry na tyle, poziomy 16:9, ciepła scena, bez PiP/znaku wodnego/rozmycia.
- **DECYZJA:** przyciąć czysty ogon **8,5 → 30,5 s (22 s)** = blask → demo różdżki → gaśnięcie, ZERO
  napisu. Przycięcie temporalne (nie crop) usuwa całą skazę. Klatki wyjściowe (poster/v-start/v-wand/
  v-off) potwierdzone czyste.

## Osadzenie (F5.3)
- Skrypt: `gen-demo-migotek.py` (ffmpeg, wzór gen-hero-zaklipek.py). Self-host:
  `bud-assets/migotek/video/demo.{mp4,webm}` (~2,0/2,1 MB) + `demo-poster.webp` (poster = 1. klatka okna).
- Sekcja `<section id="wideo">` „Zobacz w akcji" (dark, bursztyn, Fraunces+Inter), między `galeria`
  a `zamow` (wg MANIFESTU). muted+loop+playsinline, lazy IntersectionObserver, reduced-motion/save-data
  = statyczny poster. Manifest F5: `wideo` przełączony `blokada-tomek → build`.
- Koszt API: **$0** (ffmpeg lokalnie; brak generacji).

## Protokół (historyczny) — wyczerpanie F5
Klasa DOWODOWA (bez prawa SKIP dla agenta). 1) vision-gate klatek; 2) on-product+czysty → self-host;
3) off-product/wypieczony napis bez czystego fragmentu → `blokada-tomek` (werdykt „sekcji nie będzie" =
Tomek). Tu: czysty fragment ISTNIAŁ → ścieżka (2) z przycięciem.

## Hero-video (F5 lp_zycie)
Osobny tor: **cinemagraph** hero (Kling PRO i2v via bud-fal-proxy) — świece **migoczą** (naturalny
nośnik ruchu = idealny cinemagraph: płomień-LED pulsuje, reszta statyczna). Prompt anty-morfing:
produkt i dłoń STATYCZNE, ruch tylko migot światła + delikatny dryf cienia. Wzór: `gen-hero-zaklipek.py`.
