#!/usr/bin/env node
// optimize-landing-images.mjs — batch PNG → WebP + resize dla obrazów AI landingu
//
// Usage: node scripts/optimize-landing-images.mjs [slug]
//        node scripts/optimize-landing-images.mjs [slug] --dry-run
//
// Co robi:
// 1. Listuje wszystkie .png w attachments/ai-generated/<slug>/ (Supabase Storage)
// 2. Pobiera każdy, konwertuje do WebP (quality 85) + resize max 1600x1600
// 3. Wgrywa .webp jako duplikat (oryginalny .png zostaje jako backup)
// 4. Update landing-pages/<slug>/index.html: zamiana ai-generated/*.png → *.webp
//    (zachowuje logo.png i inne pliki spoza ai-generated/)
//
// Wymaga: .env z SUPABASE_SERVICE_KEY, node 18+, sharp + @supabase/supabase-js w package.json

import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// Parse args
const SLUG = process.argv[2];
const DRY_RUN = process.argv.includes('--dry-run');

if (!SLUG || SLUG.startsWith('--')) {
  console.error('Usage: node scripts/optimize-landing-images.mjs [slug] [--dry-run]');
  console.error('Example: node scripts/optimize-landing-images.mjs zoomik');
  process.exit(1);
}

// Load .env manually (Node nie ma natywnego dotenv)
const envPath = path.join(REPO_ROOT, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  OPTIMIZE LANDING IMAGES: ${SLUG}`);
console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no upload, no HTML update)' : 'LIVE'}`);
console.log(`═══════════════════════════════════════════════════════════\n`);

// 1. Wykryj wszystkie prefiksy storage z HTML (czystosz używa UUID zamiast slug,
//    niektóre landingi mają mix .png/.jpg w różnych prefixach)
const htmlPath = path.join(REPO_ROOT, 'landing-pages', SLUG, 'index.html');
const htmlContent = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : '';

const prefixesInHtml = new Set();
// Scope: ai-generated/<id>/ (AI images) + landing/<slug>/reels/ (video thumbnails)
const imgUrlRegex = /attachments\/(ai-generated\/[^/]+|landing\/[^/]+\/reels)\/[^"\s]+\.(png|jpg|jpeg)/g;
let match;
while ((match = imgUrlRegex.exec(htmlContent)) !== null) {
  prefixesInHtml.add(match[1]);
}

// Fallback: jeśli HTML nie istnieje, użyj default `ai-generated/<slug>`
if (prefixesInHtml.size === 0) {
  prefixesInHtml.add(`ai-generated/${SLUG}`);
}

console.log(`📁 Storage prefixes from HTML: ${[...prefixesInHtml].join(', ')}\n`);

// Zbierz wszystkie pliki z wszystkich prefixów
const allFiles = [];
for (const prefix of prefixesInHtml) {
  const { data: files, error: listError } = await supabase
    .storage.from('attachments')
    .list(prefix, { limit: 200 });

  if (listError) {
    console.log(`  ⚠️  ${prefix}: list error (${listError.message})`);
    continue;
  }

  if (!files || files.length === 0) {
    console.log(`  ⚠️  ${prefix}: empty`);
    continue;
  }

  files.forEach(f => allFiles.push({ ...f, prefix }));
}

if (allFiles.length === 0) {
  console.log(`❌ No files found in any prefix. Aborting.`);
  process.exit(1);
}

// Filter raster images (PNG + JPG + JPEG)
const rasters = allFiles.filter(f => /\.(png|jpe?g)$/i.test(f.name));
const existingWebps = new Set(allFiles.filter(f => f.name.endsWith('.webp')).map(f => `${f.prefix}/${f.name}`));

console.log(`📁 Found: ${rasters.length} raster images, ${existingWebps.size} WebP already optimized\n`);

let totalBefore = 0;
let totalAfter = 0;
let converted = 0;
let skipped = 0;
let failed = 0;

for (const file of rasters) {
  const webpName = file.name.replace(/\.(png|jpe?g)$/i, '.webp');
  const webpKey = `${file.prefix}/${webpName}`;

  if (existingWebps.has(webpKey)) {
    console.log(`  ⏭️  ${file.prefix}/${file.name} → ${webpName} (już istnieje)`);
    skipped++;
    continue;
  }

  const remotePath = `${file.prefix}/${file.name}`;
  const webpRemotePath = `${file.prefix}/${webpName}`;

  try {
    // Download PNG
    const { data: download, error: dlError } = await supabase.storage
      .from('attachments').download(remotePath);

    if (dlError || !download) {
      console.log(`  ❌ ${file.name}: download fail (${dlError?.message || 'no data'})`);
      failed++;
      continue;
    }

    const buffer = Buffer.from(await download.arrayBuffer());
    const beforeKB = (buffer.length / 1024).toFixed(0);
    totalBefore += buffer.length;

    // Convert to WebP + resize. Reels thumbnails wyświetlane na ~280px → 800 retina-ready.
    // AI images wyświetlane jako hero/bento ~800px → 1600 retina-ready.
    const isReel = file.prefix.includes('/reels');
    const maxSize = isReel ? 800 : 1600;
    const quality = isReel ? 80 : 85;
    const webp = await sharp(buffer)
      .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    const afterKB = (webp.length / 1024).toFixed(0);
    totalAfter += webp.length;
    const savings = ((1 - webp.length / buffer.length) * 100).toFixed(0);

    if (DRY_RUN) {
      console.log(`  🔍 ${file.name} (${beforeKB}KB) → ${webpName} (${afterKB}KB) [-${savings}%]`);
      converted++;
      continue;
    }

    // Upload WebP z długim cache (1 rok, immutable bo plik kontentowo niezmienny)
    // Supabase default = 'no-cache' co psuje PageSpeed (przeglądarka revaliduje co request)
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(webpRemotePath, webp, {
        contentType: 'image/webp',
        cacheControl: '31536000',  // 1 rok
        upsert: false
      });

    if (uploadError) {
      console.log(`  ❌ ${file.name}: upload fail (${uploadError.message})`);
      failed++;
      continue;
    }

    console.log(`  ✅ ${file.name} (${beforeKB}KB) → ${webpName} (${afterKB}KB) [-${savings}%]`);
    converted++;

  } catch (e) {
    console.log(`  ❌ ${file.name}: ${e.message}`);
    failed++;
  }
}

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  Konwertowano: ${converted}, Skipped: ${skipped}, Failed: ${failed}`);
if (totalBefore > 0) {
  const totalSavings = ((1 - totalAfter / totalBefore) * 100).toFixed(0);
  console.log(`  Total: ${(totalBefore/1024/1024).toFixed(2)} MB → ${(totalAfter/1024/1024).toFixed(2)} MB (-${totalSavings}%)`);
}
console.log(`═══════════════════════════════════════════════════════════\n`);

// 2. Update HTML — replace ai-generated/<prefix>/*.png|jpg → *.webp
if (!DRY_RUN && converted > 0) {
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf-8');
    // Match obu scope: ai-generated/<id>/* + landing/<slug>/reels/*
    const scopeRe = /(ai-generated\/[a-z0-9-]+|landing\/[a-z0-9-]+\/reels)\/[^"\s]+/;
    const beforePng = (html.match(new RegExp(scopeRe.source + '\\.png', 'g')) || []).length;
    const beforeJpg = (html.match(new RegExp(scopeRe.source + '\\.(jpg|jpeg)', 'gi')) || []).length;

    // Replace .png/.jpg/.jpeg → .webp tylko w naszym scope
    // NIE zamienia logo.png, MP4 ani innych assetów
    html = html.replace(new RegExp('(' + scopeRe.source + ')\\.(png|jpg|jpeg)', 'gi'), '$1.webp');

    const afterCount = (html.match(new RegExp(scopeRe.source + '\\.webp', 'g')) || []).length;

    // Migracja URL: /object/public/ → /render/image/public/?format=webp&width=1200&quality=85
    // Powód: /object/public/ zwraca no-cache (Supabase Cloudflare CDN ignoruje cacheControl).
    // /render/image/public/?format=webp zwraca WebP -23% mniejszy + cache 1 rok.
    const OBJECT_PUBLIC_RE = /https:\/\/yxmavwkwnfuphjqbelws\.supabase\.co\/storage\/v1\/object\/public\/(attachments\/(?:ai-generated\/[^/]+|landing\/[^/]+\/reels)\/[^"'\s)]+\.(?:webp|png|jpg|jpeg))/gi;
    const RENDER_PREFIX = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/render/image/public/';
    const renderCount = (html.match(OBJECT_PUBLIC_RE) || []).length;
    if (renderCount > 0) {
      html = html.replace(OBJECT_PUBLIC_RE, `${RENDER_PREFIX}$1?format=webp&width=1200&quality=85`);
      console.log(`📡 Migracja na /render/image/: ${renderCount} URL-i (cache no-cache → 1 rok, WebP -23%)`);
    }
    fs.writeFileSync(htmlPath, html);

    console.log(`📝 HTML zaktualizowany: ${beforePng} .png + ${beforeJpg} .jpg → ${afterCount} .webp`);
    console.log(`   ${htmlPath}\n`);
  } else {
    console.log(`⚠️  ${htmlPath} nie istnieje — pomijam HTML update\n`);
  }
}

console.log(DRY_RUN
  ? '✅ DRY RUN gotowy. Aby wdrożyć: node scripts/optimize-landing-images.mjs ' + SLUG
  : '✅ Optymalizacja gotowa. Commit + push HTML aby Vercel pobrał nową wersję.');
