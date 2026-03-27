# Procedura: Generowanie Brandingu dla Workflow

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń) — dotyczy to nazw marek, tagline'ów, opisów i całego copy.

## Kiedy wywołać

Uzytkownik mowi np.: "Zrob branding dla workflow X", "Wygeneruj branding", "Wypelnij branding".

## Wymagane dane wejsciowe

1. **workflow_id** — UUID workflow
2. **Raport PDF** — OBOWIAZKOWY raport typu `report_pdf` z tabeli `workflow_reports`. To jest glowny dokument z pelna analiza produktu, strategia, grupa docelowa, USP. Na jego podstawie budujesz caly branding.
3. **Infografika PNG** — opcjonalnie `report_infographic` (obraz do podgladu wizualnego kontekstu)

**WAZNE**: Raport PDF zawiera tekst z analiza — pobierz go i przeanalizuj. Jesli nie mozesz odczytac PDF bezposrednio, pobierz infografike PNG i uzyj jej jako zrodla informacji.

## Co generuje

**WSTAWIA BEZPOŚREDNIO DO BAZY** przez Supabase REST API (curl). NIE generuje SQL do ręcznego wklejania!

Dane wstawiane do tabeli `workflow_branding`:

1. **DELETE** istniejacych danych brandingowych (brand_info, color, font, ai_prompt) dla danego workflow
2. **Brand Info** — INSERT type='brand_info':
   - `title` = nazwa marki
   - `value` = JSON `{"name":"...","tagline":"...","description":"..."}`
3. **6 Kolorow** — INSERT type='color':
   - `title` = nazwa koloru (np. "Electric Blue")
   - `value` = HEX (np. "#00D4FF")
   - `notes` = JSON `{"role":"primary|secondary|accent|neutral"}`
   - Zawsze: 1x primary, 1x secondary, 1x accent, 3x neutral
4. **3 Fonty** — INSERT type='font':
   - `title` = nazwa fontu z Google Fonts
   - `value` = rola (heading|body|accent)
   - `notes` = JSON `{"role":"heading|body|accent","weights":["400","700",...]}`
   - Zawsze: heading (bold/display), body (czytelny sans), accent (charakter)
5. **AI Prompty** — INSERT type='ai_prompt':
   - `title` = nazwa promptu (np. "Logo główne na ciemnym tle")
   - `value` = pełna treść promptu
   - `notes` = JSON `{"category":"logo|mockup"}`
   - Minimum 5 promptów logo + 10 promptów mockupów (razem 15)

## Proces myslenia (jak generowac)

### Krok 1: Analiza produktu

Przeczytaj nazwe, opis produktu i raporty. Ustal:
- **Kategoria**: sport, tech, gaming, music, beauty, fashion, food, home, kids, health
- **Grupa docelowa**: wiek, plec, styl zycia
- **Emocje marki**: energia, spokoj, luksus, zabawa, profesjonalizm
- **Unikalna cecha produktu**: co go wyroznia
- **Funkcje produktu**: jak dziala, co robi, jakie problemy rozwiazuje
- **Kontekst uzycia**: gdzie i kiedy produkt jest uzywany

### Krok 2: Nazwa marki i domena

**ZAWSZE ZAPYTAJ UZYTKOWNIKA** o finalna nazwe marki i domene przed generowaniem SQL!

#### Flow wyboru nazwy (ZOPTYMALIZOWANY):

**KROK 2.1 — Pobierz nazwy zajete w systemie (NAJPIERW!):**
```bash
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?type=eq.brand_info&select=title" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"
```
Zapisz liste zajetych nazw — NIE proponuj zadnej z nich!

**KROK 2.2 — Wygeneruj 25-30 kandydatow (w glowie, NIE pokazuj uzytkownikowi):**
- ~10 nazw angielskich (premium, DTC style)
- ~10 nazw polskich (bezposrednie, fachowe)
- ~5-10 nazw mieszanych/kreatywnych

**KROK 2.3 — Sprawdz WSZYSTKIE domeny JEDNYM BATCHEM:**
```bash
for domain in nazwa1.pl nazwa2.pl nazwa3.pl [... wszystkie 25-30 ...]; do
  result=$(nslookup $domain 8.8.8.8 2>&1)
  if echo "$result" | grep -qi "can't find\|NXDOMAIN\|Non-existent\|server can't find"; then
    echo "$domain - WOLNA"
  else
    echo "$domain - ZAJETA"
  fi
done
```

**KROK 2.4 — Filtruj i wybierz TOP 10:**
Z kandydatow ktore PRZECHODZA oba filtry (domena wolna + nie ma w systemie), wybierz 10 najlepszych:
- Min 4 polskie
- Min 4 angielskie
- 2 dowolne

**KROK 2.5 — Prezentuj uzytkownikowi TYLKO GOTOWE propozycje:**

Na poczatku wymien nazwy zajete w systemie dla TEJ KATEGORII produktu (przekreslone).

Potem tabela z 10 propozycjami (WSZYSTKIE z wolna domena!):
| # | Nazwa | Domena | Styl | Uzasadnienie |
|---|-------|--------|------|--------------|
| 1 | **Nazwa** | nazwa.pl ✅ | PL/EN | Krotkie uzasadnienie |

Na koncu **Top 3** z rekomendacja.

#### Zasady dla nazw:
- Krotka (1-2 slowa, max 12 znakow)
- Latwa do wymowienia (polskie dla PL, angielskie dla EN)
- Sugeruje emocje/kategorie produktu
- Unikalna, nie koliduje z istniejacymi markami
- **TYLKO NAZWY Z WOLNA DOMENA .pl** — uzytkownik NIGDY nie widzi zajetych!
- Styl polski: bezposredni, fachowy (np. Wglad, Fachownik, Szperacz)
- Styl angielski: nowoczesne DTC brandy (np. VisiCore, DualEye, LensGo)

**CZEKAJ NA ODPOWIEDZ** uzytkownika z wybrana nazwa/domena zanim wstawisz dane do bazy!

### Krok 3: Tagline

Krotkie haslo (3-6 slow) po polsku. Powinno:
- Oddawac esencje marki
- Byc chwytliwe i zapamietywalne
- Uzywac rytmu / rymu / powtorzenia

### Krok 4: Opis marki

3-5 zdan po polsku. Powinien:
- Przedstawic marke (kto jestesmy)
- Opisac flagowy produkt
- Okreslic grupe docelowa
- Zakonczyc emocjonalnym CTA

### Krok 5: Paleta kolorow

Dobierz 6 kolorow pasujacych do kategorii i emocji marki:

| Kategoria | Styl palety | Przyklad primary |
|-----------|------------|------------------|
| sport     | neon electric, ciemne tlo, kontrastowe akcenty | #00D4FF, #FF2D78 |
| tech      | violet/cyan, futurystyczny, ciemny | #7B2FFF, #00E5FF |
| gaming    | neon purple/red, agresywny, RGB | #BF00FF, #FF1744 |
| music     | warm orange/purple, emocjonalny | #FF6B2B, #9B30FF |
| beauty    | rose gold/mauve, delikatny, ciepły | #E8A0BF, #BA68C8 |
| fashion   | mono obsidian/camel, elegancki | #1A1A1A, #C19A6B |
| food      | red/green, naturalny, ciepły | #E63946, #2D6A4F |
| home      | sage/terracotta, organiczny, spokojny | #87A878, #CC7755 |
| kids      | sky blue/coral, jasny, radosny | #4FC3F7, #FF7F7F |
| health    | teal/lavender, czysty, uspokajajacy | #00897B, #9575CD |

Zasady:
- Primary: glowny kolor marki, uzyty w logo i CTA
- Secondary: uzupelnia primary, uzyty w akcentach
- Accent: wyrozniajacy sie, uzyty na highlight/badge
- 3x Neutral: ciemny (tlo), sredni (tekst/border), jasny (tlo alternatywne)

### Krok 6: Typografia

Dobierz 3 fonty z Google Fonts:

| Kategoria | Heading | Body | Accent |
|-----------|---------|------|--------|
| sport     | Bebas Neue | Inter | Orbitron |
| tech      | Space Grotesk | Inter | JetBrains Mono |
| gaming    | Rajdhani | Exo 2 | Press Start 2P |
| music     | Monoton | Poppins | Permanent Marker |
| beauty    | Playfair Display | Lato | Dancing Script |
| fashion   | Cormorant Garamond | Montserrat | Josefin Sans |
| food      | Alfa Slab One | Source Sans Pro | Caveat |
| home      | DM Serif Display | DM Sans | Libre Baskerville |
| kids      | Fredoka One | Nunito | Patrick Hand |
| health    | Quicksand | Open Sans | Comfortaa |
| general   | Plus Jakarta Sans | Inter | Space Mono |

Mozna mieszac — to sa sugestie, nie sztywne reguły. Dostosuj do konkretnego brandu.

---

## Krok 7: Prompty AI (logo + mockupy)

> **KRYTYCZNE**: Prompty są zapisywane do bazy danych jako typ `ai_prompt` w tabeli `workflow_branding`. NIE są tylko komentarzami — muszą być częścią SQL INSERT!

> **FORMAT GRAFIK**: Wszystkie grafiki (logo i mockupy) MUSZĄ być **kwadratowe 1024x1024px**. Bez wyjątków.

Prompty sa RECZNE — pisane przez Claude z pelna wiedza o marce. NIE dynamiczne, NIE szablonowe.

---

### PROMPTY LOGO — Poziom Senior Designer (12+ lat doświadczenia)

> **FILOZOFIA**: Logo musi wyglądać jakby kosztowało $15,000 od agencji brandingowej. Poziom Dyson, Apple, Bang & Olufsen. Nie akceptujemy przeciętności.

> **TŁO**: Wszystkie logo ZAWSZE na BIAŁYM TLE (#FFFFFF). Bez wyjątków.

#### Szablon promptu logo (UŻYWAJ DOSŁOWNIE):

```
KONTEKST PROJEKTU:
Projektujesz logo dla polskiej marki premium "[NAZWA MARKI]" — [krótki opis produktu].
To musi być logo na poziomie Dyson, Apple, Bang & Olufsen. Nie akceptuję przeciętności.

---

BRIEF PRODUKTOWY:
Produkt: [pełna nazwa produktu i typ]
USP: [główne wyróżniki, np. "Najszybsza na rynku (26 sek), ciśnienie 30 kPa (3x konkurencja)"]
Grupa docelowa: [wiek, styl życia, sytuacja — np. "Profesjonaliści 28-45, podróżujący służbowo"]
Emocje marki: [5-6 emocji: np. szybkość, świeżość, lekkość, precyzja, nowoczesność, zaufanie]
Ton: [np. "Polski ale międzynarodowy, przyjazny ale premium"]

---

WYMAGANIA PROJEKTOWE — POZIOM SENIOR DESIGNER:

1. KONSTRUKCJA GEOMETRYCZNA:
- Zbuduj logo na siatce geometrycznej (grid system)
- Użyj proporcji złotego podziału (1:1.618) lub systemu √2
- Każdy element musi mieć matematyczne uzasadnienie
- Optyczna równowaga ważniejsza niż matematyczna symetria

2. SYGNET (IKONA):
- Musi działać samodzielnie w 16x16px (favicon) i na billboardzie
- Wykorzystaj NEGATYWNĄ PRZESTRZEŃ — ukryty symbol w kształcie (jak strzałka w FedEx, niedźwiedź w Toblerone)
- Koncept: [pierwsza litera nazwy] z wbudowanym symbolem [element produktu] — ale subtelnie, nie dosłownie
- NIE rób: dosłownych ikon produktu (parownik, żelazko, robot) — to amatorskie
- ZRÓB: elegancką abstrakcję która SUGERUJE [cechę produktu] przez ruch, lekkość, formę

3. WORDMARK "[NAZWA MARKI]":
- Typografia: custom letterforms lub heavily modified geometric sans
- Litery muszą mieć CHARAKTER — nie używaj fontu prosto z Google Fonts
- Rozważ ligaturę lub unikalne połączenie liter
- Proporcje: x-height wysoka, tracking optycznie wyrównany
- Kropka nad "i" może nawiązywać do ikony (kropla, punkt, element)

4. UKŁAD COMBO MARK:
- Sygnet ZAWSZE po lewej stronie, wordmark po prawej, w jednej linii
- Proporcje: sygnet to ~25-30% szerokości całego logo
- Odstęp między sygnetem a tekstem = szerokość litery "i" w wordmark
- Logo musi działać w proporcjach od 1:1 (sam sygnet) do 4:1 (pełny combo mark)

5. KOLORYSTYKA:
- Primary: [HEX] ([nazwa koloru]) — [gdzie użyty]
- Secondary: [HEX] ([nazwa]) — użyj TYLKO jako subtelny akcent, max 10%
- Sygnet: w kolorze primary [HEX]
- Wordmark: w kolorze neutral dark [HEX]
- GRADIENT: Jeśli używasz, tylko subtelny, w obrębie sygnetu
- NIE używaj gradientu na tekście

6. STYL WIZUALNY:
- Referencje: Stripe, Linear, Notion, Figma, Vercel — nowoczesny tech minimalizm
- Linie: czyste, pewne, bez drżenia
- Narożniki: konsekwentne promienie (wszystkie 2px lub wszystkie 4px, nie mieszaj)
- Grubość linii: optycznie wyrównana (cieńsze linie w mniejszych elementach)

---

CZEGO ABSOLUTNIE UNIKAĆ (typowe błędy AI):

❌ Dosłowne ikony produktu (parownik, żelazko, robot, kubek, narzędzie)
❌ Clipart-style, stockowe ikony
❌ Gradienty tęczowe lub wielokolorowe
❌ Efekty 3D, cienie, bliki, glossy
❌ Zbyt wiele detali — logo musi działać w 1 kolorze
❌ Tekst w łuku lub zniekształcony
❌ Losowe fonty — każda litera musi być przemyślana
❌ Sygnet nad tekstem (układ pionowy) — tylko poziomy!
❌ Nierówne odstępy między literami
❌ Zbyt cienkie linie które znikną w małym rozmiarze

---

PROCES MYŚLOWY DESIGNERA:

Krok 1: Zacznij od SZKICU siatki geometrycznej
Krok 2: Zbuduj sygnet na okręgach i prostych — każdy element z gridu
Krok 3: Sprawdź czy sygnet działa w 32x32px — jeśli nie, upraszczaj
Krok 4: Zaprojektuj wordmark z custom kerningiem
Krok 5: Połącz sygnet z wordmark, sprawdź optyczną równowagę
Krok 6: Testuj w czerni i bieli — jeśli działa bez koloru, działa wszędzie

---

DELIVERABLE:

Jedno logo w formacie 1024x1024px:
- Tło: BIAŁE (#FFFFFF)
- Sygnet: [kolor primary HEX]
- Wordmark "[NAZWA]": [kolor neutral dark HEX]
- Układ: Sygnet po lewej, wordmark po prawej, wycentrowane w kadrze
- Styl: Flat, minimalistyczny, premium, profesjonalny
- Jakość: Wektorowa ostrość, czyste krawędzie, perfekcyjne proporcje

To logo musi wyglądać jakby kosztowało $15,000 od agencji brandingowej.
```

#### Przykłady konceptów symbolu per kategoria:

| Kategoria | NIE rób (dosłowne) | ZRÓB (abstrakcja) |
|-----------|-------------------|-------------------|
| **Parownica** | chmurka pary, żelazko | fale unoszące się, litera z ruchem w górę |
| **Robot okienny** | robot, okno, ścierka | panorama w negatywie, horyzont, czysta linia |
| **Kamera endoskopowa** | kamera, przewód | oko w literze, promień światła, fokus |
| **Ekspres do kawy** | filiżanka, ziarna | para w negatywie, krzywa crema |
| **Masażer** | ręka, mięśnie | fale koncentryczne, pulsowanie |
| **Odkurzacz** | odkurzacz, dom | spirala ruchu, wir, ścieżka |

#### 5 wariantów logo do wygenerowania (OBOWIĄZKOWE):

> **WAŻNE**: Po wstawieniu brandingu do bazy, system automatycznie wygeneruje wszystkie 5 logo.
> Wszystkie logo mają: sygnet PO LEWEJ, wordmark PO PRAWEJ, BIAŁE TŁO, format KWADRATOWY 1024x1024px.

**Prompt 1 — Minimalistyczne (krótki prompt):**
```
Logo for "[NAZWA]" brand. Left side: geometric symbol representing [CECHA PRODUKTU]. Right side: "[NAZWA]" in clean sans-serif. Colors: symbol in [PRIMARY HEX], text in dark gray. White background. Square format 1024x1024px. Modern, minimal, professional.
```

**Prompt 2 — Premium z negatywną przestrzenią (długi prompt):**
```
Design a premium logo for Polish brand "[NAZWA]" — [krótki opis produktu].

LAYOUT: Horizontal combo mark. Symbol (signet) on LEFT, wordmark on RIGHT, in one line.
SYMBOL: Use negative space to hide a subtle reference to [ELEMENT PRODUKTU] within the first letter or geometric shape. Think FedEx arrow, Toblerone bear. Abstract, not literal.
WORDMARK: "[NAZWA]" in custom geometric sans-serif. High x-height, optically balanced tracking.
COLORS: Symbol in [PRIMARY HEX] ([nazwa koloru]). Wordmark in [NEUTRAL DARK HEX].
STYLE: Apple/Dyson level. Clean lines, no gradients, no effects. Must work at 32x32px.

White background (#FFFFFF). Square format 1024x1024px. Centered composition with breathing room.
This logo should look like it cost $15,000 from a top branding agency.
```

**Prompt 3 — Geometryczny sygnet (średni prompt):**
```
Logo for "[NAZWA]" — [kategoria produktu] brand.

Create a logo with geometric symbol on the left and wordmark on the right.
Symbol: Built on a grid system using circles and lines. Abstract representation of [CECHA PRODUKTU] — movement, precision, or energy. No literal icons.
Wordmark: "[NAZWA]" in bold geometric sans-serif font.
Color: Symbol [PRIMARY HEX], text [NEUTRAL DARK HEX].

White background. Square 1024x1024px. Clean, modern, premium quality.
```

**Prompt 4 — Typograficzny akcent (krótki prompt):**
```
Minimalist logo: "[NAZWA]" wordmark with integrated symbol on the left side. The symbol should be derived from letterforms — perhaps a stylized first letter with [CECHA PRODUKTU] suggestion. Primary color [PRIMARY HEX] for symbol, dark text. White background, square 1024x1024px. Tech-forward, contemporary.
```

**Prompt 5 — Dynamiczny i nowoczesny (długi prompt):**
```
Create a modern, dynamic logo for "[NAZWA]" brand in the [KATEGORIA] category.

COMPOSITION:
- Left: Bold graphic symbol suggesting [EMOCJE MARKI: np. speed, precision, energy]
- Right: "[NAZWA]" wordmark in contemporary sans-serif
- Horizontal alignment, single line

SYMBOL REQUIREMENTS:
- Abstract geometric form, NOT a literal representation of the product
- Should convey [EMOCJE: np. motion, trust, innovation]
- Works perfectly at small sizes (favicon)
- Built with mathematical precision (golden ratio or √2 proportions)

TYPOGRAPHY:
- Custom feel, not a standard Google Font look
- Consider unique ligature or modified letterforms
- Balanced kerning, strong presence

COLORS:
- Symbol: [PRIMARY HEX] ([nazwa koloru])
- Wordmark: [NEUTRAL DARK HEX] ([nazwa])

TECHNICAL:
- White background (#FFFFFF)
- Square format: 1024x1024px
- Flat design, no shadows, no gradients
- Must scale from 16x16px to billboard

Reference style: Stripe, Linear, Vercel, Notion — modern tech minimalism.
```

> **ZASADA UKŁADU (WSZYSTKIE WARIANTY):**
> Sygnet (ikona) ZAWSZE po LEWEJ, wordmark po PRAWEJ, w tej samej linii.
> Układ: `[SYGNET] [NAZWA MARKI]` — nigdy odwrotnie, nigdy pionowo.
> ZAWSZE białe tło. ZAWSZE kwadrat 1024x1024px.

---

### PROMPTY MOCKUPÓW — Poziom Senior Product Photographer

> **FILOZOFIA**: Mockupy muszą wyglądać jak sesja z budżetem $5,000 — nie jak stockowe zdjęcia. Poziom Apple, Aesop, Kinfolk Magazine. Każde zdjęcie opowiada historię marki.

> **KRYTYCZNA INSTRUKCJA (zawsze na początku promptu):**
> ```
> ⚠️ UŻYJ DOKŁADNIE TEGO LOGO które jest załączone w tej rozmowie.
> NIE projektuj nowego logo. NIE zmieniaj proporcji, kolorów ani układu.
> Skopiuj logo 1:1 i umieść na gadżecie zgodnie ze specyfikacją.
> ```

---

#### ⚠️ KRYTYCZNE: Mockupy muszą opowiadać historię PRODUKTU

**NIE RÓB generycznych "lifestyle" mockupów!** Każdy mockup musi być głęboko dopasowany do:

1. **Samego produktu** — co to jest, jak działa, do czego służy
2. **Grupy docelowej** — kto kupuje, w jakiej sytuacji życiowej
3. **USP produktu** — co wyróżnia, jaki problem rozwiązuje
4. **Kontekstu użycia** — gdzie i kiedy produkt jest używany

**ZASADA STORYTELLINGU:**
- Każdy mockup opowiada mini-historię związaną z produktem
- Gadżet (koszulka, kubek, torba) jest tylko NOŚNIKIEM — ważniejszy jest KONTEKST
- Pokaż EFEKTY użycia produktu, nie tylko sam gadżet

**PRZYKŁADY DOBREGO vs ZŁEGO podejścia:**

| Produkt | ❌ ZŁEGO (generyczne) | ✅ DOBRE (dopasowane) |
|---------|----------------------|----------------------|
| **Robot uczący rysunku** | Koszulka w studio, model pozuje | Dziecko w koszulce leży na podłodze i rysuje z robotem |
| **Parownica do ubrań** | Kubek na białym biurku | Kubek w sypialni obok wieszaka z wyprasowaną koszulą |
| **Robot do mycia okien** | Czapka flat lay na drewnie | Osoba w czapce patrzy przez czyste okno na panoramę |
| **Masażer** | Torba w studio | Torba na siłowni, wystają ręcznik i masażer |

**CO POKAZYWAĆ W MOCKUPACH:**

| Element | Jak pokazać |
|---------|------------|
| **Produkt w akcji** | Robot/urządzenie widoczne, ktoś go używa |
| **Efekty/rezultaty** | Rysunki dziecka, czyste okno, wyprasowane ubranie |
| **Kontekst emocjonalny** | Rodzic obserwuje z dumą, relaks po użyciu |
| **Alternatywa dla problemu** | Tablet odłożony (zamiast ekranu), zmęczenie przed użyciem |
| **Postępy/rozwój** | Galeria rysunków na lodówce, "przed i po" |

**CZEGO NIE POKAZYWAĆ:**

❌ Sterylne studio bez kontekstu
❌ Model pozujący bez interakcji z produktem
❌ Gadżet sam w sobie jako "bohater" (bez historii)
❌ Generyczne "lifestyle" które pasuje do każdego produktu
❌ Sceny które nie mają związku z produktem

---

#### Wymagania fotograficzne — poziom profesjonalny

##### 1. OPTYKA I KADROWANIE

| Typ ujęcia | Obiektyw | Przysłona | Efekt |
|------------|----------|-----------|-------|
| **Product hero** | 85mm | f/2.8 | Płytka głębia, bokeh w tle |
| **Lifestyle** | 35mm | f/4 | Szerszy kontekst, environmental |
| **Flat lay** | 50mm | f/5.6 | Równomierna ostrość, z góry |
| **Detail/texture** | 100mm macro | f/4 | Zbliżenie na materiał, haft, fakturę |

##### 2. OŚWIETLENIE

| Sceneria | Setup oświetlenia | Temperatura | Mood |
|----------|-------------------|-------------|------|
| **Wnętrze dzienne** | Duże okno jako key light, reflektor jako fill | 5500K (daylight) | Świeży, naturalny |
| **Golden hour** | Ciepłe światło boczne, długie cienie | 3500K (warm) | Emocjonalny, premium |
| **Studio** | Softbox 45° jako key, fill z przeciwnej | 5000K (neutral) | Czysty, komercyjny |
| **Moody/evening** | Praktyczne światło (lampa), ciemne tło | 2700K (tungsten) | Intymny, luksusowy |

**Zasady światła:**
- Key light: główne źródło, tworzy kształt i objętość
- Fill light: rozjaśnia cienie, stosunek 2:1 lub 3:1 do key
- Rim/hair light: oddziela obiekt od tła, kontur
- Unikaj: płaskiego frontalnego światła (stockowy look)

##### 3. KOMPOZYCJA

| Zasada | Jak stosować |
|--------|--------------|
| **Rule of thirds** | Gadżet w punkcie mocy (1/3 od krawędzi) |
| **Leading lines** | Linie blatu, okna, mebli prowadzą do produktu |
| **Negative space** | Min. 30% kadru puste — oddech, elegancja |
| **Layering** | Foreground (rozmyty) → product (ostry) → background (rozmyty) |
| **Triangle composition** | 3 elementy tworzące trójkąt (produkt + 2 rekwizyty) |

##### 4. COLOR GRADING / POST-PROCESSING

| Styl marki | Color grade | Kontrast | Saturacja |
|------------|-------------|----------|-----------|
| **Premium/luksus** | Ciepłe cienie, chłodne highlights | Średni | Stonowana |
| **Tech/modern** | Neutralny, lekko chłodny | Wysoki | Niska |
| **Lifestyle/warm** | Pomarańcz w cieniach, teal w highlights | Niski | Naturalna |
| **Clean/minimal** | Zimne biele, neutralne | Średni | Bardzo niska |

##### 5. MATERIAŁY I TEKSTURY

| Materiał | Jak pokazać | Światło |
|----------|-------------|---------|
| **Bawełna/tekstylia** | Widoczny splot, naturalne fałdy | Boczne, podkreśla teksturę |
| **Ceramika matowa** | Delikatny highlight, brak odbić | Softbox, rozproszone |
| **Metal szczotkowany** | Subtelne refleksy, nie prześwietlone | Gradient, strip softbox |
| **Skóra/eko-skóra** | Grain widoczny, ciepłe tony | Golden hour lub ciepłe studio |
| **Karton/papier** | Tekstura widoczna, ostre krawędzie | Boczne, raking light |

---

#### CZEGO ABSOLUTNIE UNIKAĆ (typowe błędy AI):

❌ **Stockowy look** — sterylne białe tło, plastikowe oświetlenie, brak charakteru
❌ **Pływające obiekty** — cienie nie zgadzają się z powierzchnią
❌ **Nienaturalne cienie** — zbyt ostre, w złym kierunku, podwójne
❌ **Logo zniekształcone** — rozciągnięte, zła perspektywa, rozmyte
❌ **Plastikowe materiały** — bawełna wygląda jak plastik, metal jak farba
❌ **Overprocessing** — przesycone kolory, HDR look, nienaturalne
❌ **Zła skala** — logo za duże/małe względem gadżetu
❌ **Brak kontekstu** — produkt w próżni, bez historii
❌ **Perfekcyjne = fałszywe** — zbyt idealne fałdy, niemożliwe odbicia
❌ **Niespójne światło** — różne źródła światła w jednej scenie

---

#### Szablon promptu mockupowego (UŻYWAJ DOSŁOWNIE):

```
⚠️ UŻYJ DOKŁADNIE TEGO LOGO które jest załączone w tej rozmowie.
NIE projektuj nowego logo. NIE zmieniaj proporcji, kolorów ani układu.
Skopiuj logo 1:1 i umieść na gadżecie zgodnie ze specyfikacją.

---

FOTOGRAF: Senior product photographer, 15 lat doświadczenia, portfolio w Kinfolk i Cereal Magazine.
BUDŻET SESJI: $5,000 — to musi wyglądać jak profesjonalna kampania, nie stock photo.

---

GADŻET:
- Typ: [nazwa gadżetu]
- Materiał: [bawełna, ceramika, metal, karton — szczegółowo]
- Kolor bazowy: [HEX] — [nazwa koloru]
- Wykończenie: [matowe, błyszczące, szczotkowane, teksturowane]

BRANDING NA GADŻECIE:
- Element: [logo pełne / sam sygnet / wordmark / tagline]
- Rozmiar: [np. "8cm szerokości" lub "15% powierzchni"]
- Pozycja: [lewa pierś, centralnie, dolny prawy róg — precyzyjnie]
- Technika: [haft / sitodruk / sublimacja / grawer / tłoczenie]
- Kolor logo: [HEX]

---

SCENA I KONTEKST:

Lokalizacja: [konkretna, np. "nowoczesna kuchnia w apartamencie z widokiem na miasto"]
Pora dnia: [poranne światło / golden hour / wieczór / studio]
Mood: [świeży i energiczny / spokojny i premium / ciepły i przytulny]

Rekwizyty (max 3):
1. [rekwizyt główny — związany z produktem/marką]
2. [rekwizyt drugorzędny — tekstura/kolor]
3. [rekwizyt tła — rozmyty, kontekst]

Osoba (jeśli dotyczy):
- Typ: [wiek, styl, co robi w kadrze]
- Widoczność: [tylko dłonie / tors bez twarzy / sylwetka rozmyta]
- Ubranie: [kolorystyka, styl]

---

SPECYFIKACJA FOTOGRAFICZNA:

Obiektyw: [85mm f/2.8 portrait / 35mm f/4 environmental / 50mm f/5.6 flat lay]
Przysłona: [f/2.8 płytka głębia / f/5.6 umiarkowana / f/8 ostra]
Głębia ostrości: [co ostre, co rozmyte — precyzyjnie]

Oświetlenie:
- Key light: [źródło, kierunek, intensywność]
- Fill: [stosunek do key, np. 2:1]
- Rim/accent: [jeśli potrzebny]
- Temperatura: [Kelvin]

Kompozycja:
- Kadrowanie: [rule of thirds / centralny / dynamiczna przekątna]
- Punkt widzenia: [na poziomie oczu / lekko z góry / flat lay 90°]
- Negative space: [gdzie, ile procent kadru]

Color grade:
- Cienie: [ciepłe/zimne/neutralne]
- Highlights: [czyste białe / kremowe / chłodne]
- Kontrast: [niski/średni/wysoki]
- Saturacja: [stonowana/naturalna/żywa]

---

REFERENCJE WIZUALNE:
Styl jak: [Apple product photography / Aesop campaign / Kinfolk editorial / Everlane lifestyle]

FORMAT: 1024x1024px (ZAWSZE KWADRAT)
JAKOŚĆ: Fotorealistyczny render, jakość sesji komercyjnej
```

---

#### Minimum 10 mockupów dla każdej marki:

**WAŻNE:** Poniższa lista to tylko GADŻETY — sceneria i kontekst MUSZĄ być dopasowane do produktu!

| # | Gadżet | Jak dopasować do produktu |
|---|--------|---------------------------|
| 1 | Koszulka | Osoba UŻYWA produktu w koszulce (nie pozuje!) |
| 2 | Bluza z kapturem | Moment związany z produktem (rodzina, praca, hobby) |
| 3 | Czapka z daszkiem | Kontekst outdoorowy LUB związany z produktem |
| 4 | Kubek ceramiczny | Poranna rutyna + nawiązanie do produktu w tle |
| 5 | Torba bawełniana | W drodze do/z miejsca związanego z produktem |
| 6 | Breloczek metalowy | Na plecaku/kluczach + produkt widoczny w tle |
| 7 | Notes firmowy | "Dziennik postępów" lub dokumentacja związana z produktem |
| 8 | Zestaw naklejek | Na lodówce/laptopie + efekty użycia produktu |
| 9 | Ściereczka z mikrofibry | Dbanie o produkt, relacja użytkownik-produkt |
| 10 | Opakowanie produktu | Moment unboxing, radość z prezentu |

---

#### Kontekst sceny per kategoria produktu:

**ZASADA:** Mockupy pokazują PRODUKT W UŻYCIU, nie tylko gadżet!

| Kategoria | Lokalizacja | Co pokazać w scenie | Storytelling |
|-----------|-------------|---------------------|--------------|
| **Kids / Edukacja** | Pokój dziecięcy, kuchnia rodzinna, piknik | Dziecko używa produktu, rodzic obserwuje z dumą | "Zamiast tableta", postępy w nauce, galeria prac na lodówce |
| **Smart Home / AGD** | Dom, sypialnia, kuchnia | Produkt w akcji, efekt "przed/po" | Poranna rutyna, ułatwienie życia |
| **Robot okienny** | Apartament z panoramą | Osoba patrzy przez CZYSTE okno, robot pracuje | Panorama miasta, wolny czas zamiast sprzątania |
| **Parownica** | Sypialnia, garderoba | Wyprasowane ubrania na wieszaku, przygotowanie do wyjścia | Profesjonalny wygląd, oszczędność czasu |
| **Narzędzia** | Warsztat, garaż, budowa | Efekt pracy (naprawione, zbudowane), narzędzie w akcji | Satysfakcja z własnoręcznej roboty |
| **Sport / Fitness** | Siłownia, park, dom | Po treningu z produktem, regeneracja | Energia, zdrowie, aktywność |
| **Beauty / Wellness** | Łazienka, sypialnia | Moment relaksu, efekt użycia (skóra, włosy) | Self-care, czas dla siebie |
| **Masażer** | Sofa, sypialnia, po treningu | Osoba używa masażera, ulga, relaks | Regeneracja, koniec bólu |
| **Kamera/Endoskop** | Warsztat, dom, samochód | Ekran pokazuje co widzi kamera, "odkrycie" | Diagnoza problemu, satysfakcja z naprawy |
| **Odkurzacz** | Dom, pokój, samochód | Czysta przestrzeń, rodzina korzysta z czystego domu | Czystość bez wysiłku |

**Dla każdej kategorii pytaj się:**
1. Gdzie produkt jest używany? → Tam ustaw scenę mockupu
2. Kto używa? → Ta osoba powinna być w mockupie
3. Jaki efekt daje produkt? → Pokaż ten efekt (czyste okno, rysunek dziecka, wyprasowana koszula)
4. Jaki problem rozwiązuje? → Pokaż "przed" (zmęczenie) i "po" (ulga) lub alternatywę (tablet odłożony)

---

#### Przykład wypełnionego promptu (Prasik — parownica):

**KONTEKST PRODUKTU:** Parownica do ubrań, USP: szybkie prasowanie (26 sek), profesjonalny wygląd bez wysiłku. Grupa docelowa: profesjonaliści 28-45, podróżujący służbowo.

**STORYTELLING:** Pokazujemy efekt użycia parownicy (wyprasowana koszula) + poranny rytuał profesjonalisty.

```
⚠️ UŻYJ DOKŁADNIE TEGO LOGO które jest załączone w tej rozmowie.
NIE projektuj nowego logo. NIE zmieniaj proporcji, kolorów ani układu.
Skopiuj logo 1:1 i umieść na gadżecie zgodnie ze specyfikacją.

---

FOTOGRAF: Senior product photographer, 15 lat doświadczenia, portfolio w Kinfolk i Cereal Magazine.
BUDŻET SESJI: $5,000 — to musi wyglądać jak profesjonalna kampania, nie stock photo.

---

GADŻET:
- Typ: Kubek ceramiczny
- Materiał: Ceramika matowa, gruby brzeg
- Kolor bazowy: #FFFFFF — biały matowy
- Wykończenie: Matowe, delikatna faktura

BRANDING NA GADŻECIE:
- Element: Logo Prasik (sygnet + wordmark)
- Rozmiar: 6cm szerokości, wycentrowane
- Pozycja: Centralnie na froncie kubka
- Technika: Nadruk ceramiczny wysokotemperaturowy
- Kolor logo: Sygnet #4ECDC4 (Steam Teal), wordmark #1A1A2E (Charcoal)

---

SCENA I KONTEKST:

Lokalizacja: Nowoczesna sypialnia, poranne przygotowania do pracy
Pora dnia: Wczesny poranek, światło przez zasłony
Mood: Świeży, energetyczny, profesjonalny start dnia

KLUCZOWY KONTEKST PRODUKTU (STORYTELLING):
Profesjonalista przygotowuje się do ważnego spotkania. Parownica Prasik właśnie skończyła pracę — PERFEKCYJNIE WYPRASOWANA biała koszula wisi na wieszaku (efekt użycia produktu!). Kubek z kawą czeka na stoliku. Sugestia: "26 sekund i jestem gotowy".

Rekwizyty:
1. Wieszak z IDEALNIE wyprasowaną białą koszulą (EFEKT PRODUKTU — główny element!)
2. Parownica Prasik odłożona obok (widoczna, ale nie dominuje)
3. Teczka/laptop bag przy drzwiach (kontekst: profesjonalista, spotkanie)

Osoba: Brak — ale sugestia obecności (kawa paruje, koszula właśnie wyprasowana)

---

SPECYFIKACJA FOTOGRAFICZNA:

Obiektyw: 85mm f/2.8 portrait lens
Przysłona: f/2.8
Głębia ostrości: Kubek ostry, koszula na wieszaku w miękkim bokeh ALE WYRAŹNA (to efekt produktu!), tło rozmyte

Oświetlenie:
- Key light: Duże okno po lewej, światło przez lniane zasłony (rozproszone)
- Fill: Naturalny odbity od białej ściany, stosunek 3:1
- Temperatura: 5500K (świeży daylight)

Kompozycja:
- Kadrowanie: Rule of thirds, kubek w prawym punkcie mocy
- WAŻNE: Koszula na wieszaku MUSI być widoczna w kadrze — to opowiada historię!
- Punkt widzenia: Lekko z góry (15°), na poziomie blatu
- Negative space: 30%

Color grade:
- Cienie: Lekko ciepłe (beżowe)
- Highlights: Czyste białe — podkreśla CZYSTOŚĆ wyprasowanej koszuli
- Kontrast: Średni
- Saturacja: Stonowana, naturalna

---

REFERENCJE WIZUALNE:
Styl jak: Everlane lifestyle photography + Kinfolk morning rituals
NIE JAK: Generyczny kubek na biurku bez kontekstu

FORMAT: 1024x1024px (ZAWSZE KWADRAT)
JAKOŚĆ: Fotorealistyczny render, jakość sesji komercyjnej
```

**DLACZEGO TEN MOCKUP DZIAŁA:**
- ✅ Pokazuje EFEKT produktu (wyprasowana koszula)
- ✅ Kontekst dopasowany do grupy docelowej (profesjonalista, poranek przed spotkaniem)
- ✅ Produkt widoczny w scenie (parownica odłożona)
- ✅ Opowiada historię: "użyłem parownicy → jestem gotowy na spotkanie"
- ❌ NIE jest to: kubek na pustym biurku, model w studio

---

## Wstawianie do bazy przez API

> **WAŻNE**: NIE generuj SQL! Wstawiaj dane BEZPOŚREDNIO przez Supabase REST API używając curl.

### Krok 1: Usuń istniejące dane brandingowe

```bash
curl -s -X DELETE "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&type=in.(brand_info,color,font,ai_prompt)" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"
```

### Krok 2: Przygotuj JSON i wstaw przez POST

Dla każdego typu danych (brand_info, colors, fonts, ai_prompts):
1. Zapisz JSON do pliku tymczasowego: `c:/tmp/branding_[typ].json`
2. Wyślij przez curl z `-d @plik.json`

```bash
# Przykład wstawiania kolorów
curl -s -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d @c:/tmp/branding_colors.json
```

### Format JSON dla każdego typu

**brand_info** (pojedynczy obiekt):
```json
{
  "workflow_id": "[WORKFLOW_ID]",
  "type": "brand_info",
  "title": "[NAZWA]",
  "value": "{\"name\":\"[NAZWA]\",\"tagline\":\"[TAGLINE]\",\"description\":\"[OPIS]\"}",
  "sort_order": 0
}
```

**colors** (tablica 6 obiektów):
```json
[
  {"workflow_id": "[WID]", "type": "color", "title": "[NAME]", "value": "[HEX]", "notes": "{\"role\":\"primary\"}", "sort_order": 0},
  {"workflow_id": "[WID]", "type": "color", "title": "[NAME]", "value": "[HEX]", "notes": "{\"role\":\"secondary\"}", "sort_order": 1},
  {"workflow_id": "[WID]", "type": "color", "title": "[NAME]", "value": "[HEX]", "notes": "{\"role\":\"accent\"}", "sort_order": 2},
  {"workflow_id": "[WID]", "type": "color", "title": "[NAME]", "value": "[HEX]", "notes": "{\"role\":\"neutral\"}", "sort_order": 3},
  {"workflow_id": "[WID]", "type": "color", "title": "[NAME]", "value": "[HEX]", "notes": "{\"role\":\"neutral\"}", "sort_order": 4},
  {"workflow_id": "[WID]", "type": "color", "title": "[NAME]", "value": "[HEX]", "notes": "{\"role\":\"neutral\"}", "sort_order": 5}
]
```

**fonts** (tablica 3 obiektów):
```json
[
  {"workflow_id": "[WID]", "type": "font", "title": "[FONT]", "value": "heading", "notes": "{\"role\":\"heading\",\"weights\":[\"500\",\"700\"]}", "sort_order": 0},
  {"workflow_id": "[WID]", "type": "font", "title": "[FONT]", "value": "body", "notes": "{\"role\":\"body\",\"weights\":[\"400\",\"500\",\"600\",\"700\"]}", "sort_order": 1},
  {"workflow_id": "[WID]", "type": "font", "title": "[FONT]", "value": "accent", "notes": "{\"role\":\"accent\",\"weights\":[\"400\",\"700\"]}", "sort_order": 2}
]
```

**ai_prompts** (tablica 15 obiektów — 5 logo + 10 mockupów):
```json
[
  {"workflow_id": "[WID]", "type": "ai_prompt", "title": "Logo minimalistyczne", "value": "[KRÓTKI PROMPT 1]", "notes": "{\"category\":\"logo\"}", "sort_order": 0},
  {"workflow_id": "[WID]", "type": "ai_prompt", "title": "Logo premium", "value": "[DŁUGI PROMPT 2]", "notes": "{\"category\":\"logo\"}", "sort_order": 1},
  {"workflow_id": "[WID]", "type": "ai_prompt", "title": "Logo geometryczne", "value": "[ŚREDNI PROMPT 3]", "notes": "{\"category\":\"logo\"}", "sort_order": 2},
  {"workflow_id": "[WID]", "type": "ai_prompt", "title": "Logo typograficzne", "value": "[KRÓTKI PROMPT 4]", "notes": "{\"category\":\"logo\"}", "sort_order": 3},
  {"workflow_id": "[WID]", "type": "ai_prompt", "title": "Logo dynamiczne", "value": "[DŁUGI PROMPT 5]", "notes": "{\"category\":\"logo\"}", "sort_order": 4},
  {"workflow_id": "[WID]", "type": "ai_prompt", "title": "Koszulka — [kontekst]", "value": "[PEŁNY PROMPT]", "notes": "{\"category\":\"mockup\"}", "sort_order": 5},
  ...pozostałe 9 mockupów z sort_order 6-14...
]
```

> **WAŻNE**: Każdy prompt logo musi być kompletny i samodzielny. Użyj szablonów z sekcji "5 wariantów logo do wygenerowania" powyżej, podstawiając dane marki (nazwa, kolory, cechy produktu).

### Kolejność wstawiania

1. DELETE istniejących danych
2. POST brand_info (z pliku JSON)
3. POST colors (z pliku JSON)
4. POST fonts (z pliku JSON)
5. POST ai_prompts logo (z pliku JSON)
6. POST ai_prompts mockupy (z pliku JSON)

Po każdym POST sprawdź czy zwróciło pustą odpowiedź (sukces) lub błąd JSON.

---

## Przyklad uzycia

Uzytkownik: "Zrob branding dla workflow 01523ee9..."
Claude:
1. Czyta ten plik jako referencje
2. Pobiera dane z Supabase (workflow, raporty) — patrz sekcja ponizej
3. Szuka raportu typu `report_pdf` (glowna analiza) oraz `report_infographic` (PNG do podgladu)
4. Pobiera infografike PNG przez curl i odczytuje ja narzedziem Read (obraz zawiera kluczowe info)
5. Analizuje produkt na podstawie infografiki i nazw plikow raportow
6. Proponuje 10 nazw marki z domenami i **CZEKA NA WYBOR UZYTKOWNIKA**
7. Po wyborze:
   - Przygotowuje dane (brand info, kolory, fonty, prompty)
   - **WSTAWIA BEZPOSREDNIO DO BAZY** przez curl (DELETE + POST)
   - Weryfikuje czy dane sa w bazie
8. **AUTOMATYCZNIE GENERUJE 5 LOGO** — patrz sekcja poniżej
9. Informuje użytkownika: "Gotowe! Branding i 5 logo wygenerowane. Odśwież stronę workflow."

---

## Automatyczne generowanie 5 logo (OBOWIĄZKOWE)

> **WAŻNE**: Po wstawieniu brandingu do bazy, Claude MUSI automatycznie wygenerować 5 logo.
> NIE czekaj na użytkownika — generuj od razu po wstawieniu danych.

### Procedura generowania logo

Dla każdego z 5 promptów logo zapisanych w bazie:

1. **Wywołaj edge function `generate-image`** przez curl:
```bash
curl -s -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/generate-image" \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "[PEŁNY PROMPT LOGO]",
    "count": 1,
    "workflow_id": "[WORKFLOW_ID]",
    "type": "logo"
  }'
```

2. **Odbierz URL wygenerowanego logo** z odpowiedzi:
```json
{"images":[{"url":"https://...supabase.co/storage/v1/object/public/attachments/ai-generated/..."}]}
```

3. **Zapisz logo do bazy** jako `workflow_branding` z type='logo':
```bash
curl -s -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "[WORKFLOW_ID]",
    "type": "logo",
    "title": "[NAZWA PROMPTU np. Logo minimalistyczne]",
    "file_url": "[URL Z ODPOWIEDZI]",
    "notes": "{\"variant\":\"light\",\"is_main\":[true dla pierwszego, false dla pozostałych]}",
    "sort_order": [0-4]
  }'
```

### Kolejność generowania

1. **Logo minimalistyczne** — `is_main: true` (pierwsze = główne)
2. **Logo premium** — `is_main: false`
3. **Logo geometryczne** — `is_main: false`
4. **Logo typograficzne** — `is_main: false`
5. **Logo dynamiczne** — `is_main: false`

### Obsługa błędów

- Jeśli generowanie pojedynczego logo się nie uda — kontynuuj z kolejnym
- Na końcu poinformuj użytkownika ile logo zostało wygenerowanych
- Przykład: "Wygenerowano 5/5 logo. Odśwież stronę workflow."

### Ważne

- Generuj logo SEKWENCYJNIE (jedno po drugim), nie równolegle
- Każde generowanie może trwać 10-30 sekund
- Pierwsze wygenerowane logo ZAWSZE ma `is_main: true`

---

## Jak pobierac dane z Supabase (dla Claude)

### Konfiguracja
- **URL**: `https://yxmavwkwnfuphjqbelws.supabase.co`
- **Service Key**: w pliku `c:\repos_tn\tn-crm\.env` (zmienna `SUPABASE_SERVICE_KEY`)

### Komendy curl

```bash
# 1. Pobierz workflow
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"

# 2. Pobierz raporty (SZUKAJ type='report_pdf' i 'report_infographic')
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_reports?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"

# 3. Pobierz istniejacy branding (do sprawdzenia)
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"
```

### Pobieranie obrazow z raportow
Jesli raport to PNG/JPG — pobierz przez curl i odczytaj narzedziem Read:
```bash
curl -s -o "c:/repos_tn/temp_image.png" "[FILE_URL]"
```
Nastepnie uzyj `Read` na pliku tymczasowym zeby zobaczyc obraz.

### Szablon promptu dla uzytkownika

```
Zrob branding dla workflow [UUID]

Instrukcje: c:\repos_tn\tn-crm\CLAUDE_BRANDING_PROCEDURE.md
Env: c:\repos_tn\tn-crm\.env
```
