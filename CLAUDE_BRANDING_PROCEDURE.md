# Procedura: Generowanie Brandingu dla Workflow

## Kiedy wywolac

Uzytkownik mowi np.: "Zrob branding dla workflow X", "Wygeneruj branding", "Wypelnij branding".

## Wymagane dane wejsciowe

1. **workflow_id** — UUID workflow
2. **Produkt** — nazwa i opis z `workflow_products` (powiazany przez `selected_product_id`)
3. **Raporty** — opcjonalnie przeczytac raporty z `workflow_reports` (jesli sa PDF/prezentacje z analiza)

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

### Krok 2: Nazwa marki

Stworz 3 propozycje nazw i wybierz najlepsza (lub zapytaj uzytkownika). Zasady:
- Krotka (1-2 slowa, max 12 znakow)
- Latwa do wymowienia po angielsku
- Sugeruje emocje/kategorie produktu
- Unikalna, nie koliduje z istniejacymi markami
- Styl: nowoczesne DTC brandy (np. VibeStrike, NeoFlux, GlowAura)

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

### Prompty mockupow (min. 8):
1. Koszulka z logo
2. Czapka z logo
3. Kubek/termos z logo
4. Opakowanie produktu
5. Rekawice bokserskie z logo (specyficzne dla tego produktu)
6. Social media avatar
7. Social media banner
8. Naklejki / stickery

Kazdy prompt powinien byc napisany jak brief dla profesjonalnego grafika — z opisem sceny, oswietlenia, nastroju, materialow.

### WAZNE: Prompty dodac jako komentarze SQL na koncu pliku migracji (do skopiowania)

## Przyklad uzycia

Uzytkownik: "Zrob branding dla workflow 01523ee9..."
Claude:
1. Czyta ten plik jako referencje
2. Pobiera dane workflow i produktu (REST API lub pyta uzytkownika)
3. Analizuje produkt, czyta raporty jesli sa
4. Generuje nazwe marki (moze zaproponowac kilka do wyboru)
5. Generuje pelny SQL z brand info, kolorami, fontami
6. Generuje recznie prompty logo + mockupy (specyficzne dla marki, nie szablonowe!)
7. Daje uzytkownikowi SQL do wklejenia w Supabase SQL Editor
