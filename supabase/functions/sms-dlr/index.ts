// sms-dlr — webhook raportów doręczeń (DLR) z SMSAPI.
// SMSAPI woła ten endpoint (notify_url ustawiony w send-sms) ze statusem
// doręczenia każdego SMS. Aktualizujemy spar_sms po smsapi_id (= MsgId).
//
// ⚠️ DEPLOY: --no-verify-jwt (zewnętrzny callback; autoryzacja tokenem w URL):
//   npx supabase functions deploy sms-dlr --no-verify-jwt
//
// SMSAPI wysyła parametry w query (GET) ALBO w body (POST form/json):
//   MsgId   — id wiadomości (nasz spar_sms.smsapi_id)
//   status  — DELIVERED / UNDELIVERED / EXPIRED / REJECTED / UNKNOWN / SENT / QUEUE / ACCEPTED
//   donedate — unix ts doręczenia (opcjonalnie)
// Obsługujemy oba transporty, bo konfiguracja konta bywa różna.

import { createClient } from "jsr:@supabase/supabase-js@2";

const DELIVERED = new Set(['DELIVERED'])
const FAILED = new Set(['UNDELIVERED', 'EXPIRED', 'REJECTED', 'UNKNOWN', 'ERROR', 'FAILED'])
// SMSAPI wysyła status DLR albo TEKSTOWO (DELIVERED/UNDELIVERED/…), albo
// NUMERYCZNIE (push-DLR — tak robi konto Tomka, stąd „404"). Mapujemy kody
// SMSAPI na nazwy. Potwierdzone: 403=SENT (z dokumentacji SMSAPI), kody
// sekwencyjne → 404=DELIVERED, 405=UNDELIVERED, 406=FAILED, 402=EXPIRED.
const NUM_STATUS: Record<string, string> = {
  '401': 'QUEUE', '402': 'EXPIRED', '403': 'SENT', '404': 'DELIVERED',
  '405': 'UNDELIVERED', '406': 'FAILED', '407': 'REJECTED', '408': 'UNKNOWN', '409': 'QUEUE',
}

function ok(): Response { return new Response('ok', { status: 200 }) }

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const SECRET = Deno.env.get('SPAR_CRON_SECRET')
    const token = url.searchParams.get('token') || ''
    if (!SECRET || token !== SECRET) return new Response('forbidden', { status: 403 })

    // Parametry: query (GET) + body (POST form/json) scalone.
    const params: Record<string, string> = {}
    url.searchParams.forEach((v, k) => { params[k] = v })
    if (req.method === 'POST') {
      const ct = req.headers.get('content-type') || ''
      try {
        if (ct.includes('application/json')) {
          const j = await req.json() as Record<string, unknown>
          for (const k of Object.keys(j)) params[k] = String(j[k])
        } else {
          const t = await req.text()
          new URLSearchParams(t).forEach((v, k) => { params[k] = v })
        }
      } catch { /* zostaje to, co z query */ }
    }

    const msgId = params.MsgId || params.msg_id || params.id || ''
    const rawStatus = (params.status || params.STATUS || '').toString().toUpperCase()
    // numeryczny kod SMSAPI → nazwa; tekstowy zostaje jak jest
    const status = /^\d+$/.test(rawStatus) ? (NUM_STATUS[rawStatus] || rawStatus) : rawStatus
    if (!msgId) return ok()   // brak id — nic do zrobienia, ale potwierdź (bez retry)

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return new Response('config', { status: 500 })
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // doneDate (unix) → ISO; fallback teraz.
    const doneTs = params.donedate || params.doneDate || params.done_date || ''
    const doneIso = /^\d{9,}$/.test(String(doneTs))
      ? new Date(parseInt(String(doneTs), 10) * 1000).toISOString()
      : new Date().toISOString()

    const patch: Record<string, unknown> = { dlr_status: status || null, dlr_at: new Date().toISOString() }
    if (DELIVERED.has(status)) { patch.status = 'DELIVERED'; patch.delivered_at = doneIso }
    else if (FAILED.has(status)) { patch.status = status }
    // statusy pośrednie (SENT/QUEUE/ACCEPTED) — tylko ślad w dlr_status, bez delivered_at

    const { error } = await supabase.from('spar_sms').update(patch).eq('smsapi_id', String(msgId))
    if (error) console.error('[sms-dlr] update error:', error)
    // Lustro dla lejka /sklep (bud_sms ma identyczne kolumny). Do 2026-07-02 DLR
    // aktualizował TYLKO spar_sms → statusy SMS-ów sklepu wiecznie puste.
    const { error: budErr } = await supabase.from('bud_sms').update(patch).eq('smsapi_id', String(msgId))
    if (budErr) console.error('[sms-dlr] bud_sms update error:', budErr)
    return ok()
  } catch (e) {
    console.error('[sms-dlr] ERROR:', e instanceof Error ? e.message : String(e))
    return ok()   // 200 zawsze — żeby SMSAPI nie zalewało retry
  }
})
