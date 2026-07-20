#!/usr/bin/env node
// apply-wf2-portal-migration.mjs — aplikuje migracje portalu WF2 przez Supabase
// Management API (POST /v1/projects/<ref>/database/query). `npx supabase db push`
// wybucha na rozjechanej historii CLI (MCP padał 19.07), więc jedziemy SQL-em wprost.
//
// Aplikuje (idempotentnie):
//   • 20260720c_wf2_portal.sql   — kolumny wf2_projects + krok pl_konto_klient
//   • 20260719k_wf2_parasol_unikat.sql — UNIQUE lower(name) (NIE zaaplikowana 19.07,
//     MCP padł mid-session) — tylko jeśli indeks jeszcze nie istnieje i brak duplikatów.
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential Manager
// (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wf2-portal-migration.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wf2-portal] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wf2-portal] ${m}`);

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
  // ── 20260720c ─────────────────────────────────────────────────────────────
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260720c_wf2_portal.sql'), 'utf8');
  log('Aplikuję 20260720c_wf2_portal.sql …');
  await sql(mig);
  log('  ✓ 20260720c zastosowana');

  // ── 20260719k (parasol unikat) — tylko jeśli brak indeksu i brak duplikatów ──
  const idxRows = await sql(
    `SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='wf2_projects_name_unique'`);
  if (idxRows.length) {
    log('20260719k: indeks wf2_projects_name_unique JUŻ istnieje — pomijam.');
  } else {
    const dups = await sql(
      `SELECT lower(name) AS n, count(*) c FROM public.wf2_projects
        WHERE name <> '' GROUP BY lower(name) HAVING count(*) > 1`);
    if (dups.length) {
      log(`⚠ 20260719k POMINIĘTA — duplikaty lower(name): ${dups.map((d) => `${d.n}(${d.c})`).join(', ')}. Rozwiąż ręcznie.`);
    } else {
      log('Aplikuję 20260719k_wf2_parasol_unikat.sql (nie była zaaplikowana) …');
      await sql(readFileSync(join(ROOT, 'supabase', 'migrations', '20260719k_wf2_parasol_unikat.sql'), 'utf8'));
      log('  ✓ 20260719k zastosowana');
    }
  }

  // ── weryfikacja ────────────────────────────────────────────────────────────
  const cols = await sql(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='wf2_projects'
        AND column_name IN ('access_mail_sent_at','platform_account_email') ORDER BY column_name`);
  const step = await sql(
    `SELECT key, stage, sort, owner, scope, label FROM public.wf2_step_defs WHERE key='pl_konto_klient'`);
  const idx2 = await sql(
    `SELECT indexname FROM pg_indexes WHERE schemaname='public' AND indexname='wf2_projects_name_unique'`);
  const inst = await sql(
    `SELECT count(*) c FROM public.wf2_steps WHERE step_key='pl_konto_klient'`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('kolumny wf2_projects:', cols.map((c) => c.column_name).join(', ') || '(BRAK!)');
  console.log('krok pl_konto_klient:', JSON.stringify(step[0] || null));
  console.log('instancje pl_konto_klient (wf2_steps):', inst[0]?.c);
  console.log('indeks wf2_projects_name_unique:', idx2.length ? 'ISTNIEJE' : 'BRAK');
  log('gotowe.');
})();
