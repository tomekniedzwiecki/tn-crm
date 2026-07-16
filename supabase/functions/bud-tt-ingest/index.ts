// Zapis wyników radaru TikTok→AliExpress do bud_tt_products. Admin-gated (team_members | x-tools-secret).
// Upsert po `key` — NIE nadpisuje pól weryfikacji pracownika (status/chosen_link/reviewed_*).
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return new Response(JSON.stringify({ error: 'wymagane_logowanie_admin' }), { status: 403, headers: { ...cors, 'content-type': 'application/json' } })

  const body = await req.json().catch(() => ({}))
  // purge: usuń stare nieprzejrzane wiersze (np. sprzed filtra 60 dni); zachowuje approved/rejected
  if (body.purge) { await supabase.from('bud_tt_products').delete().eq('status', 'pending') }
  const prods = Array.isArray(body.products) ? body.products : []
  if (!prods.length) return new Response(JSON.stringify({ ok: true, purged: !!body.purge }), { headers: { ...cors, 'content-type': 'application/json' } })

  const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  // SEZONOWOŚĆ: walidacja pól przekazanych z bud-tt-trends (okno 'MM-DD'; złe/niepewne → all_year).
  const MMDD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
  const season = (p: any) => {
    const rawLabel = (typeof p?.season_label === 'string' && p.season_label.trim()) ? p.season_label.trim().slice(0, 40) : ''
    if (p?.season_type !== 'seasonal') return { season_type: 'all_year', season_label: rawLabel || 'całoroczny', sell_from: null, sell_to: null }
    const from = String(p?.sell_from || '').trim(); const to = String(p?.sell_to || '').trim()
    if (!MMDD.test(from) || !MMDD.test(to)) return { season_type: 'all_year', season_label: 'całoroczny', sell_from: null, sell_to: null }
    return { season_type: 'seasonal', season_label: rawLabel || 'sezonowy', sell_from: from, sell_to: to }
  }
  const rows = prods.map((p: any) => ({
    key: norm(p.pl || p.pl_name || '') || (p.tiktok_url || '').slice(-24),
    pl_name: p.pl || p.pl_name || '',
    category: p.category || 'Inne',
    ...season(p),
    query: p.q || p.query || null,
    tiktok_url: p.tiktok_url || (p.tiktok_urls?.[0]) || null,
    cover: p.cover || null,
    videos: p.videos || 0, max_plays: p.max_plays || 0, total_plays: p.total_plays || 0,
    comments: p.comments || 0, saves: p.saves || 0, shares: p.shares || 0, eng_rate: p.eng_rate || 0,
    is_ad: !!p.is_ad, author: p.author || null, author_followers: p.author_followers || 0,
    heat: p.heat || 0, newest_days: p.newest_days ?? null,
    tags: p.tags || [],
    ali_candidates: p.ali_candidates || [],
    ali_search_url: p.ali_search_url || null,
    shop_url: p.shop_url || null,
  })).filter((r: any) => r.key && r.pl_name)

  // OCHRONA TRWAŁYCH MINIATUR: cover z TikTok CDN wygasa, więc po zatwierdzeniu jest
  // przenoszony do storage (bud-tt-rehost). Re-ingest tego samego produktu NIE może
  // nadpisać trwałego URL-a storage świeżym-wygasającym z TikToka. Wiersze, które już
  // mają cover w storage, upsertujemy BEZ kolumny cover (zachowują storage).
  const keys = rows.map((r: any) => r.key)
  const protectedKeys = new Set<string>()
  for (let i = 0; i < keys.length; i += 300) {
    const { data: ex } = await supabase.from('bud_tt_products').select('key,cover').in('key', keys.slice(i, i + 300))
    for (const e of (ex || [])) { if (typeof e.cover === 'string' && e.cover.includes('/storage/v1/')) protectedKeys.add(e.key) }
  }
  const rowsNormal = rows.filter((r: any) => !protectedKeys.has(r.key))
  const rowsProtected = rows.filter((r: any) => protectedKeys.has(r.key)).map((r: any) => { const { cover, ...rest } = r; return rest })
  let upserted = 0
  if (rowsNormal.length) {
    const { error, count } = await supabase.from('bud_tt_products').upsert(rowsNormal, { onConflict: 'key', count: 'exact' })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, 'content-type': 'application/json' } })
    upserted += count ?? rowsNormal.length
  }
  if (rowsProtected.length) {
    const { error, count } = await supabase.from('bud_tt_products').upsert(rowsProtected, { onConflict: 'key', count: 'exact' })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, 'content-type': 'application/json' } })
    upserted += count ?? rowsProtected.length
  }
  return new Response(JSON.stringify({ ok: true, upserted, cover_protected: rowsProtected.length }), { headers: { ...cors, 'content-type': 'application/json' } })
})
