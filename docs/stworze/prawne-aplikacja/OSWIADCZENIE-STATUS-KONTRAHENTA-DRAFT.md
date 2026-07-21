# Oświadczenie o statusie kontrahenta (do Umowy Budowy)

> **Metryczka**
> - **Status:** DRAFT do weryfikacji Tomka
> - **Data sporządzenia:** 2026-07-21
> - **Wersja:** v1
> - **Przeznaczenie:** dokument jednostronicowy podpisywany **razem z Umową o wykonanie i wdrożenie aplikacji** (Umową Budowy) — najlepiej tym samym podpisem (QES) lub na papierze, w tej samej dacie. Ustala, czy Partner jest Konsumentem, PNPK, Przedsiębiorcą zawodowym czy spółką — od czego zależy zakres ochrony konsumenckiej (odstąpienie, rękojmia/zgodność, brak kar umownych).
> - **Podstawy:** art. 22¹ k.c. (Konsument), art. 7aa ustawy o prawach konsumenta oraz art. 385⁵, 556⁴, 556⁵, 558 § 1 k.c. (PNPK).

---

## OŚWIADCZENIE O STATUSIE KONTRAHENTA

**Do umowy:** „Umowa o wykonanie i wdrożenie aplikacji {{NAZWA_APLIKACJI_ROBOCZA}}" z dnia {{DATA}}

**Wykonawca (Tomek):** Tomasz Niedźwiecki, „Tomasz Niedźwiecki AI", ul. Grawerska 30L, 51-180 Wrocław, NIP 6972240255.

**Składający oświadczenie (Partner / Zamawiający):**

- Imię i nazwisko: ....................................................................................................
- Firma (jeśli dotyczy): ..............................................................................................
- Adres: .....................................................................................................................
- E-mail: ....................................................................................................................
- NIP (jeśli dotyczy): .......................................  · PKD przeważającej działalności (jeśli dotyczy): .......................................

---

### 1. Oświadczam, że zawieram Umowę Budowy jako (zaznacz jedną opcję):

☐ **A. Konsument** — jestem osobą fizyczną, a umowa **nie jest bezpośrednio związana** z moją działalnością gospodarczą lub zawodową (art. 22¹ k.c.). *(Nie prowadzę działalności albo prowadzę ją, ale ta umowa jej nie dotyczy — kupuję „prywatnie".)*

☐ **B. Osoba fizyczna prowadząca działalność gospodarczą — umowa bez charakteru zawodowego (PNPK)** — prowadzę jednoosobową działalność gospodarczą, umowa jest z nią związana, **ale nie ma dla mnie charakteru zawodowego**, co wynika w szczególności z przedmiotu wykonywanej przeze mnie działalności ujawnionego w CEIDG (kody PKD) (art. 7aa ustawy o prawach konsumenta; art. 385⁵ k.c.). *(Np. prowadzę firmę w innej branży niż tworzenie oprogramowania — aplikacja to dla mnie nowe, nie moja codzienna specjalność.)*
  - Krótko, dlaczego umowa nie ma charakteru zawodowego (np. „moje PKD to gastronomia, nie IT"): ....................................................................................................

☐ **C. Przedsiębiorca — umowa o charakterze zawodowym** — zawieram umowę w związku z prowadzoną działalnością gospodarczą i ma ona dla mnie **charakter zawodowy** (np. działam w branży IT/oprogramowania/e-commerce). *(Nie przysługuje mi ochrona konsumencka.)*

☐ **D. Spółka / inna osoba prawna lub jednostka organizacyjna** — zawieram umowę w imieniu podmiotu (sp. z o.o., S.A., sp.k. itd.). *(Nie przysługuje ochrona konsumencka.)*
  - Nazwa podmiotu, KRS, osoba reprezentująca i podstawa reprezentacji: ....................................................................................................

---

### 2. Co oznacza wybrany status (pouczenie)

- **Konsument (A) oraz PNPK (B)** korzystają z ochrony konsumenckiej: **prawo odstąpienia od umowy zawartej na odległość w terminie 14 dni** (z zastrzeżeniem zasad rozpoczęcia świadczenia na żądanie — § 14 i Załącznik 3 umowy), ustawowa **zgodność usługi/treści cyfrowej** (rozdz. 5b ustawy o prawach konsumenta), **brak wobec nich kar umownych** oraz ograniczeń odpowiedzialności niedopuszczalnych wobec konsumenta. Właściwość sądu i prawo — wg przepisów bezwzględnie obowiązujących.
- **Przedsiębiorca zawodowy (C) i spółka (D)** **nie korzystają** z ochrony konsumenckiej: nie przysługuje prawo odstąpienia w trybie konsumenckim, dopuszczalne są kary umowne i umowne ograniczenia odpowiedzialności, a sądem właściwym jest sąd siedziby Wykonawcy (§ 16 umowy).

> Różnica między B (PNPK) a C dotyczy **charakteru zawodowego** umowy: decyduje, czy budowa aplikacji wpisuje się w przedmiot Twojej działalności. Jeśli masz wątpliwość — opisz swoją sytuację, a status ustalimy wspólnie zgodnie z prawdą.

---

### 3. Oświadczenia dodatkowe

1. Oświadczam, że **powyższe dane i wybór statusu są prawdziwe i aktualne** na dzień zawarcia Umowy Budowy.
2. Przyjmuję do wiadomości, że **status ocenia się według stanu z chwili zawarcia umowy** i według celu, w jakim ją zawieram; późniejsza zmiana okoliczności nie zmienia statusu dla tej umowy.
3. Zobowiązuję się niezwłocznie poinformować Wykonawcę, gdyby przed podpisaniem umowy którakolwiek z powyższych informacji uległa zmianie.

---

**Data i miejsce:** .......................................

**Podpis Partnera (Zamawiającego):** .......................................

*(dokument podpisywany wraz z Umową Budowy — QES albo własnoręcznie; patrz „Przewodnik: jak podpisać Umowę Budowy QES")*

---

## NOTATKI ROBOCZE (do usunięcia przed wysyłką klientowi)

1. **[DO POTWIERDZENIA] Pole PKD i uzasadnienie PNPK.** Dodałem pole PKD oraz krótkie uzasadnienie „dlaczego bez charakteru zawodowego" dla opcji B. To realnie wzmacnia kwalifikację PNPK (organy patrzą na PKD + treść umowy). Potwierdź, czy zostawiamy pola opisowe, czy upraszczamy do samego checkboxa.
2. **[DO POTWIERDZENIA] Brak PESEL.** Świadomie **nie** dodałem pola PESEL (spójnie z notatką v4 umowy — system `contract_fields` nie ma pola PESEL, identyfikacja Konsumenta bez NIP opiera się na imieniu/nazwisku + adresie + e-mailu). Jeśli dla Konsumenta bez NIP chcesz PESEL — trzeba dodać pole i do umowy, i tutaj.
3. **[DO POTWIERDZENIA] Forma podpisu oświadczenia.** Założyłem, że oświadczenie idzie **w tym samym pliku/paczce** co umowa i tym samym podpisem. Samo oświadczenie o statusie **nie** przenosi praw, więc teoretycznie nie wymaga QES — ale dla porządku dowodowego lepiej podpisać je razem z umową. Potwierdź.
4. **Spójność definicji.** Definicje Konsument/PNPK/Przedsiębiorca są przepisane 1:1 z § 2 Umowy Budowy i § 2 Regulaminu — jeśli tam się zmienią, zmienić i tu.
