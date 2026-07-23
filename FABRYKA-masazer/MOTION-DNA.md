## MOTION-DNA

Ruch Rozgrzewka zachowuje się jak ciepło: zaczyna blisko źródła i miękko promieniuje na zewnątrz.  
Wejścia są spokojne, krótkodystansowe i kończą się bez odbicia, aby nie zmieniać wieczornego rytuału w demonstrację technologii.  
Najpierw ujawnia się produkt i sens oferty, potem detal, a ruch nigdy nie opóźnia ceny ani CTA dłużej niż 340 ms.  
Akcenty wykonują jeden przebieg i zatrzymują się; nie ma pętli, parallaxu, scroll-jackingu ani dekoracyjnego dryfowania.  
Czasy są o około 15–25% wolniejsze od standardowego performance UI, ponieważ marka ma komunikować rozgrzewanie i spokój, ale mikrofeedback pozostaje poniżej 200 ms.

| Token | Wartość | Użycie |
|---|---:|---|
| `--dur-xs` | 180 ms | Press, focus halo, chevron, komunikat błędu |
| `--dur-s` | 320 ms | Sticky-buy, aktywna dioda, małe elementy |
| `--dur-m` | 560 ms | Standardowy reveal, packshot, karty |
| `--dur-l` | 900 ms | Jedyny count-up „9”, pojedynczy akcent narracyjny |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Wszystkie wejścia i puszczenie przycisku |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Wyjście panelu TOR-I i zmiana FAQ |
| `--ease-press` | `cubic-bezier(0.20, 0, 0, 1)` | Reakcja na tap/click |
| `--enter-y-xs` | 8 px | Teksty, pigułki, odpowiedzi FAQ |
| `--enter-y-s` | 12 px | Standardowy reveal kart i zdjęć |
| `--enter-y-max` | 24 px | Maksymalny dopuszczalny dystans; nie przekraczać |
| `--enter-scale` | `0.975 → 1` | Tylko packshoty i całe moduły, nigdy crop zdjęcia |
| `--stagger` | 70 ms | Kolejne elementy grupy; maksimum 4 elementy w jednej sekwencji |
| `--io-default` | threshold `0.18`, rootMargin `0 0 -12% 0` | Standardowy reveal |
| `--io-large` | threshold `0.10`, rootMargin `0 0 -8% 0` | Wysokie moduły, formularz i duże zdjęcia |
| `--io-accent` | threshold `0.35`, rootMargin `0 0 -15% 0` | Kręgi ciepła |
| Reguła akcentu | 1 aktywny akcent na viewport | Count-up, kręgi lub reakcja TOR-I nie mogą wykonywać się równocześnie |

Zwykłe reveale są warstwą porządkującą, nie akcentem. Interakcja użytkownika ma priorytet: tapnięcie TOR-I lub CTA wstrzymuje oczekujący akcent dekoracyjny do końca mikrointerakcji. Oczekujący akcent może zostać opóźniony maksymalnie o 600 ms; jeśli jego element przestał być widoczny, należy od razu ustawić stan końcowy bez odtwarzania animacji poza viewportem.

## SPEC PER SEKCJA

**1. Hero**

- **Trigger:** pierwszy render po aktywacji warstwy motion, bez IO; start najpóźniej 120 ms po pierwszym paint. Wszystkie trzy warianty `?h=` mają identyczną choreografię.
- **Wejście:**
  1. Pole koloru i eyebrow: `opacity 0 → 1`, `translateY(8 px → 0)`, 320 ms.
  2. Packshot: start `+40 ms`, `opacity 0 → 1`, `scale 0.975 → 1`, 560 ms.
  3. H1 i body pod produktem: start `+110 ms`, `opacity 0 → 1`, `translateY(12 px → 0)`, 560 ms.
  4. Cena: start `+180 ms`, `opacity 0 → 1`, `translateY(8 px → 0)`, 320 ms.
  5. CTA i elementy ryzyka: start `+250 ms`, stagger 70 ms, 320 ms.
- **Mikrointerakcje:** CTA według wspólnej specyfikacji. Sticky-buy pojawia się dopiero po pełnym opuszczeniu `.hero`.
- **Sticky trigger:** obserwacja `.hero`, threshold `0`; pasek wchodzi, gdy dolna krawędź hero minie górną krawędź viewportu. Wejście od dołu: `translateY(110% → 0)`, `opacity 0 → 1`, 320 ms.
- **Nie animować:** packshotu po zakończeniu wejścia, ceny cyframi, tła w pętli, kręgów w pętli, gradientów, scrollowania ani wariantu hooka przy zmianie historii przeglądarki.

**2. Moment**

- **Trigger:** osobne cele IO dla bloku tekstowego i sceny, threshold `0.18`.
- **Wejście:** H2 560 ms z `translateY(12 px → 0)`. Body zaczyna `+70 ms`; cały akapit jest jednym elementem, bez animowania słów lub linii. Scena wchodzi równolegle od `+90 ms`: `opacity 0 → 1`, `translateY(12 px → 0)`, 560 ms.
- **Mikrointerakcje:** brak interakcji na zdjęciu. Pierwsze zdanie body ma pojawić się razem z całym akapitem, aby hak napięcia był od razu czytelny.
- **Nie animować:** cropu, twarzy, dłoni, masażera na ramieniu, zoomu obrazu, filtrów ani pozornego „oddychania” zdjęcia.

**3. Tryby — TOR-I**

- **Trigger wejścia:** threshold `0.18`; heading, opis i cały moduł TOR-I kolejno co 70 ms. Domyślny stan „Ciepło” jest już ustawiony przed ujawnieniem modułu.
- **Wejście:** moduł jako jedna bryła: `opacity 0 → 1`, `translateY(12 px → 0)`, 560 ms. Nie odtwarzać automatycznie kolejnych trybów.
- **Sekwencja zmiany stanu po tapnięciu zakładki:**
  1. `0–90 ms`: wciśnięta zakładka `scale 1 → 0.985`.
  2. `0–120 ms`: bieżący panel `opacity 1 → 0`, `translateY(0 → -4 px)`.
  3. W `120 ms`: atomowa zmiana aktywnej zakładki, treści oraz diody.
  4. `120–380 ms`: nowy panel `opacity 0 → 1`, `translateY(6 px → 0)`, 260 ms.
  5. Zakładka wraca do `scale 1` w 180 ms.
- **Aktywna zakładka:** kolor ink `#2E46C8` przełącza się natychmiast w momencie atomowej zmiany. Jej aktywny znacznik pojawia się przez `opacity 0.4 → 1` i `scaleX(0.72 → 1)`, 180 ms. Znacznik starej zakładki znika natychmiast, więc nigdy nie ma dwóch aktywnych.
- **Diody:**
  - Ciepło: `#D84A43`.
  - Wibracje: `#2E46C8`.
  - EMS: `#3D8F66`.
  - Nieaktywne rdzenie: neutralny kolor bieżącego projektu, bez kolorowego halo.
  - Przy zmianie stanu stara dioda gaśnie natychmiast. Nowa od razu otrzymuje aktywny kolor, a jej osobna warstwa halo przechodzi `opacity 0 → 1` przez 320 ms.
  - W DOM i wizualnie może istnieć dokładnie jedna aktywna dioda. Nie stosować crossfade’u dwóch kolorowych diod.
- **Szybkie kolejne tapnięcia:** przed momentem atomowej zmiany zastąpić oczekujący cel najnowszym wyborem. Po zmianie przerwać bieżące wejście i przejść do najnowszego trybu bez kolejki animacji.
- **Klawiatura:** strzałki lewo/prawo zmieniają zakładkę, Home/End wybierają pierwszą/ostatnią, Enter i Spacja aktywują. Focus pozostaje na wybranej zakładce.
- **Duża liczba „9”:** jedyny count-up na stronie, `1 → 9`, 900 ms, bez liczb dziesiętnych. Trigger na jej własnym elemencie przy threshold `0.60`; jedna realizacja, bez replay przy scrollu wstecz.
- **TEST STANÓW:** po 500 ms od wyboru wykonać screenshot ROI obejmujący rząd zakładek, diody i panel trybu. Każda para Ciepło/Wibracje/EMS ma osiągnąć `SSIM < 0.90` na 390 i 1280 px. Wynik `≥0.90`, więcej niż jedna aktywna dioda albo stan oparty wyłącznie na kolorze blokują publikację.
- **Nie animować:** całej sekcji między trybami, wysokości kontenera, tła strony, automatycznego karuzelowania trybów ani migania diod.

**4. Głowica**

- **Trigger:** kręgi mają własny IO `--io-accent`; uruchomienie raz, gdy minimum 35% sygnatury jest widoczne.
- **Wejście treści:** H2 i opis standardowo 560 ms, stagger 70 ms.
- **Animacja kręgów ciepła:** wyłącznie `transform + opacity` na trzech istniejących grupach SVG; bez animowania stroke.
  - Wspólny transform-origin: geometryczny środek sygnatury.
  - Łuk wewnętrzny: start `0 ms`, `scale 0.86 → 1`, `opacity 0 → 0.55`, 560 ms.
  - Łuk środkowy: start `+110 ms`, `scale 0.86 → 1`, `opacity 0 → 0.72`, 560 ms.
  - Łuk zewnętrzny w `#2E46C8`: start `+220 ms`, `scale 0.86 → 1`, `opacity 0 → 1`, 560 ms.
  - Easing wszystkich łuków: `--ease-out`.
  - Cały przebieg trwa 780 ms, kończy się stanem statycznym i nigdy się nie zapętla.
- **Produkt/zdjęcie:** od początku w stanie końcowym, bez fade’u, przesunięcia, skali, zoomu lub pulsu.
- **Nie animować:** żadnej liczby, kulek głowicy, cropu, odbić na stali ani obrotu urządzenia.

**5. Obszary**

- **Trigger:** każdy kafel ma własny IO threshold `0.18`; kafle widoczne jednocześnie tworzą grupę.
- **Wejście:** H2 i opis standardowo. Kafle: `opacity 0 → 1`, `translateY(12 px → 0)`, 560 ms, stagger 70 ms.
- **Kolejność:** mobile zgodnie z kolejnością DOM od góry; desktop: lewy górny, prawy górny, lewy dolny, prawy dolny. Elementy poza viewportem czekają na własny IO.
- **Mikrointerakcje:** tylko jeśli kafel jest faktycznym linkiem, może otrzymać zachowanie interaktywnej karty. Kafel bez linku pozostaje nieruchomy po reveal.
- **Nie animować:** części ciała, cropów, masek mozaiki, zoomu zdjęć ani naprzemiennego przesuwania kafli z różnych stron.

**6. Autonomia**

- **Trigger:** heading threshold `0.18`; każda karta własny IO.
- **Wejście:** karty `opacity 0 → 1`, `translateY(12 px → 0)`, 560 ms, stagger 70 ms, maksimum 4 karty w jednej sekwencji.
- **Liczby:** `~3 h`, `~50 min` i `ok. 30 min` pojawiają się od razu w wartości końcowej. Nie są count-upami.
- **Mikrointerakcje:** karty informacyjne bez linków nie reagują na hover ani tap.
- **Nie animować:** przybliżonych wartości, ikon ładowania, zegara/timera, oznaczeń materiałowych i certyfikacyjnych. Count-up sugerowałby nieistniejącą dokładność pomiaru.

**7. Zdjęcia kupujących**

- **Trigger:** każdy kafel threshold `0.18`.
- **Wejście:** `opacity 0 → 1`, `translateY(8 px → 0)`, 560 ms, stagger 70 ms.
- **Mikrointerakcje:** jeśli kafle nie otwierają istniejącego lightboxa lub linku, po reveal pozostają całkowicie statyczne. Jeśli są linkami, stosować spec interaktywnej karty bez zoomowania samego zdjęcia.
- **Nie animować:** filtrów, ziarna, cropu, symulowanego nagrywania, ikon play bez funkcji, automatycznej karuzeli ani sztucznego drżenia telefonu.

**8. Mid-CTA**

- **Trigger:** threshold `0.18`.
- **Wejście:** packshot `opacity 0 → 1`, `scale 0.975 → 1`, 560 ms. Copy startuje `+70 ms`, cena `+140 ms`, CTA `+210 ms`, pigułki ryzyka kolejno co 70 ms.
- **Mikrointerakcje:** CTA według wspólnej specyfikacji. Wszystkie pigułki są statycznymi komunikatami, nie przyciskami.
- **Nie animować:** ceny `84,90 zł`, pigułek w pętli, produktu po wejściu, efektu połysku przejeżdżającego przez CTA ani fałszywego odliczania.

**9. FAQ**

- **Trigger wejścia:** heading threshold `0.18`; każdy wiersz pytania własny IO threshold `0.12`. Stagger maksymalnie czterech aktualnie widocznych wierszy: 45 ms.
- **Stan początkowy:** pierwsze pytanie otwarte przed pierwszym paint; nie wykonywać animacji automatycznego otwierania.
- **Otwieranie:** przestrzeń odpowiedzi jest udostępniana natychmiast, bez animowania wysokości. Treść odpowiedzi: `opacity 0 → 1`, `translateY(-4 px → 0)`, 220 ms. Chevron obraca się `0 → 180°`, 180 ms.
- **Zamykanie:** odpowiedź `opacity 1 → 0`, `translateY(0 → -4 px)`, 140 ms; po zakończeniu następuje natychmiastowe zwinięcie przestrzeni. Przy zmianie pytania zamknięcie starego i otwarcie nowego zaczynają się jednocześnie.
- **Mikrointerakcje:** cały nagłówek pytania jest obszarem kliknięcia. Enter i Spacja wykonują tę samą akcję co tap.
- **Nie animować:** `height`, `max-height`, `grid-template-rows`, tekstu linia po linii ani wielu odbić chevronu.

**10. Zamów**

- **Trigger:** ze względu na wysokość formularza `--io-large`, threshold `0.08`.
- **Wejście:** heading i otoczenie 560 ms. Cała `.zc-form` pojawia się jako jeden element: `opacity 0 → 1`, `translateY(8 px → 0)`, 560 ms, start `+100 ms`. Nie staggerować pól.
- **Sticky-buy:** drugi IO obserwuje `#zamow`, threshold `0`, rootMargin `0 0 -20% 0`. Gdy górna krawędź sekcji wejdzie w dolne 80% viewportu, pasek wychodzi w dół przez 240 ms i pozostaje ukryty również po przewinięciu poniżej sekcji. Przy scrollu w górę wraca dopiero po wyjściu `#zamow` poniżej tej linii, o ile hero nadal jest opuszczone.
- **Pola:** focus i walidacja według wspólnej specyfikacji.
- **Submit:** press `scale 1 → 0.985` przez 90 ms. Stan oczekiwania może zostać pokazany wyłącznie po otrzymaniu istniejącego stanu pending/disabled z logiki checkoutu; zawartość przycisku przechodzi wtedy do `opacity 0.65` w 180 ms. Sukces lub błąd korzysta wyłącznie z istniejących komunikatów, ujawnianych przez `opacity + translateY(4 px → 0)`, 180 ms.
- **Nie animować:** wysokości formularza, kolejnych pól, podsumowania ceny, metod płatności ani treści labeli. Motion nie może przechwytywać submitu, zmieniać requestu, walidacji, disabled, redirectu ani kolejności pól.

**11. Final**

- **Trigger:** threshold `0.15`.
- **Wejście:** ciepły kadr `opacity 0 → 1`, 560 ms, bez skali. Copy start `+90 ms`, CTA `+180 ms`, oba z `translateY(12 px → 0)`.
- **Mikrointerakcje:** ostatnie CTA korzysta ze wspólnej specyfikacji i prowadzi do `.zc-form`. Footer jest od początku statyczny.
- **Nie animować:** zdjęcia po wejściu, footeru, znaków prawnych, tła ani ponownego pojawiania się sticky-buy poniżej `#zamow`.

## ZESTAW OBOWIĄZKOWY

**Scroll-reveal**

- Mechanizm: wyłącznie IntersectionObserver; bez listenera scroll wykonującego animację.
- Elementy są widoczne domyślnie. Stan ukryty wolno zastosować dopiero po potwierdzeniu aktywnego JS i braku `prefers-reduced-motion`.
- Każdy reveal wykonuje się raz na załadowanie strony. Scroll wstecz nie resetuje elementu.
- Standard: `opacity 0 → 1`, `translateY(12 px → 0)`, 560 ms.
- Stagger: 70 ms, maksymalnie 4 elementy. Kolejne elementy czekają na własne wejście do viewportu.
- Jeśli element wszedł i opuścił viewport przed uruchomieniem oczekującego akcentu, ustawić od razu stan końcowy.
- Nie stosować reveal dla każdego słowa, pojedynczej ikony, footeru i każdego pola formularza.

**Count-up**

- Jedyny count-up: duża liczba poziomów intensywności `1 → 9`.
- Czas: 900 ms; easing `--ease-out`; tylko całkowite wartości, bez miejsc dziesiętnych.
- Trigger: 60% widoczności elementu; wykonanie raz.
- Szerokość miejsca na cyfrę ma być stała, minimum `1ch`, aby nie wywołać CLS.
- Dla technologii asystujących komunikowana jest wyłącznie końcowa treść „9 poziomów intensywności”; zmiany pośrednie nie są `aria-live`.
- `~3 h`, `~50 min`, `ok. 30 min` oraz cena `84,90 zł` pozostają statyczne. Count-up przy wartościach przybliżonych sugerowałby precyzję, której oferta nie deklaruje.
- W sekcji głowicy nie występuje count-up ani animowany duży numer.

**Sticky-buy**

- Domyślnie ukryty w hero.
- Pojawia się po przejściu dolnej krawędzi `.hero` ponad górę viewportu.
- Wejście: od dołu, `translateY(110% → 0)`, `opacity 0 → 1`, 320 ms.
- Wyjście przy powrocie do hero: `translateY(0 → 110%)`, `opacity 1 → 0`, 240 ms.
- Wyjście przy `#zamow`: identyczne, uruchomione już przy wejściu sekcji w dolne 80% viewportu.
- Po minięciu `#zamow` w dół pasek pozostaje ukryty. Nie może wrócić w sekcji finalnej.
- Pasek jest warstwą fixed i nie rezerwuje ani nie zmienia miejsca w dokumencie; uwzględnia dolny `safe-area-inset`.
- Brak bounce’u, pulsu CTA, auto-hide zależnego od prędkości scrollowania i zmian wysokości paska.

## MIKROINTERAKCJE CTA/KART

| Element | Hover — tylko urządzenia z hover | Active/tap | Focus i stany |
|---|---|---|---|
| Główne CTA | `translateY(0 → -1 px)`, 180 ms; przygotowana warstwa rozjaśnienia `opacity 0 → 0.08` | `scale 1 → 0.985`, powrót do `translateY(0)`, 90 ms | Focus-visible: stały ring 2 px `#2E46C8`, offset 3 px, bez animacji |
| Sticky CTA | Jak główne CTA, bez zmiany wysokości paska | `scale 1 → 0.985`, 90 ms | Musi zachować widoczny focus nad paskiem |
| Link tekstowy | Podkreślenie przez `scaleX(0 → 1)` od lewej, 180 ms | `opacity 1 → 0.72`, 90 ms | Podkreślenie i focus nie mogą opierać się wyłącznie na kolorze |
| Interaktywna karta | Cała karta `translateY(0 → -2 px)`, 180 ms; statycznie przygotowany cień ujawniany przez opacity | `scale 1 → 0.99`, 90 ms | Focus-visible jak CTA, dopasowany do radiusu karty |
| Nieinteraktywna karta | Brak reakcji | Brak reakcji | Brak `cursor: pointer` i fałszywego affordance |
| Kafel UGC z linkiem | `translateY(0 → -2 px)`, 180 ms | `scale 1 → 0.99`, 90 ms | Bez zoomowania samego zdjęcia |
| Kafel UGC bez linku | Brak reakcji po reveal | Brak reakcji | Nie dodawać ikony play ani focusu |
| Pole formularza | Halo wrappera `opacity 0 → 1`, 180 ms; kolor obramowania zmienia się natychmiast | Bez skali całego pola | Focus-visible musi pozostać czytelny; nie przesuwać labela, jeśli obecnie jest statyczny |
| Checkbox/radio | Brak ruchu na hover poza istniejącym stanem | Kontrolka `scale 1 → 0.96 → 1`, 90 + 180 ms | Zaznaczenie zmienia się atomowo; focus ring bez animacji |
| Błąd pola | Nie dotyczy | Bez shake’u | Istniejący komunikat: `opacity 0 → 1`, `translateY(-4 px → 0)`, 180 ms |
| Submit pending | Brak dodatkowego hover | Press 90 ms; następnie tylko stan otrzymany z checkoutu | Zawartość przycisku do opacity `0.65`; bez zmiany tekstu przez warstwę motion |

Nie animować `box-shadow`, koloru, obramowania, gradientu ani filtra w czasie. Zmiany kolorystyczne są natychmiastowe, a miękkość zapewniają wyłącznie warstwy opacity i transform.

## INTERAKTYWNE DEMO KORZYŚCI

TOR-I oraz jednorazowa animacja kręgów ciepła są wystarczającym demo korzyści i nie wymagają nowych treści ani grafik.

- TOR-I pozwala użytkownikowi samodzielnie porównać Ciepło, Wibracje i EMS, czyli trzy najważniejsze funkcje produktu.
- Aktywna zakładka, zmieniona treść i dokładnie jedna właściwa dioda tworzą jednoznaczny feedback stanu.
- Kręgi tłumaczą promieniowanie ciepła bez technicznej wizualizacji i bez animowania samego urządzenia.
- Duża liczba „9” komunikuje zakres regulacji w jednym kontrolowanym akcencie.
- Nie dodawać suwaka temperatury, hotspotów na ciele, gestu scrub, symulacji masażu, autoplay, before/after ani kolejnego interaktywnego modułu. Na zimnym mobile zwiększyłoby to koszt poznawczy przed CTA.

## REDUCED-MOTION I BUDŻET

**`prefers-reduced-motion: reduce`**

- Wszystkie reveale od razu w stanie końcowym: `opacity 1`, transform neutralny.
- Kręgi ciepła są od razu w pełni widoczne; bez sekwencji wewnętrzny–zewnętrzny.
- Count-up od razu pokazuje `9`.
- TOR-I nadal zmienia treść, aktywną zakładkę i diodę — natychmiastowo, bez przejść
  (crossfade/slide wyłączone); funkcja pełna, redukowany jest wyłącznie RUCH.
- Sticky-buy pojawia się/znika bez animacji (visibility), te same progi IO.
- Akordeon FAQ rozwija się natychmiast; chevron bez animowanego obrotu.
- Klasa startowa reveal nadawana TYLKO gdy JS działa i media query reduced-motion
  NIE pasuje (guard w JS przy inicjalizacji IO, nie tylko w CSS) — brak JS lub
  reduced-motion ⇒ strona w 100% czytelna bez ruchu.

**Budżet wydajności**

- Animowane WYŁĄCZNIE `transform` i `opacity`; zakaz animowania height/width/top/margin;
  cień hover przez podmianę klasy (transition `box-shadow` 200 ms tylko poza scrollem).
- Akordeon FAQ: `grid-template-rows: 0fr → 1fr` (bez pomiaru wysokości w JS);
  wnętrze `overflow: hidden`.
- Kręgi ciepła: SVG `stroke-dashoffset` + `opacity` (GPU-friendly); jedna realizacja,
  `will-change` zdejmowane po `transitionend`.
- `will-change: transform, opacity` klasą, tylko na elementach w aktywnej sekwencji
  (limit ~6 naraz), nigdy globalnie.
- CLS = 0: sticky-buy `position: fixed`; wszystkie media z wymiarami/`aspect-ratio`;
  count-up „9” w kontenerze o stałej szerokości (`font-variant-numeric: tabular-nums`);
  reveal startuje z transform, nigdy z `display:none`.
- Jeden współdzielony IntersectionObserver dla reveali + osobny dla sticky-buy
  (drugi próg na `#zamow`); zero nasłuchu `scroll`; `once: true` odpina obserwację.
- Animacje niezależne od ładowania fontów (fallback metrics).

## TEST-PLAN

Lista kontrolna wdrożenia (1280×800 i 390×844, Chrome + emulacja touch):

1. **Stany TOR-I (tryby)** — screenshot KAŻDEJ z 3 zakładek na obu viewportach; SSIM
   między każdą parą stanów **< 0.9**; w każdym stanie DOKŁADNIE jedna dioda zapalona
   (czerwona/niebieska/zielona) i zgodna z trybem; treść karty zmieniona.
2. **Kręgi ciepła (glowica)** — animacja odpala raz przy wejściu w viewport; produkt
   i zdjęcie statyczne; po reduced-motion łuki od razu pełne.
3. **Count-up „9”** — odpala raz (threshold 0.60), 900 ms, kończy DOKŁADNIE na „9”;
   liczby przybliżone (`~3 h`, `~50 min`, `ok. 30 min`) NIE animują się nigdzie.
4. **Reveal-audyt** — po pełnym scrollu `document.querySelectorAll('.reveal:not(.in)')`
   = 0; nic nie odtwarza się przy scrollu w górę.
5. **Sticky-buy** — pojawia się po opuszczeniu hero, znika nad `#zamow` (nie zasłania
   kasy); zero CLS (Layout Shift = 0 w Performance).
6. **Konsola** — 0 błędów/warningów po pełnym przejściu + interakcjach (obie szerokości).
7. **H-scroll** — `scrollWidth <= innerWidth` na 390 px.
8. **CLS** — Lighthouse/Performance: CLS = 0 po pełnym scrollu z animacjami.
9. **FPS** — nagranie Performance przy scrollu: brak long tasks > 50 ms z animacji;
   płynne 55–60 fps.
10. **Reduced-motion** — emulacja: pełna treść od razu, TOR-I działa bez przejść,
    count-up statyczny „9”, kręgi pełne, zero transformów.
11. **LL-052** — klik CTA hero/mid-cta/final prowadzi do `.zc-form`; sticky-buy nie
    zasłania formularza po dojściu; przy reduced-motion przejście natychmiastowe.