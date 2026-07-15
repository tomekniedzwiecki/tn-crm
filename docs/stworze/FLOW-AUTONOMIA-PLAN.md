# Flow-Autonomia — jak pracujemy z fabryką aplikacji (propozycja po researchu, 2026-07-11)

> Uzupełnienie `WORKFLOW-APLIKACJE-PLAN.md`. Synteza researchu (3 agentów: praktyki AI-first budowy SaaS,
> autonomiczne operacje portfela, mechanizmy automatyzacji Claude Code). Cel: maksimum pracy bez udziału Tomka;
> Tomek = fundamenty (decyzje, jakość, relacja z klientem). Status: PROPOZYCJA → decyzje Tomka → wdrożenie w Fazie B.

## 0. Zasada organizująca: panel = kolejka, Tomek = bramkarz jakości

Docelowy model pracy: Tomek otwiera `/tn-app` i widzi trzy kolumny świata:
1. **„Czeka na Ciebie"** — decyzje i bramki (MVP scope, nazwa, review bezpieczeństwa, akcepty) — tu jest jego głowa.
2. **„W budowie (agent)"** — kroki, które agent wykonuje sam; Tomek ich nie dotyka.
3. **„Do przeglądu"** — efekty agenta z DOWODAMI (diff/PR, wynik testów, screenshot, curl na preview) — Tomek zatwierdza albo cofa z uwagą (uwaga trafia do `wfa_notes` → do kolejnej sesji agenta).

Reguła z researchu: agent pokazuje dowody, nie deklaruje sukcesu (Anthropic best practices). Przegląd dowodu
zastępuje samodzielne sprawdzanie.

## 1. Automatyzacja kroków budowy (zamiast kopiowania promptów)

Trzy mechanizmy (raport agenta Claude Code):

| Wariant | Jak działa | Koszt | Kiedy |
|---|---|---|---|
| A. „Kopiuj prompt" (dziś) | Tomek wkleja w VS Code | subskrypcja | fallback, kroki wymagające obecności |
| B. **Claude Code Routines + API trigger** ⭐ | przycisk „Buduj" w panelu → edge fn → `POST /routines/.../fire` → sesja w chmurze robi krok → PR → status w `wfa_steps` | **subskrypcja** (bez API key) | REKOMENDACJA — główna droga |
| C. GitHub Actions + claude-code-action | issue/dispatch → workflow → PR | API key (~$0,02-0,10/krok) + GH minutes | opcja przy skali / gdy routine nie wystarcza |

Architektura wariantu B: `wfa_steps.status='pending'` + klik „Buduj (agent)" → edge fn `wfa-build-trigger`
(zapisuje `data.agent_session`, status `in_progress`) → routine klonuje repo apki, czyta paczkę `brief/`,
wykonuje krok, otwiera PR (branch `step-<key>`), aktualizuje `wfa_steps` przez Supabase + post na Slack #aplikacje.
Cron nocny = fallback (podnosi zawieszone kroki). Ograniczenia: routine to świeży klon (kontekst MUSI być w repo —
stąd waga paczki i AGENTS.md), min. interwał cronu 1h, sesje nie współdzielą pamięci (checkpoint = plik postępu w repo).

**Model wykonania kroku — nowa kolumna `wfa_step_defs.runner`:** `manual` (Tomek/klient) · `prompt` (kopiuj-wklej)
· `agent` (przycisk Buduj → routine). Kroki=konfiguracja, więc to 1 ALTER + UPDATE seedów.

## 2. Twarde bramki jakości (największa luka wg researchu)

Dane: 45% kodu z LLM oblewa testy bezpieczeństwa; kategorie najwyższego ryzyka = auth/RLS/płatności — dokładnie
nasz Supabase + Stripe. Dlatego:

1. **Review adwersarski (nowy krok auto, Etap 3, po `maile_trans`):** osobna sesja agenta dostaje TYLKO diff + kryteria
   z 01-MVP-SCOPE (bez rozumowania buildera) i próbuje ZNALEŹĆ błędy. Wynik = lista findings w kroku. Zero kosztu Tomka.
2. **Security gate (wzmocniony krok `audyt`, Etap 4):** checklista jak dziś + DWA twarde wymogi człowieka:
   (a) RLS/płatności — review Tomka obowiązkowy (jedyne miejsce, gdzie badania każą człowieka), (b) test kluczem anon
   wykonany i wklejony jako dowód. FAIL blokuje start — bez wyjątków.
3. **E2E jako dowód (krok `testy_e2e` → runner=agent):** Playwright na deploy preview (rejestracja→funkcja→checkout→webhook);
   output testów wklejony do kroku. Statyczny front = szybkie, deterministyczne E2E.
4. **Krótkie sesje:** 1 krok = 1 sesja agenta (2× dłuższe zadanie = 4× więcej porażek — SlopCodeBench). Nasz podział
   na 30 kroków jest zgodny; NIE sklejać kroków w jedną sesję.

## 3. Starter `saas-starter` — wzorce wbudowane od 1. dnia (Faza B1)

Ponad to, co w WORKFLOW-APLIKACJE-PLAN §6, starter dostaje:
- **`AGENTS.md`/CLAUDE.md wg 6 sekcji** (Commands z flagami, Testing, Structure, Code Style z 1 przykładem, Git,
  **Boundaries 3-poziomowe: ✅ zawsze / ⚠️ pytaj / 🚫 nigdy** — sekrety, migracje, deploy prod). Krótki — bloat mierzalne obniża skuteczność.
- **Webhook inbox pattern:** stripe-webhook = weryfikuj podpis → zapisz surowy event do `stripe_events` → 200;
  OSOBNY processor (pg_cron) przetwarza idempotentnie z retry + heartbeat. Chroni przed „cichym 200" (killer małych SaaS
  i naszego 10%). Do tego Stripe health alerts.
- **`lifecycle_status`** na users (signed_up→activated→trialing→paying→past_due→canceled) + `activated_at`/`last_active_at`
  — JEDYNY trigger maili. pg_cron co godzinę skanuje warunki behawioralne → Resend → `sent_at` (bez dublowania).
- **Minimalne lifecycle-maile (nie tylko transakcyjne):** (1) welcome + JEDEN pierwszy krok, (2) nudge aktywacyjny
  24-48h jeśli brak aha-moment (okno 72h!), (4) dunning przy past_due (ratuje przychód = nasze 10%). Trial→paid i win-back później.
  Maile behawioralne = 3-4× CTR vs kalendarzowe; max 4-6 maili/14 dni.
- **E2E scaffold** (Playwright, testy na deploy URL) + **heartbeat** (Healthchecks.io ping z każdego crona).
- **Definicja aktywacji w 01-MVP-SCOPE (obowiązkowa):** metryka aha-moment + time-to-first-value < 10 min — wymóg specu, nie opcja.

## 4. Operacje portfela — autopilot Tomka (Faza B4)

- **Obserwowalność za ~0 zł:** Sentry free (błędy) + Healthchecks.io free (20 jobów — heartbeaty cronów/processorów)
  + alerty → Slack **#ops-portfel**. ZERO platform per apka (żadnych Segment/Intercom ×12).
- **Tygodniowa routine „Przegląd portfela":** czyta nocne agregaty ze wszystkich apek → jeden raport: MRR + 10% Tomka
  per aplikacja (krzyżowo z Connect Application fees), WoW, aktywacje/churn, dunning, anomalie Z HIPOTEZĄ przyczyny. Slack/mail.
- **Codzienny check anomalii:** spadek płatności/signupów vs baseline; zgodność liczby eventów Stripe vs przetworzone
  (wykrywa ciche webhooki). Samonaprawa TYLKO z whitelisty runbooków (re-drive inboxu, restart joba); reszta = eskalacja z diagnozą.
- Gotcha własna: Edge wall-clock 400s — każdy job z deadline ~330s + heartbeat.

## 5. GTM 0→50 — przebudowa kroku `gtm_50` (playbook zamiast pustej karty)

Ekonomia 2026: cold paid dla niskiego ACV się nie domyka (Google ~$4,2k, Meta ~$3,2k CAC); partnerstwa −50% CAC.
Playbook (kroki-podkroki w warsztacie `gtm_50`):
1. **0→10: sieć operatora + grupy branżowe** (insider dzieli się narzędziem, nie „reklamuje") — to jest nasz moat.
2. **10→30: cold outreach z AI** (personalizacja z sygnałów; RODO-czysto: uzasadniony interes, łatwy opt-out).
3. **30→50: partnerstwa dystrybucyjne** (hurtownie/izby/stowarzyszenia — operator je zna) — najtańszy CAC.
4. **Tło: kilka MOCNYCH stron porównawczych/case (AI+człowiek)** — NIE masowy AI-content (kary Google 2026, −50-80% ruchu).
5. **Płatne = tylko retargeting, po PMF.**
**„Amunicja" w panelu operatora** (starter): szablony postów/cold maili z personalizacją AI, materiał dla partnera,
licznik „do 50" z podpowiedzią następnego ruchu. Operator klika „użyj", nie wymyśla marketingu.

## 6. AI w samych aplikacjach

Zasada: AI tylko jako „silnik" jednego workflow niszy (mierzalna oszczędność w PIERWSZEJ sesji), nigdy bajer
(wrappery: marże 25-35%, „90% padnie"). Decyzja per projekt w kroku `mvp_scope`. Support klientów apki: RAG-chatbot
na bazie wiedzy per PRODUKT (deflekcja 60-80% realna tylko z dojrzałą dokumentacją + comiesięcznym łataniem KB
i twardą eskalacją do operatora) — dopiero gdy apka ma userów, nie na starcie.

## 7. Zmiany w seedzie `wfa_step_defs` (kroki=konfiguracja → same INSERTy/UPDATEy)

- ALTER: kolumna `runner` (manual/prompt/agent), default wg poniższego.
- Nowy krok Etap 3: `review_adwersarski` (auto/agent, po `maile_trans`).
- Nowy krok Etap 5: `autopilot_ops` (agent: Sentry+Healthchecks+raporty podpięte) przed `start_live`.
- Runner=agent: schemat_db, auth_konta, funkcja_glowna, panel_usera, panel_operatora, platnosci_e2e, maile_trans,
  landing, testy_e2e, review_adwersarski, paczka_cc (generacja przez agenta z danych spar+notes).
- Runner=manual (Tomek/klient — celowo): mvp_scope (decyzja), nazwa, domena, akcept_klienta, stripe_kyc, audyt
  (gate człowieka), prawne, onboarding_op, start_live, stery.
- `maile_trans` → rozszerzyć etykietę/checklistę o lifecycle (welcome/aktywacja/dunning behawioralne).
- `gtm_50` → checklist = playbook §5.

## 8. Kolejność wdrożenia — ZREWIDOWANA (patrz §10): dwa równoległe tory

**TOR A — klienci (od zaraz, NIE czeka na fabrykę):** zegar umowny tyka (harmonogram oferty 4-8 tyg. od pełnej
płatności: Grzegorz od 18.06 → okno ~16.07-13.08; Tomek J. od 26.06 → ~24.07-21.08).
- A1. Umowy: wyjaśnić status umów obu klientów; stworzyć szablon umowy budowy APLIKACJI (nie istnieje!). Zapisać
  `deadline_at` + warunki per projekt.
- A2. Tomek J.: wysłać przypomnienie o spowiedniku (draft czeka) + faktura.
- A3. Grzegorz — Etap 1 z Tomkiem: propozycja MVP scope wygenerowana z handoffu (agent), decyzje pricing + nazwa
  + akcept klienta. Potem budowa: wariant A/„prompt" od razu, przechodząc na wariant B w miarę gotowości fabryki.
  Każdy zgrzyt = poprawka flow (pilot uczy fabrykę NA ŻYWO, nie po fakcie).

**TOR B — fabryka (równolegle):**
- B1. saas-starter (wzorce §3) + szablon AGENTS.md + **szablony prawne** (regulamin/polityka/DPA — raz, per fabryka).
- B2. **Portal klienta (dawne F3) — PODNIESIONY priorytet**: klient po 12 500 zł nie może przez tygodnie widzieć
  „nic" (lęk nr 1 leadów = scam). Kamienie + „co się teraz dzieje" + mail przy każdym kamieniu.
- B3. Routine „Build step" + edge fn `wfa-build-trigger` + przycisk „Buduj (agent)" + kolumna runner.
- B4. Bramki: review_adwersarski + wzmocniony audyt + E2E scaffold.
- B5. Autopilot ops: Healthchecks/Sentry + routine tygodniowa portfela + #ops-portfel.

## 9. Decyzje Tomka (rozstrzygnięte 2026-07-11)

1. Automatyzacja: **PROMPTY do Claude Code** (kontrola) — NIE Routines/Actions. Kolumna `runner` NIE powstaje;
   §1 (warianty B/C) = odłożone na przyszłość. Cała dźwignia autonomii = jakość promptów + metodyka (METODYKA-BUDOWY.md).
2. Każdy PR/efekt czeka na Tomka — akcept.
3. Slack #ops-portfel — JESZCZE NIE.
4. Sentry/Healthchecks — JESZCZE NIE.
5. Umowy — PÓŹNIEJ (Tomek). Terminy wstępne (8 tyg. wg oferty) ustawione w `deadline_at`: Grzegorz 13.08, Tomek J. 21.08.
6. Tor kliencki Grzegorza — JESZCZE NIE startuje (decyzja Tomka).

## 10. Rewizja krytyczna flow (11.07) — luki znalezione w głębokim przeglądzie

**Krytyczne:**
- **(K1) Zegar umowny.** Oferta obiecuje 4-8 tygodni; obie płatności z czerwca → pilot Grzegorza NIE może czekać na
  zbudowanie fabryki. Stąd dwa tory w §8. System nie znał terminu → dodać `wfa_projects.deadline_at` + badge „dni do
  terminu" w panelu (żółty <14 dni, czerwony <7).
- **(K2) Umowy.** Brak umów obu klientów w repo i brak SZABLONU umowy budowy aplikacji (są tylko sklepowe/mentoring).
  Umowa niesie: rev-share 10% bezterminowo, prowizje Stripe po stronie klienta, terminy, gwarancję 30 dni, RODO
  (administrator = operator), hosting 12 mies./90-10. Bez niej rev-share jest niezabezpieczony. → A1.
- **(K3) Brak pętli klienta w budowie.** Grzegorz wprost: „Ja muszę to zobaczyć, jak wygląda i funkcjonuje";
  w handoffie luka „które zmiany po pokazaniu v1 wchodzą w zakres". Flow szedł od budowy prosto do startu. → NOWE kroki
  Etap 4: `demo_klienta` (client; preview + zebranie uwag) i `poprawki_demo` (admin/agent); granica „zmiany w cenie vs
  rozwój" ustalana już w `akcept_klienta` (Etap 1).
- **(K4) Portal klienta za późno** (uzasadnienie w §8 B2).

**Ważne:**
- **(W1) Pricing to fundament, nie technikalia.** Decyzja o planach/cenie/trialu (z kartą: ~31% konwersji vs ~9% bez)
  + metryka aktywacji zapada Z KLIENTEM w Etapie 1 → NOWY krok `pricing` (Etap 1, po `mvp_scope`); `stripe_plany`
  w Etapie 2 zostaje jako czysta implementacja tej decyzji.
- **(W2) Dane operatora do produktu.** Apka potrzebuje treści/danych domenowych (u Grzegorza: cennik → szablon startowy,
  biblioteka urządzeń). → NOWY krok Etap 3: `dane_operatora` (import/digitalizacja; owner client+admin).
- **(W3) Ścieżka bez spowiednika.** Tomek J. może nigdy nie przejść spowiednika — flow musi umieć: rozmowa 1:1 →
  notatki → handoff składany ręcznie (krok `handoff` już to dopuszcza; zapisać jawnie w warsztacie kroku).
- **(W4) Po sterach pusto.** → NOWY krok Etap 5: `monthly` (przegląd miesięczny z operatorem ×3 po przekazaniu);
  przypomnienie „hosting po 12 mies. → 90/10" (na razie w kroku `stery`; później cron).
- **(W5) Koszty infrastruktury per apka nieoszacowane.** Vercel Hobby zakazuje użytku komercyjnego (→ Pro);
  Supabase Pro od produkcyjnego startu (free tier pauzuje projekty). Przy kilkunastu apkach × 12 mies. hostingu po
  stronie Tomka to realna pozycja w ekonomice modelu → ZWERYFIKOWAĆ cenniki i wpisać do `biznes_costs` przy pierwszym
  starcie. Kroki `repo_vercel`/`supabase_proj` dostają pozycję w checkliście „plan płatny zweryfikowany".
- **(W6) Kroki klienta odpalać najwcześniej jak się da** (KYC Stripe, materiały, dane operatora) — czekanie na klienta
  to najdłuższe ogony; zasada jawnie w warsztatach kroków klienckich + followup automatyczny gdy krok klienta wisi >5 dni (F4).

## 11. AKTUALIZACJA 15.07 — konfrontacja z pilotem Fachmat (przegląd B11)

**ZREALIZOWANE przez pilota (temat zamknięty):** K3 (demo_klienta/poprawki_demo + NOWY moduł
Testy klienta = spowiednik testów ze zrzutami i bramką akceptacji), K4/B2 (portal z kamieniami,
intake, testami), B4 (bramki: review-soczewki + pętla do wyczerpania + AUDYT na końcu + suita
E2E 30 testów), W1 (krok pricing), W2 (dane_operatora — zdigitalizowany cennik Grzegorza),
W4 (monthly), W5 (Vercel Pro + Supabase płatny w standardzie kroków). §1 automatyzacja:
zrealizowana LEPSZYM mechanizmem niż warianty B/C — sesja zarządzająca (Fable) + subagenci
(Opus) wg promptów kroków; routines/kolumna runner NIEPOTRZEBNE (potwierdza decyzję Tomka 1/2026-07-11).

**OTWARTE — do decyzji Tomka:**
1. B5 autopilot ops (Healthchecks/Sentry, tygodniowa routine portfela, #ops-portfel) —
   propozycja: włączyć przy starcie DRUGIEJ aplikacji (przy jednej zbędny narzut).
2. K1 badge „dni do terminu" (deadline_at) w panelu projektu — małe, do zrobienia przy okazji.
3. W6 followup automatyczny kroku klienta wiszącego >5 dni (mail systemowy wfa-partner-mail;
   dziś jest tylko czerwony badge w panelu) — propozycja: tak, z szablonem po ludzku.
4. K2 umowy — u prawnika (PILNE: organiczne rejestracje na fachmat.pl).

**Zmiany w seedzie wynikające z rewizji:** +`pricing` (E1), +`dane_operatora` (E3), +`demo_klienta` i `poprawki_demo`
(E4, przed audytem), +`monthly` (E5, po stery), +`review_adwersarski` (E3) i `autopilot_ops` (E5) z §7. Razem: 30 → 36 kroków.
