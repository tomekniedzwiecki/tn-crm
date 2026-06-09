# Panel Google Ads — MVP backend (setup)

Silnik: **Google Ads Scripts** (bez developer tokena). Architektura: panel → Supabase (kolejka komend + magazyn metryk) → Google Ads Script (executor) → edge functions (rekomendacje).
Pełny plan: `c:/tmp/google-ads-panel-plan.md`.

## Komponenty (zbudowane)
| Co | Gdzie |
|---|---|
| Migracja (8 tabel `gads_*` + RLS + claim + cele) | `supabase/migrations/20260609_gads_panel.sql` |
| Edge `gads-agent` (jedyny endpoint skryptu) | `supabase/functions/gads-agent/` |
| Edge `gads-recommend` (cron, heurystyki) | `supabase/functions/gads-recommend/` |
| Silnik Google Ads Script | `google-ads-scripts/tn-engine.gs` |

## Uruchomienie (kolejność)

### 1. Migracja
Zaaplikuj `20260609_gads_panel.sql` (Supabase SQL Editor lub MCP). Tworzy tabele, RLS, funkcję `gads_claim_commands`, włączniki w `settings`, 5 szablonów celów.

### 2. Sekret współdzielony
Wygeneruj losowy sekret (np. `openssl rand -hex 32`). Ustaw w **dwóch** miejscach z **tą samą** wartością:
- Supabase → Edge Functions → Secrets → `GADS_AGENT_SECRET`
- `tn-engine.gs` → `CONFIG.AGENT_KEY`

> ⚠ W skrypcie jest **tylko** ten sekret. NIGDY nie wklejaj `service_role` — źródło skryptu widzi każdy z dostępem do konta Google Ads.

### 3. Deploy edge functions
```bash
npm run deploy:gads        # gads-agent + gads-recommend (--no-verify-jwt)
```

### 4. Skrypt w Google Ads
Wklej `tn-engine.gs` (Narzędzia → Operacje zbiorcze → Skrypty), Autoryzuj, ustaw harmonogram **co godzinę**. Pętla komend chodzi co godzinę; pełny pull metryk raz dziennie o `CONFIG.METRICS_HOUR`.

### 5. Cron rekomendacji (opcjonalnie teraz)
W Dashboard włącz `pg_cron` + `pg_net`, odkomentuj blok na końcu migracji (podstaw sekret), uruchom. `gads-recommend` poleci codziennie 06:00.

## Włączniki (tabela `settings`)
- `gads_engine_enabled` — główny włącznik silnika (`true`/`false`)
- `gads_kill_switch` — awaryjny stop: `claim` zwraca `[]`, skrypt nie wykonuje mutacji
- `gads_daily_spend_cap_micros` — twardy cap dzienny (`0` = brak)

## Zakres MVP (świadomie wąski)
- Magazyn metryk (dzienny pull, nazwy TrueView) + mirror kampanii.
- Rekomendacje read-only (deterministyczne heurystyki per cel).
- Bezpieczne komendy na **istniejących** kampaniach, **tylko po akceptacji**: `SET_BUDGET`, `PAUSE`, `ENABLE`, `SET_BID_TARGET`.
- **Zero** tworzenia kampanii, zero mutacji audiencji (to Faza 2+).

## ⚠ FAZA 0 — zrobić ręcznie ZANIM panel pokaże sensowne dane
1. Konto + billing + weryfikacja + **timezone** (niezmienne — ustal raz).
2. **Google tag + conversion action** na `/zapisy` (bez tego `conversions = 0`).
3. **Link kanału YouTube** ↔ Google Ads + uprawnienie Engagement + personalized ads ON.
4. Ręcznie zbuduj shells: 3× Video (reach/views/subskrypcje) + Demand Gen + Search. Otaguj wg celu.
5. (Później) YouTube Analytics OAuth refresh token dla `gads_channel_metrics`.

## Pętla komend (jak panel steruje)
1. Panel wstawia wiersz do `gads_commands` (np. po „Akceptuj" rekomendację) z unikalnym `idempotency_key`.
2. Skrypt (≤1h) woła `claim` → atomowo `pending`→`claimed` (FOR UPDATE SKIP LOCKED).
3. Wykonuje (`SET_BUDGET`/`PAUSE`/`ENABLE`/`SET_BID_TARGET`), woła `ack` z wynikiem.
4. Reakcja jest **godzinowa, nie natychmiastowa** — panel pokazuje „w kolejce — zadziała w ~1h".

## Następne (Faza 2+)
Panel HTML (cienki: cel, feed rekomendacji Akceptuj/Odrzuć, ręczny pause/budżet) · ingest YouTube Analytics · formularz earned views/subs · CREATE_CAMPAIGN (Demand Gen/PMax via mutate) · narracja LLM.
