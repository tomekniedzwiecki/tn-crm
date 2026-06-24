// bud-ads — 4 KREACJE REKLAMOWE (copy + grafika) dla wybranego produktu z lejka /sklep,
// pokazywane jako posty FB w zakładce „Blog". Copy: gpt-5.1 (1 call → 4 koncepty),
// grafiki: generate-image (Gemini, referencja = foto produktu). Cache per-PRODUKT.
// Generowanie w TLE (waitUntil). ⚠️ DEPLOY: --no-verify-jwt.
// POST { sessionId, product, force? } -> { ads:[{headline,primary_text,image_url}] } | { pending:true }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl', 'https://www.tomekniedzwiecki.pl', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500']
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODEL = Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.1'
function json(b: Record<string, unknown>, s: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...c, 'Content-Type': 'application/json' } })
}
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()

// deno-lint-ignore no-explicit-any
function copyPrompt(product: any, ust: any, style: string): string {
  const name = String(product?.nazwa || product?.name || 'produkt').slice(0, 120)
  const cat = String(product?.kategoria || product?.category || '').slice(0, 60)
  const dla = String(ust?.dla_kogo || '').slice(0, 200)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 200)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const ctx = (dla || kat || ton || style)
    ? `\n\nUSTALENIA (dopasuj reklamy DOKŁADNIE do nich):${dla ? `\n- Dla kogo: ${dla}` : ''}${kat ? `\n- Kąt/wyróżnik: ${kat}` : ''}${ton ? `\n- Ton marki: ${ton}` : ''}${style ? `\n- Styl wizualny sklepu: ${style}` : ''}`
    : ''
  return `Jesteś dyrektorem kreatywnym reklam e-commerce na rynek polski. Dla produktu „${name}"${cat ? ` (kategoria: ${cat})` : ''} przygotuj DOKŁADNIE 4 różne koncepty reklamy na Facebook/Instagram — każdy w INNYM kącie (np. problem→rozwiązanie, emocja/bliscy, demonstracja/„wow", dowód społeczny/opinie). To produkt sprzedawany przez landing z płatnością przy odbiorze (COD), model dropshipping→własna marka.${ctx}

Dla każdego konceptu:
- "headline": chwytliwy nagłówek reklamy (max ~10 słów, po polsku),
- "primary_text": główny tekst posta (2-4 zdania, hak w 1. zdaniu, korzyść, lekkie CTA „Sprawdź" / „Zamów za pobraniem"; bez zmyślonych liczb i fałszywej pilności),
- "image_prompt": opis grafiki reklamowej PO ANGIELSKU dla generatora (realistyczne ujęcie produktu w użyciu/kontekście, atrakcyjne, reklamowe; produkt zgodny ze zdjęciem referencyjnym).

Zwróć WYŁĄCZNIE poprawny JSON: {"ads":[{"headline":"...","primary_text":"...","image_prompt":"..."}, ... 4 sztuki]}`
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c })
  if (req.method !== 'POST') return json({ error: 'metoda_niedozwolona' }, 405, c)
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
    const CRON = Deno.env.get('SPAR_CRON_SECRET') || ''
    // deno-lint-ignore no-explicit-any
    let body: { sessionId?: string; product?: any; force?: boolean }
    try { body = await req.json() } catch { return json({ error: 'nieprawidlowy_json' }, 400, c) }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) return json({ error: 'nieprawidlowa_sesja' }, 400, c)

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: session } = await supabase.from('bud_sessions').select('id, auth_user_id, ustalenia, chosen_style, session_ads').eq('id', sessionId).maybeSingle()
    if (!session) return json({ error: 'nieprawidlowa_sesja' }, 404, c)
    const authUser = await verifyAuthUser(req, supabase)
    if (ownerDenied(session.auth_user_id as string | null, authUser)) return json({ error: 'wymagane_logowanie' }, 403, c)

    // deno-lint-ignore no-explicit-any
    const product: any = (body.product && typeof body.product === 'object') ? body.product : null
    if (!product || !(product.nazwa || product.name)) return json({ error: 'brak_produktu' }, 400, c)
    const refUrl = String(product.image || product.cover || '')
    const ust = session.ustalenia || {}
    const style = String(session.chosen_style || '')

    // PER-SESJA (reklamy zależą od ustaleń konkretnego usera, nie cache per-produkt)
    if (!body.force && Array.isArray(session.session_ads) && session.session_ads.length) {
      return json({ ads: session.session_ads, cached: true }, 200, c)
    }

    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'ads', p_ttl_sec: 300 })
    if (!lock) return json({ pending: true }, 202, c)

    const genTask = (async () => {
      try {
        // 1) Copy — 1 call gpt-5.1 → 4 koncepty
        const r = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: copyPrompt(product, ust, style) }], response_format: { type: 'json_object' } }),
        }, 'bud-ads-copy')
        if (!r.ok) { console.error('[bud-ads] copy HTTP', r.status); return }
        const d = await r.json()
        let concepts: Array<{ headline?: string; primary_text?: string; image_prompt?: string }> = []
        try { concepts = (JSON.parse(d.choices?.[0]?.message?.content || '{}').ads || []).slice(0, 4) } catch { concepts = [] }
        if (!concepts.length) { console.error('[bud-ads] brak konceptów'); return }

        // 2) Grafiki — Gemini, równolegle (referencja = foto produktu)
        const ads = await Promise.all(concepts.map(async (cpt) => {
          let image_url = ''
          try {
            const ir = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON },
              body: JSON.stringify({ prompt: String(cpt.image_prompt || cpt.headline || ''), provider: 'gemini', aspect_ratio: '4:5', type: 'ad', count: 1, ...(refUrl ? { reference_image_url: refUrl } : {}) }),
            })
            if (ir.ok) { const id = await ir.json().catch(() => null); const u = id?.images?.[0]?.url; if (u && !String(u).startsWith('data:')) image_url = u }
            else console.error('[bud-ads] image HTTP', ir.status)
          } catch (e) { console.error('[bud-ads] image err', e) }
          return { headline: String(cpt.headline || ''), primary_text: String(cpt.primary_text || ''), image_url }
        }))

        await supabase.from('bud_sessions').update({ session_ads: ads }).eq('id', sessionId)
      } catch (e) { console.error('[bud-ads] gen task error:', e) }
    })()
    try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(genTask) } catch (_) { /* */ }

    return json({ pending: true }, 202, c)
  } catch (e) {
    console.error('[bud-ads] ERROR:', e)
    return json({ error: 'blad_serwera' }, 500, c)
  }
})
