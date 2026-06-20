// Seed system-promptów deliverables (plan/economics/gtm) ze stałych w kodzie do settings,
// BYTE-EXACT. Uruchom: node tn-crm/scripts/seed-deliverable-prompts.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envUrl = new URL('../.env', import.meta.url);
try {
  for (const line of readFileSync(envUrl, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) { console.error('Brak .env:', e.message); }

const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('BRAK SUPABASE_SERVICE_KEY'); process.exit(1); }
const supabase = createClient('https://yxmavwkwnfuphjqbelws.supabase.co', KEY);

function extractConst(src, name) {
  const anchor = 'const ' + name + ' = `';
  const start = src.indexOf(anchor);
  if (start === -1) return null;
  const open = start + anchor.length - 1;
  const close = src.indexOf('`', open + 1);
  if (close === -1) return null;
  return src.slice(open + 1, close);
}

const SPECS = [
  { file: 'spar-plan', consts: [['SYSTEM_PROMPT', 'aplikacja_prompt_plan_system']] },
  { file: 'spar-economics', consts: [['SYSTEM_PROMPT', 'aplikacja_prompt_economics_system']] },
  { file: 'spar-gtm', consts: [['SYSTEM_PROMPT', 'aplikacja_prompt_gtm_system'], ['CHANNELS_SYSTEM', 'aplikacja_prompt_gtm_channels'], ['ADS_SYSTEM', 'aplikacja_prompt_gtm_ads']] },
];

let ok = 0, fail = 0;
for (const spec of SPECS) {
  const src = readFileSync(new URL('../supabase/functions/' + spec.file + '/index.ts', import.meta.url), 'utf8');
  for (const [name, key] of spec.consts) {
    const val = extractConst(src, name);
    if (val == null) { console.error('NIE ZNALEZIONO', spec.file, name); fail++; continue; }
    if (val.includes('${')) { console.error('⚠️ INTERPOLACJA w', name, '— pomijam (nie statyczny)'); fail++; continue; }
    const { error } = await supabase.from('settings').upsert([{ key, value: val }], { onConflict: 'key' });
    if (error) { console.error('ERR', key, error.message); fail++; }
    else { console.log('OK ', key, '(' + val.length + ' zn.)'); ok++; }
  }
}
console.log(`\nGotowe: ${ok} OK, ${fail} błędów`);
process.exit(fail ? 1 : 0);
