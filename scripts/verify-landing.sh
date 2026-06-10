#!/bin/bash
# verify-landing.sh — one-command weryfikacja landinga
#
# Użycie: ./scripts/verify-landing.sh [slug]
# Przykład: ./scripts/verify-landing.sh vitrix
#
# Wykonuje:
# 1. Grep sanity checks (z CLAUDE_LANDING_REVIEW.md sekcja 0)
# 2. Layout discipline checks (z CLAUDE_LANDING_DESIGN.md sekcja G)
# 3. Playwright screenshoty 3 viewports
# 4. Report pass/fail

set -e

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Użycie: $0 [slug]"
  echo "Przykład: $0 vitrix"
  exit 1
fi

FILE="landing-pages/$SLUG/index.html"
if [ ! -f "$FILE" ]; then
  echo "❌ Brak pliku: $FILE"
  exit 1
fi

PASS=0
FAIL=0
WARN=0

check() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  local severity="${4:-fail}"  # fail / warn
  if [ "$expected" = "$actual" ]; then
    echo "  ✅ $label"
    PASS=$((PASS + 1))
  else
    if [ "$severity" = "warn" ]; then
      echo "  ⚠️  $label (expected: $expected, got: $actual)"
      WARN=$((WARN + 1))
    else
      echo "  ❌ $label (expected: $expected, got: $actual)"
      FAIL=$((FAIL + 1))
    fi
  fi
}

check_range() {
  local label="$1"
  local min="$2"
  local max="$3"
  local actual="$4"
  if [ "$actual" -ge "$min" ] && [ "$actual" -le "$max" ]; then
    echo "  ✅ $label ($actual)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $label (expected $min-$max, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  VERIFY LANDING: $SLUG"
echo "  File: $FILE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ─── 0. Style Lock load (v4.0) ───
# Odczytaj Style ID z _brief.md i ustaw flagi co styl pozwala/zakazuje
# Dzięki temu JS effects i sections dopasowują się do stylu (Apothecary nie wymaga split/parallax).
BRIEF="landing-pages/$SLUG/_brief.md"
STYLE_ID=""
STYLE_ALLOWS_SPLIT=1
STYLE_ALLOWS_PARALLAX=1
STYLE_ALLOWS_MAGNETIC=1
STYLE_ALLOWS_TILT=1
STYLE_ALLOWS_COUNTER=1
STYLE_REQUIRES_STICKY_CTA=1
STYLE_REQUIRES_TRUST_BAR=1

NO_BRIEF=0
if [ -f "$BRIEF" ]; then
  STYLE_ID=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---/' "$BRIEF" | grep -oE 'Style ID:[*]+[[:space:]]*`[a-z-]+`' | head -1 | sed 's/^[^`]*`//; s/`.*//')
else
  NO_BRIEF=1
fi

STYLE_REQUIRES_BENTO=1
STYLE_REQUIRES_HOW_STEPS=1
STYLE_REQUIRES_SOLUTION_BENTO=1

HAS_STYLE=0
REQ_SPLIT=0; REQ_COUNTER=0; REQ_MAGNETIC=0; REQ_TILT=0; REQ_PARALLAX=0
SPLIT_MIN=1; COUNTER_MIN=1; MAGNETIC_MIN=1; TILT_MIN=1; PARALLAX_MIN=1
if [ -n "$STYLE_ID" ] && [ -f "docs/landing/style-atlas/$STYLE_ID.md" ]; then
  HAS_STYLE=1
  STYLE_FILE="docs/landing/style-atlas/$STYLE_ID.md"
  MOTION=$(awk '/^## 10\. Motion Budget/,/^## 11\./' "$STYLE_FILE" || true)
  # Parse tylko js_effects_forbidden (nie required)
  MOTION_FORBIDDEN=$(echo "$MOTION" | awk '/js_effects_forbidden:/,/js_effects_count:|js_effects_required:|^[[:space:]]*`/')

  echo "$MOTION_FORBIDDEN" | grep -q "\.js-split" && STYLE_ALLOWS_SPLIT=0 || true
  echo "$MOTION_FORBIDDEN" | grep -q "\.js-parallax" && STYLE_ALLOWS_PARALLAX=0 || true
  echo "$MOTION_FORBIDDEN" | grep -q "\.magnetic" && STYLE_ALLOWS_MAGNETIC=0 || true
  echo "$MOTION_FORBIDDEN" | grep -q "\.js-tilt" && STYLE_ALLOWS_TILT=0 || true
  echo "$MOTION_FORBIDDEN" | grep -q "\.js-counter" && STYLE_ALLOWS_COUNTER=0 || true

  # v5.0: REQUIRED efekty WYŁĄCZNIE z js_effects_required stylu (koniec globalnych progów —
  # poprzednio verify żądał magnetic≥2/tilt≥2/parallax≥1 globalnie, podczas gdy 4 style je ZAKAZUJĄ)
  MOTION_REQUIRED=$(echo "$MOTION" | awk '/js_effects_required:/,/js_effects_forbidden:|js_effects_count:|^[[:space:]]*```[[:space:]]*$/')
  echo "$MOTION_REQUIRED" | grep -q "\.js-split"    && REQ_SPLIT=1    || true
  echo "$MOTION_REQUIRED" | grep -q "\.js-counter"  && REQ_COUNTER=1  || true
  echo "$MOTION_REQUIRED" | grep -q "\.magnetic"    && REQ_MAGNETIC=1 || true
  echo "$MOTION_REQUIRED" | grep -q "\.js-tilt"     && REQ_TILT=1     || true
  echo "$MOTION_REQUIRED" | grep -q "\.js-parallax" && REQ_PARALLAX=1 || true
  _min() { echo "$MOTION" | grep -oE "$1:[[:space:]]*[0-9]+" | grep -oE '[0-9]+' | head -1; }
  v=$(_min split_min);    [ -n "$v" ] && SPLIT_MIN=$v
  v=$(_min counter_min);  [ -n "$v" ] && COUNTER_MIN=$v
  v=$(_min magnetic_min); [ -n "$v" ] && MAGNETIC_MIN=$v
  v=$(_min tilt_min);     [ -n "$v" ] && TILT_MIN=$v
  v=$(_min parallax_min); [ -n "$v" ] && PARALLAX_MIN=$v
  # min 0 w js_effects_count = efekt opcjonalny, nie wymagany
  [ "$SPLIT_MIN" = "0" ] && REQ_SPLIT=0; [ "$COUNTER_MIN" = "0" ] && REQ_COUNTER=0
  [ "$MAGNETIC_MIN" = "0" ] && REQ_MAGNETIC=0; [ "$TILT_MIN" = "0" ] && REQ_TILT=0
  [ "$PARALLAX_MIN" = "0" ] && REQ_PARALLAX=0

  # Section Architecture forbidden
  SECARCH=$(awk '/^## 8\. Section/,/^## 9\./' "$STYLE_FILE" || true)
  SECARCH_FORBIDDEN=$(echo "$SECARCH" | awk '/forbidden:/,/^[[:space:]]*`/')
  echo "$SECARCH_FORBIDDEN" | grep -qi "Trust Bar" && STYLE_REQUIRES_TRUST_BAR=0 || true
  echo "$SECARCH_FORBIDDEN" | grep -qi "Sticky CTA" && STYLE_REQUIRES_STICKY_CTA=0 || true
  echo "$SECARCH_FORBIDDEN" | grep -qiE "Bento|bento 2×2" && STYLE_REQUIRES_BENTO=0 || true
  # Section 9 — allowed_variants features
  VARS=$(awk '/^## 9\. Allowed Variants/,/^## 10\./' "$STYLE_FILE" || true)
  echo "$VARS" | grep -qE "features_allowed:.*F3" && ! echo "$VARS" | grep -qE "features_allowed:.*F1|features_allowed:.*F2|features_allowed:.*F4|features_allowed:.*F5" && STYLE_REQUIRES_SOLUTION_BENTO=0 || true

  echo "📋 Style Lock: $STYLE_ID"
  echo "  split=$STYLE_ALLOWS_SPLIT parallax=$STYLE_ALLOWS_PARALLAX magnetic=$STYLE_ALLOWS_MAGNETIC tilt=$STYLE_ALLOWS_TILT counter=$STYLE_ALLOWS_COUNTER"
  echo "  trust=$STYLE_REQUIRES_TRUST_BAR sticky=$STYLE_REQUIRES_STICKY_CTA bento=$STYLE_REQUIRES_BENTO solution_bento=$STYLE_REQUIRES_SOLUTION_BENTO"
  echo ""
fi

# ─── 1. Placeholdery / obrazy ───
# Wymaganie: kazda sekcja wizualna MUSI miec placeholder zdjecia (feedback-landing-placeholder-per-section.md).
# Sekcje: hero (1), gallery (5-6), personas (3), testimonials (3-4), procedure steps (3), final-cta (1 bg) = 16-18 minimum.
echo "📷 1. Obrazy i placeholdery"
N_PH=$(grep -oE 'class="[^"]*(-figure|-placeholder|bento-image|step-image|img-placeholder)[^"]*"' "$FILE" | wc -l)
check_range "Placeholdery/figury (globalnie)" 12 40 "$N_PH"

# Per-section check — kazda z sekcji wizualnych musi miec >=1 placeholder
echo ""
echo "📷 1a. Placeholder per section (wymagane od 2026-04)"

# Hero (1 placeholder min)
HERO_PH=$(awk '/<section[^>]*class="[^"]*hero[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*(hero-figure|hero-product|hero-image|hero.*-placeholder|img-placeholder)[^"]*"' || true)
check_range "Hero: placeholder obecny (≥1)" 1 10 "$HERO_PH"

# Personas (≥1 placeholder — różni wariant T ma różną liczbę, T5 single-testi ma 1, T4 UGC ma 8)
# Akceptujemy alt naming: persona-card, persona-emoji, persona-photo, persona-portrait, persona-lab
PERS_PH=$(awk '/<section[^>]*class="[^"]*personas?[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*(persona-figure|persona-image|persona.*-placeholder|persona-card|persona-emoji|persona-photo|persona-portrait|persona-lab)[^"]*"' || true)
if [ "$PERS_PH" -ge 1 ]; then
  echo "  ✅ Personas: placeholdery/karty ($PERS_PH)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Personas: brak placeholderów (sekcja może być tekstowa — OK)"
  WARN=$((WARN + 1))
fi

# Testimonials (≥1 placeholder avatar)
# Akceptujemy alt naming: testimonial-card, testimonial-avatar, opinia-card, review-card
TESTI_PH=$(awk '/<section[^>]*class="[^"]*testimonials?[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*(testi-avatar-figure|testi-figure|avatar.*-figure|avatar.*-placeholder|voice-figure|testimonial-card|testimonial-avatar|opinia-card|review-card)[^"]*"' || true)
if [ "$TESTI_PH" -ge 1 ]; then
  echo "  ✅ Testimonials: avatary/karty ($TESTI_PH)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Testimonials: brak avatarów (sekcja może być text-only — OK)"
  WARN=$((WARN + 1))
fi

# Procedure / How It Works (3 placeholdery step — opcjonalne, niektóre style są text-only)
STEP_PH=$(awk '/<section[^>]*class="[^"]*(procedure|process|how|steps)[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*(step-figure|step-image|how-figure|ritual-figure|process-figure|how-step-image|step-icon)[^"]*"' || true)
if [ "$STEP_PH" -ge 3 ]; then
  echo "  ✅ Procedure/How: step placeholdery ($STEP_PH)"
  PASS=$((PASS + 1))
elif [ "$STEP_PH" -ge 1 ]; then
  echo "  ⚠️  Procedure/How: tylko $STEP_PH/3 step placeholderów (zalecane 3)"
  WARN=$((WARN + 1))
else
  echo "  ⚠️  Procedure/How: brak step placeholderów (kroki text-only — OK ale słabsze wizualnie)"
  WARN=$((WARN + 1))
fi

# Final CTA (1 bg placeholder opcjonalnie — warn)
FINAL_PH=$(awk '/<section[^>]*class="[^"]*(final-cta|cta-banner|final)[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*(final-cta-figure|final-figure|cta-figure|bg-figure)[^"]*"' || true)
if [ "$FINAL_PH" -ge 1 ]; then
  echo "  ✅ Final CTA: bg placeholder ($FINAL_PH)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Final CTA: brak bg placeholder (opcjonalne, polecane dla impactu)"
  WARN=$((WARN + 1))
fi

# UUID check — 0 (tylko placeholdery — ok pre-ETAP 3 image gen) lub 1 (własny workflow)
# FAIL tylko gdy 2+ (= obce workflow wpuszczone do HTML)
UUIDS=$(grep -oE "ai-generated/[a-z0-9-]+" "$FILE" | sort -u | wc -l)
if [ "$UUIDS" -le 1 ]; then
  check "Brak obcych workflow (UUID sources ≤1)" "$UUIDS" "$UUIDS"
else
  check "Brak obcych workflow (UUID sources ≤1)" "1" "$UUIDS"
fi

# WebP enforcement (od v4.3 — patrz reference/pagespeed.md)
# AI obrazki MUSZĄ być .webp (nie .png/.jpg) — generate-image zwraca PNG quality:'high'
# bezpośrednio do Supabase Storage, bez optymalizacji = 1.5-3MB każdy.
# Skrypt scripts/optimize-landing-images.mjs konwertuje + update HTML.
NON_WEBP=$(grep -oE 'ai-generated/[^"]+\.(png|jpg|jpeg)' "$FILE" | wc -l)
if [ "$NON_WEBP" -eq 0 ]; then
  echo "  ✅ AI images są WebP (zoptymalizowane)"
  PASS=$((PASS + 1))
else
  echo "  ❌ AI images NIE są WebP ($NON_WEBP odwołań do .png/.jpg)"
  echo "     Uruchom: node scripts/optimize-landing-images.mjs $SLUG"
  echo "     Empirycznie: PNG→WebP zmniejsza ~85-95% (mobile LCP 5s→1s)"
  FAIL=$((FAIL + 1))
fi

# /object/public/ URL-e w naszym scope (ai-generated/, landing/<slug>/reels/)
# MUSZĄ być migrowane na /render/image/public/?format=webp (cache 1 rok + WebP -23%)
RAW_OBJECT=$(grep -oE 'object/public/attachments/(ai-generated/[^/"]+|landing/[^/"]+/reels)/[^"]+\.(webp|png|jpg|jpeg)' "$FILE" 2>/dev/null | wc -l || true)
if [ "$RAW_OBJECT" -eq 0 ]; then
  echo "  ✅ Wszystkie URL używają /render/image/ (cache 1 rok)"
  PASS=$((PASS + 1))
else
  echo "  ❌ $RAW_OBJECT URL-i używa /object/public/ (no-cache, gorsze)"
  echo "     Uruchom: node scripts/migrate-to-render-image.mjs $SLUG"
  echo "     /render/image/?format=webp daje WebP -23% + cache 1 rok"
  FAIL=$((FAIL + 1))
fi

# AliExpress thumbs — sprawdź czy URL-e mają suffix _NxNq*
# Bez suffix CDN serwuje original (200KB-1.4MB każde) zamiast WebP
ALI_RAW=$(grep -oE 'ae-pic-a1\.aliexpress-media\.com/kf/[A-Za-z0-9]+\.jpe?g(?!_)' "$FILE" 2>/dev/null | wc -l || true)
if [ "$ALI_RAW" -eq 0 ]; then
  echo "  ✅ AliExpress thumbs: brak nieoptymalizowanych URL-i (lub brak sekcji reviews)"
  PASS=$((PASS + 1))
else
  echo "  ❌ AliExpress thumbs: $ALI_RAW URL-i bez suffix _NxNq* (CDN serwuje 200KB-1.4MB każde)"
  echo "     Uruchom: node scripts/optimize-aliexpress-thumbs.mjs $SLUG"
  echo "     Empirycznie: suffix _640x640q75.jpg zmniejsza ~95-97% per obraz"
  FAIL=$((FAIL + 1))
fi

# ─── 2. Numeracja sekcji — USUNIĘTE 2026-04-20 ───
# Nº numbering było sygnaturą Editorial/Paromia paradigm, nie uniwersalną regułą.
# Landing value-focused / dashboard-style / oversized-typography nie musi mieć magazine
# numbering — wymuszanie tego forsowało Editorial aesthetic na każdy landing.
# Jeśli paradygmat Editorial — używaj Nº w eyebrow'ach (patterns.md #2), ale to opcjonalne.

# ─── 3. Zasady bezwarunkowe headera ───
echo ""
echo "🎩 3. Header discipline (DESIGN.md sekcja 0)"
BDF=$(grep -cE "\.header\s*\{[^}]*backdrop-filter" "$FILE" || true)
check "Header BEZ backdrop-filter (tło #FFFFFF)" "0" "$BDF"

# Logo wordmark check: extract content of <a class="logo">...</a>, usuń opening tag + <img>, sprawdź czy zostaje visible text
LOGO_BLOCK=$(awk '/<a[^>]*class="logo"/{flag=1} flag{print; if(/<\/a>/){flag=0}}' "$FILE" | head -n 5 | tr -d '\n')
# Usuwa: cały opening <a ...>, wszystkie <img ...>, zamykający </a>
LOGO_TEXT=$(echo "$LOGO_BLOCK" | sed -E 's|<a[^>]*>||g; s|<img[^>]*>||g; s|</a>.*||g' | tr -d '[:space:]')
if [ -z "$LOGO_TEXT" ]; then
  echo "  ✅ Logo bez wordmark obok (tylko <img>)"
  PASS=$((PASS + 1))
else
  # Warning, nie fail — legitimate cases: logo-symbol bez nazwy marki
  echo "  ⚠️  Logo ma tekst: \"$LOGO_TEXT\" — OK tylko jeśli logo jest SYMBOLEM bez nazwy marki"
  WARN=$((WARN + 1))
fi

# Logo.png file existence check
LOGO_FILE="landing-pages/$SLUG/logo.png"
if [ -f "$LOGO_FILE" ]; then
  LOGO_SIZE=$(wc -c < "$LOGO_FILE")
  if [ "$LOGO_SIZE" -gt 500 ]; then
    echo "  ✅ Logo.png istnieje (${LOGO_SIZE} bytes)"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  Logo.png za mały (${LOGO_SIZE} bytes) — prawdopodobnie corrupt"
    WARN=$((WARN + 1))
  fi
else
  echo "  ⚠️  Brak landing-pages/$SLUG/logo.png (HTML linkuje przez URL — OK jeśli celowe)"
  WARN=$((WARN + 1))
fi

# ─── 4. Fade-in safety ───
echo ""
echo "🌅 4. Fade-in safety (PROCEDURE.md lekcja #1)"
JSGATE=$(grep -cE "document\.documentElement\.classList\.add..js" "$FILE" || true)
check "html.js gate w <head>" "1" "$JSGATE"

SAFE_FILTERED=$(grep -cE "rect\.top.*window\.innerHeight|getBoundingClientRect" "$FILE" || true)
if [ "$SAFE_FILTERED" -ge 1 ]; then
  echo "  ✅ Safety timeout filtruje po pozycji"
  PASS=$((PASS + 1))
else
  echo "  ❌ Safety timeout NIE filtruje po pozycji (bezwarunkowy timeout)"
  FAIL=$((FAIL + 1))
fi

# ─── 5. Inline img sizing (PATTERN 16 / DESIGN G) ───
echo ""
echo "🖼️  5. Image-box discipline (DESIGN.md sekcja G)"
INLINE_IMG=$(grep -cE "<img[^>]*style=\"[^\"]*(height|width|aspect-ratio):" "$FILE" || true)
check "Zero inline img sizing" "0" "$INLINE_IMG"

# Grid row span 2 (ryzyko pustych komórek)
SPAN2=$(grep -cE "grid-row\s*:\s*span 2" "$FILE" || true)
check "grid-row:span 2 — brak (ryzyko pustych komórek)" "0" "$SPAN2" "warn"

# ─── 6. Meta / SEO / fonts ───
echo ""
echo "🔗 6. Meta & fonts"
OG=$(grep -cE 'property="og:image"[^>]*yxmavwkwnfuphjqbelws' "$FILE" || true)
check "OG image = pełny URL Supabase" "1" "$OG"

# Google Fonts &subset=latin-ext = ANTY-WZORZEC (patrz safety.md #10, memory feedback-landing-fonts-polish.md)
# Serwuje okrojony TTF bez unicode-range dla Fredoki/Nunito → polskie znaki fallback na system cursive
LATIN=$(grep -cE "subset=latin-ext" "$FILE" || true)
check "BEZ &subset=latin-ext (Google Fonts v2 anty-wzorzec)" "0" "$LATIN"

# Meta title length (≤ 60 znaków)
TITLE=$(grep -oE "<title>[^<]+</title>" "$FILE" | sed 's/<title>//; s|</title>||')
TITLE_LEN=${#TITLE}
if [ "$TITLE_LEN" -gt 0 ] && [ "$TITLE_LEN" -le 60 ]; then
  echo "  ✅ Meta title ≤ 60 znaków ($TITLE_LEN)"
  PASS=$((PASS + 1))
elif [ "$TITLE_LEN" -gt 60 ]; then
  echo "  ⚠️  Meta title $TITLE_LEN znaków (SEO: ≤ 60)"
  WARN=$((WARN + 1))
else
  echo "  ❌ Brak <title>"
  FAIL=$((FAIL + 1))
fi

# Meta description length (≤ 160 znaków)
DESC=$(grep -oE 'name="description"[^>]*content="[^"]+"' "$FILE" | sed 's/.*content="//; s/"$//')
DESC_LEN=${#DESC}
if [ "$DESC_LEN" -gt 0 ] && [ "$DESC_LEN" -le 160 ]; then
  echo "  ✅ Meta description ≤ 160 znaków ($DESC_LEN)"
  PASS=$((PASS + 1))
elif [ "$DESC_LEN" -gt 160 ]; then
  echo "  ⚠️  Meta description $DESC_LEN znaków (SEO: ≤ 160)"
  WARN=$((WARN + 1))
else
  echo "  ❌ Brak meta description"
  FAIL=$((FAIL + 1))
fi

# ─── 7. JS effects coverage (v5.0 — STEROWANE Motion Budgetem stylu, NIE globalnie) ───
# Semantyka per efekt:
#   - w js_effects_forbidden stylu → obecny = FAIL, brak = PASS
#   - w js_effects_required stylu  → poniżej min z js_effects_count = FAIL
#   - w żadnym                     → neutralny (informacyjnie, bez liczenia)
# Brak _brief.md / brak pliku stylu → tryb RELAKS (informacyjne WARN, bez FAIL).
echo ""
if [ "$NO_BRIEF" = "1" ] || [ "$HAS_STYLE" = "0" ]; then
  echo "✨ 7. JS effects (RELAKS — brak _brief.md lub pliku stylu, Motion Budget nieznany)"
else
  echo "✨ 7. JS effects (wg Motion Budget stylu $STYLE_ID)"
fi

# helper: jeden efekt wg semantyki forbidden/required/neutral
check_effect() {
  local name="$1" pattern="$2" allows="$3" required="$4" min="$5"
  local n
  n=$(grep -cE "$pattern" "$FILE" || true)
  if [ "$allows" = "0" ]; then
    if [ "$n" -eq 0 ]; then echo "  ✅ $name nieobecny (Style Lock zakazuje)"; PASS=$((PASS + 1));
    else echo "  ❌ $name obecny ($n) ale Style Lock zabrania"; FAIL=$((FAIL + 1)); fi
  elif [ "$NO_BRIEF" = "1" ] || [ "$HAS_STYLE" = "0" ]; then
    if [ "$n" -ge 1 ]; then echo "  ✅ $name obecny ($n)"; PASS=$((PASS + 1));
    else echo "  ⚠️  $name brak — bez Style Lock check informacyjny"; WARN=$((WARN + 1)); fi
  elif [ "$required" = "1" ]; then
    if [ "$n" -ge "$min" ]; then echo "  ✅ $name ≥ $min ($n) — wymagany przez Motion Budget"; PASS=$((PASS + 1));
    else echo "  ❌ $name poniżej minimum Motion Budget (wymagane ≥$min, jest $n)"; FAIL=$((FAIL + 1)); fi
  else
    echo "  ℹ️  $name: neutralny wg Motion Budget ($n obecnych) — opcjonalny"
  fi
}

check_effect "Split headline (.js-split)"     'class="[^"]*js-split[^"]*"'                          "$STYLE_ALLOWS_SPLIT"    "$REQ_SPLIT"    "$SPLIT_MIN"
check_effect "Number counters (.js-counter)"  'class="[^"]*js-counter[^"]*"'                        "$STYLE_ALLOWS_COUNTER"  "$REQ_COUNTER"  "$COUNTER_MIN"
check_effect "Magnetic CTA (.magnetic)"       'class="[^"]*magnetic[^"]*"'                          "$STYLE_ALLOWS_MAGNETIC" "$REQ_MAGNETIC" "$MAGNETIC_MIN"
check_effect "Tile 3D Tilt (.js-tilt)"        'class="[^"]*js-tilt[^"]*"|class="[^"]*tile-tilt[^"]*"' "$STYLE_ALLOWS_TILT"   "$REQ_TILT"     "$TILT_MIN"
check_effect "Parallax (.js-parallax)"        'class="[^"]*js-parallax[^"]*"'                       "$STYLE_ALLOWS_PARALLAX" "$REQ_PARALLAX" "$PARALLAX_MIN"

# ─── 8. Copy anti-patterns ───
echo ""
echo "✍️ 8. Copy quality"
POWER=$(grep -ciE "innowacyjn|najwyższ[ae] jakość|charakteryzuje się|implementacj|kompleksow" "$FILE" || true)
check "Zero power words korporacyjnych" "0" "$POWER"

LOREM=$(grep -ciE "lorem ipsum|TODO|placeholder text" "$FILE" || true)
check "Zero lorem/TODO" "0" "$LOREM"

DELIVERY=$(grep -ciE "wysy[łl]ka 24|w 24 ?h|polski magazyn|z magazynu w Polsc|D\+1" "$FILE" || true)
check "Zero zakazanych obietnic dostawy (dropshipping)" "0" "$DELIVERY"

# Purple prose — zakazane metafory/aforyzmy (ETAP 3.5 Manus powinien był je usunąć, ale catch przed)
# Memory: feedback-landing-no-purple-prose.md
# Word boundaries (\b) gdzie ambiguous — uniknąć false positive na „tobieszyn", „nasza" itd.
PURPLE=$(grep -ciE "smak żalu|gorycz poran|coś z domu|\bzostaje w (tobie|nas)\b|dawno przestał|kawa która|niekompromisowa jakość|w poszukiwaniu siebie|smak dzieciństwa|\baromat? wspomnień\b|serce (twojego|naszego) domu" "$FILE" || true)
check "Zero purple prose (metafory/aforyzmy)" "0" "$PURPLE"

# Anti-AI-poetic — 5 grzechów LLM copy (reference/copy.md sekcja "Anti-AI-poetic")
# Wykryte 2026-05-20 na landingu hovira: "Wracaj do wieczoru", "Mop zdjął butów", "a Ty masz wieczór ✱"
# Polski copywriter direct response (15 lat) NIE napisałby tych zwrotów.
AI_POETIC=$(grep -ciE "\boddaj[eą]\s+(ci\s+)?(wieczór|wieczor|spokój|spokoj|kontrol[eę]|wolność|wolnosc|czas|poranek|poranki)\b|\bodkupuj(esz|esz\s+swoj)|\bwracaj\s+do\s+(wieczoru|siebie|domu|spokoju)\b|\b(mop|robot|odkurzacz|szczotka|krem|kawa|herbata)\s+(jeszcze\s+)?(nie\s+)?(zdj[ąa]ł|zdejmuje|czeka|tęskni|tesni|rozumie|wita|zaprasza|otwiera|chce|wzdycha|szepcze|śpi|spi|marzy)\b|który\s+(oddaje|przywraca|odkupuje)\s+(ci|tobie|twój|twoj)|a\s+ty\s+masz\s+(wieczór|wieczor|spokój|spokoj|czas)\s*[✱✦★]?" "$FILE" || true)
check "Zero anti-AI-poetic (oddaje wieczór / mop zdjął butów / wracaj do X)" "0" "$AI_POETIC"

# v5.0 GAP-4: personifikacja WZORCEM GRAMATYCZNYM (dowolny rzeczownik produktowy + czasownik
# mentalny) zamiast incydentowej listy 7 rzeczowników — "parownica, która rozumie jedwab" też łapane
AI_PERSONIF=$(grep -ciE "[a-ząćęłńóśźż]{3,},?\s+(która?|który|które)\s+(rozumie|wie,?\s|pamięta|pamieta|czuje|dba\s+o\s+(ciebie|twoje)|czeka\s+na\s+(ciebie|twój)|zna\s+(twoje|twój)|troszczy)" "$FILE" || true)
check "Zero personifikacji produktu (X, która rozumie/wie/pamięta...)" "0" "$AI_PERSONIF"

# v5.0 GAP-4: "zasługujesz na" / "pozwól sobie" — puste odpustowe frazy AI
AI_INDULGE=$(grep -ciE "zasługujesz\s+na|zaslugujesz\s+na|pozwól\s+sobie|pozwol\s+sobie" "$FILE" || true)
check "Zero 'zasługujesz na / pozwól sobie' (odpustowe frazy AI)" "0" "$AI_INDULGE"

# v5.0 GAP-4: budżet "masz dość" max 1× per landing (deklarowany od dawna, dotąd NIE liczony)
MASZ_DOSC=$(grep -ciE "masz\s+dość|masz\s+dosc|masz\s+już\s+dość" "$FILE" || true)
if [ "$MASZ_DOSC" -le 1 ]; then
  echo "  ✅ Budżet 'masz dość' ≤1 ($MASZ_DOSC)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  'masz dość' ×$MASZ_DOSC — budżet to max 1 na landing (pain-hook traci moc przy powtórce)"
  WARN=$((WARN + 1))
fi

# ─── 9. Offer Box 2026 (DESIGN.md sekcja H) ───
echo ""
echo "💰 9. Offer Box / CTA (DESIGN.md sekcja H.9)"

# H.2 — Price anchoring dual display
OLDPRICE=$(grep -cE 'class="[^"]*(offer-price-old|price-old)[^"]*"|text-decoration:line-through' "$FILE" || true)
check "Stara cena przekreślona (anchor)" "1" "$([ "$OLDPRICE" -ge 1 ] && echo 1 || echo 0)"

SAVEBADGE=$(grep -cE 'class="[^"]*(offer-price-save|save-badge|price-save)[^"]*"' "$FILE" || true)
check "Savings badge (-X%)" "1" "$([ "$SAVEBADGE" -ge 1 ] && echo 1 || echo 0)"

SAVETEXT=$(grep -ciE "oszczędzasz|oszczedzasz" "$FILE" || true)
check "Savings text (Oszczędzasz N zł)" "1" "$([ "$SAVETEXT" -ge 1 ] && echo 1 || echo 0)"

# H.3 — Trust signals
RATING=$(grep -cE 'class="[^"]*(offer-rating|stars)[^"]*"|★★★★★' "$FILE" || true)
check "Rating nad CTA" "1" "$([ "$RATING" -ge 1 ] && echo 1 || echo 0)" "warn"

TRUSTSTRIP=$(grep -cE 'class="[^"]*(offer-trust|trust-strip|trust-item|trust-chip|trust-row|trust-inner)[^"]*"' "$FILE" || true)
check "Trust strip (3 ikony)" "1" "$([ "$TRUSTSTRIP" -ge 1 ] && echo 1 || echo 0)"

# H.3 — Payment logos BLIK-first
BLIK=$(grep -cE "BLIK|blik" "$FILE" || true)
check "Payment logo: BLIK" "1" "$([ "$BLIK" -ge 1 ] && echo 1 || echo 0)"

# ZAKAZ BNPL/COD (feedback-payment-methods.md)
BNPL=$(grep -ciE "paypo|klarna|twisto|afterpay|[0-9]+ rat[yae]|rozłóż na raty|bez odsetek" "$FILE" || true)
check "Zero BNPL (rat/PayPo/Klarna)" "0" "$BNPL"

COD=$(grep -ciE "za pobranie|płatność przy odbiorze|cash on delivery|\\bCOD\\b" "$FILE" || true)
check "Zero 'za pobraniem' / COD" "0" "$COD"

# H.5 — Guarantee microcopy z konkretem dni
GUARANTEE=$(grep -cE "class=\"[^\"]*offer-guarantee[^\"]*\"" "$FILE" || true)
check "Guarantee microcopy pod CTA" "1" "$([ "$GUARANTEE" -ge 1 ] && echo 1 || echo 0)"

GDAYS=$(grep -ciE "[0-9]+ dni (na zwrot|gwarancj|bez pytań)" "$FILE" || true)
check "Guarantee z konkretem N dni" "1" "$([ "$GDAYS" -ge 1 ] && echo 1 || echo 0)" "warn"

# H.8 — Anti-patterns
FAKEURGENCY=$(grep -ciE "tylko dzisiaj|tylko dzis|zostało [0-9]+ szt|hurry up|ostatnie [0-9]+ sztuk" "$FILE" || true)
check "Zero fake urgency (tylko dziś / zostało X szt.)" "0" "$FAKEURGENCY"

# H.7 — Mobile sticky CTA 56px+
STICKY=$(grep -cE 'class="[^"]*sticky-cta[^"]*"' "$FILE" || true)
check "Sticky CTA mobile obecny" "1" "$([ "$STICKY" -ge 1 ] && echo 1 || echo 0)" "warn"

# ─── 10. Moment decyzji & self-contained (v5.0) ───
# ROLLOUT: wszystkie checki tej grupy = WARN do czasu przejścia 5 nowych landingów
# bez false positive (zasada rolloutu README), potem podnieś severity na FAIL.
echo ""
echo "🎯 10. Moment decyzji & self-contained (v5.0 — rollout WARN→FAIL)"

# 10a. Self-contained: zewnętrzne <script src> są MARTWE po copy-paste do CMS TakeDrop
#      Allowlist: tracking żywych sklepów Etap 5 (gtm, contentsquare) — dodawany PO podpięciu
EXT_SRC=$(grep -oE '<script[^>]+src="[^"]*"' "$FILE" | grep -vE 'googletagmanager\.com|t\.contentsquare\.net' | wc -l)
if [ "$EXT_SRC" -eq 0 ]; then
  echo "  ✅ Self-contained: zero zewnętrznych <script src> (cały JS inline)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  $EXT_SRC zewnętrznych <script src> — martwe po wklejeniu do TakeDrop (feedback-landing-self-contained)"
  WARN=$((WARN + 1))
fi

# 10b. Conversion Toolkit — wycofany v5.0 (zewnętrzny skrypt + fake social proof = Omnibus)
CT=$(grep -ciE 'conversion-?toolkit' "$FILE" || true)
if [ "$CT" -eq 0 ]; then
  echo "  ✅ Zero referencji Conversion Toolkit (wycofany v5.0)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  $CT referencji conversion-toolkit — usuń (zewnętrzny skrypt, fake live-visitors/stock)"
  WARN=$((WARN + 1))
fi

# 10c. Demo-CTA: primary CTA w sekcji Offer NIE może być martwy href="#"
#      Dozwolone: realny URL checkoutu LUB href="#..."/{{CHECKOUT_URL}} z data-demo-modal
OFFER_SECTION=$(awk '/<section[^>]*class="[^"]*(offer|pakiet|zestaw|package|product-offer)[^"]*"/,/<\/section>/' "$FILE")
OFFER_DEAD=$(echo "$OFFER_SECTION" | grep -oE '<a[^>]*class="[^"]*(offer-cta|offer-btn|btn-primary)[^"]*"[^>]*>' | grep -E 'href="#"' | grep -vc 'data-demo-modal' || true)
if [ "$OFFER_DEAD" -eq 0 ]; then
  echo "  ✅ Demo-CTA: primary CTA w Offer nie jest martwy (URL lub data-demo-modal)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Martwy primary CTA w Offer (href=\"#\" bez data-demo-modal) — najgorszy moment porażki demo (wzorzec: patterns.md #24 demo-checkout)"
  WARN=$((WARN + 1))
fi

# 10d. Trust-microcopy przy final CTA (.cta-trust) — research: gwarancja przy przycisku +12-19% CR
FINAL_TRUST=$(awk '/<section[^>]*class="[^"]*(final-cta|cta-banner|final|closing-cta|last-cta)[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*cta-trust' || true)
if [ "$FINAL_TRUST" -ge 1 ]; then
  echo "  ✅ Final CTA ma .cta-trust (zwrot + płatności przy przycisku)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Final CTA bez .cta-trust — dodaj '✓ 30 dni na zwrot · ✓ BLIK / karta / przelew' (04-design H.10)"
  WARN=$((WARN + 1))
fi

# 10e. Linia dostawy w offer box (.offer-shipping) — ukryte koszty = 48% porzuceń (Baymard)
SHIP=$(grep -cE 'class="[^"]*offer-shipping' "$FILE" || true)
if [ "$SHIP" -ge 1 ]; then
  echo "  ✅ Offer box ma linię dostawy (.offer-shipping)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Offer box bez .offer-shipping — dodaj 'Darmowa dostawa · InPost / DPD / kurier' pod ceną (04-design H.3)"
  WARN=$((WARN + 1))
fi

# 10f. Sticky CTA gating — pasek widoczny od 0px kanibalizuje hero (kanon H.7: dwuwarunkowy IO)
if [ "$STICKY" -ge 1 ] 2>/dev/null || grep -qE 'class="[^"]*sticky-cta' "$FILE"; then
  IO_GATE=$(grep -cE "IntersectionObserver" "$FILE" || true)
  if [ "$IO_GATE" -ge 1 ]; then
    echo "  ✅ Sticky CTA ma gating (IntersectionObserver)"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  Sticky CTA bez gatingu IO — widoczny od 0px zasłania hero-CTA (kanon 04-design H.7)"
    WARN=$((WARN + 1))
  fi
fi

# 10g. Uczciwy social proof: liczby opinii/rating wymagają disclaimera (Omnibus/UOKiK)
SP_NUM=$(grep -oiE "[0-9][0-9 .]{0,6}(opini|recenzj|zadowolonych klient)" "$FILE" | wc -l)
SP_DISC=$(grep -ciE "charakter poglądowy|faza wprowadzenia|dane poglądowe" "$FILE" || true)
if [ "$SP_NUM" -eq 0 ]; then
  echo "  ✅ Social proof bez fabrykowanych liczb (framing 'pierwsze opinie' OK)"
  PASS=$((PASS + 1))
elif [ "$SP_DISC" -ge 1 ]; then
  echo "  ✅ Liczby social proof z disclaimerem poglądowym w stopce"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Liczby opinii BEZ disclaimera — klient wklei fejk do sklepu (Omnibus; wzorzec cervana: stopka 'dane poglądowe')"
  WARN=$((WARN + 1))
fi

# 10h. Fake press/cert logos — claim bez pokrycia = UOKiK
PRESS=$(grep -cE "VOGUE|FORBES|ELLE|WIRED|\bNYT\b" "$FILE" || true)
if [ "$PRESS" -eq 0 ]; then
  echo "  ✅ Zero fabrykowanych logotypów prasy"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  $PRESS logotypów prasy (VOGUE/FORBES/...) — fabrykowany authority claim, usuń lub zamień na placeholdery certyfikatów"
  WARN=$((WARN + 1))
fi

# 10i. verify-offer-math.mjs (v5.0) — spójność cen/claimów/liczb (rollout: WARN)
if command -v node >/dev/null 2>&1 && [ -f "scripts/verify-offer-math.mjs" ]; then
  OM_OUT=$(node scripts/verify-offer-math.mjs "$SLUG" 2>&1 || true)
  OM_GATE=$(echo "$OM_OUT" | grep "^GATE" | head -1)
  if echo "$OM_GATE" | grep -q "PASS"; then
    echo "  ✅ offer-math: spójność cen/claimów/liczb OK"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  offer-math: $OM_GATE"
    echo "$OM_OUT" | grep -E "⚠️|❌" | head -4 | sed 's/^/     /'
    WARN=$((WARN + 1))
  fi
fi

# ─── 11. Section completeness — wszystkie 14 sekcji obecne ───
echo ""
echo "🧱 11. Kompletność sekcji (wszystkie 14)"

# Hero MA mieć placeholder zdjęcia (feedback-landing-hero-image-required.md)
HERO_FIGURE=$(awk '/<section[^>]*class="[^"]*hero[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*hero[^"]*-figure|class="[^"]*hero[^"]*-image|class="[^"]*hero-product' || true)
check "Hero ma placeholder zdjęcia produktu" "1" "$([ "$HERO_FIGURE" -ge 1 ] && echo 1 || echo 0)"

# 14 sekcji obowiązkowych (feedback-landing-section-completeness.md)
declare -A SECTIONS=(
  ["Header"]='<header'
  ["Mobile Menu"]='class="[^"]*(mobile-menu|menu-mobile|nav-mobile|mobileMenu)'
  ["Hero"]='<section[^>]*class="[^"]*hero'
  ["Trust Bar"]='<section[^>]*class="[^"]*(trust|chips|badges-bar|hero-chips)|<div[^>]*class="[^"]*trust-(items|inner|bar|strip)'
  ["Problem"]='<section[^>]*class="[^"]*(problem|wyzwanie|challenge|pain|agitation)'
  ["Solution/Bento"]='<section[^>]*class="[^"]*(solution|atelier|bento|features|benefits|capabilities)'
  ["How It Works"]='<section[^>]*class="[^"]*(how|ritual|steps|process|procedure|method)'
  ["Comparison"]='<section[^>]*class="[^"]*(versus|comparison|compare|vs-section|przed-po)'
  ["Testimonials"]='<section[^>]*class="[^"]*(voices|testimonials|opinie|social-proof|reviews|opinion)'
  ["FAQ"]='<section[^>]*class="[^"]*faq'
  ["Offer"]='<section[^>]*class="[^"]*(offer|pakiet|zestaw|package|product-offer)'
  ["Final CTA"]='<section[^>]*class="[^"]*(final-cta|cta-banner|final|closing-cta|last-cta)'
  ["Footer"]='<footer'
  ["Sticky CTA"]='class="[^"]*(sticky-cta|mobile-cta|bottom-cta|fixed-cta)'
)
for label in Header "Mobile Menu" Hero "Trust Bar" Problem Solution/Bento "How It Works" Comparison Testimonials FAQ Offer "Final CTA" Footer "Sticky CTA"; do
  pattern="${SECTIONS[$label]}"
  HIT=$(grep -cE "$pattern" "$FILE" || true)
  if [ "$HIT" -ge 1 ]; then
    PASS=$((PASS + 1))
    echo "  ✅ Sekcja: $label"
  elif [ "$label" = "Trust Bar" ] && [ "$STYLE_REQUIRES_TRUST_BAR" = "0" ]; then
    PASS=$((PASS + 1))
    echo "  ✅ Sekcja: $label (skipped — Style Lock zakazuje, używana sec-meta)"
  elif [ "$label" = "Sticky CTA" ] && [ "$STYLE_REQUIRES_STICKY_CTA" = "0" ]; then
    PASS=$((PASS + 1))
    echo "  ✅ Sekcja: $label (skipped — Style Lock zakazuje)"
  else
    FAIL=$((FAIL + 1))
    echo "  ❌ Sekcja BRAK: $label"
  fi
done

# Min 4 tiles w bento (top-level tile divs)
# Apothecary/Japandi/Swiss itd. używają feat-spec-list (F3 Linear stack) zamiast bento — skip jeśli styl zakazuje
if [ "$STYLE_REQUIRES_SOLUTION_BENTO" = "0" ]; then
  FEAT_ROWS=$(grep -cE '<li[^>]*(class="[^"]*|)>.*<span class="feat-key"|<(div|article) class="feat' "$FILE" || true)
  FEAT_SPEC=$(grep -cE 'class="feat-spec-list"|class="[^"]*feat-key[^"]*"' "$FILE" || true)
  if [ "$FEAT_SPEC" -ge 1 ]; then
    echo "  ✅ Features as spec rows (Style Lock F3 Linear stack)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ Brak feat-spec-list (wymagane przez Style Lock $STYLE_ID)"
    FAIL=$((FAIL + 1))
  fi
else
  # Akceptujemy alt naming: tile, bento-card, feature-card, feat-card, spec-card, benefit-card, solution-feature
  BENTO_TILES=$(grep -cE '<(div|article)[^>]*class="[^"]*(tile[^-]|bento-card|feature-card|feat-card|spec-card|benefit-card|solution-feature|capability-card)' "$FILE" || true)
  check_range "Bento/Features ma ≥4 tiles" 4 12 "$BENTO_TILES"
fi

# Min 3 acts w How It Works — akceptuje <div>, <article>, <li> z klasą act/how-step/step
# ([^a-z-]|") żeby NIE matchować how-step-num, how-step-body, step-figure itd.
ACTS=$(grep -cE '<(div|article|li)[^>]*class="[^"]*(act|how-step|step)([^a-zA-Z0-9-]|")' "$FILE" || true)
check_range "How It Works ≥3 kroki" 3 8 "$ACTS"

# Min 5 FAQ pytań
FAQS=$(grep -cE 'class="faq-item|<details[^>]*class="[^"]*faq' "$FILE" || true)
check_range "FAQ ≥5 pytań" 5 12 "$FAQS"

# ─── 11b. Mobile polish enforcement (WARN — 06-mobile.md) ───
echo ""
echo "📱 11b. Mobile polish enforcement (≥375px dedicated CSS)"

MEDIA_480=$(grep -cE "@media[^{]*max-width:\s*480px" "$FILE" || true)
if [ "$MEDIA_480" -ge 1 ]; then
  echo "  ✅ Mobile CSS (@media max-width:480px) obecne ($MEDIA_480)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Brak @media max-width:480px — 60-70% ruchu to mobile, procedura 06-mobile.md wymaga dedykowanego CSS"
  WARN=$((WARN + 1))
fi

# Hero visual max-height na mobile (zapobiega > 60vh hero na 375px)
HERO_MAX_H=$(grep -cE "\.hero[^{]*\{[^}]*max-height:[0-9]+(vh|px)|@media[^{]*\{[^}]*\.hero[^{]*max-height" "$FILE" || true)
if [ "$HERO_MAX_H" -ge 1 ]; then
  echo "  ✅ Hero visual ma max-height (zapobiega zjadaniu >60vh na mobile)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Hero bez max-height na mobile — może zjadać >60% viewport 375px, CTA spada pod fold"
  WARN=$((WARN + 1))
fi

# CTA primary 100% width na mobile (touch target) — 2-step check (multiline-safe)
# Krok 1: czy landing ma @media mobile (dowolny breakpoint 375-768)
# Krok 2: czy CTA ma width:100% (gdziekolwiek — zakłada że jest w @media skoro krok 1 TAK)
MEDIA_MOBILE=$(grep -cE "@media[^{]*max-width:\s*(3[0-9]{2}|4[0-9]{2}|5[0-9]{2}|6[0-9]{2}|7[0-9]{2})px" "$FILE" || true)
BTN_100=$(grep -cE "(\.btn-primary|\.offer-cta|\.hero-cta-row\s*\.btn|btn-shimmer|cta-btn)[^}]*width:\s*100%" "$FILE" || true)
# Fallback: multiline flatten check
CTA_FLAT=$(tr '\n' ' ' < "$FILE" | grep -cE "@media[^{]*max-width:\s*[3-7][0-9]{2}px[^}]*(btn-primary|offer-cta|hero-cta-row)[^}]*width:\s*100%" || true)
if [ "$BTN_100" -ge 1 ] || [ "$CTA_FLAT" -ge 1 ]; then
  echo "  ✅ CTA ma width:100% (mobile touch target)"
  PASS=$((PASS + 1))
elif [ "$MEDIA_MOBILE" -ge 1 ]; then
  echo "  ⚠️  @media mobile obecne ale CTA bez width:100% — touch target może być <44px szerokości"
  WARN=$((WARN + 1))
else
  echo "  ⚠️  CTA bez width:100% na mobile (brak @media mobile w ogóle)"
  WARN=$((WARN + 1))
fi

# ─── 12. Copy quality (pozytywne jakości — reference/copy.md) ───
echo ""
echo "✍️  12. Copy quality (pozytywne — reference/copy.md)"

# Headline hero ≤ 10 słów (extract text z <h1>...</h1>, multiline-safe)
HERO_H1=$(awk '/<section[^>]*class="[^"]*hero[^"]*"/,/<\/section>/' "$FILE" | tr '\n' ' ' | grep -oE '<h1[^>]*>.*</h1>' | head -1 | sed -E 's/<[^>]+>//g; s/[[:space:]]+/ /g; s/^ //; s/ $//')
HERO_WORDS=$(echo "$HERO_H1" | wc -w)
if [ "$HERO_WORDS" -ge 1 ] && [ "$HERO_WORDS" -le 10 ]; then
  echo "  ✅ Hero headline ≤10 słów ($HERO_WORDS — \"$HERO_H1\")"
  PASS=$((PASS + 1))
elif [ "$HERO_WORDS" -gt 10 ]; then
  echo "  ⚠️  Hero headline $HERO_WORDS słów (max 10): \"$HERO_H1\""
  WARN=$((WARN + 1))
else
  echo "  ❌ Hero headline pusty lub brak"
  FAIL=$((FAIL + 1))
fi

# Brak "nasz/nasza/nasze/naszą/naszym/my" (2 osoba, nie my)
NASZ=$(grep -icE "\b(nasz|nasza|nasze|naszą|naszym|naszego|naszej|naszemu|naszych|naszymi)\b" "$FILE" || true)
check_range "Brak 'nasz/nasza...' (pisz w 2 osobie Ty/Twój)" 0 3 "$NASZ"

# Konkretne liczby w hero (min 1 digit+unit np "20 BAR", "26 sek", "3 min")
HERO_DIGITS=$(awk '/<section[^>]*class="[^"]*hero[^"]*"/,/<\/section>/' "$FILE" | grep -cE "[0-9]+\s*(BAR|sek|sekund|min|godzin|h|kPa|bar|ml|g|kg|°C|%|zł)" || true)
check_range "Hero zawiera konkretne liczby (liczba + jednostka)" 1 50 "$HERO_DIGITS"

# FAQ odpowiedzi min length (każda ≥80 znaków treści, z usuniętymi tagami HTML)
FAQ_SHORT=0
FAQ_COUNT=0
while IFS= read -r answer; do
  FAQ_COUNT=$((FAQ_COUNT + 1))
  # Remove HTML tags, count visible chars
  STRIPPED=$(echo "$answer" | sed -E 's/<[^>]+>//g' | tr -s '[:space:]' ' ')
  LEN=${#STRIPPED}
  if [ "$LEN" -lt 80 ]; then
    FAQ_SHORT=$((FAQ_SHORT + 1))
  fi
done < <(awk '/<div class="(faq-a|faq-answer|faq-body|faq-text)[^"]*">/{flag=1; sub(/.*<div class="(faq-a|faq-answer|faq-body|faq-text)[^"]*">/, "")} flag{buf=buf $0 " "} /<\/div>/{if(flag){sub(/<\/div>.*/, "", buf); print buf; buf=""; flag=0}}' "$FILE")
if [ "$FAQ_COUNT" -eq 0 ]; then
  echo "  ⚠️  Nie znaleziono FAQ answers (faq-a)"
  WARN=$((WARN + 1))
elif [ "$FAQ_SHORT" -eq 0 ]; then
  echo "  ✅ FAQ odpowiedzi ≥80 znaków ($FAQ_COUNT/$FAQ_COUNT OK)"
  PASS=$((PASS + 1))
else
  echo "  ❌ FAQ $FAQ_SHORT/$FAQ_COUNT odpowiedzi jest zbyt krótkich (<80 znaków)"
  FAIL=$((FAIL + 1))
fi

# Testimonials min length (każdy cytat ≥80 znaków)
# Akceptujemy alt naming: voice-quote, testimonial-text, testi-quote, opinia-text, review-text, quote-body
TEST_SHORT=0
TEST_COUNT=0
while IFS= read -r quote; do
  TEST_COUNT=$((TEST_COUNT + 1))
  # strip HTML, count chars
  LEN=${#quote}
  if [ "$LEN" -lt 80 ]; then TEST_SHORT=$((TEST_SHORT + 1)); fi
done < <(grep -oE 'class="(voice-quote|testimonial-text|testi-quote|opinia-text|review-text|quote-body)"[^>]*>[^<]+' "$FILE" | sed -E 's/class="[^"]+"[^>]*>//')
if [ "$TEST_COUNT" -eq 0 ]; then
  echo "  ⚠️  Nie znaleziono testimonials (voice-quote)"
  WARN=$((WARN + 1))
elif [ "$TEST_SHORT" -eq 0 ]; then
  echo "  ✅ Testimonials ≥80 znaków ($TEST_COUNT/$TEST_COUNT OK)"
  PASS=$((PASS + 1))
else
  echo "  ❌ Testimonials $TEST_SHORT/$TEST_COUNT zbyt krótkie"
  FAIL=$((FAIL + 1))
fi

# Offer CTA z korzyścią (zawiera "oszczęd|odbierz|dołącz" lub cenę)
OFFER_CTA=$(grep -oE '<a[^>]*class="offer-cta[^"]*"[^>]*>[^<]+' "$FILE" | head -1)
if echo "$OFFER_CTA" | grep -iqE "oszczęd|odbierz|dołącz|[0-9]+ zł"; then
  echo "  ✅ Offer CTA zawiera korzyść (kwota/akcja)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Offer CTA może być generyczny: \"$OFFER_CTA\""
  WARN=$((WARN + 1))
fi

# ─── 13. Brief persistence ───
echo ""
echo "📋 13. Brief persistence (manifesto)"
BRIEF="landing-pages/$SLUG/_brief.md"
if [ -f "$BRIEF" ]; then
  BRIEF_SIZE=$(wc -c < "$BRIEF")
  if [ "$BRIEF_SIZE" -gt 500 ]; then
    echo "  ✅ _brief.md istnieje (${BRIEF_SIZE} bytes)"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  _brief.md istnieje ale za krótki (${BRIEF_SIZE} bytes)"
    WARN=$((WARN + 1))
  fi
else
  echo "  ⚠️  _brief.md BRAK — ETAP 1 DIRECTION nie wykonany"
  WARN=$((WARN + 1))
fi

# ─── 14. Anti-AI-slop visual (v5.0 — rollout WARN→FAIL) ───
# Research (925studios): sygnatura AI-slop = Inter + fioletowe gradienty + uniform radius;
# strony z nią konwertują do 91% gorzej. Checki STYLE-LOCK-AWARE (czytają _brief.md).
echo ""
echo "🤖 14. Anti-AI-slop visual (v5.0)"

# 14a. Fiolety AI-slop — PASS gdy hex jest w briefie (fioletowy brand klienta legalny)
SLOP_HEX_FOUND=""
for hex in 6366f1 8b5cf6 a855f7 7c3aed; do
  if grep -qiE "#$hex" "$FILE"; then
    if [ -f "$BRIEF" ] && grep -qiE "#$hex" "$BRIEF"; then
      : # hex z palety brandu — legalny
    else
      SLOP_HEX_FOUND="$SLOP_HEX_FOUND #$hex"
    fi
  fi
done
if [ -z "$SLOP_HEX_FOUND" ]; then
  echo "  ✅ Zero fioletów AI-slop spoza palety briefu"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Fiolety AI-slop spoza briefu:$SLOP_HEX_FOUND (sygnatura generycznego AI — zamień na paletę brandu)"
  WARN=$((WARN + 1))
fi

# 14b. Inter/Roboto/Arial/Open Sans jako font DISPLAY (wyjątek: swiss-grid lockuje Helvetica/Inter)
if [ "$STYLE_ID" = "swiss-grid" ]; then
  echo "  ✅ Font display: wyjątek swiss-grid (Helvetica/Inter locked)"
  PASS=$((PASS + 1))
else
  DISPLAY_SLOP=$(grep -cE -- "--font-display:[^;]*(Inter|Roboto|Arial|Open Sans)|--display:[^;]*(Inter|Roboto|Arial|Open Sans)" "$FILE" || true)
  if [ "$DISPLAY_SLOP" -eq 0 ]; then
    echo "  ✅ Font display bez Inter/Roboto/Arial (AI-slop default)"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  Inter/Roboto/Arial jako --font-display — sygnatura AI-slop; display ma budować charakter (Inter OK jako body)"
    WARN=$((WARN + 1))
  fi
fi

# 14c. Uniform radius >80% identycznych wartości (excl. 0 i 50% — brutalist/avatary legalne)
RADII=$(grep -oE "border-radius:\s*[0-9]+px" "$FILE" | grep -oE "[0-9]+" | grep -vE "^0$" || true)
N_RADII=$(echo "$RADII" | grep -c . || true)
if [ "$N_RADII" -ge 5 ]; then
  TOP_COUNT=$(echo "$RADII" | sort | uniq -c | sort -rn | head -1 | awk '{print $1}')
  PCT=$((TOP_COUNT * 100 / N_RADII))
  if [ "$PCT" -le 80 ]; then
    echo "  ✅ Border-radius zróżnicowany (dominanta $PCT% z $N_RADII)"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  Uniform radius: $PCT% wartości identycznych — sygnatura szablonu (różnicuj: karty vs przyciski vs badge)"
    WARN=$((WARN + 1))
  fi
fi

# 14d. Template-fingerprint (verify-freshness.sh — kolizje leksykalne z korpusem)
if [ -f "scripts/verify-freshness.sh" ]; then
  FRESH_OUT=$(bash scripts/verify-freshness.sh "$SLUG" 2>&1 || true)
  if echo "$FRESH_OUT" | grep -q "^GATE: PASS"; then
    echo "  ✅ Freshness: zero sztancy leksykalnej"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  Freshness: kolizje leksykalne —"
    echo "$FRESH_OUT" | grep "⚠️" | head -3 | sed 's/^/   /'
    WARN=$((WARN + 1))
  fi
fi

# 14e. Wow Moments — zadeklarowane selektory MUSZĄ istnieć w HTML (v5.0)
if [ -f "$BRIEF" ] && grep -q "^## 11\." "$BRIEF"; then
  WOW_SELECTORS=$(awk '/^## 11\./,/^## 12\.|^---$/' "$BRIEF" | tr -d '\r' | grep -E "^-?\s*selector:" | sed -E 's/^-?\s*selector:\s*//; s/[[:space:]]+$//' | grep -v "^\[" || true)
  BLOCKLIST="^\.(hero|offer-box|sticky-cta|trust-strip|faq|tile|js-counter|magnetic)$"
  if [ -z "$WOW_SELECTORS" ]; then
    echo "  ⚠️  Wow Moments: brak pól 'selector:' w briefie sekcji 11 (v5.0 — wymagane do maszynowej weryfikacji)"
    WARN=$((WARN + 1))
  else
    WOW_OK=1
    while IFS= read -r sel; do
      [ -z "$sel" ] && continue
      if echo "$sel" | grep -qE "$BLOCKLIST"; then
        echo "  ⚠️  Wow selector '$sel' jest klasą BASELINE (blocklist) — to nie wow moment, to fundament"
        WARN=$((WARN + 1)); WOW_OK=0; continue
      fi
      CLS=$(echo "$sel" | sed 's/^\.//')
      if grep -qE "class=\"[^\"]*$CLS" "$FILE"; then
        : # obecny
      else
        echo "  ⚠️  Wow selector '$sel' zadeklarowany w briefie, NIEOBECNY w HTML (deklaracja ≠ realizacja)"
        WARN=$((WARN + 1)); WOW_OK=0
      fi
    done <<< "$WOW_SELECTORS"
    [ "$WOW_OK" = "1" ] && { echo "  ✅ Wow Moments: wszystkie zadeklarowane selektory obecne w HTML"; PASS=$((PASS + 1)); }
  fi
fi

# ─── 15. Zadeklarowane = zbudowane: warianty sekcji (v5.0 — rollout WARN→FAIL) ───
# Deklaracja w briefie sekcji 9 (`- **Hero:** H4 ...`) → klasa FROZEN w HTML.
if [ -f "$BRIEF" ] && grep -qE "^## 9\." "$BRIEF"; then
  echo ""
  echo "🧩 15. Zadeklarowane = zbudowane (warianty z briefu sekcji 9)"
  SEC9=$(awk '/^## 9\./,/^## 10\.|^---$/' "$BRIEF" | tr -d '\r')
  frozen_class() {
    case "$1" in
      H1) echo hero-v-split;; H2) echo hero-v-fullbleed;; H3) echo hero-v-dashboard;;
      H4) echo hero-v-numeral;; H5) echo hero-v-typo;; H6) echo hero-v-persona;;
      H7) echo hero-v-macro;; H8) echo hero-v-price;; H9) echo hero-v-video;; H10) echo hero-v-ba;;
      F1) echo feat-v-bento;; F2) echo feat-v-asym;; F3) echo feat-v-linear;;
      F4) echo feat-v-mockups;; F5) echo feat-v-scroll;; F6) echo feat-v-sticky;;
      T1) echo testi-v-grid;; T2) echo testi-v-ba;; T3) echo testi-v-video;;
      T4) echo testi-v-ugc;; T5) echo testi-v-single;; T6) echo testi-v-certs;;
      P1) echo prob-v-stat;; P2) echo prob-v-story;; P3) echo prob-v-cost;; P4) echo prob-v-visual;;
      W1) echo how-v-horizontal;; W2) echo how-v-timeline;; W3) echo how-v-spec;;
      C1) echo comp-v-table;; C2) echo comp-v-cards;; C3) echo comp-v-bar;;
      O1) echo offer-v-single;; O2) echo offer-v-multipack;; O3) echo offer-v-guarantee;;
      *) echo "";;
    esac
  }
  for kind in Hero Features Testimonials Problem How Comparison Offer; do
    VID=$(echo "$SEC9" | grep -oE "\*\*$kind:\*\*[[:space:]]*[HFTPWCO][0-9]{1,2}" | head -1 | grep -oE "[HFTPWCO][0-9]{1,2}" || true)
    [ -z "$VID" ] && continue
    FC=$(frozen_class "$VID")
    [ -z "$FC" ] && continue
    if grep -qE "class=\"[^\"]*$FC" "$FILE"; then
      echo "  ✅ $kind: $VID zadeklarowany → klasa $FC obecna"
      PASS=$((PASS + 1))
    else
      echo "  ⚠️  $kind: brief deklaruje $VID, ale klasa FROZEN '$FC' NIEOBECNA w HTML (deklaracja ≠ realizacja; landingi sprzed v5.0 — dopisz klasę do <section>)"
      WARN=$((WARN + 1))
    fi
  done
fi

# ─── Summary ───
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  SUMMARY: ✅ $PASS · ⚠️  $WARN · ❌ $FAIL"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ─── GATE (v5.0) — JEDYNE źródło prawdy o wyniku ───
# Semantyka (kanoniczna — wszystkie docs odwołują się TYLKO tutaj):
#   GATE: PASS           (exit 0) → przejdź dalej w pipeline (deploy na końcu)
#   GATE: FAIL           (exit 1) → STOP + raport, NIE commit/deploy
#   GATE: WARN-EXCEEDED  (exit 2) → kontynuuj, odnotuj WARN-y w raporcie końcowym
# NIE używaj liczbowych progów typu "≥15/18" / "≥60 PASS" — liczba checków
# zmienia się między wersjami skryptu, exit code nie.
if [ "$FAIL" -gt 0 ]; then
  echo "GATE: FAIL (FAIL=$FAIL)"
  echo "❌ FAIL — napraw problemy przed deployem"
  exit 1
elif [ "$WARN" -gt 3 ]; then
  echo "GATE: WARN-EXCEEDED (WARN=$WARN)"
  echo "⚠️  Za dużo warningów — przejrzyj raport"
  exit 2
else
  echo "GATE: PASS"
  echo "✅ Landing gotowy do ETAP 4 (Playwright visual verify)"
  echo ""
  echo "Następny krok:"
  echo "  bash scripts/screenshot-landing.sh $SLUG"
  echo "  # Potem obejrzyj screenshoty (Read tool) i commit"
fi
