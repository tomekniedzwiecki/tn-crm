#!/usr/bin/env node
/**
 * verify-mobile.mjs — obliczeniowy gate mobilny ETAP 6 (v5.0)
 *
 * Usage: node scripts/verify-mobile.mjs <slug>
 * Output: raport + landing-pages/<slug>/_mobile-review.md (artefakt zamiast 5 pytań retorycznych)
 * Exit: 0 PASS / 2 WARN (rollout) — docelowo 1 FAIL po 5 landingach bez false positive
 *
 * Silnik: Playwright file:// (PRIMARY — ETAP 6 biegnie PRZED deployem, live URL nie istnieje;
 * chrome-devtools MCP nie widzi local/file — memory feedback-chrome-devtools-local-server-unreachable).
 *
 * Mierzy per viewport 360/375/412 px:
 *  - headline_visible: h1 w pierwszym viewportcie
 *  - cta_in_fold: CTA w pierwszym viewportcie LUB sticky-cta obecny
 *  - hero_visual ≤60vh (hero figure nie zjada folda)
 *  - overflow_offenders: per-element rect.right > docWidth+1 (NIE scrollWidth —
 *    html{overflow-x:hidden} maskuje leak)
 *  - touch_targets: <a>/<button> widoczne o wysokości <40px
 */

import { chromium } from 'playwright';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const slug = process.argv[2];
if (!slug) { console.error('Usage: node scripts/verify-mobile.mjs <slug>'); process.exit(1); }
const htmlPath = resolve(`landing-pages/${slug}/index.html`);
if (!existsSync(htmlPath)) { console.error(`❌ Brak ${htmlPath}`); process.exit(1); }
const url = 'file:///' + htmlPath.replace(/\\/g, '/');

const VIEWPORTS = [360, 375, 412];
const results = [];
let warns = 0;

const browser = await chromium.launch();
for (const width of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500); // split-headline / fonty / fade-in (wzorzec _shoot.mjs)

  const r = await page.evaluate(() => {
    const vh = window.innerHeight;
    const docW = document.documentElement.clientWidth;
    const out = { headline_visible: false, cta_in_fold: false, sticky_present: false, hero_visual_vh: 0, overflow: [], small_targets: [] };

    const h1 = document.querySelector('h1');
    if (h1) {
      const rect = h1.getBoundingClientRect();
      out.headline_visible = rect.top >= 0 && rect.top < vh && rect.height > 0;
    }
    const cta = document.querySelector('.hero a[class*="btn"], .hero a[class*="cta"], .hero button');
    if (cta) {
      const rect = cta.getBoundingClientRect();
      out.cta_in_fold = rect.top < vh && rect.bottom > 0;
    }
    out.sticky_present = !!document.querySelector('[class*="sticky-cta"],[class*="mobile-cta"],[class*="bottom-cta"],[class*="fixed-cta"]');

    const heroFig = document.querySelector('.hero [class*="figure"], .hero [class*="hero-product"], .hero [class*="hero-image"]');
    if (heroFig) {
      out.hero_visual_vh = Math.round((heroFig.getBoundingClientRect().height / vh) * 100);
    }

    // per-element overflow (istniejący snippet B z 06-mobile.md) + filtr false-positives:
    // ukryte overlaye (mobile-menu/modal: opacity 0 / hidden / fixed) i elementy KLIPOWANE
    // przez przodka z overflow hidden/clip/auto/scroll (np. hero-glow, scrollowalna tabela)
    const isInvisibleOrClipped = (el) => {
      let node = el;
      while (node && node !== document.body) {
        const st = getComputedStyle(node);
        if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return true;
        if (st.position === 'fixed') return true; // overlay/sticky — mierzony osobno
        if (node !== el) {
          const ox = st.overflowX;
          if ((ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll')
              && node.getBoundingClientRect().right <= docW + 1) return true; // klipowany/scrollowalny w ramach viewportu
        }
        node = node.parentElement;
      }
      return false;
    };
    document.querySelectorAll('body *').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.right > docW + 1 && !isInvisibleOrClipped(el)) {
        if (out.overflow.length < 8) {
          out.overflow.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} right=${Math.round(rect.right)} (doc=${docW})`);
        }
      }
    });

    // touch targets <40px wysokości (widoczne linki/przyciski; ignoruj inline-footnotes)
    document.querySelectorAll('a[class*="btn"], a[class*="cta"], button, .nav-link, .mobile-link').forEach((el) => {
      const rect = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (rect.height > 0 && rect.height < 40 && st.display !== 'none' && st.visibility !== 'hidden') {
        if (out.small_targets.length < 8) {
          out.small_targets.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} h=${Math.round(rect.height)}px`);
        }
      }
    });
    return out;
  });
  r.width = width;
  results.push(r);
  await ctx.close();
}
await browser.close();

// ── Raport ──
console.log('');
console.log(`═══ VERIFY MOBILE: ${slug} (360/375/412, Playwright file://) ═══`);
console.log('');
const lines = [];
for (const r of results) {
  const issues = [];
  if (!r.headline_visible) issues.push('h1 POZA pierwszym viewportem');
  if (!r.cta_in_fold && !r.sticky_present) issues.push('CTA poza foldem i brak sticky-cta');
  if (r.hero_visual_vh > 60) issues.push(`hero visual ${r.hero_visual_vh}vh (>60 — CTA spada pod fold)`);
  if (r.overflow.length) issues.push(`overflow: ${r.overflow.join(' · ')}`);
  if (r.small_targets.length) issues.push(`tap targets <40px: ${r.small_targets.join(' · ')}`);

  if (issues.length === 0) {
    console.log(`  ✅ ${r.width}px: headline+CTA in-fold, hero ${r.hero_visual_vh}vh, 0 overflow, targets OK`);
    lines.push(`- **${r.width}px:** ✅ OK (hero ${r.hero_visual_vh}vh)`);
  } else {
    warns += issues.length;
    console.log(`  ⚠️  ${r.width}px:`);
    issues.forEach((i) => console.log(`     · ${i}`));
    lines.push(`- **${r.width}px:** ⚠️ ${issues.join(' | ')}`);
  }
}

const artifact = `# Mobile review — ${slug} (v5.0, verify-mobile.mjs)

> Artefakt obliczeniowy ETAP 6 (zastępuje 5 pytań retorycznych certyfikacji).
> Kryteria: h1 + CTA w pierwszym viewportcie (LUB sticky), hero ≤60vh,
> zero per-element overflow, tap targets ≥40px.

${lines.join('\n')}

Wynik: ${warns === 0 ? '✅ PASS' : `⚠️ ${warns} ostrzeżeń (rollout WARN — napraw przed FAIL-iem docelowym)`}
`;
writeFileSync(`landing-pages/${slug}/_mobile-review.md`, artifact, 'utf8');
console.log('');
console.log(`Artefakt: landing-pages/${slug}/_mobile-review.md`);
if (warns > 0) { console.log(`GATE: WARN (${warns})`); process.exit(2); }
console.log('GATE: PASS');
process.exit(0);
