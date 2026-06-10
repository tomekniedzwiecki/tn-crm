#!/bin/bash
# landing-performance-stats.sh — Warstwa A pętli kalibracyjnej (v5.0, FAZA 5.4)
#
# Parsuje wszystkie landing-pages/*/_brief.md → tabela metadanych projektowych
# (styl, warianty, awareness, liczba liczb na landingu). Output: markdown na stdout
# ORAZ do docs/landing/_research/performance.md (sekcja A — nadpisywana).
#
# Warstwa B (ROAS z Meta przez MCP) = procedura dla Claude'a, NIE skrypt
# (bash nie wywołuje MCP) — opisana w performance.md sekcja B.
#
# Rytm: kwartalnie / na żądanie. Cel: po raz pierwszy skalibrować progi Scrollability
# i drzewo wariantów DANYMI zamiast jedną jakościową porażką (Conversion Atlas).

cd "$(dirname "$0")/.."
OUT="docs/landing/_research/performance.md"

extract() { # $1=brief $2=pattern
  grep -oE "$2" "$1" 2>/dev/null | head -1
}

ROWS=""
for brief in landing-pages/*/_brief.md; do
  slug=$(echo "$brief" | sed -E 's|landing-pages/([^/]+)/.*|\1|')
  [ "$slug" = "_templates" ] && continue
  html="landing-pages/$slug/index.html"

  style=$(awk '/^## 10\. STYLE LOCK/,/^## 11\.|^---/' "$brief" 2>/dev/null | grep -oE 'Style ID:[*]+[[:space:]]*`[a-z-]+`' | head -1 | sed 's/^[^`]*`//; s/`.*//')
  hero=$(grep -oE '\*\*Hero:\*\*[[:space:]]*H[0-9]{1,2}' "$brief" 2>/dev/null | grep -oE 'H[0-9]{1,2}' | head -1)
  feat=$(grep -oE '\*\*Features:\*\*[[:space:]]*F[0-9]' "$brief" 2>/dev/null | grep -oE 'F[0-9]' | head -1)
  testi=$(grep -oE '\*\*Testimonials:\*\*[[:space:]]*T[0-9]' "$brief" 2>/dev/null | grep -oE 'T[0-9]' | head -1)
  aware=$(tr -d '\r' < "$brief" | grep -oE '^awareness:[[:space:]]*[a-z-]+' | head -1 | sed 's/^awareness:[[:space:]]*//')
  mtime=$(date -r "$brief" +%Y-%m-%d 2>/dev/null)

  # liczba liczb-claimów w WIDOCZNYM tekście (metryka Scrollability — z HTML, nie briefu)
  nums="-"
  if [ -f "$html" ]; then
    nums=$(sed -e 's/<style[^>]*>.*<\/style>//g' "$html" 2>/dev/null | sed -e 's/<script[^>]*>.*<\/script>//g' -e 's/<[^>]*>/ /g' | grep -oE '[0-9]+([,.][0-9]+)?[[:space:]]*(%|zł|dni|nocy|lat|kPa|BAR|ml|kg|°C|min|sek|stref)' | wc -l)
  fi

  ROWS="$ROWS| $slug | ${style:--} | ${hero:--}/${feat:--}/${testi:--} | ${aware:--} | $nums | ${mtime:--} |
"
done

REPORT="# Performance — pętla kalibracyjna (v5.0)

> Warstwa A generowana przez \`scripts/landing-performance-stats.sh\` (data: $(date +%Y-%m-%d)).
> Warstwa B — procedura niżej (Claude + MCP Meta, na żądanie / kwartalnie).

## Sekcja A — metadane projektowe per landing (auto)

| slug | styl | H/F/T | awareness | liczby-claimy | brief mtime |
|---|---|---|---|---|---|
$ROWS

## Sekcja B — ROAS z kampanii Meta (PROCEDURA dla Claude'a, nie skrypt)

Dla landingów z \`workflow_ads.meta_mcp_enabled = true\`:

1. Zmapuj slug → workflow (grep po brand w \`_brief.md\` / workflow_id w komentarzu —
   NIGDY nie zakładaj slug=brand, memory project-landing-slug-vs-brand).
2. Przez MCP: \`ads_insights_performance_trend\` per konto/kampania → **koszt zakupu + ROAS**
   (NIE CTR — CTR mierzy kreację reklamową, nie landing).
3. Obowiązkowa kolumna \`link_verified\`: czy POTWIERDZONO (adres docelowy reklamy), że
   kampania prowadzi na TEN landing — bez tego wiersz nie wchodzi do analizy.
4. Dopisz do tabeli poniżej (append, z datą pomiaru).

| data | slug | workflow | ROAS | koszt zakupu | link_verified |
|---|---|---|---|---|---|

## Sekcja C — wnioski kalibracyjne (po ≥2 kwartałach danych)

Pytania do odpowiedzi DANYMI: (1) czy landingi 8-12 liczb biją <8 i >12? (2) które warianty
H/F/T korelują z niższym kosztem zakupu per kategoria? (3) czy awareness-dopasowanie hero
(F2 v5.0) zmienia wyniki? Wnioski → korekty progów w 02-generate / drzewa w section-variants.
"

printf '%s' "$REPORT" > "$OUT"
printf '%s' "$REPORT"
echo ""
echo "✅ Zapisano: $OUT"
