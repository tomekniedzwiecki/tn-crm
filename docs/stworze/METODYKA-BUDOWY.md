# METODYKA BUDOWY APLIKACJI — spec-driven przez Claude Code (SSOT metodyki)

> Obowiązuje w każdym projekcie `/tn-app`. Prompty generowane w panelu odwołują się do tego dokumentu.
> Pętla: **Spec → Plan → Sesje → Weryfikacja**. Zero „skakania do kodu". Tomek = decyzje i bramki; sesje = wykonanie.

## 1. Trzy filary kontekstu (żyją w REPO aplikacji, nie w czacie)

1. **Paczka `brief/` w repo aplikacji** — spec (00-KONTEKST … 07-RUNBOOK + **08-PLAN-SESJI.md** + 09-SEO).
   Szkielet 00-09 tworzy forge ze startera; wypełnia go krok `paczka_cc`. Źródła (handoff pack,
   artefakty Etapu 1) lądują w `brief/zrodla/` — sesje budowy czytają je z repo, nie z bazy.
2. **`CLAUDE.md`** aplikacji — krótki (bloat mierzalnie obniża skuteczność), z sekcjami: Commands (pełne komendy
   z flagami), Testing, Structure, Code Style (1 realny przykład), Git, **Boundaries 3-poziomowe**:
   - ✅ ZAWSZE WOLNO: edycja kodu, testy, commit, deploy preview, migracje na projekcie DEV
   - ⚠️ ZAPYTAJ: migracje produkcyjne, zmiany w płatnościach/RLS, usuwanie danych, zmiany planów Stripe
   - 🚫 NIGDY: sekrety w repo, deploy produkcyjny przed audytem, zmiana fee_percent, wyłączanie RLS
3. **`BUILDLOG.md`** — dziennik budowy (pamięć między sesjami). Każda sesja: (a) ZACZYNA od przeczytania,
   (b) KOŃCZY dopisaniem wpisu: co zrobione, decyzje + uzasadnienia, otwarte sprawy, dowody (linki/outputy).

> Artefakty Etapu 1 (propozycje MVP-scope / pricing / nazwy — repo aplikacji jeszcze nie istnieje) żyją w
> `tn-crm/docs/stworze/projekty/<slug>/` (katalog może nosić STARY slug sprzed kroku Nazwa) i przechodzą
> do repo aplikacji (do `brief/zrodla/`) w kroku `paczka_cc` (lekcja z pilota 11.07).

## 2. Plan sesji (`08-PLAN-SESJI.md`)

Sekwencja krótkich sesji z celem i kryterium „zrobione" ZANIM sesja ruszy. Wzorzec:

| Sesja | Cel | Dowód ukończenia |
|---|---|---|
| S1 | Scaffold ze startera + pipeline | hello-world na preview URL |
| S2 | Migracja DB + RLS | test kluczem anon wklejony (zero przecieków) |
| S3 | Auth + konta | rejestracja→logowanie→reset na preview |
| S4a..n | Funkcja główna — **1 moduł = 1 sesja** | moduł działa E2E na preview |
| S5 | Panel użytkownika | screenshot + klikalny flow |
| S6 | Panel operatora | agregaty przez edge fn (service-role) |
| S7 | Płatności Stripe | płatność testowa → webhook → dostęp (log) |
| S8 | Lifecycle e-maile | wysyłka testowa + email_log |
| S8b | **Onboarding** (krok `onboarding`, po rdzeniu+panelach+mailach) — aha/JTBD survey/checklist „Pierwsze kroki"/empty-states/instrumentacja/seria maili+`milestone`/dashboard aktywacji, pętla do wyczerpania | onboarding przejść oczami usera niszy; framework+protokół = **`docs/stworze/ONBOARDING-FABRYKA.md`** |
| S9 | Landing + cennik | preview + mobile 375px |

Twarda zasada (badania: 2× dłuższe zadanie = 4× więcej porażek): sesje KRÓTKIE, domykane, nie sklejane.
Scope creep: wszystko spoza `01-MVP-SCOPE.md` → `wfa_notes` „na później", NIGDY do bieżącej sesji.

## 3. Rytuał każdej sesji budowlanej

1. Przeczytaj `BUILDLOG.md` + swoją sekcję z `08-PLAN-SESJI.md` + odpowiednie pliki paczki.
2. Wykonaj TYLKO cel sesji.
3. **Commit → deploy preview → DOWODY** (wynik testu / curl / screenshot — wklejone, nie „zrobione ✓").
4. Dopisz wpis do `BUILDLOG.md`.
4.5. MINI-RUNDA KRYTYKA (decyzja Tomka 15.07): zaraz po commicie sesji świeży subagent-krytyk (bez kontekstu budowy) przechodzi WYŁĄCZNIE ZAKRES TEJ SESJI na prodzie/preview i szuka usterek. Znaleziska naprawia się od ręki przed domknięciem kroku; pełna pętla adwersarska do wyczerpania (sekcja 4) zostaje w etapie Przegląd.
5. Jeśli utknąłeś na decyzji biznesowej — NIE zgaduj: zapisz pytanie w BUILDLOG „DO DECYZJI TOMKA" i zakończ sesję.

## 3a. Cykl życia Uwag (wfa_notes) — uwagi nigdy nie „leżą"

Tomek dorzuca uwagę JEDNĄ linijką w dowolnym momencie (zakładka Uwagi). Dalej proces jest automatyczny:
1. **Triage hurtowy (raz, krok `uwagi_tomka` w E1):** decyzje fundamentowe rozstrzygnięte przed MVP scope.
2. **Każda sesja dostaje wszystkie OTWARTE uwagi** (wstrzykiwane do każdego promptu z panelu) i przetwarza je:
   (a) dotyczy jej kroku → stosuje i ZAMYKA z adnotacją „✅ jak zastosowano";
   (b) dotyczy przyszłości → zostawia;
   (c) dotyczy już zbudowanego → przetagowuje `[DEMO]` (drobiazg) lub `[v1.1]` (rozwój) — NIGDY nie wdraża po cichu;
   (d) sprzeczna ze scope / wymaga decyzji → eskalacja „DO DECYZJI TOMKA" w notatce kroku.
3. **Momenty zbiorcze:** `[DEMO]` konsumuje krok `poprawki_demo`; `[v1.1]` zbiera krok `stery` jako backlog
   dla operatora. Licznik otwartych uwag widoczny na tabie — rosnący = sygnał do zajrzenia.

## 4. Review adwersarski (osobny prompt, świeża sesja)

Po ukończeniu fazy budowy (i przy każdej dużej zmianie): nowa sesja dostaje WYŁĄCZNIE
`git diff main...HEAD` + kryteria z `01-MVP-SCOPE.md` + checklistę bezpieczeństwa. NIE czyta BUILDLOG-a
(niezależność od rozumowania budowniczego). Zadanie: ZNALEŹĆ błędy (nie potwierdzić poprawność) —
korekty do listy, każda z file:line i scenariuszem błędu. Wynik → checklist poprawek w kroku panelu.

## 5. Bramki człowieka (jedyne miejsca, gdzie Tomek MUSI patrzeć w kod/dane)

- **RLS + płatności** (audyt, Etap 4) — kategorie, w których kod z AI zawodzi najczęściej (45% oblewa testy bezpieczeństwa).
- **Test kluczem anon** — wykonany i wklejony jako dowód (przy S2 ORAZ w audycie).
- Decyzje: MVP scope, pricing, nazwa, akcept klienta, start produkcyjny.
Wszystko inne: Tomek przegląda DOWODY, nie kod.

## 6. Zasady jakości produktu (wpisane w spec, nie opcjonalne)

- `01-MVP-SCOPE.md` obowiązkowo definiuje: metrykę aktywacji (aha-moment), **time-to-first-value < 10 min**,
  listę NIE-funkcji, granicę „zmiany w cenie v1 vs rozwój".
- Pricing: trial **z kartą** (konwersja ~31% vs ~9% bez), plan roczny obok miesięcznego; cena poniżej kotwicy
  konkurencji z researchu niszy.
- Lifecycle e-maile behawioralne (lifecycle_status), nie kalendarzowe: welcome z JEDNYM krokiem, nudge 24-48h
  (okno 72h!), dunning. Max 4-6 maili / 14 dni.
- Webhook Stripe: inbox pattern (podpis → zapis surowego eventu → 200; osobny processor idempotentnie).
- **Rabaty subskrypcyjne operatora = STANDARD każdej apki** (moduł startera): Stripe Coupons + Promotion Codes
  na koncie operatora (%, czas trwania raz/X mies./na zawsze, limit użyć — 1 = kod imienny, ważność);
  sekcja „Rabaty" w panelu operatora; checkout z `allow_promotion_codes`. Zero własnej księgowości —
  Stripe liczy, a udział platformy nalicza się od kwoty PO rabacie automatycznie.
- Trial: domyślnie **bez karty na wejściu** (nieznana marka = karta ścina rejestracje ~65%); prośba o kartę
  w momencie aha (contextual capture). Model per apka potwierdza krok `pricing`.
- AI w produkcie tylko jako silnik jednego workflow niszy (mierzalna oszczędność w 1. sesji użytkownika), nigdy bajer.
- Mobile-first zawsze (nisze B2B pracują z telefonu — patrz Grzegorz: „fachowiec w trasie").

## 6a. Pipeline designu (krok `design`, Etap 3) — pętla repo ↔ Claude Design

Dwukierunkowa synchronizacja przez narzędzie **DesignSync** (skill `/design-sync` jeśli dostępny):
1. Sesja KONSUMUJE kontrakt tokenów z `brief/04-STYLEGUIDE` (wyprodukowany w kroku `paczka_cc`: zbadane
   hexy z samplingu makiet, tabela kontrastów WCAG, warianty tekstowe, geometria, zasady PDF/mobile) —
   NIE sampluje makiet od nowa (lekcja z pilota 13.07: dublowanie = ryzyko rozjazdu). Makiety tylko jako
   referencja układów. + inwentarz ekranów ze specu + ton/kontekst niszy (teren → większe cele dotykowe).
2. TOKENY: jedno źródło prawdy w runtime = `:root` w `public/css/base.css` (wartości z 04 wpisane 1:1;
   klasy komponentów niszy też do base.css). `design-system/tokens.css` = AUTOGENEROWANA kopia :root
   (tylko po to, by podglądy renderowały się samodzielnie w Claude Design). Biblioteka w repo
   `design-system/`: preview HTML per komponent z markerem `<!-- @dsCard group="…" -->`
   (Brand/Type/Colors/Components/Forms/Screens); komponenty we wszystkich stanach + wzorce specyficzne
   apki (PDF itd.) + **2-3 pełne ekrany wzorcowe = dowód spójności**.
3. PĘTLA SAMODOSKONALENIA (autonomiczna, bez czekania na Tomka): render-check każdej karty przez
   **Playwright z repo apki** (chrome-devtools nie widzi lokalnych plików) + krytyk w świeżym kontekście
   (spójność tokenów, kontrast wg tabeli z 04, stany, mobile) → napraw → powtórz, aż zero zastrzeżeń
   (pętla DO WYCZERPANIA — bez limitu rund; decyzja Tomka 14.07, dotyczy każdej serii poprawek).
4. PUSH do projektu claude.ai/design (DesignSync: create_project → finalize_plan → write_files) —
   NIEBLOKUJĄCY podgląd dla Tomka; jego iteracje są opcjonalne. PULL na hasło „zsynchronizuj design":
   list_files → diff → get_file tylko zmienionych → repo, komponent po komponencie (nigdy hurtowo).
5. **Kanon = repo.** Ekrany apki i landing stylują się WYŁĄCZNIE tokenami/komponentami; zakaz stylowania
   ad hoc wpisany w CLAUDE.md apki (sekcja 🚫). Zero AI-sztampy (generyczne gradienty/fiolet).

## 7. Start rynkowy (Etap 5 — kolejność kanałów)

Soft launch: 5-10 userów z sieci operatora (beta, testimoniale) → publiczny start po tygodniu.
GTM 0→50: (1) sieć operatora + grupy branżowe → (2) outreach z AI-personalizacją (RODO: uzasadniony interes,
łatwy opt-out) → (3) partnerstwa dystrybucyjne (hurtownie/izby) → (4) kilka MOCNYCH stron porównawczych
(AI+człowiek; NIE masowy AI-content). Płatne = wyłącznie retargeting, po PMF. Cold ads przy niskim ACV
się nie domykają (CAC $3-4k vs partnerstwa −50% CAC).
