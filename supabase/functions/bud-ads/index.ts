// bud-ads — 4 KREACJE REKLAMOWE (copy + grafika) dla wybranego produktu z lejka /sklep,
// pokazywane jako posty FB w zakładce „Blog". Copy: gpt-5.1 (1 call → 4 koncepty),
// grafiki: generate-image (Gemini, referencja = foto produktu). Cache per-PRODUKT.
// Generowanie w TLE (waitUntil). ⚠️ DEPLOY: --no-verify-jwt.
// POST { sessionId, product, force? } -> { ads:[{headline,primary_text,image_url}] } | { pending:true }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";
import { productRefs } from "../_shared/bud-refs.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl', 'https://www.tomekniedzwiecki.pl', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500']
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODEL = Deno.env.get('BUD_OPENAI_MODEL') || 'gpt-5.1'
// Kreacje reklamowe robi AGENT MANUS (jak manus-full-campaign) — gdy flaga włączona i jest klucz.
// Bez flagi/klucza → fallback na Gemini (stary tor, bezpiecznik na brak kredytów Manus).
const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY') || ''
const MANUS_ENABLED = (Deno.env.get('BUD_ADS_MANUS_ENABLED') || '') === '1' && !!MANUS_API_KEY
const MANUS_BASE = 'https://api.manus.ai/v2'
const ANGLES = ['problem', 'demo', 'emotion', 'proof']
// Koszt 1 taska Manus (kredyty→USD) — SZACUNEK, konfigurowalny sekretem BUD_MANUS_TASK_USD; ustaw realną stawkę.
const MANUS_TASK_USD = parseFloat(Deno.env.get('BUD_MANUS_TASK_USD') || '') || 0.30
const GEMINI_IMAGE_USD = parseFloat(Deno.env.get('BUD_GEMINI_IMAGE_USD') || '') || 0.04
// Anty-nadużycie (wzorzec bud-landing/bud-image): endpoint publiczny, każda generacja pali realne $
// (Manus task ~MANUS_TASK_USD, fallback Gemini 4 obrazy). Cap dzienny per IP po wszystkich sesjach tego IP
// (bud_usage kind='ads', created_at z 24 h) + cap re-triggerów Manus per sesja (najdroższy fallback).
const MAX_ADS_PER_IP_PER_DAY = parseInt(Deno.env.get('BUD_ADS_IP_DAILY') || '8', 10)
const MAX_MANUS_RETRIGGERS_PER_SESSION = parseInt(Deno.env.get('BUD_ADS_MANUS_MAX_PER_SESSION') || '2', 10)
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

// Fallback 4 konceptów-banerów (różne angle), gdy model nie zwróci poprawnego JSON-a.
// deno-lint-ignore no-explicit-any
function fallbackConcepts(product: any, _ust: any): Array<{ angle: string; headline: string; primary_text: string; badge: string }> {
  const name = String(product?.nazwa || product?.name || 'ten produkt').slice(0, 80)
  return [
    { angle: 'problem', headline: `Koniec z tym problemem`, primary_text: `Znasz to uczucie, gdy coś po prostu działa? ${name} robi dokładnie to. Sprawdź — płatność przy odbiorze, 14 dni na zwrot.`, badge: 'Płatność przy odbiorze' },
    { angle: 'demo', headline: `Zobacz, jak to działa`, primary_text: `${name} robi robotę w kilka sekund. Viralowy hit z TikToka, który realnie ułatwia życie. Zamów i przekonaj się sam.`, badge: 'Hit z TikToka' },
    { angle: 'emotion', headline: `Prezent, który zapamiętają`, primary_text: `Szukasz czegoś, co naprawdę ucieszy bliską osobę? ${name} trafia w punkt. Zamów dziś, zapłać przy odbiorze.`, badge: '14 dni na zwrot' },
    { angle: 'proof', headline: `Dlatego podbił TikToka`, primary_text: `${name} to viralowy hit, o którym mówi sieć. Sprawdź bez ryzyka — płatność przy odbiorze i 14 dni na zwrot.`, badge: 'Viralowy hit' },
  ]
}

// Hint kompozycji hero pod konkretny angle baneru (każdy angle = inny układ — Agent A).
function angleHero(angle: string): string {
  switch ((angle || '').toLowerCase()) {
    case 'demo': return 'Hero: the product shown in ACTION / mid-use, slightly angled for energy; add a small clean inset of the product solo for shape fidelity.'
    case 'emotion': return 'Hero: a warm lifestyle scene with the product naturally in-hand / in context; add a small clean inset of the product solo so the buyer sees exactly what they get.'
    case 'proof': return 'Hero: the product as a centered hero with a prominent "Viralowy hit" seal/stamp; NO stars, NO numbers, NO fake testimonials.'
    case 'problem':
    default: return 'Hero: a clean product-in-use shot as the "fix" to the problem in the headline; optional small inset showing the key detail/mechanism.'
  }
}

// Prompt ZAPROJEKTOWANEGO BANERU reklamowego (nie czyste foto): hook + blok koloru marki +
// produkt-bohater z referencji + badge + przycisk-pigułka „Kup teraz". Krótki renderowany tekst
// z fallbackiem (model sypie długi/zawiły tekst). Art-direction wg Agent A.
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

LAYOUT (build it like a designed ad with clear visual hierarchy):
- ${angleHero(cpt?.angle || '')}
- A brand-color ACCENT BLOCK / band (derived from the brand tone) framing the composition and giving contrast behind the text.
- A rendered HEADLINE in the top third: "${headline}" — bold, high-contrast, max ~6 words, legible even as a 320px thumbnail.
- A pill-shaped CTA BUTTON near the bottom labelled "Kup teraz" — rounded, in the accent color, treated as a UI element (not floating text).
${badge ? `- A small benefit BADGE/seal: "${badge}" — as a graphic stamp, not a sentence.` : ''}
- Keep all text and the button at least 8% inside the edges (safe margin, nothing cropped).

TEXT RENDERING RULES (model renders only SHORT text reliably): render ONLY the headline, the button label "Kup teraz"${badge ? `, and the badge "${badge}"` : ''}. Polish, correct diacritics, NO paragraphs, NO long sentences, NO fine print. Crisp sans-serif, strong contrast. FALLBACK: if rendered text would be unreliable/garbled, keep ONLY the short headline and the "Kup teraz" button; drop the badge rather than render broken letters. Never output misspelled/scrambled words.

STYLE: premium DTC advertising look, strong scroll-stopping contrast, clean commercial lighting, cohesive with the brand tone${ton ? ` "${ton}"` : ''}. Figure/background clearly separated; the product never blends into the background.
HARD CONSTRAINTS: no fake numbers, ratings, stars, reviews or testimonials; no countdowns or fake urgency; no "24h delivery"/"warehouse in Poland" claims; no other brands' logos. "Viral hit from TikTok" is allowed (true).`
}

// Zwięzły blok kontekstu z RAPORTU RYNKU (market_report jsonb) — OPCJONALNY (stare sesje bez raportu).
// Dla etapu REKLAMY najmocniejsze sekcje: "Problem, potrzeby i emocje" (haki bólowe),
// "Grupa docelowa — avatar", "Plan komunikacji marketingowej" (kąty przekazu) + lead.
// Zwraca '' gdy brak raportu — wtedy blok się nie wstrzykuje (zero zmian w starym torze).
// deno-lint-ignore no-explicit-any
function reportContextBlock(report: any): string {
  if (!report || typeof report !== 'object') return ''
  const lead = String(report.lead || '').trim()
  const sekcje = Array.isArray(report.sekcje) ? report.sekcje : []
  // deno-lint-ignore no-explicit-any
  const pick = (frag: string): string => {
    // deno-lint-ignore no-explicit-any
    const s = sekcje.find((x: any) => String(x?.tytul || '').toLowerCase().includes(frag.toLowerCase()))
    if (!s) return ''
    // Złóż treść sekcji z pól tekstowych poza 'tytul' (struktura sekcji bywa różna).
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
function copyPrompt(product: any, ust: any, style: string, brandName = '', snapTitle = '', reportCtx = ''): string {
  const name = String(product?.nazwa || product?.name || 'produkt').slice(0, 120)
  const cat = String(product?.kategoria || product?.category || '').slice(0, 60)
  const aliTitle = String(snapTitle || '').slice(0, 200)
  const dla = String(ust?.dla_kogo || '').slice(0, 200)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 200)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const haslo = String(ust?.haslo || '').slice(0, 120)
  const ctx = (dla || kat || ton || style || brandName || haslo)
    ? `\n\nUSTALENIA (dopasuj reklamy DOKŁADNIE do nich):${dla ? `\n- Dla kogo: ${dla}` : ''}${kat ? `\n- Kąt/wyróżnik: ${kat}` : ''}${ton ? `\n- Ton marki: ${ton}` : ''}${brandName ? `\n- Marka: ${brandName}` : ''}${style ? `\n- Styl wizualny sklepu: ${style}` : ''}${haslo ? `\n- HASŁO KLIENTA (użyj 1:1 jako headline JEDNEGO konceptu — najlepiej „problem" albo „demo" — jeśli ≤6 słów; dłuższe minimalnie skróć zachowując jego słowa): „${haslo}"` : ''}`
    : ''
  const repCtx = reportCtx
    ? `\n\n[KONTEKST Z RAPORTU RYNKU — wykorzystaj, gdzie pomaga: oprzyj nagłówki i copy reklam na tych realnych bólach, avatarze i kątach komunikacji, nie na ogólnikach]\n${reportCtx}`
    : ''
  return `Jesteś dyrektorem kreatywnym reklam e-commerce na rynek polski. Dla produktu „${name}"${cat ? ` (kategoria: ${cat})` : ''}${aliTitle ? `\nPełny opis produktu (z aukcji): „${aliTitle}" — wykorzystaj realne cechy do trafnego copy.` : ''} przygotuj DOKŁADNIE 4 koncepty reklam-BANERÓW na Facebook/Instagram, każdy w INNYM kącie. Kąty (po jednym): "problem" (problem→rozwiązanie), "demo" (demonstracja/„wow"), "emotion" (emocja/bliscy/prezent), "proof" (dowód społeczny: viral z TikToka — BEZ zmyślonych liczb). Produkt sprzedawany przez landing z płatnością przy odbiorze (COD), model dropshipping→własna marka.${ctx}${repCtx}

Dla każdego konceptu zwróć:
- "angle": jedno z: "problem" | "demo" | "emotion" | "proof",
- "headline": nagłówek na BANER — MAKS 6 słów, po polsku, korzyściowy/scroll-stopper (renderowany na grafice, więc krótki i czytelny),
- "badge": odznaka ≤3 słowa, po polsku, TYLKO prawdziwa (np. „Płatność przy odbiorze", „14 dni na zwrot", „Hit z TikToka", „Viralowy hit"),
- "primary_text": tekst posta (2-3 zdania, hak w 1. zdaniu, korzyść, lekkie CTA „Sprawdź"/„Zamów"; ZERO zmyślonych liczb i fałszywej pilności).

Zwróć WYŁĄCZNIE poprawny JSON: {"ads":[{"angle":"...","headline":"...","badge":"...","primary_text":"..."}, ... 4 sztuki]}`
}

// ===== MANUS: kompletny brief dla agenta (4 copy + 4 kreacje 4:5) — adaptacja manus-full-campaign do /sklep =====
// deno-lint-ignore no-explicit-any
function buildAdsInstruction(product: any, ust: any, brandName: string, snapTitle: string, refs: { url: string }[], productImageUrl: string, logoUrl: string, reportCtx = ''): string {
  const name = String(product?.nazwa || product?.name || snapTitle || 'produkt').slice(0, 120)
  const dla = String(ust?.dla_kogo || '').slice(0, 240)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 240)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const hasloM = String(ust?.haslo || '').slice(0, 120)
  const extraRefs = refs.slice(1, 4).map((r) => r.url).filter(Boolean)
  const repCtx = reportCtx
    ? `\n[KONTEKST Z RAPORTU RYNKU — wykorzystaj, gdzie pomaga: oprzyj nagłówki i copy reklam na tych realnych bólach, avatarze i kątach komunikacji, nie na ogólnikach]\n${reportCtx}\n`
    : ''
  return `Jesteś full-stack marketerem DTC na rynek polski. Zrobisz KOMPLET 4 reklam-banerów na Facebook/Instagram dla jednoproduktowego sklepu (model dropshipping → własna marka, sprzedaż przez landing z PŁATNOŚCIĄ PRZY ODBIORZE / COD).

🎯 ZDJĘCIE PRODUKTU (TEN produkt MA być na WSZYSTKICH 4 banerach):
${productImageUrl}
⚠️ KROK ZEROWY (zrób TERAZ, przed czymkolwiek innym):
1. Pobierz to zdjęcie swoim narzędziem (download/curl/wget), zapisz jako product_reference.jpg
2. Przeanalizuj wizualnie: kształt, kolor, materiał, charakterystyczne detale, branding na produkcie
3. Napisz krótko „Pobrałem zdjęcie, widzę [opis]" — DOPIERO POTEM generuj grafiki
W KAŻDEJ z 4 grafik użyj DOKŁADNIE tego produktu (ten sam kształt/kolor/materiał) — żadnej reimaginacji ani innego wariantu.${extraRefs.length ? `\nDodatkowe kadry produktu (dla wierności 3D): ${extraRefs.join('  ')}` : ''}
${logoUrl ? `\n🏷️ LOGO MARKI — pobierz i umieść je 1:1 (bez zmiany kształtu/kolorów) w rogu każdej grafiki: ${logoUrl}\n` : ''}
KONTEKST (z ustaleń klienta — dopasuj reklamy DOKŁADNIE):
- Produkt: ${name}${snapTitle ? `\n- Opis z aukcji: „${snapTitle}"` : ''}
- Marka: ${brandName || '(brak nazwy — użyj neutralnego, spójnego brandingu; NIE wymyślaj nazwy)'}
- Dla kogo: ${dla || '—'}  (persona na kreacji lifestyle/problem)
- Kąt / wyróżnik: ${kat || '—'}  (główny hook copy i dobór konceptów)
- Ton marki: ${ton || '—'}${hasloM ? `\n- HASŁO KLIENTA (jego własne słowa — użyj 1:1 jako headline JEDNEGO konceptu, najlepiej „problem" albo „demo"; renderuj je też na tej grafice): „${hasloM}"` : ''}
${repCtx}
=== ZADANIE 1: 4 KONCEPTY COPY (różne kąty) ===
Po jednym z kątów: "problem" (problem→rozwiązanie), "demo" (demonstracja/„wow"), "emotion" (emocja/prezent/bliscy), "proof" (dowód społeczny: viral z TikToka — BEZ zmyślonych liczb/recenzji).
Dla każdego: angle, headline (≤6 słów, PL, renderowany na grafice), badge (≤3 słowa, TYLKO prawdziwy: „Płatność przy odbiorze" / „14 dni na zwrot" / „Hit z TikToka" / „Viralowy hit"), primary_text (2-3 zdania, hak w 1. zdaniu, korzyść, lekkie CTA „Sprawdź"/„Zamów").

=== ZADANIE 2: 4 KREACJE GRAFICZNE (najważniejsze) ===
Format PIONOWY 4:5 (1080×1350 px), pod feed IG/FB. Każda kreacja = INNY angle z Zadania 1:
- ad_1_problem: czysty produkt-in-use jako „naprawa" problemu z polskim headline; opcjonalnie mały inset detalu.
- ad_2_demo: produkt W AKCJI / mid-use, energia, mały inset produktu solo dla wierności kształtu.
- ad_3_emotion: ciepła scena lifestyle z personą dopasowaną do „dla kogo", produkt naturalnie w dłoni/kontekście.
- ad_4_proof: produkt-bohater + pieczęć „Viralowy hit" / „Hit z TikToka" (BEZ gwiazdek, liczb, fałszywych recenzji).
ZASADY GRAFIK:
- Polski tekst poprawny (z diakrytykami), TYLKO krótki: headline + przycisk-pigułka „Kup teraz" (+ ewentualnie badge). Bez akapitów na grafice.
- Branding ${brandName || 'marki'} widoczny (logo/nazwa w rogu); gdy brak — neutralny i spójny.
- Ciepłe/jasne światło; NIE białe studio (wygląda jak Allegro); produkt 1:1 z referencji.
- Element COD jako ATUT: badge „Płatność przy odbiorze" pasuje do problem/proof.
ZAKAZY (COD/safety): zero zmyślonej pilności/countdownów; zero „dostawa 24h"/„magazyn w Polsce"; zero zmyślonych liczb/gwiazdek/recenzji; zero obcych logo; zero obietnic medycznych; bez cen na grafice.

=== OUTPUT (KONIECZNIE) ===
1. Plik "campaign.json": {"ads":[{"angle":"problem","headline":"...","badge":"...","primary_text":"..."}, ... 4 sztuki]}
2. 4 obrazy PNG jako ZAŁĄCZNIKI, nazwane DOKŁADNIE: ad_1_problem.png, ad_2_demo.png, ad_3_emotion.png, ad_4_proof.png
3. 2-3 zdania podsumowania.
Pracuj samodzielnie aż skończysz wszystko — nie pytaj o nic w międzyczasie; gdy czegoś brakuje, przyjmij sensowny default i kontynuuj.`
}

// Referencję produktu cache'ujemy do Storage (Manus pobiera ją sam — AliExpress bywa nieosiągalny/AVIF dla agenta).
// deno-lint-ignore no-explicit-any
async function cacheRefToStorage(supabase: any, sessionId: string, url: string): Promise<string> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SupabaseEdge/1.0)', 'Accept': 'image/*' } })
    if (!r.ok) return url
    const buf = await r.arrayBuffer()
    const ct = (r.headers.get('content-type') || 'image/jpeg').split(';')[0].trim()
    const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg'
    const path = `ai-generated/bud/${sessionId}/ref_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('attachments').upload(path, buf, { contentType: ct, upsert: true })
    if (error) return url
    const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path)
    return pub?.publicUrl || url
  } catch { return url }
}

// T10: alert #sparing przy definitywnej porażce generacji (wzorzec 1:1 z bud-image).
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) { console.error('[bud-ads] slack-notify: brak SUPABASE_URL/KEY'); return }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[bud-ads] slack-notify ${type} HTTP`, res.status, await res.text())
  } catch (err) {
    console.error(`[bud-ads] slack-notify ${type} exception:`, err)
  }
}

// deno-lint-ignore no-explicit-any
function tolerantParse(t: string): any {
  try { return JSON.parse(t) } catch { /* */ }
  const m = t.match(/\{[\s\S]*\}/)
  if (m) { try { return JSON.parse(m[0]) } catch { /* */ } }
  return null
}

// Sprawdź task Manus; gdy skończony — wyciągnij załączniki (4 PNG + campaign.json), rehostuj do Storage,
// złóż session_ads=[{headline,primary_text,image_url}] i zapisz. Zwraca {done, ads?}.
// deno-lint-ignore no-explicit-any
async function manusPollAndPull(supabase: any, sessionId: string, taskId: string): Promise<{ done: boolean; ads?: unknown[] }> {
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

  const copyByAngle: Record<string, { headline: string; primary_text: string }> = {}
  if (jsonFiles.length) {
    try {
      const t = await (await fetch(jsonFiles[0].url)).text()
      const parsed = tolerantParse(t)
      // deno-lint-ignore no-explicit-any
      for (const a of (parsed?.ads || [])) if (a && a.angle) copyByAngle[String(a.angle).toLowerCase()] = { headline: String(a.headline || ''), primary_text: String(a.primary_text || '') }
    } catch { /* */ }
  }

  const byAngle: Record<string, string> = {}
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    try {
      const buf = await (await fetch(img.url)).arrayBuffer()
      const ctI = String(img.content_type || '')
      const ext = ctI.includes('png') ? 'png' : ctI.includes('webp') ? 'webp' : 'jpg'
      const path = `ai-generated/bud/${sessionId}/manus_${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage.from('attachments').upload(path, buf, { contentType: img.content_type || 'image/png', upsert: false })
      if (error) continue
      const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path)
      const ang = (String(img.filename || '').match(/ad_\d+_([a-z_]+)\./i)?.[1] || ANGLES[i] || `ad_${i + 1}`).toLowerCase()
      if (pub?.publicUrl) byAngle[ang] = pub.publicUrl
    } catch { /* */ }
  }

  // złóż w kolejności kątów; front oczekuje [{headline,primary_text,image_url}]
  const ads = ANGLES.map((a) => ({ headline: copyByAngle[a]?.headline || '', primary_text: copyByAngle[a]?.primary_text || '', image_url: byAngle[a] || '' }))
    .filter((x) => x.image_url || x.headline)
  for (const a of Object.keys(byAngle)) if (!ANGLES.includes(a)) ads.push({ headline: copyByAngle[a]?.headline || '', primary_text: copyByAngle[a]?.primary_text || '', image_url: byAngle[a] })

  if (!ads.some((x) => x.image_url)) return { done: false }   // skończony, ale brak grafik → poczekaj kolejny cykl (nie oznaczaj completed)

  // ATOMOWO (audyt regresji #3): poll frontu i sweep crona potrafią wywołać pull RÓWNOLEGLE —
  // update warunkowy na status='running' wygrywa raz; przegrany NIE liczy kosztu drugi raz
  // (dubel wpisu zjadał cap MAX_MANUS_RETRIGGERS_PER_SESSION) i nie zwalnia locka ponownie.
  const { data: won } = await supabase.from('bud_sessions')
    .update({ session_ads: ads, ads_manus_status: 'completed', ads_manus_completed_at: new Date().toISOString() })
    .eq('id', sessionId).eq('ads_manus_status', 'running').select('id')
  if (!won || !won.length) return { done: true, ads }
  // KOSZT: task Manus (kredyty agenta) — stawka szacunkowa MANUS_TASK_USD
  try { await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'ads', model: 'manus', cost_usd: MANUS_TASK_USD, meta: { source: 'manus', task_id: taskId } }) } catch { /* log nie blokuje */ }
  try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'ads' }) } catch { /* */ }
  return { done: true, ads }
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
    // Admin/cron (panel TN Aplikacje, testy, rerolle) omija capy anty-nadużycia — jak w bud-landing.
    const isAdmin = !!CRON && req.headers.get('x-admin-secret') === CRON
    // deno-lint-ignore no-explicit-any
    let body: { sessionId?: string; product?: any; force?: boolean; sweep?: boolean }
    try { body = await req.json() } catch { return json({ error: 'nieprawidlowy_json' }, 400, c) }

    // T5: SWEEP (cron przez bud-drip, x-admin-secret) — dociąga wyniki tasków Manus dla sesji,
    // w których user ZAMKNĄŁ KARTĘ (dotąd wynik lądował tylko, gdy front pollował → reklamy
    // nigdy nie trafiały do sesji, a comeback-mail „reklamy gotowe" przepadał) + oznacza
    // failed taski wiszące >40 min (z alertem).
    if (body.sweep) {
      if (!isAdmin) return json({ error: 'brak_uprawnien' }, 403, c)
      const sweepDb = createClient(SUPABASE_URL, SERVICE_KEY)
      const { data: running } = await sweepDb
        .from('bud_sessions')
        .select('id, ads_manus_task_id, ads_manus_started_at')
        .eq('ads_manus_status', 'running')
        .not('ads_manus_task_id', 'is', null)
        .limit(20)
      let pulled = 0, timedOut = 0
      for (const s of (running || [])) {
        try {
          if (MANUS_API_KEY) {
            const r = await manusPollAndPull(sweepDb, s.id as string, String(s.ads_manus_task_id))
            if (r.done) { pulled++; continue }
          }
          const started = s.ads_manus_started_at ? Date.parse(String(s.ads_manus_started_at)) : 0
          if (started && (Date.now() - started) > 40 * 60 * 1000) {
            await sweepDb.from('bud_sessions').update({ ads_manus_status: 'failed', ads_manus_step: 'timeout_sweep' }).eq('id', s.id)
            try { await sweepDb.rpc('bud_release_lock', { p_session: s.id, p_key: 'ads' }) } catch { /* */ }
            timedOut++
            await postSlackSparing('bud_gen_error', { session_id: s.id as string, stage: 'reklamy (Manus, timeout >40 min — sweep)', error: `task ${s.ads_manus_task_id} nie dowiózł wyniku` })
          }
        } catch (e) { console.error('[bud-ads] sweep err', s.id, e) }
      }
      return json({ swept: (running || []).length, pulled, timed_out: timedOut }, 200, c)
    }

    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) return json({ error: 'nieprawidlowa_sesja' }, 400, c)

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: session } = await supabase.from('bud_sessions').select('id, auth_user_id, ustalenia, chosen_style, session_ads, brand, market_report, ads_manus_task_id, ads_manus_status, ads_manus_started_at').eq('id', sessionId).maybeSingle()
    if (!session) return json({ error: 'nieprawidlowa_sesja' }, 404, c)
    // Admin (x-admin-secret) omija owner-gate — rerolle z panelu na sesjach przypiętych
    // do kont dostawały 403 (audyt regresji #4; spójnie z bud-mockup/bud-landing-gen).
    if (!isAdmin) {
      const authUser = await verifyAuthUser(req, supabase)
      if (ownerDenied(session.auth_user_id as string | null, authUser)) return json({ error: 'wymagane_logowanie' }, 403, c)
    }

    // deno-lint-ignore no-explicit-any
    const product: any = (body.product && typeof body.product === 'object') ? body.product : null
    if (!product || !(product.nazwa || product.name)) return json({ error: 'brak_produktu' }, 400, c)

    // Snapshot z AliExpress (tytuł + lepsze zdjęcie-referencja) — spójnie z bud-mockup.
    // Bez tego copy jest uboższe, a grafiki dostają słabszą referencję.
    let snap: Record<string, unknown> | null = null
    let curated: string | null = null
    try {
      const pkId = String(product.id || '')
      if (pkId && UUID_RE.test(pkId)) {
        const { data: row } = await supabase.from('bud_tt_products').select('ali_snapshot, curated_image').eq('id', pkId).maybeSingle()
        snap = (row && row.ali_snapshot) || null
        curated = (row && (row.curated_image as string)) || null
      }
    } catch { /* */ }
    const snapTitle = String((snap && (snap as any).title) || '')
    // FIX: galeria AliExpress jako reference_images type:'product' (kilka kadrów) — zamiast pojedynczego
    // main_image, który przez legacy `reference_image_url` był traktowany jako LOGO (→ zły produkt).
    // curated_image (panel /trendy) idzie PIERWSZE — snapshot z wyszukiwarki bywa innym produktem.
    const refs = productRefs(snap, product, 4, curated)
    const ust = session.ustalenia || {}
    const reportCtx = reportContextBlock(session.market_report)
    const style = String(session.chosen_style || '')
    const brandObj = (session.brand && typeof session.brand === 'object') ? session.brand as Record<string, unknown> : null
    const brandName = String((brandObj?.chosen_name as string) || (brandObj?.nazwa as string) || '').slice(0, 60)

    // PER-SESJA (reklamy zależą od ustaleń konkretnego usera, nie cache per-produkt)
    if (!body.force && Array.isArray(session.session_ads) && session.session_ads.length) {
      return json({ ads: session.session_ads, cached: true }, 200, c)
    }

    // ── ANTY-NADUŻYCIE: poniżej każda ścieżka GENERUJE (Manus lub Gemini) = realny koszt.
    // Cache-hit już wyszedł wyżej, więc capy nie dotykają legalnego usera czytającego gotowe reklamy.
    // force=true CELOWO też podlega capom (inaczej obejście przez „regeneruj").
    // Fail-open: gdy nie da się policzyć (brak IP / błąd zapytania) — NIE blokujemy (loguj), żeby
    // nie wywalić legalnych userów (wzorzec bud-landing/bud-image).

    // (a) Cap dzienny per IP — reklamy WYGENEROWANE w ostatnich 24 h po wszystkich sesjach tego IP.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    if (!isAdmin && ip) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ipSessions, error: ipErr } = await supabase
        .from('bud_sessions')
        .select('id')
        .eq('ip', ip)
      if (ipErr) {
        console.error('[bud-ads] ip sessions query error:', ipErr)
      } else if (ipSessions && ipSessions.length) {
        const { count: ipCount, error: ipUsageErr } = await supabase
          .from('bud_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'ads')
          .in('session_id', ipSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (ipUsageErr) {
          console.error('[bud-ads] ip usage count error:', ipUsageErr)
        } else if ((ipCount ?? 0) >= MAX_ADS_PER_IP_PER_DAY) {
          return json({ error: 'limit_reklam_dzienny' }, 429, c)
        }
      }
    }

    // ===== MANUS: finalne kreacje robi agent Manus (flaga BUD_ADS_MANUS_ENABLED) =====
    if (MANUS_ENABLED) {
      const sAny = session as Record<string, unknown>
      // task już biegnie → sprawdź status i (gdy skończony) dociągnij wynik. Front poluje co ~12s.
      if (!body.force && sAny.ads_manus_status === 'running' && sAny.ads_manus_task_id) {
        const res = await manusPollAndPull(supabase, sessionId, String(sAny.ads_manus_task_id))
        if (res.done && res.ads) return json({ ads: res.ads }, 200, c)
        const started = sAny.ads_manus_started_at ? Date.parse(String(sAny.ads_manus_started_at)) : 0
        if (started && (Date.now() - started) > 32 * 60 * 1000) {
          await supabase.from('bud_sessions').update({ ads_manus_status: 'failed', ads_manus_step: 'timeout' }).eq('id', sessionId)
          try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'ads' }) } catch { /* */ }
          return json({ error: 'manus_timeout' }, 504, c)
        }
        return json({ pending: true, manus: 'running' }, 202, c)
      }
      // (b) Cap re-triggerów Manus per sesja — task Manus to NAJDROŻSZY fallback (kredyty agenta).
      // Liczymy zalogowane taski Manus tej sesji (bud_usage kind='ads' model='manus', wpis robi
      // manusPollAndPull po ukończeniu). force=true też tu wpada (poll path wyżej już obsłużony,
      // więc nie blokujemy usera czekającego na biegnący task). Fail-open na błędzie zapytania.
      if (!isAdmin) {
        const { count: manusCount, error: manusCntErr } = await supabase
          .from('bud_usage')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', sessionId)
          .eq('kind', 'ads')
          .eq('model', 'manus')
        if (manusCntErr) {
          console.error('[bud-ads] manus usage count error:', manusCntErr)
        } else if ((manusCount ?? 0) >= MAX_MANUS_RETRIGGERS_PER_SESSION) {
          return json({ error: 'limit_reklam_sesja' }, 429, c)
        }
      }
      // utwórz nowy task Manus (force lub pierwszy raz)
      const { data: mlock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'ads', p_ttl_sec: 2000 })
      if (!mlock) return json({ pending: true }, 202, c)
      let manusCreateErr = ''
      try {
        const rawRef = refs[0]?.url || ''
        const productImageUrl = rawRef ? await cacheRefToStorage(supabase, sessionId, rawRef) : ''
        const logoUrl = String((brandObj?.chosen_logo as string) || (brandObj?.logo_url as string) || '')
        const messagePayload: Record<string, unknown> = { content: buildAdsInstruction(product, ust, brandName, snapTitle, refs, productImageUrl, logoUrl, reportCtx) }
        if (productImageUrl) {
          const lo = productImageUrl.toLowerCase()
          const ct = lo.includes('.png') ? 'image/png' : lo.includes('.webp') ? 'image/webp' : lo.includes('.avif') ? 'image/avif' : 'image/jpeg'
          messagePayload.attachments = [{ type: 'image', content_type: ct, filename: 'product_reference.' + (ct.split('/')[1] || 'jpg'), url: productImageUrl }]
        }
        const createRes = await fetch(`${MANUS_BASE}/task.create`, { method: 'POST', headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: messagePayload }) })
        const createData = await createRes.json().catch(() => null)
        if (!createRes.ok || !createData?.ok || !createData?.task_id) {
          manusCreateErr = `HTTP ${createRes.status}: ${JSON.stringify(createData).slice(0, 180)}`
          console.error('[bud-ads] Manus task.create failed', manusCreateErr)
        } else {
          await supabase.from('bud_sessions').update({ ads_manus_task_id: createData.task_id, ads_manus_status: 'running', ads_manus_started_at: new Date().toISOString(), ads_manus_step: null, session_ads: null }).eq('id', sessionId)
          return json({ pending: true, manus: 'created', task_id: createData.task_id }, 202, c)
        }
      } catch (e) {
        manusCreateErr = String(e).slice(0, 180)
        console.error('[bud-ads] Manus create error', e)
      }
      // FALLBACK (fix 2026-07-02, incydent „reklamy nie działają"): padnięty task.create
      // (najczęściej BRAK KREDYTÓW Manusa) kończył się dead-endem 502 — user klikał
      // „Spróbuj ponownie" w kółko i nic. Tor zapasowy Gemini istniał, ale odpalał się
      // TYLKO przy wyłączonej fladze. Teraz: create padł → alert dla Tomka → zwalniamy
      // lock Manusowy i SPADAMY do toru Gemini niżej (świeży claim).
      // Req Tomka: brak kredytów ma być powiedziany WPROST, po ludzku — nie surowym JSON-em.
      const isCredits = /HTTP 429|resource_exhausted|credit limit/i.test(manusCreateErr)
      await postSlackSparing('bud_gen_error', {
        session_id: sessionId,
        stage: isCredits ? 'reklamy — SKOŃCZYŁY SIĘ KREDYTY MANUSA → przełączam na Gemini' : 'reklamy — Manus create padł → przełączam na Gemini',
        error: isCredits
          ? 'Manus odrzucił zadanie: limit kredytów wyczerpany. DOŁADUJ KREDYTY w Manusie — do tego czasu kreacje robi fallback Gemini (słabsza jakość, ale lejek nie stoi).'
          : manusCreateErr,
        product: String(product?.nazwa || product?.name || ''),
      })
      try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'ads' }) } catch { /* */ }
    }

    // ===== Fallback: Gemini (gdy flaga Manus wyłączona / brak klucza) =====
    const { data: lock } = await supabase.rpc('bud_claim_lock', { p_session: sessionId, p_key: 'ads', p_ttl_sec: 300 })
    if (!lock) return json({ pending: true }, 202, c)

    const genTask = (async () => {
      try {
        // 1) Copy — 1 call gpt-5.1 → 4 koncepty (z fallbackiem gdy JSON padnie)
        let concepts: Array<{ angle?: string; headline?: string; primary_text?: string; badge?: string }> = []
        try {
          const r = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: copyPrompt(product, ust, style, brandName, snapTitle, reportCtx) }], response_format: { type: 'json_object' } }),
          }, 'bud-ads-copy')
          if (r.ok) {
            const d = await r.json()
            try { const uu = d?.usage || {}; const inT = uu.prompt_tokens || 0, cT = (uu.prompt_tokens_details?.cached_tokens) || 0, oT = uu.completion_tokens || 0; await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'ads', model: MODEL, input_tokens: inT, cached_tokens: cT, output_tokens: oT, cost_usd: (Math.max(0, inT - cT) * 1.25 + cT * 0.125 + oT * 10) / 1_000_000, meta: { from: 'ads-copy-gemini' } }) } catch (_) { /* */ }
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
            body: JSON.stringify({ prompt: adImagePrompt(cpt, product, ust, brandName), provider: 'gemini', aspect_ratio: '4:5', type: 'ad', count: 1, ...(refs.length ? { reference_images: refs } : {}) }),
          }, 90_000)
          let image_url = ''
          if (ir.ok) { const id = await ir.json().catch(() => null); const u = id?.images?.[0]?.url; if (u && !String(u).startsWith('data:')) image_url = u }
          else console.error('[bud-ads] image HTTP', ir.status)
          return { headline: String(cpt.headline || ''), primary_text: String(cpt.primary_text || ''), image_url }
        }))
        const ads = settled.map((s, i) => s.status === 'fulfilled'
          ? s.value
          : { headline: String(concepts[i]?.headline || ''), primary_text: String(concepts[i]?.primary_text || ''), image_url: '' })

        // T3: 0 grafik = PORAŻKA, nie „sukces". Dotąd zapisywało się session_ads z samym
        // copy → cache-hit na zawsze i user oglądał „reklamy" bez obrazków. Teraz: nie
        // zapisuj, zwolnij lock (retry generuje od razu) i alertuj Tomka.
        const nImg = ads.filter((a) => a.image_url).length
        if (!nImg) {
          console.error('[bud-ads] 0/4 grafik — NIE zapisuję session_ads (retry po releasie locka)')
          try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'ads' }) } catch { /* */ }
          await postSlackSparing('bud_gen_error', { session_id: sessionId, stage: 'reklamy (bud-ads / Gemini)', error: '0/4 grafik — żaden obraz się nie wygenerował', product: String(product?.nazwa || product?.name || '') })
          return
        }
        await supabase.from('bud_sessions').update({ session_ads: ads }).eq('id', sessionId)
        // KOSZT: obrazy reklam Gemini (fallback)
        try { await supabase.from('bud_usage').insert({ session_id: sessionId, kind: 'image', images: nImg, cost_usd: GEMINI_IMAGE_USD * nImg, meta: { view: 'ad', provider: 'gemini', from: 'bud-ads' } }) } catch (_) { /* */ }
      } catch (e) {
        console.error('[bud-ads] gen task error:', e)
        // T2/T10: pad taska = lock w dół + alert (user nie wisi do TTL 300 s).
        try { await supabase.rpc('bud_release_lock', { p_session: sessionId, p_key: 'ads' }) } catch { /* */ }
        await postSlackSparing('bud_gen_error', { session_id: sessionId, stage: 'reklamy (bud-ads / Gemini)', error: String(e).slice(0, 280), product: String(product?.nazwa || product?.name || '') })
      }
    })()
    try { (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime?.waitUntil?.(genTask) } catch (_) { /* */ }

    return json({ pending: true }, 202, c)
  } catch (e) {
    console.error('[bud-ads] ERROR:', e)
    return json({ error: 'blad_serwera' }, 500, c)
  }
})
