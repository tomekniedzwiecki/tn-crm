// extract-copy.mjs — wyciąga wszystkie teksty copy z landing-pages/$SLUG/index.html
// Usage: node scripts/extract-copy.mjs <slug>
// Output: JSON na stdout (do późniejszego wysłania do Manusa)
//
// Używa playwright żeby dostać się do DOM i pobrać textContent + zachować <em> markery

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const slug = process.argv[2];
const outFile = process.argv[3];  // opcjonalne — zapisze do pliku z UTF-8 encoding
if (!slug) {
  console.error('Usage: node scripts/extract-copy.mjs <slug> [outFile]');
  process.exit(1);
}

const file = path.resolve(`landing-pages/${slug}/index.html`);
if (!fs.existsSync(file)) {
  console.error(`❌ File not found: ${file}`);
  process.exit(1);
}

const url = 'file:///' + file.replace(/\\/g, '/');

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded' });

const copy = await page.evaluate(() => {
  const innerText = (sel, parent = document) => {
    const el = parent.querySelector(sel);
    if (!el) return null;
    // Preserve <em> as <em>X</em> in output (so Manus wie o italic accent)
    return el.innerHTML
      .replace(/\s+/g, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<(?!\/?em\b)[^>]+>/g, '')  // strip all tags except <em></em>
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();
  };
  const plainText = (sel, parent = document) => {
    const el = parent.querySelector(sel);
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
  };
  const allInnerText = (sel, parent = document) => {
    return Array.from(parent.querySelectorAll(sel)).map(el => {
      return el.innerHTML
        .replace(/\s+/g, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<(?!\/?em\b)[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim();
    });
  };

  const out = {};

  // HEADER
  out.nav_links = Array.from(document.querySelectorAll('.nav-link')).map(a => a.textContent.trim());
  out.header_cta = plainText('.header-cta');

  // HERO
  out.hero_eyebrow = plainText('.hero-eyebrow');
  out.hero_h1 = innerText('.hero h1');
  out.hero_lede = plainText('.hero-lede');
  out.hero_cta_primary = plainText('.hero-cta-row .btn-primary');
  out.hero_cta_secondary = plainText('.hero-cta-row .btn-ghost');
  out.hero_meta = plainText('.hero-meta span:last-child');

  // HERO FIGURE (placeholder brief)
  const hf = document.querySelector('.hero-figure');
  if (hf) {
    out.hero_figure_mark = plainText('.ph-mark', hf);
    out.hero_figure_title = plainText('.ph-title', hf);
    out.hero_figure_size = plainText('.ph-size', hf);
    out.hero_figure_note = plainText('.ph-note', hf);
  }

  // TRUST BAR
  out.trust_items = Array.from(document.querySelectorAll('.trust-item .trust-text')).map(t => {
    const strong = t.querySelector('strong')?.textContent.trim();
    const span = t.querySelector('span')?.textContent.trim();
    return { strong, span };
  });

  // PROBLEM
  const problem = document.querySelector('.problem');
  if (problem) {
    out.problem_no = plainText('.section-no', problem);
    out.problem_h2 = innerText('h2', problem);
    out.problem_body = Array.from(problem.querySelectorAll('.problem-body p')).map(p => p.textContent.trim());
    out.problem_stats = Array.from(problem.querySelectorAll('.problem-stat-block')).map(b => ({
      num: b.querySelector('.problem-stat-num')?.textContent.trim(),
      label: b.querySelector('.problem-stat-label')?.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim()
    }));
    out.problem_figure_note = plainText('.problem-figure .ph-note', problem);
  }

  // ATELIER / BENTO
  const atelier = document.querySelector('.atelier');
  if (atelier) {
    out.atelier_h2 = innerText('h2', atelier);
    out.atelier_lede = plainText('.atelier-lede', atelier);
    out.tiles = Array.from(atelier.querySelectorAll('.tile')).map(t => ({
      kicker: plainText('.tile-kicker', t),
      title: innerText('.tile-title', t),
      text: plainText('.tile-text', t),
      figure_mark: plainText('.ph-mark', t)
    }));
  }

  // RITUAL
  const ritual = document.querySelector('.ritual');
  if (ritual) {
    out.ritual_no = plainText('.section-no', ritual);
    out.ritual_h2 = innerText('h2', ritual);
    out.ritual_lede = plainText('.ritual-lede', ritual);
    out.acts = Array.from(ritual.querySelectorAll('.act')).map(a => ({
      numeral: plainText('.act-numeral', a),
      title: plainText('.act-title', a),
      text: plainText('.act-text', a),
      figure_mark: plainText('.ph-mark', a)
    }));
  }

  // SPEC
  const spec = document.querySelector('.spec');
  if (spec) {
    out.spec_h2 = innerText('h2', spec);
    out.spec_lede = plainText('.spec-lede', spec);
    out.spec_rows = Array.from(spec.querySelectorAll('.spec-row')).map(r => ({
      key: plainText('.spec-key', r),
      value: plainText('.spec-value', r)
    }));
  }

  // VERSUS
  const versus = document.querySelector('.versus');
  if (versus) {
    out.versus_h2 = innerText('h2', versus);
    out.versus_lede = plainText('.versus-lede', versus);
    out.versus_cards = Array.from(versus.querySelectorAll('.versus-card')).map(c => ({
      kind: c.classList.contains('win') ? 'win' : 'dim',
      no: plainText('.versus-no', c),
      kicker: plainText('.versus-kicker', c),
      title: innerText('.versus-title', c),
      stats: Array.from(c.querySelectorAll('.versus-stats > div')).map(d => ({
        num: d.querySelector('.versus-stat-num')?.textContent.trim(),
        label: d.querySelector('.versus-stat-label')?.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim()
      })),
      list: Array.from(c.querySelectorAll('.versus-list li')).map(li => li.textContent.trim()),
      bottom: plainText('.versus-bottom', c)
    }));
  }

  // VOICES
  const voices = document.querySelector('.voices');
  if (voices) {
    out.voices_h2 = innerText('h2', voices);
    out.voice_cards = Array.from(voices.querySelectorAll('.voice-card')).map(v => ({
      quote: plainText('.voice-quote', v),
      name: plainText('.voice-name', v),
      context: plainText('.voice-context', v),
      avatar: plainText('.voice-avatar', v)
    }));
  }

  // FAQ
  const faq = document.querySelector('.faq');
  if (faq) {
    out.faq_h2 = innerText('h2', faq);
    out.faq_items = Array.from(faq.querySelectorAll('.faq-item')).map(i => ({
      q: plainText('.faq-q', i),
      a: i.querySelector('.faq-a')?.textContent.replace(/\s+/g, ' ').trim()
    }));
  }

  // OFFER
  const offer = document.querySelector('.offer');
  if (offer) {
    out.offer_h2 = innerText('h2', offer);
    out.offer_sticker = plainText('.offer-sticker', offer);
    out.offer_rating = plainText('.offer-rating span:last-child', offer);
    out.offer_title = innerText('.offer-title', offer);
    out.offer_lede = plainText('.offer-lede', offer);
    out.offer_includes = Array.from(offer.querySelectorAll('.offer-includes li')).map(li => li.textContent.trim());
    out.offer_cta = plainText('.offer-cta', offer);
    out.offer_guarantee = offer.querySelector('.offer-guarantee')?.textContent.replace(/\s+/g, ' ').trim();
  }

  // FINAL CTA
  const fc = document.querySelector('.final-cta');
  if (fc) {
    out.final_cta_h2 = innerText('h2', fc);
    out.final_cta_p = plainText('p', fc);
    out.final_cta_btn = plainText('.btn-primary', fc);
  }

  return out;
});

await browser.close();

const json = JSON.stringify(copy, null, 2);
if (outFile) {
  // Zapisz UTF-8 bezpośrednio (bez BOM) — pipe przez bash na Windows psuje polskie znaki
  fs.writeFileSync(outFile, json, { encoding: 'utf8' });
  console.error(`✅ Zapisano: ${outFile} (${json.length} bajtów)`);
} else {
  // Backward compat — stdout (ale uwaga: bash > na Windows psuje polskie znaki)
  process.stdout.write(json);
}
