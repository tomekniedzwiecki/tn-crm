# Procedura: Generowanie Scenariuszy Video TikTok

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń).

## Kiedy wywołać

Użytkownik mówi: "Wygeneruj scenariusze video dla workflow X"

## Co generuje

**10 prostych scenariuszy video** podzielonych na dwie kategorie:
- **5 scenariuszy Z TWARZĄ** — nagrywający jest widoczny
- **5 scenariuszy BEZ TWARZY** — tylko ręce/produkt/otoczenie

---

## Struktura scenariusza

```json
{
  "id": "scenario_1",
  "type": "POV",
  "showFace": true,
  "title": "Krótki tytuł (max 30 znaków)",
  "hook": "Co zrobić na początku (1 zdanie)",
  "action": "Co zrobić z produktem (1-2 zdania)",
  "ending": "Jak zakończyć (1 zdanie)",
  "duration": "15-20 sek",
  "tip": "Jedna praktyczna wskazówka",
  "example": "Opcjonalny przykład tekstu/dialogu"
}
```

### Pola:
- **type** — typ scenariusza: `POV`, `Rutyna`, `Reakcja`, `Efekt WOW`, `Porównanie`, `ASMR`, `Unboxing`, `Tutorial`
- **showFace** — `true` = z twarzą, `false` = bez twarzy
- **title** — krótki, chwytliwy tytuł
- **hook** — co zrobić w pierwszych 3 sekundach
- **action** — główna akcja z produktem
- **ending** — jak zakończyć video
- **duration** — sugerowany czas
- **tip** — jedna konkretna wskazówka
- **example** — (opcjonalnie) przykładowy tekst do powiedzenia/napisania

---

## Zasady tworzenia scenariuszy

### MUSI być:
- ✅ **PROSTE** — 3 kroki, każdy w 1-2 zdaniach
- ✅ **Bez montażu** — jedno nagranie, bez cięć
- ✅ **Bez innych osób** — nagrywający sam
- ✅ **Bez specjalnych lokacji** — dom, pokój
- ✅ **Krótkie** — 15-30 sekund max

### Scenariusze BEZ TWARZY:
- ❌ Nie wymagają pokazywania twarzy
- ✅ Skupione na produkcie, rękach, otoczeniu
- ✅ Idealne dla osób nieśmiałych
- ✅ Łatwiejsze do nagrania

---

## Typy scenariuszy

### Z TWARZĄ:
1. **POV** — "POV: jesteś w sytuacji X" → reakcja
2. **Reakcja** — pokazanie emocji na produkt
3. **Storytime** — opowiadanie historii
4. **GRWM** — przygotowanie się z produktem
5. **Porównanie** — kontrast emocji (nuda → radość)

### BEZ TWARZY:
1. **ASMR** — dźwięki produktu, close-upy
2. **Unboxing** — rozpakowywanie (tylko ręce)
3. **Tutorial** — pokazanie jak używać
4. **Efekt WOW** — najlepsza cecha produktu
5. **Estetyka** — ładne ujęcia produktu w otoczeniu

---

## Proces generowania

### Krok 1: Pobierz dane
```bash
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"
```

### Krok 2: Napisz 10 scenariuszy
- 5 pierwszych: **showFace: true**
- 5 kolejnych: **showFace: false**

---

## Format SQL wyjściowego

```sql
INSERT INTO workflow_video (workflow_id, video_scenarios)
VALUES ('[WORKFLOW_ID]', '[
  {"id": "scenario_1", "showFace": true, ...},
  {"id": "scenario_2", "showFace": true, ...},
  {"id": "scenario_3", "showFace": true, ...},
  {"id": "scenario_4", "showFace": true, ...},
  {"id": "scenario_5", "showFace": true, ...},
  {"id": "scenario_6", "showFace": false, ...},
  {"id": "scenario_7", "showFace": false, ...},
  {"id": "scenario_8", "showFace": false, ...},
  {"id": "scenario_9", "showFace": false, ...},
  {"id": "scenario_10", "showFace": false, ...}
]'::jsonb)
ON CONFLICT (workflow_id) DO UPDATE SET video_scenarios = EXCLUDED.video_scenarios;
```

---

## Przykładowe scenariusze (VibeStrike)

### Z TWARZĄ:

```json
{
  "id": "scenario_1",
  "type": "POV",
  "showFace": true,
  "title": "Po ciężkim dniu w pracy",
  "hook": "Wejdź do pokoju ze zmęczoną miną",
  "action": "Podejdź do maszyny, włącz ją i daj serię ciosów",
  "ending": "Uśmiechnij się z ulgą do kamery",
  "duration": "15-20 sek",
  "tip": "Przyciemnij pokój żeby LED-y były widoczne",
  "example": "Można dodać tekst: 'Terapia za 299zł'"
}
```

```json
{
  "id": "scenario_2",
  "type": "Reakcja",
  "showFace": true,
  "title": "Kiedy goście pytają co to",
  "hook": "Zrób zdziwioną minę jakby ktoś pytał",
  "action": "Wskaż na maszynę, włącz ją i pokaż jak działa",
  "ending": "Wzrusz ramionami z dumnym uśmiechem",
  "duration": "15-20 sek",
  "tip": "Przesadzone miny są OK - to TikTok!"
}
```

### BEZ TWARZY:

```json
{
  "id": "scenario_6",
  "type": "ASMR",
  "showFace": false,
  "title": "Dźwięk ciosów i LED-ów",
  "hook": "Zacznij od close-upa na wyłączoną maszynę",
  "action": "Włącz ją, pokaż LED-y, nagraj dźwięk uderzeń",
  "ending": "Zatrzymaj kadr na świecących LED-ach",
  "duration": "20-30 sek",
  "tip": "Nagraj w ciszy - dźwięki produktu są kluczowe"
}
```

```json
{
  "id": "scenario_7",
  "type": "Tutorial",
  "showFace": false,
  "title": "Jak zacząć trening",
  "hook": "Pokaż produkt z góry (hands only)",
  "action": "Krok po kroku: włącz, wybierz tryb, zacznij ćwiczyć",
  "ending": "Pokaż ekran z wynikiem/statystykami",
  "duration": "20-30 sek",
  "tip": "Spokojne, metodyczne ruchy"
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
