// bud-go — brandowany krótki link do panelu sesji.
// tomekniedzwiecki.pl/b/{code}  (rewrite Vercel) → ta funkcja → 302 do panelu.
// Kod (bud_short_links) jest krótki i nieprzewidywalny; UTM dodajemy TU,
// server-side, więc odbiorca SMS widzi tylko czysty /b/{code} (nie scam-link),
// a atrybucja i tak działa po przekierowaniu.
//
// ⚠️ DEPLOY: --no-verify-jwt (publiczny endpoint nawigacyjny, GET, bez auth).

import { createClient } from "jsr:@supabase/supabase-js@2";

const PANEL = 'https://tomekniedzwiecki.pl/sklep/'

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const code = (url.searchParams.get('c') || '').trim()
  let dest = PANEL   // fallback: czysty panel (gdy kod nieznany)
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (code && /^[0-9A-Za-z]{4,16}$/.test(code) && SUPABASE_URL && SERVICE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
      const { data } = await supabase.from('bud_short_links').select('session_id, clicks').eq('code', code).maybeSingle()
      if (data && data.session_id) {
        dest = `${PANEL}?id=${data.session_id}&utm_source=sms&utm_medium=sms`
        // licznik kliknięć — fire and forget (nie blokuje przekierowania)
        supabase.from('bud_short_links').update({ clicks: ((data.clicks as number) || 0) + 1 }).eq('code', code).then(() => {}, () => {})
      }
    } catch (_e) { /* zostaje fallback */ }
  }
  return new Response(null, { status: 302, headers: { 'Location': dest, 'Cache-Control': 'no-store' } })
})
