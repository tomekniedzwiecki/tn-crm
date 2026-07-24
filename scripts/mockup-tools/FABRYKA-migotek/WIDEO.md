# WIDEO — kuracja · MIGOTEK · 2026-07-24

## Materiał dostępny
- `ali_snapshot.video_url` = `https://video.aliexpress-media.com/play/u/ae_sg_item/250720418/p/1/e/6/t/10301/1100200657411.mp4`
  (1 klip aukcji). Status: **do vision-gate w F5** (poster/klatka — off-product w obie strony =
  sekcję pominąć; wypieczony obcy tekst/marka = crop albo odrzut).
- `tiktok_url` = `https://www.tiktok.com/@6892336024308777990/video/7407254119779405098`
  — WZORZEC ruchu/hooka (nie self-host bez zgody; referencja do avi_* i hero-video).

## Sekcja `wideo` (TikTok/UGC) — status MANIFESTU
Klasa DOWODOWA (bez prawa SKIP dla agenta — decyzja należy do Tomka). Protokół wyczerpania F5:
1. Pobrać `video_url`, vision-gate klatek (czy pokazuje TEN produkt: świece + różdżka, ciepły blask).
2. Jeśli on-product i czysty → self-host MP4 (poster własną klatką) → 1 kafel `wideo`.
3. Jeśli off-product/wypieczony tekst i brak czystego fragmentu → **TABELA BLOKAD `blokada-tomek`**
   (nie SKIP). Werdykt „sekcji nie będzie" wydaje wyłącznie Tomek.

## Hero-video (F5 lp_zycie)
Osobny tor: **cinemagraph** hero (Kling PRO i2v via bud-fal-proxy) — świece **migoczą** (naturalny
nośnik ruchu = idealny cinemagraph: płomień-LED pulsuje, reszta statyczna). Prompt anty-morfing:
produkt i dłoń STATYCZNE, ruch tylko migot światła + delikatny dryf cienia. Wzór: `gen-hero-zaklipek.py`.
