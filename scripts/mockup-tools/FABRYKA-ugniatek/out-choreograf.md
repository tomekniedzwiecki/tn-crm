### MOTION-DNA: ugniatek
**OSOBOWOŚĆ RUCHU:** Ruch Ugniatka jest spokojnym cyklem docisku i wydechu: precyzyjnie prowadzi wzrok hairline’em, po czym miękko oddaje przestrzeń.  
**TOKENY:** `--mo-dur-s:.22s; --mo-dur-m:.36s; --mo-dur-l:.62s; --mo-ease:cubic-bezier(.22,1,.36,1); --mo-dist:14px; --mo-stagger:.06s;`  
**SKALA:** **L1** — pojedynczy element lub cała sekcja, jeden spokojny gest; **L2** — 2–3 zsynchronizowane warstwy albo kierunki; **L3** — sekwencja narracyjna lub interaktywna, maksymalnie 4 czytelne beaty.  
**BUDŻET:** Maksymalnie 2 sekcje L3, 1 ambient na całym landingu, do 6 animowanych grup jednocześnie; każde wejście wraz ze staggerem kończy się w `.72s`, bez animacji layoutu, koloru, filtrów i masek — wyłącznie `transform` oraz `opacity`.

### SPEC PER SEKCJA (10 pozycji)

[hero] | L2 | Dwa sposoby użycia: docisk ↔ luz  
**STORYBOARD** Dyptyk zbliża się do osi z przeciwnych kierunków, a kompaktowa karta oferty miękko podnosi się od dołu. Po osadzeniu hero-video w lewej kolumnie prowadzi jedyny ambient: spokojny beat docisku i luzu bez ciągłego pulsowania CTA. · **TRIGGER** view-once + idle-ambient (jedyny ambient) · **PROPS** `transform: translate/scale`, `opacity` · **STAGGER** tak(`.06s`) · **FALLBACK** reduced-motion: statyczny finalny układ i poster wideo / no-JS: dyptyk, karta oraz poster od razu widoczne.

[dwie-formy] | L3 | Dociskam oburącz ↔ kładę i opieram  
**STORYBOARD** Sekcja wchodzi jako jeden stabilny tor z aktywnym wariantem A. Przy zmianie segmentu wskaźnik przesuwa się do celu, bieżąca sylwetka oddaje miejsce drugiej przez krótki crossfade, a podpis stref pojawia się w tym samym beacie; istniejącej logiki komponentu nie zmieniamy. · **TRIGGER** view-once + hover-press (press/tap/klawiatura równoważne, bez hover-only) · **PROPS** `transform: translateX/translateY`, `opacity` · **STAGGER** nie · **FALLBACK** reduced-motion: natychmiastowa zmiana panelu bez przejścia / no-JS: wariant A i jego treść pozostają czytelne statycznie.

[anatomia] | L3 | Hairlines wskazują sześć głowic  
**STORYBOARD** Realny spód osiada centralnie, po czym cztery hairlines wyrastają od produktu przez skalowanie od właściwego punktu kotwiczenia. Calloutsy pojawiają się parami z końcówkami linii, prowadząc od sześciu głowic do dwóch uchwytów bez teatralnego obrotu packshotu. · **TRIGGER** view-once · **PROPS** `transform: translateY/scaleX/scaleY`, `opacity` · **STAGGER** tak(`.06s`) · **FALLBACK** reduced-motion: kompletny diagram widoczny od razu / no-JS: produkt, linie i wszystkie etykiety statycznie widoczne.

[sterowanie] | L2 | P1–P9, poziomy, bateria, auto-stop  
**STORYBOARD** Zdjęcie panelu i tabela dosuwają się do wspólnej osi z przeciwnych stron. Cztery parametry odsłaniają się kolejno, a dwa pille osiadają razem jako krótkie podsumowanie sterowania. · **TRIGGER** view-once · **PROPS** `transform: translateX/translateY`, `opacity` · **STAGGER** tak(`.05s`) · **FALLBACK** reduced-motion: zdjęcie, tabela i pille od razu w pozycji końcowej / no-JS: cała sekcja widoczna bez sekwencji.

[wieczorem] | L2 | Twój moment po całym dniu  
**STORYBOARD** Dwa zdjęcia startują delikatnie bliżej siebie, a następnie rozchodzą się do docelowego kadru jak spokojny wydech. Karta korzyści pojawia się pomiędzy nimi bez parallaxu i bez zapętlonego ruchu. · **TRIGGER** view-once · **PROPS** `transform: translateX/translateY`, `opacity` · **STAGGER** tak(`.06s`) · **FALLBACK** reduced-motion: finalna kompozycja bez rozsuwania / no-JS: oba zdjęcia i karta od razu widoczne.

[mid-cta] | L2 | Dwie formy, jedno urządzenie  
**STORYBOARD** Packshot i blok tekstowy dosuwają się do środka karty jak dwie formy spotykające się w jednym urządzeniu. Cena oraz CTA pojawiają się wspólnie na końcu, bez animowania petrolowego koloru. · **TRIGGER** view-once · **PROPS** `transform: translateX/translateY`, `opacity` · **STAGGER** tak(`.06s`) · **FALLBACK** reduced-motion: cała karta natychmiast w finalnym stanie / no-JS: packshot, cena i CTA stale widoczne oraz aktywne.

[zestaw] | L2 | Zestaw i wymiar 11 cm  
**STORYBOARD** Flat-lay łagodnie osiada, a tabela specyfikacji podnosi się jako jeden blok. Pas wymiarowy 11 cm rozciąga się od punktu kotwiczenia przez `scaleX`, po czym liczba pojawia się bez zmiany szerokości layoutu. · **TRIGGER** view-once · **PROPS** `transform: translateY/scaleX`, `opacity` · **STAGGER** tak(`.06s`) · **FALLBACK** reduced-motion: flat-lay, tabela i pełny wymiar widoczne od razu / no-JS: statyczny komplet informacji bez ukrytych elementów.

[zamow] | L1 | Zamów Ugniatka  
**STORYBOARD** Wyłącznie zewnętrzny wrapper sekcji podnosi się o mały dystans i odzyskuje pełną widoczność. Checkout, jego kroki, pola, walidacja i stany pozostają całkowicie nietknięte. · **TRIGGER** view-once · **PROPS** `transform: translateY`, `opacity` · **STAGGER** nie · **FALLBACK** reduced-motion: sekcja od razu w pozycji końcowej / no-JS: cały checkout widoczny i funkcjonalny bez animacji wejścia.

[faq] | L2 | Pytania przed zakupem  
**STORYBOARD** Dwie kolumny FAQ pojawiają się jako jeden uporządkowany blok. Otwarcie natywnego `details` daje treści krótki fade z minimalnym przesunięciem, bez animowania wysokości i bez opóźniania natywnej odpowiedzi kontrolki. · **TRIGGER** view-once + hover-press (press/tap/klawiatura, bez hover-only) · **PROPS** `transform: translateY`, `opacity` · **STAGGER** nie · **FALLBACK** reduced-motion: odpowiedzi przełączają się natychmiast / no-JS: natywne `details` pozostają w pełni funkcjonalne.

[final] | L2 | Packshot, cena, CTA — domknięcie  
**STORYBOARD** Zewnętrzne kadry przesuwają się lekko ku centrum, domykając poziome pasmo. Środkowy blok z nagłówkiem, packshotem, ceną i CTA osiada jako jedna całość, bez kolejnego ambientu ani pulsowania przycisku. · **TRIGGER** view-once · **PROPS** `transform: translateX/translateY`, `opacity` · **STAGGER** tak(`.06s`) · **FALLBACK** reduced-motion: kompletne pasmo widoczne bez ruchu / no-JS: wszystkie kadry, cena i CTA od razu dostępne.