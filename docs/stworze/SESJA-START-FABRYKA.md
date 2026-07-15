# START NOWEJ SESJI — praca nad fabryką TN App i pilotem Fachmat

> Plik-przekazanie (handoff) napisany 2026-07-14, AKTUALIZACJA 2026-07-15 wieczór (sekcja 4 + PROMPT
> STARTOWY: pętla UX zamknięta, moduły S33-S37 + testy klienta live, usprawnienia U1-U10, gate=legal).
> Wklej do nowej sesji prompt z sekcji „PROMPT STARTOWY" na dole — reszta tego pliku to kontekst,
> który nowa sesja MA przeczytać w całości.

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
  3.5. MINI-RUNDA KRYTYKA po każdej sesji budowlanej (decyzja Tomka 15.07): zaraz po commicie
     sesji 1 świeży subagent-krytyk przechodzi ZAKRES TEJ SESJI (nie cały produkt) na prodzie/
     preview — znaleziska naprawia się od ręki przed domknięciem kroku; pełna pętla do wyczerpania
     zostaje w etapie Przegląd.
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
  blokują shippowaną funkcję i są zawężające — ZAWSZE flagować do retro-akceptacji. Flagowanie =
  INSERT `wfa_notes` (kind=`retro`, status=`open`, project_id projektu) — NIE tylko wpis w BUILDLOG;
  wpisy trafiają do sekcji „Do akceptacji Tomka" w panelu (`tn-app/projekt.html`), gdzie Tomek
  AKCEPTUJE (zostaje) lub ODRZUCA (sesja fabryki cofa zmianę).
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

## 4. Stan pilota Fachmat (aktualizacja 15.07 WIECZÓR — pętla UX ZAMKNIĘTA, moduły + usprawnienia LIVE)

**Pętla UX „DO WYCZERPANIA" — ZAMKNIĘTA CZYSTĄ RUNDĄ (7 rund, S25-S32).** Runda 7 nie przyniosła
żadnych nowych uwag → `ux_petla` DONE. Suita E2E = **30 testów, ZERO flaky**. Konwergencja: R2=4 poważne
→ R6/R7 = 0 nowych. (Przebieg: R1→S25 · R2→S27 realny cennik+9 fixów · R3→S28 · S29 mutex seedu ·
R4→S30 RODO+confirmModal ×7 · R5→S31 double-submit/error≠empty/focus-trap/@media print · R6-R7→S32
freeze FK SET NULL / usuń-demo / familyBase manual / kreator id-name / feedback kill_emails.)

**WSZYSTKIE MODUŁY ZBUDOWANE I LIVE (starter + Fachmat):**
- **Wiadomości — panel operatora (S33)** + wspólny layout maila.
- **Seria trialowa onboardingowa (S34)** — drip prezentujący funkcje.
- **Polecenia (S35)** — program dwustronny „z prawdziwego zdarzenia": kredyt Stripe polecającemu po 1.
  płatności poleconego + zniżka poleconego widoczna w KAŻDYM punkcie cenowym (U9).
- **TESTY KLIENTA = „spowiednik testów" (S-TK)** — standard fabryki, krok `testy_klienta`. Portal-czat
  ze zrzutami ekranu (vision — AI ogląda), panel operatora zatwierdź/odrzuć/zleć (`[TK-n]` → `poprawki_demo`),
  **U7** konstruktywny sceptycyzm AI (`flags.ai_pushback`), **U8** dostęp AI do kodu (akcja `czytaj_kod`
  przez `GITHUB_READ_TOKEN` + diagnozy z `code_ref`), tryb feedback po starcie. Koncept (SSOT):
  `docs/stworze/MODUL-TESTY-KLIENTA.md`.

**Krok `poprawki` — DONE** (S36 [Z1]: dział pozycji robocizny zmienialny per oferta; S36b mobile a11y).

**AUDYT-2 (S37) — RE-AUDYT stanu FINALNEGO: 15/15 PASS.** Jedyny otwarty gate = **legal-placeholdery**
({{OPERATOR_*}} w regulaminie/polityce/DPA) → **czeka na prawnika. PILNE — na `fachmat.pl` idą już
ORGANICZNE rejestracje**, więc dokumenty prawne muszą być realne przed szerszym startem.

**USPRAWNIENIA U1-U10 — WYKONANE:**
1. (U1) Resend webhook statusów dostarczalności per apka + twardy dedup serii trialu.
2. (U2) cache-buster `?v=N` dla css/js (marker deployu + twardy bust entry-pointów).
3. (U…) pg_net u źródła w starterze (poza `public`); helper `admin-files`; przewodnik kreatorów niszy
   w starterze (`docs/PRZEWODNIK-KREATOROW-NISZY.md`); wzorce modali/optimistic-UI w panelu.
4. **REJESTR RETRO w panelu** = sekcja „Do akceptacji Tomka" (`tn-app/projekt.html`) zasilana INSERT-em
   `wfa_notes kind=retro` — **OBOWIĄZEK każdej sesji fabryki** (zmiana RLS/migracja zawężająca w trybie
   autonomicznym = flaga do retro-akceptacji Tomka: zostaje / cofamy).
5. Mini-runda krytyka po KAŻDEJ sesji budowlanej (zakres tej sesji, zaraz po commicie).
6. (U5) maintenance mode per apka. (U9) widoczność zniżki poleconego. (U7/U8) sceptycyzm + dostęp do
   kodu w testach klienta. **(U10) syntax-check w `audit-static.mjs`** — automat klasy błędu „polski
   cudzysłów łamie parser": parsuje public/js/*.js (moduł) i inline `<script>` z public/*.html; GOTCHA
   Node: `node --check plik.js` z import/export CICHO przepuszcza (exit 0) → audyt WYMUSZA `--input-type`
   przez stdin. Backport w starterze + nota w `template/CLAUDE.md`.

**NASTĘPNE KROKI (kolejność):**
1. **CZEKAJĄ DECYZJE/AKCEPTACJE TOMKA (nie ruszać automatem):**
   - Rejestr retro (~9 pozycji) w panelu „Do akceptacji Tomka" — Tomek AKCEPTUJE/ODRZUCA.
   - Decyzje produktowe z `docs/stworze/RAPORT-PILOT-FACHMAT-2026-07-15.md §3`.
   - 4 decyzje autonomii z `docs/stworze/FLOW-AUTONOMIA-PLAN.md §11`.
   - Wybór runnera auto-naprawy zgłoszeń z testów klienta (kto/jak wykonuje `[TK-n]` po zatwierdzeniu).
2. **PRAWNIK (PILNE — organiczne rejestracje):** wzór umowy (`umowy/umowa-budowa-aplikacji.html` v3)
   + wypełnienie legal-placeholderów (dane operatora / Rentix Grzegorz Pałaszewski — po potwierdzeniu
   nazwiska: klient wpisał „Pałaszewski", w panelu bywało „Pałka"; ujednolicić).
3. **PO DECYZJACH:** demo Grzegorza → aktywacja kroku `testy_klienta` (prompt gotowy w projekt.html) →
   poprawki po demo (`poprawki_demo`, `[TK-n]`) → onboarding (5 beta-testerów CZEKA) → **START**
   (realna płatność + BLIK + `platnosci_e2e`).

**Czeka na ludzi (NIE ruszać automatem):** wzór umowy + legal od prawnika, decyzja Tomka o demo/starcie,
retro-akceptacje (pkt 1), decyzje produktowe/autonomii (RAPORT §3, FLOW-AUTONOMIA §11).

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
NAJPIERW zweryfikuj STAN FAKTYCZNY (nie ufaj temu plikowi na słowo — potwierdź):
`git -C c:\repos_tn\fachmat log --oneline -15` + ogon BUILDLOG.md (do U10) + statusy `wfa_steps`
projektu 102e4c74-… . Stan na 15.07 wieczór: pętla UX ZAMKNIĘTA czystą rundą (7 rund, S25-S32,
suita E2E 30/30 zero flaky); wszystkie moduły LIVE (Wiadomości S33, seria trialowa S34, Polecenia
S35, Testy klienta S-TK); krok poprawki DONE (S36); AUDYT-2 (S37) 15/15 PASS, jedyny otwarty gate
= legal (prawnik); usprawnienia U1-U10 wykonane. NIE ma już przerwanej rundy — pętla domknięta.
Kontynuuj OD „NASTĘPNYCH KROKÓW" (sekcja 4): (1) najpierw MOJE decyzje/akceptacje — rejestr retro
(panel „Do akceptacji Tomka"), decyzje produktowe (RAPORT-PILOT §3), autonomii (FLOW-AUTONOMIA §11),
wybór runnera auto-naprawy zgłoszeń; (2) prawnik: umowa + legal (PILNE — organiczne rejestracje);
(3) po decyzjach: demo Grzegorza → aktywacja testy_klienta → poprawki po demo → onboarding → START.
Pracuj autonomicznie, pytaj tylko o decyzje biznesowe. Ja będę dorzucał uwagi na bieżąco —
traktuj je wg zasady „naprawa + lekcja do wzorca".
```
