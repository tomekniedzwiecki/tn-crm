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

// fetch z twardym timeoutem — generate-image (Gemini) nie może wisieć w nieskończoność.
async function fetchTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try { return await fetch(url, { ...init, signal: ctrl.signal }) }
  finally { clearTimeout(t) }
}

// Fallback 4 uniwersalnych konceptów reklamy, gdy model nie zwróci poprawnego JSON-a
// (spójne z fallbackiem stylów w bud-mockup) — reklamy nie padają „na pusto".
// deno-lint-ignore no-explicit-any
function fallbackConcepts(product: any, ust: any): Array<{ headline: string; primary_text: string; image_prompt: string }> {
  const name = String(product?.nazwa || product?.name || 'ten produkt').slice(0, 80)
  const dla = String(ust?.dla_kogo || '').slice(0, 120)
  const sceneSuffix = ` Realistic advertising photo of the product from the reference image in a natural everyday context, attractive lighting, premium feel, product faithfully matching the reference.${dla ? ` Audience vibe: ${dla}.` : ''}`
  return [
    { headline: `${name} — hit, o którym mówi cały TikTok`, primary_text: `Zobacz, dlaczego ${name} podbija sieć. Prosty sposób, żeby rozwiązać problem raz a dobrze. Sprawdź — płatność przy odbiorze.`, image_prompt: `Hero product shot of ${name} as the centerpiece.${sceneSuffix}` },
    { headline: `Problem znika w kilka sekund`, primary_text: `Znasz to uczucie, gdy coś po prostu działa? ${name} robi dokładnie to. Zamów za pobraniem i przekonaj się sam.`, image_prompt: `Before/after style demonstration of ${name} solving a problem.${sceneSuffix}` },
    { headline: `Idealny prezent, który zaskakuje`, primary_text: `Szukasz czegoś, co naprawdę ucieszy bliską osobę? ${name} trafia w punkt. Zamów dziś, zapłać przy odbiorze.`, image_prompt: `Lifestyle gifting scene featuring ${name}, warm emotional mood.${sceneSuffix}` },
    { headline: `Tysiące zadowolonych klientów`, primary_text: `${name} pokochali klienci w całej Polsce. Dołącz do nich — bez ryzyka, z płatnością przy odbiorze i zwrotem 14 dni.`, image_prompt: `Social-proof styled scene with ${name}, clean studio look with 5-star feel.${sceneSuffix}` },
  ]
}

// Pełny prompt grafiki reklamowej — gdy model nie poda image_prompt, budujemy realną
// scenerię (zamiast gołego nagłówka, który dawał losowe kadry Gemini).
// deno-lint-ignore no-explicit-any
function adImagePrompt(cpt: { headline?: string; primary_text?: string; image_prompt?: string }, product: any, ust: any): string {
  const explicit = String(cpt?.image_prompt || '').trim()
  if (explicit.length > 20) return explicit
  const name = String(product?.nazwa || product?.name || 'product').slice(0, 80)
  const dla = String(ust?.dla_kogo || '').slice(0, 120)
  const hook = String(cpt?.headline || '').slice(0, 80)
  return `Realistic, scroll-stopping advertising photo for a Facebook/Instagram ad. Subject: the product from the reference image (${name}), shown in a natural, attractive real-life context that fits the message "${hook}". The product MUST faithfully match the reference image (same object, shape, color).${dla ? ` Target customer vibe: ${dla}.` : ''} Premium commercial lighting, sharp, high quality, no text overlays, no foreign brand logos, no fake badges.`
}

// deno-lint-ignore no-explicit-any
function copyPrompt(product: any, ust: any, style: string, snapTitle = ''): string {
  const name = String(product?.nazwa || product?.name || 'produkt').slice(0, 120)
  const cat = String(product?.kategoria || product?.category || '').slice(0, 60)
  const aliTitle = String(snapTitle || '').slice(0, 200)
  const dla = String(ust?.dla_kogo || '').slice(0, 200)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 200)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const ctx = (dla || kat || ton || style)
    ? `\n\nUSTALENIA (dopasuj reklamy DOKŁADNIE do nich):${dla ? `\n- Dla kogo: ${dla}` : ''}${kat ? `\n- Kąt/wyróżnik: ${kat}` : ''}${ton ? `\n- Ton marki: ${ton}` : ''}${style ? `\n- Styl wizualny sklepu: ${style}` : ''}`
    : ''
  return `Jesteś dyrektorem kreatywnym reklam e-commerce na rynek polski. Dla produktu „${name}"${cat ? ` (kategoria: ${cat})` : ''}${aliTitle ? `\nPełny opis produktu (z aukcji): „${aliTitle}" — wykorzystaj realne cechy do trafnego copy.` : ''} przygotuj DOKŁADNIE 4 różne koncepty reklamy na Facebook/Instagram — każdy w INNYM kącie (np. problem→rozwiązanie, emocja/bliscy, demonstracja/„wow", dowód społeczny/opinie). To produkt sprzedawany przez landing z płatnością przy odbiorze (COD), model dropshipping→własna marka.${ctx}

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

    // Snapshot z AliExpress (tytuł + lepsze zdjęcie-referencja) — spójnie z bud-mockup.
    // Bez tego copy jest uboższe, a grafiki dostają słabszą referencję.
    let snap: Record<string, unknown> | null = null
    try {
      const pkId = String(product.id || '')
      if (pkId && UUID_RE.test(pkId)) {
        const { data: row } = await supabase.from('bud_tt_products').select('ali_snapshot').eq('id', pkId).maybeSingle()
        snap = (row && row.ali_snapshot) || null
      }
    } catch { /* */ }
    const snapTitle = String((snap && (snap as any).title) || '')
    const refUrl = String((snap && (snap as any).main_image) || product.image || product.cover || '')
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
        // 1) Copy — 1 call gpt-5.1 → 4 koncepty (z fallbackiem gdy JSON padnie)
        let concepts: Array<{ headline?: string; primary_text?: string; image_prompt?: string }> = []
        try {
          const r = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: copyPrompt(product, ust, style, snapTitle) }], response_format: { type: 'json_object' } }),
          }, 'bud-ads-copy')
          if (r.ok) {
            const d = await r.json()
            concepts = (JSON.parse(d.choices?.[0]?.message?.content || '{}').ads || []).slice(0, 4)
          } else { console.error('[bud-ads] copy HTTP', r.status) }
        } catch (e) { console.error('[bud-ads] copy err', e) }
        if (!concepts.length) {
          console.warn('[bud-ads] brak konceptów z modelu — fallback 4 uniwersalne')
          concepts = fallbackConcepts(product, ust)
        }

        // 2) Grafiki — Gemini, równolegle (referencja = foto produktu); allSettled + timeout,
        // pełny image_prompt (adImagePrompt) zamiast gołego nagłówka.
        const settled = await Promise.allSettled(concepts.map(async (cpt) => {
          const ir = await fetchTimeout(`${SUPABASE_URL}/functions/v1/generate-image`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON },
            body: JSON.stringify({ prompt: adImagePrompt(cpt, product, ust), provider: 'gemini', aspect_ratio: '4:5', type: 'ad', count: 1, ...(refUrl ? { reference_image_url: refUrl } : {}) }),
          }, 90_000)
          let image_url = ''
          if (ir.ok) { const id = await ir.json().catch(() => null); const u = id?.images?.[0]?.url; if (u && !String(u).startsWith('data:')) image_url = u }
          else console.error('[bud-ads] image HTTP', ir.status)
          return { headline: String(cpt.headline || ''), primary_text: String(cpt.primary_text || ''), image_url }
        }))
        const ads = settled.map((s, i) => s.status === 'fulfilled'
          ? s.value
          : { headline: String(concepts[i]?.headline || ''), primary_text: String(concepts[i]?.primary_text || ''), image_url: '' })

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
