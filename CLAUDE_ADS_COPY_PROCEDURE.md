# Procedura generowania copy reklamowego Meta Ads

## Kiedy uzywac

Gdy uzytkownik prosi o "zrob copy reklamowe", "przygotuj reklamy", "wygeneruj teksty na reklamy" dla danego workflow.

---

## KROK 1: Pobierz dane z Supabase

Gdy uzytkownik podaje workflow ID, pobierz dane przez curl (uzyj klucza z `.env`):

```bash
# Branding (brand_info, kolory, fonty) - NAJWAZNIEJSZE
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.WORKFLOW_ID&select=*" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY"

# Workflow (landing page URL)
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.WORKFLOW_ID&select=*" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY"
```

## KROK 2: Wyodrebnij kluczowe dane

Z pobranych danych wyodrebnij:
1. **Brand info** — nazwa marki, tagline, opis (z `workflow_branding` gdzie `type=brand_info`, pole `value`)
2. **Produkt** — nazwa, cechy, cena, USP (z `ai_prompt` lub opisu)
3. **Grupa docelowa** — wiek, plec, problemy, pragnienia
4. **Landing page URL** — z `workflows.landing_page_url`

---

## KROK 3: Znajdź WOW FACTOR (KRYTYCZNE!)

**Zanim napiszesz choć słowo, odpowiedz na pytanie:**

> "Jaki JEDEN fakt o tym produkcie jest tak zaskakujący, że ktoś musi się zatrzymać?"

### Jak znaleźć WOW FACTOR:

1. **Porównaj z konkurencją** — co jest 2x, 3x, 10x lepsze?
2. **Znajdź kontrast** — gdzie cena nie pasuje do jakości? Gdzie czas nie pasuje do wyniku?
3. **Szukaj liczb** — konkretne liczby > przymiotniki ("15 sekund" > "szybko")
4. **Test kawiarnianego stolika** — czy powiedziałbyś to znajomemu przy kawie?

### Przykłady WOW FACTOR:

| Produkt | Słaby USP | WOW FACTOR |
|---------|-----------|------------|
| Myjka parowa | "Mocna i wydajna" | "15 sekund do pary. Konkurencja: 3 minuty." |
| Robot sprzątający | "Inteligentny robot" | "Wraca sam i OPRÓŻNIA pojemnik. Zero dotykania brudu." |
| Lodówka | "Energooszczędna" | "Twoja stara lodówka kosztuje 89 zł/msc. Ta: 31 zł." |
| Patelnia | "Nieprzywierająca" | "Jajecznica BEZ TŁUSZCZU. Dosłownie zero." |

### WOW FACTOR musi być:
- **Konkretny** — liczba, czas, cena, porównanie
- **Natychmiast zrozumiały** — bez tłumaczenia
- **Niewiarygodny ale prawdziwy** — "to nie może być prawda... a jednak"

**ZASADA: Jeśli WOW FACTOR nie jest w pierwszym zdaniu — przepisz od nowa.**

---

## LIMITY ZNAKOW — KRYTYCZNE!

| Pole | Widoczne bez "See more" | Max | Uwagi |
|------|-------------------------|-----|-------|
| **Primary Text** | **125 znaków** | 2200 | 99% userów NIE klika "See more" |
| **Headline** | **27-40 znaków** | 255 | >50 znaków = -30% CTR |
| **Description** | **25-30 znaków** | 255 | Widoczne tylko w niektórych placementach |

**ZASADA:** Hook MUSI byc w pierwszych 125 znakach. Reszta to bonus.

---

## HOOK — Pierwszych 5 słów decyduje

### TEST JAKOŚCI HOOKA (zanim zaakceptujesz)

Zadaj sobie te pytania:

| Pytanie | Jeśli NIE → przepisz |
|---------|---------------------|
| Czy scrollując Instagram zatrzymałbym się na tym? | Hook jest nudny |
| Czy jest tu WOW FACTOR z kroku 3? | Nie wykorzystujesz głównej przewagi |
| Czy jest konkretna LICZBA w pierwszych 10 słowach? | Za ogólnikowo |
| Czy mógłbym to powiedzieć o KAŻDYM produkcie w tej kategorii? | Za generyczne |
| Czy wywołuje EMOCJĘ (ciekawość, złość, niedowierzanie)? | Nie angażuje |

### Słabe vs Mocne hooki — NAUCZ SIĘ RÓŻNICY

| ❌ SŁABE (generyczne) | ✅ MOCNE (konkretne) |
|----------------------|---------------------|
| "Zmęczona sprzątaniem?" | "15 sekund. Tyle czeka Parova na parę. Twój Kärcher? 3 minuty." |
| "Najlepsza myjka parowa" | "3800W za 249 zł. Przemysłowa moc, domowa cena." |
| "Skuteczne czyszczenie bez chemii" | "Twoje dziecko liże podłogę. Ile na niej detergentów?" |
| "Oszczędzaj czas i pieniądze" | "89 zł miesięcznie oddajesz starej lodówce. Nowa bierze 31 zł." |
| "Poznaj nasz nowy produkt" | "Kupiłam bo tania. Rok później kupuję drugą." |

**ZASADA: Jeśli hook brzmi jak z folderu reklamowego — jest ZŁY.**

### Formuły hooków (wybierz 1 na wersję)

**1. Liczba + Benefit:**
```
"2,847 osób kupiło to w marcu. Oto dlaczego:"
"W 14 dni zaoszczędzisz 3 godziny tygodniowo"
```

**2. Pytanie (polski rynek bardzo reaguje):**
```
"Ile naprawdę kosztuje Cię stara [rzecz]?"
"Wiesz, że Twój [produkt] zużywa 3x więcej prądu?"
```

**3. Kontrast / Pattern Interrupt:**
```
"Przestań wyrzucać pieniądze na [kategoria]"
"Droższe NIE znaczy lepsze. Dowód:"
```

**4. Social Proof:**
```
"Myślałam że to bubel z Chin. Minął rok..."
"Kupiłam dla mamy. Teraz kupuję drugą dla siebie."
```

**5. Myth-busting:**
```
"[Konkurent] ukrywa to przed Tobą..."
"To, czego nie powie Ci [marka]..."
```

---

## POLSKI RYNEK — Specyfika

### Ton komunikacji
- **Bezpośredni, ale ciepły** — Polacy nie lubią amerykańskiego hype'u
- **Praktyczność > prestiż** — "ile zaoszczędzę" > "jak będę wyglądać"
- **Sceptycyzm** — zawsze adresuj obiekcje wprost
- **Rodzina jako motywator** — "dla dzieci", "dla rodziców", "dla domu"

### Słowa-wytrychy (zwiększają konwersję)
```
wreszcie | sprawdzone | bez ryzyka | gwarancja zwrotu |
polecam | test | porównanie | uczciwie | prawda o... |
oszczędność | promocja tylko do | ostatnie sztuki |
darmowa dostawa | polski serwis | 30 dni na zwrot
```

### CTA które działają w Polsce
```
❌ "Kup teraz" (za agresywne na zimny ruch)
✅ "Sprawdź szczegóły"
✅ "Zobacz opinie"
✅ "Zamów z darmową dostawą"
✅ "Odbierz zniżkę"
```

### Urgency BEZ spamu
```
❌ "TYLKO DZIŚ!!!! 🔥🔥🔥"
✅ "Promocja do wyczerpania zapasów (zostało 47 szt.)"
✅ "Cena ważna do niedzieli 23:59"
✅ "Ostatnia partia przed podwyżką"
```

---

## 5 KĄTÓW REKLAMOWYCH (angles)

Dla kazdego produktu generuj 5 wersji z ROZNYMI katami:

### 1. Pain Point (Problem → Rozwiązanie)
```
[Opisz ból 1-2 zdania]
[Pokaż konsekwencje]
[Produkt jako odpowiedź + główny benefit]
```

### 2. Transformation (Przed/Po)
```
PRZED: [Sytuacja bez produktu — negatywna]
PO: [Sytuacja z produktem — pozytywna]
MOST: [Produkt jako transformacja]
```

### 3. Social Proof (Liczby/Opinie)
```
[Liczba] osób wybrało [produkt].
[Krótki cytat klienta lub statystyka]
[CTA]
```

### 4. Urgency/Scarcity (Pilność)
```
[Oferta ograniczona czasowo/ilościowo]
[Konkretna korzyść]
[Deadline]
```

### 5. Curiosity (Sekret/Odkrycie)
```
[Intryga — czego nie wiedzą]
[Obietnica odkrycia]
[CTA do sprawdzenia]
```

---

## KĄTY DLA AGD / HOME (specyficzne)

### Kąt: CZAS
```
"Odzyskaj 5 godzin tygodniowo. [Produkt] robi to za Ciebie."
```

### Kąt: PIENIĄDZE
```
"Twój stary [produkt] kosztuje Cię 89 zł miesięcznie.
Nowy — 31 zł. Matematyka jest prosta."
```

### Kąt: ZDROWIE
```
"Alergie, katar? 2 miliony roztoczy w Twoim [miejscu].
[Produkt] eliminuje 99,9% w 10 minut."
```

### Kąt: PORÓWNANIE
```
"[Droga marka]: 1200 zł, [wada]
[Twój produkt]: 349 zł, [zaleta]
Różnica? Zobacz sam."
```

---

## STRUKTURA PRIMARY TEXT

### Krótka wersja (do 125 znaków — widoczna)
```
[HOOK — 1 zdanie zatrzymujące scroll]
[BENEFIT — co zyskujesz konkretnie]
[CTA — co ma zrobić]
```

### Dłuższa wersja (jeśli potrzebna)
```
[HOOK — 1 zdanie]
[PROBLEM — krótko]
[ROZWIĄZANIE + BENEFIT]
[SOCIAL PROOF — 1 zdanie]
[CTA + URGENCY]
```

---

## FORMAT ODPOWIEDZI

```markdown
## Copy reklamowe dla [NAZWA MARKI]

**Produkt:** [nazwa, cena]
**Grupa docelowa:** [kto, jakie problemy]
**USP:** [co wyróżnia]
**Landing page:** [URL]

---

### Wersja 1: Pain Point

**Primary Text:** (X znaków)
[tekst]

**Headline:** (X znaków)
[tekst]

**Description:** (X znaków)
[tekst]

**CTA:** [Sprawdź szczegóły / Zobacz opinie / etc.]

---

[Wersje 2-5 analogicznie]
```

---

## EMOCJONALNA KONKRETNOŚĆ

**Generyczne opisy nie sprzedają. Konkretne obrazy — tak.**

| ❌ Generyczne | ✅ Konkretne (obrazowe) |
|--------------|------------------------|
| "Bez chemii" | "Twoje dziecko raczkuje po podłodze. Ile na niej Domestosa?" |
| "Oszczędza czas" | "3 godziny tygodniowo z powrotem. Na serial, nie na szorowanie." |
| "Dla alergików" | "Budzisz się z katarem? 2 miliony roztoczy śpi z Tobą w łóżku." |
| "Wysoka jakość" | "Minął rok. Działa jak pierwszego dnia." |
| "Łatwy w użyciu" | "Jeden przycisk. Dosłownie jeden." |

### Technika "Pokaż, nie mów"

Zamiast: "Skutecznie czyści"
Napisz: "Przypalony garnek? 30 sekund pary i wychodzi na czysto."

Zamiast: "Ekonomiczny"
Napisz: "Za cenę 3 wizyt sprzątaczki masz to na zawsze."

Zamiast: "Bezpieczny dla dzieci"
Napisz: "Możesz puścić dzieci na podłogę 5 minut po sprzątaniu."

---

## BRUTAL SELF-REVIEW (zanim oddasz)

**Przeczytaj każde copy i odpowiedz SZCZERZE:**

### Poziom 1: Podstawy
- [ ] Czy WOW FACTOR jest w pierwszym zdaniu?
- [ ] Czy policzyłem znaki? (Primary ≤125, Headline ≤40)
- [ ] Czy każda wersja ma NAPRAWDĘ inny kąt, nie parafrazę?

### Poziom 2: Jakość hooka
- [ ] Czy zatrzymałbym się scrollując o 23:00 zmęczony?
- [ ] Czy jest LICZBA w pierwszych 10 słowach?
- [ ] Czy NIE mógłbym tego powiedzieć o konkurencji?

### Poziom 3: Emocje
- [ ] Czy wywołuję konkretny OBRAZ w głowie czytelnika?
- [ ] Czy jest tu NAPIĘCIE (problem → rozwiązanie)?
- [ ] Czy CTA jest naturalne, nie wciskające?

### Poziom 4: Brutalna prawda
- [ ] Czy sam bym kliknął w tę reklamę?
- [ ] Czy brzmi jak człowiek, nie jak folder?
- [ ] Czy moja mama zrozumiałaby przekaz?

**Jeśli którakolwiek odpowiedź to NIE — przepisz tę wersję.**

---

## BŁĘDY DO UNIKANIA (z przykładami)

| Błąd | ❌ Przykład | ✅ Poprawka |
|------|------------|-------------|
| Za długi tekst | 200+ znaków przed "See more" | Max 125 znaków widocznych |
| Brak WOW factor w hooku | "Nasza myjka jest świetna" | "15 sek do pary. Konkurencja: 3 min." |
| Cechy zamiast korzyści | "Moc 3800W" | "Nagrzewa się w 15 sekund" |
| Generyczny hook | "Zmęczona sprzątaniem?" | "Ile Domestosa liże Twoje dziecko z podłogi?" |
| Generyczne CTA | "Kup teraz" | "Zobacz 847 opinii" |
| Brak konkretów | "świetna jakość" | "5 lat gwarancji, polski serwis" |
| Spamowe urgency | "🔥🔥🔥 TYLKO DZIŚ!!!" | "Ostatnie 34 szt. w tej cenie" |
| Za dużo emoji | "🎉🔥💪🏆✨" | Max 1-2 na tekst |
| Parafrazowanie | 5 wersji tego samego | 5 różnych KĄTÓW |

---

## KIEDY UTKNIESZ — TECHNIKI ODBLOKOWANIA

### 1. Zacznij od końca
Napisz najpierw REZULTAT jaki klient osiągnie. Potem cofnij się do hooka.

### 2. Technika "Powiedz mamie"
Wyobraź sobie, że tłumaczysz produkt mamie przy kawie. Co byś powiedział NAJPIERW?

### 3. Technika "Dlaczego 5x"
- Dlaczego to lepsze? Bo szybsze.
- Dlaczego szybkość ważna? Bo oszczędza czas.
- Dlaczego czas ważny? Bo można go spędzić z rodziną.
- Dlaczego rodzina ważna? Bo to priorytet grupy docelowej.
→ Hook: "3 godziny tygodniowo z powrotem. Na dzieci, nie na szorowanie."

### 4. Sprawdź konkurencję
Zobacz reklamy konkurencji na Facebook Ad Library. Czego NIE mówią? Tam jest Twój kąt.

### 5. Przeczytaj opinie
Allegro, Ceneo, Amazon — co KLIENCI mówią swoimi słowami? Użyj ich języka.

---

## TESTOWANIE A/B

### Co testować (priorytet)
1. **Hook/angle** — różne podejścia do problemu
2. **CTA** — "Sprawdź" vs "Zobacz opinie" vs "Zamów"
3. **Długość** — krótki vs rozbudowany tekst
4. **Social proof** — z liczbami vs bez

### Zasady
- Testuj 1 zmienną na raz
- Min. 7 dni na test
- Min. 50 konwersji na wariant dla statystycznej istotności

---

## PRZYKŁAD WYPEŁNIONY (wzorcowy)

**Input:**
- Marka: Parova
- Produkt: Myjka parowa 3800W, cena 249-349 zł
- Grupa: Rodziny z dziećmi 30-45 lat, alergicy
- USP: Przemysłowa moc w cenie taniej konkurencji, 15 sek nagrzewania, bez chemii

**WOW FACTOR zidentyfikowany:**
> "15 sekund do pary vs 3 minuty u konkurencji — 12x szybciej"

---

### Wersja 1: WOW Factor (liczba w hook)

**Primary Text:** (98 znaków)
15 sekund. Tyle czeka Parova na parę. Konkurencja? 3 minuty. Moc 3800W, cena 249 zł.

**Headline:** (19 zn.)
15 sekund do pary

**Description:** (24 zn.)
Przemysłowa moc. 249 zł.

**CTA:** Sprawdź szczegóły

---

### Wersja 2: Emocjonalny obraz (dla rodziców)

**Primary Text:** (117 znaków)
Twoje dziecko raczkuje po podłodze. Ile tam Domestosa? Parova — para 105°C, 99,9% bakterii, zero chemii. Czysto i bezpiecznie.

**Headline:** (28 zn.)
Zero chemii. 99,9% bakterii.

**Description:** (22 zn.)
Bezpieczne dla dzieci.

**CTA:** Zobacz opinie

---

### Wersja 3: Social Proof (cytat)

**Primary Text:** (104 znaki)
"Kupiłam bo tania. Rok później kupuję mamie." Parova 3800W — 847 opinii, średnia 4.8. Sprawdź sama.

**Headline:** (24 zn.)
4.8/5 z 847 opinii

**Description:** (24 zn.)
30 dni na zwrot. Bez ryzyka.

**CTA:** Zobacz opinie

---

### Wersja 4: Porównanie ceny

**Primary Text:** (108 znaków)
Profesjonalna myjka parowa: 1200+ zł. Parova 3800W: 249 zł. Ta sama moc, 1/5 ceny. Matematyka jest prosta.

**Headline:** (25 zn.)
1/5 ceny, ta sama moc

**Description:** (28 zn.)
3800W za cenę zabawki.

**CTA:** Sprawdź szczegóły

---

### Wersja 5: Urgency (konkretne liczby)

**Primary Text:** (119 znaków)
Ostatnie 34 sztuki w cenie 249 zł. Od poniedziałku: 349 zł. Parova 3800W — 15 sek nagrzewania, bez chemii, 5 lat gwarancji.

**Headline:** (27 zn.)
-100 zł jeszcze do niedzieli

**Description:** (18 zn.)
Zostało 34 sztuki.

**CTA:** Zamów teraz

---

## WAZNE

1. **NIGDY nie kopiuj** tekstów z innych reklam
2. **ZAWSZE licz znaki** przed oddaniem
3. **KAŻDA wersja = INNY kąt** — nie parafrazuj tego samego
4. **Ton = marka** — premium elegancko, playful luzno
5. **Testuj CTA** — "Dowiedz się więcej" często bije "Kup teraz"
