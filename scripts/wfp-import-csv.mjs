#!/usr/bin/env node
// wfp-import-csv.mjs — import CSV prospektów do wfp_prospects przez Supabase Management API.
// Format wejścia = format wklejki panelu: nazwa;www;email;nip;miasto;wertykal (nagłówek
// opcjonalny, separator ; lub tab). Dedup robi baza (unikalne indeksy nip/email/www +
// ON CONFLICT DO NOTHING). Rekordy bez e-maila I bez www są pomijane (pipeline hygiene) —
// wyłączenie flagą --allow-empty-contact.
//
// Użycie: node scripts/wfp-import-csv.mjs --file c:\tmp\prospektor\fala1-ddd.csv --source pspddd
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential Manager
// (target „Supabase CLI:supabase"). Sekret NIGDY w output.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[wfp-import] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[wfp-import] ${m}`);
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const flag = (name) => process.argv.includes(name);

const FILE = arg('--file') || die('podaj --file <ścieżka CSV>');
const SOURCE = arg('--source') || 'csv';
const ALLOW_EMPTY = flag('--allow-empty-contact');

// ── token (wzorzec apply-wfp-*.mjs) ─────────────────────────────────────────
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

// ── parsowanie CSV (format wklejki panelu) ──────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const normWww = (w) => (w || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
const q = (s) => s === null || s === undefined || s === '' ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`;

const raw = readFileSync(FILE, 'utf8').replace(/^﻿/, '');
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
const looksHeader = /(nazwa|firma|email|e-mail|www|nip|miasto|wertykal)/i.test(lines[0]) && /;|\t/.test(lines[0]);
const dataLines = looksHeader ? lines.slice(1) : lines;

const rows = []; let skippedNoContact = 0, skippedBad = 0;
for (const line of dataLines) {
  const c = line.split(/\t|;/).map(x => x.trim());
  const [nazwa, www, email, nip, miasto, wert] = [c[0] || '', normWww(c[1]), (c[2] || '').toLowerCase(), (c[3] || '').replace(/\D/g, ''), c[4] || '', c[5] || ''];
  if (!nazwa) { skippedBad++; continue; }
  if (email && !EMAIL_RE.test(email)) { skippedBad++; console.warn(`  ! zły e-mail, pomijam: ${nazwa} <${email}>`); continue; }
  if (nip && nip.length !== 10) { skippedBad++; console.warn(`  ! zły NIP, pomijam: ${nazwa}`); continue; }
  if (!email && !www && !ALLOW_EMPTY) { skippedNoContact++; continue; }
  rows.push({ nazwa, www: www || null, email: email || null, nip: nip || null, miasto: miasto || null, wert });
}
if (!rows.length) die('brak wierszy do importu po filtrach');

const verts = [...new Set(rows.map(r => r.wert).filter(Boolean))];
log(`plik: ${FILE} — wierszy danych: ${dataLines.length}, do importu: ${rows.length}, bez kontaktu (pominięte): ${skippedNoContact}, błędne: ${skippedBad}`);
log(`wertykale w pliku: ${verts.join(', ') || '(brak — vertical_id NULL)'} · source='${SOURCE}'`);

(async () => {
  const before = await sql('SELECT count(*) c FROM public.wfp_prospects');
  const values = rows.map(r =>
    `(${q(r.nazwa)}, ${q(r.www)}, ${q(r.email)}, ${q(r.nip)}, ${q(r.miasto)}, ` +
    `(SELECT id FROM public.wfp_verticals WHERE key = ${q(r.wert)}), ${q(SOURCE)})`
  ).join(',\n');
  await sql(`INSERT INTO public.wfp_prospects (company_name, www, email, nip, city, vertical_id, source)\nVALUES\n${values}\nON CONFLICT DO NOTHING;`);
  const after = await sql('SELECT count(*) c FROM public.wfp_prospects');
  const bySrc = await sql(`SELECT count(*) c FROM public.wfp_prospects WHERE source = ${q(SOURCE)}`);
  const inserted = Number(after[0].c) - Number(before[0].c);
  log(`wstawiono: ${inserted} (duplikaty odrzucone przez ON CONFLICT: ${rows.length - inserted})`);
  log(`w bazie łącznie: ${after[0].c}, z source='${SOURCE}': ${bySrc[0].c}`);
  log('gotowe.');
})();
