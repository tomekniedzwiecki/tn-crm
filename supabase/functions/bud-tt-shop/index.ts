// bud-tt-shop — dociąga dane z TikTok Shop dla ZATWIERDZONYCH produktów (req Tomka 2026-07-04)
// i liczy product_score. Źródło: ScrapeCreators /v1/tiktok/product (po shop_url = PDP).
// Zwraca: sold_count (realna sprzedaż = najmocniejszy sygnał popytu), cena rynkowa, stan,
// ocena sklepu, liczba opinii, wideo promujące. Zapis do bud_tt_products.tt_shop + product_score.
//
// SCORING (zbalansowany, 0–100): sprzedaż 40 / narzut rynkowy(TT÷Ali) 25 / heat 20 / ocena 10 / świeżość 5.
// Składowe bez danych są pomijane, wagi przeskalowane do obecnych → produkt bez linku Shop
// dostaje wynik CZĘŚCIOWY (z wiralowości + Ali), oznaczony partial=true.
//
// Operacje (admin-gated: team_member JWT | x-tools-secret):
//   {key}                      → jeden produkt (wołane z panelu po zatwierdzeniu)
//   {keys:[...]}               → lista produktów
//   {op:'backfill', limit?}    → wszystkie approved (pull Shop dla tych z shop_url, score dla wszystkich)
// Deploy: --no-verify-jwt.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'

const SC = Deno.env.get('BUD_SCRAPECREATORS_API_KEY') || ''
const RATE = 4   // koszt Ali (PLN-ish) = USD × RATE — spójne z bud-tt-trends
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-tools-secret', 'access-control-allow-methods': 'POST, OPTIONS' }
const W = { sales: 0.40, markup: 0.25, heat: 0.20, rating: 0.10, fresh: 0.05 }

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const num = (x: unknown): number | null => { const n = parseFloat(String(x ?? '')); return Number.isFinite(n) ? n : null }
// sold_count / review_count bywa liczbą albo stringiem "12.4K" / "1.2M"
function count(x: unknown): number | null {
  if (typeof x === 'number' && Number.isFinite(x)) return x
  const s = String(x ?? '').trim().replace(/,/g, '')
  const m = s.match(/^([\d.]+)\s*([kKmM]?)/)
  if (!m) return null
  const v = parseFloat(m[1]); if (!Number.isFinite(v)) return null
  const mul = m[2].toLowerCase() === 'm' ? 1e6 : m[2].toLowerCase() === 'k' ? 1e3 : 1
  return Math.round(v * mul)
}

async function fetchShop(url: string): Promise<any | null> {
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 22000)
    const r = await fetch(`https://api.scrapecreators.com/v1/tiktok/product?url=${encodeURIComponent(url)}&region=US`, { headers: { 'x-api-key': SC }, signal: ctrl.signal })
    clearTimeout(t)
    if (!r.ok) { console.warn('[bud-tt-shop] HTTP', r.status, url.slice(-24)); return null }
    return await r.json().catch(() => null)
  } catch (e) { console.warn('[bud-tt-shop] err', String(e).slice(0, 80)); return null }
}

// Struktura /v1/tiktok/product: product_base / skus / product_detail_review / seller w ROOT
// (NIE pod product_info — dokumentacja myli). Cena to string-zakres "$15.99 - 20.99";
// numeryczna wartość w min_sku_price. Ocena PRODUKTU w product_detail_review.product_rating.
// deno-lint-ignore no-explicit-any
function parseShop(j: any, pdpUrl: string): any | null {
  if (!j || typeof j !== 'object') return null
  const pb = j.product_base || j.product_info?.product_base || {}
  const price = pb.price || {}
  const rev = j.product_detail_review || j.product_info?.product_detail_review || {}
  const title = String(pb.title || '').slice(0, 240)
  const sold = count(pb.sold_count) ?? count(pb.combined_sales_volume)
  // images: tablica obiektów {url_list,[thumb_url_list]} albo (rzadziej) stringów
  const images = (Array.isArray(pb.images) ? pb.images : []).map((im: any) => typeof im === 'string' ? im : (im?.url_list?.[0] || im?.thumb_url_list?.[0] || '')).filter(Boolean).slice(0, 8)
  if (!title && sold == null && !images.length) return null   // pusta/nieznana odpowiedź
  const pid = String(j.product_id || (pdpUrl.match(/\/pdp\/(?:[^/]*\/)?(\d+)/) || pdpUrl.match(/(\d{6,})/) || [])[1] || '') || null
  const priceReal = num(price.min_sku_price) ?? num(price.real_price)   // numeryczny FLOOR (do narzutu)
  const skus = Array.isArray(j.skus) ? j.skus : (j.product_info?.skus || [])
  return {
    product_id: pid,
    title,
    sold_count: sold,
    price_real: priceReal,
    price_max: num(price.max_sku_price),
    price_original: num(price.min_sku_original_price) ?? num(price.original_price),
    price_display: String(price.real_price || '').trim() || (priceReal != null ? `${price.currency_symbol || ''}${priceReal}` : ''),
    currency: price.currency ? String(price.currency) : null,
    currency_symbol: price.currency_symbol ? String(price.currency_symbol) : null,
    stock: num(skus?.[0]?.stock),
    rating: num(rev.product_rating) ?? num(j.seller?.rating),
    review_count: count(rev.review_count),
    images,
    video_count: Array.isArray(j.related_videos) ? j.related_videos.length : 0,
    fetched_at: new Date().toISOString(),
  }
}

// deno-lint-ignore no-explicit-any
function aliUsdOf(row: any): number | null {
  const snap = row.ali_snapshot
  const s = snap?.price?.sale
  if (s != null && Number.isFinite(+s) && +s > 0) return +s        // snapshot.price.sale = USD (target_currency=USD)
  const cands = Array.isArray(row.ali_candidates) ? row.ali_candidates : []
  const ch = cands.find((c: any) => c && c.link === row.chosen_link) || cands[0]
  if (ch) { const k = typeof ch.koszt === 'number' ? ch.koszt : parseFloat(String(ch.price ?? '')); if (Number.isFinite(k) && k > 0) return k / RATE }  // koszt = USD×RATE
  return null
}

// deno-lint-ignore no-explicit-any
function score(row: any, shop: any): { score: number | null; meta: any } {
  const p: Record<string, number> = {}
  if (shop && shop.sold_count != null) p.sales = clamp(Math.log10(shop.sold_count + 1) / Math.log10(50000))   // 50k szt = pełne
  const aliUsd = aliUsdOf(row)
  let markupX: number | null = null
  if (shop && shop.price_real && shop.price_real > 0 && aliUsd && aliUsd > 0 && (!shop.currency || shop.currency === 'USD')) {
    markupX = shop.price_real / aliUsd
    p.markup = clamp((markupX - 1) / 5)                                                                       // ×6 narzut = pełne
  }
  if (row.heat != null) p.heat = clamp((row.heat || 0) / 70)                                                  // heat 70 = pełne
  const rating = (shop && shop.rating && shop.rating > 0) ? shop.rating : (row.ali_snapshot?.review_stats?.avg ? +row.ali_snapshot.review_stats.avg : null)
  if (rating && rating > 0) p.rating = clamp(rating / 5)
  if (row.newest_days != null) { const d = row.newest_days; p.fresh = d <= 14 ? 1 : d <= 30 ? 0.6 : d <= 60 ? 0.3 : 0.1 }
  // BEZ przeskalowania wag: brak składowej = 0 (nie „znika"). Inaczej produkt bez danych Shop
  // (sam heat) dostawał zawyżone 90+ i wypychał zwalidowane sprzedażą. Suma wag = 1.0, więc
  // produkt bez sprzedaży+narzutu jest z natury capowany (max ~35 z heat+ocena+świeżość) i z ⚠.
  let n = 0
  for (const k of Object.keys(W) as (keyof typeof W)[]) n += W[k] * (p[k] ?? 0)
  const sc = Math.round(100 * n)
  return { score: sc, meta: { ...p, markup_x: markupX ? +markupX.toFixed(2) : null, ali_usd: aliUsd ? +aliUsd.toFixed(2) : null, partial: !(shop && shop.sold_count != null), weights: W } }
}

const COLS = 'id,key,status,shop_url,chosen_link,ali_candidates,ali_snapshot,heat,newest_days'

// deno-lint-ignore no-explicit-any
async function processRow(supabase: any, row: any): Promise<{ key: string; score: number | null; sold: number | null; shop: boolean }> {
  let shop = null
  const url = String(row.shop_url || '')
  if (url && /\/pdp\//.test(url) && SC) shop = parseShop(await fetchShop(url), url)
  const { score: sc, meta } = score(row, shop)
  const patch: Record<string, unknown> = { product_score: sc, score_meta: meta }
  if (shop) patch.tt_shop = shop
  await supabase.from('bud_tt_products').update(patch).eq('id', row.id)
  return { key: row.key, score: sc, sold: shop?.sold_count ?? null, shop: !!shop }
}

async function pool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length) as R[]; let i = 0
  async function w() { while (i < items.length) { const k = i++; out[k] = await fn(items[k]) } }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, w)); return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return new Response(JSON.stringify({ error: 'wymagane_logowanie_admin' }), { status: 403, headers: { ...cors, 'content-type': 'application/json' } })
  const j = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'content-type': 'application/json' } })
  const body = await req.json().catch(() => ({}))

  // DEBUG: surowa odpowiedź ScrapeCreators dla jednego linku (diagnoza kształtu/statusu)
  if (body.op === 'debug') {
    let url = String(body.url || '')
    if (!url && body.key) { const { data } = await supabase.from('bud_tt_products').select('shop_url').eq('key', body.key).maybeSingle(); url = String(data?.shop_url || '') }
    if (!url) return j({ error: 'brak_url' }, 400)
    const api = `https://api.scrapecreators.com/v1/tiktok/product?url=${encodeURIComponent(url)}&region=US`
    try {
      const r = await fetch(api, { headers: { 'x-api-key': SC } })
      const txt = await r.text()
      let parsed: any = null; try { parsed = JSON.parse(txt) } catch { /* */ }
      const pb = parsed?.product_base || parsed?.product_info?.product_base || null
      return j({ sc_key_present: !!SC, http_status: r.status, pb_keys: pb ? Object.keys(pb) : null, pb_price: pb?.price ?? null, pb_sold: pb?.sold_count ?? pb?.sold ?? null, pb_title: pb?.title ?? null, sku0_keys: parsed?.skus?.[0] ? Object.keys(parsed.skus[0]) : null, review: parsed?.product_detail_review ?? null, seller_rating: parsed?.seller?.rating ?? null, imgs: Array.isArray(pb?.images) ? pb.images.slice(0, 1) : pb?.images ?? null, related_n: Array.isArray(parsed?.related_videos) ? parsed.related_videos.length : null })
    } catch (e) { return j({ error: String(e).slice(0, 200), sc_key_present: !!SC }) }
  }

  // BACKFILL: wszystkie approved (pull Shop dla tych z shop_url; score liczony dla wszystkich)
  if (body.op === 'backfill') {
    const rows: any[] = []
    for (let off = 0; ; off += 1000) {
      const { data, error } = await supabase.from('bud_tt_products').select(COLS).eq('status', 'approved').order('heat', { ascending: false }).range(off, off + 999)
      if (error) return j({ error: error.message }, 500)
      if (!data?.length) break
      rows.push(...data); if (data.length < 1000) break
    }
    const lim = Math.min(rows.length, body.limit || 500)
    const res = await pool(rows.slice(0, lim), 4, (r) => processRow(supabase, r))
    const withShop = res.filter((r) => r.shop).length
    return j({ ok: true, processed: res.length, with_shop: withShop, scored: res.filter((r) => r.score != null).length, sample: res.slice(0, 20) })
  }

  // Lista kluczy
  const keys: string[] = Array.isArray(body.keys) ? body.keys : (body.key ? [body.key] : [])
  if (!keys.length) return j({ error: 'brak_key' }, 400)
  const { data: rows, error } = await supabase.from('bud_tt_products').select(COLS).in('key', keys)
  if (error) return j({ error: error.message }, 500)
  if (!rows?.length) return j({ error: 'produkt_nieznany' }, 404)
  const res = await pool(rows, 4, (r) => processRow(supabase, r))
  return j({ ok: true, results: res })
})
