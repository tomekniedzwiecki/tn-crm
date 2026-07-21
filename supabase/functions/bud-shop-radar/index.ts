// bud-shop-radar — SOLD-FIRST discovery produktów TikTok Shop (odwrotność bud-tt-trends).
// Zamiast skanować hashtagi (wiralowość → potem sprawdzamy czy się sprzedaje), startujemy
// od produktów TikTok Shop, które JUŻ mają licznik sprzedaży, i cofamy się do wideo + sklepu.
// Wyniki lądują w bud_tt_products jako pending (origin='shop_radar') z kompletem danych:
// shop_url (PDP), tt_shop (sold/cena/stan/sklep/wideo), tiktok_url (najlepsze powiązane wideo),
// pl_name (już dopracowana → name_refined_at=now()). Do tego snapshot do bud_tt_shop_history.
//
// SELLER-MINING ("dobry sklep = kopalnia"): sprzedawca, który dał nam JUŻ zwalidowany hit, ma na
// półce całą listę pre-walidowanych bestsellerów. seed_sellers zbiera sprawdzonych sprzedawców z
// bud_tt_products; mine_sellers pobiera ich KATALOG (/v1/tiktok/shop/products?sort_by=top) i pcha
// przez ten sam pipeline co scan (filtr → enrich → nazwy PL → dedup → upsert pending), origin='seller_mine'.
//
// Źródła (ScrapeCreators, 1 kredyt / request, nagłówek x-api-key):
//   GET /v1/tiktok/shop/search?query=&region=US   → lista produktów Shop (sold_info, price, rate)
//   GET /v1/tiktok/shop/products?url=<store_url>&sort_by=top&region=US → KATALOG sprzedawcy (paginacja cursor)
//   GET /v1/tiktok/product?url=<seo_url>&region=US → szczegóły (stock, related_videos, dokładne ceny)
//   store_url format: https://www.tiktok.com/shop/store/<slug>/<seller_id>
//
// Operacje (POST, admin-gated: team_member JWT | x-tools-secret). Deploy: --no-verify-jwt.
//   {op:'probe', queries:['car gadgets']}              → surowa odpowiedź /shop/search (diagnoza kształtu)
//   {op:'probe_products', sellerId, shopName?|storeUrl?} → surowa odpowiedź /shop/products (diagnoza URL/kształtu)
//   {op:'scan',  queries:[...], ...}                   → pełny flow sold-first (patrz KONTRAKT niżej)
//   {op:'match_existing', limit?, keys?, dryRun?, detail?, minScore?} → dopasuj Shop do ZATWIERDZONYCH
//        rekordów bez tt_shop (po kolumnie `query`). Ślad: tt_shop.auto_match.is_auto=true → wycofywalne.
//   {op:'seed_sellers'}                                → zasiej bud_radar_sellers ze sprawdzonych hitów → {seeded}
//   {op:'mine_sellers', limit?:5, perSeller?:2}        → mine katalogów sprzedawców → pending (origin='seller_mine')
import { adminGate } from '../_shared/bud-owner.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { openaiFetchRetry } from '../_shared/openai-fetch.ts'
import { rehostShopImages } from '../_shared/shop-images.ts'
import { normSeasonCode, seasonFields, seasonRule, SEASONS, SEASONAL_CODES } from '../_shared/seasons.ts'

const SC = Deno.env.get('BUD_SCRAPECREATORS_API_KEY') || ''
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const MODEL = Deno.env.get('BUD_PRODUCTS_MODEL') || 'gpt-5.1'
const B = 'https://api.scrapecreators.com'
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-tools-secret', 'access-control-allow-methods': 'POST, OPTIONS' }

// Kategorie spójne z bud-tt-trends (biblioteka /trendy filtruje po nich).
const TT_CATS = ['Dom & Kuchnia', 'Sprzątanie', 'Auto', 'Tech & Gadżety', 'Zdrowie & Uroda', 'Zwierzęta', 'Dzieci & Zabawki', 'Sport & Outdoor', 'Ogród & Majsterkowanie', 'Moda & Akcesoria', 'Podróże', 'Hobby & Kreatywne', 'Biuro & Organizacja', 'Inne']

const DEADLINE_MS = 300_000 // edge wall-clock 400s — przerywamy pętlę z zapasem i zwracamy partial

// ── helpery liczbowe (jak bud-tt-shop) ──
const num = (x: unknown): number | null => { const n = parseFloat(String(x ?? '')); return Number.isFinite(n) ? n : null }
// cena bywa stringiem z symbolem/zakresem: "$12.99", "12.99 - 20.99" → bierzemy pierwszą liczbę (floor)
function priceNum(x: unknown): number | null {
  if (typeof x === 'number' && Number.isFinite(x)) return x
  const m = String(x ?? '').replace(/,/g, '').match(/[\d.]+/)
  if (!m) return null
  const v = parseFloat(m[0]); return Number.isFinite(v) ? v : null
}
// sold_count / review_count bywa liczbą albo "12.4K" / "1.2M"
function count(x: unknown): number | null {
  if (typeof x === 'number' && Number.isFinite(x)) return x
  const s = String(x ?? '').trim().replace(/,/g, '')
  const m = s.match(/^([\d.]+)\s*([kKmM]?)/)
  if (!m) return null
  const v = parseFloat(m[1]); if (!Number.isFinite(v)) return null
  const mul = m[2].toLowerCase() === 'm' ? 1e6 : m[2].toLowerCase() === 'k' ? 1e3 : 1
  return Math.round(v * mul)
}
// znormalizowana nazwa = key (identyczne z bud-tt-ingest / bud-tt-trends)
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()

// slug sklepu do store_url (ASCII-safe; TikTok ignoruje slug i routuje po seller_id, ale trzymamy czytelny).
function sellerSlug(name: string | null | undefined): string {
  const map: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' }
  const s = String(name || 'shop').toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  return s || 'shop'
}
// store_url z obiektu shop (tt_shop.shop). Format zweryfikowany empirycznie: /shop/store/<slug>/<seller_id>.
function buildStoreUrl(shop: any): string | null {
  const sid = String(shop?.seller_id || '').trim()
  if (!sid) return null
  return `https://www.tiktok.com/shop/store/${sellerSlug(shop?.name)}/${sid}`
}

// ── SEZONOWOŚĆ ── (SSOT: docs/zbuduje/SEZONOWOSC.md; enum+okna w _shared/seasons.ts)
const SEASON_ENUM_HINT = SEASONAL_CODES.map((c) => `"${c}" (${SEASONS[c].label})`).join(', ')

// -- SANITYZACJA POD JSONB -- (patrz nagłówek w oryginale; Postgres jsonb odrzuca NUL i osierocone surogaty)
function cleanStr(s: string): string {
  // deno-lint-ignore no-explicit-any
  const x: string = (typeof (s as any).toWellFormed === 'function') ? (s as any).toWellFormed() : s
  let out = ''
  for (const ch of x) { const c = ch.charCodeAt(0); if (c === 9 || c === 10 || c === 13 || c >= 32) out += ch }
  return out
}
// deno-lint-ignore no-explicit-any
function deepSanitize(v: any): any {
  if (v === undefined || v === null) return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string') return cleanStr(v)
  if (typeof v === 'boolean') return v
  if (Array.isArray(v)) return v.map(deepSanitize)
  if (typeof v === 'object') { const o: Record<string, any> = {}; for (const k of Object.keys(v)) o[k] = deepSanitize(v[k]); return o }
  return v
}
// deno-lint-ignore no-explicit-any
function badJsonReasons(obj: any): string[] {
  const bad: string[] = []
  // deno-lint-ignore no-explicit-any
  const walk = (v: any, path: string) => {
    if (typeof v === 'string') {
      if (v.includes(String.fromCharCode(0))) bad.push(`${path}:null_char`)
      // deno-lint-ignore no-explicit-any
      else if (typeof (v as any).toWellFormed === 'function' && v !== (v as any).toWellFormed()) bad.push(`${path}:lone_surrogate`)
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
    else if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k], path ? `${path}.${k}` : k)
  }
  walk(obj, '')
  return bad
}

// Defensywny upsert: chunkami po 20; gdy chunk padnie → per-wiersz (jeden zepsuty NIE wywala batcha).
// deno-lint-ignore no-explicit-any
async function safeUpsert(supabase: any, dbRows: any[]): Promise<{ upserted: number; failed: number; errors: { key: string; error: string }[] }> {
  let upserted = 0, failed = 0
  const errors: { key: string; error: string }[] = []
  for (let i = 0; i < dbRows.length; i += 20) {
    const chunk = dbRows.slice(i, i + 20)
    const { error, count } = await supabase.from('bud_tt_products').upsert(chunk, { onConflict: 'key', count: 'exact' })
    if (!error) { upserted += count ?? chunk.length; continue }
    for (const r of chunk) {
      const { error: e2 } = await supabase.from('bud_tt_products').upsert([r], { onConflict: 'key' })
      if (e2) { failed++; if (errors.length < 10) errors.push({ key: r.key, error: String(e2.message).slice(0, 160) }); console.warn('[bud-shop-radar] upsert FAIL', r.key, e2.message) }
      else upserted++
    }
  }
  return { upserted, failed, errors }
}

// ── ScrapeCreators fetch z retry/backoff na 429 (1 kredyt / udany req) ──
async function scGet(url: string, attempts = 3): Promise<{ status: number; data: any | null }> {
  for (let i = 0; i < attempts; i++) {
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 25000)
      const r = await fetch(url, { headers: { 'x-api-key': SC }, signal: ctrl.signal }); clearTimeout(t)
      if (r.status === 429 && i < attempts - 1) { try { await r.body?.cancel() } catch { /* */ } await new Promise((res) => setTimeout(res, 1200 * (i + 1))); continue }
      if (!r.ok) { try { await r.body?.cancel() } catch { /* */ } return { status: r.status, data: null } }
      return { status: r.status, data: await r.json().catch(() => null) }
    } catch (e) {
      if (i < attempts - 1) { await new Promise((res) => setTimeout(res, 1200 * (i + 1))); continue }
      console.warn('[bud-shop-radar] scGet', String(e).slice(0, 80)); return { status: 0, data: null }
    }
  }
  return { status: 0, data: null }
}

// Wydobądź tablicę produktów z odpowiedzi /shop/search LUB /shop/products (kształt spójny → te same fallbacki).
function extractSearchProducts(j: any): any[] {
  if (!j || typeof j !== 'object') return []
  const cands = [j.products, j.data?.products, j.data, j.results, j.items, j.product_list, j.search_item_list]
  for (const c of cands) if (Array.isArray(c)) return c
  return []
}

// Znormalizuj pojedynczy produkt z /shop/search (i /shop/products — ten sam kształt obiektu produktu).
// KSZTAŁT ZWERYFIKOWANY EMPIRYCZNIE (2026-07-16, query 'car gadgets'):
//   product_price_info.sale_price_decimal="12.35" / origin_price_decimal / currency_name / currency_symbol
//   rate_info.score=4.7 / review_count      sold_info.sold_count=124919
//   seller_info.shop_name / seller_id        seo_url = OBIEKT {canonical_url, slug, type}
//   image = OBIEKT {url_list:[...]}          video = OBIEKT {share_url, aweme_id, author:{unique_id}}
function parseSearchItem(p: any): any {
  if (!p || typeof p !== 'object') return null
  const pi = p.product_price_info || {}
  const ri = p.rate_info || {}
  const si = p.sold_info || {}
  const sold = count(si.sold_count ?? p.sold_count)
  const priceSale = priceNum(pi.sale_price_decimal ?? pi.sale_price_format ?? pi.single_product_price_decimal ?? pi.sale_price)
  const priceOrig = priceNum(pi.origin_price_decimal ?? pi.origin_price_format ?? pi.origin_price)
  const rating = num(ri.score ?? ri.rating)
  const reviews = count(ri.review_count)
  const currency = String(pi.currency_name || 'USD')
  const currencySymbol = String(pi.currency_symbol || '$')
  const seoObj = p.seo_url
  const seoUrl = String((typeof seoObj === 'string' ? seoObj : (seoObj?.canonical_url || '')) || '').trim()
  const pid = String((p.product_id ?? p.id) || (seoUrl.match(/\/pdp\/(?:[^/]*\/)?(\d+)/) || seoUrl.match(/(\d{6,})/) || [])[1] || '')
  const title = String(p.title ?? p.product_name ?? '').slice(0, 240)
  const rawImgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])
  const images = rawImgs.map((im: any) => typeof im === 'string' ? im : (im?.url_list?.[0] || im?.url || '')).filter(Boolean).slice(0, 30)
  const si2 = p.seller_info || {}
  const seller = (si2.shop_name || si2.name) ? {
    name: String(si2.shop_name || si2.name).slice(0, 60),
    seller_id: String(si2.seller_id || si2.id || ''),
    rating: num(si2.rating ?? si2.score),
  } : null
  const v = p.video || {}
  const uid = v.author?.unique_id, aid = v.aweme_id
  const searchVideo = (uid && aid) ? `https://www.tiktok.com/@${uid}/video/${aid}` : (String(v.share_url || '').split('?')[0] || '')
  const cat = Array.isArray(p.category_breadcrumb) ? p.category_breadcrumb.map((c: any) => c?.category_name || c?.name).filter(Boolean).join(' > ') : ''
  return { pid, title, sold, priceSale, priceOrig, rating, reviews, currency, currencySymbol, seoUrl, images, seller, searchVideo, category_raw: cat }
}

// Zgodność tytułu produktu z zapytaniem: udział słów zapytania obecnych w tytule (0..1).
// Świadomie prymitywna i JAWNA — ma być czytelną, sprawdzalną heurystyką, a nie ukrytym
// „osądem AI", którego nikt nie umie potem odtworzyć. Wynik trafia do tt_shop.auto_match.score.
function titleScore(query: string, title: string): number {
  const norm = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/).filter((w) => w.length > 2)
  const q = norm(query)
  if (!q.length) return 0
  const t = new Set(norm(title))
  return q.filter((w) => t.has(w)).length / q.length
}

// Szczegóły produktu /v1/tiktok/product (pola w ROOT, jak w bud-tt-shop). Zwraca overlay do tt_shop.
function parseProductDetail(j: any, pdpUrl: string): any | null {
  if (!j || typeof j !== 'object') return null
  const pb = j.product_base || j.product_info?.product_base || {}
  const price = pb.price || {}
  const rev = j.product_detail_review || j.product_info?.product_detail_review || {}
  const skus = Array.isArray(j.skus) ? j.skus : (j.product_info?.skus || [])
  const images = (Array.isArray(pb.images) ? pb.images : []).map((im: any) => typeof im === 'string' ? im : (im?.url_list?.[0] || im?.thumb_url_list?.[0] || '')).filter(Boolean).slice(0, 30)
  const rv = Array.isArray(j.related_videos) ? j.related_videos : []
  const videos = rv.map((v: any) => ({
    url: String(v.url || v.author_url || v.content_url || '').trim(),
    title: String(v.title || '').slice(0, 120),
    author: String(v.author_name || '').slice(0, 40),
    plays: count(v.play_count),
    likes: count(v.like_count),
    cover: String(v.cover_image_url || '').trim(),
  })).filter((v: any) => v.url).sort((a: any, b: any) => (b.plays || 0) - (a.plays || 0)).slice(0, 12)
  const sel = j.seller || j.product_info?.seller || {}
  const shop = sel && sel.name ? {
    name: String(sel.name).slice(0, 60),
    seller_id: String(sel.seller_id || sel.id || ''),
    rating: num(sel.rating),
    product_count: num(sel.product_count),
    avatar: String(sel.avatar?.url_list?.[0] || sel.avatar?.url || '').trim(),
    location: String(sel.seller_location || '').slice(0, 40),
    deeplink: String(sel.shop_link || '').trim(),
  } : null
  const pid = String(j.product_id || (pdpUrl.match(/(\d{6,})/) || [])[1] || '') || null
  return {
    product_id: pid,
    title: String(pb.title || '').slice(0, 240),
    sold_count: count(pb.sold_count) ?? count(pb.combined_sales_volume),
    price_real: num(price.min_sku_price) ?? num(price.real_price),
    price_max: num(price.max_sku_price),
    price_original: num(price.min_sku_original_price) ?? num(price.original_price),
    price_display: String(price.real_price || '').trim(),
    currency: price.currency ? String(price.currency) : null,
    currency_symbol: price.currency_symbol ? String(price.currency_symbol) : null,
    stock: num(skus?.[0]?.stock),
    rating: num(rev.product_rating) ?? num(sel.rating),
    review_count: count(rev.review_count),
    images,
    videos,
    video_count: rv.length,
    shop,
  }
}

// ── FILTR PRZYDATNOŚCI (współdzielony scan ↔ mine): sprzedaż ≥ minSold, cena w widełkach USD,
// ocena ≥ 4.0 (gdy dostępna), musi mieć seoUrl (do enrich + PDP). ──
function passesFilter(it: any, minSold: number, priceUsdMin: number, priceUsdMax: number): boolean {
  return (it.sold ?? 0) >= minSold &&
    !!it.seoUrl &&
    it.priceSale != null && it.priceSale >= priceUsdMin && it.priceSale <= priceUsdMax &&
    (it.rating == null || it.rating >= 4.0)
}

// Pobierz katalog sprzedawcy z /v1/tiktok/shop/products (paginacja cursor, sort_by=top). Max `maxPages` stron.
async function fetchSellerProducts(storeUrl: string, region: string, maxPages: number): Promise<{ items: any[]; pages: number; lastStatus: number }> {
  const items: any[] = []
  let cursor = ''
  let pages = 0
  let lastStatus = 0
  for (let p = 0; p < maxPages; p++) {
    const u = `${B}/v1/tiktok/shop/products?url=${encodeURIComponent(storeUrl)}&sort_by=top&region=${encodeURIComponent(region)}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
    const { status, data } = await scGet(u)
    lastStatus = status
    pages++
    const arr = extractSearchProducts(data)
    items.push(...arr)
    cursor = String(data?.cursor || data?.next_cursor || '')
    if (!data?.has_more || !cursor || !arr.length) break
  }
  return { items, pages, lastStatus }
}

// GPT: batchem przetłumacz tytuły (EN, keyword-stuffed) na krótkie polskie nazwy handlowe + kategorię.
let RU = { i: 0, c: 0, o: 0, calls: 0 }
function feedUsage(data: any) { const u = data?.usage; if (u) { RU.i += u.prompt_tokens || 0; RU.c += u.prompt_tokens_details?.cached_tokens || 0; RU.o += u.completion_tokens || 0; RU.calls++ } }
async function flushUsage(supabase: any) {
  if (!RU.calls) return
  const P: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
  const p = P[MODEL] || P['gpt-5.1']
  const cost = (Math.max(0, RU.i - RU.c) * p.i + RU.c * p.c + RU.o * p.o) / 1_000_000
  const snap = { ...RU }; RU = { i: 0, c: 0, o: 0, calls: 0 }
  try { await supabase.from('bud_usage').insert({ session_id: null, kind: 'radar', model: MODEL, input_tokens: snap.i, cached_tokens: snap.c, output_tokens: snap.o, cost_usd: cost, meta: { from: 'bud-shop-radar', calls: snap.calls } }) } catch (e) { console.error('[bud-shop-radar] usage', e) }
}
type NameCat = { pl: string; category: string; season_code: string }
async function namesAndCats(titles: string[]): Promise<NameCat[]> {
  const fallback = (): NameCat => ({ pl: '', category: 'Inne', season_code: 'all_year' })
  if (!titles.length || !OPENAI_KEY) return titles.map(fallback)
  const list = titles.map((t, i) => `${i}. ${(t || '').replace(/\s+/g, ' ').slice(0, 200)}`).join('\n')
  try {
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { authorization: `Bearer ${OPENAI_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, reasoning_effort: 'low', response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: `Dostajesz listę tytułów produktów z TikTok Shop (EN, przeładowane słowami kluczowymi i śmieciami). Dla KAŻDEGO zwróć krótką polską nazwę handlową, kategorię i KOD sezonu.\nZASADY NAZWY:\n- 2–6 słów, naturalna handlowa polszczyzna, pierwsza litera wielka\n- WYTNIJ śmieci: "2026","New","Hot Sale","Free Shipping","Dropshipping", kody, zbędne wymiary/ilości, listy wariantów\n- zachowaj wyróżnik/istotę produktu\n- markę podaj TYLKO gdy jest tożsamością produktu (np. CarPlay); inaczej pomiń\n- poprawne polskie diakrytyki\nSEZONOWOŚĆ — JEDYNE KRYTERIUM = POPYT (nie motyw wizualny ani słowo w nazwie):\n"Czy przeciętny Polak kupi ten produkt w danym miesiącu tak samo chętnie jak w szczycie? Jeśli poza oknem popyt praktycznie ZNIKA — sezonowy. Jeśli tylko spada — all_year."\n- Motyw/dekor (aurora, pączek, dynia) NIGDY sam nie przesądza sezonu.\n- Wątpliwe → "all_year" (fałszywy sezon ukrywa dobry produkt — gorszy błąd).\n- Dwusezonowe → "all_year".\nPRZYKŁADY (negatywne): projektor aurory → all_year; lampka-pączek → all_year; mata plażowa → lato; ogrzewacz rąk → zima_grzanie.\n- Zwróć season_code = DOKŁADNIE JEDEN kod z listy: "all_year", ${SEASON_ENUM_HINT}. Żadnych dat ani innych etykiet.\nZwróć JSON {"items":[{"pl":"<nazwa>","category":"<jedna z: ${TT_CATS.join(' / ')}>","season_code":"<kod z enuma>"}]} w TEJ SAMEJ kolejności i liczbie co tytuły.\nTytuły:\n${list}` }],
      }),
    }, 'shop-radar-names')
    if (!res.ok) { try { await res.body?.cancel() } catch { /* */ } return titles.map(fallback) }
    const j = await res.json(); feedUsage(j)
    const items = JSON.parse(j.choices[0].message.content).items || []
    return titles.map((_, i) => {
      const it = items[i] || {}
      return { pl: String(it?.pl || '').trim().slice(0, 80), category: TT_CATS.includes(it?.category) ? it.category : 'Inne', season_code: normSeasonCode(it?.season_code) || 'all_year' }
    })
  } catch { return titles.map(fallback) }
}

async function pool<T, R>(items: T[], n: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length) as any; let idx = 0
  async function w() { while (idx < items.length) { const i = idx++; out[i] = await fn(items[i], i) } }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, w)); return out
}

// ── WSPÓLNY PIPELINE (scan ↔ mine_sellers): dostaje już PRZEFILTROWANE `picked` (parseSearchItem +
// passesFilter, każdy z ._query), robi: dedup po pid → enrich /product → nazwy PL + sezon → wyklucz
// istniejące key → dedup po key → build wierszy (origin param) → upsert + history → rehost packshotów.
// Zwraca komplet liczników + sample + partial. Identyczna semantyka jak dawny inline-scan. ──
async function ingestPicked(
  supabase: any,
  picked: any[],
  opts: { region: string; enrich: boolean; ingest: boolean; origin: string; t0: number },
): Promise<{ found: number; upserted: number; failed: number; skipped_existing: number; images_rehosted: number; upsert_errors: { key: string; error: string }[]; diag: { key: string; reasons: string[] }[]; partial: boolean; sample: any[] }> {
  const { region, enrich, ingest, origin, t0 } = opts
  let partial = false

  // dedup w obrębie batcha po pid (albo seoUrl)
  const seen = new Set<string>()
  const uniq = picked.filter((it: any) => { const k = it.pid || it.seoUrl; if (!k || seen.has(k)) return false; seen.add(k); return true })

  // ── ENRICH: /v1/tiktok/product per produkt (stock, related_videos → tiktok_url, dokładne ceny) ──
  if (enrich && uniq.length) {
    await pool(uniq, 4, async (it: any) => {
      if (Date.now() - t0 > DEADLINE_MS) { partial = true; return }
      const { data } = await scGet(`${B}/v1/tiktok/product?url=${encodeURIComponent(it.seoUrl)}&region=${encodeURIComponent(region)}`)
      it._detail = parseProductDetail(data, it.seoUrl)
    })
  }

  // ── NAZWY PL + KATEGORIE (1 GPT call, batch) ──
  const nc = await namesAndCats(uniq.map((it: any) => it._detail?.title || it.title))
  uniq.forEach((it: any, i: number) => {
    it._pl = nc[i]?.pl || ''; it._cat = nc[i]?.category || 'Inne'
    const ruleCode = seasonRule(it._pl)
    const code = ruleCode || nc[i]?.season_code || 'all_year'
    it._season = { ...seasonFields(code), season_source: ruleCode ? 'rule' : 'draft', season_verified: !!ruleCode }
  })

  const named = uniq.filter((it: any) => { it._key = norm(it._pl); return it._key && it._pl })

  // ── WYKLUCZ ISTNIEJĄCE key (paginacja po 1000 — pułapka PostgREST 1000 wierszy) ──
  const have = new Set<string>()
  if (ingest && named.length) {
    for (let off = 0; ; off += 1000) {
      const { data: ex } = await supabase.from('bud_tt_products').select('key').range(off, off + 999)
      if (!ex?.length) break
      for (const r of ex as any[]) have.add(r.key)
      if (ex.length < 1000) break
    }
  }
  // dedup po _key TAKŻE wewnątrz batcha (ta sama nazwa PL z GPT = ten sam key; zostaje wariant z większą sprzedażą)
  const byKey = new Map<string, any>()
  for (const it of named) {
    const prev = byKey.get(it._key)
    if (!prev || (Number(it.sold) || 0) > (Number(prev.sold) || 0)) byKey.set(it._key, it)
  }
  const fresh = [...byKey.values()].filter((it: any) => !have.has(it._key))
  const skippedExisting = named.length - fresh.length

  // ── BUDUJ WIERSZE + tt_shop (kształt jak bud-tt-shop) ──
  const nowIso = new Date().toISOString()
  const rows = fresh.map((it: any) => {
    const d = it._detail
    const bestVideo = d?.videos?.[0]?.url || it.searchVideo || null
    const tt_shop: any = {
      product_id: d?.product_id || it.pid || null,
      title: d?.title || it.title,
      sold_count: d?.sold_count ?? it.sold ?? null,
      price_real: d?.price_real ?? it.priceSale ?? null,
      price_max: d?.price_max ?? null,
      price_original: d?.price_original ?? it.priceOrig ?? null,
      price_display: d?.price_display || (it.priceSale != null ? `$${it.priceSale}` : ''),
      currency: d?.currency ?? it.currency ?? 'USD',
      currency_symbol: d?.currency_symbol ?? it.currencySymbol ?? '$',
      stock: d?.stock ?? null,
      rating: d?.rating ?? it.rating ?? null,
      review_count: d?.review_count ?? it.reviews ?? null,
      images: (d?.images?.length ? d.images : it.images) || [],
      videos: d?.videos || [],
      video_count: d?.video_count ?? 0,
      shop: d?.shop || it.seller || null,
      source: origin,
      fetched_at: nowIso,
    }
    return {
      key: it._key,
      pl_name: it._pl,
      category: it._cat,
      season_type: it._season?.season_type || 'all_year',
      season_label: it._season?.season_label ?? 'całoroczny',
      sell_from: it._season?.sell_from ?? null,
      sell_to: it._season?.sell_to ?? null,
      season_source: it._season?.season_source || 'draft',
      season_verified: it._season?.season_verified ?? false,
      query: it._query || null,
      tiktok_url: bestVideo,
      cover: it.images?.[0] || d?.images?.[0] || null,
      shop_url: it.seoUrl,
      tt_shop,
      status: 'pending',
      origin,
      name_refined_at: nowIso,
      heat: 0,
      _sold: tt_shop.sold_count,
      _price: tt_shop.price_real,
      _stock: tt_shop.stock,
    }
  })

  let upserted = 0, failed = 0
  let upsertErrors: { key: string; error: string }[] = []
  const diag: { key: string; reasons: string[] }[] = []
  for (const r of rows) { const { _sold, _price, _stock, ...clean } = r as any; const rs = badJsonReasons(clean); if (rs.length && diag.length < 15) diag.push({ key: r.key, reasons: [...new Set(rs.map((x: string) => x.split(':').pop()!))] }) }

  if (ingest && rows.length) {
    const dbRows = rows.map(({ _sold, _price, _stock, ...r }: any) => deepSanitize(r))
    const res = await safeUpsert(supabase, dbRows)
    upserted = res.upserted; failed = res.failed; upsertErrors = res.errors
    const hist = rows.filter((r: any) => r._sold != null).map((r: any) => deepSanitize({ key: r.key, sold_count: r._sold, price_usd: r._price, stock: r._stock }))
    if (hist.length) {
      const { error: he } = await supabase.from('bud_tt_shop_history').insert(hist)
      if (he) {
        for (const h of hist) { const { error: he2 } = await supabase.from('bud_tt_shop_history').insert([h]); if (he2) console.warn('[bud-shop-radar] history row', h.key, he2.message) }
      }
    }
  }

  // ── REHOST PACKSHOTÓW (CDN TikToka wygasa; kopiujemy do storage attachments/bud-shop-imgs/) ──
  let imagesRehosted = 0
  if (ingest && upserted) {
    for (const r of rows as any[]) {
      if (Date.now() - t0 > DEADLINE_MS - 20_000) { partial = true; break }
      const imgs = Array.isArray(r.tt_shop?.images) ? r.tt_shop.images : []
      if (!imgs.length) continue
      const hosted = await rehostShopImages(supabase, r.key, imgs, 30)
      if (!hosted.length) continue
      const tt_shop = { ...r.tt_shop, images_hosted: hosted }
      const patch: any = { tt_shop: deepSanitize(tt_shop) }
      patch.cover = hosted[0]
      const { error: ue } = await supabase.from('bud_tt_products').update(patch).eq('key', r.key)
      if (ue) { console.warn('[bud-shop-radar] rehost update', r.key, String(ue.message || ue).slice(0, 120)); continue }
      imagesRehosted++
    }
  }

  const sample = (ingest ? rows : named.map((it: any) => ({ pl_name: it._pl, _sold: it._detail?.sold_count ?? it.sold, _price: it._detail?.price_real ?? it.priceSale, tiktok_url: it._detail?.videos?.[0]?.url || it.searchVideo || null }))).slice(0, 5)
    .map((r: any) => ({ pl: r.pl_name, sold: r._sold ?? null, priceUsd: r._price ?? null, hasVideo: !!r.tiktok_url }))

  return { found: uniq.length, upserted, failed, skipped_existing: skippedExisting, images_rehosted: imagesRehosted, upsert_errors: upsertErrors, diag, partial, sample }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return new Response(JSON.stringify({ error: 'wymagane_logowanie_admin' }), { status: 403, headers: { ...cors, 'content-type': 'application/json' } })
  const J = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'content-type': 'application/json' } })
  const t0 = Date.now()
  RU = { i: 0, c: 0, o: 0, calls: 0 }

  const body = await req.json().catch(() => ({}))
  const op = body.op || 'scan'
  const region = body.region || 'US'
  // wspólne knobi filtra (scan i mine)
  const minSold = body.minSold ?? 1000
  const priceUsdMin = body.priceUsdMin ?? 3
  const priceUsdMax = body.priceUsdMax ?? 60
  const enrich = body.enrich !== false
  const ingest = body.ingest !== false

  // ── SEED_SELLERS: zbierz sprawdzonych sprzedawców (approved LUB sold>20000) z bud_tt_products → bud_radar_sellers ──
  if (op === 'seed_sellers') {
    // deno-lint-ignore no-explicit-any
    const sellers = new Map<string, { seller_id: string; shop_name: string | null; store_url: string | null; source_key: string; total_sold: number; _srcSold: number }>()
    for (let off = 0; ; off += 1000) {
      const { data, error } = await supabase.from('bud_tt_products').select('key,status,tt_shop').range(off, off + 999)
      if (error) return J({ error: 'db_read', detail: String(error.message).slice(0, 200) }, 500)
      if (!data?.length) break
      for (const r of data as any[]) {
        const shop = r.tt_shop?.shop
        const sid = String(shop?.seller_id || '').trim()
        if (!sid) continue
        const sold = Number(r.tt_shop?.sold_count) || 0
        if (!(r.status === 'approved' || sold > 20000)) continue
        const prev = sellers.get(sid)
        if (!prev) {
          sellers.set(sid, { seller_id: sid, shop_name: shop?.name || null, store_url: buildStoreUrl(shop), source_key: r.key, total_sold: sold, _srcSold: sold })
        } else {
          prev.total_sold += sold // suma sold naszych hitów tego sprzedawcy (sygnał "kopalni")
          if (sold > prev._srcSold) { prev._srcSold = sold; prev.source_key = r.key } // source_key = największy hit
          if (!prev.shop_name && shop?.name) { prev.shop_name = shop.name; prev.store_url = buildStoreUrl(shop) }
        }
      }
      if (data.length < 1000) break
    }
    const rows = [...sellers.values()].map(({ _srcSold, ...s }) => s)
    if (!rows.length) return J({ seeded: 0, note: 'brak_kwalifikujacych_sprzedawcow' })
    // upsert (nie nadpisuj last_mined_at — kolumny brak w payloadzie → zostaje) chunkami po 100
    let seeded = 0
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100).map((r) => deepSanitize(r))
      const { error, count } = await supabase.from('bud_radar_sellers').upsert(chunk, { onConflict: 'seller_id', count: 'exact', ignoreDuplicates: false })
      if (error) { console.warn('[bud-shop-radar] seed upsert', error.message); continue }
      seeded += count ?? chunk.length
    }
    return J({ seeded, distinct_sellers: rows.length })
  }

  // ── PROBE_PRODUCTS: surowa odpowiedź /v1/tiktok/shop/products (weryfikacja store_url + kształtu) ──
  if (op === 'probe_products') {
    const storeUrl = String(body.storeUrl || buildStoreUrl({ name: body.shopName, seller_id: body.sellerId }) || '')
    if (!storeUrl) return J({ error: 'brak_storeUrl_lub_sellerId' }, 400)
    const append = body.append ? `&${String(body.append)}` : ''
    const url = `${B}/v1/tiktok/shop/products?url=${encodeURIComponent(storeUrl)}&sort_by=${encodeURIComponent(body.sort_by || 'top')}&region=${encodeURIComponent(region)}${append}`
    const { status, data } = await scGet(url)
    const arr = extractSearchProducts(data)
    return J({
      store_url: storeUrl, url, http_status: status,
      top_keys: data && typeof data === 'object' ? Object.keys(data) : null,
      has_more: data?.has_more ?? null,
      cursor: data?.cursor ?? data?.next_cursor ?? null,
      total_products: data?.total_products ?? null,
      items_found: arr.length,
      first_item_keys: arr[0] && typeof arr[0] === 'object' ? Object.keys(arr[0]) : null,
      first_item_raw: arr[0] ?? null,
      parsed_sample: arr.slice(0, 3).map(parseSearchItem),
    })
  }

  // ── MATCH_EXISTING: dopasuj TikTok Shop do JUŻ ZATWIERDZONYCH rekordów, które go nie mają ──
  // Wypełnia tt_shop AUTOMATEM po kolumnie `query` — tym samym zapytaniem, którym produkt znaleziono.
  // ⚠️ To NIE jest potwierdzony dowód sprzedaży: podstawą jest zgodność tytułu z zapytaniem, nie
  // oględziny produktu. Dlatego KAŻDE wypełnienie nosi ślad `tt_shop.auto_match.is_auto = true`
  // (zwykłe pole jsonb, odpytywalne w SQL), a wycofanie to jeden UPDATE — patrz
  // docs/zbuduje/AUTO-MATCH-SHOP.md. Odrzuceni kandydaci zostają w `auto_match.candidates`,
  // więc wybór da się ocenić i poprawić BEZ ponownego palenia kredytów.
  //   {op:'match_existing', limit?:20, keys?:[...], dryRun?:false, detail?:true, minScore?:0.5}
  if (op === 'match_existing') {
    const limit = Math.min(Math.max(Number(body.limit ?? 20), 1), 100)
    const dryRun = !!body.dryRun
    const withDetail = body.detail !== false
    const minScore = Number(body.minScore ?? 0.5)
    const keys: string[] | null = Array.isArray(body.keys) && body.keys.length ? body.keys : null

    let sel = supabase.from('bud_tt_products')
      .select('id,key,pl_name,query,shop_url,cover')
      .eq('status', 'approved').is('tt_shop', null).not('query', 'is', null)
    if (keys) sel = sel.in('key', keys)
    const { data: targets, error: tErr } = await sel.order('key').limit(limit)
    if (tErr) return J({ error: 'db_read_targets', detail: String(tErr.message).slice(0, 200) }, 500)

    const nowIso = new Date().toISOString()
    const results: any[] = []
    let filled = 0, skipped = 0

    for (const t of (targets || [])) {
      const query = String(t.query || '').trim()
      const { status, data } = await scGet(
        `${B}/v1/tiktok/shop/search?query=${encodeURIComponent(query)}&region=${encodeURIComponent(region)}`,
      )
      const parsed = extractSearchProducts(data).map(parseSearchItem).filter((p: any) => p && p.seoUrl)
      if (!parsed.length) { results.push({ key: t.key, skip: 'brak_wynikow', http: status }); skipped++; continue }

      // Ranking: najpierw zgodność tytułu z zapytaniem, przy remisie wyższa sprzedaż.
      const scored = parsed.map((p: any) => ({ p, s: titleScore(query, p.title) }))
        .sort((a, b) => (b.s - a.s) || ((Number(b.p.sold) || 0) - (Number(a.p.sold) || 0)))
      const top = scored[0]
      // Próg: lepiej ZOSTAWIĆ puste niż wpisać cudzy produkt. Powód zapisujemy jawnie.
      if (top.s < minScore) {
        results.push({ key: t.key, skip: 'slabe_dopasowanie', score: Number(top.s.toFixed(2)), best: String(top.p.title).slice(0, 80) })
        skipped++; continue
      }

      const it = top.p
      let d: any = null
      if (withDetail) {
        const det = await scGet(`${B}/v1/tiktok/product?url=${encodeURIComponent(it.seoUrl)}&region=${encodeURIComponent(region)}`)
        d = parseProductDetail(det.data, it.seoUrl)
      }

      const tt_shop: any = {
        product_id: d?.product_id || it.pid || null,
        title: d?.title || it.title,
        sold_count: d?.sold_count ?? it.sold ?? null,
        price_real: d?.price_real ?? it.priceSale ?? null,
        price_max: d?.price_max ?? null,
        price_original: d?.price_original ?? it.priceOrig ?? null,
        price_display: d?.price_display || (it.priceSale != null ? `$${it.priceSale}` : ''),
        currency: d?.currency ?? it.currency ?? 'USD',
        currency_symbol: d?.currency_symbol ?? it.currencySymbol ?? '$',
        stock: d?.stock ?? null,
        rating: d?.rating ?? it.rating ?? null,
        review_count: d?.review_count ?? it.reviews ?? null,
        images: (d?.images?.length ? d.images : it.images) || [],
        videos: d?.videos || [],
        video_count: d?.video_count ?? 0,
        shop: d?.shop || it.seller || null,
        source: 'auto_match',
        fetched_at: nowIso,
        // ── ŚLAD AUTOMATU (podstawa wycofania) ──
        auto_match: {
          is_auto: true,
          at: nowIso,
          by: 'bud-shop-radar/match_existing',
          query,
          score: Number(top.s.toFixed(2)),
          picked_title: String(it.title).slice(0, 160),
          picked_seo_url: it.seoUrl,
          set_shop_url: !t.shop_url,   // czy shop_url wpisaliśmy MY (rollback nie ruszy cudzego)
          note: 'Wypelnione AUTOMATEM po kolumnie query — zgodnosc TYTULU, nie potwierdzony dowod sprzedazy.',
          candidates: scored.slice(1, 6).map((c) => ({
            title: String(c.p.title).slice(0, 120), score: Number(c.s.toFixed(2)),
            sold: c.p.sold, price: c.p.priceSale, seo_url: c.p.seoUrl,
          })),
        },
      }

      if (dryRun) {
        results.push({ key: t.key, dry: true, score: tt_shop.auto_match.score, title: tt_shop.title, sold: tt_shop.sold_count, alt: tt_shop.auto_match.candidates.length })
        continue
      }

      // Packshoty na trwałe (URL-e TikToka są podpisane i wygasają) — jak w backfillu shop_images.
      const hosted = await rehostShopImages(supabase, t.key, tt_shop.images || [], 8)
      if (hosted.length) tt_shop.images_hosted = hosted

      const patch: any = { tt_shop: deepSanitize(tt_shop) }
      if (!t.shop_url) patch.shop_url = it.seoUrl
      if (!t.cover && hosted.length) patch.cover = hosted[0]
      const { error: uErr } = await supabase.from('bud_tt_products').update(patch).eq('id', t.id)
      if (uErr) { results.push({ key: t.key, err: String(uErr.message).slice(0, 120) }); continue }
      filled++
      results.push({ key: t.key, ok: true, score: tt_shop.auto_match.score, title: String(tt_shop.title).slice(0, 70), sold: tt_shop.sold_count, packshots: hosted.length })
    }

    return J({ op: 'match_existing', targets: (targets || []).length, filled, skipped, dryRun, results })
  }

  // ── MINE_SELLERS: weź `limit` najdawniej minowanych sprzedawców → pobierz ich katalogi → pipeline ──
  if (op === 'mine_sellers') {
    const limit = Math.min(Math.max(Number(body.limit ?? 5), 1), 20)
    const perSeller = Math.min(Math.max(Number(body.perSeller ?? 2), 1), 5)
    const { data: sellers, error } = await supabase.from('bud_radar_sellers')
      .select('seller_id,shop_name,store_url')
      .order('last_mined_at', { ascending: true, nullsFirst: true })
      .order('discovered_at', { ascending: true })
      .limit(limit)
    if (error) return J({ error: 'db_read_sellers', detail: String(error.message).slice(0, 200) }, 500)
    if (!sellers?.length) return J({ sellers_mined: 0, scanned: 0, upserted: 0, skipped_existing: 0, failed: 0, note: 'brak_sprzedawcow_najpierw_seed_sellers' })

    const picked: any[] = []
    let sellersMined = 0, scanned = 0, minePartial = false
    const minedIds: string[] = []
    const perSellerStats: { seller: string; found: number; passed: number; pages: number; http: number }[] = []
    for (const s of sellers as any[]) {
      if (Date.now() - t0 > DEADLINE_MS - 60_000) { minePartial = true; break } // zostaw zapas na enrich+ingest
      const storeUrl = s.store_url || buildStoreUrl({ name: s.shop_name, seller_id: s.seller_id })
      if (!storeUrl) { minedIds.push(s.seller_id); continue }
      const { items: raw, pages, lastStatus } = await fetchSellerProducts(storeUrl, region, perSeller)
      const items = raw.map(parseSearchItem).filter(Boolean)
      scanned += items.length
      const passed = items.filter((it: any) => passesFilter(it, minSold, priceUsdMin, priceUsdMax))
      for (const it of passed) { it._query = `seller:${(s.shop_name || s.seller_id)}`.slice(0, 120); picked.push(it) }
      perSellerStats.push({ seller: s.shop_name || s.seller_id, found: items.length, passed: passed.length, pages, http: lastStatus })
      sellersMined++
      minedIds.push(s.seller_id)
    }
    // stempluj last_mined_at (nawet gdy 0 trafień — inaczej ten sam martwy sprzedawca blokowałby rotację)
    if (minedIds.length) {
      const { error: ue } = await supabase.from('bud_radar_sellers').update({ last_mined_at: new Date().toISOString() }).in('seller_id', minedIds)
      if (ue) console.warn('[bud-shop-radar] stamp last_mined_at', ue.message)
    }

    const res = await ingestPicked(supabase, picked, { region, enrich, ingest, origin: 'seller_mine', t0 })
    await flushUsage(supabase)
    return J({
      sellers_mined: sellersMined, scanned, found: res.found,
      upserted: res.upserted, skipped_existing: res.skipped_existing, failed: res.failed,
      images_rehosted: res.images_rehosted,
      ...(res.failed ? { upsert_errors: res.upsert_errors } : {}),
      ...(res.diag.length ? { diag: res.diag } : {}),
      ...(res.partial || minePartial ? { partial: true } : {}),
      per_seller: perSellerStats,
      sample: res.sample,
    })
  }

  // ── PROBE / SCAN wymagają queries ──
  let queries: string[] = Array.isArray(body.queries) ? body.queries.map((q: any) => String(q || '').trim()).filter(Boolean) : []
  if (!queries.length) return J({ error: 'brak_queries' }, 400)

  // ── PROBE: surowa odpowiedź /shop/search (ustalenie kształtu pól + paginacji page vs amount) ──
  if (op === 'probe') {
    const q = queries[0]
    const append = body.append ? `&${String(body.append)}` : ''
    const url = `${B}/v1/tiktok/shop/search?query=${encodeURIComponent(q)}&region=${encodeURIComponent(region)}${append}`
    const { status, data } = await scGet(url)
    const arr = extractSearchProducts(data)
    return J({
      url, http_status: status,
      top_keys: data && typeof data === 'object' ? Object.keys(data) : null,
      items_found: arr.length,
      first_item_keys: arr[0] && typeof arr[0] === 'object' ? Object.keys(arr[0]) : null,
      first_item_raw: arr[0] ?? null,
      parsed_sample: arr.slice(0, 3).map(parseSearchItem),
    })
  }

  // ── SCAN ──
  queries = queries.slice(0, 8) // max 8 queries / call
  const maxPerQuery = body.maxPerQuery ?? 30

  let scanned = 0, filteredCount = 0
  let partial = false
  const nextQueries: string[] = []
  const picked: any[] = []

  for (let qi = 0; qi < queries.length; qi++) {
    if (Date.now() - t0 > DEADLINE_MS) { partial = true; nextQueries.push(...queries.slice(qi)); break }
    const q = queries[qi]
    const url = `${B}/v1/tiktok/shop/search?query=${encodeURIComponent(q)}&region=${encodeURIComponent(region)}`
    const { data } = await scGet(url)
    const items = extractSearchProducts(data).map(parseSearchItem).filter(Boolean)
    scanned += items.length
    const passed = items.filter((it: any) => passesFilter(it, minSold, priceUsdMin, priceUsdMax))
      .sort((a: any, b: any) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, maxPerQuery)
    filteredCount += passed.length
    for (const it of passed) { it._query = q; picked.push(it) }
  }

  const res = await ingestPicked(supabase, picked, { region, enrich, ingest, origin: 'shop_radar', t0 })
  await flushUsage(supabase)

  return J({
    scanned, found: res.found, filtered: filteredCount,
    upserted: res.upserted, failed: res.failed, skipped_existing: res.skipped_existing, images_rehosted: res.images_rehosted,
    ...(res.failed ? { upsert_errors: res.upsert_errors } : {}),
    ...(res.diag.length ? { diag: res.diag } : {}),
    ...(partial || res.partial ? { partial: true, nextQueries } : {}),
    sample: res.sample,
  })
})
