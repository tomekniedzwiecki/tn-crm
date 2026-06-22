// _shared/bud-reveal-plan.ts
// JEDNO ŹRÓDŁO PRAWDY sekwencji odkrywania (drip). Importują: bud-drip (cron:
// seed + wysyłka + bramki) ORAZ bud-project (eager-seed przy wejściu do panelu).
// NIE duplikuj tego planu w żadnej funkcji — rozjazd kopii (godziny vs dni, inna
// kolejność landing/gtm) był źródłem bugów (2026-06-16). Zmieniasz kadencję lub
// bramki => zmieniasz TYLKO tutaj.
//
// Model (decyzja Tomka 2026-06-16 — „raz a dobrze"):
//  • rynek / economics / gtm  = TRANSAKCYJNE: wysyłane ZAWSZE, w odstępach
//    0h / 5h / 10h od werdyktu (gate 'none'). To one ciągną leada do panelu.
//  • landing  (strona sprzedażowa) = gate 'visits2' — generujemy i wysyłamy
//    dopiero gdy lead wszedł do panelu >=2x SAM (panel_visits >= 2).
//  • prototyp = gate 'seen_landing' — generujemy i wysyłamy dopiero gdy zobaczył
//    stronę sprzedażową (seen_landing_at IS NOT NULL: zakładka 'strona' / landing).
// landing/prototyp mają due_at PO transakcyjnych (11h/12h) — to tylko „nie
// wcześniej niż"; realną bramką jest zaangażowanie (wizyty / obejrzenie), nie zegar.

export type RevealGate = 'none' | 'visits2' | 'seen_landing'
export interface RevealStep { key: string; seq: number; h: number; emailKind: string; gate: RevealGate }

export const REVEAL_PLAN: RevealStep[] = [
  { key: 'rynek',     seq: 1, h: 0,  emailKind: 'reveal_rynek',     gate: 'none' },
  { key: 'economics', seq: 2, h: 5,  emailKind: 'reveal_economics', gate: 'none' },
  { key: 'gtm',       seq: 3, h: 10, emailKind: 'reveal_gtm',       gate: 'none' },
  { key: 'landing',   seq: 4, h: 11, emailKind: 'reveal_landing',   gate: 'visits2' },
  { key: 'prototyp',  seq: 5, h: 12, emailKind: 'reveal_prototyp',  gate: 'seen_landing' },
]

// Bramka „2 wizyty" (landing) + debounce liczenia odrębnych wejść do panelu.
// 2 wejścia rozdzielone >= 30 min = realny powrót, nie polling/odświeżenie.
export const PANEL_VISITS_GATE = 2
export const VISIT_DEBOUNCE_MS = 30 * 60 * 1000
