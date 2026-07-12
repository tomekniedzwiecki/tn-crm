// bud-shop-preview — PUBLICZNY podgląd sklepu lejka /sklep. Serwuje bud_sessions.landing_html
// jako text/html (przeglądarka renderuje 1:1 to, co widzi lead in-session). Powód istnienia:
// Supabase Storage wymusza na publicznych plikach .html content-type text/plain (anty-XSS) →
// bezpośredni URL Storage pokazałby ŹRÓDŁO, nie sklep. Edge function serwuje własny content-type.
//
// GET ?sid=<uuid> → text/html (sklep) | strona „jeszcze się generuje" | 400/404.
// Read-only (tylko kolumna landing_html), zero efektów ubocznych. sid = UUID (nieodgadywalny).
// ⚠️ DEPLOY: --no-verify-jwt (publiczny link, bez tokena).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      // Uwaga: *.supabase.co i tak wymusi text/plain (anty-XSS) — HTML jest POBIERANY przez
      // wrapper /sklep/podglad/ (fetch().text(), content-type nieistotny) i renderowany u nas.
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',     // wrapper na tomekniedzwiecki.pl fetchuje cross-origin
      'Cache-Control': 'no-store',            // zawsze świeży (landing_html zmienia się przy regeneracji)
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',    // podgląd, nie strona do indeksu
    },
  })
}

// Prosta strona-zastępnik (spójna wizualnie z ciemnym motywem lejka).
function placeholderPage(title: string, msg: string, status = 200): Response {
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))
  return htmlResponse(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>` +
    `<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#e7e7ea;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">` +
    `<div style="text-align:center;padding:24px;max-width:420px"><div style="font-size:15px;font-weight:700;margin-bottom:6px">${esc(title)}</div>` +
    `<div style="font-size:13px;color:#9a9aa2;line-height:1.6">${esc(msg)}</div></div></body></html>`,
    status,
  )
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return placeholderPage('Nieobsługiwana metoda', 'Użyj GET z parametrem ?sid=', 405)
    }
    const sid = (new URL(req.url).searchParams.get('sid') || '').trim()
    if (!sid || !UUID_RE.test(sid)) {
      return placeholderPage('Brak podglądu', 'Nieprawidłowy lub brakujący identyfikator sklepu.', 400)
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('[bud-shop-preview] brak konfiguracji')
      return placeholderPage('Błąd serwera', 'Podgląd chwilowo niedostępny.', 500)
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data, error } = await supabase
      .from('bud_sessions')
      .select('landing_html')
      .eq('id', sid)
      .maybeSingle()

    if (error) {
      console.error('[bud-shop-preview] db error:', error)
      return placeholderPage('Błąd serwera', 'Podgląd chwilowo niedostępny.', 500)
    }
    if (!data) {
      return placeholderPage('Nie znaleziono', 'Ten sklep nie istnieje albo został usunięty.', 404)
    }
    const html = (data as { landing_html?: unknown }).landing_html
    if (typeof html !== 'string' || html.length < 40) {
      return placeholderPage('Sklep jeszcze się generuje', 'Strona sklepu nie jest jeszcze gotowa — zajrzyj za chwilę.', 200)
    }

    return htmlResponse(html, 200)
  } catch (err) {
    console.error('[bud-shop-preview] ERROR:', err)
    return placeholderPage('Błąd serwera', 'Podgląd chwilowo niedostępny.', 500)
  }
})
