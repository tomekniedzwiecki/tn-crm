import { createClient } from 'jsr:@supabase/supabase-js@2'

// Publiczny endpoint wypisu z maili (List-Unsubscribe + klik w mailu).
// Obsluguje:
//   GET  /unsub?s=<outreach_send_id>  -> strona potwierdzenia, zapis do email_suppressions
//   POST /unsub?s=<outreach_send_id>  -> one-click (RFC 8058), zapis + 200
// Fallback: ?e=<base64url(email)> gdy brak s.

function decodeEmailParam(e: string | null): string | null {
  if (!e) return null
  try {
    // base64url -> base64
    const b64 = e.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(b64)
    return decoded.includes('@') ? decoded.trim().toLowerCase() : null
  } catch {
    return null
  }
}

function page(title: string, message: string): string {
  return `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:480px;margin:12vh auto;padding:32px;text-align:center;">
  <div style="width:56px;height:56px;margin:0 auto 20px;border-radius:14px;background:linear-gradient(135deg,#065f46,#0d9488);display:flex;align-items:center;justify-content:center;font-size:26px;">✓</div>
  <h1 style="font-size:20px;margin:0 0 10px;">${title}</h1>
  <p style="font-size:14px;line-height:1.6;color:#a3a3a3;margin:0;">${message}</p>
  <p style="font-size:12px;color:#666;margin-top:28px;">tomekniedzwiecki.pl</p>
</div></body></html>`
}

async function resolveEmail(supabase: ReturnType<typeof createClient>, url: URL): Promise<string | null> {
  const s = url.searchParams.get('s')
  if (s) {
    const { data } = await supabase
      .from('outreach_sends')
      .select('id, contact:outreach_contacts!inner ( email )')
      .eq('id', s)
      .maybeSingle()
    // deno-lint-ignore no-explicit-any
    const email = (data as any)?.contact?.email
    if (email) return String(email).trim().toLowerCase()
  }
  return decodeEmailParam(url.searchParams.get('e'))
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type' } })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  const isPost = req.method === 'POST'

  try {
    const email = await resolveEmail(supabase, url)

    if (!email) {
      if (isPost) return new Response('bad request', { status: 400 })
      return new Response(
        page('Nie udało się wypisać', 'Link jest nieprawidłowy lub wygasł. Napisz na biuro@tomekniedzwiecki.pl, a wypiszemy Cię ręcznie.'),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // Zapisz na globalnej liscie wypisow (idempotentnie)
    await supabase
      .from('email_suppressions')
      .upsert({ email, reason: 'unsubscribe_link', source: 'outreach' }, { onConflict: 'email' })

    // Oznacz powiazane wysylki tego kontaktu jako excluded (nie wysylaj followupow)
    const s = url.searchParams.get('s')
    if (s) {
      await supabase
        .from('outreach_sends')
        .update({ status: 'excluded', excluded_reason: 'unsubscribed' })
        .eq('id', s)
        .neq('status', 'sent')
    }

    if (isPost) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(
      page('Zostałeś wypisany', 'Nie będziesz już otrzymywać tych wiadomości. Jeśli to pomyłka, po prostu zignoruj — albo napisz na biuro@tomekniedzwiecki.pl.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  } catch (err) {
    console.error('[outreach-unsubscribe] error', err)
    if (isPost) return new Response('error', { status: 500 })
    return new Response(
      page('Coś poszło nie tak', 'Spróbuj ponownie za chwilę lub napisz na biuro@tomekniedzwiecki.pl.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
})
