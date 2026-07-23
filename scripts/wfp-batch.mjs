#!/usr/bin/env node
// wfp-batch.mjs — PRODUKCYJNY runner partii modułu „Prospektor" (tn-app).
//
// Przepuszcza wybraną liczbę prospektów danego wertykalu przez cykl silnika
// wfp-engine: research → idea → mail (każda akcja to osobne wywołanie edge z
// web_search, 30–90 s, koszt ~1,55 zł/firmę za pełen komplet). Cel = doprowadzić
// firmy do statusu `mail_gotowy`. Batch NIE MOŻE być edge functionem (ściana
// wall-clock ~330 s) — dlatego to skrypt lokalny wołający silnik PER AKCJA.
//
// ⛔ TWARDA ZASADA: skrypt NIGDY nie woła akcji send / reply_send / gmail_draft.
//    Wysyłkę robi WYŁĄCZNIE Tomek ręcznie z panelu (klik „Zatwierdź i WYŚLIJ").
//    Tu nie ma i nie będzie flagi do wysyłki.
//
// Bezpieczniki quoty (pamięć: insufficient_quota kładzie WSZYSTKIE lejki OpenAI):
//   • 429 z licznika dziennego (`wfp_daily_cap`, kod `dzienny_limit`) = natychmiast STOP.
//   • 3 kolejne pady RÓŻNYCH firm z rzędu = STOP całej partii.
//   • retry 1× po 30 s tylko na 429 (rate) / 5xx / blip sieci.
//
// Wznawialność: prospekt z zapisanym research/idea kontynuuje od brakującego kroku
//   (sprawdzamy obecność pól research/idea/mail w bazie, nie tylko status).
//
// AUTH: mint JWT członka zespołu (service key → admin/generate_link → verify).
//   Token trzymany TYLKO w pamięci procesu — nie zapisywany na dysk, nie logowany.
//   Odczyt/silnik idą przez PostgREST/edge z tym JWT (apikey = publishable, jak panel).
//
// Użycie:
//   node scripts/wfp-batch.mjs --vertical <key> [--limit 10] [--statuses nowy] [--dry]
//
//   --vertical <key>   WYMAGANY. Slug wertykalu (kolumna wfp_verticals.key).
//   --limit N          Ile firm przetworzyć (domyślnie 10).
//   --statuses a,b     Statusy wejściowe (domyślnie 'nowy'). CSV.
//   --dry              Tylko plan (odczyt) — ZERO wywołań silnika, ZERO kosztów.
//
// Sekret service-role: tn-crm/.env (SUPABASE_SERVICE_KEY). Plik bywa CRLF — czytamy w Node.
// Wymaga Node ≥18 (globalny fetch), zero zależności npm.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── stałe środowiska (te same co panel prospektor.html) ──────────────────────
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_vT94u2GI4gzYl8gCV5sHbQ_Q94YidaI';
const WFP_ENGINE = `${SUPABASE_URL}/functions/v1/wfp-engine`;

// Rytm partii (pamięć: między akcjami 2–3 s; retry po 30 s; kurs USD→PLN fallback).
const BETWEEN_ACTIONS_MS = 2500;   // pauza między research/idea/mail tego samego prospekta
const BETWEEN_PROSPECTS_MS = 3000; // pauza między firmami
const RETRY_WAIT_MS = 30_000;      // odczekaj po 429/5xx przed jedynym retry
const MAX_CONSEC_FAIL = 3;         // 3 pady różnych firm z rzędu → STOP (ochrona quoty)
const USD_PLN_FALLBACK = 4.0;

// ── logowanie (wzorzec wfp-import-csv) ───────────────────────────────────────
const log = (m) => console.log(`[wfp-batch] ${m}`);
const warn = (m) => console.warn(`[wfp-batch] ⚠ ${m}`);
const die = (m) => { console.error(`[wfp-batch] BŁĄD: ${m}`); process.exit(1); };

// ── argumenty ────────────────────────────────────────────────────────────────
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const flag = (name) => process.argv.includes(name);

const VERTICAL_KEY = arg('--vertical') || die('podaj --vertical <key> (slug wertykalu)');
const LIMIT = Math.max(1, parseInt(arg('--limit') || '10', 10) || 10);
const STATUSES = (arg('--statuses') || 'nowy').split(',').map((s) => s.trim()).filter(Boolean);
const DRY = flag('--dry');

// ── helpery ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const ideaBlocked = (idea) => isObj(idea) && isObj(idea.saturacja) && idea.saturacja.werdykt === 'zablokowane';
const fmtPln = (usd, rate) => `${((Number(usd) || 0) * rate).toFixed(2)} zł`;
const fmtDur = (ms) => { const s = Math.round(ms / 1000); return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`; };

// ── .env: service key (split CRLF/LF — plik bywa CRLF, loader by się wywalił) ─
function readServiceKey() {
  const env = Object.fromEntries(
    readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  );
  const sk = env.SUPABASE_SERVICE_KEY;
  if (!sk) die('brak SUPABASE_SERVICE_KEY w tn-crm/.env');
  return sk;
}

// ── HTTP: fetch z timeoutem (bez retry — retry sterujemy wyżej per-akcja) ─────
async function hfetch(url, opts = {}, timeout = 120_000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    const text = await res.text();
    let json = null; try { json = text ? JSON.parse(text) : null; } catch { /* nie-JSON */ }
    return { ok: res.ok, status: res.status, json, text };
  } catch (e) {
    return { ok: false, status: 0, json: null, text: String(e?.message || e) };
  } finally { clearTimeout(t); }
}

// ── MINT JWT zespołu (service key → generate_link → verify) ──────────────────
// Gotcha (pamięć reference-podglad-admina-e2e-test-jwt): team_members.email to
// email KONTAKTOWY, nie auth-login. Bierzemy user_id z team_members, a email do
// generate_link z GET /auth/v1/admin/users/{user_id} — inaczej trafiamy w duplikat
// konta i RLS zwraca 0 wierszy BEZ błędu (fałszywy „pusty panel").
async function mintTeamJwt(serviceKey) {
  const adminHdr = { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, 'content-type': 'application/json' };

  // 1) dowolny członek zespołu
  const tm = await hfetch(`${SUPABASE_URL}/rest/v1/team_members?select=user_id&limit=1`, { headers: adminHdr });
  const userId = Array.isArray(tm.json) && tm.json[0] ? tm.json[0].user_id : null;
  if (!userId) die(`nie udało się odczytać team_members (status ${tm.status})`);

  // 2) realny email logowania z auth.users
  const au = await hfetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, { headers: adminHdr });
  const email = au.json?.email || null;
  if (!email) die(`brak emaila auth dla user_id (status ${au.status})`);

  // 3) magiclink → hashed_token
  const gl = await hfetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: 'POST', headers: adminHdr, body: JSON.stringify({ type: 'magiclink', email }),
  });
  const hashed = gl.json?.hashed_token || gl.json?.properties?.hashed_token || null;
  if (!hashed) die(`generate_link nie zwrócił hashed_token (status ${gl.status})`);

  // 4) verify → access_token (JWT zespołu, ~1 h)
  const vr = await hfetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'magiclink', token_hash: hashed }),
  });
  const token = vr.json?.access_token || null;
  if (!token) die(`verify nie zwrócił access_token (status ${vr.status})`);
  return token; // TYLKO w pamięci — nigdzie nie logujemy ani nie zapisujemy
}

// ── PostgREST z JWT zespołu (apikey = publishable, jak panel) ────────────────
function restGet(jwt, path) {
  return hfetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: PUBLISHABLE_KEY, authorization: `Bearer ${jwt}` },
  });
}

// ── wywołanie silnika z retry (1×) i klasyfikacją odpowiedzi ─────────────────
// Zwraca:
//   { ok:true, json }                         — sukces
//   { hardStop:true, reason:'dzienny_limit' } — dzienny limit AI → STOP partii
//   { ok:false, error, status }               — pad (po ewentualnym retry)
async function callEngine(jwt, action, prospectId) {
  const body = JSON.stringify({ action, prospectId });
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await hfetch(WFP_ENGINE, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: PUBLISHABLE_KEY, authorization: `Bearer ${jwt}` },
      body,
    });
    if (r.ok) return { ok: true, json: r.json || {} };

    const code = r.json?.error || null;
    // Dzienny limit AI = twardy STOP (nie retry) — chronimy wspólną quotę.
    if (code === 'dzienny_limit') return { hardStop: true, reason: 'dzienny_limit' };

    // 429 (rate) / 5xx / blip sieci → jeden retry po 30 s.
    const retryable = r.status === 429 || r.status >= 500 || r.status === 0;
    if (retryable && attempt === 0) {
      warn(`${action}: ${code || r.status} — retry za ${RETRY_WAIT_MS / 1000} s`);
      await sleep(RETRY_WAIT_MS);
      continue;
    }
    return { ok: false, error: code || `http_${r.status}`, status: r.status };
  }
  return { ok: false, error: 'retry_wyczerpany', status: 0 };
}

// ── plan kroków dla prospekta (wznawialność) ─────────────────────────────────
// Buduje listę akcji AI do wykonania na podstawie OBECNOŚCI pól w bazie.
function planFor(p) {
  const steps = [];
  if (!isObj(p.research)) steps.push('research');
  const ideaExists = isObj(p.idea);
  const blocked = ideaExists && ideaBlocked(p.idea);
  if (!ideaExists) steps.push('idea');
  // mail tylko gdy pomysł nie jest zablokowany saturacją (silnik i tak odrzuci mail dla zablokowanego)
  if (!isObj(p.mail) && !blocked) steps.push('mail');
  return { steps, blockedAlready: blocked };
}

// ── koszt partii z wfp_usage (TYLKO nasze prospekty, od startu — bez zanieczyszczenia
//    równoległymi procesami) ───────────────────────────────────────────────────
async function batchCostUsd(jwt, prospectIds, startIso) {
  let sum = 0;
  for (let i = 0; i < prospectIds.length; i += 50) {
    const chunk = prospectIds.slice(i, i + 50);
    const inList = chunk.join(',');
    const r = await restGet(jwt, `wfp_usage?select=cost_usd&created_at=gte.${encodeURIComponent(startIso)}&prospect_id=in.(${inList})`);
    if (Array.isArray(r.json)) for (const row of r.json) sum += Number(row.cost_usd) || 0;
  }
  return sum;
}

// ── kurs USD→PLN z NBP (fallback 4.0) ────────────────────────────────────────
async function usdPln() {
  try {
    const r = await hfetch('https://api.nbp.pl/api/exchangerates/rates/c/usd?format=json', {}, 8000);
    const rate = r.json?.rates?.[0]?.ask;
    return (typeof rate === 'number' && rate > 0) ? rate : USD_PLN_FALLBACK;
  } catch { return USD_PLN_FALLBACK; }
}

// ════════════════════════════════════════════════════════════════════════════
(async () => {
  const startedAt = Date.now();
  const startIso = new Date().toISOString();
  log(`start · wertykał='${VERTICAL_KEY}' · limit=${LIMIT} · statusy=[${STATUSES.join(',')}]${DRY ? ' · DRY-RUN (tylko odczyt)' : ''}`);

  const serviceKey = readServiceKey();
  log('mint JWT zespołu…');
  const jwt = await mintTeamJwt(serviceKey);
  log('JWT gotowy (w pamięci procesu).');

  // ── wertykał: id + status + nazwa ──────────────────────────────────────────
  const vr = await restGet(jwt, `wfp_verticals?select=id,name,status,key&key=eq.${encodeURIComponent(VERTICAL_KEY)}`);
  const vert = Array.isArray(vr.json) && vr.json[0] ? vr.json[0] : null;
  if (!vert) die(`nie znaleziono wertykalu o key='${VERTICAL_KEY}' (status ${vr.status})`);
  log(`wertykał: „${vert.name}" (status: ${vert.status})`);

  // Bramka pomysłu w silniku: zajety/odrzucony blokuje akcję `idea` → firmy utknęłyby
  // po researchu (zmarnowana quota). Zatrzymujemy się PRZED wydatkiem.
  if (vert.status === 'zajety' || vert.status === 'odrzucony') {
    die(`wertykał w statusie '${vert.status}' — silnik zablokuje krok 'idea'. ` +
        `Zmień status wertykalu (Wertykale) zanim uruchomisz partię.`);
  }

  // ── selekcja prospektów: status ∈ STATUSES, email≠NULL, nie opt-out, nie test.
  //    Sort: z www NAJPIERW (nullslast), potem najświeżej aktualizowane. ──────
  const statusIn = STATUSES.join(',');
  const q = `wfp_prospects?select=id,company_name,www,email,city,status,research,idea,mail,score`
    + `&vertical_id=eq.${vert.id}`
    + `&status=in.(${statusIn})`
    + `&email=not.is.null`
    + `&opted_out=is.false`
    + `&is_test=is.false`
    + `&order=www.asc.nullslast,updated_at.desc`
    + `&limit=${LIMIT}`;
  const pr = await restGet(jwt, q);
  if (!Array.isArray(pr.json)) die(`nie udało się pobrać prospektów (status ${pr.status}): ${String(pr.text).slice(0, 200)}`);
  const prospects = pr.json;

  if (!prospects.length) {
    log(`brak firm do przetworzenia (wertykał '${VERTICAL_KEY}', statusy [${statusIn}], z e-mailem). Kończę.`);
    return;
  }
  log(`wybrano ${prospects.length} firm (z www najpierw).`);

  // ── DRY-RUN: pokaż plan i szacunkowy koszt, bez wywołań silnika ────────────
  if (DRY) {
    const rate = await usdPln();
    console.log('');
    log('── PLAN (dry-run) ─────────────────────────────────────');
    let aiActions = 0;
    prospects.forEach((p, i) => {
      const { steps, blockedAlready } = planFor(p);
      aiActions += steps.length;
      const www = p.www ? '' : ' [bez www]';
      const label = blockedAlready ? 'POMINIĘTA (pomysł zablokowany saturacją)'
        : steps.length ? `→ ${steps.join(' → ')}`
        : 'GOTOWA (mail już jest) — pomijam';
      console.log(`  ${String(i + 1).padStart(2)}. ${(p.company_name || '?').slice(0, 42).padEnd(42)} [${p.status}]${www}  ${label}`);
    });
    // Szacunek: ~1,55 zł za pełen komplet 3 akcji → proporcjonalnie do liczby akcji AI.
    const estPln = (aiActions / 3) * 1.55;
    console.log('');
    log(`łącznie akcji AI do wykonania: ${aiActions} (research/idea/mail)`);
    log(`szacowany koszt partii: ~${estPln.toFixed(2)} zł (≈1,55 zł/pełną firmę; kurs USD ${rate.toFixed(3)})`);
    log('DRY-RUN — nic nie wywołano. Usuń --dry, by uruchomić cykl.');
    return;
  }

  // ── EGZEKUCJA sekwencyjna ──────────────────────────────────────────────────
  const counts = { done: 0, alreadyDone: 0, blocked: 0, failed: 0 };
  const processedIds = [];
  let consecFail = 0;
  let stoppedReason = null;

  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i];
    const tag = `[${i + 1}/${prospects.length}] ${(p.company_name || '?').slice(0, 40)}`;
    processedIds.push(p.id);

    const { steps, blockedAlready } = planFor(p);
    if (blockedAlready) { log(`${tag}: pomysł zablokowany saturacją — pomijam.`); counts.blocked++; consecFail = 0; continue; }
    if (!steps.length) { log(`${tag}: mail już gotowy — pomijam.`); counts.alreadyDone++; consecFail = 0; continue; }

    log(`${tag}: ${steps.join(' → ')}`);
    let failed = false, becameBlocked = false;

    for (const action of steps) {
      const t0 = Date.now();
      const res = await callEngine(jwt, action, p.id);

      if (res.hardStop) {
        stoppedReason = `dzienny limit AI (wfp_daily_cap) — silnik odmówił dalszych generacji`;
        break;
      }
      if (!res.ok) {
        warn(`${tag}: krok '${action}' pad (${res.error}) — przerywam tę firmę.`);
        failed = true;
        break;
      }
      log(`   ✓ ${action} (${fmtDur(Date.now() - t0)})${action === 'research' && typeof res.json.score === 'number' ? ` · score ${res.json.score}` : ''}`);

      // Pomysł zablokowany saturacją → nie ma sensu pisać maila.
      if (action === 'idea' && res.json.blocked) { becameBlocked = true; break; }

      await sleep(BETWEEN_ACTIONS_MS);
    }

    if (stoppedReason) break; // twardy STOP z pętli akcji

    if (becameBlocked) { log(`${tag}: pomysł zablokowany (saturacja) — bez maila.`); counts.blocked++; consecFail = 0; }
    else if (failed) {
      counts.failed++;
      consecFail++;
      if (consecFail >= MAX_CONSEC_FAIL) { stoppedReason = `${MAX_CONSEC_FAIL} kolejne pady różnych firm — STOP (ochrona quoty)`; break; }
    } else { log(`${tag}: → mail_gotowy ✓`); counts.done++; consecFail = 0; }

    if (i < prospects.length - 1) await sleep(BETWEEN_PROSPECTS_MS);
  }

  // ── PODSUMOWANIE ───────────────────────────────────────────────────────────
  const rate = await usdPln();
  const costUsd = await batchCostUsd(jwt, processedIds, startIso);
  console.log('');
  log('══════════ PODSUMOWANIE PARTII ══════════');
  if (stoppedReason) warn(`PRZERWANO: ${stoppedReason}`);
  log(`→ mail_gotowy (nowe):     ${counts.done}`);
  log(`→ już gotowe (pominięte): ${counts.alreadyDone}`);
  log(`→ zablokowane (saturacja):${counts.blocked}`);
  log(`→ pady:                   ${counts.failed}`);
  log(`koszt partii (nasze firmy, od startu): $${costUsd.toFixed(4)} ≈ ${fmtPln(costUsd, rate)} (kurs USD ${rate.toFixed(3)})`);
  log(`czas trwania:             ${fmtDur(Date.now() - startedAt)}`);
  log('gotowe.');
})().catch((e) => die(e?.message || String(e)));
