# CENNIK v2.0 — SILNIK DECYZJI PRODUKTOWYCH (ceny × kampanie × rentowność), Workflow v2 „Sklepy"

**Status: PLAN OSTATECZNY — czeka na akcept Tomka** (2026-07-18/19; koncept Fable 5;
v1 → runda „do wyczerpania": 2× krytyk Opus (architektura, ekonomia) + 2× research Sonnet
(playbooki TOP agencji, dźwignie zysku) + przegląd spójności; v2.0 = synteza wszystkich
znalezisk). Rozszerza `WORKFLOW-V2-PLAN.md` §0b i **NADPISUJE parametry progów z
`WORKFLOW-V2-TESTY.md` §6** (jeden klucz settings — §8). `[P]` = default w
`settings.wf2_price_config`. `[D]` = decyzja Tomka (lista §10).

---

## 0. ESENCJA

1. **Cena mieszka w NASZEJ bazie** (`wf2_products` + drabinka). Landing hydratuje cenę
   i link kasy z `wf2-landing-api` (działa dziś); platforma i landing = konsumenci ceny.
2. **Drabinka: TEST → SCALE (z krokiem RAMP w środku) → OPT.** Tomek podejmuje **2 decyzje
   per produkt**: werdykt WINNER (jak dziś, z rekomendacją silnika) i akcept ceny SCALE
   (1-klik). Cała reszta — wykonanie dwustopniowe ramp→scale, kroki OPT, monitoring,
   rekomendacje kampanijne — automat w granicach guardraili.
3. **Silnik `wf2-price-engine`**: odczyt metryk przy każdym syncu, **AKCJA cenowa raz
   dziennie** (kadencja realna: cooldown 7 dni; cron 30-minutowy to była nadmiarowa
   złożoność). Kill-switch globalny + dry-run + reconcile. Dowody, nie deklaracje:
   `confirmed` dopiero po weryfikacji ceny na platformie.
4. **Zmiana ceny na platformie = endpoint API** (developer DOROBI — decyzja Tomka 18.07;
   spec §3.4). Sekwencja ZALEŻNA OD KIERUNKU (§3.1): podwyżka — kasa OSTATNIA (+ bufor
   cache); obniżka — kasa PIERWSZA. Interim bez endpointu: tryb półautomatyczny §3.6.
5. **Cena × kampania × AOV = jedna decyzja produktowa.** Metryka nadrzędna =
   **kontrybucja całkowita w zł/dzień** (nie marża jednostkowa, nie platformowy ROAS).
   Dźwignia nr 2 obok ceny: **multipak** (2/3-pak jako osobny produkt platformy) — zysk
   łapiemy na ilości przy tym samym koszcie pozyskania (§2c).
6. **Panel `tn-sklepy/ceny.html`**: strefa „Do decyzji" (format agencyjny: obserwacja →
   rekomendacja → spodziewany efekt → termin), tabela wszystkich produktów, widok
   portfelowy, P&L, oś czasu cena×sprzedaż. Klient-wspólnik widzi ceny swojego sklepu
   w portalu i dostaje systemowe powiadomienie o każdej zmianie (§5b).

**Matematyka budżetu (fundament realizmu — z recenzji ekonomicznej):** 500 zł testu przy
CPA 75–250 zł produkuje **2–7 zamówień na CAŁY portfel 5 produktów**; próg „10 zamówień"
na jednym produkcie ≈ 1 330 zł spendu. Dlatego progi drabinki są zsynchronizowane z definicją
winnera z TESTY.md (5/3 zamówień), a nie z okrągłą dziesiątką — szczegóły §2 i [D]#1.

---

## 1. CEL I ZASADY

- Cel nadrzędny: **sklepy klientów MUSZĄ sprzedawać**; test tanio znajduje produkt, który
  sprzedaje, zarabiamy na nim ceną wyższych faz + ilością (multipak).
- **Funkcja celu silnika (governance):** maksymalizacja **kontrybucji całkowitej sklepu**
  (zł/dzień). 10% Tomka od przychodu = zaakceptowany proxy; każda karta OPT pokazuje
  `Δ zysk sklepu` i `Δ przychód (podstawa 10%)` obok siebie — trade-off jawny, nie ukryty.
  Guardrail: nie podnosimy ceny w strefę, gdzie spada CAŁKOWITY przychód.
- **Jedno źródło prawdy**: `wf2_products.price`; push jednokierunkowy do platformy
  i landinga. Ręczne edycje na Trevio wykrywa reconcile (§4.3).
- **Historia obowiązkowa**: `wf2_price_events` — audit, oś czasu, podkładka Omnibus.
- **Autonomia „auto w granicach, pytanie na granicach"**; brak decyzji = bezpieczny
  default (cena bez zmian). **Poniżej progów danych silnik PROPONUJE, nigdy nie wykonuje**
  (decyzje cenowe na 5–10 zamówieniach to sądy wspomagane, nie pewne triggery).
- **Dowody, nie deklaracje**: pełny cykl eventu `proposed → accepted → applied → confirmed
  | failed` (jeden enum, wszędzie ten sam).

## 2. DRABINKA CENOWA v2 (fazy, progi, warunki)

Generowana per produkt w kroku `wybor` (kalkulator = inicjalizacja drabinki), akcept
Tomka 1-klik = bramka startowa silnika.

| Faza | Cena | Awans | Kto |
|---|---|---|---|
| **1 TEST** | wg `test_pricing_mode` (a/b niżej), `psychPriceUp()` | **= werdykt WINNER** wg TESTY §6 (JEDEN zestaw parametrów, §8): `orders_eff ≥ 5 [D]# 1 AND spend ≥ 200` LUB slow-grad `orders_eff ≥ 3 AND spend ≥ 300`; silnik generuje REKOMENDACJĘ winnera, werdykt klika Tomek w `test_wynik` (jak dziś) | silnik rekomenduje, Tomek klika WINNER |
| **2 SCALE (dwustopniowo: RAMP→BAZA)** | propozycja AI `wf2-price-propose` (formuła TESTY §6) z **`ramp_price`** (widełka ostrożna ≈ połowa drogi) i `scale_base` | akcept ceny przez Tomka (1-klik) → silnik SAM wykonuje: krok 1 = `ramp_price`; po `ramp_hold_days 7 [P]` bez załamania kontrybucji zł/dzień → krok 2 = `scale_base`. Załamanie na RAMP = STOP + karta (produkt „sprzedawał się, bo tani" — wiemy po tygodniu, nie po pełnym skoku) | Tomek akceptuje cenę; wykonanie auto |
| **3+ OPT** | kroki **+8–12% [P]** (w ramach `max_step_pct 15`), `psychPriceUp()`, świadome przeskoki progów 100/150/200 | `orders_eff ≥ 8 [P] LUB dni ≥ 21 [P]` na szczeblu **AND kontrybucja zł/dzień ≥ 95% poprzedniego szczebla AND ROAS ≥ BEROAS×1,2** | auto w granicach ceiling z propozycji AI; powyżej = propozycja |
| **STOP/LOCK** | cofnij o szczebel i zablokuj optimum | kontrybucja **zł/dzień** spada LUB ROAS < BEROAS×1,2 LUB anomalia (§6.5) | propozycja rollbacku → Tomek (obniżka = zawsze człowiek) |

**Zmiany vs v1 (z recenzji ekonomicznej):** (1) RAMP przestaje być osobną fazą z własnym
progiem zamówień (bariera 18 zamówień = nieosiągalna w budżecie) — jest **pierwszym krokiem
wykonania SCALE**, gejtowanym CZASEM (7 dni), nie licznikiem; (2) próg TEST = definicja
winnera z TESTY (5/3), nie nowa dziesiątka; (3) warunek OPT liczy **kontrybucję zł/dzień**
zamiast marży/zamówienie (marża jednostkowa rośnie mechanicznie z ceną nawet, gdy total
zysk spada — stary warunek pozwalał maszynie podnieść cenę w stratę); (4) `max_step_pct`
dotyczy TYLKO kroków OPT — przejścia fazowe TEST→RAMP→BAZA są z niego jawnie WYŁĄCZONE
(świadome duże kroki pomiaru elastyczności); (5) auto-podwyżka NIGDY na produkcie bez
werdyktu WINNER (nie podnosimy ceny produktu, który za chwilę dostanie KILL albo iterację
oferty).

**`test_pricing_mode` [D]#2, per produkt:**
 a) `cost_plus` — koszt+10–15% narzutu (jak dziś; maks. szansa szybkiej walidacji);
 b) `target_minus` — cena docelowa −15–20% (BEROAS ≤ 3–4; rekomendowana dla pasma > 120 zł,
    gdzie strata na (a) największa).

**Zamówienia efektywne (`orders_eff`) — urealnienie COD/zwrotów:** do czasu dostarczenia
`paymentStatus/paymentMethod` przez developera: `orders_eff = orders × effective_factor
0,90 [P]` (korekta na nieodebrane COD ~2–5% średnio, przy zimnym ruchu Meta górna granica,
+ zwroty). Po dorobieniu pól: `orders_eff = paid − cancelled/refunded`, zamówienia
przedpłacone ważone 1,0, COD `cod_weight 0,7 [P]`; do awansu wymagane `min_prepaid_orders
2 [P]`. **Prowizja 10% liczona od inkasa, nie od złożonych zamówień.** Sezonowość: produkty
`is_seasonal` poza oknem — anomaly guard wyłączony, progi czasowe ×2; w Q4 BEROAS liczony
z CPM×(1+`q4_cpm_uplift`).

## 2b. KAMPANIE META — jeden silnik decyzji produktowych

- **Dane: `wf2-ads-sync` — ✅ WDROŻONA 18.07** (edge + cron `wf2-ads-sync-daily` 6:20;
  wisi na sekrecie `WF2_META_TOKEN` — do jego dodania zwraca `{skipped}`): dzienny Graph API
  insights campaign-level per `campaign_id` (+ ad-level Z METRYKAMI VIDEO dla pętli wyników
  kreacji `wf2_creatives`/`wf2_creative_perf`); anty-podwójne liczenie: P&L WYŁĄCZNIE
  `level='campaign'` (TESTY §7.1); konta KLIENTÓW przez system user token (partner access
  BM Tomka); **wykluczenie konta Tomka act 1537… + log** ✅; health-scan kont
  (account_status/disable_reason → alert `wf2_activities`) ✅ wersja bazowa. Spec w §4.2
  (adrules_library/PING_ENDPOINT nadal TODO).
- **P&L per produkt**: przychód − koszt produktu − wysyłka (wg `shipping_paid_by`!) −
  prowizje − spend − rezerwa COD/zwroty = **wynik w zł** + **kontrybucja zł/dzień** +
  **MER vs breakeven-MER (=1/marża%)** — North Star zamiast platformowego ROAS.
- **Strażnicy po stronie Meta (reguły `adrules_library`, zakładane programowo przy
  publikacji kampanii):** 3–4 reguły trigger/SEMI_HOURLY z akcją `PING_ENDPOINT` (webhook
  do naszego edge) lub `NOTIFICATION`: (a) spend > X i 0 zakupów, (b) frequency > 4,
  (c) zero-delivery przy Active, (d) skok CPC/CPM. Meta zostaje naszym monitorem 24/7,
  decyzje w naszym panelu. Wymaga Advanced Access — do potwierdzenia; fallback: dzienny
  scan w wf2-ads-sync.
- **Learning-phase guards (twarde):** zmiany budżetu ≤ +20%/dzień i ≤ +50%/tydzień;
  no-touch 7 dni lub do ~50 zdarzeń; ZERO zmian budżetu w trakcie learningu;
  **ZAKAZ auto-killa na ROAS-ie z liczb Mety przy małym wolumenie** (Meta gubi 20–30%
  konwersji) — kille tylko na strażnikach (spend-cap bez zakupów, frequency, zero-delivery)
  + kierunkowo CTR/CPC + progach min. konwersji; ROAS-owe decyzje dopiero przy zdrowym CAPI.
- **Decyzje kampanijne silnika** (progi TESTY §2): KILL/wymiana kreacji (CP1-3) ·
  skalowanie budżetu +20%/d po przecenie SCALE (nigdy w tym samym kroku co podwyżka ceny)
  · **realokacja budżetu portfela** (dwubramka TESTY §4.3 egzekwowana: karta „przenieś
  X zł z produktu A na B" gdy A przekroczy checkpoint bez sygnału, a B sygnał ma) ·
  refresh kreacji triggerowany CPM/frequency (nie kalendarzem) · struktura
  **Andromeda-first**: 1 kampania = 1 ad set = 6–8 zróżnicowanych kreacji (fragmentacja
  małego budżetu = śmierć; zamiast mnożyć ad sety — mnożyć kreacje).
- **Operational health (osobna warstwa, dzienny scan konta klienta):** odrzucone reklamy
  (`effective_status/issues_info`), status konta (`account_status/disable_reason`), billing
  (`funding_source`), `spend_cap`, zero-delivery, zdrowie pixel/CAPI. Zablokowane konto =
  100% straty — dziś wykrywane za późno. Alerty → panel/Slack.
- **Wykonanie (v1): propozycja + akcept 1-klik** przez Graph API/MCP; po okresie zaufania
  [D]#7 auto-budżet w granicach planu. Werdykty WINNER/KILL zostają w `test_wynik`.

## 2c. AOV I OFERTA — druga dźwignia zysku (z researchu; checkout minimalny NIE przeszkadza)

- **MULTIPAK (największa dźwignia, +15–30% AOV):** 2-pak/3-pak = **osobny produkt platformy
  z własną ceną i checkout-linkiem** (żadnych funkcji bundli w kasie nie potrzeba). Landing:
  3 kafle „1 / 2 (−15%/szt., preselekt) / 3 szt. (najlepsza wartość)" — moduł do
  STANDARD-LANDING-SKLEPY. Silnik generuje propozycję pakietu przy wejściu w SCALE; P&L
  liczy realny miks AOV. Kotwica „cena za sztukę" = legalna (rabat ilościowy, nie przecena).
  Logistyka: pakiet ZAWSZE z jednego dostawcy, jedna paczka.
- **COD pod kontrolą:** dopłata za pobranie (legalna) + rabat/gratis za przedpłatę (legalna
  zachęta) + **SMS-weryfikacja zamówień COD przed nadaniem (−40% nieodebranych)** +
  paczkomat domyślnie (−65% niedoręczeń). Wymogi do developera §3.4.
- **Dostawa = pozycja marżowa:** w fazach niskiej marży klient ZAWSZE płaci dostawę
  (TESTY §3 ⚠); stawka dla klienta 14–16 zł vs koszt negocjowany 8–11 zł = kilka zł
  marży/paczka. Próg darmowej dostawy — dopiero gdy marża > 30% i AOV > 100 zł
  (pasek postępu „brakuje X zł" = +12–18% AOV).
- **Kotwice zgodne z Omnibus:** cena/szt. przy multipaku · prawdziwa „wartość zestawu" ·
  weryfikowalne porównania · „cena wprowadzająca do DD.MM" z PRAWDZIWĄ datą z silnika
  (nie oznaczać przyszłej ceny jako „regularna"). **Twarde zakazy w generatorze landingów:**
  fałszywe liczniki (kara Bak Drop 100 tys. zł; Amazon ~31 mln), przekreślenia bez historii,
  fałszywe „X osób kupiło". `sold` w landing-api: z haircutem COD + serwerowy próg minimalny.
- **Post-purchase (lekki):** SMS potwierdzenia/odbioru (ratuje COD) + jeden cross-sell
  multipaka 10–14 dni po DOSTARCZENIU. Nie budować drogich flow przy produktach impulsowych.

## 3. PLATFORMA TREVIO — INTEGRACJA ZMIANY CENY

### 3.1 Sekwencja ZALEŻNA OD KIERUNKU (akcje `set_price`/`update_landing_price`/`verify_price`)

**PODWYŻKA** (klient nigdy nie płaci więcej, niż widział — kasa OSTATNIA):
```
1. UPDATE wf2_products.price + event 'applied'
2. update_landing_price: fetch platform_page_url → podmiana [data-price]/[data-price-raw]
   + offers.price w JSON-LD → PUT html   (fallback + GEO widzą nową cenę od razu)
3. ODCZEKAJ cache_grace_min 6 [P] (> TTL 5 min wf2-landing-api — inaczej stale-cache
   hydratacji nadpisze wyższą cenę na landingu, gdy kasa już liczy nową!)
4. set_price na platformie → 5. verify_price → 'confirmed' | 'failed'+mismatch+alert
```
**OBNIŻKA/ROLLBACK** (odwrotnie — kasa PIERWSZA; klient może zapłacić mniej, niż widział,
nigdy więcej): `set_price → verify → update wf2_products + landing HTML`.

Zamówienia mają snapshot ceny w liniach (`wf2_orders.lines` — po naprawie mappera §3.2).
`platform_name` stabilna — mapowanie bez zmian.

### 3.2 Zamówienia — stan API potwierdzony empirycznie 18.07 + ZNANY DEFEKT mappera

Kształt realnego zamówienia (58088579, AdrianTest2): `{ id, number, orderDate,
total:{amount,currency}, deliveryCost:{amount,currency}, websiteId, activeDomain,
products:[{name, unitPrice:{amount,currency}, quantity}] }`.

- **Brak statusu/metody płatności, COD, anulowań** → §3.4 pkt 2 (developer dorabia);
  do tego czasu `orders_eff` z §2.
- **Linie bez `product_id`** → mapowanie po nazwie zostaje.
- **⛔ P0 ZNANY DEFEKT (nie „do weryfikacji"):** mapper `wf2-orders-sync` czyta
  `value`/`price` jako liczby — a API zwraca OBIEKTY `{amount}`; `num(obiekt)=0` → całe
  revenue/P&L/BEROAS liczyłyby się na zerach i silnik widziałby wieczną stratę. Naprawa
  helperem `amt(v)` = pierwsza pozycja W1, przed czymkolwiek innym.

### 3.3 Meta a moment zmiany — jak w v1: zmiany na granicach checkpointów
(`defer_to_checkpoint [P] true` — aktywne dopiero, gdy wf2-ads-sync dostarcza spend;
bez danych spend flaga NIE blokuje awansu TEST→SCALE), cooldown, świeże BEROAS po zmianie,
brak oceny kampanii do zebrania nowych Purchase.

### 3.4 DO DEVELOPERA PLATFORMY (Adrian) — pakiet wymagań modułu
1. **Endpoint zmiany ceny** — `PUT /stores/{sid}/products/{pid}/variants/{vid}/price`
   `{price}` → 200; obowiązuje w kasie natychmiast. (Decyzja Tomka: będzie.)
2. **`paymentStatus` (paid|pending|cancelled|refunded) + `paymentMethod`
   (blik|card|cod|transfer|paybylink) + `paidAt` w GET /orders** (decyzja Tomka: będzie)
   + bonus `productId` w liniach.
3. **Webhook „nowe zamówienie COD" → SMS-weryfikacja przed nadaniem** + status
   „potwierdzone" (dźwignia −40% nieodebranych, §2c).
4. Konfigurowalna dopłata za pobranie + różnica ceny przedpłata/COD w kasie.
5. Ukrycie/dezaktywacja produktu (porządek w auto-stronach).
6. Webhook zamówień zamiast crona (nice-to-have).

### 3.5 FALLBACK awaryjny: rotacja produktu (bez zmian koncepcji z v1 — nowy produkt
`"<name> · v<N>"` + slug + atomowe przepięcie; aliasy nazw dokładane TYLKO gdy fallback
wejdzie do użycia).

### 3.6 TRYB INTERIM (endpoint ceny jeszcze nie istnieje) — półautomat BEZ fałszywych alarmów
Silnik NIE zmienia kasy sam, więc: krok „set_price" = **karta w Do decyzji „zmień cenę
w panelu platformy na X"** dla Tomka; `price_state='pending_platform'` jest stanem
OCZEKIWANYM (przypomnienie, nie ⚠); dla podwyżek baza+landing idą PIERWSZE (okno
landing-wyżej/kasa-niżej = bezpieczny kierunek), dla obniżek baza czeka na potwierdzenie
zmiany kasy przez reconcile. `mismatch` ⚠ tylko, gdy platforma pokaże cenę ≠ starej
i ≠ docelowej.

## 4. ARCHITEKTURA TECHNICZNA

### 4.1 Dane (migracja `20260719_wf2_cennik`)

- **`wf2_products`:** `price_ladder jsonb {mode, accepted_at, accepted_by, rungs[]}` ·
  `price_phase int` + `phase_started_at` (margin_mode pochodne) · `platform_variant_id
  text` (**bez tego set_price nie ma adresu — zapis w kroku pl_produkt; deklaracja:
  1 wf2_product = 1 wariant sprzedażowy**) · `price_state ('ok'|'pending_platform'|
  'mismatch'|'paused')` · ożywienie: `price_scale, scale_proposal, orders_paid,
  test_started_at, validation_cap`.
- **`wf2_price_events`:** jak v1 + `direction ('up'|'down')`; enum statusu JEDEN:
  `proposed|accepted|rejected|applied|confirmed|failed`.
- **`wf2_proposals` (NOWA — persystencja WSZYSTKICH kart Do decyzji, także kampanijnych):**
  `id, kind ('price_scale'|'price_opt_over_ceiling'|'rollback'|'campaign_kill'|
  'creative_refresh'|'budget_scale'|'budget_realloc'|'manual_price_platform')`,
  `product_id/project_id, payload jsonb, dedup_key UNIQUE, status
  (proposed|accepted|rejected|expired), created_at, decided_at, decided_by`.
  Bez tego odrzucone karty liczone „w locie" wracałyby po każdym odświeżeniu.
- RLS wszystkiego: wyłącznie `team_members`.

### 4.2 Edge functions

- **`wf2-orders-sync` (naprawa + rozszerzenie):** helper `amt()` dla `{amount}` (P0!) ·
  `orders_paid` per produkt · `source='takedrop'` ZOSTAJE (wartość używana przez działający
  kod i panel; dokumenty się dostosowują — silnik czyta `takedrop`).
- **`wf2-ads-sync` (NOWA, prerekwizyt §2b):** dzienny cron → Graph API insights
  campaign-level per campaign_id (+ ad-level on-demand), zapis `wf2_ad_stats`
  (`level='campaign'` dla P&L), health-scan konta (§2b operational health), wykluczenie
  act Tomka 1537…, system user token, retry/backoff na limitach.
- **`wf2-price-engine` (NOWA; cron DZIENNY po syncach; `timeout_milliseconds` jawnie):**
  kill-switch `settings.wf2_price_engine_enabled` (FAIL-CLOSED) + `dry_run` (pilot na
  `baacc66f…` bez dotykania platformy) + heartbeat (stary heartbeat → alert w panelu).
  Per produkt (statusy: test/winner/skala/live): metryki → warunki → guardraile →
  **atomowy claim**: `UPDATE wf2_products SET price_phase=+1, phase_started_at=now()
  WHERE id=$1 AND price_phase=$expected AND price_state='ok'` (0 wierszy = ktoś ubiegł —
  stop; żadnych podwójnych awansów przy nakładających się przebiegach) → sekwencja §3.1
  wg kierunku → events/proposals → powiadomienia. `max_price_changes_per_run 5 [P]`
  (thundering herd po backfillu + rate limit 120/min). Bierze tylko produkty projektów
  ze świeżym `orders_synced_at`.
- **`wf2-price-propose`:** formuła TESTY §6 + **`ramp_price`** w outputcie; wejście
  wzbogacone o miks COD/zwroty i pakiety.
- **`wf2-platform` (rozszerzenie):** `set_price {product_id, new_price}` (używa
  `platform_variant_id`) · `update_landing_price` · `verify_price`.
- **`wf2-reconcile` (NOWA, cron 1×/h, lekka):** GET products → `platform_price` vs nasza
  cena → dryf (ręczna edycja na Trevio!) = `mismatch` + alert; **sweeper** dokańcza/ponawia
  zmiany utknięte w `pending_platform` (silnik mógł paść po 'applied' przed verify);
  w trybie interim §3.6 — potwierdza ręczne zmiany kasy.
- **`wf2-landing-api`:** + haircut/próg dla `sold`; później `price_note`.

### 4.3 Guardraile silnika — spójne liczbowo
`cooldown_days 7` (**≥ okno anomalii** — koniec awansów przed odczytem poprzedniej zmiany)
· `max_step_pct 15` (TYLKO OPT; przejścia fazowe wyłączone) · `min_margin` = floor 5%
przychodu **z poszanowaniem `shipping_paid_by`** (gdy klient płaci wysyłkę,
cost_shipping nie obciąża unit_profit — dziś generated column ją odejmuje: poprawka
w migracji) · anomaly: `anomaly_min_orders 12 [P]` w `anomaly_window_days 14 [P]`,
poniżej floora → TYLKO karta (zero auto-pauz) · **rozróżnienie spadku popytu od awarii
danych**: rosnące `orders_unmapped` w oknie = pauza data-quality („sprawdź platform_name"),
NIE rollback ceny · kierunek: silnik sam tylko w górę · zero A/B cen na userach ·
`psychPriceUp()` portowane do edge jako wspólna spec (test jednostkowy końcówek, próg 150).

## 5. PANEL „CENY" (`tn-sklepy/ceny.html`)

- **„DO DECYZJI"** (z `wf2_proposals`): karty w formacie agencyjnym **„Widzimy [dane] →
  proponujemy [akcja] → spodziewany efekt [zł] → termin"**, np. „CPA 2× średniej na
  kreacji B → pauza → ~90 zł/tydz. do winnera → efekt 3 dni [Akceptuj]". Typy: cena SCALE
  (widełki + ramp), OPT ponad ceiling, rollback, kill/kreacje/budżet/realokacja, ręczna
  zmiana na platformie (interim). Pusta strefa = wszystko działa samo.
- **Tabela produktów** (jak v1) + `price_state` + kampania (spend/ROAS/CPA/CTR/frequency
  + status + health konta) + **kontrybucja zł/dzień** i **MER vs breakeven** jako liczby
  nadrzędne.
- **Widok portfelowy** (nowy): projekty → produkty sortowane po kontrybucji/zł spendu,
  pasek alokacji budżetu (dwubramka), koszt alternatywny w kartach realokacji.
- **Drawer produktu**: drabinka, oś czasu cena×zamówienia/dzień, edycja drabinki
  (po akcepcie = nowy akcept), ręczna zmiana ceny (te same guardraile + „mimo to"),
  historia, miks pakietów 1/2/3-pak.
- **Integracja projekt.html**: krok `wybor` = drabinka + akcept; `test_wynik` = werdykt
  z rekomendacją silnika; etap 5 linkuje do drawera.

## 5b. KLIENT-WSPÓLNIK (nowe — ryzyko relacyjne automatu)

Portal klienta (`wf2-portal`, faza C SSOT): sekcja **„Ceny Twoich produktów"** read-only
(cena, faza, oś czasu). Każda `confirmed` zmiana → **systemowe powiadomienie** (wzorzec
partnerski, NIE draft Gmail) z framingiem zysku: „Twój produkt przeszedł walidację —
podnieśliśmy cenę z X na Y, to zwiększa Twój zysk na sztuce o Z zł". `client_price_consent
[D]#6: notify (default) | require_accept` per projekt. Automat zmieniający ceny w sklepie
wspólnika „po cichu" = ryzyko „kto ruszył moją cenę?".

## 6. PRAWO I KOMUNIKACJA — jak v1 (Omnibus: podwyżki legalne bez języka promocji; zakaz
przekreśleń/„promocji" bez historii 30 dni; „cena wprowadzająca do DD.MM" z datą Z SILNIKA;
events = historia 30 dni) + twarde zakazy dark patterns w generatorze (§2c).

## 7. AUTONOMIA (macierz v2)

| Zdarzenie | Działanie | Kanał |
|---|---|---|
| Wykonanie zaakceptowanego SCALE (ramp→baza), kroki OPT w widełkach | **AUTO** | digest dzienny (info) |
| Rekomendacja WINNER / wejście w bramkę SCALE | propozycja AI | Slack + Do decyzji |
| OPT ponad ceiling / obniżka / rollback / guardrail | propozycja | Slack + Do decyzji; brak decyzji = bez zmian |
| Kampanie: kill/kreacje/budżet/realokacja | propozycja (format agencyjny) | Slack + Do decyzji |
| `mismatch` / sekwencja failed / heartbeat stary / health konta (ban, billing, disapproval) | pauza + alert | Slack ⚠ natychmiast |
| Anomalia po podwyżce (≥ floor danych) | pauza + propozycja rollbacku | Slack ⚠ |
| Zmiana `confirmed` | — | powiadomienie klienta (§5b) |

Zasada anty-szum: alerty ⚠ natychmiast; wszystko „info" w JEDNYM dziennym digeście.

## 8. PARAMETRY (`settings.wf2_price_config` — komplet, wzorem TESTY.md)

`engine_enabled false` (start wyłączony) · `dry_run true` · `advance_orders_test 5 [D]` ·
`slow_grad_orders 3` · `winner_spend_floor 200` / `slow_grad_spend 300` (WSPÓLNE z
wf2_test_config — jeden klucz, TESTY czyta stąd) · `effective_factor 0.90` ·
`cod_weight 0.7` · `min_prepaid_orders 2` (aktywne po paymentMethod) · `ramp_hold_days 7` ·
`opt_step_pct_min 8` / `max 12` · `opt_advance_orders 8` · `opt_advance_days 21` ·
`roas_be_mult 1.2` · `contribution_keep_frac 0.95` · `max_step_pct 15` (OPT-only) ·
`cooldown_days 7` · `anomaly_min_orders 12` · `anomaly_window_days 14` ·
`cache_grace_min 6` · `defer_to_checkpoint true` · `max_price_changes_per_run 5` ·
`min_margin_floor_pct 5` · `paid_definition 'synced'→'paid'` · `client_price_consent
'notify'` · `q4_cpm_uplift 40` (z wf2_test_config).

## 9. FAZY WDROŻENIA v2

- **W1 FUNDAMENT + NAPRAWY (1 sesja):** ⛔ fix mappera `amt()` (P0) + test na realnym
  zamówieniu 58088579 · migracja (events, proposals, ladder, price_state,
  platform_variant_id, poprawka unit_profit/shipping_paid_by) · orders_paid w syncu ·
  kill-switch + dry_run + heartbeat · `ceny.html` read-only · drabinka w `wybor` + akcept ·
  `wf2-reconcile`.
- **W2 DANE + SILNIK (1–2 sesje):** **`wf2-ads-sync`** (prerekwizyt wszystkiego
  kampanijnego) · `wf2-price-engine` dry-run → pilot E2E na `baacc66f…` z dowodami ·
  akcje wf2-platform (set_price gdy endpoint / tryb interim §3.6) · sekwencje kierunkowe
  + cache-grace + atomic claim.
- **W3 DECYZJE (1 sesja):** `wf2-price-propose` (+ramp_price) · `wf2_proposals` + strefa
  Do decyzji (format agencyjny) · karty kampanijne + realokacja portfela · reguły-strażnicy
  Meta (PING_ENDPOINT/NOTIFICATION; po potwierdzeniu Advanced Access) · digest + Slack ·
  powiadomienia klienta.
- **W4 AOV + POLISH (1 sesja):** multipak (produkt platformy + moduł landingu w STANDARD) ·
  polityka COD/dostawy w kalkulatorze · oś czasu w drawerze · raport miesięczny
  (marża plan/real, MER, per klient).

Kolejność świadoma: NAJPIERW dane prawdziwe (W1-W2), potem decyzje (W3), potem dźwignie
(W4). „Samowystarczalność" po W2 dotyczy TYLKO pętli TEST→SCALE z trybem interim.

## 10. DECYZJE TOMKA [D]

1. **Próg TEST:** rekomendacja **5 zamówień** (spójne z TESTY; matematyka: 10 zamówień ≈
   1 330 zł spendu na produkt — więcej niż budżet całego portfela; Twoje „10 sprzedaży"
   osiągalne tylko przy podwojeniu budżetu testu). Parametr — możesz podnieść w settings.
2. `test_pricing_mode` default: `cost_plus` wszędzie czy `target_minus` dla > 120 zł
   (rekomendacja: to drugie).
3. Kroki OPT auto w widełkach AI (rekomendacja: tak).
4. ~~Rotacja~~ rozstrzygnięte: endpoint od developera; interim = półautomat §3.6.
5. Kanał Slack (który?) czy tylko panel.
6. `client_price_consent`: `notify` (rekomendacja) czy `require_accept`.
7. Auto-budżet kampanii w granicach planu po okresie zaufania (rekomendacja: tak, po
   1. pełnym cyklu projektu bez incydentów).

## ŹRÓDŁA
Jak v1 (research 18.07: pricing/repricing 2× Sonnet) + runda v2: Meta adrules_library
(developers.facebook.com), anytrack.io, motionapp.com, aiadvantageagency.com,
commonthreadco.com (MER), admetrics.io (contribution margin), adsanomalyguard.com
(monitoring agencyjne), jetfuel.agency/chatterbuzzmedia (Andromeda), alexneiman/1clickreport
(ASC), capitaloneshopping/digitalapplied (free shipping), dsers/simplebundles (multipak),
olzalogistic/apaczka (COD PL), prawo.pl/UOKiK (dark patterns, kary), infor.pl (cena
wprowadzająca), jwimport/sky-shop (zwroty dropshipping). Pełne raporty: transkrypty 18.07.
