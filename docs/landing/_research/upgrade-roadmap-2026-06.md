# Roadmapa v5.0 — podniesienie procedury landing pages (FINAL)

> Wersja dopracowana 2026-06-10. Skonsolidowana z [upgrade-plan-2026-06.md](upgrade-plan-2026-06.md)
> (38 zweryfikowanych propozycji, oznaczanych dalej #N) + domknięcie 5 luk krytyka kompletności (GAP-1…5).
> Po deduplikacji: **29 pozycji w 6 fazach**. Status: DO WDROŻENIA fazami, każda faza = osobny commit + wpis w CHANGELOG.

---

## Zasady globalne wdrożenia (obowiązują każdą fazę)

1. **Rollout WARN→FAIL**: każdy NOWY check w verify-landing.sh / verify-style-lock.sh startuje jako WARN.
   Podniesienie do FAIL dopiero gdy: (a) 6 baseline'ów przechodzi, (b) 5 kolejnych nowych landingów nie
   wygenerowało false positive. To anty-powtórka incydentu style-lock (check, którego nikt nie spełnia →
   `--no-verify` jako norma → wyłączony CAŁY bezpiecznik).
2. **Regression po każdej fazie**: `verify-all-landings.sh` + re-run `verify-landing.sh` na cervana, linovo,
   kafina (świeży korpus — nowe checki muszą wykrywać udokumentowane błędy z audytu, nie wymyślone).
3. **Każda zmiana procedury przechodzi META-GATE budżetowy** (#13): rozliczenie w budżetach Scrollability
   (liczby/dense/breathing) + 4 pytania feature-fit. Element addytywny bez wskazania zamiennika = odrzuć.
4. **CHANGELOG.md** aktualizowany per faza (konwencja istnieje). Całość = wersja v5.0.
5. Wdrożenie w normalnych sesjach (bez multi-agent workflow) — to edycje docs + bash, koszt tokenowy znikomy.

---

## FAZA 0 — Naprawa enforcement (FUNDAMENT — bez tego nowe reguły to fikcja)

**Cel: `git commit` landingu przechodzi pre-commit hook BEZ `--no-verify` na 6 baseline'ach + cervana/linovo.**

| ID | Zadanie | Źródło | Pliki |
|----|---------|--------|-------|
| 0.1 | **Jeden kanoniczny próg gate'u**: linia `GATE: PASS/FAIL/WARN-EXCEEDED` + exit code w verify-landing.sh; usunięcie 4 sprzecznych liczb („≥15/18", „~63/≥60", „18 checks", „~33 checks") z 8 plików — w tym `landing-autorun.sh` (faktyczny prompt AUTO-RUN) | #26 | verify-landing.sh, README, CLAUDE.md, 01/03/03-5/05, landing-autorun.sh |
| 0.2 | **verify-style-lock.sh hybrydowy**: REQUIRED tokeny parsowane z `_brief.md` sekcja 10 (format maszynowy `lock-font-*:`/`lock-hex:` — legalizuje paletę klienta), FORBIDDEN hardcoded per styl (anty-samoatestacja), reguła pierwszeństwa brand>Atlas, backward-compat dla starych briefów. Plus nowa grupa „Style Lock compliance" w verify-landing.sh: zakazy z 10.4/10.5 grepowane NA HTML (linovo miał sticky-cta mimo zakazu w briefie) | #28, #15 | verify-style-lock.sh, verify-landing.sh, 01-direction.md |
| 0.3 | **Motion: koniec wojny Grupa 7 ↔ Motion Budget**: usunąć globalne „magnetic≥2/tilt≥2/parallax≥1" i „wszystkie 5 JS effects w każdym landingu"; jedyne źródło = `js_effects_required/forbidden` stylu z STYLE LOCK; naprawić tabelę fallbacków w section-variants.md (każe dodawać efekty wbrew lockowi) | #14 | 02-generate.md, verify-landing.sh, section-variants.md |
| 0.4 | **Docs hygiene — sweep sprzeczności + verify-docs.sh**: (a) odwrócenie checków `subset=latin-ext` (ma być 0, nie ≥1) w 4 miejscach; (b) usunięcie „za pobraniem"/PayPo z przykładowych snippetów H.1-H.3; (c) czystka legacy 04-design.md sekcja 3 (re-wybór kierunku — duplikuje Atlas) i sekcja 5 Krok 2+4 (floating emoji, glow ring, obowiązkowe wavy dividers = AI-slop sprzeczny z własną tabelą anty-AI); (d) routing „ETAP 2.5"→„3.5"; (e) verify-docs.sh w pre-commit: zakazane tokeny w samej procedurze | #34, #18 | 03-review, 04-design, 05-verify, patterns, pagespeed, install-landing-hooks, nowy verify-docs.sh |
| 0.5 | **GAP-2 — jedna spec struktury strony**: 02-generate.md mówi naraz „14 sekcji", tabela ma 15 pozycji, akapit „reszta 11 sekcji" wylicza 12 nazw, tabele zdjęć odwołują się do nieistniejących Gallery/Personas. Ujednolicić do JEDNEJ kanonicznej tabeli (sekcja → wariant → wymagane klasy → placeholdery) i wszystkie pozostałe miejsca zamienić na pointer | GAP-2 | 02-generate.md |

**Effort: 1 sesja. To warunek wstępny — każda następna faza dokłada checki do naprawionego enforcement.**

---

## FAZA 1 — Konwersja: moment decyzji (quick wins na żywym landingu)

**Cel: demo, w którym klient klika „Zamawiam" i NIC nie zgrzyta — działający CTA, pełny koszt, trust przy przycisku, zero fabrykacji.**

| ID | Zadanie | Źródło |
|----|---------|--------|
| 1.1 | **Self-contained gate + wycięcie Conversion Toolkit**: FAIL na `<script src>` względny/crm/CDN (allowlist trackingu Etap 5: gtm, contentsquare = WARN dla żywych landingów); usunięcie całej sekcji „Conversion Toolkit" z 02-generate.md (martwy skrypt po wklejeniu do TakeDrop + fake live-visitors/stock = Omnibus); checklist: „ZERO zewnętrznych script src" | #1, #27 |
| 1.2 | **Standard demo-CTA**: primary CTA w Offer NIGDY martwy — realny checkout URL (wzorzec kafina) ALBO `data-demo-modal` z inline overlayem „Tu zostanie wpięty koszyk TakeDrop" (mockup tylko BLIK/karta/przelew). FAIL na `href="#"` w offer-CTA (linovo: główny przycisk skakał na górę strony) | #6 |
| 1.3 | **Trust-microcopy przy final CTA**: `.cta-trust` pod primary CTA final-cta („✓ 30 dni na zwrot · ✓ BLIK / karta / przelew"); hero opcjonalnie bez liczby; sticky bar WYKLUCZONY; powtórzona liczba liczy się RAZ do budżetu 8-12 | #4 |
| 1.4 | **Sticky CTA kanon**: gating dwuwarunkowy (hero-CTA poza viewportem AND offer-box poza viewportem; wzorzec lensora:1090), `id="hero-cta"`/`id="offer-box"` dla deterministycznego grepa, cena w barze, `padding-bottom: calc(84px + env(safe-area-inset-bottom))`, stack WA/reviews bottom:88px. Jedno źródło: 04-design H.7, patterns.md tylko pointer | #11 |
| 1.5 | **Linia dostawy w offer box**: obowiązkowa `.offer-shipping` pod ceną — domyślnie „Darmowa dostawa · InPost / DPD / kurier" (wariant z safety.md); konkretna kwota TYLKO gdy podana explicite; bez deklaracji czasu (czas tylko w FAQ „7-14 dni"). Ukryte koszty = 48% porzuceń (Baymard) | #12 |
| 1.6 | **Uczciwy social proof**: (a) rating demo w paśmie **4,6-4,8** (research: zaufanie peakuje 4,2-4,7, spada przy 5,0; ujednolicić — stara propozycja seedowała „4.9/5", to korekta); (b) liczba opinii = z `workflow_reviews` ALBO `data-placeholder="reviews"` + przypis [n] do stopki-disclaimera „dane poglądowe, faza wprowadzenia" (wzorzec już jest w cervana:846); (c) FAIL na literały VOGUE/FORBES/ELLE/WIRED/NYT; (d) T6 = ściana certyfikatów wyłącznie jako placeholdery .ph z briefem „tylko faktycznie posiadane atesty" | #2, #37 |

**Effort: 1 sesja. Wszystko grep-owalne, snippety wskazane w pełnym planie.**

---

## FAZA 2 — Konwersja: treść, prawda liczb, perswazja

**Cel: copy zakotwiczone w realnym kliencie i realnym produkcie — koniec zamkniętego obiegu AI i fabrykowanych liczb.**

| ID | Zadanie | Źródło |
|----|---------|--------|
| 2.1 | **GAP-1 — Big Idea + mechanizm + poziom świadomości (NOWY krok 1.7 w 01-direction.md)**: przed manifesto agent ustala: (a) JEDNĄ big idea („dlaczego ten produkt, dlaczego teraz" w 1 zdaniu), (b) unique mechanism (CO w produkcie sprawia, że obietnica jest wiarygodna — z opisu/spec produktu, nie wymyślone), (c) poziom świadomości rynku wg Schwartza (unaware / problem-aware / solution-aware / product-aware) wyprowadzony z kategorii i ceny. Konsekwencje DETERMINISTYCZNE: problem-aware → landing otwiera Problem przed benefitami, hero = pain-hook; solution-aware → hero = mechanizm + dowód; product-aware → hero = oferta + differentiator. Zapis do `_brief.md` sekcja „Big Idea" (3 linie, grep-owalne `big-idea:`/`mechanism:`/`awareness:`), verify-brief.sh: FAIL gdy brak. To największa dźwignia konwersyjna z całej analizy — łuk perswazyjny przestaje być identyczny dla każdego produktu | GAP-1 |
| 2.2 | **VOC — język klienta**: Krok 1.6 w 01-direction.md, warunkowy z fallbackiem: workflow_reviews → fetch searchEvaluation.do po source_url (read-only) → „VOC: BRAK DANYCH". 5-15 dosłownych fraz w koszykach pain/benefit/obiekcje; twardy filtr fraz o dostawie/wysyłce (kolizja z zakazem „24h"); prompt Manusa rozszerzony o „używaj fraz z VOC" | #9 |
| 2.3 | **Mapa obiekcji + objection timing**: `_brief.md` sekcja „Mapa obiekcji" — 5 obiekcji w formacie `[obiekcja] → sekcja: X → rozbrojenie: 1 zdanie`, min 1 produkt-specyficzna spoza 4 kanonicznych; rozbrojenie inline = PRZEPISANIE istniejącego zdania (max +1 linia, 0 nowych liczb); FAQ coverage gate (3 z 4 kategorii słownikowych, scoped do sekcji FAQ); copy.md: usunąć modelowaną obietnicę „1-3 dni" | #3, #36 |
| 2.4 | **Liczby kanoniczne + verify-offer-math.mjs**: sekcja briefu `wartość \| jednostka \| źródło` (źródło = konkretne pole bazy/raportu); nowy skrypt node: spójność cen hero↔offer↔sticky↔final (parser z polskim separatorem tysięcy „1 599 zł"), stara−nowa=savings, % rabatu ±1 p.p., spójność claimów czasowych per kontekst słowny (cervana: „od pierwszej nocy" vs „~3 noce"); anti-fabrication: liczba-sierota w widocznym tekście = FAIL (whitelist z briefu + auto-seed: cena, savings, 14 dni, 30 dni, rating). Wpięcie w verify-landing.sh (nie w apply-copy — ten nie odpala dla wszystkich stylów) | #10, #5, #30 |
| 2.5 | **List od założyciela** (founder note): opcjonalny-domyślny breathing moment w strefie social proof (NIE 15. sekcja); 3-4 zdania 1. osobą wg szkieletu „problem u klientów → frustracja → dlaczego WYBRAŁEM ten produkt"; twardy zakaz czasowników twórczych (projektowałem/stworzyłem — to dropshipping) i wymyślonych biografii; placeholder portretu z briefem; imię z workflow (legal_data), nigdy zmyślone | #8 |
| 2.6 | **META-GATE budżetowy w 02-generate.md** (formalizacja zasady globalnej nr 3): pod-akapit przy Scrollability Rules — każdy nowy element konwersyjny rozlicza się z budżetów + 4 pytania feature-fit; dopisek lekcji do banerów wycofania w `_research/` (Conversion Atlas przewidział własną porażkę w risks i nikt tego nie gate'ował) | #13 |

**Effort: 1-2 sesje. 2.1 wymaga najwięcej projektowania — zrobić jako pierwsze w fazie, bo wpływa na szablon briefu, który rozszerzają 2.2-2.4.**

---

## FAZA 3 — Wizual: anty-sztanca i świeżość

**Cel: dwa landingi z portfolio pokazane obok siebie NIE wyglądają jak ten sam szablon — leksykalnie, strukturalnie ani motion-owo.**

| ID | Zadanie | Źródło |
|----|---------|--------|
| 3.1 | **Anty-AI-slop lint** (style-lock-aware): FAIL na hexy #6366f1/#8b5cf6/#a855f7/#7c3aed gdy NIE występują w briefie (paleta brandu legalizuje); FAIL na Inter/Roboto/Arial w `--font-display`/`h1` (wyjątek: swiss-grid lockuje Helvetica/Inter); WARN na uniform radius >80% (z wykluczeniem 0 i 50%); rozszerzenie tabeli anty-AI-generic w 02-generate.md | #16 |
| 3.2 | **Wow Moments maszynowo weryfikowalne**: pole `pattern-id:` + `selector:` per wow moment w briefie sekcja 11; verify-landing grepuje selektory na HTML; blocklist selektorów-baseline (`.hero`, `.offer-box`… — anty-gaming); ledger `wow-usage.jsonl` (JSONL append — odporny na merge przy równoległych sesjach) z regułą rotacji per styl | #21 |
| 3.3 | **Template-fingerprint + rozszerzony regression**: verify-freshness.sh — kolizje ≥4 dosłownych fraz (≥4 słowa, h1/h2/h3/eyebrow/CTA) z JEDNYM istniejącym landingiem = FAIL z wypisaniem fraz i sluga; blacklist potwierdzonych sztanc („Zanim zamówisz", „Co mówią ci, którzy"); zakaz rabatu „zawsze równo 100 zł". verify-all-landings.sh: zamrożona szóstka zostaje exit-gate, dodatkowa sekcja WARN-only „extended" = 3 najnowsze briefy + `scripts/live-landings.txt` (landingi z żywą kampanią — dziś STOP condition #2 chroni 14% portfolio i pomija strony, które zarabiają) | #22, #33 |
| 3.4 | **Placeholdery: ph--bg + anty-monotonia**: placeholder jako tło pod nakładką dostaje klasę `ph--bg` (brief fotografa → komentarz `<!-- PH-BRIEF: -->`, koniec tekstu-na-tekście jak w linovo); reguła sąsiedztwa przeciw „monotonnemu ciągowi beżowych ramek"; screenshot QA zaczyna od y=0 (hero nigdy nie był oglądany w całości) | #24 |
| 3.5 | **Token dyferencjacji per landing**: 3 osie (radius/eyebrow/divider) z zakresów stylu, derywacja `cksum(slug) mod N` — deterministyczna, weryfikowalna w verify-brief; landing #2 w tym samym stylu przestaje być bitową kopią #1. *Opcjonalne — wdrożyć dopiero gdy 3.1-3.3 nie wystarczą (najmniejszy zysk/złożoność w fazie)* | #25 |
| 3.6 | **Konsolidacja motion + scroll-driven animations**: jedno źródło per-stylowej prawdy = `## 10. Motion Budget` w plikach stylu (rozszerzone o `css_effects_allowed/forbidden` z nazwami keyframes); motion-library.md = jedyna książka przepisów (wchłania patterns #17-21, jeden kanoniczny fade-in); parallax/scroll-progress przepisane na `animation-timeline: view()/scroll()` w `@supports` (Baseline 2025, poza main thread = zysk INP) | #17 |
| 3.7 | **GAP-4 — generalizacja blacklist copy + fix dark-academia**: (a) AI_POETIC personifikacja przez WZORZEC gramatyczny (`(rzeczownik produktowy), któr[ya] (rozumie\|wie\|pamięta\|dba\|czeka\|zna)`) zamiast listy 7 rzeczowników; dodać „zasługujesz na", „pozwól sobie"; licznik budżetu „masz dość" max 1× (deklarowany, dziś nieliczony); (b) dark-academia: złagodzić Copy Voice stylu — rejestr literacki TYLKO w eyebrow/cytatach/dekoracjach, body copy i CTA pozostają DR (inaczej scoring DNA wybierający ten styl = deterministyczna pętla FAIL w AUTO-RUN) | GAP-4 |
| 3.8 | **GAP-5 — determinizm drzewa wariantów**: warunki drzewa („premium AGD z mocną liczbą spec", „smart home") zmapowane na KONKRETNE pola briefu (Product DNA osie + price point + kategoria) — dwa runy na tym samym produkcie = to samo hero; domknięcie pasma 800-1000 zł; USUNĄĆ z docs instrukcję „edytuj brief sekcji 1, żeby wymusić H4" (instrukcja gamingu audytowalności) | GAP-5 |

**Effort: 1-2 sesje.**

---

## FAZA 4 — QA: mobile, performance, compliance

**Cel: to, co „WYMAGANE", jest mierzone skryptem, nie deklaracją.**

| ID | Zadanie | Źródło |
|----|---------|--------|
| 4.1 | **Gate „zadeklarowane = zbudowane"**: warianty sekcji z briefu weryfikowane na HTML przez „Klasę identyfikującą (FROZEN)" per wariant (jedna niemodyfikowalna klasa, np. H10→`hero-ba`); cross-check deklaracji z `allowed_variants` stylu; wow-selectory (3.2) i motion budget (0.3) domknięte na HTML. Rollout WARN→FAIL wg zasady globalnej | #29 |
| 4.2 | **ETAP 6 obliczeniowy**: nowy `verify-mobile.mjs` (Playwright file://, NIE chrome-devtools MCP — nie widzi local) na 360/375/412px: headline_visible, CTA in-first-viewport LUB sticky present, hero_visual ≤60vh, per-element overflow (rect.right > docW+1, nie scrollWidth — overflow-x:hidden maskuje), touch targets; artefakt `_mobile-review.md` zamiast 5 niefalsyfikowalnych pytań. Above-fold mobile = najważniejsza reguła DR przy 60-70% ruchu | #31 |
| 4.3 | **Lighthouse post-deploy + porządek w MCP**: obowiązkowy `lighthouse_audit` mobile na live URL PO pushu, PRZED „done" (Performance <90 = WARN → po baseline z 10 landingów FAIL; Accessibility <90 = WARN — pierwszy check kontrastu w pipeline); globalna poprawa wymyślonych nazw pseudo-API na realne MCP tools; no-JS regression test w fallbacku Playwright (landing nie może iść na deploy z ReferenceError) | #35 |
| 4.4 | **GAP-3 — RODO baseline**: (a) kanoniczny snippet consent do patterns.md: banner z RÓWNORZĘDNĄ opcją „Odrzuć", zero auto-zgody „kontynuując wyrażasz zgodę"; w demo bez trackingu banner w ogóle zbędny — generować go TYLKO gdy landing ma GTM/pixel (większość demo: brak banneru = brak problemu); (b) og:image 1200×630 zamiast logo; (c) `aria-expanded` w FAQ accordion; (d) **JEDNORAZOWY audyt poza procedurą**: cookie bannery żywych landingów klienckich (kafina, h2vital, parova, silktip, innerscan-v2) — kafina jako żywy sklep z auto-zgodą to realne ryzyko klienta, nie hipoteza | GAP-3 |

**Effort: 1-2 sesje (4.4d = osobna szybka sesja audytowa).**

---

## FAZA 5 — Rozbudowa (duże projekty, po ustabilizowaniu faz 0-4)

| ID | Zadanie | Źródło |
|----|---------|--------|
| 5.1 | **Tier 2 wariantów dolnego lejka**: Problem P1-P4 / How It Works W1-W3 / Comparison C1-C3 (zawsze vs KATEGORIA, nigdy nazwany konkurent) / Offer O1-O3 — w formacie Tier 1 (metadane + frozen class + wiersz drzewa first-match-wins). Guardraile O2 multipack: tylko produkt zużywalny/parowalny <300 zł, ceny pakietów z formuły w metadanych (zakaz ad hoc), komentarz DEMO-PRICING. Każdy wariant musi przechodzić istniejące generyczne checki Grupy 11. Sztanca siedzi dokładnie tam, gdzie zapada decyzja zakupowa | #7, #19 |
| 5.2 | **Style Atlas — świeżość evidence-cluster**: 4 style zapowiedziane w clusters.md a nieistniejące (newsroom-print, field-manual, specification-sheet, receipt-print) z pełną schemą + OBOWIĄZKOWO gałęzie case w verify-style-lock.sh (default = exit 1 „Nieznany style ID" — bez tego powtórka incydentu clinical-warmth); sync clusters.md (clinical-warmth do mapy); scoring DNA z LRU anti-repetition (działa zawsze, nie tylko przy remisie — podobne produkty utility nie dostają w kółko tych samych 3 stylów) | #20 |
| 5.3 | **Kontrakt data-copy**: atrybut `data-copy="hero_h1"` na elementach tekstowych → extract/apply-copy.mjs niezależne od stylu (dziś Manus działa w pełni tylko dla paradygmatu Editorial); submit Manusa równolegle z ETAP 4 przez run_in_background (skraca pipeline ~10 min); check warunkowy (≥1 data-copy → wymagaj ≥20; zero → WARN legacy, nie FAIL — inaczej baseline'y blokują każdy deploy). Domyka też borderline „copy z ETAP 4/6 omija Manusa" | #32 |
| 5.4 | **Typografia 2026**: sekcja „Font trend map" w Atlas README (GT Sectra→Fraunces, Monument→Unbounded, Obviously→Bricolage Grotesque; wszystkie latin-ext z datą weryfikacji) — TYLKO dla nowych stylów (zakaz podmiany fontów w istniejących 15 — STYLE LOCK); wiersz drzewa „produkt z 1 dominującą liczbą → hero type-led" zamiast nowego H11 | #23 |
| 5.5 | **Feedback loop performance (poza AUTO-RUN)**: `landing-performance-stats.sh` (bash: brief→styl/warianty/liczba liczb) + procedura sekcja B w `_research/performance.md` (Claude na żądanie: ROAS/koszt zakupu przez ads_insights dla `meta_mcp_enabled=true`, z kolumną link_verified). Jedyna droga, by progi Scrollability i drzewo wariantów skalibrować DANYMI zamiast jedną jakościową porażką. Rytm: raz w miesiącu, na żądanie | #38 |

**Effort: 2-3 sesje. 5.1 i 5.2 to głównie pisanie wariantów/stylów — dobre kandydatury na pojedynczy mały workflow (fan-out po wariantach), reszta solo.**

---

## Co celowo POMINIĘTE lub zdegradowane (świadome decyzje)

| Pozycja | Decyzja | Powód |
|---------|---------|-------|
| motion_profile jako nowy mechanizm w briefie (#14 oryginał) | ODRZUCONE przez weryfikatora | duplikował istniejący Style Lock load v4.0; zostaje sama naprawa docs (0.3) |
| Linia progu „Brakuje Ci X zł do darmowej dostawy" (#12 oryginał) | WYCIĘTE | fabrykowany próg + mechanika koszyka bez koszyka |
| Token dyferencjacji (3.5) | OPCJONALNE | najmniejszy stosunek zysku do złożoności; najpierw sprawdzić, czy 3.1-3.3 wystarczą |
| Widoczny marker [PRZYKŁAD] przy social proof | WYCIĘTE | psuje premium feel demo; marker maszynowy = data-placeholder, ludzki = przypis+stopka |
| Pula wariantów F/T dla stylów evidence/quiet ([F3]-only) | ODŁOŻONE do po 5.1 | Tier 2 najpierw pokaże, czy problem nadal istnieje |
| Guardraile H9 video (preload, LCP) | ODŁOŻONE | brak właściciela w propozycjach; dopisać przy najbliższej zmianie w reels-procedure.md |

---

## Kolejność i zależności

```
FAZA 0 (enforcement) ──► FAZA 1 (moment decyzji) ──► FAZA 2 (treść/liczby)
        │                                                    │
        └──► FAZA 3 (anty-sztanca) ─────────────────────────►├──► FAZA 5 (rozbudowa)
        └──► FAZA 4 (QA/compliance) ────────────────────────►┘
```

- FAZA 0 jest twardym warunkiem wstępnym wszystkiego (nowe checki w zepsutym enforcement = teatr).
- FAZY 1-2 sekwencyjnie (2 rozszerza szablon briefu zmieniany w 1).
- FAZY 3 i 4 niezależne od 1-2 i od siebie — można równolegle / w dowolnej kolejności po F0.
- FAZA 5 na końcu (5.1 zależy od 4.1 frozen-class; 5.3 od stabilnego pipeline'u).

**Szczegółowe specyfikacje każdej pozycji** (dokładne zakresy zmian, linie plików, treści checków po korektach weryfikatorów): [upgrade-plan-2026-06.md](upgrade-plan-2026-06.md), pozycje #1-#38.
