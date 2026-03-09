# Szablony dokumentów prawnych dla sklepu internetowego

## Pliki

| Plik | Opis |
|------|------|
| `regulamin.html` | Regulamin sklepu internetowego |
| `polityka-prywatnosci.html` | Polityka prywatności (RODO) |
| `polityka-cookies.html` | Polityka plików cookies |
| `formularz-odstapienia.html` | Formularz odstąpienia od umowy |

## Zmienne do podmienienia

Wszystkie szablony używają tych samych zmiennych w formacie `{{NAZWA}}`:

### Dane firmy

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `{{BRAND_NAME}}` | Nazwa marki | OraVibe |
| `{{COMPANY_NAME}}` | Pełna nazwa firmy | Jan Kowalski |
| `{{COMPANY_ADDRESS}}` | Adres siedziby | ul. Przykładowa 1, 00-000 Warszawa |
| `{{NIP}}` | NIP | 1234567890 |
| `{{REGON}}` | REGON | 123456789 |
| `{{EMAIL}}` | Email kontaktowy | kontakt@oravibe.pl |
| `{{PHONE}}` | Telefon | +48 123 456 789 |

### Dane sklepu

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `{{DOMAIN}}` | Domena sklepu | oravibe.pl |
| `{{MAIN_URL}}` | Link do strony głównej | https://oravibe.pl |
| `{{PAYMENT_PROVIDER}}` | Operator płatności | Tpay |

### Dostawa

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `{{DELIVERY_TIME_COURIER}}` | Czas dostawy kurier | 1-2 dni robocze |
| `{{DELIVERY_COST_COURIER}}` | Koszt kuriera | 14,99 zł |
| `{{DELIVERY_TIME_INPOST}}` | Czas dostawy InPost | 1-2 dni robocze |
| `{{DELIVERY_COST_INPOST}}` | Koszt InPost | 12,99 zł |

### Daty

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `{{UPDATE_DATE}}` | Data aktualizacji dokumentu | 09.03.2026 |
| `{{YEAR}}` | Aktualny rok | 2026 |

## Jak używać

### 1. Skopiuj szablony do folderu marki

```bash
cp templates/*.html landing-pages/oravibe/
```

### 2. Zamień zmienne

Możesz użyć skryptu lub ręcznie zamienić wszystkie `{{ZMIENNA}}` na właściwe wartości.

**Przykład w JS:**
```javascript
const template = fs.readFileSync('regulamin.html', 'utf8');
const filled = template
  .replace(/\{\{BRAND_NAME\}\}/g, 'OraVibe')
  .replace(/\{\{COMPANY_NAME\}\}/g, 'Jan Kowalski')
  // ... itd.
```

### 3. Linkuj z landing page

W głównym pliku `index.html` dodaj linki w stopce:
```html
<a href="regulamin.html">Regulamin</a>
<a href="polityka-prywatnosci.html">Polityka prywatności</a>
<a href="polityka-cookies.html">Polityka cookies</a>
```

## Zgodność prawna

Szablony są zgodne z:
- Ustawa o prawach konsumenta (Dz.U.2024.1796)
- RODO (Rozporządzenie UE 2016/679)
- Dyrektywa Omnibus (od 01.01.2023)
- Dyrektywa towarowa (UE 2019/771)

**Nie zawierają klauzul abuzywnych** - sprawdzono z rejestrem UOKiK.

## Źródła

- [Rejestr klauzul niedozwolonych UOKiK](https://rejestr.uokik.gov.pl/)
- [Prawa konsumenta UOKiK](https://prawakonsumenta.uokik.gov.pl/)
- [Wzór formularza odstąpienia](https://uokik.gov.pl/downloadId/1216)

---
*Ostatnia aktualizacja: 2026-03-09*
