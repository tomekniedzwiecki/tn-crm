#!/usr/bin/env node
// apply-spar-wniosek.mjs — aplikuje 20260722c_spar_wniosek.sql (dwustopniowy filtr
// rezerwacji lejka Aplikacja) przez Supabase Management API. Wzorzec: apply-wf2-ceny32.mjs.
// Token: --token > env SUPABASE_MGMT_TOKEN > Credential Manager „Supabase CLI:supabase".
// Uruchom: node scripts/apply-spar-wniosek.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-spar-wniosek] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-spar-wniosek] ${m}`);

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
  const out = execFileSync('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return out.trim();
}

const argTok = (() => { const i = process.argv.indexOf('--token'); return i > -1 ? process.argv[i + 1] : null; })();
const TOKEN = argTok || process.env.SUPABASE_MGMT_TOKEN || (() => {
  try { return readTokenFromCredMan(); } catch { return null; }
})();
if (!TOKEN || !TOKEN.startsWith('sbp_')) {
  die('brak tokena Management API (sbp_*).');
}

async function sql(query) {
  const r = await fetch(MGMT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await r.text();
  if (r.status >= 300) die(`Management API ${r.status}: ${text.slice(0, 800)}`);
  try { return text.trim() ? JSON.parse(text) : []; }
  catch { die(`odpowiedź nie-JSON: ${text.slice(0, 300)}`); }
}

(async () => {
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260722c_spar_wniosek.sql'), 'utf8');
  log('Aplikuję 20260722c_spar_wniosek.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  const cols = await sql(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='spar_sessions'
        AND column_name IN ('wniosek_at','wniosek_status','wniosek_decided_at','wniosek_auto')
      ORDER BY column_name`);
  const grants = await sql(
    `SELECT column_name FROM information_schema.column_privileges
      WHERE table_name='spar_sessions' AND grantee='authenticated' AND privilege_type='UPDATE'
        AND column_name IN ('wniosek_status','wniosek_decided_at')`);
  log(`kolumny: ${cols.map((c) => c.column_name).join(', ')} (oczekiwane 4)`);
  log(`granty UPDATE authenticated: ${grants.map((c) => c.column_name).join(', ')} (oczekiwane 2)`);
  if (cols.length !== 4 || grants.length !== 2) die('weryfikacja nie przeszła');
  log('OK');
})();
