# KARTA PRAWDY — ZAKLIPEK (przyklipsowy hub USB do biurka) · F0.6 · 2026-07-23

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET-SKU]** (konkret sprzedawanego
wariantu) / **[SPEC]** (z tabeli parametrów / tytułu) / **[GALERIA]** (dowód z kadru) /
**[OPIS]** (destylat opisu-FAKT) / **[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** przyklipsowy (clip-on) **hub / stacja portów USB** montowana zaciskiem na krawędzi
  biurka lub monitora; obudowa **aluminiowa** (+ ABS). **Wariant sprzedawany = bazowy: 4 porty
  USB 3.0** (tytuł: „Multi 4 Ports USB 3.0").
- **Slug roboczy fabryki:** `zaklipek`. **Mini-marka = „Zaklipek" (PROWIZORYCZNA — F2.5
  potwierdzi/zarezerwuje w `bud_brand_names`).**
- **Rekord kuracji:** `bud_tt_products.id = 1ededa68-9f03-4b62-ad8b-f305c60ad0da`
  (`gallery_curated`). ali_product_id `1005008397815113`.
- **Źródło danych:** aukcja AliExpress `1005008397815113`, **`source='detail'` = ZAUFANE**
  (gate F0 PASS ✓). Snapshot pobrany 2026-07-23T20:49Z.
- **⛔ WHITE-LABEL:** marka **„Eswirepro"** (spec Brand Name), sprzedawca **„Better House Life
  Store"** — **NIGDY na stronie**. Incydentalne wystąpienia „Eswirepro" w scenach (nadruk na
  ekranie monitora g2, ścieżka w oknie Windows g4, etykieta dysku g5) → RETUSZ/CROP jeśli
  czytelne (patrz GALERIA.md). Sam produkt (aluminiowa listwa) NIE ma czytelnego nadruku marki.
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Computer & Office > Computer Peripherals.

## 1. Cena
- **NASZA cena PL: 34,90 zł** [ODCZYT z `wf2_products.price` — krok `kalkulacja` DONE; fabryka
  landingów NIE ustala i NIE zmienia ceny]. Końcówka zgodna z regułą (<150 → ,90).
- **Koszt zakupu (sprzedawana konfiguracja, wariant bazowy $7.54): 28,61 zł** [KONKRET-SKU]
  = **$7.54 × kurs NBP 3,7946** (tab. **141/A/NBP/2026, 2026-07-23**). Zapisane w
  `wf2_products.cost_purchase = 28,61`.
- **Narzut ~20% · zysk/szt. 5,59 zł** (po prowizji 2%) [`unit_profit` GENERATED]. Nota
  kalkulacji: cena 34,90 zł to najniższa cena psychologiczna powyżej minimum — narzut wyszedł
  20% (> pasmo 10–15%, bo produkt tani, a końcówka ,90 podbija do progu psychologicznego).
- **Koszty wariantów USD** [KONKRET-SKU, `sku_prices`]: A/B **$7.54** · C/D $8.85 · E/F $9.83 ·
  I/J $11.05 · G/H $12.46 · **4K-60Hz-Sliver / 4K-60Hz-Black $25.58**.
  ⚠️ **PUŁAPKA MODELU CENY:** przy 34,90 zł mieści się w marży **wyłącznie wariant bazowy**
  (~28,61 zł landed). Warianty droższe (np. 4K-60Hz $25.58 → ~97 zł landed) są **strat­ne** za
  34,90 zł → **NIE oferować ich na stronie**. Strona sprzedaje JEDNĄ konfigurację (bazowy
  4-port USB 3.0), cena PL jedna: 34,90 zł.
- Dostawa/COD/zwrot: warunki sklepów fabryki (COD + zwrot 14 dni, checkout Trevio).

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC]
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | Eswirepro | *WEWN. — white-label, nie na stronę* |
| Standard | USB 3.0 | → 5 Gbps (patrz §2a) |
| Interface Type | USB 3.0 | |
| Ports | „6, 4" | **wariant-zależne — patrz §2a SANITY: na stronę KONKRET 4 porty** |
| Origin | Mainland China | *WEWN.* |
| Funtion | None | puste — POMIŃ |
| High-concerned chemical | None | puste — POMIŃ |

### 2a. ⚠️ SANITY LICZB (Ports „6, 4"; 5 vs 10 Gbps; 7-in-1) — ROZSTRZYGNIĘCIE
- **Porty „6, 4" = ZAKRES z różnych wariantów, NIE kotwica.** Na stronę idzie **KONKRET
  sprzedawanego wariantu = 4 porty USB 3.0** (kotwica: tytuł „Multi **4 Ports** USB 3.0" +
  g4 „4*USB3.0 interface"). ⛔ ZAKAZ pisania „4–6 portów" jako obietnicy.
- **Prędkość: USB 3.0 = 5 Gbps** [SPEC Standard/Interface USB 3.0 + opis „USB 3.0, 5Gbps"].
  ⛔ **ZAKAZ „10 Gbps" / „USB 3.2 Gen2"** — to droższe warianty (kadry g0/g2 i zdjęcia
  kupujących rev0 pokazują 10Gbps, ale to NIE wariant bazowy $7.54).
- **⛔ ZAKAZ claimów innych wariantów:** „7-in-1", „czytnik kart SD/TF", „HDMI", „4K 60Hz",
  „docking station 7 in 1" — to konfiguracje z galerii/wariantów $8.85–$25.58, POZA sprzedawaną
  konfiguracją. Wariant bazowy = zwykły 4-portowy hub USB 3.0.
- **Dokładny układ portów wariantu bazowego NIEROZSTRZYGNIĘTY** (etykiety wariantów A–J
  nieczytelne): czy 4× USB-A, czy 3× USB-A + 1× USB-C — kadr g2 sugeruje mix USB-A + USB-C,
  ale to może być inny wariant. → **potwierdzić przy wyborze wariantu / packshocie (F2.5/F3)**;
  do tego czasu copy: „4 porty USB 3.0" bez przesądzania rozkładu A/C.

## 2b. Specyfikacja z OPISU + kadrów galerii — [OPIS]/[GALERIA]
| Parametr | Wartość | Kotwica |
|---|---|---|
| Obudowa | stop aluminium + ABS | tytuł „Aluminum" + opis „aluminum alloy and ABS" |
| Mocowanie | zacisk (klips) na krawędź biurka/monitora, **zakres 5–28 mm**, śruba regulacyjna | [GALERIA g5: „Adjustable Range 5mm-28mm"] |
| Antypoślizg | silikonowa podkładka (anti-slip) na szczęce zacisku | [GALERIA g5: „Anti-Slip Silicone Mat"] |
| Zasilanie dodatkowe | port **DC 5V** (stabilne zasilanie urządzeń energochłonnych / dysków) | [GALERIA g3/g5 „DC 5V"; opis „power interface"] — ⚠️ złącze WĄTPLIWE: obraz pokazuje USB-C, opis mówi „Micro USB" → podawać „port zasilania DC 5V" bez przesądzania złącza |
| Kompatybilność | MacOS oraz Windows; laptop / desktop | tytuł + opis „Compatibility with MAC OS", „Desktop Laptop" |
| Wymiary / waga | **BRAK DANYCH** (specs nie podają) — ⛔ zero zmyślonych cm/kg | — |

## 3. Destylacja opisu sprzedawcy — FAKT / BEŁKOT
**FAKTY (z kotwicą — wolno użyć feature→benefit):**
- Klips na krawędź biurka/monitora (5–28 mm) → „porty zawsze pod ręką na krawędzi biurka,
  koniec sięgania za komputer" (kotwica: tytuł „Clip-type" + opis „Clip-on Design… attach to
  your desk or monitor" + g5 zakres 5–28 mm). **RDZEŃ USP.**
- Obudowa aluminiowa → „solidna, trwała, chłodzi się, nie tandetny plastik" (kotwica: tytuł
  „Aluminum" + opis + opinia [2] „All aluminum, feels really well finished").
- 4 porty USB 3.0, 5 Gbps → „podłączysz pendrive, dysk, mysz, klawiaturę naraz, szybki transfer"
  (kotwica: tytuł „Multi 4 Ports USB 3.0" + opis „5Gbps" + g4 „4*USB3.0 simultaneously").
- Dodatkowy port zasilania DC 5V → „stabilne zasilanie przy energochłonnych urządzeniach / dyskach"
  (kotwica: g3/g5 „DC 5V" + opis; realny ból [10] — mysz zawieszała się z dyskiem bez zasilania).

**BEŁKOT / OSTROŻNIE (CUT albo forma zawężona):**
- „Powerful 7-in-1 Expansion", „10Gbps", „Unlimited Expansion", „sleek design", „enhancing your
  computing experience", „robust" — **BEŁKOT-CUT** (superlatywy i/lub cechy INNYCH wariantów).
- „12TB capacity hard drive" (g3) — [deklaracja sprzedawcy, wariant-zależna] → nie robić z tego
  twardego claimu liczbowego dla wariantu bazowego.

## 4. Warianty
**12 wariantów** w `sku_prices`, etykiety **nieczytelne** (pojedyncze litery A–J) + dwa opisowe
**„4K-60Hz-Sliver" / „4K-60Hz-Black"**. Brak dowodu koloru dla wariantów literowych w galerii →
**BRAK swatchy** (§ GALERIA-ALI 5: swatch tylko z wizualnym dowodem koloru). **MODEL CENY:
jedna cena PL 34,90 zł dla SPRZEDAWANEJ konfiguracji = wariant bazowy (4-port USB 3.0, $7.54).**
Pozostałe warianty (droższe / 4K/HDMI) **NIE oferowane na stronie** (poza marżą; patrz §1).
Kolor bazowy = **srebrne aluminium** (renderowany kanon galerii g0–g5; PASZPORT). ⚠️ zdjęcia
kupujących pokazują też czarny wariant 10 Gbps — to inny wariant, NIE kanon bazowy.

## 5. Dowód społeczny
- **Ocena: ★ 4,6 / 5** [KONKRET, `review_stats`] · **26 ocen** · **92,9% pozytywnych**.
  ⚠️ **ROZBIEŻNOŚĆ vs brief zlecenia:** brief podawał „27 ocen" i „sold 36" — realny snapshot w
  bazie ma **26 ocen** i **sold 34**. Na stronę idzie wartość ze snapshotu: **„★4,6/5 · 26 ocen"**.
- **11 recenzji z treścią** (9× 5★, 2× 4★; teksty EN/RU — `text_pl` = oryginał bez tłumaczenia).
  Zawierają REALNE minusy (uczciwość Z5) — do porównania/FAQ, nie ukrywać. Treści §5a.
- **sold_volume = 34** [SPEC, WEWNĘTRZNY]: liczba globalna Ali ≠ nasz sklep → „X sprzedanych u
  nas" = FAŁSZ = ZAKAZ. 34 << 1000 → **POMIJAMY na stronie** (nawet nieprzypisanej frazy).
- **shop „Better House Life Store"** — **🚫 NIGDY na stronie** (white-label; grep-gate F6).

### 5a. Recenzje (11 treści — VERBATIM, imiona zanonimizowane przez Ali)
1. ★5, 3 zdjęcia: „A neat and well-made device. The speed actually maintains at a level of 1000 Mbps…
   both USB-C and USB-A have the same speed." (test prędkości — wariant 10Gbps; zdjęcia = benchmark).
2. ★5, 1 zdjęcie: „Convenient thing, I charge my phone by the bed." (srebrny wariant przy łóżku).
3. ★5: „All aluminum and feels really well finished. no sharp or concerning edges. nice sturdy mount
   and does everything… shipped and arrived really fast." — **plus: aluminium, solidne mocowanie**.
4. ★5: „Perfect! Looks and working 100%".
5. ★5: „Great product! Fast delivery! Thank you!".
6. ★5: „Everything is perfect!!!".
7. ★5: „It's so comfortable and absolutely amazing~!!!".
8. ★5: „The included data transmission cable went to the trash. It was difficult to find a cable that
   met the standard…" — **MINUS: dołączony kabel danych słaby, trzeba użyć własnego dobrego**.
9. ★5: „All good ++++++++++".
10. ★4: „The hub is not bad. Works without any problems. However, the distance for mounting on a
    tabletop does not match." — **MINUS: rozstaw zacisku nie zawsze pasuje do blatu** (zakres 5–28 mm).
11. ★4: „…when testing this usb port you could only use 1 port at a time. wireless mouse + usb hdd &
    the mouse froze. So only one…" — **MINUS: przy obciążeniu bez zasilania DC działał 1 port naraz**
    (→ argument za portem zasilania DC 5V).

**Wzorce (plusy → copy):** całe aluminium, solidne wykonanie, mocny zacisk · szybki transfer (real
~1000 Mbps na wariancie 10Gbps) · wygodne, porty pod ręką · szybka dostawa.
**Wzorce (REALNE minusy → porównanie/FAQ uczciwie):** dołączony kabel danych słaby (użyj własnego) ·
zakres zacisku 5–28 mm nie do każdego blatu · przy energochłonnych urządzeniach potrzebne zasilanie
DC (inaczej porty się „przełączają") · rozbieżność kolor/wariant (srebrny vs czarny 10Gbps).

## 6. Materiał wizualny → `gallery_curated`
Kuracja 7 kadrów (g0–g5 galeria detail + g6 okładka TikTok): **4 keep (crop)** / **3 odsiew**.
⚠️ **ŻADEN kadr nie jest czystym packshotem bez tekstu** — wszystkie keep wymagają CROP-u
wypalonego tekstu EN; czysty packshot wariantu bazowego = **do wygenerowania w F3**. g6 = INNY
produkt (czarny hub ORICO) → ODRZUĆ. Pełne werdykty: `GALERIA.md` + `bud_tt_products.gallery_curated`.

## 7. Wygląd i wideo
- **PASZPORT wizualny:** `PASZPORT.md` (cechy dyskryminujące + „CZEGO NIE MA" + white-label).
- **Wideo:** `ali_snapshot.video_url = null` → **BRAK wideo produktu**. Jedyny klip (tiktok_url
  `@luckygeek1`) ma okładkę pokazującą **INNY produkt (czarny ORICO)** = off-product → niezdatny.
  `videos_curated` = nota „brak realnego wideo produktu". Sekcja wideo = klasa dowodowa (F1a):
  decyzja o jej losie należy do Tomka (blokada-tomek), nie do fabryki. Szczegóły: `WIDEO.md`.
