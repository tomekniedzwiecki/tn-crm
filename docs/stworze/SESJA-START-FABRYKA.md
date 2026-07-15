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
     **TWARDA ZASADA UCZENIA FABRYKI (decyzja Tomka 15.07): krok/sesja naprawcza NIE jest
     domknięta, dopóki jej lekcje nie są WPISANE do fabryki.** Każdy brief subagenta budowlanego/
     naprawczego MUSI wymagać w raporcie sekcji BACKPORT-LISTA (co przenieść do startera) +
     LEKCJE (jakie klasy błędów/wzorce odkryto); sesja zarządzająca przetwarza je NATYCHMIAST
     (backport-commit do startera, lekcja do promptu kroku, automat do suity, gotcha do CLAUDE.md
     startera lub pamięci) — dopiero wtedy odhacza krok. Dzięki temu każda kolejna aplikacja
     rodzi się mądrzejsza AUTOMATYCZNIE: starter = zmaterializowane naprawy, prompty = wiedza
     procesowa, suita-scaffold = automaty klas błędów, pamięć = gotchas cross-projektowe.
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

## 4. Stan pilota Fachmat (aktualizacja 15.07 — po rundach pętli UX 1-5)

**DONE (panel):** Etapy 1-2 w całości; Etap 3 (w tym `dane_operatora` DONE: Grzegorz wgrał
przez portal 5 PDF + dane firmy [Rentix Grzegorz Pałaszewski, NIP 7831566239 → contract_fields]
+ 5 beta-testerów; cennik zdigitalizowany → brief/10 + brief/10a; REALNY szablon 76 pozycji
wpięty w S27); Etap 4 w całości; Etap 5: wszystkie review done, `audyt` in_progress (FAIL tylko
legal-placeholdery = czeka na prawnika), `poprawki` in_progress, `ux_petla` in_progress.

**PĘTLA UX „DO WYCZERPANIA" (zasada z §1) — przebieg:** R1→S25 · R2→S27 (9 fixów + realny
cennik) · R3→S28 (PDF deterministyczny, chip ≤14, nawigacja cennika, automaty) · S29 (race
podwójnego seedu: mutex obu ścieżek) · R4→S30 (RODO eksport+delete ze Storage, confirmModal ×7,
/co-nowego, automaty failOnDialog/eksport/anty-sierota) · R5→S31 (guard double-submit „Nowa
oferta", error≠empty, focus-trap, @media print). Suita E2E = 20 testów, ZERO flaky. Konwergencja:
R2=4 poważne → R5=1 istotna+3 drobne. Backporty startera na bieżąco: 565f66f, baad1d8, ff7588a,
157bd01. Commity fachmat: …→759b2d3/774b872 (S31).

**PRZERWANE limitem tokenów 15.07: RUNDA 6 krytyka** (agent padł w trakcie — wystartuj ŚWIEŻĄ
rundę 6 wg wzorca rund: spot-check S31 [3 kliki=1 szkic; błąd ładowania→stan błędu; Tab cykluje
w modalu; print bez chrome] + świeże polowanie w kątach: pełny cykl onboardingu, event aha,
zmiana e-maila/reset hasła przy kill_emails, wersje v3+, integralność sum przy usuwaniu w edycji,
urządzenie z biblioteki vs przypisane do oferty, cykl feedback user→admin, OG landingu, admin
mobile 375 wszystkie taby; seen-lista = wszystkie naprawy S25-S31 + znane-otwarte: legal, rabat
per-oferta [DO DECYZJI], kontakt gpalka0@gmail.com na stronie zaufania [DO DECYZJI], statyczny
topbar, last-write-wins). Pętla kręci się aż runda = ZERO nowych uwag.

**NASTĘPNE KROKI (kolejność):**
1. RUNDA 6 (i kolejne) pętli UX → aż czysta runda → `ux_petla` done. Po zamknięciu pętli:
   lekcje zbiorcze R4-R6 do wzorca review_ux/testy_e2e w projekt.html (double-submit guard,
   error≠empty, focus-trap modali, @media print, pełny cykl RODO jako cleanup testów).
2. NOWE MODUŁY FABRYKI (koncepty gotowe: docs/stworze/MODUL-WIADOMOSCI.md, MODUL-POLECENIA.md,
   research-polecenia.md; prompty w projekt.html; kroki w bazie: wiadomosci_panel/wiadomosci_trial/
   polecenia): kolejność — wiadomosci_panel (layout maila = fundament) → wiadomosci_trial →
   polecenia. Budować w STARTERZE + Fachmacie.
3. Krok `poprawki` — domknąć pozostałe ([Z1] zmiana działu pozycji robocizny; [TREŚĆ] K1-pełne
   czeka na Prawne; N-2/3/4 = [v1.1]). UWAGA reorganizacja 15.07 (migracja
   20260715_przeglad_reorg_kolejnosc.sql): cała jakość w etapie 5 „Przegląd i jakość" z wymuszoną
   kolejnością (suita → soczewki → poprawki → pętla → AUDYT NA KOŃCU); kamień „pełny przegląd"
   przeniesiony na `audyt` — po domknięciu poprawek RE-AUDYT stanu finalnego domyka etap.
4. RAPORT KOŃCOWY dla Tomka z retro-akceptacjami: (a) RLS SELECT own-folder na logos (prod),
   (b) fix Stripe API 2026 w starterze, (c) kupony-sieroty w Stripe operatora (~5 + FACHMATTEST20
   + UXR4TEST10 zdezaktywowane — skasować w Dashboardzie), (d) DO DECYZJI: numeracja wersji v2
   (wfa_note), (e) DO DECYZJI: luki modelu z realnych ofert Grzegorza (wfa_note [v1.1]: rabat,
   urządzenia w sumie, itemizacja materiałów, pozycje opcjonalne, VAT mieszany), (f) DO DECYZJI:
   kontakt na stronie zaufania → kontakt@fachmat.pl przez Skrzynki?, (g) welcome do palkabu@wp.pl
   poprawny, (h) konta test@testp.pl/sfsfsf@gp.pl śmieciowe — może skasować, (i) NAZWISKO:
   klient wpisał „Pałaszewski", panel ma „Pałka" — potwierdzić i ujednolicić.
5. PRZEGLĄD KOŃCOWY FABRYKI: LISTA usprawnień/rozwinięć — TYLKO do ustalenia z Tomkiem,
   NIE wykonywać bez zgody.
6. Dalej wg workflow: demo_klienta (decyzja Tomka), umowa/prawne (dane firmy klienta JUŻ SĄ,
   czeka wzór od prawnika; placeholdery OPERATOR_* w legal można wypełnić danymi Rentix),
   START (realna płatność + BLIK + 2 pozycje platnosci_e2e).

**Czeka na ludzi (NIE ruszać automatem):** wzór umowy od prawnika, decyzja Tomka o demo
i starcie, retro-akceptacje z pkt 4.

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
wykonanie z dowodami na produkcji → lekcje do wzorca → panel; PĘTLE JAKOŚCI DO WYCZERPANIA —
kolejne rundy świeżego krytyka + naprawy aż runda zwróci ZERO nowych uwag, bez limitu rund;
każda moja uwaga = naprawa + lekcja do wzorca fabryki, najlepiej trwały automat w testach).
Najpierw zweryfikuj stan faktyczny (git log fachmata, ogon BUILDLOG [S25-S31], statusy wfa_steps).
Stan: rundy 1-5 pętli UX naprawione (S25/S27/S28/S29/S30/S31, suita E2E 20/20 zero flaky);
RUNDA 6 została przerwana w trakcie — wystartuj ją OD NOWA wg opisu w sekcji 4 pliku. Potem
wg NASTĘPNYCH KROKÓW: pętla aż do czystej rundy → lekcje zbiorcze do wzorca → budowa modułów
Wiadomości/Polecenia (koncepty w docs/stworze/) → domknięcie kroku poprawki → raport końcowy
z retro-akceptacjami → lista usprawnień fabryki (NIE wykonywać bez mojej zgody).
Pracuj autonomicznie, pytaj tylko o decyzje biznesowe. Ja będę dorzucał uwagi na bieżąco —
traktuj je wg zasady „naprawa + lekcja do wzorca".
```
