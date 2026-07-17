// bud-offers — silnik ofert zakupu (LOGISTYKA, SSOT: docs/zbuduje/LOGISTYKA.md §4,§7).
// Oferty zakupu per produkt (bud_offers) + kill-gates/scoring sprzedawcy + test-order bramka +
// lejek logistyczny na bud_tt_products.logistics_status/chosen_offer_id.
//
// Panel (2 recenzentów) pisze proste CRUD-y bezpośrednio supabase-js (RLS rw = 2 uid).
// Ten edge robi operacje ZŁOŻONE (service-role): seed z istniejących danych, median-gate,
// scoring wg wag SSOT, spójne przełączanie chosen/backup, walidacja przejść statusu.
//
// Operacje (POST, adminGate: team_member JWT | x-tools-secret; deploy --no-verify-jwt):
//   {op:'seed', keys?, limit?}            — utwórz oferty z chosen_link + ali_candidates dla approved bez ofert
//   {op:'score', offer_id | keys}         — kill-gates + scoring 0-100 z score_breakdown.input (ręczne wartości)
//   {op:'choose', key, offer_id, backup_id?} — ustaw chosen (poprzedni→verified), backup; denorm na produkcie
//   {op:'status', key, logistics_status}  — walidacja enuma; 'ready' wymaga chosen + test verdict='pass' (409)
//   {op:'summary'}                        — liczniki lejka + produkty per status (zakładka panelu)
//
// SILNIK (SSOT §4): score(input) liczy z pól DOSTĘPNYCH; brak pola = 0 pkt (jak product_score).
// BEZ nowych fetchy zewnętrznych — wejście to score_breakdown.input (człowiek/panel wpisuje znane
// wartości sprzedawcy: positive_pct, orders, age_months, DSR-y, badge, foto-recenzje, rozkład ocen).
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { adminGate } from '../_shared/bud-owner.ts'

const RATE = 4  // USD → PLN (spójne z bud-tt-shop / bud-tt-trends: koszt Ali = USD × RATE)
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-tools-secret', 'access-control-allow-methods': 'POST, OPTIONS' }

// ── enumy (brak check-constraint w DB → egzekwujemy tu) ──
const LOGI = ['none', 'sourcing', 'verified', 'test_ordered', 'ready', 'eu_stock', 'pl_stock'] as const
const OFFER_STATUS = ['candidate', 'verified', 'rejected', 'chosen', 'backup'] as const
// dozwolone domeny per source (hostname kończy się na …); 'other' = dowolne https
const SOURCE_DOMAINS: Record<string, string[]> = {
  aliexpress: ['aliexpress.com'],
  cj: ['cjdropshipping.com'],
  allegro: ['allegro.pl'],
  '1688': ['1688.com'],
  bigbuy: ['bigbuy.eu', 'bigbuy.com'],
  other: [],
}
// marki premium (kill-gate: tanio = podróbka)
const PREMIUM_BRANDS = ['apple', 'iphone', 'airpods', 'dyson', 'nike', 'adidas', 'bose', 'sony', 'jbl', 'gopro', 'samsung', 'lego', 'gucci', 'rolex', 'dior', 'chanel', 'louis vuitton', 'stanley', 'north face']

// ── sanityzacja jsonb (wzorzec bud-shop-radar: null-bajty + osierocone surogaty → PGRST102) ──
function cleanStr(s: string): string {
  return s.replace(/\x00/g, '')
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '')
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
}
// deno-lint-ignore no-explicit-any
function deepSanitize(v: any): any {
  if (v === undefined || v === null) return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string') return cleanStr(v)
  if (typeof v === 'boolean') return v
  if (Array.isArray(v)) return v.map(deepSanitize)
  if (typeof v === 'object') { const o: Record<string, any> = {}; for (const k of Object.keys(v)) o[k] = deepSanitize(v[k]); return o }
  return null
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const numOr = (x: unknown): number | null => { const n = parseFloat(String(x ?? '')); return Number.isFinite(n) ? n : null }
const boolish = (x: unknown): boolean => x === true || x === 1 || x === 'true' || (typeof x === 'number' && x > 0) || (typeof x === 'string' && x.trim() !== '' && x !== 'false' && x !== '0')

// Parsuje cenę PLN: liczba → sama; string "109,39 zł" / "1 234,56 zł" → 1234.56. Pusty/0 → null.
function plnFromStr(x: unknown): number | null {
  if (typeof x === 'number') return Number.isFinite(x) && x > 0 ? x : null
  let t = String(x ?? '').replace(/z[łl]/gi, '').replace(/[\s ]/g, '')
  t = t.replace(/\.(?=\d{3}(\D|$))/g, '')  // kropka jako separator tysięcy
  t = t.replace(',', '.').replace(/[^\d.]/g, '')
  const n = parseFloat(t)
  return Number.isFinite(n) && n > 0 ? n : null
}

// Walidacja URL: https + domena dozwolona dla source ('other' = dowolne https).
function validUrl(url: string, source: string): boolean {
  let u: URL
  try { u = new URL(url) } catch { return false }
  if (u.protocol !== 'https:') return false
  const allow = SOURCE_DOMAINS[source]
  if (!allow) return false          // nieznany source
  if (allow.length === 0) return true // 'other'
  const host = u.hostname.toLowerCase()
  return allow.some((d) => host === d || host.endsWith('.' + d))
}

// ─────────────────────────── SILNIK (SSOT §4) ───────────────────────────
// Kontrakt: score(input) → { killed, kill_reasons[], score, tier, breakdown, points }.
// KILL-GATES (auto-odrzut): wiek<6mies (znany) · świeży(<12mies)+wolumen>1000 (kupiony) ·
//   positive<90% · cena<55% mediany dopasowanych ofert tego key · marka premium tanio ·
//   zdjęcia stock (pole ręczne input.stock_photo). Brak danych = gate nieaktywny (nie zabija w ciemno).
// SCORING 0-100 (brak składowej = 0 pkt): positive 20 · wolumen 20 · wiek 15 · DSR(opis/wys/kom) 25 ·
//   badge 8 · foto-recenzje 7 · rozkład ocen 5. Progi: ≥75 kupuj · 55-74 test-order · <55 backup.
const WEIGHTS = { positive: 20, orders: 20, age: 15, dsr: 25, badge: 8, photo_reviews: 7, rating_dist: 5 }
// DSR: ENUM 'better'|'equal'|'worse' → pełne/połowa/0 (desc 10 · ship 8 · comm 7 = 25 = WEIGHTS.dsr)
const DSR_W = { desc: 10, ship: 8, comm: 7 }
// deno-lint-ignore no-explicit-any
function dsrPts(v: any, full: number): number {
  const s = String(v ?? '').trim().toLowerCase()
  if (s === 'better') return full
  if (s === 'equal') return full / 2
  if (s === 'worse') return 0
  // fallback numeryczny (legacy skala Ali 4.2-5.0) gdy ktoś poda liczbę
  const n = numOr(v)
  return n != null ? clamp01((n - 4.2) / 0.8) * full : 0
}
// badge: 'choice'→8 · 'top'→6 · ''/'none'/brak→0
function badgePts(b: unknown): number {
  const s = String(b ?? '').trim().toLowerCase()
  if (s === 'choice') return 8
  if (s === 'top') return 6
  return 0
}

// deno-lint-ignore no-explicit-any
function scoreEngine(input: any, ctx: { median?: number | null; total?: number | null; key?: string; seller?: string } = {}) {
  input = input && typeof input === 'object' ? input : {}
  const kill: string[] = []
  const warn: string[] = []
  const positive = numOr(input.positive_pct)
  const orders = numOr(input.orders)
  const age = numOr(input.age_months)

  // ── KILL-GATES ──
  if (age != null && age < 6) kill.push(`wiek_sklepu_${age}m_<6mies`)
  if (age != null && age < 12 && orders != null && orders > 1000) kill.push('swiezy_sklep_wolumen>1000_kupiony')
  if (positive != null && positive < 90) kill.push(`positive_${positive}%_<90`)
  // cena < 55% mediany dopasowanych ofert tego key (podróbka/scam)
  if (ctx.median != null && ctx.median > 0 && ctx.total != null && ctx.total > 0 && ctx.total < 0.55 * ctx.median) {
    kill.push(`cena_${Math.round(ctx.total)}pln_<55%_mediany_${Math.round(ctx.median)}pln`)
  }
  // marka premium — słowo marki NIE killuje samo (P2-4): kill TYLKO gdy dopasowanie marki
  // ORAZ mediana istnieje ORAZ total < 0.7×mediany (podejrzana cena). Sam match → warning.
  const hay = `${ctx.key || ''} ${ctx.seller || ''} ${input.title || ''}`.toLowerCase()
  const brand = PREMIUM_BRANDS.find((b) => new RegExp(`(^|[^a-z])${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(hay))
  if (brand) {
    const brandCheap = ctx.median != null && ctx.median > 0 && ctx.total != null && ctx.total > 0 && ctx.total < 0.7 * ctx.median
    if (brandCheap) kill.push(`marka_premium_${brand}_cena_${Math.round(ctx.total!)}pln_<70%_mediany_${Math.round(ctx.median!)}pln`)
    else warn.push(`marka_premium_${brand}`)
  }
  // zdjęcia stock/kradzione — NIE automatyzujemy; pole ręczne
  if (boolish(input.stock_photo)) kill.push('zdjecia_stock_recznie')

  // ── SCORING (brak pola = 0) ──
  const pts: Record<string, number> = {}
  // positive%: floor 90 (poniżej = kill); 90→0, 100→pełne — nagradza dystans nad progiem
  if (positive != null) pts.positive = clamp01((positive - 90) / 10) * WEIGHTS.positive
  // wolumen: log-skala, 10k zamówień = pełne
  if (orders != null) pts.orders = clamp01(Math.log10(orders + 1) / Math.log10(10000)) * WEIGHTS.orders
  // wiek: 24 mies. = pełne (starszy = wiarygodniejszy)
  if (age != null) pts.age = clamp01(age / 24) * WEIGHTS.age
  // DSR opis/wysyłka/komunikacja — ENUM better/equal/worse → pełne/połowa/0 (10/8/7)
  const dsrVals = [input.dsr_desc, input.dsr_ship, input.dsr_comm]
  if (dsrVals.some((v) => v !== undefined && v !== null && String(v).trim() !== '')) {
    pts.dsr = dsrPts(input.dsr_desc, DSR_W.desc) + dsrPts(input.dsr_ship, DSR_W.ship) + dsrPts(input.dsr_comm, DSR_W.comm)
  }
  // badge: choice→8 · top→6 · reszta→0 (nie przyznaje gdy 0)
  if (input.badge !== undefined && input.badge !== null) {
    const bp = badgePts(input.badge)
    if (bp > 0) pts.badge = bp
  }
  // foto-recenzje realne — boolean (true→pełne)
  if (input.photo_reviews !== undefined && input.photo_reviews !== null && boolish(input.photo_reviews)) pts.photo_reviews = WEIGHTS.photo_reviews
  // rozkład ocen realistyczny — boolean (true→pełne)
  if (input.rating_dist_ok !== undefined && input.rating_dist_ok !== null && boolish(input.rating_dist_ok)) pts.rating_dist = WEIGHTS.rating_dist

  const killed = kill.length > 0
  let total = 0
  for (const k of Object.keys(WEIGHTS)) total += pts[k] ?? 0
  const score = killed ? 0 : Math.round(total)
  const tier = killed ? 'rejected' : score >= 75 ? 'buy' : score >= 55 ? 'test_order' : 'backup'
  const breakdown: Record<string, number> = {}
  for (const k of Object.keys(pts)) breakdown[k] = +pts[k].toFixed(1)
  return {
    killed, kill_reasons: kill, warnings: warn, score, tier,
    breakdown, weights: WEIGHTS,
    ctx: { median_pln: ctx.median ?? null, total_pln: ctx.total ?? null },
    scored_at: new Date().toISOString(),
  }
}

// ─────────────────────────── helpery DB ───────────────────────────
// deno-lint-ignore no-explicit-any
async function offersOfKey(supabase: any, key: string): Promise<any[]> {
  const { data } = await supabase.from('bud_offers').select('*').eq('key', key).range(0, 999)
  return data || []
}
// mediana totali (price+shipping) po ofertach z ceną — potrzebna >=3 do gate ceny
function medianTotal(offers: any[]): number | null {
  const totals = offers.map((o) => (o.price_pln != null ? +o.price_pln + (+o.shipping_pln || 0) : null))
    .filter((x): x is number => x != null && x > 0).sort((a, b) => a - b)
  if (totals.length < 3) return null
  const m = Math.floor(totals.length / 2)
  return totals.length % 2 ? totals[m] : (totals[m - 1] + totals[m]) / 2
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  if (!(await adminGate(req, supabase))) return new Response(JSON.stringify({ error: 'wymagane_logowanie_admin' }), { status: 403, headers: { ...cors, 'content-type': 'application/json' } })
  const J = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'content-type': 'application/json' } })
  const body = await req.json().catch(() => ({}))
  const op = String(body.op || '')

  // ══════════════════════════ SEED ══════════════════════════
  // Dla approved BEZ żadnej oferty: utwórz oferty z istniejących danych (chosen_link='chosen',
  // ali_candidates[]='candidate'). Idempotentne (nie dubluj po url+key). logistics_status null→'sourcing'.
  if (op === 'seed') {
    const limit = Math.min(Math.max(1, +body.limit || 50), 200)
    let q = supabase.from('bud_tt_products')
      .select('id,key,pl_name,status,logistics_status,chosen_offer_id,chosen_link,ali_candidates,ali_snapshot')
      .eq('status', 'approved')
    if (Array.isArray(body.keys) && body.keys.length) q = q.in('key', body.keys)
    const { data: prods, error } = await q.range(0, 999)
    if (error) return J({ error: error.message }, 500)

    // tylko produkty bez ISTNIEJĄCYCH ofert (chyba że podano keys — wtedy i tak dedup po url)
    const keys = (prods || []).map((p: any) => p.key)
    const existingByKey = new Map<string, Set<string>>()
    if (keys.length) {
      for (let off = 0; ; off += 1000) {
        const { data: ex } = await supabase.from('bud_offers').select('key,url').in('key', keys).range(off, off + 999)
        if (!ex?.length) break
        for (const o of ex) { if (!existingByKey.has(o.key)) existingByKey.set(o.key, new Set()); existingByKey.get(o.key)!.add(o.url) }
        if (ex.length < 1000) break
      }
    }

    const targets = (prods || []).filter((p: any) => !existingByKey.has(p.key) || existingByKey.get(p.key)!.size === 0).slice(0, limit)
    let offersCreated = 0, seededProducts = 0
    const sample: any[] = []

    for (const p of targets) {
      const seen = existingByKey.get(p.key) || new Set<string>()
      const rows: any[] = []
      // seller z ali_snapshot (gdy jest)
      const snap = p.ali_snapshot || {}
      const sellerName = (snap.seller?.name || snap.store?.name || snap.seller_name || null)
      const sellerId = (snap.seller?.id || snap.store?.id || snap.seller_id || null)
      const snapUsd = snap?.price?.sale
      const snapPln = (snapUsd != null && Number.isFinite(+snapUsd) && +snapUsd > 0) ? +(+snapUsd * RATE).toFixed(2) : null

      // 1) oferta 'chosen' z chosen_link
      let chosenUrl: string | null = null
      if (p.chosen_link && validUrl(String(p.chosen_link), 'aliexpress') && !seen.has(String(p.chosen_link))) {
        chosenUrl = String(p.chosen_link)
        rows.push({
          key: p.key, source: 'aliexpress', url: chosenUrl,
          seller_name: sellerName ? String(sellerName).slice(0, 120) : null,
          seller_id: sellerId ? String(sellerId).slice(0, 60) : null,
          price_pln: snapPln, shipping_pln: null, delivery_days: null,
          status: 'chosen', notes: 'seed: chosen_link', score_breakdown: { input: {}, from: 'seed_snapshot' },
        })
        seen.add(chosenUrl)
      }
      // 2) oferty 'candidate' z ali_candidates[]
      const cands = Array.isArray(p.ali_candidates) ? p.ali_candidates : []
      for (const c of cands) {
        const link = String(c?.link || '')
        if (!link || seen.has(link) || !validUrl(link, 'aliexpress')) continue
        rows.push({
          key: p.key, source: 'aliexpress', url: link,
          seller_name: null, seller_id: null,
          price_pln: plnFromStr(c?.price), shipping_pln: null, delivery_days: null,
          status: 'candidate', notes: 'seed: ali_candidate', score_breakdown: { input: {}, from: 'seed_candidate' },
        })
        seen.add(link)
      }
      if (!rows.length) continue

      const clean = rows.map(deepSanitize)
      const { data: ins, error: iErr } = await supabase.from('bud_offers').insert(clean).select('id,url,status')
      if (iErr) { console.warn('[bud-offers] seed insert', p.key, iErr.message); continue }
      offersCreated += ins?.length || 0
      seededProducts++
      existingByKey.set(p.key, seen)

      // denorm: logistics_status null → 'sourcing'; chosen_offer_id na nową ofertę 'chosen' (jeśli brak)
      const patch: Record<string, unknown> = {}
      if (p.logistics_status == null || p.logistics_status === 'none') patch.logistics_status = 'sourcing'
      const chosenOffer = (ins || []).find((o: any) => o.status === 'chosen')
      if (chosenOffer && !p.chosen_offer_id) patch.chosen_offer_id = chosenOffer.id
      if (Object.keys(patch).length) await supabase.from('bud_tt_products').update(patch).eq('id', p.id)
      if (sample.length < 15) sample.push({ key: p.key, offers: ins?.length || 0, chosen_url: chosenUrl })
    }
    return J({ ok: true, seeded_products: seededProducts, offers_created: offersCreated, sample })
  }

  // ══════════════════════════ SCORE ══════════════════════════
  // Kill-gates + scoring dla ofert. Wejście = score_breakdown.input (ręcznie wpisane wartości sprzedawcy).
  if (op === 'score') {
    let offers: any[] = []
    if (body.offer_id) {
      const { data } = await supabase.from('bud_offers').select('*').eq('id', String(body.offer_id)).maybeSingle()
      if (!data) return J({ error: 'oferta_nieznana' }, 404)
      offers = [data]
    } else if (Array.isArray(body.keys) && body.keys.length) {
      const { data } = await supabase.from('bud_offers').select('*').in('key', body.keys).range(0, 999)
      offers = data || []
    } else {
      return J({ error: 'brak_offer_id_lub_keys' }, 400)
    }
    if (!offers.length) return J({ error: 'brak_ofert' }, 404)

    // mediany per key (dla gate ceny) — z pełnego zestawu ofert danego key
    const keySet = [...new Set(offers.map((o) => o.key))]
    const medians = new Map<string, number | null>()
    for (const k of keySet) medians.set(k, medianTotal(await offersOfKey(supabase, k)))

    // wejściowe wartości sprzedawcy z body.inputs → ZAPIS do score_breakdown.input PRZED liczeniem
    // (merge z istniejącym). Gdy brak body.inputs — liczymy z tego, co już jest w ofercie.
    const bodyInputs = (body.inputs && typeof body.inputs === 'object' && !Array.isArray(body.inputs)) ? body.inputs : null
    const results: any[] = []
    let single: any = null
    for (const o of offers) {
      const existingInput = (o.score_breakdown && typeof o.score_breakdown === 'object' && o.score_breakdown.input && typeof o.score_breakdown.input === 'object') ? o.score_breakdown.input : {}
      const input = bodyInputs ? { ...existingInput, ...bodyInputs } : existingInput
      const total = o.price_pln != null ? +o.price_pln + (+o.shipping_pln || 0) : null
      const res = scoreEngine(input, { median: medians.get(o.key), total, key: o.key, seller: o.seller_name })
      const gates = { killed: res.killed, kill_reasons: res.kill_reasons, warnings: res.warnings, tier: res.tier }
      const breakdown = deepSanitize({ input, ...res })
      const patch: Record<string, unknown> = {
        seller_score: res.score,
        gates: deepSanitize(gates),
        score_breakdown: breakdown,
        status: res.killed && o.status !== 'chosen' && o.status !== 'backup' ? 'rejected' : o.status,
      }
      const { error: uErr } = await supabase.from('bud_offers').update(patch).eq('id', o.id)
      if (uErr) console.warn('[bud-offers] score update', o.id, uErr.message)
      const r = {
        id: o.id, key: o.key, seller_score: res.score, killed: res.killed,
        gates: { killed: res.killed, kill_reasons: res.kill_reasons, warnings: res.warnings },
        kill_reasons: res.kill_reasons, warnings: res.warnings, tier: res.tier, breakdown: res.breakdown,
      }
      results.push(r)
      if (!single) single = r
    }
    // Pojedyncza oferta (offer_id) → pola TOP-LEVEL (panel je czyta). Zawsze też results[].
    const top = (body.offer_id && single) ? {
      seller_score: single.seller_score,
      gates: single.gates,
      breakdown: single.breakdown,
      tier: single.tier,
    } : {}
    return J({ ok: true, scored: results.length, ...top, results })
  }

  // ══════════════════════════ CHOOSE ══════════════════════════
  // Ustaw ofertę główną (chosen); poprzednia chosen → verified; backup → backup. Denorm na produkcie.
  if (op === 'choose') {
    const key = String(body.key || '')
    const offerId = String(body.offer_id || '')
    if (!key || !offerId) return J({ error: 'brak_key_lub_offer_id' }, 400)
    const { data: prod } = await supabase.from('bud_tt_products').select('id,key,logistics_status').eq('key', key).maybeSingle()
    if (!prod) return J({ error: 'produkt_nieznany' }, 404)
    const { data: chosen } = await supabase.from('bud_offers').select('*').eq('id', offerId).eq('key', key).maybeSingle()
    if (!chosen) return J({ error: 'oferta_nie_pasuje_do_key' }, 404)

    // poprzednie 'chosen' (inne niż wybrana) → verified
    await supabase.from('bud_offers').update({ status: 'verified' }).eq('key', key).eq('status', 'chosen').neq('id', offerId)
    // wybrana → chosen
    await supabase.from('bud_offers').update({ status: 'chosen' }).eq('id', offerId)
    // backup (opcjonalny)
    let backupId: string | null = null
    if (body.backup_id) {
      const bid = String(body.backup_id)
      const { data: bk } = await supabase.from('bud_offers').select('id').eq('id', bid).eq('key', key).maybeSingle()
      if (!bk) return J({ error: 'backup_nie_pasuje_do_key' }, 404)
      // zdejmij poprzedni backup, ustaw nowy
      await supabase.from('bud_offers').update({ status: 'verified' }).eq('key', key).eq('status', 'backup').neq('id', bid)
      await supabase.from('bud_offers').update({ status: 'backup' }).eq('id', bid)
      backupId = bid
    }
    // denorm: chosen_offer_id; sourcing → verified
    const patch: Record<string, unknown> = { chosen_offer_id: offerId }
    if (prod.logistics_status === 'sourcing' || prod.logistics_status == null || prod.logistics_status === 'none') patch.logistics_status = 'verified'
    await supabase.from('bud_tt_products').update(patch).eq('id', prod.id)
    return J({ ok: true, key, chosen_offer_id: offerId, backup_id: backupId, logistics_status: patch.logistics_status || prod.logistics_status })
  }

  // ══════════════════════════ STATUS ══════════════════════════
  // Zmiana logistics_status z walidacją enuma. 'ready' wymaga chosen offer + test verdict='pass'.
  if (op === 'status') {
    const key = String(body.key || '')
    const ls = String(body.logistics_status || '')
    if (!key) return J({ error: 'brak_key' }, 400)
    if (!LOGI.includes(ls as any)) return J({ error: 'niepoprawny_logistics_status', allowed: LOGI }, 400)
    const { data: prod } = await supabase.from('bud_tt_products').select('id,key,chosen_offer_id').eq('key', key).maybeSingle()
    if (!prod) return J({ error: 'produkt_nieznany' }, 404)
    if (ls === 'ready') {
      const { data: chosenOffers } = await supabase.from('bud_offers').select('id').eq('key', key).eq('status', 'chosen').limit(1)
      if (!chosenOffers?.length) return J({ error: 'brak_wybranej_oferty', powod: "przejscie na 'ready' wymaga oferty chosen" }, 409)
      const { data: pass } = await supabase.from('bud_test_orders').select('id').eq('key', key).eq('verdict', 'pass').limit(1)
      if (!pass?.length) return J({ error: 'brak_test_order_pass', powod: "przejscie na 'ready' wymaga test_order z verdict='pass'" }, 409)
    }
    await supabase.from('bud_tt_products').update({ logistics_status: ls }).eq('id', prod.id)
    return J({ ok: true, key, logistics_status: ls })
  }

  // ══════════════════════════ SUMMARY ══════════════════════════
  // Liczniki lejka logistics_status (approved) + produkty per status dla zakładki panelu.
  if (op === 'summary') {
    const prods: any[] = []
    for (let off = 0; ; off += 1000) {
      const { data, error } = await supabase.from('bud_tt_products')
        .select('id,key,pl_name,logistics_status,chosen_offer_id').eq('status', 'approved').range(off, off + 999)
      if (error) return J({ error: error.message }, 500)
      if (!data?.length) break
      prods.push(...data); if (data.length < 1000) break
    }
    const keys = prods.map((p) => p.key)
    // liczba ofert per key
    const nOffers = new Map<string, number>()
    const chosenUrl = new Map<string, string>()
    for (let off = 0; keys.length; off += 1000) {
      const { data } = await supabase.from('bud_offers').select('key,url,status,id').in('key', keys).range(off, off + 999)
      if (!data?.length) break
      for (const o of data) { nOffers.set(o.key, (nOffers.get(o.key) || 0) + 1); if (o.status === 'chosen') chosenUrl.set(o.key, o.url) }
      if (data.length < 1000) break
    }
    // ostatni test verdict per key (bud_test_orders zwraca rosnąco po ordered_at → bierzemy ostatni)
    const lastVerdict = new Map<string, string>()
    const lastStamp = new Map<string, string>()
    for (let off = 0; keys.length; off += 1000) {
      const { data } = await supabase.from('bud_test_orders').select('key,verdict,ordered_at,created_at').in('key', keys).range(off, off + 999)
      if (!data?.length) break
      for (const t of data) {
        if (!t.verdict) continue
        const stamp = String(t.ordered_at || t.created_at || '')
        if (!lastStamp.has(t.key) || stamp >= (lastStamp.get(t.key) || '')) { lastVerdict.set(t.key, t.verdict); lastStamp.set(t.key, stamp) }
      }
      if (data.length < 1000) break
    }
    // liczniki lejka
    const funnel: Record<string, number> = {}
    for (const s of LOGI) funnel[s] = 0
    funnel['null'] = 0
    for (const p of prods) { const s = p.logistics_status || 'null'; funnel[s] = (funnel[s] || 0) + 1 }
    const products = prods.map((p) => ({
      key: p.key, pl_name: p.pl_name, logistics_status: p.logistics_status || 'none',
      n_offers: nOffers.get(p.key) || 0,
      chosen_url: chosenUrl.get(p.key) || null,
      last_test_verdict: lastVerdict.get(p.key) || null,
    }))
    return J({ ok: true, approved_total: prods.length, funnel, products })
  }

  return J({ error: 'nieznana_operacja', ops: ['seed', 'score', 'choose', 'status', 'summary'] }, 400)
})
