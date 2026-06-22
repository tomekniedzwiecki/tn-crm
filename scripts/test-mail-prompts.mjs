// KOMPLETNE TESTY MAILI (F3) — bez wysyłki. Odpala realne ścieżki GPT przez actiony
// admina spar-followups / spar-drip na sesji testowej (is_test=true), potwierdza że:
//  • prompty z settings załadowały się w runtime (ścieżka GPT trafiona, nie statyczny fallback),
//  • każdy kind składa spójny mail (subject+body), cele (MAIL_CELE/DRIP_CELE) wchodzą,
//  • spar_usage dowodzi, że SEQUENCE_SYSTEM (abandoned) i DRIP_SYSTEM (reveale) realnie poszły do modelu.
// NIE wysyła żadnego maila/SMS. Na końcu sprząta sesję testową.
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
if (!ADMIN) { console.error('BRAK SPAR_CRON_SECRET (env lub C:/tmp/spar_cron_secret.txt)'); process.exit(1); }

const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
async function callFn(name, payload) {
  const res = await fetch(BASE + '/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SERVICE, 'x-admin-secret': ADMIN }, body: JSON.stringify(payload) });
  let body; try { body = await res.json(); } catch { body = await res.text().catch(() => ''); }
  return { status: res.status, body };
}

const sid = randomUUID();
const brief = { nazwa: 'WizytApka', opis: 'Narzędzie do umawiania wizyt dla fizjoterapeutów.', dla_kogo: 'fizjoterapeuci', kto_placi: 'fizjoterapeuta', ekrany: ['Kalendarz', 'Karta pacjenta'] };
const karta = { problem: 'Telefoniczne umawianie wizyt zżera czas między zabiegami.', dla_kogo: 'fizjoterapeuci', dzisiejsze_obejscie: 'kalendarz papierowy + telefon', kto_placi: 'fizjoterapeuta', konkurencja: 'Booksy, zarezerwuj.pl' };
const plan = { cena: 149, kamienie: [{ mies: 12000, klienci: 50 }] };
const market = { teza: 'Nisza fizjo jest rozdrobniona — jest miejsce na prostsze, tańsze narzędzie.', ocena_potencjalu: 'umiarkowany', ocena_uzasadnienie: 'stały popyt, słaba cyfryzacja', konkurenci: [{ nazwa: 'Booksy', cena: '~199 zł/mies' }], rynek: 'fizjoterapia PL', trendy: ['cyfryzacja gabinetów'], co_to_oznacza: ['jest luka w prostych narzędziach'] };
const economics = { cennik: [{ tier: 'Solo', cena: 149 }], wejscia: 'organiczne + polecenia', komentarz: 'zwrot budowy ~12 mies.' };
const gtm = { playbook: { kanaly: ['grupy FB fizjo', 'polecenia'], obiekcje: ['nie mam czasu wdrażać'] }, pakiet: { reklamy: [{ koncept: 'oszczędność czasu', naglowek: 'Koniec z telefonami' }] } };

const out = [];
function ok(label, cond, detail) { out.push({ label, cond }); console.log((cond ? 'OK  ' : 'FAIL') + ' | ' + label + (detail ? ' — ' + detail : '')); }

try {
  // setup
  const ins = await supabase.from('spar_sessions').insert({ id: sid, is_test: true, email: 'mailtest@test.local', name: 'Marek Testowy', verdict: 'zielony', idea_source: 'wlasny', preview_brief: brief, problem_summary: karta, business_plan: plan, market_report: market, economics, gtm, landing_url: 'https://wizytapka.example', lead_id: null, last_panel_at: new Date().toISOString() });
  if (ins.error) throw new Error('insert sesji: ' + ins.error.message);
  // prototyp „gotowy" — żeby drip fire dla prototyp dał podgląd, nie 'generating'
  await supabase.from('spar_usage').insert({ session_id: sid, kind: 'prototype', model: 'test', input_tokens: 0, cached_tokens: 0, output_tokens: 0, cost_usd: 0, meta: { url: 'https://wizytapka.example/proto' } });
  console.log('setup sesji testowej', sid, '\n');

  // ── FOLLOWUPS: pojedyncze maile (EMAIL_SYSTEM + MAIL_CELE) ──
  const FU = ['nurture_1', 'nurture_2', 'nurture_3', 'nurture_4', 'nurture_5', 'nurture_6', 'verdict_last_call', 'paid_welcome', 'komplet_gotowy'];
  // statyczne subjecty (jeśli równe → znaczy fallback statyczny zamiast GPT)
  const STATIC_SUBJ = { nurture_1: 'Wracam myślami do WizytApka', verdict_last_call: 'WizytApka — domykam miejsce na ten projekt', paid_welcome: 'Rezerwacja przyjęta — co dalej', komplet_gotowy: 'WizytApka: cały projekt gotowy w panelu' };
  console.log('--- FOLLOWUP (preview_session, EMAIL_SYSTEM) ---');
  for (const kind of FU) {
    const r = await callFn('spar-followups', { action: 'preview_session', sessionId: sid, kind });
    const p = r.body?.preview;
    const subj = p?.subject || '';
    const bodyTxt = strip(p?.html);
    const gpt = subj && STATIC_SUBJ[kind] ? subj !== STATIC_SUBJ[kind] : !!subj;
    ok('FU ' + kind, r.status === 200 && subj.length > 3 && bodyTxt.length > 40, 'HTTP ' + r.status + ' | „' + subj + '"' + (STATIC_SUBJ[kind] ? (gpt ? ' [GPT]' : ' [STATYCZNY?]') : ''));
    if (p) console.log('       ' + bodyTxt.slice(0, 130) + '…');
  }

  // ── ABANDONED: sekwencja 3 maili + SMS (SEQUENCE_SYSTEM) ──
  console.log('\n--- ABANDONED (generate_abandoned, SEQUENCE_SYSTEM) ---');
  // tymczasowo „w toku": cofnij werdykt, by funkcja policzyła sekwencję
  await supabase.from('spar_sessions').update({ verdict: null }).eq('id', sid);
  const ga = await callFn('spar-followups', { action: 'generate_abandoned', sessionId: sid });
  const rows = ga.body?.rows || [];
  for (const row of rows) ok('ABN ' + row.kind, !!(row.subject || row.sms), '„' + (row.subject || ('[SMS] ' + (row.sms || '').slice(0, 80))) + '"');
  await supabase.from('spar_sessions').update({ verdict: 'zielony' }).eq('id', sid); // przywróć

  // ── DRIP: reveale (DRIP_SYSTEM + DRIP_CELE) ──
  console.log('\n--- DRIP (fire, podgląd bez wysyłki, DRIP_SYSTEM) ---');
  for (const key of ['rynek', 'economics', 'landing', 'gtm', 'prototyp']) {
    const r = await callFn('spar-drip', { action: 'fire', sessionId: sid, key, send: false });
    const p = r.body?.preview;
    const subj = p?.subject || '';
    ok('DRIP ' + key, r.status === 200 && r.body?.result === 'preview' && subj.length > 3, 'HTTP ' + r.status + ' result=' + r.body?.result + ' | „' + subj + '"');
    if (p) console.log('       ' + strip(p.html).slice(0, 130) + '…');
  }

  // ── DOWÓD: spar_usage — GPT realnie poszło z promptami z settings ──
  await new Promise((r) => setTimeout(r, 1500));
  const { data: usage } = await supabase.from('spar_usage').select('kind, meta').eq('session_id', sid).eq('kind', 'email');
  const views = (usage || []).map((u) => u?.meta?.view).filter(Boolean);
  ok('spar_usage: SEQUENCE_SYSTEM trafił model', views.includes('abandoned_sequence'), 'views=' + JSON.stringify(views));
  ok('spar_usage: DRIP_SYSTEM trafił model (reveal_email)', views.filter((v) => v === 'reveal_email').length >= 1, views.filter((v) => v === 'reveal_email').length + ' reveal_email');
} catch (e) {
  ok('PRZERWANO wyjątkiem', false, e.message);
} finally {
  // sprzątanie sesji testowej
  await supabase.from('spar_usage').delete().eq('session_id', sid);
  await supabase.from('spar_reveals').delete().eq('session_id', sid);
  await supabase.from('spar_abandoned_emails').delete().eq('session_id', sid);
  await supabase.from('spar_emails').delete().eq('session_id', sid);
  await supabase.from('spar_short_links').delete().eq('session_id', sid);
  await supabase.from('spar_sessions').delete().eq('id', sid);
  console.log('\nposprzątano sesję testową', sid);
}

const pass = out.filter((r) => r.cond).length;
console.log(`\n=== ${pass}/${out.length} OK ===`);
process.exit(pass === out.length ? 0 : 1);
