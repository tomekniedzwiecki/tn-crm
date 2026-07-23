# WIERNOŚĆ PRODUKTU — ROZGRZEWEK F3A (dowód gate'u „2 pary oczu") · 23.07

Kanon wyglądu: `galeria/g0.webp` (packshot granat — REAL) + tabela cech `PASZPORT.md`
(8 cech dyskryminujących). Wariant **wyłącznie GRANATOWY (Blue)**. Dwie niezależne pary oczu
(pass-1 = wykonawca F3; pass-2 = świeży Sonnet, werdykty 1. pary czytane dopiero po wydaniu
własnych). Pełna narracja obu par — niżej. Ta tabela = maszynowy werdykt per GRAFIKA użyta w kodzie.

## Werdykt końcowy per grafika (obie pary oczu zgodne) — cechy z PASZPORT §Cechy dyskryminujące
| grafika (asset) | grzybek | bolce+czerw.LED | panel „9"+diody | kołnierz | faktura kopuły | czysty brand | spójny granat | świat/kadr | WIERNOŚĆ |
|---|---|---|---|---|---|---|---|---|---|
| sc-hero | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (nośnik ruchu: kubek+para+lampa prawa krawędź; produkt statyczny centralny) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-hero-mobile | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (portret; kubek+para+lampa prawa krawędź) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-final | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (leży na stoliku; kubek+koc+lampa+firanka nośnik anim #3; pusta przestrzeń na tekst) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-final-mobile | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (portret; jw.) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| packshot-alpha | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (izolowany granat, keying czysty; alpha 42.7/55.4/1.8) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-moment | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (kobieta pod kocem, lampa+kubek+świeca; twarz nieeksponowana) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-autonomia | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS (produkt na stoliku przy lampie; BRAK portu/kabla) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| glowica-head | PASS | PASS | PASS (n/d — makro głowicy) | PASS | PASS | PASS | PASS | PASS (realny crop g0, upscale 2.2×, ZERO generacji) | WIERNOŚĆ: REAL (kadr g0 — kanon) |
| tryby-panel | PASS (n/d — crop panelu) | PASS (n/d) | PASS | PASS | PASS (n/d) | PASS | PASS | PASS (realny crop g0: wyświetlacz „9"+3 diody+2 przyciski) | WIERNOŚĆ: REAL (kadr g0 — kanon) |

> ZGODNA = 0 FAIL cech + komplet 8/8 PASS (K z PASZPORT) + pass-2 (drugie oczy) TAK. REAL = realny
> crop g0 (bez generacji) → wierność z definicji. `glowica-head`/`tryby-panel` = klasa R (dowodowa).

## Checklista dyskryminująca (PASZPORT §F3A) — wynik zbiorczy
| Cecha | Wymóg | Sceny generowane (S) | Crop-first (R/P) |
|---|---|---|---|
| Kształt „grzybka" | wydłużona rączka + pękata główka szersza od rączki | PASS wszystkie | PASS |
| Główka z bolcami | chromowane kulkowe bolce w koncentrycznych pierścieniach | PASS (kulki + centralny) | PASS glowica-head |
| Czerwony LED w główce | czerwona poświata między bolcami | PASS widoczna | PASS (g0 + UGC 5-1) |
| Panel na rączce | okrągły wyświetlacz „9" + 3 diody + 2 przyciski | PASS | PASS tryby-panel |
| Kołnierz | metalowy szampański pierścień na styku | PASS | PASS |
| Faktura główki | pionowe prążki na bokach kopuły | PASS | PASS |
| Czystość brandu | zero napisów/logo na urządzeniu | PASS (NEG „no printed brand") | PASS |
| Spójny kolor | JEDEN wariant = granat | PASS (zero białego/kość/szaro-różowego) | PASS |

**1. para oczu (wykonawca F3):** 12/12 scen PASS, 0 regenów. Kanał: local `/v1/images/edits`
gpt-image-2 HIGH (multi-ref = obiekty-pliki), fallback edge `wf2-gen` MEDIUM przy HTTP 520.

## ⚠️ WERDYKT „21" (warunek wykonawczy głowicy) — DLA F4 WIĄŻĄCY
W g0 **nie ma czystego frontalu głowicy** — jedyny kadr face-on (`head-face`) jest przechylony ~30°:
policzenie kulek daje **~19–22 (niejednoznacznie), nie pewne 21**. UGC `5-1` daje ten sam wynik.
**→ F4 ŁAGODZI:** NIE wypalać dużej typograficznej „21" ani count-upu; H2 = „Stalowe kulki w
koncentrycznych pierścieniach". „21" dozwolone WYŁĄCZNIE jako zdanie w body (fakt z infografiki g3),
NIGDY „policz na zdjęciu". Crop `glowica-head` wiernie dowodzi konstrukcji pierścieniowej + czerw. LED.

## F3A — 2. para oczu (świeży Sonnet, niezależnie) — 18/18 ZGODNE, zero FAIL
Porównanie ze wzorcem `galeria/g0.webp` (wyłącznie granatowy egzemplarz). Keying packshotu
zweryfikowany kompozytem na tle ciemnym/jasnym/brzoskwiniowym + statystyką alpha (0=42.7% ·
255=55.4% · AA 1–254=1.8% → czysty). UGC pobrane ze Storage i obejrzane realnie (nie puste).
Zero sporów PASS/FAIL z 1. parą. 3 najsłabsze (kosmetyka, nie regen):
1. `sc-obszary-shoulder` — chwyt za głowicę zamiast rączki (najsłabsze ergonomicznie; nie-krytyczne).
2. `sc-final` d/m — cyfra wyświetlacza słabo czytelna / niespójna z „9" (produkt poziomy; kosmetyka).
3. Wahanie odcienia kołnierza srebro↔szampańskie złoto między scenami (g0 = złoto; spec dopuszcza).

## Sceny do REGENERACJI
**Brak.** Żadna scena nie łamie paszportu — regeneracja niewskazana. Uwagi wyżej to kosmetyka dla F4.

## Odstępstwa / noty dla F4
- `tryby-panel`: etykiety trybów i podświetlenie AKTYWNEGO wskaźnika = KODOWO (TOR-I), nie w grafice.
- `packshot-alpha`: jeden izolowany granat obsługuje sloty mid-cta/checkout/sticky (P0-dedup: hero
  używa scen `sc-hero`; tryby → `tryby-panel`; autonomia → `sc-autonomia`).
- Sceny mobilne obszarów: wspólny kadr 4:5 → 1 plik obsługuje d+m (koszt-świadomie).
