# KARTA PRAWDY PRODUKTU — Rozgrzewek (podgrzewany masażer do ciała, brush gua sha)

Źródło: `bud_tt_products.ali_snapshot` (source=**detail**, fetched 2026-07-21)
· aukcja `1005008248153062` · projekt wf2 `448f2395` (Ulepszek) · produkt wf2 `4404200a-c774-48fe-ad50-0529ac08a095`
· TT `5e1d40a8-a351-4609-a8d7-c9492e2c6dd8`

## 0. Tożsamość
- Klasa produktu: **ręczny, ładowany elektryczny masażer do ciała typu „gua sha / szczotka
  masująca"** — kopułowa główka z metalowymi kulkowymi bolcami („brush heads"), z podgrzewaniem
  (ciepły okład), wibracjami i mikroprądami/EMS, sterowany z rączki z okrągłym wyświetlaczem LED
  (poziom 1–9) i 3 kolorowymi wskaźnikami (czerwony=grzanie, niebieski=wibracje, zielony=elektrody).
  Tytuł aukcji (EN): „Rechargeable Guasha Massager Body Shaping Heating Meridian Scraping Brush
  Lymphatic Drainage Machine Fat Burner". Kategoria Ali (WEWNĘTRZNA): **Beauty & Health /
  Massage & Relaxation** — NIE na stronę.
- Nazwa systemowa produktu (wf2): „Podgrzewany masażer do drenażu limfatycznego".
- Mini-marka: **Rozgrzewek** · slug `rozgrzewek` (zarezerwowana w `bud_brand_names`
  id `2ff78b6f`, `landing_ref=ulepszek`, `user_ref=fabryka`; FK po TT-id).
- ⚠️ **WELLNESS / BEAUTY, NIE WYRÓB MEDYCZNY** — patrz ZAKAZY: język konsumencki i ostrożny;
  ZERO twierdzeń leczniczych. Tytuł aukcji jest naszpikowany claimami medycznymi/odchudzającymi
  („Lymphatic Drainage", „Fat Burner", „Body Shaping", „Meridian") — to NIE są dowody funkcji,
  to marketing sprzedawcy do CUT.

## 1. Cena
- Koszt zakupu (`sku_prices`, wszystkie 4 warianty = ten sam produkt, różny kolor):
  `WHITE` **$17.19** · `Blue` **$17.74** · `GRAY` **$18.65** · `Ivory` **$19.03**.
- ⚠️ **PUŁAPKA CENOWA (rozstrzygnięta — lekcja Merach):** `price.sale`=$17.19 == `price.original`≈$17.20
  == cena **najtańszego** SKU (WHITE). Poprzednia kalkulacja przyjęła $17.19 → koszt **65,23 zł** →
  cena **74,90 zł** (realny narzut tylko **2%**, zysk 1,19 zł — **poza pasmem 10–15%**). **BŁĄD bazy marży.**
- **Baza marży = MAX kosztu wariantów = `Ivory` $19.03** (GALERIA-ALI §5; chroni marżę niezależnie
  od wybranego koloru). Kurs NBP zapisany przy rekalkulacji **2026-07-22: 3,7945 PLN/USD** →
  koszt **72,21 zł** (zmiana +11%).
- **NASZA cena PL = 84,90 zł** (ODCZYT z `wf2_products.price` po rekalkulacji
  `--cost-usd 19.03 --force`; narzut **15%**, zysk **10,99 zł/szt.** po prowizji 2%).
  Jedna cena dla wszystkich wariantów. [KONKRET-SKU: MAX] · nota w `wf2_notes` id `1fae763d`.
- Cena zapieczona w HTML MUSI == `wf2_products.price` = 84,90 zł (gate `cena_panel`).

## 2. Specyfikacja (specs 1:1 VERBATIM, puste pominięte)
| Cecha | Wartość |
|---|---|
| Brand Name | Hailicare |
| Material | ABS & TPR |
| Hand Instrument | Yes |
| Electronic | Yes |
| Voltage | ＜50V AC |
| Power Supply | Direct Current |
| Application | BODY |
| Certification | CE, RoHS |
| Item Type | Massage & Relaxation |
| Origin | Mainland China |
| High-concerned chemical | None |
| Choice | yes |

⚠️ „Brand Name = Hailicare" → **na stronie NIGDY** (white-label; nie widać wyraźnego nadruku na
egzemplarzu w g0, ale marka jest w specs → generacje NEG „no printed brand text / logo").
⚠️ Specs NIE zawierają wymiarów, wagi, mocy, pojemności baterii, liczby poziomów — te dane pochodzą
z OPISU sprzedawcy (§3), oznaczone [OPIS]. Zero zmyślonych cm/kg poza tym, co ma kotwicę.
⚠️ „Voltage ＜50V AC" = deklaracja bezpiecznego napięcia (SELV); zasilanie realne to ładowana bateria
DC 5V (§3) — NIE claimować „zasilanie sieciowe 230V".

## 3. Opis sprzedawcy — DESTYLACJA
Opis aukcji (EN) obecny (nagłówek „Color: blue"). FAKTY z kotwicą (specs/tytuł/galeria/opis/opinie),
reszta CUT:
- FAKT [tytuł „Heating" + galeria g1 „Heating indicator: red" + opis „9 levels of constant temperature
  hot compress"]: **podgrzewanie / ciepły okład** — rdzeń „Rozgrzewka"; poziomy temperatury (opis: 9),
  wskaźnik czerwony = grzanie włączone.
- FAKT [galeria g4 „9-speed high-frequency vibration" + opis „9 levels of vibration" + opinia
  „nine power levels"]: **wibracje, 9 poziomów** (wskaźnik niebieski). [KONKRET z 3 kotwic]
- FAKT [tytuł „Guasha … Scraping Brush" + galeria g3 „21 steel brush heads" + g0 główka]:
  **główka masująca z metalowymi (stalowymi) kulkowymi bolcami — 21 sztuk, w koncentrycznych
  pierścieniach**; styl masażu „gua sha / szczotkowanie". [KONKRET liczbowy: 21]
- FAKT [galeria g5 „Pulse micro-current" + g1 „Electrode indicator: green" + ikona „EMS" na wariancie
  różowym g0 + opis „9 levels of micro-current"]: **funkcja mikroprądów / EMS (elektrody, 9 poziomów)**
  — FUNKCJA obecna; ⛔ efekt tylko neutralnie, ZERO „terapia/leczenie" (patrz ZAKAZY).
- FAKT [galeria g0/g3 czerwona poświata w główce + opis „red light therapy"]: **czerwone światło LED**
  w główce — cecha WIDOCZNA (czerwony LED); ⛔ ZERO claimu „terapia światłem/red light therapy".
- FAKT [spec Electronic=Yes, Power Supply=DC + opis „Input 5V 1A … Battery 1200mAh … Charging 3 hours …
  Using time 50 minutes"]: **ładowany, bezprzewodowy** (wbudowana bateria); [OPIS]: bateria ~1200 mAh,
  ładowanie ~3 h, praca ~50 min na ładowaniu. ⚠️ liczby TYLKO z opisu (nie ze specs) — [OPIS], sanity OK.
- FAKT [opis „30-minute smart timer"]: **timer / auto-wyłączanie po 30 min**. [OPIS]
- FAKT [spec Material]: obudowa/główka z **ABS i TPR**. [SPEC]
- FAKT [spec Application=BODY + galeria g2/g4]: **do ciała** — kark, ramiona, plecy, brzuch (obszary
  z g2/g4; sam obszar użycia — bez claimu leczenia bólu). [SPEC + GALERIA]
- FAKT [spec Certification]: **CE, RoHS**. [SPEC]
- **BEŁKOT / CLAIM MEDYCZNY (CUT):** „Lymphatic Drainage Machine" (drenaż limfatyczny jako efekt),
  „Fat Burner" (spalacz tłuszczu), „Body Shaping / Body Sculpting" (modelowanie sylwetki), „Meridian
  Scraping / unblocking meridians" (udrażnianie meridianów), „red light therapy", „micro-current
  therapy", „promoting blood circulation" (poprawa krążenia), „penetrate deep into muscles / deeply
  massages / accelerates the movement of muscle groups", „drives away fatigue / alleviating physical
  fatigue" (usuwa zmęczenie jako rezultat), „Comfort from the Inside Out", claimy bólu z g2 (menstrual/
  back/neck/lumbar pain). Wszystko powyżej = ODRZUCONE.
- **WĄTPLIWE (CUT chyba że nowa kotwica):** dokładne wymiary i waga (BRAK w specs i opisie);
  „5 dni na jednym ładowaniu" (opis — zależne od intensywności, nie cytować jako gwarancję);
  precyzyjne temperatury w °C (brak liczb — tylko „ciepły okład, poziomy").

## 4. Warianty
Kolory z `variants` + `sku_prices`; dowód wizualny = galeria detail:
| Oryg. SKU | PL (kolor) | Koszt USD | Swatch? |
|---|---|---|---|
| Blue | Granatowy / niebieski | $17.74 | ✅ **pełny dowód**: g0 (główny, multi-kąt) + g1/g3/g4/g5 — cały produkt i główka |
| WHITE | Biały | $17.19 | ⚠️ dowód SŁABY: tylko mały widok rączki z góry w g0 (brak główki/lifestyle) |
| Ivory | Kość słoniowa / szampański | $19.03 | ⚠️ możliwy = biały z „szampańskim" pierścieniem w g0; mapowanie WHITE↔Ivory **niepewne** |
| GRAY | Szary (rączka szara + główka różowa?) | $18.65 | ⚠️ dowód SŁABY: mały widok „różowo-szarego" wariantu z góry w g0 |

⚠️ Mapowanie kodu SKU → konkretny kolor z g0 jest **niepewne** (4 SKU, 3 różne egzemplarze widoczne
w g0: granatowy, biały/szampański, różowo-szary). **Rekomendacja F1: sprzedajemy WYŁĄCZNIE wariant
GRANATOWY (Blue)** — jedyny z pełnym dowodem wizualnym (główny packshot + wszystkie infografiki);
biały/kość/szary mają tylko miniaturę z góry (brak zdjęcia główki i użycia) → ryzyko niezgodności
z zamówieniem. Decyzja ostateczna F1.
MODEL CENY: **JEDNA cena PL 84,90 zł**; wariant = wybór estetyczny. Baza marży (Ivory $19.03) chroni
marżę niezależnie od koloru; różnice cen wariantów WEWNĘTRZNE — nie na stronę.

## 5. Dowód
- `sold_volume` = **262** (globalne Ali) → **PONIŻEJ progu 1000** → **ZAKAZ jakiejkolwiek frazy
  o sprzedaży**; rola wyłącznie wewnętrzna (gate doboru).
- `review_stats`: avg **4,9** · **N=27** · 98% pozytywnych → **N za małe: ZAKAZ social-proof
  liczbowego** (żadnych „★4,9 · 27 ocen"). Opinie: **20 szt.**, teksty EN generyczne (część „AliExpress
  Shopper"), ALE **wiele opinii ma REALNE zdjęcia produktu** (zrehostowane do `bud-reviews/1005008248153062/`:
  m.in. `0-0…3-3`, `4-0…7-3`, `8-0`, `9-1`) → **sekcja opinii MOŻLIWA z UGC-zdjęciami** (podpis
  „zdjęcia od kupujących"), bez liczb/ocen. Treść opinii (fakty): łatwy w użyciu, „feels good",
  dobra jakość materiału, **9 poziomów mocy** (potwierdza funkcję), „nie grzeje się za mocno, ale ok
  do masażu", „różne poziomy". **Prawdziwe minusy (do porównania — Z5):** „chciałbym mocniejszy",
  „przydałaby się dłuższa rączka", „nie grzeje bardzo mocno".
- `video_url` aukcji: **BRAK** (null). `tiktok_url` produktu (row-level): `@6931865538570486789/
  video/7595042479448149279` — kandydat do kroku WIDEO/F1 (poster-gate + pobieralność do sprawdzenia;
  NIE oceniany w F0).
- `shop`: „Stone's Store" (Ali) i `tt_shop.name`=„yuonry" (TikTok) — 🚫 **NIGDY na stronie**
  (white-label; grep gate F6).

## 5b. Handel / Checkout (kotwica dla claimów płatności i zwrotu)
- Płatność: **przy odbiorze (COD)** oraz **BLIK / płatność online** — metody kasy sklepu Ulepszek na
  platformie (checkout-inline; delivery-methods z `isCashOnDelivery`).
- Zwrot: **14 dni** od otrzymania — ustawowe prawo odstąpienia konsumenta (art. 27 UoPK); strona
  `/return` sklepu. Żadnych rozszerzonych gwarancji (brak danych).
- Dostawa: koszt wg wybranej metody w podsumowaniu kasy; ZERO deklaracji „darmowa dostawa" i ZERO
  obietnic czasu doręczenia.

## 6. Galeria
→ `bud_tt_products.gallery_curated` + `FABRYKA-masazer/GALERIA.md`. Klasa R keep = **tylko g0
(packshot)** = 1/6; g1–g5 to infografiki z wypalonym tekstem EN → DANE. Fallback sekcji galerii:
UGC z opinii (rehost) + sceny natywne (patrz GALERIA.md).

## 7. Wskaźniki
→ `FABRYKA-masazer/PASZPORT.md` (cechy dyskryminujące + model użycia) ·
`FABRYKA-masazer/ICP-GRUPA-DOCELOWA.md` (persona wnioskowana).

## ZAKAZY TWARDE tego landingu
1. **Zero twierdzeń leczniczych/medycznych** (to NIE wyrób medyczny): żadnego „drenaż limfatyczny /
   usuwa obrzęki / wypłukuje limfę", „poprawia krążenie", „udrażnia meridiany", „redukuje cellulit",
   „leczy ból (pleców/karku/menstruacyjny)", „terapia światłem / red light therapy", „terapia
   mikroprądami". **Nazwy funkcji wolno wymienić NEUTRALNIE** (ciepło/rozgrzewający masaż, wibracje,
   masaż gua sha, mikroprądy/EMS jako tryb) — ale **BEZ obiecywania efektu zdrowotnego**.
   „Drenaż limfatyczny" jeśli w ogóle → tylko jako **nazwa stylu/rytuału masażu**, nigdy jako obietnica
   medyczna (rekomendacja F1: framing neutralny „rozgrzewający masaż ciała / gua sha").
2. **Zero obietnic odchudzania/sylwetki**: żadnego „Fat Burner / spala tłuszcz", „modeluje sylwetkę",
   „schudniesz", „ujędrnia", „spłaszcza brzuch". Dozwolone: „masaż, ciepło, relaks, pielęgnacja".
3. **Zero zmyślonych liczb** poza kartą: wymiary i waga = BRAK DANYCH; bateria/ładowanie/czas pracy =
   [OPIS] (podać ostrożnie, jako „ok. ~"); temperatury w °C = BRAK (tylko „ciepły okład, poziomy").
   9 poziomów wibracji/ciepła/mikroprądów = OK (kotwica g4/g5/opis/opinia).
4. **Zero social-proof liczbowego** (27 ocen / sold 262) i pseudo-liczników/pilności.
5. **Zero nazwy „Hailicare"** ani innego brandu na materiałach strony (spec Brand=Hailicare = white-label;
   generacje NEG „no printed brand text / logo").
6. **Zero wypalonego tekstu / watermarków / obcych scen** z g1–g5 na finalnej stronie (to infografiki
   źródłowe = DANE); brak claimów bólu z g2.
7. **Shop-name NIGDY** („Stone's Store" / „yuonry"). Zero fałszywej pilności/przecen (teaser $17.19 =
   wewnętrzny, nie na stronę).
