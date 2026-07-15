# RAPORT KOŃCOWY — pilot Fachmat + fabryka TN App (15.07.2026)

> Dla Tomka. Stan po: pętli UX „do wyczerpania" (7 rund, S25–S32), budowie 4 modułów fabryki
> (Wiadomości panel + seria trialowa, Polecenia, Testy klienta), reorganizacji etapów,
> domknięciu kroku Poprawki i re-audycie (AUDYT-2).

## 1. Stan pilota Fachmat

- **Aplikacja LIVE (fachmat.pl)**: realny cennik Grzegorza (5 działów / 76 pozycji), kreator z
  [Z1] (zmiana działu pozycji per oferta), PDF deterministyczny, nawigacja cennika, RODO
  komplet (eksport 14 sekcji + delete ze Storage), seria trialowa behawioralna, program
  poleceń (kredyt Stripe po invoice.paid, −50% dla poleconego), centrum Wiadomości operatora.
- **Jakość**: pętla UX zamknięta CZYSTĄ RUNDĄ (R7: zero defektów). 40+ napraw. Suita E2E:
  11 → **30 testów, zero flaky** + automaty klas błędów (overlap/h-scroll, warstwy, failOnDialog,
  eksport RODO, pdf-layout, anty-duplikat seedu, 3-kliki=1, demo-removal).
- **AUDYT-2 (stan finalny): 15/15 pozycji bezpieczeństwa PASS** (w tym nowa powierzchnia:
  referrals bez polityk write, kwoty serwerowo, gate wiadomości, wyjątek 0011 szczelny,
  column-GRANT anti-abuse). WARN hibp → WŁĄCZONE od ręki.
- **Jedyna bramka startu: dokumenty prawne** (placeholdery + przegląd prawnika).
  ⚠️ PILNE: na fachmata trafiają JUŻ organiczne rejestracje (adrian6228@gmail.com,
  asddasa@a.pl) — akceptują szablonowy regulamin.
- **Panel**: etapy 1–4 w całości done; Etap 5 done poza krokiem `audyt` (in_progress,
  gate legal — kamień „pełny przegląd" zapali się po prawniku); Etap 6 czeka na decyzje.

## 2. Do Twojej RETRO-AKCEPTACJI (wykonane, zgłaszam)

1. **Migracja 0011 (fachmat)** — trigger freeze przepuszcza WYŁĄCZNIE kaskadę FK→NULL
   (probe: normalna edycja zamrożonej nadal 23514; audyt C1–C5 potwierdził szczelność).
2. **Migracja 0012 (fachmat)** — tabela `referrals` + kolumny anti-abuse + `referral_config`
   (RLS: referrer widzi swoje, zapis tylko service-role).
3. **Migracja 20260715c (tn-crm)** — tabele `wfa_test_*` + bucket `wfa-test-shots` (private)
   + `wfa_projects.test_context` (moduł Testy klienta).
4. **password_hibp_enabled=true** na projekcie fachmata (WARN audytu).
5. Wcześniejsze (przypomnienie): polityka RLS SELECT own-folder na bucket `logos` (prod),
   fix Stripe API 2026 promotion_codes w starterze.

## 3. Do Twojej DECYZJI (nic nie robię bez zgody)

1. **Nazwisko klienta**: panel ma „Grzegorz Pałka", klient wpisał w danych firmy
   „Rentix **Grzegorz Pałaszewski**" (NIP 7831566239) — które poprawne? Ujednolicę.
2. **Numeracja wersji ofert** (otwarta uwaga): każda wysłana wersja = nowy numer z licznika
   (tak działa dziś) vs numer wspólny rodziny z sufiksem v2.
3. **Luki modelu vs realne oferty Grzegorza** [v1.1]: rabat kwotowy/% (Kórnik 13%),
   urządzenia z marką WLICZANE do sumy, itemizacja materiałów netto, pozycja „opcjonalnie",
   VAT mieszany 8/23 w jednej ofercie.
4. **Hardening skali** [v1.1]: N-2 wersjonowanie przez RPC, N-3 count(distinct) w RPC,
   N-4 paginacja serwerowa list.
5. **Kontakt na stronie zaufania**: dziś prywatny gpalka0@gmail.com — proponuję
   kontakt@fachmat.pl przez moduł Skrzynek.
6. **Demo dla Grzegorza** — aplikacja po pełnym przeglądzie; moim zdaniem gotowa. Po demo
   → aktywacja modułu „Testy klienta" (spowiednik testów gotowy end-to-end).
7. Sprzątanie ręczne: kupony testowe w Stripe Dashboard (zdezaktywowane: FACHMATTEST20,
   UXR4TEST10 + ~5 wcześniejszych; UI nie ma delete), konta test@testp.pl / sfsfsf@gp.pl,
   2 testowe zgłoszenia FAB „ignore" w skrzynce gpalka0.

## 4. LISTA USPRAWNIEŃ FABRYKI (przegląd końcowy — DO USTALENIA, nie wykonuję)

**A. Produkt / starter:**
1. Resend webhook delivered/bounced/complained → realna deliverability w tabie Wiadomości
   (dziś „delivered" = przyjęty przez Resend) — ważne przed dużym wolumenem.
2. Cache-buster `?v=N` dla base.css/js w apkach (SPA w otwartej karcie widzi stare CSS
   do odświeżenia; /img już wersjonowane).
3. Twardy dedup serii trialowej w DB (rozszerzyć unikalny indeks email_log o kindy tipów —
   dziś dedup aplikacyjny, wystarczający, ale indeks = bariera absolutna).
4. Helper `_shared/admin-files.ts` (gate team JWT → signed URL prywatnego bucketa) —
   ujednolicenie intake_admin / test_admin.
5. „Przewodnik kreatorów niszy" jako doc startera (wzorce z pilota: inline zmiana grupowania,
   tap-target ::after ≥44px, PDF anty-sierota/unbreakable, suma niezależna od grupy).
6. pg_net poza schemat public (WARN audytu, kosmetyka).
7. Panel tn-crm: skompilowany Tailwind zamiast CDN (warning w konsoli).
8. Backport wzorca „modal z jednym close()+Escape" i „optimistic re-render + reconcile"
   do pozostałych list/modali panelu tn-app.

**B. Proces / fabryka:**
9. **Automatyczna runda krytyka po każdej sesji budowlanej** (mini-pętla: 1 świeży krytyk
   po commicie, pełna pętla dopiero w Przeglądzie) — wcześniejsze łapanie klas błędów.
10. Kill-switch/tryb „maintenance" per aplikacja (dziś tylko kill_emails/kill_ai).
11. FLOW-AUTONOMIA-PLAN.md czeka na Twoje decyzje (§8 WORKFLOW-PLAN) — spiąć z tym, co
    pilot już zweryfikował.
12. Rejestr retro-akceptacji w panelu (dziś: BUILDLOG + raporty; dedykowana lista
    „do akceptacji Tomka" przy projekcie byłaby czytelniejsza).
13. Moduł Testy klienta: aktywacja przy demo (krok gotowy) + w przyszłości ten sam silnik
    dla „reklamacji/feedbacku po starcie" (zmiana promptu, ta sama infrastruktura).

**C. Pilot / biznes (kolejność):** prawnik (umowa + legal — PILNE przez organiczne
rejestracje) → demo Grzegorza → testy klienta (moduł czeka) → poprawki po demo →
onboarding operatora (5 beta-testerów z portalu czeka) → START (płatność + BLIK +
2 pozycje platnosci_e2e) → gtm_50 (w tym uruchomienie poleceń jako kanału).
