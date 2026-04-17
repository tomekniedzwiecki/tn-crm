# Landing Page Templates

## Jak używać

Gdy ETAP 1 (generowanie HTML) startuje, **NIE piszesz od zera** — wybierz istniejący landing jako bazę zgodnie z kierunkiem z manifesta.

## Mapping kierunek → referencyjny landing

| Kierunek z manifesta | Baseline do skopiowania | Charakterystyka |
|---|---|---|
| **Panoramic Calm** (architectural, tech premium) | `landing-pages/vitrix/` | Plus Jakarta + Instrument Serif + Space Mono, paper/navy, Nº numbering, 4 JS effects |
| **Editorial/Luxury** (premium AGD, lifestyle) | `landing-pages/paromia/` | Fraunces + Italiana + Inter, paper/ink/gold, Nº magazine, editorial numerals |
| **Organic/Natural** (wellness, health) | `landing-pages/h2vital/` | Fluid shapes, soft gradients, greens/beiges |
| **Playful/Toy** (pet, kids, gadgets) | `landing-pages/pupilnik/` | Rounded, bouncy, vivid colors, emoji |
| **Retro-Futuristic** (gaming, tech edgy) | `landing-pages/vibestrike/` | Neon on black, glitch, cyber |

**Brak pasującego** → użyj Vitrix jako najbliższy universal baseline (Panoramic Calm ma najszerszy zakres).

## Workflow kopiowania

```bash
SLUG="nowa-marka"
BASE="vitrix"  # wybrany z tabeli wyżej

# 1. Skopiuj baseline
cp -r landing-pages/$BASE landing-pages/$SLUG
rm landing-pages/$SLUG/_brief.md  # brief napiszemy per nowy projekt

# 2. Global replace nazwy marki
cd landing-pages/$SLUG
sed -i "s/Vitrix/NewBrand/g; s/vitrix/newbrand/g" index.html

# 3. Pobierz branding + logo per CLAUDE_LANDING_PROCEDURE.md ETAP 1
# 4. Napisz copy per brief (manifesto pojedzie w ETAP 2.5)
```

## Co ZACHOWAĆ bez zmian (safety + best practice)

Te fragmenty są OBOWIĄZKOWE w każdym landingu — kopiując baseline zachowaj je 1:1:

- `<script>document.documentElement.classList.add('js')</script>` w `<head>` (html.js gate)
- CSS `html.js .fade-in{opacity:0...}` (fade-in gated)
- JS IntersectionObserver + **safety timeout filtrujący `getBoundingClientRect().top < window.innerHeight`**
- Header `background: #FFFFFF` (nie rgba + backdrop-filter)
- Font URL z `&subset=latin-ext`
- OG image = pełny URL Supabase
- JS effects: `.js-split`, `.js-counter`, `.magnetic`, tile tilt, scroll parallax numerals
- Placeholder briefs 4-polowe (jeśli jeszcze brak zdjęć)

## Co ZMIENIĆ

- Nazwę marki wszędzie
- Logo URL (pobierz z workflow_branding type=logo, is_main:true)
- Paleta kolorów (zgodnie z workflow_branding type=color + manifesto)
- Fonty (jeśli kierunek wymaga innych niż baseline)
- Copy wszystkich sekcji (headline, lede, FAQ, cytaty person)
- Obrazy (CLAUDE_AI_IMAGES_PROCEDURE.md)
- OG image + meta title/description per brand

## Sprawdzenie po kopii

```bash
bash scripts/verify-landing.sh [slug]
```

Cel: **18/18 checks PASS** przed przejściem do ETAP 2.
