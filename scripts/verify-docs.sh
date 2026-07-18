#!/bin/bash
# verify-docs.sh — strażnik spójności SAMEJ PROCEDURY (docs/landing/* + docs/zbuduje/* + skrypty)
# Wprowadzony v5.0 (2026-06) po sweepie sprzeczności: agent w AUTO-RUN kopiuje snippety
# z docs DOSŁOWNIE, więc procedura nie może łamać własnych zakazów ani podawać
# sprzecznych progów. Rozszerzony 2026-07-18 o docs/zbuduje/ (fabryka landingów sklepy).
#
# Usage: bash scripts/verify-docs.sh
# Exit 0 = docs spójne; Exit 1 = regresja (zakazany token / martwe odwołanie / sprzeczny próg)
#
# Scope A (docs/landing): docs/landing/*.md + reference/*.md + style-atlas/*.md
#        + scripts/landing-autorun.sh + CLAUDE.md
# Scope B (docs/zbuduje — fabryka sklepy): docs/zbuduje/**/*.md
#        ⚠️ OSOBNY zestaw reguł: fabryka WYMAGA „za pobraniem"/COD → checki BNPL/COD
#           i „24h dostawa" ze Scope A NIE obowiązują tu (celowo). Tu pilnujemy WYŁĄCZNIE
#           spójności wewnętrznej: martwe odwołania do narzędzi + sprzeczne progi.
# Poza scope: docs/landing/_research/ (archiwum), CHANGELOG.md (historia)

set -e
cd "$(dirname "$0")/.."

FAIL=0

DOCS=$(find docs/landing -name "*.md" -not -path "*/_research/*" -not -name "CHANGELOG.md"; echo "CLAUDE.md"; echo "scripts/landing-autorun.sh")
DOCS_ZBUDUJE=$(find docs/zbuduje -name "*.md")

fail_hit() {
  echo "  ❌ $1"
  echo "$2" | head -5 | sed 's/^/     /'
  FAIL=$((FAIL + 1))
}

echo ""
echo "═══ VERIFY DOCS — spójność procedury ═══"
echo ""
echo "── Scope A: docs/landing ──"

# 1. subset=latin-ext jako INSTRUKCJA DODANIA lub żywy snippet <link>
#    (dozwolone wyłącznie w negacjach: BEZ/NIGDY/NIE/anty-wzorzec/USUŃ/0)
HITS=$(echo "$DOCS" | xargs grep -n "subset=latin-ext" 2>/dev/null | grep -viE "BEZ|NIGDY|NIE dodawaj|anty-wzorzec|USUŃ|usuń|powinno być 0|= 0|bez subset|teoretycznie|bulletproof|wykreśl|grep" || true)
if [ -n "$HITS" ]; then
  fail_hit "subset=latin-ext wrócił do docs jako instrukcja/snippet (anty-wzorzec, safety #10)" "$HITS"
else
  echo "  ✅ subset=latin-ext tylko w negacjach"
fi

# 2. PayPo/Klarna/raty/za pobraniem w żywych snippetach (poza liniami-zakazami)
HITS=$(echo "$DOCS" | xargs grep -niE "paypo|klarna|twisto|za pobraniem|płatność przy odbiorze" 2>/dev/null | grep -viE "❌|ZAKAZ|zakaz|NIE stosujemy|nie obsługuje|nie ma integracji|Zero|WYJĄTEK|wyjątek|sklepy klientów|grep" || true)
if [ -n "$HITS" ]; then
  fail_hit "BNPL/COD w żywej treści docs (poza zakazami)" "$HITS"
else
  echo "  ✅ BNPL/COD tylko w zakazach"
fi

# 3. Liczbowe progi gate'u (zakazane od v5.0 — jedyne źródło = exit code verify-landing.sh)
HITS=$(echo "$DOCS" | xargs grep -nE "15/18|≥ ?60 PASS|>= ?60 PASS" 2>/dev/null || true)
if [ -n "$HITS" ]; then
  fail_hit "liczbowy próg gate'u wrócił do docs (kanon = GATE/exit code)" "$HITS"
else
  echo "  ✅ Zero liczbowych progów gate'u"
fi

# 4. Routing do nieistniejącego etapu
HITS=$(echo "$DOCS" | xargs grep -n "ETAPU 2\.5\|ETAP 2\.5" 2>/dev/null | grep -viE "Przed wersją|było ETAP|relikt|historia|dawn" || true)
if [ -n "$HITS" ]; then
  fail_hit "routing do ETAP 2.5 (nie istnieje od v3)" "$HITS"
else
  echo "  ✅ Brak routingu do ETAP 2.5"
fi

# 5. Globalna lista "5 obowiązkowych JS effects" (od v5.0 wymagania per Motion Budget stylu)
HITS=$(echo "$DOCS" | xargs grep -nE "5 obowiązkowych JS|[Ww]szystkie 5 effects" 2>/dev/null || true)
if [ -n "$HITS" ]; then
  fail_hit "globalny mandat 5 JS effects wrócił (wymagania = Motion Budget stylu)" "$HITS"
else
  echo "  ✅ Brak globalnego mandatu 5 JS effects"
fi

# 6. Zakazane obietnice dostawy jako żywa treść snippetów
HITS=$(echo "$DOCS" | xargs grep -niE "wysyłka w? ?24 ?h|magazyn w Polsce|1-3 dni robocze" 2>/dev/null | grep -viE "❌|ZAKAZ|zakaz|Zero|NIE|dropshipping ≠|grep|24h wysyłka" || true)
if [ -n "$HITS" ]; then
  fail_hit "zakazana obietnica dostawy w żywej treści docs" "$HITS"
else
  echo "  ✅ Obietnice dostawy tylko w zakazach"
fi

echo ""
echo "── Scope B: docs/zbuduje (fabryka sklepy — reguly osobne; COD/za pobraniem DOZWOLONE) ──"

# 7. Martwe odwołanie do capture.py — narzędzie nazywa się capture-lint.py
#    (regex "capture\.py" NIE pasuje do "capture-lint.py")
HITS=$(echo "$DOCS_ZBUDUJE" | xargs grep -nE "capture\.py" 2>/dev/null || true)
if [ -n "$HITS" ]; then
  fail_hit "martwe odwołanie 'capture.py' (narzędzie = 'capture-lint.py')" "$HITS"
else
  echo "  ✅ Brak martwego 'capture.py' (jest capture-lint.py)"
fi

# 8. input_fidelity jako ŻYWA instrukcja — parametr NIE istnieje w gpt-image-2
#    (dozwolone wyłącznie w negacji/korekcie: NIE/BEZ/nie istnieje/odrzucany/KOREKTA/gpt-image-1)
HITS=$(echo "$DOCS_ZBUDUJE" | xargs grep -niE "input_fidelity" 2>/dev/null | grep -viE "\bnie\b|\bbez\b|dotyczy|istnieje|odrzucan|korekta|tylko przy|gpt-image-1|nie dodawać|wcześniejsza|wykreśl" || true)
if [ -n "$HITS" ]; then
  fail_hit "input_fidelity jako żywa instrukcja (nie istnieje w gpt-image-2 — patrz GRAFIKA §3)" "$HITS"
else
  echo "  ✅ input_fidelity tylko w negacjach/korekcie"
fi

# 9. Sprzeczny próg SSIM mobilny 0.78 — kanon R13 = 0.80 (gate-manifest layout_diff.ssim_progi)
#    (historyczne wzmianki MUSZĄ być oznaczone SUPERSEDED / „przeszło" / „pierwotnie")
HITS=$(echo "$DOCS_ZBUDUJE" | xargs grep -niE "mobile[^0-9]{0,15}0[.,]78" 2>/dev/null | grep -viE "SUPERSEDED|historyczn|pierwotnie|przeszło|było|relikt|dawn" || true)
if [ -n "$HITS" ]; then
  fail_hit "sprzeczny próg mobilny SSIM 0.78 jako żywy (kanon R13 = 0.80)" "$HITS"
else
  echo "  ✅ Próg mobilny SSIM = kanon R13 (0.80); 0.78 tylko historycznie"
fi

echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "GATE: FAIL (FAIL=$FAIL)"
  echo "❌ Procedura zawiera regresje — napraw docs przed commitem"
  exit 1
fi
echo "GATE: PASS"
echo "✅ Docs spójne"
exit 0
