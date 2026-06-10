# Plan rozwoju procedury landing pages — v5.0 FINAL

> Wersja ostateczna 2026-06-10. Zastępuje wcześniejszy szkic roadmapy. Źródła: analiza wieloagentowa
> (56 agentów — audyt procedury + kod/screenshoty landingów + research CRO/design/DR/mobile/DTC),
> 38 zweryfikowanych propozycji w [upgrade-plan-2026-06.md](upgrade-plan-2026-06.md) (#1-#38),
> 5 luk krytyka kompletności (GAP-1…5), 6 dźwigni spoza audytu (A-F).
>
> **Naczelna zasada: żadna pozycja nie wchodzi „bo można". Każda ma zadeklarowany efekt w konkretnym
> wymiarze i sposób, w jaki poznamy, że zadziałała.**

---

## Wymiary efektywności (każda pozycja planu mapuje się na ≥1)

| | Wymiar | Co znaczy „lepiej" | Jak mierzymy |
|---|--------|--------------------|--------------|
| **W1** | Demo jako narzędzie sprzedaży Tomka | klient widzi landing i chce współpracować; dwa dema obok siebie nie wyglądają jak szablon | ocena vision-rubric (1.7), fingerprint collisions = 0, test before/after (program pomiaru) |
| **W2** | Konwersja żywych sklepów (Etap 5) | landingi z ruchem Meta konwertują lepiej | ROAS/koszt zakupu z pętli 5.4, kwartalne porównanie |
| **W3** | Bezpieczeństwo prawne klienta | zero fabrykowanego social proof / ukrytych kosztów / wadliwych zgód przenoszonych na klienta | grep-checki = 0 FAIL; audyt żywych landingów zamknięty |
| **W4** | Koszt i czas pipeline'u | mniej minut i tokenów per landing (od 2026-06-22 tokeny płatne: $10/$50 za 1M) | czas AUTO-RUN, wynik eksperymentu Manus (5.1) |
| **W5** | Trwałość systemu | reguły, które się EGZEKWUJĄ; zero dryfu docs↔skrypty; zero `--no-verify` jako normy | commit bez `--no-verify` na całym korpusie; verify-docs w hooku |

## Zasady wdrożenia (obowiązują wszystkie fazy)

1. **Rollout WARN→FAIL**: nowy check startuje jako WARN; FAIL dopiero po przejściu 6 baseline'ów + 5 nowych landingów bez false positive. (Anty-powtórka incydentu style-lock: nierealny check → `--no-verify` jako norma → wyłączony cały bezpiecznik.)
2. **Regression po każdej fazie**: `verify-all-landings.sh` + re-run na cervana/linovo/kafina — nowe checki muszą wykrywać udokumentowane błędy z audytu.
3. **META-GATE budżetowy** (#13): każdy element konwersyjny rozlicza się z budżetów Scrollability (liczby/dense/breathing) + 4 pytania feature-fit; addytywny bez zamiennika = odrzuć. Lekcja Conversion Atlas.
4. **CHANGELOG.md** per faza; całość = v5.0. Wdrożenie w zwykłych sesjach (bez multi-agent) — wyjątki oznaczone.

---

# FAZA 0 — Enforcement (W5) — warunek wstępny wszystkiego

**Efekt: reguły procedury przestają być deklaracjami. Kryterium: `git commit` landingu przechodzi pre-commit hook BEZ `--no-verify` na 6 baseline'ach + cervana/linovo.**

| ID | Zadanie | Efekt | Źródło |
|----|---------|-------|--------|
| 0.1 | **Jeden kanoniczny próg gate'u** — linia `GATE: PASS/FAIL/WARN-EXCEEDED` + exit code; usunięcie 4 sprzecznych liczb z 8 plików (w tym landing-autorun.sh = faktyczny prompt AUTO-RUN) | zamyka furtkę racjonalizacji FAIL-i przez autonomicznego agenta | #26 |
| 0.2 | **verify-style-lock.sh hybrydowy** — REQUIRED z `_brief.md` (legalizuje paletę klienta), FORBIDDEN hardcoded per styl, backward-compat + nowa grupa „Style Lock compliance" w verify-landing (zakazy briefu grepowane NA HTML — linovo miał sticky-cta mimo zakazu) | koniec rutynowego `--no-verify`; deklaracje briefu = rzeczywistość | #28, #15 |
| 0.3 | **Motion Budget zamiast globalnych progów** — usunąć „magnetic≥2/tilt≥2/5 effects wszędzie" (4 style Atlasu ich ZAKAZUJĄ); jedyne źródło = STYLE LOCK stylu; fix tabeli fallbacków | usuwa wbudowany konflikt, który uczył pipeline omijania weryfikacji | #14 |
| 0.4 | **Docs hygiene + verify-docs.sh** — odwrócenie checków latin-ext (4 miejsca), usunięcie „za pobraniem"/PayPo ze snippetów H, czystka legacy 04-design (sekcja 3 re-wybór kierunku; sekcja 5: floating emoji/glow ring/wavy dividers), routing 2.5→3.5; verify-docs.sh w pre-commit przeciw nawrotom | agent kopiuje snippety DOSŁOWNIE — procedura nie może łamać własnych zakazów | #34, #18 |
| 0.5 | **Jedna spec struktury strony** — 02-generate.md: „14 sekcji" vs tabela 15 vs „reszta 11" z 12 nazwami + tabele zdjęć do nieistniejących sekcji → JEDNA kanoniczna tabela, reszta pointery | deterministyczny build-target dla agenta | GAP-2 |

**1 sesja.**

---

# FAZA 1 — Demo, które sprzedaje (W1 + W3)

**Efekt: klient klika po demie i NIC nie zgrzyta — działający CTA, pełny koszt, trust przy przycisku, zero fabrykacji, strona OCENIONA wizualnie, nie tylko „niezepsuta".**

| ID | Zadanie | Efekt | Źródło |
|----|---------|-------|--------|
| 1.1 | **Self-contained gate + wycięcie Conversion Toolkit** — FAIL na `<script src>` (allowlist gtm/contentsquare dla żywych jako WARN); usunięcie sekcji Toolkit z docs (martwy skrypt po copy-paste do TakeDrop + fake live-visitors/stock) | W3 + W5: demo działa po wklejeniu do CMS; zero fejk-widgetów | #1, #27 |
| 1.2 | **Standard demo-CTA** — primary CTA nigdy martwy: checkout URL albo `data-demo-modal` z overlayem „tu wpinamy koszyk TakeDrop" (mockup tylko BLIK/karta/przelew); FAIL na `href="#"` | W1: najgorszy moment porażki demo (linovo: główny przycisk skakał na górę) znika | #6 |
| 1.3 | **Trust-microcopy przy final CTA** — `.cta-trust`: „✓ 30 dni na zwrot · ✓ BLIK / karta / przelew"; sticky wykluczony; powtórzona liczba liczy się raz | W2: +12-19% CR wg researchu; BLIK = 72% preferencji PL | #4 |
| 1.4 | **Sticky CTA kanon** — gating dwuwarunkowy (po hero-CTA, znika przy offer-box; wzorzec lensora:1090), `id="hero-cta"`/`id="offer-box"`, cena w barze, safe-area padding, stack 88px | W2: +8-15% CR mobile bez kanibalizacji hero; fix buga w samym kanonicznym snippecie | #11 |
| 1.5 | **Linia dostawy w offer box** — `.offer-shipping` pod ceną („Darmowa dostawa · InPost / DPD / kurier"); kwota tylko gdy podana explicite; bez czasu (czas w FAQ) | W2 + W3: ukryte koszty = 48% porzuceń (Baymard) | #12 |
| 1.6 | **Uczciwy social proof** — rating demo 4,6-4,8 (research: peak zaufania 4,2-4,7, spadek przy 5,0 — korekta niespójności propozycji, które seedowały „4.9"); liczby opinii z workflow_reviews ALBO data-placeholder + przypis do stopki-disclaimera (wzorzec cervana:846); FAIL na VOGUE/FORBES/fake certy | W3: klient nie wkleja ryzyka Omnibus/UOKiK do sklepu; W1: wiarygodność | #2, #37 |
| 1.7 | **NOWE — Vision critique w ETAP 5** — po screenshotach obowiązkowa OCENA wizualna wg rubryki (hero: pierwsze wrażenie 1-5; hierarchia; premium-vs-AI-template; spójność; mobile) → wynik do `_brief.md` sekcja QA + **max 3 konkretne poprawki → re-render → re-score**. Próg: średnia <3,5 = popraw przed deployem (nie STOP — raportuj). Dziś QA sprawdza tylko „czy nie zepsute" — nikt nie patrzy, czy strona jest ŁADNA | W1: jedyny mechanizm łapiący „technicznie poprawne, ale brzydkie"; koszt ~1 ocena obrazu/landing | dźwignia B |

**1 sesja.**

---

# FAZA 2 — Treść i prawda (W1 + W2)

**Efekt: copy zakotwiczone w realnym kliencie i realnym produkcie; łuk perswazyjny dopasowany do rynku, nie jeden dla wszystkich.**

| ID | Zadanie | Efekt | Źródło |
|----|---------|-------|--------|
| 2.1 | **Big Idea + mechanizm + poziom świadomości (nowy Krok 1.7 w 01-direction.md)** — przed manifesto: (a) JEDNA big idea, (b) unique mechanism z opisu/spec produktu (nie wymyślony), (c) poziom świadomości wg Schwartza z kategorii+ceny. Konsekwencje DETERMINISTYCZNE: problem-aware → Problem przed benefitami + pain-hook hero; solution-aware → mechanizm+dowód w hero; product-aware → oferta+differentiator w hero. Zapis grep-owalny (`big-idea:`/`mechanism:`/`awareness:`), gate w verify-brief | **największa pojedyncza dźwignia konwersyjna analizy** — koniec identycznego łuku Problem→Solution→Proof→Offer dla produktu kupowanego z bólu i z ciekawości | GAP-1 |
| 2.2 | **VOC — język klienta** — Krok 1.6: workflow_reviews → fetch opinii AliExpress po source_url → fallback „BRAK DANYCH"; 5-15 dosłownych fraz (pain/benefit/obiekcje); filtr fraz o dostawie; prompt copy-review rozszerzony o VOC | W1+W2: copy brzmi jak myśli klienta (research: VOC bije wymyślone); przerywa zamknięty obieg AI (persona z report_pdf = output tego samego LLM) | #9 |
| 2.3 | **Mapa obiekcji + objection timing** — sekcja briefu: 5 obiekcji `[obiekcja] → sekcja → rozbrojenie 1 zdanie`, min 1 produkt-specyficzna; rozbrojenie inline = PRZEPISANIE istniejącego zdania (0 nowych liczb); FAQ coverage gate; usunąć modelowaną obietnicę „1-3 dni" z copy.md | W2: „missing objection timing" = najczęstszy błąd wg researchu; W3: koniec niewykonalnych obietnic dostawy | #3, #36 |
| 2.4 | **Liczby kanoniczne + verify-offer-math.mjs** — każda liczba na landingu ma źródło (`wartość \| jednostka \| źródło` w briefie); skrypt: spójność cen hero↔offer↔sticky↔final (parser „1 599 zł"), stara−nowa=savings, rabat ±1 p.p., spójność claimów czasowych per kontekst (cervana: „od pierwszej nocy" vs „~3 noce"); liczba-sierota = FAIL | W3+W1: tekstowy odpowiednik zabezpieczenia po incydencie Linovo; rozjazd cen = trust-killer w momencie decyzji | #10, #5, #30 |
| 2.5 | **List od założyciela** — opcjonalny-domyślny breathing moment w strefie social proof; szkielet „problem u klientów → frustracja → dlaczego WYBRAŁEM"; zakaz czasowników twórczych (dropshipping!) i zmyślonych biografii; imię z workflow | W1+W2: polska twarz vs anonimowe Temu (+15-28% CR wg researchu DTC) | #8 |
| 2.6 | **NOWE — Przewodnik fotograficzny dla klienta (deliverable)** — generowany z briefów placeholderów jednostronicowy `foto-przewodnik.md`/HTML: „10 zdjęć telefonem — kadr, światło, tło, po jednym na sekcję" + mapka który placeholder = które zdjęcie. Dołączany do raportu końcowego AUTO-RUN | W1+W2: **największy sufit wizualny żywych landingów to placeholdery, których klient nie podmienia** — to jedyna pozycja planu, która atakuje to bezpośrednio | dźwignia F |
| 2.7 | **META-GATE budżetowy w 02-generate.md** — formalizacja zasady wdrożeniowej nr 3 + dopisek lekcji do banerów wycofania w `_research/` | W5: Conversion Atlas przewidział własną porażkę w „risks" i nikt tego nie gate'ował | #13 |

**1-2 sesje. 2.1 najpierw (zmienia szablon briefu, który rozszerzają 2.2-2.4).**

---

# FAZA 3 — Anty-sztanca (W1)

**Efekt: dwa landingi z portfolio obok siebie NIE wyglądają jak ten sam szablon — leksykalnie, strukturalnie, motion-owo. Kryterium: fingerprint collisions = 0 na nowych landingach.**

| ID | Zadanie | Efekt | Źródło |
|----|---------|-------|--------|
| 3.1 | **Anty-AI-slop lint** (style-lock-aware) — FAIL: fiolety #6366f1/#8b5cf6/#a855f7/#7c3aed spoza palety briefu, Inter/Roboto/Arial w display (wyjątek swiss-grid); WARN: uniform radius >80% (excl. 0 i 50%) | sygnatura AI-slop koreluje wg researchu z konwersją niższą do 91% | #16 |
| 3.2 | **Wow Moments weryfikowalne** — `pattern-id:` + `selector:` w briefie, grep na HTML, blocklist selektorów-baseline (anty-gaming), ledger `wow-usage.jsonl` z rotacją per styl | „3 nazywalne elementy" przestają być teatrem samooceny | #21 |
| 3.3 | **Template-fingerprint + rozszerzony regression** — kolizje ≥4 dosłownych fraz z JEDNYM landingiem = FAIL (z wypisaniem fraz+sluga); blacklist sztanc („Zanim zamówisz" 3/3, rabat zawsze „100 zł"); verify-all-landings: zamrożona szóstka = exit-gate + sekcja WARN „extended" (3 najnowsze + `live-landings.txt` — dziś regression chroni 14% portfolio i POMIJA strony, które zarabiają) | klient porównujący 2 dema rozpoznaje sztancę po TEKŚCIE, nie palecie | #22, #33 |
| 3.4 | **Placeholdery: ph--bg + anty-monotonia + screenshot od y=0** — placeholder-tło bez widocznego briefu (tekst-na-tekście w linovo), reguła sąsiedztwa (monotonny ciąg beżowych ramek), hero wreszcie oglądane w całości | realne bugi z audytu wizualnego znikają z dem | #24 |
| 3.5 | **Konsolidacja motion + CSS scroll-driven animations** — jedno źródło = Motion Budget stylów (+`css_effects_allowed/forbidden`); motion-library = jedyna książka przepisów, jeden kanoniczny fade-in; parallax/progress na `animation-timeline` w `@supports` (poza main thread = INP) | W1+W2: koniec dwóch sprzecznych taksonomii; nowoczesny standard 2026 za darmo w wydajności | #17 |
| 3.6 | **Generalizacja blacklist copy + fix dark-academia** — personifikacja wzorcem gramatycznym zamiast listy 7 rzeczowników; +„zasługujesz na"/„pozwól sobie"; budżet „masz dość" realnie liczony; dark-academia: rejestr literacki TYLKO w eyebrow/cytatach, body copy DR (inaczej deterministyczna pętla FAIL w AUTO-RUN) | W5+W1: blacklisty przestają być incydentowe; styl przestaje być miną | GAP-4 |
| 3.7 | **Determinizm drzewa wariantów** — warunki zmapowane na pola briefu (Product DNA+cena+kategoria); domknięcie pasma 800-1000 zł; USUNĄĆ instrukcję „edytuj brief, żeby wymusić H4" | W5: dwa runy na tym samym produkcie = to samo hero; koniec instrukcji gamingu | GAP-5 |
| 3.8 | **NOWE — Swipe corpus (seed)** — katalog `_research/swipe/`: 15-20 anotowanych referencji z realnych top DTC/awwwards (screenshot/URL + notatka „co brać: typografia/layout/motion/sekcja"); ETAP 1 Krok 2 cytuje z korpusu zamiast z pamięci modelu; odświeżanie kwartalne (zadanie cykliczne, NIE w AUTO-RUN) | W1: moodboard z prawdziwych, aktualnych wzorców — anty-zamknięta-pętla | dźwignia E |

**1-2 sesje (3.8: pojedyncza sesja researchowa z WebSearch).**

---

# FAZA 4 — QA i compliance (W2 + W3)

**Efekt: „WYMAGANE" jest mierzone skryptem; ryzyko prawne żywych landingów zamknięte.**

| ID | Zadanie | Efekt | Źródło |
|----|---------|-------|--------|
| 4.1 | **Gate „zadeklarowane = zbudowane"** — warianty z briefu weryfikowane przez „Klasę identyfikującą (FROZEN)" per wariant; cross-check z allowed_variants stylu; wow-selectory i motion domknięte na HTML | W5: brief przestaje być fikcją literacką (linovo: sticky mimo zakazu; cervana: 3 infinite animacje przy budżecie „subtle") | #29 |
| 4.2 | **ETAP 6 obliczeniowy** — `verify-mobile.mjs` (Playwright file://; chrome-devtools MCP nie widzi local) na 360/375/412: headline visible, CTA/sticky in-fold, hero ≤60vh, per-element overflow (nie scrollWidth!), touch targets; artefakt `_mobile-review.md` zamiast 5 niefalsyfikowalnych pytań | W2: above-fold mobile = najważniejsza reguła DR przy 60-70% ruchu, dziś bez gate'u | #31 |
| 4.3 | **Lighthouse post-deploy** — `lighthouse_audit` mobile na live URL przed „done" (Perf <90 = WARN → FAIL po baseline z 10 landingów; A11y <90 = WARN — pierwszy check kontrastu); fix wymyślonych nazw MCP tools; no-JS regression w fallbacku | W2: 0,1 s szybciej = +8,4% konwersji (research); landing nie idzie na deploy z ReferenceError i LCP 6 s | #35 |
| 4.4 | **RODO baseline + audyt żywych** — (a) consent TYLKO gdy landing ma tracking (demo bez GTM/pixela = bez banneru w ogóle — najczystsze rozwiązanie); kanoniczny snippet z równorzędnym „Odrzuć"; (b) og:image 1200×630; (c) aria-expanded w FAQ; (d) **jednorazowy audyt cookie żywych landingów** (kafina = żywy sklep z auto-zgodą „kontynuując wyrażasz zgodę" — realne ryzyko klienta) | W3: ryzyko prawne przestaje przechodzić na klientów | GAP-3 |

**1-2 sesje (4.4d = osobna krótka sesja audytowa z fixami).**

---

# FAZA 5 — Skala i koszt (W4 + W2 + W1)

**Efekt: pipeline szybszy i tańszy; różnorodność tam, gdzie zapada decyzja zakupowa. Kolejność w fazie NIE jest przypadkowa — tani eksperyment decyduje o dużym projekcie.**

| ID | Zadanie | Efekt | Źródło |
|----|---------|-------|--------|
| 5.1 | **NAJPIERW — eksperyment: wewnętrzny copy-judge vs Manus** — na 3 landingach równolegle: Manus (obecny flow) vs Claude-judge (playbook DR + VOC + mapa obiekcji z F2 jako kontekst, edycja bezpośrednio w HTML). Porównanie jakości (rubryka z 1.7 + ocena Tomka) i czasu. **Decyzja bramkowa: jeśli judge ≥ Manus → wdrażamy judge, Manus zostaje fallbackiem, a projekt 5.2 (data-copy) SKREŚLAMY** — kontrakt data-copy istnieje głównie po to, żeby Manus działał dla wszystkich 15 stylów | W4: −10-15 min pipeline'u, zero zależności od kredytów Manusa (udokumentowane awarie), zero zewnętrznego kosztu; potencjalnie kasuje największy projekt fazy | dźwignia D |
| 5.2 | *(WARUNKOWE — tylko jeśli 5.1 wskaże Manusa)* **Kontrakt data-copy** — `data-copy="hero_h1"` na elementach tekstowych, extract/apply niezależne od stylu, submit Manusa równolegle z ETAP 4, check warunkowy (legacy = WARN) | W4+W1: jedyny mechanizm jakości literackiej działa dla 15 stylów, nie tylko Editorial | #32 |
| 5.3 | **Tier 2 wariantów dolnego lejka** — Problem P1-P4 / How W1-W3 / Comparison C1-C3 (zawsze vs kategoria) / Offer O1-O3; format Tier 1 (metadane+frozen class+drzewo). Guardraile multipack O2: tylko zużywalny/parowalny <300 zł, ceny z formuły (zakaz ad hoc), DEMO-PRICING comment | W1+W2: środek i dół strony to dziś klon 1:1 — sztanca dokładnie tam, gdzie zapada decyzja; multipack = najszybsza dźwignia AOV | #7, #19 |
| 5.4 | **Feedback loop performance** — `landing-performance-stats.sh` (brief→styl/warianty/liczby) + procedura ROAS/koszt zakupu przez ads_insights dla `meta_mcp_enabled=true` (z link_verified); output do `_research/performance.md`; rytm kwartalny | W2: progi Scrollability i drzewo wariantów po raz pierwszy skalibrowane DANYMI, nie jedną jakościową porażką | #38 |
| 5.5 | **Style Atlas: świeżość evidence-cluster** — 4 brakujące style (newsroom-print, field-manual, specification-sheet, receipt-print) + OBOWIĄZKOWO gałęzie w verify-style-lock (default = exit 1 — anty-powtórka clinical-warmth); sync clusters.md; LRU anti-repetition (nie tylko przy remisie); przy okazji: font trend map (Fraunces/Unbounded/Bricolage, tylko dla NOWYCH stylów) + wiersz drzewa „1 dominująca liczba → hero type-led" | W1: klienci dropshippingowi = głównie mid-price utility → wszyscy lądują dziś w 3 stylach evidence | #20, #23 |

**2-3 sesje. 5.3 i 5.5 (pisanie 13 wariantów + 4 stylów) = dobry kandydat na JEDEN mały workflow fan-out; reszta solo.**

---

# Eksperymenty opcjonalne (świadomy koszt, po 2026-06-22 za zgodą)

| ID | Eksperyment | Kiedy uruchomić | Koszt |
|----|-------------|-----------------|-------|
| E1 | **Multi-kandydat hero z sędzią** (dźwignia C) — 2-3 warianty hero/kierunku, screenshot, wybór judge'em | TYLKO jeśli vision-rubric (1.7) systematycznie daje <4/5 mimo faz 1-3 — wtedy single-shot jest sufitem | ~2× tokenów etapu hero |
| E2 | **A/B realny na żywym sklepie** — dwa warianty sekcji Offer dla jednego klienta Etap 5 z ruchem | po 2 kwartałach danych z 5.4, na 1 sklepie za zgodą klienta | mały, ale wymaga ruchu |

---

# Program pomiaru — jak poznamy, że CAŁOŚĆ działa

1. **Test before/after (po F2 i po F3):** wybrać 2 istniejące workflow → przegenerować landingi nową procedurą → postawić obok starych na Vercel → ocena: vision-rubric + ślepa ocena Tomka („który byś pokazał klientowi?"). To jest główny dowód efektu W1.
2. **Twarde liczniki per faza:** F0 = 0 commitów z `--no-verify` (grep git log); F1 = 0 martwych CTA / 0 social proof bez disclaimera na nowych landingach; F3 = 0 fingerprint collisions; F5 = czas AUTO-RUN przed/po (cel: ≤25 min mimo nowych checków — vision critique i verify-mobile dodają ~3-4 min, eksperyment Manus może odjąć 10-15).
3. **Kwartalnie (z 5.4):** tabela styl/warianty × ROAS — pierwsza empiryczna kalibracja progów; aktualizacja swipe corpus (3.8); przegląd WARN-ów extended-regression.
4. **Kryterium końcowe programu:** nowy landing wygenerowany w pełnym AUTO-RUN przechodzi wszystkie gate'y bez interwencji, dostaje ≥4/5 w vision-rubric i nie dzieli żadnej frazy-sztancy z korpusem — w ≤30 min.

---

# Celowo pominięte / wycięte (żeby nikt nie „przywrócił" w dobrej wierze)

| Pozycja | Decyzja | Powód |
|---------|---------|-------|
| motion_profile jako nowy mechanizm briefu | ODRZUCONE | duplikował Style Lock load v4.0; została naprawa docs (0.3) |
| „Brakuje Ci X zł do darmowej dostawy" | WYCIĘTE | fabrykowany próg + mechanika koszyka bez koszyka |
| Token dyferencjacji per landing (hash sluga) | BACKLOG | najmniejszy zysk/złożoność; wraca TYLKO jeśli po F3 fingerprint nadal łapie kolizje strukturalne |
| Widoczny marker [PRZYKŁAD] przy social proof | WYCIĘTE | psuje premium feel demo; maszynowy = data-placeholder, ludzki = przypis+stopka |
| Quiz Funnel, Conversion Atlas (re-wdrożenie) | ZAMKNIĘTE | przetestowane i wycofane; META-GATE pilnuje, by nie wróciły w przebraniu |
| Pula wariantów F/T dla stylów evidence/quiet | ODŁOŻONE | po 5.3 i danych z 5.4 — może problem zniknie sam |
| Guardraile H9 video (preload/LCP) | ODŁOŻONE | dopisać przy najbliższej zmianie reels-procedure.md |
| JSON-LD Product/FAQPage | WYCIĘTE z 4.4 | landingi demo nie mają SEO (deklarowane wprost w FAQ procedury) — schema bez ruchu organicznego to robienie dla robienia; wraca tylko dla żywych sklepów na życzenie |

---

# Kadencja i zależności

```
TYDZIEŃ 1:  F0 (enforcement) ──► F1 (demo+vision critique)
TYDZIEŃ 2:  F2 (treść/prawda — Big Idea najpierw)
TYDZIEŃ 3:  F3 i F4 (równolegle/dowolna kolejność) + audyt RODO żywych
TYDZIEŃ 4+: F5 (najpierw eksperyment 5.1 → decyzja o 5.2; potem 5.3/5.5)
KWARTALNIE: pętla 5.4 (ROAS) + odświeżenie swipe corpus + przegląd WARN-ów
```

- F0 = twardy warunek wstępny (nowe checki w zepsutym enforcement to teatr).
- F1→F2 sekwencyjnie (F2 rozszerza szablon briefu).
- F3 ⊥ F4 — niezależne od siebie i od F1-F2 (po F0).
- W F5 eksperyment 5.1 PRZED projektem 5.2 — wynik taniego testu może skasować drogi projekt.

**Szczegółowe specyfikacje** (dokładne zakresy, linie plików, treści checków po korektach weryfikatorów): [upgrade-plan-2026-06.md](upgrade-plan-2026-06.md) #1-#38.
