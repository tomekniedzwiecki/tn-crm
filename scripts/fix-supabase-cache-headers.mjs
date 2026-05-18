#!/usr/bin/env node
// fix-supabase-cache-headers.mjs — re-uploaduje istniejące assety z długim cache
//
// Problem: Supabase Storage default = 'Cache-Control: no-cache' → przeglądarka
// revaliduje każdy request → PageSpeed flag "Używaj efektywnego czasu cache"
// (478 KiB potencjalnej oszczędności przy ponownych wizytach).
//
// Fix: re-upload z cacheControl=31536000 (1 rok) + upsert=true.
// Pliki kontentowo niezmienne (hashed name lub stabilna ścieżka).
//
// Usage: node scripts/fix-supabase-cache-headers.mjs [slug] [slug2...]
//        node scripts/fix-supabase-cache-headers.mjs --all

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const envPath = path.join(REPO_ROOT, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const supabase = createClient(
  'https://yxmavwkwnfuphjqbelws.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

const args = process.argv.slice(2);
const slugs = args.includes('--all')
  ? fs.readdirSync(path.join(REPO_ROOT, 'landing-pages'))
      .filter(d => fs.statSync(path.join(REPO_ROOT, 'landing-pages', d)).isDirectory())
      .filter(d => fs.existsSync(path.join(REPO_ROOT, 'landing-pages', d, 'index.html')))
  : args.filter(a => !a.startsWith('--'));

if (slugs.length === 0) {
  console.error('Usage: node scripts/fix-supabase-cache-headers.mjs [slug] [--all]');
  process.exit(1);
}

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  FIX SUPABASE CACHE HEADERS — ${slugs.length} landingów`);
console.log(`  Cache-Control: no-cache → max-age=31536000 (1 rok)`);
console.log(`═══════════════════════════════════════════════════════════\n`);

let totalReuploaded = 0;
let totalFailed = 0;

for (const slug of slugs) {
  const htmlPath = path.join(REPO_ROOT, 'landing-pages', slug, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Wykryj prefiksy: ai-generated/<id>/, landing/<slug>/reels/, landing/<slug>/ (logo)
  const prefixes = new Set();
  const re = /attachments\/(ai-generated\/[^/]+|landing\/[^/]+(\/reels)?)\//g;
  let m;
  while ((m = re.exec(html)) !== null) prefixes.add(m[1]);

  if (prefixes.size === 0) {
    console.log(`  ⏭️  ${slug}: brak prefiksów w HTML`);
    continue;
  }

  let slugReuploaded = 0;
  let slugFailed = 0;

  for (const prefix of prefixes) {
    const { data: files, error: listErr } = await supabase.storage
      .from('attachments').list(prefix, { limit: 200 });
    if (listErr || !files || files.length === 0) continue;

    // Filtruj tylko zoptymalizowane formaty (webp, png logo) — pomijamy MP4 (są w storage ale ciężkie)
    const targets = files.filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f.name));

    for (const file of targets) {
      const remotePath = `${prefix}/${file.name}`;
      try {
        const { data: dl, error: dlErr } = await supabase.storage
          .from('attachments').download(remotePath);
        if (dlErr || !dl) { slugFailed++; continue; }

        const buffer = Buffer.from(await dl.arrayBuffer());
        const mimeType = file.metadata?.mimetype ||
          (file.name.endsWith('.webp') ? 'image/webp' :
           file.name.endsWith('.png')  ? 'image/png'  : 'image/jpeg');

        const { error: upErr } = await supabase.storage.from('attachments')
          .upload(remotePath, buffer, {
            contentType: mimeType,
            cacheControl: '31536000',
            upsert: true,
          });

        if (upErr) { slugFailed++; }
        else { slugReuploaded++; }
      } catch (e) {
        slugFailed++;
      }
    }
  }

  console.log(`  ${slugFailed === 0 ? '✅' : '⚠️ '} ${slug}: ${slugReuploaded} re-uploaded${slugFailed ? `, ${slugFailed} failed` : ''}`);
  totalReuploaded += slugReuploaded;
  totalFailed += slugFailed;
}

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  Razem: ${totalReuploaded} re-uploaded, ${totalFailed} failed`);
console.log(`  Cache: max-age=31536000 (1 rok) - PageSpeed "efficient cache" ✓`);
console.log(`═══════════════════════════════════════════════════════════`);
