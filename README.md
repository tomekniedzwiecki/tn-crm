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

## 🔄 Workflow Deployment

### Przed deploymentem

1. **Sprawdź zmiany**:
   ```bash
   git status
   git diff
   ```

2. **Testuj lokalnie** (opcjonalnie):
   ```bash
   npx supabase functions serve nazwa-funkcji
   ```

3. **Deploy**:
   ```bash
   npx supabase functions deploy nazwa-funkcji
   ```

4. **Weryfikuj**:
   ```bash
   npx supabase functions logs nazwa-funkcji --tail
   ```

### Najczęstsze funkcje do deploymentu

- `slack-notify` - Powiadomienia Slack
- `send-email` - Wysyłka emaili
- `offer-emails-cron` - Automatyczne emaile dla ofert
- `tpay-webhook` - Obsługa płatności TPay
- `fakturownia-proforma` - Generowanie faktur proforma
- `fakturownia-invoice` - Generowanie faktur końcowych

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
