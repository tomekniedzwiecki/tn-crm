# START NOWEJ SESJI — praca nad fabryką TN App i pilotem Fachmat

> Plik-przekazanie (handoff) napisany 2026-07-14 przez sesję nocną, która przeprowadziła Etapy 3-5
> pilota Fachmat. Wklej do nowej sesji prompt z sekcji „PROMPT STARTOWY" na dole — reszta tego pliku
> to kontekst, który nowa sesja MA przeczytać w całości.

## 1. Model pracy (NIENARUSZALNY — tak pracujemy nad fabryką)

- **Fable 5 = zarządzanie, koncepty, design, audyt wzorców. Opus 4.8 = wykonanie (subagenci).**
  Mechaniczne drobiazgi: haiku/sonnet. Fable NIE wykonuje sesji budowlanych osobiście — deleguje
  z precyzyjnym briefem i ODBIERA dowody.
- **Rytuał KAŻDEGO kroku workflow (pilot = pierwszy przebieg, więc zawsze):**
  1. AUDYT WZORCA przed wykonaniem: przeczytaj prompt kroku (mapa promptów w `tn-crm/tn-app/projekt.html`),
     skonfrontuj z rzeczywistością repo/bazy → popraw prompt/desc/checklistę → commit tn-crm (pathspec,
     bo w repo bywa równoległa sesja landingowa!).
  2. WYKONANIE przez subagenta Opus z pełnym briefem (źródła, fazy, zakazy, format zwrotu).
  3. DOWODY, nie deklaracje: weryfikacja na ŻYWEJ produkcji (Playwright/SQL/curl), screenshoty,
     liczby przed/po; wpis do BUILDLOG repo aplikacji.
  4. LEKCJE PO WYKONANIU wracają do wzorca (prompt kroku) i/lub do saas-startera — commit.
  5. PANEL: checklista kroku wg FAKTÓW (teksty pozycji = klucz deduplikacji — przy zmianie tekstu
     migruj stan w tej samej sesji!), status, notatka z dowodami, INSERT wfa_activities; linki
     oglądalne → pasek „Podglądy" (wfa_projects.links).
  6. UWAGI (wfa_notes) wg zasad: (a) dotyczy kroku → zastosuj i zamknij z adnotacją ✅;
     (b) przyszłość → zostaw; (c) już zbudowane → [DEMO]/[v1.1]; (d) sprzeczne → DO DECYZJI TOMKA.
- **Pętle jakości — DO WYCZERPANIA (decyzja Tomka 14.07):** świeży krytyk (osobny subagent bez
  kontekstu budowy) → naprawy → KOLEJNA świeża runda (pełne polowanie, nie tylko re-test napraw) —
  tak długo, aż runda nie przyniesie ŻADNYCH nowych uwag. Bez limitu rund; kosmetykę też naprawiamy,
  nie odkładamy. Dedup znalezisk vs poprzednie rundy (seen-lista w BUILDLOG), inaczej pętla nie
  konwerguje. Dotyczy KAŻDEJ serii poprawek: landing, panele, design system, treści. Kroki jakości
  NIE przechodzą na done deklaracją — domyka je czysta runda.
- **Tomek prowadzi ślepe testy:** ma własną listę usterek i sprawdza, czy pętle je znajdą.
  KAŻDE jego zgłoszenie = naprawa + LEKCJA DO WZORCA (dotąd 5: marginesy boczne mobile per sekcja;
  kadry sekwencji hero na obu szerokościach + test przesłonięć elementFromPoint; sweep szerokości
  pośrednich 360/414/768/1024; wspólne kolumny list; świadoma siatka nagłówków złożonych widoków).
  Zasada: fabryka nie może robić takich błędów — odpowiedzią jest AUTOMAT (np. overlap-detector
  w suicie E2E), nie „więcej patrzenia".

## 2. Twarde zasady bezpieczeństwa (obowiązują każdego subagenta — wpisuj do briefów)

- **Realni userzy fachmata NIETYKALNI:** tomekniedzwiecki@gmail.com (operator), test@testp.pl,
  sfsfsf@gp.pl, palkabu@wp.pl (to Grzegorz). Zero maili do nich, zero modyfikacji, zero impersonacji.
- Testy wyłącznie na kontach `tomekniedzwiecki+fachmat-<cel>@gmail.com`; po teście CASCADE cleanup
  (DELETE FROM auth.users) i weryfikacja zerowych pozostałości.
- Przy testach wysyłek/cronów: `app_settings.kill_emails='true'` na czas testu i PRZYWRÓĆ; jedyny
  dozwolony adresat maili testowych = alias Tomka.
- Sekrety NIGDY w plikach/repo/BUILDLOG/notatkach — tylko maski; odzysk kluczy metodą echo-fn
  (tymczasowa edge fn + x-guard, DELETE natychmiast); service-role po legacy-OFF = `sb_secret_*`
  (żyje w Vault dla cronów).
- Zmiany RLS/migracje produkcyjne = formalnie bramka Tomka; w trybie autonomicznym wolno, gdy
  blokują shippowaną funkcję i są zawężające — ZAWSZE flagować do retro-akceptacji.
- tn-crm: deploy = git push main (NIE Vercel CLI); commity PATHSPEC (równoległe sesje!); migracja
  PRZED pushem kodu. Fachmat: deploy = git push main; edge deploy `npx supabase functions deploy <fn>
  --no-verify-jwt --project-ref cpzstoyvpfqydmoutcmk`.

## 3. Identyfikatory i ścieżki

- Repo: `c:\repos_tn\tn-crm` (panel fabryki) · `c:\repos_tn\fachmat` (pilot) · `c:\repos_tn\saas-starter`
  (template — lekcje backportuj tu z placeholderami {{...}}).
- Supabase: tn-crm = `yxmavwkwnfuphjqbelws` · fachmat = `cpzstoyvpfqydmoutcmk` (NIE mylić!).
- Projekt wfa fachmat: `102e4c74-ae3d-4cbf-885d-0826b283f7e6`; panel:
  crm.tomekniedzwiecki.pl/tn-app/projekt?id=102e4c74-ae3d-4cbf-885d-0826b283f7e6.
- SSOT: `tn-crm/docs/stworze/WORKFLOW-APLIKACJE-PLAN.md` (+ §6.2 etap Przegląd) i `METODYKA-BUDOWY.md`;
  wzorce kroków (desc/check/prompt) = `tn-crm/tn-app/projekt.html` (obiekt WS + mapa promptów).
- Pamięć auto-ładowana: `C:\Users\tomek\.claude\projects\c--repos-tn\memory\MEMORY.md` (jest wpis
  o strukturze 6 etapów i standardach z pilota).
- Struktura etapów: 1 Fundament · 2 Infrastruktura · 3 Budowa MVP (z mini-review rdzenia) ·
  4 Landing (research→koncept→budowa→pętla krytyka jako OSOBNE kroki) · 5 Przegląd (logika →
  bezpieczeństwo/audyt → UX panel usera → UX panel operatora → UX poprawki i pętla → zgodność
  z ustaleniami → treść → poprawki) · 6 Start (od demo_klienta).

## 4. Stan pilota Fachmat (na moment przekazania, 14.07 wieczorem)

**DONE (panel):** Etapy 1-2 w całości; Etap 3 (paczka, design, schemat+RLS, auth, funkcja główna
S4a-e, pulpit+profil, admin w tabach, płatności 9/11 [reszta przy START], maile+cron); Etap 4
(landing: research/koncept/budowa/pętla — PRZYJĄĆ po 3 rundach; suita E2E 11/11); Etap 5 częściowo
(review logika: 0 kryt/0 wys, naprawy S22 done; zgodność z ustaleniami: 62 ustalenia, 1 rozjazd;
UX panel usera + operatora: werdykty done; treść: werdykt + poprawki S24 done, legal jako HTML).

**W TOKU w momencie przekazania:** krok „Przegląd UX: poprawki i pętla" (`ux_petla`,
id c535c372-e324-41f0-a370-179a0326df14) — agent S25 wykonywał ~21 poprawek [UX]/[UX-ADMIN]
+ zgłoszenia Tomka A-D (A: overlap onboarding/hero pulpitu na szerokościach pośrednich;
B: TRWAŁY overlap-detector w tests/e2e.spec.ts [320/390/414/768/1024/1280, przecięcia bbox
rodzeństwa, wyjątki: sticky/FAB/modale — ma OBLAĆ przed fixem]; C: wspólne kolumny listy ofert
[RAZEM/akcje w pionie, także pulpit]; D: przeprojektowanie top-baru kreatora [siatka: powrót+chip+
metryczka / numer własny+akcje; mobile kolumna]). SPRAWDŹ stan: git log fachmata (commit „S25:...")
+ BUILDLOG + checklista kroku ux_petla — jeśli S25 niedokończone, wznow z tego opisu.

**NASTĘPNE KROKI (kolejność):**
1. Dokończyć/odebrać S25 → RE-TEST świeżym okiem (runda 2 pętli UX — subagent-krytyk przechodzi
   naprawione miejsca desktop+mobile+szerokości pośrednie, sprawdza regresje) → werdykt PRZYJĄĆ →
   ux_petla done.
2. AUDYT bezpieczeństwa (krok `audyt`, ostatnia soczewka Przeglądu): checklista §7 WORKFLOW-PLAN,
   sekcje RLS i płatności przygotować do OSOBISTEGO przeglądu Tomka; suita E2E jako część dowodów.
3. Krok `poprawki` — domknąć pozostałe pozycje ([Z1] zmiana działu istniejącej pozycji robocizny;
   [TREŚĆ] K1-pełne czeka na krok Prawne; N-2/N-3/N-4 = propozycja [v1.1]); status done →
   kamień „Aplikacja przeszła pełny przegląd" w portalu klienta.
4. RAPORT KOŃCOWY dla Tomka z retro-akceptacjami: (a) polityka RLS SELECT own-folder na storage
   logos dodana na prod (zawężająca, wymusił upsert), (b) fix API Stripe 2026 promotion_codes
   w starterze, (c) ~5 osieroconych kuponów w Stripe operatora do skasowania w Dashboardzie,
   (d) decyzja: numeracja wersji v2 (świeży numer per wysyłka [tak działa RPC] vs dziedziczenie —
   otwarta wfa_note „DO DECYZJI TOMKA"), (e) welcome-mail poszedł do palkabu@wp.pl (Grzegorz
   zarejestrował się sam — poprawne działanie), (f) konta test@testp.pl/sfsfsf@gp.pl — śmieciowe,
   Tomek może skasować.
5. NOWE MODUŁY FABRYKI (zaprojektowane 14.07, DO ZBUDOWANIA po S25 — dotykają admin.js/processor,
   więc NIE równolegle z sesją admin): kroki w Etapie 3:
   - `wiadomosci_panel` — centrum wiadomości w panelu operatora (historia email_log + szablony z podglądem/
     edycją + wiadomość ręczna) + wspólny brandowany layout maila (_shared/mail-layout, logo z
     wfa_projects.brand_logo_url / placeholder). Koncept: docs/stworze/MODUL-WIADOMOSCI.md.
   - `wiadomosci_trial` — seria onboardingowa trialu (drip behawioralny prezentujący funkcje).
   - `polecenia` — program poleceń dwustronny (kredyt Stripe customer_balance po invoice.paid; polecający
     miesiąc gratis, polecony −50%; konfigurowalne; anti-abuse; WhatsApp/SMS-first). Research:
     docs/stworze/research-polecenia.md · Koncept: docs/stworze/MODUL-POLECENIA.md.
   Kolejność budowy: najpierw wiadomosci_panel (layout maila = fundament dla reszty), potem
   wiadomosci_trial i polecenia (mail „nagroda" używa layoutu). Buduj w STARTERZE (uniwersalne) +
   Fachmacie. Prompty gotowe w projekt.html.
6. Dalej wg workflow: demo_klienta (decyzja Tomka kiedy), dane_operatora (czeka na materiały
   Grzegorza — cennik/ściągawki podmienią TYMCZASOWY szablon), umowa/prawne (czeka na prawnika),
   START (realna płatność minimalna + BLIK + 2 pozycje checklisty platnosci_e2e).
7. PRZEGLĄD KOŃCOWY FABRYKI (na życzenie Tomka): po domknięciu wszystkiego przygotować LISTĘ usprawnień/
   rozwinięć fabryki (co dodać/poprawić/rozwinąć) — TYLKO do przedstawienia i ustalenia z Tomkiem,
   NIE wykonywać bez jego zgody.

**Czeka na ludzi (NIE ruszać automatem):** materiały od Grzegorza, wzór umowy od prawnika,
decyzja Tomka o demo i starcie.

## 5. Jak startować pracę w nowej sesji (checklist)

1. Przeczytaj TEN plik w całości + MEMORY.md (auto) + `tn-crm/CLAUDE.md` (sekcja TN App).
2. Stan faktyczny: `git -C c:\repos_tn\fachmat log --oneline -15` + ogon BUILDLOG.md + SQL:
   `SELECT step_key, status FROM wfa_steps WHERE project_id='102e4c74-...' ORDER BY ...` +
   checklista kroku ux_petla.
3. Sprawdź czy w tn-crm nie pracuje równoległa sesja (git status — landing-pages/*) → commity pathspec.
4. Kontynuuj od „NASTĘPNE KROKI" wyżej, w rytuale z sekcji 1. Przy KAŻDEJ uwadze Tomka:
   naprawa + lekcja do wzorca + (gdy klasa błędu na to pozwala) AUTOMAT w suicie.

---

## PROMPT STARTOWY (wklej jako pierwszą wiadomość nowej sesji)

```
Kontynuujemy pracę nad fabryką aplikacji TN App i pilotem Fachmat. Przeczytaj W CAŁOŚCI
c:\repos_tn\tn-crm\docs\stworze\SESJA-START-FABRYKA.md i pracuj DOKŁADNIE wg opisanego tam modelu
(Fable zarządza i audytuje wzorce, subagenci Opus 4.8 wykonują; rytuał kroku: audyt wzorca →
wykonanie z dowodami na produkcji → lekcje do wzorca → panel; pętle jakości do werdyktu PRZYJĄĆ;
każda moja uwaga = naprawa + lekcja do wzorca fabryki, najlepiej automat w testach).
Najpierw zweryfikuj stan faktyczny (git log fachmata, BUILDLOG, statusy kroków wfa_steps) i sprawdź,
czy sesja S25 (pętla poprawek UX) się domknęła — jeśli nie, dokończ ją wg opisu w pliku. Potem
prowadź dalej: re-test pętli UX → audyt bezpieczeństwa → domknięcie kroku poprawek → raport końcowy
z retro-akceptacjami. Pracuj autonomicznie, pytaj tylko o decyzje biznesowe. Ja będę dorzucał
uwagi/poprawki na bieżąco — traktuj je wg zasady „naprawa + lekcja do wzorca".
```
