# Procedura weryfikacji Landing Page

**Kiedy wywołać:** Po zakończeniu pierwszego etapu tworzenia landing page (po zapisaniu pliku index.html).

Ta procedura jest **obowiązkowa** — nie kończ pracy nad landingiem bez jej wykonania.

---

## 0. Automatyczne kontrole (uruchom najpierw)

Zanim zaczniesz ręczną inspekcję, wykonaj te komendy z `landing-pages/[SLUG]/index.html`.
Każda odpowiada na konkretne pytanie z checklisty.

```bash
SLUG=paromia  # zmień na aktualny
FILE="landing-pages/$SLUG/index.html"

# 1. Liczba placeholderów na zdjęcia (wymóg: 12-20)
echo "Placeholdery:"
grep -cE '<div class="(hero-placeholder-ph|tile-figure|ritual-fig|spec-fig|persona-figure|offer-figure-inner|img-placeholder|ph-box)"' "$FILE"

# 2. Ciągłość numeracji Nº (brak luk, brak duplikatów)
echo "Numeracja Nº:"
grep -oE "Nº [0-9]+" "$FILE" | sort -u

# 3. Czy wszystkie CTA prowadzą do tego samego miejsca
echo "Docelowe linki CTA (btn-primary + btn-cta + offer-cta):"
grep -oE 'href="#[a-z-]+"' "$FILE" | sort -u

# 4. Liczba słów w hero headline + subheadline (wymóg: H1 ≤10, lede ≤25)
echo "Hero word count:"
awk '/hero-headline/,/<\/h1>/' "$FILE" | sed 's/<[^>]*>//g;s/&nbsp;/ /g' | wc -w
awk '/hero-lede/,/<\/p>/' "$FILE" | sed 's/<[^>]*>//g;s/&nbsp;/ /g' | wc -w

# 5. "Power words do UNIKANIA" — czy copy nie brzmi korporacyjnie
echo "Korporacyjne słowa (powinno być 0):"
grep -ciE "innowacyjn|najwyższ[ae] jakość|profesjonaln.*rozwiązan|kompleksow|charakteryzuje się|implementacj" "$FILE"

# 6. Brak "lorem ipsum" ani pustych placeholderów tekstu
echo "Lorem/TODO/Placeholder tekst:"
grep -ciE "lorem ipsum|TODO|placeholder text|\[BRAK\]" "$FILE"

# 7. Brak obcych UUID (z innego workflow)
echo "UUIDs w obrazach (powinien być TYLKO bieżący workflow_id):"
grep -oE "ai-generated/[a-f0-9-]{36}" "$FILE" | sort -u

# 8. ZAKAZANE obietnice wysyłki (dropshipping ≠ 24h / magazyn w PL)
echo "Zakazane obietnice (powinno być 0):"
grep -ciE "wysy[łl]ka 24|w 24 ?h|polski magazyn|z magazynu w Polsc|D\+1" "$FILE"
```

**Oczekiwane:**
| Kontrola | Oczekiwane | Jeśli inaczej |
|----------|-----------|---------------|
| Placeholdery | 12-20 | dodaj więcej figur w bento/ritual/personas |
| Numeracja Nº | ciągła (Nº 01, 02, 03, … bez luk) | przenumeruj brakujące |
| Linki CTA | max 2 unikalne (np. `#zamow` + kotwice menu) | zunifikuj do jednego `#offer/#zamow` |
| Hero headline | ≤ 10 słów | skróć |
| Hero subheadline | ≤ 25 słów | skróć |
| Power words | 0 | zamień na konkret |
| Lorem/TODO | 0 | napisz realny copy |
| UUIDs | TYLKO bieżący workflow | **bug** — usuń obce natychmiast |
| Zakazane obietnice wysyłki | 0 | usuń — dropshipping ≠ 24h / magazyn PL |

**NIE przechodź dalej** dopóki każda kontrola nie jest zielona.

---

## 1. Checklist sekcji i obrazów

Checklist pokrywa **funkcje** sekcji, nie dokładne nazwy. Dla kierunku
Editorial/Luxury (patrz `CLAUDE_LANDING_DESIGN.md`) nazwy mogą wyglądać
inaczej, ale każda **funkcja** musi być pokryta.

| # | Funkcja | Editorial nazwa (przykład) | Min. obrazów | OK |
|---|---------|---------------------------|--------------|-----|
| 1 | Header + Logo | — | 1 (logo) | [ ] |
| 2 | Hero | Nº 01 | 1–2 (produkt główny) | [ ] |
| 3 | Trust Bar | Trust Strip | 0 (ikony/SVG) | [ ] |
| 4 | Product Showcase / Gallery | rozproszone w bento figures | 2–4 zdjęcia detali | [ ] |
| 5 | Problem | Nº 02 Manifesto | 1 (ilustracja) | [ ] |
| 6 | Solution / Benefits | Nº 03 Atelier (bento) | 3–4 (figure w tile) | [ ] |
| 7 | Technology / How It's Made | Nº 05 Spec Sheet | 1 (przekrój techniczny) | [ ] |
| 8 | How It Works (kroki) | Nº 04 Rytuał | 3 (każdy akt = 1 obraz) | [ ] |
| 9 | Personas / For Who | Nº 07 Dla Kogo | 3 (każda persona = 1 portret) | [ ] |
| 10 | Comparison | Nº 06 Dwie epoki | 0 (tekst + lista) | [ ] |
| 11 | Testimonials | Nº 08 Głosy | 0 (awatary-inicjały OK) | [ ] |
| 12 | Package / What's Included | w Offer | 1 (zestaw/unboxing) | [ ] |
| 13 | Offer / Pricing | Nº 10 Oferta | 1 (produkt w ofercie) | [ ] |
| 14 | FAQ | Nº 09 Pytania | 0 | [ ] |
| 15 | CTA Banner / Final | Nº 11 Finał | 0 | [ ] |
| 16 | Footer | — | 1 (logo) | [ ] |

**Minimum placeholderów obrazów na stronie: 12–20.**

Editorial/Luxury typowo ląduje na dolnej granicy (12–15) — typografia
dominuje. Playful/Tech — górna granica (18–20). **NIGDY** poniżej 12.

### Mapowanie — jak potraktować brak dokładnego odpowiednika

| Procedura wymaga | Editorial odpowiednik | Co sprawdzić |
|------------------|----------------------|--------------|
| „Product Gallery" jako sekcja | figury w bento t-tall + hero-figure + offer-figure | Czy łącznie ≥ 3 widoki produktu z różnych ujęć? |
| „How It's Made" osobno | wewnątrz Spec Sheet | Czy jest wizualizacja technologii / przekrój? |
| „Personas" sekcja | Nº 07 Dla Kogo | 3 karty × {portret + imię + meta + pull quote} |
| „Package" | lista w Offer | Wyraźna lista 4–6 pozycji zestawu startowego |

Jeśli brakuje **funkcji** (nie samej nazwy) — dodaj ją przed kontynuowaniem.

---

## 2. HERO DEEP DIVE (najważniejsza sekcja!)

Hero decyduje o tym, czy użytkownik zostanie na stronie. Poświęć mu **osobną, pogłębioną analizę**.

### A. Zdefiniuj grupę docelową PRZED pisaniem

Odpowiedz na pytania:
1. **Kim jest odbiorca?** (wiek, płeć, sytuacja życiowa)
2. **Co go boli?** (główny problem, frustracja, ból codzienny)
3. **Czego pragnie?** (marzenie, stan docelowy, ulga)
4. **Jakim językiem mówi?** (prosty/techniczny, formalny/luźny)

### B. Checklist Hero — KAŻDY punkt musi być spełniony

| Element | Pytanie kontrolne | Spełnione? |
|---------|-------------------|------------|
| **Badge** | Czy buduje kontekst/ciekawość? (nie "Nowość" — to nic nie mówi) | [ ] |
| **Headline** | Czy trafia w BÓL lub PRAGNIENIE? (nie w funkcję produktu!) | [ ] |
| **Headline** | Czy jest < 10 słów? | [ ] |
| **Headline** | Czy odbiorca pomyśli "to o mnie!"? | [ ] |
| **Subheadline** | Czy wyjaśnia JAK produkt rozwiązuje problem? | [ ] |
| **Subheadline** | Czy jest BEZ żargonu technicznego? (nie "11 kPa", "HEPA 12") | [ ] |
| **Subheadline** | Czy jest < 25 słów? | [ ] |
| **CTA główne** | Czy mówi co dostanę? (nie "Kup teraz" — raczej "Zamów z rabatem -30%") | [ ] |
| **CTA drugorzędne** | Czy odpowiada na "chcę wiedzieć więcej"? | [ ] |

### C. Formuły na skuteczny headline

Użyj jednej z tych formuł:

1. **Ból → Rozwiązanie:** "Koniec z [BÓL] — [ROZWIĄZANIE]"
2. **Pragnienie:** "[OSIĄGNIJ MARZENIE] bez [PRZESZKODA]"
3. **Transformacja:** "Z [STAN A] do [STAN B] w [CZAS]"
4. **Pytanie retoryczne:** "Masz dość [BÓL]?"
5. **Konkret:** "[LICZBA] [EFEKT] w [CZAS]"

### D. Anty-wzorce (NIE RÓB TEGO)

- ❌ Headline o produkcie: "Pupilnik — profesjonalny system pielęgnacji"
- ❌ Headline z funkcjami: "Moc ssania 11 kPa i filtr HEPA 12"
- ❌ Subheadline zaczynający się od nazwy: "Pupilnik to..."
- ❌ Żargon techniczny w pierwszych 3 sekundach
- ❌ Ogólniki: "Najlepsze rozwiązanie", "Innowacyjny produkt"
- ❌ **ZAKŁADANIE SYTUACJI ODBIORCY W HERO:** "Twoje dziecko raczkuje...", "Twój pies...", "Masz apartament..." — NIE WIESZ czy odbiorca ma dziecko/psa/apartament! W hero używaj uniwersalnych pytań/stwierdzeń ("Masz dość...?", "Dla tych, którzy...")
- ✅ **Zakładanie sytuacji DOZWOLONE W PERSONAS** — sekcja Nº 07 „Dla Kogo" celowo segmentuje. Tam można i trzeba pisać „32 l. · Warszawa · HR/Marketing · capsule wardrobe". Odbiorca świadomie sprawdza, do której grupy należy.
- ⚠️ **Liczba + jednostka w hero** — OK jeśli jednostka jest oczywista (sekundy, minuty, zł, %). UNIKAJ jednostek specjalistycznych (kPa, HEPA, SPF 50, lm) jeśli grupa docelowa ich nie używa na co dzień. Zamień „30 kPa" → „para pod ciśnieniem"; szczegół techniczny zostaw w Spec Sheet.

### E. Test 5 sekund

Przeczytaj TYLKO badge + headline + subheadline. Czy w 5 sekund wiesz:
1. Dla kogo to jest?
2. Jaki problem rozwiązuje?
3. Dlaczego powinienem zostać?

Jeśli NIE — przepisz Hero.

---

## 3. Weryfikacja treści (Copy Review)

Dla **każdej sekcji** zadaj sobie pytania:

### A. Kontekst odbiorcy
- Kim jest grupa docelowa? (wiek, sytuacja, problemy)
- Jakim językiem mówi? (formalny/nieformalny, techniczny/prosty)
- Co ich boli? Co chcą osiągnąć?

### B. Pytania do każdej sekcji

| Sekcja | Pytania kontrolne |
|--------|-------------------|
| **Hero** | **PATRZ SEKCJA 2 POWYŻEJ** — Hero wymaga osobnej, pogłębionej analizy! |
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
- [ ] Każdy placeholder ma 4 pola: mark, title, size (px), note dla fotografa (nie tylko „Hero Image")

### D. Spójność z raportem strategicznym (workflow_reports type=report_pdf)

Landing MUSI odzwierciedlać ustalenia z raportu. Sprawdź:

- [ ] **Główny pain point** w hero = główny pain point z sekcji „Psychologia sprzedaży" raportu
- [ ] **Persony** (Nº 07 Dla Kogo) = 3 segmenty z sekcji „Grupa docelowa" raportu (imię/wiek/lokalizacja/frustracja — skopiuj, nie wymyślaj)
- [ ] **USP / statystyki** (26 s, 30 kPa, 99,9%) = liczby z sekcji „Specyfikacja techniczna" raportu
- [ ] **Cena** = „sweet spot" z raportu (nie wzięta z kapelusza)
- [ ] **Tagline / headline** pokrywa się z „styl marki" / „tone of voice" z raportu

**Dlaczego:** raport PDF to kontrakt strategiczny z klientem. Rozjazd landing ↔ raport = klient dostaje niespójny produkt.

---

## 4. Weryfikacja techniczna

- [ ] Logo ma pełny URL Supabase (nie względny)
- [ ] Fonty mają `&subset=latin-ext` (polskie znaki)
- [ ] Hero image ma `fetchpriority="high"` (bez `loading="lazy"`)
- [ ] Wszystkie `<img>` mają `width` i `height` (CLS)
- [ ] `preconnect` do fonts.googleapis.com i fonts.gstatic.com
- [ ] Meta title < 60 znaków, meta description < 160 znaków
- [ ] **Header jest ZAWSZE widoczny** (position: fixed, bez hide-on-scroll JS)

---

## 5. Akcje po weryfikacji treści

Po przejściu checklisty:

1. **Jeśli są braki w treściach** — popraw je i przejdź ponownie przez sekcje z problemami
2. **Jeśli treści OK** — **PRZEJDŹ DO ETAPU 3: DESIGN** (patrz sekcja 7 poniżej)

**NIE COMMITUJ JESZCZE** — najpierw dopracuj design w ETAP 3, potem wizualna weryfikacja w ETAP 4 (`CLAUDE_LANDING_VERIFY.md`).

---

## 6. Raport dla użytkownika

Po zakończeniu weryfikacji przedstaw krótki raport:

```
## Landing Page Review: [nazwa]

### Sekcje: [X/16] funkcji pokrytych
### Placeholdery: [X] (wymóg 12–20)
### Hero: test 5 sekund — [pass/fail]
### Copy: [status] (power words, lorem, subheadline ≤25 słów)
### Spójność z raportem PDF: [ok/rozjazd]

### Uwagi:
- [ewentualne sugestie do treści]
- [sekcje wymagające zdjęć od klienta — z briefem]

### Link: https://tn-crm.vercel.app/landing-pages/[nazwa]/
```

---

## 7. ETAP 3 + 4: Design i Wizualna weryfikacja

**OBOWIĄZKOWE** — po weryfikacji treści przejdź kolejno:

1. **ETAP 3 — `CLAUDE_LANDING_DESIGN.md`** — estetyka, typografia, animacje
2. **ETAP 4 — `CLAUDE_LANDING_VERIFY.md`** — Playwright screenshot w 3 viewportach

Dopiero po ETAP 4 (pozytywna weryfikacja wizualna) wykonaj deploy:

```bash
cd /c/repos_tn/tn-crm && git add landing-pages/[nazwa]/ && git commit -m "Add [nazwa] landing page" && git push
```

**Podaj użytkownikowi link:** `https://tn-crm.vercel.app/landing-pages/[nazwa]/`
