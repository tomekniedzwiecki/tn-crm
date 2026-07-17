// bud-season-calendar — DZIENNY raport granic okien sezonowych (SSOT: docs/zbuduje/SEZONOWOSC.md).
// Dla produktów SEZONOWYCH w obrocie (status approved|pending) liczy dystans do granic okna (dziś UTC):
//   (a) sell_to za ≤14 dni  → lista „konczace" (okno się domyka — potem zwroty)
//   (b) sell_from za ≤14 dni → lista „wracajace" (okno się otwiera — czas odświeżyć sold/stock)
// ZERO akcji destrukcyjnych — funkcja TYLKO RAPORTUJE. Faktyczny refresh sold/stock wykonuje istniejący
// cron tygodniowy bud-tt-shop (rotuje po najstarszych fetched_at). Panel „Sezony" konsumuje liczniki.
//
// POST {} → { konczace:[{key,pl_name,sell_to}], wracajace:[{key,pl_name,sell_from}], hibernacja_n, do_sprawdzenia_n }
// Admin-gated (team_members JWT | x-tools-secret). Deploy: --no-verify-jwt.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'
import { daysUntilMMDD, inWindow } from '../_shared/seasons.ts'

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-tools-secret', 'access-control-allow-methods': 'POST, OPTIONS' }
const J = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'content-type': 'application/json' } })
const WINDOW_DAYS = 14

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return J({ error: 'wymagane_logowanie_admin' }, 403)

  const now = new Date()
  const todayMMDD = now.toISOString().slice(5, 10)

  // Seasonal w obrocie (approved+pending). Paginacja po 1000 (pułapka PostgREST) — pula sezonowa mała,
  // ale trzymamy wzorzec.
  const rows: any[] = []
  for (let off = 0; ; off += 1000) {
    const { data, error } = await supabase.from('bud_tt_products')
      .select('key,pl_name,sell_from,sell_to,season_verified')
      .eq('season_type', 'seasonal').in('status', ['approved', 'pending'])
      .range(off, off + 999)
    if (error) return J({ error: error.message }, 500)
    if (!data?.length) break
    rows.push(...data)
    if (data.length < 1000) break
  }

  const konczace: Array<{ key: string; pl_name: string; sell_to: string }> = []
  const wracajace: Array<{ key: string; pl_name: string; sell_from: string }> = []
  let hibernacja_n = 0, do_sprawdzenia_n = 0

  for (const r of rows) {
    const inW = inWindow(r.sell_from, r.sell_to, todayMMDD)
    if (!inW) hibernacja_n++ // seasonal poza oknem = hibernacja (stan wyliczany)
    if (!r.season_verified) do_sprawdzenia_n++ // chip „Sezon do sprawdzenia"
    // (a) domyka się okno: produkt W oknie, do sell_to ≤14 dni
    if (inW && r.sell_to) { const d = daysUntilMMDD(r.sell_to, now); if (d !== null && d <= WINDOW_DAYS) konczace.push({ key: r.key, pl_name: r.pl_name, sell_to: r.sell_to }) }
    // (b) wraca sezon: produkt POZA oknem, do sell_from ≤14 dni → sygnał do odświeżenia sold/stock
    if (!inW && r.sell_from) { const d = daysUntilMMDD(r.sell_from, now); if (d !== null && d <= WINDOW_DAYS) wracajace.push({ key: r.key, pl_name: r.pl_name, sell_from: r.sell_from }) }
  }

  return J({ konczace, wracajace, hibernacja_n, do_sprawdzenia_n, scanned: rows.length, today: todayMMDD })
})
