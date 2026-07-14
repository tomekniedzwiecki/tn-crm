# Design Brief — LINOVO

<!-- ETAP 1 (DIRECTION). Manifesto PRZED HTML. verify-brief.sh musi zwrócić exit 0. -->
<!-- Produkt: kompaktowa, ciśnieniowa parownica ręczna do delikatnych tkanin (jedwab, len, kaszmir). -->
<!-- Klient: Hubert Smolarczyk. Workflow: 123c7b35-85cd-4d1e-a6d1-778e118893b3 -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Sartorial Calm** (Japandi Serenity z Atlas)

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):
Linovo nie sprzedaje „parownicy" — sprzedaje poranny rytuał perfekcyjnej garderoby i spokój
o własny wizerunek. Kategoria emocjonalna to **cisza i kontrola** (nie tech, nie zabawa), więc
kierunek to japoński-skandynawski minimalizm (Japandi) przełożony na sartorialny, lniany świat marki:
dużo oddechu, paleta lnu, jeden mosiężny akcent, elegancki serif. Tempo: **ciche**.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`.

1. **Kinfolk magazine** — pionowa kolumna tekstu, ogromny whitespace, fotografia w miękkim, bocznym świetle z cieniem zamiast obrysu. Referencja: rytm i „oddech" strony.
2. **Aesop** — papierowa paleta (off-white zamiast czystej bieli), powściągliwa typografia, apteczny porządek, zero krzyku. Referencja: ton i restraint.
3. **The Row** — sartorialny luksus bez ostentacji, paleta kości/kamienia/lnu, pewność siebie szeptem. Referencja: pozycjonowanie „cichy premium" i materiałowość (len, mosiądz, ceramika).

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent ciemny / ink-2):** #1F3A3D (Deep Linen)
- **Ink (główny tekst):** #14181C (Obsidian)
- **Paper (tło):** #F4EEE3 (Cream Linen)
- **Accent / Gold (rzadki 10%):** #C99A4E (Soft Brass)
- Secondary ciepły: #D4B896 (Warm Linen) · Neutral: #9B9389 (Stone Gray)

> Filozofia 60/30/10: paper #F4EEE3 (60%, „oddech") → Deep Linen #1F3A3D (30%, charakter, sekcje ciemne i tekst akcentowy) → Soft Brass #C99A4E (10%, TYLKO: hairline-szew, eyebrow oferty, ramka offer-box). Zero neonu, cień zamiast linii.

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Cormorant Garamond — elegancki editorial serif, poprawne polskie „Ł" w UPPERCASE (safety #7 ✅), zastępuje Noto Serif ze Style Lock (branding ma priorytet, 01-direction Krok 4.4).
- **Body (treść):** Inter — neutralny, czytelny.
- **Accent / Caption:** Josefin Sans — lekki geometryczny sans do eyebrow/labeli (waga 300/400), latin-ext OK.

> Bez `&subset=latin-ext` (safety #10). Max 3 rodziny fontów ✅.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Karolina „Styl i Czas", 32 lata, Senior Key Account Manager w agencji PR (Warszawa). Wysoki dochód, garderoba premium: jedwabne koszule, lniane garnitury, kaszmirowe kardigany. Minimalistka, mieszkanie z każdą przestrzenią zaplanowaną.
- **Kluczowy pain point:** o 7:30 jedwabna bluzka zaplanowana na spotkanie z zarządem jest pognieciona; rozkładanie deski w małym salonie ją irytuje, a dotknięcie jedwabiu rozgrzaną metalową stopą żelazka budzi lęk o zniszczenie drogiej tkaniny.
- **Kluczowa motywacja zakupu:** nienaganny wygląd bez rozkładania deski, oszczędność porannych minut, bezwzględne bezpieczeństwo delikatnych tkanin, mobilność (składa się do walizki kabinowej).
- **Cytat brzmiący jak wypowiedź persony:** „Jedwabna bluzka na spotkanie z zarządem była pognieciona. Wygładziłam ją na wieszaku w niecałe dwie minuty — bez rozkładania deski i bez strachu, że przypalę materiał."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** paromia (Editorial/Luxury) oraz h2vital (Organic/Natural) — najbliższe „premium/lifestyle".
- **Czego unikam:** NIE kopiuję z paromii Fraunces + Italiana + paper/ink/gold ani magazynowego numerowania Nº; NIE kopiuję z h2vital rounded sans + zielenie/beże. Linovo ma własny język: Cormorant Garamond + lniana paleta teal-charcoal + mosiężny szew (hairline), zero oversized numeral, zero zielonego wellness. Brak istniejącego landinga w kierunku Japandi/Sartorial — buduję od zera (MODE=forge).

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Kinfolk = magazyn editorial; Aesop/The Row jako brand-world/retail-design, nie landingi e-commerce)
- [x] Czy odwracając logo nadal zgaduję branżę? (lniana paleta + sartorialny szew + Cormorant = pielęgnacja garderoby premium)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (Karolina to konkretna PR-managerka z premium garderobą, nie generyczny „klient AGD")
- [x] Czy manifest da się zacytować bez „premium/luxury/wysoka jakość"? (TAK: „cisza, kontrola, mosiężny szew, dwie minuty, jeden ruch na wieszaku")

## 8. Signature element

**Mosiężny szew (1px brass hairline)** — pionowa nić #C99A4E biegnąca lewą krawędzią kolumny tekstu i pull-quote'ów, jak szew krawiecki „zszywający" sekcje. Powtarza sartorialny DNA marki (krawiectwo) i jednocześnie realizuje Japandi primitive #2 (vertical line dividers). Drugi nośnik: **asymetryczne zdjęcie produktu z oddychającym marginesem** (produkt zajmuje ~45% kadru, reszta to pustka z cichą metką). Świadomie BEZ oversized italic numeral (Japandi NIE WOLNO).

## 9. Warianty sekcji (LIMITED przez allowed_variants w Style Lock)

- **Hero:** H1 Split klasyczny — tekst w wąskiej kolumnie z lewej, asymetryczne zdjęcie produktu z prawej (w oddychającym marginesie). Z allowed [H6, H2, H1].
- **Features:** F3 Linear stack — pionowy rytm spec-rows (`feat-spec-list`), jedyny dozwolony wariant.
- **Testimonials:** T5 Single hero testi — jeden mocny głos (cichy), uzupełniony 3 kompaktowymi kartami z avatarami (placeholdery) dla pokrycia verify.

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `japandi-serenity`
- **Plik:** [`docs/landing/style-atlas/japandi-serenity.md`](../../docs/landing/style-atlas/japandi-serenity.md)

<!-- Maszynowe tokeny lock (v5.0) — REQUIRED dla verify-style-lock.sh; branding > Atlas -->
lock-font-display: Cormorant Garamond
lock-font-body: Inter
lock-font-accent: Josefin Sans
lock-hex: #F4EEE3
lock-hex: #1F3A3D
lock-hex: #C99A4E

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **ritual** (kotwice: Aesop hand wash, Matcha ceremony — poranny rytuał garderoby, dystans od „utility AliExpress")
- Precision↔Expression: **precision** (Swiss watch, Sous-vide — ceramiczna stopa, 30 kPa, 26 s jako dowód; powściągliwość)
- Evidence↔Feeling: **feeling** (La Mer, Byredo — klient kupuje spokój i pewność siebie, nie moc)
- Solo↔Community: **solo** (skincare serum, notes — osobista garderoba)
- Quiet↔Loud: **quiet** (Aesop, Muji — „unikamy agresywnego języka, elegancki minimalizm")
- Tradition↔Future: **tradition** (Pelikan, Fraunces magazine — sartorialna elegancja, Cormorant Garamond)
- Intimate↔Public: **intimate** (skincare routine, face cream — prywatny poranny rytuał)

Match z wybranym stylem: **7/7** (Japandi Serenity = ritual·precision·feeling·solo·quiet·tradition·intimate). Runner-upy: Dark Academia 6/7, Organic Natural 6/7.
Argumentacja (1 zdanie): paleta lnu + intymny poranny rytuał + powściągliwa precyzja + sartorialna tradycja to dokładnie Japandi (Muji/Snow Peak/Hay), a nie burgundowa książkowość Dark Academia ani zielony wellness Organic.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: Cormorant Garamond w font-family (brand override Noto Serif — branding ma priorytet)
- Font body: Inter
- Paleta (min 3 z 5): #F4EEE3 (paper, ≥5 sekcji), #14181C/#1F3A3D (ink), #C99A4E (rzadki akcent)
- Layout DNA: editorial column (kolumna body ~640px), padding sekcji ≥140px, dużo whitespace
- Signature primitive #2 (vertical line divider / mosiężny szew) + #3 (image z oddychającym marginesem, nigdy full-bleed) + #5 (asymetryczne zdjęcie produktu)
- Section architecture: tło paper #F4EEE3 w min 5 sekcjach

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE Fraunces, NIE Archivo Black, NIE IBM Plex, NIE Caveat
- **Layout:** NIE bento 2×2, NIE dashboard, NIE poster full-bleed, NIE tabela porównawcza (comparison jako 2 karty opisowe, nie tabela)
- **Elementy:** NIE oversized italic numeral, NIE chart bars, NIE stickers, NIE marquee, NIE czyste #FFFFFF (paper cooler)
- **Kolory:** NIE neon, NIE jaskrawe złoto (brass stonowany), NIE czerwień „problemu"
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-counter`, NIE `.js-tilt` (motion budget = still; tylko delikatny `.fade-in`)

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (Japandi min): Header (bez CTA-button), Mobile Menu, Hero (negative-space), Manifesto/Problem, Features linear stack (F3, `feat-spec-list`), How It Works (pionowo, 3 kroki), Comparison (2 karty opisowe, NIE tabela), Testimonials (1 hero + 3 ciche), FAQ (4-5), Offer (pionowo centered), Final CTA, Footer.
Forbidden (Japandi): Trust Bar z ikonami, Bento 2×2, Comparison TABLE, Social proof marquee, Sticky CTA mobile.

> **Reconciliation z twardym gate'em verify-landing.sh:** skrypt czyta ten Style Lock i adaptuje checki — przy `japandi-serenity` wymaga BRAKU js-split/counter/magnetic/tilt/parallax oraz pozwala pominąć Trust Bar i Sticky CTA. Sekcje Problem/Comparison/Testimonials/FAQ/Offer/Final CTA pozostają wymagane przez section-completeness loop, więc są obecne w stonowanej, japońskiej formie (comparison = 2 karty, bez tabeli/checkmarków).

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in]   # delikatne, html.js gate + safety timeout filtrujący pozycję
js_effects_forbidden: [.js-split, .js-parallax, .magnetic, .js-tilt, .js-counter]
js_effects_count: { counter_min: 0, tilt_min: 0, parallax_min: 0 }
```

---

## 11. Wow Moments (3 explicit — ETAP 4)

1. **Hero zone — mosiężny szew + asymetryczny pakshot w oddechu:** pionowa nić brass „zszywa" headline z metką „26 sek. do gotowości"; produkt z prawej w dużym marginesie papieru. Unikalne, bo żaden inny landing nie używa sartorialnego szwu jako struktury.
- pattern-id: brass-seam-hero
- selector: .hero-spec
2. **Mid — „Linia w każdej tkaninie":** sekcja-oddech (single statement, padding 160px) z trzema słowami-tkaninami (jedwab · len · kaszmir) rozłożonymi w pionie przy brass hairline; cisza zamiast tabeli specyfikacji.
- pattern-id: fabric-breath-statement
- selector: .fabrics
3. **Conversion — cichy offer-box w ramce brass:** offer otoczony 1px mosiężną ramką (border-beam zastąpiony statycznym szwem, zgodnie z motion=still), cena-kotwica przekreślona + „Oszczędzasz", trust strip bez ikon-krzykaczy, gwarancja 90 dni jako mikrokopia.
- pattern-id: quiet-brass-offer-frame
- selector: .offer-incl

---

## 12. Photo System (KROK 2 procedury AI Images — 2026-07-14)

**Referencja produktu (SSOT kształtu):** biała ręczna parownica ciśnieniowa (typ Xiaomi Mijia),
pistoletowy/L-kształt: pozioma cylindryczna głowica parowa u góry z metalową stopą (biała ramka wokół
jasnosrebrnej płytki z rzędem otworów pary), pionowa **biała** rączka z pojedynczym owalnym przyciskiem,
cienki biały kabel. **CAŁY MATOWY BIAŁY. Zakaz: drewniana rączka, dodatkowe przyciski, ekran, LED-y**
(incydent Linovo 2026-05-29 — model dorobił drewnianą rączkę).

### Lighting
Miękkie, chłodno-neutralne światło poranne z dużego bocznego okna. Cień zamiast obrysu (Kinfolk).
Pochmurna miękkość, ZERO golden hour, zero ciepłych pomarańczy.

### Paleta w scenach
- Tła: Cream Linen paper #F4EEE3, Warm Linen #D4B896, Stone Gray #9B9389; sekcje ciemne = Deep Linen #1F3A3D
- Akcent: Soft Brass #C99A4E — rzadko (mosiężny drążek/haczyk, nić, detal). Materiały: len, kaszmir, jedwab, mosiądz, jasne drewno, ceramika
- Unikamy: neon, zielenie wellness, czyste #FFFFFF, ciepłe gradienty

### Kadrowanie
Asymetryczne, produkt ~45% kadru, dużo oddechu (negative space papieru), off-center. Editorial column.

### Post-processing
35mm film (Kodak Portra 400 / Fujifilm Eterna), lekki grain, mild halation, chłodno-neutralne, film-like.

### Negatywy — NIGDY
Tekst/labele/watermarki, stock-photo body language, neon glow, cluttered tła, golden hour,
drewniana rączka produktu, wymyślone przyciski/LED-y/ekrany poza jednym owalnym przyciskiem.

### Sloty (13 obrazów)
hero(4:5), problem(4:5, bez produktu), 3×detal(1:1), 3×krok(4:3), persona1(4:5, bez twarzy/bez produktu),
persona2(4:5, walizka), persona3(4:5, pościel), offer(3:2, flat-lay), cta-bg(16:9, garderoba, bez produktu).
Twarze w testimonialach = inicjały (etyka). Referencja produktu w 10/13 (bez: problem, persona1, cta-bg).
