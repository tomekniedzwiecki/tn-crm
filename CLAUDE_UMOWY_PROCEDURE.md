# Procedura tworzenia umów dla klientów

## Struktura folderów

```
umowy/
├── umowa-budowa-sklepu.html    # WZOR - publiczny, NIE MODYFIKUJ
├── klienci/                     # PRYWATNE - w .gitignore
│   ├── adrian-prus.html
│   ├── jan-kowalski.html
│   └── ...
```

## Zasady

1. **NIGDY nie modyfikuj wzoru** `umowa-budowa-sklepu.html` bez wyraźnej prośby użytkownika
2. **Wzór jest publiczny** - dostępny pod `https://crm.tomekniedzwiecki.pl/umowy/umowa-budowa-sklepu.html`
3. **Umowy klientów są prywatne** - folder `umowy/klienci/` jest w `.gitignore`

## Procedura tworzenia umowy dla klienta

### Krok 1: Skopiuj wzór
```bash
cp umowy/umowa-budowa-sklepu.html umowy/klienci/imie-nazwisko.html
```

### Krok 2: Wprowadź zmiany
Na podstawie ustaleń z klientem zmodyfikuj kopię w `umowy/klienci/`:
- Dane klienta (imię, nazwisko, email, NIP, adres)
- Negocjowane warunki (kary umowne, terminy wykupu, udział procentowy itp.)

### Krok 3: Poinformuj o lokalizacji
Umowa jest dostępna TYLKO lokalnie:
```
c:\repos_tn\tn-crm\umowy\klienci\imie-nazwisko.html
```

NIE jest dostępna online (folder w .gitignore).

## Przykład użycia

Użytkownik: "Zrób umowę dla Jana Kowalskiego, obniż kary o 30%"

1. Kopiuję `umowa-budowa-sklepu.html` → `umowy/klienci/jan-kowalski.html`
2. Wprowadzam dane klienta
3. Obniżam kary o 30%
4. Informuję o lokalizacji pliku

## Typowe modyfikacje

| Element | Lokalizacja w pliku |
|---------|---------------------|
| Dane klienta | Strona 1, sekcja "Zleceniodawca" |
| Udział % w dochodzie | § 3A ust. 1 |
| Czas trwania udziału | § 3A ust. 3 |
| Warunki wykupu | § 3A ust. 19-21 (sekcja F) |
| Kary umowne | § 3A ust. 9 (2500 zł) i ust. 14 (50000 zł) |
| Spółka z o.o. | § 3A ust. 10-12 (sekcja C) |
| Sprzedaż sklepu | § 3A ust. 17-18 (sekcja E) |
