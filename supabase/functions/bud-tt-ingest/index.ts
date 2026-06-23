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
  const prods = Array.isArray(body.products) ? body.products : []
  if (!prods.length) return new Response(JSON.stringify({ error: 'brak_products' }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } })

  const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  const rows = prods.map((p: any) => ({
    key: norm(p.pl || p.pl_name || '') || (p.tiktok_url || '').slice(-24),
    pl_name: p.pl || p.pl_name || '',
    category: p.category || 'Inne',
    query: p.q || p.query || null,
    tiktok_url: p.tiktok_url || (p.tiktok_urls?.[0]) || null,
    cover: p.cover || null,
    videos: p.videos || 0, max_plays: p.max_plays || 0, total_plays: p.total_plays || 0,
    comments: p.comments || 0, heat: p.heat || 0, newest_days: p.newest_days ?? null,
    tags: p.tags || [],
    ali_candidates: p.ali_candidates || [],
    ali_search_url: p.ali_search_url || null,
  })).filter((r: any) => r.key && r.pl_name)

  const { error, count } = await supabase.from('bud_tt_products').upsert(rows, { onConflict: 'key', count: 'exact' })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, 'content-type': 'application/json' } })
  return new Response(JSON.stringify({ ok: true, upserted: count ?? rows.length }), { headers: { ...cors, 'content-type': 'application/json' } })
})
