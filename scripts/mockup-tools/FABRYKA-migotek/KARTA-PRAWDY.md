# KARTA PRAWDY — MIGOTEK (bezpłomieniowe świece LED z pilotem) · F0.6 · 2026-07-24

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET-SKU]** / **[SPEC]** / **[GALERIA]** /
**[OPIS]** (destylat opisu-FAKT) / **[OPINIE]** / **[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** bezpłomieniowe (LED, na baterie) **świece dekoracyjne z pilotem-różdżką** („magic wand
  remote"). Świece w kształcie zwężanych, białych „sopli"/klasycznych świec; zapala/gasi się je
  pilotem-różdżką na odległość LUB przekręceniem podstawy. Ciepłe białe, migoczące światło
  imitujące płomień. Zestaw pozwala je **zawiesić pod sufitem na żyłce** (efekt „unoszących się"
  świec) albo postawić/przykleić na płaskiej powierzchni.
- **Wariant sprzedawany = bazowy: zestaw 12 szt. Warm White** ($20.40) [KONKRET-SKU]. Zawartość
  pudełka [OPIS, potwierdzone]: **12× świeca LED · 1× pilot-różdżka · 12× haczyk · 1× żyłka 20 m**.
- **Slug fabryki:** `migotek`. **Mini-marka = „Migotek"** (od „migotać" — rdzeń mechanizmu:
  migoczące światło; nazwa NIE koduje jednego zastosowania → anty-Popiołek OK; F2.5 rezerwuje
  w `bud_brand_names`). Rodzina marki sklepu: **Sprytko** (sprytko.pl).
- **Rekord kuracji:** `bud_tt_products.id = 21be73cb-7a2c-4b2a-afbc-041b33df6df5`.
  ali_product_id `1005006239013102`. wf2_products `62ee7f57-b5ca-4bc8-bc8d-4a82942e4c86`.
- **Źródło danych:** aukcja AliExpress `1005006239013102`, **`source='detail'` = ZAUFANE**
  (gate F0 PASS ✓; potwierdzone 3× czytaniem, hash stabilny). Snapshot z 2026-07-21T18:43Z.
- **⛔ WHITE-LABEL:** marka aukcji **„TAILI"** (spec Brand Name), sprzedawca **„YY Warm Home
  Gardening Store"** — **NIGDY na stronie**. Sam produkt nie ma czytelnego nadruku marki.
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Home & Garden > Festive & Party Supplies.
- **Sezonowość:** `season_type = all_year` / `season_label = całoroczny` (`season_verified=true`).
  ⚠️ query aukcji = „christmas decorations", ALE pozycjonujemy **CAŁOROCZNIE** (nastrój/bezpieczeństwo/
  ambiance) — święta to jeden z wielu światów, nie kręgosłup.

## 1. Cena  [krok `kalkulacja` Etapu 1 = DONE 2026-07-24]
- **NASZA cena PL: 89,90 zł** [ODCZYT z `wf2_products.price`]. Końcówka wg reguły (<150 → ,90).
- **Koszt zakupu (zestaw 12 szt., wariant bazowy $20.40): 77,41 zł** [KONKRET-SKU]
  = **$20.40 × kurs NBP 3,7946** (tab. **141/A/NBP/2026, 2026-07-23**). `wf2_products.cost_purchase = 77,41`.
- **Narzut ~14% · zysk/szt. brutto 10,69 zł** (po prowizji 2%) [`unit_profit` GENERATED].
- **Marża NETTO (model goods, dropship): −18,78 zł/szt. (−25,7%)** — koszt efektywny 90,41 zł
  (77,41 + cło ryczałt 13 zł; wysyłka=klient → 0), sale_net 73,09. **Ujemny netto = ŚWIADOMY
  posiąg testowy** (pasmo narzutu 10–15% = ujemny netto z założenia; silnik cen winduje do
  rentowności po potwierdzeniu popytu; identyczna postawa jak Zaklipek). Breakeven-price (+40%
  netto) ≈ 192 zł. **Fabryka landingów NIE zmienia ceny** (F-1).
- **Koszty wariantów USD** [KONKRET-SKU, `sku_prices`]: **12 szt. $20.40** · 24 $38.24 · 36 $56.07 ·
  48 $73.29 · 60 $90.51 · 120 $177.84 · 180 $266.40 · 240 $352.50.
  ⚠️ **MODEL CENY:** przy 89,90 zł mieści się w koszcie **wyłącznie zestaw bazowy 12 szt.** Większe
  zestawy (24 szt. → ~145 zł landed) są **strat­ne** za 89,90 → **NIE oferować ich na stronie.**
  Strona sprzedaje JEDNĄ konfigurację: **zestaw 12 świec + pilot**, cena jedna: 89,90 zł.
- Dostawa/COD/zwrot: warunki sklepów fabryki (COD + zwrot 14 dni, checkout Trevio).

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC] (puste/wewnętrzne pomijam)
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | TAILI | *WEWN. — white-label, nie na stronę* |
| Material | Plastic (+LED) | obudowa z tworzywa, dioda LED |
| Occasion | Wedding, Baptism, Birthday, Grand Event, Gender Reveal… | → dowód WIELU światów (nie tylko święta) |
| Voltage | NO AC/DC | **zasilanie bateryjne, bezprzewodowe** (0 kabli, 0 gniazdka) |
| is_customized | No | |
| Model Number | Magic candle | *WEWN.* |
| Origin / CN | Mainland China / Guangdong | *WEWN.* |
| High-concerned chemical | None | puste-jakościowe |

### 2a. Wymiary i zasilanie [OPIS — sekcja „Specification"]
- **Świeca: 2 × 17 cm** · **Pilot-różdżka: 2 × 33,2 cm** [OPIS]. Kolor: biała obudowa, światło
  **ciepłe białe, migoczące** („warm white flashing") [OPIS].
- **Zasilanie [⚠️ SANITY — konflikt źródeł]:** opis podaje „świeca 1×AA, różdżka 1×AAA"; **opinie
  kupujących (rev2, rev8) mówią o AAA do świec i pilota — łącznie „13 baterii AAA"** (12 świec +
  pilot). **ROZSTRZYGNIĘCIE dla strony:** komunikować „**zasilane bateriami (do dokupienia)**" bez
  twardego typu w nagłówku; w FAQ podać „**wg opinii kupujących ~13 baterii AAA**" (kotwica: rev2
  „buy 13 AAA batteries", rev8 „batteries… are AAA"). ⛔ ZAKAZ obietnicy „baterie w zestawie" —
  opis wprost: **baterie NIE w zestawie** [OPIS].
- **Włącznik [OPIS]:** „tighten to light / remote control" = zapal **przekręceniem podstawy** LUB
  **pilotem-różdżką** na odległość.

## 3. Opis sprzedawcy — DESTYLACJA (FAKT / BEŁKOT-CUT)
**FAKTY (z kotwicą — wolno użyć):**
- „Flameless candle with magic wand remote" → **bezpłomieniowa świeca, sterowana pilotem-różdżką**
  (włącz/wyłącz na odległość) [OPIS+tytuł+g0+rev2-0].
- „Magic Levitating Candle… hang with fishing line from the ceiling… floating candle effect" →
  **efekt unoszących się świec** (zawieszenie na dołączonej żyłce, 12 haczyków) [OPIS+g0+g2+g3].
- „require only 1 … battery (not included)" → **na baterie, bez kabli/gniazdka** [OPIS+SPEC Voltage].
- „Suitable for… weddings, tables, home and outdoor decoration… church, window, birthday" →
  **wiele okazji i wnętrz** [OPIS+SPEC Occasion] (→ MAPA-ZASTOSOWAN).
- „You can reuse it" → **wielorazowe** [OPIS].
- Zawartość zestawu: 12 świec + różdżka + 12 haczyków + żyłka 20 m [OPIS „Each box contains"].
**BEŁKOT-CUT (odrzucone):** „perfect", „the perfect magical gift", „upgraded", „better than other
traditional…", cały storytelling „every child has infinite curiosity…", „ship within 24h"
(logistyka sprzedawcy Ali — nie nasza), „inventory sufficient".
**WĄTPLIWE-CUT:** dokładny typ baterii (AA vs AAA — patrz §2a, tylko jako „opinie kupujących w FAQ").

## 4. Warianty (MODEL CENY: jedna cena PL, sprzedajemy TYLKO zestaw 12 szt.)
| Oryg. nazwa | PL | koszt USD | na stronie? |
|---|---|---|---|
| 12Pcs-Warm White | Zestaw 12 świec + pilot | **$20.40** | ✅ JEDYNY sprzedawany |
| 24 / 36 / 48 / 60 / 120 / 180 / 240 Pcs | większe zestawy | $38.24 – $352.50 | ⛔ strat­ne za 89,90 — NIE |

„China Mainland" w liście wariantów = miejsce wysyłki (szum), NIE wariant produktu. Wszystkie
warianty = to samo „Warm White"; różnica = tylko LICZBA świec. Brak wariantu koloru/swatcha.

## 5. Dowód społeczny
- **Opinie:** `review_stats` = **śr. 4,8 / 187 ocen / 96,8% pozytywnych** [OPINIE 1:1]. Pokazujemy
  **187 ocen · 4,8★** (uczciwe N). W treści = 20 opinii z tekstem (19×5★ + 1×4★).
- **`sold_volume` = 426** — GLOBALNE u dostawcy, ⛔ NIGDY „sprzedanych u nas". Domyślnie POMIJAMY
  (426 < 1000 → nawet nieprzypisana fraza NIE). Rola: wewnętrzny gate doboru = OK.
- **Jeden uczciwy minus (porównanie):** baterie do dokupienia (nie w zestawie) [OPIS+rev2/rev8];
  1 opinia 4★ (rev7): trafiły 2 wadliwe świece na 2 zestawy — mimo to poleca. → uczciwość porównania.
- `shop{name,url}` 🚫 NIGDY na stronie (white-label) + grep gate F6.

## 6. Galeria → `galeria-kuracja/GALERIA.md` (klasy R/theme/infografika/OUT). KEEP-czyste: g0
(retusz tekstu), g2 (wesele/ogród), g6 (haczyki+żyłka). Theme (magic/cosplay, tekst wpieczony):
g1, g4 — cytować świat, nie do czystej galerii. Infografiki (how-to): g3, g5 — referencja FAQ.
⛔ g7 = **INNY PRODUKT (roleta prysznicowa)** = OUT (kontaminacja snapshotu).

## 7. Wideo → `WIDEO.md` + `videos_curated`. `ali_snapshot.video_url` istnieje (1 klip MP4);
`tiktok_url` istnieje. Vision-gate w F0/F5 rozstrzyga self-host (LL-044: N dodanych = N kafli).

---
**Podsumowanie liczb dla copy (dozwolone):** 12 świec + pilot-różdżka w zestawie · 12 haczyków ·
żyłka 20 m · świeca 17 cm / różdżka 33 cm · 4,8★ / 187 ocen · 96,8% pozytywnych · ciepłe białe
migoczące światło · na baterie (do dokupienia, ~13× AAA wg opinii) · bez ognia/kabli · wielorazowe.
