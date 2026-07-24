# WIDEO — NAPINEK · F0 (vision-gate materiału wideo) · 2026-07-24

## Stan danych
- **`ali_snapshot.video_url = null`** → aukcja detail **NIE zawiera wideo produktu**.
- **`bud_tt_products.tiktok_url`** = `https://www.tiktok.com/@7141039908677764142/video/7539235739989495054`
  — powiązany klip TikTok (źródło radaru). **Nie pobrany/nie zweryfikowany w tej sesji** (brak
  dostępu do pobrania klipu; okładka `bud-shop-imgs/…/0.jpg` = g6 pokazuje NIEBIESKI wariant +
  model + broszura „HOTWAVE").
- `bud_tt_products.videos = 0` (licznik), `tt_shop` obecny (radar TikTok Shop).

## Werdykt vision-gate
**BRAK zweryfikowanego, zdatnego wideo produktu na tym etapie.** `video_url=null`; jedyny klip TT
niepobrany, a jego okładka (g6) niesie **inny odcień koloru (niebieski ≠ kanon turkus) + nadruk
obcej marki „HOTWAVE"** = ryzyko off-brand/white-label. `videos_curated` = nota „brak
zweryfikowanego wideo produktu (video_url=null; tiktok niepobrany; okładka = niebieski wariant +
brand HOTWAVE)".

## Konsekwencja dla dalszych faz
- **Sekcja wideo (TikTok/UGC) = KLASA DOWODOWA (F1a)** — agent **NIE MA prawa wpisać jej `SKIP`**.
  Po protokole wyczerpania materiału (brak `video_url`; klip TT niepobrany i off-color/brand na
  okładce) sekcja trafia do TABELI BLOKAD jako **`blokada-tomek`** — landing może być live, ale
  manifest trzyma pozycję; werdykt „sekcji nie będzie" może wydać wyłącznie Tomek.
- Do pozyskania na dalszym etapie (decyzja/materiał Tomka): (a) weryfikacja klipu TT
  `@7141039908677764142/…7539235739989495054` pod kątem koloru/marki i wypalonych claimów;
  (b) ewentualnie własny klip produktu w kanonicznym (turkusowym) wariancie.
