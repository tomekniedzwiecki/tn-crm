# Integrated Architecture Plan — Conversion Atlas + Quiz Funnel (v4.2 → v4.3)

> Plan output from agent run 2026-04-27. Reference for implementation phases.

## 1. Architektura — gdzie wstawić Conversion Atlas

**Decyzja: nowy Krok 9b W ETAP 1, PRZED Krok 9a (Style Atlas).** NIE nowy ETAP 0.5 (zbyt agresywne — łamie 7-etap mental model i README flow), NIE „Style Atlas wynika z Conversion" (zbyt sztywno — niektóre style są agnostyczne psychologicznie).

**Kolejność po refaktorze ETAP 1:** Kroki 1-8 bez zmian → **Krok 9b: Conversion Atlas pick** (nowy) → Krok 9a: Style Atlas pick (renumerowane, pozostaje algorytmiczne) → Krok 9: verify-brief gate.

**Filozofia ordering:** psychologia → estetyka. Mechanizm odpowiada „JAK przekonujemy" (PAS = ból→agitacja→rozwiązanie; Authority = ekspert mówi; Identity = „tacy jak ty"). Styl odpowiada „JAK wygląda przekonywanie" (Apothecary = etykieta-jako-dowód; Brutalist = manifest-jako-bunt). Mechanizm constrainuje paletę dopuszczalnych stylów, ale nie odwrotnie.

**Matrix compatibility (2 atlasy łączone):** każdy mechanizm w `conversion-atlas/[mech].md` ma pole `style_compat:` z 3 kategoriami:
- **forces** (1-2 style): np. Anti-Establishment → Brutalist DIY (jedyna wizualna materializacja buntu)
- **compatible** (5-8 stylów): działa naturalnie
- **incompatible** (2-4 style): konflikt psychologii×estetyki, np. Identity Buying × Brutalist DIY (manifest niszczący zamiast „tacy jak ty"); PAS × Editorial Print (drama bólu vs cisza luksusu)

**Algorytm w 9b → 9a coupling:** Conversion Atlas pick (po Conversion DNA — nowe 5 osi: pain-aware vs aspirational, urgency-driven vs slow-trust, social-proof-heavy vs solo-decision, etc.) zwraca top-1 mechanizm. Styl Atlas (9a) działa jak wcześniej, ALE w tie-breaku przed anti-repetition gate **odrzuca style z `incompatible` listy mechanizmu**. Jeśli forces jest niepuste → top-1 styl jest wymuszony niezależnie od DNA.

**WYMAGA DECYZJI:** czy `forces` ma override anti-repetition gate (tj. dopuszczamy 3× pod rząd Brutalist DIY jeśli 3× pod rząd produkty wołają o Anti-Establishment)? **Rekomendacja: NIE** — anti-repetition wins, raportuj konflikt do usera.

## 2. Architektura — Quiz Funnel jako alternative format

**Decyzja:** quiz to **OSOBNY format** (osobny zestaw szablonów), NIE wariant wewnątrz każdego stylu Atlas. Decyzja „classic vs quiz" zapada w **nowym Kroku 8.5 ETAP 1**, na bazie `decision_dimensions_count` z brand_info + workflow_products:
- ≥3 wymiary decyzyjne (persona, use case, kolor/rozmiar/wariant) → quiz funnel
- ≤2 wymiary → classic 14-section scroll

**Struktura `index.html` quiz:** 1 strona, JS state machine (NIE multi-page Vercel routing — mnoży komplikację deployu, łamie share-link). Sekcje: `<section data-quiz="intro">` → `data-quiz="q1..qN"` (4-6) → `data-quiz="email-gate"` → `data-quiz="result"` → `data-quiz="offer"`. Result page personalizuje hero/headline/recommended SKU per ścieżka pytań (mapa scoring → result variant w embedded JSON).

**Compatibility z Style Atlas:** quiz-able nie każdy styl. Pole `quiz_variant: yes|no|partial` w schema każdego stylu Atlas (12 → **13 pól**). MVP: Apothecary, Clinical Kitchen, Playful Toy, Cottagecore = `yes`. Editorial Print, Dark Academia, Swiss Grid = `no` (cisza/długi-form niekompatybilne z 4-pytaniowym tempem). Brutalist DIY, Poster Utility = `partial` (quiz przerobiony pod manifest tone).

**Reuse Style Lock:** quiz mimo innej struktury **NADAL respektuje Style Lock** (fonty/paleta/primitives). Tylko section architecture jest różna.

## 3. Zmiany w `_brief.md` template

Dodaj **3 nowe sekcje + rozszerzenie sekcji 1**:

- **Sekcja 0 (nowa, na samej górze, przed sekcją 1) — `## 0. FORMAT DECISION`**: checkbox `[ ] Classic 14-section scroll` / `[ ] Quiz Funnel (4-6 Q + result)`, wymagany Format ID, uzasadnienie (1 zdanie z liczbą decision_dimensions). Wybór = `classic` lub `quiz`.
- **Sekcja 11 (nowa) — `## 11. CONVERSION LOCK`** (analogiczne do sekcji 10 STYLE LOCK):
  - 11.1 Mechanism ID (np. `pas`, `slippery-slope`, `identity-buying`)
  - 11.2 Conversion DNA (5 osi z 1-zdaniowym uzasadnieniem)
  - 11.3 Hero formula (auto-paste z mechanism file: jaka struktura headline/sub/CTA)
  - 11.4 MUSZĄ być użyte (np. PAS → headline z bólem w Q1, agitacja w sekcji problem, rozwiązanie nie wcześniej niż sekcja 4)
  - 11.5 NIE WOLNO (np. PAS → NIE solution-first headline; Authority → NIE „my, mała pasjonacka manufaktura")
  - 11.6 Compat z Style Lock (auto-fill: forces/compatible/incompatible pulled from `conversion-atlas/[mech].md`)
- **Sekcja 12 (nowa, OPCJONALNA, tylko jeśli Format=quiz) — `## 12. QUIZ STRUCTURE`**: 4-6 pytań w formacie YAML (q_id, label, options[], scoring_axis), email-gate position (przed/po Q4 lub przed result), result variants count (zwykle 3-5), recommended SKU mapping.

`verify-brief.sh` egzekwuje: sekcja 0 ma checkbox `[x]`, sekcja 11 ma Mechanism ID istniejący w `conversion-atlas/`, min 3 bullety w 11.4 i 11.5, sekcja 12 obecna **tylko gdy** sekcja 0 = quiz (warunkowy gate).

## 4. Nowe enforcement skrypty

3 nowe + 1 modyfikacja istniejących:

- **`scripts/verify-conversion-lock.sh [slug]`** — analogicznie do `verify-style-lock.sh`. Hardcoded case statement per mechanizm (10-15 cases). Sprawdza:
  - Hero headline matchuje regex formuły mechanizmu (PAS: ≥1 z lex bólu w h1; Authority: nazwisko eksperta lub badanie w hero; Curiosity Gap: pytanie lub niedopowiedzenie)
  - Sekcja problem/agitation obecna gdy mech=PAS/Slippery (CSS class `.problem-agitation` lub `.pain-amplifier`)
  - Risk Reversal mechanism wymaga grep `gwarancj|zwrot|30 dni|bez ryzyka` w sekcji offer
  - Forbidden phrases per mech (Identity Buying NIE „dla każdego"; Authority NIE „my, pasjonaci")
- **`scripts/landing-conversion-stats.sh [--check mech-id]`** — kopia `landing-style-stats.sh`, ale agreguje Mechanism ID z sekcji 11. Anti-repetition: max 2× ten sam mech w ostatnich 5. Drugi gate w ETAP 1 obok style-stats.
- **`scripts/verify-quiz-funnel.sh [slug]`** — TYLKO jeśli sekcja 0 = quiz. Sprawdza:
  - Liczba `<section data-quiz="q*">` mieści się w 4-6
  - `data-quiz="email-gate"` obecny dokładnie 1×
  - `data-quiz="result"` z embedded `<script type="application/json" id="quiz-result-map">` obecny
  - State machine JS obecna (`window.QuizState` / podobny pattern)
  - Min 3 result variants w mapie scoring

**Modyfikacja `verify-landing.sh`:** Grupa 0 ładuje **3 contracty** (Style Lock + Conversion Lock + Format Decision). Jeśli Format=quiz → SKIP grupy „14 sekcji obecnych" i grupy „Hero structure classic"; włącz Grupę 19 „Quiz structure" delegowaną do `verify-quiz-funnel.sh`.

**Integracja PRE-COMMIT:** istniejące 3 gates (`verify-landing` + `verify-style-lock` + `review-landing-visual --check`) → **5 gates**: dodaj `verify-conversion-lock.sh` zawsze, dodaj `verify-quiz-funnel.sh` warunkowo (Format=quiz). Zaktualizuj `install-landing-hooks.sh` i autorun prompt.

## 5. Sekwencja implementacji w fazach

**Faza 1 — Conversion Atlas v0.1 MVP (1-2 sesje):**
- Outputs: `docs/landing/conversion-atlas/README.md` (framework: 5 osi Conversion DNA, anchor produkty, schema 10 pól per mech), `_template.md`, **5 mechanizmów MVP**: `pas.md`, `authority.md`, `risk-reversal.md`, `transformation-promise.md`, `identity-buying.md` (pokrywają ~70% klientów TN). Każdy mech ma: DNA profil, hero formula, MUSZĄ/NIE WOLNO, style_compat (forces/compatible/incompatible), example snippet.
- Dependencies: brak (pure docs, nie zmienia procedury).
- Rollback: usuń katalog `conversion-atlas/`, brak referencji jeszcze w skryptach.

**Faza 2 — Brief integration + verify-conversion-lock (1 sesja):**
- Outputs: update `_brief.template.md` (sekcje 0, 11, opcjonalnie 12), update `verify-brief.sh` (warunkowe gates), nowy `verify-conversion-lock.sh` (5 cases), nowy `landing-conversion-stats.sh`, update `01-direction.md` (Krok 8.5 Format Decision + Krok 9b Conversion Atlas pick).
- Dependencies: Faza 1 done, ≥5 mech files istnieją.
- Rollback: revert `_brief.template.md` i `verify-brief.sh`, usuń 2 skrypty. Istniejące landingi dostają sekcje 0/11 jako optional via `migrate.md`.

**Faza 3 — Quiz Funnel pierwszy działający (2-3 sesje):**
- Outputs: nowy `docs/landing/quiz-funnel.md` (architektura state machine, scoring patterns, result variants), `landing-pages/_templates/quiz.index.template.html` (JS state machine boilerplate), pierwszy realny landing (rekomendacja: parownica Steamla — persona×use-case daje 4 wymiary), `verify-quiz-funnel.sh`, modyfikacja `verify-landing.sh` Grupa 0+19.
- Dependencies: Faza 2 done (Conversion Lock działa, bo quiz wymaga mechanizmu).
- Rollback: zostaw Quiz template ale wyłącz Format=quiz w `verify-brief.sh` (kontrola via flag w skrypcie). Klasyczne landingi działają bez zmian.

**Faza 4 — Autorun + dokumentacja (1 sesja):**
- Outputs: update `landing-autorun.sh` prompt (Krok 8.5 + 9b w sekwencji ETAP 1), update `README.md` flow diagram (z 7 etapów na 7 etapów + 2 gates w ETAP 1), update `CHANGELOG.md` v4.2 (Conversion Atlas) i v4.3 (Quiz Funnel), update `CLAUDE.md` STOP conditions (z 6 na 8).
- Dependencies: Faza 3 done.
- Rollback: revert prompt do v4.1; istnieje fallback path w autorun „skip Conversion Atlas if file missing".

## 6. Architectural risks

- **Conflict matrix density:** Identity Buying × Brutalist DIY, PAS × Editorial Print, Authority × Playful Toy, Curiosity Gap × Swiss Grid — 4 ostre konflikty już w MVP. Risk: matrix rośnie nieliniowo (15 stylów × 15 mechanizmów = 225 par). Mitigation: NIE precompute pełnej matrix, używaj `style_compat: {forces, incompatible}` per mech file (max 6 wpisów). Compatible = default. Audit pełnej matrix po Fazie 4.
- **Decision paralysis w autorun:** Format (2) × Mechanism (5 MVP, 15 target) × Style (15) × Section variants (10+6+6) = 27 000+ kombinacji decyzyjnych. Ryzyko że Claude w autorun mode się zatka i wyprodukuje niespójność. Mitigation: deterministyczne algorytmy (DNA → scoring → top-1 wins) na każdym etapie, NIE LLM-judgment. Anti-repetition gates wymuszają różnorodność bez explicit choice.
- **Quiz vs verify-landing 14-section assumption:** istniejący `verify-landing.sh` ma hardcoded checki na 14 sekcji. Quiz ma 8 sekcji w innej strukturze. Mitigation: Grupa 0 Format Decision skipuje wybrane checki. Risk że regression w istniejących landingach — Faza 3 robi `verify-all-landings.sh` po zmianach jako gate.
- **Conversion Atlas dryf w „ezoterykę":** „Slippery Slope" / „Curiosity Gap" / „Anti-Establishment" brzmią marketingowo, ale bez evidence-base mogą stać się magic words. Mitigation: każdy mech file MUSI mieć pole `evidence:` z 2-3 linkami do badań / case studies / Cialdini chapters; `verify-brief.sh` opcjonalnie sprawdza obecność źródeł w sekcji 11.2.
- **Performance autorun:** dodanie Krok 8.5 + 9b + verify-conversion-lock + (warunkowo) verify-quiz-funnel = +2-4 min do typowych 30-40 min. Akceptowalne. Risk: review-landing-visual potrzebuje screenshotów quiz w state-machine — zwykły Playwright screenshot łapie tylko intro. Mitigation: Faza 3 dodaje quiz-aware screenshot script (screenshot per `data-quiz` step).
