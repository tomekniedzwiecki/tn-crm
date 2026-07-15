// Fabryka styleguide'ów design systemów landingów sklepów.
// node _generator/build.mjs  →  dla każdego systemu z ../systems.json generuje:
//   DS-XX-slug/tokens.css      (paleta ról + typografia + geometria/cienie wg charakteru)
//   DS-XX-slug/components.html (żywy styleguide z template.html)
//   DS-XX-slug/MOOD.md         (charakter, kategorie, persona, anty, foto-hint)
// Zero zależności. DS = styl; struktura/eventy/zakazy z STANDARD-LANDING-SKLEPY.md.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const systems = JSON.parse(readFileSync(join(ROOT, 'systems.json'), 'utf8')).systems;
const template = readFileSync(join(__dirname, 'template.html'), 'utf8');

/* ---------- kolor: konwersje i kontrast (WCAG) ---------- */
const hexToRgb = (h) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const chan = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
const lum = (hex) => { const [r, g, b] = hexToRgb(hex); return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b); };
const contrast = (a, b) => { const L1 = lum(a), L2 = lum(b); const hi = Math.max(L1, L2), lo = Math.min(L1, L2); return (hi + 0.05) / (lo + 0.05); };
const rgba = (hex, a) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };

const DARK_TEXT = '#171512';   // ciepła prawie-czerń na jasne akcenty (gold/orange/coral)
// tekst na jednolitym akcencie: biały gdy AA-large pewne (≥3.3), inaczej ciemny
const onColor = (bg) => (contrast('#ffffff', bg) >= 3.3 ? '#ffffff' : DARK_TEXT);

/* ---------- geometria wg kształtu przycisku ---------- */
const RADIUS = {
  rounded: { lg: '22px', md: '16px', sm: '10px' },
  pill:    { lg: '24px', md: '18px', sm: '12px' },
  sharp:   { lg: '12px', md: '9px',  sm: '6px'  },
};

/* ---------- cienie wg jasności tła ---------- */
function shadows(pal, isDark) {
  if (isDark) {
    return {
      lg: '0 24px 60px rgba(0,0,0,.55)',
      md: '0 14px 36px rgba(0,0,0,.45)',
      sm: '0 4px 18px rgba(0,0,0,.34)',
      cta: `0 12px 30px ${rgba(pal.cta, 0.36)}`,
    };
  }
  return {
    lg: `0 18px 46px ${rgba(pal.ink, 0.14)}`,
    md: `0 12px 30px ${rgba(pal.ink, 0.10)}`,
    sm: `0 4px 16px ${rgba(pal.ink, 0.07)}`,
    cta: `0 12px 28px ${rgba(pal.cta, 0.30)}`,
  };
}

/* ---------- czytelne etykiety charakteru (do MOOD.md) ---------- */
const CHAR_LABEL = {
  button_shape: { pill: 'przyciski pigułki (pełny promień)', rounded: 'przyciski zaokrąglone 12–14px', sharp: 'przyciski ostre 6px' },
  heading_style: {
    'serif-warm': 'nagłówki: ciepły szeryf 700', 'serif-editorial': 'nagłówki: szeryf edytorialny 600 (ciasny trekking)',
    'grotesk-bold': 'nagłówki: grotesk bold 800', 'grotesk-clean': 'nagłówki: grotesk czysty 700',
    'rounded-soft': 'nagłówki: zaokrąglony grotesk 800', 'slab-tech': 'nagłówki: techniczny slab 800',
  },
  card_style: { 'flat-border': 'karty płaskie z borderem', 'soft-shadow': 'karty na miękkim cieniu', 'outlined-offset': 'karty z konturem i twardym offsetem', paper: 'karty papierowe (matowa faktura)' },
  section_rhythm: { alternating: 'sekcje naprzemienne (tło ↔ pas)', continuous: 'sekcje ciągłe z liniami-separatorami', banded: 'sekcje w mocnych pasach' },
  photo_frame: { 'rounded-xl-shadow': 'ramki zaokrąglone z dużym cieniem', 'thin-border': 'ramki z cienkim borderem', 'polaroid-offset': 'ramki polaroid (przechył + offset)', bleed: 'zdjęcia na pełny spad (bez ramki)' },
};

/* ---------- generacja tokens.css ---------- */
function buildTokens(s) {
  const p = s.palette;
  const isDark = lum(p.bg) < 0.35;
  const r = RADIUS[s.charakter.button_shape];
  const sh = shadows(p, isDark);
  const accentSoft = rgba(p.accent, isDark ? 0.18 : 0.12);
  const onAccent = onColor(p.accent);
  const onCta = onColor(p.cta);
  const onSuccess = onColor(p.success);
  const classes = bodyClasses(s);
  const mood1 = s.mood.split('.')[0].trim();

  return `/* ${s.id} „${s.name}" — ${mood1}.
   Font nagłówków: ${s.fontHead} (${s.fontWeights}, latin-ext, display=swap). Body = system stack.
   Charakter: ${classes}. Struktura/eventy/zakazy: STANDARD-LANDING-SKLEPY.md. */
:root{
  /* powierzchnie */
  --bg:${p.bg};
  --section:${p.section};
  --card:${p.card};
  --line:${p.line};
  --line-soft:${p.lineSoft};
  /* tekst */
  --ink:${p.ink};
  --muted:${p.muted};
  --faint:${p.faint};
  /* akcenty (accent = eyebrow/gwiazdki/marka; cta = WYŁĄCZNIE zakup; success = zaufanie/checki) */
  --accent:${p.accent};
  --accent-soft:${accentSoft};
  --on-accent:${onAccent};
  --cta:${p.cta};
  --cta-hover:${p.ctaHover};
  --on-cta:${onCta};
  --success:${p.success};
  --success-soft:${p.successSoft};
  --on-success:${onSuccess};
  /* geometria */
  --radius-lg:${r.lg};
  --radius-md:${r.md};
  --radius-sm:${r.sm};
  --radius-pill:999px;
  /* cienie */
  --shadow-lg:${sh.lg};
  --shadow-md:${sh.md};
  --shadow-sm:${sh.sm};
  --shadow-cta:${sh.cta};
  /* typografia */
  --font-head:'${s.fontHead}',${s.fontHeadFallback};
  --font-body:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --fs-h1:clamp(1.9rem,5.6vw,3.1rem);
  --fs-h2:clamp(1.45rem,3.6vw,2.1rem);
  --fs-body:1rem;
  --lh-body:1.62;
  /* layout */
  --max:1140px;
  --sec-pad:76px;
  /* motion */
  --ease:cubic-bezier(.22,.7,.3,1);
  --dur:.28s;
}
/* Reguły użycia:
   - --cta tylko na akcji zakupu (tekst --on-cta); linki/hover/eyebrow/gwiazdki — --accent.
   - Karty na tle --card z --line; sekcje-pasy w kolorze --section (rytm: ${CHAR_LABEL.section_rhythm[s.charakter.section_rhythm]}).
   - Checkmarki i sygnały zaufania — --success (--on-success na jednolitym tle).
   - Zdjęcia w ramce: ${CHAR_LABEL.photo_frame[s.charakter.photo_frame]}.
   - prefers-reduced-motion: transition/animation → none.
   - ZAKAZY (anty): ${s.anty.join('; ')}. */
`;
}

/* ---------- klasy charakteru na <body> ---------- */
function bodyClasses(s) {
  const c = s.charakter;
  return `shape-${c.button_shape} head-${c.heading_style} card-${c.card_style} rhythm-${c.section_rhythm} frame-${c.photo_frame} energy-${c.energy}`;
}

/* ---------- FONT_LINK (Google Fonts, latin-ext auto przez css2) ---------- */
function fontLink(s) {
  const fam = s.fontHead.replace(/ /g, '+');
  return `<link href="https://fonts.googleapis.com/css2?family=${fam}:wght@${s.fontWeights}&display=swap" rel="stylesheet">`;
}

/* ---------- MOOD.md ---------- */
function buildMood(s) {
  const c = s.charakter;
  const labels = [
    CHAR_LABEL.button_shape[c.button_shape],
    CHAR_LABEL.heading_style[c.heading_style],
    CHAR_LABEL.card_style[c.card_style],
    CHAR_LABEL.section_rhythm[c.section_rhythm],
    CHAR_LABEL.photo_frame[c.photo_frame],
    `energia ${c.energy}/5`,
  ];
  return `# ${s.id} „${s.name}"

**Charakter:** ${s.mood}

**Gra dobrze z:** ${s.kategorie.join(', ')}.
**Persona:** ${s.persona}.

**NIE robi / ANTY:** ${s.anty.join(' · ')}.

**Hero / foto:** ${s.foto_hint}.

**Klasy charakteru (na \`<body>\` styleguide'u):**
\`${bodyClasses(s)}\`
${labels.map((l) => `- ${l}`).join('\n')}

**Paleta-serce:** tło \`${s.palette.bg}\` · akcent \`${s.palette.accent}\` · CTA \`${s.palette.cta}\` · zaufanie \`${s.palette.success}\`.

**Wzorzec żywy:** \`components.html\` w tym katalogu — jednocześnie demo do oceny i źródło kopiuj-wklej dla buildera. Tokeny: \`tokens.css\` (wklejka 1:1).
`;
}

/* ---------- render components.html z template ---------- */
function buildHtml(s) {
  const tokens = buildTokens(s);
  const repl = {
    '{{DS_ID}}': s.id,
    '{{DS_NAME}}': s.name,
    '{{TOKENS_CSS}}': tokens.trimEnd(),
    '{{BODY_CLASSES}}': bodyClasses(s),
    '{{FONT_LINK}}': fontLink(s),
    '{{MOOD_LINE}}': s.mood,
  };
  let out = template;
  for (const [k, v] of Object.entries(repl)) out = out.replaceAll(k, v);
  return out;
}

/* ---------- main ---------- */
let count = 0;
const written = [];
for (const s of systems) {
  const dir = join(ROOT, `${s.id}-${s.slug}`);
  mkdirSync(dir, { recursive: true });
  const tokens = buildTokens(s);
  writeFileSync(join(dir, 'tokens.css'), tokens, 'utf8');
  writeFileSync(join(dir, 'components.html'), buildHtml(s), 'utf8');
  writeFileSync(join(dir, 'MOOD.md'), buildMood(s), 'utf8');
  written.push(`${s.id}-${s.slug}/{tokens.css, components.html, MOOD.md}`);
  count++;
}
console.log(`Wygenerowano ${count} design systemów:`);
for (const w of written) console.log('  ✓ ' + w);
