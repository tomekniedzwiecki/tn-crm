#!/bin/bash
# verify-brief.sh — sprawdza czy landing-pages/[slug]/_brief.md ma wszystkie 9 sekcji
# Wywołanie: bash scripts/verify-brief.sh [slug]
# Exit 0 = brief kompletny; Exit 1 = brief niekompletny (BLOKUJE ETAP 2)

set -e
SLUG="$1"
BRIEF="landing-pages/$SLUG/_brief.md"

[ -z "$SLUG" ] && echo "Usage: verify-brief.sh [slug]" && exit 1
[ ! -f "$BRIEF" ] && echo "❌ Brak $BRIEF — wróć do ETAP 1 (docs/landing/01-direction.md)" && exit 1

REQUIRED=(
  "1. Kierunek manifesta"
  "2. Moodboard"
  "3. Paleta"
  "4. Typografia"
  "5. Persona"
  "6. Anty-referencje"
  "7. Test anty-generic"
  "8. Signature element"
  "9. Paradigm architektury"
)

FAIL=0
for section in "${REQUIRED[@]}"; do
  if ! grep -q "^## $section" "$BRIEF"; then
    echo "❌ Brak sekcji: $section"
    FAIL=1
  fi
done

# Sprawdź że któryś checkbox w sekcji 1 (Kierunek) jest zaznaczony
if ! awk '/^## 1\. Kierunek/,/^## 2\./' "$BRIEF" | grep -q "^- \[x\]\|^- \[X\]"; then
  echo "❌ Żaden kierunek nie jest wybrany w sekcji 1 (brak [x])"
  FAIL=1
fi

# Sprawdź że moodboard ma 3 marki (3 numerowane wpisy)
MOODBOARD_COUNT=$(awk '/^## 2\. Moodboard/,/^## 3\./' "$BRIEF" | grep -cE "^[0-9]\.\s+\*\*" || true)
if [ "$MOODBOARD_COUNT" -lt 3 ]; then
  echo "❌ Moodboard ma $MOODBOARD_COUNT/3 marek wypełnionych (potrzebne 3)"
  FAIL=1
fi

# Sprawdź że paleta ma wartości HEX (nie placeholder ______)
PALETA_PLACEHOLDERS=$(awk '/^## 3\. Paleta/,/^## 4\./' "$BRIEF" | grep -c "______" || true)
if [ "$PALETA_PLACEHOLDERS" -gt 1 ]; then
  echo "❌ Paleta ma $PALETA_PLACEHOLDERS niewypełnionych pól (______)"
  FAIL=1
fi

# Sekcja 6: Anty-referencje — sprawdź czy jest wypełniona (więcej niż 50 znaków user contentu poza nagłówkami)
ANTYREF_LEN=$(awk '/^## 6\. Anty-referencje/,/^## 7\./' "$BRIEF" | grep -vE "^##|^>" | tr -d '[:space:]' | wc -c)
if [ "$ANTYREF_LEN" -lt 50 ]; then
  echo "❌ Sekcja 6 (Anty-referencje) niewypełniona ($ANTYREF_LEN znaków)"
  FAIL=1
fi

# Sprawdź że test anty-generic ma wszystkie 4 zaznaczone (TAK)
ANTYGENERIC_COUNT=$(awk '/^## 7\. Test anty-generic/,/^## 8\./' "$BRIEF" | grep -cE "^- \[x\]|^- \[X\]" || true)
if [ "$ANTYGENERIC_COUNT" -lt 4 ]; then
  echo "❌ Test anty-generic ma $ANTYGENERIC_COUNT/4 odpowiedzi TAK"
  FAIL=1
fi

# Sekcja 9: Paradigm architektury — sprawdź że jest wybrany paradygmat (słowa kluczowe) + structural signature tabela
PARADIGM_LEN=$(awk '/^## 9\. Paradigm/,0' "$BRIEF" | grep -vE "^##|^>" | tr -d '[:space:]' | wc -c)
if [ "$PARADIGM_LEN" -lt 100 ]; then
  echo "❌ Sekcja 9 (Paradigm architektury) niewypełniona ($PARADIGM_LEN znaków — wymagane 100+)"
  FAIL=1
fi

# Sekcja 9 MUSI zawierać nazwę paradygmatu z taksonomii 12
if ! awk '/^## 9\. Paradigm/,0' "$BRIEF" | grep -qiE "cinematic|platform breadth|editorial|manifesto|dashboard|comparison grid|configurator|spec waterfall|scrollytelling|founder-led|moment|ritual|quiz-first|prompt-as-hero"; then
  echo "❌ Sekcja 9: brak wybranego paradygmatu z taksonomii 12 (musi zawierać nazwę np. 'Dashboard-style', 'Scrollytelling', 'Editorial', 'Cinematic launch', itd.)"
  FAIL=1
fi

if [ "$FAIL" -eq 1 ]; then
  echo ""
  echo "Brief niekompletny — NIE przechodź do ETAP 2 (docs/landing/02-generate.md)"
  echo "Edytuj: $BRIEF"
  exit 1
fi

echo "✅ Brief $BRIEF kompletny — możesz przejść do ETAP 2"
