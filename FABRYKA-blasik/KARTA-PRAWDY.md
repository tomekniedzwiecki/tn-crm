# KARTA PRAWDY — BLASIK (latarka czołowa LED z listwą COB, reflektorem XPE i czujnikiem ruchu)

## 0. Tożsamość
- Klasa produktu: **latarka czołowa LED (headlamp)** — szeroka listwa COB + skupiony reflektor XPE,
  obsługa machnięciem ręki (czujnik ruchu), ładowanie USB. Z tytułu detail „…LED Induction Headlamp
  Camping Search Light USB Rechargeable Headlight Led Head Torch Work Light With Built-in Battery"
  + spec `Item Type=Headlamps`, `Feature 1..8` (Headlamp / Flashlight / Rechargeable / Sensor /
  Induction / Work Light / Search Light / Head Flashlight).
- Mini-marka: **Blasik** · slug `blasik` (bud_brand_names 26874369, INSERT-or-fail 1. kandydatka, 24.07;
  od „blask" — korzyść rdzenna = mocne, szerokie światło; nazwa NIE koduje jednego zastosowania →
  zgodne z anty-zawężeniem produktu wielofunkcyjnego).
- Projekt: Patencik (parasol) / Rafał Rogut `bc92c138` · wf2_products `78dc560d` · tt `baecb0e1` · Ali `1005006997875182`.
- ⛔ WHITE-LABEL: spec „Brand Name=Heinast", model na pudełku „LX300", nazwa wewnętrzna „BIAT" —
  **WSZYSTKIE NIGDY na stronę** (nadruków marki na produkcie BRAK w kadrach → retusz nie był potrzebny).
- `categories` = null (brak kategorii Ali w snapshocie datahub).

## 1. Cena
- Snapshot `source='datahub'` (odświeżony 2026-07-24 16:21) — GATE F0 PASS (∈ {detail, allegro, datahub}).
- `sku_prices` = **7 wariantów PACZKOWYCH** (liczba sztuk, NIE kolory): 1PCS $4.30 · 2PCS $8.00 ·
  3PCS $11.80 · 5PCS $19.99 · „Popular Set" $6.73 · „Package List" $6.38 · „Mini work light" $3.40.
- Kurs NBP tab. A **2026-07-24: 3,8000 zł/USD** (tab. 142/A/NBP/2026 — zapisane dla audytu).
- **cost_purchase KANONICZNY (wf2_products): 12,94 zł** (ODCZYT — NIE zmieniam; ≈ $3,40 × 3,80 = 12,92,
  tj. wariant „Mini work light"/pojedyncza sztuka).
- **NASZA cena PL: 14,90 zł** (ODCZYT z `wf2_products.price`; krok kalkulacja done). Jedna cena/szt.;
  wariant paczkowy = konfiguracja wewnętrzna. Końcówka <150 → ,90 ✓. Narzut ≈ 15% (14,90 vs 12,94).
- ⚠️ Nota F-1 (jedną linijką, buduję dalej): marża jednostkowa cienka (~1,96 zł przed prowizją), ale
  MIEŚCI SIĘ w zaprojektowanym paśmie narzutu 10–15% panelu — decyzja Etapu 1, nie fabryki landingu.

## 2. Specyfikacja (specs 1:1 VERBATIM)
| Pole | Wartość |
|---|---|
| Brand Name | Heinast *(wewnętrzne — white-label)* |
| Nominal Voltage | 3.7 V |
| High-concerned chemical | None |
| Origin | Mainland China |
| Certification | CCC, ce |
| Is Batteries Included | Yes |
| Item Type | Headlamps |
| Beam Angle | 180 ° |
| Battery Type | Lithium Metal |
| Waterproof | Yes |
| Light Source | LED bulbs |
| Purpose | Night running, camping, night fishing, outdoor |
| Model Number | Camping Fishing Headlamp |
| Switch Mode | High/Middle/Low |
| Wattage | 3W |
| Feature 1..8 | Headlamp · Flashlight · Rechargeable Headlight · Sensor Headlamp · Induction Headlamp · Work Light · Search Light · Head Flashlight |
| Choice | yes |

## 3. Opis sprzedawcy — DESTYLACJA
**FAKTY (z kotwicą — wolno użyć):**
- Czołówka: **szerokie światło COB (listwa) + skupiony reflektor XPE (spot)** — [SPEC Item Type=Headlamps, Light Source=LED bulbs; Feature 1/2] · [GALERIA c-lit/c-off, g4]
- **Czujnik ruchu (machnięcie):** włącz/wyłącz gestem dłoni w ok. **10 cm**, działa w rękawiczkach — [OPIS „MOTION SENSOR MODE… within 10 cm… wearing gloves"] · [SPEC Feature 4 Sensor / Feature 5 Induction] · [GALERIA g1 tryb 6] · [OPINIE 6, 20]
- **6 trybów świecenia:** COB mocno, COB słabo, XPE mocno, XPE słabo, stroboskop/SOS, czujnik ruchu — [OPIS „6 LIGHT MODES"] · [GALERIA g1 „6 LIGHTING MODES" z etykietami] · [OPINIA 6]
- **Ładowanie USB** (wbudowany akumulator litowy): źródła — gniazdko / powerbank / komputer / ładowarka auta — [OPIS „USB Rechargeable… Built-in Battery"] · [SPEC Is Batteries Included=Yes, Nominal Voltage 3.7 V] · [GALERIA g3]
- **Lekka i składana:** silikonowy korpus + regulowana elastyczna opaska; ok. **68 g** (2,4 oz); mieści się w kieszeni — [OPIS „soft silicone, adjustable elastic headband, 2.4 oz, foldable"] · [GALERIA g4]
- **IPX4 — odporna na deszcz/śnieg** — [SPEC Waterproof=Yes] · [OPIS „IPX4"] · [GALERIA g5/c-splash]
- **Kąt świecenia 180°** (szeroki) — [SPEC Beam Angle=180°]
- **Moc 3 W · 3,7 V** — [SPEC Wattage=3W, Nominal Voltage=3.7V]
- **Certyfikaty CCC, CE** — [SPEC Certification]
- Akumulator ok. **1200 mAh** (litowy) — [DIAGRAM g4 „3.7V/1200mAh Li-battery"] *(miękko/opcjonalnie — kotwica tylko w diagramie, nie w specs)*
- Zastosowania: bieganie nocą, kemping, wędkarstwo nocne, outdoor [SPEC Purpose]; hiking, rower, wspinaczka, naprawy, wewnątrz [OPIS]

**BEŁKOT / WĄTPLIWE (CUT — NIE na stronę):**
- **„230°"** — SPRZECZNE ze spec Beam Angle=180° → **BEŁKOT-CUT**. Na stronę idzie 180°.
- **„350 Lumens"** — brak w strukturalnych specs (jest tylko Wattage 3W); pojawia się jedynie w marketingu (pudełko 9-0, infografiki g2/g3). Lumeny na tanich Ali zawyżane → **CUT**. Copy: „mocne, szerokie światło COB" BEZ liczby lumenów.
- **Czas pracy 2,5–8 h** — tylko infografika (g3/g4), brak w specs; fizyka (1200 mAh × 3,7 V ≈ 4,4 Wh; 3 W high ≈ ~1,5 h) czyni „2,5 h high" optymistycznym → **NIE cytować twardej liczby**; ewentualnie miękko „kilka godzin", bezpieczniej pominąć.
- **Czujnik dźwięku/klaśnięcia** — opinia 11 „sound pickup sensor, which I have not yet managed to get working"; opinia 20 „brightness sensor". Niepewne → **NIE deklarować**. Potwierdzony jest tylko czujnik RUCHU (machnięcie).
- **Type-C** — pudełko 9-0 pisze „Type-C USB… Cable", ale g3 mówi wprost „not support usb-c to usb-c pd charge", a kable na zdjęciach (6-0, 8-2) to micro-USB/USB-A → SPRZECZNE → **NIE deklarować Type-C**; copy „ładowana przez USB".
- „latest intelligent sensors", „your good assistants", „WIDER AND BRIGHTER", superlatywy — CUT.

**Liczby na stronę:** 180° [SPEC] · 3 W [SPEC] · 3,7 V [SPEC] · IPX4 [SPEC/OPIS] · ~68 g [OPIS] ·
6 trybów [OPIS+GALERIA] · ~10 cm zasięg czujnika [OPIS] · 1200 mAh [DIAGRAM — miękko].
**ZAKAZ:** lumeny (liczba), 230°, twardy czas pracy, Type-C.

## 4. Warianty (jedna cena PL 14,90/szt.; wariant = liczba sztuk w paczce, NIE kolor)
| Oryg. | PL | Koszt USD | Uwaga |
|---|---|---|---|
| 1PCS | 1 sztuka | 4.30 | pojedyncza (konfiguracja domyślna) |
| 2PCS | 2 sztuki | 8.00 | paczka |
| 3PCS | 3 sztuki | 11.80 | paczka |
| 5PCS | 5 sztuk | 19.99 | paczka |
| Popular Set | zestaw popularny | 6.73 | zestaw |
| Package List | zestaw | 6.38 | zestaw |
| Mini work light | mini lampka robocza | 3.40 | wariant najtańszy (mniejszy produkt?) — do potwierdzenia Etap 1 |
- **MODEL CENY:** jedna cena PL 14,90 za sztukę. Warianty to LICZBA SZTUK, nie kolory ani nie estetyka.
  Produkt ma JEDEN wygląd: czarny korpus + żółta listwa COB. **Zero swatchy kolorów** (brak dowodu kolorów w galerii).
- Ceny wariantów RÓŻNE ($3.40–$19.99) — to paczki. cost_purchase kanoniczny (12,94 zł) ≈ pojedyncza sztuka.

## 5. Dowód
- `sold_volume` = **null** → POMIJAMY (zero fraz o popularności/„tysiącach klientów" — ZAKAZ).
- Opinie: `review_stats` **avg 4,7 / 5 · 3095 ocen · 94,6% pozytywnych** (realny stat — [review_stats]).
  W snapshocie 20 opinii, **WSZYSTKIE 5★**. → sekcja opinii MOŻE użyć 4,7/5 i 94,6%.
- **Zdjęcia kupujących: MATERIAŁ JEST** — 10 zrehostowanych w `bud-reviews/1005006997875182/` (protokół
  wyczerpania wykonany 24.07: Storage list = 10 plików, wszystkie z opinii 5★). Selekcja (szczegóły w
  `galeria-kuracja/GALERIA.md`): **KEEP** 3-0 (w aucie, w dłoni), 2-1 (reflektor świeci), 7-1 (2 szt., jasność),
  1-0 (COB świeci); **backup** 6-0, 8-2; **OUT** 0-0 (watermark off-product), 9-0 (pudełko + eksponuje „350 LUMENS"),
  5-0/4-0 (słabe). Finalne osadzenie: F4 (twardy filtr `stars==5` ✓).
- Wideo: `video_url`=null, `tt_shop.videos` puste, `tiktok_url`=null → **0 klipów DODANYCH** → sekcja WIDEO
  NIE powstaje (LL-044). Patrz WIDEO.md i `videos_curated` (pusty).
- `shop` = null. Model „LX300" / marka „Heinast"/„BIAT" 🚫 NIGDY na stronie (white label + grep gate F6).

## 6. Galeria
`bud_tt_products.gallery_curated` (24.07): 13 werdyktów, **5 keep** (2 packshot POKAŻ: c-lit, c-off +
3 CROP: c-worn, c-night, c-splash). **Czysty packshot ISTNIEJE** (wycięty z kompozytu g0) → F3 sceny mogą
mieć realne referencje (multi-ref: c-off + c-lit + c-worn + diagram g4).

## 7. Wskaźniki
- `PASZPORT.md` (elementy + CZEGO NIE MA) — obok.
- `MAPA-ZASTOSOWAN.md` (3 funkcje → szerokość obowiązkowa) · `ICP-GRUPA-DOCELOWA.md` · `WIDEO.md`.
- `videos_curated` = pusty (brak klipów).
