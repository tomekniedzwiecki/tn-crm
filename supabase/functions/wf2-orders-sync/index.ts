// wf2-orders-sync — cron sync zamówień z platformy Trevio → wf2_orders → agregacja wf2_sales.
// SSOT algorytmu: R3 sekcja „(d) SYNC ZAMÓWIEŃ" (dedup po id = dokładny licznik do 1000).
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

// ── tolerancyjne parsowanie pól (kształt odpowiedzi /orders nieznany dokładnie) ──
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') { const n = parseFloat(v.replace(',', '.')); return Number.isFinite(n) ? n : 0; }
  return 0;
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
type MappedOrder = { id: string; number: string; order_date: string; value: number; delivery_cost: number; is_cod: boolean | null; lines: MappedLine[] };

// mapowanie surowego zamówienia platformy → nasz kształt (braki pól → defaulty, nigdy crash)
function mapOrder(o: Record<string, unknown>): MappedOrder {
  const id = str(pick(o, ['id', 'orderId', 'order_id', 'uuid', 'guid', 'number', 'orderNumber']));
  const number = str(pick(o, ['number', 'orderNumber', 'order_number', 'displayNumber', 'id']));
  const dRaw = pick(o, ['orderDate', 'order_date', 'date', 'createdAt', 'created_at', 'createdDate', 'created', 'placedAt']);
  const parsed = dRaw != null ? new Date(str(dRaw)) : null;
  const order_date = parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
  const value = num(pick(o, ['value', 'total', 'totalValue', 'totalGross', 'grossValue', 'amount', 'sum', 'price']));
  const delivery_cost = num(pick(o, ['deliveryCost', 'delivery_cost', 'shippingCost', 'shipping_cost', 'deliveryPrice', 'shipping']));
  const is_cod = toBoolOrNull(pick(o, ['isCashOnDelivery', 'is_cod', 'isCod', 'cod', 'cashOnDelivery', 'paymentMethod']));
  const linesRaw = pick(o, ['products', 'lines', 'items', 'orderLines', 'orderItems', 'positions']);
  const arr = Array.isArray(linesRaw) ? linesRaw as Record<string, unknown>[] : [];
  const lines: MappedLine[] = arr.map((l) => ({
    name: str(pick(l, ['name', 'productName', 'product_name', 'title', 'label'])),
    price: num(pick(l, ['price', 'unitPrice', 'unit_price', 'grossPrice', 'priceGross', 'value'])),
    quantity: num(pick(l, ['quantity', 'qty', 'amount', 'count'])) || 1,
    product_id: null,
  }));
  return { id, number, order_date, value, delivery_cost, is_cod, lines };
}

// wywołanie adaptera platformy (jedyna droga do API Trevio)
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
): Promise<{ upserted: number; unmapped: number; timedOut: boolean }> {
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
      is_cod: m.is_cod, lines: m.lines, synced_at: nowIso,
    };
  });

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
    const allRows: { order_date: string; lines: MappedLine[] }[] = [];
    for (let from = 0; ; from += READ_PAGE) {
      const { data, error } = await supabase.from('wf2_orders')
        .select('order_date, lines').eq('project_id', proj.id)
        .gte('order_date', gte).lt('order_date', lt)
        .order('id', { ascending: true }).range(from, from + READ_PAGE - 1);
      if (error) { console.error(`[wf2-orders-sync] read wf2_orders błąd (projekt ${proj.id})`, error.message); throw new Error('read_orders_failed'); }
      allRows.push(...((data || []) as { order_date: string; lines: MappedLine[] }[]));
      if (!data || data.length < READ_PAGE) break;
    }

    // agregacja: klucz = (product_id|null) × data; orders = liczba ZAMÓWIEŃ zawierających produkt, revenue = Σ price*qty
    type Agg = { product_id: string | null; date: string; orders: number; revenue: number };
    const agg = new Map<string, Agg>();
    for (const row of allRows) {
      const dateStr = new Date(row.order_date).toISOString().slice(0, 10);
      if (!affectedDates.has(dateStr)) continue;   // liczymy tylko daty, które ten run zmienił
      const perProduct = new Map<string, number>();   // product_key → revenue w tym zamówieniu
      for (const line of (Array.isArray(row.lines) ? row.lines : [])) {
        const pid = line.product_id ?? null;
        const pk = pid ?? '__null__';
        perProduct.set(pk, (perProduct.get(pk) || 0) + num(line.price) * num(line.quantity));
      }
      for (const [pk, rev] of perProduct) {
        const pid = pk === '__null__' ? null : pk;
        const aggKey = `${pk}|${dateStr}`;
        const cur = agg.get(aggKey) || { product_id: pid, date: dateStr, orders: 0, revenue: 0 };
        cur.orders += 1;              // +1 zamówienie zawierające ten produkt (nie sztuki)
        cur.revenue += rev;
        agg.set(aggKey, cur);
      }
    }

    // delete (project, source=takedrop, affectedDates) + insert świeżych — omija indeks wyrażeniowy
    const { error: delErr } = await supabase.from('wf2_sales').delete()
      .eq('project_id', proj.id).eq('source', 'takedrop').in('date', dates);
    if (delErr) { console.error(`[wf2-orders-sync] delete wf2_sales błąd (projekt ${proj.id})`, delErr.message); throw new Error('delete_sales_failed'); }
    const salesRows = [...agg.values()].map((a) => ({
      project_id: proj.id, product_id: a.product_id, date: a.date, source: 'takedrop', orders: a.orders, revenue: a.revenue,
    }));
    if (salesRows.length > 0) {
      const { error: insErr } = await supabase.from('wf2_sales').insert(salesRows);
      if (insErr) { console.error(`[wf2-orders-sync] insert wf2_sales błąd (projekt ${proj.id})`, insErr.message); throw new Error('insert_sales_failed'); }
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
  await supabase.from('wf2_projects').update({ orders_synced_at: toIso }).eq('id', proj.id);

  return { upserted: orderRows.length, unmapped: unmappedNames.size, timedOut };
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
          const st = str(pick(d, ['status', 'verificationStatus', 'state'])).toLowerCase();
          return ['verified', 'active', 'ok', 'confirmed', 'ready'].includes(st);
        };
        const isActiveDomain = (d: Record<string, unknown>) => {
          const a = pick(d, ['isActive', 'active', 'isPrimary', 'isCurrent']);
          if (typeof a === 'boolean') return a;
          const nm = normDomain(pick(d, ['domain', 'name', 'host', 'hostname']));
          return !!nm && !!activeDomain && nm === activeDomain;
        };
        const cand = list.find((d) => isVerified(d) && !isActiveDomain(d));
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
      .select('id, name, price, platform_product_id')
      .eq('project_id', proj.id)
      .not('platform_product_id', 'is', null)
      .not('price', 'is', null);
    if (prods && prods.length > 0) {
      const r = await platformCall(baseUrl, wf2, { action: 'products', shop_id: shopId, page_size: 100 });
      if (r.ok) {
        const items = extractList(r.data, ['items', 'data', 'products', 'records']);
        const priceById = new Map<string, number>();
        for (const it of items) {
          const pid = str(pick(it, ['id', 'productId', 'product_id']));
          if (!pid) continue;
          const variants = pick(it, ['variants', 'variantList', 'skus']);
          const v0 = Array.isArray(variants) && variants.length > 0 ? variants[0] as Record<string, unknown> : null;
          const pr = v0
            ? num(pick(v0, ['price', 'grossPrice', 'priceGross', 'value', 'amount']))
            : num(pick(it, ['price', 'grossPrice', 'priceGross', 'value']));
          priceById.set(pid, pr);
        }
        // dedup: otwarte noty cenowe projektu (po prefiksie) — jedno zapytanie na projekt
        const { data: openPriceNotes } = await supabase.from('wf2_notes')
          .select('body').eq('project_id', proj.id).eq('status', 'open').like('body', '⚠️ AUTOMAT: cena%');
        const priceBodies = ((openPriceNotes || []) as { body: string }[]).map((n) => n.body || '');
        for (const p of (prods as { id: string; name: string; price: number; platform_product_id: string }[])) {
          const pid = str(p.platform_product_id);
          if (!priceById.has(pid)) continue;   // produktu nie ma na tej stronie — brak wiarygodnych danych, nie ruszamy
          const platPrice = priceById.get(pid)!;
          await supabase.from('wf2_products').update({ platform_price: platPrice, platform_synced_at: nowIso }).eq('id', p.id);
          const panelPrice = num(p.price);
          if (Math.abs(platPrice - panelPrice) > 0.01) {
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
    let projects: { id: string; platform_shop_id: string; orders_synced_at: string | null; pixel_id: string | null; domain: string | null }[] = [];
    if (onlyProject) {
      const { data, error } = await supabase.from('wf2_projects')
        .select('id, platform_shop_id, orders_synced_at, pixel_id, domain')
        .eq('id', onlyProject).not('platform_shop_id', 'is', null).neq('status', 'zamkniety').limit(1);
      if (error) throw error;
      projects = (data || []) as typeof projects;
    } else {
      const { data, error } = await supabase.from('wf2_projects')
        .select('id, platform_shop_id, orders_synced_at, pixel_id, domain')
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

    return J({ ok: true, projects: processed, orders_upserted: ordersUpserted, unmapped, partial, guard });
  } catch (e) {
    console.error('[wf2-orders-sync] ERROR:', e);
    return J({ error: 'blad_serwera', detail: e instanceof Error ? e.message : String(e) }, 500);
  }
});
