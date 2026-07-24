#!/usr/bin/env node
// apply-wf2p-pipeline.mjs — aplikuje 20260724c_wf2p_pipeline.sql przez Supabase
// Management API. Wzorzec: apply-wf2p.mjs. Idempotentne.
//
// Dokłada warstwę pipeline Prospektora B2B: pola kadencji/własności/zgody na
// wf2p_sellers, tabele wf2p_tasks / wf2p_outbox / wf2p_suppression, rozszerzenie
// statusu o 'odpowiedzial'+'nurture', seed stopki prawnej RODO.
//
// Uruchom: node scripts/apply-wf2p-pipeline.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const die = (m) => { console.error(`[apply-pipeline] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-pipeline] ${m}`);

function readTokenFromCredMan() {
  const ps = `$ErrorActionPreference='Stop'
$sig=@"
using System;using System.Runtime.InteropServices;
public class Cred{[DllImport("advapi32.dll",CharSet=CharSet.Unicode,SetLastError=true)]public static extern bool CredRead(string t,int y,int f,out IntPtr c);[DllImport("advapi32.dll")]public static extern void CredFree(IntPtr c);}
"@
Add-Type -TypeDefinition $sig
$ptr=[IntPtr]::Zero
if(-not [Cred]::CredRead("Supabase CLI:supabase",1,0,[ref]$ptr)){throw "fail"}
$size=[Runtime.InteropServices.Marshal]::ReadInt32($ptr,32)
$bp=[Runtime.InteropServices.Marshal]::ReadIntPtr($ptr,40)
$b=New-Object byte[] $size
[Runtime.InteropServices.Marshal]::Copy($bp,$b,0,$size)
[Cred]::CredFree($ptr)
[Console]::Out.Write([Text.Encoding]::UTF8.GetString($b))`;
  const enc = Buffer.from(ps, 'utf16le').toString('base64');
  return execFileSync('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

const argTok = (() => { const i = process.argv.indexOf('--token'); return i > -1 ? process.argv[i + 1] : null; })();
const TOKEN = argTok || process.env.SUPABASE_MGMT_TOKEN || (() => { try { return readTokenFromCredMan(); } catch { return null; } })();
if (!TOKEN || !TOKEN.startsWith('sbp_')) die('brak tokena Management API (sbp_*).');

async function sql(query) {
  const r = await fetch(MGMT_URL, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await r.text();
  if (r.status >= 300) die(`Management API ${r.status}: ${text.slice(0, 500)}`);
  try { return text.trim() ? JSON.parse(text) : []; } catch { die(`odpowiedź nie-JSON: ${text.slice(0, 300)}`); }
}

(async () => {
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260724c_wf2p_pipeline.sql'), 'utf8');
  log('Aplikuję 20260724c_wf2p_pipeline.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  const tables = await sql(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_name IN ('wf2p_tasks','wf2p_outbox','wf2p_suppression') ORDER BY table_name`);
  const cols = await sql(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='wf2p_sellers'
        AND column_name IN ('owner_mode','cadence_state','next_action_at','locked_until','consent','channels_tried')
      ORDER BY column_name`);
  const statusChk = await sql(
    `SELECT pg_get_constraintdef(oid) def FROM pg_constraint WHERE conname='wf2p_sellers_status_check'`);
  const rls = await sql(
    `SELECT tablename, count(*) c FROM pg_policies
      WHERE tablename IN ('wf2p_tasks','wf2p_outbox','wf2p_suppression') GROUP BY tablename ORDER BY tablename`);
  const stopka = await sql(`SELECT length(value) len FROM public.settings WHERE key='wf2p_stopka_prawna'`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('nowe tabele:', JSON.stringify(tables.map(t => t.table_name)));
  console.log('nowe kolumny sellers:', JSON.stringify(cols.map(c => c.column_name)));
  console.log('status CHECK:', statusChk[0]?.def || '—');
  console.log('RLS:', JSON.stringify(rls));
  console.log('stopka_prawna len:', JSON.stringify(stopka[0]));
  if (tables.length < 3) die('brak którejś nowej tabeli');
  if (cols.length < 6) die('brak którejś nowej kolumny na wf2p_sellers');
  if (!/odpowiedzial/.test(statusChk[0]?.def || '')) die('status CHECK nie rozszerzony o odpowiedzial');
  if (rls.length < 3) die('brak RLS na którejś tabeli');
  log('gotowe.');
})();
