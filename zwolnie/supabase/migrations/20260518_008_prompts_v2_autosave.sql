-- ============================================================================
-- Prompts V2: instrukcje dla Claude Code w VS Code żeby AUTOMATYCZNIE zapisał
-- wynik do bazy po wygenerowaniu (zamiast ręcznego copy-paste).
-- Każdy prompt na końcu zawiera Bash command z curl PATCH/INSERT.
-- Wymaga env: ZE_SERVICE_KEY (sb_secret_*) ustawiony w shell Tomka.
-- Plus dodaję placeholder {{lead_id}} i {{panel_url}} w renderPromptTemplate.
-- ============================================================================

update ze_prompts
set
    template = $T$Jestem Tomek Niedźwiecki. Prowadzę "Zwolnię Twoich pracowników" — buduję CRM-y i automatyzacje zastępujące etaty. Obietnica z landingu: max 33% miesięcznej pensji za technologię która zastąpi proces.

Otrzymałem brief od klienta. Twoim zadaniem jest:
1. Przygotować realistyczną, konkretną analizę biznesu (bez purple prose, z liczbami)
2. **AUTOMATYCZNIE zapisać analizę do bazy** przez Bash curl — instrukcja na końcu
3. Potwierdzić zapis kontrolnym GET

## Dane z briefu

- **Imię:** {{contact_name}}
- **Firma:** {{company}}
- **WWW:** {{website}}
- **Branża:** {{industry}}
- **Zespół:** {{team_size}}
- **Pensje miesięcznie:** {{payroll}}
- **Budżet:** {{budget}}

## Opis problemu (słowami klienta)

{{problem}}

## Zasady analizy

- Jeśli WWW podane — odwiedź (WebFetch) i wykorzystaj konkretne dane firmy.
- Jeśli brief mglisty — w `clarifying_questions` (max 3) doprecyzuj.
- Liczby muszą się sumować logicznie (koszty osobowe vs oszczędność vs koszt rozwiązania).
- Max 3-5 propozycji od najwyższego ROI w dół.
- Zero buzzwordów typu "AI/automatyzacja zwiększy efektywność" — nazwij konkretny proces, konkretne narzędzie, konkretny rezultat.

## Format wyniku (JSON)

```json
{
  "summary": "1-2 zdania — co robi firma i gdzie boli najmocniej.",
  "diagnosed_pain_points": [
    { "title": "...", "evidence_from_brief": "...", "business_cost": "...", "severity": "low|medium|high" }
  ],
  "proposed_solutions": [
    {
      "title": "Nazwa rozwiązania",
      "what_it_does": "Co to robi technicznie",
      "what_etat_replaces": "Jakie zadania osoby/osób odciąża, ile godzin/mies",
      "stack_suggestion": "Stack",
      "build_estimate_pln": "Min-max PLN",
      "build_estimate_weeks": "Min-max tygodni",
      "monthly_savings_pln": "Oszczędność/mies w PLN",
      "payback_months": "Zwrot",
      "risk_level": "low|medium|high",
      "depends_on": "Wymagania od klienta"
    }
  ],
  "recommended_first_step": {
    "title": "Pierwsze rozwiązanie do wdrożenia",
    "why": "Dlaczego to nie inne",
    "mvp_scope": "Co da się w 1-2 tygodnie żeby walidować pomysł"
  },
  "clarifying_questions": ["...", "..."],
  "estimated_total_savings_pln_per_year": "Suma rocznych oszczędności",
  "estimated_total_build_pln": "Suma kosztów budowy",
  "honest_assessment": "Jednozdaniowa szczera ocena: czy mogę dostarczyć obietnicę 33% pensji dla tego klienta. Bez owijania."
}
```

## Po wygenerowaniu — KROK ZAPISU (KRYTYCZNE)

Po wygenerowaniu JSON, wykonaj **Bash command** żeby zapisać analizę bezpośrednio do bazy:

```bash
# 1) Zapisz JSON do pliku tymczasowego
cat > /tmp/ze_analysis.json <<'JSON_END'
<TUTAJ WKLEJ WYGENEROWANY JSON>
JSON_END

# 2) Wyślij do bazy (env $ZE_SERVICE_KEY musi być ustawione, instrukcja w /zwolnie/SETUP.md)
curl -X PATCH "https://tahusvkrzaijcywuivle.supabase.co/rest/v1/ze_leads?id=eq.{{lead_id}}" \
  -H "apikey: $ZE_SERVICE_KEY" \
  -H "Authorization: Bearer $ZE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  --data-raw "$(jq -n --argjson a "$(cat /tmp/ze_analysis.json)" --arg now "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '{ai_analysis: $a, ai_analysis_published_at: $now, status: "analyzed"}')"

# 3) Potwierdź zapis (powinno wrócić "analyzed")
curl -s "https://tahusvkrzaijcywuivle.supabase.co/rest/v1/ze_leads?id=eq.{{lead_id}}&select=status,ai_analysis_published_at" \
  -H "apikey: $ZE_SERVICE_KEY" -H "Authorization: Bearer $ZE_SERVICE_KEY"
```

Po sukcesie zobaczysz analizę w panelu: {{panel_url}}#tab=analysis$T$,
    updated_at = now()
where slug = 'business_analysis';

update ze_prompts
set
    template = $T$Jestem Tomek Niedźwiecki. Dla klienta {{company}} ({{contact_name}}) z branży {{industry}} buduję klikalny prototyp MVP — żeby pokazać kierunek rozwiązania PRZED podpisaniem umowy.

## Kontekst klienta

**Problem słowami klienta:**
{{problem}}

**Zespół:** {{team_size}}
**Budżet:** {{budget}}

## Zadanie

Zbuduj **JEDEN samodzielny plik HTML** (inline CSS + inline JS, jedyna zewnętrzna zależność: Tailwind CDN), prezentujący **klikalny prototyp** głównego rozwiązania z analizy.

## Zasady

1. **To NIE produkcja.** Prototyp do kliknięcia.
2. **Bez backendu, bez bazy.** Dane mockowane w JS (tablice).
3. **Konkretne dla branży klienta.** Sklep meblowy → meble. Kancelaria → sprawy/umowy.
4. **3-5 ekranów / widoków** — tabami / menu. Każdy demonstruje jedną funkcję.
5. **Klikalne CTA** — buttony coś robią (alert, switch screen, add to list).
6. **Estetyka clean / dark / professional** — Tailwind, sans-serif (Inter), zinc/black motyw (background: #050505; color: #e5e5e5).
7. **Header z nazwą firmy klienta** — "{{company}} · Panel".
8. **Footer:** "Prototyp dla {{company}} — Tomek Niedźwiecki · zwolnie.tomekniedzwiecki.pl"
9. **Bez lorem ipsum, TODO, emoji** (chyba że klient prosi).
10. **Bez komentarzy w HTML.**

## Po wygenerowaniu — KROK ZAPISU (KRYTYCZNE)

Po wygenerowaniu HTML, wykonaj **Bash command** żeby zapisać prototyp bezpośrednio do bazy:

```bash
# 1) Zapisz HTML do pliku tymczasowego
cat > /tmp/ze_mvp.html <<'HTML_END'
<TUTAJ WKLEJ WYGENEROWANY HTML>
HTML_END

# 2) Wyślij do bazy
curl -X PATCH "https://tahusvkrzaijcywuivle.supabase.co/rest/v1/ze_leads?id=eq.{{lead_id}}" \
  -H "apikey: $ZE_SERVICE_KEY" \
  -H "Authorization: Bearer $ZE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  --data-raw "$(jq -n --arg html "$(cat /tmp/ze_mvp.html)" --arg now "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '{mvp_html: $html, mvp_published_at: $now}')"

# 3) Potwierdź zapis
curl -s "https://tahusvkrzaijcywuivle.supabase.co/rest/v1/ze_leads?id=eq.{{lead_id}}&select=mvp_published_at" \
  -H "apikey: $ZE_SERVICE_KEY" -H "Authorization: Bearer $ZE_SERVICE_KEY"
```

Po sukcesie zobaczysz preview w panelu: {{panel_url}}#tab=mvp$T$,
    updated_at = now()
where slug = 'mvp_generator';

update ze_prompts
set
    template = $T$Jestem Tomek Niedźwiecki. Dla klienta {{contact_name}} ({{company}}, branża {{industry}}) zrobiłem analizę briefu. Pomóż mi napisać mu maila.

## Brief klienta

{{problem}}

## Analiza (już w bazie — pobierz przed napisaniem maila)

Najpierw pobierz aktualną analizę:

```bash
curl -s "https://tahusvkrzaijcywuivle.supabase.co/rest/v1/ze_leads?id=eq.{{lead_id}}&select=ai_analysis,mvp_published_at" \
  -H "apikey: $ZE_SERVICE_KEY" -H "Authorization: Bearer $ZE_SERVICE_KEY" | jq .
```

Wykorzystaj `recommended_first_step.title`, `recommended_first_step.why`, `proposed_solutions[0].monthly_savings_pln`, `estimated_total_savings_pln_per_year`.

## Zasady maila

- **Krótko.** 6-10 zdań.
- **Bez "Cześć"/"Witam"** — "Dzień dobry, [Imię]".
- **1 zdanie:** podziękowanie + co przeczytałem.
- **2 zdanie:** największy diagnozowany problem (słowami klienta).
- **3-4:** konkretna propozycja pierwszego kroku z liczbami (oszczędność, czas budowy).
- **5:** klikalny prototyp gotowy do zobaczenia (jeśli `mvp_published_at` istnieje, daj link `https://crm.tomekniedzwiecki.pl/zwolnie/p/<token>` — pobierz token z tabeli).
- **6:** "Wracam w ciągu 24h z dokumentem propozycji jeśli kierunek pasuje" — odwrócenie kontroli.
- **Bez telefonu** — klient sam ma ogarnąć.
- **Bez "z poważaniem"** — "Pozdrawiam, Tomek".

## Output

Czysty plain text gotowy do wklejenia do Gmail. Pierwsza linia "Temat: ...", druga pusta, reszta body.

Zwróć tylko mail — nie wykonuj żadnego curl save (mail Tomek wysyła ręcznie z Gmail).$T$,
    updated_at = now()
where slug = 'follow_up_email';
