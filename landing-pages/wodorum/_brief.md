# Design Brief — Wodorum

<!-- Ten plik jest OBOWIĄZKOWY. scripts/verify-brief.sh blokuje ETAP 2 jeśli któraś sekcja jest pusta. -->
<!-- Pełna dokumentacja: docs/landing/01-direction.md -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [x] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia) — **forge w "Scientific Editorial"**
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [ ] Nowy (opisz poniżej):

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):

Workflow_branding wymaga Fraunces + Inter + Space Mono (kontrakt z klientem). Persona „Tomasz Menedżer Nowej Ery" (35-45, biohacker, słucha Hubermana, czyta Nature Medicine, kupuje premium) chce editorial autorytetu, ale na liczbach naukowych — dlatego Editorial Print w wariancie „Scientific Editorial": Fraunces dla nagłówków + Nº dla numeracji + Space Mono dla danych technicznych (1500 ppb, -700 mV ORP, 3 min). Cyjan Wodorowy (#3DC9E0) z workflow_branding zastępuje tradycyjne złoto editorial-print.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Levels Health** — clinical glucose monitor app: oversize liczby jako design element, dark navy + cyan highlight na metrykach, technical-but-aspirational ton dla biohackerów.
2. **Aesop** — apothecary-editorial hybrid: paper tones + serif headlines z italic em na 1 słowie, longform body z naukową precyzją, brak power-words.
3. **The Atlantic / WIRED feature article layout** — magazine page numbering Nº 01-10, oversized italic pull-quote, figure+figcaption pod hero, footnoted claims z [1] przypisami.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #3DC9E0 — Cyjan Wodorowy (na liczbach, CTA, em w nagłówkach)
- **Ink (główny tekst):** #0A0E14 — Obsydian
- **Paper (tło):** #FAFBFD — Czysta Biel
- **Accent / Gold (opcjonalny):** #0B1E3F — Granat Oksydacyjny (dark sections, hero accent zamiast złota)

Wsparcie: Mgła Platynowa #B4BEC9, Szarość Laboratoryjna #5B6473.

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fraunces + `&display=swap&subset=latin-ext`
- **Body (treść):** Inter + `&display=swap&subset=latin-ext`
- **Mono / Caption (opcjonalny):** Space Mono — dane techniczne, jednostki (ppb, mV, min), Nº numeracja

> ⚠️ Sprawdź polskie „Ł" w UPPERCASE — Fraunces ✅ obsługuje PL diakrytyki. line-height ≥ 1.4 w UPPERCASE.
> Max 3 rodziny fontów: Fraunces + Inter + Space Mono.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Tomasz, 35-45, mężczyzna (lub kobieta o zbliżonym profilu), miasto wojewódzkie (Warszawa, Trójmiasto, Wrocław), wyższe wykształcenie, wyższy menedżer korporacji finansowej/IT lub właściciel dynamicznie rozwijającej się firmy, zarobki netto >15 000 zł/mies.
- **Kluczowy pain point** (co najbardziej frustruje): Mgła mózgowa po 14:00. Czwarta kawa już nie działa, tylko podrażnia żołądek. Boi się utraty przewagi intelektualnej na rzecz młodszych współpracowników. Tradycyjna suplementacja przestaje przynosić rezultaty.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): Mierzalny dowód działania (Nature Medicine, 1500 ppb, ORP). Premium materiał (tytan + platyna, nie plastik chiński). Status — biohacker rozumiejący naukę. Czas — 3 minuty na cykl, mieści się w uchwycie samochodowym.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Słuchałem Hubermana o wodzie wodorowej i Ohsawie. Kupowałem chińskie generatory z AliExpress trzy razy — wszystkie pluły ozonem. Dopiero tytan+platyna i mierzalne 1500 ppb dały efekt który czuję w drugim spotkaniu po lunchu."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge). Tabela poniżej to historia, NIE template'y do kopiowania.

W `landing-pages/` istnieją 4 landingi wody wodorowej / suplementacji wodorem: **h2vital, wodoria, wodorka, wodamoc** — wszystkie używają zielonych akcentów (#06D6A0 / #10B981 / #D4A84B / #00B894), bg-water gradientów cyan/sky, „organic wellness" tonu. Wodorum musi pójść w drugą stronę: **navy oksydacyjny + cyjan tech** (nie zielony), **editorial scientific autorytet** (nie wellness spa), **liczby jako bohater** (1500 ppb, -700 mV, Nature Medicine 2007) zamiast „naturalna witalność".

Istnieje też **paromia** (editorial-print baseline z Fraunces + paper/ink/gold). Wodorum używa Fraunces, ale: **zamiast gold → cyjan**, **zamiast magazine lifestyle → scientific journal**, **zamiast wine/luxury body copy → evidence-based z footnotami [1]**. Nie kopiuję paper #F5F1EA — paleta jest chłodna (#FAFBFD) bo to laboratorium, nie kuchnia.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Levels Health = SaaS, Aesop = apothecary brand, The Atlantic = magazine)
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? — Tak, „lab + magazine scientifico" = water hydrogen biohacking premium
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? — Tomasz biohacker premium NIE pasuje do organic h2vital (zbyt wellness) ani playful pupilnik (zbyt dziecięce) ani retro vibestrike (zbyt gaming)
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — Tak, używamy „mierzalne", „selektywny", „Nature Medicine", „1500 ppb"

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:**

Oversized cyjanowa liczba **1500** w Fraunces (font-size: clamp(160px, 22vw, 320px)) z dopiskiem `PPB H₂` w Space Mono uppercase 12px tracking 0.2em pod nią, używana w hero jako dominanta + powracająca jako mniejszy motyw (1500 / 700 / 3) w sekcji parametry. Towarzyszą jej **Nº 01-10 page numbers** w prawym górnym rogu każdej sekcji (Cormorant Garamond italic 14px) — magazine page numbering jak w czasopiśmie naukowym (zamiast magazyn lifestyle paromii).

## 9. Warianty sekcji (z [`section-variants.md`](../../docs/landing/reference/section-variants.md))

- **Hero:** H4 Oversized italic numeral — dominanta 1500 w cyjanie, mniejsze H1+sub po lewej, packshot po prawej
- **Features:** F1 Bento 2×3 z piktogramami i KPI — każda karta z liczbą+jednostką jako headline (1500 ppb, -700 mV, 3 min, 24 m-cy, BPA-free, tytan/platyna)
- **Testimonials:** T2 Before/After stats — każdy testimonial ma KPI obok (godziny snu +1.5h, energia popołudniowa +40%, koniec popołudniowej kawy)

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

> Ta sekcja jest **kontraktem** — łamiesz ją = FAIL w `verify-style-lock.sh`.

### 10.1 Wybrany styl
- **Style ID:** `editorial-print`
- **Plik:** [`docs/landing/style-atlas/editorial-print.md`](../../docs/landing/style-atlas/editorial-print.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **ritual** (codzienny rytuał poranny + popołudniowy, 3 min cykl)
- Precision↔Expression: **precision** (1500 ppb, -700 mV, tytan/platyna)
- Evidence↔Feeling: **evidence** (Nature Medicine 2007, Ohsawa, ORP measurements)
- Solo↔Community: **solo** (osobiste narzędzie biohackingu)
- Quiet↔Loud: **quiet** (clinical authority, nie krzykliwa reklama)
- Tradition↔Future: **future** (biohacking, longevity, optymalizacja)
- Intimate↔Public: **social** (status biohackera, podcasty Hubermana)

Match z wybranym stylem (editorial-print: ritual·expression·feeling·solo·quiet·tradition·social): **4/7** — ritual ✓, solo ✓, quiet ✓, social ✓. Argumentacja (1 zdanie): editorial-print wybrany jako kompromis bo workflow_branding wymusza Fraunces (Apothecary/Clinical zakazują Fraunces); forge w „Scientific Editorial" zachowuje editorial typografię ale zastępuje magazine lifestyle data tables i footnotami evidence.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: **Fraunces** w font-family h1/h2/h3
- Font accent: **Cormorant Garamond** italic — Nº numeracja, eyebrow
- Font mono: **Space Mono** — jednostki, data labels, footnotes
- Paleta (min 3 z palety workflow): **#FAFBFD** (paper), **#0A0E14** (ink), **#3DC9E0** (cyjan accent zamiast gold), **#0B1E3F** (granat oksydacyjny — dark hero accent)
- Layout DNA: editorial column + magazine page numbers Nº 01-10
- Signature primitive #1: **Nº eyebrow** w każdej sekcji
- Signature primitive #2: **Oversized italic numeral 1500** (z forge dla scientific)
- Signature primitive #3: **figure+figcaption** pod hero (`fig. 1 — wnikanie wodoru przez barierę krew-mózg`)
- Section architecture min: 14 sekcji

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE Italiana (Ł problem), NIE Caveat, NIE Fredoka One, NIE Archivo Black, NIE Playfair, NIE IBM Plex
- **Layout:** NIE bento 2×2 z tekstem (cards mogą być z liczbami), NIE warm cream sekcji (`#F6F3ED` zakazane — to wine, my mamy lab)
- **Elementy:** NIE „rewolucyjne", „premium", „luxury", „wysokiej jakości" w copy (Editorial copy voice)
- **Kolory:** NIE `#C9A961` gold (zastąpione cyjanem), NIE `#F6F3ED` linen cream, NIE zielone (#06D6A0 / #10B981 — to inne wodorowe landingi)
- **Motion:** dozwolone wszystkie (editorial-print = moderate motion); NIE wyłączać `.fade-in` (safety #2)
- **Frazy:** NIE „24h", „magazyn w Polsce", „za pobraniem", „raty", „PayPo", „Klarna", „Twisto", „dropshipping", „wellness", „spa", „organic"

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 14): Header, Mobile Menu, Hero (H4 numeral), Trust Bar, Problem, Solution/Bento (F1 z KPI), How It Works, Comparison, Testimonials (T2 stats), FAQ, Offer, Final CTA, Footer, Sticky CTA
Forbidden: brak — editorial-print akceptuje pełen zestaw 14 sekcji

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-split, .js-parallax, .magnetic, .js-tilt, .js-counter]
js_effects_count:
  split_min: 1
  counter_min: 3        # 1500, 700, 3 — kluczowe liczby Wodorum
  magnetic_min: 2
  tilt_min: 2
  parallax_min: 1       # oversized 1500 w tle hero
```
