#!/usr/bin/env node
// Smoke test modułu TN Sklepy (workflow v2) — uruchamiać po każdej zmianie modułu:
//   npm run test:wf2
// Sprawdza kontrakty, które pękają NIEZAUWAŻENIE (rozjazd WS↔step_defs, otwarte gate'y
// edge, dziura RLS) — bez dotykania produkcyjnych danych (wyłącznie odczyty i 4xx).
// Sekrety: tn-crm/.env (SUPABASE_SERVICE_KEY). Klucz publiczny = ten sam co w panelu.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUPA = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const ANON = 'sb_publishable_vT94u2GI4gzYl8gCV5sHbQ_Q94YidaI';

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
);
const SK = env.SUPABASE_SERVICE_KEY;
if (!SK) { console.error('Brak SUPABASE_SERVICE_KEY w .env'); process.exit(2); }

let pass = 0, fail = 0;
const ok = (name) => { pass++; console.log(`  OK   ${name}`); };
const bad = (name, why) => { fail++; console.log(`  FAIL ${name} — ${why}`); };

async function rest(path, key) {
  const r = await fetch(`${SUPA}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  return { status: r.status, data: r.status < 300 ? await r.json() : await r.text() };
}
async function edge(fn, body, headers = {}) {
  const r = await fetch(`${SUPA}/functions/v1/${fn}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body || {}),
  });
  return r.status;
}

console.log('=== Smoke test TN Sklepy (wf2) ===\n');

// ── 1. Spójność WS / prompt-mapy w panelu ↔ wf2_step_defs w bazie ──────────
{
  const html = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const { data: defs } = await rest('wf2_step_defs?select=key,stage,scope,owner,sub_of&active=eq.true', SK);
  const defKeys = new Set(defs.map((d) => d.key));

  const wsBlock = html.match(/const WS = \{([\s\S]*?)\n        \};/);
  const wsKeys = new Set([...wsBlock[1].matchAll(/\n\s{12}([a-z_0-9]+):\s*\{/g)].map((m) => m[1]));
  const mapBlock = html.match(/const map = \{([\s\S]*?)\n            \};/);
  const mapKeys = new Set([...mapBlock[1].matchAll(/\n\s{16}([a-z_0-9]+):/g)].map((m) => m[1]));

  const wsOrphans = [...wsKeys].filter((k) => !defKeys.has(k));
  wsOrphans.length ? bad('WS bez definicji w DB', wsOrphans.join(', ')) : ok('każdy klucz WS istnieje w wf2_step_defs');
  const mapOrphans = [...mapKeys].filter((k) => !defKeys.has(k));
  mapOrphans.length ? bad('prompt-mapa bez definicji w DB', mapOrphans.join(', ')) : ok('każdy klucz prompt-mapy istnieje w wf2_step_defs');
  // krok bez WS = dostanie warsztat generyczny (dozwolone) — ale krok admin/auto bez WS i bez
  // prompt-mapy zgłaszamy jako WARN-FAIL, bo to zwykle zapomniany kontrakt nowego kroku.
  // Wyjątek: sub-kroki (sub_of) celowo nie mają WS/promptu — żyją w warsztacie rodzica.
  const bare = defs.filter((d) => d.owner !== 'client' && !d.sub_of && !wsKeys.has(d.key) && !mapKeys.has(d.key)).map((d) => d.key);
  bare.length ? bad('kroki admin/auto bez WS i bez promptu', bare.join(', ')) : ok('wszystkie kroki admin/auto mają WS albo prompt');
  defs.length >= 30 ? ok(`seed kompletny (${defs.length} kroków, ${new Set(defs.map((d) => d.stage)).size} etapów)`) : bad('seed step_defs', `tylko ${defs.length} kroków`);
}

// ── 2. Gate'y edge functions (bez auth = 4xx, nigdy 200) ───────────────────
for (const [fn, body] of [['wf2-platform', { action: 'stores' }], ['wf2-ads', { product_id: '00000000-0000-4000-8000-000000000000' }], ['wf2-orders-sync', {}]]) {
  const st = await edge(fn, body);
  (st === 401 || st === 403) ? ok(`${fn} bez auth → ${st}`) : bad(`${fn} bez auth`, `status ${st} (oczekiwane 401/403)`);
}

// ── 3. Kontrakt wf2-landing-api (publiczny) ────────────────────────────────
{
  const r1 = await fetch(`${SUPA}/functions/v1/wf2-landing-api?product=abc`);
  r1.status === 400 ? ok('landing-api: zły uuid → 400') : bad('landing-api zły uuid', `status ${r1.status}`);
  const r2 = await fetch(`${SUPA}/functions/v1/wf2-landing-api?product=00000000-0000-4000-8000-000000000000`);
  r2.status === 404 ? ok('landing-api: nieznany produkt → 404') : bad('landing-api nieznany produkt', `status ${r2.status}`);
  const { data: prods } = await rest('wf2_products?select=id&limit=1', SK);
  if (prods.length) {
    const r3 = await fetch(`${SUPA}/functions/v1/wf2-landing-api?product=${prods[0].id}`);
    const j = r3.status === 200 ? await r3.json() : {};
    ('price' in j && 'checkout_url' in j && 'sold' in j) ? ok('landing-api: kontrakt {price, checkout_url, sold}') : bad('landing-api kontrakt', `status ${r3.status}, pola: ${Object.keys(j).join(',')}`);
  }
}

// ── 4. RLS: anon NIE widzi tabel wf2_* ─────────────────────────────────────
for (const t of ['wf2_projects', 'wf2_products', 'wf2_costs', 'wf2_orders', 'wf2_artifacts', 'wf2_notes']) {
  const r = await rest(`${t}?select=id&limit=1`, ANON);
  const leak = r.status < 300 && Array.isArray(r.data) && r.data.length > 0;
  leak ? bad(`RLS anon ${t}`, 'anon widzi wiersze!') : ok(`RLS: anon nie widzi ${t}`);
}

// ── 5. Kontrakty w kodzie edge (rozjazdy psujące się CICHO — R5) ───────────
{
  const adsSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads', 'index.ts'), 'utf8');
  adsSrc.includes("'lp_styl_marka'") ? ok('wf2-ads czyta branding z lp_styl_marka (krok fabryki)') : bad('wf2-ads branding-lookup', 'brak lp_styl_marka — kreacje pójdą bez mini-marki');
  const lapSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-landing-api', 'index.ts'), 'utf8');
  (!lapSrc.includes(".select('*')") && !lapSrc.includes('.select("*")')) ? ok('landing-api: jawna lista kolumn (bez .select(*))') : bad('landing-api', '.select(*) na publicznym endpoincie = ryzyko wycieku');
}

// ── 6. Schemat kosztów (zakładka Koszty ma na czym pracować) ───────────────
{
  const r = await rest('wf2_costs?select=id,amount,currency,stage,kind&limit=1', SK);
  r.status < 300 ? ok('wf2_costs dostępne (kolumny amount/currency/stage/kind)') : bad('wf2_costs', `status ${r.status}`);
}

// ── 7. Fabryka statycznych grafik ads (ads_grafiki, rev2 „Manus albo nic") ──
// Asserty statyczne (b/c/d/f) — grep źródeł, bez sieci. Asserty (a/e) sondują DB i
// przechodzą DOPIERO po zaaplikowaniu migracji W2 (20260719d) — przed nią FAIL oczekiwany.
{
  const adsSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads', 'index.ts'), 'utf8');
  const html = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const pkg = readFileSync(join(ROOT, 'package.json'), 'utf8');

  // (b) edge pisze rejestr obrazów (D5) + rehost na ścieżkę kanoniczną D6
  adsSrc.includes('wf2_creatives') ? ok('wf2-ads pisze do rejestru wf2_creatives (D5)') : bad('wf2-ads rejestr', 'brak zapisu wf2_creatives — grafiki bez rodowodu');
  (adsSrc.includes('bud-assets/') && /\/ads\/ad_/.test(adsSrc)) ? ok('wf2-ads rehostuje do bud-assets/<slug>/ads/ (D6)') : bad('wf2-ads storage', 'brak ścieżki kanonicznej bud-assets/…/ads/');

  // (f) ZG9 „Manus albo nic": zero toru fallback Gemini (generate-image / provider gemini)
  /generate-image|gemini/i.test(adsSrc)
    ? bad('wf2-ads tor Gemini (ZG9!)', 'źródło wciąż wywołuje generate-image/gemini — „Manus albo nic" złamane')
    : ok('wf2-ads: zero toru fallback Gemini (ZG9 „Manus albo nic")');

  // (c) prompt-mapa kroku odsyła do SSOT grafik
  html.includes('STANDARD-GRAFIKI-SKLEPY') ? ok('map.ads_grafiki odsyła do STANDARD-GRAFIKI-SKLEPY') : bad('map.ads_grafiki SSOT', 'brak odwołania do STANDARD-GRAFIKI-SKLEPY.md');

  // (d) deploy skryptu pętli wyników (wf2-ads-sync mapuje kreacje po meta_ad_ids)
  pkg.includes('deploy:wf2-ads-sync') ? ok('package.json ma deploy:wf2-ads-sync') : bad('package.json', 'brak deploy:wf2-ads-sync');

  // (a) DB: sub-kroki agr_* z sub_of='ads_grafiki' (timeline fabryki grafik) — po migracji W2
  const agrR = await rest("wf2_step_defs?select=key,sub_of&sub_of=eq.ads_grafiki&active=eq.true", SK);
  const agrKeys = Array.isArray(agrR.data) ? agrR.data.map((d) => d.key).sort() : [];
  const wantAgr = ['agr_brief', 'agr_final', 'agr_generacja', 'agr_qa'];
  wantAgr.every((k) => agrKeys.includes(k))
    ? ok(`step_defs: sub-kroki agr_* (${agrKeys.length}) z sub_of='ads_grafiki'`)
    : bad('step_defs agr_*', `oczekiwane ${wantAgr.join('/')}, jest [${agrKeys.join(', ')}] — migracja W2 (20260719d) zaaplikowana?`);

  // (e) schemat wf2_creatives: kolumna media_type (rejestr obsługuje obrazy) — po migracji W2
  const rc = await rest('wf2_creatives?select=id,media_type,angle,format&limit=1', SK);
  rc.status < 300 ? ok('wf2_creatives ma media_type/angle/format (rejestr obrazów)') : bad('wf2_creatives schemat', `status ${rc.status} — migracja W2 (20260719d) zaaplikowana? (${String(rc.data).slice(0, 120)})`);
}

console.log(`\n=== Wynik: ${pass} OK, ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
