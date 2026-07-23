#!/usr/bin/env node
// apply-wfp-v3.mjs — aplikuje 20260723b_wfp_v3_kolejnosc.sql przez Supabase Management API
// (POST /v1/projects/<ref>/database/query). Wzorzec: apply-wfp-prospektor.mjs
// (db push wybucha na rozjechanej historii CLI).
//
// Prospektor v2: wfp_outbox + wfp_inbox (RLS team), rozszerzenie wfp_verticals
// (category/pain/wedge_hint/priority/persona/report/verdict/vscore + nowe statusy),
// seed ~101 wertykali z PROSPEKTOR-WERTYKALE.md, wfp_usage.kind += reply/vertical/classify,
// settings v2 (from_email/from_name/send_daily_cap + prompty reply/vertical/classify),
// wfp_kpi() += sent_today + inbox_unhandled. Idempotentne.
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential
// Manager (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wfp-v3.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wfp-v3] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wfp-v3] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260723b_wfp_v3_kolejnosc.sql'), 'utf8');
  log('Aplikuję 20260723b_wfp_v3_kolejnosc.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // ── weryfikacja ──
  const st=await sql("SELECT status, count(*) c FROM public.wfp_verticals GROUP BY status ORDER BY status");
  const col=await sql("SELECT column_name FROM information_schema.columns WHERE table_name='wfp_verticals' AND column_name='wave'");
  const pr=await sql("SELECT length(value) len FROM public.settings WHERE key='wfp_prompt_vertical'");
  const bk=await sql("SELECT 1 FROM public.settings WHERE key='wfp_prompt_vertical_backup_20260723'");
  console.log('statusy:', JSON.stringify(st));
  console.log('kolumna wave:', col.length?'JEST':'BRAK');
  console.log('prompt vertical len:', JSON.stringify(pr));
  console.log('backup prompta:', bk.length?'JEST':'BRAK');
  if(!col.length) die('brak kolumny wave');
  if(st.find(x=>x.status==='odrzucony')) die('nadal sa odrzucone');
  log('gotowe.');
})();