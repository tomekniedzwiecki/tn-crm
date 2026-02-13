#!/bin/bash
# Test webhooks po deployu
# Uruchom: npm run test:webhooks

SUPABASE_URL="https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1"
PASS=0
FAIL=0

echo "=== Test webhookow Supabase ==="
echo ""

# Test 1: tpay-webhook zwraca 200 (bez JWT)
echo -n "1. tpay-webhook dostepny bez JWT... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPABASE_URL/tpay-webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "tr_id=test123&tr_status=TRUE&tr_amount=100")

if [ "$STATUS" = "200" ]; then
  echo "OK (HTTP $STATUS)"
  ((PASS++))
else
  echo "FAIL (HTTP $STATUS) - sprawdz czy deployowano z --no-verify-jwt!"
  ((FAIL++))
fi

# Test 2: tpay-webhook nie zwraca 401 (JWT nie wymagany)
echo -n "2. tpay-webhook nie wymaga autoryzacji... "
if [ "$STATUS" != "401" ]; then
  echo "OK"
  ((PASS++))
else
  echo "FAIL - endpoint wymaga JWT, uzyj: npm run deploy:tpay-webhook"
  ((FAIL++))
fi

# Test 3: tpay-webhook nie zwraca 500 (sekrety OK)
echo -n "3. tpay-webhook sekrety skonfigurowane... "
if [ "$STATUS" != "500" ]; then
  echo "OK"
  ((PASS++))
else
  echo "FAIL - brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY"
  ((FAIL++))
fi

# Test 4: resend-webhook dostepny
echo -n "4. resend-webhook dostepny bez JWT... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPABASE_URL/resend-webhook" \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}')

if [ "$STATUS" != "401" ]; then
  echo "OK (HTTP $STATUS)"
  ((PASS++))
else
  echo "FAIL - uzyj: npm run deploy:resend-webhook"
  ((FAIL++))
fi

echo ""
echo "=== Wynik: $PASS OK, $FAIL FAIL ==="

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "UWAGA: Niektore testy nie przeszly!"
  echo "Sprawdz CLAUDE.md sekcja 'KRYTYCZNE: NIE PSUJ INTEGRACJI TPAY'"
  exit 1
fi

exit 0
