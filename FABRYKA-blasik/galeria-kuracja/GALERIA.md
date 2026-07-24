# GALERIA — kuracja Blasik (F0.5; werdykty w bud_tt_products.gallery_curated, 24.07)

Galeria detail (datahub): 7 kadrów Ali (g0–g6) + 1 doklejona okładka sklepowa (shopimg0, bud-shop-imgs).
**5 keep** (2 packshot POKAŻ + 3 CROP). Nadruk marki BIAT/Heinast: **BRAK na produkcie w każdym kadrze**
→ retusz marki niepotrzebny (jedyne oznaczenia to ikony funkcji: power, czujnik, czerwony wskaźnik baterii).

## Kadry źródłowe
| Kadr | Rozmiar | Klasa | Werdykt | Uwagi |
|---|---|---|---|---|
| g0 | 1100² | kolaż | **DANE + CROP** | kompozyt: zgaszona+zapalona szt., 2 kable USB, render noszenia, żółte łuki czujnika (overlay); ZERO wypalonego tekstu; źródło cropów c-lit, c-off, c-worn |
| g1 | 1000² | infografika-EN | **DANE + CROP** | „6 LIGHTING MODES" (COB High/Low, XPE High/Low, SOS Strobe, Motion Sensor) → potwierdza 6 trybów; górny render nocny → c-night |
| g2 | 1000² | infografika-EN | **ODRZUĆ (dane=BEŁKOT)** | „230° Wide Beam + 350 Lumens" — 230° sprzeczne ze spec 180°, 350 lm bez kotwicy → oba CUT; OURS vs OTHERS = tandeta |
| g3 | 900² | infografika-EN | **DANE** | ładowanie USB (gniazdko/powerbank/komputer/auto), „not support usb-c pd", czas 2,5–8h (nie spec), IPX4, odporność na uderzenia; cały kadr tekstowy |
| g4 | 1000² | diagram-schemat | **DANE** | labeled diagram ANATOMII (XPE/COB LED, przyciski, czujnik, wskaźnik baterii, silikon, opaska+klamra) = kotwica PASZPORTU; spec-ikony 3,7V/1200mAh, 2,5h, 1m, IPX4, machnięcie |
| g5 | 1000² | infografika-EN | **DANE + CROP** | „IPX4 WATERPROOF" + pływak w deszczu (tekst na kadrze); dolny render w wodzie → c-splash |
| g6 | 480² | duplikat-wariant | **ODRZUĆ** | kompozyt jak g0 w 480px (niższa rozdzielczość) — g0 1100px jest źródłem |
| shopimg0 | 800² | doklejka-sklepowa | **ODRZUĆ** | okładka sklepowa (bud-shop-imgs, poza galerią detail); kompozyt z klipsami/hakami spoza oferty (sku = paczki, nie akcesoria) |

## Keep (5) — kolejność na stronę (moduł galeria@1)
1. **c-lit** — CROP g0 (bbox 30,420,1090,652) — POKAŻ główny/hero-ref — zapalona latarka (COB+XPE), białe tło.
2. **c-off** — CROP g0 (bbox 30,12,1090,243) — POKAŻ packshot — zgaszona latarka (drugi kąt), białe tło.
3. **c-worn** — CROP g0 (bbox 760,795,1098,1098) — detal — noszenie na głowie (wolne ręce).
4. **c-night** — CROP g1 (bbox 55,118,958,350) — lifestyle — zapalona latarka na tle nocnego nieba.
5. **c-splash** — CROP g5 (bbox 25,600,990,990) — detal — produkt w wodzie (dowód IPX4).

Aspekt kafli: keepy c-* są LANDSCAPE (szeroka latarka) — F4 ustawi `--gal-aspect` wg realnych proporcji
plików (nie 1/1; latarka jest pozioma). c-worn zbliżony do kwadratu → osadzić osobno lub `--wide` dla pasów.
Żółte łuki czujnika usunięte z c-lit/c-off/c-night (ciasny crop + flat-fill lewego-dolnego rogu).

## Braki / F3
Czysty packshot **ISTNIEJE** (c-off/c-lit wycięte z g0 na białym tle) → F3 sceny generowane MULTI-REF
(referencje: c-off + c-lit + c-worn + diagram g4). To lepsza sytuacja niż zero-packshot.

## Zdjęcia kupujących — SELEKCJA (protokół 5★; bud-reviews/1005006997875182/ = 10 plików, wszystkie z opinii 5★)
Kandydatów: **10** → wybrano **4** (+2 backup).
| Plik | Opinia | Werdykt | Powód |
|---|---|---|---|
| 3-0 | rev3 5★ | **KEEP** (top) | latarka w dłoni w aucie, ostra, realny kontekst |
| 2-1 | rev2 5★ | **KEEP** | reflektor XPE świeci na łóżku — dowód jasności |
| 7-1 | rev6 5★ | **KEEP** | 2 szt., jedna mocno zapalona — dowód jasności |
| 1-0 | rev2 5★ | **KEEP** | listwa COB świeci (indoor) |
| 6-0 | rev6 5★ | backup | 2 szt. + pudełka + kabel („co dostajesz"); pudełka bez czytelnej marki (model „LX300") |
| 8-2 | rev6 5★ | backup | produkt + kabel na podłodze, czysto |
| 5-0 | rev5 5★ | OUT | ciemna rękawica, słaby kadr |
| 4-0 | rev4 5★ | OUT | statyczny + pudełko |
| 9-0 | rev7 5★ | **OUT** | tylko PUDEŁKO (nie produkt) + eksponuje „350 LUMENS" (claim, który CUT-ujemy) |
| 0-0 | rev1 5★ | **OUT** | watermark „NeatStuffFromOhio.Com" + maskotka — off-product, tandeta |

Finalne osadzenie i twardy filtr `stars==5`: F4 (wszystkie keep spełniają 5★ ✓).
