// Weryfikacja runtime-fidelity F3: czyta zaseedowane wartości z settings, rozwiązuje
// placeholdery TAK JAK runtime, porównuje z eval ze źródła. Symuluje dokładnie to,
// co złoży edge function. Każdy mismatch = throw.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const envUrl = new URL('../.env', import.meta.url);
for (const line of readFileSync(envUrl, 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient('https://yxmavwkwnfuphjqbelws.supabase.co', KEY);

function findClose(src, open) { let i = open + 1; while (i < src.length) { if (src[i] === '\\') { i += 2; continue; } if (src[i] === '`') return i; i++; } return -1; }
function rawSpan(src, decl) { const s = src.indexOf(decl); const open = s + decl.length - 1; return src.slice(open + 1, findClose(src, open)); }
const sub = (t, a, b) => t.split(a).join(b);

const fsrc = readFileSync(new URL('../supabase/functions/spar-followups/index.ts', import.meta.url), 'utf8');
const dsrc = readFileSync(new URL('../supabase/functions/spar-drip/index.ts', import.meta.url), 'utf8');

const { data } = await supabase.from('settings').select('key, value').in('key', [
  'aplikacja_mail_sytuacja', 'aplikacja_mail_email_system', 'aplikacja_mail_sequence_system', 'aplikacja_mail_cele',
  'aplikacja_drip_sytuacja', 'aplikacja_drip_system', 'aplikacja_drip_cele', 'aplikacja_model_biznesowy',
]);
const g = (k) => (data || []).find((r) => r.key === k)?.value || '';

let fails = 0;
function eq(label, a, b) { const ok = a === b; if (!ok) { fails++; console.log('FAIL ' + label + ' (db=' + a.length + ' vs orig=' + b.length + ')'); const i = [...a].findIndex((c, j) => c !== b[j]); console.log('  pierwsza różnica @', i, JSON.stringify(a.slice(Math.max(0, i - 20), i + 20)), 'vs', JSON.stringify(b.slice(Math.max(0, i - 20), i + 20))); } else console.log('OK   ' + label + ' (' + a.length + ' zn.)'); }

// followups
const F_SIT = eval('`' + rawSpan(fsrc, 'const SITUATION = `') + '`');
{ const SITUATION = F_SIT; const orig = eval('`' + rawSpan(fsrc, 'const EMAIL_SYSTEM = `') + '`'); eq('EMAIL_SYSTEM', sub(g('aplikacja_mail_email_system'), '{{SYTUACJA}}', g('aplikacja_mail_sytuacja')), orig); }
{ const SITUATION = F_SIT; const orig = eval('`' + rawSpan(fsrc, 'const SEQUENCE_SYSTEM = `') + '`'); eq('SEQUENCE_SYSTEM', sub(g('aplikacja_mail_sequence_system'), '{{SYTUACJA}}', g('aplikacja_mail_sytuacja')), orig); }
eq('mail SITUATION', g('aplikacja_mail_sytuacja'), F_SIT);

// drip
const D_SIT = eval('`' + rawSpan(dsrc, 'const SITUATION = `') + '`');
{ const SITUATION = D_SIT; const MODEL_BLOCK = g('aplikacja_model_biznesowy'); const orig = eval('`' + rawSpan(dsrc, 'const SYSTEM = `') + '`');
  const runtime = sub(sub(g('aplikacja_drip_system'), '{{SYTUACJA}}', D_SIT), '{{MODEL_BLOCK}}', MODEL_BLOCK);
  eq('drip SYSTEM (z aktualnym MODEL_BLOCK)', runtime, orig); }
eq('drip SITUATION', g('aplikacja_drip_sytuacja'), D_SIT);

// cele — parse + per-key includes w źródle
const FC = JSON.parse(g('aplikacja_mail_cele')); const DC = JSON.parse(g('aplikacja_drip_cele'));
for (const [k, v] of Object.entries(FC)) { if (!fsrc.includes(v)) { fails++; console.log('FAIL cel followups ' + k); } }
for (const [k, v] of Object.entries(DC)) { if (!dsrc.includes(v)) { fails++; console.log('FAIL cel drip ' + k); } }
console.log('cele followups:', Object.keys(FC).length, '| cele drip:', Object.keys(DC).length, '— wszystkie dosłownie w źródle:', fails === 0 ? 'TAK' : 'NIE');

console.log('\n=== ' + (fails === 0 ? 'WSZYSTKO 1:1 — fidelity potwierdzone' : fails + ' NIEZGODNOŚCI') + ' ===');
process.exit(fails === 0 ? 0 : 1);
