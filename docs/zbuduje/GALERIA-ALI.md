# GALERIA-ALI — kuracja realnych zdjęć z galerii AliExpress (F0 GATE + F0.5)

**Status: OBOWIĄZUJE (2026-07-17; zasada Tomka „galeria AliExpress = punkt wyjścia tego,
jak wygląda produkt" + incydent Latarek: search-galeria z INNEJ aukcji → landing zbudowany
na nieistniejącym produkcie).** Synteza 2× research Sonnet (kurator + integrator).

## 0. GATE F0: `source='detail'` OBOWIĄZKOWY (twardy)
Przed czymkolwiek sprawdź `bud_tt_products.ali_snapshot->>'source'`:
- `!= 'detail'` lub brak snapshotu → wywołaj `bud-ali-snapshot` `{productKey, force:true}`
  (auth: `x-tools-secret`=BUD_TOOLS_SECRET albo `sessionId` z `bud_sessions`; martwy/zły
  chosen_link → dołóż `link` z właściwą aukcją).
- Po force nadal ≠ `detail` = **STOP PRODUKTU** + nota `FABRYKA-*/<slug>/BLOK-source.md`;
  ZAKAZ budowy na search-galerii (bywa INNYM produktem). `curatedUrl` ratuje pojedyncze
  zdjęcie karty, ale NIE podnosi source i nie odblokowuje budowy.
- **PASZPORT PRODUKTU i KAŻDA referencja generacji — wyłącznie z galerii detail.**
- **Doprecyzowanie (Tomek 17.07): gate NIE jest o „żywości" aukcji, tylko o POCHODZENIU
  danych.** Snapshot detail RAZ pobrany wystarcza na zawsze (galeria zrehostowana u nas,
  dane zamrożone) — fabryka przy budowie NIE odpytuje żywej aukcji. Żywa aukcja jest
  potrzebna jednorazowo do UTWORZENIA snapshotu detail (search-snapshot to sklejka
  z wyszukiwarki — bywa INNYM produktem i nie da się go „naprawić" bez detail) oraz
  niezależnie przy realizacji zamówień (fulfillment musi mieć skąd kupić towar).

## 1. F0.5 KURACJA GALERII (po zielonym gate, PRZED F1)
Agent-kurator orzeka per kadr galerii detail; werdykty zapisuje w
**`bud_tt_products.gallery_curated jsonb`** (migracja 20260717) + czytelna kopia
`FABRYKA-*/<slug>/GALERIA.md` dla Tomka. Kształt: `{source_ok, product_id, curated_at,
items:[{url, klasa, werdykt, role, class:'R', keep, crop_bbox?, kolejnosc?, alt_pl, powod}]}`.
Konsumpcja: **F1** planuje z inwentarza `keep` (role/alt_pl) — nie z surowych images;
**F3** każdy `keep` = pełnoprawny asset klasy **R**; **F4** sekcja galerii/karta budują się
z `gallery_curated`, NIGDY z generacji.

## 2. KLASYFIKACJA per zdjęcie (werdykty: POKAŻ / CROP(bbox) / DANE / ODRZUĆ)
| Klasa | Sygnatura | Werdykt domyślny |
|---|---|---|
| packshot-czysty | jednolite jasne tło, zero tekstu | POKAŻ (główny slajd) |
| lifestyle-czysty | produkt w użyciu/dłoni, zero wypalonego tekstu | POKAŻ |
| detal/makro | zbliżenie mechanizmu, czyste | POKAŻ (po packshocie) |
| infografika-z-tekstem | wypalony napis (KAŻDY język) | DANE (USP→copy) + CROP czystej strefy |
| diagram-schemat | rysunek instruktażowy | DANE (przerysować natywnie PL) |
| rozmiarówka | wymiary na kadrze | DANE (→specs!) + CROP packshotów |
| kolaż / insety | kilka kadrów w pliku | CROP — rozbij na czyste kadry |
| duplikat-wariant | prawie identyczny | ODRZUĆ (1 reprezentant) |
| niska-jakość | kompresja/sklejka/ghost | ODRZUĆ |
| **inny-egzemplarz** | **INNY kolor/model/kształt niż paszport (galerie Ali i UGC miksują warianty i cudze produkty!)** | **ODRZUĆ — tożsamość produktu (incydent Odpalak: srebrny kompresor obok czarnego)** |
| **czytelny-brand** | nadruk producenta/obcej marki czytelny W PIKSELACH (grep tekstu tego nie łapie) | RETUSZ (flat-fill, nie blur-plama) albo ODRZUĆ |
Przy infografice notuj: język, ilość tekstu, czy treść WARTOŚCIOWA (USP/wymiary → copy/specs).

## 3. TANDETA (twarde — dowolny trigger = NIE na stronę as-is)
Wypalone napisy w każdym języku · watermarki/loga · sklejki 2×2 · przesycone
AliExpress-kolory, strzałki, obwódki, ceny, badge, przekreślenia · **scenografia
z innego świata** (korale/lód/plaża pod przyborem — fantazja zabija wiarygodność;
„czysty produkt" ≠ „dobry do galerii", decyduje TŁO) · ghost-sylwetki · duplikaty ·
mediana luminancji <70/255 · pikseloza.

## 4. KOMPOZYCJA GALERII NA STRONIE
Min 4, max 6 kafli; kolejność: packshot → detal/makro → lifestyle → skala/wymiar.
Lightbox z pełnym kadrem; alt-y PL z `alt_pl`; wspólny grading CSS (inaczej patchwork).
UGC tylko WPLECIONE (nigdy główny slajd). **Fallback przy ubogiej galerii po odsiewie**
(częste!): (a) CROP-y z kolaży/infografik jako detale; (b) 1-2 sceny S text-free z makiety
jako lifestyle (ale NIGDY jako „dowód produktu"); (c) 2-4 UGC z opinii (rehost, podpis
„zdjęcia od kupujących"). NIGDY nie łatać infografiką z obcym tekstem ani sceną-fantazją.

**⚙️ SEKCJA GALERII = MODUŁ `galeria@1` (3 twarde reguły, incydent mata 21.07):**
1. **Zawsze moduł `moduly/galeria@1.html`** (jak każda sekcja z odpowiednikiem — ZASADA UŻYCIA
   MODULY.md); DESIGN sekcji wolno zmieniać (tokeny/kolumny/eyebrow), MECHANIKA nietykalna.
2. **⛔ ASPEKT KAFLA = PROPORCJE ZDJĘĆ, KTÓRE MAMY (nie „na oko").** Zmierz realne pliki `keep*`
   (naturalWidth/Height) i ustaw `--gal-aspect` na DOMINUJĄCĄ proporcję. Zdjęcia Ali są zwykle
   KWADRATOWE → `1/1`. ⛔ NIGDY wysoki prostokąt (3/4.75) + `object-fit:cover` na kwadratach =
   przycięte boki (dokładnie ten defekt na macie: keep1–3 kwadrat wciśnięty w pion). Bardzo
   szeroki pojedynczy kadr → `.gal-card--wide` (span 2) albo osobny kadr, nie przycinaj w słupek.
3. **⛔ PODPIS/`alt_pl` = CO KADR NAPRAWDĘ POKAZUJE (anti-drift), zweryfikowane OCZAMI wobec
   piksela.** Podpis „z planu" niepasujący do zdjęcia = defekt (na macie: „Wałek pod kark" wisiał
   na makro kolców, „Zestaw w pokrowcu" na płaskiej macie — podpisy pomieszane). Przy kuracji (§1)
   `alt_pl` piszesz PATRZĄC na kadr, nie z listy planowanych ujęć. Kontrakt lightbox: `.gitem` +
   `data-full` (podgląd DZIAŁA); ⛔ `<a href>` bez `preventDefault` = klik nawiguje do gołego pliku.

## 5. ANTY-MISMATCH landing↔aukcja (FILTR PLANU w F1)
Tabela CLAIM→ŹRÓDŁO dla KAŻDEGO claimu planu (funkcje, zasilanie, elementy, wymiary,
materiał): źródło ∈ {tytuł detail, **specs**, galeria detail, opinie, **opis-FAKTY po
destylacji** (Karta Prawdy §1a — NIGDY BEŁKOT)}. KAŻDA korzyść NIESIE KOTWICĘ w nawiasie
(„służy latami (spec: Materiał=stal nierdzewna)"). Claim bez źródła = CUT.
Claim o KLASIE produktu / elemencie tożsamości (typ narzędzia, wyświetlacz, mechanizm)
bez źródła = **STOP planu** (incydent Latarek: elektryczny pistolet vs realne cążki).
**Warianty/swatche:** `sku.props` = źródło swatchy, mapowanie 1:1 PL (Blue→Niebieski,
Pink→Różowy, Kaki→Khaki); swatch TYLKO gdy w galerii jest wizualny dowód koloru. JEDNA cena PL
(baza marży = MAX kosztu wariantów z `sku_prices`); różnice cen wariantów WEWNĘTRZNE — nie na stronę.
