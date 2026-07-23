#!/usr/bin/env node
// apply-wf2-feedback.mjs — aplikuje migrację modułu „Uwagi klienta" (wf2_feedback)
// przez Supabase Management API (POST /v1/projects/<ref>/database/query).
// Wzorzec 1:1 z apply-wf2-portal-migration.mjs (db push wybucha na historii CLI).
//
// Aplikuje (idempotentnie): 20260723f_wf2_feedback.sql
//   • tabele wf2_feedback_messages + wf2_feedback (RLS team_members, ZERO anon)
//   • bucket storage wf2-feedback-shots (private)
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential Manager
// (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wf2-feedback.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wf2-feedback] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wf2-feedback] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260723f_wf2_feedback.sql'), 'utf8');
  log('Aplikuję 20260723f_wf2_feedback.sql …');
  await sql(mig);
  log('  ✓ 20260723f zastosowana');

  // ── weryfikacja ────────────────────────────────────────────────────────────
  const tbls = await sql(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_name IN ('wf2_feedback','wf2_feedback_messages')
      ORDER BY table_name`);
  const idx = await sql(
    `SELECT indexname FROM pg_indexes WHERE schemaname='public'
        AND indexname IN ('wf2_feedback_project_status_idx','wf2_feedback_project_new_idx','wf2_feedback_messages_project_idx')
      ORDER BY indexname`);
  const pol = await sql(
    `SELECT tablename, policyname FROM pg_policies WHERE schemaname='public'
        AND tablename IN ('wf2_feedback','wf2_feedback_messages') ORDER BY tablename`);
  const buck = await sql(
    `SELECT id, public, file_size_limit FROM storage.buckets WHERE id='wf2-feedback-shots'`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('tabele:', tbls.map((t) => t.table_name).join(', ') || '(BRAK!)');
  console.log('indeksy:', idx.map((i) => i.indexname).join(', ') || '(BRAK!)');
  console.log('polityki RLS:', pol.map((p) => `${p.tablename}.${p.policyname}`).join(', ') || '(BRAK!)');
  console.log('bucket wf2-feedback-shots:', buck.length ? `public=${buck[0].public}, limit=${buck[0].file_size_limit}` : '(BRAK!)');
  log('gotowe.');
})();
