# Migracja + Modyfikacja istniejącego landingu

> Jeśli tworzysz **NOWY** landing — użyj [`01-direction.md`](01-direction.md).
> Ten plik dotyczy **WYŁĄCZNIE** starych landingów (sprzed kwietnia 2026 lub modyfikacji już istniejących).

> **Safety rules:** [`reference/safety.md`](reference/safety.md) — obowiązują też przy modyfikacjach.

---

## Use case 1 — Migracja (retrospective brief)

**Problem:** landingi sprzed kwietnia 2026 (paromia, h2vital, pupilnik, vibestrike, …) nie mają `_brief.md`. Gdy user prosi o modyfikację, trzeba zrekonstruować brief retrospektywnie.

### Kroki migracji

1. **Przeczytaj HTML** żeby zrozumieć kierunek:
   ```bash
   grep -E "font-family|--primary|--accent|aspect-ratio" landing-pages/[slug]/index.html | head -30
   ```

2. **Pobierz branding z Supabase** (źródło prawdy):
   ```bash
   curl ".../workflow_branding?workflow_id=eq.$UUID&type=in.(brand_info,color,font)&select=*"
   ```

3. **Zidentyfikuj kierunek** patrząc na istniejący landing:
   - Fraunces + Italiana + gold accents → **Editorial/Luxury** (paromia)
   - Plus Jakarta + Instrument Serif + navy → **Panoramic Calm** (vitrix)
   - Playful + rounded + saturated → **Playful/Toy** (pupilnik)
   - Neon + black + glitch → **Retro-Futuristic** (vibestrike)
   - Archivo 800 + dark hero + brass → **Rugged Heritage** (kafina)

4. **Utwórz `_brief.md`** kopiując szablon i wypełniając retrospektywnie:
   ```bash
   cp landing-pages/_templates/_brief.template.md landing-pages/[slug]/_brief.md
   # Wypełnij 8 sekcji ze stanu rzeczywistego landinga
   ```

5. **Walidacja briefa:**
   ```bash
   bash scripts/verify-brief.sh [slug]
   ```

6. **Uruchom verify-landing:**
   ```bash
   bash scripts/verify-landing.sh [slug]
   ```
   Stary landing może failować na nowych safety rules (np. brak JS gate, fonty bez subset). To zwykle normalne — popraw w osobnym commit po zatwierdzeniu briefu.

7. **Commit brief osobno** przed modyfikacjami:
   ```bash
   git add landing-pages/[slug]/_brief.md
   git commit -m "Landing [slug]: retrospective brief migration"
   git push
   ```

**Docelowo:** wszystkie landingi w repo mają `_brief.md`. Robimy to **na żądanie** gdy user modyfikuje stary landing — nie migrujemy wszystkich na raz.

---

## Use case 2 — Modyfikacja istniejącego landingu (continuation protocol)

Gdy user mówi „popraw X w landingu [slug]" / „zmień Y" / „dodaj Z":

### 1. Branch strategy

Nie wymagany feature branch — to pojedynczy edit. Pracuj bezpośrednio na `main`.

### 2. Zawsze zacznij od reading

```bash
cat landing-pages/[slug]/_brief.md   # Manifesto projektu — kontekst decyzji
head -100 landing-pages/[slug]/index.html   # Stan aktualny
```

Jeśli `_brief.md` nie istnieje — wykonaj **najpierw** Use case 1 (Migracja), dopiero potem modyfikuj.

### 3. Przed zmianą strukturalną — sprawdź verify (snapshot „before")

```bash
bash scripts/verify-landing.sh [slug] | tee /c/tmp/verify-before-[slug].txt
```

Jeśli verify już teraz failuje — zapisz state i nie pogarszaj.

### 4. Zmiany ograniczone do wskazanego zakresu

- **NIE** rób „przy okazji" refactorów
- **NIE** zmieniaj manifesta jeśli user prosi o drobną poprawkę
- **NIE** modyfikuj innych landingów
- **Update `_brief.md`** → dopisz wpis do sekcji „Decisions log" z datą/powodem (jeśli zmiana wpływa na manifest)

### 5. Re-run verify + Playwright po zmianach

```bash
bash scripts/verify-landing.sh [slug]   # musi zostać ≥15/18 PASS lub być nie gorzej niż before
bash scripts/screenshot-landing.sh [slug]   # wizualna weryfikacja
```

Jeśli regression (verify spadł względem before) — napraw przed commit.

### 6. Commit + push (zgodnie z [`feedback-landing-auto-deploy.md`](../../../Users/tomek/.claude/projects/c--repos-tn/memory/feedback-landing-auto-deploy.md))

```bash
git add landing-pages/[slug]/
git commit -m "$(cat <<'EOF'
Landing [slug]: [krótki opis zmiany]

Kontekst: [dlaczego użytkownik poprosił]
Co zmienione: [lista precyzyjna]
_brief.md: zaktualizowany (decisions log v[N]) [jeśli dotyczy]
EOF
)"
git push
```

Po push: podaj user link `https://tn-crm.vercel.app/landing-pages/[slug]/`.

---

## Cleanup starych obrazów (opcjonalnie, manualne)

Gdy landing przechodzi regenerację (np. Vitrix — 14 starych → 14 nowych), stare pliki zostają w storage. Nie linkowane, ale zajmują miejsce.

```bash
# List używanych obrazów w aktualnym index.html
grep -oE "ai-generated/[a-z-]+/[0-9_a-z-]+\.(jpg|png|webp)" landing-pages/[slug]/index.html | sort -u > /c/tmp/used_urls.txt

# Lista w storage — wymagana ręczna porównanie (Supabase nie wspiera list API bez service keya)
```

**Rekomendacja:** **nie usuwaj automatycznie**. Stary obraz = rollback option gdy nowy jest gorszy. Storage jest tanie.

---

## Failure modes (AUTO-RUN mode dla modyfikacji)

| Warunek | Akcja | Max retry | Fallback |
|---------|-------|-----------|----------|
| Stary landing nie ma `_brief.md` | Wykonaj migrate.md Use case 1 | 1 | STOP, zapytaj usera |
| verify-landing.sh przed zmianą <15/18 | Zaakceptuj jako baseline (nie pogarszaj) | — | kontynuuj |
| Modyfikacja zepsuła inny check (regression) | Cofnij zmianę, popraw inaczej | 2 | STOP + diff |
| User prosi o zmianę manifesta | Zaktualizuj `_brief.md` Decisions log | — | kontynuuj |

---

## Anty-wzorce (NIE RÓB TEGO)

- ❌ Refactor „przy okazji" gdy user prosi o drobną poprawkę
- ❌ Zmiana manifesta bez aktualizacji `_brief.md` Decisions log
- ❌ Modyfikacja innego landinga niż wskazany
- ❌ Ignorowanie regression (verify spadł)
- ❌ Migracja bez verify-brief.sh
- ❌ Commit `git add .` (może wciągnąć inne zmiany) — używaj `git add landing-pages/[slug]/`

---

## Po modyfikacji

Landing automatycznie deployuje się na Vercel po push. Podaj user link:

```
https://tn-crm.vercel.app/landing-pages/[slug]/
```

Vercel deploy zajmuje ~1-2 minuty. Jeśli landing nie jest live po 2 minutach — sprawdź `vercel ls` i `vercel logs`.
