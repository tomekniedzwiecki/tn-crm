// Jednorazowa chirurgia spar-chat: usuwa stałe know-how (spowiednik) i wpina odczyt z settings.
// Fail-safe: każdy anchor musi być znaleziony i UNIKALNY, inaczej throw przed zapisem.
import { readFileSync, writeFileSync } from 'fs';

const path = new URL('../supabase/functions/spar-chat/index.ts', import.meta.url);
let src = readFileSync(path, 'utf8');
const before = src.length;

// 1) Wytnij blok stałych: const KNOWHOW_BASE = ` ... ` aż do końca const HANDOFF_PROMPT = ` ... `
const blockStart = src.indexOf('const KNOWHOW_BASE = `');
if (blockStart === -1) throw new Error('brak KNOWHOW_BASE');
const hpAnchor = 'const HANDOFF_PROMPT = `';
const hpStart = src.indexOf(hpAnchor);
if (hpStart === -1) throw new Error('brak HANDOFF_PROMPT');
const hpOpen = hpStart + hpAnchor.length - 1;     // otwierający backtick
const hpClose = src.indexOf('`', hpOpen + 1);      // zamykający backtick
if (hpClose === -1) throw new Error('niedomkniety HANDOFF_PROMPT');
let blockEnd = hpClose + 1;
if (src[blockEnd] === ';') blockEnd++;             // pochłoń ewentualny ;

const INFRA = [
  '// ── Prompty SPOWIEDNIKA (know-how) — JEDYNE źródło = settings (klucze aplikacja_knowhow_*).',
  '// Ładowane raz na cold-start (ensureKnowhowPrompts); pusty fallback to bezpiecznik, nie treść.',
  '// Edycja z panelu „Źródło prawdy". (Faza 1 single-source 2026-06-20.)',
  'let KH_LOADED = false',
  "const KH = { base: '', src_wlasny: '', src_ai: '', src_wspolny: '', resume: '', extract: '', handoff: '', idea_hint: '' }",
  'async function ensureKnowhowPrompts(supabase: ReturnType<typeof createClient>): Promise<void> {',
  '  if (KH_LOADED) return',
  '  try {',
  "    const { data } = await supabase.from('settings').select('key, value').in('key', [",
  "      'aplikacja_knowhow_base', 'aplikacja_knowhow_src_wlasny', 'aplikacja_knowhow_src_ai', 'aplikacja_knowhow_src_wspolny',",
  "      'aplikacja_knowhow_resume', 'aplikacja_knowhow_extract', 'aplikacja_knowhow_handoff', 'aplikacja_knowhow_idea_source_hint',",
  '    ])',
  "    const v = (k: string) => ((data || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''",
  "    KH.base = v('aplikacja_knowhow_base'); KH.src_wlasny = v('aplikacja_knowhow_src_wlasny'); KH.src_ai = v('aplikacja_knowhow_src_ai')",
  "    KH.src_wspolny = v('aplikacja_knowhow_src_wspolny'); KH.resume = v('aplikacja_knowhow_resume'); KH.extract = v('aplikacja_knowhow_extract')",
  "    KH.handoff = v('aplikacja_knowhow_handoff'); KH.idea_hint = v('aplikacja_knowhow_idea_source_hint')",
  '    KH_LOADED = true',
  "  } catch (e) { console.error('[spar-chat] ensureKnowhowPrompts', e) }",
  '}',
  'function knowhowInstruction(ideaSource: string): string {',
  "  const src = ideaSource === 'ai' ? KH.src_ai : ideaSource === 'wspolny' ? KH.src_wspolny : KH.src_wlasny",
  '  return `${KH.base}\\n${src}`',
].join('\n');

src = src.slice(0, blockStart) + INFRA + src.slice(blockEnd);

// 2) Podmiany użyć + 3) wstrzyknięcia ensure — każde unikalne
function replaceOnce(needle, repl) {
  const i = src.indexOf(needle);
  if (i === -1) throw new Error('brak użycia: ' + needle);
  if (src.indexOf(needle, i + 1) !== -1) throw new Error('NIEUNIKALNE: ' + needle);
  src = src.slice(0, i) + repl + src.slice(i + needle.length);
}
replaceOnce('content: KNOWHOW_EXTRACT_PROMPT }', 'content: KH.extract }');
replaceOnce('content: HANDOFF_PROMPT }', 'content: KH.handoff }');
replaceOnce('${KNOWHOW_RESUME_INSTRUCTION}', '${KH.resume}');
replaceOnce('${IDEA_SOURCE_HINT}', '${KH.idea_hint}');
replaceOnce('    const ctx = problemSummary ?', '    await ensureKnowhowPrompts(supabase)\n    const ctx = problemSummary ?');
replaceOnce("    const { data: sess } = await supabase.from('spar_sessions').select('problem_summary, preview_brief, lead_id, idea_source')",
            "    await ensureKnowhowPrompts(supabase)\n    const { data: sess } = await supabase.from('spar_sessions').select('problem_summary, preview_brief, lead_id, idea_source')");
replaceOnce('      const asmt = existingSession?.assessment as Record<string, unknown> | null',
            '      await ensureKnowhowPrompts(supabase)\n      const asmt = existingSession?.assessment as Record<string, unknown> | null');

writeFileSync(path, src, 'utf8');
console.log('zapisano, delta dlugosci:', src.length - before);
for (const n of ['KNOWHOW_BASE','KNOWHOW_SRC_WLASNY','KNOWHOW_SRC_AI','KNOWHOW_SRC_WSPOLNY','KNOWHOW_RESUME_INSTRUCTION','KNOWHOW_EXTRACT_PROMPT','HANDOFF_PROMPT','IDEA_SOURCE_HINT']) {
  console.log(n, '=', (src.match(new RegExp(n, 'g')) || []).length);
}
