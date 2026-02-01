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
| `workflow.html` | Panel admina — edycja pojedynczego workflow (milestones, branding, produkty, raporty, umowy, sales page) |
| `client-projekt.html` | Portal klienta — widok read-only workflow |
| `workflows.html` | Lista wszystkich workflow |
| `dashboard.html` | Dashboard admina |
| `supabase/migrations/` | Migracje SQL |

## Baza danych — wazne tabele

- `workflows` — glowna tabela workflow
- `workflow_branding` — branding (type: logo, color, font, guideline, mockup, brand_info, other)
- `workflow_products` — produkty powiazane z workflow
- `workflow_reports` — raporty/zalaczniki
- `workflow_milestones` — kamienie milowe
- `workflow_tasks` — zadania w milestones

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

Prompty logo/mockupow generuja sie automatycznie w UI (`generateBrandingPrompts()` w workflow.html).
