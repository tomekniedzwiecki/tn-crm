#!/usr/bin/env node
// apply-wf2-ads-guide.mjs — aplikuje 20260722r_wf2_ads_guide.sql (PRZEWODNIK AI konfiguracji
// reklam Meta: tabela wf2_guide_messages + RLS team_members + prywatny bucket wf2-guide-shots +
// settings.wf2_ads_guide_enabled) przez Supabase Management API (POST /database/query).
// Wzorzec 1:1: apply-wf2-konto-dedykowane-instr.mjs. Token: --token > env SUPABASE_MGMT_TOKEN
// > Windows Credential Manager (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wf2-ads-guide.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wf2-ads-guide] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wf2-ads-guide] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260722r_wf2_ads_guide.sql'), 'utf8');
  log('Aplikuję 20260722r_wf2_ads_guide.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // Weryfikacja odczytem: tabela, bucket i klucz kill-switcha istnieją.
  const t = await sql(`SELECT to_regclass('public.wf2_guide_messages') AS tbl`);
  if (!Array.isArray(t) || !t[0] || !t[0].tbl) die('tabela wf2_guide_messages NIE istnieje po migracji');
  log('  ✓ tabela wf2_guide_messages');

  const b = await sql(`SELECT id, public, file_size_limit FROM storage.buckets WHERE id='wf2-guide-shots'`);
  if (!Array.isArray(b) || !b[0]) die('bucket wf2-guide-shots NIE istnieje');
  if (b[0].public !== false) die('bucket wf2-guide-shots NIE jest prywatny!');
  log(`  ✓ bucket wf2-guide-shots (private, limit ${b[0].file_size_limit} B)`);

  const s = await sql(`SELECT value FROM public.settings WHERE key='wf2_ads_guide_enabled'`);
  if (!Array.isArray(s) || !s[0]) die('settings.wf2_ads_guide_enabled NIE istnieje');
  log(`  ✓ settings.wf2_ads_guide_enabled = ${s[0].value}`);

  const pol = await sql(`SELECT polname FROM pg_policy WHERE polname='wf2_guide_messages_team_all'`);
  if (!Array.isArray(pol) || !pol[0]) die('polityka RLS wf2_guide_messages_team_all NIE istnieje');
  log('  ✓ RLS team_members (wf2_guide_messages_team_all)');

  log('gotowe — przewodnik AI: tabela + bucket prywatny + kill-switch + RLS zespołu.');
})();
