// Biblioteka sklepów (AWE) — SOURCING: dla sklepu z biblioteki zsourcuj produkty asortymentu
// na AliExpress (ship PL). Silnik: og:image+og:title ze strony -> VISION układa trafną frazę
// i odrzuca nie-dropship (ebook/kupon/brand) -> AliExpress (12+q2 fallback) -> price-band ->
// VISION-verify po zdjęciu -> kanoniczny item/ID.html. Upsert do bud_store_products (resumable).
// Admin-gated (team_members).
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'
import { openaiFetchRetry } from '../_shared/openai-fetch.ts'

const RAPID_KEY = Deno.env.get('BUD_ALIEXPRESS_RAPIDAPI_KEY') || ''
const RAPID_HOST = 'aliexpress-true-api.p.rapidapi.com'
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const MODEL = Deno.env.get('BUD_PRODUCTS_MODEL') || 'gpt-5.1'
const RATE = 4, MARKUP = 2.7, BAND_MIN = 8, BAND_MAX = 350
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' }

const slugWords = (link: string) => { try { const m = new URL(link).pathname.match(/\/products\/([^/?#]+)/i); return m ? m[1].replace(/[-_]+/g, ' ').replace(/\d+/g, ' ').trim() : '' } catch { return '' } }

async function fetchMeta(url: string): Promise<{ img: string, title: string }> {
  if (!/^https?:\/\//.test(url)) return { img: '', title: '' }
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 9000)
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
    clearTimeout(t); if (!r.ok) return { img: '', title: '' }
    const html = await r.text()
    const grab = (prop: string) => {
      const m = html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'))
      return m ? m[1].replace(/&amp;/g, '&').trim() : ''
    }
    return { img: grab('og:image'), title: grab('og:title') }
  } catch { return { img: '', title: '' } }
}

async function rapid(q: string): Promise<any[]> {
  const url = `https://${RAPID_HOST}/api/v3/products?keywords=${encodeURIComponent(q)}&page_size=12&target_currency=USD&country=PL&ship_to_country=PL&sort=LAST_VOLUME_DESC`
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000)
    const r = await fetch(url, { headers: { 'x-rapidapi-key': RAPID_KEY, 'x-rapidapi-host': RAPID_HOST }, signal: ctrl.signal })
    clearTimeout(t); if (!r.ok) return []
    const j = await r.json()
    const arr = j?.data?.products?.product || j?.data?.products || j?.products?.product || j?.products || j?.result?.products || []
    return (Array.isArray(arr) ? arr : []).map((p: any) => {
      const usd = parseFloat(p.target_sale_price ?? p.sale_price ?? p.app_sale_price ?? 0) || 0
      const id = String(p.product_id ?? p.productId ?? p.itemId ?? '')
      return { id, title: p.product_title || p.title || '', img: p.product_main_image_url || p.image_url || (p.product_small_image_urls?.string?.[0]) || '', koszt: Math.round(usd * RATE), link: id ? `https://www.aliexpress.com/item/${id}.html` : (p.product_detail_url || '') }
    }).filter((c: any) => c.img && c.id && c.koszt > 0)
  } catch { return [] }
}

async function gpt(messages: any): Promise<any> {
  try {
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { authorization: `Bearer ${OPENAI_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, reasoning_effort: 'low', response_format: { type: 'json_object' }, messages }),
    }, 'bud-source')
    if (!res.ok) return null
    const j = await res.json()
    return JSON.parse(j.choices[0].message.content)
  } catch { return null }
}

// VISION 1: zdjęcie produktu sklepu -> trafna fraza EN + polska nazwa + filtr nie-dropship
async function analyze(ref: string, ogTitle: string): Promise<{ q: string, q2: string, pl: string, reject: boolean } | null> {
  if (!ref) return null
  const content: any[] = [
    { type: 'text', text: `Patrzysz na zdjęcie produktu ze sklepu. Tytuł ze strony: "${ogTitle || '(brak)'}".\nPrzygotuj wyszukiwanie tego produktu na AliExpress. Zwróć JSON:\n{"q":"<2-5 słów po angielsku: KONKRETNY typ produktu + kluczowa cecha widoczna na zdjęciu; BEZ marki/nazwy sklepu>","q2":"<szersza fraza zapasowa 1-3 słowa, ogólny typ>","pl":"<krótka polska nazwa handlowa>","reject":<true gdy to NIE jest fizyczny produkt do dropshippingu: ebook/poradnik/kurs/kupon/karta podarunkowa/usługa/abonament, lub zestaw tak brandowany że nie da się go odtworzyć>}` },
    { type: 'image_url', image_url: { url: ref } },
  ]
  return await gpt([{ role: 'user', content }])
}

// VISION 2: dopasuj kandydata po zdjęciu (relaxed sourcing — sprawdzone)
async function verify(ref: string, cands: any[], name: string): Promise<number> {
  if (!ref || !cands.length) return -1
  const content: any[] = [{ type: 'text', text: `Produkt sklepu: "${name}". Referencja (zdjęcie produktu sklepu):` }, { type: 'image_url', image_url: { url: ref } }, { type: 'text', text: 'Kandydaci z AliExpress (po zdjęciu):' }]
  cands.forEach((c, i) => { content.push({ type: 'text', text: `[${i}] ${c.title}` }); content.push({ type: 'image_url', image_url: { url: c.img } }) })
  content.push({ type: 'text', text: 'SOURCING: wskaż kandydata, który jest TYM SAMYM produktem (ta sama rzecz/typ/funkcja, nadający się jako źródło). Nie musi być identyczna fotka. Wybierz najlepszy. -1 tylko gdy żaden to nie ten produkt. JSON: {"match":<idx|-1>}.' })
  const o = await gpt([{ role: 'user', content }])
  const m = o?.match
  return (typeof m === 'number') ? m : -1
}

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
  let storeId = body.store_id
  const limit = body.limit ?? 8
  if (!storeId && body.domain) {
    const { data: byDom } = await supabase.from('bud_stores').select('id').eq('domain', body.domain).maybeSingle()
    storeId = byDom?.id
  }
  if (!storeId) return new Response(JSON.stringify({ error: 'brak_store_id' }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } })

  const { data: store, error: se } = await supabase.from('bud_stores').select('id,name,assortment').eq('id', storeId).single()
  if (se || !store) return new Response(JSON.stringify({ error: 'sklep_nieznaleziony' }), { status: 404, headers: { ...cors, 'content-type': 'application/json' } })

  const { data: existing } = await supabase.from('bud_store_products').select('source_link').eq('store_id', storeId)
  const done = new Set((existing || []).map((r: any) => r.source_link))
  const norm = (u: string) => { try { const x = new URL(u); return x.origin + x.pathname } catch { return u } }
  const seen = new Set<string>()
  const todo = (store.assortment || [])
    .map((p: any) => ({ ...p, link: norm(p.link || '') }))
    .filter((p: any) => p.link && !done.has(p.link) && !seen.has(p.link) && (seen.add(p.link), true))  // dedup po znormalizowanym linku
    .slice(0, limit)
  if (!todo.length) return new Response(JSON.stringify({ ok: true, sourced: 0, matched: 0, note: 'brak nowych produktów do sourcingu' }), { headers: { ...cors, 'content-type': 'application/json' } })

  const rows = await pool(todo, 6, async (item: any) => {
    const meta = await fetchMeta(item.link)
    const ref = meta.img || item.img || ''
    const seed = meta.title || item.title || ''
    const row: any = { store_id: storeId, source_title: item.title || seed, source_link: item.link, source_img: ref, match_status: 'no_match', review_status: 'pending' }
    if (!ref) { row.pl_name = seed; return row }

    const a = await analyze(ref, seed)
    row.pl_name = a?.pl || seed
    row.query = a?.q || slugWords(item.link) || seed
    if (a?.reject) return row  // nie-dropship -> no_match

    let cands = await rapid(row.query)
    if (cands.length < 5 && a?.q2) { const more = await rapid(a.q2); const seen = new Set(cands.map(c => c.id)); cands = cands.concat(more.filter(c => !seen.has(c.id))) }
    cands = cands.filter((c: any) => c.koszt >= BAND_MIN && c.koszt <= BAND_MAX).slice(0, 10)
    if (!cands.length) return row

    const mi = await verify(ref, cands, row.pl_name)
    if (mi >= 0 && mi < cands.length) {
      const c = cands[mi]
      Object.assign(row, { match_status: 'matched', ali_id: c.id, ali_title: c.title, ali_img: c.img, ali_cost_pln: c.koszt, ali_retail_pln: Math.round(c.koszt * MARKUP), ali_link: c.link })
    }
    return row
  })

  const { error: ue } = await supabase.from('bud_store_products').upsert(rows, { onConflict: 'store_id,source_link' })
  if (ue) return new Response(JSON.stringify({ error: ue.message, stage: 'upsert' }), { status: 500, headers: { ...cors, 'content-type': 'application/json' } })

  // odśwież statystyki sklepu
  const { count: total } = await supabase.from('bud_store_products').select('id', { count: 'exact', head: true }).eq('store_id', storeId)
  const { count: matched } = await supabase.from('bud_store_products').select('id', { count: 'exact', head: true }).eq('store_id', storeId).eq('match_status', 'matched')
  await supabase.from('bud_stores').update({ sourced_count: total ?? 0, matched_count: matched ?? 0, last_sourced_at: new Date().toISOString(), status: 'active' }).eq('id', storeId)

  const matchedNow = rows.filter((r: any) => r.match_status === 'matched').length
  const resp: any = { ok: true, sourced: rows.length, matched: matchedNow, total_sourced: total, total_matched: matched }
  if (body.debug) resp.items = rows.map((r: any) => ({ pl: r.pl_name, q: r.query, status: r.match_status, ali: r.ali_title, koszt: r.ali_cost_pln, detal: r.ali_retail_pln, link: r.ali_link }))
  return new Response(JSON.stringify(resp), { headers: { ...cors, 'content-type': 'application/json' } })
})
