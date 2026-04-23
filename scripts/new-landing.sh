#!/bin/bash
# new-landing.sh — boilerplate generator dla nowego landingu z wybranym stylem
# Usage: bash scripts/new-landing.sh [slug] [style-id]
# Przykład: bash scripts/new-landing.sh steamla apothecary-label
#
# Tworzy:
# 1. Folder landing-pages/[slug]/
# 2. _brief.md z prefilled Style ID + auto-pasted MUSZĄ/NIE WOLNO z pliku stylu
# 3. Wypisuje przygotowany prompt dla Claude'a w ETAP 2

set -e
SLUG="$1"
STYLE_ID="$2"

if [ -z "$SLUG" ] || [ -z "$STYLE_ID" ]; then
  echo "Usage: bash scripts/new-landing.sh [slug] [style-id]"
  echo ""
  echo "Dostępne style:"
  ls docs/landing/style-atlas/ 2>/dev/null | grep -E "\.md$" | grep -v "^_template\|^README" | sed 's/\.md$//' | sed 's/^/  - /'
  exit 1
fi

STYLE_FILE="docs/landing/style-atlas/${STYLE_ID}.md"
if [ ! -f "$STYLE_FILE" ]; then
  echo "❌ Styl '$STYLE_ID' nie istnieje w $STYLE_FILE"
  echo ""
  echo "Dostępne style:"
  ls docs/landing/style-atlas/ 2>/dev/null | grep -E "\.md$" | grep -v "^_template\|^README" | sed 's/\.md$//' | sed 's/^/  - /'
  exit 1
fi

LANDING_DIR="landing-pages/$SLUG"
BRIEF="$LANDING_DIR/_brief.md"

mkdir -p "$LANDING_DIR"

if [ -f "$BRIEF" ]; then
  echo "⚠️  $BRIEF już istnieje — nie nadpisuję"
else
  cp "landing-pages/_templates/_brief.template.md" "$BRIEF"
  echo "✅ Brief skopiowany z template"
fi

# Auto-fill Style ID w sekcji 10.1
# Linux/macOS sed różni się od Windows git-bash, użyję node dla niezawodności
node -e "
const fs = require('fs');
let brief = fs.readFileSync('$BRIEF', 'utf8');

// Prefill Style ID
brief = brief.replace(
  /\*\*Style ID:\*\* \[nazwa pliku bez \.md.*\]/,
  '**Style ID:** \`$STYLE_ID\`'
);
brief = brief.replace(
  /\*\*Plik:\*\* \[.*docs\/landing\/style-atlas\/\].*\)/,
  '**Plik:** [\`docs/landing/style-atlas/${STYLE_ID}.md\`](../../docs/landing/style-atlas/${STYLE_ID}.md)'
);

fs.writeFileSync('$BRIEF', brief);
console.log('✅ Style ID wpisany do briefa');
"

# Wyciągnij MUSZĄ i NIE WOLNO z pliku stylu
MUSZA=$(awk '/^### MUSZĄ/,/^### NIE WOLNO/' "$STYLE_FILE" | grep -vE "^### " || true)
NIEWOLNO=$(awk '/^### NIE WOLNO/,/^---$/' "$STYLE_FILE" | grep -vE "^### |^---" || true)

# Wyciągnij Section Architecture i Allowed Variants i Motion Budget
SECARCH=$(awk '/^## 8\. Section/,/^## 9\./' "$STYLE_FILE" | tail -n +2 | head -n -1 || true)
VARIANTS=$(awk '/^## 9\. Allowed Variants/,/^## 10\./' "$STYLE_FILE" | tail -n +2 | head -n -1 || true)
MOTION=$(awk '/^## 10\. Motion Budget/,/^## 11\./' "$STYLE_FILE" | tail -n +2 | head -n -1 || true)

# Zapisz do /tmp dla Claude'a
mkdir -p /c/tmp
cat > "/c/tmp/style-lock-$SLUG.md" <<EOF
# Style Lock dla $SLUG (styl: $STYLE_ID)

## 10.3 MUSZĄ być użyte (kopiuj do _brief.md sekcja 10.3)
$MUSZA

## 10.4 NIE WOLNO użyć (kopiuj do _brief.md sekcja 10.4)
$NIEWOLNO

## 10.5 Section Architecture
$SECARCH

## 10.6 Motion Budget
$MOTION

## Allowed Variants (do _brief.md sekcja 9)
$VARIANTS
EOF

echo "✅ Style Lock wyodrębniony do /c/tmp/style-lock-$SLUG.md"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LANDING CREATED: $SLUG"
echo "  Style: $STYLE_ID"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Następne kroki:"
echo ""
echo "1. Wypełnij _brief.md sekcje 1-8 (manifest, paleta per styl, persona, signature)"
echo "   → landing-pages/$SLUG/_brief.md"
echo ""
echo "2. Skopiuj STYLE LOCK z /c/tmp/style-lock-$SLUG.md do _brief.md sekcje 10.3-10.6"
echo ""
echo "3. Przeczytaj plik stylu CAŁOŚCIOWO:"
echo "   → $STYLE_FILE"
echo ""
echo "4. Zweryfikuj brief:"
echo "   bash scripts/verify-brief.sh $SLUG"
echo ""
echo "5. Generuj HTML zgodnie ze Style Lock (ETAP 2 z docs/landing/02-generate.md):"
echo "   - Użyj fontów TYLKO z sekcji 4 pliku stylu"
echo "   - Użyj palety TYLKO z sekcji 5 pliku stylu"
echo "   - Użyj primitive'ów z sekcji 7 pliku stylu"
echo "   - NIE używaj fontów/layoutów/elementów z listy NIE WOLNO"
echo "   - Sekcje per Section Architecture (może być !=14)"
echo "   - JS effects per Motion Budget"
echo ""
echo "6. Weryfikacja przed commitem:"
echo "   bash scripts/verify-landing.sh $SLUG"
echo "   bash scripts/verify-style-lock.sh $SLUG"
echo ""
