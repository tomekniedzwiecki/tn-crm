# WORKFLOW V2 — SYSTEM DECYZJI TESTÓW PRODUKTOWYCH

**Status: PRZYJĘTE jako baza 2026-07-15** (projekt: agent Opus + web research, synteza: Fable).
Wartości `[PROPOZYCJA]` = defaulty w `settings` (klucze `wf2_test_config` / `wf2_scale_config`) —
strojenie na żywych danych = zmiana JSON-a w settings, NIE deploy. `[DECYZJA]` = decyzja Tomka.
`[BENCHMARK]` = z researchu (źródła na końcu). Powiązanie: `WORKFLOW-V2-PLAN.md` §0b, §7–8.

**🎯 Cel nadrzędny (kontekst):** sklepy klientów MUSZĄ sprzedawać. Test nie jest po to, by zarobić —
jest po to, by TANIO znaleźć produkt, który sprzedaje, i dopiero na nim zarabiać ceną scale.

---

## 0. RAMA I REALIZM BUDŻETU (fundament — przeczytaj najpierw)

**[DECYZJA Tomka 2026-07-19: portfel testowy = 3 PRODUKTY (było 5)]** — mniej roboty fabryki
(landing + wideo + grafiki per produkt), większy budżet i sygnał na produkt.

**500 zł na 3 produkty ≈ 165 zł/produkt = ~1/10 „podręcznikowego" budżetu testu jednego produktu**
(polskie agencje: min. 1 500–3 000 zł / 2–3 tyg. / 1 produkt). Konsekwencje:

1. **Przy ~165 zł/produkt wciąż NIE decydujemy po koszcie/zakup.** Rachunek na benchmarkach PL:
   CPM ~30 zł → 165 zł ≈ 5 500 wyświetleń → CTR 1% ≈ 55 klików → CR 1,5% ≈ **0,8 zakupu**.
   Za mało mocy statystycznej. Decyzje = **sygnały górnego lejka** (link CTR, CPC, ATC rate,
   koszt/ATC); zakup to potwierdzenie, nie warunek.
2. **Równy podział 3×165 zł nadal jest suboptymalny** — rozlany budżet nie wyprodukuje sygnału
   zakupowego na żadnym produkcie. System = **alokacja dwubramkowa** (§4.3).
3. **Świeży pixel + ~20 zł/dzień = trwały learning-limited na Purchase — akceptujemy.**
   NIE optymalizujemy na tańsze zdarzenia „na skróty" (uczy Meta szukać ludzi, którzy nie kupują).
4. **Portfel ma rozpiętość cen 7×** (34→240 zł) — cap walidacji wg pasma cenowego, nie jeden dla wszystkich.

### Benchmarki bazowe PL (Meta Ads, e-commerce, 2025/26) [BENCHMARK]

| Metryka | Wartość PL | Alarm |
|---|---|---|
| CPM Feed | 18–45 zł (e-comm śr. ~30-37) | — |
| **CPM Reels/Stories** | **8–22 / 12–30 zł (najtańsze)** | — |
| CPC link | 0,50–3,50 zł | > 3,5 zł |
| CTR link Feed | 0,9–1,5% (dobry > 2%) | **< 0,5%** |
| CR nowego sklepu | 1–2% | < 1% |
| CPA e-comm | 30–150 zł | — |
| Q4 (BF/święta) | CPM +40–80% | — |

> **Wniosek #1:** kreacje **pionowe wideo 9:16 first** (Reels/Stories CPM ~½ Feed, wyższy CTR)
> ~podwajają zasięg każdych 100 zł. Advantage+ placements ON, środek ciężkości = Reels.

---

## 1. MECHANIKA TESTU (per produkt)

| Parametr | Ustawienie |
|---|---|
| Cel kampanii | `OUTCOME_SALES`, optymalizacja **Purchase** (bez „skrótów" na ATC) |
| CAPI | **Obowiązkowe od dnia 0** (odzysk 15–25% zdarzeń; checkout na osobnej domenie — §7) |
| Budżet | **ABO** (ad set budget) — testy; CBO dopiero przy skali |
| Struktura | **1 kampania = 1 produkt = 1 ad set** (`campaign_id` → wf2_products) |
| Typ | Manual Sales (NIE Advantage+ Shopping — ASC potrzebuje katalogu 30+ SKU) |
| Targetowanie | **Broad / Advantage+ Audience**: PL, 18–65, płeć wg produktu, ZERO stackowania zainteresowań |
| Placements | Advantage+ ON, kreacje 9:16 wideo first |
| Kreacje | **3–5 / produkt** (różne hooki, Manus) |
| Budżet dzienny | Bramka A: ~17–25 zł/d/produkt; Bramka B: 40–80 zł/d na survivora |
| Długość | Dni 1–2 = zbieranie (ZERO decyzji); okno 3–7 dni; metryki po 7-dniowej kroczącej |
| Start | Publikacja rano (07–09) lub harmonogram od 00:00; **pon.–wt.**, nie pt./sob.; ręcznie z PAUSED (bramka) |
| Bridge event | Wyłączony domyślnie (`bridge_event:""`); dopuszczalny 24–48 h ATC-bridge tylko przy świetnym CTR i zerze sygnału |

---

## 2. CHECKPOINTY I DRZEWO DECYZYJNE

Checkpointy są **SPEND-BASED** (nie czasowe) + bezpiecznik: min. 48 h i ≥1 500 wyświetleń przed
pierwszą decyzją. Nigdy nie killujemy w dniach 1–2.

| CP | Spend skum. | Czytamy | KILL / STOP | OBSERWUJ | PROMUJ |
|---|---|---|---|---|---|
| **CP1 Hook** | ~50 zł | link CTR, CPC | CTR **< 0,5%** → hook fail: WYMIEŃ KREACJE (produkt zostaje; 2. hook-fail → deprioryzacja) | CTR 0,5–1,0% / CPC 2,5–3,5 → wymień najsłabszą kreację | CTR **≥ 1,0%** i CPC **≤ 2,5 zł** |
| **CP2 Intencja** | ~100 zł | ATC rate (ATC/LPV), koszt/ATC | ATC **< 2%**; 0 ATC przy dobrym CTR = problem strony/oferty, nie produktu | 2–5% | ATC **≥ 5%** i koszt/ATC **≤ 12 zł** → **Bramka B** |
| **CP3 Popyt** | 150–300 zł (survivorzy) | zakupy, CPA, ROAS | 0 zakupów **i** 0 ATC po VALIDATION_CAP → **KILL** | 1–2 zakupy, CPA ≤ 1,5×cena → dosyp | **≥ 3–5 zakupów**, trend ↑ → **WINNER** → §6 cena scale → §5 skala |
| CP-kreacja | ATC są, 0 zakupów po 4× target CPA | — | problem CENY/OFERTY → iteruj ofertę (§5.2 szczebel 2), nie killuj produktu | | |

```
START (publikacja pon./wt. rano, z PAUSED — bramka Tomka)
├─ Dzień 1–2: zbieraj, zero decyzji (min 48 h)
▼ CP1 @ ~50 zł — HOOK: CTR≥1% i CPC≤2,5 → dalej · CTR<0,5% → nowe kreacje (produkt zostaje)
▼ CP2 @ ~100 zł — INTENCJA: ATC≥5% i koszt/ATC≤12 → BRAMKA B · ATC<2% → kill po capie
▼ CP3 @ 150–300 zł — POPYT: ≥3–5 zakupów → WINNER · ATC bez zakupów → iteruj ofertę · nic → KILL
▼ Po puli: 1–2 WINNERY → skalowanie · 0 winnerów → procedura ratunkowa §5.2
```

---

## 3. EKONOMIKA

**Breakeven ROAS = cena / unit_profit = 1 / marża_%_przychodu.**

- Marża testowa 15% narzutu na koszt → ~**11% przychodu** → **BE-ROAS ≈ 9,1** → test jest
  ŚWIADOMIE stratny na reklamie [DECYZJA]. To koszt walidacji, nie błąd.
- Cena scale ~2,5–2,7× kosztu → marża ~40% → **BE-ROAS ≈ 1,6** → przy celu ROAS 2,0–2,5
  realny zysk + 10% od przychodu dla Tomka. **Cały sens dwufazy.**

**Ceny testowe = psychologiczne (reguła fabryki od 15.07, doprecyzowana rundą 2 krytyka):**
zaokrąglamy W GÓRĘ, spójne końcówki katalogu: **<150 zł → …4,90/…9,90; ≥150 zł → pełne …9,00**;
nigdy surowe artefakty przeliczeń (83,68 / 240,01) — sygnalizują „auto-przelicznik/dropshipping"
i zabijają zaufanie w momencie decyzji. (`psychPriceUp()` w projekt.html — suggestTestPrice/testPriceFor.)

Portfel rozwojowy (fees 2%, koszty z POTWIERDZONYCH aukcji detail 15.07): lokówka 72,77→**84,90**
(profit 10,43; BE-ROAS 8,1) · koc 51,21→**59,90** (7,49; BE 8,0) · endoskop 30,80→**39,90**
(8,30; BE 4,8 — podbite z 35,41, bo COD z opłatą pobraniową się nie domykał) · jeździk
208,71→**249,00** (35,31; BE 7,1) · pompka 55,11→**64,90** (8,49; BE 7,6).
⚠️ Lekcja 15.07: snapshoty „search" zaniżały koszt lokówki i koca ~2× — cena z aukcji
NIEPOTWIERDZONEJ nie jest podstawą kalkulacji (wymóg `detail` PRZED kampanią, §8).

> ⚠️ **WYMÓG FAZY TESTOWEJ (krytyczny): dostawę płaci KLIENT (lub COD za dopłatą).**
> Przy marży testowej 3,9 zł/szt. i wysyłce ~15–20 zł po stronie sklepu produkt jest
> pod kreską ZANIM wydamy złotówkę na reklamę. Cena dostawy = osobna pozycja w checkoucie.

### 4.2 Koszt walidacji (VALIDATION_CAP per pasmo ceny)

| Pasmo | Cena test | CAP | Uwagi |
|---|---|---|---|
| Niskie | < 50 zł | 120 zł | szansa na 2–3 zakupy przy CPA≤1,5×cena |
| Średnie | 50–120 zł | 180 zł | |
| Wysokie | > 120 zł | 280–300 zł **lub KPI zastępcze** | jeździk: w rundzie 1 sądzić po koszt/ATC i koszt/IC (consideration), duży tranche dopiero gdy tanie produkty rozstrzygnięte |

`max_test_CPA = 1,5 × cena_test` [PROPOZYCJA] — tolerancja straty na zakup w teście.

### 4.3 Alokacja dwubramkowa 500 zł [kluczowa decyzja systemowa; przeliczona na 3 produkty 19.07]

- **Bramka A (siew, ~150 zł): 3 × ~50 zł** — czyta HOOK (CP1) i początek INTENCJI. Odsiewa 1–2 martwe.
- **Bramka B (głębia, ~350 zł): top 1–2 survivorów × 175–350 zł** (wg pasma) — czyta POPYT (CP3).
  Przy 3 produktach survivor pasma nisko/średnio dostaje PEŁNY VALIDATION_CAP (przy 5 nie było
  to możliwe) — twardsze werdykty za ten sam budżet.

Suma capów pełnej walidacji 3 produktów (~420–600 zł) wciąż przekracza to, co zostaje po
Bramce A → dwubramka nadal koncentruje budżet tam, gdzie jest sygnał; równe 3×165 zł dałoby
~0,8 zakupu/produkt = brak twardych werdyktów.

---

## 5. SKALOWANIE (~500 zł) I PROCEDURA RATUNKOWA

### 5.1 Winner
1. **NAJPIERW przecena test→scale (§6), POTEM budżet** — skalowanie na marży testowej = mnożenie straty.
2. **Vertical +20%/dzień** na uczącym się ad secie (nie duplikacja — fragmentuje małą pulę).
3. Świeże kreacje 1–2/tydz. gdy frequency > 2,0 lub CTR spada.
4. Retargeting ODŁOŻONY do ~1 000 skumulowanych LPV (`retargeting_min_lpv`).

### 5.2 Zero winnerów — drabinka (ze strażnikami budżetu)
1. **KREACJE**: produkt z najlepszym CTR/ATC → nowy komplet hooków (Manus); max 1 iteracja/produkt (~100 zł).
2. **OFERTA/CENA** (ATC są, zakupów brak): bundle / darmowa dostawa wliczona / COD+gwarancja /
   social proof na landingu (~100 zł).
3. **WYMIANA PRODUKTÓW**: kill 2 najsłabszych → 2 świeże z /trendy → Bramka A tylko dla nowych.
4. **REASSESS** (po 2 iteracjach bez sygnału): STOP spend; audyt trackingu (czy Purchase wpada!),
   pasma cen, product-market fit — decyzja z Tomkiem.

Strażnik globalny: iteracje ratunkowe ≤ pozostała pula projektu.

---

## 6. PRZEJŚCIE CEN TEST→SCALE (propozycja AI)

**Trigger (hybryda):** `(≥5 opłaconych zamówień [DECYZJA] AND spend ≥ 200 zł)` LUB slow-graduation
`(≥3 zamówienia AND spend ≥ 300 zł)`; min. 5 dni okna. Zamówienia = prawda z API platformy (wf2_sales
source='platform'), nie pixel.

**Wejście:** cost_purchase/shipping/fees, CPA_test, CTR/CPC/CR, widełki konkurencji (raport
`bud-raport`), AOV, proxy elastyczności (ATC rate vs cena), 10% Tomka, progi psychologiczne, sezon.

**Formuła bazowa:**
```
m_target      = 1 / ROAS_target_scale            # default ROAS 2,5 → m=0,40
price_floor   = (cost_purchase + cost_shipping) / (1 − fees_pct/100 − m_target)
price_ceiling = min(competitor_max, CPA_test / (1 − fees_pct/100 − m_min))   # m_min=0,30
price_prop    = psych_round(clamp(floor..ceiling))
```
**Kontrola krzyżowa (obowiązkowa):** `unit_profit(price_prop) − CPA_scale_est` gdzie
`CPA_scale_est ≈ CPA_test × 1,3` (scale-price obniża CR). Ujemne → podnieś cenę / flaga
„popraw CPA przed skalą".

**Output (JSON na produkcie, `scale_proposal`):** proposed_price + floor/ceiling + BE-ROAS przy
cenie + expected_unit_profit + competitor_range + cpa_test + net_per_sale_at_cpa + confidence +
`rationale_pl` + **widełki: ostrożna/bazowa/agresywna**. Cena = BRAMKA CZŁOWIEKA (Tomek).

Przykład (lokówka): floor = 30,57/(1−0,02−0,40) = 52,7 zł; rynek 49–69 → propozycja 54,99
(marża 42%, BE-ROAS 2,36).

---

## 7. DANE I TRACKING

### 7.1 Granularność
- Werdykt produktu (KILL/WINNER): dzienny **campaign-level** sync wystarcza ✅.
- Decyzje o kreacjach (CP1) i intencji (CP2): potrzebny **ad-level + akcje** (link_clicks, LPV,
  ATC, IC) — **kolumny dodane migracją `20260715b_wf2_testy_dane`** (link_clicks, lpv, atc, ic,
  reach, frequency, ad_id, level, actions jsonb; UNIQUE rozdzielone per level). Sync: dzienny
  campaign-level (tanio) + on-demand ad-level przy checkpointach.
- ⚠️ **ANTY-PODWÓJNE LICZENIE:** wiersze `level='ad'` SUMUJĄ SIĘ z `level='campaign'` dla tego
  samego dnia — **każde P&L / productStats / suma spend liczy WYŁĄCZNIE `level='campaign'`**;
  ad-level służy tylko decyzjom o kreacjach. Obowiązuje synca (wf2-ads-sync) i UI (projekt.html
  przy F3 dostaje filtr level — dziś wszystkie wiersze mają default 'campaign', nic się nie psuje).
- `wf2_products.orders_paid` (licznik opłaconych, trigger §6) aktualizuje **wf2-orders-sync** (F3)
  z `wf2_sales(source='platform')` — NIE liczyć z pixela.

### 7.2 Zdarzenia i cross-domain (landing ≠ domena checkoutu!)
Landing (domena marki): PageView, ViewContent, AddToCart (klik CTA), InitiateCheckout (wyjście
do kasy). Checkout (platforma): InitiateCheckout, AddPaymentInfo, **Purchase**.

Warstwy (wszystkie konieczne):
1. **Ten sam pixel_id na OBU domenach** (landing + checkout platformy).
2. **Weryfikacja obu domen** w BM klienta.
3. **Link decoration**: przy przejściu do kasy doklejamy `fbclid`/`_fbp`/`_fbc` do URL
   (cookie `_fbc` nie przechodzi między domenami) — skrypt w szablonie landinga (FABRYKA).
4. **CAPI server-side Purchase Z PLATFORMY** per sklep (mapa shop→pixel_id→token) = źródło prawdy;
   pixel przeglądarkowy = backup; **dedup po wspólnym event_id**.

→ **WYMAGANIA WOBEC PLATFORMY (dla developera, dopisane do listy API):** możliwość wpięcia pixela
per sklep na checkoucie, przechowanie `pixel_id`+`CAPI token` per sklep, emisja Purchase przez CAPI
z event_id, przenoszenie parametrów `fbclid/_fbp/_fbc` z wejścia na checkout do zdarzenia.

---

## 8. EDGE CASE'Y

| Case | Procedura |
|---|---|
| Zero sprzedaży na 5/5 | Najpierw WYKLUCZ TRACKING (Events Manager Test Events + test zakupowy). OK → drabinka §5.2. Sprawdź wymóg dostawy (§3 ⚠️). |
| Sprzedaż w API, brak w pixelu | `source='platform'` = prawda o zamówieniach (P&L, licznik, trigger cen); `source='meta'` = atrybucja (ROAS/CPA). platform≫meta → napraw CAPI. NIGDY nie killuj produktu, który sprzedaje w API. |
| Produkt sezonowy | flaga w notes + okno; poza oknem słaby wynik ≠ kill; Q4: progi CPM +40–80% (`q4_cpm_uplift`). |
| Aukcja Ali wyczerpana | Przed kampanią WYMAGANE `ali_src='detail'`. W trakcie: podmiana aukcji → przelicz koszt/cenę; brak zamiennika → PAUSED + alert. Nie sprzedajemy bez pokrycia. |
| Konto ads klienta zablokowane | Wstrzymanie testu (nie kill). Odwołanie klienta; przegląd kreacji/landingu pod politykę; zapis stanu spend-checkpointu; **NIE przenosić na konto Tomka** (act 1537… wykluczone). Log w activities. |

---

## 9. KREACJE I OPIEKA NAD KAMPANIAMI (aneks 2026-07-19; research 3× Sonnet)

Podstawa dla kroków `ads_zestaw` / `ads_start` / `ads_opieka` / `ads_wyniki` (etapy 5-6 panelu).
Kontekst algorytmiczny: **Andromeda/GEM — kreacja = targetowanie** (Meta: jakość kreacji ~56%
wyniku); wizualnie PODOBNE ady sklejane w jeden „byt" (10 wariantów tej samej grafiki
konkuruje o 1 slot) → liczy się różnorodność KONCEPCYJNA, nie wolumen.

### 9.1 Zestaw testowy per produkt
- **6 adów w 1 ad secie:** 1 body wideo × 3 hooki (baza + ≤2 warianty — pack z fabryki wideo,
  decyzja Tomka „max 3 wersje") + 3 statyki demo/problem/lifestyle (`proof` opcjonalny). 4 ady = minimum, nie optimum.
- Copy COD: hook w pierwszych **125 znakach** primary (tyle widać na mobile), headline **≤27**,
  **5 RÓŻNYCH tekstów** w polach (nie parafrazy), risk-reversal („płacisz przy odbiorze",
  zwrot 14 dni) + social proof z konkretną liczbą z KARTY PRAWDY. Emoji 1–2 max.
- **Flaga AI obowiązkowa** (self-certification; brak = odrzucenie ada). Awatar AI = wyłącznie
  PREZENTER demonstrujący produkt — **NIGDY „zadowolony klient" z testimonialem**
  (deceptive practices Meta + FTC; zaufanie do UGC-człowieka 81% vs 63% AI).
- Audyt polityki: Meta ocenia **copy + landing RAZEM** (semantic intent) — sprawdzać parę;
  pułapki: implied transformations (produkt obok „efektu"), personal attributes
  („masz problem z…"), health claims.
- Styl: AI ma wyglądać jak surowe UGC/telefon, nie studio („ugly ads" biją polished:
  UGC ~1,8% CTR vs 1,1%; Andromeda premiuje autentyczność).

### 9.2 Reguły kreacji po starcie (uzupełniają CP1-CP3 — nie zastępują)
- Diagnostyka per kreacja w kolejności: **thumbstop → hold → CTR → CPA**
  (thumbstop <20% = hook; dobry hook + słaby hold = body; dobre oba + niski ATC = landing/oferta).
  Dane: widok `wf2_creative_perf` (krok „Pomiar wyników").
- **Kill kreacji:** 3× docelowe CPA wydane i 0 zakupów → wymiana; ŻADNYCH decyzji przed
  dniem 3-5 / <10k wyświetleń (dni 1–2 = drogi szum; Andromeda potrzebuje ~72 h na szczyt).
- **Fatigue — triggery refreshu (łącznie):** frequency >3 (prospecting) · CTR −25% od baseline
  · CPM +35%; thumbstop spada PRZED CTR (najwcześniejszy sygnał). Żywotność konceptu
  2–4 tyg.; winner → **4–6 świeżych WARIANTÓW konceptu** (nie kopii). Zgłoszenie =
  `wf2_proposals` kind='creative_refresh' (decyzja Tomka).
- Testy NOWYCH kreacji: wewnątrz głównej broad kampanii, ocena po KONTRYBUCJI zakupów
  (nierówny spend to feature Andromedy, nie bug) — bez osobnej kampanii testowej „na siłę".
- **STRAŻNIK WDROŻONY (19.07):** `wf2-ads-sync` po każdym dziennym syncu tworzy karty
  `wf2_proposals` wg powyższych progów — `campaign_kill` (spend >1,5×cena bez ATC/zakupów,
  min. 2 dni danych) i `creative_refresh` (CTR −25% + frequency>3, albo CTR −50%; okna
  min. 1500 wyświetleń). Dedup tygodniowy (odrzucona karta nie wraca w tym samym tygodniu).
  Karty → warsztat „Opieka i higiena" (akcept/odrzut = Tomek; **akcept NIE wykonuje zmiany
  w Meta** — wykonanie zawsze przez sesję/człowieka). Blocklista komentarzy = standard
  w `docs/zbuduje/ADS-BLOCKLISTA-PL.md` (wgranie w Pre-flight).

### 9.3 Higiena konta i kampanii (krok `ads_opieka`)
- **Komentarze = trust signal cold traffic** (negatywy potrafią zdusić CTR i podbić CPM):
  blocklista PL na stronie ZANIM poleci pierwszy ad (Moderation Assist NIE działa na
  reklamach — tylko keyword blocklist do 1000 fraz), ukrywanie (nie usuwanie), konkretne
  odpowiedzi na pytania.
- **Feedback score strony** (ankiety po zakupie): <3 = interwencja obsługowa, <2 = kara
  delivery, <1 = zakaz reklam. Dla COD to najczęstsza cicha śmierć konta — komunikować
  czas dostawy, obsługiwać zapytania.
- Alerty: odrzucone ady (poprawka pod kod polityki, nie apelacja w ciemno; między apelacjami
  48–72 h) · spend >1,5× ceny produktu bez ATC · CPM spike >40% d/d · Account Quality.
- Świeże konto: **spokojny start bez skoków wydatków** (mikro-wydatek kilka dni) — „warm-up"
  jako rytuał to mit, ale skok 0→duży budżet pierwszego dnia = klasyczny fraud-trigger.
  Konta klientów trzymać w ICH portfolio (ban jednego ≠ ban wszystkich; BM agencyjny czysty).

### 9.4 Automatyzacja (Meta automated rules / MCP)
- WOLNO automatem: reguły OBRONNE (pauza przy spend bez sprzedaży z progiem 1,3–1,5×,
  nie 1,03×), alerty bez akcji, dayparting. Limit 250 reguł/konto; świeże konto = niski
  limit API (spend-based throttling, błąd code 17 → backoff).
- NIE automatem: kill/scale winnera na gołych danych Meta (gubią 20–30% konwersji, a COD
  ma jeszcze confirm-rate — decyzja na danych PLATFORMY), masowa publikacja kreacji bez
  człowieka (ryzyko bana), zmiany cen/budżetów bez zapisanej decyzji Tomka.
- Roll-out zmian na wielu kontach: **canary run na 1 koncie** → dopiero reszta
  (błąd masowy = reputacja BM agencyjnego).

### 9.5 Otwarte punkty [DO DECYZJI TOMKA — noty w wf2_notes 19.07]
1. **Zdarzenie optymalizacji w teście:** §1 mówi twardo Purchase (bridge wyłączony);
   research 2026: przy ~20-25 zł/d/produkt 50 konwersji/tydz. nie osiągniemy nigdy —
   rekomendacja zewnętrzna to optymalizacja na IC/ATC w fazie testu i Purchase dopiero
   na winnerze. Default zostaje wg §1 (Purchase); decyzja może zmienić `optimize_event`.
2. **Tempo skalowania:** §5 „+20%/dzień" vs research „+20% co 3–4 dni, min. 48 h"
   (skok >30% = reset learning). W krokach panelu zapisano ostrożniej: „+20%, odstęp ≥48 h".
   Parametr `daily_increase_pct` w settings — do rozstrzygnięcia.
3. **ROZSTRZYGNIĘTE 19.07 — portfel = 3 produkty** (decyzja Tomka: „mniej roboty wokół tego
   i większy efekt"). §0 i §4.3 przeliczone, `products_count=3` w settings, panel
   PORTFOLIO_TARGET=3. Istniejący portfel rozwojowy (6 szt.) zostaje jako R&D — nowa zasada
   obowiązuje dla kolejnych projektów / kolejnych fal testów.

---

## PARAMETRY (settings, 2 klucze JSON)

`settings.wf2_test_config` (defaulty): test_margin_pct 15 [D] · budget_total 500 [D] ·
products_count 3 [D 19.07; było 5] · gateA_budget_per_product 50 [P] · cp1_spend 50 [P] · cp2_spend 100 [P] ·
min_hours_before_kill 48 [B] · min_impressions_ctr_read 1500 [P] · kill_link_ctr 0.5 [B] ·
healthy_link_ctr 1.0 [B] · kill_cpc_max 3.5 [B] · healthy_cpc_max 2.5 [P] · atc_rate_min 2.0 [B] ·
atc_rate_healthy 5.0 [B] · cost_atc_max 12 [P] · max_test_cpa_mult 1.5 [P] · kill_cpa_mult 4.0 [B] ·
validation_cap_low 120 / mid 180 / high 300 [P] · price_band_low_max 50 / high_min 120 [P] ·
winner_min_orders 5 [D] · winner_spend_floor 200 [P] · slow_grad_orders 3 / slow_grad_spend 300 [P] ·
test_days_min 3 / max 7 [B] · creatives_per_product 4 [D] · campaign_objective OUTCOME_SALES [B] ·
optimize_event PURCHASE [B] · bridge_event "" [P] · audience_mode advantage_broad [B] ·
rolling_window_days 7 [B] · q4_cpm_uplift 40 [B] · shipping_paid_by "client" [D→WYMÓG §3]

`settings.wf2_scale_config`: scale_budget_total 500 [D] · target_roas 2.5 [P] · margin_min 0.30 [P] ·
daily_increase_pct 20 [B] · creative_freq_ceiling 2.0 [P] · retargeting_min_lpv 1000 [P] ·
cpa_scale_mult_est 1.3 [P]

---

## ŹRÓDŁA
PL: kcmobile.pl (CPM/CPC/CTR) · divloy.pl (cennik Meta 2025) · damiannowaczek.pl (budżety 2026) ·
adambakalarz.pl. Metodyka: operatorslibrary.com (Kill or Scale) · ecomparkour.com (ABO/CBO 2025) ·
pigeondigital.com (learning 50 konwersji) · birch/skalestrategy (ASC). Ekonomika: triplewhale.com ·
adamigo.ai. Cross-domain: adamigo.ai · paygate.to · Meta for Business.
