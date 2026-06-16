// send-sms — wysyłka SMS przez SMSAPI.pl (REST). Używana przez spar-drip
// (reaktywacja leadów nieotwierających maili sekwencji) oraz do testów/salda.
// NIE wysyła nic z własnej inicjatywy — tylko na żądanie.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (funkcja sama autoryzuje sekretem):
//   npx supabase functions deploy send-sms --no-verify-jwt
//
// AKCJE (POST JSON) — nagłówek x-cron-secret LUB x-admin-secret == SPAR_CRON_SECRET:
//   { action:'balance' }                       → saldo punktów konta SMSAPI
//   { action:'send', to, message, test? }      → wyślij SMS
//        test:true  = tryb testowy SMSAPI (bez opłaty i bez doręczenia)
//        realna wysyłka wymaga ENV SMS_ENABLED=1 (bezpiecznik na czas budowy)
//
// ENV:
//   SMSAPI_TOKEN   (wymagany) — token OAuth2 z panelu SMSAPI
//   SMSAPI_SENDER  (opcjonalny) — zatwierdzona nazwa nadawcy (FULL). Bez niej
//                  używamy wspólnego nadawcy „Test" (działa przed rejestracją).
//   SMS_ENABLED    ('1' = realne wysyłki dozwolone; inaczej przechodzi tylko test)

const SMSAPI_BASE = 'https://api.smsapi.pl'

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

// GSM-7 safe: transliteruje znaki spoza podstawowego GSM (polskie diakrytyki,
// typograficzne cudzysłowy „"''«», myślniki – —, wielokropek …, nbsp), które
// inaczej wymuszają kodowanie UCS-2 (70 zn./segment zamiast 160 = drożej).
const GSM_MAP: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  '„': '"', '”': '"', '“': '"', '‟': '"', '«': '"', '»': '"',
  '‚': "'", '’': "'", '‘': "'", '‛': "'", '–': '-', '—': '-', '‑': '-', '…': '...', ' ': ' ',
}
function gsmSafe(str: unknown): string {
  return String(str || '').split('').map((c) => (c in GSM_MAP ? GSM_MAP[c] : c)).join('')
}

// Numer → format SMSAPI (same cyfry z prefiksem kraju, PL = 48XXXXXXXXX).
function normalizePhone(raw: unknown): string | null {
  let d = String(raw || '').replace(/\D/g, '')
  if (!d) return null
  if (d.startsWith('00')) d = d.slice(2)            // 0048... → 48...
  if (d.length === 9) d = '48' + d                  // krajowy 9-cyfrowy → +48
  if (d.startsWith('48') && d.length === 11) return d
  if (d.length >= 11 && d.length <= 15) return d     // już z prefiksem innego kraju
  return null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const SECRET = Deno.env.get('SPAR_CRON_SECRET')
    const authed = !!SECRET && (req.headers.get('x-cron-secret') === SECRET || req.headers.get('x-admin-secret') === SECRET)
    if (!authed) return json({ error: 'brak_autoryzacji' }, 401)

    const TOKEN = Deno.env.get('SMSAPI_TOKEN')
    if (!TOKEN) return json({ error: 'brak_SMSAPI_TOKEN' }, 500)
    const SENDER = Deno.env.get('SMSAPI_SENDER') || 'Test'   // „Test" działa bez rejestracji nadawcy
    const SMS_ENABLED = (Deno.env.get('SMS_ENABLED') || '') === '1'
    const apiHeaders = { 'Authorization': `Bearer ${TOKEN}` }

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const action = (body.action as string) || 'send'

    // ── SALDO ──
    if (action === 'balance') {
      const r = await fetch(`${SMSAPI_BASE}/profile?format=json`, { headers: apiHeaders })
      const d = await r.json().catch(() => ({})) as Record<string, unknown>
      return json({ ok: r.ok, points: d.points ?? null, raw: d }, r.ok ? 200 : 502)
    }

    // ── WYSYŁKA ──
    if (action === 'send') {
      const to = normalizePhone(body.to)
      const message = gsmSafe(String(body.message || '').trim())   // kuloodporne na UCS-2
      const test = body.test === true
      if (!to) return json({ error: 'zly_numer' }, 400)
      if (!message) return json({ error: 'pusta_tresc' }, 400)
      if (!test && !SMS_ENABLED) return json({ error: 'sms_wylaczone', info: 'ustaw ENV SMS_ENABLED=1 aby realnie wysylac' }, 403)

      const params = new URLSearchParams()
      params.set('to', to)
      params.set('message', message)
      params.set('from', SENDER)
      params.set('format', 'json')
      params.set('normalize', '1')        // transliteruj ewentualne PL znaki → GSM-7 (taniej, 1 znak = 1)
      params.set('encoding', 'utf-8')
      // Raport doręczenia (DLR): SMSAPI wywoła sms-dlr ze statusem doręczenia
      // (token w URL autoryzuje callback). Tylko realna wysyłka — test nie generuje
      // raportu. SUPABASE_URL jest automatycznie w env edge functions.
      const SB_URL = Deno.env.get('SUPABASE_URL')
      if (!test && SB_URL && SECRET) params.set('notify_url', `${SB_URL}/functions/v1/sms-dlr?token=${encodeURIComponent(SECRET)}`)
      if (test) params.set('test', '1')

      const r = await fetch(`${SMSAPI_BASE}/sms.do`, {
        method: 'POST',
        headers: { ...apiHeaders, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
      const d = await r.json().catch(() => ({})) as Record<string, unknown>
      const item = Array.isArray(d.list) ? (d.list[0] as Record<string, unknown>) : null
      if (!r.ok || d.error || !item) {
        return json({ ok: false, error: d.message || d.error || 'blad_smsapi', raw: d }, 502)
      }
      return json({ ok: true, id: item.id, points: item.points ?? null, status: item.status, parts: d.count ?? 1, test }, 200)
    }

    return json({ error: 'nieznana_akcja' }, 400)
  } catch (e) {
    console.error('[send-sms] ERROR:', e)
    return json({ error: 'blad_serwera' }, 500)
  }
})
