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

# Sekcja 10 (v5.0): maszynowe linie lock-* — REQUIRED tokeny dla verify-style-lock.sh
# Nowe briefy MUSZĄ je mieć (template v5.0 je zawiera); puste placeholdery [..] = niewypełnione
LOCK_LINES=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---/' "$BRIEF" | tr -d '\r' | grep -cE '^lock-(font-[a-z]+|hex):' || true)
LOCK_PLACEHOLDERS=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---/' "$BRIEF" | tr -d '\r' | grep -cE '^lock-(font-[a-z]+|hex):.*\[' || true)
if [ "$LOCK_LINES" -eq 0 ]; then
  echo "❌ Sekcja 10: brak maszynowych linii lock-* (v5.0) — dodaj lock-font-display/lock-font-body + min 3× lock-hex z FAKTYCZNYMI tokenami landingu"
  FAIL=1
elif [ "$LOCK_PLACEHOLDERS" -gt 0 ]; then
  echo "❌ Sekcja 10: $LOCK_PLACEHOLDERS linii lock-* ma niewypełnione placeholdery [..]"
  FAIL=1
else
  echo "  ✅ Lock tokens: $LOCK_LINES linii lock-*"
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

# ═══ v5.0: sekcje 12 (Mapa obiekcji) i 13 (Big Idea + VOC + Liczby kanoniczne) ═══
# Gate dla NOWYCH briefów (template v5.0 je zawiera); stare briefy nie przechodzą przez
# verify-brief retroaktywnie (gate działa tylko ETAP 1→2).

# 12. Mapa obiekcji: nagłówek + ≥5 linii z "→ sekcja:"
if ! grep -q "^## 12\. Mapa obiekcji" "$BRIEF"; then
  echo "❌ Brak sekcji: 12. Mapa obiekcji (v5.0)"
  FAIL=1
else
  OBJ_COUNT=$(awk '/^## 12\. Mapa obiekcji/,/^## 13\.|^---/' "$BRIEF" | grep -cE "→ sekcja:" || true)
  OBJ_PLACEHOLDERS=$(awk '/^## 12\. Mapa obiekcji/,/^## 13\.|^---/' "$BRIEF" | grep -cE "\[obiekcja" || true)
  if [ "$OBJ_COUNT" -lt 5 ]; then
    echo "❌ Sekcja 12: tylko $OBJ_COUNT/5 obiekcji w formacie '[obiekcja] → sekcja: X → rozbrojenie: ...'"
    FAIL=1
  elif [ "$OBJ_PLACEHOLDERS" -gt 0 ]; then
    echo "❌ Sekcja 12: $OBJ_PLACEHOLDERS niewypełnionych placeholderów [obiekcja...]"
    FAIL=1
  else
    echo "  ✅ Mapa obiekcji: $OBJ_COUNT obiekcji"
  fi
fi

# 13. Big Idea: linie maszynowe big-idea/mechanism/awareness + VOC + liczby kanoniczne
if ! grep -q "^## 13\." "$BRIEF"; then
  echo "❌ Brak sekcji: 13. Big Idea + VOC + Liczby kanoniczne (v5.0)"
  FAIL=1
else
  SEC13=$(awk '/^## 13\./,/^## 14\.|^---$/' "$BRIEF" | tr -d '\r')
  for key in big-idea mechanism awareness; do
    LINE=$(echo "$SEC13" | grep -E "^${key}:" | head -1 || true)
    if [ -z "$LINE" ]; then
      echo "❌ Sekcja 13: brak linii '${key}:'"
      FAIL=1
    elif echo "$LINE" | grep -qE "\["; then
      echo "❌ Sekcja 13: '${key}:' ma niewypełniony placeholder"
      FAIL=1
    fi
  done
  AWARENESS=$(echo "$SEC13" | grep -E "^awareness:" | head -1 | sed 's/^awareness:[[:space:]]*//' || true)
  if [ -n "$AWARENESS" ] && ! echo "$AWARENESS" | grep -qE "^(problem-aware|solution-aware|product-aware)"; then
    echo "❌ Sekcja 13: awareness musi być jednym z: problem-aware / solution-aware / product-aware (jest: $AWARENESS)"
    FAIL=1
  fi
  if ! echo "$SEC13" | grep -qE "VOC|pain:|benefit:"; then
    echo "❌ Sekcja 13: brak bloku VOC (frazy LUB linia 'VOC: BRAK DANYCH — powód')"
    FAIL=1
  fi
  NUM_ROWS=$(echo "$SEC13" | grep -cE "^\|[^|]+\|[^|]+\|[^|]+\|" || true)
  if [ "$NUM_ROWS" -lt 3 ]; then
    echo "❌ Sekcja 13: tabela Liczb kanonicznych ma $NUM_ROWS wierszy (min 3 z nagłówkiem)"
    FAIL=1
  fi
  if [ "$FAIL" -eq 0 ]; then
    echo "  ✅ Big Idea (awareness: ${AWARENESS:-?}) + VOC + liczby kanoniczne"
  fi
fi

if [ "$FAIL" -eq 1 ]; then
  echo ""
  echo "Brief niekompletny — NIE przechodź do ETAP 2 (docs/landing/02-generate.md)"
  echo "Edytuj: $BRIEF"
  exit 1
fi

echo "✅ Brief $BRIEF kompletny — możesz przejść do ETAP 2"
