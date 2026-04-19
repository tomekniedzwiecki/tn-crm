# Landing Page Templates

## Jak używać

Gdy ETAP 1 (generowanie HTML) startuje, **sprawdź czy istnieje baseline spójny z kierunkiem z manifesta**. Jeśli tak — skopiuj go i adaptuj. Jeśli NIE — **nie kopiuj baseline'a z innego kierunku** (patrz niżej: „Baseline mismatch"). Zamiast tego użyj tego samego **architektonicznego szkieletu 14 sekcji** (procedury), ale zaprojektuj CSS/typografię/signature od zera pod manifesto.

## Mapping kierunek → referencyjny landing

| Kierunek z manifesta | Baseline | Typografia | Charakterystyka |
|---|---|---|---|
| **Panoramic Calm** (architectural, tech premium, salon 18. piętro) | `landing-pages/vitrix/` | Plus Jakarta + Instrument Serif italic + Space Mono | Paper/navy/teal, `Nº 01–10` magazine numbering, oversized italic numerals, theatrical dark spec-sheet |
| **Editorial/Luxury** (premium AGD, lifestyle, hygge) | `landing-pages/paromia/` | Fraunces + Italiana + Inter | Paper/ink/gold, `Nº` magazine, editorial numerals, italic pull quotes |
| **Organic/Natural** (wellness, health, spa) | `landing-pages/h2vital/` | Rounded sans + soft serif | Fluid shapes, soft gradients, greens/beiges |
| **Playful/Toy** (pet, kids, gadgets) | `landing-pages/pupilnik/` | Rounded bouncy + display | Vivid colors, emoji, bouncy animations |
| **Retro-Futuristic** (gaming, tech edgy) | `landing-pages/vibestrike/` | Neon mono + glitch | Neon on black, cyber, glitch effects |
| **Rugged Heritage** (workwear, outdoor premium, tools & trades) | `landing-pages/kafina/` | Archivo 800 + Inter + Space Mono 700 | **Dark hero** (coal/pine) jako pattern break, `Cat. Nº 01–10` catalog numbering, stamp badges (`LOT 2026 · ISSUE 001`), mosiężne akcenty, brak italic editorial serif, square/rectangular stamps zamiast kółek |

**Brak pasującego** → NIE używaj „najbliższego" baseline'a jeśli kierunek jest wyraźnie inny. Szkielet 14 sekcji z procedury + własny design language.

---

## ⛔ Baseline mismatch — kiedy NIE kopiować

**Problem:** kopiowanie vitrix (Panoramic Calm) jako bazy dla marki Rugged Heritage produkuje „vitrix przebrany" — klient widzi kolejny AI-editorial landing, nie wyjątkową markę.

**Czerwone flagi manifesta (kierunek NIE pasuje do baseline Panoramic Calm / Editorial):**
- Moodboard referuje Filson / Red Wing / Yeti / Cereal „Tools" / workwear / warsztat
- Paleta brass + coal/pine + ivory (ciemna + metal)
- Fotografia produktu „parking 4:30" / „kabina TIRa" / „kamper w lesie", nie „salon z panoramicznym oknem"
- Typografia manifesta wyklucza italic editorial serif (Instrument Serif, Italiana, Fraunces)
- Persona: kierowca, rzemieślnik, outdoor, van-lifer — nie 18. piętro prawniczki

**Gdy ≥3 flagi trafiają:** zamiast kopiować vitrix/paromia, rób **szkielet od zera** pod Rugged Heritage (użyj `landing-pages/kafina/` jako baseline) lub innego matching-direction baseline.

**Praktycznie:** ten sam układ 14 sekcji (header, hero, trust, wyzwanie, atelier, rytuał, spec, epoki, persony, głosy, FAQ, oferta, finał, footer) — ale:
- inne CSS tokens (palette, fonty)
- inne signature elements (stamp badges vs editorial Nº, oversized italic numerał vs static industrial numerał)
- inne proporcje (padding, radius, shadow — np. radius 2px zamiast 4px dla „ostrzejszego" feelu workwear)
- inne JS effects (tile tilt TAK/NIE w zależności od tonu — workwear NIE ma tilta, Panoramic Calm TAK)

---

## Workflow kopiowania (gdy baseline PASUJE)

```bash
SLUG="nowa-marka"
BASE="kafina"  # wybrany z tabeli wyżej, zgodny z manifesta

# 1. Skopiuj baseline
cp -r landing-pages/$BASE landing-pages/$SLUG
rm landing-pages/$SLUG/_brief.md  # brief napiszemy per nowy projekt
rm landing-pages/$SLUG/logo*.png  # logo przyjdzie z nowego workflow

# 2. Global replace nazwy marki
cd landing-pages/$SLUG
sed -i "s/Kafina/NewBrand/g; s/kafina/newbrand/g" index.html

# 3. Pobierz branding + logo per CLAUDE_LANDING_PROCEDURE.md ETAP 1
# 4. Napisz copy per brief (manifesto pojedzie w ETAP 2.5)
```

## Workflow „szkielet od zera" (gdy baseline NIE pasuje)

```bash
SLUG="nowa-marka"

mkdir -p landing-pages/$SLUG
# 1. Napisz _brief.md z manifestem (CLAUDE_LANDING_DIRECTION.md)
# 2. Pobierz logo, wgraj do attachments/landing/$SLUG/logo.png
# 3. Zacznij index.html od skeleton'u sekcji (z procedury) i zaprojektuj każdą sekcję pod manifesto
# 4. Zachowaj OBOWIĄZKOWE fragmenty safety (poniżej)
```

Po zakończeniu — jeśli ten kierunek nie miał dotychczas baseline'a, **zaktualizuj ten plik** dodając nowy slug do tabeli (nowy baseline dla przyszłych projektów tego kierunku).

## Co ZACHOWAĆ bez zmian (safety + best practice)

Te fragmenty są OBOWIĄZKOWE w każdym landingu — niezależnie od kierunku:

- `<script>document.documentElement.classList.add('js')</script>` w `<head>` (html.js gate)
- CSS `html.js .fade-in{opacity:0...}` (fade-in gated — bez tego opacity:0 ukryje 80% strony przy JS error / crawler)
- JS IntersectionObserver + **safety timeout filtrujący `getBoundingClientRect().top < window.innerHeight`**
- Header `background: #FFFFFF` lub solid color (NIE `rgba` + `backdrop-filter` — nieczytelne na mobile)
- Font URL z `&subset=latin-ext`
- OG image = pełny URL Supabase
- Placeholder briefs 4-polowe (jeśli jeszcze brak zdjęć)
- Uppercase elementy `line-height: 1.4` (PL diakrytyki Ł/Ó/Ś)
- Brak zakazanych fraz (24h, polski magazyn, raty, za pobraniem, Klarna, PayPo, Twisto)

## Co ZMIENIAĆ per brand

- Nazwę marki wszędzie (w tym `localStorage` key, `alt`, meta title/description)
- Logo URL (pobierz z `workflow_branding` type=logo, `is_main: true`)
- Paleta kolorów (zgodnie z `workflow_branding` type=color + manifesto)
- Fonty (zgodnie z `workflow_branding` type=font + manifesto)
- Copy wszystkich sekcji (headline, lede, FAQ, cytaty person)
- Obrazy (`CLAUDE_AI_IMAGES_PROCEDURE.md`)
- OG image + meta title/description per brand
- Signature elements per manifesto (stamp vs italic numeral vs round act)

## Sprawdzenie po kopii

```bash
bash scripts/verify-landing.sh [slug]
```

Cel: **18/18 checks PASS** przed przejściem do ETAP 2.
