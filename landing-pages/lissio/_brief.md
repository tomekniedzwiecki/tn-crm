# Design Brief — Lissio

<!-- ETAP 1 DIRECTION - workflow 86cf7e46-828b-459e-abb1-68defcf84719 -->
<!-- Damian Dragon, parownica Lissio (rebrand Xiaomi MJGTJ02LF MJGTJ02LF) -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [x] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [ ] Nowy (opisz poniżej):

**Uzasadnienie wyboru:** Lissio to włoska nazwa od „liscio" (gładki) — produkt mierzy się z estetką jedwabiu, lnu i wiskozy, a brand_info expressis verbis prosi o magazyn-vibe („garderoba wita poranek gotowa"). Fonty w workflow (Fraunces + Inter + Cormorant Garamond) i paleta paper/ink/gold to dokładna sygnatura Editorial Print — 7/7 match z DNA Anchors.

**Kierunek własny:** „Milano Atelier" — Editorial Print z włoską nutą (atelier mody zamiast magazine quarterly).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Loro Piana** — pionowa typografia w sleeve label („cashmere · 100% · made in italy") jako szablon mikrocopy nad obrazem produktu. Pożyczam: cienkie capitals z dużymi tracking i dwukolorową stratyfikację (paper + cold gold).
2. **Bottega Veneta** (post-2019 redesign Daniel Lee) — sans-serif w bloku „Bottega" obok serif italic w body, fotografia z ciężkimi cieniami i kompozycje 60/40 nigdy 50/50. Pożyczam: cienie zamiast linii do separacji bloków, asymetria 60/40 w hero.
3. **Bracewell „The Gentleman's Magazine"** (UK editorial reset 2024) — magazine paginacja w stopkach sekcji ale jako pojedyncze duże numery (nie Nº xx · y/z). Pożyczam: oversize numeral w tle hero, ale TYLKO „26" + suffix „sec" zamiast „Nº xx" jak w paromii.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #C9A57C (warm gold — wpis 2 z brandingu)
- **Ink (główny tekst):** #2E2A26 (dark espresso — wpis 1)
- **Paper (tło):** #F5F1EA (cream — wpis 3)
- **Accent / Gold (opcjonalny):** #C9A57C — używany TYLKO w eyebrow, signature numeral, CTA, divider line

**Support:** #1A1A1A (czarne tło dark sekcji), #8B8278 (taupe — body secondary), #EFEAE2 (lighter paper for trust bar)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fraunces 400/500/600 (italic enabled) + `&display=swap&subset=latin-ext`
- **Body (treść):** Inter 400/500/600 + `&display=swap&subset=latin-ext`
- **Accent (eyebrow/numerals):** Cormorant Garamond 400/500 italic

> Fraunces vs Italiana: Fraunces ma pełny zestaw polskich diakrytyków (Ł, Ą, Ć, Ż) i wytrzymuje uppercase — safety #7.
> Max 3 rodziny fontów — OK.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Kobieta 29–36 lat, Warszawa/Wrocław/Poznań, menedżerka marketingu lub niezależna ekspertka, dochód powyżej średniej krajowej netto.
- **Kluczowy pain point:** Niedzielny stres przed prasowaniem koszul, świadomość że tradycyjne żelazko niszczy strukturę jej ulubionej jedwabnej koszuli, brak miejsca na deskę w mieszkaniu — czyste „nie chcę spędzać 40 minut w niedzielny wieczór z deską, ale w poniedziałek o 7:30 muszę wyglądać tak jakbym spała 9 godzin".
- **Kluczowa motywacja zakupu:** Chce zawsze wyglądać profesjonalnie bez wysiłku. Szuka urządzeń, które ułatwiają codzienne życie i jednocześnie dobrze prezentują się w nowoczesnym wnętrzu. Wyzwalacz: 60-sek wideo na Instagramie z influencerką wygładzającą lnianą sukienkę jednym ruchem.
- **Cytat brzmiący jak wypowiedź persony:** „Mam dziewięć jedwabnych koszul i ani jednej deski do prasowania w mieszkaniu. Lissio robi w 26 sekund to, na co przedtem rezerwowałam sobie niedzielny wieczór."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** `paromia/` (wino premium, Editorial/Luxury) — najbliższy wizualnie poprzednik. Również: `cremio/` i `oculia/` używały Editorial Print w 2026.
- **Czego unikam (signature elements istniejących):**
  - **paromia:** Nº eyebrow w formacie „Nº 03 — ATELIER", oversize italic numeral „5" (numeracja kolejnościowa magazyn). → Lissio używa „26" lub „SEC 26" jako numeral (specyfikacja techniczna, nie numer sekcji).
  - **cremio:** centered hero z drukowanym znaczkiem („cap stamp"). → Lissio idzie w 60/40 asymetryczne split, NIE centered.
  - **oculia:** sloganowy Cormorant italic w trust bar. → Lissio użyje Cormorant tylko w 2 miejscach (eyebrow „MILANO · ATELIER" + ozdobnik w manifesto sekcji), reszta to Fraunces.
  - **Wszystkie 3 użyły gold #C9A961 / #B68F4E.** → Lissio ma własny gold #C9A57C (warmer caramel, mniej żółty), z brandingu klienta — różny ton.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Loro Piana to luxury fashion offline-first; Bottega Veneta to runway; Bracewell to UK magazine)
- [x] Czy odwracając logo nadal zgaduję branżę? (oversized „26 sec" + włoskie eyebrow + Fraunces italic = nawet bez słowa „parownica" widać że to premium AGD/atelier mode)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (Marta-estetka NIE pasuje do Rugged Heritage / Playful / Retro-Futuristic; tylko Editorial/Luxury daje magazine vibe którego oczekuje)
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (Tak — manifest poniżej operuje na „atelier", „cisza", „26 sekund", „włoski drift" — bez generic luxury slop)

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:**

Monumentalna liczba **„26"** w Fraunces 400 italic, 320–520px font-size, kolor `#C9A57C` z opacity 0.18 — wkomponowana w hero jako tło (parallax `data-speed=0.15`). Pod nią mała kursywa „sekund · una stanza, una camicia" (Cormorant Garamond 14px italic). Numeral pojawia się ponownie w jednym miejscu landinga: w sekcji „Solution" jako podpis nad timeline „26 sec ritual" — symboliczne domknięcie. Nigdzie więcej.

Powód że to konkretne, nie generic:
1. Liczba „26" pochodzi z realnej specyfikacji produktu (czas do generowania pary), nie z designu — to zakotwiczone w fakcie.
2. Suffix „sec" + włoski tagline „una stanza, una camicia" (jeden pokój, jedna koszula) = signature jednoznacznie włoski, nie magazine-generic.
3. Wraca dokładnie raz w środku landinga — nie spam, jeden moment domknięcia.

---

## 9. Warianty sekcji (z [`section-variants.md`](../../docs/landing/reference/section-variants.md), LIMITED przez allowed_variants w Style Lock)

- **Hero:** H4 Editorial Numerał — oversized „26" italic Fraunces, parallax. **Argumentacja:** liczba „26 sek" to JEDYNA mocna liczba speca która sprzedaje (nie 30 kPa — to dla geeka, nie dla Marty). H4 wymusza by liczba była heroinką, nie ozdobą.
- **Features:** F2 Bento mix (3 duże kafle pionowe + 1 horizontal) — pasuje do Editorial Print allowed_variants + daje miejsce na 3 wow scenariusze (sucha para, ceramiczna stopa, składana konstrukcja) + 1 kontekst (28 koszul z jednego zbiornika).
- **Testimonials:** T5 Single hero quote + 6 secondary cards — jeden duży głos Marty + 6 mniejszych potwierdzeń. Z allowed Editorial: T5 jest top-1.

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `editorial-print`
- **Plik:** [`docs/landing/style-atlas/editorial-print.md`](../../docs/landing/style-atlas/editorial-print.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **ritual** (poranna garderoba, „bezwysiłkowy rytuał" w copy brand_info)
- Precision↔Expression: **expression** (Fraunces serif sprzedaje feeling, nie wykres ciśnienia — choć liczby pomocniczo)
- Evidence↔Feeling: **feeling** (Marta nie czyta tabel, czyta „garderoba wita poranek gotowa")
- Solo↔Community: **solo** (osobiste pranie, prywatna garderoba)
- Quiet↔Loud: **quiet** (italian luxury restraint, nie głośne TVP-style emocje)
- Tradition↔Future: **tradition** (włoskie atelier, prasowanie 100 lat temu, ale technologia nowa)
- Intimate↔Public: **social** (status społeczny, „tajna broń ludzi sukcesu" wg raportu)

Match z editorial-print: 7/7 (`ritual·expression·feeling·solo·quiet·tradition·social`). Argumentacja: Editorial Print to JEDYNY styl którego DNA pokrywa się 1:1 z brand_info i raportem strategicznym; pozostałe top kandydaci (Japandi, Apothecary, Swiss Grid) odpadają na 2+ osiach (Japandi jest intimate+quiet ALE NIE social/expression; Apothecary jest precision+evidence; Swiss Grid jest precision+public+future).

### 10.3 MUSZĄ być użyte
- Font display: **Fraunces** w `font-family` (400, 500, italic enabled)
- Font body: **Inter** (400, 500)
- Font accent: **Cormorant Garamond** italic (eyebrow, signature numeral suffix)
- Paleta: `#F5F1EA` paper, `#2E2A26` ink, `#C9A57C` gold + `#1A1A1A` ink-2 (dark sekcja)
- Layout DNA: Editorial column max 720px body, magazine page numbers Nº 01–10 w corner sekcji
- Signature primitive #1: oversize Fraunces italic numeral w hero (tu: „26" z suffix „sec")
- Section architecture min: 14 sekcji

### 10.4 NIE WOLNO użyć
- **Fonty:** NIE Italiana (brak Ł UPPERCASE — safety #7), NIE Archivo Black, NIE EB Garamond
- **Layout:** NIE pure bento 2×2 jako default (F2 wybrany świadomie z asymetrią 3+1), NIE poster full-bleed bez paper margin
- **Elementy:** NIE „Nº xx — ATELIER" eyebrow (paromia signature), NIE checkmark ✓ table (AI-slop)
- **Kolory:** NIE pure #FFFFFF (cooler paper), NIE neon, NIE bright gold #FFD700
- **Motion:** NIE js-glitch, NIE neon-glow, NIE bouncy spring; OK fade-in, js-split, js-parallax (hero numeral), magnetic CTA, js-tilt (max 2), js-counter (min 2 — np. „26 sec", „4.9★")

### 10.5 Section Architecture
Required (min 14): Header, Mobile Menu, Hero (H4), Trust Bar (dark ink-2 + gold ikony), Problem (3 frustracje Marty), Solution Bento (F2 mix), How It Works (3 kroki + parallax numeral „26"), Comparison (Lissio vs żelazko vs tani steamer z marketu), Aspect Higieniczny (dezynfekcja pary), Unboxing Experience, Testimonials (T5 single hero + secondary), FAQ (5-6 pytań Marty), Offer + Final CTA, Footer + Sticky CTA mobile

Forbidden: Trust bar bez ikon, Generic „pricing tier" tabel, video embed iframe (YT zewnętrzny — safety #1)

### 10.6 Motion Budget
```yaml
js_effects_required:
  - .fade-in (all sections)
  - .js-split (hero h1 — moderate, słowo po słowie)
  - .js-parallax (hero „26" numeral data-speed=0.15)
  - .magnetic (oba CTA hero + offer + final)
  - .js-tilt (2× — produkt w hero, packshot w unboxing)
  - .js-counter (2× min — „26 sec" + „4.9 / 5" w trust bar; opcjonalnie „28 koszul")
js_effects_forbidden:
  - .js-glitch
  - .neon-glow
  - .bouncy-spring
js_effects_count:
  split_min: 1
  counter_min: 2
  magnetic_min: 2
  tilt_min: 2
  parallax_min: 1
```

---

## 11. Wow Moments (z 04-design.md sekcja 1 — 3 explicit)

### Wow #1 — Hero zone: „26" numeral with italian whisper
- **Lokalizacja:** hero, immediately visible (above the fold)
- **Element:** oversize Fraunces 400 italic „26" (320–520px, gold #C9A57C @ opacity 0.18) jako tło + pod nim Cormorant Garamond 14px italic „sekund · una stanza, una camicia" (jeden pokój, jedna koszula) — włoski tagline domykający signature
- **Uniqueness reason:** w paromii numeral był „5" (czyste page numbering); tu „26" pochodzi z realnej specyfikacji produktu (czas pary). „Una stanza, una camicia" to oryginalny włoski tagline napisany pod ten landing — nie wzięty z biblioteki snippetów.
- **Implementation status:** designed (ETAP 2 generuje)

### Wow #2 — Mid: Dry steam paper test (split before/after)
- **Lokalizacja:** sekcja Solution / How It Works, po 1. scrollu
- **Element:** split visual 50/50 — po lewej kartka papieru DRY po prasowaniu Lissio (czysta), po prawej kartka MOKRA po tanim steamerze z marketu (mokre plamy, marszczone). Nad podpis: „test białej kartki — jedyny dowód którego nie da się sfabrykować". Mała animacja crossfade między dwoma kartkami na hover.
- **Uniqueness reason:** raport strategiczny wyraźnie wskazuje że „kąt 2: test suchej pary (the dry steam challenge)" to angle #1 dla obiekcji „czy będą mokre plamy". Inne Editorial landingi NIE robią split before/after — paromia ma sekcję parową degustacji wina, oculia ma okularowe split, ale żaden nie testuje papieru.
- **Implementation status:** designed

### Wow #3 — Conversion: Unboxing atelier
- **Lokalizacja:** sekcja Offer/Unboxing, pre-CTA
- **Element:** flat-lay packshot zestawu — parownica + welurowe etui z monogramem L + karta zapachowa „Bergamotto di Calabria" + instrukcja PL w papierowej kopercie + sleeve cotton. Powiększenie po kliknięciu (tilt 3deg). Pod podpisem trzy linijki Cormorant italic — co dostajesz, ile waży, dlaczego pakowanie jest w EU-compliant kraft.
- **Uniqueness reason:** raport strategiczny wymaga „Doświadczenie Unboxing Experience" jako sekcji — ale Lissio idzie krok dalej: każdy item zestawu ma _swój_ włoski podpis (welurowe etui = „custodia in velluto", karta zapachowa = „cartoncino di Bergamotto"). To zamienia generic unboxing w atelier checklist.
- **Implementation status:** designed (AI image potrzebny — placeholder briefem)

---

## Mapowanie manifesto → decyzje (Krok 7)

| Decyzja | Wartość |
|---|---|
| Hero background | `#F5F1EA` paper + parallax italic numeral „26" w `#C9A57C` @ 0.18 opacity |
| Hero headline font-family | Fraunces 400 (regular + italic em na 2 słowach) |
| Hero headline font-style | „Idealnie gładkie ubrania <em>w 26 sekund</em>" — italic em na kluczowych 3 słowach |
| Signature element HTML | `<div class="hero-numeral js-parallax" data-speed="0.15">26<sup>sec</sup></div>` |
| Dark section rytm | 2 dark sekcje (Trust Bar + Unboxing) z `#1A1A1A` tłem + paper text — reszta na paper |
| Animacja hero | js-split moderate (słowo po słowie 0.1s stagger) + parallax numeral + magnetic CTA — nic dramatycznego |
| Border-radius globalny | 8px (umiarkowany, paper feel — NIE 0 jak Swiss, NIE 24px jak playful) |
| Shadow styl | `0 10px 30px rgba(46,42,38,0.12)` warm ink shadow, NIE czarna |
| Divider między sekcjami | Magazine page numbers Nº 01–10 w right-top corner sekcji + 1px gold line `#C9A57C` opacity 0.3 (tylko między dwoma sekcjami premium: hero/trust, offer/final) |
