#!/bin/bash
# verify-brief.sh — sprawdza czy landing-pages/[slug]/_brief.md ma wszystkie 8 sekcji
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
  "10. STYLE LOCK"
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

# Sekcja 10: STYLE LOCK — wymuś konkretny Style ID + min 3 listy MUSZĄ/NIE WOLNO
STYLE_ID=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---/' "$BRIEF" | grep -oE 'Style ID:[*]+[[:space:]]*`[a-z-]+`' | head -1 | sed 's/^[^`]*`//; s/`.*//')
if [ -z "$STYLE_ID" ]; then
  echo "❌ Sekcja 10 STYLE LOCK: brak 'Style ID: \`[style-id]\`'"
  FAIL=1
else
  STYLE_FILE="docs/landing/style-atlas/${STYLE_ID}.md"
  if [ ! -f "$STYLE_FILE" ]; then
    echo "❌ Style ID '$STYLE_ID' nie istnieje w $STYLE_FILE"
    FAIL=1
  else
    echo "  ✅ Style: $STYLE_ID"
  fi
fi

# Sekcja 10: sprawdź że 10.3 MUSZĄ i 10.4 NIE WOLNO wypełnione (min 3 bullet points każde)
MUSZA_COUNT=$(awk '/^### 10\.3 MUSZĄ/,/^### 10\.4/' "$BRIEF" | grep -cE "^- " || true)
NIEWOLNO_COUNT=$(awk '/^### 10\.4 NIE WOLNO/,/^### 10\.5/' "$BRIEF" | grep -cE "^- " || true)
if [ "$MUSZA_COUNT" -lt 3 ]; then
  echo "❌ Sekcja 10.3 MUSZĄ: tylko $MUSZA_COUNT bulletów (min 3)"
  FAIL=1
fi
if [ "$NIEWOLNO_COUNT" -lt 3 ]; then
  echo "❌ Sekcja 10.4 NIE WOLNO: tylko $NIEWOLNO_COUNT bulletów (min 3)"
  FAIL=1
fi

if [ "$FAIL" -eq 1 ]; then
  echo ""
  echo "Brief niekompletny — NIE przechodź do ETAP 2 (docs/landing/02-generate.md)"
  echo "Edytuj: $BRIEF"
  exit 1
fi

echo "✅ Brief $BRIEF kompletny — możesz przejść do ETAP 2"
