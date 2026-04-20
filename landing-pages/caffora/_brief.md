# Design Brief — Caffora

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] **Nowy: „Brass Ritual"** — espresso premium dla nomadów. Połączenie japońskiej precyzji outdoor (Snow Peak), włoskiej kultury kawy (Bialetti) i kamerowej estetyki (Leica). Espresso jako rytuał codziennej dyscypliny, nie jako turystyczny gadżet.

**Uzasadnienie wyboru:** Caffora nie pasuje do żadnego z 6 presetów. Kafina (Rugged Heritage) to workwear/warsztat — Caffora jest premium-tech rytualne, nie heritage-rugged. Paromia (Editorial/Luxury) to AGD do salonu — Caffora jest mobilna outdoor. Vitrix (Panoramic Calm) to architectural tech do mieszkania — Caffora opuszcza dom. Wymyślam własny kierunek.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Snow Peak** (japońskie premium outdoor) — pożyczam: matt black tools z brass detalami, czysta inżynierska typografia spec'ów (kPa, gramy, godziny). Anti-aesthetic gadżetu, pro-aesthetic instrumentu.
2. **Bialetti** (włoska kawa heritage) — pożyczam: warm espresso-brown paleta, romantic copy o rytuale porannej kawy, editorial mood (nie marketing-y).
3. **Leica** (kamery premium) — pożyczam: dark hero z dramatic spotlighting produktu, restrained typography (silent serif headers, mono spec captions), precision-grade product photography style.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent mosiądz):** #9C6B3E
- **Ink (główny tekst):** #1A1A1C
- **Paper (tło):** #F5EFE6
- **Accent / Cream (subtelne tła sekcji):** #E8D5B7
- **Charcoal (sekcje ciemne dramatyczne):** #2D2A27
- **Warm gray (secondary text):** #7A6F66

## 4. Typografia (dobrana pod manifest)

- **Display (nagłówki):** Fraunces (italic na kluczowych słowach + dramatic numerals w hero). `&display=swap&subset=latin-ext`. Polskie „Ł" sprawdzone OK (safety #7).
- **Body (treść):** Inter — czytelna sans-serif, neutralna, dobrze renderuje polskie znaki.
- **Mono (spec values):** Space Mono 700 — dla `20 BAR · 230°C · 1.2 KG` w spec sheet.

> Max 3 rodziny ✅. Wszystkie Google Fonts z `&subset=latin-ext`.

## 5. Persona główna (z brand_info description + audytu)

- **Wiek / zawód / status:** 35-50 lat, głównie mężczyzna, zamożny średnio (luxury hobby). Architekt / przedsiębiorca / wolny zawód który łączy pracę z podróżami. Może też kierowca-nomada (długi dystans, kabina TIR jako biuro).
- **Kluczowy pain point:** „Jestem 800 km od domu i mam dość kapsułkowej kawy z automatu. Nie zostawię swojego rytuału w domu tylko dlatego że pojechałem w teren."
- **Kluczowa motywacja zakupu:** zachowanie codziennej dyscypliny rytuału (poranne espresso = poczucie domu), niezależność od infrastruktury (nie potrzebuję baru/hotelu), premium narzędzie zamiast gadżetu turystycznego.
- **Cytat persony:** „Dobrego poranka nie zostawia się w domu."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzasz)

- **Już istnieje:** `landing-pages/kafina/` — kierunek Rugged Heritage (Filson/Red Wing/Yeti workwear vibe). To NIE Caffora.
- **Czego unikam (signature elements istniejących landingów):**
  - **NIE** kopiuję stamp badges typu „Cat. Nº 01" / „LOT 2026" z kafiny — to workwear-catalog estetyka, Caffora jest editorial-camera estetyka
  - **NIE** kopiuję dark hero w stylu „parking 4:30" / „kabina TIRa" z kafiny — Caffora ma dark hero w stylu „studio Leica" (czysta produktowa fotografia z dramatycznym światłem, nie outdoor reportaż)
  - **NIE** używam Archivo 800 (kafina Rugged) — wybieram Fraunces (editorial precision z włoskim ciepłem)
  - **NIE** kopiuję paromia editorial/luxury — Caffora jest mobilna, outdoor-capable, to nie salon 18. piętro
  - **NIE** kopiuję vitrix Plus Jakarta + Instrument Serif — Caffora ma własną typografię i deep charcoal hero zamiast paper/navy

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? — Snow Peak, Bialetti, Leica wszystkie SPOZA e-commerce landingów
- [x] Czy odwracając logo nadal zgaduję branżę? — TAK, brass + dark hero + oversized „20" + włoskie copy o rytuale espresso jednoznacznie sugeruje premium kawa-narzędzie
- [x] Czy persona NIE pasowałaby do innego baseline'u? — TAK. Persona Caffory (digital nomad + outdoor enthusiast 35-50, premium hobby) nie pasuje ani do kafiny (kierowca-rzemieślnik), ani paromii (lifestyle salon), ani vitrix (architekt 18. piętro)
- [x] Czy manifest da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — TAK: „mosiężny rytuał. Włoska precyzja espresso w japońskim narzędziu outdoor. Kamera Leica w świecie kawy."

## 8. Signature element

> **Oversized brass numerał „20" z subskryptem „BAR"** w hero — Fraunces italic, 320-440px (clamp), color `#9C6B3E` z subtelnym blaskiem brass na deep charcoal `#1A1A1C` background. Jak fotografia produktu Leica: dramatic spotlighting, jeden mocny element, cisza wokół.

Dodatkowo: **Nº 01-10 w nagłówkach sekcji** w Space Mono 700 12px uppercase (jak strony katalogu fotograficznego premium) — zamiast generycznych „Funkcje" / „Jak to działa".

---

## Mapowanie manifesto → decyzje ETAP 4 (Krok 7)

| Decyzja | Wartość |
|---|---|
| Hero background | `#1A1A1C` deep charcoal z subtelnym brass vignette w prawym dolnym rogu |
| Hero headline font | Fraunces 600, italic em na „bez adresu" |
| Hero headline style | regular + italic em (na frazach kluczowych) |
| Signature element HTML | `<div class="hero-numeral">20<sup>BAR</sup></div>` Fraunces italic clamp(320px, 28vw, 440px), color `#9C6B3E` |
| Dark section rytm | Hero + Spec Sheet + Final CTA = ciemne (#1A1A1C). Reszta = paper #F5EFE6 z cream #E8D5B7 akcentami |
| Animacja hero | Subtle: brass numerał faintly pulsing opacity 0.85→1.0 (4s loop) + grain texture overlay (paper grain) |
| Border-radius globalny | 4px (precyzja, instrument, NIE bouncy) |
| Shadow styl | Brass-tinted warm: `0 12px 32px rgba(156, 107, 62, 0.15)` |
| Divider między sekcjami | Numbered: `Nº 01 — RYTUAŁ` w Space Mono 700 12px, NIE linie |
