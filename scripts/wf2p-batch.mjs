#!/usr/bin/env node
// wf2p-batch.mjs — runner wzbogacania Prospektora B2B (sprzedawcy Allegro).
// Przepuszcza wybranych sprzedawców przez silnik wf2-prospektor: research → score
// → pitch (każda akcja = osobne wywołanie edge). NIGDY nie woła message/wysyłki.
// AUTH: mint JWT zespołu (service key → generate_link → verify), token tylko w RAM.
// Wzorzec: wfp-batch.mjs.
//
// Użycie:
//   node scripts/wf2p-batch.mjs [--limit 6] [--logins a,b,c]
//   --logins   CSV loginów allegro do przetworzenia (pierwszeństwo przed --limit).
//   --limit N  ile sprzedawców 'nowy' przetworzyć, gdy brak --logins (domyślnie 6).

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_vT94u2GI4gzYl8gCV5sHbQ_Q94YidaI';
const ENGINE = `${SUPABASE_URL}/functions/v1/wf2-prospektor`;
const BETWEEN_ACTIONS_MS = 2500, BETWEEN_SELLERS_MS = 3000, RETRY_WAIT_MS = 30_000;

const log = (m) => console.log(`[wf2p-batch] ${m}`);
const die = (m) => { console.error(`[wf2p-batch] BŁĄD: ${m}`); process.exit(1); };
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LOGINS = (arg('--logins') || '').split(',').map((s) => s.trim()).filter(Boolean);
const LIMIT = Math.max(1, parseInt(arg('--limit') || '6', 10) || 6);
const ACTIONS = (arg('--actions') || 'research,score,pitch').split(',').map((s) => s.trim()).filter(Boolean);

function readServiceKey() {
  const env = Object.fromEntries(
    readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
  return env.SUPABASE_SERVICE_KEY || die('brak SUPABASE_SERVICE_KEY w tn-crm/.env');
}

async function hfetch(url, opts = {}, timeout = 150_000) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    const text = await res.text(); let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
    return { ok: res.ok, status: res.status, json, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e?.message || e) }; }
  finally { clearTimeout(t); }
}

async function mintTeamJwt(serviceKey) {
  const adminHdr = { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, 'content-type': 'application/json' };
  const tm = await hfetch(`${SUPABASE_URL}/rest/v1/team_members?select=user_id&limit=1`, { headers: adminHdr });
  const userId = Array.isArray(tm.json) && tm.json[0] ? tm.json[0].user_id : null;
  if (!userId) die(`team_members odczyt (status ${tm.status})`);
  const au = await hfetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, { headers: adminHdr });
  const email = au.json?.email || die(`brak emaila auth (status ${au.status})`);
  const gl = await hfetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: 'POST', headers: adminHdr, body: JSON.stringify({ type: 'magiclink', email }) });
  const hashed = gl.json?.hashed_token || gl.json?.properties?.hashed_token || die(`generate_link (status ${gl.status})`);
  const vr = await hfetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: 'POST', headers: { apikey: PUBLISHABLE_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'magiclink', token_hash: hashed }) });
  return vr.json?.access_token || die(`verify access_token (status ${vr.status})`);
}

const restGet = (jwt, path) => hfetch(`${SUPABASE_URL}/rest/v1/${path}`,
  { headers: { apikey: PUBLISHABLE_KEY, authorization: `Bearer ${jwt}` } });

async function callEngine(jwt, action, sellerId) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await hfetch(ENGINE, { method: 'POST',
      headers: { 'content-type': 'application/json', apikey: PUBLISHABLE_KEY, authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ action, sellerId }) });
    if (r.ok) return { ok: true, json: r.json || {} };
    const code = r.json?.error || null;
    if (code === 'dzienny_limit') return { hardStop: true, reason: 'dzienny_limit' };
    if ((r.status === 429 || r.status >= 500 || r.status === 0) && attempt === 0) { await sleep(RETRY_WAIT_MS); continue; }
    return { ok: false, error: code || r.text?.slice(0, 120), status: r.status };
  }
}

(async () => {
  const jwt = await mintTeamJwt(readServiceKey());
  log('JWT zespołu gotowy.');

  let sellers;
  if (LOGINS.length) {
    const inList = LOGINS.map((l) => `"${l}"`).join(',');
    const r = await restGet(jwt, `wf2p_sellers?select=id,allegro_login,brand_name,product_category&allegro_login=in.(${inList})`);
    sellers = r.json || [];
  } else {
    const r = await restGet(jwt, `wf2p_sellers?select=id,allegro_login,brand_name,product_category&status=eq.nowy&order=created_at.asc&limit=${LIMIT}`);
    sellers = r.json || [];
  }
  if (!sellers.length) die('brak sprzedawców do przetworzenia');
  log(`Do przetworzenia: ${sellers.length}`);

  for (const s of sellers) {
    process.stdout.write(`\n[${s.allegro_login}] (${s.product_category}) `);
    for (const action of ACTIONS) {
      const res = await callEngine(jwt, action, s.id);
      if (res.hardStop) die('dzienny limit AI — STOP');
      process.stdout.write(res.ok ? `${action}✓ ` : `${action}✗(${res.error}) `);
      if (!res.ok && action === 'research') break; // bez researchu nie ma sensu score/pitch
      await sleep(BETWEEN_ACTIONS_MS);
    }
    await sleep(BETWEEN_SELLERS_MS);
  }

  // ── podsumowanie: score / segment / sygnały ──
  const ids = sellers.map((s) => `"${s.id}"`).join(',');
  const done = await restGet(jwt,
    `wf2p_sellers?select=allegro_login,brand_name,segment,score,brand_owned,own_shop_quality,legal_form,www,pitch,score_reason&id=in.(${ids})&order=score.desc.nullslast`);
  console.log('\n\n=== WYNIKI ===');
  for (const d of (done.json || [])) {
    const pitch = d.pitch ? `${d.pitch.kat}/${d.pitch.kanal}` : '—';
    console.log(`${(d.segment || '?')} ${String(d.score ?? '—').padStart(3)} | ${d.allegro_login.padEnd(18)} | własna=${d.brand_owned} sklep=${d.own_shop_quality || '—'} forma=${d.legal_form || '—'} www=${d.www ? 'tak' : '—'} | pitch=${pitch}`);
    if (d.score_reason) console.log(`         ↳ ${d.score_reason}`);
  }
})();
