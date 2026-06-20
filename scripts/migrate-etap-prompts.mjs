// F4: instrukcje etapów spar-chat (GATE/KIERUNKI/PREVIEW/COLLAB/RESIGNATION) -> settings.
// const->let (nazwy zostaja, uzycia nietkniete) + load przed blokiem sessionContext.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const envUrl = new URL('../.env', import.meta.url);
try { for (const line of readFileSync(envUrl, 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); } } catch (e) { console.error('Brak .env:', e.message); }
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('BRAK SUPABASE_SERVICE_KEY'); process.exit(1); }
const supabase = createClient('https://yxmavwkwnfuphjqbelws.supabase.co', KEY);

const FILE = 'spar-chat';
const ANCHOR = '      const asmt = existingSession?.assessment as Record<string, unknown> | null';
const CONSTS = [
  ['GATE_INSTRUCTION', 'aplikacja_etap_gate'],
  ['KIERUNKI_INSTRUCTION', 'aplikacja_etap_kierunki'],
  ['PREVIEW_AFTER_GATE_INSTRUCTION', 'aplikacja_etap_preview_po_kierunku'],
  ['COLLAB_PHASE_INSTRUCTION', 'aplikacja_etap_wspolpraca'],
  ['RESIGNATION_INSTRUCTION', 'aplikacja_etap_rezygnacja'],
];

function findClose(src, open) { let i = open + 1; while (i < src.length) { if (src[i] === '\\') { i += 2; continue; } if (src[i] === '`') return i; i++; } return -1; }
function span(src, name) {
  const a = 'const ' + name + ' = `'; const s = src.indexOf(a);
  if (s === -1) throw new Error('brak const ' + name);
  if (src.indexOf(a, s + 1) !== -1) throw new Error('NIEUNIKALNE ' + name);
  const open = s + a.length - 1, close = findClose(src, open);
  if (close === -1) throw new Error('niedomkniety ' + name);
  return { s, open, close };
}
function runtimeValue(raw, name) {
  if (/(?<!\\)\$\{/.test(raw)) throw new Error('INTERPOLACJA ${} w ' + name + ' — NIE wynosimy');
  return eval('`' + raw + '`');
}

const path = new URL('../supabase/functions/' + FILE + '/index.ts', import.meta.url);

// SEED z oryginalu
const orig = readFileSync(path, 'utf8');
const seeded = [];
for (const [name, key] of CONSTS) { const { open, close } = span(orig, name); seeded.push([key, runtimeValue(orig.slice(open + 1, close), name)]); }
for (const [key, val] of seeded) { const { error } = await supabase.from('settings').upsert([{ key, value: val }], { onConflict: 'key' }); if (error) throw new Error('seed ' + key + ': ' + error.message); console.log('SEED', key, '(' + val.length + ' zn.)'); }

// WIRE
let src = readFileSync(path, 'utf8');
for (const [name] of CONSTS) { const { s, close } = span(src, name); let end = close + 1; if (src[end] === ';') end++; src = src.slice(0, s) + "let " + name + " = ''" + src.slice(end); }
const i = src.indexOf(ANCHOR);
if (i === -1) throw new Error('brak ANCHOR');
if (src.indexOf(ANCHOR, i + 1) !== -1) throw new Error('ANCHOR nieunikalny');
const lineStart = src.lastIndexOf('\n', i) + 1;
const indent = src.slice(lineStart, i);
const keysArr = CONSTS.map(([, k]) => "'" + k + "'").join(', ');
const assigns = CONSTS.map(([n, k]) => n + " = __ev('" + k + "')").join('; ');
const load = indent + "if (!GATE_INSTRUCTION) { try { const { data: __ep } = await supabase.from('settings').select('key, value').in('key', [" + keysArr + "]); const __ev = (k: string) => ((__ep || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''; " + assigns + " } catch (_e) { /* fallback: puste instrukcje */ } }\n";
src = src.slice(0, lineStart) + load + src.slice(lineStart);
writeFileSync(path, src, 'utf8');
console.log('WIRE spar-chat — const->let x' + CONSTS.length + ', load przed sessionContext');
console.log('done');
