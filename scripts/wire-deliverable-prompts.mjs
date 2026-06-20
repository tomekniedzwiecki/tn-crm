// Chirurgia plan/economics/gtm: const SYSTEM_PROMPT/CHANNELS_SYSTEM/ADS_SYSTEM -> let '' + load z settings.
// Nazwy zmiennych ZOSTAJĄ → użycia nietknięte. Load wstrzykiwany po (identycznej) linii MODEL_BLOCK.
// Fail-safe: brak/nieunikalny anchor → throw przed zapisem.
import { readFileSync, writeFileSync } from 'fs';

const MB_LINE = "    if (!MODEL_BLOCK) { try { const { data: mb } = await supabase.from('settings').select('value').eq('key', 'aplikacja_model_biznesowy').single(); MODEL_BLOCK = (mb as { value?: string } | null)?.value || '' } catch (_e) { /* fallback: pusty blok */ } }";

const SPECS = [
  { file: 'spar-plan', consts: [['SYSTEM_PROMPT', 'aplikacja_prompt_plan_system']] },
  { file: 'spar-economics', consts: [['SYSTEM_PROMPT', 'aplikacja_prompt_economics_system']] },
  { file: 'spar-gtm', consts: [['SYSTEM_PROMPT', 'aplikacja_prompt_gtm_system'], ['CHANNELS_SYSTEM', 'aplikacja_prompt_gtm_channels'], ['ADS_SYSTEM', 'aplikacja_prompt_gtm_ads']] },
];

function cutConst(src, name) {
  const anchor = 'const ' + name + ' = `';
  const start = src.indexOf(anchor);
  if (start === -1) throw new Error('brak const ' + name);
  if (src.indexOf(anchor, start + 1) !== -1) throw new Error('NIEUNIKALNE const ' + name);
  const open = start + anchor.length - 1;
  const close = src.indexOf('`', open + 1);
  if (close === -1) throw new Error('niedomkniety ' + name);
  let end = close + 1;
  if (src[end] === ';') end++;
  return src.slice(0, start) + "let " + name + " = ''" + src.slice(end);
}

for (const spec of SPECS) {
  const path = new URL('../supabase/functions/' + spec.file + '/index.ts', import.meta.url);
  let src = readFileSync(path, 'utf8');
  for (const [name] of spec.consts) src = cutConst(src, name);
  const i = src.indexOf(MB_LINE);
  if (i === -1) throw new Error('brak MB_LINE w ' + spec.file);
  if (src.indexOf(MB_LINE, i + 1) !== -1) throw new Error('MB_LINE nieunikalne w ' + spec.file);
  const firstVar = spec.consts[0][0];
  const keysArr = spec.consts.map(([, k]) => "'" + k + "'").join(', ');
  const assigns = spec.consts.map(([n, k]) => n + " = __pv('" + k + "')").join('; ');
  const loadLine = "\n    if (!" + firstVar + ") { try { const { data: __pd } = await supabase.from('settings').select('key, value').in('key', [" + keysArr + "]); const __pv = (k: string) => ((__pd || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''; " + assigns + " } catch (_e) { /* fallback: puste prompty */ } }";
  const at = i + MB_LINE.length;
  src = src.slice(0, at) + loadLine + src.slice(at);
  writeFileSync(path, src, 'utf8');
  console.log('OK', spec.file, '— const->let x' + spec.consts.length + ', load wstrzykniety');
}
console.log('done');
