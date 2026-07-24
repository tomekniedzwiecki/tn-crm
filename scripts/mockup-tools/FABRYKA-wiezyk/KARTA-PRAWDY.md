# KARTA PRAWDY — WIEŻYK (wysoki drapak-domek / kocia wieża 162 cm) · F0.6 · 2026-07-24

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET-SKU]** / **[SPEC]** (tabela
parametrów / tytuł) / **[GALERIA]** (dowód z kadru) / **[OPIS]** (destylat opisu-FAKT) /
**[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** wielopoziomowy **drapak-domek dla kota (kocia wieża / cat tree)**, **162 cm** wysokości,
  z dużą **jaskinią-domkiem** (condo), **koszem-gniazdem**, **hamakiem**, **punktem widokowym**
  na szczycie, **słupkami sizalowymi do drapania** i wbudowanymi zabawkami (pompony na sznurku,
  sznur do wspinania). Tytuł: „162 cm Cat Tree for Indoor Cats, Cat Tower with Large Hiding Cave,
  Scratching Post with Large Platforms, Multi-Level Cats Activity Center, Sisal Rope, Hammock".
- **Mini-marka = „Wieżyk"** · **slug = `wiezyk`** — **ZAREZERWOWANA** w `bud_brand_names`
  (id `94df2ef0-31ed-4017-b788-f7b4ddce4a7f`, INSERT-or-fail ✓, 2026-07-24). Motyw: „własna
  WIEŻA kota" — mechanizm/struktura (pionowe królestwo), nie jedno zastosowanie (anty-Popiołek OK,
  produkt wielofunkcyjny — patrz MAPA-ZASTOSOWAN.md).
- **Rekord kuracji:** `bud_tt_products.id = 5229fe5c-3dbd-475d-b752-96e97c583310`
  (`gallery_curated`). ali_product_id `1005012500407228`.
- **Źródło danych:** aukcja AliExpress `1005012500407228`, **`source='datahub'` = ZAUFANE**
  (gate F0 PASS ✓ — `TRUSTED_SNAPSHOT_SOURCES = detail|allegro|datahub`).
- **⛔ WHITE-LABEL:** marka **„Hzuaneri"** (spec Brand Name) — **NIGDY na stronie**. Produkt nie ma
  czytelnego nadruku marki na kadrach (zero retuszu). `shop = null` (brak nazwy sprzedawcy).
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Zwierzęta > cat trees.

## 1. Cena
- **NASZA cena PL: 379,00 zł** [ODCZYT z `wf2_products.price` — krok `kalkulacja` DONE; fabryka
  landingów NIE ustala i NIE zmienia ceny]. Końcówka zgodna z regułą (≥150 → pełne/9,00).
- **Koszt zakupu: 323,19 zł** [z `wf2_products.cost_purchase`; = **$85,05 × kurs NBP ≈ 3,80**
  zapisany przez krok kalkulacja]. `sku_prices` = **$85,05** dla WSZYSTKICH 3 wariantów kolorów.
- **fees_pct 2% · margin_mode = test.** Narzut ≈ 17% (379,00 − 323,19 = 55,81 zł brutto; po
  prowizji ≈ 48 zł/szt.). ⚠️ **SANITY (nota do Tomka, F-1 — buduję dalej, NIE oceniam):** marża
  cienka jak na drapak 162 cm; brief zlecenia podawał koszt „301,41 zł", realny snapshot/panel ma
  **323,19 zł** — na stronę i tak idzie tylko CENA (379,00 zł); koszt = wewnętrzny.
- Dostawa/COD/zwrot: warunki sklepów fabryki (COD + zwrot 14 dni, checkout Trevio).

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC]
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | Hzuaneri | *WEWN. — white-label, nie na stronę* |
| Item Type | cat trees | drapak / kocia wieża |
| No. of Tiers | Five Layers and Above | → **wielopoziomowa (6 poziomów wg opisu)** |
| Type | cats | |
| Origin | Mainland China | *WEWN.* |
| CN | Guangdong | *WEWN.* |
| High-concerned chemical | None | brak zadeklarowanych substancji szczególnie niebezpiecznych |

## 2b. Specyfikacja z OPISU + rozmiarówki g4 — [OPIS]/[GALERIA]
| Parametr | Wartość | Kotwica |
|---|---|---|
| Wysokość | **162 cm** | [SPEC tytuł „162 cm" + OPIS „Product Dimensions: 50 x 40 x 162 cm"] — ⚠️ g4 „164,5 cm" = figura marketingowa, na stronę **162 cm** |
| Domek-jaskinia (condo) | **50 × 40 × 33 cm** | [OPIS „large cave 50 x 40 cm" + GALERIA g4 „50 / 40 / 33 cm"] |
| Punkt widokowy (top perch) | **50 × 30 cm** | [OPIS „large lookout (50 x 30cm)"] |
| Kosz-gniazdo | **Ø 30 cm** | [GALERIA g4 „30 cm"] |
| Podstawa | **52,5 × 42,5 cm** | [GALERIA g4] |
| Waga produktu | **14 kg** | [OPIS „Weight: 14 kg"] |
| Materiał | **płyta wiórowa** (podstawa/konstrukcja) · **plusz** · **sizal** | [OPIS „Particleboard, Plush, Sisal"] |
| Drapanie | **5 pni sizalowych**; strefa drapania na każdym poziomie | [OPIS „5 sisal trunks", „scratching area on each floor"] |
| Pojemność | **do 5 dużych kotów, każdy do 7 kg** | [OPIS „suitable for 5 large cats (each up to 7 kg)"] |
| Stabilność | gruba płyta wiórowa z pogrubioną krawędzią + **zestaw antyprzechyleniowy (anti-tip)** | [OPIS „thick particle board… thickened edge strips", „anti-tip kit" + GALERIA g1 „Stable Base"] |
| Zawartość zestawu | 1× drapak · 1× zestaw anti-tip · 1× torebka z akcesoriami · 1× instrukcja | [OPIS „Package Contents"] |
| Elementy | domek-jaskinia · kosz-gniazdo · hamak · punkt widokowy · platformy · pompony na sznurku · sznur do wspinania | [GALERIA g0–g7 + OPIS] |

### 2a. ⚠️ SANITY LICZB
- **Wysokość 162 vs 164,5 cm:** tytuł + opis = **162 cm** (kotwica podwójna); rozmiarówka g4 =
  „164,5 cm" (grafika marketingowa). Na stronę **162 cm**. ⛔ nie obiecywać „164,5".
- **Liczba poziomów:** spec „Five Layers and Above" + opis „6 layers" → **„6 poziomów"** [OPIS]
  (spójne: 6 ≥ 5). Bez przesady „więcej niż 6".
- **„FSC-Certified wood" (opis) = [WĄTPLIWE] → CUT jako twardy claim** (brak dowodu certyfikatu;
  materiał realny = płyta wiórowa/particleboard). Nie eksponować certyfikatu FSC na stronie.
- Wymiary komponentów (domek/kosz/podstawa) = **[GALERIA g4]** — rozmiarówka producenta; podawać
  jako „ok." z kotwicą, nie jako spec-tabelę precyzyjną.

## 3. Destylacja opisu sprzedawcy — FAKT / BEŁKOT
**FAKTY (z kotwicą — wolno użyć feature→benefit):**
- **Chroni meble:** 5 pni sizalowych + strefa drapania na każdym poziomie → „kot drapie sizal
  zamiast Twojej kanapy i zasłon" (kotwica: OPIS „5 sisal trunks… your furniture will be protected
  from the claws" + GALERIA słupki sizalowe g0–g7). **RDZEŃ USP #1.**
- **Cała pionowa przestrzeń dla kota:** 162 cm, wielopoziomowa → „kot wspina się, obserwuje z góry,
  ma własne piętra" (kotwica: tytuł „162 cm… Multi-Level" + OPIS „6 layers" + g0/g7). **RDZEŃ USP #2.**
- **Kryjówka + legowiska:** duża jaskinia-domek 50×40 + kosz-gniazdo + hamak → „schowa się, wyśpi,
  ma bezpieczne miejsce" (kotwica: OPIS „large cave 50x40… furry hanging basket and hammock" +
  g0/g3/g5/g7). **RDZEŃ USP #3.**
- **Dla kilku / dużych kotów:** do 5 kotów po 7 kg → „wystarczy nawet dla kilku lub dużych kotów"
  (kotwica: OPIS „5 large cats up to 7 kg" + g0 pięć kotów naraz).
- **Stabilna, nie przewróci się:** gruba podstawa + zestaw anti-tip → „stoi pewnie, nie chwieje się
  przy skoku" (kotwica: OPIS „thick particle board… anti-tip kit" + g1 „Stable Base").
- **Wbudowane zabawki:** pompony na sznurku, sznur do wspinania → „kot ma się czym bawić od razu"
  (kotwica: g0–g7 + OPIS „multiple plush balls… climbing rope").
- **3 kolory do wnętrza:** beż / jasnoszary / ciemnoszary → „dopasujesz do salonu" (kotwica:
  `sku_prices` + g0/g2 beż, g7 jasnoszary, g6 ciemnoszary).

**BEŁKOT / OSTROŻNIE (CUT):**
- „Endless Climbing Fun", „Super Multifunctional Cat Playground", „fashionable sense of modern home",
  „Decorate Your Home", „perfect for cats", „meet their natural instincts" — **BEŁKOT-CUT**
  (superlatywy / oceny bez miary).
- „FSC-Certified wood" — **[WĄTPLIWE-CUT]** (brak dowodu; patrz §2a).

## 4. Warianty
**3 warianty kolorystyczne** (`sku_prices`, ta sama cena $85,05): **Beżowy** · **Jasnoszary** ·
**Ciemnoszary** (etykiety „…/ Germany" = lokalizacja wysyłki, nie kolor). **Dowód koloru w galerii
→ SWATCHE dozwolone (3):** beż [g0/g2/g4], jasnoszary [g7], ciemnoszary [g6/g5]. **MODEL CENY:
jedna cena PL 379,00 zł; wariant = wybór estetyczny.** Kanon hero = **beżowy** (cover/main_image g0).

## 5. Dowód społeczny
- **Ocena: ★ 5,0 / 5** [KONKRET, `review_stats`: avg 5, positivePct 100] · **⚠️ TYLKO 1 OCENA**
  (`numRatings = 1`). **MAŁE LICZBY = ZAKAZ social-proof:** ⛔ żadnych „setki zadowolonych",
  liczników, „★5,0 (1 ocena)" jako baner. Pojedynczy uczciwy cytat wolno pokazać BEZ implikowania
  liczby (decyzja o sekcji „opinie" → F1; domyślnie NIE ściana opinii).
- **1 recenzja z treścią** (★5, EN; `text_pl` = oryginał): „A very nice little tree. The pieces fit
  together well. Easy to assemble. The cat is happy. Thank you." — bez zdjęć. Sygnały: **łatwy
  montaż**, **kot zadowolony**. Uczciwie: to JEDNA opinia.
- **sold_volume = null** → brak; **żadnej frazy „tysiące zamówień"**.
- **Zdjęcia od kupujących:** recenzja bez zdjęć; Storage bez folderu recenzji (protokół wyczerpania
  w GALERIA.md) → **BRAK materiału** → sekcja = klasa dowodowa → **`blokada-tomek`** (nie skip).
- **shop = null** — nic na stronę.

## 6. Materiał wizualny → `gallery_curated`
Kuracja 8 kadrów: **4 keep czyste lifestyle** (g0 beż-hero · g2 beż-human · g7 jasnoszary-struktura ·
g6 ciemnoszary) + **4 DANE** (g4 rozmiarówka · g3 nazwy elementów · g1 stabilność · g5 dowód
ciemnoszarego + hamak). Galeria BOGATA — brak potrzeby fallbacku. Pełne werdykty: `GALERIA.md` +
`bud_tt_products.gallery_curated`.

## 7. Wygląd i wideo
- **PASZPORT wizualny:** `PASZPORT.md` (cechy dyskryminujące + „CZEGO NIE MA" + 3 warianty koloru).
- **Wideo:** `ali_snapshot.video_url = null` → **BRAK czystego wideo aukcji**. `tiktok_url`
  (`@angelab0ss/...7652438554286492959`) = **cudzy klip twórcy** (prawa autorskie — LL: surowy
  TikTok NIE) → niezdatny. `videos_curated` = nota „brak zdatnego wideo". Sekcja wideo = klasa
  dowodowa (F1a) → **`blokada-tomek`** (decyzja Tomka), nie fabryki. Szczegóły: `WIDEO.md`.
