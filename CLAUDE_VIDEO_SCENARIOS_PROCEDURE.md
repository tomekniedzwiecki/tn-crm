# Procedura: Generowanie Scenariuszy Video TikTok

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń).

## Kiedy wywołać

Użytkownik mówi: "Wygeneruj scenariusze video dla workflow X"

## Co generuje

**10 prostych scenariuszy video** podzielonych na dwie kategorie:
- **5 scenariuszy Z TWARZĄ** — nagrywający jest widoczny
- **5 scenariuszy BEZ TWARZY** — tylko ręce/produkt/otoczenie

---

## Struktura scenariusza

```json
{
  "id": "scenario_1",
  "type": "POV",
  "showFace": true,
  "title": "Krótki tytuł (max 30 znaków)",
  "hook": "Co zrobić na początku (1-2 zdania)",
  "action": "Co zrobić z produktem (2-3 zdania)",
  "ending": "Jak zakończyć (1-2 zdania)",
  "duration": "15-20 sek",
  "tip": "Konkretna wskazówka techniczna",
  "soundTip": "Sugestia dźwięku/muzyki",
  "textOverlay": "Opcjonalny tekst do wyświetlenia na ekranie"
}
```

### Pola:
- **type** — typ scenariusza (patrz sekcja "Typy scenariuszy")
- **showFace** — `true` = z twarzą, `false` = bez twarzy
- **title** — krótki, chwytliwy tytuł widoczny dla klienta
- **hook** — co zrobić w PIERWSZYCH 3 SEKUNDACH (najważniejsze!)
- **action** — główna akcja z produktem, opisz konkretnie co robić
- **ending** — jak zakończyć video (CTA lub punchline)
- **duration** — sugerowany czas trwania
- **tip** — wskazówka dot. oświetlenia, kąta kamery, ustawienia
- **soundTip** — czy użyć oryginalnego dźwięku, muzyki, czy voiceover
- **textOverlay** — tekst do dodania w edytorze TikTok (opcjonalnie)

---

## Zasady tworzenia scenariuszy

### MUSI być:
- ✅ **PROSTE** — 3 kroki, każdy w 1-3 zdaniach
- ✅ **Bez montażu** — jedno ciągłe nagranie, bez cięć
- ✅ **Bez innych osób** — nagrywający sam
- ✅ **Bez specjalnych lokacji** — dom, pokój, biurko
- ✅ **Krótkie** — 15-30 sekund max
- ✅ **Konkretne** — opisz DOKŁADNIE co zrobić, nie ogólnikowo

### NIE MOŻE być:
- ❌ Skomplikowane scenariusze wymagające planowania
- ❌ Potrzeba dodatkowego sprzętu (gimbal, oświetlenie studyjne)
- ❌ Dialogi z innymi osobami
- ❌ Efekty specjalne wymagające umiejętności montażu
- ❌ Scenariusze dłuższe niż 30 sekund
- ❌ **CENY** — nigdy nie podawaj cen produktu w scenariuszach (ani w textOverlay, ani w hook/action/ending)
- ❌ **ANGIELSKIE ZWROTY** — unikaj angielskich słów i fraz (np. "glow up", "morning routine", "goals") — klienci mogą ich nie zrozumieć. Pisz po polsku!

### Scenariusze BEZ TWARZY (showFace: false):
- ❌ Nigdy nie wymagają pokazywania twarzy
- ✅ Skupione na produkcie, rękach, otoczeniu
- ✅ Idealne dla osób nieśmiałych lub bez doświadczenia
- ✅ Łatwiejsze do nagrania — mniej stresu
- ✅ Często lepiej się sprawdzają dla produktów fizycznych

---

## Typy scenariuszy — szczegółowy opis

### Z TWARZĄ (showFace: true):

#### 1. POV (Point of View)
**Co to jest:** Widz "wchodzi" w sytuację, a ty reagujesz
**Format:** "POV: [sytuacja]" → twoja reakcja
**Przykładowe sytuacje:**
- POV: Kupiłeś coś dziwnego online
- POV: Znajomi pytają co to za urządzenie
- POV: Wracasz zmęczony z pracy

**Wskazówki:**
- Zacznij od bezpośredniego kontaktu wzrokowego z kamerą
- Mimika jest kluczowa — przesadzaj z emocjami
- Tekst POV na początku, potem akcja

#### 2. Reakcja
**Co to jest:** Pokazujesz autentyczną emocję na produkt
**Format:** Zaskoczenie → demonstracja → satysfakcja
**Przykładowe reakcje:**
- Pierwsza reakcja na działanie produktu
- "Nie wiedziałem że to tak działa"
- Zaskoczenie jakością/efektem

**Wskazówki:**
- Niech emocje będą widoczne na twarzy
- Możesz mówić do kamery lub używać tekstu
- Autentyczność > perfekcja

#### 3. Rutyna
**Co to jest:** Pokazujesz produkt jako część codzienności
**Format:** Moment dnia → użycie produktu → efekt
**Przykładowe rutyny:**
- Poranna rutyna z produktem
- Wieczorny relaks
- Przerwa w pracy

**Wskazówki:**
- Pokaż kontekst (poranek = kawa, wieczór = przyciemnione światło)
- Naturalność jest kluczowa
- Produkt ma "wchodzić" naturalnie w scenę

#### 4. Porównanie / Transformacja
**Co to jest:** Kontrast między "przed" a "po"
**Format:** Problem/nuda → produkt → rozwiązanie/radość
**Przykładowe porównania:**
- Znudzony → energiczny po użyciu produktu
- Stres → relaks
- Standardowe rozwiązanie vs twój produkt

**Wskazówki:**
- Wyraźny kontrast w mimice i energii
- Można użyć efektu "transition" w TikTok
- Muzyka może podkreślić zmianę

#### 5. Storytime
**Co to jest:** Krótka historia/anegdota związana z produktem
**Format:** "Kupiłem to bo..." → co się stało → punchline
**Przykładowe historie:**
- Jak odkryłem ten produkt
- Co myślałem przed zakupem vs teraz
- Śmieszna sytuacja z produktem

**Wskazówki:**
- Mów naturalnie, jak do znajomego
- Historia musi mieć punchline na końcu
- Możesz gestykulować, pokazywać produkt w trakcie

---

### BEZ TWARZY (showFace: false):

#### 6. Efekt WOW
**Co to jest:** Pokazanie najlepszej cechy produktu w akcji
**Format:** Teaser → reveal → close-up na efekt
**Co pokazać:**
- LED-y włączające się w ciemności
- Nieoczekiwana funkcja
- Jakość wykonania w detalu

**Wskazówki:**
- Ciemne otoczenie dla efektów świetlnych
- Slowmo dla dynamicznych momentów
- Cisza lub dramatyczna muzyka przed reveal

#### 7. ASMR
**Co to jest:** Skupienie na dźwiękach produktu
**Format:** Cisza → dźwięki produktu → close-upy
**Co nagrać:**
- Dźwięk włączania/wyłączania
- Tekstury, kliknięcia, mechanizmy
- Rytmiczne używanie produktu

**Wskazówki:**
- NAGRAJ W CISZY — dźwięk produktu jest gwiazdą
- Close-upy na detale
- Spokojne, metodyczne ruchy
- Nie dodawaj muzyki!

#### 8. Tutorial / How-to
**Co to jest:** Prosta instrukcja użycia
**Format:** Problem → krok 1 → krok 2 → krok 3 → gotowe
**Co pokazać:**
- Jak włączyć/uruchomić
- Jak wybrać tryb/opcję
- Jak uzyskać najlepszy efekt

**Wskazówki:**
- Pokaż tylko ręce i produkt (widok z góry lub pod kątem)
- Spokojne, wyraźne ruchy
- Można dodać tekst z numeracją kroków
- Voiceover lub tekst na ekranie

#### 9. Unboxing
**Co to jest:** Rozpakowywanie produktu
**Format:** Zamknięta paczka → otwieranie → reveal produktu
**Co pokazać:**
- Jakość opakowania
- Moment wyjmowania
- Pierwsze wrażenie (włączenie)

**Wskazówki:**
- Dobre oświetlenie — produkt musi wyglądać premium
- Spokojne tempo, buduj napięcie
- Zatrzymaj się na reveal — daj widzowi czas zobaczyć
- Można użyć ASMR dźwięków otwierania

#### 10. Estetyka / Setup
**Co to jest:** Produkt jako element stylowego otoczenia
**Format:** Szerokie ujęcie → zbliżenie → produkt w akcji
**Co pokazać:**
- Jak produkt wygląda w twoim pokoju/na biurku
- Ładne detale, kolory, światło
- Produkt jako element lifestyle'u

**Wskazówki:**
- POSPRZĄTAJ TŁO — ma być estetycznie
- Naturalne światło lub ciepłe lampki
- Slow motion dla efektu premium
- Muzyka lo-fi lub ambient

---

## Wskazówki techniczne (dla wszystkich typów)

### Oświetlenie:
- **Dzień**: Naturalne światło z okna (najlepsze!)
- **Wieczór**: Ciepłe lampki, LED-y produktu
- **LED-y produktu**: Przyciemnij pokój żeby były widoczne
- **Unikaj**: Światła z tyłu (kontra), jarzeniówek

### Kąt kamery:
- **Z twarzą**: Na wysokości oczu lub lekko z góry
- **Bez twarzy**: Z góry (bird's eye) lub pod kątem 45°
- **Produkt**: Na wysokości produktu dla dramatyzmu

### Dźwięk:
- **Oryginalny dźwięk**: Dla ASMR, unboxing, efektów
- **Trending audio**: Dla POV, reakcji, porównań
- **Voiceover**: Dla tutorial, storytime
- **Cisza + tekst**: Zawsze działa

### Tekst na ekranie:
- **Hook**: Pierwsze 1-2 sekundy, duży tekst
- **Kontekst**: Mały tekst wyjaśniający sytuację
- **CTA**: Na końcu "Link w bio" / "Sprawdź to"

---

## Proces generowania

### Krok 1: Pobierz dane o produkcie
```bash
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"
```

### Krok 2: Przeanalizuj produkt
- Jaki to typ produktu? (fizyczny, cyfrowy, usługa)
- Jakie ma główne cechy? (LED-y, dźwięki, efekty wizualne)
- Kto jest grupą docelową?
- Jakie emocje ma wywoływać?

### Krok 3: Napisz 10 scenariuszy
- **Scenariusze 1-5**: showFace: true (typy: POV, Reakcja, Rutyna, Porównanie, Storytime)
- **Scenariusze 6-10**: showFace: false (typy: Efekt WOW, ASMR, Tutorial, Unboxing, Estetyka)

### Krok 4: Dostosuj do produktu
- Użyj konkretnych cech produktu w scenariuszach
- Dopasuj lokalizację (salon, biurko, siłownia)
- Dostosuj czas trwania do złożoności akcji

---

## Format SQL wyjściowego

> **WAŻNE**: Używaj `$$` delimitera zamiast pojedynczych apostrofów `'` dla JSON-a. Apostrofy w tekście scenariuszy (np. "what's this") powodują błędy SQL.

```sql
INSERT INTO workflow_video (workflow_id, video_scenarios)
VALUES ('152f445f-b318-4e97-ba13-b9d901814ee8', $$[
  {"id": "scenario_1", "showFace": true, ...},
  {"id": "scenario_2", "showFace": true, ...},
  {"id": "scenario_3", "showFace": true, ...},
  {"id": "scenario_4", "showFace": true, ...},
  {"id": "scenario_5", "showFace": true, ...},
  {"id": "scenario_6", "showFace": false, ...},
  {"id": "scenario_7", "showFace": false, ...},
  {"id": "scenario_8", "showFace": false, ...},
  {"id": "scenario_9", "showFace": false, ...},
  {"id": "scenario_10", "showFace": false, ...}
]$$::jsonb)
ON CONFLICT (workflow_id) DO UPDATE SET video_scenarios = EXCLUDED.video_scenarios;
```

### Jak wykonać SQL

**Wykonaj ręcznie przez Supabase SQL Editor** — curl/REST API nie działa dobrze z polskimi znakami i cudzysłowami w JSON.

1. Otwórz: https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/sql/new
2. Wklej wygenerowany SQL
3. Kliknij "Run"

---

## Przykładowe scenariusze (VibeStrike - maszyna bokserska)

### Z TWARZĄ:

```json
{
  "id": "scenario_1",
  "type": "POV",
  "showFace": true,
  "title": "Po ciężkim dniu w pracy",
  "hook": "Wejdź do pokoju ze zmęczoną miną, westchnij głęboko. Rzuć okiem na maszynę.",
  "action": "Podejdź zdecydowanie do maszyny, włącz ją jednym ruchem. Daj serię dynamicznych ciosów — pokaż energię i frustrację.",
  "ending": "Odwróć się do kamery z uśmiechem ulgi. Możesz otrzeć czoło lub pokazać kciuk w górę.",
  "duration": "15-20 sek",
  "tip": "Przyciemnij pokój żeby LED-y były widoczne. Możesz nagrać wieczorem.",
  "soundTip": "Użyj trenującego audio z TikTok lub oryginalny dźwięk uderzeń",
  "textOverlay": "POV: Wracasz z pracy i masz dosyć wszystkiego"
}
```

```json
{
  "id": "scenario_2",
  "type": "Reakcja",
  "showFace": true,
  "title": "Kiedy goście pytają co to",
  "hook": "Zrób zdziwioną/zdezorientowaną minę jakby ktoś właśnie zadał pytanie. Popatrz w bok jakby tam stała osoba.",
  "action": "Wskaż na maszynę z dumą, podejdź i włącz ją. Pokaż 3-4 ciosy z uśmiechem.",
  "ending": "Wzrusz ramionami z dumnym uśmiechem typu 'no co, fajne prawda?'",
  "duration": "15-20 sek",
  "tip": "Przesadzone miny są OK na TikTok! Im bardziej ekspresyjnie, tym lepiej.",
  "soundTip": "Trending audio z pytaniem lub oryginalny dźwięk",
  "textOverlay": "- Co to jest?\n- No patrz..."
}
```

```json
{
  "id": "scenario_3",
  "type": "Rutyna",
  "showFace": true,
  "title": "Moje poranne 10 minut",
  "hook": "Pokaż poranek — kubek kawy w ręku, rozciąganie, ziewanie. Naturalne światło z okna.",
  "action": "Odłóż kawę, podejdź do maszyny. Zrób krótki ale intensywny trening — pokaż 3 różne serie ciosów.",
  "ending": "Weź łyk kawy, pokaż że jesteś rozbudzony. Kciuk w górę lub uśmiech do kamery.",
  "duration": "20-25 sek",
  "tip": "Poranne światło wygląda najlepiej! Nagraj przy oknie.",
  "soundTip": "Spokojna muzyka poranna lub motivational audio",
  "textOverlay": "Poranna rutyna która mnie obudziła lepiej niż kawa"
}
```

```json
{
  "id": "scenario_4",
  "type": "Porównanie",
  "showFace": true,
  "title": "Siłownia vs mój salon",
  "hook": "Pierwsza część: znudzona/zmęczona mina, jakbyś myślał o siłowni o 6 rano. Możesz pokręcić głową 'nie'.",
  "action": "Transition: uśmiech, energia! Podchodzisz do maszyny w swoim salonie, dajesz serię ciosów z entuzjazmem.",
  "ending": "Pokazujesz zadowoloną minę i gest 'to jest to!' — kciuk w górę lub rozkładasz ręce.",
  "duration": "15-20 sek",
  "tip": "Kontrast energii jest kluczowy — najpierw max nuda, potem max energia!",
  "soundTip": "Audio z transition effect lub 'glow up' sound",
  "textOverlay": "Siłownia o 6 rano: 😴\nMój salon o dowolnej porze: 💪"
}
```

```json
{
  "id": "scenario_5",
  "type": "Storytime",
  "showFace": true,
  "title": "Myślałem że to zabawka",
  "hook": "Zacznij mówić do kamery naturalnie: 'Kupiłem to myśląc że to taka zabawka...' z lekkim uśmiechem.",
  "action": "Podejdź do maszyny, włącz ją. Daj kilka mocnych ciosów pokazując że to poważny sprzęt. Pokaż intensywność.",
  "ending": "Pokaż spocone czoło lub zmęczoną ale zadowoloną minę. Powiedz lub napisz: '...pomyliłem się'",
  "duration": "20-25 sek",
  "tip": "Mów naturalnie jak do znajomego. Nie czytaj ze skryptu — improwizuj!",
  "soundTip": "Oryginalny dźwięk z twoim głosem lub voiceover",
  "textOverlay": "Kupiłem to myśląc że to zabawka..."
}
```

### BEZ TWARZY:

```json
{
  "id": "scenario_6",
  "type": "Efekt WOW",
  "showFace": false,
  "title": "LED-y w ciemności",
  "hook": "Zacznij od ciemnego pokoju — widać tylko zarys maszyny. Buduj napięcie przez 2-3 sekundy ciszy.",
  "action": "Włącz maszynę — pokaż jak LED-y rozświetlają pokój kolorami. Daj kilka ciosów żeby pokazać pełen efekt świetlny.",
  "ending": "Zatrzymaj nagranie na ładnym kadrze z kolorowymi LED-ami. Możesz zrobić slow-mo ostatniego ciosu.",
  "duration": "15-20 sek",
  "tip": "Im ciemniej w pokoju, tym lepiej wyglądają LED-y. Nagraj wieczorem przy zasłoniętych oknach.",
  "soundTip": "Dramatyczna muzyka z buildup lub oryginalny dźwięk uderzeń w ciszy",
  "textOverlay": "Mój pokój o 23:00"
}
```

```json
{
  "id": "scenario_7",
  "type": "ASMR",
  "showFace": false,
  "title": "Dźwięk treningu",
  "hook": "Close-up na wyłączoną maszynę. Cisza przez 2 sekundy — buduj oczekiwanie.",
  "action": "Włącz maszynę (pokaż dźwięk włączania). Nagraj rytmiczne uderzenia — pozwól dźwiękom wybrzmieć. Pokaż LED-y zmieniające kolor przy każdym ciosie.",
  "ending": "Ostatni mocny cios, pauza, cisza. Zatrzymaj na świecących LED-ach.",
  "duration": "20-30 sek",
  "tip": "NAGRAJ W CAŁKOWITEJ CISZY — wyłącz muzykę, zamknij okna. Dźwięk produktu jest gwiazdą!",
  "soundTip": "ORYGINALNY DŹWIĘK - absolutnie nie dodawaj muzyki!",
  "textOverlay": "Dźwięk którego potrzebowałeś 🔊"
}
```

```json
{
  "id": "scenario_8",
  "type": "Tutorial",
  "showFace": false,
  "title": "Jak zacząć trening",
  "hook": "Pokaż maszynę z góry (widok bird's eye) — twoje ręce przy produkcie. Czyste, uporządkowane tło.",
  "action": "Krok po kroku: 1) Pokaż przycisk włączania, włącz. 2) Pokaż jak wybrać tryb/poziom trudności. 3) Pokaż pierwsze uderzenia z prawidłową techniką.",
  "ending": "Pokaż efekt końcowy — LED-y sygnalizujące aktywność lub wynik na ekranie jeśli jest.",
  "duration": "20-30 sek",
  "tip": "Spokojne, wyraźne ruchy rąk. Widz musi widzieć co robisz. Można zwolnić tempo.",
  "soundTip": "Voiceover z instrukcją lub tekst na ekranie z numeracją kroków",
  "textOverlay": "Krok 1: Włącz\nKrok 2: Wybierz tryb\nKrok 3: Trenuj!"
}
```

```json
{
  "id": "scenario_9",
  "type": "Unboxing",
  "showFace": false,
  "title": "Co jest w paczce",
  "hook": "Pokaż zamkniętą paczkę z widocznym logo/marką. Twoje ręce gotowe do otwierania. Czyste tło.",
  "action": "Otwieraj powoli — pokaż jakość opakowania. Wyciągnij produkt z opakowania, pokaż go z różnych stron. Ustaw na miejscu.",
  "ending": "Włącz na chwilę — LED-y się zapalają. Zatrzymaj na tym momencie reveal.",
  "duration": "25-30 sek",
  "tip": "Dobre oświetlenie jest KLUCZOWE — produkt musi wyglądać premium. Użyj naturalnego światła.",
  "soundTip": "ASMR dźwięki otwierania kartonu, folii. Lub spokojna muzyka w tle.",
  "textOverlay": "Sprawdźmy co przyszło 📦"
}
```

```json
{
  "id": "scenario_10",
  "type": "Estetyka",
  "showFace": false,
  "title": "Setup w moim pokoju",
  "hook": "Szerokie ujęcie twojego pokoju/kącika do ćwiczeń. Maszyna jako część estetycznego setupu.",
  "action": "Powolne zbliżenie na maszynę — pokaż detale, tekstury, LED-y. Możesz pokazać ją z różnych kątów.",
  "ending": "Włącz maszynę, pokaż jak wygląda w akcji w tym otoczeniu. Zakończ na ładnym kadrze.",
  "duration": "20-25 sek",
  "tip": "POSPRZĄTAJ TŁO — ma być estetycznie i 'instagramowo'. Dodaj rośliny, lampki, ładne dodatki.",
  "soundTip": "Lo-fi muzyka, chillhop lub ambient. Spokojna atmosfera.",
  "textOverlay": "Room tour: fitness edition 🏠"
}
```

---

## Konfiguracja

- **Supabase URL**: `https://yxmavwkwnfuphjqbelws.supabase.co`
- **Service Key**: w pliku `.env` (zmienna `SUPABASE_SERVICE_KEY`)

---

## Szablon promptu

```
Wygeneruj scenariusze video dla workflow [UUID]

Instrukcje: c:\repos_tn\tn-crm\CLAUDE_VIDEO_SCENARIOS_PROCEDURE.md
Env: c:\repos_tn\tn-crm\.env
```
