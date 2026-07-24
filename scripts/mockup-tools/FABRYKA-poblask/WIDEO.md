# WIDEO — kuracja (F0, POBLASK) · 2026-07-24

## Źródła wideo
1. **Wideo produktowe Ali** — `ali_snapshot.video_url` =
   `https://video.aliexpress-media.com/…/1100191988031.mp4` (58,7 s, MP4). **ISTNIEJE.**
2. **TikTok wzorca** — `tiktok_url` = `tiktok.com/@6858265703902036997/video/7645338586815925517`
   (materiał źródłowy trendu; surowy TikTok NIE na landing — prawa; wzorzec dla reklam/ADS, nie sekcji).

## Gate wizualny (klatki 0.5 / 4 / 8 / … s) — WERDYKT: PASS (ON-PRODUCT)
Klatki pokazują **realny produkt w użyciu**: nocna scena wnętrza auta, **taśma świeci wzdłuż
listwy** (płynne przejścia niebieski→fiolet→czerwony→bursztyn), **dłoń trzyma telefon z aplikacją**
(siatka scen/kolorów, suwak jasności), palec wybiera tryb. To dokładnie rdzeń oferty (ambient RGB +
sterowanie z aplikacji). **Off-product = NIE** (w obie strony to ten sam produkt). Gate PASS.

## ⚠️ Blokada do usunięcia: WATERMARK „FCCEMC®"
W **lewym-górnym rogu** przez całą długość klipu wypalony jest znak **„FCCEMC®"** (marka
white-label — KARTA §0, PASZPORT white-label). **Przed użyciem na stronie = OBOWIĄZKOWY crop/
retusz** rogu (lub górnego pasa). To NIE dyskwalifikuje wideo (jest on-product) — to retusz
white-label, jak nadruki na kadrach galerii.

## Decyzja o sekcji `wideo`
- Materiał realny i on-product → sekcja `wideo` = **BUILD** (klasa dowodowa spełniona materiałem;
  NIE `blokada-tomek` — inaczej niż zaklipek/rozmrozik, gdzie klip był innym produktem).
- **Zastosowanie:**
  - **DEMO/sekcja wideo** — czysty klip aukcji (po usunięciu watermarku + ewentualnym trim do
    ~8–12 s najlepszego fragmentu: taśma zmienia kolor + dłoń w app). Wzorzec: „czysty klip aukcji
    = sekcja DEMO domyślnie".
  - **HERO-VIDEO (F5/F6)** — kadr hero pod i2v: taśma świeci wzdłuż deski nocą, **nośnik ruchu =
    płynąca fala koloru po taśmie** (taśma statyczna geometrycznie, zmienia się BARWA) + subtelny
    ruch dłoni/telefonu. Amplituda ruchu naturalnie wysoka (zmiana koloru) — sprzyja gate'owi F5.2.

## videos_curated (zapis do `bud_tt_products.videos_curated`)
```
{
  source_ok: true, product_id: "71e8176b-…", curated_at: "2026-07-24",
  items: [{
    url: "…1100191988031.mp4", kind: "product", keep: true, gate: "PASS",
    on_product: true, duration_s: 58.7,
    retusz: "usunąć watermark FCCEMC® (lewy-górny róg) — crop/retusz przed użyciem",
    role: "demo + hero-video source (F5/F6)",
    powod: "realna taśma świecąca w aucie nocą + sterowanie z aplikacji (dłoń w app)"
  }],
  tiktok: {url: "…/7645338586815925517", use: "ADS/wzorzec, NIE sekcja (prawa/surowy TikTok)"},
  note: "wideo produktowe ON-PRODUCT — sekcja wideo BUILD; watermark FCCEMC do retuszu"
}
```
