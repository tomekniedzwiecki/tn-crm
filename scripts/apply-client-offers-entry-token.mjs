#!/usr/bin/env node
// apply-client-offers-entry-token.mjs — aplikuje 20260723d_client_offers_entry_token.sql
// przez Supabase Management API (wzorzec: apply-wf2-ceny3.mjs; db push wybucha na
// rozjechanej historii CLI). Token: --token > env SUPABASE_MGMT_TOKEN > Credential
// Manager („Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-client-offers-entry-token.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-entry-token] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-entry-token] ${m}`);

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
  die('brak tokena Management API (sbp_*). Podaj --token, env SUPABASE_MGMT_TOKEN albo zaloguj Supabase CLI.');
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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260723d_client_offers_entry_token.sql'), 'utf8');
  log('Aplikuję 20260723d_client_offers_entry_token.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  const cols = await sql(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='client_offers'
        AND column_name IN ('entry_token','entry_token_used_at')
      ORDER BY column_name`);
  console.log('\n=== WERYFIKACJA ===');
  console.log('kolumny client_offers (2 oczekiwane):', cols.map(r => r.column_name).join(', ') || 'BRAK!');
  if (cols.length !== 2) die(`client_offers ma ${cols.length}/2 nowych kolumn`);
  log('OK — migracja kompletna.');
})();
