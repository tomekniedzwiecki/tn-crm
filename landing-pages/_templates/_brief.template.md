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

## 6. Baseline decision

- [ ] **MODE=copy-adapt** — istniejący baseline pasuje, kopiuję `landing-pages/[nazwa]/`
- [ ] **MODE=forge** — szkielet 14 sekcji od zera (≥3 czerwone flagi mismatcha — patrz safety.md #1)

**Wybrany baseline / argumentacja forge:**

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
