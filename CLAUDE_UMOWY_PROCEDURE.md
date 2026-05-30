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
4. **Dwa różne mechanizmy umów** — plikowy (ta procedura: `umowy/klienci/*.html`) ORAZ panelowy (własny HTML wklejany w panelu workflow → kolumna `workflows.contract_custom_html`, podstawiany przez tokeny `{{...}}`). Przy umowie z panelu czytaj sekcję **„⚠️ Umowa z własnym HTML w panelu"** poniżej — ma własne pułapki.

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

---

## ⚠️ Umowa z własnym HTML w panelu (`contract_custom_html`)

To **osobny mechanizm** od plików w `umowy/klienci/`. W panelu workflow (zakładka Umowy → „Edytuj HTML") można wkleić własny HTML, który zapisuje się do kolumny `workflows.contract_custom_html` i **nadpisuje** domyślny szablon. Dane klienta podstawiane są przez tokeny `{{...}}` w `generateContract()` ([`workflow.html`](tn-workflow/workflow.html) ~`18540`) oraz `prepareContractHtml()` ([`client-projekt.html`](client-projekt.html)).

### Dostępne tokeny (składnia: WYŁĄCZNIE `{{token}}`)

| Token | Źródło |
|---|---|
| `{{imie_nazwisko}}` | `workflow.customer_name` |
| `{{firma_linia}}` | `" / " + customer_company` lub puste |
| `{{firma}}` | `customer_company` |
| `{{nip}}` | `client_nip` |
| `{{pesel}}` | `client_pesel` |
| `{{dowod}}` / `{{nr_dowodu}}` | `client_id_number` |
| `{{adres}}` | ulica + kod + miasto (złożone) |
| `{{ulica}}` `{{miasto}}` `{{kod_pocztowy}}` `{{kraj}}` | pola `client_*` |
| `{{email}}` | `customer_email` |
| `{{telefon}}` | `customer_phone` |
| `{{nr_umowy}}` | `contract_number` lub pierwsze 8 znaków id |
| `{{data_zawarcia}}` `{{data}}` `{{data_dzis}}` | dzisiejsza data |
| `{{data_rozpoczecia}}` | `started_at` lub dziś |
| `{{kwota}}` / `{{cena}}` | suma rat lub `amount` |
| `{{nazwa_oferty}}` | `offer_name` |
| `{{warunki_platnosci}}` | wygenerowany blok rat (tylko admin) |
| `{{nr_punkt_konto}}` | "3" lub "5" zależnie od rat (tylko admin) |

`{{warunki_platnosci}}` i `{{nr_punkt_konto}}` podstawia tylko panel admina, NIE strona klienta.

### 🪤 PUŁAPKA: spieczone placeholdery (zdarzyło się u Pawła Wróblewskiego 2026-05-29)

Przycisk „Edytuj HTML" ładuje do edytora **już podstawiony wynik** `generateContract()`, NIE surowy szablon. „Zapisz" zapisuje to do `contract_custom_html`. Jeśli zapiszesz gdy dane klienta są niekompletne → tokeny `{{...}}` zapisują się jako **puste `&nbsp;` lub literalne wartości i znikają na zawsze**. Potem, mimo wypełnionych danych, nic się nie podstawia.

**Reguła:** edytując umowę w panelu ZAWSZE zostawiaj surowe tokeny `{{...}}`, NIE wpisuj realnych danych na nie. Wklejaj wzór z placeholderami, nie podstawiony render.

**Diagnoza:** brak placeholderów danych osobowych = spieczone.
```sql
SELECT regexp_matches(contract_custom_html, '\{\{[^}]+\}\}','g')
FROM workflows WHERE id = '<workflow_id>';
```

**Naprawa:** przywróć tokeny przez `replace()` (wzorce ze `umowy/umowa-budowa-sklepu.html`), pojedynczo per pełna linia `<p>...</p>` żeby nie trafić w boks Wykonawcy:
```sql
UPDATE workflows SET contract_custom_html =
  replace(replace( contract_custom_html,
    '<p>PESEL: <span class="field-short">&nbsp;</span></p>',
    '<p>PESEL: <span class="field-short">{{pesel}}</span></p>'),
    '<p>Adres:<br><span class="field">&nbsp;</span></p>',
    '<p>Adres:<br><span class="field">{{adres}}</span></p>')
WHERE id = '<workflow_id>';
```
Przed UPDATE policz `count(*)` każdego ciągu — musi = 1 (inaczej trafisz też w sekcję Wykonawcy/Tomka, która ma dane na sztywno). Po zmianie zasymuluj render i sprawdź `leftover_placeholders = 0`.

### Generowanie odpala się tylko gdy jest „źródło umowy"

Podgląd/PDF generuje się przez helper `hasContractSource()` = jest zmapowany szablon (`CONTRACT_TEMPLATES[offer_id]`) **LUB** `contract_custom_html`. Klient na ofercie BEZ zmapowanego szablonu, z własnym HTML, działa dopiero po fixie z 2026-05-29 (`workflow.html` 18377/18384, 7358/7433/7592). Strona klienta (`prepareContractHtml`) nie miała tej blokady.
