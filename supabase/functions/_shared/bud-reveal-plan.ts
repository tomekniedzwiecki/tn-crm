// _shared/bud-reveal-plan.ts
// JEDNO ŹRÓDŁO PRAWDY sekwencji odkrywania (drip) lejka /sklep „Zbuduję". Importują:
// bud-drip (cron: seed + wysyłka + bramki) ORAZ bud-project (eager-seed przy wejściu do panelu).
// NIE duplikuj tego planu — rozjazd kopii był źródłem bugów. Zmieniasz kadencję/bramki => TYLKO tutaj.
//
// Model /sklep: pokazujemy leadowi, co REALNIE dla niego zbudowaliśmy na każdym etapie
// (raport → makiety → reklamy → strona), nawiązując do jego produktu i ustaleń, i ciągniemy do
// REZERWACJI (500 zł zwrotna). Każdy krok ma `requires` = pole bud_sessions, które MUSI istnieć,
// żeby odsłona miała sens (np. nie wysyłaj „zobacz makiety", gdy mockups jeszcze nie ma). Lead,
// który porzucił po raporcie, dostaje raport + zamknięcie (rezerwacja, requires:null), bez pustych odsłon.
//  • raport / makiety / reklamy = wysyłane gdy artefakt jest, w odstępach 0h / 5h / 10h od seedu.
//  • strona = gate 'visits2' (lead wszedł do panelu >=2x SAM) + wymaga landing_html.
//  • rezerwacja = ZAMKNIĘCIE: zawsze (gate 'none', requires null) — recap + CTA zwrotnej rezerwacji.
//  • reclose1/reclose2 = RE-CLOSE po rezerwacji (+48h / +5 dni): spokojne dopięcie, TYLKO gdy
//    paid_at IS NULL i lead nie zrezygnował (guard w cronie: paid_at/full_paid_at/
//    sequence_cancelled_at/pipeline_override='resigned'). CTA → PANEL (#wspolpraca), nie checkout.
// due_at (h) to „nie wcześniej niż"; realną bramką jest istnienie artefaktu (requires) + zaangażowanie.

export type RevealGate = 'none' | 'visits2' | 'seen_landing'
export interface RevealStep { key: string; seq: number; h: number; emailKind: string; gate: RevealGate; requires: string | null }

export const REVEAL_PLAN: RevealStep[] = [
  { key: 'raport',     seq: 1, h: 0,  emailKind: 'reveal_raport',     gate: 'none',    requires: 'market_report' },
  { key: 'makiety',    seq: 2, h: 5,  emailKind: 'reveal_makiety',    gate: 'none',    requires: 'mockups' },
  { key: 'reklamy',    seq: 3, h: 10, emailKind: 'reveal_reklamy',    gate: 'none',    requires: 'session_ads' },
  { key: 'strona',     seq: 4, h: 24, emailKind: 'reveal_strona',     gate: 'visits2', requires: 'landing_html' },
  { key: 'rezerwacja', seq: 5, h: 30, emailKind: 'reveal_rezerwacja', gate: 'none',    requires: null },
  // RE-CLOSE po rezerwacji (paid_at IS NULL, nie-rezygnacja — guard w cronie). Link do PANELU
  // (#wspolpraca), nie direct checkout — proof-grid + narracja zwrotności domykają.
  { key: 'reclose1',   seq: 6, h: 78,  emailKind: 'reveal_reclose_1', gate: 'none',    requires: null }, // +48h po rezerwacji (30h)
  { key: 'reclose2',   seq: 7, h: 150, emailKind: 'reveal_reclose_2', gate: 'none',    requires: null }, // +5 dni po rezerwacji (30h)
]

// Bramka „2 wizyty" (strona) + debounce liczenia odrębnych wejść do panelu.
// 2 wejścia rozdzielone >= 30 min = realny powrót, nie polling/odświeżenie.
export const PANEL_VISITS_GATE = 2
export const VISIT_DEBOUNCE_MS = 30 * 60 * 1000
