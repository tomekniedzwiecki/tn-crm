# Workflow v2 — licznik tokenów Fable 5 i koszt „gdyby po API"

Prowadzony na życzenie Tomka (2026-07-03). Wpis per blok pracy, dopisywany na końcu każdej fazy.

## Cennik API (Claude Fable 5, potwierdzony 2026-07-03)

| Pozycja | Cena |
|---|---|
| Input | **$10 / 1M tokenów** |
| Output | **$50 / 1M tokenów** |
| Cache read | ~$1 / 1M (10% ceny input) |
| Cache write | ~$12,50 / 1M |
| Batch API | −50% |

## Metodologia (uczciwie o dokładności)

- **Subagenty (Explore itd.)**: harness raportuje dokładną liczbę tokenów per agent — te liczby są ZMIERZONE.
- **Główna pętla (moja rozmowa)**: nie mam wglądu w licznik billingowy — SZACUJĘ z liczby wywołań,
  średniej wielkości kontekstu i objętości wygenerowanych plików/odpowiedzi. Realny koszt przy API
  zależy mocno od cache'owania promptów (kontekst rozmowy czytany jest przy każdym wywołaniu narzędzia;
  z cache płaci się ~10% stawki input). Podaję zakres: dolna granica = dobre cache'owanie, górna = słabe.
- Kurs orientacyjny 1 USD ≈ 3,7 zł.

## Wpisy

### 2026-07-03 — Faza przygotowawcza (SSOT procesu + rozpoznanie + plan v2)

Zakres: aktualizacja mózgu /sklep (proces po rezerwacji), 3 agenty Explore (architektura workflow v1,
backend /sklep, integracja Meta), plan WORKFLOW-V2-PLAN.md, pytania i decyzje.

| Składnik | Tokeny | Koszt API (szac.) |
|---|---|---|
| Subagenty Explore ×3 (ZMIERZONE) | 321 466 (73k + 153k + 96k) | ~$3,0 |
| Główna pętla — output (szac.) | ~20 000 | ~$1,0 |
| Główna pętla — input kumulacyjny (szac., ~25 wywołań × ~90k kontekstu, głównie cache read) | ~2,3M | ~$5,0 |
| **Razem faza przygotowawcza** | **~2,6M (w tym 321k zmierzone)** | **~$9 (zakres $6–13) ≈ 33 zł** |

### 2026-07-03 — F1 Fundament (implementacja)

Zakres: migracja wf2_* (8 tabel + RLS + seed 32 kroków + ensure_steps), sklepy.html,
sklep-projekt.html (macierz portfela, kalkulator marży, płatności), sidebar, tpay-webhook
auto-create, rewrites, deploy + test:webhooks 4/4, commit ×2.

| Składnik | Tokeny | Koszt API (szac.) |
|---|---|---|
| Główna pętla — output (migracja ~2×5k, ekrany ~14k, webhook/misc ~6k) | ~30 000 | ~$1,5 |
| Główna pętla — input kumulacyjny (szac., ~35 wywołań × ~120k kontekstu, głównie cache read) | ~4,2M | ~$8,5 |
| Subagenty | 0 | $0 |
| Poprawka struktury (osobna apka tn-sklepy, domena, diagnoza logowania) | ~1,2M input + ~8k output (szac.) | ~$2,5 |
| **Razem F1 (z poprawką)** | **~5,4M (szacunek)** | **~$12,5 (zakres $9–17) ≈ 46 zł** |

### Suma narastająco

| | Tokeny (szac.) | Koszt API (szac.) |
|---|---|---|
| **Przygotowanie + F1** | ~8,0M | **~$21,5 (zakres $15–30) ≈ 80 zł** |

Uwaga: bez prompt cache te same prace kosztowałyby po API ~3–4× więcej (~$60–75), bo każdy
z ~60 wywołań narzędzi czyta pełny kontekst rozmowy po pełnej stawce $10/M.
