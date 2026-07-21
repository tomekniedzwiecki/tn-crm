// wf2-price-engine — SILNIK DECYZJI CENOWYCH „CENY 3.0" (SSOT: docs/zbuduje/CENNIK-PLAN.md v3.2 §5.2).
//
// DWIE ODPOWIEDZIALNOŚCI (wołany co 10 min przez pg_cron, gate decyzji w kodzie):
//   (A) SWEEP  — KAŻDE wywołanie: (1) wygaś przeterminowane karty, (2) dokończ podwyżki w toku
//                (pending_platform → set_price → verify → confirmed|failed), (3) wykonaj karty accepted.
//   (B) DECYZJE — RAZ DZIENNIE (gate: brak udanego run kind='decision' dziś w Europe/Warsaw
//                oraz godzina ≥ decision_hour): pętla per produkt → reguły v2.1 → auto|karta.
//
// FAIL-CLOSED: config_version≠'3.2' = run z błędem, ZERO akcji. engine_enabled≠true = heartbeat.
//              dry_run=true = licz i loguj decyzje, ZERO update products / set_price / kart.
//
// Dowody, nie deklaracje: 'confirmed' dopiero po verify_price na platformie. Atomic claim chroni
// przed podwójnym awansem. Lifecycle runów: UNIQUE partial (jeden aktywny) + stale-cleanup 7 min.
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (autoryzacja w środku: x-wf2-secret == WF2_GEN_SECRET lub adminGate).
//   supabase functions deploy wf2-price-engine --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
//
// POST body (opcjonalne): { trigger?: 'cron'|'manual', dry_run_override? } — panel „Uruchom teraz" = trigger:'manual'.
// Woła wf2-platform (x-wf2-secret) akcjami set_price / verify_price. NIE zna klucza platformy.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const ALLOWED_ORIGINS = ['https://crm.tomekniedzwiecki.pl', 'https://tn-crm.vercel.app', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wf2-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}

const DEADLINE_MS = 280_000;        // wewnętrzny budżet (edge wall-clock ~300 s; stale-cleanup 7 min = deadline + bufor)
const STALE_MIN = 7;                // run z finished_at IS NULL starszy niż to = 'stale'
const DAY_MS = 86_400_000;

// reżimy price_phase 1–6 (§2)
const START = 1, RAMP = 2, BASE = 3, PROBE = 4, HARVEST = 5, LOCKED = 6;

// deno-lint-ignore no-explicit-any
type Supa = any;
// deno-lint-ignore no-explicit-any
type Any = any;

const num = (v: unknown): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') { const n = parseFloat(v.replace(',', '.')); return Number.isFinite(n) ? n : 0; }
  return 0;
};
const dateStr = (d: Date) => d.toISOString().slice(0, 10);
const daysAgoStr = (n: number) => dateStr(new Date(Date.now() - n * DAY_MS));

// ── strefa Europe/Warsaw z DST (Intl — poprawne przełączenie czasu) ──────────
function plParts(d: Date): { date: string; hour: number; weekday: number } {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false });
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(d)) p[part.type] = part.value;
  const date = `${p.year}-${p.month}-${p.day}`;
  const hour = (parseInt(p.hour, 10) || 0) % 24;
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();   // 0=nd … 4=czw, 5=pt
  return { date, hour, weekday };
}

// ── psych-ceny portowane z tn-sklepy/projekt.html (spec wspólna §5.3) ────────
function psychPriceUp(min: number): number {
  const dec = Math.floor(min / 10) * 10;
  const cands = min >= 150 ? [dec + 9.00, dec + 19.00] : [dec + 4.90, dec + 9.90, dec + 14.90, dec + 19.90];
  for (const c of cands) if (c >= min - 0.001) return Math.round(c * 100) / 100;
  return Math.round((dec + 19.90) * 100) / 100;
}
// „w dół": najwyższa końcówka …4,90/…9,90/…9,00 NIE wyższa niż cap (nigdy ponad clamp kroku)
function psychPriceDown(max: number): number {
  if (!(max > 0)) return 0;
  const dec = Math.floor(max / 10) * 10;
  const cands = max >= 150 ? [dec + 19.00, dec + 9.00, dec - 1.00, dec - 11.00]
                           : [dec + 19.90, dec + 14.90, dec + 9.90, dec + 4.90, dec - 0.10, dec - 5.10, dec - 10.10];
  for (const c of cands) if (c <= max + 0.001 && c > 0) return Math.round(c * 100) / 100;
  return Math.round((dec + 4.90) * 100) / 100;
}

// ── Poisson (collapse q10 + pesymistyczny CI dla CPA_scale_est) ──────────────
function poissonCdf(k: number, lambda: number): number {
  if (lambda <= 0) return 1;
  let term = Math.exp(-lambda), sum = term;
  for (let i = 1; i <= k; i++) { term *= lambda / i; sum += term; }
  return Math.min(1, sum);
}
function poissonQuantileLower(lambda: number, q: number): number {
  if (lambda <= 0) return 0;
  const cap = Math.ceil(lambda * 4) + 60;
  let k = 0;
  while (k < cap && poissonCdf(k, lambda) < q) k++;
  return k;
}

// nearest ściana psychologiczna POWYŻEJ ceny (parkowanie rampu / ceiling scale_base)
function wallAbove(price: number, walls: number[]): number | null {
  const above = walls.filter((w) => w > price).sort((a, b) => a - b);
  return above.length ? above[0] : null;
}
// czy nowa cena przecina jakąś ścianę względem starej (100/150/free-ship)
function crossesWall(from: number, to: number, walls: number[]): boolean {
  const lo = Math.min(from, to), hi = Math.max(from, to);
  return walls.some((w) => w > lo && w <= hi && Math.abs(w - from) > 0.001);
}

// ══════════════════════════════════════════════════════════════════════════
// CONFIG (settings.wf2_price_config, TEXT JSON) — WYŁĄCZNIE klucze KANONICZNE v3.2 (§8)
// ══════════════════════════════════════════════════════════════════════════
type Cfg = Record<string, Any>;

// ── MODEL KOSZTÓW v3.2 (config.cost_model; research podatkowy VAT/cło/hurt) ───
type CostModel = {
  vat_rate: number;                 // 0.23
  dropship_customs_fee_pln: number; // cło ryczałt ~3 EUR/poz. (od 1.07.2026)
  wholesale_discount: number;       // hurt vs detal (informacyjnie w prognozie)
  wholesale_extras_pct: number;
  wholesale_local_ship_pln: number;
  client_cost_sanity_band: [number, number]; // pasmo akceptacji ceny klienta vs cost_purchase
  tax_model_default: string;        // 'goods' (deemed supplier — konserwatywnie)
};
function costModel(cfg: Cfg): CostModel {
  const cm = (cfg.cost_model && typeof cfg.cost_model === 'object') ? cfg.cost_model as Cfg : {};
  const band = Array.isArray(cm.client_cost_sanity_band) && cm.client_cost_sanity_band.length === 2
    ? [num(cm.client_cost_sanity_band[0]), num(cm.client_cost_sanity_band[1])] as [number, number]
    : [0.4, 1.6] as [number, number];
  return {
    vat_rate: num(cm.vat_rate ?? 0.23),
    dropship_customs_fee_pln: num(cm.dropship_customs_fee_pln ?? 13),
    wholesale_discount: num(cm.wholesale_discount ?? 0.40),
    wholesale_extras_pct: num(cm.wholesale_extras_pct ?? 0.15),
    wholesale_local_ship_pln: num(cm.wholesale_local_ship_pln ?? 14),
    client_cost_sanity_band: band,
    tax_model_default: typeof cm.tax_model_default === 'string' ? cm.tax_model_default : 'goods',
  };
}
async function loadConfig(supabase: Supa): Promise<{ ok: boolean; cfg: Cfg; reason: string }> {
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'wf2_price_config').maybeSingle();
  if (error) return { ok: false, cfg: {}, reason: `settings_read_error:${error.message}` };
  if (!data?.value) return { ok: false, cfg: {}, reason: 'config_missing' };
  let cfg: Cfg;
  try { cfg = typeof data.value === 'string' ? JSON.parse(data.value) : data.value; }
  catch (e) { return { ok: false, cfg: {}, reason: `config_parse_error:${e instanceof Error ? e.message : e}` }; }
  if (cfg.config_version !== '3.2') return { ok: false, cfg, reason: `config_version_mismatch:${cfg.config_version}` };
  return { ok: true, cfg, reason: '' };
}

// ══════════════════════════════════════════════════════════════════════════
// RUN LIFECYCLE (wf2_engine_runs — heartbeat + dziennik + lifecycle P10)
// ══════════════════════════════════════════════════════════════════════════
async function staleCleanup(supabase: Supa): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_MIN * 60_000).toISOString();
  await supabase.from('wf2_engine_runs').update({ finished_at: new Date().toISOString(), ok: false, note: 'stale' })
    .is('finished_at', null).lt('started_at', cutoff);
}

async function claimRun(supabase: Supa, kind: string, dryRun: boolean, trigger: string): Promise<{ id: string | null; conflict: boolean }> {
  const { data, error } = await supabase.from('wf2_engine_runs')
    .insert({ kind, dry_run: dryRun, trigger, products_evaluated: 0, actions_executed: 0, cards_created: 0 })
    .select('id').single();
  if (error) {
    // UNIQUE partial (finished_at IS NULL) → 23505 = ktoś już biegnie
    if ((error as Any).code === '23505' || /duplicate|unique/i.test((error as Any).message || '')) return { id: null, conflict: true };
    throw error;
  }
  return { id: data.id, conflict: false };
}

async function finalizeRun(supabase: Supa, runId: string, patch: Record<string, unknown>): Promise<void> {
  await supabase.from('wf2_engine_runs').update({ finished_at: new Date().toISOString(), ...patch }).eq('id', runId);
}

// ── kontekst wspólny wykonania ───────────────────────────────────────────────
type Ctx = {
  supabase: Supa; baseUrl: string; wf2: string; cfg: Cfg; cm: CostModel; runId: string; nowIso: string; startedAt: number;
  pl: { date: string; hour: number; weekday: number }; dryRun: boolean;
  errors: Array<{ where: string; msg: string }>;
  decisions: Any[]; actionsExecuted: number; cardsCreated: number;
};
const overBudget = (ctx: Ctx) => Date.now() - ctx.startedAt > DEADLINE_MS;

// wołanie adaptera platformy (jedyna droga do API) + rozpakowanie koperty { status, data }
async function platform(ctx: Ctx, action: string, payload: Record<string, unknown>): Promise<{ ok: boolean; status: number; data: Any }> {
  try {
    const r = await fetch(`${ctx.baseUrl}/functions/v1/wf2-platform`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-wf2-secret': ctx.wf2 },
      body: JSON.stringify({ action, ...payload }),
    });
    let env: Any = null; try { env = await r.json(); } catch { /* null */ }
    if (!r.ok) return { ok: false, status: r.status, data: null };
    if (env?.error) return { ok: false, status: r.status, data: null };
    const st = typeof env?.status === 'number' ? env.status : r.status;
    return { ok: st < 400, status: st, data: env?.data };
  } catch (e) { ctx.errors.push({ where: `platform:${action}`, msg: e instanceof Error ? e.message : String(e) }); return { ok: false, status: 0, data: null }; }
}

// alert do wf2_notes (dedup po prefiksie) — używane przy failach platformy / DQ
async function alertNote(ctx: Ctx, projectId: string, productId: string | null, prefix: string, body: string): Promise<void> {
  try {
    const { data: dup } = await ctx.supabase.from('wf2_notes').select('id').eq('project_id', projectId).eq('status', 'open').like('body', `${prefix}%`).limit(1);
    if (dup && dup.length > 0) return;
    await ctx.supabase.from('wf2_notes').insert({ project_id: projectId, product_id: productId, tag: 'blokada', status: 'open', author: 'auto', body });
  } catch (e) { ctx.errors.push({ where: 'alertNote', msg: e instanceof Error ? e.message : String(e) }); }
}

// karta „Do decyzji" (wf2_proposals) — dedup deterministyczny, kontrakt payload §3.4
async function createCard(ctx: Ctx, spec: { projectId: string; productId: string; kind: string; dedup: string; expires: string | null; payload: Record<string, unknown> }): Promise<boolean> {
  const { data, error } = await ctx.supabase.from('wf2_proposals')
    .upsert({ project_id: spec.projectId, product_id: spec.productId, kind: spec.kind, dedup_key: spec.dedup, expires_at: spec.expires, status: 'proposed', payload: spec.payload },
      { onConflict: 'dedup_key', ignoreDuplicates: true }).select('id');
  if (error) { ctx.errors.push({ where: `createCard:${spec.kind}`, msg: (error as Any).message }); return false; }
  if (data && data.length > 0) { ctx.cardsCreated++; return true; }
  return false;   // już istniała (dedup)
}

function payload(observation: string, recommendation: string, contribution: number, revenue: number, confidence: string, deadline: string | null): Record<string, unknown> {
  // KONTRAKT §3.4: obie liczby efektu (kontrybucja = metryka silnika, przychód = podstawa 10% Tomka)
  return { observation, recommendation, expected_effect_zl: { contribution: Math.round(contribution), revenue: Math.round(revenue) }, confidence, deadline };
}
// payload karty WYKONYWALNEJ (sweep czyta target/next_phase po akcepcie): kontrakt §3.4 + adres wykonania
function execPayload(base: Record<string, unknown>, target: number, nextPhase: number | null): Record<string, unknown> {
  return { ...base, target, next_phase: nextPhase };
}

// S8: re-check warunków W MOMENCIE WYKONANIA karty (akcept NIE przebija guardraili). Zwraca powód skipu lub null.
//   podwyżka: price_state='ok' + cooldown + rollback_lock + hard_min_orders; obniżka/rollback: tylko price_state='ok' (obrona).
async function sweepGuard(ctx: Ctx, p: Any, dir: string): Promise<string | null> {
  const cfg = ctx.cfg;
  if (p.price_state !== 'ok') return `price_state=${p.price_state}`;
  if (dir === 'up') {
    const cd = num(cfg.cooldown_days ?? 7);
    if (p.last_price_change_at && (Date.now() - Date.parse(p.last_price_change_at)) < cd * DAY_MS) return 'cooldown';
    if (p.rollback_lock_until && Date.parse(p.rollback_lock_until) > Date.now()) return 'rollback_lock';
    const q = await qualifyingOrders(ctx, p.project_id, p.id);
    if (q < num(cfg.hard_min_orders ?? 5)) return `hard_min_orders ${q}/${num(cfg.hard_min_orders ?? 5)}`;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════════
// SWEEP — każde wywołanie
// ══════════════════════════════════════════════════════════════════════════
async function sweep(ctx: Ctx): Promise<void> {
  // (1) wygaś przeterminowane karty (status='proposed', expires_at<now) → 'expired' + sufiks dedup (ZWALNIA klucz)
  try {
    const { data: exp } = await ctx.supabase.from('wf2_proposals').select('id, dedup_key')
      .eq('status', 'proposed').not('expires_at', 'is', null).lt('expires_at', ctx.nowIso).limit(500);
    for (const c of (exp || []) as Array<{ id: string; dedup_key: string | null }>) {
      const newKey = `${c.dedup_key || c.id}|exp${ctx.pl.date}`;
      await ctx.supabase.from('wf2_proposals').update({ status: 'expired', dedup_key: newKey }).eq('id', c.id);
    }
  } catch (e) { ctx.errors.push({ where: 'sweep:expire', msg: e instanceof Error ? e.message : String(e) }); }

  if (ctx.dryRun) return;   // dry_run: ZERO wykonań (kart accepted i podwyżek nie dotykamy)

  // (2) dokończ podwyżki w toku (pending_platform AND platform_apply_after<=now) → set_price → verify
  try {
    const { data: pend } = await ctx.supabase.from('wf2_products')
      .select('id, project_id, price, platform_product_id, platform_variant_id, landing_price_contract')
      .eq('price_state', 'pending_platform').lte('platform_apply_after', ctx.nowIso).limit(50);
    const shopMap = await shopIdsFor(ctx, (pend || []).map((p: Any) => p.project_id));
    for (const p of (pend || []) as Any[]) {
      if (overBudget(ctx)) break;
      const shopId = shopMap.get(p.project_id);
      if (!shopId || !p.platform_product_id || !p.platform_variant_id) { ctx.errors.push({ where: 'sweep:pending', msg: `brak shop/variant produktu ${p.id}` }); continue; }
      const sp = await platform(ctx, 'set_price', { shop_id: shopId, product_id: p.platform_product_id, variant_id: p.platform_variant_id, price: num(p.price) });
      const vf = sp.ok ? await platform(ctx, 'verify_price', { shop_id: shopId, product_id: p.platform_product_id, variant_id: p.platform_variant_id, expected: num(p.price) }) : { ok: false, data: null };
      const matches = vf.ok && vf.data?.matches === true;
      if (matches) {
        await ctx.supabase.from('wf2_products').update({ platform_price: num(p.price), platform_synced_at: ctx.nowIso, price_state: 'ok' }).eq('id', p.id);
        await confirmAppliedEvent(ctx, p.id, num(p.price));
        ctx.actionsExecuted++;
      } else {
        await failAppliedEvent(ctx, p.id, `set_price/verify nieudane (status ${sp.status})`);
        await alertNote(ctx, p.project_id, p.id, '⚠️ AUTOMAT: podwyżka', `⚠️ AUTOMAT: podwyżka nie potwierdzona na platformie dla produktu ${p.id} — kasa może liczyć starą cenę. Produkt zostaje w pending; reconcile domknie albo wyrównaj ręcznie.`);
      }
    }
  } catch (e) { ctx.errors.push({ where: 'sweep:pending', msg: e instanceof Error ? e.message : String(e) }); }

  // (3) wykonaj ZAAKCEPTOWANE karty cenowe (accepted, kind cenowe) — sekwencja wg kierunku
  try {
    // wykonywalne kind: price_* + rollback + winner_reco (akcept START→RAMP = auto ramp, SSOT §2)
    const { data: acc } = await ctx.supabase.from('wf2_proposals').select('id, project_id, product_id, kind, payload, dedup_key, decided_at')
      .eq('status', 'accepted').in('kind', ['price_scale', 'price_opt_over_ceiling', 'rollback', 'winner_reco']).limit(50);
    for (const card of (acc || []) as Any[]) {
      if (overBudget(ctx)) break;
      if (card.payload?.executed_at) continue;   // już wykonana (enum status nie ma 'executed' — znacznik w payload)
      const p = await loadProduct(ctx, card.product_id);
      if (!p) continue;
      const target = num(card.payload?.target ?? card.payload?.price);
      if (!(target > 0)) continue;
      const dir = target > num(p.price) ? 'up' : 'down';
      // S8: re-check warunków wykonania (price_state/cooldown/rollback_lock/hard_min_orders) — akcept nie przebija guardraili
      const skip = await sweepGuard(ctx, p, dir);
      if (skip) {
        // S7: karta zaakceptowana a niewykonalna >7 dni od akceptu → expired + nota (kolizja expiry==delay wyeliminowana)
        const acceptedMs = card.decided_at ? Date.parse(card.decided_at) : NaN;
        if (Number.isFinite(acceptedMs) && (Date.now() - acceptedMs) > num(ctx.cfg.stale_accept_expire_days ?? 7) * DAY_MS) {
          await ctx.supabase.from('wf2_proposals').update({ status: 'expired', dedup_key: `${card.dedup_key || card.id}|expacc${ctx.pl.date}`, payload: { ...card.payload, expire_note: `niewykonalna >7 dni (${skip})` } }).eq('id', card.id);
          await alertNote(ctx, card.project_id, card.product_id, '⚠️ AUTOMAT: karta wygasła', `⚠️ AUTOMAT: karta ${card.kind} produktu ${card.product_id} zaakceptowana, ale niewykonalna >7 dni (${skip}) — wygaszona. Ustaw warunki i wygeneruj ponownie jeśli trzeba.`);
        }
        continue;   // retry następnym sweepem (karta zostaje accepted)
      }
      let done = false;
      if (dir === 'up') done = await executeUp(ctx, p, target, num(card.payload?.next_phase) || p.price_phase, `karta zaakceptowana: ${card.payload?.recommendation || ''}`.slice(0, 500), card.payload?.metrics || {}, 'ai_proposal', card.id);
      else done = await executeDown(ctx, p, target, card.payload?.next_phase != null ? num(card.payload.next_phase) : null, `karta zaakceptowana: ${card.payload?.recommendation || ''}`.slice(0, 500), card.payload?.metrics || {}, card.kind === 'rollback', card.id);
      if (done) await ctx.supabase.from('wf2_proposals').update({ payload: { ...card.payload, executed_at: ctx.nowIso } }).eq('id', card.id);
    }
  } catch (e) { ctx.errors.push({ where: 'sweep:accepted', msg: e instanceof Error ? e.message : String(e) }); }
}

async function shopIdsFor(ctx: Ctx, projectIds: string[]): Promise<Map<string, string>> {
  const m = new Map<string, string>();
  const ids = [...new Set(projectIds)].filter(Boolean);
  if (!ids.length) return m;
  const { data } = await ctx.supabase.from('wf2_projects').select('id, platform_shop_id').in('id', ids);
  for (const r of (data || []) as Array<{ id: string; platform_shop_id: string | null }>) if (r.platform_shop_id) m.set(r.id, r.platform_shop_id);
  return m;
}

async function loadProduct(ctx: Ctx, id: string): Promise<Any | null> {
  const { data } = await ctx.supabase.from('wf2_products')
    .select('id, project_id, name, price, price_phase, price_state, platform_product_id, platform_variant_id, landing_price_contract, rollback_lock_until, last_price_change_at, wf2_projects!inner(platform_shop_id)')
    .eq('id', id).maybeSingle();
  if (!data) return null;
  data.shop_id = (data as Any).wf2_projects?.platform_shop_id || null;
  return data;
}

async function confirmAppliedEvent(ctx: Ctx, productId: string, price: number): Promise<void> {
  const { data: ev } = await ctx.supabase.from('wf2_price_events').select('id').eq('product_id', productId).eq('status', 'applied').order('at', { ascending: false }).limit(1);
  if (ev && ev.length) await ctx.supabase.from('wf2_price_events').update({ status: 'confirmed', platform: { platform_price: price } }).eq('id', ev[0].id);
}
async function failAppliedEvent(ctx: Ctx, productId: string, note: string): Promise<void> {
  const { data: ev } = await ctx.supabase.from('wf2_price_events').select('id, reason_pl').eq('product_id', productId).eq('status', 'applied').order('at', { ascending: false }).limit(1);
  if (ev && ev.length) await ctx.supabase.from('wf2_price_events').update({ status: 'failed', reason_pl: `${ev[0].reason_pl || ''} | ${note}`.slice(0, 500) }).eq('id', ev[0].id);
}

// ── PODWYŻKA (kasa OSTATNIA): atomic claim → event applied; platformę dokończy sweep po cache_grace ──
async function executeUp(ctx: Ctx, p: Any, target: number, nextPhase: number, reasonPl: string, metrics: Any, triggerKind: string, proposalId: string | null): Promise<boolean> {
  const applyAfter = new Date(Date.now() + num(ctx.cfg.cache_grace_min ?? 6) * 60_000).toISOString();
  const { data: claimed, error } = await ctx.supabase.from('wf2_products')
    .update({ price: target, price_phase: nextPhase, phase_started_at: ctx.nowIso, price_state: 'pending_platform', platform_apply_after: applyAfter, last_price_change_at: ctx.nowIso, target_snapshot: null })
    .eq('id', p.id).eq('price_phase', p.price_phase).eq('price_state', 'ok').select('id');
  if (error) { ctx.errors.push({ where: 'executeUp', msg: (error as Any).message }); return false; }
  if (!claimed || claimed.length === 0) return false;   // ktoś ubiegł / stan się zmienił → STOP (bez podwójnego awansu)
  await ctx.supabase.from('wf2_price_events').insert({
    product_id: p.id, project_id: p.project_id, old_price: num(p.price), new_price: target,
    phase_from: p.price_phase, phase_to: nextPhase, direction: 'up', trigger_kind: triggerKind,
    actor: 'engine', status: 'applied', reason_pl: reasonPl, metrics_snapshot: metrics, run_id: ctx.runId, proposal_id: proposalId,
  });
  ctx.actionsExecuted++;
  return true;
}

// ── OBNIŻKA/ROLLBACK (kasa PIERWSZA) w jednej inwokacji: set_price → verify → UPDATE DB → confirmed ──
async function executeDown(ctx: Ctx, p: Any, target: number, nextPhase: number | null, reasonPl: string, metrics: Any, isRollback: boolean, proposalId: string | null): Promise<boolean> {
  const shopId = p.shop_id;
  if (!shopId || !p.platform_product_id || !p.platform_variant_id) { ctx.errors.push({ where: 'executeDown', msg: `brak shop/variant produktu ${p.id}` }); return false; }
  const sp = await platform(ctx, 'set_price', { shop_id: shopId, product_id: p.platform_product_id, variant_id: p.platform_variant_id, price: target });
  const vf = sp.ok ? await platform(ctx, 'verify_price', { shop_id: shopId, product_id: p.platform_product_id, variant_id: p.platform_variant_id, expected: target }) : { ok: false, data: null };
  if (!(vf.ok && vf.data?.matches === true)) {
    await ctx.supabase.from('wf2_price_events').insert({ product_id: p.id, project_id: p.project_id, old_price: num(p.price), new_price: target, direction: 'down', trigger_kind: isRollback ? 'rollback' : 'ai_proposal', actor: 'engine', status: 'failed', reason_pl: `${reasonPl} | set_price/verify nieudane (status ${sp.status})`.slice(0, 500), metrics_snapshot: metrics, run_id: ctx.runId, proposal_id: proposalId });
    await alertNote(ctx, p.project_id, p.id, '⚠️ AUTOMAT: obniżka', `⚠️ AUTOMAT: obniżka/rollback nie potwierdzona na platformie dla ${p.name || p.id} (status ${sp.status}).`);
    return false;
  }
  const upd: Record<string, unknown> = { price: target, price_state: 'ok', platform_price: target, platform_synced_at: ctx.nowIso, last_price_change_at: ctx.nowIso, target_snapshot: null };
  if (nextPhase != null) upd.price_phase = nextPhase;
  if (isRollback) upd.rollback_lock_until = new Date(Date.now() + num(ctx.cfg.rollback_lock_days ?? 21) * DAY_MS).toISOString();
  await ctx.supabase.from('wf2_products').update(upd).eq('id', p.id);
  await ctx.supabase.from('wf2_price_events').insert({ product_id: p.id, project_id: p.project_id, old_price: num(p.price), new_price: target, phase_from: p.price_phase, phase_to: nextPhase, direction: 'down', trigger_kind: isRollback ? 'rollback' : 'ai_proposal', actor: 'engine', status: 'confirmed', reason_pl: reasonPl, metrics_snapshot: metrics, platform: { platform_price: target }, run_id: ctx.runId, proposal_id: proposalId });
  ctx.actionsExecuted++;
  // landing 'legacy' → po KAŻDEJ confirmed zmianie karta re-bake (§4.5)
  if (p.landing_price_contract === 'legacy') {
    await createCard(ctx, { projectId: p.project_id, productId: p.id, kind: 'landing_republish', dedup: `landing_republish|${p.id}|${Math.round(target * 100)}`, expires: null, payload: payload(`Cena zmieniona na ${target} zł, landing = legacy (cena zapieczona w kodzie).`, 'Re-bake landingu: zaktualizuj cenę w HTML + JSON-LD wg checklisty.', 0, 0, 'high', null) });
  }
  return true;
}

// ══════════════════════════════════════════════════════════════════════════
// METRYKI — okna z widoku wf2_product_daily (per produkt×dzień) + wf2_ad_stats + wf2_orders
// ══════════════════════════════════════════════════════════════════════════
type Daily = { date: string; spend: number; orders: number; revenue: number; orders_paid: number };
type AdWin = { spend: number; atc: number; lpv: number; impressions: number; freqMax: number };

function sumWindow(rows: Daily[], sinceDate: string): { spend: number; orders: number; revenue: number; orders_paid: number } {
  const acc = { spend: 0, orders: 0, revenue: 0, orders_paid: 0 };
  for (const r of rows) if (r.date >= sinceDate) { acc.spend += num(r.spend); acc.orders += num(r.orders); acc.revenue += num(r.revenue); acc.orders_paid += num(r.orders_paid); }
  return acc;
}

async function loadDaily(ctx: Ctx, productId: string, sinceDate: string): Promise<Daily[]> {
  const { data } = await ctx.supabase.from('wf2_product_daily').select('date, spend, orders, revenue, orders_paid').eq('product_id', productId).gte('date', sinceDate).order('date', { ascending: true });
  return (data || []) as Daily[];
}
async function loadAdWindow(ctx: Ctx, campaignId: string, sinceDate: string): Promise<AdWin> {
  const acc: AdWin = { spend: 0, atc: 0, lpv: 0, impressions: 0, freqMax: 0 };
  if (!campaignId) return acc;
  const { data } = await ctx.supabase.from('wf2_ad_stats').select('spend, atc, lpv, impressions, frequency').eq('campaign_id', campaignId).eq('level', 'campaign').gte('date', sinceDate);
  for (const r of (data || []) as Any[]) { acc.spend += num(r.spend); acc.atc += num(r.atc); acc.lpv += num(r.lpv); acc.impressions += num(r.impressions); acc.freqMax = Math.max(acc.freqMax, num(r.frequency)); }
  return acc;
}
// świeżość ad setu: najmłodszy ad_id (po pierwszym wystąpieniu) — wiek w dniach
async function youngestAdAgeDays(ctx: Ctx, campaignId: string): Promise<number | null> {
  if (!campaignId) return null;
  const { data } = await ctx.supabase.from('wf2_ad_stats').select('ad_id, date').eq('campaign_id', campaignId).eq('level', 'ad').order('date', { ascending: true }).limit(500);
  const firstSeen = new Map<string, string>();
  for (const r of (data || []) as Array<{ ad_id: string; date: string }>) if (r.ad_id && !firstSeen.has(r.ad_id)) firstSeen.set(r.ad_id, r.date);
  if (!firstSeen.size) return null;
  let newest = '0000-00-00';
  for (const d of firstSeen.values()) if (d > newest) newest = d;
  return (Date.now() - Date.parse(`${newest}T00:00:00Z`)) / DAY_MS;
}

// udział COD (P&L/awanse — P15): COUNT wf2_orders is_cod / total dla produktu w oknie 30 dni
async function codShare(ctx: Ctx, projectId: string, productId: string): Promise<number> {
  const since = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const lineMatch = JSON.stringify([{ product_id: productId }]);
  const { count: total } = await ctx.supabase.from('wf2_orders').select('id', { count: 'exact', head: true }).eq('project_id', projectId).gte('order_date', since).contains('lines', lineMatch);
  if (!total) return 0;
  const { count: cod } = await ctx.supabase.from('wf2_orders').select('id', { count: 'exact', head: true }).eq('project_id', projectId).eq('is_cod', true).gte('order_date', since).contains('lines', lineMatch);
  return (cod || 0) / total;
}

// §1 TWARDY PRÓG: liczba zamówień KWALIFIKOWANYCH (is_paid=true OR is_cod=true), ALL-TIME, produkt w lines.
async function qualifyingOrders(ctx: Ctx, projectId: string, productId: string): Promise<number> {
  const lineMatch = JSON.stringify([{ product_id: productId }]);
  const { count } = await ctx.supabase.from('wf2_orders').select('id', { count: 'exact', head: true })
    .eq('project_id', projectId).contains('lines', lineMatch).or('is_paid.eq.true,is_cod.eq.true');
  return count || 0;
}

// S1: liczba podwyżek (price_events direction='up') od ostatniego dnia ze spend>0 — hamulec ratchetu no-ads.
async function noAdsRaisesSinceSpend(ctx: Ctx, productId: string, daily: Daily[]): Promise<number> {
  let last: string | null = null;
  for (const r of daily) if (num(r.spend) > 0 && (!last || r.date > last)) last = r.date;
  const sinceIso = last
    ? new Date(Date.parse(`${last}T23:59:59Z`)).toISOString()
    : new Date(Date.now() - num(ctx.cfg.no_ads_window_days ?? 30) * DAY_MS).toISOString();
  const { count } = await ctx.supabase.from('wf2_price_events').select('id', { count: 'exact', head: true })
    .eq('product_id', productId).eq('direction', 'up').in('status', ['applied', 'confirmed']).gt('at', sinceIso);
  return count || 0;
}

// ── KOSZT EFEKTYWNY + MARŻA NETTO (v3.2 §3) — WSZYSTKIE decyzje silnika na netto ──
// Kolumna GENERATED unit_profit (brutto legacy) w DB = nietykana; wartości netto liczone w locie.

// Ocena ceny zakupu podanej przez klienta: sanity band + normalizacja bazy wg źródła.
//   dropship  → BAZA brutto (VAT nieodliczalny): podał netto → ×(1+vat).
//   wholesale → BAZA netto  (VAT odliczalny):    podał brutto → /(1+vat).
type ClientCost = { has: boolean; raw: number; inBand: boolean; normalizedBase: number | null; source: 'dropship' | 'wholesale'; isNet: boolean };
function clientCostEval(p: Any, cm: CostModel): ClientCost {
  const raw = num(p.client_cost_purchase);
  const source: 'dropship' | 'wholesale' = p.client_cost_source === 'wholesale' ? 'wholesale' : 'dropship';
  const isNet = p.client_cost_is_net === true;
  if (!(raw > 0)) return { has: false, raw: 0, inBand: false, normalizedBase: null, source, isNet };
  const cost = num(p.cost_purchase);
  const [lo, hi] = cm.client_cost_sanity_band;
  const inBand = !(cost > 0) || (raw >= lo * cost && raw <= hi * cost);   // gdy cost_purchase puste → akceptuj
  const v = 1 + cm.vat_rate;
  const base = source === 'dropship' ? (isNet ? raw * v : raw) : (isNet ? raw : raw / v);
  return { has: true, raw, inBand, normalizedBase: Math.round(base * 100) / 100, source, isNet };
}

// effective_cost (PLN, per produkt) = BAZA + dodatki.
//   BAZA: cena klienta w sanity band (priorytet, znormalizowana) inaczej cost_purchase (brutto Ali = dropship).
//   dodatki: + cost_shipping (shipping_paid_by='shop') + dropship_customs_fee_pln (tylko gdy źródło = dropship).
function effectiveCost(p: Any, cm: CostModel): number {
  const cc = clientCostEval(p, cm);
  let base: number, dropship: boolean;
  if (cc.has && cc.inBand && cc.normalizedBase != null) { base = cc.normalizedBase; dropship = cc.source === 'dropship'; }
  else { base = num(p.cost_purchase); dropship = true; }                 // fallback brutto Ali = dropship
  const ship = p.shipping_paid_by === 'shop' ? num(p.cost_shipping) : 0;
  const customs = dropship ? cm.dropship_customs_fee_pln : 0;
  return base + ship + customs;
}

// Marża NETTO tax-aware (model 'goods'): sale_net = price/(1+vat); VAT należny realny, VAT Ali nieodliczalny.
function saleNet(price: number, cm: CostModel): number { return price / (1 + cm.vat_rate); }
function feeNet(p: Any, price: number, cm: CostModel): number { return price * num(p.fees_pct) / 100 / (1 + cm.vat_rate); }
function unitProfitNet(p: Any, price: number, cm: CostModel): number { return saleNet(price, cm) - effectiveCost(p, cm) - feeNet(p, price, cm); }
function marginNetPct(p: Any, price: number, cm: CostModel): number { const sn = saleNet(price, cm); return sn > 0 ? unitProfitNet(p, price, cm) / sn * 100 : 0; }

// mediana (spend-matched baseline collapse S5)
function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
// S4: liczba PEŁNYCH dni od ostatniego dnia ze spend>0 do dziś (0=dziś jest spend; ≥2=luka)
function trailingSpendGapDays(daily: Daily[], todayStr: string): number {
  let last: string | null = null;
  for (const r of daily) if (num(r.spend) > 0 && (!last || r.date > last)) last = r.date;
  if (!last) return 0;
  return Math.max(0, Math.floor((Date.parse(`${todayStr}T00:00:00Z`) - Date.parse(`${last}T00:00:00Z`)) / DAY_MS));
}

// ══════════════════════════════════════════════════════════════════════════
// KLASYFIKACJA AUTONOMII (§3.3) — zwraca null gdy full-auto, inaczej powód (→ karta)
// ══════════════════════════════════════════════════════════════════════════
function autoReasonBlock(ctx: Ctx, p: Any, target: number, stepPct: number, adsState: string, freshAdset: boolean, youngAdAge: number | null, codHeavy: boolean, walls: number[], shipFree: number | null): string | null {
  const cfg = ctx.cfg;
  if (p.pricing_autonomy !== 'auto') return 'autonomy_not_auto';
  if (p.landing_price_contract !== 'hydrated') return 'landing_not_hydrated';
  if (target <= num(p.price)) return 'direction_down';                                   // w dół = ZAWSZE karta
  if (stepPct > num(cfg.auto_step_max_pct ?? 20)) return 'step_over_cap';
  const wallSet = shipFree ? [...walls, shipFree] : walls;
  if (cfg.wall_cross_requires_human !== false && crossesWall(num(p.price), target, wallSet)) return 'wall_cross';
  const cooldown = codHeavy ? num(cfg.cod_cooldown_days ?? 21) : num(cfg.cooldown_days ?? 7);
  if (p.last_price_change_at && (Date.now() - Date.parse(p.last_price_change_at)) < cooldown * DAY_MS) return 'cooldown';
  if (p.rollback_lock_until && Date.parse(p.rollback_lock_until) > Date.now()) return 'rollback_lock';
  if (p.price_state !== 'ok') return 'price_state_not_ok';
  if ((cfg.no_raise_weekdays ?? [4, 5]).includes(ctx.pl.weekday)) return 'no_raise_weekday';
  if (stepPct > num(cfg.small_step_no_adset_pct ?? 10) && !freshAdset) return 'no_fresh_adset';   // P3
  if (youngAdAge != null && youngAdAge < num(cfg.learning_grace_days ?? 3)) return 'learning_grace';   // P4
  if (marginNetPct(p, target, ctx.cm) < num(cfg.min_margin_floor_pct ?? 5)) return 'margin_floor';   // NETTO (v3.2 §3)
  if (adsState !== 'full') return 'ads_not_full';                                        // (b) HOLD / (c) no-ads
  return null;
}

// ══════════════════════════════════════════════════════════════════════════
// scale_base v2 (§2a) — liczone per run z żywych danych
// ══════════════════════════════════════════════════════════════════════════
function scaleBase(ctx: Ctx, p: Any, adSpend: number, orders: number, walls: number[]): { base: number | null; flag: boolean; viableFloor: number; ceiling: number } {
  const cfg = ctx.cfg;
  const fees = num(p.fees_pct) / 100;
  const eff = effectiveCost(p, ctx.cm);       // koszt efektywny (klient/Ali + shipping + cło) — v3.2
  const vat1 = 1 + ctx.cm.vat_rate;
  // CPA_scale_est: pesymistyczny CI (kwantyl 1-cpa_ci_quantile liczby zamówień → mniej zam. = wyższe CPA)
  const cpaTest = orders > 0 ? adSpend / orders : 0;
  const lowerOrders = Math.max(1, poissonQuantileLower(orders, 1 - num(cfg.cpa_ci_quantile ?? 0.65)));
  const cpaScaleEst = adSpend > 0 && orders > 0 ? adSpend / lowerOrders : cpaTest;
  // floory NETTO tax-aware (×1.23 — VAT należny realny; §3): viable_floor / target_price
  const viableFloor = vat1 * (eff + cpaScaleEst) / (1 - fees - num(cfg.scale_margin_survival ?? 0.12));
  const targetPrice = vat1 * eff / (1 - fees - num(cfg.scale_margin_target ?? 0.40));
  const wall = wallAbove(Math.max(num(p.price), targetPrice), walls);
  const ceiling = wall ?? targetPrice * 1.5;                                              // brak danych konkurencji → ściana psych jako ceiling
  if (viableFloor > ceiling) return { base: null, flag: true, viableFloor, ceiling };     // ekonomia nie domyka się przy rynku → FLAGA
  const clamped = Math.min(Math.max(targetPrice, viableFloor), ceiling);
  return { base: psychPriceDown(clamped), flag: false, viableFloor, ceiling };
}

// ══════════════════════════════════════════════════════════════════════════
// COLLAPSE / AUTO-ROLLBACK (§2d) — normalizacja SPENDEM, bramka mocy, potwierdzenie 2 runy
// ══════════════════════════════════════════════════════════════════════════
type CollapseVerdict = { state: 'none' | 'pending' | 'breach' | 'rollback' | 'weak'; expected: number; observed: number; rollbackTarget?: number; rollbackPhase?: number };
async function collapseCheck(ctx: Ctx, p: Any, daily: Daily[], priorBreach: boolean): Promise<CollapseVerdict> {
  const cfg = ctx.cfg;
  if (!p.last_price_change_at) return { state: 'none', expected: 0, observed: 0 };
  const ageDays = (Date.now() - Date.parse(p.last_price_change_at)) / DAY_MS;
  if (ageDays > num(cfg.collapse_max_days ?? 5) + num(cfg.learning_grace_days ?? 3)) return { state: 'none', expected: 0, observed: 0 };
  // ostatni event ceny musi być PODWYŻKĄ (collapse aktywny tylko po podwyżce)
  const { data: lastEv } = await ctx.supabase.from('wf2_price_events').select('direction, old_price, phase_from').in('status', ['applied', 'confirmed']).eq('product_id', p.id).order('at', { ascending: false }).limit(1);
  const ev = (lastEv || [])[0];
  if (!ev || ev.direction !== 'up') return { state: 'none', expected: 0, observed: 0 };

  const changeMs = Date.parse(p.last_price_change_at);
  const baseFrom = dateStr(new Date(changeMs - num(cfg.collapse_baseline_days ?? 7) * DAY_MS));
  const baseTo = dateStr(new Date(changeMs));
  const graceTo = dateStr(new Date(changeMs + num(cfg.learning_grace_days ?? 3) * DAY_MS));   // dni learningu wykluczone z okna oceny
  const rbTarget = num(ev.old_price);
  const rbPhase = num(ev.phase_from) || (p.price_phase - 1);
  // okno POST (po grace) + rozkład dziennego spendu (S5 spend-matched)
  let postOrders = 0, postSpend = 0;
  const postSpends: number[] = [];
  for (const r of daily) if (r.date >= graceTo) { postOrders += num(r.orders); postSpend += num(r.spend); if (num(r.spend) > 0) postSpends.push(num(r.spend)); }
  // okno obserwacji: akumuluj aż spend_po ≥ collapse_min_spend LUB minie collapse_max_days
  if (postSpend < num(cfg.collapse_min_spend ?? 150) && ageDays < num(cfg.collapse_max_days ?? 5)) return { state: 'pending', expected: 0, observed: postOrders };
  // S5: baseline liczony TYLKO z dni o spend > 0.5×mediana spendu POST (spend-matched — eliminuje fałsz z niskiego test-spendu)
  const spendFloor = 0.5 * median(postSpends);
  let baseOrders = 0, baseSpend = 0;
  for (const r of daily) if (r.date >= baseFrom && r.date < baseTo) {
    if (spendFloor > 0 && num(r.spend) <= spendFloor) continue;
    baseOrders += num(r.orders); baseSpend += num(r.spend);
  }
  if (baseSpend <= 0) return { state: 'none', expected: 0, observed: postOrders };   // brak porównywalnego baseline → nie oceniaj
  const tempoBase = baseOrders / baseSpend;
  const expected = tempoBase * postSpend;
  const q10 = poissonQuantileLower(expected, num(cfg.collapse_quantile ?? 0.10));
  // S5: naruszenie = observed ≤ q10 ORAZ względny spadek < collapse_rel_floor (0.6×expected) — nie sam szum Poissona
  const breached = postOrders <= q10 && postOrders < num(cfg.collapse_rel_floor ?? 0.6) * expected;
  if (!breached) return { state: 'none', expected, observed: postOrders };
  if (expected < num(cfg.collapse_min_expected ?? 8)) return { state: 'weak', expected, observed: postOrders, rollbackTarget: rbTarget, rollbackPhase: rbPhase };   // moc <min → karta rollback, nie auto
  if (!priorBreach) return { state: 'breach', expected, observed: postOrders };                                    // pierwszy run naruszenia → obserwuj (flag)
  return { state: 'rollback', expected, observed: postOrders, rollbackTarget: rbTarget, rollbackPhase: rbPhase };
}

// ══════════════════════════════════════════════════════════════════════════
// S6 POST-STEP GUARD (§2) — obrona elastycznych winnerów po podwyżce
// Po opt_window_days od potwierdzonej podwyżki: kontrybucja_netto/zł spendu okno-po vs okno-przed.
// keep < contribution_keep_frac → KARTA obniżki (powrót na poprzedni poziom). NIE łapie collapse (to katastrofy).
// ══════════════════════════════════════════════════════════════════════════
async function postStepGuard(ctx: Ctx, p: Any, daily: Daily[], optDays: number): Promise<Plan | null> {
  const cfg = ctx.cfg;
  if (!p.last_price_change_at) return null;
  const ageDays = (Date.now() - Date.parse(p.last_price_change_at)) / DAY_MS;
  if (ageDays < optDays || ageDays > 2 * optDays) return null;          // okno musi dojrzeć, ale nie oceniaj wstecz w nieskończoność
  // ostatni event ceny = potwierdzona PODWYŻKA
  const { data: lastEv } = await ctx.supabase.from('wf2_price_events').select('direction, old_price, new_price, phase_from, at').in('status', ['applied', 'confirmed']).eq('product_id', p.id).order('at', { ascending: false }).limit(1);
  const ev = (lastEv || [])[0];
  if (!ev || ev.direction !== 'up') return null;
  const changeMs = Date.parse(p.last_price_change_at);
  const beforeFrom = dateStr(new Date(changeMs - optDays * DAY_MS));
  const beforeTo = dateStr(new Date(changeMs));
  let obOrders = 0, obSpend = 0, oaOrders = 0, oaSpend = 0;
  for (const r of daily) {
    if (r.date >= beforeFrom && r.date < beforeTo) { obOrders += num(r.orders); obSpend += num(r.spend); }
    else if (r.date >= beforeTo) { oaOrders += num(r.orders); oaSpend += num(r.spend); }
  }
  if (obSpend <= 0 || oaSpend <= 0) return null;                        // brak porównywalnych okien spendu
  const oldP = num(ev.old_price), newP = num(ev.new_price);
  const cpsBefore = (unitProfitNet(p, oldP, ctx.cm) * obOrders - obSpend) / obSpend;   // kontrybucja NETTO / zł spendu
  const cpsAfter = (unitProfitNet(p, newP, ctx.cm) * oaOrders - oaSpend) / oaSpend;
  if (!(cpsBefore > 0)) return null;                                    // przed też nie zarabiał — nie ma czego bronić
  const keep = cpsAfter / cpsBefore;
  if (keep >= num(cfg.contribution_keep_frac ?? 0.80)) return null;
  const backTo = oldP;
  const backPhase = num(ev.phase_from) || null;
  const ttl = new Date(Date.now() + num(cfg.proposal_ttl_days ?? 14) * DAY_MS).toISOString();
  return { product: p, phase: p.price_phase, action: 'poststep_revert_card',
    reason_pl: `Post-step guard: kontrybucja/zł po podwyżce ${cpsAfter.toFixed(2)} < ${Math.round(num(cfg.contribution_keep_frac ?? 0.80) * 100)}%×${cpsBefore.toFixed(2)} okna-przed (keep ${keep.toFixed(2)}). Karta powrotu do ${backTo}.`,
    metrics: { poststep: { cps_before: Math.round(cpsBefore * 100) / 100, cps_after: Math.round(cpsAfter * 100) / 100, keep: Math.round(keep * 100) / 100, opt_days: optDays } },
    delta_contribution: 0, delta_revenue: 0,
    card: { kind: 'rollback', dedup: `rollback|${p.id}|poststep|${Math.round(backTo * 100)}`, expires: ttl,
      payload: execPayload(payload(`Po podwyżce (${optDays}d) kontrybucja/zł spadła do ${keep.toFixed(2)}× poziomu sprzed zmiany — elastyczny popyt zjada zysk (bez collapse).`, `Rozważ powrót do ${backTo} zł.`, 0, 0, 'medium', ttl), backTo, backPhase) } };
}

// ══════════════════════════════════════════════════════════════════════════
// PĘTLA DECYZYJNA — plan per produkt (bez side-effectów; wykonanie/karty w decideAll)
// ══════════════════════════════════════════════════════════════════════════
type Plan = {
  product: Any; phase: number; action: string; reason_pl: string; metrics: Any;
  delta_contribution: number; delta_revenue: number;
  exec?: { dir: 'up' | 'down' | 'rollback'; target: number; nextPhase: number | null; triggerKind: string };
  card?: { kind: string; dedup: string; expires: string | null; payload: Record<string, unknown> };
  note?: { prefix: string; body: string };
};

async function decideProduct(ctx: Ctx, p: Any, project: Any, parentIds: Set<string>, adsAlive: boolean, priorBreach: boolean): Promise<Plan> {
  const cfg = ctx.cfg;
  const walls: number[] = (cfg.walls ?? [100, 150]).map(num);
  const shipFree = project.shipping_free_threshold != null ? num(project.shipping_free_threshold) : null;
  const ttl = () => new Date(Date.now() + num(cfg.proposal_ttl_days ?? 14) * DAY_MS).toISOString();
  const mk = (action: string, reason: string, metrics: Any = {}, extra: Partial<Plan> = {}): Plan =>
    ({ product: p, phase: p.price_phase, action, reason_pl: reason, metrics, delta_contribution: 0, delta_revenue: 0, ...extra });

  // GUARD: rodzina multipaków (kod rodziny = W4). Produkt-rodzic (ma dzieci) lub dziecko → tylko karta.
  if (p.parent_product_id || parentIds.has(p.id)) return mk('hold_multipack', 'Rodzina multipaków — zmiany rodziny w W4; na razie tylko ręcznie/kartą.', { multipack: true });

  // DATA-QUALITY (P12): unmapped ratio + bijekcja campaign↔produkt
  const dqBij = project.__dqBijection === true;
  const totalGuess = (project.__productCount || 1) + num(project.orders_unmapped_last);
  const unmappedRatio = num(project.orders_unmapped_last) / Math.max(1, totalGuess);
  if (dqBij || unmappedRatio > num(cfg.dq_unmapped_ratio ?? 0.2)) {
    return mk('hold_dq', `Data-quality: ${dqBij ? 'bijekcja campaign↔produkt naruszona' : `unmapped ratio ~${unmappedRatio.toFixed(2)}`}. Pauza DQ (NIE rollback).`, { unmapped_ratio: unmappedRatio, bijection_broken: dqBij },
      { note: { prefix: '⚠️ AUTOMAT: DQ', body: `⚠️ AUTOMAT: DQ pauza projektu ${project.name || project.id} — ${dqBij ? 'jeden campaign_id mapuje >1 produkt' : `rosnące unmapped (~${(unmappedRatio * 100).toFixed(0)}%)`}. Silnik wstrzymuje decyzje cenowe do wyrównania mapowania.` } });
  }

  // METRYKI okien
  const daily30 = await loadDaily(ctx, p.id, daysAgoStr(30));
  const w14 = sumWindow(daily30, daysAgoStr(14));
  const w30 = sumWindow(daily30, daysAgoStr(30));
  const optWindowCod = num(cfg.opt_window_days_cod ?? 21);
  const codH = (await codShare(ctx, project.id, p.id)) > num(cfg.cod_settled_gating_share ?? 0.60);
  const optDays = codH ? optWindowCod : num(cfg.opt_window_days ?? 14);
  const wOpt = sumWindow(daily30, daysAgoStr(optDays));
  // v3.2: koszt efektywny + marża NETTO + zamówienia kwalifikowane (§3, §1) — do metryk i decyzji
  const eff = effectiveCost(p, ctx.cm);
  const upNet = unitProfitNet(p, num(p.price), ctx.cm);
  const mNetPct = marginNetPct(p, num(p.price), ctx.cm);
  const qOrders = await qualifyingOrders(ctx, project.id, p.id);
  const baseMetrics = { w14, w30, cod_heavy: codH, opt_days: optDays,
    effective_cost: Math.round(eff * 100) / 100, unit_profit_net: Math.round(upNet * 100) / 100,
    margin_net_pct: Math.round(mNetPct * 10) / 10, qualifying_orders: qOrders };

  // ŚWIEŻOŚĆ ADS — 3 stany (§4.3)
  let adsState: 'full' | 'hold' | 'no_ads';
  if (!adsAlive) adsState = 'no_ads';                                  // (c) sync martwy
  else if (w14.spend > num(cfg.ads_min_spend_active ?? 1)) adsState = 'full';   // (a) sync żywy + spend
  else adsState = 'hold';                                              // (b) sync żywy, produkt bez spendu

  // S4: dziura danych — spend w oknie 14d (adsState=full) ale ostatnie ≥2 dni spend=0 → hold_dq (NIE no-ads!)
  if (adsState === 'full') {
    const gap = trailingSpendGapDays(daily30, dateStr(new Date()));   // baza UTC (spójnie z oknami daysAgoStr)
    if (gap >= num(cfg.dq_spend_gap_days ?? 2)) {
      return mk('hold_dq', `Data-quality: dziura w spendzie — ostatni spend ${gap} dni temu przy żywym sync globalnym. Pauza DQ (NIE tryb no-ads).`, { ...baseMetrics, spend_gap_days: gap },
        { note: { prefix: '⚠️ AUTOMAT: DQ luka', body: `⚠️ AUTOMAT: DQ luka spendu produktu ${p.name || p.id} — ostatni spend ${gap} dni temu, a kampania wydawała w oknie 14d. Silnik wstrzymuje decyzje cenowe do wyrównania danych (pauza kampanii lub luka syncu).` } });
    }
  }

  // COLLAPSE (po podwyżce) — obrona, priorytet nad awansami, ZWOLNIONA z twardego progu (§1)
  const col = await collapseCheck(ctx, p, daily30, priorBreach);
  if (col.state === 'rollback' && !codH) {
    return mk('rollback_auto', `Collapse potwierdzony (oczek. ${col.expected.toFixed(1)} zam., jest ${col.observed}). Auto-rollback do ${col.rollbackTarget} + lock ${cfg.rollback_lock_days}d.`, { ...baseMetrics, collapse: col },
      { exec: { dir: 'rollback', target: num(col.rollbackTarget), nextPhase: col.rollbackPhase ?? null, triggerKind: 'rollback' } });
  }
  // S9: COD-heavy w prawdziwym collapse NIE dostaje auto-rollbacku → KARTA rollback (dziś gubiony); weak = mała moc
  if (col.state === 'weak' || (col.state === 'rollback' && codH)) {
    const why = col.state === 'weak' ? `moc statystyczna <${num(cfg.collapse_min_expected ?? 8)}` : 'COD-heavy (bez auto-rollbacku)';
    return mk('rollback_card', `Collapse podejrzewany (${why}) — oczek. ${col.expected.toFixed(1)} zam., jest ${col.observed}. Karta rollback (człowiek).`, { ...baseMetrics, collapse: col },
      { card: { kind: 'rollback', dedup: `rollback|${p.id}|${Math.round(num(col.rollbackTarget) * 100)}`, expires: ttl(), payload: execPayload(payload(`Spadek popytu po podwyżce (oczek. ${col.expected.toFixed(1)} zam., jest ${col.observed}); ${why}.`, `Rozważ powrót do ${col.rollbackTarget} zł.`, 0, 0, 'low', ttl()), num(col.rollbackTarget), col.rollbackPhase ?? null) } });
  }
  if (col.state === 'breach') return mk('collapse_watch', `Naruszenie q10 (1. run) — obserwacja, potwierdzę w kolejnym runie.`, { ...baseMetrics, collapse: col, collapse_breach: true });
  if (col.state === 'pending') return mk('collapse_pending', `Okno collapse zbiera dane (spend po zmianie < próg).`, { ...baseMetrics, collapse: col });

  // S6: POST-STEP GUARD — obrona elastycznych winnerów (kontrybucja/zł spadła po podwyżce). Downward = zwolniony z §1.
  const guard = await postStepGuard(ctx, p, daily30, optDays);
  if (guard) return guard;

  // §1 TWARDY PRÓG 5 ZAMÓWIEŃ — PRZED każdą akcją/kartą cenową (winner_reco/price_scale/no-ads/podwyżki).
  //   Wyjątki (już obsłużone WYŻEJ): obrona collapse, post-step, DQ, karty informacyjne.
  if (qOrders < num(cfg.hard_min_orders ?? 5)) {
    return mk('hold_min_orders', `Twardy próg: ${qOrders}/${num(cfg.hard_min_orders ?? 5)} zamówień (opłaconych/COD).`, baseMetrics);
  }

  // TRYB NO-ADS (c) — TYLKO karty, +1 szczebel psych, z HAMULCAMI S1 (§4.3c). hard_min_orders już spełniony (gate wyżej).
  if (adsState === 'no_ads') {
    if (p.price_phase >= HARVEST) return mk('hold_no_ads_locked', 'Sync ads martwy; reżim nie podnosi ceny.', baseMetrics);
    const wNoAds = sumWindow(daily30, daysAgoStr(num(cfg.no_ads_window_days ?? 30)));
    if (!(wNoAds.orders >= num(cfg.winner_orders_no_ads ?? 5) && wNoAds.orders_paid >= num(cfg.min_prepaid_orders ?? 1)))
      return mk('hold_no_ads', `Tryb no-ads: za mało zamówień w oknie (${wNoAds.orders}/${cfg.winner_orders_no_ads}).`, { ...baseMetrics, no_ads: wNoAds });
    // S1a: cooldown minął
    const cd = codH ? num(cfg.cod_cooldown_days ?? 21) : num(cfg.cooldown_days ?? 7);
    if (p.last_price_change_at && (Date.now() - Date.parse(p.last_price_change_at)) < cd * DAY_MS)
      return mk('hold_no_ads_cooldown', `Tryb no-ads: cooldown (${cd}d) jeszcze trwa.`, { ...baseMetrics, no_ads: wNoAds });
    // S1b: liczba podwyżek od ostatniego dnia ze spend>0 < no_ads_max_steps (anty-ratchet)
    const raisesNoAds = await noAdsRaisesSinceSpend(ctx, p.id, daily30);
    if (raisesNoAds >= num(cfg.no_ads_max_steps ?? 2))
      return mk('hold_no_ads_capped', `Tryb no-ads: osiągnięto limit podwyżek bez spendu (${raisesNoAds}/${num(cfg.no_ads_max_steps ?? 2)}).`, { ...baseMetrics, no_ads: wNoAds, no_ads_raises: raisesNoAds });
    // S1c: nowa cena nie przecina ściany (walls + shipping_free_threshold)
    const target = psychPriceUp(num(p.price) + 0.01);
    const wallSet = shipFree ? [...walls, shipFree] : walls;
    if (crossesWall(num(p.price), target, wallSet))
      return mk('hold_no_ads_wall', `Tryb no-ads: podwyżka do ${target} zł przecięłaby ścianę — trzymam.`, { ...baseMetrics, no_ads: wNoAds });
    // S1d: przychód okna 14d ≥ przychód poprzednich 14d (spadek → hold, nie podwyżka)
    const wPrev14 = sumWindow(daily30.filter((r) => r.date < daysAgoStr(14)), daysAgoStr(28));
    if (w14.revenue < wPrev14.revenue)
      return mk('hold_no_ads_decline', `Tryb no-ads: przychód 14d (${w14.revenue.toFixed(0)}) < poprzednie 14d (${wPrev14.revenue.toFixed(0)}) — nie podnoszę.`, { ...baseMetrics, no_ads: wNoAds });
    // wszystkie hamulce OK → karta +1 szczebel
    const dRev = (target - num(p.price)) * wNoAds.orders / Math.max(1, num(cfg.no_ads_window_days ?? 30)) * 14;
    return mk('propose_no_ads', `Tryb no-ads: ${wNoAds.orders} zam./${cfg.no_ads_window_days}d, hamulce S1 OK. Propozycja +1 szczebel do ${target}.`, { ...baseMetrics, no_ads: wNoAds },
      { card: { kind: 'price_scale', dedup: `price_scale|${p.id}|${Math.round(target * 100)}`, expires: ttl(), payload: execPayload(payload(`Sync reklam martwy (>${cfg.ads_fresh_hours}h). ${wNoAds.orders} zam. w ${cfg.no_ads_window_days} dni, ${wNoAds.orders_paid} przedpłat. Hamulce S1 (cooldown/limit/ściana/przychód) OK.`, `Podnieś do ${target} zł — JEDEN szczebel. UWAGA: podwyżka w ciemno (brak danych o elastyczności).`, 0, dRev, 'low', ttl()), target, p.price_phase) } });
  }

  // (b) HOLD — sync żywy, produkt bez spendu: zero kart „podnieś"
  if (adsState === 'hold') return mk('hold_no_spend', 'Sync żywy, produkt bez spendu w oknie 14d — brak sygnału elastyczności.', baseMetrics);

  // ── (a) TRYB PEŁNY: reguły reżimowe v2.1 ────────────────────────────────────
  const adWin = await loadAdWindow(ctx, p.campaign_id, daysAgoStr(14));
  const freshAge = await youngestAdAgeDays(ctx, p.campaign_id);
  const freshAdset = freshAge != null && freshAge <= num(cfg.fresh_adset_days ?? 10);

  // COD-heavy niezweryfikowany (paid_definition≠'paid') → propose-only (P15)
  const codPropose = codH && cfg.paid_definition !== 'paid';

  switch (p.price_phase) {
    case START: {
      // WINNER = CP2 (ATC≥cp2_atc_rate% ORAZ koszt/ATC≤cp2_cost_atc_max) AND orders≥winner_orders AND spend≥winner_spend
      const atcRate = adWin.lpv > 0 ? adWin.atc / adWin.lpv * 100 : 0;
      const costPerAtc = adWin.atc > 0 ? adWin.spend / adWin.atc : Infinity;
      const cp2 = cfg.winner_needs_cp2 === false || (atcRate >= num(cfg.cp2_atc_rate ?? 5) && costPerAtc <= num(cfg.cp2_cost_atc_max ?? 12));
      const orders = w14.orders;
      const winner = cp2 && orders >= num(cfg.winner_orders ?? 5) && adWin.spend >= num(cfg.winner_spend ?? 300);   // v3.2: próg 5
      if (!winner) return mk('hold_start', `START: brak WINNER (CP2 ${cp2 ? 'OK' : `NIE: ATC ${atcRate.toFixed(1)}%/koszt-ATC ${isFinite(costPerAtc) ? costPerAtc.toFixed(1) : '∞'}`}, zam. ${orders}/${cfg.winner_orders}, spend ${adWin.spend.toFixed(0)}/${cfg.winner_spend}).`, { ...baseMetrics, atc_rate: atcRate, cost_per_atc: costPerAtc, ad_spend: adWin.spend });
      // START→RAMP = ZAWSZE KARTA (werdykt WINNER; §3.3 [D-A1] default)
      // S2: CLAMP kroku do auto_step_max_pct od ceny; ściana bliżej → pod ścianę (RAMP = SERIA kroków, nie skok do ściany)
      const stepCap = num(p.price) * (1 + num(cfg.auto_step_max_pct ?? 20) / 100);
      const wall = wallAbove(num(p.price), walls);
      const rampCap = Math.min(stepCap, wall != null ? wall - 0.10 : Infinity);
      let rampTarget = psychPriceDown(rampCap);
      if (!(rampTarget > num(p.price))) rampTarget = psychPriceUp(num(p.price) + 0.01);   // zaparkowany pod ścianą → minimalny szczebel
      const conf = orders >= num(cfg.winner_high_confidence_orders ?? 5) ? 'high' : 'medium';
      const dRev = (rampTarget - num(p.price)) * (w14.orders / 14) * 14;
      const dContrib = (unitProfitNet(p, rampTarget, ctx.cm) - unitProfitNet(p, num(p.price), ctx.cm)) * w14.orders;
      return mk('winner_card', `WINNER: ${orders} zam., ATC ${atcRate.toFixed(1)}%. Karta RAMP do ${rampTarget} (świeży ad set; krok ≤${num(cfg.auto_step_max_pct ?? 20)}%).`, { ...baseMetrics, atc_rate: atcRate, cost_per_atc: costPerAtc, ad_spend: adWin.spend },
        { card: { kind: 'winner_reco', dedup: `winner_reco|${p.id}`, expires: null, payload: execPayload(payload(`Produkt sprzedaje: ${orders} zam., ATC ${atcRate.toFixed(1)}%, spend ${adWin.spend.toFixed(0)} zł.`, `Awansuj do RAMP: cena ${rampTarget} zł na ŚWIEŻYM ad secie z nowymi kreacjami (nie mutuj żywego zwycięzcy).`, dContrib, dRev, conf, null), rampTarget, RAMP) } });
    }
    case RAMP: {
      // RAMP→BASE: ramp_orders AND ramp_spend (COD-heavy: na rozliczonych)
      const orders = codH ? wOpt.orders_paid : w14.orders;
      if (orders < num(cfg.ramp_orders ?? 5) || adWin.spend < num(cfg.ramp_spend ?? 150))   // v3.2: próg 5
        return mk('hold_ramp', `RAMP: za mało (zam. ${orders}/${cfg.ramp_orders}, spend ${adWin.spend.toFixed(0)}/${cfg.ramp_spend}).`, { ...baseMetrics, ad_spend: adWin.spend });
      const sb = scaleBase(ctx, p, adWin.spend, orders, walls);
      if (sb.flag) return mk('flag_over_ceiling', `RAMP→BASE: viable_floor ${sb.viableFloor.toFixed(0)} > ceiling ${sb.ceiling.toFixed(0)} — ekonomia nie domyka się przy rynku.`, { ...baseMetrics, scale: sb },
        { card: { kind: 'price_opt_over_ceiling', dedup: `price_opt_over_ceiling|${p.id}|floor`, expires: ttl(), payload: payload(`Aby przeżyć przy skali trzeba ${sb.viableFloor.toFixed(0)} zł, a rynek/ściana ${sb.ceiling.toFixed(0)} zł.`, 'Tańsze źródło / multipak / kill — decyzja.', 0, 0, 'medium', ttl()) } });
      // S3: scale_base > cena → RAMP→BASE (rzadkie). scale_base ≤ cena (zaparkowany) → RAMP→PROBE bezpośrednio (koniec wiecznego hold_ramp)
      if (sb.base && sb.base > num(p.price))
        return await routeUp(ctx, p, sb.base, BASE, `RAMP→BASE: scale_base ${sb.base} (CPA-est, marża docelowa).`, baseMetrics, adsState, freshAdset, freshAge, codH, walls, shipFree, codPropose, 'price_scale');
      const probePct = (num(cfg.opt_probe_pct_min ?? 15) + num(cfg.opt_probe_pct_max ?? 20)) / 2;
      return await routeUp(ctx, p, num(p.price) * (1 + probePct / 100), PROBE, `RAMP→PROBE (S3): scale_base ${sb.base ?? '—'} ≤ cena — ramp zaparkowany; probe +${probePct.toFixed(0)}% (ponad ścianę = karta).`, baseMetrics, adsState, freshAdset, freshAge, codH, walls, shipFree, codPropose, 'price_opt_over_ceiling');
    }
    case BASE: {
      // BASE→PROBE: jeden probe +opt_probe_pct
      if (w14.orders < num(cfg.ramp_orders ?? 5)) return mk('hold_base', `BASE: mało danych do probe (zam. ${w14.orders}).`, baseMetrics);   // v3.2: próg 5
      const pct = (num(cfg.opt_probe_pct_min ?? 15) + num(cfg.opt_probe_pct_max ?? 20)) / 2;
      const rawTarget = num(p.price) * (1 + pct / 100);
      return await routeUp(ctx, p, rawTarget, PROBE, `BASE→PROBE: jeden probe +${pct.toFixed(0)}%.`, baseMetrics, adsState, freshAdset, freshAge, codH, walls, shipFree, codPropose, 'price_opt_over_ceiling');
    }
    case PROBE: {
      // ocena probe: keep_frac AND MER (miękki gdy marża<mer_gate_min_margin)
      const revPrev = w30.revenue - wOpt.revenue;                      // proxy „przed probe" = wcześniejsza część okna 30d
      const keepFrac = revPrev > 0 ? wOpt.revenue / revPrev : 1;
      const marginBase = marginNetPct(p, num(p.price), ctx.cm) / 100;   // NETTO (v3.2)
      const be = marginBase > 0 ? 1 / marginBase : Infinity;
      const mer = wOpt.spend > 0 ? wOpt.revenue / wOpt.spend : Infinity;
      const merHard = marginBase >= num(cfg.mer_gate_min_margin ?? 0.30);
      const keepOk = keepFrac >= num(cfg.contribution_keep_frac ?? 0.80);
      const merOk = !merHard || mer >= be * num(cfg.mer_be_mult ?? 1.2);
      // harvest?
      const harvest = adWin.freqMax > num(cfg.frequency_decline ?? 3.5);
      if (harvest) return mk('harvest_card', `PROBE: frequency ${adWin.freqMax.toFixed(1)} > ${cfg.frequency_decline} — kandydat na żniwa/rotację.`, { ...baseMetrics, keep_frac: keepFrac, mer },
        { card: { kind: 'price_opt_over_ceiling', dedup: `price_opt_over_ceiling|${p.id}|harvest`, expires: ttl(), payload: payload(`Nasycenie: frequency ${adWin.freqMax.toFixed(1)}, kontrybucja płaska.`, 'Żniwa + rotacja produktu / multipak (AOV).', 0, 0, 'medium', ttl()) } });
      if (keepOk && merOk) return mk('probe_hold', `PROBE trzymany: keep_frac ${keepFrac.toFixed(2)}≥${cfg.contribution_keep_frac}, MER ${mer === Infinity ? '∞' : mer.toFixed(2)} (${merHard ? 'twardy' : 'miękki'}).`, { ...baseMetrics, keep_frac: keepFrac, mer });
      // probe nie utrzymał → karta powrotu na bazę (obniżka = zawsze karta)
      const backTo = psychPriceDown(num(p.price) / (1 + (num(cfg.opt_probe_pct_min ?? 15)) / 100));
      return mk('probe_revert_card', `PROBE nie utrzymał (keep_frac ${keepFrac.toFixed(2)}). Karta powrotu na bazę ${backTo}.`, { ...baseMetrics, keep_frac: keepFrac, mer },
        { card: { kind: 'rollback', dedup: `rollback|${p.id}|${Math.round(backTo * 100)}`, expires: ttl(), payload: execPayload(payload(`Probe +% nie utrzymał kontrybucji (keep_frac ${keepFrac.toFixed(2)} < ${cfg.contribution_keep_frac}).`, `Wróć do bazy ${backTo} zł.`, 0, 0, 'medium', ttl()), backTo, BASE) } });
    }
    case HARVEST: return mk('hold_harvest', 'HARVEST: podwyżki zamrożone, dźwignia = AOV/multipak (karta ręczna).', baseMetrics);
    case LOCKED: return mk('hold_locked', 'LOCKED: optimum, trzymaj.', baseMetrics);
    default: return mk('hold_unknown', `Nieznany reżim price_phase=${p.price_phase}.`, baseMetrics);
  }
}

// wspólne trasowanie PODWYŻKI: pipeline kroku (clamp→psychDown→ściany→dead-band) → auto|karta
async function routeUp(ctx: Ctx, p: Any, rawTarget: number, nextPhase: number, reason: string, metrics: Any, adsState: string, freshAdset: boolean, freshAge: number | null, codH: boolean, walls: number[], shipFree: number | null, codPropose: boolean, cardKind: string): Promise<Plan> {
  const cfg = ctx.cfg;
  const ttl = new Date(Date.now() + num(cfg.proposal_ttl_days ?? 14) * DAY_MS).toISOString();
  // pipeline (§2e): clamp do auto_step_max_pct → psychPriceDown (nigdy ponad cap)
  const cap = num(p.price) * (1 + num(cfg.auto_step_max_pct ?? 20) / 100);
  const capped = Math.min(rawTarget, cap);
  const target = psychPriceDown(capped);
  const stepPct = (target - num(p.price)) / num(p.price) * 100;
  const dRev = (target - num(p.price)) * (num(metrics.w14?.orders ?? 0) / 14) * 14;
  const dContribution = (unitProfitNet(p, target, ctx.cm) - unitProfitNet(p, num(p.price), ctx.cm)) * num(metrics.w14?.orders ?? 0);   // NETTO (v3.2)
  const base: Plan = { product: p, phase: p.price_phase, action: '', reason_pl: reason, metrics: { ...metrics, target, step_pct: stepPct }, delta_contribution: dContribution, delta_revenue: dRev };

  // dead-band + stabilność celu (§2e)
  if (Math.abs(target - num(p.price)) / num(p.price) < num(cfg.target_change_min_pct ?? 10) / 100)
    return { ...base, action: 'hold_deadband', reason_pl: `${reason} Krok ${stepPct.toFixed(1)}% < dead-band ${cfg.target_change_min_pct}%.` };
  const snap = p.target_snapshot as { target?: number; first_seen?: string } | null;
  const stable = snap && Math.abs(num(snap.target) - target) < 0.011 && snap.first_seen && snap.first_seen.slice(0, 10) < ctx.pl.date;
  if (!stable) {
    // zapisz/odśwież snapshot celu (nie wykonuj — czekaj na stabilność target_stability_runs)
    if (!ctx.dryRun) await ctx.supabase.from('wf2_products').update({ target_snapshot: { target, first_seen: ctx.nowIso } }).eq('id', p.id).eq('price_state', 'ok');
    return { ...base, action: 'hold_stability', reason_pl: `${reason} Cel ${target} zapisany — czekam na stabilność (${cfg.target_stability_runs} runy).` };
  }

  // COD-heavy niezweryfikowany → propose-only
  if (codPropose) return { ...base, action: 'propose_cod', card: { kind: cardKind, dedup: `${cardKind}|${p.id}|${Math.round(target * 100)}`, expires: ttl, payload: execPayload(payload(`${reason} COD-heavy, predykat is_paid niezweryfikowany.`, `Podnieś do ${target} zł po weryfikacji rozliczeń COD.`, dContribution, dRev, 'low', ttl), target, nextPhase) } };

  const block = autoReasonBlock(ctx, p, target, stepPct, adsState, freshAdset, freshAge, codH, walls, shipFree);
  if (block) {
    // krok >10% bez świeżego ad setu → karta creative_refresh (P3, NIE wykonywalna — fabryka buduje ad set)
    const kind = block === 'no_fresh_adset' ? 'creative_refresh' : cardKind;
    const base2 = payload(`${reason} Blokada auto: ${block}.`, block === 'no_fresh_adset' ? `Przygotuj świeży ad set, potem podniosę do ${target} zł.` : `Podnieś do ${target} zł.`, dContribution, dRev, block === 'wall_cross' ? 'medium' : 'high', ttl);
    // creative_refresh nie jest wykonywalna przez sweep — bez target; pozostałe (price_*) = wykonywalne po akcepcie
    const cardPayload = kind === 'creative_refresh' ? { ...base2, price_step_target: target } : execPayload(base2, target, nextPhase);
    return { ...base, action: `card_${block}`, card: { kind, dedup: `${kind}|${p.id}|${Math.round(target * 100)}`, expires: ttl, payload: cardPayload } };
  }
  // FULL-AUTO
  return { ...base, action: 'step_up', exec: { dir: 'up', target, nextPhase, triggerKind: 'rung_auto' } };
}

// client_cost poza sanity band → KARTA client_cost_review (§3, pkt 5). INFORMACYJNA — sweep jej NIE wykonuje
// (kind spoza listy wykonywalnych); akcept = Tomek ręcznie przenosi wartość do cost_purchase w panelu.
// Dedup po produkcie + wartości klienta; expires proposal_ttl_days (14).
async function clientCostPass(ctx: Ctx, prods: Any[]): Promise<void> {
  const cm = ctx.cm;
  for (const p of prods) {
    const cc = clientCostEval(p, cm);
    if (!cc.has || cc.inBand) continue;                 // brak ceny klienta lub w paśmie → nic
    const ttl = new Date(Date.now() + num(ctx.cfg.proposal_ttl_days ?? 14) * DAY_MS).toISOString();
    const [lo, hi] = cm.client_cost_sanity_band;
    await createCard(ctx, {
      projectId: p.project_id, productId: p.id, kind: 'client_cost_review',
      dedup: `client_cost_review|${p.id}|${Math.round(cc.raw * 100)}`, expires: ttl,
      payload: {
        observation: `Klient podał koszt zakupu ${cc.raw} zł (${cc.source === 'wholesale' ? 'hurt' : 'dropshipping'}, ${cc.isNet ? 'netto' : 'brutto'}), po normalizacji ${cc.normalizedBase} zł — odbiega od obecnego cost_purchase ${num(p.cost_purchase)} zł (poza pasmem ${lo}–${hi}×).`,
        recommendation: 'Zweryfikuj i — jeśli poprawny — przenieś wartość do cost_purchase ręcznie w panelu.',
        client_cost_value: cc.raw,
        client_cost_normalized: cc.normalizedBase,
        client_cost_source: cc.source,
        client_cost_is_net: cc.isNet,
        current_cost_purchase: num(p.cost_purchase),
        client_note: p.client_cost_note || null,
        informational: true,
      },
    });
  }
}

// ── orkiestracja pętli: plany → karty/noty → wykonania (cap max_price_changes_per_run) → decisions ──
async function decideAll(ctx: Ctx): Promise<void> {
  const cfg = ctx.cfg;
  // liveness ads globalny (dowolny wiersz level='campaign' z date≥ wczoraj-ish; martwy > ads_fresh_hours)
  const { data: liveRow } = await ctx.supabase.from('wf2_ad_stats').select('date').eq('level', 'campaign').order('date', { ascending: false }).limit(1);
  const adsMaxDate = (liveRow || [])[0]?.date as string | undefined;
  const adsAlive = !!adsMaxDate && (Date.now() - Date.parse(`${adsMaxDate}T23:59:59Z`)) <= num(cfg.ads_fresh_hours ?? 48) * 3600_000;

  // projekty (pilot filtruje)
  const pilot: string[] = Array.isArray(cfg.pilot_project_ids) ? cfg.pilot_project_ids.filter(Boolean) : [];
  let projQ = ctx.supabase.from('wf2_projects').select('id, name, platform_shop_id, orders_unmapped_last, shipping_free_threshold').neq('status', 'zamkniety');
  if (pilot.length) projQ = projQ.in('id', pilot);
  const { data: projects } = await projQ;
  const projMap = new Map<string, Any>();
  for (const pr of (projects || []) as Any[]) projMap.set(pr.id, pr);
  if (!projMap.size) return;

  // produkty (status ≠ kill, price NOT NULL, autonomia ≠ off)
  const { data: products } = await ctx.supabase.from('wf2_products')
    .select('id, project_id, name, platform_name, price, price_phase, price_state, phase_started_at, platform_product_id, platform_variant_id, campaign_id, cost_purchase, cost_shipping, fees_pct, shipping_paid_by, pricing_autonomy, last_price_change_at, platform_apply_after, rollback_lock_until, target_snapshot, landing_price_contract, parent_product_id, orders_paid, unit_profit, client_cost_purchase, client_cost_is_net, client_cost_source, client_cost_note, client_cost_set_at')
    .in('project_id', [...projMap.keys()]).neq('status', 'kill').not('price', 'is', null).neq('pricing_autonomy', 'off');
  const prods = (products || []) as Any[];

  // DQ bijekcja + liczność produktów per projekt
  const byProject = new Map<string, Any[]>();
  const parentIds = new Set<string>();
  for (const p of prods) { (byProject.get(p.project_id) || byProject.set(p.project_id, []).get(p.project_id))!.push(p); if (p.parent_product_id) parentIds.add(p.parent_product_id); }
  for (const [pid, list] of byProject) {
    const pr = projMap.get(pid); if (!pr) continue;
    pr.__productCount = list.length;
    const campMap = new Map<string, number>();
    for (const p of list) if (p.campaign_id) campMap.set(p.campaign_id, (campMap.get(p.campaign_id) || 0) + 1);
    pr.__dqBijection = [...campMap.values()].some((n) => n > 1);   // jeden campaign_id → >1 produkt = naruszenie
  }

  // priorBreach: z ostatniego udanego run kind='decision' (potwierdzenie collapse w 2 runach)
  const priorBreach = new Set<string>();
  const { data: lastDec } = await ctx.supabase.from('wf2_engine_runs').select('decisions').eq('kind', 'decision').eq('ok', true).order('started_at', { ascending: false }).limit(1);
  for (const d of ((lastDec || [])[0]?.decisions || []) as Any[]) if (d?.metrics?.collapse_breach === true && d?.product_id) priorBreach.add(d.product_id);

  // 1) plany
  const plans: Plan[] = [];
  for (const p of prods) {
    if (overBudget(ctx)) { ctx.errors.push({ where: 'decideAll', msg: 'deadline — reszta produktów pominięta' }); break; }
    const project = projMap.get(p.project_id); if (!project?.platform_shop_id) continue;
    p.shop_id = project.platform_shop_id;
    try { plans.push(await decideProduct(ctx, p, project, parentIds, adsAlive, priorBreach.has(p.id))); }
    catch (e) { ctx.errors.push({ where: `decideProduct:${p.id}`, msg: e instanceof Error ? e.message : String(e) }); }
  }

  // 2) karty + noty (side-effecty) — pomijane w dry_run (czyste logowanie decyzji)
  if (!ctx.dryRun) {
    await clientCostPass(ctx, prods);   // karty client_cost_review (informacyjne, niezależne od decyzji cenowej)
    for (const pl of plans) {
      if (pl.card) await createCard(ctx, { projectId: pl.product.project_id, productId: pl.product.id, kind: pl.card.kind, dedup: pl.card.dedup, expires: pl.card.expires, payload: pl.card.payload });
      if (pl.note) await alertNote(ctx, pl.product.project_id, pl.product.id, pl.note.prefix, pl.note.body);
    }
    // 3) wykonania: rollbacki NIEZALEŻNIE od capu (kasa pierwsza), podwyżki wg priorytetu zł do capu
    for (const pl of plans.filter((x) => x.exec?.dir === 'rollback')) {
      if (overBudget(ctx)) break;
      await executeDown(ctx, pl.product, pl.exec!.target, pl.exec!.nextPhase, pl.reason_pl, pl.metrics, true, null);
    }
    const raises = plans.filter((x) => x.exec?.dir === 'up').sort((a, b) => Math.abs(b.delta_contribution) - Math.abs(a.delta_contribution));
    let budget = num(cfg.max_price_changes_per_run ?? 5);
    for (const pl of raises) {
      if (budget <= 0 || overBudget(ctx)) break;
      const ok = await executeUp(ctx, pl.product, pl.exec!.target, pl.exec!.nextPhase!, pl.reason_pl, pl.metrics, pl.exec!.triggerKind, null);
      if (ok) budget--;
    }
  }

  // 4) decisions log — KAŻDY produkt (także hold z powodem)
  for (const pl of plans) ctx.decisions.push({ product_id: pl.product.id, name: pl.product.name, phase: pl.phase, action: pl.action, reason_pl: pl.reason_pl, metrics: pl.metrics, delta_revenue_zl: Math.round(pl.delta_revenue) });
}

// ══════════════════════════════════════════════════════════════════════════
// SERWER
// ══════════════════════════════════════════════════════════════════════════
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

    let body: { trigger?: string } = {};
    try { body = await req.json(); } catch { body = {}; }
    const trigger = body.trigger === 'manual' ? 'manual' : 'cron';

    // stale-cleanup na starcie KAŻDEGO wywołania (przed claimem)
    await staleCleanup(supabase);

    const pl = plParts(new Date());
    const nowIso = new Date().toISOString();

    // config — fail-closed
    const { ok: cfgOk, cfg, reason } = await loadConfig(supabase);
    if (!cfgOk) {
      const cl = await claimRun(supabase, trigger === 'manual' ? 'manual' : 'sweep', cfg.dry_run !== false, trigger);
      if (cl.conflict) return J({ status: 'already_running' });
      if (cl.id) await finalizeRun(supabase, cl.id, { ok: false, note: 'config_invalid', errors: [{ where: 'loadConfig', msg: reason }], products_evaluated: 0, actions_executed: 0, cards_created: 0 });
      return J({ status: 'config_invalid', reason }, 200);
    }

    // engine_enabled — heartbeat only
    if (cfg.engine_enabled !== true) {
      const cl = await claimRun(supabase, trigger === 'manual' ? 'manual' : 'sweep', cfg.dry_run !== false, trigger);
      if (cl.conflict) return J({ status: 'already_running' });
      if (cl.id) await finalizeRun(supabase, cl.id, { ok: true, note: 'disabled', products_evaluated: 0, actions_executed: 0, cards_created: 0 });
      return J({ status: 'heartbeat', enabled: false });
    }

    const dryRun = cfg.dry_run === true;

    // gate DECYZJI: brak udanego run kind='decision' dziś (Europe/Warsaw) AND godzina ≥ decision_hour
    let doDecisions = pl.hour >= num(cfg.decision_hour ?? 7);
    if (doDecisions) {
      const { data: recent } = await supabase.from('wf2_engine_runs').select('started_at').eq('kind', 'decision').eq('ok', true).gt('started_at', new Date(Date.now() - 2 * DAY_MS).toISOString());
      for (const r of (recent || []) as Array<{ started_at: string }>) if (plParts(new Date(r.started_at)).date === pl.date) { doDecisions = false; break; }
    }
    const kind = doDecisions ? 'decision' : (trigger === 'manual' ? 'manual' : 'sweep');

    // claim run (UNIQUE aktywny → already_running)
    const cl = await claimRun(supabase, kind, dryRun, trigger);
    if (cl.conflict) return J({ status: 'already_running' });
    const runId = cl.id!;

    const ctx: Ctx = { supabase, baseUrl: SUPABASE_URL, wf2: WF2, cfg, cm: costModel(cfg), runId, nowIso, startedAt, pl, dryRun, errors: [], decisions: [], actionsExecuted: 0, cardsCreated: 0 };

    // SWEEP zawsze; DECYZJE gdy gate przechodzi
    await sweep(ctx);
    if (doDecisions) await decideAll(ctx);

    await finalizeRun(supabase, runId, {
      ok: true, note: doDecisions ? 'decision' : 'sweep',
      products_evaluated: ctx.decisions.length, actions_executed: ctx.actionsExecuted, cards_created: ctx.cardsCreated,
      errors: ctx.errors, decisions: ctx.decisions,   // kolumny NOT NULL DEFAULT '[]' — NIE null (23502 wysypywałby finalize)
    });

    return J({ ok: true, kind, dry_run: dryRun, decisions: ctx.decisions.length, actions: ctx.actionsExecuted, cards: ctx.cardsCreated, errors: ctx.errors.length });
  } catch (e) {
    console.error('[wf2-price-engine] ERROR:', e);
    return J({ error: 'blad_serwera', detail: e instanceof Error ? e.message : String(e) }, 500);
  }
});
