# Procedura weryfikacji Landing Page

**Kiedy wywołać:** Po zakończeniu pierwszego etapu tworzenia landing page (po zapisaniu pliku index.html).

Ta procedura jest **obowiązkowa** — nie kończ pracy nad landingiem bez jej wykonania.

---

## 1. Checklist sekcji i obrazów

Sprawdź czy landing zawiera **wszystkie** poniższe sekcje z miejscami na zdjęcia:

| # | Sekcja | Min. obrazów | Sprawdzone |
|---|--------|--------------|------------|
| 1 | Header + Logo | 1 (logo) | [ ] |
| 2 | Hero | 1-2 (produkt główny) | [ ] |
| 3 | Trust Bar | 0 (ikony SVG) | [ ] |
| 4 | Product Showcase / Gallery | 2-4 (galeria produktu) | [ ] |
| 5 | Problem | 1 (ilustracja problemu) | [ ] |
| 6 | Solution / Benefits | 3-4 (każda korzyść = 1 obraz) | [ ] |
| 7 | Technology / How It's Made | 1 (wizualizacja technologii) | [ ] |
| 8 | How It Works (kroki) | 3 (każdy krok = 1 obraz) | [ ] |
| 9 | Personas / For Who | 3 (każda persona = 1 obraz) | [ ] |
| 10 | Testimonials | 0 (awatary tekstowe OK) | [ ] |
| 11 | Package / What's Included | 1 (zestaw/unboxing) | [ ] |
| 12 | Offer / Pricing | 1 (produkt w ofercie) | [ ] |
| 13 | FAQ | 0 | [ ] |
| 14 | CTA Banner | 0 | [ ] |
| 15 | Footer | 1 (logo) | [ ] |

**Minimum obrazów na stronie: 15-20 placeholderów**

Jeśli brakuje sekcji lub obrazów — **dodaj je przed kontynuowaniem**.

---

## 2. Weryfikacja treści (Copy Review)

Dla **każdej sekcji** zadaj sobie pytania:

### A. Kontekst odbiorcy
- Kim jest grupa docelowa? (wiek, sytuacja, problemy)
- Jakim językiem mówi? (formalny/nieformalny, techniczny/prosty)
- Co ich boli? Co chcą osiągnąć?

### B. Pytania do każdej sekcji

| Sekcja | Pytania kontrolne |
|--------|-------------------|
| **Hero** | Czy headline trafia w główny ból? Czy jest konkretny (liczby, efekty)? Czy CTA jest jasne? |
| **Problem** | Czy opis problemu rezonuje z odbiorcą? Czy używam jego słów? Czy statystyki są wiarygodne? |
| **Solution** | Czy korzyści są napisane językiem efektów (nie funkcji)? Czy każda korzyść odpowiada na konkretny ból? |
| **How It Works** | Czy kroki są proste i zrozumiałe? Czy pokazuję jak łatwo zacząć? |
| **Personas** | Czy 3 persony pokrywają główne segmenty? Czy każdy znajdzie siebie? |
| **Testimonials** | Czy opinie są wiarygodne? Czy zawierają konkrety (imię, rola, efekt)? |
| **Package** | Czy jasno widać co dostaje klient? Czy jest poczucie wartości? |
| **Offer** | Czy cena jest dobrze zakotwiczona (przekreślona stara)? Czy jest pilność/ograniczenie? |
| **FAQ** | Czy odpowiadam na realne obiekcje? Czy rozwiązuję wątpliwości przed zakupem? |

### C. Checklist copy

- [ ] Brak "lorem ipsum" ani placeholder tekstów
- [ ] Headline hero < 10 słów, konkretny efekt
- [ ] Wszystkie CTA mają jasny przekaz (nie "Kliknij tutaj")
- [ ] Ceny i rabaty są spójne w całym dokumencie
- [ ] Gwarancja/zwrot jest wyraźnie komunikowana
- [ ] Brak błędów ortograficznych i gramatycznych

---

## 3. Weryfikacja techniczna

- [ ] Logo ma pełny URL Supabase (nie względny)
- [ ] Fonty mają `&subset=latin-ext` (polskie znaki)
- [ ] Hero image ma `fetchpriority="high"` (bez `loading="lazy"`)
- [ ] Wszystkie `<img>` mają `width` i `height` (CLS)
- [ ] `preconnect` do fonts.googleapis.com i fonts.gstatic.com
- [ ] Meta title < 60 znaków, meta description < 160 znaków

---

## 4. Akcje po weryfikacji

Po przejściu checklisty:

1. **Jeśli są braki** — popraw je i przejdź ponownie przez sekcje z problemami
2. **Jeśli wszystko OK** — commituj i deployuj:
   ```bash
   cd /c/repos_tn/tn-crm && git add landing-pages/[nazwa]/ && git commit -m "Add [nazwa] landing page" && git push
   ```
3. **Podaj użytkownikowi link:** `https://tn-crm.vercel.app/landing-pages/[nazwa]/`

---

## 5. Raport dla użytkownika

Po zakończeniu weryfikacji przedstaw krótki raport:

```
## Landing Page Review: [nazwa]

### Sekcje: [X/15] kompletne
### Obrazy: [X] placeholderów
### Copy: [status]

### Uwagi:
- [ewentualne sugestie do treści]
- [sekcje wymagające zdjęć od klienta]

### Link: https://tn-crm.vercel.app/landing-pages/[nazwa]/
```
