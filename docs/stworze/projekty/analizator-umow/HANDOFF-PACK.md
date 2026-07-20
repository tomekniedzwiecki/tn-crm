# HANDOFF PACK — v1

## 1) Definicja v1

Aplikacja analizuje wzór umowy podwykonawczej o roboty budowlane, porównuje go z Kontraktem Głównym oraz właściwymi przepisami KC/PZP i generuje informacyjno-analityczny raport PDF o ryzykach, obowiązkach i terminach.

## TOŻSAMOŚĆ I DESIGN

- **Nazwa produktu:** „PFP – POLSKIE FORUM PODWYKONAWCÓW / APKA DO UMÓW – ANALIZATOR”
- **Hasło/tagline:** nie ustalono
- **Tożsamość wizualna:**
  - „Interfejs ma być bardzo prosty, czytelny i zorientowany na tabelaryczną prezentację wyników.”
  - „Niezgodności w raporcie mają być oznaczane kolorem czerwonym.”
  - „Status końcowy „UWAGA” ma być oznaczony kolorem czerwonym.”
  - „Czerwony napis „DO DECYZJI” ma pozostać widoczny dla użytkownika w kolumnie „Uwagi” jako element wyniku analizy.”
  - Pozostałe kolory, tokeny i styl: nie ustalono.

## 2) Dla kogo

- Średnie firmy budowlane i wykonawcze działające jako podwykonawcy lub dalsi podwykonawcy przy zamówieniach publicznych.
- Użytkownicy operacyjni: project managerowie i kadra zarządzająca.
- Płatnik: właściciel firmy lub osoba zarządzająca kontraktami.

## 3) Główny workflow v1

1. Użytkownik podaje inwestora i rolę firmy: podwykonawca albo dalszy podwykonawca.
2. Wgrywa pełny PDF projektu umowy podwykonawczej oraz opcjonalnie Kontrakt Główny.
3. System ostrzega o wykrytych danych i automatycznie anonimizuje dokumenty.
4. System odczytuje PDF/skany; przy nieczytelnym fragmencie użytkownik wgrywa lepszy skan lub ręcznie poprawia tekst.
5. System uwzględnia warunki ogólne, szczegółowe i ich wskazaną hierarchię.
6. System analizuje projekt w interesie podwykonawcy względem KG, KC i PZP.
7. Powstaje raport w trzech częściach:
   1. kluczowe warunki,
   2. zgodność z KG/KC/PZP,
   3. obowiązki i terminy.
8. System prezentuje ostrzeżenia, „DO DECYZJI” oraz werdykt końcowy.
9. Użytkownik pobiera raport PDF; korekty OCR są dostępne w osobnym pliku audytowym.

## 4) Role/użytkownicy

- **Project manager** — wgrywanie dokumentów, korekta odczytu, uruchomienie analizy, odczyt raportu.
- **Kadra zarządzająca / właściciel** — ocena ryzyka i decyzja o podpisaniu lub negocjacjach.
- **Uprawniony użytkownik konta firmy** — dostęp wyłącznie do dokumentów i raportów swojej firmy.
- **Serwis** — dostęp wyłącznie za zgodą klienta i tylko do wskazanych przez niego plików.
- Szczegółowe uprawnienia wewnątrz konta: do ustalenia.

## 5) Encje/dane

- Firma i konto klienta.
- Użytkownik i jego uprawnienia.
- Analiza.
- Inwestor.
- Rola analizowanej firmy.
- Projekt umowy podwykonawczej:
  - jeden dokument albo warunki ogólne i szczegółowe,
  - hierarchia pierwszeństwa dokumentów.
- Kontrakt Główny — opcjonalny.
- Odczyt OCR i pełna historia korekt.
- Zanonimizowana kopia dokumentu.
- Baza aktualnych przepisów KC/PZP.
- Warunek kontrolny, paragraf, cytat, podstawa prawna lub kontraktowa.
- Niezgodność, ostrzeżenie i praktyczny opis ryzyka.
- Obowiązek, zdarzenie uruchamiające, termin, liczba dni i skutek niewykonania.
- Raport PDF i osobny plik audytowy korekt.

## 6) Ekrany v1

1. Logowanie/konto klienta — szczegóły do ustalenia.
2. Formularz nowej analizy:
   - inwestor,
   - rola analizowanej firmy,
   - wgranie projektu umowy,
   - wgranie opcjonalnego KG,
   - instrukcja pozyskania KG.
3. Weryfikacja dokumentów:
   - ostrzeżenia o danych,
   - podgląd anonimizacji,
   - jakość OCR,
   - wgranie lepszego skanu,
   - ręczna korekta tekstu.
4. Raport kontrolny:
   - część I — kluczowe warunki,
   - część II — zgodność/porównanie KG/KC/PZP,
   - część III — obowiązki i terminy,
   - ostrzeżenia i werdykt.
5. Pobranie raportu PDF i osobnego pliku audytowego.
6. Historia dokumentów i analiz na koncie klienta — zakres widoku do ustalenia.
7. Zgłoszenie problemu i wybór plików udostępnianych serwisowi.

## 7) Reguły biznesowe i wyjątki

### Zakres analizy

- v1 analizuje wyłącznie umowy o roboty budowlane.
- Podstawowym wejściem jest pusty wzór umowy, bez cen i danych osobowych.
- KG jest głównym wzorcem wymagań dla umów podwykonawczych.
- KC/PZP są dostępne automatycznie; użytkownik ich nie wgrywa.
- Podstawa prawna pojawia się tylko, gdy przepis ma zastosowanie, jako właściwy artykuł z krótkim opisem.
- Brak obowiązkowego elementu: „UWAGA — nie znaleziono”.
- Raport nie pokazuje daty raportu.

### Raport

- Kolejność: I. kluczowe warunki, II. zgodność z KG/KC/PZP, III. obowiązki i terminy.
- Pozycje są uporządkowane według paragrafów projektu umowy.
- Tabela zawiera co najmniej: LP, zapisy/paragraf projektu, zapisy/paragraf KG, opis rozbieżności, przekroczenie warunku, zgodność/niezgodność, wymagane dokumenty i „Uwagi”.
- Paragrafy i cytaty trafiają wyłącznie do kolumn „Zapisy projektu umowy” oraz „Zapisy KG dotyczące Wykonawcy”.
- Ostatnia kolumna ma tytuł „Uwagi” i zawiera wyłącznie „DO DECYZJI”.
- Bezpośrednio pod tabelą porównawczą znajduje się tabela kluczowych terminów odbioru i zwrotu kwot.
- Raport kończy się zastrzeżeniem, że jest materiałem informacyjnym i analitycznym, a nie opinią ani poradą prawną.

### Ocena i kary

- Zapis gorszy niż KG lub niespełniający warunku: „Niezgodny” i czerwone „DO DECYZJI”.
- Każda czerwona niezgodność ustawia werdykt co najmniej „NEGOCJUJ”.
- Przekroczenie łącznego limitu kar: „NEGOCJUJ”.
- Inna podstawa naliczania kary niż w KG: „NEGOCJUJ”.
- Wyższa pojedyncza kara niż odpowiadająca kara w KG: „UWAGA”.
- Kara za opóźnienie:
  - „NEGOCJUJ”, jeśli KG dla tego samego obowiązku przewiduje zwłokę,
  - „UWAGA — ryzyko szersze”,
  - opis ryzyka objęcia opóźnień niezawinionych,
  - „DO DECYZJI” w kolumnie „Uwagi”.
- W v1 nie używać werdyktu „STOP”.

### Terminy i obowiązki

- Dla obowiązku podać paragraf, nazwę/czynność, moment powstania, zdarzenie uruchamiające, termin od–do, liczbę dni i skutek niewykonania.
- Samo „dni” oznacza dni kalendarzowe.
- Początek terminu ustalać z konkretnego zapisu umowy i przepisów prawa.
- Termin przypadający w sobotę lub dzień ustawowo wolny przesunąć na następny dzień roboczy i pokazać ostrzeżenie.
- Przy kilku możliwych zdarzeniach przyjąć najwcześniejszy termin i wskazać podstawę liczenia.
- Wątpliwości dotyczące terminu oznaczać „UWAGA”.
- Dla płatności pokazać wyłącznie: „30 dni od daty wpływu faktury w KSeF”.
- Termin płatności powyżej 30 dni należy flagować.
- Osobne ostrzeżenie, gdy brak dokumentu blokuje termin, odbiór, płatność lub zwrot zabezpieczenia.

### Brak Kontraktu Głównego

- Analiza jest dozwolona.
- Nazwa: „Informacja ograniczona bez KG”.
- Komunikat w nagłówku i na początku części II: „Nie wgrano Kontraktu Głównego — zgodność projektu umowy z jego wymaganiami nie może zostać zweryfikowana.”
- Kolumna KG pozostaje pusta z komunikatem „Nie zweryfikowano — brak KG”.

## 8) Integracje

- Automatyczna baza KC i PZP — źródło oraz aktualizacja: do ustalenia.
- Odczyt PDF i skanów/OCR — dostawca/technologia: do ustalenia.
- Generowanie raportów PDF.
- KSeF występuje jako zdarzenie wpływu faktury; integracja techniczna z KSeF: do ustalenia.
- Kalendarz sobót i dni ustawowo wolnych — źródło: do ustalenia.
- Model AI do analizy dokumentów — dostawca/architektura: do ustalenia; dokumenty nie mogą służyć do trenowania modeli.

## 9) MUST-HAVE v1

- Obsługa podwykonawcy i dalszego podwykonawcy.
- Pełne pliki PDF, w tym skany oraz zestawy warunków ogólnych i szczegółowych.
- OCR, poprawa nieczytelnych fragmentów i historia korekt w osobnym pliku audytowym.
- Automatyczna anonimizacja i ostrzeganie o wykrytych danych.
- Analiza z KG oraz tryb ograniczony bez KG.
- Porównanie z KG, aktualnym KC i PZP.
- Raport PDF w trzech wymaganych częściach.
- Cytaty, paragrafy, podstawy prawne/kontraktowe, opis rozbieżności i ryzyka.
- Tabela obowiązków, zdarzeń uruchamiających i terminów.
- Kontrola co najmniej:
  - zabezpieczenia należytego wykonania,
  - limitów, stawek, katalogu i podstaw kar,
  - zwłoki i opóźnienia,
  - waloryzacji,
  - terminu płatności,
  - gwarancji i rękojmi,
  - odbiorów,
  - płatności częściowych,
  - zwrotu zatrzymań,
  - poufności i tajności,
  - praw autorskich,
  - siły wyższej,
  - korespondencji,
  - akceptacji i podpisania umowy,
  - podpisów elektronicznych, umocowania i pełnomocnictw,
  - odpowiedzialności Zamawiającego za wynagrodzenie i ograniczeń RCO,
  - klauzul pay-when-paid,
  - uzależnienia zwrotu zabezpieczenia od zwrotu zabezpieczenia wykonawcy.
- Automatyczne wykrywanie dodatkowych istotnych warunków.
- Szyfrowanie w transmisji i przechowywaniu, osobne klucze firm, izolowane przetwarzanie.
- Separacja danych firm; brak treści dokumentów w logach i kopiach diagnostycznych.
- Brak użycia dokumentów do trenowania modeli.
- Dostęp serwisowy wyłącznie za zgodą klienta i do wybranych plików.
- Testy zatwierdzone przez eksperta branżowego.
- Zatwierdzone prawnie komunikaty i wyłączenie odpowiedzialności przed uruchomieniem.

## 10) Poza zakresem / na później

- Umowy na dostawy i usługi.
- Gotowe zapisy i aneksy do umowy.
- Pełna opinia prawna od A do Z.
- Rozbudowany system obiegu dokumentów.
- Automatyczne negocjowanie z drugą stroną.
- Werdykt „STOP”.
- Pakiety produktowe i funkcje personalizowane.
- Facebook jako priorytetowy kanał promocji.
- Osobne środowisko dla każdej firmy — decyzja do ustalenia.

## 11) Otwarte decyzje

- Umiejscowienie podstawy prawnej KC/PZP: osobna kolumna, odpowiednie przypadki czy sekcja pod tabelą.
- Ustalanie pierwszeństwa dokumentów bez jasnej klauzuli hierarchii.
- Moment ponownego uruchomienia analizy po korekcie OCR.
- Zakres historii korekt: użytkownik, czas, tekst przed/po, strona.
- Postępowanie przy niejednoznacznym początku terminu.
- Logika wersjonowania prawa, w tym zmiana art. 463 PZP od 12 lipca 2026 r.
- Zachowanie przy braku załączników, danych o akceptacji, RCO lub danych do obliczeń.
- Nazwa Tabeli II: „Zestawienie analiza” czy „Porównanie”.
- Ostateczna treść wyłączenia odpowiedzialności.
- Czy użytkownik zatwierdza zanonimizowaną kopię przed analizą.
- Udział prawnika PZP w walidacji.
- Zachowanie przy niskiej pewności OCR lub oceny ryzyka.
- Ostateczna zasada odbierania serwisowi dostępu.
- Dokładna architektura zabezpieczeń i zakres audytu.
- Model osobnych środowisk klientów i jego koszt.
- Pakiety produktowe oraz zakres wsparcia/konsultacji.

## 12) Ryzyka i luki

- Ryzyko przekształcenia raportu kontrolnego w pełną opinię prawną.
- Brak lub niekompletność KG i załączników ogranicza wiarygodność wyniku.
- Błędy OCR, niejednoznaczne zapisy i rozproszenie postanowień między dokumentami.
- Priorytet „bezbłędnej” analizy może być trudny do zagwarantowania technicznie.
- Niespójne nazewnictwo wyników: „UWAGA”, „DO DECYZJI”, „NEGOCJUJ” i ekranowy „podpisz / negocjuj / stop”.
- Napięcie między wymogiem aktualnego prawa a stanem prawnym wskazanym w KG.
- Brak ustalonego źródła i procesu aktualizacji KC/PZP.
- Poufność dokumentów jest istotną barierą zakupową.
- Deklaracje bezpieczeństwa wymagają pokrycia w architekturze, regulaminie i audycie.
- Nie należy obiecywać „zero wycieków” bez potwierdzenia audytem.
- Brak ustalonych kryteriów akceptacji jakości analizy.
- Spełnienie wymogów bezpieczeństwa oraz przygotowanie testów i dokumentacji jest warunkiem uruchomienia i sprzedaży.