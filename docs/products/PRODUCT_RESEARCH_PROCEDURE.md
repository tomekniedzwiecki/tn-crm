# Produkty V2 — procedura researchu i odświeżania rekomendacji

**Trigger frazy:** „odśwież rekomendacje produktów", „znajdź nowe produkty do katalogu", „research produktów V2"

## Architektura

```
settings.product_research_framework   ← framework scoringu (JSON, wynik market researchu)
product_recommendations               ← rekomendacje ze scoringiem, dowodami, unit economics
tn-workflow/products-v2.html          ← zakładka admina (przegląd, publikacja, awans do katalogu)
docs/products/research-sourcing-workflow.js  ← skrypt Workflow do sourcingu kandydatów
```

Cykl życia rekordu: `draft` → (review Tomka) → `published` (widoczne dla klientów przez anon RLS)
→ `promoted` (awans do `workflow_products`, globalny katalog) lub `archived`.

## Procedura odświeżania (uruchamia Claude)

1. **Pobierz framework** z `settings` (key=`product_research_framework`). Jeśli brak lub starszy niż ~6 miesięcy
   → najpierw uruchom ponownie market research (workflow `tn-product-market-research`, wzorzec w historii sesji
   2026-06-10) i zapisz świeży framework do settings.
2. **Pobierz istniejące rekomendacje**: `SELECT name FROM product_recommendations` — lista do dedupu.
3. **Ustal numer rundy**: `YYYY-MM-Rn` (kolejny n w danym miesiącu).
4. **Uruchom workflow sourcingu**: `Workflow({scriptPath: "docs/products/research-sourcing-workflow.js", args: {...}})`
   z args: `framework`, `existing_names`, `round`, `max_categories` (domyślnie 8), `candidates_per_category` (domyślnie 3).
   Workflow: generatorzy per kategoria → 3 sceptyków per kandydat (marża/popyt/ryzyko, adwersarialnie)
   → scoring per framework (opus). Czas: 30-60 min.
5. **INSERT wyników** do `product_recommendations` (status=`draft`, research_round, valid_until = +60 dni).
   Wszystkie rekordy — także `rejected` (wartość edukacyjna: „sprawdziliśmy i odrzuciliśmy bo…").
   INSERT przez Supabase MCP `execute_sql` lub REST z service key.
6. **Archiwizuj przeterminowane**: `UPDATE product_recommendations SET status='archived' WHERE valid_until < now()
   AND status='draft'` (published/promoted nie ruszamy automatycznie — najpierw zapytaj).
7. **Zweryfikuj w UI**: products-v2.html — sprawdź czy liczby i scoring się renderują.
8. **Raport dla Tomka**: ile recommended/conditional/rejected, top 3 z uzasadnieniem.

## Zasady twarde

- **Konserwatywne liczby zawsze wygrywają**: korekty sceptyków > dane generatorów. Wątpliwość = niższy score.
- **NIE oznaczaj rekomendacji jako `published` bez decyzji Tomka** — publikacja = widoczność dla klientów.
- Rekomendacja się **starzeje**: `valid_until` +60 dni od researchu. Po terminie produkt wymaga re-weryfikacji
  (rynek dropshippingu nasyca się w tygodnie).
- Hard-fail (anty-kryterium naruszone) = `rejected`, niezależnie od score.
- Ceny detaliczne 100-250 zł, marża min. 3× COGS, marża kontrybucyjna musi pokrywać CPA z benchmarków z buforem 20%.
- Obrazy produktów: AliExpress CDN `ae-pic-a1` NIE przyjmuje suffixów resize (`_NxNqXX.jpg` → 404) —
  pobierz przez sharp→webp i hostuj na Supabase Storage `landing/products-v2/<slug>.webp`, albo zostaw puste.

## Skąd wziął się framework (market research 2026-06)

Workflow `tn-product-market-research`: 6 researcherów (Meta Ads Library PL, trendy/popyt PL, case studies D2C PL,
unit economics, frameworki wyboru, ryzyka prawne/platformowe) → critic kompletności → synteza (opus).
Wynik: framework scoringu (wymiary+wagi+jak weryfikować), model ekonomiczny (benchmarki, scenariusze 149/199/249 zł),
shortlist kategorii, anty-kryteria, blacklist nisz przesyconych. Zapisany w `settings.product_research_framework`.

## Przyszłe rozszerzenia (świadomie NIE zrobione teraz)

- Interaktywny wybór klienta w portalu (client-projekt.html, dashboard-screen): pokazanie published rekomendacji
  z uzasadnieniem „dlaczego ten produkt" — RLS anon SELECT na status='published' już gotowe.
- Automatyczna runda miesięczna przez cloud routine (uwaga: network egress block w cloud — WebSearch/WebFetch
  działają, raw REST nie; test przed wdrożeniem).
