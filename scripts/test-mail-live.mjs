// ŻYWY TEST MAILI (F3) na REALNYCH projektach. Generuje treść z prawdziwych sesji,
// wysyła komplet na JEDEN adres testowy (override odbiorcy — żaden lead nie dostaje maila),
// składa galerię HTML do wizualnej oceny i robi lint treści (żargon / „w panelu" w abandoned /
// personalizacja / sygnatura). NIE używa e-maili leadów — odbiorca jest twardo nadpisany.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const TEST_TO = process.argv[2] || 'test@test.com';
const envUrl = new URL('../.env', import.meta.url);
for (const line of readFileSync(envUrl, 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const SERVICE = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const URL_ = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const BASE = URL_ + '/functions/v1';
const supabase = createClient(URL_, SERVICE);
let ADMIN = process.env.SPAR_CRON_SECRET || '';
try { if (!ADMIN) ADMIN = readFileSync('C:/tmp/spar_cron_secret.txt', 'utf8').trim(); } catch { /* */ }
if (!ADMIN) { console.error('BRAK SPAR_CRON_SECRET'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (h) => String(h || '').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

async function callFn(name, payload) {
  const res = await fetch(BASE + '/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SERVICE, 'x-admin-secret': ADMIN }, body: JSON.stringify(payload) });
  let body; try { body = await res.json(); } catch { body = await res.text().catch(() => ''); }
  return { status: res.status, body };
}
async function sendLive(subject, html) {
  // html z podglądu MA już sygnaturę → no_signature:true (jeden podpis). Odbiorca twardo = TEST_TO.
  const res = await fetch(BASE + '/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE}` }, body: JSON.stringify({ to: TEST_TO, subject, html, no_signature: true, reply_to: 'biuro@tomekniedzwiecki.pl' }) });
  let b; try { b = await res.json(); } catch { b = {}; }
  return { ok: res.ok && b?.success !== false, id: b?.id || null, err: b?.error || (res.ok ? null : 'HTTP ' + res.status) };
}

// REALNE sesje (is_test=false)
const STRAZNIK = '5ed18cc4-c1b4-4e51-b9f7-c8fc0c52cea0'; // Strażnik Treści — Szymon Szirch (komplet bez proto)
const LITTER = '5b70f154-e465-412f-b264-0250b3b51d78';   // LitterPlan — adrian (komplet + proto)
const SYNC = 'dd466840-1de8-47fc-8afc-0d66745e6197';     // SyncFounders Check — Dariusz W. (w toku, 22 msgs)

const JARGON = /\b(CAC|LTV|churn|MRR|ARPU|retencj|konwersj|unit economics|runway|payback)\b/i;
const results = [];

async function take(project, group, kind, gen) {
  const { subject, html } = await gen();
  if (!subject || !html) { results.push({ project, group, kind, subject: '(BRAK)', ok: false, lint: ['nie wygenerowano'] }); console.log('FAIL ' + kind + ' — brak treści'); return; }
  const txt = strip(html);
  const lint = [];
  if (JARGON.test(txt)) lint.push('ŻARGON: ' + (txt.match(JARGON) || [])[0]);
  if (group === 'abandoned' && /w panelu|czeka w panelu/i.test(txt)) lint.push('„w panelu" w abandoned (artefakty jeszcze nie istnieją!)');
  if (!/tomekniedzwiecki\.pl/i.test(html)) lint.push('brak sygnatury');
  const send = await sendLive(subject, html);
  results.push({ project, group, kind, subject, txt, html, ok: send.ok, sendId: send.id, sendErr: send.err, lint });
  console.log((send.ok ? 'SENT' : 'SEND?') + ' | ' + project + ' / ' + kind + ' | „' + subject + '"' + (send.id ? '  [' + send.id + ']' : (send.err ? '  (' + send.err + ')' : '')) + (lint.length ? '  ⚠ ' + lint.join('; ') : ''));
  await sleep(500);
}

// ── 1) FOLLOW-UPY (Strażnik Treści) ──
console.log('\n=== FOLLOW-UPY — Strażnik Treści (Szymon Szirch) ===');
for (const kind of ['nurture_1', 'nurture_2', 'nurture_3', 'nurture_4', 'nurture_5', 'nurture_6', 'verdict_last_call', 'paid_welcome', 'komplet_gotowy']) {
  await take('Strażnik Treści', 'followup', kind, async () => {
    const r = await callFn('spar-followups', { action: 'preview_session', sessionId: STRAZNIK, kind });
    return { subject: r.body?.preview?.subject, html: r.body?.preview?.html };
  });
}

// ── 2) ABANDONED (SyncFounders Check) — najpierw wygeneruj sekwencję (SEQUENCE_SYSTEM), potem podgląd 1:1 ──
console.log('\n=== ABANDONED — SyncFounders Check (Dariusz W.) ===');
await callFn('spar-followups', { action: 'generate_abandoned', sessionId: SYNC });
for (const kind of ['abandoned_chat', 'abandoned_chat_2', 'abandoned_chat_3']) {
  await take('SyncFounders Check', 'abandoned', kind, async () => {
    const r = await callFn('spar-followups', { action: 'preview_session', sessionId: SYNC, kind });
    return { subject: r.body?.preview?.subject, html: r.body?.preview?.html };
  });
}

// ── 3) DRIP (LitterPlan) ──
console.log('\n=== DRIP — LitterPlan (adrian) ===');
for (const key of ['rynek', 'economics', 'landing', 'gtm', 'prototyp']) {
  await take('LitterPlan', 'drip', key, async () => {
    const r = await callFn('spar-drip', { action: 'fire', sessionId: LITTER, key, send: false });
    return { subject: r.body?.preview?.subject, html: r.body?.preview?.html };
  });
}

// ── GALERIA HTML do wizualnej oceny ──
const ok = results.filter((r) => r.ok).length;
const flagged = results.filter((r) => r.lint && r.lint.length);
const gallery = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Test maili sparingu (F3) — ${results.length} szt.</title>
<style>body{margin:0;background:#0a0a0a;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#e5e5e5}
.wrap{max-width:680px;margin:0 auto;padding:24px}
h1{font-size:18px} .meta{color:#888;font-size:13px;margin-bottom:24px}
.card{background:#fff;border-radius:12px;margin:0 0 28px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.4)}
.hd{background:#141416;color:#fff;padding:12px 16px;font-size:13px}
.hd b{color:#10b981} .subj{color:#fff;font-size:15px;font-weight:600;margin-top:4px}
.flag{color:#f59e0b;font-size:12px;margin-top:6px}
.body{padding:20px}</style></head><body><div class="wrap">
<h1>Test maili sparingu (F3) — realne projekty → ${TEST_TO}</h1>
<div class="meta">${results.length} maili • wysłano OK: ${ok}/${results.length} • z flagą lint: ${flagged.length}</div>
${results.map((r) => `<div class="card"><div class="hd"><b>${r.project}</b> · ${r.group} · ${r.kind} ${r.ok ? '✓ wysłany' : '�— niewysłany'}<div class="subj">${(r.subject || '').replace(/</g, '&lt;')}</div>${r.lint && r.lint.length ? '<div class="flag">⚠ ' + r.lint.join(' · ') + '</div>' : ''}</div><div class="body">${r.html || '(brak treści)'}</div></div>`).join('\n')}
</div></body></html>`;
const galleryPath = 'C:/tmp/spar-maile-test-galeria.html';
writeFileSync(galleryPath, gallery, 'utf8');

console.log('\n=== PODSUMOWANIE ===');
console.log('Wysłano (Resend OK): ' + ok + '/' + results.length + ' na ' + TEST_TO);
console.log('Galeria: ' + galleryPath);
if (flagged.length) { console.log('\nFLAGI LINT:'); for (const r of flagged) console.log('  • ' + r.project + '/' + r.kind + ': ' + r.lint.join('; ')); }
else console.log('Lint: 0 flag (żargon/„w panelu"/sygnatura — czysto)');
