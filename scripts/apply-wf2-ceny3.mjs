#!/usr/bin/env node
// apply-wf2-ceny3.mjs — aplikuje 20260721d_wf2_ceny3.sql (CENY 3.0) przez Supabase
// Management API (POST /v1/projects/<ref>/database/query). Wzorzec:
// apply-wf2-lifecycle.mjs (db push wybucha na rozjechanej historii CLI).
//
// Zakres migracji: wf2_engine_runs, kolumny autonomii/locków na wf2_products,
// run_id/proposal_id na wf2_price_events, expires_at + kind landing_republish na
// wf2_proposals, orders_unmapped_last/shipping_free_threshold na wf2_projects,
// widok wf2_product_daily, config v3.1 (backup + asercje), cron wf2-price-engine.
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential
// Manager (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wf2-ceny3.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wf2-ceny3] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wf2-ceny3] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260721d_wf2_ceny3.sql'), 'utf8');
  log('Aplikuję 20260721d_wf2_ceny3.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // ── weryfikacja ────────────────────────────────────────────────────────────
  const runsTbl = await sql(
    `SELECT COUNT(*)::int c FROM information_schema.tables
      WHERE table_schema='public' AND table_name='wf2_engine_runs'`);
  const prodCols = await sql(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='wf2_products'
        AND column_name IN ('pricing_autonomy','last_price_change_at','platform_apply_after',
                            'rollback_lock_until','target_snapshot','landing_price_contract','parent_product_id')
      ORDER BY column_name`);
  const view = await sql(
    `SELECT COUNT(*)::int c FROM information_schema.views
      WHERE table_schema='public' AND table_name='wf2_product_daily'`);
  const cfg = await sql(
    `SELECT (value::jsonb->>'config_version') ver,
            (value::jsonb->>'engine_enabled') enabled,
            (value::jsonb->>'dry_run') dry,
            (value::jsonb->>'contribution_keep_frac') keep
       FROM settings WHERE key='wf2_price_config'`);
  const backup = await sql(`SELECT COUNT(*)::int c FROM settings WHERE key='wf2_price_config_backup_v2'`);
  const cron = await sql(`SELECT jobname, schedule FROM cron.job WHERE jobname='wf2-price-engine'`);
  const rls = await sql(
    `SELECT polname FROM pg_policy WHERE polrelid='public.wf2_engine_runs'::regclass`);

  console.log('\n=== WERYFIKACJA ===');
  console.log('wf2_engine_runs:', runsTbl[0]?.c === 1 ? 'ISTNIEJE' : 'BRAK!');
  console.log('kolumny products (7 oczekiwanych):', prodCols.map(r => r.column_name).join(', '));
  console.log('widok wf2_product_daily:', view[0]?.c === 1 ? 'ISTNIEJE' : 'BRAK!');
  console.log('config:', JSON.stringify(cfg[0] || '(BRAK!)'));
  console.log('backup v2:', backup[0]?.c === 1 ? 'ISTNIEJE' : 'BRAK!');
  console.log('cron wf2-price-engine:', JSON.stringify(cron[0] || '(BRAK!)'));
  console.log('RLS wf2_engine_runs:', rls.map(r => r.polname).join(', ') || 'BRAK!');

  if (runsTbl[0]?.c !== 1) die('tabela wf2_engine_runs NIE powstała');
  if (prodCols.length !== 7) die(`products ma ${prodCols.length}/7 nowych kolumn`);
  if (view[0]?.c !== 1) die('widok wf2_product_daily NIE powstał');
  if (cfg[0]?.ver !== '3.1') die(`config_version=${cfg[0]?.ver} (oczekiwano 3.1)`);
  if (cfg[0]?.enabled !== 'false' || cfg[0]?.dry !== 'true') die('kill-switch NIE jest fail-closed!');
  log('gotowe — wszystko zweryfikowane.');
})();
