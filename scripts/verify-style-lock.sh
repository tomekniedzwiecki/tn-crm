#!/bin/bash
# verify-style-lock.sh — sprawdza zgodność landingu ze Style Lock z _brief.md
# Usage: bash scripts/verify-style-lock.sh [slug]
# Exit 0 = zgodność OK; Exit 1 = violation → blokuje deploy
#
# ═══ MODEL HYBRYDOWY (v5.0, 2026-06) ═══
# Problem v4.x: REQUIRED były hardcoded hexy/fonty Atlasu, których paleta KLIENTA nigdy
# nie spełnia (branding > Atlas, Krok 4.4 procedury) → `git commit --no-verify` stało się
# normą i wyłączało CAŁY pre-commit (też verify-landing). Memory:
# feedback-verify-style-lock-vs-branding.md, feedback-landing-style-lock-enforced-clinical-warmth.md
#
# v5.0:
#   1. REQUIRED tokeny (fonty+hexy) czytane z _brief.md sekcji 10 — linie maszynowe:
#        lock-font-display: Cormorant Garamond
#        lock-font-body: Manrope
#        lock-hex: #1A3C34
#      (legalizuje paletę/fonty klienta). Gdy brief ma ≥1 linię lock-* → tryb BRIEF-LOCK.
#   2. FORBIDDEN zostają hardcoded per Style ID (zakazy strukturalne stylu) — NIE z briefu,
#      bo agent piszący brief i HTML w tym samym runie tworzyłby pętlę samo-atestacji.
#   3. Pierwszeństwo: token wymieniony jawnie w lock-* briefu jest WYŁĄCZANY z listy
#      forbidden danego stylu (deterministyczne odwzorowanie "branding > Atlas").
#   4. BACKWARD-COMPAT: brief bez linii lock-* → stare zachowanie (hardcoded REQUIRED).
#
# Flow:
# 1. Odczytaj _brief.md sekcja 10 → Style ID + ewentualne linie lock-*
# 2. Tryb BRIEF-LOCK: REQUIRED = tokeny lock-*; tryb legacy: REQUIRED = hardcoded per styl
# 3. FORBIDDEN per styl (case statement), z wyłączeniem tokenów lock-*
# 4. Raport PASS/FAIL per check

set -e
SLUG="$1"
[ -z "$SLUG" ] && echo "Usage: bash scripts/verify-style-lock.sh [slug]" && exit 1

BRIEF="landing-pages/$SLUG/_brief.md"
HTML="landing-pages/$SLUG/index.html"

[ ! -f "$BRIEF" ] && echo "❌ Brak $BRIEF" && exit 1
[ ! -f "$HTML" ] && echo "❌ Brak $HTML" && exit 1

# Wyłuskaj sekcję 10 i Style ID
SEC10=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---/' "$BRIEF")
STYLE_ID=$(echo "$SEC10" | grep -oE 'Style ID:[*]+[[:space:]]*`[a-z-]+`' | head -1 | sed 's/^[^`]*`//; s/`.*//')

if [ -z "$STYLE_ID" ]; then
  # Grandfathering (v5.0): briefy sprzed v4.0 nie mają sekcji 10 STYLE LOCK.
  # NIE blokujemy — stare landingi obowiązuje protokół migrate.md ("nie pogarszaj"),
  # a twardy gate verify-landing.sh i tak działa. Nowe briefy MAJĄ sekcję 10
  # (egzekwuje verify-brief.sh w ETAP 1→2).
  if ! echo "$SEC10" | grep -q "STYLE LOCK"; then
    echo "⚠️  Brief bez sekcji 10 STYLE LOCK (sprzed v4.0) — grandfathered, pomijam style-lock"
    echo "GATE: PASS"
    exit 0
  fi
  echo "❌ Sekcja 10 istnieje, ale brak Style ID"
  echo "   Wymagany format: **Style ID:** \`[style-id]\`"
  exit 1
fi

STYLE_FILE="docs/landing/style-atlas/${STYLE_ID}.md"
if [ ! -f "$STYLE_FILE" ]; then
  echo "❌ Style '$STYLE_ID' nie istnieje w $STYLE_FILE"
  exit 1
fi

# ═══ v5.0: parse maszynowych linii lock-* z sekcji 10 ═══
LOCK_FONTS=$(echo "$SEC10" | tr -d '\r' | grep -E '^lock-font-(display|body|mono|accent):' | sed -E 's/^lock-font-[a-z]+:[[:space:]]*//; s/[[:space:]]+$//' | grep -v '^$' || true)
LOCK_HEXES=$(echo "$SEC10" | tr -d '\r' | grep -E '^lock-hex:' | grep -oE '#[0-9A-Fa-f]{3,8}' || true)
BRIEF_LOCK_MODE=0
if [ -n "$LOCK_FONTS" ] || [ -n "$LOCK_HEXES" ]; then
  BRIEF_LOCK_MODE=1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  STYLE LOCK VERIFY: $SLUG"
echo "  Style: $STYLE_ID"
if [ "$BRIEF_LOCK_MODE" = "1" ]; then
  echo "  Tryb: BRIEF-LOCK (REQUIRED tokeny z _brief.md — branding > Atlas)"
else
  echo "  Tryb: legacy (REQUIRED hardcoded Atlas — brief bez linii lock-*)"
fi
echo "═══════════════════════════════════════════════════════════"
echo ""

PASS=0
FAIL=0

# Helper: czy pattern forbidden koliduje z tokenem jawnie zalockowanym w briefie?
is_brief_locked() {
  local pattern="$1"
  [ "$BRIEF_LOCK_MODE" = "1" ] || return 1
  local all_tokens
  all_tokens=$(printf '%s\n%s' "$LOCK_FONTS" "$LOCK_HEXES")
  while IFS= read -r tok; do
    [ -z "$tok" ] && continue
    if echo "$tok" | grep -qiE "$pattern"; then return 0; fi
  done <<< "$all_tokens"
  return 1
}

# Helper: grep MUST be present (strukturalne — zawsze egzekwowane)
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

# Helper: token stylu (font/hex) — w trybie BRIEF-LOCK zastępowany przez lock-* briefu
check_required_token() {
  local pattern="$1"
  local desc="$2"
  if [ "$BRIEF_LOCK_MODE" = "1" ]; then
    echo "  ⏭️  MUSI (Atlas) zastąpione przez lock-* briefu: $desc"
    return
  fi
  check_required "$pattern" "$desc"
}

# Helper: grep MUST NOT be present — z pierwszeństwem brandingu
check_forbidden() {
  local pattern="$1"
  local desc="$2"
  if is_brief_locked "$pattern"; then
    echo "  ⏭️  ZAKAZ uchylony (token jawnie w lock-* briefu — branding > Atlas): $desc"
    PASS=$((PASS + 1))
    return
  fi
  if grep -qE "$pattern" "$HTML"; then
    echo "  ❌ ZAKAZ naruszony: $desc (pattern: $pattern)"
    FAIL=$((FAIL + 1))
  else
    echo "  ✅ ZAKAZ OK: $desc nieobecny"
    PASS=$((PASS + 1))
  fi
}

# helper: escape regex metaznaków w tokenie (grep -iF abortuje na tym buildzie Git Bash —
# udokumentowany crash, używamy -qiE z escapowanym fixed stringiem)
re_escape() { printf '%s' "$1" | sed 's/[][\.*^$()+?{}|\\]/\\&/g'; }

# ═══ Tryb BRIEF-LOCK: REQUIRED = tokeny z briefu ═══
if [ "$BRIEF_LOCK_MODE" = "1" ]; then
  echo "🔒 REQUIRED z _brief.md sekcji 10:"
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if grep -qiE "$(re_escape "$f")" "$HTML"; then
      echo "  ✅ MUSI (brief): font \"$f\""
      PASS=$((PASS + 1))
    else
      echo "  ❌ MUSI brak (brief): font \"$f\""
      FAIL=$((FAIL + 1))
    fi
  done <<< "$LOCK_FONTS"
  while IFS= read -r h; do
    [ -z "$h" ] && continue
    if grep -qi "$h" "$HTML"; then
      echo "  ✅ MUSI (brief): hex $h"
      PASS=$((PASS + 1))
    else
      echo "  ❌ MUSI brak (brief): hex $h"
      FAIL=$((FAIL + 1))
    fi
  done <<< "$LOCK_HEXES"
  echo ""
fi

# ═══════ Style-specific rules ═══════
# Tokeny (fonty/hexy) → check_required_token (zastępowalne przez brief)
# Strukturalne (klasy/CSS/primitives) → check_required (zawsze)
# Zakazy → check_forbidden (uchylane tylko przez jawny lock-* w briefie)
case "$STYLE_ID" in
  apothecary-label)
    check_required_token "IBM Plex Sans" "Display font IBM Plex Sans"
    check_required_token "IBM Plex Mono" "Mono font IBM Plex Mono"
    check_required_token "#FAFAF7|#fafaf7" "Paper White #FAFAF7"
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

  clinical-warmth)
    check_required_token "Cormorant Garamond" "Display font Cormorant Garamond"
    check_required_token "Manrope" "Label font Manrope"
    check_required_token "#F7F4ED|#f7f4ed" "Ciepły papier #F7F4ED"
    check_required "class=\"[^\"]*spec-label" "Primitive spec-label section"
    check_forbidden "Fraunces" "Fraunces (editorial zakaz)"
    check_forbidden "IBM Plex" "IBM Plex (sterile lab zakaz)"
    check_forbidden "Archivo Black" "Archivo Black (poster zakaz)"
    check_forbidden "Caveat" "Caveat script (zakaz)"
    check_forbidden "class=\"[^\"]*hero-numeral" "Oversized italic numeral hero (Editorial zakaz)"
    check_forbidden "class=\"[^\"]*js-split" "Split headline char-by-char (zakaz)"
    check_forbidden "class=\"[^\"]*js-parallax" "Parallax (zakaz)"
    check_forbidden "class=\"[^\"]*magnetic" "Magnetic CTA (za DTC/playful)"
    check_forbidden "class=\"[^\"]*js-tilt" "Tilt 3D (psuje powagę kliniczną)"
    ;;

  poster-utility)
    check_required_token "Archivo Black" "Display font Archivo Black"
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
    check_required_token "IBM Plex Sans" "Display IBM Plex Sans"
    check_required_token "IBM Plex Mono" "Mono IBM Plex Mono"
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
    check_required_token "Noto Serif|Tenor Sans" "Display Noto Serif albo Tenor Sans"
    check_required_token "#F4F1EA|#f4f1ea" "Paper Pearl #F4F1EA"
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
    check_required_token "Helvetica|Inter" "Display Helvetica lub Inter"
    check_required "grid-template-columns:\s*repeat\(12" "12-col grid Swiss"
    check_required_token "#FFFFFF|#ffffff|#FFF" "Pure white background"
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
    check_required_token "Times New Roman|Georgia" "Display Times New Roman w h1/h2"
    check_required "transform:\s*rotate" "Min 1 rotated element"
    check_required "text-decoration:\s*underline" "Underline links"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "Cormorant" "Cormorant zakaz"
    check_forbidden "IBM Plex" "IBM Plex zakaz"
    check_forbidden "Archivo Black" "Archivo Black zakaz"
    check_forbidden "border-radius:\s*(1[6-9]|[2-9][0-9])px" "Duże border-radius zakaz"
    ;;

  dark-academia)
    check_required_token "Libre Caslon" "Libre Caslon display"
    check_required_token "#E8E0CF|#e8e0cf" "Parchment #E8E0CF"
    check_required_token "#6B1F1F|#6b1f1f" "Burgundy #6B1F1F"
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
    check_required_token "EB Garamond" "EB Garamond display"
    check_required "class=\"[^\"]*botanical" "Primitive botanical SVG ornament"
    check_required_token "#F5EFDF|#f5efdf" "Butter Cream #F5EFDF"
    check_required_token "#8AA586|#8aa586" "Sage #8AA586"
    check_forbidden "Archivo Black" "Archivo Black zakaz"
    check_forbidden "IBM Plex" "IBM Plex zakaz"
    check_forbidden "Fraunces" "Fraunces zakaz"
    check_forbidden "Libre Caslon" "Libre Caslon (Dark Academia vibe)"
    check_forbidden "class=\"[^\"]*js-parallax" "Parallax zakaz"
    check_forbidden "class=\"[^\"]*js-counter" "Counter zakaz"
    ;;

  outdoorsy-expedition)
    check_required_token "Work Sans" "Work Sans display"
    check_required_token "Space Mono" "Space Mono coordinates"
    check_required_token "#E5D7B8|#e5d7b8" "Canvas Khaki"
    check_required_token "#D35A1D|#d35a1d" "Signal Orange"
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
    check_required_token "Fraunces" "Fraunces display"
    check_required "Nº" "Nº eyebrow numeracja"
    ;;

  panoramic-calm)
    check_required_token "Plus Jakarta" "Plus Jakarta Sans"
    check_required_token "Instrument Serif" "Instrument Serif accent"
    ;;

  organic-natural)
    check_required_token "Nunito|DM Sans" "Nunito lub DM Sans"
    check_required "border-radius:\s*(1[6-9]|2[0-9])px" "Rounded corners 16-24px+"
    ;;

  playful-toy)
    check_required_token "Nunito" "Nunito display"
    check_forbidden "Fredoka One" "Fredoka One (brak PL znaków)"
    ;;

  retro-futuristic)
    check_required_token "Space Grotesk|Syne" "Space Grotesk lub Syne"
    check_required_token "#0A0A0F|#0D1117|#0a0a0f" "Dark background"
    ;;

  rugged-heritage)
    check_required_token "Archivo" "Archivo (nie Black — 700/800)"
    check_required_token "IM Fell English" "IM Fell English for stamps"
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
  echo "GATE: FAIL (FAIL=$FAIL)"
  echo "❌ STYLE LOCK FAIL — Style '$STYLE_ID' wymaga napraw"
  echo "   Przeczytaj: $STYLE_FILE (sekcje 8, 9, 10 + MUSZĄ/NIE WOLNO)"
  echo "   Jeśli landing celowo używa palety/fontów BRANDU klienta → dodaj do _brief.md"
  echo "   sekcji 10 linie maszynowe (zamiast --no-verify!):"
  echo "     lock-font-display: [font display brandu]"
  echo "     lock-font-body: [font body brandu]"
  echo "     lock-hex: #XXXXXX   (po jednej linii na kolor, min 3)"
  exit 1
fi

echo "GATE: PASS"
echo "✅ Style Lock OK — zgodność ze stylem '$STYLE_ID'"
exit 0
