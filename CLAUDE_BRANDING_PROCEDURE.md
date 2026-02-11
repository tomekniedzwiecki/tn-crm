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

1. **DELETE** istniejacych danych brandingowych (brand_info, color, font) dla danego workflow
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

## Proces myslenia (jak generowac)

### Krok 1: Analiza produktu

Przeczytaj nazwe, opis produktu i raporty. Ustal:
- **Kategoria**: sport, tech, gaming, music, beauty, fashion, food, home, kids, health
- **Grupa docelowa**: wiek, plec, styl zycia
- **Emocje marki**: energia, spokoj, luksus, zabawa, profesjonalizm
- **Unikalna cecha produktu**: co go wyroznia

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

## Format SQL wyjsciowego

```sql
-- [NAZWA MARKI] Branding Data for workflow [WORKFLOW_ID]
-- Uruchom w Supabase SQL Editor
-- UWAGA: Najpierw uruchom migracje 20260201_branding_extended_types.sql

-- Wyczysc istniejace dane brandingowe
DELETE FROM workflow_branding
WHERE workflow_id = '[WORKFLOW_ID]'
  AND type IN ('brand_info', 'color', 'font');

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
  ('[WID]', 'font', '[FONT]', 'heading', '{"role":"heading","weights":["400","700"]}', 0),
  ('[WID]', 'font', '[FONT]', 'body',    '{"role":"body","weights":["400","500","600","700"]}', 1),
  ('[WID]', 'font', '[FONT]', 'accent',  '{"role":"accent","weights":["400","700"]}', 2);
```

## Krok 7: Prompty AI (logo + mockupy)

Prompty sa RECZNE — pisane przez Claude z pelna wiedza o marce. NIE dynamiczne, NIE szablonowe.
Kazdy prompt musi zawierac:
- Nazwe marki
- Konkretne kody HEX kolorow (primary, secondary, accent, neutral)
- Nazwy fontow
- Opis stylu/emocji marki specyficzny dla tego produktu
- Techniczne detale (format, rozdzielczosc, tlo)

### Prompty logo (min. 6):
1. Logo glowne na ciemnym tle
2. Logo na jasnym tle
3. Logo monochromatyczne (bialy + czarny)
4. Favicon / ikona aplikacji
5. Combo mark (ikona + wordmark)
6. Animacja logo (storyboard)

Kazdy prompt powinien opisywac UNIKALNY element identyfikacyjny marki (np. litera Q z elementem kinetycznym, unikalna forma literowa) — to daje spojnosc miedzy wariantami.

### Prompty mockupów produktowych (min. 10)

> **WAŻNE**: Mockupy to TYLKO fizyczne produkty z logo/brandingiem. NIE social media, NIE banery reklamowe, NIE UI/UX.

---

#### Filozofia mockupów: LIFESTYLE > MARTWE PRODUKTY

Mockupy powinny pokazywać produkty **w kontekście życia**, nie jako izolowane przedmioty na białym tle. Cel: klient ma poczuć emocję i wyobrazić sobie siebie z tym produktem.

| Typ mockupa | Kiedy używać | Proporcja |
|-------------|--------------|-----------|
| **Lifestyle z człowiekiem** | Odzież, akcesoria, produkty codziennego użytku | 60% mockupów |
| **Lifestyle bez człowieka** | Opakowania, dekoracje, produkty w scenie | 30% mockupów |
| **Produktowy (studio)** | Hero shot głównego produktu, detale | 10% mockupów |

---

#### Ludzie w mockupach

> **ZASADA**: Minimum 50% mockupów powinno zawierać człowieka używającego produktu w naturalnym kontekście.

##### Kogo pokazywać (dopasuj do grupy docelowej):

| Kategoria | Persona | Wiek | Styl |
|-----------|---------|------|------|
| **Health/wellness** | Kobieta dbająca o siebie | 25-40 | Naturalna, zrelaksowana, bez mocnego makijażu |
| **Sport/fitness** | Aktywna osoba | 20-35 | Energiczna, spocona po treningu, autentyczna |
| **Tech** | Profesjonalista/ka | 25-45 | Nowoczesny, minimalistyczny styl, pewny siebie |
| **Beauty** | Kobieta świadoma | 22-40 | Zadbana, elegancka, naturalne piękno |
| **Food** | Foodie/rodzina | 25-50 | Ciepły, przyjazny, autentyczne emocje |
| **Kids** | Rodzic + dziecko | 30-40 + 3-10 | Radość, zabawa, interakcja |
| **Fashion** | Stylowa osoba | 20-35 | Pewna siebie, street style lub elegancja |
| **Home** | Para/singiel w domu | 28-45 | Spokojny, domowy, hygge |

##### Pozy i zachowania (NATURALNOŚĆ!):

- **TAK**: używa produktu, patrzy na niego z uśmiechem, trzyma naturalnie, jest w ruchu
- **NIE**: sztywne pozowanie do kamery, wymuszone uśmiechy, nienaturalne ułożenie rąk
- **TAK**: częściowo widoczna twarz, profil, ręce w kadrze, produkt w użyciu
- **NIE**: modelkowe sesje, stock photo vibes, przesadzona perfekcja

---

#### Scenerie per kategoria (SPÓJNOŚĆ Z MARKĄ!)

Sceneria musi odzwierciedlać świat, w którym żyje klient docelowy.

| Kategoria | Sceneria główna | Rekwizyty | Światło |
|-----------|-----------------|-----------|---------|
| **Health/wellness** | Sypialnia, łazienka, joga studio, spa | Świece, rośliny, herbata, koce | Ciepłe, miękkie, poranne |
| **Sport/fitness** | Siłownia, park, bieżnia, studio | Mata, hantle, ręcznik, butelka | Energetyczne, naturalne |
| **Tech** | Biuro, kawiarnia, co-working, home office | Laptop, kawa, notes, słuchawki | Czyste, neutralne, dzienne |
| **Beauty** | Toaletka, łazienka, studio | Lusterko, pędzle, kwiaty | Miękkie, schlebiające |
| **Food** | Kuchnia, stół, piknik, kawiarnia | Składniki, naczynia, rośliny | Ciepłe, apetyczne |
| **Kids** | Pokój dziecięcy, plac zabaw, ogród | Zabawki, książki, koce | Jasne, radosne |
| **Fashion** | Ulica, kawiarnia, studio, wnętrze | Torebka, okulary, kawa | Naturalne, miejskie |
| **Home** | Salon, sypialnia, taras | Książki, rośliny, koce, świece | Ciepłe, przytulne |

---

#### Lista produktów do mockupów

| Produkt | Co umieścić | Sceneria | Człowiek? |
|---------|-------------|----------|-----------|
| **Opakowanie główne** | Pełne logo, tagline | Unboxing w domu, ręce otwierające | TAK - ręce |
| **Koszulka** | Ikona (lewa pierś) + tagline z tyłu | Osoba w ruchu/siedząca | TAK - pełna postać |
| **Bluza z kapturem** | Ikona na piersi, wordmark na rękawie | Cozy moment, kawa, sofa | TAK - lifestyle |
| **Czapka** | Tylko ikona (haftowana) | Outdoor, ulica, kawiarnia | TAK - na głowie |
| **Kubek ceramiczny** | Ikona + tagline | Poranek, biurko, dłonie trzymające | TAK - ręce + twarz |
| **Butelka na wodę** | Wordmark pionowo | Siłownia, biurko, torba | TAK - w użyciu |
| **Torba materiałowa** | Pełne logo centralnie | Zakupy, targ, spacer | TAK - na ramieniu |
| **Notes/planner** | Ikona tłoczona | Biurko, kawiarnia, pisanie | TAK - ręce piszące |
| **Etui na telefon** | Ikona lub pattern | W dłoni, na stole | TAK - naturalnie |
| **Świeca** | Ikona na etykiecie | Łazienka, sypialnia, relaks | Opcjonalnie |
| **Torba papierowa** | Pełne logo | Unboxing, ręce trzymające | TAK - ręce |
| **Naklejki (zestaw)** | Ikona, wordmark, tagline | Flat lay, laptop z naklejką | Opcjonalnie |

---

#### Co umieszczać na produktach

| Element | Kiedy używać | Przykład |
|---------|--------------|----------|
| **Pełne logo (combo)** | Opakowanie, torby, duże powierzchnie | Torba materiałowa centralnie |
| **Tylko ikona** | Małe produkty, haft, tłoczenie | Czapka, przypinka, etui |
| **Tylko wordmark** | Wąskie/długie przestrzenie | Smycz, butelka pionowo, rękaw |
| **Tagline** | Tył koszulki, drugi bok kubka | Subtelny, elegancki font |
| **Pattern** | Wykładziny opakowań, etui, skarpetki | Powtarzające się ikony/elementy |
| **Kolory marki bez logo** | Minimalistyczne akcenty | Wstążka, wnętrze pudełka |

---

#### Zasady doboru produktów per kategoria

1. **Zawsze (każda marka)**: opakowanie główne, koszulka, kubek, torba materiałowa
2. **Health/wellness**: + świeca, butelka, notes, etui
3. **Sport/fitness**: + worek, butelka, czapka, ręcznik
4. **Tech**: + powerbank, etui, naklejki, notes
5. **Fashion/beauty**: + torba papierowa, przypinka, parasol
6. **Food/beverage**: + kubek termiczny, fartuch, torba

---

#### Struktura każdego promptu mockupowego

Każdy prompt MUSI zawierać te elementy w tej kolejności:

```
1. TYP ZDJĘCIA: [Lifestyle z człowiekiem / Lifestyle bez człowieka / Produktowe]
2. PRODUKT: [nazwa produktu + co jest na nim umieszczone]
3. KOLORY MARKI: [konkretne HEX: primary, secondary, accent]
4. SCENERIA: [gdzie, jakie otoczenie, rekwizyty]
5. CZŁOWIEK (jeśli jest): [kto, wiek, co robi, jaka poza, co ma na sobie]
6. OŚWIETLENIE: [typ światła, kierunek, nastrój]
7. KADR: [szeroki/średni/zbliżenie, kąt, głębia ostrości]
8. STYL: [słowa klucze oddające emocję marki]
9. FORMAT: [rozdzielczość, orientacja]
```

Przykład:
```
1. TYP: Lifestyle z człowiekiem
2. PRODUKT: Kubek ceramiczny LunaTherma - ikona księżyca w Rose Blush (#E8A0BF), "Ciepło, które rozumie" w Soft Mauve (#9B8AA0)
3. KOLORY: Primary #E8A0BF, Secondary #5EAAA8, Accent #D4A574
4. SCENERIA: Przytulna sypialnia, poranne światło przez zasłony, kremowa pościel, eukaliptus na stoliku nocnym
5. CZŁOWIEK: Kobieta ~30 lat, naturalna, włosy spięte niedbale, w kremowej piżamie, siedzi w łóżku, trzyma kubek obiema dłońmi, oczy przymknięte z przyjemnością
6. OŚWIETLENIE: Miękkie poranne światło z lewej, ciepłe tony, brak ostrych cieni
7. KADR: Średni, lekko z góry, płytka głębia ostrości (twarz i kubek ostre, tło rozmyte)
8. STYL: hygge, self-care, feminine wellness, cozy morning ritual
9. FORMAT: 2400x1600px, landscape
```

### WAZNE: Prompty dodac jako komentarze SQL na koncu pliku migracji (do skopiowania)

## Przyklad uzycia

Uzytkownik: "Zrob branding dla workflow 01523ee9..."
Claude:
1. Czyta ten plik jako referencje
2. Pobiera dane z Supabase (workflow, raporty) — patrz sekcja ponizej
3. Szuka raportu typu `report_pdf` (glowna analiza) oraz `report_infographic` (PNG do podgladu)
4. Pobiera infografike PNG przez curl i odczytuje ja narzedziem Read (obraz zawiera kluczowe info)
5. Analizuje produkt na podstawie infografiki i nazw plikow raportow
6. Proponuje 3 nazwy marki z domenami i **CZEKA NA WYBOR UZYTKOWNIKA**
7. Po wyborze generuje pelny SQL z brand info, kolorami, fontami
8. Generuje recznie prompty logo + mockupy (specyficzne dla marki, nie szablonowe!)
9. Daje uzytkownikowi SQL do wklejenia w Supabase SQL Editor

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
