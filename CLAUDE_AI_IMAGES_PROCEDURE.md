# Procedura generowania obrazów AI dla landing pages

**Wersja:** 2026-04 (zgodna z manifesto z `CLAUDE_LANDING_DIRECTION.md` i patternami z `CLAUDE_LANDING_PATTERNS.md`)

---

## Filozofia (czytać przed każdym uruchomieniem)

Obrazy AI to **90% sukcesu landing page** — ludzie nie czytają nagłówków, dopóki zdjęcie ich nie zatrzyma. Generowanie obrazów to nie „uzupełnianie placeholderów", tylko budowanie **spójnego świata wizualnego marki**.

Trzy zasady fundamentalne:

1. **Obrazy realizują manifesto.** Nie generujesz „zdjęcia produktowego" — generujesz obraz, który pasuje do kierunku (Panoramic Calm, Editorial/Luxury, Playful, …). Manifesto z `landing-pages/[slug]/_brief.md` jest pierwszym źródłem prawdy.
2. **Spójność > różnorodność.** Wszystkie obrazy na jednej stronie wyglądają jakby zrobiła je ta sama ekipa fotograficzna tego samego dnia. Światło, paleta, styl kadrowania, atmosfera — identyczne.
3. **Kontekst realny > abstrakcyjne tło.** Produkt w sytuacji persony (konkretnej osoby z raportu strategicznego) zawsze pobija produkt na białym tle.

---

## Autonomia — nie pytaj o nic

Gdy użytkownik wywołuje procedurę, wykonaj **wszystkie kroki do końca** bez zatrzymywania się. Czytaj, generuj, edytuj, commituj, pushuj. Użytkownik oczekuje gotowego rezultatu, nie statusu.

---

## KROK 1 — Zgromadź kontekst

### 1.1 Manifesto (jeśli istnieje)

```bash
cat landing-pages/[slug]/_brief.md
```

**Z manifesta weź:**
- Kierunek estetyczny (decyduje o stylu fotografii — zob. sekcję „Mapping kierunek → fotostyle")
- Palete 60/30/10 (kolory sceny)
- Tempo (energetyczne vs spokojne → dynamiczna kompozycja vs statyczna)
- Od czego uciekamy (anty-referencje konkurencji — Twoje zdjęcia MUSZĄ się od nich różnić)

**Brak manifesta** = stop. Wróć do `CLAUDE_LANDING_DIRECTION.md` i napisz je pierwsze.

### 1.2 Znajdź PRAWDZIWĄ referencję produktu (nie brand mockup!)

**KLUCZOWA pułapka:** `workflow_branding` type=`mockup` zawiera **brandingowe mockupy** (logo na bluzie, logo na powerbanku, logo na kubku) — NIE zdjęcia realnego produktu. Użycie ich jako `reference_image` daje Gemini nonsens.

**Hierarchia szukania referencji:**

1. **`workflow_products.image_url`** — jeśli istnieje i pokazuje faktyczny produkt ✅
2. **Istniejące `ai-generated/[slug]/*.jpg` z poprzednich generacji** — jeśli landing miał już obrazy produktowe, weź jedno jako baseline ✅
3. **`workflow_branding` type=`infographic` lub `report_infographic`** — czasem zawiera packshot ⚠️
4. **Obraz z raportu strategicznego** (pierwsza strona raportu PDF często ma packshot) ⚠️
5. **Brand mockupy** (type=`mockup`) — ❌ **ostateczność, tylko do uzyskania logo/kolorystyki, NIE kształtu produktu**

**Jak rozpoznać prawdziwy product photo:**
- Pokazuje jeden produkt bez otaczających ubrań/gadżetów z logo
- Proporcje produktu zgodne z opisem w `brand_info.description`
- Brak logo marki w kadrze (lub logo jest na samym produkcie, subtelnie)

**Zweryfikuj przed użyciem:** pobierz kandydata (`curl -o` + `Read` tool) i upewnij się że widzisz **produkt** z briefu, nie „moodboard brandowy".

### 1.3 Dane produktu + branding (Supabase)

```bash
set -a && source /c/repos_tn/tn-crm/.env && set +a
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[UUID]&type=eq.brand_info&select=value" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"

# Kolory + fonty
curl -s ".../workflow_branding?workflow_id=eq.[UUID]&type=in.(color,font)&select=title,value" ...

# Product (cena, opis, referencja wizualna)
curl -s ".../workflow_products?workflow_id=eq.[UUID]&select=*" ...

# Mockupy (DODATKOWE referencje — pokazują produkt z różnych stron)
curl -s ".../workflow_branding?workflow_id=eq.[UUID]&type=eq.mockup&select=file_url" ...
```

### 1.4 Raport strategiczny (PDF)

Raport `workflow_reports` type=`report_pdf` zawiera:
- **Persony** (3 segmenty: imię, wiek, sytuacja, frustracje, marzenia)
- **Momenty użycia** (rano, weekend, rytuał)
- **Pain points** (konkretne sceny, które można fotografować)

**Bez osadzenia w personie** → generyczne obrazki konkurencji. Z personą → zdjęcia, które klient mówi „to jestem ja!".

### 1.5 Landing HTML — zmapuj wszystkie sloty

```bash
grep -nE "(hero-figure|tile-figure|act-figure|spec-figure|persona-figure|offer-figure|hero-placeholder|bento-image|step-image|offer-product|img-placeholder)" landing-pages/[slug]/index.html
```

Zrób tabelę: sekcja → selektor → docelowy aspect-ratio.

---

## KROK 2 — Zdefiniuj photo system (spójność)

Zanim wygenerujesz PIERWSZY obraz, zapisz w `landing-pages/[slug]/_brief.md (sekcja Photo System)`:

```markdown
# [MARKA] Photo System

## Lighting
[np. "Naturalne światło boczne z dużego okna, miękki poranek, lekko chłodne"]

## Paleta w scenach
- Tła: [kolory ścian, podłóg, tkanin]
- Akcenty: [kolor marki X użyty subtelnie — na kawie, na książce, na elemencie ubrania]
- Czego unikamy: [np. ciepłe pomarańcze, neonowe kolory]

## Kadrowanie
[np. "Low-angle, produkt w 1/3 dolnej, dużo pustej przestrzeni u góry"]

## Post-processing
[np. "Lekko wypłowiałe, film-like grain, desaturated cool tones"]

## Negatywy — NIGDY
- Neon glow effects
- Text / labels / watermarks
- Stock-photo body language (sztywne uśmiechy, zamknięte oczy, pointing at product)
- Cluttered backgrounds
- Golden hour warm gradients (chyba że manifesto mówi inaczej)
```

**Każdy prompt zawiera fragment tego systemu** → wszystkie obrazy wyglądają jak serial, nie kolekcja.

---

## KROK 3 — Mapping kierunek → fotostyle

| Kierunek z manifesta | Fotostyle | Oświetlenie | Nastrój | Kolory |
|---|---|---|---|---|
| **Panoramic Calm** (Vitrix, Dyson-vibe) | Architektoniczna fotografia wnętrz | Miękkie naturalne, rozproszone, „Nordic morning" | Spokój, cisza, porządek | Cool paper tones, navy deep shadows, rzadki akcent teal |
| **Editorial/Luxury** (Paromia) | Magazine editorial, Kinfolk/Cereal | Boczne miękkie, długie cienie | Refleksja, luksus, powolność | Papier ivory, ink navy, rzadki gold accent |
| **Playful/Toy** (Pupilnik) | Lifestyle, zabawowy, pogodny | Światło złociste, jasne | Radość, zabawa, ciepło | Nasycone pastele, przyjazne |
| **Brutalist/Raw** | High-contrast editorial | Hard shadows, direct flash | Intensywność, surowość | Monochrome, jedne wystrzały koloru |
| **Organic/Natural** (h2vital) | Fotografia produktowa z natury | Rozproszone, światło okna | Zdrowie, czystość, przejrzystość | Zielenie, beże, biele |
| **Retro-Futuristic** (Vibestrike) | Neon, cyberpunk product shots | Kolorowy rim light, dramatic | Energia, technologia, przyszłość | Neon cyan + magenta na czarnym |

**Jeśli kierunek jest hybrydowy/własny** → opisz fotostyle w Photo System (Krok 2).

---

## KROK 4 — Plan obrazów (matryca)

Dla każdego landing ≥12 obrazów, podzielone na kategorie:

### 4.1 Sloty obowiązkowe (wspólne dla wszystkich landingów)

| Slot | Aspect ratio | Typ zdjęcia | Persona w kadrze? |
|---|---|---|---|
| **Hero** | 4:5 (pionowy) lub 1:1 | Lifestyle: produkt w docelowym kontekście persony | Opcjonalnie (w tle, nie centralnie) |
| **Problem / Challenge** | 4:3 lub 16:10 | Lifestyle: frustracja persony, stary sposób, mimika | TAK — dominuje |
| **Atelier tile-hero** (bento featured) | 16:10 (horyzontal) | Product detail w akcji, close-up | NIE |
| **Atelier tiles** (×3-4) | 4:3 | Detale funkcji: close-up materiałów, przyczepu, ekranu | NIE |
| **How it works / Rytuał** (×3) | 4:3 | Instruktażowe: ręce + produkt w momentach kolejnych kroków | Tylko ręce / fragmenty ciała |
| **Spec Sheet** | 1:1 | Techniczny przekrój / izometryczny render / wire-frame | NIE |
| **Personas** (×3) | 4:5 (pionowy portret) | Portret persony w swoim środowisku (half-body) | TAK, centralna |
| **Offer packshot** | 4:3 lub 1:1 | Flat-lay zestawu startowego na czystym tle | NIE |
| **Final-CTA bg** | 21:9 / 16:9 (landscape) | Cinematic wide shot produktu w atmosferycznym tle (steam/smoke/particles + rim light) na ciemnym void — negative space top+sides dla text overlay. **Obowiązkowe** — bez tła sekcja wygląda płaska. Patrz `docs/landing/reference/patterns.md` pattern 23 | NIE |

### 4.2 Sloty opcjonalne

- Testimonials — **NIE generujemy twarzy** (etyka + realizm), używamy inicjałów
- Footer — logo wystarczy

**Suma:** minimum 12 slotów, idealnie 14-16.

### 4.3 Fotografie, których NIE generujemy

| Sytuacja | Dlaczego NIE | Co zamiast |
|---|---|---|
| Twarze w testimonialach | Etyka + wykrycie jako fake | Avatary z inicjałami (`<div class="voice-initials">AK</div>`) |
| „Przed/po" z CGI smudges | Wygląda jak stock 2015 | Użyj podwójnego obrazu lifestyle (dzień 1 vs dzień 14) |
| Produkt na białym tle bez kontekstu | Wygląda generycznie | Produkt w docelowym środowisku persony |
| Pojedyncza osoba celująca palcem w produkt | Stock-photo body language | Osoba używająca produktu naturalnie |
| Zbliżenia na wyświetlacze LCD / panele | Łatwe do halucynacji | Fizyczne detale materiałów (guma, metal, szkło) |

---

## KROK 5 — Prompt Architecture (v2026)

Gemini 3 Pro Image Preview (Nano Banana) najlepiej reaguje na **krótkie, pozytywne, wizualne** prompty. Struktura:

```
[PRODUKT — opis Z REFERENCJI, max 2 zdania]
[SCENA — kto, gdzie, co robi, jaka mikro-akcja]
[KOMPOZYCJA — ujęcie, kąt, plan]
[ŚWIATŁO + ATMOSFERA — z Photo System]
[STYL — z mapowania kierunek→fotostyle]
```

**Długość:** 4-7 zdań. Powyżej 150 słów model zaczyna ignorować późniejsze detale.

### 5.1 Złote zasady promptowania

1. **POZYTYWNIE, nie negacja.** Zamiast „no neon, no glow" → „natural daylight, soft shadows". Modele dyfuzyjne mają problem z "no".
2. **BEZ TEKSTU W KADRZE.** Każdy prompt kończy literalnie: `No text, no captions, no labels, no watermarks, no signage.` Inaczej model generuje „artystyczny tekst" który nigdy nie wygląda dobrze.
3. **REFERENCJA = PRAWDA.** Nigdy nie opisuj funkcji których nie widać na zdjęciu referencyjnym (przyciski, LED, port USB, spray). Model je wymyśli i produkt w kadrze nie będzie pasował do prawdziwego.
4. **OSOBY = PERSONA Z RAPORTU.** Nie „młoda kobieta" — konkretnie „woman in her mid-30s, natural makeup, slightly tired morning expression, Scandinavian knit cardigan".
5. **SYTUACJA > POZOWANIE.** „Anna stojąca obok produktu i uśmiechająca się" (stock) vs „Anna w kuchni, kawa w dłoni, spojrzenie przez okno na świeżo umyte szyby" (scena).
6. **ATMOSPHERIC STACKING.** Światło + pogoda + pora dnia + wnętrze = atmosfera. „Soft morning light streaming through east-facing window, light cloud cover softening shadows, 7am autumn feel, minimalist bedroom."

### 5.1.1 Shape constraint (drift kształtu produktu)

Pełen pattern z przykładami: [`CLAUDE_LANDING_PATTERNS.md` pattern 22](CLAUDE_LANDING_PATTERNS.md#22-shape-constraint-match-product-reference-exactly).

Krótko: **każdy prompt z `reference_images[{type:'product'}]` musi zaczynać się od:**
```
MATCH THE PRODUCT IN REFERENCE IMAGE EXACTLY — do not redesign or modify shape.
Product: [dokładny opis geometrii, materiałów, detali z referencji — tylko to co widać].
```

Bez tego Gemini 3 Pro Image Preview dryfuje w stronę „generic robot cleaner / headphones / steamer" — drift kształtu. Lekcja z Vitrix: pierwsza próba tile_hero dała owalny robot zamiast prostokątnego.

### 5.2 Stały suffix do KAŻDEGO promptu (realism injector — KRYTYCZNE)

**Problem, który to rozwiązuje:** domyślnie Gemini generuje „postcard-perfect" obrazy które wyglądają jak CGI/render/stock. Klient od razu widzi że to AI. Rozwiązanie: celowo wprowadzaj „real photography session" niedoskonałości.

**Stały suffix (kopiuj do każdego promptu):**
```
Shot on 35mm film (Kodak Portra 400 or Fujifilm Eterna), slightly grainy, mild halation,
imperfect hand-held framing with slight tilt, natural imperfections — faint dust on
surfaces, slightly smudged glass, lived-in feel with one or two out-of-place objects
(folded blanket, half-empty coffee mug, book face-down on sill). Candid documentary
photography session aesthetic, not studio product shot, not render, not CGI.
Slightly off-center composition, no perfect symmetry.
No text, no captions, no labels, no watermarks, no writing, no signage.
```

**Dlaczego film, nie cyfra:** „Digital photography" prompty dają perfekcyjne HDR-like obrazy. „35mm film" daje subtle grain, slight imperfections, charakter. Nawet jeśli to w rzeczywistości render — wygląda jak zdjęcie fotografa, nie archive.org.

### 5.2.1 Realism injectors (anty-AI look)

Dodawaj te zwroty w rozsądnej liczbie (2-3 per prompt, nie wszystkie) obok stałego suffixu:

| Injector | Co daje |
|---|---|
| „imperfect hand-held framing, slight camera tilt" | Wygląd jak fotograf trzymający aparat |
| „lived-in interior — wrinkled blanket, open book face-down, laptop partially closed" | Realistyczna persona, nie hotel lobby |
| „natural ambient light with one dim practical lamp on, not studio-lit" | Prawdziwe oświetlenie domowe |
| „35mm film grain visible, subtle color shifts, slight halation on highlights" | Charakter filmowy |
| „candid moment, subject unaware of camera, documentary feel" | Autentyczność, nie stock pose |
| „shallow but imperfect focus, edge softness, one element slightly out of plane" | Realna fotografia bezosmaru AI-sharp |
| „real [MIASTO] apartment photograph, not render, not CGI, not stock" | Bezwarunkowo odrzuca AI-look |
| „subtle lens flare from window, slight chromatic aberration" | Optyczne artefakty prawdziwego obiektywu |
| „visible fingerprints on glass, coffee ring on table, one curtain slightly crooked" | Konkretne niedoskonałości |

**KRYTYCZNE — nie dodawaj wszystkich naraz.** Wybierz 2-3 najpasujące do sceny. Za dużo → model się gubi i ignoruje.

### 5.3 Szablony promptów per slot (Panoramic Calm example dla Vitrix)

**HERO (4:5):**
```
Reference product (exact robot from image): a compact white robotic window cleaner with
circular top housing and black rubber edges, shown attached to a large floor-to-ceiling
window of an 18th-floor apartment. Warsaw skyline visible through crystal-clear glass.
Interior: minimalist Scandinavian living room, linen sofa, mid-century floor lamp,
a woman in her mid-30s (Anna persona from report: lawyer, capsule wardrobe) is visible
out-of-focus in background holding a coffee, looking at the clean glass.
Composition: low-angle looking up toward window, robot in center third, sky filling
top two-thirds. Soft morning light from the east, slight haze from city outside.
Panoramic Calm aesthetic — editorial interior photography, Kinfolk-meets-Dyson.
Shot on Fujifilm X-T5, 35mm f/2 equivalent, natural color grading, subtle film grain.
No text, no captions, no labels, no watermarks, no signage.
```

**CHALLENGE / PROBLEM (4:3):**
```
Lifestyle documentary photograph: the same Anna persona standing on a white IKEA ladder
reaching up to manually clean a panoramic window with a cloth and spray bottle,
visibly uncomfortable, tense shoulders, looking down at the height. Empty weekend
morning — she's in a comfortable old sweatshirt, hair tied back, no makeup.
Background: same Warsaw apartment, cloud-gray morning light, a cold coffee sits
forgotten on the sill. Streaks visible on the glass.
Documentary-style interior photography, natural pose, real frustration.
Shot on Fujifilm X-T5, 35mm f/2 equivalent, natural color grading, subtle film grain.
No text, no captions, no labels, no watermarks.
```

**ATELIER TILE-HERO (16:10):**
```
Macro product detail: the exact Vitrix robot from reference image, close-up at 45°
angle showing its white body with black rubber seal, two circular cleaning pads
pressed firmly against a misted glass pane. Micro water droplets on the outer glass,
Warsaw skyline softly blurred behind.
Lighting: cross-lit from window, hard highlight on top housing, deep shadow underneath.
Premium product photography, Dyson catalog aesthetic.
Shot on Fujifilm X-T5 with 60mm macro equivalent, natural color grading.
No text, no captions, no labels, no watermarks.
```

**ATELIER TILE (4:3) — feature „Safety"**
```
Close-up detail: a kevlar safety rope clipped to a carabiner on the back housing of
the exact Vitrix robot from reference. Shallow depth of field, rope fibers visible,
robot partially attached to glass in background. Morning side light.
Editorial product detail, tactile quality focus.
Shot on Fujifilm X-T5 with 60mm macro, natural color grading, subtle grain.
No text, no captions, no labels, no watermarks.
```

**RYTUAŁ STEP 1 — „Przyczep" (4:3):**
```
Instructional photograph: two hands (woman's hands, age 30s, no jewelry, clean nails)
placing the exact Vitrix robot from reference onto a large glass window. The moment
of contact, pad first touching glass. Gray morning light. Minimalist interior visible
in reflection.
Natural, educational, not posed. Half-body crop — only hands and forearms visible,
wearing linen rolled sleeves.
Shot on Fujifilm X-T5, 50mm equivalent, natural color grading, subtle grain.
No text, no captions, no labels, no watermarks.
```

**SPEC SHEET (1:1):**
```
Technical cross-section illustration of the exact Vitrix robot from reference, drawn
as a clean isometric wireframe on dark navy background (#0A1628). Thin white
engineering lines, showing internal components: suction chamber, edge sensors,
lithium-ion UPS battery, drive motor. Minimal Dyson-style technical diagram
with subtle teal (#00B4A6) accent lines highlighting key components.
Architectural, precise, editorial-technical aesthetic.
No text, no captions, no labels, no measurements, no watermarks, no signage.
```

**PERSONA PORTRAIT (4:5):**
```
Half-body environmental portrait: Anna, 36 years old, Polish lawyer. Wearing a
cream cashmere turtleneck, minimal silver earrings, natural makeup, tied-back
dark brown hair. Standing in her 18th-floor Warsaw apartment near the panoramic
window, morning light illuminating her face from the side. Slight genuine smile,
looking slightly off-camera. Warsaw skyline visible in background, out of focus.
Editorial environmental portrait, Kinfolk magazine aesthetic, not corporate.
Shot on Fujifilm X-T5, 56mm f/1.2 equivalent, shallow depth of field, natural color grading.
No text, no captions, no labels, no watermarks.
```

**OFFER PACKSHOT (4:3):**
```
Overhead flat-lay on a warm cream paper background: the exact Vitrix robot from
reference, next to a black plastic remote control, a folded white kevlar rope,
a neat stack of four white microfiber pads, a black USB-C power adapter, and a
single sheet instruction card (blank, no text visible). All items arranged with
precise geometric spacing, no overlapping. Slight shadow from soft top light.
Premium unboxing aesthetic, Muji meets Apple packaging, editorial product photography.
Shot on Fujifilm X-T5, 35mm equivalent, even natural light, subtle grain.
No text, no captions, no labels, no watermarks, no writing on the paper.
```

---

## KROK 6 — Wywołanie edge function

### 6.1 Endpoint

```
POST https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/generate-image
```

Wymaga: `Authorization: Bearer $SUPABASE_SERVICE_KEY` (lub anon key z JWT z panelu — ale CLI używa service).

### 6.2 ⚠️ PREREQUISITE: edge function musi wspierać `aspect_ratio`

Obecna implementacja `supabase/functions/generate-image/index.ts` MA hardcoded `aspectRatio: '1:1'` w `imageConfig`. **Zanim zaczniesz generowanie**:

1. Otwórz `supabase/functions/generate-image/index.ts`
2. Znajdź linię `aspectRatio: '1:1'`
3. Zmień na:
   ```typescript
   aspectRatio: aspect_ratio || '1:1'
   ```
4. Dodaj destrukturyzację `aspect_ratio` z body w sekcji `const { prompt, count, workflow_id, type, ... } = body`
5. Deploy: `npx supabase functions deploy generate-image --no-verify-jwt`
6. **Zgodnie z pamięcią projektu**: `npm run test:webhooks` **OBOWIĄZKOWO** po deployu.

**Gemini 3 Pro Image Preview wspiera aspect ratios:**
`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

Inne wartości → model odrzuca lub zwraca 1:1.

### 6.3 Payload (format v2)

```json
{
  "prompt": "[pełny prompt z Kroku 5]",
  "count": 1,
  "workflow_id": "[UUID workflow lub slug]",
  "type": "hero|tile_hero|tile|ritual_step|spec|persona|offer",
  "aspect_ratio": "4:5",
  "reference_images": [
    { "url": "[URL zdjęcia produktu z workflow_products.image_url lub mockup]", "type": "product" }
  ]
}
```

### 6.3 Bash generator — KRYTYCZNE: użyj plików JSON, nie inline

**Lekcja z Vitrix:** inline JSON z heredoc + `jq -n` ŁAMIE SIĘ przy długich promptach z polskimi znakami / cudzysłowami. Wszystkie pierwsze 3 generacje zwróciły `{"error":"Unexpected end of JSON input"}`.

**POPRAWNY wzorzec — payload w pliku:**

```bash
# 1. Zapisz payload do pliku (Write tool, format JSON)
# -> c:/tmp/payload_hero.json zawiera {"prompt":"...","count":1,"workflow_id":"...","type":"hero","aspect_ratio":"4:5","reference_images":[...]}

# 2. Wywołaj curl z --data-binary @file
set -a && source /c/repos_tn/tn-crm/.env && set +a
curl -sS -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/generate-image" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @/c/tmp/payload_hero.json
```

### 6.3.1 Batch parallel fire (13-14 obrazów naraz)

**Lekcja z Vitrix:** ~14 obrazów przez Gemini to ~90s sekwencyjnie albo ~30s równolegle. Batch parallel w bash:

```bash
set -a && source /c/repos_tn/tn-crm/.env && set +a

# Zapisz wszystkie payloady jako c:/tmp/payload_[name].json (Write tool)
# Lista slotów:
SLOTS="hero challenge offer tile_hero tile_safety tile_nav tile_control ritual_1 ritual_2 ritual_3 persona_anna persona_marek persona_kasia spec"

# Fire all in parallel with &, then wait
for p in $SLOTS; do
  curl -sS -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/generate-image" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @/c/tmp/payload_${p}.json > /c/tmp/gen_${p}.json 2>&1 &
done
wait

# Extract URLs + report
for p in $SLOTS; do
  URL=$(grep -oE 'https://[^"]+\.jpg' /c/tmp/gen_${p}.json | head -1)
  if [ -n "$URL" ]; then echo "$p: OK $URL"; else echo "$p: FAIL $(cat /c/tmp/gen_${p}.json | head -c 200)"; fi
done
```

### 6.3.2 Legacy pattern (pojedynczy curl, jeden slot)

```bash
set -a && source /c/repos_tn/tn-crm/.env && set +a
curl -sS -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/generate-image" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @/c/tmp/payload_hero.json
# Zwraca: {"images":[{"url":"https://.../ai-generated/[slug]/[timestamp]_0.jpg"}]}
```

### 6.3.3 Pobieranie wygenerowanego obrazu do sprawdzenia

```bash
# Wzór Node.js (nie bash — Windows bash ma problemy z piped curl + binary)
node -e "
const https=require('https');const fs=require('fs');
const url='[URL_Z_RESPONSE]';
const f=fs.createWriteStream('C:/tmp/check_img.jpg');
https.get(url,r=>{r.pipe(f);f.on('finish',()=>console.log('downloaded'))});"

# Potem Read tool:
# Read c:/tmp/check_img.jpg
```

Zwraca:
```json
{ "images": [ { "url": "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/ai-generated/vitrix/..." } ] }
```

### 6.4 Batch vs sequential generation (decyzja strategiczna)

**Sequential (wolniej, wyższa jakość):**
Generuj 1 obraz → pobierz i sprawdź Read tool → decyzja: akceptuj lub regeneruj z poprawionym promptem → dopiero wtedy następny slot.

Kiedy: gdy zaczynasz nowy kierunek (pierwszy landing w tej estetyce), gdy persony są skomplikowane, gdy zdjęcia z referencji są niejednoznaczne.

**Batch parallel (szybciej, ryzykowniej):**
Uruchom równolegle 5-8 curl-i w tle (`run_in_background: true`), poczekaj na wszystkie, potem zbiorczo obejrzyj Read tool wszystkie rezultaty, regeneruj złe.

Kiedy: gdy masz pewny photo system (drugi+ landing w tej estetyce), gdy prompty są dobrze przetestowane.

**Rekomendacja:** pierwsze 2 obrazy (hero + tile-hero) zrób sequentially — kalibrują photo system. Pozostałe 10 w batch.

### 6.5 Quality gate — sprawdź obraz przed użyciem

**KAŻDY wygenerowany obraz:**
1. Pobierz i obejrzyj (Read tool w Claude Code — Gemini zwraca URL, Read tool renderuje obraz)
2. Sprawdź listę: (a) produkt zgodny z referencją, (b) brak tekstu/watermarków, (c) persona pasuje do briefu, (d) światło/paleta z Photo System, (e) aspect ratio właściwe
3. **Limit regeneracji: 3 próby per slot.** Jeśli po 3 próbach nie ma dobrego wyniku:
   - Uprość prompt (usuń połowę szczegółów)
   - Zmień aspect ratio na bezpieczniejsze (1:1)
   - Rozważ czy nie używać placeholder-brief zamiast generowania (klient dostarczy zdjęcie)

Typowe problemy i fixy:
| Problem | Fix w prompt |
|---|---|
| Produkt inny niż referencja (dodane panele, inne kolory) | Dodaj `"identical to reference image, do not modify the product"` |
| Tekst pojawia się w kadrze | Dodaj na końcu literalnie `no text, no captions, no labels, no watermarks, no writing, no signage` |
| Osoba wygląda jak stock („happy point at product") | Dodaj `"natural candid posture, looking away from camera, genuine emotion"` |
| Złe światło (zbyt ciepłe / zbyt teatralne) | Dodaj konkretne: `"soft morning light from east window, overcast sky outside"` |
| Halucynacja — przyciski/LED których nie ma | Usuń z promptu wszystko co nie jest widoczne na referencji |

---

## KROK 7 — Integracja obrazów z HTML

### 7.1 NIE używaj inline styles

Wszystkie style obrazów w CSS (zgodnie z `CLAUDE_LANDING_PATTERNS.md` pattern 16). Landing page po naszej stronie już ma właściwe klasy dla editorial layoutu — nie trzeba ich dodawać.

### 7.2 Mapping sloty → klasy CSS (editorial layouty Panoramic Calm / Editorial)

| Slot | Kontener HTML | Tag | Klasa CSS odpowiedzialna za aspect-ratio |
|---|---|---|---|
| Hero | `.hero-figure` | `<img>` bezpośrednio | `.hero-figure` (aspect-ratio: 4/5) |
| Problem/Challenge | `.challenge-pullquote` lub `.challenge-figure` | `<img>` | `.challenge-figure` (aspect-ratio: 4/3) |
| Atelier tile-hero | `.tile.tile-hero .tile-figure` | `<img>` | `.tile.tile-hero .tile-figure` (aspect-ratio: auto/height:100%) |
| Atelier tile | `.tile .tile-figure` | `<img>` | `.tile-figure` (aspect-ratio: 4/3) |
| Rytuał step | `.act-figure` | `<img>` | `.act-figure` (aspect-ratio: 4/3) |
| Spec Sheet | `.spec-figure` | `<img>` lub render SVG | `.spec-figure` (min-height + 1/1 mobile) |
| Persona portrait | `.persona-figure` | `<img>` | `.persona-figure` (aspect-ratio: 4/5) |
| Offer packshot | `.offer-figure` | `<img>` | `.offer-figure` (aspect-ratio: 4/3) |

### 7.3 Klasyczne layouty (starszych landingów — dla Editorial/Luxury wzorca)

| Slot | Kontener | Aspect ratio |
|---|---|---|
| Hero | `.hero-product` | 3:4 |
| Problem | `.problem-visual` | 4:3 |
| Bento | `.bento-image` | 16:9 |
| Steps | `.step-image` | 4:3 |
| Offer | `.offer-product` | 1:1 |

### 7.4 HTML — zamiana brief placeholder na img

**Editorial layout z brief placeholder (nowszy wzorzec — Paromia/Vitrix):**

Przed:
```html
<div class="persona-figure">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;text-align:center;...">
    <div style="font-family:var(--font-editorial);font-style:italic;font-size:48px;...">Anna</div>
    <div style="...">Portret persony — 800 × 1000 px</div>
    <div style="max-width:220px;...">36 l. · Warszawa · apartament 18. piętro · capsule wardrobe</div>
    <div style="font-size:9px;...">Brief: kadr od ramion w górę, naturalne światło okna, spokój</div>
  </div>
</div>
```

Po (CAŁY div z briefem zastępujesz jednym `<img>`):
```html
<div class="persona-figure">
  <img src="[URL]" alt="Anna — prawniczka 36 l., Warszawa" width="800" height="1000" loading="lazy">
</div>
```

**Edit tool instrukcja:** użyj `Edit` z `old_string` obejmującym cały `<div style="position:absolute;...">...</div>` (razem z zamykającym `</div>`) i `new_string` = pojedynczy `<img>`. Zewnętrzny `<div class="persona-figure">` zostaje — ma aspect-ratio w CSS.

**Placeholder typu img-placeholder (starszy wzorzec):**

Przed:
```html
<div class="hero-product">
  <div class="img-placeholder">
    <div class="ph-icon">...</div>
    <span class="ph-label">Hero Image</span>
  </div>
</div>
```

Po:
```html
<div class="hero-product">
  <img src="[URL]" alt="[Nazwa produktu] - opis kontekstu">
</div>
```

### 7.5 Sanity check — upewnij się że img nie ma inline height

```bash
grep -nE '<img[^>]*style=' landing-pages/[slug]/index.html
```

Wynik MUSI być pusty. Inline `style="height:..."` lub `style="width:..."` zawsze powoduje cropping.

### 7.6 ⚠️ Pułapka: HTML `width`/`height` attr nadpisuje CSS `aspect-ratio` na `<img>`

**Bug znaleziony 2026-04-22 (Parivo):** jeśli wstawisz `<img src="..." width="1024" height="1536">` i zastosujesz CSS `.figure img { width: 100%; aspect-ratio: 4/5 }`, przeglądarka **NIE** obliczy wysokości z aspect-ratio — użyje wysokości z HTML attr jako intrinsic, dając `height: 1536px` na renderze. Rezultat: obraz jest gigantyczny / bardzo wysoki.

**Zawsze używaj wzorca wrapper + img 100%/100%:**

```html
<figure class="persona-figure">
  <img src="..." alt="..." width="768" height="768" loading="lazy">
</figure>
```

```css
.persona-figure {
  width: 100%;
  aspect-ratio: 1/1;       /* aspect-ratio NA WRAPPERZE, nie na img */
  overflow: hidden;
  border-radius: var(--radius-xl);
}
.persona-figure img {
  width: 100%;
  height: 100%;            /* wypełnia wrapper */
  object-fit: cover;
  display: block;
}
```

**Anty-wzorzec (Parivo pre-fix):**
```css
/* ❌ NIE rób tak — HTML height attr nadpisze aspect-ratio */
.persona-figure img {
  width: 100%;
  aspect-ratio: 1/1;
}
```

**Sanity check:**
```bash
# Przed commitem: sprawdź że wszystkie img w figure'ach mają container z aspect-ratio (nie img)
grep -nE "figure[^{]+\{[^}]*aspect-ratio" landing-pages/[slug]/index.html
```

Alternatywa: pominąć HTML `width`/`height` attrs — aspect-ratio wtedy zadziała bezpośrednio na img. Ale tracisz CLS protection (Cumulative Layout Shift) przy ładowaniu. **Zalecany jest pattern wrapper + 100%/100%.**

### 7.7 GPT-image-2 aspect ratios — mapping do CSS

`generate-image` edge function przyjmuje `aspect_ratio` w 10 wartościach (1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9), ale OpenAI GPT-image-2 **wspiera tylko 3 rozmiary**:
- `1:1` → `1024x1024` (wszystkie 1:1 requesty)
- Wszystkie **portrait** (2:3, 3:4, 4:5, 9:16) → `1024x1536` (co jest **2:3** ≈ 0.667)
- Wszystkie **landscape** (3:2, 4:3, 5:4, 16:9, 21:9) → `1536x1024` (co jest **3:2** ≈ 1.5)

**Implikacja:** jeśli poprosisz o aspect 4:5 ale CSS ma `aspect-ratio: 4/5`, dostaniesz obraz 2:3 wpakowany w container 4:5 → object-fit:cover skropi góra/dół.

**Zasada:** dopasuj CSS `aspect-ratio` do **rzeczywistego** output GPT-image-2:
- Portrait slots (hero, personas): użyj `aspect-ratio: 2/3` albo `3/4` (mniej narrow)
- Landscape slots (problem, steps, solution): użyj `aspect-ratio: 3/2`
- Square slots (avatars, offer packshot): użyj `aspect-ratio: 1/1`

Gemini 3 Pro Image Preview daje dokładnie requested ratio, więc nie ma tego problemu. Przełącznik provider w `settings` (tab „Generowanie obrazów AI") — GPT-image-2 ma wyższą jakość, Gemini daje szerszy wybór ratio.

---

## KROK 8 — Czyszczenie starych obrazów

Gdy regenerujesz całą galerię (np. na życzenie „zróbmy od nowa grafiki"):

### 8.1 Zidentyfikuj URL-e aktualnie używanych obrazów

```bash
grep -oE "storage/v1/object/public/attachments/ai-generated/[a-z0-9-]+/[0-9_]+\.(jpg|png)" landing-pages/[slug]/index.html | sort -u
```

### 8.2 Usuń obce files ze storage (opcjonalnie — dla porządku)

```bash
# List existing
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/list/attachments" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prefix":"ai-generated/[slug]/","limit":100}'

# Delete (trzeba per file)
curl -X DELETE "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/attachments/ai-generated/[slug]/[filename]" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
```

**Uwaga:** cleanup nie jest bezwzględnie wymagany — storage nie jest drogie i stare pliki nie są linkowane. Ale porządek pomaga przy debuggowaniu.

### 8.3 Podmień URL-e w HTML

Jeden Edit per slot lub jeden replace_all jeśli wszystkie tego samego typu.

---

### 8.4 Metoda alternatywna — OVERWRITE istniejących URL-i

Zamiast generować nowe pliki, można **użyć TYCH SAMYCH URL-i** dla nowych obrazów:

Procedura storage Supabase pozwala na upload do istniejącego klucza z flagą `upsert: true` — nadpisze plik zachowując URL. Wtedy HTML nie wymaga zmian, a nowy obraz zastąpi stary.

**Kiedy przydatne:** gdy stary landing jest już w cache Vercel/CDN — nowy URL wymaga re-deploya, OVERWRITE często nie (cache się invaliduje).

**Kiedy unikać:** gdy chcesz zachować stare obrazy dla A/B albo rollbacku.

Aktualnie edge function NIE robi upsert (tworzy nowe pliki z timestampem). Jeśli chcesz OVERWRITE mode, musisz dodać to jako opcjonalny parameter w edge function. Domyślnie korzystaj z nowych URL-i (bezpieczniej).

---

## KROK 9 — Weryfikacja wizualna (Playwright ETAP 4 ponownie)

Po podmianie obrazów **ZAWSZE** uruchom Playwright, nawet jeśli landing został już wcześniej zweryfikowany.

```bash
# _shoot.mjs istnieje lub trzeba go zapisać (patrz CLAUDE_LANDING_VERIFY.md)
node _shoot.mjs
```

Sprawdź:
- Czy każdy obraz wypełnia swój box (brak paper-3 prześwitującego)
- Czy object-fit:cover nie cropuje ważnych elementów (twarz persony obcięta do pasa?)
- Czy obrazy razem wyglądają jak serial (spójność światła + tonu)

---

## KROK 10 — Commit + deploy

```bash
git add landing-pages/[slug]/index.html
git commit -m "[slug]: Wygeneruj obrazy AI (manifesto [KIERUNEK])"
git push
```

Podaj link: `https://tn-crm.vercel.app/landing-pages/[slug]/`

---

## Checklist gotowości

- [ ] Manifesto jest w `landing-pages/[slug]/_brief.md`
- [ ] Photo System zapisany w `landing-pages/[slug]/_brief.md (sekcja Photo System)`
- [ ] Mapowanie kierunek → fotostyle wybrane
- [ ] Wszystkie sloty obrazów zidentyfikowane (min. 12)
- [ ] Referencja produktu dostępna (workflow_products.image_url lub mockup)
- [ ] Persony wyjęte z raportu PDF (imię, wiek, sytuacja, garderoba, postawa)
- [ ] Edge function wspiera `aspect_ratio` w body (jeśli nie, zaktualizuj)
- [ ] Każdy prompt ma suffix kamera + „no text…"
- [ ] Każdy obraz ręcznie sprawdzony (Read tool) przed użyciem
- [ ] Photo system konsystentny we wszystkich obrazach
- [ ] HTML podmieniony bez inline styles
- [ ] Playwright verify przechodzi
- [ ] Commit + push + link dla użytkownika

---

## Typowe błędy — DOŚWIADCZENIE

1. **Ignorowanie manifesta** → landing w kierunku „Panoramic Calm" dostaje zdjęcia w stylu „Playful" → rozjazd estetyczny, wygląda nieprofesjonalnie
2. **Brak Photo System** → każdy obraz ma inne światło → landing wygląda jak patchwork stocków
3. **Abstrakcyjne tła** → „produkt na białym tle" działa tylko dla offer packshot. Wszystko inne potrzebuje wnętrza persony.
4. **Halucynacje funkcji** → model dodaje LED/przyciski których nie ma → klient dostaje zdjęcia produktu którego NIE kupił
5. **Pomijanie weryfikacji** → generujesz 10 obrazów, używasz ich, potem okazuje się że połowa ma wodotryski których nie zauważyłeś
6. **Generyczne osoby** → „młoda kobieta" vs konkretne „Anna, 36, prawniczka z Warszawy, cream cashmere, tied-back hair"
7. **Tekst na obrazach** → zawsze wraca mimo próśb. Dodaj CONFIG do promptu: `no writing of any kind, no letters, no numbers visible in the frame`
8. **Inline styles na img** → obraz się ucina na mobile
9. **Portrety persony w 16:9** → twarze do pasa, wygląda źle. Zawsze 4:5 lub 3:4.
10. **Testimonial twarze** → etyka + ryzyko detekcji jako fake. Zawsze inicjały.

---

## Relacja do pozostałych procedur

| Procedura | Zrobić wcześniej | Zrobić po |
|---|---|---|
| `CLAUDE_LANDING_PROCEDURE.md` (ETAP 1) | — | Pierwszy szkielet HTML z placeholderami |
| `CLAUDE_LANDING_REVIEW.md` (ETAP 2) | HTML gotowy | Copy zweryfikowany |
| `CLAUDE_LANDING_DIRECTION.md` (ETAP 2.5) | Copy OK | **Manifesto — wymagane przed generowaniem obrazów** |
| `CLAUDE_LANDING_DESIGN.md` (ETAP 3) | Manifesto | CSS finalny |
| **ta procedura** (generowanie obrazów) | Manifesto + CSS | Obrazy podmienione |
| `CLAUDE_LANDING_VERIFY.md` (ETAP 4) | Obrazy w HTML | Commit + deploy |
