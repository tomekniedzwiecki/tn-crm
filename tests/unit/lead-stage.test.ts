/**
 * Testy dla _shared/lead-stage.ts — awans/wskrzeszanie leada po lejku CRM.
 *
 * Czysta logika (bez sieci): reviveTargetFromSignals + reviveLeadOnReengage z mockiem
 * klienta supabase. Zabezpiecza regułę: wskrzeszamy TYLKO z terminala lost/abandoned,
 * do etapu liczonego z sygnałów (FLOOR 'new'); opłacony-abandoned wraca do negotiation.
 */

import { describe, it, expect } from 'vitest'
import {
  reviveTargetFromSignals,
  reviveLeadOnReengage,
} from '../../supabase/functions/_shared/lead-stage.ts'

describe('reviveTargetFromSignals — etap z sygnałów (FLOOR new)', () => {
  it('full_paid_at → won (najwyższy priorytet)', () => {
    expect(reviveTargetFromSignals({ full_paid_at: 'x', paid_at: 'x', verdict: 'zielony', panel_visits: 9 })).toBe('won')
  })
  it('paid_at → negotiation (mimo zielonego/wizyt)', () => {
    expect(reviveTargetFromSignals({ paid_at: 'x', verdict: 'zielony', panel_visits: 9 })).toBe('negotiation')
  })
  it('zielony + panel_visits>=2 → proposal', () => {
    expect(reviveTargetFromSignals({ verdict: 'zielony', panel_visits: 2 })).toBe('proposal')
  })
  it('zielony + panel_visits=1 → qualified (granica)', () => {
    expect(reviveTargetFromSignals({ verdict: 'zielony', panel_visits: 1 })).toBe('qualified')
  })
  it('zielony bez wizyt → qualified', () => {
    expect(reviveTargetFromSignals({ verdict: 'zielony' })).toBe('qualified')
  })
  it('tylko seen_landing_at → contacted', () => {
    expect(reviveTargetFromSignals({ seen_landing_at: 'x' })).toBe('contacted')
  })
  it('brak sygnałów → new (FLOOR — lead przeszedł bramkę)', () => {
    expect(reviveTargetFromSignals({})).toBe('new')
  })
})

describe('reviveTargetFromSignals — lejek /aplikacja (granularny, wybór Tomka 2026-07-01)', () => {
  it('zielony werdykt → proposal (Zakwalifikowany) OD RAZU, bez wymogu wizyt', () => {
    expect(reviveTargetFromSignals({ verdict: 'zielony' }, '/aplikacja')).toBe('proposal')
  })
  it('zielony + 1 wizyta → proposal (bez progu wizyt jak w /sklep)', () => {
    expect(reviveTargetFromSignals({ verdict: 'zielony', panel_visits: 1 }, '/aplikacja')).toBe('proposal')
  })
  it('podgląd projektu bez zielonego → qualified (Oferta)', () => {
    expect(reviveTargetFromSignals({ preview_brief: { nazwa: 'X' } }, '/aplikacja')).toBe('qualified')
  })
  it('werdykt żółty → contacted (Skontaktowany)', () => {
    expect(reviveTargetFromSignals({ verdict: 'zolty' }, '/aplikacja')).toBe('contacted')
  })
  it('werdykt czerwony → contacted (Skontaktowany)', () => {
    expect(reviveTargetFromSignals({ verdict: 'czerwony' }, '/aplikacja')).toBe('contacted')
  })
  it('płatność ma pierwszeństwo nad werdyktem (paid → negotiation)', () => {
    expect(reviveTargetFromSignals({ paid_at: 'x', verdict: 'zielony' }, '/aplikacja')).toBe('negotiation')
  })
  it('full_paid → won (najwyższy priorytet)', () => {
    expect(reviveTargetFromSignals({ full_paid_at: 'x', paid_at: 'x', verdict: 'zielony' }, '/aplikacja')).toBe('won')
  })
  it('brak sygnałów → new (FLOOR)', () => {
    expect(reviveTargetFromSignals({}, '/aplikacja')).toBe('new')
  })
})

// Minimalny mock chainable klienta supabase (leads.select/.eq/.maybeSingle + update().eq()).
function makeMock(leadStatus: string | null, activities: unknown[] = []) {
  const updates: Record<string, unknown>[] = []
  const api: Record<string, unknown> = {}
  Object.assign(api, {
    from: () => api,
    select: () => api,
    eq: () => api,
    maybeSingle: () => Promise.resolve({ data: leadStatus === null ? null : { status: leadStatus, activities } }),
    update: (payload: Record<string, unknown>) => {
      updates.push(payload)
      return { eq: () => Promise.resolve({ error: null }) }
    },
  })
  return { api, updates }
}

describe('reviveLeadOnReengage — wskrzeszanie tylko z terminala', () => {
  it('abandoned + zielony/3 wizyty → revived do proposal', async () => {
    const { api, updates } = makeMock('abandoned')
    const r = await reviveLeadOnReengage(api, 'lead-1', { verdict: 'zielony', panel_visits: 3 }, '/aplikacja')
    expect(r.revived).toBe(true)
    expect(r.from).toBe('abandoned')
    expect(r.to).toBe('proposal')
    expect(updates.some((u) => u.status === 'proposal')).toBe(true)
  })

  it('opłacony-abandoned wraca do negotiation, NIE new', async () => {
    const { api } = makeMock('abandoned')
    const r = await reviveLeadOnReengage(api, 'lead-2', { paid_at: 'x' }, '/aplikacja')
    expect(r.revived).toBe(true)
    expect(r.to).toBe('negotiation')
  })

  it('lost bez sygnałów → revived do new (FLOOR)', async () => {
    const { api } = makeMock('lost')
    const r = await reviveLeadOnReengage(api, 'lead-3', {}, '/sklep')
    expect(r.revived).toBe(true)
    expect(r.to).toBe('new')
  })

  it('aktywny etap (qualified) → NIE rusza, brak update', async () => {
    const { api, updates } = makeMock('qualified')
    const r = await reviveLeadOnReengage(api, 'lead-4', { verdict: 'zielony', panel_visits: 9 }, '/aplikacja')
    expect(r.revived).toBe(false)
    expect(updates.length).toBe(0)
  })

  it('won → NIE rusza (terminal pozytywny)', async () => {
    const { api, updates } = makeMock('won')
    const r = await reviveLeadOnReengage(api, 'lead-5', { full_paid_at: 'x' }, '/aplikacja')
    expect(r.revived).toBe(false)
    expect(updates.length).toBe(0)
  })

  it('brak leadId → no-op', async () => {
    const { api } = makeMock('abandoned')
    const r = await reviveLeadOnReengage(api, null, { verdict: 'zielony' }, '/aplikacja')
    expect(r.revived).toBe(false)
  })
})
