#!/usr/bin/env bash
# Aspect-ratio audit dla landingu — wykrywa mismatch CSS containera vs HTML width/height obrazu.
#
# Uzycie:
#   bash scripts/audit-landing-aspect-ratios.sh [slug]
#
# Tlo:
#   Edge function generate-image dostaje aspect_ratio (np. "4:3"). Wygenerowany plik
#   ma width/height ~1200x900. Jesli CSS containera ma `aspect-ratio: 16/9` to
#   `object-fit: cover` obetnie ~25% bokow. Bez tego skryptu blad jest niewidoczny
#   az do screenshota.
#
# Algorytm (parser w Node):
#   1. Wycina @media bloki z CSS, zostawia tylko top-level (desktop) reguly.
#   2. Buduje liste regul CSS `.X { aspect-ratio: A/B }` w kolejnosci pojawiania
#      sie w pliku (source order = CSS specificity tie-breaker).
#   3. Dla kazdego elementu-containera <div class="..."> z jakakolwiek znana klasa
#      figure, wybiera EFFECTIVE aspect-ratio = regula najpozniej zdefiniowana w CSS
#      sposrod tych ktore matchuja class-liste elementu (dokladne dopasowanie po
#      tokens, nie regex prefix).
#   4. Lapie pierwszy <img width=W height=H alt=A> w kontenerze i liczy drift.
#   5. Drift >5% = MISMATCH (object-fit: cover obetnie widocznie kadr).
#
# Wyjscie:
#   exit 0 — drift <=5% wszedzie
#   exit 1 — przynajmniej 1 mismatch >5% (regen z aspect_ratio dopasowanym do CSS,
#            albo zmien CSS aspect-ratio + width/height attr w HTML)

set -euo pipefail

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Usage: bash scripts/audit-landing-aspect-ratios.sh [slug]" >&2
  exit 2
fi

HTML="landing-pages/$SLUG/index.html"
if [ ! -f "$HTML" ]; then
  echo "ERROR: $HTML not found" >&2
  exit 2
fi

node - "$HTML" <<'NODE'
const fs = require('fs');
const path = process.argv[2];
const src = fs.readFileSync(path, 'utf8');

const FIG_CLASSES = ['hero-figure','problem-figure','challenge-figure','tile-figure','tile-figure-sm','act-figure','ritual-figure','how-figure','step-figure','spec-figure','persona-figure','offer-figure'];

// 1. Strip @media blocks
function stripMediaQueries(s) {
  let out = '', i = 0;
  while (i < s.length) {
    if (s.slice(i, i+6) === '@media') {
      let j = s.indexOf('{', i);
      if (j < 0) break;
      let dep = 1; j++;
      while (j < s.length && dep > 0) {
        if (s[j] === '{') dep++;
        else if (s[j] === '}') dep--;
        j++;
      }
      i = j; continue;
    }
    out += s[i++];
  }
  return out;
}
const cssOnly = stripMediaQueries(src);

// 2. Build list of CSS rules in source order: [{cls, ar, srcIdx}]
const rules = [];
for (const cls of FIG_CLASSES) {
  const re = new RegExp(`(^|\\n)\\s*\\.${cls}\\s*\\{([^}]*)\\}`, 'g');
  let m;
  while ((m = re.exec(cssOnly)) !== null) {
    const ar = m[2].match(/aspect-ratio:\s*(\d+)\s*\/\s*(\d+)/);
    if (ar) rules.push({ cls, ar: `${ar[1]}/${ar[2]}`, srcIdx: m.index });
  }
}

// 3. Iterate elements with class-list, pick effective aspect-ratio
const tagRe = /<(?:div|figure|section|article)\b[^>]*class="([^"]+)"[^>]*>/g;
let fails = 0, total = 0;
console.log(`🔎 Audyt aspect-ratio: ${path}\n`);

let tm;
while ((tm = tagRe.exec(src)) !== null) {
  const elClasses = tm[1].split(/\s+/);
  const matching = rules.filter(r => elClasses.includes(r.cls));
  if (matching.length === 0) continue;
  // last in source order wins (CSS cascade tie-break for equal specificity)
  matching.sort((a, b) => b.srcIdx - a.srcIdx);
  const effective = matching[0];

  // first <img> in next 1000 chars
  const after = src.slice(tm.index, tm.index + 1500);
  const imgTag = after.match(/<img[^>]+>/);
  if (!imgTag) continue;
  const t = imgTag[0];
  const wm = t.match(/\bwidth="(\d+)"/);
  const hm = t.match(/\bheight="(\d+)"/);
  const am = t.match(/\balt="([^"]+)"/);
  if (!wm || !hm) continue;

  total++;
  const [a, b] = effective.ar.split('/').map(Number);
  const cssR = a / b;
  const w = +wm[1], h = +hm[1];
  const imgR = w / h;
  const diff = Math.abs(cssR - imgR) / cssR * 100;
  const ok = diff <= 5;
  if (!ok) fails++;
  const status = ok ? '✅ OK' : '❌ MISMATCH';
  const classDesc = elClasses.filter(c => FIG_CLASSES.includes(c)).join('+');
  console.log(`  ${status} .${classDesc} → effective .${effective.cls} (${effective.ar}=${cssR.toFixed(3)}) vs img ${w}x${h} (${imgR.toFixed(3)}) — diff ${diff.toFixed(1)}%`);
  console.log(`      alt: ${am ? am[1] : '(no alt)'}`);
}

console.log();
if (fails > 0) {
  console.log(`❌ ${fails}/${total} mismatch(y) >5% — regen z aspect_ratio dopasowanym do CSS containera`);
  console.log(`   Mapping CSS → Gemini aspect_ratio (dostepne):`);
  console.log(`   4/5 → "4:5"   3/4 → "3:4"   2/3 → "2:3"`);
  console.log(`   4/3 → "4:3"   3/2 → "3:2"   16/9 → "16:9"   21/9 → "21:9"`);
  console.log(`   1/1 → "1:1"   16/10 → brak — uzyj 16:9 i zmien CSS na 16/9, albo 3:2 (drift 6.7%)`);
  process.exit(1);
}
console.log(`✅ ${total}/${total} figure'ow dopasowanych do CSS aspect-ratio (drift <=5%)`);
process.exit(0);
NODE
