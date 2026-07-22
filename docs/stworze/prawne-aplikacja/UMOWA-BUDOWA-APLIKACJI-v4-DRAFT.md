# Umowa o wykonanie i wdrożenie aplikacji — v4 (DRAFT)

> **SZABLON ROBOCZY v4** (model: przeniesienie praw + Udział jako odrębna wierzytelność, rozstrzygnięcia prawne stan 2026). Wymaga finalnego przeglądu prawnika przed pierwszym użyciem.
> **Podpis:** forma pisemna (wymiana własnoręcznie podpisanych oryginałów) **albo** kwalifikowany podpis elektroniczny obu stron. Przeniesienie autorskich praw majątkowych wymaga formy pisemnej **pod rygorem nieważności** — skan, zdjęcie podpisu ani podpis zaufany (Profil Zaufany) tej formy **nie** zachowują (§ 16).
> **Format:** markdown roboczy; placeholdery `{{...}}` zostają — dokument wraca do HTML po akceptacji (silnik renderuje `contract_fields`).

---

# Umowa o wykonanie i wdrożenie aplikacji „{{NAZWA_APLIKACJI_ROBOCZA}}"

zawarta dnia {{DATA}} pomiędzy:

**Wykonawcą:** {{WYKONAWCA_NAZWA}}, NIP {{WYKONAWCA_NIP}}, {{WYKONAWCA_ADRES}} („**Tomek**")

**Zamawiającym:** {{ZAMAWIAJACY_IMIE_NAZWISKO}}{{ZAMAWIAJACY_FIRMA}}, NIP {{ZAMAWIAJACY_NIP}}, {{ZAMAWIAJACY_ADRES}}, e-mail: {{ZAMAWIAJACY_EMAIL}} („**Partner**")

---

> **Nasza współpraca w skrócie** *(podsumowanie dla wygody — wiążąca jest treść paragrafów):*
> - **Tomek buduje** Twoją aplikację i **rozkręca ją do pierwszych 50 stałych klientów** (rozruch trwa do osiągnięcia tego progu, nie dłużej niż przez 12 miesięcy) — płacisz raz: 12 500 zł netto.
> - **Wszystko jest Twoje**: kod i pełne prawa autorskie (przenoszone po odbiorze MVP i zapłacie całości ceny za budowę), marka, domena, klienci i przychody. Rozwijasz aplikację z kim chcesz.
> - **Tomek zarabia tylko wtedy, gdy Ty zarabiasz**: jego wynagrodzenie za przeniesienie praw to {{FEE_PERCENT}}% Przychodu aplikacji, rozliczane automatycznie — zero przelewów i papierologii z Twojej strony. Do tego, bez dodatkowych opłat: utrzymuje system płatności, dba o aktualizacje bezpieczeństwa i doradza strategicznie.
> - **Nie jesteś uwiązany**: po 12 miesiącach od startu możesz w każdej chwili wykupić Udział Tomka po jasnej, z góry znanej formule.
> - **Warunki są jednakowe dla każdego partnera** Tomka — ta sama cena, ten sam procent, ta sama umowa.

---

## § 1. Przedmiot i role

1. Tomek zaprojektuje i zbuduje aplikację internetową opisaną w Załączniku 1 („**Aplikacja**"), uruchomi ją produkcyjnie i poprowadzi jej rozruch rynkowy do osiągnięcia pierwszych 50 stałych klientów (§ 2 pkt „50 stałych klientów"), a następnie przekaże Partnerowi samodzielne prowadzenie Aplikacji, pozostając doradcą strategicznym.
2. Partner wnosi wiedzę branżową i materiały, uczestniczy w decyzjach o zakresie oraz prowadzi Aplikację jako jej operator: działa pod własną marką, obsługuje swoich klientów i odpowiada za swój biznes.
3. Umowa nie tworzy spółki (w szczególności spółki cywilnej — art. 860 k.c.), konsorcjum ani wspólnego przedsiębiorstwa. Strony działają jako niezależni przedsiębiorcy, każda na własny rachunek; żadna nie jest uprawniona do zaciągania zobowiązań w imieniu drugiej ani do reprezentowania jej wobec osób trzecich. Ryzyko gospodarcze Aplikacji po przekazaniu sterów obciąża Partnera.
4. **Ramy rozruchu.** Rozruch rynkowy (ust. 1) Tomek prowadzi do osiągnięcia 50 stałych klientów, nie dłużej jednak niż przez **12 miesięcy od Startu produkcyjnego (uruchomienia sprzedaży)** *[DO POTWIERDZENIA — TOMEK; patrz notatki v4]*. Po upływie tego terminu — niezależnie od osiągniętej liczby klientów — operacyjne prowadzenie Aplikacji („stery") przechodzi na Partnera, a obowiązek prowadzenia rozruchu przez Tomka wygasa; nie wpływa to na Udział (§ 6), który trwa na dotychczasowych zasadach. Koszty budżetu reklamowego kampanii rozruchowych (wydatki na media, w szczególności Meta Ads) ponosi **Partner**; Tomek planuje i prowadzi te kampanie w ramach rozruchu bez dodatkowego wynagrodzenia. Wydatki mediowe rozliczane są bezpośrednio z konta reklamowego Partnera, a jeżeli wyjątkowo poniósł je za Partnera Tomek — Partner zwraca mu je na podstawie zestawienia.
5. **Współdziałanie Partnera.** Partner współdziała przy budowie i rozruchu, w szczególności dostarcza materiały, podejmuje decyzje, udziela dostępów, utrzymuje czynne konto płatności (Stripe) oraz zapewnia środki na budżet reklamowy rozruchu (ust. 4). Zapewnienie środków na budżet reklamowy rozruchu stanowi element współdziałania Partnera, a ich brak traktuje się jak brak współdziałania. Brak wymaganego współdziałania **zawiesza bieg terminów** wykonania i odbioru Aplikacji (w tym terminu z § 4 ust. 1) na czas trwania przeszkody, **nie zawiesza jednak** 12-miesięcznego maksymalnego okresu rozruchu z ust. 4. Jeżeli brak współdziałania uniemożliwia prowadzenie rozruchu, Tomek może — po bezskutecznym upływie 14 dni od wezwania Partnera do współdziałania — zakończyć rozruch wcześniej. Po przekazaniu sterów Tomek świadczy doradztwo strategiczne w rozsądnym wymiarze — orientacyjnie do **4 godzin konsultacji miesięcznie** *[DO POTWIERDZENIA — TOMEK]* — na zasadach § 7.

## § 2. Słowniczek

Na potrzeby umowy:

- **Aplikacja** — oprogramowanie i produkt cyfrowy opisany w Załączniku 1 („Zakres MVP"), wraz z warstwą programową (kod), warstwą nie-programową (interfejsy graficzne, grafiki, teksty, dokumentacja) oraz konfiguracją produkcyjną.
- **Start produkcyjny** — dzień udostępnienia Aplikacji użytkownikom końcowym pod docelową domeną, po akceptacji przez Partnera zgodnie z § 4.
- **Przychód** — kwoty brutto faktycznie otrzymane od użytkowników z eksploatacji Aplikacji (za korzystanie z niej lub za usługi oferowane za jej pośrednictwem), niezależnie od kanału płatności; szczegółowe zasady liczenia (płatności roczne, rabaty, prowizje operatora, zwroty i chargebacki, waluty obce, podmioty powiązane, wyłączenia) określa § 6 ust. 9.
- **Udział** — wynagrodzenie Tomka od Przychodu, o którym mowa w § 6.
- **50 stałych klientów** — stan, w którym łączna liczba unikalnych klientów Aplikacji z aktywnym płatnym dostępem (aktywna subskrypcja albo opłacony dostęp w danym miesiącu) osiągnęła 50 na koniec któregokolwiek miesiąca kalendarzowego. *[DO POTWIERDZENIA — TOMEK: czy próg liczyć jako „50 aktywnych w jednym miesiącu", czy „50 skumulowanych opłaconych kont od startu"; poniżej przyjęto pierwsze — realny, bieżący stan płacących.]*
- **Etapy** — pięć etapów prac składających się na budowę i wdrożenie Aplikacji, o wartości procentowej (dla potrzeb rozliczeń z § 14 i § 15) określonej w poniższej tabeli. Wartość etapu jest **maksymalnym** udziałem tego etapu w cenie za budowę; przy rozliczeniu płatna jest wyłącznie część faktycznie wykonana.

  | Etap | Nazwa | Maks. wartość |
  |---|---|---|
  | 1 | Fundament (handoff, zakres MVP, nazwa i domena, akcept) | 15% |
  | 2 | Infrastruktura (repozytorium, baza, poczta, płatności, konfiguracja) | 10% |
  | 3 | Budowa MVP (funkcja rdzeniowa, panele, konta, płatności, maile) | 40% |
  | 4 | Jakość i strona sprzedażowa (audyt, landing, dopracowanie) | 15% |
  | 5 | Start i rozruch (uruchomienie produkcyjne, prowadzenie sprzedaży do 50 klientów) | 20% |

- **Konsument** — Partner będący osobą fizyczną zawierającą umowę niezwiązaną bezpośrednio z jej działalnością gospodarczą lub zawodową (art. 22¹ k.c.).
- **PNPK (przedsiębiorca na prawach konsumenta)** — Partner będący osobą fizyczną, który zawiera umowę bezpośrednio związaną z jego działalnością gospodarczą, gdy z treści tej umowy wynika, że nie ma ona dla niego charakteru zawodowego, wynikającego w szczególności z przedmiotu wykonywanej przez niego działalności ujawnionego w CEIDG (kody PKD) — art. 385⁵ k.c. oraz odpowiednie przepisy ustawy o prawach konsumenta („**UoPK**").
- **Przedsiębiorca** — Partner niebędący Konsumentem ani PNPK.
- **Usługa Wdrożeniowa** — zbudowanie i wdrożenie Aplikacji (Etapy 1–4 oraz uruchomienie produkcyjne w Etapie 5), zakończone odbiorem MVP (§ 4); pojęciem tym posługuje się § 14.

## § 3. Zakres pierwszej wersji i zmiany

1. Zakres pierwszej wersji Aplikacji określa dokument „Zakres MVP" (Załącznik 1), zaakceptowany mailowo przez obie strony. Rozstrzyga on, co wchodzi w cenę.
2. Po prezentacji wersji roboczej Partner zgłasza uwagi. **W cenie** mieszczą się: poprawki błędów, korekty wyglądu i treści oraz drobne modyfikacje funkcji objętych Zakresem MVP. **Nowe funkcje** spoza Zakresu MVP wyceniane są osobno — lub trafiają do dalszego rozwoju po starcie (§ 7 ust. 4).
3. Ryzyko, że budżet nie wystarczy na dowiezienie umówionej funkcjonalności, obciąża Tomka — różnicę do wykonania Zakresu MVP pokrywa on z własnych środków.

## § 4. Harmonogram i gwarancja

1. Termin oddania Aplikacji do Startu produkcyjnego: **{{TERMIN_TYGODNI}} tygodni** od dnia łącznego spełnienia: zaksięgowania wynagrodzenia (§ 5) oraz dostarczenia przez Partnera materiałów i akceptacji Zakresu MVP. Czas oczekiwania na materiały, dane, akcepty lub weryfikację konta płatności po stronie Partnera odpowiednio wydłuża termin.
2. **Procedura odbioru.** Po ukończeniu MVP Tomek zgłasza je Partnerowi do odbioru (mailowo albo z użyciem wzoru protokołu odbioru). W terminie **7 dni** od zgłoszenia Partner albo potwierdza odbiór, albo zgłasza uwagi (na piśmie lub mailem). **Brak uwag w tym terminie uważa się za dokonanie odbioru.** Uwagi zasadne w zakresie Załącznika 1 (Zakres MVP) Tomek usuwa i ponownie zgłasza rezultat do odbioru, przy czym 7-dniowy termin biegnie na nowo co do ponownie zgłoszonego zakresu; uwagi wykraczające poza Zakres MVP traktuje się jako zamówienie nowych funkcji (§ 3 ust. 2). Dzień dokonania odbioru (potwierdzenia albo bezskutecznego upływu terminu) jest **datą odbioru**. Wobec Partnera będącego Konsumentem albo PNPK milczący odbiór (bezskuteczny upływ terminu) ma wyłącznie znaczenie organizacyjne i nie stanowi potwierdzenia zgodności Aplikacji z umową, zrzeczenia się roszczeń ani ograniczenia ustawowej odpowiedzialności Tomka.
3. **Gwarancja.** Tomek zapewnia **30-dniową gwarancję** usuwania błędów, liczoną **od daty odbioru** (ust. 2) — usuwanie wad polegających na niedziałaniu Aplikacji zgodnie z Zakresem MVP — a niezależnie od niej stałą opiekę i serwis opisane w § 7.

## § 5. Wynagrodzenie za budowę

1. Wynagrodzenie za budowę i wdrożenie Aplikacji oraz za rozruch wynosi **12 500 zł netto (15 375 zł brutto)** i jest płatne z góry, w całości, przy zawarciu umowy. Wpłacona wcześniej opłata rezerwacyjna 500 zł (kwota brutto) jest w pełni zaliczana na poczet tej kwoty — do zapłaty pozostaje wówczas **14 875 zł brutto**. *[DO KSIĘGOWEJ: moment powstania obowiązku VAT od zaliczki rezerwacyjnej oraz charakter opłaty rezerwacyjnej jako kaucji zwrotnej do czasu jej zaliczenia.]*
2. Kwoty netto powiększa podatek VAT według stawki obowiązującej w dniu wystawienia faktury, o ile Tomek jest jego podatnikiem. *[Status VAT stron oraz stawka — do potwierdzenia z księgową; patrz notatki v4.]*
3. Poza § 6 (Udział) oraz udziałem w kosztach infrastruktury po 12. miesiącu (§ 11) Tomek nie pobiera żadnych opłat stałych, abonamentów ani ukrytych kosztów.

## § 6. Udział — wynagrodzenie od Przychodu

1. **Udział to zmienna część ceny za przeniesienie autorskich praw majątkowych do Aplikacji (§ 8), ustalona jako procent wpływów z eksploatacji Aplikacji** (model wynagrodzenia procentowego znany prawu autorskiemu), niezależna od świadczeń bieżących Tomka. Obok kwoty z § 5 Udział wynosi **{{FEE_PERCENT}}% Przychodu Aplikacji** i jest należny za każdy miesiąc kalendarzowy, w którym Aplikacja osiąga Przychód, **do czasu wykupu (§ 9)**, nie dłużej jednak niż za okresy do upływu **15 lat od Startu produkcyjnego (uruchomienia sprzedaży)**, chyba że wcześniej nastąpi wykup. Rozruch rynkowy do 50 stałych klientów (§ 1 ust. 1) mieści się w cenie za budowę z § 5 i nie jest odrębnie wynagradzany Udziałem.
2. Udział stanowi zmienną, rozłożoną w czasie część ceny za przeniesienie autorskich praw majątkowych (ust. 1), powiązaną z Przychodem, a nie zapłatę za usługi bieżące. Ustanie, wypowiedzenie lub ograniczenie opieki i serwisu z § 7 nie wpływa na obowiązek zapłaty Udziału, który pozostaje odrębną wierzytelnością trwającą do wykupu (§ 9) albo do upływu terminu z ust. 1.
3. **Pobór.** Udział pobierany jest automatycznie jako opłata platformy (*application fee*) w systemie Stripe Connect (konto Tomka = platforma, konto Partnera = *connected account* typu Standard; Partner jest *merchant of record*). Partner nie wykonuje żadnych przelewów. Partner utrzymuje konfigurację płatności umożliwiającą ten pobór i nie zmienia jej bez uzgodnienia. Automatyczny pobór jest wyłącznie techniką zapłaty: gdyby był niemożliwy (np. inny kanał płatności uzgodniony przez strony, zmiana zasad Stripe), Partner zapłaci Udział przelewem na podstawie faktury, w terminie 14 dni od końca miesiąca, wraz z raportem sprzedaży, a na wniosek Tomka udostępni wgląd (tylko do odczytu) w dane sprzedażowe Aplikacji.
4. **Wyłączny kanał płatności.** Partner zobowiązuje się przyjmować płatności od użytkowników Aplikacji wyłącznie przez zintegrowane z Aplikacją kanały płatności i nie kierować płatności poza system Aplikacji w celu zaniżenia Przychodu. W razie uzasadnionego podejrzenia naruszenia Przychód za dany okres ustala się szacunkowo na podstawie danych analitycznych Aplikacji (liczba użytkowników, aktywnych subskrypcji, ruch); jest to **domniemanie wzruszalne** — Partner może wykazać rzeczywiste kwoty danymi z systemów płatniczych. Przed skorzystaniem z dalszych uprawnień Tomek wzywa Partnera do zaprzestania naruszenia i rozliczenia w **terminie 14 dni**. Wobec Partnera będącego **Przedsiębiorcą** Tomek może zamiast tego wypowiedzieć opiekę i serwis z § 7 ze skutkiem natychmiastowym. Naruszenie nie wpływa na dalszy obowiązek zapłaty Udziału.
5. **Rozliczenie.** Okresem rozliczeniowym Udziału jest miesiąc kalendarzowy. Tomek wystawia zbiorczą fakturę za dany miesiąc. **Kwota Udziału jest kwotą brutto i zawiera należny podatek VAT** (spójnie z poborem *application fee* w pełnej wysokości — ust. 3). *[Moment powstania obowiązku VAT przy automatycznym poborze application fee — do potwierdzenia z księgową; patrz notatki v4.]*
6. Udział jest jednakowy dla wszystkich partnerów Tomka i nie podlega negocjacji.
7. Tomek nie gwarantuje żadnego poziomu przychodów ani liczby klientów Aplikacji.
8. Tomek może przenieść wierzytelności z tytułu Udziału (w tym przyszłe) na osobę trzecią bez zgody Partnera, zawiadamiając go o cesji; nie zmienia to sposobu poboru ani nie zwalnia Tomka z jego obowiązków wobec Partnera. Partner wyraża na to zgodę. Oznaczalność wierzytelności przyszłych zapewniają definicja Przychodu i stawka Udziału.
9. **Przychód — zasady liczenia.** Do Przychodu wlicza się kwoty brutto faktycznie otrzymane od użytkowników z eksploatacji Aplikacji, przy czym:
   (a) płatności z góry za dłuższy okres (np. roczne) zalicza się w całości do miesiąca ich otrzymania;
   (b) uwzględnia się kwoty po rabatach — liczą się kwoty faktycznie zapłacone przez użytkownika;
   (c) prowizje i opłaty operatora płatności **nie pomniejszają** podstawy Przychodu;
   (d) zwroty i chargebacki koryguje się w najbliższym rozliczeniu; wynik miesiąca nie może być niższy niż zero, a nadwyżkę korekt przenosi się do kolejnych okresów aż do jej rozliczenia;
   (e) wpływy w walutach obcych przelicza się po średnim kursie NBP z ostatniego dnia miesiąca, którego dotyczą;
   (f) wlicza się wpływy podmiotów powiązanych z Partnerem uzyskane z eksploatacji Aplikacji;
   (g) **nie stanowią Przychodu**: wpływy ze sprzedaży całego przedsiębiorstwa lub biznesu związanego z Aplikacją (rozliczane w trybie § 10) ani wynagrodzenie za usługi świadczone przez Partnera osobiście poza Aplikacją.

## § 7. Stała opieka i serwis (bez dodatkowych opłat)

1. Przez okres obowiązywania Udziału Tomek — bez dodatkowych opłat — (a) utrzymuje integrację płatności Aplikacji, (b) dostarcza aktualizacje bezpieczeństwa Aplikacji, (c) pozostaje doradcą strategicznym Partnera (konsultacje na rozsądne żądanie). Opieka z ust. 1 jest świadczeniem odrębnym od Udziału (§ 6 ust. 2) i wygasa z chwilą wykupu (§ 9), a także w pozostałych przypadkach wskazanych w Umowie (w szczególności § 8 ust. 9 lit. c, § 15 ust. 3–4); wygaśnięcie opieki nie wpływa na Udział (§ 6 ust. 2).
2. **Czas reakcji na zgłoszenia serwisowe** (w godzinach roboczych, dni robocze): zgłoszenia **krytyczne** (Aplikacja nie działa lub nie działają płatności) — reakcja do **1 dnia roboczego**; **pozostałe** — reakcja do **3 dni roboczych**. Czas reakcji oznacza podjęcie działań, nie usunięcie awarii.
3. **Dostępność.** Tomek zapewnia staranne działanie w celu utrzymania ciągłości Aplikacji, jednak nie gwarantuje dostępności wyższej niż zapewniają jej dostawcy chmurowi (hosting, baza, płatności, poczta). Z serwisu wyłączone są przerwy wynikające z: siły wyższej, awarii lub ograniczeń po stronie dostawców zewnętrznych, działań lub zaniechań Partnera i jego użytkowników, ataków i incydentów bezpieczeństwa niezawinionych przez Tomka oraz zaplanowanych okien serwisowych.
4. **Zakres.** Opieka i serwis obejmują utrzymanie istniejących funkcji Aplikacji. Rozwój nowych funkcji, integracji i zmian spoza Zakresu MVP realizowany jest na podstawie odrębnych zleceń i wyceniany osobno (§ 3 ust. 2).
5. **Zgodność usługi cyfrowej.** Jeżeli Partner jest Konsumentem albo PNPK, w okresie świadczenia opieki i serwisu Tomek zapewnia zgodność Aplikacji jako usługi/treści cyfrowej z umową na zasadach rozdziału 5b UoPK, w tym dostarcza konieczne aktualizacje (w szczególności zabezpieczające). Postanowień ust. 2–4 nie interpretuje się jako wyłączenia lub ograniczenia tej ustawowej odpowiedzialności. Z chwilą wykupu (§ 9) albo zakończenia opieki i serwisu Partner staje się samodzielnym operatorem Aplikacji i przejmuje odpowiedzialność za jej dalszą zgodność wobec swoich użytkowników.
6. **Funkcje AI a obowiązki regulacyjne.** Jeżeli Aplikacja zawiera funkcje oparte na sztucznej inteligencji, po przejęciu sterów obowiązki dostawcy lub podmiotu stosującego system AI wynikające z rozporządzenia o sztucznej inteligencji (AI Act) wykonuje Partner jako operator Aplikacji. Tomek przekazuje Partnerowi informacje niezbędne do wykonania tych obowiązków, w szczególności o wykorzystanych modelach i ich dostawcach.

## § 8. Prawa do Aplikacji — pełna własność Partnera

1. **Własnością Partnera** są: marka i nazwa Aplikacji, domena, treści, baza klientów i użytkowników oraz wszystkie przychody i relacje biznesowe.
2. **Moment przejścia praw.** Autorskie prawa majątkowe do każdego rezultatu prac wykonanego na podstawie niniejszej Umowy (w tym do Aplikacji jako całości i jej poszczególnych elementów) przechodzą na Partnera — bez ograniczeń terytorialnych i czasowych, na polach eksploatacji wskazanych w ust. 3–4 — z chwilą **późniejszego** z następujących zdarzeń: (a) ustalenia danego rezultatu i jego wydania Partnerowi (odbioru — § 4), (b) zapłaty całości ceny za budowę z § 5. Przeniesienie obejmuje także rezultaty powstałe **po odbiorze MVP** w ramach gwarancji oraz opieki i serwisu (poprawki, aktualizacje, nowe wersje wytworzone przed wykupem) — z chwilą ich **wydania** Partnerowi, bez konieczności przeprowadzania odrębnej procedury odbioru z § 4. Udział z § 6 obejmuje wynagrodzenie za przeniesienie autorskich praw majątkowych do tych rezultatów (nie za samo ich wykonanie, które mieści się w gwarancji z § 4 ust. 3 oraz w opiece i serwisie z § 7). Przeniesienie ogranicza się do rezultatów wykonanych na podstawie niniejszej Umowy i nie obejmuje jakichkolwiek przyszłych utworów Tomka niedotyczących Aplikacji (art. 41 ust. 3 pr. aut.). Do chwili przejścia praw Partnerowi przysługuje wyłącznie wąska, niewyłączna licencja na korzystanie z wersji roboczej w celu testów i akceptacji, bez prawa eksploatacji komercyjnej. Skutek przeniesienia strony wiążą z zapłatą i przyjęciem (odbiorem) utworu (art. 64 ustawy o prawie autorskim i prawach pokrewnych — dalej „**pr. aut.**").
3. **Pola eksploatacji — warstwa programowa (kod), art. 74 ust. 4 pr. aut.:**
   (a) trwałe lub czasowe zwielokrotnianie programu w całości lub w części, jakimikolwiek środkami i w jakiejkolwiek formie, w tym w pamięci operacyjnej, na serwerach i w chmurze, także w zakresie, w jakim jest ono niezbędne do wprowadzania, wyświetlania, stosowania, przekazywania i przechowywania programu;
   (b) tłumaczenie, przystosowywanie, zmiana układu lub jakiekolwiek inne zmiany w programie, wraz z prawem zwielokrotniania rezultatów tych zmian;
   (c) rozpowszechnianie, w tym najem lub użyczenie programu albo jego kopii, oraz udostępnianie w modelu abonamentowym (SaaS).
4. **Pola eksploatacji — warstwa nie-programowa** (interfejsy graficzne, grafiki, teksty, dokumentacja — utwory odrębne, art. 50 pr. aut.):
   (a) utrwalanie i zwielokrotnianie każdą techniką, w tym drukarską, reprograficzną, zapisu magnetycznego i cyfrową;
   (b) wprowadzanie do pamięci komputera i do sieci teleinformatycznych;
   (c) publiczne udostępnianie utworu w taki sposób, aby każdy mógł mieć do niego dostęp w miejscu i w czasie przez siebie wybranym (internet, SaaS, aplikacja webowa/PWA, API);
   (d) publiczne wyświetlanie;
   (e) najem i użyczenie egzemplarzy.
5. **Prawa zależne.** Tomek przenosi na Partnera prawo zezwalania na wykonywanie zależnego prawa autorskiego (art. 46 pr. aut.) oraz wyraża zgodę na dokonywanie opracowań, modyfikacji i rozwijanie Aplikacji (art. 2 pr. aut.), jak również na rozporządzanie i korzystanie z tak powstałych opracowań. Bez tego Partner nie mógłby legalnie rozwijać Aplikacji — postanowienie ma charakter istotny.
6. **Wynagrodzenie łączne.** Wynagrodzenie za korzystanie na wszystkich polach eksploatacji z ust. 3–4 oraz za prawa zależne z ust. 5 zawiera się łącznie w cenie z § 5 i w Udziale z § 6; strony wyłączają odrębne wynagrodzenie za każde pole eksploatacji (art. 45 pr. aut.).
7. **Pola nieznane.** Objęcie pól eksploatacji nieznanych w chwili zawarcia umowy wymaga aneksu (art. 41 ust. 4 pr. aut.).
8. **Oświadczenia i zapewnienia Tomka:**
   (a) przysługuje mu całość przenoszonych praw i jest uprawniony do rozporządzenia nimi; Aplikacja w warstwie autorskiej nie narusza praw osób trzecich;
   (b) w zakresie części Aplikacji wytworzonych z użyciem narzędzi sztucznej inteligencji Tomek przenosi na Partnera całość praw, jakie mu przysługują, a w odniesieniu do elementów niepodlegających ochronie prawa autorskiego (np. rezultatów pozbawionych indywidualnego wkładu twórczego człowieka) udziela Partnerowi **nieodwołalnego, bezwarunkowego i nieodpłatnego zezwolenia** na korzystanie z nich i rozporządzanie nimi bez ograniczeń oraz zobowiązuje się nie podnosić wobec Partnera żadnych roszczeń z tego tytułu;
   (c) Aplikacja może zawierać komponenty open-source oraz inne zasoby osób trzecich (biblioteki, fonty, ikony, szablony, materiały stockowe), które pozostają na swoich pierwotnych licencjach — Partner korzysta z nich na warunkach tych licencji, a nie na podstawie przeniesienia praw z ust. 2; ich wykaz (nazwa, wersja, licencja, źródło) wraz z tekstami licencji i wymaganymi notami (notices) stanowi Załącznik 4. Tomek zobowiązuje się nie wykorzystywać w Aplikacji komponentów o licencjach typu copyleft mogących rozciągnąć swoje warunki na własny kod Aplikacji (w szczególności AGPL, SSPL, GPL) bez uprzedniej zgody Partnera. Pominięcie zasobu osoby trzeciej w Załączniku 4 nie powoduje przeniesienia praw, których Tomek nie posiada, lecz stanowi naruszenie obowiązku ujawnienia i zapewnienia Partnerowi legalnego tytułu do korzystania z takiego zasobu;
   (d) rezultaty prac wytworzone przez podwykonawców lub współtwórców objęte są pisemnym przeniesieniem na Tomka autorskich praw majątkowych w zakresie niezbędnym do wykonania niniejszej Umowy, wraz z prawem ich dalszego przeniesienia na Partnera.
9. **Faktyczne wydanie.**
   (a) Pełne repozytorium kodu źródłowego wraz z dokumentacją dostępową (dostępy produkcyjne, konfiguracja) Tomek przekazuje Partnerowi **przy wykupie** (§ 9 ust. 2) — do tego czasu administruje infrastrukturą (§ 11).
   (b) Niezależnie od powyższego, na żądanie Partnera zgłoszone po zapłacie całości ceny za budowę, Tomek udostępnia mu kopię repozytorium kodu źródłowego (dostęp *read-only*), bez dostępów produkcyjnych i bez przekazania administracji infrastrukturą, które pozostają przy Tomku do czasu wykupu. Umożliwia to Partnerowi wykonywanie przeniesionych praw (np. audyt, przeniesienie do innego programisty), zgodnie z celem umowy.
   (c) Pełne przekazanie administracji infrastrukturą, dostępów produkcyjnych i repozytorium następuje także w razie upływu terminu z § 6 ust. 1, zakończenia opieki i serwisu z § 7 z jakiejkolwiek przyczyny albo skorzystania przez Partnera z § 15 ust. 3; takie przekazanie samo przez się nie powoduje wygaśnięcia Udziału.
10. **Licencja zwrotna dla Tomka.** Partner udziela Tomkowi licencji niewyłącznej, nieodpłatnej, na czas obowiązywania Udziału, na korzystanie z Aplikacji w zakresie niezbędnym do jej utrzymania, rozwoju i hostingu (§ 7, § 11) oraz do prezentacji w portfolio (nazwa Aplikacji, makiety i opis funkcjonalny). Publikacja w portfolio materiałów zawierających dane Partnera lub jego klientów wymaga odrębnej, uprzedniej zgody Partnera.
11. **Komponenty własne Wykonawcy (background).** Tomek zachowuje prawa do ogólnych, niezwiązanych z niszą Partnera komponentów, bibliotek, narzędzi i metodyki (dalej „**Komponenty własne**") oraz może wykorzystywać je i wcześniejsze doświadczenia w innych projektach; nie obejmuje to indywidualnych, charakterystycznych elementów Aplikacji Partnera (funkcji rdzeniowej, marki, treści, interfejsu).
    (a) **Wykaz.** Komponenty własne wykorzystane w Aplikacji wskazuje wykaz w Załączniku 4 (sekcja „Komponenty własne Wykonawcy"). Wykaz Komponentów własnych ustala się najpóźniej przed ich wykorzystaniem w Aplikacji. Dodanie nowego Komponentu własnego po zawarciu Umowy wymaga aneksu w formie pisemnej albo z kwalifikowanym podpisem elektronicznym (QES), zawartego przed wydaniem rezultatu, w którym komponent wykorzystano. Uzupełnienie samego wykazu komponentów open-source i zasobów osób trzecich (ust. 8 lit. c, Załącznik 4) może nastąpić przy wydaniu Aplikacji i nie zmienia zakresu przeniesienia praw.
    (b) **Licencja dla Partnera.** Do Komponentów własnych wykorzystanych w Aplikacji Tomek udziela Partnerowi licencji **niewyłącznej, bezterminowej, nieograniczonej terytorialnie, zbywalnej wraz z Aplikacją i z prawem udzielania sublicencji w tym zakresie**, obejmującej korzystanie, modyfikację i utrzymanie Aplikacji — bez dodatkowych opłat ponad § 5 i § 6.
    (c) **Reguła domyślna.** Elementu Aplikacji niewpisanego do wykazu z lit. (a) nie uważa się za Komponent własny — traktuje się go jako rezultat prac objęty przeniesieniem autorskich praw majątkowych (ust. 2).
    (d) **Zakaz konkurencji.** Tomek nie stworzy dla osoby trzeciej aplikacji konkurencyjnej wobec Aplikacji w tej samej niszy przez okres obowiązywania Udziału (symetria wobec § 10 ust. 3).
12. **Autorskie prawa osobiste.** Tomek zobowiązuje się nie wykonywać autorskich praw osobistych do rezultatów prac wobec Partnera i jego następców prawnych oraz wyraża zgodę na: rozpowszechnianie Aplikacji i jej elementów anonimowo (bez oznaczania autorstwa), dokonywanie zmian, łączenie z innymi utworami, skracanie i aktualizację. Tomek zapewnia, że analogiczne zobowiązania i zgody uzyska od współtwórców i podwykonawców uczestniczących w tworzeniu Aplikacji.
13. **Baza danych i dokumentacja.** Przeniesieniem (ust. 2) objęte są struktura bazy danych Aplikacji oraz dokumentacja techniczna. Prawa producenta bazy danych (w rozumieniu ustawy o ochronie baz danych) zasilanej danymi użytkowników Aplikacji przysługują Partnerowi.

## § 9. Wykup Udziału — jasna cena wyjścia

1. Po upływie 12 miesięcy od Startu produkcyjnego Partner może w każdej chwili wykupić Udział za cenę równą **36-krotności średniej miesięcznej kwoty Udziału z ostatnich 12 miesięcy**, nie mniej jednak niż **30 750 zł brutto** (dwukrotność ceny budowy brutto). *[DO POTWIERDZENIA — TOMEK: wysokość progu; przyjęto 2× cena budowy brutto]*
2. Z chwilą zapłaty ceny wykupu Udział oraz opieka i serwis z § 7 wygasają, a Tomek przekazuje Partnerowi administrację infrastrukturą, komplet dostępów produkcyjnych i pełne repozytorium kodu źródłowego (§ 8 ust. 9 lit. a).

## § 10. Sprzedaż biznesu i kontynuacja

1. Partner może sprzedać Aplikację lub przedsiębiorstwo z nią związane pod warunkiem, że nabywca **przejmie na piśmie obowiązki Partnera z niniejszej umowy** (przejęcie długu za zgodą Tomka, art. 519 k.c.; Tomek nie odmówi zgody bez ważnego powodu) — albo że przed zbyciem nastąpi wykup Udziału (§ 9; przed upływem 12 miesięcy od Startu produkcyjnego cena wykupu równa jest 36-krotności średniej miesięcznej kwoty Udziału z dostępnych pełnych miesięcy kalendarzowych od Startu produkcyjnego, nie mniej jednak niż **30 750 zł brutto** (dwukrotność ceny budowy brutto); jeżeli do dnia zbycia nie zakończył się żaden pełny miesiąc kalendarzowy — należna jest wyłącznie ta cena minimalna). *[DO POTWIERDZENIA — TOMEK: wysokość progu; przyjęto 2× cena budowy brutto]*
2. **Zbycie z pominięciem ust. 1 — Partner będący Przedsiębiorcą.** Jeżeli Partner-Przedsiębiorca zbędzie lub udostępni Aplikację z pominięciem ust. 1, zapłaci Tomkowi **karę umowną w wysokości ceny wykupu** obliczonej jak w ust. 1; strony zgodnie przyjmują, że odpowiada ona wartości utraconego Udziału. Zapłata kary wywołuje skutki wykupu (§ 9 ust. 2). Kara podlega miarkowaniu na zasadach art. 484 § 2 k.c.
3. **Zbycie z pominięciem ust. 1 — Partner będący Konsumentem albo PNPK.** Wobec Partnera będącego Konsumentem albo PNPK strony nie zastrzegają kary umownej. Jeżeli taki Partner przeniesie biznes lub korzyści z Aplikacji na inny podmiot bez przejęcia przez niego obowiązków z umowy (ust. 1), cena wykupu (§ 9, ust. 1) staje się wymagalna jako świadczenie umowne — jako zapłata za już wykonane przeniesienie autorskich praw majątkowych (§ 6 ust. 1) — a jej zapłata wywołuje skutki wykupu (§ 9 ust. 2).
4. **Kontynuacja.** Do Przychodu Aplikacji wlicza się również wpływy z odpłatnej eksploatacji jej wersji zmodyfikowanej, rozwiniętej, migrowanej lub rebrandowanej, jeżeli wersja ta wykorzystuje całość albo istotną część kodu, interfejsu, dokumentacji lub opracowań Aplikacji objętych przeniesieniem praw na podstawie § 8. Samo rozwiązywanie tego samego głównego problemu lub kierowanie produktu do tej samej grupy odbiorców (Załącznik 1) nie wystarcza do uznania produktu za kontynuację Aplikacji. Postanowienie to określa podstawę wynagrodzenia i nie ogranicza Partnera w podejmowaniu ani prowadzeniu jakiejkolwiek działalności. Kontynuację uwzględnia się wyłącznie do dnia wykupu (§ 9) albo upływu terminu z § 6 ust. 1. Podmiot powiązany oznacza podmiot kontrolowany przez Partnera, kontrolujący Partnera lub pozostający z nim pod wspólną kontrolą, a także małżonka i osoby najbliższe działające na rachunek Partnera.

## § 11. Infrastruktura, hosting i koszty zewnętrzne

1. Przez 12 miesięcy od Startu produkcyjnego koszty infrastruktury (hosting, baza danych, wysyłka e-mail, domena) ponosi Tomek. Po tym okresie koszty dzielone są: **90% Partner, 10% Tomek** — rozliczane na podstawie rzeczywistych faktur dostawców. Po przekazaniu Partnerowi administracji infrastrukturą (§ 8 ust. 9, § 9 ust. 2, § 15) wszystkie dalsze koszty infrastruktury ponosi Partner — udział Tomka w wysokości 10% wygasa (koniec finansowania 10% przez Tomka).
2. **Zmienne koszty zewnętrzne** związane z korzystaniem z Aplikacji przez jej użytkowników i skalą działania — w szczególności prowizje operatora płatności (Stripe), koszty bramek SMS, opłaty za API oraz koszty modeli AI przy wolumenie — obciążają **Partnera jako sprzedawcę (merchant of record)** od pierwszego dnia i nie są objęte ani ceną z § 5, ani Udziałem. Tomek nie odpowiada za zobowiązania publicznoprawne i rozliczenia wynikające z przychodów Partnera.
3. **Legalna forma działalności Partnera.** Partner zapewnia, że najpóźniej przed Startem produkcyjnym (uruchomieniem sprzedaży) będzie prowadził działalność w formie umożliwiającej legalne prowadzenie i rozliczanie sprzedaży w Aplikacji, w tym rejestrację w systemie płatności (Stripe) jako *merchant of record*. Do czasu spełnienia tego warunku Start produkcyjny może zostać wstrzymany bez skutków dla terminów obciążających Tomka.

## § 12. Dane osobowe

1. Administratorem danych osobowych użytkowników Aplikacji jest Partner. Tomek oraz dostawcy infrastruktury przetwarzają te dane w imieniu Partnera jako podmioty przetwarzające, na zasadach umowy powierzenia przetwarzania danych (DPA) stanowiącej **Załącznik 2**, zgodnej z art. 28 RODO.
2. Partner jako administrator zapewnia podstawę prawną przetwarzania oraz spełnia obowiązki informacyjne wobec swoich użytkowników. Tomek udostępnia niezbędne informacje o dostawcach i lokalizacji przetwarzania (w tym o ewentualnych transferach poza EOG) — szczegóły w Załączniku 2.

## § 13. Poufność i odpowiedzialność

1. **Poufność jest dwustronna.** Każda ze stron zachowuje w tajemnicy informacje poufne drugiej strony i wykorzystuje je wyłącznie w celu wykonania umowy.
2. **Informacje poufne** obejmują w szczególności: pomysł i koncepcję Aplikacji, know-how, dane biznesowe i finansowe, dane klientów i użytkowników, treść rozmów (w tym treść „spowiednika" / modułu testów), warunki niniejszej umowy oraz materiały oznaczone jako poufne.
3. **Dozwolone ujawnienia.** Ujawnienie informacji poufnych jest dopuszczalne: (a) podwykonawcom i dostawcom usług IT, chmury i AI działającym jako podmioty przetwarzające lub poddostawcy, związanym obowiązkiem poufności; (b) doradcom (księgowym, prawnikom, audytorom) związanym tajemnicą zawodową; (c) w zakresie wymaganym przez bezwzględnie obowiązujące prawo lub decyzję właściwego organu — po uprzednim, o ile to możliwe, zawiadomieniu drugiej strony.
4. **Wyjątek portfolio.** Poufnością nie są objęte materiały, na których publikację Partner wyraził odrębną zgodę (Inspiracje / portfolio — § 8 ust. 10).
5. **Okres.** Obowiązek poufności trwa przez czas obowiązywania umowy i **5 lat** po jej zakończeniu. Informacje stanowiące tajemnicę przedsiębiorstwa w rozumieniu ustawy o zwalczaniu nieuczciwej konkurencji chronione są bezterminowo, dopóki zachowują ten charakter.
6. **Bez kar wobec Konsumenta/PNPK.** Za naruszenie poufności strony nie zastrzegają kar umownych wobec Partnera będącego Konsumentem albo PNPK; odpowiedzialność takiego Partnera opiera się na zasadach ogólnych.
7. **Ograniczenie odpowiedzialności.** Odpowiedzialność odszkodowawcza każdej ze stron ograniczona jest do wysokości wynagrodzenia z § 5; nie dotyczy to szkody wyrządzonej umyślnie ani obowiązków z § 6, § 9 i § 10. Ograniczenie to nie wyłącza ani nie ogranicza odpowiedzialności w zakresie, w jakim byłoby to niedopuszczalne wobec Konsumenta albo PNPK.

## § 14. Prawo odstąpienia (Konsument i PNPK)

1. Umowa jest zawierana **na odległość**. Opatrzenie jej kwalifikowanym podpisem elektronicznym nie zmienia tego charakteru.
2. Jeżeli Partner jest **Konsumentem albo PNPK**, przysługuje mu prawo odstąpienia od umowy **w terminie 14 dni** bez podania przyczyny, na zasadach UoPK. Pouczenie o odstąpieniu oraz wzór formularza stanowią **Załącznik 3**.
3. **Żądanie rozpoczęcia świadczenia.** Partner może zażądać rozpoczęcia prac przed upływem terminu do odstąpienia, składając wyraźne oświadczenie (w treści umowy albo w Załączniku 3). Tomek rozpoczyna prace dopiero po otrzymaniu takiego żądania (art. 15 ust. 3 oraz art. 21 ust. 2 UoPK).
4. **Skutki odstąpienia przed pełnym wykonaniem.** Jeżeli Partner odstąpi od umowy po zażądaniu rozpoczęcia prac, lecz przed pełnym ich wykonaniem, zapłaci Tomkowi kwotę proporcjonalną do zakresu świadczeń spełnionych do chwili odstąpienia (art. 35 UoPK). Proporcję ustala się według **Harmonogramu wartości Etapów** (§ 2). Wartości etapów w tabeli są **maksymalne** — płatna jest wyłącznie część faktycznie wykonana w ramach rozpoczętych etapów; etapy nierozpoczęte nie są płatne.
5. **Wygaśnięcie prawa odstąpienia.** Pełne wykonanie samej Usługi Wdrożeniowej nie powoduje utraty prawa odstąpienia od całej Umowy, jeżeli na Tomku spoczywają dalsze świadczenia (w szczególności opieka i serwis z § 7 oraz przeniesienie rezultatów powstałych po odbiorze MVP — § 8 ust. 2). Prawo odstąpienia wygasa wyłącznie w przypadkach wynikających z bezwzględnie obowiązujących przepisów UoPK.
6. Wobec Partnera będącego Konsumentem albo PNPK przeniesienie autorskich praw majątkowych (§ 8 ust. 2) nie następuje przed bezskutecznym upływem terminu do odstąpienia; w razie skutecznego odstąpienia prawa nie przechodzą, a rozliczenie świadczeń spełnionych do chwili odstąpienia następuje według ust. 4 (Harmonogram wartości Etapów, § 2).

## § 15. Scenariusze zakończenia współpracy

1. **Rezygnacja Partnera przed rozpoczęciem prac** — Tomek zwraca całość otrzymanego wynagrodzenia (w tym opłatę rezerwacyjną), pomniejszoną wyłącznie o ewentualne koszty rzeczywiście poniesione na wyraźne żądanie Partnera; prawa autorskie nie przechodzą.
2. **Rezygnacja w trakcie budowy** — rozliczenie następuje według Harmonogramu wartości Etapów (§ 2 i § 14 ust. 4): Partner płaci za część faktycznie wykonaną, resztę Tomek zwraca. Wobec Partnera będącego Przedsiębiorcą strony mogą to samo rozliczenie stosować odpowiednio, bez odwołania do przepisów konsumenckich.
3. **Po wdrożeniu, a przed osiągnięciem 50 klientów** — jeżeli cena za budowę została zapłacona w całości, prawa autorskie są już przeniesione (§ 8 ust. 2) i pozostają przy Partnerze. Partner może wypowiedzieć opiekę i rozruch prowadzone przez Tomka i samodzielnie prowadzić Aplikację. **Udział — jako zmienna część ceny za przeniesienie autorskich praw majątkowych (§ 6 ust. 1) — trwa do wykupu (§ 9), także po takim wypowiedzeniu** (§ 6 ust. 2). Mówiąc wprost i uczciwie: rezygnacja z dalszej pomocy Tomka nie kończy Udziału; kończy go dopiero wykup.
4. **Śmierć lub trwała niezdolność Tomka do świadczenia opieki.** Śmierć albo trwała niezdolność Tomka do świadczenia opieki **nie powoduje wygaśnięcia Udziału** — jako odroczona część ceny za przeniesienie autorskich praw majątkowych (§ 6 ust. 1) przysługuje on następcom prawnym Tomka do dnia wykupu (§ 9) albo upływu terminu z § 6 ust. 1. Jeżeli w terminie 30 dni opieki i serwisu (§ 7) nie przejmie osoba zdolna do ich świadczenia, opieka i serwis wygasają, a następcy prawni niezwłocznie przekazują Partnerowi pełne repozytorium kodu źródłowego, administrację infrastrukturą i komplet dostępów produkcyjnych; przekazanie to samo przez się nie powoduje wygaśnięcia Udziału.
5. **Cesja na następcę prawnego.** Tomek może przenieść prawa i obowiązki z umowy na następcę prawnego (np. w razie przekształcenia formy prowadzenia działalności) za uprzednim powiadomieniem Partnera, bez pogorszenia jego sytuacji.

## § 16. Forma zawarcia i postanowienia końcowe

1. **Forma zawarcia.** Umowa jest zawierana w formie pisemnej (wymiana własnoręcznie podpisanych oryginałów) **albo** z kwalifikowanym podpisem elektronicznym obu stron (równoważnym formie pisemnej — art. 78¹ k.c. w zw. z eIDAS).
2. **Ostrzeżenie o formie.** Skan lub zdjęcie podpisu, jak również podpis zaufany (Profil Zaufany), **nie** zachowują formy pisemnej i **nie przenoszą autorskich praw majątkowych** — przeniesienie praw wymaga formy pisemnej pod rygorem nieważności (art. 53 pr. aut.).
3. **Klauzula ratunkowa (konwersja).** Do czasu skutecznego zawarcia umowy w wymaganej formie strony są związane jej warunkami tak, jak licencją niewyłączną na korzystanie z Aplikacji na polach eksploatacji z § 8 (art. 65 pr. aut.). Nie zastępuje to przeniesienia praw, które następuje dopiero po zachowaniu formy pisemnej i zapłacie ceny.
4. **Przejrzystość warunków cenowych.** Warunki cenowe (§ 5, § 6, § 9, § 10) są jednakowe dla wszystkich partnerów Tomka i zostały przedstawione Partnerowi przed zawarciem Umowy w sposób umożliwiający zrozumienie ich konsekwencji ekonomicznych, wraz z przykładem liczbowym stanowiącym Załącznik 1a.
5. **Zmiany.** Zmiany umowy wymagają formy pisemnej lub kwalifikowanego podpisu elektronicznego; akceptacje robocze (Zakres MVP, nazwa, harmonogram) mogą następować mailowo przez obie strony.
6. **Prawo i spory.** W sprawach nieuregulowanych stosuje się prawo polskie; spory rozstrzyga sąd właściwy według przepisów ogólnych. Wobec Konsumenta i PNPK stosuje się właściwość wynikającą z przepisów bezwzględnie obowiązujących.
7. **Rozdzielność.** Nieważność lub bezskuteczność któregokolwiek postanowienia nie wpływa na ważność pozostałych; w miejsce postanowienia nieważnego stosuje się postanowienie najbliższe celowi gospodarczemu umowy dopuszczalne prawem.
8. **Załączniki:** 1 — Zakres MVP; 1a — Przykład liczbowy warunków cenowych; 2 — Umowa powierzenia przetwarzania danych (DPA); 3 — Pouczenie o odstąpieniu wraz z formularzem i oświadczeniem o żądaniu rozpoczęcia prac; 4 — Wykaz komponentów open-source i zasobów osób trzecich, wykaz komponentów własnych Wykonawcy oraz oświadczenie o elementach wytworzonych z użyciem AI.
9. **Nazwa Umowy.** Umowa niniejsza zwana jest także „**Umową Budowy**".

---

**Wykonawca** — {{WYKONAWCA_NAZWA}}

**Partner (Zamawiający)** — {{ZAMAWIAJACY_IMIE_NAZWISKO}}

---

# Załącznik 1 — Zakres MVP

Wkleja się tu zaakceptowany dokument „Zakres MVP" projektu {{NAZWA_APLIKACJI_ROBOCZA}}: funkcje pierwszej wersji, świadome wyłączenia, główny problem i grupa odbiorców (baza dla § 10 ust. 4), granica „poprawka vs nowa funkcja", lista ekranów i funkcja rdzeniowa. Warstwa platformy (stała w każdej budowie): logowanie i konta, panel klienta i panel admina, główna funkcja + 1–2 wspierające, płatności i subskrypcje przez Stripe, strona zapisu/sprzedaży pod markę, automatyzacje i statystyki, regulamin/polityka prywatności/RODO, uruchomienie na żywo + hosting na start.

---

# Załącznik 1a — Przykład liczbowy warunków cenowych

Przykład ma charakter wyłącznie poglądowy (nie jest prognozą przychodów — § 6 ust. 7) i ilustruje działanie Udziału oraz ceny wykupu przy stawce **{{FEE_PERCENT}}% (założono 10%)**:

- Przy Przychodzie Aplikacji **10 000 zł miesięcznie** Udział Tomka wynosi **1 000 zł miesięcznie** (10% × 10 000 zł).
- Cena wykupu po upływie 12 miesięcy, przy średniej miesięcznej kwocie Udziału **1 000 zł**, wynosi **36 000 zł** (36 × 1 000 zł — § 9 ust. 1; kwota powyżej progu minimalnego 30 750 zł, więc próg nie ma tu znaczenia).
- Przy niższej średniej miesięcznej kwocie Udziału **500 zł** cena wykupu wynosi **30 750 zł** (36 × 500 zł = 18 000 zł, ale nie mniej niż próg minimalny 30 750 zł — § 9 ust. 1).
- Przy wcześniejszym wykupie w związku ze zbyciem biznesu (§ 10 ust. 1), np. po 3 pełnych miesiącach ze średnią kwotą Udziału **300 zł**, cena wykupu wynosi **30 750 zł brutto** (36 × 300 zł = 10 800 zł, ale nie mniej niż próg minimalny 30 750 zł).

Faktyczne kwoty zależą od rzeczywistego Przychodu i stawki {{FEE_PERCENT}}% wpisanej w § 6.

---

# Załącznik 2 — Umowa powierzenia przetwarzania danych osobowych (DPA)

Zawarta jako integralna część umowy głównej, pomiędzy **Partnerem** (Administrator) a **Tomkiem** (Podmiot przetwarzający). Realizuje wymóg art. 28 ust. 3 RODO.

### § A. Przedmiot, charakter, cel i czas

1. **Przedmiot:** przetwarzanie danych osobowych użytkowników Aplikacji w zakresie niezbędnym do jej budowy, wdrożenia, utrzymania, serwisu i obsługi płatności.
2. **Charakter i cel:** przetwarzanie w imieniu Administratora wyłącznie w celu świadczenia usług z umowy głównej (hosting, przechowywanie, przetwarzanie techniczne, obsługa płatności, poczta transakcyjna, funkcje oparte o AI).
3. **Czas:** przez okres obowiązywania umowy głównej, do wykupu (§ 9) lub zakończenia świadczenia opieki i serwisu, po czym stosuje się § E.

### § B. Kategorie osób i danych

1. **Kategorie osób:** użytkownicy końcowi Aplikacji (klienci Partnera), a w zależności od funkcji — potencjalni klienci (leady) i osoby kontaktujące się.
2. **Kategorie danych:** dane identyfikacyjne i kontaktowe (imię, nazwisko, e-mail, telefon), dane konta i logowania, dane transakcyjne i rozliczeniowe (bez pełnych danych kart — te przetwarza operator płatności), treści wprowadzane przez użytkowników oraz dane techniczne (logi, adresy IP, identyfikatory). Strony nie przewidują powierzenia danych szczególnych kategorii (art. 9 RODO), chyba że wynika to z Zakresu MVP — wówczas w drodze aneksu.

### § C. Obowiązki Podmiotu przetwarzającego (art. 28 ust. 3 RODO)

Podmiot przetwarzający:
1. przetwarza dane wyłącznie na udokumentowane polecenie Administratora (w tym co do transferów poza EOG), którym jest także umowa główna i niniejsze DPA; niezwłocznie informuje Administratora, jeśli polecenie narusza prawo ochrony danych;
2. zapewnia, że osoby upoważnione do przetwarzania zobowiązały się do zachowania poufności lub podlegają ustawowemu obowiązkowi poufności;
3. stosuje środki techniczne i organizacyjne zapewniające bezpieczeństwo odpowiednie do ryzyka (art. 32 RODO): szyfrowanie w transmisji, kontrolę dostępu, kopie zapasowe, rozdział środowisk;
4. przestrzega warunków podpowierzenia (§ D);
5. w miarę możliwości pomaga Administratorowi — poprzez odpowiednie środki techniczne i organizacyjne — wywiązać się z obowiązku odpowiadania na żądania osób, których dane dotyczą (rozdz. III RODO);
6. pomaga Administratorowi wywiązać się z obowiązków z art. 32–36 RODO (bezpieczeństwo, zgłaszanie naruszeń, ocena skutków, uprzednie konsultacje);
7. **zgłasza Administratorowi naruszenie ochrony danych bez zbędnej zwłoki, nie później niż w ciągu 48 godzin** od jego stwierdzenia, przekazując informacje potrzebne do zgłoszenia organowi nadzorczemu;
8. po zakończeniu przetwarzania postępuje z danymi zgodnie z § E;
9. udostępnia Administratorowi informacje niezbędne do wykazania spełnienia obowiązków z art. 28 RODO oraz **umożliwia audyty i inspekcje** (w tym przez upoważnionego audytora) — po uprzednim uzgodnieniu terminu, nie częściej niż raz w roku (poza sytuacjami incydentu lub żądania organu) i z poszanowaniem poufności innych klientów Podmiotu przetwarzającego.

### § D. Podpowierzenie

1. Administrator udziela **ogólnej zgody** na korzystanie z dalszych podmiotów przetwarzających (poddostawców). Podmiot przetwarzający informuje Administratora o zamierzonych zmianach dotyczących dodania lub zastąpienia poddostawców, umożliwiając zgłoszenie uzasadnionego sprzeciwu.
2. **Lista rodzajowa poddostawców** (na dzień zawarcia — kategoria i funkcja):
   - **hosting frontendu / aplikacji** (np. Vercel);
   - **baza danych, uwierzytelnianie, magazyn plików** (np. Supabase);
   - **poczta transakcyjna** (np. Resend);
   - **dostawcy modeli AI** wykorzystywani przez funkcje Aplikacji.
3. Na każdego poddostawcę Podmiot przetwarzający nakłada obowiązki ochrony danych nie mniej surowe niż w niniejszym DPA i odpowiada za ich działania jak za własne.
4. **Transfery poza EOG** odbywają się wyłącznie na podstawie mechanizmu zgodnego z rozdz. V RODO (decyzja o adekwatności albo standardowe klauzule umowne wraz z niezbędnymi środkami dodatkowymi). Wykaz aktualnych poddostawców i lokalizacji przetwarzania Podmiot przetwarzający udostępnia Administratorowi na żądanie.
5. **Operator płatności — odrębny administrator.** Operator płatności (np. Stripe) **nie jest** poddostawcą (podprocesorem) Podmiotu przetwarzającego. W zakresie danych płatniczych operator płatności działa jako **odrębny administrator**, a Partner występuje wobec niego jako sprzedawca (*merchant of record*) — spójnie z regulaminem Aplikacji.

### § E. Zwrot lub usunięcie danych

Po zakończeniu świadczenia usług — zależnie od decyzji Administratora — Podmiot przetwarzający **zwraca albo usuwa** wszystkie dane osobowe i kasuje istniejące kopie, chyba że prawo Unii lub prawo krajowe nakazują ich dalsze przechowywanie. Przy wykupie (§ 9) domyślnie następuje przekazanie danych Administratorowi wraz z infrastrukturą.

---

# Załącznik 3 — Pouczenie o prawie odstąpienia (Konsument i PNPK)

Stosowany, gdy Partner jest Konsumentem albo PNPK.

### Pouczenie

Mają Państwo prawo odstąpić od umowy w terminie **14 dni** bez podania przyczyny. Termin biegnie od dnia zawarcia umowy. Aby zachować termin, wystarczy wysłać oświadczenie przed jego upływem (pisemnie na adres Wykonawcy albo mailowo na adres kontaktowy Wykonawcy). Mogą Państwo skorzystać z wzoru formularza poniżej, choć nie jest to obowiązkowe.

**Skutki odstąpienia:** Wykonawca zwraca otrzymane płatności niezwłocznie, nie później niż w terminie 14 dni od otrzymania oświadczenia. Jeżeli zażądali Państwo rozpoczęcia prac przed upływem terminu do odstąpienia, zapłacą Państwo za świadczenia spełnione do chwili odstąpienia — kwotę proporcjonalną do zakresu wykonanych prac, ustalaną według Harmonogramu wartości Etapów (§ 2 umowy). Samo zakończenie prac wdrożeniowych nie pozbawia Państwa prawa odstąpienia od całej umowy, dopóki na Wykonawcy spoczywają dalsze świadczenia (opieka i serwis, przeniesienie kolejnych rezultatów). Prawo odstąpienia **wygasa** wyłącznie w przypadkach przewidzianych bezwzględnie obowiązującymi przepisami ustawy o prawach konsumenta.

### Wzór formularza odstąpienia

> Adresat: {{WYKONAWCA_NAZWA}}, {{WYKONAWCA_ADRES}}
> Ja/My niniejszym informuję/informujemy o moim/naszym odstąpieniu od umowy o wykonanie i wdrożenie aplikacji „{{NAZWA_APLIKACJI_ROBOCZA}}".
> Data zawarcia umowy: {{DATA}}
> Imię i nazwisko: {{ZAMAWIAJACY_IMIE_NAZWISKO}}
> Adres: {{ZAMAWIAJACY_ADRES}}
> Data i podpis (tylko jeżeli formularz jest przesyłany w wersji papierowej): …………………

### Oświadczenie o żądaniu rozpoczęcia prac przed upływem terminu do odstąpienia

> Żądam rozpoczęcia świadczenia (prac nad Aplikacją) przed upływem 14-dniowego terminu do odstąpienia od umowy. Przyjmuję do wiadomości, że w razie odstąpienia przed pełnym wykonaniem umowy zapłacę za świadczenia spełnione do chwili odstąpienia, a prawo odstąpienia utracę wyłącznie w przypadkach przewidzianych bezwzględnie obowiązującymi przepisami ustawy o prawach konsumenta.
>
> Data i podpis Partnera: …………………

---

# Załącznik 4 — Komponenty open-source i zasoby osób trzecich, komponenty własne Wykonawcy oraz oświadczenie AI

1. **Wykaz komponentów open-source i zasobów osób trzecich** wykorzystanych w Aplikacji (nazwa, wersja, licencja, źródło), wraz z tekstami licencji i wymaganymi notami (notices). Uzupełniany na dzień wydania Aplikacji. Komponenty te pozostają na swoich pierwotnych licencjach — Partner korzysta z nich na warunkach tych licencji, a nie na podstawie przeniesienia praw (§ 8 ust. 8 lit. c). Tomek nie wykorzystał w Aplikacji komponentów o licencjach typu copyleft mogących objąć własny kod Aplikacji (AGPL, SSPL, GPL) bez uprzedniej zgody Partnera.

   | Komponent | Wersja | Licencja | Źródło |
   |---|---|---|---|
   | … | … | … | … |

   **Komponenty własne Wykonawcy** (background — § 8 ust. 11): wykaz ogólnych komponentów, bibliotek i narzędzi Tomka wykorzystanych w Aplikacji, objętych licencją dla Partnera z § 8 ust. 11 lit. (b) — a nie przeniesieniem praw. Elementów niewpisanych do tego wykazu nie uważa się za Komponenty własne (reguła domyślna, § 8 ust. 11 lit. c).

   | Komponent własny | Opis / zakres | Zakres wykorzystania w Aplikacji |
   |---|---|---|
   | … | … | … |

2. **Oświadczenie o elementach wytworzonych z użyciem AI.** Części Aplikacji mogły powstać z użyciem narzędzi sztucznej inteligencji. W zakresie, w jakim elementom tym przysługuje ochrona prawa autorskiego, Tomek przenosi na Partnera całość praw (§ 8 ust. 8 lit. b); w zakresie elementów niepodlegających ochronie udziela nieodwołalnego, bezwarunkowego i nieodpłatnego zezwolenia na korzystanie i rozporządzanie oraz zobowiązuje się nie podnosić roszczeń.

---

---

# NOTATKI ROBOCZE v4 (do usunięcia przed wysyłką do klienta)

### Rewizja 2 — po finalnej opinii gpt-5.6-sol (22.07.2026)

Naniesiono poprawki „ostatniej mili" (druga opinia prawna):
1. **§ 10 ust. 4 (Kontynuacja)** — test kontynuacji oparto na wykorzystaniu całości albo istotnej części przeniesionego kodu/interfejsu/dokumentacji/opracowań (§ 8); sam „ten sam problem / ta sama grupa odbiorców" już nie wystarcza. Obowiązuje wyłącznie do wykupu albo upływu terminu z § 6 ust. 1.
2. **§ 15 ust. 4 (śmierć / trwała niezdolność Tomka)** — odwrócono na wariant z DZIEDZICZENIEM Udziału (patrz zaktualizowana nota A.2).
3. **§ 8 ust. 9 lit. c (nowa)** — pełne przekazanie administracji/dostępów/repo także przy upływie terminu z § 6 ust. 1, zakończeniu opieki i serwisu oraz skorzystaniu przez Partnera z § 15 ust. 3; przekazanie samo przez się nie gasi Udziału.
4. **§ 11 ust. 1** — po przekazaniu administracji infrastrukturą całość dalszych kosztów infrastruktury ponosi Partner (koniec finansowania 10% przez Tomka).
5. **§ 4 ust. 2** — milczący odbiór wobec Konsumenta/PNPK ma wyłącznie znaczenie organizacyjne (bez potwierdzenia zgodności, zrzeczenia roszczeń ani ograniczenia odpowiedzialności ustawowej).
6. **§ 14 ust. 5–6 + Załącznik 3** — samo wykonanie Usługi Wdrożeniowej nie gasi prawa odstąpienia, gdy trwają dalsze świadczenia; przeniesienie praw wobec Konsumenta/PNPK nie następuje przed upływem terminu odstąpienia. Skorygowano pouczenie i oświadczenie w Załączniku 3.
7. **§ 8 ust. 2** — rezultaty powstałe po odbiorze MVP przechodzą z chwilą WYDANIA (bez odrębnej procedury odbioru z § 4); Udział z § 6 = wynagrodzenie za PRZENIESIENIE PRAW do tych rezultatów, nie za ich wykonanie (to gwarancja/opieka).
8. **§ 8 ust. 11 lit. a** — moment ustalenia wykazu Komponentów własnych; nowy komponent własny po zawarciu Umowy = aneks (pismo/QES) przed wydaniem rezultatu; sam wykaz OSS można uzupełnić przy wydaniu Aplikacji.
9. **§ 8 ust. 8 lit. c** — pominięcie zasobu osoby trzeciej w Załączniku 4 = naruszenie obowiązku ujawnienia, nie przeniesienie praw, których Tomek nie ma.
10. **§ 1 ust. 5** — brak współdziałania zawiesza terminy wykonania/odbioru, ale NIE 12-miesięczny okres rozruchu; przy uniemożliwieniu rozruchu — zakończenie po 14 dniach od wezwania.
11. **§ 9 ust. 1 i § 10 ust. 1** — próg minimalny wykupu **30 750 zł brutto** (2× cena budowy brutto), OBUSTRONNY: dotyczy zarówno standardowego wykupu po 12 mies. (§ 9), jak i wcześniejszego przy zbyciu (§ 10; 36× śr. z pełnych miesięcy, nie mniej niż próg; zero pełnych miesięcy = tylko próg). Asymetria z Rewizji 2 (próg tylko w § 10) USUNIĘTA decyzją Tomka 22.07. Wykup jest UPRAWNIENIEM Partnera (opcja, nie obowiązek), co ogranicza ryzyko abuzywności progu wobec Konsumenta/PNPK.
12. **Box na górze** — dodano „nie dłużej niż przez 12 miesięcy" do opisu rozruchu.
13. **§ 5 ust. 1 + box (poprawka nr 14, agent spójności)** — konwencja BRUTTO: po zaliczeniu rezerwacji 500 zł pozostaje **14 875 zł brutto** (koniec z rozbiciem na „12 000 zł netto"); flaga do księgowej o momencie VAT zaliczki i charakterze kaucji zwrotnej.

### A. Punkty [DO POTWIERDZENIA — TOMEK]

1. **Definicja „50 stałych klientów" (§ 2).** Przyjęto: 50 unikalnych klientów z aktywnym płatnym dostępem na koniec któregokolwiek miesiąca (bieżący stan płacących, nie skumulowany). Potwierdź, czy nie ma być to „50 skumulowanych opłaconych kont od startu". Zgodne z kanonem „stałych = płacą co miesiąc" (notatki, pkt 7).
2. **[ROZSTRZYGNIĘTE — TOMEK 22.07: wariant z DZIEDZICZENIEM ZATWIERDZONY; marker rekomendacyjny usunięty z § 15 ust. 4.] Śmierć / trwała niezdolność Tomka (§ 15 ust. 4).** Po finalnej opinii gpt-5.6-sol (22.07) ODWRÓCONO na wariant z DZIEDZICZENIEM: Udział jako odroczona część ceny za przeniesienie praw NIE wygasa ze śmiercią — przysługuje następcom prawnym Tomka do wykupu (§ 9) albo upływu terminu z § 6 ust. 1; jeżeli w 30 dni nikt zdolny nie przejmie opieki, opieka i serwis wygasają, a następcy przekazują Partnerowi repozytorium, administrację infrastrukturą i dostępy (bez gaszenia Udziału). Obie opinie prawne wskazały, że wariant „Udział wygasa ze śmiercią" podważa konstrukcję Udziału jako ceny za prawa i pozbawia rodzinę przychodu. Marker decyzyjny pozostaje w treści § 15 ust. 4 — Tomek może świadomie wybrać wariant wygaśnięcia jako gest wobec klientów.
3. **PESEL / identyfikacja Konsumenta.** System `contract_fields` obsługuje wyłącznie `{company, nip, street, postal, city, termin_tygodni}` oraz placeholdery imię/nazwisko, NIP, adres, e-mail — **nie ma pola PESEL**. Dlatego celowo **nie** wprowadziłem placeholdera `ZAMAWIAJACY_PESEL` (w podwójnych klamrach) do treści renderowanej — niepodstawiony placeholder wyciekłby na wydruk. Dla Partnera-Konsumenta bez NIP identyfikacja opiera się na imieniu/nazwisku + adresie + e-mailu. Jeśli chcesz PESEL w umowie z konsumentem — trzeba dodać pole do `contract_fields` i mapy renderującej w `tn-app/projekt.html` oraz `wfa-portal`.
4. **VAT (§ 5 ust. 2, § 6 ust. 5).** Status VAT stron, stawka oraz moment obowiązku podatkowego przy automatycznym poborze `application_fee` (art. 19a ust. 3 i 8 ustawy o VAT) — do ustalenia z księgową; rozważyć interpretację indywidualną KIS. Kwota brutto 15 375 zł zakłada 23% VAT.
5. **Placeholdery do wypełnienia przy generowaniu:** `{{FEE_PERCENT}}` (default 10), `{{TERMIN_TYGODNI}}` (zwykle 4–8 tyg.), `{{NAZWA_APLIKACJI_ROBOCZA}}`, dane stron. **UWAGA:** placeholder `{{BUDZET_ROZRUCHU}}` z wcześniejszego draftu został USUNIĘTY — § 1 ust. 4 rozstrzyga wprost, że budżet reklamowy rozruchu finansuje Partner (pkt 9), więc dodatkowe pole w `contract_fields` nie jest potrzebne.
6. **[ROZSTRZYGNIĘTE — TOMEK 22.07: 15 lat ZATWIERDZONE; marker usunięty z § 6 ust. 1.] Termin maksymalny Udziału — 15 lat (§ 6 ust. 1).** Wprowadzono górny limit: Udział należny za okresy do upływu 15 lat od Startu produkcyjnego (uruchomienia sprzedaży), chyba że wcześniej wykup. Rekomendacja prawnika: termin maksymalny znacząco wzmacnia obronę przed art. 365¹ k.c., a 15 lat jest ekonomicznie ~równoważne bezterminowości.
7. **Rama rozruchu — 12 miesięcy (§ 1 ust. 4).** Rozruch do 50 klientów, nie dłużej niż 12 mies. od Startu produkcyjnego; po tym terminie stery przechodzą na Partnera niezależnie od liczby klientów, obowiązek rozruchu wygasa (Udział bez zmian). **Potwierdź termin.**
8. **Doradztwo po przekazaniu sterów — 4 h/mies. (§ 1 ust. 5).** Orientacyjny wymiar konsultacji strategicznych po sterach. **Potwierdź wymiar.**
9. **[ROZSTRZYGNIĘTE — TOMEK 22.07: budżet reklamowy rozruchu finansuje PARTNER.]** § 1 ust. 4 wpisuje wprost, że koszty budżetu reklamowego kampanii rozruchowych (media, np. Meta Ads) ponosi Partner; Tomek prowadzi kampanie bez dodatkowego wynagrodzenia, wydatki rozliczane z konta reklamowego Partnera. Zapewnienie środków = element współdziałania Partnera (§ 1 ust. 5). Placeholder `{{BUDZET_ROZRUCHU}}` usunięty — pole w `contract_fields` niepotrzebne.
10. **VAT Udziału = BRUTTO (§ 6 ust. 5).** Rozstrzygnięto: kwota Udziału jest brutto i zawiera należny VAT (spójnie z poborem `application_fee` w pełnej wysokości). Moment obowiązku podatkowego — nadal do potwierdzenia z księgową (pkt 4).

### B. Różnica wykup 36× (aplikacja) vs 24× (sklepy) — ŚWIADOMA

Aplikacja: wykup = **36× średniej miesięcznej kwoty Udziału** z ostatnich 12 mies. (Udział {{FEE_PERCENT}}% = default 10%). Sklepy (regulamin usługi /sklep, kanon): wykup = **24× śr. mies. prowizji, min. 1900 zł** (prowizja 5%). Różnica jest zamierzona — inne produkty, inny procent (10% vs 5%), inny mnożnik. **Nie ujednolicać.** Aplikacja to wyższy wkład budowy (12 500 zł) i wyższy Udział, stąd wyższa krotność wykupu. **Decyzja Tomka (22.07):** oba tryby wykupu (standardowy § 9 ust. 1 i wcześniejszy § 10 ust. 1) mają twardy próg minimalny **30 750 zł brutto** (2× cena budowy brutto) — asymetria z Rewizji 2 (próg tylko w § 10) zniesiona.

### C. Do finalnego przeglądu prawnika

- **Skuteczność konstrukcji Udziału** jako zmiennej części ceny za przeniesienie autorskich praw majątkowych (wynagrodzenie procentowe), powiązanej z Przychodem, z górnym terminem 15 lat (mitygacja art. 365¹ k.c. — „gołe" zobowiązanie bezterminowe ciągłe). Kluczowe: § 6 ust. 1–2 + termin maksymalny.
- **Miarkowanie kary umownej** z § 10 ust. 2 (art. 484 § 2 k.c.) — wpisano wprost możliwość miarkowania; ocenić wysokość (= cena wykupu) pod kątem rażącego wygórowania.
- **Kontrola abuzywności** § 6, § 9, § 10 wobec PNPK (art. 385¹ w zw. z 385⁵ k.c.). **Usunięto klauzulę o „indywidualnym uzgodnieniu" (§ 16 ust. 4)** jako dowodowo szkodliwą i sprzeczną z „Udział nie podlega negocjacji" — zastąpiono ją klauzulą przejrzystości warunków cenowych + przykładem liczbowym (Załącznik 1a). Zawężenie kar do Przedsiębiorców (§ 10 ust. 3, § 13 ust. 6) nadal ubezpiecza.
- **Kompletność pól eksploatacji** (§ 8 ust. 3–4) dla programu (art. 74 ust. 4) i utworów odrębnych (art. 50) oraz skuteczność przeniesienia praw zależnych (art. 46) i zgody na opracowania (art. 2).
- **Mechanika odstąpienia konsumenckiego** (§ 14) po nowelizacji UoPK (implementacja dyrektyw cyfrowej/towarowej 2023) — poprawność odesłań (art. 15 ust. 3, art. 21 ust. 2, art. 35, art. 38) dla usługi łączącej wykonanie oprogramowania z dostarczeniem treści/usługi cyfrowej. Spójne z bramką zgody w `wf2-portal` (CONSENT_VERSION) i z regulaminem /sklep.
- **AI a IP** (§ 8 ust. 8 lit. b, Załącznik 4) — konstrukcja „przenoszę, co mi przysługuje + zezwolenie na elementy bez ochrony + covenant not to sue". Potwierdzić wystarczalność wobec braku autora-człowieka dla rezultatów czysto generatywnych.
- **Cesja wierzytelności przyszłych** z Udziału (§ 6 ust. 8) — oznaczalność (art. 509 k.c.).
- **DPA — transfery poza EOG** (Załącznik 2 § D ust. 4) — zweryfikować mechanizm (SCC + środki dodatkowe) dla dostawców US (Vercel, Stripe, Resend, dostawcy AI).
- **Forma i konwersja** (§ 16 ust. 1–3) — potwierdzić skuteczność klauzuli ratunkowej (licencja z mocy art. 65 pr. aut.) do czasu zachowania formy pisemnej.

### D. Mapa numeracji v3 → v4

| v3 | v4 | Zmiana |
|---|---|---|
| — | § 2 Słowniczek | NOWY (definicje + tabela wartości Etapów + Konsument/PNPK/„50 klientów") |
| § 1 | § 1 | doprecyzowano art. 860 k.c. |
| § 2 | § 3 | + ryzyko budżetu (z FAQ) |
| § 3 | § 4 | bez zmian merytorycznych |
| § 4 | § 5 | rozstrzygnięto VAT (nota) |
| § 5 | § 6 | + wyłączny kanał płatności (ust. 4) |
| § 6 | § 7 | rozbudowano o SLA i zgodność usługi cyfrowej |
| § 7 | § 8 | MAJOR: pola eksploatacji, prawa zależne, oświadczenia AI/OSS, wydanie repo, licencja zwrotna |
| § 8 | § 9 | bez zmian |
| § 9 | § 10 | kary zawężone do Przedsiębiorców; dla Konsumenta/PNPK — wymagalność ceny wykupu |
| § 10 | § 11 | + zmienne koszty zewnętrzne / merchant of record |
| § 11 | § 12 | + obowiązki administratora, odesłanie do pełnego DPA |
| § 12 | § 13 | poufność dwustronna, pełna; ograniczenie odpowiedzialności |
| § 13 ust. 3 | § 14 | NOWY samodzielny paragraf odstąpienia + tabela + Załącznik 3 |
| — | § 15 | NOWY: scenariusze zakończenia współpracy |
| § 13 | § 16 | forma zawarcia + ostrzeżenie + konwersja + końcowe |
| Zał. 1–3 | Zał. 1–4 | DPA rozwinięty do pełnego; dodano Zał. 4 (OSS + AI) |
