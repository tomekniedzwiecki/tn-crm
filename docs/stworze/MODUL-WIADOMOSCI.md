# MODUŁ WIADOMOŚCI — koncept fabryki (e-mail w SaaS)

> Standard fabryki TN App (decyzja Tomka 14.07). Uniwersalny — buduje się w starterze, każda apka dziedziczy.
> Pilot: Fachmat. Kroki workflow: `wiadomosci_panel` (E3, sort 82), `wiadomosci_trial` (E3, sort 84).
> Zależności: rozszerza istniejące `lifecycle-emails` + `_shared/resend.ts` + tab operatora (S20 taby).

## Cel i zakres

Operator ma w panelu PEŁNY wgląd i kontrolę nad e-mailami: co wychodzi, kiedy, do kogo, z jakim skutkiem —
oraz serię onboardingową trialu prezentującą funkcje. Wszystkie maile w JEDNYM brandowanym layoucie
„jak w dobrym SaaS" (nagłówek z logo marki, czytelna treść, CTA-przycisk, stopka RODO).

## A. Wspólny layout maila (fundament — `_shared/mail-layout.ts` w starterze)

Jeden szablon HTML owijający każdą treść (welcome/trial/dunning/referral/...):
- **Nagłówek:** logo marki (`BRAND_LOGO_URL` z env apki ← `wfa_projects.brand_logo_url`); BRAK logo → tekstowy
  lockup nazwy aplikacji (Oswald-podobny bold, kolor akcentu) — placeholder gotowy OD RAZU, logo dochodzi później.
- **Treść:** tytuł (h1 ~22px), akapity (16px/1.6, ciemny grafit na białym), maks. 1 główne CTA jako przycisk
  (tło akcent, biały tekst, radius, padding) — nie goły link; opcjonalne drobne linki pod CTA.
- **Stopka:** „Otrzymujesz tę wiadomość, bo masz konto w {{APP_NAME}} ({{DOMAIN}})." + adres operatora
  (z legal, po uzupełnieniu) + link wypis/ustawienia dla maili marketingowych (opt-out; transakcyjne bez).
- Inline CSS (klienty pocztowe), tabela-based layout, szerokość 600px, dark-mode-safe kolory, PL znaki.
- Tokeny marki: kolor akcentu z `THEME_COLOR` apki (spójność z produktem). XSS: dane usera przez escape.
- Wariant `preheader` (ukryty tekst podglądu skrzynki).

## B. Krok `wiadomosci_panel` — centrum wiadomości w panelu operatora

Nowy tab w panelu operatora (admin.html — dołączyć do routera tabów z S20): **„Wiadomości"**. Sekcje:

1. **Historia wysyłek** (z `email_log`): tabela kto/kind/temat/`delivered_at`/status (przyjęty/dostarczony/
   błąd), filtr po rodzaju i dacie, wyszukiwarka po adresie; klik wiersza → podgląd wysłanego maila.
   Agregaty przez edge (service-role): wysłane 7/30 dni, wskaźnik dostarczalności. (Tracking otwarć OFF —
   logika na `delivered_at`; jeśli dojdzie Resend webhook delivered/bounced → status dokładniejszy, patrz R.)
2. **Szablony systemowe** (welcome / reset / trial_ending / trial_expired / dunning / winback / referral):
   lista z podglądem RENDERU (layout A) + edycja **tematu i treści** (bezpieczne pola — placeholdery
   `{{imie}}`/`{{link}}` walidowane) + przełącznik włącz/wyłącz per rodzaj (poza krytycznymi: reset). Zapis do
   `app_settings` apki (klucz `mail_tpl_<kind>`), edge czyta z override lub domyślny z kodu. „Wyślij testowy
   do mnie" (do adresu operatora).
3. **Wiadomość ręczna / ogłoszenie** (rozszerza istniejący `admin-broadcast`): napisz jednorazowy mail do
   segmentu (wszyscy/trial/płacący/aktywni; respektuje `marketing_opt_out`), podgląd w layoucie, wyślij
   partiami (istniejący mechanizm 50+sleep+deadline). Zapis do historii.

Dowód budowy: wysyłki widoczne w historii ze statusami; edycja szablonu zmienia render; test do operatora
dociera; broadcast respektuje opt-out; kill_emails wycisza; mobile tab bez overflow.

## C. Krok `wiadomosci_trial` — seria onboardingowa trialu (drip prezentujący funkcje)

Sekwencja behawioralna (NIE czysto kalendarzowa) w oknie triala (14 dni), prowadzona przez `lifecycle-emails`
(cron godzinowy już jest) + tabela stanu (`email_log.kind` = dedup). Domyślna seria (konfigurowalna przez
operatora — włącz/wyłącz całość i pojedyncze kroki, edycja treści):

| Dzień | Kind | Cel / funkcja do pokazania | Warunek (behawioralny) |
|---|---|---|---|
| 0 | `welcome` | Powitanie + JEDEN pierwszy krok (funkcja rdzenia) | rejestracja |
| 1 | `trial_tip_1` | Funkcja A niszy (np. „materiały jedną kwotą") | brak aha (nie zrobił kluczowej akcji) |
| 3 | `trial_tip_2` | Funkcja B (np. „wersje ofert / zamrożenie") | — |
| 5 | `trial_tip_3` | Dowód wartości / oszczędność czasu + social proof | — |
| 7 | `trial_half` | Półmetek: przypomnij korzyść, zaproś do 1. realnego użycia | jeśli mało aktywny |
| 11 | `trial_ending` | „Zostają 3 dni" — CTA plan (contextual capture) | status trialing |
| 14 | `trial_expired` | Trial minął, wejście wolne, płatna akcja = plan | po terminie |

Zasady: aktywny user (osiągnął aha, robi oferty) dostaje LŻEJSZĄ ścieżkę (pomijaj tipy, które dotyczą
funkcji już używanych); każdy mail = layout A z 1 CTA do konkretnej funkcji; dedup po kind; kill_emails
respektowany; treści per apka (starter ma domyślne PL teksty niszy-agnostyczne + hook na personalizację
w kroku `dane_operatora`/budowy).

Dowód: symulacja okien (SQL trial_ends_at) → właściwe maile z resend_id; dedup działa; aktywny user
pomija tipy; wszystkie w layoucie A; zero maili do realnych (kill_emails w teście).

## D. Inne maile warte rozważenia (operator — do listy szablonów)
- **Odzyskanie porzuconego onboardingu** (założył konto, 0 akcji po 48h) — już w serii (trial_tip_1 warunkowy).
- **Powiadomienie o nowej funkcji / changelog** (broadcast „co nowego") — jest (admin-broadcast + co-nowego).
- **Prośba o opinię** po N ofertach (moment satysfakcji → też punkt zaczepienia poleceń — patrz MODUŁ-POLECENIA).
- **Reaktywacja** (winback po anulowaniu) — jest w lifecycle.
- **Potwierdzenia transakcyjne** (płatność, faktura-link z portalu Stripe) — z processora; ujednolicić do layoutu A.
- **Alert operatora** (nowa opinia/zgłoszenie, dispute) — istnieje (feedback-notify, dispute) — ujednolicić layout.

## E. Logo marki — przepływ
`wfa_projects.brand_logo_url` (panel, pole dodane 14.07) → przy budowie/konfiguracji apki trafia do env apki
`BRAND_LOGO_URL` (lub `app_settings.brand_logo_url`) → `_shared/mail-layout.ts` wstawia `<img>` albo placeholder
tekstowy. Puste = tekstowy lockup (nie psuje maila). Logo generujemy później — placeholder od pierwszego maila.

## Zakres per warstwa
- **STARTER (uniwersalne):** `_shared/mail-layout.ts`, refactor wszystkich lifecycle/broadcast/processor maili na
  layout A, tab „Wiadomości" w admin (historia+szablony+ręczny), tabela override szablonów w app_settings,
  szkielet serii trialowej z domyślnymi PL tekstami niszy-agnostycznymi, `BRAND_LOGO_URL` w .env.example.
- **APKA (per nisza, krok budowy):** treści tipów trialowych pod funkcje danej niszy; podmiana placeholderów.

## Ryzyka / uwagi
- Rate limit Resend (auth) podniesiony do 30 (lekcja S8) — seria + broadcast tego wymagają.
- Deliverability: `delivered_at` dziś = „przyjęty przez Resend", nie „dostarczony". R (osobno): dodać
  `resend-webhook` (delivered/bounced/complained → aktualizacja email_log) przed dużym wolumenem.
- Wszystko respektuje `kill_emails` (globalny wyłącznik) i `marketing_opt_out` (dla nietransakcyjnych).
