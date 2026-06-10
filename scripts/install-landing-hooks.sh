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
# safety rules (brak html.js gate, dropshipping fraza,
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
# Pre-commit hook v5.0: verify-landing + verify-style-lock na staged landing HTML
# + verify-docs na staged docs/landing|scripts. Zainstalowany przez install-landing-hooks.sh

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

ANY_FAIL=0

# ── Część A: staged landing HTML ──
STAGED_LANDINGS=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "^landing-pages/[^/]+/index\.html$" || true)

for FILE in $STAGED_LANDINGS; do
  SLUG=$(echo "$FILE" | sed -E 's|^landing-pages/([^/]+)/index\.html$|\1|')
  echo "─── $SLUG ───"

  OUTPUT=$(bash scripts/verify-landing.sh "$SLUG" 2>&1 || true)
  echo "$OUTPUT" | grep -E "GATE:|SUMMARY|❌" | head -12

  VL_FAIL=0
  if echo "$OUTPUT" | grep -qE "^GATE: FAIL"; then
    VL_FAIL=1
  fi

  # verify-style-lock (v5.0 hybrydowy — REQUIRED z lock-* briefu, FORBIDDEN per styl)
  SL_FAIL=0
  if [ -f "scripts/verify-style-lock.sh" ] && [ -f "landing-pages/$SLUG/_brief.md" ]; then
    SL_OUTPUT=$(bash scripts/verify-style-lock.sh "$SLUG" 2>&1 || true)
    echo "$SL_OUTPUT" | grep -E "GATE:|❌ (MUSI|ZAKAZ|STYLE LOCK FAIL)" | head -10
    if echo "$SL_OUTPUT" | grep -qE "STYLE LOCK FAIL"; then
      SL_FAIL=1
    fi
  fi

  if [ "$VL_FAIL" = "1" ] || [ "$SL_FAIL" = "1" ]; then
    ANY_FAIL=1
    echo ""
    echo "❌ $SLUG ma FAIL (verify-landing=$VL_FAIL, verify-style-lock=$SL_FAIL) — commit zablokowany"
    if [ "$SL_FAIL" = "1" ]; then
      echo "   Paleta/fonty BRANDU klienta? → dodaj linie lock-* do _brief.md sekcji 10"
      echo "   (instrukcja w outputcie verify-style-lock), NIE --no-verify!"
    fi
  else
    echo "✅ $SLUG OK (verify-landing + verify-style-lock)"
  fi
  echo ""
done

# ── Część B: staged docs procedury / skrypty → verify-docs ──
STAGED_DOCS=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "^(docs/landing/|scripts/|CLAUDE\.md)" | grep -v "_research" || true)
if [ -n "$STAGED_DOCS" ] && [ -f "scripts/verify-docs.sh" ]; then
  echo "─── verify-docs (spójność procedury) ───"
  if ! bash scripts/verify-docs.sh > /tmp/verify-docs-out.txt 2>&1; then
    cat /tmp/verify-docs-out.txt | grep -E "❌|GATE:" | head -12
    ANY_FAIL=1
    echo "❌ verify-docs FAIL — procedura zawiera regresję"
  else
    echo "✅ verify-docs OK"
  fi
  echo ""
fi

if [ "$ANY_FAIL" -eq 1 ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  COMMIT ZABLOKOWANY przez pre-commit hook"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo "Napraw ❌ FAIL'e przed ponowną próbą. --no-verify TYLKO dla hotfixów"
  echo "z follow-up fix commitem w tej samej sesji (CLAUDE.md zasada 4)."
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
