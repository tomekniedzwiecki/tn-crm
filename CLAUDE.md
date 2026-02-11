# TN CRM — Kontekst projektu

## Czym jest ten projekt

CRM / system workflow do obslugi klientow. Stack:
- Frontend: vanilla HTML + Tailwind CSS + inline JS (brak frameworka)
- Backend: Supabase (PostgreSQL + Auth + Storage + RLS)
- Deploy: Vercel
- Ikony: Phosphor Icons (`ph ph-*`)
- UI: ciemny motyw (zinc/black), toasty, modale

## Kluczowe pliki

| Plik | Opis |
|------|------|
| `tn-workflow/workflow.html` | Panel admina — edycja pojedynczego workflow (milestones, branding, produkty, raporty, umowy, sales page) |
| `tn-workflow/workflows.html` | Lista wszystkich workflow |
| `tn-workflow/products.html` | Zarządzanie produktami |
| `client-projekt.html` | Portal klienta — widok read-only workflow |
| `dashboard.html` | Dashboard admina |
| `supabase/migrations/` | Migracje SQL |

## Baza danych — wazne tabele

- `workflows` — glowna tabela workflow
- `workflow_branding` — branding (type: logo, color, font, guideline, mockup, brand_info, other)
- `workflow_products` — produkty powiazane z workflow
- `workflow_reports` — raporty/zalaczniki
- `workflow_milestones` — kamienie milowe
- `workflow_tasks` — zadania w milestones
- `workflow_takedrop` — konto TakeDrop (Etap 3): email, haslo, is_active, account_created

RLS: `authenticated` = admin CRUD, `anon` = klient SELECT only.

## Procedury Claude

### Generowanie brandingu
**Plik:** `CLAUDE_BRANDING_PROCEDURE.md`

Kiedy uzytkownik mowi "zrob branding dla workflow X":
1. Przeczytaj `CLAUDE_BRANDING_PROCEDURE.md`
2. Pobierz dane workflow i produktu
3. Przeanalizuj produkt (nazwa, opis, raporty)
4. Wygeneruj: nazwe marki, tagline, opis, 6 kolorow, 3 fonty
5. Daj SQL do wklejenia w Supabase SQL Editor

Prompty logo/mockupow generuja sie automatycznie w UI (`generateBrandingPrompts()` w tn-workflow/workflow.html).

### Generowanie landing page
**Plik:** `CLAUDE_LANDING_PROCEDURE.md`

Kiedy uzytkownik mowi "zrob landing dla workflow X":
1. Przeczytaj `CLAUDE_LANDING_PROCEDURE.md`
2. Pobierz branding, produkty, raporty z Supabase
3. Wybierz motyw (ciemny/jasny) na podstawie kategorii
4. Napisz copy dla kazdej sekcji (PAS framework)
5. Wygeneruj kompletny `index.html` z inline CSS/JS
6. Zapisz do `landing-pages/[nazwa-marki]/index.html`

Wzorce: `landing-pages/vibestrike/` (ciemny), `landing-pages/dentaflow/` (jasny).

## Supabase Edge Functions

### Deploy
Wymagany `SUPABASE_ACCESS_TOKEN` w zmiennych srodowiskowych lub zalogowanie przez `npx supabase login`.

Token mozna wygenerowac: https://supabase.com/dashboard/account/tokens

```bash
# Deploy wszystkich funkcji
npm run deploy:functions

# Deploy pojedynczej funkcji
npm run deploy:send-email
npm run deploy:resend-webhook
npm run deploy:offer-cron
npm run deploy:workflow-stage
npm run deploy:automation-executor
npm run deploy:automation-trigger
npm run deploy:automations  # executor + trigger razem
```

### Lokalizacja funkcji
`supabase/functions/[nazwa-funkcji]/index.ts`

Glowne funkcje:
- `send-email` - wysylanie emaili przez Resend
- `resend-webhook` - odbieranie webhookow z Resend (open/click tracking)
- `offer-emails-cron` - automatyczne maile ofertowe (cron)
- `workflow-stage-completed` - powiadomienia o ukonczeniu etapu
- `automation-executor` - wykonuje kroki automatyzacji (cron co 2 min)
- `automation-trigger` - tworzy automation_execution gdy wystapi event

## System automatyzacji

### Tabele
- `automation_flows` - definicje automatyzacji (trigger, steps)
- `automation_steps` - kroki: action (send_email), delay, condition
- `automation_executions` - wykonania (status, logs, context)

### Triggery
Dostepne trigger_type w automation_flows:
- `offer_created`, `offer_viewed`, `offer_expired`
- `payment_received`, `workflow_created`
- `stage_completed`, `products_shared`, `report_published`
- `branding_delivered`, `sales_page_shared`, `contract_signed`
- `takedrop_activated` (Etap 3 - aktywacja TakeDrop)

### Flow
1. Event (np. stage_completed) -> wywoluje automation-trigger
2. automation-trigger tworzy automation_execution dla aktywnych flow
3. automation-executor (cron) przetwarza execution step by step
4. Kroki: action (wyslij email), delay (poczekaj X dni), condition (if/else)

### Ustawienia
- `settings.automations_master_enabled` - glowny wlacznik (true/false)
- `automation_flows.is_active` - aktywacja pojedynczej automatyzacji
