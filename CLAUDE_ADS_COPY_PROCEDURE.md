# Procedura generowania copy reklamowego Meta Ads

## Kiedy uzywac

Gdy uzytkownik prosi o "zrob copy reklamowe", "przygotuj reklamy", "wygeneruj teksty na reklamy" dla danego workflow.

## KROK 1: Pobierz dane z Supabase

Gdy uzytkownik podaje workflow ID, pobierz dane przez curl:

```bash
# Workflow + landing page URL
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.WORKFLOW_ID&select=id,first_name,last_name,landing_page_url" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# Branding (brand_info, kolory, fonty)
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.WORKFLOW_ID&select=type,content" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"

# Produkty
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_products?workflow_id=eq.WORKFLOW_ID&select=name,description,category,price,target_audience" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## KROK 2: Wyodrębnij kluczowe dane

Z pobranych danych wyodrebnij:
1. **Brand info** — nazwa marki, tagline, opis, ton komunikacji (z `workflow_branding` gdzie `type=brand_info`)
2. **Kolory** — z `workflow_branding` gdzie `type=color`
3. **Fonty** — z `workflow_branding` gdzie `type=font`
4. **Produkt** — nazwa, opis, kategoria, cena, grupa docelowa
5. **Landing page URL** — z `workflows.landing_page_url`
6. **USP** — unikalna propozycja wartosci (z opisu marki lub produktu)

## Pola Meta Ads do wygenerowania

Dla KAZDEJ wersji copy wygeneruj:

| Pole | Limit | Opis |
|------|-------|------|
| **Primary Text** | 125 znakow (zalecane), max 2200 | Glowny tekst reklamy, widoczny nad obrazem |
| **Headline** | 40 znakow (zalecane), max 255 | Pogrubiony naglowek pod obrazem |
| **Description** | 30 znakow (zalecane), max 255 | Dodatkowy tekst pod naglowkiem (opcjonalny) |
| **CTA Button** | predefinowane | Shop Now, Learn More, Sign Up, Get Offer, Order Now |

## Zasady skutecznego copy

### 1. HOOK — pierwsze 3 sekundy
- Zatrzymaj scroll
- Uzywaj liczb, pytan, kontrowersji
- "Czy wiesz ze 73% ludzi..."
- "Przestań [robić X], zacznij [robić Y]"
- Emocje > logika w hook

### 2. PROBLEM — agitacja bolu
- Opisz sytuacje klienta
- Pokaz ze rozumiesz jego frustracje
- Uzyj jezyka klienta (nie marketingowego)

### 3. SOLUTION — rozwiazanie
- Przedstaw produkt jako odpowiedz
- Skup sie na BENEFITACH nie cechach
- "Dzieki X zyskasz Y" nie "X ma funkcje Z"

### 4. PROOF — dowod spoleczny
- Liczby (5000+ klientow, 4.9 gwiazdek)
- Testimoniale (krotkie cytaty)
- Autorytety (eksperci, certyfikaty)

### 5. CTA — wezwanie do akcji
- Jasne, konkretne
- Pilnosc (ograniczona oferta, czas)
- Niskie ryzyko (darmowa dostawa, zwrot)

## Framework PAS dla Primary Text

```
[PROBLEM] — Opisz bol/frustracje (1-2 zdania)
[AGITATION] — Pogłęb problem, pokaz konsekwencje (1-2 zdania)
[SOLUTION] — Przedstaw rozwiazanie z benefitami (2-3 zdania)
[CTA] — Co ma zrobic teraz (1 zdanie)
```

## Framework AIDA dla Primary Text (alternatywa)

```
[ATTENTION] — Hook zatrzymujacy scroll
[INTEREST] — Rozwin temat, buduj ciekawosc
[DESIRE] — Pokaz benefity, stworz pragnienie
[ACTION] — Wezwij do dzialania
```

## 5 roznych katow (angles) do generowania

Dla kazdego produktu generuj 5 wersji z ROZNYMI KATAMI:

1. **Pain Point** — skupienie na problemie i jego rozwiazaniu
2. **Transformation** — przed/po, zmiana zycia
3. **Social Proof** — opinie, liczby, dowody
4. **Urgency/Scarcity** — ograniczona oferta, pilnosc
5. **Curiosity** — intrygujacy hook, "sekret", odkrycie

## Format odpowiedzi

```markdown
## Copy reklamowe dla [NAZWA MARKI]

**Grupa docelowa:** [opis]
**Landing page:** [URL]

---

### Wersja 1: Pain Point

**Primary Text:**
[tekst 100-125 znakow]

**Headline:**
[tekst do 40 znakow]

**Description:**
[tekst do 30 znakow]

**CTA:** [Shop Now / Learn More / etc.]

---

### Wersja 2: Transformation
[...]

### Wersja 3: Social Proof
[...]

### Wersja 4: Urgency
[...]

### Wersja 5: Curiosity
[...]
```

## Zasady jezykowe

- Pisz po POLSKU (chyba ze klient dziala miedzynarodowo)
- Uzywaj jezyka grupy docelowej
- Unikaj branżowego żargonu
- Krotkie zdania, latwe do skanowania
- Emoji — uzywaj oszczednie, max 1-2 na tekst
- Wielkie litery — tylko dla podkreslenia (nie cale slowa)

## Przyklad generowania

**Input:**
- Marka: PupilnikShop
- Produkt: Karma dla psow senior
- Grupa: Wlasciciele psow 8+ lat
- USP: Naturalne skladniki, wspiera stawy

**Output (wersja Pain Point):**

**Primary Text:**
Twoj starszy pies juz nie biega jak kiedys? Bole stawow to problem 70% psow po 8 roku zycia. PupilnikShop Senior to karma z naturalnym kolagenem i glukozamina — Twoj pupil znow poczuje radosc z ruchu.

**Headline:**
Odmlodz swojego seniora

**Description:**
Naturalna karma 8+

**CTA:** Shop Now

---

## WAZNE

1. NIGDY nie kopiuj tekstow z innych reklam — generuj unikalne
2. Sprawdzaj limity znakow przed oddaniem
3. Kazda wersja musi miec INNY KAT — nie powtarzaj tej samej struktury
4. Dostosuj ton do marki (premium = elegancko, playful = luzno)
5. Testuj rozne CTA — czasem "Dowiedz sie wiecej" dziala lepiej niz "Kup teraz"
