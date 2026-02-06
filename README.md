# TN CRM

System CRM dla TN Digital z integracją Supabase, obsługą ofert, faktur i workflow.

## 🚀 Tech Stack

- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Frontend**: Vanilla JS, Tailwind CSS
- **Payments**: TPay integration
- **Invoicing**: Fakturownia API
- **Notifications**: Slack webhooks

## 📁 Struktura Projektu

```
tn-crm/
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── email-inbound/
│   │   ├── fakturownia-proforma/
│   │   ├── fakturownia-invoice/
│   │   ├── offer-emails-cron/
│   │   ├── outreach-followup/
│   │   ├── outreach-send/
│   │   ├── outreach-reply-webhook/
│   │   ├── send-email/
│   │   ├── slack-notify/
│   │   ├── tpay-webhook/
│   │   ├── tpay-create-transaction/
│   │   └── workflow-stage-completed/
│   └── migrations/         # Database migrations
├── offer-starter.html      # Starter package offer page
└── README.md              # Ta dokumentacja
```

## 🔧 Setup

### 1. Wymagania

- Node.js 18+
- npm lub yarn
- Dostęp do projektu Supabase (ref: `yxmavwkwnfuphjqbelws`)

### 2. Instalacja

```bash
# Sklonuj repo
git clone <repo-url>
cd tn-crm

# Zainstaluj zależności (jeśli używasz lokalnie)
npm install
```

## 📦 Deployment Edge Functions

### Metoda 1: NPX (Zalecana - bez instalacji)

```bash
# Deploy pojedynczej funkcji
npx supabase functions deploy slack-notify

# Deploy wszystkich funkcji
npx supabase functions deploy

# Lista zainstalowanych funkcji
npx supabase functions list

# Zobacz logi funkcji
npx supabase functions logs slack-notify
```

### Metoda 2: Globalna instalacja przez Scoop (Windows)

```powershell
# Zainstaluj Scoop (jeśli nie masz)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Dodaj bucket Supabase
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# Zainstaluj Supabase CLI
scoop install supabase

# Teraz możesz używać bez npx
supabase functions deploy slack-notify
```

### Konfiguracja Secrets dla Edge Functions

```bash
# Ustaw secrets (environment variables dla funkcji)
npx supabase secrets set SLACK_WEBHOOK_URL=your_webhook_url
npx supabase secrets set FAKTUROWNIA_API_TOKEN=your_token
npx supabase secrets set TPAY_CLIENT_ID=your_client_id
npx supabase secrets set TPAY_CLIENT_SECRET=your_secret

# Zobacz wszystkie secrets
npx supabase secrets list
```

## 🔄 Pełna Procedura Deploymentu

### Krok 1: Przygotowanie zmian

```bash
# Przejdź do katalogu projektu
cd c:\repos_tn\tn-crm

# Sprawdź status repozytorium
git status

# Zobacz szczegóły zmian w plikach
git diff

# Sprawdź które edge functions zostały zmodyfikowane
ls -la supabase/functions/
```

### Krok 2: Testowanie lokalne (opcjonalne)

```bash
# Uruchom funkcję lokalnie do testów
npx supabase functions serve nazwa-funkcji

# W innym terminalu możesz testować funkcję:
curl -i --location --request POST 'http://localhost:54321/functions/v1/nazwa-funkcji' \
  --header 'Content-Type: application/json' \
  --data '{"test": "data"}'
```

### Krok 3: Commit zmian do Git

```bash
# Dodaj zmienione pliki
git add supabase/functions/nazwa-funkcji/

# Lub dodaj wszystkie zmiany
git add .

# Stwórz commit z opisem zmian
git commit -m "Opis zmian w funkcji"

# Push do remote repository
git push
```

### Krok 4: Deploy do Supabase

```bash
# Sprawdź czy jesteś zalogowany
npx supabase projects list

# Deploy pojedynczej funkcji
npx supabase functions deploy nazwa-funkcji

# LUB deploy wszystkich funkcji na raz
npx supabase functions deploy

# Przykład output:
# Deploying funkcji slack-notify (project ref: yxmavwkwnfuphjqbelws)
# Bundled slack-notify size: 5.337kB
# ✓ Deployed Function slack-notify on project yxmavwkwnfuphjqbelws
```

### Krok 5: Weryfikacja deploymentu

```bash
# Zobacz listę wszystkich funkcji
npx supabase functions list

# Sprawdź w dashboardzie Supabase
# https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/functions

# Możesz też przetestować funkcję bezpośrednio
curl -i --location --request POST 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/nazwa-funkcji' \
  --header 'Authorization: Bearer TWOJ_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"test": "data"}'
```

### Krok 6: Monitoring i debugowanie

Jeśli coś nie działa:

```bash
# Dashboard Supabase pokazuje logi w czasie rzeczywistym
# https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/functions/nazwa-funkcji/logs

# Sprawdź czy funkcja jest aktywna
npx supabase functions list

# W razie problemów, ponowny deploy
npx supabase functions deploy nazwa-funkcji --no-verify-jwt
```

---

## 📋 Checklist Deploymentu

Przed każdym deploymentem sprawdź:

- [ ] Zmiany są przetestowane lokalnie
- [ ] Kod jest commitowany do git
- [ ] Sprawdziłeś git status - nie ma niechcianych plików
- [ ] Jesteś zalogowany do Supabase (`npx supabase projects list`)
- [ ] Znasz nazwę funkcji do deploymentu
- [ ] Po deploymencie sprawdziłeś logi w dashboardzie

---

## 🎯 Najczęstsze funkcje do deploymentu

- `slack-notify` - Powiadomienia Slack (używane przy zgłoszeniach)
- `send-email` - Wysyłka emaili (ogólna funkcja mailingowa)
- `offer-emails-cron` - Automatyczne emaile dla ofert (cron job)
- `tpay-webhook` - Obsługa płatności TPay (webhook po płatności)
- `fakturownia-proforma` - Generowanie faktur proforma
- `fakturownia-invoice` - Generowanie faktur końcowych
- `email-inbound` - Obsługa przychodzących emaili
- `workflow-stage-completed` - Akcje po zakończeniu stage'u workflow

---

## ⚠️ Typowe Problemy

### Problem: "Error: Failed to deploy function"
**Rozwiązanie**:
```bash
# Sprawdź czy jesteś zalogowany
npx supabase login

# Sprawdź czy plik index.ts istnieje w funkcji
ls supabase/functions/nazwa-funkcji/index.ts
```

### Problem: "Project not linked"
**Rozwiązanie**:
```bash
# Sprawdź czy istnieje plik .temp/project-ref
cat supabase/.temp/project-ref

# Jeśli nie istnieje, utwórz go:
mkdir -p supabase/.temp
echo "yxmavwkwnfuphjqbelws" > supabase/.temp/project-ref
```

### Problem: Funkcja zwraca błąd 500
**Rozwiązanie**:
```bash
# Sprawdź logi w dashboardzie
# https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/functions/nazwa-funkcji/logs

# Sprawdź czy wszystkie secrets są ustawione
npx supabase secrets list
```

## 📊 Database Migrations

```bash
# Sprawdź status migracji
npx supabase db status

# Zastosuj migracje
npx supabase db push

# Rollback (ostrożnie!)
npx supabase db reset
```

## 🌐 Project Info

- **Project Ref**: `yxmavwkwnfuphjqbelws`
- **Region**: EU (domyślnie)
- **Supabase CLI Version**: 2.75.5+

## 📝 Notatki

- **WAŻNE**: Supabase CLI nie wspiera `npm install -g supabase` - używaj `npx` lub Scoop
- Edge Functions są automatycznie linkowane z projektem przez plik `.temp/project-ref`
- Secrets są współdzielone między wszystkimi funkcjami
- Zawsze testuj funkcje na staging przed produkcją (jeśli masz)

## 🔗 Linki

- [Supabase Dashboard](https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws)
- [Dokumentacja Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)

## 🤝 Contributing

1. Stwórz branch z feature
2. Commit changes
3. Push do branch
4. Otwórz Pull Request

## 📄 License

Proprietary - TN Digital
