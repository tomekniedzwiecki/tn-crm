// F2 batch 2 (POPRAWIONE): landing/prototype — SYSTEM_PROMPT/CRITIC_SYSTEM zawierają backticki
// (przykłady kodu), więc ekstrakcja MUSI pomijać escapowane `\`` i ewaluować literal do wartości runtime.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const envUrl = new URL('../.env', import.meta.url);
try { for (const line of readFileSync(envUrl, 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); } } catch (e) { console.error('Brak .env:', e.message); }
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('BRAK SUPABASE_SERVICE_KEY'); process.exit(1); }
const supabase = createClient('https://yxmavwkwnfuphjqbelws.supabase.co', KEY);

const ANCHOR = 'const gen = await openaiChat(apiKey, SYSTEM_PROMPT,';
const SPECS = [
  { file: 'spar-landing', consts: [['SYSTEM_PROMPT', 'aplikacja_prompt_landing_system'], ['CRITIC_SYSTEM', 'aplikacja_prompt_landing_critic']] },
  { file: 'spar-prototype', consts: [['SYSTEM_PROMPT', 'aplikacja_prompt_prototype_system'], ['CRITIC_SYSTEM', 'aplikacja_prompt_prototype_critic']] },
];

// znajdź zamykający backtick pomijając escapowane (\X przeskakuje 2 znaki)
function findClose(src, open) {
  let i = open + 1;
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === '`') return i;
    i++;
  }
  return -1;
}
function span(src, name) {
  const a = 'const ' + name + ' = `';
  const s = src.indexOf(a);
  if (s === -1) throw new Error('brak const ' + name);
  if (src.indexOf(a, s + 1) !== -1) throw new Error('NIEUNIKALNE ' + name);
  const open = s + a.length - 1;
  const close = findClose(src, open);
  if (close === -1) throw new Error('niedomkniety ' + name);
  return { s, open, close };
}
function runtimeValue(raw, name) {
  if (/(?<!\\)\$\{/.test(raw)) throw new Error('INTERPOLACJA ${} w ' + name + ' — NIE wynosimy (nie statyczny)');
  // raw to ciało template literal (tylko escapowane backticki w środku) → eval rozwiązuje \`, \\, \n itd.
  return eval('`' + raw + '`');
}

// FAZA 1: SEED (z oryginałów)
const seeded = [];
for (const spec of SPECS) {
  const src = readFileSync(new URL('../supabase/functions/' + spec.file + '/index.ts', import.meta.url), 'utf8');
  for (const [name, key] of spec.consts) {
    const { open, close } = span(src, name);
    seeded.push([key, runtimeValue(src.slice(open + 1, close), name)]);
  }
}
for (const [key, val] of seeded) {
  const { error } = await supabase.from('settings').upsert([{ key, value: val }], { onConflict: 'key' });
  if (error) throw new Error('seed ' + key + ': ' + error.message);
  console.log('SEED', key, '(' + val.length + ' zn.)');
}

// FAZA 2: WIRE (const->let + load przed ANCHOR)
for (const spec of SPECS) {
  const path = new URL('../supabase/functions/' + spec.file + '/index.ts', import.meta.url);
  let src = readFileSync(path, 'utf8');
  for (const [name] of spec.consts) {
    const { s, close } = span(src, name);
    let end = close + 1; if (src[end] === ';') end++;
    src = src.slice(0, s) + "let " + name + " = ''" + src.slice(end);
  }
  const i = src.indexOf(ANCHOR);
  if (i === -1) throw new Error('brak ANCHOR w ' + spec.file);
  if (src.indexOf(ANCHOR, i + 1) !== -1) throw new Error('ANCHOR nieunikalny w ' + spec.file);
  const lineStart = src.lastIndexOf('\n', i) + 1;
  const indent = src.slice(lineStart, i);
  const keysArr = spec.consts.map(([, k]) => "'" + k + "'").join(', ');
  const assigns = spec.consts.map(([n, k]) => n + " = __pv('" + k + "')").join('; ');
  const load = indent + "if (!SYSTEM_PROMPT) { try { const { data: __pd } = await supabase.from('settings').select('key, value').in('key', [" + keysArr + "]); const __pv = (k: string) => ((__pd || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''; " + assigns + " } catch (_e) { /* fallback: puste prompty */ } }\n";
  src = src.slice(0, lineStart) + load + src.slice(lineStart);
  writeFileSync(path, src, 'utf8');
  console.log('WIRE', spec.file, '— const->let x' + spec.consts.length + ', load przed openaiChat');
}
console.log('done');
