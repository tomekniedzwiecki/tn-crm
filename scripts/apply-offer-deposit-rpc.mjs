#!/usr/bin/env node
// apply-offer-deposit-rpc.mjs — aplikuje 20260723f_offer_deposit_paid_rpc.sql
// (RPC wykrywania opłaconej rezerwacji dla kart ofert /p/ i /o/) przez Supabase Management API.
// Token: --token > env SUPABASE_MGMT_TOKEN > Credential Manager „Supabase CLI:supabase".
// Uruchom: node scripts/apply-offer-deposit-rpc.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-offer-deposit-rpc] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-offer-deposit-rpc] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260723f_offer_deposit_paid_rpc.sql'), 'utf8');
  log('Aplikuję 20260723f_offer_deposit_paid_rpc.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  const fn = await sql(
    `SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
       FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname='public' AND p.proname='offer_deposit_paid'`);
  const grants = await sql(
    `SELECT grantee FROM information_schema.routine_privileges
      WHERE routine_schema='public' AND routine_name='offer_deposit_paid' AND privilege_type='EXECUTE'
      ORDER BY grantee`);
  log(`funkcja: ${fn.map((f) => `${f.proname}(${f.args})`).join(' | ') || 'BRAK'}`);
  log(`EXECUTE dla: ${grants.map((g) => g.grantee).join(', ') || 'nikt'}`);
  if (!fn.length) die('weryfikacja nie przeszła');
  if (!grants.some((g) => g.grantee === 'anon')) die('anon bez EXECUTE — karta oferty nie zadziała');
  log('OK');
})();
