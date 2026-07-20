## Werdykt pokrycia (BRAKI: 6 — z czego 1 krytyczny)

Handoff pack pokrywa zdecydowaną większość ze 117 wymagań scope=v1 oraz wszystkie 13 pozycji kind=decyzja i 18 pozycji kind=luka (część rozstrzygnięta bazą, część słusznie przeniesiona do §11). Pokrycie merytoryczne rdzenia (workflow, tabele, werdykty, kary, terminy, bezpieczeństwo, tryb bez KG) jest bardzo dobre. Znaleziono 6 luk pokrycia: 1 krytyczna (czerwone polecenia AI w PDF), 2 umiarkowane (reguła prawa cz. I vs cz. II; prezentacja UWAGA jako lista), 3 drobne. Werdykt: NIE kompletny — do uzupełnienia przed rejestrem.

## Brakujące/przeinaczone wymagania (z cytatami itemów)

1. **[KRYTYCZNE — brak] Czerwone polecenia dla AI w referencyjnym PDF muszą być niewidoczne i nie mogą trafiać do raportu.**
   - item `0a4ef9ae`: „Czerwone polecenia dla AI w pliku PDF mają być niewidoczne dla użytkownika i nie mogą trafiać do raportu."
   - item `59c4f29e` (decyzja v1): „...polecenia oznaczone w projekcie na czerwono są instrukcjami dla AI i mają być niewidoczne dla użytkownika."
   - Pack uchwycił lustrzaną połowę tej reguły (TOŻSAMOŚĆ: „Czerwony napis „DO DECYZJI" ma pozostać widoczny...", item `783a888a`), ale POMINĄŁ regułę odwrotną: kolor czerwony w źródłowym apka.pdf pełni podwójną rolę — część czerwieni to instrukcje-do-AI (ukryć), część to wynik „DO DECYZJI" (pokazać). To jednocześnie wymóg produktowy i zabezpieczenie typu prompt-injection: model nie może wykonać/ujawnić czerwonych poleceń z wgranego dokumentu. Musi wejść do specyfikacji.

2. **[UMIARKOWANE — przeinaczenie] Reguła stanu prawnego: część I wg prawa aktualnego, część II wg prawa wskazanego w KG.**
   - item `cd859b01`: „Analiza ma być prowadzona w interesie Podwykonawcy, zgodnie z aktualnym stanem prawnym w części I oraz stanem prawnym wskazanym w Kontrakcie Głównym w części II."
   - Pack sprowadził to WYŁĄCZNIE do ryzyka (§12: „Napięcie między wymogiem aktualnego prawa a stanem prawnym wskazanym w KG"). Klient jednak PODAŁ regułę rozstrzygającą to napięcie — pack traktuje rozstrzygnięte jako otwarte. Reguła (cz. I = prawo aktualne, cz. II = prawo z KG) powinna być zapisana jako reguła analizy, nie tylko jako ryzyko.

3. **[UMIARKOWANE — brak] Wynik „UWAGA" prezentowany jako lista punktów.**
   - item `20ec4e6d`: „Wynik „UWAGA" ma być prezentowany w formie listy punktów."
   - Pack opisuje UWAGA w wielu miejscach (kolor, kiedy), ale nie ma tej reguły prezentacji. Detal układu raportu — do uzupełnienia.

4. **[DROBNE — niedopowiedzenie] Akceptacja PODPISANEJ umowy, nie tylko projektu.**
   - item `e6d7f1e8`: „Należy osobno sprawdzić akceptację podpisanej umowy, ponieważ sama akceptacja projektu nie jest wystarczająca..."
   - Pack §9 ma ogólnie „akceptacji i podpisania umowy", ale gubi kluczowy niuans branżowy: akceptacja PROJEKTU ≠ akceptacja umowy PODPISANEJ (istotne dla odpowiedzialności Zamawiającego wg PZP). Doprecyzować.

5. **[DROBNE — brak] Rozpoznanie typu umowy (odrzucenie nie-budowlanych w v1).**
   - item `4f1c1de2`: „Analiza ma rozróżniać umowy o roboty budowlane oraz umowy na dostawy i usługi."
   - Pack mówi tylko, że v1 obsługuje roboty budowlane (§7/§10), ale nie stawia wymogu, by aplikacja ROZPOZNAWAŁA typ i odmawiała/ostrzegała przy dostawach/usługach. Implikowany wymóg detekcji typu.

6. **[DROBNE — brak] Odnośnik/link do właściwego paragrafu umowy przy niezgodności.**
   - item `469a3bb9`: „Niezgodności w tabeli mają być oznaczane kolorem czerwonym i zawierać odnośnik do właściwego paragrafu umowy."
   - Pack ma paragrafy w kolumnach, ale nie oddaje wymogu „odnośnika" (nawigacyjnego powiązania niezgodność→paragraf). Drobny detal UX raportu.

Dodatkowo do wykorzystania (nie wymóg, ale gubione): **cytat `61ca61d3`** „Aplikacja nie buduje bazy informacji o Twojej firmie." — gotowa linia komunikacyjna adresująca barierę poufności; brak w packu.

## Rejestr decyzji (skonsolidowany, zdeduplikowany §11 + kind=decyzja + kind=luka)

| # | Decyzja / luka | Co mówi baza wiedzy | Moment |
|---|---|---|---|
| 1 | Umiejscowienie podstawy prawnej KC/PZP: osobna kolumna / tylko właściwe przypadki / sekcja pod tabelą | OTWARTE. Częściowo przesądzone: `7dcec04b` „wyłącznie przy pozycjach, dla których przepis ma zastosowanie" + `57bbcc42` „artykuł + krótki opis" — ustalone KIEDY i FORMAT; MIEJSCE otwarte | budowa (layout) |
| 2 | Format treści podstawy prawnej (nr art.+opis / sam nr / pełny cytat) | **Rozstrzygnięte bazą wiedzy:** `57bbcc42` „ma wskazywać właściwy artykuł oraz jego krótki opis" → nr art. + krótki opis | rozstrzygnięte |
| 3 | Pierwszeństwo dokumentów przy braku/niejednoznaczności klauzuli hierarchii | OTWARTE. `7920c7b9`: warunki szczegółowe mogą zmieniać ogólne; brak reguły gdy klauzuli brak (`592877e9`) | budowa |
| 4 | Moment ponownego uruchomienia analizy po korekcie OCR (auto / po zatwierdzeniu / wcale) | OTWARTE (`872caebf`) | budowa |
| 5 | Zakres historii korekt (użytkownik, czas, przed/po, strona) | OTWARTE (`5518e820`) | budowa |
| 6 | Postępowanie przy niejednoznacznym początku terminu | Częściowo przesądzone: `ff266a8d`/`e1a5f917` „wątpliwości → UWAGA", `8cfa1643` „ustalać wg konkretnego zapisu"; sama reguła liczenia otwarta (`9a6567c5`) | budowa |
| 7 | Liczenie „14 dni od podpisania" (pominąć dzień podpisania / liczyć jako pierwszy / wg zapisu) | Napięcie w bazie: `9bf9b836` „uwzględniając dzień podpisania" vs `8cfa1643` „wg konkretnego zapisu" — wymaga doprecyzowania | budowa |
| 8 | Na jaki dzień przesuwać termin w sobotę/dzień wolny | **Rozstrzygnięte bazą wiedzy:** `e3965f0f` „przesunąć na następny dzień roboczy i wyświetlić ostrzeżenie" | rozstrzygnięte |
| 9 | Logika wersjonowania prawa, w tym art. 463 PZP od 12.07.2026 | OTWARTE (`365d0580`); wymaga też ustalenia źródła i procesu aktualizacji bazy KC/PZP (§12) | budowa |
| 10 | Zachowanie przy braku KG / załączników / akceptacji / RCO / danych do obliczeń | Częściowo: brak KG rozstrzygnięty (poz. 21); załączniki/akceptacja/RCO/dane otwarte (`320cb842`) | E1-scope + budowa |
| 11 | Nazwa Tabeli II: „Zestawienie analiza" vs „Porównanie" | OTWARTE, rekomendacja bazy: `9dfc0c77` „na „Porównanie" ze względu na bezpieczeństwo prawne" | budowa/demo |
| 12 | Ostateczna treść wyłączenia odpowiedzialności (disclaimer) | OTWARTE, blokujące: `04dbe793` „wymaga zatwierdzenia prawnego przed publikacją"; `c84c1961` przypomnieć o zatwierdzeniu | przed startem (prawnik) |
| 13 | Czy klient zatwierdza zanonimizowaną kopię przed analizą | OTWARTE (`f8d4a1e5`) | budowa |
| 14 | Udział prawnika PZP w walidacji | OTWARTE (`e7e8f019`); `0f6a95d3` klient sam zatwierdza testy jako ekspert branżowy | E1 / budowa |
| 15 | Zachowanie przy niskiej pewności OCR lub oceny ryzyka | OTWARTE (`523cdee2`) | budowa |
| 16 | Ostateczna zasada odbierania serwisowi dostępu (+ jak nadawać: czasowo / wybór plików / oba) | Częściowo: `0c0668fd` „klient wybiera pliki", `522ce85c` robocza zasada „może odebrać w każdej chwili" (do potwierdzenia); tryb czasowy otwarty (`1e0f0548`) | budowa |
| 17 | Architektura zabezpieczeń i zakres audytu | OTWARTE: `cd3ccac4` „potwierdzenie z Tomkiem podczas budowy"; blokuje sprzedaż (poz. niżej) | budowa |
| 18 | Model osobnych środowisk (każdy klient vs opcja) i +% kosztów | OTWARTE (`e0ea01d9`, `56a85376`); `725dfd76` trade-off: silna izolacja vs wyższe koszty utrzymania | E1-pricing + budowa |
| 19 | Pakiety produktowe i zakres wsparcia/konsultacji | OTWARTE, na później (`f4b79872`, `49422a72`) | E1-pricing / później |
| 20 | Oznaczanie obowiązkowego obszaru nieznalezionego w umowie | **Rozstrzygnięte bazą wiedzy:** `3053a2f8` „UWAGA — nie znaleziono" | rozstrzygnięte |
| 21 | Analiza bez KG i jej nazwa | **Rozstrzygnięte bazą wiedzy:** `92a01e6f` dozwolona + `0f52b312` „Informacja ograniczona bez KG" + `4bb6cdf5`/`d73b97f7`/`485b5ef5` komunikaty | rozstrzygnięte |
| 22 | Kara za opóźnienie gdy KG też ma karę za opóźnienie | **Rozstrzygnięte bazą wiedzy:** `40744250` „NEGOCJUJ tylko gdy za ten sam obowiązek KG przewiduje karę za zwłokę" | rozstrzygnięte |
| 23 | **Ujednolicenie nazewnictwa statusów** (UWAGA / DO DECYZJI / NEGOCJUJ vs ekranowe podpisz/negocjuj/stop; w v1 brak STOP) | OTWARTE — §12 ryzyko + summary „Ostateczne nazewnictwo statusów trzeba ujednolicić"; NIE ma tego w §11 packu, a jest realną decyzją projektową | E1-scope / demo |
| 24 | **Reguła stanu prawnego cz. I vs cz. II** (patrz brak #2) | Baza podała regułę `cd859b01` — do zapisania jako reguła, nie tylko ryzyko | E1-scope |
| 25 | **Nazwa/tagline produktu** | Nazwa robocza dana: „PFP – POLSKIE FORUM PODWYKONAWCÓW / APKA DO UMÓW – ANALIZATOR"; tagline „nie ustalono" (pack TOŻSAMOŚĆ) | E1-nazwa |

## Luki i ryzyka wymagające uwagi w Etapie 1

**Wymaga decyzji już w Etapie 1 (scope / pricing / nazwa):**
- **Ujednolicenie nazewnictwa statusów** (poz. 23) — wpływa na spec UX i copy; dziś współistnieją: Zgodny/Niezgodny, UWAGA, NEGOCJUJ, DO DECYZJI oraz ekranowy podpisz/negocjuj/stop, przy jednoczesnym zakazie „STOP" w v1.
- **Reguła prawa cz. I (aktualne) vs cz. II (wg KG)** (poz. 24) — reguła analityczna, nie tylko ryzyko; ustawić w specyfikacji.
- **Nazwa i tagline** (poz. 25) — nazwa robocza brzmi jak tytuł koncepcji, nie brand; tagline brak. Materiał do USP: problem = podwykonawca dostaje narzucony projekt umowy i musi ocenić ryzyko PRZED podpisem.
- **Bezpieczeństwo jako warunek sprzedaży** — `ace2270e`: „Spełnienie uzgodnionych wymogów bezpieczeństwa danych jest bezwzględnym warunkiem uruchomienia i sprzedaży", `ba6b41e6` „najpierw testy i dokumentacja". To bramka go-to-market — wpływa na scope, wycenę (audyt, ewentualne osobne środowiska poz. 18) i harmonogram.
- **Zależność prawna** — disclaimer (poz. 12) i walidacja prawnika PZP (poz. 14) warunkują publikację; zaplanować w E1.
- **Model cenowy** — abonament miesięczny (summary); pakiety (poz. 19) i osobne środowiska (poz. 18) do wstępnego zarysu w pricingu.
- **Komunikacja poufności** — bariera zakupowa (`2542ec05`/`db57ecde`); gotowe hasło `61ca61d3` „Aplikacja nie buduje bazy informacji o Twojej firmie"; zakaz obietnicy „zero wycieków" bez audytu (`2743a0bd`).

**Do rozstrzygnięcia dopiero przy budowie:** hierarchia dokumentów bez klauzuli (3), timing re-analizy po OCR (4), zakres historii korekt (5), niejednoznaczny/rozbieżny sposób liczenia terminów (6, 7), wersjonowanie prawa i źródło/aktualizacja KC/PZP (9), zachowanie przy brakach KG/RCO/akceptacji (10), miejsce podstawy prawnej (1), nazwa Tabeli II (11), zatwierdzanie anonimizacji (13), niska pewność OCR/ryzyka (15), odbieranie dostępu serwisowi (16), architektura zabezpieczeń i audyt (17).

**Ryzyka produktowe (§12) do świadomego pilnowania:** rozrost v1 do pełnej opinii prawnej; błędy OCR i rozproszenie postanowień między dokumentami; niemożność technicznego zagwarantowania „bezbłędności" przy jednoczesnym marketingowym priorytecie rzetelności; brak ustalonych kryteriów akceptacji jakości analizy; poufność jako bariera zakupu.

## Fakty kluczowe dla USP i nazwy (język klienta/branży)

1. **Problem (dosłownie):** podwykonawca / dalszy podwykonawca dostaje narzucony „projekt umowy podwykonawczej" i musi ocenić ryzyka „przed negocjacjami", zachowując „decyzję o akceptacji warunków" (`3778481b`). Płatnik: „właściciel firmy lub osoba zarządzająca kontraktami".
2. **Kto płaci i dlaczego:** średnie firmy budowlane/wykonawcze przy „zamówieniach publicznych"; abonament miesięczny uzasadniony „oszczędnością czasu i ograniczeniem ryzyka kar, sporów oraz utraty marży" (summary).
3. **Mechanizm (rdzeń USP):** wzorcem kontroli jest „Kontrakt Główny" inwestora — `3ec0bbe8`: „Umowa główna zawsze zawiera wymagania dotyczące umów podwykonawczych i stanowi wzorzec ich kontroli". Do tego automatyczna baza „KC i PZP" (użytkownik ich nie wgrywa).
4. **Kluczowe rozróżnienie branżowe #1 — „zwłoka" vs „opóźnienie":** kara „za opóźnienie" = ryzyko objęcia „opóźnień niezawinionych"; app ma wskazać różnicę i oznaczyć „UWAGA — ryzyko szersze" / „DO DECYZJI" (`5ad1496a`, `3f5b0139`). To najczęściej gubiony przez podwykonawców haczyk.
5. **Kluczowe rozróżnienie #2 — „pay-when-paid":** wykrywanie klauzul „uzależniających zapłatę wynagrodzenia podwykonawcy od wcześniejszej zapłaty wykonawcy przez inwestora" (`7d78bf59`) oraz lustrzanej klauzuli zwrotu zabezpieczenia (`056548b1`).
6. **Kluczowe rozróżnienie #3 — odpowiedzialność Zamawiającego i „RCO":** „ograniczenie do kwot z RCO" (`e6d7f1e8`) — realne ograniczenie ochrony wynagrodzenia podwykonawcy.
7. **Twarde parametry, którymi mówi klient:** „limit kar umownych", „katalog kar", „waloryzacja wynagrodzenia", „zabezpieczenie należytego wykonania umowy", „zwrot kwot zatrzymanych", „gwarancja i rękojmia", „odbiory", „płatności częściowe".
8. **Termin płatności (konkret):** „30 dni od daty wpływu faktury w KSeF"; termin powyżej 30 dni ma być flagowany (`11c212fa`, `41911e5b`). „KSeF" jest w języku klienta.
9. **Akceptacja/umocowanie:** „akceptacja projektu nie jest wystarczająca" — trzeba akceptacji umowy PODPISANEJ; kontrola „podpisu elektronicznego", „umocowania", „pełnomocnictwa", „uprawnienia Zamawiającego" (`e6d7f1e8`, `3b31b48c`).
10. **Aktualność prawa jako argument:** przywołanie „zmiany art. 463 PZP od 12 lipca 2026 r." i „nowych zasad" (`365d0580`) — dowód, że narzędzie pilnuje bieżącego stanu prawnego.
11. **Werdykty (język wyniku):** „Zgodny / Niezgodny", „UWAGA", „NEGOCJUJ", „DO DECYZJI"; w v1 świadomie BEZ „STOP". Czerwień = niezgodność.
12. **Anti-pozycjonowanie (co to NIE jest):** „nie stanowi opinii ani porady prawnej", „nie zastępuje indywidualnej oceny prawnej" (`0c4a6432`); poza zakresem: „gotowe zapisy i aneksy", „pełna opinia prawna od A do Z", „automatyczne negocjowanie z drugą stroną" (§10). To narzędzie ŚWIADOMOŚCI RYZYKA, nie kancelaria.
13. **Anti-pozycjonowanie vs poufność (bariera #1):** „Obawy firm o poufność dokumentów i zbieranie informacji o przedsiębiorstwie mogą być istotną barierą zakupu" (`2542ec05`). Kontra-komunikat gotowy: „Aplikacja nie buduje bazy informacji o Twojej firmie" (`61ca61d3`); „podstawowym scenariuszem jest analiza pustego wzoru umowy, bez danych firmy" (`da4afd28`).
14. **Dzisiejsze obejścia (do których się porównujemy):** ręczne czytanie umowy przez PM/właściciela lub kosztowne/zlecane zewnętrznie opinie prawne — z ryzykiem przeoczenia zwłoki/opóźnienia, pay-when-paid i RCO. USP: „w interesie Podwykonawcy" (`cd859b01`), wyspecjalizowane w podwykonawstwie budowlanym w zamówieniach publicznych, wzorzec = realny KG inwestora, nie generyczny szablon.
15. **Obietnica jakości (i jej granica):** klient stawia „wiarygodne i bezbłędne sprawdzanie oraz porównywanie dokumentów" (`880c2b5c`) jako priorytet — mocny USP, ale w komunikacji nie łączyć go z obietnicą „zero wycieków" bez audytu (`2743a0bd`); rzetelność tak, gwarancje absolutne nie.
