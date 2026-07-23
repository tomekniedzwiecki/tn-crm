## KONCEPCJA

**Motyw przewodni: „Ciepło zatacza kręgi”** — koncentryczne łuki są wizualną metaforą chwili, która zaczyna się od dotyku głowicy i rozszerza w spokojny, wieczorny rytuał.

**Narracja w 5 zdaniach:**  
Strona otwiera się centralnym, granatowym packshotem na rozbielonej muszli, a para z kubka i delikatne drgnienie światła budują żywy wieczór bez poruszania produktu.  
Kręgi prowadzą od emocjonalnego „momentu dla siebie” do konkretu: trzech trybów i dziewięciu poziomów każdego z nich.  
Makro głowicy pokazuje 21 stalowych kulek oraz czerwone światło LED bez dopisywania im medycznych efektów.  
Domowe sceny użycia, parametry zasilania i prawdziwe zdjęcia od kupujących odpowiadają na pytanie, czy produkt jest realny i praktyczny.  
Finał najpierw uczciwie zarządza oczekiwaniem wobec delikatnego ciepła, a następnie domyka zakup jedną ceną, COD i 14-dniowym prawem zwrotu.

**Hook hero — warianty pod `?h=`:**

- **`?h=1` — message match: ciepło**  
  **H1:** Wieczorny masaż, który zaczyna się od ciepła.  
  **Sub:** Rozgrzewek łączy delikatny ciepły okład, wibracje i tryb EMS — każdy z 9 poziomami intensywności.

- **`?h=2` — message match: funkcje**  
  **H1:** 3 tryby. 9 poziomów. Jeden rytuał po Twojemu.  
  **Sub:** Podgrzewanie, wibracje i mikroprądy/EMS w ręcznym, bezprzewodowym masażerze do ciała.

- **`?h=3` — message match: moment dla siebie**  
  **H1:** Gdy po całym dniu chcesz już tylko chwili dla siebie.  
  **Sub:** Sięgnij po rozgrzewający masaż karku, ramion, pleców lub ud — we własnym wieczornym rytmie.

**System wykonawczy:** siatka 8 pt, `content-width: 1180px`, sekcje 112 px desktop / 72 px mobile, tekst 50–75 znaków w wierszu; H1 `clamp(56px, 6vw, 80px)` i minimum 38 px mobile, body 17/1.55, eyebrow uppercase z trackingiem 0.2em. Jeden radius 24 px, jeden liniowy styl ikon, identyczne trust-pille na obu viewportach, ciepłe cienie key+ambient z sepiowym tintem 0.08 oraz grain 3%.

## PARTYTURA

- **Font display — Fraunces 600/700:** miękkie, nieregularne formy budują wieczorny, domowy charakter i odróżniają projekt od chłodnego interfejsu urządzenia.
- **Font text — Work Sans 400/500/600:** czytelny grotesk porządkuje funkcje, FAQ i checkout, tworząc wyraźny kontrast z Fraunces.
- **Akcent — `#2E46C8`:** królewski indygo nawiązuje bezpośrednio do granatowego produktu i występuje wyłącznie na CTA oraz zewnętrznym łuku-swashu sygnatury.
- **Rodzina tła — `#FAF3EF`, `#F3E9E3` i biel:** jasna muszla daje ciepłą, wieczorną atmosferę przy zachowaniu wysokiego kontrastu ciepłego grafitu dla tekstu.
- **Materiał i świat:** ciepła lampa, koc, herbata, miękkie tkaniny oraz dłonie kobiety 30–55 tworzą wiarygodny polski dom zamiast gabinetu lub luksusowego spa.
- **Archetyp hero — D:** centralny, wycięty packshot wykorzystuje charakterystyczny kształt granatowego „grzybka”, a ruch pozostaje wyłącznie w parze z kubka i świetle na brzegu kadru.
- **Sygnatura — kręgi ciepła:** dwa lub trzy cienkie łuki i duże liczby 9 oraz 21 powtarzają geometrię kulek głowicy w hero, trybach, makrze i finale.
- **Dobór i kolejność sekcji:** hero prowadzi przez rytuał, tryby, głowicę, obszary, zasilanie i zdjęcia kupujących do mid-CTA, uczciwego FAQ, checkoutu oraz emocjonalnego finału.

## MANIFEST SEKCJI

1. `hero` | scenowa | build — centralny packshot, oferta i fizyczny loop ruchu tworzą natychmiastowy message match bez rozpraszania produktu.
2. `moment` | scenowa | build — osadza urządzenie w prawdziwym wieczorze kobiety 30–55 i sprzedaje mały rytuał zamiast technicznego gadżetu.
3. `tryby` | kodowa | build — TOR-I pozwala naturalnie przełączać ciepło, wibracje i EMS wraz z właściwymi wskaźnikami.
4. `glowica` | scenowa | build — makro z g0 udowadnia obecność 21 stalowych kulek, pierścieni i czerwonego światła LED.
5. `obszary` | scenowa | build — cztery kadry pokazują dozwolone obszary użycia bez sugerowania leczenia lub modelowania sylwetki.
6. `autonomia` | kodowa | build — zwięzła karta odpowiada na obiekcje dotyczące ładowania, czasu pracy, timera i materiałów.
7. `zdjecia-kupujacych` | scenowa | build — realne zdjęcia wyłącznie granatowego wariantu potwierdzają wygląd produktu poza packshotem bez ocen i liczników.
8. `video` | scenowa | SKIP — pobieralność i jakość jedynego klipu nie są potwierdzone, więc bazowy landing nie może zależeć od niedostarczonego materiału.
9. `mid-cta` | kodowa | build — po warstwie dowodowej powtarza jedną cenę, CTA oraz redukcję ryzyka.
10. `faq` | kodowa | build — otwarcie komunikuje delikatne ciepło, możliwą potrzebę mocniejszej intensywności i uwagę o długości rączki.
11. `zamow` | kodowa | build — checkout bez wyboru koloru pokazuje dostawę i pełną sumę przed prawnym przyciskiem zamówienia.
12. `final` | scenowa | build — zamyka historię ciepłym domowym kadrem i prowadzi z powrotem do formularza bez presji czasowej.

Na stronie sekcje nie otrzymują widocznej numeracji.

## SEKCJE

### `hero`

- **Cel:** w kilka sekund połączyć emocję wieczornego rytuału z produktem, ceną i bezpiecznym sposobem płatności.
- **Treść 1:1:**
  - Eyebrow: **TWÓJ WIECZORNY RYTUAŁ**
  - H1 i sub: wariant z parametru `?h=1/2/3` zgodnie z sekcją „Koncepcja”.
  - Nazwa: **Rozgrzewek — podgrzewany masażer do ciała**
  - Cena: **84,90 zł**
  - CTA: **Chcę swój Rozgrzewek**
  - Redukcja ryzyka: **Płatność przy odbiorze • 14 dni na zwrot**
  - Trust-pille: **Płatność przy odbiorze** · **BLIK i płatność online** · **CE i RoHS**
- **Kotwice:** funkcje i 9 poziomów `[galeria+opis]`; bezprzewodowość `[opis]`; obszary `[SPEC+galeria]`; cena, płatności i zwrot `[Karta §5b]`; CE/RoHS `[SPEC]`.
- **Układ:** na mobile packshot jest zcapowany do **≤44–48% wysokości pola**, pod nim eyebrow, H1, sub, cena, CTA i redukcja ryzyka; na desktopie cały układ pozostaje centralny, katalogowo-editorialny, bez bocznych kolumn. **TWARDA REGUŁA: cena 84,90 zł + CTA MUSZĄ być w pierwszym ekranie mobile (fold), z zapasem od dolnej krawędzi** — packshot nie może ich zepchnąć poniżej zgięcia.
- **Rola grafiki:** izolowany granatowy produkt stoi nieruchomo na płaskim polu `#F3E9E3`, a na brzegu kadru para z kubka i światło lampy tworzą 4–6-sekundowy loop.
- **CTA:** primary scroll do `#zamow`; po CTA natychmiast występuje linia redukcji ryzyka, a dopiero niżej pas zaufania.

### `moment`

- **Cel:** przełożyć produkt na znajomy kontekst „po całym dniu”, bez obietnicy rezultatu zdrowotnego.
- **Treść 1:1:**
  - Eyebrow: **PO DNIU, PO SWOJEMU**
  - H2: **Ciepły moment, który mieści się w wieczorze.**
  - Body: **Spięte barki i kark po dniu przy biurku znają to uczucie. Usiądź z herbatą, wybierz poziom i prowadź masażer po karku, ramionach, plecach lub udach. Rozgrzewek działa bez przewodu, więc rytuał nie musi odbywać się przy gniazdku.**
  - Link: **Zobacz 3 tryby**
- **Kotwice:** ręczny i bezprzewodowy charakter `[opis]`; obszary użycia `[SPEC+galeria]`; trzy funkcje `[galeria+opis]`.
- **Układ:** desktop 55/45 z dużą sceną po lewej i wąską kolumną tekstu po prawej; mobile scena 4:5, następnie tekst o szerokości do 34 znaków.
- **Rola grafiki:** kobieta 30–55 bez wyeksponowanej twarzy siedzi na sofie pod kocem, używając granatowego urządzenia na ramieniu; w tle lampa i kubek. Hak napięcia z pierwszego zdania body jest **wyłącznie werbalny (kodowy)** — scena pozostaje spokojna, BEZ grymasu bólu i BEZ dodatkowej klatki „przed".
- **CTA:** dyskretny link tekstowy do `#tryby`.

### `tryby`

- **Cel:** pokazać funkcje bez przeładowania specyfikacją i pozwolić użytkowniczce samodzielnie zbadać produkt.
- **Treść 1:1:**
  - Eyebrow: **WYBIERZ SWÓJ TRYB**
  - H2: **Trzy tryby. Intensywność ustawiasz od 1 do 9.**
  - Intro: **Dotknij trybu, aby zobaczyć jego wskaźnik i zakres ustawień.**
  - Tab **Ciepło**: **Delikatny ciepły okład z 9 poziomami. Aktywny tryb wskazuje czerwony wskaźnik.**
  - Tab **Wibracje**: **Wibracje z 9 poziomami. Aktywny tryb wskazuje niebieski wskaźnik.**
  - Tab **EMS**: **Tryb mikroprądów/EMS z 9 poziomami. Aktywny tryb wskazuje zielony wskaźnik.**
  - Dopisek: **Czerwone światło LED jest widoczną cechą głowicy — nie przedstawiamy go jako terapii.**
- **Kotwice:** trzy funkcje, poziomy i kolory wskaźników `[galeria+opis]`; czerwone światło LED `[galeria]`.
- **Układ:** trzy duże przełączniki nad kartą; karta dzieli się na reprodukcję wyświetlacza i aktywny opis, bez poziomego scrolla na mobile.
- **Rola grafiki:** wierna reprodukcja okrągłego wyświetlacza LED oraz trzech małych wskaźników; czerwony, niebieski i zielony są wyłącznie kolorami statusu urządzenia, nie dodatkowymi akcentami UI.
- **CTA:** **Wybieram Rozgrzewek — 84,90 zł** → `#zamow`.

### `glowica`

- **Cel:** odpowiedzieć wizualnie na obiekcję „czy to nie zabawka?” przez pokazanie realnej konstrukcji.
- **Treść 1:1:**
  - Eyebrow: **KRĘGI CIEPŁA**
  - H2: **21 stalowych kulek w koncentrycznych pierścieniach.**
  - Body: **Kopułowa główka masażera ma 21 stalowych kulkowych bolców ułożonych w pierścieniach. W główce widoczne jest również czerwone światło LED.**
  - Mikrocopy: **Bez dopisywania cudów. Pokazujemy dokładnie to, co znajduje się w produkcie.**
- **Kotwice:** konstrukcja głowicy i materiał kulek `[galeria+opis]`; czerwone LED `[galeria]`.
- **Układ:** pełnoszerokie makro z dużym typograficznym „21”, na desktopie opis nachodzi na pustą część kadru, a na mobile znajduje się pod zdjęciem.
- **Rola grafiki:** crop-first z oryginalnego g0, nie generacja; wszystkie 21 kulek muszą być policzalne i nie mogą zostać uzupełnione przez AI.
- **Warunek wykonawczy (liczba „21"):** przed wypaleniem dużej typograficznej cyfry **„21"** (oraz count-upu) zweryfikować, że crop face-on z g0 pokazuje **21 policzalnych kulek**; jeśli nie — złagodzić H2, typografię i count-up do **„stalowe kulki w koncentrycznych pierścieniach"** BEZ podawania liczby.
- **CTA:** link **Zobacz, gdzie możesz go używać** → `#obszary`.

### `obszary`

- **Cel:** pokazać zakres użycia wyłącznie jako miejsca kontaktu z ciałem.
- **Treść 1:1:**
  - Eyebrow: **TWÓJ RYTM**
  - H2: **Kark, ramiona, plecy albo uda.**
  - Body: **Wybierz obszar i prowadź masażer ręcznie, dopasowując poziom do własnych preferencji.**
  - Etykiety kart: **Kark** · **Ramiona** · **Plecy** · **Uda**
  - Nota: **To produkt do domowego masażu i relaksu, nie urządzenie lecznicze.**
- **Kotwice:** obszary `[SPEC+galeria]`; ręczna obsługa i poziomy `[opis]`; dozwolony język wellness `[Karta prawdy]`.
- **Układ:** desktop asymetryczna mozaika 2×2, mobile pionowa sekwencja czterech bliskich kadrów z krótkimi etykietami.
- **Rola grafiki:** dłonie i fragmenty sylwetki bez eksponowania twarzy, zawsze granatowy produkt i domowe tkaniny; żadnych schematów anatomicznych ani czerwonych „stref bólu”.
- **CTA:** **Sprawdź ładowanie i czas pracy** → `#autonomia`.

### `autonomia`

- **Cel:** zamknąć praktyczne pytania o przewód, ładowanie i automatyczne wyłączenie.
- **Treść 1:1:**
  - Eyebrow: **NAŁADUJ I UŻYWAJ BEZ PRZEWODU**
  - H2: **Około 50 minut pracy po naładowaniu.**
  - Karty:
    - **ok. 1200 mAh**  
      **Pojemność baterii**
    - **ok. 3 h**  
      **Czas ładowania**
    - **ok. 50 min**  
      **Czas pracy**
    - **ok. 30 min**  
      **Automatyczne wyłączenie**
  - Dopisek: **Obudowa: ABS i TPR. Produkt zgodny z CE i RoHS.**
- **Kotwice:** bateria, ładowanie, praca i timer `[OPIS]`; ABS/TPR oraz CE/RoHS `[SPEC]`.
- **Układ:** cztery identyczne karty bez karuzeli; mobile 2×2, desktop jeden rząd.
- **Rola grafiki:** mały packshot przy kartach i liniowe ikony w ciepłym graficie; bez wizualizacji nieznanego typu portu lub przewodu.
- **CTA:** **Zamawiam za 84,90 zł** → `#zamow`.

### `zdjecia-kupujacych`

- **Cel:** dać dowód „przychodzi i wygląda tak” bez korzystania z generycznych ocen EN.
- **Treść 1:1:**
  - Eyebrow: **POZA PACKSHOTEM**
  - H2: **Zdjęcia od kupujących.**
  - Body: **Prawdziwe domowe kadry granatowego wariantu — bez ocen, gwiazdek i liczników popularności.**
  - Podpis pod każdym zdjęciem: **Granatowy wariant Blue**
- **Kotwice:** realne zdjęcia z `bud-reviews/1005008248153062/`; wariant Blue `[decyzja wykonawcza]`.
- **Bramka (min. dowód):** sekcja powstaje wyłącznie, gdy po vision-gate są **≥2 klatki UGC jednoznacznie GRANATOWE**; przy **<2** sekcja jest **pomijana w całości, bez pustego placeholdera**. Nie zakładać z góry 3 kadrów — liczba kafli = liczba zakwalifikowanych zdjęć (2 lub 3).
- **Układ:** desktop 2–3 kadry (wg liczby zakwalifikowanych) w spokojnej siatce, mobile jeden duży kadr i pozostałe mniejsze bez agresywnego poziomego railu.
- **Rola grafiki:** wyłącznie zrehostowane zdjęcia, na których jednoznacznie widać granatowy wariant; bez retuszu zmieniającego produkt i bez zdjęć innych kolorów.
- **CTA:** **Chcę granatowy Rozgrzewek** → `#zamow`.

### `mid-cta`

- **Cel:** przechwycić gotowość zakupową po funkcjach i materiale dowodowym.
- **Treść 1:1:**
  - Eyebrow: **MAŁY RYTUAŁ DLA SIEBIE**
  - H2: **Rozgrzewek w jednej, stałej cenie.**
  - Cena: **84,90 zł**
  - CTA: **Wybieram Rozgrzewek**
  - Redukcja ryzyka: **Możesz zapłacić przy odbiorze. Masz 14 dni na zwrot.**
- **Kotwice:** cena, COD i zwrot `[Karta §5b]`.
- **Układ:** jasna karta z centralnym tekstem, dużą ceną i jednym przyciskiem; sygnatura łuków działa jako swash, nie dekoracyjna plama.
- **Rola grafiki:** mały izolowany packshot po prawej na desktopie i nad ceną na mobile.
- **CTA:** primary do `#zamow`.

### `faq`

- **Cel:** uczciwie zarządzić oczekiwaniami przed formularzem zamówienia.
- **Treść 1:1:**
  - H2: **Zanim zamówisz — konkretnie i bez przesady.**
  - **Czy masażer grzeje bardzo mocno?**  
    **Nie. To delikatny ciepły okład, a nie intensywne grzanie jak od żelazka. Jeśli szukasz bardzo wysokiej temperatury, ten produkt może nie odpowiadać Twoim oczekiwaniom.**
  - **Czy intensywność będzie dla mnie wystarczająca?**  
    **Wibracje, podgrzewanie i tryb EMS mają po 9 poziomów, ale odczucie intensywności jest indywidualne. Wśród opinii pojawia się również głos, że ktoś chciałby mocniejszego działania.**
  - **Czy rączka jest długa?**  
    **Nie podajemy wymiarów, ponieważ nie mamy potwierdzonych danych. Pokazujemy rzeczywisty kształt produktu na zdjęciach, a wśród opinii pojawia się uwaga, że przydałaby się dłuższa rączka.**
  - **Jak sprawdzę ustawiony poziom?**  
    **Poziom od 1 do 9 pokazuje okrągły wyświetlacz LED. Czerwony wskaźnik oznacza grzanie, niebieski wibracje, a zielony tryb EMS.**
  - **Jak długo działa po naładowaniu?**  
    **Według opisu ładowanie trwa około 3 godzin, a czas pracy wynosi około 50 minut. Urządzenie wyłącza się automatycznie po 30 minutach.**
  - **Jaki kolor otrzymam?**  
    **Sprzedajemy wyłącznie granatowy wariant Blue widoczny na zdjęciach. W checkoutcie nie ma wyboru koloru.**
  - **Czy mogę zapłacić przy odbiorze?**  
    **Tak. Dostępna jest płatność przy odbiorze oraz BLIK lub płatność online.**
  - **Czy mogę zwrócić produkt?**  
    **Tak. Masz 14 dni na odstąpienie od umowy.**
- **Kotwice:** minusy i delikatne ciepło `[opinie]`; poziomy i wskaźniki `[galeria+opis]`; ładowanie, praca i timer `[OPIS]`; kolor `[decyzja wykonawcza]`; płatności i zwrot `[Karta §5b]`.
- **Układ:** dostępny accordion z pierwszym pytaniem otwartym; bez ilustracji medycznych.
- **Rola grafiki:** jedynie liniowe znaki plus/minus w `--ink`.
- **CTA:** pod listą **Przejdź do zamówienia — 84,90 zł** → `#zamow`.

### `zamow`

- **Cel:** sfinalizować zakup na stronie bez ukrywania kosztu dostawy lub sumy.
- **Treść 1:1:**
  - Eyebrow: **ZAMÓWIENIE**
  - H2: **Zamów granatowy Rozgrzewek.**
  - Produkt: **Rozgrzewek — podgrzewany masażer do ciała**
  - Wariant: **Granatowy (Blue)**
  - Cena produktu: **84,90 zł**
  - Pole ilości: **Ilość**
  - Dane: **Imię i nazwisko** · **Telefon** · **E-mail** · **Ulica i numer** · **Kod pocztowy** · **Miejscowość**
  - Płatność: **Płatność przy odbiorze** · **BLIK / płatność online**
  - Podsumowanie:
    - **Produkt: 84,90 zł**
    - **Dostawa: [kwota zgodna z wybraną metodą]**
    - **Razem: [automatycznie wyliczona pełna suma]**
  - Przycisk: **Zamawiam z obowiązkiem zapłaty**
  - Redukcja ryzyka: **Masz 14 dni na odstąpienie od umowy.**
- **Kotwice:** produkt i kolor `[decyzja wykonawcza]`; cena, płatności i zwrot `[Karta §5b]`; koszt dostawy musi pochodzić z rzeczywistej konfiguracji sklepu.
- **Układ:** desktop formularz 7/5 z nieruchomym podsumowaniem po prawej; mobile jedna kolumna, a dostawa i pełna suma bezpośrednio przed przyciskiem.
- **Rola grafiki:** mały crop packshotu Blue przy pozycji produktowej, bez selektora lub miniaturek innych kolorów.
- **CTA:** dokładnie **Zamawiam z obowiązkiem zapłaty**; żadnego przycisku przed pokazaniem dostawy i pełnej sumy.

### `final`

- **Cel:** dać spokojne, emocjonalne domknięcie oraz drugą drogę do checkoutu osobom, które przewinęły formularz.
- **Treść 1:1:**
  - Eyebrow: **CIEPŁO ZATACZA KRĘGI**
  - H2: **Zrób miejsce na mały wieczorny rytuał.**
  - Body: **Delikatne ciepło, wibracje i tryb EMS możesz ustawić na jednym z 9 poziomów i używać na wybranym obszarze ciała.**
  - Cena: **84,90 zł**
  - CTA: **Przejdź do zamówienia**
  - Redukcja ryzyka: **Płatność przy odbiorze • 14 dni na zwrot**
- **Kotwice:** funkcje i poziomy `[galeria+opis]`; obszary `[SPEC+galeria]`; cena, COD i zwrot `[Karta §5b]`.
- **Układ:** pełna jasna scena z tekstem w dolnej części, za nią minimalistyczny footer z regulaminem, polityką prywatności i danymi sprzedawcy.
- **Rola grafiki:** granatowy produkt leży na stoliku obok herbaty i koca; łuki sygnatury wracają po raz czwarty, bez cyfrowej poświaty.
- **CTA:** scroll back do początku `#zamow`, nie składa zamówienia samodzielnie.

## GRAFIKI

**Typy osadzenia:**  
**A** — pełna scena lifestyle z miejscem na copy; **B** — izolowany produkt na płaskim polu; **C** — makro, detal lub materiał dowodowy w ramie.

| ID | Opis kadru | Typ | Viewport / źródło |
|---|---|---:|---|
| `G-HERO-01` | Wycięty, wyśrodkowany granatowy masażer, front z czytelnym okrągłym wyświetlaczem, płaskie pole `#F3E9E3`. | B | D+M; crop-first z g0 |
| `G-HERO-LOOP` | Statyczny produkt, na brzegu rozmyty kubek z delikatną parą i lekko zmieniające się światło lampy; loop 4–6 s. | B/A | D 16:9, M 4:5; kompozyt |
| `G-MOMENT-01` | Kobieta 30–55 na sofie, twarz poza osią, koc i herbata, granatowy produkt przy ramieniu. | A | D 3:2, M 4:5; generacja multi-ref |
| `G-MODES-01` | Wierne zbliżenie rączki, okrągłego wyświetlacza 1–9 i trzech wskaźników. | C | D+M; crop-first z g0 plus kodowe etykiety |
| `G-HEAD-21` | Frontalne makro kopułowej głowicy, wszystkie 21 stalowych kulek policzalne, widoczny czerwony pierścień LED. | C | D 16:10, M 1:1; wyłącznie crop-first z g0 |
| `G-AREA-NECK` | Dłoń prowadząca Blue po karku, miękki sweter, ciepłe domowe światło. | A | D+M 4:5; generacja multi-ref |
| `G-AREA-SHOULDER` | Bliski kadr ramienia i granatowego urządzenia bez twarzy. | A | D+M 4:5; generacja multi-ref |
| `G-AREA-BACK` | Kadr górnej części pleców bez nienaturalnego zasięgu dłoni i bez czerwonych map bólu. | A | D+M 4:5; generacja multi-ref |
| `G-AREA-THIGH` | Neutralny kadr urządzenia na udzie (siedząca poza) w domowej, niefitnessowej stylizacji, bez ramek anty-cellulit/wyszczuplania. | A | D+M 4:5; generacja multi-ref |
| `G-AUTO-01` | Produkt na stoliku nocnym obok lampy, bez pokazywania niepotwierdzonego typu portu ładowania. | B/A | D 3:2, M 4:5; generacja multi-ref |
| `G-UGC-01–0N` (2–3) | Realne zdjęcia kupujących pokazujące wyłącznie wariant granatowy; sekcja tylko przy ≥2 klatkach granatowych po vision-gate, inaczej SKIP. | C | D+M; rehost bez zmiany produktu |
| `G-CHECKOUT-01` | Mała, czysta miniatura granatowego wariantu do podsumowania koszyka. | B | D+M; crop-first z g0 |
| `G-FINAL-01` | Blue na stoliku, koc, kubek i ciepła lampa; dużo pustej przestrzeni na tekst. | A | D 16:9, M 4:5; generacja multi-ref |

**Crop-first z g0:** hero, miniatura checkoutu, detal wyświetlacza i przede wszystkim makro głowicy z 21 kulkami; generacja nie może rekonstruować ani „poprawiać” liczby kulek. W scenach generowanych granatowy produkt powstaje z referencji wyłącznie fragmentów Blue z g0, bez przenoszenia białego, różowego lub szarego wariantu.

## FUNKCJE KONWERSJI

- **Mobile sticky:** pojawia się po minięciu hero i zawiera `84,90 zł` oraz CTA **Zamawiam** prowadzące do `#zamow`; chowa się, gdy checkout znajduje się w viewportcie.
- **Desktop sticky:** dyskretny pasek po pierwszym CTA z nazwą, ceną i jednym przyciskiem, bez ocen, liczników i odliczania.
- **TOR-I:** trzy przełączniki `Ciepło / Wibracje / EMS`, sterowane dotykiem, klawiaturą i atrybutami ARIA; zmiana zakładki aktualizuje opis, liczbę 9 oraz właściwy czerwony, niebieski lub zielony wskaźnik.
- **Kolory wskaźników:** czerwony, niebieski i zielony są lokalnymi kolorami statusu odwzorowującymi urządzenie, podczas gdy jedynym dekoracyjnym i sprzedażowym akcentem UI pozostaje `#2E46C8`.
- **Count-up:** tylko dwie wartości — `9` w sekcji trybów oraz `21` przy głowicy; animacja uruchamia się raz, a przy `prefers-reduced-motion` liczby wyświetlają się natychmiast.
- **Kręgi ciepła:** zewnętrzny łuk w kolorze CTA rysuje się subtelnie przy wejściu sekcji, bez pulsowania produktu lub sugerowania emisji energii.
- **Hero loop:** wyłącznie fizyczny ruch pary i światła; produkt, LED i packshot pozostają nieruchome.
- **CTA:** ciepły warstwowy cień, przesunięcie o 1–2 px przy tapnięciu, bez neonowej poświaty i bez zmiany koloru akcentu.
- **FAQ:** accordion zachowuje otwarty stan i nie zamyka odpowiedzi po kliknięciu w link do checkoutu.
- **Checkout:** walidacja inline po opuszczeniu pola, automatyczne przeliczenie dostawy i pełnej sumy oraz domyślnie widoczna opcja COD.
- **Trust-pille:** ten sam kształt 24 px, tekst i liniowe ikony na desktopie i mobile; ikony zawsze w `--ink`.
- **Gate wideo:** klip może zostać dodany jako pojedynczy mały kafel dopiero po potwierdzeniu pobieralności, praw do użycia, jakości mobile i zgodności produktu; brak przejścia gate oznacza brak sekcji i brak pustego placeholdera.

## RYZYKA

- **Wellness ≠ medycyna:** nie używać sformułowań o leczeniu bólu, krążeniu, drenażu, obrzękach, terapii światłem, redukcji cellulitu, odchudzaniu ani modelowaniu sylwetki.
- **Delikatne ciepło:** konsekwentnie mówić „delikatny ciepły okład” i w FAQ jasno wykluczyć oczekiwanie bardzo mocnego grzania; nie podawać temperatur.
- **Wierność głowicy:** każde frontalne ujęcie musi mieć dokładnie 21 stalowych kulek w koncentrycznych pierścieniach, dlatego makro pochodzi z g0, a nie z generacji.
- **Wierność rączki:** okrągły wyświetlacz ma pokazywać poziom 1–9, a trzy wskaźniki muszą zachować znaczenia: czerwony grzanie, niebieski wibracje, zielony EMS.
- **Kolor:** na stronie, w UGC i generacjach występuje wyłącznie granatowy wariant Blue; checkout nie może zawierać selektora innych kolorów.
- **White-label:** nie używać nazwy „Hailicare”, nie tworzyć historii marki, patentów, badań, rekomendacji ekspertów ani sugestii autorskiej technologii.
- **Opinie:** nie publikować generycznych tekstów EN, tłumaczonych ocen, gwiazdek ani liczników; wykorzystać tylko kwalifikujące się zdjęcia Blue z potwierdzonym prawem do rehostowania.
- **Generacja scen:** AI nie może zmieniać kształtu produktu, dodawać przewodów, portów, przycisków, wymiarów ani efektów świetlnych przypominających zabieg medyczny.
- **Rączka i intensywność:** nie ukrywać uwag „przydałaby się dłuższa rączka” i „chciałbym mocniejszy”; prezentować je jako indywidualne głosy, nie powszechny werdykt.
- **Zasilanie:** przy baterii, ładowaniu, czasie pracy i timerze auto-wyłączenia zawsze zachować „ok.” (timer = **ok. 30 min**), bo wartości pochodzą z [OPIS], a nie z pomiaru.
- **Checkout:** koszt dostawy i pełna suma muszą pochodzić z rzeczywistej konfiguracji oraz być widoczne przed przyciskiem **Zamawiam z obowiązkiem zapłaty**.
- **Brak manipulacji:** zero fałszywego odliczania, stanów magazynowych, przekreślonej ceny, „bestsellera”, „darmowej dostawy” i liczbowego social proof.