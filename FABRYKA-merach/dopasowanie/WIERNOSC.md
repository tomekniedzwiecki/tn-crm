# WIERNOŚĆ F3A (format maszynowy) — Brzuszek · dopasowanie/

Gate F3A: każda GRAFIKA PRODUKTOWA użyta w kodzie ma wiersz z werdyktem **WIERNOŚĆ ∈ {ZGODNA, REAL, ESKALACJA}**.
`ZGODNA` = 0 FAIL cech + **PASS ≥ K** (K = 9, tabela „Cechy dyskryminujące" w `PASZPORT.md`) + **pass-2 (drugie oczy) = TAK**.
Podstawa merytoryczna = 2 niezależne pary oczu F3A (16/16 PASS, zero flipów) — patrz `../WIERNOSC.md` (pełne uzasadnienia).
Wzorzec prawdy: `galeria/g0-retusz.png`. Rundy = 1 (0 regenów; 1. podejście). Legenda cech (9): 1-Rama A-frame ·
2-Konsola LCD · 3-U-wałek · 4-2 wałki boczne · 5-Linki+uchwyty · 6-Podstawa/poprzeczki · 7-Brand (0× MERACH) ·
8-Kolor (biało-różowy) · 9-Świat (chłodna lila-mgła). Sceny z osobą: 9-Świat ↔ Anatomia (klęk na U-wałku), obie PASS.

| grafika | klasa | cechy (K=9, PASS/FAIL) | rundy | pass-2 | WIERNOŚĆ |
|---|---|---|---|---|---|
| sc-hero | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Anatomia PASS | 1 | TAK (2. para: klęk obiema kolanami na U-wałku, twarz odwrócona, 9/9 cech) | WIERNOŚĆ: ZGODNA |
| sc-hero-800 | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Anatomia PASS | 1 | TAK (resize sc-hero — identyczny kadr, komplet cech) | WIERNOŚĆ: ZGODNA |
| sc-hero-mobile | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Anatomia PASS | 1 | TAK (2. para: ta sama poza/świat w kadrze pionowym, komplet cech) | WIERNOŚĆ: ZGODNA |
| packshot-alpha | P | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Świat PASS | 1 | TAK (2. para: wierny g0-retusz alpha; łaty retuszu odziedziczone z wzorca — kosmetyka, 0 FAIL cech) | WIERNOŚĆ: ZGODNA |
| packshot-thumb | P | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Świat PASS | 1 | TAK (downscale packshot-alpha — te same cechy konstrukcyjne) | WIERNOŚĆ: ZGODNA |
| sc-reg-side | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Świat PASS | 1 | TAK (2. para: najwierniejszy render izolowany, zero napisów) | WIERNOŚĆ: ZGODNA |
| sc-partie-core | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Anatomia PASS | 1 | TAK (2. para: crunch, klęk na U-wałku, świat=makieta 06) | WIERNOŚĆ: ZGODNA |
| sc-partie-glute | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Anatomia PASS | 1 | TAK (2. para: side leg raise zgodny z g4/paszportem) | WIERNOŚĆ: ZGODNA |
| sc-partie-arms | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Anatomia PASS | 1 | TAK borderline (2. para: produkt wierny, poza zgodna z makietą 06; stopa przy U-wałku = najsłabsza poza, 0 FAIL cech) | WIERNOŚĆ: ZGODNA |
| sc-partie-legs | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Świat PASS | 1 | TAK (2. para: czysty detal podstawy BEZ stopy, komplet cech) | WIERNOŚĆ: ZGODNA |
| sc-wytrz-detal | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Świat PASS | 1 | TAK (2. para: niski 3/4 ramy, izolacja, wierny komplet) | WIERNOŚĆ: ZGODNA |
| sc-sklad-rozloz | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Anatomia PASS | 1 | TAK (2. para: klęk na podłodze, dłoń na mechanizmie, świat=makieta 09) | WIERNOŚĆ: ZGODNA |
| sc-sklad-zloz | S | 1-Rama PASS · 2-LCD PASS · 3-U-wałek PASS · 4-2wałki PASS · 5-Linki PASS · 6-Podstawa PASS · 7-Brand PASS · 8-Kolor PASS · 9-Świat PASS | 1 | TAK (2. para: złożona rama oparta o kanapę — alternatywa S, główny wizual = UGC) | WIERNOŚĆ: ZGODNA |
| ugc-2-0-retusz | R | realny kadr kupującego (2-0.webp) — MERACH+naklejki wyretuszowane (cv2 inpaint) | 1 | TAK (autentyk „zdjęcie od kupującego"; residua retuszu kosmetyczne, 0 brandu) | WIERNOŚĆ: REAL |
| det-konsola | R | crop g0-retusz (LCD+przycisk+2 wałki+kierownica) | 1 | TAK (crop realnego wzorca) | WIERNOŚĆ: REAL |
| det-uwalek | R | crop g0-retusz (U-wałek na wózku) | 1 | TAK (crop realnego wzorca) | WIERNOŚĆ: REAL |
| det-podstawa | R | crop g0-retusz (poprzeczka T + szare końcówki) | 1 | TAK (crop realnego wzorca) | WIERNOŚĆ: REAL |
| det-linki | R | crop g0-retusz (linki + czarne piankowe uchwyty) | 1 | TAK (crop realnego wzorca) | WIERNOŚĆ: REAL |

**Werdykt F3A: 18/18 grafik ZGODNA/REAL — 0 FAIL cech PRODUKTU, 0 ESKALACJI, rundy=1.**
Pełne, opisowe uzasadnienia obu par oczu + 3 najsłabsze rzeczy kompletu: `FABRYKA-merach/WIERNOSC.md`.
