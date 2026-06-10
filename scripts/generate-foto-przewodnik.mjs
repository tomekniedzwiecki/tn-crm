#!/usr/bin/env node
/**
 * generate-foto-przewodnik.mjs — jednostronicowy przewodnik fotograficzny dla klienta (v5.0)
 *
 * Usage: node scripts/generate-foto-przewodnik.mjs <slug> [brandName]
 * Output: landing-pages/<slug>/foto-przewodnik.md (commitowany, dołączany do raportu AUTO-RUN)
 *
 * Dlaczego: największy sufit wizualny żywych landingów to placeholdery, których klient
 * nigdy nie podmienia dobrymi zdjęciami. Briefy fotografa już SĄ per placeholder —
 * ten skrypt skleja je w instrukcję „N zdjęć telefonem", którą klient realnie wykona.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const slug = process.argv[2];
if (!slug) { console.error('Usage: node scripts/generate-foto-przewodnik.mjs <slug> [brandName]'); process.exit(1); }
const brand = process.argv[3] || slug.charAt(0).toUpperCase() + slug.slice(1);

const htmlPath = `landing-pages/${slug}/index.html`;
if (!existsSync(htmlPath)) { console.error(`❌ Brak ${htmlPath}`); process.exit(1); }
const html = readFileSync(htmlPath, 'utf8');

// ── Zbierz placeholdery: bloki .ph z polami ph-mark / ph-title / ph-size / ph-note ──
const phBlocks = [];
const phRe = /<(?:div|figure)[^>]*class="[^"]*\bph\b[^"]*"[\s\S]{0,1200}?(?:<\/figure>|<\/div>\s*<\/div>)/g;
const field = (block, name) => {
  const m = block.match(new RegExp(`class="[^"]*${name}[^"]*"[^>]*>([\\s\\S]*?)<`, 'i'));
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
};

// sekcja, w której placeholder żyje — szukamy wstecz najbliższego <section class="...">
const sectionAt = (idx) => {
  const before = html.slice(0, idx);
  const m = [...before.matchAll(/<section[^>]*class="([^"]+)"/g)].pop();
  if (!m) return 'strona';
  const cls = m[1];
  if (/hero/.test(cls)) return 'Hero (góra strony)';
  if (/problem|pain/.test(cls)) return 'Problem';
  if (/solution|bento|features|atelier/.test(cls)) return 'Funkcje produktu';
  if (/how|steps|ritual|process/.test(cls)) return 'Jak działa (kroki)';
  if (/testimonial|voices|opinie|social/.test(cls)) return 'Opinie';
  if (/offer|pakiet|zestaw/.test(cls)) return 'Oferta';
  if (/final|cta-banner/.test(cls)) return 'Finałowy baner';
  return cls.split(' ')[0];
};

let m;
while ((m = phRe.exec(html)) !== null) {
  const block = m[0];
  const title = field(block, 'ph-title');
  const note = field(block, 'ph-note');
  const size = field(block, 'ph-size');
  if (!title && !note) continue;
  phBlocks.push({ section: sectionAt(m.index), title, note, size });
}

// PH-BRIEF komentarze (placeholdery-tła, v5.0 ph--bg)
const cRe = /<!--\s*PH-BRIEF:\s*([\s\S]*?)-->/g;
while ((m = cRe.exec(html)) !== null) {
  phBlocks.push({ section: sectionAt(m.index), title: 'Tło sekcji', note: m[1].replace(/\s+/g, ' ').trim(), size: '' });
}

if (phBlocks.length === 0) {
  console.log('⚠️  Nie znaleziono placeholderów .ph — przewodnik nie wygenerowany');
  process.exit(0);
}

const rows = phBlocks.map((p, i) =>
  `## Zdjęcie ${i + 1} — ${p.title || 'ujęcie'}\n` +
  `- **Gdzie na stronie:** ${p.section}\n` +
  (p.size ? `- **Orientacja/kadr:** ${p.size}\n` : '') +
  `- **Co sfotografować:** ${p.note || p.title}\n`
).join('\n');

const guide = `# ${brand} — przewodnik fotograficzny (${phBlocks.length} zdjęć)

> Ten dokument powstał automatycznie z Twojego landinga. Każde zdjęcie z listy ma
> swoje DOKŁADNE miejsce na stronie — po ich podmianie strona wygląda jak sesja
> z agencji, a nie szablon. **Wszystkie zrobisz telefonem w 30-60 minut.**

## Zasady ogólne (przeczytaj raz)

1. **Światło dzienne, nie lampa.** Najlepiej przy oknie w pochmurny dzień lub w cieniu —
   zero ostrych cieni i żółtego światła żarówki.
2. **Czyste tło.** Blat, lniana tkanina, jasna ściana. Sprzątnij wszystko, co nie gra roli.
3. **Telefon poziomo dla kadrów szerokich, pionowo dla detali.** Orientacja podana przy
   każdym zdjęciu.
4. **Nie używaj zoomu cyfrowego** — podejdź bliżej. Przetrzyj obiektyw przed sesją.
5. **Zrób 3-4 wersje każdego ujęcia** i wybierz najlepszą na dużym ekranie.
6. **Produkt musi wyglądać jak Twój egzemplarz** — bez filtrów zmieniających kolory.

---

${rows}

---

*Po zrobieniu zdjęć wyślij je w odpowiedzi na maila z linkiem do strony — podmienimy
placeholdery i strona będzie gotowa do kampanii.*
`;

const outPath = `landing-pages/${slug}/foto-przewodnik.md`;
writeFileSync(outPath, guide, 'utf8');
console.log(`✅ ${outPath} — ${phBlocks.length} zdjęć w przewodniku`);
