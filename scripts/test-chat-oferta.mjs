// Live-test: czy czat sparingu (spar-chat) personalizuje odpowiedzi OFERTOWE pod
// ustalony zielony werdykt (wstrzyknięta karta projektu). Tworzy zielone sesje
// TESTOWE z rozpoznawalnymi ekranami, zadaje pytania ofertowe przez realny czat,
// sprawdza czy odpowiedź cytuje TE ekrany + kanoniczną cenę, nie ogólniki.
// Sesje is_test=true, sprzątane na końcu. NIE dotyka realnych leadów.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

const envUrl = new URL('../.env', import.meta.url);
for (const line of readFileSync(envUrl, 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const SERVICE = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const URL_ = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const BASE = URL_ + '/functions/v1';
const supabase = createClient(URL_, SERVICE);

async function chat(payload) {
  const res = await fetch(BASE + '/spar-chat', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SERVICE }, body: JSON.stringify(payload) });
  if (!res.ok) return { ok: false, status: res.status, text: await res.text().catch(() => '') };
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let buf = '', text = '';
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, idx); buf = buf.slice(idx + 2);
      const dl = chunk.split('\n').find((l) => l.startsWith('data:'));
      if (dl) { const j = dl.slice(5).trim(); if (j && j !== '[DONE]') { try { const ev = JSON.parse(j); if (ev?.delta?.text) text += ev.delta.text; } catch { /* */ } } }
    }
  }
  return { ok: true, text };
}

const projekty = [
  {
    nazwa: 'TerminarzGroomera',
    brief: { nazwa: 'TerminarzGroomera', opis: 'Umawianie wizyt i przypomnienia SMS dla groomerów psów.', dla_kogo: 'groomerzy psów', ekrany: ['Kalendarz wizyt groomera', 'Karta psa z historią strzyżeń', 'Przypomnienia SMS do właścicieli'], widoki: { panel: 'kalendarz wizyt', glowna: 'karta psa', dodatkowa: 'przypomnienia SMS', landing: 'strona zapisu' } },
    plan: { cena: 99, cena_jednostka: 'zł/mies.', kamienie: [{ mies: 5000, klienci: 50 }] },
    ekranyKlucze: ['Kalendarz wizyt', 'Karta psa', 'Przypomnienia SMS'],
    proby: [
      { q: 'Co dokładnie wchodzi w cenę? Poproszę o spisaną listę funkcji i ekranów, które dostanę.', oczekuj: 'ekrany' },
      { q: 'A co NIE wchodzi w tę cenę?', oczekuj: 'sms' },
    ],
  },
  {
    nazwa: 'FakturkaMechanika',
    brief: { nazwa: 'FakturkaMechanika', opis: 'Szybkie faktury i historia pojazdu po VIN dla warsztatów.', dla_kogo: 'warsztaty samochodowe', ekrany: ['Szybka faktura z telefonu', 'Lista zleceń warsztatu', 'Historia pojazdu po VIN'], widoki: { panel: 'lista zleceń', glowna: 'faktura', dodatkowa: 'historia VIN', landing: 'strona' } },
    plan: { cena: 129, cena_jednostka: 'zł/mies.', kamienie: [{ mies: 6450, klienci: 50 }] },
    ekranyKlucze: ['faktur', 'Lista zleceń', 'VIN', 'Historia pojazdu'],
    proby: [
      { q: 'Poproszę listę ekranów i funkcji, które dostanę w tej cenie.', oczekuj: 'ekrany' },
    ],
  },
];

const out = [];
const has = (t, arr) => arr.filter((k) => t.toLowerCase().includes(k.toLowerCase()));
const hasPrice = (t) => /12\s?500|12\s?000|15\s?375/.test(t);

const ids = [];
try {
  for (const p of projekty) {
    const sid = randomUUID(); ids.push(sid);
    const ins = await supabase.from('spar_sessions').insert({ id: sid, is_test: true, email: 'czat-oferta@test.local', name: 'Test Oferta', verdict: 'zielony', idea_source: 'wlasny', profession: p.brief.dla_kogo, preview_brief: p.brief, problem_summary: { problem: p.brief.opis, dla_kogo: p.brief.dla_kogo }, business_plan: p.plan, turns: 6 });
    if (ins.error) throw new Error('insert ' + p.nazwa + ': ' + ins.error.message);
    console.log('\n══════ ' + p.nazwa + ' (zielony werdykt, ekrany: ' + p.brief.ekrany.join(' / ') + ') ══════');
    for (const pr of p.proby) {
      const r = await chat({ sessionId: sid, message: pr.q });
      if (!r.ok) { out.push({ p: p.nazwa, ok: false, det: 'HTTP ' + r.status }); console.log('FAIL czat: HTTP ' + r.status + ' ' + (r.text || '').slice(0, 200)); continue; }
      const t = r.text || '';
      console.log('\n❓ ' + pr.q);
      console.log('🤖 ' + t.replace(/\n+/g, ' ').trim());
      let ok, det;
      if (pr.oczekuj === 'ekrany') {
        const hit = has(t, p.ekranyKlucze);
        ok = hit.length >= 1 && hasPrice(t);
        det = 'ekrany cytowane: [' + hit.join(', ') + '] · cena: ' + (hasPrice(t) ? 'tak' : 'NIE');
      } else if (pr.oczekuj === 'sms') {
        ok = /sms|bramk|koszt.*(sms|wiadomo)|wysyłk/i.test(t);
        det = 'wskazał zmienny koszt SMS/bramki: ' + (ok ? 'tak' : 'NIE');
      }
      out.push({ p: p.nazwa, q: pr.q, ok, det });
      console.log((ok ? '✅ OK' : '⚠️  SPRAWDŹ') + ' — ' + det);
    }
  }
} catch (e) { console.log('PRZERWANO: ' + e.message); out.push({ ok: false, det: e.message }); }
finally {
  for (const sid of ids) { for (const tb of ['spar_messages', 'spar_usage', 'spar_emails']) await supabase.from(tb).delete().eq('session_id', sid); await supabase.from('spar_sessions').delete().eq('id', sid); }
  console.log('\nposprzątano sesje testowe: ' + ids.length);
}
const pass = out.filter((r) => r.ok).length;
console.log('\n=== ' + pass + '/' + out.length + ' prób OK (cytuje ustalone ekrany + cena / koszt zmienny) ===');
