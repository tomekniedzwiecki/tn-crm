# CENNIK v3.2 „CENY 3.0" — SILNIK DECYZJI CENOWYCH (stan + polityka), Workflow v2 „Sklepy"

**Wersja: 3.2 · Data: 2026-07-21 · Status: PLAN OSTATECZNY, WIEDZA v2.1 ZWALIDOWANA
(Monte Carlo 19.07), POPRAWKI SYMULACYJNE (Monte Carlo silnika 21.07), ORKIESTRACJA
PRZEPROJEKTOWANA.**

**v3.1→v3.2:** **twardy próg 5 zamówień** Tomka (§2f) + poprawki po symulacji MC S1–S9
(SIM-ENGINE-V3-WYNIKI.md — no-ads ratchet, uncapped ramp, collapse kalibracja, bugi
wykonania kart) + **model kosztów VAT/cło/hurt tax-aware** (§2g) + **cena zakupu klienta
priorytetowa z sanity-band** (§2g/§7b) + **zakładka „Ceny" w portalu klienta** (§7b).
Migracja `20260722_wf2_ceny32.sql`, config `config_version "3.2"`.

**v3.0→v3.1:** poprawki po 2× krytyce (collapse spec, histereza, landing-kontrakt, run
lifecycle, COD-weryfikacja, cisza prawna UOKiK). Wprowadza pełną specyfikację collapse/
auto-rollbacku z histerezą i lockiem, kontrakt landingu „cena po API", lifecycle runów
(`kind`+`ok`), weryfikację COD `is_paid` przed auto oraz ciszę prawną wg UOKiK — rozstrzygnięcia
orkiestratora **P1–P24** (§ na końcu poszczególnych bloków).

**Historia zmiany (v2.1 → 3.0):** statyczna drabinka TEST→SCALE→OPT zastąpiona **silnikiem
decyzyjnym stan + polityka** — cena nie ma z góry ustalonej trajektorii; STAN i POLITYKA liczone
per run z żywych danych (dyrektywa Tomka 21.07: kwestionowana FORMA drabinki, NIE potrzeba
podnoszenia cen). Cała wiedza v2.1 (progi, formuły, guardraile, sekwencje kierunkowe, haircut COD,
scale_base v2, collapse Poisson q10, DECLINE) ZOSTAJE bez zmian merytorycznych; zmienia się
orkiestracja: „licz decyzję codziennie z danych, wykonuj w guardrails, eskaluj kartą na granicach".

`[P]` = default w `settings.wf2_price_config` (§8) · `[D]` = decyzja Tomka (lista §10).
Dokument NADPISUJE progi z `WORKFLOW-V2-TESTY.md §6` (jeden klucz settings — §8) i rozszerza
`WORKFLOW-V2-PLAN.md §0b`. Samowystarczalny — nie wymaga znajomości v2.1.

**Zmiana 21.07 (przetrwała z v2.1):** marża startowa = pasmo narzutu **10–15%** [D] (Tomek:
„na początek robimy marżę 10–15%, aby tylko zacząć sprzedawać i przejść przez testy"). Krok
`kalkulacja` (Etap 1, `panel-sync.py kalkulacja`, wykonuje fabryka) ustala **TYLKO cenę
startową** w tym paśmie. **Od v3 krok `kalkulacja` NIE „akceptuje trajektorii"** — potwierdza
żywą cenę zakupu (`source=detail`) i cenę startową; zapis `price_ladder.rungs[]` degraduje do
ARTEFAKTU HISTORYCZNEGO (nieszkodliwy, silnik go NIE czyta jako celów). `wybor` = sam wybór
produktu.

---

## 0. ESENCJA

1. **Cena mieszka w NASZEJ bazie** (`wf2_products.price`) i ma dwa wymiary:
   **STAN** (`price`, `price_phase` 1–6, `price_state`, cooldown, `pricing_autonomy`) i
   **POLITYKĘ** (reguły v2.1 liczone per run z żywych danych: `wf2_ad_stats` + `wf2_orders`).
   Landing hydratuje cenę z `wf2-landing-api`; platforma i landing = konsumenci ceny.
2. **Sześć reżimów zamiast drabinki:** START → RAMP → BASE → PROBE → HARVEST/DECLINE ↔ LOCKED
   (§2). Cena wędruje między reżimami wg bramek v2.1, ale **wartości celów (ramp_price,
   scale_base, probe) liczone są NA BIEŻĄCO per run — nie zapieczone przy kalkulacji.**
3. **Silnik `wf2-price-engine`** dwufazowy: **SWEEP co 10 min** [P11] (dokańcza zmiany w toku,
   wykonuje zaakceptowane karty, wygasza karty) + **DECYZJE raz dziennie** (gate `decision_hour`
   7:00 PL — cooldown i tak 7 dni). Dowody, nie deklaracje: `confirmed` dopiero po
   `verify_price` na platformie. FAIL-CLOSED (`engine_enabled=false`, `dry_run=true`).
4. **Poziomy autonomii (sedno v3, §3):** globalnie `engine_enabled` / `dry_run` /
   `autonomy_default` / `pilot_project_ids`; per produkt `pricing_autonomy` ('auto'|'propose'|
   'off'). Tryb 'auto' wykonuje w guardrails; decyzje realnie biznesowe → karta „Do decyzji".
   Akcept karty = zapis decyzji; wykonawcą jest silnik (sweep ≤10 min).
5. **Cena × kampania × AOV = jedna decyzja produktowa.** Metryka nadrzędna = **kontrybucja
   całkowita w zł/dzień** (nie marża jednostkowa, nie platformowy ROAS). Druga dźwignia:
   **multipak** (§2c). Sekwencja zmiany zależna od kierunku (§4).
6. **Panel `tn-sklepy/ceny.html` = CENTRUM DOWODZENIA CENAMI** (§6): pasek silnika + strefa
   decyzji + tabela z autonomią + drawer z wykresem trajektorii + log automatu z
   `wf2_engine_runs` + sterowanie autonomią. Klient-wspólnik widzi ceny w portalu (§7).

**Matematyka budżetu (fundament realizmu):** 500 zł testu przy CPA 75–250 zł produkuje
**2–7 zamówień na CAŁY portfel 3 produktów**; próg „10 zamówień" na jednym produkcie ≈ 1 330 zł
spendu. Progi bramek zsynchronizowane z definicją winnera (3 zam.), nie z okrągłą dziesiątką.

---

## 1. CEL I ZASADY

- Cel nadrzędny: **sklepy klientów MUSZĄ sprzedawać**; test tanio znajduje produkt, który
  sprzedaje, zarabiamy ceną wyższych reżimów + ilością (multipak).
- **Funkcja celu silnika (bez zmian):** maksymalizacja **kontrybucji całkowitej sklepu**
  (zł/dzień). 10% Tomka od przychodu = zaakceptowany proxy; każda karta OPT pokazuje `Δ zysk
  sklepu` i `Δ przychód (podstawa 10%)` obok siebie — trade-off jawny. Guardrail: nie
  podnosimy ceny w strefę, gdzie spada CAŁKOWITY przychód.
- **Jedno źródło prawdy**: `wf2_products.price`; push jednokierunkowy do platformy i landinga.
  Ręczne edycje na Trevio wykrywa reconcile `wf2-orders-sync` runGuard (§5.2).
- **Historia obowiązkowa**: `wf2_price_events` — audit, oś czasu, podkładka Omnibus.
- **Autonomia „auto w granicach, karta na granicach"**; brak decyzji = bezpieczny default
  (cena bez zmian). **Poniżej progów danych silnik PROPONUJE, nigdy nie wykonuje** (decyzje na
  5–10 zamówieniach to sądy wspomagane, nie pewne triggery) — bez zmian z v2.1.
- **Dowody, nie deklaracje**: pełny cykl eventu `proposed → accepted → applied → confirmed |
  failed` (jeden enum `wf2_price_events.status`, wszędzie ten sam).

## 2. REŻIMY CENOWE v3 (`price_phase` 1–6) — bramki v2.1

Rozszerzenie `price_phase int` (bez zmiany typu) o wartości 5/6. **Cena NIE ma z góry
ustalonej trajektorii** — reżim to STAN, przejścia liczy silnik per run.

| # | Reżim | Sens | Cena (liczona per run) |
|---|---|---|---|
| **1** | **START** | cena startowa 10–15%, zbieranie danych | `psychPriceUp(cost×[1.10–1.15])`, `test_pricing_mode` |
| **2** | **RAMP** | podnoszenie po potwierdzeniu sprzedaży, POD ścianą psychologiczną, ŚWIEŻY ad set | `ramp_price` **jako SERIA kroków ≤ `auto_step_max_pct 20` (S2, kolejny po cooldownie — NIE jeden skok pod ścianę)**, parkowany pod najbliższą ścianą (94,90 pod 100; 149,00 pod 150 — NIE arytm. połowa) |
| **3** | **BASE** | cena bazowa po dwustopniowym skalowaniu (**w praktyce pomijana — S3: po rampie idziemy wprost do PROBE**) | `scale_base` v2 (§2a) **liczone NA BIEŻĄCO** |
| **4** | **PROBE (OPT)** | pojedynczy probe optymalizacyjny | `base × (1 + 15–20%)` [P] (jeden probe, NIE staircase 8–12%) |
| **5** | **HARVEST/DECLINE** | nasycenie/śmierć produktu: mroź podwyżki, multipak, rotacja | cena zamrożona; dźwignia → AOV |
| **6** | **LOCKED** | stop-lock: optimum, trzymaj | cena bez zmian |

**LOCK (6) ≠ HARVEST (5) — przeciwne akcje:** LOCKED = „optimum, trzymaj"; HARVEST = „nasycenie,
wyjdź z zyskiem/rotuj". Panel PHASES rozszerzony o 5/6.

### Tabela przejść (bramki v2.1 — DOKŁADNE progi)

| Przejście | Bramka (progi jawne) | Autonomia |
|---|---|---|
| **1→2 START→RAMP** | **WINNER = `CP2_passed (ATC ≥ 5% [P] AND koszt/ATC ≤ 12 zł [P]) AND orders ≥ 5 [P] (twardy próg, §2f) AND spend ≥ 300 [P]`.** SUROWE zamówienia (sygnał popytu; haircut COD tylko w P&L). **`winner_orders 3→5` (S7 / SIM scen.13: przy `=3` wysoko-CPA szum awansował w 56% przy <5 zam.; `=5` → 0% BEZ straty prawdziwych winnerów — poprawka bez kosztu).** Poprzednia bramka 5eff/200 = nieosiągalna (implikowała CPA ≤ 33 zł) | **ZAWSZE KARTA** (werdykt WINNER) — [D-A1 default: karta na START→RAMP nawet w 'auto'; przy ≥5 zam. high-confidence rozważ auto] |
| **2 RAMP wykonanie** | krok 1 = `ramp_price` na **ŚWIEŻYM ad secie z nowymi kreacjami** (nie mutujemy żywego zwycięskiego seta; nowy post = czysty wątek komentarzy). **RAMP = SERIA kroków, każdy ≤ `auto_step_max_pct 20` od ceny bieżącej (S2 — clamp też dla kroku z karty winner_reco; przy dużym dystansie do ściany rób w 2 krokach, nie jednym skokiem)** | auto po akcepcie karty START→RAMP |
| **2→3 RAMP→BASE/PROBE** | `ramp_orders ≥ 5 [P] (twardy próg) AND ramp_spend ≥ 150 [P]` (LICZBA, nie kalendarz; `ramp_hold_days 7` = tylko dolny bezpiecznik czasu) AND brak collapse. COD-heavy (udział > 60% [P]): liczone na zamówieniach ROZLICZONYCH. **Po zaparkowaniu rampy (kolejny krok niemożliwy — ściana/cap): S3 → wprost do PROBE gdy `scale_base ≤ cena bieżąca` (BASE tylko gdy `scale_base > cena` — rzadkie); eliminuje wieczny `hold_ramp`** | full-auto (kierunek w górę, guardraile OK) |
| **collapse (2/3/4)** | **pełna spec §2d:** Poisson q10 znormalizowany SPENDEM **(baseline SPEND-MATCHED — dni o spend > 0,5× mediany post-change; S5)**, bramka mocy `collapse_min_expected 8` **ORAZ** `observed < collapse_rel_floor 0.6 × expected`, potwierdzenie w 2 runach, aktywny TYLKO po podwyżce | **AUTO-ROLLBACK** (moc ≥8 AND rel<0,6) + `rollback_lock 21d` + karta INFO; moc <8 → karta `rollback` ([D-A4]) |
| **3→4 BASE→PROBE** | JEDEN probe `+15–20%` [P] ponad bazę (psych_round W DÓŁ, §2e). **Post-step guard (S6): po każdej potwierdzonej podwyżce, po `opt_window_days` — kontrybucja/zł spendu okno-po < `keep_frac 0,80` → KARTA obniżki (powrót na poprzedni poziom; chroni elastyczne winnery, scen.1)** | full-auto jeśli nie przecina ściany; przez ściany 100/150/free-ship = karta |
| **4 PROBE ocena** | **kontrybucja na złotówkę spendu** (NIE zł/dzień), okno `opt_window_days 14` [P] (COD-heavy `opt_window_days_cod 21`), `keep_frac ≥ 0,80` [P] AND `MER ≥ be × 1,2` [P] (marża BASE < `mer_gate_min_margin 0.30` → MER MIĘKKI: decyduje keep_frac, P16) → trzymaj albo wróć na bazę | trzymanie auto; obniżka = karta |
| **→5 HARVEST/DECLINE** | `frequency > 3,5 [P]` AND CPM ↑ ≥ `harvest_cpm_rise_pct 20`% w `harvest_window_days 14` AND kontrybucja płaska/spadająca MIMO refreshu → karta: żniwa + ROTACJA produktu | karta (człowiek decyduje) |
| **→6 LOCKED (STOP/LOCK)** | kontrybucja/zł spadła istotnie LUB `MER < be×1,2` LUB anomalia (§5.3): cofnij o krok i zablokuj optimum | obniżka/rollback = ZAWSZE karta |
| **kierunek w dół (dowolny reżim)** | kontrybucja/zł rośnie przy niższej cenie (`allow_downward_proposals true` [P]) | ZAWSZE karta (człowiek) |

**Świeży ad set vs krok ceny (P3):** auto-podwyżka BEZ świeżego ad setu dozwolona tylko dla
kroku ≤ `small_step_no_adset_pct 10` (zmiana ceny NIE resetuje learning phase Mety). Krok > 10%
w 'auto' wymaga WYKRYTEGO świeżego ad setu (nowe `ad_id` w `wf2_ad_stats` level='ad' z datą
≤ `fresh_adset_days 10`); brak → downgrade do karty „przygotuj świeży ad set, po nim podniosę"
(kind `creative_refresh` + price step w payload). **Learning no-touch CEN (P4):** zero
auto-zmian ceny produktu, którego najmłodszy `ad_id` jest młodszy niż `learning_grace_days 3`.
Strażnik komentarzy pod adsami = obowiązkowy zapis §7.

**`test_pricing_mode` [P] — wyzwalany LUKĄ RYNKOWĄ:** cena testowa < `0,75 × mediana
konkurencji` (`market_gap_flag 0.75` [P]) → flaga „podejrzanie tanio" (scam-lęk = obiekcja #1
PL) i preferuj (b):
 a) `cost_plus` — koszt +10–15% (nowości/gadżety bez referencji cenowej; COD tłumi scam-lęk);
 b) `target_minus` — rynek −15–20% (znane kategorie z widoczną ceną — koc przy rynku 109 testuj
    ~89,90, nie 59,90; bonus: krótszy ramp = mniejszy szok CR).

### 2a. Formuła `scale_base` v2 (liczona per run) — bez zmian merytorycznych

Stara (TESTY §6) dawała PUSTY wynik dla 2/3 produktów (floor z marży 40% > sufit rynkowy;
CPA_test w SUFICIE działało przewrotnie). Nowa:
```
CPA_scale_est = górny kwantyl `cpa_ci_quantile 0.65` CI Poissona z CPA_test (pesymizm przy
                3–8 zam.), skalowany wielkością skoku ceny (NIE stałe ×1,3), wygładzany EWMA
                (`cpa_ewma_alpha 0.3`)                                          # P5
viable_floor  = (koszt + wysyłka_sklepu + CPA_scale_est) / (1 − fees − `scale_margin_survival 0.12`)
target_price  = (koszt + wysyłka_sklepu) / (1 − fees − `scale_margin_target 0.40`)  # aspiracja
ceiling       = min(competitor_max, ściana psychologiczna)   # BEZ CPA, BEZ „klifu" (niezdef., P5)
scale_base    = psych_round(clamp(target_price, viable_floor, ceiling))
viable_floor > ceiling → NIE kill i NIE auto-podbicie ponad rynek: FLAGA (karta Tomka:
   tańsze źródło / multipak / kill); spend wraca do poziomu testowego do decyzji.
```
(Symulacja: „flaga zamiast ślepego podbicia" najlepsza — ślepe podbicie ponad rynek paliło
~1 tys. zł/produkt na produktach elastycznych.)

**Zamówienia i COD (bez zmian):** do bramek liczą się **SUROWE zamówienia** (nieodebrany COD =
nadal sygnał POPYTU); haircut WYŁĄCZNIE do P&L: `effective_factor_bands` funkcją pasma ceny
(nieodbiory rosną nieliniowo): `<60 zł: 0,92 · 60–100: 0,85 · 100–150: 0,78 · >150: 0,70` [P]
ważone realnym udziałem COD. **Lag zwrotów COD (14–28 dni) > kadencja decyzji**: COD-heavy →
awanse na zamówieniach ROZLICZONYCH, `cod_cooldown_days 21` [P]; SMS-weryfikacja + paczkomat
domyślny OBOWIĄZKOWE > 100 zł (`sms_verify_required_above 100` [P]). Prowizja 10% od inkasa.

**`paid_definition` operacyjnie (P15):** `'synced'` = zamówienie w `wf2_orders` (surowe);
`'paid'` = `is_paid=true`; **COD-settled proxy** = `is_paid=true` LUB (`is_cod` AND order_date
starsze niż `cod_cooldown_days 21` AND brak flagi zwrotu). **F2 MUSI zweryfikować na realnych
danych Trevio, czy/kiedy `is_paid` flipuje dla COD** (SQL: rozkład `is_paid × payment_method ×
wiek`) — wynik decyduje o predykacie COD-settled; do weryfikacji COD-heavy = propose-only (zero
auto). CP2: mianownik ATC = `ATC/LPV` (jawnie). **Kontrybucja DECYZYJNA COD-heavy (P16):** liczona
z haircutem pasmowym (nie tylko P&L); okno oceny PROBE dla COD-heavy = `opt_window_days_cod 21`
(≥ lag). **MER-gate:** przy realizowanej marży BASE < `mer_gate_min_margin 0.30` MER jest
sygnałem MIĘKKIM (decyduje `keep_frac`), nie twardym vetem.

## 2b. KAMPANIE META — jeden silnik decyzji produktowych (przeniesione z v2.1, bez zmian)

- **Dane: `wf2-ads-sync` ✅ WDROŻONA** (edge + cron `wf2-ads-sync-daily`; wisi na sekrecie
  `WF2_META_TOKEN` — do dodania zwraca `{skipped}`): dzienny Graph API insights campaign-level
  per `campaign_id` (+ ad-level z metrykami VIDEO). **Anty-podwójne liczenie: P&L WYŁĄCZNIE
  `level='campaign'`.** Wykluczenie konta Tomka act 1537… + log ✅; health-scan kont ✅.
- **P&L per produkt**: przychód − koszt − wysyłka (wg `shipping_paid_by`!) − prowizje − spend −
  rezerwa COD = **wynik w zł** + **kontrybucja zł/dzień** + **MER vs breakeven-MER (=1/marża%)**
  — North Star zamiast platformowego ROAS.
- **Learning-phase guards (twarde):** zmiany budżetu ≤ +20%/dzień i ≤ +50%/tydzień; no-touch
  7 dni lub do ~50 zdarzeń; ZERO zmian budżetu w trakcie learningu; **ZAKAZ auto-killa na
  ROAS-ie z liczb Mety przy małym wolumenie** (Meta gubi 20–30% konwersji) — kille tylko na
  strażnikach (spend-cap bez zakupów, frequency, zero-delivery) + kierunkowo CTR/CPC.
- **Strażnicy Meta (`adrules_library`, PING_ENDPOINT/NOTIFICATION):** (a) spend > X i 0 zakupów,
  (b) frequency > 4, (c) zero-delivery przy Active, (d) skok CPC/CPM. Meta = monitor 24/7,
  decyzje w panelu. Wymaga Advanced Access; fallback: dzienny scan.
- **Decyzje kampanijne silnika**: KILL/wymiana kreacji (CP1-3) · skalowanie budżetu +20%/d po
  przecenie SCALE (NIGDY w tym samym kroku co podwyżka ceny) · realokacja budżetu portfela
  (dwubramka) · refresh kreacji triggerowany CPM/frequency (nie kalendarzem) · struktura
  **Andromeda-first**: 1 kampania = 1 ad set = 6–8 zróżnicowanych kreacji.
- **Operational health (dzienny scan):** odrzucone reklamy, status konta/disable_reason,
  billing, spend_cap, zero-delivery, pixel/CAPI. Zablokowane konto = 100% straty. Alerty → panel.

## 2c. AOV I OFERTA — druga dźwignia zysku (przeniesione z v2.1, bez zmian)

- **MULTIPAK (+15–30% AOV):** 2-pak/3-pak = **osobny produkt platformy z własną ceną i
  checkout-linkiem** (żadnych funkcji bundli w kasie). Landing: 3 kafle „1 / 2 (−15%/szt.,
  preselekt) / 3 szt.". Silnik generuje propozycję przy wejściu w BASE; P&L liczy realny miks.
  Logistyka: pakiet ZAWSZE z jednego dostawcy, jedna paczka.
- **COD pod kontrolą:** dopłata za pobranie (legalna) + rabat za przedpłatę + **SMS-weryfikacja
  COD przed nadaniem (−40% nieodebranych)** + paczkomat domyślnie (−65% niedoręczeń).
- **Haircut COD TYLKO w P&L, nie w bramkach** (patrz §2a). **COD-heavy gating:** udział COD
  > `cod_settled_gating_share 0.60` [P] → awanse liczone na zamówieniach rozliczonych.
- **Dostawa = pozycja marżowa:** w fazach niskiej marży klient ZAWSZE płaci dostawę; stawka
  14–16 zł vs koszt 8–11 zł. Próg darmowej dostawy dopiero gdy marża > 30% i AOV > 100 zł.
- **Kotwice — CISZA PRAWNA (P22):** cena/szt. przy multipaku = jedyna legalna kotwica (matematyka
  jednostkowa). **ZAKAZ „ceny wprowadzającej do DD.MM" w automacie** (fikcyjny deadline =
  misleading wg UOKiK); kotwiec NIE wprowadzamy (doktryna Z5). **Twarde zakazy w generatorze:**
  fałszywe liczniki (kara Bak Drop 100 tys. zł; Amazon ~31 mln), przekreślenia bez historii
  30 dni, fałszywe „X osób kupiło", język promocji przy cichej zmianie ceny.
- **Post-purchase (lekki):** SMS potwierdzenia/odbioru + jeden cross-sell multipaka 10–14 dni
  po DOSTARCZENIU.

### 2d. COLLAPSE / AUTO-ROLLBACK — pełna specyfikacja (P1, P2)

Auto-rollback = JEDYNA zmiana ceny w 'auto' bez uprzedniej karty — dlatego spec twarda.
**Normalizacja SPENDEM, nie kalendarzem** (budżet dzienny bywa nierówny):
- **λ bazowa (SPEND-MATCHED, S5):** okno `collapse_baseline_days 7` PRZED zmianą; tempo_bazowe =
  zamówienia/zł spendu na STAREJ cenie liczone **TYLKO z dni o spend > 0,5× mediany spendu
  post-change** (baseline mierzony na tym samym poziomie spendu co obserwacja — inaczej skok
  budżetu TEST→SCALE zaniża oczekiwane i fałszuje collapse). Oczekiwane po zmianie =
  `tempo_bazowe × spend_po_zmianie`.
- **Okno obserwacji:** akumuluj aż `spend_po ≥ collapse_min_spend 150` LUB `collapse_max_days 5`
  (co pierwsze). Świeży ad set w międzyczasie → pomiń pierwsze `learning_grace_days 3` (dni
  learningu NIE liczą się do collapse ani `keep_frac`; okno oceny startuje PO learningu).
- **Bramka mocy `collapse_min_expected 5→8` (S5):** oczekiwane zamówienia < 8 → ZERO
  auto-rollbacku, tylko karta `rollback` (moc statystyczna za mała na q10; podniesione z 5 —
  scen.8 fałszywy collapse ~20% przy małej próbie baseline).
- **Potwierdzenie:** naruszenie q10 (jednostronny Poisson, `collapse_quantile 0.10`) w DWÓCH
  kolejnych runach decyzyjnych (nie pojedynczy blip) **ORAZ minimalny spadek WZGLĘDNY
  `observed < collapse_rel_floor 0.6 × expected` (S5 — sam q10 przy szumie Poissona trącał zdrowy
  popyt; wymóg 0,6× odsiewa łagodne wahania).**
- **Zakres czasowy:** collapse-test aktywny TYLKO gdy ostatni event ceny = PODWYŻKA i minęło
  ≤ (`collapse_max_days` + `learning_grace_days`) od zmiany. Późniejsze spadki popytu → anomalia/
  karta (§5.3), NIE auto-rollback.
- **Q4 (X–XII):** collapse toleruje `+q4_cpm_uplift 40`% CPM (poszerza q10 o czynnik kosztu
  ruchu); auto-podwyżki zamrożone w Black Week.

**Po auto-rollbacku (P2):** `last_price_change_at=now()` (rollback TEŻ resetuje cooldown) +
`rollback_lock_until = now() + rollback_lock_days 21`. Ponowna podwyżka NA TEN SAM lub wyższy
poziom w oknie locka wymaga KARTY (`dedup_key` zawiera docelowy poziom ceny). **Zero pętli
góra–collapse–dół–góra.**

### 2e. HISTEREZA I PIPELINE KROKU (P5, P6)

**Dead-band + stabilność celu (P5):** akcja tylko gdy `|target − price|/price ≥
target_change_min_pct 10` ORAZ cel utrzymuje się (ta sama cena psych po `psych_round`) przez
≥ `target_stability_runs 2` kolejne runy decyzyjne. Nowa kolumna `target_snapshot jsonb`
`{target, first_seen}`. `CPA_scale_est` wygładzane EWMA (`cpa_ewma_alpha 0.3`).

**Pipeline kroku (jednoznaczna kolejność):** `raw_target` → clamp do `auto_step_max_pct 20` →
`psychPriceDown` (psych_round W DÓŁ, nigdy ponad cap) → check ścian (nowa cena przecina 100/150
lub `shipping_free_threshold` → KARTA) → check dead-band → akcja. **`max_step_pct` USUNIĘTY**
(redundancja). Probe rządzi się `opt_probe_pct_min/max 15–20`; WSZYSTKIE ruchy auto capem
`auto_step_max_pct 20`; `psych_round` stosowany do WSZYSTKICH wyjść (ramp/base/probe).

### 2f. TWARDY PRÓG DANYCH: `hard_min_orders 5` (dyrektywa Tomka, v3.2)

**Zasada nadrzędna nad wszystkimi bramkami cenowymi.** Dopóki produkt nie ma **≥ 5 zamówień
KWALIFIKOWANYCH** silnik NIE wykonuje ŻADNEJ akcji cenowej ANI nie tworzy kart cenowych.
- **Zamówienie kwalifikowane** = wiersz `wf2_orders` z tym produktem w `lines` gdzie
  `is_paid = true OR is_cod = true`, liczone **ALL-TIME** (COUNT, nie okno).
- **Czego dotyczy próg:** WSZYSTKIE akcje i karty cenowe — `winner_reco` (START→RAMP),
  `price_scale`, rollback-podwyżkowy, karta no-ads „podnieś". Poniżej 5 zam. → dozwolone TYLKO:
  `hold` z powodem, karty DQ/informacyjne, **auto-rollback OBRONNY (collapse) — obrona NIE
  podlega progowi** (kasa pierwsza; katastrofa nie czeka na próg danych).
- **Dlaczego 5 (SIM scen.13):** przy `winner_orders 3` produkt wysoko-CPA z dobrym ATC (3 zam. =
  szum Poissona) awansował w **56%** przebiegów przy <5 zam. — łamał wymóg Tomka; `=5` → **0%**
  przy **ZEROWEJ** zmianie wyniku prawdziwych winnerów (winner i tak pada przy ≥5 zam.). Próg
  praktycznie DARMOWY. `winner_high_confidence_orders` (już 5) staje się progiem bazowym; sygnał
  „zmiana ceny przy <5 zam." = flaga patologii = 0% we wszystkich scenariuszach po poprawce.

### 2g. MODEL KOSZTÓW I MARŻA NETTO (tax-aware, v3.2)

Kolumna `unit_profit` w DB = **BEZ ZMIAN** (GENERATED, legacy „uproszczona brutto"). Wartości
**netto liczone są W LOCIE** (silnik/panel/portal). Parametry w `config.cost_model` (§8).
Stare formuły bez `×1,23` **ZANIŻAŁY floory** — VAT należny 23% od sprzedaży jest realnym
obciążeniem, a VAT z Ali (dropship) jest **NIEODLICZALNY**.

**Koszt efektywny (PLN/szt.)** = BAZA + dodatki:
```
BAZA:
  • jeśli client_cost_purchase ustawione ORAZ w sanity band
    [0.4, 1.6] × cost_purchase (gdy cost_purchase puste — akceptuj)
    → CENA KLIENTA JEST NAJWAŻNIEJSZA (znormalizowana):
        source='dropship'  → brutto (podał netto → ×1.23; VAT NIEODLICZALNY)
        source='wholesale' → netto  (podał brutto → /1.23; VAT ODLICZALNY)
  • inaczej → cost_purchase (dotychczasowy, brutto Ali)
  • POZA pasmem → NIE stosuj + KARTA kind 'client_cost_review' (info, bez auto-wykonania;
    akcept = Tomek ręcznie przenosi wartość do cost_purchase w panelu)
DODATKI:
  + cost_shipping                (tylko gdy shipping_paid_by = 'shop')
  + dropship_customs_fee_pln 13  (cło ryczałt ~3 EUR/pozycję — OBOWIĄZUJE od 1.07.2026;
                                  TYLKO gdy źródło kosztu = dropship)
```

**Marża NETTO — model `goods` (WSZYSTKIE decyzje silnika na niej):**
```
sale_net        = price / 1.23
fee_net         = price × fees_pct/100 / 1.23
unit_profit_net = sale_net − effective_cost − fee_net
margin_net_pct  = unit_profit_net / sale_net
kontrybucja     = unit_profit_net × orders − spend      (haircut COD dla COD-heavy bez zmian)
viable_floor    = 1.23 × (effective_cost + CPA_est) / (1 − fees_pct/100 − 0.12)
target_price    = 1.23 × effective_cost / (1 − fees_pct/100 − 0.40)
min_margin      : unit_profit_net ≥ 0.05 × sale_net
```

**Prognoza HURTU (informacyjna — panel drawer + portal klienta):**
```
est_cost_hurt_net = (cost_ali_brutto/1.23) × (1 − wholesale_discount 0.40) × (1 + wholesale_extras_pct 0.15)
unit_profit_hurt  = sale_net − est_cost_hurt_net − fee_net − wholesale_local_ship_pln 14…
                    (local ship TYLKO gdy sklep płaci wysyłkę; przy 'client' POMIŃ)
uplift            = unit_profit_hurt − unit_profit_net(dropship)
```
Prezentacja: „Przy zakupie hurtowym (~40% taniej): koszt ~X zł, zysk ~Y zł/szt. (+Z zł)".
**Widełki:** pesymistycznie `discount 0.30`, optymistycznie `0.50` (pokazać zakres).

**Tabela reżimów podatkowych (per produkt, `cost_model.tax_model_default 'goods'`):**

| Źródło | VAT | Cło | Wysyłka | Uwagi |
|---|---|---|---|---|
| **dropship** (Ali) | brutto, **NIEODLICZALNY** (koszt = cena z VAT) | + `dropship_customs_fee_pln 13` od 1.07.2026 | klient płaci (dropship: 0 dla sklepu) | konserwatywnie „deemed supplier" |
| **hurt** (wholesale) | netto, **ODLICZALNY** (VAT z faktury wchodzi) | w `wholesale_extras_pct 0.15` (fracht+cło+ubezp.+agencja) | `wholesale_local_ship_pln 14` gdy sklep płaci | zysk wyższy → uplift dla klienta |

`tax_model` = przełącznik `goods` (default, konserwatywnie) / `agency` — **`agency` = TODO
(W-later)**: model pośrednika (marża = przychód usługi), inne traktowanie VAT; do wdrożenia gdy
struktura prawna sklepów to potwierdzi.

## 3. POZIOMY AUTONOMII (NOWA — sedno v3)

### 3.1 Flagi globalne (`settings.wf2_price_config`)
- **`engine_enabled false` [P] — FAIL-CLOSED.** `false` → silnik robi wyłącznie heartbeat
  (nic nie liczy, nic nie wykonuje).
- **`dry_run true` [P].** `true` → silnik liczy decyzje i **loguje** je (`wf2_engine_runs.
  decisions`), ale NIE dotyka platformy ani `wf2_products.price`.
- **`autonomy_default 'propose'` [P].** Domyślna autonomia produktu bez własnego ustawienia.
- **`pilot_project_ids ["baacc66f-…"]` [P].** Niepusta lista = silnik przetwarza TYLKO te
  projekty (pilot). Pusta = wszystkie projekty.

### 3.2 Autonomia per produkt: `wf2_products.pricing_autonomy` ('auto'|'propose'|'off')
Default z `autonomy_default`. `off` = produkt pominięty. `propose` = wszystko kartą.
`auto` = full-auto w guardrails (poniżej), reszta kartą.

### 3.3 Co full-auto WYKONUJE vs co ZAWSZE kartą

| Akcja | Warunek | Tryb 'auto' |
|---|---|---|
| Podwyżka w reżimie (RAMP→BASE, BASE→PROBE, PROBE-hold) | WSZYSTKIE: bramki danych v2.1 · kierunek W GÓRĘ · krok ≤ `auto_step_max_pct 20` [P] po psych_round W DÓŁ · dead-band `target_change_min_pct 10` + cel stabilny `target_stability_runs 2` (§2e) · NIE przecina ściany 100/150/free-ship (`wall_cross_requires_human true` [P]) · cooldown minął (`cooldown_days 7` / `cod_cooldown_days 21`) · brak `rollback_lock_until` na tym poziomie (§2d) · dziś NIE `no_raise_weekdays [4,5]` · krok ≤ `small_step_no_adset_pct 10` LUB wykryty świeży ad set `fresh_adset_days 10` (P3) · najmłodszy ad_id ≥ `learning_grace_days 3` (P4) · `min_margin_floor_pct 5` OK · `price_state='ok'` · dane ads świeże i produkt ma spend (§4.3) · `landing_price_contract='hydrated'` (§4.5) | **WYKONUJE** |
| **START→RAMP (pierwszy awans, werdykt WINNER)** | 3–4 zam.: zawsze karta. ≥5 zam. high-confidence: [D-A1] | **ZAWSZE KARTA** (default) |
| Przebicie ściany 100/150/free-shipping | `wall_cross_requires_human` | KARTA |
| Krok > 10% bez świeżego ad setu | brak `ad_id` ≤ `fresh_adset_days 10` (P3) | KARTA `creative_refresh` + price step |
| Obniżka / rollback proponowany (nie collapse) | `allow_downward_proposals` | KARTA |
| Kill / campaign_kill / creative_refresh / budget | decyzje kampanijne | KARTA |
| `viable_floor > ceiling` | FLAGA „ekonomia nie domyka się przy cenie rynkowej" | KARTA |
| Anomalia poniżej floora danych | `anomaly_min_orders 12` [P] w `anomaly_window_days 14` [P] | KARTA (zero auto-pauz) |
| Landing `legacy`/`none` (P19) | zmiana ceny wymaga re-bake landingu | KARTA + karta `landing_republish` |
| **Collapse po podwyżce (§2d)** | moc ≥ `collapse_min_expected 5`, q10 w 2 runach, kasa pierwsza | **AUTO-ROLLBACK** + `rollback_lock 21d` + karta INFO [D-A4]; moc <5 → karta `rollback` |

**Wyjątek obronny (do krytyki):** collapse po podwyżce = auto-rollback natychmiast (kasa
pierwsza; czekanie na akcept = krwawienie) + karta INFORMACYJNA post-factum. To JEDYNY przypadek,
gdy 'auto' zmienia cenę bez uprzedniej karty na akcji „w dół".

### 3.4 Karty (`wf2_proposals`) — jednolity kontrakt payload (P24)
- **Payload KAŻDEJ karty (wszystkie `kind`):** `{observation, recommendation, expected_effect_zl:
  {contribution, revenue}, confidence, deadline}`. **Obie liczby efektu:** kontrybucja = metryka
  wspólna silnika; przychód = podstawa 10% Tomka (trade-off jawny). Sort strefy decyzji po
  `|expected_effect|`. Δ przychód logowany TEŻ przy ruchach auto (`decisions` payload).
- **`expires_at` [P `proposal_ttl_days 7`]** — karta wygasa (`expired`) w sweepie. **WYJĄTEK:
  `winner_reco` BEZ `expires_at`** (nie wygasa; eskalacja WIZUALNA w panelu po 3 dniach).
- **Przy expiry** sweep dokleja do `dedup_key` sufiks `|exp<data>` (ZWALNIA klucz — karta może
  WRÓCIĆ przy nowych danych). Odrzucona karta nie wraca przez `decision_ttl_days 14` [P].
- **Akcept karty NIE wykonuje zmiany bezpośrednio** — zapisuje decyzję (`status='accepted'`);
  **wykonawcą jest silnik** (najbliższy sweep ≤10 min). Nota w UI: „wykona silnik w ≤10 min".
- **Priorytet `max_price_changes_per_run 5`** = malejąco po zł-impakcie.

## 4. PLATFORMA TREVIO, LANDING I SEKWENCJE KIERUNKOWE

**Zmiana ceny = OPERACJA 3-PUNKTOWA (P17):** (1) UPDATE `wf2_products.price` → (2) `set_price`
na platformie (kasa) → (3) spójność landingu (§4.5). Sekwencja kierunkowa (niżej) rządzi
kolejnością (1)/(2); (3) domyka kontrakt landingu.

### 4.1 Sekwencja ZALEŻNA OD KIERUNKU (przeniesione z v2.1 §3.1)

**PODWYŻKA (kierunek sekwencji MINIMALIZUJE scenariusz płacenia więcej; wiążąca = cena kasy —
kasa OSTATNIA):**
```
1. atomic claim: UPDATE wf2_products SET price=new, price_phase=next, price_state='pending_platform',
   platform_apply_after = now() + cache_grace_min, last_price_change_at=now()  → event 'applied'
2. landing hydratuje NOWĄ cenę z DB od razu (przez wf2-landing-api; kasa liczy jeszcze STARĄ
   niższą — bezpieczny kierunek)
3. ODCZEKAJ cache_grace_min 6 [P] (> TTL 5 min wf2-landing-api — inaczej stale-cache hydratacji
   nadpisze wyższą cenę, gdy kasa już liczy nową!)
4. sweep po platform_apply_after: set_price → verify_price → 'confirmed'+platform_price | 'failed'+mismatch+alert
```
**OBNIŻKA/ROLLBACK (kasa PIERWSZA; klient może zapłacić mniej, nigdy więcej — w JEDNEJ
inwokacji):** `set_price → verify_price → UPDATE wf2_products (price, price_state='ok') → event confirmed`.

**Dwufazowość wymuszona fizyką:** podwyżka wymaga odczekania `cache_grace` 6 min × N produktów —
NIE mieści się w jednej inwokacji edge. Stąd rozdział: **DECYZJE** (raz dziennie zakładają
`price_state='pending_platform'`) + **SWEEP** (co 10 min dokańcza po `platform_apply_after`).

### 4.2 `verify_price` — NOWA akcja `wf2-platform`
`{action:'verify_price', shop_id, product_id, variant_id, expected}` → GET
`/stores/{shop}/products/{pid}` → `{matches:bool, platform_price}`. Bez tego nie ma dowodu
`confirmed`. Akcja `set_price` GOTOWA (PUT `…/variants/{vid}/price`), `pf()` ma retry 429.

### 4.3 Świeżość ads — TRZY stany (P13, P14)
- **(a) sync żywy + spend → tryb pełny:** jakikolwiek wiersz `level='campaign'` z `date ≥ wczoraj`
  w CAŁEJ tabeli (sync żyje) ORAZ produkt ma `spend > 0` w oknie (`ads_min_spend_active 1`) →
  bramki spend/CP2 działają.
- **(b) sync żywy, produkt bez spendu → HOLD:** zero kart „podnieś" — kampania nie wydaje, brak
  sygnału elastyczności.
- **(c) sync martwy ≥ `ads_fresh_hours 48` → tryb no-ads (propose-only):** karta „podnieś do X"
  wymaga ≥ `winner_orders_no_ads 5` zam. W OKNIE `no_ads_window_days 30` (nie all-time) +
  `min_prepaid_orders 1`; X = JEDEN szczebel psych w górę (nie multi-step); payload JAWNIE:
  „CPA/elastyczność NIEZNANE — podwyżka w ciemno". Bramki no-ads na zamówieniach SUROWYCH (§2).
  **HAMULCE S1 (SIM scen.10: bez tokena Meta silnik windował 299 zł przy 28 zmianach, optimum 100
  — kontrybucja PONIŻEJ baseline „nic nie rób"). Karta no-ads „podnieś" TYLKO gdy WSZYSTKIE:**
  (1) cooldown minął (`cod_cooldown_days` / `cooldown_days`); (2) liczba podwyżek od ostatniego
  dnia ze `spend > 0` < `no_ads_max_steps 2` [P]; (3) nowa cena NIE przecina ściany (`walls` +
  `shipping_free_threshold`); (4) **przychód okna 14d ≥ przychód poprzednich 14d** (spadek
  przychodu → `hold`, NIE podwyżka — STOP ratchetu); (5) `hard_min_orders 5` spełniony (§2f).
- **S4 — DZIURA DANYCH ≠ no-ads:** kampania która WCZEŚNIEJ wydawała (spend>0 w ostatnich 14d),
  a ostatnie **≥2 dni spend=0** → `hold_dq` (NIE przełączaj na tryb no-ads!). Tryb no-ads
  TYLKO gdy sync GLOBALNIE martwy (heurystyka 3-stanowa bez zmian). SIM scen.9: 5-dniowa luka
  przełączała na no-ads (ratchet) + psuła baseline collapse — 4,3 zmian, oscylacja 16%.
- **Zasada: automat bez spendu NIE wykonuje, tylko proponuje.** W dniu dodania `WF2_META_TOKEN`
  ads-sync pisze ad_stats → bramki ożywają — **zero przeróbek kodu.**

### 4.4 Reconcile ręcznych edycji Trevio
`wf2-orders-sync` runGuard co ≤10 min: `platform_price` ↔ `wf2_products.price` → `mismatch`/`ok`,
potwierdza `pending_platform`→`ok`. Ręczna edycja Trevio = `mismatch` + alert, NIE sygnał popytu.

### 4.5 KONTRAKT LANDINGU v3.1 (P17–P19) — „cena po API"
Cena wiążąca = kasa platformy; landing hydratuje cenę runtime z `wf2-landing-api` (TTL 300 s).
Kolumna `wf2_products.landing_price_contract` (`'hydrated'|'legacy'|'none'`, default `'legacy'`)
steruje autonomią: **auto-wykonanie zmiany ceny TYLKO dla `hydrated`**; `legacy`/`none` → każda
zmiana = karta + karta `landing_republish` (nowy `kind`) z checklistą re-bake dla fabryki.

**Kontrakt (do `STANDARD-LANDING-SKLEPY.md`; zadanie F3):**
(a) KAŻDA widoczna cena = element `[data-price]` hydratowany snippetem;
(b) ZAKAZ ceny w `<title>`/`<meta>`/`og`;
(c) JSON-LD `Offer` BEZ `price` (lub bez bloku `offers`) dopóki re-publish nie jest zautomatyzowany;
(d) **checkout-inline@2 — NAPRAWA REGRESJI:** moduł MUSI hydratować `[data-price]` (przywrócić
    `applyState`); hero/`zamow-price` z `data-price`;
(e) **wzmocnienie gate `cena_panel`:** FAIL także dla cen prozą (regex `\d+,\d{2} zł` poza
    `[data-price]`), `JSON-LD Offer.price`, `title/meta/og` z ceną;
(f) landing re-fetch ceny przy KLIKNIĘCIU CTA (nie tylko load).

**Klasyfikacja istniejących (F3):** masazer/drapek = `hydrated` (poza title/meta/JSON-LD); mata =
`legacy` przez regresję checkout-inline@2. USUNIĘTO zdanie „klient nigdy nie płaci więcej niż
widział" → „kierunek sekwencji minimalizuje scenariusz płacenia więcej; wiążąca jest cena kasy".

### 4.6 Multipaki = RODZINA CENOWA i free-shipping (P20, P21)
- **`wf2_products.parent_product_id uuid` (NULL dla bazy):** zmiana ceny bazy przy istniejących
  członkach rodziny → silnik przelicza ceny pakietów utrzymując zapisany `bundle_discount_pct`
  i zmienia WSZYSTKICH członków w JEDNEJ sekwencji; jakikolwiek fail → karta + wstrzymanie.
  **Inwariant:** cena/szt. w pakiecie < solo (legalna matematyka jednostkowa). Dopóki multipaków
  nie ma — inwariant zapisany, kod od W4.
- **`wf2_projects.shipping_free_threshold` (opcjonalna, ręcznie):** ustawiona → próg traktowany
  jak ściana psychologiczna (przecięcie ceny/AOV → KARTA).

## 5. ARCHITEKTURA TECHNICZNA

### 5.1 Model danych v3 — migracje `20260721d_wf2_ceny3.sql` (v3.1) + `20260722_wf2_ceny32.sql` (v3.2) (PRZED pushem kodu)

**v3.2 (`20260722_wf2_ceny32.sql`, aplikacja `node scripts/apply-wf2-ceny32.mjs`) dokłada
addytywnie:** kolumny `client_cost_*` na `wf2_products` (pkt 2), `kind 'client_cost_review'` na
`wf2_proposals` (pkt 4), config → v3.2 (pkt 8). Baza = v3.1 musi być zaaplikowana.

**1. `wf2_engine_runs` (NOWA — heartbeat + dziennik decyzji + lifecycle P10):**
```
id uuid PK, started_at timestamptz default now(), finished_at timestamptz,
kind text CHECK ('decision'|'sweep'|'manual') DEFAULT 'sweep',
ok bool,                          -- ustawiane na końcu UDANEGO przebiegu (NULL/false = crash)
dry_run bool, trigger text CHECK ('cron'|'manual'|'sweep'),
products_evaluated int, actions_executed int, cards_created int,
errors jsonb, decisions jsonb, note text
-- decisions[]: {product_id, phase, action, reason_pl, metrics, delta_revenue_zl}
-- Gate decyzji dzienny: EXISTS(run kind='decision' AND ok=true
--   AND started_at::date = today  W STREFIE Europe/Warsaw z DST).
-- Crash (ok IS NULL/false) NIE blokuje ponowienia — dedup kart + atomic claim chronią.
-- JEDEN aktywny run naraz:
CREATE UNIQUE INDEX wf2_engine_runs_one_active ON wf2_engine_runs ((true))
  WHERE finished_at IS NULL;
-- INSERT łapie unique-violation → HTTP 200 {status:'already_running'} (nie 500).
-- Stale-cleanup: próg 7 min (deadline edge 300 s + bufor), na starcie KAŻDEGO wywołania
--   (finished_at=now(), ok=false, note='stale').
-- RLS: wyłącznie team_members.
```
**2. `wf2_products`:** `+ pricing_autonomy text NOT NULL DEFAULT 'propose' CHECK
(pricing_autonomy IN ('auto','propose','off'))` · `+ last_price_change_at timestamptz`
(denormalizacja cooldownu) · `+ platform_apply_after timestamptz` (odroczenie set_price o
cache_grace) · **`+ rollback_lock_until timestamptz`** (P2 — blokada re-podwyżki po collapse) ·
**`+ target_snapshot jsonb`** (P5 — `{target, first_seen}`, stabilność celu) · **`+
landing_price_contract text NOT NULL DEFAULT 'legacy' CHECK (IN ('hydrated','legacy','none'))`**
(P19) · **`+ parent_product_id uuid REFERENCES wf2_products(id)`** (P20 — rodzina multipaków;
NULL dla bazy; `bundle_discount_pct` w kolumnie/payload rodziny). **v3.2 (§2g/§7b): `+
client_cost_purchase numeric(10,2)` · `+ client_cost_is_net bool` · `+ client_cost_source text
NOT NULL DEFAULT 'dropship' CHECK (IN ('dropship','wholesale'))` · `+ client_cost_note text` ·
`+ client_cost_set_at timestamptz`** (cena zakupu podana przez klienta w portalu — priorytetowa
w sanity-band, poza pasmem → karta `client_cost_review`). *(Kolumny z v2.1 zostają:
`price`, `price_ladder`, `price_phase`, `phase_started_at`, `platform_variant_id`, `price_state`,
`orders_paid/confirmed`, `shipping_paid_by`, `cost_*`, `fees_pct`, `platform_price/synced_at`,
`campaign_id`.)*
**3. `wf2_price_events`:** `+ run_id uuid` · `+ proposal_id uuid` (trace karta→event).
Enum statusu bez zmian: `proposed|accepted|rejected|applied|confirmed|failed`;
`direction (up|down)`, `trigger_kind`, `actor (engine|tomek|claude)`.
**4. `wf2_proposals`:** `+ expires_at timestamptz` (NULL dla `winner_reco` — nie wygasa, P24).
`kind` rozszerzony o **`landing_republish`** (P19) oraz **`client_cost_review`** (v3.2 — karta
INFO gdy cena zakupu klienta poza pasmem [0.4,1.6]; DROP+ADD z pełną listą 11 kindów). Payload
wg jednolitego kontraktu (§3.4).
(`dedup_key UNIQUE` — przy expiry sufiks `|exp<data>`; `status proposed|accepted|rejected|expired`.)
**5. `wf2_projects`:** `+ orders_unmapped_last int DEFAULT 0` (`wf2-orders-sync` liczy unmapped;
dopisać UPDATE) · **`+ shipping_free_threshold numeric(10,2)`** (P21 — ręcznie; ściana psych).
**DQ-strażnik podwójny (P12):** (a) pauza DQ gdy `unmapped/total > dq_unmapped_ratio 0.2` w runie;
(b) bijekcja campaign↔produkt — flaga DQ gdy jeden `campaign_id` mapuje >1 produkt LUB produkt ma
>1 aktywny `campaign_id`; (c) detektor kolizji `platform_name` (podobne znormalizowane nazwy dwóch
produktów projektu → pauza DQ + karta). **Rosnące unmapped = pauza DQ, NIE rollback ceny.**
**6. `price_ladder`:** ZOSTAJE (zero łamania `projekt.html`/`panel-sync.py`) — **jawnie
zdeprecjonowana jako plan**: silnik NIE czyta `rungs[]` jako celów; to artefakt historyczny
kalkulacji (zapis ceny startowej i trybu).

**7. Widok `wf2_product_daily` (security_invoker=true)** — agregacja per produkt per dzień:
```
spend        := suma wf2_ad_stats.spend WHERE level='campaign' (mapa campaign_id→produkt)
orders/revenue := wf2_sales (source IN 'takedrop','platform')
orders_paid  := COUNT wf2_orders (lines→product_id po platform_name, is_paid=true)
kontrybucja  := unit_profit × orders − spend   (dzienna)
```
Źródła są dzienne i trwałe — **persystowana tabela snapshotów NIEPOTRZEBNA** (skala: dziesiątki
produktów).

**8. Migracja configu `settings.wf2_price_config` → v3.1 (P8):**
(a) **backup** starej wartości do settings `wf2_price_config_backup_v2`;
(b) **pełny nowy JSON v3.1** (§8 KANONICZNE) z przeniesieniem `engine_enabled`/`dry_run` z
    istniejącego (`COALESCE` — nie nadpisujemy kill-switcha); `config_version:"3.1"`;
(c) blok **`DO $$ … RAISE EXCEPTION`** jeśli po UPDATE: `engine_enabled≠false` LUB `dry_run≠true`
    LUB `contribution_keep_frac≠0.80` LUB `config_version≠'3.1'` (asercje fail-fast migracji);
(d) **silnik przy starcie waliduje `config_version`** — inna wartość = run z błędem, ZERO
    akcji (**fail-closed**). Kod czyta WYŁĄCZNIE klucze kanoniczne bieżącej wersji; stare klucze
    ignorowane (§8 DEPRECATED). Obecny seed (`advance_orders_test:5`, `winner_spend_floor:200`,
    `opt_step_pct 8–12`, `keep_frac 0.95`, `effective_factor 0.90` płaski) — WSZYSTKIE zastąpione.
**v3.2 (`20260722_wf2_ceny32.sql`):** backup do `wf2_price_config_backup_v31`; `config_version:"3.2"`
(silnik v3.2 waliduje `=='3.2'`); asercje `DO $$ RAISE`: `config_version='3.2'` LUB `dry_run≠true`
(TWARDO — pilot musi zostać w dry_run) LUB `hard_min_orders≠5` LUB `contribution_keep_frac≠0.80`;
`engine_enabled`/`dry_run` PRZENOSZONE z obecnego configu (COALESCE). Nowe/zmienione klucze: §8.

**9. Cron `wf2-price-engine` w pg_cron (P11):** **`*/10 * * * *`** (co 10 min — sweep zwykle
no-op, ale okno „landing wyższa / kasa niższa" skraca się do ~6–16 min; decyzje gate'owane
`decision_hour` w kodzie), `net.http_post` → `/functions/v1/wf2-price-engine`, `x-wf2-secret`
z Vault (`wf2_gen_secret`), **`timeout_milliseconds := 350000`**. Alert w panelu gdy produkt
w `pending_platform` > 20 min.

### 5.2 Edge `wf2-price-engine` (NOWA)
- **Auth:** `x-wf2-secret == WF2_GEN_SECRET` lub adminGate (jak orders-sync). **Deadline 300s**
  (edge wall-clock; stale-cleanup runów 7 min = deadline + bufor).
- **Wołany co 10 min (P11). DWIE odpowiedzialności:**
  - **(a) SWEEP (każde wywołanie):** produkty `price_state='pending_platform'` i
    `platform_apply_after ≤ now()` → `set_price → verify_price → event confirmed/failed`;
    wykonaj karty `status='accepted'` bez eventu wykonania; wygaś karty po `expires_at`
    (`status='expired'`).
  - **(b) DECYZJE (raz dziennie, gate P10: NIE EXISTS run `kind='decision' AND ok=true AND
    started_at::date=today` w strefie Europe/Warsaw, po `decision_hour 7:00`):** pętla per produkt.
- **Flow decyzji per produkt:** gate'y globalne (`engine_enabled false` → heartbeat only;
  `pilot_project_ids`; `dry_run`) → data-quality (`orders_unmapped` rosnące → pauza DQ + karta)
  → metryki okien (`wf2_product_daily` 14/30 dni; paid wg `paid_definition`; COD-heavy detect)
  → reżim (`price_phase`) → reguły v2.1 → decyzja `{hold|step_up|probe|rollback|freeze|flag|
  card}` → klasyfikacja autonomii (§3.3) → `dry_run? log decisions : wykonaj`.
- **Atomic claim (PODWYŻKA — kasa OSTATNIA), dokładny SQL:**
```sql
UPDATE wf2_products
   SET price = :new, price_phase = :next, phase_started_at = now(),
       price_state = 'pending_platform',
       platform_apply_after = now() + (:cache_grace_min || ' minutes')::interval,
       last_price_change_at = now()
 WHERE id = :id AND price_phase = :expected AND price_state = 'ok'
 RETURNING id;             -- 0 wierszy = ktoś ubiegł / stan zmienił się → STOP (bez podwójnego awansu)
```
  → event 'applied' (run_id) → landing z DB → sweep po cache_grace dokańcza platformę.
- **OBNIŻKA/ROLLBACK (kasa PIERWSZA):** `set_price → verify_price → UPDATE DB (price,
  price_state='ok') → event confirmed` — w jednej inwokacji.
- **`max_price_changes_per_run 5` [P]** (thundering herd po backfillu + rate limit 120/min).
- **Heartbeat:** każdy run → `wf2_engine_runs`; panel alarmuje gdy ostatni run > 26h.
- Po `confirmed`: wpis `wf2_activities` + powiadomienie wspólnika (§7). **Powiadomienie =
  WARUNEK `dry_run=false` (P23)**, nie „po pilocie" — minimalna implementacja w F3.

### 5.3 Guardraile silnika (spójne liczbowo)
`cooldown_days 7` (**limit CZĘSTOŚCI akcji** — okno oceny skutku to collapse/opt windows, NIE
cooldown; P9) / `cod_cooldown_days 21` · wszystkie ruchy auto capem `auto_step_max_pct 20`
(**`max_step_pct` USUNIĘTY**, redundancja — P6) · `min_margin_floor_pct 5` z poszanowaniem
`shipping_paid_by` (gdy klient płaci wysyłkę, cost_shipping nie obciąża `unit_profit`) ·
`anomaly_min_orders 12` w `anomaly_window_days 14`, poniżej floora → TYLKO karta · **rozróżnienie
spadku popytu od awarii danych**: rosnące `orders_unmapped_last` = pauza DQ, NIE rollback ·
kierunek: silnik sam tylko w górę · zero A/B cen na userach · `psychPriceUp/Down()` portowane do
edge jako wspólna spec (psych_round W DÓŁ dla wyjść pod ścianę, próg 150).
**`unit_profit` = GENERATED STORED — NIGDY nie pisać** (price NULL → unit_profit NULL).

## 6. PANEL „CENTRUM DOWODZENIA CENAMI" (`tn-sklepy/ceny.html`)

Styl Geist/Vercel (tokeny z raportu panelu): tła #000/#0a0a0a/#111, bordery #1f1f1f/#262626/#333,
akcent #0070f3, success #45a557, warning #f5a623, error #e5484d, Inter + JetBrains Mono (liczby),
Phosphor, radius 6–8px, **ZERO fioletu/rose**. Wykresy: **inline SVG (zero nowych CDN)**.

1. **Pasek statusu silnika:** chip `enabled`/`dry_run` + heartbeat (ostatni run, decyzje/akcje,
   następny run) + przycisk „Uruchom teraz" (admin; POST `wf2-price-engine` z JWT/adminGate);
   **alert gdy produkt w `pending_platform` > 20 min** (P11); **nota metodologiczna: `hard_min_orders 5`
   — poniżej 5 zam. kwalifikowanych silnik tylko trzyma cenę (§2f).**
2. **Strefa „Do decyzji" DZIAŁAJĄCA** (dziś read-only): wzorzec `propDecide` (update
   `wf2_proposals {status,decided_at,decided_by} + logActivity + toast + reload`); obsługa obu
   kształtów payload (observation/recommendation vs rule/nums); **nota „wykona silnik w ≤10 min"**;
   `expires_at` countdown. **Karta `client_cost_review` (v3.2): `KIND_LABEL` „Koszt od klienta do
   akceptacji" + przycisk „Zastosuj koszt klienta" → update `wf2_products.cost_purchase =
   znormalizowana wartość` + toast + `logActivity` (bez auto-eventu ceny — karta INFO, Tomek
   decyduje).**
3. **Tabela produktów:** + kolumna **Autonomia** (badge; admin: select auto/propose/off → update
   `wf2_products.pricing_autonomy`), **Kontrybucja (14 dni)**, **ostatnia decyzja silnika**, badge
   **landing** (`hydrated`/`legacy`/`none` — P19; `legacy` = zmiana ceny idzie kartą + republish).
   **Kolumna Zysk/szt. = `unit_profit_net` (v3.2, liczone w locie; tooltip: rozbicie brutto legacy
   vs netto) + badge „koszt od klienta" gdy `client_cost_purchase` aktywny.**
4. **Drawer per produkt:** **WYKRES inline SVG** — trajektoria ceny (kroki z `wf2_price_events`)
   + słupki spend dzienny + punkty zamówień + linia kontrybucji skumulowanej (okno 30 dni);
   **sekcja „Koszty i potencjał" (v3.2): `effective_cost` (źródło: Ali / klient) + rozbicie NETTO
   (cena → koszt → VAT+prowizje → `unit_profit_net`) + prognoza hurtu z zakresem
   `wholesale_discount 30–50%` (koszt ~X, zysk ~Y, uplift +Z) + `client_cost_note` klienta (§2g);**
   pod spodem decyzje silnika dot. produktu (z `wf2_engine_runs.decisions`) + historia eventów;
   akcje admin: pauza (`price_state='paused'`), autonomia.
5. **Log automatu (nowa sekcja):** strumień z `wf2_engine_runs` — per run: kiedy, dry_run,
   ile ocenionych/akcji/kart + rozwijane `decisions` per produkt (action + reason_pl); poniżej
   globalny strumień `wf2_price_events`.
6. **Sterowanie autonomią (admin, gate `role==='admin'`):** kill-switch `engine_enabled`,
   `dry_run`, `decision_hour`, `autonomy_default`, `pilot_project_ids`, kluczowe progi
   (edytowalne) → upsert `settings.wf2_price_config` (JSON.stringify, onConflict:'key');
   **OSTRZEŻENIE modalne przy wyłączaniu `dry_run` / włączaniu `enabled`.**
7. **`projekt.html`:** w warsztacie kalkulacji link **„Centrum cen →"** (ceny.html); gate
   `cena_panel` NIETKNIĘTY; `wyLadderRungs`/akcept drabinki zostaje (artefakt startowy — bez
   zmian funkcjonalnych poza linkiem). Nav „Ceny" i rewrite istnieją — NIC nie zmieniać.

## 7. KLIENT-WSPÓLNIK I PRAWO (P22, P23)

**Powiadomienie wspólnika = WARUNEK `dry_run=false` (P23)**, nie „po pilocie". Minimalna
implementacja w F3: sekcja read-only **„Zmiany cen"** w portalu klienta (`wf2-portal`, zasilana
`wf2_price_events` confirmed, framing zysku: „Twój produkt przeszedł walidację — podnieśliśmy
cenę z X na Y, +Z zł zysku na sztuce") + wpis `wf2_activities` przy KAŻDEJ `confirmed`
(wzorzec partnerski, NIE draft Gmail). `client_price_consent 'notify'` [P `notify |
require_accept`] per projekt. **Mandat umowny do zarządzania ceną = punkt [D-A5] dla Tomka.**

**CISZA PRAWNA (P22) — zasada §7:** silnik zmienia ceny CICHO — zero języka promocyjnego,
przekreśleń, %, „okazja" (i tak FAIL w gate `cena_panel`). Wg UOKiK **cicha obniżka NIE uruchamia
obowiązku 30 dni**. ZAKAZ „ceny wprowadzającej do DD.MM" w automacie (fikcyjny deadline =
misleading). Silnik trackuje `min_price_30d` (trywialne z `wf2_price_events`) — na przyszłość,
gdyby kiedyś komunikowano obniżki; **kotwiec NIE wprowadzamy** (doktryna Z5). Events = pełna
historia 30 dni (podkładka Omnibus).

**Strażnik komentarzy (P4, obowiązkowy):** auto-hide pod reklamami po słowach
„drożej/taniej/była/ściema/oszust" (komentarz „była 59, teraz 99" tłucze CR); podwyżki ZAWSZE na
świeżym ad secie/poście. Automat zmieniający ceny „po cichu" = ryzyko relacyjne „kto ruszył moją
cenę?" — mityguje powiadomienie wspólnika (§11).

### 7b. PORTAL KLIENTA — zakładka „Ceny" (v3.2)

Sekcja `#sec-ceny` „Wasze ceny i zyski" w `portal.html` (po `#sec-portfolio`), zasilana edge
`wf2-portal` (token + hasło klienta). **Ton ciepły, ZERO żargonu — BEROAS/CPA/spend ZAKAZANE
w tej sekcji.**

**Co POKAZUJEMY (per produkt — TYLKO status live/test/winner/skala):**
- cena aktualna + **friendly label z `price_phase`** (słownik **FAIL-CLOSED**): `1–2` →
  „Cena startowa — testujemy popyt", `3–4` → „Cena optymalizowana", `5` → „Faza dojrzała",
  `6` → „Cena ustalona", **nieznane → „Cena aktywna"** (nigdy surowy numer fazy);
- rozbicie: **„Cena → koszt zakupu → podatki i prowizje → Wasz zysk na sztuce (netto)"**
  (`unit_profit_net`, §2g);
- mini-wykres SVG trajektorii ceny (**BEZ powodów**), licznik zamówień 30d;
- blok **„Potencjał hurtowy"**: zakres zysku przy hurcie (`wholesale_forecast {cost, profit,
  uplift, range}`, discount 30–50%, §2g);
- pole **„Twoja cena zakupu"**: kwota + `netto`/`brutto` + skąd (`dropshipping`/`hurt`) +
  notatka; zapis debounced → przeliczenie marży NA ŻYWO. `previewMode` → `disabled`.

**Co UKRYWAMY (nigdy do klienta):** `reason_pl`, `metrics`, `actor` decyzji, wszelki żargon
reklamowy. **`price_history` z `wf2_price_events` = TYLKO `product_id/at/old_price/new_price/
direction`** (bez powodów/metryk/aktora), limit 200. `orders_by_product` + `revenue` z
`wf2_product_daily` (suma 30 dni). Wyliczone w edge z `settings`: `cost_effective`,
`unit_profit_net`, `wholesale_forecast` (wzory §2g).

**Akcja `set_client_cost` (NOWA w `wf2-portal`):** `previewMode`/readonly → **403**; walidacja
`0 < x ≤ 100000`, `product ∈ projekt`; pola `client_cost_source ∈ {'dropship','wholesale'}`,
`note ≤ 300 zn.`; zapis `wf2_products.client_cost_*` + `client_cost_set_at` + wpis
`wf2_activities`. **NIE nadpisuje `cost_purchase`** — silnik/panel decydują (sanity-band → karta
`client_cost_review` gdy poza pasmem, §2g). Typy body edge rozszerzone. **`CLIENT_WS`:** opis
sekcji; **tracking `open_ceny` → whitelista `TRACK_ACTIONS`.**

## 8. PARAMETRY — docelowy `settings.wf2_price_config` v3.2 (pełny zrzut)

**Silnik czyta WYŁĄCZNIE klucze KANONICZNE v3.2** (waliduje `config_version=='3.2'` fail-closed,
P8). Klucze DEPRECATED (niżej) są ignorowane. `engine_enabled`/`dry_run` PRZENOSZONE z obecnego
configu (COALESCE) — dziś oba żyją w pilocie (enabled=true, dry_run=true; asercja migracji:
dry_run MUSI zostać true). **ZASADA P7: żaden próg wyzwalający akcję auto nie żyje wyłącznie w prozie.**

### KANONICZNE v3.2
```json
{
  "config_version": "3.2",
  "engine_enabled": false,
  "dry_run": true,
  "autonomy_default": "propose",
  "pilot_project_ids": ["baacc66f-…"],
  "decision_hour": 7,
  "no_raise_weekdays": [4, 5],

  "hard_min_orders": 5,

  "winner_orders": 5,
  "winner_spend": 300,
  "winner_needs_cp2": true,
  "cp2_atc_rate": 5.0,
  "cp2_cost_atc_max": 12,
  "winner_high_confidence_orders": 5,
  "winner_orders_no_ads": 5,
  "min_prepaid_orders": 1,

  "ramp_orders": 5,
  "ramp_spend": 150,
  "ramp_hold_days": 7,
  "ramp_wall_snap": true,
  "walls": [100, 150],

  "collapse_quantile": 0.10,
  "collapse_baseline_days": 7,
  "collapse_min_spend": 150,
  "collapse_max_days": 5,
  "collapse_min_expected": 8,
  "collapse_rel_floor": 0.6,
  "learning_grace_days": 3,
  "rollback_lock_days": 21,
  "q4_cpm_uplift": 40,

  "small_step_no_adset_pct": 10,
  "fresh_adset_days": 10,

  "target_change_min_pct": 10,
  "target_stability_runs": 2,
  "cpa_ewma_alpha": 0.3,

  "opt_probe_pct_min": 15,
  "opt_probe_pct_max": 20,
  "opt_window_days": 14,
  "opt_window_days_cod": 21,
  "contribution_keep_frac": 0.80,
  "mer_be_mult": 1.2,
  "mer_gate_min_margin": 0.30,
  "wall_cross_requires_human": true,
  "allow_downward_proposals": true,
  "auto_step_max_pct": 20,

  "frequency_decline": 3.5,
  "harvest_cpm_rise_pct": 20,
  "harvest_window_days": 14,

  "scale_margin_survival": 0.12,
  "scale_margin_target": 0.40,
  "cpa_ci_quantile": 0.65,

  "effective_factor_bands": {"do60": 0.92, "do100": 0.85, "do150": 0.78, "powyzej": 0.70},
  "cod_settled_gating_share": 0.60,
  "cod_cooldown_days": 21,
  "sms_verify_required_above": 100,

  "ads_fresh_hours": 48,
  "ads_min_spend_active": 1,
  "dq_unmapped_ratio": 0.2,
  "no_ads_window_days": 30,
  "no_ads_max_steps": 2,

  "market_gap_flag": 0.75,
  "cooldown_days": 7,
  "min_margin_floor_pct": 5,
  "anomaly_min_orders": 12,
  "anomaly_window_days": 14,
  "cache_grace_min": 6,
  "max_price_changes_per_run": 5,
  "decision_ttl_days": 14,
  "proposal_ttl_days": 14,
  "paid_definition": "synced",
  "client_price_consent": "notify",

  "cost_model": {
    "vat_rate": 0.23,
    "dropship_customs_fee_pln": 13,
    "wholesale_discount": 0.40,
    "wholesale_extras_pct": 0.15,
    "wholesale_local_ship_pln": 14,
    "client_cost_sanity_band": [0.4, 1.6],
    "tax_model_default": "goods"
  }
}
```

**NOWE/ZMIENIONE v3.2 (reszta kluczy v3.1 bez zmian):** `config_version 3.2` · `hard_min_orders 5`
(§2f) · `winner_orders 3→5` · `ramp_orders 3→5` · `collapse_min_expected 5→8` · `collapse_rel_floor
0.6` (§2d) · `no_ads_max_steps 2` (§4.3 S1) · `proposal_ttl_days 7→14` (S7 — kolizja expiry==delay
reakcji Tomka, scen.12) · sekcja `cost_model` (§2g).

### DEPRECATED (silnik IGNORUJE; w seedzie mogą zostać jako ślad migracji — kod czyta tylko kanoniczne)
- `max_step_pct 15` → zastąpione `auto_step_max_pct 20` (P6, redundancja).
- `defer_to_checkpoint` → funkcja nieokreślona, USUNIĘTA z logiki (P7).
- `advance_orders_test 5` → `winner_orders 3` + CP2.
- `winner_spend_floor 200` → alias historyczny `winner_spend 300`.
- `opt_step_pct [8,12]` (staircase) → `opt_probe_pct_min/max 15–20` (jeden probe).
- `contribution_keep_frac 0.95` (stary seed) → `0.80` (0,95 wywalał zdrowy szczebel w 44%).
- `effective_factor 0.90` (płaski) → `effective_factor_bands` (pasma COD).

## 9. FAZY WDROŻENIA v3.1

- **F1 — MIGRACJA (done gdy: `20260721d_wf2_ceny3` zaaplikowana PRZED kodem):** `wf2_engine_runs`
  (+ `kind`/`ok`, UNIQUE active, stale 7 min), kolumny `wf2_products` (autonomia, cooldown,
  `rollback_lock_until`, `target_snapshot`, `landing_price_contract`, `parent_product_id`),
  `run_id/proposal_id` na events, `expires_at` + kind `landing_republish` na proposals,
  `orders_unmapped_last` + `shipping_free_threshold` na projects, widok `wf2_product_daily`,
  migracja configu → v3.1 (backup + COALESCE kill-switcha + asercje `DO $$ RAISE`, P8).
- **F2 — SILNIK (done gdy: `test:webhooks` zielone + `test:wf2` przechodzi + engine 200 z
  heartbeatem + WERYFIKACJA COD `is_paid` na REALNYCH danych Trevio wykonana i predykat
  COD-settled ustalony (P15) + patch `wf2-orders-sync` `orders_unmapped_last` — WSZYSTKO PRZED
  `engine_enabled`):** `wf2-platform verify_price` + `wf2-price-engine` (sweep + decyzje,
  lifecycle P10) + cron `*/10` (P11). Deploy edge `--no-verify-jwt --project-ref yxmavwkwnfuphjqbelws`.
- **F3 — PANEL + LANDING (done gdy: weryfikacja wizualna 0 defektów, strefa decyzji zapisuje):**
  `ceny.html` centrum dowodzenia (§6) + link w `projekt.html`; **kontrakt landingu v3.1 (P18):
  naprawa regresji `checkout-inline@2` (`applyState` hydratuje `[data-price]`) + wzmocniony gate
  `cena_panel` (proza/JSON-LD/title/meta) + klasyfikacja `landing_price_contract` istniejących
  landingów**; **portal notify minimal (P23):** sekcja read-only „Zmiany cen" + wpis
  `wf2_activities`. Deploy tn-crm = git push main.
- **F4 — PILOT DRY-RUN (done gdy: ≥7 dni decyzji w panelu na baacc66f bez błędów; do Tomka
  wraca decyzja: progi autonomii + moment `dry_run=false`):** `engine_enabled=true`,
  `dry_run=true`, `pilot_project_ids=[baacc66f]` — obserwacja `decisions`.

Kolejność: migracja → silnik → panel+landing → pilot. Zero dotykania `tpay-webhook`.

### ⛔ WARUNKI ZDJĘCIA `dry_run` (`dry_run=false` → F4-live) — checklista JAWNA
Budowa F1–F3 + pilot dry-run = BEZPIECZNE od razu. `dry_run=false` DOPIERO gdy WSZYSTKIE:
1. **P1–P16 w KODZIE** (collapse spec + histereza/lock + lifecycle + DQ podwójne + predykat
   COD-settled + MER-gate + freshness 3 stany — nie tylko w dokumencie).
2. **P17–P19 landing:** kontrakt `hydrated` spełniony dla pilotowych produktów; gate `cena_panel`
   wzmocniony; regresja `checkout-inline@2` naprawiona.
3. **P23 notify:** sekcja „Zmiany cen" w portalu + wpis `wf2_activities` działają.
4. **`WF2_META_TOKEN` USTAWIONY i `wf2_ad_stats` PŁYNĄ** (spend > 0 na pilocie) — pilot BEZ
   tokena NIE waliduje ścieżki produkcyjnej (bramki spend/CP2 martwe; tryb no-ads ≠ produkcja).
5. **[D-A5] mandat umowny** do zarządzania ceną potwierdzony przez Tomka.
6. ≥7 dni pilota dry-run bez błędów; Tomek zatwierdza progi autonomii + moment przełączenia.

## 10. DECYZJE TOMKA [D]

**Nierozstrzygnięte z v2.1:**
- **D#2 `test_pricing_mode` default:** `cost_plus` wszędzie czy `target_minus` dla > 120 zł
  (rekomendacja: `target_minus`).
- **D#5 Kanał Slack** (który?) czy tylko panel.
- **D#6 `client_price_consent`:** `notify` (rekomendacja, default) czy `require_accept`.
- **D#7 Auto-budżet kampanii** w granicach planu po okresie zaufania (rekomendacja: tak, po
  1. pełnym cyklu bez incydentów).

**Nowe (v3, działamy na defaultach do decyzji Tomka):**
- **D-A1 START→RAMP:** zawsze kartą (default) czy auto przy ≥5 zam. high-confidence?
- **D-A2 `auto_step_max_pct` 20%** — OK jako pułap kroku full-auto?
- **D-A3 `autonomy_default 'propose'`** na start, przełączenie na `'auto'` po pilocie — OK?
- **D-A4 auto-rollback przy collapse** bez czekania na akcept (default TAK; teraz z bramką mocy
  `collapse_min_expected 5` i lockiem 21 dni, §2d) — OK?
- **D-A5 Mandat umowny wspólnika (P23):** czy umowa spółki/współpracy daje TN prawo do
  AUTONOMICZNEGO zarządzania ceną (auto-zmiany bez akceptu klienta)? **WARUNEK `dry_run=false`** —
  do potwierdzenia przez Tomka (default do potwierdzenia: `notify`, nie `require_accept`).

## 11. RYZYKA I PUŁAPKI

**Przeniesione z v2.1 (13 — aktualne poza P0):**
1. **⛔ P0 mapper `amt()` — DONE (naprawione i zweryfikowane):** API zwraca OBIEKTY `{amount}`,
   `num(obiekt)=0` → revenue/P&L/BEROAS na zerach → wieczna strata. Helper `amt()` = pierwsza
   pozycja W1, potwierdzony na zam. 58088579.
2. **`unit_profit` GENERATED — NIGDY nie pisać** (price NULL → unit_profit NULL).
3. **Stale-cache hydratacji:** `cache_grace_min 6` MUSI być > TTL 5 min `wf2-landing-api` —
   inaczej odczyt hydratacji nadpisze wyższą cenę na landingu, gdy kasa już liczy nową.
4. **Meta ROAS małego wolumenu:** ZAKAZ auto-killa/auto-decyzji na liczbach Mety (gubi 20–30%
   konwersji) — decyzje na strażnikach, nie ROAS.
5. **Learning-phase:** zero zmian budżetu w learningu; ≤ +20%/dzień, ≤ +50%/tydzień;
   skalowanie NIGDY w tym samym kroku co podwyżka ceny.
6. **`scale_base` stara formuła:** floor > ceiling = clamp niezdefiniowany (endoskop, jeździk)
   → v2 z FLAGĄ zamiast ślepego podbicia ponad rynek (paliło ~1 tys./produkt).
7. **Szum małych prób (Poisson):** `keep_frac 0.95` wywalał zdrowy szczebel w 44%; próg „10
   zamówień" nieosiągalny → progi 3 zam. + ATC (dziesiątki zdarzeń, realna moc).
8. **Ręczna edycja Trevio:** reconcile runGuard `wf2-orders-sync` co ≤10 min → `mismatch`
   + alert; nie traktować jako sygnału popytu.
9. **Nakładające się runy:** atomic claim `WHERE price_phase=$expected AND price_state='ok'`;
   0 wierszy = stop (zero podwójnych awansów).
10. **`platform_variant_id`:** bez niego `set_price` nie ma adresu — zapis w kroku pl_produkt
    (1 wf2_product = 1 wariant sprzedażowy); backfill z `variants[0]`.
11. **Lag COD 14–28 dni > kadencja:** COD-heavy → awanse na zamówieniach ROZLICZONYCH,
    `cod_cooldown_days 21`, SMS-weryfikacja obowiązkowa > 100 zł.
12. **Konto Tomka act 1537…:** wykluczone na `wf2-ads-sync` (skip + log) — nie zanieczyszcza P&L.
13. **JSON-LD zapieczony:** v3.1 — `Offer` BEZ `price` dopóki re-publish nieautomatyczny (P18c);
    zmiana ceny na landingu `legacy` → karta `landing_republish` (§4.5); runtime cena świeża z
    `wf2-landing-api`. Rosnące `orders_unmapped` = pauza DQ, NIE rollback.

**Nowe / zaktualizowane ryzyka v3.1:**
- **A. Częstsze zmiany cen** → ryzyko relacyjne wspólnika + komentarze „była taniej". Mityg.:
  `cooldown_days 7` + `no_raise_weekdays [4,5]` + powiadomienie z framingiem zysku (§7, WARUNEK
  `dry_run=false`) + strażnik komentarzy + świeży ad set. **Częściowo ZAADRESOWANE — relacja =
  wciąż najsłabsze ogniwo.**
- **B. Nakładające się runy** → UNIQUE partial (jeden aktywny) + stale 7 min + INSERT
  unique-violation → 200 `already_running` + lifecycle `ok` (crash nie blokuje ponowienia, P10).
  **ZAADRESOWANE.**
- **C. FAŁSZYWY COLLAPSE (szum Poissona / learning):** rollback bez powodu + szok. Mityg. (§2d):
  bramka mocy `collapse_min_expected 5`, potwierdzenie w 2 runach, `learning_grace_days 3` (dni
  learningu WYKLUCZONE), normalizacja SPENDEM, aktywny TYLKO po podwyżce. **NOWE — dawne ryzyko
  wzmocnione.**
- **D. OSCYLACJA bez locka (góra–collapse–dół–góra):** `rollback_lock_until 21d` + dead-band
  `target_change_min_pct 10` + `target_stability_runs 2` (§2e). Re-podwyżka na ten sam poziom =
  KARTA. **NOWE — ZAADRESOWANE.**
- **E. REGRESJA hydratacji `checkout-inline@2`:** moduł przestał hydratować `[data-price]` →
  landing pokazuje ZAPIECZONĄ cenę mimo zmiany w kasie. Mityg.: naprawa `applyState` (F3, P18d) +
  `landing_price_contract` gate (auto TYLKO `hydrated`). **NOWE.**
- **F. COD `is_paid` NIEZNANE:** jeśli Trevio nie flipuje `is_paid` dla rozliczonego COD, predykat
  COD-settled jest ślepy → złe awanse. Mityg.: F2 weryfikuje na realnych danych PRZED enabled;
  COD-heavy = propose-only do potwierdzenia (P15). **NOWE — BLOKUJE enabled.**
- **G. Katalogi Meta/Google vs JSON-LD:** rozjazd ceny w `JSON-LD Offer.price` (zapieczonej) a
  kasą → Meta/Google mogą pociągnąć STARĄ cenę do katalogu produktowego. Mityg.: JSON-LD BEZ
  `price` dopóki re-publish nieautomatyczny (P18c); gate `cena_panel` FAIL na `Offer.price`. **NOWE.**
- **H. Config drift:** obecny seed = stare progi. Mityg. (P8): backup + COALESCE kill-switcha +
  asercje `DO $$ RAISE` + walidacja `config_version=='3.2'` fail-closed (v3.2: backup do
  `wf2_price_config_backup_v31`). **ZAADRESOWANE.**

**Nowe / zaktualizowane ryzyka v3.2 (z symulacji MC silnika — `docs/zbuduje/assets/SIM-ENGINE-V3-WYNIKI.md`,
12 scen. ×500; wszystkie ZAADRESOWANE poprawkami S1–S9):**
- **I. No-ads RATCHET (P1.1, scen.10):** bez tokena Meta silnik windował cenę do 299 zł (28 zmian!)
  przy optimum 100 — kontrybucja 1829 < baseline 2227 (Δ −399, GORZEJ niż „nic nie rób"). Mityg.
  (S1, §4.3): `no_ads_max_steps 2` + cooldown + blok ściany + STOP gdy przychód 14d spada +
  `hard_min_orders`. **ZAADRESOWANE.**
- **J. UNCAPPED RAMP → overshoot + collapse (P1.2, scen.7):** karta winnera liczyła `rampTarget`
  BEZ capu — skok 109,90→149,90 (+36%) przez klif 130 → collapse → rollback (round-trip Δ −501).
  Mityg. (S2): clamp każdego kroku ≤ `auto_step_max_pct 20`; RAMP = SERIA kroków. **ZAADRESOWANE.**
- **K. Martwe reżimy BASE/PROBE/HARVEST (P2.3):** cały portfel niskokosztowy kończył w RAMP/START
  (BASE = dead code: `scale_base ≤ cena RAMP` → wieczny `hold_ramp`). Mityg. (S3): po rampie
  przejście WPROST do PROBE. **ZAADRESOWANE.**
- **L. Dziury w danych ads (P2.4, scen.9):** 5-dniowa luka → przełączenie na no-ads (ratchet) +
  zepsuty baseline collapse (4,3 zmian, oscylacja 16%). Mityg. (S4): luka spend=0 ≥2 dni →
  `hold_dq`, NIE no-ads. **ZAADRESOWANE.**
- **M. FAŁSZYWY collapse na świeżym ad secie (P2.5, scen.8):** ~20% fałszywych rollbacków (weekend +
  szum Poissona przy małej próbie baseline). Mityg. (S5): `collapse_min_expected 5→8` +
  `collapse_rel_floor 0.6` + baseline SPEND-MATCHED. **ZAADRESOWANE.**
- **N. Elastyczne winnery KRZYWDZONE przez jednokierunkowy ratchet RAMP (P3.6, scen.1):** Δ −117 vs
  baseline; collapse łapie tylko katastrofy, nie łagodne straty 10–20%. Mityg. (S6): post-step
  guard — po `opt_window_days` kontrybucja/zł < `keep_frac 0,80` → KARTA obniżki. **ZAADRESOWANE.**
- **O. Latencja kart (P3.7, scen.12):** `proposal_ttl_days 7` + akcept w dniu 7 = expiry==delay
  (karta wygasa zanim się wykona). Mityg. (S7): `proposal_ttl_days 7→14`. **ZAADRESOWANE.**
- **P. BUG omijania locka/cooldownu przy WYKONANIU karty (P4.9, S8):** `wall_cross` zwracany PRZED
  `cooldown`/`rollback_lock`, a sweep przy wykonaniu NIE re-sprawdzał guardraili — akcept karty
  przebijał oba (nie eksplodowało tylko dzięki dedup, przypadek nie projekt). Mityg. (S8): sweep
  przy WYKONANIU re-sprawdza `price_state='ok'`, cooldown, `rollback_lock_until`, `hard_min_orders`
  — inaczej skip z notą (karta zostaje `accepted`, retry następnym sweepem). **ZAADRESOWANE.**
- **R. COD-heavy `rollback` GUBIONY (P4.10, S9):** przy `col.state=='rollback' AND codH` warunek
  `!codH` nie wchodził → produkt COD-heavy w prawdziwym collapse nie dostawał ANI auto-rollbacku
  ANI karty. Mityg. (S9): dla `codH` w stanie `rollback` emituj KARTĘ `rollback`. **ZAADRESOWANE.**
- **S. Freeze po auto-rollbacku (P4.11):** karta `winner_reco` (klucz bez poziomu) zużyta, produkt
  zamrożony na starej cenie bez ponowienia próby. **ŚWIADOMA decyzja — freeze celowy** (chroni przed
  oscylacją; ewentualny powrót winnera po `decision_ttl_days` z podniesioną poprzeczką = opcja W-later).

## ŹRÓDŁA
Jak v1/v2.1 (research 18.07: pricing/repricing 2× Sonnet; runda v2.1: walidacja Monte Carlo
`docs/zbuduje/assets/sim-drabinka.py` + 2× krytyk Opus pricing science/praktyk PL) + konspekt
architektury „Ceny 3.0" (orkiestrator, 21.07 — decyzje wiążące A–I) + **runda v3.1: 2× krytyka
(pricing science K1–K6/W7–W22 + praktyk PL #1–#23), audyt landingu, research prawny UOKiK/Meta —
rozstrzygnięcia orkiestratora P1–P24** + **runda v3.2 (21.07 wieczór): symulacja Monte Carlo
SILNIKA (`docs/zbuduje/assets/SIM-ENGINE-V3-WYNIKI.md` — wierny port `wf2-price-engine`, 12 scen.
×500 + scen.13 próg 3 vs 5) → poprawki S1–S9 + twardy próg 5 (dyrektywa Tomka); research podatkowy
VAT/cło/IOSS/hurt (model kosztów tax-aware); analiza portalu klienta (zakładka „Ceny")** + fakty
techniczne z 4 raportów agentów analizy repo tn-crm (21.07: schemat DB, edge functions, panel,
sekwencje kierunkowe). Meta `adrules_library`
(developers.facebook.com), commonthreadco.com (MER),
admetrics.io (contribution margin), jetfuel.agency (Andromeda), dsers/simplebundles (multipak),
olzalogistic/apaczka (COD PL), prawo.pl/UOKiK (dark patterns, kary), infor.pl (cena
wprowadzająca). Pełne raporty: transkrypty 18–21.07.
