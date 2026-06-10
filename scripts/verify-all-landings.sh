#!/bin/bash
# verify-all-landings.sh — regression check (v5.0)
#
# CZĘŚĆ A (exit-gate): 6 zamrożonych baseline'ów — kryterium "NIE POGARSZAJ":
#   liczba FAIL per landing nie może WZROSNĄĆ względem snapshotu scripts/baseline-fails.txt
#   (stare landingi mają znane, zamrożone FAILe — grandfathered; absolutne 0 FAIL
#   obowiązuje tylko NOWE landingi przez pre-commit hook).
# CZĘŚĆ B (WARN-only, nie blokuje): "extended" = 3 najnowsze briefy + żywe kampanie
#   z scripts/live-landings.txt — dotąd regression chronił 14% portfolio i POMIJAŁ
#   strony, które zarabiają.
#
# Snapshot aktualizujesz ŚWIADOMIE: bash scripts/verify-all-landings.sh --update-snapshot
#   (tylko gdy spadek FAIL-i jest zamierzony — np. naprawiłeś landing)

BASELINES=(paromia h2vital pupilnik kafina vibestrike vitrix)
SNAPSHOT="scripts/baseline-fails.txt"
LIVE_LIST="scripts/live-landings.txt"

count_fails() {
  # liczba realnych FAIL-checków z loga (linie "  ❌ " — bez linii podsumowań)
  # UWAGA: grep -c sam drukuje 0 przy braku trafień (i zwraca exit 1) — bez || echo
  local n
  n=$(grep -cE "^  ❌ " "$1" 2>/dev/null)
  echo "${n:-0}"
}

if [ "$1" = "--update-snapshot" ]; then
  : > "$SNAPSHOT"
  for slug in "${BASELINES[@]}"; do
    [ -f "landing-pages/$slug/index.html" ] || continue
    bash scripts/verify-landing.sh "$slug" > "/tmp/verify-$slug.log" 2>&1 || true
    echo "$slug $(count_fails /tmp/verify-$slug.log)" >> "$SNAPSHOT"
  done
  echo "✅ Snapshot zapisany: $SNAPSHOT"
  cat "$SNAPSHOT"
  exit 0
fi

echo "═══════════════════════════════════════════════════════════"
echo "  Regression check v5.0: ${#BASELINES[@]} baseline + extended"
echo "═══════════════════════════════════════════════════════════"

REGRESSED=0

# ── CZĘŚĆ A: zamrożone baseline'y (exit-gate "nie pogarszaj") ──
for slug in "${BASELINES[@]}"; do
  echo ""
  echo "─── $slug ───"
  if [ ! -f "landing-pages/$slug/index.html" ]; then
    echo "  ⚠️  Brak landing-pages/$slug/index.html — pomijam"
    continue
  fi
  bash scripts/verify-landing.sh "$slug" > "/tmp/verify-$slug.log" 2>&1 || true
  NOW=$(count_fails "/tmp/verify-$slug.log")
  KNOWN=$(grep -E "^$slug " "$SNAPSHOT" 2>/dev/null | awk '{print $2}')
  KNOWN=${KNOWN:-0}
  if [ "$NOW" -le "$KNOWN" ]; then
    if [ "$NOW" -eq 0 ]; then
      echo "  ✅ 0 FAIL"
    else
      echo "  ✅ $NOW FAIL (znane/grandfathered, snapshot: $KNOWN — nie pogorszone)"
    fi
    if [ "$NOW" -lt "$KNOWN" ]; then
      echo "     ℹ️  Spadek FAIL ($KNOWN→$NOW) — rozważ: bash scripts/verify-all-landings.sh --update-snapshot"
    fi
  else
    echo "  ❌ REGRESJA: $NOW FAIL vs $KNOWN w snapshocie"
    grep -E "^  ❌ " "/tmp/verify-$slug.log" | head -8 | sed 's/^/      /'
    REGRESSED=$((REGRESSED + 1))
  fi
done

# ── CZĘŚĆ B: extended (WARN-only) — 3 najnowsze briefy + żywe kampanie ──
echo ""
echo "─── extended (WARN-only, nie blokuje) ───"
EXTENDED=$(ls -t landing-pages/*/_brief.md 2>/dev/null | head -3 | sed -E 's|landing-pages/([^/]+)/.*|\1|')
if [ -f "$LIVE_LIST" ]; then
  EXTENDED="$EXTENDED
$(grep -vE '^#|^$' "$LIVE_LIST")"
fi
EXTENDED=$(echo "$EXTENDED" | sort -u | grep -v '^$')
for slug in $EXTENDED; do
  # pomiń jeśli już w baseline
  case " ${BASELINES[*]} " in *" $slug "*) continue;; esac
  [ -f "landing-pages/$slug/index.html" ] || continue
  bash scripts/verify-landing.sh "$slug" > "/tmp/verify-$slug.log" 2>&1 || true
  NOW=$(count_fails "/tmp/verify-$slug.log")
  if [ "$NOW" -eq 0 ]; then
    echo "  ✅ $slug: 0 FAIL"
  else
    echo "  ⚠️  $slug: $NOW FAIL (extended — raportowane, nie blokuje; log: /tmp/verify-$slug.log)"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
if [ "$REGRESSED" -gt 0 ]; then
  echo "GATE: FAIL ($REGRESSED landingów POGORSZONYCH vs snapshot)"
  echo "❌ Regression — nowa reguła psuje istniejące baseline'y; cofnij regułę albo napraw landingi"
  exit 1
fi
echo "GATE: PASS"
echo "✅ Zero regresji względem snapshotu — OK do commitu"
exit 0
