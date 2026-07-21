# Bramka zgody na rozpoczęcie prac — Portal Klienta (/twoj-biznes)

> **Status: WDROŻONE 21.07.2026** (migracja `20260722c_wf2_work_consent`, edge wf2-portal akcja `work_consent` TYLKO `{choice:'accept'}`, wersja oświadczenia **v2-2026-07-21** — po konsultacji gpt-5.6-sol treść uproszczona do reżimu usługowego [art. 35/38 pkt 1, bez „treści cyfrowych"]; checkbox w checkoucie OPCJONALNY). **Wariant UI „wait14" WYCOFANY dyspozycją Tomka 21.07 wieczór** — bramka ma JEDNĄ decyzję, a alternatywa („nie potwierdzaj → prace po upływie 14 dni") żyje wyłącznie w regulaminie (§11 ust. 4); po utworzeniu projektu +15 dni bramka znika sama (needs_work_consent=false, payload niesie work_start_after). Sekcje poniżej = pierwotny plan; przy rozjazdach wygrywa kod + CLAUDE.md.
> Podstawa prawna: art. 21 ust. 2, art. 35, art. 38 ust. 1 pkt 1 ustawy o prawach konsumenta.
> Cel: żaden projekt konsumencki nie rusza, dopóki klient nie złoży skutecznego żądania rozpoczęcia prac przed upływem 14-dniowego terminu odstąpienia.

## 1. Zasada działania (prawnie)

- Zamówienie i płatność NIE uruchamiają prac. Prace startują dopiero po złożeniu przez Klienta **żądania rozpoczęcia** (checkbox w portalu) — do tego czasu projekt „czeka", a Klient może odstąpić i dostaje 100% zwrotu. Taka konstrukcja jest w pełni legalna (swoboda usługodawcy co do momentu rozpoczęcia).
- Oświadczenie musi zawierać: (a) żądanie rozpoczęcia przed upływem terminu odstąpienia, (b) przyjęcie do wiadomości skutków. Skutki trzeba opisać **prawidłowo**:
  - treści cyfrowe (raporty, projekty, materiały w Portalu) → utrata prawa odstąpienia w odniesieniu do dostarczonych treści **z chwilą rozpoczęcia dostarczania** (art. 38 ust. 1 pkt 13),
  - usługa → utrata prawa odstąpienia **dopiero po pełnym wykonaniu** (art. 38 ust. 1 pkt 1); przy odstąpieniu wcześniej Klient płaci **proporcjonalnie** za wykonane etapy (art. 35) wg harmonogramu wartości etapów z regulaminu.
  - ⛔ NIE wolno pisać „z chwilą rozpoczęcia prac tracisz prawo odstąpienia [od całości]" — to nieprawda i unieważnia konstrukcję.
- **Trwały nośnik:** sam checkbox nie wystarcza — po akceptacji system wysyła automatyczny e-mail z pełną treścią oświadczenia, datą/godziną i wersją regulaminu (+ link do PDF regulaminu).

## 2. Kto widzi bramkę

- **Rekomendacja: WSZYSCY klienci**, nie tylko bez NIP. Powód: osoba z NIP może być „przedsiębiorcą na prawach konsumenta" (art. 7aa UoPK — umowa bez charakteru zawodowego, typowy przypadek: hydraulik/lekarz zakładający poboczny sklep) i wtedy MA pełne prawo odstąpienia. Filtrowanie po NIP nie daje pewności, a koszt bramki to jeden klik. Dla czystych firm zgoda jest neutralna.
- Techniczne rozróżnienie (customer_nip w wf2_projects) i tak wdrażamy — daje wariantowanie treści (dla firm można pokazać skróconą wersję) i porządek w danych.
- Podgląd admina (`?podglad=admin`) — bramka NIE pokazuje się, `needs_work_consent=false`.

## 3. UX (zasada „okna decyzji = LEKKIE")

Pełnoekranowy, lekki ekran między logowaniem a treścią portalu (wzorzec ekranu `setpw`):

```
Zanim ruszymy z budową

Nie czekamy 14 dni — zaczynamy od razu. Żeby móc ruszyć
przed upływem terminu odstąpienia, potrzebujemy Twojej zgody.

[ ] Żądam rozpoczęcia realizacji usługi przed upływem 14-dniowego
    terminu odstąpienia od umowy i zgadzam się na dostarczanie treści
    cyfrowych (raportów, projektów, materiałów w Portalu) przed upływem
    tego terminu. Przyjmuję do wiadomości, że: (1) w odniesieniu do
    dostarczonych treści cyfrowych tracę prawo odstąpienia z chwilą
    rozpoczęcia ich dostarczania, (2) prawo odstąpienia od umowy utracę
    po pełnym wykonaniu usługi, a jeśli odstąpię wcześniej — zapłacę
    za prace wykonane do chwili odstąpienia (§X Regulaminu).

        [ Zaczynamy — ruszajcie z pracami ]

Co to dla mnie znaczy? (rozwijane)
Bez tej zgody nie możemy rozpocząć prac — Twój projekt czeka,
a Ty w każdej chwili możesz odstąpić od umowy i odzyskać całą wpłatę.
Regulamin → link
```

- Checkbox NIE może być domyślnie zaznaczony.
- Przycisk aktywny dopiero po zaznaczeniu.
- Brak akceptacji = brak przejścia do treści portalu (ale klient widzi uczciwy komunikat, że może odstąpić i odzyskać wpłatę — zgoda jest swobodna, nie wymuszona).

## 4. Plan techniczny

1. **Migracja** `wf2_projects`: `work_consent_at timestamptz`, `work_consent_version text`, `work_consent_text text` (snapshot treści oświadczenia), `customer_nip text`, `customer_company text`.
2. **tpay-webhook** (`index.ts:951-959`): przy tworzeniu projektu kopiować `orders.customer_nip`/`customer_company`. Backfill istniejących projektów po `reservation_order_id`; projekty już prowadzone (prace w toku sprzed wdrożenia) — oznaczyć jako grandfathered (wpisać work_consent_version='pre-regulamin'), żeby bramka nie zablokowała starych klientów.
3. **Edge `wf2-portal`**: w głównym stanie zwracać `needs_work_consent` (true gdy `work_consent_at IS NULL` i nie preview); nowa akcja `work_consent` — wzorzec `set_password` (atomowy UPDATE tylko gdy NULL) + insert `wf2_activities` action `work_consent` + wysyłka maila potwierdzającego (istniejąca infrastruktura mailowa; NIE draft — mail transakcyjny systemowy).
4. **Front `portal.html`**: ekran `consent` w `show()` (:431), wywołanie w `load()` między `buildState` a `show('content')` (:601-603).
5. **Checkout (druga warstwa, pas + szelki)**: dla ofert sklepu przy dopłacie/pełnej płatności checkbox analogiczny do `setupStworzeConsent()` (`checkout/v2/index.html:2735-2768`) → istniejące kolumny `orders.consent_digital_service`/`consented_at`. Przy rezerwacji 100 zł checkbox NIEpotrzebny (opłata w pełni zwrotna — odstąpienie bezprzedmiotowe). Jeśli zgoda padła w checkoucie → portal bramki nie pokazuje (webhook przenosi consented_at do projektu).
6. **Panel admina** (`projekt.html`): badge w Ustawieniach „Zgoda na start: ✓ 21.07 18:32 / ⛔ BRAK — prace wstrzymane"; fabryka nie startuje kroków projektu bez zgody (kontrola w rytuale paczek promptów + widoczny stan).

## 5. Otwarte decyzje Tomka

- Bramka dla wszystkich czy tylko bez NIP? (rekomendacja: wszyscy)
- Treść skrócona dla firm z NIP? (opcjonalnie)
- Mail potwierdzający: z jakiego adresu (ceo@ / system)
