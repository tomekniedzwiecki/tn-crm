# ETAP 3.5 — COPY REVIEW: rewrite purple prose → direct response

> **Safety rules:** [`reference/safety.md`](reference/safety.md) — reguła #6 (zakazane frazy), #7 (diakrytyki).
> **Copy reference:** [`reference/copy.md`](reference/copy.md) — Senior Copywriter Playbook.
> **Memory:** `feedback-landing-no-purple-prose.md` — ZAKAZ literary flourish w copy.

## Kiedy uruchomić
Po **ETAP 3 REVIEW** (gdy `verify-landing.sh` kończy się `GATE: PASS`), **PRZED** ETAP 4 DESIGN.

## Dwie ścieżki (v5.0 — EKSPERYMENT w toku, patrz `_research/copy-judge-experiment.md`)

| | Ścieżka A — Manus (dotychczasowa) | Ścieżka B — wewnętrzny copy-judge (v5.0) |
|---|---|---|
| Wykonawca | zewnętrzna AI (edge function manus-ask) | Claude w TEJ samej sesji, świeże spojrzenie wg promptu niżej |
| Czas | 5-15 min (polling) | ~2-3 min |
| Zależności | kredyty Manusa (znane awarie: feedback-manus-credit-limit), apply-copy.mjs (niekompatybilny z apothecary/clinical!) | zero — Edit bezpośrednio na HTML |
| Status | DOMYŚLNA do czasu rozstrzygnięcia eksperymentu | równolegle na 3 kolejnych landingach |

**Protokół eksperymentu:** na 3 kolejnych landingach wykonaj OBA (A na kopii copy, B na żywym
HTML), porównaj rubryką vision-critique + oceną Tomka. **Decyzja bramkowa:** jeśli B ≥ A →
B zostaje domyślną, Manus = fallback, a projekt „kontrakt data-copy" (5.2 roadmapy) SKREŚLAMY.

### Ścieżka B — procedura wewnętrznego copy-judge

1. Przeczytaj `reference/copy.md` (CAŁY — zwłaszcza Anti-AI-poetic + Część 3 §0) oraz
   `_brief.md` sekcje 12 (mapa obiekcji) i 13 (Big Idea/VOC/liczby kanoniczne).
2. Wciel się w rolę: **zewnętrzny senior copywriter DR (15 lat, polski e-commerce), który
   widzi ten landing PIERWSZY raz i jest opłacany od znalezionych słabości** — nie autor
   broniący swojego tekstu.
3. Przejdź sekcja po sekcji (hero → footer) i dla KAŻDEGO bloku tekstu zadaj 4 pytania:
   (a) czy jest konkret zamiast przymiotnika? (b) czy liczba pochodzi z sekcji 13.3?
   (c) czy fraza brzmi jak VOC czy jak LLM? (d) czy obiekcja z mapy 12 jest rozbrojona
   w TEJ sekcji, jeśli mapa ją tu przypisuje?
4. Przepisz słabe bloki Edit-em BEZPOŚREDNIO w index.html (zero extract/apply —
   działa dla wszystkich 19 stylów). Te same twarde zasady co prompt Manusa
   (w `scripts/review-copy-manus.sh` — przeczytaj sekcję TWARDE ZASADY).
5. Wypisz diff-raport: ile bloków zmienione, 3 przykłady przed→po.
6. Re-run: `bash scripts/verify-landing.sh [slug]` + `node scripts/verify-offer-math.mjs [slug]`
   (anti-fabrication wyłapie, gdybyś dodał liczbę spoza briefu — Cię też obowiązuje!).

## Dlaczego obowiązkowy
`verify-landing.sh` sprawdza **anti-patterns** (czego NIE ma być) i **długości** (headline ≤10 słów, FAQ ≥80 znaków), ale NIE ocenia czy copy faktycznie sprzedaje. Copy napisany przez Claude'a w ETAP 2 często ma:
- Purple prose (metafory emocji: „smak żalu", „coś z domu zostaje w tobie")
- Tautologie zamiast pain triggerów (headline „Rytuał, który zostaje w domu")
- Brak konkretnych liczb (pisze „cappuccino gorzkie" zamiast „cappuccino za 9 zł")
- Generic aforyzmy („niekompromisowa jakość")

**Manus** (senior copywriter direct response, wyspecjalizowana AI) przepisuje copy zgodnie z `reference/copy.md` + twardymi zasadami. Efekt: każda sekcja ma konkret zamiast poezji.

## Input / Output
- **Input:** `landing-pages/[slug]/index.html` (po ETAP 3 PASS), `_brief.md`
- **Output:** `landing-pages/[slug]/index.html` z przepisanymi tekstami + raport diff na stdout

## Pipeline (3 kroki)

### Krok 1 — Submit copy do Manus

```bash
bash scripts/review-copy-manus.sh [slug]
```

Skrypt:
1. Wyciąga wszystkie teksty z `index.html` → JSON (`scripts/extract-copy.mjs` przez Playwright)
2. Czyta `_brief.md` (brand context, manifest, persona)
3. Składa prompt z **twardymi zasadami** (zakaz purple prose, konkret > metafora, 2 osoba, max 15 słów/zdanie)
4. Submit przez edge function `manus-ask` (`POST /functions/v1/manus-ask`)
5. Poll `manus-get-result` co 20s, max 15 min
6. Wyciąga rewritten JSON z `assistant_message.content`, zapisuje do `C:/tmp/manus-copy-[slug].json`

**Timeout:** 15 min. Jeśli Manus task `running` dłużej — STOP, sprawdź manualnie: `manus-get-messages` edge function z `task_id` z `/c/tmp/manus-task-[slug].txt`.

### Krok 2 — Apply rewritten copy

```bash
node scripts/apply-copy.mjs [slug]
```

Skrypt:
1. Czyta `C:/tmp/manus-copy-[slug].json`
2. Dla każdej sekcji (hero, problem, bento tiles, acts, voices, faq, offer, final cta) — zastępuje content w HTML przez regex po klasach CSS
3. Zachowuje `<em>...</em>` markery (brass italic accent) w headline'ach
4. Auto-splituje długie labels (>30 znaków) na `<br>` w środku
5. Raportuje liczbę replacements na stdout

**Uwaga:** apply jest destrukcyjny — modyfikuje `index.html` in-place. Jeśli chcesz rollback: `git checkout landing-pages/[slug]/index.html`.

### Krok 3 — Re-verify

```bash
bash scripts/verify-landing.sh [slug]
```

Po Manus rewrite może zmienić się liczba słów w headline lub długości FAQ answers — re-run sprawdzi czy nadal PASS.

**Target:** `GATE: PASS` (exit 0) z verify-landing.sh.

## Co Manus dostaje w promptcie

Pełny prompt generowany przez `scripts/review-copy-manus.sh`:

### Twarde zasady (złamanie = reject)
- Konkretne liczby > przymiotniki („26 sekund" nie „bardzo szybko", „9 zł" nie „drogo")
- 2 osoba: „Ty/Twój", NIGDY „my/nasz"
- Max 15 słów per zdanie. Max 3 zdania per akapit
- Konwersacyjny ton. Pisz jak mówisz
- Emocja pierwsza, logika druga. Ale bez sentymentalizmu

### ZAKAZ purple prose — czerwone flagi do rewrite
- „smak żalu" / „gorycz poranka" → konkret: „cappuccino za 9 zł: sproszkowane mleko, letnia woda"
- „coś z domu zostaje w tobie" → „Pięć dni w tygodniu. 52 tygodnie. 260 poranków w domu."
- „kawa, która dawno przestała być kawą" → „mleko w proszku plus letnia woda"
- „W świecie, w którym..." / „nie każdego dnia..." → usuwane bez zastąpienia
- „niekompromisowa jakość", „prawdziwa esencja", „duch przygody" → puste słowa

### Zakazy biznesowe (safety)
- ZAKAZ: „24h wysyłka" / „magazyn w Polsce" / „D+1"
- ZAKAZ: „za pobraniem" / „COD" / „raty" / „PayPo" / „Klarna" / „Twisto"
- „tylko dziś" / „zostało X sztuk" (fake urgency)

### Wzorzec sekcji Problem
```
[SECTION LABEL] + [HEADLINE pytanie/stwierdzenie z liczbą]
[BODY: Znasz to uczucie. KONKRETNA SYTUACJA. KONKRETNA KONSEKWENCJA. KONKRETNA FRUSTRACJA.]
[AGITACJA: statystyka + drugie zdanie rozwiewające]
```

## Kontekst marki (dołączony automatycznie)
- Pełny `_brief.md` (manifest, persona, paleta, anty-referencje, signature element)
- Obecne copy w JSON (wszystkie sekcje z klasami HTML)

## Format odpowiedzi od Manus
JSON z tymi samymi kluczami co `extract-copy.mjs` (żeby `apply-copy.mjs` mógł programowo podmienić). Zachowuje `<em>...</em>` w headline'ach.

## Przykład rewrite (z incydentu Caffora 2026-04)

**Problem h2:**
- PRZED: „Rytuał, który *zostaje w domu*." (tautologia)
- PO: „260 razy w roku zaczynasz dzień od *kompromisu*." (konkret + agitacja)

**Problem body:**
- PRZED: „papierowy kubek, gorzka substancja, *smak żalu*."
- PO: „cappuccino za 9 zł: sproszkowane mleko, letnia woda, syntetyczna piana."

**Hero lede:**
- PRZED: „20 barów *prawdziwego* ciśnienia. Wbudowany system grzewczy. Cały dzień pracy na jednym ładowaniu — w urządzeniu *lżejszym niż* butelka wody."
- PO: „20 barów ciśnienia. Wbudowane grzanie. 8 espresso na jednym ładowaniu. Waży 480 g — mniej niż butelka wody."

---

## Failure modes (AUTO-RUN mode)

| Warunek | Akcja | Max retry | Fallback |
|---------|-------|-----------|----------|
| `manus-ask` edge function 500/timeout | Retry za 30s | 2 | STOP — użyj ręcznie LLM lub pominij ETAP 3.5 (warn, nie fail) |
| Manus task `failed` | Log error + STOP | 1 | STOP, raport user |
| Manus zwraca nie-JSON | Pobierz przez `manus-get-messages`, parse `all_assistant[0]` | 1 | STOP, manual inspection |
| Apply-copy.mjs nie znajduje sekcji w HTML | Log warning (structure differs), continue | — | skip sekcja |
| Polish characters korupt w Manus output | Upewnij się że `extract-copy.mjs` zapisał UTF-8 przez `fs.writeFileSync` (nie bash pipe `>`) | 1 | re-run extract + submit |
| Task `running` > 15 min | Polling timeout | — | STOP, manualnie sprawdź `manus-get-result` |

## Kiedy pominąć ETAP 3.5

Możesz **świadomie** pominąć w tych przypadkach:
- Manus jest down / MANUS_API_KEY nie skonfigurowany → deploy z oryginalnym copy + flag w commit message
- Landing jest modyfikacją istniejącego (`migrate.md` Use case 2) — kopiujesz tylko strukturę, copy client już zaakceptował
- Pilna poprawka produkcyjna (hot fix, np. zmiana ceny) — czas > jakość copy

W wszystkich innych przypadkach **uruchom** ETAP 3.5 przed ETAP 4.

---

## Po ETAP 3.5 → ETAP 4 DESIGN

Przejdź do [`04-design.md`](04-design.md). Copy teraz direct response, design ma dopasować się do treści (nie odwrotnie).
