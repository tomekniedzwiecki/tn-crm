// TikTok TREND RADAR (ScrapeCreators) — feed trendów: Top Ads (po CTR/lajkach) + wiralowe filmy
// z hashtagów (po odtworzeniach). Zwraca produkty-trendy z metryką zaangażowania.
// Admin-gated. (Sourcing na AliExpress = osobny krok.)
// DECYZJA Tomka 2026-07-16: tryb 'products' domyślnie (requireShop=true) pobiera WYŁĄCZNIE produkty
// obecne w TikTok Shop (mają shop_product_url) — dowód sprzedaży + packshoty do dopasowań Ali.
// Filmy bez linku TikTok Shop są odrzucane PRZED analizą GPT (oszczędza tokeny). Zwrotka: dropped_no_shop.
import { adminGate } from '../_shared/bud-owner.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { openaiFetchRetry } from '../_shared/openai-fetch.ts'

const SC = Deno.env.get('BUD_SCRAPECREATORS_API_KEY') || ''
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const MODEL = Deno.env.get('BUD_PRODUCTS_MODEL') || 'gpt-5.1'
const B = 'https://api.scrapecreators.com'
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' }

// KOSZT RADARU → bud_usage (session_id=null = koszt sourcingu/infrastruktury, NIE per-lead).
// Akumulujemy usage ze WSZYSTKICH wywołań OpenAI w przebiegu i logujemy RAZ na końcu.
let RU = { i: 0, c: 0, o: 0, calls: 0 }
// deno-lint-ignore no-explicit-any
function feedUsage(data: any) { const u = data?.usage; if (u) { RU.i += u.prompt_tokens || 0; RU.c += u.prompt_tokens_details?.cached_tokens || 0; RU.o += u.completion_tokens || 0; RU.calls++ } }
async function flushRadar(supabase: ReturnType<typeof createClient>) {
  if (!RU.calls) return
  const P: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 } }
  const p = P[MODEL] || P['gpt-5.1']
  const cost = (Math.max(0, RU.i - RU.c) * p.i + RU.c * p.c + RU.o * p.o) / 1_000_000
  const snap = { ...RU }; RU = { i: 0, c: 0, o: 0, calls: 0 }
  try { await supabase.from('bud_usage').insert({ session_id: null, kind: 'radar', model: MODEL, input_tokens: snap.i, cached_tokens: snap.c, output_tokens: snap.o, cost_usd: cost, meta: { from: 'bud-tt-trends', calls: snap.calls } }) } catch (e) { console.error('[bud-tt-trends] usage', e) }
}

// Zestaw dzienny wg strategii: shopping + niszowe + problemowe (nie tylko przekopany tiktokmademebuyit)
const DEFAULT_TAGS = ['tiktokmademebuyit', 'amazonfinds', 'tiktokshopfinds', 'thingsyoudidntknowyouneeded', 'problemsolvingproducts', 'viralfinds', 'homegadgets', 'kitchengadgets', 'cleaningtok', 'petfinds', 'travelmusthaves', 'cargadgets', 'coolgadgets', 'homefinds', 'usefulproducts']
// Pełnotekstowe frazy (TikTok jak wyszukiwarka nieoczywistych produktów)
const DEFAULT_PHRASES = ['things you didnt know you needed', 'products that solve everyday problems', 'useful gadgets for home', 'products that make life easier', 'small apartment must haves']

async function pool<T, R>(items: T[], n: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length) as any; let idx = 0
  async function w() { while (idx < items.length) { const i = idx++; out[i] = await fn(items[i], i) } }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, w)); return out
}

// GPT: z opisów filmów wyłuskaj POJEDYNCZY fizyczny produkt + kategorię; odsiej kompilacje/kursy/clickbait
const TT_CATS = ['Dom & Kuchnia', 'Sprzątanie', 'Auto', 'Tech & Gadżety', 'Zdrowie & Uroda', 'Zwierzęta', 'Dzieci & Zabawki', 'Sport & Outdoor', 'Ogród & Majsterkowanie', 'Moda & Akcesoria', 'Podróże', 'Hobby & Kreatywne', 'Biuro & Organizacja', 'Inne']

// ── SEZONOWOŚĆ ── walidacja klasyfikacji z GPT (okno SPRZEDAŻOWE 'MM-DD'; złe/niepewne → all_year).
const MMDD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
// deno-lint-ignore no-explicit-any
function normSeason(it: any): { season_type: string; season_label: string | null; sell_from: string | null; sell_to: string | null } {
  const rawLabel = (typeof it?.season_label === 'string' && it.season_label.trim()) ? it.season_label.trim().slice(0, 40) : ''
  if (it?.season_type !== 'seasonal') return { season_type: 'all_year', season_label: rawLabel || 'całoroczny', sell_from: null, sell_to: null }
  const from = String(it?.sell_from || '').trim()
  const to = String(it?.sell_to || '').trim()
  if (!MMDD.test(from) || !MMDD.test(to)) return { season_type: 'all_year', season_label: 'całoroczny', sell_from: null, sell_to: null }
  return { season_type: 'seasonal', season_label: rawLabel || 'sezonowy', sell_from: from, sell_to: to }
}

type Extracted = { is_product: boolean, pl: string, q: string, category: string, season_type: string, season_label: string | null, sell_from: string | null, sell_to: string | null }
async function extractProducts(descs: string[]): Promise<Extracted[]> {
  const fb = (): Extracted => ({ is_product: false, pl: '', q: '', category: 'Inne', season_type: 'all_year', season_label: 'całoroczny', sell_from: null, sell_to: null })
  const list = descs.map((d, i) => `${i}. ${d.replace(/\s+/g, ' ').slice(0, 160)}`).join('\n')
  try {
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { authorization: `Bearer ${OPENAI_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, reasoning_effort: 'low', response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: `Z każdego opisu filmu TikTok (#tiktokmademebuyit itp.) wyłuskaj JEDEN konkretny fizyczny produkt.\nZwróć JSON {"items":[{"is_product":bool,"pl":"krótka polska nazwa handlowa","q":"2-4 słowa EN do wyszukania na AliExpress (generyczny typ produktu)","category":"<jedna z: ${TT_CATS.join(' / ')}>","season_type":"all_year|seasonal","season_label":"<PL etykieta, np. lato/zima/grill/święta/Halloween/całoroczny>","sell_from":"MM-DD|null","sell_to":"MM-DD|null"}]} w TEJ SAMEJ kolejności i liczbie.\nis_product=false gdy: kompilacja wielu produktów ("that last one", "who is buying the first one", "3 things"), film o dropshippingu/kursie/zarabianiu, sama lista hashtagów bez produktu, clickbait bez konkretu, usługa/aplikacja/treść cyfrowa, JEDZENIE/napój/suplement do spożycia, produkt czysto brandowany (konkretna marka nie do odtworzenia), ODZIEŻ lub etui do telefonu.\nSEZONOWOŚĆ: season_type="seasonal" tylko gdy sprzedaż WYRAŹNIE zależy od pory roku/okazji; inaczej "all_year". sell_from/sell_to = okno SPRZEDAŻOWE "MM-DD" (start ~4-6 tyg. PRZED sezonem, koniec ~2-3 tyg. PRZED końcem; wrap-around dozwolony); dla all_year → null. Przykłady: lato 04-15→08-05, grill 03-15→08-15, zima 09-15→01-31, święta 10-15→12-18, Halloween 09-01→10-25. Wątpliwe → all_year (null).\nOpisy:\n${list}` }],
      }),
    }, 'tt-extract')
    if (!res.ok) return descs.map(fb)
    const j = await res.json()
    feedUsage(j)
    const items = JSON.parse(j.choices[0].message.content).items || []
    // deno-lint-ignore no-explicit-any
    return items.map((it: any) => ({ is_product: !!it?.is_product, pl: String(it?.pl || ''), q: String(it?.q || ''), category: it?.category || 'Inne', ...normSeason(it) }))
  } catch { return descs.map(fb) }
}

async function scGet(url: string): Promise<any> {
  try { const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 22000); const r = await fetch(url, { headers: { 'x-api-key': SC }, signal: ctrl.signal }); clearTimeout(t); if (!r.ok) return null; return await r.json() } catch { return null }
}

// Top Ads (Creative Center) — browse US, sort po CTR; paginacja cursorem
async function topAds(period: number, pages: number, order: string): Promise<any[]> {
  const out: any[] = []; let cursor = 0
  for (let p = 0; p < pages; p++) {
    const cur = cursor > 0 ? `&cursor=${cursor}` : ''   // cursor=0 = invalid_parameter
    const j = await scGet(`${B}/v1/tiktok/ad-library/search?region=US&period=${period}&order_by=${order}${cur}`)
    const ads = j?.ads || []
    for (const a of ads) out.push({
      kind: 'ad', seed: a.ad_title || '', brand: a.brand_name || '', ctr: a.ctr || 0, like: a.like || 0,
      cover: a.video_info?.cover || '', id: a.id, industry: a.industry_key || '',
      video: a.video_info?.video_url?.['720p'] || a.video_info?.video_url?.['480p'] || Object.values(a.video_info?.video_url || {})[0] || '',
    })
    if (!j?.has_more) break
    cursor = j.cursor || (cursor + ads.length)
  }
  return out
}

// WZMOCNIONE łapanie linku TikTok Shop: sprawdź KAŻDE dostępne pole surowej odpowiedzi aweme,
// nie tylko a.shop_product_url (SC bywa niekonsekwentne: products_info / anchors / added_sound_music_info).
// deno-lint-ignore no-explicit-any
function extractShop(a: any): string {
  if (typeof a?.shop_product_url === 'string' && a.shop_product_url) return a.shop_product_url
  // products_info: tablica lub obiekt z linkiem produktu w TikTok Shop
  const pi = a?.products_info
  const piArr = Array.isArray(pi) ? pi : (pi && typeof pi === 'object' ? [pi] : [])
  for (const p of piArr) {
    const u = p?.product_url || p?.shop_product_url || p?.detail_url || p?.url || p?.web_url || p?.schema_url
    if (typeof u === 'string' && u) return u
  }
  // anchors: karty produktowe pod filmem (typ TikTok Shop) — link bywa w url/schema/keyword lub w polu extra (JSON string)
  const anchors = a?.anchors || a?.anchor_info || a?.commerce_info?.anchors
  const anArr = Array.isArray(anchors) ? anchors : (anchors && typeof anchors === 'object' ? [anchors] : [])
  for (const an of anArr) {
    const direct = an?.url || an?.web_url || an?.schema || an?.schema_url
    if (typeof direct === 'string' && /(product|item|shop|tiktok)/i.test(direct)) return direct
    const extra = an?.extra
    if (typeof extra === 'string') {
      const m = extra.match(/https?:\/\/[^"\\ ]*(?:product|item|shop)[^"\\ ]*/i)
      if (m) return m[0]
    }
  }
  return ''
}

// Wiralowe filmy organiczne po hashtagu — po odtworzeniach
async function viral(hashtag: string, pages: number): Promise<any[]> {
  const out: any[] = []; let cursor = 0
  for (let p = 0; p < pages; p++) {
    const cur = cursor > 0 ? `&cursor=${cursor}` : ''
    const j = await scGet(`${B}/v1/tiktok/search/keyword?query=${encodeURIComponent(hashtag)}${cur}`)
    const items = j?.search_item_list || []
    for (const it of items) {
      const a = it.aweme_info; if (!a) continue
      const st = a.statistics || {}
      out.push({
        kind: 'organic', tag: hashtag, seed: a.desc || '', plays: st.play_count || 0,
        diggs: st.digg_count || 0, shares: st.share_count || 0, comments: st.comment_count || 0, saves: st.collect_count || 0,
        created: a.create_time || 0,
        cover: a.video?.cover || a.video?.origin_cover || '', originCover: a.video?.origin_cover || '',
        author: a.author?.unique_id || '', authorNick: a.author?.nickname || '', followers: a.author?.follower_count || 0,
        isAd: !!(a.is_ad || a.has_ever_advertised),
        id: a.aweme_id || '',
        url: a.author?.unique_id && a.aweme_id ? `https://www.tiktok.com/@${a.author.unique_id}/video/${a.aweme_id}` : '',
        shop: extractShop(a),
      })
    }
    if (!j?.has_more) break
    cursor = j.cursor || (cursor + items.length)
  }
  return out
}

// ── AliExpress sourcing (ten sam silnik co bud-store-source) ──
const RAPID_KEY = Deno.env.get('BUD_ALIEXPRESS_RAPIDAPI_KEY') || ''
const RAPID_HOST = 'aliexpress-true-api.p.rapidapi.com'
const RATE = 4, MARKUP = 2.7, BAND_MIN = 8, BAND_MAX = 400
async function rapid(q: string): Promise<any[]> {
  const url = `https://${RAPID_HOST}/api/v3/products?keywords=${encodeURIComponent(q)}&page_size=8&target_currency=USD&country=PL&ship_to_country=PL&sort=LAST_VOLUME_DESC`
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000)
    const r = await fetch(url, { headers: { 'x-rapidapi-key': RAPID_KEY, 'x-rapidapi-host': RAPID_HOST }, signal: ctrl.signal }); clearTimeout(t)
    if (!r.ok) return []
    const j = await r.json()
    const arr = j?.data?.products?.product || j?.data?.products || j?.products?.product || j?.products || []
    return (Array.isArray(arr) ? arr : []).map((p: any) => {
      const usd = parseFloat(p.target_sale_price ?? p.sale_price ?? p.app_sale_price ?? 0) || 0
      const id = String(p.product_id ?? p.productId ?? '')
      return { id, title: p.product_title || '', img: p.product_main_image_url || (p.product_small_image_urls?.string?.[0]) || '', koszt: Math.round(usd * RATE), link: id ? `https://www.aliexpress.com/item/${id}.html` : '' }
    }).filter((c: any) => c.img && c.id && c.koszt > 0)
  } catch { return [] }
}
async function gptJson(content: any, label: string): Promise<any> {
  try {
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { authorization: `Bearer ${OPENAI_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: MODEL, reasoning_effort: 'low', response_format: { type: 'json_object' }, messages: [{ role: 'user', content }] }) }, label)
    if (!res.ok) return null
    const j = await res.json()
    feedUsage(j)
    return JSON.parse(j.choices[0].message.content)
  } catch { return null }
}
const imgParts = (urls: string[]) => urls.filter(Boolean).map(u => ({ type: 'image_url', image_url: { url: u } }))

// VISION 1: z KADRU(ów) + opisu zbuduj precyzyjną frazę do AliExpress (nie z samego tekstu)
async function analyzeVision(refs: string[], desc: string): Promise<{ q: string, q2: string, pl: string } | null> {
  if (!refs.filter(Boolean).length) return null
  const content: any[] = [
    { type: 'text', text: `Film TikTok promuje JEDEN produkt. Opis: "${(desc || '').slice(0, 160)}".\nPatrząc na KADR(y) z filmu, podaj frazy do AliExpress opisujące DOKŁADNIE ten produkt (typ + widoczne cechy: kształt, sposób montażu, funkcja, liczba elementów).\nJSON: {"q":"<3-6 słów EN, konkretnie — nie ogólnik>","q2":"<szersza fraza 2-3 słowa, ogólny typ>","pl":"<krótka polska nazwa>"}` },
    ...imgParts(refs),
  ]
  return await gptJson(content, 'tt-analyze')
}

// VISION 2: rygorystyczna weryfikacja po kadrach + kontekście opisu (BEZ fallbacku poza tą funkcją)
async function visionVerify(refs: string[], cands: any[], name: string, desc: string): Promise<number> {
  if (!refs.filter(Boolean).length || !cands.length) return -1
  const content: any[] = [
    { type: 'text', text: `Produkt z TikTok: "${name}". Opis filmu: "${(desc || '').slice(0, 140)}". Referencja — kadr(y) z filmu:` },
    ...imgParts(refs),
    { type: 'text', text: 'Kandydaci z AliExpress (po zdjęciu):' },
  ]
  cands.forEach((c, i) => { content.push({ type: 'text', text: `[${i}] ${c.title}` }); content.push({ type: 'image_url', image_url: { url: c.img } }) })
  content.push({ type: 'text', text: 'Wskaż kandydata, który jest TYM SAMYM produktem (ta sama rzecz / typ / funkcja, nadający się jako źródło tego z filmu). Nie musi być identyczna fotka ani ten sam kolor. Wybierz najlepszy. -1 TYLKO gdy żaden to nie ten produkt. JSON: {"match":<idx|-1>}.' })
  const o = await gptJson(content, 'tt-verify')
  const m = o?.match
  return typeof m === 'number' ? m : -1
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return new Response(JSON.stringify({ error: 'wymagane_logowanie_admin' }), { status: 403, headers: { ...cors, 'content-type': 'application/json' } })

  RU = { i: 0, c: 0, o: 0, calls: 0 }   // reset akumulatora kosztu na przebieg

  const body = await req.json().catch(() => ({}))

  // DEBUG: zrzut surowej struktury aweme dla hashtagu — szukamy pól produktowych (anchors/commerce/shop)
  if (body.raw) {
    const j = await scGet(`${B}/v1/tiktok/search/keyword?query=${encodeURIComponent(body.raw)}`)
    const items = j?.search_item_list || []
    const a0 = items[0]?.aweme_info || {}
    const probe = items.slice(0, 8).map((it: any) => {
      const a = it.aweme_info || {}
      return {
        desc: (a.desc || '').slice(0, 50),
        stats: a.statistics || null,                                   // play/digg/comment/share/collect/...
        author: a.author ? { uid: a.author.unique_id, nick: a.author.nickname, followers: a.author.follower_count, verify: a.author.custom_verify || a.author.enterprise_verify_reason } : null,
        is_ad: a.is_ad, has_ever_advertised: a.has_ever_advertised,
        music: a.music ? { title: a.music.title, author: a.music.author } : null,
        video: a.video ? { duration: a.video.duration, ratio: a.video.ratio } : null,
        create_time: a.create_time, region: a.region,
        products_info: a.products_info || null,
        shop_product_url: a.shop_product_url || null,
        anchors: a.anchors || a.anchor_info || null,
        extracted_shop: extractShop(a) || null,   // co realnie wyciąga wzmocniony extractShop()
      }
    })
    return new Response(JSON.stringify({ statKeys: Object.keys(a0.statistics || {}), authorKeys: Object.keys(a0.author || {}), probe }, null, 2), { headers: { ...cors, 'content-type': 'application/json' } })
  }

  // ── TRYB PRODUKTY: hashtagi+frazy → filmy → GPT wyłuskuje produkt → KLASTRY (ile filmów × świeżość × zaangażowanie) ──
  if (body.mode === 'products') {
    const tags = (body.hashtags?.length ? body.hashtags : DEFAULT_TAGS).map((t: string) => t.replace(/^#/, '').toLowerCase())
    const phrases: string[] = body.phrases?.length ? body.phrases : (body.usePhrases === false ? [] : DEFAULT_PHRASES)
    const queries = [...tags, ...phrases]
    const pages = body.pages ?? 2
    const minPlays = body.minPlays ?? 150000
    const limit = body.limit ?? 100
    const NOW = Math.floor(Date.now() / 1000)
    const maxAge = (body.maxAgeDays ?? 60) * 86400   // wyklucz filmy starsze niż N dni (domyślnie 60)
    const cov = (c: any) => typeof c === 'string' ? c : (c?.url_list?.[0]) || ''

    const raw = (await pool(queries, 6, (t: string) => viral(t, pages))).flat()
    const byId = new Map<string, any>()
    for (const v of raw) { if (!v.id) continue; if (!byId.has(v.id) || byId.get(v.id).plays < v.plays) byId.set(v.id, v) }
    let items = [...byId.values()].filter(v =>
      v.plays >= minPlays && (v.seed || '').trim().length >= 8 &&
      v.created && (NOW - v.created) <= maxAge          // ≤60 dni
    ).sort((a, b) => b.plays - a.plays)

    // DECYZJA Tomka 2026-07-16: domyślnie zbieramy TYLKO produkty z TikTok Shop (mają shop link).
    // requireShop=true (default) → odrzuć filmy bez linku TikTok Shop PRZED analizą GPT (oszczędza tokeny
    // i gwarantuje dowód sprzedaży + packshot do dopasowań Ali). Jawne false = stare zachowanie.
    const requireShop = body.requireShop !== false
    let dropped_no_shop = 0
    if (requireShop) {
      const before = items.length
      items = items.filter(v => v.shop)
      dropped_no_shop = before - items.length
    }
    items = items.slice(0, body.scan ?? 280)

    const chunks: any[][] = []
    for (let i = 0; i < items.length; i += 30) chunks.push(items.slice(i, i + 30))
    const cleanedPerChunk = await pool(chunks, 4, (c: any[]) => extractProducts(c.map(x => x.seed)))

    // klaster po produkcie (znormalizowana nazwa pl)
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()
    const cl = new Map<string, any>()
    chunks.forEach((c, k) => c.forEach((it, jdx) => {
      const e = cleanedPerChunk[k]?.[jdx]
      if (!e?.is_product || !e.pl) return
      const key = norm(e.pl)
      if (!key) return
      let g = cl.get(key)
      if (!g) { g = { pl: e.pl, q: e.q, category: e.category || 'Inne', season_type: e.season_type || 'all_year', season_label: e.season_label ?? 'całoroczny', sell_from: e.sell_from ?? null, sell_to: e.sell_to ?? null, videos: 0, plays: 0, maxPlays: 0, comments: 0, diggs: 0, shares: 0, saves: 0, newest: 0, isAd: false, authorNick: '', followers: 0, tags: new Set<string>(), urls: [], shop: '', cover: '', originCover: '', desc: '' }; cl.set(key, g) }
      g.videos++; g.plays += it.plays; g.comments += it.comments || 0; g.diggs += it.diggs || 0; g.shares += it.shares || 0; g.saves += it.saves || 0
      if (it.isAd) g.isAd = true
      if (it.plays > g.maxPlays) { g.maxPlays = it.plays; g.cover = cov(it.cover); g.originCover = cov(it.originCover); g.desc = it.seed; g.authorNick = it.authorNick || it.author; g.followers = it.followers || 0 }
      if ((it.created || 0) > g.newest) g.newest = it.created || 0
      g.tags.add(it.tag); if (it.url && g.urls.length < 3) g.urls.push(it.url); if (!g.shop && it.shop) g.shop = it.shop
    }))

    // wyklucz produkty już w bazie (żeby zwracać tylko NOWE)
    if (body.excludeExisting) {
      // PostgREST tnie pojedyncze zapytanie do 1000 wierszy → przy puli >1000 MUSIMY paginować,
      // inaczej istniejące produkty poza pierwszym 1000 nie są wykluczane i wracają jako „nowe".
      const have = new Set<string>()
      for (let off = 0; ; off += 1000) {
        const { data: ex } = await supabase.from('bud_tt_products').select('key').range(off, off + 999)
        if (!ex?.length) break
        for (const r of ex as any[]) have.add(r.key)
        if (ex.length < 1000) break
      }
      for (const k of [...cl.keys()]) if (have.has(k)) cl.delete(k)
    }

    // heat: powtarzalność (najmocniej) + ZAPISY i komentarze (intencja zakupu) + engagement-rate (jakość) + skala + świeżość + walidacja reklamą
    const heat = (g: any) => {
      const eng = g.plays ? (g.diggs + g.comments + g.shares + g.saves) / g.plays : 0
      const recency = g.newest ? (NOW - g.newest <= 14 * 86400 ? 5 : NOW - g.newest <= 30 * 86400 ? 3 : 1) : 0
      return +(g.videos * 8 + Math.log10(g.saves + 1) * 4 + Math.log10(g.comments + 1) * 2 + Math.min(eng, 0.25) * 40 + Math.log10(g.plays + 1) * 1.5 + recency + (g.isAd ? 2 : 0)).toFixed(2)
    }
    const final = [...cl.values()].map(g => ({ ...g, heat: heat(g), eng_rate: g.plays ? +((g.diggs + g.comments + g.shares + g.saves) / g.plays).toFixed(4) : 0 })).sort((a, b) => b.heat - a.heat).slice(0, limit)
    const days = (ts: number) => ts ? Math.round((NOW - ts) / 86400) : null

    // OPCJONALNIE: znajdź każdy produkt na AliExpress od razu (rapid + vision-weryfikacja po okładce)
    if (body.sourceToAli) {
      const srcN = Math.min(final.length, body.sourceLimit ?? 30)
      await pool(final.slice(0, srcN), 5, async (g: any) => {
        const refs = [g.cover].filter(Boolean)   // tylko główny kadr — dodatkowy URL bywa odrzucany przez OpenAI (400)
        // fraza budowana z OBRAZU+opisu (nie z samego tekstu) + szerszy wariant
        const a = await analyzeVision(refs, g.desc)
        const qs = [...new Set([a?.q, g.q, a?.q2].filter(Boolean))].slice(0, 2)
        const seen = new Set<string>(); let cands: any[] = []
        for (const q of qs) { for (const c of await rapid(q)) { if (!seen.has(c.id)) { seen.add(c.id); cands.push(c) } } }
        cands = cands.filter((c: any) => c.koszt >= BAND_MIN && c.koszt <= BAND_MAX).slice(0, 12)
        if (body.debug) g.aliDbg = { refs: refs.length, q: a?.q || null, q2: a?.q2 || null, qs, cands: cands.length, candTitles: cands.slice(0, 3).map((c: any) => c.title?.slice(0, 30)) }
        if (!cands.length) return
        const mi = await visionVerify(refs, cands, a?.pl || g.pl, g.desc)
        if (body.debug) g.aliDbg.mi = mi
        if (mi >= 0 && mi < cands.length) {   // TYLKO pewne dopasowanie — bez fallbacku
          const c = cands[mi]
          g.ali = { title: c.title, koszt: c.koszt, detal: Math.round(c.koszt * MARKUP), link: c.link, img: c.img, verified: true, q: qs[0] }
        }
      })
    }

    await flushRadar(supabase)   // koszt OpenAI tego przebiegu → bud_usage (kind='radar')
    return new Response(JSON.stringify({
      scanned_videos: items.length, found_products: cl.size, dropped_no_shop, require_shop: requireShop,
      products: final.map(g => ({ pl: g.pl, q: g.q, category: g.category || 'Inne', season_type: g.season_type || 'all_year', season_label: g.season_label ?? 'całoroczny', sell_from: g.sell_from ?? null, sell_to: g.sell_to ?? null, heat: g.heat, videos: g.videos, max_plays: g.maxPlays, total_plays: g.plays, comments: g.comments, saves: g.saves, shares: g.shares, eng_rate: g.eng_rate, is_ad: g.isAd, author: g.authorNick, author_followers: g.followers, newest_days: days(g.newest), tags: [...g.tags].slice(0, 4), tiktok_urls: g.urls, shop_url: g.shop, cover: g.cover, ali: g.ali || null, aliDbg: g.aliDbg || null })),
    }), { headers: { ...cors, 'content-type': 'application/json' } })
  }

  const period = body.period ?? 30
  const adPages = body.adPages ?? 4
  const hashtags: string[] = body.hashtags || ['tiktokmademebuyit', 'tiktokshopfinds', 'amazonfinds', 'coolgadgets']
  const tagPages = body.tagPages ?? 2
  const minPlays = body.minPlays ?? 300000

  const ads = await topAds(period, adPages, body.order || 'ctr')
  const vir = (await Promise.all(hashtags.map(h => viral(h, tagPages)))).flat().filter(v => v.plays >= minPlays)

  // dedup organiczne po id
  const seen = new Set<string>(); const organic: any[] = []
  for (const v of vir.sort((a, b) => b.plays - a.plays)) { if (v.id && seen.has(v.id)) continue; if (v.id) seen.add(v.id); organic.push(v) }

  await flushRadar(supabase)   // koszt OpenAI tego przebiegu → bud_usage (kind='radar')
  return new Response(JSON.stringify({
    ads_total: ads.length, organic_total: organic.length,
    top_ads: ads.sort((a, b) => b.ctr - a.ctr).slice(0, body.limit || 40),
    top_organic: organic.slice(0, body.limit || 40),
  }), { headers: { ...cors, 'content-type': 'application/json' } })
})
