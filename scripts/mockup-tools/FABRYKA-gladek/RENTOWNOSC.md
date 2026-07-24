# RENTOWNOŚĆ — GŁĄDEK (haczyki do zasłony prysznicowej z kulkami) · BEZPIECZNIK · 2026-07-24

> **WERDYKT: 🔴 STOP NA BEZPIECZNIKU — RENTOWNOŚĆ DO DECYZJI TOMKA.**
> Nie generowano scen / makiet / wideo (zgodnie z bezpiecznikiem KROK 1). Landing NIE zbudowany.
> Produkt NIE spina się na ekonomii **dropship + zimny ruch Meta** przy nowym cle ryczałtowym.
> **Nie jest to „zły produkt"** — na **hurcie** marża jest zdrowa (~69%). Problem jest wyłącznie
> w fazie TESTOWEJ (dropship, cło €3/szt., niska cena jednostkowa).

## 0. Dane wejściowe (twarde)
- Aukcja: `1005009663329517` — „12pcs Shower Curtain Hooks | Double Glide Rings with Rolling Beads".
- **Cena bazowa: $5.57** (jedyny wariant „Black"), zestaw **12 szt.**
- Kurs NBP USD (tab. **141/A/NBP/2026, 2026-07-23**): **3,7946**.
- `fees_pct = 2,0%` · `shipping_paid_by = client` (dropship: sklep nie płaci wysyłki).
- `cost_model` (settings.wf2_price_config v3.2): `vat_rate 0.23` · **`dropship_customs_fee_pln 13`**
  (cło ryczałt ~3 EUR/pozycję — OBOWIĄZUJE od 1.07.2026) · `scale_margin_target 0.40` ·
  `scale_margin_survival 0.12`.

## 1. Koszt efektywny (model `goods`, dropship)
```
cost_pln (brutto Ali)  = $5.57 × 3,7946            = 21,14 zł
+ cło ryczałt (dropship, od 1.07.2026)             = 13,00 zł
+ wysyłka sklepu (shipping_paid_by=client)         =  0,00 zł
= KOSZT EFEKTYWNY                                   = 34,14 zł
```
⚠️ **Cło 13 zł = 62% kosztu towaru.** To strukturalny zabójca rentowności produktu tak taniego
jednostkowo: ryczałt jest kwotą STAŁĄ (nie %), więc miażdży marżę na tanim SKU.

## 2. Progi cenowe (marża NETTO, model v3.2 §2g)
```
sale_net = P/1,23 ; fee_net = P×0,02/1,23 ; unit_net = sale_net − 34,14 − fee_net
```
| Próg | Cena | Uwaga |
|---|---|---|
| **Break-even (0% netto, 0 reklam)** | **42,85 zł** | poniżej = strata na KAŻDEJ sztuce, jeszcze BEZ reklamy |
| Floor „przetrwania" 12% (0 reklam) | 48,83 zł | |
| **CEL 40% netto (`scale_margin_target`)** | **74,90 zł** | aspiracja reżimu SCALE/BASE |
| viable_floor @ CPA 50 zł (12% survival) | **120,34 zł** | żeby przeżyć z reklamą przy CPA 50 |

Marża netto przy realnych cenach psychologicznych (PRZED reklamą):
| Cena | Zysk netto/szt. | Marża netto |
|---|---|---|
| 49,90 zł | +5,62 zł | **13,8%** |
| 59,90 zł | +13,59 zł | **27,9%** |
| 69,90 zł | +21,55 zł | 37,9% |
| **74,90 zł** | +25,54 zł | **41,9%** ← 40% dopiero tutaj |
| 79,90 zł | +29,52 zł | 45,4% |

## 3. Sufit rynkowy PL (research 2026-07-24 — potwierdzone ceny)
Nisza „metal z kulkami / double glide / roller" w PL jest **CIENKA** (produkt popularny w USA, rzadki w PL),
wewnątrz **mocno nasyconej** kategorii (plastik 9–30 zł, dziesiątki sprzedawców).
Bezpośrednie punkty odniesienia dla wariantu rolkowego/z kulkami (12 szt.):
- Leroy Merlin Easy Roll (plastik rolkowy): **26,29 zł**
- Sealskin Easy Roll alu. mat: **28,55 zł**
- **Sealskin Easy Roll czarne — Castorama: 58,54 zł**
- **Dwustronne haczyki chromowane — Allegro Lokalnie: 63,00 zł**
- Kleine Wolke Boccia (marka premium, lity metal): **84–110 zł**

**Sufit psychologiczny dla no-name 12-paka metal-z-kulkami: ~59,90 zł** (bezpiecznie 49,90 zł).
- 49,90 zł = sweet spot (poniżej Castoramy/Allegro).
- 59,90 zł = realny sufit mainstreamu (= Castorama 58,54), TYLKO z mocną narracją USP.
- 69,90 zł = stretch (walka z markowym Boccia 84 zł).
- **79,90 zł = nierealne dla no-name** (kotwica kategorii: buyer pamięta plastik 15–29 zł).

## 4. Zderzenie: cel 40% vs sufit rynku
> **Cel 40% netto (74,90 zł) leży ~25% POWYŻEJ sufitu rynkowego (~59,90 zł).**
> Na dropshipie NIE DA SIĘ osiągnąć 40% marży netto przy cenie, którą rynek zaakceptuje.
> Przy cenie osiągalnej (49,90–59,90 zł) marża netto dropship to zaledwie **14–28%** — poniżej progu.

**Reklama dobija:** kontrybucja na 1 zamówienie 1-paka = **5,62 zł (49,90)** / **13,59 zł (59,90)**.
Zimny ruch Meta PL: CPA **75–250 zł/zam.** (matematyka budżetu CENNIK-PLAN §0). Każda sprzedaż
z reklamy = strata 60–235 zł. **Multipak nie zamyka luki**: 2–3 paki × 13,59 zł = 27–41 zł kontrybucji,
wciąż < najniższego CPA (75 zł).

## 5. Prognoza HURTU (informacyjnie — tu produkt się spina)
```
est_cost_hurt_net = (21,14/1,23) × (1−0,40) × (1+0,15) = 11,86 zł  (VAT odliczalny, cło w extras 15%)
@ 49,90 zł: zysk netto/szt = 40,57 − 11,86 − 0,81 = 27,90 zł → marża 68,8%
@ 59,90 zł: zysk netto/szt = 48,70 − 11,86 − 0,97 = 35,87 zł → marża 73,7%
```
Na **hurcie** (zakup luzem z Chin, VAT odliczalny, brak ryczałtu cła/szt.) marża jest **zdrowa (~69–74%)**
nawet w dolnej półce rynku. Wąskim gardłem NIE jest wtedy marża, lecz popyt/kotwica cenowa.

## 6. Dodatkowe blokady (niezależne od ceny — też wymagają decyzji Tomka)
1. **Źródło snapshotu = `datahub`** — NIE jest w `TRUSTED_SNAPSHOT_SOURCES` (`detail`/`allegro`).
   Gate F0 / `kalkulacja` (panel-sync) **twardo blokuje** datahub (`--force` NIE omija — incydent Latarka).
   Przed jakimkolwiek buildem wymagany re-snapshot z ŻYWEJ aukcji `source=detail`.
2. **0 opinii** (`numRatings=0`) — zero dowodu społecznego. Landing musiałby być specs/demo/mechanism-led.
3. **„Wiralowy" TikTok = off-product** — okładka klipu (`g7`, @ryans.amazing.finds) pokazuje INNY produkt
   (fioletowy gadżet „Retractable Shower Curtain"), NIE nasze haczyki. Kąt wiralowy dla TEGO produktu
   jest NIEPOTWIERDZONY (klasa incydentu Zaklipka g6 = obcy produkt ORICO).

## 7. REKOMENDACJA (do decyzji Tomka)
- **(a) DEFAULT — ODPUŚĆ na dropshipie.** Jako produkt do testu zimnym ruchem Meta w modelu dropship
  NIE spina się: cło ryczałt + sufit rynku poniżej celu 40% + kontrybucja << CPA. Ryzyko: przepalony
  budżet testowy przy zerowej szansie na dodatnią kontrybucję jednostkową.
- **(b) GO TYLKO jako świadomy TEST POPYTU** przy **49,90 zł** (nie wyżej), z akceptacją UJEMNEJ
  kontrybucji w fazie testu — czysta walidacja kąta „zasłona nie spada, ślizga się jak po maśle",
  a przy dobrym CR **pivot na HURT** (gdzie marża 69%+). To zakład (paid validation), decyzja Tomka.
- **(c) SWAP** na produkt wyższej półki, gdzie kontrybucja jednostkowa pokrywa CPA zimnej Mety, LUB
  od razu zaopatrzenie **hurtowe** (test na zdrowej marży od startu).
- **Niezależnie:** przed buildem wymagany **re-snapshot `source=detail`** + **zweryfikowany klip wiralowy
  DLA TEGO produktu** (obecny TikTok = obcy produkt).

**Gdyby Tomek wybrał (b)/(c) i dał zielone światło — groundwork F0 (KARTA/GALERIA/PASZPORT) gotowy,
build wznawialny od F1. Nazwa proponowana: „Gładek" (slug `gladek`).**
