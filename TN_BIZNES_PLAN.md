# TN Biznes - Plan Wdrożenia

## 1. Przegląd Projektu

**TN Biznes** to moduł do zarządzania finansami firmy w ramach TN CRM, umożliwiający:
- Śledzenie kosztów (stałych miesięcznych i jednorazowych)
- Rejestrowanie przychodów
- Monitorowanie realizacji planów miesięcznych i kwartalnych
- Wersjonowanie kosztów miesięcznych (zmiana stawki nie wpływa na historię)

---

## 2. Struktura Katalogów

```
tn-crm/
├── tn-biznes/
│   ├── index.html          → Redirect do dashboard.html
│   ├── dashboard.html      → Główny panel (KPI, wykresy, podsumowanie)
│   ├── costs.html          → Zarządzanie kosztami
│   ├── revenues.html       → Zarządzanie przychodami
│   ├── plans.html          → Plany miesięczne i kwartalne
│   └── components/         → (pusty - używa shared-sidebar.js)
│
└── supabase/migrations/
    └── 2026XXXX_biznes_tables.sql
```

---

## 3. Schemat Bazy Danych (Supabase)

### 3.1 Tabela: `biznes_cost_definitions`
Definicje kosztów stałych (szablony).

```sql
CREATE TABLE biznes_cost_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                    -- "Hosting", "Narzędzia AI", "Biuro"
    description TEXT,
    category TEXT NOT NULL,                -- "infrastruktura", "narzędzia", "marketing", "inne"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Tabela: `biznes_cost_versions`
Wersjonowanie kwot kosztów miesięcznych (zmiana stawki = nowa wersja).

```sql
CREATE TABLE biznes_cost_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_definition_id UUID REFERENCES biznes_cost_definitions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,         -- Kwota miesięczna
    valid_from DATE NOT NULL,              -- Od kiedy obowiązuje
    valid_to DATE,                         -- Do kiedy (NULL = aktualna)
    notes TEXT,                            -- "Podwyżka ceny", "Zmiana planu"
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 Tabela: `biznes_costs`
Rzeczywiste koszty (miesięczne generowane automatycznie + jednorazowe ręczne).

```sql
CREATE TABLE biznes_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_definition_id UUID REFERENCES biznes_cost_definitions(id),  -- NULL dla jednorazowych
    cost_version_id UUID REFERENCES biznes_cost_versions(id),        -- NULL dla jednorazowych

    name TEXT NOT NULL,                    -- Nazwa kosztu
    description TEXT,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,

    cost_type TEXT NOT NULL CHECK (cost_type IN ('monthly', 'one_time')),

    -- Dla kosztów miesięcznych
    month DATE,                            -- Pierwszy dzień miesiąca (2026-02-01)

    -- Dla kosztów jednorazowych
    date DATE,                             -- Data poniesienia kosztu

    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Tabela: `biznes_revenues` (tylko przychody spoza CRM)
Przychody ręczne - dla źródeł spoza systemu sprzedaży CRM.

```sql
CREATE TABLE biznes_revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                    -- "Konsultacja zewnętrzna", "Premia"
    description TEXT,
    category TEXT NOT NULL,                -- "zewnętrzne", "inne"
    amount DECIMAL(10,2) NOT NULL,

    date DATE NOT NULL,                    -- Data przychodu

    is_received BOOLEAN DEFAULT false,     -- Czy otrzymano płatność
    received_at TIMESTAMPTZ,

    invoice_number TEXT,                   -- Numer faktury (opcjonalnie)
    client_name TEXT,                      -- Nazwa klienta (opcjonalnie)

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

> **UWAGA:** Główne przychody pochodzą z tabeli `orders` (status='paid').
> Tabela `biznes_revenues` służy tylko do dodawania przychodów spoza CRM.

### 3.5 Tabela: `biznes_plans`
Plany finansowe (miesięczne i kwartalne).

```sql
CREATE TABLE biznes_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'quarterly')),

    -- Dla miesięcznych: 2026-02-01, dla kwartalnych: 2026-01-01 (Q1)
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    target_revenue DECIMAL(10,2) NOT NULL,       -- Planowany przychód
    target_costs_limit DECIMAL(10,2),            -- Limit kosztów (opcjonalnie)
    target_profit DECIMAL(10,2),                 -- Planowany zysk (opcjonalnie)

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(plan_type, period_start)
);
```

### 3.6 Integracja z systemem sprzedaży CRM

**Główne źródło przychodów:** tabela `orders` (istniejąca w CRM)

```sql
-- Struktura orders (już istnieje):
-- orders.id, orders.amount, orders.status, orders.paid_at, orders.created_at
-- orders.customer_name, orders.customer_company, orders.description (offer name)
-- status IN ('pending', 'paid', 'cancelled')
```

**Przychody = opłacone zamówienia (`orders.status = 'paid'`) + ręczne wpisy (`biznes_revenues`)**

### 3.7 Widoki (Views)

```sql
-- Połączone przychody (CRM + ręczne)
CREATE VIEW biznes_all_revenues AS
SELECT
    id,
    description AS name,
    customer_name AS client_name,
    customer_company,
    amount,
    COALESCE(paid_at, created_at)::DATE AS date,
    'crm_order' AS source,
    order_number AS reference
FROM orders
WHERE status = 'paid'

UNION ALL

SELECT
    id,
    name,
    client_name,
    NULL AS customer_company,
    amount,
    date,
    'manual' AS source,
    invoice_number AS reference
FROM biznes_revenues
WHERE is_received = true;

-- Podsumowanie miesięczne
CREATE VIEW biznes_monthly_summary AS
WITH monthly_revenues AS (
    SELECT
        DATE_TRUNC('month', date) AS month,
        SUM(amount) AS total
    FROM biznes_all_revenues
    GROUP BY DATE_TRUNC('month', date)
),
monthly_costs AS (
    SELECT
        DATE_TRUNC('month', COALESCE(month, date)) AS month,
        SUM(amount) AS total
    FROM biznes_costs
    GROUP BY DATE_TRUNC('month', COALESCE(month, date))
)
SELECT
    COALESCE(r.month, c.month) AS month,
    COALESCE(r.total, 0) AS total_revenues,
    COALESCE(c.total, 0) AS total_costs,
    COALESCE(r.total, 0) - COALESCE(c.total, 0) AS profit
FROM monthly_revenues r
FULL OUTER JOIN monthly_costs c ON r.month = c.month
ORDER BY month DESC;

-- Realizacja planu (z rzeczywistą sprzedażą CRM)
CREATE VIEW biznes_plan_realization AS
SELECT
    p.*,

    -- Rzeczywiste przychody (CRM + ręczne)
    COALESCE((
        SELECT SUM(amount) FROM biznes_all_revenues
        WHERE date BETWEEN p.period_start AND p.period_end
    ), 0) AS actual_revenue,

    -- Rzeczywiste koszty
    COALESCE((
        SELECT SUM(amount) FROM biznes_costs c
        WHERE COALESCE(c.month, c.date) BETWEEN p.period_start AND p.period_end
    ), 0) AS actual_costs,

    -- Obliczenia procentowe
    CASE
        WHEN p.target_revenue > 0 THEN
            ROUND((COALESCE((SELECT SUM(amount) FROM biznes_all_revenues
                             WHERE date BETWEEN p.period_start AND p.period_end), 0)
                   / p.target_revenue * 100)::numeric, 1)
        ELSE 0
    END AS revenue_realization_percent,

    -- Zysk rzeczywisty
    COALESCE((SELECT SUM(amount) FROM biznes_all_revenues
              WHERE date BETWEEN p.period_start AND p.period_end), 0)
    - COALESCE((SELECT SUM(amount) FROM biznes_costs c
                WHERE COALESCE(c.month, c.date) BETWEEN p.period_start AND p.period_end), 0)
    AS actual_profit

FROM biznes_plans p;

-- Pipeline (potencjalne przychody z aktywnych leadów)
CREATE VIEW biznes_pipeline_summary AS
SELECT
    DATE_TRUNC('month', CURRENT_DATE) AS month,
    COUNT(*) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')) AS active_leads,
    SUM(deal_value) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')) AS pipeline_value,
    COUNT(*) FILTER (WHERE status = 'won' AND updated_at >= DATE_TRUNC('month', CURRENT_DATE)) AS won_this_month,
    COUNT(*) FILTER (WHERE status = 'lost' AND updated_at >= DATE_TRUNC('month', CURRENT_DATE)) AS lost_this_month
FROM leads;
```

---

## 4. Interfejs Użytkownika

### 4.1 Dashboard (`dashboard.html`)

**Nagłówek:**
- Tytuł: "TN Biznes"
- Selektor okresu: Miesiąc / Kwartał / Rok
- Przycisk eksportu

**Sekcja KPI (5 kart):**
```
┌───────────────┬───────────────┬───────────────┬───────────────┬───────────────┐
│  Przychody    │   Koszty      │    Zysk       │  Realizacja   │   Pipeline    │
│  12 450 zł    │  3 200 zł     │  9 250 zł     │    78%        │  25 000 zł    │
│  ↑ 15% vs LM  │  ↓ 5% vs LM   │  ↑ 23% vs LM  │  Plan: 16k    │  8 leadów     │
│  [z CRM: 11k] │               │               │               │               │
└───────────────┴───────────────┴───────────────┴───────────────┴───────────────┘
```

> **Źródło danych:**
> - Przychody = `orders` (status='paid') + `biznes_revenues` (ręczne)
> - Pipeline = `leads` (status IN active stages) z `deal_value`

**Wykres główny:**
- Przychody vs Koszty vs Zysk (ostatnie 6 miesięcy)
- Chart.js z ciemnym motywem

**Sekcja szczegółów:**
```
┌─────────────────────────────────────┬─────────────────────────────────────┐
│  Koszty wg kategorii (pie chart)    │  Top 5 źródeł przychodów            │
│  ● Narzędzia: 45%                   │  1. Projekt ABC - 5 000 zł          │
│  ● Infrastruktura: 30%              │  2. Usługa XYZ - 3 500 zł           │
│  ● Marketing: 15%                   │  3. Produkt 123 - 2 100 zł          │
│  ● Inne: 10%                        │  ...                                │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

**Sekcja alertów:**
- Zbliżające się terminy płatności
- Przekroczenia limitów
- Niezapłacone faktury

### 4.2 Koszty (`costs.html`)

**Nagłówek:**
- Tytuł: "Koszty"
- Filtry: Miesiąc | Kategoria | Typ (stałe/jednorazowe)
- Przycisk: "+ Dodaj koszt"

**Widok tabeli:**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Nazwa              │ Kategoria      │ Typ        │ Kwota     │ Status │ ···  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ChatGPT Plus       │ Narzędzia      │ Miesięczny │ 89 zł     │ ✓ Opł. │ ··· │
│ Hosting Vercel     │ Infrastruktura │ Miesięczny │ 120 zł    │ ○ Do   │ ··· │
│ Licencja Figma     │ Narzędzia      │ Jednoraz.  │ 450 zł    │ ✓ Opł. │ ··· │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Modal: Dodaj/Edytuj koszt:**
```
┌─────────────────────────────────────────────────────────┐
│  Dodaj nowy koszt                               [×]     │
├─────────────────────────────────────────────────────────┤
│  Typ kosztu:                                            │
│  [● Miesięczny (stały)]  [○ Jednorazowy]                │
│                                                         │
│  Nazwa: [________________________]                      │
│  Kategoria: [▼ Wybierz kategorię  ]                     │
│  Kwota: [________] zł                                   │
│                                                         │
│  [Jeśli miesięczny:]                                    │
│  Od kiedy: [02/2026 ▼]                                  │
│  ☐ Użyj istniejącej definicji kosztu                    │
│                                                         │
│  [Jeśli jednorazowy:]                                   │
│  Data: [04.02.2026]                                     │
│                                                         │
│  Opis (opcjonalnie):                                    │
│  [_____________________________________________]        │
│                                                         │
│              [Anuluj]  [Zapisz]                          │
└─────────────────────────────────────────────────────────┘
```

**Sekcja: Definicje kosztów stałych:**
- Lista szablonów (ChatGPT, Hosting, etc.)
- Przycisk edycji stawki (tworzy nową wersję)
- Historia zmian stawek

### 4.3 Przychody (`revenues.html`)

**Nagłówek:**
- Tytuł: "Przychody"
- Przełącznik źródła: **Wszystkie** | Z CRM | Ręczne
- Filtry: Miesiąc | Kategoria
- Przycisk: "+ Dodaj ręcznie" (dla przychodów spoza CRM)

**Widok tabeli (połączone dane z CRM + ręczne):**
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Źródło │ Nazwa              │ Klient         │ Kwota     │ Data       │ Ref.     │ ···│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🛒 CRM │ Landing Page Pro   │ ABC Sp. z o.o. │ 5 000 zł  │ 02.02.2026 │ ORD-0042 │ ···│
│ 🛒 CRM │ SEO Starter        │ XYZ S.A.       │ 2 500 zł  │ 01.02.2026 │ ORD-0041 │ ···│
│ ✏️ Ręcz│ Konsultacja zewn.  │ Jan Kowalski   │ 800 zł    │ 28.01.2026 │ FV/01/26 │ ···│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

> **Legenda:**
> - 🛒 CRM = automatycznie z tabeli `orders` (status='paid')
> - ✏️ Ręczne = ręcznie dodane w TN Biznes (dla przychodów spoza systemu)

**Podsumowanie u góry:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Luty 2026                                                      │
│  Łącznie: 8 300 zł  │  Z CRM: 7 500 zł  │  Ręczne: 800 zł      │
│  Zamówienia: 3      │  Ręczne wpisy: 1                          │
└─────────────────────────────────────────────────────────────────┘
```

**Modal: Dodaj ręczny przychód** (tylko dla źródeł spoza CRM):
- Nazwa, Opis
- Klient (opcjonalnie)
- Kwota, Data
- Numer faktury (opcjonalnie)
- Status: Otrzymano / Oczekuje

> **UWAGA:** Zamówienia z CRM są tylko do odczytu - edycja w module Zamówienia.

### 4.4 Plany (`plans.html`)

**Nagłówek:**
- Tytuł: "Plany finansowe"
- Przełącznik: Miesięczne | Kwartalne
- Przycisk: "+ Nowy plan"

**Widok kart planów (z rzeczywistą sprzedażą CRM):**
```
┌─────────────────────────────────────┬─────────────────────────────────────┐
│  Luty 2026                    🟢    │  Q1 2026                      🟡    │
│  ══════════════════════════════     │  ══════════════════════════════     │
│  Plan przychodu: 15 000 zł          │  Plan przychodu: 45 000 zł          │
│  Realizacja: 12 450 zł (83%)        │  Realizacja: 28 000 zł (62%)        │
│  [████████████░░░░] 83%             │  [████████████░░░░░░░░░] 62%        │
│                                     │                                     │
│  📊 Źródła przychodu:               │  📊 Źródła przychodu:               │
│  • Z CRM: 11 650 zł (5 zamówień)    │  • Z CRM: 26 500 zł (12 zamówień)   │
│  • Ręczne: 800 zł (1 wpis)          │  • Ręczne: 1 500 zł (3 wpisy)       │
│                                     │                                     │
│  💰 Koszty: 3 200 / 4 000 zł        │  💰 Koszty: 9 500 / 12 000 zł       │
│  📈 Zysk: 9 250 zł (cel: 11 000)    │  📈 Zysk: 18 500 zł (cel: 33 000)   │
│                                     │                                     │
│  🔮 Pipeline: 8 500 zł (3 leady)    │  🔮 Pipeline: 8 500 zł              │
│                                     │                                     │
│  [Edytuj plan]  [Szczegóły]         │  [Edytuj plan]  [Szczegóły]         │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

**Legenda statusu:**
- 🟢 Zielony = realizacja >= 80% lub przekroczona
- 🟡 Żółty = realizacja 50-79%
- 🔴 Czerwony = realizacja < 50%

**Modal: Szczegóły realizacji:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Szczegóły realizacji: Luty 2026                                      [×]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRZYCHODY (12 450 zł / 15 000 zł)                                          │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                             │
│  Z CRM (orders.status='paid'):                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ ORD-0042 │ Landing Page Pro   │ ABC Sp. z o.o. │ 5 000 zł │ 02.02    │ │
│  │ ORD-0041 │ SEO Starter        │ XYZ S.A.       │ 2 500 zł │ 01.02    │ │
│  │ ORD-0040 │ Branding Basic     │ Firma 123      │ 4 150 zł │ 29.01    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  Suma z CRM: 11 650 zł                                                      │
│                                                                             │
│  Ręczne wpisy:                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Konsultacja zewnętrzna         │ Jan Kowalski   │ 800 zł   │ 28.01    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  Suma ręcznych: 800 zł                                                      │
│                                                                             │
│  PIPELINE (potencjalne):                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Lead: Nowa firma ABC    │ Propozycja  │ deal_value: 3 500 zł          │ │
│  │ Lead: Startup XYZ       │ Negocjacje  │ deal_value: 5 000 zł          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  Suma pipeline: 8 500 zł                                                    │
│                                                                             │
│                                                          [Zamknij]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Integracja z Shared Sidebar

Dodanie TN Biznes do `shared-sidebar.js`:

```javascript
const APPS = [
    { id: 'crm', name: 'TN CRM', icon: 'ph-lightning', ... },
    { id: 'workflow', name: 'TN Workflow', icon: 'ph-path', ... },
    { id: 'todo', name: 'TN Todo', icon: 'ph-checks', ... },
    { id: 'stack', name: 'TN Stack', icon: 'ph-stack', ... },
    { id: 'biznes', name: 'TN Biznes', icon: 'ph-chart-line-up',
      color: 'bg-emerald-500 text-white', defaultPage: 'dashboard' }  // NOWE
];

const NAV_ITEMS = {
    // ...existing
    biznes: [
        { id: 'dashboard', label: 'Przegląd', icon: 'ph-chart-pie', href: 'dashboard.html' },
        { id: 'costs', label: 'Koszty', icon: 'ph-wallet', href: 'costs.html' },
        { id: 'revenues', label: 'Przychody', icon: 'ph-money', href: 'revenues.html' },
        { id: 'plans', label: 'Plany', icon: 'ph-target', href: 'plans.html' }
    ]
};

const APP_AVATAR_COLORS = {
    // ...existing
    biznes: 'from-emerald-600 to-teal-700'
};
```

---

## 6. Paleta Kolorów TN Biznes

```css
:root {
    /* Background */
    --bg-primary: #050505;
    --bg-secondary: #0A0A0A;
    --bg-tertiary: #111111;

    /* Borders */
    --border-subtle: rgba(255,255,255,0.08);
    --border-default: #27272a;

    /* Text */
    --text-primary: #EDEDED;
    --text-muted: #A1A1AA;
    --text-faint: #52525B;

    /* Accent (TN Biznes - emerald/teal) */
    --accent-primary: #10B981;    /* Emerald 500 */
    --accent-secondary: #14B8A6;  /* Teal 500 */
    --accent-glow: rgba(16, 185, 129, 0.2);

    /* Status */
    --success: #22C55E;
    --warning: #F59E0B;
    --danger: #EF4444;
    --info: #3B82F6;
}
```

---

## 7. Etapy Wdrożenia

### Faza 1: Baza danych (1)
- [ ] Utworzenie migracji SQL
- [ ] Utworzenie tabel: `biznes_cost_definitions`, `biznes_cost_versions`, `biznes_costs`, `biznes_revenues`, `biznes_plans`
- [ ] Utworzenie widoków
- [ ] Konfiguracja RLS policies
- [ ] Testowe dane

### Faza 2: Struktura projektu (2)
- [ ] Utworzenie katalogu `tn-biznes/`
- [ ] Utworzenie `index.html` (redirect)
- [ ] Aktualizacja `shared-sidebar.js`

### Faza 3: Dashboard (3)
- [ ] Utworzenie `dashboard.html`
- [ ] Implementacja KPI cards
- [ ] Implementacja wykresów (Chart.js)
- [ ] Implementacja podsumowań
- [ ] Responsywność

### Faza 4: Moduł kosztów (4)
- [ ] Utworzenie `costs.html`
- [ ] Lista kosztów z filtrami
- [ ] Modal dodawania/edycji kosztu
- [ ] Rozróżnienie miesięczne/jednorazowe
- [ ] Zarządzanie definicjami kosztów stałych
- [ ] Wersjonowanie stawek

### Faza 5: Moduł przychodów (5)
- [ ] Utworzenie `revenues.html`
- [ ] Lista przychodów z filtrami
- [ ] Modal dodawania/edycji przychodu
- [ ] Powiązanie z TN Workflow (opcjonalne)

### Faza 6: Moduł planów (6)
- [ ] Utworzenie `plans.html`
- [ ] Plany miesięczne
- [ ] Plany kwartalne
- [ ] Wizualizacja realizacji
- [ ] Alerty o przekroczeniach

### Faza 7: Finalizacja (7)
- [ ] Testy end-to-end
- [ ] Optymalizacja wydajności
- [ ] Dokumentacja

---

## 8. Technologie

- **Frontend:** HTML5, Tailwind CSS (CDN), Vanilla JavaScript
- **Backend:** Supabase (PostgreSQL + RLS)
- **Wykresy:** Chart.js
- **Ikony:** Phosphor Icons
- **Fonty:** Inter, JetBrains Mono

---

## 9. Uwagi Implementacyjne

### Wersjonowanie kosztów miesięcznych
Gdy użytkownik zmienia stawkę kosztu stałego (np. ChatGPT z 89 zł na 99 zł):
1. Zamykamy aktualną wersję (`valid_to = dzisiaj`)
2. Tworzymy nową wersję (`valid_from = następny miesiąc`)
3. Historyczne koszty pozostają niezmienione

### Generowanie kosztów miesięcznych
- Cron job / Edge Function na początku każdego miesiąca
- Lub generowanie "on-demand" przy wejściu na dashboard
- Sprawdzenie aktywnych definicji i ich bieżących wersji
- Utworzenie rekordów w `biznes_costs`

### Kategorie kosztów
```javascript
const COST_CATEGORIES = [
    { id: 'infrastructure', label: 'Infrastruktura', icon: 'ph-hard-drives' },
    { id: 'tools', label: 'Narzędzia', icon: 'ph-wrench' },
    { id: 'marketing', label: 'Marketing', icon: 'ph-megaphone' },
    { id: 'office', label: 'Biuro', icon: 'ph-buildings' },
    { id: 'services', label: 'Usługi zewnętrzne', icon: 'ph-users' },
    { id: 'other', label: 'Inne', icon: 'ph-dots-three' }
];
```

### Kategorie przychodów
```javascript
const REVENUE_CATEGORIES = [
    { id: 'project', label: 'Projekt', icon: 'ph-folder' },
    { id: 'service', label: 'Usługa', icon: 'ph-handshake' },
    { id: 'product', label: 'Produkt', icon: 'ph-package' },
    { id: 'subscription', label: 'Subskrypcja', icon: 'ph-repeat' },
    { id: 'other', label: 'Inne', icon: 'ph-dots-three' }
];
```

---

## 10. Integracja z CRM - Podsumowanie

### Źródła danych dla TN Biznes

| Dane | Źródło | Tabela | Warunek |
|------|--------|--------|---------|
| **Przychody (główne)** | CRM | `orders` | `status = 'paid'` |
| **Przychody (dodatkowe)** | TN Biznes | `biznes_revenues` | `is_received = true` |
| **Pipeline** | CRM | `leads` | `status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation')` |
| **Koszty** | TN Biznes | `biznes_costs` | wszystkie |
| **Plany** | TN Biznes | `biznes_plans` | wszystkie |

### Przepływ danych

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TN CRM                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │   LEADS     │───▶│   OFFERS    │───▶│   ORDERS    │                      │
│  │ deal_value  │    │   price     │    │ status=paid │                      │
│  │ status      │    │             │    │ amount      │                      │
│  └─────────────┘    └─────────────┘    └──────┬──────┘                      │
│        │                                      │                             │
│        │ Pipeline                             │ Przychody                   │
│        ▼                                      ▼                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         TN BIZNES                                    │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   │
│  │  │ biznes_costs  │  │biznes_revenues│  │ biznes_plans  │            │   │
│  │  │ (koszty)      │  │ (ręczne tylko)│  │ (cele)        │            │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │   │
│  │           │                 │                  │                     │   │
│  │           ▼                 ▼                  ▼                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │              biznes_plan_realization (VIEW)                  │    │   │
│  │  │  actual_revenue = orders(paid) + biznes_revenues(received)   │    │   │
│  │  │  actual_costs = biznes_costs                                 │    │   │
│  │  │  actual_profit = actual_revenue - actual_costs               │    │   │
│  │  │  realization_% = actual_revenue / target_revenue * 100       │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Przykład zapytania JS (frontend)

```javascript
// Pobierz realizację planu miesięcznego
async function getMonthlyRealization(year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    // Przychody z CRM (opłacone zamówienia)
    const { data: orders } = await supabase
        .from('orders')
        .select('amount, paid_at, description, customer_name, order_number')
        .eq('status', 'paid')
        .gte('paid_at', startDate)
        .lte('paid_at', endDate + 'T23:59:59');

    // Przychody ręczne
    const { data: manualRevenues } = await supabase
        .from('biznes_revenues')
        .select('*')
        .eq('is_received', true)
        .gte('date', startDate)
        .lte('date', endDate);

    // Koszty
    const { data: costs } = await supabase
        .from('biznes_costs')
        .select('*')
        .or(`month.eq.${startDate},and(date.gte.${startDate},date.lte.${endDate})`);

    // Plan
    const { data: plan } = await supabase
        .from('biznes_plans')
        .select('*')
        .eq('plan_type', 'monthly')
        .eq('period_start', startDate)
        .single();

    // Pipeline
    const { data: pipeline } = await supabase
        .from('leads')
        .select('deal_value, status, name')
        .in('status', ['new', 'contacted', 'qualified', 'proposal', 'negotiation']);

    const crmRevenue = orders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
    const manualRevenue = manualRevenues.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const totalRevenue = crmRevenue + manualRevenue;
    const totalCosts = costs.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const pipelineValue = pipeline.reduce((sum, l) => sum + parseFloat(l.deal_value || 0), 0);

    return {
        revenue: {
            total: totalRevenue,
            fromCRM: crmRevenue,
            manual: manualRevenue,
            orders: orders,
            manualEntries: manualRevenues
        },
        costs: {
            total: totalCosts,
            items: costs
        },
        profit: totalRevenue - totalCosts,
        plan: plan,
        realization: plan ? (totalRevenue / plan.target_revenue * 100).toFixed(1) : 0,
        pipeline: {
            value: pipelineValue,
            leads: pipeline
        }
    };
}
```

---

*Plan utworzony: 2026-02-04*
*Wersja: 1.1 - z integracją CRM*
