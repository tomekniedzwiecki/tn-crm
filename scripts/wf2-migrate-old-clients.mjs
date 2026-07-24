#!/usr/bin/env node
// wf2-migrate-old-clients.mjs — import klientów z TN Workflow v1 do wf2 + flaga OLD.
//
// Dla każdego e-maila z listy zapewnia DOKŁADNIE jeden projekt wf2 oznaczony is_old=true:
//   • istnieje projekt wf2 (match po lower(customer_email)) → tylko UPDATE is_old=true,
//   • brak → INSERT z danych workflows v1 (nazwa/telefon) + wf2_ensure_steps + activity.
// Dedup po e-mailu (nie tworzy duplikatów). Idempotentne — bezpieczne do ponownego uruchomienia.
//
// Tryby:  --dry (domyślnie, tylko raport, ZERO zapisu)  |  --apply (wykonuje zmiany)
// Token:  --token > env SUPABASE_MGMT_TOKEN > Credential Manager „Supabase CLI:supabase".
//
// Uruchom:  node scripts/wf2-migrate-old-clients.mjs --dry
//           node scripts/wf2-migrate-old-clients.mjs --apply

import { execFileSync } from 'node:child_process';

const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const APPLY = process.argv.includes('--apply');

// Lista klientów z Workflow 1 (unikaty, lower-case; skrzypniak podany 2× w zleceniu = 1 wpis).
const EMAILS = [
  '23boro1990@gmail.com',
  'skrzypniakpatryk@gmail.com',
  'karol.karpeta@gmail.com',
  'morawskirafal@wp.pl',
  'zenstarship11@gmail.com',
  'thunderpl@outlook.com',
  'cinek11118@gmail.com',
  'damian@mordalski.com',
  'jkluch@wp.pl',
  'rhmms@wp.pl',
];

// Ręczne dopasowania dla e-maili, których NIE ma w workflows v1 pod tym adresem.
// 23boro1990@gmail.com — brak w v1; po nazwisku pasuje wpis „Tomasz Borowski"
// (v1 e-mail borowski1990@o2.pl, inny adres). Dane do weryfikacji przez Tomka.
const OVERRIDES = {
  '23boro1990@gmail.com': {
    name: 'Tomasz Borowski',
    phone: '+48510651772',
    note: 'Klient przeniesiony z TN Workflow (v1): 10760f3a-280d-45e9-b7db-ec4d8ece85a5. UWAGA: w v1 pod e-mailem borowski1990@o2.pl (inny adres) — dopasowano po nazwisku, zweryfikuj dane klienta.',
  },
};

const die = (m) => { console.error(`[wf2-old] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[wf2-old] ${m}`);
const qlit = (v) => (v === null || v === undefined) ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;

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
  if (r.status >= 300) die(`Management API ${r.status}: ${text.slice(0, 800)}`);
  try { return text.trim() ? JSON.parse(text) : []; }
  catch { die(`odpowiedź nie-JSON: ${text.slice(0, 300)}`); }
}

const localPart = (email) => (email.split('@')[0] || email).trim();

(async () => {
  log(`Tryb: ${APPLY ? 'APPLY (zapis)' : 'DRY-RUN (tylko raport)'} · ${EMAILS.length} e-maili`);

  // Jeden round-trip: dla każdego e-maila zbierz match v1 + istniejące wf2.
  const emailsSql = EMAILS.map(qlit).join(', ');
  const rows = await sql(`
    WITH e(email) AS (VALUES ${EMAILS.map(x => `(${qlit(x)})`).join(', ')})
    SELECT e.email,
      (SELECT json_agg(json_build_object('id',w.id,'name',w.customer_name,'phone',w.customer_phone,'offer',w.offer_name,'created',w.created_at) ORDER BY w.created_at DESC)
         FROM public.workflows w WHERE lower(w.customer_email) = e.email) AS v1,
      (SELECT json_agg(json_build_object('id',p.id,'name',p.customer_name,'is_old',p.is_old,'lifecycle',p.lifecycle,'status',p.status,'created',p.created_at) ORDER BY p.created_at DESC)
         FROM public.wf2_projects p WHERE lower(p.customer_email) = e.email) AS wf2
    FROM e ORDER BY e.email;
  `);

  const plan = { create: [], mark: [], already: [], noV1: [] };
  console.log('\n=== ROZPOZNANIE ===');
  for (const email of EMAILS) {
    const row = rows.find(r => r.email === email) || {};
    const v1 = row.v1 || [];
    const wf2 = row.wf2 || [];
    const v1top = v1[0] || null;
    const v1name = v1top?.name || null;

    if (wf2.length) {
      const needsFlag = wf2.filter(p => !p.is_old);
      const tag = needsFlag.length ? 'OZNACZ OLD' : 'już OLD';
      if (needsFlag.length) plan.mark.push({ email, ids: needsFlag.map(p => p.id) });
      else plan.already.push({ email });
      console.log(`  ${email.padEnd(30)} → wf2 ISTNIEJE (${wf2.length}) [${tag}] · ` +
        wf2.map(p => `${p.name || '—'}(${p.id.slice(0,8)}, is_old=${p.is_old})`).join(', '));
    } else {
      const ov = OVERRIDES[email] || {};
      const name = ov.name || v1name || localPart(email);
      const phone = ov.phone || v1top?.phone || null;
      const note = ov.note || ('Klient przeniesiony z TN Workflow (v1)' + (v1top ? ': ' + v1top.id : ''));
      plan.create.push({ email, name, phone, note });
      if (!v1top && !ov.name) plan.noV1.push(email);
      console.log(`  ${email.padEnd(30)} → BRAK w wf2 → UTWÓRZ jako „${name}"` +
        (v1top ? ` (v1: ${v1top.id.slice(0,8)}${v1top.offer ? ' · ' + v1top.offer : ''})`
               : ov.name ? ` (override ręczny — brak w v1 pod tym e-mailem)`
                         : ' (⚠ BRAK dopasowania w workflows v1 — nazwa z e-maila)'));
    }
  }

  console.log(`\nPODSUMOWANIE: utwórz=${plan.create.length}, oznacz=${plan.mark.length}, już-OLD=${plan.already.length}` +
    (plan.noV1.length ? `, bez-v1=${plan.noV1.length} (${plan.noV1.join(', ')})` : ''));

  if (!APPLY) { console.log('\n(DRY-RUN — nic nie zapisano. Uruchom z --apply, by wykonać.)'); return; }

  // ── APPLY ──────────────────────────────────────────────────────────────────
  console.log('\n=== ZAPIS ===');
  // 1) oznacz istniejące
  for (const m of plan.mark) {
    await sql(`UPDATE public.wf2_projects SET is_old = true, updated_at = now()
                WHERE id IN (${m.ids.map(qlit).join(', ')});`);
    for (const id of m.ids) {
      await sql(`INSERT INTO public.wf2_activities (project_id, actor, action, description)
                 VALUES (${qlit(id)}, 'admin', 'flag_old', 'Oznaczono jako klient OLD (przeniesiony z TN Workflow 1)');`);
    }
    console.log(`  ✓ oznaczono OLD: ${m.email} (${m.ids.length})`);
  }
  // 2) utwórz brakujące
  for (const c of plan.create) {
    const ins = await sql(`
      INSERT INTO public.wf2_projects (customer_name, customer_email, customer_phone, is_old, notes)
      VALUES (${qlit(c.name)}, ${qlit(c.email)}, ${qlit(c.phone)}, true, ${qlit(c.note)})
      RETURNING id;`);
    const id = ins[0]?.id;
    if (!id) die(`INSERT nie zwrócił id dla ${c.email}`);
    await sql(`SELECT public.wf2_ensure_steps(${qlit(id)}::uuid);`);
    await sql(`INSERT INTO public.wf2_activities (project_id, actor, action, description)
               VALUES (${qlit(id)}, 'admin', 'created', 'Projekt utworzony — import klienta OLD z TN Workflow 1');`);
    console.log(`  ✓ utworzono: ${c.email} → „${c.name}" (${id.slice(0,8)})`);
  }

  // ── weryfikacja końcowa ─────────────────────────────────────────────────────
  const check = await sql(`
    SELECT p.customer_email, p.customer_name, p.is_old,
           (SELECT count(*) FROM public.wf2_steps s WHERE s.project_id = p.id) AS steps
      FROM public.wf2_projects p
     WHERE lower(p.customer_email) IN (${EMAILS.map(qlit).join(', ')})
     ORDER BY p.is_old DESC, p.customer_email;`);
  console.log('\n=== STAN PO ZAPISIE (10 klientów) ===');
  check.forEach(r => console.log(`  is_old=${r.is_old} · steps=${String(r.steps).padStart(3)} · ${(r.customer_email||'').padEnd(30)} ${r.customer_name || ''}`));
  const flagged = check.filter(r => r.is_old).length;
  console.log(`\nOznaczonych OLD: ${flagged}/${EMAILS.length}`);
  if (flagged !== EMAILS.length) console.warn('⚠ Nie wszystkie e-maile mają projekt OLD — sprawdź raport wyżej.');
  log('gotowe.');
})();
