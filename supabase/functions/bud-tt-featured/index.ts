// Publiczny feed wyselekcjonowanych viralowych produktów dla lejka /sklep (ETAP 1).
// Tylko zatwierdzone w /trendy. Obsługuje: filtr kategorii (?cat=), paginację (?page=),
// rozmiar strony (?n=). Zawsze zwraca listę dostępnych kategorii (z liczbą) — front
// renderuje z niej chipy wyboru kategorii. Tylko bezpieczne pola.
import { createClient } from 'jsr:@supabase/supabase-js@2'
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const url = new URL(req.url)
  const n = Math.min(Math.max(parseInt(url.searchParams.get('n') || '6'), 1), 12)
  const page = Math.max(parseInt(url.searchParams.get('page') || '0'), 0)
  const cat = (url.searchParams.get('cat') || '').trim()

  // Curowana pula jest mała — pobieramy CAŁOŚĆ zatwierdzonych (cap 500), liczymy
  // kategorie z pełnego zbioru, dopiero potem filtrujemy/paginujemy w pamięci.
  const { data, error } = await supabase.from('bud_tt_products')
    .select('id,pl_name,category,cover,tiktok_url,saves,eng_rate,max_plays,comments,videos,is_ad,author,author_followers,heat,newest_days,ali_candidates,chosen_link,status')
    .eq('status', 'approved')
    .order('heat', { ascending: false })
    .limit(500)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, 'content-type': 'application/json' } })

  const vidOf = (u: string) => (u || '').match(/\/video\/(\d+)/)?.[1] || ''
  const map = (p: any) => {
    const cands = p.ali_candidates || []
    const chosen = p.chosen_link ? (cands.find((c: any) => c.link === p.chosen_link) || { link: p.chosen_link }) : (cands[0] || null)
    return {
      id: p.id, name: p.pl_name, category: p.category,
      cover: p.cover, tiktok_url: p.tiktok_url, video_id: vidOf(p.tiktok_url),
      saves: p.saves || 0, eng_rate: p.eng_rate || 0, plays: p.max_plays || 0, comments: p.comments || 0,
      videos: p.videos || 0, is_ad: !!p.is_ad, author: p.author || '', followers: p.author_followers || 0,
      newest_days: p.newest_days,
      price: chosen?.price || (cands[0]?.price) || '', product_link: chosen?.link || '',
    }
  }

  const all = (data || []).filter((p: any) => p.cover && p.tiktok_url)

  // Lista kategorii (tylko te, które mają zatwierdzone produkty) + liczba, malejąco.
  const catMap = new Map<string, number>()
  for (const p of all) { const c = (p.category || 'Inne') as string; catMap.set(c, (catMap.get(c) || 0) + 1) }
  const categories = [...catMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

  // Filtr kategorii + paginacja.
  const filtered = cat ? all.filter((p: any) => (p.category || 'Inne') === cat) : all
  const total = filtered.length
  const start = page * n
  const picked = filtered.slice(start, start + n).map(map)
  const has_more = start + n < total

  return new Response(JSON.stringify({ products: picked, categories, total, page, n, cat, has_more }), {
    headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'public, max-age=120' },
  })
})
