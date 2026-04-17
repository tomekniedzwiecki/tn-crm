# ETAP 4: Wizualna weryfikacja (OBOWIĄZKOWY)

**Kiedy uruchomić:** po ETAP 3 (design polish), PRZED commitem i deployem.

**Cel:** wyłapać bugi, które nie są widoczne w kodzie — ucięte elementy, overlapping, złamane mobile, puste sekcje przez `opacity:0` bez JS-gate'u.

**Dlaczego obowiązkowy:** jedno zdarzenie kosztowało godziny — cała strona renderowała się jako pusta ivory plama, bo `.fade-in { opacity:0 }` nie miało fallbacku. Code review tego nie wyłapało.

---

## Krok 1 — Sprawdź że Playwright jest zainstalowany

```bash
ls /c/repos_tn/tn-crm/node_modules/.bin/playwright 2>/dev/null || \
  (cd /c/repos_tn/tn-crm && npm install -D playwright && npx playwright install chromium)
```

Pierwsze uruchomienie pobiera Chromium (~150 MB, ~1 min).

## Krok 2 — Zapisz skrypt screenshot

`/c/repos_tn/tn-crm/_shoot.mjs`:

```js
import { chromium } from 'playwright';
const url = process.argv[2] || 'file:///C:/repos_tn/tn-crm/landing-pages/[SLUG]/index.html';
const browser = await chromium.launch();
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'mobile',  width: 375,  height: 812  },
];
for (const v of viewports) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  // Schowaj cookie banner
  await page.evaluate(() => { const c = document.getElementById('cookie'); if (c) c.style.display = 'none'; });
  // Scroll przez całą stronę żeby odpalić IntersectionObserver
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `C:/tmp/paromia_shots/${v.name}_full.png`, fullPage: true });
  await page.screenshot({ path: `C:/tmp/paromia_shots/${v.name}_hero.png`, fullPage: false });
  // Dodatkowo 3 mid-scroll viewporty
  for (const y of [900, 1800, 2700]) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `C:/tmp/paromia_shots/${v.name}_${y}.png`, fullPage: false });
  }
  console.log(`[ok] ${v.name}: ${v.width}x${v.height}`);
  await ctx.close();
}
await browser.close();
```

## Krok 3 — Uruchom i zrób screenshoty

```bash
mkdir -p /c/tmp/paromia_shots
cd /c/repos_tn/tn-crm && node _shoot.mjs
```

Zmień `paromia_shots` i `[SLUG]` na nazwę projektu.

## Krok 4 — Obejrzyj screenshoty (`Read` tool)

**Obowiązkowo obejrzyj:**

- `desktop_hero.png` — czy headline czytelny, CTA widoczne, hero visual nie wychodzi za ramkę
- `desktop_full.png` — czy WSZYSTKIE sekcje renderują się (jeśli widzisz pustą ivory plamę → fade-in bug)
- `mobile_hero.png` — czy hero mieści się, CTA full-width, trust elementy widoczne
- `mobile_full.png` — czy sekcje mają sensowny rytm, nie ma „przerw" ani overlapu
- `tablet_full.png` — czy bento się składa poprawnie, czy hero grid się nie psuje

## Krok 5 — Checklist (wypełnij w tym pliku jako komentarz w PR albo w konsoli)

### Hero
- [ ] Headline czytelny i w całości na 1440 / 768 / 375
- [ ] CTA primary widoczne above-fold (nie trzeba scrollować)
- [ ] Hero visual / placeholder nie wychodzi za viewport
- [ ] Editorial numeral / glow / animacja nie nakłada się na tekst

### Renderowanie sekcji
- [ ] Trust strip pokazuje się w pełni
- [ ] Manifesto / Problem — tekst ma hierarchię (nie jest „blob")
- [ ] Features (bento) — karty mają różne rozmiary (nie wszystkie identyczne)
- [ ] Ritual / How it works — 3 kroki wyrównane na desktop, stacked na mobile
- [ ] Spec sheet (jeśli jest) — kontrastowe tło widoczne
- [ ] Comparison — dwie kolumny renderują równo
- [ ] Voices / Testimonials — pull quotes czytelne
- [ ] FAQ — accordion działa (kliknij sam)
- [ ] Offer card — cena widoczna, CTA kontrastowy
- [ ] Final CTA banner — headline + CTA
- [ ] Footer — 4 kolumny / mobile stacked

### Mobile-specific
- [ ] Hero spec stack nie nakłada się na placeholder (bug z desktop absolute → mobile static)
- [ ] Cookie banner mieści się (max 50% wysokości viewportu)
- [ ] Hamburger działa (kliknij, zobacz menu)
- [ ] Wszystkie CTA są min. 44px wysokie

### Typography
- [ ] Polskie znaki (ą ę ć ł) renderują się poprawnie
- [ ] Italics w `em` są wyraźnie inne niż regular
- [ ] Editorial fonts (Fraunces, Italiana) ładują się (nie fallback Times)

### JS / Interakcja
- [ ] `html.js` class jest dodana (inspector → html element ma class="js")
- [ ] Fade-in faktycznie fade'uje (nie pop) — scroll powoli i patrz
- [ ] Bez JS (wyłącz w DevTools) → strona nadal pokazuje całą treść

## Krok 6 — Napraw znalezione problemy

Wróć do ETAP 1/3. Po naprawie ponownie uruchom `node _shoot.mjs`.

## Krok 7 — Commit & Deploy

Dopiero gdy checklist jest pełny:

```bash
cd /c/repos_tn/tn-crm
git add landing-pages/[SLUG]/
git commit -m "Add [brand-name] landing page"
git push
```

Po deployu podaj użytkownikowi:

```
https://tn-crm.vercel.app/landing-pages/[SLUG]/
```

## Sprzątanie

```bash
rm /c/repos_tn/tn-crm/_shoot.mjs /c/repos_tn/tn-crm/_debug*.mjs 2>/dev/null
```

Nie commituj skryptów screenshot do repo — są utility.

---

## Najczęstsze bugi wyłapane przez tę weryfikację

| Bug | Symptom w screencie | Fix |
|-----|---------------------|-----|
| `.fade-in { opacity:0 }` bez JS gate | Desktop/mobile full page = pusta ivory plama | Dodaj `html.js` gate |
| Hero spec badges absolute | Mobile: nakłada się na placeholder text | Duplikuj jako static pod figurą |
| Cookie banner za wysoki | Mobile: zakrywa CTA w hero | `padding:12px 14px` na mobile |
| Mobile menu nie chowa się | Pierwsze otwarcie widać menu | `transform:translateY(-100%)` + `.open { translateY(0) }` |
| Overflow horizontal | Pasek scrolla poziomy | `body { overflow-x: hidden }` + sprawdź elementy z `width > 100%` |
| Hero headline uciete | „Niena..." zamiast „Nienagannie" | `font-size: clamp(Xpx, Yvw, Zpx)` — mniejszy min |
