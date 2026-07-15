# 01-MVP-SCOPE — osobisty trener rozmów biznesowych (PROPOZYCJA do decyzji Tomka, 2026-07-15)

> Wygenerowane z handoff packu + 94 elementów bazy wiedzy spowiednika + raportu rynkowego sesji.
> Tomek TNIE i zatwierdza; po zatwierdzeniu plik przechodzi do paczki `brief/01-MVP-SCOPE.md` w repo aplikacji.
> Projekt w panelu: /tn-app/projekt?id=858427d1-107f-48a9-9b91-3fe4999702e0 · termin umowny: 21.08.2026
> Klient/operator: Tomek Jankowiak. Rozstrzygnięcia otwartych decyzji: `DECYZJE.md` (D1–D14).

## Definicja v1 (1 zdanie)
Użytkownik wchodzi na konkretne spotkanie biznesowe przygotowany jak nigdy: aplikacja robi research
firmy i rozmówcy, składa interaktywny plan rozmowy z oceną gotowości, a przed spotkaniem pozwala
przećwiczyć rozmowę z AI odgrywającym rozmówcę — po polsku, bez promptowania, w kwadrans.

## Pozycjonowanie (anty-ChatGPT — z bazy wiedzy)
Przewaga NIE jest w „wiedzy" (tę ma ChatGPT), tylko w: (1) SZYBKOŚCI — gotowy tryb zamiast wymyślania
promptów, (2) STRUKTURZE — zawsze ten sam, sprawdzony format planu i oceny, (3) SYMULACJI z wymuszonym
domknięciem — ChatGPT nie zmusi Cię do próby domknięcia i nie oceni jej wg stałych kryteriów,
(4) HISTORII postępów. Ton: osobisty trener (konkretny, spokojny), ZERO teatralnych bon motów —
ryzyko „gadżetu" z bazy wiedzy traktujemy jako twardą regułę treningu modelu i copy.

## Funkcje rdzenia (5)

**F1. Przygotowanie spotkania (formularz)**
Nowe przygotowanie: nazwa firmy + WWW, rozmówca (imię/rola; opcjonalnie wklejka „co o nim wiem",
np. treść profilu LinkedIn), kontekst i termin spotkania (wpisywany ręcznie — bez integracji kalendarza),
CEL spotkania + OCZEKIWANY NASTĘPNY KROK (co ma się wydarzyć, kto odpowiada, do kiedy) + opcjonalny Plan B
(minimalny akceptowalny rezultat). Formularz używa naturalnego języka (bez żargonu; „hipoteza problemu
klienta" → naturalne określenie wg D9).

**F2. Research AI + zatwierdzanie faktów**
AI robi research z publicznych źródeł: strona WWW firmy (crawl podanego URL) + wyszukiwarka (web search
w API modelu) — analizuje ofertę, strategię, sytuację, rynek i rolę rozmówcy (typowe zakresy
odpowiedzialności/KPI dla roli jako „wniosek AI"). KAŻDA informacja dostaje etykietę:
**potwierdzone / wniosek AI / do sprawdzenia**. Użytkownik zatwierdza fakty, edytuje, dopisuje własne
(wiedza z kontaktów osobistych = ręczna wklejka), a niepewne zamienia jednym klikiem w „Nie wiem —
zapytaj klienta" (trafia do planu jako ważne pytanie). Bez zatwierdzenia faktów plan się nie generuje.
LinkedIn/social: BEZ auto-scrapingu (ToS) — użytkownik wkleja. CRM: poza v1.

**F3. Plan rozmowy + ocena gotowości**
Interaktywny plan z zatwierdzonych faktów: otwarcie, pytania odkrywające potrzeby, prawdopodobny problem
klienta i wartość biznesowa propozycji (językiem korzyści, osadzone w realnej ofercie firmy — nie
prezentacja technologii), przewidywane obiekcje + podpowiedzi reakcji (wg wzorców z bazy wiedzy:
sekwencja zgoda→15 min→zakończenie bez presji itd.), pytania „do ustalenia w rozmowie" (z F2).
Interakcje: oznacz przeczytane / najważniejsze / ulubione, kopiuj wybrane treści. Regeneracja planu po
zmianie faktów. **Ocena gotowości %**: 40% podstawy (firma, rozmówca, cel + następny krok) · 30% wiedza
pogłębiona (problem, wartość, obiekcje) · 30% ukończony trening; zawsze z LISTĄ BRAKÓW („czego dopiąć,
żeby być gotowym"). Wskaźnik = gotowość do rozmowy, nie szansa powodzenia (komunikowane wprost).

**F4. Symulacja z AI (tekstowa) + raport**
Czat „Przećwicz": AI odgrywa KONKRETNEGO rozmówcę (z zatwierdzonego researchu) albo NEUTRALNEGO klienta
(gdy danych za mało — z wyraźnym komunikatem; próg wg D6). Dwa tryby: **TRENING** (podgląd planu obok,
podpowiedzi trenera w trakcie, można przerwać bez konsekwencji, wynik nieoficjalny) i **EGZAMIN**
(bez podpowiedzi, scenariusze z twardymi obiekcjami/presją czasu/kwestionowaniem wartości, poziom
trudności auto z postępów + ręczna zmiana przed startem). Egzaminu nie da się zakończyć bez PRÓBY
DOMKNIĘCIA następnego kroku (mniejszy konkretny krok = częściowy sukces). **Raport 1–10**: 40% realizacja
celu · 25% trafność pytań · 20% reakcje na obiekcje · 15% pewność i naturalność (premiowane: parafraza,
pytanie przed odpowiedzią; karane: formułki, nadmierne tłumaczenie się, odpowiadanie bez zrozumienia;
długość wypowiedzi tylko pomocniczo). Krótkie dosłowne cytaty (zanonimizowane) + wnioski. Po nieudanym
domknięciu: wskazówka + JEDNA powtórka końcówki; raport pokazuje obie próby obok siebie; powtórka nie
zmienia wyniku. Prywatność: po raporcie transkrypcja jest domyślnie USUWANA (zostają ocena, wnioski,
cytaty); zapis pełnej treści = świadomy opt-in (D10).

**F5. Pulpit + historia + konto + subskrypcja**
Pulpit: najbliższe spotkanie, pozostały czas przygotowania, poziom gotowości, ocena ostatniej rozmowy,
CTA „Nowe przygotowanie". Historia: lista przygotowań ze statusami (w przygotowaniu / gotowe / po
egzaminie), oceny gotowości i egzaminów w czasie (prosty trend). Konto e-mail+hasło (standard startera),
profil (imię, rola, opcjonalnie opis własnej oferty — wchodzi do kontekstu planów), subskrypcja Stripe
(plany wg kroku `pricing`; trial wg decyzji tam), rabaty operatora (moduł standardowy fabryki).
Mobile-first (przygotowanie czytane tuż przed spotkaniem z telefonu).

## Poza zakresem v1 (świadome cięcia)
- **Tryb GŁOSOWY symulacji** — najważniejsze cięcie (D1): koszt/architektura/prywatność; czat tekstowy
  realizuje wartość treningu. Kandydat #1 na rozwój (v1.1+).
- Integracje CRM (D3) i kalendarza (D13); auto-scraping LinkedIn/social (użytkownik wkleja).
- Konta firmowe/panel administratora firmy (D12): v1 = konta indywidualne; „pakiet firmowy" obsługuje
  operator (kody rabatowe/faktura zbiorcza). Multi-seat = rozwój.
- Nagrania audio i pełny magazyn transkrypcji (tylko opt-in per przygotowanie, D10).
- Biblioteka literatury/cytatów, kursy komunikacji, ścieżki coachingowe, tryby rekrutacja/networking
  jako OSOBNE moduły (v1 obsługuje je jednym formularzem — pole „kontekst spotkania").
- Aplikacja natywna; wysyłka planu e-mailem (v1: kopiowanie treści).

## Metryka aktywacji + TTFV
**Aha-moment #1 (aktywacja, `AHA_EVENT`): pierwszy WYGENEROWANY PLAN rozmowy** — cel TTFV **< 10 minut**
od rejestracji (formularz 2–3 min + research 1–2 min + zatwierdzenie 2 min + generacja <1 min).
Zdrowie tygodnia 1: **pierwszy RAPORT z egzaminu** (pełna pętla wartości). Te dwa eventy = `activated_at`
+ baza lifecycle-maili (nudge 24–48 h: „masz plan — przećwicz rozmowę zanim wejdziesz na spotkanie").

## Granica „w cenie v1 vs rozwój" (do akceptu klienta przy demo)
- **W cenie:** poprawki błędów; korekty UI/UX, treści i tonu trenera; drobne modyfikacje funkcji z tej
  listy (łącznie do ~2 dni pracy po demo).
- **Rozwój (osobna wycena):** każda pozycja z „Poza zakresem" (głos, CRM, multi-seat, kalendarz…),
  nowe ekrany/moduły, zmiany metodologii oceny wykraczające poza strojenie wag. Rozstrzyga ten dokument.

## Kryteria „gotowe" (per funkcja — skrót; pełne w paczce)
F1: przygotowanie od zera w <3 min na telefonie; walidacja minimum (firma+rozmówca+cel+następny krok).
F2: research z realnej strony WWW → fakty z etykietami; edycja/zatwierdzanie/„zapytaj klienta" działa;
plan zablokowany do zatwierdzenia faktów. F3: plan kompletny (wszystkie sekcje) z realnej firmy testowej;
gotowość liczy się wg wag i pokazuje braki; interakcje + kopiowanie działają. F4: pełna pętla
trening→egzamin→wymuszone domknięcie→raport→powtórka→porównanie prób na koncie testowym; neutralny tryb
komunikowany; transkrypcja usuwana po raporcie (dowód w DB). F5: trial→płatność E2E na koncie testowym
Stripe; pulpit i historia odzwierciedlają realne dane.

## Moduły → sesje budowy (do 08-PLAN-SESJI)
S4a: F1 formularz + encje przygotowania · S4b: F2 research (edge fn z web search) + fakty/etykiety ·
S4c: F3 generator planu + interakcje + gotowość · S4d: F4 symulacja czat (trening/egzamin, poziomy,
domknięcie) · S4e: F4 raport + powtórka + retencja · S4f: F5 pulpit + historia. Konto/subskrypcja =
standard startera (S3/S7). AI: model + web search jak w sparingu tn-crm (wzorzec spar-assess);
koszty AI per przygotowanie do policzenia w paczce (05/07).

## Miejsca wymagające decyzji Tomka
1. Akcept cięcia D1 (symulacja TEKSTOWA w v1) — najważniejsza decyzja zakresu.
2. Akcept D12 (bez kont firmowych w v1; pakiet firmowy przez operatora).
3. Pricing (osobny krok — propozycja po researchu agentów).
4. D9 — naturalne określenie zamiast „hipotezy problemu klienta" (propozycje w DECYZJE.md).
