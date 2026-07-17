// Zapis wyników radaru TikTok→AliExpress do bud_tt_products. Admin-gated (team_members | x-tools-secret).
// Upsert po `key` — NIE nadpisuje pól weryfikacji pracownika (status/chosen_link/reviewed_*).
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'
import { applySeason, codeFromLabel, normSeasonCode, seasonFields, seasonRule } from '../_shared/seasons.ts'

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
  // SEZONOWOŚĆ (SSOT: docs/zbuduje/SEZONOWOSC.md): GPT dał KOD z enuma; okno narzuca serwer
  // (seasonFields). Reguła twarda (seasonRule na pl_name) wygrywa → source='rule', verified=true;
  // inaczej draft z radaru → source='draft', verified=false. Legacy fallback: kod z labelu.
  // deno-lint-ignore no-explicit-any
  const seasonOf = (p: any) => {
    const plName = p.pl || p.pl_name || ''
    const ruleCode = seasonRule(plName)
    const code = ruleCode || normSeasonCode(p.season_code) ||
      (p.season_type === 'seasonal' ? codeFromLabel(p.season_label) : null) || 'all_year'
    return { ...seasonFields(code), season_source: ruleCode ? 'rule' : 'draft', season_verified: !!ruleCode }
  }
  // deno-lint-ignore no-explicit-any
  const rows = prods.map((p: any) => ({
    key: norm(p.pl || p.pl_name || '') || (p.tiktok_url || '').slice(-24),
    pl_name: p.pl || p.pl_name || '',
    category: p.category || 'Inne',
    ...seasonOf(p),
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
    // deno-lint-ignore no-explicit-any
  })).filter((r: any) => r.key && r.pl_name)

  // Stan istniejących wierszy: cover (ochrona miniatur) + season_source (priorytet źródeł).
  const keys = rows.map((r: any) => r.key)
  const existingMap = new Map<string, { cover?: string; season_source?: string }>()
  for (let i = 0; i < keys.length; i += 300) {
    const { data: ex } = await supabase.from('bud_tt_products').select('key,cover,season_source').in('key', keys.slice(i, i + 300))
    for (const e of (ex || [])) existingMap.set((e as any).key, { cover: (e as any).cover, season_source: (e as any).season_source })
  }

  // Dwie niezależne ochrony przy upsercie istniejących:
  //  (a) COVER: cover z TikTok CDN wygasa; po zatwierdzeniu jest w storage (bud-tt-rehost).
  //      Re-ingest NIE nadpisuje trwałego storage-URL świeżym-wygasającym z TikToka → strip `cover`.
  //  (b) SEZON: priorytet data>manual>rule>llm2>draft (applySeason). Draft z re-skanu NIE depcze
  //      ręcznej/regułowej korekty → strip pól sezonu. Re-kick korekt niemożliwy.
  const SEASON_COLS = ['season_type', 'season_label', 'sell_from', 'sell_to', 'season_source', 'season_verified']
  let coverProtected = 0, seasonProtected = 0
  const prepared = rows.map((r: any) => {
    const ex = existingMap.get(r.key)
    const out: any = { ...r }
    if (ex && typeof ex.cover === 'string' && ex.cover.includes('/storage/v1/')) { delete out.cover; coverProtected++ }
    if (ex && ex.season_source && !applySeason(ex, out.season_source)) { for (const c of SEASON_COLS) delete out[c]; seasonProtected++ }
    return out
  })

  // Upsert w grupach o identycznym zestawie kolumn (mieszany zestaw w jednym INSERT NULL-owałby
  // pominięte kolumny — dlatego grupujemy po sygnaturze kluczy).
  const groups = new Map<string, any[]>()
  for (const o of prepared) {
    const sig = Object.keys(o).sort().join(',')
    const arr = groups.get(sig) || []
    if (!groups.has(sig)) groups.set(sig, arr)
    arr.push(o)
  }
  let upserted = 0
  for (const arr of groups.values()) {
    const { error, count } = await supabase.from('bud_tt_products').upsert(arr, { onConflict: 'key', count: 'exact' })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, 'content-type': 'application/json' } })
    upserted += count ?? arr.length
  }
  return new Response(JSON.stringify({ ok: true, upserted, cover_protected: coverProtected, season_protected: seasonProtected }), { headers: { ...cors, 'content-type': 'application/json' } })
})
