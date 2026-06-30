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
