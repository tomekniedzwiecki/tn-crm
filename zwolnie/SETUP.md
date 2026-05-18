# Zwolnię CRM — Setup dla Claude Code

Prompty z panelu (`/zwolnie/lead?id=X` → tab "Prompt AI") zawierają na końcu sekcję
**KROK ZAPISU** z komendą `curl` do PATCH-owania bazy. Żeby to działało, terminal
w którym pracuje Claude Code musi mieć ustawiony klucz serwisowy.

## Jednorazowy setup

Dodaj do swojego `~/.bashrc` (lub `~/.zshrc`):

```bash
export ZE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaHVzdmtyemFpamN5d3VpdmxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEwNTI1MiwiZXhwIjoyMDk0NjgxMjUyfQ.LHv6K76E2KznVGfxlr3j82aupLR5kDBhPKTzJUw9jnY"
```

Lub jednorazowo w sesji:
```bash
source /c/repos_tn/tn-crm/.env
export ZE_SERVICE_KEY
```

Sprawdź:
```bash
echo "${ZE_SERVICE_KEY:0:40}..."
# Powinno wypisać "eyJhbGciOiJIUzI1NiIs..."
```

## Workflow analizy

1. **Lead trafia z formularza** → widzisz go w https://crm.tomekniedzwiecki.pl/zwolnie/leads
2. **Klikasz lead** → tab "Prompt AI" → wybierasz "Analiza biznesu" → "Kopiuj do schowka"
3. **Wklejasz prompt do Claude Code w VS Code** (w tym repo, żeby Claude miał `ZE_SERVICE_KEY`)
4. **Claude Code:**
   - Generuje analizę JSON
   - Sam wykonuje `curl PATCH` na bazę (instrukcja w prompcie)
   - Potwierdza zapis kontrolnym GET
5. **Wracasz do panelu** (`/zwolnie/lead?id=X#tab=analysis`) — analiza już tam jest, ładnie wyrenderowana

To samo dla **MVP** (prompt `mvp_generator`) i **Maila follow-up** (prompt `follow_up_email` — ten ostatni nie zapisuje, tylko zwraca tekst maila do wklejenia w Gmail).

## Troubleshooting

**`401 Unauthorized` przy curl PATCH:**
- Sprawdź `echo "${ZE_SERVICE_KEY:0:40}"` — czy klucz jest ustawiony
- Jeśli pusty: `source /c/repos_tn/tn-crm/.env` w aktualnym terminalu

**Curl wyrzuca `null` w odpowiedzi GET ale analiza nie pojawia się w panelu:**
- Odśwież stronę lead (F5)
- Lub: idź na `/zwolnie/lead?id={UUID}#tab=analysis`

**Service key wygasł albo trzeba go zmienić:**
- Pobierz nowy: https://supabase.com/dashboard/project/tahusvkrzaijcywuivle/settings/api-keys
- Wymień w `tn-crm/.env` + `~/.bashrc` + zaktualizuj ten plik
