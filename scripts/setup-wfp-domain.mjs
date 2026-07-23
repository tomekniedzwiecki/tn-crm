#!/usr/bin/env node
// setup-wfp-domain.mjs — JEDNORAZOWY setup dedykowanej subdomeny wysyłkowej
// Prospektora `kontakt.tomekniedzwiecki.pl` w Resend (sending SPF/DKIM + receiving MX).
//
// ⚠️ NIE URUCHAMIAJ automatycznie. Skrypt tworzy zasób w Resend i (opcjonalnie z
//    --apply) zakłada rekordy DNS w Vercel. Uruchamia go Tomek świadomie.
//
// KLUCZ RESEND: --key <re_...>  albo  env RESEND_API_KEY.  Sekret NIGDY w output
//    (logujemy tylko fakt jego obecności). Klucz musi mieć uprawnienia do Domains.
//
// KROKI:
//   1. POST /domains { name: 'kontakt.tomekniedzwiecki.pl', region: 'eu' }
//   2. Wypisz rekordy DNS (SPF/DKIM/DMARC) + gotowe komendy `vercel dns add`.
//      (z --apply wykonuje je przez `vercel dns add …` — wymaga zalogowanego Vercel CLI)
//   3. PATCH /domains/{id} { capabilities: { receiving: 'enabled' } }  → włącz odbiór
//      + ponownie wypisz rekord „Receiving MX" (do vercel dns add)
//   4. POST /domains/{id}/verify  → uruchom weryfikację (propagacja DNS bywa < godziny)
//   5. Instrukcja końcowa: po statusie „verified" ustaw adres wysyłkowy:
//        UPDATE public.settings SET value='tomek@kontakt.tomekniedzwiecki.pl'
//         WHERE key='wfp_from_email';
//      (do czasu weryfikacji zostaje fallback biuro@tomekniedzwiecki.pl — zero deployu.)
//
// Flagi: --key <re_...> · --domain <name> (default kontakt.tomekniedzwiecki.pl)
//        --region <eu|us> (default eu) · --apply (wykonaj vercel dns add)
//        --verify-only (pomiń tworzenie — tylko POST verify na istniejącą domenę --id <id>)
//
// Plan (kontrakt): docs/stworze/PROSPEKTOR-PLAN.md §II.1 + §II.6.

import { execFileSync } from 'node:child_process';

const RESEND_API = 'https://api.resend.com';
const APEX = 'tomekniedzwiecki.pl';

const log  = (m) => console.log(`[setup-wfp-domain] ${m}`);
const warn = (m) => console.warn(`[setup-wfp-domain] ⚠️  ${m}`);
const die  = (m) => { console.error(`[setup-wfp-domain] BŁĄD: ${m}`); process.exit(1); };

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return (v && !v.startsWith('--')) ? v : true; // flaga bez wartości → true
}

const KEY     = arg('--key') && arg('--key') !== true ? arg('--key') : (process.env.RESEND_API_KEY || null);
const DOMAIN  = (arg('--domain') && arg('--domain') !== true) ? arg('--domain') : `kontakt.${APEX}`;
const REGION  = (arg('--region') && arg('--region') !== true) ? arg('--region') : 'eu';
const APPLY   = arg('--apply') === true;
const VERIFY_ONLY = arg('--verify-only') === true;
const EXIST_ID = (arg('--id') && arg('--id') !== true) ? arg('--id') : null;

if (!KEY || typeof KEY !== 'string' || !KEY.startsWith('re_')) {
  die('brak klucza Resend. Podaj --key re_... albo env RESEND_API_KEY (klucz z uprawnieniem Domains).');
}
log(`klucz Resend: obecny (${KEY.slice(0, 3)}…, długość ${KEY.length}) — NIE wypisuję go`);
log(`domena: ${DOMAIN} · region: ${REGION} · apply(DNS): ${APPLY ? 'TAK' : 'nie (tylko wypisze komendy)'}`);

async function resend(method, path, body) {
  const res = await fetch(`${RESEND_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json = null;
  try { json = text.trim() ? JSON.parse(text) : {}; } catch { /* zostaw text */ }
  return { ok: res.ok, status: res.status, json, text };
}

// Rekord Resend → komenda `vercel dns add` (name względem apeksu; wartości bez sekretów).
function toVercelCmd(rec) {
  const full = String(rec.name || '').replace(/\.$/, '');
  let rel = full;
  if (full === APEX) rel = '@';
  else if (full.endsWith(`.${APEX}`)) rel = full.slice(0, -(`.${APEX}`).length);
  const type = String(rec.type || '').toUpperCase();
  const value = rec.value ?? '';
  const prio = (type === 'MX' && rec.priority != null) ? ` ${rec.priority}` : '';
  // Cudzysłowy wokół value (TXT/SPF/DKIM bywają długie ze spacjami).
  return `vercel dns add ${APEX} "${rel}" ${type} "${value}"${prio}`;
}

function printRecords(records) {
  if (!Array.isArray(records) || !records.length) { warn('brak rekordów DNS w odpowiedzi Resend'); return []; }
  const cmds = [];
  console.log('\n── REKORDY DNS (Resend → Vercel) ─────────────────────────────');
  for (const rec of records) {
    const type = String(rec.type || '').toUpperCase();
    const status = rec.status ? ` [${rec.status}]` : '';
    console.log(`  ${type.padEnd(5)} ${String(rec.name || '').padEnd(48)} ${rec.priority != null ? 'prio=' + rec.priority + ' ' : ''}${status}`);
    console.log(`        → ${rec.value ?? ''}`);
    cmds.push(toVercelCmd(rec));
  }
  console.log('\n── GOTOWE KOMENDY (vercel dns add) ───────────────────────────');
  cmds.forEach((c) => console.log('  ' + c));
  return cmds;
}

function applyVercel(cmds) {
  if (!APPLY) { log('pomijam wykonanie DNS (bez --apply). Skopiuj komendy powyżej.'); return; }
  log('--apply: wykonuję vercel dns add …');
  for (const c of cmds) {
    const parts = c.replace(/^vercel /, '').match(/(?:[^\s"]+|"[^"]*")+/g).map((p) => p.replace(/^"|"$/g, ''));
    try {
      const out = execFileSync('vercel', parts, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      log(`  ✓ ${parts.slice(0, 3).join(' ')} — ${out.trim().split('\n').pop()}`);
    } catch (e) {
      warn(`  ✗ ${parts.slice(0, 3).join(' ')} — ${String(e.message || e).split('\n')[0]} (może już istnieć — sprawdź ręcznie)`);
    }
  }
}

(async () => {
  let domainId = EXIST_ID;
  let records = [];

  if (!VERIFY_ONLY) {
    log('KROK 1: POST /domains …');
    const created = await resend('POST', '/domains', { name: DOMAIN, region: REGION });
    if (!created.ok) {
      // 422 = domena już istnieje → spróbuj ją odnaleźć (GET /domains) i kontynuuj.
      warn(`POST /domains → ${created.status}: ${created.json?.message || created.text.slice(0, 200)}`);
      const listed = await resend('GET', '/domains');
      const found = (listed.json?.data || []).find((d) => d.name === DOMAIN);
      if (!found) die('nie udało się utworzyć ani znaleźć domeny — sprawdź uprawnienia klucza.');
      domainId = found.id;
      log(`domena istnieje: id=${domainId}, status=${found.status}`);
      const detail = await resend('GET', `/domains/${domainId}`);
      records = detail.json?.records || [];
    } else {
      domainId = created.json?.id;
      records = created.json?.records || [];
      log(`  ✓ utworzona: id=${domainId}, status=${created.json?.status}`);
    }

    // KROK 2: rekordy + komendy DNS
    const cmds = printRecords(records);
    applyVercel(cmds);

    // KROK 3: włącz receiving (MX) — capability + ponowne wypisanie MX
    log('KROK 3: PATCH /domains/{id} capabilities.receiving=enabled …');
    const patched = await resend('PATCH', `/domains/${domainId}`, { capabilities: { receiving: 'enabled' } });
    if (!patched.ok) {
      warn(`PATCH capabilities → ${patched.status}: ${patched.json?.message || patched.text.slice(0, 200)}`);
      warn('Jeśli API nie przyjmuje tego kształtu — włącz „Receiving" w panelu Resend i pobierz rekord MX ręcznie.');
    } else {
      log('  ✓ receiving=enabled');
    }
    // Pobierz świeże rekordy (dojdzie „Receiving MX").
    const after = await resend('GET', `/domains/${domainId}`);
    const mxRecords = (after.json?.records || []).filter((r) => String(r.type || '').toUpperCase() === 'MX');
    if (mxRecords.length) {
      console.log('\n── RECEIVING MX (dodatkowo do DNS) ───────────────────────────');
      const mxCmds = printRecords(mxRecords);
      applyVercel(mxCmds);
    } else {
      warn('brak rekordu MX w odpowiedzi — sprawdź panel Resend (Receiving).');
    }
  }

  if (!domainId) die('brak domainId (użyj --id <id> z --verify-only).');

  // KROK 4: weryfikacja
  log('KROK 4: POST /domains/{id}/verify …');
  const verified = await resend('POST', `/domains/${domainId}/verify`, {});
  if (!verified.ok) warn(`verify → ${verified.status}: ${verified.json?.message || verified.text.slice(0, 200)} (propagacja DNS bywa < godziny — powtórz później)`);
  else log(`  ✓ verify uruchomione (status: ${verified.json?.status || 'pending'})`);

  // KROK 5: instrukcja końcowa
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('DALEJ (ręcznie, po statusie „verified" w Resend):');
  console.log('  1. Sprawdź status: GET /domains/' + domainId + ' → status=verified.');
  console.log('  2. Przełącz adres wysyłkowy Prospektora (zero deployu):');
  console.log("       UPDATE public.settings SET value='tomek@kontakt.tomekniedzwiecki.pl'");
  console.log("        WHERE key='wfp_from_email';");
  console.log('  3. Reply-To = ten sam adres → odpowiedzi wracają do wfa-inbox-webhook (tor Prospektora).');
  console.log('  4. Warm-up: podnoś settings.wfp_send_daily_cap stopniowo (start 25/dzień).');
  console.log('════════════════════════════════════════════════════════════');
  log('koniec.');
})();
