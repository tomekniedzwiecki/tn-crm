# HANDOFF PACK — v1

## 1) Definicja v1

Aplikacja dla jednego miasta, która pozwala klientom bezpłatnie publikować drobne lokalne prace domowe, a opłacającym abonament fachowcom odpowiadać ofertą, uzgadniać realizację i rozliczać reputację po zakończeniu zlecenia.

## 2) Dla kogo

- **Klienci prywatni** — osoby bez czasu, sprzętu, wiedzy lub chęci do samodzielnego wykonania naprawy.
- **Wykonawcy indywidualni** — zawodowi fachowcy i osoby dorabiające z praktycznymi umiejętnościami.
- **Firmy usługowe** — właściciele oraz powiązani pracownicy.
- Główne specjalizacje: hydraulika, elektryka, złota rączka, malowanie, montaż, drobne prace ślusarskie i budowlane.
- Typowe zlecenie trwa od kilku godzin do około 2 dni.

## 3) Główny workflow v1

1. Klient zakłada konto i podaje imię oraz lokalizację: województwo, powiat, miasto/dzielnicę.
2. Dodaje bezpłatne zlecenie: zdjęcia, opis, kategorię, lokalizację, termin i opcjonalną potrzebę faktury/rachunku.
3. Fachowcy z właściwego obszaru widzą zlecenie; bez abonamentu otrzymują tylko skrócony podgląd.
4. Fachowiec może zadać pytania, a następnie złożyć ofertę: widełki ceny, termin, wiadomość, możliwość faktury/rachunku albo propozycję oględzin.
5. Klient porównuje oferty i wybiera wykonawcę; pozostałe oferty są zamykane jako „wybrano innego wykonawcę”.
6. Po wyborze ujawniany jest numer telefonu; dokładny adres klient przekazuje wybranemu fachowcowi bezpośrednio.
7. Strony ustalają szczegóły w komunikatorze. Aplikacja tworzy podsumowanie rozmowy, które zatwierdzają obie strony.
8. Fachowiec akceptuje zlecenie, klient potwierdza ustalenia, a ogłoszenie zostaje zablokowane dla innych.
9. Fachowiec oznacza pracę jako zakończoną; klient potwierdza albo odrzuca zakończenie z powodem i opcjonalnym zdjęciem.
10. Po zamknięciu strony mogą wystawić sobie oceny i komentarze.

## 4) Role/użytkownicy

- **Klient** — publikuje zlecenia, odpowiada na pytania, wybiera ofertę, zatwierdza ustalenia i zakończenie, ocenia wykonawcę.
- **Fachowiec indywidualny** — wybiera obszar działania, przegląda zlecenia, pyta, ofertuje, realizuje i ocenia klienta.
- **Właściciel firmy** — pełna administracja kontem, pracownikami, abonamentem i przydzielaniem zleceń.
- **Pracownik firmy** — odpowiada samodzielnie albo realizuje zlecenia przydzielone przez właściciela.
- **Administrator/operator** — ręczne rozpatrywanie sporów, drugich odrzuceń zakończenia, nieobecności i zgłoszeń nadużyć.

## 5) Encje/dane

- **Użytkownik:** imię, telefon, e-mail, sposób logowania, rola, oceny, liczba realizacji, wskaźnik rzetelności.
- **Profil klienta:** województwo, powiat, miasto/dzielnica, historia zleceń i rezygnacji.
- **Profil fachowca:** zdjęcie, specjalizacje, obszar działania, typ: firma/osoba prywatna, faktura/rachunek, oceny i komentarze.
- **Firma i pracownicy:** właściciel, profile pracowników, tryb przydzielania zleceń, wymagane uprawnienia.
- **Zlecenie:** opis, zdjęcia, kategoria, lokalizacja ogólna, dokładny adres, wariant terminu, status, potrzeba faktury/rachunku.
- **Oferta:** fachowiec, widełki ceny, termin, wiadomość, faktura/rachunek, propozycja oględzin, status.
- **Rozmowa:** tekst, zdjęcia, dokumenty, wiadomości głosowe i transkrypcje.
- **Podsumowanie ustaleń:** wygenerowana treść, poprawki, akceptacje stron.
- **Ocena/komentarz:** autor, odbiorca, 1–5 gwiazdek, komentarz, powiązane zakończone zlecenie.
- **Spór/zgłoszenie:** typ, opis, opcjonalny dowód lub zdjęcie, odpowiedź drugiej strony, decyzja operatora.
- **Abonament:** plan, okres, 2 powiaty, dodatki, pracownicy, odnowienie i status płatności.
- **Powiadomienie:** zdarzenie, kanał, status, ustawienia dni i godzin.

## 6) Ekrany v1

1. Rejestracja i logowanie: telefon + SMS oraz e-mail + hasło.
2. Prosty panel klienta dostosowany również do seniorów.
3. Formularz dodania zlecenia z przykładami kategorii.
4. Lista i szczegóły własnych zleceń klienta.
5. Lista lokalnych zleceń fachowca z odległością i terminem.
6. Szczegóły zlecenia, pytania oraz formularz oferty/oględzin.
7. Lista ofert dla klienta z ostrzeżeniem o braku faktury/rachunku.
8. Komunikator i podsumowanie ustaleń.
9. Widok aktywnej realizacji, zakończenia i odrzucenia zakończenia.
10. Ocena klienta i fachowca.
11. Profile klienta i fachowca.
12. Ustawienia obszaru działania i powiadomień.
13. Zakup i zarządzanie abonamentem oraz dodatkowymi powiatami.
14. Panel firmy i pracowników.
15. Panel ręcznej obsługi sporów i zgłoszeń.

## 7) Reguły biznesowe i wyjątki

- Klient publikuje zlecenia bezpłatnie.
- Cennik brutto:
  - samodzielny fachowiec: **99 zł/mies.**,
  - firma: **149 zł/mies.**,
  - kolejny pracownik: **39 zł/mies.**,
  - dodatkowy powiat: **19 zł/mies.**.
- Brak okresu próbnego. Plan roczny kosztuje równowartość 10 miesięcy; rabat dotyczy tylko głównego abonamentu.
- Podstawowy abonament obejmuje 2 powiaty. Zmiana powiatów jest możliwa przy rozpoczęciu okresu rozliczeniowego.
- Dodatkowy powiat aktywuje się natychmiast, z proporcjonalną opłatą; odnawia się automatycznie.
- Po wygaśnięciu abonamentu fachowiec przechodzi na bezpłatny, skrócony podgląd zleceń.
- Termin klient określa jako: „jak najszybciej”, konkretny dzień albo elastyczny.
- Oferty fachowców są domyślnie publiczne. Klient wybiera widoczność każdej odpowiedzi na pytanie.
- Wyświetlane jest wyłącznie imię użytkownika.
- Przed ofertą fachowiec widzi imię klienta, średnią ocen i liczbę zakończonych zleceń.
- Dokładny adres i numer telefonu nie są ujawniane przed wyborem wykonawcy.
- Po wyborze wykonawcy pozostałe oferty są zamykane.
- Wybór wykonawcy bez faktury/rachunku, mimo zaznaczonej potrzeby dokumentu, wymaga dodatkowego potwierdzenia.
- Każda poprawka podsumowania ustaleń wymaga akceptacji; zakres akceptacji stron — **do ustalenia**.
- Po zatwierdzeniu ustaleń zlecenia nie można edytować.
- Zakup i rozliczenie materiałów strony ustalają poza narzuconym mechanizmem aplikacji.
- Po odrzuceniu zakończenia zlecenie wraca do realizacji. Drugie odrzucenie trafia do ręcznej obsługi.
- Zlecenie zamyka się automatycznie po 4 dniach braku reakcji klienta; moment rozpoczęcia odliczania — **do ustalenia**.
- Przy rezygnacji wybranego fachowca klient może przywrócić wcześniejsze oferty po ponownym potwierdzeniu dostępności wykonawców.
- Nieuzasadnione rezygnacje fachowca obniżają pozycję kolejnych ofert.
- Usprawiedliwione powody: zmiana zakresu przez klienta, niebezpieczne warunki, nagła choroba lub awaria.
- Ostrzeżenie o kliencie pojawia się po 3 nieuzasadnionych rezygnacjach i znika po 3 prawidłowych realizacjach.
- Wskaźnik fachowca wraca do neutralnego poziomu po 3 prawidłowych realizacjach.
- Nieobecność przy terminie zapisanym w aplikacji wymaga zgłoszenia, odpowiedzi drugiej strony i ręcznej weryfikacji przed oceną.
- Prace ryzykowne mogą wykonywać wyłącznie osoby z odpowiednimi, aktualnymi uprawnieniami.
- Przy zmianie pracownika firmy wystarczy powiadomić klienta. Brak uprawnionego zastępcy oznacza rezygnację firmy.
- Wszystkie kanały powiadomień są domyślnie aktywne; użytkownik wybiera kanały, a fachowiec także dni i godziny.
- SMS jest wysyłany tylko dla pilnej wiadomości w aktywnym zleceniu: maksymalnie 2 SMS-y na stronę w ciągu 24 godzin.
- Potwierdzone nadużycie pilnych SMS-ów powoduje blokadę nadawcy na 2 dni.

## 8) Integracje

- SMS: kody logowania oraz pilne wiadomości — dostawca **do ustalenia**.
- E-mail: logowanie/powiadomienia — dostawca **do ustalenia**.
- Płatności cykliczne za abonamenty i dodatki — dostawca **do ustalenia**.
- Lokalizacja, odległość, miasta, dzielnice i powiaty — źródło danych/mapy **do ustalenia**.
- Przechowywanie zdjęć, dokumentów i nagrań — dostawca **do ustalenia**.
- Automatyczna transkrypcja wiadomości głosowych — dostawca **do ustalenia**.
- Automatyczne tworzenie podsumowania rozmowy — mechanizm/dostawca **do ustalenia**.

## 9) MUST-HAVE v1

- Konto klienta, fachowca, firmy i pracownika.
- Logowanie telefonem/SMS oraz e-mailem/hasłem.
- Publikacja bezpłatnego zlecenia ze zdjęciami, kategorią, lokalizacją i terminem.
- Kategorie drobnych prac, „Inna praca” oraz rozróżnienie drobnej pracy od dużego remontu.
- Lista lokalnych zleceń dopasowana do obszaru fachowca.
- Pytania przed ofertą i kontrola widoczności odpowiedzi klienta.
- Oferty z widełkami ceny, terminem, wiadomością, fakturą/rachunkiem lub oględzinami.
- Wybór wykonawcy i ochrona numeru telefonu oraz dokładnego adresu.
- Komunikator: tekst, zdjęcia, głos, dokumenty; transkrypcja z możliwością edycji i etykietą „edytowano”.
- Podsumowanie ustaleń i akceptacja obu stron.
- Statusy realizacji, zakończenie, odrzucenie i automatyczne zamknięcie.
- Dwustronne oceny, komentarze, rezygnacje, wskaźnik rzetelności i ręczne spory.
- Powiadomienia w aplikacji, e-mail i SMS wraz z ustawieniami.
- Abonamenty, płatności cykliczne, 2 powiaty i płatne rozszerzenia.
- Panel firmy, pracownicy i dwa tryby obsługi zleceń.
- Kontrola aktualności uprawnień przy pracach ryzykownych.

## 10) Poza zakresem / na później

- Płatności za wykonaną usługę w aplikacji.
- Rozbudowany kalendarz i rezerwacja terminów.
- Automatyczne dobieranie fachowca.
- Rozbudowany katalog usług.
- Osobny abonament dla klientów.
- Większe remonty pomieszczeń trwające kilka dni.
- Rozbudowana weryfikacja dokumentów i uprawnień — poza zakresem według Karty Projektu, ale koliduje z wymaganiami prac ryzykownych.
- Automatyczne przenoszenie historii i ocen pracownika na konto indywidualne.

## 11) Otwarte decyzje

- Dokładny model obszaru dojazdu i wpływ miast/dzielnic na widoczność oraz powiadomienia.
- Opcje i domyślna widoczność odpowiedzi klienta.
- Lista prac ryzykownych oraz wymaganych prawem uprawnień.
- Procedura weryfikacji uprawnień i ślusarzy.
- Czy v1 obejmuje awaryjne otwieranie mieszkań i samochodów.
- Zakres obsługi „dużych prac” i sposób ich ofertowania.
- Zasady poprawiania oraz akceptowania podsumowania ustaleń.
- Moment rozpoczęcia 4-dniowego automatycznego zamknięcia.
- Procedura ręcznej weryfikacji niepojawienia się i sporów.
- Sposób prezentacji statusu firmy/osoby prywatnej.
- Algorytm obniżania pozycji ofert po rezygnacjach.
- Zasady przenoszenia opłaconych dodatków.
- Czy rabat/cennik firm wymaga dalszych wariantów.
- Obsługa nagłych zdarzeń jako wyjątku od reguł.

## 12) Ryzyka i luki

- Za mała liczba zleceń w mieście może zniechęcić fachowców do abonamentu.
- Konieczność równoległego pozyskania klientów i wykonawców; start powinien objąć jedno miasto.
- Ryzyko fałszywych ocen, rezygnacji, nieobecności i nadużyć SMS wymaga ręcznej moderacji.
- Nie każdą pracę można wycenić ze zdjęcia; konieczne są widełki lub oględziny.
- Sprzeczność zakresowa: Karta wyłącza weryfikację dokumentów, ale wymagania nakazują kontrolę uprawnień przy pracach ryzykownych.
- Nieustalone wymogi prawne dla elektryków i awaryjnego otwierania.
- Automatyczna transkrypcja i podsumowanie rozmowy mogą zawierać błędy wpływające na ustalenia.
- Nieustalony model danych lokalizacyjnych i obliczania odległości.
- Brak wskazanych dostawców płatności, SMS, e-mail, map, plików i automatyzacji.
- Panel firmy, abonamenty, spory i weryfikacja uprawnień znacząco zwiększają zakres pierwszej wersji.