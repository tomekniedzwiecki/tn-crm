#!/usr/bin/env node
// apply-spar-inspiracje-consent.mjs — aplikuje 20260723f_spar_inspiracje_consent.sql
// (ZGODA NA PUBLIKACJĘ W INSPIRACJACH) przez Supabase Management API
// (POST /v1/projects/<ref>/database/query). Wzorzec: apply-wf2-work-consent.mjs.
//
// Zakres migracji: kolumny inspiracje_consent_* na spar_sessions + CHECK na źródło.
// BEZ zmian RLS (zgodę zapisuje edge service-role; anon nic nie pisze).
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential
// Manager (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-spar-inspiracje-consent.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-spar-inspiracje-consent] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-spar-inspiracje-consent] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260723f_spar_inspiracje_consent.sql'), 'utf8');
  log('Aplikuję 20260723f_spar_inspiracje_consent.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // ── weryfikacja ────────────────────────────────────────────────────────────
  const cols = await sql(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='spar_sessions'
        AND column_name IN ('inspiracje_consent_at','inspiracje_consent_version',
                            'inspiracje_consent_text','inspiracje_consent_source',
                            'inspiracje_consent_revoked_at')
      ORDER BY column_name`);
  const chk = await sql(
    `SELECT conname FROM pg_constraint WHERE conname='spar_sessions_inspiracje_consent_source_chk'`);
  const withConsent = await sql(
    `SELECT COUNT(*)::int c FROM spar_sessions WHERE inspiracje_consent_at IS NOT NULL AND inspiracje_consent_revoked_at IS NULL`);
  // Nie może powstać żadna NOWA polityka anon na spar_sessions
  const anonPol = await sql(
    `SELECT polname FROM pg_policy WHERE polrelid='public.spar_sessions'::regclass
      AND 'anon' = ANY(SELECT rolname FROM pg_roles WHERE oid = ANY(polroles))`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('kolumny (5 oczekiwanych):', cols.map((r) => r.column_name).join(', '));
  console.log('CHECK źródła zgody:', chk[0]?.conname ? 'ISTNIEJE' : 'BRAK!');
  console.log('sesje z ważną zgodą (at NOT NULL, revoked NULL):', withConsent[0]?.c);
  console.log('polityki anon na spar_sessions (musi być 0):', anonPol.length);

  if (cols.length !== 5) die(`spar_sessions ma ${cols.length}/5 nowych kolumn`);
  if (!chk[0]?.conname) die('CHECK źródła zgody NIE powstał');
  if (anonPol.length !== 0) die('POWSTAŁA polityka anon na spar_sessions — przerwij!');
  log('gotowe — wszystko zweryfikowane.');
})();
