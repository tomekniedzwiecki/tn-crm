#!/bin/bash
# landing-autorun.sh — entry-point dla AUTO-RUN landing generation (FULL autonomous)
# Usage: bash scripts/landing-autorun.sh [UUID]
# Output: prompt dla Claude'a + utworzony placeholder folder + AI images w tle
#
# FULL auto deploy: po ETAP 6 commit + push + Vercel deploy bez pytania
# (landingi to preview dla klienta, nie produkcja — patrz feedback-landing-auto-deploy.md)

set -e

UUID="$1"
if [ -z "$UUID" ]; then
  echo "Usage: bash scripts/landing-autorun.sh [UUID]"
  echo "Przykład: bash scripts/landing-autorun.sh a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  exit 1
fi

# Załaduj env
if [ ! -f /c/repos_tn/tn-crm/.env ]; then
  echo "❌ Brak /c/repos_tn/tn-crm/.env"
  exit 1
fi
set -a && source /c/repos_tn/tn-crm/.env && set +a

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ Brak SUPABASE_SERVICE_KEY w .env"
  exit 1
fi

SUPABASE_URL="https://yxmavwkwnfuphjqbelws.supabase.co"

# Walidacja 1: workflow istnieje
WF=$(curl -s "$SUPABASE_URL/rest/v1/workflows?id=eq.$UUID&select=id,customer_name" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
if [ "$WF" = "[]" ]; then
  echo "❌ Workflow $UUID nie istnieje"
  exit 1
fi

# Walidacja 2: brand_info
BI=$(curl -s "$SUPABASE_URL/rest/v1/workflow_branding?workflow_id=eq.$UUID&type=eq.brand_info&select=value" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
if [ "$BI" = "[]" ]; then
  echo "❌ Brak brand_info — wróć do CLAUDE_BRANDING_PROCEDURE.md"
  exit 1
fi

# Walidacja 3: report_pdf
RP=$(curl -s "$SUPABASE_URL/rest/v1/workflow_reports?workflow_id=eq.$UUID&type=eq.report_pdf&select=file_url" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
if [ "$RP" = "[]" ]; then
  echo "❌ Brak raportu PDF"
  exit 1
fi

# Walidacja 4 (opcjonalna): products
PR=$(curl -s "$SUPABASE_URL/rest/v1/workflow_products?workflow_id=eq.$UUID&select=name,price" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
if [ "$PR" = "[]" ]; then
  echo "⚠️  Brak workflow_products — cena/zestaw z raportu lub deep research"
fi

# Ekstrakcja slug — value to escaped JSON string, używamy node do parse
# Format z Supabase: [{"value":"{\"name\":\"Caffora\",...}"}]
SLUG=$(echo "$BI" | node -e "
try {
  const d = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  if (!d || !d[0] || !d[0].value) process.exit(1);
  const inner = JSON.parse(d[0].value);
  if (!inner.name) process.exit(1);
  console.log(inner.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
} catch (e) {
  process.exit(1);
}
" 2>/dev/null)

if [ -z "$SLUG" ]; then
  echo "❌ Nie mogę ekstrahować slug z brand_info"
  echo "   Sprawdź format: $(echo "$BI" | head -c 200)"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  LANDING AUTO-RUN: $SLUG"
echo "  Workflow: $UUID"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Walidacja Supabase OK"

# Utworzenie folderu
mkdir -p "/c/repos_tn/tn-crm/landing-pages/$SLUG"
echo "✅ Folder utworzony: landing-pages/$SLUG/"

# Kopiuj template briefa (jeśli nie istnieje)
if [ ! -f "/c/repos_tn/tn-crm/landing-pages/$SLUG/_brief.md" ]; then
  cp /c/repos_tn/tn-crm/landing-pages/_templates/_brief.template.md \
     "/c/repos_tn/tn-crm/landing-pages/$SLUG/_brief.md"
  echo "✅ Brief template skopiowany"
else
  echo "⚠️  _brief.md już istnieje — będzie używany istniejący"
fi

# Wystartuj background AI image generation
if [ -f /c/repos_tn/tn-crm/scripts/generate-landing-images.sh ]; then
  echo ""
  echo "🎨 Startuję AI image generation w tle..."
  bash /c/repos_tn/tn-crm/scripts/generate-landing-images.sh "$UUID" "$SLUG" > "/c/tmp/landing-ai-log-$SLUG.txt" 2>&1 &
  AI_PID=$!
  echo "$AI_PID" > "/c/tmp/landing-ai-pid-$SLUG"
  echo "   PID: $AI_PID, log: /c/tmp/landing-ai-log-$SLUG.txt"
fi

# Wypluwanie promptu dla Claude'a
cat <<EOF

═══════════════════════════════════════════════════════════
  AUTO-RUN PROMPT (copy-paste do Claude'a):
═══════════════════════════════════════════════════════════

Zrób landing dla workflow UUID=$UUID (slug=$SLUG).

TRYB: AUTO-RUN FULL autonomous (landingi to preview dla klienta, nie produkcja).
- Wykonuj wszystkie 7 ETAPÓW autonomicznie (1, 2, 3, 3.5 Manus copy review, 4, 5, 6), bez pytania użytkownika
- Folder landing-pages/$SLUG/ już istnieje z _brief.template.md (wypełnij go)
- AI images generują się w tle (PID ${AI_PID:-N/A}) — użyj placeholderów jeśli jeszcze nie gotowe
- Po ETAP 6: git add + commit + push BEZ pytania (zgodnie z feedback-landing-auto-deploy.md)
- Finalny output: link https://tn-crm.vercel.app/landing-pages/$SLUG/ + raport

FLOW (wykonaj w tej kolejności):
1. ETAP 1 DIRECTION → _brief.md (sekcje 1-13: audyt+VOC 1.6+Big Idea 1.7+Style Lock+obiekcje+liczby) + verify-brief.sh
2. ETAP 2 GENERATE:
   a. Wybierz 3 warianty sekcji z docs/landing/reference/section-variants.md
      (Hero z 10, Features z 6, Testimonials z 6 — drzewo decyzyjne rozdział 4,
      pierwsza pasująca reguła z góry wygrywa)
   b. Zaloguj wybory w _brief.md sekcja 9 (opcjonalna, ale zalecana)
   c. Zbuduj index.html (14 sekcji — 3 wybrane warianty + 11 standardowych
      + JS effects wg Motion Budget stylu + placeholders per-section)
3. ETAP 3 REVIEW → bash scripts/verify-landing.sh $SLUG (cel: GATE: PASS)
4. ETAP 3.5 COPY REVIEW (Manus) — OBOWIĄZKOWY:
   a. bash scripts/review-copy-manus.sh $SLUG   (5-15 min, blocking poll)
   b. node scripts/apply-copy.mjs $SLUG
   c. bash scripts/verify-landing.sh $SLUG (re-verify — nadal GATE: PASS)
5. ETAP 4 DESIGN polish (już w HTML z ETAP 2 — tutaj tylko drobne poprawki per manifest)
6. ETAP 4.5 OPTIMIZE IMAGES (OBOWIĄZKOWE 2 kroki):
   a. node scripts/optimize-landing-images.mjs $SLUG
      (konwertuje PNG/JPG z ai-generated/ → WebP, -85-95% rozmiaru)
   b. node scripts/optimize-aliexpress-thumbs.mjs $SLUG
      (dodaje suffix _640x640q75.jpg do URL-i AliExpress reviews,
       CDN auto-serwuje WebP, -95-99% per obraz, ~3-4 MB oszczędności
       per landing z sekcją opinii)
   Bez kroku (a): mobile LCP >5s. Bez kroku (b): reviews ładują się 1448KB każdy.
7. ETAP 5 VERIFY → bash scripts/screenshot-landing.sh $SLUG + obejrzyj screenshoty
   + VISION CRITIQUE (05-verify.md Krok 5.1): rubryka 5 osi 1-5, wynik do _brief.md,
     średnia <3,5 → max 3 poprawki → re-score (1 iteracja)
   + node scripts/verify-offer-math.mjs $SLUG (spójność cen/claimów/liczb)
8. ETAP 6 MOBILE polish 375px
9. node scripts/generate-foto-przewodnik.mjs $SLUG [BRAND] (przewodnik foto dla klienta
   — deliverable, commitowany razem z landingiem, LINK W RAPORCIE KOŃCOWYM)
10. bash scripts/verify-all-landings.sh (regression)
11. git add + commit + push (landingi w scope feedback-landing-auto-deploy.md)

DEFAULT DECYZJE (bez pytania):
- verify-brief.sh fail po 3 próbach → STOP + raport
- VERIFY screenshot bug nieznany → max 2 próby fixa, potem STOP
- AI image nie gotowy w ETAP 4 → zostaw placeholder z brief, kontynuuj, deploy
- Manus task timeout (>15 min w ETAP 3.5) → STOP, deploy z oryginalnym copy + flag w commit msg
- Manus zwraca error → retry 1x, jeśli znów error → STOP
- regression (verify-all-landings) fail → STOP, raport, NIE deploy
- **verify-landing.sh GATE: FAIL (exit 1) → STOP, raport, NIE commit/deploy (safety/quality violation — hard rule)**
- Wszystko inne → kontynuuj, deploy, raportuj niedociągnięcia w podsumowaniu

PRE-COMMIT CHECK (obligatoryjne przed 'git add'):
  bash scripts/verify-landing.sh $SLUG
  # Gate = WYŁĄCZNIE linia GATE / exit code:
  #   GATE: PASS (exit 0)          → git add + commit
  #   GATE: FAIL (exit 1)          → napraw PRZED commitem (NIE --no-verify!)
  #   GATE: WARN-EXCEEDED (exit 2) → commit OK + odnotuj WARN-y w raporcie końcowym
  # NIE interpretuj liczbowych progów (≥N PASS) — liczba checków zmienia się między wersjami

Punkt startu: docs/landing/01-direction.md

═══════════════════════════════════════════════════════════
EOF
