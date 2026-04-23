# Design Brief — [NAZWA_MARKI]

<!-- Ten plik jest OBOWIĄZKOWY. scripts/verify-brief.sh blokuje ETAP 2 jeśli któraś sekcja jest pusta. -->
<!-- Wypełnij wszystkie 8 sekcji ZANIM przejdziesz do generowania HTML. -->
<!-- Pełna dokumentacja: docs/landing/01-direction.md -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [ ] Nowy (opisz poniżej):

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **[Marka 1]** — [1 zdanie: co konkretnie referencjuje? typografia / kolorystyka / fotografia / ton]
2. **[Marka 2]** — [j.w.]
3. **[Marka 3]** — [j.w.]

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #______
- **Ink (główny tekst):** #______
- **Paper (tło):** #______
- **Accent / Gold (opcjonalny):** #______

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** [font name] + `&display=swap&subset=latin-ext`
- **Body (treść):** [font name] + `&display=swap&subset=latin-ext`
- **Mono / Caption (opcjonalny):** [font name]

> ⚠️ Sprawdź polskie „Ł" w UPPERCASE — patrz [`docs/landing/reference/safety.md` reguła #7](../../docs/landing/reference/safety.md). Italiana ❌, Fraunces ✅.
> Max 3 rodziny fontów.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:**
- **Kluczowy pain point** (co najbardziej frustruje):
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu):
- **Cytat brzmiący jak wypowiedź persony** (do testimonials):

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge). Tabela poniżej to historia, NIE template'y do kopiowania (memory: `feedback-landing-always-forge.md`).

Sprawdź czy w `landing-pages/` jest już landing podobnego kierunku (vitrix, paromia, h2vital, pupilnik, vibestrike, kafina) — jeśli tak, zanotuj **czego specyficznie nie chcesz powtórzyć**:

- **Już istnieje:** [nazwa landinga] — [kierunek manifesta]
- **Czego unikam (signature elements istniejącego):** [np. „nie kopiuję Archivo + dark hero + stamp badges z kafiny — moja marka ma własną typografię i jasne hero"]

Jeśli nic podobnego nie ma — wpisz „brak istniejącego landinga w tym kierunku".

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [ ] Czy 3 wybrane marki referencyjne są SPOZA e-commerce?
- [ ] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)?
- [ ] Czy persona NIE pasowałaby do innego baseline'u z tabeli?
- [ ] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"?

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga. NIE „nowoczesny design" — coś konkretnego.

**Przykłady dobrych signature elements:**
- „Oversized Nº italic numeral w Fraunces na 280–440px (Editorial)"
- „Stamp badge `LOT 2026 · ISSUE 001` w mosiężnej ramce (Rugged Heritage)"
- „Magazine page numbering `Nº 01–10` w każdej sekcji (Editorial)"
- „Color-changing shadow z primary brand color na hover kart (Panoramic Calm)"

**Twój signature element:**

## 9. Warianty sekcji (z [`section-variants.md`](../../docs/landing/reference/section-variants.md), LIMITED przez allowed_variants w Style Lock)

- **Hero:** H[N] [Nazwa wariantu] — [z allowed_variants w Style Lock, top-1]
- **Features:** F[N] [Nazwa]
- **Testimonials:** T[N] [Nazwa]

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

> Ta sekcja jest **kontraktem** — łamiesz ją = FAIL w `verify-style-lock.sh`. Dodana automatycznie po Kroku 9a w [`01-direction.md`](../../docs/landing/01-direction.md).

### 10.1 Wybrany styl
- **Style ID:** [nazwa pliku bez .md, np. `apothecary-label`]
- **Plik:** [`docs/landing/style-atlas/[style-id].md`](../../docs/landing/style-atlas/)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: __
- Precision↔Expression: __
- Evidence↔Feeling: __
- Solo↔Community: __
- Quiet↔Loud: __
- Tradition↔Future: __
- Intimate↔Public: __

Match z wybranym stylem: __/7. Argumentacja (1 zdanie): __

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
<!-- Skopiuj sekcję MUSZĄ z style-atlas/[style-id].md -->
- Font display: [konkretna nazwa] w font-family
- Font body: [konkretna nazwa]
- Paleta (min 3 z 5): [hex1], [hex2], [hex3]
- Layout DNA: [z sekcji 6 pliku stylu]
- Signature primitive #1 obecny
- Section architecture min: N sekcji

### 10.4 NIE WOLNO użyć (auto-paste)
<!-- Skopiuj sekcję NIE WOLNO z style-atlas/[style-id].md -->
- **Fonty:** NIE [lista]
- **Layout:** NIE [lista]
- **Elementy:** NIE [lista]
- **Kolory:** NIE [lista hex]
- **Motion:** NIE [js effects forbidden]

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min N): [lista sekcji z klas CSS]
Forbidden: [lista zakazanych sekcji]

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [...]
js_effects_forbidden: [...]
js_effects_count: { counter_min: N, ... }
```
