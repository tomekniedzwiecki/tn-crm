#!/usr/bin/env node
// wfa-panel-sync.mjs — MOST sesji budowlanej ↔ panel TN App (tabele wfa_*).
//
// Cel: sesja Claude Code odnotowuje postęp w panelu NATYCHMIAST po zrobieniu rzeczy —
// bez ręcznego REST-a i bez ryzyka „sierot checklist". Zasada fabryki: ZROBIONE =
// od razu odhaczone (checklista + status + kronika), a nie „na koniec z pamięci".
//
// Wzór ducha: scripts/mockup-tools/panel-sync.py (fabryka sklepów, wf2_*). Różnice TN App:
//   • zapis przez Supabase Management API (POST /v1/projects/<ref>/database/query, token sbp_*),
//     a nie REST service-role — jeden mechanizm SQL na odczyt i zapis;
//   • wfa_steps NIE ma product_id (1 projekt = 1 produkt); klucz kroku = (project_id, step_key);
//   • checklista kroku żyje w wfa_steps.data.checklist = [{t, done}], gdzie `t` MUSI być
//     bajt-w-bajt tekstem z obiektu WS w tn-app/projekt.html (klucz deduplikacji panelu —
//     mergedChecklist() łączy zapis z szablonem po DOKŁADNYM `t`; literówka = sierota).
//
// Token Management API (priorytet): --token > env SUPABASE_MGMT_TOKEN > Windows Credential
// Manager (target „Supabase CLI:supabase", CredRead, blob UTF-8). Sekret NIGDY w output.
//
// Polskie znaki: całe HTTP idzie przez natywny fetch Node (body = UTF-8 z definicji) — bez
// pułapki cp1250 (ta dotyczy curl|python i PowerShella; tu do PS schodzi tylko odczyt tokena
// ASCII przez -EncodedCommand). SQL z payloadem PL budujemy jako literał '...'::jsonb z
// pojedynczymi apostrofami podwojonymi (JSON.stringify daje jednoliniowy string, \n escapowane).
//
// CLI: node scripts/wfa-panel-sync.mjs <cmd> --project <uuid|slug> ...
//   steps                          — lista kroków projektu (key, stage, label, status, X/Y).
//   gaps                           — DETEKTOR luk (read-only, bramka końca sesji): wypisuje kroki
//                                     niedomknięte / „done" z niepełną checklistą / bez noty; exit 1
//                                     gdy istnieje choć jedna luka [BEZ-POWODU]. „Suma zwrotów
//                                     subagentów ≠ stan projektu — prawdą jest panel" (L-053).
//   step <key> [--status s] [--check "1,3"] [--check-all] [--check-match "frag"] [--note "..."]
//                                   — upsert kroku: checklista z WS (VERBATIM), MERGE z done.
//   activity --action slug --desc "..." [--actor nazwa]   — wpis do kroniki wfa_activities.
//   note --kind uwaga|decyzja|blokada|retro --text "..." [--author nazwa]  — wfa_notes.
// Wspólne: --dry-run (pokaż SQL/JSON bez zapisu), --json, --token <sbp_...>. Exit 0/1.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const PROJEKT_HTML = join(ROOT, 'tn-app', 'projekt.html');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── util ──────────────────────────────────────────────────────────────────
const die = (msg) => { console.error(`[wfa-panel-sync] BŁĄD: ${msg}`); process.exit(1); };
const log = (msg) => console.log(`[wfa-panel-sync] ${msg}`);
const sqlStr = (s) => (s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const sqlJsonb = (obj) => `${sqlStr(JSON.stringify(obj))}::jsonb`;

// ── token Management API ────────────────────────────────────────────────────
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

function getToken(argToken) {
  const t = argToken || process.env.SUPABASE_MGMT_TOKEN || (() => {
    try { return readTokenFromCredMan(); } catch (e) { return null; }
  })();
  if (!t || !t.startsWith('sbp_')) {
    die('brak tokena Management API (sbp_*). Podaj --token, env SUPABASE_MGMT_TOKEN, ' +
      'albo zaloguj Supabase CLI (Credential Manager „Supabase CLI:supabase").');
  }
  return t;
}

// ── Management API: wykonaj SQL, zwróć tablicę wierszy ──────────────────────
let TOKEN = null;
async function sql(query) {
  const r = await fetch(MGMT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await r.text();
  if (r.status >= 300) {
    // Sekret nigdy w output — pokazujemy tylko status + treść odpowiedzi API.
    die(`Management API ${r.status}: ${text.slice(0, 500)}`);
  }
  try { return text.trim() ? JSON.parse(text) : []; }
  catch { die(`odpowiedź nie-JSON z Management API: ${text.slice(0, 300)}`); }
}

// ── parser obiektu WS z tn-app/projekt.html (literał JS w sandboxie procesu) ─
let _wsCache = null;
function loadWS() {
  if (_wsCache) return _wsCache;
  let html;
  try { html = readFileSync(PROJEKT_HTML, 'utf8'); }
  catch { die(`nie mogę wczytać ${PROJEKT_HTML}`); }
  const m = html.match(/const WS = (\{[\s\S]*?\n {8}\});/);
  if (!m) die('nie znalazłem bloku `const WS = { ... };` w tn-app/projekt.html');
  let ws;
  try { ws = new Function(`return (${m[1]})`)(); } // tylko literał WS, nie cały HTML
  catch (e) { die(`parsowanie WS nieudane: ${e.message}`); }
  _wsCache = ws;
  return ws;
}

// ── rozwiązanie projektu (uuid lub slug) ────────────────────────────────────
async function resolveProject(ref) {
  if (!ref) die('wymagane --project <uuid|slug>');
  if (UUID_RE.test(ref)) return ref;
  const rows = await sql(
    `select id from wfa_projects where slug = ${sqlStr(ref)} or name = ${sqlStr(ref)} limit 1`);
  if (!rows.length) die(`nie znaleziono projektu po slug/nazwie: ${ref}`);
  return rows[0].id;
}

// ── komenda: steps ──────────────────────────────────────────────────────────
async function cmdSteps(opts) {
  const pid = await resolveProject(opts.project);
  const WS = loadWS();
  const defs = await sql(
    `select d.key, d.stage, d.stage_label, d.label, d.owner,
            s.status, s.data
       from wfa_step_defs d
       left join wfa_steps s on s.step_key = d.key and s.project_id = ${sqlStr(pid)}
      where d.active = true
      order by d.stage, d.sort`);
  const rows = defs.map((d) => {
    const tpl = (WS[d.key] && WS[d.key].check) || [];
    const stored = (d.data && Array.isArray(d.data.checklist)) ? d.data.checklist : [];
    const doneSet = new Set(stored.filter((c) => c && c.done).map((c) => c.t));
    const total = tpl.length;
    const done = tpl.filter((t) => doneSet.has(t)).length;
    return {
      key: d.key, stage: d.stage, stage_label: d.stage_label, label: d.label,
      owner: d.owner, status: d.status || '(brak)',
      checklist: total ? `${done}/${total}` : (WS[d.key] ? '0/0' : '—'),
    };
  });
  if (opts.json) { console.log(JSON.stringify(rows, null, 2)); return; }
  log(`Kroki projektu ${pid} (${rows.length}):`);
  console.log('');
  const pad = (s, n) => String(s).padEnd(n).slice(0, n);
  console.log(`  ${pad('KEY', 20)} ${pad('ET', 2)} ${pad('STATUS', 12)} ${pad('✔', 6)}  LABEL`);
  console.log(`  ${'-'.repeat(20)} -- ${'-'.repeat(12)} ${'-'.repeat(6)}  ${'-'.repeat(30)}`);
  let curStage = null;
  for (const r of rows) {
    if (r.stage !== curStage) { curStage = r.stage; console.log(`  · Etap ${r.stage} — ${r.stage_label}`); }
    console.log(`  ${pad(r.key, 20)} ${pad(r.stage, 2)} ${pad(r.status, 12)} ${pad(r.checklist, 6)}  ${r.label}`);
  }
}

// ── komenda: gaps (detektor luk — BRAMKA KOŃCA SESJI, read-only) ────────────
// Prawda o postępie = panel, nie suma zwrotów subagentów (incydent 21.07, L-053).
// Luka = krok NIE w pełni domknięty. Krok „w pełni domknięty" = status=done ORAZ
// checklista pełna (done==total; szablon 0-pozycyjny = pełna). Warianty luki:
//   (a) status != done                        → NIEDOMKNIĘTY
//   (b) status == done, checklista < pełnej    → DONE-PUSTY (done z niepełną checklistą)
// Klasyfikacja każdej luki wg noty (data.note):
//   [MA-NOTĘ]    — nota istnieje i ma ≥ NOTE_MIN znaków (jawny powód: bramka ludzka, blokada…);
//   [BEZ-POWODU] — brak noty (lub za krótka) = CICHA luka, ta klasa blokuje „wszystko zrobione".
// Exit code: 0 gdy zero [BEZ-POWODU]; 1 gdy istnieje ≥1. --json dla maszyn.
const GAP_NOTE_MIN = 10;
async function cmdGaps(opts) {
  const pid = await resolveProject(opts.project);
  const WS = loadWS();
  const defs = await sql(
    `select d.key, d.stage, d.stage_label, d.label, d.owner,
            s.status, s.data
       from wfa_step_defs d
       left join wfa_steps s on s.step_key = d.key and s.project_id = ${sqlStr(pid)}
      where d.active = true
      order by d.stage, d.sort`);
  const items = [];
  for (const d of defs) {
    const tpl = (WS[d.key] && WS[d.key].check) || [];
    const stored = (d.data && Array.isArray(d.data.checklist)) ? d.data.checklist : [];
    const doneSet = new Set(stored.filter((c) => c && c.done).map((c) => c.t));
    const total = tpl.length;
    const done = tpl.filter((t) => doneSet.has(t)).length;
    const status = d.status || '(brak)';
    const isDone = status === 'done';
    const checklistComplete = total === 0 ? true : done === total;
    if (isDone && checklistComplete) continue; // krok w pełni domknięty — nie jest luką
    const note = (d.data && typeof d.data.note === 'string') ? d.data.note.trim() : '';
    const hasNote = note.length >= GAP_NOTE_MIN;
    items.push({
      key: d.key, stage: d.stage, stage_label: d.stage_label, status,
      checklist: total ? `${done}/${total}` : '—',
      reason: isDone ? 'DONE-PUSTY' : 'NIEDOMKNIĘTY',
      klas: hasNote ? 'MA-NOTĘ' : 'BEZ-POWODU',
      note,
    });
  }
  // BEZ-POWODU na górze (najpilniejsze), potem MA-NOTĘ; w obrębie klasy wg etapu.
  const order = { 'BEZ-POWODU': 0, 'MA-NOTĘ': 1 };
  items.sort((a, b) => (order[a.klas] - order[b.klas]) || (a.stage - b.stage));
  const bez = items.filter((i) => i.klas === 'BEZ-POWODU');
  const mano = items.filter((i) => i.klas === 'MA-NOTĘ');
  const verdictOk = bez.length === 0;
  process.exitCode = verdictOk ? 0 : 1; // exit naturalny (stdout zdąży się opróżnić)

  if (opts.json) {
    console.log(JSON.stringify({
      project: pid, total_steps: defs.length, gaps: items.length,
      bez_powodu: bez.length, ma_note: mano.length, verdict_ok: verdictOk, items,
    }, null, 2));
    return;
  }
  const short = (s, n) => { const t = (s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
  log(`GAPS projektu ${pid} — ${items.length} luk (${bez.length} BEZ-POWODU, ${mano.length} MA-NOTĘ) z ${defs.length} kroków:`);
  console.log('');
  if (!items.length) {
    console.log('  ✔ Zero luk — wszystkie aktywne kroki done z pełną checklistą.');
  } else {
    const pad = (s, n) => String(s).padEnd(n).slice(0, n);
    console.log(`  ${pad('KLAS', 11)} ${pad('KEY', 20)} ${pad('ET', 2)} ${pad('STATUS', 12)} ${pad('✔', 6)} ${pad('POWÓD', 13)}  NOTA`);
    console.log(`  ${'-'.repeat(11)} ${'-'.repeat(20)} -- ${'-'.repeat(12)} ${'-'.repeat(6)} ${'-'.repeat(13)}  ${'-'.repeat(30)}`);
    for (const r of items) {
      console.log(`  ${pad('[' + r.klas + ']', 11)} ${pad(r.key, 20)} ${pad(r.stage, 2)} ${pad(r.status, 12)} ${pad(r.checklist, 6)} ${pad(r.reason, 13)}  ${short(r.note, 80) || '—'}`);
    }
  }
  console.log('');
  if (verdictOk) {
    log(`WERDYKT: zero [BEZ-POWODU] — raport końcowy DOZWOLONY. ${mano.length} kroków [MA-NOTĘ] wypisz w sekcji „Kroki niedomknięte i dlaczego" (bramki ludzkie jawnie: kto/co).`);
  } else {
    log(`WERDYKT: „wszystko zrobione" ZAKAZANE — ${bez.length} kroków [BEZ-POWODU] (ciche luki). Domknij lub dopisz notę z powodem, potem powtórz gaps.`);
  }
}

// ── komenda: step (upsert checklisty/statusu/noty) ──────────────────────────
async function cmdStep(stepKey, opts) {
  if (!stepKey) die('wymagany <step_key> — np. `step funkcja_glowna ...`');
  const pid = await resolveProject(opts.project);
  const WS = loadWS();
  const ws = WS[stepKey];
  const tpl = (ws && ws.check) || [];
  if (!ws) log(`WARN: krok „${stepKey}" nie istnieje w obiekcie WS — checklista pusta (tylko status/nota).`);

  // stan istniejący
  const cur = await sql(
    `select data, status, completed_at, completed_by from wfa_steps
      where project_id = ${sqlStr(pid)} and step_key = ${sqlStr(stepKey)} limit 1`);
  const exists = cur.length > 0;
  const existData = (exists && cur[0].data && typeof cur[0].data === 'object') ? cur[0].data : {};
  const existChecklist = Array.isArray(existData.checklist) ? existData.checklist : [];
  const existDone = new Set(existChecklist.filter((c) => c && c.done).map((c) => c.t));

  // które pozycje szablonu odhaczyć (1-based / match / all) — UNIA z już zrobionymi
  const toCheck = new Set();
  if (opts.checkAll) tpl.forEach((_, i) => toCheck.add(i));
  if (opts.check) {
    for (const part of String(opts.check).split(',')) {
      const n = parseInt(part.trim(), 10);
      if (!Number.isNaN(n) && n >= 1 && n <= tpl.length) toCheck.add(n - 1);
      else if (part.trim()) log(`WARN: indeks „${part.trim()}" poza zakresem 1..${tpl.length} — pomijam.`);
    }
  }
  if (opts.checkMatch) {
    const frag = String(opts.checkMatch).toLowerCase();
    let hit = 0;
    tpl.forEach((t, i) => { if (t.toLowerCase().includes(frag)) { toCheck.add(i); hit++; } });
    if (!hit) log(`WARN: --check-match „${opts.checkMatch}" nie pasuje do żadnej pozycji szablonu.`);
  }

  // checklista wynikowa: szablon VERBATIM (kolejność WS) z merge done; potem extras zapisane spoza szablonu
  const tplSet = new Set(tpl);
  const newChecklist = tpl.map((t, i) => ({ t, done: existDone.has(t) || toCheck.has(i) }));
  for (const c of existChecklist) {
    if (c && c.t && !tplSet.has(c.t)) newChecklist.push({ t: c.t, done: !!c.done }); // zachowaj [TK-n]/ręczne
  }

  // data (merge): zachowaj fields i inne klucze, podmień checklist, note nadpisz jeśli podane
  const newData = { ...existData, checklist: newChecklist };
  if (opts.note != null) newData.note = opts.note;

  // status + completed_*
  const statusFinal = opts.status || (exists ? cur[0].status : 'pending');
  if (opts.status && !['pending', 'in_progress', 'done', 'skipped', 'blocked'].includes(opts.status)) {
    die(`--status „${opts.status}" niedozwolony (pending|in_progress|done|skipped|blocked)`);
  }
  let completedAt, completedBy;
  if (opts.status) {
    if (opts.status === 'done') { completedAt = new Date().toISOString(); completedBy = opts.actor || 'sesja'; }
    else { completedAt = null; completedBy = null; }
  } else { // bez zmiany statusu — zachowaj istniejące completed_*
    completedAt = exists ? cur[0].completed_at : null;
    completedBy = exists ? cur[0].completed_by : null;
  }

  const doneCount = newChecklist.filter((c) => c.done).length;
  const upsert =
    `INSERT INTO wfa_steps (project_id, step_key, status, data, completed_at, completed_by, updated_at)\n` +
    `VALUES (${sqlStr(pid)}, ${sqlStr(stepKey)}, ${sqlStr(statusFinal)}, ${sqlJsonb(newData)}, ` +
    `${sqlStr(completedAt)}, ${sqlStr(completedBy)}, now())\n` +
    `ON CONFLICT (project_id, step_key) DO UPDATE SET\n` +
    `  status = EXCLUDED.status, data = EXCLUDED.data,\n` +
    `  completed_at = EXCLUDED.completed_at, completed_by = EXCLUDED.completed_by, updated_at = now()\n` +
    `RETURNING step_key, status, completed_by;`;

  log(`krok „${stepKey}" projekt ${pid}: status→${statusFinal}, checklista ${doneCount}/${newChecklist.length}` +
    (opts.note != null ? ', nota nadpisana' : ''));

  if (opts.dryRun) {
    log('--dry-run: BEZ zapisu. Wygenerowany stan:');
    console.log(JSON.stringify({ status: statusFinal, completed_by: completedBy, data: newData }, null, 2));
    log('SQL (dry-run):');
    console.log(upsert);
    return;
  }

  await sql(upsert);
  // weryfikacja odczytem — „stan po"
  const after = await sql(
    `select status, completed_at, completed_by, data from wfa_steps
      where project_id = ${sqlStr(pid)} and step_key = ${sqlStr(stepKey)} limit 1`);
  const a = after[0];
  const aDone = (a.data.checklist || []).filter((c) => c.done).length;
  log(`ZAPISANO. Stan po: status=${a.status}, checklista ${aDone}/${(a.data.checklist || []).length}, ` +
    `completed_by=${a.completed_by || '—'}`);
  if (opts.json) console.log(JSON.stringify(a, null, 2));
  else (a.data.checklist || []).forEach((c) => console.log(`  [${c.done ? 'x' : ' '}] ${c.t}`));
}

// ── komenda: activity (kronika) ─────────────────────────────────────────────
async function cmdActivity(opts) {
  const pid = await resolveProject(opts.project);
  if (!opts.action) die('wymagane --action <slug>');
  if (!opts.desc) die('wymagane --desc "tekst"');
  const actor = opts.actor || 'sesja';
  const q =
    `INSERT INTO wfa_activities (project_id, actor, action, description)\n` +
    `VALUES (${sqlStr(pid)}, ${sqlStr(actor)}, ${sqlStr(opts.action)}, ${sqlStr(opts.desc)})\n` +
    `RETURNING id, created_at, actor, action, description;`;
  log(`kronika projekt ${pid}: [${actor}] ${opts.action}`);
  if (opts.dryRun) { log('--dry-run: BEZ zapisu. SQL:'); console.log(q); return; }
  const ins = await sql(q);
  const row = ins[0];
  log(`ZAPISANO wfa_activities id=${row.id} @ ${row.created_at}`);
  // weryfikacja odczytem
  const back = await sql(
    `select id, created_at, actor, action, description from wfa_activities
      where id = ${row.id} limit 1`);
  if (opts.json) console.log(JSON.stringify(back[0], null, 2));
  else log(`Stan po: [${back[0].actor}] ${back[0].action} — ${back[0].description}`);
}

// ── komenda: note (uwaga/decyzja) ───────────────────────────────────────────
async function cmdNote(opts) {
  const pid = await resolveProject(opts.project);
  const ALLOWED = ['uwaga', 'decyzja', 'blokada', 'retro'];
  if (!opts.kind || !ALLOWED.includes(opts.kind)) die(`--kind musi być jednym z: ${ALLOWED.join('|')}`);
  if (!opts.text) die('wymagane --text "..."');
  const author = opts.author || 'sesja';
  const q =
    `INSERT INTO wfa_notes (project_id, kind, content, author)\n` +
    `VALUES (${sqlStr(pid)}, ${sqlStr(opts.kind)}, ${sqlStr(opts.text)}, ${sqlStr(author)})\n` +
    `RETURNING id, created_at, kind, status, author, content;`;
  log(`uwaga projekt ${pid}: [${opts.kind}] ${author}`);
  if (opts.dryRun) { log('--dry-run: BEZ zapisu. SQL:'); console.log(q); return; }
  const ins = await sql(q);
  const row = ins[0];
  log(`ZAPISANO wfa_notes id=${row.id} status=${row.status}`);
  const back = await sql(`select id, kind, status, author, content from wfa_notes where id = ${sqlStr(row.id)} limit 1`);
  if (opts.json) console.log(JSON.stringify(back[0], null, 2));
  else log(`Stan po: [${back[0].kind}/${back[0].status}] ${back[0].content}`);
}

// ── parser argumentów ───────────────────────────────────────────────────────
function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') o.dryRun = true;
    else if (a === '--json') o.json = true;
    else if (a === '--check-all') o.checkAll = true;
    else if (a.startsWith('--')) {
      const key = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const val = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
      o[key] = val;
    } else o._.push(a);
  }
  return o;
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  const [, , cmd, ...rest] = process.argv;
  const opts = parseArgs(rest);
  if (!cmd || ['-h', '--help', 'help'].includes(cmd)) {
    console.log(`wfa-panel-sync.mjs — sync panelu TN App (wfa_*). Zrobione = od razu odnotowane.

Komendy:
  steps --project <uuid|slug>
  gaps  --project <uuid|slug>   [--json]   (read-only; exit 1 gdy istnieje luka [BEZ-POWODU])
  step <step_key> --project <p> [--status pending|in_progress|done|skipped|blocked]
       [--check "1,3,5" | --check-all | --check-match "fragment"] [--note "..."] [--actor nazwa]
  activity --project <p> --action <slug> --desc "..." [--actor nazwa]
  note --project <p> --kind uwaga|decyzja|blokada|retro --text "..." [--author nazwa]

Wspólne: --dry-run  --json  --token <sbp_...>
Checklisty budowane VERBATIM z obiektu WS w tn-app/projekt.html (klucz dedup panelu).`);
    process.exit(cmd ? 0 : 1);
  }
  TOKEN = getToken(opts.token);
  try {
    if (cmd === 'steps') await cmdSteps(opts);
    else if (cmd === 'gaps') await cmdGaps(opts);
    else if (cmd === 'step') await cmdStep(opts._[0], opts);
    else if (cmd === 'activity') await cmdActivity(opts);
    else if (cmd === 'note') await cmdNote(opts);
    else die(`nieznana komenda: ${cmd} (steps|gaps|step|activity|note)`);
  } catch (e) {
    die(e && e.message ? e.message : String(e));
  }
}

main();
