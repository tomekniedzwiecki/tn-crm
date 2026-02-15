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

Zaproponuj 3 propozycje nazw z dostepnymi domenami .pl, np:
- NazwaA — nazwaA.pl
- NazwaB — nazwaB.pl
- NazwaC — nazwaC.pl

Zasady dla nazw:
- Krotka (1-2 slowa, max 12 znakow)
- Latwa do wymowienia po angielsku
- Sugeruje emocje/kategorie produktu
- Unikalna, nie koliduje z istniejacymi markami
- Styl: nowoczesne DTC brandy (np. VibeStrike, NeoFlux, GlowAura)

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

---

### PROMPTY MOCKUPÓW — Lifestyle > Martwe produkty

> **WAŻNE**: Mockupy to TYLKO fizyczne produkty z logo/brandingiem. NIE social media, NIE banery reklamowe, NIE UI/UX.

#### Filozofia mockupów: LIFESTYLE > MARTWE PRODUKTY

Mockupy powinny pokazywać produkty **w kontekście życia**, nie jako izolowane przedmioty na białym tle. Cel: klient ma poczuć emocję i wyobrazić sobie siebie z tym produktem.

| Typ mockupa | Kiedy używać | Proporcja |
|-------------|--------------|-----------|
| **Lifestyle z człowiekiem** | Odzież, akcesoria, produkty codziennego użytku | 60% mockupów |
| **Lifestyle bez człowieka** | Opakowania, dekoracje, produkty w scenie | 30% mockupów |
| **Produktowy (studio)** | Hero shot głównego produktu, detale | 10% mockupów |

---

#### KRYTYCZNE: Mockupy MUSZĄ pasować do produktu!

> **ZASTANÓW SIĘ** zanim wybierzesz mockupy. Nie generuj "uniwersalnego" zestawu. Każdy produkt wymaga **przemyślanych** mockupów, które pasują do:
> 1. **Kategorii produktu** — jakie akcesoria są logiczne dla tego typu produktu?
> 2. **Grupy docelowej** — kto będzie używał produktu? Jak wygląda? Co robi?
> 3. **Kontekstu użycia** — gdzie produkt jest używany? W jakich okolicznościach?

---

#### Tabela: Dobór mockupów per kategoria produktu

| Kategoria produktu | Pasujące mockupy | UNIKAJ |
|-------------------|------------------|--------|
| **Narzędzia (wiertarki, pistolet malarski, endoskop)** | Etui narzędziowe, torba monterska, kombinezon/bluza robocza, rękawice, skrzynka narzędziowa, produkt w użyciu na budowie | Kubki, koszulki lifestyle |
| **AGD kuchenne (ekspresy, roboty, blendery)** | Fartuch kuchenny, kubek/filiżanka, torba na zakupy, opakowanie kawy/herbaty, ściereczka, rękawice kuchenne, produkt w kuchni | Czapki z daszkiem |
| **Elektronika (kamery, głośniki, słuchawki)** | Etui na sprzęt, torba tech, naklejki, opakowanie premium, futerał, produkt w użyciu | Bidony sportowe |
| **Sport/Fitness (masażery, sprzęt treningowy)** | Torba sportowa, bidon, ręcznik, koszulka sportowa, bluza, opaska, mata | Kubki porcelanowe |
| **Beauty/Wellness (kosmetyki, masażery twarzy)** | Kosmetyczka, świece, ręcznik spa, opakowanie premium, torebka prezentowa | Bluzy robocze |
| **Produkty dla dzieci** | Plecak dziecięcy, pudełko na lunch, bidoczek, piżamka, piórnik | Filiżanki do kawy |

---

#### Ludzie w mockupach — DOPASUJ DO PRODUKTU

Opisując osobę w prompcie, **ZAWSZE** dopasuj ją do grupy docelowej produktu:

| Produkt | Typ osoby | Opis przykładowy |
|---------|-----------|------------------|
| **Wiertarka/narzędzia** | Profesjonalista 35-50 lat | "Mężczyzna 40 lat, krępa budowa, krótkie włosy, ubrany w roboczą bluzę, rękawice, pewna postawa, skupiony wzrok, na tle warsztatu" |
| **Ekspres do kawy** | Kobieta/mężczyzna 28-45 | "Kobieta 32 lata, elegancki casualowy strój, w nowoczesnej kuchni, poranek, trzyma filiżankę, rozluźniona poza, ciepły uśmiech" |
| **Sprzęt sportowy** | Aktywna osoba 25-40 | "Mężczyzna 30 lat, atletyczna budowa, sportowy strój, pot na czole, energiczna poza, na tle siłowni lub parku" |
| **Kosmetyki/beauty** | Kobieta 25-45 | "Kobieta 35 lat, zadbana cera, naturalna uroda, minimalistyczny makijaż, w łazience spa lub jasnej sypialni, relaks" |
| **Kamera inspekcyjna/endoskop** | Technik/mechanik 30-50 | "Mężczyzna 45 lat, robocze ubranie, okulary ochronne na czole, w garażu lub warsztacie, kuca przy maszynie, profesjonalna koncentracja" |
| **Odkurzacz domowy** | Rodzina/kobieta 30-50 | "Kobieta 38 lat, casual domowy strój, w jasnym salonie, w ruchu podczas sprzątania, praktyczna elegancja" |

---

#### Scenerie — DOPASUJ DO KONTEKSTU UŻYCIA

Sceneria powinna pokazywać **GDZIE** produkt jest naturalnie używany:

| Produkt | Sceneria | Detale do opisania |
|---------|----------|-------------------|
| **Narzędzia budowlane** | Warsztat, budowa, garaż, wnętrze w remoncie | "Betonowa podłoga, regały z narzędziami, pył w powietrzu podświetlony słońcem, niedokończona ściana, kable, rury" |
| **Ekspres/AGD kuchenne** | Nowoczesna kuchnia, kawiarnia, biuro | "Marmurowy blat, drewniane dodatki, rośliny w doniczkach, naturalne światło z okna, filiżanki, ziarna kawy" |
| **Elektronika domowa** | Salon, biuro domowe, studio | "Minimalistyczne wnętrze, duży monitor, rośliny, ciepłe oświetlenie, skandynawski styl" |
| **Sport/Fitness** | Siłownia, park, domowa strefa treningowa | "Mata do ćwiczeń, hantle, lustra, duże okna, poranny świt, zieleń za oknem" |
| **Beauty/Spa** | Łazienka, sypialnia, gabinet spa | "Białe ręczniki, świece, bambus, naturalne kosmetyki, miękkie światło, rośliny" |
| **Pistolet malarski/narzędzia malarskie** | Pracownia, warsztat malarski, garaż | "Zabezpieczona folia, puszki z farbą, karoseria samochodu, ściany do malowania" |

---

#### Struktura każdego promptu mockupowego:

```
1. TYP ZDJĘCIA: [Lifestyle z człowiekiem / Lifestyle bez człowieka / Produktowe]
2. PRODUKT MOCKUPOWY: [konkretny produkt z brandinngiem — DOPASOWANY do kategorii produktu]
3. ELEMENT BRANDINGU: [co jest na produkcie: logo, nazwa marki, kolory, ikona]
4. KOLORY MARKI: [konkretne HEX: primary, secondary, accent — gdzie użyte]

5. SCENERIA (szczegółowo):
   - Miejsce: [dokładnie gdzie — warsztat, kuchnia, siłownia, łazienka]
   - Pora dnia: [poranek, dzień, wieczór — wpływa na światło]
   - Rekwizyty: [3-5 konkretnych obiektów pasujących do sceny]
   - Atmosfera: [profesjonalizm, relaks, energia, przytulność]

6. CZŁOWIEK (jeśli jest):
   - Kto: [płeć, wiek, typ sylwetki]
   - Wygląd: [fryzura, kolor skóry, rysy twarzy]
   - Ubranie: [dokładny opis stroju pasującego do kontekstu]
   - Poza: [co robi, jak stoi/siedzi, wyraz twarzy]
   - Relacja z produktem: [trzyma, używa, patrzy na, prezentuje]

7. OŚWIETLENIE: [typ światła, kierunek, nastrój — naturalne/studio/dramatyczne]
8. KADR: [szeroki/średni/zbliżenie, kąt kamery, głębia ostrości]
9. STYL: [słowa klucze oddające emocję marki + konkretne referencje]
10. FORMAT: 1024x1024px (ZAWSZE KWADRAT), wysokiej jakości render
```

---

#### Minimum 10 mockupów — DOSTOSOWANE DO PRODUKTU:

**Zamiast generycznego zestawu (koszulka, kubek, czapka...), przemyśl:**

1. **Opakowanie główne** — unboxing experience pasujący do produktu
2. **Etui/torba** — dopasowane do produktu (narzędziowa, kosmetyczka, tech sleeve)
3. **Odzież funkcjonalna** — pasująca do kontekstu (kombinezon roboczy LUB fartuch LUB bluza sportowa)
4. **Akcesorium brandingowe** — mały gadżet pasujący do kategorii
5. **Produkt w użyciu #1** — osoba dopasowana do grupy docelowej używa produktu
6. **Produkt w użyciu #2** — inny kontekst użycia
7. **Flat lay / zestaw** — produkt + dopasowane akcesoria
8. **Opakowanie prezentowe** — gift box z brandingiem
9. **Naklejki/magnesy** — małe elementy brandingu
10. **Produkt specyficzny dla kategorii** — np. filiżanka dla kawy, rękawice dla narzędzi, kosmetyczka dla beauty

---

#### Przykład doboru mockupów dla różnych produktów:

**❌ ŹLE — Uniwersalny zestaw:**
Koszulka, kubek, czapka, torba, bluza, bidogn, płaszcz — dla każdego produktu tak samo

**✅ DOBRZE — Pistolet malarski:**
1. Profesjonalne etui narzędziowe z logo
2. Kombinezon ochronny z brandingiem
3. Rękawice robocze z logo
4. Pistolet w użyciu — malarz 40+ w warsztacie
5. Pistolet w użyciu — malowanie karoserii
6. Flat lay: pistolet + maski + farby + rękawice
7. Opakowanie premium z instrukcją
8. Naklejki ostrzegawcze z logo
9. Torba na sprzęt malarski
10. Skrzynka narzędziowa z brandingiem

**✅ DOBRZE — Ekspres do kawy:**
1. Eleganckie opakowanie z okienkiem
2. Fartuch kuchenny z haftem logo
3. Zestaw filiżanek z logo
4. Ekspres w użyciu — kobieta 30+ w kuchni
5. Barista przygotowuje kawę
6. Flat lay: ekspres + ziarna + filiżanki + ciastka
7. Torba na zakupy "coffee lover"
8. Mała kosmetyczka/saszetka na kawę
9. Świece zapachowe z brandingiem
10. Gift box z kawą i akcesoriami

**✅ DOBRZE — Masażer:**
1. Eleganckie etui wellness
2. Ręcznik spa z haftem
3. Torba sportowa z logo
4. Masażer w użyciu — kobieta 35+ po treningu
5. Masażer w użyciu — mężczyzna w domu
6. Flat lay: masażer + świece + olejki
7. Kosmetyczka podróżna
8. Bidon sportowy
9. Opakowanie prezentowe zen
10. Zestaw wellness z brandingiem

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
