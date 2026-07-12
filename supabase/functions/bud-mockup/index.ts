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
import { productRefs } from "../_shared/bud-refs.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl', 'https://www.tomekniedzwiecki.pl', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
function cors(origin: string | null): Record<string, string> {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MODEL = Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.1';
// Anty-nadużycie kosztowe (wzorzec bud-landing): każda generacja = 4× gpt-image-2
// (~0.16 USD) + dobór stylów gpt-5.1. force=true regeneruje → MUSI podlegać capom,
// inaczej pętla „regeneruj" pali realny koszt. Liczymy z bud_usage (kind='mockup',
// meta.from='mockup-styles' — dokładnie 1 wpis na próbę generacji).
const MAX_MOCKUPS_PER_SESSION = parseInt(Deno.env.get('BUD_MOCKUP_MAX_PER_SESSION') || '6', 10);
const MAX_MOCKUPS_PER_IP_PER_DAY = parseInt(Deno.env.get('BUD_MOCKUP_IP_DAILY') || '12', 10);
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

// T10: alert #sparing przy definitywnej porażce generacji (wzorzec 1:1 z bud-image).
// Błąd Slacka NIGDY nie wywraca generacji — tylko logujemy.
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) { console.error('[bud-mockup] slack-notify: brak SUPABASE_URL/KEY'); return; }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    });
    if (!res.ok) console.error(`[bud-mockup] slack-notify ${type} HTTP`, res.status, await res.text());
  } catch (err) {
    console.error(`[bud-mockup] slack-notify ${type} exception:`, err);
  }
}

// deno-lint-ignore no-explicit-any
function stylesPrompt(product: any, snap: any, ust: any): string {
  const name = String(product?.name || product?.nazwa || snap?.title || 'produkt').slice(0, 120);
  const cat = String(product?.category || product?.kategoria || '').slice(0, 60);
  const dla = String(ust?.dla_kogo || '').slice(0, 200);
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 200);
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120);
  // Tytuł aukcji groundinguje palety w REALNYM produkcie — pomijany przy snapshotach
  // 'search' (fallback wyszukiwarki bywa innym towarem, mylnie ukierunkowałby style).
  const snapTitle = (snap && String(snap.source || '') !== 'search') ? String(snap?.title || '').slice(0, 160) : '';
  return `Jesteś dyrektorem artystycznym marek e-commerce na rynek polski. Dla jednoproduktowego sklepu zaprojektuj DOKŁADNIE 4 RÓŻNE kierunki wizualne (style), z których klient wybierze jeden.

Produkt: „${name}"${cat ? ` (kategoria: ${cat})` : ''}.${snapTitle ? `\nRealny produkt (tytuł aukcji): ${snapTitle} — palety mają WSPÓŁGRAĆ z jego rzeczywistym wyglądem (kolor/materiał), nie kłócić się z nim.` : ''}
${dla ? `Dla kogo: ${dla}.` : ''}${kat ? ` Kąt/wyróżnik: ${kat}.` : ''}${ton ? ` Ton marki: ${ton}.` : ''}

Każdy z 4 stylów ma być WYRAŹNIE inny (inna paleta, typografia, nastrój) i sensownie dopasowany do produktu i odbiorcy — unikaj 4 wariantów tego samego „czysty minimalizm". Sięgaj świadomie po różne kierunki (np. premium/elegancki, energetyczny/viralowy, ciepły/organiczny, odważny/nowoczesny, retro, techniczny — dobierz pod TEN produkt).

Dla każdego stylu zwróć:
- "key": krótki identyfikator (a-z, bez spacji),
- "label": nazwa stylu po polsku (2-4 słowa, atrakcyjna dla klienta),
- "brief": konkretny opis wizualny PO ANGIELSKU dla generatora obrazu (paleta z kolorami, typografia, nastrój, charakter UI) — 1-2 zdania,
- "tokens": TWARDE design-tokens tego stylu (wspólne źródło prawdy dla makiety i późniejszej strony HTML — hexy muszą się zgadzać z briefem): {"palette":[{"role":"tlo","hex":"#RRGGBB"},{"role":"tekst","hex":"#..."},{"role":"akcent","hex":"#..."},{"role":"cta","hex":"#..."},{"role":"sekcja","hex":"#..."}],"headingFont":"charakter nagłówków po angielsku (np. bold geometric sans / elegant editorial serif / rounded friendly sans)","bodyFont":"charakter tekstu","radius":"none|small|medium|pill","shadow":"none|soft|hard-offset","ctaShape":"pill|rounded|sharp","motifs":["1-3 motywy dekoracyjne pasujące do stylu, po polsku"]}.

Zwróć WYŁĄCZNIE JSON: {"styles":[{"key":"...","label":"...","brief":"...","tokens":{...}}, ...4 sztuki]}`;
}

// Zwięzły blok kontekstu z raportu rynku — OPCJONALNY (stare sesje bez raportu działają jak dotąd).
// Etap MAKIETY: ukierunkowuje dobór stylu/komunikatów wg avatara + pozycjonowania marki (+ lead).
// deno-lint-ignore no-explicit-any
function reportContext(report: any): string {
  if (!report || typeof report !== 'object') return '';
  const lead = String(report?.lead || '').slice(0, 300);
  const sekcje = Array.isArray(report?.sekcje) ? report.sekcje : [];
  // NAJBARDZIEJ istotne dla makiety: avatar (styl/estetyka) + marka/pozycjonowanie (ton, charakter)
  const wanted = ['Grupa docelowa', 'Marka i pozycjonowanie'];
  // deno-lint-ignore no-explicit-any
  const pick = (s: any) => {
    const t = String(s?.tytul || '');
    return wanted.some((w) => t.startsWith(w));
  };
  const parts: string[] = [];
  if (lead) parts.push(`Hook: ${lead}`);
  for (const s of sekcje) {
    if (!pick(s)) continue;
    // tytuł + treść tekstowa sekcji (bez wymuszania konkretnego pola — bierzemy stringowe wartości)
    const tytul = String(s?.tytul || '').slice(0, 80);
    // deno-lint-ignore no-explicit-any
    const tresc = Object.entries(s as Record<string, any>)
      .filter(([k, v]) => k !== 'tytul' && typeof v === 'string' && v.trim())
      .map(([, v]) => String(v))
      .join(' ')
      .slice(0, 500);
    if (tytul) parts.push(`${tytul}: ${tresc}`.trim());
  }
  if (!parts.length) return '';
  const block = parts.join('\n').slice(0, 2000);
  return `\n\n[KONTEKST Z RAPORTU RYNKU — wykorzystaj, gdzie pomaga: dopasuj ton, estetykę i obietnicę makiety do tego avatara i pozycjonowania (NIE wypisuj raportu w makiecie):\n${block}]`;
}

// deno-lint-ignore no-explicit-any
function imagePrompt(product: any, snap: any, ust: any, brief: string, brandName = '', report: any = null, tokens: any = null): string {
  const name = String(product?.name || product?.nazwa || snap?.title || 'produkt').slice(0, 120);
  const dla = String(ust?.dla_kogo || '').slice(0, 160);
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 160);
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120);
  // Paleta z design-tokens (hexy) — deterministycznie spina makietę z późniejszą stroną HTML,
  // która dostanie te same tokens jako twardy autorytet.
  const pal = (tokens && Array.isArray(tokens.palette))
    // deno-lint-ignore no-explicit-any
    ? tokens.palette.filter((p: any) => p && p.hex).map((p: any) => `${p.role}: ${p.hex}`).join(', ').slice(0, 220)
    : '';
  return `Realistic VERTICAL (portrait) mockup of a HIGH-CONVERTING, BRAND-BUILDING one-product e-commerce landing page (US DTC style, 2025) for the product in the reference images. Website design preview to show a client "this is how your store could look".

Product: ${name}.${dla ? ` Target customer: ${dla}.` : ''}${kat ? ` Angle/wyróżnik: ${kat}.` : ''}${ton ? ` Brand tone: ${ton}.` : ''}${brandName ? ` Brand name: ${brandName} — show it as the store name/logo in the header.` : ''}
Visual style for THIS mockup: ${brief}${pal ? `\nUse EXACTLY this color palette (hex): ${pal}.` : ''}

CRITICAL: the product shown MUST faithfully match the reference images (same object, shape, color, set). Render the ACTUAL product, not a generic stand-in.

COMPOSITION (CRITICAL — this is a DESIGN PREVIEW of the TOP of the page, not the whole page; fewer sections, BIGGER and LEGIBLE): render top→bottom, as if screenshotted on a phone: 1) thin announcement bar („Płatność przy odbiorze · 14 dni na zwrot"); 2) header with brand name/logo; 3) BIG HERO filling roughly HALF the frame — the product from the reference images rendered LARGE (at least one third of the frame width), shown in use, plus a benefit-led Polish headline (what it DOES, ≤8 words, large type), 1-line subtitle, ONE high-contrast „Kup teraz" button, visible price and a ★★★★★ row; 4) trust icon strip (płatność przy odbiorze · 14 dni na zwrot · bezpieczna płatność · „Znany z TikToka"); 5) at the very bottom, PARTIALLY CUT OFF by the frame edge (suggesting the page scrolls on): the start of a social-proof section — „Znany z TikToka" badge and the first customer review cards with photos. Do NOT cram more sections in — legibility and a big, faithful product beat completeness.

Polish texts, all headlines fully legible (no lorem ipsum, no gibberish glyphs). Realistic, premium interface (NOT a placeholder template). ONE consistent palette and max 2 fonts per the style/tone above; brand name/logo consistent in the header; the CTA button must visually pop (high contrast). No foreign brand logos, no fake countdown timers, no invented review counts. High quality, sharp, crisp UI.${reportContext(report)}`;
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

    // Admin/cron (nagłówek x-admin-secret == SPAR_CRON_SECRET) omija owner-gate i capy
    // — rerolle z panelu / wewnętrzne wywołania. Pusty CRON nigdy nie autoryzuje.
    const isAdmin = !!CRON && req.headers.get('x-admin-secret') === CRON;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: session } = await supabase.from('bud_sessions').select('id, auth_user_id, ustalenia, mockups, brand, market_report, ip').eq('id', sessionId).maybeSingle();
    if (!session) return json({ error: 'nieprawidlowa_sesja' }, 404, c);
    if (!isAdmin) {
      const authUser = await verifyAuthUser(req, supabase);
      if (ownerDenied(session.auth_user_id as string | null, authUser)) return json({ error: 'wymagane_logowanie' }, 403, c);
    }

    // deno-lint-ignore no-explicit-any
    const product: any = (body.product && typeof body.product === 'object') ? body.product : null;
    if (!product || !(product.name || product.nazwa)) return json({ error: 'brak_produktu' }, 400, c);

    // CACHE per-sesja — oddaj to, co jest.
    const existing = Array.isArray(session.mockups) ? session.mockups : null;
    // FIX (audyt regresji #2): próg >=1 zamiast >=3 — partial 1-2/4 z releasem locka wpadał
    // w AUTOMATYCZNĄ pętlę: poll frontu nie dostawał cache, claimował wolny lock i odpalał
    // pełny NOWY batch 4 obrazów, aż do capa sesji. Teraz partial wraca od razu (front pokazuje
    // co jest); dopełnienie do 4 tylko świadomym force=true (podlega capom).
    if (!body.force && existing && existing.length >= 1 && existing.every((m: any) => m && m.url)) {
      return json({ mockups: existing, cached: true }, 200, c);
    }

    // ── CAPY anty-nadużycie (admin omija). Sprawdzane PRZED lockiem i generacją;
    //    force=true też tu trafia (cache zwrócił już wyżej), więc „regeneruj" w pętli
    //    podlega capowi. Fail-open na błędzie zapytania — nie blokuj legalnego usera.
    if (!isAdmin) {
      // (a) cap generacji per sesja. Marker = wpis kosztu OBRAZÓW
      //     bud_usage(kind='image', meta.from='bud-mockup') — DOKŁADNIE 1 na batch,
      //     niezależnie od tego czy style poszły z API czy z fallbacku (to ten sam
      //     genTask). Wybrany zamiast 'mockup-styles', bo ścieżka fallback stylów
      //     NIE loguje 'mockup-styles', a i tak pali 4× gpt-image-2.
      // OKNO 24 h (audyt regresji #2): cap bez okna robił z sesji trwały dead-end po awarii.
      const capDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: sessCount, error: sessErr } = await supabase
        .from('bud_usage')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('kind', 'image')
        .eq('meta->>from', 'bud-mockup')
        .gte('created_at', capDayAgo);
      if (sessErr) {
        console.error('[bud-mockup] session cap count error (fail-open):', sessErr);
      } else if ((sessCount ?? 0) >= MAX_MOCKUPS_PER_SESSION) {
        return json({ error: 'limit_makiet' }, 429, c);
      }

      // (b) dzienny cap per IP — makiety z 24 h po wszystkich sesjach tego IP
      //     (wzorzec bud-landing; liczone z bud_usage.created_at). Brak IP/tabeli → fail-open.
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || (typeof session.ip === 'string' ? session.ip : null);
      if (ip) {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: ipSessions, error: ipSessErr } = await supabase
          .from('bud_sessions')
          .select('id')
          .eq('ip', ip);
        if (ipSessErr) {
          console.error('[bud-mockup] ip sessions query error (fail-open):', ipSessErr);
        } else if (ipSessions && ipSessions.length) {
          const { count: ipCount, error: ipUsageErr } = await supabase
            .from('bud_usage')
            .select('id', { count: 'exact', head: true })
            .eq('kind', 'image')
            .eq('meta->>from', 'bud-mockup')
            .in('session_id', ipSessions.map((r) => r.id))
            .gte('created_at', dayAgo);
          if (ipUsageErr) {
            console.error('[bud-mockup] ip usage count error (fail-open):', ipUsageErr);
          } else if ((ipCount ?? 0) >= MAX_MOCKUPS_PER_IP_PER_DAY) {
            return json({ error: 'limit_makiet_dzienny' }, 429, c);
          }
        }
      } else {
        console.warn('[bud-mockup] brak IP do capa dziennego — fail-open');
      }
    }

    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'mockups', p_ttl_sec: 360 });
    if (!lock) return json({ pending: true }, 202, c);

    // snapshot produktu (zdjęcie-referencja + tytuł) — z bud_tt_products
    let snap: Record<string, unknown> | null = null;
    let curated: string | null = null;
    try {
      const pkId = String(product.id || '');
      if (pkId && UUID_RE.test(pkId)) {
        const { data: row } = await supabase.from('bud_tt_products').select('ali_snapshot, curated_image').eq('id', pkId).maybeSingle();
        snap = (row && row.ali_snapshot) || null;
        curated = (row && (row.curated_image as string)) || null;
      }
    } catch { /* */ }
    // FIX: galeria AliExpress jako reference_images type:'product' (kilka kadrów) — zamiast pojedynczego
    // main_image traktowanego przez legacy `reference_image_url` jako LOGO (→ generował zły produkt).
    // curated_image (panel /trendy) idzie PIERWSZE — snapshot z wyszukiwarki bywa innym produktem.
    const refs = productRefs(snap, product, 4, curated);
    const ust = session.ustalenia || {};
    const brandObj = (session.brand && typeof session.brand === 'object') ? session.brand as Record<string, unknown> : null;
    const brandName = String((brandObj?.chosen_name as string) || (brandObj?.nazwa as string) || '').slice(0, 60);
    // Raport rynku (OPCJONALNY) — ukierunkowuje styl/komunikaty makiety (avatar + pozycjonowanie).
    const marketReport = (session.market_report && typeof session.market_report === 'object') ? session.market_report : null;

    const genTask = (async () => {
      try {
        // 1) AI: 4 zróżnicowane style pod produkt + ustalenia
        // deno-lint-ignore no-explicit-any
        let styles: Array<{ key: string; label: string; brief: string; tokens?: any }> = [];
        try {
          const r = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
            method: 'POST', headers: { authorization: `Bearer ${OPENAI_API_KEY}`, 'content-type': 'application/json' },
            body: JSON.stringify({ model: MODEL, reasoning_effort: 'low', response_format: { type: 'json_object' }, messages: [{ role: 'user', content: stylesPrompt(product, snap, ust) }] }),
          }, 'bud-mockup/styles');
          const d = await r.json();
          // KOSZT: dobór stylów (gpt-5.1) — dotąd nie logowany
          try { const u = d?.usage || {}; const inT = u.prompt_tokens || 0, cT = (u.prompt_tokens_details?.cached_tokens) || 0, oT = u.completion_tokens || 0; await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'mockup', model: MODEL, input_tokens: inT, cached_tokens: cT, output_tokens: oT, cost_usd: (Math.max(0, inT - cT) * 1.25 + cT * 0.125 + oT * 10) / 1_000_000, meta: { from: 'mockup-styles' } }); } catch (_) { /* log nie blokuje */ }
          const txt = d?.choices?.[0]?.message?.content || '{}';
          const parsed = JSON.parse(txt);
          styles = Array.isArray(parsed.styles) ? parsed.styles.slice(0, 4) : [];
        } catch (e) { console.error('[bud-mockup] styles err', e); }
        if (styles.length < 4) {
          // fallback: 4 uniwersalne kierunki (tokens spójne z briefami — landing dostaje je jako twardy autorytet)
          const fb = [
            { key: 'premium', label: 'Premium / elegancki', brief: 'Premium minimal: off-white & deep charcoal, refined serif headings, generous whitespace, subtle gold accent, calm and trustworthy.', tokens: { palette: [{ role: 'tlo', hex: '#faf8f4' }, { role: 'tekst', hex: '#26241f' }, { role: 'akcent', hex: '#b28f4c' }, { role: 'cta', hex: '#26241f' }, { role: 'sekcja', hex: '#f1ede4' }], headingFont: 'refined editorial serif', bodyFont: 'clean humanist sans', radius: 'small', shadow: 'soft', ctaShape: 'sharp', motifs: ['numeracja sekcji jak w magazynie', 'podpisy pod zdjęciami kursywą'] } },
            { key: 'viral', label: 'Energetyczny / viralowy', brief: 'Bold viral DTC: vivid accent color, heavy grotesque type, punchy badges, high-energy, social-proof heavy.', tokens: { palette: [{ role: 'tlo', hex: '#ffffff' }, { role: 'tekst', hex: '#111111' }, { role: 'akcent', hex: '#ff4d2e' }, { role: 'cta', hex: '#ff4d2e' }, { role: 'sekcja', hex: '#f5f5f5' }], headingFont: 'heavy grotesque sans', bodyFont: 'sturdy grotesque sans', radius: 'medium', shadow: 'hard-offset', ctaShape: 'pill', motifs: ['odznaki-naklejki z lekkim obrotem', 'marquee paska zaufania'] } },
            { key: 'organic', label: 'Ciepły / naturalny', brief: 'Warm organic: sand & terracotta palette, rounded soft UI, friendly humanist sans, cozy lifestyle mood.', tokens: { palette: [{ role: 'tlo', hex: '#faf4ec' }, { role: 'tekst', hex: '#3d3129' }, { role: 'akcent', hex: '#c96f4a' }, { role: 'cta', hex: '#c96f4a' }, { role: 'sekcja', hex: '#f3e8da' }], headingFont: 'soft rounded sans', bodyFont: 'friendly humanist sans', radius: 'pill', shadow: 'soft', ctaShape: 'pill', motifs: ['faliste przejścia między sekcjami', 'zdjęcia polaroid z podpisem'] } },
            { key: 'modern', label: 'Nowoczesny / techniczny', brief: 'Modern tech: dark UI, electric blue accent, crisp geometric sans, sharp cards, sleek and precise.', tokens: { palette: [{ role: 'tlo', hex: '#0b0d12' }, { role: 'tekst', hex: '#f2f4f8' }, { role: 'akcent', hex: '#2f7dff' }, { role: 'cta', hex: '#2f7dff' }, { role: 'sekcja', hex: '#141821' }], headingFont: 'crisp geometric sans', bodyFont: 'clean neutral sans', radius: 'small', shadow: 'none', ctaShape: 'rounded', motifs: ['arkusz specyfikacji na ciemnym tle', 'cienkie linie techniczne'] } },
          ];
          styles = fb;
        }

        // 2) 4 obrazy równolegle (gpt-image-2, medium — 4 podglądy do wyboru; finalna jakość w landingu).
        // allSettled + twardy timeout 110s/obraz: jeden zawieszony/padnięty obraz NIE blokuje
        // pozostałych ani nie wisi w nieskończoność. Zapisujemy cząstkowo (co najmniej 1).
        const settled = await Promise.allSettled(styles.map(async (st) => {
          const r = await fetchTimeout(`${SUPABASE_URL}/functions/v1/generate-image`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON },
            body: JSON.stringify({ prompt: imagePrompt(product, snap, ust, st.brief, brandName, marketReport, st.tokens || null), provider: 'gpt-image-2', quality: 'medium', aspect_ratio: '3:4', type: 'mockup', count: 1, ...(refs.length ? { reference_images: refs } : {}) }),
          }, 110_000);
          if (!r.ok) throw new Error(`gen HTTP ${r.status}`);
          const d = await r.json().catch(() => null);
          const url = d?.images?.[0]?.url;
          if (!url || typeof url !== 'string' || url.startsWith('data:')) throw new Error('brak URL');
          // tokens wędrują z makietą (bud_sessions.mockups) → bud-landing-gen czyta je jako
          // twardy design-system wybranego stylu (wspólne źródło prawdy makieta↔strona).
          return { style: st.key, label: st.label, brief: st.brief, tokens: st.tokens || null, url };
        }));
        const mockups = settled
          .map((s, i) => { if (s.status === 'fulfilled') return s.value; console.error('[bud-mockup] obraz padł', styles[i]?.key, String(s.reason).slice(0, 120)); return null; })
          .filter(Boolean);
        // KOSZT: obrazy makiet (gpt-image-2 medium = 0.041 USD/obraz). Rerolle admina
        // z osobnym markerem — nie zjadają capa usera (audyt #7), koszt dalej policzony.
        try { if (mockups.length) await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'image', images: mockups.length, cost_usd: 0.041 * mockups.length, meta: { view: 'mockup', quality: 'medium', from: isAdmin ? 'bud-mockup-admin' : 'bud-mockup' } }); } catch (_) { /* log nie blokuje */ }
        if (mockups.length) {
          // Zapis nawet gdy <4 — front pokaże to, co się udało (lepsze niż czekanie 6 min na komplet).
          await supabase.from('bud_sessions').update({ mockups }).eq('id', sessionId);
          // NB: powiadomienie #sparing NIE leci tu — decyzja Tomka 2026-07-07: pokazujemy tylko
          // makietę WYBRANĄ przez usera, więc ping jest w bud-chat po zapisie chosen_style.
          if (mockups.length < 4) {
            console.warn('[bud-mockup] zapisano cząstkowo:', mockups.length, '/ 4');
            // FIX: zwolnij lock przy partialu, by force-retry mógł dopełnić do 4 (nie czekać na TTL 360s)
            try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'mockups' }); } catch { /* */ }
          }
          // T7: PREWARM lifestyle — landing potrzebuje ich dopiero po wyborze stylu (~1-2 min stąd),
          // a generacja trwa 60-90 s. Odpalamy w tle już teraz → landing startuje bez tego czekania.
          // Fire-and-forget: porażka prewarma NICZEGO nie psuje (landing-gen wygeneruje sam).
          try {
            await fetchTimeout(`${SUPABASE_URL}/functions/v1/bud-landing-gen`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': CRON },
              body: JSON.stringify({ sessionId, product, prewarm: true }),
            }, 8_000);
          } catch { /* prewarm best-effort */ }
        } else {
          console.error('[bud-mockup] 0 makiet — żaden obraz się nie wygenerował');
          // T2: zwolnij lock, żeby retry usera generował OD RAZU (nie po TTL 360 s).
          try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'mockups' }); } catch { /* */ }
          // T10: Tomek ma wiedzieć o padzie przed userem.
          await postSlackSparing('bud_gen_error', { session_id: sessionId, stage: 'makiety (bud-mockup)', error: '0/4 obrazów — żaden nie wygenerował się', product: String(product?.nazwa || product?.name || '') });
        }
      } catch (e) {
        console.error('[bud-mockup] gen task error:', e);
        // T2: pad całego taska = lock w dół, inaczej user wisi do TTL.
        try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'mockups' }); } catch { /* */ }
        await postSlackSparing('bud_gen_error', { session_id: sessionId, stage: 'makiety (bud-mockup)', error: String(e).slice(0, 280), product: String(product?.nazwa || product?.name || '') });
      }
    })();
    try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(genTask); } catch (_) { /* */ }

    return json({ pending: true }, 202, c);
  } catch (e) {
    console.error('[bud-mockup] ERROR:', e);
    return json({ error: 'blad_serwera' }, 500, c);
  }
});
