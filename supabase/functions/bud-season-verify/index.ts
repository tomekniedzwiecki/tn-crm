// bud-season-verify — DRUGA OPINIA sezonowości (SSOT: docs/zbuduje/SEZONOWOSC.md, warstwa 2).
// Dla wierszy SEZONOWYCH bez weryfikacji (season_verified=false) zadaje modelowi pytanie ZAMKNIĘTE
// (POTWIERDZAM <kod> / ODRZUCAM) wg kryterium POPYTU. Potwierdzenie → source='llm2', verified=true
// (z ewentualną zmianą kodu w ramach enuma, okno z SEASONS). Odrzucenie → all_year, source='llm2',
// verified=true. NIE dotyka rule/manual/data (te są już verified=true → poza zakresem zapytania).
//
// POST { keys?: string[], limit?: 30 }  → { checked, confirmed, demoted, changed }
// Admin-gated (team_members JWT | x-tools-secret). Deploy: --no-verify-jwt.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'
import { openaiFetchRetry } from '../_shared/openai-fetch.ts'
import { codeFromLabel, normSeasonCode, SEASONS, SEASONAL_CODES, seasonFields } from '../_shared/seasons.ts'

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const MODEL = Deno.env.get('BUD_PRODUCTS_MODEL') || 'gpt-5.1'
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-tools-secret', 'access-control-allow-methods': 'POST, OPTIONS' }
const J = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'content-type': 'application/json' } })

const SEASON_ENUM_HINT = SEASONAL_CODES.map((c) => `"${c}" (${SEASONS[c].label})`).join(', ')

// Pojedyncze zamknięte pytanie do modelu. Zwraca { decyzja:'POTWIERDZAM'|'ODRZUCAM', kod }.
// deno-lint-ignore no-explicit-any
async function askVerify(row: any): Promise<{ decyzja: string; kod: string | null; usage: any } | null> {
  const curCode = codeFromLabel(row.season_label) || 'all_year'
  const prompt = `Weryfikujesz oznaczenie SEZONOWOŚCI produktu ze sklepu jednoproduktowego (rynek PL).\n` +
    `Produkt: "${row.pl_name}" (kategoria: ${row.category || 'brak'}).\n` +
    `Aktualne oznaczenie: sezon="${row.season_label}" (kod ${curCode}).\n\n` +
    `JEDYNE KRYTERIUM = POPYT (nie motyw wizualny ani słowo w nazwie):\n` +
    `"Czy przeciętny Polak kupi ten produkt poza sezonem tak samo chętnie jak w szczycie? ` +
    `Jeśli poza oknem popyt praktycznie ZNIKA — sezonowy. Jeśli tylko spada — całoroczny (all_year)."\n` +
    `Wątpliwe → ODRZUCAM (fałszywy sezon ukrywa dobry produkt — gorszy błąd). Dwusezonowe → ODRZUCAM.\n\n` +
    `Odpowiedz JSON {"decyzja":"POTWIERDZAM|ODRZUCAM","kod":"<kod sezonu>"}:\n` +
    `- POTWIERDZAM gdy popyt naprawdę sezonowy; podaj kod z: ${SEASON_ENUM_HINT} (możesz zmienić na trafniejszy kod sezonowy).\n` +
    `- ODRZUCAM gdy w rzeczywistości całoroczny; kod="all_year".`
  try {
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { authorization: `Bearer ${OPENAI_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, reasoning_effort: 'medium', response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    }, 'season-verify')
    if (!res.ok) { try { await res.body?.cancel() } catch { /* */ } return null }
    const j = await res.json()
    const o = JSON.parse(j.choices[0].message.content)
    return { decyzja: String(o?.decyzja || '').toUpperCase(), kod: normSeasonCode(o?.kod), usage: j?.usage || null }
  } catch { return null }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return J({ error: 'wymagane_logowanie_admin' }, 403)

  const body = await req.json().catch(() => ({}))
  const limit = Math.min(Math.max(Number(body.limit) || 30, 1), 100)
  const keys: string[] = Array.isArray(body.keys) ? body.keys.filter((k: unknown) => typeof k === 'string' && k.trim()) : []

  // KANDYDACI: seasonal + niezweryfikowane. Opcjonalnie zawężone do przekazanych kluczy.
  let q = supabase.from('bud_tt_products')
    .select('key,pl_name,category,season_label,sell_from,sell_to,season_source,season_verified')
    .eq('season_type', 'seasonal').eq('season_verified', false)
  if (keys.length) q = q.in('key', keys.slice(0, 500))
  const { data: rows, error } = await q.limit(limit)
  if (error) return J({ error: error.message }, 500)
  if (!rows?.length) return J({ checked: 0, confirmed: 0, demoted: 0, changed: 0 })

  let checked = 0, confirmed = 0, demoted = 0, changed = 0
  let ui = 0, uc = 0, uo = 0, ucalls = 0
  for (const row of rows as any[]) {
    const r = await askVerify(row)
    if (!r) continue // błąd modelu — zostaw wiersz niezweryfikowany (spróbujemy następnym razem)
    checked++
    if (r.usage) { ui += r.usage.prompt_tokens || 0; uc += r.usage.prompt_tokens_details?.cached_tokens || 0; uo += r.usage.completion_tokens || 0; ucalls++ }
    const curCode = codeFromLabel(row.season_label) || 'all_year'
    let code: string
    if (r.decyzja === 'POTWIERDZAM' && r.kod && r.kod !== 'all_year') { code = r.kod; confirmed++; if (r.kod !== curCode) changed++ }
    else { code = 'all_year'; demoted++ } // ODRZUCAM lub brak/niejednoznaczny kod → degradacja do all_year
    const patch = { ...seasonFields(code), season_source: 'llm2', season_verified: true }
    const { error: ue } = await supabase.from('bud_tt_products').update(patch).eq('key', row.key)
    if (ue) console.warn('[bud-season-verify] update', row.key, ue.message)
  }

  // Koszt OpenAI → bud_usage (kind='season_verify'; session_id=null = infrastruktura).
  if (ucalls) {
    const P: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
    const p = P[MODEL] || P['gpt-5.1']
    const cost = (Math.max(0, ui - uc) * p.i + uc * p.c + uo * p.o) / 1_000_000
    try { await supabase.from('bud_usage').insert({ session_id: null, kind: 'season_verify', model: MODEL, input_tokens: ui, cached_tokens: uc, output_tokens: uo, cost_usd: cost, meta: { from: 'bud-season-verify', calls: ucalls } }) } catch (e) { console.error('[bud-season-verify] usage', e) }
  }

  return J({ checked, confirmed, demoted, changed })
})
