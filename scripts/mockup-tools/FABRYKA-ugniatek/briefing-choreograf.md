# CHOREOGRAF F5.0.1 — MOTION-DNA + spec animacji per sekcja (landing Ugniatek)

Jesteś choreografem ruchu landingu. To PLAN (tekst), nie kod.

## OSOBOWOŚĆ MARKI (z planu F1)
Ugniatek: rzeczowy, ciepły i domowy; „techniczna czułość" — cienkie hairlines, editorial,
zero patosu. Produkt = płaski masażer, dwa sposoby docisku (motyw przewodni: DOCISK ↔ LUZ —
napięcie i wydech). Paleta porcelanowo-szara, akcent petrol TYLKO CTA.

## ISTNIEJĄCY SYSTEM (rozszerzasz, NIE zastępujesz)
:root ma już tokeny: --mo-dur-s:.24s --mo-dur-m:.38s --mo-dur-l:.58s
--mo-ease:cubic-bezier(.22,1,.36,1) --mo-dist:16px. IO na .reveal → .in. reduced-motion OK.
Możesz skorygować wartości tokenów (osobowość!) i dodać --mo-stagger.

## SEKCJE (id | rola | treść 1 zd.)
1. hero | dyptyk 2 zdjęć + kompaktowa karta oferty na dole | dwa sposoby użycia, cena, CTA; hero-video (beat docisk↔luz) wchodzi jako tło L kolumny
2. dwie-formy | TOR-I FLAGOWA (już zaimplementowana: segmented control A/B, crossfade paneli) | przełącznik „Dociskam oburącz / Kładę i opieram się" + sylwetki stref
3. anatomia | techniczna sygnatura: realny spód + 4 calloutsy hairline | „sześć głowic pod kontrolą dwóch uchwytów"
4. sterowanie | foto panelu + tabela 4 parametrów + 2 pille | tryby P1–P9, poziomy, bateria, auto-stop
5. wieczorem | scenowa nastrojowa (2 zdjęcia + karta korzyści) | twój moment po całym dniu
6. mid-cta | konwersyjna karta [packshot | tekst+cena+CTA] | dwie formy masażu, jedno urządzenie
7. zestaw | flat-lay + tabela spec + pas z wymiarem 11 cm | co dokładnie dostajesz
8. zamow | checkout inline steps (moduł NIETYKALNY — animować wolno tylko wejście sekcji) | zamów Ugniatka
9. faq | akordeon natywny details 2 kolumny | pytania przed zakupem
10. final | poziome pasmo [kadr | nagłówek+packshot+cena+CTA | kadr] | domknięcie

## ZADANIE
Wypisz DOKŁADNIE wg formatu:
### MOTION-DNA: ugniatek
OSOBOWOŚĆ RUCHU (1 zd.) + TOKENY (wartości --mo-*) + SKALA L1/L2/L3 + BUDŻET.
### SPEC PER SEKCJA (10 pozycji)
[sekcja-id] | L1/L2/L3 | MOTYW ≤6 słów (z TREŚCI sekcji!)
STORYBOARD (2-3 zd.) · TRIGGER (view-once/scroll-scrubbed/idle-ambient/hover-press)
· PROPS (tylko transform/opacity) · STAGGER tak(krok)/nie · FALLBACK reduced-motion/no-JS.

Zasady twarde: wejścia ≤.72s; L3 MAX 2 (dwie-formy JUŻ jest L3 nr 1 — zdecyduj czy dawać
drugą, np. sterowanie/anatomia, czy zostawić 1); ≤1 ambient; animować tylko transform/opacity;
motyw z TREŚCI (docisk/luz, hairline rysuje się, kroki zapalają się...), nie generyczny AOS;
hover-only zakazany (press/scroll odpowiednik); moduł checkoutu = tylko wejście sekcji.
