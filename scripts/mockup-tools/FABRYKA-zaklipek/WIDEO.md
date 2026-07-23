# WIDEO — ZAKLIPEK · F0 (vision-gate materiału wideo) · 2026-07-23

## Stan danych
- **`ali_snapshot.video_url = null`** → aukcja detail **NIE zawiera wideo produktu**.
- **`bud_tt_products.tiktok_url`** = `https://www.tiktok.com/@luckygeek1/video/7654381282121616670`
  — jedyny klip powiązany z produktem. **Okładka klipu (g6) pokazuje INNY produkt: czarny hub
  z widocznym logo „ORICO"** (plastik), a NIE srebrny aluminiowy Eswirepro sprzedawany na landingu.
- `bud_tt_products.videos = 1` (licznik), ale materiał = off-product (obca marka/model).

## Werdykt vision-gate
**BRAK realnego wideo produktu.** Klip TikTok = off-product w obie strony (obcy egzemplarz ORICO)
→ **pominięty** (nawet gdyby miał wysokie wyświetlenia; STANDARD F0: off-product = sekcję pominąć).
`videos_curated` = nota „brak realnego wideo produktu (video_url=null; tiktok=inny produkt ORICO)".

## Konsekwencja dla dalszych faz
- **Sekcja wideo (TikTok/UGC) = KLASA DOWODOWA (F1a)** — agent **NIE MA prawa wpisać jej `SKIP`**.
  Po protokole wyczerpania materiału (brak video_url, brak własnego klipu produktu, TikTok =
  obcy produkt) sekcja trafia do TABELI BLOKAD jako **`blokada-tomek`** — landing może być live,
  ale manifest trzyma pozycję; werdykt „sekcji nie będzie" może wydać wyłącznie Tomek.
- Do pozyskania na dalszym etapie: własny klip produktu (srebrny aluminiowy wariant bazowy) —
  do decyzji Tomka.
