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

### PROMPTY LOGO — Profesjonalne podejście

> **FILOZOFIA**: Logo musi opowiadać historię produktu. Każdy prompt musi przekazać designerowi/AI pełny kontekst: co robi produkt, dla kogo jest, jakie emocje wywołuje, i jak te elementy mogą być subtelnie zakodowane w formie graficznej.

#### Co MUSI zawierać każdy prompt logo:

1. **Pełny brief produktowy** (5-8 zdań — TO KRYTYCZNE!):
   - **Co to za produkt**: pełna nazwa, kategoria, typ urządzenia
   - **Jak działa**: mechanizm działania, technologia (np. "moc ssania 5600 Pa", "laser 360°", "silnik bezszczotkowy")
   - **Kluczowe funkcje**: 3-5 najważniejszych funkcji produktu
   - **Jaki problem rozwiązuje**: konkretny ból klienta który produkt eliminuje
   - **Dla kogo jest przeznaczony**: szczegółowa grupa docelowa (wiek, styl życia, sytuacja)
   - **Gdzie i kiedy jest używany**: kontekst użycia (dom, warsztat, biuro, na zewnątrz)
   - **USP / wyróżnik**: co odróżnia ten produkt od konkurencji

2. **Koncept wizualny** (szczegółowo):
   - Jaki element produktu/funkcji może być symbolem (np. dla robota okiennego: okno, panorama, robot, przyssawka)
   - Jak połączyć go z nazwą marki (np. litera + symbol)
   - Jakie skojarzenia wizualne wykorzystać (np. czystość, precyzja, bezpieczeństwo)
   - Co ma komunikować forma (precyzja, ruch, ciepło, technologia, bezpieczeństwo)
   - Jakie emocje ma wywoływać logo (spokój, energia, profesjonalizm, zaufanie)

3. **Specyfikacja techniczna**:
   - Kolory z konkretnymi HEX i ich zastosowanie
   - Styl typografii
   - Tło
   - Format i rozdzielczość

#### Przykłady konceptów logo per kategoria produktu:

| Produkt | Jak działa / Funkcje | Elementy wizualne | Koncept symbolu |
|---------|---------------------|-------------------|-----------------|
| **Kamera endoskopowa** | Elastyczny przewód z kamerą, oświetlenie LED, transmisja obrazu na telefon, inspekcja rur/silników | obiektyw, oko, promień światła, przewód, wąż | Oko/obiektyw zintegrowany z literą, promień skanujący, elastyczna linia |
| **Robot okienny** | Przyssawka 5600 Pa, automatyczne ścieżki, potrójne bezpieczeństwo, pilot + app | okno, panorama, robot, przyssawka, czyste szkło, widok z wysokości | Okno z linią horyzontu, mały okrągły robot w rogu, litera jako ramka okna |
| **Ekspres do kawy** | Ciśnienie 15-20 bar, młynek, spieniacz mleka, programy parzenia | filiżanka, para, ziarna, krople, crema | Filiżanka w negatywie litery, para jako dynamiczny element, ziarno kawy |
| **Pistolet malarski** | Natrysk HVLP, regulacja ciśnienia, dysza 1.4-2.5mm, malowanie karoserii/mebli | natrysk, krople, pędzel, ruch, mgiełka farby | Dynamiczny rozbryzg z typografii, stożek natrysku, gradient kolorów |
| **Masażer** | Wibracje 3200 RPM, głowice wymienne, 6 poziomów intensywności, regeneracja mięśni | fale, dłoń, ciepło, pulsowanie, mięśnie | Koncentryczne fale emanujące z formy, pulsujący punkt, relaksująca krzywa |
| **Odkurzacz robotyczny** | Nawigacja LiDAR, moc ssania 4000 Pa, mopowanie, stacja opróżniająca | wir, czystość, ruch, ssanie, dom, ścieżka | Spiralny element ruchu, minimalistyczny dom, okrągły robot |

#### Struktura każdego promptu logo:

```
PRODUKT — PEŁNY KONTEKST (TO KRYTYCZNE!):
Produkt: [pełna nazwa produktu, np. "Robot do automatycznego mycia okien"]
Kategoria: [np. Smart Home, AGD, Narzędzia, Beauty, Sport]
Jak działa: [mechanizm działania — np. "Przyssawka o mocy 5600 Pa utrzymuje robota na szybie,
  robot porusza się po zaprogramowanych ścieżkach czyszcząc okno ściereczką z mikrofibry"]
Kluczowe funkcje:
  - [funkcja 1, np. "Ekstremalnie mocne ssanie 5600 Pa — dwukrotnie więcej niż konkurencja"]
  - [funkcja 2, np. "Potrójny system bezpieczeństwa: linka + UPS + alarm"]
  - [funkcja 3, np. "Automatyczne wykrywanie krawędzi okna"]
  - [funkcja 4, np. "Pilot zdalnego sterowania + aplikacja mobilna"]
Problem który rozwiązuje: [np. "Mycie okien na wysokości jest niebezpieczne i czasochłonne —
  szczególnie dla seniorów i mieszkańców apartamentowców"]
Grupa docelowa: [szczegółowo — np. "Mieszkańcy apartamentowców 30-50 lat, właściciele domów
  z dużymi przeszkleniami, dzieci seniorów szukające bezpiecznego rozwiązania dla rodziców"]
Kontekst użycia: [gdzie i kiedy — np. "W domu, na oknach od wewnątrz i zewnątrz,
  szczególnie na wysokich piętrach i trudno dostępnych oknach"]
USP: [główny wyróżnik — np. "Najbezpieczniejszy robot okienny na rynku dzięki potrójnemu
  systemowi zabezpieczeń"]

MARKA:
Nazwa: [nazwa marki]
Tagline: [hasło marki]
Wartości: [3-4 wartości marki, np. bezpieczeństwo, innowacja, wygoda, jakość]
Ton komunikacji: [np. profesjonalny ale przyjazny, techniczny ale przystępny]

KONCEPT LOGO:
Zaprojektuj logo które łączy [element wizualny związany z produktem] z [element typograficzny].
Inspiracja z produktu: [co z produktu może być symbolem — np. "okno z panoramą, robot,
  przyssawka, czysta tafla szkła, widok z wysokości"]
Symbol powinien komunikować: [emocje/wartości: np. bezpieczeństwo, technologia, czystość, panoramiczny widok]
Konkretny pomysł: [np. "Litera P przekształcona w abstrakcyjne okno z linią horyzontu,
  mały okrągły element w rogu symbolizujący robota/sensor"]
Styl formy: [geometryczne/organiczne, minimalistyczne/szczegółowe, ostre/zaokrąglone]
Emocje do wywołania: [np. zaufanie, spokój, nowoczesność, premium]

SPECYFIKACJA:
- Kolor główny: [HEX] ([nazwa]) — użyty na [gdzie]
- Kolor dodatkowy: [HEX] ([nazwa]) — użyty na [gdzie]
- Kolor akcentu: [HEX] ([nazwa]) — subtelny akcent na [gdzie]
- Typografia: [styl podobny do nazwa fontu], [cechy: bold, geometric, humanist]
- Tło: [kolor HEX lub opis]
- Styl: [professional/minimal/technical/playful/premium] — jak [referencja do znanych marek w kategorii]

FORMAT: 1024x1024px (ZAWSZE KWADRAT), PNG z przezroczystym tłem gdzie to możliwe
```

#### 6 wariantów logo do wygenerowania:

1. **Logo główne na ciemnym tle** — pełna wersja z symbolem i wordmarkiem, wszystkie kolory
2. **Logo na jasnym tle** — dostosowane kontrasty, zwykle primary na tekst
3. **Logo monochromatyczne** — wersja biała i czarna, sam kształt bez kolorów
4. **Favicon/ikona** — sam symbol (bez tekstu), rozpoznawalny w 32x32px
5. **Combo mark poziomy** — ikona + wordmark w jednej linii, do nagłówków
6. **Animacja (storyboard)** — 4-6 klatek pokazujących jak logo się "buduje"

> **ZASADA UKŁADU LOGO:**
> Sygnet (ikona/symbol) zawsze po LEWEJ stronie, na równi z nazwą marki w tej samej linii.
> Układ: `[SYGNET] [NAZWA MARKI]` — nigdy odwrotnie, nigdy sygnet nad tekstem.
> Wyjątek: favicon/ikona (wariant 4) — sam sygnet bez tekstu.

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
