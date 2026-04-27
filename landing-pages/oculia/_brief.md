# Design Brief — Oculia

> Inteligentny masażer oczu (TH-823): grafen 38–42°C, presoterapia, Bluetooth, 5 trybów, 1200 mAh.
> Pozycja: affordable luxury (249–349 PLN) między dropshipping ($50–80) a premium ($450–800).
> Estetyka: **Editorial Print** — paper/ink/gold + sage, Fraunces editorial numerał, Nº magazine numbering.
> Narracja: 14-dniowa transformacja (przed/po metryki) z poetycką oprawą rytuału.
> *Historia: pierwotny pick clinical-kitchen + PAS (commit 123372d) — przeprojektowany na żądanie do editorial-print 2026-04-27.*

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [x] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia) — **wybrany**
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [ ] Nowy:

**Uzasadnienie wyboru:** brand_info Oculia jest editorial-poetic ("Spokój widać w spojrzeniu... Zamknij oczy. Oddychaj. Wróć."), branding fonty Fraunces + Cormorant Garamond + Inter są fontami editorial baseline. Produkt to wellness ritual (15 minut codziennie), nie gadget tech. 14-dniowa transformacja skronie pulsujące → wracam do roboty pasuje do narracji editorial premium, gdzie liczby (87% redukcji bólu) są prezentowane jako figury z figcaption — nie jako KPI dashboard.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Aesop** *(original site, pre-2022)* — apothecary-editorial, paper cream, Fraunces-like serif, magazine numbering, figure+figcaption pod każdą zdjęciem produktu, ascetyczna kompozycja
2. **Byredo** — luxury fragrance, Fraunces italic display, paper/ink kontrast, oversized numerale w hero, 1-słowo per linijka editorial copy
3. **Kinfolk magazine** — editorial layout, Cormorant accent, ivory paper, pełen white space, slow-living photography z naturalnym światłem bocznym

## 3. Paleta (z workflow_branding type=color, dostosowana do Editorial Print 60/30/10)

- **Paper (dominant — tło, 60%):** #F5F1EA (cream warm — branding cream)
- **Ink (główny tekst, 30%):** #1F2420 (branding ink)
- **Gold / Accent (rare highlight, 10%):** #C88B65 (warm copper z brandingu — pełni rolę gold w editorial)
- **Sage / Support 1 (brand primary, hover/CTA):** #4F6E5C
- **Slate / Support 2 (rule lines, captions):** #A5AFA8

> Lavender #A394C4 z brandingu zostaje pominięty (editorial używa max 4 odcieni — sage zastępuje). Paper cream #F5F1EA wraca jako dominant (Editorial Print SIGNATURE).

## 4. Typografia (zgodna z brandingiem oryginalnym + Style Lock)

- **Display (nagłówki):** **Fraunces** 400/500/600 + italic — `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,500;0,600;1,300;1,400&display=swap`
- **Body (treść):** **Inter** 400/500/600 — `family=Inter:wght@400;500;600&display=swap`
- **Accent (Nº numbers, eyebrow, italic figcaption):** **Cormorant Garamond** 300/400 italic — `family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap`

> Polskie diakrytyki: Fraunces ✅, Cormorant Garamond ✅, Inter ✅ (memory feedback-landing-fonts-polish.md). Italiana ❌ — NIE.
> NIE dodawaj `&subset=latin-ext` (Google Fonts v2 anty-wzorzec).
> Max 3 rodziny fontów = 3 (limit).

## 5. Persona główna (z report_pdf — Awatar 1: Managerka Magda)

- **Wiek / zawód / status:** 30–45, manager korporacyjny lub własna firma, 8–10h dziennie przed monitorem, dochód powyżej średniej krajowej, mieszka w mieście
- **Kluczowy pain point:** Cyfrowe zmęczenie wzroku: pieczenie po 7. godzinie pracy, wieczorne pulsujące bóle skroni, suchość oka, cienie pod oczami przed wideokonferencją. Nie ma czasu na wizytę u fizjoterapeuty.
- **Kluczowa motywacja zakupu:** Szuka 15-minutowego rytuału wellness, który zwraca jej spokój i estetyczny wygląd przed ważnym spotkaniem. Kupuje "personal sanctuary" + status spokojnego luxury — nie tani gadget z marketplace'u.
- **Cytat brzmiący jak wypowiedź persony:** „Wieczorem nie chcę kolejnej aplikacji do medytacji. Chcę zamknąć oczy, poczuć ciepło i wrócić. Po dwóch tygodniach nie pamiętam jak długo skronie pulsowały."

## 6. Anty-referencje (co JUŻ JEST w landing-pages/)

- **Już istnieje:** `paromia/` — **Editorial Print baseline** (Fraunces + paper/ink/gold + Nº numerale w hero); `vitrix/` Panoramic Calm; `h2vital/` Organic Natural; `lunatherma/`, `kineso/` — wellness-tech.
- **Czego unikam (specifikacja signature elements istniejących):**
  - NIE kopiuję paromia hero numerału `26<sup>sek.</sup>` — moje to **15** (minut sesja, nie sekund parownicy) z innym layoutem (split right column z packshot)
  - NIE kopiuję paromia gold #C9A961 — używam #C88B65 (warm copper z brandingu, cieplejszy odcień)
  - NIE kopiuję paromia dark trust strip — używam light paper trust panel
  - NIE replikuję żadnego specyficznego layoutu paromii — moje sekcje (problem chart, persona portraits) są zaprojektowane od zera dla wellness ritual
  - NIE generic "Magazine Issue" press logos w testimonials (paromia stylem) — moje testimonials = 3 voices T1 grid

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? → Aesop *(skincare, retail+e-com hybrid, editorial heritage)*, Byredo *(luxury fragrance, niche house)*, Kinfolk *(magazine, content brand)*. Wszystkie editorial-first, nie pure DTC.
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? → Tak: Fraunces italic numerał + paper cream + figure+figcaption + Nº numbering = wellness-luxury ritual niezależnie od logo.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? → Magda nie pasuje do pupilnik (pet-playful), kafina (workwear), vibestrike (gaming). Mogłaby pasować do vitrix (Panoramic Calm) — ale tu kupuje rytuał poetycki, nie "architectural tech showcase".
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? → Tak: „Piętnaście minut. Ciepła ciemność. Grafen 38–42°C. Skronie odpuszczają. Wracasz."

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:** **Oversized italic numerał `15` w tle hero** (Fraunces italic, 280–440px clamp, color paper-3 tone-on-tone), spadający z prawej krawędzi za packshotem. Dodatkowo: **Nº magazine numbering per sekcja** (Nº 01 — RYTUAŁ / Nº 02 — DOWÓD / Nº 03 — METAMORFOZA) w Cormorant Garamond italic 13px z letter-spacing 0.2em. To podpis Oculii: nie KPI dashboard, tylko jedna cyfra-sygnatura "15" jako mantra rytuału + numeracja sekcji jak rozdziały magazynu.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez Editorial Print allowed_variants)

- **Hero:** **H4 Editorial numerał** — oversized italic Fraunces "15" w tle + headline + packshot
- **Features:** **F2 Bento asymetryczny** — 4 tile, jeden featured large (Grafen 38–42°C jako hero feature) + 3 mniejsze
- **Testimonials:** **T1 Voices quote grid** — 3 voices z avatarami (zachowuję Magdę / Sarę / Edwarda z transformation narrative przed/po)

---

## 10. STYLE LOCK — wybrany styl z Atlas

### 10.1 Wybrany styl
- **Style ID:** `editorial-print`
- **Plik:** [`docs/landing/style-atlas/editorial-print.md`](../../docs/landing/style-atlas/editorial-print.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **ritual** (15 min codzienna sesja, "rytuał odcięcia się")
- Precision↔Expression: **expression** (poetic brand_info, "deprywacja sensoryczna", "sanktuarium")
- Evidence↔Feeling: **mixed** (są liczby — 38°C, 90% — ale wrappujemy je w narrację rytuału)
- Solo↔Community: **solo** (rytuał indywidualny, deprywacja sensoryczna, intymna ciemność)
- Quiet↔Loud: **quiet** (wellness, calm tones, cisza muzyki Bluetooth)
- Tradition↔Future: **mixed** (grafen + Bluetooth = future tech, ale rytuał + ciemność = tradition)
- Intimate↔Public: **intimate** (zakładasz na twarz, w ciemności, dom/biuro)

Match z editorial-print: **5/7** (precision↔expression: editorial=expression ✅; evidence↔feeling: editorial=feeling, my=mixed; tradition↔future: editorial=tradition, my=mixed; reszta match). Argumentacja: editorial-print = Aesop/Byredo wellness aesthetic, Oculia ma wszystkie cechy tej kategorii — ritual, solo, quiet, intimate, expression — z tylko 2 mismatch na evidence↔feeling i tradition↔future (oba "mixed" w produkcie, "feeling/tradition" w stylu).

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: **`Fraunces`** 400/500 (italic enabled) w `font-family`
- Font accent: **`Cormorant Garamond`** 300/400 italic (Nº eyebrow, Nº numbers, italic captions)
- Font body: **`Inter`** 400/500
- Paleta paper #F5F1EA + ink #1F2420 + gold #C88B65 jako dominant/secondary/accent
- Signature primitive #1: **Nº eyebrow** (np. `Nº 03 — RYTUAŁ`) — min 5 sekcji
- Signature primitive #2: **Oversized italic numerał** w tle hero (Fraunces italic 280–440px)
- Signature primitive #3: **Figure + figcaption** pod hero figure (Cormorant italic caption)
- Signature primitive #4: **Magazine page numbers per sekcja** (Nº 01–10 z italic styling)
- Signature primitive #5: **Dark trust strip** z ikonami w kółkach (ink background, gold accent)
- Min 14 sekcji (full architecture)

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `IBM Plex Sans/Mono`, NIE `Italiana` (memory: Ł obcięte UPPERCASE), NIE `Archivo Black`, NIE `Caveat`, NIE `Fredoka One`
- **Kolory:** NIE clinical lab white `#F7F9FB` (paper cream zamiast), NIE chłodne tony `#0A1420`, NIE neonowe akcenty
- **Layout:** NIE KPI dashboard hero (clinical-kitchen primitive), NIE chart-compare jako primary visual (akceptowalne w small role w problem)
- **Elementy:** NIE technical illustration callouts, NIE instrument-panel trust strip, NIE warning-amber border-left na cards
- **Motion:** akceptowalne ALL effects (editorial wymaga moderate budget)

### 10.5 Section Architecture (z pliku stylu sekcja 8)
**Required (min 14):** Header, Mobile Menu, Hero, Trust Bar, Problem, Solution/Bento, How It Works, Comparison, Testimonials, FAQ, Offer, Final CTA, Footer, Sticky CTA.
**Forbidden:** brak (editorial używa wszystkich standardowych sekcji).

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required:
  - .fade-in
  - .js-split            # split headline reveal hero h1
  - .js-parallax         # parallax editorial numerale
  - .magnetic            # primary CTA, offer CTA
  - .js-tilt             # bento tiles
  - .js-counter          # min 2 (spec liczby, savings badge)
js_effects_count:
  split_min: 1
  counter_min: 2
  magnetic_min: 2
  tilt_min: 2
  parallax_min: 1
```

---

## 11. CONVERSION NARRATIVE (historyczny, niewymuszany verifyem od v4.0 cofnięcia)

> Sekcja zostaje jako dokumentacja. Pierwotny pick: `pas`. Po przeprojektowaniu na editorial-print kierunek narracji = **transformation-promise** (14-dniowy „przed/po"), bo PAS (drama bólu) kłóci się z editorial luxury. Manus zachował copy z poprzedniej iteracji — zostawiamy obecne sentences, ale frame editorial-quiet (mniej agitacji, więcej rytuału).

**Kierunek narracji:** transformation-promise — *„Przed: 7 godzin pulsujących skronie. Po 14 dniach: 15 minut. Wracasz."* Stats z chart-compare (87% redukcji bólu skroni, 68% mniej nocy z bólem) zostają, ale prezentowane jako figures w editorial frame, nie jako bar charts dashboard.

**Hero formula (editorial wariant):**
```
Eyebrow: „Nº 01 — RYTUAŁ"
H1: „Piętnaście minut. <em>Ciepła ciemność.</em> Wracasz."
Sub: „Po 7 godzinach przed monitorem skronie pulsują. Po 14 dniach Oculii — 15 minut, i nie pamiętasz jak to było. Grafen 38–42°C, presoterapia, 5 trybów."
Primary CTA: „Odbierz Oculię — 299 zł"
Secondary signal: 4.8/5 z 1 247 opinii · 30 dni testu
```

**Section sequence (editorial frame):**
- Header → Hero z Nº 01 + numerał 15
- Trust strip (dark, gold ikony)
- Nº 02 — DOWÓD (problem section z chart-compare ale w editorial layout)
- Nº 03 — METAMORFOZA (solution reveal: „Dlatego stworzyliśmy Oculię" + spec list)
- Nº 04 — TECHNOLOGIA (4 features bento F2 asymetryczny)
- Nº 05 — RYTUAŁ (3 kroki how it works z editorial Nº numerale per krok)
- Nº 06 — VS (comparison)
- Nº 07 — GŁOSY (testimonials T1 z 3 voices przed/po)
- Nº 08 — PYTANIA (FAQ)
- Nº 09 — ZAMÓWIENIE (offer)
- Final CTA → Footer
