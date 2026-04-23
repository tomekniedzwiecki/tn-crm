#!/bin/bash
# verify-style-lock.sh — sprawdza zgodność landingu ze Style Lock z _brief.md
# Usage: bash scripts/verify-style-lock.sh [slug]
# Exit 0 = zgodność OK; Exit 1 = violation → blokuje deploy
#
# Flow:
# 1. Odczytaj _brief.md sekcja 10 → wyłuskaj Style ID
# 2. Załaduj patterns per styl (hardcoded case statement)
# 3. Grep wymaganych patternów w index.html — każdy MUSI być
# 4. Grep zakazanych patternów w index.html — każdy NIE MOŻE być
# 5. Raport PASS/FAIL per check

set -e
SLUG="$1"
[ -z "$SLUG" ] && echo "Usage: bash scripts/verify-style-lock.sh [slug]" && exit 1

BRIEF="landing-pages/$SLUG/_brief.md"
HTML="landing-pages/$SLUG/index.html"

[ ! -f "$BRIEF" ] && echo "❌ Brak $BRIEF" && exit 1
[ ! -f "$HTML" ] && echo "❌ Brak $HTML" && exit 1

# Wyłuskaj Style ID z sekcji 10
STYLE_ID=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---/' "$BRIEF" | grep -oE 'Style ID:[*]+[[:space:]]*`[a-z-]+`' | head -1 | sed 's/^[^`]*`//; s/`.*//')

if [ -z "$STYLE_ID" ]; then
  echo "❌ Brak Style ID w _brief.md sekcja 10.1"
  echo "   Wymagany format: **Style ID:** \`[style-id]\`"
  exit 1
fi

STYLE_FILE="docs/landing/style-atlas/${STYLE_ID}.md"
if [ ! -f "$STYLE_FILE" ]; then
  echo "❌ Style '$STYLE_ID' nie istnieje w $STYLE_FILE"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  STYLE LOCK VERIFY: $SLUG"
echo "  Style: $STYLE_ID"
echo "═══════════════════════════════════════════════════════════"
echo ""

PASS=0
FAIL=0

# Helper: grep MUST be present
check_required() {
  local pattern="$1"
  local desc="$2"
  if grep -qE "$pattern" "$HTML"; then
    echo "  ✅ MUSI: $desc"
    PASS=$((PASS + 1))
  else
    echo "  ❌ MUSI brak: $desc (pattern: $pattern)"
    FAIL=$((FAIL + 1))
  fi
}

# Helper: grep MUST NOT be present
check_forbidden() {
  local pattern="$1"
  local desc="$2"
  if grep -qE "$pattern" "$HTML"; then
    echo "  ❌ ZAKAZ naruszony: $desc (pattern: $pattern)"
    FAIL=$((FAIL + 1))
  else
    echo "  ✅ ZAKAZ OK: $desc nieobecny"
    PASS=$((PASS + 1))
  fi
}

# ═══════ Style-specific rules ═══════
case "$STYLE_ID" in
  apothecary-label)
    check_required "IBM Plex Sans" "Display font IBM Plex Sans"
    check_required "IBM Plex Mono" "Mono font IBM Plex Mono"
    check_required "#FAFAF7|#fafaf7" "Paper White #FAFAF7"
    check_required "class=\"[^\"]*spec-label" "Primitive 1: spec-label section"
    check_forbidden "Fraunces" "Fraunces (editorial font zakaz)"
    check_forbidden "Cormorant" "Cormorant (editorial zakaz)"
    check_forbidden "Archivo Black" "Archivo Black (poster zakaz)"
    check_forbidden "Caveat" "Caveat script (zakaz)"
    check_forbidden "class=\"[^\"]*hero-numeral" "Oversized italic numeral hero (Editorial zakaz)"
    check_forbidden "class=\"[^\"]*js-split" "Split headline char-by-char (za editorial)"
    check_forbidden "class=\"[^\"]*js-parallax" "Parallax numeral (zakaz)"
    check_forbidden "class=\"[^\"]*magnetic" "Magnetic CTA (za DTC/playful)"
    check_forbidden "#F6F3ED|#f6f3ed" "Linen Cream #F6F3ED (warm, używaj paper white)"
    check_forbidden "#C9A961|#c9a961" "Gold #C9A961 (luxury zakaz)"
    check_forbidden "Nº [0-9]" "Nº numeracja eyebrow (Editorial zakaz)"
    ;;

  poster-utility)
    check_required "Archivo Black" "Display font Archivo Black"
    check_required "class=\"[^\"]*poster-claim|class=\"[^\"]*hero-poster" "Primitive poster-claim lub hero-poster"
    check_required "font-size:\s*clamp\([0-9]+px,\s*[0-9]+vw" "Oversized clamp heading 80px+"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "IBM Plex Sans" "IBM Plex Sans zakaz"
    check_forbidden "Cormorant" "Cormorant zakaz"
    check_forbidden "Caveat" "Caveat zakaz"
    check_forbidden "Nº [0-9]" "Nº eyebrow zakaz"
    check_forbidden "#F6F3ED|#f6f3ed" "Linen Cream zakaz"
    ;;

  clinical-kitchen)
    check_required "IBM Plex Sans" "Display IBM Plex Sans"
    check_required "IBM Plex Mono" "Mono IBM Plex Mono"
    check_required "class=\"[^\"]*kpi" "Primitive KPI grid/dashboard"
    check_required "js-counter" "Min js-counter dla KPI"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "Archivo Black" "Archivo Black zakaz"
    check_forbidden "Caveat" "Caveat zakaz"
    check_forbidden "#F6F3ED|#f6f3ed" "Linen Cream zakaz"
    check_forbidden "#C9A961|#c9a961" "Gold zakaz"
    check_forbidden "#E09A3C|#e09a3c" "Amber Glow zakaz"
    check_forbidden "class=\"[^\"]*hero-numeral" "Oversized italic numeral (zakaz)"
    check_forbidden "class=\"[^\"]*js-split" "Split char zakaz"
    check_forbidden "class=\"[^\"]*js-parallax" "Parallax zakaz"
    ;;

  japandi-serenity)
    check_required "Noto Serif|Tenor Sans" "Display Noto Serif albo Tenor Sans"
    check_required "#F4F1EA|#f4f1ea" "Paper Pearl #F4F1EA"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "Archivo Black" "Archivo Black zakaz"
    check_forbidden "IBM Plex Mono" "IBM Plex Mono zakaz"
    check_forbidden "Caveat" "Caveat zakaz"
    check_forbidden "class=\"[^\"]*js-counter" "Counter wyskakujący zakaz (psuje ciszę)"
    check_forbidden "class=\"[^\"]*js-split" "Split zakaz"
    check_forbidden "class=\"[^\"]*js-parallax" "Parallax zakaz"
    check_forbidden "class=\"[^\"]*magnetic" "Magnetic zakaz"
    check_forbidden "class=\"[^\"]*js-tilt" "Tilt zakaz"
    ;;

  swiss-grid)
    check_required "Helvetica|Inter" "Display Helvetica lub Inter"
    check_required "grid-template-columns:\s*repeat\(12" "12-col grid Swiss"
    check_required "#FFFFFF|#ffffff|#FFF" "Pure white background"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "Playfair" "Playfair zakaz"
    check_forbidden "Archivo Black" "Archivo Black zakaz"
    check_forbidden "Caveat" "Caveat zakaz"
    check_forbidden "Cormorant" "Cormorant zakaz"
    check_forbidden "border-radius:\s*[2-9][0-9]+px" "Duże border-radius (>=16px) zakaz"
    check_forbidden "class=\"[^\"]*js-split" "Split zakaz"
    check_forbidden "class=\"[^\"]*magnetic" "Magnetic zakaz"
    ;;

  brutalist-diy)
    check_required "Times New Roman|Georgia" "Display Times New Roman w h1/h2"
    check_required "transform:\s*rotate" "Min 1 rotated element"
    check_required "text-decoration:\s*underline" "Underline links"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "Cormorant" "Cormorant zakaz"
    check_forbidden "IBM Plex" "IBM Plex zakaz"
    check_forbidden "Archivo Black" "Archivo Black zakaz"
    check_forbidden "border-radius:\s*(1[6-9]|[2-9][0-9])px" "Duże border-radius zakaz"
    ;;

  dark-academia)
    check_required "Libre Caslon" "Libre Caslon display"
    check_required "#E8E0CF|#e8e0cf" "Parchment #E8E0CF"
    check_required "#6B1F1F|#6b1f1f" "Burgundy #6B1F1F"
    check_required "text-align:\s*center" "Centered hero (Dark Academia)"
    check_forbidden "Archivo Black" "Archivo Black zakaz"
    check_forbidden "IBM Plex" "IBM Plex zakaz"
    check_forbidden "Fraunces" "Fraunces (editorial different vibe)"
    check_forbidden "Caveat" "Caveat zakaz"
    check_forbidden "class=\"[^\"]*js-split" "Split zakaz"
    check_forbidden "class=\"[^\"]*js-counter" "Counter zakaz"
    check_forbidden "class=\"[^\"]*magnetic" "Magnetic zakaz"
    ;;

  cottagecore-botanical)
    check_required "EB Garamond" "EB Garamond display"
    check_required "class=\"[^\"]*botanical" "Primitive botanical SVG ornament"
    check_required "#F5EFDF|#f5efdf" "Butter Cream #F5EFDF"
    check_required "#8AA586|#8aa586" "Sage #8AA586"
    check_forbidden "Archivo Black" "Archivo Black zakaz"
    check_forbidden "IBM Plex" "IBM Plex zakaz"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "Libre Caslon" "Libre Caslon (Dark Academia vibe)"
    check_forbidden "class=\"[^\"]*js-parallax" "Parallax zakaz"
    check_forbidden "class=\"[^\"]*js-counter" "Counter zakaz"
    ;;

  outdoorsy-expedition)
    check_required "Work Sans" "Work Sans display"
    check_required "Space Mono" "Space Mono coordinates"
    check_required "#E5D7B8|#e5d7b8" "Canvas Khaki"
    check_required "#D35A1D|#d35a1d" "Signal Orange"
    check_required "class=\"[^\"]*coord-label|class=\"[^\"]*field-stamp" "Primitive coord-label lub field-stamp"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "IBM Plex" "IBM Plex zakaz"
    check_forbidden "Caveat" "Caveat zakaz"
    check_forbidden "Libre Caslon" "Libre Caslon zakaz"
    check_forbidden "EB Garamond" "EB Garamond zakaz"
    check_forbidden "#F6F3ED|#f6f3ed" "Linen Cream zakaz"
    check_forbidden "#6B1F1F|#6b1f1f" "Burgundy zakaz"
    check_forbidden "class=\"[^\"]*magnetic" "Magnetic zakaz"
    ;;

  # Retrospektywy — mniej restrykcyjne (istniejące baseline'y)
  editorial-print)
    check_required "Fraunces" "Fraunces display"
    check_required "Nº" "Nº eyebrow numeracja"
    ;;

  panoramic-calm)
    check_required "Plus Jakarta" "Plus Jakarta Sans"
    check_required "Instrument Serif" "Instrument Serif accent"
    ;;

  organic-natural)
    check_required "Nunito|DM Sans" "Nunito lub DM Sans"
    check_required "border-radius:\s*(1[6-9]|2[0-9])px" "Rounded corners 16-24px+"
    ;;

  playful-toy)
    check_required "Nunito" "Nunito display"
    check_forbidden "Fredoka One" "Fredoka One (brak PL znaków)"
    ;;

  retro-futuristic)
    check_required "Space Grotesk|Syne" "Space Grotesk lub Syne"
    check_required "#0A0A0F|#0D1117|#0a0a0f" "Dark background"
    ;;

  rugged-heritage)
    check_required "Archivo" "Archivo (nie Black — 700/800)"
    check_required "IM Fell English" "IM Fell English for stamps"
    ;;

  *)
    echo "⚠️  Nieznany style ID: $STYLE_ID"
    echo "   Dodaj case statement w verify-style-lock.sh"
    exit 1
    ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  SUMMARY: ✅ $PASS · ❌ $FAIL"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "❌ STYLE LOCK FAIL — Style '$STYLE_ID' wymaga napraw"
  echo "   Przeczytaj: $STYLE_FILE (sekcje 8, 9, 10 + MUSZĄ/NIE WOLNO)"
  exit 1
fi

echo "✅ Style Lock OK — zgodność ze stylem '$STYLE_ID'"
exit 0
