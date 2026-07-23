#!/usr/bin/env node
// apply-wfp-v3-seed.mjs — aplikuje 20260723c_wfp_v3_seed_fal.sql przez Supabase Management API
// (POST /v1/projects/<ref>/database/query). Wzorzec: apply-wfp-v3.mjs.
//
// Prospektor v3 seed: 38 nowych nisz (research GPT 23.07) + plan fal prospectingu
// (wave 1 = 6 wertykali start VIII-IX, wave 2 = 9, wave 3 = reszta P3-P5, NULL = P1-P2).
// Idempotentne (ON CONFLICT DO NOTHING + UPDATE po key).
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential
// Manager (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wfp-v3-seed.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wfp-v3-seed] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wfp-v3-seed] ${m}`);

// ── token Management API (Credential Manager blob UTF-8) ────────────────────
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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260723c_wfp_v3_seed_fal.sql'), 'utf8');
  log('Aplikuję 20260723c_wfp_v3_seed_fal.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // ── weryfikacja ──
  const tot = await sql('SELECT count(*) c FROM public.wfp_verticals');
  const wv = await sql('SELECT COALESCE(wave::text,\'NULL\') wave, count(*) c FROM public.wfp_verticals GROUP BY wave ORDER BY wave');
  const w1 = await sql('SELECT key FROM public.wfp_verticals WHERE wave=1 ORDER BY key');
  const cats = await sql('SELECT category, count(*) c FROM public.wfp_verticals GROUP BY category ORDER BY category');
  const ppoz = await sql("SELECT status, wave, verdict FROM public.wfp_verticals WHERE key='firmy-ppoz'");
  console.log('wertykali razem:', JSON.stringify(tot));
  console.log('fale:', JSON.stringify(wv));
  console.log('fala 1:', w1.map(x => x.key).join(', '));
  console.log('kategorie:', JSON.stringify(cats));
  console.log('firmy-ppoz:', JSON.stringify(ppoz));
  if (!tot.length || Number(tot[0].c) < 138) die(`za mało wertykali (${tot[0]?.c}) — seed nie wszedł?`);
  if (w1.length !== 6) die(`fala 1 ma ${w1.length} wertykali, oczekiwano 6`);
  log('gotowe.');
})();
