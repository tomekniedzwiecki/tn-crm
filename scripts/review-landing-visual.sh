#!/bin/bash
# review-landing-visual.sh — Visual Quality Gate (ETAP 5.5)
#
# Bez tego skryptu verify-landing.sh łapie tylko grep-violations (safety, długość).
# Tu wymuszamy że Claude oglądnął screenshoty + zapisał per-sekcja ocenę.
#
# Usage:
#   bash scripts/review-landing-visual.sh [slug]              # Print prompt template
#   bash scripts/review-landing-visual.sh [slug] --check      # Validate review file
#
# Default mode (prompt):
#   - Sprawdza że _shots/ istnieją
#   - Drukuje structured prompt który Claude w sesji wypełnia używając Read tool na PNG
#   - Output Claude'a → landing-pages/[slug]/_visual-review.md
#
# --check mode (validation gate):
#   - Sprawdza że _visual-review.md istnieje
#   - Mtime > index.html mtime (review świeży, nie dotyczy starszej wersji)
#   - Min 3 sekcje viewportów (desktop/tablet/mobile)
#   - Min 8 verdyktów per-sekcja (PASS/WARN/FAIL)
#   - 0 FAIL — bo FAIL = blokada deployu
#
# Egzekwuje feedback-landing-polish-required.md („każda sekcja dopieszczona wizualnie").

set -e

SLUG="${1:-}"
MODE="${2:-prompt}"
[ "$SLUG" = "--check" ] && { echo "Usage: $0 [slug] [--check]"; exit 1; }

if [ -z "$SLUG" ]; then
  echo "Usage:"
  echo "  $0 [slug]              # Print prompt for Claude"
  echo "  $0 [slug] --check      # Validate review file"
  exit 1
fi

LANDING_DIR="landing-pages/$SLUG"
HTML="$LANDING_DIR/index.html"
SHOTS="$LANDING_DIR/_shots"
BRIEF="$LANDING_DIR/_brief.md"
REVIEW="$LANDING_DIR/_visual-review.md"

[ ! -f "$HTML" ] && echo "❌ Brak $HTML" && exit 1

# ───────────────────────────────────────────────
# --check mode: validate that review exists and is fresh
# ───────────────────────────────────────────────
if [ "$MODE" = "--check" ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  VISUAL REVIEW CHECK: $SLUG"
  echo "═══════════════════════════════════════════════════════════"
  echo ""

  if [ ! -f "$REVIEW" ]; then
    echo "❌ Brak $REVIEW"
    echo ""
    echo "Wymagane: zacząć od:"
    echo "  bash scripts/screenshot-landing.sh $SLUG    # generuj screenshoty"
    echo "  bash scripts/review-landing-visual.sh $SLUG # wypisz prompt"
    echo "  → Claude czyta screenshoty + zapisuje $REVIEW"
    exit 1
  fi

  # Mtime: review nie może być starszy niż index.html
  if MTIME_HTML=$(stat -c %Y "$HTML" 2>/dev/null); then :;
  elif MTIME_HTML=$(stat -f %m "$HTML" 2>/dev/null); then :;
  else MTIME_HTML=0; fi
  if MTIME_REV=$(stat -c %Y "$REVIEW" 2>/dev/null); then :;
  elif MTIME_REV=$(stat -f %m "$REVIEW" 2>/dev/null); then :;
  else MTIME_REV=0; fi

  if [ "$MTIME_REV" -lt "$MTIME_HTML" ]; then
    DIFF=$(( (MTIME_HTML - MTIME_REV) / 60 ))
    echo "❌ $REVIEW jest STARSZY niż index.html o $DIFF min"
    echo "   Review nie dotyczy aktualnej wersji landingu — wygeneruj ponownie"
    exit 1
  fi

  PASS=0
  FAIL=0

  # Sprawdź obecność trzech viewportów
  for vp in "Desktop" "Tablet" "Mobile"; do
    if grep -qE "^## .*${vp}" "$REVIEW"; then
      echo "  ✅ Sekcja $vp obecna"
      PASS=$((PASS + 1))
    else
      echo "  ❌ Brak sekcji $vp w review"
      FAIL=$((FAIL + 1))
    fi
  done

  # Min 8 verdyktów (PASS / WARN / FAIL bullet points)
  VERDICTS=$(grep -ciE "^[[:space:]]*-[[:space:]]*(PASS|WARN|FAIL|✅|⚠️|❌)" "$REVIEW" || true)
  if [ "$VERDICTS" -ge 8 ]; then
    echo "  ✅ Verdykty per-sekcja: $VERDICTS (min 8)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ Tylko $VERDICTS verdyktów (min 8 — np. po 3-4 per viewport)"
    FAIL=$((FAIL + 1))
  fi

  # 0 FAIL verdyktów — bo FAIL = blokada
  FAIL_VERDICTS=$(grep -cE "^[[:space:]]*-[[:space:]]*(FAIL|❌)" "$REVIEW" || true)
  if [ "$FAIL_VERDICTS" -eq 0 ]; then
    echo "  ✅ Zero FAIL verdyktów"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $FAIL_VERDICTS FAIL verdyktów w review — napraw przed deployem"
    grep -nE "^[[:space:]]*-[[:space:]]*(FAIL|❌)" "$REVIEW" | head -5 | sed 's/^/      /'
    FAIL=$((FAIL + 1))
  fi

  # Verdict overall
  if grep -qiE "^(verdict|werdykt):.*(go|deploy|ok|ship|gotowe)" "$REVIEW"; then
    echo "  ✅ Overall verdict: GO"
    PASS=$((PASS + 1))
  elif grep -qiE "^(verdict|werdykt):.*(no-go|block|stop|napraw)" "$REVIEW"; then
    echo "  ❌ Overall verdict: NO-GO (Claude oznaczył review jako blokujący)"
    FAIL=$((FAIL + 1))
  else
    echo "  ⚠️  Brak jednolitego verdyktu na końcu (oczekiwane: 'Verdict: GO' lub 'Verdict: NO-GO')"
  fi

  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  SUMMARY: ✅ $PASS · ❌ $FAIL"
  echo "═══════════════════════════════════════════════════════════"

  if [ "$FAIL" -gt 0 ]; then
    echo "❌ Visual review niekompletny lub blokujący"
    exit 1
  fi
  echo "✅ Visual review OK — landing przeszedł gate jakości wizualnej"
  exit 0
fi

# ───────────────────────────────────────────────
# Default mode: print prompt for Claude
# ───────────────────────────────────────────────

# Sprawdź że screenshoty istnieją
if [ ! -d "$SHOTS" ] || [ ! -f "$SHOTS/desktop_full.png" ]; then
  echo "❌ Brak screenshotów w $SHOTS"
  echo "   Najpierw: bash scripts/screenshot-landing.sh $SLUG"
  exit 1
fi

# Wczytaj Style ID z briefa (jeśli jest)
STYLE_ID=""
SIGNATURE=""
if [ -f "$BRIEF" ]; then
  STYLE_ID=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---$/' "$BRIEF" 2>/dev/null \
    | grep -oE 'Style ID:[*]+[[:space:]]*`[a-z-]+`' | head -1 \
    | sed 's/^[^`]*`//; s/`.*//')
  SIGNATURE=$(awk '/^## 8\. Signature/,/^## 9\.|^---$/' "$BRIEF" 2>/dev/null \
    | grep -v "^##\|^>" | grep -v "^$" | head -3 | tr '\n' ' ')
fi

# Lista plików screenshot do obejrzenia (relative paths z root repo)
DESKTOP_FULL="$SHOTS/desktop_full.png"
TABLET_FULL="$SHOTS/tablet_full.png"
MOBILE_FULL="$SHOTS/mobile_full.png"
DESKTOP_HERO="$SHOTS/desktop_y900.png"
DESKTOP_BENTO="$SHOTS/desktop_y2000.png"
DESKTOP_OFFER="$SHOTS/desktop_y7000.png"
MOBILE_HERO="$SHOTS/mobile_y900.png"
MOBILE_OFFER="$SHOTS/mobile_y5000.png"

cat <<EOF

═══════════════════════════════════════════════════════════
  VISUAL REVIEW PROMPT — $SLUG
$([ -n "$STYLE_ID" ] && echo "  Style: $STYLE_ID")
═══════════════════════════════════════════════════════════

Przeczytaj screenshoty Read tool'em (PNG są obsługiwane jako image content):

  Pełnostronicowe (overview):
    $DESKTOP_FULL
    $TABLET_FULL
    $MOBILE_FULL

  Sekcje kluczowe (deep dive):
    $DESKTOP_HERO     (hero + nav)
    $DESKTOP_BENTO    (features / atelier)
    $DESKTOP_OFFER    (offer box)
    $MOBILE_HERO      (mobile hero — często breakpointy zjadają CTA)
    $MOBILE_OFFER     (mobile offer)

KONTEKST (z _brief.md):
$([ -n "$STYLE_ID" ] && echo "  Style atlas: docs/landing/style-atlas/${STYLE_ID}.md (przeczytaj sekcje 5/7/8/12)")
$([ -n "$SIGNATURE" ] && echo "  Signature element zadeklarowany: $SIGNATURE")

ZADANIE — zapisz raport do $REVIEW w formacie:

────────────────────────────────────────────────
# Visual Review — $SLUG
> Generated: [data ISO]

## Desktop (1440×900)

- ✅ Hero: [czego oceniłeś + dlaczego pass]
- ⚠️ Features bento: [co warto poprawić, ale nie blokuje]
- ❌ [tylko gdy coś naprawdę psuje konwersję]
... (min 3-4 verdykty)

## Tablet (768×1024)

- ✅ ...
- ⚠️ ...
... (min 2-3 verdykty)

## Mobile (375×812)

- ✅ Hero: [CTA widoczna nad fold? touch target ≥44px?]
- ⚠️ ...
... (min 3-4 verdykty)

## Wnioski

[1-2 zdania: co jest mocne, co warto by polepszyć w v2]

Verdict: GO  (lub NO-GO jeśli ≥1 FAIL)
────────────────────────────────────────────────

KRYTERIA OCENY (dla każdej sekcji uwzględnij):

1. **Hierarchia wizualna** — czy headline jest pierwsze co przyciąga wzrok?
2. **Signature element** — czy jest obecny i czytelny? ($SIGNATURE)
3. **Kontrast i czytelność** — jakieś teksty zlewają się z tłem?
4. **Spacing i rytm** — czy padding sekcji są spójne, czy jakaś wygląda "na ścisk"?
5. **CTA widoczne** — primary CTA dla każdego viewportu w pierwszym foldzie? Touch target ≥44px na mobile?
6. **Polskie diakrytyki** — Ł/Ś/Ć/Ź/Ż w UPPERCASE wyświetlają się z prawidłowym line-height?
7. **Placeholder vs zdjęcia AI** — jeśli AI obrazy są, czy są spójne wizualnie? Jeśli placeholdery, czy mają brief 4-polowy?
8. **Spójność ze stylem** — czy landing wygląda jak deklarowany styl ($STYLE_ID), czy dryfuje w kierunku innego?
9. **🌬️ SCROLLABILITY (v4.3 — KRYTYCZNE)** — czy landing **oddycha**? Konkret:
   - Czy patrząc na ten landing **chce ci się go dalej scrollować**, czy zamiast tego czujesz "to research paper, zaraz odbiję"?
   - Czy są oddychające momenty (lifestyle photo na pełną szerokość, single big quote, manifesto-style sekcja) co 2-3 sekcje, czy jest **wall of data** (3+ tabel/spec-list/KPI po sobie)?
   - Czy hero ma **breathing room** (min 80vh, dominujący 1 element), czy jest **squeeze** (3 rzeczy upchnięte w 60vh)?
   - Czy w testimonialach widać **twarze i osoby** (lifestyle photos), czy tylko **inicjały-w-kółku + cytat** (sterile)?
   - Czy w hero jest **1 mocna liczba** (np. „99% sierści") czy **5 słabych** („99%, 62.3 dB, HEPA 13, EN 1822, p<0.01")?
   - **Verdict scrollability: PASS / WARN / FAIL** — to ma być explicit verdict w raporcie.

   **Sygnały że landing jest "ciężki" (FAIL):**
   - Sekcja research-evidence z tabelą 3+ badań klinicznych z normami (PN-EN ISO X)
   - 3+ KPI dashboards/spec-tables jeden za drugim
   - Hero ma 5+ liczb w pierwszym foldzie (3 spec rows w hero-figure)
   - Brak ani jednego full-bleed lifestyle photo w pierwszych 3 sekcjach
   - Mono fonts dominują w body (nie tylko w spec/labels)

   **Sygnały że landing oddycha (PASS):**
   - Hero pełnoekranowy z 1 dominującym elementem (zdjęcie produkt w użyciu)
   - "Trzy akty. Bez Ciebie." style — krótkie italics, lifestyle storytelling
   - Whitespace 120px+ między sekcjami widoczny
   - Lifestyle photos pojawiają się 3-5× w landingu (nie tylko packshoty)
   - Klient mógłby przelecieć landing scrollując 1× bez czytania i zostać z 1 wyraźną emocją/wartością

10. **Density verdict (v4.3)** — policz w głowie:
    - Liczb (digit + jednostka): __ (target ≤12, hard limit 12)
    - Dense sections (KPI/spec/research/roster/versus): __ (target ≤2)
    - Lifestyle photos: __ (target ≥3)
    - Jeśli któryś przekroczony → **FAIL z konkretnym wskazaniem co skrócić**.

VERDICTS:
- ✅ PASS — sekcja gotowa do produkcji
- ⚠️ WARN — działa ale można poprawić w v2 (nie blokuje deployu)
- ❌ FAIL — łamie konwersję / czytelność / brand (blokuje deploy)

NIE używaj ✅/⚠️/❌ na zasadzie "wszystko ok" — dla każdego verdyktu napisz KONKRETNĄ obserwację (1 zdanie, czego dotyczy).

═══════════════════════════════════════════════════════════
Po wypełnieniu uruchom walidację:
  bash scripts/review-landing-visual.sh $SLUG --check
═══════════════════════════════════════════════════════════
EOF
