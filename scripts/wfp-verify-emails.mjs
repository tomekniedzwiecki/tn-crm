#!/usr/bin/env node
// wfp-verify-emails.mjs — audyt higieny e-maili prospektów (deliverability PRZED skalą).
// Dla wszystkich wfp_prospects z e-mailem: (a) walidacja składni, (b) detekcja literówek
// popularnych domen (słownik + Damerau-Levenshtein 1 od gmail.com/wp.pl/o2.pl/onet.pl/interia.pl),
// (c) MX lookup domeny (node:dns, cache per domena, sekwencyjnie z małą przerwą — nie bombardujemy DNS).
//
// Wyjście: raport na stdout + CSV c:\tmp\prospektor\email-audit.csv (email, problem, sugestia, firma).
// Klasyfikacja (priorytet): bad > typo > no_mx > ok.
//   bad   — składnia niepoprawna (nie da się wysłać, ryzyko odbicia twardego).
//   typo  — domena = literówka popularnego dostawcy (np. gmial.com → gmail.com); sugestia korekty.
//   no_mx — domena bez rekordów MX (ani A) — poczta nie ma gdzie dojść → twardy bounce.
//   ok    — składnia OK, brak literówki, domena ma MX.
//
// Tryb --apply: zapisuje wynik do wfp_prospects.email_check (wymaga migracji 20260723f_wfp_email_check.sql).
//   BEZ --apply działa też bez kolumny (tryb czysto raportowy — nic nie pisze do bazy).
//
// Użycie:
//   node scripts/wfp-verify-emails.mjs            # raport (stdout + CSV), zero zapisu
//   node scripts/wfp-verify-emails.mjs --apply    # + zapis email_check do bazy
//   node scripts/wfp-verify-emails.mjs --limit 50 # ogranicz liczbę rekordów (debug)
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential Manager
// (target „Supabase CLI:supabase"). Sekret NIGDY w output.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import dns from 'node:dns';

const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const CSV_PATH = 'c:\\tmp\\prospektor\\email-audit.csv';

const die = (m) => { console.error(`[wfp-verify] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[wfp-verify] ${m}`);
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const flag = (name) => process.argv.includes(name);

const APPLY = flag('--apply');
const LIMIT = parseInt(arg('--limit') || '0', 10) || 0;
const DNS_DELAY_MS = 120;              // przerwa między lookupami MX (nie bombardujemy resolvera)

// ── token (wzorzec wfp-import-csv.mjs) ───────────────────────────────────────
function readTokenFromCredMan() {
  const ps = `
$ErrorActionPreference = 'Stop'
$sig = @"
using System;
using System.Runtime.InteropServices;
public class Cred {
  [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  public static extern bool CredRead(string target, int type, int flags, out IntPtr credential);
  [DllImport("advapi32.dll")]
  public static extern void CredFree(IntPtr cred);
}
"@
Add-Type -TypeDefinition $sig
$ptr = [IntPtr]::Zero
if (-not [Cred]::CredRead("Supabase CLI:supabase", 1, 0, [ref]$ptr)) { throw "CredRead failed" }
$size = [Runtime.InteropServices.Marshal]::ReadInt32($ptr, 32)
$blobPtr = [Runtime.InteropServices.Marshal]::ReadIntPtr($ptr, 40)
$bytes = New-Object byte[] $size
[Runtime.InteropServices.Marshal]::Copy($blobPtr, $bytes, 0, $size)
[Cred]::CredFree($ptr)
[Console]::Out.Write([Text.Encoding]::UTF8.GetString($bytes))
`;
  const enc = Buffer.from(ps, 'utf16le').toString('base64');
  return execFileSync('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
const TOKEN = arg('--token') || process.env.SUPABASE_MGMT_TOKEN || (() => { try { return readTokenFromCredMan(); } catch { return null; } })();
if (!TOKEN || !TOKEN.startsWith('sbp_')) die('brak tokena Management API (sbp_*)');

async function sql(query) {
  const r = await fetch(MGMT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await r.text();
  if (r.status >= 300) die(`Management API ${r.status}: ${text.slice(0, 500)}`);
  try { return text.trim() ? JSON.parse(text) : []; } catch { die(`odpowiedź nie-JSON: ${text.slice(0, 300)}`); }
}

// ── walidacja składni ────────────────────────────────────────────────────────
// Zwięzły, praktyczny wzorzec (jak import): local@host.tld, bez spacji, TLD ≥ 2 znaki.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── słownik literówek + cele Damerau-Levenshtein ─────────────────────────────
// Popularni polscy/globalni dostawcy poczty — cele detekcji literówek.
const TYPO_TARGETS = [
  'gmail.com', 'wp.pl', 'o2.pl', 'onet.pl', 'interia.pl',
  'op.pl', 'gazeta.pl', 'poczta.onet.pl', 'onet.eu', 'interia.eu',
  'hotmail.com', 'outlook.com', 'outlook.pl', 'yahoo.com', 'yahoo.pl',
  'icloud.com', 'live.com', 'tlen.pl', 'vp.pl', 'wp.eu', 'googlemail.com', 'proton.me',
];
// Domeny UZNANE za poprawne (nigdy nie flagujemy jako literówka, nawet gdy dist=1 od innej).
const KNOWN_GOOD = new Set(TYPO_TARGETS.concat([
  'protonmail.com', 'me.com', 'aol.com', 'gmx.com', 'gmx.de', 'poczta.fm', 'autograf.pl',
  'neostrada.pl', 'buziaczek.pl', 'go2.pl', 'onet.com.pl', 'wp.com.pl',
]));
// Jawny słownik częstych literówek → poprawna domena (uzupełnia detekcję dystansem,
// łapie też przypadki >1 edycji, np. „gmail.comm" czy warianty regionalne).
const TYPO_DICT = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmil.com': 'gmail.com',
  'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.comm': 'gmail.com',
  'gmaill.com': 'gmail.com', 'gmail.pl': 'gmail.com', 'gnail.com': 'gmail.com',
  'gmail.cm': 'gmail.com', 'gmailc.om': 'gmail.com', 'gmal.com': 'gmail.com',
  'wp.pll': 'wp.pl', 'wp.p': 'wp.pl', 'wp.ol': 'wp.pl', 'wp.pll': 'wp.pl', 'wp.com': 'wp.pl',
  'onet.pll': 'onet.pl', 'onet.p': 'onet.pl', 'onet.com': 'onet.pl', 'onte.pl': 'onet.pl',
  'interia.pll': 'interia.pl', 'interia.p': 'interia.pl', 'interia.com': 'interia.pl', 'intera.pl': 'interia.pl',
  'o2.pll': 'o2.pl', 'o2.p': 'o2.pl', 'o2.com': 'o2.pl',
  'op.pll': 'op.pl', 'hotmial.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outllok.com': 'outlook.com', 'yaho.com': 'yahoo.com', 'yahho.com': 'yahoo.com',
};

// Damerau-Levenshtein (OSA) — transpozycja (gmial→gmail) liczona jako 1 edycja.
function damerau(a, b) {
  const al = a.length, bl = b.length;
  if (Math.abs(al - bl) > 2) return 99;   // szybki odsiew (interesuje nas ≤1)
  const d = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[al][bl];
}

// Zwraca sugerowaną poprawną domenę albo null.
function detectTypo(domain) {
  if (KNOWN_GOOD.has(domain)) return null;      // znana-dobra: nigdy literówka
  if (TYPO_DICT[domain]) return TYPO_DICT[domain];
  let best = null, bestDist = 99;
  for (const t of TYPO_TARGETS) {
    const dist = damerau(domain, t);
    if (dist === 1 && dist < bestDist) { best = t; bestDist = dist; }
  }
  return best;
}

// ── MX lookup z cache per domena ─────────────────────────────────────────────
const mxCache = new Map();   // domain -> true (ma pocztę) | false (brak MX i A)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Bootstrap resolvera: użyj systemowego DNS; jeśli martwy (canary padnie połączeniowo —
// np. resolver 127.0.0.1 nieaktywny w środowisku CI/sandbox), przełącz na publiczne serwery.
// Rozróżnienie jest KLUCZOWE: brak MX prawdziwej domeny (ENOTFOUND/ENODATA) ≠ zepsuty resolver
// (ECONNREFUSED/ETIMEOUT) — bez tego cała baza wyszłaby fałszywie jako no_mx.
async function ensureResolver() {
  const canary = async () => { await dns.promises.resolveMx('gmail.com'); };
  try { await canary(); log(`DNS: resolver systemowy OK (${dns.getServers().join(', ')})`); return; }
  catch (e) { log(`DNS: resolver systemowy niedostępny (${e.code || e.message}) — przełączam na publiczny.`); }
  dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']);
  try { await canary(); log(`DNS: publiczny resolver OK (${dns.getServers().join(', ')})`); }
  catch (e) { die(`DNS nie działa nawet na publicznych serwerach (${e.code || e.message}) — MX lookup niemożliwy.`); }
}

async function hasMail(domain) {
  if (mxCache.has(domain)) return mxCache.get(domain);
  let ok = false;
  try {
    const mx = await dns.promises.resolveMx(domain);
    ok = Array.isArray(mx) && mx.length > 0;
  } catch { ok = false; }
  if (!ok) {
    // Fallback: część domen przyjmuje pocztę przez rekord A (implicit MX).
    try { const a = await dns.promises.resolve(domain); ok = Array.isArray(a) && a.length > 0; }
    catch { ok = false; }
  }
  mxCache.set(domain, ok);
  await sleep(DNS_DELAY_MS);   // nie bombardujemy resolvera
  return ok;
}

// ── CSV helper ───────────────────────────────────────────────────────────────
const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// ── main ─────────────────────────────────────────────────────────────────────
(async () => {
  log(`tryb: ${APPLY ? 'APPLY (zapis email_check)' : 'RAPORT (bez zapisu)'}${LIMIT ? `, limit ${LIMIT}` : ''}`);
  await ensureResolver();
  const rows = await sql(
    `SELECT id, company_name, email FROM public.wfp_prospects
     WHERE email IS NOT NULL AND email <> ''
     ORDER BY created_at${LIMIT ? ` LIMIT ${LIMIT}` : ''};`,
  );
  if (!Array.isArray(rows) || !rows.length) { log('brak prospektów z e-mailem — koniec.'); return; }
  log(`prospektów z e-mailem: ${rows.length}. Sprawdzam składnię, literówki, MX…`);

  const counts = { ok: 0, typo: 0, no_mx: 0, bad: 0 };
  const problems = [];             // wiersze do CSV (tylko bad/typo/no_mx)
  const byVerdict = { ok: [], typo: [], no_mx: [], bad: [] };
  const uniqueDomains = new Set();
  let done = 0;

  for (const r of rows) {
    const email = String(r.email || '').trim().toLowerCase();
    let verdict, sugestia = '';

    if (!EMAIL_RE.test(email)) {
      verdict = 'bad';
      sugestia = 'popraw ręcznie / usuń — składnia niepoprawna';
    } else {
      const domain = email.split('@')[1];
      uniqueDomains.add(domain);
      const fixed = detectTypo(domain);
      if (fixed) {
        verdict = 'typo';
        sugestia = `${email.split('@')[0]}@${fixed}`;
      } else {
        const mail = await hasMail(domain);
        if (!mail) { verdict = 'no_mx'; sugestia = 'brak MX/A — zweryfikuj domenę lub usuń'; }
        else verdict = 'ok';
      }
    }

    counts[verdict]++;
    byVerdict[verdict].push(r.id);
    if (verdict !== 'ok') problems.push({ email: r.email, problem: verdict, sugestia, firma: r.company_name });

    done++;
    if (done % 100 === 0) log(`  …${done}/${rows.length} (ok:${counts.ok} typo:${counts.typo} no_mx:${counts.no_mx} bad:${counts.bad})`);
  }

  // ── CSV ──
  try {
    mkdirSync(dirname(CSV_PATH), { recursive: true });
    const header = 'email,problem,sugestia,firma';
    const lines = problems.map((p) => [p.email, p.problem, p.sugestia, p.firma].map(csvCell).join(','));
    writeFileSync(CSV_PATH, '﻿' + [header, ...lines].join('\r\n') + '\r\n', 'utf8');
    log(`CSV z problemami (${problems.length} wierszy): ${CSV_PATH}`);
  } catch (e) { log(`! nie udało się zapisać CSV: ${e.message}`); }

  // ── raport stdout ──
  console.log('\n════════════════ RAPORT HIGIENY E-MAILI ════════════════');
  console.log(`  prospektów z e-mailem : ${rows.length}`);
  console.log(`  unikalnych domen      : ${uniqueDomains.size}`);
  console.log(`  ── werdykty ──`);
  console.log(`  ok    (składnia+MX)   : ${counts.ok}`);
  console.log(`  typo  (literówka)     : ${counts.typo}`);
  console.log(`  no_mx (brak poczty)   : ${counts.no_mx}`);
  console.log(`  bad   (zła składnia)  : ${counts.bad}`);
  const bad = counts.typo + counts.no_mx + counts.bad;
  console.log(`  ── RAZEM do naprawy   : ${bad} (${((bad / rows.length) * 100).toFixed(1)}%) ──`);
  console.log('═════════════════════════════════════════════════════════\n');

  // Podgląd kilku literówek (bez wypisywania całości — CSV ma resztę).
  if (problems.length) {
    console.log('Przykłady (pierwsze 15):');
    for (const p of problems.slice(0, 15)) console.log(`  [${p.problem}] ${p.email}${p.sugestia ? `  →  ${p.sugestia}` : ''}`);
    console.log('');
  }

  // ── APPLY (opcjonalny zapis) ──
  if (!APPLY) { log('tryb raportowy — nic nie zapisano (użyj --apply, by ustawić wfp_prospects.email_check).'); return; }

  log('APPLY: zapisuję email_check…');
  const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };
  let updated = 0;
  for (const verdict of ['ok', 'typo', 'no_mx', 'bad']) {
    const ids = byVerdict[verdict];
    if (!ids.length) continue;
    for (const part of chunk(ids, 500)) {
      const inList = part.map((id) => `'${String(id).replace(/'/g, "''")}'`).join(',');
      await sql(`UPDATE public.wfp_prospects SET email_check = '${verdict}' WHERE id IN (${inList});`);
      updated += part.length;
    }
    log(`  ${verdict}: ${ids.length}`);
  }
  log(`APPLY gotowe — zaktualizowano ${updated} rekordów.`);
})();
