# WIDEO — KURACJA (F0) · GADULEK · 2026-07-24

## Stan materiału wideo
- **`ali_snapshot.video_url = null`** → **BRAK wideo produktu** z aukcji.
- **`tiktok_url` = @whatilovetodo/video/7649914035080662286** — okładka klipu
  (`bud-covers/7649914035080662286.jpg`) pokazuje **dziewczynkę biegnącą chodnikiem z psem na
  smyczy — produkt POZA kadrem** (off-product). Klip to hook reklamowy (ruch/emocja), **nie
  materiał dowodowy produktu**. Wg LL-044 wideo dodaje się 1:1 tylko gdy pokazuje produkt —
  tu nie pokazuje → niezdatne jako sekcja demo produktu.

## `videos_curated`
```json
{ "source_ok": false, "product_id": "1005010623173867", "curated_at": "2026-07-24",
  "items": [],
  "note": "Brak realnego wideo produktu w kadrze. ali_snapshot.video_url=null. Okladka TikTok 7649914035080662286 (@whatilovetodo) = dziewczynka z psem na chodniku, produkt poza kadrem (off-product). Sekcja wideo = klasa dowodowa (F1a) -> decyzja blokada-tomek, nie SKIP fabryki." }
```

## Decyzja dla planu (F1a — manifest)
Sekcja **wideo TikTok/UGC = klasa dowodowa BEZ prawa SKIP przez fabrykę**. Protokół wyczerpania:
brak wideo produktu (video_url null) + jedyny klip off-product → materiału do sekcji **demo-wideo
nie ma**. Pozycja w manifeście = **`blokada-tomek`** („brak wideo produktu w kadrze; jedyny klip
TikTok off-product"), NIE `SKIP`. Werdykt „sekcji wideo nie będzie" należy wyłącznie do Tomka.
Zastępczy dowód „na żywo": sekcja **zdjęć od kupujących** (UGC 6-0/7-1 — ekran działa) + demo
„jak działa" (TOR-I, stany na makiecie). Klip hooka (chodnik+pies) może posłużyć jako pattern
reklamy (ad-forge), nie jako sekcja landingu.
