#!/usr/bin/env node
/**
 * verify-offer-math.mjs — spójność cen, matematyki rabatu, claimów czasowych
 * i anti-fabrication liczb (v5.0).
 *
 * Usage: node scripts/verify-offer-math.mjs <slug> [--strict]
 *   default: raport + exit 0 (rollout WARN — patrz README "Zasada rolloutu")
 *   --strict: FAIL → exit 1 (docelowo po 5 landingach bez false positive)
 *
 * Geneza (audyt 2026-06): cervana — hero "bez bólu OD PIERWSZEJ NOCY" vs FAQ "~3 noce";
 * checki offer boxa były presence-only ("Oszczędzasz" istnieje, nikt nie liczył czy
 * stara−nowa=savings). Manus jest strukturalnie zachęcany do fabrykowania liczb
 * ("liczby > przymiotniki") — to tekstowy odpowiednik incydentu Linovo.
 */

import { readFileSync, existsSync } from 'node:fs';

const slug = process.argv[2];
const strict = process.argv.includes('--strict');
if (!slug) { console.error('Usage: node scripts/verify-offer-math.mjs <slug> [--strict]'); process.exit(1); }

const htmlPath = `landing-pages/${slug}/index.html`;
const briefPath = `landing-pages/${slug}/_brief.md`;
if (!existsSync(htmlPath)) { console.error(`❌ Brak ${htmlPath}`); process.exit(1); }

const rawHtml = readFileSync(htmlPath, 'utf8');
const brief = existsSync(briefPath) ? readFileSync(briefPath, 'utf8') : '';

let pass = 0, warn = 0, fail = 0;
const report = (ok, msg, severity = 'fail') => {
  if (ok) { console.log(`  ✅ ${msg}`); pass++; }
  else if (severity === 'warn') { console.log(`  ⚠️  ${msg}`); warn++; }
  else { console.log(`  ❌ ${msg}`); fail++; }
};

// ── KROK 0: tylko WIDOCZNY tekst (strip <style>/<script>/tagi/atrybuty) ──
const visible = rawHtml
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');

// parser kwot z polskim separatorem tysięcy: "1 599 zł", "199 zł"
const parsePln = (s) => parseInt(s.replace(/[\s ]/g, ''), 10);
const plnRe = /(\d{1,3}(?:[\s ]\d{3})*|\d+)\s*zł/g;

// sekcje po klasach (na surowym HTML — scope)
const sectionText = (classRe) => {
  const re = new RegExp(`<section[^>]*class="[^"]*(?:${classRe})[^"]*"[\\s\\S]*?<\\/section>`, 'i');
  const m = rawHtml.match(re);
  return m ? m[0].replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ') : '';
};
const blockText = (classRe) => {
  const re = new RegExp(`class="[^"]*(?:${classRe})[^"]*"[^>]*>([\\s\\S]{0,200}?)<`, 'gi');
  let out = [], m;
  while ((m = re.exec(rawHtml)) !== null) out.push(m[1]);
  return out.join(' ');
};

console.log('');
console.log('═══ VERIFY OFFER MATH: ' + slug + (strict ? ' (STRICT)' : ' (rollout WARN)') + ' ═══');
console.log('');

// ── (a) SPÓJNOŚĆ CEN ──
console.log('💰 a. Spójność cen między sekcjami');
const offerTxt = sectionText('offer|pakiet|zestaw|package|product-offer');
const heroTxt = sectionText('hero');
const stickyTxt = blockText('sticky-cta|mobile-cta|bottom-cta|fixed-cta');
const finalTxt = sectionText('final-cta|cta-banner|closing-cta|last-cta');

const nowRaw = blockText('offer-price-now|price-now|price-new|offer-price-new|price-current');
const oldRaw = blockText('offer-price-old|price-old');
const nowPrices = [...new Set((nowRaw.match(plnRe) || []).map(parsePln))];
const oldPrices = [...new Set((oldRaw.match(plnRe) || []).map(parsePln))];

if (nowPrices.length === 0) {
  report(false, 'Nie znaleziono ceny aktualnej (price-now/new/current) — sprawdź klasy', 'warn');
} else {
  report(nowPrices.length === 1, `Cena aktualna spójna: ${nowPrices.join(' vs ')} zł`, strict ? 'fail' : 'warn');
}
if (oldPrices.length > 0) {
  report(oldPrices.length === 1, `Cena stara spójna: ${oldPrices.join(' vs ')} zł`, strict ? 'fail' : 'warn');
}

// ceny w hero/sticky/final muszą należeć do zbioru {now, old}
const known = new Set([...nowPrices, ...oldPrices]);
for (const [name, txt] of [['hero', heroTxt], ['sticky-cta', stickyTxt], ['final-cta', finalTxt]]) {
  const found = [...new Set((txt.match(plnRe) || []).map(parsePln))];
  const alien = found.filter((p) => !known.has(p));
  if (found.length === 0) continue;
  report(alien.length === 0, `${name}: ceny ∈ {oferta} (${found.join(', ')} zł${alien.length ? ' — OBCE: ' + alien.join(', ') : ''})`, strict ? 'fail' : 'warn');
}

// matematyka: stara − nowa = savings; % rabatu ±1 p.p.
if (nowPrices.length === 1 && oldPrices.length === 1) {
  const [now, old] = [nowPrices[0], oldPrices[0]];
  const expectedSave = old - now;
  const saveTxt = (offerTxt.match(/Oszczędzasz[\s ]+(\d{1,3}(?:[\s ]\d{3})*|\d+)[\s ]*zł/i) || [])[1];
  if (saveTxt) {
    report(parsePln(saveTxt) === expectedSave, `Savings: ${old}−${now}=${expectedSave} vs tekst "Oszczędzasz ${saveTxt} zł"`, strict ? 'fail' : 'warn');
  }
  // % rabatu TYLKO z widocznego tekstu sekcji offer (rawHtml ma translate(-50%) w CSS)
  const pctTxt = (offerTxt.match(/[−-]\s*(\d{1,2})\s*%/) || [])[1];
  if (pctTxt) {
    const expectedPct = Math.round((1 - now / old) * 100);
    report(Math.abs(parseInt(pctTxt, 10) - expectedPct) <= 1, `Rabat %: badge −${pctTxt}% vs policzony −${expectedPct}% (±1 p.p.)`, strict ? 'fail' : 'warn');
  }
}

// ── (b) CLAIMY CZASOWE per kontekst słowny ──
console.log('');
console.log('⏱️  b. Spójność claimów czasowych (per pojęcie)');
const contexts = [
  ['zwrot', /(\d{1,3})\s*(dni|dnia)[^.]{0,40}?zwrot|zwrot[^.]{0,40}?(\d{1,3})\s*(dni|dnia)/gi],
  ['gwarancja', /(\d{1,3})\s*(dni|miesi[ęe]cy|mies|lat[a]?)[^.]{0,40}?gwarancj|gwarancj[^.]{0,40}?(\d{1,3})\s*(dni|miesi[ęe]cy|mies|lat[a]?)/gi],
  ['test', /(\d{1,3})\s*(dni|nocy|noce)[^.]{0,40}?test|test[^.]{0,50}?(\d{1,3})\s*(dni|nocy|noce)/gi],
];
for (const [name, re] of contexts) {
  const vals = new Set();
  let m;
  while ((m = re.exec(visible)) !== null) vals.add(m[1] || m[3]);
  if (vals.size <= 1) {
    if (vals.size === 1) report(true, `${name}: spójnie ${[...vals][0]}`);
  } else {
    report(false, `${name}: ROZJAZD wartości w obrębie pojęcia: ${[...vals].join(' vs ')}`, strict ? 'fail' : 'warn');
  }
}

// ── (c) ANTI-FABRICATION: liczby-sieroty vs brief ──
console.log('');
console.log('🔢 c. Anti-fabrication: liczby z jednostką vs _brief.md');
if (!brief) {
  report(false, 'Brak _brief.md — anti-fabrication pominięte', 'warn');
} else {
  // whitelist: WSZYSTKIE liczby z briefu + auto-seed
  const briefNums = new Set((brief.match(/\d+(?:[,.]\d+)?/g) || []).map((n) => n.replace(',', '.')));
  ['14', '30', '24', '100', '7', '2026'].forEach((n) => briefNums.add(n));
  nowPrices.forEach((p) => briefNums.add(String(p)));
  oldPrices.forEach((p) => briefNums.add(String(p)));
  if (nowPrices.length === 1 && oldPrices.length === 1) {
    briefNums.add(String(oldPrices[0] - nowPrices[0]));
    briefNums.add(String(Math.round((1 - nowPrices[0] / oldPrices[0]) * 100))); // % rabatu
  }
  // liczby w elementach data-placeholder (poglądowe, legalizowane disclaimerem stopki)
  const phRe = /data-placeholder="[^"]*"[^>]*>([^<]{0,80})</g;
  let pm;
  while ((pm = phRe.exec(rawHtml)) !== null) {
    (pm[1].match(/\d+(?:[,.]\d+)?/g) || []).forEach((n) => briefNums.add(n.replace(',', '.')));
  }

  // liczby social proof (opinii/klientów/osób) legalizowane disclaimerem stopki (jak Grupa 10g)
  const hasDisclaimer = /charakter poglądowy|faza wprowadzenia|dane poglądowe/i.test(rawHtml);

  // liczby marketingowe = liczba + jednostka claimowa w widocznym tekście
  // (BEZ ×/x — wymiary placeholderów typu "800 × 500" to briefy fotografa, nie claimy;
  //  liczba obsługuje polski separator tysięcy "8 200")
  const claimRe = /(\d{1,3}(?:[\s ]\d{3})+|\d+(?:[,.]\d+)?)\s*(%|zł|dni|nocy|noce|lat|kPa|BAR|bar|ml|kg|°C|godzin|min\b|sek|stref|opinii|klientów|osób)/g;
  const orphans = new Map();
  let m;
  while ((m = claimRe.exec(visible)) !== null) {
    // "Produkt × 1 199 zł" = ilość×cena (demo-cart), nie separator tysięcy — pomiń
    const before = visible.slice(Math.max(0, m.index - 3), m.index);
    if (/[×x]\s*$/.test(before)) continue;
    const num = m[1].replace(/[\s ]/g, '').replace(',', '.');
    const unit = m[2];
    if (hasDisclaimer && /opinii|klientów|osób/.test(unit)) continue; // poglądowe z disclaimerem
    if (!briefNums.has(num)) {
      const key = `${m[1]} ${unit}`;
      orphans.set(key, (orphans.get(key) || 0) + 1);
    }
  }
  if (orphans.size === 0) {
    report(true, 'Wszystkie liczby-claimy mają pokrycie w briefie');
  } else {
    const list = [...orphans.keys()].slice(0, 10).join(' · ');
    report(false, `${orphans.size} liczb-sierot bez pokrycia w briefie: ${list}${orphans.size > 10 ? ' …' : ''} → USUŃ albo dopisz do sekcji 13.3 ze źródłem`, 'warn');
  }
}

console.log('');
console.log(`SUMMARY: ✅ ${pass} · ⚠️  ${warn} · ❌ ${fail}`);
if (fail > 0) { console.log(`GATE: FAIL (FAIL=${fail})`); process.exit(1); }
if (warn > 0) { console.log(`GATE: WARN (${warn} — rollout: zweryfikuj ręcznie, docelowo --strict)`); process.exit(0); }
console.log('GATE: PASS');
process.exit(0);
