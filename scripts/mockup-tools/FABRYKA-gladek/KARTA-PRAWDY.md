# KARTA PRAWDY — GŁĄDEK (haczyki do zasłony prysznicowej z kulkami) · F0.6 · 2026-07-24

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy = CUT. Puste pole = „brak danych", nigdy
zmyślanie. Znaczniki: **[KONKRET-SKU]** / **[SPEC]** / **[GALERIA]** / **[OPIS]** / **[BEŁKOT-CUT]**.

> ⛔ **STATUS: BUILD WSTRZYMANY NA BEZPIECZNIKU RENTOWNOŚCI** (patrz `RENTOWNOSC.md`). Ta karta
> = groundwork F0; sceny/makiety/wideo NIE generowane. Dane produktu spisane 1:1 ze snapshotu.

## 0. Tożsamość produktu
- **Klasa:** podwójne haczyki/kółka do zasłony prysznicowej **z toczącymi się kulkami** (double-glide
  rolling-bead shower curtain hooks); **podwójny hak** = osobno zasłona i wkład (liner). Kolor **czarny**.
- **Slug roboczy:** `gladek`. **Mini-marka = „Gładek"** (od „gładko" — rdzeń USP „gładki ślizg";
  mechanizm-led, NIE kontekst-łazienka → zgodne z anty-zawężeniem, bo `g3` pokazuje multi-use).
  ⚠️ PROWIZORYCZNA — rezerwacja `bud_brand_names` należy do F2.5 (NIE wykonano; build wstrzymany).
- **Rekord kuracji:** `bud_tt_products.id = 33a3362c-8ea8-495c-a414-296e1f520be9`.
  `wf2_products.id = 03cbd8bb-408b-40d6-af10-d3b470709688`. ali_product_id `1005009663329517`.
- **Źródło danych:** aukcja AliExpress `1005009663329517`, **`source='datahub'`**.
  ⚠️ **GATE F0 NIE PASS:** `datahub` ∉ `TRUSTED_SNAPSHOT_SOURCES` (`detail`/`allegro`). Snapshot
  pobrany 2026-07-24T06:14Z. Przed buildem wymagany re-snapshot `source=detail` (patrz RENTOWNOSC §6).
- **⛔ WHITE-LABEL:** `specs.Brand Name = NONE`, `shop = null` — brak marki/sprzedawcy do ukrycia
  (to plus). Origin: Mainland China (WEWN., nie na stronę).

## 1. Cena
- **NASZA cena PL: BRAK (nieustalona).** `wf2_products.price = null`. Krok `kalkulacja` NIE domknięty
  automatem (gate `datahub`). Kalkulacja ręczna + rekomendacja: **`RENTOWNOSC.md`**.
- **Koszt zakupu (wariant Black $5.57): 21,14 zł** [KONKRET-SKU] = **$5.57 × NBP 3,7946** (tab.
  141/A/NBP/2026, 2026-07-23). **Koszt efektywny (dropship, +cło 13 zł) = 34,14 zł.**
- **Warianty:** jeden — „Black" $5.57 (`sku_prices`). Brak wariantów cenowych → brak pułapki modelu ceny.
- **Progi (netto v3.2):** break-even 42,85 zł · cel 40% = 74,90 zł · sufit rynku PL ~59,90 zł.
  **Cel 40% > sufit rynku → dropship nie spina (RENTOWNOSC §4).**

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC]
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | NONE | *brak marki — biały produkt* |
| Origin | Mainland China | *WEWN.* |
| High-concerned chemical | None | puste — POMIŃ |
| **Material** | **PVC** | ⚠️ **KONFLIKT z opisem** — opis mówi „Iron" (patrz §2a) |
| Feature | Other | puste/generyczne — POMIŃ |

### 2a. ⚠️ SANITY: materiał (PVC vs Iron) — NIEROZSTRZYGNIĘTY
- `specs.Material = PVC` (pole strukturalne), `description = "Material: Iron"` (proza sprzedawcy).
  Zdjęcia (g0–g6): czarne, matowo-połyskliwe — **wizualnie mogą być metal LUB tworzywo z powłoką**.
  Cena $5.57/12 szt. sugeruje raczej **tworzywo (PVC)** niż lity metal.
- **⛔ NA STRONĘ (gdyby build):** NIE deklarować twardo „stal/metal/żelazo" (BEŁKOT-CUT — ryzyko
  anty-mismatch); bezpieczne copy o mechanizmie („kulki", „podwójny hak", „nie spada"), materiał
  do potwierdzenia przy packshocie / z żywej aukcji `detail`.

## 2b. Specyfikacja z OPISU + kadrów — [OPIS]/[GALERIA]
| Parametr | Wartość | Kotwica |
|---|---|---|
| Mechanizm | kuliste elementy (kulki) redukują tarcie → haczyk **ślizga się** po drążku | [OPIS „spherical ball to reduce friction, easily slide back and forth on the rod"] |
| Korzyść rdzeniowa | zasłona **nie spada** z pierścienia; łatwe przesuwanie | [OPIS „curtain will not slip off the ring"; GALERIA g4 „Glide quickly & smoothly / No fall off"] |
| Konstrukcja | **podwójny hak** (double) — zasłona + wkład osobno | [GALERIA g0/g1/g5 — dolny hak podwójny; g5 „Hang shower curtain & liner"] |
| Zawartość | **12 szt./zestaw** | [OPIS „Package Including: 12Pcs/Set * Hooks"; GALERIA g0/g6 „12PCS"] |
| Montaż | zakłada się na drążek prysznicowy, bez narzędzi | [GALERIA g5 „Easy Installation / Hang on shower rod"] |
| Wymiary / waga | **BRAK DANYCH** — ⛔ zero zmyślonych mm/g | — |

## 3. Destylacja opisu — FAKT / BEŁKOT
**FAKTY (z kotwicą — feature→benefit):**
- Kulki redukują tarcie → „zasłona ślizga się po drążku gładko, jednym ruchem" [OPIS + g4]. **RDZEŃ USP.**
- Nie spada z pierścienia → „koniec z haczykami, które puszczają zasłonę" [OPIS „will not slip off" + g4 „No fall off"].
- Podwójny hak → „zasłona i wkład (liner) osobno na jednym haczyku" [g5]. Argument różnicujący vs zwykłe kółko.
- Łatwy montaż, zestaw 12 szt. → „komplet na cały drążek od ręki" [g5 + OPIS 12Pcs].

**BEŁKOT / OSTROŻNIE:**
- „Iron"/„stal" jako twardy claim → **CUT** (konflikt ze specs=PVC; §2a).
- Sceny multi-use z `g3` (wardrobe/kitchen/other) = **SPEKTRUM wtórne** (patrz §MAPA), nie rdzeń.

## 4. Warianty
Jeden wariant: **„Black" $5.57** (`variants:["Black"]`, `sku_prices:[{v:"Black",price:5.57}]`).
Jedna cena PL. Brak swatchy (jeden kolor).

## 5. Dowód społeczny — ⚠️ ZERO
- **`review_stats = {avg:0, numRatings:0, positivePct:0}` → 0 OPINII.** `reviews = []`.
  **⛔ TWARDE: NIE fabrykować opinii/gwiazdek/liczników recenzji.** Landing (gdyby powstał) = specs/
  demo/mechanism-led; zaufanie z: COD / 14 dni zwrotu / „z Polski" (jak Zaklipek).
- `sold_volume = null` → brak liczby sprzedaży (nawet nieprzypisanej frazy — POMIJAMY).
- `shop = null` → brak sprzedawcy do ukrycia.

## 6. Materiał wizualny → galeria (patrz `GALERIA.md`)
8 kadrów (g0–g7). Kuracja: **6 keep (crop tekstu EN) / 2 odsiew**. ŻADEN kadr nie jest czystym
packshotem bez wypalonego tekstu → czysty packshot = do wygenerowania w F3 (NIE wykonano). **g7
(okładka TikTok) = OFF-PRODUCT (inny produkt) → ODRZUĆ.**

## 7. MAPA ZASTOSOWAŃ (skrót — g3 pokazuje multi-use)
- **PRIMARY:** zasłona prysznicowa — gładki ślizg, nie spada (rdzeń USP, kąt komercyjny hero).
- **SPEKTRUM (wtórne, [KATEGORIA]/[GALERIA g3]):** ogólny podwójny hak do wieszania — szafa (ubrania/
  parasol), kuchnia (ścierki/przybory), inne (biżuteria/łańcuszki). ⚠️ Jako S-hak to zwykły haczyk;
  przewaga (kulki/ślizg) działa TYLKO na drążku → SPEKTRUM pokazywać, nie robić z niego rdzenia.

## 8. Wideo (patrz `WIDEO.md`)
`ali_snapshot.video_url = null` → brak wideo produktu. `tiktok_url` (@ryans.amazing.finds, „624k")
= okładka `g7` pokazuje **INNY produkt** (retractable shower curtain) → off-product, niezdatny.
Sekcja wideo/UGC = klasa dowodowa — los należy do Tomka (blokada-tomek), nie do fabryki.
