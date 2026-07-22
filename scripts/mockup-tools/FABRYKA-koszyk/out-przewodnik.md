# PRZEWODNIK GRAFICZNY — ODSĄCZEK

## ŚWIAT I ŚWIATŁO

- **Kierunek:** zwykła domowa kuchnia w trakcie pracy. Kuchenka, czarny wok lub stalowy garnek, prosty blat, drewniana deska, zlew i zwykła szuflada.
- **Tła layoutu:** ciepły len `#F4EFE5`; karty `#FFFCF6`.
- **Akcent:** butelkowa zieleń `#176B3A`.
- **Typografia layoutu:** Bricolage Grotesque dla nagłówków, Figtree dla treści i UI. Nie generować typografii w obrazach.
- **Sygnatura:** cienkie łukowe strzałki trajektorii w `#176B3A`, dodawane dopiero w layoucie. Nie generować ich jako elementu fotografii.
- **Światło dzienne:** miękkie światło z bocznego okna, neutralne biele, naturalna srebrna stal.
- **Światło przy kuchence:** dzienne z lekkim ciepłym odbiciem od garnka, oleju i jedzenia. Bez wieczornej atmosfery.
- **Studio:** ciepłe near-white `#FFFCF6`, miękki cień kontaktowy, bez połysku premium.
- **Casting:** dorośli 30–50 lat, zwykłe domowe ubrania. Kadrować głównie dłonie i sylwetkę od szyi w dół.
- **Jedzenie:** frytki i nuggetsy złote, apetyczne, naturalne. Bez przesadnego połysku i stylizacji food-porn. Olej czysty, jasny.
- **Spójność produktu:** geometria i konstrukcja zawsze wynikają z image-ref packshotu. Referencje scen akcji służą tylko do gestu, skali i kontekstu.

## MAPA OSI RÓŻNORODNOŚCI

| Scena | Kontekst | Skala | Światło | Człowiek |
|---|---|---|---|---|
| `sc-hero` | kuchenka, wok | produkt / pionowy hero | dzienne + cieplejsze odbicie przy kuchence | tak, dłoń i fragment tułowia |
| `sc-zanurzony` | kuchenka, garnek | produkt | cieplejsze przy kuchence | tak, dłonie |
| `sc-uniesiony` | kuchenka, ten sam garnek | produkt | cieplejsze przy kuchence | tak, dłoń |
| `sc-zawieszony` | kuchenka, garnek | makro / detal boczny | cieplejsze przy kuchence | nie |
| `sc-transform` | studio near-white | packshot / widok całego produktu | miękkie neutralne studio | nie |
| `sc-szuflada` | szuflada i blat | produkt / kontekst przechowywania | dzienne | tak, dłoń |
| `sc-durszlak` | zlew | produkt / widok z góry | jasne dzienne | tak, dłonie |
| `sc-mycie` | zlew | makro siatki i dna | jasne dzienne | tak, dłonie |
| `sc-final` | kuchenka i szerszy blat | szeroki kadr | dzienne + ciepłe odbicie | nie |

**Bilans:** 4 konteksty, 3 skale, 3 warianty światła, człowiek w 6 z 9 scen.

## SCENY

### sc-hero

- **Cel/rola:** hero H; natychmiast pokazać wyjęcie całej porcji jednym ruchem. Baza statyczna dla loopu Kling.
- **Kadr/format:** pion `4:5`; przygotować bezpieczny crop `9:16`. Produkt centralnie w dolnych 2/3 kadru, wok poniżej, wolniejsze tło w górnej części pod H1.
- **Image-ref:** wymagany. `image[0]` — packshot rozłożony. Referencja wyjmowania z woka opcjonalnie jako kolejny image-ref wyłącznie dla gestu i kontekstu.
- **SEED EN:**

```text
Photorealistic vertical commercial lifestyle photograph in an ordinary home kitchen during daytime. An adult aged 30–50, shown only by one hand, forearm and a small part of a plain casual torso, lifts a full frying basket of naturally golden French fries out of a black wok on a normal home stove. Clean pale cooking oil drips visibly from the basket back into the center of the wok, with a small amount of natural steam. The food looks appetizing but restrained and realistic, not glossy food advertising. The product must faithfully match image[0]: bare silver stainless steel folding frying and draining basket, open woven diamond mesh with no solid wall sections, a crown of repeated zigzag V-shaped support wires around the upper rim, two wire handle arms joined together with a flat hanger-shaped bridge, and a concentric wire rosette bottom with a small center eye. Natural silver metal, accurate thin-wire construction, realistic reflections. Soft window daylight with a slightly warmer reflection near the stove. Ordinary countertop and cookware, clean but lived-in home setting. Static-camera composition, product sharply readable, upper background visually quiet for later headline placement.
```

- **ORIENT:**

```text
ORIENT: basket fully expanded and upright, front three-quarter view, centered above the wok; both wire handle arms are brought together and held by one adult hand at the flat hanger-shaped bridge; basket rises vertically, fries remain inside, bottom rosette faces downward, oil droplets fall directly back into the wok.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** zachować wolną strefę pod H1. Dłoń nie może zasłaniać płaskiego mostka uchwytów. Krople kierować do wnętrza woka, nie na kuchenkę.

---

### sc-zanurzony

- **Cel/rola:** pierwszy kadr pary „jeden ruch”; pokazać smażenie całej porcji wewnątrz kosza.
- **Kadr/format:** poziom `3:2`; profil lekko z góry. Ten sam garnek, kuchenka, obiektyw i kierunek światła co w `sc-uniesiony`.
- **Image-ref:** wymagany. `image[0]` — packshot rozłożony. Referencja smażenia w woku opcjonalnie jako kolejny image-ref dla zachowania czynności.
- **SEED EN:**

```text
Photorealistic horizontal lifestyle photograph in an ordinary home kitchen, designed as the first frame of a matched two-image action pair. A bare silver stainless steel folding frying basket sits expanded inside a simple metal pot of clean pale cooking oil on a normal home stove. Naturally golden nuggets are frying inside the basket with moderate realistic bubbling. An adult aged 30–50 is shown only from the neck down with ordinary casual sleeves; one hand lightly controls the joined wire handles without covering their structure. The product must faithfully match image[0]: open woven diamond mesh with zero solid wall panels, repeated zigzag V-shaped support wires forming the crown around the upper rim, two wire handle arms joined with a flat hanger-shaped bridge, and a concentric wire rosette bottom with a small center eye. Natural uncoated silver stainless steel, correct thin-wire geometry and realistic reflections. Warm-neutral daylight from the side with slightly warmer stove reflections. Modest domestic countertop, no staged luxury props. Keep camera height, lens, pot position and background suitable for an exact continuity match with the lifted-basket frame.
```

- **ORIENT:**

```text
ORIENT: basket fully expanded and upright inside the pot, lower mesh body submerged in pale oil, zigzag crown and joined handles above the pot rim; bottom rosette horizontal and facing downward; nuggets contained inside the mesh; hand holds the flat bridge without lifting yet.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** przypisać tej scenie i `sc-uniesiony` ten sam continuity key/seed bazowy. Nie dodawać łyżki cedzakowej do głównej generacji; ewentualna winieta problemowa osobno.

---

### sc-uniesiony

- **Cel/rola:** drugi kadr pary „jeden ruch”; cała porcja uniesiona razem nad garnkiem.
- **Kadr/format:** poziom `3:2`; identyczna kamera i kompozycja otoczenia jak `sc-zanurzony`.
- **Image-ref:** wymagany. `image[0]` — packshot rozłożony. Referencja wyjmowania z woka opcjonalnie dla gestu.
- **SEED EN:**

```text
Photorealistic horizontal lifestyle photograph in the exact same ordinary home kitchen, camera position, lens, pot placement and lighting as the matched submerged-basket frame. An adult aged 30–50, visible only by one hand, forearm and plain casual clothing from the neck down, has lifted the entire portion of naturally golden nuggets together in one expanded wire basket. The basket is held directly above the same metal pot, and several small droplets of clean pale oil fall back into the center. The food is appetizing and realistic without exaggerated shine or food-porn styling. The product must faithfully match image[0]: bare silver stainless steel folding frying and draining basket, fully open woven diamond mesh with no solid wall sections, a repeated zigzag crown of V-shaped support wires around the upper rim, two wire handle arms joined by a flat hanger-shaped bridge, and a concentric wire rosette bottom with a small center eye. Accurate thin-wire construction, natural silver reflections. Warm-neutral daylight with slightly warmer reflections near the stove, restrained steam, ordinary domestic surroundings.
```

- **ORIENT:**

```text
ORIENT: basket fully expanded and upright, side three-quarter view, held just above the pot rim; both handle arms are joined and gripped at the flat bridge; bottom rosette points straight down over the pot center; nuggets stay inside; droplets travel vertically back into the pot.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** połączyć z `sc-zanurzony` cienką łukową strzałką dopiero w layoucie. Nie zmieniać garnka, stroju ani położenia tła między kadrami.

---

### sc-zawieszony

- **Cel/rola:** sekcja „Zawieś i odsącz”; udowodnić zawieszenie bez trzymania.
- **Kadr/format:** poziom `3:2`; bliski detal boczny. Korona, rant i droga kropli muszą być czytelne.
- **Image-ref:** wymagany. `image[0]` — packshot rozłożony.
- **SEED EN:**

```text
Photorealistic close side-detail photograph of a folding frying basket hanging unattended on the rim of a simple metal pot in an ordinary home kitchen. The contact point between the pot rim and the basket's repeated zigzag V-wire crown is sharply visible and mechanically believable. No person is touching the product. A few small droplets of clean pale oil fall from the lower open mesh back into the pot. The basket contains a restrained portion of naturally golden French fries. The product must faithfully match image[0]: bare silver stainless steel construction, open woven diamond mesh with no solid wall panels, a crown of repeated zigzag V-shaped support wires around the upper edge, two wire handle arms joined by a flat hanger-shaped bridge, and a concentric wire rosette bottom with a small center eye. Natural uncoated silver metal, accurate wire spacing and realistic reflections. Warm-neutral home-kitchen daylight with a mild warm stove reflection, shallow depth of field focused on the crown resting on the rim. Ordinary cookware and background, functional rather than premium.
```

- **ORIENT:**

```text
ORIENT: basket hangs by the zigzag crown ON the pot rim, handles fully released and not held, basket body suspended inside and above the pot center, side profile visible, bottom rosette facing downward, all droplets returning inside the pot.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** bez dłoni w kadrze. Nie sugerować dodatkowego haka ani zatrzasku. W layoucie można dodać krótki zielony łuk wskazujący krople.

---

### sc-transform

- **Cel/rola:** packshot przed/po dla sekcji „Złóż na płasko” i miniatury checkoutu.
- **Kadr/format:** poziom `3:2`; para produktów w jednym kadrze. Przygotować także osobne cropy `1:1`.
- **Image-ref:** wymagane oba packshoty. `image[0]` — kosz rozłożony; `image[1]` — płaski dysk.
- **SEED EN:**

```text
Photorealistic warm near-white studio packshot showing two states of the exact same folding frying and draining basket side by side: fully expanded on the left and folded into a flat circular disk on the right. Faithfully preserve the product geometry from image[0] and image[1]. Both states use bare silver stainless steel only. The expanded basket has open woven diamond mesh with zero solid wall sections, a repeated crown of zigzag V-shaped support wires around the upper rim, two wire handle arms joined with a flat hanger-shaped bridge, and a concentric wire rosette bottom with a small center eye. The folded state compresses the same wire structure into a low flat disk without introducing hinges, plastic locks or extra parts; the rosette and small center eye remain visible. Warm near-white background matching #FFFCF6, soft contact shadows, neutral product photography, crisp wire detail, no luxury reflections, no props. Leave clean space between both states for a trajectory arrow added later in layout.
```

- **ORIENT:**

```text
ORIENT: expanded basket on the left in a slightly elevated three-quarter view, upright with handles raised and bottom rosette downward; folded basket on the right viewed almost directly from above as a flat circular disk, handles laid within the disk footprint; both products aligned on one horizontal baseline.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** strzałkę `↔` lub cienki łuk dodać w layoucie. Nie generować stanu pośredniego jako nowej mechaniki produktu.

---

### sc-szuflada

- **Cel/rola:** praktyczny finał transformacji; pokazać płaskie przechowywanie.
- **Kadr/format:** poziom `3:2`; ujęcie z góry pod lekkim kątem.
- **Image-ref:** wymagany `image[0]` — packshot rozłożony. Zalecany `image[1]` — packshot złożonego dysku dla dokładnego stanu końcowego.
- **SEED EN:**

```text
Photorealistic daytime home-kitchen photograph of one adult hand sliding a folded frying basket into a normal shallow kitchen drawer. The product is compressed into the same flat circular disk shown by the references, with its bare silver stainless steel wire construction still clearly visible. Preserve the exact product identity from image[0], using image[1] for the folded state: woven diamond mesh collapsed into a flat open disk, repeated zigzag V-shaped crown wires folded into the circular structure, two wire handle arms with their flat hanger-shaped bridge lying within the disk footprint, and the concentric wire rosette with a small center eye visible. No new hinge, lock or plastic mechanism. Ordinary wooden or neutral laminate drawer, a few simple kitchen utensils placed loosely to show domestic scale without clutter. Soft side window daylight, natural hand anatomy, plain casual sleeve, functional everyday styling.
```

- **ORIENT:**

```text
ORIENT: basket fully folded into a flat disk, held at one edge by one adult hand and moved horizontally into the open drawer; disk remains parallel to the drawer base; concentric rosette faces upward; handles lie flat inside the circular footprint.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** szuflada zwykła, nie designerska. Dysk powinien wyglądać na płaski dzięki złożeniu drutów, nie jak pełna metalowa taca.

---

### sc-durszlak

- **Cel/rola:** sekcja „Jak durszlak”; pokazać przepływ wody przez ażur.
- **Kadr/format:** pion `4:5`; perspektywa z góry pod kątem około 35–45°.
- **Image-ref:** wymagany. `image[0]` — packshot rozłożony.
- **SEED EN:**

```text
Photorealistic bright daytime photograph in an ordinary home sink. An expanded folding stainless steel basket is used as a colander while an adult aged 30–50 rinses a modest portion of vegetables and plain cooked pasta. Only hands and forearms in ordinary casual sleeves are visible. Clear tap water enters from above and passes visibly through the open diamond mesh into the sink, with realistic small splashes. The product must faithfully match image[0]: bare silver stainless steel, woven open diamond mesh with no solid wall sections, repeated zigzag V-shaped support wires around the upper rim, two wire handle arms joined by a flat hanger-shaped bridge, and a concentric wire rosette bottom with a small center eye. Accurate thin-wire construction, natural silver reflections, no color coating. Soft bright window daylight, neutral domestic sink and countertop, fresh but unstaged everyday atmosphere.
```

- **ORIENT:**

```text
ORIENT: basket fully expanded and upright inside the sink basin, viewed from above at an angle; bottom rosette centered and facing downward; handles joined and angled upward but not blocking the contents; one hand steadies the flat bridge while water passes through the mesh.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** woda musi przechodzić przez siatkę, nie zatrzymywać się jak w misce. Jedzenie nie może zasłonić całej konstrukcji.

---

### sc-mycie

- **Cel/rola:** sekcja „Proste mycie”; detal czystej siatki, drutów i rozety.
- **Kadr/format:** kwadrat `1:1`; makro od spodu lub niskie 3/4.
- **Image-ref:** wymagany. `image[0]` — packshot rozłożony.
- **SEED EN:**

```text
Photorealistic macro photograph of an empty folding stainless steel basket being rinsed under a normal kitchen tap in a bright domestic sink. Two adult hands gently rotate the basket while clear water runs across and through the open woven wire structure. Focus on the accurate diamond mesh, smooth bare stainless steel wires, repeated zigzag V-shaped crown supports and the underside concentric wire rosette with its small center eye. The product must faithfully match image[0], including two wire handle arms joined by a flat hanger-shaped bridge. There are no solid wall or bottom surfaces; water passes freely through every open section. Natural silver metal, clean realistic reflections and small droplets, no artificial sparkle. Bright soft daylight, neutral sink background, shallow depth of field with the central rosette and nearby mesh sharply resolved.
```

- **ORIENT:**

```text
ORIENT: basket fully expanded, empty and tilted about 45 degrees toward the camera; underside and concentric rosette face the lens; one hand steadies the crown and the other rotates the joined handles; tap water crosses the mesh and exits downward into the sink.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** nie dodawać piany, detergentu ani symbolu zmywarki. Pokazać czystą konstrukcję, bez resztek jedzenia.

---

### sc-final

- **Cel/rola:** końcowe domknięcie oferty; produkt zawieszony nad garnkiem w szerszym kontekście kuchni.
- **Kadr/format:** poziom `3:2`; bezpieczny crop pionowy `4:5` na mobile. Zostawić spokojną strefę na kartę CTA.
- **Image-ref:** wymagany. `image[0]` — packshot rozłożony.
- **SEED EN:**

```text
Photorealistic wide closing scene in an ordinary home kitchen during daytime. A fully expanded folding frying basket filled with a restrained portion of naturally golden nuggets hangs unattended from the rim of a simple metal pot on a normal home stove. Small droplets of clean pale oil return into the pot. The wider frame includes an everyday countertop and a wooden cutting board, with minimal practical kitchen items and no luxury styling. The product must faithfully match image[0]: bare silver stainless steel, open woven diamond mesh with zero solid wall sections, repeated zigzag V-shaped support wires forming the crown around the upper rim, two wire handle arms joined by a flat hanger-shaped bridge, and a concentric wire rosette bottom with a small center eye. Natural silver reflections, believable thin-wire geometry. Soft window daylight mixed with a mild warm reflection near the stove, restrained steam, realistic golden food without exaggerated food-porn shine. Leave a visually quiet area on one side for a later offer card.
```

- **ORIENT:**

```text
ORIENT: basket hangs by the zigzag crown ON the pot rim, handles released and visible but not held, basket body centered over the pot opening, bottom rosette facing downward, nuggets contained inside, droplets falling only into the pot; wider three-quarter kitchen view.
```

- **NEG:**

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

- **Uwagi:** deskę umieścić w tle lub na bocznym planie, nie pod gorącym garnkiem. Produkt pozostaje głównym obiektem mimo szerszego kadru.

## NEG WSPÓLNY

Poniższy blok stosować bez zmian we wszystkich generacjach:

```text
NEG: no silicone or colored handle grips, no solid walls, no solid bottom, no telescoping parts, no plastic latches, no colored coatings, no logos on the product, no lid, no feet, no text, no watermark, no health claims, no restaurant, no chef, no professional kitchen, no premium styling, no evening lounge, no close-up face
```

## MAPA CROPÓW — SEKCJE KODOWE (poprawka krytyka #2)
- **mid-cta** ← trzy cropy-piktogramy z: sc-zanurzony (w oleju) · sc-uniesiony (nad garnkiem) · sc-zawieszony (na rancie).
- **zamow (p0)** ← packshot rozłożony na ciepłym near-white z sc-transform + miniatura płaskiego dysku (drugi kadr sc-transform).
- **faq** ← miniatury: sc-zanurzony (użycie) · sc-transform (składanie) · sc-durszlak (odcedzanie) · sc-mycie (mycie).
- **sticky-buy** ← ciasny crop packshotu p0 (kwadrat).

## HERO-VIDEO

**Źródło:** `sc-hero`, Kling i2v, 5 s, kamera całkowicie statyczna.

### Beat ruchu — 5 s

- **0,0–0,8 s:** START = klatka bazowa sc-hero (kosz tuż nad taflą oleju, dolna siatka jeszcze ocieka). Kosz KONTYNUUJE powolny ruch pionowy w górę; dłoń porusza się wyłącznie pionowo.
- **0,8–2,4 s:** kosz z frytkami unosi się do pozycji nad wokiem. Frytki pozostają wewnątrz, siatka i uchwyty nie zmieniają geometrii.
- **2,4–4,2 s:** krótki stabilny hold. Kilka drobnych kropli oleju spada do środka woka; lekka para przesuwa się ku górze.
- **4,2–5,0 s:** minimalne uspokojenie dłoni i kosza. Krople wygasają, para trwa. Bez ruchu kamery i bez zmiany kadru.
- **Loop:** wejście i wyjście utrzymać spokojne; bez automatycznego odwracania ruchu, jeśli powoduje nienaturalny powrót kropli.

### Negative prompt — Kling

```text
no camera movement, no zoom, no pan, no tilt, no handheld shake, no scene cut, no morphing basket, no changing wire geometry, no bending handles, no duplicate handles, no disappearing mesh, no solid walls, no solid bottom, no silicone or colored grips, no plastic parts, no extra product parts, no spilled oil outside the wok, no flying fries, no exaggerated bubbling, no heavy smoke, no fire, no face reveal, no deformed hand, no extra fingers, no text, no watermark, no logo, no restaurant, no chef, no professional kitchen, no health claims
```

## CZEGO PILNOWAĆ

1. **Siatka:** zawsze otwarta pleciona siatka rombowa. Zero pełnych ścianek i zero pełnego dna.
2. **Korona:** wokół górnej krawędzi musi być widoczny regularny wieniec zygzakowatych drutów w kształcie `V`.
3. **Uchwyty:** dokładnie dwa druciane ramiona połączone płaskim mostkiem w formie wieszaka. Bez teleskopu, plastiku i silikonowych nakładek.
4. **Dno:** koncentryczna druciana rozeta z małym oczkiem pośrodku. W stanie złożonym produkt jest płaskim, ażurowym dyskiem.
5. **Materiał i dodatki:** wyłącznie goła srebrna stal nierdzewna. Bez kolorowych powłok, logotypu, pokrywki, nóżek, zatrzasków i dodatkowych części.