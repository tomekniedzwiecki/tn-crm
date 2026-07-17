// bud-ali-snapshot — pobiera i CACHE'uje snapshot aukcji AliExpress dla wybranego
// produktu z lejka /sklep (bud_tt_products.ali_snapshot). Pobieramy RAZ na produkt —
// makiety/landing korzystają z tego bez ponownego pobierania.
// Źródło: aliexpress-true-api (RapidAPI), detail po product_id. Defensywnie na kształt
// odpowiedzi (różne wersje API zwracają inne struktury).
// Snapshot: { title, images[], main_image, specs[{name,value}], variants[], price{sale,original,currency},
//             sku_prices[{v,price}], description, reviews[], review_stats, fetched_at }.
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
        const list = (j.data?.evaViewList || []) as any[];
        if (!list.length) break; // brak kolejnych recenzji — nie marnuj requestów
        for (const e of list) {
          const text = String(e.buyerTranslationFeedback || e.buyerFeedback || '').trim();
          const stars = Math.round((e.buyerEval ?? 0) / 20);
          const imgs = Array.isArray(e.images) ? e.images.slice(0, 4) : [];
          if (e.aigc || stars < 4) continue;
          // Recenzję ZE ZDJĘCIEM trzymamy nawet z krótkim/pustym tekstem — ZDJĘCIE jest dowodem.
          // Tekst wymagany tylko dla recenzji BEZ zdjęcia.
          if (!imgs.length && (!text || text.length < 12)) continue;
          out.push({ stars, name: String(e.buyerName || '').slice(0, 24), text: text.slice(0, 320), date: String(e.evaDate || ''), images: imgs });
        }
        await new Promise((s) => setTimeout(s, 200));
      } catch { break; }
    }
  };
  // KLUCZ: filter=image zwraca TYLKO recenzje ZE ZDJĘCIAMI (withPic NIE filtruje — zwracał wszystko,
  // stąd 1 zdjęcie na 20). 4 strony = do ~80 zdjęciowych dla popularnych produktów.
  await pull('image', 4);
  await pull('all', 2); // uzupełnienie: recenzje tekstowe + statystyki
  const seen = new Set<string>();
  const uniq = out.filter((r) => { const k = r.name + '|' + r.text.slice(0, 40) + '|' + (r.images[0] || ''); if (seen.has(k)) return false; seen.add(k); return true; });
  uniq.sort((a, b) => ((b.images.length ? 1 : 0) - (a.images.length ? 1 : 0)) || (b.stars - a.stars));
  return { stats, reviews: uniq.slice(0, 20) };
}

// Tłumaczenie opinii na naturalny PL (gpt-5.1, 1 call). Fallback: oryginał.
// deno-lint-ignore no-explicit-any
async function translateReviewsPL(reviews: any[], key: string, acc?: { i: number; c: number; o: number }): Promise<any[]> {
  if (!reviews.length || !key) return reviews.map((r) => ({ ...r, text_pl: r.text }));
  try {
    const payload = reviews.map((r, i) => ({ i, t: r.text }));
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { authorization: `Bearer ${openaiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-5.1', reasoning_effort: 'low', response_format: { type: 'json_object' }, messages: [{ role: 'user', content: `Przetłumacz te opinie klientów na naturalny, potoczny polski (zachowaj sens i ton, zwięźle, bez upiększania i bez dodawania treści). Zwróć WYŁĄCZNIE JSON {"t":[{"i":0,"pl":"..."}]} w tej samej kolejności.\n${JSON.stringify(payload)}` }] }),
    }, 'reviews-translate');
    const d = await res.json();
    if (acc && d?.usage) { acc.i += d.usage.prompt_tokens || 0; acc.c += d.usage.prompt_tokens_details?.cached_tokens || 0; acc.o += d.usage.completion_tokens || 0; }
    // deno-lint-ignore no-explicit-any
    const arr = (JSON.parse(d.choices?.[0]?.message?.content || '{}').t || []) as any[];
    const map = new Map(arr.map((x) => [x.i, x.pl]));
    return reviews.map((r, i) => ({ ...r, text_pl: String(map.get(i) || r.text) }));
  } catch { return reviews.map((r) => ({ ...r, text_pl: r.text })); }
}

// Re-host zdjęć opinii do Supabase Storage — CDN AliExpress wygasa (404 = zabity
// social proof na landingu). Bounded (max 10 obrazów/snapshot) + bezpieczne: każdy
// błąd zostawia oryginalny URL, równolegle z krótkim timeoutem.
// deno-lint-ignore no-explicit-any
async function rehostReviewImages(supabase: ReturnType<typeof createClient>, reviews: any[], productId: string): Promise<any[]> {
  const tasks: Array<() => Promise<void>> = [];
  let budget = 10;
  for (const r of reviews) {
    if (!Array.isArray(r.images) || !r.images.length) continue;
    r.images.forEach((url: string, i: number) => {
      if (budget <= 0) return;
      const slot = 10 - budget; budget--;
      tasks.push(async () => {
        try {
          const u = String(url).startsWith('//') ? 'https:' + url : String(url);
          if (!/^https?:\/\//.test(u)) return;
          const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
          const resp = await fetch(u, { signal: ctrl.signal }); clearTimeout(t);
          if (!resp.ok) return;
          const ct = resp.headers.get('content-type') || 'image/jpeg';
          if (!ct.startsWith('image/')) return;
          const buf = new Uint8Array(await resp.arrayBuffer());
          if (buf.byteLength < 500 || buf.byteLength > 3_000_000) return;
          const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg';
          const path = `bud-reviews/${productId}/${slot}-${i}.${ext}`;
          const { error } = await supabase.storage.from('attachments').upload(path, buf, { contentType: ct, upsert: true });
          if (error) { console.warn('[bud-ali-snapshot] rehost upload', error.message); return; }
          const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path);
          if (pub?.publicUrl) r.images[i] = pub.publicUrl;
        } catch { /* zostaw oryginał */ }
      });
    });
  }
  await Promise.allSettled(tasks.map((fn) => fn()));
  return reviews;
}

// Re-host GALERII PRODUKTU do naszego Storage. AliExpress kasuje oferty/CDN (ae-pic wygasa),
// a galeria to GŁÓWNA referencja produktu do makiet/reklam/landingu — MUSI przetrwać u nas
// (req Tomka). Zwraca nową tablicę URL-i (nasze Storage tam, gdzie się udało; oryginał gdy nie).
async function rehostGalleryImages(supabase: ReturnType<typeof createClient>, images: string[], productId: string): Promise<string[]> {
  const out = images.slice(0, 8);
  const tasks = out.map((url, i) => async () => {
    try {
      const s = String(url || '');
      if (!s || /supabase\.co\/storage/.test(s)) return;                  // już u nas → pomiń
      const u = s.startsWith('//') ? 'https:' + s : s;
      if (!/^https?:\/\//.test(u)) return;
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 9000);
      const resp = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SupabaseEdge/1.0)', 'Accept': 'image/*' }, signal: ctrl.signal }); clearTimeout(t);
      if (!resp.ok) return;                                               // 404/wygasł → zostaw oryginał (i tak martwy, ale nie psujemy)
      const ct = (resp.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
      if (!ct.startsWith('image/')) return;
      const buf = new Uint8Array(await resp.arrayBuffer());
      if (buf.byteLength < 500 || buf.byteLength > 5_000_000) return;
      const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : ct.includes('avif') ? 'avif' : 'jpg';
      const path = `bud-products/${productId}/g${i}.${ext}`;
      const { error } = await supabase.storage.from('attachments').upload(path, buf, { contentType: ct, upsert: true });
      if (error) { console.warn('[bud-ali-snapshot] gallery rehost upload', error.message); return; }
      const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path);
      if (pub?.publicUrl) out[i] = pub.publicUrl;
    } catch { /* zostaw oryginał */ }
  });
  await Promise.allSettled(tasks.map((fn) => fn()));
  return out;
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
// Model do dopracowania nazwy produktu — ta sama konwencja co bud-img-verify.
const PRODUCTS_MODEL = Deno.env.get('BUD_PRODUCTS_MODEL') || 'gpt-5.1';

// Dopracowanie polskiej nazwy produktu na podstawie tytułu aukcji AliExpress (EN, keyword-stuffing).
// 1 call OpenAI (BUD_PRODUCTS_MODEL, ten sam klucz/wzorzec co reszta bud-*). Zwraca dopracowaną
// nazwę PL albo null (odrzucona odpowiedź / błąd). NIGDY nie rzuca — dodatkowo owinięte try/catch.
async function refinePlName(title: string, currentName: string, openaiKey: string): Promise<string | null> {
  if (!title || !openaiKey) return null;
  try {
    const sys = `Jesteś specjalistą e-commerce nazywającym produkty po polsku. Dostajesz tytuł aukcji AliExpress (po angielsku, przeładowany słowami kluczowymi i śmieciami) oraz obecną polską nazwę produktu. Zwróć TYLKO dopracowaną polską nazwę produktu — nic więcej, żadnych wyjaśnień.
ZASADY:
- 2–6 słów, naturalna handlowa polszczyzna
- pierwsza litera wielka
- WYTNIJ śmieci: "2026", "New", "Hot Sale", "Free Shipping", "Dropshipping", kody, zbędne wymiary/ilości, listy wariantów
- zachowaj wyróżnik/istotę produktu (to, co go definiuje)
- nazwę marki podaj TYLKO gdy jest tożsamością produktu (np. ZipString, CarPlay); w innym wypadku pomiń markę
- poprawne polskie diakrytyki (ą, ć, ę, ł, ń, ó, ś, ż, ź)
Zwróć samą nazwę: bez cudzysłowów, bez kropki na końcu.`;
    const usr = `Tytuł aukcji AliExpress (EN):\n${String(title).slice(0, 240)}\n\nObecna nazwa PL: ${String(currentName || '(brak)').slice(0, 120)}`;
    const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${openaiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: PRODUCTS_MODEL, reasoning_effort: 'low', messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }] }),
    }, 'name-refine');
    if (!res.ok) { try { await res.body?.cancel(); } catch { /* */ } return null; }
    const d = await res.json();
    let name = String(d.choices?.[0]?.message?.content || '');
    // walidacja/przycięcie: pierwsza linia, bez cudzysłowów/kropki brzegowej, pojedyncze spacje
    name = name.split('\n')[0]
      .replace(/^["'„”«»\s]+/, '')
      .replace(/["'„”«».\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (name.length < 3 || name.length > 80) return null; // odrzuć śmieciową/za długą odpowiedź
    return name;
  } catch { return null; }
}

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
  // aliexpress-true-api /product-info zwraca TABLICĘ [{...}]; błąd = {"No information": "..."}
  const root = Array.isArray(raw) ? raw[0] : raw;
  if (!root || typeof root !== 'object' || root['No information']) return null;
  const d = root.data ?? root.result ?? root.product ?? root;
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
  else if (imgRaw && Array.isArray(imgRaw.product_small_image_url)) images = imgRaw.product_small_image_url.map((x: any) => String(x)).filter(Boolean);
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

  // warianty/zestaw — z SKU (+ ceny per wariant, req Tomka: CAŁY snapshot aukcji)
  let variants: string[] = [];
  const skuPrices: Array<{ v: string; price: number | null }> = [];
  const skuArr = skuInfo.ae_item_sku_info_d_t_o ?? skuInfo.ae_item_sku_info ?? skuInfo.sku ?? (Array.isArray(skuInfo) ? skuInfo : null);
  if (Array.isArray(skuArr)) {
    const set = new Set<string>();
    for (const s of skuArr) {
      const props2 = s.ae_sku_property_dtos?.ae_sku_property ?? s.sku_property ?? [];
      const list = Array.isArray(props2) ? props2 : [];
      const names: string[] = [];
      for (const sp of list) { const v = String(sp.sku_property_value ?? sp.property_value ?? '').trim(); if (v) { set.add(v.slice(0, 60)); names.push(v.slice(0, 60)); } }
      const spRaw = parseFloat(String(s.offer_sale_price ?? s.sku_sale_price ?? s.sku_price ?? s.sale_price ?? ''));
      const sp = Number.isFinite(spRaw) ? spRaw : null; // NIE `|| null` — cena 0 to nie brak ceny
      if (names.length && skuPrices.length < 24) skuPrices.push({ v: names.join(' / '), price: sp });
    }
    variants = [...set].slice(0, 24);
  }

  // CENA (poziom oferty): target_* = w walucie żądania (PLN), fallback surowe pola
  const num = (x: unknown) => { const n = parseFloat(String(x ?? '')); return Number.isFinite(n) ? n : null; };
  // GUARD (review 2026-07-03): Math.min(...[]) = Infinity — gdy wszystkie SKU bez ceny,
  // sale musi być null, nie Infinity (JSON i tak zserializowałby to do null, ale nie ryzykujemy)
  const validSkuPrices = skuPrices.filter((s) => s.price != null).map((s) => s.price as number);
  const sale = num(base.target_sale_price ?? d.target_sale_price ?? base.sale_price ?? d.sale_price ?? base.app_sale_price)
    ?? (validSkuPrices.length ? Math.min(...validSkuPrices) : null);
  const original = num(base.target_original_price ?? d.target_original_price ?? base.original_price ?? d.original_price);
  const currency = String(base.target_sale_price_currency ?? d.target_sale_price_currency ?? base.currency_code ?? d.currency ?? '').trim() || null;
  const price = sale != null ? { sale, original, currency } : null;

  // OPIS aukcji (HTML → tekst) — bywa w detail/mobile_detail/description
  const rawDesc = String(base.detail ?? base.mobile_detail ?? d.detail ?? d.description ?? d.product_description ?? '');
  const description = rawDesc
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().slice(0, 2500);

  if (!title && !images.length) return null;

  // Pola affiliate-detail, których wcześniej nie zbieraliśmy (sonda raw 17.07):
  // wolumen sprzedaży (radar sold-first!), oficjalne wideo, sklep, kategorie.
  const soldVolume = num(d.lastest_volume ?? base.lastest_volume);
  const videoUrl = String(d.product_video_url ?? base.product_video_url ?? '').trim() || null;
  const shop = (d.shop_name || d.shop_url) ? {
    name: String(d.shop_name ?? '').slice(0, 120) || null,
    url: String(d.shop_url ?? '').trim() || null,
  } : null;
  const categories = {
    l1: String(d.first_level_category_name ?? '').slice(0, 80) || null,
    l2: String(d.second_level_category_name ?? '').slice(0, 80) || null,
  };

  return { title, images, main_image: mainImage || images[0] || '', specs, variants, sku_prices: skuPrices, price, description,
    sold_volume: soldVolume, video_url: videoUrl, shop, categories,
    fetched_at: new Date().toISOString() };
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

// Prawdziwy detail aukcji: /api/v3/product-info (WŁAŚCIWY endpoint aliexpress-true-api;
// wcześniejsze /product i /product/details NIE istnieją — stąd 0 snapshotów 'detail').
// Ceny w PLN (target_currency), opis po polsku gdy API tłumaczy (target_language).
async function tryDetail(id: string, key: string): Promise<Record<string, unknown> | null> {
  // UWAGA: target_currency=PLN / target_language=PL zwraca "No information" — API wspiera USD/EN
  const j = await rapidGet(`/api/v3/product-info?product_id=${id}&target_currency=USD&target_language=EN&country=PL&ship_to_country=PL`, key);
  return j ? parseSnapshot(j) : null;
}

// DATAHUB (drugie źródło, 17.07): true-api to warstwa AFILIACYJNA — NIGDY nie zwróci
// specs/description/SKU/wariantów (potwierdzone sondą raw + playground; żaden tier).
// AliExpress DataHub item_detail_3 oddaje: properties.list (specs), description.html,
// sku (warianty+ceny), sales. Ten sam klucz RapidAPI działa po SUBSKRYPCJI DataHub
// na tym samym koncie (rapidapi.com/ecommdatahub/api/aliexpress-datahub, PRO $7.99).
// Brak subskrypcji => 403 => cicho pomijamy (snapshot afiliacyjny zostaje pełnoprawny).
const DATAHUB_HOST = 'aliexpress-datahub.p.rapidapi.com';
async function tryDataHub(id: string, key: string): Promise<{ specs: Array<{ name: string; value: string }>; description: string; variants: string[]; sku_prices: Array<{ v: string; price: number | null }>; sold_volume: number | null } | null> {
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 25000);
    const r = await fetch(`https://${DATAHUB_HOST}/item_detail_3?itemId=${id}&region=PL&currency=USD&locale=en_US`,
      { headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': DATAHUB_HOST }, signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) { console.warn('[datahub]', r.status); return null; }
    const j = await r.json();
    const item = j?.result?.item;
    if (!item) return null;
    const specs = (Array.isArray(item.properties?.list) ? item.properties.list : [])
      .map((p: Record<string, unknown>) => ({ name: String(p.name ?? '').slice(0, 60), value: String(p.value ?? '').slice(0, 120) }))
      .filter((s: { name: string; value: string }) => s.name && s.value).slice(0, 30);
    const rawDesc = String(item.description?.html ?? '');
    const description = rawDesc
      .replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2500);
    const variants: string[] = []; const sku_prices: Array<{ v: string; price: number | null }> = [];
    const skuList = item.sku?.base ?? item.sku?.skus ?? item.sku?.list ?? [];
    const propsDef = item.sku?.props ?? [];
    const valName = (pid: string) => {
      for (const p of (Array.isArray(propsDef) ? propsDef : [])) {
        for (const v of (p?.values || [])) if (String(v.vid) === pid) return String(v.name || '').slice(0, 60);
      }
      return '';
    };
    for (const s of (Array.isArray(skuList) ? skuList : []).slice(0, 24)) {
      const ids = String(s.propMap ?? s.props ?? '').split(';').map((x: string) => x.split(':')[1]).filter(Boolean);
      const names = ids.map(valName).filter(Boolean);
      const label = names.join(' / ') || String(s.skuAttr ?? '').slice(0, 80);
      const priceRaw = parseFloat(String(s.promotionPrice ?? s.price ?? ''));
      if (label) { sku_prices.push({ v: label, price: Number.isFinite(priceRaw) ? priceRaw : null }); for (const n of names) if (!variants.includes(n)) variants.push(n); }
    }
    const soldRaw = parseFloat(String(item.sales ?? ''));
    return { specs, description, variants: variants.slice(0, 24), sku_prices, sold_volume: Number.isFinite(soldRaw) ? soldRaw : null };
  } catch (e) { console.warn('[datahub]', (e as Error).message); return null; }
}

// NIEZAWODNY enrichment: endpoint SEARCH (działa w produkcji) → dopasuj po product_id
// → tytuł + galeria miniatur (product_small_image_urls). Gdy brak dopasowania, null.
async function searchEnrich(id: string, queryStr: string, key: string): Promise<{ title: string; images: string[]; price: { sale: number; original: number | null; currency: string | null } | null } | null> {
  if (!queryStr) return null;
  const j = await rapidGet(`/api/v3/products?keywords=${encodeURIComponent(queryStr)}&page_size=30&target_currency=USD&country=PL&ship_to_country=PL&sort=LAST_VOLUME_DESC`, key);
  const arr = j?.data?.products?.product || j?.products?.product || j?.data?.products || j?.products || [];
  const list = Array.isArray(arr) ? arr : [];
  if (!list.length) return null;
  // Preferuj DOKŁADNY product_id; gdy go nie ma w wynikach (search po słowach kluczowych bywa nietrafny),
  // użyj TOP wyniku (best-seller tej samej kategorii) jako reprezentatywnej galerii — lepsze niż brak zdjęć.
  // deno-lint-ignore no-explicit-any
  const m = list.find((p: any) => String(p.product_id ?? p.productId ?? '') === id) || list[0];
  const title = String(m.product_title || '').slice(0, 240);
  let images: string[] = [];
  const small = m.product_small_image_urls;
  // FIX: realny kształt to product_small_image_urls.product_small_image_url[] (NIE .string)
  if (small && Array.isArray(small.product_small_image_url)) images = small.product_small_image_url.map((x: any) => String(x));
  else if (small && Array.isArray(small.string)) images = small.string.map((x: any) => String(x));
  else if (Array.isArray(small)) images = small.map((x: any) => String(x));
  if (m.product_main_image_url) images.unshift(String(m.product_main_image_url));
  images = [...new Set(images.map((u) => u.startsWith('//') ? 'https:' + u : u).filter(Boolean))].slice(0, 8);
  // cena z wyniku wyszukiwania (fallback, gdy detail padnie) — target_* w USD
  const saleRaw = parseFloat(String(m.target_sale_price ?? m.sale_price ?? m.app_sale_price ?? ''));
  const sale = Number.isFinite(saleRaw) ? saleRaw : null;
  const origRaw = parseFloat(String(m.target_original_price ?? m.original_price ?? ''));
  const original = Number.isFinite(origRaw) ? origRaw : null;
  const price = sale != null ? { sale, original, currency: String(m.target_sale_price_currency ?? 'USD') } : null;
  return images.length ? { title, images, price } : null;
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
    // Admin z panelu /trendy (team_members JWT) — omija wymóg sessionId, żeby przy zatwierdzeniu
    // produktu od razu zbudować snapshot + rehostować galerię do naszego Storage (req Tomka).
    let isAdmin = false;
    try {
      const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const { data: u } = await supabase.auth.getUser(token);
        if (u?.user) {
          const { data: tm } = await supabase.from('team_members').select('user_id').eq('user_id', u.user.id).maybeSingle();
          isAdmin = !!tm;
        }
      }
    } catch { /* */ }
    if (!isBackend && !isAdmin) {
      const sid = (body.sessionId || '').trim();
      if (!sid || !UUID_RE.test(sid)) return json({ error: 'nieprawidlowa_sesja' }, 400, c);
      const { data: s } = await supabase.from('bud_sessions').select('id').eq('id', sid).maybeSingle();
      if (!s) return json({ error: 'nieprawidlowa_sesja' }, 404, c);
    }

    // SONDA RAW (diagnostyka 17.07: puste specs/description/sku — sprawdzamy, czy to API,
    // czy nasze mapowanie): rawProbe:true + product_id → surowa odpowiedź product-info,
    // bez zapisu. Wymaga tej samej autoryzacji co reszta (backend/admin/sesja).
    const rawProbe = (body as Record<string, unknown>).rawProbe === true;
    if (rawProbe) {
      const rid = String(body.product_id || '').trim();
      if (!rid || !RAPID_KEY) return json({ error: 'brak_product_id_lub_klucza' }, 400, c);
      const rawResp = await rapidGet(`/api/v3/product-info?product_id=${rid}&target_currency=USD&target_language=EN&country=PL&ship_to_country=PL`, RAPID_KEY);
      return json({ raw: rawResp }, 200, c);
    }

    const productKey = (body.productKey || '').trim();
    if (!productKey) return json({ error: 'brak_produktu' }, 400, c);
    const byId = UUID_RE.test(productKey);

    // wczytaj wiersz produktu (chosen_link + cache + dane do enrichmentu)
    const { data: row } = await supabase.from('bud_tt_products')
      .select('id, key, pl_name, query, chosen_link, ali_candidates, cover, ali_snapshot, name_refined_at')
      .eq(byId ? 'id' : 'key', productKey).maybeSingle();
    if (!row) return json({ error: 'produkt_nieznany' }, 404, c);

    // ── KUROWANE ZDJĘCIE GŁÓWNE (panel /trendy, tylko admin/backend) ──
    // Admin podaje URL realnego zdjęcia produktu → rehost do Storage → curated_image.
    // To NAJSILNIEJSZA referencja generatora (productRefs daje ją pierwszą) — ratunek,
    // gdy snapshot ma galerię INNEGO produktu (source='search' po padniętym detail).
    const curatedUrl = String((body as Record<string, unknown>).curatedUrl || '').trim();
    const curatedClear = (body as Record<string, unknown>).curatedClear === true;
    if (curatedUrl || curatedClear) {
      if (!isBackend && !isAdmin) return json({ error: 'wymagane_logowanie' }, 403, c);
      if (curatedClear) {
        await supabase.from('bud_tt_products').update({ curated_image: null }).eq('id', row.id);
        return json({ curated_image: null }, 200, c);
      }
      // unikalna ścieżka per zapis (timestamp) — nadpis pod tą samą nazwą serwowałby stare bajty z cache
      const slot = `${pid(body, row.chosen_link) || row.id}/curated-${Date.now()}`;
      const hosted = await rehostGalleryImages(supabase, [curatedUrl], slot);
      const cur = hosted[0] || '';
      if (!cur || !/supabase\.co\/storage/.test(cur)) return json({ error: 'nie_udalo_sie_pobrac' }, 422, c);
      await supabase.from('bud_tt_products').update({ curated_image: cur }).eq('id', row.id);
      return json({ curated_image: cur }, 200, c);
    }

    // ustal product_id + obraz produktu, który JUŻ mamy (chosen candidate)
    const cands = Array.isArray(row.ali_candidates) ? row.ali_candidates : [];
    const chosenLink = row.chosen_link || (cands[0] && cands[0].link) || '';
    const chosenCand = cands.find((x: any) => x && x.link === row.chosen_link) || cands[0] || null;
    const haveImg = String((chosenCand && chosenCand.img) || '').trim();
    const id = pid(body, chosenLink);

    // CACHE: oddaj zapisany snapshot tylko gdy ŚWIEŻY (<14 dni) i dotyczy TEGO product_id.
    // Zmiana linku Ali → inny produkt → odśwież, by opinie/zdjęcia nie pochodziły z innego
    // towaru; stary snapshot (>14 dni) też odświeżamy (CDN opinii wygasa, rating się starzeje).
    if (!body.force && row.ali_snapshot) {
      const snap = row.ali_snapshot as Record<string, unknown>;
      const fetchedAt = Date.parse(String(snap.fetched_at || '')) || 0;
      const fresh = fetchedAt > 0 && (Date.now() - fetchedAt) < 14 * 24 * 60 * 60 * 1000;
      const sameProduct = !id || !snap.product_id || String(snap.product_id) === id;
      if (fresh && sameProduct) {
        // LAZY-MIGRACJA (req Tomka): stare snapshoty mają galerię na surowym AliExpress (ae-pic wygasa).
        // Gdy ktoś sięgnie po taki produkt — rehostuj galerię do naszego Storage w locie i zapisz.
        // Bez refetchu z RapidAPI (za darmo). Dzięki temu biblioteka migruje się przy użyciu.
        try {
          const imgs = Array.isArray(snap.images) ? (snap.images as string[]) : [];
          const hasRaw = imgs.some((u) => /aliexpress|ae-pic|alicdn/i.test(String(u)) && !/supabase\.co\/storage/.test(String(u)));
          if (hasRaw) {
            const rehosted = await rehostGalleryImages(supabase, imgs, id || String(row.id));
            snap.images = rehosted;
            const mi = String(snap.main_image || '');
            if (mi && !/supabase\.co\/storage/.test(mi)) snap.main_image = rehosted[0] || mi;
            await supabase.from('bud_tt_products').update({ ali_snapshot: snap }).eq('id', row.id);
          }
        } catch (e) { console.warn('[bud-ali-snapshot] lazy rehost', String(e).slice(0, 80)); }
        return json({ snapshot: snap, cached: true }, 200, c);
      }
    }

    // Złóż snapshot best-effort: detail (bonus: specy/warianty) + search-enrich (galeria/tytuł)
    // + obraz/cover, które już mamy. Nigdy nie failujemy twardo — zawsze zapiszemy minimum.
    let detail: Record<string, unknown> | null = null;
    let enr: { title: string; images: string[]; price: { sale: number; original: number | null; currency: string | null } | null } | null = null;
    if (id && RAPID_KEY) {
      detail = await tryDetail(id, RAPID_KEY);
      if (!detail) enr = await searchEnrich(id, row.query || row.pl_name || '', RAPID_KEY);
      // DataHub: dociąga specs/opis/SKU, których warstwa afiliacyjna nie ma (patrz tryDataHub).
      if (detail) {
        const dh = await tryDataHub(id, RAPID_KEY);
        if (dh) {
          if (dh.specs.length && !(detail.specs as unknown[])?.length) detail.specs = dh.specs;
          if (dh.description && !String(detail.description || '')) detail.description = dh.description;
          if (dh.variants.length && !(detail.variants as unknown[])?.length) detail.variants = dh.variants;
          if (dh.sku_prices.length && !(detail.sku_prices as unknown[])?.length) detail.sku_prices = dh.sku_prices;
          if (dh.sold_volume != null && (detail as Record<string, unknown>).sold_volume == null) (detail as Record<string, unknown>).sold_volume = dh.sold_volume;
        }
      }
    }

    // Kolejność ma znaczenie (productRefs bierze images[0..] jako referencje generatora):
    // przy fallbacku 'search' galeria bywa INNYM produktem — wtedy PIERWSZE idą pewne kadry
    // (kandydat dopasowany po obrazie + okładka wideo), a wyszukiwarkowa galeria na koniec.
    const images = [...new Set([
      ...((detail?.images as string[]) || []),
      ...(detail ? [] : [haveImg, String(row.cover || '')]),
      ...((enr?.images) || []),
      haveImg, row.cover,
    ].map((u) => String(u || '').trim()).filter(Boolean))].slice(0, 8);

    const snapshot = {
      title: String((detail?.title as string) || enr?.title || row.pl_name || '').slice(0, 240),
      images,
      main_image: (detail?.main_image as string) || haveImg || images[0] || '',
      specs: (detail?.specs as unknown[]) || [],
      variants: (detail?.variants as unknown[]) || [],
      // CAŁY snapshot aukcji (req Tomka 2026-07-03): ceny + warianty z cenami + opis
      price: (detail?.price as Record<string, unknown>) || enr?.price || null,
      sku_prices: (detail?.sku_prices as unknown[]) || [],
      description: String(detail?.description || ''),
      sold_volume: (detail as Record<string, unknown>)?.sold_volume ?? null,
      video_url: (detail as Record<string, unknown>)?.video_url ?? null,
      shop: (detail as Record<string, unknown>)?.shop ?? null,
      categories: (detail as Record<string, unknown>)?.categories ?? null,
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
        const transUsage = { i: 0, c: 0, o: 0 };
        snapshot.reviews = await translateReviewsPL(rv.reviews, OPENAI_KEY, transUsage);
        // KOSZT tłumaczenia opinii (gpt-5.1) → bud_usage. session_id z body (lub null = koszt sourcingu).
        if (transUsage.i || transUsage.o) {
          try {
            const P51 = { i: 1.25, c: 0.125, o: 10 };  // gpt-5.1 per 1M (spójne z bud-gtm/bud-raport)
            const cost = (Math.max(0, transUsage.i - transUsage.c) * P51.i + transUsage.c * P51.c + transUsage.o * P51.o) / 1_000_000;
            const logSid = (body.sessionId && UUID_RE.test(String(body.sessionId).trim())) ? String(body.sessionId).trim() : null;
            await supabase.from('bud_usage').insert({ session_id: logSid, kind: 'ali-snapshot', model: 'gpt-5.1', input_tokens: transUsage.i, cached_tokens: transUsage.c, output_tokens: transUsage.o, cost_usd: cost, meta: { view: 'reviews_translate', product_id: id } });
          } catch (uErr) { console.error('[bud-ali-snapshot] usage insert', uErr); }
        }
        // Re-host zdjęć opinii → Storage (anti-wygasanie CDN Ali). Nigdy nie failuje snapshotu.
        try { snapshot.reviews = await rehostReviewImages(supabase, snapshot.reviews, id); }
        catch (e) { console.warn('[bud-ali-snapshot] rehost err', String(e).slice(0, 80)); }
      } catch (e) { console.warn('[bud-ali-snapshot] reviews err', String(e).slice(0, 80)); }
    }

    // Fallback galerii: gdy RapidAPI nie dało galerii (source 'have' → tylko cover), dołącz zdjęcia
    // z opinii (realny produkt w użyciu, już re-hostowane do Storage) — modal danych produktu ma wtedy co pokazać.
    if (snapshot.images.length < 4 && Array.isArray(snapshot.reviews)) {
      // deno-lint-ignore no-explicit-any
      const revImgs = (snapshot.reviews as any[]).flatMap((r) => (Array.isArray(r.images) ? r.images : [])).filter(Boolean);
      snapshot.images = [...new Set([...snapshot.images, ...revImgs])].slice(0, 8);
    }

    // RE-HOST GALERII PRODUKTU → nasze Storage (req Tomka: zdjęcia zawsze u nas, bo oferty
    // AliExpress/ae-pic znikają). Robimy na SAM KONIEC, po ewentualnym dołączeniu zdjęć z opinii,
    // żeby cała referencja (makiety/reklamy/landing) była trwała. Zdjęcia już z opinii/Storage są pomijane.
    try {
      snapshot.images = await rehostGalleryImages(supabase, snapshot.images as string[], id || String(row.id));
      const mi = String(snapshot.main_image || '');
      if (mi && !/supabase\.co\/storage/.test(mi)) snapshot.main_image = (snapshot.images as string[])[0] || mi;
    } catch (e) { console.warn('[bud-ali-snapshot] gallery rehost', String(e).slice(0, 80)); }

    await supabase.from('bud_tt_products').update({ ali_snapshot: snapshot }).eq('id', row.id);

    // ── DOPRACUJ POLSKĄ NAZWĘ (raz na produkt) ──
    // Po udanym zapisie snapshotu z niepustym title: jeżeli name_refined_at IS NULL → poproś model
    // o naturalną handlową nazwę PL na podstawie tytułu aukcji (EN). KRYTYCZNE: całość w try/catch —
    // błąd dopracowania NIGDY nie wywala głównego flow snapshotu. Odrzucona odpowiedź → zostaw NULL
    // (spróbuje przy kolejnym snapshot-callu), bez błędu.
    let nameRefined = false;
    try {
      const title = String(snapshot.title || '').trim();
      if (!row.name_refined_at && OPENAI_KEY && title) {
        const refined = await refinePlName(title, String(row.pl_name || ''), OPENAI_KEY);
        if (refined) {
          // pl_name aktualizujemy tylko gdy zmiana; name_refined_at ustawiamy zawsze (nie mielić w kółko).
          // key NIE jest ruszany — zmieniamy wyłącznie pl_name.
          const patch: Record<string, unknown> = { name_refined_at: new Date().toISOString() };
          if (refined !== row.pl_name) patch.pl_name = refined;
          await supabase.from('bud_tt_products').update(patch).eq('id', row.id);
          nameRefined = true;
        }
        // refined === null → odrzucone: name_refined_at zostaje NULL, ponowna próba przy kolejnym callu
      }
    } catch (e) { console.warn('[bud-ali-snapshot] name refine', String(e).slice(0, 80)); }

    return json({ snapshot, product_id: id, n_reviews: snapshot.reviews.length, name_refined: nameRefined }, 200, c);
  } catch (e) {
    console.error('[bud-ali-snapshot] ERROR', e);
    return json({ error: 'blad_serwera' }, 500, c);
  }
});
