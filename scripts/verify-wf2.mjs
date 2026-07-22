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
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'checklist-map.ts'), 'utf8');
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
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'checklist-map.ts'), 'utf8');

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
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'checklist-map.ts'), 'utf8');
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

  // (poz.13) CLIENT_FIELD_WHITELIST bez reliktów ads_konto/ads_budzet
  {
    const wlStart = portalSrc.indexOf('CLIENT_FIELD_WHITELIST');
    const wlBlock = wlStart >= 0 ? portalSrc.slice(wlStart, portalSrc.indexOf('};', wlStart)) : '';
    // sprawdzamy KLUCZE mapy (ads_konto:/ads_budzet:) i CUDZYSŁOWNE wartości (relikty jako "bm_id"),
    // żeby nie łapać nazw reliktów wymienionych w komentarzu wyjaśniającym (bez cudzysłowów).
    (!/ads_konto:\s*\[/.test(wlBlock) && !/ads_budzet:\s*\[/.test(wlBlock) && !/"bm_id"|"partner_id"|"ad_account_id"|"amount"|"confirmation"/.test(wlBlock))
      ? ok('wf2-portal CLIENT_FIELD_WHITELIST: brak reliktów ads_konto/ads_budzet (self-attestation zabita)')
      : bad('CLIENT_FIELD_WHITELIST relikty', 'nadal jest ads_konto/ads_budzet/"bm_id"/"partner_id"/"ad_account_id"/"confirmation"');
  }

  // (P0/poz.14) portal CLIENT_WS: Leadsie-first — 737839566050751 TYLKO w fallbacku <details> ads_konto
  {
    const kStart = portalHtml.indexOf('ads_konto: {');
    const kEnd = portalHtml.indexOf('ads_strona: {', kStart);
    const kBlock = kStart >= 0 && kEnd > kStart ? portalHtml.slice(kStart, kEnd) : '';
    const detailsIdx = kBlock.indexOf('<details');
    const idIdx = kBlock.indexOf('737839566050751');
    (kBlock.includes('Połącz konta reklamowe') && detailsIdx >= 0 && idIdx > detailsIdx)
      ? ok('portal CLIENT_WS.ads_konto: Leadsie-first, 737839566050751 tylko w fallbacku <details>')
      : bad('portal CLIENT_WS.ads_konto', 'ID BM poza zwijanym fallbackiem albo brak „Połącz konta"');
    // ads_budzet PREPAID-first (płatności ręczne) + ostrzeżenie o przelewie; kwoty bez zmian (1000 zł)
    const bStart = portalHtml.indexOf('ads_budzet: {');
    const bEnd = portalHtml.indexOf('pl_domena: {', bStart);
    const bBlock = bStart >= 0 && bEnd > bStart ? portalHtml.slice(bStart, bEnd) : '';
    (/ręczn/i.test(bBlock) && /przelew/i.test(bBlock) && bBlock.includes('1000 zł'))
      ? ok('portal CLIENT_WS.ads_budzet: prepaid-first (płatności ręczne) + ostrzeżenie o przelewie (1000 zł)')
      : bad('portal CLIENT_WS.ads_budzet', 'brak płatności ręcznych / ostrzeżenia o przelewie / kwoty 1000 zł');
  }
  // zadanie ads_strona: „Załatwione w tym samym kreatorze" zamiast dublowania CTA (poz.14)
  portalHtml.includes('Załatwione w tym samym kreatorze') ? ok('portal: ads_strona przy connected_page → „Załatwione w tym samym kreatorze" (bez drugiego CTA)') : bad('portal ads_strona CTA', 'brak komunikatu „Załatwione w tym samym kreatorze"');

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
  const mapSrc = readFileSync(join(ROOT, 'supabase', 'functions', 'wf2-portal', 'checklist-map.ts'), 'utf8');

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

console.log(`\n=== Wynik: ${pass} OK, ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
