# Proces fabryki: ZGŁOSZENIE KLIENTA → POPRAWKA (standard)

> Decyzja Tomka 16.07.2026: „potwierdź wszystko samemu, zacznij wdrażać poprawki i dopracuj fabrykę
> właśnie pod te poprawki, które robimy po zgłoszeniu klienta. Ja nie chcę w tym uczestniczyć —
> analizuj sam. Musimy mieć logi do wszystkiego. Doprowadź do doskonałości."
>
> SSOT tego procesu. Spina: moduł Testy klienta + delegację akceptacji + GATE A/B + obserwowalność
> (edge_logs) + changelog + pętlę do wyczerpania. Stan wdrożenia = §7.

---

## 1. Zasada nadrzędna

Zgłoszenia klienta (operatora) NIE lądują w kolejce czekającej na Tomka. **Agent prowadzi cały cykl
autonomicznie** — od triażu, przez akceptację, naprawę, dowód, po zamknięcie i komunikat do klienta.
Tomek nie jest bramką ([[feedback-retro-akceptacja-delegowana-agentowi]] rozszerzone na zgłoszenia).
Jakość gwarantują **twarde bramki techniczne** (GATE A/B), nie kliknięcia człowieka.

## 2. Wejście — zebranie zgłoszeń (istnieje)

Klient-operator w portalu rozmawia z AI („spowiednik testów", moduł Testy klienta) → AI składa
ustrukturyzowane `wfa_test_issues` (seq, severity, area, device, quote, screenshots, round_no).
Panel Tomka (`tn-app/projekt.html` zakładka Testy klienta) = podgląd; transkrypt + zrzuty.

## 3. Triaż i AKCEPTACJA (agent — nie Tomek)

Agent dla KAŻDEGO zgłoszenia:
1. **Klasyfikuje**: bug / regresja / UX / feature-w-v1 / feature-v1.1. Regresja = najwyższy priorytet
   (fabryka powinna była ją złapać → §6 test regresyjny).
2. **Rozstrzyga**: `status='approved'` (będzie robione) lub `rejected` (z uzasadnieniem). Feature poza
   granicą v1 → `approved` + `flags.poza_v1=true` (zaplanowane do v1.1, nie teraz).
3. **Pisze komentarz dla klienta** (`tomek_comment`, widoczny w portalu) — krótko, po ludzku, korzyść:
   „Przyjęte, poprawiamy X." / „Świetny pomysł, dodamy w kolejnej wersji." `decided_at=now()`.
4. Rozstrzyga PĘTLĄ do wyczerpania: gdy 0 zgłoszeń w statusie `new` → runda gotowa do naprawy.

## 4. Naprawa (pętla do wyczerpania)

Kolejność: **bugi/regresje → UX → feature-v1 → v1.1 osobno.** Dla każdego zatwierdzonego zgłoszenia:
1. **Diagnoza z DANYCH, nie zgadywanie** — czytaj `edge_logs` (backend: gate/limit/500), `client_errors`
   (front), `git log`/BUILDLOG (regresja → commit). Reprodukcja przed fixem.
2. **Fix minimalny, zgodny z konwencją** apki (design-system tokeny, `textContent`, kwoty serwerowo).
3. **GATE A** jeśli zmiana dotyka wrażliwej powierzchni (RLS/edge/auth/płatności/render usera/storage) —
   zakresowy audyt adwersarski PRZED live ([[feedback-petla-poprawek-do-wyczerpania]]).
4. **GATE B** — E2E/@smoke zielone przed pushem (twarde, preflight). Migracja PRZED pushem.
5. **Log** — jeśli fix dotyka ścieżki edge, upewnij się, że zdarzenie jest w `edge_logs` (diagnoza on-going).

## 5. Zamknięcie i komunikat do klienta

- Po naprawie: `wfa_test_issues.status='done'`, `done_at=now()` → **klient widzi ✅** w portalu przy swoim
  zgłoszeniu (potwierdzenie, że jego głos coś zmienił — buduje zaufanie).
- Runda: gdy wszystkie zatwierdzone z rundy = `done` → zamknij serię (`wfa_test_rounds`, podsumowanie
  zgłoszonych/naprawionych/odrzuconych/v1.1). Kolejne uwagi = nowa runda.
- **Komunikat „co nowego"**: istotne poprawki widoczne dla użytkownika → operator publikuje wpis w
  changelogu apki (moduł [[aplikacje-changelog-system]], `co-nowego.html`). To robota OPERATORA; fabryka
  może podsunąć gotowca. Moment relacyjny (info do samego operatora) = Tomek osobiście
  ([[feedback-operator-human-touch-momenty-relacyjne]]).

## 6. Doskonałość — nie powtarzać błędów

- **Regresja → test.** Każde zgłoszenie typu „wcześniej działało, teraz nie" po naprawie dostaje test
  (E2E/@smoke lub jednostkowy), żeby fabryka złapała nawrót. To zamienia incydent w trwałą ochronę.
- **Wzorzec braku → backport startera.** Jeśli luka jest systemowa (np. brak logów, słaby rate-limit,
  brak walidacji), napraw u ŹRÓDŁA (starter) → każda kolejna apka dziedziczy poprawę.
- **Pamięć.** Nietrywialna przyczyna/rozwiązanie → wpis do pamięci (feedback), żeby nie odkrywać drugi raz.

## 7. Obserwowalność (fundament — „logi do wszystkiego")

- `edge_logs` (migr. fachmat 0024 / starter 0017): trwały dziennik zdarzeń edge (gate/limit/maintenance/
  500), RLS deny-all, PII service-role only, retencja ~30 dni. Helper `_shared/logevent.ts` (fail-open).
  Wpięty: `pdf-gate` (każde wyjście), `changelog`. **Czytam przez MCP** przy diagnozie:
  `select * from edge_logs where fn='pdf-gate' and level in ('warn','error') order by ts desc`.
- `client_errors` (front, istnieje), `app_events` (analityka, istnieje) — osobne cele, nie mieszać.
- Dokładać logowanie do kolejnych wrażliwych fns przyrostowo (stripe-processor, account, referral…).

## 8. Stan wdrożenia (prawda)

- ✅ Wejście (Testy klienta) — LIVE.
- ✅ Triaż+akceptacja agenta — pierwsze użycie 16.07 (8 zgłoszeń Grzegorza, Fachmat, zatwierdzone).
- ✅ Obserwowalność `edge_logs` — LIVE 16.07 (fachmat ff6c33b, starter 65feac4).
- ⏳ Naprawa rundy 1 Grzegorza — w toku (bugi: #7 regresja VAT, #4 mobile Wyślij, #3/#5 PDF; UX/feature).
- ⏳ Test regresyjny dla #7 po naprawie.
- ⏳ Wpisanie procesu do rytuału sesji (SESJA-START-FABRYKA §obsługa zgłoszeń) + prompt kroku Testy klienta.
