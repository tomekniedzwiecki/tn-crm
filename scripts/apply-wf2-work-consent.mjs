#!/usr/bin/env node
// apply-wf2-work-consent.mjs — aplikuje 20260722c_wf2_work_consent.sql (BRAMKA ZGODY
// KONSUMENCKIEJ) przez Supabase Management API (POST /v1/projects/<ref>/database/query).
// Wzorzec: apply-wf2-ceny3.mjs (db push wybucha na rozjechanej historii CLI).
//
// Zakres migracji: kolumny work_consent_* + customer_nip/customer_company na wf2_projects,
// CHECK na work_consent_source, backfill 1 (grandfathering prac w toku), backfill 2
// (NIP/firma z orders po reservation_order_id).
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential
// Manager (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wf2-work-consent.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wf2-work-consent] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wf2-work-consent] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260722c_wf2_work_consent.sql'), 'utf8');
  log('Aplikuję 20260722c_wf2_work_consent.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // ── weryfikacja ────────────────────────────────────────────────────────────
  const cols = await sql(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='wf2_projects'
        AND column_name IN ('work_consent_at','work_consent_version','work_consent_text',
                            'work_consent_source','customer_nip','customer_company')
      ORDER BY column_name`);
  const chk = await sql(
    `SELECT conname FROM pg_constraint WHERE conname='wf2_projects_work_consent_source_chk'`);
  const grand = await sql(
    `SELECT COUNT(*)::int c FROM wf2_projects WHERE work_consent_source='pre-regulamin'`);
  const withConsent = await sql(
    `SELECT COUNT(*)::int c FROM wf2_projects WHERE work_consent_at IS NOT NULL`);
  const nipBackfill = await sql(
    `SELECT COUNT(*)::int c FROM wf2_projects WHERE customer_nip IS NOT NULL OR customer_company IS NOT NULL`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('kolumny (6 oczekiwanych):', cols.map((r) => r.column_name).join(', '));
  console.log('CHECK work_consent_source:', chk[0]?.conname ? 'ISTNIEJE' : 'BRAK!');
  console.log('grandfathered (pre-regulamin):', grand[0]?.c);
  console.log('projekty z work_consent_at:', withConsent[0]?.c);
  console.log('projekty z NIP/firmą:', nipBackfill[0]?.c);

  if (cols.length !== 6) die(`wf2_projects ma ${cols.length}/6 nowych kolumn`);
  if (!chk[0]?.conname) die('CHECK work_consent_source NIE powstał');
  log('gotowe — wszystko zweryfikowane.');
})();
