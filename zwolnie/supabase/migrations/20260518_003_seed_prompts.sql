-- ============================================================================
-- Seed initial prompt templates for AI generation
-- Variables in templates: {{contact_name}}, {{company}}, {{website}},
--   {{industry}}, {{team_size}}, {{payroll}}, {{budget}}, {{problem}}
-- These prompts are designed to be copied to Claude Code in VS Code by Tomek.
-- ============================================================================

insert into ze_prompts (slug, title, description, template, output_format, expected_output) values

-- ---------------------------------------------------------------------------
-- 1) BUSINESS ANALYSIS
-- ---------------------------------------------------------------------------
(
'business_analysis',
'Analiza biznesu',
'Pełna analiza biznesu klienta z formularza. Wynik wracam jako JSON (struktura w expected_output) i wklejam do panelu.',
$T$Jestem Tomek Niedźwiecki, prowadzę usługi pod marką "Zwolnię Twoich pracowników" — buduję CRM-y, automatyzacje i systemy, które zastępują etaty. Obietnica na landingu: poznam proces klienta, zbuduję technologię za max 33% pensji osób, które wcześniej te zadania wykonywały. Klient ma wybór: ten sam obrót przy mniejszym zespole, albo większy biznes tym samym zespołem.

Otrzymałem brief od potencjalnego klienta. Twoim zadaniem jest przygotowanie **realistycznej, konkretnej analizy biznesu** — bez purple prose, bez ogólników, bez "rewolucji" i "transformacji". Mam dostarczyć temu klientowi realną wartość.

## Dane z briefu

- **Imię i nazwisko:** {{contact_name}}
- **Firma:** {{company}}
- **Strona WWW:** {{website}}
- **Branża:** {{industry}}
- **Wielkość zespołu:** {{team_size}}
- **Miesięczne koszty osobowe:** {{payroll}}
- **Budżet na rozwiązanie:** {{budget}}

## Opis problemu (własnymi słowami klienta)

{{problem}}

## Czego potrzebuję od Ciebie

Przeanalizuj brief i zwróć JSON o strukturze podanej niżej. Zasady:
1. **Jeśli klient ma stronę WWW** — wejdź na nią (WebFetch) i wykorzystaj konkrety z firmy.
2. **Jeśli brief jest niejasny** — zaznacz to w polu `clarifying_questions` (max 3 pytania, krótko).
3. **Liczby muszą się zgadzać** — koszty osobowe / oszczędność / koszt rozwiązania muszą się sumować logicznie.
4. **Bez ogólników typu "AI/automatyzacja zwiększy efektywność"** — nazwij konkretny proces, konkretne narzędzie, konkretny rezultat.
5. **Maksymalnie 3-5 propozycji** — od najwyższego ROI do najniższego. Jakość > ilość.

## Oczekiwany output (JSON)

```json
{
  "summary": "1-2 zdania — co robi firma i gdzie boli najbardziej. Konkretnie.",
  "diagnosed_pain_points": [
    {
      "title": "Krótki tytuł problemu",
      "evidence_from_brief": "Cytat lub parafraza z briefu",
      "business_cost": "Ile to kosztuje firmę miesięcznie (czas, pieniądze, utrata szansy)",
      "severity": "low | medium | high"
    }
  ],
  "proposed_solutions": [
    {
      "title": "Nazwa rozwiązania — krótka, bez buzzwordów",
      "what_it_does": "1-2 zdania co to robi technicznie",
      "what_etat_replaces": "Jakie zadania osoby (lub osoby) odciąża, ile godzin/mies",
      "stack_suggestion": "Stack: np. Supabase + n8n + Make + custom panel; albo czysty custom",
      "build_estimate_pln": "Koszt budowy w PLN (zakres min-max)",
      "build_estimate_weeks": "Czas budowy w tygodniach (zakres min-max)",
      "monthly_savings_pln": "Oszczędność miesięczna w PLN",
      "payback_months": "Po ilu miesiącach się zwróci",
      "risk_level": "low | medium | high",
      "depends_on": "Czego potrzeba od klienta żeby ruszyć (dane, dostępy, decyzje)"
    }
  ],
  "recommended_first_step": {
    "title": "Najlepsze pierwsze rozwiązanie do wdrożenia",
    "why": "Dlaczego to, a nie inne — krótko",
    "mvp_scope": "Co można zrobić w 1-2 tygodnie żeby zwalidować pomysł (klikalny prototyp)"
  },
  "clarifying_questions": [
    "Pytanie 1 do klienta jeśli brief jest niejasny",
    "Pytanie 2"
  ],
  "estimated_total_savings_pln_per_year": "Suma rocznych oszczędności jeśli klient wdroży wszystkie 3 propozycje",
  "estimated_total_build_pln": "Suma kosztów budowy wszystkich propozycji",
  "honest_assessment": "Jednozdaniowa szczera ocena: czy to dobry klient dla mnie i czy mogę dostarczyć obietnicę 33% pensji. Bez owijania w bawełnę."
}
```

Zwróć WYŁĄCZNIE JSON, bez wstępu i komentarzy. Owinięty w ```json bloki.$T$,
'json',
'JSON ze strukturą diagnosed_pain_points + proposed_solutions + recommended_first_step. Wklej do panelu po wygenerowaniu w Claude Code.'
),

-- ---------------------------------------------------------------------------
-- 2) MVP PROTOTYPE GENERATOR
-- ---------------------------------------------------------------------------
(
'mvp_generator',
'Klikalny prototyp MVP',
'Generator wstępnej klikalnej wersji proponowanego rozwiązania. Pojedynczy HTML do podejrzenia przez klienta przed inwestycją.',
$T$Jestem Tomek Niedźwiecki. Dla klienta {{company}} ({{contact_name}}) z branży {{industry}} przygotowuję klikalny prototyp MVP, żeby pokazać kierunek rozwiązania **przed** podpisaniem umowy. Klient ma kliknąć, zobaczyć "tak to mogłoby działać", i podjąć decyzję.

## Kontekst klienta

**Problem własnymi słowami:**
{{problem}}

**Wielkość zespołu:** {{team_size}}
**Budżet:** {{budget}}

## Zadanie

Zbuduj **JEDEN samodzielny plik HTML** (inline CSS + inline JS, bez zewnętrznych zależności poza CDN Tailwind), który prezentuje **klikalny prototyp** głównego rozwiązania zaproponowanego w analizie biznesu.

## Zasady

1. **To NIE jest produkcyjna aplikacja.** To prototyp do pokazania kierunku.
2. **Bez backendu, bez bazy.** Dane mockowane w JS (tablice).
3. **Konkretne, branżowe.** Jeśli klient prowadzi sklep z meblami — pokaż meble. Jeśli ma kancelarię prawną — pokaż umowy/sprawy.
4. **3-5 ekranów / widoków** — przełączane tabami lub menu. Każdy ekran demonstruje jedną funkcję.
5. **Klikalne CTA i przejścia** — buttony coś robią (alert, zmiana ekranu, dodanie do listy).
6. **Estetyka clean / dark / professional** — Tailwind, sans-serif (Inter), ciemny motyw zinc/black jak w panelu admina (`background: #050505; color: #e5e5e5`).
7. **Header z nazwą firmy klienta** — np. "{{company}} · Panel" (nie "MyApp" ani "Dashboard").
8. **Footer:** "Prototyp przygotowany dla {{company}} przez Tomka Niedźwieckiego · zwolnie.tomekniedzwiecki.pl"
9. **NIE używaj** lorem ipsum, placeholderów typu "Lorem", "TODO", emojis (chyba że klient prosi).
10. **Brak komentarzy w HTML** — wyjście do klienta, nie do mnie.

## Output

WYŁĄCZNIE pełny plik HTML, owinięty w ```html bloki. Bez wstępu, bez komentarzy o tym co zrobiłeś. Sam HTML, gotowy do wklejenia do panelu i podejrzenia w iframe.$T$,
'html',
'Pełny self-contained plik HTML z klikalnym prototypem. Wklej do panelu — system zapisuje jako lead.mvp_html i pokazuje klientowi w iframe.'
),

-- ---------------------------------------------------------------------------
-- 3) FOLLOW-UP EMAIL
-- ---------------------------------------------------------------------------
(
'follow_up_email',
'Mail follow-up po analizie',
'Mail do klienta po wykonaniu analizy biznesu. Bez sprzedaży, z konkretną propozycją kolejnego kroku.',
$T$Jestem Tomek Niedźwiecki. Dla klienta {{contact_name}} ({{company}}, branża {{industry}}) zrobiłem analizę jego briefu. Napisz mu maila z konkretną propozycją.

## Brief klienta (kontekst)

{{problem}}

## Co już wiem (z analizy)

Wklej tu fragment analizy biznesu — recommended_first_step + estimated_total_savings_pln_per_year + monthly_savings_pln pierwszej propozycji.

## Zasady stylu maila

- **Krótko.** 6-10 zdań max.
- **Bez "Cześć"/"Witam"** — Polski biznesowy mail: "Dzień dobry, [Imię]" w pierwszej linii.
- **Pierwsze zdanie:** podziękowanie za brief + co przeczytałem (1 zdanie).
- **Drugie:** największy diagnozowany problem (1 zdanie, ich słowami).
- **Trzecie-czwarte:** konkretna propozycja pierwszego kroku (z liczbami).
- **Piąte:** klikalny prototyp gotowy do zobaczenia (link).
- **Szóste:** "Wracam w ciągu 24h z dokumentem propozycji jeśli kierunek pasuje" — odwrócenie kontroli (klient decyduje).
- **Brak telefonu** — klient sam ma ogarnąć (kopiuj link, klikaj).
- **Brak "z poważaniem"** — "Pozdrawiam, Tomek" wystarcza.

## Output

Czysty tekst maila gotowy do wklejenia do Gmaila. Bez markdown, bez bloków kodu. Pierwsza linia: "Temat: ...". Druga linia pusta. Reszta to body.$T$,
'markdown',
'Plain text email — Temat + body. Wklej do Gmail lub do gmail-create-draft.'
);
