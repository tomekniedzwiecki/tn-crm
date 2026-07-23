# KARTA PRAWDY PRODUKTU — Brzuszek (składana maszyna do ćwiczeń brzucha / core)

Źródło: `bud_tt_products.ali_snapshot` (source=**detail**, fetched 2026-07-22)
· aukcja `1005010132139175` · projekt wf2 `448f2395` (Ulepszek) · produkt `6dd560cf-3990-4029-86c4-9f0607a5a019`

## 0. Tożsamość
- Klasa produktu: **składana maszyna do ćwiczeń brzucha / core (ab trainer typu „ab crunch / power plank")**
  — pochylona rama z wałkiem pod klatkę/łokcie, regulowany kąt i wysokość, linki oporowe z uchwytami,
  konsola z wyświetlaczem LCD (licznik powtórzeń/czas/kalorie), składana konstrukcja.
  Tytuł aukcji: „MERACH 2314 Ab Machine Adjustable Trainer Workout Foldable Knee Protection Abdominal
  Exercise Machine Core Ab Exercise System Trainer". Kategoria Ali (WEWNĘTRZNA): Sports & Entertainment /
  Fitness & Body Building.
- Mini-marka: **Brzuszek** · slug `brzuszek` (zarezerwowana w `bud_brand_names`, `user_ref=fabryka-ulepszek`).
- ⚠️ **WHITE-LABEL — TWARDE:** „MERACH" to **obca marka producenta** (spec Brand Name = MERACH, Model 2314),
  fizycznie **nadrukowana na konsoli** (widoczna w g0/g3/g4 + na zdjęciach kupujących). **Nazwa „MERACH"
  NIGDY nie idzie na stronę**; packshoty wymagają retuszu nadruku, generacje = NEG „no printed brand / logo".

## 1. Cena
- Koszt zakupu (sku_prices, wszystkie warianty = pełna maszyna, wysyłka z DE):
  `2314WG3` **$95.56** · `2314BB3` **$95.56** · `2314B` **$95.56** · `2314W` **$96.97**.
- ⚠️ **PUŁAPKA CENOWA (rozstrzygnięta):** `price.sale` = **$81.13** to **kupon-teaser** (rabat od
  `price.original` = $95.56, które DOKŁADNIE równa się cenie bazowego SKU). **Żaden kupowalny wariant nie
  kosztuje poniżej $95.56.** Poprzednia kalkulacja użyła teasera ($81.13 → było 359 zł) — **BŁĄD bazy marży**.
- **Baza marży = MAX kosztu wariantów = `2314W` $96.97** (GALERIA-ALI §5; chroni marżę niezależnie od
  wybranego koloru). Kurs NBP zapisany przy rekalkulacji **2026-07-22: 3,7945 PLN/USD** → koszt **367,95 zł**.
- **NASZA cena PL = 429,00 zł** (ODCZYT z `wf2_products.price` po rekalkulacji `--cost-usd 96.97 --force`;
  narzut **14%**, zysk **52,47 zł/szt.** po prowizji 2%). Jedna cena dla wszystkich wariantów. [KONKRET-SKU: MAX]
- Cena zapieczona w HTML MUSI == `wf2_products.price` = 429,00 zł (gate `cena_panel`).

## 2. Specyfikacja (specs 1:1 VERBATIM)
| Cecha | Wartość |
|---|---|
| Brand Name | MERACH |
| Brand | MERACH |
| Model Number | 2314 |
| Application | AD Abdomen Exercise Machine |
| Type of sports | Strength Training |
| Training Site | Waist, Legs, Waist & Abdomen Exercise, Hip, Core, Other |
| Material | Acrylonitrile Butadiene Styrene (ABS) |
| Color | pink/blue |
| Maximum Weight Recommendation | 440 Pounds |
| Style | Modern |
| Origin | Mainland China |
| High-concerned chemical | None |

⚠️ „Brand Name/Brand = MERACH" → **na stronie NIGDY** (white-label). ⚠️ Brak wymiarów/wagi/materiału
wałka w specs → **zero zmyślonych cm/kg** poza tym, co niżej ma kotwicę.

## 3. Opis sprzedawcy — DESTYLACJA
Opis aukcji (EN) obecny. FAKTY z kotwicą (specs/tytuł/galeria/opis), reszta CUT:
- FAKT [opis + spec Training Site + galeria g4]: ćwiczy **wiele partii** — nie tylko brzuch, także talia,
  nogi, pośladki, ramiona (g4: „Shape Body / Glute / Ab / Arm Workout"; ramiona na linkach oporowych).
- FAKT [opis + galeria g5]: **2 poziomy nachylenia** + **5 regulacji wysokości** (wyższa = trudniej;
  od początkującego po zaawansowanego). [SPEC-brak liczby czasu — nie cytować czasów]
- FAKT [opis + galeria g2]: **pogrubiona pianka na kolanach i łokciach** (U-kształtny wałek), komfort,
  **niski nacisk na stawy** („low impact on knees and joints").
- FAKT [opis + galeria g2]: **ciche rolki/„3 zestawy cichych kółek"** — płynny, cichy ruch (bez zacięć).
- FAKT [opis + galeria g0]: **wyświetlacz LCD** — pokazuje **liczbę powtórzeń, czas, kalorie** (odczyt
  na urządzeniu; kalorie = szacunek sprzętu, **NIE obietnica spalania/odchudzania**).
- FAKT [opis + galeria g5 + opinia]: **składana**, **łatwy montaż** (opinie: „easy to assemble",
  „intuitive", instrukcja w zestawie).
- FAKT [spec Maximum Weight + galeria g0/g3]: **udźwig 440 lbs ≈ 200 kg**; konstrukcja trójkątna,
  pogrubione rurki metalowe. [SANITY OK: 440 lb = 199,6 kg — realny max ciężar użytkownika]
- FAKT [spec Material]: tworzywo **ABS** (elementy obudowy).
- FAKT [galeria g0/g4]: **linki/gumy oporowe z uchwytami** (trening ramion/górnej części ciała).
- **BEŁKOT (CUT):** „especially suitable for people with a lot of belly fat and a thick back"
  (body-shaming/obietnica zdrowotna), „the higher the height the better the fitness effect",
  „increase motivation", „better experience"; równoważnik z g1 „10 = 20 sit-ups / 30 roller wheel /
  50 hula-hoop" (nieweryfikowalne — CUT); jakiekolwiek obietnice spalania kalorii / utraty tłuszczu z brzucha.
- **WĄTPLIWE (CUT):** waga maszyny, wymiary złożonej/rozłożonej, wymiary wałka (BRAK w specs); konkretne
  liczby kalorii; „silent" jako „100% bezgłośne".

## 4. Warianty
Kolory wnioskowane z galerii + zdjęć kupujących + spec Color „pink/blue" (mapowanie kodów SKU niepewne):
| Oryg. SKU | PL (kolor) | Koszt USD | Swatch? |
|---|---|---|---|
| 2314W | Biało-różowy (biała rama + różowe wałki) | $96.97 | ✅ dowód: pełna galeria detail (g0–g6) |
| 2314WG3 | Biało-różowy (wariant/zestaw „G3") | $95.56 | ✅ (jak wyżej; różnica ceny WEWNĘTRZNA) |
| 2314B | Czarno-niebieski (czarna rama + niebieskie wałki) | $95.56 | ⚠️ dowód TYLKO w UGC (opinia `0-0`), brak w galerii detail → swatch warunkowy (decyzja F1) |
| 2314BB3 | Czarno-niebieski (wariant/zestaw „B3") | $95.56 | ⚠️ (jak wyżej) |

⚠️ Sufiks `WG3/BB3` vs `W/B` — **znaczenie nieznane** (możliwy zestaw/bundle); NIE zgadywać na stronie.
MODEL CENY: **JEDNA cena PL 429,00 zł**; wariant = wybór estetyczny (kolor). Różnice cen wariantów WEWNĘTRZNE.

## 5. Dowód
- `sold_volume` = **168** (globalne Ali) → **PONIŻEJ progu 1000** → **ZAKAZ jakiejkolwiek frazy o sprzedaży**;
  rola wyłącznie wewnętrzna (gate doboru).
- `review_stats`: avg **4,9** · **N=7** · 98% pozytywnych → **N za małe: ZAKAZ social-proof liczbowego**
  (żadnych „★4,9 · 7 ocen"). Opinie: 5 szt., teksty EN generyczne („AliExpress Shopper"), ALE **3 z 5 mają
  REALNE zdjęcia produktu** (montaż/użycie) → sekcja opinii MOŻLIWA z **UGC-zdjęciami** (podpis „zdjęcia od
  kupujących"), bez liczb/ocen. Treść opinii (fakty): szybka dostawa, **solidna/stabilna konstrukcja**,
  **łatwy montaż** (instrukcja w zestawie), płynne mechanizmy, zawleczka zabezpieczająca do składania.
- `video_url` aukcji: **BRAK** (null).
- `shop`: „Shop1103659154 Store" — 🚫 **NIGDY na stronie** (white-label; grep gate F6).
- **Wideo dodane do produktu (LL-044, pula → sekcja WIDEO; poster-gate wykonany 22.07):**
  1. `tiktok_url` (jawnie dodany): https://www.tiktok.com/@eves444x/video/7647824562708565270 — **191 317** plays.
     Poster-gate: **PASS/ON-PRODUCT**, nasza kolorystyka **biało-różowa**, kobieta, dom (hook „holiday a week away").
     → najlepszy kandydat na hero-wideo.
  2. `videos_curated.items` (mode=auto_match, **wszystkie keep=false = PROPOZYCJE**; 8 klipów), wg plays DESC (top-5):
     - @ttshoplifter **890 841** (is_ad) — ON-PRODUCT, ale kolor **czarno-czerwony** + kulturysta (męski, ton
       agresywny) → **niezgodny z ICP (różowy/kobieta)**; użyć ostrożnie/pominąć.
     - @ascensionbae **482 920** (is_ad) — ON-PRODUCT, **biało-różowy** (nasza kolorystyka), kobieta, dom;
       opis „8 exercises to do on an Ab Machine" → **zgodny z ICP + świetny do demo** ⭐.
     - @carlosmurray706 **217 104** (is_ad) — ON-PRODUCT, **czarno-czerwony** + kulturysta, hook porównawczy
       → niezgodny z ICP; ostrożnie/pominąć.
     - @carlosmurray706 **16 010** (is_ad) — ON-PRODUCT, **czarno-czerwony** + kulturysta (ten sam twórca) → off-ICP.
     - @gina.ruhnay **8 355** (is_ad) — ON-PRODUCT, **biało-różowy**, kobieta → ton OK.
     Poniżej top-5, warte uwagi: @relifefitnessus **4 818** — ON-PRODUCT, biało-różowy, kobieta, listuje 5 ćwiczeń
     (crunches/side/sit-up/side leg raise/standing knee raise) → dobry do demo. (@seaseaseawang 5 plays — pominięty.)
  ⚠️ **Gate wykonany na POSTERZE/okładce** (klatka reprezentatywna) wszystkich klipów z plays>0 — **każdy =
  poprawny produkt (maszyna ab-crunch), żaden off-product**. Ostateczny gate po klatce środkowej + decyzja keep =
  krok wideo / F1. Preferencja pod ICP (kobieta/róż): **eves444x (hero) + ascensionbae + gina.ruhnay +
  relifefitnessus**; klipy czarno-czerwone (ttshoplifter, carlosmurray — wysokie plays, ale męski kulturysta)
  = tonalnie OFF, nie na tę stronę. Klip niepobieralny yt-dlp = pomiń z notą.

## 5b. Handel / Checkout (kotwica dla claimów płatności, zwrotu i przycisku finalizacji)
- Płatność: **przy odbiorze (COD)** oraz **BLIK / płatność online** — metody kasy sklepu
  Ulepszek na platformie (checkout-inline; delivery-methods z isCashOnDelivery).
- Zwrot: **14 dni bez podania przyczyny** — ustawowe prawo odstąpienia konsumenta (art. 27
  ustawy o prawach konsumenta); strona /return sklepu. Żadnych rozszerzonych gwarancji (brak danych).
- Przycisk finalizacji: **„Zamawiam z obowiązkiem zapłaty"** — wymóg jednoznacznego oznaczenia
  obowiązku zapłaty (art. 17 ustawy o prawach konsumenta); żadnych neutralnych „Kupuję"/„Dalej".
- Dostawa: koszt wybranej metody **oraz suma końcowa widoczne PRZED przyciskiem** finalizacji;
  ZERO deklaracji „darmowa dostawa" i ZERO obietnic czasu doręczenia.

## 6. Galeria
→ `bud_tt_products.gallery_curated` + `FABRYKA-merach/GALERIA.md`. Klasa R keep = **g0 (packshot) + g6 (lifestyle)**
= 2/7 (5/7 to infografiki z wypalonym tekstem → DANE). UGC z opinii dostępne jako uzupełnienie.

## 7. Wskaźniki
→ `FABRYKA-merach/PASZPORT.md` (cechy dyskryminujące + model użycia) · `FABRYKA-merach/ICP-GRUPA-DOCELOWA.md`
· `bud_tt_products.videos_curated` (pula wideo).

## ZAKAZY TWARDE tego landingu
1. **Zero nazwy/logo „MERACH"** na jakimkolwiek materiale strony (nadruk na konsoli = retusz; NEG w generacjach).
2. **Zero obietnic zdrowotnych/odchudzania**: żadnego „spalisz X kalorii", „schudniesz z brzucha", „redukcja
   tłuszczu w tym miejscu"; LCD-„kalorie" tylko jako funkcja licznika (kotwica g0), nie obietnica wyniku.
3. **Zero body-shamingu** z opisu („a lot of belly fat / thick back" — CUT).
4. **Zero social-proof liczbowego** (7 ocen / sold 168) i pseudo-liczników/pilności.
5. **Zero zmyślonych liczb** poza kartą: waga i wymiary maszyny = BRAK DANYCH; udźwig „440 lbs ≈ 200 kg" OK
   (kotwica spec + g0/g3); NIE cytować czasów treningu ani liczb kalorii.
6. **Zero równoważnika z g1** („= 20 sit-ups / 30 roller / 50 hula-hoop" — nieweryfikowalne).
7. **Zero kolorystyki jako obietnicy**: jeśli oferujesz swatch niebieski — dowód tylko UGC (niska jakość),
   nie pokazuj wygenerowanego niebieskiego jako „zdjęcia produktu" bez oznaczenia.
8. **Shop-name NIGDY.** Zero fałszywej pilności/przecen (teaser $81.13 = wewnętrzny, nie na stronę).
