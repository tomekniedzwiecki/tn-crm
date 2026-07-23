# WIERNOSC — F3 sceny produkcyjne Rozgrzewek (gate F3A → lp_grafiki) · 23.07

Dowód gate'u wierności paszportowej dla KAŻDEJ sceny/assetu F3. Wariant **wyłącznie GRANATOWY
(Blue)**. Kanon: `PASZPORT.md` (grzybek · 21 stalowych kulek w koncentrycznych pierścieniach ·
czerwony LED · okrągły wyświetlacz 1–9 + 3 diody · szampański kołnierz · granatowy korpus) +
`PRZEWODNIK-GRAFICZNY.md` (NEG wspólny, KLAUZULE, anty-dryf tła) + LEDGER „DECYZJE POKRYTYKOWE".

Kanał: local `/v1/images/edits` gpt-image-2 **HIGH** (multi-ref = obiekty-pliki, nie stringi) z
fallbackiem edge `wf2-gen` **MEDIUM** przy HTTP 520. Refy per scena: `navy-whole` (panel/kołnierz)
+ `head-face` (21 kulek + czerwony LED) + `ref-<scena>` (kompozycja/światło z ZAAKCEPTOWANEJ makiety).
**1. para oczu = wykonawca F3; wynik: 12/12 scen PASS, 0 regenów.**

## Checklista dyskryminująca (PASZPORT §F3A) — wynik zbiorczy
| Cecha | Wymóg | Sceny generowane (12) | Crop-first (R/P) |
|---|---|---|---|
| Kształt „grzybka" | wydłużona rączka + pękata główka szersza od rączki | ✅ wszystkie | ✅ |
| Główka z bolcami | chromowane kulkowe bolce w koncentrycznych pierścieniach | ✅ (kulki + centralny) | ✅ glowica-head |
| Czerwony LED w główce | czerwona poświata między bolcami | ✅ widoczna | ✅ (g0 + UGC 5-1) |
| Panel na rączce | okrągły wyświetlacz LED „9" + 3 diody (czerw/nieb/ziel) + 2 przyciski | ✅ | ✅ tryby-panel |
| Kołnierz | metalowy szampański pierścień na styku | ✅ | ✅ |
| Faktura główki | pionowe prążki na bokach kopuły | ✅ | ✅ |
| Czystość brandu | zero napisów/logo na urządzeniu | ✅ (NEG „no printed brand") | ✅ |
| Spójny kolor | JEDEN wariant = granat | ✅ zero wariantu białego/kość/szaro-różowego | ✅ |
| Świat | kobieta 30–55, wieczór, koc/kubek/lampa; ZERO spa/kitli/kliniki | ✅ | n/d |
| Anatomia dłoni | proste nadgarstki, naturalny chwyt, brak twarzy | ✅ (5 scen z osobą) | n/d |
| Tło | muszla-brzoskwinia ciepła; NIGDY len/pudrowy róż/lila | ✅ | n/d |

## Werdykty per scena
| ID (asset) | Typ | Wierność | Świat / anatomia | Werdykt |
|---|---|---|---|---|
| `sc-hero` (d) | S · 3:2 | grzybek+panel„9"+kulki+czerw.LED+kołnierz ✓ | **nośnik ruchu WYSTAWIONY**: rozmyty kubek + pojedyncza smuga pary + poświata lampy przy PRAWEJ krawędzi; produkt statyczny, centralny na polu #F3E9E3 | **PASS** |
| `sc-hero-mobile` (m) | S · 2:3 | ✓ | nośnik ruchu WYSTAWIONY (kubek+para+lampa, prawa krawędź); portret, zapas headroom | **PASS** |
| `sc-moment` (d) | S · 3:2 | ✓ | kobieta na sofie pod kocem, twarz odwrócona/kadr powyżej barków; lampa+kubek+świeca; chwyt naturalny | **PASS** |
| `sc-moment-mobile` (m) | S · 2:3 | ✓ | jw., portret; twarz nieeksponowana | **PASS** |
| `sc-obszary-neck` | S · 2:3 | ✓ | dłoń prowadzi po karku/barku, BRAK twarzy (kadr od tyłu); sweter, ciepła lampa | **PASS** |
| `sc-obszary-shoulder` | S · 2:3 | ✓ | ramię/bark, twarz poza kadrem; świeca/lampa | **PASS** |
| `sc-obszary-back` | S · 2:3 | ✓ | plecy od tyłu, **zasięg naturalny (nie wykręcony)**, ZERO map bólu; loungewear | **PASS** |
| `sc-obszary-thigh` | S · 2:3 | ✓ | udo, siedząca, loungewear; **ZERO ramki anty-cellulit/wyszczuplania/miary/bikini** | **PASS** |
| `sc-autonomia` (d) | S · 3:2 | ✓ | produkt stoi na stoliku przy ciepłej lampie, koc, roślinka; **BRAK portu/kabla** | **PASS** |
| `sc-autonomia-mobile` (m) | S · 2:3 | ✓ | jw., portret | **PASS** |
| `sc-final` (d) | S · 3:2 | ✓ | produkt leży na stoliku, kubek, koc, lampa, **firanka (nośnik anim #3)**; pusta przestrzeń na tekst | **PASS** |
| `sc-final-mobile` (m) | S · 2:3 | ✓ | jw., portret | **PASS** |
| `glowica-head` | R · crop g0 | **21 kulek w pierścieniach + czerwony LED — REALNY crop, ZERO generacji** | n/d | **PASS (patrz nota „21")** |
| `tryby-panel` | R · crop g0 | okrągły wyświetlacz „9" + 3 diody + 2 przyciski + kołnierz — realny detal g0 | n/d | **PASS** |
| `packshot-alpha` | P · derywat 01-hero (alpha) | pełny wierny granat, izolowany (biel/brzoskwinia→alpha) | n/d | **PASS** |
| `ugc-1/2/3` | U · realne opinie | granat jednoznaczny (2× produkt w dłoni + makro głowicy z czerw.LED) | surowe realne (WYJĄTEK ŚWIATA) | **PASS (bramka ≥2 ✓)** |

## Decyzje krytyka F2 — WYKONANE w F3
1. **HERO nośnik ruchu** (najsłabszy punkt makiet — pusty packshot): scena hero d+m dostała rozmyty
   kubek herbaty z pojedynczą smugą pary + ciepłą poświatę lampy przy krawędzi kadru; produkt/LED/
   wyświetlacz statyczne (archetyp D bez przebudowy layoutu). **Zrealizowane, PASS d i m.**
2. **04-glowica = TYLKO crop-first z g0** (`refs-cache/head-face`) — ZERO generacji finalnej głowicy
   (ZAKAZ z LEDGER). Asset `glowica-head` = upscale 2.2× realnego cropu g0.
3. **07-UGC realny z bramką** — vision-gate 10 klatek, 3 granatowe zakwalifikowane (bramka ≥2 → sekcja
   ZOSTAJE); rehost do `assets/ugc/`.

## ⚠️ WERDYKT „21" (warunek wykonawczy glowicy — poprawka 6 LEDGER) — DLA F4 WIĄŻĄCY
W g0 **nie ma czystego frontalu głowicy** — jedyny kadr face-on (`head-face`) jest **przechylony
~30°**: kulki dalszej krawędzi są skrócone perspektywą, a najniższe schodzą na krawędź cropu.
Policzenie na obrazie daje **~19–22 (niejednoznacznie), nie pewne 21**. UGC `5-1` (realna głowica
kupującego) daje ten sam wynik — kąt uniemożliwia pewne 21.
**→ F4 ŁAGODZI (per binding rule): NIE wypalać dużej typograficznej cyfry „21" ani count-upu nad
makrem.** H2 → **„Stalowe kulki w koncentrycznych pierścieniach."** Liczba „21" (fakt z infografiki
g3) dozwolona WYŁĄCZNIE jako zwykłe zdanie w body (spec), NIGDY jako „policz na zdjęciu". Crop
`glowica-head` nadal wiernie dowodzi konstrukcji pierścieniowej + czerwonego LED — mocny dowód „nie
zabawka" bez ryzyka miscountu.

## Odstępstwa / noty dla F4
- `sc-final` (d/m): kompozycja pełnokadrowa; ciężar sceny prawa/dół — F4 kładzie copy wg systemu
  (scrim/kolumna), scena ma ciepłą pustą przestrzeń u góry/lewej.
- `tryby-panel`: etykiety trybów (Ciepło/Wibracje/EMS) i podświetlenie AKTYWNEGO wskaźnika = KODOWO
  (TOR-I), nie w grafice (makieta pokazuje 3 diody równo — kod nie dziedziczy).
- `packshot-alpha`: jeden izolowany granat obsługuje 3 sloty (hero-base/mid-cta/checkout) — $0.
- Sceny mobilne obszarów: karta podaje wspólny kadr 4:5 → 1 plik obsługuje d+m (koszt-świadomie).

## F3A — 2. para oczu (23.07)
Ocena NIEZALEŻNA (werdykty 1. pary czytane DOPIERO po wydaniu własnych). Porównanie ze wzorcem
`galeria/g0.webp` — wzorzec = **wyłącznie granatowy egzemplarz** (obecność wariantu białego/kość
i różowo-szarego w g0 to kolaż, nie błąd scen). Keying packshotu zweryfikowany kompozytem na tle
ciemnym/jasnym/brzoskwiniowym + statystyką alpha (0=42.7% · 255=55.4% · AA 1–254=1.8% → czysty).
UGC pobrane ze Storage i obejrzane realnie (480×874 / 480×960 — nie puste).

### Werdykty per plik (18/18)
| Plik | Werdykt | Zdanie |
|---|---|---|
| `sc-hero` (d) | **PASS** | Granat wierny (wyświetlacz „9" + 3 diody czerw/nieb/ziel, szampański kołnierz, pionowe prążki, rząd kulek + czerwony LED); nośnik ruchu = kubek z parą + poświata lampy WYSTAWIONY przy prawej krawędzi, produkt statyczny centralny; tło brzoskwinia. |
| `sc-hero-mobile` (m) | **PASS** | Jak d, portret; kubek+para+lampa przy prawej krawędzi, produkt centralny; zero tekstu/marki. |
| `sc-moment` (d) | **PASS** | Kobieta ~40, wieczór, koc/kubek/świeca/lampa; chwyt za rączkę naturalny, palce OK; twarz nieeksponowana; produkt wierny. |
| `sc-moment-mobile` (m) | **PASS** | Jak d, portret; świat spójny, produkt wierny. |
| `sc-obszary-neck` | **PASS** | Kark, kadr od tyłu (brak twarzy); głowica na karku, dłoń naturalna; świat wieczorny spójny; produkt wierny. |
| `sc-obszary-shoulder` | **PASS** (uwaga) | Ramię; produkt wierny, świat spójny — ALE dłoń obejmuje GŁOWICĘ (kopułę), nie rączkę: drobne odejście od chwytu paszportowego, nie-krytyczne. |
| `sc-obszary-back` | **PASS** | Plecy od tyłu, sięg naturalny; anatomia dłoni wiarygodna; zero map bólu; produkt wierny; świat spójny. |
| `sc-obszary-thigh` | **PASS** | Udo, siedząca; czerwony LED na skórze; brak claimu anty-cellulit/miary; dłoń OK; produkt wierny. |
| `sc-autonomia` (d) | **PASS** | Produkt stoi na stoliku, lampa+roślina+koc; BRAK portu/kabla; tło ciepłe spójne; wierny. |
| `sc-autonomia-mobile` (m) | **PASS** | Jak d, portret. |
| `sc-final` (d) | **PASS** (uwaga) | Leży na stoliku: kubek+lampa+świeca+książka+firanka (nośnik anim #3); świat spójny; wierny. Cyfra na wyświetlaczu (produkt poziomy) słabo czytelna / inna niż „9". |
| `sc-final-mobile` (m) | **PASS** (uwaga) | Jak d, portret; jw. drobna uwaga o cyfrze. |
| `glowica-head` | **PASS** | Makro: chromowane kulkowe bolce w koncentrycznych pierścieniach + centralny większy + czerwony LED w pierścieniu + pionowe prążki — wierne g0; zero tekstu. |
| `tryby-panel` | **PASS** | Okrągły wyświetlacz „9" w szampańskiej oprawie + 3 diody (czerw/nieb/ziel) + 2 przyciski (power + fale) — wierne g0. |
| `packshot-alpha` | **PASS** | Keying czysty na ciemnym I jasnym: korpus nietknięty, bez resztek tła/glifów, kulki obecne; alpha 42.7/55.4/1.8. |
| `ugc-1` | **PASS** | Realne, granat w dłoni, głowica u góry; pudełko w tle nieczytelne, bez zrzutu apki/marki. |
| `ugc-2` | **PASS** | Realne, granat, wyświetlacz świeci (niebieski); bez apki/marki. |
| `ugc-3` | **PASS** | Realne makro głowicy z czerwonym LED, granat; bez apki/marki. |

### Spory + rozstrzygnięcia
**Zero sporów PASS/FAIL — pełna zgodność 18/18 z 1. parą.** Poniżej uzupełnienia (rzeczy, których
1. para nie wynotowała), rozstrzygnięte przez porównanie z g0/paszportem — żadne nie zmienia werdyktu:
- **Chwyt w `sc-obszary-shoulder`.** Widzę dłoń obejmującą prążkowaną kopułę, nie rączkę. Paszport
  §MODEL UŻYCIA: „chwyt = trzyma za rączkę… główką przykłada do skóry". Rozstrzygnięcie: paszport nie
  ZAKAZUJE ujęcia głowicy dłonią przy dociskaniu do ramienia — to wiarygodny realny chwyt, nie FAIL.
  Utrzymuję PASS; zostaje jako najsłabsze ergonomicznie ujęcie serii (do ewentualnego polerowania).
- **Cyfra na wyświetlaczu w `sc-final` d/m.** Na g0 (granat) wyświetlacz pokazuje wyraźne „9"; w
  scenach pionowych/portretowych też „9". W final (produkt LEŻY poziomo) cyfra jest mała i czyta się
  niejednoznacznie (bliżej „5"/rozmyta). Paszport dopuszcza 1–9, więc to NIE FAIL; zostaje jako drobny
  rozjazd spójności cyfry między scenami (kosmetyka, nie wierność konstrukcji).
- **Odcień kołnierza.** g0 = szampańskie złoto. W scenach waha się srebro↔złoto (hero srebrzysty,
  moment/autonomia bardziej złoty). Spec = „metalowy błyszczący pierścień" — mieści się; nie FAIL.

### Ocena decyzji „21" (H2 bez liczby) — ZASADNA
Potwierdzam niezależnie. Próba policzenia kulek na `glowica-head` i na realnym UGC-3 (oba to ujęcia
pod kątem, dolny rząd schodzi na krawędź/perspektywę) daje **~19–22, niepewne 21** — dokładnie jak
opisała 1. para. Wypalenie dużej typograficznej „21" lub count-upu nad makrem tworzyłoby claim
**falsyfikowalny przez klienta liczącego kulki na zdjęciu** → ryzyko utraty wiarygodności.
Dodatkowo paszport wprost mówi „≈21… NIE demand exact" (precedens Rozmrozika: wymóg ponad-paszportowy
= błąd krytyka). Złagodzenie do H2 „Stalowe kulki w koncentrycznych pierścieniach" + „21" tylko jako
zwykłe zdanie w body (fakt z infografiki g3), NIGDY „policz na zdjęciu" — jest dobrze skalibrowane.
Konstrukcja pierścieniowa + czerwony LED to cechy JEDNOZNACZNIE weryfikowalne w assecie, więc dowód
„to nie zabawka" pozostaje mocny bez ryzyka miscountu. **Decyzję popieram.**

### Sceny do REGENERACJI
**Brak.** Żadna scena nie łamie paszportu — regeneracja niewskazana (spaliłaby budżet bez zysku
wierności). Uwagi wyżej to kosmetyka dla F4/ewentualnego polerowania, nie brief regenu.

### 3 najsłabsze rzeczy
1. **`sc-obszary-shoulder` — chwyt za głowicę zamiast rączki** (najsłabsze ergonomicznie ujęcie serii; nie-krytyczne).
2. **`sc-final` d/m — cyfra wyświetlacza słabo czytelna / niespójna z „9"** z pozostałych scen (produkt poziomy; kosmetyka).
3. **Wahanie odcienia kołnierza srebro↔szampańskie złoto** między scenami (g0 = złoto); drobny rozjazd spójności materiału.
