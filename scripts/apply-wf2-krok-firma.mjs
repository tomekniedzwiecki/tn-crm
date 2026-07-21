#!/usr/bin/env node
// apply-wf2-krok-firma.mjs — aplikuje 20260722e_wf2_krok_firma.sql (krok kliencki
// „Twoja firma") przez Supabase Management API. Wzorzec: apply-wf2-portal-migration.mjs.
// Token: --token > env SUPABASE_MGMT_TOKEN > Credential Manager („Supabase CLI:supabase").
// Uruchom: node scripts/apply-wf2-krok-firma.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wf2-krok-firma] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wf2-krok-firma] ${m}`);

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
  if (r.status >= 300) die(`Management API ${r.status}: ${text.slice(0, 500)}`);
  try { return text.trim() ? JSON.parse(text) : []; }
  catch { die(`odpowiedź nie-JSON: ${text.slice(0, 300)}`); }
}

(async () => {
  for (const f of ['20260722e_wf2_krok_firma.sql', '20260722f_wf2_firma_po_kampaniach.sql']) {
    const mig = readFileSync(join(ROOT, 'supabase', 'migrations', f), 'utf8');
    log(`Aplikuję ${f} …`);
    await sql(mig);
    log('  ✓ zastosowana');
  }

  const step = await sql(
    `SELECT key, stage, stage_label, sort, owner, scope, milestone_label, active
       FROM public.wf2_step_defs WHERE key='firma'`);
  const inst = await sql(`SELECT count(*) c FROM public.wf2_steps WHERE step_key='firma'`);
  const neigh = await sql(
    `SELECT key, sort, owner FROM public.wf2_step_defs WHERE stage=4 AND active ORDER BY sort LIMIT 8`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('krok firma:', JSON.stringify(step[0] || null));
  console.log('instancje firma (wf2_steps):', inst[0]?.c);
  console.log('sąsiedzi Etapu 3:', neigh.map((n) => `${n.key}(${n.sort},${n.owner})`).join(' '));
  log('gotowe.');
})();
