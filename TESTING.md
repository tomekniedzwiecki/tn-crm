# Testy TN-CRM

## Komendy

| Komenda | Opis | Kiedy uruchamiać |
|---------|------|------------------|
| `npm run test:webhooks` | Testy webhook (tpay, resend) | **PO KAŻDYM DEPLOYU funkcji Supabase** |
| `npm run test:critical` | Testy KRYTYCZNE (RLS, leads, webhooks) | Przed pushem dużych zmian |
| `npm run test` | Wszystkie testy unit + integration | Raz na tydzień / przed release |
| `npm run test:unit` | Tylko testy jednostkowe | Po zmianach w edge functions |
| `npm run test:integration` | Tylko testy integracyjne | Po zmianach w RLS/schemacie |
| `npm run test:e2e` | Testy E2E (Playwright) | Przed dużym release |
| `npm run test:all` | Webhooks + wszystkie testy | Przed release |

## Kiedy uruchamiać

### Po deployu funkcji Supabase (OBOWIĄZKOWE)
```bash
npm run test:webhooks
```
Sprawdza czy tpay-webhook i resend-webhook są dostępne bez JWT.

### Przed pushem zmian w security/RLS
```bash
npm run test:critical
```

### Przed release
```bash
npm run test:all
```

## Struktura testów

```
tests/
├── unit/                    # Testy jednostkowe
│   ├── tpay-webhook.test.ts    # CRITICAL - płatności
│   ├── lead-upsert.test.ts     # CRITICAL - leady
│   ├── automation.test.ts      # HIGH - automatyzacje
│   └── email.test.ts           # HIGH - emaile
├── integration/             # Testy integracyjne
│   ├── rls-security.test.ts    # CRITICAL - bezpieczeństwo
│   ├── client-offers.test.ts   # CRITICAL - oferty
│   ├── checkout-flow.test.ts   # CRITICAL - checkout
│   └── workflow.test.ts        # HIGH - projekty
├── e2e/                     # Testy E2E
│   └── purchase-flow.spec.ts   # Pełny flow zakupu
└── helpers/                 # Helpery
    ├── setup.ts
    ├── supabase-client.ts
    └── test-utils.ts
```

## Priorytety testów

- **CRITICAL** - Muszą przechodzić zawsze (płatności, bezpieczeństwo)
- **HIGH** - Powinny przechodzić przed release
- **MEDIUM** - Mogą czasem failować przy zmianach schematu

## Aktualny stan

- Testy CRITICAL: **PASS**
- Testy HIGH: Większość PASS
- Niektóre testy failują przez różnice w schemacie bazy (do naprawy)

## Uwagi

1. Testy używają prawdziwej bazy Supabase (nie mockowanej)
2. Testy tworzą dane testowe i je usuwają po zakończeniu
3. Klucz serwisowy jest w `.env` (SUPABASE_SERVICE_KEY)
4. Testy webhook NIE wymagają klucza - testują dostępność bez JWT
