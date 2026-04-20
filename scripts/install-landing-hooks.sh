#!/bin/bash
# install-landing-hooks.sh — instaluje git pre-commit hook egzekwujący verify-landing.sh
#
# Użycie: bash scripts/install-landing-hooks.sh
# Odinstalować: rm .git/hooks/pre-commit
#
# Co robi hook:
# 1. Dla każdego staged `landing-pages/*/index.html` uruchamia verify-landing.sh
# 2. Jeśli 0 FAIL → commit przechodzi
# 3. Jeśli ≥1 FAIL → commit zablokowany, user musi naprawić
#
# Motywacja: KidSnap landing wylądował commitowany w stanie naruszającym 10+
# safety rules (brak html.js gate, brak subset=latin-ext, dropshipping fraza,
# zero JS effects). Procedura go nie zablokowała — pre-commit hook zablokuje.

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$REPO_ROOT/.git/hooks/pre-commit"

if [ -f "$HOOK_PATH" ]; then
  echo "⚠️  Pre-commit hook już istnieje: $HOOK_PATH"
  read -p "Nadpisać? (y/N): " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Anulowane."
    exit 0
  fi
fi

cat > "$HOOK_PATH" <<'HOOK'
#!/bin/bash
# Pre-commit hook: egzekwuje verify-landing.sh na staged landing HTML files.
# Zainstalowany przez scripts/install-landing-hooks.sh

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Znajdz staged landing HTML files
STAGED_LANDINGS=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "^landing-pages/[^/]+/index\.html$" || true)

if [ -z "$STAGED_LANDINGS" ]; then
  # Brak staged landing HTML — hook nic nie robi
  exit 0
fi

echo ""
echo "🔍 Pre-commit hook: verify-landing.sh dla staged landingów..."
echo ""

ANY_FAIL=0
for FILE in $STAGED_LANDINGS; do
  SLUG=$(echo "$FILE" | sed -E 's|^landing-pages/([^/]+)/index\.html$|\1|')
  echo "─── $SLUG ───"

  # Uruchom verify i przechwyć output
  OUTPUT=$(bash scripts/verify-landing.sh "$SLUG" 2>&1 || true)

  # Pokaż summary
  echo "$OUTPUT" | grep -E "SUMMARY|❌" | head -12

  # Sprawdź czy jest FAIL
  if echo "$OUTPUT" | grep -qE "SUMMARY.*❌[[:space:]]*[1-9]"; then
    ANY_FAIL=1
    echo ""
    echo "❌ $SLUG ma FAIL — commit zablokowany"
  else
    echo "✅ $SLUG OK"
  fi
  echo ""
done

if [ "$ANY_FAIL" -eq 1 ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  COMMIT ZABLOKOWANY przez pre-commit hook"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo "Napraw ❌ FAIL'e w verify-landing.sh przed ponowną próbą."
  echo ""
  echo "Aby pominąć hook (NIE ZALECANE — deploy może łamać safety):"
  echo "  git commit --no-verify ..."
  echo ""
  echo "Aby odinstalować hook:"
  echo "  rm .git/hooks/pre-commit"
  exit 1
fi

exit 0
HOOK

chmod +x "$HOOK_PATH"

echo ""
echo "✅ Pre-commit hook zainstalowany: $HOOK_PATH"
echo ""
echo "Od teraz przy każdym 'git commit' z landing HTML w stagingu:"
echo "  1. verify-landing.sh uruchamia się automatycznie"
echo "  2. Jeśli ≥1 FAIL → commit zablokowany"
echo "  3. Aby pominąć: git commit --no-verify (nie zalecane)"
echo ""
echo "Odinstalowanie: rm .git/hooks/pre-commit"
