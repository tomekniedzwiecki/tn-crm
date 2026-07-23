## KONCEPCJA

**Motyw przewodni: „Linia odwilży”** — landing prowadzi wzrok od szronu i lodowego błękitu do ciepłego światła kuchni, a powtarzający się pasek zimny błękit → mandarynka oznacza przejście od zamrożonego problemu do uporządkowanego rozmrażania.

**Narracja strony — 5 zdań:**

1. Jest 16:30, obiad nadal leży w zamrażarce, a landing od razu pokazuje ten znajomy moment bez obwiniania użytkownika.  
2. Dyptyk hero zestawia mięso pokryte szronem z porcjami umieszczonymi pod kopułą Rozmrozika, dzięki czemu dwa stany stają się głównym argumentem wizualnym.  
3. Interaktywne demo redukuje produkt do trzech czytelnych czynności: połóż, przykryj, dotknij.  
4. Dalsze sekcje dowodzą użyteczności wyłącznie pojemnością, budową, tacką ociekową, panelem, USB-C oraz ostrożnie opisanymi funkcjami producenta.  
5. Pionowe wideo, FAQ i powtarzana oferta prowadzą do checkoutu z płatnością przy odbiorze oraz 14 dniami na zwrot.

**Hook hero — warianty message match:**

- `?h=1`  
  **H1:** „Mięso z zamrażarki nie musi rozwalać planu na obiad.”  
  **Sub:** „Połóż porcje na aluminiowej płycie, przykryj je przezroczystą kopułą i uruchom elektryczny box jednym dotknięciem.”  
  `(kotwica: ICP — scenariusz 16:30; Karta prawdy — płyta aluminiowa, kopuła PS, start jednym dotknięciem)`

- `?h=2`  
  **H1:** „Rozmrażanie bez miski zajmującej zlew.”  
  **Sub:** „Rozmrozik tworzy osobne miejsce na zamrożone porcje, a tacka ociekowa ABS zbiera wodę.”  
  `(kotwica: ICP — stary sposób z miską; Karta prawdy — elektryczny box i tacka ociekowa ABS)`

- `?h=3`  
  **H1:** „Z zamrażarki pod kopułę. Potem na patelnię.”  
  **Sub:** „Komora 4,2 L mieści jednocześnie 4 steki lub 4 porcje ryby.”  
  `(kotwica: Karta prawdy — przeznaczenie produktu; galeria — 4,2 L oraz 4 steki lub 4 porcje ryby)`

**Rama wykonawcza:** content-width 1180 px, rytm 8·16·24·32·48·64·96, sekcje 112 px desktop/72 px mobile, H1 `clamp(56px, 6vw, 80px)` i minimum 38 px mobile, body 17/1.55, kolumny tekstu 50–75 znaków, jeden radius 24 px, ciepły cień key+ambient w sepiowym tincie 0,08 oraz grain 3%.

## PARTYTURA

1. **Font display — Zilla Slab:** Ten produkt i persona prowadzą do ciepłego, konkretnego slabu, bo urządzenie ma wyglądać jak praktyczne wyposażenie domu, a nie zimny gadżet technologiczny.  
2. **Font text — Instrument Sans:** Ten produkt i persona prowadzą do neutralnego, bardzo czytelnego sansa, bo większość użytkowników będzie skanować fakty, FAQ i checkout na małym ekranie.  
3. **Akcent — `--cta: #E8590C`:** Ten produkt i persona prowadzą do jednej mandarynkowej temperatury użytej wyłącznie na CTA i końcówce „paska odwilży”, bo kolor ma oznaczać ciepło rozwiązania bez zamiany interfejsu w neon.  
4. **Rodzina tła — `#F2F7FA`, `#EAF1F6` i biel:** Ten produkt i persona prowadzą do rozbielonych lodowych teł, bo narracja zaczyna się od zamrożenia, ale body musi pozostać jasne, domowe i czytelne.  
5. **Materiał i świat — stal, jasne drewno, błękitne światło oraz polska kuchnia około 16:30–18:00:** Ten produkt i persona prowadzą do zwyczajnego popołudnia po pracy, bo wtedy problem zamrożonego obiadu jest najbardziej rozpoznawalny i wiarygodny.  
6. **Archetyp hero — F, równoważny dyptyk ZAMROŻONE | ROZMROŻONE:** Ten produkt i persona prowadzą do dwóch kadrów o tej samej wadze, bo różnica stanu jest szybsza do zrozumienia niż techniczny opis urządzenia.  
7. **Sygnatura — „pasek odwilży” i duże `4,2 L · 4 steki`:** Ten produkt i persona prowadzą do powtarzalnej linii zimno→ciepło oraz liczb jako grafiki typograficznej, bo pojemność jest najmocniejszym dostępnym dowodem bez używania opinii i nieudokumentowanych czasów.  
8. **Kolejność — hero → problem → demo → pojemność i budowa → funkcje → wideo → mid-CTA → FAQ → pominięte dowody → zamówienie → final:** Ten produkt i persona prowadzą od rozpoznania sytuacji przez prostotę obsługi i konkretne dane do zakupu, bo zimny ruch musi najpierw zrozumieć zastosowanie, a dopiero później technologię i ofertę.  

## MANIFEST SEKCJI

1. `hero | scenowa | build — dyptyk natychmiast łączy reklamowy problem zamrożonego obiadu z produktem i pokazuje cenę, CTA oraz redukcję ryzyka nad foldem`
2. `problem | scenowa | build — odtwarza moment 16:30, normalizuje zapomnienie i kontrastuje box z miską w zlewie oraz mikrofalą bez obiecywania przewagi czasowej`
3. `jak-dziala | kodowa | build — TOR-I pokazuje trzy udokumentowane stany połóż→przykryj→dotknij bez zegara i nieudokumentowanego rezultatu czasowego`
4. `pojemnosc | scenowa | build — eksponuje 4,2 L, 4 steki lub 4 porcje ryby oraz tackę ociekową jako konkret przeciw obiekcji „czy to nie gadżet?”`
5. `funkcje | kodowa | build — porządkuje materiały, panel, USB-C, plazmę i UVC z wyraźnym przypisaniem twierdzeń producentowi`
6. `wideo | kodowa | build — materiał pięciu self-hosted klipów istnieje i może dostarczyć natywnego dla TikToka dowodu sposobu użycia`
7. `mid-cta | kodowa | build — powtarza ofertę po zbudowaniu wartości, zachowując kolejność cena→CTA→redukcja ryzyka`
8. `faq | kodowa | build — odpowiada uczciwie na pytania o czas, wodę, funkcje, pojemność, kolory, płatność i zwrot`
9. `galeria | scenowa | SKIP — dostępny jest tylko jeden czysty packshot; klasę dowodową pokrywa sekcja „zdjęcia od kupujących" (poz. 10b)`
10. `opinie | kodowa | SKIP — pięć generycznych opinii EN (sam tekst) nie publikowane; klasę dowodową realizuje sekcja zdjęć od kupujących`
10b. `zdjecia-kupujacych | build — dodana 23.07 (feedback Tomka; klasa dowodowa; materiał: 6 klatek bud-reviews); 3 kadry czarnego produktu (moduł / taca+perforacja / kabel USB-C; KAYUSO wycięty crop-em); po sekcji wideo (06), przed mid-cta; ZERO ocen/liczb`
11. `zamow | kodowa | build — checkout na stronie obsługuje COD, BLIK/online, wariant tekstowy koloru i obowiązkowe podsumowanie zamówienia`
12. `final | scenowa | build — zamyka historię spokojną sceną gotowania i ostatnią ofertą bez presji, przeceny ani fałszywej pilności`

## SEKCJE

### `hero`

- **Cel:** natychmiastowy message match z Reels/TikToka, identyfikacja produktu i przejście do zamówienia.
- **Treść:**
  - Eyebrow: **„PLAN AWARYJNY NA ZAMROŻONY OBIAD”** `(kotwica: ICP — scenariusz 16:30)`
  - H1: **„Mięso z zamrażarki nie musi rozwalać planu na obiad.”** `(kotwica: ICP — mięso w zamrażarce jak kamień)`
  - Sub: **„Połóż porcje na aluminiowej płycie, przykryj je przezroczystą kopułą i uruchom elektryczny box jednym dotknięciem.”** `(kotwica: Karta prawdy — płyta ze stopu aluminium, kopuła PS, panel dotykowy)`
  - Cena: **„289,00 zł”** `(kotwica: Karta prawdy — cena stała)`
  - CTA: **„Zamawiam Rozmrozik”**
  - Redukcja ryzyka: **„Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot”** `(kotwica: Karta prawdy — płatności i zwrot)`
  - Pas zaufania: **„4,2 L” · „4 steki lub 4 porcje ryby” · „Start jednym dotknięciem” · „Ładowanie USB-C”** `(kotwica: Karta prawdy — galeria i tytuł aukcji)`
- **Układ:** mobile: copy → cena/CTA/ryzyko → dyptyk 1:1 z dwoma pionowymi kadrami; desktop: copy i oferta w lewej kolumnie, dyptyk zajmuje około 58% szerokości po prawej.
- **Rola grafiki:** dwa kadry tej samej wielkości; po lewej zamrożony stek ze szronem, po prawej porcje pod statycznym Rozmrozikiem obok patelni, a pętlę ruchu tworzą wyłącznie para znad kubka i delikatnie falująca zasłona.
- **Sygnatura:** pasek odwilży pod eyebrow; duże `4,2 L · 4 steki` w pasie zaufania, liczby w charcoal.
- **CTA:** scroll do `#zamow`.

### `problem`

- **Cel:** nazwać napięcie bez zawstydzania oraz pokazać, po co istnieje osobne urządzenie.
- **Treść:**
  - Eyebrow: **„16:30. KAŻDEMU SIĘ ZDARZA.”** `(kotwica: ICP — moment powrotu z pracy i ton odciążający winę)`
  - H2: **„Zamrażarka pamięta. Ty nie musisz.”**
  - Lead: **„Wracasz z pracy, rodzina pyta o obiad, a mięso nadal jest twarde i pokryte szronem.”** `(kotwica: ICP — mięso w zamrażarce jak kamień)`
  - Karta 1: **„Miska ciepłej wody zajmująca zlew?”** `(kotwica: ICP — stary sposób)`
  - Karta 2: **„Mikrofala i brzegi, które zaczynają się gotować?”** `(kotwica: ICP — obiekcja wobec mikrofali)`
  - Puenta: **„Rozmrozik daje zamrożonym porcjom osobne miejsce: aluminiową płytę pod kopułą oraz tackę ociekową zbierającą wodę.”** `(kotwica: Karta prawdy — konstrukcja i tacka ABS)`
- **Układ:** edytorialowy układ 5/7; po lewej krótka historia i dwie karty problemu, po prawej scena kuchni z miską ciepłej wody z unoszącą się parą w zlewie (BEZ produktu w kadrze — EMOCJA↔PRODUKT).
- **Rola grafiki:** jedyna poza lewą połową hero scena ze szronem; bez przesadnego lodu, efektów świetlnych i wizualizacji „energii”.
- **CTA:** brak — sekcja prowadzi bezpośrednio do demo.

### `jak-dziala`

- **Cel:** zredukować postrzeganą złożoność do trzech udokumentowanych czynności.
- **Treść:**
  - Eyebrow: **„TRZY RUCHY”**
  - H2: **„Połóż. Przykryj. Dotknij.”**
  - Stan 1, **„Połóż”**: **„Umieść zamrożone porcje na płycie ze stopu aluminium.”** `(kotwica: Karta prawdy — materiał płyty)`
  - Stan 2, **„Przykryj”**: **„Nałóż przezroczystą kopułę PS ze ściętymi bokami.”** `(kotwica: Karta prawdy — kopuła PS)`
  - Stan 3, **„Dotknij”**: **„Uruchom urządzenie jednym dotknięciem panelu LED.”** `(kotwica: Karta prawdy — panel dotykowy i start jednym dotknięciem)`
  - Stan końcowy UI: **„Urządzenie uruchomione.”** `(kotwica: Karta prawdy — start jednym dotknięciem)`
- **Układ:** TOR-I; mobile jako przypięta scena produktu z trzema segmentami sterującymi pod spodem, desktop jako scena 7/12 i pionowy kontroler 5/12.
- **Rola grafiki:** trzy warianty tej samej sceny z identycznym kadrem i produktem, zmienia się tylko położenie porcji, kopuły i dłoni przy panelu.
- **CTA:** tekstowy link w kolorze ink: **„Zobacz, ile mieści →”**, scroll do `#pojemnosc`.

### `pojemnosc`

- **Cel:** zamienić ogólną obietnicę użyteczności na mierzalny konkret.
- **Treść:**
  - Eyebrow: **„MIEJSCE NA OBIAD”**
  - H2: **„Nie jedna porcja. Cztery.”**
  - Duża typografia: **„4,2 L”** `(kotwica: Karta prawdy — pojemność komory)`
  - Duża typografia alternowana: **„4 steki” / „4 porcje ryby”** `(kotwica: Karta prawdy — galeria)`
  - Body: **„Komora o pojemności 4,2 L mieści jednocześnie 4 steki lub 4 porcje ryby.”** `(kotwica: Karta prawdy — galeria)`
  - Body: **„Tacka ociekowa ABS zbiera wodę powstającą podczas rozmrażania.”** `(kotwica: Karta prawdy — galeria)`
  - Detal: **„Płyta: stop aluminium · kopuła: PS · tacka: ABS · elementy: NTC”** `(kotwica: Karta prawdy — diagram materiałów)`
- **Układ:** typograficzny plakat po lewej, widok produktu z góry po prawej; mobile zaczyna się od liczb, następnie pokazuje scenę.
- **Rola grafiki:** widok z góry z dokładnie czterema stekami pod kopułą; toggle ink przełącza na drugi kadr z dokładnie czterema porcjami ryby.
- **Sygnatura:** pasek odwilży pod eyebrow i dominujące `4,2 L · 4`.
- **CTA:** brak.

### `funkcje`

- **Cel:** wyjaśnić technologię bez pseudonauki i bez przenoszenia twierdzeń producenta na markę sprzedawcy.
- **Treść:**
  - Eyebrow: **„CO WIEMY O URZĄDZENIU”**
  - H2: **„Funkcje nazwane bez cudownych obietnic.”**
  - Karta 1: **„Plasma Locking”**  
    **„Moduł generatora plazmy opisany przez producenta jako „Plasma Locking”.”** `(kotwica: Karta prawdy — funkcja według producenta)`
  - Karta 2: **„UVC Antibacterial”**  
    **„Lampa UVC o działaniu antybakteryjnym według producenta; bez deklaracji sterylizacji i bez obietnic medycznych.”** `(kotwica: Karta prawdy — funkcja według producenta i zakaz obietnic medycznych)`
  - Karta 3: **„Panel dotykowy LED”**  
    **„Owalny przycisk i panel dotykowy umożliwiają start jednym dotknięciem.”** `(kotwica: Karta prawdy — budowa i galeria)`
  - Karta 4: **„USB-C”**  
    **„Urządzenie jest ładowane przez USB-C.”** `(kotwica: Karta prawdy — tytuł aukcji)`
  - Nota: **„Nie podajemy mocy, skuteczności procentowej ani czasu rozmrażania, ponieważ dostępne materiały nie zawierają takich danych.”** `(kotwica: Karta prawdy — twarde zakazy)`
- **Układ:** cztery jasne karty 2×2 desktop i pionowy stack mobile; ikony jednoliniowe 1,75 px wyłącznie w `--ink`.
- **Rola grafiki:** cropy realnego packshotu pokazujące moduł, panel, radiator i płytę; żadnych błysków UVC, cząstek plazmy ani aureoli.
- **CTA:** brak.

### `wideo`

- **Cel:** wykorzystać format zgodny ze źródłem ruchu bez udawania opinii klientów.
- **Treść:**
  - Eyebrow: **„ZOBACZ W PIONIE”**
  - H2: **„Pięć krótkich klipów. Jeden produkt.”** `(kotwica: materiał wideo — 5 klipów TikTok)`
  - Sub: **„Przesuń rail i odtwórz wybrany materiał.”**
  - Etykiety: **„Klip 1” · „Klip 2” · „Klip 3” · „Klip 4” · „Klip 5”**
  - Sterowanie: **„Odtwórz” · „Wycisz” · „Włącz dźwięk” · „Napisy”**
- **Układ:** poziomy rail 9:16 z pierwszą kartą widoczną w całości i fragmentem kolejnej; desktop pokazuje trzy karty, mobile 1,15 karty.
- **Rola grafiki:** sekcja zbudowana z pięciu self-hosted plików, posterów WebP/AVIF, natywnych controls, napisów WebVTT i lazy-loadu kolejnych klipów.
- **CTA:** po ostatniej karcie: **„Przejdź do zamówienia”**, scroll do `#zamow`.

### `mid-cta`

- **Cel:** przechwycić użytkowników przekonanych po demonstracji, pojemności i wideo.
- **Treść:**
  - Eyebrow: **„PLAN NA ZAMROŻONE PORCJE”**
  - H2: **„Daj rozmrażaniu własne miejsce.”**
  - Sub: **„Elektryczny box z komorą 4,2 L, dotykowym startem i tacką ociekową.”** `(kotwica: Karta prawdy — typ produktu, pojemność, panel i tacka)`
  - Cena: **„289,00 zł”** `(kotwica: Karta prawdy — cena stała)`
  - CTA: **„Zamawiam Rozmrozik”**
  - Redukcja ryzyka: **„Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot”** `(kotwica: Karta prawdy — płatności i zwrot)`
- **Układ:** szeroka jasna karta z tekstem po lewej i izolowanym produktem po prawej; mobile jako jeden zwarty blok.
- **Rola grafiki:** packshot wycięty na przezroczystości, bez generowanego jedzenia i bez dodatkowych funkcji.
- **Sygnatura:** pasek odwilży oraz duże `4,2 L · 4 steki` w tle typograficznym.
- **CTA:** scroll do `#zamow`.

### `faq`

- **Cel:** odpowiedzieć na główne obiekcje bez dopowiadania brakujących parametrów.
- **Treść:**
  - Eyebrow: **„BEZ DROBNEGO DRUKU”**
  - H2: **„Pytania przed zamówieniem.”**
  - **„Jak szybko rozmraża?”**  
    **„Nie podajemy czasu rozmrażania, ponieważ dostępne materiały nie zawierają danych, które pozwalają uczciwie go zadeklarować.”** `(kotwica: Karta prawdy — zakaz podawania czasów)`
  - **„Czy to nie kolejny gadżet?”**  
    **„To urządzenie o jednym konkretnym zadaniu: rozmrażaniu żywności; składa się z płaskiej tacy-bazy, kopuły i zdejmowanego modułu na szczycie.”** `(kotwica: Karta prawdy — produkt i budowa)`
  - **„Ile mieści?”**  
    **„Komora ma 4,2 L i mieści jednocześnie 4 steki lub 4 porcje ryby.”** `(kotwica: Karta prawdy — galeria)`
  - **„Co dzieje się z wodą?”**  
    **„Wodę zbiera tacka ociekowa wykonana z ABS.”** `(kotwica: Karta prawdy — galeria i diagram)`
  - **„Co oznaczają plazma i UVC?”**  
    **„Producent opisuje funkcje jako „Plasma Locking” oraz „UVC Antibacterial”; nie komunikujemy sterylizacji, skuteczności procentowej ani działania medycznego.”** `(kotwica: Karta prawdy — funkcje producenta i zakazy)`
  - **„Jak uruchamia się urządzenie?”**  
    **„Jednym dotknięciem panelu LED.”** `(kotwica: Karta prawdy — galeria)`
  - **„Jaki kolor otrzymam?”**  
    **„Sprzedajemy wariant czarny — dokładnie ten, który widzisz na zdjęciach.”** `(kotwica: Karta prawdy — warianty; decyzja: tylko konfiguracja z dowodem wizualnym)`
  - **„Jak mogę zapłacić?”**  
    **„Przy odbiorze albo przez BLIK/online.”** `(kotwica: Karta prawdy — płatności)`
  - **„Czy mogę zwrócić produkt?”**  
    **„Na zwrot masz 14 dni.”** `(kotwica: Karta prawdy — zwrot)`
- **Układ:** dostępny accordion; pierwszy element dotyczący czasu otwarty domyślnie, pozostałe zamknięte.
- **Rola grafiki:** brak sceny; sekcja budowana z tekstu, dividerów i chevronów w `--ink`.
- **CTA:** pod accordionem cena **„289,00 zł”**, następnie **„Przejdź do zamówienia”**, a pod nim **„14 dni na zwrot”**.

### `zamow`

- **Cel:** zakończyć zakup bez przekierowania, z czytelnym wyborem płatności i pełnym podsumowaniem.
- **Treść:**
  - Eyebrow: **„ZAMÓWIENIE”**
  - H2: **„Rozmrozik”**
  - Opis: **„Elektryczny box do rozmrażania żywności z komorą 4,2 L, kopułą PS, aluminiową płytą i tacką ociekową ABS.”** `(kotwica: Karta prawdy — produkt, pojemność i materiały)`
  - Cena produktu: **„289,00 zł”** `(kotwica: Karta prawdy — cena stała)`
  - Kolor: **„Czarny”** (bez wyboru — sprzedajemy wyłącznie wariant z dowodem wizualnym; decyzja w LEDGER)
  - Płatność: **„Płatność przy odbiorze” / „BLIK lub płatność online”** `(kotwica: Karta prawdy — płatności)`
  - Pola: **„Imię i nazwisko” · „Telefon” · „E-mail” · „Ulica i numer” · „Kod pocztowy” · „Miejscowość”**
  - Nota dostawy: **„Koszt dostawy i pełną kwotę zobaczysz w podsumowaniu przed złożeniem zamówienia.”**
  - Finalna cena: **„Do zapłaty: [produkt 289,00 zł + wybrana dostawa]”**
  - CTA prawne: **„Zamawiam z obowiązkiem zapłaty”**
  - Redukcja ryzyka: **„14 dni na zwrot”** `(kotwica: Karta prawdy — zwrot)`
  - Pas zaufania: **„COD” · „BLIK/online” · „14 dni na zwrot”**
- **Układ:** mobile: produkt → wariant → dane → dostawa → płatność → podsumowanie → CTA; desktop: formularz 7/12 i sticky summary 5/12.
- **Rola grafiki:** crop-first z packshotu; wyłącznie wariant czarny, miniatura powtarzana w podsumowaniu.
- **CTA:** wysyła zamówienie dopiero po walidacji, akceptacji wymaganych zgód i pokazaniu pełnej kwoty.

### `final`

- **Cel:** dać ostatnią szansę powrotu do checkoutu bez tworzenia presji.
- **Treść:**
  - Eyebrow: **„NA KOLEJNE 16:30”**
  - H2: **„Każdemu zdarza się zapomnieć. Dobrze mieć plan.”** `(kotwica: ICP — ton odciążający winę i scenariusz)`
  - Sub: **„Rozmrozik to osobny box do rozmrażania z komorą 4,2 L, startem jednym dotknięciem i tacką zbierającą wodę.”** `(kotwica: Karta prawdy — produkt, pojemność, panel i tacka)`
  - Cena: **„289,00 zł”** `(kotwica: Karta prawdy — cena stała)`
  - CTA: **„Wracam do zamówienia”**
  - Redukcja ryzyka: **„Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot”** `(kotwica: Karta prawdy — płatności i zwrot)`
- **Układ:** jasny finał edytorialowy; scena zajmuje około 55%, oferta 45%, a mobile pokazuje najpierw copy i CTA.
- **Rola grafiki:** spokojna kuchnia wczesnym wieczorem, produkt statyczny na blacie, patelnia obok i ręka odkładająca szczypce; bez szronu.
- **Sygnatura:** pasek odwilży i zamykające `4,2 L · 4 steki`.
- **CTA:** scroll do początku formularza `#zamow`, zachowując już wpisane dane.

## GRAFIKI

**Typy osadzenia:**  
**A** — scena środowiskowa edge-to-edge; **B** — scena w edytorialnej ramie 24 px; **C** — izolowany produkt lub detal na jasnym tle.

1. **`G-HERO-FROZEN` — lewy kadr dyptyku**
   - Opis: prawdziwa polska kuchnia około 16:30, zamrożony stek ze szronem na jasnej desce, chłodne światło z okna, bez produktu.
   - Osadzenie: **B**.
   - Desktop: 4:5, crop z miejscem po prawej na linię podziału.
   - Mobile: 3:4, centralny stek i czytelny szron.

2. **`G-HERO-THAWED` — prawy kadr dyptyku i pętla wideo**
   - Opis: wierny Rozmrozik z porcjami mięsa pod kopułą, patelnia w drugim planie, para znad kubka i falująca zasłona; produkt, panel i żywność pozostają statyczne.
   - Osadzenie: **B**.
   - Desktop: 4:5, produkt w dolnych 60% kadru.
   - Mobile: 3:4, kopuła i moduł w pełni widoczne.
   - Multi-ref: packshot jako główna referencja konstrukcji.

3. **`G-PROBLEM-1630`**
   - Opis: szersza scena kuchni z miską ciepłej wody (z parą) w zlewie i mikrofalą w tle; NASZ PRODUKT NIGDZIE W KADRZE (scena „przed"); szron tylko na zamrożonej porcji.
   - Osadzenie: **A**.
   - Desktop: 16:10 z bezpiecznym polem na copy po lewej.
   - Mobile: 4:5 z produktem i zlewem w jednej osi.

4. **`G-DEMO-PLACE`**
   - Opis: widok 3/4, dokładnie odwzorowana baza i dłoń kładąca zamrożoną porcję na aluminiowej płycie.
   - Osadzenie: **B**.
   - Desktop: 4:3.
   - Mobile: 1:1.
   - Multi-ref: packshot.

5. **`G-DEMO-COVER`**
   - Opis: identyczny kadr jak poprzednio, dłoń opuszcza transparentną kopułę PS; moduł na szczycie zgodny z packshotem.
   - Osadzenie: **B**.
   - Desktop: 4:3.
   - Mobile: 1:1.

6. **`G-DEMO-TOUCH`**
   - Opis: identyczny kadr, kopuła zamknięta, palec dotyka panelu LED; bez promieni, plazmy i sztucznego świecenia żywności.
   - Osadzenie: **B**.
   - Desktop: 4:3.
   - Mobile: 1:1.

7. **`G-CAPACITY-STEAK`**
   - Opis: widok z góry z dokładnie czterema stekami rozmieszczonymi pod kopułą; płyta i koncentryczne perforacje pozostają widoczne.
   - Osadzenie: **B**.
   - Desktop: 5:4.
   - Mobile: 1:1.
   - Multi-ref: packshot oraz diagram pojemności.

8. **`G-CAPACITY-FISH`**
   - Opis: bliźniaczy kadr z dokładnie czterema porcjami ryby, bez dodatkowej żywności i bez sugerowania większej pojemności.
   - Osadzenie: **B**.
   - Desktop: 5:4.
   - Mobile: 1:1.

9. **`G-FUNCTION-MACROS`**
   - Opis: cztery cropy: radiator, panel LED z owalnym przyciskiem, perforowana płyta i krawędź kopuły.
   - Osadzenie: **C**.
   - Desktop: 1:1 na kartę.
   - Mobile: 4:3.
   - **Crop-first z rzeczywistego packshotu.**

10. **`G-MID-PACKSHOT`**
    - Opis: oczyszczony wariant czarny na transparentnym tle z zachowaniem naturalnych odbić kopuły (crop-first z g0, biel→alpha).
    - Osadzenie: **C**.
    - Desktop: 4:3.
    - Mobile: 1:1.

11. **`G-FINAL-EVENING`**
    - Opis: wczesny wieczór w kuchni, ciepłe światło; Rozmrozik spokojnie stoi na blacie (statyczny), obok patelnia z delikatnym dryfem ciepłego powietrza (haze), ręka odkłada szczypce; niski kąt blatu; bez szronu.
    - Osadzenie: **B** (pełny kadr w ramie, strona LEWA).
    - Desktop: 3:2. Mobile: 4:5.
    - Multi-ref: packshot g0.

12. **Crop-first (bez generacji):** `G-FUNCTION-MACROS` (4 cropy z g0: moduł/panel/płyta/kopuła) · `G-MID-PACKSHOT` (g0 → alpha) · miniatura checkoutu (g0) · poster-y wideo = własne klatki klipów TikTok (self-host).

## FUNKCJE KONWERSJI

- Sticky-buy (moduł `sticky-buy@1`): pasek mobile po hero, chowany nad `#zamow`.
- Interakcja flagowa (TOR-I `jak-dziala`): 3 stany połóż→przykryj→dotknij sterowane segmentami; scena podmienia się crossfade; test stanów SSIM<0.85 między stanami.
- Toggle `pojemnosc`: steki ↔ ryba (2 kadry, crossfade; etykieta ink, nie akcent).
- Count-up: TYLKO liczby z Karty (4,2 L · 4) przy wejściu sekcji `pojemnosc` w viewport.
- Mikrointerakcje: CTA press ~0.97, reveal 200–400 ms stagger, `prefers-reduced-motion` = off.
- Hero-video (F5.2/ANIM-3): pętle Kling dla hero + problem + final (nośniki wg PRZEWODNIKA).
- CTA mobile → formularz: interceptor `a[href="#zamow"]` scrolluje do `.zc-form` (LL-052).

## RYZYKA

1. EMOCJA↔PRODUKT: produkt NIGDY w scenie problemu (seed z NEG „no defrosting box anywhere in frame", ref = styl-master).
2. Wierność bryły: kopuła+moduł+perforacja płyty = cechy dyskryminujące; multi-ref g0 w każdej scenie z produktem; F3A 2 pary oczu.
3. Uczciwość: zero czasów/mocy/wymiarów; plazma/UVC zawsze „wg producenta"; zero social-proof liczbowego; zero „food-grade".
4. White-label: żadnego „KAYUSO"; NEG w każdym seedzie.
5. Warianty: sprzedajemy WYŁĄCZNIE wariant CZARNY (biały bez dowodu wizualnego w galerii — decyzja wykonawcza w LEDGER; FAQ mówi wprost, checkout bez wyboru koloru).
6. Kadry g6/g7 (pasywna taca = inny produkt) nie istnieją dla tego landingu. 