# AUTOPILOT APLIKACJI — nadrzędny runbook procesu fabryki TN App

> **SSOT drogowskazu.** Ten plik stoi NAD `METODYKA-BUDOWY.md` (jak) i `SESJA-START-FABRYKA.md` (stan).
> Tamte opisują rytuał kroku i historię pilota — TU jest maszyna, która mówi **co robić TERAZ** i jak
> nie zgubić stanu. Czytaj przy KAŻDYM starcie sesji nad aplikacją.

## 0. Teza (dlaczego to istnieje)

**Drogowskazem jest panel + DAG + komendy — NIGDY narracja agenta.** Trzy źródła prawdy, w tej kolejności:
1. **`wfa_steps`** (żywy stan w bazie) — jedyne źródło postępu.
2. **`docs/stworze/dag-manifest.json`** — twardy DAG: `requires`, `parallel_group`, `files_owned`,
   `ext_tokens` (bramki ludzkie), `actor`, `model`, `loop`.
3. **Komendy `next` / `gaps` / `resume`** (`scripts/wfa-panel-sync.mjs`) — czytają 1+2 i mówią,
   co robić / czy skończone / jak wznowić.

**Suma zwrotów subagentów ≠ stan projektu.** Raport z „nad czym pracowano" widzi tylko podzbiór
kroków; prawdą o postępie jest panel (L-028, L-053). Orkiestrator NIE trzyma stanu w głowie — pyta `next`.

Trzy komendy, trzy momenty:

| Komenda | Kiedy | Co daje |
|---------|-------|---------|
| `next --project <p> [--flags "..."]` | **START** sesji i po każdej domkniętej fali | ▶ do startu (równolegle) · ⏳ w toku · 🧍 czeka na człowieka (KTO—CO) · 🔒 zablokowane |
| `gaps --project <p>` | **KONIEC** sesji (bramka raportu) | luki [BEZ-POWODU] vs [MA-NOTĘ]; exit 1 blokuje „wszystko zrobione" |
| `resume --project <p> --repo <ścieżka>` | **PAD** / nowa sesja na istniejącym projekcie | in_progress+noty · ostatnie activities · git log + ogon BUILDLOG · „NASTĘPNY RUCH" |

## 1. Role i modele (POLITYKA MODELI — jawny `model:` przy KAŻDYM spawnie)

- **Fable 5 = ORKIESTRATOR.** Zarządza, planuje fale, syntezuje, decyduje kierunek kreatywny.
  **NIE buduje osobiście** i **NIGDY nie robi audytu** (audyt bezpieczeństwa/adwersarski na Fable = zakaz).
- **Sonnet 5 = tory budowlane (default).** Fan-out w worktree (izolacja) — patrz `dag-manifest` `files_owned`.
- **Haiku = robota mechaniczna** (skrypty/REST: sync panelu, gate-check, backfill, F-1/F6-klasy).
- **Opus 4.8 = audyty i otwarta kreatura/architektura** (krok `audyt` ma `model:"opus"` w manifeście;
  KRYTYK, projektowanie gate'ów, kod nietypowy).
- Env `CLAUDE_CODE_SUBAGENT_MODEL` = bezpiecznik; **jawny `model:` w spawnie wygrywa**. Eskalacja
  Sonnet→Opus zawsze z notą w BUILDLOG/LEDGER.

## 2. Protokół sesji

### START
1. `resume --project <p> --repo <repo>` — odtwórz stan (in_progress, activities, git, BUILDLOG).
   Na świeżym projekcie bez padu wystarczy `next`.
2. `next --project <p> [--flags "..."]` — zobacz falę: co READY (per `parallel_group`), co czeka.
   `--flags` podajesz dla bramek ludzkich, które W MIĘDZYCZASIE spełniono (np. `ext:tomek_name` po
   wyborze nazwy) — bez flagi ext bez inferencji = krok zostaje „czeka na człowieka".
3. Zaplanuj falę: kręgosłup najpierw, potem równoległe tory.

### PRACA (jedna fala)
1. **KRĘGOSŁUP przed torami.** Kroki, od których zależy wiele innych (`schemat_db`, `auth_konta`,
   `paczka_cc`) idą pierwsze i sekwencyjnie.
2. **KONTRAKTY NA PIŚMIE przed fan-outem.** Zanim rozdzielisz tory, spisz interfejsy (nazwy edge,
   sygnatury RPC, kształt tabel, klucze storage) w BUILDLOG/paczce — tory kodują pod kontrakt, nie zgadują.
3. **Fan-out torów wg `parallel_group` + `files_owned`.** Dwa READY dzielące plik = KOLIZJA (`next`
   ostrzega) → rozdziel pliki albo rób sekwencyjnie. Tory w osobnych worktree.
4. **Merge SEKWENCYJNY z bramkami.** Każdy tor: GATE A (jeśli dotknął wrażliwej powierzchni) → merge →
   następny. Nie zlewaj równolegle do main.
5. **Sync panelu NATYCHMIAST — jako STAN DOCELOWY, nie przyrost „na pamięć".** Po zrobieniu rzeczy:
   `step <key> --status ... --check ...` (checklisty **VERBATIM z WS** — L-028). Po syncu porównaj CAŁĄ
   tabelę (`steps`), nie tylko krok, nad którym pracowano.
6. **Pętle jakości ⟳ DO WYCZERPANIA** (kroki z `loop:true`) — świeży krytyk → naprawy → kolejna świeża
   runda, aż zero nowych uwag; dedup znalezisk (seen-lista w BUILDLOG), inaczej pętla nie konwerguje.

### KONIEC
1. `gaps --project <p>` — **bramka raportu**. „Wszystko zrobione" wolno napisać WYŁĄCZNIE przy zero
   pozycji **[BEZ-POWODU]** (exit 0). `done` z niepełną checklistą = luka.
2. Raport MUSI mieć sekcję **„Kroki niedomknięte i dlaczego"** z `gaps` — każda pozycja [MA-NOTĘ]
   jawnie, bramki ludzkie z rozwiązaniem KTO/CO (z `next` → sekcja 🧍).

### PAD (idempotentne wznowienie)
- Powtarzający się błąd API = NIE retry w pętli. Jeśli da się jeszcze pisać: dopisz do BUILDLOG
  `PRZERWANO — <ostatnia faza>, <następny krok>` i zakończ.
- Nowa sesja: `resume` (nie rekonstrukcja z transkryptu). Status kroku `in_progress` + brak świeżego
  wpisu BUILDLOG = „byłem, padłem, wznów", nie „zacznij od nowa". Przed dopisaniem — zweryfikuj stan
  świata (SELECT-y, `ls migrations/`), pad mógł nastąpić między akcją a wpisem.

## 3. STANDARDOWA STOPKA SPAWNU (wklej DOSŁOWNIE w KAŻDY prompt agenta)

> (1) Wyniki własnych zadań tła odbierasz AKTYWNIE (TaskOutput blokująco) — notyfikacja NIE przyjdzie po
> końcu twojej tury; NIGDY nie kończ tury «czekam na notyfikację» [L-049]. (2) Zanim zgłosisz sukces,
> zapisz wynik TRWALE (plik/commit/panel) [§3b]. (3) Sync panelu NATYCHMIAST po zrobieniu rzeczy,
> checklisty VERBATIM z WS [L-028]. (4) Zwrot = finalny raport z dowodami; brak dowodu = nie zrobione.

## 4. Bramki ludzkie (tylko te przechodzą przez człowieka)

Wszystko inne fabryka rozstrzyga SAMA (decyzja Tomka 20.07: MVP scope, pricing, logo, nazewnictwo,
otwarte decyzje handoffu = SESJA; audit trail = DECYZJE.md + `wfa_notes`). Przez człowieka idą TYLKO:

- **3 klasy Tomka:** (a) wybór nazwy + zakup domeny (`ext:tomek_name/_domain_buy/_ns`);
  (b) wydatki z jego pieniędzy — prawnik/subskrypcje (`ext:tomek_ext_spend`), start/opłata
  (`ext:tomek_pay_launch`); (c) fizyczna wysyłka maili/SMS do realnych ludzi (`ext:tomek_send_mail`).
- **Akcje klientki/operatora:** KYC (`ext:client_kyc`), materiały (`ext:client_materials`), podpis
  (`ext:client_sign`), demo/testy/konto (`ext:client_demo/_test/_account`).

Każda bramka = **ext-token w manifeście** + widoczna w `next` jako „🧍 KTO — CO". **Nie stój na bramce:**
rób pracę „obok" wg `next` (inne READY / kręgosłup), a bramkę przygotuj do końca (draft maila gotowy,
KYC-link wysłany). Eskalacja gdy blokuje ścieżkę krytyczną: nota w kroku → sekcja raportu „niedomknięte" →
(przyszłość) followup >5 dni bez ruchu.

## 5. Bezpieczniki (egzekwowane, nie deklaratywne)

- **GATE A** (zmiana wrażliwa: migracja/RLS/edge/auth/role/płatności/storage/upload/render-danych-usera/
  sekrety/CDN/publiczny-endpoint) → zakresowy audyt adwersarski PRZED mergem; marker `SEC-CHECK:` w BUILDLOG.
- **GATE B** — większa zmiana (`public/js`/`functions`/`migrations`) nie idzie na main bez zielonej suity
  E2E + audit-static. Oba egzekwuje `preflight.mjs` + pre-push hook.
- **Zakaz zmian płatności/RLS bez trybu** — pre-launch (cron off, brak realnych userów) = deploy
  autonomiczny OK; apka LIVE z realnymi userami = gałąź + preview.
- **Pętle:** kroki `loop:true` (jakość/UX/krytyk) = pętla konwergująca BEZ limitu do czystej rundy;
  pętle async-pipeline/naprawcze techniczne = cap 3-4 → terminal + eskalacja (nie kręć w nieskończoność).
- **Bramka cronów** przy kroku `start_live`: `select jobname from cron.job` = komplet z manifestu
  (plik migracji ≠ aktywny job — L-042).
- **Shift-left detektorów:** klasę błędu złapaną raz zamień w AUTOMAT (audit-static/suita), nie w
  „więcej patrzenia" — inaczej wróci.

## 6. Soft-guard `step … --status done`

`wfa-panel-sync.mjs` odmówi oznaczenia kroku `done`, jeśli jego `requires` (nie-ext) z manifestu nie są
done — mechaniczna ochrona DAG przed „done-z-wyprzedzeniem". `--force` przechodzi, ale wymaga `--note`
(powód) i dopisuje prefiks `[force-done]`. Kroki spoza manifestu = wolne (guard ich nie dotyczy).

---
*Powiązane: `METODYKA-BUDOWY.md` (rytuał kroku, §4.8 bramka gaps), `SESJA-START-FABRYKA.md` (stan pilota),
`LEKCJE-FABRYKI.md` (L-028/L-049/L-053/L-054), `dag-manifest.json` (DAG + ext-tokeny).*
