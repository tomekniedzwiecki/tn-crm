# Lead Magnet: OraVibe

## Zawartość

| Plik | Opis |
|------|------|
| `lead-magnet.md` | Pełny content lead magnetu w Markdown (~2000 słów) |
| `assets.md` | Formularz, popup copy, email sequence (5 emaili) |

---

## Jak użyć

### 1. Konwersja na PDF

**Opcja A: Canva (rekomendowane)**
1. Otwórz Canva → Utwórz projekt → A4 PDF
2. Wklej treść z `lead-magnet.md`
3. Zastosuj kolory brandingu (patrz `assets.md` sekcja 6)
4. Dodaj logo OraVibe
5. Eksportuj jako PDF

**Opcja B: Pandoc (szybko)**
```bash
pandoc lead-magnet.md -o lead-magnet.pdf --pdf-engine=wkhtmltopdf
```

**Opcja C: Google Docs**
1. Utwórz nowy dokument
2. Wklej treść
3. Formatuj nagłówki i kolory
4. Plik → Pobierz → PDF

---

### 2. Upload PDF do Supabase

```bash
curl -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/attachments/lead-magnets/oravibe/5-mitow-o-irygatorach.pdf" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/pdf" \
  --data-binary @"5-mitow-o-irygatorach.pdf"
```

**Link do PDF:**
```
https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/lead-magnets/oravibe/5-mitow-o-irygatorach.pdf
```

---

### 3. Dodaj formularz na landing page

Dodaj popup lub sekcję inline z kodem z `assets.md`.

**Endpoint do wysyłki leadów:**
```
POST /supabase/functions/lead-upsert
```

---

### 4. Skonfiguruj automatyzację email

1. Dodaj template emaila do `settings`
2. Utwórz `automation_flow` z trigger `lead_created`
3. Filtruj po `lead_source: 'lead_magnet_oravibe'`

Szczegóły w `assets.md` sekcja 4.

---

## Statystyki do śledzenia

- [ ] Ile osób pobrało PDF
- [ ] Open rate emaili (Resend tracking)
- [ ] Click rate na CTA w emailach
- [ ] Konwersja lead → klient

---

## Kontakt

Workflow ID: `f978547e-6e08-482d-8752-ef083e47c990`
Marka: OraVibe
Landing page: https://crm.tomekniedzwiecki.pl/lp/dentaflow
