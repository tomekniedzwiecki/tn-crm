# HANDOFF PACK — osobisty trener rozmów biznesowych

> Kopia robocza z `spar_knowhow_summary.handoff_pack` (sesja 6f077f02-5abe-4c55-a0d4-0edddf4d6897,
> klient: Tomek Jankowiak, spowiednik zamknięty 2026-07-11). Źródło prawdy = baza; ta kopia służy
> pracy nad Etapem 1 i trafi do `brief/zrodla/` w repo aplikacji.

## 1) Definicja v1
Aplikacja przygotowuje użytkownika do konkretnej rozmowy z klientem poprzez research, interaktywny plan, ocenę gotowości, symulację z AI i raport skuteczności.

## 2) Dla kogo
- Nieśmiali specjaliści.
- Młodzi menedżerowie.
- Osoby prowadzące JDG.
- Konsultanci i osoby budujące relacje biznesowe.
- Pracownicy firm prowadzący rozmowy z klientami.
- Płatnik: użytkownik indywidualny (roboczo 79 zł/mies.) albo firma kupująca dostęp pracownikom.

## 3) Główny workflow v1
1. Użytkownik tworzy przygotowanie do konkretnego spotkania.
2. Określa cel, oczekiwany następny krok i opcjonalny Plan B.
3. Podaje dane firmy i rozmówcy; aplikacja wyszukuje dostępne informacje publiczne.
4. AI analizuje firmę, ofertę, strategię, rynek i profil rozmówcy.
5. Informacje otrzymują etykiety: „potwierdzone", „wniosek AI" albo „do sprawdzenia".
6. Użytkownik zatwierdza fakty lub wybiera „Nie wiem — zapytaj klienta".
7. Aplikacja generuje roboczy plan rozmowy, podpowiedzi oraz ocenę gotowości z listą braków.
8. Użytkownik przegląda plan, oznacza elementy i kopiuje wybrane treści.
9. Uruchamia trening lub egzamin z AI odgrywającym rozmówcę.
10. Użytkownik podejmuje próbę domknięcia konkretnego rezultatu.
11. AI ocenia rozmowę i generuje raport.
12. Po nieudanym domknięciu użytkownik otrzymuje wskazówkę i jednokrotnie powtarza końcówkę.
13. Ocena i wnioski trafiają do historii.

## 4) Role/użytkownicy
- **Użytkownik indywidualny/pracownik** — przygotowuje spotkania, zatwierdza research, ćwiczy i przegląda historię.
- **Kupujący firmowy/administrator** — zakres funkcji i uprawnień do ustalenia.
- **AI trener** — prowadzi research, generuje plan, odgrywa klienta, ocenia i przekazuje wskazówki.

## 5) Encje/dane
- Użytkownik.
- Firma klienta: oferta, strategia, sytuacja, rynek, strona, e-commerce.
- Rozmówca: profil, rola, odpowiedzialność, cele i KPI.
- Spotkanie: termin, kontekst, cel, oczekiwany następny krok, opcjonalny Plan B.
- Research: źródło, treść, status informacji, zatwierdzenie użytkownika.
- Plan rozmowy: pytania, argumenty, korzyści biznesowe, obiekcje, podpowiedzi, elementy do ustalenia.
- Interakcje z planem: przeczytane, najważniejsze, ulubione, skopiowane.
- Ocena gotowości.
- Symulacja: tryb, poziom trudności, scenariusz i próby domknięcia.
- Raport: wynik, oceny cząstkowe, wnioski, krótkie cytaty, porównanie prób.
- Historia przygotowanych rozmów.
- Transkrypcja/nagranie — tylko opcjonalnie, po świadomym włączeniu.

## 6) Ekrany v1
1. **Pulpit** — najbliższe wydarzenie, pozostały czas przygotowania, poziom gotowości, ocena ostatniej rozmowy.
2. **Nowe przygotowanie / formularz spotkania** — firma, rozmówca, cel, następny krok, Plan B.
3. **Research i zatwierdzanie faktów** — źródła, etykiety informacji, braki, opcja „Nie wiem — zapytaj klienta".
4. **Generator i interaktywny plan rozmowy** — wersja robocza, podpowiedzi, cytaty/riposty, obiekcje, oznaczanie i kopiowanie.
5. **Ocena gotowości** — wynik procentowy i działania potrzebne do poprawy.
6. **Trening/egzamin z AI** — rozmowa, poziom trudności, informacja o trybie neutralnego klienta.
7. **Raport** — wynik 1–10, kryteria, cytaty, wnioski i porównanie prób domknięcia.
8. **Historia przygotowanych rozmów** — zapisane oceny i wnioski; opcjonalne treści rozmowy.

## 7) Reguły biznesowe i wyjątki
- Wskaźnik oznacza **gotowość do rozmowy**, nie szansę jej powodzenia.
- Gotowość procentowo: 40% podstawy (firma, rozmówca, cel) · 30% wiedza pogłębiona (problem/hipoteza, wartość biznesowa, obiekcje) · 30% ukończony trening.
- Kryteria obowiązkowe: cel, podstawowa wiedza o firmie, rola rozmówcy i oczekiwany następny krok.
- Następny krok określa: co ma się wydarzyć, kto odpowiada i do kiedy.
- Plan koncentruje się na problemie i wartości biznesowej, nie prezentacji technologii.
- Użytkownik musi zatwierdzić fakty przed wygenerowaniem planu.
- Niepewna informacja może zostać zamieniona w ważne pytanie do klienta.
- Przy niewystarczających danych AI przechodzi do trybu neutralnego i wyraźnie o tym informuje.
- Symulacji nie można zakończyć bez próby domknięcia głównego rezultatu.
- Mniejszy, konkretny krok zamiast celu głównego = częściowy sukces.
- Wynik egzaminu 1–10: 40% realizacja celu · 25% trafność pytań · 20% reakcje na obiekcje · 15% pewność i naturalność.
- Długość wypowiedzi oceniana wyłącznie pomocniczo i kontekstowo.
- Ocena spada za przerywanie, pośpiech, wyuczone formułki, nadmierne tłumaczenie się i odpowiadanie bez zrozumienia.
- Po nieudanym domknięciu: wskazówka + jedna powtórka końcówki.
- Powtórka nie zmienia wyniku egzaminu; raport pokazuje obie próby obok siebie.
- Domyślnie zapisywane są tylko ocena i wnioski.
- Nagranie i transkrypcja wymagają świadomego włączenia; zasady zachowania do ustalenia.
- Zapisywane dane wrażliwe muszą być automatycznie anonimizowane.

## 8) Integracje
- Model AI do researchu, generowania planu, symulacji i oceny.
- Publiczne źródła: strona firmy, oferta/e-commerce, LinkedIn, social media, publikacje branżowe.
- CRM — systemy i zakres integracji do ustalenia.
- Dane z kontaktów osobistych — sposób wprowadzania do ustalenia.
- Źródło danych o terminie najbliższego wydarzenia — do ustalenia.

## 9) MUST-HAVE v1
- Przygotowanie konkretnej rozmowy z klientem.
- Automatyczny research publicznych informacji.
- Ręczne uzupełnianie i zatwierdzanie faktów.
- Etykiety wiarygodności każdej informacji.
- Cel spotkania i konkretny następny krok.
- Roboczy, interaktywny plan rozmowy.
- Pytania, argumenty korzyści biznesowych, obiekcje i podpowiedzi reakcji.
- Procentowa ocena gotowości z listą braków.
- Trening i egzamin z AI.
- Tryb konkretnego rozmówcy oraz neutralnego klienta.
- Automatyczny i ręcznie zmieniany poziom trudności.
- Obowiązkowa próba domknięcia.
- Raport z oceną 1–10, cytatami i wnioskami.
- Jedna poprawkowa próba domknięcia i porównanie obu prób.
- Historia ocen i przygotowanych rozmów.
- Minimalizacja danych oraz anonimizacja treści wrażliwych.
- Komunikacja aplikacji w formule osobistego trenera.

## 10) Poza zakresem / na później
- Rozbudowany trening odpowiedzi na głos.
- Biblioteka literatury i publikacji branżowych.
- Pełny kurs komunikacji interpersonalnej.
- Rozbudowane ścieżki coachingowe.
- Osobne moduły rekrutacji, networkingu i spotkań firmowych poza gotowymi trybami planu.
- Rozbudowane funkcje administracji firmowej — do ustalenia.
- Automatyzacja wszystkich możliwych źródeł researchu — zakres do ustalenia.

## 11) Otwarte decyzje
- Czy trening w v1 jest tekstowy, głosowy czy obsługuje oba tryby?
- Które źródła są pobierane automatycznie, a które uzupełniane ręcznie?
- Z jakimi CRM zintegrować v1?
- Czy zakres odpowiedzialności rozmówcy podaje użytkownik, czy ustala go AI?
- Jakie dodatkowe źródła poza stroną, e-commerce i profilem rozmówcy analizować?
- Kto i według jakich kryteriów zatwierdza research do symulacji?
- Jaki próg kompletności uruchamia neutralnego klienta?
- Jak dokładnie różnią się tryby treningowy i egzaminacyjny?
- Czy oczekiwany następny krok wchodzi do podstawowych 40% gotowości?
- Jakie docelowe, naturalne określenie zastąpi „hipotezę problemu klienta"?
- Jak działa retencja opcjonalnie zapisanych nagrań i transkrypcji?
- Źródło terminu wydarzenia na pulpicie.
- Zakres kont firmowych, administracji, cennika zespołowego i płatności.

## 12) Ryzyka i luki
- Zakres v1 jest duży i może być zbyt pracochłonny.
- Nadmiar kryteriów oceny może utrudnić wdrożenie i zrozumienie wyniku.
- Bon moty i riposty mogą sprowadzić produkt do gadżetu.
- Generowane teksty mogą brzmieć teatralnie lub sztucznie.
- ChatGPT jest łatwym obejściem; przewagą muszą być szybkość, gotowe tryby i prosty wynik.
- Jakość planu i symulacji zależy od jakości oraz kompletności researchu.
- Nieustalone integracje i automatyczne źródła danych blokują precyzyjny zakres techniczny.
- Tryb głosowy znacząco wpływa na koszt, architekturę, ocenę pauz/przerywania i prywatność.
- Nieustalone zasady retencji mogą być sprzeczne z wymaganiem usuwania nagrań i transkrypcji po raporcie.
- Materiały referencyjne PNG nie zostały dostarczone w obecnym kanale.
