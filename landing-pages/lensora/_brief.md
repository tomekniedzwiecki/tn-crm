# Design Brief — LENSORA

<!-- Inteligentne okulary AI: tłumaczenie 144 języków + open-ear audio. Workflow d092971d-51da-452a-915b-0c55ffcc06d5 -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **„Open Signal" — inżynieryjna swoboda** (operacyjnie pod Style Lock = panoramic-calm, patrz sekcja 10)

**Uzasadnienie wyboru:** Produkt sprzedaje emocję „świat zostaje dla Ciebie otwarty" — open-ear audio (nie odcinasz się od ulicy) + tłumaczenie wprost do ucha (nie odcinasz się od rozmówcy). Łączę tech-precyzję (granat, Space Grotesk, monospace spec-labels) z ciepłem ludzkich momentów (amber) i jednym sygnaturowym motywem fali dźwiękowej (mint). To NIE zimny gadżet ani neonowy gaming.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Bang & Olufsen** — fotografia produktu na ciepło-neutralnym tle + jedyny ornament to szczotkowany metaliczny detal; premium audio bez krzykliwości.
2. **Apple (strona AirPods Pro)** — rytm „jedna wielka liczba na funkcję" + dużo światła + produkt unoszący się nad czystym gruntem (jeden cień jako kotwica).
3. **Teenage Engineering** — Space Mono spec-labels jako „mebel UI" (etykiety jak częstotliwości / `FIG. 0X`), technical-diagram framing wokół produktu.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #1E2D4D — Sapphire Deep (granat, głębia/zaufanie, struktura)
- **Ink (główny tekst):** #11141B — Obsidian
- **Paper (tło):** #F4F1EC — Bone Light (ciepła kość; header zawsze #FFFFFF — safety #9)
- **Accent / Gold (opcjonalny):** #6FE3D3 — Audio Mint (sygnał/fala) + #D89248 Amber Warmth (CTA, ciepło)
- Neutral mid: #7A7E89 Steel Mid (podpisy, meta)

> 60/30/10: 60% Bone Light/biel · 30% Sapphire Deep · 10% Audio Mint + Amber (TYLKO: sygnaturowa fala, CTA, frequency-labels).

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Space Grotesk (500/600/700) — geometryczne, „panel przyrządowy"
- **Body (treść):** Inter (400/500/600/700) — neutralny, poprawne PL
- **Mono / Caption:** Space Mono (400/700) — spec micro-data, frequency-labels (`144 JĘZYKI`, `Nº 03`, `FIG. 01`)

> Google Fonts BEZ `&subset=latin-ext` (safety #10, verify #19). Wszystkie 3 fonty mają poprawne „Ł" UPPERCASE. Max 3 — OK.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Tomasz — 30–48, właściciel firmy / wyższy menedżer, duże miasto, częste podróże służbowe i targi międzynarodowe. (Wtórna: Marta, 24–36, rowerzystka miejska / freelancerka.)
- **Kluczowy pain point:** stres i utrata kontroli podczas rozmowy w obcym języku; niezręczność ciągłego sięgania po telefon z Google Translate — niszczy kontakt wzrokowy i powagę. (Marta: ból uszu od słuchawek dokanałowych + strach przed potrąceniem — nie słyszy ulicy.)
- **Kluczowa motywacja zakupu:** swoboda i status „obywatela świata" — rozmawiać patrząc partnerowi w oczy, bez bariery, bez gadżetowego cyrku. Plus minimalizm „wszystko w jednym".
- **Cytat persony:** „Na spotkaniu w Szanghaju pierwszy raz nie sięgnąłem po telefon. Patrzyłem partnerowi w oczy, a tłumaczenie miałem w uchu — to zmieniło ton całej rozmowy."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** vitrix — Panoramic Calm (tech premium, ten sam Style Lock). **Czego unikam:** NIE kopiuję Plus Jakarta + Instrument Serif + paper/navy/teal vitrixa. Lensora ma własny stack Space Grotesk/Inter/Space Mono i własną paletę (Sapphire #1E2D4D / Amber / Mint #6FE3D3 na Bone Light) + sygnaturę open-ear waveform. Branding klienta wygrywa nad domyślnymi fontami stylu (Krok 4.4).
- **Już istnieje:** vibestrike — Retro-Futuristic (neon on black). **Czego unikam:** mimo że to też tech, NIE idę w neon/glitch/dark-hero. Lensora jest jasna, inżynieryjna, premium — nie gamingowa.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (B&O, Apple, Teenage Engineering)
- [x] Czy odwracając logo nadal zgaduję branżę? (waveform + frequency-labels + okulary = audio/tech)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (biznesmen-podróżnik + rowerzystka miejska — unikalna para)
- [x] Czy manifest da się zacytować bez „premium/luxury/wysoka jakość"? (tak — „słyszysz ulicę i rozmówcę naraz")

## 8. Signature element

**Open-ear waveform** — sygnaturowa, kierunkowa fala dźwiękowa (koncentryczne łuki + equalizer-bars w Audio Mint #6FE3D3), która „płynie" w stronę ucha i NIGDY się w pełni nie zamyka (wizualna metafora open-ear: zostajesz połączony ze światem). Powtarza się: animowane łuki w tle hero (SVG „open-ear audio field"), divider między sekcjami, oraz mikro-motyw przy numerach sekcji renderowanych jako frequency-labels w Space Mono (`Nº 01`). System: Sapphire = struktura, Amber = CTA/ciepło, Mint = sygnał audio.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez allowed_variants w Style Lock)

> panoramic-calm allowed: hero [H3,H2,H9] · features [F4,F1] · testimonials [T2,T1]

- **Hero:** H3 Dashboard mockup — Lensora paruje się z aplikacją tłumaczącą; mockup telefonu z live-tłumaczeniem + open-ear waveform = naturalny hero-wow i natywny signature primitive panoramic-calm.
- **Features:** F1 Bento 2×2 — 4 mieszane funkcje (tłumaczenie / open-ear audio / TR90+UV400 / aplikacja); bento z jednym featured tile lepiej obsługuje mix hardware+software niż F4 (4 mockupy app, gdy tylko 1 funkcja jest app).
- **Testimonials:** T1 Voices quote grid — dwie persony + podróżnik dają autentyczny grid głosów; Lensora nie jest mierzalnym before/after, więc T2 odpada.

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `panoramic-calm`
- **Plik:** `docs/landing/style-atlas/panoramic-calm.md`

> **Decyzja o nadpisaniu (transparentnie):** deterministyczny algorytm Atlas dał `brutalist-diy` (3/7 przez tie-break alfabetyczny, bo top-1 retro-futuristic 4/7 to anti-ref vibestrike). brutalist-diy WYMUSZA Times New Roman, RGB-primaries (#FF0000/#0000FF), zero gradientów i punkowy ton zakazujący słowa „premium" — co TWARDO konfliktuje z zaakceptowanym przez klienta brandingiem (Space Grotesk/Inter/Space Mono, navy/amber/mint, pozycjonowanie premium-mid). Procedura Krok 4.4: **branding ma priorytet, dostosuj manifesto**. Z dwóch uczciwych kandydatów 3/7 (clinical-kitchen vs panoramic-calm) wybrano **panoramic-calm** — bo Lensora jest `public` (noszona na twarzy = status), `future`, `precision`, sprzedaje przestronny premium + emocję swobody (nie KPI-dashboard density, którą Scrollability Rules odradzają). Fonty/paleta z brandingu nadpisują domyślne panoramic-calm (Plus Jakarta/Instrument Serif/teal).

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: dual (robi ciężką pracę tłumaczenia + jest noszonym obiektem-rytuałem)
- Precision↔Expression: **precision** (specyfikacja inżynieryjna = produkt)
- Evidence↔Feeling: blend (twarde specy + emocja statusu/swobody)
- Solo↔Community: dual (noszony solo, ale killer-use to rozmowa Z innymi)
- Quiet↔Loud: moderate (premium-tech mówi pewnie, nie krzyczy)
- Tradition↔Future: **future** (AI wearable, app, real-time)
- Intimate↔Public: **public** (noszony na twarzy jako status/identyfikacja)

Match z panoramic-calm: 3/7 (precision, future, public). Argumentacja: spośród uczciwych kandydatów 3/7 panoramic-calm trafia w 3 najbardziej definiujące Lensorę osie (precision/future/public) i daje przestronny tech-premium pasujący do „inżynieryjnej swobody", bez clinical-kitchen `intimate` i jego gęstości KPI.

### 10.3 MUSZĄ być użyte
- Font display: **Space Grotesk** (override brandingowy zamiast Plus Jakarta)
- Font body: **Inter** · Mono/eyebrow: **Space Mono** (zamiast Instrument Serif)
- Paleta (min 3 z 5): #1E2D4D, #6FE3D3, #D89248 (+ #F4F1EC, #11141B)
- Layout DNA: **panorama wide** — szerokie obrazy (16:9/21:9) + **dashboard mockup hero** + architektoniczna siatka
- Signature primitive #1 obecny: dashboard mockup hero split (+ wide panoramic hero images)
- Section architecture min: **14 sekcji**

### 10.4 NIE WOLNO użyć
- **Fonty:** NIE Plus Jakarta / Instrument Serif (override → Space Grotesk/Inter/Space Mono); NIE Times New Roman; NIE Italiana
- **Layout:** NIE wąskie kadry zamiast panoramicznych; NIE editorial/cottagecore warmth
- **Elementy:** NIE neon/glitch/dark-everything (to vibestrike); NIE ikony ✓/✗ w comparison
- **Kolory:** NIE teal #08A5A5 vitrixa (mam własny mint #6FE3D3); NIE czyste #000 w dark sekcjach (używam Obsidian #11141B)
- **Motion:** brak zakazów — panoramic-calm dopuszcza split/counter/magnetic/tilt

### 10.5 Section Architecture (panoramic-calm sekcja 8)
Required (min 14): Header, Mobile Menu, Hero, Trust Bar, Problem, Solution, How It Works, Comparison, Testimonials, FAQ, Offer, Final CTA, Footer, Sticky CTA (+ Cookie Banner, FAQ accordion).

### 10.6 Motion Budget (panoramic-calm sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-split, .js-counter, .magnetic, .js-tilt]
js_effects_count: { counter_min: 2, magnetic_min: 2, tilt_min: 2 }
js_effects_forbidden: []   # nic — moderate
```

---

## 11. Wow Moments (audyt z ETAP 4)

### Wow Moment 1
- **Strefa:** hero zone
- **Lokalizacja:** sekcja Nº 01 — Hero
- **Element:** Live „open-ear audio field" — SVG/CSS schemat głowy w okularach z dwoma kierunkowymi łukami dźwięku (Audio Mint #6FE3D3) płynącymi do ucha + półprzezroczysty klin „świadomości ulicy", który zostaje OTWARTY; podpisy w Space Mono (`FIG. 01 — OPEN-EAR DIRECTIONAL · 0 dB blokady ucha`). Zamiast generycznego renderu produktu — schemat wizualizujący jedyne największe USP (bezpieczeństwo = wciąż słyszysz auto).
- **Czemu unique:** marki eyewear/audio (Ray-Ban Meta, Bose Frames) używają w hero glossy renderów; techniczny diagram open-ear jest nieprzenoszalny na inną markę.
- **Implementation status:** ❌ planowany (ETAP 2/4)

### Wow Moment 2
- **Strefa:** mid zone
- **Lokalizacja:** sekcja Nº 06 — Comparison
- **Element:** Comparison jako pionowa oś czasu JEDNEGO momentu rozmowy, nie tabela. Dwa wiersze na siatce 3fr/2fr: „Telefon w dłoni" (niezręczna pauza, telefon między twarzami) → „Lensora" (kontakt wzrokowy, tłumaczenie w uchu) — połączone jedną pionową linią Amber #D89248 ze znacznikami Space Mono (`00:00 → 00:01.2 latency`). Bez ✓/✗.
- **Czemu unique:** strony translatorów domyślnie robią macierz checkmarków; tu jest przeżyty 1,2-sekundowy moment nieprzerwanej rozmowy = „Patrzysz, słuchasz, rozumiesz" dosłownie.
- **Implementation status:** ❌ planowany (ETAP 2/4)

### Wow Moment 3
- **Strefa:** conversion zone
- **Lokalizacja:** sekcja Nº 09 — Oferta (offer box)
- **Element:** Animowany border-beam (gradient Audio Mint → Amber) okrążający kartę Bestseller (599 zł, 2x). Karta Bestseller renderowana jako ciemna Obsidian #11141B „premium tech" (dark card dla >500 zł tech), dwie boczne karty pozostają Bone Light. Jedna karta dosłownie „włączona" — sygnał produktu okrążający perymetr.
- **Czemu unique:** jedyny sankcjonowany animowany element; beam mint→amber reużywa dokładnie dwie role akcentów Lensory (audio + ciepło), więc „power-on" czyta się jak sygnał produktu — nieprzenoszalny na inną markę.
- **Implementation status:** ❌ planowany (ETAP 4)
