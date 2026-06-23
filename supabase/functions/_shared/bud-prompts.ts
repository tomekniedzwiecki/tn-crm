// REJESTR PROMPTÓW LEJKA „ZBUDUJĘ" (AWE) — jedyne źródło prawdy o tym, KTÓRE treści
// sterujące modelem są wyniesione do settings i edytowalne z panelu „Źródło prawdy".
//
// Zasada (decyzja Tomka 2026-06-20): KAŻDA treść strojalna ma JEDNO miejsce = settings.
// Kod czyta z settings (pusty fallback tylko jako bezpiecznik — nie trzyma treści).
// KONTRAKTY KODU (schematy JSON, składnia markerów, walidacje, limity) NIE są tu —
// zostają w kodzie, bo to kod, nie treść.
//
// Dodanie nowego edytowalnego promptu = jeden wpis tutaj + seed klucza + odczyt w kodzie.
// Panel i bud-admin-settings renderują się Z TEGO rejestru → zero przebudowy panelu.

export type PromptDef = {
  key: string;        // klucz w tabeli settings
  label: string;      // etykieta w panelu
  group: string;      // grupa (sekcja panelu)
  stage: string;      // etap lejka, którego dotyczy
  editable: boolean;  // czy edytowalne z panelu (false = read-only podgląd)
  min: number;        // min długość (zabezpieczenie przed wyczyszczeniem)
  max: number;        // max długość
  note?: string;      // krótka nota/ostrzeżenie
};

export const BUD_PROMPTS: PromptDef[] = [
  {
    key: 'budowanie_model_biznesowy',
    label: 'Fakty oferty (SSOT)',
    group: 'Fundament',
    stage: 'wszystkie',
    editable: true, min: 200, max: 8000,
    note: 'Liczby i zasady oferty. Zasila maile dripowe i plany (drip/economics/gtm/plan).',
  },
  {
    key: 'budowanie_sparing_prompt',
    label: 'Główny prompt czatu',
    group: 'Etap 1 — Rozmowa o pomyśle',
    stage: '1',
    editable: true, min: 2000, max: 120000,
    note: 'Steruje ŻYWYMI rozmowami. Zawiera markery i retorykę — nieostrożna zmiana psuje czat.',
  },
  // Etap 3 — Spowiednik (know-how). Treść czytana przez bud-chat (ensureKnowhowPrompts).
  { key: 'budowanie_knowhow_base', label: 'Spowiednik — baza (jak prowadzi)', group: 'Etap 3 — Spowiednik (know-how)', stage: '3', editable: true, min: 200, max: 8000, note: 'Rdzeń trybu „Dopracowanie wizji" po pełnej płatności: zbieranie, nie ocena.' },
  { key: 'budowanie_knowhow_src_wlasny', label: 'Spowiednik — wariant: pomysł własny', group: 'Etap 3 — Spowiednik (know-how)', stage: '3', editable: true, min: 50, max: 4000, note: 'Gdy klient zna branżę od środka (insider).' },
  { key: 'budowanie_knowhow_src_ai', label: 'Spowiednik — wariant: pomysł od AI', group: 'Etap 3 — Spowiednik (know-how)', stage: '3', editable: true, min: 50, max: 4000, note: 'Gdy pomysł podsunęła AI — wiedzę branżową bierze na siebie Tomek/research.' },
  { key: 'budowanie_knowhow_src_wspolny', label: 'Spowiednik — wariant: wspólny', group: 'Etap 3 — Spowiednik (know-how)', stage: '3', editable: true, min: 50, max: 4000, note: 'Część wiedzy od klienta, część z researchu.' },
  { key: 'budowanie_knowhow_resume', label: 'Spowiednik — powrót do rozmowy', group: 'Etap 3 — Spowiednik (know-how)', stage: '3', editable: true, min: 100, max: 6000, note: 'Proaktywna zaczepka po „wróć do rozmowy".' },
  { key: 'budowanie_knowhow_extract', label: 'Spowiednik — cicha ekstrakcja wiedzy', group: 'Etap 3 — Spowiednik (know-how)', stage: '3', editable: true, min: 200, max: 6000, note: 'Zamienia ostatnią wymianę na konkrety (bud_knowhow_items). Zawiera kontrakt JSON — ostrożnie.' },
  { key: 'budowanie_knowhow_handoff', label: 'Spowiednik — pakiet wykonawczy (handoff)', group: 'Etap 3 — Spowiednik (know-how)', stage: '3', editable: true, min: 100, max: 6000, note: 'Brief v1 dla zespołu przy domknięciu etapu.' },
  { key: 'budowanie_knowhow_idea_source_hint', label: 'Spowiednik — hint źródła pomysłu (przy werdykcie)', group: 'Etap 3 — Spowiednik (know-how)', stage: '1', editable: true, min: 50, max: 4000, note: 'Przy <werdykt> model dołącza pole „zrodlo" (wlasny/ai/wspolny).' },
  // Deliverables (generatory po zielonym werdykcie). Treść czytana w handlerach (load z settings).
  { key: 'budowanie_prompt_plan_system', label: 'Plan przychodu — system prompt', group: 'Deliverables — generatory', stage: '2', editable: true, min: 500, max: 8000, note: 'Jak liczony wstępny plan przychodu (model/cena/kamienie/zwrot).' },
  { key: 'budowanie_prompt_economics_system', label: 'Opłacalność (economics) — system prompt', group: 'Deliverables — generatory', stage: '2', editable: true, min: 500, max: 8000, note: 'Jak liczone tiery cen + unit economics (CAC/churn/marża).' },
  { key: 'budowanie_prompt_gtm_system', label: 'GTM (playbook) — system prompt', group: 'Deliverables — generatory', stage: '2', editable: true, min: 500, max: 8000, note: 'Główny playbook zdobycia pierwszych klientów (kanały, skrypty, obiekcje).' },
  { key: 'budowanie_prompt_gtm_channels', label: 'GTM — kanały (system prompt)', group: 'Deliverables — generatory', stage: '2', editable: true, min: 200, max: 6000, note: 'Zakładka „Gdzie szukać klientów" — kanały akwizycji.' },
  { key: 'budowanie_prompt_gtm_ads', label: 'GTM — reklamy 4 kąty (system prompt)', group: 'Deliverables — generatory', stage: '2', editable: true, min: 200, max: 6000, note: 'Zakładka „Reklamy" — 4 gotowe reklamy w 4 kątach.' },
  { key: 'budowanie_prompt_landing_system', label: 'Landing — generator (system prompt)', group: 'Deliverables — generatory', stage: '2', editable: true, min: 800, max: 12000, note: 'Jak powstaje strona sprzedażowa sklepu (HTML, copy, struktura). Zawiera przykłady kodu (backticki) — ostrożnie.' },
  { key: 'budowanie_prompt_landing_critic', label: 'Landing — krytyk/art director (system prompt)', group: 'Deliverables — generatory', stage: '2', editable: true, min: 400, max: 8000, note: 'Drugi przebieg podnoszący jakość landinga.' },
  { key: 'budowanie_prompt_prototype_system', label: 'Prototyp — generator (system prompt)', group: 'Deliverables — generatory', stage: '2', editable: true, min: 1000, max: 16000, note: 'Jak powstaje klikalny prototyp sklepu (HTML/JS). Zawiera przykłady kodu — ostrożnie.' },
  { key: 'budowanie_prompt_prototype_critic', label: 'Prototyp — krytyk (system prompt)', group: 'Deliverables — generatory', stage: '2', editable: true, min: 400, max: 8000, note: 'Drugi przebieg (audyt + polishing) prototypu.' },
  { key: 'budowanie_prompt_products_system', label: 'Dobór produktu — propozycje (K1)', group: 'Deliverables — generatory', stage: '1', editable: true, min: 800, max: 12000, note: 'Mózg doboru produktu K1: rubryka „winning product" + research live + kontrakt JSON 8-10 ProductCandidate. Czyta bud-products.' },
  { key: 'budowanie_produkt_playbook', label: 'Dobór produktu — playbook „winning product" (PL)', group: 'Deliverables — generatory', stage: '1', editable: true, min: 800, max: 12000, note: 'Fundament wiedzy K1: definicja perełki, progi, rubryka scoringowa 7 osi, czerwone flagi, nasycenie, specyfika PL, słownik bez żargonu. Wstrzykiwany do keywordgen i scoringu.' },
  { key: 'budowanie_produkt_keywordgen', label: 'Dobór produktu — generator konceptów (ETAP 1)', group: 'Deliverables — generatory', stage: '1', editable: true, min: 300, max: 6000, note: 'Z niszy klienta → 15–20 angielskich konceptów-perełek. JSON {koncepty[]}. Czyta bud-products ETAP 1.' },
  { key: 'budowanie_produkt_scoring', label: 'Dobór produktu — scoring/re-analiza (ETAP 3)', group: 'Deliverables — generatory', stage: '1', editable: true, min: 800, max: 12000, note: 'Ocenia realnych kandydatów wg rubryki 7 osi, odrzuca słabe/nasycone, zwraca TOP 5–6 perełek. JSON {perelki[]}. Czyta bud-products ETAP 3.' },
  // Instrukcje etapów rozmowy (wstrzykiwane do promptu czatu wg fazy). Czytane przez bud-chat.
  { key: 'budowanie_etap_gate', label: 'Bramka oceny potencjału (GATE)', group: 'Instrukcje etapów rozmowy', stage: '1', editable: true, min: 100, max: 6000, note: 'Po domknięciu rdzenia: model wystawia <ocena> zamiast werdyktu.' },
  { key: 'budowanie_etap_preview_po_kierunku', label: 'Podgląd po dopracowaniu kierunku', group: 'Instrukcje etapów rozmowy', stage: '1', editable: true, min: 100, max: 6000, note: 'Po badaniu rynku + akceptacji kierunku → <projekt> + zielony werdykt.' },
  { key: 'budowanie_etap_wspolpraca', label: 'Faza współpracy (po zielonym werdykcie)', group: 'Instrukcje etapów rozmowy', stage: '2', editable: true, min: 100, max: 6000, note: 'Przejście z oceny w rezerwację + przełamywanie obiekcji.' },
  { key: 'budowanie_etap_rezygnacja', label: 'Detekcja rezygnacji', group: 'Instrukcje etapów rozmowy', stage: 'X', editable: true, min: 100, max: 6000, note: 'Dwustopniowy protokół oznaczania rezygnacji (<rezygnacja/>).' },
  // Maile follow-up (bud-followups). System-prompty zawierają placeholder {{SYTUACJA}} — NIE usuwaj go.
  { key: 'budowanie_mail_sytuacja', label: 'Follow-up — kontekst sytuacji', group: 'Maile — follow-up', stage: '1', editable: true, min: 100, max: 8000, note: 'Wspólny kontekst (SITUATION) wstawiany w {{SYTUACJA}} obu system-promptów follow-upów.' },
  { key: 'budowanie_mail_email_system', label: 'Follow-up — system prompt (pojedynczy mail)', group: 'Maile — follow-up', stage: '1', editable: true, min: 300, max: 12000, note: 'Głos/ton/żargon dla pojedynczych follow-upów (nurture, last_call, welcome). Zawiera {{SYTUACJA}}.' },
  { key: 'budowanie_mail_sequence_system', label: 'Follow-up — system prompt (sekwencja powrotu)', group: 'Maile — follow-up', stage: '1', editable: true, min: 300, max: 12000, note: 'Prompt dla sekwencji 3 maili „powrotu do rozmowy" + SMS. Zawiera {{SYTUACJA}}.' },
  { key: 'budowanie_mail_cele', label: 'Follow-up — cele maili (JSON)', group: 'Maile — follow-up', stage: '1', editable: true, min: 100, max: 16000, note: 'JSON: cel każdego maila po kind (+ _wspolne/_dens = reguły serii). Musi pozostać poprawnym JSON-em.' },
  // Maile drip „sekwencja odkrywania" (bud-drip). System prompt: {{SYTUACJA}} + {{MODEL_BLOCK}}.
  { key: 'budowanie_drip_sytuacja', label: 'Drip — kontekst sytuacji', group: 'Maile — drip (odkrywanie)', stage: '2', editable: true, min: 100, max: 8000, note: 'Kontekst (SITUATION) wstawiany w {{SYTUACJA}} system-promptu dripu.' },
  { key: 'budowanie_drip_system', label: 'Drip — system prompt (reveale)', group: 'Maile — drip (odkrywanie)', stage: '2', editable: true, min: 300, max: 16000, note: 'Głos/ton/żargon maili odsłon (rynek/economics/landing/prototyp/gtm). Zawiera {{SYTUACJA}} i {{MODEL_BLOCK}} — NIE usuwaj.' },
  { key: 'budowanie_drip_cele', label: 'Drip — cele odsłon (JSON)', group: 'Maile — drip (odkrywanie)', stage: '2', editable: true, min: 100, max: 12000, note: 'JSON: cel maila każdej odsłony po kluczu (rynek/economics/landing/prototyp/gtm). Poprawny JSON.' },
  // SMS reaktywacyjne „powrotu z ekranu" (bud-followups, gated SMS_ENABLED). Link w {{LINK}} — NIE usuwaj.
  { key: 'budowanie_sms_ekrany_back', label: 'SMS powrotu — ekrany', group: 'SMS — reaktywacja', stage: '1', editable: true, min: 20, max: 300, note: 'Gdy lead wyszedł z generowania ekranów. BEZ polskich znaków (auto-transliteracja), ≤~2 segmenty. Musi zawierać {{LINK}}.' },
  { key: 'budowanie_sms_badanie_back', label: 'SMS powrotu — badanie rynku', group: 'SMS — reaktywacja', stage: '1', editable: true, min: 20, max: 300, note: 'Gdy lead wyszedł z badania rynku. BEZ polskich znaków (auto-transliteracja), ≤~2 segmenty. Musi zawierać {{LINK}}.' },
];

// Mapa key→def (szybki lookup w walidacji zapisu).
export const BUD_PROMPTS_BY_KEY: Record<string, PromptDef> = Object.fromEntries(
  BUD_PROMPTS.map((p) => [p.key, p]),
);
