// bud-mockup — 4 MAKIETY strony sklepu w 4 RÓŻNYCH stylach dla wybranego produktu z
// lejka /sklep. AI (gpt-5.1) dobiera 4 zróżnicowane kierunki wizualne pod PRODUKT +
// USTALENIA (dla kogo / kąt / ton). Każdy styl → pionowy obraz makiety (gpt-image-2,
// referencja = zdjęcie produktu ze snapshotu AliExpress). User wybiera 1 styl.
//
// PER-SESJA (bud_sessions.mockups) — bo zależy od ustaleń konkretnego usera (NIE cache per-produkt).
// Generowanie w TLE (waitUntil) — 4 obrazy. ⚠️ DEPLOY: --no-verify-jwt.
// POST { sessionId, product, force? } -> { mockups:[{style,label,url}] } | { pending:true }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl', 'https://www.tomekniedzwiecki.pl', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
function cors(origin: string | null): Record<string, string> {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MODEL = Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.1';
function json(b: Record<string, unknown>, s: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...c, 'Content-Type': 'application/json' } });
}

// fetch z twardym timeoutem — generate-image (gpt-image-2 medium) potrafi wisieć.
// Bez tego JEDEN zawieszony obraz blokuje Promise.all i komplet makiet NIGDY się nie
// zapisuje (front czeka do końca sesji). Z timeoutem worst-case = MS, a resztę i tak
// zapisujemy cząstkowo (allSettled).
async function fetchTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

// deno-lint-ignore no-explicit-any
function stylesPrompt(product: any, snap: any, ust: any): string {
  const name = String(product?.name || product?.nazwa || snap?.title || 'produkt').slice(0, 120);
  const cat = String(product?.category || product?.kategoria || '').slice(0, 60);
  const dla = String(ust?.dla_kogo || '').slice(0, 200);
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 200);
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120);
  return `Jesteś dyrektorem artystycznym marek e-commerce na rynek polski. Dla jednoproduktowego sklepu zaprojektuj DOKŁADNIE 4 RÓŻNE kierunki wizualne (style), z których klient wybierze jeden.

Produkt: „${name}"${cat ? ` (kategoria: ${cat})` : ''}.
${dla ? `Dla kogo: ${dla}.` : ''}${kat ? ` Kąt/wyróżnik: ${kat}.` : ''}${ton ? ` Ton marki: ${ton}.` : ''}

Każdy z 4 stylów ma być WYRAŹNIE inny (inna paleta, typografia, nastrój) i sensownie dopasowany do produktu i odbiorcy — unikaj 4 wariantów tego samego „czysty minimalizm". Sięgaj świadomie po różne kierunki (np. premium/elegancki, energetyczny/viralowy, ciepły/organiczny, odważny/nowoczesny, retro, techniczny — dobierz pod TEN produkt).

Dla każdego stylu zwróć:
- "key": krótki identyfikator (a-z, bez spacji),
- "label": nazwa stylu po polsku (2-4 słowa, atrakcyjna dla klienta),
- "brief": konkretny opis wizualny PO ANGIELSKU dla generatora obrazu (paleta z kolorami, typografia, nastrój, charakter UI) — 1-2 zdania.

Zwróć WYŁĄCZNIE JSON: {"styles":[{"key":"...","label":"...","brief":"..."}, ...4 sztuki]}`;
}

// deno-lint-ignore no-explicit-any
function imagePrompt(product: any, snap: any, ust: any, brief: string): string {
  const name = String(product?.name || product?.nazwa || snap?.title || 'produkt').slice(0, 120);
  const dla = String(ust?.dla_kogo || '').slice(0, 160);
  return `Realistic VERTICAL (portrait) mockup of a HIGH-CONVERTING one-product e-commerce landing page (US DTC style) for the product in the reference image. Website design preview to show a client "this is how your store could look".

Product: ${name}.${dla ? ` Target customer: ${dla}.` : ''}
Visual style for THIS mockup: ${brief}

CRITICAL: the product shown MUST faithfully match the reference image (same object, shape, color, set). Render the ACTUAL product, not a generic stand-in.

Layout top-to-bottom (conversion-optimized): 1) HERO — large product shot IN USE + benefit-led Polish headline (not the product name) + 1-line subtitle + ONE high-contrast CTA button "Kup teraz" + price + ★★★★★ rating with review count; 2) social-proof strip (stars, liczba opinii, „viralowy hit z TikToka"); 3) trust bar (płatność przy odbiorze · 14 dni na zwrot · bezpieczna płatność); 4) 3 BENEFITS with icons (benefit-led); 5) product in use / lifestyle; 6) customer REVIEWS with stars + avatars; 7) guarantee / risk-reversal block with a badge/seal; 8) final CTA with price. Suggest a sticky bottom bar with price + "Kup teraz".

Polish texts. Realistic, premium interface (NOT a placeholder template). One consistent palette and typography per the style above; the CTA button must visually pop (high contrast). No foreign brand logos, no fake countdown timers. High quality, sharp, crisp UI.`;
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c });
  if (req.method !== 'POST') return json({ error: 'metoda_niedozwolona' }, 405, c);
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
    const CRON = Deno.env.get('SPAR_CRON_SECRET') || '';
    // deno-lint-ignore no-explicit-any
    let body: { sessionId?: string; product?: any; force?: boolean };
    try { body = await req.json(); } catch { return json({ error: 'nieprawidlowy_json' }, 400, c); }
    const sessionId = (body.sessionId || '').trim();
    if (!sessionId || !UUID_RE.test(sessionId)) return json({ error: 'nieprawidlowa_sesja' }, 400, c);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: session } = await supabase.from('bud_sessions').select('id, auth_user_id, ustalenia, mockups').eq('id', sessionId).maybeSingle();
    if (!session) return json({ error: 'nieprawidlowa_sesja' }, 404, c);
    const authUser = await verifyAuthUser(req, supabase);
    if (ownerDenied(session.auth_user_id as string | null, authUser)) return json({ error: 'wymagane_logowanie' }, 403, c);

    // deno-lint-ignore no-explicit-any
    const product: any = (body.product && typeof body.product === 'object') ? body.product : null;
    if (!product || !(product.name || product.nazwa)) return json({ error: 'brak_produktu' }, 400, c);

    // CACHE per-sesja — komplet 4 makiet gotowy.
    const existing = Array.isArray(session.mockups) ? session.mockups : null;
    if (!body.force && existing && existing.length >= 4 && existing.every((m: any) => m && m.url)) {
      return json({ mockups: existing, cached: true }, 200, c);
    }

    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'mockups', p_ttl_sec: 360 });
    if (!lock) return json({ pending: true }, 202, c);

    // snapshot produktu (zdjęcie-referencja + tytuł) — z bud_tt_products
    let snap: Record<string, unknown> | null = null;
    try {
      const pkId = String(product.id || '');
      if (pkId && UUID_RE.test(pkId)) {
        const { data: row } = await supabase.from('bud_tt_products').select('ali_snapshot').eq('id', pkId).maybeSingle();
        snap = (row && row.ali_snapshot) || null;
      }
    } catch { /* */ }
    const refUrl = String((snap && (snap as any).main_image) || product.image || product.cover || '').trim();
    const ust = session.ustalenia || {};

    const genTask = (async () => {
      try {
        // 1) AI: 4 zróżnicowane style pod produkt + ustalenia
        let styles: Array<{ key: string; label: string; brief: string }> = [];
        try {
          const r = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
            method: 'POST', headers: { authorization: `Bearer ${OPENAI_API_KEY}`, 'content-type': 'application/json' },
            body: JSON.stringify({ model: MODEL, reasoning_effort: 'low', response_format: { type: 'json_object' }, messages: [{ role: 'user', content: stylesPrompt(product, snap, ust) }] }),
          }, 'bud-mockup/styles');
          const d = await r.json();
          const txt = d?.choices?.[0]?.message?.content || '{}';
          const parsed = JSON.parse(txt);
          styles = Array.isArray(parsed.styles) ? parsed.styles.slice(0, 4) : [];
        } catch (e) { console.error('[bud-mockup] styles err', e); }
        if (styles.length < 4) {
          // fallback: 4 uniwersalne kierunki
          const fb = [
            { key: 'premium', label: 'Premium / elegancki', brief: 'Premium minimal: off-white & deep charcoal, refined serif headings, generous whitespace, subtle gold accent, calm and trustworthy.' },
            { key: 'viral', label: 'Energetyczny / viralowy', brief: 'Bold viral DTC: vivid accent color, heavy grotesque type, punchy badges, high-energy, social-proof heavy.' },
            { key: 'organic', label: 'Ciepły / naturalny', brief: 'Warm organic: sand & terracotta palette, rounded soft UI, friendly humanist sans, cozy lifestyle mood.' },
            { key: 'modern', label: 'Nowoczesny / techniczny', brief: 'Modern tech: dark UI, electric blue accent, crisp geometric sans, sharp cards, sleek and precise.' },
          ];
          styles = fb;
        }

        // 2) 4 obrazy równolegle (gpt-image-2, medium — 4 podglądy do wyboru; finalna jakość w landingu).
        // allSettled + twardy timeout 110s/obraz: jeden zawieszony/padnięty obraz NIE blokuje
        // pozostałych ani nie wisi w nieskończoność. Zapisujemy cząstkowo (co najmniej 1).
        const settled = await Promise.allSettled(styles.map(async (st) => {
          const r = await fetchTimeout(`${SUPABASE_URL}/functions/v1/generate-image`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON },
            body: JSON.stringify({ prompt: imagePrompt(product, snap, ust, st.brief), provider: 'gpt-image-2', quality: 'medium', aspect_ratio: '3:4', type: 'mockup', count: 1, ...(refUrl ? { reference_image_url: refUrl } : {}) }),
          }, 110_000);
          if (!r.ok) throw new Error(`gen HTTP ${r.status}`);
          const d = await r.json().catch(() => null);
          const url = d?.images?.[0]?.url;
          if (!url || typeof url !== 'string' || url.startsWith('data:')) throw new Error('brak URL');
          return { style: st.key, label: st.label, brief: st.brief, url };
        }));
        const mockups = settled
          .map((s, i) => { if (s.status === 'fulfilled') return s.value; console.error('[bud-mockup] obraz padł', styles[i]?.key, String(s.reason).slice(0, 120)); return null; })
          .filter(Boolean);
        if (mockups.length) {
          // Zapis nawet gdy <4 — front pokaże to, co się udało (lepsze niż czekanie 6 min na komplet).
          await supabase.from('bud_sessions').update({ mockups }).eq('id', sessionId);
          if (mockups.length < 4) console.warn('[bud-mockup] zapisano cząstkowo:', mockups.length, '/ 4');
        } else {
          console.error('[bud-mockup] 0 makiet — żaden obraz się nie wygenerował (front pokaże retry po timeoucie)');
        }
      } catch (e) {
        console.error('[bud-mockup] gen task error:', e);
      }
      // Locka nie zwalniamy — TTL (anty-runaway).
    })();
    try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(genTask); } catch (_) { /* */ }

    return json({ pending: true }, 202, c);
  } catch (e) {
    console.error('[bud-mockup] ERROR:', e);
    return json({ error: 'blad_serwera' }, 500, c);
  }
});
