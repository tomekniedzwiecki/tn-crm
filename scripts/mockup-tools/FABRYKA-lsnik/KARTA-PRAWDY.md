# KARTA PRAWDY — LŚNIK (samochodowa listwa LED ambient do bagażnika) · F0.6 · 2026-07-24

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET-SKU]** (konkret sprzedawanego
wariantu) / **[SPEC]** (z tabeli parametrów / tytułu) / **[GALERIA]** (dowód z kadru) /
**[OPIS]** (destylat opisu-FAKT) / **[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** samochodowa **listwa LED ambient do bagażnika** — elastyczna, silikonowa taśma świetlna
  (świeci LINIĄ, nie widać pojedynczych diod) montowana bezinwazyjnie wokół **ramy/obrysu otwieranej
  klapy bagażnika** (SUV / kombi / hatchback). **Auto-czujnik: zapala się po otwarciu klapy, gaśnie
  po zamknięciu** (opis + instrukcja rev2). Elastyczna, **cięta na długość**, wodoodporna.
- **Wariant sprzedawany = 2M (2 metry)** — biały LUB ciepły biały (oba `sku_prices` = **$7.06**;
  wybór koloru = decyzja estetyczna, jedna cena PL). ⛔ **wariant 4M ($9.58 ≈ 36,40 zł landed) POZA
  marżą przy 34,90 zł → NIE oferować na stronie.**
- **Slug roboczy fabryki:** `lsnik`. **Mini-marka = „Lśnik"** (od *lśnić* = połyskiwać/świecić;
  premium blask; ZAREZERWOWANA w `bud_brand_names` w F0.6 — reserve-before-favicon; potwierdzenie w F2.5).
- **Rekord kuracji:** `bud_tt_products.id = d7fbc61a-523d-44f3-af24-1616b808cba3` (`gallery_curated`).
  ali_product_id `1005010785701198`.
- **Źródło danych:** aukcja AliExpress `1005010785701198`, **`source='datahub'` = ZAUFANE**
  (gate F0 PASS ✓; DataHub `item_detail` po dokładnym itemId = jedna wskazana oferta, autentyczność jak
  `detail` — GALERIA-ALI §0). Snapshot pobrany **2026-07-24T16:22Z (dziś)**.
- **⛔ WHITE-LABEL:** `Brand Name = NONE` — produkt **nie ma nadruku marki producenta** (dobrze).
  Pudełko/instrukcja z recenzji: generyczne „Car Trunk LED Atmosphere Light" (bez marki) + chiński
  leaflet. Okładka TikTok (g6) ma logo **Changan** (marka AUTA, nie produktu) + chińską tablicę →
  **g6 ODRZUCONA**. Nowa mini-marka „Lśnik" nie bije się z żadną marką produktu.
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Automobiles & Motorcycles > Atmosphere Lamp / Trunk light.

## 1. Cena
- **NASZA cena PL: 34,90 zł** [ODCZYT z `wf2_products.price` — krok `kalkulacja` DONE; fabryka
  landingów NIE ustala i NIE zmienia ceny]. Końcówka zgodna z regułą (<150 → ,90).
- **Koszt zakupu (sprzedawany wariant 2M, $7.06): 26,83 zł** [KONKRET-SKU]
  = **$7.06 × kurs NBP 3,8000** (tab. **142/A/NBP/2026, 2026-07-24**). Zapisane w
  `wf2_products.cost_purchase = 26,83`.
- **Zysk/szt. 7,37 zł** (po prowizji 2%, wysyłka po stronie klienta) [`unit_profit` GENERATED] —
  narzut ~27% na koszcie. Nota kalkulacji: 34,90 zł = najniższa cena psychologiczna powyżej minimum;
  końcówka ,90 podbija narzut ponad pasmo 10–15% (produkt tani).
- **Koszty wariantów USD** [KONKRET-SKU, `sku_prices`]: **2M White $7.06 · 2M Warm $7.06** (baza) ·
  4M White $9.58 · 4M Warm $9.58. ⚠️ **PUŁAPKA MODELU CENY:** przy 34,90 zł w marży mieści się
  WYŁĄCZNIE wariant **2M** (~26,83 zł landed). Wariant **4M** (~36,40 zł landed) jest **stratny** →
  **NIE oferować na stronie**. Strona sprzedaje **2M**, cena PL jedna: 34,90 zł; wybór koloru
  (biały ↔ ciepły biały) = ta sama cena.
- Dostawa/COD/zwrot: warunki sklepów fabryki (COD + zwrot 14 dni, checkout platformy).

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC]
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | NONE | *brak marki producenta — dobrze (white-label)* |
| Item Type | Atmosphere lamp | lampa nastrojowa/ambient |
| Origin | Mainland China | *WEWN.* |
| Material | others | puste/bez wartości → patrz §2b (silikon z opisu/leaflet) |
| High-concerned chemical | None | puste — POMIŃ |

> ⚠️ **`specs` aukcji są UBOGIE** (Brand=NONE, Material=others) → **⛔ zero zmyślonych cm/kg/lumenów/W**.
> Konkrety techniczne poniżej mają kotwicę w OPISIE + GALERII + zdjęciach/instrukcji od kupujących (§2b).

## 2b. Specyfikacja z OPISU + galerii + instrukcji kupujących — [OPIS]/[GALERIA]
| Parametr | Wartość | Kotwica |
|---|---|---|
| Materiał | **silikon** (elastyczna, giętka taśma; wodoodporna) | opis „Flexible and Soft Light Tube… bend without breaking", „Waterproof Design"; instrukcja rev2 „硅胶" (silikon); pudełko rev1 „FLAME RETARDANT FLEXIBLE RUBBER" |
| Zasilanie | **DC 12V** (instalacja samochodowa) | instrukcja rev2 „产品电压 DC 12V" [GALERIA zdj. kupującego] |
| Długość | **2M** (sprzedawana) / 4M (poza marżą) | `variants`/`sku_prices` + instrukcja rev2 „4M/2M" |
| Kolor światła | **biały / ciepły biały** | `variants` (2M White, 2M Warm) + galeria g0/g4/g5 (biały), g1/g2/g3 (ciepły) |
| Auto-czujnik | **zapala się po otwarciu klapy, gaśnie po zamknięciu** | opis „lights up immediately upon opening… automatically turns off when closing the box"; instrukcja rev2 „开箱即亮，关闭后备箱自动熄灯"; g3 „Trunk induction lighting" [GALERIA] |
| Montaż | **bezinwazyjny** — wpięcie w oryginalną lampę/zasilanie klapy, samoprzylepny, **cięty na długość** | opis „wiring free… Embed installation"; instrukcja rev2 (6 kroków: wsuwa przewód, wciska taśmę w szczelinę ramy, docina nadmiar); pudełko rev1 „NON DESTRUCTIVE / INVISIBLE INSTALLATION" |
| Efekt dynamiczny | **„przesuwający się"/skanujący zapłon światła** | opis „After cutting the light strip, the scanning effect is asymmetric"; źródłowy TikTok „Dynamic trunk lights" — ⚠️ [OPIS], NIE claim liczbowy; pokazać w scenie/animacji, nie jako parametr |
| Odporność | wodoodporna; „high temperature resistance" | opis „Waterproof… withstand rain, splashes"; pudełko rev1 |
| Wymiary/waga/lumeny/moc | **BRAK DANYCH** (specs nie podają) — ⛔ zero zmyślonych | — |

### 2a. ⚠️ SANITY LICZB — ROZSTRZYGNIĘCIE
- **Długość: na stronę KONKRET = 2M** (sprzedawany wariant). ⛔ ZAKAZ obietnicy „4M" (poza marżą).
- **„Dynamiczny"/„scanning" = efekt WIZUALNY z opisu**, nie zmierzony parametr → pokazujemy sceną/
  animacją hero, ⛔ NIE jako liczba (np. „X trybów"/„X diod/m" — brak danych = CUT).
- **Napięcie DC 12V** [instrukcja rev2] — bezpieczna do zacytowania (kotwica wizualna). Lumeny/watt = BRAK.

## 3. Destylacja opisu sprzedawcy — FAKT / BEŁKOT
**FAKTY (z kotwicą — wolno użyć feature→benefit):**
- Auto-czujnik (otwierasz klapę → światło; zamykasz → gaśnie) → „bagażnik sam wita Cię światłem —
  zero szukania włącznika" (kotwica: opis + instrukcja rev2 + g3 „induction"). **RDZEŃ USP.**
- Świeci ciągłą LINIĄ wokół ramy → „ciepły/biały obrys światła w całym bagażniku, nie punktowa lampka"
  (kotwica: g0–g4 realne kadry — światło biegnie wokół całej klapy).
- Elastyczna silikonowa taśma, cięta na długość → „dopasujesz do KAŻDEGO auta, docinasz nadmiar"
  (kotwica: opis „flexible soft tube… bend without breaking"; instrukcja rev2 krok 4 „docinanie").
- Montaż bezinwazyjny, wpięcie w lampę klapy → „montaż bez wiercenia, wpinasz w oryginalne światło"
  (kotwica: opis „wiring free"; pudełko rev1 „non-destructive invisible installation").
- Wodoodporna → „nie boi się deszczu i wilgoci w bagażniku" (kotwica: opis „Waterproof Design").
- Praktyczne oświetlenie → „widzisz, co pakujesz i wyjmujesz po zmroku" (kotwica: opis „bright light
  makes it easy to spot and retrieve items in low-light"; g0 realny kadr biały w nocy).

**BEŁKOT / OSTROŻNIE (CUT albo forma zawężona):**
- „enhancing atmosphere", „high brightness", „premium" — superlatywy bez miary → **BEŁKOT-CUT**.
- „General Motors / Suitable vehicle model" (opis) — mylące (to nie marka GM, tylko „ogólne auta") →
  na stronę: „pasuje do większości aut" bez wymieniania marek.
- Kolory z leaflet „czerwony/niebieski/lodowy" (rev2) — to INNE warianty katalogu; **MY sprzedajemy
  biały/ciepły biały** → ⛔ nie oferować kolorów RGB.

## 4. Warianty
`sku_prices` = 4 SKU: **2M White $7.06 · 2M Warm $7.06 · 4M White $9.58 · 4M Warm $9.58**.
**MODEL CENY: jedna cena PL 34,90 zł dla wariantu 2M** (biały ↔ ciepły biały — dowód koloru w galerii
g0/g4/g5 biały, g1/g2/g3 ciepły → **swatch koloru DOZWOLONY**: „Biały" / „Ciepły biały", ta sama cena).
Wariant **4M** (droższy, ~36,40 zł landed) **NIE oferowany** (poza marżą; §1). ⛔ Kolory RGB z leaflet
(czerwony/niebieski) = inne warianty katalogu, **poza sprzedawaną konfiguracją**.

## 5. Dowód społeczny
- **Ocena: ★ 4,6 / 5** [KONKRET, `review_stats`] · **16 ocen** · **91,3% pozytywnych**.
- **5 recenzji z treścią** (4× 5★, 1× 4★; teksty EN — `text_pl` = oryginał bez tłumaczenia).
  Zawierają realne uwagi (uczciwość Z5). Treści §5a.
- **sold_volume = brak/null** → **POMIJAMY na stronie** (żadnej frazy „tysiące zamówień"; brak danych).
- **shop = null** — nic do ukrycia; i tak 🚫 nazwa sprzedawcy NIGDY na stronie (white-label; grep-gate F6).

### 5a. Recenzje (5 treści — VERBATIM, imiona zanonimizowane przez Ali)
1. ★5, 1 zdjęcie: „Looks great" — **plus: wygląd; realny kadr białego światła w bagazniku (rev0).**
2. ★5, 2 zdjęcia: (bez tekstu) — zdjęcia = unboxing (pudełko „Car Trunk LED Atmosphere Light" + zwój
   silikonowy + instrukcja + przewody) → **dowód realnej dostawy fizycznego produktu.**
3. ★5: „The tape is great." — **plus: dobra taśma/klej montażowy.**
4. ★5: „Fast shipment. i only need instructions" — **plus: szybka wysyłka; MINUS: instrukcja
   niejasna (leaflet po chińsku) → FAQ: prosty montaż PL krok po kroku.**
5. ★4: „Doesn't fit the boot. but however it looks great around the panoramic roof trim when wired
   into the courtesy lights. nissan qashqai j11b." — **MINUS uczciwy: u niektórych aut nie obejmie
   całego bagażnika (docina się / można poprowadzić inaczej); PLUS: elastyczna — działa też np. przy
   dachu panoramicznym.** → sekcja `dopasowanie`/FAQ: „docinasz na długość swojego auta".

**Wzorce (plusy → copy):** ładny efekt · dobra taśma montażowa · szybka wysyłka · realny produkt
(unboxing) · elastyczna (poprowadzisz gdzie chcesz).
**Wzorce (REALNE minusy → FAQ/porównanie uczciwie):** instrukcja oryginalna po chińsku (damy prostą
PL) · przy niektórych autach trzeba dociąć / nie obejmie 1:1 całej ramy (elastyczna = docinasz).

## 6. Materiał wizualny → `gallery_curated`
Kuracja 7 kadrów (g0–g5 galeria detail + g6 okładka TikTok): **6 keep (5 wymaga CROP tekstu EN)** /
**1 odsiew (g6)**. ⚠️ **Brak w pełni czystego packshotu bez tekstu** — g5 (zwój na bieli) po CROP =
najbliższy packshot; g0 (biały w nocy) = jedyny czysty lifestyle bez tekstu. Zdjęcia kupujących 5★:
**3 kadry** (rev0 in-use biały · rev2 unboxing · rev1 pudełko) — materiał realny do sekcji
„zdjęcia od kupujących" (sekcja **BUILD**, mamy materiał). Pełne werdykty: `galeria-kuracja/GALERIA.md`
+ `bud_tt_products.gallery_curated`.

## 7. Wygląd i wideo
- **PASZPORT wizualny:** `PASZPORT.md` (cechy dyskryminujące + „CZEGO NIE MA" + white-label).
- **Wideo:** `ali_snapshot.video_url = null` → **BRAK wideo produktu na aukcji**. Źródłowy TikTok
  (`@blazexel`, 467k odtworzeń) POKAZUJE ten produkt (dynamiczne światło bagażnika), ale ma wypalony
  tekst „Dynamic trunk lights" + chińską tablicę + logo Changan → **surowy TikTok niezdatny (prawa/
  branding)**. Efekt dynamiczny oddamy **animowaną sceną hero (Kling i2v, F5)**, nie surowym klipem.
  `videos_curated` zapisane. Sekcja wideo = klasa dowodowa (F1a) → **blokada-tomek** (WIDEO.md).
- **MAPA ZASTOSOWAŃ:** `MAPA-ZASTOSOWAN.md` (F0.6b — funkcja + spektrum kontekstów).
