#!/usr/bin/env node
// Smoke test modułu TN Sklepy (workflow v2) — uruchamiać po każdej zmianie modułu:
//   npm run test:wf2
// Sprawdza kontrakty, które pękają NIEZAUWAŻENIE (rozjazd WS↔step_defs, otwarte gate'y
// edge, dziura RLS) — bez dotykania produkcyjnych danych (wyłącznie odczyty i 4xx).
// Sekrety: tn-crm/.env (SUPABASE_SERVICE_KEY). Klucz publiczny = ten sam co w panelu.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
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
for (const [fn, body] of [['wf2-platform', { action: 'stores' }], ['wf2-orders-sync', {}], ['wf2-merchant', { action: 'list_accounts' }]]) {
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
for (const t of ['wf2_projects', 'wf2_products', 'wf2_costs', 'wf2_orders', 'wf2_artifacts', 'wf2_notes', 'wf2_merchant_accounts']) {
  const r = await rest(`${t}?select=id&limit=1`, ANON);
  const leak = r.status < 300 && Array.isArray(r.data) && r.data.length > 0;
  leak ? bad(`RLS anon ${t}`, 'anon widzi wiersze!') : ok(`RLS: anon nie widzi ${t}`);
}

// ── 5. Kontrakty w kodzie edge (rozjazdy psujące się CICHO — R5) ───────────
{
  const lapSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-landing-api', 'index.ts'), 'utf8');
  (!lapSrc.includes(".select('*')") && !lapSrc.includes('.select("*")')) ? ok('landing-api: jawna lista kolumn (bez .select(*))') : bad('landing-api', '.select(*) na publicznym endpoincie = ryzyko wycieku');
}

// ── 6. Schemat kosztów (zakładka Koszty ma na czym pracować) ───────────────
{
  const r = await rest('wf2_costs?select=id,amount,currency,stage,kind&limit=1', SK);
  r.status < 300 ? ok('wf2_costs dostępne (kolumny amount/currency/stage/kind)') : bad('wf2_costs', `status ${r.status}`);
}

// ── 7. Fabryka statycznych banerów ads (ads_grafiki) — silnik ad-forge/fal, Manus USUNIĘTY ──
// Asserty statyczne (b/c/f/d) — grep źródeł, bez sieci. Asserty (a/e) sondują DB i
// przechodzą DOPIERO po zaaplikowaniu migracji W2 (20260719d) — przed nią FAIL oczekiwany.
{
  const ADFORGE = join(ROOT, 'scripts', 'mockup-tools', 'ad-forge.py');
  const html = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const pkg = readFileSync(join(ROOT, 'package.json'), 'utf8');
  let adforge = '';
  try { adforge = readFileSync(ADFORGE, 'utf8'); } catch (_) { /* brak pliku = bad niżej */ }

  // (b) ad-forge.py = silnik fabryki: plik istnieje + kontrakt checklisty + silnik fal (nano-banana)
  adforge ? ok('ad-forge.py istnieje (silnik fabryki banerów)') : bad('ad-forge.py', 'brak scripts/mockup-tools/ad-forge.py');
  adforge.includes('ADS_GRAFIKI_CHECKLIST') ? ok('ad-forge.py ma ADS_GRAFIKI_CHECKLIST (kontrakt checklisty)') : bad('ad-forge.py checklist', 'brak ADS_GRAFIKI_CHECKLIST');
  adforge.includes('nano-banana') ? ok('ad-forge.py używa silnika fal (nano-banana)') : bad('ad-forge.py silnik', 'brak nano-banana — silnik fal?');

  // (f) Manus USUNIĘTY z modułu: zero wzmianek 'manus' w ad-forge.py + skasowany katalog wf2-ads
  /manus/i.test(adforge)
    ? bad('ad-forge.py wciąż wspomina Manus', "źródło zawiera 'manus' (case-insensitive) — miał zniknąć z modułu")
    : ok('ad-forge.py: zero wzmianek o Manusie');
  existsSync(join(ROOT, 'supabase', 'functions', 'wf2-ads'))
    ? bad('katalog wf2-ads istnieje', 'funkcja Manus miała być skasowana')
    : ok('brak katalogu supabase/functions/wf2-ads (funkcja Manus usunięta)');

  // (c) prompt-mapa kroku odsyła do SSOT grafik
  html.includes('STANDARD-GRAFIKI-SKLEPY') ? ok('map.ads_grafiki odsyła do STANDARD-GRAFIKI-SKLEPY') : bad('map.ads_grafiki SSOT', 'brak odwołania do STANDARD-GRAFIKI-SKLEPY.md');

  // (d) pętla wyników nadal deployowana (wf2-ads-sync = sync Meta, NIE Manus) + brak martwego deploy:wf2-ads
  pkg.includes('deploy:wf2-ads-sync') ? ok('package.json ma deploy:wf2-ads-sync') : bad('package.json', 'brak deploy:wf2-ads-sync');
  /"deploy:wf2-ads"\s*:/.test(pkg) ? bad('package.json', 'wciąż jest deploy:wf2-ads (funkcja skasowana)') : ok('package.json: brak martwego deploy:wf2-ads');

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

// ── 8. Most fabryka↔platforma (platform-sync.py) + picker sklepu w panelu ──
{
  const psPath = join(ROOT, 'scripts', 'mockup-tools', 'platform-sync.py');
  const psSrc = existsSync(psPath) ? readFileSync(psPath, 'utf8') : '';
  psSrc ? ok('platform-sync.py istnieje (most fabryka↔platforma)') : bad('platform-sync.py', 'brak scripts/mockup-tools/platform-sync.py');
  const wantCmds = ['cmd_shops', 'cmd_link_shop', 'cmd_status', 'cmd_branding', 'cmd_product', 'cmd_publish', 'cmd_home', 'cmd_page', 'cmd_unpublish'];
  const missing = wantCmds.filter((c) => !psSrc.includes(`def ${c}(`));
  missing.length ? bad('platform-sync.py komendy', `brak: ${missing.join(', ')}`) : ok(`platform-sync.py: komplet komend (${wantCmds.length})`);
  psSrc.includes('{{WF2_PRODUCT_ID}}') && psSrc.includes('strip_noindex')
    ? ok('platform-sync.py: publish pilnuje runtime-snippetu i noindex-wg-domeny')
    : bad('platform-sync.py publish', 'brak gate runtime ({{WF2_PRODUCT_ID}}) lub logiki noindex');

  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  ['platformBlock', 'plLoadStores', 'plPickShop', 'plPlatformStatus', 'platformProductInfo'].every((f) => panelSrc.includes(f))
    ? ok('panel: picker sklepu + stan platformy (platformBlock/plPickShop/plPlatformStatus)')
    : bad('panel platforma', 'brak funkcji pickera/stanu platformy w projekt.html');

  const adapterSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-platform', 'index.ts'), 'utf8');
  adapterSrc.includes('function pagesList(')
    ? ok('wf2-platform: pagesList (fix parsowania {pages:[…]} — unpublish/home działają)')
    : bad('wf2-platform pagesList', 'brak fixu parsowania odpowiedzi /pages (obiekt, nie tablica)');
}

// ── 9. Fabryka zakłada sklep merchanta (wf2-merchant) — kontrakt statyczny + RLS tabeli ──
{
  const fnPath = join(ROOT, 'supabase', 'functions', 'wf2-merchant', 'index.ts');
  const src = existsSync(fnPath) ? readFileSync(fnPath, 'utf8') : '';
  src ? ok('wf2-merchant/index.ts istnieje (fabryka zakłada sklep)') : bad('wf2-merchant', 'brak supabase/functions/wf2-merchant/index.ts');
  const wantActions = ['create_store', 'token', 'list_accounts'];
  const missAct = wantActions.filter((a) => !src.includes(`"${a}"`) && !src.includes(`'${a}'`));
  missAct.length ? bad('wf2-merchant akcje', `brak: ${missAct.join(', ')}`) : ok(`wf2-merchant: komplet akcji (${wantActions.length})`);
  // idempotencja + sygnał ręcznej obsługi zajętego e-maila (kontrakt paczki pl_sklep)
  (src.includes('email_taken_no_creds') && src.includes('onConflict')) ? ok('wf2-merchant: idempotencja (upsert onConflict) + email_taken_no_creds') : bad('wf2-merchant idempotencja', 'brak email_taken_no_creds lub upsert onConflict');
  // domyślna tożsamość konta = e-mail klienta z projektu (create_store z samym project_id)
  (src.includes('customer_email') && src.includes('email_or_project_required')) ? ok('wf2-merchant: domyślna tożsamość z projektu (customer_email; email|project wymagane)') : bad('wf2-merchant default email', 'brak derivacji customer_email / email_or_project_required');
  // create_store zwraca informacyjne URL-e logowania/ustawienia hasła
  (src.includes('login_url') && src.includes('password_setup_url')) ? ok('wf2-merchant: create_store zwraca login_url/password_setup_url') : bad('wf2-merchant urls', 'brak login_url/password_setup_url w odpowiedzi create_store');
  // gate: x-wf2-secret + service-role, anon NIGDY (nie osłabiać)
  (src.includes('WF2_GEN_SECRET') && src.includes('adminGate')) ? ok('wf2-merchant: gate x-wf2-secret/service/adminGate') : bad('wf2-merchant gate', 'brak WF2_GEN_SECRET/adminGate w gate');

  const pkg = readFileSync(join(ROOT, 'package.json'), 'utf8');
  /"deploy:wf2-merchant"\s*:/.test(pkg) ? ok('package.json ma deploy:wf2-merchant') : bad('package.json', 'brak deploy:wf2-merchant');

  existsSync(join(ROOT, 'supabase', 'migrations', '20260721d_wf2_merchant_accounts.sql'))
    ? ok('migracja 20260721d_wf2_merchant_accounts.sql obecna')
    : bad('migracja wf2_merchant_accounts', 'brak pliku migracji 20260721d_wf2_merchant_accounts.sql');
}

// ── 10. Portal klienta: karta „Panel Twojego sklepu" (merchant_panel) ──────
// Karta = login klienta do panelu sklepu; active TYLKO gdy konto merchanta = e-mail klienta.
// Portal NIE czyta haseł ani tabeli wf2_merchant_accounts (bezpieczeństwo).
{
  const portalSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'index.ts'), 'utf8');
  portalSrc.includes('merchant_panel') ? ok('wf2-portal: buduje merchant_panel w odpowiedzi') : bad('wf2-portal merchant_panel', 'brak merchant_panel w odpowiedzi portalu');
  (portalSrc.includes('platform_shop_id') && portalSrc.includes('platform_merchant_email'))
    ? ok('wf2-portal: gate karty po platform_shop_id + platform_merchant_email==customer_email')
    : bad('wf2-portal gate karty', 'brak platform_shop_id/platform_merchant_email w logice merchant_panel');
  // portal NIE dotyka tabeli z hasłami (wf2_merchant_accounts) — wystarczą kolumny wf2_projects.
  // Sprawdzamy realne zapytanie (.from(...)), nie wzmiankę w komentarzu.
  (!portalSrc.includes('from("wf2_merchant_accounts")') && !portalSrc.includes("from('wf2_merchant_accounts')"))
    ? ok('wf2-portal: nie czyta tabeli wf2_merchant_accounts (zero haseł)')
    : bad('wf2-portal bezpieczeństwo', 'portal odpytuje wf2_merchant_accounts — NIE powinien');

  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');
  (portalHtml.includes('renderMerchantPanel') && portalHtml.includes('Panel Twojego sklepu'))
    ? ok('portal.html: karta „Panel Twojego sklepu" (renderMerchantPanel)')
    : bad('portal.html karta', 'brak renderMerchantPanel / tytułu karty w portalu');
  portalHtml.includes('password_setup_url')
    ? ok('portal.html: karta linkuje „Ustaw hasło" (password_setup_url)')
    : bad('portal.html ustaw hasło', 'brak obsługi password_setup_url w karcie');
}

// ── 11. Tor Leadsie (Etap 4): webhook wf2-ads-connect + wiring portalu/panelu ──
// Onboarding reklamowy (partner access do BM Tomka). Gate webhooka fail-closed, kontrakt
// dedup checklisty (ten sam VERBATIM w 3 miejscach), minimalne flagi do klienta. SSOT:
// docs/zbuduje/ADS-ONBOARDING-LEADSIE.md.
{
  const acPath = join(ROOT, 'supabase', 'functions', 'wf2-ads-connect', 'index.ts');
  const ac = existsSync(acPath) ? readFileSync(acPath, 'utf8') : '';
  ac ? ok('wf2-ads-connect/index.ts istnieje (webhook Leadsie)') : bad('wf2-ads-connect', 'brak supabase/functions/wf2-ads-connect/index.ts');

  // gate fail-closed: POST bez ?s= → NIGDY 200 (401 zły sekret / 503 brak env)
  const st = await edge('wf2-ads-connect', { user: 'x' });
  [401, 403, 503].includes(st) ? ok(`wf2-ads-connect bez sekretu → ${st} (fail-closed)`) : bad('wf2-ads-connect gate', `status ${st} (oczekiwane 401/403/503, NIGDY 200)`);

  // jawne kolumny na service-role (bez .select('*') = ryzyko wycieku)
  (!ac.includes(".select('*')") && !ac.includes('.select("*")')) ? ok('wf2-ads-connect: jawna lista kolumn (bez .select(*))') : bad('wf2-ads-connect', '.select(*) na service-role');

  // KONTRAKT DEDUP: 3 stałe VERBATIM (partner access, konto, strona) identyczne w webhooku,
  // WS panelu i CHECKLIST_MAP. Rozjazd = „duch" checklisty (odhaczenie nie trafia w stan bazy).
  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', '_shared', 'checklist-map.ts'), 'utf8');
  for (const cst of ['CHECK_PARTNER_ACCESS', 'CHECK_KONTO', 'CHECK_STRONA']) {
    const m = ac.match(new RegExp(`const ${cst} = "([^"]+)"`));
    const verbatim = m ? m[1] : null;
    (verbatim && panelSrc.includes(verbatim) && mapSrc.includes(verbatim))
      ? ok(`checklista ${cst} VERBATIM zgodna (webhook ↔ WS ↔ CHECKLIST_MAP)`)
      : bad(`checklista ${cst} dedup`, verbatim ? 'VERBATIM rozjechany między webhookiem, panelem i mapą' : `brak ${cst} w webhooku`);
  }
  // MODEL: WS.ads_budzet pilnuje, że limit wydatków ustawia FABRYKA po WF2_META_TOKEN (nie klient)
  panelSrc.includes('Limit wydatków konta ustawiony (fabryka, po WF2_META_TOKEN)')
    ? ok('WS.ads_budzet: limit wydatków = fabryka po WF2_META_TOKEN')
    : bad('WS.ads_budzet model', 'brak pozycji „Limit wydatków konta ustawiony (fabryka, po WF2_META_TOKEN)"');

  // wf2-portal: buduje leadsie (connect_url z customUserId + minimalne flagi)
  const portalSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'index.ts'), 'utf8');
  (portalSrc.includes('wf2_leadsie_connect_url') && portalSrc.includes('customUserId') && portalSrc.includes('connected_ad_account'))
    ? ok('wf2-portal: buduje connect-link Leadsie + minimalne flagi {connected_ad_account,…}')
    : bad('wf2-portal leadsie', 'brak wf2_leadsie_connect_url / customUserId / connected_ad_account');
  // portal NIE ujawnia klientowi linków/summary z bloku leadsie (tylko flagi) — brak summary_url w gałęzi leadsie
  const lsStart = portalSrc.indexOf('let leadsie');
  const leadsieBlk = lsStart >= 0 ? portalSrc.slice(lsStart, portalSrc.indexOf('return json({', lsStart)) : '';
  (!/summary_url|linkToAsset|business\.facebook/.test(leadsieBlk))
    ? ok('wf2-portal: blok leadsie bez summary_url/linków (klient = tylko flagi)')
    : bad('wf2-portal leadsie sanityzacja', 'blok leadsie przecieka linki/summary do klienta');

  // front: tor Leadsie UŚPIONY (Tomek 22.07) — przycisk „Połącz konta reklamowe" USUNIĘTY z portalu
  // klienta (funkcja leadsieConnectBlock skasowana). Panel admina zachowuje dormant „Połączenia Leadsie".
  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');
  (!portalHtml.includes('leadsieConnectBlock') && !portalHtml.includes('Połącz konta reklamowe'))
    ? ok('portal.html: przycisk Leadsie „Połącz konta reklamowe" USUNIĘTY (flow ręczny; tor uśpiony)')
    : bad('portal.html leadsie usunięcie', 'portal wciąż zawiera leadsieConnectBlock / „Połącz konta reklamowe"');
  panelSrc.includes('adsKontoLeadsieBlock') ? ok('projekt.html: sekcja „Połączenia Leadsie" (adsKontoLeadsieBlock — dormant, wgląd admina)') : bad('projekt.html leadsie', 'brak adsKontoLeadsieBlock');

  // ── FLOW RĘCZNY (decyzja Tomka 22.07; SSOT §13) — jedyna ścieżka onboardingu reklamowego ──
  // portal ads_konto = 5 kroków ręcznych z deep-linkami (bez kreatora/Leadsie)
  (/step-manual/.test(portalHtml) && portalHtml.includes('737839566050751') && portalHtml.includes('business.facebook.com/settings/partners'))
    ? ok('portal.html: flow ręczny ads_konto (kroki step-manual + BM ID + deep-linki)')
    : bad('portal.html flow ręczny', 'brak kroków ręcznych (step-manual/BM ID/partners) w ads_konto');

  // portal CLIENT_WS ads_* (konto/strona/budżet) NIE zawiera odwołań do Leadsie/kreatora (tor uśpiony)
  {
    const aStart = portalHtml.indexOf('ads_konto: {');
    const aEnd = portalHtml.indexOf('pl_domena: {', aStart);
    const adsWs = aStart >= 0 && aEnd > aStart ? portalHtml.slice(aStart, aEnd) : '';
    (adsWs && !/leadsie/i.test(adsWs))
      ? ok('portal CLIENT_WS ads_*: zero odwołań do Leadsie/kreatora (flow ręczny)')
      : bad('portal CLIENT_WS ads_* leadsie', 'CLIENT_WS ads_* wciąż wspomina Leadsie');
  }
  // whitelist ads_konto == ['ad_account_id'] (świadome przywrócenie JEDNEGO pola)
  /ads_konto:\s*\["ad_account_id"\]/.test(portalSrc)
    ? ok('wf2-portal: CLIENT_FIELD_WHITELIST.ads_konto == ["ad_account_id"]')
    : bad('wf2-portal whitelist ads_konto', 'brak ads_konto: ["ad_account_id"] w CLIENT_FIELD_WHITELIST');
  // task_save ads_konto: normalizacja act_ + propagacja (ads_manual_id)
  (portalSrc.includes('ads_manual_id') && portalSrc.includes('act_${rawId}') && portalSrc.includes('/^act_\\d+$/'))
    ? ok('wf2-portal: task_save ads_konto normalizuje act_ + propaguje (ads_manual_id)')
    : bad('wf2-portal normalizacja act_', 'brak normalizacji act_ / ads_manual_id w task_save ads_konto');

  // settings: klucz istnieje (odczyt service-role); migracja obecna
  const kr = await rest('settings?select=key&key=eq.wf2_leadsie_connect_url', SK);
  (kr.status < 300 && Array.isArray(kr.data) && kr.data.length === 1) ? ok('settings.wf2_leadsie_connect_url istnieje') : bad('settings wf2_leadsie_connect_url', `status ${kr.status}, rows ${Array.isArray(kr.data) ? kr.data.length : '?'}`);
  const anonKr = await rest('settings?select=key&key=eq.wf2_leadsie_connect_url', ANON);
  (!(anonKr.status < 300 && Array.isArray(anonKr.data) && anonKr.data.length > 0)) ? ok('RLS: anon NIE widzi wf2_leadsie_connect_url') : bad('RLS anon leadsie key', 'anon czyta connect-link!');
  existsSync(join(ROOT, 'supabase', 'migrations', '20260722_wf2_leadsie_settings.sql')) ? ok('migracja 20260722_wf2_leadsie_settings.sql obecna') : bad('migracja leadsie', 'brak pliku migracji');

  // deploy skonfigurowany
  const pkg = readFileSync(join(ROOT, 'package.json'), 'utf8');
  /"deploy:wf2-ads-connect"\s*:/.test(pkg) ? ok('package.json ma deploy:wf2-ads-connect') : bad('package.json', 'brak deploy:wf2-ads-connect');
}

// ── 12. Bramka zgody konsumenckiej (żądanie startu prac przed 14 dniami) ───
// Prace nie ruszają bez decyzji klienta. Kontrakt: edge (akcja work_consent + gate),
// front portalu (ekran + wait14), panel (pasek + badge), migracja, tpay-webhook (checkout).
{
  const portalTs = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'index.ts'), 'utf8');
  (portalTs.includes('"work_consent"') && portalTs.includes('needs_work_consent'))
    ? ok('wf2-portal: akcja work_consent + needs_work_consent w stanie') : bad('wf2-portal work_consent', 'brak akcji work_consent / needs_work_consent');
  portalTs.includes("v2-2026-07-21") ? ok('wf2-portal: CONSENT_VERSION v2 (delta prawna)') : bad('wf2-portal wersja', 'brak wersji v2-2026-07-21');
  (portalTs.includes('sendConsentEmail') && portalTs.includes('work_consent_mail_failed'))
    ? ok('wf2-portal: mail potwierdzający + fallback work_consent_mail_failed') : bad('wf2-portal mail zgody', 'brak sendConsentEmail / work_consent_mail_failed');
  // wait14 USUNIĘTE z UI (decyzja Tomka): edge odrzuca choice≠'accept' (400), nie jest ścieżką akceptowaną
  (portalTs.includes('bad_choice') && /body\.choice\s*&&\s*body\.choice\s*!==\s*"accept"/.test(portalTs) && !/"wait14"/.test(portalTs))
    ? ok('wf2-portal: work_consent tylko choice=accept (wait14 → 400, brak w kodzie)') : bad('wf2-portal choice', 'edge nadal obsługuje wait14 albo brak odrzucenia choice≠accept');
  // warunek okna odstąpienia: needs_work_consent wygasa po created_at + 15 dni
  (portalTs.includes('windowOpen') && portalTs.includes('15 * 24 * 3600'))
    ? ok('wf2-portal: needs_work_consent z warunkiem okna 15 dni (created_at+15d)') : bad('wf2-portal okno', 'brak warunku okna 15 dni w needs_work_consent');
  portalTs.includes('work_start_after')
    ? ok('wf2-portal: payload zwraca work_start_after (koniec okna odstąpienia)') : bad('wf2-portal work_start_after', 'brak work_start_after w payloadzie');
  portalTs.includes('preview_readonly') && portalTs.match(/action === "work_consent"[\s\S]{0,160}readonly/)
    ? ok('wf2-portal: work_consent w podglądzie admina = 403') : bad('wf2-portal work_consent readonly', 'brak gate readonly na work_consent');

  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');
  (portalHtml.includes("id=\"consent\"") && portalHtml.includes('submitConsent') && portalHtml.includes("'consent'"))
    ? ok('portal.html: ekran consent + submitConsent + show(consent)') : bad('portal.html ekran zgody', 'brak ekranu consent / submitConsent');
  (!/Wolę poczekać/.test(portalHtml) && !portalHtml.includes('consent-wait-banner') && !portalHtml.includes('renderConsentBanner'))
    ? ok('portal.html: bez „Wolę poczekać" i banera wait14 (jedna decyzja)') : bad('portal.html wait14 usunięcie', 'pozostałości wariantu „Wolę poczekać"/banera wait14');

  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  (panelSrc.includes('renderConsentWarn') && panelSrc.includes('Zgoda na start prac'))
    ? ok('projekt.html: pasek renderConsentWarn + wiersz „Zgoda na start prac"') : bad('projekt.html zgoda', 'brak renderConsentWarn / wiersza zgody');

  const tpaySrc = readFileSync(join(ROOT, 'supabase', 'functions', 'tpay-webhook', 'index.ts'), 'utf8');
  (tpaySrc.includes('consentCols') && tpaySrc.includes("work_consent_source = 'checkout'"))
    ? ok('tpay-webhook: przenosi zgodę z kasy (source=checkout) + NIP/firma') : bad('tpay-webhook zgoda', 'brak przenoszenia zgody z kasy');

  existsSync(join(ROOT, 'supabase', 'migrations', '20260722c_wf2_work_consent.sql'))
    ? ok('migracja 20260722c_wf2_work_consent.sql obecna') : bad('migracja work_consent', 'brak pliku migracji');

  // DB: kolumny zgody istnieją na wf2_projects (odczyt service-role)
  const cr = await rest('wf2_projects?select=id,work_consent_at,work_consent_source,customer_nip,customer_company&limit=1', SK);
  cr.status < 300 ? ok('wf2_projects: kolumny work_consent_*/customer_nip/customer_company (migracja zaaplikowana)') : bad('wf2_projects kolumny zgody', `status ${cr.status} — migracja 20260722c zaaplikowana?`);
}

// ── 13. Weryfikator środowiska reklamowego (wf2-ads-verify) — guard, gate, VERBATIM, cron ──
// Etap 4: czyta konto reklamowe przez Graph API (partner access BM) i auto-odhacza to, czego
// Leadsie NIE potwierdza. Fail-closed bez WF2_META_TOKEN. SSOT: ADS-ONBOARDING-LEADSIE.md.
{
  const vPath = join(ROOT, 'supabase', 'functions', 'wf2-ads-verify', 'index.ts');
  const v = existsSync(vPath) ? readFileSync(vPath, 'utf8') : '';
  v ? ok('wf2-ads-verify/index.ts istnieje (weryfikator środowiska)') : bad('wf2-ads-verify', 'brak supabase/functions/wf2-ads-verify/index.ts');

  // TWARDY GUARD: EXCLUDED_ACCOUNTS z kontem marki Tomka w verify ORAZ to samo konto wykluczone
  // w wf2-ads-sync (sync iteruje konta w health-scan) — inaczej ryzyko odpytania/mutacji konta Tomka.
  (v.includes('EXCLUDED_ACCOUNTS') && v.includes('act_1537659320657091'))
    ? ok('wf2-ads-verify: EXCLUDED_ACCOUNTS = [act_1537659320657091] (guard marki Tomka)')
    : bad('wf2-ads-verify guard', 'brak EXCLUDED_ACCOUNTS / act_1537659320657091');
  const syncSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-sync', 'index.ts'), 'utf8');
  syncSrc.includes('1537659320657091')
    ? ok('wf2-ads-sync: to samo konto Tomka wykluczone (sync iteruje konta)')
    : bad('wf2-ads-sync guard', 'brak wykluczenia konta 1537659320657091');

  // fail-closed: bez WF2_META_TOKEN funkcja zwraca {skipped:'no_token'} (nic nie sfabrykuje)
  v.includes('no_token') ? ok('wf2-ads-verify: fail-closed {skipped:no_token} bez WF2_META_TOKEN') : bad('wf2-ads-verify no_token', 'brak gałęzi no_token');

  // gate: POST bez auth → 401/403 (NIGDY 200)
  const st = await edge('wf2-ads-verify', { action: 'verify', project_id: 'x' });
  (st === 401 || st === 403) ? ok(`wf2-ads-verify bez auth → ${st}`) : bad('wf2-ads-verify gate', `status ${st} (oczekiwane 401/403)`);

  // jawne kolumny (bez .select('*') na service-role)
  (!v.includes(".select('*')") && !v.includes('.select("*")')) ? ok('wf2-ads-verify: jawna lista kolumn (bez .select(*))') : bad('wf2-ads-verify', '.select(*) na service-role');

  // VERBATIM auto-odhaczeń: stałe verify == WS panelu == CHECKLIST_MAP (rozjazd = „duch" checklisty)
  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', '_shared', 'checklist-map.ts'), 'utf8');
  for (const cst of ['CHECK_ADS_KONTO_WALUTA', 'CHECK_ADS_BUDZET_SRODKI', 'CHECK_ADS_BUDZET_LIMIT', 'CHECK_ADS_STRONA_PRZYPISANA']) {
    const m = v.match(new RegExp(`const ${cst} = "([^"]+)"`));
    const verbatim = m ? m[1] : null;
    (verbatim && panelSrc.includes(verbatim) && mapSrc.includes(verbatim))
      ? ok(`wf2-ads-verify ${cst} VERBATIM (verify ↔ WS ↔ CHECKLIST_MAP)`)
      : bad(`wf2-ads-verify ${cst}`, verbatim ? 'VERBATIM rozjazd między verify, WS i mapą' : `brak ${cst} w verify`);
  }

  // panel: przycisk + sekcja weryfikatora (adsVerifyBlock/adsVerifyEnv) wpięte w krok ads_konto
  (panelSrc.includes('adsVerifyBlock') && panelSrc.includes('adsVerifyEnv') && panelSrc.includes('wf2-ads-verify'))
    ? ok('projekt.html: przycisk „Weryfikuj środowisko (API)" (adsVerifyBlock/adsVerifyEnv)')
    : bad('projekt.html ads-verify', 'brak adsVerifyBlock/adsVerifyEnv/wywołania wf2-ads-verify');

  // deploy + migracja cron
  const pkg = readFileSync(join(ROOT, 'package.json'), 'utf8');
  /"deploy:wf2-ads-verify"\s*:/.test(pkg) ? ok('package.json ma deploy:wf2-ads-verify') : bad('package.json', 'brak deploy:wf2-ads-verify');
  existsSync(join(ROOT, 'supabase', 'migrations', '20260722i_wf2_ads_verify_cron.sql'))
    ? ok('migracja 20260722i_wf2_ads_verify_cron.sql obecna') : bad('migracja cron ads-verify', 'brak pliku migracji');
}

// ── 14. Nowe teksty checklist E5/E6 (backlog audytów v1) — WS panelu + spójność WS↔CHECKLIST_MAP ──
{
  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', '_shared', 'checklist-map.ts'), 'utf8');

  // nowe pozycje muszą istnieć VERBATIM w WS (klucz deduplikacji ze stanem)
  const newChecks = [
    'DSA: beneficjent i płatnik ustawieni na każdej grupie (wymóg EU)',
    'Wideo wgrane do biblioteki konta (ręcznie — MCP nie ma uploadu)',
    'Pule retargetingu (custom audiences) utworzone od dnia 1',
    'Próbny ads_create_creative przeszedł (wykrywa brak dostępu IG — error 100)',
    'Po każdej edycji encji: ads_activate_entity (edycja wymusza PAUSED)',
    'Cotygodniowy smoke-test pomiaru: klik→kasa→Purchase w Events Managerze',
    'Feedback score strony sprawdzony (<3 interwencja, <2 kara delivery, <1 zakaz)',
  ];
  const missPanel = newChecks.filter((t) => !panelSrc.includes(t));
  missPanel.length ? bad('E5/E6 nowe checklisty w WS', 'brak: ' + missPanel.join(' | ')) : ok(`E5/E6: ${newChecks.length} nowych pozycji checklist obecnych w WS`);

  // spójność: każdy klucz CHECKLIST_MAP kroków, które edytowałem, istnieje VERBATIM w WS (bez sierot)
  const mapKeysForStep = (step) => {
    const start = mapSrc.indexOf(`  ${step}: {`);
    if (start < 0) return [];
    const end = mapSrc.indexOf('\n  },', start);
    const block = mapSrc.slice(start, end < 0 ? undefined : end);
    return [...block.matchAll(/^\s+"([^"]+)":\s*$/gm)].map((m) => m[1]);
  };
  let orphans = [];
  for (const step of ['ads_kampanie', 'ads_preflight', 'ads_start', 'ads_opieka']) {
    for (const k of mapKeysForStep(step)) if (!panelSrc.includes(k)) orphans.push(`${step}: ${k}`);
  }
  orphans.length ? bad('WS↔CHECKLIST_MAP (E5/E6)', 'klucze mapy bez odpowiednika w WS: ' + orphans.join(' | ')) : ok('WS↔CHECKLIST_MAP: klucze map ads_kampanie/preflight/start/opieka spójne z WS');

  // ads_budzet: instructions_md zaleca PŁATNOŚCI RĘCZNE (prepaid) — decyzja Tomka 22.07 (karta = wyjątek).
  // Sprawdzamy ŻYWĄ BAZĘ, z normalizacją NFC (polskie Ś/Ę/Ł — DB może zwrócić NFD, plik jest NFC).
  const norm = (s) => s.normalize('NFC');
  const WANT_RECZNE = norm('PŁATNOŚCI RĘCZNE');
  const kr = await rest("wf2_step_defs?select=instructions_md&key=eq.ads_budzet", SK);
  const im = Array.isArray(kr.data) && kr.data[0] ? String(kr.data[0].instructions_md || '') : '';
  norm(im).includes(WANT_RECZNE) ? ok('wf2_step_defs.ads_budzet.instructions_md: PŁATNOŚCI RĘCZNE (prepaid, klient)') : bad('ads_budzet instructions_md', 'brak „PŁATNOŚCI RĘCZNE" (migracja m zaaplikowana?)');

  // REPRODUKOWALNOŚĆ (P1): fraza „PŁATNOŚCI RĘCZNE" MUSI żyć w JAKIEJŚ migracji (migracja m) — nie tylko
  // jako patch na żywej bazie, inaczej repo NIE odtwarza stanu prod. Stara migracja k („ZALECAMY KARTĘ")
  // zostaje w repo, ale m (kolejność k<m) aplikuje się PO niej i nadpisuje treść na prepaid.
  const migDir = join(ROOT, 'supabase', 'migrations');
  const hasReczne = readdirSync(migDir).some((f) => f.endsWith('.sql') && norm(readFileSync(join(migDir, f), 'utf8')).includes(WANT_RECZNE));
  hasReczne ? ok('reprodukowalność: „PŁATNOŚCI RĘCZNE" obecne w migracji (nie tylko patch na prod)') : bad('reprodukowalność ads_budzet', 'żadna migracja nie zawiera „PŁATNOŚCI RĘCZNE" — patch tylko na żywej bazie?');
}

// ── 15. Etap 4 RUNDA 2 poprawek (atomowy merge, XSS, spend_cap LIFETIME, Leadsie-first portal) ──
{
  const connectSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-connect', 'index.ts'), 'utf8');
  const verifySrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-verify', 'index.ts'), 'utf8');
  const syncSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-sync', 'index.ts'), 'utf8');
  const portalSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'index.ts'), 'utf8');
  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');
  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', '_shared', 'checklist-map.ts'), 'utf8');
  const pkg = readFileSync(join(ROOT, 'package.json'), 'utf8');

  // (poz.2) ATOMOWY MERGE: migracja z funkcją SQL + oba edge wołają rpc('wf2_step_merge')
  const migPath = join(ROOT, 'supabase', 'migrations', '20260722j_wf2_step_merge.sql');
  const mig = existsSync(migPath) ? readFileSync(migPath, 'utf8') : '';
  (mig.includes('wf2_step_merge') && mig.includes('jsonb_set') && /FOR UPDATE/i.test(mig) && mig.includes('jsonb_array_elements'))
    ? ok('migracja 20260722j_wf2_step_merge: funkcja SQL (jsonb_set + unia po jsonb_array_elements + FOR UPDATE)')
    : bad('migracja wf2_step_merge', 'brak funkcji / jsonb_set / FOR UPDATE / jsonb_array_elements');
  connectSrc.includes('rpc("wf2_step_merge"') ? ok('wf2-ads-connect: scala przez rpc(wf2_step_merge) — bez read-modify-write') : bad('wf2-ads-connect merge', 'brak rpc(wf2_step_merge)');
  verifySrc.includes('rpc("wf2_step_merge"') ? ok('wf2-ads-verify: scala przez rpc(wf2_step_merge) — bez read-modify-write') : bad('wf2-ads-verify merge', 'brak rpc(wf2_step_merge)');
  // read-modify-write zabity: żaden z edge nie robi już update({ data }) całego bloba
  (!/update\(\{\s*data\s*[,}]/.test(connectSrc) && !/update\(\{\s*data\s*[,}]/.test(verifySrc))
    ? ok('wf2-ads-connect/verify: brak update({data}) całego bloba (RMW wyeliminowany)')
    : bad('RMW nadal obecny', 'któryś edge robi update({data}) — wraca lost-update');

  // (poz.3) assetKind: ad[_\s-]*account + allowlista poziomów + log niesklasyfikowanych
  /ad\[_\\s-\]\*account/.test(connectSrc) ? ok('wf2-ads-connect: assetKind łapie ad_account (ad[_\\s-]*account)') : bad('wf2-ads-connect assetKind', 'regex nie łapie ad_account (podkreślnik)');
  (/advertise/i.test(connectSrc) && /full\[_\\s-\]\*control/i.test(connectSrc)) ? ok('wf2-ads-connect: allowlista poziomów poszerzona (advertise/full_control)') : bad('wf2-ads-connect allowlist', 'brak advertise/full_control w isManage');
  connectSrc.includes('asset niesklasyfikowany') ? ok('wf2-ads-connect: log niesklasyfikowanych assetów (triage payloadu)') : bad('wf2-ads-connect log', 'brak console.log niesklasyfikowanego assetu');

  // (poz.5) XSS: safeUrl /^https?:\/\// na link/summary_url/request_url
  (connectSrc.includes('safeUrl') && /\^https\?:\\\/\\\//.test(connectSrc) && connectSrc.includes('safeUrl(a.linkToAsset)'))
    ? ok('wf2-ads-connect: safeUrl (http/https) na link/summary/request (XSS-guard)')
    : bad('wf2-ads-connect safeUrl', 'brak filtra safeUrl na URL-ach z payloadu');

  // (poz.4) Środki tylko dla karty
  (verifySrc.includes('paymentIsCard') && verifySrc.includes('if (active && paymentIsCard) budzetChecks.push(CHECK_ADS_BUDZET_SRODKI)'))
    ? ok('wf2-ads-verify: „środki" odhaczane TYLKO dla karty (paymentIsCard)')
    : bad('wf2-ads-verify środki', 'środki nadal odhaczane z samego istnienia metody płatności');

  // (poz.6) spend_cap = amount_spent + 500000 (LIFETIME) + nota near-limit
  (verifySrc.includes('amount_spent') && verifySrc.includes('+ 500000') && verifySrc.includes('spendCapNearLimit'))
    ? ok('wf2-ads-verify: spend_cap = amount_spent + 500000 (LIFETIME) + nota zbliżania do limitu')
    : bad('wf2-ads-verify spend_cap', 'brak amount_spent/+500000/near-limit');
  panelSrc.includes('Przy skalowaniu podbij spend_cap konta') ? ok('WS.skalowanie: dopiska o podbiciu spend_cap (lifetime)') : bad('WS.skalowanie', 'brak dopiski o spend_cap');

  // (poz.7) account_status != 1 → nota + pominięcie odhaczeń/capa
  (verifySrc.includes('ma status ${accountStatus}') && verifySrc.includes('active && currencyOk && tzOk'))
    ? ok('wf2-ads-verify: account_status != 1 → nota blokada + pominięcie odhaczeń (guard active)')
    : bad('wf2-ads-verify account_status', 'brak noty statusu / guardu active na odhaczeniach');

  // (P2) AbortController + retry na Graph (verify + sync) i fallback assigned_pages przy pustym []
  (verifySrc.includes('AbortController') && syncSrc.includes('AbortController'))
    ? ok('Graph: AbortController (timeout) + retry w verify i sync') : bad('Graph timeout/retry', 'brak AbortController w verify/sync');
  verifySrc.includes('promote_empty') ? ok('wf2-ads-verify: puste promote_pages [] też odpala fallback assigned_pages') : bad('wf2-ads-verify pages fallback', 'brak fallbacku przy pustym promote_pages');
  verifySrc.includes('lastVerifyAt') ? ok('wf2-ads-verify sweep: sort najstarzej-weryfikowane-najpierw (ads_verify.at)') : bad('wf2-ads-verify sweep sort', 'brak sortowania sweepu po dacie weryfikacji');

  // (poz.9) deploy:wf2 obejmuje obie nowe funkcje
  (/deploy:wf2"[\s\S]*deploy:wf2-ads-connect[\s\S]*deploy:wf2-ads-verify/.test(pkg) || (/"deploy:wf2":[^\n]*wf2-ads-connect/.test(pkg) && /"deploy:wf2":[^\n]*wf2-ads-verify/.test(pkg)))
    ? ok('package.json deploy:wf2 obejmuje wf2-ads-connect + wf2-ads-verify') : bad('deploy:wf2', 'deploy:wf2 nie deployuje connect/verify');

  // (poz.13) CLIENT_FIELD_WHITELIST: ads_konto == ["ad_account_id"] (ŚWIADOME 1 pole, ścieżka ręczna
  // 22.07), reszta reliktów self-attestation ZABITA (ads_budzet brak; bm_id/partner_id/amount/confirmation
  // brak). ad_account_id dozwolone WYŁĄCZNIE w ads_konto (single-element) — nie jako relikt gdzie indziej.
  {
    const wlStart = portalSrc.indexOf('CLIENT_FIELD_WHITELIST');
    const wlBlock = wlStart >= 0 ? portalSrc.slice(wlStart, portalSrc.indexOf('};', wlStart)) : '';
    // sprawdzamy KLUCZE mapy i CUDZYSŁOWNE wartości (relikty jako "bm_id"), żeby nie łapać nazw
    // reliktów wymienionych w komentarzu wyjaśniającym (bez cudzysłowów). ad_account_id ma paść
    // TYLKO wewnątrz ads_konto: ["ad_account_id"] — poza nim żadnego "ad_account_id".
    const adAcctOccurrences = (wlBlock.match(/"ad_account_id"/g) || []).length;
    (/ads_konto:\s*\["ad_account_id"\]/.test(wlBlock)
      && !/ads_budzet:\s*\[/.test(wlBlock)
      && !/"bm_id"|"partner_id"|"amount"|"confirmation"/.test(wlBlock)
      && adAcctOccurrences === 1)
      ? ok('wf2-portal CLIENT_FIELD_WHITELIST: ads_konto==["ad_account_id"], reszta reliktów zabita (ads_budzet/bm_id/partner_id/amount/confirmation)')
      : bad('CLIENT_FIELD_WHITELIST relikty', 'ads_konto != ["ad_account_id"] albo wróciły relikty ads_budzet/bm_id/partner_id/amount/confirmation');
  }

  // (Tomek 22.07; SSOT §13) portal CLIENT_WS.ads_konto: flow RĘCZNY — BM ID w treści głównej
  // (kroki step-manual), zero <details> kreatora, zero „Połącz konta"/Leadsie
  {
    const kStart = portalHtml.indexOf('ads_konto: {');
    const kEnd = portalHtml.indexOf('ads_strona: {', kStart);
    const kBlock = kStart >= 0 && kEnd > kStart ? portalHtml.slice(kStart, kEnd) : '';
    (kBlock.includes('737839566050751') && /step-manual/.test(kBlock) && !/leadsie/i.test(kBlock) && !kBlock.includes('Połącz konta reklamowe'))
      ? ok('portal CLIENT_WS.ads_konto: flow ręczny (BM ID w treści głównej, zero Leadsie/„Połącz konta")')
      : bad('portal CLIENT_WS.ads_konto', 'brak kroków ręcznych/BM ID albo pozostałość Leadsie/„Połącz konta"');
    // ads_budzet PREPAID-first (płatności ręczne) + ostrzeżenie o przelewie; kwoty bez zmian (1000 zł)
    const bStart = portalHtml.indexOf('ads_budzet: {');
    const bEnd = portalHtml.indexOf('pl_domena: {', bStart);
    const bBlock = bStart >= 0 && bEnd > bStart ? portalHtml.slice(bStart, bEnd) : '';
    (/ręczn/i.test(bBlock) && /przelew/i.test(bBlock) && bBlock.includes('1000 zł'))
      ? ok('portal CLIENT_WS.ads_budzet: prepaid-first (płatności ręczne) + ostrzeżenie o przelewie (1000 zł)')
      : bad('portal CLIENT_WS.ads_budzet', 'brak płatności ręcznych / ostrzeżenia o przelewie / kwoty 1000 zł');
  }
  // (Tomek 22.07; SSOT §13) zadanie ads_strona: tworzenie RĘCZNE (facebook.com/pages/create) +
  // dostęp nadawany w tym samym kroku „Partnerzy" co konto; zero Leadsie/kreatora
  {
    const sStart = portalHtml.indexOf('ads_strona: {');
    const sEnd = portalHtml.indexOf('ads_budzet: {', sStart);
    const sBlock = sStart >= 0 && sEnd > sStart ? portalHtml.slice(sStart, sEnd) : '';
    (sBlock.includes('facebook.com/pages/create') && /Partnerzy/.test(sBlock) && !/leadsie/i.test(sBlock))
      ? ok('portal CLIENT_WS.ads_strona: tworzenie ręczne (pages/create) + dostęp w „Partnerzy", zero Leadsie')
      : bad('portal CLIENT_WS.ads_strona', 'brak pages/create / „Partnerzy" albo pozostałość Leadsie');
  }

  // (poz.12) checklist-map preflight: komentarz wspomina creative-probe
  /celowo POMINIĘTE[\s\S]{0,120}(creative-probe|ads_create_creative)/i.test(mapSrc) || /creative-probe/i.test(mapSrc)
    ? ok('checklist-map ads_preflight: komentarz wspomina pominięty creative-probe') : bad('checklist-map preflight', 'komentarz nie wspomina creative-probe');
}

// ── 16. Etap 4 RUNDA 3 (domknięcia krytyka: rpc-error handling, karta-brand, graphFetch, block-merge) ──
{
  const connectSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-connect', 'index.ts'), 'utf8');
  const verifySrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-verify', 'index.ts'), 'utf8');
  const syncSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-sync', 'index.ts'), 'utf8');
  const portalSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'index.ts'), 'utf8');

  // (P2.1) connect: przechwytuje błąd rpc(wf2_step_merge) → console.error + 500 (Leadsie ponowi; idempotentne)
  (connectSrc.includes('const { error: mergeErr } = await supabase.rpc("wf2_step_merge"') && /mergeErr[\s\S]{0,220}merge_failed[\s\S]{0,40}500/.test(connectSrc))
    ? ok('wf2-ads-connect: błąd rpc(wf2_step_merge) → console.error + 500 (merge_failed)')
    : bad('wf2-ads-connect rpc-error', 'brak przechwycenia { error } z merge / 500 merge_failed');

  // (P2.1) verify: updateStepUnion przechwytuje błąd merge, dokleja do opisu wf2_activities (nie wywala sweepa)
  (verifySrc.includes('const { error: mergeErr } = await sb.rpc("wf2_step_merge"') && verifySrc.includes('mergeErrors') && /merge NIEUDANY/.test(verifySrc))
    ? ok('wf2-ads-verify: błąd merge → console.error + dopisek do wf2_activities (sweep żyje)')
    : bad('wf2-ads-verify rpc-error', 'brak przechwycenia błędu merge / dopisu do activities');

  // (P2.3) karta uznawana TYLKO po brandzie — regex paymentIsCard bez gołego matchera cyfr (\d{4}$/maski)
  {
    const m = verifySrc.match(/const paymentIsCard = paymentMethod && \/([^/]+)\/\.test\(fundBlob\)/);
    const rx = m ? m[1] : '';
    (rx && /visa|master|amex/.test(rx) && !rx.includes('\\d{4}') && !rx.includes('{2,}') && !rx.includes('x{4,}'))
      ? ok('wf2-ads-verify: paymentIsCard tylko po brandzie (bez gołego \\d{4}$/maski cyfr)')
      : bad('wf2-ads-verify karta-brand', rx ? 'regex nadal łapie same cyfry (\\d{4}$/maska) — fałszywa karta przy prepaid' : 'brak paymentIsCard');
    verifySrc.includes('[ŻYWO:') ? ok('wf2-ads-verify: komentarz [ŻYWO: potwierdzić na 1. realnym funding_source_details]') : bad('wf2-ads-verify ŻYWO', 'brak komentarza [ŻYWO:…]');
  }

  // (P2.4) sync health-scan: graphFetch (AbortController+retry), nie goły fetch bez deadline'u
  {
    const hsStart = syncSrc.indexOf('health-scan kont');
    const hsBlock = hsStart >= 0 ? syncSrc.slice(hsStart, hsStart + 1100) : '';
    (hsBlock.includes('graphFetch(`${GRAPH}/act_${acc}?fields=account_status') && !/const r = await fetch\(`\$\{GRAPH\}\/act_\$\{acc\}/.test(hsBlock))
      ? ok('wf2-ads-sync health-scan: graphFetch (AbortController+retry), bez gołego fetch')
      : bad('wf2-ads-sync health-scan', 'health-scan nadal na gołym fetch bez deadline/retry');
  }

  // (P2.2) portal ads_* task_save: atomowy block-merge (p_block_merge=true), nie RMW całego data
  (portalSrc.includes('step_key.startsWith("ads_")') && /p_block_key: "fields"[\s\S]{0,80}p_block_merge: true/.test(portalSrc))
    ? ok('wf2-portal task_save ads_*: rpc wf2_step_merge block-merge (fields || cleaned), bez RMW')
    : bad('wf2-portal ads_* task_save', 'brak gałęzi ads_* z p_block_merge=true');

  // (P2.2) migracja rozszerzająca funkcję o p_block_merge + DROP starej 4-arg (bez ambiguity function)
  {
    const migPath = join(ROOT, 'supabase', 'migrations', '20260722l_wf2_step_merge_block.sql');
    const mig = existsSync(migPath) ? readFileSync(migPath, 'utf8') : '';
    (mig.includes('p_block_merge') && /DROP FUNCTION IF EXISTS public\.wf2_step_merge\(uuid, text, jsonb, text\[\]\)/.test(mig) && mig.includes('|| coalesce(p_block'))
      ? ok('migracja 20260722l: p_block_merge (płytki merge) + DROP starej 4-arg (bez ambiguity)')
      : bad('migracja 20260722l', 'brak p_block_merge / DROP 4-arg / płytkiego merge');
  }
}

// ── 17. Widoczność MCP (kampanie przez Meta MCP na osobistym userze Tomka) ──
// Partner access Leadsie daje dostęp FIRMIE (BM); MCP widzi konto TYLKO gdy zasób jest przypisany
// do OSOBY Tomka. Check mcp_visibility w wf2-ads-verify auto-przypisuje wg settings.wf2_meta_assign_users.
// SSOT: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md §11.
{
  const v = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-verify', 'index.ts'), 'utf8');
  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', '_shared', 'checklist-map.ts'), 'utf8');

  // (a) settings key istnieje (odczyt service-role); anon NIE widzi; migracja obecna
  const kr = await rest('settings?select=key&key=eq.wf2_meta_assign_users', SK);
  (kr.status < 300 && Array.isArray(kr.data) && kr.data.length === 1) ? ok('settings.wf2_meta_assign_users istnieje') : bad('settings wf2_meta_assign_users', `status ${kr.status}, rows ${Array.isArray(kr.data) ? kr.data.length : '?'}`);
  const anonKr = await rest('settings?select=key&key=eq.wf2_meta_assign_users', ANON);
  (!(anonKr.status < 300 && Array.isArray(anonKr.data) && anonKr.data.length > 0)) ? ok('RLS: anon NIE widzi wf2_meta_assign_users') : bad('RLS anon meta-assign key', 'anon czyta listę userów MCP!');
  existsSync(join(ROOT, 'supabase', 'migrations', '20260722n_wf2_meta_assign_users.sql')) ? ok('migracja 20260722n_wf2_meta_assign_users.sql obecna') : bad('migracja meta-assign', 'brak pliku migracji');

  // (b) wf2-ads-verify zawiera check assigned_users: odczyt settings, GET assigned_users z business=BM,
  //     auto-assign POST (tasks MANAGE), fallback business_users przy pustym settings
  v.includes('wf2_meta_assign_users') ? ok('wf2-ads-verify: czyta settings.wf2_meta_assign_users') : bad('wf2-ads-verify settings', 'brak odczytu wf2_meta_assign_users');
  (v.includes('/assigned_users?fields=id,name,tasks') && v.includes('business=${BM_TOMKA}'))
    ? ok('wf2-ads-verify: GET /{act}/assigned_users z parametrem business (BM Tomka)')
    : bad('wf2-ads-verify assigned_users', 'brak GET assigned_users z parametrem business');
  (v.includes('mcpVisibility') && /tasks:\s*JSON\.stringify\(\["MANAGE"\]\)/.test(v))
    ? ok('wf2-ads-verify: mcpVisibility + auto-assign POST (tasks MANAGE)')
    : bad('wf2-ads-verify auto-assign', 'brak mcpVisibility / POST assigned_users tasks MANAGE');
  v.includes('business_users?fields=id,name,role') ? ok('wf2-ads-verify: fallback business_users (settings puste → nota z listą)') : bad('wf2-ads-verify business_users', 'brak GET business_users przy pustym settings');
  v.includes("BM_TOMKA = \"737839566050751\"") ? ok('wf2-ads-verify: BM_TOMKA = 737839566050751') : bad('wf2-ads-verify BM', 'brak stałej BM_TOMKA');

  // (c) panel: wiersz „Widoczność MCP" w adsVerifyBlock (czyta v.mcp)
  (panelSrc.includes('Widoczność MCP') && /const mcp = v\.mcp/.test(panelSrc))
    ? ok('projekt.html adsVerifyBlock: wiersz „Widoczność MCP" (v.mcp)')
    : bad('projekt.html Widoczność MCP', 'brak wiersza „Widoczność MCP" / odczytu v.mcp');

  // (d) nowa pozycja WS ads_kampanie obecna VERBATIM + NIEobecna w CHECKLIST_MAP (admin-only)
  const MCP_CHECK = 'Konto widoczne w Meta MCP (ads_get_ad_accounts zawiera act_ projektu)';
  panelSrc.includes(MCP_CHECK) ? ok('WS.ads_kampanie: pozycja „Konto widoczne w Meta MCP …" obecna') : bad('WS.ads_kampanie MCP', 'brak nowej pozycji checklisty');
  !mapSrc.includes(MCP_CHECK) ? ok('CHECKLIST_MAP: pozycja MCP POZA mapą (admin-only, nie do klienta)') : bad('CHECKLIST_MAP MCP', 'pozycja MCP trafiła do mapy klienta — powinna być admin-only');

  // (e) desc kroku ads_kampanie wspomina restart sesji connectora + osobisty user Tomka
  (panelSrc.includes('MCP działa na OSOBISTYM userze Tomka') && panelSrc.includes('wymaga RESTARTU sesji'))
    ? ok('WS.ads_kampanie.desc: MCP osobisty user + restart sesji connectora')
    : bad('WS.ads_kampanie.desc', 'brak dopiski o osobistym userze / restarcie sesji');
}

// ── 18. Polityka DEDYKOWANEGO konta (istniejące konto klienta → NOWE) — decyzja Tomka 22.07 ──
// Klient z istniejącym kontem i tak zakłada nowe, dedykowane. Portal instruuje, connect obsługuje
// multi-account (nota, bez zapisu act_), instructions_md (live) niesie politykę. SSOT §12.
{
  const norm = (s) => s.normalize('NFC');
  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');
  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  const connectSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-connect', 'index.ts'), 'utf8');

  // (a) portal CLIENT_WS.ads_konto instruuje o NOWYM dedykowanym koncie (w bloku ads_konto)
  {
    const kStart = portalHtml.indexOf('ads_konto: {');
    const kEnd = portalHtml.indexOf('ads_strona: {', kStart);
    const kBlock = kStart >= 0 && kEnd > kStart ? portalHtml.slice(kStart, kEnd) : '';
    norm(kBlock).includes(norm('dedykowane temu sklepowi'))
      ? ok('portal CLIENT_WS.ads_konto: instrukcja o NOWYM dedykowanym koncie („dedykowane temu sklepowi")')
      : bad('portal CLIENT_WS.ads_konto dedykowane', 'brak frazy „dedykowane temu sklepowi" w guide ads_konto');
  }

  // (b) panel WS.ads_konto.desc niesie politykę dedykowanego konta (bez zmiany checklisty)
  norm(panelSrc).includes(norm('DEDYKOWANE konto pod ten sklep'))
    ? ok('projekt.html WS.ads_konto.desc: polityka dedykowanego konta dopisana')
    : bad('projekt.html WS.ads_konto.desc', 'brak dopisku polityki („DEDYKOWANE konto pod ten sklep")');

  // (c) wf2-ads-connect: gałąź multi-account (nota + brak zapisu act_ przy >1 koncie Connected)
  (connectSrc.includes('const multiAccount = connectedAdAccounts.length > 1')
    && connectSrc.includes('!curActId && !multiAccount')
    && connectSrc.includes('⚠️ AUTOMAT: Leadsie — klient podłączył')
    && connectSrc.includes('.like("body", "⚠️ AUTOMAT: Leadsie — klient podłączył%")'))
    ? ok('wf2-ads-connect: gałąź multi-account (>1 konto → nota z własnym dedup, act_ ręcznie)')
    : bad('wf2-ads-connect multi-account', 'brak multiAccount / guardu !multiAccount / noty „klient podłączył" / dedup');

  // (d) instructions_md (ŻYWA BAZA) kroku ads_konto zawiera „dedykowane" (migracja o zaaplikowana)
  const kr = await rest("wf2_step_defs?select=instructions_md&key=eq.ads_konto", SK);
  const im = Array.isArray(kr.data) && kr.data[0] ? String(kr.data[0].instructions_md || '') : '';
  norm(im).includes(norm('dedykowane'))
    ? ok('wf2_step_defs.ads_konto.instructions_md: zawiera „dedykowane" (migracja 20260722o)')
    : bad('ads_konto instructions_md', 'brak „dedykowane" w żywej bazie (migracja 20260722o zaaplikowana?)');

  // (e) migracja obecna w repo (reprodukowalność) + dopisek, nie nadpisanie (guard idempotencji)
  {
    const migPath = join(ROOT, 'supabase', 'migrations', '20260722o_wf2_konto_dedykowane_instr.sql');
    const mig = existsSync(migPath) ? readFileSync(migPath, 'utf8') : '';
    (mig.includes("instructions_md = instructions_md ||") && mig.includes("not like '%dedykowane temu sklepowi%'"))
      ? ok('migracja 20260722o: DOPISEK (append || + guard not like — idempotentny, nic nie ścina)')
      : bad('migracja 20260722o', 'brak append (|| ) lub guardu idempotencji not like');
  }
}

// ── 18. Przewodnik AI konfiguracji reklam Meta (wf2-ads-guide) — Etap 4 ────
// Klient pyta o konfigurację środowiska reklamowego, wgrywa zrzuty (vision), utknięcie → nota.
// Gate = token+hasło portalu (jak wf2-portal). SSOT: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md §14.
{
  const fnPath = join(ROOT, 'supabase', 'functions', 'wf2-ads-guide', 'index.ts');
  const src = existsSync(fnPath) ? readFileSync(fnPath, 'utf8') : '';
  src ? ok('wf2-ads-guide/index.ts istnieje (przewodnik AI)') : bad('wf2-ads-guide', 'brak supabase/functions/wf2-ads-guide/index.ts');
  // Po konsolidacji (22.07) wspólny szkielet czatów portalowych żyje w _shared/portal-chat.ts.
  // Asercje na mechanizmy przeniesione tam (kill-switch, rate-limit, vision, gate readonly) grepują
  // TEN plik; asercje na konfigurację tej funkcji (klucze/model/marker/nota/prompt) grepują wf2-ads-guide src.
  const sharedPath = join(ROOT, 'supabase', 'functions', '_shared', 'portal-chat.ts');
  const shared = existsSync(sharedPath) ? readFileSync(sharedPath, 'utf8') : '';
  shared ? ok('_shared/portal-chat.ts istnieje (wspólny handler czatów portalowych)') : bad('portal-chat.ts', 'brak supabase/functions/_shared/portal-chat.ts');

  // gate: POST bez auth (token 32-hex bez hasła) → 401/403, NIGDY 200
  const st = await edge('wf2-ads-guide', { action: 'history', token: 'x' });
  (st === 401 || st === 403) ? ok(`wf2-ads-guide bez auth → ${st}`) : bad('wf2-ads-guide gate', `status ${st} (oczekiwane 401/403)`);
  // token o poprawnym formacie, ale bez hasła → 401 (nie przecieka istnienia projektu)
  const st2 = await edge('wf2-ads-guide', { action: 'message', token: '0'.repeat(32), message: 'hej' });
  (st2 === 401 || st2 === 403) ? ok(`wf2-ads-guide token bez hasła → ${st2}`) : bad('wf2-ads-guide gate hasło', `status ${st2} (oczekiwane 401/403)`);

  // marker utknięcia + nota „blokada" + aktywność ads_guide_stuck
  (src.includes('<utkniecie>') && src.includes('parseStuck') && src.includes("action: \"ads_guide_stuck\""))
    ? ok('wf2-ads-guide: marker <utkniecie> → nota + aktywność ads_guide_stuck') : bad('wf2-ads-guide marker', 'brak <utkniecie>/parseStuck/ads_guide_stuck');
  // nota „blokada" z dedup po otwartej nocie „⚠️ PRZEWODNIK:%"
  (src.includes('⚠️ PRZEWODNIK:') && src.includes('tag: "blokada"') && src.includes('.like("body", "⚠️ PRZEWODNIK:%")'))
    ? ok('wf2-ads-guide: nota blokada „⚠️ PRZEWODNIK" z dedup po otwartej nocie') : bad('wf2-ads-guide nota', 'brak noty blokada / dedup „⚠️ PRZEWODNIK:%"');
  // rate limit 60 wiadomości/h per projekt: wf2 config deklaruje 60; licznik role=user exact = portal-chat.ts
  (src.includes('MAX_USER_MSGS_PER_HOUR = 60') && shared.includes('.eq("role", "user")') && shared.includes('count: "exact"'))
    ? ok('wf2-ads-guide: rate-limit 60/h (config) + licznik role=user exact w portal-chat.ts') : bad('wf2-ads-guide rate-limit', 'brak MAX_USER_MSGS_PER_HOUR = 60 (wf2) lub licznika role=user/count exact (portal-chat.ts)');
  // kill-switch FAIL-OPEN: wf2 config deklaruje klucz settings.wf2_ads_guide_enabled; isKilled = portal-chat.ts
  (src.includes('wf2_ads_guide_enabled') && shared.includes('isKilled'))
    ? ok('wf2-ads-guide: kill-switch wf2_ads_guide_enabled (config) + isKilled FAIL-OPEN w portal-chat.ts') : bad('wf2-ads-guide kill-switch', 'brak wf2_ads_guide_enabled (wf2) lub isKilled (portal-chat.ts)');
  // model konfigurowalny (WF2_GUIDE_OPENAI_MODEL default gpt-4o) w wf2 config; vision (image_url) = portal-chat.ts
  (src.includes('WF2_GUIDE_OPENAI_MODEL') && shared.includes('image_url'))
    ? ok('wf2-ads-guide: model WF2_GUIDE_OPENAI_MODEL (config) + vision (image_url) w portal-chat.ts') : bad('wf2-ads-guide model/vision', 'brak WF2_GUIDE_OPENAI_MODEL (wf2) lub image_url (portal-chat.ts)');
  // podgląd admina = readonly (message/upload → 403 „podgląd — tylko odczyt") + verifyTeamMember — mechanizm w portal-chat.ts
  (shared.includes('podgląd — tylko odczyt') && shared.includes('verifyTeamMember'))
    ? ok('wf2-ads-guide: podgląd admina readonly (403) + verifyTeamMember w portal-chat.ts') : bad('wf2-ads-guide readonly', 'brak gate readonly „podgląd — tylko odczyt"/verifyTeamMember w portal-chat.ts');
  // BM ID Tomka w promptcie (kroki ręczne) + menu „Partnerzy" (nie „Dodaj osoby")
  (src.includes('737839566050751') && src.includes('Nadaj partnerowi dostęp do zasobów'))
    ? ok('wf2-ads-guide: prompt zawiera BM ID 737839566050751 + menu „Partnerzy"') : bad('wf2-ads-guide prompt', 'brak BM ID / menu partnerów w promptcie');
  // jawna lista kolumn (bez .select('*') na service-role)
  (!src.includes(".select('*')") && !src.includes('.select("*")')) ? ok('wf2-ads-guide: jawna lista kolumn (bez .select(*))') : bad('wf2-ads-guide', '.select(*) na service-role');

  // RLS: anon NIE czyta wf2_guide_messages (ZERO polityk anon)
  const r = await rest('wf2_guide_messages?select=id&limit=1', ANON);
  const leak = r.status < 300 && Array.isArray(r.data) && r.data.length > 0;
  leak ? bad('RLS anon wf2_guide_messages', 'anon widzi wiersze!') : ok('RLS: anon nie widzi wf2_guide_messages');

  // kill-switch key istnieje (service-role) + anon go NIE widzi (nie na whiteliście)
  const kr = await rest('settings?select=key&key=eq.wf2_ads_guide_enabled', SK);
  (kr.status < 300 && Array.isArray(kr.data) && kr.data.length === 1) ? ok('settings.wf2_ads_guide_enabled istnieje') : bad('settings wf2_ads_guide_enabled', `status ${kr.status}, rows ${Array.isArray(kr.data) ? kr.data.length : '?'}`);
  const anonKr = await rest('settings?select=key&key=eq.wf2_ads_guide_enabled', ANON);
  (!(anonKr.status < 300 && Array.isArray(anonKr.data) && anonKr.data.length > 0)) ? ok('RLS: anon NIE widzi wf2_ads_guide_enabled') : bad('RLS anon guide key', 'anon czyta kill-switch!');

  // bucket wf2-guide-shots = PRYWATNY (storage API, service-role)
  try {
    const br = await fetch(`${SUPA}/storage/v1/bucket/wf2-guide-shots`, { headers: { apikey: SK, Authorization: `Bearer ${SK}` } });
    const bj = br.status < 300 ? await br.json() : {};
    (br.status < 300 && bj && bj.public === false) ? ok('bucket wf2-guide-shots istnieje i jest PRYWATNY') : bad('bucket wf2-guide-shots', `status ${br.status}, public=${bj && bj.public}`);
  } catch (e) { bad('bucket wf2-guide-shots', 'błąd storage API: ' + (e && e.message || e)); }

  // migracja obecna (reprodukowalność): tabela + RLS team + bucket private + settings + storage select-policy
  const migPath = join(ROOT, 'supabase', 'migrations', '20260722r_wf2_ads_guide.sql');
  const mig = existsSync(migPath) ? readFileSync(migPath, 'utf8') : '';
  (mig.includes('wf2_guide_messages') && mig.includes('team_members') && mig.includes("'wf2-guide-shots'") && mig.includes('wf2_ads_guide_enabled') && mig.includes('wf2_guide_shots_team_select'))
    ? ok('migracja 20260722r_wf2_ads_guide: tabela + RLS team + bucket + kill-switch + storage select-policy')
    : bad('migracja 20260722r_wf2_ads_guide', 'brak tabeli/RLS/bucketu/kill-switcha/select-policy');

  // ── ROZMOWA = TREŚĆ ZADANIA (23.07): trwała instancja TNChat 'embedded' w miejscu instrukcji ─────
  // Klient wchodzi w zadanie → osadzony komunikator (asystent SAM wita powitaniem per zadanie). pl_dane =
  // wyjątek (formularz). Upload/rate/vision/gate = _shared/portal-chat.ts + tn-chat.js.
  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');
  const portalTs = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'index.ts'), 'utf8');
  const chatJs = existsSync(join(ROOT, 'components', 'tn-chat.js')) ? readFileSync(join(ROOT, 'components', 'tn-chat.js'), 'utf8') : '';
  const appPortalHtml = readFileSync(join(ROOT, 'tn-app', 'portal.html'), 'utf8');

  // (c) trwała instancja TNChat layout 'embedded' + addLocalBubble + host + BRAK reliktów starego drawera
  (portalHtml.includes('components/tn-chat.js?v=') && /TNChat\.mount\(/.test(portalHtml) && /layout:\s*'embedded'/.test(portalHtml)
    && portalHtml.includes('addLocalBubble') && portalHtml.includes('asystent-host') && portalHtml.includes('ensureChatMounted')
    && !portalHtml.includes('gd-chat') && !portalHtml.includes('guide-card') && !portalHtml.includes('GUIDE_STEPS'))
    ? ok("portal.html: trwała instancja TNChat layout 'embedded' (addLocalBubble/asystent-host/ensureChatMounted); BRAK gd-chat/guide-card/GUIDE_STEPS")
    : bad('portal.html embedded chat', "brak TNChat.mount 'embedded'/addLocalBubble/asystent-host/ensureChatMounted albo relikty gd-chat/guide-card/GUIDE_STEPS");
  // upload zrzutów przez komponent (tn-chat.js) — endpoint wf2-ads-guide nadal w portalu
  (chatJs.includes("action: 'upload_init'") && chatJs.includes("action: 'upload_done'") && portalHtml.includes('/functions/v1/wf2-ads-guide'))
    ? ok('portal.html: upload zrzutu przez komponent TNChat (upload_init/done) → endpoint wf2-ads-guide')
    : bad('portal.html upload', 'brak upload_init/done w tn-chat.js lub endpointu wf2-ads-guide w portalu');

  // (a) CHAT_TASKS = 4 zadania czatowe (ads_strona/ads_konto/ads_budzet/firma); pl_dane wyłączone
  {
    const m = portalHtml.match(/const CHAT_TASKS = \[([^\]]*)\]/);
    const keys = m ? [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]) : [];
    const want = ['ads_strona', 'ads_konto', 'ads_budzet', 'firma'];
    (keys.length === 4 && want.every((k) => keys.includes(k)) && !keys.includes('pl_dane'))
      ? ok('portal.html: CHAT_TASKS = [ads_strona, ads_konto, ads_budzet, firma] (pl_dane poza czatem)')
      : bad('portal.html CHAT_TASKS', `oczekiwane 4 klucze ${want.join('/')} (bez pl_dane), jest [${keys.join(', ')}]`);
  }

  // (b) chatIntro obecne dla 4 zadań czatowych (fragment charakterystyczny w bloku KAŻDEGO zadania)
  {
    const block = (key, next) => { const s = portalHtml.indexOf(key + ': {'); const e = portalHtml.indexOf(next + ': {', s); return s >= 0 && e > s ? portalHtml.slice(s, e) : ''; };
    const cases = [
      ['ads_strona', 'ads_budzet', 'pages/create'],
      ['ads_konto', 'ads_strona', 'business_home'],
      ['ads_budzet', 'pl_domena', 'billing_hub'],
      ['firma', 'pl_dane', 'NIP w polu'],
    ];
    const miss = cases.filter(([k, nx, frag]) => { const b = block(k, nx); return !(b.includes('chatIntro:') && b.includes(frag)); }).map(([k]) => k);
    miss.length ? bad('portal.html chatIntro', 'brak chatIntro/fragmentu w: ' + miss.join(', ')) : ok('portal.html: chatIntro (z pierwszym krokiem) dla ads_strona/ads_konto/ads_budzet/firma');
  }

  // (d) stary UX usunięty: 0 referencji FAB / akordeonu / wejść openAsystent
  (!portalHtml.includes('asystent-fab') && !portalHtml.includes('instr-acc') && !portalHtml.includes('openAsystent')
    && !portalHtml.includes('ACCORDION_STEPS') && !portalHtml.includes('watchFabOverlap'))
    ? ok('portal.html: BRAK asystent-fab/instr-acc/openAsystent/ACCORDION_STEPS/watchFabOverlap (stary UX usunięty)')
    : bad('portal.html relikty UX', 'pozostały asystent-fab/instr-acc/openAsystent/ACCORDION_STEPS/watchFabOverlap');

  // (e) fallback kill-switch: gdy asystentEnabled===false, zadanie czatowe renderuje pełną instrukcję ws.guide
  (/CHAT_TASKS\.includes\(d\.key\) && \(asystentEnabled !== false\)/.test(portalHtml) && /String\(ws\.guide\)\.replace/.test(portalHtml))
    ? ok('portal.html: fallback kill-switch → pełna instrukcja ws.guide (isChat gated na asystentEnabled)')
    : bad('portal.html fallback', 'brak gate isChat(asystentEnabled) / renderu ws.guide w fallbacku');

  // (f) prompt asystenta: zasada „NIE witaj się od nowa" (portal sam wita powitaniem zadania)
  src.includes('NIE witaj się od nowa')
    ? ok('wf2-ads-guide prompt: zasada „NIE witaj się od nowa" (portal wita, asystent kontynuuje)')
    : bad('wf2-ads-guide prompt powitanie', 'brak zasady „NIE witaj się od nowa" w promptcie');

  // (g) komponent TNChat: API addLocalBubble (dymek lokalny) + obsługa height (--tnc-chat-h) na embedded
  (chatJs.includes('addLocalBubble') && chatJs.includes('--tnc-chat-h'))
    ? ok('tn-chat.js: API addLocalBubble + cfg.height (--tnc-chat-h) na embedded')
    : bad('tn-chat.js API', 'brak addLocalBubble / obsługi height (--tnc-chat-h)');

  // (h) bump ?v=2026072302 tn-chat.* w OBU portalach (tn-sklepy + tn-app)
  (portalHtml.includes('tn-chat.js?v=2026072302') && portalHtml.includes('tn-chat.css?v=2026072302')
    && appPortalHtml.includes('tn-chat.js?v=2026072302') && appPortalHtml.includes('tn-chat.css?v=2026072302'))
    ? ok('bump ?v=2026072302: tn-chat.js/css w tn-sklepy + tn-app portal')
    : bad('bump ?v tn-chat', 'brak ?v=2026072302 na tn-chat.js/css w obu portalach');

  // (a) prompt zawiera kotwice bloku firma (WIEDZA-FIRMA-DG wklejona do §4)
  (src.includes('10 813,50') && src.includes('infakt.pl/polecam/tomekniedzwiecki') && src.includes('nierejestrowana'))
    ? ok('wf2-ads-guide: prompt zawiera blok firma (10 813,50 / infakt.pl/polecam/tomekniedzwiecki / nierejestrowana)')
    : bad('wf2-ads-guide prompt firma', 'brak kotwic bloku firma w promptcie');

  // (b) SYNC-GUARD: HIDDEN_FOR_CLIENT (wf2-ads-guide) ⟷ PREVIEW_ONLY_STEPS (wf2-portal) — oba = {"firma"}
  (/HIDDEN_FOR_CLIENT = new Set\(\["firma"\]\)/.test(src) && /PREVIEW_ONLY_STEPS = new Set\(\["firma"\]\)/.test(portalTs))
    ? ok('sync-guard: HIDDEN_FOR_CLIENT (guide) == PREVIEW_ONLY_STEPS (portal) == {"firma"}')
    : bad('sync-guard firma', 'HIDDEN_FOR_CLIENT / PREVIEW_ONLY_STEPS rozjechane (oba muszą zawierać "firma")');

  // (c) TRACK_ACTIONS (wf2-portal) zawiera 'open_guide' (event trackingu asystenta ożywiony)
  /TRACK_ACTIONS = new Set\(\[[^\]]*"open_guide"[^\]]*\]\)/.test(portalTs)
    ? ok('wf2-portal: TRACK_ACTIONS zawiera "open_guide"')
    : bad('wf2-portal TRACK_ACTIONS', 'brak "open_guide" w TRACK_ACTIONS');

  // (f) buildContextBlock maskuje NRB/NIP do ostatnich 4 znaków (funkcja maskująca)
  (src.includes('function maskTail') && src.includes('slice(-4)') && src.includes('MASKED_FIELDS'))
    ? ok('wf2-ads-guide buildContextBlock: maskowanie NRB/NIP (maskTail → slice(-4), MASKED_FIELDS)')
    : bad('wf2-ads-guide maskowanie', 'brak maskTail/slice(-4)/MASKED_FIELDS w buildContextBlock');

  // (g) import CHECKLIST_MAP z modułu danych _shared/checklist-map.ts (NIE z wf2-portal/index.ts)
  (/import\s*\{\s*CHECKLIST_MAP\s*\}\s*from\s*["']\.\.\/_shared\/checklist-map\.ts["']/.test(src)
    && src.includes('buildContextBlock') && src.includes('[STAN PROJEKTU]'))
    ? ok('wf2-ads-guide: import CHECKLIST_MAP z checklist-map.ts + buildContextBlock buduje [STAN PROJEKTU]')
    : bad('wf2-ads-guide checklist-map', 'brak importu CHECKLIST_MAP z checklist-map.ts lub buildContextBlock/[STAN PROJEKTU]');

  // projekt.html: podgląd rozmów w warsztacie ads_konto (read-only, wf2_guide_messages)
  const panelSrc = readFileSync(join(ROOT, 'tn-sklepy', 'projekt.html'), 'utf8');
  (panelSrc.includes('adsGuideBlock') && panelSrc.includes('wf2_guide_messages') && panelSrc.includes('Asystent portalu — ostatnie rozmowy') && panelSrc.includes('task_key'))
    ? ok('projekt.html: sekcja „Asystent portalu — ostatnie rozmowy" (adsGuideBlock + chipy task_key)') : bad('projekt.html przewodnik', 'brak adsGuideBlock / wf2_guide_messages / chipów task_key');

  // deploy skonfigurowany (--no-verify-jwt)
  const pkg = readFileSync(join(ROOT, 'package.json'), 'utf8');
  /"deploy:wf2-ads-guide":\s*"[^"]*--no-verify-jwt/.test(pkg) ? ok('package.json ma deploy:wf2-ads-guide (--no-verify-jwt)') : bad('package.json', 'brak deploy:wf2-ads-guide z --no-verify-jwt');
}

// ── 19. Wątki czatu PER ZADANIE + klikalne linki (pakiet naprawczy v2.1) ───
// Defekt v2: historia była JEDNYM wątkiem per projekt (wiadomości przeciekały między zadaniami,
// intro dublowało się przy powrotach). Fix: kolumna task_key + filtr history/transkryptu; asystent
// daje KLIKALNE linki zamiast opisywać nawigację. Asercje STATYCZNE (grep plików) — bez sieci.
{
  const guideSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-guide', 'index.ts'), 'utf8');
  const sharedSrc = readFileSync(join(ROOT, 'supabase', 'functions', '_shared', 'portal-chat.ts'), 'utf8');
  const wfaSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wfa-test-chat', 'index.ts'), 'utf8');
  const chatJs = readFileSync(join(ROOT, 'components', 'tn-chat.js'), 'utf8');
  const chatCss = readFileSync(join(ROOT, 'components', 'tn-chat.css'), 'utf8');
  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');

  // (a) migracja task_key: kolumna (IF NOT EXISTS) + indeks (project_id, task_key, created_at)
  const migPath = join(ROOT, 'supabase', 'migrations', '20260723_wf2_guide_task_threads.sql');
  const mig = existsSync(migPath) ? readFileSync(migPath, 'utf8') : '';
  (mig.includes('ADD COLUMN IF NOT EXISTS task_key') && mig.includes('(project_id, task_key, created_at)'))
    ? ok('migracja 20260723_wf2_guide_task_threads: task_key + indeks (project_id, task_key, created_at)')
    : bad('migracja task_key', 'brak ADD COLUMN task_key / indeksu (project_id, task_key, created_at)');

  // (b) shared: generyczne hooki rowExtra (do KAŻDEGO wiersza) + historyExtraFilter (history+transkrypt)
  (sharedSrc.includes('rowExtra') && sharedSrc.includes('historyExtraFilter') && /\.\.\.rowExtra/.test(sharedSrc) && sharedSrc.includes('applyFilter'))
    ? ok('portal-chat.ts: hooki rowExtra (...rowExtra w obu insertach) + historyExtraFilter + applyFilter w loadSignedMessages')
    : bad('portal-chat.ts hooki', 'brak rowExtra / historyExtraFilter / applyFilter');
  // wfa-test-chat NIE ustawia rowExtra/historyExtraFilter (zachowanie 1:1 — brak regresji spowiednika)
  (!wfaSrc.includes('rowExtra') && !wfaSrc.includes('historyExtraFilter'))
    ? ok('wfa-test-chat: bez rowExtra/historyExtraFilter (zachowanie 1:1)')
    : bad('wfa-test-chat regresja', 'wfa-test-chat ustawia rowExtra/historyExtraFilter — miał zostać nietknięty');

  // (c) wf2: rowExtra=task_key (validTaskKey/CHAT_TASK_KEYS) + filtr .eq("task_key") w history/transkrypcie
  (guideSrc.includes('CHAT_TASK_KEYS') && guideSrc.includes('validTaskKey') && /rowExtra:\s*\(/.test(guideSrc)
    && guideSrc.includes('historyExtraFilter') && guideSrc.includes('q.eq("task_key"'))
    ? ok('wf2-ads-guide: rowExtra=task_key + filtr .eq("task_key") w history/transkrypcie (wątek per zadanie)')
    : bad('wf2-ads-guide task_key', 'brak validTaskKey/CHAT_TASK_KEYS/rowExtra/historyExtraFilter/eq task_key');
  // bez task_key → pełna historia (panel admina): filtr zwraca q bez zawężenia
  /return k \? q\.eq\("task_key", k\) : q;/.test(guideSrc)
    ? ok('wf2-ads-guide: bez task_key → pełna historia (q bez filtra) — panel admina')
    : bad('wf2-ads-guide fallback historii', 'brak gałęzi „bez task_key → pełna historia"');
  // CHAT_TASK_KEYS == CHAT_TASKS w portalu (te same 4 zadania czatowe)
  ['ads_strona', 'ads_konto', 'ads_budzet', 'firma'].every((k) => guideSrc.includes(`"${k}"`))
    ? ok('wf2-ads-guide: CHAT_TASK_KEYS = [ads_strona, ads_konto, ads_budzet, firma]')
    : bad('wf2-ads-guide CHAT_TASK_KEYS', 'brak kompletu kluczy zadań czatowych');

  // (d) linkifikacja tn-chat: bezpieczna (appendLinkified/createElement('a')/rel noopener/tnc-link), bez innerHTML z treści
  (chatJs.includes('appendLinkified') && chatJs.includes("createElement('a')") && chatJs.includes("'noopener noreferrer'")
    && chatJs.includes("a.className = 'tnc-link'") && chatJs.includes('appendLinkified(b,'))
    ? ok("tn-chat.js: linkifikacja bezpieczna (appendLinkified/createElement('a')/rel noopener/tnc-link; bubble buduje DOM)")
    : bad('tn-chat.js linkifikacja', "brak appendLinkified/createElement('a')/noopener/tnc-link lub bubble nie linkifikuje");
  // context() doklejane też do akcji history (wątek per zadanie działa przy refresh)
  /Object\.assign\(\{ action: 'history' \}, cfg\.context\(\)\)/.test(chatJs)
    ? ok('tn-chat.js: context() doklejane do akcji history (refresh pobiera wątek zadania)')
    : bad('tn-chat.js history context', 'akcja history nie dokleja cfg.context()');
  // CSS .tnc-link (akcent + podkreślenie na hover) + mobile okno rozmowy ~56svh
  (chatCss.includes('.tnc-link') && /\.tnc-link:hover\s*\{[^}]*underline/.test(chatCss))
    ? ok('tn-chat.css: .tnc-link (akcent + underline na hover)') : bad('tn-chat.css .tnc-link', 'brak .tnc-link / underline na hover');
  /max-width:\s*720px[\s\S]*max-height:\s*56svh/.test(chatCss)
    ? ok('tn-chat.css: mobile okno rozmowy max-height 56svh (composer widoczny)') : bad('tn-chat.css mobile', 'brak max-height 56svh na mobile');

  // (e) prompt asystenta: reguła BEZPOŚREDNI pełny link (klikalny) + dokładne nazwy pól; adresy Meta jako https://
  (guideSrc.includes('BEZPOŚREDNI pełny link') && guideSrc.includes('Linki w czacie są klikalne') && guideSrc.includes('Link do strony na Facebooku'))
    ? ok('wf2-ads-guide prompt: „BEZPOŚREDNI pełny link (https://…)" klikalny + dokładne nazwy pól')
    : bad('wf2-ads-guide prompt linki', 'brak reguły o bezpośrednim pełnym linku / nazwach pól');
  (guideSrc.includes('https://business.facebook.com/settings/partners') && guideSrc.includes('https://facebook.com/pages/create') && guideSrc.includes('https://adsmanager.facebook.com'))
    ? ok('wf2-ads-guide prompt: adresy Meta jako pełne https:// (partners/pages-create/adsmanager)')
    : bad('wf2-ads-guide prompt https', 'brak pełnych https:// adresów Meta w promptcie');

  // (f) portal chatIntro: gołe adresy zamienione na https:// (linkifikacja je podchwyci)
  (portalHtml.includes('https://business.facebook.com/latest/business_home') && portalHtml.includes('https://facebook.com/pages/create') && portalHtml.includes('https://business.facebook.com/billing_hub/payment_settings'))
    ? ok('portal.html chatIntro: adresy jako pełne https:// (business_home/pages-create/billing_hub)')
    : bad('portal.html intro https', 'brak https:// w chatIntro (business_home/pages-create/billing_hub)');

  // (g) wątek per zadanie w portalu: refresh() przez syncChatTask (chatLoadedTask) + intro tylko gdy wątek pusty (onHistory); maybeIntro usunięty
  (portalHtml.includes('syncChatTask') && portalHtml.includes('chatLoadedTask') && portalHtml.includes('chat.refresh()')
    && /d\.messages\)\s*&&\s*d\.messages\.length/.test(portalHtml) && !portalHtml.includes('maybeIntro'))
    ? ok('portal.html: wątek per zadanie (syncChatTask/chatLoadedTask/refresh) + intro tylko gdy pusty; maybeIntro usunięty')
    : bad('portal.html wątek per zadanie', 'brak syncChatTask/chatLoadedTask/refresh albo pozostał maybeIntro');

  // (h) CTA zadania NIEukończonego = NIEBIESKI (#0070f3), nie zielony (reguła: zieleń TYLKO done)
  (/\.tv-cta\s*\{[^}]*background:#0070f3/.test(portalHtml) && !/\.tv-cta\s*\{[^}]*background:#45a557/.test(portalHtml))
    ? ok('portal.html: .tv-cta = niebieski #0070f3 (zieleń tylko done)')
    : bad('portal.html CTA kolor', '.tv-cta nadal zielony (#45a557) — zieleń tylko dla done');
}

// ── 20. Ekstrakcja danych z rozmowy (marker <dane>) — asystent wyciąga i ZAPISUJE ─────────
// Realny przypadek (23.07, Zaradek): klient wkleił link „share" z telefonu (facebook.com/share/…),
// asystent go ODRZUCIŁ i odesłał do pola → dane przepadły. Fix: model emituje <dane>{…}</dane>,
// edge waliduje + zapisuje po stronie fabryki (jak wf2-portal task_save), pole wypełnia się samo.
{
  const guideSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-ads-guide', 'index.ts'), 'utf8');
  const portalSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'index.ts'), 'utf8');
  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');

  // (a) marker <dane> w PROMPCIE (instrukcja dla modelu) + PARSER w edge (parseDane wycina marker)
  (guideSrc.includes('<dane>') && guideSrc.includes('function parseDane') && /<dane>\(\[\\s\\S\]\*\?\)<\\\/dane>/.test(guideSrc))
    ? ok('wf2-ads-guide: marker <dane> w prompcie + parser parseDane (regex wycinający) w edge')
    : bad('wf2-ads-guide marker <dane>', 'brak <dane> w prompcie lub parseDane/regex w edge');
  // marker <dane> spięty w parseMarkers/onMarkers → applyDane + zwrot saved
  (guideSrc.includes('applyDane') && guideSrc.includes('kind: "dane"') && guideSrc.includes('return ctx.json({ reply, stuck: !!stuck, saved })'))
    ? ok('wf2-ads-guide: onMarkers → applyDane + odpowiedź JSON rozszerzona o saved')
    : bad('wf2-ads-guide onMarkers dane', 'brak applyDane / kind:"dane" / saved w odpowiedzi JSON');

  // (b) SYNC zbiorów: CHAT_FIELD_WHITELIST (guide) == CLIENT_FIELD_WHITELIST (portal) dla ads_strona/ads_konto/firma
  {
    const parseWl = (src, constName) => {
      const start = src.indexOf(constName);
      if (start < 0) return null;
      const open = src.indexOf('{', start);
      const close = src.indexOf('};', open);
      const block = open >= 0 && close > open ? src.slice(open, close) : '';
      const wl = {};
      for (const m of block.matchAll(/([a-z_]+):\s*\[([^\]]*)\]/g)) {
        wl[m[1]] = [...m[2].matchAll(/"([a-z_]+)"/g)].map((x) => x[1]).sort();
      }
      return wl;
    };
    const chatWl = parseWl(guideSrc, 'CHAT_FIELD_WHITELIST');
    const clientWl = parseWl(portalSrc, 'CLIENT_FIELD_WHITELIST');
    const eq = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);
    const keysToCheck = ['ads_strona', 'ads_konto', 'firma'];
    const synced = chatWl && clientWl && keysToCheck.every((k) => eq(chatWl[k], clientWl[k]));
    synced
      ? ok('sync: CHAT_FIELD_WHITELIST (guide) == CLIENT_FIELD_WHITELIST (portal) dla ads_strona/ads_konto/firma')
      : bad('CHAT_FIELD_WHITELIST sync', `rozjazd zbiorów pól: guide=${JSON.stringify(chatWl)} vs portal=${JSON.stringify(clientWl)}`);
  }

  // (c) walidacja NIP z sumą kontrolną (wagi 6 5 7 2 3 4 5 6 7 + mod 11)
  (guideSrc.includes('function validateNip') && /\[6,\s*5,\s*7,\s*2,\s*3,\s*4,\s*5,\s*6,\s*7\]/.test(guideSrc) && /%\s*11/.test(guideSrc))
    ? ok('wf2-ads-guide: validateNip z sumą kontrolną (wagi 6 5 7 2 3 4 5 6 7, mod 11)')
    : bad('wf2-ads-guide NIP', 'brak validateNip / wag [6,5,7,2,3,4,5,6,7] / mod 11');

  // (d) share-link akceptowany: /share/ w walidacji fanpage (edge) + „share" w prompcie (przyjmij, nie odrzucaj)
  (guideSrc.includes('function resolveShareLink') && /\/\^\\\/share\\\//.test(guideSrc) && guideSrc.includes('redirect: "follow"') && guideSrc.includes('/share/'))
    ? ok('wf2-ads-guide: share-link akceptowany + rozwiązywany (resolveShareLink, redirect follow, /share/)')
    : bad('wf2-ads-guide share-link', 'brak resolveShareLink / obsługi /share/ z redirect follow');
  (/share/i.test(guideSrc) && guideSrc.includes('facebook.com/share/') && /POPRAWNE|POPRAWNY/.test(guideSrc))
    ? ok('wf2-ads-guide prompt: share-link (facebook.com/share/…) opisany jako POPRAWNY (przyjmij, nie odrzucaj)')
    : bad('wf2-ads-guide prompt share', 'prompt nie mówi, że share-link jest POPRAWNY');

  // (e) normalizacja act_ IDENTYCZNA jak wf2-portal (act_${...} + cyfry) — pętla ręczna bez webhooka
  (guideSrc.includes('function validateAdAccount') && /`act_\$\{m\[1\]\}`/.test(guideSrc) && portalSrc.includes('act_${rawId}'))
    ? ok('wf2-ads-guide: normalizacja act_ (act_${cyfry}) zgodna z wf2-portal task_save')
    : bad('wf2-ads-guide act_', 'brak validateAdAccount / act_${...} albo rozjazd z wf2-portal');

  // (f) propagacja act_ → wf2_projects.meta_ad_account_id gdy puste (jak task_save)
  (guideSrc.includes('function propagateAdAccount') && guideSrc.includes('meta_ad_account_id') && /update\(\{ meta_ad_account_id: actId \}\)/.test(guideSrc))
    ? ok('wf2-ads-guide: propagacja act_ → wf2_projects.meta_ad_account_id (gdy puste)')
    : bad('wf2-ads-guide propagacja', 'brak propagateAdAccount / update meta_ad_account_id');
  // zapis ads_* przez atomowy rpc wf2_step_merge (p_block_merge) jak w portalu
  (guideSrc.includes('rpc("wf2_step_merge"') && /p_block_merge: true/.test(guideSrc))
    ? ok('wf2-ads-guide: zapis ads_* przez rpc(wf2_step_merge) block-merge (jak task_save)')
    : bad('wf2-ads-guide zapis', 'brak rpc(wf2_step_merge)/p_block_merge=true');

  // (g) front konsumuje saved: onResponse → applySavedFields (input [data-task][data-field] + Zapisano + P.steps)
  (portalHtml.includes('onResponse:') && portalHtml.includes('applySavedFields') && portalHtml.includes('d.saved')
    && portalHtml.includes('[data-task="${task_key}"][data-field="${field}"]') && portalHtml.includes('client_fields'))
    ? ok('portal.html: onResponse → applySavedFields (input [data-task][data-field] + Zapisano ✓ + P.steps.client_fields)')
    : bad('portal.html saved', 'brak onResponse/applySavedFields/d.saved/selektora pola/aktualizacji client_fields');

  // (h) zasady MOBILE + EMPATIA SYTUACYJNA w prompcie: konkretna ścieżka telefonowa (przeglądarka
  //     w trybie komputerowym), zakaz kreatora reklamy w appce, plan A/plan B, rozpoznanie sytuacji.
  (guideSrc.includes('APLIKACJA MOBILNA') && guideSrc.includes('Meta Business Suite')
    && guideSrc.includes('Wersja na komputer') && guideSrc.includes('Poproś o witrynę na komputer')
    && /NIE prowadź przez kreator reklamy/.test(guideSrc)
    && guideSrc.includes('EMPATIA SYTUACYJNA') && guideSrc.includes('plan A') && guideSrc.includes('plan B'))
    ? ok('wf2-ads-guide prompt: EMPATIA SYTUACYJNA + ścieżka mobilna (przeglądarka tryb komputerowy, zakaz kreatora w appce, plan A/B)')
    : bad('wf2-ads-guide prompt MOBILE/EMPATIA', 'brak ścieżki mobilnej (tryb komputerowy) / zakazu kreatora / zasady empatii sytuacyjnej plan A/B');

  // (i) firma: guard defensywny — zapis blokowany dopóki „firma" w HIDDEN_FOR_CLIENT (sync z PREVIEW_ONLY_STEPS)
  /taskKey === "firma" && HIDDEN_FOR_CLIENT\.has\("firma"\)/.test(guideSrc)
    ? ok('wf2-ads-guide: firma — guard HIDDEN_FOR_CLIENT (brak zapisu dopóki krok ukryty)')
    : bad('wf2-ads-guide firma guard', 'brak guardu firma/HIDDEN_FOR_CLIENT w applyDane');

  // (j) aktywność ads_guide_dane (log co zapisano, bez wartości wrażliwych)
  guideSrc.includes('action: "ads_guide_dane"')
    ? ok('wf2-ads-guide: aktywność wf2_activities action="ads_guide_dane"')
    : bad('wf2-ads-guide aktywność', 'brak action="ads_guide_dane"');
}

console.log(`\n=== Wynik: ${pass} OK, ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
