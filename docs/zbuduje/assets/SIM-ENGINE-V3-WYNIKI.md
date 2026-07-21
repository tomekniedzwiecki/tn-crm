# SIM-ENGINE-V3 — WYNIKI symulacji silnika CENY 3.0

> Monte Carlo, 500 przebiegów/scenariusz, horyzont 120 dni, 1 decyzja/dzień.
> Wierny port `wf2-price-engine/index.ts` (decideProduct/routeUp/collapseCheck/
> scaleBase/autoReasonBlock/pipeline §2e) + config v3.1 §8. Kontrybucja = PRAWDZIWY
> P&L z haircutem COD (dostarczone×unit_profit − nieodebrane×30 zł − spend).
> Budżet reklamowy EGZOGENNY i identyczny dla wszystkich polityk (izoluje decyzje CENOWE).

## (a) Tabela: scenariusz → wynik

| # | Scenariusz | Kontryb. silnik | Baseline | Oracle | Δ vs base | % oracle | Zmian | Rollb. | Kart | Cena fin. | Opt. | Faza fin. |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | Zwycięzca elastyczny (opt≈start) | 135 | 251 | 215 | -117 | 63% | 1.4 | 0.37 | 1.8 | 99.90 | 89.90 | RAMP |
| 2 | Zwycięzca nieelastyczny (opt +40%) | 815 | 251 | 1167 | +564 | 70% | 1.3 | 0.29 | 1.8 | 99.90 | 134.90 | RAMP |
| 3 | Zwycięzca + twardy klif 100 zł | 737 | 251 | 916 | +485 | 80% | 1.3 | 0.30 | 1.8 | 99.90 | 99.90 | RAMP |
| 4 | COD-heavy 70% z nieodbiorami | 1032 | 352 | 1056 | +680 | 98% | 1.1 | 0.05 | 2.0 | 99.90 | 99.90 | RAMP |
| 5 | Produkt martwy (λ→0) | -9275 | -9261 | -9226 | -14 | nan% | 0.0 | 0.00 | 0.0 | 89.90 | 99.90 | START |
| 6 | Wolno startujący (λ rośnie po 2 tyg.) | 257 | -51 | 533 | +308 | 48% | 1.3 | 0.33 | 1.8 | 99.90 | 99.90 | RAMP |
| 7 | Prawdziwy collapse po podwyżce | 4821 | 5322 | 6297 | -501 | 77% | 1.9 | 0.91 | 1.3 | 109.90 | 129.90 | START |
| 8 | Fałszywy collapse (learning+weekend, popyt OK) | 3516 | 1270 | 25324 | +2246 | 14% | 1.2 | 0.20 | 1.8 | 99.90 | 229.00 | RAMP |
| 9 | Dane dziurawe (ads brak 5 dni w środku) | 586 | 254 | 868 | +333 | 68% | 4.3 | 1.03 | 5.2 | 104.90 | 99.90 | RAMP |
| 10 |  Tryb no-ads cały czas (bez tokena Meta) | 1829 | 2227 | 2355 | -399 | 78% | 28.3 | 0.00 | 28.4 | 299.00 | 99.90 | START |
| 11 |  Konkurent tnie cenę w dniu 30 | -2775 | -3097 | -2632 | +322 | nan% | 1.3 | 0.31 | 1.8 | 99.90 | 99.90 | RAMP |
| 12 |  Tomek nie klika kart 7 dni | 662 | 251 | 916 | +411 | 72% | 1.4 | 0.37 | 1.7 | 99.90 | 99.90 | RAMP |

### Flagi patologii (udział przebiegów)

| # | Scenariusz | Oscylacja | Cena < floor marży | Zmiana < 5 zam. | Zam. przy 1. zmianie (mediana) |
|---|---|---:|---:|---:|---:|
| 1 | Zwycięzca elastyczny (opt≈start) | 0% | 0% | 1% | 12 |
| 2 | Zwycięzca nieelastyczny (opt +40%) | 0% | 0% | 1% | 12 |
| 3 | Zwycięzca + twardy klif 100 zł | 0% | 0% | 1% | 12 |
| 4 | COD-heavy 70% z nieodbiorami | 0% | 0% | 0% | 14 |
| 5 | Produkt martwy (λ→0) | 0% | 0% | 0% | — |
| 6 | Wolno startujący (λ rośnie po 2 tyg.) | 0% | 0% | 0% | 39 |
| 7 | Prawdziwy collapse po podwyżce | 0% | 0% | 1% | 12 |
| 8 | Fałszywy collapse (learning+weekend, popyt OK) | 0% | 0% | 0% | 13 |
| 9 | Dane dziurawe (ads brak 5 dni w środku) | 16% | 0% | 1% | 12 |
| 10 |  Tryb no-ads cały czas (bez tokena Meta) | 0% | 0% | 0% | 6 |
| 11 |  Konkurent tnie cenę w dniu 30 | 0% | 0% | 1% | 12 |
| 12 |  Tomek nie klika kart 7 dni | 1% | 0% | 0% | 20 |

### Dni w fazach (średnia)

| # | Scenariusz | START | RAMP | BASE | PROBE | HARVEST | LOCKED |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 | Zwycięzca elastyczny (opt≈start) | 48 | 72 | 0 | 0 | 0 | 0 |
| 2 | Zwycięzca nieelastyczny (opt +40%) | 40 | 80 | 0 | 0 | 0 | 0 |
| 3 | Zwycięzca + twardy klif 100 zł | 41 | 79 | 0 | 0 | 0 | 0 |
| 4 | COD-heavy 70% z nieodbiorami | 17 | 103 | 0 | 0 | 0 | 0 |
| 5 | Produkt martwy (λ→0) | 120 | 0 | 0 | 0 | 0 | 0 |
| 6 | Wolno startujący (λ rośnie po 2 tyg.) | 55 | 65 | 0 | 0 | 0 | 0 |
| 7 | Prawdziwy collapse po podwyżce | 104 | 16 | 0 | 0 | 0 | 0 |
| 8 | Fałszywy collapse (learning+weekend, popyt OK) | 31 | 89 | 0 | 0 | 0 | 0 |
| 9 | Dane dziurawe (ads brak 5 dni w środku) | 42 | 50 | 14 | 14 | 0 | 0 |
| 10 |  Tryb no-ads cały czas (bez tokena Meta) | 120 | 0 | 0 | 0 | 0 | 0 |
| 11 |  Konkurent tnie cenę w dniu 30 | 42 | 78 | 0 | 0 | 0 | 0 |
| 12 |  Tomek nie klika kart 7 dni | 51 | 69 | 0 | 0 | 0 | 0 |

## Scenariusz 13: NOWY twardy próg 5 zamówień vs obecne 3

| Produkt | Próg | Kontrybucja | Zmiana < 5 zam. | Zmian | Rollbacki |
|---|---:|---:|---:|---:|---:|
| wysokie CPA, dobry ATC | 3 | -6389 | 56% | 1.2 | 0.24 |
| wysokie CPA, dobry ATC | 5 | -6415 | 0% | 1.3 | 0.30 |
| elastyczny CR | 3 | 1963 | 1% | 1.3 | 0.28 |
| elastyczny CR | 5 | 1963 | 0% | 1.3 | 0.28 |
| standard winner | 3 | 1937 | 1% | 1.2 | 0.21 |
| standard winner | 5 | 1937 | 0% | 1.2 | 0.21 |

---

## (b) WNIOSKI — co silnik robi DOBRZE

- **Bramka WINNER + karta START→RAMP = realna ochrona.** Produkt martwy (5) daje 0 zmian — CP2 (koszt/ATC) odsiewa go poprawnie. Genuine winners (2,4,6) awansują i biją baseline (nieelastyczny +564, COD-heavy +680, wolno-startujący +308).
- **Wall = klif → parkowanie pod ścianą chroni.** Scen. 3 (klif dokładnie na 100): silnik parkuje na 99,90 = optimum, NIE przebija klifu. Zbieżność ściany psychologicznej z klifem cenowym daje darmową ochronę.
- **Auto-rollback collapse DZIAŁA jako siatka bezpieczeństwa.** Scen. 7 (prawdziwy collapse): 91% przebiegów wykrywa załamanie i wraca do ceny sprzed podwyżki + lock.
- **COD-heavy = propose-only + brak auto-rollbacku.** Scen. 4: rollbacki 0,05 (kod pomija auto-rollback gdy codH), awanse kartą. Ostrożność zgodna z SSOT.
- **Egzogenny spadek popytu (konkurent, scen. 11) NIE wywołuje paniki** — collapse jest aktywny tylko ≤8 dni po podwyżce, więc cięcie konkurenta w dniu 30 nie jest mylnie czytane jako collapse. Silnik trzyma cenę (Δ vs baseline +322).
- **Twardy próg 5 zamówień: praktycznie DARMOWY.** Scen. 13 — dla prawdziwych winnerów próg 3 vs 5 daje IDENTYCZNY wynik (winner i tak pada przy ≥5 zam.).

## (c) LISTA POPRAWEK — priorytety

### P1 (krytyczne — realne straty vs baseline „nic nie rob”)
1. **Tryb NO-ADS = niekontrolowany ratchet (scen. 10).** Bez tokena Meta silnik windował cenę 299 zł (28 zmian!) przy optimum 100 — kontrybucja 1829 < baseline 2227 (Δ -399). Ścieżka `propose_no_ads` nie ma: cooldownu, sprawdzenia ściany, ani hamulca elastyczności. **FIX:** (a) twardy cap liczby podwyżek no-ads (np. 1 szczebel / `cod_cooldown_days`), (b) `wall_cross` też blokuje no-ads, (c) STOP po N szczeblach bez wzrostu przychodu (przychód spada → nie proponuj dalej). Klucz: `no_ads_max_steps` + cooldown w `propose_no_ads`.
2. **Uncapped RAMP-do-ściany = overshoot i collapse (scen. 7).** Karta winnera liczy `rampTarget` BEZ capu `auto_step_max_pct` — skok 109,90→149,90 (+36%) przez klif 130 → collapse → rollback. Round-trip: Δ vs baseline -501 (GORZEJ niż nic). **FIX:** clamp `rampTarget` capem `auto_step_max_pct` (albo osobnym `ramp_max_step_pct`); przy dużym dystansie do ściany rób RAMP W DWÓCH krokach, nie jednym skokiem pod ścianę.
### P2 (istotne — stabilność / martwe reżimy)
3. **Reżimy BASE/PROBE/HARVEST/LOCKED są praktycznie NIEOSIĄGALNE dla portfela niskokosztowego (wszystkie 12 scenariuszy kończą w RAMP/START).** Przyczyny łańcuchowe: (a) RAMP parkuje tuż pod ścianą (99,90); (b) `scale_base.targetPrice` = cena przy marży 40% = `cost/0,58` ≈ 88 zł — PONIŻEJ ceny RAMP → `sb.base ≤ price` → wieczny `hold_ramp`; (c) gdy `viable_floor > ceiling` (CPA vs marża przeżycia pod ścianą 100) → `flag` zamiast ruchu. **FIX:** `scale_base.ceiling` nie powinien być zaklinowany na NAJBLIŻSZEJ ścianie nad ceną, gdy popyt nad ścianą jest zdrowy — dopuść PROBE ponad ścianę jako świadomą kartę zamiast `hold`. Alternatywnie: po RAMP przejdź od razu do PROBE (probe +15–20% od ceny RAMP), pomijając martwy BASE. Bez tego cała maszyneria BASE→PROBE→HARVEST to dead code.
4. **Dziury w danych ads destabilizują silnik (scen. 9): 4.3 zmian, rollbacki 1.03, OSCYLACJA 16%.** 5-dniowa luka przełącza tryb na no-ads (ratchet) + psuje baseline collapse (spend≈0 w oknie). **FIX:** wykrywaj LUKĘ (spend=0 przez ≥2 dni w środku okna) i traktuj jako `hold_dq`, nie jako no-ads; collapse: odrzuć okna z niekompletnym spendem (już jest normalizacja spendem, ale luka zeruje baseSpend/tempo).
5. **Collapse ma ~20% FAŁSZYWYCH trafień na świeżym ad secie (scen. 8, popyt ~nieelastyczny, a rollbacki 0.20).** `learning_grace 3` wyklucza learning dip, ale weekend + szum Poissona przy MAŁEJ próbie baseline (mierzonej na TEST-spendzie 40 zł/d, tuż przed skokiem budżetu do 90) nadal trąca q10. **FIX:** (a) mierz baseline collapse na tym samym poziomie spendu co post (albo waż wariancją), (b) podnieś `collapse_min_expected` z 5 do 8–10, (c) wymagaj naruszenia q10 w 2 runach ORAZ minimalnego względnego spadku (np. observed < 0,6×expected), nie tylko q10.
### P3 (dostrojenie — pozostawiony zysk / próg 5)
6. **Elastyczne winnery są KRZYWDZONE przez jednokierunkowy ratchet RAMP (scen. 1): Δ vs baseline -117.** Podwyżka do RAMP redukuje kontrybucję, a jedyny hamulec (collapse q10) łapie tylko KATASTROFY, nie łagodne straty 10–20%. W RAMP nie ma bramki keep_frac/MER (jest dopiero w PROBE, nieosiągalnym). **FIX:** dodaj po-RAMP kontrolę kontrybucji/zł (jak keep_frac w PROBE) z auto-obniżką KARTĄ, gdy przychód/kontrybucja spada mimo braku collapse.
7. **PRZYJĄĆ twardy próg 5 zamówień (winner_orders 3→5, ramp_orders 3→5).** Scen. 13: przy `winner_orders=3` produkt wysoko-CPA (dobry ATC, 3 zam. = szum) awansuje w **56%** przebiegów przy <5 zam. (łamie wymóg Tomka); `=5` → **0%** przy ZEROWEJ zmianie wyniku prawdziwych winnerów. To poprawka bez kosztu. `winner_high_confidence_orders` (już 5) staje się progiem bazowym.
8. **Latencja kart (scen. 12, Tomek 7 dni): Δ vs baseline +411 (vs +485 przy 2 dniach).** Karty nie-winnerowe z `proposal_ttl_days=7` i akceptem w dniu 7 WYGASAJĄ zanim się wykonają (kolizja expiry==delay). **FIX:** `proposal_ttl_days` ≥ 10–14 (> realny czas reakcji), albo karty cenowe wykonawcze NIE wygasają automatycznie (jak `winner_reco`).
### P4 (audyt — luki w kodzie wykryte przy porcie)
9. **`rollback_lock` i `cooldown` są omijane przez karty.** W `autoReasonBlock` `wall_cross` zwraca się PRZED `cooldown`/`rollback_lock`, a wykonanie zaakceptowanej karty (sweep→executeUp/Down) NIE sprawdza locka/cooldownu ponownie — akcept karty przebija oba guardraile. To nie eksplodowało w symulacji tylko dzięki DEDUP (klucz wykonanej karty blokuje rekreację), ale to przypadek, nie projekt. **FIX:** sprawdzaj `rollback_lock_until`/`cooldown` w momencie WYKONANIA karty, nie tylko przy jej tworzeniu.
10. **COD-heavy `rollback` jest GUBIONY.** Gdy `col.state=='rollback'` ORAZ `codH`, warunek `col.state==='rollback' && !codH` nie wchodzi, a dalsze `if`-y collapse też nie — produkt COD-heavy w prawdziwym collapse NIE dostaje ani auto-rollbacku, ani karty rollback (przechodzi do reguł reżimowych). **FIX:** dla `codH` w stanie `rollback` emituj KARTĘ `rollback` (jak dla `weak`), zamiast milczącego przejścia dalej.
11. **Freeze po rollbacku (dedup permanentny).** Po auto-rollbacku do START karta `winner_reco` (klucz bez poziomu) jest juz zuzyta, NIGDY nie wraca, produkt zostaje zamrozony na starej cenie, bez ponowienia proby (scen. 7). Chroni przed oscylacja, ale to skutek uboczny. **FIX:** świadoma decyzja — albo pozwól winnerowi wrócić po `decision_ttl_days` z podniesioną poprzeczką, albo udokumentuj freeze jako celowy.

## Metodyka / ograniczenia

- Budżet reklamowy EGZOGENNY (test 40 zł/d → skala 90 zł/d w dniu 14), identyczny dla wszystkich polityk — izoluje decyzje CENOWE od decyzji budżetowych.
- Oracle = statyczna cena maksymalizująca oczekiwany dzienny P&L (siatka 1 zł), luźna górna granica; dla scen. 8 (bardzo nieelastyczny) optimum ucieka do sufitu siatki — % oracle tam bez sensu (patrz kolumna).
- Popyt: LPV~Poisson(spend/CPC), ATC~Binom(LPV, atc_rate), zam.~Binom(ATC, checkout(P)); checkout(P) = elastyczność stałej eps + klif ×mult powyżej progu; weekend −20%, learning dip −30% (3 dni świeżego ad setu), COD pasma 0,92/0,85/0,78/0,70, lag rozliczenia COD 14–28 dni.