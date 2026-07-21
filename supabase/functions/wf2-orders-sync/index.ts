// wf2-orders-sync — cron sync zamówień z platformy Trevio → wf2_orders → agregacja wf2_sales.
// SSOT algorytmu: R3 sekcja „(d) SYNC ZAMÓWIEŃ" (dedup po id = dokładny licznik do 1000).
//
// ANALITYKA (2026-07-20): mapOrder deriwuje payments[]/is_paid/paid_at/payment_method (COD 'Pending' = is_paid=false),
// wf2_sales prowadzi równoległą księgę PAID (orders_paid/revenue_paid — semantyka orders/revenue BEZ ZMIAN),
// a osobny blok atrybucji (akcja 'order_attribution', LIMIT 20/projekt/run, budżet deadline) dociąga sesje/źródło
// ruchu do kolumn attribution_* (pełny jsonb MINUS pole identity = PII). Każde zamówienie w try/catch — atrybucja NIGDY nie wywraca synca.
//
// Ścieżka: cron (pg_cron) → ta funkcja → wf2-platform (adapter, akcja 'orders') → API Trevio.
// NIE woła platformy bezpośrednio kluczem API — zawsze PRZEZ wf2-platform (x-wf2-secret == WF2_GEN_SECRET),
// który jest jedynym miejscem znającym X-Api-Key i obsługuje rate-limit 120/min (Retry-After).
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (autoryzacja w środku: x-wf2-secret == WF2_GEN_SECRET lub team JWT/adminGate).
//
// POST body (opcjonalne):
//   {}                     → cron: 10 najstarszych projektów wg orders_synced_at (chunk)
//   { project_id: <uuid> } → ręczny trigger jednego projektu (panel/sesja)
//
// Zwraca: { ok, projects, orders_upserted, unmapped, partial, guard:{domains_activated, pixel_alerts, price_alerts} }
//
// Deadline wewnętrzny 300 s (edge wall-clock 400 s — pamięć: split + deadline 330 s). Chunk: ≤10 projektów/wywołanie;
// jeśli więcej kwalifikujących się → przetwarza 10 najstarszych i zwraca partial:true (kolejny run dobierze resztę).
//
// STRAŻNIK PLATFORMY (autonomia): po syncu, w TYM SAMYM budżecie, dla każdego projektu leci cykliczna kontrola
// (auto-aktywacja zweryfikowanej domeny + audyt pixela + rozjazd cen produktów). Każdy check w try/catch — patrz runGuard().

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const ALLOWED_ORIGINS = ['https://crm.tomekniedzwiecki.pl', 'https://tn-crm.vercel.app', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wf2-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}

const DEADLINE_MS = 300_000;          // wewnętrzny budżet (edge wall-clock 400 s)
const MAX_PROJECTS_PER_RUN = 10;      // chunk: max projektów na wywołanie
const PAGE_SIZE = 200;                // paginacja zamówień z platformy
const MAX_PAGES = 50;                 // bezpiecznik: 50×200 = 10 000 zamówień/projekt/run
const UPSERT_CHUNK = 500;             // wsad upsertów wf2_orders
const READ_PAGE = 1000;              // PostgREST domyślny limit 1000 — czytamy stronami (pamięć)
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
// statusy płatności traktowane jako opłacone (tolerancyjnie, lowercase) — COD 'Pending' NIE jest tu (=is_paid false)
const PAY_SUCCESS = ['paid', 'completed', 'succeeded', 'success', 'settled', 'captured', 'finished', 'done', 'zaplacone', 'oplacone'];

// ── tolerancyjne parsowanie pól (kształt odpowiedzi /orders nieznany dokładnie) ──
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') { const n = parseFloat(v.replace(',', '.')); return Number.isFinite(n) ? n : 0; }
  return 0;
}
// kwoty Trevio są ZAGNIEŻDŻONE: total:{amount,currency}, unitPrice:{amount,currency}
// (potwierdzone na realnym zamówieniu 58088579, 2026-07-18 — CENNIK-PLAN.md §3.2).
// num(obiekt) zwracał 0 → całe revenue/P&L liczyło się na zerach. amt() rozpakowuje.
function amt(v: unknown): number {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if ('amount' in o) return num(o.amount);
    if ('value' in o) return num(o.value);
  }
  return num(v);
}
// normalizacja nazwy do mapowania: trim + lower + zwinięcie wielokrotnych spacji
function normName(s: unknown): string { return str(s).trim().toLowerCase().replace(/\s+/g, ' '); }
// pierwsza niepusta wartość z listy aliasów pola
function pick(o: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) { const v = o[k]; if (v !== undefined && v !== null && v !== '') return v; }
  return undefined;
}
function toBoolOrNull(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') { const l = v.toLowerCase(); if (['true', '1', 'cod', 'pobranie'].includes(l)) return true; if (['false', '0'].includes(l)) return false; }
  return null;
}

// wyciąga tablicę zamówień z rozmaitych kształtów: {items:[…]} | {data:[…]} | {orders:[…]} | goła tablica
function extractOrders(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    for (const k of ['items', 'data', 'orders', 'results', 'records']) if (Array.isArray(o[k])) return o[k] as Record<string, unknown>[];
  }
  return [];
}

type MappedLine = { name: string; price: number; quantity: number; product_id: string | null };
type MappedOrder = { id: string; number: string; order_date: string; value: number; delivery_cost: number; is_cod: boolean | null; payments: Record<string, unknown>[]; is_paid: boolean | null; paid_at: string | null; payment_method: string | null; lines: MappedLine[] };

// mapowanie surowego zamówienia platformy → nasz kształt (braki pól → defaulty, nigdy crash)
function mapOrder(o: Record<string, unknown>): MappedOrder {
  const id = str(pick(o, ['id', 'orderId', 'order_id', 'uuid', 'guid', 'number', 'orderNumber']));
  const number = str(pick(o, ['number', 'orderNumber', 'order_number', 'displayNumber', 'id']));
  const dRaw = pick(o, ['orderDate', 'order_date', 'date', 'createdAt', 'created_at', 'createdDate', 'created', 'placedAt']);
  const parsed = dRaw != null ? new Date(str(dRaw)) : null;
  const order_date = parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
  const value = amt(pick(o, ['value', 'total', 'totalValue', 'totalGross', 'grossValue', 'amount', 'sum', 'price']));
  const delivery_cost = amt(pick(o, ['deliveryCost', 'delivery_cost', 'shippingCost', 'shipping_cost', 'deliveryPrice', 'shipping']));
  let is_cod = toBoolOrNull(pick(o, ['isCashOnDelivery', 'is_cod', 'isCod', 'cod', 'cashOnDelivery', 'paymentMethod']));

  // ── płatności (SHAPES: payments[] {status,type,amount,isCashOnDelivery,isBlik,provider,createdAt}) ──
  const payRaw = pick(o, ['payments']);
  const payments: Record<string, unknown>[] = Array.isArray(payRaw) ? payRaw as Record<string, unknown>[] : [];
  const payStatus = (p: Record<string, unknown>) => str(pick(p, ['status', 'state', 'paymentStatus'])).toLowerCase();
  // metoda: isCashOnDelivery→cod, isBlik→blik, inaczej provider/type/method lowercase
  const payMethod = (p: Record<string, unknown>): string | null => {
    if (toBoolOrNull(pick(p, ['isCashOnDelivery'])) === true) return 'cod';
    if (toBoolOrNull(pick(p, ['isBlik'])) === true) return 'blik';
    return str(pick(p, ['provider', 'type', 'method', 'paymentMethod'])).toLowerCase() || null;
  };
  const successPay = payments.find((p) => PAY_SUCCESS.includes(payStatus(p)));
  // is_paid: NULL gdy brak płatności, true gdy którakolwiek success, inaczej false (COD 'Pending' = false)
  const is_paid: boolean | null = payments.length === 0 ? null : !!successPay;
  let paid_at: string | null = null;
  if (successPay) {
    const pRaw = pick(successPay, ['paidAt', 'paid_at', 'date', 'createdAt']);
    const pd = pRaw != null ? new Date(str(pRaw)) : null;
    paid_at = pd && !isNaN(pd.getTime()) ? pd.toISOString() : null;
  }
  const methodSource = successPay || payments[0];
  const payment_method = methodSource ? payMethod(methodSource) : null;
  // is_cod: OR z payments[].isCashOnDelivery (uzupełnia gdy zamówienie nie miało flagi COD)
  if (payments.some((p) => toBoolOrNull(pick(p, ['isCashOnDelivery'])) === true)) is_cod = true;

  const linesRaw = pick(o, ['products', 'lines', 'items', 'orderLines', 'orderItems', 'positions']);
  const arr = Array.isArray(linesRaw) ? linesRaw as Record<string, unknown>[] : [];
  const lines: MappedLine[] = arr.map((l) => ({
    name: str(pick(l, ['name', 'productName', 'product_name', 'title', 'label'])),
    price: amt(pick(l, ['price', 'unitPrice', 'unit_price', 'grossPrice', 'priceGross', 'value'])),
    quantity: num(pick(l, ['quantity', 'qty', 'count'])) || 1,
    product_id: null,
  }));
  return { id, number, order_date, value, delivery_cost, is_cod, payments, is_paid, paid_at, payment_method, lines };
}

// ── ekstrakcja atrybucji do kolumn (SHAPES: sessions[], primarySession, lastTouch, clickIds) ──
// Sesja primary = sessions.find(sessionId===primarySession.sessionId) || lastTouch. Kształt tolerancyjny.
function extractAttribution(body: Record<string, unknown>): {
  attributed_source: string | null; attribution_entry_path: string | null;
  attribution_campaign: string | null; attribution_click_ids: Record<string, string> | null;
} {
  const primarySession = (body.primarySession && typeof body.primarySession === 'object') ? body.primarySession as Record<string, unknown> : {};
  const primaryId = str(pick(primarySession, ['sessionId', 'id']));
  const sessions = Array.isArray(body.sessions) ? body.sessions as Record<string, unknown>[] : [];
  const lastTouch = (body.lastTouch && typeof body.lastTouch === 'object') ? body.lastTouch as Record<string, unknown> : null;
  const p = sessions.find((s) => str(pick(s, ['sessionId', 'id'])) === primaryId) || lastTouch || {};

  // attributed_source = source/channel (lowercase); fallback summary
  const source = str(pick(p, ['source', 'utmSource', 'trafficSource'])).toLowerCase();
  const channel = str(pick(p, ['channel', 'medium', 'utmMedium'])).toLowerCase();
  let attributed_source: string | null = null;
  if (source && channel) attributed_source = `${source}/${channel}`;
  else if (source || channel) attributed_source = source || channel;
  else { const summary = str(pick(body, ['summary', 'attributedSource'])).toLowerCase(); attributed_source = summary || null; }

  // entry path z landingPage (pełny URL z query); fallback ścieżka jeśli już relatywna
  const landing = str(pick(p, ['landingPage', 'landing_page', 'entryPage', 'entry_page', 'entryUrl']));
  let attribution_entry_path: string | null = null;
  let query: URLSearchParams | null = null;
  if (landing) {
    try { const u = new URL(landing); attribution_entry_path = u.pathname || null; query = u.searchParams; }
    catch { attribution_entry_path = landing.startsWith('/') ? landing.split('?')[0] : null; }
  }

  // campaign: pole utmCampaign sesji/lastTouch, fallback z query entry URL
  let campaign = str(pick(p, ['utmCampaign', 'campaign', 'utm_campaign']));
  if (!campaign && lastTouch) campaign = str(pick(lastTouch, ['utmCampaign', 'campaign']));
  if (!campaign && query) campaign = query.get('utm_campaign') || '';

  // click ids: obiekt clickIds (bez null-i) uzupełniony z query entry URL
  const clickRaw = (body.clickIds && typeof body.clickIds === 'object') ? body.clickIds as Record<string, unknown> : {};
  const click: Record<string, string> = {};
  for (const k of ['gclid', 'fbclid', 'msclkid', 'ttclid', 'trvclid']) { const v = clickRaw[k]; if (v != null && v !== '') click[k] = str(v); }
  if (query) for (const k of ['fbclid', 'gclid', 'ttclid']) { if (!click[k]) { const qv = query.get(k); if (qv) click[k] = qv; } }

  return {
    attributed_source,
    attribution_entry_path,
    attribution_campaign: campaign || null,
    attribution_click_ids: Object.keys(click).length > 0 ? click : null,
  };
}

// wywołanie adaptera platformy (jedyna droga do API Trevio)
// Ping #sparing przez slack-notify (wzorzec 1:1 z bud-ads; nigdy nie wywraca synca).
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) return
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[wf2-orders-sync] slack-notify ${type} HTTP`, res.status)
  } catch (err) {
    console.error(`[wf2-orders-sync] slack-notify ${type} exception:`, err)
  }
}

async function callPlatform(baseUrl: string, wf2: string, payload: Record<string, unknown>): Promise<{ httpOk: boolean; httpStatus: number; env: unknown }> {
  const r = await fetch(`${baseUrl}/functions/v1/wf2-platform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-wf2-secret': wf2 },
    body: JSON.stringify(payload),
  });
  let env: unknown = null;
  try { env = await r.json(); } catch { /* zostaje null */ }
  return { httpOk: r.ok, httpStatus: r.status, env };
}

function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// deno-lint-ignore no-explicit-any
type Supa = any;

// ── synchronizacja jednego projektu ──────────────────────────────────────────
async function syncProject(
  supabase: Supa,
  baseUrl: string,
  wf2: string,
  proj: { id: string; platform_shop_id: string; orders_synced_at: string | null },
  startedAt: number,
): Promise<{ upserted: number; unmapped: number; timedOut: boolean; new_count: number; new_value: number; new_paid_count: number; source_summary: string }> {
  const shopId = proj.platform_shop_id;
  const firstRun = !proj.orders_synced_at;
  // From = coalesce(orders_synced_at, now-30d) - 1d (overlap; dedup po id neutralizuje); To = now.
  const baseFrom = proj.orders_synced_at ? Date.parse(proj.orders_synced_at) : Date.now() - 30 * 86400_000;
  const fromIso = new Date(baseFrom - 86400_000).toISOString();
  const toDate = new Date();
  const toIso = toDate.toISOString();

  // 1) paginacja zamówień z platformy
  const collected: MappedOrder[] = [];
  let loggedDiag = false;
  let timedOut = false;
  for (let page = 1; page <= MAX_PAGES; page++) {
    if (Date.now() - startedAt > DEADLINE_MS) { timedOut = true; break; }
    const { httpOk, httpStatus, env } = await callPlatform(baseUrl, wf2, {
      action: 'orders', shop_id: shopId, from: fromIso, to: toIso, page, page_size: PAGE_SIZE,
    });
    if (!httpOk) { console.error(`[wf2-orders-sync] wf2-platform HTTP ${httpStatus} (projekt ${proj.id}, page ${page})`, env); break; }
    // wf2-platform zwraca kopertę { status, data } — status = kod platformy, data = surowa odpowiedź /orders
    const envelope = (env && typeof env === 'object') ? env as { status?: number; data?: unknown; error?: string } : {};
    if (envelope.error) { console.error(`[wf2-orders-sync] wf2-platform error (projekt ${proj.id})`, envelope.error); break; }
    if (typeof envelope.status === 'number' && envelope.status >= 400) { console.error(`[wf2-orders-sync] platforma /orders ${envelope.status} (projekt ${proj.id})`, envelope.data); break; }
    const rawOrders = extractOrders(envelope.data);
    if (firstRun && !loggedDiag && rawOrders.length > 0) {
      console.log(`[wf2-orders-sync] DIAG pierwsze zamówienie (projekt ${proj.id}, pierwszy przebieg):`, JSON.stringify(rawOrders[0]).slice(0, 1500));
      loggedDiag = true;
    }
    for (const ro of rawOrders) { const m = mapOrder(ro); if (m.id) collected.push(m); }
    if (rawOrders.length < PAGE_SIZE) break;   // ostatnia strona
  }

  // dedup po id w obrębie zebranych (na wypadek overlapu stron) — ostatni wygrywa
  const byId = new Map<string, MappedOrder>();
  for (const m of collected) byId.set(m.id, m);
  const orders = [...byId.values()];

  // 2) mapowanie linii → produkt po znormalizowanej nazwie (platform_name, fallback name) w obrębie projektu
  const { data: products } = await supabase.from('wf2_products').select('id, name, platform_name').eq('project_id', proj.id);
  const nameToProduct = new Map<string, string>();
  for (const p of (products || [])) { const k = normName(p.name); if (k) nameToProduct.set(k, p.id); }             // fallback: name
  for (const p of (products || [])) { const k = normName(p.platform_name); if (k) nameToProduct.set(k, p.id); }   // priorytet: platform_name

  const unmappedNames = new Set<string>();
  const affectedDates = new Set<string>();
  const nowIso = new Date().toISOString();
  const orderRows = orders.map((m) => {
    for (const line of m.lines) {
      const key = normName(line.name);
      const pid = key ? nameToProduct.get(key) : undefined;
      line.product_id = pid ?? null;
      if (!pid && line.name) unmappedNames.add(line.name.trim());
    }
    affectedDates.add(m.order_date.slice(0, 10));   // data UTC (date(order_date) w Postgres = UTC)
    return {
      id: m.id, project_id: proj.id, shop_id: shopId, number: m.number || null,
      order_date: m.order_date, value: m.value, delivery_cost: m.delivery_cost,
      is_cod: m.is_cod, payments: m.payments, is_paid: m.is_paid, paid_at: m.paid_at,
      payment_method: m.payment_method, lines: m.lines, synced_at: nowIso,
      // attribution_* NIE w upsercie — nowe wiersze dostają default 'pending', istniejące zachowują stan
    };
  });

  // 3a) które zamówienia są NOWE (Slack tylko dla realnie nowych, nie dla overlap-update'ów)
  const knownIds = new Set<string>();
  for (let i = 0; i < orderRows.length; i += 200) {
    const part = orderRows.slice(i, i + 200).map((r) => r.id as string);
    const { data: ex } = await supabase.from('wf2_orders').select('id').in('id', part);
    ((ex || []) as { id: string }[]).forEach((e) => knownIds.add(e.id));
  }
  const newRows = orderRows.filter((r) => !knownIds.has(r.id as string));
  const newValue = newRows.reduce((a, r) => a + (Number(r.value) || 0), 0);
  const newPaidCount = newRows.filter((r) => r.is_paid === true).length;
  const newIdSet = new Set(newRows.map((r) => r.id as string));   // do zliczenia źródeł ruchu (Slack)

  // 3) upsert wf2_orders (on conflict id → update; idempotentne, overlap bezpieczny)
  for (let i = 0; i < orderRows.length; i += UPSERT_CHUNK) {
    const chunk = orderRows.slice(i, i + UPSERT_CHUNK);
    const { error } = await supabase.from('wf2_orders').upsert(chunk, { onConflict: 'id' });
    if (error) { console.error(`[wf2-orders-sync] upsert wf2_orders błąd (projekt ${proj.id})`, error.message); throw new Error('upsert_orders_failed'); }
  }

  // 4) agregacja wf2_sales dla DOTKNIĘTYCH dat — pełne przeliczenie z wf2_orders (kompletne dni, idempotentne).
  //    wf2_sales_uniq to indeks WYRAŻENIOWY (COALESCE(product_id, zero-uuid)) — onConflict po kolumnach NIE zadziała,
  //    więc delete+insert dla (project, source='takedrop', affectedDates) = czyste i poprawne.
  if (affectedDates.size > 0) {
    const dates = [...affectedDates].sort();
    const minD = dates[0], maxD = dates[dates.length - 1];
    // czytamy pełne dni [minD 00:00Z, maxD+1 00:00Z) — kompletny zbiór do przeliczenia (nie tylko okno sync)
    const gte = `${minD}T00:00:00Z`;
    const lt = `${addDaysStr(maxD, 1)}T00:00:00Z`;
    const allRows: { order_date: string; lines: MappedLine[]; is_paid: boolean | null }[] = [];
    for (let from = 0; ; from += READ_PAGE) {
      const { data, error } = await supabase.from('wf2_orders')
        .select('order_date, lines, is_paid').eq('project_id', proj.id)
        .gte('order_date', gte).lt('order_date', lt)
        .order('id', { ascending: true }).range(from, from + READ_PAGE - 1);
      if (error) { console.error(`[wf2-orders-sync] read wf2_orders błąd (projekt ${proj.id})`, error.message); throw new Error('read_orders_failed'); }
      allRows.push(...((data || []) as { order_date: string; lines: MappedLine[]; is_paid: boolean | null }[]));
      if (!data || data.length < READ_PAGE) break;
    }

    // agregacja: klucz = (product_id|null) × data; orders = liczba ZAMÓWIEŃ zawierających produkt, revenue = Σ price*qty.
    // orders_paid/revenue_paid = to samo, ale WYŁĄCZNIE z zamówień is_paid=true (równoległa księga, nie zmienia orders/revenue).
    type Agg = { product_id: string | null; date: string; orders: number; revenue: number; orders_paid: number; revenue_paid: number };
    const agg = new Map<string, Agg>();
    for (const row of allRows) {
      const dateStr = new Date(row.order_date).toISOString().slice(0, 10);
      if (!affectedDates.has(dateStr)) continue;   // liczymy tylko daty, które ten run zmienił
      const isPaid = row.is_paid === true;
      const perProduct = new Map<string, number>();   // product_key → revenue w tym zamówieniu
      for (const line of (Array.isArray(row.lines) ? row.lines : [])) {
        const pid = line.product_id ?? null;
        const pk = pid ?? '__null__';
        perProduct.set(pk, (perProduct.get(pk) || 0) + num(line.price) * num(line.quantity));
      }
      for (const [pk, rev] of perProduct) {
        const pid = pk === '__null__' ? null : pk;
        const aggKey = `${pk}|${dateStr}`;
        const cur = agg.get(aggKey) || { product_id: pid, date: dateStr, orders: 0, revenue: 0, orders_paid: 0, revenue_paid: 0 };
        cur.orders += 1;              // +1 zamówienie zawierające ten produkt (nie sztuki)
        cur.revenue += rev;
        if (isPaid) { cur.orders_paid += 1; cur.revenue_paid += rev; }
        agg.set(aggKey, cur);
      }
    }

    // delete (project, source=takedrop, affectedDates) + insert świeżych — omija indeks wyrażeniowy
    const { error: delErr } = await supabase.from('wf2_sales').delete()
      .eq('project_id', proj.id).eq('source', 'takedrop').in('date', dates);
    if (delErr) { console.error(`[wf2-orders-sync] delete wf2_sales błąd (projekt ${proj.id})`, delErr.message); throw new Error('delete_sales_failed'); }
    const salesRows = [...agg.values()].map((a) => ({
      project_id: proj.id, product_id: a.product_id, date: a.date, source: 'takedrop',
      orders: a.orders, revenue: a.revenue, orders_paid: a.orders_paid, revenue_paid: a.revenue_paid,
    }));
    if (salesRows.length > 0) {
      const { error: insErr } = await supabase.from('wf2_sales').insert(salesRows);
      if (insErr) { console.error(`[wf2-orders-sync] insert wf2_sales błąd (projekt ${proj.id})`, insErr.message); throw new Error('insert_sales_failed'); }
    }
  }

  // 4b) orders_paid per produkt = COUNT zamówień zawierających produkt (całość, all-time).
  //     Definicja „sprzedaży" wg CENNIK-PLAN §2: proxy = zamówienie zsynchronizowane
  //     (API nie zwraca statusu płatności); po dorobieniu paymentStatus → filtr paid.
  //     ≤10 produktów/projekt → tanie count-y; liczone zawsze (samoleczenie dryfu).
  for (const p of (products || []) as { id: string }[]) {
    if (Date.now() - startedAt > DEADLINE_MS) break;
    const { count, error: cntErr } = await supabase.from('wf2_orders')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', proj.id)
      .contains('lines', JSON.stringify([{ product_id: p.id }]));
    if (cntErr) { console.error(`[wf2-orders-sync] orders_paid count błąd (produkt ${p.id})`, cntErr.message); continue; }
    // orders_confirmed = ten sam count, ale tylko z zamówień is_paid=true (osobny count; orders_paid = proxy do 1000 BEZ ZMIAN)
    const { count: confirmed, error: confErr } = await supabase.from('wf2_orders')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', proj.id).eq('is_paid', true)
      .contains('lines', JSON.stringify([{ product_id: p.id }]));
    if (confErr) { console.error(`[wf2-orders-sync] orders_confirmed count błąd (produkt ${p.id})`, confErr.message); }
    await supabase.from('wf2_products').update({ orders_paid: count ?? 0, orders_confirmed: confErr ? undefined : (confirmed ?? 0) }).eq('id', p.id);
  }

  // 4c) ATRYBUCJA — pobranie sesji dla świeżych zamówień bez atrybucji (LIMIT 20/projekt/run).
  //     Osobny blok PO upsercie; deadline-check przed pętlą + per zamówienie; każdy GET w try/catch,
  //     NIGDY nie wywraca synca. Rate-limit: max 20 GET-ów extra (adapter dławi do 120/min).
  const sourceCounts = new Map<string, number>();   // źródła NOWYCH zamówień (tanie zliczenie do Slacka)
  if (Date.now() - startedAt <= DEADLINE_MS) {
    try {
      const cutoff14 = new Date(Date.now() - 14 * 86400_000).toISOString();
      const { data: attrCands } = await supabase.from('wf2_orders')
        .select('id, order_date')
        .eq('project_id', proj.id).eq('attribution_status', 'pending')
        .gt('order_date', cutoff14)
        .order('order_date', { ascending: false }).limit(20);
      for (const cand of ((attrCands || []) as { id: string; order_date: string }[])) {
        if (Date.now() - startedAt > DEADLINE_MS) break;
        try {
          const r = await platformCall(baseUrl, wf2, { action: 'order_attribution', shop_id: shopId, order_id: cand.id });
          const checkedIso = new Date().toISOString();
          if (r.status === 200 && r.data && typeof r.data === 'object') {
            const bodyAttr = r.data as Record<string, unknown>;
            // ⚠️ USUŃ identity przed zapisem — valueHashedOrId zawiera surowy email/telefon (PII, nie trzymamy)
            if ('identity' in bodyAttr) delete bodyAttr.identity;
            const ex = extractAttribution(bodyAttr);
            await supabase.from('wf2_orders').update({
              attribution: bodyAttr, attribution_status: 'ok', attribution_checked_at: checkedIso,
              attributed_source: ex.attributed_source, attribution_entry_path: ex.attribution_entry_path,
              attribution_campaign: ex.attribution_campaign, attribution_click_ids: ex.attribution_click_ids,
            }).eq('id', cand.id);
            if (ex.attributed_source && newIdSet.has(cand.id)) sourceCounts.set(ex.attributed_source, (sourceCounts.get(ex.attributed_source) || 0) + 1);
          } else if (r.status === 404) {
            // 404 = brak dopasowanej sesji. Starsze niż 24h → 'none'; młodsze zostaw pending (sesja może się dokleić).
            const ageMs = Date.now() - Date.parse(cand.order_date);
            if (Number.isFinite(ageMs) && ageMs > 86400_000) {
              await supabase.from('wf2_orders').update({ attribution_status: 'none', attribution_checked_at: checkedIso }).eq('id', cand.id);
            }
          } else {
            console.error(`[wf2-orders-sync] attribution ${r.status} (zamówienie ${cand.id}) — zostaje pending`);
          }
        } catch (e) {
          console.error(`[wf2-orders-sync] attribution wyjątek (zamówienie ${cand.id}):`, e instanceof Error ? e.message : String(e));
        }
      }
    } catch (e) {
      console.error(`[wf2-orders-sync] blok atrybucji (projekt ${proj.id}):`, e instanceof Error ? e.message : String(e));
    }
  }

  // wpis o niezmapowanych nazwach — raz na przebieg projektu
  if (unmappedNames.size > 0) {
    const list = [...unmappedNames].slice(0, 40).join(', ');
    await supabase.from('wf2_activities').insert({
      project_id: proj.id, actor: 'auto', action: 'orders_unmapped',
      description: `Niezmapowane nazwy produktów (${unmappedNames.size}): ${list}`.slice(0, 2000),
    });
  }

  // 5) znacznik: To (koniec okna) — kolejny run rusza od tego czasu (minus 1d overlap)
  //    + orders_unmapped_last = liczba niezmapowanych nazw z TEGO przebiegu (per projekt) —
  //    czyta ją strażnik DQ silnika cen (CENNIK v3.1 §5.1 P12; rosnące unmapped = pauza DQ, NIE rollback).
  await supabase.from('wf2_projects').update({ orders_synced_at: toIso, orders_unmapped_last: unmappedNames.size }).eq('id', proj.id);

  // source_summary: top źródła NOWYCH zamówień, np. 'facebook/paid ×2' (bez extra wywołań)
  const source_summary = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${k} ×${n}`).join(', ');

  return { upserted: orderRows.length, unmapped: unmappedNames.size, timedOut, new_count: newRows.length, new_value: newValue, new_paid_count: newPaidCount, source_summary };
}

// ══════════════════════════════════════════════════════════════════════════
// STRAŻNIK PLATFORMY — autonomiczna kontrola i auto-domykanie spraw (bez człowieka).
// Uruchamiany po syncu zamówień, w tym samym budżecie 300 s. Każdy z 3 checków w osobnym
// try/catch — padnięcie jednego nie wywraca pozostałych ani synca. Max 3 GET/projekt
// (domains + integrations + products) → przy chunku 10 mieści się w rate-limicie 120/min.
// ⚠️ ZERO PUT na integracjach: czytamy WYŁĄCZNIE action 'integrations' (GET). set_integration
// robi PUT, który AUTO-WŁĄCZA integrację (pamięć) — strażnik nigdy go nie woła.
// ══════════════════════════════════════════════════════════════════════════
type GuardResult = { domains_activated: number; pixel_alerts: number; price_alerts: number };

// generyczny ekstraktor listy z rozmaitych kształtów odpowiedzi
function extractList(raw: unknown, keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    for (const k of keys) if (Array.isArray(o[k])) return o[k] as Record<string, unknown>[];
  }
  return [];
}
function normDomain(v: unknown): string { return str(v).trim().toLowerCase().replace(/^www\./, '').replace(/\/+$/, ''); }
function isTruthy(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') return ['true', '1', 'yes', 'active', 'enabled', 'on'].includes(v.toLowerCase());
  return false;
}
const money = (n: number) => n.toFixed(2).replace('.', ',');

// wołanie adaptera + rozpakowanie koperty { status, data } platformy (GET i POST tak samo)
async function platformCall(baseUrl: string, wf2: string, payload: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: unknown }> {
  const { httpOk, httpStatus, env } = await callPlatform(baseUrl, wf2, payload);
  if (!httpOk) return { ok: false, status: httpStatus, data: null };
  const envelope = (env && typeof env === 'object') ? env as { status?: number; data?: unknown; error?: string } : {};
  if (envelope.error) return { ok: false, status: httpStatus, data: null };
  const st = typeof envelope.status === 'number' ? envelope.status : httpStatus;
  return { ok: st < 400, status: st, data: envelope.data };
}

async function runGuard(
  supabase: Supa, baseUrl: string, wf2: string,
  proj: { id: string; platform_shop_id: string; pixel_id: string | null; domain: string | null },
  startedAt: number,
): Promise<GuardResult> {
  const out: GuardResult = { domains_activated: 0, pixel_alerts: 0, price_alerts: 0 };
  if (Date.now() - startedAt > DEADLINE_MS) return out;
  const shopId = proj.platform_shop_id;
  const nowIso = new Date().toISOString();

  // (1) AUTO-AKTYWACJA DOMENY — tylko gdy pl_domena otwarte (instancja project-scope)
  try {
    const { data: steps } = await supabase.from('wf2_steps')
      .select('id, status').eq('project_id', proj.id).eq('step_key', 'pl_domena')
      .is('product_id', null).in('status', ['pending', 'in_progress']).limit(1);
    if (steps && steps.length > 0) {
      const r = await platformCall(baseUrl, wf2, { action: 'domains', shop_id: shopId });
      if (r.ok) {
        const top = (r.data && typeof r.data === 'object') ? r.data as Record<string, unknown> : {};
        const activeDomain = normDomain(pick(top, ['activeDomain', 'active_domain']));
        const list = extractList(r.data, ['domains', 'customDomains', 'items', 'data', 'records']);
        const isVerified = (d: Record<string, unknown>) => {
          const v = pick(d, ['isVerified', 'verified', 'isDnsVerified', 'dnsVerified', 'isConfirmed']);
          if (typeof v === 'boolean') return v;
          const st = str(pick(d, ['status', 'verificationStatus', 'state', 'configurationStatus'])).toLowerCase();
          if (['verified', 'active', 'ok', 'confirmed', 'ready', 'fullyconfigured'].includes(st)) return true;
          // Trevio: weryfikacja żyje na rekordach DNS (dnsRecords[].isVerified), nie na domenie
          const recs = extractList(d, ['dnsRecords', 'records']);
          const req = recs.filter((r) => isTruthy(pick(r, ['isRequired', 'required'])));
          return req.length > 0 && req.every((r) => isTruthy(pick(r, ['isVerified', 'verified'])));
        };
        const isActiveDomain = (d: Record<string, unknown>) => {
          const a = pick(d, ['isActive', 'active', 'isPrimary', 'isCurrent']);
          if (typeof a === 'boolean') return a;
          const nm = normDomain(pick(d, ['domain', 'name', 'host', 'hostname']));
          return !!nm && !!activeDomain && nm === activeDomain;
        };
        // preferuj apex (nie-www) — aktywacja StorefrontRoot; www jest opcjonalnym aliasem
        const cands = list.filter((d) => isVerified(d) && !isActiveDomain(d));
        const cand = cands.find((d) => !str(pick(d, ['domain', 'name', 'host', 'hostname'])).toLowerCase().startsWith('www.')) || cands[0];
        const domainId = cand ? str(pick(cand, ['id', 'domainId', 'websiteDomainId'])) : '';
        if (cand && domainId) {
          const act = await platformCall(baseUrl, wf2, { action: 'activate_domain', shop_id: shopId, domain_id: domainId });
          if (act.ok) {
            const domainName = str(pick(cand, ['domain', 'name', 'host', 'hostname']));
            if (!proj.domain && domainName) await supabase.from('wf2_projects').update({ domain: domainName }).eq('id', proj.id);
            await supabase.from('wf2_steps').update({ status: 'done', completed_at: nowIso, completed_by: 'auto' }).eq('id', (steps[0] as { id: string }).id);
            await supabase.from('wf2_activities').insert({
              project_id: proj.id, actor: 'auto', action: 'domain_activated',
              description: `Domena ${domainName || domainId} aktywowana automatycznie (strażnik platformy).`,
            });
            out.domains_activated++;
          } else {
            console.error(`[wf2-orders-sync/guard] activate_domain nieudane (projekt ${proj.id}, status ${act.status})`);
          }
        }
      }
    }
  } catch (e) {
    console.error(`[wf2-orders-sync/guard] domena (projekt ${proj.id}):`, e instanceof Error ? e.message : String(e));
  }

  // (2) AUDYT PIXELA — tylko gdy projekt ma pixel_id; WYŁĄCZNIE odczyt integracji (GET)
  try {
    if (proj.pixel_id) {
      const r = await platformCall(baseUrl, wf2, { action: 'integrations', shop_id: shopId });
      if (r.ok) {
        const arr = extractList(r.data, ['integrations', 'items', 'data', 'records']);
        const fp = arr.find((i) => str(pick(i, ['type', 'name'])).toLowerCase() === 'facebookpixel');
        if (fp) {
          const active = isTruthy(pick(fp, ['isActive', 'active', 'enabled']));
          const platPixel = str(pick(fp, ['pixelId', 'pixel_id', 'value']));
          const expected = str(proj.pixel_id);
          if (!active || platPixel !== expected) {
            const { data: dup } = await supabase.from('wf2_notes')
              .select('id').eq('project_id', proj.id).eq('status', 'open')
              .like('body', '⚠️ AUTOMAT: pixel%').limit(1);
            if (!dup || dup.length === 0) {
              const stanParts: string[] = [];
              if (!active) stanParts.push('nieaktywny');
              if (platPixel !== expected) stanParts.push(`pixelId=${platPixel || '(pusty)'}`);
              const stan = stanParts.join(', ') || 'rozjazd';
              await supabase.from('wf2_notes').insert({
                project_id: proj.id, tag: 'blokada', status: 'open', author: 'auto',
                body: `⚠️ AUTOMAT: pixel na platformie nieaktywny/rozjechany (oczekiwany ${expected}, jest ${stan}) — krok Integracje wymaga uwagi`,
              });
              out.pixel_alerts++;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(`[wf2-orders-sync/guard] pixel (projekt ${proj.id}):`, e instanceof Error ? e.message : String(e));
  }

  // (3) ROZJAZD CENY — produkty z platform_product_id + price; jedna strona produktów/projekt
  try {
    const { data: prods } = await supabase.from('wf2_products')
      .select('id, name, price, platform_product_id, platform_variant_id, price_state')
      .eq('project_id', proj.id)
      .not('platform_product_id', 'is', null)
      .not('price', 'is', null);
    if (prods && prods.length > 0) {
      const r = await platformCall(baseUrl, wf2, { action: 'products', shop_id: shopId, page_size: 100 });
      if (r.ok) {
        const items = extractList(r.data, ['items', 'data', 'products', 'records']);
        const priceById = new Map<string, number>();
        const variantById = new Map<string, string>();
        for (const it of items) {
          const pid = str(pick(it, ['id', 'productId', 'product_id']));
          if (!pid) continue;
          const variants = pick(it, ['variants', 'variantList', 'skus']);
          const v0 = Array.isArray(variants) && variants.length > 0 ? variants[0] as Record<string, unknown> : null;
          const pr = v0
            ? amt(pick(v0, ['price', 'grossPrice', 'priceGross', 'value', 'amount']))
            : amt(pick(it, ['price', 'grossPrice', 'priceGross', 'value']));
          priceById.set(pid, pr);
          const vid = v0 ? str(pick(v0, ['id', 'variantId', 'variant_id'])) : '';
          if (vid) variantById.set(pid, vid);
        }
        // dedup: otwarte noty cenowe projektu (po prefiksie) — jedno zapytanie na projekt
        const { data: openPriceNotes } = await supabase.from('wf2_notes')
          .select('body').eq('project_id', proj.id).eq('status', 'open').like('body', '⚠️ AUTOMAT: cena%');
        const priceBodies = ((openPriceNotes || []) as { body: string }[]).map((n) => n.body || '');
        for (const p of (prods as { id: string; name: string; price: number; platform_product_id: string; platform_variant_id: string | null; price_state: string | null }[])) {
          const pid = str(p.platform_product_id);
          if (!priceById.has(pid)) continue;   // produktu nie ma na tej stronie — brak wiarygodnych danych, nie ruszamy
          const platPrice = priceById.get(pid)!;
          const panelPrice = num(p.price);
          const diff = Math.abs(platPrice - panelPrice) > 0.01;
          // price_state (CENNIK-PLAN §4.3): mismatch przy rozjeździe; powrót do 'ok' TYLKO
          // z 'mismatch' (nie nadpisujemy 'pending_platform'/'paused' — stany silnika/interim)
          const upd: Record<string, unknown> = { platform_price: platPrice, platform_synced_at: nowIso };
          if (diff && (p.price_state === 'ok' || p.price_state == null)) upd.price_state = 'mismatch';
          if (!diff && p.price_state === 'mismatch') upd.price_state = 'ok';
          if (!diff && p.price_state === 'pending_platform') upd.price_state = 'ok';   // interim: ręczna zmiana kasy potwierdzona
          if (!p.platform_variant_id && variantById.has(pid)) upd.platform_variant_id = variantById.get(pid);
          await supabase.from('wf2_products').update(upd).eq('id', p.id);
          if (diff) {
            const marker = `dla ${p.name} —`;   // dedup po prefiksie 'cena' + nazwie produktu
            if (priceBodies.some((b) => b.includes(marker))) continue;
            const body = `⚠️ AUTOMAT: cena na platformie (${money(platPrice)} zł) ≠ cena w panelu (${money(panelPrice)} zł) dla ${p.name} — kasa pobierze ${money(platPrice)}. Wyrównaj w panelu platformy albo zaktualizuj cenę produktu.`;
            await supabase.from('wf2_notes').insert({ project_id: proj.id, product_id: p.id, tag: 'blokada', status: 'open', author: 'auto', body });
            priceBodies.push(body);
            out.price_alerts++;
          }
        }
      }
    }
  } catch (e) {
    console.error(`[wf2-orders-sync/guard] cena (projekt ${proj.id}):`, e instanceof Error ? e.message : String(e));
  }

  return out;
}

// ── serwer ─────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const startedAt = Date.now();
  const c = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c });
  const J = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...c, 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return J({ error: 'metoda_niedozwolona' }, 405);
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const WF2 = Deno.env.get('WF2_GEN_SECRET') || '';

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const okSecret = !!WF2 && req.headers.get('x-wf2-secret') === WF2;   // pusty sekret NIGDY nie autoryzuje
    if (!okSecret && !(await adminGate(req, supabase))) return J({ error: 'brak_uprawnien' }, 403);

    let body: { project_id?: string } = {};
    try { body = await req.json(); } catch { body = {}; }   // body opcjonalne
    const onlyProject = typeof body.project_id === 'string' ? body.project_id.trim() : '';

    // wybór projektów: platform_shop_id NOT NULL i status != 'zamkniety'; najstarsze wg orders_synced_at
    let partial = false;
    let projects: { id: string; platform_shop_id: string; orders_synced_at: string | null; pixel_id: string | null; domain: string | null; customer_name: string | null }[] = [];
    if (onlyProject) {
      const { data, error } = await supabase.from('wf2_projects')
        .select('id, platform_shop_id, orders_synced_at, pixel_id, domain, customer_name')
        .eq('id', onlyProject).not('platform_shop_id', 'is', null).neq('status', 'zamkniety').limit(1);
      if (error) throw error;
      projects = (data || []) as typeof projects;
    } else {
      const { data, error } = await supabase.from('wf2_projects')
        .select('id, platform_shop_id, orders_synced_at, pixel_id, domain, customer_name')
        .not('platform_shop_id', 'is', null).neq('status', 'zamkniety')
        .order('orders_synced_at', { ascending: true, nullsFirst: true })
        .limit(MAX_PROJECTS_PER_RUN + 1);
      if (error) throw error;
      const all = (data || []) as typeof projects;
      if (all.length > MAX_PROJECTS_PER_RUN) { partial = true; projects = all.slice(0, MAX_PROJECTS_PER_RUN); }
      else projects = all;
    }

    let processed = 0, ordersUpserted = 0, unmapped = 0;
    const guard: GuardResult = { domains_activated: 0, pixel_alerts: 0, price_alerts: 0 };
    for (const proj of projects) {
      if (Date.now() - startedAt > DEADLINE_MS) { partial = true; break; }   // budżet wyczerpany — reszta w kolejnym runie
      let syncTimedOut = false;
      try {
        const r = await syncProject(supabase, SUPABASE_URL, WF2, proj, startedAt);
        processed++; ordersUpserted += r.upserted; unmapped += r.unmapped;
        syncTimedOut = r.timedOut;
        // 🛒 SKLEP SPRZEDAJE — ping WYŁĄCZONY (decyzja Tomka 21.07: powiadomienia o sprzedaży
        // NIE idą na #sparing; wrócą na innym kanale). Flip WF2_ORDER_SLACK=true przywraca.
        const WF2_ORDER_SLACK = false;
        if (WF2_ORDER_SLACK && r.new_count > 0) {
          await postSlackSparing('wf2_order', {
            project_id: proj.id, customer: proj.customer_name || '',
            count: r.new_count, total_value: r.new_value, shop_domain: proj.domain || '',
            paid_count: r.new_paid_count, source_summary: r.source_summary,
          });
        }
      } catch (e) {
        console.error(`[wf2-orders-sync] projekt ${proj.id} nieudany:`, e instanceof Error ? e.message : String(e));
        // pojedynczy projekt nie wywraca całego przebiegu — lecimy dalej (strażnik i tak zadziała)
      }
      // STRAŻNIK PLATFORMY — po syncu, w tym samym budżecie; własny try/catch (niezależny od synca)
      try {
        const g = await runGuard(supabase, SUPABASE_URL, WF2, proj, startedAt);
        guard.domains_activated += g.domains_activated;
        guard.pixel_alerts += g.pixel_alerts;
        guard.price_alerts += g.price_alerts;
      } catch (e) {
        console.error(`[wf2-orders-sync] strażnik ${proj.id} nieudany:`, e instanceof Error ? e.message : String(e));
      }
      if (syncTimedOut || Date.now() - startedAt > DEADLINE_MS) { partial = true; break; }
    }

    // NB: dawny „BEZPIECZNIK KREACJI" (sweep wf2-ads dla zawieszonych tasków Manusa) USUNIĘTY 19.07 —
    // fabryka banerów wf2 = ad-forge/fal, edge wf2-ads skasowany (Manus poza modułem wf2).

    return J({ ok: true, projects: processed, orders_upserted: ordersUpserted, unmapped, partial, guard });
  } catch (e) {
    console.error('[wf2-orders-sync] ERROR:', e);
    return J({ error: 'blad_serwera', detail: e instanceof Error ? e.message : String(e) }, 500);
  }
});
