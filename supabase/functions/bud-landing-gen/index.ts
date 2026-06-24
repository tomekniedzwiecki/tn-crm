// bud-landing-gen — kompletny LANDING HTML (one-product store) dla wybranego produktu,
// generowany przez gpt-5.5 (multimodal: na bazie wygenerowanego MOCKUPU jako referencji wizualnej).
// Self-contained (inline CSS), po polsku, COD/gwarancja. Cache per-PRODUKT, generowanie w TLE.
// ⚠️ DEPLOY: --no-verify-jwt.
// POST { sessionId, product, mockup_url?, force? } -> { landing_html } | { pending:true }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl', 'https://www.tomekniedzwiecki.pl', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500']
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODEL = Deno.env.get('BUD_LANDING_MODEL') || 'gpt-5.5'
const MAX_OUT = 24000
function json(b: Record<string, unknown>, s: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...c, 'Content-Type': 'application/json' } })
}
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()

// deno-lint-ignore no-explicit-any
function prompt(product: any, ust: any, snap: any, images: string[]): string {
  const name = String(snap?.title || product?.nazwa || product?.name || 'produkt').slice(0, 160)
  const cat = String(product?.kategoria || product?.category || '').slice(0, 60)
  const dla = String(ust?.dla_kogo || '').slice(0, 240)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 240)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const brand = String(ust?.nazwa || ust?.brand || '').slice(0, 80)
  const korz = Array.isArray(ust?.korzysci) ? ust.korzysci.slice(0, 6).join('; ') : (Array.isArray(ust?.korzyści) ? ust.korzyści.slice(0, 6).join('; ') : '')
  const imgList = (images || []).slice(0, 6)
  return `Jesteś topowym front-end developerem i copywriterem direct-response. Zbuduj KOMPLETNĄ, produkcyjnie gotową stronę sprzedażową (one-product landing page) dla produktu „${name}"${cat ? ` (kategoria: ${cat})` : ''} na rynek polski. To wersja BLISKA tej, która pójdzie na żywo.

${product?.__hasMockup ? 'Do wiadomości dołączony jest OBRAZ WYBRANEJ MAKIETY — odwzoruj jego styl wizualny (paleta, typografia, charakter), układ i nastrój w realnym HTML/CSS.' : ''}

USTALENIA (trzymaj się ich):${brand ? `\n- Marka: ${brand}` : ''}${dla ? `\n- Dla kogo: ${dla}` : ''}${kat ? `\n- Kąt/wyróżnik: ${kat}` : ''}${ton ? `\n- Ton: ${ton}` : ''}${korz ? `\n- Korzyści: ${korz}` : ''}

ZDJĘCIA PRODUKTU (realne, z AliExpress — UŻYJ ich jako <img src="...">, NIE wymyślaj URL-i):
${imgList.length ? imgList.map((u, i) => `${i + 1}. ${u}`).join('\n') : '(brak — użyj placeholderów [ Zdjęcie: … ])'}

Wymagania:
- Jeden plik HTML, SELF-CONTAINED: cały CSS w <style>, zero zewnętrznych bibliotek/skryptów/fontów (system fonts). Responsywny (mobile-first).
- Sekcje: hero (nagłówek + podtytuł + DUŻE zdjęcie produktu z listy wyżej + przycisk CTA), pasek zaufania (płatność przy odbiorze, dostawa, zwrot 14 dni), korzyści (3 z inline SVG), sekcja „w użyciu" (kolejne realne zdjęcie jeśli jest, inaczej placeholder), opinie klientów (3, gwiazdki), FAQ (3-4), sekcja końcowa CTA z ceną orientacyjną.
- WSZYSTKIE przyciski CTA „Kup teraz" MUSZĄ być linkami: <a href="#" data-cta="kup" class="...">Kup teraz</a> — href podmienimy później na adres kasy. Tekst CTA: „Kup teraz".
- Realne zdjęcia z listy wstaw w hero i sekcji produktu (loading="lazy"). Tam gdzie brak zdjęcia — placeholder <div> z podpisem „[ Zdjęcie: … ]". NIE wymyślaj innych URL-i.
- Copy po polsku, direct-response: hak, korzyści, dowód, CTA. COD i zwrot 14 dni dozwolone. ZAKAZ zmyślonej pilności, fałszywych liczników i „dostawa 24h".
- Estetyka spójna z wybraną makietą, czytelna typografia.

Zwróć WYŁĄCZNIE kod HTML (od <!DOCTYPE html> do </html>), bez komentarzy przed/po, bez bloków \`\`\`.`
}

function extractHtml(raw: string): string {
  let t = (raw || '').trim().replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '')
  const s = t.search(/<!doctype html|<html/i)
  const e = t.toLowerCase().lastIndexOf('</html>')
  if (s !== -1 && e !== -1) t = t.slice(s, e + 7)
  return t
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c })
  if (req.method !== 'POST') return json({ error: 'metoda_niedozwolona' }, 405, c)
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
    // deno-lint-ignore no-explicit-any
    let body: { sessionId?: string; product?: any; mockup_url?: string; force?: boolean }
    try { body = await req.json() } catch { return json({ error: 'nieprawidlowy_json' }, 400, c) }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) return json({ error: 'nieprawidlowa_sesja' }, 400, c)

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: session } = await supabase.from('bud_sessions').select('id, auth_user_id, ustalenia, chosen_style, mockups, landing_html').eq('id', sessionId).maybeSingle()
    if (!session) return json({ error: 'nieprawidlowa_sesja' }, 404, c)
    const authUser = await verifyAuthUser(req, supabase)
    if (ownerDenied(session.auth_user_id as string | null, authUser)) return json({ error: 'wymagane_logowanie' }, 403, c)

    // deno-lint-ignore no-explicit-any
    const product: any = (body.product && typeof body.product === 'object') ? body.product : null
    if (!product || !(product.nazwa || product.name)) return json({ error: 'brak_produktu' }, 400, c)

    // PER-SESJA (landing zależy od ustaleń + wybranej makiety konkretnego usera)
    if (!body.force && session.landing_html) return json({ landing_html: session.landing_html, cached: true }, 200, c)

    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'landing', p_ttl_sec: 400 })
    if (!lock) return json({ pending: true }, 202, c)

    // Wybrana makieta = referencja wizualna; snapshot = realne zdjęcia + tytuł.
    const mocks = Array.isArray(session.mockups) ? session.mockups : []
    const chosen = mocks.find((m: any) => m && m.style === session.chosen_style) || mocks[0] || null
    const mockupUrl = String(body.mockup_url || (chosen && chosen.url) || '')
    product.__hasMockup = !!mockupUrl
    const ust = session.ustalenia || {}
    let snap: Record<string, unknown> | null = null
    try {
      const pkId = String(product.id || '')
      if (pkId && UUID_RE.test(pkId)) { const { data: row } = await supabase.from('bud_tt_products').select('ali_snapshot').eq('id', pkId).maybeSingle(); snap = (row && row.ali_snapshot) || null }
    } catch { /* */ }
    const images = (snap && Array.isArray((snap as any).images)) ? (snap as any).images : [String(product.image || ''), String(product.cover || '')].filter(Boolean)

    const genTask = (async () => {
      try {
        // deno-lint-ignore no-explicit-any
        const content: any[] = [{ type: 'input_text', text: prompt(product, ust, snap, images) }]
        if (mockupUrl) content.push({ type: 'input_image', image_url: mockupUrl })
        const res = await openaiFetchRetry('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({ model: MODEL, input: [{ role: 'user', content }], max_output_tokens: MAX_OUT }),
        }, 'bud-landing-gen')
        if (!res.ok) { console.error('[bud-landing-gen] openai', res.status, (await res.text().catch(() => '')).slice(0, 300)); return }
        const data = await res.json()
        let text = typeof data?.output_text === 'string' ? data.output_text : ''
        if (!text) { for (const it of (data?.output || [])) { if (it?.type === 'message' && Array.isArray(it.content)) for (const cc of it.content) if (cc?.type === 'output_text' && typeof cc.text === 'string') text += cc.text } }
        const html = extractHtml(text)
        if (!html || html.length < 400 || !/<\/html>/i.test(html)) { console.error('[bud-landing-gen] zły HTML (len ' + html.length + ')'); return }
        await supabase.from('bud_sessions').update({ landing_html: html }).eq('id', sessionId)
      } catch (e) { console.error('[bud-landing-gen] gen task error:', e) }
    })()
    try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(genTask) } catch (_) { /* */ }

    return json({ pending: true }, 202, c)
  } catch (e) {
    console.error('[bud-landing-gen] ERROR:', e)
    return json({ error: 'blad_serwera' }, 500, c)
  }
})
