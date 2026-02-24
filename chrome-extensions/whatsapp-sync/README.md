# WhatsApp CRM Sync - Chrome Extension

Rozszerzenie Chrome do synchronizacji wiadomości WhatsApp z CRM.

## Instalacja

1. Otwórz Chrome i przejdź do `chrome://extensions/`
2. Włącz "Tryb dewelopera" (prawy górny róg)
3. Kliknij "Załaduj rozpakowane"
4. Wybierz folder `whatsapp-sync`

## Konfiguracja

1. Kliknij ikonę rozszerzenia
2. Przejdź do zakładki "Ustawienia"
3. Wpisz:
   - **Supabase URL**: `https://twoj-projekt.supabase.co`
   - **Supabase Anon Key**: klucz anon z ustawień Supabase
4. Kliknij "Zapisz"

## Użycie

### Sync pojedynczego czatu
1. Otwórz WhatsApp Web
2. Wybierz rozmowę
3. Kliknij ikonę rozszerzenia → "Synchronizuj ten czat"

### Sync wszystkich czatów
1. Otwórz WhatsApp Web (może być w tle)
2. Kliknij "Synchronizuj wszystkie nowe czaty"
3. Rozszerzenie przejdzie po wszystkich czatach

### Auto-sync
Włącz w ustawieniach - rozszerzenie będzie automatycznie synchronizować aktywny czat co 30 sekund.

## Ikony

Dodaj ikony w folderze `icons/`:
- `icon16.png` - 16x16 px
- `icon48.png` - 48x48 px
- `icon128.png` - 128x128 px

Możesz użyć logo WhatsApp lub własnego.

## Wymagania

- Uruchomiona migracja SQL: `20260224_whatsapp_messages.sql`
- Zdeployowana edge function: `whatsapp-sync`

## Deploy edge function

```bash
cd tn-crm
npx supabase functions deploy whatsapp-sync --no-verify-jwt
```
