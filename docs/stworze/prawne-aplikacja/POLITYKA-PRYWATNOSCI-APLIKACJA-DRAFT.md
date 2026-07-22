# Polityka Prywatności — serwis „Aplikacja" (lejek /aplikacja)

> **Metryczka**
> - **Status:** DRAFT do weryfikacji Tomka
> - **Data sporządzenia:** 2026-07-21
> - **Wersja:** v1
> - **Zakres:** przetwarzanie danych osób korzystających z lejka `tomekniedzwiecki.pl/aplikacja` (strona, konto, rozmowa z Asystentem AI, rezerwacja, portal klienta). Dokument realizuje obowiązek informacyjny z **art. 13 RODO**.
> - **Spójność:** zgodny z ogólną Polityką Prywatności serwisu (`tomekniedzwiecki.pl/dokumenty/polityka-prywatnosci.html`) — ten sam Administrator, te same kategorie odbiorców. Niniejszy dokument **uszczegóławia** przetwarzanie związane z Rozmową z AI i budową aplikacji; nie zastępuje ogólnej polityki, lecz ją rozwija dla lejka /aplikacja.

---

## Podsumowanie najważniejszych informacji *(charakter informacyjny — wiążąca jest treść dalszych sekcji)*

- Administratorem danych osobowych jest **Tomasz Niedźwiecki (Tomasz Niedźwiecki AI)**. Kontakt w sprawach danych: **ceo@tomekniedzwiecki.pl**.
- Rozmowy prowadzi **system AI** wyraźnie oznaczony w interfejsie — nie człowiek.
- **Nie należy wpisywać do rozmowy danych wrażliwych** (o zdrowiu, poglądach itp.) ani cudzych danych, do których udostępnienia brak jest podstawy. Treść rozmowy jest zapisywana.
- Dane przekazywane są zaufanym dostawcom: hosting i baza, dostawca modelu AI (poza EOG — z zabezpieczeniami), operator płatności, poczta e-mail, hosting strony.
- **Operator płatności jest odrębnym administratorem** własnych danych płatniczych.
- Osobie, której dane dotyczą, przysługuje prawo dostępu, sprostowania, usunięcia, ograniczenia, przenoszenia i sprzeciwu, a także prawo skargi do **PUODO**.
- **Administrator nie podejmuje zautomatyzowanych decyzji** wywołujących wobec osoby, której dane dotyczą, skutki prawne.

---

## 1. Administrator danych

1. Administratorem danych osobowych jest **Tomasz Niedźwiecki**, prowadzący jednoosobową działalność gospodarczą pod firmą **„Tomasz Niedźwiecki AI"**, ul. Grawerska 30L, 51-180 Wrocław, NIP 6972240255, REGON 302211341 (dalej: **Administrator**).
2. We wszystkich sprawach dotyczących przetwarzania danych oraz realizacji praw osoby, której dane dotyczą, właściwy jest kontakt pod adresem e-mail **ceo@tomekniedzwiecki.pl**. Administrator nie wyznaczył Inspektora Ochrony Danych.

---

## 2. Źródła i zakres przetwarzanych danych

Administrator przetwarza dane, które Użytkownik podaje samodzielnie lub które powstają w trakcie korzystania z serwisu /aplikacja:

- przy **zakładaniu konta** (e-mail i hasło albo logowanie kontem Google/Facebook — wtedy dostawca tożsamości przekazuje Administratorowi adres e-mail i podstawowe dane konta),
- w **Rozmowie Projektowej z Asystentem AI** (treść wpisywana przez Użytkownika oraz wygenerowane Materiały Koncepcyjne),
- przy **płatności** za kolejną Rozmowę (49 zł) lub **Opłacie Rezerwacyjnej** (500 zł),
- w **portalu klienta** i w korespondencji (e-mail, ustalenia współpracy),
- automatycznie — **dane techniczne** (adres IP, informacje o przeglądarce i urządzeniu, pliki cookies).

---

## 3. Cele i podstawy prawne przetwarzania

| Cel | Podstawa prawna (RODO) | Uwagi |
|---|---|---|
| Prowadzenie konta i udostępnianie serwisu (strona, portal klienta) | art. 6 ust. 1 lit. b — wykonanie umowy o usługę drogą elektroniczną | |
| **Rozmowa z Asystentem AI** i generowanie Materiałów Koncepcyjnych (rozmowa darmowa i kolejna 49 zł) | art. 6 ust. 1 lit. b — wykonanie umowy o dostarczenie usługi/treści cyfrowej | Treść rozmowy jest zapisywana na koncie Użytkownika |
| Obsługa **rezerwacji współpracy** i przygotowanie planu przedsięwzięcia | art. 6 ust. 1 lit. b | |
| **Płatności** (49 zł, 500 zł) | art. 6 ust. 1 lit. b oraz art. 6 ust. 1 lit. c (obowiązki płatnicze) | Realizowane przez operatora płatności — patrz sekcja 4 |
| **Rachunkowość i podatki** (faktury, dokumentacja) | art. 6 ust. 1 lit. c — obowiązek prawny | |
| **Follow-upy i marketing bezpośredni** własnych usług (np. przypomnienie o rozmowie, kontakt po rezerwacji) | art. 6 ust. 1 lit. f — prawnie uzasadniony interes; a gdy wymaga tego prawo (np. e-mail marketingowy na życzenie) — art. 6 ust. 1 lit. a — zgoda | Sprzeciw / wycofanie zgody w każdej chwili |
| **Dochodzenie lub obrona przed roszczeniami** | art. 6 ust. 1 lit. f | |
| **Bezpieczeństwo, zapobieganie nadużyciom, analiza ruchu** | art. 6 ust. 1 lit. f | |

Podanie danych jest dobrowolne, ale niezbędne do skorzystania z odpowiedniej usługi (np. bez adresu e-mail nie można założyć konta, bez danych do faktury Administrator nie wystawi dokumentu).

---

## 4. Odbiorcy danych (podmioty przetwarzające i odrębni administratorzy)

Administrator korzysta z zaufanych dostawców. Działają oni jako **podmioty przetwarzające** (w imieniu Administratora, na podstawie umów powierzenia — art. 28 RODO), chyba że zaznaczono inaczej:

| Dostawca | Rola / funkcja | Status | Lokalizacja / transfer |
|---|---|---|---|
| **Supabase** | hosting bazy danych, uwierzytelnianie, przechowywanie plików (m.in. treść rozmów, konto) | podmiot przetwarzający | infrastruktura w UE / poza EOG — z zabezpieczeniami (SCC) |
| **Dostawca modelu AI (OpenAI)** | przetwarzanie treści Rozmowy w celu wygenerowania odpowiedzi i Materiałów Koncepcyjnych | podmiot przetwarzający | **USA — transfer poza EOG** na podstawie standardowych klauzul umownych (SCC) i/lub ram Data Privacy Framework |
| **Vercel** | hosting warstwy frontowej (stron serwisu /aplikacja) | podmiot przetwarzający | USA — transfer poza EOG z zabezpieczeniami (SCC) |
| **Resend** | wysyłka e-maili transakcyjnych i powiadomień | podmiot przetwarzający | USA — transfer poza EOG z zabezpieczeniami (SCC) |
| **Krajowy Integrator Płatności S.A. (Tpay)** | obsługa płatności online (BLIK, przelew, karta) | **odrębny administrator** danych płatniczych | Polska / EOG |
| Dostawcy usług księgowych i prawnych, dostawca tożsamości (Google/Facebook przy logowaniu) | księgowość, doradztwo; uwierzytelnienie | podmioty przetwarzające / odrębni administratorzy (dostawcy tożsamości) | wg polityk tych podmiotów |

**Transfery poza EOG.** Część dostawców (dostawca modelu AI, Vercel, Resend) przetwarza dane w USA. Odbywa się to na podstawie mechanizmów zgodnych z rozdziałem V RODO — **standardowych klauzul umownych (SCC)** oraz, jeśli dotyczy, uczestnictwa dostawcy w **Data Privacy Framework** — wraz z niezbędnymi środkami dodatkowymi. Kopię lub informację o zastosowanych zabezpieczeniach Administrator udostępnia na żądanie (ceo@tomekniedzwiecki.pl).

**Operator płatności jako odrębny administrator.** Dane niezbędne do rozliczenia płatności przetwarza operator płatności jako **samodzielny administrator**, na zasadach własnej polityki prywatności. Administrator otrzymuje jedynie potwierdzenie i podstawowe dane transakcji — **nie ma dostępu do pełnych danych karty płatniczej Użytkownika**.

---

## 5. Kategorie danych oraz ostrzeżenie o treści rozmów

Administrator przetwarza w szczególności:

- **dane identyfikacyjne i kontaktowe:** imię, nazwisko, nazwa firmy i NIP (o ile podane), e-mail, telefon, adres,
- **dane konta i logowania,**
- **dane transakcyjne i rozliczeniowe** (historia zamówień, potwierdzenia płatności — bez pełnych danych karty),
- **treść Rozmów z Asystentem AI i Materiały Koncepcyjne** zapisane na koncie Użytkownika,
- **dane techniczne** (adres IP, przeglądarka, urządzenie, cookies).

> **Ostrzeżenie — treść rozmów.** Rozmowa z Asystentem AI dotyczy pomysłu Użytkownika na narzędzie cyfrowe. Należy podawać wyłącznie dane niezbędne do rozmowy. Nie należy wpisywać:
> - **danych szczególnych kategorii** (tzw. wrażliwych — o zdrowiu, pochodzeniu, poglądach politycznych, religijnych, orientacji, danych biometrycznych) — art. 9 RODO,
> - danych osób trzecich (np. klientów, pracowników Użytkownika), do których udostępnienia brak jest podstawy,
> - haseł, pełnych numerów kart oraz tajemnic, które nie mają zostać utrwalone.
>
> Administrator **nie zabiega** o dane wrażliwe i nie przewiduje ich przetwarzania. Jeżeli mimo to zostaną one podane, następuje to z inicjatywy i na odpowiedzialność Użytkownika.

**Administrator nie wykorzystuje treści Rozmów do trenowania własnych modeli AI.**

---

## 6. Okresy przechowywania

| Dane | Okres |
|---|---|
| Konto i przypisane do niego Rozmowy oraz Materiały Koncepcyjne | przez czas posiadania konta; po usunięciu konta — usuwane bez zbędnej zwłoki, z **30-dniowym oknem na eksport** Materiałów (zgodnie z regulaminem) |
| Treść Rozmów z AI | do czasu realizacji celu (obsługa projektu / prowadzenie konta), nie dłużej niż **[DO POTWIERDZENIA — X miesięcy]** od ostatniej aktywności, o ile nie zostaną wcześniej usunięte na żądanie Użytkownika |
| Dane transakcyjne i dokumenty księgowe | **5 lat** od końca roku, w którym powstał obowiązek podatkowy (obowiązek ustawowy) |
| Dane na potrzeby roszczeń | do upływu przedawnienia (co do zasady **6 lat**) |
| Dane przetwarzane na podstawie zgody / uzasadnionego interesu (marketing, follow-upy) | do wycofania zgody albo skutecznego sprzeciwu |

Po upływie okresu dane są usuwane lub anonimizowane.

---

## 7. Prawa osoby, której dane dotyczą

Osobie, której dane dotyczą, przysługuje prawo do: **dostępu** do danych, **sprostowania**, **usunięcia** („bycia zapomnianym"), **ograniczenia przetwarzania**, **przenoszenia danych**, **sprzeciwu** wobec przetwarzania opartego na uzasadnionym interesie (w tym marketingu bezpośredniego), a także **wycofania zgody** w każdej chwili (bez wpływu na zgodność z prawem przetwarzania sprzed wycofania).

W celu skorzystania z praw należy napisać na **ceo@tomekniedzwiecki.pl**.

Przysługuje również prawo wniesienia skargi do organu nadzorczego — **Prezesa Urzędu Ochrony Danych Osobowych (PUODO)**, ul. Stawki 2, 00-193 Warszawa.

---

## 8. Zautomatyzowane decyzje i profilowanie

Dane **nie służą do zautomatyzowanego podejmowania decyzji** (w tym profilowania) wywołujących wobec osoby, której dane dotyczą, **skutki prawne** lub w podobny sposób istotnie na nią wpływających. Asystent AI generuje materiały poglądowe i propozycje — **nie podejmuje wiążących decyzji** w sprawie Użytkownika.

---

## 9. Informacja o sztucznej inteligencji (art. 50 AI Act)

Rozmowy w serwisie prowadzi **system sztucznej inteligencji (Asystent AI)** działający w imieniu Administratora, **wyraźnie oznaczony w interfejsie** — tak, aby Użytkownik wiedział, że rozmawia z systemem AI, a nie z człowiekiem. Obowiązek ten wynika z **art. 50 rozporządzenia (UE) 2024/1689 (AI Act)**, stosowanego od 2 sierpnia 2026 r. Materiały generowane z udziałem AI mają charakter poglądowy i mogą zawierać błędy — decyzje Użytkownik podejmuje samodzielnie.

---

## 10. Pliki cookies

Serwis wykorzystuje pliki cookies (niezbędne, funkcjonalne, analityczne, a jeśli dotyczy — marketingowe). Ustawienia cookies można zmienić w przeglądarce. Szczegóły — jak w ogólnej polityce cookies serwisu.

---

## 11. Zmiany polityki

Administrator może aktualizować Politykę (np. przy zmianie przepisów lub dostawców). Aktualna wersja jest publikowana na stronie i obowiązuje od wskazanej daty.

---

## NOTATKI ROBOCZE (do usunięcia przed publikacją)

Lista założeń wymagających decyzji/weryfikacji Tomka:

1. **[DO POTWIERDZENIA] Retencja treści Rozmów z AI (sekcja 6).** Wpisałem „X miesięcy od ostatniej aktywności" jako placeholder. Trzeba ustalić konkretny okres (np. 12 albo 24 mies.) i zsynchronizować z faktycznym mechanizmem czyszczenia w bazie (spar_sessions / konto). Regulamin przewiduje 30-dniowe okno na eksport po usunięciu konta — to zachowałem.
2. **Adres kontaktowy RODO = `ceo@tomekniedzwiecki.pl` (rozjazd rozwiązany 22.07).** Użyłem **ceo@tomekniedzwiecki.pl** — zgodnie z ogólną Polityką Prywatności serwisu. Wcześniejszy rozjazd (regulamin lejka /aplikacja używał `biuro@` do reklamacji/odstąpień) został usunięty — regulamin ujednolicono na `ceo@`, więc oba dokumenty są teraz spójne. **[DO POTWIERDZENIA — TOMEK: docelowy adres kontaktowy; jeśli wolisz `biuro@`, trzeba tę skrzynkę utworzyć.]**
3. **[DO POTWIERDZENIA] Dostawca modelu AI = OpenAI.** Wpisałem OpenAI (USA, SCC/DPF) — zgodnie z zadaniem i architekturą sparingu. Jeśli lejek używa też innych modeli (np. Kimi/Moonshot — pamięć wspomina „Kimi = silnik prawny" dla Sygno; dla /aplikacja to inny produkt), listę trzeba rozszerzyć i wskazać właściwe transfery (Chiny ≠ decyzja o adekwatności — wymaga SCC + oceny). Zweryfikuj, jaki model faktycznie obsługuje Asystenta AI w lejku /aplikacja.
4. **[DO POTWIERDZENIA] Logowanie kontem Google/Facebook.** Regulamin wymienia Google; notatki regulaminu wspominają też Facebooka i wymóg telefonu w bramce lejka. Ujawniłem Google i Facebook jako dostawców tożsamości (odrębni administratorzy). Potwierdź, które metody logowania są aktywne oraz czy telefon jest zbierany (jeśli tak — dopisać do kategorii danych).
5. **[DO POTWIERDZENIA] Transfery poza EOG a ogólna polityka serwisu.** Ogólna Polityka Prywatności serwisu deklaruje, że „dane nie są przekazywane do państw trzecich, chyba że jest to niezbędne... na podstawie zabezpieczeń RODO". Niniejszy dokument jest z nią spójny, ale **bardziej szczegółowy** (wprost wskazuje USA i dostawcę AI). Rozważ ujednolicenie: albo dopisać do ogólnej polityki wzmiankę o dostawcy AI, albo wskazać, że dla lejka /aplikacja obowiązuje ta uszczegółowiona polityka.
6. **[DO POTWIERDZENIA] Analityka/marketing cookies.** Sekcję cookies zostawiłem skrótowo (odsyła do ogólnej polityki). Jeśli lejek /aplikacja używa Meta Pixel / Google Ads (pamięć: pomiar lejka), trzeba to ujawnić i oprzeć na zgodzie cookies.
7. **Data.** Ustawiłem 2026-07-21 (spójnie z pozostałymi draftami w folderze). Przed publikacją ustawić datę wejścia w życie.

**Rewizja 3 (22.07): ujednolicono rejestr językowy na prawniczy (decyzja Tomka) — bez zmian merytorycznych.**
