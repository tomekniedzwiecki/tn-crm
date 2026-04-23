#!/bin/bash
# generate-landing-images.sh — wywołuje edge function generate-image dla 11 zdjęć landing
# Usage: bash scripts/generate-landing-images.sh [UUID] [SLUG]
# Background-safe: wypisuje progress do stdout (kierowany do log file przez landing-autorun.sh)

UUID="$1"
SLUG="$2"

if [ -z "$UUID" ] || [ -z "$SLUG" ]; then
  echo "Usage: bash scripts/generate-landing-images.sh [UUID] [SLUG]"
  exit 1
fi

OUT="landing-pages/$SLUG/ai-generated"
mkdir -p "$OUT"

set -a && source /c/repos_tn/tn-crm/.env && set +a
SUPABASE_URL="https://yxmavwkwnfuphjqbelws.supabase.co"

echo "[$(date +%T)] Start AI generation for $SLUG (UUID=$UUID)"

# Pobierz ai_prompts dla landing scope
PROMPTS=$(curl -s "$SUPABASE_URL/rest/v1/workflow_branding?workflow_id=eq.$UUID&type=eq.ai_prompts&select=value" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")

if [ "$PROMPTS" = "[]" ]; then
  echo "⚠️  Brak ai_prompts w workflow_branding — pomijam AI generation"
  echo "   Landing zostanie wygenerowany z placeholderami (briefy fotografa)"
  exit 0
fi

# Standard 11 zdjęć landing (lista nazw) — pod KLASYCZNY 14-sekcyjny szablon
# Jeśli wybrany wariant Hero/Features/Testimonials z section-variants.md wymaga innych
# kadrów (np. H6 Persona portrait = pionowy portret, H10 Before/After = 2 kadry przed/po,
# T4 UGC wall = 8 square), zdjęcia powyższe mogą być nieużyte a brakujące
# wymagają custom prompts. TODO: variant-aware image generation w przyszłej iteracji.
# Na razie: Claude w ETAP 4 podmienia placeholdery na dostępne ai-generated,
# pozostawia 4-polowe briefy tam gdzie brak pasującego obrazu.
NAMES=(
  "hero"
  "challenge"
  "tile-hero"
  "tile-safety"
  "tile-navigation"
  "tile-control"
  "ritual-1"
  "ritual-2"
  "ritual-3"
  "spec"
  "offer"
)

COUNT=0
TOTAL=${#NAMES[@]}

for name in "${NAMES[@]}"; do
  COUNT=$((COUNT + 1))
  echo "[$(date +%T)] [$COUNT/$TOTAL] Generuję: $name"

  # Wywołanie edge function (synchronous w tej wersji - timeout 60s każde)
  curl -s --max-time 60 -X POST "$SUPABASE_URL/functions/v1/generate-image" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"workflow_id\":\"$UUID\",\"slug\":\"$SLUG\",\"filename\":\"$name\",\"type\":\"landing\"}" \
    > "$OUT/$name.result.json" 2>&1 &
done

# Wait for all background curls to finish
wait

# Count successful images
SUCCESS=$(ls "$OUT"/*.result.json 2>/dev/null | wc -l)
echo "[$(date +%T)] Gotowe — zwrócono $SUCCESS/$TOTAL response'ów"
echo "[$(date +%T)] Log files: $OUT/*.result.json"

# Check ile faktycznie .png/.jpg w storage (download wymagałby drugiego curla)
echo "[$(date +%T)] Sprawdź ostatecznie w ETAP 4 (DESIGN) — podmień placeholdery na gotowe URLe"
