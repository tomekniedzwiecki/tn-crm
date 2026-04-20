// apply-copy.mjs — aplikuje rewritten copy (JSON z Manusa) do landing-pages/$SLUG/index.html
// Usage: node scripts/apply-copy.mjs <slug>
// Source: /c/tmp/manus-copy-<slug>.json

import fs from 'fs';
import path from 'path';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/apply-copy.mjs <slug>');
  process.exit(1);
}

const htmlFile = path.resolve(`landing-pages/${slug}/index.html`);
const jsonFile = `C:/tmp/manus-copy-${slug}.json`;

if (!fs.existsSync(htmlFile)) { console.error(`❌ Missing: ${htmlFile}`); process.exit(1); }
if (!fs.existsSync(jsonFile)) { console.error(`❌ Missing: ${jsonFile}`); process.exit(1); }

let html = fs.readFileSync(htmlFile, 'utf8');
const copy = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

let replacements = 0;

// Helper: replace content BETWEEN opening and closing tag of an element matched by class
const replaceByClass = (cls, newContent) => {
  if (newContent === null || newContent === undefined) return;
  // Match: <TAG class="cls ..."...>CONTENT</TAG>  (non-greedy, single element)
  const re = new RegExp(`(<([a-z0-9]+)[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>)([\\s\\S]*?)(</\\2>)`, 'i');
  const m = html.match(re);
  if (!m) {
    console.warn(`  ⚠️  Nie znaleziono .${cls}`);
    return;
  }
  html = html.replace(re, `$1${newContent}$4`);
  replacements++;
  console.log(`  ✅ .${cls}`);
};

const replaceAllByClass = (cls, newArray) => {
  if (!Array.isArray(newArray)) return;
  const re = new RegExp(`(<([a-z0-9]+)[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>)([\\s\\S]*?)(</\\2>)`, 'gi');
  let i = 0;
  html = html.replace(re, (match, open, tag, inner, close) => {
    if (i < newArray.length && newArray[i] !== undefined) {
      const newVal = newArray[i++];
      replacements++;
      return `${open}${newVal}${close}`;
    }
    i++;
    return match;
  });
  console.log(`  ✅ .${cls} x${newArray.length}`);
};

console.log(`📝 Apply copy from ${jsonFile} → ${htmlFile}`);

// HERO
replaceByClass('hero-eyebrow', copy.hero_eyebrow);
if (copy.hero_h1) {
  html = html.replace(/<h1 class="js-split">[\s\S]*?<\/h1>/, `<h1 class="js-split">${copy.hero_h1}</h1>`);
  replacements++;
  console.log('  ✅ hero h1');
}
replaceByClass('hero-lede', copy.hero_lede);

// HERO FIGURE
if (copy.hero_figure_title || copy.hero_figure_note || copy.hero_figure_size) {
  const hf = html.match(/<div class="hero-figure">[\s\S]*?<\/div>\s*<\/div>/);
  if (hf) {
    let block = hf[0];
    if (copy.hero_figure_mark) block = block.replace(/<div class="ph-mark">[^<]+<\/div>/, `<div class="ph-mark">${copy.hero_figure_mark}</div>`);
    if (copy.hero_figure_title) block = block.replace(/<div class="ph-title">[^<]+<\/div>/, `<div class="ph-title">${copy.hero_figure_title}</div>`);
    if (copy.hero_figure_size) block = block.replace(/<div class="ph-size">[^<]+<\/div>/, `<div class="ph-size">${copy.hero_figure_size}</div>`);
    if (copy.hero_figure_note) block = block.replace(/<div class="ph-note">[^<]+<\/div>/, `<div class="ph-note">${copy.hero_figure_note}</div>`);
    html = html.replace(hf[0], block);
    replacements++;
    console.log('  ✅ hero figure');
  }
}

// PROBLEM
if (copy.problem_h2) {
  html = html.replace(/(<section class="problem">[\s\S]*?<h2>)([\s\S]*?)(<\/h2>)/, `$1${copy.problem_h2}$3`);
  replacements++;
  console.log('  ✅ problem h2');
}
if (Array.isArray(copy.problem_body)) {
  const problemSect = html.match(/<div class="problem-body">[\s\S]*?<\/div>/);
  if (problemSect) {
    const newBody = `<div class="problem-body">\n          ${copy.problem_body.map(p => `<p>${p}</p>`).join('\n          ')}\n        </div>`;
    html = html.replace(problemSect[0], newBody);
    replacements++;
    console.log(`  ✅ problem-body x${copy.problem_body.length}`);
  }
}
if (Array.isArray(copy.problem_stats)) {
  copy.problem_stats.forEach((stat, i) => {
    if (!stat) return;
    // Match i-th .problem-stat-block
    const re = new RegExp(`(<div class="problem-stat-block">\\s*<div class="problem-stat-num">)[\\s\\S]*?(</div>\\s*<div class="problem-stat-label">)[\\s\\S]*?(</div>)`, 'g');
    let idx = 0;
    html = html.replace(re, (match, pre, mid, end) => {
      if (idx === i && stat.num && stat.label) {
        idx++;
        // Label może zawierać <br> od Manusa; jeśli nie — zostawić plain text (CSS wrap)
        // ALE jeśli label > 30 znaków, spróbuj dodać <br> w środku (po przecinku lub w połowie)
        let label = stat.label;
        if (label.length > 30 && !label.includes('<br>')) {
          const words = label.split(' ');
          const splitAt = Math.ceil(words.length / 2);
          label = words.slice(0, splitAt).join(' ') + '<br>' + words.slice(splitAt).join(' ');
        }
        return `${pre}${stat.num}${mid}${label}${end}`;
      }
      idx++;
      return match;
    });
  });
  console.log(`  ✅ problem stats x${copy.problem_stats.length}`);
  replacements++;
}
replaceByClass('problem-figure\\s+fade-in', null);  // figure is placeholder, skip
if (copy.problem_figure_note) {
  html = html.replace(/(<div class="problem-figure[^"]*">[\s\S]*?<div class="ph-note">)[\s\S]*?(<\/div>)/, `$1${copy.problem_figure_note}$2`);
  console.log('  ✅ problem figure note');
  replacements++;
}

// ATELIER
if (copy.atelier_h2) {
  html = html.replace(/(<div class="atelier-head[^"]*">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/, `$1${copy.atelier_h2}$2`);
  replacements++;
  console.log('  ✅ atelier h2');
}
replaceByClass('atelier-lede', copy.atelier_lede);

// TILES
if (Array.isArray(copy.tiles)) {
  const tileBlocks = [...html.matchAll(/<div class="tile[^"]*"[^>]*>[\s\S]*?(?=<div class="tile|<\/div>\s*<\/section>)/g)];
  copy.tiles.forEach((t, i) => {
    if (!t || !tileBlocks[i]) return;
    let block = tileBlocks[i][0];
    if (t.kicker) block = block.replace(/<div class="tile-kicker">[^<]+<\/div>/, `<div class="tile-kicker">${t.kicker}</div>`);
    if (t.title) block = block.replace(/<h3 class="tile-title">[\s\S]*?<\/h3>/, `<h3 class="tile-title">${t.title}</h3>`);
    if (t.text) block = block.replace(/<p class="tile-text">[^<]+<\/p>/, `<p class="tile-text">${t.text}</p>`);
    html = html.replace(tileBlocks[i][0], block);
  });
  console.log(`  ✅ tiles x${copy.tiles.length}`);
  replacements++;
}

// RITUAL
if (copy.ritual_h2) {
  html = html.replace(/(<div class="ritual-head[^"]*">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/, `$1${copy.ritual_h2}$2`);
  replacements++;
  console.log('  ✅ ritual h2');
}
replaceByClass('ritual-lede', copy.ritual_lede);
if (Array.isArray(copy.acts)) {
  const actBlocks = [...html.matchAll(/<div class="act[^"]*"[^>]*>[\s\S]*?(?=<div class="act|<\/div>\s*<\/div>\s*<\/section>)/g)];
  copy.acts.forEach((a, i) => {
    if (!a || !actBlocks[i]) return;
    let block = actBlocks[i][0];
    if (a.title) block = block.replace(/<h3 class="act-title">[^<]+<\/h3>/, `<h3 class="act-title">${a.title}</h3>`);
    if (a.text) block = block.replace(/<p class="act-text">[^<]+<\/p>/, `<p class="act-text">${a.text}</p>`);
    html = html.replace(actBlocks[i][0], block);
  });
  console.log(`  ✅ acts x${copy.acts.length}`);
  replacements++;
}

// VERSUS
if (copy.versus_h2) {
  html = html.replace(/(<div class="versus-head[^"]*">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/, `$1${copy.versus_h2}$2`);
  replacements++;
  console.log('  ✅ versus h2');
}
replaceByClass('versus-lede', copy.versus_lede);

// VOICES
if (copy.voices_h2) {
  html = html.replace(/(<div class="voices-head[^"]*">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/, `$1${copy.voices_h2}$2`);
  replacements++;
  console.log('  ✅ voices h2');
}
if (Array.isArray(copy.voice_cards)) {
  const blocks = [...html.matchAll(/<div class="voice-card[^"]*"[^>]*>[\s\S]*?(?=<div class="voice-card|<\/div>\s*<\/div>\s*<\/section>)/g)];
  copy.voice_cards.forEach((v, i) => {
    if (!v || !blocks[i]) return;
    let block = blocks[i][0];
    if (v.quote) block = block.replace(/<p class="voice-quote">[^<]+<\/p>/, `<p class="voice-quote">${v.quote}</p>`);
    html = html.replace(blocks[i][0], block);
  });
  console.log(`  ✅ voice_cards x${copy.voice_cards.length}`);
  replacements++;
}

// FAQ
if (copy.faq_h2) {
  html = html.replace(/(<div class="faq-head[^"]*">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/, `$1${copy.faq_h2}$2`);
  replacements++;
  console.log('  ✅ faq h2');
}
if (Array.isArray(copy.faq_items)) {
  const items = [...html.matchAll(/<details class="faq-item"[^>]*>[\s\S]*?<\/details>/g)];
  copy.faq_items.forEach((f, i) => {
    if (!f || !items[i]) return;
    let block = items[i][0];
    if (f.q) block = block.replace(/<summary class="faq-q">[^<]+<\/summary>/, `<summary class="faq-q">${f.q}</summary>`);
    if (f.a) block = block.replace(/<div class="faq-a">[\s\S]*?<\/div>/, `<div class="faq-a">${f.a}</div>`);
    html = html.replace(items[i][0], block);
  });
  console.log(`  ✅ faq_items x${copy.faq_items.length}`);
  replacements++;
}

// OFFER
if (copy.offer_h2) {
  html = html.replace(/(<div class="offer-head[^"]*">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/, `$1${copy.offer_h2}$2`);
  replacements++;
  console.log('  ✅ offer h2');
}
replaceByClass('offer-sticker', copy.offer_sticker);
if (copy.offer_title) {
  html = html.replace(/<h3 class="offer-title">[\s\S]*?<\/h3>/, `<h3 class="offer-title">${copy.offer_title}</h3>`);
  replacements++;
  console.log('  ✅ offer title');
}
replaceByClass('offer-lede', copy.offer_lede);
replaceByClass('offer-cta', copy.offer_cta);

// FINAL CTA
if (copy.final_cta_h2) {
  html = html.replace(/(<div class="final-cta-inner[^"]*">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/, `$1${copy.final_cta_h2}$2`);
  replacements++;
  console.log('  ✅ final-cta h2');
}
if (copy.final_cta_p) {
  html = html.replace(/(<div class="final-cta-inner[^"]*">[\s\S]*?<p>)[^<]+(<\/p>)/, `$1${copy.final_cta_p}$2`);
  replacements++;
  console.log('  ✅ final-cta p');
}

fs.writeFileSync(htmlFile, html);
console.log(`\n✅ Applied ${replacements} replacements → ${htmlFile}`);
console.log('\nNext:');
console.log(`  bash scripts/verify-landing.sh ${slug}`);
console.log(`  bash scripts/screenshot-landing.sh ${slug}`);
