#!/usr/bin/env node
// apply-wf2-ceny32.mjs — aplikuje 20260722_wf2_ceny32.sql (CENY 3.0 v3.2) przez
// Supabase Management API (POST /v1/projects/<ref>/database/query). Wzorzec:
// apply-wf2-ceny3.mjs (db push wybucha na rozjechanej historii CLI).
//
// Zakres migracji: kolumny client_cost_* na wf2_products (cena zakupu podana przez
// klienta + CHECK source dropship/wholesale), kind 'client_cost_review' na
// wf2_proposals (pełna lista 11), config → v3.2 (backup v31 + COALESCE kill-switcha +
// hard_min_orders 5 + cost_model + asercje dry_run=true).
//
// Token Management API: --token > env SUPABASE_MGMT_TOKEN > Windows Credential
// Manager (target „Supabase CLI:supabase"). Sekret NIGDY w output.
//
// Uruchom: node scripts/apply-wf2-ceny32.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const die = (m) => { console.error(`[apply-wf2-ceny32] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[apply-wf2-ceny32] ${m}`);

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
  const mig = readFileSync(join(ROOT, 'supabase', 'migrations', '20260722_wf2_ceny32.sql'), 'utf8');
  log('Aplikuję 20260722_wf2_ceny32.sql …');
  await sql(mig);
  log('  ✓ zastosowana');

  // ── weryfikacja ────────────────────────────────────────────────────────────
  const prodCols = await sql(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='wf2_products'
        AND column_name IN ('client_cost_purchase','client_cost_is_net',
                            'client_cost_source','client_cost_note','client_cost_set_at')
      ORDER BY column_name`);
  const srcChk = await sql(
    `SELECT pg_get_constraintdef(oid) def FROM pg_constraint
      WHERE conname='wf2_products_client_cost_source_chk'`);
  const kindChk = await sql(
    `SELECT pg_get_constraintdef(oid) def FROM pg_constraint
      WHERE conname='wf2_proposals_kind_chk'`);
  const cfg = await sql(
    `SELECT (value::jsonb->>'config_version') ver,
            (value::jsonb->>'engine_enabled') enabled,
            (value::jsonb->>'dry_run') dry,
            (value::jsonb->>'hard_min_orders') hard,
            (value::jsonb->>'proposal_ttl_days') ttl,
            (value::jsonb->>'collapse_min_expected') colexp,
            ((value::jsonb -> 'cost_model') IS NOT NULL) has_cost_model
       FROM settings WHERE key='wf2_price_config'`);
  const backup = await sql(`SELECT COUNT(*)::int c FROM settings WHERE key='wf2_price_config_backup_v31'`);

  const kindDef = kindChk[0]?.def || '';
  const kindHasReview = /client_cost_review/i.test(kindDef);

  console.log('\n=== WERYFIKACJA ===');
  console.log('kolumny client_cost_* (5 oczekiwanych):', prodCols.map(r => r.column_name).join(', '));
  console.log('CHECK client_cost_source:', srcChk[0]?.def || '(BRAK!)');
  console.log('CHECK kind zawiera client_cost_review:', kindHasReview ? 'TAK' : 'NIE!');
  console.log('config:', JSON.stringify(cfg[0] || '(BRAK!)'));
  console.log('backup v3.1:', backup[0]?.c === 1 ? 'ISTNIEJE' : 'BRAK!');

  if (prodCols.length !== 5) die(`products ma ${prodCols.length}/5 nowych kolumn client_cost_*`);
  if (!srcChk[0]?.def) die('brak CHECK wf2_products_client_cost_source_chk');
  if (!kindHasReview) die("CHECK kind proposals NIE zawiera 'client_cost_review'");
  if (cfg[0]?.ver !== '3.2') die(`config_version=${cfg[0]?.ver} (oczekiwano 3.2)`);
  if (cfg[0]?.dry !== 'true') die('dry_run NIE jest true — pilot musi zostać w dry_run!');
  if (cfg[0]?.hard !== '5') die(`hard_min_orders=${cfg[0]?.hard} (oczekiwano 5)`);
  if (cfg[0]?.has_cost_model !== true) die('config NIE zawiera sekcji cost_model');
  if (backup[0]?.c !== 1) die('backup wf2_price_config_backup_v31 NIE powstał');
  log('gotowe — wszystko zweryfikowane.');
})();
