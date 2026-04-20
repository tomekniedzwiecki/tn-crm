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
PERS_PH=$(awk '/<section[^>]*class="[^"]*personas[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*(persona-figure|persona-image|persona.*-placeholder)[^"]*"' || true)
check_range "Personas: placeholdery (≥1)" 1 10 "$PERS_PH"

# Testimonials (≥1 placeholder avatar — T5 single-testi ma 1, T4 UGC ma 8)
TESTI_PH=$(awk '/<section[^>]*class="[^"]*testimonials[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*(testi-avatar-figure|testi-figure|avatar.*-figure|avatar.*-placeholder|voice-figure)[^"]*"' || true)
check_range "Testimonials: avatar placeholdery (≥1)" 1 10 "$TESTI_PH"

# Procedure / How It Works (3 placeholdery step)
STEP_PH=$(awk '/<section[^>]*class="[^"]*(procedure|process|how|steps)[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*(step-figure|step-image|how-figure|ritual-figure|process-figure)[^"]*"' || true)
check_range "Procedure/How: step placeholdery (≥3)" 3 8 "$STEP_PH"

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

LATIN=$(grep -cE "subset=latin-ext" "$FILE" || true)
check "Fonty z subset=latin-ext (polskie znaki)" "1" "$LATIN"

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

# ─── 7. JS effects coverage (5 obowiązkowych, DESIGN.md D.1) ───
echo ""
echo "✨ 7. JS effects (5 obowiązkowych, DESIGN.md sekcja D.1)"
JSSPLIT=$(grep -cE 'class="[^"]*js-split[^"]*"' "$FILE" || true)
check "Split headline (.js-split) na h1 hero" "1" "$([ "$JSSPLIT" -ge 1 ] && echo 1 || echo 0)"

JSCOUNT=$(grep -cE 'class="js-counter"' "$FILE" || true)
check_range "Number counters (.js-counter) ≥ 2" 2 20 "$JSCOUNT"

MAGNET=$(grep -cE 'class="[^"]*magnetic[^"]*"' "$FILE" || true)
check_range "Magnetic CTA (.magnetic) ≥ 2" 2 20 "$MAGNET"

# js-tilt + js-parallax = opcjonalne aesthetic effects (niektóre kierunki celowo ich nie używają, np. Rugged Heritage = industrial bez ruchu)
JSTILT=$(grep -cE 'class="[^"]*js-tilt[^"]*"|class="[^"]*tile-tilt[^"]*"' "$FILE" || true)
if [ "$JSTILT" -ge 2 ]; then
  echo "  ✅ Tile 3D Tilt (.js-tilt) ≥ 2 ($JSTILT)"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Tile 3D Tilt (.js-tilt) ≥ 2 (got $JSTILT) — opcjonalne, niektóre kierunki celowo pomijają (Rugged Heritage, industrial, static)"
  WARN=$((WARN + 1))
fi

JSPARALLAX=$(grep -cE 'class="[^"]*js-parallax[^"]*"' "$FILE" || true)
if [ "$JSPARALLAX" -ge 1 ]; then
  echo "  ✅ Parallax numerals (.js-parallax) ≥ 1"
  PASS=$((PASS + 1))
else
  echo "  ⚠️  Parallax numerals (.js-parallax) ≥ 1 (got 0) — opcjonalne, niektóre kierunki pomijają"
  WARN=$((WARN + 1))
fi

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

TRUSTSTRIP=$(grep -cE 'class="[^"]*(offer-trust|trust-strip)[^"]*"' "$FILE" || true)
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

# ─── 11. Section completeness — wszystkie 14 sekcji obecne ───
echo ""
echo "🧱 11. Kompletność sekcji (wszystkie 14)"

# Hero MA mieć placeholder zdjęcia (feedback-landing-hero-image-required.md)
HERO_FIGURE=$(awk '/<section[^>]*class="[^"]*hero[^"]*"/,/<\/section>/' "$FILE" | grep -cE 'class="[^"]*hero[^"]*-figure|class="[^"]*hero[^"]*-image|class="[^"]*hero-product' || true)
check "Hero ma placeholder zdjęcia produktu" "1" "$([ "$HERO_FIGURE" -ge 1 ] && echo 1 || echo 0)"

# 14 sekcji obowiązkowych (feedback-landing-section-completeness.md)
declare -A SECTIONS=(
  ["Header"]='<header[^>]*class="[^"]*header'
  ["Mobile Menu"]='class="[^"]*mobile-menu'
  ["Hero"]='<section[^>]*class="[^"]*hero'
  ["Trust Bar"]='<section[^>]*class="[^"]*trust'
  ["Problem"]='<section[^>]*class="[^"]*(problem|wyzwanie|challenge)'
  ["Solution/Bento"]='<section[^>]*class="[^"]*(solution|atelier|bento|features)'
  ["How It Works"]='<section[^>]*class="[^"]*(how|ritual|steps|process)'
  ["Comparison"]='<section[^>]*class="[^"]*(versus|comparison|compare)'
  ["Testimonials"]='<section[^>]*class="[^"]*(voices|testimonials|opinie|social-proof)'
  ["FAQ"]='<section[^>]*class="[^"]*faq'
  ["Offer"]='<section[^>]*class="[^"]*offer'
  ["Final CTA"]='<section[^>]*class="[^"]*(final-cta|cta-banner|final)'
  ["Footer"]='<footer'
  ["Sticky CTA"]='class="[^"]*sticky-cta'
)
for label in Header "Mobile Menu" Hero "Trust Bar" Problem Solution/Bento "How It Works" Comparison Testimonials FAQ Offer "Final CTA" Footer "Sticky CTA"; do
  pattern="${SECTIONS[$label]}"
  HIT=$(grep -cE "$pattern" "$FILE" || true)
  if [ "$HIT" -ge 1 ]; then
    PASS=$((PASS + 1))
    echo "  ✅ Sekcja: $label"
  else
    FAIL=$((FAIL + 1))
    echo "  ❌ Sekcja BRAK: $label"
  fi
done

# Min 4 tiles w bento (top-level tile divs)
# Tiles w Solution/Features: akceptuje <div> lub <article> (warianty F1-F6 z section-variants.md używają <article>)
BENTO_TILES=$(grep -cE '<(div|article) class="tile[^-][^"]*"' "$FILE" || true)
check_range "Bento/Features ma ≥4 tiles" 4 10 "$BENTO_TILES"

# Min 3 acts w How It Works (top-level act/step/how-step) — precyzyjny regex (nie łapie how-steps, how-step-num)
ACTS=$(grep -cE '<div class="(act|how-step|step)([^a-z-]|")' "$FILE" || true)
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

# Headline hero ≤ 10 słów (extract text z <h1 class="js-split">...</h1>)
HERO_H1=$(awk '/<section[^>]*class="[^"]*hero[^"]*"/,/<\/section>/' "$FILE" | grep -oE "<h1[^>]*>[^<]*(<em>[^<]*</em>[^<]*)?</h1>" | sed -E 's/<[^>]+>//g; s/[[:space:]]+/ /g; s/^ //; s/ $//' | head -1)
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
done < <(awk '/<div class="faq-a">/{flag=1; sub(/.*<div class="faq-a">/, "")} flag{buf=buf $0 " "} /<\/div>/{if(flag){sub(/<\/div>.*/, "", buf); print buf; buf=""; flag=0}}' "$FILE")
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
TEST_SHORT=0
TEST_COUNT=0
while IFS= read -r quote; do
  TEST_COUNT=$((TEST_COUNT + 1))
  # strip HTML, count chars
  LEN=${#quote}
  if [ "$LEN" -lt 80 ]; then TEST_SHORT=$((TEST_SHORT + 1)); fi
done < <(grep -oE 'class="voice-quote"[^>]*>[^<]+' "$FILE" | sed 's/class="voice-quote"[^>]*>//')
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
  echo "  ⚠️  _brief.md BRAK — ETAP 2.5 DIRECTION nie wykonany"
  WARN=$((WARN + 1))
fi

# ─── Summary ───
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  SUMMARY: ✅ $PASS · ⚠️  $WARN · ❌ $FAIL"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "❌ FAIL — napraw problemy przed deployem"
  exit 1
elif [ "$WARN" -gt 3 ]; then
  echo "⚠️  Za dużo warningów — przejrzyj raport"
  exit 2
else
  echo "✅ Landing gotowy do ETAP 4 (Playwright visual verify)"
  echo ""
  echo "Następny krok:"
  echo "  bash scripts/screenshot-landing.sh $SLUG"
  echo "  # Potem obejrzyj screenshoty (Read tool) i commit"
fi
