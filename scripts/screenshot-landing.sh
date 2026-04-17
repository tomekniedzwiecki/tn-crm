#!/bin/bash
# screenshot-landing.sh — Playwright screenshoty 3 viewports dla ETAP 4 VERIFY
#
# Użycie: bash scripts/screenshot-landing.sh [slug]
# Przykład: bash scripts/screenshot-landing.sh vitrix
#
# Tworzy: C:/tmp/[slug]_shots/{desktop,tablet,mobile}_full.png + mid-scroll viewporty
# Playwright musi być zainstalowany: npm install -D playwright && npx playwright install chromium

set -e

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Użycie: $0 [slug]"
  echo "Przykład: $0 vitrix"
  exit 1
fi

FILE="landing-pages/$SLUG/index.html"
if [ ! -f "$FILE" ]; then
  echo "❌ Brak pliku: $FILE"
  exit 1
fi

# Ensure Playwright installed
if [ ! -f "node_modules/.bin/playwright" ]; then
  echo "📦 Instaluję Playwright (jednorazowo)..."
  npm install -D playwright && npx playwright install chromium
fi

# Create temp shoot script
SHOOT_SCRIPT="/tmp/_shoot_${SLUG}.mjs"
OUT_DIR="C:/tmp/${SLUG}_shots"

cat > "$SHOOT_SCRIPT" <<EOF
import { chromium } from 'playwright';
import fs from 'fs';

const url = 'file:///C:/repos_tn/tn-crm/landing-pages/${SLUG}/index.html';
const out = '${OUT_DIR}';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'mobile',  width: 375,  height: 812  },
];

for (const v of viewports) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(2500);  // wait for split headline + counter + images
  await page.evaluate(() => { const c = document.getElementById('cookie'); if (c) c.style.display = 'none'; });
  // Scroll full page to trigger IntersectionObserver fade-ins
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: \`\${out}/\${v.name}_full.png\`, fullPage: true });
  // Mid-scroll viewports dla debugowania specific sections
  for (const y of [900, 2000, 3500, 5000, 7000, 9000]) {
    if (y < h) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(300);
      await page.screenshot({ path: \`\${out}/\${v.name}_y\${y}.png\`, fullPage: false });
    }
  }
  console.log(\`[ok] \${v.name}: \${v.width}x\${v.height}\`);
  await ctx.close();
}
await browser.close();
console.log('done → ${OUT_DIR}');
EOF

echo "🎬 Uruchamiam Playwright dla $SLUG..."
node "$SHOOT_SCRIPT"

echo ""
echo "📸 Screenshoty: $OUT_DIR"
echo ""
echo "Następny krok — obejrzyj screenshoty w Claude Code Read tool:"
echo "  ${OUT_DIR}/desktop_full.png"
echo "  ${OUT_DIR}/mobile_full.png"
echo ""
echo "Checklist w CLAUDE_LANDING_VERIFY.md — Krok 5"

# Cleanup temp script
rm -f "$SHOOT_SCRIPT"
