#!/usr/bin/env node
// migrate-to-render-image.mjs — migracja URL-i Supabase z /object/public/ na /render/image/public/
//
// Powód: /object/public/ zwraca Cache-Control: no-cache (Cloudflare CDN przed Supabase wymusza).
// /render/image/public/ z ?format=webp zwraca:
//   - Content-Type: image/webp ✅
//   - Size: ~23% mniejszy niż oryginalny WebP (Supabase re-encode)
//   - Cache-Control: max-age=31536000 (1 rok) ✅
//
// Empirycznie zmierzone (silktip):
//   - Original WebP /object/public/: 72 KB, no-cache
//   - /render/image/?format=webp:    56 KB (-23%), cache 1 rok
//
// Migration: regex replace URL-i w HTML. Zachowuje ścieżkę, zmienia tylko prefix + dodaje query params.
//
// Usage: node scripts/migrate-to-render-image.mjs [slug] [slug2...]
//        node scripts/migrate-to-render-image.mjs --all

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const slugs = args.includes('--all')
  ? fs.readdirSync(path.join(REPO_ROOT, 'landing-pages'))
      .filter(d => fs.statSync(path.join(REPO_ROOT, 'landing-pages', d)).isDirectory())
      .filter(d => fs.existsSync(path.join(REPO_ROOT, 'landing-pages', d, 'index.html')))
  : args.filter(a => !a.startsWith('--'));

if (slugs.length === 0) {
  console.error('Usage: node scripts/migrate-to-render-image.mjs [slug] [--all]');
  process.exit(1);
}

// Match: /storage/v1/object/public/attachments/<path>.webp (i podobne raster)
// Scope: tylko obrazy w `ai-generated/` lub `landing/.../reels/` (te są kontentowo niezmienne)
// NIE migrujemy: logo.png (już używany przez TakeDrop, nie ruszać)
const OBJECT_PUBLIC_RE = /https:\/\/yxmavwkwnfuphjqbelws\.supabase\.co\/storage\/v1\/object\/public\/(attachments\/(?:ai-generated\/[^/]+|landing\/[^/]+\/reels)\/[^"'\s)]+\.(?:webp|png|jpg|jpeg))/gi;

const RENDER_PREFIX = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/render/image/public/';

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  MIGRATE URL: /object/public/ → /render/image/?format=webp`);
console.log(`  Cache: no-cache → max-age=31536000`);
console.log(`  Size: WebP -23% mniejsze (Supabase re-encode)`);
console.log(`═══════════════════════════════════════════════════════════\n`);

let totalReplaced = 0;
let landingsTouched = 0;

for (const slug of slugs) {
  const htmlPath = path.join(REPO_ROOT, 'landing-pages', slug, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;

  let html = fs.readFileSync(htmlPath, 'utf-8');
  const matches = html.match(OBJECT_PUBLIC_RE) || [];
  if (matches.length === 0) {
    console.log(`  ⏭️  ${slug}: 0 URL-i do migracji`);
    continue;
  }

  // Replace: /object/public/<path>.ext → /render/image/public/<path>.ext?format=webp&width=1200&quality=85
  // width=1200 jest retina-ready dla wyświetlanego ~600-800px
  // quality=85 — sweet spot WebP
  html = html.replace(OBJECT_PUBLIC_RE, `${RENDER_PREFIX}$1?format=webp&width=1200&quality=85`);

  fs.writeFileSync(htmlPath, html);
  console.log(`  ✅ ${slug}: ${matches.length} URL-i migrowanych`);
  totalReplaced += matches.length;
  landingsTouched++;
}

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  Razem: ${landingsTouched} landingów, ${totalReplaced} URL-i`);
console.log(`  Każdy URL: cache no-cache → 1 rok, size WebP -23%`);
console.log(`═══════════════════════════════════════════════════════════`);
