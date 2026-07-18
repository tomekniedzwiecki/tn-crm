# PROMPTY — BIBLIOTEKA KANONICZNYCH SZABLONÓW

> Jedno źródło szablonów promptów dla wszystkich archetypów. Każda klauzula jest wyuczona z incydentu — nie skracaj.
> Pola `{KARTA.xxx}` podstawiasz z instancji `KARTA.json` (z `KARTA.template.json`). `{...}` w tekście = do podstawienia.
> Kolejność obrazów = ROLA obrazu — model czyta rolę z promptu, więc rolę MUSISZ nazwać jawnie.

---

## KLAUZULE STAŁE (bloki wklejane do szablonów)

**{COMMON}** — sceneria + realizm (beauty/talking-head i sceny z człowiekiem):
```
Photorealistic smartphone UGC selfie look, natural skin texture with visible pores, slight grain,
uneven natural window light, tiny handheld imperfection. {KARTA.scenography.layout}. {KARTA.scenography.swiatlo}.
NO on-screen text, NO logos, NO captions.
```

**{PRODUCT_ID}** — tożsamość produktu (do KAŻDEJ klatki z produktem, VERBATIM z KARTY):
```
The product EXACTLY as its identity reference: {KARTA.product.anatomy_str};
{KARTA.product.functional_count} — this exact count, never more, never fewer. {KARTA.product.exactly_one}.
```

**{ANTI_HANDS}** — anty-ręce: `natural human hands, max two hands, five fingers each, no extra fingers, no fused fingers, no third arm`.

**{ANTI_JEWELRY}** — anty-biżuteria (gdy w kadrze dłonie/nadgarstki): `bare hands, no rings, no bracelets, no nail polish, no watch`.

**{ANTI_TEXT}** — anty-tekst: `no readable text, no logos, no brand names, no numbers on dials or labels; any tiny text must be blurred and illegible`.

**{PHYSICS_FLUID}** — fizyka wody/strumieni (sceny płynów); `{liquid}` = **`{KARTA.product.fluid}`** (źródło placeholdera; null → scena nie jest płynowa): `the {KARTA.product.fluid} flows as real liquid with continuous streams leaving the nozzle front along {KARTA.grammar.physics}; it must NOT turn into foam, blobs or clumps; consistent volume, natural gravity`.

**{SCREENS_GENERIC}** — ekrany/wyświetlacze: `any screen shows a generic dark UI or dark navigation map, no brands, no readable labels; vehicle gauges and clocks are out of frame or blurred`.

**{NEG_CORE}** — negative rdzeń (już w `render.py` NEG; TU tylko referencja, NIE dubluj w prompcie): wady generyczne (extra fingers, morphing, product changing shape, second device...). **Cechy produktowe idą do `negative_extra` per scena z `KARTA.product.forbidden_leaks`, NIGDY do rdzenia** (lekcja: „pink" wyciekł do gunmetal).

---

## (1) KLATKA nano-banana/edit — role obrazów jawne
Model: `fal-ai/nano-banana/edit`. Payload: `{prompt, image_urls:[...], num_images:1, output_format:"png", aspect_ratio:"9:16"}`.
Kolejność `image_urls` = kolejność ról w prompcie. Reguła: **każdy obraz dostaje JEDNĄ rolę, reszta jego treści jest ignorowana.**

```
image_urls = [POSE_REF, PACKSHOT_ALI, FACE_REF]

Prompt:
Use Image 1 for the POSE and hand positions ONLY — ignore its identity, product and background.
Use Image 2 for the EXACT PRODUCT IDENTITY ONLY — {PRODUCT_ID} — ignore its background and lighting.
Use Image 3 for the FACE IDENTITY ONLY — the same person, {KARTA.identity.eye_color} eyes.
Scene: {opis kadru sceny — plan, co robią obie dłonie, obszar pracy}.
{COMMON} {ANTI_HANDS} {ANTI_JEWELRY} {ANTI_TEXT}
```
- Hands-POV (bez twarzy): pomiń FACE_REF; `image_urls=[PACKSHOT_ALI]` lub `[POSE_REF, PACKSHOT_ALI]`.
- **Master-frame produktu**: pierwszą klatkę produktu wygeneruj z packshotu, a kolejne produktowe **chainuj z niej** (szablon 2) — anty-morf.

## (2) PARA FLF (first → last) — chaining z mastera
Model: `flf` (Kling 2.5). `image_url` = first, `tail_image_url` = last, `duration:"5"`, `cfg_scale:0.5`, `negative_prompt = NEG + negative_extra`.
Last-frame generuj nano-bananą Z KLATKI FIRST jako jedynej referencji:

```
image_urls = [FIRST_FRAME]

Prompt (last frame):
Keep EXACTLY the same framing, lighting, background, camera angle and product position as this reference image.
Change ONLY: {jedna zmiana — np. "the strand is now fully wound around the barrel" / "the bit is now seated in the screw"}.
Do NOT add or remove any parts; keep {KARTA.product.functional_count}. No new objects, no new hands, {ANTI_TEXT}.
```
Motion (prompt renderu FLF): opis ruchu między klatkami, `slow rotation / subtle handheld micro-drift`, **bez pełnych obrotów** (ghosting sztywnych części).

### Wariant „rotation/reveal" — last = inny kąt/strona produktu
Gdy scena ma pokazać drugą stronę urządzenia (obrót ~80-120°), last-frame generuj z klatki first tym szablonem:
```
image_urls = [FIRST_FRAME]

Prompt (last frame):
Keep the same scene, framing, lighting and background as this reference image.
The device has ROTATED ~90°, now showing its {back / side with X — np. "back with the vent grille" / "side with the power button"};
same scale and position, no other changes. Do NOT add or remove any parts; keep {KARTA.product.functional_count}. {ANTI_TEXT}.
```
Uwaga: obrót **>120° w 5 s** ryzykuje ghosting sztywnych krawędzi (metal dubluje obrys) — na większy obrót rozbij na dwa cięcia po ~90°, nie jedną parę.

## (3) MOTION CONTROL (mc) — prompt ustawia TOŻSAMOŚĆ+SCENĘ, nie ruch
Model: `mc` (Kling 2.6). `image_url` + `video_url` (driving 3-10 s, postać widoczna cały czas) + `character_orientation:"image"`. **Ruch dziedziczy się z drivingu — prompt go NIE opisuje**, opisuje kto/co/gdzie:

```
Prompt:
{opis osoby + sceny + produktu}. {PRODUCT_ID}
EXACTLY ONE {KARTA.product.nazwa} in the scene; the other hand is EMPTY and holds nothing.
{KARTA.identity.eye_color} eyes. {COMMON}
negative_extra: second device, duplicate product, object in the free hand, {KARTA.product.forbidden_leaks}
```
Przed renderem: **driving-check dłoni** (co robi każda dłoń w drivingu — jeśli wolna manipuluje obiektem, popraw klatkę startową albo fragment drivingu). Scena mc → `n:2`.

## (4) OmniHuman 1.5 — ekspresja + tożsamość, jeden egzemplarz
Model: `omnihuman`. `image_url` (klatka nano) + `audio_url` (kwestia + 0,6 s pad) + `prompt` + `resolution:"1080p"`.

```
Prompt:
{emocja per scena — np. "skeptical deadpan, one raised eyebrow" / "bursts into genuine delighted laughter, eyes crinkle"};
gaze moves between camera and the device, not a fixed stare. warm brown eyes ({KARTA.identity.eye_color}).
EXACTLY ONE {KARTA.product.nazwa}, the other hand keeps its role. The product keeps its exact shape.
{ANTI}  ->  ANTI = "Natural blinking, tiny handheld camera wobble, natural skin texture, no robotic gestures, raw unedited smartphone selfie video."
```
Scena omnihuman → `n:2`. „warm brown eyes" OBOWIĄZKOWE (OmniHuman zmienia kolor oczu).

## (5) AUDIO — payloady
**VO — ElevenLabs v3.** Model: `fal-ai/elevenlabs/tts/eleven-v3`. Payload `{text, stability?, voice?}` (`stability` domyślnie ~0.35 — niżej = więcej ekspresji, wyżej = stabilniej); wynik = `res['audio']['url']`.
- Głosy sprawdzone: **„Aria"** (kobiecy PL), **„Bill"** (męski PL).
- Tagi emocji w `text`: `[skeptical]` / `[gasp]` / `[laughs]` / `[pause]` (i dłuższe pauzy przez `[pause]`).
- Tempo ~**14 znaków/s** — z tego licz długość sceny mówionej (kwestia + 0,6 s pad).

**Muzyka — Stable Audio 2.5.** Model: `fal-ai/stable-audio-25/text-to-audio`. Payload `{prompt, seconds_total, num_inference_steps:8}`; wynik = `res['audio']['url']`; koszt **$0.20**.
- Łuk dynamiki (dip w suspensie, drop/pik na reveal) opisuj w `prompt` **czasami względem WŁASNEJ osi montażu** (np. „builds tension for the first 6s, then a hard drop at ~7s"), nie względem oryginału.

---

## Ściąga podstawień KARTY
`{KARTA.product.anatomy_str}` · `{KARTA.product.functional_count}` · `{KARTA.product.exactly_one}` · `{KARTA.product.forbidden_leaks}` (→ `negative_extra`) · `{KARTA.product.hsv_color}`/`{KARTA.product.hsv_ranges}`/`{KARTA.product.cv_reliable}` (→ bramka CV) · `{KARTA.product.fluid}` (→ `{PHYSICS_FLUID}`) · `{KARTA.scenography.layout}`/`.swiatlo` · `{KARTA.grammar.physics}`/`.action_steps`/`.both_hands` · `{KARTA.identity.face_ref}`/`.eye_color` · `{KARTA.screens_and_text}`.

### Regula briefu muzycznego (feedback Tomka 18.07: "muzyka ledwo slyszalna, ma dawac emocje")
Podklad reklamowy = WYRAZNY BEAT OD SEKUNDY 0 i przez caly czas ("punchy kick and crisp snare
driving CONSTANTLY", "radio-ready punchy mix"). ZAKAZ w promptach: lo-fi, ambient, chill,
mellow, soft — te gatunki maja rzadkie sekcje, ktore w miksie brzmia jak cisza mimo loudnorm.
Prompt zawsze konczymy: "absolutely no vocals, NO lo-fi, NO ambient". Miks (montaz.py v2):
music_gain 0.65 + loudnorm I=-16 na wejsciu muzyki + ducking ratio 3/release 250 (muzyka
wraca miedzy zdaniami); dip_gain 0.30; parametry per kreacja w AUDIO_CFG.
