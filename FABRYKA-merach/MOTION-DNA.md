## MOTION-DNA

Ruch naśladuje serię powtórzeń: element pojawia się, stabilizuje i zostaje wizualnie „odhaczony” bez dekoracyjnego dryfowania.  
Sekcje wchodzą krótkimi seriami po 2–4 elementy, zawsze zgodnie z kolejnością czytania.  
Sprężystość jest zarezerwowana wyłącznie dla kontrolek oraz sticky-stage, dzięki czemu interfejs pozostaje domowy i pewny, a nie „gym-neon”.  
Sygnatura `.reps` wykonuje jeden sekwencyjny przebieg pięciu segmentów, z ostatnim segmentem stale oznaczonym akcentem `#A21CAF`.  
W jednym viewportcie może działać tylko jeden ruch akcentowy, natomiast pozostałe reveale są neutralne i nie konkurują z ceną ani CTA.

| Token / reguła | Wartość | Zastosowanie |
|---|---:|---|
| `--dur-xs` | `120ms` | tap, focus, ukrycie overlayu |
| `--dur-s` | `180ms` | pojedynczy reveal, hover, wyjście stanu |
| `--dur-m` | `320ms` | karty, zmiana sceny, sticky-buy |
| `--dur-l` | `560ms` | wejście większej grupy lub sekcji |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | podstawowe wejścia i reveale |
| `--ease-standard` | `cubic-bezier(0.20, 0, 0, 1)` | crossfade i wyjścia |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | zmiany dwukierunkowe |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | wyłącznie kontrolki i sticky-stage/sticky-buy |
| Dystans wejścia mobile | `16px` | pionowy reveal |
| Dystans wejścia desktop | `24px` | pionowy reveal |
| Dystans kart | `12px` | mniejszy ruch wewnątrz sekcji |
| Stagger mobile | `70ms` | kolejność DOM |
| Stagger desktop | `90ms` | kolejność DOM |
| Maksymalny stagger grupy | `270ms` | późniejsze elementy nie czekają dłużej |
| Standardowy IO | threshold `0.18`, rootMargin `0px 0px -10% 0px` | reveale sekcji |
| IO małego elementu | threshold `0.35`, rootMargin `0px 0px -8% 0px` | `.reps`, statystyki, CTA |
| IO count-up | threshold `0.55`, rootMargin `0px 0px -10% 0px` | liczby `5`, `2`, `≈200 kg` |
| Replay | `0` | wszystkie ambient reveale i county tylko raz |
| Reguła akcentu | `1 aktywny / 900ms` | `.reps`, count-up albo zmiana stanu |
| Priorytet | interakcja → count-up → `.reps` | interakcja użytkownika kończy ambient w stanie finalnym |

### Sygnatura `.reps`

- Trigger: `.reps` przekracza threshold `0.35`.
- Każdy z 5 segmentów: `scaleX(0) → scaleX(1)` oraz `opacity: 0.35 → 1`, transform-origin po lewej.
- Czas segmentu: `180ms`, easing `--ease-out`, stagger `60ms`; cała seria kończy się po `420ms`.
- Segment piąty ma `#A21CAF` od początku do końca; kolor nie jest animowany.
- `.reps` gra tylko raz. Swash pod nagłówkiem pozostaje statyczny.
- Jeżeli w tym samym viewportcie startuje count-up albo użytkownik zmienia TOR-I, `.reps` czeka na zwolnienie blokady akcentu.
- Przy reduced-motion wszystkie segmenty są od razu w stanie finalnym.

## SPEC PER SEKCJA

### 1. Hero

**Trigger**

- Start w pierwszej klatce po gotowości DOM, pod warunkiem że hero przecina viewport.
- Nie czekać na pełne pobranie obrazu ani na `window.load`; maksymalne opóźnienie startu: `80ms`.
- Sticky-buy ma osobny trigger opisany w „ZESTAWIE OBOWIĄZKOWYM”.

**Wejście**

- Obraz full-bleed jest widoczny od pierwszego paintu: bez opacity fade, skali, przesuwania i parallaxu.
- Full-bleed realizować wyłącznie przez szerokość/marginesy oparte o `calc(...)`; nie używać `transform`, szczególnie na `.hero .reveal`.
- Karta oferty:
  - `opacity: 0 → 1`;
  - `clip-path: inset(0 0 12% 0 round 24px) → inset(0 0 0 0 round 24px)`;
  - `420ms`, `--ease-out`.
- Wewnętrzne elementy karty — cena i CTA — tylko opacity `0 → 1`, `180ms`, stagger `60ms`, start `160ms` po karcie.
- `.reps`, jeśli występuje w hero, startuje po `240ms` i jest jedynym akcentem hero.
- Mobile zachowuje tę samą kolejność: scena jest statyczna, potem karta; bez dodatkowego ruchu wynikającego ze stackowania.

**Mikrointerakcje**

- CTA według wspólnej specyfikacji przycisków.
- Po załadowaniu obrazu nie wykonywać dodatkowego fade-in ani „pop”.
- Sticky-buy może wejść dopiero po pełnym opuszczeniu hero, nie podczas końcówki jego animacji.

**Nie animować**

- Nie animować pozycji, szerokości ani wysokości hero — ryzyko konfliktu z `.reveal`, CLS i utraty full-bleed.
- Nie skalować obrazu LCP.
- Nie animować jednocześnie swasha i `.reps`.
- Nie przesuwać całej karty przez `translate`, ponieważ `.reveal` może narzucać `transform:none!important`.

### 2. Problem

**Trigger**

- Standardowy IO: threshold `0.18`, rootMargin `0px 0px -10% 0px`.

**Wejście**

1. Nagłówek: `opacity 0 → 1`, `translateY(16/24px) → 0`, `320ms`, `--ease-out`.
2. Trzy karty metod: `opacity 0 → 1`, `translateY(12px) → 0`, `320ms`, stagger `70ms` mobile / `90ms` desktop.
3. Most: `opacity 0 → 1`, `translateY(12px) → 0`, `240ms`, start `70ms` po ostatniej karcie.

**Mikrointerakcje**

- Jeżeli karty są nieklikalne, po reveal nie otrzymują hoveru ani tap-feedbacku.
- Jeżeli któraś karta jest linkiem, stosować wspólny hover karty: `translateY(-4px)`, `180ms`.

**Nie animować**

- Ikon ink nie obracać, nie podbijać i nie rysować kreska po kresce — mają działać jak czytelne oznaczenia metod.
- Swash statyczny.
- Nie uruchamiać kart ponownie przy scrollowaniu wstecz.

### 3. Jak ćwiczysz — TOR-I sticky-stage

**Trigger i mapowanie stanów**

- Stan `1` jest aktywny domyślnie przed wejściem w sticky-stage.
- Każdy istniejący krok ma sentinel. Stan zmienia się, gdy sentinel kroku przecina linię na `55%` wysokości viewportu.
- Histereza: `8vh`; po aktywacji nowego stanu powrót do poprzedniego następuje dopiero po przekroczeniu linii w przeciwnym kierunku o `8vh`.
- Sticky geometria i długość sekcji pozostają nietykalne.
- Dozwolone stany: wyłącznie `1`, `2`, `3`; zawsze dokładnie jeden aktywny.

**Wejście sekcji**

- Rama sticky-stage: opacity `0 → 1`, `320ms`.
- Lista kroków: opacity `0 → 1`, `translateY(12px) → 0`, `320ms`, stagger `70ms`.
- Scena stanu `1` jest gotowa od pierwszego wejścia; nie może pozostać pusta podczas oczekiwania na IO.

**Przejście `1 ↔ 2 ↔ 3`**

- Warstwa wychodząca: opacity `1 → 0`, scale `1 → 0.99`, `180ms`, `--ease-standard`.
- Warstwa wchodząca: opacity `0 → 1`, `translateY(8px) → 0`, scale `0.985 → 1`, `320ms`, `--ease-spring`.
- Warstwa wchodząca startuje `60ms` po rozpoczęciu wyjścia.
- Aktywny krok:
  - tekst opacity `0.48 → 1`, `180ms`;
  - istniejący marker/segment `scaleX(0 → 1)`, `240ms`, transform-origin left;
  - poprzedni krok wraca do opacity `0.48` w `120ms`.
- Przy szybkim scrollu nie kolejkować stanów. Anulować stan pośredni i przejść bezpośrednio do najnowszego, startując od aktualnych wartości wizualnych.

**Feedback**

- Tap/click kroku: kontrolka skaluje się `1 → 0.98` przez `90ms`, wraca przez `180ms`, `--ease-spring`.
- Tap kroku wykonuje natywne `scrollIntoView` do jego sentinela; `smooth` tylko bez reduced-motion.
- Klawiatura: Enter/Spacja zachowują się jak tap; focus nie zmienia stanu samoczynnie.
- Zmiana z interakcji ma priorytet nad ambient `.reps` lub count-upem.

**TEST STANÓW**

- Screenshot ROI obejmujący całą scenę i trzy kroki, po `400ms` od ustabilizowania stanu.
- Rozdzielczości testowe: `1280×800` i `390×844`.
- Porównać parami `1–2`, `2–3`, `1–3`; każdy wynik SSIM musi być `<0.90`.
- W każdym stanie test potwierdza: dokładnie jedną aktywną warstwę sceny, dokładnie jeden aktywny krok i brak opacity pośredniej po settle.
- Jeżeli SSIM jest `≥0.90`, nie dodawać nowych grafik. Zwiększyć różnicę istniejących warstw przez pełne wygaszenie nieaktywnej sceny do opacity `0` i zapewnić, że aktywny render zajmuje minimum `35%` ROI.

**Nie animować**

- Nie wiązać wartości transform bezpośrednio z każdym pikselem scrolla.
- Bez parallaxu, scrubowania, scroll-jackingu i automatycznego przechodzenia stanów czasem.
- Nie animować wysokości sticky-stage.

### 4. Regulacja — TOR-I toggle

**Trigger wejścia**

- Standardowy IO dla sekcji.
- Statystyki `5 / 2` mają osobny count-up przy threshold `0.55`.

**Wejście**

- Obraz profilu: opacity `0 → 1`, `translateY(16/24px) → 0`, `320ms`, `--ease-out`.
- Blok liczb i toggle: opacity `0 → 1`, `translateY(12px) → 0`, `320ms`, opóźnienie `90ms`.
- Count-up startuje dopiero po zakończeniu wejścia bloku albo po `320ms` od IO — zależnie od tego, co nastąpi później.

**Przejście „Łagodniej ↔ Trudniej”**

- Aktualna logika wyboru pozostaje bez zmian.
- Thumb/aktywne tło kontrolki: `translateX(0%) ↔ translateX(100%)`, `320ms`, `--ease-spring`.
- Aktywna etykieta: opacity `0.56 → 1`, `180ms`; nieaktywna `1 → 0.56`, `120ms`.
- Istniejąca warstwa wizualna ustawienia:
  - wychodząca opacity `1 → 0`, `180ms`;
  - wchodząca opacity `0 → 1`, scale `0.99 → 1`, `240ms`, `--ease-out`;
  - crossfade zaczyna się równocześnie.
- Jeżeli istnieje state overlay sceny, stan „Łagodniej” używa opacity `0`, a „Trudniej” opacity `0.12` w kolorze akcentu; overlay animuje wyłącznie opacity przez `240ms`.
- Szybkie wielokrotne tapnięcia nie tworzą kolejki — obowiązuje ostatni wybór.

**Feedback**

- Pointer-down kontrolki: scale `1 → 0.98`, `90ms`.
- Release: scale `0.98 → 1`, `180ms`, `--ease-spring`.
- Focus-visible obejmuje cały segment, nie tylko tekst.
- Stan selected musi być dostępny jako `aria-pressed` lub równoważny istniejący mechanizm.

**TEST STANÓW**

- Screenshot ROI obejmuje obraz profilu, liczby i cały toggle po `350ms` settle.
- Porównać „Łagodniej” z „Trudniej” na `1280×800` i `390×844`.
- SSIM ROI musi wynosić `<0.90`.
- Test potwierdza dokładnie jeden selected segment oraz zgodność widocznej warstwy sceny z wybraną etykietą.
- Jeśli próg nie jest osiągnięty, nie dodawać treści ani ikon; zwiększyć udział istniejącej warstwy stanu do minimum `35%` powierzchni ROI i pozostawić nieaktywną warstwę na opacity `0`.

**Nie animować**

- Nie przeliczać ponownie `5 / 2` po każdym przełączeniu.
- Nie przesuwać całej sekcji ani nie zmieniać jej wysokości.
- Nie stosować sprężystości na obrazie; spring dotyczy wyłącznie kontrolki.

### 5. Wideo

**Trigger wejścia**

- Standardowy IO dla raila; każdy kafel jest osobnym elementem grupy.

**Wejście**

- Kafle w kolejności DOM: opacity `0 → 1`, `translateY(16px) → 0`, `320ms`, stagger `70ms`.
- Poster i proporcja `9:16` są widoczne oraz zarezerwowane przed revealam.
- Przycisk play: opacity `0 → 1`, scale `0.92 → 1`, `180ms`, start `120ms` po kaflu.

**Odtwarzanie i feedback**

- Zero autoplay w viewportcie, także muted.
- Pierwszy tap/click jest jednoznaczną intencją odtworzenia: uruchamia klip z dźwiękiem.
- Uruchomienie jednego klipu pauzuje wszystkie pozostałe.
- Pointer-down play: scale `1 → 0.92`, `90ms`; release `0.92 → 1`, `180ms`, `--ease-spring`.
- Po rozpoczęciu playbacku overlay play przechodzi opacity `1 → 0` w `120ms`.
- Po pauzie lub zakończeniu overlay wraca opacity `0 → 1` w `180ms`.
- Desktop hover na play: scale `1 → 1.06`, `180ms`; nie skalować całego wideo.
- Tap w obszar aktywnego klipu korzysta z natywnej kontroli play/pause.
- Minimalny hit-area kontrolki: `44×44px`.

**Nie animować**

- Nie uruchamiać klipów przez IO.
- Nie animować posterów jako GIF ani cinemagraph.
- Nie nadpisywać natywnych kontrolek, progressu i seekowania.
- Nie zoomować materiału UGC — ma zachować charakter realnego nagrania.

### 6. Wiele partii

**Trigger**

- Standardowy IO po wejściu nagłówka i siatki.

**Wejście**

- Nagłówek: opacity `0 → 1`, `translateY(16/24px) → 0`, `320ms`.
- Cztery kafle: opacity `0 → 1`, `translateY(12px) → 0`, `320ms`.
- Kolejność: DOM, czyli lewy-górny → prawy-górny → lewy-dolny → prawy-dolny; stagger `70ms` mobile / `90ms` desktop.
- Maksymalne opóźnienie czwartego kafla: `270ms`.

**Mikrointerakcje**

- Kafle nieklikalne: brak hoveru i tap-feedbacku.
- Kafle klikalne: `translateY(-4px)` na hover, `180ms`; active scale `0.99`, `90ms`.
- Ewentualny overlay hover realizować przez opacity pseudo-elementu `0 → 0.06`, bez animowania gradientu.

**Nie animować**

- Nie wykonywać osobnej animacji każdej etykiety partii.
- Nie zapętlać ruchu obrazów i nie pulsować aktywnych mięśni.
- Nie zmieniać układu `2×2`.

### 7. Wytrzymałość

**Trigger**

- Sekcja: standardowy IO.
- Liczba `≈200 kg`: threshold `0.55`, rootMargin `0px 0px -10% 0px`.

**Wejście**

1. Scena: opacity `0 → 1`, `translateY(16/24px) → 0`, `320ms`.
2. Liczba: opacity `0 → 1`, bez translate, `180ms`, następnie count-up.
3. Karty ABS/poprzeczek: opacity `0 → 1`, `translateY(12px) → 0`, `320ms`, stagger `90ms`.

**Mikrointerakcje**

- Count-up jest jedynym akcentem tej sekcji.
- Jeżeli sekcja zawiera `.reps`, pasek pozostaje od razu w stanie finalnym i nie gra.
- Karty dowodowe nie otrzymują hoveru, jeśli nie są linkami.

**Nie animować**

- Nie zginać ani nie „uginiać” konstrukcji w grafice.
- Nie dodawać efektu uderzenia, drgań ani shake po osiągnięciu `200`.
- Nie powtarzać count-upu podczas powrotu scrolla.

### 8. Mid-CTA

**Trigger**

- Threshold `0.25`, rootMargin `0px 0px -8% 0px`.

**Wejście**

- Cała karta: opacity `0 → 1`, `translateY(16px) → 0`, `320ms`, `--ease-out`.
- Biały box packshotu: opacity `0 → 1`, `180ms`, opóźnienie `80ms`.
- Cena i CTA: opacity `0 → 1`, `180ms`, stagger `60ms`, start `140ms`.
- Pigułki ryzyka: opacity `0 → 1`, `translateY(8px) → 0`, `240ms`, stagger `50ms`, maksymalnie `150ms`.

**Mikrointerakcje**

- CTA według wspólnej specyfikacji.
- Packshot pozostaje nieruchomy.
- Pigułki nie reagują na hover, jeżeli nie są kontrolkami.

**Nie animować**

- Ceny nie liczyć i nie zmieniać jej skali.
- Nie obracać, nie podskakiwać i nie przesuwać packshotu.
- Bez pulsującego CTA.

### 9. Składanie

**Trigger**

- Standardowy IO dla dyptyku.

**Wejście**

- Nagłówek: opacity `0 → 1`, `translateY(16/24px) → 0`, `320ms`.
- Zdjęcie rozłożone: opacity `0 → 1`, `translateY(12px) → 0`, `320ms`.
- Zdjęcie złożone: ten sam ruch, opóźnienie `120ms`.
- Oznaczenie zawleczki: opacity `0 → 1`, scale `0.96 → 1`, `220ms`, `--ease-out`, start po pojawieniu się drugiego zdjęcia.
- Na mobile zachować kolejność góra → dół; nie wprowadzać ruchu poziomego powodującego h-scroll.

**Mikrointerakcje**

- Jeśli zdjęcia otwierają lightbox istniejący już w layoucie: tap scale `1 → 0.99`, `90ms`; bez zmiany logiki lightboxa.
- Zawleczka wykonuje wyłącznie pojedyncze wejście, bez zapętlonego pulsu.

**Nie animować**

- Nie symulować mechanicznego składania zdjęciami.
- Nie przesuwać zawleczki po osi ani nie obracać jej bez realnego modelu ruchu.
- Nie maskować oznaczenia „zdjęcie od kupującego”.

### 10. Zamów — checkout-inline

**Trigger**

- Threshold `0.10`, rootMargin `0px 0px -5% 0px`.

**Wejście**

- Wyłącznie wrapper sekcji: opacity `0 → 1`, `240ms`, `--ease-out`.
- Formularz, kroki, pola, podsumowanie i walidacja są od razu w pozycji finalnej.
- Bez staggeru dzieci formularza.

**Mikrointerakcje**

- Pola: focus-ring wrappera opacity `0 → 1`, `120ms`; blur `1 → 0`, `120ms`.
- Submit pointer-down: scale `1 → 0.985`, `90ms`; release `0.985 → 1`, `180ms`, `--ease-spring`.
- W istniejącym stanie pending: zawartość przycisku opacity `1 → 0.60`, `120ms`; użyć istniejącego loadera/statusu, bez zmiany logiki.
- Success i error pojawiają się zgodnie z aktualną logiką, bez shake i bez automatycznego przesuwania viewportu.

**Nie animować**

- Nie animować przejść między krokami, wysokości formularza, błędów ani kolejności pól.
- Nie zmieniać timeoutów, walidacji, submitu, integracji ani obsługi zamówienia.
- Bez confetti, pulsowania ceny i ukrywania pól.
- Sticky-buy znika przed wejściem formularza do viewportu.

### 11. Final

**Trigger**

- Standardowy IO dla panelu liczb i bloku CTA.
- FAQ jest widoczne od razu po wejściu sekcji; pierwszy element pozostaje otwarty zgodnie z obecnym stanem.

**Wejście**

- Nagłówek FAQ: opacity `0 → 1`, `translateY(16px) → 0`, `320ms`.
- Lista FAQ jako jedna grupa: opacity `0 → 1`, `240ms`; bez reveal każdego z 9 pytań.
- Panel `5 · 2 · ≈200 kg`: opacity `0 → 1`, `translateY(12px) → 0`, `320ms`.
- Cena i CTA: opacity `0 → 1`, `180ms`, stagger `60ms`.
- Liczby panelu są statyczne; nie powtarzać count-upów.

**Accordion**

- Kliknięcie nagłówka: scale `1 → 0.99` przez `90ms`, powrót `180ms`, `--ease-spring`.
- Chevron: obrót `0deg ↔ 180deg`, `180ms`, `--ease-standard`.
- Zmiana wysokości odpowiedzi następuje natychmiast zgodnie z obecną logiką.
- Po otwarciu treść odpowiedzi wykonuje opacity `0 → 1`, `160ms`.
- Po zamknięciu opacity `1 → 0`, `120ms`, a następnie istniejąca logika chowa odpowiedź.
- Focus-visible: ring `3px`, offset `3px`.

**Nie animować**

- Nie używać `max-height`, animacji `height:auto` ani przesuwania kolejnych pytań przez transform.
- Nie przewijać automatycznie do otwartego pytania.
- Nie uruchamiać ponownie liczb `5`, `2`, `≈200 kg`.
- Sticky-buy pozostaje ukryty od wejścia `#zamow` do końca strony.

## ZESTAW OBOWIĄZKOWY

### Scroll-reveal

- Progressive enhancement: bez JS cała treść ma być widoczna w stanie finalnym.
- Stan początkowy może być nakładany dopiero po uruchomieniu JS i potwierdzeniu obsługi IntersectionObserver.
- Domyślny reveal: opacity `0 → 1`, `translateY(16px)` mobile / `24px` desktop → `0`, `320ms`, `--ease-out`.
- Karty wewnątrz sekcji: dystans `12px`.
- Stagger: `70ms` mobile, `90ms` desktop, maksymalnie `270ms`.
- Każdy reveal tylko raz; po wejściu usunąć obserwację elementu.
- Elementy znajdujące się już w viewportcie przy starcie otrzymują normalny reveal bez dodatkowego opóźnienia większego niż `80ms`.
- Hero nie używa transform-based reveal z powodu `.reveal { transform:none!important; }`.

### Count-up `5 / 2`

- Lokalizacja: sekcja „regulacja”.
- Trigger: cały blok statystyk przekracza threshold `0.55`.
- `5`: `0 → 5`, czas `650ms`.
- `2`: `0 → 2`, czas `560ms`, start `90ms` po liczbie `5`.
- Krzywa wartości: ease-out cubic; wyświetlane są wyłącznie liczby całkowite.
- Końcowa wartość musi zostać ustawiona dokładnie, niezależnie od liczby wyrenderowanych klatek.
- Rezerwacja szerokości: minimum `1ch` dla każdej cyfry, cyfry tabularne.
- Count-up gra raz na sesję strony, nie przy każdym wejściu w viewport.
- Cyfry animowane są `aria-hidden`; technologia asystująca otrzymuje od razu finalne `5` i `2`, bez `aria-live`.

### Count-up `≈200 kg`

- Lokalizacja: sekcja „wytrzymałość”.
- Prefix `≈` i suffix `kg` są obecne od pierwszej klatki i nie zmieniają opacity ani pozycji.
- Animowana jest tylko wartość cyfrowa: `0 → 200`.
- Czas: `1100ms`, threshold `0.55`.
- Format w każdej klatce: `≈{liczba całkowita} kg`; finał dokładnie `≈200 kg`.
- Rezerwacja szerokości części numerycznej: `3ch`, cyfry tabularne.
- Jeżeli karta przeglądarki zostanie ukryta podczas animacji, po powrocie pokazać od razu wartość finalną.
- Bez overshootu ponad `200`.

### Reduced-motion dla count-upów

- Bez iteracji po wartościach.
- Od pierwszego renderu pokazać `5`, `2` i `≈200 kg`.
- Nie opóźniać finalnej liczby przez IO.

### Sticky-buy

- Stan ukryty, gdy dolna krawędź `.hero` znajduje się poniżej lub na poziomie `0px` viewportu.
- Start wejścia dopiero, gdy:
  1. hero całkowicie opuści viewport górą;
  2. warunek utrzyma się przez `120ms`;
  3. `#zamow` nie przecina viewportu i jego górna krawędź znajduje się poniżej dolnej krawędzi viewportu.
- Wejście: `translateY(calc(100% + 16px)) → translateY(0)`, opacity `0 → 1`, `320ms`, `--ease-spring`.
- Wyjście przy powrocie hero: translate do `calc(100% + 16px)`, opacity `1 → 0`, `180ms`, `--ease-standard`.
- Wyjście przy `#zamow`: rozpoczyna się, gdy górna krawędź `#zamow` wejdzie do viewportu; czas `120ms`.
- Od tego momentu sticky-buy pozostaje ukryty przez checkout i final.
- Przy scrollu w górę może wrócić dopiero wtedy, gdy `#zamow` ponownie znajdzie się całkowicie poniżej viewportu i hero nadal jest poza viewportem.
- Timer wejścia jest anulowany przy zmianie warunku, aby nie powodować migotania na granicy hero.
- Uwzględnić `env(safe-area-inset-bottom)` bez zmiany wysokości po pokazaniu.
- Element fixed nie rezerwuje ani nie zwalnia miejsca w dokumencie, więc nie generuje CLS.

## MIKROINTERAKCJE CTA/KART

### CTA

| Stan | Ruch |
|---|---|
| Default | bez animacji ciągłej |
| Hover, tylko `hover:hover` | `translateY(-2px)`, `180ms`, `--ease-out` |
| Pointer-down | scale `0.98`, `90ms` |
| Release | scale `1`, `180ms`, `--ease-spring` |
| Focus-visible | ring `3px`, offset `3px`; pojawienie przez opacity `120ms` |
| Disabled | opacity `0.48`, bez transform i bez hoveru |
| Pending | zawartość opacity `0.60`, transform przycisku `none` |

- Nie animować bezpośrednio `box-shadow`; dodatkową warstwę cienia realizować pseudo-elementem opacity `0 → 1`.
- Bez pulsowania, świecenia, przesuwania ikony w pętli i automatycznych wiggle.
- Minimalny obszar tapnięcia: wysokość `48px`.
- Każdy CTA sprzedażowy musi prowadzić do `.zc-form` zgodnie z LL-052.

### Karty

- Nieklikalna karta: tylko jednorazowy reveal, bez hoveru sugerującego interakcję.
- Klikalna karta desktop: `translateY(-4px)`, `180ms`, `--ease-out`.
- Klikalna karta pointer-down: scale `0.99`, `90ms`; release `180ms`.
- Radius `24/12` nie jest animowany.
- Overlay hover może zmieniać opacity `0 → 0.06`; nie animować border-color, gradientu ani cienia.
- Na urządzeniach touch nie pozostawiać „zawieszonego” stanu hover.

### Kafle wideo

- Play hover: scale `1.06`, `180ms`.
- Play active: scale `0.92`, `90ms`.
- Overlay po starcie: opacity `1 → 0`, `120ms`.
- Overlay po pauzie: opacity `0 → 1`, `180ms`.
- Aktywny klip nie skaluje całego kafla.
- W danym momencie może grać maksymalnie jeden klip.

### Pola formularza

- Focus realizować przez opacity dedykowanego ringu wrappera: `0 → 1`, `120ms`.
- Nie przesuwać pola, labela ani sekcji na focus.
- Błąd pojawia się natychmiast; bez shake, bounce i animowania wysokości.
- Status valid może pokazać istniejącą ikonę przez opacity `0 → 1`, `120ms`.
- Autofill, walidacja i logika checkoutu pozostają nietykalne.

## INTERAKTYWNE DEMO KORZYŚCI

Tak — obecny zestaw jest wystarczający:

1. Stepper „jak ćwiczysz” pokazuje proces i kolejność użycia.
2. Toggle „Łagodniej/Trudniej” daje bezpośredni feedback dopasowania.
3. Count-upy `5 / 2` komunikują zakres regulacji.
4. Count-up `≈200 kg` dostarcza ilościowego proof-pointu.

Nie dodawać slidera, kalkulatora spalania, dragowania maszyny, hotspotów ani kolejnego porównania before/after. Nie dodawać nowych treści, ikon ani grafik. Warunkiem pozostawienia zestawu jest zdanie testów TOR-I: jednoznaczne stany, natychmiastowy feedback i SSIM `<0.90`. Count-upy są akcentem informacyjnym, nie osobnym „demo”, dlatego nie mogą reagować na tap ani odtwarzać się ponownie.

## REDUCED-MOTION I BUDŻET

### `prefers-reduced-motion: reduce`

- Wszystkie treści od razu w stanie finalnym.
- Brak translate, scale, clip-path reveal, staggeru, count-upów i smooth scroll.
- `.reps` od razu pokazuje 5 pełnych segmentów.
- TOR-I przełącza warstwy natychmiast; selected/focus pozostają czytelne.
- Toggle przechodzi natychmiast między stanami.
- Sticky-buy pojawia się i znika bez transformacji czasowej, zgodnie z tymi samymi warunkami widoczności.
- FAQ otwiera treść natychmiast.
- Wideo nadal uruchamia się wyłącznie po tapnięciu.
- Brak JS lub błąd IO nie może pozostawić żadnego elementu ukrytego.

### Budżet wydajnościowy

- Animować wyłącznie `transform` i `opacity`.
- Jedyny wyjątek: jednorazowy `clip-path` karty hero; przy problemach wydajnościowych zastąpić samym opacity, nie transformem.
- Accordion zmienia layout natychmiast, bez czasowej animacji wysokości.
- Nie animować `width`, `height`, `top`, `left`, `margin`, `padding`, `filter`, gradientów ani `box-shadow`.
- `will-change` dodawać maksymalnie `150ms` przed ruchem i usuwać maksymalnie `100ms` po jego zakończeniu.
- Maksymalnie `8` warstw z aktywnym `will-change` jednocześnie; sticky-stage maksymalnie `2` warstwy sceny.
- IO callback nie wykonuje pomiaru i zapisu layoutu naprzemiennie w tej samej pętli.
- Cel: `55–60 fps`; p95 czasu klatki poniżej `18ms`, brak long tasków powyżej `50ms` podczas reveal.
- Wideo nie dekoduje się automatycznie przez scroll; zero autoplay ogranicza koszt GPU/CPU.
- Wszystkie obrazy mają zarezerwowane proporcje, wideo `9:16`, a boxy packshotów i sticky-stage określoną wysokość przed załadowaniem.
- Liczby mają zarezerwowaną szerokość w `ch`, dzięki czemu count-up nie przesuwa treści.
- Cel CLS: `0.00` dla automatycznych zmian; interaktywne otwarcie FAQ nie może powodować skoku scrolla ani zmiany anchoringu.

## TEST-PLAN

### Viewporty

- Desktop: `1280×800`.
- Mobile: `390×844`.
- Dodatkowo sprawdzić mobile z dolnym safe-area i klawiaturą ekranową.

### TOR-I

- [ ] „Jak ćwiczysz” ma dokładnie stany `1`, `2`, `3`.
- [ ] Stan zmienia się przy linii `55%` viewportu.
- [ ] Histereza `8vh` eliminuje migotanie na granicy.
- [ ] Szybki scroll nie pozostawia dwóch aktywnych warstw.
- [ ] Tap kroku prowadzi natywnie do odpowiedniego sentinela.
- [ ] Pairwise SSIM `1–2`, `2–3`, `1–3` jest `<0.90` dla ROI sceny.
- [ ] Regulacja ma dokładnie jeden selected segment.
- [ ] SSIM „Łagodniej–Trudniej” jest `<0.90` dla ROI regulacji.
- [ ] Reduced-motion przełącza oba TOR-I natychmiast.

### Reveal-audyt

- [ ] Bez JS wszystkie treści są widoczne.
- [ ] Każdy reveal uruchamia się tylko raz.
- [ ] Kolejność staggeru odpowiada DOM.
- [ ] Maksymalny stagger grupy nie przekracza `270ms`.
- [ ] Hero nie otrzymuje transformacji z reveal.
- [ ] Full-bleed hero nadal jest realizowany przez `calc`, bez transform.
- [ ] LCP hero nie jest ukryty opacity ani clip-path.
- [ ] W jednym viewportcie nie działają równocześnie dwa akcenty.
- [ ] `.reps` ma 5 segmentów, sekwencję `60ms` i gra tylko raz.

### Count-upy

- [ ] `5` kończy się dokładnie na `5` po `650ms`.
- [ ] `2` kończy się dokładnie na `2` po `560ms`, start `90ms` później.
- [ ] `≈200 kg` zachowuje prefix i suffix w każdej klatce.
- [ ] Wartość nie przekracza `200`.
- [ ] County nie odtwarzają się ponownie po scrollu wstecz.
- [ ] Zmiana cyfr nie powoduje przesunięcia layoutu.
- [ ] Po powrocie z ukrytej karty widoczna jest wartość finalna.
- [ ] Reduced-motion pokazuje finalne liczby natychmiast.

### Sticky-buy

- [ ] Nie pojawia się, dopóki hero nie opuści całkowicie viewportu.
- [ ] Pojawia się po stabilnych `120ms`.
- [ ] Szybki powrót do hero anuluje timer.
- [ ] Chowa się przy ponownym wejściu hero.
- [ ] Chowa się, gdy górna krawędź `#zamow` wchodzi do viewportu.
- [ ] Pozostaje ukryty w checkout i final.
- [ ] Przy scrollu w górę wraca dopiero nad `#zamow`.
- [ ] Nie zasłania CTA, pól formularza ani systemowego safe-area.
- [ ] Nie generuje CLS.

### Wideo i formularz

- [ ] Żaden klip nie startuje przez IO ani sam viewport.
- [ ] Pierwszy tap uruchamia dźwięk zgodnie z polityką przeglądarki.
- [ ] Start jednego klipu pauzuje pozostałe.
- [ ] Formularz nie ma staggeru ani animacji kroków.
- [ ] Błędy nie wykonują shake i nie przesuwają scrolla.
- [ ] Pending nie zmienia istniejącej logiki submitu.
- [ ] Klawiatura mobilna nie powoduje pojawienia się sticky-buy nad formularzem.

### Stabilność i performance

- [ ] Konsola: `0` błędów i `0` nieobsłużonych Promise rejection.
- [ ] Brak poziomego scrolla przy `390px`, także w trakcie reveal.
- [ ] CLS automatyczny wynosi `0.00`.
- [ ] Reveale utrzymują `55–60 fps`; p95 klatki `<18ms`.
- [ ] Brak long tasków `>50ms` podczas scrollowania.
- [ ] Po animacji `will-change` zostaje usunięty.
- [ ] Obserwowane elementy są odpinane po jednorazowym reveal.
- [ ] Focus-visible jest czytelny na CTA, toggle, stepperze, FAQ i play.
- [ ] Na touch nie pozostają stany hover.
- [ ] Przy `prefers-reduced-motion` pełna treść jest dostępna bez ruchu.

### LL-052

- [ ] Każdy CTA w hero prowadzi do `.zc-form`.
- [ ] Sticky-buy prowadzi do `.zc-form`.
- [ ] Mid-CTA prowadzi do `.zc-form`.
- [ ] CTA final prowadzi do `.zc-form`.
- [ ] Po aktywacji CTA `.zc-form` nie jest zasłonięty sticky-buy.
- [ ] Przewinięcie do `.zc-form` jest natywnie płynne tylko bez reduced-motion; przy reduced-motion następuje natychmiast.