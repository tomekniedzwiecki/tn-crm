# Procedura: Generowanie Scenariuszy Video TikTok

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń).

## Kiedy wywołać

Użytkownik mówi: "Wygeneruj scenariusze video dla workflow X"

## Co generuje

**10 VIRALOWYCH scenariuszy video** podzielonych na dwie kategorie:
- **5 scenariuszy Z TWARZĄ** — emocje, drama, rant, storytelling
- **5 scenariuszy BEZ TWARZY** — relatability, ekskluzywność, challenge

> **PAMIĘTAJ:** To NIE są reklamy produktu. To content który ludzie CHCĄ oglądać, udostępniać i komentować. Produkt jest drugorzędny — emocje są pierwsze.

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

## ⚠️ MINDSET VIRALOWY — PRZECZYTAJ NAJPIERW!

> **KLUCZOWE:** Nie piszesz reklamy produktu. Piszesz content który ludzie CHCĄ oglądać, udostępniać i komentować. Produkt jest DRUGORZĘDNY — emocje są PIERWSZE.

### Co sprawia że video jest viralne:

| Element | Nudne (NIE RÓB) | Viralne (TAK!) |
|---------|-----------------|----------------|
| **Hook** | "Cześć, dziś pokażę wam produkt..." | "PIĘTNAŚCIE LAT łykałam tabletki i NIKT mi nie powiedział..." |
| **Emocja** | Uśmiech, spokój | DRAMA, złość, śmiech, zaskoczenie, niedowierzanie |
| **Pozycja ciała** | Stoisz/siedzisz normalnie | Leżysz na podłodze, zwijasz się, dramatyczne pozy |
| **Ton** | Prezentacja produktu | Rant do przyjaciółki, plotka, wyznanie |
| **Zakończenie** | "Link w bio" | Punchline, twist, "no powiedzcie że nie mam racji" |

### 5 filarów viralowego contentu:

1. **RELATABILITY** — widz musi powiedzieć "O KURDE TO JA"
2. **DRAMA i PRZESADA** — TikTok to teatr, nie dokumentalny
3. **KONTROWERSJA** — opinie wywołują komentarze, komentarze = algorytm
4. **EKSKLUZYWNOŚĆ** — "tylko my to rozumiemy", "faceci nie zrozumieją"
5. **TWIST/PUNCHLINE** — zaskoczenie na końcu trzyma do końca

### Viralne hooki — szablony:

```
"POV: [relatywna sytuacja z problemem]"
"Muszę wam powiedzieć o czymś co powinnyśmy wiedzieć DAWNO"
"[X] lat robiłam [stare rozwiązanie] i NIKT mi nie powiedział że..."
"Ten post jest dla 50% populacji. Reszta nie zrozumie."
"Hot take który rozwścieczy połowę internetu"
"Rzeczy o [temacie] których nikt ci nie powie"
"Moja [mama/chłopak/koleżanka] zobaczyła co [robię] i..."
"Zamówiłam to o 3 w nocy w akcie desperacji"
"Najlepsza decyzja którą podjęłam [kontekst]"
"To powinno być refundowane przez NFZ"
```

### Viralne zakończenia — szablony:

```
"...no powiedzcie że nie mam racji"
"Wyślij tej jednej koleżance która ZROZUMIE"
"Jeśli rozumiesz — wiesz. Jeśli nie — ciesz się."
"Dlaczego ja o tym nie wiedziałam wcześniej?!"
"Najlepsza decyzja podjęta o 3 w nocy"
"[Osoba] zamówiła sobie dwie sztuki"
"I teraz... serio?" (z niedowierzaniem)
```

---

## Zasady tworzenia scenariuszy

### MUSI być:
- ✅ **VIRALOWE** — emocje > produkt, drama > prezentacja
- ✅ **PROSTE** — 3 kroki, każdy w 1-3 zdaniach
- ✅ **Bez montażu** — jedno ciągłe nagranie, bez cięć (max prosty transition)
- ✅ **Bez innych osób** — nagrywający sam
- ✅ **Bez specjalnych lokacji** — dom, pokój, biurko
- ✅ **Krótkie** — 15-30 sekund max
- ✅ **Konkretne** — opisz DOKŁADNIE co robić, nie ogólnikowo
- ✅ **HOOK W PIERWSZEJ SEKUNDZIE** — zatrzymaj scrollowanie natychmiast

### NIE MOŻE być:
- ❌ **NUDNE** — typowa prezentacja produktu, "dziś pokażę wam..."
- ❌ **BEZ EMOCJI** — spokojny, neutralny ton
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

## Typy scenariuszy — VIRAL EDITION

### Z TWARZĄ (showFace: true):

#### 1. POV Drama
**Co to jest:** Widz "wchodzi" w DRAMATYCZNĄ sytuację, ty reagujesz PRZESADNIE
**Format:** "POV: [bolesna/śmieszna relatywna sytuacja]" → dramatyczna reakcja → produkt ratuje
**Przykładowe sytuacje:**
- POV: Tłumaczysz facetowi dlaczego nie możesz wstać z kanapy
- POV: Ktoś mówi "to tylko ból, weź tabletkę"
- POV: Twoja mama pyta co to za urządzenie

**Wskazówki:**
- PRZESADZAJ z mimiką — to ma być teatr!
- Leż na podłodze, zwij się, rób dramatyczne miny
- Hook MUSI zatrzymać scrollowanie

#### 2. Rant / Wygadanie się
**Co to jest:** Emocjonalne wyżalenie się do kamery z produktem jako rozwiązaniem
**Format:** "Muszę wam powiedzieć..." → złość/frustracja → produkt → ulga
**Przykładowe ranty:**
- "X LAT robiłam [stare rozwiązanie] i NIKT mi nie powiedział..."
- "Dlaczego tego nie uczą w szkole?!"
- "Jestem wściekła że dopiero teraz się dowiedziałam"

**Wskazówki:**
- Autentyczna ZŁOŚĆ lub NIEDOWIERZANIE
- Gestykuluj! Mów głośno!
- To wywołuje komentarze = algorytm kocha

#### 3. Storytime z twistem
**Co to jest:** Historia która zaczyna się zwyczajnie ale ma ZASKAKUJĄCE zakończenie
**Format:** "Okej, historia z wczoraj..." → budowanie → TWIST/punchline
**Przykładowe historie:**
- "Moja mama zobaczyła co zakładam i... [twist: zamówiła sobie dwie]"
- "Mój chłopak myślał że umieram... [twist: teraz on chce jedno dla pleców]"
- "Kupiłam to o 3 w nocy... [twist: najlepsza decyzja ever]"

**Wskazówki:**
- Buduj napięcie — nie zdradzaj punchline za wcześnie
- Mów jak do przyjaciółki przy winie
- Twist na końcu trzyma widza do końca

#### 4. Dramatyczna transformacja
**Co to jest:** MAKSYMALNY kontrast między "przed" a "po"
**Format:** Cierpienie/dramat → transition → sielanka/ulga
**Przykłady:**
- Leżysz na podłodze w bólu → transition → siedzisz z herbatą, chill
- Grymas, ból, cierpienie → transition → uśmiech, spokój
- "Ja o 3 w nocy" vs "Ja teraz"

**Wskazówki:**
- CZĘŚĆ 1 = MAKSYMALNY dramat (leż na podłodze!)
- CZĘŚĆ 2 = MAKSYMALNA sielanka
- Im większy kontrast, tym lepiej

#### 5. Hot take / Kontrowersja
**Co to jest:** Opinia która WYWOŁA dyskusję w komentarzach
**Format:** "Hot take..." → kontrowersyjna opinia → produkt jako dowód
**Przykładowe hot takes:**
- "To powinno być refundowane przez NFZ"
- "Tabletki to ściema przemysłu farmaceutycznego"
- "Dlaczego kobiety muszą cierpieć w ciszy?"

**Wskazówki:**
- Pewność siebie! Masz rację i to wiesz.
- Kontrowersja = komentarze = algorytm = viral
- Zakończ: "no powiedzcie że nie mam racji"

---

### BEZ TWARZY (showFace: false):

#### 6. Relatywny moment
**Co to jest:** Sytuacja którą KAŻDY zna, bez pokazywania twarzy
**Format:** Relatywna sytuacja (tekst) → ręce/produkt rozwiązują problem
**Przykłady:**
- "Dzień 1 vs reszta świata" — alarm, kalendarz, sięgasz po produkt
- "Każda wie o czym mówię" — bez słów, sytuacja mówi sama za siebie
- "Rzeczy które rozumie tylko 50% populacji"

**Wskazówki:**
- Hook tekstowy na początku — relatywność
- Ręce robią to co wszystkie robią w tej sytuacji
- Ludzie tagują koleżanki = viral

#### 7. Zamówienie o 3 w nocy
**Co to jest:** Historia impulsowego zakupu z happy endem
**Format:** Telefon o 3 w nocy → "KUP TERAZ" → paczka → działa!
**Przykłady:**
- Ekran telefonu z godziną 3:14 → palec wciska "zamów"
- Paczka pod drzwiami → niepewność → pozytywne zaskoczenie
- "Najlepsza decyzja podjęta w akcie desperacji"

**Wskazówki:**
- Buduj narrację: desperacja → niepewność → sukces
- Pokaż godzinę na telefonie (3 w nocy = relatable)
- Zakończ oceną produktu (gwiazdki, kciuk w górę)

#### 8. Edukacja przez szok
**Co to jest:** "Rzeczy których nikt ci nie powie" ale z emocją
**Format:** Szokujący fakt (tekst) → dowód (produkt) → CTA
**Przykłady:**
- "Rzeczy o [temacie] których nikt ci nie powie: punkt 1, 2, 3..."
- "Wiedziałaś że...? [szokujący fakt]"
- "Przekaż dalej, bo ja dowiedziałam się za późno"

**Wskazówki:**
- Każdy punkt = osobne ujęcie
- Tekst na ekranie — czytelny, duży
- Zakończ CTA: "Wyślij koleżance"

#### 9. Test / Challenge
**Co to jest:** "Czy przeżyję [sytuację] z tym produktem?"
**Format:** Challenge (tekst) → seria ujęć przez dzień → werdykt
**Przykłady:**
- "Test: czy przeżyję dzień 1 w biurze z tym?"
- "Sprawdzam czy to działa tak jak mówią"
- "24h z [produktem] — uczciwa recenzja"

**Wskazówki:**
- Zegarek/czas jako element narracji
- Szybkie cięcia, dynamicznie
- Werdykt na końcu — buduj napięcie

#### 10. Ekskluzywność
**Co to jest:** "Ten post nie jest dla wszystkich"
**Format:** Ekskluzywny hook → produkt → "jeśli wiesz to wiesz"
**Przykłady:**
- "Ten post jest dla 50% populacji. Reszta nie zrozumie."
- "Faceci — scrollujcie dalej. To nie dla was."
- "Jeśli rozumiesz — wiesz. Jeśli nie — ciesz się."

**Wskazówki:**
- Buduj "my vs oni" — ekskluzywność
- Wywołuje komentarze i tagowanie
- Ludzie lubią być w "klubie" który rozumie

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

## ⚠️ KROK 0: OKREŚL PŁEĆ NAGRYWAJĄCEGO (OBOWIĄZKOWE!)

> **KRYTYCZNE:** Zanim napiszesz jakikolwiek scenariusz, sprawdź `customer_name` z workflow i określ płeć klienta. Scenariusze MUSZĄ być dostosowane do osoby która będzie je nagrywać!

### Jak określić płeć po polskim imieniu:

| Końcówka/wzorzec | Płeć | Przykłady |
|------------------|------|-----------|
| `-a` (większość) | Kobieta | Anna, Katarzyna, Magda, Ewa, Joanna, Agnieszka, Monika |
| `-ek`, `-usz`, `-aw`, `-an` | Mężczyzna | Marek, Łukasz, Tomasz, Sławek, Jan, Damian |
| `-eł`, `-ał`, `-ił` | Mężczyzna | Paweł, Michał, Kamil, Rafał |
| Wyjątki kobiece bez `-a` | Kobieta | Dagmara→Daga, Małgorzata→Gosia |

### Popularne polskie imiona:

**Męskie:** Adam, Andrzej, Bartek, Damian, Daniel, Dawid, Dominik, Filip, Grzegorz, Jakub, Jan, Kamil, Karol, Krzysztof, Łukasz, Maciej, Marcin, Marek, Mateusz, Michał, Paweł, Piotr, Rafał, Robert, Sebastian, Szymon, Tomasz, Wojciech

**Żeńskie:** Agnieszka, Aleksandra, Alicja, Anna, Barbara, Beata, Dorota, Ewa, Iwona, Joanna, Justyna, Karolina, Katarzyna, Kinga, Magda, Małgorzata, Maria, Marta, Monika, Natalia, Patrycja, Paulina, Renata, Sylwia, Weronika, Zuzanna

### Jak dostosować scenariusze:

| Element | Kobieta | Mężczyzna |
|---------|---------|-----------|
| **Perspektywa beauty/anti-aging** | Bezpośrednia ("Ja używam...") | Pośrednia ("Kupiłem żonie...", "Moja partnerka...") LUB biohacker angle |
| **Hook emocjonalny** | "koleżanki pytają", "kobiety 30+" | "kumple myśleli że zwariowałem", "faceci którzy rozumieją" |
| **Rant** | "smarowałam się kremami" | "ćwiczyłem jak wariat a efektów brak" |
| **Ekskluzywność** | "Ten post dla kobiet które rozumieją" | "Ten post dla facetów którzy ogarniają" |
| **Storytime** | "Mama/koleżanka myślała..." | "Żona myślała że zwariowałem...", "Kumple się śmiali..." |

### Męskie angle'e dla produktów wellness/beauty:

1. **Biohacker** — optymalizacja, performance, nauka, dane
2. **Sportowiec** — regeneracja, wydajność, energia po treningu
3. **Produktywność** — focus, energia w pracy, przewaga konkurencyjna
4. **Prezent dla niej** — "kupiłem żonie i sam zacząłem używać"
5. **Sceptyk przekonany** — "myślałem że ściema, ale..."

### Proporcje scenariuszy:

| Płeć klienta | Scenariusze bezpośrednie | Scenariusze "dla partnera/ki" |
|--------------|--------------------------|------------------------------|
| Kobieta | 8-10 (większość) | 0-2 |
| Mężczyzna (produkt unisex) | 6-8 | 2-4 |
| Mężczyzna (produkt typowo kobiecy) | 3-4 (biohacker angle) | 6-7 ("dla niej") |

### Przykład — produkt anti-aging, klient: Łukasz (mężczyzna)

**Zamiast:** "Piętnaście lat smarowałam się kremami..."
**Napisz:** "Żona wydała fortunę na kremy. Ja znalazłem coś co działa od środka..."

**Zamiast:** "Koleżanki pytają co bierzesz"
**Napisz:** "Kumple pytają skąd mam tyle energii na siłowni"

**Zamiast:** "Ten post dla kobiet 30+"
**Napisz:** "Ten post dla facetów którzy ogarniają zdrowie"

---

## Proces generowania

### Krok 1: Pobierz WSZYSTKIE dane o produkcie

```bash
# Podstawowe dane workflow
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

# Branding (nazwa marki, tagline, opis, kolory)
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

# ⚠️ RAPORTY PRODUKTU — KLUCZOWE DLA ANALIZY!
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_reports?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"
```

> **WAŻNE:** Raporty często zawierają szczegółowe informacje o produkcie:
> - Specyfikacja techniczna (moc, funkcje, tryby pracy)
> - Analiza konkurencji (co wyróżnia ten produkt)
> - Grupa docelowa (kto kupuje, jakie ma problemy)
> - USP (unikalna propozycja wartości)
>
> **Przeczytaj raporty** zanim zaczniesz analizę — znajdziesz tam odpowiedzi na większość pytań z sekcji 2.2-2.3.

---

## ⚠️ Krok 2: GŁĘBOKA ANALIZA PRODUKTU (OBOWIĄZKOWA)

> **ZATRZYMAJ SIĘ TUTAJ** — zanim napiszesz jakikolwiek scenariusz, przeprowadź pełną analizę. Wypisz wnioski dla użytkownika i poczekaj na jego akceptację.

### 2.1 Wykorzystaj raporty produktu

Raporty (`workflow_reports`) to najcenniejsze źródło informacji. Szukaj w nich:

| Sekcja raportu | Co wyciągnąć dla scenariuszy |
|----------------|------------------------------|
| **Specyfikacja techniczna** | Konkretne funkcje do pokazania (moc ssania 5000Pa, nawigacja LiDAR, tryby pracy) |
| **Analiza konkurencji** | Co wyróżnia TEN produkt — to powinno być w scenariuszach |
| **Grupa docelowa** | Jakie problemy rozwiązuje, kim jest kupujący |
| **USP / Wyróżniki** | Główny "hak" do hook'a w scenariuszu |
| **Funkcje / tryby** | Materiał na Tutorial, Porównanie |
| **Zastosowania** | Konkretne sytuacje do POV i Rutyny |

> **Jeśli raport jest w formacie PDF/załącznik** — pobierz i przeczytaj. Nie zgaduj specyfikacji!

### 2.2 Podstawowe informacje

| Pytanie | Co sprawdzić |
|---------|--------------|
| **Nazwa produktu** | Z `workflow_branding` type=`brand_info` |
| **Kategoria** | Elektronika, fitness, beauty, dom, zdrowie, gadżety, inne |
| **Typ produktu** | Fizyczny / cyfrowy / usługa |
| **Cena** | Tani (<100zł), średni (100-500zł), premium (>500zł) — wpływa na ton |

### 2.3 Analiza cech wizualnych i dźwiękowych

Odpowiedz na każde pytanie — to determinuje które scenariusze zadziałają:

| Cecha | Pytanie | Wpływ na scenariusze |
|-------|---------|---------------------|
| **LED-y / światła** | Czy produkt świeci? Jakie kolory? | Tak → Efekt WOW w ciemności zadziała. Nie → wymyśl inny "wow" |
| **Dźwięk pracy** | Cichy, głośny, przyjemny, irytujący? | Głośny → ASMR odpada. Cichy → ASMR może działać |
| **Ruch / dynamika** | Produkt się porusza? Sam działa? Wymaga akcji użytkownika? | Sam działa → pokaż efekt "przed/po". Wymaga akcji → pokaż proces |
| **Rozmiar** | Mały (dłoń), średni (biurko), duży (podłoga) | Mały → close-upy. Duży → szersze ujęcia, kontekst pokoju |
| **Czas działania** | Efekt natychmiastowy czy wymaga czasu? | Natychmiastowy → łatwe do nagrania. Wymaga czasu → przyspieszone video lub "przed/po" |

### 2.4 Analiza emocjonalna — KLUCZOWE dla scenariuszy VIRALOWYCH

Określ główny "hak emocjonalny" produktu i jak go WYOLBRZYMIĆ:

| Kategoria emocji | Przykłady produktów | VIRALOWE scenariusze |
|------------------|---------------------|---------------------|
| **Rozwiązanie bólu/problemu** | Produkty zdrowotne, wellness | Rant ("X LAT cierpiałam i NIKT..."), Hot take ("To powinno być refundowane"), POV Drama |
| **Oszczędność czasu** | Robot odkurzający, automatyka | Dramatyczna transformacja (leżę vs robot pracuje), Storytime z twistem ("mój mąż myślał że sprzątam") |
| **Ukryte cierpienie** | Produkty intymne, zdrowie | Ekskluzywność ("Ten post nie dla wszystkich"), Relatywny moment, Edukacja przez szok |
| **Zmiana życia** | Fitness, beauty, wellness | "Zamówienie o 3 w nocy" → sukces, Test challenge, Dramatyczna transformacja |
| **Sekret/dyskrecja** | Produkty noszone, intymne | "Nikt nie wie" reveal, Ekskluzywność, Relatywny moment |
| **Frustracja z obecnym rozwiązaniem** | Alternatywy dla leków, starych metod | Rant, Hot take, Porównanie dramatyczne |

**ZAWSZE szukaj:**
- Co ludzie CIERPIĄ używając starego rozwiązania? → Rant, Hot take
- Co jest TABU w tej kategorii? → Ekskluzywność, "Nikt ci nie powie"
- Co jest RELATYWNE dla grupy docelowej? → POV Drama, Relatywny moment
- Jaki jest potencjalny TWIST? → Storytime, Zamówienie o 3 w nocy

### 2.5 Ocena typów scenariuszy VIRALOWYCH dla TEGO produktu

Wypełnij tabelę — zaznacz ✅ (pasuje), ⚠️ (wymaga modyfikacji), ❌ (nie pasuje):

**Z TWARZĄ:**
| Typ scenariusza | Ocena | Uzasadnienie / jaki viralne angle użyć |
|-----------------|-------|---------------------------------------|
| POV Drama | | Jaka relatywna bolesna sytuacja? |
| Rant | | Na co ludzie są wściekli? Co nie działa? |
| Storytime z twistem | | Jaki twist będzie zaskakujący? |
| Dramatyczna transformacja | | Jaki kontrast przed/po? |
| Hot take | | Jaka kontrowersyjna opinia wywoła dyskusję? |

**BEZ TWARZY:**
| Typ scenariusza | Ocena | Uzasadnienie / jaki viralne angle użyć |
|-----------------|-------|---------------------------------------|
| Relatywny moment | | Jaka sytuacja którą KAŻDY zna? |
| Zamówienie o 3 w nocy | | Czy pasuje narracja "desperacja → sukces"? |
| Edukacja przez szok | | Jakie fakty są szokujące/nieznane? |
| Test challenge | | Jaki challenge będzie ciekawy? |
| Ekskluzywność | | Kto "zrozumie" a kto nie? |

### 2.6 Przykładowe pytania do analizy (zależnie od produktu)

**Robot odkurzający:**
- Czy ma stację dokującą (do pokazania "wraca do bazy")?
- Czy ma aplikację (można pokazać sterowanie z telefonu)?
- Czy omija przeszkody (można zaaranżować test)?
- Jak długo sprząta? (czy da się pokazać efekt w 30 sek?)

**Sprzęt fitness:**
- Czy wymaga miejsca? (czy zmieści się w kadrze?)
- Czy powoduje pot/zmęczenie? (autentyczność)
- Czy ma tryby/poziomy trudności? (tutorial)

**Beauty / skincare:**
- Czy efekt jest widoczny od razu?
- Czy można pokazać na skórze?
- Czy pachnie? (trzeba opisać słowami)

**Elektronika / gadżety:**
- Czy ma ekran/wyświetlacz?
- Czy łączy się z telefonem?
- Czy ma unikalne funkcje do pokazania?

### 2.7 Kontekst nagrywającego

| Pytanie | Wpływ |
|---------|-------|
| **Kto nagrywa?** | Klient (początkujący) vs influencer (doświadczony) |
| **Doświadczenie z TikTok** | Proste scenariusze dla początkujących |
| **Czy ma produkt?** | Musi mieć produkt fizycznie żeby nagrać |

### 2.8 Wnioski z analizy (WYPISZ DLA UŻYTKOWNIKA)

Po analizie wypisz:

```
## Analiza produktu: [NAZWA]

**Kategoria:** [kategoria]
**Typ:** [fizyczny / cyfrowy / usługa]

### Z raportów produktu:
- **Specyfikacja:** [kluczowe parametry techniczne]
- **USP:** [co wyróżnia ten produkt od konkurencji]
- **Grupa docelowa:** [kto kupuje, jaki problem rozwiązuje]
- **Wyróżniki:** [unikalne funkcje do pokazania w scenariuszach]

### Analiza dla scenariuszy:
**Główny hak emocjonalny:** [oszczędność czasu / wygoda / wow / zdrowie / status / rozwiązanie problemu]

**Cechy wizualne:** [LED-y, rozmiar, ruch, dynamika]
**Cechy dźwiękowe:** [cichy/głośny, przyjemny/irytujący]
**Czas efektu:** [natychmiastowy / wymaga czasu]

### Ocena typów scenariuszy:

**Co zadziała dobrze:**
- [lista scenariuszy które pasują idealnie]

**Co wymaga modyfikacji:**
- [typ scenariusza] → [jak zmodyfikować / jaki zamiennik użyć]

**Co odpada:**
- [typ scenariusza] → [dlaczego nie zadziała]

### Do wykorzystania w scenariuszach:

**Kluczowe funkcje do pokazania:**
- [funkcja 1 z raportu/specyfikacji]
- [funkcja 2]
- [funkcja 3]

**Konkretne sytuacje użycia:**
- [sytuacja 1 - np. "wracam z pracy"]
- [sytuacja 2 - np. "przed przyjściem gości"]

**Rekomendowane lokalizacje:**
- [salon / kuchnia / biurko / sypialnia / itp.]
```

> **WYPISZ WNIOSKI** dla użytkownika i od razu przejdź do generowania scenariuszy.

---

### Krok 3: Napisz 10 scenariuszy VIRALOWYCH
- **Scenariusze 1-5**: showFace: true (typy: POV Drama, Rant, Storytime z twistem, Dramatyczna transformacja, Hot take)
- **Scenariusze 6-10**: showFace: false (typy: Relatywny moment, Zamówienie o 3 w nocy, Edukacja przez szok, Test challenge, Ekskluzywność)
- **WAŻNE**: Dostosuj typy do wniosków z analizy — jeśli jakiś nie pasuje, zamień na inny z tej samej kategorii

### Krok 4: Dodaj VIRALOWE elementy
- **Hook MUSI zatrzymać scrollowanie** — użyj szablonów z sekcji "Viralne hooki"
- **Emocje > produkt** — produkt jest drugorzędny, emocje są pierwsze
- **Drama i przesada** — TikTok to teatr, nie dokument
- **Relatability** — widz musi powiedzieć "O KURDE TO JA"
- **Kontrowersja/opinia** — wywołuje komentarze = algorytm kocha
- **Twist/punchline na końcu** — trzyma widza do końca
- **CTA viralowe** — "Wyślij koleżance", "Jeśli wiesz to wiesz"

---

## Wstawianie do bazy przez API

> **WAŻNE**: NIE generuj SQL! Wstawiaj dane BEZPOŚREDNIO przez Supabase REST API używając curl.

### Krok 1: Przygotuj JSON ze scenariuszami

Zapisz scenariusze do pliku tymczasowego `c:/tmp/video_scenarios.json`:

```json
{
  "workflow_id": "[WORKFLOW_ID]",
  "video_scenarios": [
    {"id": "scenario_1", "type": "POV Drama", "showFace": true, "title": "...", "hook": "...", "action": "...", "ending": "...", "duration": "15-20 sek", "tip": "...", "soundTip": "...", "textOverlay": "..."},
    {"id": "scenario_2", "showFace": true, ...},
    ...
    {"id": "scenario_10", "showFace": false, ...}
  ],
  "is_active": true,
  "activated_at": "2026-03-20T12:00:00Z"
}
```

### Krok 2: Wstaw przez UPSERT (POST z resolution=merge-duplicates)

```bash
curl -s -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_video" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=minimal" \
  -d @c:/tmp/video_scenarios.json
```

> **UWAGA**: Nagłówek `Prefer: resolution=merge-duplicates` powoduje UPSERT — jeśli rekord istnieje, zostanie zaktualizowany.

### Alternatywnie: PATCH jeśli rekord już istnieje

```bash
curl -s -X PATCH "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_video?workflow_id=eq.[WORKFLOW_ID]" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d @c:/tmp/video_scenarios.json
```

### Krok 3: Weryfikacja

```bash
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_video?workflow_id=eq.[WORKFLOW_ID]&select=workflow_id,is_active,video_scenarios" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"
```

Po wstawieniu poinformuj użytkownika: "Gotowe! Odśwież stronę workflow — zakładka Video powinna być aktywna."

---

## Przykładowe scenariusze — VIRAL EDITION (Siela - pas termoterapeutyczny)

> Poniższe przykłady pokazują VIRALNE podejście. Zauważ: emocje > produkt, drama > prezentacja.

### Z TWARZĄ:

```json
{
  "id": "scenario_1",
  "type": "POV Drama",
  "showFace": true,
  "title": "Tłumaczysz facetowi",
  "hook": "Leżysz na kanapie w pozycji embrionalnej, dramatyczna mina bólu. Patrzysz w kamerę z wyrazem 'nie teraz'.",
  "action": "Udajesz że ktoś pyta 'No wstań, idziemy na spacer'. Robisz MEGA dramatyczną minę typu 'CZY TY SERIO?!'. Pokazujesz pas na brzuchu, wciskasz przycisk. Zamykasz oczy z wyrazem ulgi.",
  "ending": "Otwierasz oczy, patrzysz w kamerę z wyrazem 'ratuje mi życie i związek'. Możesz pokazać kciuk w górę z sarkazmem.",
  "duration": "15-20 sek",
  "tip": "PRZESADZAJ z mimiką! Im bardziej dramatycznie, tym lepiej. To ma być śmieszne.",
  "soundTip": "Trending audio typu 'are you serious right now' lub dramatyczna muzyka",
  "textOverlay": "POV: Tłumaczysz facetowi dlaczego nie możesz wstać z kanapy"
}
```

```json
{
  "id": "scenario_2",
  "type": "Rant",
  "showFace": true,
  "title": "15 lat łykania tabletek",
  "hook": "Wchodzisz w kadr z wyrazem złości/niedowierzania. Zacznij mówić od razu: 'Okej, muszę się wygadać...'",
  "action": "Rant do kamery: 'Piętnaście lat. PIĘTNAŚCIE LAT łykałam tabletki co miesiąc. I NIKT mi nie powiedział że istnieje coś takiego?!' Pokazujesz pas. 'Ciepło plus masaż. BEZ CHEMII. Dlaczego ja o tym nie wiedziałam?!'",
  "ending": "Zakładasz pas, włączasz, robisz minę ulgi przechodzącą w złość: 'Jestem wściekła że dopiero teraz'.",
  "duration": "20-25 sek",
  "tip": "Autentyczna złość! Mów jak do przyjaciółki której musisz TO powiedzieć. Gestykuluj!",
  "soundTip": "Oryginalny dźwięk z twoim głosem — rant musi być słyszalny",
  "textOverlay": "Musimy porozmawiać o czymś co powinnyśmy wiedzieć DAWNO"
}
```

```json
{
  "id": "scenario_3",
  "type": "Storytime z twistem",
  "showFace": true,
  "title": "Mama myślała że to coś dziwnego",
  "hook": "Zacznij z sekretną miną, jakbyś plotkowała: 'Okej, historia z wczoraj...'",
  "action": "Opowiadasz: 'Mama wchodzi do pokoju, ja zakładam pas na brzuch. Ona: CO TO JEST?! Ja: Mama, spokojnie, to na ból...' Pokazujesz pas. 'Ona przez 30 lat używała termoforów. Ja jej pokazuję że to się NAGRZEWA i WIBRUJE.'",
  "ending": "Punchline: 'Zamówiła sobie dwie sztuki. Jedną dla siebie, jedną dla cioci.' Śmiech do kamery.",
  "duration": "25-30 sek",
  "tip": "Opowiadaj jak historię znajomym. Mimika, pauzy, timing są kluczowe!",
  "soundTip": "Oryginalny dźwięk lub trending storytime audio",
  "textOverlay": "Storytime: Moja mama myślała że to coś ZUPEŁNIE innego"
}
```

```json
{
  "id": "scenario_4",
  "type": "Dramatyczna transformacja",
  "showFace": true,
  "title": "Ja o 3 w nocy vs ja teraz",
  "hook": "CZĘŚĆ 1: Leżysz na podłodze (SERIO na podłodze), zwinięta w kłębek, dramatyczna mina cierpienia, ręka na brzuchu.",
  "action": "Tekst: 'Ja o 3 w nocy szukająca ratunku'. TRANSITION (mrugasz/przejście). CZĘŚĆ 2: Siedzisz normalnie, uśmiechnięta, pas na brzuchu, pijesz herbatę jakby nic się nie stało.",
  "ending": "Wzruszasz ramionami z wyrazem 'no co, działa'. Możesz mrugnąć do kamery.",
  "duration": "15-20 sek",
  "tip": "Kontrast musi być MAKSYMALNY. Część 1 = dramat, część 2 = sielanka. Im większa różnica, tym lepiej.",
  "soundTip": "Audio z dramatycznym transition lub 'upgrade' sound",
  "textOverlay": "Ja o 3 w nocy szukająca pomocy w internecie → Ja teraz"
}
```

```json
{
  "id": "scenario_5",
  "type": "Hot take",
  "showFace": true,
  "title": "To powinno być refundowane",
  "hook": "Wchodzisz w kadr z miną 'mam opinię i ją powiem'. Zacznij mocno: 'Okej, hot take...'",
  "action": "'Jeśli tabletki przeciwbólowe są w każdej aptece, to DLACZEGO nikt nie mówi o alternatywach bez chemii?' Pokazujesz pas. 'Ciepło lecznicze plus masaż. Działa. Bez skutków ubocznych. To powinno być REFUNDOWANE.'",
  "ending": "Patrzysz w kamerę z wyrazem 'no powiedzcie że nie mam racji'. Zakładasz pas demonstracyjnie.",
  "duration": "20-25 sek",
  "tip": "Pewność siebie! Masz rację i to wiesz. To wywoła dyskusję w komentarzach — idealne dla algorytmu.",
  "soundTip": "Oryginalny dźwięk lub trending 'hot take' audio",
  "textOverlay": "Hot take który rozwścieczy połowę internetu"
}
```

### BEZ TWARZY:

```json
{
  "id": "scenario_6",
  "type": "Relatywny moment",
  "showFace": false,
  "title": "Dzień 1 vs reszta świata",
  "hook": "Telefon z alarmem '7:00 — WSTAŃ DO PRACY'. Ręka wyłącza alarm z dramatycznym gestem niechęci.",
  "action": "Pokaż kalendarz z zaznaczonym dniem (kropka/symbol). Pokaż rękę sięgającą po pas. Włączenie, założenie (nie pokazuj twarzy — tylko ręce i brzuch). Pokaż normalne ubieranie się — pas niewidoczny.",
  "ending": "Ujęcie wychodzenia z domu. Tekst: 'A świat myśli że jest normalny dzień'. Drzwi się zamykają.",
  "duration": "20-25 sek",
  "tip": "To ma być relatable — każda kobieta to zna. Spokojne, realistyczne ujęcia.",
  "soundTip": "Melancholijna muzyka lub trending audio o 'ukrywaniu bólu'",
  "textOverlay": "Każda wie o czym mówię 🗓️"
}
```

```json
{
  "id": "scenario_7",
  "type": "Zamówienie o 3 w nocy",
  "showFace": false,
  "title": "Decyzje podjęte w desperacji",
  "hook": "Ekran telefonu o 3:14 w nocy. Otwarta przeglądarka z produktem. Palec wciska 'KUP TERAZ'.",
  "action": "Przejście: paczka pod drzwiami. Ręce otwierają paczkę — niepewnie, jakby 'co ja zamówiłam?'. Wyjmujesz pas, oglądasz. Włączasz — działa. Zakładasz.",
  "ending": "Ujęcie ręki dającej 5 gwiazdek w recenzji. Tekst: 'Najlepsza decyzja podjęta o 3 w nocy'.",
  "duration": "20-25 sek",
  "tip": "Buduj narrację: desperacja → niepewność → pozytywne zaskoczenie. Bez twarzy, tylko ręce i produkt.",
  "soundTip": "Trending audio o 'nocnych zakupach' lub 'impulsywnych decyzjach'",
  "textOverlay": "Rzeczy zamówione o 3 w nocy w akcie desperacji: ocena"
}
```

```json
{
  "id": "scenario_8",
  "type": "Edukacja przez szok",
  "showFace": false,
  "title": "Rzeczy które nikt ci nie powie",
  "hook": "Czarny ekran. Tekst pojawia się: 'Rzeczy o bólach miesiączkowych których nikt ci nie powie:'. Pauza dramatyczna.",
  "action": "Punkt 1: 'Tabletki to nie jedyna opcja' — pokaż pas. Punkt 2: 'Ciepło + masaż = medycyna bez chemii' — pokaż włączanie trybów. Punkt 3: 'Możesz nosić to w pracy i NIKT nie wie' — pokaż pas pod ubraniem.",
  "ending": "Tekst: 'Przekaż dalej, bo ja dowiedziałam się za późno'. Logo/produkt na końcu.",
  "duration": "25-30 sek",
  "tip": "Edukacyjny ton ale z emocją. Każdy punkt to osobne ujęcie. Czytelne, proste.",
  "soundTip": "Trending audio 'things nobody tells you' lub dramatyczna muzyka",
  "textOverlay": "Zapisz to i wyślij koleżance 📌"
}
```

```json
{
  "id": "scenario_9",
  "type": "Test challenge",
  "showFace": false,
  "title": "Czy przeżyję dzień w pracy",
  "hook": "Tekst: 'Test: czy przeżyję dzień 1 w biurze z tym pasem?'. Pokaż pas i zegarek ustawiony na 8:00.",
  "action": "Seria szybkich ujęć: 8:00 — zakładasz pas. 10:30 — spotkanie (pas niewidoczny pod ubraniem). 13:00 — obiad, wszystko ok. 16:00 — dalej działa. Pokaż ręce piszące na laptopie — normalny dzień.",
  "ending": "18:00 — wychodzisz z biura. Tekst: 'Werdykt: PRZEŻYŁAM. I to bez tabletek.' Kciuk w górę ręką.",
  "duration": "20-25 sek",
  "tip": "Szybkie cięcia, dynamiczne. Pokaż że życie toczy się normalnie. Zegarek/czas jako element narracji.",
  "soundTip": "Energetyczna muzyka lub trending audio challenge",
  "textOverlay": "Challenge: dzień 1 w biurze BEZ tabletek"
}
```

```json
{
  "id": "scenario_10",
  "type": "Ekskluzywność",
  "showFace": false,
  "title": "Post nie dla wszystkich",
  "hook": "Tekst na ekranie: 'Ten post jest dla 50% populacji. Reszta nie zrozumie.' Pauza.",
  "action": "Pokaż ręce wyjmujące pas z pudełka. Pokaż funkcje: ciepło (ręka czuje ciepło), masaż (wibracje widoczne). Pokaż zakładanie. Pokaż że jest niewidoczny pod ubraniem.",
  "ending": "Tekst: 'Jeśli rozumiesz — wiesz. Jeśli nie rozumiesz — ciesz się.' Końcowe ujęcie produktu.",
  "duration": "20-25 sek",
  "tip": "Buduj ekskluzywność — 'to jest dla nas'. Wywołuje komentarze i tagowanie koleżanek.",
  "soundTip": "Trending audio 'jeśli wiesz to wiesz' lub tajemnicza muzyka",
  "textOverlay": "Wyślij tej jednej koleżance która ZROZUMIE"
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
