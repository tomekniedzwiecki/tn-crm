# GALERIA — kuracja Zaglądek (F0.5; werdykty w bud_tt_products.gallery_curated, 24.07)

Galeria detail: 6 kadrów Ali (g0–g5) + 1 doklejona okładka TikToka (`bud-covers/…jpg`).
**source = detail** (gate PASS). **12 werdyktów, 5 keep** (wszystkie CROP — brak czystego packshotu).

## Kadry źródłowe
| Kadr | Klasa | Werdykt | Uwagi |
|---|---|---|---|
| g0 | infografika-z-tekstem (EN) | DANE | „2IN1 1920x1440P", dwie główki 8/5.5mm, badge IOS/Android/IP67/1440P → copy/specs |
| g1 | infografika-z-tekstem (EN) | DANE | kabel + złącze 2w1 + lista kompatybilnych iPhone'ów → FAQ/copy kompatybilności |
| g2 | infografika-z-tekstem (EN) | DANE + CROP | pełne urządzenie na niebieskim + inset „accessory" (hak/magnes/lusterko) + 3MP/IP67; **źródło cropów** c-glowka-led, c-modul, c-zlacze |
| g3 | lifestyle-z-tekstem | DANE + CROP | mechanik przy silniku, telefon z live-view; **źródło cropu** c-motoryzacja (po odcięciu pasa tekstu) |
| g4 | infografika-z-tekstem (EN) | DANE + CROP | „A VARIETY OF LENSES" — główki 8mm i 5.5mm na jasnoniebieskim; **źródło cropu** c-glowka-8mm; potwierdza średnice 5,5/8 mm |
| g5 | infografika/screenshot + obce loga | ODRZUĆ (galeria) / DANE | ekrany apki UseePlus + Google Play/App Store + dialog uprawnień → DANE: plug&play 1-2-3, apka **Useeplus** |
| cover | okładka-wideo TT | ODRZUĆ | „Gift He'll Actually Use", ciemna, pionowa, wypalony tekst, brak powiązanego klipu (tiktok_url/tt_shop.videos = null) |

## KEEP (5 — wszystkie CROP, klasa R; upload `bud-assets/zagladek/gallery/`)
| Plik | Rola | Klasa | Źródło (bbox px) | alt_pl (skrót) |
|---|---|---|---|---|
| c-glowka-8mm | detal/makro (kolejność 1) | detal-makro | g4 (136,752,444,1152) | makro główki 8 mm z pierścieniem 8 LED |
| c-glowka-led | detal (2) | detal | g2 (544,384,992,800) | główka na giętkiej szyjce + zwój kabla |
| c-modul | detal (3) | detal | g2 (960,704,1520,1216) | moduł z pokrętłem regulacji jasności |
| c-zlacze | detal (4) | detal | g2 (1136,432,1584,784) | wtyk 2w1 USB-C + Lightning |
| c-motoryzacja | lifestyle/showcase (5) | lifestyle-czysty | g3 (0,536,1600,1600) | mechanik + silnik + live-view na iPhonie (dowód: motoryzacja) |

**Cropy zweryfikowane wizualnie** (kompozyty `crops/_kontrola.png`, `_fix.png`, `_keeps.png`):
odrzucono `c-glowki-para`/`c-glowka-55` (wypalony tekst 3D „8mm/5.5mm"), `c-akcesoria` (biały inset +
„accessory" + pomarańczowa ramka = infografika, patchwork wobec niebieskich detali → akcesoria idą jako DANE).

**Braki:** zero czystego packshotu na jednolitym tle → packshot/sceny F3 = GENEROWANE multi-ref
(refy obowiązkowe: c-glowka-8mm + c-glowka-led + c-modul). Aspekt kafla: detale ~1/1–4/3, lifestyle
poziomy (3/2) → w F4 zmierzyć realne pliki i ustawić `--gal-aspect`.

Kolejność na stronę (moduł galeria@1): c-glowka-8mm → c-glowka-led → c-modul → c-zlacze → c-motoryzacja.

## ⭐ ZDJĘCIA KUPUJĄCYCH — selekcja 5★ (Storage bud-reviews/1005006318991119/)
Protokół wyczerpania WYKONANY: folder **NIE pusty** — 18 plików (2 partie rehostu; aktualny zestaw
zlinkowany w opiniach 1–4: `0-0, 1-1, 2-0, 3-1, 4-2, 5-0, 6-1, 7-2, 8-3, 9-0`). Wszystkie 20 opinii = **5★**,
więc filtr gwiazdek przepuszcza cały materiał. Kandydatek obejrzanych: **10** → wybrano **4** (ranking jakości/kontekstu):

| Wybór | Plik | Z opinii | Dlaczego |
|---|---|---|---|
| ✅ 1 | r_2-0 | rev2 (5★) | unboxing: pudełko „Wired Endoscope" + instrukcja + woreczek akcesoriów + zwój — pokazuje CO jest w zestawie |
| ✅ 2 | r_8-3 | rev3 (5★) | produkt w dłoni (zwój + moduł) — realna skala i autentyczność; tekst bardzo pozytywny („great for price/size, 5/5") |
| ✅ 3 | r_7-2 | rev3 (5★) | akcesoria (hak/magnes/lusterko) w woreczku w dłoni — dowód dołączonych nasadek |
| ✅ 4 | r_9-0 | rev4 (5★) | telefon z ekranem apki + instrukcja — dowód „łączy się i działa"; tekst „good image quality" |
| rezerwa | r_4-2 | rev2 (5★) | zdjęcie zrobione TĄ kamerą („Last pic is taken with the tool") — dowód jakości obrazu |
| rezerwa | r_6-1 | rev3 (5★) | pudełko w dłoni |

Odrzuty (jedno słowo): r_0-0 płaskie · r_1-1 płaskie · r_3-1 skan-instrukcji · r_5-0 sama-koperta.
**Reguła par:** podpis MUSI pochodzić z TEJ SAMEJ opinii co zdjęcie (mapowanie w tabeli). Sekcja
`zdjecia-kupujacych` budowana w F3/F4 z tej selekcji (pliki już w Storage, rehost gotowy).
