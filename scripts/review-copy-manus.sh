#!/bin/bash
# review-copy-manus.sh — wysyła landing copy do Manusa, otrzymuje rewritten JSON
# Usage: bash scripts/review-copy-manus.sh <slug>
#
# Flow:
# 1. Extract copy: node scripts/extract-copy.mjs <slug>
# 2. Read _brief.md
# 3. Compose prompt (senior copywriter direct response PL + wytyczne + obecne copy)
# 4. Submit via manus-ask edge function
# 5. Poll manus-get-result co 20s (max 15 min)
# 6. Save rewritten JSON → /c/tmp/manus-copy-<slug>.json
# 7. Info: kolejny krok = apply-copy.mjs

set -e

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Usage: bash scripts/review-copy-manus.sh <slug>"
  exit 1
fi

set -a && source /c/repos_tn/tn-crm/.env && set +a
SUPA="https://yxmavwkwnfuphjqbelws.supabase.co"

BRIEF_FILE="landing-pages/$SLUG/_brief.md"
if [ ! -f "$BRIEF_FILE" ]; then
  echo "❌ Brief nie istnieje: $BRIEF_FILE"
  exit 1
fi

echo "📝 [1/6] Ekstrakcja copy z index.html..."
COPY_JSON="/c/tmp/extract-$SLUG.json"
# Zapisuj direct przez node (UTF-8 safe), NIE pipe przez bash (psuje polskie znaki)
node scripts/extract-copy.mjs "$SLUG" "$COPY_JSON"
echo "   ✅ $(wc -l < $COPY_JSON) linii JSON"

echo "📖 [2/6] Czytanie _brief.md..."
BRIEF=$(cat "$BRIEF_FILE")

echo "✍️  [3/6] Składanie promptu dla Manusa..."
PROMPT_FILE="/c/tmp/manus-prompt-$SLUG.md"
cat > "$PROMPT_FILE" <<'PROMPT_END'
Jesteś senior copywriter direct response, 15+ lat doświadczenia, specjalizacja: e-commerce premium i lifestyle, polski rynek. Piszesz wyłącznie po polsku.

# ZADANIE

Przepisz każdy fragment copy landing page poniżej. Zachowaj strukturę (wszystkie pola JSON muszą być zwrócone), zmień tylko TREŚĆ. Celem jest eliminacja słabego copy i zastąpienie go twardym direct response.

# TWARDE ZASADY (ZŁAMANIE = REJECT)

## Direct response fundamentals
- Konkretne liczby > przymiotniki: „26 sekund" nie „bardzo szybko", „9 zł" nie „drogo"
- 2 osoba: „Ty/Twój", NIGDY „my/nasz/nasza/nasze"
- Max 15 słów per zdanie. Max 3 zdania per akapit.
- Konwersacyjny ton. Pisz jak mówisz do przyjaciela.
- Emocja pierwsza, logika druga. Ale bez sentymentalizmu.

## ZAKAZ purple prose (literary flourish)
Żadnych metafor emocji, aforyzmów, poetyckich domknięć. Klient ma wiedzieć CO go boli, nie czytać poezji.

Czerwone flagi — jeśli widzisz w obecnym copy, REWRITE:
- „smak żalu", „gorycz poranka", „papierowy kubek smaku kompromisu" → daj konkret: „cappuccino za 9 zł — sproszkowane mleko i letnia woda"
- „coś z domu zostaje też w tobie" → aforyzm bez konkretu, REWRITE na konsekwencję: „pięć dni w tygodniu zaczynasz od kompromisu. To 260 kompromisów rocznie."
- „kawa, która dawno przestała być kawą" → long-winded metafora, REWRITE: „mleko w proszku plus letnia woda"
- „w świecie, w którym..." / „nie każdego dnia..." → filozoficzne openery, REWRITE bez
- „niekompromisowa jakość", „prawdziwa esencja", „duch przygody" → puste słowa, REWRITE

## Zakazy biznesowe (safety — nigdy nie pisz):
- „24h wysyłka" / „magazyn w Polsce" / „D+1" (dropshipping, realnie 10-14 dni)
- „za pobraniem" / „COD" / „raty" / „PayPo" / „Klarna" / „Twisto" (tylko przedpłata)
- „tylko dziś" / „zostało X sztuk" (fake urgency — chyba że PRAWDZIWE stany magazynowe)

## Co DZIAŁA (wzorzec Problem section — wg reference/copy.md):
```
[SECTION LABEL] + [HEADLINE pytanie/stwierdzenie]
[BODY: Znasz to uczucie. KONKRETNA SYTUACJA. KONKRETNA KONSEKWENCJA. KONKRETNA FRUSTRACJA.]
[AGITACJA: statystyka/konsekwencja + drugie zdanie rozwiewające]
```

## Hero headline (najważniejszy element)
Max 10 słów (mobile max 6). Trafia w ból LUB obiecuje wynik. Formule:
- „[Wynik] bez [ból]" → „Espresso bez adresu"
- „[Wynik] w [czas]" → „Profesjonalny espresso w 3 minuty"
- „Koniec z [ból]" → „Koniec z kapsułkami ze stacji"

## FAQ answers
- Minimum 80 znaków per answer (rozwiewaj obiekcję, daj konkret)
- Ton: rzeczowy, uspokajający, BEZ korporacyjnego żargonu

## Testimonials
- Minimum 80 znaków per cytat
- Formuła: „[WĄTPLIWOŚĆ]. [CO ZROBIŁEM]. [KONKRETNY WYNIK]. [EMOCJA]."
- Bez sentymentalizmu typu „zmieniło moje życie"

# KONTEKST MARKI (z _brief.md)

PROMPT_END
cat "$BRIEF_FILE" >> "$PROMPT_FILE"

cat >> "$PROMPT_FILE" <<PROMPT_END

# OBECNE COPY (do rewrite)

Poniżej JSON z obecnymi tekstami per sekcja. Zachowaj DOKŁADNIE strukturę JSON (te same klucze), zmień tylko wartości tekstowe. Zachowaj \`<em>...</em>\` markery w headline'ach (brass italic accent).

\`\`\`json
$(cat "$COPY_JSON")
\`\`\`

# WYMAGANY FORMAT ODPOWIEDZI

ZWRÓĆ TYLKO JSON (bez explanations, bez \`\`\`). Dokładnie te same klucze, nowe wartości. Polskie znaki (ą ę ć ł ś ź ż ó ń) poprawnie. \`<em>...</em>\` tagi zachowane.

Jeśli w jakiejś sekcji NIC NIE TRZEBA POPRAWIAĆ — zwróć oryginalną wartość (ale sprawdź każdą sekcję świeżym okiem — większość landingów ma zbyt wiele słów).

START:
PROMPT_END

echo "   ✅ Prompt: $PROMPT_FILE ($(wc -l < $PROMPT_FILE) linii)"

echo "📤 [4/6] Submit do Manus (manus-ask edge function)..."
PROMPT_CONTENT=$(cat "$PROMPT_FILE" | node -e "console.log(JSON.stringify(require('fs').readFileSync(0, 'utf8')))")
SUBMIT_RESPONSE=$(curl -s -X POST "$SUPA/functions/v1/manus-ask" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"content\": $PROMPT_CONTENT}")

TASK_ID=$(echo "$SUBMIT_RESPONSE" | node -e "
const d = JSON.parse(require('fs').readFileSync(0, 'utf8'));
console.log(d.task_id || d.data?.task_id || d.task?.id || '');
")

if [ -z "$TASK_ID" ]; then
  echo "   ❌ Nie mogę wyciągnąć task_id z response:"
  echo "$SUBMIT_RESPONSE" | head -c 500
  exit 1
fi

echo "   ✅ task_id: $TASK_ID"
echo "$TASK_ID" > "/c/tmp/manus-task-$SLUG.txt"

echo "⏳ [5/6] Polling manus-get-result co 20s (max 15 min)..."
MAX_ATTEMPTS=45  # 45 * 20s = 15 min
for i in $(seq 1 $MAX_ATTEMPTS); do
  sleep 20
  POLL=$(curl -s -X POST "$SUPA/functions/v1/manus-get-result" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"task_id\": \"$TASK_ID\"}")

  STATUS=$(echo "$POLL" | node -e "
  try { const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.status || d.task?.status || d.data?.status || 'unknown'); } catch(e) { console.log('parse-error'); }
  ")

  printf "   [%02d/%02d] status=%s\n" "$i" "$MAX_ATTEMPTS" "$STATUS"

  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "done" ] || [ "$STATUS" = "stopped" ]; then
    echo "   ✅ Task done. Extracting response..."
    OUT_FILE="/c/tmp/manus-copy-$SLUG.json"
    # Response zawiera result w różnych polach — wyciągnij JSON
    echo "$POLL" | node -e "
    const d = JSON.parse(require('fs').readFileSync(0, 'utf8'));
    const raw = d.result || d.data?.result || d.task?.result || d.task?.output || '';
    // Extract JSON z markdown code block jeśli jest
    const match = raw.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/) || raw.match(/(\{[\s\S]*\})/);
    const json = match ? match[1] : raw;
    console.log(json);
    " > "$OUT_FILE"
    echo "   ✅ Zapisane: $OUT_FILE"
    echo ""
    echo "📋 [6/6] Następny krok:"
    echo "   node scripts/apply-copy.mjs $SLUG"
    exit 0
  fi

  if [ "$STATUS" = "failed" ] || [ "$STATUS" = "error" ]; then
    echo "   ❌ Task failed: $POLL"
    exit 1
  fi
done

echo "⏱  Timeout — task nadal running po 15 min."
echo "   Sprawdź ręcznie: curl -X POST $SUPA/functions/v1/manus-get-result -d '{\"task_id\":\"$TASK_ID\"}'"
exit 2
