# PRZEWODNIK GRAFICZNY — SKROLIK

## ŚWIAT I ŚWIATŁO

- **Otoczenie:** jasny, dzienny dom w trybie relaksu — kanapa przy oknie, jasna kuchnia, fotel lub parapet, balkon.
- **Paleta strony:** tło `#F8F1F0`, karty `#FFFDFC`, tekst `#2B2025`, akcent `#B4265C`.
- **Produkt:** wyłącznie pastelowy matowy róż. Bez wariantów czarnych i kremowych.
- **Światło:** miękkie naturalne; naprzemiennie chłodniejsze światło poranne i cieplejsze popołudniowe. Bez mroku i agresywnego kontrastu.
- **Casting:** dorośli 20–40 lat, zwykłe jasne ubrania domowe. Priorytetem są dłonie i sylwetki. Bez twarzy w zbliżeniu.
- **Ekrany:** neutralne, rozmyte, bez rozpoznawalnych aplikacji, logotypów, ikon i czytelnego tekstu.
- **Sygnatura:** subtelne, cienkie koncentryczne łuki w kolorze głębokiej maliny, wychodzące od pierścienia. Maksymalnie 2–3 łuki, niska kryjącość.
- **Materiał zdjęć:** naturalna fotografia lifestyle, miękka głębia ostrości, bez estetyki stockowego studia.
- **Typografia layoutu:** Gabarito dla nagłówków, Mulish dla tekstu. Nie generować typografii wewnątrz zdjęć.
- **Kadrowanie:** zachować bezpieczne marginesy pod responsywny crop. Produkt nie może stykać się z krawędzią.

## MAPA OSI RÓŻNORODNOŚCI

| Scena | Kontekst | Skala | Światło | Człowiek |
|---|---|---|---|---|
| `sc-hero` | kanapa przy oknie | makro dłoni i produktu | chłodniejsze jasne dzienne | dłoń, bez twarzy |
| `sc-kanapa` | kanapa i stolik/oparcie | szerszy kadr wnętrza | cieplejsze popołudniowe | sylwetka od ramion w dół |
| `sc-kuchnia` | jasna kuchnia | plan średni | chłodniejsze jasne dzienne | tors i obie dłonie |
| `sc-ebook` | fotel lub parapet przy oknie | makro dłoni z kontekstem | cieplejsze popołudniowe | dłoń i fragment sylwetki |
| `sc-selfie` | okno lub balkon | szerszy kadr | chłodniejsze jasne dzienne | oddalona sylwetka bez widocznej twarzy |

**Kontrola anty-szew:**

- `sc-hero → sc-kanapa`: wspólny świat kanapy, ale makro kontra szeroki plan.
- `sc-kanapa → sc-kuchnia`: inny kontekst i inna skala.
- `sc-kuchnia → sc-ebook`: inny kontekst i plan średni kontra makro.
- `sc-ebook → sc-selfie`: kącik czytelniczy kontra balkon oraz makro kontra szeroki plan.
- Seria obejmuje 4 konteksty, 3 skale i 2 temperatury światła; człowiek występuje w 5/5 scen.

## SCENY

### sc-hero

- **Cel / rola:** główny nośnik korzyści w hero typu split; baza do animacji Kling i2v.
- **Format:** pion `4:5`.
- **Kadr:** makro dłoni i produktu, telefon pozostaje czytelny jako drugi plan.
- **Kompozycja:** dłoń na pierwszym planie, telefon oparty o poduszkę lub prosty stojak obok i nieco za dłonią. Kciuk dokładnie na środkowym przycisku. Kanapa i okno jako miękkie tło.
- **Światło:** chłodniejsze, jasne światło dzienne z boku; miękkie cienie.
- **Referencje:**
  - `image[0]` — keep2, główna referencja geometrii, materiału i różowego koloru.
  - `image[1]` — keep4, wyłącznie sposób osadzenia na palcu i praca kciuka; zignorować czarny kolor.

**SEED EN**

```text
Photorealistic lifestyle advertising image, vertical 4:5 composition, bright relaxed daytime home. A close macro view of an adult hand in the foreground wearing a small Bluetooth finger remote on the index finger. The product is a pastel matte pink ABS keystone-shaped block, approximately 3.0 x 2.8 x 1.3 cm, mounted on an open silicone C-shaped clip split underneath the finger, never a closed ring. Its slightly sloped top plate has exactly three round, slightly raised arrow buttons arranged diagonally in one single line; all buttons are the same pastel matte pink as the body. One side has a long recessed rail or groove; the opposite side has a recessed oval charging socket and a tiny unlit LED pinhole. The thumb rests precisely on the middle button.

Place a vertically oriented smartphone next to and slightly behind the hand, propped against a simple stand or pale sofa cushion. Its screen shows a neutral, heavily blurred vertical content feed made of soft abstract blocks, with no recognizable app, icons, logos or readable text. Bright sofa beside a window, pale domestic fabrics, ordinary light home clothing, no visible face. Keep the hand and product sharply focused while the phone and room remain softly defocused. Cool natural daylight, soft shadows, restrained powder-rose palette, realistic skin and product proportions. Static-camera composition suitable for image-to-video animation, with enough visible screen area for vertical motion.

Use image[0] as the primary reference for exact product geometry, pink color and matte material. Use image[1] only as a reference for how the device sits on the index finger and how the thumb reaches the buttons; ignore its black color.

ORIENT (visibility priority: top plate with three buttons + ONE side; the charging-socket side MAY be hidden — never invent it on the visible side): ring worn on the index finger, keystone block centered on top of the finger, sloped three-button face angled toward the thumb, thumb placed on the middle button, open C-clip and underside split visibly wrapping under the finger, top and one side shown in a clear three-quarter view.

NEGATIVE PROMPT: no screen or display on the ring, no fourth button, no button count other than exactly three, no metal on the ring, no metallic finish, no closed ring band, no dial, no wheel, no roller, no RGB or product illumination, no logos or writing on the product, no cable connected to the ring, no charging station or charging dock for the ring, no strap on the ring, no black product, no cream product, no product color other than pastel matte pink, no text, letters, numbers, captions or typographic glyphs anywhere, no recognizable app or UI, no app logos, no watermark, no faces in close-up, no night scene, no dark living room, no gym, no office, no restaurant, no gamer-RGB, no stock studio setup, no deformed hands, no extra fingers, no duplicated product.
```

**Uwagi:** nie dodawać łuków sygnału przed animacją. Ekran telefonu musi pozostać wystarczająco widoczny, aby jego zawartość mogła płynąć pionowo.

---

### sc-kanapa

- **Cel / rola:** pokazanie wygodnego scrollowania bez sięgania do telefonu; kadr A sekcji „ekran zostaje”.
- **Format:** poziom `3:2`.
- **Kadr:** szerszy plan wnętrza z dłonią i produktem czytelnymi na pierwszym planie.
- **Kompozycja:** osoba pod jasnym kocem, kadrowana od ramion w dół. Telefon stoi na stoliku lub szerokim oparciu. Dłoń z pierścieniem swobodnie spoczywa na kocu.
- **Światło:** cieplejsze popołudniowe światło z okna, bez efektu zachodu i bez mroku.
- **Referencje:**
  - `image[0]` — keep2, główna referencja produktu.
  - `image[1]` — keep4, sposób noszenia i relacja palec–kciuk; zignorować czarny kolor.

**SEED EN**

```text
Photorealistic wide lifestyle scene, horizontal 3:2, a relaxed adult sitting on a pale sofa under a soft light blanket during the day, framed from the shoulders down with no visible face. A smartphone is propped upright on a simple stand on a nearby side table or broad sofa armrest, positioned comfortably within sight but beyond arm’s reach. Its screen contains only a neutral, heavily blurred vertical feed with abstract image blocks, no recognizable app, icons, logos or readable text.

In the foreground, one hand rests naturally and comfortably on top of the blanket. The index finger wears a small pastel matte pink Bluetooth finger remote: a keystone-shaped matte ABS block approximately 3.0 x 2.8 x 1.3 cm on an open silicone C-shaped clip split underneath the finger, never a closed ring. The slightly sloped top plate contains exactly three round, slightly raised arrow buttons arranged diagonally in one single line, all the same pastel matte pink as the body. One side has a long recessed rail or groove; the opposite side has a recessed oval charging socket and a tiny unlit LED pinhole. The thumb rests naturally close to the buttons, showing that scrolling is possible without reaching toward the phone.

Warm soft afternoon daylight through a nearby window, bright domestic interior, powder-rose and off-white textiles, ordinary light home clothing, realistic skin and hand anatomy. Preserve a wide sense of space while keeping the ring product recognizable and in focus; softly defocus the phone screen and distant room.

Use image[0] as the primary reference for exact product geometry, pink color and matte material. Use image[1] only as a reference for the open clip fit on the index finger and natural thumb access; ignore its black color.

ORIENT (visibility priority: top plate with three buttons + ONE side; the charging-socket side MAY be hidden — never invent it on the visible side): ring worn on the index finger, keystone block resting on top of the finger, three-button face turned inward toward the thumb, thumb relaxed beside the buttons, open C-clip and split visible beneath the finger against the blanket, product shown in a natural top-side three-quarter angle.

NEGATIVE PROMPT: no screen or display on the ring, no fourth button, no button count other than exactly three, no metal on the ring, no metallic finish, no closed ring band, no dial, no wheel, no roller, no RGB or product illumination, no logos or writing on the product, no cable connected to the ring, no charging station or charging dock for the ring, no strap on the ring, no black product, no cream product, no product color other than pastel matte pink, no text, letters, numbers, captions or typographic glyphs anywhere, no recognizable app or UI, no app logos, no watermark, no faces in close-up, no night scene, no dark living room, no gym, no office, no restaurant, no gamer-RGB, no stock studio setup, no deformed hands, no extra fingers, no duplicated product.
```

**Uwagi:** telefon nie może znajdować się w dłoni. Gest ma komunikować brak potrzeby sięgania do ekranu.

---

### sc-kuchnia

- **Cel / rola:** obsługa przepisu przy zajętych dłoniach; kadr B sekcji „ekran zostaje”.
- **Format:** poziom `3:2`.
- **Kadr:** plan średni obejmujący blat, urządzenie oraz obie dłonie.
- **Kompozycja:** jedna dłoń stabilizuje miskę lub trzyma składniki, druga nosi Skrolik i klika kciukiem. Tablet lub telefon stoi na blacie.
- **Światło:** chłodniejsze, jasne światło dzienne z kuchennego okna.
- **Referencje:**
  - `image[0]` — keep2, geometria i kolor produktu.
  - `image[1]` — keep4, sposób noszenia i naciskania; zignorować czarny kolor.

**SEED EN**

```text
Photorealistic medium lifestyle shot, horizontal 3:2, inside a bright modern home kitchen during the day. Frame an adult from the shoulders down in ordinary pale home clothing, with both hands visible above a light kitchen counter. One hand is occupied holding a ceramic mixing bowl or simple cooking ingredients. The other hand wears a pastel matte pink Bluetooth finger remote on the index finger and presses one of its buttons with the thumb.

The remote is a small keystone-shaped matte ABS block approximately 3.0 x 2.8 x 1.3 cm, mounted on an open silicone C-shaped clip with a clear split underneath the finger, never a closed ring. Its slightly sloped top plate has exactly three round, slightly raised arrow buttons arranged diagonally in one single line, with buttons matching the pastel matte pink body. One side has a long recessed rail or groove; the opposite side has a recessed oval charging socket and a tiny unlit LED pinhole.

A tablet or vertically positioned smartphone is propped securely on the counter, showing only a heavily blurred neutral recipe-like layout made of soft image and paragraph blocks. No legible words, recognizable app, icons, branding or logos. The device is not being touched. Cool bright daylight enters from a kitchen window, with soft natural shadows, pale cabinetry, uncluttered countertop and realistic food preparation details. Focus on the active hands and ring while retaining enough kitchen context to make the use case immediately clear.

Use image[0] as the primary reference for exact product geometry, pink color and matte material. Use image[1] only as a reference for index-finger placement and the thumb pressing the top buttons; ignore its black color.

ORIENT (visibility priority: top plate with three buttons + ONE side; the charging-socket side MAY be hidden — never invent it on the visible side): ring worn on the index finger of the free hand, keystone block centered above the finger, sloped three-button face directly accessible to the same hand’s thumb, thumb gently pressing the middle button, open C-clip and underside split visible below the index finger, clear top-side three-quarter product view.

NEGATIVE PROMPT: no screen or display on the ring, no fourth button, no button count other than exactly three, no metal on the ring, no metallic finish, no closed ring band, no dial, no wheel, no roller, no RGB or product illumination, no logos or writing on the product, no cable connected to the ring, no charging station or charging dock for the ring, no strap on the ring, no black product, no cream product, no product color other than pastel matte pink, no text, letters, numbers, captions or typographic glyphs anywhere, no recognizable app or UI, no app logos, no watermark, no faces in close-up, no night scene, no dark living room, no gym, no office, no restaurant, no gamer-RGB, no stock studio setup, no deformed hands, no extra fingers, no duplicated product.
```

**Uwagi:** potrawa i wyposażenie kuchni są drugorzędne. Nie dodawać bałaganu ani dużej liczby akcesoriów konkurujących z produktem.

---

### sc-ebook

- **Cel / rola:** pokazanie przewracania lub przewijania stron e-booka bez dotykania urządzenia.
- **Format:** kwadrat `1:1`.
- **Kadr:** makro dłoni z produktem; urządzenie i kącik czytelniczy pozostają w drugim planie.
- **Kompozycja:** dłoń na pierwszym planie, tablet lub telefon przed osobą na fotelu albo parapecie. Cienkie łuki sygnału wychodzą od pierścienia.
- **Światło:** miękkie, cieplejsze popołudniowe światło z okna.
- **Referencje:**
  - `image[0]` — keep2, główna referencja produktu.
  - `image[1]` — keep4, sposób osadzenia produktu; zignorować czarny kolor.

**SEED EN**

```text
Photorealistic square 1:1 lifestyle image in a bright reading corner beside a window. An adult in ordinary light home clothing sits in a pale armchair, framed without a visible face. A smartphone or tablet stands in front of the person at a comfortable reading distance. Its screen shows a neutral ebook-like page made only of heavily blurred soft gray paragraph lines, with no text, letters, numbers, captions or typographic glyphs anywhere, title, recognizable app, icons, logos or branding.

The foreground is dominated by a sharply focused hand wearing a pastel matte pink Bluetooth finger remote on the index finger. The product is a small keystone-shaped matte ABS block approximately 3.0 x 2.8 x 1.3 cm, attached to an open silicone C-shaped clip split underneath the finger, never a closed ring. The slightly sloped top plate contains exactly three round, slightly raised arrow buttons arranged diagonally in one single line, all matching the pastel matte pink body. One side has a long recessed rail or groove; the opposite side has a recessed oval charging socket and a tiny unlit LED pinhole. The thumb is positioned to make a gentle page-change press.

Add only two or three very thin, translucent concentric signal arcs emerging from the ring, colored deep raspberry #B4265C, subtle and clearly graphical rather than physical hardware. Warm soft afternoon daylight, pale upholstery, powder-rose atmosphere, realistic hand anatomy and shallow depth of field. Keep the product crisp and the reading device softly defocused but identifiable.

Use image[0] as the primary reference for exact product geometry, pink color and matte material. Use image[1] only as a reference for how the open clip sits on the index finger and how the thumb reaches the controls; ignore its black color.

ORIENT (visibility priority: top plate with three buttons + ONE side; the charging-socket side MAY be hidden — never invent it on the visible side): ring worn on the index finger, keystone block on top and slightly angled toward the thumb, all three buttons visible in one diagonal line, thumb hovering over or gently touching the middle button, open C-clip and underside split clearly visible below the finger, product shown in a close three-quarter view.

NEGATIVE PROMPT: no screen or display on the ring, no fourth button, no button count other than exactly three, no metal on the ring, no metallic finish, no closed ring band, no dial, no wheel, no roller, no RGB or product illumination, no logos or writing on the product, no cable connected to the ring, no charging station or charging dock for the ring, no strap on the ring, no black product, no cream product, no product color other than pastel matte pink, no text, letters, numbers, captions or typographic glyphs anywhere, no recognizable app or UI, no app logos, no watermark, no faces in close-up, no night scene, no dark living room, no gym, no office, no restaurant, no gamer-RGB, no stock studio setup, no deformed hands, no extra fingers, no duplicated product.
```

**Uwagi:** łuki sygnału nie mogą przypominać podświetlenia RGB ani fizycznych elementów urządzenia. W razie deformacji generować scenę bez łuków i dodać je w layoucie.

---

### sc-selfie

- **Cel / rola:** komunikacja funkcji zdalnej migawki dla selfie i wideo.
- **Format:** poziom `3:2`.
- **Kadr:** szeroki plan przy balkonie lub dużym oknie.
- **Kompozycja:** telefon na mini-statywie na pierwszym lub środkowym planie; osoba stoi dalej, z głową poza kadrem albo odwróconą. Uniesiona dłoń z pierścieniem pozostaje czytelna.
- **Światło:** chłodniejsze jasne światło dzienne; wnętrze i balkon bez przepaleń.
- **Referencje:**
  - `image[0]` — keep2, geometria, materiał i różowy kolor.
  - `image[1]` — keep4, sposób noszenia i kliknięcia; zignorować czarny kolor.

**SEED EN**

```text
Photorealistic wide lifestyle scene, horizontal 3:2, beside a large bright apartment window during the day. A smartphone stands vertically on a small neutral mini tripod in the foreground or middle ground, aimed toward an adult positioned farther away. Show the person from the shoulders down or with the head safely outside the frame, wearing ordinary light casual home clothing. No close-up face.

The raised hand wearing the pastel matte pink Bluetooth finger remote is positioned in the MID-FOREGROUND, clearly closer to the viewer than the rest of the body, large and sharply readable. The thumb performs a gentle remote-shutter press. The product is a small keystone-shaped matte ABS block approximately 3.0 x 2.8 x 1.3 cm, mounted on an open silicone C-shaped clip split underneath the finger, never a closed ring. Its slightly sloped top plate has exactly three round, slightly raised arrow buttons arranged diagonally in one single line, all the same pastel matte pink as the body. One side has a long recessed rail or groove; the opposite side has a recessed oval charging socket and a tiny unlit LED pinhole.

The phone screen may show only a soft, blurred, neutral camera-preview silhouette with no recognizable camera UI, icons, text, logos or branding. Use a three-quarter side viewpoint so the phone, subject and raised ring hand form a clear visual triangle. Cool bright daylight, pale window surroundings, soft shadows, realistic proportions and uncluttered domestic styling. Keep enough depth of field for the ring to remain recognizable while preserving the wider environmental scale.

Use image[0] as the primary reference for exact product geometry, pink color and matte material. Use image[1] only as a reference for the fit on the index finger and thumb-button interaction; ignore its black color.

ORIENT (visibility priority: top plate with three buttons + ONE side; the charging-socket side MAY be hidden — never invent it on the visible side): ring worn on the raised index finger, keystone block placed on top of the finger and turned toward the same hand’s thumb, three-button face visible to the viewer, thumb gently pressing the middle button, open C-clip and underside split visible beneath the finger, stable natural grip with no product rotation.

NEGATIVE PROMPT: no screen or display on the ring, no fourth button, no button count other than exactly three, no metal on the ring, no metallic finish, no closed ring band, no dial, no wheel, no roller, no RGB or product illumination, no logos or writing on the product, no cable connected to the ring, no charging station or charging dock for the ring, no strap on the ring, no black product, no cream product, no product color other than pastel matte pink, no text, letters, numbers, captions or typographic glyphs anywhere, no recognizable app or UI, no app logos, no watermark, no faces in close-up, no night scene, no dark living room, no gym, no office, no restaurant, no gamer-RGB, no stock studio setup, no deformed hands, no extra fingers, no duplicated product.
```

**Uwagi:** trójkąt wizualny telefon–osoba–dłoń; statyw neutralny bez brandu.

---

## NEG WSPÓLNY (verbatim w każdym seedzie)

```text
no screen or display on the ring, no fourth button, no button count other than exactly three, no metal on the ring, no metallic finish, no closed ring band, no dial, no wheel, no roller, no RGB or product illumination, no logos or writing on the product, no cable connected to the ring, no charging station or charging dock for the ring, no strap on the ring, no black product, no cream product, no product color other than pastel matte pink, no text, letters, numbers, captions or typographic glyphs anywhere, no recognizable app or UI, no app logos, no watermark, no faces in close-up, no night scene, no dark living room, no gym, no office, no restaurant, no gamer-RGB, no stock studio setup, no deformed hands, no extra fingers, no duplicated product.
```

## HERO-VIDEO (Kling i2v z sc-hero; dopisane przez nadzorcę — generacja ucięła się na capie)

- **Beat 5 s (kamera STATYCZNA, pętla first=last):** 0,0–0,8 s bezruch (ustalenie kadru);
  0,8–1,4 s kciuk delikatnie DOCISKA środkowy przycisk (skok ~1–2 mm, skóra lekko się
  napina); 1,2–3,4 s zawartość ekranu telefonu PŁYNIE pionowo w górę (miękkie rozmyte
  bloki feedu, ~2 przesunięcia „kart"); 3,4–4,6 s treść ŁAGODNIE OSIADA z powrotem do
  pozycji wyjściowej; 4,6–5,0 s bezruch, kciuk w spoczynku — klatka końcowa = początkowa
  (powrót treści czyni pętlę first=last wykonalną — korekta krytyka). Reszta kadru (dłoń, koc, okno,
  telefon jako bryła) NIERUCHOMA; żadnych najazdów/zoomów.
- **Prompt (i2v):** "Static camera. The thumb gently presses the middle button of the pink
  finger remote once; immediately the blurred vertical feed on the propped smartphone
  screen scrolls smoothly upward by two content blocks, then gently settles back down to its starting position and stops. The hand,
  blanket, sofa and window stay completely still. Subtle, realistic motion, seamless loop."
- **Negative prompt:** "camera movement, zoom, pan, parallax, morphing hands, extra
  fingers, product deformation, color change of the ring, UI elements appearing, readable
  text on screen, flicker, scene cut, people walking, face appearing"
- **Parametry:** `fal-ai/kling-video/v2.5-turbo/pro/image-to-video`, duration '5',
  cfg_scale 0.5, wejście = finalny kadr sc-hero (po gate wierności/anatomii).

## SCENY ANIMOWANE — ANIM-3 (F1.7b, LL-041; wybór nadzorcy)

| # | Scena | Sekcja | Nośnik ruchu (fizyczny, wystawiony) | Beat |
|---|---|---|---|---|
| 1 | sc-hero | 01 hero | ekran telefonu (feed płynie) + docisk kciuka | wg ## HERO-VIDEO |
| 2 | sc-kanapa | 03 ekran-zostaje | ekran telefonu na stoliku — feed płynie pionowo; dłoń/koc statyczne | klik-mikro kciuka → 2 bloki przesuwu → łagodny powrót treści do startu → stop (first=last) |
| 3 | sc-kuchnia | 03b/kadr B | ekran tabletu z przepisem — treść przesuwa się o 1 sekcję; para z miski delikatnie | kciuk dociska → przepis płynie o 1 sekcję → łagodny powrót do startu → stop; dłonie przy misce NIERUCHOME |

Kryteria LL-041 spełnione: nośnik ruchu wystawiony (ekrany nieprzecięte krawędzią, zero
tekstu czytelnego w strefie ruchu — treść rozmyta), rozrzut góra-dół (hero / środek),
produkt = statyka (żadnych ruchów pierścienia). ⛔ Nie animujemy sc-ebook (łuki sygnału
graficzne — ryzyko morfingu) ani sc-selfie (ruch „zrobienia zdjęcia" = ryzyko anatomii
dłoni w Kling). Kompozycja tych 3 scen MUSI zostawić ekranom przestrzeń (uwaga w seedach).
Budżet: 3 × $0.35 (Kling 5 s).

## KOREKTA v2 (po krytyku F1.7 — FAIL → naniesione)
1. NEG wszędzie rozszerzony: „no text, letters, numbers, captions or typographic glyphs anywhere".
2. ORIENT z priorytetem widoczności: płytka z 3 przyciskami + JEDEN bok; strona gniazda MOŻE
   być ukryta (zakaz wymyślania jej na widocznym boku).
3. sc-selfie: dłoń z pierścieniem w MID-FOREGROUND (duża, czytelna), osoba dalej.
4. Pętle ANIM: treść ekranu wraca do pozycji startowej (first=last wykonalne).
5. Decyzje produkcyjne: sc-ebook = fotel; sc-selfie = duże okno (bez balkonu).
6. Fallback dłoni (sc-kuchnia): jeśli 2 dłonie deformują — dłoń z miską w tło/za kadr,
   generacja z JEDNĄ dłonią (ring-hand); compositing dozwolony.
