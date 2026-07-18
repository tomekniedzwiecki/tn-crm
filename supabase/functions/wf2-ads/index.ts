// wf2-ads — 3 KREACJE REKLAMOWE (copy + grafika) per produkt workflow v2 („Sklepy").
// Klon bud-ads przełożony z bud_sessions na wf2_products (R4 §4.3). Grafiki robi AGENT MANUS
// (research FB Ad Library → copy PL → 3 kreacje 4:5), fallback Gemini (generate-image) gdy
// flaga wyłączona / Manus padł. Wynik → wf2_products.ads_creatives; stan taska → ads_manus_*.
// Generowanie w TLE (waitUntil). ⚠️ DEPLOY: --no-verify-jwt (sweep z webhooka woła bez JWT).
//
// POST { product_id, force?, sweep? }
//   -> { ads:[{angle,headline,primary_text,badge,image_url}] } | { pending:true } | { swept, pulled, timed_out }
// Gate: x-admin-secret == SPAR_CRON_SECRET  ||  x-wf2-secret == WF2_GEN_SECRET  ||  team JWT (adminGate).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = ['https://crm.tomekniedzwiecki.pl', 'https://tn-crm.vercel.app', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500']
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-wf2-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODEL = Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.1'
// Kreacje robi AGENT MANUS (jak bud-ads) — gdy flaga włączona i jest klucz. Bez flagi/klucza → fallback Gemini.
// Własna flaga WF2_ADS_MANUS_ENABLED; dla wygody fallback na współdzieloną BUD_ADS_MANUS_ENABLED.
const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY') || ''
const MANUS_ENABLED = ((Deno.env.get('WF2_ADS_MANUS_ENABLED') || Deno.env.get('BUD_ADS_MANUS_ENABLED') || '') === '1') && !!MANUS_API_KEY
const MANUS_BASE = 'https://api.manus.ai/v2'
// 3 KĄTY (nie 4): demo pierwszy — najsilniejszy na zimno (R4 §3.2 ads_grafiki).
const ANGLES = ['demo', 'problem', 'proof']
// Koszt 1 taska Manus (kredyty→USD) — SZACUNEK, konfigurowalny sekretem BUD_MANUS_TASK_USD.
const MANUS_TASK_USD = parseFloat(Deno.env.get('BUD_MANUS_TASK_USD') || '') || 0.30
const GEMINI_IMAGE_USD = parseFloat(Deno.env.get('BUD_GEMINI_IMAGE_USD') || '') || 0.04
// Wall-clock edge ~400 s (pamięć: „edge-wallclock-niewidzialne-pady") — sweep ma twardy deadline.
const SWEEP_DEADLINE_MS = 300 * 1000

function json(b: Record<string, unknown>, s: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...c, 'Content-Type': 'application/json' } })
}

// fetch z twardym timeoutem — generate-image (Gemini) nie może wisieć w nieskończoność.
async function fetchTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try { return await fetch(url, { ...init, signal: ctrl.signal }) }
  finally { clearTimeout(t) }
}

// Fallback 3 konceptów (różne kąty), gdy model nie zwróci poprawnego JSON-a.
// deno-lint-ignore no-explicit-any
function fallbackConcepts(product: any): Array<{ angle: string; headline: string; primary_text: string; badge: string }> {
  const name = String(product?.nazwa || product?.name || 'ten produkt').slice(0, 80)
  return [
    { angle: 'demo', headline: `Zobacz, jak to działa`, primary_text: `${name} robi robotę w kilka sekund. Viralowy hit z TikToka, który realnie ułatwia życie. Zamów i przekonaj się sam.`, badge: 'Hit z TikToka' },
    { angle: 'problem', headline: `Koniec z tym problemem`, primary_text: `Znasz to uczucie, gdy coś po prostu działa? ${name} robi dokładnie to. Sprawdź — płatność przy odbiorze, 14 dni na zwrot.`, badge: 'Płatność przy odbiorze' },
    { angle: 'proof', headline: `Dlatego podbił TikToka`, primary_text: `${name} to viralowy hit, o którym mówi sieć. Sprawdź bez ryzyka — płatność przy odbiorze i 14 dni na zwrot.`, badge: 'Viralowy hit' },
  ]
}

// Art-direction pod konkretny kąt baneru — każdy kąt = INNY układ + paleta + typografia
// (test A/B: 3 realnie różne reklamy, nie 3 re-skiny jednego szablonu).
function angleArt(angle: string): string {
  switch ((angle || '').toLowerCase()) {
    case 'problem': return 'LAYOUT "problem" (classic DR poster): split composition — big bold headline on a FULL solid brand-color block, below/beside it a clean product-in-use shot as the "fix" to the problem; flat accent-color background, heavy poster typography; optional small inset of the key detail/mechanism.'
    case 'proof': return 'LAYOUT "proof" (viral/social): the product as a centered hero on a DARK or boldly contrasting background with a prominent "Hit z TikToka" seal/stamp; raw social-media energy, punchy condensed type — NO stars, NO numbers, NO fake testimonials, NO TikTok UI or logo.'
    case 'demo':
    default: return 'LAYOUT "demo" (full-bleed action): the product mid-use fills the ENTIRE frame, dynamic diagonal energy, sense of motion; headline on a high-contrast overlay band; small clean inset of the product solo for shape fidelity. Photographic natural palette from the scene itself — NO flat brand-color block background.'
  }
}

// Prompt ZAPROJEKTOWANEGO BANERU reklamowego (fallback Gemini) — hook + produkt-bohater z referencji
// + badge + przycisk-pigułka „Kup teraz". Krótki renderowany tekst z fallbackiem.
// deno-lint-ignore no-explicit-any
function adImagePrompt(cpt: { headline?: string; badge?: string; angle?: string }, product: any, ust: any, brandName = ''): string {
  const name = String(product?.nazwa || product?.name || 'product').slice(0, 80)
  const dla = String(ust?.dla_kogo || '').slice(0, 140)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 140)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 100)
  const headline = String(cpt?.headline || '').slice(0, 60)
  const badge = String(cpt?.badge || '').slice(0, 28)
  return `Design a PREMIUM STATIC SOCIAL MEDIA AD (advertising banner), NOT a plain product photo. Vertical 4:5, optimized for Instagram/Facebook feed.

PRODUCT (render with HIGH FIDELITY to the reference images — exact shape, color, material, proportions; do NOT invent or restyle it): ${name}.
${dla ? `Target audience: ${dla}. ` : ''}${kat ? `Angle/hook: ${kat}. ` : ''}${ton ? `Brand tone: ${ton}. ` : ''}${brandName ? `Brand name: ${brandName}.` : ''}

ART DIRECTION (this is 1 of 3 A/B TEST variants — it MUST look clearly DIFFERENT from the other angles: different layout, different background/palette treatment, different type character; NOT a re-skin of one template):
- ${angleArt(cpt?.angle || '')}
- A rendered HEADLINE: "${headline}" — bold, high-contrast, max ~6 words, legible even as a 320px thumbnail (placement per the layout above).
- A pill-shaped CTA BUTTON near the bottom labelled "Kup teraz" — rounded, high-contrast against THIS creative's palette, treated as a UI element (not floating text).
${badge ? `- A small benefit BADGE/seal: "${badge}" — as a graphic stamp, not a sentence.` : ''}
- Keep all text and the button at least 8% inside the edges (safe margin, nothing cropped).

TEXT RENDERING RULES (model renders only SHORT text reliably): render ONLY the headline, the button label "Kup teraz"${badge ? `, and the badge "${badge}"` : ''}. Polish, correct diacritics, NO paragraphs, NO long sentences, NO fine print. Crisp sans-serif, strong contrast. FALLBACK: if rendered text would be unreliable/garbled, keep ONLY the short headline and the "Kup teraz" button; drop the badge rather than render broken letters. Never output misspelled/scrambled words.

STYLE: premium DTC advertising look, strong scroll-stopping contrast, lighting and mood per THIS creative's layout above (do NOT default every variant to the same clean studio look), cohesive with the brand tone${ton ? ` "${ton}"` : ''}. Figure/background clearly separated; the product never blends into the background.
HARD CONSTRAINTS: no fake numbers, ratings, stars, reviews or testimonials; no countdowns or fake urgency; no "24h delivery"/"warehouse in Poland" claims; no other brands' logos. "Viral hit from TikTok" is allowed (true).`
}

// Zwięzły blok kontekstu z RAPORTU RYNKU (report jsonb) — OPCJONALNY (produkt bez raportu).
// deno-lint-ignore no-explicit-any
function reportContextBlock(report: any): string {
  if (!report || typeof report !== 'object') return ''
  const lead = String(report.lead || '').trim()
  const sekcje = Array.isArray(report.sekcje) ? report.sekcje : []
  const pick = (frag: string): string => {
    // deno-lint-ignore no-explicit-any
    const s = sekcje.find((x: any) => String(x?.tytul || '').toLowerCase().includes(frag.toLowerCase()))
    if (!s) return ''
    const parts: string[] = []
    for (const [k, v] of Object.entries(s)) {
      if (k === 'tytul') continue
      if (typeof v === 'string') parts.push(v)
      else if (Array.isArray(v)) parts.push(v.map((it) => typeof it === 'string' ? it : (it && typeof it === 'object' ? Object.values(it).filter((z) => typeof z === 'string').join(' ') : '')).filter(Boolean).join(' • '))
    }
    const body = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
    return body ? `${String(s.tytul || frag)}: ${body}` : ''
  }
  const chunks = [
    lead ? `Hook raportu: ${lead}` : '',
    pick('Problem, potrzeby i emocje'),
    pick('Grupa docelowa'),
    pick('Plan komunikacji'),
  ].filter(Boolean)
  if (!chunks.length) return ''
  return chunks.join('\n').slice(0, 2000)
}

// deno-lint-ignore no-explicit-any
function copyPrompt(product: any, ust: any, brandName = '', snapTitle = '', reportCtx = ''): string {
  const name = String(product?.nazwa || product?.name || 'produkt').slice(0, 120)
  const cat = String(product?.kategoria || product?.category || '').slice(0, 60)
  const aliTitle = String(snapTitle || '').slice(0, 200)
  const dla = String(ust?.dla_kogo || '').slice(0, 200)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 200)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const haslo = String(ust?.haslo || '').slice(0, 120)
  const ctx = (dla || kat || ton || brandName || haslo)
    ? `\n\nUSTALENIA (dopasuj reklamy DOKŁADNIE do nich):${dla ? `\n- Dla kogo: ${dla}` : ''}${kat ? `\n- Kąt/obietnica: ${kat}` : ''}${ton ? `\n- Ton marki: ${ton}` : ''}${brandName ? `\n- Mini-marka: ${brandName}` : ''}${haslo ? `\n- HASŁO/HOOK KLIENTA (użyj 1:1 jako headline JEDNEGO konceptu — najlepiej „problem" albo „demo" — jeśli ≤6 słów; dłuższe minimalnie skróć zachowując jego słowa): „${haslo}"` : ''}`
    : ''
  const repCtx = reportCtx
    ? `\n\n[KONTEKST Z RAPORTU / BRIEFU — oprzyj nagłówki i copy na tych realnych bólach, avatarze i kątach, nie na ogólnikach]\n${reportCtx}`
    : ''
  return `Jesteś dyrektorem kreatywnym reklam e-commerce na rynek polski. Dla produktu „${name}"${cat ? ` (kategoria: ${cat})` : ''}${aliTitle ? `\nPełny opis produktu (z aukcji): „${aliTitle}" — wykorzystaj realne cechy do trafnego copy.` : ''} przygotuj DOKŁADNIE 3 koncepty reklam-BANERÓW na Facebook/Instagram, każdy w INNYM kącie. Kąty (po jednym): "demo" (demonstracja/„wow", mechanizm), "problem" (problem→rozwiązanie), "proof" (dowód społeczny: viral z TikToka — BEZ zmyślonych liczb). Produkt sprzedawany przez landing z płatnością przy odbiorze (COD), model dropshipping→własna marka.${ctx}${repCtx}

Dla każdego konceptu zwróć:
- "angle": jedno z: "demo" | "problem" | "proof",
- "headline": nagłówek na BANER — MAKS 6 słów, po polsku, korzyściowy/scroll-stopper (renderowany na grafice, więc krótki i czytelny),
- "badge": odznaka ≤3 słowa, po polsku, TYLKO prawdziwa (np. „Płatność przy odbiorze", „14 dni na zwrot", „Hit z TikToka", „Viralowy hit"),
- "primary_text": tekst posta (2-3 zdania, hak w 1. zdaniu, korzyść, lekkie CTA „Sprawdź"/„Zamów"; ZERO zmyślonych liczb i fałszywej pilności).

Zwróć WYŁĄCZNIE poprawny JSON: {"ads":[{"angle":"...","headline":"...","badge":"...","primary_text":"..."}, ... 3 sztuki]}`
}

// ===== MANUS: kompletny brief dla agenta (3 copy + 3 kreacje 4:5) — adaptacja bud-ads do wf2 =====
// deno-lint-ignore no-explicit-any
function buildAdsInstruction(product: any, ust: any, brandName: string, snapTitle: string, refs: { url: string }[], productImageUrl: string, logoUrl: string, reportCtx = ''): string {
  const name = String(product?.nazwa || product?.name || snapTitle || 'produkt').slice(0, 120)
  const dla = String(ust?.dla_kogo || '').slice(0, 240)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 240)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const hasloM = String(ust?.haslo || '').slice(0, 120)
  const extraRefs = refs.slice(1, 4).map((r) => r.url).filter(Boolean)
  const repCtx = reportCtx
    ? `\n[KONTEKST Z RAPORTU / BRIEFU — oprzyj nagłówki i copy na tych realnych bólach, avatarze i kątach, nie na ogólnikach]\n${reportCtx}\n`
    : ''
  return `Jesteś full-stack marketerem DTC na rynek polski. Zrobisz KOMPLET 3 reklam-banerów na Facebook/Instagram dla jednoproduktowego sklepu (model dropshipping → własna marka, sprzedaż przez landing z PŁATNOŚCIĄ PRZY ODBIORZE / COD).

🎯 ZDJĘCIE PRODUKTU (TEN produkt MA być na WSZYSTKICH 3 banerach):
${productImageUrl}
⚠️ KROK ZEROWY (zrób TERAZ, przed czymkolwiek innym):
1. Pobierz to zdjęcie swoim narzędziem (download/curl/wget), zapisz jako product_reference.jpg
2. Przeanalizuj wizualnie: kształt, kolor, materiał, charakterystyczne detale, branding na produkcie
3. Napisz krótko „Pobrałem zdjęcie, widzę [opis]" — DOPIERO POTEM generuj grafiki
W KAŻDEJ z 3 grafik użyj DOKŁADNIE tego produktu (ten sam kształt/kolor/materiał) — żadnej reimaginacji ani innego wariantu.${extraRefs.length ? `\nDodatkowe kadry produktu (dla wierności 3D): ${extraRefs.join('  ')}` : ''}
${logoUrl ? `\n🏷️ LOGO MINI-MARKI — pobierz i umieść je 1:1 (bez zmiany kształtu/kolorów) w rogu każdej grafiki: ${logoUrl}\n` : ''}
KONTEKST (z briefu mini-marki — dopasuj reklamy DOKŁADNIE):
- Produkt: ${name}${snapTitle ? `\n- Opis z aukcji: „${snapTitle}"` : ''}
- Mini-marka: ${brandName || '(brak nazwy — użyj neutralnego, spójnego brandingu; NIE wymyślaj nazwy)'}
- Dla kogo: ${dla || '—'}  (persona na kreacji lifestyle/problem)
- Kąt / obietnica: ${kat || '—'}  (główny hook copy i dobór konceptów)
- Ton marki: ${ton || '—'}${hasloM ? `\n- HASŁO/HOOK KLIENTA (jego własne słowa — użyj 1:1 jako headline JEDNEGO konceptu, najlepiej „problem" albo „demo"; renderuj je też na tej grafice): „${hasloM}"` : ''}
${repCtx}
=== ZADANIE 1: 3 KONCEPTY COPY (różne kąty) ===
Po jednym z kątów: "demo" (demonstracja/„wow", mechanizm), "problem" (problem→rozwiązanie), "proof" (dowód społeczny: viral z TikToka — BEZ zmyślonych liczb/recenzji).
Dla każdego: angle, headline (≤6 słów, PL, renderowany na grafice), badge (≤3 słowa, TYLKO prawdziwy: „Płatność przy odbiorze" / „14 dni na zwrot" / „Hit z TikToka" / „Viralowy hit"), primary_text (2-3 zdania, hak w 1. zdaniu, korzyść, lekkie CTA „Sprawdź"/„Zamów").

=== ZADANIE 2: 3 KREACJE GRAFICZNE (najważniejsze) ===
Format PIONOWY 4:5 (1080×1350 px), pod feed IG/FB (działa też w Reels). Każda kreacja = INNY kąt z Zadania 1.
⚠️ RÓŻNORODNOŚĆ — to zestaw do TESTÓW A/B: 3 grafiki mają wyglądać jak 3 RÓŻNE reklamy (inny układ, inne tło/paleta, inny charakter typografii), NIE jak 3 warianty jednego szablonu. Dwie podobne = test nic nie mierzy. Art-direction per kreacja:
- ad_1_demo — FULL-BLEED AKCJA: produkt W AKCJI / mid-use wypełnia CAŁY kadr, dynamiczna diagonala, energia ruchu; headline na kontrastowym pasku/overlayu; mały inset produktu solo dla wierności kształtu; paleta fotograficzna z samej sceny — BEZ płaskiego bloku koloru. To najsilniejszy kadr „na zimno".
- ad_2_problem — KLASYCZNY PLAKAT DR: kompozycja dzielona — duży, gruby headline na PEŁNYM bloku koloru marki, obok/pod nim czysty produkt-in-use jako „naprawa" problemu; płaskie tło w kolorze akcentu, ciężka plakatowa typografia; opcjonalnie mały inset detalu/mechanizmu.
- ad_3_proof — VIRAL/SOCIAL: produkt-bohater na CIEMNYM lub mocno kontrastowym tle + wyrazista pieczęć „Hit z TikToka" / „Viralowy hit"; surowszy, socialowy vibe, wyrazista skondensowana typografia (BEZ gwiazdek, liczb, fałszywych recenzji; BEZ interfejsu/logo TikToka).
ZASADY GRAFIK:
- Polski tekst poprawny (z diakrytykami), TYLKO krótki: headline + przycisk-pigułka „Kup teraz" (+ ewentualnie badge). Bez akapitów na grafice.
- Branding ${brandName || 'mini-marki'} widoczny (logo/nazwa w rogu); gdy brak — neutralny i spójny.
- Światło/nastrój wg art-direction danej kreacji (NIE powtarzaj jednego oświetlenia na wszystkich); NIE białe studio na żadnej (wygląda jak Allegro); produkt 1:1 z referencji na każdej.
- Element COD jako ATUT: badge „Płatność przy odbiorze" pasuje do problem/proof (risk-reversal).
ZAKAZY (COD/polityka Meta): zero zmyślonej pilności/countdownów; zero „dostawa 24h"/„magazyn w Polsce"; zero zmyślonych liczb/gwiazdek/recenzji; zero obcych logo; zero obietnic medycznych; bez cen na grafice.

=== OUTPUT (KONIECZNIE) ===
1. Plik "campaign.json": {"ads":[{"angle":"demo","headline":"...","badge":"...","primary_text":"..."}, ... 3 sztuki]}
2. 3 obrazy PNG jako ZAŁĄCZNIKI, nazwane DOKŁADNIE: ad_1_demo.png, ad_2_problem.png, ad_3_proof.png
3. 2-3 zdania podsumowania.
Pracuj samodzielnie aż skończysz wszystko — nie pytaj o nic w międzyczasie; gdy czegoś brakuje, przyjmij sensowny default i kontynuuj.`
}

// Referencja PRODUKTU wg R4: curated_image → gallery_curated items[keep][0].url → ali main_image → cover_url.
// gallery_curated (kuracja z /trendy) NIE jest obsługiwana przez współdzielony productRefs, więc budujemy
// łańcuch bespoke wg specyfikacji, zachowując kolejność wierności.
// deno-lint-ignore no-explicit-any
function buildProductRefs(tt: any, coverUrl: string): { url: string; type: 'product' }[] {
  const out: string[] = []
  const seen = new Set<string>()
  const push = (u: unknown) => {
    const s = String(u || '').trim()
    if (!s || s.startsWith('data:') || seen.has(s)) return
    seen.add(s); out.push(s)
  }
  push(tt?.curated_image)                                   // 1) kurowane przez admina — pewna prawda o produkcie
  const gc = tt?.gallery_curated
  const items = (gc && Array.isArray(gc.items)) ? gc.items : []
  for (const it of items) if (it && it.keep && it.url) push(it.url)   // 2) zaakceptowane kadry galerii
  const snap = tt?.ali_snapshot || null
  if (snap) {
    push(snap.main_image)                                   // 3) główny kadr AliExpress
    if (Array.isArray(snap.images)) for (const im of snap.images) push(im)
  }
  push(coverUrl)                                            // 4) okładka TikToka (ostatnia deska ratunku)
  return out.slice(0, 4).map((url) => ({ url, type: 'product' as const }))
}

// Odczyt briefu mini-marki z kroku 'lp_branding' / 'branding' (data.fields wg panelu tn-sklepy).
// Czytamy tolerancyjnie: pola mogą nie istnieć / leżeć płasko w data zamiast data.fields.
// deno-lint-ignore no-explicit-any
function readBranding(steps: any[]): { brandName: string; logoUrl: string; ust: Record<string, string>; obietnica: string; hooki: string } {
  // deno-lint-ignore no-explicit-any
  let f: Record<string, any> = {}
  for (const s of (steps || [])) {
    const d = s?.data || {}
    const fields = (d.fields && typeof d.fields === 'object') ? d.fields : d
    // pierwszy krok z jakąkolwiek treścią wygrywa
    if (fields && typeof fields === 'object' && Object.values(fields).some((v) => String(v || '').trim())) { f = fields; break }
  }
  const g = (...keys: string[]): string => {
    for (const k of keys) { const v = f[k]; if (v != null && String(v).trim()) return String(v).trim() }
    return ''
  }
  const brandName = g('nazwa', 'brand', 'marka', 'nazwa_marki', 'chosen_name').slice(0, 60)
  const logoRaw = g('logo_url', 'logo')
  const logoUrl = /^https?:\/\//i.test(logoRaw) ? logoRaw : ''   // inline SVG nie nadaje się jako URL do pobrania
  const persona = g('persona', 'dla_kogo', 'avatar')
  const obietnica = g('obietnica', 'kat', 'kąt', 'wyroznik', 'wyróżnik')
  const hooki = g('hooki', 'hook', 'hasla', 'hasło', 'haslo')
  const haslo = (hooki.split(/[\n;•]/).map((x) => x.trim()).filter(Boolean)[0] || '').slice(0, 120)
  const ust: Record<string, string> = { dla_kogo: persona, kat: obietnica, ton_marki: g('ton', 'ton_marki'), haslo }
  return { brandName, logoUrl, ust, obietnica, hooki }
}

// Referencję produktu cache'ujemy do Storage (Manus pobiera ją sam — AliExpress bywa nieosiągalny/AVIF dla agenta).
// deno-lint-ignore no-explicit-any
async function cacheRefToStorage(supabase: any, productId: string, url: string): Promise<string> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SupabaseEdge/1.0)', 'Accept': 'image/*' } })
    if (!r.ok) return url
    const buf = await r.arrayBuffer()
    const ct = (r.headers.get('content-type') || 'image/jpeg').split(';')[0].trim()
    const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg'
    const path = `ai-generated/wf2/${productId}/ref_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('attachments').upload(path, buf, { contentType: ct, upsert: true })
    if (error) return url
    const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path)
    return pub?.publicUrl || url
  } catch { return url }
}

// Alert #sparing przy definitywnej porażce generacji (wzorzec 1:1 z bud-ads).
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) { console.error('[wf2-ads] slack-notify: brak SUPABASE_URL/KEY'); return }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[wf2-ads] slack-notify ${type} HTTP`, res.status, await res.text())
  } catch (err) {
    console.error(`[wf2-ads] slack-notify ${type} exception:`, err)
  }
}

// Log kosztu/aktywności → wf2_activities (project-scope; tabela nie ma product_id, produkt jest w opisie).
// deno-lint-ignore no-explicit-any
async function logActivity(supabase: any, projectId: string | null, action: string, description: string): Promise<void> {
  if (!projectId) return
  try { await supabase.from('wf2_activities').insert({ project_id: projectId, actor: 'auto', action, description }) }
  catch (e) { console.error('[wf2-ads] logActivity err', e) }
}

// Koszt jednostkowy → wf2_costs (rollup per etap/produkt w zakładce Koszty panelu).
// deno-lint-ignore no-explicit-any
async function logCost(supabase: any, projectId: string | null, productId: string | null, amountUsd: number, kind: string, note: string): Promise<void> {
  if (!projectId || !(amountUsd > 0)) return
  try {
    await supabase.from('wf2_costs').insert({
      project_id: projectId, product_id: productId, step_key: 'ads_grafiki', stage: 4,
      amount: amountUsd, currency: 'USD', kind, note, created_by: 'auto',
    })
  } catch (e) { console.error('[wf2-ads] logCost err', e) }
}

// deno-lint-ignore no-explicit-any
function tolerantParse(t: string): any {
  try { return JSON.parse(t) } catch { /* */ }
  const m = t.match(/\{[\s\S]*\}/)
  if (m) { try { return JSON.parse(m[0]) } catch { /* */ } }
  return null
}

// Sprawdź task Manus; gdy skończony — wyciągnij załączniki (3 PNG + campaign.json), rehostuj do Storage,
// złóż ads_creatives=[{angle,headline,primary_text,badge,image_url}] i zapisz. Zwraca {done, ads?}.
// deno-lint-ignore no-explicit-any
async function manusPollAndPull(supabase: any, productId: string, taskId: string): Promise<{ done: boolean; ads?: unknown[] }> {
  const headers = { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }
  const detRes = await fetch(`${MANUS_BASE}/task.detail?task_id=${taskId}`, { headers })
  const det = await detRes.json().catch(() => null)
  if (!detRes.ok || !det) return { done: false }
  const task = det.task || det
  if (!['completed', 'done', 'stopped'].includes(task.status)) return { done: false }

  const msgRes = await fetch(`${MANUS_BASE}/task.listMessages?task_id=${taskId}&limit=100`, { headers })
  const msgData = await msgRes.json().catch(() => null)
  // deno-lint-ignore no-explicit-any
  const att: any[] = []
  for (const m of (msgData?.messages || [])) {
    if (m.type !== 'assistant_message') continue
    const am = m.assistant_message
    if (am && typeof am === 'object' && Array.isArray(am.attachments)) for (const a of am.attachments) att.push(a)
  }
  // deno-lint-ignore no-explicit-any
  const images = att.filter((a: any) => a.type === 'image')
  // deno-lint-ignore no-explicit-any
  const jsonFiles = att.filter((a: any) => a.type === 'file' && a.content_type === 'application/json')

  const copyByAngle: Record<string, { headline: string; primary_text: string; badge: string }> = {}
  if (jsonFiles.length) {
    try {
      const t = await (await fetch(jsonFiles[0].url)).text()
      const parsed = tolerantParse(t)
      // deno-lint-ignore no-explicit-any
      for (const a of (parsed?.ads || [])) if (a && a.angle) copyByAngle[String(a.angle).toLowerCase()] = { headline: String(a.headline || ''), primary_text: String(a.primary_text || ''), badge: String(a.badge || '') }
    } catch { /* */ }
  }

  const byAngle: Record<string, string> = {}
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    try {
      const buf = await (await fetch(img.url)).arrayBuffer()
      const ctI = String(img.content_type || '')
      const ext = ctI.includes('png') ? 'png' : ctI.includes('webp') ? 'webp' : 'jpg'
      const ang = (String(img.filename || '').match(/ad_\d+_([a-z_]+)\./i)?.[1] || ANGLES[i] || `ad_${i + 1}`).toLowerCase()
      const path = `ai-generated/wf2/${productId}/ad_${i + 1}_${ang}.${ext}`
      const { error } = await supabase.storage.from('attachments').upload(path, buf, { contentType: img.content_type || 'image/png', upsert: true })
      if (error) continue
      const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path)
      if (pub?.publicUrl) byAngle[ang] = pub.publicUrl
    } catch { /* */ }
  }

  // złóż w kolejności kątów; front oczekuje [{angle,headline,primary_text,badge,image_url}]
  const ads = ANGLES.map((a) => ({ angle: a, headline: copyByAngle[a]?.headline || '', primary_text: copyByAngle[a]?.primary_text || '', badge: copyByAngle[a]?.badge || '', image_url: byAngle[a] || '' }))
    .filter((x) => x.image_url || x.headline)
  for (const a of Object.keys(byAngle)) if (!ANGLES.includes(a)) ads.push({ angle: a, headline: copyByAngle[a]?.headline || '', primary_text: copyByAngle[a]?.primary_text || '', badge: copyByAngle[a]?.badge || '', image_url: byAngle[a] })

  if (!ads.some((x) => x.image_url)) return { done: false }   // skończony, ale brak grafik → poczekaj kolejny cykl

  // ATOMOWO: poll frontu i sweep crona potrafią wywołać pull RÓWNOLEGLE — update warunkowy na
  // status='running' wygrywa raz; przegrany NIE liczy kosztu drugi raz.
  const { data: won } = await supabase.from('wf2_products')
    .update({ ads_creatives: ads, ads_manus_status: 'completed', ads_manus_completed_at: new Date().toISOString(), ads_manus_step: null })
    .eq('id', productId).eq('ads_manus_status', 'running').select('id, project_id')
  if (!won || !won.length) return { done: true, ads }
  const projectId = (won[0] as { project_id?: string }).project_id || null
  await logActivity(supabase, projectId, 'ads_generated', `3 grafiki reklamowe (Manus) gotowe — koszt ~$${MANUS_TASK_USD.toFixed(2)} · task ${taskId}`)
  await logCost(supabase, projectId, productId, MANUS_TASK_USD, 'manus', `3 grafiki (task ${taskId})`)
  return { done: true, ads }
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c })
  if (req.method !== 'POST') return json({ error: 'metoda_niedozwolona' }, 405, c)
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''
    const CRON = Deno.env.get('SPAR_CRON_SECRET') || ''
    const WF2 = Deno.env.get('WF2_GEN_SECRET') || ''

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // GATE: sekret admina (cron/webhook) LUB sekret wf2 (automaty) LUB team JWT (panel przez invoke).
    // Puste sekrety NIGDY nie autoryzują. Deploy --no-verify-jwt, więc gate jest w środku.
    const okAdmin = !!CRON && req.headers.get('x-admin-secret') === CRON
    const okWf2 = !!WF2 && req.headers.get('x-wf2-secret') === WF2
    if (!okAdmin && !okWf2 && !(await adminGate(req, supabase))) {
      return json({ error: 'brak_uprawnien' }, 403, c)
    }

    let body: { product_id?: string; force?: boolean; sweep?: boolean }
    try { body = await req.json() } catch { return json({ error: 'nieprawidlowy_json' }, 400, c) }

    // ── SWEEP (cron / manus-webhook, x-admin-secret) — dociąga wyniki tasków Manus dla produktów,
    // gdzie panel był zamknięty; oznacza failed taski wiszące >40 min; odblokowuje zawieszone claim-y.
    if (body.sweep) {
      const swStart = Date.now()
      const { data: running } = await supabase
        .from('wf2_products')
        .select('id, ads_manus_task_id, ads_manus_started_at')
        .eq('ads_manus_status', 'running')
        .not('ads_manus_task_id', 'is', null)
        .limit(20)
      let pulled = 0, timedOut = 0
      for (const p of (running || [])) {
        if (Date.now() - swStart > SWEEP_DEADLINE_MS) break   // wall-clock edge — nie wisimy w pętli
        try {
          if (MANUS_API_KEY) {
            const r = await manusPollAndPull(supabase, p.id as string, String(p.ads_manus_task_id))
            if (r.done) { pulled++; continue }
          }
          const started = p.ads_manus_started_at ? Date.parse(String(p.ads_manus_started_at)) : 0
          if (started && (Date.now() - started) > 40 * 60 * 1000) {
            await supabase.from('wf2_products').update({ ads_manus_status: 'failed', ads_manus_step: 'timeout_sweep' }).eq('id', p.id).eq('ads_manus_status', 'running')
            timedOut++
            await postSlackSparing('bud_gen_error', { product_id: p.id as string, stage: 'wf2 reklamy (Manus, timeout >40 min — sweep)', error: `task ${p.ads_manus_task_id} nie dowiózł wyniku` })
          }
        } catch (e) { console.error('[wf2-ads] sweep err', p.id, e) }
      }
      // Self-heal: przejęty slot bez task_id (crash między claim a create) starszy niż 10 min → failed
      // (można wtedy ponowić bez force). Osobne query, bo główna pętla wymaga task_id.
      let stuck = 0
      try {
        const staleIso = new Date(Date.now() - 10 * 60 * 1000).toISOString()
        const { data: stuckRows } = await supabase
          .from('wf2_products')
          .select('id')
          .eq('ads_manus_status', 'running')
          .is('ads_manus_task_id', null)
          .lt('ads_manus_started_at', staleIso)
          .limit(20)
        for (const s of (stuckRows || [])) {
          const { data: fixed } = await supabase.from('wf2_products')
            .update({ ads_manus_status: 'failed', ads_manus_step: 'claim_stuck' })
            .eq('id', s.id).eq('ads_manus_status', 'running').is('ads_manus_task_id', null).select('id')
          if (fixed && fixed.length) stuck++
        }
      } catch (e) { console.error('[wf2-ads] sweep stuck-heal err', e) }
      return json({ swept: (running || []).length, pulled, timed_out: timedOut, stuck }, 200, c)
    }

    // ── POJEDYNCZY PRODUKT ──
    const productId = (body.product_id || '').trim()
    if (!productId || !UUID_RE.test(productId)) return json({ error: 'nieprawidlowy_produkt' }, 400, c)
    const force = !!body.force

    const { data: product } = await supabase.from('wf2_products')
      .select('id, project_id, name, cover_url, tt_product_id, notes, ads_creatives, ads_manus_task_id, ads_manus_status, ads_manus_started_at')
      .eq('id', productId).maybeSingle()
    if (!product) return json({ error: 'nieprawidlowy_produkt' }, 404, c)

    // CACHE: komplet już jest i nie wymuszono regeneracji → oddaj gotowe.
    if (!force && Array.isArray(product.ads_creatives) && product.ads_creatives.length &&
      (product.ads_creatives as Array<{ image_url?: string }>).some((a) => a?.image_url)) {
      return json({ ads: product.ads_creatives, cached: true }, 200, c)
    }

    // ── Kontekst produktu ──
    const projectId = product.project_id as string
    const { data: project } = await supabase.from('wf2_projects').select('name, customer_name').eq('id', projectId).maybeSingle()

    // deno-lint-ignore no-explicit-any
    let tt: any = null
    const ttId = String(product.tt_product_id || '')
    if (ttId && UUID_RE.test(ttId)) {
      // Kolumny pewne (używane przez bud-mockup). Robust: nie mieszamy tu gallery_curated,
      // bo gdyby kolumny nie było, cały select by padł i utracilibyśmy curated_image/ali_snapshot.
      const { data: ttRow } = await supabase.from('bud_tt_products').select('pl_name, category, curated_image, ali_snapshot').eq('id', ttId).maybeSingle()
      tt = ttRow || null
      // gallery_curated (kuracja galerii) — best-effort osobnym zapytaniem; brak kolumny nie wywala kontekstu.
      if (tt) {
        try {
          const { data: gcRow, error: gcErr } = await supabase.from('bud_tt_products').select('gallery_curated').eq('id', ttId).maybeSingle()
          if (!gcErr && gcRow) tt.gallery_curated = (gcRow as { gallery_curated?: unknown }).gallery_curated
        } catch { /* kolumna może nie istnieć — pomijamy ten poziom referencji */ }
      }
    }

    // Branding (mini-marka) — krok 'lp_branding' lub 'branding' TEGO produktu.
    const { data: brandingSteps } = await supabase.from('wf2_steps')
      .select('step_key, data').eq('product_id', productId).in('step_key', ['lp_branding', 'branding'])
    const { brandName: brandRaw, logoUrl, ust, obietnica, hooki } = readBranding(brandingSteps || [])
    const brandName = (brandRaw || String((project?.name as string) || '')).slice(0, 60)

    // Raport produktu (opcjonalny) — krok 'lp_raport' / 'raport'; treść do kontekstu copy.
    let reportObj: unknown = null
    try {
      const { data: rSteps } = await supabase.from('wf2_steps')
        .select('data').eq('product_id', productId).in('step_key', ['lp_raport', 'raport'])
      for (const s of (rSteps || [])) {
        const d = (s as { data?: Record<string, unknown> }).data || {}
        const cand = d.report || d.raport || (d.fields as Record<string, unknown>)?.report || d
        if (cand && typeof cand === 'object' && (('lead' in cand) || ('sekcje' in cand))) { reportObj = cand; break }
      }
    } catch { /* raport opcjonalny */ }

    // Kontekst produktu do promptów (name / kategoria / tytuł z aukcji).
    const name = String(product.name || tt?.pl_name || 'produkt')
    const productCtx = { nazwa: name, kategoria: String(tt?.category || '') }
    const snap = tt?.ali_snapshot || null
    const snapTitle = (snap && String(snap.source || '') !== 'search') ? String(snap.title || '') : ''
    const refs = buildProductRefs(tt, String(product.cover_url || ''))

    // Brief = raport (jeśli jest) + obietnica + hooki + notatki produktu → bogatszy materiał na copy.
    const briefParts: string[] = []
    if (obietnica) briefParts.push(`Obietnica mini-marki: ${obietnica}`)
    if (hooki) briefParts.push(`Hooki reklamowe klienta: ${hooki}`)
    if (product.notes) briefParts.push(`Notatki produktu: ${String(product.notes)}`)
    const reportCtx = [reportContextBlock(reportObj), briefParts.join('\n')].filter(Boolean).join('\n').slice(0, 2000)

    // Atomowa rezerwacja slotu (anty-podwójny task przy double-click). Marker = status 'running'
    // z task_id=NULL (sweep/poll wymagają task_id, więc go pomijają). force → nadpisz nawet biegnący.
    const claimSlot = async (): Promise<boolean> => {
      let q = supabase.from('wf2_products')
        .update({ ads_manus_status: 'running', ads_manus_task_id: null, ads_manus_completed_at: null, ads_manus_started_at: new Date().toISOString(), ads_manus_step: 'claim', ads_creatives: null })
        .eq('id', productId)
      if (!force) q = q.or('ads_manus_status.is.null,ads_manus_status.eq.completed,ads_manus_status.eq.failed')
      const { data, error } = await q.select('id')
      if (error) { console.error('[wf2-ads] claim error', error); return true }   // fail-open: nie blokuj admina
      return !!(data && data.length)
    }
    let heldClaim = false

    // ===== MANUS =====
    let skipManusToGemini = false
    if (MANUS_ENABLED) {
      // task już biegnie → sprawdź status i (gdy skończony) dociągnij. Panel poluje.
      if (!force && product.ads_manus_status === 'running' && product.ads_manus_task_id) {
        const res = await manusPollAndPull(supabase, productId, String(product.ads_manus_task_id))
        if (res.done && res.ads) return json({ ads: res.ads }, 200, c)
        const started = product.ads_manus_started_at ? Date.parse(String(product.ads_manus_started_at)) : 0
        if (started && (Date.now() - started) > 32 * 60 * 1000) {
          await supabase.from('wf2_products').update({ ads_manus_status: 'failed', ads_manus_step: 'timeout' }).eq('id', productId)
          await postSlackSparing('bud_gen_error', { product_id: productId, stage: 'wf2 reklamy — task Manus >32 min bez wyniku → przełączam na Gemini', error: `task ${product.ads_manus_task_id} nie dowiózł wyniku (sprawdź kolejkę/kredyty Manusa)`, product: name })
          skipManusToGemini = true   // dowieź reklamy tanim torem TERAZ
        } else {
          return json({ pending: true, manus: 'running' }, 202, c)
        }
      }
      // Breaker per produkt: poprzedni task Manusa padł — retry idzie prosto w Gemini.
      if (!skipManusToGemini && product.ads_manus_status === 'failed') skipManusToGemini = true
    }

    if (MANUS_ENABLED && !skipManusToGemini) {
      if (!(await claimSlot())) return json({ pending: true, manus: 'running' }, 202, c)
      heldClaim = true
      let manusCreateErr = ''
      try {
        const rawRef = refs[0]?.url || ''
        const productImageUrl = rawRef ? await cacheRefToStorage(supabase, productId, rawRef) : ''
        const messagePayload: Record<string, unknown> = { content: buildAdsInstruction(productCtx, ust, brandName, snapTitle, refs, productImageUrl, logoUrl, reportCtx) }
        if (productImageUrl) {
          const lo = productImageUrl.toLowerCase()
          const ct = lo.includes('.png') ? 'image/png' : lo.includes('.webp') ? 'image/webp' : lo.includes('.avif') ? 'image/avif' : 'image/jpeg'
          messagePayload.attachments = [{ type: 'image', content_type: ct, filename: 'product_reference.' + (ct.split('/')[1] || 'jpg'), url: productImageUrl }]
        }
        const createRes = await fetch(`${MANUS_BASE}/task.create`, { method: 'POST', headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: messagePayload }) })
        const createData = await createRes.json().catch(() => null)
        if (!createRes.ok || !createData?.ok || !createData?.task_id) {
          manusCreateErr = `HTTP ${createRes.status}: ${JSON.stringify(createData).slice(0, 180)}`
          console.error('[wf2-ads] Manus task.create failed', manusCreateErr)
        } else {
          await supabase.from('wf2_products').update({ ads_manus_task_id: createData.task_id, ads_manus_status: 'running', ads_manus_started_at: new Date().toISOString(), ads_manus_step: null }).eq('id', productId)
          return json({ pending: true, manus: 'created', task_id: createData.task_id }, 202, c)
        }
      } catch (e) {
        manusCreateErr = String(e).slice(0, 180)
        console.error('[wf2-ads] Manus create error', e)
      }
      // create padł (najczęściej brak kredytów) → alert i SPADAMY do Gemini na TYM samym claimie.
      const isCredits = /HTTP 429|resource_exhausted|credit limit/i.test(manusCreateErr)
      await postSlackSparing('bud_gen_error', {
        product_id: productId,
        stage: isCredits ? 'wf2 reklamy — SKOŃCZYŁY SIĘ KREDYTY MANUSA → przełączam na Gemini' : 'wf2 reklamy — Manus create padł → przełączam na Gemini',
        error: isCredits ? 'Manus odrzucił zadanie: limit kredytów wyczerpany. DOŁADUJ KREDYTY — do tego czasu kreacje robi fallback Gemini.' : manusCreateErr,
        product: name,
      })
    }

    // ===== Fallback: Gemini (flaga Manus wyłączona / breaker / create padł) =====
    if (!heldClaim) {
      if (!(await claimSlot())) return json({ pending: true }, 202, c)
      heldClaim = true
    }

    const genTask = (async () => {
      try {
        // 1) Copy — 1 call gpt-5.1 → 3 koncepty (fallback gdy JSON padnie)
        let concepts: Array<{ angle?: string; headline?: string; primary_text?: string; badge?: string }> = []
        if (OPENAI_API_KEY) {
          try {
            const r = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
              body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: copyPrompt(productCtx, ust, brandName, snapTitle, reportCtx) }], response_format: { type: 'json_object' } }),
            }, 'wf2-ads-copy')
            if (r.ok) {
              const d = await r.json()
              concepts = (JSON.parse(d.choices?.[0]?.message?.content || '{}').ads || []).slice(0, 3)
            } else { console.error('[wf2-ads] copy HTTP', r.status) }
          } catch (e) { console.error('[wf2-ads] copy err', e) }
        }
        if (!concepts.length) {
          console.warn('[wf2-ads] brak konceptów z modelu — fallback 3 uniwersalne')
          concepts = fallbackConcepts(productCtx)
        }

        // 2) Grafiki — Gemini, równolegle (referencja = kadry produktu); allSettled + timeout.
        const settled = await Promise.allSettled(concepts.map(async (cpt) => {
          const ir = await fetchTimeout(`${SUPABASE_URL}/functions/v1/generate-image`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON },
            body: JSON.stringify({ prompt: adImagePrompt(cpt, productCtx, ust, brandName), provider: 'gemini', aspect_ratio: '4:5', type: 'ad', count: 1, ...(refs.length ? { reference_images: refs } : {}) }),
          }, 90_000)
          let image_url = ''
          if (ir.ok) { const id = await ir.json().catch(() => null); const u = id?.images?.[0]?.url; if (u && !String(u).startsWith('data:')) image_url = u }
          else console.error('[wf2-ads] image HTTP', ir.status)
          return { angle: String(cpt.angle || ''), headline: String(cpt.headline || ''), primary_text: String(cpt.primary_text || ''), badge: String(cpt.badge || ''), image_url }
        }))
        const ads = settled.map((s, i) => s.status === 'fulfilled'
          ? s.value
          : { angle: String(concepts[i]?.angle || ANGLES[i] || ''), headline: String(concepts[i]?.headline || ''), primary_text: String(concepts[i]?.primary_text || ''), badge: String(concepts[i]?.badge || ''), image_url: '' })

        const nImg = ads.filter((a) => a.image_url).length
        if (!nImg) {
          // 0 grafik = porażka; NIE zapisuj (żeby nie zacementować pustego cache), oznacz failed, alert.
          console.error('[wf2-ads] 0/3 grafik — oznaczam failed (retry regeneruje)')
          await supabase.from('wf2_products').update({ ads_manus_status: 'failed', ads_manus_step: 'gemini_no_image' }).eq('id', productId)
          await postSlackSparing('bud_gen_error', { product_id: productId, stage: 'wf2 reklamy (Gemini)', error: '0/3 grafik — żaden obraz się nie wygenerował', product: name })
          return
        }
        await supabase.from('wf2_products').update({ ads_creatives: ads, ads_manus_status: 'completed', ads_manus_completed_at: new Date().toISOString(), ads_manus_step: null }).eq('id', productId)
        await logActivity(supabase, projectId, 'ads_generated', `${nImg} grafik reklamowych (Gemini, fallback) gotowe — koszt ~$${(GEMINI_IMAGE_USD * nImg).toFixed(2)}`)
        await logCost(supabase, projectId, productId, GEMINI_IMAGE_USD * nImg, 'gemini', `${nImg} grafik (fallback)`)
      } catch (e) {
        console.error('[wf2-ads] gen task error:', e)
        try { await supabase.from('wf2_products').update({ ads_manus_status: 'failed', ads_manus_step: 'gemini_error' }).eq('id', productId) } catch { /* */ }
        await postSlackSparing('bud_gen_error', { product_id: productId, stage: 'wf2 reklamy (Gemini)', error: String(e).slice(0, 280), product: name })
      }
    })()
    try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(genTask) } catch { /* */ }

    return json({ pending: true }, 202, c)
  } catch (e) {
    console.error('[wf2-ads] ERROR:', e)
    return json({ error: 'blad_serwera' }, 500, c)
  }
})
