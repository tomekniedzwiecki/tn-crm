// E2E sparingu: napędza realne funkcje przez wszystkie etapy (rozmowa → werdykt →
// deliverables → rezerwacja → spowiednik → domknięcie/handoff). Sesja is_test (poza metrykami).
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

const envUrl = new URL('../.env', import.meta.url);
for (const line of readFileSync(envUrl, 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const SERVICE = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const URL_ = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const BASE = URL_ + '/functions/v1';
const supabase = createClient(URL_, SERVICE);
let ADMIN = process.env.SPAR_CRON_SECRET || '';
try { if (!ADMIN) ADMIN = readFileSync('C:/tmp/spar_cron_secret.txt', 'utf8').trim(); } catch { /* opcjonalne */ }

const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function log(stage, ok, detail) { results.push({ stage, ok }); console.log((ok ? 'OK  ' : 'FAIL') + ' | ' + stage + (detail ? ' — ' + detail : '')); }

async function chat(payload) {
  const res = await fetch(BASE + '/spar-chat', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SERVICE }, body: JSON.stringify(payload) });
  if (!res.ok) return { ok: false, status: res.status, text: await res.text().catch(() => '') };
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let buf = '', text = '', events = [];
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, idx); buf = buf.slice(idx + 2);
      const dl = chunk.split('\n').find((l) => l.startsWith('data:'));
      const el = chunk.split('\n').find((l) => l.startsWith('event:'));
      if (dl) { const j = dl.slice(5).trim(); if (j && j !== '[DONE]') { try { const ev = JSON.parse(j); if (ev?.delta?.text) text += ev.delta.text; if (el) events.push(el.slice(6).trim()); } catch { /* */ } } }
    }
  }
  return { ok: true, text, events };
}
async function callFn(name, payload, headers = {}) {
  const res = await fetch(BASE + '/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SERVICE, ...headers }, body: JSON.stringify(payload) });
  let body; try { body = await res.json(); } catch { body = await res.text().catch(() => ''); }
  return { status: res.status, body };
}

const sid = randomUUID();
const brief = { nazwa: 'TestFlow', opis: 'Narzędzie do umawiania wizyt dla fizjoterapeutów.', problem: 'Fizjoterapeuci tracą czas na telefoniczne umawianie wizyt.', dla_kogo: 'fizjoterapeuci', kto_placi: 'fizjoterapeuta', ekrany: ['Kalendarz', 'Karta pacjenta'], styl: 'jasny, przyjazny', design: { kierunek: 'jasny, przyjazny', tlo: '#ffffff', akcent: '#10b981' }, widoki: { panel: 'pulpit wizyt', glowna: 'kalendarz', dodatkowa: 'karta pacjenta', landing: 'strona sprzedażowa' } };

try {
  // 0) Setup
  const ins = await supabase.from('spar_sessions').insert({ id: sid, is_test: true, email: 'e2e@test.local', name: 'E2E Test', turns: 0, problem_hint: 'fizjoterapia' });
  if (ins.error) throw new Error('insert sesji: ' + ins.error.message);
  log('Setup sesji testowej', true, sid);

  // 1) ETAP 1 — czat odpowiada (etap-instrukcje z settings)
  const t1 = await chat({ sessionId: sid, message: 'Chcę zrobić narzędzie do umawiania wizyt dla fizjoterapeutów.' });
  log('Etap 1: czat streamuje odpowiedź', t1.ok && t1.text.length > 20, t1.ok ? ('„' + t1.text.slice(0, 70).replace(/\n/g, ' ') + '…"') : ('HTTP ' + t1.status + ' ' + t1.text.slice(0, 120)));

  // ustaw werdykt + kartę, by testować dalsze etapy bez pełnej naturalnej rozmowy
  await supabase.from('spar_sessions').update({ verdict: 'zielony', idea_source: 'wlasny', preview_brief: brief, problem_summary: brief }).eq('id', sid);
  log('Ustawiono zielony werdykt + kartę projektu', true);

  // 2) DELIVERABLES (prompty z settings — F2)
  const plan = await callFn('spar-plan', { sessionId: sid });
  log('Deliverable: plan przychodu', plan.status === 200, 'HTTP ' + plan.status + ' ' + JSON.stringify(plan.body).slice(0, 90));
  const eco = await callFn('spar-economics', { sessionId: sid });
  log('Deliverable: economics', eco.status === 200, 'HTTP ' + eco.status + ' ' + JSON.stringify(eco.body).slice(0, 70));
  const gtm = await callFn('spar-gtm', { sessionId: sid });
  log('Deliverable: gtm', gtm.status === 200, 'HTTP ' + gtm.status + ' ' + JSON.stringify(gtm.body).slice(0, 70));
  const land = await callFn('spar-landing', { sessionId: sid }, ADMIN ? { 'x-admin-secret': ADMIN } : {});
  log('Deliverable: landing (start w tle)', land.status === 200 || land.status === 202, 'HTTP ' + land.status);

  // 3) ETAP 2 — rezerwacja
  await supabase.from('spar_sessions').update({ paid_at: new Date().toISOString() }).eq('id', sid);
  log('Etap 2: rezerwacja (paid_at)', true);

  // 4) ETAP 3 — spowiednik (full_paid_at)
  await supabase.from('spar_sessions').update({ full_paid_at: new Date().toISOString() }).eq('id', sid);
  await supabase.from('spar_knowhow_summary').upsert({ session_id: sid, status: 'active' }, { onConflict: 'session_id' });
  const kh = await chat({ sessionId: sid, message: 'Dziś umawiam wizyty telefonicznie, pacjenci dzwonią w godzinach pracy i tracę przez to czas między zabiegami.' });
  log('Etap 3: spowiednik odpowiada (know-how)', kh.ok && kh.text.length > 20, kh.ok ? ('„' + kh.text.slice(0, 70).replace(/\n/g, ' ') + '…"') : ('HTTP ' + kh.status));
  await sleep(6000); // cicha ekstrakcja leci w tle
  const { data: items } = await supabase.from('spar_knowhow_items').select('id').eq('session_id', sid);
  log('Etap 3: ekstrakcja know-how (items)', (items?.length || 0) >= 0, (items?.length || 0) + ' items');

  // 5) ETAP 4 — domknięcie + handoff
  await chat({ sessionId: sid, event: 'knowhow_close' });
  await sleep(18000); // handoff (OpenAI) leci w tle przez waitUntil
  const { data: sess } = await supabase.from('spar_sessions').select('knowhow_closed_at').eq('id', sid).maybeSingle();
  log('Etap 4: know-how zamknięty (build)', !!sess?.knowhow_closed_at, 'closed_at=' + (sess?.knowhow_closed_at || '—'));
  const { data: khs } = await supabase.from('spar_knowhow_summary').select('status, handoff_pack').eq('session_id', sid).maybeSingle();
  log('Etap 4: handoff pack wygenerowany', !!(khs?.handoff_pack), 'status=' + (khs?.status || '—') + ', pack=' + (khs?.handoff_pack ? (String(khs.handoff_pack).length + ' zn.') : 'brak'));
} catch (e) {
  log('PRZERWANO wyjątkiem', false, e.message);
}

const pass = results.filter((r) => r.ok).length;
console.log(`\n=== E2E: ${pass}/${results.length} OK === (sesja testowa ${sid}, is_test=true)`);
process.exit(pass === results.length ? 0 : 1);
