// wf2-platform — adapter API platformy e-commerce (Trevio / sklepy.niedzwiecki.ai).
// JEDYNE miejsce w systemie znające API platformy (plan §API platformy, WORKFLOW-V2-PLAN.md).
// Klucz partnera = edge secret `ecom_platform_API`, doklejany jako X-Api-Key.
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (autoryzacja w środku: adminGate/team lub x-wf2-secret == WF2_GEN_SECRET).
//
// AKCJE TYPOWANE (2026-07-18; pełna referencja API: docs/zbuduje/platforma-api/README.md):
//   stores            {}                                        → lista sklepów partnera
//   pages             { shop_id }                               → strony sklepu
//   publish_landing   { shop_id, path, html, name? }            → ensure page + PUT html (isHtml:true); path:'' = strona główna
//   unpublish_landing { shop_id, path }                         → isHtml:false (wraca do sekcji; HTML zostaje po stronie platformy)
//   products          { shop_id, search?, page?, page_size? }   → produkty z wariantami/checkoutUrl
//   ensure_product    { shop_id, name, price }                  → znajdź po nazwie albo utwórz {name,price}
//   set_checkout_slug { shop_id, product_id, variant_id, slug } → PUT checkout-link (+ świeży odczyt produktu)
//   integrations      { shop_id }                               → stan integracji (pixel/GA4/GTM/…)
//   set_integration   { shop_id, type, config }                 → PUT config (UWAGA: auto-włącza integrację!)
//   toggle_integration{ shop_id, integration_id }               → flip on/off
//   upload_logo       { shop_id, base64 }                       → PUT branding/logo
//   upload_favicon    { shop_id, base64 }                       → PUT branding/favicon
//   domains           { shop_id }                               → domeny + rekordy DNS
//   add_domain        { shop_id, domain }                       → dodaje domenę (+www), zwraca rekordy DNS
//   activate_domain   { shop_id, domain_id }                    → promuje na aktywną
//   orders            { shop_id, from?, to?, page?, page_size? }→ zamówienia (bez PII)
//   delivery          { shop_id }                               → metody dostawy
//   delivery_options  { shop_id }                               → brokerzy (COD-capability)
//   add_delivery      { shop_id, body }                         → POST delivery-methods (pełny body wg API)
//   set_cod_account   { shop_id, broker_id, nrb }               → konto bankowe do pobrań (COD)
//   raw               { method, path, query?, body? }           → tryb diagnostyczny (discovery)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const BASE_URL = 'https://gateway.trevio.pl/partner/v1';
const ALLOWED_ORIGINS = ['https://crm.tomekniedzwiecki.pl', 'https://tn-crm.vercel.app', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wf2-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

let API_KEY = '';

// fetch do platformy z retry na 429 (Retry-After; limit 120 req/min) i 1 retry na 5xx
async function pf(method: string, path: string, opts: { query?: Record<string, unknown>; body?: unknown } = {}): Promise<{ status: number; data: unknown }> {
  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(opts.query || {})) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  const init: RequestInit = { method, headers: { 'X-Api-Key': API_KEY, 'Accept': 'application/json' } };
  if (opts.body !== undefined && method !== 'GET') {
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
    init.body = JSON.stringify(opts.body);
  }
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(url.toString(), init);
    if (r.status === 429 && attempt < 2) {
      const wait = Math.min(parseInt(r.headers.get('Retry-After') || '2', 10) || 2, 15);
      await new Promise((res) => setTimeout(res, wait * 1000));
      continue;
    }
    if (r.status >= 500 && attempt < 1) { await new Promise((res) => setTimeout(res, 1500)); continue; }
    const txt = await r.text();
    const ct = r.headers.get('content-type') || '';
    let data: unknown = txt;
    if (ct.includes('application/json')) { try { data = JSON.parse(txt); } catch { /* zostaje tekst */ } }
    return { status: r.status, data };
  }
}

type Body = { action?: string; [k: string]: unknown };
const s = (v: unknown) => (typeof v === 'string' ? v : '');

// ── akcje złożone ──────────────────────────────────────────────────────────

// ensure page (po path) → PUT html. path '' = strona główna sklepu.
async function publishLanding(shopId: string, path: string, html: string, name?: string) {
  const pagesR = await pf('GET', `/stores/${shopId}/pages`);
  if (pagesR.status !== 200) return { status: pagesR.status, data: { error: 'pages_list_failed', upstream: pagesR.data } };
  const pages = Array.isArray(pagesR.data) ? pagesR.data as Array<{ id: string; path: string; url?: string }> : [];
  let page = pages.find((p) => (p.path || '') === path);
  if (!page) {
    if (path === '') return { status: 404, data: { error: 'home_page_missing', hint: 'sklep bez strony głównej? sprawdź pages' } };
    const created = await pf('POST', `/stores/${shopId}/pages`, { body: { path, name: name || path } });
    if (created.status !== 200) return { status: created.status, data: { error: 'page_create_failed', upstream: created.data } };
    page = created.data as { id: string; path: string; url?: string };
  }
  const put = await pf('PUT', `/stores/${shopId}/pages/${page.id}/html`, { body: { isHtml: true, html } });
  if (put.status !== 200) return { status: put.status, data: { error: 'put_html_failed', upstream: put.data } };
  return { status: 200, data: { page_id: page.id, path, url: page.url || null, bytes: html.length } };
}

async function unpublishLanding(shopId: string, path: string) {
  const pagesR = await pf('GET', `/stores/${shopId}/pages`);
  const pages = Array.isArray(pagesR.data) ? pagesR.data as Array<{ id: string; path: string }> : [];
  const page = pages.find((p) => (p.path || '') === path);
  if (!page) return { status: 404, data: { error: 'page_not_found' } };
  const put = await pf('PUT', `/stores/${shopId}/pages/${page.id}/html`, { body: { isHtml: false, html: '' } });
  return { status: put.status, data: put.data };
}

// znajdź produkt po dokładnej nazwie (Search), inaczej utwórz {name, price}
async function ensureProduct(shopId: string, name: string, price: number) {
  const found = await pf('GET', `/stores/${shopId}/products`, { query: { Search: name, PageSize: 50 } });
  if (found.status === 200) {
    const items = (found.data as { items?: Array<{ id: string; name: string }> })?.items
      || (Array.isArray(found.data) ? found.data as Array<{ id: string; name: string }> : []);
    const hit = items.find((p) => (p.name || '').trim().toLowerCase() === name.trim().toLowerCase());
    if (hit) return { status: 200, data: { id: hit.id, existed: true, product: hit } };
  }
  const created = await pf('POST', `/stores/${shopId}/products`, { body: { name, price } });
  if (created.status !== 200) return { status: created.status, data: { error: 'product_create_failed', upstream: created.data } };
  return { status: 200, data: { id: (created.data as { id?: string })?.id, existed: false, product: created.data } };
}

// PUT checkout-link + świeży odczyt produktu (checkoutUrl materializuje się z opóźnieniem)
async function setCheckoutSlug(shopId: string, productId: string, variantId: string, slug: string) {
  const put = await pf('PUT', `/stores/${shopId}/products/${productId}/variants/${variantId}/checkout-link`, { body: { checkoutSlug: slug } });
  if (put.status !== 200) return { status: put.status, data: { error: 'checkout_link_failed', upstream: put.data } };
  const fresh = await pf('GET', `/stores/${shopId}/products`, { query: { Search: '', PageSize: 100 } });
  let checkoutUrl: string | null = null;
  const items = (fresh.data as { items?: Array<{ id: string; variants?: Array<{ id: string; checkoutUrl?: string }> }> })?.items || [];
  const prod = items.find((p) => p.id === productId);
  const variant = prod?.variants?.find((v) => v.id === variantId);
  checkoutUrl = variant?.checkoutUrl || null;
  return { status: 200, data: { checkoutSlug: slug, checkoutUrl, note: checkoutUrl ? null : 'checkoutUrl zmaterializuje się za kilka minut — składaj z activeDomain: https://<domena>/checkout?p=<slug>' } };
}

// PUT config integracji po TYPIE (API adresuje po integrationId — znajdź po typie)
async function setIntegration(shopId: string, type: string, config: Record<string, unknown>) {
  const list = await pf('GET', `/stores/${shopId}/integrations`);
  if (list.status !== 200) return { status: list.status, data: { error: 'integrations_list_failed', upstream: list.data } };
  const arr = Array.isArray(list.data) ? list.data as Array<{ integrationId: string; type?: string; name?: string }> : [];
  const hit = arr.find((i) => (i.type || i.name || '').toLowerCase() === type.toLowerCase());
  if (!hit) return { status: 404, data: { error: 'integration_type_not_found', available: arr.map((i) => i.type || i.name) } };
  const put = await pf('PUT', `/stores/${shopId}/integrations/${hit.integrationId}`, { body: config });
  return { status: put.status, data: { integrationId: hit.integrationId, type, result: put.data, note: 'PUT z wartością AUTO-WŁĄCZA integrację' } };
}

// ── serwer ─────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c });
  const J = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...c, 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return J({ error: 'metoda_niedozwolona' }, 405);
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const WF2 = Deno.env.get('WF2_GEN_SECRET') || '';
    API_KEY = Deno.env.get('ecom_platform_API') || '';

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const okSecret = !!WF2 && req.headers.get('x-wf2-secret') === WF2;   // pusty sekret NIGDY nie autoryzuje
    if (!okSecret && !(await adminGate(req, supabase))) return J({ error: 'brak_uprawnien' }, 403);
    if (!API_KEY) return J({ error: 'brak_klucza_platformy' }, 500);

    let body: Body;
    try { body = await req.json(); } catch { return J({ error: 'nieprawidlowy_json' }, 400); }
    const action = s(body.action);
    const shopId = s(body.shop_id);
    const needShop = () => { if (!shopId) throw new Error('shop_id_required'); };

    let out: { status: number; data: unknown };
    switch (action) {
      case 'stores': out = await pf('GET', '/stores'); break;
      case 'pages': needShop(); out = await pf('GET', `/stores/${shopId}/pages`); break;
      case 'publish_landing': {
        needShop();
        const html = s(body.html);
        if (!html || html.length < 100) return J({ error: 'html_required' }, 400);
        out = await publishLanding(shopId, s(body.path), html, s(body.name) || undefined);
        break;
      }
      case 'unpublish_landing': needShop(); out = await unpublishLanding(shopId, s(body.path)); break;
      case 'products': needShop(); out = await pf('GET', `/stores/${shopId}/products`, { query: { Search: s(body.search), Page: body.page as number | undefined, PageSize: (body.page_size as number | undefined) ?? 50 } }); break;
      case 'ensure_product': {
        needShop();
        const price = Number(body.price);
        if (!s(body.name) || !(price > 0)) return J({ error: 'name_i_price_required' }, 400);
        out = await ensureProduct(shopId, s(body.name), price);
        break;
      }
      case 'set_checkout_slug': needShop(); out = await setCheckoutSlug(shopId, s(body.product_id), s(body.variant_id), s(body.slug)); break;
      case 'integrations': needShop(); out = await pf('GET', `/stores/${shopId}/integrations`); break;
      case 'set_integration': needShop(); out = await setIntegration(shopId, s(body.type), (body.config || {}) as Record<string, unknown>); break;
      case 'toggle_integration': needShop(); out = await pf('PUT', `/stores/${shopId}/integrations/${s(body.integration_id)}/toggle`); break;
      case 'upload_logo': needShop(); out = await pf('PUT', `/stores/${shopId}/branding/logo`, { body: { data: s(body.base64), fileName: s(body.file_name) || 'logo.png' } }); break;
      case 'upload_favicon': needShop(); out = await pf('PUT', `/stores/${shopId}/branding/favicon`, { body: { data: s(body.base64), fileName: s(body.file_name) || 'favicon.png' } }); break;
      case 'domains': needShop(); out = await pf('GET', `/stores/${shopId}/domains`); break;
      case 'add_domain': needShop(); out = await pf('POST', `/stores/${shopId}/domains`, { body: { domain: s(body.domain) } }); break;
      case 'activate_domain': needShop(); out = await pf('POST', `/stores/${shopId}/domains/${s(body.domain_id)}/activate`); break;
      case 'orders': needShop(); out = await pf('GET', `/stores/${shopId}/orders`, { query: { From: s(body.from), To: s(body.to), Page: body.page as number | undefined, PageSize: (body.page_size as number | undefined) ?? 50 } }); break;
      case 'delivery': needShop(); out = await pf('GET', `/stores/${shopId}/delivery-methods`); break;
      case 'delivery_options': needShop(); out = await pf('GET', `/stores/${shopId}/delivery-methods/options`); break;
      case 'add_delivery': needShop(); out = await pf('POST', `/stores/${shopId}/delivery-methods`, { body: body.body }); break;
      case 'set_cod_account': needShop(); out = await pf('PUT', `/stores/${shopId}/delivery-brokers/${s(body.broker_id)}/cod-bank-account`, { body: { codBankAccount: s(body.nrb) } }); break;
      case 'set_delivery_order': needShop(); out = await pf('PUT', `/stores/${shopId}/delivery-methods/order`, { body: { items: body.items } }); break;
      case 'raw': {
        const method = String(body.method || 'GET').toUpperCase();
        const path = s(body.path);
        if (!ALLOWED_METHODS.includes(method) || !path.startsWith('/') || path.includes('..') || /^\/\//.test(path)) return J({ error: 'nieprawidlowe_wywolanie' }, 400);
        out = await pf(method, path, { query: (body.query || {}) as Record<string, unknown>, body: body.body });
        break;
      }
      default:
        return J({ error: 'nieznana_akcja', allowed: ['stores','pages','publish_landing','unpublish_landing','products','ensure_product','set_checkout_slug','integrations','set_integration','toggle_integration','upload_logo','upload_favicon','domains','add_domain','activate_domain','orders','delivery','delivery_options','add_delivery','set_cod_account','set_delivery_order','raw'] }, 400);
    }
    return J({ status: out.status, data: out.data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'shop_id_required') return J({ error: 'shop_id_required' }, 400);
    console.error('[wf2-platform] ERROR:', e);
    return J({ error: 'blad_serwera' }, 500);
  }
});
