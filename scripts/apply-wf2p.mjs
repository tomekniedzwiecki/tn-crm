#!/usr/bin/env node
// apply-wf2p.mjs — aplikuje 20260724a_wf2p_prospektor.sql przez Supabase
// Management API (POST /v1/projects/<ref>/database/query). Wzorzec:
// apply-wfp-prospektor.mjs (db push wybucha na rozjechanej historii CLI).
//
// Tworzy moduł Prospektor B2B (sprzedawcy Allegro, workflow sklepów):
// wf2p_verticals, wf2p_sellers, wf2p_events, wf2p_usage, RPC wf2p_kpi(),
// rozszerzenie leads_lead_source_check o 'prospektor_b2b', seed wertykali
// (kategorie brandowalne) + settings (prompty, wagi scoringu, modele, cap).
// Idempotentne.
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential
// Manager (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wf2p.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wf2p] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wf2p] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260724a_wf2p_prospektor.sql'), 'utf8');
  log('Aplikuję 20260724a_wf2p_prospektor.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // ── weryfikacja ────────────────────────────────────────────────────────────
  const tables = await sql(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_name LIKE 'wf2p_%' ORDER BY table_name`);
  const rls = await sql(
    `SELECT tablename, count(*) c FROM pg_policies
      WHERE tablename LIKE 'wf2p_%' GROUP BY tablename ORDER BY tablename`);
  const kpi = await sql(`SELECT public.wf2p_kpi() AS kpi`);
  const verts = await sql(`SELECT count(*) c FROM public.wf2p_verticals`);
  const setts = await sql(
    `SELECT key, length(value) len FROM public.settings
      WHERE key IN ('wf2p_daily_cap','wf2p_scoring_weights','wf2p_models',
                    'wf2p_prompt_research','wf2p_prompt_pitch','wf2p_prompt_message') ORDER BY key`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('tabele wf2p_*:', JSON.stringify(tables.map(t => t.table_name)));
  console.log('polityki RLS:', JSON.stringify(rls));
  console.log('wf2p_kpi() działa:', kpi.length ? 'TAK' : 'NIE');
  console.log('wertykale:', JSON.stringify(verts[0]));
  console.log('settings:', JSON.stringify(setts));
  if (tables.length < 4) die('brak którejś tabeli wf2p_*');
  if (!setts.find(s => s.key === 'wf2p_prompt_message')) die('brak seedu promptów w settings');
  if (!setts.find(s => s.key === 'wf2p_scoring_weights')) die('brak wag scoringu w settings');
  log('gotowe.');
})();
