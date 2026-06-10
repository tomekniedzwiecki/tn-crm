#!/bin/bash
# verify-freshness.sh — template-fingerprint check: leksykalna sztanca między landingami (v5.0)
#
# Usage: bash scripts/verify-freshness.sh <slug>
# Exit 0 = świeży; Exit 2 = kolizje (rollout WARN — docelowo exit 1 po 5 landingach)
#
# Geneza (audyt 2026-06): mimo różnych stylów wizualnych cervana/linovo/kafina dzieliły
# identyczne mikro-frazy ("Zanim zamówisz" 3/3, "Oszczędzasz 100 zł" 3/3, rabat ZAWSZE
# równo 100 zł) — klient porównujący 2 dema z portfolio rozpoznaje sztancę po TEKŚCIE.
#
# Działanie:
# (A) ekstrakcja fraz z nagłówków/eyebrow/CTA nowego landinga (≥4 słowa po normalizacji)
# (B) kolizje PER PARA: FAIL gdy nowy landing dzieli ≥4 dosłowne frazy z JEDNYM istniejącym
# (C) blacklista dwupoziomowa: frazy-sztance potwierdzone audytem = zawsze flagowane

set -e
cd "$(dirname "$0")/.."

SLUG="$1"
[ -z "$SLUG" ] && echo "Usage: bash scripts/verify-freshness.sh <slug>" && exit 1
FILE="landing-pages/$SLUG/index.html"
[ ! -f "$FILE" ] && echo "❌ Brak $FILE" && exit 1

# ── ekstrakcja fraz: h1/h2/h3 + eyebrow/section-label + teksty <a>/<button> z klasą btn|cta ──
extract_phrases() {
  local f="$1"
  {
    grep -oE '<h[123][^>]*>[^<]{8,}' "$f" | sed -E 's/<[^>]*>//g'
    grep -oE 'class="[^"]*(eyebrow|section-label|sec-title)[^"]*"[^>]*>[^<]{8,}' "$f" | sed -E 's/^[^>]*>//'
    grep -oE '<(a|button)[^>]*class="[^"]*(btn|cta)[^"]*"[^>]*>[^<]{8,}' "$f" | sed -E 's/<[^>]*>//g'
  } | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[„""«»,.!?:;–—-]+/ /g; s/[[:space:]]+/ /g; s/^ //; s/ $//' \
    | awk 'NF >= 4' | sort -u
}

NEW_PHRASES=$(extract_phrases "$FILE")
N_PHRASES=$(echo "$NEW_PHRASES" | grep -c . || true)

echo ""
echo "═══ FRESHNESS CHECK: $SLUG ($N_PHRASES fraz ≥4 słowa) ═══"
echo ""

WARN=0

# ── (C) blacklista fraz-sztanc (potwierdzone audytem; rozszerzaj przy kolejnych) ──
BLACKLIST_HARD=(
  "zanim zamówisz"
  "co mówią ci którzy"
)
for phrase in "${BLACKLIST_HARD[@]}"; do
  if grep -qiE "$(echo "$phrase" | sed 's/ /[[:space:]]+/g')" "$FILE"; then
    echo "  ⚠️  Fraza-sztanca z blacklisty: \"$phrase\" — występowała w 3/3 audytowanych landingów; przepisz"
    WARN=$((WARN + 1))
  fi
done

# rabat "równo 100 zł" — sztanca matematyczna (audyt: 3/3 landingi, -25%/-29%/-33% a savings zawsze 100)
if grep -qiE "Oszczędzasz[[:space:]]+100[[:space:]]*zł" "$FILE"; then
  N_100=$(grep -rliE "Oszczędzasz[[:space:]]+100[[:space:]]*zł" landing-pages/*/index.html 2>/dev/null | grep -cv "$SLUG" || true)
  if [ "$N_100" -ge 2 ]; then
    echo "  ⚠️  'Oszczędzasz 100 zł' — identyczny savings w $N_100 innych landingach (sztanca cenowa; różnicuj kwoty rabatu per produkt)"
    WARN=$((WARN + 1))
  fi
fi

# ── (B) kolizje per para z istniejącymi landingami ──
WORST_COUNT=0
WORST_SLUG=""
WORST_SHARED=""
for other in landing-pages/*/index.html; do
  other_slug=$(echo "$other" | sed -E 's|landing-pages/([^/]+)/.*|\1|')
  [ "$other_slug" = "$SLUG" ] && continue
  [ "$other_slug" = "_templates" ] && continue
  [ "$other_slug" = "shared" ] && continue
  OTHER_PHRASES=$(extract_phrases "$other")
  SHARED=$(comm -12 <(echo "$NEW_PHRASES") <(echo "$OTHER_PHRASES") | grep -c . || true)
  if [ "$SHARED" -gt "$WORST_COUNT" ]; then
    WORST_COUNT=$SHARED
    WORST_SLUG=$other_slug
    WORST_SHARED=$(comm -12 <(echo "$NEW_PHRASES") <(echo "$OTHER_PHRASES") | head -6)
  fi
done

if [ "$WORST_COUNT" -ge 4 ]; then
  echo "  ⚠️  KOLIZJA: $WORST_COUNT wspólnych fraz z '$WORST_SLUG':"
  echo "$WORST_SHARED" | sed 's/^/     · /'
  echo "     → przepisz nagłówki/CTA, żeby landing nie czytał się jak ten sam szablon"
  WARN=$((WARN + 1))
elif [ "$WORST_COUNT" -gt 0 ]; then
  echo "  ✅ Max $WORST_COUNT wspólnych fraz (z '$WORST_SLUG') — poniżej progu 4"
else
  echo "  ✅ Zero kolizji leksykalnych z korpusem"
fi

echo ""
if [ "$WARN" -gt 0 ]; then
  echo "GATE: WARN ($WARN — rollout v5.0: napraw zalecane; docelowo FAIL)"
  exit 2
fi
echo "GATE: PASS"
exit 0
