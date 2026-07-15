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

### 2026-07-03 (wieczór) — Iteracje z odbioru + snapshoty AliExpress

Zakres: osobna apka TN Sklepy, usunięcie etapu Start/kroku Raport, warsztat kroku (drawer),
redesign Geist, podgląd projektów, picker /trendy, generacje typ A, przenoszenie z v1,
marża z aukcji (NBP), diagnoza i naprawa bud-ali-snapshot + backfill 136 produktów,
2 agenty code-review (porządki).

| Składnik | Tokeny | Koszt API (szac.) |
|---|---|---|
| Główna pętla — output (ekrany/warsztat/fixy/SQL ~45k) | ~45 000 | ~$2,3 |
| Główna pętla — input kumulacyjny (szac., ~90 wywołań, głównie cache read) | ~9M | ~$14 |
| Agenty code-review ×2 (zmierzone po zakończeniu — patrz niżej) | ~200 000 | ~$2,0 |
| **Razem wieczór** | **~9,3M (szacunek)** | **~$18 (zakres $13–25) ≈ 67 zł** |

### 2026-07-15 — Koncepcja produkcyjna + system decyzji testów (sekcja 0b)

Zakres: 3 agenty badawcze (mapa stanu wf2, wnioski z sesji fachmat, wzorce TN App) + agent
projektujący system testów (Opus + web research), projekt rozwojowy `baacc66f` (5 produktów
z /trendy), migracje `20260715_wf2_produkcja_fundament` + `20260715b_wf2_testy_dane`,
SSOT 0b + WORKFLOW-V2-TESTY.md, settings `wf2_test_config`/`wf2_scale_config`, pamięć.

| Składnik | Tokeny | Koszt API (szac.) |
|---|---|---|
| Subagenty ×4 Opus (ZMIERZONE: 157k+132k+133k+101k) | 523 000 | ~$5,0 (cennik Opus) |
| Główna pętla Fable — output (SSOT/TESTY/migracje/synteza, szac.) | ~35 000 | ~$1,8 |
| Główna pętla Fable — input kumulacyjny (szac., ~45 wywołań, głównie cache read) | ~4M | ~$8 |
| **Razem 15.07 (do domknięcia systemu testów)** | **~4,6M (w tym 523k zmierzone)** | **~$15 (zakres $11–20) ≈ 55 zł** |

### 2026-07-15 (po południu/wieczór) — Etap 1 pilota + landing Chłodzik + standardy

Zakres: marka Znajdzik (research 45 domen + 5 log) → pętla brandingu 4 rundy → landing koca
(budowa+rewizja+2 rundy CRO na żywo+3 grafiki AI+wideo self-host) → STANDARD-LANDING-SKLEPY +
architektura v3 mini-marki (Chłodzik) → GEO (research+wdrożenie) → biblioteka DS (definicje 8 +
fabryka w toku). Edge: wf2-asset-rehost. Decyzje Tomka wplatane na żywo (6 dużych zwrotów).

| Składnik | Tokeny | Koszt API (szac.) |
|---|---|---|
| Subagenty Opus ×10 zmierzone (marka 75k, branding 47k, krytycy 33+55+59k, budowa 148k, rewizja 121k, CRO-live 145+166k, GEO 88k, reklamy-v1 106k) | ~1 043 000 | ~$10 |
| Fabryka styleguide'ów (w toku — dopisać po zakończeniu) | ~? | ~? |
| Główna pętla Fable — output (standard/TESTY/GEO/edycje landingu/SQL/pamięć) | ~55 000 | ~$2,8 |
| Główna pętla Fable — input kumulacyjny (~120 wywołań, głównie cache read) | ~11M | ~$20 |
| Generacje obrazów (5 log + 3 landing + 1 retry, gpt-image-2 medium) | — | ~$1,5 |
| **Razem blok popołudniowy** | **~12M (w tym 1,04M zmierzone)** | **~$34 (zakres $26–45) ≈ 126 zł** |

### Suma narastająco (po całym 2026-07-03)

| | Tokeny (szac.) | Koszt API (szac.) |
|---|---|---|
| **Przygotowanie + F1 + iteracje odbioru + snapshoty** | ~17M | **~$40 (zakres $28–55) ≈ 148 zł** |

### [ARCHIWUM] Suma po F1

| | Tokeny (szac.) | Koszt API (szac.) |
|---|---|---|
| **Przygotowanie + F1** | ~8,0M | **~$21,5 (zakres $15–30) ≈ 80 zł** |

Uwaga: bez prompt cache te same prace kosztowałyby po API ~3–4× więcej (~$60–75), bo każdy
z ~60 wywołań narzędzi czyta pełny kontekst rozmowy po pełnej stawce $10/M.
