#!/bin/bash
# landing-style-stats.sh — agreguje wybór stylów z _brief.md per landing
#
# Usage:
#   bash scripts/landing-style-stats.sh              # full report
#   bash scripts/landing-style-stats.sh --check      # exit 1 jeśli ostatni styl narusza anti-repetition
#   bash scripts/landing-style-stats.sh --check [proposed-style-id]
#       → exit 1 jeśli proponowany styl użyty 2+ razy w ostatnich 5 landingach
#
# Egzekwuje regułę z 01-direction.md Krok 9a.2:
#   "wyklucz style które były użyte 2+ razy w ostatnich 5 landingach (anti-repetition)"
#
# Output:
#   - Histogram stylów (last 10 + overall)
#   - Top-N over-saturated style (>20% udziału = ostrzeżenie)
#   - Last 10 chronologicznie

set -e

LANDING_ROOT="landing-pages"
[ ! -d "$LANDING_ROOT" ] && echo "❌ Brak folderu $LANDING_ROOT" && exit 1

MODE="${1:-report}"
PROPOSED_STYLE="${2:-}"

# Wyłuskaj Style ID + mtime per landing
# Output: "[mtime_unix] [style_id] [slug]"
collect_styles() {
  for brief in "$LANDING_ROOT"/*/_brief.md; do
    [ ! -f "$brief" ] && continue
    SLUG=$(basename "$(dirname "$brief")")
    # Skip _templates folder
    [ "$SLUG" = "_templates" ] && continue
    [ "$SLUG" = "shared" ] && continue

    STYLE_ID=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---$/' "$brief" 2>/dev/null \
      | grep -oE 'Style ID:[*]+[[:space:]]*`[a-z-]+`' \
      | head -1 \
      | sed 's/^[^`]*`//; s/`.*//')

    # Pre-v4.0 landingi: brak Style ID → próbujemy odgadnąć z sekcji 1 Kierunek manifesta
    if [ -z "$STYLE_ID" ]; then
      DIRECTION=$(awk '/^## 1\. Kierunek/,/^## 2\./' "$brief" 2>/dev/null \
        | grep -E "^- \[x\]|^- \[X\]" \
        | head -1)
      case "$DIRECTION" in
        *"Panoramic Calm"*) STYLE_ID="panoramic-calm-pre-v4" ;;
        *"Editorial"*|*"Luxury"*) STYLE_ID="editorial-print-pre-v4" ;;
        *"Organic"*|*"Natural"*) STYLE_ID="organic-natural-pre-v4" ;;
        *"Playful"*|*"Toy"*) STYLE_ID="playful-toy-pre-v4" ;;
        *"Retro"*) STYLE_ID="retro-futuristic-pre-v4" ;;
        *"Rugged"*|*"Heritage"*) STYLE_ID="rugged-heritage-pre-v4" ;;
        *"Nowy"*) STYLE_ID="custom-pre-v4" ;;
        *) STYLE_ID="unknown" ;;
      esac
    fi

    # mtime briefa (Linux/MSYS stat)
    if MTIME=$(stat -c %Y "$brief" 2>/dev/null); then :;
    elif MTIME=$(stat -f %m "$brief" 2>/dev/null); then :;
    else MTIME=0; fi

    echo "$MTIME $STYLE_ID $SLUG"
  done
}

ALL_STYLES=$(collect_styles | sort -rn)
TOTAL=$(echo "$ALL_STYLES" | grep -cv "^$" || true)

if [ "$TOTAL" -eq 0 ]; then
  echo "Brak landingów w $LANDING_ROOT"
  exit 0
fi

LAST_10=$(echo "$ALL_STYLES" | head -10)
LAST_5_STYLES=$(echo "$ALL_STYLES" | head -5 | awk '{print $2}')

# ─── --check mode: anti-repetition gate ───
if [ "$MODE" = "--check" ]; then
  if [ -z "$PROPOSED_STYLE" ]; then
    # Bez argumentu — sprawdź ostatni landing (czy wybór się powtarza)
    PROPOSED_STYLE=$(echo "$ALL_STYLES" | head -1 | awk '{print $2}')
    LAST_5_WITHOUT_LAST=$(echo "$ALL_STYLES" | sed -n '2,6p' | awk '{print $2}')
    HITS=$(echo "$LAST_5_WITHOUT_LAST" | grep -cFx "$PROPOSED_STYLE" || true)
    if [ "$HITS" -ge 2 ]; then
      echo "❌ ANTI-REPETITION: '$PROPOSED_STYLE' użyty $HITS× w 5 landingach przed ostatnim"
      echo "   Ostatni landing wybrał styl który już został wyczerpany"
      exit 1
    else
      echo "✅ Ostatni styl '$PROPOSED_STYLE' nie narusza anti-repetition (uses w prev 5: $HITS)"
      exit 0
    fi
  else
    # Z argumentem — sprawdź proponowany styl przeciw last 5
    HITS=$(echo "$LAST_5_STYLES" | grep -cFx "$PROPOSED_STYLE" || true)
    if [ "$HITS" -ge 2 ]; then
      echo "❌ ANTI-REPETITION: '$PROPOSED_STYLE' użyty $HITS× w ostatnich 5 landingach"
      echo "   01-direction.md Krok 9a.2: wyklucz style użyte 2+ razy w ostatnich 5"
      echo ""
      echo "   Ostatnie 5 stylów (najnowsze pierwsze):"
      echo "$ALL_STYLES" | head -5 | awk '{printf "     %s (%s)\n", $2, $3}'
      echo ""
      echo "   Wybierz inny styl z drzewa decyzyjnego (Top-2 / Top-3 z Atlas)"
      exit 1
    else
      echo "✅ '$PROPOSED_STYLE' OK — użyty $HITS× w ostatnich 5 landingach (limit: <2)"
      exit 0
    fi
  fi
fi

# ─── Default: report mode ───
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LANDING STYLE STATS  ·  $TOTAL landingów łącznie"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Last 10 chronologicznie
echo "📅 Ostatnie 10 landingów (najnowsze → najstarsze):"
echo "$LAST_10" | awk '
{
  cmd = "date -d @" $1 " +%Y-%m-%d 2>/dev/null || date -r " $1 " +%Y-%m-%d 2>/dev/null"
  cmd | getline date
  close(cmd)
  printf "   %2d. %-13s  %-25s  %s\n", NR, date, $2, $3
}'

echo ""

# Histogram last 10
echo "📊 Histogram stylów (last 10):"
echo "$LAST_10" | awk '{print $2}' | sort | uniq -c | sort -rn \
  | awk '
{
  count = $1
  $1 = ""
  style = substr($0, 2)
  bar = ""
  for (i = 0; i < count; i++) bar = bar "█"
  warn = (count >= 3) ? "  ⚠️  oversaturated (anti-repetition)" : ""
  printf "   %3d × %-25s  %s%s\n", count, style, bar, warn
}'

echo ""

# Histogram overall
echo "📊 Histogram stylów (wszystkie $TOTAL landingów):"
echo "$ALL_STYLES" | awk '{print $2}' | sort | uniq -c | sort -rn \
  | awk -v total="$TOTAL" '
{
  count = $1
  $1 = ""
  style = substr($0, 2)
  pct = count * 100 / total
  warn = (pct > 20 && total >= 10) ? "  ⚠️  >20% udziału — rozważ dywersyfikację" : ""
  printf "   %3d × %-25s  (%5.1f%%)%s\n", count, style, pct, warn
}'

echo ""

# Anti-repetition status
echo "🔁 Anti-repetition status (Krok 9a.2):"
LAST_5_REPEATED=$(echo "$LAST_5_STYLES" | sort | uniq -c | sort -rn | awk '$1 >= 2 {print $0}')
if [ -z "$LAST_5_REPEATED" ]; then
  echo "   ✅ Ostatnie 5 landingów: różne style (anti-repetition zachowany)"
else
  echo "   ⚠️  Ostatnie 5 landingów ma powtórzenia:"
  echo "$LAST_5_REPEATED" | awk '{
    count = $1
    $1 = ""
    style = substr($0, 2)
    printf "        %d× %s\n", count, style
  }'
  echo "   Następny landing nie powinien wybierać żadnego z powyższych"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Usage:"
echo "  bash scripts/landing-style-stats.sh                     # ten raport"
echo "  bash scripts/landing-style-stats.sh --check             # validate ostatni"
echo "  bash scripts/landing-style-stats.sh --check [style-id]  # validate proposed"
echo "═══════════════════════════════════════════════════════════"
