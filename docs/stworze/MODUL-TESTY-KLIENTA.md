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
