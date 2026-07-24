# KARTA PRAWDY — GADULEK (dziecięce walkie-talkie z ekranem i kamerą, 2-pak) · F0.6 · 2026-07-24

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET-SKU]** (konkret sprzedawanego
wariantu) / **[SPEC]** (z tabeli parametrów / tytułu) / **[GALERIA]** (dowód z kadru) /
**[OPIS]** (destylat opisu-FAKT) / **[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** dziecięca krótkofalówka (walkie-talkie) **z ekranem 2,0" i kamerą** — komunikacja
  dwukierunkowa **głos + obraz (wideo)**; **zawsze 2-pak** (dwa urządzenia w zestawie). Model
  **JK200**. To **ZABAWKA dla dzieci** (pudełko: „Video walkie talkie — CHILDREN'S TOY").
- **Wiek: 3+** — pudełko nosi ostrzeżenie „**WARNING: CHOKING HAZARD — Not for children under
  3 years**" (wielojęzyczne) [GALERIA UGC 8-2]. Na stronę: „dla dzieci od 3 lat". ⛔ Zero innych
  claimów bezpieczeństwa/certyfikatów (brak widocznego CE w aukcji) i zero claimów rozwojowych.
- **Slug roboczy fabryki:** `gadulek`. **Mini-marka = „Gadulek"** (od „gaduła" — komunikacja
  szeroko, nie koduje jednego użycia; anty-Popiołek OK). **PROWIZORYCZNA — F2.5 rezerwuje
  w `bud_brand_names` (INSERT-or-fail).**
- **Rekord kuracji:** `bud_tt_products.id = 4db1b6fc-8cbb-4001-86f3-562946e76a18`
  (`gallery_curated` / `videos_curated`). ali_product_id **`1005010623173867`**.
- **Źródło danych:** aukcja AliExpress `1005010623173867`, **`source='detail'` = ZAUFANE**
  (gate F0 PASS ✓). Snapshot w bazie (`ali_snapshot`), galeria zrehostowana u nas.
- **⚠️ ROZJAZD cover_url (do wyjaśnienia — poza zakresem fabryki landingów):**
  `wf2_products.cover_url` wskazuje katalog **`bud-products/1005011544279474/g0.avif`** (INNE ID),
  ale `supplier_url`, `chosen_link` ORAZ `ali_snapshot.images/main_image` wskazują aukcję
  **`1005010623173867`**. **Snapshot i cała galeria pochodzą z WŁAŚCIWEJ aukcji `...173867`** —
  karta prawdy, PASZPORT i galeria budowane są z `ali_snapshot.images` (`...173867`), **NIGDY
  z cover_url**. Rozjazd = błędny/stary `cover_url` z kroku wyboru; naprawa należy do orkiestratora
  (Etap 1), nie do fabryki landingów. Odnotowane w LEDGER.
- **⛔ WHITE-LABEL:** marka spec **„magecam"**, sprzedawca **„Magecam Choice Store"** — **NIGDY
  na stronie**. Kadr **g0** ma watermark „**Magecam**" (lewy górny róg) → **CROP** przy użyciu.
  Na samym korpusie nie ma czytelnego nadruku marki (antena ma słabo czytelny relief „Antenna").
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Phones & Telecommunications > Walkie Talkie.

## 1. Cena
- **NASZA cena PL: 89,90 zł** [ODCZYT z `wf2_products.price` — krok `kalkulacja` DONE; fabryka
  landingów NIE ustala i NIE zmienia ceny]. Końcówka zgodna z regułą (<150 → ,90). Zawsze za **2-pak**.
- **Koszt zakupu (wariant bazowy Blue&Blue $20.94): 79,57 zł** [KONKRET-SKU]
  = **$20.94 × kurs NBP 3,8000** (tab. **142/A/NBP/2026, 2026-07-24**). = `wf2_products.cost_purchase`.
- **Koszty wariantów USD** [KONKRET-SKU, `sku_prices`]: Blue&Blue **$20.94** (79,57 zł) ·
  Blue&Pink $21.09 (80,14 zł) · Pink&Pink $21.28 (80,86 zł). **Wszystkie ~80 zł landed** —
  różnice groszowe, wszystkie mieszczą się w marży. **MODEL CENY: jedna cena PL 89,90 zł;
  wariant = wybór pary kolorów (estetyczny), nie cenowy.**
- **`unit_profit` = 8,53 zł** [GENERATED, po prowizji 2%]. ⚠️ **Nota dla Tomka (F-1, buduję dalej):**
  marża cienka (~9,5%) przy koszcie landed ~80 zł i cenie 89,90 zł — to decyzja Etapu 1
  (kalkulacja), fabryka landingów jej NIE zmienia; zgłaszam jedną linijką i pracuję dalej.
- Dostawa/COD/zwrot: warunki sklepów fabryki (COD + zwrot 14 dni, checkout Trevio).

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC]
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | magecam | *WEWN. — white-label, nie na stronę* |
| Model Number | JK200 | |
| Walkie Talkie Type | Kids walkie talkie | dziecięca |
| Is_Display | Yes | **ma ekran** |
| Maximum Range | <1.5km | ⚠️ **SANITY §2a — na stronę 100–400 m, NIE 1,5 km** |
| Battery Capacity(mAh) | 600mAh | akumulator wbudowany |
| Battery Included | Yes | |
| Material | Plastic | opis precyzuje: **ABS** |
| Output Power(w) | 0.5w-3w | ⚠️ mylące vs opis „≤70mW" — **nie eksponować mocy w watach** |
| Waterproof / Water-Resistant | No | **nie wodoodporne** (uczciwie) |
| Origin | Mainland China | *WEWN.* |
| High-concerned chemical | None | puste — POMIŃ |
| Use | others | puste — POMIŃ |

### 2a. ⚠️ SANITY LICZB — ROZSTRZYGNIĘCIA
- **Zasięg: 100–400 m (w otwartym terenie).** Kotwica: opis „100-400 meters (environment
  dependent)" + opinia idx3 „I got 230m range". Spec „Maximum Range <1.5km" = teoretyczny max
  idealnych warunków, **NIE kotwica** → ⛔ **ZAKAZ obietnicy „1,5 km"**; na stronę „100–400 m".
- **Wideo: 480P.** Kotwica: g3 „480P CLEAR VIDEO". Opis mówi „built-in HD camera" — „HD" to
  bełkot marketingowy; **konkret = 480P** → pisać „wideo 480P", ⛔ NIE „HD"/„Full HD".
- **Efekty głosu: rozbieżność źródeł.** g4 pokazuje „3 Voice Effects: **Child / Monster / Male**";
  opis mówi „robot, alien, or monster". Kotwica silniejsza = UI produktu (g4). Na stronę:
  „zabawne efekty zmiany głosu (m.in. potwór)" — **bez sztywnej listy 3 nazw**, bo źródła się różnią.
- **Moc/częstotliwość:** opis podaje 2,4 GHz i moc nadawania ≤70 mW; spec „Output Power 0.5w-3w"
  to inna miara (głośnik/nadajnik niejasne). **Nie robić claimu liczbowego z mocy** — mylące.
  Bezpieczna kotwica: „częstotliwość 2,4 GHz, bez WiFi i bez karty SIM" (opis).

## 2b. Specyfikacja z OPISU + kadrów galerii — [OPIS]/[GALERIA]
| Parametr | Wartość | Kotwica |
|---|---|---|
| Ekran | **2,0 cala, IPS** | [SPEC Is_Display=Yes + GALERIA g5 „2.0 Inch IPS"] |
| Kamera + wideo | wbudowana kamera, **wideo 480P**, podgląd twarzy na ekranie w czasie rozmowy | [OPIS „built-in HD camera and screen… video chat face-to-face" + GALERIA g3 „480P CLEAR VIDEO"] — **RDZEŃ USP** |
| Komunikacja | dwukierunkowa **głos + obraz**; auto-parowanie na tym samym kanale; bez WiFi/SIM | [OPIS „Two-way communication, video transmission", „automatically pair", „without WiFi"] |
| Zasięg | **100–400 m** (otwarty teren) | [OPIS + opinia idx3 „230m"] — ⛔ nie „1,5 km" |
| Wymiary | **~124 × 54 × 23 mm** (12,4 × 5,4 cm) | [OPIS „124mm x 54mm x 23mm" + GALERIA g5 „12.4cm × 5.4cm / 4.8×2.1 inch"] |
| Materiał / trwałość | **ABS, odporne na upadki** (drop-resistant); rozmiar pod małe dłonie | [OPIS „drop-resistant plastic", „small hands" + GALERIA g5 „Drop Resistant"] |
| Bateria / ładowanie | **600 mAh** akumulator; **Type-C**, ładowanie **1–2 h**, praca ciągła **3–5 h**, standby 3–5 dni | [SPEC 600mAh + OPIS „Type-C USB, DC 5V/1A", „3-5 hours talk", „1-2 hours charging"] |
| Efekty głosu | zabawne efekty zmiany głosu (m.in. potwór) | [GALERIA g4 „3 Voice Effects" + OPIS] — patrz §2a |
| Sterowanie | duży przycisk rozmowy (intercom key) z boku, +/- głośność, włącznik, przycisk zmiany głosu | [GALERIA g5 anatomia: „Intercom key / Increase-reduce volume / Power switch / Camera conversion·voice change button"] |
| Głośnik | 8Ω 1.0W | [OPIS] |
| Wodoodporność | **NIE** wodoodporne | [SPEC Waterproof=No] |
| Zestaw | 2× walkie-talkie · 2× smycz · 2× kabel Type-C · 1× instrukcja (EN) | [OPIS „2 x Walkie Talkie, 2 x Lanyard, 2 x Charging Cable, 1 x English Instruction"] |
| Wiek | **3+** | [GALERIA UGC 8-2 pudełko „not for children under 3 years"] |

## 3. Destylacja opisu sprzedawcy — FAKT / BEŁKOT
**FAKTY (z kotwicą — wolno użyć feature→benefit):**
- Ekran + kamera → „dzieci nie tylko się słyszą, ale i **WIDZĄ** — rozmowa z podglądem twarzy na
  ekranie 2,0"" (kotwica: opis „video chat face-to-face" + g0/g3/g5 + opinia idx4 „good image
  quality"). **RDZEŃ USP** — to odróżnia od zwykłej krótkofalówki.
- Zasięg 100–400 m, bez WiFi/SIM, auto-parowanie → „gadają po podwórku, w parku, na kempingu —
  włącz i mów, zero konfiguracji, bez internetu" (kotwica: opis + opinia idx3 „230m range, clear").
- ABS odporne na upadki, rozmiar pod małe dłonie → „zrobione na dziecięce ręce i upadki"
  (kotwica: opis „drop-resistant… small hands" + g5 „Drop Resistant").
- Type-C, ładowanie 1–2 h, praca 3–5 h → „ładujesz jak telefon (Type-C), starcza na długą zabawę"
  (kotwica: opis + opinia idx11 „charger is Type-C"). ⚠️ uczciwie: „3–5 h" (idx9 minus poniżej).
- Efekty zmiany głosu → „zamień głos w potwora — więcej śmiechu" (kotwica: g4 + opis).
- 2-pak w zestawie → „dwa urządzenia + smycze + kable — gotowe do pary od razu" (kotwica: opis zestaw).

**BEŁKOT / OSTROŻNIE (CUT albo forma zawężona):**
- „HD camera" (opis) — **BEŁKOT-CUT** dla „HD"; konkret = 480P (g3).
- „Long-Range Communication" + „1,5 km" (spec) — **zawęzić** do 100–400 m (§2a).
- „Extended Battery Life" jako superlatyw — **CUT**; fakt = 3–5 h pracy / 1–2 h ładowania.
- „Fun Voice Effects… robot, alien, or monster" — **zawęzić** (źródła się różnią, §2a).
- „Child-Friendly" jako claim bezpieczeństwa — **tylko** udokumentowane: „od 3 lat" (pudełko).
  ⛔ Zero „bezpieczne dla dziecka / rozwija / edukacyjne" bez kotwicy.

## 4. Warianty (pary kolorów)
**3 warianty koloru** [`variants`/`sku_prices`], zawsze **2-pak**:
| Oryg. | PL | Koszt USD | Swatch? |
|---|---|---|---|
| Blue And Blue | Niebieski + Niebieski | $20.94 | TAK (g0 dowód niebieskiego) |
| Blue And Pink | Niebieski + Różowy | $21.09 | TAK (g0 dowód obu kolorów) |
| Pink And Pink | Różowy + Różowy | $21.28 | TAK (g0/g3 dowód różowego) |
Kolory pastelowe (błękit + róż) mają wizualny dowód w galerii → **swatche OK**. **MODEL CENY:
jedna cena PL 89,90 zł** dla każdej pary; wybór = estetyczny. Kanon wizualny = błękit+róż (g0).

## 5. Dowód społeczny
- **Ocena: ★ 4,7 / 5** [KONKRET, `review_stats.avg`] · **687 ocen** [`numRatings`] ·
  **93,4% pozytywnych** [`positivePct`]. → NA STRONĘ: **„★4,7/5 · 687 ocen"** (realna, duża
  liczba — wolno). ⛔ NIE „100% 5-gwiazdkowych" (snapshot ma 20 treści same 5★, ale pełny
  rozkład z 687 ma też niższe — uczciwie 4,7/5).
- **20 recenzji z treścią** w snapshot (wszystkie 5★; teksty EN/wielojęzyczne — `text_pl` =
  oryginał bez tłumaczenia). Zawierają REALNE minusy (uczciwość Z5). Treści §5a.
- **sold_volume = 5147** [WEWN.]: liczba globalna Ali ≠ nasz sklep → „X sprzedanych u nas" =
  FAŁSZ = ZAKAZ. 5147 > 1000 → wolno **JEDNA nieprzypisana fraza bez liczby** („sprawdzona
  zabawka, tysiące zamówień na świecie") — nigdy licznik/pilność.
- **shop „Magecam Choice Store"** — **🚫 NIGDY na stronie** (white-label; grep-gate F6).

### 5a. Recenzje — wzorce (20 treści, wszystkie 5★, imiona zanonimizowane przez Ali)
**PLUSY → copy:**
- „Works so much better than expected… quality is great and latency impressively short" (idx1).
- „My 3-year-old son liked it a lot" (idx2) · „size appropriate for 4–5-year-old… easy to use,
  good image quality, fun and innovative toy" (idx4) — **dowód: małe dzieci, prosta obsługa, jakość obrazu**.
- „230m range. Clear picture and audio. Very small and light" (idx3) — **zasięg realny + lekkość**.
- „screen displays well, sound clear, battery life long… perfect for indoor use" (idx6).
- „video and camera are of good quality… low price" (idx7) · „it's so cute, charger is Type-C" (idx11).
- „great that there's video included at this price… surprised by the quality at this price" (idx15).
- „kids find it fun, simple to use" (idx16) · „excellent for girls" (idx14) · „kids loved the game" (idx12).

**REALNE minusy (Z5 — do porównania/FAQ uczciwie, nie ukrywać):**
- **Opóźnienie dźwięku ~1–2 s** — „voice heard about 1 second later" (idx5), „slight lag 1-2 s
  but it's good" (idx7), „slight delay in sound, not uncomfortable" (idx15). → uczciwie: „lekkie
  opóźnienie dźwięku (ułamek–2 s) — jak w krótkofalówce".
- **Jakość wideo = 480P, nie premium** — „video quality a bit poor, but very satisfied at this
  price" (idx5). → „obraz 480P — czytelny, na miarę zabawki, nie kamera 4K".
- **Bateria 3–5 h** — „battery runs out a bit quickly" (idx9). → uczciwie „3–5 h zabawy na ładowaniu".
- **Pudełko bywa lekko pogniecione w transporcie** (produkt cały) — idx1, idx4. → nieistotne dla FAQ.
- **Zasięg zależny od terenu** — pełne 100–400 m w otwartej przestrzeni.

## 6. Materiał wizualny → `gallery_curated`
Kuracja 8 kadrów (g0–g6 galeria detail + okładka TikTok): **1 keep-detail (g0, CROP watermark)**
+ **3 UGC keep z opinii 5★** (0-0, 6-0, 7-1) / **g1–g5 = DANE** (infografiki EN → copy/anatomia PL) /
**g6 + okładka-TT = ODRZUĆ** (duplikat / off-product). Galeria detail uboga w czyste packshoty
(wszystkie poza g0 to infografiki z wypalonym tekstem EN) → **fallback GALERIA-ALI §4: UGC z opinii
+ czyste packshoty do wygenerowania w F3** (poza zakresem tej sesji F0→F2). Pełne werdykty:
`galeria-kuracja/GALERIA.md` + `bud_tt_products.gallery_curated`.

## 7. Wygląd i wideo
- **PASZPORT wizualny:** `PASZPORT.md` (bryła, kolory, cechy dyskryminujące, „CZEGO NIE MA", white-label).
- **Wideo:** `ali_snapshot.video_url = null` → **BRAK wideo produktu**. Jedyny klip (tiktok_url
  `@whatilovetodo`) ma okładkę pokazującą **dziewczynkę z psem na chodniku — BEZ produktu**
  (off-product) → niezdatny jako dowód produktu. `videos_curated` = nota „brak realnego wideo
  produktu w kadrze". Sekcja wideo/UGC = klasa dowodowa (F1a): decyzja o jej losie należy do
  **Tomka (blokada-tomek)**, nie do fabryki. Szczegóły: `WIDEO.md`.
- **Mapa zastosowań:** `MAPA-ZASTOSOWAN.md` (≥2 funkcje: wideo-rozmowa + krótkofalówka głosowa +
  efekty głosu → szerokość obowiązkowa). **ICP:** `ICP-GRUPA-DOCELOWA.md`.
