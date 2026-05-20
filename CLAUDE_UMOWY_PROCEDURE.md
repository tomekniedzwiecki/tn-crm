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

### Krok 3: Podaj klikalny link do pliku
**ZAWSZE** na końcu podaj link w formacie markdown, który otwiera plik w IDE:
```
[imie-nazwisko.html](tn-crm/umowy/klienci/imie-nazwisko.html)
```

Umowa jest dostępna TYLKO lokalnie - NIE jest dostępna online (folder w .gitignore).

### Krok 4: ZAWSZE napisz email podsumowujący zmiany do klienta

**OBOWIĄZKOWE** — gdy modyfikujesz umowę w odpowiedzi na uwagi klienta, po wprowadzeniu zmian napisz krótkie podsumowanie do wklejenia do maila/WhatsApp dla klienta.

**Zasady pisania emaila:**
- Pisz na TY, nie na Pan/Pani — relacja Tomka z klientem jest partnerska
- Język naturalny, nie formalny — bez „uprzejmie informuję", „niniejszym potwierdzam" itp.
- **NIE używaj markdown bold (`**...**`) w treści emaila** — widać że to AI pisze. Pogrubione hasła rzucają się w oczy klientowi i wyglądają jak generator. Jeśli chcesz wyróżnić punkt — użyj akapitu, myślnika lub kontekstu zdania, nie pogrubienia. Bold zostaje tylko w SEKCJI PODSUMOWANIA dla Tomka (tabela), nie w samym mailu do klienta
- Adresuj każdą uwagę klienta po kolei (po punktach lub krótko per akapit)
- Jeśli przyjąłeś — powiedz „dorzucam"/„robię", krótko jak
- Jeśli odrzuciłeś — powiedz dlaczego (jednym zdaniem, nie kazaniem)
- Jeśli przyjąłeś warunkowo (np. cap na pensje zarządu) — wyjaśnij że to dla obopólnego spokoju, nie żeby utrudniać
- Wskaż co musi dosłać klient (dane Kingi, potwierdzenie nazwiska itp.)
- Jeśli sprawa złożona — zaproponuj call na żywo
- Podpis: `Pozdrawiam, Tomek`

**Format dostawy:**
- Email umieść w bloku markdown (\`\`\`) w odpowiedzi do Tomka
- Pod emailem zostaw **podsumowanie zmian dla Tomka** (tabela co się zmieniło per paragraf) — żeby wiedział co podpisze

## Przykład użycia

Użytkownik: "Zrób umowę dla Jana Kowalskiego, obniż kary o 30%"

1. Kopiuję `umowa-budowa-sklepu.html` → `umowy/klienci/jan-kowalski.html`
2. Wprowadzam dane klienta
3. Obniżam kary o 30%
4. Podaję klikalny link: [jan-kowalski.html](tn-crm/umowy/klienci/jan-kowalski.html)
5. Piszę krótki email do Jana podsumowujący zmiany (na TY, naturalnym językiem)

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
