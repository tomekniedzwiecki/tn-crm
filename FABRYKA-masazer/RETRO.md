# RETRO — Rozgrzewek (Ulepszek) · F8 · 23.07

Nowe wnioski z całego cyklu (F0→finisz). Format: **wniosek → co zmienić w praktyce.**

## Produkt / dane / prawo
1. **`platform_name` NULL = claim medyczny wchodzi do kasy.** Kasa/sticky brały nazwę systemową
   „…do drenażu limfatycznego” (ZAKAZ Karty), bo `wf2_products.platform_name` był null.
   → **Praktyka:** w kroku publish ZAWSZE sprawdzić `platform_name` PRZED go-live; ustawić jawną
   nazwę handlową („Rozgrzewek — podgrzewany masażer do ciała”). Dodać do checklisty publish.
2. **„21 kulek” niepoliczalne na realnym kadrze → złagodzenie, nie claim.** g0/UGC pod kątem ~30°
   dają 19–22 (niepewne 21). Wypalenie dużej „21”/count-upu = claim FALSYFIKOWALNY przez klienta.
   → **Praktyka:** liczba z infografiki dozwolona TYLKO jako zdanie w body; NIGDY „policz na zdjęciu”.
   Gdy cecha jest policzalna na assecie — nie eksponować liczby ponad to, co asset pewnie udowadnia.
3. **Galeria uboga (1 czysty kadr) + biel-na-bieli nieprogowalne.** 5/6 kadrów detail = infografiki
   z wypalonym tekstem EN; keep = tylko g0. Packshot na białym tle = keying nieprogowalny prostym
   floodfillem bez artefaktów. → **Praktyka:** przy 1<4 czystych kadrach od razu plan fallback (CROP
   g0 + UGC z opinii + sceny natywne); keying weryfikować kompozytem na 3 tłach + statystyką alpha.

## Kasa / moduł
4. **Checkout jako WŁASNA sekcja `#zamow`, nie zagnieżdżony w sekcji GPT.** Zagnieżdżenie gubi
   `data-zc-api` z roota modułu → fallback „Zamówienie niedostępne” (lekcja Brzuszek/Rozmrozik).
   → **Praktyka:** `zc-checkout` = tożsamy z `section#zamow`, niosący OBA: `data-zc-product`
   (placeholder `{{WF2_PRODUCT_ID}}`) + `data-zc-api`. Nigdy klasa+atrybuty na dziecku.
5. **Sticky-buy = drugi IntersectionObserver na `#zamow`.** Pasek chowa się nad kasą (nie dubluje CTA
   przy formularzu). → **Praktyka:** sticky zawsze z IO chowającym go w strefie checkoutu.

## Gate / proces finiszu (najcenniejsze do reuse)
6. **Gate-check ma sztywną strukturę archiwum — deklaracja agenta ≠ prawda.** Wymaga
   `galeria-kuracja/GALERIA.md`, `dopasowanie/{WIERNOSC,SEMANTYKA}.md`, `RETRO.md`, `makiety/*.png`
   (mobile po sufiksie `-mobile`). → **Praktyka:** budować tę strukturę OD RAZU w F0–F3, nie na finiszu.
7. **WIERNOSC.md musi być MASZYNOWO parsowalny, nie tylko czytelny.** Parser szuka tabeli, werdyktu
   `WIERNOŚĆ: {ZGODNA|REAL|ESKALACJA}` i ZGODNA wymaga: 0×FAIL + `PASS ≥ K` (K = liczba cech
   dyskryminujących z PASZPORT) + `pass-2: TAK`. Werdykty typu „PASS” w prozie NIE przechodzą.
   → **Praktyka:** wykonawca F3A od razu pisze tabelę w formacie kanonicznym (patrz odsaczek/ugniatek).
8. **`--product-key` MUSI wskazywać TT-id radaru, nie wf2-id z KARTY.** Gate domyślnie bierze wf2-id
   (brak w `bud_tt_products`) → FAIL. → **Praktyka:** uruchamiać z `--product-key <TT-id>` (tu
   `5e1d40a8…`) i trzymać to w LEDGER. Po kuracji zapisywać `gallery_curated` do radaru (nie zostawiać
   NULL) — inaczej gate `baza` FAIL mimo wykonanej kuracji.
9. **SSIM dopasowania = INFORMACYJNY, nie próg.** 0.32–0.67 na pastelowych scenach AI to szum, nie
   defekt (dowód: kierunki delt H2 niespójne). → **Praktyka:** wierność rozstrzyga LAYOUT-DIFF (DOM
   self-checki) + rubryka 5×T/N + WIERNOSC; SSIM tylko jako sygnał, progi w checkliście `done:false`.
10. **cross_landing mierzy WRÓG parasol.** Anty-rodzeństwo porównuje font/akcent z
    `sklepy/tomek-niedzwiecki/*`, a Rozgrzewek stoi w `patryk-skrzypniak/` (Ulepszek). Fraunces koliduje
    z `mata` (inny parasol). Brak per-landing noty w checku. → **Praktyka:** świadome odstępstwo do
    LEDGER; docelowo gate powinien porównywać w obrębie serii (glob/parasol), bo dziś daje fałszywy
    FAIL dla landingów spoza tomek-niedzwiecki. Font briefowany (F1) NIE ustępuje przed mis-scope’em.

## Assety / wagi
11. **Sceny WebP q85 bywają >120 KB; q72–80 method 6 tnie ~40% bez degradacji.** Packshot PNG-alpha
    quantize 256 = 292→47 KB. → **Praktyka:** budżet 120 KB pilnować JUŻ przy uploadzie scen (q≈74–80),
    packshoty alpha kwantyzować; render-size decyduje o wymiarach (packshot 341 px wystarcza dla 430 px slotu).
