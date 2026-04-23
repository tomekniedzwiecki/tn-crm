#!/usr/bin/env node
/**
 * generate-pmax-images.mjs — produces PMax image assets for getmypermit.pl
 *
 * Reads image_briefs from c:/repos_tn/getmypermit/KAMPANIA_PMAX_CONTENT.json,
 * generates 3 ratios per concept via generate-image edge function (gpt-image-2 provider),
 * post-processes with sharp (crop to exact PMax ratio, resize, overlay headline text + logo),
 * saves JPGs to c:/repos_tn/getmypermit/img/ads/
 *
 * Usage:
 *   node scripts/generate-pmax-images.mjs           — full batch (15 briefs × 3 formats = 45 assets)
 *   node scripts/generate-pmax-images.mjs --test    — 1 concept × 1 format (square) for QA
 *   node scripts/generate-pmax-images.mjs --only=5  — first N briefs only
 *
 * Requires SUPABASE_SERVICE_KEY in env (loaded from tn-crm/.env)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CONTENT_PACK = 'C:/repos_tn/getmypermit/KAMPANIA_PMAX_CONTENT.json';
const OUTPUT_DIR = 'C:/repos_tn/getmypermit/img/ads';
const SUPA_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;
const WORKFLOW_ID = 'getmypermit-pmax';
const CONCURRENCY = 3;

if (!SUPA_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY. Source tn-crm/.env before running.');
  process.exit(1);
}

// PMax formats. aspectRatio = value sent to edge function (Gemini/GPT mapping).
// cropRatio = exact PMax ratio we post-crop to. target = final pixel dimensions.
const FORMATS = [
  { name: 'landscape', aspectRatio: '16:9', targetW: 1200, targetH: 628, cropRatio: 1200 / 628 },
  { name: 'square',    aspectRatio: '1:1',  targetW: 1200, targetH: 1200, cropRatio: 1.0 },
  { name: 'portrait',  aspectRatio: '4:5',  targetW: 960,  targetH: 1200, cropRatio: 960 / 1200 },
];

function buildPrompt(brief) {
  return [
    brief.visual_direction,
    '',
    'STYLE: Editorial-grade photography, not illustration or 3D render. Natural lighting, slightly desaturated colors. European/Polish urban context — Wroclaw mood welcome but not required. Think editorial shoot for The Economist, Financial Times or Reuters — NOT stock-photo kitsch.',
    '',
    'COLORS: Accent blue #0055FF, white, black, natural tones. Avoid oversaturation.',
    '',
    `MOOD: ${brief.mood}.`,
    '',
    'STRICT RULES:',
    '- Absolutely NO text, NO letters, NO typography, NO logos anywhere in the image — we overlay text afterwards in post-processing',
    '- NO recognizable faces of celebrities, politicians, or real persons — AI-generated fictional faces only',
    '- NO brand logos in background (no Nike, Apple, H&M etc.)',
    '- NO national flags, no state emblems, no government seals that could mislead as official',
    '- Face never cropped by frame edge; compose for safe-area — text overlay will go in bottom-left quadrant, keep that region visually clean (sky, wall, defocused background)',
    '- Natural facial expression fitting the mood — NOT staged stock-photo smile',
    '- Subject clothing: casual-professional, not luxury, not pajamas',
  ].join('\n');
}

async function generateImage(prompt, aspectRatio) {
  const res = await fetch(`${SUPA_URL}/functions/v1/generate-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      count: 1,
      workflow_id: WORKFLOW_ID,
      aspect_ratio: aspectRatio,
      provider: 'gpt-image-2',
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 300)); }
  if (!data.images?.[0]?.url) throw new Error('No image URL: ' + JSON.stringify(data).slice(0, 300));
  return data.images[0].url;
}

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function slugify(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function wrapLines(headline, maxCharsPerLine = 22) {
  const s = String(headline).trim();
  if (s.length <= maxCharsPerLine) return [s];
  // Greedy: pack max chars into line 1, remainder on line 2.
  // This avoids awkward splits like "One mistake" | "= illegal stay".
  const words = s.split(/\s+/);
  let line1 = '';
  for (const w of words) {
    const candidate = line1 ? line1 + ' ' + w : w;
    if (candidate.length > maxCharsPerLine && line1) break;
    line1 = candidate;
  }
  const line2 = s.slice(line1.length).trim();
  if (!line2) return [line1];
  return [line1, line2];
}

function buildOverlay(headline, W, H) {
  const pad = Math.round(W * 0.045);
  const lines = wrapLines(headline, 24);
  // Font size: ~5% width for 1 line, ~4.6% for 2 lines (tighter to avoid overlap)
  const fontSize = Math.round(W * (lines.length === 1 ? 0.055 : 0.048));
  const lineHeight = Math.round(fontSize * 1.08);
  const blockHeight = fontSize + (lines.length - 1) * lineHeight;
  // Position block: bottom-left quadrant, above logo area
  const logoClearance = Math.round(pad * 1.8);
  const lastLineY = H - logoClearance;
  const firstLineY = lastLineY - (lines.length - 1) * lineHeight;

  // Gradient: dark fade from bottom-left to mid-image, ensures text contrast regardless of bg
  const gradientH = Math.round(blockHeight + pad * 3);
  const gradY = H - gradientH;

  const textElems = lines.map((line, i) =>
    `<text x="${pad}" y="${firstLineY + i * lineHeight}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${fontSize}" fill="white" letter-spacing="-1">${escapeXml(line)}</text>`
  ).join('');

  const logoY = H - Math.round(pad * 0.6);

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="black" stop-opacity="0.72"/>
      <stop offset="70%" stop-color="black" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="black" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect x="0" y="${gradY}" width="${W}" height="${gradientH}" fill="url(#bg)"/>
  <g filter="url(#sh)">${textElems}</g>
  <text x="${W - pad}" y="${logoY}" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="${Math.round(W * 0.013)}" fill="white" fill-opacity="0.85" text-anchor="end" filter="url(#sh)">getmypermit.pl</text>
</svg>`;
}

async function processOne(brief, format, index) {
  const slug = slugify(brief.concept_name);
  const tag = `[${String(index + 1).padStart(2, '0')} ${format.name}]`;
  console.log(`${tag} generating (${brief.concept_name})...`);

  const url = await generateImage(buildPrompt(brief), format.aspectRatio);
  console.log(`${tag}   → URL: ${url}`);

  // Fetch binary
  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Fetch ${url} → ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());

  // Get metadata for crop decision
  const meta = await sharp(buf).metadata();
  const curRatio = meta.width / meta.height;
  const targetRatio = format.cropRatio;

  let pipeline = sharp(buf);

  // Crop to target ratio if needed (>2% mismatch)
  if (Math.abs(curRatio - targetRatio) > 0.02) {
    let cropW, cropH, cropX, cropY;
    if (curRatio > targetRatio) {
      // Source wider → crop width (center)
      cropW = Math.round(meta.height * targetRatio);
      cropH = meta.height;
      cropX = Math.round((meta.width - cropW) / 2);
      cropY = 0;
    } else {
      // Source taller → crop height (center)
      cropW = meta.width;
      cropH = Math.round(meta.width / targetRatio);
      cropX = 0;
      cropY = Math.round((meta.height - cropH) / 2);
    }
    pipeline = pipeline.extract({ left: cropX, top: cropY, width: cropW, height: cropH });
  }

  // Resize to final PMax dimensions
  pipeline = pipeline.resize(format.targetW, format.targetH, { fit: 'cover' });

  // Overlay headline + logo watermark
  const overlaySvg = buildOverlay(brief.headline_overlay_en, format.targetW, format.targetH);
  pipeline = pipeline.composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }]);

  // Export JPG
  const outFile = `gmp-${String(index + 1).padStart(2, '0')}-${slug}-${format.name}.jpg`;
  const outPath = path.join(OUTPUT_DIR, outFile);
  await pipeline.jpeg({ quality: 88, mozjpeg: true }).toFile(outPath);
  console.log(`${tag}   ✓ ${outFile}`);
  return outPath;
}

async function main() {
  const testMode = process.argv.includes('--test');
  const onlyArg = process.argv.find(a => a.startsWith('--only='));
  const onlyN = onlyArg ? parseInt(onlyArg.split('=')[1], 10) : null;

  const pack = JSON.parse(await fs.readFile(CONTENT_PACK, 'utf-8'));
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let briefs = pack.image_briefs;
  if (onlyN) briefs = briefs.slice(0, onlyN);
  if (testMode) briefs = briefs.slice(0, 1);

  const formats = testMode ? [FORMATS[1]] : FORMATS;

  const tasks = [];
  for (let i = 0; i < briefs.length; i++) {
    for (const fmt of formats) {
      tasks.push({ brief: briefs[i], format: fmt, index: i });
    }
  }
  console.log(`\n=== Plan: ${tasks.length} asset(s) — ${briefs.length} brief(s) × ${formats.length} format(s) ===\n`);

  const results = [];
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    const r = await Promise.allSettled(batch.map(t => processOne(t.brief, t.format, t.index)));
    results.push(...r);
  }

  const failed = results.filter(r => r.status === 'rejected');
  const ok = results.length - failed.length;
  console.log(`\n=== Done: ${ok}/${results.length} succeeded ===`);
  failed.forEach((f, i) => console.error(`  Failed: ${f.reason?.message || f.reason}`));
  if (failed.length) process.exit(2);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
