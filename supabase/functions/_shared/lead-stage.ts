// _shared/lead-stage.ts — monotoniczny awans leada /sklep po lejku pipeline CRM.
//
// Kolumny pipeline (settings.pipeline_stages) — Tomek PRZEMIANOWAŁ etykiety, więc
// status (id) ≠ wyświetlana nazwa. Aktualne mapowanie (2026-06):
//   new        → „Nowy"            — email + telefon podane
//   contacted  → „Skontaktowany"   — sklep wygenerowany i OBEJRZANY
//   qualified  → „Oferta"          — rozmowa o warunkach współpracy
//   proposal   → „Zakwalifikowany" — blisko rezerwacji (kliknął „zapłać rezerwację")
//   negotiation→ „Rezerwacja"      — rezerwacja 500 zł OPŁACONA
//   won        → „Wygrany"         — pełna budowa (9400 zł) opłacona
//
// Zasady:
//  • Bump TYLKO do przodu (monotonicznie) — nigdy nie cofa, nigdy nie rusza „Wygranego" w dół.
//  • Sygnały PASYWNE (obejrzenie sklepu, rozmowa) NIE wskrzeszają leada ręcznie oznaczonego
//    jako lost/abandoned — żeby nie nadpisywać decyzji Tomka o dyskwalifikacji.
//  • Sygnały MOCNE (kliknięcie płatności, opłacenie) wskrzeszają (allowRevive) — skoro płaci,
//    żyje, nawet jeśli był wcześniej odrzucony.

export const SKLEP_STAGE_RANK: Record<string, number> = {
  new: 0, contacted: 1, qualified: 2, proposal: 3, negotiation: 4, won: 5,
};

const STAGE_LABEL: Record<string, string> = {
  new: 'Nowy', contacted: 'Skontaktowany', qualified: 'Oferta',
  proposal: 'Zakwalifikowany', negotiation: 'Rezerwacja', won: 'Wygrany',
};

export async function bumpLeadStage(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  leadId: string | null | undefined,
  target: string,
  opts?: { allowRevive?: boolean; channel?: string },
): Promise<void> {
  try {
    if (!leadId || !Object.prototype.hasOwnProperty.call(SKLEP_STAGE_RANK, target)) return;
    const allowRevive = !!(opts && opts.allowRevive);
    // Etykieta lejka w logu aktywności — '/sklep' (domyślnie) lub '/aplikacja' (spar-project).
    const channel = (opts && opts.channel) || '/sklep';
    const { data: lead } = await supabase
      .from('leads').select('status, activities').eq('id', leadId).maybeSingle();
    if (!lead) return;
    const cur = (lead.status as string) || 'new';
    // status spoza rankingu (lost/abandoned/inny) → rank -1 (revivable tylko przy allowRevive)
    const curRank = Object.prototype.hasOwnProperty.call(SKLEP_STAGE_RANK, cur)
      ? SKLEP_STAGE_RANK[cur] : -1;
    if (curRank === -1 && !allowRevive) return;     // pasywny sygnał nie wskrzesza dyskwalifikowanego
    if (curRank >= SKLEP_STAGE_RANK[target]) return; // już nie niżej — nie ruszaj
    const activity = {
      type: 'status_change',
      content: `Status (lejek ${channel}): ${STAGE_LABEL[cur] || cur} → ${STAGE_LABEL[target] || target}`,
      created_at: new Date().toISOString(),
      performed_by: null,
      performed_by_name: `System ${channel}`,
    };
    const { error } = await supabase.from('leads')
      .update({ status: target, activities: [...((lead.activities as unknown[]) || []), activity] })
      .eq('id', leadId);
    if (error) console.error('[lead-stage] update error:', error);
  } catch (e) {
    console.error('[lead-stage] bump error:', e);
  }
}

// ── REVIVE przy POWROCIE leada do rozmowy ─────────────────────────────────────
// Sygnały MOCNE (realna wiadomość usera w czacie) wskrzeszają leada z terminala
// lost/abandoned. Sygnały PASYWNE (ogląd panelu, zaczepki systemowe) NIE — to robi
// wywołujący, decydując KIEDY wołać reviveLeadOnReengage (tylko z genuine user turn).

interface ReviveSignals {
  full_paid_at?: unknown;
  paid_at?: unknown;
  verdict?: unknown;
  panel_visits?: unknown;
  seen_landing_at?: unknown;
}

// Etap docelowy przy wskrzeszeniu — liczony z sygnałów sesji, z FLOOREM 'new'.
// Lead w lost/abandoned MA lead_id (przeszedł bramkę kontaktu), więc jeśli wcześniej
// dostał zielony werdykt / opłacił rezerwację, revive sztywno do 'new' cofnąłby realnie
// zaawansowaną sprzedaż. Ta sama kaskada co spar-project/bud-project (get-sync).
export function reviveTargetFromSignals(s: ReviveSignals): string {
  const visits = (s.panel_visits as number | null) || 0;
  const green = (s.verdict as string | null) === 'zielony';
  if (s.full_paid_at) return 'won';
  if (s.paid_at) return 'negotiation';
  if (green && visits >= 2) return 'proposal';
  if (green) return 'qualified';
  if (s.seen_landing_at) return 'contacted';
  return 'new';
}

export interface ReviveResult {
  revived: boolean;
  from?: string;  // status terminalny sprzed wskrzeszenia (lost/abandoned)
  to?: string;    // etap docelowy (z sygnałów)
}

// Wskrzesza leada TYLKO z terminala lost/abandoned (aktywne etapy zostawia monotoniczny
// bumpLeadStage — tu jawny guard = zero zbędnego wpisu activity i zero ruszania leadów
// w won/negotiation/itd.). Target z sygnałów (allowRevive, bo cur rank = -1). Wołać
// WYŁĄCZNIE z gałęzi genuine-user-turn (realna wiadomość usera).
// Zwraca { revived, from, to } — caller na tej podstawie odpala Slack alert i stopuje
// sekwencję maili „porzucony" (sequence_cancelled_at). { revived:false } = no-op.
export async function reviveLeadOnReengage(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  leadId: string | null | undefined,
  signals: ReviveSignals,
  channel: string,
): Promise<ReviveResult> {
  try {
    if (!leadId) return { revived: false };
    const { data: lead } = await supabase
      .from('leads').select('status').eq('id', leadId).maybeSingle();
    const cur = (lead?.status as string | null) || null;
    if (cur !== 'lost' && cur !== 'abandoned') return { revived: false }; // tylko terminal się wskrzesza
    const target = reviveTargetFromSignals(signals);
    await bumpLeadStage(supabase, leadId, target, { allowRevive: true, channel });
    return { revived: true, from: cur, to: target };
  } catch (e) {
    console.error('[lead-stage] reviveLeadOnReengage error:', e);
    return { revived: false };
  }
}
