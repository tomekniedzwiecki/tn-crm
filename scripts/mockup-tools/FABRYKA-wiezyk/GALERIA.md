# GALERIA — kuracja AliExpress (F0.5, WIEŻYK) · 2026-07-24

Aukcja źródłowa: `1005012500407228`, **source=datahub (ZAUFANE, gate F0 PASS ✓)** — DataHub
`item_detail` po dokładnym itemId = jedna wskazana oferta (nie sklejka `search`). 8 kadrów
(`ali_snapshot.images` g0–g7, WebP 2000×2000, proporcja **1/1** → `--gal-aspect: 1/1`).
Werdykty zapisane też w `bud_tt_products.gallery_curated`.

⚠️ **CECHA KLUCZOWA TEJ GALERII (odwrotnie niż Zaklipek):** galeria jest **BOGATA** — **4 czyste
kadry lifestyle bez wypalonego tekstu** (g0, g2, g6, g7), obejmujące **wszystkie 3 warianty
kolorystyczne** (beż · jasnoszary · ciemnoszary). Cztery pozostałe (g1, g3, g4, g5) to
infografiki z wypalonym tekstem ENG — na stronę as-is NIE, ale niosą cenne DANE (wymiary,
nazwy elementów, dowód koloru). **Produkt spójny na wszystkich kadrach** (ta sama architektura:
punkt widokowy + kosz-gniazdo + domek-jaskinia z 2 łukami + hamak + słupki sizalowe + pompony +
sznur + podstawa) — różni się WYŁĄCZNIE kolor = 3 legalne warianty tego samego modelu (NIE
`inny-egzemplarz`). **Brak czytelnego nadruku marki na samym produkcie** → zero retuszu white-label.

## KEEP (4) — czyste kadry lifestyle na stronę (klasa R)
| kadr | wariant | rola | werdykt | alt_pl | uwaga |
|---|---|---|---|---|---|
| **g0** | beż | lifestyle-hero — 5 kotów korzysta z wieży naraz, klasyczna biblioteka | **KEEP** | „Beżowa kocia wieża Wieżyk ze śpiącymi i bawiącymi się kotami w domowej bibliotece" | **kanon hero** (cover_url/main_image); pokazuje KOMPLET: punkt widokowy, kosz, jaskinię, hamak, słupki, pompony; dowodzi „dla kilku kotów naraz" |
| **g2** | beż | lifestyle-human — kobieta na sofie bawi kota wędką, 2 koty na wieży | **KEEP** | „Kobieta bawi się z kotem przy beżowej wieży Wieżyk w salonie" | **casting ICP** — realna właścicielka, ciepła scena; emocja „wspólny czas z kotem" |
| **g7** | jasnoszary | packshot-w-kontekście — pusta wieża, pełna struktura widoczna, salon z żyrandolem | **KEEP** | „Jasnoszara kocia wieża Wieżyk — pełna konstrukcja w eleganckim salonie" | **najczystszy widok całej architektury** (bez kotów zasłaniających poziomy) — kandydat na packshot bazowy jasnoszary |
| **g6** | ciemnoszary | lifestyle-color — wieża przy skórzanej chesterfieldzie, 1 kot na szczycie | **KEEP** | „Ciemnoszara kocia wieża Wieżyk w salonie z chesterfieldem" | dowód wariantu ciemnoszarego w kontekście premium |

**Kolejność on-page** (galeria): g0 (hero/beż) → g2 (in-use/beż) → g7 (struktura/jasnoszary) → g6 (ciemnoszary).
⚠️ **Miks kolorów = INTENCJONALNY** — pas „dostępne w 3 kolorach" (beż g0 · jasnoszary g7 ·
ciemnoszary g6), nie patchwork. Główna galeria wariantu bazowego = **beż** (g0/g2); g7/g6 jako
dowód palety. Wspólny grading CSS obowiązkowy.

## ODSIEW (4) — NIE na stronę as-is; TREŚĆ → DANE do KARTY/PASZPORTU
| kadr | klasa | werdykt | dlaczego | treść → KARTA |
|---|---|---|---|---|
| **g4** | rozmiarówka | **DANE** (+ crop packshotu możliwy) | wypalone „PERFECT DIMENSIONS" + strzałki wymiarów | **[GALERIA]: wys. 164,5 cm (marketingowo; na stronę 162 cm wg tytułu/opisu), domek 50×40×33 cm, kosz Ø30 cm, podstawa 52,5×42,5 cm** → §2b KARTY (rozmiarówka!) |
| **g3** | infografika-diagram | **DANE** | wypalone „ALL-IN-ONE CAT TREE" + call-outy „Top Perch / Cozy Condo / Soft Hammock" | **[GALERIA]: nazwy elementów** — punkt widokowy, domek-jaskinia, miękki hamak → §2b + MAPA (SHOWCASE) |
| **g1** | infografika-z-tekstem | **DANE** | wypalone „ENDLESS EXPLORATION / Sturdy design…" + call-outy „Active Play Area / Stable Base" | **[GALERIA]: stabilna podstawa, bezpieczne skakanie** → §3 FAKT (stabilność) |
| **g5** | kolaż-2 (ciemnoszary) | **DANE** (+ dowód koloru) | wypalone „FLUFFY CAT TREE"; 2 insety kota w hamaku (ciemnoszary) na brązowym tle | **[GALERIA]: dowód koloru CIEMNOSZARY + detal hamaka** → warianty §4; crop insetów = detal hamaka |

## Zdjęcia kupujących (protokół wyczerpania — klasa dowodowa F1a)
- Recenzje w snapshocie: **1** (★5, EN) — **BEZ zdjęć** (`reviews[0].images = []`).
- Storage `attachments/`: przeszukane `%1005012500407228%` → **tylko g0–g7, ZERO folderu bud-reviews**
  (brak jakichkolwiek zdjęć od kupujących). Precedens Rozmrozika (zdjęcia leżały w Storage)
  **sprawdzony i wykluczony**.
- **Werdykt: BRAK materiału zdjęciowego od kupujących.** Sekcja „zdjęcia od kupujących" = klasa
  dowodowa (F1a) → **`blokada-tomek`** (decyzja o pominięciu należy do Tomka, NIE do fabryki),
  nie `SKIP`. Odnotowane w LEDGER (protokół wyczerpania) i MANIFEŚCIE (F1).

## White-label
Produkt (pluszowa wieża) **NIE ma czytelnego nadruku marki** na żadnym kadrze → **zero retuszu**.
Marka `Hzuaneri` (spec Brand Name) i tak NIGDY na stronie (nowa mini-marka = Wieżyk).

## Notatka kompozycji
Galeria **BOGATA** (4 czyste lifestyle) — brak potrzeby ratowania fallbackiem. Proporcje kafli 1/1.
Hero canon = beż (g0). F3: sceny = derywaty makiet; czyste kadry g0/g2/g7/g6 jako referencja
wierności bryły i realny materiał galerii on-page.
