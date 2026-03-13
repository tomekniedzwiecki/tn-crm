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

Gotowy SQL do wklejenia w Supabase SQL Editor. SQL zawiera:

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
   - Minimum 6 promptów logo + 10 promptów mockupów

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

**CZEKAJ NA ODPOWIEDZ** uzytkownika z wybrana nazwa/domena zanim wygenerujesz SQL!

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

#### 6 wariantów logo do wygenerowania:

Dla każdego wariantu użyj tego samego szablonu, zmieniając tylko sekcję DELIVERABLE:

1. **Logo główne** — na białym tle (#FFFFFF), pełne kolory
2. **Logo alternatywne** — na ciemnym tle (#1A1A2E), dostosowane kontrasty
3. **Logo monochromatyczne** — wersja czarna (#000000) na białym tle
4. **Favicon/ikona** — sam sygnet bez tekstu, na białym tle, musi działać w 32x32px
5. **Combo mark poziomy** — sygnet + wordmark w jednej linii, proporcje 4:1
6. **Animacja (storyboard)** — 6 klatek w gridzie 2x3 pokazujących budowanie logo

> **ZASADA UKŁADU:**
> Sygnet (ikona) ZAWSZE po LEWEJ, wordmark po PRAWEJ, w tej samej linii.
> Układ: `[SYGNET] [NAZWA MARKI]` — nigdy odwrotnie, nigdy pionowo.
> Wyjątek: favicon (wariant 4) — sam sygnet.

---

### PROMPTY MOCKUPÓW — Gadżety brandingowe z logo

> **WAŻNE**: Mockupy w sekcji branding to **gadżety reklamowe z logo marki**. Pokazują identyfikację wizualną na fizycznych produktach promocyjnych.

> **KRYTYCZNA ZASADA DLA GENEROWANIA GRAFIK:**
> Każdy prompt MUSI zawierać na samym początku instrukcję dla modelu AI (np. Gemini):
> ```
> INSTRUKCJA: Użyj DOKŁADNIE tego logo które jest załączone/wgrane w tej rozmowie.
> NIE projektuj nowego logo. NIE wymyślaj własnego designu.
> Skopiuj istniejące logo 1:1 i umieść je na gadżecie zgodnie z poniższą specyfikacją.
> ```
> Ta instrukcja zapobiega sytuacji gdy AI ignoruje istniejący design i tworzy własne logo.

#### Filozofia mockupów brandingowych

Mockupy to **standardowe gadżety promocyjne** z logo marki — ale pokazane w **kontekście dopasowanym do produktu**. Gadżety są uniwersalne, ale sceneria, tło i ewentualnie ludzie nawiązują do świata marki.

| Element | Uniwersalny | Dopasowany do produktu |
|---------|-------------|------------------------|
| **Gadżet** | ✅ Koszulka, kubek, czapka... | — |
| **Sceneria/tło** | — | ✅ Warsztat, kuchnia, biuro, apartament |
| **Osoba (opcjonalnie)** | — | ✅ Mechanik, kobieta w domu, sportowiec |
| **Rekwizyty w tle** | — | ✅ Narzędzia, kawa, rośliny, panorama |

**Przykład**: Kubek z logo marki robota okiennego — nie na białym tle stockowym, ale na blacie kuchennym z widokiem na panoramę miasta za oknem.

---

#### Tabela: Kontekst mockupów per kategoria produktu

| Kategoria produktu | Sceneria | Rekwizyty w tle | Typ osoby (jeśli jest) |
|-------------------|----------|-----------------|------------------------|
| **Smart Home / AGD** | Nowoczesna kuchnia, apartament z panoramą | Okno z widokiem, rośliny, minimalizm | Kobieta/mężczyzna 30-45, casual elegancki |
| **Narzędzia** | Warsztat, garaż, budowa | Narzędzia, regały, drewno, metal | Mężczyzna 35-50, roboczy strój |
| **Elektronika** | Biuro domowe, studio, salon | Monitor, słuchawki, minimalistyczne wnętrze | Młody profesjonalista 25-40 |
| **Sport/Fitness** | Siłownia, park, domowa strefa treningowa | Hantle, mata, zielń, poranny świt | Osoba aktywna 25-40, sportowy strój |
| **Beauty/Wellness** | Łazienka spa, sypialnia, gabinet | Świece, ręczniki, rośliny, bambus | Kobieta 28-45, naturalny look |
| **Kawa/Gastronomia** | Kuchnia, kawiarnia, biuro | Ziarna kawy, filiżanki, ekspres | Kobieta/mężczyzna 28-45, casual |

---

#### Lista gadżetów do mockupów (wybierz 10):

**Odzież:**
1. **Koszulka** — bawełniana, logo na piersi lub plecach
2. **Bluza z kapturem** — logo na piersi, haftowane lub nadruk
3. **Czapka z daszkiem** — logo wyhaftowane na froncie

**Akcesoria:**
4. **Kubek / termos** — ceramiczny lub stalowy, logo + kolory marki
5. **Torba / shopperka** — bawełniana lub ekologiczna z logo
6. **Breloczek** — metalowy lub akrylowy z logo

**Materiały biurowe:**
7. **Notes / notatnik** — okładka z logo, kolory marki
8. **Długopis** — metalowy z grawerem logo
9. **Wizytówki** — logo, kolory, typografia

**Tekstylia:**
10. **Ściereczka z mikrofibry** — z wyhaftowanym lub nadrukowanym logo
11. **Ręcznik** — z haftem logo

**Inne gadżety:**
12. **Naklejki** — zestaw naklejek z logo i elementami marki
13. **Magnesy** — na lodówkę z logo
14. **Smycz** — na identyfikator/klucze z logo
15. **Opakowanie produktu** — pudełko premium z brandingiem

---

#### Struktura każdego promptu mockupowego:

```
⚠️ INSTRUKCJA: Użyj DOKŁADNIE tego logo które jest załączone w tej rozmowie.
NIE projektuj nowego logo. NIE wymyślaj własnego designu.
Skopiuj istniejące logo 1:1 i umieść je na gadżecie zgodnie z poniższą specyfikacją.

GADŻET: [nazwa gadżetu, np. "Koszulka bawełniana"]
ELEMENT BRANDINGU: [co jest na gadżecie: logo, nazwa marki, tagline, ikona]
UMIEJSCOWIENIE: [gdzie na gadżecie: na piersi, na plecach, na froncie, haft w rogu]
TECHNIKA: [nadruk, haft, grawer, sublimacja, sitodruk]

KOLORY:
- Gadżet: [kolor bazowy gadżetu — np. biały, czarny, granatowy]
- Logo: [kolor logo — HEX]
- Akcenty: [dodatkowe kolory marki — HEX]

KONTEKST DOPASOWANY DO PRODUKTU:
- Sceneria: [gdzie gadżet jest pokazany — dopasuj do świata produktu]
  Przykłady: warsztat dla narzędzi, kuchnia dla AGD, nowoczesny apartament dla smart home,
  siłownia dla fitness, gabinet spa dla beauty
- Rekwizyty w tle: [2-3 elementy nawiązujące do produktu, rozmyte w tle]
  Przykłady: panorama za oknem, ziarna kawy, narzędzia, rośliny, ręczniki
- Osoba (opcjonalnie): [jeśli gadżet jest noszony — dopasuj osobę do grupy docelowej]
  Przykłady: mechanik 40+ dla narzędzi, kobieta 30+ w domu dla AGD, sportowiec dla fitness

PREZENTACJA:
- Ujęcie: [flat lay / na osobie / złożony / w kontekście]
- Oświetlenie: [naturalne dopasowane do scenerii / studio]
- Głębia ostrości: [gadżet ostry, tło lekko rozmyte]

STYL: [premium, lifestyle, autentyczny — NIE stockowy, dopasowany do marki]
FORMAT: 1024x1024px (ZAWSZE KWADRAT), wysokiej jakości render fotorealistyczny
```

---

#### Minimum 10 mockupów dla każdej marki:

1. **Koszulka z logo** — biała lub czarna, logo na piersi
2. **Bluza z kapturem** — logo wyhaftowane
3. **Czapka z daszkiem** — logo na froncie
4. **Kubek ceramiczny** — logo + kolory marki
5. **Torba bawełniana** — duże logo na froncie
6. **Breloczek metalowy** — logo wygrawowane
7. **Notes firmowy** — okładka z brandingiem
8. **Zestaw naklejek** — różne warianty logo i ikony
9. **Ściereczka z mikrofibry** — logo w rogu
10. **Opakowanie produktu** — pudełko premium z pełnym brandingiem

---

#### Przykładowe prompty mockupów (PanoView — robot okienny):

**Kubek z logo:**
```
⚠️ INSTRUKCJA: Użyj DOKŁADNIE tego logo które jest załączone w tej rozmowie.
NIE projektuj nowego logo. NIE wymyślaj własnego designu.
Skopiuj istniejące logo 1:1 i umieść je na gadżecie zgodnie z poniższą specyfikacją.

GADŻET: Kubek ceramiczny matowy
ELEMENT BRANDINGU: Logo PanoView (ikona + wordmark) + tagline "Czysta panorama, bez wysiłku"
UMIEJSCOWIENIE: Logo na froncie kubka, tagline mniejszy pod spodem
TECHNIKA: Nadruk ceramiczny, wysokiej jakości

KOLORY:
- Kubek: Biały matowy (#F8F8F8)
- Logo: Crystal Cyan (#00D4E8) ikona, Deep Space (#0D1B2A) tekst
- Akcent: Safety Orange (#FF6D3A) na elemencie sensora w ikonie

KONTEKST DOPASOWANY DO PRODUKTU:
- Sceneria: Nowoczesna kuchnia z dużym oknem, za oknem panorama miasta
- Rekwizyty w tle: Poranne światło, roślina w doniczce, czyste okno (rozmyte)
- Osoba: Brak — sam kubek na blacie

PREZENTACJA:
- Ujęcie: Kubek na marmurowym blacie kuchennym, lekko z boku
- Oświetlenie: Naturalne poranne światło z okna
- Głębia ostrości: Kubek ostry, panorama za oknem rozmyta

STYL: Premium smart home lifestyle, jak Dyson lub Apple home
FORMAT: 1024x1024px (ZAWSZE KWADRAT), wysokiej jakości render fotorealistyczny
```

**Koszulka z logo:**
```
⚠️ INSTRUKCJA: Użyj DOKŁADNIE tego logo które jest załączone w tej rozmowie.
NIE projektuj nowego logo. NIE wymyślaj własnego designu.
Skopiuj istniejące logo 1:1 i umieść je na gadżecie zgodnie z poniższą specyfikacją.

GADŻET: Koszulka bawełniana premium
ELEMENT BRANDINGU: Logo PanoView (ikona + wordmark)
UMIEJSCOWIENIE: Na piersi po lewej stronie, rozmiar ok. 8cm
TECHNIKA: Haft wysokiej jakości

KOLORY:
- Koszulka: Granatowa (#0D1B2A)
- Logo: Crystal Cyan (#00D4E8) haftowany

KONTEKST DOPASOWANY DO PRODUKTU:
- Sceneria: Jasny, nowoczesny apartament z panoramicznymi oknami
- Rekwizyty w tle: Widok na miasto, minimalistyczne wnętrze (rozmyte)
- Osoba: Mężczyzna 35 lat, casualowy styl, stoi przy oknie z widokiem

PREZENTACJA:
- Ujęcie: Zbliżenie na tors z logo, twarz poza kadrem
- Oświetlenie: Naturalne światło z okna, ciepłe
- Głębia ostrości: Koszulka ostra, tło rozmyte

STYL: Premium lifestyle, smart home, nowoczesny dom
FORMAT: 1024x1024px (ZAWSZE KWADRAT), wysokiej jakości render fotorealistyczny
```

---

## Format SQL wyjsciowego

```sql
-- [NAZWA MARKI] Branding Data for workflow [WORKFLOW_ID]
-- Uruchom w Supabase SQL Editor

-- Wyczysc istniejace dane brandingowe
DELETE FROM workflow_branding
WHERE workflow_id = '[WORKFLOW_ID]'
  AND type IN ('brand_info', 'color', 'font', 'ai_prompt');

-- 1. BRAND INFO
INSERT INTO workflow_branding (workflow_id, type, title, value, sort_order) VALUES (
  '[WORKFLOW_ID]',
  'brand_info',
  '[NAZWA]',
  '{"name":"[NAZWA]","tagline":"[TAGLINE]","description":"[OPIS]"}',
  0
);

-- 2. KOLORY
INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('[WID]', 'color', '[NAME]', '[HEX]', '{"role":"primary"}',   0),
  ('[WID]', 'color', '[NAME]', '[HEX]', '{"role":"secondary"}', 1),
  ('[WID]', 'color', '[NAME]', '[HEX]', '{"role":"accent"}',    2),
  ('[WID]', 'color', '[NAME]', '[HEX]', '{"role":"neutral"}',   3),
  ('[WID]', 'color', '[NAME]', '[HEX]', '{"role":"neutral"}',   4),
  ('[WID]', 'color', '[NAME]', '[HEX]', '{"role":"neutral"}',   5);

-- 3. FONTY
INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('[WID]', 'font', '[FONT]', 'heading', '{"role":"heading","weights":["500","700"]}', 0),
  ('[WID]', 'font', '[FONT]', 'body',    '{"role":"body","weights":["400","500","600","700"]}', 1),
  ('[WID]', 'font', '[FONT]', 'accent',  '{"role":"accent","weights":["400","700"]}', 2);

-- 4. AI PROMPTS - LOGO
INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('[WID]', 'ai_prompt', 'Logo główne na ciemnym tle', '[PEŁNY PROMPT]', '{"category":"logo"}', 0),
  ('[WID]', 'ai_prompt', 'Logo na jasnym tle', '[PEŁNY PROMPT]', '{"category":"logo"}', 1),
  ('[WID]', 'ai_prompt', 'Logo monochromatyczne', '[PEŁNY PROMPT]', '{"category":"logo"}', 2),
  ('[WID]', 'ai_prompt', 'Favicon / ikona aplikacji', '[PEŁNY PROMPT]', '{"category":"logo"}', 3),
  ('[WID]', 'ai_prompt', 'Combo mark (ikona + wordmark)', '[PEŁNY PROMPT]', '{"category":"logo"}', 4),
  ('[WID]', 'ai_prompt', 'Animacja logo (storyboard)', '[PEŁNY PROMPT]', '{"category":"logo"}', 5);

-- 5. AI PROMPTS - MOCKUPY
INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('[WID]', 'ai_prompt', 'Opakowanie główne', '[PEŁNY PROMPT]', '{"category":"mockup"}', 10),
  ('[WID]', 'ai_prompt', 'Koszulka z logo', '[PEŁNY PROMPT]', '{"category":"mockup"}', 11),
  -- ... kolejne mockupy z sort_order 12, 13, 14...
```

---

## Przyklad uzycia

Uzytkownik: "Zrob branding dla workflow 01523ee9..."
Claude:
1. Czyta ten plik jako referencje
2. Pobiera dane z Supabase (workflow, raporty) — patrz sekcja ponizej
3. Szuka raportu typu `report_pdf` (glowna analiza) oraz `report_infographic` (PNG do podgladu)
4. Pobiera infografike PNG przez curl i odczytuje ja narzedziem Read (obraz zawiera kluczowe info)
5. Analizuje produkt na podstawie infografiki i nazw plikow raportow
6. Proponuje 3 nazwy marki z domenami i **CZEKA NA WYBOR UZYTKOWNIKA**
7. Po wyborze generuje pelny SQL z:
   - brand info
   - kolorami
   - fontami
   - **promptami AI (logo + mockupy) jako INSERT do bazy**
8. Daje uzytkownikowi SQL do wklejenia w Supabase SQL Editor

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
