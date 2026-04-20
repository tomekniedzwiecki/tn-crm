#!/bin/bash
# verify-all-landings.sh — regression check dla 6 baseline landingów
# Uruchom po każdej zmianie w docs/landing/reference/safety.md lub verify-landing.sh
# Exit 0 = wszystkie passują (lub akceptowalne warns); Exit 1 = co najmniej jeden fail

BASELINES=(paromia h2vital pupilnik kafina vibestrike vitrix)
FAIL=0
WARN=0
PASS=0

echo "═══════════════════════════════════════════════════════════"
echo "  Regression check: ${#BASELINES[@]} baseline landingów"
echo "═══════════════════════════════════════════════════════════"

for slug in "${BASELINES[@]}"; do
  echo ""
  echo "─── $slug ───"

  if [ ! -f "landing-pages/$slug/index.html" ]; then
    echo "  ⚠️  Brak landing-pages/$slug/index.html — pomijam"
    continue
  fi

  # Wykonaj verify-landing, capture exit code
  if bash scripts/verify-landing.sh "$slug" > /tmp/verify-$slug.log 2>&1; then
    echo "  ✅ PASS"
    PASS=$((PASS + 1))
  else
    EC=$?
    if [ "$EC" -eq 2 ]; then
      echo "  ⚠️  WARN (za dużo warningów)"
      WARN=$((WARN + 1))
    else
      echo "  ❌ FAIL"
      FAIL=$((FAIL + 1))
      # Pokaż ostatnie 10 linii błędów
      tail -15 /tmp/verify-$slug.log | grep -E "❌|FAIL" | head -10 | sed 's/^/      /'
    fi
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  RESULT: ✅ $PASS · ⚠️  $WARN · ❌ $FAIL  (z ${#BASELINES[@]})"
echo "═══════════════════════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "❌ Regression FAIL — przegląd nowych reguł SAFETY lub napraw landingi"
  echo "Logi: /tmp/verify-*.log"
  exit 1
fi

if [ "$WARN" -gt 2 ]; then
  echo ""
  echo "⚠️  Za dużo warns ($WARN/${#BASELINES[@]}) — przejrzyj"
  exit 2
fi

echo ""
echo "✅ Wszystkie ${#BASELINES[@]} landingów akceptowalne — OK do commitu"
exit 0
