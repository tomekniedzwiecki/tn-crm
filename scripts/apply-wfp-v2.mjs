#!/usr/bin/env node
// apply-wfp-v2.mjs — aplikuje 20260723a_wfp_v2.sql przez Supabase Management API
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
// Uruchom: node scripts/apply-wfp-v2.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wfp-v2] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wfp-v2] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260723a_wfp_v2.sql'), 'utf8');
  log('Aplikuję 20260723a_wfp_v2.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // ── weryfikacja ────────────────────────────────────────────────────────────
  const verts = await sql(
    `SELECT count(*) c,
            count(*) FILTER (WHERE status='odrzucony')  odrzucone,
            count(*) FILTER (WHERE status='katalogowy') katalogowe
       FROM public.wfp_verticals`);
  const statusDist = await sql(
    `SELECT status, count(*) c FROM public.wfp_verticals GROUP BY status ORDER BY status`);
  const dupNames = await sql(
    `SELECT name, count(*) c FROM public.wfp_verticals GROUP BY name HAVING count(*) > 1`);
  const cols = await sql(
    `SELECT table_name, count(*) c FROM information_schema.columns
      WHERE table_schema='public' AND table_name IN ('wfp_inbox','wfp_outbox')
      GROUP BY table_name ORDER BY table_name`);
  const rls = await sql(
    `SELECT tablename, count(*) c FROM pg_policies
      WHERE tablename IN ('wfp_inbox','wfp_outbox') GROUP BY tablename ORDER BY tablename`);
  const usageChk = await sql(
    `SELECT pg_get_constraintdef(oid) def FROM pg_constraint WHERE conname='wfp_usage_kind_check'`);
  const setts = await sql(
    `SELECT key, length(value) len FROM public.settings
      WHERE key IN ('wfp_from_email','wfp_from_name','wfp_send_daily_cap',
                    'wfp_prompt_reply','wfp_prompt_vertical','wfp_prompt_classify')
      ORDER BY key`);
  const fromEmail = await sql(`SELECT value FROM public.settings WHERE key='wfp_from_email'`);
  const kpi = await sql(`SELECT public.wfp_kpi() AS kpi`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('wertykale (łącznie/odrzucone/katalogowe):', JSON.stringify(verts[0]));
  console.log('rozkład statusów:', JSON.stringify(statusDist));
  console.log('duplikaty nazw:', dupNames.length ? JSON.stringify(dupNames) : 'BRAK ✓');
  console.log('kolumny wfp_inbox/outbox:', JSON.stringify(cols));
  console.log('polityki RLS wfp_inbox/outbox:', JSON.stringify(rls));
  console.log('wfp_usage.kind CHECK:', JSON.stringify(usageChk[0]?.def || '(BRAK!)'));
  console.log('settings v2:', JSON.stringify(setts));
  console.log('wfp_from_email:', JSON.stringify(fromEmail[0]?.value || '(BRAK)'));
  const kpiObj = kpi[0]?.kpi || {};
  console.log('wfp_kpi() klucze:', JSON.stringify(Object.keys(kpiObj)));
  console.log('  sent_today:', kpiObj.sent_today, '| inbox_unhandled:', kpiObj.inbox_unhandled);

  // ── asercje ─────────────────────────────────────────────────────────────────
  const totalV = Number(verts[0]?.c || 0);
  if (totalV < 90) die(`za mało wertykali (${totalV}, oczekiwane ~90+)`);
  if (dupNames.length) die(`duplikaty nazw wertykali: ${JSON.stringify(dupNames)}`);
  if (cols.length < 2) die('brak którejś tabeli wfp_inbox/wfp_outbox');
  if (!cols.every((r) => Number(r.c) >= 8)) die('wfp_inbox/outbox mają za mało kolumn');
  if (rls.length < 2) die('brak polityk RLS na wfp_inbox/wfp_outbox');
  const usageDef = usageChk[0]?.def || '';
  for (const k of ['reply', 'vertical', 'classify']) {
    if (!usageDef.includes(k)) die(`wfp_usage.kind CHECK bez '${k}'`);
  }
  for (const need of ['wfp_from_email', 'wfp_from_name', 'wfp_send_daily_cap', 'wfp_prompt_reply', 'wfp_prompt_vertical', 'wfp_prompt_classify']) {
    if (!setts.find((s) => s.key === need)) die(`brak settings.${need}`);
  }
  if (!('sent_today' in kpiObj)) die('wfp_kpi() bez klucza sent_today');
  if (!('inbox_unhandled' in kpiObj)) die('wfp_kpi() bez klucza inbox_unhandled');

  log('gotowe — wszystkie asercje OK.');
})();
