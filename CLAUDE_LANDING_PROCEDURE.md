# Procedura: Landing Page — MASTER FLOW (autonomiczny)

> **🚀 AUTO-RUN TRIGGER**
>
> Gdy użytkownik mówi:
> - „Przygotuj landing dla projektu [UUID]"
> - „Zrób landing dla [UUID]"
> - „Wygeneruj stronę sprzedażową [UUID]"
> - lub wskazuje ten plik (`CLAUDE_LANDING_PROCEDURE.md`)
>
> → **Autonomicznie wykonaj wszystkie 6 etapów od ETAP 1 do ETAP 4.5, BEZ pytania o nic.**
> Zakończ commitem, pushem i linkiem do deploya.

---

## Przegląd flow (6 etapów — wszystkie OBOWIĄZKOWE)

| # | Etap | Plik | Output |
|---|------|------|--------|
| **1** | Generowanie | `CLAUDE_LANDING_PROCEDURE.md` (ten plik) | Roboczy `landing-pages/[slug]/index.html` |
| **2** | Weryfikacja treści | `CLAUDE_LANDING_REVIEW.md` | Audyt + fixy copy |
| **2.5** | Direction (manifesto) | `CLAUDE_LANDING_DIRECTION.md` | `landing-pages/[slug]/_brief.md` (persystentny) |
| **3** | Design polish | `CLAUDE_LANDING_DESIGN.md` (w tym **sekcja H — Offer Box / CTA playbook 2026, OBOWIĄZKOWA**) | Finalne CSS/HTML zgodne z manifesto + offer box 15-point checklist |
| **4** | Wizualna weryfikacja | `CLAUDE_LANDING_VERIFY.md` | Playwright screenshoty 3 viewporty |
| **4.5** | **Mobile Polish Pass** | `CLAUDE_LANDING_MOBILE.md` | Systematyczne fixy mobile (375px) przed deployem |

Dodatkowo:
- `CLAUDE_LANDING_PATTERNS.md` — biblioteka gotowych snippetów (signature elements, JS effects, layout discipline)
- `CLAUDE_AI_IMAGES_PROCEDURE.md` — generowanie obrazów AI (wywoływana wewnątrz ETAP 3)

---

## Checklist auto-run (wykonaj sekwencyjnie)

```
[ ] 0.  Walidacja wejścia (bash snippet niżej — wszystkie 3 muszą przejść)
[ ] 1.  ETAP 1 — Generuj szkielet HTML (sekcje 2-6 tego pliku — zacznij od „KRYTYCZNE LEKCJE")
[ ] 2.  ETAP 2 — Przeczytaj `CLAUDE_LANDING_REVIEW.md`, uruchom grep sanity + Hero deep dive
[ ] 3.  ETAP 2.5 — Przeczytaj `CLAUDE_LANDING_DIRECTION.md`, napisz manifesto
        → zapisz do `landing-pages/[slug]/_brief.md` (nie /c/tmp/!)
[ ] 4.  ETAP 3 — Przeczytaj `CLAUDE_LANDING_DESIGN.md`, dopracuj design zgodnie z manifesto
        → w tym wywołanie `CLAUDE_AI_IMAGES_PROCEDURE.md` dla obrazów
        → **OBOWIĄZKOWO zrealizuj sekcję H (Offer Box / CTA playbook 2026)**
          z 15-point checkistą H.9 — to 80% konwersji po Hero. Bez sekcji H landing jest niegotowy.
[ ] 5.  ETAP 4 — Przeczytaj `CLAUDE_LANDING_VERIFY.md`, uruchom:
        → bash scripts/verify-landing.sh [slug]  (target: 18/18 PASS)
        → bash scripts/screenshot-landing.sh [slug]  (3 viewports)
[ ] 6.  ETAP 4.5 — Przeczytaj `CLAUDE_LANDING_MOBILE.md`, przejdź checklist 10-obszarów
        → obejrzyj mobile_full.png + mid-scroll, popraw co trzeba
        → re-run screenshot, iteruj aż 5/5 certyfikacja PASS
[ ] 7.  Commit + push + podaj link do https://tn-crm.vercel.app/landing-pages/[slug]/
```

**KRYTYCZNE:** NIE rób commitów pośrednich. Jeden commit na końcu z pełnym deliverem.

### ETAP 0 — walidacja wejścia (bash snippet)

```bash
set -a && source /c/repos_tn/tn-crm/.env && set +a

# Podstaw UUID (z promptu użytkownika)
UUID="[UUID]"

# Check 1: Workflow istnieje
WF=$(curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.$UUID&select=id,customer_name" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
[ "$WF" = "[]" ] && echo "❌ Workflow nie istnieje" && exit 1
echo "✅ Workflow: $WF"

# Check 2: brand_info (nazwa marki + tagline + description)
BI=$(curl -s ".../workflow_branding?workflow_id=eq.$UUID&type=eq.brand_info&select=value" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
[ "$BI" = "[]" ] && echo "❌ Brak brand_info — wróć do CLAUDE_BRANDING_PROCEDURE.md" && exit 1
echo "✅ brand_info: $(echo "$BI" | head -c 150)"

# Check 3: Raport strategiczny PDF
RP=$(curl -s ".../workflow_reports?workflow_id=eq.$UUID&type=eq.report_pdf&select=file_url" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
[ "$RP" = "[]" ] && echo "❌ Brak raportu PDF — bez niego nie ma person i copy" && exit 1
echo "✅ report_pdf: obecny"

# Check 4 (opcjonalny warning): workflow_products
PR=$(curl -s ".../workflow_products?workflow_id=eq.$UUID&select=name,price" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
[ "$PR" = "[]" ] && echo "⚠️  Brak workflow_products — cena/zestaw z raportu lub deep research"

# Slug = lowercase nazwa marki z brand_info
SLUG=$(echo "$BI" | grep -oE '"name":"[^"]+"' | head -1 | sed 's/"name":"//; s/"$//' | tr '[:upper:]' '[:lower:]')
echo "✅ SLUG: $SLUG → landing-pages/$SLUG/"
```

Jeśli którykolwiek check ❌ — **nie idź dalej**, zgłoś użytkownikowi czego brak.

---

## Kiedy STOP (nie uruchamiaj flow)

Przerwij i poinformuj użytkownika, jeśli:
- Brak `.env` z `SUPABASE_SERVICE_KEY` → nie można pobrać danych
- `workflow_branding` type=`brand_info` pusty → wróć do `CLAUDE_BRANDING_PROCEDURE.md`
- `workflow_reports` type=`report_pdf` brak → raport strategiczny jest podstawą person i copy
- `workflow_products` pusty + brak referencji produktu w `ai-generated/` → nie masz z czego generować obrazów

Te przypadki wymagają powrotu do wcześniejszych etapów workflow, nie próbuj „wymyślać" contentu.

---

## 📦 MIGRACJA starego landingu (retrospective brief)

**Problem:** landingi sprzed kwietnia 2026 (paromia, h2vital, pupilnik, vibestrike, …) nie mają `_brief.md`. Gdy user prosi o modyfikację, trzeba zrekonstruować brief retrospektywnie.

### Kroki migracji

1. **Przeczytaj HTML** żeby zrozumieć kierunek:
   ```bash
   grep -E "font-family|--primary|--accent|aspect-ratio" landing-pages/[slug]/index.html | head -30
   ```

2. **Pobierz branding z Supabase** (źródło prawdy):
   ```bash
   curl ".../workflow_branding?workflow_id=eq.$UUID&type=in.(brand_info,color,font)&select=*"
   ```

3. **Zidentyfikuj kierunek** patrząc na istniejące landing:
   - Fraunces + Italiana + gold accents → Editorial/Luxury (paromia)
   - Plus Jakarta + Instrument Serif + navy → Panoramic Calm (vitrix)
   - Playful + rounded + saturated → Playful/Toy (pupilnik)
   - Neon + black + glitch → Retro-Futuristic (vibestrike)

4. **Utwórz `_brief.md`** używając template z `CLAUDE_LANDING_DIRECTION.md` Krok 3. Sekcja 6 (Decisions log) pusta lub jeden wpis „2026-04-XX migracja retrospektywna".

5. **Uruchom verify:**
   ```bash
   bash scripts/verify-landing.sh [slug]
   ```
   Jeśli landing jest stary — pewne checks mogą failować (np. brak JS effects w pre-2026). Popraw w osobnym commit po zatwierdzeniu briefu.

6. **Commit brief osobno** przed modyfikacjami:
   ```bash
   git add landing-pages/[slug]/_brief.md
   git commit -m "[slug]: Migrate — retrospective brief + photo system"
   ```

**Docelowo:** wszystkie landingi w repo mają `_brief.md`. Robimy to na żądanie gdy user modyfikuje starego landing — nie migrujemy wszystkich na raz.

---

## 🔄 MODYFIKACJA istniejącego landingu (continuation protocol)

Gdy user mówi „popraw X w landingu [slug]" / „zmień Y" / „dodaj Z":

### 1. Branch strategy
Nie wymagany feature branch — to pojedynczy edit. Pracuj bezpośrednio na `main`.

### 2. Zawsze zacznij od reading
```bash
cat landing-pages/[slug]/_brief.md   # Manifesto projektu — kontekst decyzji
head -100 landing-pages/[slug]/index.html   # Stan aktualny
```

### 3. Przed zmianą strukturalną — sprawdź verify
```bash
bash scripts/verify-landing.sh [slug]
# zapisz stan "before" w pamięci
```

### 4. Zmiany ograniczone do wskazanego zakresu
- NIE rób „przy okazji" refactorów
- NIE zmieniaj manifesta jeśli user prosi o drobną poprawkę
- Update `_brief.md` → sekcja 6 „Decisions log" + 1 wiersz z datą/powodem

### 5. Re-run verify + Playwright po zmianach
```bash
bash scripts/verify-landing.sh [slug]   # musi zostać 18/18 PASS
node _shoot.mjs                          # wizualna weryfikacja
```

### 6. Commit z precyzyjnym opisem
```bash
git add landing-pages/[slug]/
git commit -m "$(cat <<EOF
[slug]: [krótki opis zmiany]

Kontekst: [dlaczego użytkownik poprosił]
Co zmienione: [lista precyzyjna]
_brief.md: zaktualizowany (decisions log v[N])
EOF
)"
git push
```

---

## 🖼️ Image naming convention (obrazy AI)

**Problem:** stare konwencje używały timestampów (`1776413349881_0.jpg`) — nieczytelne, trudno znaleźć który obraz odpowiada któremu slotowi.

**Nowa konwencja (opcjonalna — zależy od upsert w edge function):**

```
ai-generated/[slug]/
├── hero.jpg                   # Nº 01 hero
├── challenge.jpg              # Nº 02 problem
├── tile-hero.jpg              # Nº 03 featured bento
├── tile-safety.jpg            # Nº 03 bento 2
├── tile-navigation.jpg        # Nº 03 bento 3
├── tile-control.jpg           # Nº 03 bento 4
├── ritual-1.jpg               # Nº 04 krok 1
├── ritual-2.jpg               # Nº 04 krok 2
├── ritual-3.jpg               # Nº 04 krok 3
├── spec.jpg                   # Nº 05 spec sheet
├── persona-anna.jpg           # Nº 07.01
├── persona-marek.jpg          # Nº 07.02
├── persona-kasia.jpg          # Nº 07.03
└── offer.jpg                  # Nº 10 packshot
```

**Jak włączyć:** edge function `generate-image` musi dostać parameter `custom_filename`. Obecnie używa `Date.now()_index.ext` — kompatybilność wstecz. Gdy dodasz `filename` w payloadzie, upsert nadpisze stary plik.

**Do dodania w edge function** (tylko gdy będzie robione):
```typescript
const { filename } = body
// ...
const finalFilename = filename
  ? `ai-generated/${workflow_id}/${filename}.${ext}`
  : `ai-generated/${workflow_id || 'temp'}/${Date.now()}_${index}.${ext}`
const { error } = await supabase.storage
  .from('attachments')
  .upload(finalFilename, bytes, { contentType: img.mimeType, upsert: true })
```

**Do czasu wdrożenia** — zostajemy przy timestamp names, pomaga `_brief.md` jako mapping (sekcja 7).

---

## 🧹 Cleanup starych obrazów (manual — opcjonalnie)

Gdy landing przechodzi regenerację (jak Vitrix — 14 starych → 14 nowych), stare pliki zostają w storage. Nie linkowane, ale zajmują miejsce.

```bash
# List nieużywanych obrazów w storage dla slug
grep -oE "ai-generated/[a-z-]+/[0-9_]+\.(jpg|png)" landing-pages/[slug]/index.html | sort -u > /c/tmp/used_urls.txt

# (Manually diff vs lista w storage — edge function nie wspiera list API bez service keya bezpośrednio)
# Alternatywa: zostawić jak jest — storage tanie, a stare pliki mogą być przydatne dla rollbacku
```

Rekomendacja: **nie usuwaj automatycznie**. Stary obraz = rollback option gdy nowy jest gorszy.

---

## ⛔ KRYTYCZNE LEKCJE — PRZECZYTAJ ZANIM ZACZNIESZ

Te problemy kosztowały godziny debugowania. Nie powtarzaj ich.

### 0. Baseline mismatch — NIE kopiuj vitrix jako „szybkiego startu" dla innego kierunku

**Problem:** ETAP 1 w `_templates/README.md` każe kopiować istniejący landing jako bazę. Kusząco — oszczędza czas, przechodzi 18/18 verify. **Pułapka:** gdy kierunek manifesta NIE pasuje do baseline'a, wynik = „vitrix przebrany za kawę" — klient widzi kolejny AI-editorial landing, nie wyjątkową markę.

**Wymuszany check przed kopiowaniem:** policz ile czerwonych flag manifesta trafia:
- Moodboard referuje inny świat wizualny (Filson/Red Wing/Yeti vs Kinfolk/Dyson/B&O)
- Paleta wyraźnie inna (ciemna + metal vs paper + italic teal)
- Fotografia lokalizacji inna („parking 4:30" vs „salon 18. piętro")
- Manifesto wprost wyklucza italic editorial serif / round acts / delikatne shadows
- Persona z innego świata (kierowca TIR, rzemieślnik vs prawniczka, architektka)

**≥3 flagi trafiają:** NIE kopiuj baseline'a z innego kierunku. Zamiast tego:
1. **Zachowaj tę samą architekturę 14 sekcji** (header → hero → trust → wyzwanie → atelier → rytuał → spec → epoki → persony → głosy → FAQ → oferta → finał → footer)
2. **Zaprojektuj CSS od zera** pod manifesto (inne CSS tokens, inne signature elements, inne proporcje)
3. **Dodaj nowy slug do `_templates/README.md`** jako baseline dla tego kierunku — następny landing tego typu już nie będzie „od zera"

**Pierwszy precedens:** Kafina (Rugged Heritage) — vitrix był dostępny, pasowała architektura, ale manifest Filson/Red Wing/Yeti wymagał dark hero + stamp badges + brak editorial italic. Świadoma decyzja: szkielet vitrix, design od zera. Zobacz `landing-pages/kafina/_brief.md` sekcję 6.

**Baseline matching table:** `landing-pages/_templates/README.md`.

### 1. Fade-in z `opacity:0` MUSI mieć fallback bez JS

**Antywzorzec (ŹLE, ukrywa 80% strony gdy JS padnie / bot crawluje):**
```css
.fade-in { opacity: 0; transform: translateY(30px); transition: ... }
.fade-in.visible { opacity: 1; }
```

**Poprawnie (gate'uj przez klasę `.js` na `<html>`):**
```html
<head>
  ...
  <script>document.documentElement.classList.add('js')</script>
</head>
```
```css
html.js .fade-in { opacity: 0; transform: translateY(30px); transition: ... }
html.js .fade-in.visible { opacity: 1; transform: translateY(0); }
```
```js
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  // Safety fallback: po 3s pokaż TYLKO te elementy które user powinien już widzieć
  // (above-the-fold lub w viewport). Elementy poniżej czekają na IntersectionObserver
  setTimeout(() => {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
  }, 3000);
} else {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}
```

**Dlaczego:** crawler, fullpage screenshot, print, slow JS, wyłączony JS = 80% strony niewidoczne. Bez `html.js` gate'u nigdy tego nie zauważysz.

**KRYTYCZNE — safety timeout MUSI filtrować po pozycji!** Typowy błąd:
```js
// ❌ ŹLE — po 2.5s wszystkie fade-in (też te na końcu strony) stają się visible
setTimeout(() => document.querySelectorAll('.fade-in:not(.visible)')
  .forEach(el => el.classList.add('visible')), 2500);
```
To psuje scroll-reveal — użytkownik siedzi w hero 3 sekundy, a cała strona (nawet offer 10 ekranów niżej) już się „odkryła". Gdy doscrolluje, nic się nie pojawia, bo wszystko już jest `.visible`.

**✅ Poprawnie**: safety filtruje `getBoundingClientRect().top < window.innerHeight` — pokazuje tylko to co user powinien widzieć NA EKRANIE.

### 2. Element absolutnie pozycjonowany WEWNĄTRZ karty nie przetrwa mobile

Absolute positioning (spec badges nad produktem, floating elements) psuje się na mobile gdy kontener ma inny aspect-ratio. **Dwa banki treści:** jeden absolute desktop, drugi static mobile (pod kartą) z `display:none` na przeciwległym viewporcie.

```html
<figure class="hero-figure">
  <div class="hero-spec-stack"><!-- absolute, desktop only --></div>
</figure>
<div class="hero-spec-stack-mobile"><!-- static, mobile only --></div>
```
```css
.hero-spec-stack-mobile { display: none; }
@media (max-width:768px) {
  .hero-figure .hero-spec-stack { display: none; }
  .hero-spec-stack-mobile { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 16px; }
}
```

### 3. Placeholder MUSI być briefem dla klienta, nie „TODO"

**ŹLE:**
```html
<div class="img-placeholder">Hero Image 1200×900</div>
```

**DOBRZE (4 pola: aspect, size px, content, ton/światło):**
```html
<div class="ph">
  <div class="ph-mark">P</div>
  <div class="ph-title">Fotografia produktowa</div>
  <div class="ph-size">Paromia Handheld · 1200 × 1500</div>
  <div class="ph-note">Neutralne tło (ivory/paper). Orientacja pionowa 4:5, przycięte ciasno. Światło miękkie, boczne.</div>
</div>
```

### 4. Weryfikuj wizualnie w przeglądarce ZANIM commit

**Nigdy nie commituj bez sprawdzenia screenshotem.** ETAP 4 (`CLAUDE_LANDING_VERIFY.md`) + ETAP 4.5 (`CLAUDE_LANDING_MOBILE.md`) są obowiązkowe. Code review nie wyłapuje bugów typu „80% strony niewidoczne przez opacity:0" ani „hero rozjeżdża się na 375px".

### 5. ⛔ NIE obiecuj „wysyłki 24h" ani „magazynu w Polsce"

Nigdy nie umieszczaj w trust-bar / FAQ / hero tych sformułowań:

- ❌ „Wysyłka 24 h" / „Wysyłamy w 24h"
- ❌ „z magazynu w Polsce" / „z polskiego magazynu"
- ❌ „D+1"

**Dlaczego:** Większość produktów jest w Fazie 1 modelu (dropshipping
AliExpress / agent w Chinach). Realna dostawa = 10–14 dni, nie 24 h.
Magazyn w Polsce to Faza 3, nieliczne projekty. Fałszywa obietnica =
masa zwrotów i reklamacji.

**Zamiast tego w trust-bar:**
- ✅ „30 dni na zwrot" / „Bez pytań"
- ✅ „Darmowa dostawa" / „InPost · DPD · kurier"
- ✅ „2 lata gwarancji" / „polska obsługa"
- ✅ „Bezpieczna płatność" / „Przelewy24 · BLIK"

**FAQ „Kiedy otrzymam przesyłkę?":**
```
Przesyłka dociera w 1–3 dni robocze od zaksięgowania wpłaty.
Dostawa InPostem, DPD lub kurierem — darmowa.
```
(bez konkretnej godziny wysyłki)

**Kontrola po generowaniu:**
```bash
grep -iE "24 ?h|w 24|polski magazyn|magazyn.* Polsce|D\+1" landing-pages/[SLUG]/index.html
```
Powinno być 0 trafień.

### 6. ⛔ Polskie diakrytyki + UPPERCASE — potrzebują `line-height ≥ 1.2`

Litery **Ł Ś Ć Ź Ż Ń Ó** mają kreski/kropki nad/pod znakiem. Domyślne
`line-height: 1` + `text-transform: uppercase` + `letter-spacing`
**obcina diakrytyki** — widać artefakty, odcięte kreski, nakładanie na
sąsiedni wiersz (zwłaszcza w headerze „RYTU**Ł**" czy „ZAM**Ó**W").

**Widoczne najczęściej w:**
- Nav links, header CTA
- Eyebrow / kicker („N**º** 03 — ATELIER")
- Trust strip strong, buttons, footer headers
- Tile kickers, spec keys, persona meta

**Zawsze dodawaj do klas z `text-transform: uppercase`:**
```css
.nav-link, .eyebrow, .header-cta, .trust-item strong,
.btn, .footer-col h4, .tile-kicker {
  line-height: 1.4;   /* minimum 1.2, bezpieczne 1.4 */
  text-transform: uppercase;
  letter-spacing: ...;
}
```

**Lub jedna globalna reguła (zalecane dla editorial/luxury):**
```css
[class*="eyebrow"], [class*="kicker"], [class*="label"],
.nav-link, .header-cta, .mobile-link, .page-number,
.trust-item strong, .btn, .footer-col h4 {
  line-height: 1.4;
}
```

**Kontrola:** screenshot headera na 375 px — sprawdź „RYTU**Ł**", „ZAM**Ó**W",
„FUNKCJE". Jeśli widzisz „wysuwającą się" kreskę ponad linią → zwiększ `line-height`.

**UWAGA — nie każdy font renderuje „Ł" poprawnie w uppercase:**

| Font | Polska „Ł" w UPPERCASE | Używać? |
|------|-------------------------|---------|
| **Italiana** | ❌ ukośna kreska wychodzi **ponad** górną belkę (jak apostrof nad L) | NIE |
| **Playfair Display SC** | ❌ czasem obcięte | ostrożnie |
| **Fraunces** | ✅ prawidłowa | TAK |
| **Cormorant Garamond** | ✅ prawidłowa, elegancka | TAK (editorial) |
| **Libre Bodoni** | ✅ prawidłowa | TAK |
| **EB Garamond** | ✅ prawidłowa | TAK |
| **Inter** | ✅ prawidłowa | TAK (body/nav) |
| **Poppins, Roboto, Space Grotesk** | ✅ prawidłowa | TAK |

**Przed wyborem fontu editorial dla eyebrow / page-numbers — przetestuj go
na frazie `Nº 04 — RYTUAŁ` i `ZAMÓW · 249 ZŁ`.** Jeśli Ł ma kreskę nad
literą → wymień font.

**Zamiennik Italiana:** `Cormorant Garamond` (waga 300/400) — ten sam
editorial feel, poprawne PL.

### 7. Oversized editorial numeral > animated glow orbs

Dla produktów premium/luxury/lifestyle — pojedyncza wielka cyfra w tle hero (Fraunces italic, 280-440px, color: paper-3) wygląda 10× bardziej profesjonalnie niż animowane glow orby. To jeden element, który klient zapamięta.

```html
<div class="hero-numeral">26<sup>sek.</sup></div>
```
```css
.hero-numeral {
  position: absolute; top: -40px; right: -20px; z-index: -1;
  font-family: var(--font-display);
  font-size: clamp(280px, 28vw, 440px);
  font-weight: 300; font-style: italic;
  color: var(--paper-3); letter-spacing: -.04em; line-height: .78;
  user-select: none;
}
```

---

---

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń) — dotyczy to całego copy na landing page (nagłówki, opisy, FAQ, CTA).

## Kiedy wywołać

Uzytkownik mowi np.: "Zrob landing dla workflow X", "Wygeneruj strone sprzedazowa", "Zbuduj landing page".

## Wymagane dane wejsciowe

1. **workflow_id** — UUID workflow
2. **Branding** — dane z tabeli `workflow_branding` (brand_info, colors, fonts)
3. **Raport PDF** — raport typu `report_pdf` z analiza produktu, USP, grupa docelowa
4. **Produkt** — dane z `workflow_products` (nazwa, opis, cena)
5. **Deep Research** — opcjonalnie dodatkowy kontekst od uzytkownika

## Co generuje

Kompletny plik `index.html` gotowy do wrzucenia do folderu `landing-pages/[nazwa-marki]/`.

### Kroki po wygenerowaniu HTML (OBOWIĄZKOWE!)

1. **Pobierz GŁÓWNE logo** z `workflow_branding` (type='logo') — wybierz to, które ma w polu `notes` JSON z `"is_main": true`. Przykład:
   ```bash
   node -e "const d=require('c:/tmp/wb.json'); console.log(d.filter(x=>x.type==='logo').find(x=>{try{return JSON.parse(x.notes||'{}').is_main}catch(e){return false}})?.file_url)"
   ```
   NIGDY nie zgaduj po tytule (np. "Logo premium") — użytkownik oznacza główne logo w panelu flagą `is_main`, która trafia do `notes`.
2. **Przytnij logo** używając `sharp().trim()` (usuwa białe marginesy!)
3. **Upload logo** do `attachments/landing/[nazwa-marki]/logo.png`
4. **Użyj pełnego URL** w HTML: `https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/landing/[nazwa-marki]/logo.png`

## ⛔ NIGDY NIE KOPIUJ ZDJĘĆ Z INNEGO WORKFLOW ⛔

**To jest krytyczna zasada — naruszenie = oszustwo wobec klienta.**

Kiedy kopiujesz szablon innego landingu (np. `czystosz/index.html`) jako bazę dla nowego, **MUSISZ** usunąć WSZYSTKIE `<img src>` wskazujące na zasoby należące do tamtego workflow i zastąpić je:

1. **Zdjęciami z BIEŻĄCEGO workflow** (`workflow_branding` type='mockup' lub 'logo', `workflow_reports` type='report_infographic`) — jedyne dozwolone źródło
2. **Wyraźnymi placeholderami** jeśli brak własnych zdjęć — np. kolorowy blok z tekstem `[PLACEHOLDER: opis zdjęcia]` lub `https://placehold.co/800x600/4A9D8E/FFF?text=Robot+Miotka`

**Jak rozpoznać obce zdjęcia:** URL zawiera inne UUID workflow w ścieżce `ai-generated/<UUID>/`. Przed zapisem pliku uruchom:

```bash
grep -oE "ai-generated/[a-f0-9-]{36}" landing-pages/[nazwa]/index.html | sort -u
```

Wynik MUSI zawierać wyłącznie UUID bieżącego workflow. Każdy inny UUID = bug do naprawy natychmiast.

**Dlaczego to jest krytyczne:** Zdjęcia z innego workflow przedstawiają inny produkt pod inną marką. Klient dostaje landing ze zdjęciami konkurencji, co jest nie do zaakceptowania.

## Hosting assetów (WAŻNE!)

Landing pages są przenoszone na zewnętrzne platformy (TakeDrop), więc **wszystkie assety muszą mieć pełne URL-e**.

### Logo — upload do Supabase Storage

> **KRYTYCZNE:** Logo z `workflow_branding` ma duże białe marginesy (1024x1024). **ZAWSZE** przytnij je przed uploadem używając `sharp().trim()`! Zobacz sekcję "Logo z projektu" poniżej.

Po wygenerowaniu landing page, **ZAWSZE** wrzuć logo do Supabase Storage:

```bash
# Upload logo do Supabase Storage
curl -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/attachments/landing/[nazwa-marki]/logo.png" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: image/png" \
  --data-binary @"landing-pages/[nazwa-marki]/logo.png"
```

### URL do logo w HTML

W kodzie HTML używaj **pełnego URL Supabase**, NIE ścieżek względnych:

```html
<!-- ✅ DOBRZE — pełny URL -->
<img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/landing/[nazwa-marki]/logo.png" alt="Logo">

<!-- ❌ ŹLE — ścieżka względna (nie działa po przeniesieniu) -->
<img src="./logo.png" alt="Logo">
<img src="/landing-pages/nazwa/logo.png" alt="Logo">
```

### Struktura w Supabase Storage

```
attachments/
└── landing/
    ├── windox/
    │   └── logo.png
    ├── brewgo/
    │   └── logo.png
    └── [nazwa-marki]/
        └── logo.png
```

## Architektura strony (sekcje)

Kazdy landing sklada sie z tych sekcji w kolejnosci:

| # | Sekcja | Funkcja | Elementy |
|---|--------|---------|----------|
| 1 | **Header** | Nawigacja | Logo, linki (Funkcje, Opinie, FAQ), CTA button, hamburger mobile |
| 2 | **Mobile Menu** | Nawigacja mobilna | Fullscreen overlay z linkami |
| 3 | **Hero** | Pierwsze wrazenie | Headline, subheadline, dual CTA, badges, hero image/video, glow effects |
| 4 | **Trust Bar** | Budowanie zaufania | 4-5 ikon z wartosciami (gwarancja, dostawa, etc.) |
| 5 | **Problem** | PAS: Agitacja | Headline z pytaniem, opis bolu, statystyki, wizualizacja |
| 6 | **Solution (Bento)** | Prezentacja produktu | Grid 2x2 z features, spotlight hover effect |
| 7 | **How It Works** | Edukacja | 3 kroki z ikonami i opisami |
| 8 | **Comparison** | Wyzszość vs konkurencja | Tabela porownawcza |
| 9 | **Social Proof** | Dowod spoleczny | Marquee z logami, karty z opiniami |
| 10 | **FAQ** | Eliminacja obiekcji | Accordion z 5-7 pytaniami |
| 11 | **Offer** | Finalizacja | Product box z cena, lista zawartosci, CTA, gwarancja |
| 12 | **CTA Banner** | Ostatnia szansa | Prosty headline + CTA |
| 13 | **Footer** | Informacje | 3 kolumny: brand, linki, kontakt |
| 14 | **Sticky CTA** | Mobile conversion | Przyklejony przycisk na dole (tylko mobile) |
| 15 | **Cookie Banner** | Compliance | RODO zgoda |

## Wzorce designu

> **WAŻNE**: Domyślnie ZAWSZE używaj jasnego motywu (białe tło). Ciemny motyw stosuj TYLKO gdy użytkownik wyraźnie o to poprosi lub produkt jest stricte z kategorii gaming/tech.

### Unikaj typowych wzorców "AI-generated" (WAŻNE!)

**NIE UŻYWAJ tych elementów — wyglądają generycznie:**

| Element | Dlaczego źle | Co zamiast |
|---------|--------------|------------|
| `border-left: 4px solid [kolor]` na kartach | Typowy wzorzec AI, wygląda tanio | Subtelny cień + hover effect |
| Ikony ✓ i ✗ w porównaniach | Najbardziej oczywisty wzorzec AI | Opisowy tekst, karty lub tabela BEZ checkmarków |
| Czerwone/pomarańczowe kolory dla statystyk "problemu" | Zbyt oczywiste, krzykliwe | Użyj text-primary lub neutralnych kolorów |
| Ikonki z checkmarks w każdym elemencie listy | Przewidywalne, nudne | Prosta lista lub numeracja |
| Gradient border-top na kartach | Wygląda na wygenerowane | Brak lub bardzo subtelny |
| "Neon glow" efekty na wszystkim | Przestarzałe, 2020 | Subtelne cienie, blur |

**Zasada ogólna:** Jeśli element wygląda jak z szablonu lub "zbyt designersko" — usuń go. Prostota > efekty.

### Sekcja Comparison — dwa poprawne formaty

**WYBIERZ JEDEN z dwóch formatów** — oba są akceptowalne, dostosuj do kontekstu produktu:

#### Format A: Dwie karty z opisowym tekstem (ZALECANY dla produktów premium)

Dwie karty obok siebie — "Tradycyjne rozwiązanie" i "Produkt [MARKA]". Każda karta zawiera **opisowy tekst** wyjaśniający zalety/wady, NIE używaj checkmarków.

```html
<div class="comparison-grid">
  <div class="comparison-card">
    <h3>Tradycyjne metody</h3>
    <p class="comparison-desc">Krótki opis problemów tradycyjnego podejścia...</p>
    <ul>
      <li>Punkt negatywny opisany zdaniem</li>
      <li>Kolejny problem wyjaśniony słowami</li>
    </ul>
  </div>
  <div class="comparison-card highlight">
    <h3>[MARKA]</h3>
    <p class="comparison-desc">Krótki opis przewag produktu...</p>
    <ul>
      <li>Korzyść opisana pełnym zdaniem</li>
      <li>Kolejna przewaga wyjaśniona słowami</li>
    </ul>
  </div>
</div>
```

```css
.comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.comparison-card { padding: 40px; border-radius: var(--radius-xl); background: var(--bg-white); }
.comparison-card.highlight { border: 2px solid var(--primary); box-shadow: var(--shadow-lg); }
```

#### Format B: Tabela z opisowymi komórkami (dla produktów z wieloma cechami)

Tabela porównująca cechy, ale **BEZ ikon ✓ i ✗**. Każda komórka zawiera krótki tekst opisowy.

```html
<table class="comparison-table">
  <thead>
    <tr>
      <th>Cecha</th>
      <th>Tradycyjne</th>
      <th class="highlight">[MARKA]</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Czas działania</td>
      <td>2-3 godziny</td>
      <td class="highlight">Do 8 godzin</td>
    </tr>
    <tr>
      <td>Łatwość obsługi</td>
      <td>Wymaga szkolenia</td>
      <td class="highlight">Intuicyjna, gotowa od razu</td>
    </tr>
  </tbody>
</table>
```

**Kiedy który format:**
- **Format A (karty)**: produkty premium, mniej cech do porównania, nacisk na storytelling
- **Format B (tabela)**: produkty tech, wiele mierzalnych parametrów, nacisk na specyfikację

**NIGDY nie używaj:** ikon ✓ / ✗, kolorów czerwony/zielony dla tak/nie, emotikon w komórkach tabeli.

### Motyw jasny (DOMYŚLNY - używaj zawsze!)
- Background: `#FFFFFF` (główny) i `#F8FAFC` (sekcje alternatywne)
- Tekst: `#111827` (dark) z `#6B7280` (secondary)
- Akcenty: kolory z brandingu (primary, secondary, accent)
- Efekty: subtle shadows, soft gradients, clean borders
- Karty: białe z delikatnym cieniem i border `#E5E7EB`
- Header/Footer: białe lub bardzo jasne

### Wykorzystanie kolorów marki w sekcjach (WAŻNE!)

Kolory z brandingu (primary, secondary, accent) powinny być widoczne w **każdej sekcji** landing page. Nie zostawiaj sekcji czysto białych/szarych — dodawaj subtelne gradienty i akcenty.

| Sekcja | Tło | Akcenty kolorystyczne |
|--------|-----|----------------------|
| **Hero** | Gradient: `rgba(primary,0.03)` → white → `rgba(secondary,0.03)` | Glow z primary, badge z primary |
| **Trust Bar** | Gradient: `rgba(primary,0.04)` → `rgba(secondary,0.04)` | Ikony w primary, hover z primary shadow |
| **Problem** | Ciepły odcień primary: `#FFF5F0` lub podobny | Statystyki w kolorze ostrzegawczym |
| **Solution/Bento** | White → `rgba(secondary,0.05)` | Naprzemienne ikony primary/secondary na kartach |
| **How It Works** | Ciepły odcień accent: `#FFF8E7` | Numery kroków w różnych kolorach (primary → secondary → green) |
| **Comparison** | `rgba(secondary,0.05)` → white | Podświetlona kolumna produktu z `rgba(primary,0.08)` |
| **Testimonials** | White → `rgba(primary,0.03)` | Gwiazdki w accent, avatary w primary-soft |
| **FAQ** | `rgba(secondary,0.05)` → white | Ikony strzałek w primary |
| **Offer** | Gradient: `rgba(primary,0.05)` → white → `rgba(secondary,0.05)` | Animowany border z primary+secondary+accent, cena w primary |
| **CTA Banner** | **Gradient: primary → secondary** (pełne kolory!) | Biały tekst, biały przycisk z primary tekstem |
| **Footer** | Jasny `#FAFAFA` | Border-top gradient primary → secondary |

### Przykłady CSS dla kolorowych tł sekcji

```css
/* Hero - ciepły gradient */
.hero { background: linear-gradient(135deg, #FFF7F3 0%, #FFF 50%, #F0FDFA 100%); }

/* Trust Bar - subtelny gradient z border */
.trust-bar {
  background: linear-gradient(90deg, rgba(primary,0.04) 0%, rgba(secondary,0.04) 100%);
  border-top: 1px solid rgba(primary,0.1);
}

/* Problem - ciepły orange */
.problem { background: linear-gradient(180deg, #FFFBF8 0%, #FFF5F0 100%); }

/* CTA Banner - pełne kolory! */
.cta-banner { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); }
.cta-banner .cta-title { color: #FFFFFF; }
.cta-banner .btn-primary { background: #FFFFFF; color: var(--primary); }
```

### Hover effects z kolorami marki

```css
.trust-item:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(primary, 0.15);
}

.bento-card:hover {
  border-color: var(--primary);
  box-shadow: 0 12px 24px rgba(primary, 0.15);
}

/* Naprzemienne kolory dla kart */
.bento-card:nth-child(2):hover { border-color: var(--secondary); }
.bento-card:nth-child(2) .bento-icon { background: rgba(secondary, 0.1); }
.bento-card:nth-child(2) .bento-icon svg { color: var(--secondary); }
```

### Motyw ciemny (TYLKO na życzenie - tech/gaming)
- Background: `#0A0A0A` lub `#0D1117`
- Tekst: `#FFFFFF` z opacity 0.5-1.0
- Akcenty: neonowe (cyan, magenta, lime)
- Efekty: glow, particles, noise texture
- Przyklad: VibeStrike

## Tech Stack (vanilla)

```
- HTML5 semantic
- CSS3 (custom properties, grid, flexbox)
- Vanilla JS (intersection observer dla fade-in, hamburger)
- Google Fonts
- Zero dependencies
```

## CSS Architecture

### Zmienne CSS (root)
```css
:root {
  /* Brand Colors */
  --primary: [kolor z brandingu];
  --secondary: [kolor z brandingu];
  --accent: [kolor z brandingu];
  --neutral-dark: [kolor z brandingu];
  --neutral-mid: [kolor z brandingu];
  --neutral-light: [kolor z brandingu];

  /* Derived */
  --primary-soft: rgba([primary], 0.08);
  --primary-glow: rgba([primary], 0.25);

  /* Typography */
  --font-heading: '[font-heading]', sans-serif;
  --font-body: '[font-body]', sans-serif;
  --font-accent: '[font-accent]', monospace;
}
```

### Utility Classes
```css
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.fade-in { opacity: 0; transform: translateY(40px); transition: 0.8s; }
.fade-in.visible { opacity: 1; transform: translateY(0); }
.section-label { font-family: var(--font-accent); font-size: 11px; text-transform: uppercase; letter-spacing: 3px; }
```

### Responsive Breakpoints
```css
@media (max-width: 768px) { /* Tablet/Mobile */ }
@media (max-width: 480px) { /* Small mobile */ }
@media (max-width: 380px) { /* Extra small */ }
```

## Komponenty

### Header (Glassmorphism)
```css
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba([bg], 0.7);
  border-bottom: 1px solid rgba([primary], 0.08);
}
```

### Trust Bar (WAŻNE - jedna linia!)

**Trust Bar MUSI być w jednej linii na desktop.** Użyj `flex-wrap: nowrap` i kompaktowych rozmiarów.

```css
.trust-items {
  display: flex;
  justify-content: center;
  gap: 20px;           /* NIE 48px - za duże! */
  flex-wrap: nowrap;   /* WAŻNE: nowrap na desktop */
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;  /* Kompaktowy padding */
  flex-shrink: 0;
}

.trust-icon {
  width: 40px;         /* NIE 48px */
  height: 40px;
  flex-shrink: 0;
}

.trust-text {
  white-space: nowrap; /* Zapobiega łamaniu tekstu */
}

.trust-text strong { font-size: 13px; }
.trust-text span { font-size: 12px; }

/* Mobile - wtedy flex-wrap: wrap */
@media (max-width: 768px) {
  .trust-items {
    flex-wrap: wrap;
    gap: 16px;
  }
}
```

### Hero Glow Effect
```css
.hero-glow {
  position: absolute; width: 900px; height: 900px; border-radius: 50%;
  background: radial-gradient(circle, rgba([primary], 0.2) 0%, transparent 70%);
  animation: glow-pulse 4s ease-in-out infinite alternate;
}
```

### Hero Background Animation (WYMAGANE!)

**KAŻDY landing MUSI mieć subtelną animację W TLE sekcji hero** dopasowaną do produktu. Animacja jest dekoracyjna — placeholder/zdjęcie produktu pozostaje jako główny element wizualny!

#### Zasady:
- Animacja jest **w tle**, nie zastępuje placeholdera na zdjęcie
- Musi być **subtelna** (opacity 0.1-0.4, delikatne ruchy)
- Powinna **nawiązywać do produktu** (nie generyczna)
- Nie może rozpraszać od głównej treści

#### Typy animacji w zależności od produktu:

| Kategoria produktu | Typ animacji | Elementy |
|-------------------|--------------|----------|
| **Urządzenia masujące/wibracyjne** | Pulsujące fale/kręgi | Koncentryczne kręgi rozchodzące się jak wibracje |
| **Napoje/żywność** | Unoszące się cząsteczki | Bąbelki, kropelki płynące w górę |
| **Kosmetyki/beauty** | Delikatne fale | Płynne, organiczne kształty |
| **Tech/gadżety** | Geometryczne elementy | Linie, siatki, subtelne kształty |
| **Ciepło/termoterapia** | Ciepłe cząsteczki | Pomarańczowe/czerwone punkty unoszące się |

#### Struktura HTML (dodaj po hero-glow):

```html
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow-2"></div>

  <!-- Background animation - DODAJ TO -->
  <div class="hero-bg-animation">
    <div class="vibration-wave vibration-wave-1"></div>
    <div class="vibration-wave vibration-wave-2"></div>
    <div class="vibration-wave vibration-wave-3"></div>
    <div class="heat-particles">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
  </div>

  <div class="container">
    <!-- ... reszta hero (zdjęcie produktu POZOSTAJE!) -->
  </div>
</section>
```

#### CSS dla animacji tła:

```css
.hero-bg-animation {
  position: absolute;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
  width: 500px;
  height: 500px;
  pointer-events: none;
  z-index: 0;
}

/* Pulsujące fale - subtelne kręgi */
.vibration-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  animation: vibration-pulse 4s ease-out infinite;
}

.vibration-wave-1 { width: 200px; height: 200px; }
.vibration-wave-2 { width: 300px; height: 300px; animation-delay: 1s; }
.vibration-wave-3 { width: 400px; height: 400px; animation-delay: 2s; }

@keyframes vibration-pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
}

/* Unoszące się cząsteczki */
.heat-particles span {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(var(--secondary-rgb), 0.3);
  border-radius: 50%;
  animation: particle-float 6s ease-in-out infinite;
}

@keyframes particle-float {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-20px); opacity: 0.6; }
}

/* Responsive - zmniejsz i przyciemnij na mobile */
@media (max-width: 768px) {
  .hero-bg-animation {
    width: 300px;
    height: 300px;
    opacity: 0.5;
  }
}
```

#### Wskazówki:

1. **Subtelność > efektowność** — animacja ma być ledwo zauważalna
2. **Użyj kolorów marki** z niską opacity (0.1-0.3)
3. **Pozycja** — zazwyczaj po prawej stronie, za zdjęciem produktu
4. **Mobile** — zmniejsz rozmiar i opacity lub ukryj całkowicie
5. **Dostosuj typ animacji** — zmień w zależności od produktu (fale dla masażerów, bąbelki dla napojów, itp.)

### Bento Card with Spotlight
```css
.bento-card .spotlight {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba([primary], 0.08) 0%, transparent 70%);
  pointer-events: none; opacity: 0; transition: opacity 0.4s;
}
.bento-card:hover .spotlight { opacity: 1; }
```

### Shimmer Button
```css
.btn-shimmer::after {
  content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 3s infinite;
}
@keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
```

### Border Beam (Offer Box)
```css
.offer-box::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--accent), var(--primary));
  animation: border-beam 3s linear infinite; background-size: 200% 100%;
}
```

### Marquee (Infinite Scroll)
```css
.marquee-track {
  display: flex; gap: 48px; width: max-content;
  animation: marquee 25s linear infinite;
}
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
```

## Hero Headline — NAJWAŻNIEJSZY ELEMENT LANDING PAGE

> **KRYTYCZNE:** Nagłówek w Hero to pierwszy i najważniejszy element, który widzi użytkownik. To ON decyduje czy ktoś zostanie na stronie czy zamknie kartę. Poświęć na niego najwięcej czasu i uwagi!

### Cel nagłówka

Nagłówek MUSI w jednym zdaniu:
1. **Trafić w ból** — użytkownik musi poczuć "to o mnie!"
2. **Pokazać rozwiązanie** — dać nadzieję, że problem da się rozwiązać
3. **Wzbudzić ciekawość** — zachęcić do scrollowania dalej

### Struktura skutecznego nagłówka

```
[EFEKT/KORZYŚĆ] + [BEZ BÓLU/PROBLEMU] + [DZIĘKI CZEMU]
```

**Przykłady:**

| Produkt | ŹLE (generyczne) | DOBRZE (trafia w ból) |
|---------|------------------|----------------------|
| Robot do okien | "Nowoczesny robot do mycia okien" | "Lśniące okna bez drabiny i ryzyka" |
| Masażer | "Profesjonalny masażer do ciała" | "Koniec z bólem pleców. Bez wychodzenia do fizjoterapeuty." |
| Napój H2 | "Woda wzbogacona wodorem" | "Więcej energii bez kawy. Naturalnie." |
| Termofor | "Inteligentny termofor elektryczny" | "Głęboka ulga w bólu. Bez tabletek, bez skutków ubocznych." |

### Proces tworzenia nagłówka

1. **Zidentyfikuj główny ból** z raportu PDF (pain points grupy docelowej)
2. **Znajdź emocję** — co najbardziej frustruje klienta?
3. **Sformułuj obietnicę** — co zmieni się w życiu klienta po zakupie?
4. **Skróć do max. 8-10 słów** — nagłówek musi być krótki i uderzający
5. **Usuń żargon** — pisz jak do przyjaciela, nie jak marketingowiec

### Subheadline (podtytuł)

Subheadline rozszerza nagłówek i dodaje konkret:
- **Mechanizm działania** — jak to działa?
- **Dowód społeczny** — "Zaufało nam X osób"
- **Unikalność** — co wyróżnia od konkurencji?

**Przykład pełnego Hero copy:**

```
Headline: "Lśniące okna bez drabiny i ryzyka"
Subheadline: "Robot GlassNova z siłą ssania 5600Pa myje nawet najtrudniej dostępne szyby. Ty odpoczywasz, on pracuje."
```

### Checklistka przed finalizacją nagłówka

- [ ] Czy trafia w konkretny ból (nie ogólniki)?
- [ ] Czy obiecuje rozwiązanie (nie tylko opisuje produkt)?
- [ ] Czy jest krótki (max 10 słów)?
- [ ] Czy brzmi naturalnie (nie marketingowo)?
- [ ] Czy wzbudza emocję (strach, nadzieja, ulga)?
- [ ] Czy jest unikalny (nie pasuje do konkurencji)?

### Czego NIGDY nie pisać w nagłówku

| ŹLE | Dlaczego |
|-----|----------|
| "Poznaj [MARKA]" | Nikogo nie obchodzi nazwa, obchodzi go rozwiązanie |
| "Najlepszy produkt na rynku" | Puste słowa, każdy tak mówi |
| "Innowacyjna technologia" | Żargon, nic nie znaczy |
| "Wysoka jakość w przystępnej cenie" | Generyczne, nudne |
| Nazwa produktu jako headline | Marka nic nie mówi nowemu użytkownikowi |

**Zasada:** Nagłówek powinien działać nawet BEZ logo i nazwy marki. Jeśli usuniesz markę i nadal działa — jest dobry.

## Senior Copywriter's Playbook

> **FILOZOFIA**: Copy sprzedaje więcej niż design. Każde słowo musi pracować. Pisz jak do przyjaciela, nie jak korporacja. Poziom: doświadczony copywriter direct response, 15+ lat w branży.

---

### Zasady ogólne

#### Ton i głos

| Zasada | Jak stosować |
|--------|--------------|
| **Konwersacyjny** | Pisz jak mówisz. "Wiesz co?" zamiast "Należy zauważyć, że..." |
| **Bezpośredni** | "Ty" i "Twój" — mów do jednej osoby, nie do tłumu |
| **Konkretny** | Liczby > przymiotniki. "26 sekund" > "bardzo szybko" |
| **Emocjonalny** | Najpierw emocja, potem logika. Ludzie kupują emocjami |
| **Prosty** | Zdania max 15 słów. Akapity max 3 zdania. Dużo białej przestrzeni |

#### Struktura zdań

```
ŹLE:  "Nasze innowacyjne rozwiązanie wykorzystuje zaawansowaną technologię..."
DOBRZE: "Włączasz. Czekasz 26 sekund. Gotowe."

ŹLE:  "Produkt charakteryzuje się wysoką jakością wykonania..."
DOBRZE: "Niemiecka stal. 5 lat gwarancji. Zero plastiku."
```

#### Zasada "So what?"

Po każdym zdaniu zadaj sobie: "I co z tego dla klienta?"

```
CECHA: "Ciśnienie 30 kPa"
SO WHAT? → "Usuwa nawet najgłębsze zagięcia"
SO WHAT? → "Wyglądasz profesjonalnie bez wysiłku"
SO WHAT? → "Pewność siebie na każdym spotkaniu"
```

Pisz ostatnie "so what" — to jest prawdziwa korzyść.

---

### Psychologia perswazji (Cialdini) w praktyce

| Zasada | Gdzie na landing page | Jak użyć |
|--------|----------------------|----------|
| **Social Proof** | Testimonials, Trust Bar, Marquee | "Zaufało nam 2,847 klientów", cytaty z imionami |
| **Scarcity** | Offer, Urgency Bar | "Zostało 12 sztuk", "Oferta kończy się za..." |
| **Authority** | Trust Bar, How It Works | "Rekomendowany przez...", certyfikaty, nagrody |
| **Reciprocity** | Problem section, FAQ | Daj wartość za darmo (edukacja) zanim prosisz o zakup |
| **Consistency** | Micro-commitments | Małe "tak" prowadzą do dużego "tak" (scroll → klik → zakup) |
| **Liking** | Cały copy | Pisz jak przyjaciel, pokaż że rozumiesz ich świat |

---

### Copy per sekcja — szczegółowe wytyczne

#### 1. HERO SECTION

**Cel**: Zatrzymać scroll, wzbudzić ciekawość, obiecać transformację

**Struktura**:
```
[BADGE] — opcjonalny, buduje credibility
[HEADLINE] — max 10 słów, trafia w ból LUB obiecuje wynik
[SUBHEADLINE] — 1-2 zdania, mechanizm działania lub dowód
[CTA PRIMARY] — akcja + korzyść
[CTA SECONDARY] — niższe ryzyko
```

**Formuły headline**:

| Formuła | Przykład |
|---------|----------|
| **[Wynik] bez [ból]** | "Lśniące okna bez drabiny i ryzyka" |
| **[Wynik] w [czas]** | "Profesjonalny wygląd w 26 sekund" |
| **Koniec z [ból]** | "Koniec z bólem pleców. Bez tabletek." |
| **[Pytanie retoryczne]** | "Ile czasu tracisz na prasowanie?" |
| **[Liczba] + [obietnica]** | "3 minuty do idealnie gładkich ubrań" |

**Subheadline — co zawrzeć**:
- JAK to działa (mechanizm)
- DLACZEGO to działa (technologia/nauka)
- DLA KOGO to jest (identyfikacja)

```
Przykład kompletny:
Badge: "Bestseller 2024"
Headline: "Elegancja w 26 sekund"
Subheadline: "Parownica Prasik rozgrzewa się błyskawicznie i generuje ciśnienie 30 kPa —
trzykrotnie więcej niż konkurencja. Dla profesjonalistów, którzy cenią swój czas."
CTA 1: "Zamów teraz"
CTA 2: "Zobacz jak działa"
```

---

#### 2. TRUST BAR

**Cel**: Szybkie budowanie zaufania, redukcja ryzyka

**Struktura**: 4-5 ikon z krótkimi tekstami

**Co umieszczać**:

| Typ | Przykład |
|-----|----------|
| **Gwarancja** | "30 dni na zwrot" |
| **Dostawa** | "Darmowa dostawa od 200 zł" |
| **Bezpieczeństwo** | "Bezpieczna płatność" |
| **Jakość** | "2 lata gwarancji" |
| **Social proof** | "4.8/5 (2,847 opinii)" |

**Zasady copy**:
- Max 4 słowa per element
- Konkretne liczby > ogólniki
- "30 dni" > "Gwarancja satysfakcji"

---

#### 3. PROBLEM SECTION

**Cel**: Agitacja — sprawić, żeby czytelnik poczuł ból MOCNIEJ

**Ton**: Empatyczny, rozumiejący, NIE oskarżający

**Struktura**:
```
[SECTION LABEL] — "Problem" / "Wyzwanie" / "Dlaczego to takie trudne"
[HEADLINE] — pytanie retoryczne LUB stwierdzenie bólu
[BODY] — 2-3 zdania opisujące sytuację klienta
[AGITACJA] — statystyka lub konsekwencje niedziałania
[WIZUALIZACJA] — obraz problemu
```

**Formuły headline**:

| Formuła | Przykład |
|---------|----------|
| **"Czy też masz dość...?"** | "Czy też masz dość prasowania przed każdym spotkaniem?" |
| **"[Liczba] Polaków..."** | "8 na 10 Polaków zmaga się z tym codziennie" |
| **"Prawda o [rzecz]"** | "Prawda o tradycyjnym prasowaniu" |
| **"Dlaczego [ból]?"** | "Dlaczego zawsze brakuje czasu rano?" |

**Body — jak pisać**:

```
WZÓR:
"Znasz to uczucie. [Sytuacja]. [Konsekwencja]. [Frustracja]."

PRZYKŁAD:
"Znasz to uczucie. Rano, w pośpiechu, zauważasz że koszula jest
pognieciona. Nie masz czasu na żelazko i deskę. Wychodzisz z domu
z niepewnością — czy ktoś zauważy?"
```

**Agitacja — statystyki**:
- Użyj prawdziwych danych jeśli dostępne
- Jeśli brak — użyj relatywnych ("większość", "co drugi")
- Pokaż KONSEKWENCJE problemu

```
"72% profesjonalistów przyznaje, że wygląd wpływa na ich pewność siebie
podczas ważnych spotkań."
```

**UWAGA**: NIE używaj straszenia. Agitacja = pogłębienie zrozumienia, nie manipulacja strachem.

---

#### 4. SOLUTION / BENTO SECTION

**Cel**: Przedstawić produkt jako odpowiedź na problem, wzbudzić ekscytację

**Ton**: Entuzjastyczny ale rzeczowy, konkretny

**Struktura**:
```
[SECTION LABEL] — "Rozwiązanie" / "Przedstawiamy"
[HEADLINE] — "Poznaj [MARKA] — [obietnica 3-5 słów]"
[SUBHEADLINE] — 1 zdanie podsumowujące USP
[4 KARTY BENTO] — po jednej funkcji/korzyści każda
```

**Formuła headline**: `"Poznaj [MARKA] — [główna obietnica]"`

```
"Poznaj Prasik — elegancja w 26 sekund"
"Przedstawiamy GlassNova — czyste okna bez wysiłku"
```

**Karty Bento — struktura każdej**:

```
[IKONA] — wizualna reprezentacja
[TYTUŁ] — 2-4 słowa, korzyść lub cecha
[OPIS] — 1-2 zdania, jak to działa i co daje
```

**4 karty — co zawierać**:

| Karta | Typ | Przykład dla parownicy |
|-------|-----|------------------------|
| **Karta 1** | Główna technologia/USP | "26 sekund do gotowości" |
| **Karta 2** | Bezpieczeństwo/jakość | "Ciśnienie 30 kPa — 3x więcej" |
| **Karta 3** | Wygoda użytkowania | "Składana — zabierz wszędzie" |
| **Karta 4** | Efekt końcowy | "Profesjonalny wygląd codziennie" |

**Jak pisać opisy kart**:

```
ŹLE:  "Urządzenie wykorzystuje zaawansowaną technologię generowania pary..."
DOBRZE: "Włączasz, czekasz 26 sekund, prasujesz. Zero komplikacji."

ŹLE:  "Wysokie ciśnienie pary zapewnia skuteczne wygładzanie..."
DOBRZE: "30 kPa ciśnienia. Nawet najgłębsze zagięcia znikają w sekundy."
```

---

#### 5. HOW IT WORKS SECTION

**Cel**: Usunąć niepewność, pokazać prostotę

**Ton**: Prosty, uspokajający, instruktażowy

**Struktura**:
```
[SECTION LABEL] — "Jak to działa" / "3 proste kroki"
[HEADLINE] — podkreśl prostotę
[3 KROKI] — każdy z numerem, tytułem i opisem
```

**Formuła headline**:

```
"3 kroki do [wyniku]"
"Proste jak 1-2-3"
"Tak łatwo to działa"
```

**Struktura kroków**:

| Krok | Co zawiera | Przykład |
|------|------------|----------|
| **Krok 1** | PRZYGOTOWANIE | "Napełnij zbiornik wodą" |
| **Krok 2** | AKCJA | "Poczekaj 26 sekund na rozgrzanie" |
| **Krok 3** | WYNIK | "Prasuj pionowo — gotowe!" |

**Zasady**:
- Max 3 kroki (mózg lubi trójki)
- Każdy krok = jedno działanie
- Użyj czasowników w trybie rozkazującym
- Ostatni krok = wynik, nie akcja

```
ŹLE:  "Krok 3: Należy przesunąć urządzenie po tkaninie"
DOBRZE: "Krok 3: Ciesz się idealnie gładkimi ubraniami"
```

---

#### 6. COMPARISON SECTION

**Cel**: Pokazać wyższość nad alternatywami (tradycyjne metody, konkurencja)

**Ton**: Faktyczny, rzeczowy — niech liczby mówią

**WAŻNE**: NIE używaj checkmarków ✓/✗ — to wygląda jak AI-generated!

**Format A — Dwie karty z opisami** (ZALECANY):

```
[KARTA LEWA: "Tradycyjne metody"]
- Opis problemu 1 pełnym zdaniem
- Opis problemu 2 pełnym zdaniem
- Opis problemu 3 pełnym zdaniem

[KARTA PRAWA: "[MARKA]" — wyróżniona]
- Opis przewagi 1 pełnym zdaniem
- Opis przewagi 2 pełnym zdaniem
- Opis przewagi 3 pełnym zdaniem
```

**Przykład dla parownicy**:

```
Tradycyjne żelazko:
- Rozgrzewanie trwa 3-5 minut
- Potrzebujesz deski do prasowania
- Ryzyko przypalenia delikatnych tkanin

Prasik:
- Gotowy do pracy w 26 sekund
- Prasujesz pionowo, bez deski
- Bezpieczny dla wszystkich materiałów
```

---

#### 7. TESTIMONIALS SECTION

**Cel**: Social proof — pokazać że inni kupili i są zadowoleni

**Ton**: Autentyczny, surowy — NIE wygładzony marketingowo

**Struktura testimonial**:

```
[CYTAT] — 2-3 zdania, konkretny wynik
[IMIĘ I PIERWSZA LITERA NAZWISKA] — "Anna K."
[KONTEKST] — "Kupiła 3 miesiące temu" / "Podróżuje służbowo"
[RATING] — gwiazdki (opcjonalnie)
```

**Co sprawia że testimonial działa**:

| Element | ŹLE | DOBRZE |
|---------|-----|--------|
| **Konkret** | "Świetny produkt!" | "Używam od 3 miesięcy, oszczędzam 20 minut dziennie" |
| **Wynik** | "Jestem zadowolona" | "Teraz zawsze wyglądam profesjonalnie" |
| **Wątpliwości** | (brak) | "Początkowo byłam sceptyczna, ale..." |
| **Szczegóły** | (ogólniki) | "Zabieram na delegacje, mieści się w torbie" |

**Formuła dobrego testimonial**:

```
"[WĄTPLIWOŚĆ]. [CO ZROBIŁAM]. [WYNIK KONKRETNY]. [EMOCJA/REKOMENDACJA]."

Przykład:
"Myślałam że to kolejny gadżet do szuflady. Kupiłam, bo mam dość żelazka.
Po miesiącu nie wyobrażam sobie poranka bez Prasika. Polecam każdemu
kto ceni swój czas."
— Katarzyna M., Warszawa
```

**WAŻNE**: Jeśli nie masz prawdziwych testimoniali, użyj placeholderów z instrukcją dla klienta żeby dostarczył.

---

#### 8. FAQ SECTION

**Cel**: Eliminacja obiekcji, rozwianie wątpliwości

**Ton**: Rzeczowy, uspokajający, bezpośredni

**Jakie pytania wybierać**:

| Typ pytania | Cel | Przykład |
|-------------|-----|----------|
| **Obiekcja cenowa** | Uzasadnić wartość | "Czy to nie za drogo?" |
| **Wątpliwość jakościowa** | Rozwiać strach | "Jak długo będzie działać?" |
| **Pytanie techniczne** | Edukować | "Jak działa ciśnienie 30 kPa?" |
| **Logistyka** | Usunąć tarcie | "Jak szybko dostanę przesyłkę?" |
| **Gwarancja/zwrot** | Zredukować ryzyko | "Co jeśli mi się nie spodoba?" |

**Jak odpowiadać**:

```
ŹLE (korporacyjny):
P: "Jaki jest czas dostawy?"
O: "Czas realizacji zamówienia wynosi od 2 do 5 dni roboczych,
w zależności od dostępności produktu i lokalizacji odbiorcy."

DOBRZE (ludzki):
P: "Kiedy dostanę przesyłkę?"
O: "Wysyłamy w 24h. Standardowo dostajesz w 2-3 dni. Dostawa
kurierem jest darmowa od 200 zł."
```

**Pytanie o zwrot — zawsze to samo**:

```
P: "Co jeśli mi się nie spodoba?"
O: "Masz 30 dni na testy. Jeśli nie jesteś zadowolony — zwracasz,
my oddajemy pieniądze. Bez pytań, bez tłumaczenia się. Zero ryzyka."
```

---

#### 9. OFFER SECTION

**Cel**: Finalizacja — przekonać do zakupu TERAZ

**Ton**: Pilny ale nie nachalny, pewny, konkretny

**Struktura**:

```
[BADGE] — "Bestseller" / "Najpopularniejszy wybór"
[ZDJĘCIE PRODUKTU/ZESTAWU]
[NAZWA PAKIETU] — np. "Zestaw Prasik Pro"
[LISTA ZAWARTOŚCI] — co dokładnie dostają
[CENA] — przekreślona stara + nowa
[OSZCZĘDNOŚĆ] — "Oszczędzasz X zł"
[CTA BUTTON] — akcja + korzyść
[GWARANCJA] — redukcja ryzyka
[URGENCY] — (opcjonalnie) ograniczona dostępność
```

**Pricing psychology**:

| Technika | Jak użyć |
|----------|----------|
| **Anchoring** | Pokaż wyższą cenę przekreśloną |
| **Charm pricing** | 297 zł zamiast 300 zł |
| **Bundle** | "Zestaw wart 450 zł za 297 zł" |
| **Per-day framing** | "Mniej niż kawa dziennie" |

**Lista zawartości — jak pisać**:

```
ŹLE:
✓ Parownica
✓ Instrukcja
✓ Kabel

DOBRZE:
• Parownica Prasik z technologią 30 kPa
• Miarka do wody (precyzyjne napełnianie)
• Pokrowiec podróżny (zabierz wszędzie)
• Instrukcja + video poradnik
• 2 lata pełnej gwarancji
```

**CTA button — formuły**:

| Formuła | Przykład |
|---------|----------|
| **Akcja + korzyść** | "Zamów i zaoszczędź 153 zł" |
| **Odbierz + obiektnicę** | "Odbierz swój Prasik" |
| **Dołącz + społeczność** | "Dołącz do 2,847 zadowolonych klientów" |
| **Proste** | "Zamów teraz" |

**Gwarancja — jak pisać**:

```
ŹLE:  "Oferujemy 30-dniową gwarancję satysfakcji..."
DOBRZE: "30 dni na testy. Nie pasuje? Zwracasz, oddajemy kasę.
Bez pytań. Zero ryzyka po Twojej stronie."
```

---

#### 10. CTA BANNER (ostatnia szansa)

**Cel**: Ostatni impuls przed opuszczeniem strony

**Ton**: Prosty, bezpośredni, pilny

**Struktura**:
```
[HEADLINE] — krótki, uderzający
[CTA BUTTON] — ten sam co w Offer
```

**Formuły headline**:

```
"Gotowy na zmianę?"
"Dołącz do zadowolonych klientów"
"Nie czekaj. Zamów teraz."
"Elegancja w 26 sekund czeka na Ciebie"
```

---

### Słowa które sprzedają w polskim

#### Power words (używaj często):

| Kategoria | Słowa |
|-----------|-------|
| **Pilność** | teraz, dziś, natychmiast, od razu, już |
| **Ekskluzywność** | tylko, wyłącznie, specjalnie, limitowany |
| **Łatwość** | prosty, łatwy, szybki, bez wysiłku, bez problemu |
| **Bezpieczeństwo** | bezpieczny, pewny, gwarancja, bez ryzyka |
| **Wynik** | efekt, rezultat, zmiana, transformacja |
| **Emocje** | wreszcie, nareszcie, koniec z, żegnaj |

#### Słowa do UNIKANIA (brzmią korporacyjnie):

| UNIKAJ | ZAMIEŃ NA |
|--------|-----------|
| "innowacyjny" | (opisz co konkretnie) |
| "najwyższa jakość" | "2 lata gwarancji" |
| "profesjonalny" | "używany przez ekspertów" |
| "kompleksowy" | "wszystko czego potrzebujesz" |
| "optymalizacja" | "oszczędzasz czas" |
| "implementacja" | "używanie" |
| "rozwiązanie" | (nazwa produktu) |
| "charakteryzuje się" | "ma" / "daje" |

---

### Checklist przed publikacją copy

- [ ] Każde zdanie ma max 15 słów?
- [ ] Akapity mają max 3 zdania?
- [ ] Używam "Ty/Twój" nie "nasz/nasze"?
- [ ] Są konkretne liczby zamiast przymiotników?
- [ ] Headline trafia w ból lub obiecuje wynik?
- [ ] Testimoniale są konkretne (wynik, nie opinia)?
- [ ] FAQ odpowiada na prawdziwe obiekcje?
- [ ] CTA zawiera korzyść, nie tylko akcję?
- [ ] Brak korporacyjnego żargonu?
- [ ] Copy brzmi jak rozmowa z przyjacielem?

---

## Conversion Boosters (5 krytycznych elementów)

### 1. Above-the-fold Checklist

> **ZASADA 3 SEKUND**: Masz 3 sekundy, żeby przekonać użytkownika do zostania. Wszystko co najważniejsze MUSI być widoczne bez scrollowania.

#### Co MUSI być widoczne od razu (desktop):

| Element | Priorytet | Przykład |
|---------|-----------|----------|
| **Headline** | #1 | "Elegancja w 26 sekund" |
| **Jedno USP** | #2 | "Ciśnienie 30 kPa — 3x więcej niż konkurencja" |
| **CTA Button** | #3 | "Zamów teraz" (widoczny, kontrastowy) |
| **Trust Signal** | #4 | Badge "Bestseller 2024" lub "4.8/5 (2,847 opinii)" |
| **Hero Image** | #5 | Produkt w akcji lub packshot |

#### Checklistka Above-the-fold:

- [ ] Headline widoczny w całości (nie ucięty)?
- [ ] CTA Button w kolorze kontrastowym do tła?
- [ ] Przynajmniej jeden element zaufania (badge, liczba, gwiazdki)?
- [ ] Zero "lorem ipsum" lub pustych placeholderów w pierwszym ekranie?
- [ ] Subheadline wyjaśnia CO i DLA KOGO?

#### Czego NIE umieszczać above-the-fold:

| Element | Dlaczego |
|---------|----------|
| Długi opis produktu | Nikt nie czyta — scroll down |
| Cena | Za wcześnie — najpierw wartość |
| Logo partnerów | Rozpraszają uwagę |
| Wiele CTA | Paraliż decyzyjny |
| Animacje na headline | Spowalniają percepcję |

#### Wzorzec Hero Section (above-the-fold):

```
┌─────────────────────────────────────────────────┐
│  [LOGO]                    [NAV] [CTA HEADER]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  [BADGE: Bestseller 2024]                       │
│                                                 │
│  HEADLINE: Elegancja w 26 sekund       [HERO   │
│                                         IMAGE]  │
│  Subheadline: Parownica z ciśnieniem            │
│  30 kPa — rozgrzewa się błyskawicznie.          │
│                                                 │
│  [CTA PRIMARY]  [CTA SECONDARY]                 │
│                                                 │
│  ★★★★★ 4.8/5 (2,847 opinii)                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 2. Urgency & Scarcity System

> **PSYCHOLOGIA**: Ludzie bardziej boją się straty niż cieszą z zysków. Urgency i scarcity aktywują ten mechanizm.

#### Rodzaje urgency:

| Typ | Kiedy używać | Przykład |
|-----|--------------|----------|
| **Time-based** | Promocje, launche | "Oferta kończy się za 2h 34min" |
| **Quantity-based** | Limitowane produkty | "Zostało tylko 12 sztuk" |
| **Social proof** | Popularne produkty | "23 osoby teraz oglądają" |
| **Deadline** | Kampanie | "Cena wzrośnie 1 marca" |

#### Implementacja — Urgency Bar (sticky):

```html
<!-- Urgency Bar - sticky na górze -->
<div class="urgency-bar">
  <div class="urgency-content">
    <span class="urgency-icon">⏰</span>
    <span class="urgency-text">
      <strong>Promocja kończy się za:</strong>
      <span id="countdown">02:34:17</span>
    </span>
    <span class="urgency-cta">Zamów teraz →</span>
  </div>
</div>
```

```css
.urgency-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #dc2626, #b91c1c);
  color: white;
  padding: 10px 20px;
  text-align: center;
  z-index: 1000;
  font-size: 14px;
}
```

#### Implementacja — Stock Counter:

```html
<div class="stock-warning">
  <span class="stock-icon">🔥</span>
  <span>Zostało tylko <strong>12 sztuk</strong> w magazynie</span>
</div>
```

#### Implementacja — Social Proof Live:

```html
<div class="live-viewers">
  <span class="pulse-dot"></span>
  <span>23 osoby teraz oglądają ten produkt</span>
</div>
```

```css
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
```

#### Zasady etyczne:

| DOBRZE | ŹLE |
|--------|-----|
| Prawdziwy timer do końca promocji | Fake timer który resetuje się po odświeżeniu |
| Rzeczywisty stan magazynowy | "Zostały 3 sztuki" gdy masz 500 |
| Prawdziwa liczba oglądających | Losowa liczba |

**ZASADA**: Urgency musi być prawdziwe. Fałszywe urgency niszczy zaufanie i może być nielegalne.

---

### 3. Mobile-first Copy Rules

> **FAKT**: 60-70% ruchu to mobile. Jeśli strona nie działa na telefonie — tracisz większość klientów.

#### Różnice Desktop vs Mobile:

| Element | Desktop | Mobile |
|---------|---------|--------|
| **Headline** | Max 10 słów | **Max 6 słów** |
| **Subheadline** | 2 zdania | **1 zdanie** |
| **CTA Button** | Inline | **Full-width** |
| **Pierwszy CTA** | W hero | **W pierwszym ekranie** |
| **Akapity** | 3 zdania | **2 zdania** |
| **Font size** | 16-18px | **18-20px** |

#### Mobile Headline Rules:

```
DESKTOP: "Elegancja w 26 sekund — profesjonalny wygląd bez wysiłku"
MOBILE:  "Elegancja w 26 sekund"

DESKTOP: "Koniec z bólem pleców po całym dniu pracy przy biurku"
MOBILE:  "Koniec z bólem pleców"

DESKTOP: "Czyste okna bez drabiny, ryzyka i wysiłku"
MOBILE:  "Czyste okna bez ryzyka"
```

#### Sticky Mobile CTA:

```html
<!-- Sticky CTA na mobile - zawsze widoczny -->
<div class="mobile-sticky-cta">
  <div class="sticky-price">
    <span class="old-price">450 zł</span>
    <span class="new-price">297 zł</span>
  </div>
  <a href="#checkout" class="sticky-btn">Zamów teraz</a>
</div>
```

```css
.mobile-sticky-cta {
  display: none; /* Domyślnie ukryty */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
  z-index: 999;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .mobile-sticky-cta {
    display: flex;
  }
}

.sticky-btn {
  background: var(--primary);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
}
```

#### Mobile Checklistka:

- [ ] Headline max 6 słów?
- [ ] CTA widoczne bez scrollowania?
- [ ] Sticky CTA na dole ekranu?
- [ ] Font min 18px?
- [ ] Buttony min 44px wysokości (touch target)?
- [ ] Brak hover-only elementów?
- [ ] Obrazy zoptymalizowane (WebP, lazy loading)?

#### Touch-friendly elementy:

```css
/* Minimalne rozmiary dla touch */
.cta-button {
  min-height: 48px;
  min-width: 120px;
  padding: 14px 24px;
}

/* Większe odstępy między linkami */
.nav-link {
  padding: 12px 16px;
}

/* FAQ accordion - większy tap area */
.faq-question {
  padding: 16px 20px;
  min-height: 56px;
}
```

---

### 4. Risk Reversal Deep Dive

> **PSYCHOLOGIA**: Główny powód, dla którego ludzie NIE kupują = strach przed podjęciem złej decyzji. Risk reversal eliminuje ten strach.

#### Hierarchia Risk Reversal (od najsłabszej do najsilniejszej):

| Poziom | Typ | Siła | Przykład |
|--------|-----|------|----------|
| 1 | **Gwarancja producenta** | ★☆☆☆☆ | "2 lata gwarancji" |
| 2 | **Zwrot pieniędzy** | ★★☆☆☆ | "30 dni na zwrot" |
| 3 | **Zwrot bez pytań** | ★★★☆☆ | "Zwracasz = oddajemy kasę. Bez pytań." |
| 4 | **Try before you buy** | ★★★★☆ | "Testuj 30 dni. Płacisz tylko jeśli zostawisz." |
| 5 | **Better than money back** | ★★★★★ | "Jeśli nie zadziała, oddajemy 150% ceny." |

#### Copy dla każdego poziomu:

**Poziom 2 — Standard (30 dni zwrot):**
```
"30 dni na testy. Nie pasuje? Zwracasz, my oddajemy pieniądze."
```

**Poziom 3 — Bez pytań:**
```
"30 dni gwarancji satysfakcji. Jeśli z jakiegokolwiek powodu
nie jesteś zadowolony — zwracasz produkt, my zwracamy 100% ceny.
Bez pytań. Bez tłumaczenia się. Zero ryzyka po Twojej stronie."
```

**Poziom 4 — Try before you buy:**
```
"Wypróbuj przez 30 dni. Jeśli nie spełni Twoich oczekiwań —
wyślij z powrotem, a my pokryjemy koszt zwrotu. Płacisz tylko
jeśli zdecydujesz się zostawić."
```

**Poziom 5 — Better than money back:**
```
"Gwarancja 110%. Jeśli w ciągu 60 dni uznasz, że produkt
nie był wart swojej ceny — oddajemy pełną kwotę + 10% ekstra
za stracony czas. Tak bardzo wierzymy w nasz produkt."
```

#### Gdzie umieszczać Risk Reversal:

| Miejsce | Format | Cel |
|---------|--------|-----|
| **Trust Bar** | Ikona + "30 dni zwrot" | Wczesne zasygnalizowanie |
| **Pod ceną (Offer)** | Pełny opis gwarancji | Redukcja wahania |
| **FAQ** | Pytanie o zwrot | Odpowiedź na obiekcję |
| **Przy CTA** | Mini-tekst pod buttonem | Ostatni impuls |

#### Wizualna prezentacja gwarancji:

```html
<div class="guarantee-box">
  <div class="guarantee-badge">
    <svg><!-- Shield icon --></svg>
    <span>30 DNI</span>
  </div>
  <div class="guarantee-content">
    <h4>Gwarancja satysfakcji</h4>
    <p>Nie pasuje? Zwracasz, oddajemy kasę. Bez pytań.</p>
  </div>
</div>
```

```css
.guarantee-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  margin: 24px 0;
}

.guarantee-badge {
  width: 64px;
  height: 64px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
```

#### Procedura zwrotu — transparentność buduje zaufanie:

```
**Jak wygląda zwrot?**

1. Napisz do nas (email/formularz) w ciągu 30 dni
2. Wyślij produkt z powrotem (dajemy etykietę zwrotną)
3. Pieniądze wracają na konto w 3-5 dni roboczych

Bez pytań. Bez tłumaczenia się. Bez ukrytych kosztów.
```

---

### 5. CTA Placement Map

> **ZASADA**: Jeden CTA to za mało. Potrzebujesz CTA w strategicznych miejscach — gdy użytkownik jest "gorący" do zakupu.

#### Mapa CTA na landing page:

```
┌─────────────────────────────────────────────────┐
│ HEADER                           [CTA HEADER]  │  ← Mały, dyskretny
├─────────────────────────────────────────────────┤
│ HERO                                           │
│           [CTA PRIMARY] [CTA SECONDARY]        │  ← Główne CTA
├─────────────────────────────────────────────────┤
│ TRUST BAR                                      │
├─────────────────────────────────────────────────┤
│ PROBLEM                                        │
│                              [CTA INLINE]      │  ← Po agitacji problemu
├─────────────────────────────────────────────────┤
│ SOLUTION / BENTO                               │
├─────────────────────────────────────────────────┤
│ HOW IT WORKS                                   │
│                              [CTA INLINE]      │  ← Po pokazaniu prostoty
├─────────────────────────────────────────────────┤
│ TESTIMONIALS                                   │
│                              [CTA INLINE]      │  ← Po social proof
├─────────────────────────────────────────────────┤
│ OFFER                                          │
│                    [CTA PRIMARY DUŻY]          │  ← Główny zakupowy
├─────────────────────────────────────────────────┤
│ FAQ                                            │
├─────────────────────────────────────────────────┤
│ CTA BANNER (final)                             │
│                    [CTA PRIMARY]               │  ← Ostatnia szansa
├─────────────────────────────────────────────────┤
│ FOOTER                                         │
└─────────────────────────────────────────────────┘
│                                                 │
│ [STICKY MOBILE CTA - zawsze widoczny]          │  ← Mobile only
└─────────────────────────────────────────────────┘
```

#### Typy CTA i kiedy używać:

| Typ | Wygląd | Kiedy |
|-----|--------|-------|
| **Primary** | Pełny kolor, duży | Hero, Offer, Final Banner |
| **Secondary** | Outline, mniejszy | Hero (obok primary), jako alternatywa |
| **Inline** | Tekst + strzałka | Po sekcjach (Problem, How It Works) |
| **Sticky** | Fixed na dole | Mobile, po scroll |
| **Header** | Mały w nawigacji | Dla powracających |

#### Copy dla różnych miejsc:

| Miejsce | Copy CTA | Dlaczego |
|---------|----------|----------|
| **Hero Primary** | "Zamów teraz" | Prosty, bezpośredni |
| **Hero Secondary** | "Zobacz jak działa" | Dla niezdecydowanych |
| **Po Problem** | "Rozwiąż to teraz →" | Wykorzystaj agitację |
| **Po Testimonials** | "Dołącz do zadowolonych →" | Social proof momentum |
| **Offer** | "Zamów i oszczędź 153 zł" | Akcja + korzyść |
| **Final Banner** | "Nie czekaj. Zamów teraz." | Urgency |
| **Sticky Mobile** | "Kup teraz — 297 zł" | Cena + akcja |

#### Inline CTA po sekcji:

```html
<div class="section-cta">
  <a href="#offer" class="inline-cta">
    Sprawdź ofertę <span class="arrow">→</span>
  </a>
</div>
```

```css
.inline-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  transition: gap 0.2s;
}
.inline-cta:hover {
  gap: 12px;
}
.inline-cta .arrow {
  transition: transform 0.2s;
}
.inline-cta:hover .arrow {
  transform: translateX(4px);
}
```

#### CTA Checklistka:

- [ ] Min 5 CTA na stronie (różne typy)?
- [ ] CTA w Hero widoczne bez scroll?
- [ ] CTA po każdej "emocjonalnej" sekcji (Problem, Testimonials)?
- [ ] Sticky CTA na mobile?
- [ ] Wszystkie CTA prowadzą do tego samego miejsca (#offer lub checkout)?
- [ ] Primary CTA w kolorze kontrastowym?
- [ ] Tekst CTA zawiera korzyść, nie tylko akcję?

---

## Placeholder Images

Uzywaj systemu placeholder zamiast prawdziwych obrazow:

```html
<div class="img-placeholder" style="aspect-ratio: 16/9;">
  <div class="ph-icon"><svg>...</svg></div>
  <span class="ph-label">Hero Image</span>
  <span class="ph-size">1920×1080</span>
</div>
```

CSS:
```css
.img-placeholder {
  position: relative; overflow: hidden;
  background: var(--anthracite);
  border: 1px solid rgba([primary], 0.1);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 12px;
}
```

## Wymagane zdjęcia na landing page (KRYTYCZNE!)

> **KRYTYCZNE**: Przy generowaniu landing page MUSISZ dodać placeholder w KAŻDEJ sekcji wymagającej zdjęcia. NIE pomijaj żadnej sekcji! Użytkownik musi widzieć gdzie dokładnie wstawić zdjęcia.

### Lista wymaganych zdjęć

| # | Sekcja | Nazwa | Rozmiar | Placeholder WYMAGANY |
|---|--------|-------|---------|---------------------|
| 1 | **Hero** | Hero Product | 1200×900 | TAK - w hero-visual |
| 2 | **Problem** | Problem Visual | 800×600 | TAK - w problem-visual |
| 3 | **Solution/Bento** | Feature 1-4 | 640×360 | TAK - w każdej bento-card (4x) |
| 4 | **How It Works** | Krok 1-3 | 600×450 | TAK - w każdym how-step (3x) |
| 5 | **Testimonials** | Avatar 1-3 | 56×56 | OPCJONALNIE - można użyć inicjałów |
| 6 | **Offer** | Zestaw produktu | 800×450 | TAK - w offer-box |

### Suma: 10-14 zdjęć na landing

### Przykłady HTML placeholderów dla każdej sekcji

#### Bento Card z placeholderem:
```html
<div class="bento-card fade-in">
  <div class="spotlight"></div>
  <!-- PLACEHOLDER NA ZDJĘCIE - WYMAGANE! -->
  <div class="bento-image">
    <div class="img-placeholder" style="aspect-ratio: 16/9; margin-bottom: 20px;">
      <div class="ph-icon"><svg>...</svg></div>
      <span class="ph-label">Feature 1</span>
      <span class="ph-size">640×360px</span>
    </div>
  </div>
  <div class="bento-icon">...</div>
  <h3 class="bento-title">...</h3>
  <p class="bento-text">...</p>
</div>
```

#### How It Works z placeholderem:
```html
<div class="how-step fade-in">
  <!-- PLACEHOLDER NA ZDJĘCIE - WYMAGANE! -->
  <div class="how-step-image">
    <div class="img-placeholder" style="aspect-ratio: 4/3; margin-bottom: 20px; border-radius: 12px;">
      <div class="ph-icon"><svg>...</svg></div>
      <span class="ph-label">Krok 1</span>
      <span class="ph-size">600×450px</span>
    </div>
  </div>
  <div class="how-step-number">1</div>
  <h3 class="how-step-title">...</h3>
  <p class="how-step-text">...</p>
</div>
```

#### Offer z placeholderem:
```html
<div class="offer-box fade-in">
  <div style="text-align: center;">
    <span class="offer-badge">Bestseller</span>
    <!-- PLACEHOLDER NA ZDJĘCIE ZESTAWU - WYMAGANE! -->
    <div class="offer-image" style="margin: 24px 0;">
      <div class="img-placeholder" style="aspect-ratio: 16/9; border-radius: 16px;">
        <div class="ph-icon"><svg>...</svg></div>
        <span class="ph-label">Zestaw produktu</span>
        <span class="ph-size">800×450px</span>
      </div>
    </div>
    <h3 class="offer-title">...</h3>
    ...
  </div>
</div>
```

### Wskazówki dotyczące zdjęć

1. **Hero Product**:
   - Produkt na białym lub przezroczystym tle
   - Wysokiej jakości (min. 1200px szerokości)
   - Pokazuje produkt z najlepszej strony

2. **Feature images (Bento)**:
   - Mogą być zbliżenia detali produktu
   - Mogą pokazywać produkt w użyciu
   - Spójny styl wizualny

3. **How It Works**:
   - Jasne, instruktażowe zdjęcia
   - Pokazują kolejne etapy użycia
   - Mogą zawierać ręce użytkownika

4. **Testimonials avatars**:
   - Prawdziwe zdjęcia lub stockowe
   - Spójne oświetlenie i styl
   - Twarze zwrócone do kamery

5. **Offer zestaw**:
   - Wszystkie elementy zestawu widoczne
   - Flat lay lub lekko pod kątem
   - Profesjonalne oświetlenie

### Alternatywy gdy brak zdjęć

- Użyj zdjęć stockowych (Unsplash, Pexels)
- Wygeneruj AI (Midjourney, DALL-E)
- Użyj mockupów produktowych
- W ostateczności: zostaw placeholdery i poproś klienta o dostarczenie

## JavaScript (minimal)

```javascript
// Intersection Observer dla fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// Spotlight effect for bento cards
document.querySelectorAll('.bento-card').forEach(card => {
  const spotlight = card.querySelector('.spotlight');
  if (spotlight) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      spotlight.style.left = (e.clientX - rect.left) + 'px';
      spotlight.style.top = (e.clientY - rect.top) + 'px';
    });
  }
});

// Cookie banner
const cookieBanner = document.getElementById('cookieBanner');
const cookieBtn = document.getElementById('cookieAccept');
if (!localStorage.getItem('cookiesAccepted')) {
  setTimeout(() => cookieBanner.classList.add('show'), 2000);
}
cookieBtn.addEventListener('click', () => {
  localStorage.setItem('cookiesAccepted', 'true');
  cookieBanner.classList.remove('show');
});
```

## Proces tworzenia

1. **Pobierz dane** z Supabase:
   - workflow (nazwa, opis)
   - workflow_branding (brand_info, colors, fonts)
   - workflow_products (nazwa produktu, cena)
   - workflow_reports (raport PDF - USP, persony)

2. **Przeanalizuj kontekst**:
   - Kategoria produktu (tech/health/sport/beauty)
   - Grupa docelowa (wiek, plec, styl zycia)
   - Glowne bole klienta (pain points)
   - USP (unikalna przewaga)

3. **Wybierz motyw**:
   - Ciemny (tech, gaming, biohacking)
   - Jasny (health, beauty, wellness)

4. **Napisz copy** dla kazdej sekcji:
   - Hero: headline + subheadline + badges
   - Problem: agitacja z statystykami
   - Solution: 4-5 features
   - FAQ: 5-7 pytan
   - Offer: pakiet z cena

5. **Wygeneruj HTML**:
   - Uzyj wzorcow z istniejacych landingow
   - Dostosuj kolory i fonty z brandingu
   - Dodaj placeholdery na obrazy

6. **Zapisz plik**:
   - Sciezka: `landing-pages/[nazwa-marki-lowercase]/index.html`
   - Pojedynczy plik (inline CSS + JS)

7. **Skonfiguruj URL** w `vercel.json`:
   - Landingi domyslnie dostepne pod `/lp/[slug]`
   - Dla dedykowanego URL dodaj rewrite w `vercel.json`

## Konfiguracja URL (Vercel)

Landing pages są hostowane na `crm.tomekniedzwiecki.pl`.

### Domyślny URL
Wszystkie landingi są automatycznie dostępne pod:
```
https://crm.tomekniedzwiecki.pl/lp/[nazwa-folderu]
```

Np. `/lp/dentaflow`, `/lp/vibestrike`, `/lp/h2vital`

### Dedykowany URL (bez /lp/)
Aby landing był dostępny pod krótszym URL (np. `/h2vital`), dodaj rewrite do `vercel.json`:

```json
{ "source": "/h2vital", "destination": "/landing-pages/h2vital/index.html" },
{ "source": "/h2vital/", "destination": "/landing-pages/h2vital/index.html" },
```

### Deploy
Po zmianach w `vercel.json`:
```bash
git add . && git commit -m "Add landing page route" && git push
```

Vercel automatycznie zdeployuje zmiany.

## Komendy curl (Supabase)

```bash
# Pobierz branding
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"

# Pobierz produkty
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_products?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"
```

## Logo z projektu

Logo znajduje się w tabeli `workflow_branding` z `type='logo'`. URL w polu `file_url`.

### Przetwarzanie logo

**KRYTYCZNE:** Logo z Supabase zawsze ma duże białe marginesy (np. 1024x1024). **ZAWSZE** przytnij je po pobraniu!

#### Szybka metoda (ZALECANA - jedna komenda)

```bash
cd /c/repos_tn/tn-crm && node -e "
const sharp = require('sharp');
sharp('landing-pages/[SLUG]/logo.png')
  .trim()
  .png()
  .toFile('landing-pages/[SLUG]/logo_trimmed.png')
  .then(() => {
    require('fs').renameSync('landing-pages/[SLUG]/logo_trimmed.png', 'landing-pages/[SLUG]/logo.png');
    console.log('Logo przycięte');
  });
"
```

#### Kroki:
1. **Pobrać logo** z Supabase storage (curl)
2. **Przyciąć marginesy** używając sharp.trim()
3. **Sprawdzić** wynik używając Read tool

### Skrypt do przetwarzania (Node.js + sharp)

**Wariant A: Tylko przycięcie marginesów (NAJCZĘŚCIEJ WYSTARCZY)**
```javascript
const sharp = require('sharp');
sharp('logo_original.png').trim().png().toFile('logo.png');
```

**Wariant B: Logo MA białe tło (rzadziej)**
```javascript
const sharp = require('sharp');

async function processLogo() {
  const { data, info } = await sharp('logo_original.png')
    .trim()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const isWhite = r > 250 && g > 250 && b > 250;
    pixels[i * 4] = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
    pixels[i * 4 + 3] = isWhite ? 0 : 255;
  }

  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile('logo.png');
}
processLogo();
```

Uruchomienie:
```bash
node process-logo.js
```

### CSS dla logo

```css
.logo { display: flex; align-items: center; text-decoration: none; }
.logo img { height: 48px; width: auto; object-fit: contain; }
```

### HTML

```html
<a href="#" class="logo">
  <img src="/landing-pages/[slug]/logo.png" alt="[NAZWA MARKI]">
</a>
```

### WAŻNE: Ścieżki do assetów

**Zawsze używaj ścieżek bezwzględnych** do obrazków i innych assetów:

```html
<!-- ŹLE (nie działa z rewrite) -->
<img src="logo.png">

<!-- DOBRZE -->
<img src="/landing-pages/h2vital/logo.png">
```

Dlaczego? Gdy landing jest serwowany pod `/h2vital` (rewrite), przeglądarka szuka `logo.png` pod `/h2vital/logo.png`, ale plik jest fizycznie w `/landing-pages/h2vital/logo.png`.

Wzór ścieżki: `/landing-pages/[nazwa-folderu]/[plik]`

## Conversion Toolkit (CRO)

**ZAWSZE dodawaj Conversion Toolkit** do każdego landing page, aby zwiększyć konwersję.

### Komponenty dostępne w toolkit:

| Komponent | Wpływ na konwersję |
|-----------|-------------------|
| Exit Intent Popup | +15-20% |
| Urgency Timer (evergreen 24h) | +9-15% |
| Stock Counter | +10-12% |
| Social Proof Toast | +5-8% |
| Live Visitors | +3-5% |
| Floating CTA | +5-10% |
| Progress Bar | engagement |

### Integracja

Dodaj przed `</body>`:

```html
<script src="/landing-pages/shared/conversion-toolkit.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    ConversionToolkit.init({
      brand: {
        primary: '[KOLOR-ACCENT]',
        secondary: '[KOLOR-PRIMARY]',
        name: '[NAZWA-MARKI]',
        ctaUrl: '#offer'
      },
      exitPopup: {
        enabled: true,
        headline: 'Czekaj! Nie przegap tej okazji',
        subheadline: '[OFERTA SPECJALNA]',
        ctaText: 'Odbierz ofertę',
        dismissText: 'Nie, dziękuję'
      },
      urgency: {
        enabled: true,
        countdown: { enabled: true, position: 'both', text: 'Oferta wygasa za:' },
        stock: { enabled: true, initial: 20, min: 3 }
      },
      socialProof: {
        enabled: true,
        liveVisitors: { enabled: true },
        recentPurchases: { enabled: true }
      },
      scrollCTA: { enabled: true, text: 'Zamów teraz', pulse: true },
      progressBar: { enabled: true },
      extraCTAs: { enabled: true }
    });
  });
</script>
```

Pełna dokumentacja: `/landing-pages/shared/README.md`

**WAŻNE:** Toolkit automatycznie dodaje klasę `ct-has-urgency-bar` do body i przesuwa header o 52px (44px na mobile). Header landing page MUSI mieć `position: fixed` i `top: 0` aby to działało poprawnie. Urgency bar ma explicite ustawioną wysokość (nie padding) z flexbox centrowaniem zawartości.

## Mobile-First Best Practices

### Conversion Toolkit - co robi automatycznie

Toolkit (`conversion-toolkit.js`) **automatycznie obsługuje**:
- Urgency bar: 52px desktop, 44px mobile (explicite height, nie padding!)
- Header offset: `top: 52px` desktop, `top: 44px` mobile
- Body padding-top gdy urgency bar aktywny
- Mobile bottom bar zamiast floating CTA na ≤768px
- Toast pozycjonowany nad mobile bar
- Trust badges kompaktowy layout na mobile (pills)
- Body padding-bottom: 70px na mobile

**Nie musisz pisać tych stylów** - toolkit je wstrzykuje. Twój landing musi tylko:

### Co landing page MUSI mieć

#### 1. Header z position: fixed
```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  /* reszta stylów... */
}
```

#### 2. Hero z padding dla headera
```css
.hero {
  padding-top: [wysokość headera + margines];
}

/* Toolkit AUTOMATYCZNIE doda te style: */
/* body.ct-has-urgency-bar .header { top: 52px; } */
/* body.ct-has-urgency-bar { padding-top: 52px; } */
```

Jeśli chcesz dodatkowy padding w hero dla urgency bar, dodaj w landing page:
```css
body.ct-has-urgency-bar .hero {
  padding-top: [bazowy padding + ~50px];
}
```

#### 3. NIE dodawaj własnego sticky CTA
Toolkit ma wbudowany `mobileBar` - nie twórz duplikatu `.sticky-cta`!

### Breakpoints Reference

| Breakpoint | Urgency Bar | Header Offset | Komponenty |
|------------|-------------|---------------|------------|
| >768px (desktop) | 52px | top: 52px | Floating CTA, Sticky Bar |
| ≤768px (mobile) | 44px | top: 44px | Mobile Bottom Bar |
| ≤480px (small) | 44px | top: 44px | Mniejsze fonty/spacing |

### Mobile Checklist

- [ ] Header ma `position: fixed; top: 0;`
- [ ] NIE ma duplikatu sticky CTA (toolkit ma mobileBar)
- [ ] Hero ma odpowiedni padding dla headera
- [ ] Bento cards w jednej kolumnie na mobile
- [ ] FAQ accordion działa na touch
- [ ] Hamburger menu działa i zamyka się po kliknięciu linku

### Częste błędy do unikania

1. **Duplikat CTA** - nie dodawaj `.sticky-cta` gdy używasz Conversion Toolkit
2. **Header bez position: fixed** - toolkit wymaga fixed header z top: 0
3. **Nadpisywanie stylów toolkit** - nie pisz własnych stylów dla `.ct-*` klas
4. **Brak padding w hero** - hero musi mieć padding na header (toolkit doda offset dla urgency)

## Optymalizacja PageSpeed Insights (WYMAGANE!)

> **CEL**: Każdy landing page MUSI osiągać **90+ punktów** w PageSpeed Insights (mobile). To nie jest "nice to have" — wolne strony tracą konwersje.

### Kluczowe metryki Core Web Vitals

| Metryka | Co mierzy | Target | Jak osiągnąć |
|---------|-----------|--------|--------------|
| **LCP** (Largest Contentful Paint) | Czas do wyrenderowania największego elementu | < 2.5s | Preload hero image, optymalizacja fontów |
| **FID** (First Input Delay) | Opóźnienie pierwszej interakcji | < 100ms | Defer JS, unikaj heavy computations |
| **CLS** (Cumulative Layout Shift) | Przesunięcia layoutu | < 0.1 | Zawsze podawaj width/height obrazów |

---

### 1. Fonty — KRYTYCZNE dla LCP

**ZAWSZE stosuj te praktyki:**

```html
<!-- 1. Preconnect do Google Fonts (ZAWSZE na początku <head>) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 2. Font z display=swap i subset=latin-ext (dla polskich znaków) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap&subset=latin-ext" rel="stylesheet">
```

**Zasady fontów:**
- **Max 2-3 fonty** — każdy dodatkowy font to +100-200ms
- **Max 3-4 warianty grubości** per font (np. 400;500;600;700, NIE 300;400;500;600;700;800;900)
- **ZAWSZE `display=swap`** — tekst widoczny od razu, font ładuje się w tle
- **ZAWSZE `subset=latin-ext`** — dla polskich znaków (ą, ę, ć, ś, ź, ż, ó, ł, ń)

**Fonty z polskimi znakami (bezpieczne):**
- Inter, Poppins, Roboto, Open Sans, Lato, Nunito, Montserrat
- Fredoka (NIE Fredoka One!), Caveat (zamiast Patrick Hand)

**Fonty BEZ polskich znaków (UNIKAJ):**
- Fredoka One, Patrick Hand, Pacifico (starsze wersje)

---

### 2. Obrazy — KRYTYCZNE dla LCP i CLS

#### Placeholder images (przed otrzymaniem zdjęć)
```html
<!-- ZAWSZE podawaj width i height (zapobiega CLS) -->
<img src="https://placehold.co/1200x900/f8f9fa/6b7280?text=Hero+Image"
     alt="[Opis produktu]"
     width="1200"
     height="900"
     loading="lazy"
     class="hero-image">
```

#### Docelowe zdjęcia (po otrzymaniu od klienta)
```html
<!-- Hero image — BEZ lazy loading (LCP element!) -->
<img src="hero.webp"
     alt="[Opis]"
     width="1200"
     height="900"
     fetchpriority="high"
     decoding="async">

<!-- Pozostałe obrazy — Z lazy loading -->
<img src="product.webp"
     alt="[Opis]"
     width="800"
     height="600"
     loading="lazy"
     decoding="async">
```

**Zasady obrazów:**
| Zasada | Dlaczego |
|--------|----------|
| **ZAWSZE width + height** | Zapobiega CLS (layout shift) |
| **Hero image: `fetchpriority="high"`** | Przyspiesza LCP |
| **Hero image: BEZ `loading="lazy"`** | Lazy loading opóźnia LCP |
| **Pozostałe: `loading="lazy"`** | Oszczędza bandwidth |
| **Format WebP** | 25-35% mniejszy niż JPEG |
| **Max 200KB per image** | Większe = wolniejsze |

#### Srcset dla responsywności (opcjonalne, ale zalecane)
```html
<img src="hero-1200.webp"
     srcset="hero-600.webp 600w, hero-900.webp 900w, hero-1200.webp 1200w"
     sizes="(max-width: 768px) 100vw, 1200px"
     alt="[Opis]"
     width="1200"
     height="900"
     fetchpriority="high">
```

---

### 3. CSS — Inline Critical, Defer Rest

**Struktura <head> dla optymalnej wydajności:**

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>...</title>

  <!-- 1. Preconnect (przed wszystkim innym) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- 2. Preload critical assets (hero image) -->
  <link rel="preload" href="hero.webp" as="image" fetchpriority="high">

  <!-- 3. Fonty -->
  <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">

  <!-- 4. Critical CSS inline (above-the-fold styles) -->
  <style>
    /* TYLKO style potrzebne do pierwszego renderowania:
       - Reset/normalize
       - Typography base
       - Header
       - Hero section
       - Animacje fade-in (ale bez @keyframes jeśli niepotrzebne od razu)
    */
  </style>

  <!-- 5. Non-critical CSS (defer) — jeśli plik jest bardzo duży -->
  <!-- <link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'"> -->
</head>
```

**W praktyce dla landing pages:**
- Trzymaj WSZYSTKO w jednym `<style>` inline — prostsze i szybsze dla SPA
- Jeśli CSS > 50KB, rozważ split na critical/non-critical

---

### 4. JavaScript — Defer i minimalizuj

```html
<!-- Skrypty na KOŃCU body, z defer -->
<script defer src="/landing-pages/shared/conversion-toolkit.js"></script>

<!-- Inline JS — tylko niezbędne -->
<script>
  // Fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Hamburger menu
  // ...
</script>
```

**Zasady JS:**
- **NIGDY nie blokuj renderowania** — zawsze `defer` lub na końcu body
- **Unikaj document.write()** — blokuje parser
- **Minimalizuj obliczenia w load** — defer animacje do idle time

---

### 5. Struktura HTML dla szybkiego FCP

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <!-- Meta tags PIERWSZE -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Preconnect/preload DRUGIE -->
  <link rel="preconnect" href="...">
  <link rel="preload" as="image" href="hero.webp">

  <!-- Fonty TRZECIE -->
  <link href="fonts.googleapis.com/..." rel="stylesheet">

  <!-- Critical CSS CZWARTE (inline) -->
  <style>...</style>

  <!-- Title i meta PIĄTE -->
  <title>...</title>
  <meta name="description" content="...">
</head>
<body>
  <!-- Header PIERWSZY (fixed, nad wszystkim) -->
  <header class="header">...</header>

  <!-- Hero DRUGI (LCP element) -->
  <section class="hero">
    <img src="hero.webp" fetchpriority="high" ...>
  </section>

  <!-- Reszta contentu -->
  ...

  <!-- Scripts NA KOŃCU -->
  <script defer src="..."></script>
</body>
</html>
```

---

### 6. Animacje bez wpływu na wydajność

**DOBRE animacje (GPU-accelerated):**
```css
/* Używaj TYLKO transform i opacity */
.fade-in {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* will-change dla heavy animacji */
.hero-glow {
  will-change: transform, opacity;
}
```

**ZŁE animacje (powodują reflow/repaint):**
```css
/* UNIKAJ animowania: */
/* - width, height, margin, padding */
/* - top, left, right, bottom */
/* - font-size, line-height */
/* - box-shadow (tylko subtelne) */
```

---

### 7. Lazy loading sekcji (dla długich stron)

```css
/* Obrazy poniżej fold — native lazy loading */
<img loading="lazy" ...>

/* Dla iframe (np. video) */
<iframe loading="lazy" ...>
```

---

### 8. Checklist PageSpeed (OBOWIĄZKOWA!)

**Przed oddaniem strony sprawdź:**

- [ ] **Preconnect** do fonts.googleapis.com i fonts.gstatic.com
- [ ] **Fonty**: max 3, max 4 wagi, `display=swap`, `subset=latin-ext`
- [ ] **Hero image**: `fetchpriority="high"`, BEZ `loading="lazy"`
- [ ] **Wszystkie obrazy**: mają `width` i `height` (zapobiega CLS)
- [ ] **Obrazy below fold**: `loading="lazy"`
- [ ] **CSS**: inline w `<style>` (lub critical inline + defer rest)
- [ ] **JS**: `defer` lub na końcu body
- [ ] **Animacje**: tylko `transform` i `opacity`
- [ ] **Brak render-blocking resources** (sprawdź w DevTools > Lighthouse)

**Test w PageSpeed Insights:**
```
https://pagespeed.web.dev/analysis?url=https://tn-crm.vercel.app/[slug]
```

**Target scores:**
- Mobile: **90+** (minimum 85)
- Desktop: **95+** (minimum 90)

---

### 9. Przykład optymalnego <head>

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nazwa Produktu - Tagline | Marka</title>
  <meta name="description" content="Opis produktu w 150-160 znaków...">

  <!-- Preconnect (KRYTYCZNE!) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Preload hero image (LCP optimization) -->
  <link rel="preload" as="image" href="https://storage.url/hero.webp" fetchpriority="high">

  <!-- Fonts (max 2-3, z display=swap) -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap&subset=latin-ext" rel="stylesheet">

  <!-- Open Graph -->
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pl_PL">

  <!-- Critical CSS (inline) -->
  <style>
    /* ... wszystkie style ... */
  </style>
</head>
```

---

## Checklist przed oddaniem

- [ ] Wszystkie sekcje obecne (header -> footer)
- [ ] Kolory i fonty z brandingu
- [ ] Logo z projektu (przycięte, przezroczyste tło)
- [ ] **Ścieżki bezwzględne** do wszystkich assetów (`/landing-pages/[slug]/...`)
- [ ] Responsive (768px, 480px, 380px)
- [ ] Fade-in animacje działają
- [ ] Hamburger menu działa
- [ ] Sticky CTA na mobile
- [ ] Cookie banner
- [ ] **PLACEHOLDERY NA WSZYSTKIE OBRAZY:**
  - [ ] Hero (1x 1200×900)
  - [ ] Problem (1x 800×600)
  - [ ] Bento cards (4x 640×360)
  - [ ] How It Works (3x 600×450)
  - [ ] Offer (1x 800×450)
- [ ] CTA buttony linkują do #offer
- [ ] Meta tags (title, description, OG)
- [ ] **Conversion Toolkit zintegrowany** (exit popup, urgency, social proof)
- [ ] **PageSpeed Optimization:**
  - [ ] Preconnect do fonts.googleapis.com/gstatic.com
  - [ ] Fonty: max 3, display=swap, subset=latin-ext
  - [ ] Hero image: `fetchpriority="high"`, BEZ `loading="lazy"`
  - [ ] Wszystkie `<img>` mają `width` i `height`
  - [ ] Obrazy poniżej fold: `loading="lazy"`
  - [ ] Animacje: tylko `transform` i `opacity`
- [ ] Route w `vercel.json` (jeśli dedykowany URL)
- [ ] Git commit & push

## WAŻNE: Deploy na koniec

**Zawsze po wygenerowaniu landing page wykonaj deploy:**
```bash
git add . && git commit -m "Add [nazwa-marki] landing page" && git push
```

Vercel automatycznie zdeployuje zmiany po pushu do `main`.

**ZAWSZE podaj użytkownikowi link do live wersji:**
```
https://tn-crm.vercel.app/[slug]
```

Przykład: `https://tn-crm.vercel.app/nomabar`

---

## ETAP 2: Weryfikacja (OBOWIĄZKOWY)

**Po zapisaniu pierwszej wersji landing page MUSISZ wykonać procedurę weryfikacji.**

Przeczytaj i wykonaj: **`CLAUDE_LANDING_REVIEW.md`**

Procedura weryfikacji sprawdza:
1. **Kompletność sekcji** — czy są wszystkie 15 sekcji z checklisty
2. **Miejsca na zdjęcia** — minimum 15-20 placeholderów
3. **Jakość copy** — czy treści trafiają w grupę docelową
4. **Technikalia** — fonty, meta tagi, PageSpeed

**NIE KOŃCZ PRACY NAD LANDINGIEM BEZ PRZEJŚCIA PRZEZ ETAP 2.**

Deploy wykonuj dopiero po pozytywnej weryfikacji.
