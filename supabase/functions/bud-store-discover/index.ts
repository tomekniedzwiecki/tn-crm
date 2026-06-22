// Biblioteka sklepów (AWE) — DISCOVERY: znajdź dropshipowe sklepy-wzorce przez FB Ad Library
// (ScrapeCreators), wzbogać realnym asortymentem z /company/ads, upsert do bud_stores.
// Admin-gated (team_members). Upsert NIE nadpisuje status/przypisania klienta.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'

const SC_KEY = Deno.env.get('BUD_SCRAPECREATORS_API_KEY') || ''
const SC_BASE = 'https://api.scrapecreators.com'
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' }

const DEFAULT_TERMS = ['car accessories', 'kitchen gadgets', 'pet supplies', 'home organization', 'phone accessories', 'led lights', 'baby essentials', 'garden tools', 'cleaning gadgets', 'fitness gear']
const BLOCK = ['facebook.', 'fb.me', 'fb.com', 'instagram.', 'amazon.', 'amzn', 'etsy.', 'ebay.', 'walmart.', 'target.com', 'aliexpress.', 'temu.', 'tiktok.', 'youtube.', 'youtu.be', 'linktr.', 'bit.ly', 'shopee.', 'wayfair.', 'google.', 'apple.', 'microsoft.', 'samsung.', 'wish.com', 'pinterest.', 'messenger.', 'whatsapp.', 'kickstarter.', 'gofundme.', 'paypal.', 'l.facebook', 'lnk.to', 'onelink.', 'app.link', 'costco.', 'bestbuy.', 'homedepot.', 'lowes.', 'macys.', 'kohls.', 'allegro.', 'olx.', 'ceneo.']

const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase() } catch { return '' } }
const normLink = (u: string) => { try { const x = new URL(u); return x.origin + x.pathname } catch { return u } }  // ucinamy ?query (UTM) — stabilny, dedupowalny source_link
const blocked = (h: string) => !h || BLOCK.some(b => h.includes(b))
const shopifySlug = (u: string) => { try { const m = new URL(u).pathname.match(/\/products\/([^/?#]+)/i); return m ? m[1].toLowerCase() : '' } catch { return '' } }
// strona PRODUKTU (nie homepage/kolekcja/blog/logo) — czyści szum asortymentu
const productish = (u: string) => {
  try {
    const p = new URL(u).pathname.toLowerCase()
    if (/\/products\//.test(p)) return true
    const segs = p.split('/').filter(Boolean)
    if (!segs.length) return false
    return !['collections', 'pages', 'blogs', 'blog', 'account', 'cart', 'search', 'about', 'contact', 'policies', 'apps'].includes(segs[0])
  } catch { return false }
}

function adFields(ad: any) {
  const snap = ad.snapshot || ad
  const card = (snap.cards && snap.cards[0]) || {}
  return {
    pid: String(ad.page_id || snap.page_id || ad.pageId || ''),
    name: ad.page_name || snap.page_name || snap.current_page_name || '',
    likes: Number(snap.page_like_count || ad.page_like_count || 0),
    link: snap.link_url || ad.link_url || card.link_url || '',
    title: (snap.title || card.title || '').trim(),
    img: (snap.images && (snap.images[0]?.original_image_url || snap.images[0]?.resized_image_url)) || (snap.videos && snap.videos[0]?.video_preview_image_url) || card.original_image_url || card.resized_image_url || card.video_preview_image_url || '',
    hasVideo: !!(snap.videos && snap.videos.length) || !!(snap.cards && snap.cards.some((c: any) => c.video_hd_url || c.video_sd_url)),
    cats: snap.page_categories || ad.page_categories || [],
    startDate: Number(ad.start_date || 0),                 // unix — świeżość trendu
    display: (snap.display_format || '').toUpperCase(),    // VIDEO/IMAGE/DCO/DPA
    cta: (snap.cta_type || '').toUpperCase(),              // SHOP_NOW vs VIEW_INSTAGRAM_PROFILE itd.
    isActive: ad.is_active !== false,
    collation: Number(ad.collation_count || 1),            // intensywność testów (zduplikowane kreacje)
  }
}
async function scGet(url: string): Promise<any[]> {
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 22000)
    const r = await fetch(url, { headers: { 'x-api-key': SC_KEY }, signal: ctrl.signal }); clearTimeout(t)
    if (!r.ok) return []
    const j = await r.json()
    return j.searchResults || j.results || j.ads || j.data || []
  } catch { return [] }
}
const scSearch = (q: string, market: string) => scGet(`${SC_BASE}/v1/facebook/adLibrary/search/ads?query=${encodeURIComponent(q)}&country=${market}&status=active&media_type=all`)
const scCompany = (pid: string, market: string) => scGet(`${SC_BASE}/v1/facebook/adLibrary/company/ads?pageId=${encodeURIComponent(pid)}&country=${market}&status=active`)

// Bramki anty-marka/anty-nie-ecom (radar = świeże dropshippery, nie ustalone marki/sieci/twórcy)
const BAD_CTA = new Set(['VIEW_INSTAGRAM_PROFILE', 'LIKE_PAGE', 'CALL_NOW', 'MESSAGE_PAGE', 'WHATSAPP_MESSAGE', 'CONTACT_US', 'GET_DIRECTIONS', 'BOOK_TRAVEL', 'VIEW_PROFILE', 'FOLLOW_PAGE', 'SEND_MESSAGE', 'APPLY_NOW', 'GET_QUOTE'])
const BAD_CAT = ['public figure', 'digital creator', 'personal blog', 'blogger', 'musician', 'band', 'artist', 'athlete', 'politician', 'media', 'news', 'tv ', 'community', 'government', 'non-profit', 'nonprofit', 'church', 'school', 'university', 'restaurant', 'hotel', 'real estate', 'financial', 'insurance', 'app page', 'video game', 'just for fun']

async function pool<T, R>(items: T[], n: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length) as any; let idx = 0
  async function w() { while (idx < items.length) { const i = idx++; out[i] = await fn(items[i], i) } }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, w)); return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return new Response(JSON.stringify({ error: 'wymagane_logowanie_admin' }), { status: 403, headers: { ...cors, 'content-type': 'application/json' } })

  const body = await req.json().catch(() => ({}))
  const terms: string[] = Array.isArray(body.terms) && body.terms.length ? body.terms : DEFAULT_TERMS
  const market: string = (body.market || 'US').toUpperCase()
  const minLikes = body.minLikes ?? 300
  const maxLikes = body.maxLikes ?? 150000   // sufit „perełki" — wyżej to ustalone marki
  const enrichTop = body.enrichTop ?? 45
  const minAssort = body.minAssort ?? 6
  const assortKeep = body.assortKeep ?? 40   // ile produktów asortymentu zapisać
  const maxAgeDays = body.maxAgeDays ?? 150  // sklep musi mieć aktywną reklamę z ostatnich N dni (żywy)
  const NOW = Math.floor(Date.now() / 1000)
  const FRESH = 45 * 86400                    // okno „świeżego trendu"

  // A) szeroka zbiórka
  const pages = new Map<string, any>()
  const batches = await pool(terms, 6, (q) => scSearch(q, market))
  let totalAds = 0
  for (const ads of batches) for (const ad of (ads || [])) {
    const f = adFields(ad); if (!f.pid) continue; totalAds++
    const host = hostOf(f.link)
    let p = pages.get(f.pid)
    if (!p) { p = { pid: f.pid, name: f.name, likes: f.likes, hosts: new Map(), slugs: new Set(), videos: 0, nAds: 0, cats: f.cats }; pages.set(f.pid, p) }
    p.nAds++
    if (f.likes > p.likes) p.likes = f.likes
    if (f.name && !p.name) p.name = f.name
    if (host && !blocked(host)) p.hosts.set(host, (p.hosts.get(host) || 0) + 1)
    if (f.hasVideo) p.videos++
    if (shopifySlug(f.link)) p.slugs.add(shopifySlug(f.link))
    if ((!p.cats || !p.cats.length) && f.cats?.length) p.cats = f.cats
  }

  const prelim: any[] = []
  for (const p of pages.values()) {
    const own = [...p.hosts.entries()].filter(([h]: any) => !blocked(h)).sort((a: any, b: any) => b[1] - a[1])
    if (!own.length || p.likes < minLikes || p.likes > maxLikes) continue
    const score = p.slugs.size * 4 + p.videos * 1.5 + p.nAds + (p.likes > 1000 && p.likes < 150000 ? 3 : 0)
    prelim.push({ pid: p.pid, name: p.name, domain: own[0][0], likes: p.likes, cats: (p.cats || []).slice(0, 3), score })
  }
  prelim.sort((a, b) => b.score - a.score)

  // B) wzbogać asortymentem + sygnałami świeżości z /company/ads (tylko aktywne)
  const enriched = await pool(prelim.slice(0, enrichTop), 8, async (c) => {
    const ads = await scCompany(c.pid, market)
    const prods = new Map<string, any>()
    let own = 0, total = 0, video = 0, fresh = 0, active = 0, testVol = 0, newest = 0
    const ctaCount: Record<string, number> = {}
    let cats = c.cats
    for (const ad of (ads || [])) {
      const f = adFields(ad); total++
      if (!blocked(hostOf(f.link))) own++
      if (f.isActive) active++
      if (f.startDate) { if (f.startDate > newest) newest = f.startDate; if (NOW - f.startDate <= FRESH) fresh++ }
      if (f.display === 'VIDEO') video++
      testVol += f.collation
      if (f.cta) ctaCount[f.cta] = (ctaCount[f.cta] || 0) + 1
      if ((!cats || !cats.length) && f.cats?.length) cats = f.cats
      const link = normLink(f.link)
      if (link && productish(link) && !prods.has(link)) prods.set(link, { title: f.title || link, link, img: f.img })
    }
    const list = [...prods.values()].filter(p => p.title && p.link)
    const ownShare = total ? Math.round(100 * own / total) : 0
    const videoRatio = total ? Math.round(100 * video / total) : 0
    const topCta = Object.entries(ctaCount).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
    const catStr = (cats || []).join(' ').toLowerCase()
    // gem-score: izoluje ŚWIEŻEGO DROPSHIPPERA (nie ustaloną markę z dużym budżetem).
    // Wideo UGC = najsilniejszy sygnał dropshipu; lajki w paśmie (KARA za >80k = marka);
    // świeżość liczona jako OBECNOŚĆ (cap — inaczej wygrywa budżet, nie trend); głębia asortymentu.
    let likeScore = 0
    if (c.likes >= 1000 && c.likes <= 50000) likeScore = 10
    else if (c.likes > 50000 && c.likes <= 80000) likeScore = 4
    else if (c.likes > 80000) likeScore = -6
    else if (c.likes >= minLikes && c.likes < 1000) likeScore = 5
    const recency = newest ? NOW - newest : 9e9
    const recencyBonus = recency <= 14 * 86400 ? 4 : recency <= 30 * 86400 ? 2 : recency <= 60 * 86400 ? 1 : 0
    const videoBonus = (videoRatio / 100) * 25
    const freshBonus = Math.min(fresh, 8) * 2
    const assortBonus = Math.min(list.length, 25) * 0.8
    const gem = +(videoBonus + freshBonus + assortBonus + likeScore + recencyBonus).toFixed(2)
    return { ...c, cats: (cats || []).slice(0, 3), assort: list.length, ownShare, videoRatio, fresh, active, newest, topCta, badCat: BAD_CAT.some(b => catStr.includes(b)), badCta: BAD_CTA.has(topCta), gem, testVol, assortment: list.slice(0, assortKeep) }
  })

  // C) bramki perełki + ranking po gem-score
  const good = enriched.filter((s: any) =>
    s.assort >= minAssort && s.ownShare >= 50 && s.assortment.length >= 2 &&
    !s.badCat && !s.badCta &&
    s.likes <= maxLikes &&
    (s.newest === 0 || NOW - s.newest <= maxAgeDays * 86400)
  ).sort((a: any, b: any) => b.gem - a.gem)

  let upserted = 0
  if (good.length) {
    const rows = good.map((s: any) => ({
      page_id: s.pid, name: s.name, domain: s.domain, market, likes: s.likes, categories: s.cats,
      assort_count: s.assort, assortment: s.assortment,
      gem_score: s.gem, newest_ad_at: s.newest ? new Date(s.newest * 1000).toISOString() : null,
      active_ads: s.active, video_ratio: s.videoRatio, fresh_ads: s.fresh,
      signals: { ownShare: s.ownShare, topCta: s.topCta, testVol: s.testVol, cats: s.cats },
    }))
    const { error, count } = await supabase.from('bud_stores').upsert(rows, { onConflict: 'page_id', count: 'exact' })
    if (error) return new Response(JSON.stringify({ error: error.message, stage: 'upsert' }), { status: 500, headers: { ...cors, 'content-type': 'application/json' } })
    upserted = count ?? rows.length
  }

  const days = (ts: number) => ts ? Math.round((NOW - ts) / 86400) : null
  return new Response(JSON.stringify({
    totalAds, pagesSeen: pages.size, prelim: prelim.length, enriched: enriched.length, found: good.length, upserted,
    stores: good.map((s: any) => ({ name: s.name, domain: s.domain, likes: s.likes, assort: s.assort, gem: s.gem, fresh: s.fresh, video: s.videoRatio + '%', newestDays: days(s.newest), cta: s.topCta })),
  }), { headers: { ...cors, 'content-type': 'application/json' } })
})
