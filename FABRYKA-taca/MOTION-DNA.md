## MOTION-DNA

Ruch ma przypominać spokojne odmrażanie: element przechodzi z lekkiego bezwładu do pełnej czytelności, bez gwałtownego odbicia. Wejścia zaczynają się blisko pozycji końcowej, z obniżoną opacity i miękkim wyhamowaniem. Kierunek prowadzi od chłodu do ciepła oraz od informacji do działania, dlatego sekwencje kończą się na produkcie, cenie albo CTA. Sprężystość stosujemy wyłącznie do elementów dotykanych przez użytkownika i sticky-buy, nigdy do tekstu, zdjęć ani formularza. W jednym viewportcie może działać tylko jeden automatyczny akcent ruchu, a pozostałe elementy pozostają statyczne lub czekają na zakończenie sekwencji.

| Token / reguła | Wartość | Zastosowanie |
|---|---:|---|
| `--dur-xs` | `120ms` | tap, active, wyjście starego stanu |
| `--dur-s` | `220ms` | hover, focus halo, tekst akordeonu |
| `--dur-m` | `420ms` | standardowy scroll-reveal |
| `--dur-l` | `680ms` | duże sekwencje hero/final |
| `--ease-out` | `cubic-bezier(.22, 1, .36, 1)` | wejścia i wyhamowanie |
| `--ease-in-out` | `cubic-bezier(.65, 0, .35, 1)` | crossfade, wyjścia, chevron |
| `--ease-spring` | `cubic-bezier(.20, 1.24, .32, 1)` | sticky-buy i kontrolki po tapie |
| Wejście Y — mobile | `16px` | viewport do `767px` |
| Wejście Y — desktop | `24px` | viewport od `768px` |
| Wejście X — mobile | `12px` | zmiana stanów TOR-I |
| Wejście X — desktop | `18px` | zmiana stanów TOR-I |
| Stagger — mobile | `70ms` | karty, lista konkretów |
| Stagger — desktop | `90ms` | karty, lista konkretów |
| Domyślny IO | `threshold: 0.18`, `rootMargin: 0px 0px -8% 0px` | jednorazowe wejścia sekcji |
| IO małego elementu | `threshold: 0.35` | liczba, kafel mobilnego raila |
| Zasada powtórzeń | `once: true` | reveal nie odtwarza się po powrocie |
| Jeden akcent | maks. jedna automatyczna sekwencja na `700ms` | sticky ma pierwszeństwo przed reveal; interakcja użytkownika zawsze ma pierwszeństwo i kończy oczekujący reveal w stanie finalnym |

## SPEC PER SEKCJA

### 1. hero

**Trigger**

- Pierwsze renderowanie dokumentu, bez zależności od scrolla.
- Sekwencji nie odtwarzać po BFCache restore ani po powrocie do hero.
- Media dyptyku mają być widoczne od pierwszej klatki; nie czekać na JS ani zakończenie ładowania fontów.

**Wejście**

1. Nagłówek i lead: `translateY(10px) → 0`, `420ms`, `--ease-out`, start po `60ms`; opacity pozostaje `1`.
2. Thaw-line na granicy zamrożone/rozmrożone: `translateX(-18px) → 0` oraz `opacity: 0 → 1`, `420ms`, `--ease-out`, start po `120ms`.
3. Karta oferty jako jeden blok: `translateY(16px) → 0`, `opacity: 0 → 1`, `420ms`, `--ease-out`, start po `220ms`.
4. Cena, CTA i redukcja ryzyka nie animują się osobno — pozostają częścią karty, aby oferta była kompletna najpóźniej około `640ms` od startu.

**Mikrointerakcje**

- CTA według wspólnej specyfikacji przycisków.
- Kliknięcie CTA: `scale(0.98)` przez `120ms`; rozpoczęcie przejścia do zamówienia bez smooth-scroll wymuszanego przez motion.
- Sticky-buy: spec w sekcji „ZESTAW OBOWIĄZKOWY”.

**Nie animować**

- Zdjęć dyptyku, ceny i badge’y — zoom lub pulsowanie obniża wiarygodność oferty i opóźnia percepcję LCP.
- Nie wykonywać wipe’u zmieniającego szerokość obu połówek dyptyku.
- Nie dodawać ruchu ciągłego do thaw-line.

---

### 2. problem

**Trigger**

- Jednorazowy IO sekcji: `threshold: 0.18`.

**Wejście**

1. Nagłówek sekcji: `opacity: 0 → 1`, `translateY(16/24px → 0)`, `420ms`, `--ease-out`.
2. Scena 16:30 z mikrofalą: `opacity: 0 → 1`, `translateX(-12/18px → 0)`, `420ms`, start `90ms` po nagłówku.
3. Karty problemów: kolejno w porządku czytania, `opacity: 0 → 1`, `translateY(16/24px → 0)`, `420ms`, stagger `70ms` mobile / `90ms` desktop.
4. Ikona i tekst każdej karty wchodzą razem — bez osobnego staggeru wewnętrznego.

**Mikrointerakcje**

- Wyłącznie karty będące rzeczywiście klikalne otrzymują hover/focus według wspólnej specyfikacji.
- Karty informacyjne pozostają statyczne, żeby nie sugerować kliknięcia.

**Nie animować**

- Godziny `16:30`, cyfr mikrofalówki ani ikon w pętli.
- Nie stosować migania, alarmowego shake ani pulsowania — problem ma być rozpoznawalny, nie stresujący.

---

### 3. jak-dziala

**Trigger**

- Wejście całej sekcji: IO `threshold: 0.18`, tylko raz.
- Przejście między stanami: click/tap oraz istniejąca obsługa klawiatury TOR-I.

**Wejście sekcji**

1. Nagłówek: standardowy reveal `420ms`.
2. Kontrolki kroków jako jedna grupa: `opacity: 0 → 1`, `translateY(16/24px → 0)`, `420ms`, delay `90ms`.
3. Obszar demonstracji: ten sam reveal, delay `180ms`.
4. Nie staggerować trzech kontrolek osobno — użytkownik od razu ma widzieć pełny model interakcji.

**Przejścia stanów: połóż → przykryj → dotknij**

- Kierunek do następnego kroku:
  - stary panel: `opacity: 1 → 0`, `translateX(0 → -12/18px)`, `120ms`, `--ease-in-out`;
  - nowy panel zaczyna po `80ms`: `opacity: 0 → 1`, `translateX(12/18px → 0)`, `280ms`, `--ease-out`;
  - tekst nowego stanu: `opacity: 0 → 1`, `translateY(8px → 0)`, `220ms`, start po `100ms`.
- Kierunek do poprzedniego kroku: identyczne wartości, lecz znaki osi X odwrócone.
- Całkowity czas zmiany: `360ms`.
- Stary i nowy stan zajmują tę samą zarezerwowaną ramę; nie animować wysokości komponentu.
- Przy bardzo szybkich kliknięciach obowiązuje ostatni wybrany stan: bieżące przejście zostaje przerwane w aktualnej pozycji i prowadzi bezpośrednio do najnowszego stanu.

**Feedback kontrolek**

- Tap/active kontrolki: `scale(0.97)`, `120ms`, następnie `scale(1)`, `220ms`, `--ease-spring`.
- Marker poprzedniego kroku: `opacity: 1 → 0`, `120ms`.
- Marker nowego kroku: `opacity: 0 → 1`, `220ms`.
- Focus-visible: natychmiastowy ring, bez przesuwania kontrolki.

**TEST STANÓW**

- Wykonać osobny screenshot stanu „połóż”, „przykryj” i „dotknij” na `1280px` oraz `390px`.
- Screenshotować stały crop dynamicznego obszaru TOR-I, zawsze w tych samych wymiarach i po zakończeniu animacji.
- SSIM dla każdej pary stanów musi wynosić `< 0.90`.
- Sprawdzić również zmianę `1→3`, `3→1` oraz serię minimum `8` szybkich kliknięć.

**Nie animować**

- Mechaniki steppera, kolejności treści ani wymiarów layoutu.
- Nie dodawać automatycznego przełączania stanów ani timera.

---

### 4. pojemnosc

**Trigger**

- Nagłówek i scena: IO sekcji `threshold: 0.18`.
- Count-up: osobny IO liczby `threshold: 0.45`, jednorazowo.

**Wejście**

1. Nagłówek: standardowy reveal `420ms`.
2. Scena produktu: `opacity: 0 → 1`, `translateX(-12/18px → 0)`, `420ms`, delay `90ms`.
3. Blok liczby: wejście `opacity: 0 → 1`, bez translacji, `220ms`.
4. Konkrety „4 steki”, „4 porcje ryby”, tacka ociekowa: `translateY(12px → 0)`, `opacity: 0 → 1`, `420ms`, stagger `70/90ms`.
5. Count-up jest głównym akcentem tej sekcji; nie uruchamiać jednocześnie innych automatycznych akcentów.

**Count-up**

- Dokładna specyfikacja w „ZESTAW OBOWIĄZKOWY”.
- Cyfry mają używać stabilnej szerokości/tabular numbers, a kontener szerokości odpowiadającej finalnemu `4,2 L`.

**Mikrointerakcje**

- Brak interakcji na samej liczbie.
- Ewentualne klikalne konkrety używają standardu kart; statyczne konkrety nie reagują na hover.

**Nie animować**

- Skali dużej liczby, jednostki `L`, tacki ani zawartości sceny w pętli.
- Nie wykonywać efektu „wlewania” lub zmiany wysokości, bo sugerowałby mierzenie cieczy zamiast pojemności produktu.

---

### 5. funkcje

**Trigger**

- Wejście: IO `threshold: 0.18`, tylko raz.
- Toggle: click/tap oraz istniejąca obsługa klawiatury.

**Wejście**

1. Nagłówek: standardowy reveal `420ms`.
2. Karty funkcji: porządek czytania, `opacity: 0 → 1`, `translateY(16/24px → 0)`, `420ms`, stagger `70/90ms`.
3. Toggle i jego panel wchodzą jako jeden blok po kartach, delay `90ms`.

**Przejście toggle**

- Stary panel: `opacity: 1 → 0`, `translateY(0 → -6px)`, `140ms`, `--ease-in-out`.
- Nowy panel: start po `90ms`, `opacity: 0 → 1`, `translateY(6px → 0)`, `280ms`, `--ease-out`.
- Łączny czas: `370ms`.
- Panel stanu ma zajmować tę samą zarezerwowaną ramę; wysokość nie może być tweenowana.
- Marker wybranej opcji: stary `opacity → 0` w `120ms`, nowy `opacity → 1` w `220ms`.
- Tap kontrolki: `scale(0.97)` przez `120ms`, powrót `220ms`, `--ease-spring`.
- Przy szybkich zmianach obowiązuje ostatni wybór; brak kolejki animacji.

**TEST STANÓW**

- Wykonać screenshot każdego dostępnego stanu toggle na `1280px` i `390px`.
- Porównywać stały crop dynamicznego panelu po zakończeniu przejścia.
- SSIM pomiędzy każdą parą stanów musi być `< 0.90`.
- Sprawdzić minimum `10` szybkich przełączeń bez pustej klatki, nakładania tekstów i zmiany wysokości otoczenia.

**Mikrointerakcje**

- Tylko karty klikalne otrzymują hover/focus.
- Toggle ma focus-visible na każdej kontrolce i zawsze czytelny stan selected.

**Nie animować**

- Ikon USB-C, plazmy i UVC w pętli.
- Nie stosować glow, migotania ani „elektrycznych” efektów — produkt ma pozostać kuchenny, nie technologiczny.

---

### 6. wideo

**Trigger**

- Nagłówek: IO sekcji `threshold: 0.18`.
- Desktop: pięć kafli ujawnianych w jednej sekwencji.
- Mobile: każdy kafel ujawnia się tylko pierwszy raz, gdy osiągnie `threshold: 0.35` w poziomym railu.

**Wejście**

- Nagłówek: standardowy reveal `420ms`.
- Desktop: kafle od lewej do prawej, `opacity: 0 → 1`, `translateY(16px → 0)`, `420ms`, stagger `70ms`.
- Mobile: pierwszy widoczny kafel `420ms`; następne `opacity: 0 → 1`, `translateX(12px → 0)`, `220ms`.
- Nie przesuwać całego raila automatycznie.

**Mikrointerakcje**

- Hover kafla: kontener `translateY(-3px) scale(1.01)`, poster wewnętrzny `scale(1.02)`, `220ms`.
- Active/tap: `scale(0.985)`, `120ms`.
- Przycisk play: active `scale(0.92)`, `120ms`.
- Focus-visible obejmuje cały kafel.
- Po uruchomieniu wideo poster i ikona play przechodzą przez crossfade `220ms`.

**Nie animować**

- Auto-scrolla, autoplayu z dźwiękiem, zapętlonego kołysania kafli ani parallaxu.
- Peek `68%` na mobile pozostaje elementem layoutu, nie animacją.

---

### 7. mid-cta

**Trigger**

- IO `threshold: 0.25`, tylko raz.

**Wejście**

1. Cena: `opacity: 0 → 1`, `translateY(16/24px → 0)`, `420ms`.
2. CTA: ten sam ruch, delay `80ms`.
3. Redukcja ryzyka: `opacity: 0 → 1`, `translateY(10px → 0)`, `420ms`, delay `160ms`.
4. Całość jest jedną sekwencją akcentową.

**Mikrointerakcje**

- CTA według wspólnej specyfikacji.
- Tap nie uruchamia dodatkowego bounce po nawigacji do checkoutu.

**Nie animować**

- Ceny, przekreślonej ceny, gwarancji ani tekstu ryzyka jako count-up/puls.
- Nie stosować pulsującego CTA — pojedynczy czytelny reveal wystarcza.

---

### 8. faq

**Trigger**

- Wejście sekcji: IO `threshold: 0.18`.
- Rozwinięcie: click/tap/keyboard istniejącego akordeonu.

**Wejście**

- Nagłówek: standardowy reveal.
- Wiersze FAQ: `opacity: 0 → 1`, `translateY(12px → 0)`, `420ms`, stagger `50ms`, maksymalnie `6` animowanych wierszy; dalsze są od razu finalne.

**Rozwijanie**

- Nie animować `height`, `max-height` ani `grid-template-rows`.
- Przy otwarciu istniejąca mechanika ustawia geometrię natychmiast, a wewnętrzna treść przechodzi:
  - `opacity: 0 → 1`;
  - `translateY(-6px → 0)`;
  - `220ms`, `--ease-out`.
- Przy zamknięciu:
  - `opacity: 1 → 0`;
  - `translateY(0 → -4px)`;
  - `120ms`, `--ease-in-out`;
  - dopiero po `120ms` istniejąca mechanika usuwa otwartą przestrzeń.
- Chevron: `rotate(0deg → 180deg)`, `220ms`, `--ease-in-out`; przy zamknięciu odwrotnie.

**Mikrointerakcje**

- Hover nagłówka FAQ: `opacity: 1 → 0.82`, `220ms`.
- Active: cały trigger `scale(0.995)`, `120ms`.
- Focus-visible: natychmiastowy ring.

**Nie animować**

- Wysokości akordeonu, przesuwania całej strony podczas tweenowania ani odpowiedzi słowo po słowie.
- Nie zmieniać zasad jedno-/wielokrotnego otwarcia istniejącego komponentu.

---

### 9. zamow

**Trigger**

- IO `threshold: 0.12`, tylko raz.
- Jeżeli sekcja jest celem anchor linku, formularz ma być od razu widoczny i bez animacji wejścia.

**Wejście**

- Nagłówek i zewnętrzny shell formularza jako jeden blok: `opacity: 0 → 1`, `translateY(12px → 0)`, `300ms`, `--ease-out`.
- Wszystkie pola, etykiety i wartości są widoczne jednocześnie; brak staggeru.
- Jeśli przed zakończeniem wejścia fokus trafia do pola, animacja natychmiast przechodzi do stanu finalnego.

**Mikrointerakcje**

- Focus pól według wspólnej specyfikacji.
- Submit active: `scale(0.985)`, `120ms`.
- Pending:
  - etykieta przycisku `opacity: 1 → 0`, `120ms`;
  - istniejący spinner `opacity: 0 → 1`, `120ms`;
  - spinner `rotate(360deg)` co `720ms`, liniowo, tylko przez czas pending.
- Status sukcesu/błędu może wejść przez `opacity: 0 → 1`, `220ms`, bez translacji i bez zmiany logiki.

**Nie animować**

- Przejść między krokami formularza, walidacji, etykiet, błędnych pól ani automatycznego scrollowania.
- Nie opóźniać submitu i nie blokować kontrolek na czas animacji.
- Logika checkoutu pozostaje całkowicie nietykalna.

---

### 10. final

**Trigger**

- IO `threshold: 0.20`, tylko raz.

**Wejście**

1. Full-bleed media jest statyczne i widoczne od wejścia do viewportu.
2. Nagłówek: `opacity: 0 → 1`, `translateY(16/24px → 0)`, `420ms`, `--ease-out`.
3. Thaw-line: `scaleX(0 → 1)` z początkiem po stronie chłodnej, transform-origin po stronie chłodnej, `420ms`, delay `90ms`.
4. CTA: `opacity: 0 → 1`, `translateY(12px → 0)`, `420ms`, delay `180ms`.
5. Tekst redukcji ryzyka: `opacity: 0 → 1`, `220ms`, delay `270ms`.

**Mikrointerakcje**

- CTA według wspólnej specyfikacji.
- Kliknięcie: active `scale(0.98)`, bez dodatkowego efektu po przejściu do checkoutu.

**Nie animować**

- Tła full-bleed, kadru zdjęcia ani zoomu sceny.
- Nie dodawać śniegu, pary, cząsteczek lub nieskończonego ruchu thaw-line.

## ZESTAW OBOWIĄZKOWY

### Scroll-reveal

- Aktywowany wyłącznie po dodaniu klasy progresywnego ulepszenia przez JS; bez JS wszystkie treści pozostają widoczne.
- Domyślny trigger: IO `threshold: 0.18`, `rootMargin: 0px 0px -8% 0px`.
- Stan początkowy: `opacity: 0`, `translateY(16px)` mobile / `24px` desktop.
- Stan finalny: `opacity: 1`, `transform: none`, `420ms`, `--ease-out`.
- Karty ujawniać w porządku DOM: stagger `70ms` mobile / `90ms` desktop.
- Maksymalnie `6` elementów w staggerze; kolejne przechodzą do stanu finalnego razem z szóstym.
- Reveal odtwarza się tylko raz.
- Automatyczne sekwencje nie mogą się nakładać: sticky-buy ma pierwszeństwo, potem count-up/TOR-I, na końcu zwykły reveal.

### Count-up `4,2 L`

- Start: pierwszy moment, gdy blok liczby osiągnie IO `threshold: 0.45`.
- Jeżeli trwa wcześniejszy automatyczny akcent, start odłożyć maksymalnie o `250ms`.
- Zakres: `0,0 L → 4,2 L`.
- Czas: `1200ms`.
- Interpolacja: zgodna z `--ease-out`; aktualizacja tekstu maksymalnie `30 razy/s`.
- Format każdej klatki: jedna cyfra po przecinku, locale `pl-PL`, przecinek dziesiętny oraz nierozdzielająca spacja przed `L`.
- Finalny tekst musi brzmieć dokładnie `4,2 L`.
- Kontener ma od pierwszego renderu szerokość finalnego zapisu i cyfry tabularne, aby aktualizacja nie powodowała przesunięć.
- Uruchomienie tylko raz.
- Przy reduced-motion od razu pokazać `4,2 L`, bez wartości pośrednich.

### Sticky-buy

- Pokazanie: gdy dolna krawędź `.hero` opuści viewport i stan utrzyma się przez `120ms`.
- Wejście: `translateY(calc(100% + 16px)) → 0`, `opacity: 0 → 1`, `320ms`, `--ease-spring`.
- Schowanie po powrocie hero: po ponownym pojawieniu się minimum `12px` hero przez `80ms`.
- Wyjście: `translateY(0 → calc(100% + 16px))`, `opacity: 1 → 0`, `180ms`, `--ease-in-out`.
- Sticky znika również natychmiast po osiągnięciu przez sekcję `zamow` IO `threshold: 0.12`; pozostaje ukryty w `zamow` i `final`.
- Po przewinięciu z powrotem ponad checkout może pojawić się ponownie, o ile hero nadal pozostaje poza viewportem.
- Przestrzeń dolna potrzebna dla sticky i safe-area ma być zarezerwowana od pierwszego renderu; nie dodawać ani nie usuwać paddingu w momencie pokazania.
- Sticky nie może zasłaniać aktywnego pola formularza, komunikatu walidacyjnego ani systemowej klawiatury.

## MIKROINTERAKCJE CTA/KART

### Przyciski CTA

| Stan | Specyfikacja |
|---|---|
| Default | `transform: none`; stały cień umieszczony na pseudoelemencie |
| Hover, tylko `hover:hover` | `translateY(-2px) scale(1.015)`, `220ms`, `--ease-out`; opacity warstwy cienia `0.65 → 1` |
| Active/tap | `translateY(0) scale(0.98)`, `120ms`, `--ease-in-out` |
| Powrót po tapie | `scale(1)`, `220ms`, `--ease-spring` |
| Focus-visible | `outline: 3px solid #E8590C`, `outline-offset: 3px`; pojawia się natychmiast, bez transformacji |
| Disabled/pending | `opacity: 0.62`, `120ms`; brak hover i active |

Warstwa cienia CTA: stałe `0 10px 24px rgba(73, 48, 31, .18)`; animowana jest wyłącznie jej opacity, nie parametry cienia.

### Karty

- Efekt tylko dla kart klikalnych.
- Hover: `translateY(-3px) scale(1.01)`, `220ms`, `--ease-out`.
- Active: `scale(0.985)`, `120ms`.
- Warstwa cienia: stałe `0 12px 30px rgba(23, 48, 60, .12)`, opacity `0 → 1` w `220ms`.
- Focus-visible: ring `3px #E8590C`, offset `3px`, bez animacji.
- Statyczne karty nie reagują na hover.

### Kafle wideo

- Hover: kafel `translateY(-3px) scale(1.01)`, poster wewnętrzny `scale(1.02)`, `220ms`.
- Active: kafel `scale(0.985)`, play `scale(0.92)`, `120ms`.
- Focus-visible: ring `3px #E8590C`, offset `3px`.
- Crossfade poster/wideo: `220ms`, opacity only.
- Brak hover na urządzeniach dotykowych.

### Pola formularza

- Focus nie zmienia skali ani położenia pola.
- Border przechodzi natychmiast do koloru akcentu `#E8590C`; bez transition koloru.
- Halo realizowane przez nieruchomą warstwę wrappera: `0 0 0 3px rgba(232, 89, 12, .18)`, opacity `0 → 1`, `120ms`.
- Blur: opacity halo `1 → 0`, `120ms`.
- Stan błędu pojawia się natychmiast; bez shake, pulsowania i przesuwania etykiety.
- Focus-visible nie może zostać usunięty nawet wtedy, gdy pole ma jednocześnie stan błędu.

## INTERAKTYWNE DEMO KORZYŚCI

Stepper „jak działa”, toggle funkcji oraz count-up pojemności **wystarczają jako kompletne demo korzyści**:

- stepper wyjaśnia sposób użycia;
- toggle pozwala porównać funkcje/stany;
- count-up materializuje pojemność i skalę produktu.

Nie dodawać kolejnej interakcji. Następny mechanizm nie przekazałby nowej korzyści, zwiększyłby koszt poznawczy na mobile i konkurowałby z CTA. Wideo-rail pozostaje dowodem produktu, ale nie powinien być przekształcany w dodatkową grę, suwak przed/po ani automatyczne demo.

## REDUCED-MOTION I BUDŻET

### `prefers-reduced-motion: reduce`

- Wszystkie treści sekcji od razu `opacity: 1` i `transform: none` — klasa startowa reveal
  nadawana WYŁĄCZNIE, gdy media query NIE pasuje (guard w JS przy inicjalizacji IO, nie tylko
  w CSS): brak JS lub reduced-motion ⇒ strona w 100% czytelna bez żadnego ruchu.
- Count-up: liczba renderowana od razu jako „4,2 L” (bez animacji licznika).
- Stepper/toggle (TOR-I): zmiana stanu natychmiastowa (bez crossfade/slajdu); stany nadal
  W PEŁNI funkcjonalne — reduced-motion redukuje RUCH, nigdy treść ani funkcję.
- Sticky-buy: pojawia się/znika bez animacji (display/visibility), te same progi IO.
- Akordeon FAQ: rozwinięcie natychmiastowe, chevron bez obrotu animowanego.
- Hover/focus: dozwolona wyłącznie zmiana koloru/cienia (bez transform).

### Budżet wydajności

- Animujemy WYŁĄCZNIE `transform` i `opacity`; zakaz animowania `height/width/top/margin/
  box-shadow` (cień hover = podmiana wartości na gotowej klasie, `transition: box-shadow 220ms`
  dozwolona tylko poza scrollem — nie w sekwencjach reveal).
- Akordeon FAQ: `grid-template-rows: 0fr → 1fr` na wrapperze (bez pomiaru wysokości w JS);
  wnętrze `overflow: hidden` — zero reflow poza kontenerem odpowiedzi.
- `will-change: transform, opacity` nadawane KLASĄ tylko elementom aktualnie w sekwencji,
  zdejmowane po `transitionend`; nigdy globalnie (limit ~6 elementów naraz).
- CLS = 0: sticky-buy jako `position: fixed` (nie wypycha layoutu); wszystkie media z
  wymiarami (`width/height` lub `aspect-ratio`); reveal startuje z `transform`, nigdy z
  `display:none` → brak przesunięć treści; count-up w kontenerze o stałej szerokości
  (`font-variant-numeric: tabular-nums` lub min-width na najdłuższą wartość „4,2 L”).
- 55–60 fps: jeden IntersectionObserver współdzielony na wszystkie reveale + osobny dla
  sticky-buy; zero nasłuchu `scroll`; sekwencje ograniczone do widocznego viewportu
  (`once: true` odpina obserwację po wejściu).
- Fonty: animacje tekstu startują niezależnie od ładowania fontów (fallback metrics);
  brak animacji zależnych od `load`.

## TEST-PLAN

Lista kontrolna wdrożenia (1280×800 i 390×844, Chrome + emulacja touch):

1. **Stany TOR-I** — stepper `jak-dziala` (3 stany) i toggle `funkcje`: screenshot KAŻDEGO
   stanu na obu viewportach; SSIM między każdą parą stanów **< 0.9** (stany wizualnie
   różne = zero martwych interakcji); po przełączeniu treść kompletna (bez uciętego
   crossfade).
2. **Reveal** — scroll przez całą stronę: każda sekcja wchodzi raz, nic nie odtwarza się
   przy scrollu w górę; brak elementów, które zostały w `opacity: 0` (audyt:
   `document.querySelectorAll('.reveal:not(.in)')` po dojściu do stopki = 0 sztuk).
3. **Count-up 4,2 L** — odpala raz przy wejściu w viewport (threshold 0.35), trwa wg spec,
   kończy DOKŁADNIE na „4,2 L” (locale pl, przecinek); po reduced-motion: od razu „4,2 L”.
4. **Sticky-buy** — pojawia się po opuszczeniu hero, znika przy sekcji `zamow` (bez
   nachodzenia na checkout); slide-in bez CLS (Performance panel: Layout Shift = 0).
5. **Konsola** — 0 błędów/warningów na obu viewportach po pełnym przejściu + interakcjach.
6. **H-scroll** — `document.documentElement.scrollWidth <= innerWidth` na 390 px.
7. **CLS** — Performance/Lighthouse: CLS = 0 po pełnym scrollu z animacjami.
8. **FPS** — nagranie Performance podczas scrolla przez sekcje z revealami: brak long
   tasks > 50 ms wywołanych animacjami; wizualnie płynne 55–60 fps.
9. **Reduced-motion** — emulacja `prefers-reduced-motion: reduce`: pełna treść widoczna
   natychmiast, TOR-I działa, count-up statyczny, zero transformów.
10. **Klik CTA hero i mid-cta** — interceptor LL-052 nadal prowadzi do `.zc-form`
    (formularz checkout); animacje nie przechwytują ani nie opóźniają nawigacji.

- Wszystkie treści sekcji są od razu `opacity: 1` i `