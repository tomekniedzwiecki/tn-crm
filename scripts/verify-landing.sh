#!/bin/bash
# verify-landing.sh — one-command weryfikacja landinga
#
# Użycie: ./scripts/verify-landing.sh [slug]
# Przykład: ./scripts/verify-landing.sh vitrix
#
# Wykonuje:
# 1. Grep sanity checks (z CLAUDE_LANDING_REVIEW.md sekcja 0)
# 2. Layout discipline checks (z CLAUDE_LANDING_DESIGN.md sekcja G)
# 3. Playwright screenshoty 3 viewports
# 4. Report pass/fail

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

PASS=0
FAIL=0
WARN=0

check() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  local severity="${4:-fail}"  # fail / warn
  if [ "$expected" = "$actual" ]; then
    echo "  ✅ $label"
    PASS=$((PASS + 1))
  else
    if [ "$severity" = "warn" ]; then
      echo "  ⚠️  $label (expected: $expected, got: $actual)"
      WARN=$((WARN + 1))
    else
      echo "  ❌ $label (expected: $expected, got: $actual)"
      FAIL=$((FAIL + 1))
    fi
  fi
}

check_range() {
  local label="$1"
  local min="$2"
  local max="$3"
  local actual="$4"
  if [ "$actual" -ge "$min" ] && [ "$actual" -le "$max" ]; then
    echo "  ✅ $label ($actual)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $label (expected $min-$max, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  VERIFY LANDING: $SLUG"
echo "  File: $FILE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ─── 1. Placeholdery / obrazy ───
echo "📷 1. Obrazy i placeholdery"
N_PH=$(grep -oE 'class="[^"]*(-figure|-placeholder|bento-image|step-image|img-placeholder)[^"]*"' "$FILE" | wc -l)
check_range "Placeholdery/figury" 12 20 "$N_PH"

# UUID check — tylko bieżący
UUIDS=$(grep -oE "ai-generated/[a-z0-9-]+" "$FILE" | sort -u | wc -l)
check "Tylko jedno źródło UUID (brak obcych workflow)" "1" "$UUIDS"

# ─── 2. Numeracja sekcji ───
echo ""
echo "📑 2. Numeracja sekcji"
N_NUM=$(grep -oE "Nº [0-9]+" "$FILE" | sort -u | wc -l)
check_range "Ciągła numeracja Nº (10±1 sekcji)" 8 12 "$N_NUM"

# ─── 3. Zasady bezwarunkowe headera ───
echo ""
echo "🎩 3. Header discipline (DESIGN.md sekcja 0)"
BDF=$(grep -cE "\.header\s*\{[^}]*backdrop-filter" "$FILE" || true)
check "Header BEZ backdrop-filter (tło #FFFFFF)" "0" "$BDF"

# Logo wordmark check: extract content of <a class="logo">...</a>, usuń opening tag + <img>, sprawdź czy zostaje visible text
LOGO_BLOCK=$(awk '/<a[^>]*class="logo"/{flag=1} flag{print; if(/<\/a>/){flag=0}}' "$FILE" | head -n 5 | tr -d '\n')
# Usuwa: cały opening <a ...>, wszystkie <img ...>, zamykający </a>
LOGO_TEXT=$(echo "$LOGO_BLOCK" | sed -E 's|<a[^>]*>||g; s|<img[^>]*>||g; s|</a>.*||g' | tr -d '[:space:]')
if [ -z "$LOGO_TEXT" ]; then
  echo "  ✅ Logo bez wordmark obok (tylko <img>)"
  PASS=$((PASS + 1))
else
  # Warning, nie fail — legitimate cases: logo-symbol bez nazwy marki
  echo "  ⚠️  Logo ma tekst: \"$LOGO_TEXT\" — OK tylko jeśli logo jest SYMBOLEM bez nazwy marki"
  WARN=$((WARN + 1))
fi

# Logo.png file existence check
LOGO_FILE="landing-pages/$SLUG/logo.png"
if [ -f "$LOGO_FILE" ]; then
  LOGO_SIZE=$(wc -c < "$LOGO_FILE")
  if [ "$LOGO_SIZE" -gt 500 ]; then
    echo "  ✅ Logo.png istnieje (${LOGO_SIZE} bytes)"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  Logo.png za mały (${LOGO_SIZE} bytes) — prawdopodobnie corrupt"
    WARN=$((WARN + 1))
  fi
else
  echo "  ⚠️  Brak landing-pages/$SLUG/logo.png (HTML linkuje przez URL — OK jeśli celowe)"
  WARN=$((WARN + 1))
fi

# ─── 4. Fade-in safety ───
echo ""
echo "🌅 4. Fade-in safety (PROCEDURE.md lekcja #1)"
JSGATE=$(grep -cE "document\.documentElement\.classList\.add..js" "$FILE" || true)
check "html.js gate w <head>" "1" "$JSGATE"

SAFE_FILTERED=$(grep -cE "rect\.top.*window\.innerHeight|getBoundingClientRect" "$FILE" || true)
if [ "$SAFE_FILTERED" -ge 1 ]; then
  echo "  ✅ Safety timeout filtruje po pozycji"
  PASS=$((PASS + 1))
else
  echo "  ❌ Safety timeout NIE filtruje po pozycji (bezwarunkowy timeout)"
  FAIL=$((FAIL + 1))
fi

# ─── 5. Inline img sizing (PATTERN 16 / DESIGN G) ───
echo ""
echo "🖼️  5. Image-box discipline (DESIGN.md sekcja G)"
INLINE_IMG=$(grep -cE "<img[^>]*style=\"[^\"]*(height|width|aspect-ratio):" "$FILE" || true)
check "Zero inline img sizing" "0" "$INLINE_IMG"

# Grid row span 2 (ryzyko pustych komórek)
SPAN2=$(grep -cE "grid-row\s*:\s*span 2" "$FILE" || true)
check "grid-row:span 2 — brak (ryzyko pustych komórek)" "0" "$SPAN2" "warn"

# ─── 6. Meta / SEO / fonts ───
echo ""
echo "🔗 6. Meta & fonts"
OG=$(grep -cE 'property="og:image"[^>]*yxmavwkwnfuphjqbelws' "$FILE" || true)
check "OG image = pełny URL Supabase" "1" "$OG"

LATIN=$(grep -cE "subset=latin-ext" "$FILE" || true)
check "Fonty z subset=latin-ext (polskie znaki)" "1" "$LATIN"

# Meta title length (≤ 60 znaków)
TITLE=$(grep -oE "<title>[^<]+</title>" "$FILE" | sed 's/<title>//; s|</title>||')
TITLE_LEN=${#TITLE}
if [ "$TITLE_LEN" -gt 0 ] && [ "$TITLE_LEN" -le 60 ]; then
  echo "  ✅ Meta title ≤ 60 znaków ($TITLE_LEN)"
  PASS=$((PASS + 1))
elif [ "$TITLE_LEN" -gt 60 ]; then
  echo "  ⚠️  Meta title $TITLE_LEN znaków (SEO: ≤ 60)"
  WARN=$((WARN + 1))
else
  echo "  ❌ Brak <title>"
  FAIL=$((FAIL + 1))
fi

# Meta description length (≤ 160 znaków)
DESC=$(grep -oE 'name="description"[^>]*content="[^"]+"' "$FILE" | sed 's/.*content="//; s/"$//')
DESC_LEN=${#DESC}
if [ "$DESC_LEN" -gt 0 ] && [ "$DESC_LEN" -le 160 ]; then
  echo "  ✅ Meta description ≤ 160 znaków ($DESC_LEN)"
  PASS=$((PASS + 1))
elif [ "$DESC_LEN" -gt 160 ]; then
  echo "  ⚠️  Meta description $DESC_LEN znaków (SEO: ≤ 160)"
  WARN=$((WARN + 1))
else
  echo "  ❌ Brak meta description"
  FAIL=$((FAIL + 1))
fi

# ─── 7. JS effects coverage (DESIGN.md D.1) ───
echo ""
echo "✨ 7. JS effects (DESIGN.md sekcja D.1)"
JSSPLIT=$(grep -cE 'class="[^"]*js-split[^"]*"' "$FILE" || true)
check "Split headline (.js-split)" "1" "$JSSPLIT" "warn"

JSCOUNT=$(grep -cE 'class="js-counter"' "$FILE" || true)
check_range "Number counters (.js-counter) ≥ 2" 2 20 "$JSCOUNT"

MAGNET=$(grep -cE 'class="[^"]*magnetic[^"]*"' "$FILE" || true)
check_range "Magnetic CTA (.magnetic) ≥ 2" 2 20 "$MAGNET"

# ─── 8. Copy anti-patterns ───
echo ""
echo "✍️ 8. Copy quality"
POWER=$(grep -ciE "innowacyjn|najwyższ[ae] jakość|charakteryzuje się|implementacj|kompleksow" "$FILE" || true)
check "Zero power words korporacyjnych" "0" "$POWER"

LOREM=$(grep -ciE "lorem ipsum|TODO|placeholder text" "$FILE" || true)
check "Zero lorem/TODO" "0" "$LOREM"

DELIVERY=$(grep -ciE "wysy[łl]ka 24|w 24 ?h|polski magazyn|z magazynu w Polsc|D\+1" "$FILE" || true)
check "Zero zakazanych obietnic dostawy (dropshipping)" "0" "$DELIVERY"

# ─── 9. Brief persistence ───
echo ""
echo "📋 9. Brief persistence (manifesto)"
BRIEF="landing-pages/$SLUG/_brief.md"
if [ -f "$BRIEF" ]; then
  BRIEF_SIZE=$(wc -c < "$BRIEF")
  if [ "$BRIEF_SIZE" -gt 500 ]; then
    echo "  ✅ _brief.md istnieje (${BRIEF_SIZE} bytes)"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  _brief.md istnieje ale za krótki (${BRIEF_SIZE} bytes)"
    WARN=$((WARN + 1))
  fi
else
  echo "  ⚠️  _brief.md BRAK — ETAP 2.5 DIRECTION nie wykonany"
  WARN=$((WARN + 1))
fi

# ─── Summary ───
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  SUMMARY: ✅ $PASS · ⚠️  $WARN · ❌ $FAIL"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "❌ FAIL — napraw problemy przed deployem"
  exit 1
elif [ "$WARN" -gt 3 ]; then
  echo "⚠️  Za dużo warningów — przejrzyj raport"
  exit 2
else
  echo "✅ Landing gotowy do ETAP 4 (Playwright visual verify)"
  echo ""
  echo "Następny krok:"
  echo "  bash scripts/screenshot-landing.sh $SLUG"
  echo "  # Potem obejrzyj screenshoty (Read tool) i commit"
fi
