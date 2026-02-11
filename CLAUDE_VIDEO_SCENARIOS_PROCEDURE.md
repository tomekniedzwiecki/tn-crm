# Procedura: Generowanie Scenariuszy Video TikTok dla Workflow

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń).

## Kiedy wywołać

Użytkownik mówi np.: "Wygeneruj scenariusze video dla workflow X", "Zrób scenariusze TikTok", "Przygotuj scenariusze nagrań".

## Wymagane dane wejściowe

1. **workflow_id** — UUID workflow
2. **Raport PDF** — raport typu `report_pdf` z tabeli `workflow_reports` (analiza produktu, grupa docelowa, USP)
3. **Branding** — dane z tabeli `workflow_branding` (nazwa marki, tagline, kolory)
4. **Produkt** — wybrany produkt z `workflows.selected_product_id`

## Co generuje

**5 unikalnych scenariuszy video** do nagrania na TikTok, zapisanych jako SQL do wstawienia w `workflow_video.video_scenarios` (JSONB).

Każdy scenariusz zawiera:
- `id` — unikalny identyfikator
- `title` — tytuł scenariusza (krótki, chwytliwy)
- `description` — pełny opis co nagrać (krok po kroku)
- `tips` — wskazówki techniczne dla nagrywającego

---

## Zasady tworzenia scenariuszy

### MUSI być:
- ✅ Nagrywalne telefonem (pionowo 9:16)
- ✅ Bez specjalnych rekwizytów (tylko produkt!)
- ✅ Krótkie (15-30 sekund)
- ✅ Z mocnym hookiem w pierwszych 3 sekundach
- ✅ Autentyczne (nie "reklamowe")
- ✅ Łatwe dla osoby bez doświadczenia
- ✅ Każdy scenariusz INNY (różne formuły)

### NIE MOŻE być:
- ❌ Skomplikowane technicznie
- ❌ Wymagające montażu/efektów specjalnych
- ❌ Nudne lub typowo reklamowe
- ❌ Za długie (ponad 30 sek)
- ❌ Wymagające dodatkowych osób
- ❌ Wymagające specjalnych lokacji

---

## Formuły viralowych TikToków (użyj różnych!)

### 1. POV (Point of View)
```
POV: [sytuacja relatywna dla grupy docelowej]
→ Problem → Rozwiązanie z produktem
```
**Emocja**: relacja, "to ja!"

### 2. Expectation vs Reality
```
"Co ludzie myślą że robię..." vs "Co naprawdę robię"
→ Zaskakujące ujawnienie produktu
```
**Emocja**: humor, zaskoczenie

### 3. That Girl/Guy aesthetic
```
[Estetyczny routine z produktem]
→ Spokojne, ASMR-owe pokazanie produktu
```
**Emocja**: aspiracja, "chcę tak żyć"

### 4. Storytime + Demo
```
"Mój [ktoś] powiedział że [sceptycyzm]..."
→ Demonstracja + reakcja
```
**Emocja**: przekonywanie, dowód

### 5. Satisfying / ASMR
```
[Close-upy produktu w akcji]
→ Dźwięki, tekstury, satysfakcjonujące ujęcia
```
**Emocja**: satysfakcja, relaks

### 6. Life Hack / Tip
```
"Hack dla [grupa docelowa]: ..."
→ Zaskakujące zastosowanie produktu
```
**Emocja**: wartość, "muszę to zapamiętać"

### 7. Get Ready With Me (GRWM)
```
[Przygotowanie się z produktem]
→ Naturalne włączenie produktu w rutynę
```
**Emocja**: intymność, codzienność

### 8. Unboxing / First Impression
```
[Otwieranie paczki, pierwsza reakcja]
→ Autentyczne emocje
```
**Emocja**: ekscytacja, ciekawość

---

## Proces generowania

### Krok 1: Pobierz dane
```bash
# Workflow
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

# Raporty
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_reports?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

# Branding
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

# Produkt (jeśli selected_product_id istnieje)
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/products?id=eq.[PRODUCT_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"
```

### Krok 2: Przeanalizuj produkt

Z raportów wyciągnij:
- **Co to za produkt** — nazwa, funkcja, wygląd
- **Grupa docelowa** — wiek, płeć, styl życia, problemy
- **Główna obietnica** — co produkt daje użytkownikowi
- **USP** — co wyróżnia od konkurencji
- **Emocje zakupowe** — dlaczego ludzie to kupują

### Krok 3: Dopasuj scenariusze do produktu

| Typ produktu | Najlepsze formuły |
|--------------|-------------------|
| Elektronika użytkowa | POV, Life Hack, Unboxing |
| Kosmetyki/uroda | GRWM, That Girl, Satisfying |
| Fitness/sport | POV, Storytime, That Guy |
| Jedzenie/napoje | Satisfying, ASMR, Expectation vs Reality |
| Dom/lifestyle | That Girl, Aesthetic routine, Unboxing |
| Narzędzia/DIY | POV, Life Hack, Expectation vs Reality |

### Krok 4: Napisz 5 scenariuszy

Każdy scenariusz musi być:
1. **Inny** — użyj 5 różnych formuł!
2. **Specyficzny** — odnosi się do TEGO produktu
3. **Prosty** — laik musi dać radę nagrać
4. **Viralowy** — mocny hook, emocje, share'owalny

---

## Format scenariusza

```json
{
  "id": "scenario_1",
  "title": "Krótki, chwytliwy tytuł (max 40 znaków)",
  "description": "Pełny opis scenariusza:\n\n**HOOK (0-3 sek):**\nCo widz widzi/słyszy na początku.\n\n**ŚRODEK (3-15 sek):**\nCo się dzieje, jak pokazać produkt.\n\n**KOŃCÓWKA (15-20 sek):**\nPunchline, efekt, reakcja.\n\n**TEKST NA EKRANIE:**\n- Tekst 1\n- Tekst 2\n\n**DŹWIĘK:**\nSugestia muzyki/trendu.",
  "tips": "Konkretne wskazówki:\n• Światło naturalne, twarzą do okna\n• Telefon pionowo, oprzyj o coś\n• Nagraj 3-5 ujęć do wyboru\n• Nie przejmuj się błędami - autentyczność!"
}
```

---

## Format SQL wyjściowego

```sql
-- Scenariusze Video dla workflow [WORKFLOW_ID]
-- Marka: [NAZWA MARKI]
-- Produkt: [NAZWA PRODUKTU]
-- Wygenerowano: [DATA]

UPDATE workflow_video
SET video_scenarios = '[
  {
    "id": "scenario_1",
    "title": "[TYTUŁ 1]",
    "description": "[OPIS 1]",
    "tips": "[WSKAZÓWKI 1]"
  },
  {
    "id": "scenario_2",
    "title": "[TYTUŁ 2]",
    "description": "[OPIS 2]",
    "tips": "[WSKAZÓWKI 2]"
  },
  {
    "id": "scenario_3",
    "title": "[TYTUŁ 3]",
    "description": "[OPIS 3]",
    "tips": "[WSKAZÓWKI 3]"
  },
  {
    "id": "scenario_4",
    "title": "[TYTUŁ 4]",
    "description": "[OPIS 4]",
    "tips": "[WSKAZÓWKI 4]"
  },
  {
    "id": "scenario_5",
    "title": "[TYTUŁ 5]",
    "description": "[OPIS 5]",
    "tips": "[WSKAZÓWKI 5]"
  }
]'::jsonb
WHERE workflow_id = '[WORKFLOW_ID]';

-- Jeśli rekord nie istnieje, utwórz:
INSERT INTO workflow_video (workflow_id, video_scenarios)
VALUES ('[WORKFLOW_ID]', '[JSON_SCENARIOS]'::jsonb)
ON CONFLICT (workflow_id) DO UPDATE SET video_scenarios = EXCLUDED.video_scenarios;
```

---

## Przykład użycia

**Użytkownik:**
```
Wygeneruj scenariusze video dla workflow c3994c15526799dc6d7de27078a7fe36

Instrukcje: c:\repos_tn\tn-crm\CLAUDE_VIDEO_SCENARIOS_PROCEDURE.md
Env: c:\repos_tn\tn-crm\.env
```

**Claude:**
1. Czyta tę procedurę
2. Pobiera dane z Supabase (workflow, raporty, branding, produkt)
3. Pobiera infografikę PNG jeśli dostępna
4. Analizuje produkt i grupę docelową
5. Generuje 5 unikalnych scenariuszy dopasowanych do produktu
6. Daje SQL do wklejenia w Supabase SQL Editor

---

## Przykładowe scenariusze (BrewGo - przenośny ekspres)

### Scenariusz 1: POV Kierowca
**Formuła:** POV

```json
{
  "id": "scenario_1",
  "title": "POV: 4h w trasie, kawa ze stacji nie działa",
  "description": "**HOOK (0-3 sek):**\nKamera na zmęczoną twarz za kierownicą. Tekst: \"POV: 4 godzina w trasie\"\n\n**ŚRODEK (3-12 sek):**\nWyciągnięcie BrewGo z torby, wsypanie kawy, naciśnięcie guzika. Close-up na espresso lecące do kubka.\n\n**KOŃCÓWKA (12-18 sek):**\nPierwszy łyk, uśmiech ulgi. Tekst: \"Lepsze niż na stacji. 50 groszy.\"\n\n**TEKST NA EKRANIE:**\n- POV: 4h w trasie\n- Kawa ze stacji = 15zł\n- Moja kawa = 0,50zł\n\n**DŹWIĘK:**\nTrending lo-fi beat lub cisza z dźwiękiem ekspresu",
  "tips": "• Nagraj w prawdziwym samochodzie\n• Światło dzienne przez szybę\n• Close-up na espresso - to key shot\n• Autentyczna reakcja po łyku"
}
```

### Scenariusz 2: Morning Routine
**Formuła:** That Girl aesthetic

```json
{
  "id": "scenario_2",
  "title": "5AM: Moje 5 minut dla siebie",
  "description": "**HOOK (0-3 sek):**\nCiemno, budzik 5:00, spokojna muzyka\n\n**ŚRODEK (3-15 sek):**\nWstanie, podejście do okna ze wschodzącym słońcem, włączenie BrewGo. Close-up na espresso.\n\n**KOŃCÓWKA (15-20 sek):**\nŁyk kawy przy oknie z widokiem. Tekst: \"Moje poranne 5 minut\"\n\n**TEKST NA EKRANIE:**\n- 5:00 AM\n- (brak - estetyka)\n- Moje 5 minut dla siebie\n\n**DŹWIĘK:**\nChill morning playlist, bardzo cicho",
  "tips": "• Nagraj o wschodzie słońca (złote światło!)\n• Slow motion na espresso\n• Spokojne ruchy, brak pośpiechu\n• Ciepłe kolory, przytulny vibe"
}
```

### Scenariusz 3: Expectation vs Reality
**Formuła:** Humor/zaskoczenie

```json
{
  "id": "scenario_3",
  "title": "Co ludzie myślą vs co naprawdę robię",
  "description": "**HOOK (0-3 sek):**\nTekst: \"Co ludzie myślą że robię na parkingu...\" + podejrzana mina\n\n**ŚRODEK (3-10 sek):**\nSzybkie cięcie. Tekst: \"Co naprawdę robię:\" + profesjonalne robienie espresso w samochodzie\n\n**KOŃCÓWKA (10-15 sek):**\nToast kubkiem do kamery z dumną miną. Tekst: \"Barista na kółkach\"\n\n**TEKST NA EKRANIE:**\n- Co ludzie myślą:\n- Co naprawdę robię:\n- Barista na kółkach 😎\n\n**DŹWIĘK:**\nTrending funny reveal sound",
  "tips": "• Przesadzona \"podejrzana\" mina na początku\n• Kontrast: dziwne → profesjonalne\n• Można dodać okulary przeciwsłoneczne na końcu"
}
```

### Scenariusz 4: Storytime
**Formuła:** Dowód społeczny

```json
{
  "id": "scenario_4",
  "title": "Kolega nie wierzył... teraz pyta gdzie kupić",
  "description": "**HOOK (0-3 sek):**\nTwarz do kamery: \"Mój kolega powiedział że nie da się zrobić dobrej kawy za mniej niż tysiaka...\"\n\n**ŚRODEK (3-12 sek):**\nPokazanie BrewGo, demo robienia kawy, reakcja (uniesione brwi, kiwanie głową z uznaniem)\n\n**KOŃCÓWKA (12-18 sek):**\nŁyk, uśmiech. Tekst: \"Teraz pyta gdzie kupiłem\"\n\n**TEKST NA EKRANIE:**\n- \"Nie da się\"\n- 20 bar ciśnienia\n- 3 minuty później...\n- \"Gdzie to kupiłeś?\"\n\n**DŹWIĘK:**\nStorytime trending sound",
  "tips": "• Naturalna narracja, jakbyś opowiadał znajomemu\n• Autentyczna reakcja na kawę\n• Można nagrać z prawdziwym kolegą (opcjonalnie)"
}
```

### Scenariusz 5: Satisfying ASMR
**Formuła:** Satysfakcja

```json
{
  "id": "scenario_5",
  "title": "Dźwięk porannej kawy ☕",
  "description": "**HOOK (0-3 sek):**\nClose-up na ziarna kawy sypane do urządzenia. Dźwięk ziaren.\n\n**ŚRODEK (3-15 sek):**\nASMR: dźwięk ciśnienia, espresso lecące do kubka w slowmo, close-up na cremę\n\n**KOŃCÓWKA (15-20 sek):**\nPara unosząca się z kubka. Tekst: \"pure coffee ASMR\"\n\n**TEKST NA EKRANIE:**\n- (brak - tylko dźwięki)\n- pure coffee ASMR ☕\n\n**DŹWIĘK:**\nOriginal sound / bez muzyki - ASMR",
  "tips": "• Nagraj w CISZY - dźwięk jest kluczowy\n• Macro lens jeśli masz (albo zoom)\n• Slow motion na espresso\n• Crema musi być widoczna!"
}
```

---

## Konfiguracja

- **Supabase URL**: `https://yxmavwkwnfuphjqbelws.supabase.co`
- **Service Key**: w pliku `c:\repos_tn\tn-crm\.env` (zmienna `SUPABASE_SERVICE_KEY`)

---

## Szablon promptu dla użytkownika

```
Wygeneruj scenariusze video dla workflow [UUID]

Instrukcje: c:\repos_tn\tn-crm\CLAUDE_VIDEO_SCENARIOS_PROCEDURE.md
Env: c:\repos_tn\tn-crm\.env
```
