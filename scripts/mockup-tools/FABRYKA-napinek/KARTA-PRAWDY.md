# KARTA PRAWDY — NAPINEK (sprężynowy trener ramion i klatki / power twister) · F0.6 · 2026-07-24

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET-SKU]** (konkret sprzedawanego
wariantu) / **[SPEC]** (z tabeli parametrów / tytułu) / **[GALERIA]** (dowód z kadru detail) /
**[OPIS]** (destylat opisu-FAKT) / **[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** **sprężynowy trener ramion i klatki (power twister / „twister arm trainer")** —
  łamany drążek z metalowymi sprężynami i piankowymi uchwytami; ćwiczy się przez **zginanie /
  ściskanie** drążka wbrew oporowi sprężyny. Kształt: dwa równoległe pręty z uchwytami spięte
  sprężynami (przy zgięciu tworzy owal / „ósemkę"). Tytuł: „Twister Arm Trainer, Exerciser Chest
  Workout, Portable Power Twister Bar".
- **Wariant sprzedawany = jedyny (SKU „A")** — jedna konfiguracja produktu; różnice `sku_prices`
  („A / Germany", „A / spain"…) to **kraj wysyłki**, nie warianty produktu. Cena zakupu jednakowa.
- **Slug roboczy fabryki:** `napinek`. **Mini-marka = „Napinek" (PROWIZORYCZNA — F2.5
  potwierdzi/zarezerwuje w `bud_brand_names`; nazwa od MECHANIZMU: napinać/napięcie mięśni +
  napięcie sprężyny — nie od jednego zastosowania, anty-Popiołek F0.6b).**
- **Rekord kuracji:** `bud_tt_products.id = 08ca65d9-a717-4e33-a435-213ab30049a0`
  (`gallery_curated`). ali_product_id `1005009863215535`.
- **Źródło danych:** aukcja AliExpress `1005009863215535`, **`source='detail'` = ZAUFANE**
  (gate F0 PASS ✓). Snapshot pobrany 2026-07-24T16:21Z (świeży, < 24 h).
- **⛔ WHITE-LABEL:** marka spec **„Rbefeuly"**, sprzedawca **„Worldly Collective Store"**, a na
  broszurze z okładki (g6) czytelny nadruk **„HOTWAVE"** — **NIGDY na stronie**. Sam produkt
  (drążek) NIE ma czytelnego nadruku marki. Broszura „HOTWAVE" (g6) = CROP/ODRZUĆ.
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Sports & Entertainment > Fitness & Body Building.

## 1. Cena
- **NASZA cena PL: 144,90 zł** [ODCZYT z `wf2_products.price` — krok `kalkulacja` DONE
  (`price_ladder.accepted_by='fabryka'`, 2026-07-24); fabryka landingów NIE ustala i NIE zmienia
  ceny]. Końcówka zgodna z regułą (<150 → ,90).
- **Koszt zakupu: 125,93 zł** [KONKRET-SKU] = **$33,14 × kurs NBP ≈ 3,80** (kurs zapisany przy
  kalkulacji 2026-07-24; `125,93 / 33,14 = 3,7999`). Zapisane w `wf2_products.cost_purchase = 125,93`.
- **Cena zakupu USD** [KONKRET-SKU, `ali_snapshot.price`]: **sale $33,14** (original $33,15).
  `sku_prices` = ta sama cena $33,14 dla wszystkich krajów wysyłki (A/Germany, A/spain, A/france,
  A/Italy) → JEDNA konfiguracja produktu, cena PL jedna: **144,90 zł**.
- **Marża CIENKA:** `unit_profit` (GENERATED) = `144,90 − 125,93 − 0 − 144,90·2% = ~16,07 zł`
  (~11%). ⚠️ Nota do Tomka (F-1, jedna linia — NIE zatrzymuję budowy): narzut przy 144,90 zł jest
  wąski; `price_ladder` przewiduje ramp SCALE (est. 319 zł, bramka Tomka). Decyzja cenowa = Etap 1,
  nie fabryka landingów.
- Dostawa/COD/zwrot: warunki sklepów fabryki (COD + zwrot 14 dni, checkout platformy Zmyślnik).

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC]
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | Rbefeuly | *WEWN. — white-label, NIE na stronę* |
| Department Name | Unisex | dla kobiet i mężczyzn |
| Type | Gripping Ring | typ: pierścień/drążek chwytny |
| Type of sports | Cadio Training | *literówka aukcji „Cardio"* — trening oporowy/kondycyjny |
| Training Site | ARMS | główna partia: RAMIONA |
| Function | ARMS | funkcja: ramiona |
| Model Number | Twister Arm Trainer | nazwa modelu |
| Portable Spring Resistance | Muscular Strength Enhancer | opór sprężynowy → wzmacnianie siły |
| Origin | Mainland China | *WEWN.* |

### 2b. Specyfikacja z GALERII detail + OPISU — [GALERIA]/[OPIS]
| Parametr | Wartość | Kotwica |
|---|---|---|
| Sprężyny | **metalowa/stalowa sprężyna dwuwarstwowa** („double-layer precision steel spring") | [GALERIA g1/g2/g3 „precision steel spring"] + [OPIS „high-strength metal springs"] |
| Osłona sprężyny | **elastyczna osłona (skóropodobna), antypoślizgowa** | [GALERIA g1 „Elastic leather cover — Non-slip and comfortable"] + [OPIS „leather protection"] |
| Uchwyty | **pianka antypoślizgowa, wytrzymała na ścieranie** (czarna + miętowe pierścienie) | [GALERIA g5 „Foam Wrapped Anti Slip and Wear-Resistant"] + [OPIS „anti-slip foam handles"] |
| Poziomy oporu | **3 poziomy: 60 / 75 / 90 lbs** (~27 / 34 / 41 kg) — regulacja przez przełożenie prętów: zewn.+zewn. (60), zewn.+wewn. (75), wewn.+wewn. (90) | [GALERIA g1 „2-speed adjustment · 3 resistance types (60/75/90lbs)", g3 diagram poziomów, g4 krok „Adjust to Internal/External Gear"] |
| Regulacja długości | **rebound button** — dłuższy = mniejszy opór, krótszy = większy opór | [GALERIA g4 „Rebound button · increased length/reduced resistance · reduced length/increased resistance"] |
| Wymiary | **długość 67 cm / 26,4 in · wysokość 17 cm / 6,7 in** | [GALERIA g4 wymiary na kadrze] |
| Konstrukcja | **rozkładany / zdejmowany (detachable)** — łatwy w przenoszeniu | [GALERIA g2 „Detachable Design, More Portable", g5 „Detachable and Easy to Carry"] |
| Partie mięśni | **ramiona (biceps), klatka, plecy, barki** (+ deklaracja: nogi) | [GALERIA g0 „Chest / Biceps / Back / Leg Exercises"] + [OPIS „arms, chest, back, legs, shoulders"] |
| Waga | **BRAK DANYCH** (specs nie podają masy) — ⛔ zero zmyślonej kg | — |

### 2a. ⚠️ SANITY LICZB — ROZSTRZYGNIĘCIE
- **„60/75/90 lbs" = KONKRET wariantu** (jedna konfiguracja z 3 nastawami oporu), potwierdzony
  DWUKROTNIE w galerii detail (g1 + g3 z diagramem interfejsów). Na stronę: **3 poziomy oporu
  60/75/90 lbs**; ekwiwalent kg podać ORIENTACYJNIE (~27/34/41 kg) z adnotacją „≈".
- **„6+ muscle areas" (opis) = OSTROŻNIE.** Galeria dowodzi 4 partii wprost (g0: klatka, biceps,
  plecy, nogi). Na stronę idą partie z DOWODEM: **ramiona, klatka, plecy, barki** (rdzeń: RAMIONA
  + KLATKA = tytuł „Arm Trainer, Chest Workout"). „Nogi" [GALERIA g0] — pokazywać ostrożnie/
  drugoplanowo (power twister do nóg to nietypowe użycie). ⛔ ZAKAZ „6+ mięśni" jako twardej liczby.
- **„Cadio/Cardio Training" (spec)** — produkt jest oporowy (siłowy), nie kardio; „Cadio" to
  literówka aukcji. Na stronę: **trening siłowy/oporowy**, nie „cardio".
- **Wymiary 67×17 cm [GALERIA g4]** — jedyny wymiar podany; wolno cytować. Wagi BRAK → nie zmyślać.

## 3. Destylacja opisu sprzedawcy — FAKT / BEŁKOT
**FAKTY (z kotwicą — wolno użyć feature→benefit):**
- Metalowe sprężyny + osłona → „mocny, sprężysty opór; sprężyna nie traci kształtu, służy latami"
  (kotwica: g1/g2 „precision steel spring", g2 „Fine steel spring bending does not change the
  shape", opis „high-strength metal springs"). **RDZEŃ USP.**
- 3 poziomy oporu 60/75/90 lbs → „rośniesz w siłę — zwiększasz opór; jeden sprzęt na cały
  progres" (kotwica: g1/g3 „3 resistance types 60/75/90lbs"). **RDZEŃ USP.**
- Pianka antypoślizgowa + osłona → „pewny chwyt, nie ślizga się w spoconych dłoniach, chroni ręce"
  (kotwica: g1 „Elastic leather cover Non-slip", g5 „Foam Wrapped Anti Slip"; g5 porównanie:
  zwykły drążek bez osłony rani dłonie).
- Ramiona + klatka + plecy + barki jednym sprzętem → „cały górny korpus w domu, bez siłowni"
  (kotwica: g0 partie, tytuł „Arm Trainer, Chest Workout", opis multi-muscle). **RDZEŃ USP.**
- Rozkładany / lekki → „schowasz do szafki albo weźmiesz w podróż" (kotwica: g2/g5 „Detachable,
  portable"; wymiary 67×17 cm g4).

**BEŁKOT / OSTROŻNIE (CUT albo forma zawężona):**
- „Multi-Muscle Stimulation Technology", „uniquely activates 6+ muscle areas with precision",
  „Premium-Grade Construction", „killer chest workouts", „Advanced strength, one tool can handle
  it" — **BEŁKOT-CUT** (superlatywy / niemierzalne). Korzyść przekazać przez FAKT z kotwicą.
- „efficient full-body training" / „legs" — [OPIS] — dopuszczalne jako drugoplanowe, ale rdzeń =
  ramiona/klatka (tytuł); ⛔ nie robić z „full body / nogi" głównej obietnicy.
- ⛔ Zdrowotne/medyczne claimy (spalanie tłuszczu, „w X dni", rehabilitacja) = ZAKAZ (brak kotwicy).

## 4. Warianty
**Jedna konfiguracja produktu (SKU „A").** `sku_prices` różnicuje tylko KRAJ WYSYŁKI
(Germany/spain/france/Italy — wszystkie $33,14), nie kolor/model. **BRAK swatchy** (jeden wariant).
**MODEL CENY: jedna cena PL 144,90 zł.**
- **Kolor kanoniczny = CZARNA pianka + MIĘTOWE/TURKUSOWE pierścienie akcentu + CHROMOWANE pręty**
  (galeria detail g0–g5 — 5 spójnych kadrów). ⚠️ **g6-cover pokazuje wariant z NIEBIESKIMI
  pierścieniami** — inny odcień akcentu → **inny-egzemplarz dla koloru** (GALERIA-ALI §2): NIE
  renderować niebieskiego jako kanonu; kanon = TURKUS/MIĘTA. g6 użyteczny wyłącznie jako
  referencja KSZTAŁTU (packshot pionowy na białym), nie koloru.

## 5. Dowód społeczny
- **Ocena: ★ 4,8 / 5** [KONKRET, `review_stats.avg`] · **9 ocen** (`numRatings`) · **95,6%
  pozytywnych** (`positivePct`). Na stronę: **„★4,8/5 · 9 ocen"** — POD foldem (⛔ nie nad foldem).
- **5 recenzji z treścią** (3× 5★, 2× 4★; teksty EN — `text_pl` = oryginał bez tłumaczenia).
  Krótkie i ogólne; jedna niesie realną wskazówkę (op.[2] „trzeba poćwiczyć; nie działa na
  podłodze"). Treści §5a.
- **`sold_volume` = 25** [SPEC, WEWNĘTRZNY]: liczba globalna Ali ≠ nasz sklep → „X sprzedanych u
  nas" = FAŁSZ = ZAKAZ. 25 << 1000 → **POMIJAMY na stronie** (nawet nieprzypisanej frazy).
- **shop „Worldly Collective Store"** — **🚫 NIGDY na stronie** (white-label; grep-gate F6).

### 5a. Recenzje (5 treści — VERBATIM, imiona zanonimizowane przez Ali „AliExpress Shopper")
1. ★5: „The twister is good! Fast delivery! Thanks" — plus: produkt OK + szybka dostawa.
2. ★5: „very good \n You just need to practice :) \n When it's on the floor, it doesn't work :)"
   — **wskazówka: trzeba poćwiczyć technikę; to trener oporowy trzymany w dłoniach, nie na podłodze.**
3. ★5: „Everything perfect. fast tracking , thank you" — plus: wszystko OK + śledzenie przesyłki.
4. ★4: „Excellent product, functional but not bulky." — **plus: funkcjonalny, nieporęczny/kompaktowy.**
5. ★4: „Apparently suitable. \n Of course. Sent in the same box. \n Hits everywhere." — neutralna
   (tłumaczenie automatyczne niejasne); nie cytować dosłownie na stronie.

**Wzorce (plusy → copy):** szybka dostawa · funkcjonalny i kompaktowy („not bulky") · dobry sprzęt.
**Wzorce (uczciwie → FAQ):** wymaga chwili wprawy w technice (op.[2]) · to trener trzymany w
dłoniach (ściskanie/zginanie), nie sprzęt „na podłogę" (op.[2]). ⚠️ **UWAGA: żadna recenzja nie
ma zdjęcia** (`images:[]` × 5) i **`bud-reviews/1005009863215535` w Storage jest PUSTE** → brak
materiału na sekcję „zdjęcia od kupujących" (patrz GALERIA.md → blokada-tomek).

## 6. Materiał wizualny → `gallery_curated`
Kuracja 7 kadrów (g0–g5 galeria detail + g6 okładka shop/TikTok): **0 czystych packshotów** —
wszystkie g0–g5 to **infografiki z wypalonym angielskim tekstem (z literówkami: „Exercls",
„cun choese", „Enginl", „adfustment") na CIEMNYM tle siłowni** = TANDETA (GALERIA-ALI §3). Werdykty:
większość → **DANE** (specs/porównanie/wymiary → ta Karta) + **CROP** produktu jako referencja
bryły. **Czysty packshot w kanonicznym kolorze (turkus) = do wygenerowania w F3.** g6 = biały
packshot, ale wariant NIEBIESKI + broszura „HOTWAVE" → referencja KSZTAŁTU po CROP, nie kolor.
Pełne werdykty: `galeria-kuracja/GALERIA.md` + `bud_tt_products.gallery_curated`.

## 7. Wygląd i wideo
- **PASZPORT wizualny:** `PASZPORT.md` (cechy dyskryminujące + „CZEGO NIE MA" + white-label).
- **Wideo:** `ali_snapshot.video_url = null` → **BRAK wideo produktu w aukcji**. `bud_tt_products.
  tiktok_url` istnieje (`@7141039908677764142/…7539235739989495054`) — materiał do WERYFIKACJI/
  pozyskania przez Tomka. `videos_curated` = nota. Sekcja wideo = klasa dowodowa (F1a): po
  protokole wyczerpania → **blokada-tomek**, nie SKIP. Szczegóły: `WIDEO.md`.
- **Zastosowania (spektrum):** `MAPA-ZASTOSOWAN.md` (F0.6b) · Persona: `ICP-GRUPA-DOCELOWA.md` (F0.6a).
