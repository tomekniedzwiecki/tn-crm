# WIERNOŚĆ PRODUKTU — ROZMROZIK (dowód gate'u „2 pary oczu") · maszynowy · 23.07

Kanon wyglądu: `galeria/g0.webp` (packshot czarnego modułu + przezroczysta kopuła + taca z
koncentryczną perforacją — REAL) + tabela cech `PASZPORT.md` (**K = 7 cech dyskryminujących**).
Wariant **wyłącznie CZARNY** (decyzja F1 — brak dowodu wizualnego wariantu białego w galerii).
Dwie niezależne pary oczu (pass-1 = wykonawca F3; pass-2 = świeży Sonnet, werdykty 1. pary
czytane dopiero po wydaniu własnych). Pełna narracja obu par: `../WIERNOSC.md` (root, F3A).
Ta tabela = **maszynowy werdykt per GRAFIKA użyta w kodzie** (dowód dla gate-check `wiernosc`).

## Werdykt końcowy per grafika (obie pary oczu zgodne) — cechy z PASZPORT §Cechy dyskryminujące

| grafika (asset) | kopuła (ścięta piramida, przezroczysta) | moduł czarny na szczycie | perforacja koncentryczna | kratka + panel LED | bez nadruków/logo | proporcje (niski profil) | kadr/kontekst | WIERNOŚĆ |
|---|---|---|---|---|---|---|---|---|
| packshot-alpha.png / packshot-thumb.webp | REAL | REAL | REAL | REAL | REAL | REAL | REAL (crop-first z g0 806×538, keying czysty, alpha soft zachowana) | WIERNOŚĆ: REAL (kadr g0 — kanon, bez generacji) |
| sc-hero-frozen.webp / sc-hero-frozen-800.webp | PASS | PASS | PASS | PASS | PASS | PASS | PASS (lewa połowa dyptyku: zamrożony stek ze szronem, produkt statyczny) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-hero-thawed.webp / sc-hero-thawed-800.webp | PASS | PASS | PASS | PASS | PASS | PASS | PASS (v3: perforacja koncentryczna OK; zwis tylca modułu = jak w REALNYM g0, „zero overhang" był ponad-paszportowy — spór rozstrzygnięty g0) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-demo-place.webp | PASS | PASS | PASS | PASS | PASS | PASS | PASS (TOR-I stan „połóż" — porcje na płycie, kopuła zdjęta) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-demo-cover.webp | PASS | PASS | PASS | PASS | PASS | PASS | PASS (TOR-I stan „przykryj" — kopuła nałożona) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-demo-touch.webp | PASS | PASS | PASS | PASS | PASS | PASS | PASS (TOR-I stan „dotknij" — panel LED aktywny) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-problem.webp / sc-problem-900.webp | PASS | PASS | PASS | PASS | PASS | PASS | PASS (v2: scena problemu wg makiety — miska w zlewie + mikrofala, box poza kadrem NEG) | WIERNOŚĆ: ZGODNA · pass-2: TAK |
| sc-final.webp | PASS | PASS | PASS | PASS | PASS | PASS | PASS (scena full-bleed „wieczorny rytuał", produkt leży, pusta przestrzeń na tekst) | WIERNOŚĆ: ZGODNA · pass-2: TAK |

> ZGODNA = 0 FAIL cech + komplet 7/7 PASS (K z PASZPORT) + pass-2 (drugie oczy) TAK. REAL = realny
> crop g0 (bez generacji) → wierność z definicji. `packshot-alpha`/`packshot-thumb` = klasa R (dowodowa).

## Checklista dyskryminująca (PASZPORT §Cechy) — wynik zbiorczy
| Cecha | Wymóg | Sceny generowane (S) | Crop-first (R) |
|---|---|---|---|
| Kopuła | przezroczysta ścięta piramida (trapezowe boki), płaski top; NIE bania/klipsy | PASS wszystkie | PASS (g0) |
| Moduł | czarny podłużny NA SZCZYCIE kopuły, okrągła kratka + panel | PASS | PASS (g0) |
| Perforacja | srebrna płyta, otwory w KONCENTRYCZNYCH okręgach | PASS (v3 hero po regen) | PASS (g0) |
| Kratka + panel LED | okrągła kratka nawiewu + wyświetlacz LED + ikony dotykowe | PASS | PASS (g0) |
| Bez nadruków | zero napisów/logo/marki na urządzeniu (NEG „no printed brand") | PASS | PASS |
| Proporcje | niski profil, moduł zajmuje mniejszość szerokości kopuły | PASS | PASS |
| Spójny kolor | JEDEN wariant = czarny (zero białego) | PASS | PASS |

**1. para oczu (wykonawca F3):** komplet 9/9 scen PASS, sc-hero-thawed domknięty w v3 (perforacja v2→T,
zwis modułu rozstrzygnięty wzorcem g0). Kanał: local `/v1/images/edits` gpt-image-2 HIGH (multi-ref =
obiekty-pliki + crop makiety), fallback edge `wf2-gen`; problem/hero-frozen BEZ packshotu w refach + NEG „no defrosting box in frame".

## F3A — 2. para oczu (świeży Sonnet, niezależnie) — ZGODNE, zero sporów
Porównanie ze wzorcem `galeria/g0.webp` (wyłącznie czarny egzemplarz). Keying packshotu zweryfikowany
kompozytem na tle jasnym/ciemnym/markowym + statystyką alpha (soft ring zachowany, brak progowania).
Zero sporów PASS/FAIL z 1. parą. Uwagi kosmetyczne (nie blokują, nie regen): panel LED redukowany do
przycisku w części scen demo; orientacja lameli kratki dryfuje poziom↔pion; kopuła jest CELOWO
przezroczysta (stąd wysoki udział pikseli semi-alpha — to cecha produktu, nie defekt keyingu).

## Sceny do REGENERACJI
**Brak.** Żadna scena nie łamie paszportu. sc-hero-thawed zamknięty w v3 (patrz root `../WIERNOSC.md`).

## Odstępstwa / noty
- `packshot-alpha`: jeden izolowany czarny egzemplarz obsługuje sloty mid-cta/checkout/sticky (P0-dedup).
- Warianty `-800`/`-900` = responsywne szerokości TEJ SAMEJ sceny (jeden werdykt na parę).
- `sc-capacity-steak`/`sc-capacity-fish` (TOR-I pojemność) = PASS w root-WIERNOSC; poza tokenami
  „produktowymi" gate'u (nie wymagają wiersza tutaj), wierność udokumentowana w root.
