#!/usr/bin/env node
// Smoke test modułu TN Sklepy (workflow v2) — uruchamiać po każdej zmianie modułu:
//   npm run test:wf2
// Sprawdza kontrakty, które pękają NIEZAUWAŻENIE (rozjazd WS↔step_defs, otwarte gate'y
// edge, dziura RLS) — bez dotykania produkcyjnych danych (wyłącznie odczyty i 4xx).
// Sekrety: tn-crm/.env (SUPABASE_SERVICE_KEY). Klucz publiczny = ten sam co w panelu.

import { readFileSync, existsSync } from 'node:fs';
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
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'checklist-map.ts'), 'utf8');
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

  // front: przycisk w portalu + sekcja w panelu
  const portalHtml = readFileSync(join(ROOT, 'tn-sklepy', 'portal.html'), 'utf8');
  (portalHtml.includes('leadsieConnectBlock') && portalHtml.includes('Połącz konta reklamowe'))
    ? ok('portal.html: przycisk „Połącz konta reklamowe" (leadsieConnectBlock)')
    : bad('portal.html leadsie', 'brak leadsieConnectBlock / tytułu przycisku');
  panelSrc.includes('adsKontoLeadsieBlock') ? ok('projekt.html: sekcja „Połączenia Leadsie" (adsKontoLeadsieBlock)') : bad('projekt.html leadsie', 'brak adsKontoLeadsieBlock');

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

console.log(`\n=== Wynik: ${pass} OK, ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
