// REJESTR PROMPTÓW APLIKACJI — jedyne źródło prawdy o tym, KTÓRE treści sterujące
// modelem są wyniesione do settings i edytowalne z panelu „Źródło prawdy".
//
// Zasada (decyzja Tomka 2026-06-20): KAŻDA treść strojalna ma JEDNO miejsce = settings.
// Kod czyta z settings (pusty fallback tylko jako bezpiecznik — nie trzyma treści).
// KONTRAKTY KODU (schematy JSON, składnia markerów, walidacje, limity) NIE są tu —
// zostają w kodzie, bo to kod, nie treść.
//
// Dodanie nowego edytowalnego promptu = jeden wpis tutaj + seed klucza + odczyt w kodzie.
// Panel i spar-admin-settings renderują się Z TEGO rejestru → zero przebudowy panelu.

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

export const SPAR_PROMPTS: PromptDef[] = [
  {
    key: 'aplikacja_model_biznesowy',
    label: 'Fakty oferty (SSOT)',
    group: 'Fundament',
    stage: 'wszystkie',
    editable: true, min: 200, max: 8000,
    note: 'Liczby i zasady oferty. Zasila maile dripowe i plany (drip/economics/gtm/plan).',
  },
  {
    key: 'stworze_sparing_prompt',
    label: 'Główny prompt czatu',
    group: 'Etap 1 — Rozmowa o pomyśle',
    stage: '1',
    editable: true, min: 2000, max: 120000,
    note: 'Steruje ŻYWYMI rozmowami. Zawiera markery i retorykę — nieostrożna zmiana psuje czat.',
  },
];

// Mapa key→def (szybki lookup w walidacji zapisu).
export const SPAR_PROMPTS_BY_KEY: Record<string, PromptDef> = Object.fromEntries(
  SPAR_PROMPTS.map((p) => [p.key, p]),
);
