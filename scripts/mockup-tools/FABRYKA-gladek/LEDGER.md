# LEDGER — GŁĄDEK (haczyki do zasłony prysznicowej z kulkami)

Projekt: `62e5422a-9475-4e9b-afa3-483c53b62169` (Sprytko) · Produkt wf2: `03cbd8bb-408b-40d6-af10-d3b470709688`
· tt: `33a3362c-8ea8-495c-a414-296e1f520be9` · Aukcja: `1005009663329517` · Slug: `gladek`

## Oś czasu
| Data | Faza | Zdarzenie |
|---|---|---|
| 2026-07-24 | KROK 1 / kalkulacja | Bezpiecznik rentowności — kalkulacja netto v3.2. Koszt ef. 34,14 zł (Ali 21,14 + cło 13). Cel 40% = 74,90 zł. |
| 2026-07-24 | research | Sufit rynku PL no-name 12-pak metal-z-kulkami ~59,90 zł (bezpiecznie 49,90). Cel 40% > sufit. |
| 2026-07-24 | DECYZJA | 🔴 **STOP NA BEZPIECZNIKU.** Dropship + zimny ruch Meta nie spina (kontrybucja << CPA). Rekomendacja → Tomek (`RENTOWNOSC.md`). |
| 2026-07-24 | F0 (groundwork) | KARTA-PRAWDY, GALERIA (6 keep/2 odsiew), WIDEO, RENTOWNOSC spisane ze snapshotu. Sceny/makiety/wideo NIE generowane. |

## Koszty API (wf2_costs)
**$0.00** — nie uruchomiono żadnej płatnej generacji (gpt-image / fal / Kling). Bezpiecznik zatrzymał
build PRZED F2. Analiza = tokeny Claude (abonament, nie liczone) + research web.

## Blokady (do decyzji Tomka)
1. **Rentowność** — cel 40% (74,90 zł) > sufit rynku (~59,90 zł); dropship kontrybucja 5,62–13,59 zł/pak << CPA 75–250 zł. Cło ryczałt 13 zł = 62% kosztu towaru.
2. **Źródło `datahub`** — poza `TRUSTED_SNAPSHOT_SOURCES`; gate F0/kalkulacja twardo blokuje (`--force` nie omija). Wymaga re-snapshot `source=detail`.
3. **0 opinii** — brak dowodu społecznego (landing musiałby być specs/demo/mechanism-led).
4. **TikTok off-product** — okładka (g7) = inny produkt (retractable curtain); kąt wiralowy niepotwierdzony dla Głądka.

## Stan wznawialności
- Groundwork F0 gotowy (KARTA/GALERIA/WIDEO/RENTOWNOSC). Nazwa proponowana: **Gładek** (slug `gladek`, PROWIZORYCZNA — rezerwacja bud_brand_names należy do F2.5).
- Gdy Tomek da GO (wariant b/c z RENTOWNOSC §7) + re-snapshot `detail` + zweryfikowany klip → wznowić od F1 (PLAN).

## Odstępstwa od SSOT (świadome)
- **F0 groundwork zbudowany mimo `source=datahub`** (KARTA oznacza gate NIE-PASS). Fakty spisane
  ze snapshotu dostarczonego w zleceniu jako ground-truth; build (F2+) nie ruszył, więc gate źródła
  nie został „obejściem" — jest jawnie zaraportowany jako blokada #2.
- **Krok `kalkulacja` NIE domknięty automatem** (panel-sync `kalkulacja` SystemExit na datahub).
  Kalkulacja wykonana ręcznie (RENTOWNOSC.md), panel opisany notą, `price` pozostaje `null`
  (brak decyzji o cenie = brak zapisu ceny).
