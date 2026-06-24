// bud-ali-snapshot — pobiera i CACHE'uje snapshot aukcji AliExpress dla wybranego
// produktu z lejka /sklep (bud_tt_products.ali_snapshot). Pobieramy RAZ na produkt —
// makiety/landing korzystają z tego bez ponownego pobierania.
// Źródło: aliexpress-true-api (RapidAPI), detail po product_id. Defensywnie na kształt
// odpowiedzi (różne wersje API zwracają inne struktury).
// Snapshot: { title, images[], main_image, specs[{name,value}], variants[], bundle_hint, fetched_at }.
// Gate: x-tools-secret (backend/backfill) LUB istniejąca sesja (front lejka).
// Deploy: --no-verify-jwt.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

// Opinie AliExpress — publiczny endpoint feedback.aliexpress.com (bez auth/CORS z edge;
// omija blokadę DSA UE). Priorytet: opinie ZE ZDJĘCIAMI, 4-5★, z tekstem, bez AIGC.
// deno-lint-ignore no-explicit-any
async function fetchAliReviews(productId: string): Promise<{ stats: any; reviews: any[] }> {
  // deno-lint-ignore no-explicit-any
  const out: any[] = []; let stats: any = null;
  const pull = async (filter: string, pages: number) => {
    for (let page = 1; page <= pages; page++) {
      try {
        const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
        const r = await fetch(`https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${productId}&lang=en_US&country=US&page=${page}&pageSize=20&filter=${filter}&sort=complex_default`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: ctrl.signal });
        clearTimeout(t);
        if (!r.ok) break;
        const j = await r.json().catch(() => null); if (!j) break;
        if (!stats) { const st = j.data?.productEvaluationStatistic || {}; stats = { avg: st.evarageStar ?? null, positivePct: st.evarageStarRage ?? null, numRatings: parseInt(j.displayMessage?.numRatings) || 0 }; }
        // deno-lint-ignore no-explicit-any
        for (const e of (j.data?.evaViewList || []) as any[]) {
          const text = String(e.buyerTranslationFeedback || e.buyerFeedback || '').trim();
          const stars = Math.round((e.buyerEval ?? 0) / 20);
          if (!text || text.length < 12 || stars < 4 || e.aigc) continue;
          out.push({ stars, name: String(e.buyerName || '').slice(0, 24), text: text.slice(0, 320), date: String(e.evaDate || ''), images: Array.isArray(e.images) ? e.images.slice(0, 3) : [] });
        }
        await new Promise((s) => setTimeout(s, 200));
      } catch { break; }
    }
  };
  await pull('withPic', 2);
  if (out.filter((r) => r.images.length).length < 4) await pull('all', 2);
  const seen = new Set<string>();
  const uniq = out.filter((r) => { const k = r.name + '|' + r.text.slice(0, 40); if (seen.has(k)) return false; seen.add(k); return true; });
  uniq.sort((a, b) => ((b.images.length ? 1 : 0) - (a.images.length ? 1 : 0)) || (b.stars - a.stars));
  return { stats, reviews: uniq.slice(0, 12) };
}

// Tłumaczenie opinii na naturalny PL (gpt-5.1, 1 call). Fallback: oryginał.
// deno-lint-ignore no-explicit-any
async function translateReviewsPL(reviews: any[], key: string): Promise<any[]> {
  if (!reviews.length || !key) return reviews.map((r) => ({ ...r, text_pl: r.text }));
  try {
    const payload = reviews.map((r, i) => ({ i, t: r.text }));
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5.1', reasoning_effort: 'low', response_format: { type: 'json_object' }, messages: [{ role: 'user', content: `Przetłumacz te opinie klientów na naturalny, potoczny polski (zachowaj sens i ton, zwięźle, bez upiększania i bez dodawania treści). Zwróć WYŁĄCZNIE JSON {"t":[{"i":0,"pl":"..."}]} w tej samej kolejności.\n${JSON.stringify(payload)}` }] }),
    }, 'reviews-translate');
    const d = await res.json();
    // deno-lint-ignore no-explicit-any
    const arr = (JSON.parse(d.choices?.[0]?.message?.content || '{}').t || []) as any[];
    const map = new Map(arr.map((x) => [x.i, x.pl]));
    return reviews.map((r, i) => ({ ...r, text_pl: String(map.get(i) || r.text) }));
  } catch { return reviews.map((r) => ({ ...r, text_pl: r.text })); }
}

const ALLOWED = ['https://tomekniedzwiecki.pl', 'https://www.tomekniedzwiecki.pl', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'];
function cors(o: string | null): Record<string, string> {
  const origin = o && ALLOWED.includes(o) ? o : ALLOWED[0];
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tools-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}
function json(b: Record<string, unknown>, s: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...c, 'Content-Type': 'application/json' } });
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RAPID_HOST = 'aliexpress-true-api.p.rapidapi.com';

function pid(body: { product_id?: string; link?: string }, chosenLink?: string): string {
  if (body.product_id && /^\d+$/.test(String(body.product_id))) return String(body.product_id);
  for (const u of [body.link, chosenLink]) {
    const m = (u || '').match(/item\/(\d+)\.html/) || (u || '').match(/\/(\d{8,})\b/);
    if (m) return m[1];
  }
  return '';
}

// Wyciąga snapshot z różnych możliwych kształtów odpowiedzi true-api / affiliate API.
// deno-lint-ignore no-explicit-any
function parseSnapshot(raw: any): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw.data ?? raw.result ?? raw.product ?? raw;
  const base = d.ae_item_base_info_dto ?? d.item_base_info ?? d.base_info ?? d;
  const media = d.ae_multimedia_info_dto ?? d.multimedia ?? d.item_multimedia ?? {};
  const props = d.ae_item_properties ?? d.item_properties ?? d.properties ?? {};
  const skuInfo = d.ae_item_sku_info_dtos ?? d.item_sku ?? d.sku_info ?? {};

  const title = String(base.subject ?? base.product_title ?? d.product_title ?? d.subject ?? d.title ?? '').slice(0, 240);

  // galeria: image_urls bywa stringiem rozdzielonym ';' albo tablicą
  let images: string[] = [];
  const imgRaw = media.image_urls ?? media.imageUrls ?? d.product_small_image_urls ?? d.image_urls ?? null;
  if (typeof imgRaw === 'string') images = imgRaw.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean);
  else if (Array.isArray(imgRaw)) images = imgRaw.map((x: any) => String(x)).filter(Boolean);
  else if (imgRaw && Array.isArray(imgRaw.string)) images = imgRaw.string.map((x: any) => String(x)).filter(Boolean);
  const mainImage = String(base.product_main_image_url ?? d.product_main_image_url ?? images[0] ?? '').trim();
  if (mainImage && !images.includes(mainImage)) images.unshift(mainImage);
  images = [...new Set(images.map((u) => u.startsWith('//') ? 'https:' + u : u))].slice(0, 8);

  // specy: lista atrybutów
  let specs: Array<{ name: string; value: string }> = [];
  const pArr = props.ae_item_property ?? props.item_property ?? (Array.isArray(props) ? props : null);
  if (Array.isArray(pArr)) {
    specs = pArr.map((p: any) => ({ name: String(p.attr_name ?? p.name ?? '').slice(0, 60), value: String(p.attr_value ?? p.value ?? '').slice(0, 120) }))
      .filter((s) => s.name && s.value).slice(0, 20);
  }

  // warianty/zestaw — z SKU
  let variants: string[] = [];
  const skuArr = skuInfo.ae_item_sku_info_d_t_o ?? skuInfo.ae_item_sku_info ?? skuInfo.sku ?? (Array.isArray(skuInfo) ? skuInfo : null);
  if (Array.isArray(skuArr)) {
    const set = new Set<string>();
    for (const s of skuArr) {
      const props2 = s.ae_sku_property_dtos?.ae_sku_property ?? s.sku_property ?? [];
      const list = Array.isArray(props2) ? props2 : [];
      for (const sp of list) { const v = String(sp.sku_property_value ?? sp.property_value ?? '').trim(); if (v) set.add(v.slice(0, 60)); }
    }
    variants = [...set].slice(0, 24);
  }

  if (!title && !images.length) return null;
  return { title, images, main_image: mainImage || images[0] || '', specs, variants, fetched_at: new Date().toISOString() };
}

async function rapidGet(path: string, key: string): Promise<any | null> {
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000);
    const r = await fetch(`https://${RAPID_HOST}${path}`, { headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': RAPID_HOST }, signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) { console.warn('[bud-ali-snapshot] HTTP', r.status, path.slice(0, 60)); return null; }
    return await r.json().catch(() => null);
  } catch (e) { console.warn('[bud-ali-snapshot] err', String(e).slice(0, 80)); return null; }
}

// BONUS: prawdziwy detail (specy/warianty/pełna galeria) — jeśli API go ma.
async function tryDetail(id: string, key: string): Promise<Record<string, unknown> | null> {
  for (const p of [
    `/api/v3/product?product_id=${id}&country=PL&target_currency=USD&target_language=PL&ship_to_country=PL`,
    `/api/v3/product/details?product_id=${id}&country=PL&target_currency=USD&ship_to_country=PL`,
  ]) {
    const j = await rapidGet(p, key);
    if (j) { const snap = parseSnapshot(j); if (snap) return snap; }
  }
  return null;
}

// NIEZAWODNY enrichment: endpoint SEARCH (działa w produkcji) → dopasuj po product_id
// → tytuł + galeria miniatur (product_small_image_urls). Gdy brak dopasowania, null.
async function searchEnrich(id: string, queryStr: string, key: string): Promise<{ title: string; images: string[] } | null> {
  if (!queryStr) return null;
  const j = await rapidGet(`/api/v3/products?keywords=${encodeURIComponent(queryStr)}&page_size=30&target_currency=USD&country=PL&ship_to_country=PL&sort=LAST_VOLUME_DESC`, key);
  const arr = j?.data?.products?.product || j?.data?.products || j?.products?.product || j?.products || [];
  const list = Array.isArray(arr) ? arr : [];
  const m = list.find((p: any) => String(p.product_id ?? p.productId ?? '') === id);
  if (!m) return null;
  const title = String(m.product_title || '').slice(0, 240);
  let images: string[] = [];
  const small = m.product_small_image_urls;
  if (small && Array.isArray(small.string)) images = small.string.map((x: any) => String(x));
  else if (Array.isArray(small)) images = small.map((x: any) => String(x));
  if (m.product_main_image_url) images.unshift(String(m.product_main_image_url));
  images = [...new Set(images.map((u) => u.startsWith('//') ? 'https:' + u : u).filter(Boolean))].slice(0, 8);
  return { title, images };
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c });
  if (req.method !== 'POST') return json({ error: 'metoda_niedozwolona' }, 405, c);
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const RAPID_KEY = Deno.env.get('BUD_ALIEXPRESS_RAPIDAPI_KEY') || '';
    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || '';
    const TOOLS = Deno.env.get('BUD_TOOLS_SECRET') || '';
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({})) as { sessionId?: string; productKey?: string; product_id?: string; link?: string; force?: boolean };
    const isBackend = TOOLS && req.headers.get('x-tools-secret') === TOOLS;
    if (!isBackend) {
      const sid = (body.sessionId || '').trim();
      if (!sid || !UUID_RE.test(sid)) return json({ error: 'nieprawidlowa_sesja' }, 400, c);
      const { data: s } = await supabase.from('bud_sessions').select('id').eq('id', sid).maybeSingle();
      if (!s) return json({ error: 'nieprawidlowa_sesja' }, 404, c);
    }

    const productKey = (body.productKey || '').trim();
    if (!productKey) return json({ error: 'brak_produktu' }, 400, c);
    const byId = UUID_RE.test(productKey);

    // wczytaj wiersz produktu (chosen_link + cache + dane do enrichmentu)
    const { data: row } = await supabase.from('bud_tt_products')
      .select('id, key, pl_name, query, chosen_link, ali_candidates, cover, ali_snapshot')
      .eq(byId ? 'id' : 'key', productKey).maybeSingle();
    if (!row) return json({ error: 'produkt_nieznany' }, 404, c);
    if (!body.force && row.ali_snapshot) return json({ snapshot: row.ali_snapshot, cached: true }, 200, c);

    // ustal product_id + obraz produktu, który JUŻ mamy (chosen candidate)
    const cands = Array.isArray(row.ali_candidates) ? row.ali_candidates : [];
    const chosenLink = row.chosen_link || (cands[0] && cands[0].link) || '';
    const chosenCand = cands.find((x: any) => x && x.link === row.chosen_link) || cands[0] || null;
    const haveImg = String((chosenCand && chosenCand.img) || '').trim();
    const id = pid(body, chosenLink);

    // Złóż snapshot best-effort: detail (bonus: specy/warianty) + search-enrich (galeria/tytuł)
    // + obraz/cover, które już mamy. Nigdy nie failujemy twardo — zawsze zapiszemy minimum.
    let detail: Record<string, unknown> | null = null;
    let enr: { title: string; images: string[] } | null = null;
    if (id && RAPID_KEY) {
      detail = await tryDetail(id, RAPID_KEY);
      if (!detail) enr = await searchEnrich(id, row.query || row.pl_name || '', RAPID_KEY);
    }

    const images = [...new Set([
      ...((detail?.images as string[]) || []),
      ...((enr?.images) || []),
      haveImg, row.cover,
    ].map((u) => String(u || '').trim()).filter(Boolean))].slice(0, 8);

    const snapshot = {
      title: String((detail?.title as string) || enr?.title || row.pl_name || '').slice(0, 240),
      images,
      main_image: (detail?.main_image as string) || haveImg || images[0] || '',
      specs: (detail?.specs as unknown[]) || [],
      variants: (detail?.variants as unknown[]) || [],
      product_id: id || null,
      source: detail ? 'detail' : (enr ? 'search' : 'have'),
      fetched_at: new Date().toISOString(),
      // deno-lint-ignore no-explicit-any
      reviews: [] as any[],
      // deno-lint-ignore no-explicit-any
      review_stats: null as any,
    };

    // REALNE OPINIE z AliExpress (priorytet ze zdjęciami) + tłumaczenie PL — wiarygodność.
    if (id) {
      try {
        const rv = await fetchAliReviews(id);
        snapshot.review_stats = rv.stats;
        snapshot.reviews = await translateReviewsPL(rv.reviews, OPENAI_KEY);
      } catch (e) { console.warn('[bud-ali-snapshot] reviews err', String(e).slice(0, 80)); }
    }

    await supabase.from('bud_tt_products').update({ ali_snapshot: snapshot }).eq('id', row.id);
    return json({ snapshot, product_id: id, n_reviews: snapshot.reviews.length }, 200, c);
  } catch (e) {
    console.error('[bud-ali-snapshot] ERROR', e);
    return json({ error: 'blad_serwera' }, 500, c);
  }
});
