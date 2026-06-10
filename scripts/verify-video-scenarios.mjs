#!/usr/bin/env node
/**
 * verify-video-scenarios.mjs — gate dla scenariuszy TikTok PRZED insertem (v3, 2026-06-10)
 *
 * Usage: node scripts/verify-video-scenarios.mjs <plik.json> [ścieżka/_brief.md]
 *   plik.json = payload z Kroku 5 procedury ({workflow_id, video_scenarios:[...]})
 *   _brief.md = brief landingu (źródło awareness + liczb kanonicznych); opcjonalny
 *
 * Exit: 0 PASS / 1 FAIL (NIE insertuj) / 2 WARN (heurystyki copywriter-ese — przejrzyj)
 *
 * Egzekwuje checklistę Kroku 4 procedury (lekcja landing v5.0: deklaracja ≠ enforcement)
 * + anty-fabrykację liczb mówionych (publiczne, nieodwracalne) + lejek wg awareness.
 */

import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2];
const briefPath = process.argv[3];
if (!file) { console.error('Usage: node scripts/verify-video-scenarios.mjs <plik.json> [_brief.md]'); process.exit(1); }
if (!existsSync(file)) { console.error(`❌ Brak pliku: ${file}`); process.exit(1); }

let payload;
try { payload = JSON.parse(readFileSync(file, 'utf8')); }
catch (e) { console.error(`❌ Niepoprawny JSON: ${e.message}`); process.exit(1); }

const scen = payload.video_scenarios || payload;
if (!Array.isArray(scen)) { console.error('❌ Brak tablicy video_scenarios'); process.exit(1); }

let fail = 0, warn = 0, pass = 0;
const F = (m) => { console.log(`  ❌ ${m}`); fail++; };
const W = (m) => { console.log(`  ⚠️  ${m}`); warn++; };
const P = (m) => { console.log(`  ✅ ${m}`); pass++; };

// ── brief: awareness + liczby kanoniczne + frazy VOC ──
let awareness = null;
let canonicalNums = new Set();
let vocPhrases = [];
if (briefPath && existsSync(briefPath)) {
  const brief = readFileSync(briefPath, 'utf8').replace(/\r/g, '');
  awareness = (brief.match(/^awareness:\s*(problem-aware|solution-aware|product-aware)/m) || [])[1] || null;
  (brief.match(/\d+(?:[,.]\d+)?/g) || []).forEach((n) => canonicalNums.add(n.replace(',', '.')));
  const sec132 = brief.match(/### 13\.2[\s\S]*?(?=### 13\.3|## 14|$)/);
  if (sec132) {
    vocPhrases = [...sec132[0].matchAll(/[„"]([^"""]{8,})["""]/g)].map((m) => m[1].toLowerCase());
  }
}

console.log('');
console.log(`═══ VERIFY VIDEO SCENARIOS (${scen.length} szt.${awareness ? ', awareness: ' + awareness : ''}) ═══`);
console.log('');

// ── 1. Formalne (FAIL) ──
console.log('📋 Formalne');
scen.length === 10 ? P('10 scenariuszy') : F(`liczba scenariuszy: ${scen.length} (wymagane 10)`);

const REQUIRED_FIELDS = ['type', 'showFace', 'funnelStage', 'title', 'hook', 'script', 'action', 'ending', 'duration', 'caption', 'hashtags'];
scen.forEach((s, i) => {
  const missing = REQUIRED_FIELDS.filter((f) => s[f] === undefined || s[f] === null || s[f] === '');
  if (missing.length) F(`#${i + 1} „${(s.title || '?').slice(0, 30)}": brak pól: ${missing.join(', ')}`);
});

// lejek wg awareness (v3)
const expected = { 'problem-aware': [4, 4, 2], 'product-aware': [2, 4, 4] }[awareness] || [3, 4, 3];
const dist = ['awareness', 'consideration', 'conversion'].map((st) => scen.filter((s) => s.funnelStage === st).length);
if (dist.join('/') === expected.join('/')) P(`lejek ${dist.join('/')} zgodny z awareness=${awareness || 'default'}`);
else F(`lejek ${dist.join('/')} — oczekiwane ${expected.join('/')} dla awareness=${awareness || 'default (solution-aware)'}`);

// teksty zbiorczo
const textOf = (s) => [s.hook, s.script, s.action, s.ending, s.caption, s.textOverlay, s.title].filter(Boolean).join(' ');

// ceny / zł
const priced = scen.filter((s) => /\d+\s*zł|\bPLN\b|cen[aęy]\s+\d/i.test(textOf(s)));
priced.length === 0 ? P('zero cen w treści') : F(`ceny w treści: ${priced.map((s) => s.title).join(' · ')}`);

// angielskie zwroty
const ENG = /\b(goals|glow up|morning routine|vibe|mood|unboxing haul|aesthetic|hack|game changer)\b/i;
const eng = scen.filter((s) => ENG.test(textOf(s)));
eng.length === 0 ? P('zero angielskich zwrotów') : F(`angielskie zwroty: ${eng.map((s) => s.title).join(' · ')}`);

// hashtagi
scen.forEach((s, i) => {
  const h = s.hashtags || [];
  if (h.length < 4 || h.length > 6) F(`#${i + 1}: hashtagi ${h.length} (wymagane 4-6)`);
  if (h.some((t) => /\s/.test(t) || !t.startsWith('#'))) F(`#${i + 1}: hashtag ze spacją lub bez # (${h.join(',')})`);
});

// caption length
scen.forEach((s, i) => {
  const len = (s.caption || '').length;
  if (len < 100 || len > 250) F(`#${i + 1}: caption ${len} znaków (wymagane 100-250)`);
});

// duplikaty hooków
const hooks = scen.map((s) => (s.hook || '').toLowerCase().replace(/\s+/g, ' ').trim());
const dupes = hooks.filter((h, i) => h && hooks.indexOf(h) !== i);
dupes.length === 0 ? P('hooki unikalne') : F(`duplikaty hooków: ${dupes.length}`);

// max 1 talking-head, min 3 bez speechu, min 1 format 2026
const th = scen.filter((s) => /talking.?head/i.test(s.type || '')).length;
th <= 1 ? P(`talking-head: ${th} (max 1)`) : F(`talking-head ×${th} (max 1 — pułapka copywriter-ese)`);
const noSpeech = scen.filter((s) => /bez dialogu|bez głosu|voiceover|pov.?text|silent|asmr|demo/i.test((s.script || '') + ' ' + (s.type || ''))).length;
noSpeech >= 3 ? P(`scenariusze bez speechu klienta: ${noSpeech} (min 3)`) : F(`tylko ${noSpeech} scenariuszy bez speechu (min 3 — formaty awaryjne dla debiutanta)`);
const trend = scen.filter((s) => /day in|duet|stitch|partner reveal|pov.?text/i.test((s.type || '') + ' ' + (s.title || ''))).length;
trend >= 1 ? P(`formaty trend-2026: ${trend} (min 1)`) : F('zero formatów 21-24 (day-in-life/duet/partner-reveal/POV-text)');

// ── 2. Anty-fabrykacja liczb (FAIL gdy brief dostępny) ──
console.log('');
console.log('🔢 Liczby mówione vs liczby kanoniczne briefu');
if (canonicalNums.size === 0) {
  W('brak briefu/liczb kanonicznych — anty-fabrykacja pominięta (sprawdź ręcznie!)');
} else {
  ['7', '14', '30', '24', '2026', '1', '2', '3', '5', '10'].forEach((n) => canonicalNums.add(n)); // małe liczby narracyjne
  let orphans = [];
  scen.forEach((s, i) => {
    const nums = (textOf(s).match(/\d+(?:[,.]\d+)?/g) || []).map((n) => n.replace(',', '.'));
    nums.filter((n) => !canonicalNums.has(n)).forEach((n) => orphans.push(`#${i + 1}: ${n}`));
  });
  orphans.length === 0
    ? P('wszystkie liczby z whitelisty briefu')
    : F(`liczby-sieroty (klient WYPOWIE je publicznie!): ${[...new Set(orphans)].slice(0, 8).join(' · ')}`);
}

// VOC coverage (WARN — heurystyka dopasowania frazy)
if (vocPhrases.length) {
  const vocHooks = scen.filter((s) => vocPhrases.some((v) => (s.hook || '').toLowerCase().includes(v.slice(0, 18)))).length;
  vocHooks >= 4 ? P(`hooki z VOC: ${vocHooks}/10 (min 4)`) : W(`hooki rozpoznane jako VOC: ${vocHooks}/10 (cel min 4 — dopasowanie heurystyczne, zweryfikuj ręcznie)`);
}

// ── 3. Copywriter-ese (WARN — heurystyki) ──
console.log('');
console.log('✍️  Copywriter-ese (heurystyki — sekcja 0 procedury)');
const PATTERNS = [
  [/\bJestem [a-ząćęłńóśźż]+, nie [a-ząćęłńóśźż]+/i, 'manifest „Jestem X, nie Y"'],
  [/Bez [a-ząćęłńóśźż]+\. Bez [a-ząćęłńóśźż]+\. Bez/i, 'paralelizm „Bez X. Bez Y. Bez Z."'],
  [/Nie wiem, kiedy|Bywają chwile|To nie reklama/i, 'literacki opener'],
  [/pierwsz[ay] cisz[ay]|weekend, który/i, 'patos/slogan'],
  [/(godzina|minut)[aęy]? i [a-ząćęłńóśźż]+ (minut|sekund)/i, 'okrągłe literackie liczby'],
];
let cwHits = 0;
scen.forEach((s, i) => {
  PATTERNS.forEach(([re, name]) => {
    if (re.test(textOf(s))) { W(`#${i + 1} „${(s.title || '').slice(0, 26)}": ${name}`); cwHits++; }
  });
  const sentences = (s.script || '').split(/[.!?]+/).filter((x) => x.trim().length > 2).length;
  if (sentences > 3 && !/bez dialogu|voiceover|narracja/i.test(s.script || '')) {
    W(`#${i + 1}: script ma ${sentences} zdań (core max 3 — resztę klient improwizuje)`);
  }
});
if (cwHits === 0) P('zero wzorców copywriter-ese');

// ── Summary ──
console.log('');
console.log(`SUMMARY: ✅ ${pass} · ⚠️  ${warn} · ❌ ${fail}`);
if (fail > 0) { console.log(`GATE: FAIL (FAIL=${fail}) — popraw scenariusze, NIE insertuj`); process.exit(1); }
if (warn > 0) { console.log(`GATE: WARN (${warn}) — przejrzyj wątpliwości, potem insert`); process.exit(2); }
console.log('GATE: PASS');
process.exit(0);
