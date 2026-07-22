# 08-PLAN-SESJI — Majster Blisko (nazwa robocza) · DRAFT sesji fabryki, 2026-07-22

> Draft do paczki `brief/08-PLAN-SESJI.md` (przechodzi krokiem `paczka_cc`; repo aplikacji jeszcze nie istnieje).
> Metodyka: `tn-crm/docs/stworze/METODYKA-BUDOWY.md`. **1 moduł = 1 sesja** (2× dłuższa sesja = 4× więcej porażek).
> Każda sesja = rytuał §3: BUILDLOG-first → wykonanie → commit+deploy+DOWODY → mini-runda krytyka → SYNC PANELU → LEKCJE→FABRYKA.
> Scope creep (spoza 01-MVP-SCOPE) → `wfa_notes` „na później", NIGDY do bieżącej sesji.
> Status: [ ] pending / [x] done. Zależności = twarde (nie startuj sesji przed spełnieniem).

---

## Kręgosłup i tory (METODYKA §2b)

**KRĘGOSŁUP (sekwencyjny, przed fan-outem):** S0 pipeline → S1 schemat + **GATE A/rls-matrix zielony** → S2 auth (auth-e2e zielony) → **KONTRAKTY NA PIŚMIE** (nazwy eventów aha z §6 specu · paywall: gate 402 na `oferta` bez abonamentu · kanony statusów z §5 specu · tokeny stylu z PREVIEW-BRIEF · granty kolumn).

**Tory równoległe po kręgosłupie:** **R (RDZEŃ)** = S4a→S4m sekwencyjnie wewnątrz toru (`app.html`, `js/app.js`, `base.css`, migracje, edge rdzenia); **L (LANDING)** = S3 (`index.html`, `css/landing.css`, `img/`); **PA (OBRZEŻE)** = S6+S8 (`admin.html`, `js/admin.js`, `_shared/mail-templates.ts`). **Twardo sekwencyjne:** moduły rdzenia między sobą (S4a→…→S4m), onboarding (S9), płatności realne (S7), przegląd holistyczny, demo klienta.

**Ścieżka krytyczna do demo dwustronnego:** S0→S1→S2→S4a→S4b→S4d→S4e→S4f→S4g→S4h (pętla: klient publikuje → fachowiec ofertuje → klient wybiera → domknięcie). Reputacja/powiadomienia/monetyzacja/operator domykają wartość po tej pętli.

---

## S0 — Infra done-check (krok `repo_vercel`)
- **Cel:** forge ze startera → repo private → Vercel git connect → dowody Production/Preview → smoke 404. Placeholder zostaje na prodzie.
- **Zakres plików:** cała kopia `template/` przez `node forge.mjs majster-blisko "Majster Blisko" ../majster-blisko`; `vercel.json`, `.env.example`; źródła Etapu 1 → `brief/zrodla/`.
- **Kryterium done (testowalne):** Production URL i Preview URL odpowiadają; `/` = 200, losowy `/xyz` = 404; `git push main` triggeruje deploy; BUILDLOG S0 gotowy (niepubliczny).
- **Zależności:** — (start).

## S1 — Schemat DB + RLS (krok `schemat_db`)
- **Cel:** migracja niszy na fundamencie startera + RLS + **test anon OD RAZU** + fixture `rls-matrix`.
- **Zakres plików:** `supabase/migrations/00XX_majster_core.sql` (numeruje TYLKO tor R): `teryt_*` (wojewodztwa/powiaty/miasta/dzielnice + centroidy), `zlecenia` (status maszyna §5.1), `oferty` (§5.2), `pytania_qa`, `rozmowy`/`wiadomosci`, `ustalenia` (wersjonowane §5.3), `oceny`, `rezygnacje`, `spory`, `subskrypcje`, `firmy`/`pracownicy`, `powiadomienia`, `sms_limity`; funkcja `haversine_km`; widok `fachowiec_score`; `tests/rls-fixture.json`.
- **Kryterium done:** tabele istnieją; **anon nie przecieka** (dowód `rls-matrix.mjs` zielony w BUILDLOG); RLS row-level: klient widzi swoje zlecenia, fachowiec skrócony podgląd bez kontaktu, potomne (oferty/wiadomości) chronione WITH CHECK po własności rodzica; **GATE A zielony przed fan-outem**.
- **Zależności:** S0.

## S2 — Auth E2E (krok `auth_konta`)
- **Cel:** weryfikacja startera na żywym deployu — e-mail+hasło (silnik startera). Fundament pod role niszy (S4a).
- **Zakres plików:** `public/auth.html`, `js/auth.js` (starter); konfiguracja Resend SMTP (reset hasła).
- **Kryterium done:** rejestracja → logout → login → reset przez Resend przechodzi E2E na preview; **event `signed_up` (meta `metoda`) trafia do `app_events`**. UWAGA: reset wymaga Resend (krok `resend_dns`) — jeśli DNS niegotowy, reset odłożony z flagą.
- **Zależności:** S1. (SMS-OTP = osobno w S4c — A-02.)

## S3 — Design system + Landing (tor L, zależnie od DAG)
- **Cel:** tokeny stylu z PREVIEW-BRIEF do `base.css` (kanon) + landing dwustronny „Potrzebuję pomocy / Jestem fachowcem".
- **Zakres plików:** `public/css/base.css` (`:root` tokeny: `#F3EFE5`/`#FFFDF7`/`#F05A28`/`#2F7D57`, grotesk, 12 px, ciemne obrysy, offsetowe cienie), `design-system/`; `public/index.html`, `public/css/landing.css`, `img/`.
- **Kryterium done:** render-check komponentów (Playwright z repo) + krytyk (kontrast WCAG, mobile 360/390/414) bez zastrzeżeń; landing ma dwa wejścia CTA (klient/fachowiec) spójne z survey `jtbd_selected`; makieta telefonu z formularzem; sekcja „3 kroki" + przykłady drobnych napraw + sekcja dla fachowców (abonament zamiast opłaty za kontakt).
- **Zależności DAG:** tokeny (design) — po kręgosłupie; **copy landingu i seed miasta czekają na B-01** (miasto startu) → landing scaffold buduje strukturę, copy GTM z flagą do uzupełnienia. Może iść RÓWNOLEGLE do toru R po S2.

---

## S4a..S4m — FUNKCJA GŁÓWNA (tabela z 01-MVP-SCOPE §6, przeniesiona 1:1 + doprecyzowane kryteria done)

> Kolejność i zależności = wiernie z §6 scope. „Gotowe, gdy" doprecyzowane do testowalnych kryteriów E2E na preview.

### [ ] S4a — W1: Konto + role + logowanie e-mail/hasło + profile + telefon obowiązkowy
- **Cel:** 4 role (`klient`/`fachowiec_solo`/`wlasciciel_firmy`/`pracownik_firmy`) na fundamencie startera; profile obu stron; telefon obowiązkowy.
- **Zakres plików:** migracja `profiles` (role + pola profilu klienta/fachowca), `public/app.html` (ekran profilu E11), `js/app.js` (profil, wybór roli), grant kolumn.
- **Done:** rejestracja z wyborem roli działa; profil klienta zapisuje województwo/powiat/miasto-dzielnica; profil fachowca zapisuje zdjęcie, specjalizacje, badge Firma/Osoba, faktura/rachunek, deklaracja SEP (numer+ważność) przy Elektryce; **telefon wymagany i zweryfikowany**; profil pokazuje wyłącznie imię (bez nazwiska).
- **Zależności:** S2 (starter auth).

### [ ] S4b — W1: Lokalizacja TERYT + haversine + seed
- **Cel:** statyczny słownik lokalizacji + odległość haversine, city-agnostic.
- **Zakres plików:** seed `teryt_*` (miasto startu + powiaty ościenne — **czeka B-01**, schemat buduje się bez niego), funkcja `haversine_km`, komponent wyboru miasto/dzielnica.
- **Done:** słownik zaseedowany dla miasta startu; wybór miasta/dzielnicy → powiat wynika automatycznie; **odległość na kartach zgadza się z haversine z centroidów** (test jednostkowy na znanej parze); bez zewnętrznego API map.
- **Zależności:** — (równolegle z S4a wewnątrz toru; seed czeka B-01).

### [ ] S4c — W1: Logowanie telefon + SMS OTP
- **Cel:** druga ścieżka logowania (telefon+kod) — osobna sesja przed E2E (A-02).
- **Zakres plików:** edge `send-sms` (SMSAPI, wzorzec tn-crm), Supabase Auth **Send SMS hook**, `js/auth.js` (ekran OTP).
- **Done:** rejestracja i logowanie telefonem+kodem SMS przechodzi E2E na koncie testowym; kod 6-cyfrowy, wygaśnięcie i limit prób egzekwowane; telefon zweryfikowany zapisany na koncie.
- **Zależności:** S4a.

### [ ] S4d — K1: Publikacja zlecenia + moje zlecenia
- **Cel:** formularz dodania bezpłatnego zlecenia (E3) + lista/szczegóły moich zleceń (E4).
- **Zakres plików:** `js/app.js` (formularz, moje zlecenia), Storage (upload zdjęć), migracja `zlecenia`.
- **Done:** publikacja od zera na telefonie **< 1 min**; walidacja minimum (kategoria+lokalizacja+opis/zdjęcie+termin); `wymaga_uprawnien=true` dla Elektryki instalacyjnej; **„duży remont" → ekran info BEZ publikacji** (D-06); lista/szczegóły odzwierciedlają realne statusy; **potwierdzenie zasięgu** „widzi N fachowców w powiecie X" (realny COUNT); **event `zlecenie_opublikowane` (proxy-aha klient)** emitowany.
- **Zależności:** S4a, S4b.

### [ ] S4e — F1: Rynek fachowca (lista lokalna + skrócony podgląd + filtry + pulpit + odległość)
- **Cel:** pulpit „lista dnia" (E5) + skrócony podgląd bez abonamentu (furtka wartości).
- **Zakres plików:** `js/app.js` (pulpit fachowca, filtry specjalizacji, karty z odległością).
- **Done:** lista pokazuje **wyłącznie** zlecenia `powiat ∈ opłacone/wybrane ∧ specjalizacja` posortowane wg odległości/terminu; nagłówki liczbowe („7 nowych", „3 do 5 km", „2 na dziś"); **bez abonamentu = skrócony podgląd bez kontaktu i bez przycisku oferty**; **event `zlecenia_lokalne_zobaczone` (aha fachowiec = `activated`)** emitowany przy wejściu na listę.
- **Zależności:** S4b, S4d.

### [ ] S4f — F1: Q&A + formularz oferty (widełki/oględziny, faktura, bramka SEP)
- **Cel:** pytania przed ofertą (D-02) + oferta fachowca (E6).
- **Zakres plików:** `js/app.js` (Q&A, formularz oferty), edge/RPC `zloz-oferte` (**emituje serwerowo `oferta_otrzymana`** do klienta przy pierwszej ofercie), migracje `pytania_qa`/`oferty`.
- **Done:** Q&A z kontrolą widoczności (odpowiedź fachowca publiczna; odpowiedź klienta „Widoczna dla wszystkich" domyślnie / „Tylko dla pytającego"); oferta = **widełki XOR oględziny** + termin + wiadomość + faktura; **oferta tylko z aktywnym abonamentem** (bez → gate 402/CTA); **bramka SEP blokuje ofertę** do zlecenia z flagą bez ważnej deklaracji; **event `oferta_wyslana`** (fachowiec) + **serwerowe `oferta_otrzymana`** (klient, `aha_source=server-webhook`).
- **Zależności:** S4e, S4d.

### [ ] S4g — K2: Oferty u klienta + wybór + ujawnienie tel + zamknięcie pozostałych + przywracanie
- **Cel:** lista ofert (E7) + wybór wykonawcy.
- **Zakres plików:** `js/app.js` (lista ofert, wybór), RPC `wybierz-wykonawce` (atomowe: oferta `wybrana`, reszta `odrzucona_wybrano_innego`, zlecenie `wykonawca_wybrany`, ujawnienie telefonu).
- **Done:** oferty sortowane **`score DESC, czas ASC`**; wybór **ujawnia telefon** i **auto-zamyka pozostałe**; ostrzeżenie „bez faktury" + **twarde potwierdzenie** gdy klient zaznaczył potrzebę dokumentu (D-10); ścieżka **rezygnacja → przywrócenie ofert → ponowne potwierdzenie dostępności** przechodzi E2E; **event `wykonawca_wybrany`**.
- **Zależności:** S4f.

### [ ] S4h — W2: Komunikator + podsumowanie AI + podwójna akceptacja + statusy + zakończenie/odrzucenie + auto-zamknięcie 4 dni
- **Cel:** pełny pipeline domknięcia (E8, E9) — najcięższy technicznie moduł rdzenia.
- **Zakres plików:** `js/app.js` (komunikator, panel ustaleń, realizacja); edge `transkrypcja` + `podsumowanie-ustalen` (OpenAI, A-04); Storage (foto/dokumenty/audio); cron `job-closer` (licznik 4 dni + przypomnienia 24/72 h + auto-zamknięcie); migracje `rozmowy`/`ustalenia`.
- **Done:** pełna pętla **wybór→komunikator→podsumowanie→podwójna akceptacja→realizacja→zakończenie→(odrzucenie→ponowna realizacja)→auto-zamknięcie** przechodzi E2E; **transkrypcja edytowalna z etykietą „edytowano"**; podsumowanie z realnej rozmowy testowej; **reset akceptacji po edycji** (§5.3) działa; **licznik 4 dni startuje przy „zakończone"** fachowca; przypomnienia 24/72 h push/e-mail (bez SMS); **2. odrzucenie → `w_sporze`** (kolejka operatora).
- **Zależności:** S4g, edge A-04, Storage. → **MINI-REVIEW rdzenia (obowiązkowy) po S4h** przed dalszymi.

### [ ] S4i — W3: Oceny + rezygnacje (D-14) + scoring (D-11) + ostrzeżenia
- **Cel:** dwustronna reputacja + wskaźnik rzetelności.
- **Zakres plików:** `js/app.js` (oceny E10), migracje `oceny`/`rezygnacje`, widok/funkcja `fachowiec_score` (deterministyczna).
- **Done:** oceny dwustronne (1–5+komentarz) zapisują się **tylko po `zamkniete_wykonane`**; **scoring deterministyczny** (100 baza; −25/nieuzasadniona z 90 dni; max −75; powrót do 100 po 3 poprawnych) liczy się z historii; **pozycja ofert = sort po score**; **ostrzeżenie o kliencie** pojawia się po 3 nieuzasadnionych, znika po 3 poprawnych; rezygnacja z powodem z listy + opis **nie obniża** score.
- **Zależności:** S4h.

### [ ] S4j — W3: Powiadomienia in-app + e-mail + SMS pilne + ustawienia
- **Cel:** trzy kanały powiadomień + ustawienia (E12).
- **Zakres plików:** migracja `powiadomienia`/`sms_limity`, edge `notify` (dispatch in-app/e-mail via Resend/SMS via `send-sms`), `js/app.js` (badge in-app, ustawienia kanałów + dni/godziny fachowca).
- **Done:** powiadomienia docierają **wszystkimi trzema kanałami** wg ustawień (domyślnie ON); fachowiec ustawia dni/godziny doręczeń; **SMS wyłącznie dla „pilnej wiadomości"** w aktywnym zleceniu; **limit 2/24 h per strona** i **blokada 2 dni** po potwierdzonym nadużyciu — egzekwowane serwerowo.
- **Zależności:** eventy z S4d/S4g/S4h/S4i.

### [ ] S4k — F2: Monetyzacja (Stripe + powiaty + dodatki + panel firmy + pracownicy + SEP + spadek do podglądu)
- **Cel:** abonamenty i panel firmy (E13, E14) — buduje model danych + UI + wiring Stripe (E2E domyka S7).
- **Zakres plików:** `js/app.js` (E13 zakup/zarządzanie, E14 panel firmy), rozszerzenie mapy `PLANS` w `stripe-checkout` (>1 plan + dodatki z quantity — patrz PRICING-FINAL), migracje `subskrypcje`/`firmy`/`pracownicy`.
- **Done:** zakup abonamentu, **dokupienie powiatu z proracją** i dodanie pracownika przechodzą E2E na Stripe **testowym**; po wygaśnięciu dostęp **spada do skróconego podglądu**; panel firmy przydziela zlecenia w **obu trybach**; **kontrola ważności SEP blokuje przypisanie** pracownika bez deklaracji; rok = 10 miesięcy (rabat tylko abonament główny).
- **Zależności:** S4a, S4e, krok `stripe_kyc`. (Może iść równolegle po S4e — zależy tylko od dostępu do powiatów.)

### [ ] S4l — O1: Panel operatora (kolejka sporów + skutki + dashboard aktywacji dwustronnej)
- **Cel:** funkcje operatora (E15 + dashboard) — buduje logikę; osadzenie w starter admin domyka S6.
- **Zakres plików:** `admin.html`, `js/admin.js` (kolejka sporów, oś zdarzeń, dashboard), edge `admin-spory` (decyzje + skutki service-role), rozszerzenie `admin-stats` (dwa lejki).
- **Done:** operator **rozstrzyga każdy typ sporu** (drugie odrzucenie / nieobecność / nadużycie SMS / zakwestionowana rezygnacja / inne), a **skutki wykonują się automatycznie** (odblokowanie oceny / blokada SMS 2 dni / korekta score / zamknięcie); **dashboard = dwa niezależne lejki** per strona z realnymi eventami (activation rate, mediana TTFV, drop-off, D7); formularz odpowiedzi drugiej strony z terminem 48 h.
- **Zależności:** S4h, S4i, S4j (eventy).

### [ ] S4m — Krok `onboarding` (standard fabryki) — ≡ **S9** poniżej
- **Cel:** survey wybiera STRONĘ, checklist/empty/aha per strona, liquidity concierge, instrumentacja obu lejków.
- **Zależności:** wszystkie + **aha znane** (S4d, S4e, S4f). Szczegóły = S9.

---

## Sesje standardu fabryki (S5–S9)

> Wrap/hardening po funkcji głównej. S6/S7/S9 = osadzenie i weryfikacja E2E pracy zbudowanej w S4l/S4k/S4m (mapowanie jawne, BEZ podwójnego budowania).

### [ ] S5 — Panel usera (krok `panel_usera`)
- **Cel:** domknięcie panelu usera obu stron: konto/profil/ustawienia, stany puste, mobile sweep.
- **Zakres plików:** `public/app.html`, `js/app.js` (E2 panel klienta, E11 profile, E12 ustawienia — spójność), `css/base.css`.
- **Done:** wszystkie ekrany usera mają stany puste/błędów/ładowania; mobile 360/390/414 bez overflow; senior-friendly (duże cele dotykowe, duże ceny/odległości/terminy); klikalny flow obu stron; nawigacja spójna.
- **Zależności:** S4a–S4k.

### [ ] S6 — Panel operatora (krok `panel_operatora`)
- **Cel:** osadzenie funkcji operatora (S4l) w starter admin + niszowe kolumny/kafle + weryfikacja; meta-onboarding operatora.
- **Zakres plików:** `admin.html`, `js/admin.js` (starter: MRR/churn/użytkownicy/płatności/rabaty/wiadomości/Marka + nisza: kolejka sporów, dashboard dwóch lejków, checklista „Pierwsze kroki operatora").
- **Done:** agregaty przez edge (service-role); operator widzi dwa lejki z realnymi eventami; kolejka sporów działa z automatycznymi skutkami (dowód: rozstrzygnięcie testowego sporu → skutek w DB); rabaty = Coupons+Promotion Codes; podmiana logo/marki działa.
- **Zależności:** S4l.

### [ ] S7 — Płatności E2E (krok `platnosci_e2e`)
- **Cel:** domknięcie i test E2E monetyzacji z S4k na **finalnym pricingu** (PRICING-FINAL).
- **Zakres plików:** `stripe-checkout` (mapa PLANS: `_fachowiec_month`99/`_fachowiec_year`990/`_firma_month`149/`_firma_year`1490 + dodatki quantity `_pracownik_month`39/`_powiat_month`19), `stripe-webhook` (inbox pattern), `stripe-processor` (idempotentny), `trial_days=0`.
- **Done:** płatność testowa → webhook → dostęp (log); direct charge z `application_fee_percent` z `wfa_projects.fee_percent`; proracja dokupionego powiatu; dunning `past_due`; **bez triala** (`app_settings.trial_days=0`); **gate: Stripe Connect platforma Tomka + `stripe_kyc` klienta**.
- **Zależności:** S4k. ⏸ bramka: konto Connect operatora + KYC.

### [ ] S8 — Lifecycle maile (krok `maile_trans`)
- **Cel:** behawioralne maile cyklu życia obu stron (nie kalendarzowe; max 4–6/14 dni).
- **Zakres plików:** `lifecycle-emails`, `_shared/mail-templates.ts`, `0002_cron.sql` (job aktywny!).
- **Done (per strona):** **klient** — welcome (1 krok: dodaj pierwsze zlecenie), nudge 24–48 h po rejestracji bez zlecenia; po publikacji bez ofert — komunikat „czekamy, aż fachowcy odpowiedzą" (nie sugeruj porażki). **Fachowiec** — welcome (zobacz lokalne zlecenia), nudge po podglądzie bez zakupu, nudge po zakupie bez oferty; **dunning** dla `past_due`. Wysyłka testowa + `email_log`; Resend svix-id dedup.
- **Zależności:** eventy z rdzenia; Resend DNS. **BRAMKA CRONÓW:** `select jobname from cron.job` zawiera komplet (lifecycle-emails, stripe-processor, job-closer) przed zaliczeniem.

### [ ] S9 — Onboarding (krok `onboarding`, ≡ S4m) — standard fabryki, TWARDO SEKWENCYJNY
- **Cel:** onboarding dwustronny — projektowany na REALNYM aha rdzenia (marketplace-dwustronne, ONBOARDING §6).
- **Zakres plików:** `js/onboard.js`, `js/track.js` (eventy niszy), `admin-stats` scope `onboarding`, migracja `profiles.jtbd` (już w 0018 startera — rozszerzyć wartości `strona:klient`/`strona:fachowiec`).
- **Done:** **survey wybiera STRONĘ** („Potrzebuję pomocy" / „Jestem fachowcem" → `jtbd_selected` meta `{strona}`); różny **checklist/empty-state/aha per strona**; **klient**: proxy-aha `zlecenie_opublikowane` (TTFV<10 min) + `activated=oferta_otrzymana` serwerowo, checklista `awaiting` (nie sugeruje porażki); **fachowiec**: `activated=zlecenia_lokalne_zobaczone` (TTFV<10 min); **liquidity concierge** (realna podaż+popyt operatora, ZERO fałszywego seedu); **instrumentacja obu lejków** żywa w dashboardzie; onboarding przejść oczami usera każdej strony; pętla poprawek do wyczerpania.
- **Zależności:** S4d, S4e, S4f (aha znane) + S5/S6/S8. Framework: `docs/stworze/ONBOARDING-FABRYKA.md`.

---

## Bramki i przeglądy (METODYKA)
- **GATE A / rls-matrix** — zielony po S1, przed fan-outem torów.
- **MINI-REVIEW rdzenia** — obowiązkowy po S4h (świeży krytyk na pełnej pętli F1→domknięcie), przed S4i.
- **BRAMKA CRONÓW** — `cron.job` z kompletem jobów (job-closer, lifecycle-emails, stripe-processor) przed zaliczeniem S7/S8/start.
- **Review adwersarski** (§4) — po fazie budowy: świeża sesja, tylko `git diff` + kryteria 01-MVP-SCOPE + checklista bezpieczeństwa; podwójny audyt dla powierzchni najwyższej stawki (izolacja danych stron, płatności, ujawnianie telefonu, RLS potomnych).
- **Przegląd holistyczny + demo klienta** — po scaleniu wszystkich torów (akcept merytoryczny = klient-operator przy demo).

## Kryteria globalne (każda sesja)
Mobile-first; stany puste/błędów/ładowania; zero żargonu (senior-friendly); tokeny stylu z `base.css` (zakaz ad-hoc); `audit-static` 0 FAIL; commit per faza; wpis BUILDLOG przyrostowy + `LEKCJE→FABRYKA`; **SYNC PANELU** natychmiast po domknięciu kroku; koniec sesji dopiero po `wfa-panel-sync gaps` (zero [BEZ-POWODU]).

## Zależne od B-01 (miasto startu) — flaga do uzupełnienia
Seed słownika TERYT (S4b), copy landingu i GTM (S3), bramka płynności launchu. Schemat i haversine city-agnostic — budują się bez B-01; do uzupełnienia z materiałami operatora (krok `dane_operatora`).
