// Jednorazowy seed: wynosi stałe know-how (spowiednik) ze spar-chat/index.ts do settings
// BYTE-EXACT (zero zmiany zachowania). Po seedzie spar-chat czyta z settings, a stałe znikają z kodu.
// Uruchom: node tn-crm/scripts/seed-knowhow-prompts.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// .env (manualnie, jak inne skrypty tn-crm) — ścieżki względem TEGO pliku, nie cwd
const envUrl = new URL('../.env', import.meta.url);
try {
  for (const line of readFileSync(envUrl, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) { console.error('Brak .env:', e.message); }

const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('BRAK SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY w .env'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, KEY);

const src = readFileSync(new URL('../supabase/functions/spar-chat/index.ts', import.meta.url), 'utf8');

// ekstrakcja `const NAME = \`...\`;` — treść bez backticków/${} w środku (statyczne stringi)
function extractConst(name) {
  const anchor = 'const ' + name + ' = `';
  const start = src.indexOf(anchor);
  if (start === -1) return null;
  const open = start + anchor.length - 1;          // pozycja otwierającego backticka
  const close = src.indexOf('`', open + 1);
  if (close === -1) return null;
  return src.slice(open + 1, close);
}

const MAP = {
  KNOWHOW_BASE: 'aplikacja_knowhow_base',
  KNOWHOW_SRC_WLASNY: 'aplikacja_knowhow_src_wlasny',
  KNOWHOW_SRC_AI: 'aplikacja_knowhow_src_ai',
  KNOWHOW_SRC_WSPOLNY: 'aplikacja_knowhow_src_wspolny',
  KNOWHOW_RESUME_INSTRUCTION: 'aplikacja_knowhow_resume',
  KNOWHOW_EXTRACT_PROMPT: 'aplikacja_knowhow_extract',
  HANDOFF_PROMPT: 'aplikacja_knowhow_handoff',
  IDEA_SOURCE_HINT: 'aplikacja_knowhow_idea_source_hint',
};

let ok = 0, fail = 0;
for (const [name, key] of Object.entries(MAP)) {
  const val = extractConst(name);
  if (val == null) { console.error('NIE ZNALEZIONO stałej', name); fail++; continue; }
  const { error } = await supabase.from('settings').upsert([{ key, value: val }], { onConflict: 'key' });
  if (error) { console.error('ERR ', key, error.message); fail++; }
  else { console.log('OK  ', key, '(' + val.length + ' zn.)'); ok++; }
}
console.log(`\nGotowe: ${ok} OK, ${fail} błędów`);
process.exit(fail ? 1 : 0);
