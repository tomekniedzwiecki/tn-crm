# GATE BEZPIECZEŃSTWA I TESTÓW — standard fabryki TN App

> Decyzja Tomka 15.07.2026: „system pracuje, nie możemy robić testów bezpieczeństwa tylko raz —
> zawsze gdy robimy coś, co może mieć wpływ na bezpieczeństwo. Wolę nawet, żeby pewne rzeczy
> dłużej trwały, ale były w pełni bezpieczne. I testy funkcji — nie dawać live po większych
> zmianach, jeśli nie przejdą podstawowych testów."
>
> Zasada nadrzędna: **bezpieczeństwo i poprawność to CIĄGŁY proces, nie krok jednorazowy.**
> Audyt w etapie Przegląd to nie koniec — to baseline. Każda kolejna zmiana, która dotyka
> wrażliwej powierzchni, przechodzi własny zakresowy audyt PRZED wejściem live.

---

## Dwa gate'y (obowiązują KAŻDĄ sesję, KAŻDĄ aplikację)

### GATE A — BEZPIECZEŃSTWO PRZY KAŻDEJ ZMIANIE WRAŻLIWEJ POWIERZCHNI

**Kiedy się uruchamia:** sesja dotknęła którejkolwiek pozycji z listy WRAŻLIWEJ POWIERZCHNI (niżej).
**Co wymusza:** ZAKRESOWY, adwersarski audyt bezpieczeństwa TEJ zmiany (świeży subagent na diffie,
próbuje ZŁAMAĆ — nie potwierdzić) PRZED pushem/deployem. Znaleziska naprawione przed domknięciem.

**MODEL AUDYTU (decyzja Tomka 20.07.2026): KAŻDY audyt bezpieczeństwa (GATE A, SEC-CHECK, krok
`audyt`, security-review) wykonuje subagent na `model: opus` (Opus 4.8 lub wyższy Opus/następca,
gdy wyjdzie) — NIGDY Fable 5.** Powód: polityka Anthropic nakłada na Fable 5 (klasa Mythos)
dodatkowe środki bezpieczeństwa dual-use, które ograniczają rozumowanie ofensywne („złam ten kod")
— rdzeń adwersarskiego audytu; Fable może audyt spłycić lub odmówić. Fable-orkiestrator robi TYLKO
to, na co pozwala jego polityka: spawnuje opus-audytora z briefem, odbiera werdykt, egzekwuje
naprawy. Reguła obowiązuje, dopóki Anthropic nie zmieni zasad dla klasy Mythos.
Nie zastępuje pełnego audytu etapu Przegląd — uzupełnia go na bieżąco (system żyje).

**WRAŻLIWA POWIERZCHNIA (dotknięcie któregokolwiek = GATE A obowiązkowy):**
1. Migracje DB / RLS / GRANT / polityki / triggery (SECURITY DEFINER, freeze, liczące).
2. Edge functions — każda (nowa lub zmiana): gate/autoryzacja, walidacja wejścia, kwoty, sekrety.
3. Auth / role / uprawnienia (rejestracja, nadawanie ról, config Supabase Auth, hasła, tokeny).
4. Płatności / kwoty / Stripe / prowizje / rabaty / referral / kredyty.
5. Storage / upload / buckety / signed URL / MIME / rozmiar / ścieżki.
6. Render danych usera do HTML / DOM / maila / PDF (escape, sanityzacja, iframe).
7. Sekrety / env / CDN / zależności zewnętrzne (pin, SRI, supply-chain).
8. Nowy publiczny endpoint / webhook / ANON dostęp / rate-limit.
9. Portal klienta / dostęp półzaufanych stron (operator, tester).

**Jak sesja to wykonuje (rytuał):**
- Przy domknięciu sesja robi SECURITY-TRIAGE: „czy diff dotyka wrażliwej powierzchni?" (lista wyżej).
- Jeśli TAK → OBOWIĄZKOWY zakresowy audyt adwersarski (mini-runda bezpieczeństwa): świeży subagent
  dostaje `git diff` + kontekst i próbuje złamać DOKŁADNIE tę zmianę (odpowiednie soczewki z listy
  audytu §7 WORKFLOW-PLAN, zawężone do zmiany). FAIL → naprawa → ponów, aż czysto (pętla do
  wyczerpania w skali zmiany). Dowód (co próbowano złamać, wynik) → BUILDLOG + marker `SEC-CHECK:`.
- Jeśli NIE (docs, komentarz, drobny CSS, tekst) → triage odnotowany „brak wrażliwej powierzchni".

**Trigger PEŁNEGO audytu (pętla do wyczerpania, 4 soczewki):** krok `audyt` w Przeglądzie ORAZ
ponownie przy KAŻDEJ WIĘKSZEJ zmianie wrażliwej powierzchni po tym kroku (nowy moduł płatności,
nowy edge z uploadem, zmiana modelu ról itp.). „Większa" = nowa funkcjonalność/moduł na wrażliwej
powierzchni, nie punktowy fix. Pełny audyt = pętla do wyczerpania (patrz pamięć
`feedback-petla-poprawek-do-wyczerpania`).

### GATE B — FUNKCJONALNY: NIE LIVE BEZ ZIELONYCH TESTÓW

**Zasada:** WIĘKSZA zmiana NIE wchodzi na produkcję (push na main → Vercel), jeśli podstawowe testy
nie są zielone. Lepiej wolniej, ale nie psujemy działającego systemu.
**„Większa zmiana"** = diff dotyka `public/js/**`, `supabase/functions/**`, `supabase/migrations/**`
lub kluczowego HTML/CSS. NIE dotyczy: docs, BUILDLOG, komentarzy, drobnych tekstów.
**Podstawowe testy:** suita E2E (happy-path niszy: landing 200 + rejestracja + funkcja główna + RLS
izolacja + gate płatności) + audit-static (sekrety/XSS/USING(true)/syntax). Zielone = warunek pushu.

---

## Mechanizm techniczny (wymuszenie, nie deklaracja)

Deklaracje w promptach bywają pomijane (dowód: XSS umowy przeszedł pierwszy audyt). Dlatego gate
jest EGZEKWOWANY skryptem + git hookiem, nie tylko zasadą.

### `scripts/preflight.mjs` (fachmat + starter) — pre-push gate
Uruchamiany przez pre-push git hook oraz `npm run preflight`. Kroki (FAIL któregokolwiek = exit 1,
push zablokowany):
1. **audit-static** (istniejący, rozszerzony): sekrety w repo, `innerHTML`/XSS, `USING(true)`,
   syntax JS (U10: ESM przez `--input-type=module` stdin), rozbieżne funkcje escape (jedna
   atrybutowa na projekt — lekcja SEC-D2), gołe `esc` bez cudzysłowów, CDN bez pinu na powierzchni
   klienta, service_role we froncie. 0 FAIL (poza baseline `legal/*.md`).
3. **Klasyfikator wrażliwej zmiany**: `git diff` vs lista WRAŻLIWEJ POWIERZCHNI. Jeśli dotknięta,
   a w wiadomości commita / świeżym wpisie BUILDLOG brak markera `SEC-CHECK: <opis co sprawdzono>`
   → BLOKADA z komunikatem „zmiana dotyka wrażliwej powierzchni (X) — wymagany GATE A (zakresowy
   audyt) przed pushem; dodaj SEC-CHECK: po wykonaniu".
4. **Klasyfikator większej zmiany** (GATE B — TWARDY): jeśli diff dotyka `public/js`/`functions`/`migrations`/
   kluczowego HTML-CSS → marker `E2E: <n> passed` (commit/BUILDLOG HEAD, dowód pełnej suity) = przejście.
   Bez markera preflight **REALNIE odpala smoke** `playwright test --grep @smoke` (BASE_URL=prod, deadline 90 s):
   zielone = przejście, czerwone/timeout = BLOKADA. Hasło kont testowych bierze z env `E2E_PASSWORD` **lub
   Windows Credential Manager** (P/Invoke `advapi32!CredReadW`, target „<AppName> E2E:password"; zapis:
   `npm run set-e2e-secret` — losowe hasło, NIGDY do repo/logów). Brak hasła (inne środowisko) → smoke pominięty
   + WARN, wymagany marker. Wcześniej (do 15.07) GATE B był PÓŁTWARDY — polegał na markerze deklarowanym przez
   sesję (sesje nie miały hasła w env → nie mogły odpalić suity). Od 16.07 (decyzja Tomka „GATE B twardy") sesje
   czytają hasło z CredMan → smoke odpala się realnie w hooku.

   **Zestaw `@smoke`** (szybki, twardy podzbiór — kryteria): (a) BEZ tworzenia świeżych kont per-test,
   (b) BEZ zależności od stanu przygotowanego SQL-em wokół suity (wygasły trial / operator / canceled),
   (c) < ~60 s razem. Rekomendowane pokrycie: landing 200 + tytuł · ceny z `public_prices` (edge żyje) ·
   `?ref` localStorage · płatna bramka fail-closed bez sesji → 401 · detektor nachodzeń/​h-scrolla na KLUCZOWYM
   widoku (kilka szerokości). Pełna ścieżka `402` (paywall przy wygasłym trialu) zostaje w PEŁNEJ suicie (wymaga
   fixture-stanu). Preflight ustawia `E2E_SMOKE=1` → `global-setup` ogranicza fixture do minimum (np. tylko user A,
   reużywalny, zero maili). Konta smoke = reużywalny fixture (idempotentny signup), nie akumulują się.
5. Migracja w diffie bez odpowiadającego wpisu/aplikacji → ostrzeżenie (migracja PRZED pushem kodu).

### Instalacja: `scripts/install-hooks.sh`
Instaluje `.git/hooks/pre-push` → `node scripts/preflight.mjs`. Hook w repo (starter ma go od
scaffoldu; każda nowa apka dziedziczy). Ominięcie (`--no-verify`) tylko świadomie w hotfixie +
natychmiastowy follow-up (wzór z landingów tn-crm).

### CI (opcjonalnie, docelowo): GitHub Actions + Vercel „wait for checks"
Twarda warstwa niezależna od lokalnej maszyny. Odłożone jako retro — pre-push hook + rytuał sesji
pokrywają pilot; CI wart wdrożenia przy większej liczbie aplikacji / kontrybutorów.

---

## Gdzie to żyje we wzorcu
- SESJA-START-FABRYKA.md §1 (rytuał kroku): SECURITY-TRIAGE + GATE B jako punkty rytuału.
- METODYKA-BUDOWY.md: rozszerzony rytuał sesji + §5 bramki człowieka.
- projekt.html: prompty kroków wrażliwych (schemat_db, auth_konta, platnosci_e2e, panele,
  wiadomosci_*, polecenia, testy_klienta, landing) dostają wymóg GATE A; krok `audyt` = pętla do
  wyczerpania + re-trigger przy większych zmianach.
- CLAUDE.md aplikacji (starter): sekcja „Gate bezpieczeństwa i testów" + komenda `npm run preflight`.
- audit-static.mjs: rozszerzone reguły (escape, CDN pin, service_role front).
