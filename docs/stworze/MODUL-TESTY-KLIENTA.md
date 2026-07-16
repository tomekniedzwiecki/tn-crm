# MODUŁ TESTY KLIENTA („spowiednik testów") — koncept fabryki

> Standard fabryki TN App (decyzja Tomka 15.07). Uniwersalny — żyje w tn-crm (portal + panel +
> edge), działa dla KAŻDEGO projektu aplikacji bez zmian w samej aplikacji.
> Krok workflow: `testy_klienta` (Etap 6 „Start", sort 6 — między Demo a Poprawkami po demo).

## Cel i zasada

Po demo klient-operator dostaje etap testów „do ręki": w SWOIM portalu rozmawia z AI jak ze
spowiednikiem — opowiada co nie działa / co przeszkadza / co by zmienił, DOKLEJA ZRZUTY EKRANU,
a AI dopytuje jak dobry tester (gdzie, jakie kroki, czego oczekiwał, co zobaczył, telefon czy
komputer) i składa z rozmowy USTRUKTURYZOWANE ZGŁOSZENIA. Tomek widzi zgłoszenia w panelu
projektu, ZATWIERDZA lub ODRZUCA (z komentarzem widocznym klientowi) i jednym ruchem ZLECA
fabryce pracę nad zatwierdzonymi. Nic nie jest wdrażane bez zatwierdzenia Tomka.

Filozofia jak w spowedniku know-how: klient MÓWI swobodnie, struktura powstaje po stronie AI.
Klient nigdy nie wypełnia formularza bugtrackera.

## Architektura (wszystko w tn-crm — zero zmian w aplikacjach)

### Dane (migracja `wfa_test_*`)
- `wfa_test_sessions` — id, project_id, started_at, last_activity_at, status (open/closed).
  Jedna „żywa" sesja na projekt (klient może wracać — rozmowa trwa, jak spowiednik).
- `wfa_test_messages` — session_id, role (user/assistant), content, attachments jsonb
  (ścieżki storage), created_at. Transkrypt = kontekst rozmowy + audyt.
- `wfa_test_issues` — id, project_id, session_id, seq (nr zgłoszenia per projekt),
  title (krótki, po polsku), description (kroki/oczekiwane/faktyczne — złożone przez AI),
  area (ekran/moduł), device (mobile/desktop), severity_sugerowana (krytyczne/istotne/kosmetyka
  — sugestia AI, Tomek może zmienić), screenshots jsonb (ścieżki), quote (dosłowny cytat
  klienta — zachowujemy jego język!), status: **new → approved / rejected → in_progress → done**,
  tomek_comment (widoczny klientowi przy rejected/done), created_at, decided_at, done_at.
- RLS: WYŁĄCZNIE team_members (jak wfa_*); klient przez edge (token portalu). ZERO anon.
- Storage: bucket **`wfa-test-shots` (PRIVATE)** — upload przez edge (wzór intake: upload_init/
  done + signed URLs 1h); ścieżka `<project_id>/<session_id>/<uuid>.png`.

### Edge `wfa-test-chat` (serce modułu)
Gate = token + hasło portalu klienta (dokładnie jak wfa-portal; podgląd admina = READ-ONLY).
Akcje:
- `history` — transkrypt + lista zgłoszeń klienta (z statusami i komentarzami Tomka).
- `message` — tura rozmowy: kontekst = system prompt + transkrypt + METADANE PROJEKTU
  (nazwa apki, domena, lista ekranów z brief/02 wklejona do wfa_projects.test_context przy
  aktywacji kroku — AI zna aplikację, o której mowa!). Model: OpenAI (jak spar-chat; vision-
  capable dla screenshotów). AI dopytuje aż temat wyczerpany, wtedy TOOL-CALLEM emituje
  `create_issue{title, description, area, device, severity, quote}` → INSERT wfa_test_issues
  (screenshoty z bieżącego wątku doklejane) → w odpowiedzi klientowi potwierdzenie
  „Zapisałem zgłoszenie nr 7: …" i NATURALNE przejście („Co jeszcze zauważyłeś?").
- `upload_init` / `upload_done` — zrzut ekranu (klient: przycisk aparatu / przeciągnij / wklej
  ze schowka Ctrl+V — WAŻNE, bo to najszybsza droga na desktopie); po uploadzie AI OGLĄDA
  zrzut (vision) i odnosi się do niego w rozmowie.
- `end` — klient mówi „to wszystko" → AI podsumowuje listę zgłoszeń, sesja closed (może wrócić
  — nowa sesja).
- Rate-limit (wzór _shared/ratelimit), deadline bezpieczeństwa, koszty logowane (ai_usage
  wzór; pamiętać o ryzyku insufficient_quota — błąd ma być miękki dla klienta).

### Portal klienta (portal.html — nowa karta „Testy aplikacji")
Widoczna gdy krok `testy_klienta` ≥ in_progress. Zawartość:
- Czat jak spowiednik (bąbelki, wskaźnik pisania), pole tekstowe + przycisk zrzutu
  (upload/wklej/przeciągnij; miniatura w wątku).
- Pasek „Twoje zgłoszenia: N" + lista: nr, tytuł, status po ludzku (Nowe / Przyjęte do
  poprawki / Odrzucone — z komentarzem Tomka / Poprawione ✅). Klient WIDZI, że jego głos
  działa (sprawczość) — a przy „Poprawione" buduje się zaufanie przed startem.
- Ton: „Przetestuj swoją aplikację i powiedz mi o wszystkim, co Ci nie gra — nawet drobiazgi.
  Zrzut ekranu bardzo pomaga."

### Panel Tomka (tn-app/projekt.html — sekcja „Testy klienta" w kroku / zakładka)
- Lista zgłoszeń projektu: nr, tytuł, area, severity (edytowalna), miniatury zrzutów
  (klik = pełny podgląd signed URL), cytat klienta, fragment transkryptu (kontekst).
- Akcje per zgłoszenie: **ZATWIERDŹ** / **ODRZUĆ** (modal z komentarzem — klient go zobaczy)
  / edycja severity. Licznik „nowe" na karcie kroku.
- Przycisk **„ZLEĆ PRACĘ NAD ZATWIERDZONYMI"**: (a) zatwierdzone zgłoszenia → pozycje
  checklisty kroku `poprawki_demo` (format „[TK-<seq>] <tytuł>"), (b) generuje PROMPT sesji
  naprawczej (jak mapa promptów: pełne opisy + linki signed do zrzutów + zasada pętli
  do wyczerpania + po naprawie status done na issue → klient widzi ✅ w portalu).
- Zgłoszenie naprawione → status done automatycznie odhacza pozycję checklisty (lub sesja
  naprawcza robi to w rytuale panelu).

### Workflow (step_defs)
- NOWY krok `testy_klienta` (stage 6, sort 6, owner=client, label „Testy klienta (zgłoszenia)",
  milestone „Uwagi z testów zebrane"): checklista: link do testów przekazany klientowi →
  klient przeszedł testy (≥1 sesja) → zgłoszenia rozstrzygnięte przez Tomka (0 „new") →
  zatwierdzone przekazane do poprawek.
- `poprawki_demo` (sort 8) = wykonanie: checklista zasilana z modułu; pętla do wyczerpania
  obowiązuje; kamień bez zmian.
- Aktywacja karty w portalu: status kroku `testy_klienta` (in_progress = karta widoczna).

## Zasady twarde
- Klient NIE widzi zgłoszeń odrzuconych bez komentarza — każde „odrzuć" wymaga 1 zdania po
  ludzku (szablon: „Dzięki! Tego nie ruszamy, bo…"). Szacunek do testera.
- AI NIE obiecuje klientowi wdrożenia („przekażę do przeglądu" — decyzja = Tomek).
- AI NIE zna sekretów/wewnętrznych szczegółów; kontekst = tylko test_context + transkrypt.
- Screenshoty prywatne (bucket private + signed 1h) — mogą zawierać dane klientów operatora.
- Deduplikacja: AI przy tworzeniu zgłoszenia dostaje listę TYTUŁÓW istniejących → dopina
  do istniejącego zamiast dublować (append notatki), gdy to samo.
- Koszt/nadużycia: rate-limit per token; kill-switch `wfa_test_chat_enabled` w settings.

## Mózg spowiednika — konstruktywny sceptycyzm (decyzja Tomka 15.07)

AI **nie jest potakiwaczem**. Klienci potrafią przekombinować albo poprosić o rzecz sprzeczną
ze świadomą decyzją projektu — a bezkrytyczne zapisanie wszystkiego generuje szum i złe poprawki.
Spowiednik ma być **mądrym filtrem, który myśli o całości aplikacji**, ale NIGDY nie decyduje sam —
decyzja zawsze należy do Tomka. Zasada obowiązuje w OBU trybach (`testy` i `feedback`); żyje wyłącznie
w system prompcie edge (`SCEPTYK` + `MARKER_BRAIN_FIELDS` w `wfa-test-chat`), zero zmian w innych warstwach.

**Źródło wiedzy o granicach = `wfa_projects.test_context`.** Aby sceptycyzm działał, kontekst musi mieć
sekcje: **EKRANY**, **ZAKRES MVP v1 + NIE-FUNKCJE** (co świadomie pominięte), **GRANICA v1 vs rozwój**,
**KLUCZOWE DECYZJE z uzasadnieniem**, **ZNANY BACKLOG v1.1** (plan rozwoju). Bez uzasadnień AI nie ma
czym kontrować — wypełnienie test_context to warunek działania „mózgu".

### Reguły reakcji
- **BŁĄD = bez dyskusji.** Coś nie działa / psuje się / źle wygląda → AI dziękuje, dopytuje o repro
  (gdzie, kroki, urządzenie) i zapisuje. Nigdy nie podważa zgłoszenia błędu.
- **POMYSŁ / ZMIANA → najpierw ZROZUM (po co? jaki problem rozwiązuje?), potem SKONFRONTUJ** z kontekstem:
  - **(a) sprzeczny ze świadomą decyzją** → AI wyjaśnia decyzję i jej powód, pyta, czy to zmienia perspektywę.
  - **(b) poza granicą v1** → AI mówi wprost, że to **rozwój** (nie „w cenie"), zapisze jako propozycję rozwoju;
    w markerze `poza_v1: true` (panel pokazuje tag „rozwój (poza v1)").
  - **(c) przekombinowany / antywzorzec** (komplikuje flow userów, skrajny przypadek <1%, dubluje istniejącą
    funkcję) → AI kontruje **jednym konkretnym argumentem** i proponuje prostszą alternatywę.
  - **(d) już w backlogu v1.1** → AI mówi, że to już zaplanowane.
- **Sensowny, prosty pomysł w granicach v1 → przyjmij BEZ sztucznej kontry.** Sceptycyzm chroni klienta,
  nie utrudnia mu życia — nie szukamy dziury w całym na siłę.

### Zasada sprawczości (max 1 runda kontry)
Jeśli po kontrze klient **podtrzymuje** zdanie — koniec dyskusji. AI zapisuje zgłoszenie **bez dalszego
męczenia** (max 1 runda kontry na temat) i w zgłoszeniu zapisuje `flags.ai_pushback` = zwięzły argument AI
+ odpowiedź klienta. AI **nigdy nie mówi „odrzucam"**; mówi „zapiszę z moją uwagą — zdecyduje zespół".
Decyzja ZAWSZE = Tomek.

### `flags` na `wfa_test_issues` (migracja `20260715e_wfa_test_issues_flags.sql`)
Kolumna `flags jsonb NOT NULL DEFAULT '{}'`:
- `ai_pushback` (text) — zastrzeżenie AI + odpowiedź klienta; ustawiane TYLKO gdy AI podważyło,
  a klient podtrzymał. Panel Tomka (sekcja „Testy klienta", `tkRow`) renderuje wyróżnioną adnotację
  **„⚠ Zastrzeżenie AI: …"** przy ZATWIERDŹ/ODRZUĆ, żeby kontekst był widoczny od razu.
- `poza_v1` (bool) — propozycja poza zakresem wersji 1 (rozwój); panel pokazuje tag „rozwój (poza v1)".

Marker `<zgloszenie>` niesie oba pola (`"ai_pushback":null,"poza_v1":false` domyślnie); parser i `insertIssue`
składają z nich `flags` (przy `dodaj_do` — merge z istniejącymi). Zero żargonu w rozmowie z klientem
(zakaz: scope/backlog/ROAS/CPM — mów „zakres wersji 1", „plan rozwoju", „na później").

## Zakres per warstwa
- **FABRYKA (tn-crm, raz):** migracja, edge wfa-test-chat, karta portalu, sekcja panelu,
  krok workflow, prompt kroku w projekt.html. Każdy projekt dostaje moduł automatycznie.
- **PER PROJEKT (aktywacja):** wypełnienie `wfa_projects.test_context` (lista ekranów/funkcji
  z brief/02 — robi to sesja przy przejściu do kroku) + przekazanie klientowi info w portalu
  (your_move) i mailem systemowym (wfa-partner-mail).

## Ryzyka
- OpenAI quota/billing (pamięć: insufficient_quota = lejki down) — miękki fallback w UI
  („spróbuj za chwilę") + alert do Tomka.
- Klient wkleja zrzut z danymi wrażliwymi — bucket private, dostęp tylko Tomek/edge.
- Rozjazd rozmowa↔zgłoszenia (AI nie wyemitował create_issue) — przycisk „end" ZAWSZE robi
  sweep: model dostaje transkrypt od ostatniego issue i decyduje, czy coś zostało niezapisane.

## Tryb „feedback" po starcie (B13)

Ten sam silnik obsługuje DWA scenariusze — sterowane kolumną `wfa_projects.test_mode`
(text, `NOT NULL DEFAULT 'testy'`; migracja `20260715d_wfa_test_mode.sql`, CHECK
`in ('testy','feedback')`; flaga retro — istniejące projekty dostają `'testy'`):

- **`testy`** (domyślny) — spowiednik testów PRZED startem: klient testuje wersję roboczą,
  AI zbiera BUGI (gdzie / kroki / czego oczekiwał / co zobaczył / urządzenie).
- **`feedback`** — po starcie aplikacja już DZIAŁA i jest używana; operator zgłasza
  **propozycje rozwoju i problemy** z codziennej pracy. Ton AI: „zbieram propozycje
  rozwoju i problemy". AI dopytuje o STAN OBECNY, PROPONOWANĄ ZMIANĘ / OBJAW oraz KORZYŚĆ
  lub KŁOPOT (zamiast kroków reprodukcji buga).

**Zasada twarda: tryb zmienia WYŁĄCZNIE system prompt** edge `wfa-test-chat`
(`buildSystemPrompt(..., mode)`). Marker `<zgloszenie>`, parser, INSERT do `wfa_test_issues`,
walidacja `severity`, panel Tomka, statusy (`new→approved/rejected→in_progress→done`),
zrzuty ekranu i karta portalu są **WSPÓLNE** — ZERO zmian struktur ani UI (panel i portal
czytają te same wiersze).

**Kategoria przez `severity` (bez zmiany schematu).** W trybie `feedback` prompt każe AI
używać pola `severity` jako kategorii, mapując na dozwolone wartości (`SEV_OK`):

| Kategoria (feedback) | `severity` w bazie | Znaczenie |
|---|---|---|
| Pomysł / propozycja rozwoju | `kosmetyka` | coś nowego lub usprawnienie |
| Problem (przeszkadza) | `istotne` | utrudnia codzienną pracę |
| Problem (blokuje) | `krytyczne` | blokuje pracę operatora |

Dodatkowo AI prefiksuje `title` znacznikiem `[Pomysł]` / `[Problem]`, więc kategoria jest
czytelna w panelu bez żadnej zmiany UI. Interpretacja `severity` po stronie Tomka: dla
projektów `feedback` `kosmetyka` = pomysł, `istotne`/`krytyczne` = problem.

**Aktywacja per projekt:** `UPDATE wfa_projects SET test_mode='feedback' WHERE id=…`
(np. gdy aplikacja przeszła na etap `stery` / działa u operatora). Reszta modułu bez zmian.

## Dostęp do kodu (diagnoza) — WYCOFANE (U8 usunięte 15.07)

Feature „dostęp spowiednika do kodu" (narzędzie `czytaj_kod`, sekret `GITHUB_READ_TOKEN`,
pola diagnozy `code_ref`/`hipoteza`/`proponowana_naprawa` w `wfa_test_issues.flags`, blok
„Diagnoza AI" w panelu + wstrzykiwanie diagnozy do promptu sesji naprawczej) **został w całości
usunięty** (decyzja Tomka, sesja SEC-C, 2026-07-15). Powód: adwersarski audyt wykrył wektor
prompt-injection — model mógł dopisać do frazy `szukaj` własny kwalifikator `repo:…`, a GitHub
Code Search OR-uje wiele `repo:`, co otwierało odczyt kodu fabryki/innych klientów (cross-repo /
cross-tenant). Zamiast łatać sanityzacją zlikwidowano wektor u źródła: spowiednik NIE ma już
żadnego dostępu do repozytoriów. Sekret `GITHUB_READ_TOKEN` skasowano z projektu edge.

Spowiednik testów działa dalej bez zmian w reszcie zakresu: przyjmuje uwagi/błędy, „mózg"
konstruktywnego sceptycyzmu (U7: `flags.ai_pushback`, `flags.poza_v1`) działa, zgłoszenia
`wfa_test_issues` powstają — tylko **bez** diagnozy z kodu. Sesję naprawczą prowadzi wykonawca
pełnym rytuałem fabryki, lokalizując miejsce samodzielnie.

## Portal = jeden punkt wejścia partnera (16.07)

Portal klienta (`tn-app/portal.html`) ma wyraźny przycisk **„Otwórz swoją aplikację → <domena>"**
(karta u góry, `target="_blank"`), widoczny TYLKO gdy `wfa_projects.app_url` jest ustawiony (edge
`wfa-portal` zwraca `app_url`; fallback: `https://` + `domain`). Dzięki temu partner ma jeden link
(portal) jako centrum: stąd jednym klikiem wchodzi do samej aplikacji, żeby ją przetestować — nie
musi pamiętać osobnego adresu ani żonglować dostępami. Zmiana jest UNIWERSALNA (portal obsługuje
wszystkie projekty fabryki). Bezpieczeństwo: front dopuszcza w `href` wyłącznie `https://`
(odrzuca `javascript:`/`data:`), a `app_url` zawsze pochodzi z projektu wiązanego z tokenem portalu.

Zaproszenie do testów / onboarding to **human touch Tomka (WhatsApp)**, NIE automat — automatyczne
są tylko wiadomości transakcyjne (patrz `feedback-operator-human-touch-momenty-relacyjne.md`).

## Serie poprawek (rundy) + timestampy + transkrypt w panelu (16.07, TK-SERIE)

Trzy rozszerzenia modułu (wymagania Tomka 16.07). Migracja `20260716b_wfa_test_rundy.sql`.

### 1) Timestampy wiadomości (strefa Europe/Warsaw)
Każda wiadomość (klient + AI) ma widoczny, dyskretny timestamp: `dziś 14:32` / `wczoraj 14:32`
/ `16.07, 14:32`. Dane były od zawsze (`wfa_test_messages.created_at`) — teraz edge JE ZWRACA
(`history.messages[].created_at`, `test_admin.messages[].created_at`), a front renderuje helperem
`fmtChatTime(iso)` (Europe/Warsaw, `toLocaleDateString('en-CA')` do porównania dnia). Portal:
w dymku (`.tk-ts`); świeżo wysłane bąbelki dostają `new Date()`. Panel: w transkrypcie.

### 2) Transkrypt rozmowy w panelu (jak spowiednik ze `spar_messages`)
Panel `projekt.html`, krok „Testy klienta": pod zgłoszeniami zwijany blok **„Pokaż pełną rozmowę
(transkrypt · N)"** — PEŁNA rozmowa klienta z AI (user+assistant, timestampy, miniatury zrzutów
signed). Tomek widzi KONTEKST, nie tylko wyekstrahowane zgłoszenia. Dane: `test_admin.messages`
(edge dokłada `created_at` + signed URL zrzutów, gate = team JWT). Render **wyłącznie przez
`escapeHtml` (atrybutowy, SEC-D2) / `encodeURIComponent` dla URL** — treść = dane klienta, zero
surowego innerHTML (analogicznie do `loadSpowiednik`/`tkRow`).

### 3) Serie poprawek (rundy) — model
Cykl: klient testuje → zgłasza uwagi (runda N) → Tomek rozstrzyga+zleca → poprawki →
**„Zamknij serię poprawek"** (podsumowanie rundy N, powiadomienie klienta) → klient testuje
ponownie → uwagi = runda N+1 → aż czysto. Wiele rund, historia zostaje.

**Dane:**
- `wfa_projects.test_round int NOT NULL DEFAULT 1` — bieżąca (otwarta) runda.
- `wfa_test_issues.round_no int NOT NULL DEFAULT 1` — runda powstania zgłoszenia. **Ustawiany
  WYŁĄCZNIE przez edge z `test_round` (klient NIGDY nie podaje w body — niemanipulowalny).**
- `wfa_test_rounds (project_id, round_no, opened_at, closed_at, summary jsonb)` — jedna runda;
  `summary` liczone przy zamknięciu (`reported/fixed/rejected/in_progress/dev_v11`). Dedykowana
  tabela (nie nota/activity), bo panel grupuje po rundach i renderuje nagłówki z podsumowaniem,
  a portal pokazuje komunikat po zamknięciu. RLS = team_members, ZERO anon.

**Edge `wfa-test-chat`:**
- `create_issue` (marker) → `round_no = curRound` (bieżący `test_round`).
- `history` → `round` + `round_notice` (po zamknięciu rundy i zanim klient dorzuci coś w nowej
  rundzie: „Poprawki z rundy N są gotowe — przetestuj ponownie…"); issues z `round_no`.
- `test_admin` → `test_round` + `rounds[]` (z summary) + `messages[]` (transkrypt) + issues z `round_no`.
- **`close_round`** (nowa akcja, gate = team JWT): warunek = 0 zgłoszeń w statusie `new` w bieżącej
  rundzie (i ≥1 zgłoszenie); (a) liczy+zapisuje `summary`, (b) `closed_at=now()`, (c) `test_round++`,
  (d) otwiera wiersz następnej rundy. `409 unresolved` gdy są nierozstrzygnięte; `409 empty_round`
  gdy runda pusta. Powiadomienie klienta = komunikat w portalu (human touch, NIE automatyczny mail).

**Panel `projekt.html`:** zgłoszenia GRUPOWANE po `round_no`. Nagłówek każdej rundy: „Runda N —
otwarta/zamknięta + podsumowanie (zgłoszonych X · naprawionych Y ✅ · odrzuconych Z · rozwój v1.1 W)".
Bieżąca otwarta runda u góry z przyciskiem **„Zamknij serię poprawek (Runda N)"** (aktywny gdy 0
„nowych" i ≥1 zgłoszenie). Zamknięte rundy = historia zwinięta (`<details>`). „Zleć pracę nad
zatwierdzonymi" dopisuje pozycje `[TK-<seq>] (runda N) <tytuł>` do checklisty `poprawki_demo`.

**Portal `portal.html`:** zgłoszenia z tagiem „Runda N" (grupowanie gdy >1 runda); po zamknięciu
serii banner „Poprawki z rundy N gotowe — przetestuj ponownie" (znika, gdy klient dorzuci nowe
zgłoszenie). Nowa runda = klient kontynuuje czat, nowe zgłoszenia → `round_no = N+1`.

**Współgranie z workflow:** krok `testy_klienta` powtarzalny (rundy); `poprawki_demo` zasilany per
runda (`[TK-<seq>] (runda N)`).

## Ergonomia czatu testów: większe okno + pełny ekran + zrzut ekranu (16.07, TK-UX)

Standard portalu testów (`tn-app/portal.html`, sekcja „Testy aplikacji"). Klient-operator
dużo pisze i dokleja zrzuty, więc czat musi być duży i wygodny — trzy rzeczy stałe:
- **Wysokość okna czatu = viewport-relative** (`.tk-chat { height:64vh; max-height:660px;
  min-height:360px }`, mobile 66vh). Nie stały `max-height` w px — więcej wiadomości widać
  bez scrolla. (Wcześniej `max-height:54vh` — za nisko, zgłoszenie Tomka.)
- **Tryb pełnoekranowy** — przycisk **„Powiększ"** (ikona `ph-arrows-out` + LABEL tekstowy,
  akcentowany pill) w NAGŁÓWKU czatu (nie w polu wiadomości). Toggle klasy `#c-testy.fs`
  (overlay `position:fixed; inset:0`), chat rośnie `flex:1`, `.sdesc`/`.tk-issues` ukryte,
  `body.tk-fs-open{overflow:hidden}`; Esc zwija; label→„Zwiń", ikona→`ph-arrows-in`. Stan
  rozmowy zachowany (tylko toggle klasy, ZERO re-renderu). **Label na przycisku sam
  komunikuje opcję — ŻADNEGO osobnego bloku-hintu w obszarze rozmowy** (Tomek: blok-podpowiedź
  „Możesz powiększyć…" w oknie czatu przeszkadza i zabiera miejsce — usunięty; subtelność =
  tooltip `title` na hover).
- **Zrzut ekranu „od razu"** — przycisk `ph-monitor` w kompozytorze obok „dodaj z pliku":
  `navigator.mediaDevices.getDisplayMedia` (user gesture) → klatka na `<canvas>` → `toBlob('image/png')`
  → `File` → ta sama `uploadShot()` co załącznik. Graceful fallback gdy brak wsparcia lub brak zgody
  („użyj ikony obrazka / Ctrl+V"). CSP bez zmian: MediaStream idzie przez `video.srcObject`
  (nie URL), a upload leci do `*.supabase.co` już obecnego w `connect-src`. Permissions-Policy
  `camera=()/microphone=()` NIE blokuje `display-capture` (domyślnie `self`).

**GOTCHA uploadu (regresja z rundy bezpieczeństwa — root cause TK-UX):** bucket `wfa-test-shots`
po SEC-R3-UPLOAD dopuszcza `allowed_mime_types` = `image/png|jpeg|webp` TYLKO. Front `putFile`
wysyłał `Content-Type: file.type || 'application/octet-stream'`. Gdy przeglądarka nie ustawi
`file.type` (drag z aplikacji, część źródeł schowka, surowy blob) → `octet-stream` → **bucket
odrzuca PUT (400) → „dodawanie zrzutów nie działa"**. Fix: `uploadShot` NORMALIZUJE MIME do
realnego `image/*` (z rozszerzenia, potem `file.type`, fallback `image/png`) i przekazuje JAWNY
`Content-Type` do `putFile`. Bucket NIE poluzowany (nadal png/jpeg/webp; svg/gif/bmp odrzucane po
stronie klienta z komunikatem). **Zasada: gdy bucket ma `allowed_mime_types`, klient MUSI wysyłać
jawny, dozwolony `Content-Type` przy signed-URL PUT — nigdy `octet-stream`.** Ta sama pułapka
dotyczy każdego uploadu z hartowanym bucketem (patrz też `wfa-intake`).
