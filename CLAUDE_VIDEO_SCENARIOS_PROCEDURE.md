# Procedura: Generowanie Scenariuszy Video TikTok

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń).

## Kiedy wywołać

Użytkownik mówi: "Wygeneruj scenariusze video dla workflow X"

## Co generuje

**5 prostych scenariuszy video** do nagrania telefonem. Każdy scenariusz to 3 proste kroki które może wykonać każdy.

---

## Struktura scenariusza (NOWA - UPROSZCZONA)

```json
{
  "id": "scenario_1",
  "type": "POV",
  "title": "Krótki tytuł (max 30 znaków)",
  "hook": "Co zrobić na początku (1 zdanie)",
  "action": "Co zrobić z produktem (1-2 zdania)",
  "ending": "Jak zakończyć (1 zdanie)",
  "duration": "15-20 sek",
  "tip": "Jedna praktyczna wskazówka"
}
```

### Pola:
- **type** — typ scenariusza: `POV`, `Rutyna`, `Reakcja`, `Efekt WOW`, `Porównanie`
- **title** — krótki, chwytliwy tytuł
- **hook** — co zrobić w pierwszych 3 sekundach (przyciągnąć uwagę)
- **action** — główna akcja z produktem (prosta instrukcja)
- **ending** — jak zakończyć video
- **duration** — sugerowany czas trwania
- **tip** — jedna konkretna wskazówka techniczna

---

## Zasady tworzenia scenariuszy

### MUSI być:
- ✅ **PROSTE** — 3 kroki, każdy w 1-2 zdaniach
- ✅ **Bez montażu** — jedno nagranie, bez cięć
- ✅ **Bez tekstu na ekranie** — klient doda sam lub nie
- ✅ **Bez innych osób** — nagrywający sam
- ✅ **Bez specjalnych lokacji** — dom, pokój, kuchnia
- ✅ **Krótkie** — 15-30 sekund max

### NIE MOŻE być:
- ❌ Skomplikowanych instrukcji (HOOK/ŚRODEK/KOŃCÓWKA)
- ❌ Wymagań co do muzyki/dźwięku
- ❌ Wymagań co do tekstu na ekranie
- ❌ Slow motion, efektów, przejść
- ❌ Aktorstwa, przesadnych emocji

---

## 5 typów scenariuszy (użyj każdego raz!)

### 1. POV (Point of View)
**Idea:** "POV: jesteś w sytuacji X" → rozwiązanie z produktem
**Przykład:** POV: wracasz zmęczony z pracy → włączasz produkt → ulga

### 2. Rutyna
**Idea:** Pokazanie produktu jako części codziennej rutyny
**Przykład:** Poranna kawa/trening/wieczorny relaks z produktem

### 3. Reakcja
**Idea:** Pokazanie reakcji na produkt (własnej lub wyimaginowanej)
**Przykład:** "Kiedy znajomi widzą mój [produkt]..." → demo produktu

### 4. Efekt WOW
**Idea:** Pokazanie najbardziej efektownej cechy produktu
**Przykład:** LED-y w ciemności, dźwięk, efekt przed/po

### 5. Porównanie
**Idea:** Produkt vs alternatywa (bez produktu)
**Przykład:** Siłownia o 6 rano vs trening w domu z produktem

---

## Proces generowania

### Krok 1: Pobierz dane
```bash
# Workflow
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

# Branding
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"
```

### Krok 2: Zidentyfikuj produkt
Z brandingu wyciągnij:
- Nazwa produktu
- Co robi (główna funkcja)
- Dla kogo jest (grupa docelowa)

### Krok 3: Napisz 5 scenariuszy
Każdy innego typu (POV, Rutyna, Reakcja, Efekt WOW, Porównanie).

---

## Format SQL wyjściowego

```sql
INSERT INTO workflow_video (workflow_id, video_scenarios)
VALUES ('[WORKFLOW_ID]', '[
  {
    "id": "scenario_1",
    "type": "POV",
    "title": "[TYTUŁ]",
    "hook": "[HOOK]",
    "action": "[AKCJA]",
    "ending": "[ZAKOŃCZENIE]",
    "duration": "15-20 sek",
    "tip": "[WSKAZÓWKA]"
  },
  ...
]'::jsonb)
ON CONFLICT (workflow_id) DO UPDATE SET video_scenarios = EXCLUDED.video_scenarios;
```

---

## Przykładowe scenariusze (VibeStrike - maszyna bokserska z LED)

### Scenariusz 1: POV
```json
{
  "id": "scenario_1",
  "type": "POV",
  "title": "Po ciężkim dniu w pracy",
  "hook": "Pokaż zmęczoną twarz, westchnij",
  "action": "Podejdź do maszyny, włącz ją, daj kilka ciosów",
  "ending": "Uśmiechnij się z ulgą do kamery",
  "duration": "15-20 sek",
  "tip": "Przyciemnij pokój żeby LED-y były widoczne"
}
```

### Scenariusz 2: Rutyna
```json
{
  "id": "scenario_2",
  "type": "Rutyna",
  "title": "Moje poranne 10 minut",
  "hook": "Pokaż budzik/poranek",
  "action": "Podejdź do maszyny, poćwicz chwilę",
  "ending": "Pokaż że jesteś gotowy na dzień",
  "duration": "15-20 sek",
  "tip": "Nagraj przy porannym świetle"
}
```

### Scenariusz 3: Reakcja
```json
{
  "id": "scenario_3",
  "type": "Reakcja",
  "title": "Kiedy goście pytają co to",
  "hook": "Udawaj że ktoś pyta 'co to jest?'",
  "action": "Włącz maszynę i pokaż jak działa",
  "ending": "Wzrusz ramionami z uśmiechem",
  "duration": "15-20 sek",
  "tip": "Baw się - to ma być luźne"
}
```

### Scenariusz 4: Efekt WOW
```json
{
  "id": "scenario_4",
  "type": "Efekt WOW",
  "title": "LED-y w ciemności",
  "hook": "Zacznij w ciemnym pokoju",
  "action": "Włącz maszynę - pokaż jak świecą LED-y",
  "ending": "Daj kilka ciosów na tle świateł",
  "duration": "15-20 sek",
  "tip": "Im ciemniej tym lepiej wygląda"
}
```

### Scenariusz 5: Porównanie
```json
{
  "id": "scenario_5",
  "type": "Porównanie",
  "title": "Siłownia vs dom",
  "hook": "Pokaż nudną minę (jakby siłownia)",
  "action": "Przejdź do maszyny z uśmiechem, zacznij ćwiczyć",
  "ending": "Pokaż kciuk w górę",
  "duration": "15-20 sek",
  "tip": "Kontrast: nuda → radość"
}
```

---

## Konfiguracja

- **Supabase URL**: `https://yxmavwkwnfuphjqbelws.supabase.co`
- **Service Key**: w pliku `.env` (zmienna `SUPABASE_SERVICE_KEY`)

---

## Szablon promptu

```
Wygeneruj scenariusze video dla workflow [UUID]

Instrukcje: c:\repos_tn\tn-crm\CLAUDE_VIDEO_SCENARIOS_PROCEDURE.md
Env: c:\repos_tn\tn-crm\.env
```
