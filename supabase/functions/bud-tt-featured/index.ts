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

  // ── TRYB DETAL: ?id=<uuid> → pełne dane jednego produktu (TikTok + AliExpress snapshot) ──
  const detailId = (url.searchParams.get('id') || '').trim()
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(detailId)) {
    const { data: row } = await supabase.from('bud_tt_products')
      .select('id,pl_name,category,cover,tiktok_url,saves,shares,eng_rate,max_plays,total_plays,comments,videos,is_ad,author,author_followers,heat,newest_days,tags,ali_candidates,chosen_link,ali_snapshot')
      .eq('id', detailId).maybeSingle()
    if (!row) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { ...cors, 'content-type': 'application/json' } })
    // deno-lint-ignore no-explicit-any
    const r: any = row
    const cands = r.ali_candidates || []
    // deno-lint-ignore no-explicit-any
    const chosen = r.chosen_link ? (cands.find((c: any) => c.link === r.chosen_link) || { link: r.chosen_link }) : (cands[0] || null)
    // deno-lint-ignore no-explicit-any
    const snap: any = r.ali_snapshot || null
    // deno-lint-ignore no-explicit-any
    const ali = snap ? {
      title: snap.title || '', main_image: snap.main_image || '',
      images: Array.isArray(snap.images) ? snap.images.slice(0, 12) : [],
      review_stats: snap.review_stats || null,
      variants: Array.isArray(snap.variants) ? snap.variants.slice(0, 40) : [],
      specs: snap.specs || null,
      description: typeof snap.description === 'string' ? snap.description.slice(0, 4000) : '',
      reviews: Array.isArray(snap.reviews) ? snap.reviews.slice(0, 20).map((rv: any) => ({ name: rv.name || '', stars: rv.stars || 5, text: rv.text_pl || rv.text || '', images: Array.isArray(rv.images) ? rv.images.slice(0, 6) : [], date: rv.date || '' })) : [],
    } : null
    const product = {
      id: r.id, name: r.pl_name, category: r.category, cover: r.cover,
      tiktok_url: r.tiktok_url, video_id: (r.tiktok_url || '').match(/\/video\/(\d+)/)?.[1] || '',
      saves: r.saves || 0, shares: r.shares || 0, eng_rate: r.eng_rate || 0,
      plays: r.max_plays || 0, total_plays: r.total_plays || 0, comments: r.comments || 0,
      videos: r.videos || 0, is_ad: !!r.is_ad, author: r.author || '', followers: r.author_followers || 0,
      heat: r.heat || 0, newest_days: r.newest_days, tags: Array.isArray(r.tags) ? r.tags : [],
      price: chosen?.price || (cands[0]?.price) || '', product_link: chosen?.link || '',
      image: chosen?.img || (cands[0]?.img) || '', ali,
    }
    return new Response(JSON.stringify({ product }), { headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'public, max-age=120' } })
  }

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
      image: chosen?.img || (cands[0]?.img) || '',   // miniatura produktu z AliExpress (karta wybranego w sidebarze)
    }
  }

  const all = (data || []).filter((p: any) => p.cover && p.tiktok_url)

  // ── RÓŻNICOWANIE: czysty seeded shuffle (równe szanse dla całej puli) ───────
  // FIX 2026-07-10 (feedback Tomka: „skoro produkt jest approved, to jest dobry —
  // pokazuj tak samo jak inne"): nawet lekka premia W=0.35 za heat dawała top-heat
  // produktom ~21% sesji na stronie 0 vs ~3% przy równym losowaniu (symulacja na
  // realnych heat), a 62/194 produktów miało mniej niż połowę uczciwej ekspozycji.
  // Wybory leadów odzwierciedlały to 1:1 (dashcam heat#1 = najczęściej wybierany).
  // Selekcja jakości dzieje się w /trendy (approve) — feed jej nie dubluje.
  // Seed stały w sesji (front podaje jeden) → paginacja „Pokaż więcej" spójna,
  // różne sesje dostają różny zestaw. Brak seed = stare heat-desc (fallback).
  const seedStr = (url.searchParams.get('seed') || '').slice(0, 40)
  if (seedStr) {
    const rngFor = (id: string): number => {
      let h = 2166136261
      const s = seedStr + ':' + String(id)
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
      return ((h >>> 0) % 100000) / 100000 // [0,1)
    }
    all.sort((a: any, b: any) => rngFor(b.id) - rngFor(a.id))
  }

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
