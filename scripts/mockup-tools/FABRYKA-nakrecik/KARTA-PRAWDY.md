# KARTA PRAWDY — NAKRĘCIK (magnetyczny uchwyt POV na szyję do telefonu) · F0.6 · 2026-07-24

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET-SKU]** (konkret sprzedawanego
wariantu) / **[SPEC]** (z tabeli parametrów / tytułu) / **[GALERIA]** (dowód z kadru) /
**[OPIS]** (destylat opisu-FAKT) / **[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** **magnetyczny uchwyt na szyję do telefonu** (hands-free neck mount) do nagrywania
  **z perspektywy pierwszej osoby (POV)**. Miękka silikonowa obręcz na kark + **magnetyczny
  pierścień MagSafe** na **składanym, przegubowym ramieniu ze stopu**. Telefon „przyklejasz"
  magnesem, masz obie ręce wolne.
- **Slug roboczy fabryki:** `nakrecik`. **Mini-marka = „Nakręcik" (PROWIZORYCZNA — F2.5
  potwierdzi/zarezerwuje w `bud_brand_names`).** Nazwa od korzyści rdzeniowej: *nakręcić* materiał
  (film/wideo) — nie koduje jednego kontekstu (anty-Popiołek: działa dla vloga/gotowania/DIY/
  sportu/rodzica).
- **Rekord kuracji:** `bud_tt_products.id = 09a2e387-ae53-4268-a20d-8bcdf509e8bb`
  (`gallery_curated`). ali_product_id `1005006455949937`. `wf2_products.id =
  ee6e4040-1551-4447-a037-3c4bfc8bd878`, projekt `62e5422a-9475-4e9b-afa3-483c53b62169`.
- **Źródło danych:** aukcja AliExpress `1005006455949937`, **`source='detail'` = ZAUFANE**
  (gate F0 PASS ✓). Snapshot pobrany 2026-07-21T18:43Z.
- **⛔ WHITE-LABEL:** marka **„TELESIN"** (spec Brand Name), sprzedawca **„TELESIN Photography
  Store"** — **NIGDY na stronie**. Wordmark „TELESIN" jest **wypalony w KAŻDYM kadrze galerii**
  (nadruk na ramieniu urządzenia + infografiki) i w wideo produktowym → RETUSZ/CROP obowiązkowy
  (patrz GALERIA.md §2). Sam produkt ma molowane „TELESIN" na module ramienia (drobne) → w F3
  packshot renderujemy BEZ nadruku.
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Consumer Electronics > Camera & Photo (panel:
  „Tech & Gadżety").

## 1. Cena
- **NASZA cena PL: 124,90 zł** [ODCZYT z `wf2_products.price` — krok `kalkulacja` DONE; fabryka
  landingów NIE ustala i NIE zmienia ceny]. Końcówka zgodna z regułą (<150 → ,90).
- **Koszt zakupu (sprzedawana konfiguracja, wariant bazowy „Grey" $29.03): 110,16 zł**
  [KONKRET-SKU] = **$29.03 × kurs NBP 3,7946** (odczyt `_nbp_usd_rate` 2026-07-24). Zapisane w
  `wf2_products.cost_purchase = 110,16`.
- **Narzut ~11% · zysk/szt. 12,24 zł brutto** (po prowizji 2% platformy) [`unit_profit`
  GENERATED, `wf2_products.unit_profit = 12,24`]. To **cena TESTOWA** (pasmo narzutu 10–15% =
  celowo cienka; po doliczeniu cła ryczałt 13 zł/szt. netto ≈ 0). **Silnik cenowy windzie do
  rentowności po potwierdzeniu popytu** — headroom w paśmie rynkowym: przy 149 zł zysk netto
  ~+22,9 zł, przy 159 zł ~+32,7 zł. **BEZPIECZNIK RENTOWNOŚCI PASSED** (patrz LEDGER F0).
- **Koszty wariantów USD** [KONKRET-SKU, `sku_prices`]: **Grey $29.03** (bazowy, sprzedawany) ·
  **Green $29.54** · Grey remote set $30.18 · Green remote set $30.71.
  ⚠️ **MODEL CENY:** strona sprzedaje JEDNĄ konfigurację — **uchwyt bazowy (bez pilota)**, cena PL
  jedna **124,90 zł**. **Kolor = wybór estetyczny** (Grey / Green — oba mają dowód koloru w
  galerii g5, oba w marży ~110–112 zł landed). ⛔ **Warianty „remote set" (z pilotem) NIE
  oferowane** — dokładają pilot BT, którego bazowa specyfikacja NIE ma (`Support Remote
  Control: No`), i podnoszą koszt bez korzyści dla naszego kąta (hands-free, nie zdalne).
- Dostawa/COD/zwrot: warunki sklepów fabryki (COD + zwrot 14 dni, checkout Trevio).

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC]
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | TELESIN | *WEWN. — white-label, nie na stronę* |
| Material | Silicone | zewnętrzna powłoka obręczy (skin-friendly) |
| Configured for (Adaption) | Smartphones | uniwersalny — patrz §2a kompatybilność |
| Folded Length (mm) | 138 | **złożony ~138 mm** — mieści się w dłoni/kieszeni |
| Model Number | MNM-001 | *WEWN.* |
| Support Remote Control | No | **wariant bazowy BEZ pilota** (potwierdza model ceny §1) |
| Origin | Mainland China | *WEWN.* |
| High-concerned chemical | None | puste — POMIŃ |
| Communication | None | puste — POMIŃ |
| Package | Yes | *WEWN.* |
| Choice | yes | *WEWN.* |

### 2a. Specyfikacja z OPISU + kadrów galerii — [OPIS]/[GALERIA]
| Parametr | Wartość | Kotwica |
|---|---|---|
| Konstrukcja | **potrójna warstwa: rdzeń — stalowa gęsia szyja (stainless steel) → obudowa ze stopu aluminium → zewnętrzna powłoka silikonowa** | [OPIS pkt 9 „Triple-layer structure: stainless steel gooseneck… solid aluminum… skin-friendly silicone"; g5 „Materials: Metal alloy, stainless steel, silicone"] — **RDZEŃ jakości** |
| Magnes | **16 magnesów neodymowych**, pełny pierścień (MagSafe) | [OPIS pkt 3/4 „Full-circle strong magnets", „16 powerful neodymium magnets, exceeds car-mounted standards"] |
| Waga | **220 g** | [GALERIA g5 „Weight 220g"] |
| Wymiary | **280 × 200 × 170 mm** (obwód zewn. 560 mm / obręcz karku wewn. ~170 mm / wys. 200 mm) | [GALERIA g5 „Size 280*200*170mm"; wymiary łuku 560/170/200 mm] |
| Kolory | **Grey (grafit) / Green (pistacja)** | [GALERIA g5 „Color: Grey, Green"; g1/g2 zielony wariant] |
| Ramię | **składane, przegubowe**, tłumiony trzpień obrotowy (damping pivot), złożone ~138 mm | [OPIS pkt 5/7; g4 „Folding storage"; SPEC Folded Length 138] |
| Tryby ujęcia | pion / poziom / z góry (overhead) / z dołu (low-angle) | [OPIS pkt 8; g3 „Horizontal, vertical, overhead, and elevation shooting"] |
| Baza | poduszka powietrzna (air-cushion) amortyzująca drgania | [OPIS pkt 1/6 „Air Cushion Shock Absorption… reduces motion impact"] |
| Zwolnienie | **szybkozłączka — przycisk (button switch)** | [OPIS pkt 10 „Quick-release design, Button Switch"; wideo „Quick release design"] |
| Kompatybilność | iPhone (12–15+) bez etui lub z etui MagSafe; **Android** — dołączona blaszka magnetyczna (do etui) lub etui z ringiem magnetycznym | [OPIS pkt 11] |
| W zestawie | uchwyt na szyję ×1, **blaszka magnetyczna ×1**, instrukcja ×1, **zestaw czyszczący ×1**, **linka zabezpieczająca (anti-lost) ×1** | [OPIS „Package include"] |

### 2b. ⚠️ SANITY LICZB — ROZSTRZYGNIĘCIA
- **„10 000 obrotów osi / Spindle life 10000+"** (g2, OPIS pkt 7) = deklaracja żywotności z
  **laboratorium TELESIN** (g2 stopka „obtained from TELESIN laboratories") → **BEŁKOT-CUT jako
  claim liczbowy w copy**. Wolno pokazać KORZYŚĆ bez liczby: „wzmocniony, tłumiony przegub trzyma
  kąt — nie opada, nie drga przy lekkim ruchu" [OPIS pkt 7, g2 „stable shooting angle without
  displacement or shaking during light movements"].
- **„Exceeds car-mounted standards"** — porównanie sprzedawcy → forma zawężona: mówimy o
  **sile magnesu** (16 neodymów, pełny pierścień) i dowodzie z opinii (nie odpada przy skakaniu),
  NIE cytujemy „normy samochodowej".
- **„MagSafe"** — produkt jest MagSafe-owy dla iPhone; nazwy „MagSafe" (znak Apple) na stronie
  używać ostrożnie/ogólnie („magnetyczny, zgodny z iPhone MagSafe"); Android przez dołączoną
  blaszkę. Bez przesady.

## 3. Destylacja opisu sprzedawcy — FAKT / BEŁKOT
**FAKTY (z kotwicą — feature→benefit):**
- Magnetyczny pierścień, 16 neodymów, pełny okrąg → „telefon trzyma się mocno, nie spada nawet
  przy ruchu — przyklejasz jednym pstryknięciem" (kotwica: OPIS 3/4 + opinie [2][5][6] „magnet is
  very very strong", „no matter how much I jump around, it doesn't come off"). **RDZEŃ USP #1.**
- Na szyję, hands-free → „obie ręce wolne — nagrywasz siebie z perspektywy pierwszej osoby (POV)"
  (kotwica: tytuł „Neck Mount" + OPIS 2 „Immersive POV Shots" + opinia [3] „for those who lack one
  hand when shooting", [18] „you can make videos like GoPro"). **RDZEŃ USP #2.**
- Potrójna konstrukcja stal + aluminium + silikon → „solidny metal, nie tandetny plastik; obręcz
  miękka i przyjemna na karku" (kotwica: OPIS 9 + g5 materiały + opinie [1][2] „Durable structure",
  „metal body everywhere", „necklace is soft and very durable"). **RDZEŃ USP #3.**
- Składane ramię, złożone ~138 mm, 220 g → „składasz do dłoni, bierzesz wszędzie" (kotwica: g4
  „Folding storage / Lightweight travel" + SPEC Folded 138 + g5 220 g).
- Szybkozłączka (przycisk), przeguby → „zdejmiesz telefon jednym kliknięciem; ustawisz pion/
  poziom/z góry/z dołu" (kotwica: OPIS 8/10 + g3 tryby + wideo „Quick release design").
- Zintegrowane ramię ze stopu, bez adapterów → „gotowe od razu, żadnych przejściówek" (kotwica:
  OPIS 5 + g1 „Integrated Stand… no need for redundant adapters", porównanie ze starym uchwytem).

**BEŁKOT / OSTROŻNIE (CUT albo forma zawężona):**
- „Empower Your Mobile Filmmaking", „Immersive", „Sleek and minimalist", „exceeds car-mounted
  standards", „10000+ spindle life" (liczba) — **BEŁKOT-CUT** lub forma zawężona (patrz §2b).

## 4. Warianty
**4 warianty** w `sku_prices`: **Grey $29.03 (bazowy — sprzedawany)** · Green $29.54 · Grey
remote set $30.18 · Green remote set $30.71. **MODEL CENY: jedna cena PL 124,90 zł.** Na stronie:
konfiguracja bazowa (bez pilota); **wybór koloru Grey/Green = estetyczny** (oba z dowodem koloru
w g5 — swatch dozwolony). Warianty „remote set" (z pilotem BT) **NIE oferowane** (§1). Kolor
kanoniczny renderu = **Grey/grafit** (dominuje w galerii g0/g3/g4/g6; PASZPORT).

## 5. Dowód społeczny
- **Ocena: ★ 4,8 / 5** [KONKRET, `review_stats`] · **187 ocen** · **96,8% pozytywnych**.
- **20 recenzji z treścią — WSZYSTKIE 5★** (`text_pl` = oryginał EN/PT/RU/ES bez tłumaczenia).
  Zawierają realne minusy (uczciwość Z5) — do porównania/FAQ. Treści §5a.
- **sold_volume = 426** [SPEC, WEWNĘTRZNY]: liczba globalna Ali ≠ nasz sklep → „X sprzedanych u
  nas" = FAŁSZ = ZAKAZ. 426 < 1000 → **POMIJAMY na stronie** (nawet nieprzypisanej frazy).
- **shop „TELESIN Photography Store"** — **🚫 NIGDY na stronie** (white-label; grep-gate F6).

### 5a. Recenzje (20 treści — VERBATIM, imiona zanonimizowane przez Ali; wszystkie ★5)
1. ★5 (3 zdj.): „Product with great Megsafe, perfect for first-person (POV) images and creating content." — **POV/twórca.**
2. ★5 (4 zdj.): „Durable structure, a bit heavy for comfort. The magsafe works well with my iphone. Adjustable arm is tight and fit. Click release for neck mount. Underside of mount has a soft padding… Neck mount is rubber padded and adjustable" — **konstrukcja solidna, ramię trzyma, miękkie podparcie; MINUS: trochę ciężki.**
3. ★5 (1 zdj.): „Fast delivery. Very good quality. Hefty and steady. …metal body everywhere. The necklace is soft and very durable. …The magnet ring is very very strong!! No risks of letting the iphone slip away" — **metal, mocny magnes, miękka obręcz.**
4. ★5 (2 zdj.): „Very cool magnetic holder. …The collar is made of very soft and flexible material, the magnetic ring is very strong! I recommend it for those who lack one hand when shooting. 👍" — **hands-free, mocny magnes.**
5. ★5: „…this magnetic version is very practical. …it's possible to make some really cool videos." — **do fajnych filmów.**
6. ★5: „The magnet is super strong; no matter how much I jump around, it doesn't come off. Buy it, you won't regret it." — **magnes trzyma przy ruchu.**
7. ★5 (2 zdj.): „…very comfortable holder, the attachment is firm, the phone doesn't fall under its own weight." — **wygodny, telefon nie opada.**
8. ★5 (3 zdj.): „The best product I've ever bought… the quality is ABSURD, worth every penny. I thought it was very expensive at first… but it's worth it, this is for the rest of life." — **jakość, warte ceny (obiekcja ceny → rozbrojona przez klienta).**
9. ★5 (2 zdj.): „Great quality product… Everything arrived as advertised. You can buy with confidence." — **zgodny z opisem.**
10–16, 19. ★5: warianty „excellent quality", „incredible, wonderful, perfect", „works like GoPro" [18], „makes a big difference to my content" [16], „easy to install" [12], „sturdy… hinges are very durable" [13].
17. ★5 (2 zdj.): „Excellent product, the quality is noticeable. I only have a problem with the magnet; I think it doesn't stick that well." — **MINUS: pojedyncza opinia o słabszym trzymaniu magnesu** (uczciwość: 1/20; kontra do [2][3][5][6][7]).
18. ★5 (4 zdj.): „I found it quite interesting, you can make videos like GoPro." — **jak GoPro / POV.**

**Wzorce (plusy → copy):** magnes bardzo mocny (nie spada przy ruchu) · solidny metal, wysoka
jakość „warte ceny" · miękka, wygodna obręcz · hands-free „brakująca trzecia ręka" · efekt POV /
„jak GoPro" · szybka dostawa · zgodny z opisem.
**Wzorce (REALNE minusy → porównanie/FAQ uczciwie):** trochę ciężki (220 g — metal = cena za
solidność) · 1 opinia o słabszym trzymaniu magnesu (kontekst: ciężkie etui/nie-MagSafe → użyj
dołączonej blaszki i cienkiego etui) · dobierz cienkie, gładkie etui pod blaszkę (precaution z OPIS).

## 6. Materiał wizualny → `gallery_curated`
Kuracja 8 kadrów (g0–g6 galeria detail + g7 okładka TikTok). Werdykty i cropy: `GALERIA.md`.
⚠️ **KAŻDY kadr galerii ma wypalony „TELESIN" + tekst EN** → keep wymaga CROP-u/retuszu; czyste
packshoty (grafit + zielony) do wygenerowania w F3.

## 7. Wygląd i wideo
- **PASZPORT wizualny:** `PASZPORT.md` (cechy dyskryminujące + „CZEGO NIE MA" + white-label).
- **Wideo:** `ali_snapshot.video_url` **istnieje** (41,6 s, 1280×720, ON-product, czysty demo)
  **ALE** ma wypalony wordmark „TELESIN" (róg) + angielskie napisy przez cały klip (white-label +
  rynek PL) → **NIE self-hostujemy verbatim**. `tiktok_url` = UGC innego twórcy (remont/DIY POV,
  brandowany). **Ruch na stronie = nasze hero-video (F5, Kling i2v) + sceny ANIM** (F1.7b).
  Szczegóły i decyzja o sekcji wideo-UGC: `WIDEO.md` (klasa dowodowa — patrz MANIFEST F1a).
