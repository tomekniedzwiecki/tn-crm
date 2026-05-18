#!/usr/bin/env node
// optimize-aliexpress-thumbs.mjs — dodaje AliExpress CDN suffix _640x640q75.jpg
// do wszystkich URL-i `ae-pic-a1.aliexpress-media.com/kf/<hash>.jpg|jpeg`
// w HTML landingu. CDN automatycznie serwuje WebP (content-negotiation).
//
// Empirycznie zmierzone: 1448 KB → 43 KB (-97%) dla największego obrazka.
//
// Usage: node scripts/optimize-aliexpress-thumbs.mjs [slug]
//        node scripts/optimize-aliexpress-thumbs.mjs --all
//
// Idempotentne: nie zamienia URL-i które już mają suffix `_NxNq*`.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const SUFFIX = '_640x640q75.jpg';
// Match: ae-pic-a1.aliexpress-media.com/kf/<hash>.jpg lub .jpeg
// Negative lookahead: nie matchuj jeśli już ma suffix _NxN
const RE = /(ae-pic-a1\.aliexpress-media\.com\/kf\/[A-Za-z0-9]+\.jpe?g)(?!_\d)/g;

const args = process.argv.slice(2);
const slugs = args.includes('--all')
  ? fs.readdirSync(path.join(REPO_ROOT, 'landing-pages'))
      .filter(d => fs.statSync(path.join(REPO_ROOT, 'landing-pages', d)).isDirectory())
      .filter(d => fs.existsSync(path.join(REPO_ROOT, 'landing-pages', d, 'index.html')))
  : args.filter(a => !a.startsWith('--'));

if (slugs.length === 0) {
  console.error('Usage: node scripts/optimize-aliexpress-thumbs.mjs [slug] [slug2...]');
  console.error('   or: node scripts/optimize-aliexpress-thumbs.mjs --all');
  process.exit(1);
}

let totalReplaced = 0;
let landingsTouched = 0;

for (const slug of slugs) {
  const htmlPath = path.join(REPO_ROOT, 'landing-pages', slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.log(`  ⏭️  ${slug}: brak index.html`);
    continue;
  }

  let html = fs.readFileSync(htmlPath, 'utf-8');
  const matches = html.match(RE) || [];
  if (matches.length === 0) {
    console.log(`  ⏭️  ${slug}: 0 AliExpress URLs do optymalizacji`);
    continue;
  }

  html = html.replace(RE, `$1${SUFFIX}`);
  fs.writeFileSync(htmlPath, html);

  console.log(`  ✅ ${slug}: ${matches.length} URL-i zoptymalizowanych`);
  totalReplaced += matches.length;
  landingsTouched++;
}

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  Razem: ${landingsTouched} landingów, ${totalReplaced} URL-i AliExpress`);
console.log(`  Każdy URL: original 200-1400 KB → ~43 KB (-95-97%)`);
console.log(`  Szacowana oszczędność: ~${Math.round(totalReplaced * 100)} KB - ${Math.round(totalReplaced * 200)} KB`);
console.log(`═══════════════════════════════════════════════════════════`);
