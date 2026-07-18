// wf2-ads — statyczne KREACJE REKLAMOWE (copy + grafika) per produkt workflow v2 („Sklepy").
// Silnik: WYŁĄCZNIE AGENT MANUS (research FB Ad Library → copy PL → grafiki 4:5). Decyzja Tomka
// 19.07 (rev2): „albo Manus, albo ma się nie wykonać" — ZERO silnika zastępczego. Awaria = twardy
// FAIL (ads_manus_status='failed' + step + Slack) i reset RĘCZNY w panelu po doładowaniu kredytów.
// Domyślnie ŁĄCZNIE 3 KREACJE: 3 kąty (demo/problem/proof) × 1 format 4:5 w JEDNYM tasku Manusa.
// Wynik → wf2_products.ads_creatives (panel) + rejestr wf2_creatives (media_type='image') +
// wf2_artifacts (kind='ad_creative'). Wynik dociągany pollem panelu / sweepem (webhook).
// ⚠️ DEPLOY: --no-verify-jwt (sweep z webhooka woła bez JWT).
//
// POST { product_id, force?, sweep?, angles?, formats? }
//   -> { ads:[{angle,format,headline,primary_text,badge,image_url,approved}] }
//    | { pending:true } | { failed:true, ... } | { swept, pulled, timed_out }
// Gate: x-admin-secret == SPAR_CRON_SECRET  ||  x-wf2-secret == WF2_GEN_SECRET  ||  team JWT (adminGate).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const ALLOWED_ORIGINS = ['https://crm.tomekniedzwiecki.pl', 'https://tn-crm.vercel.app', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500']
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-wf2-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Silnik = WYŁĄCZNIE Manus. Kill-switch WF2_ADS_MANUS_ENABLED (fallback na współdzieloną
// BUD_ADS_MANUS_ENABLED) + wymagany MANUS_API_KEY. Brak któregokolwiek → generator wyłączony (503).
const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY') || ''
const MANUS_ENABLED = ((Deno.env.get('WF2_ADS_MANUS_ENABLED') || Deno.env.get('BUD_ADS_MANUS_ENABLED') || '') === '1') && !!MANUS_API_KEY
const MANUS_BASE = 'https://api.manus.ai/v2'
// 3 KĄTY: demo pierwszy — najsilniejszy na zimno (R4 §3.2 ads_grafiki).
const ANGLES = ['demo', 'problem', 'proof']
// Formaty: default '45' (1080×1350, feed) → ŁĄCZNIE 3 kreacje. '916' (1080×1920, Stories/Reels)
// = rozszerzenie na przyszłość (safe-zones w prompcie), nie generowane domyślnie.
const DEFAULT_FORMATS = ['45']
const ALLOWED_FORMATS = ['45', '916']
// Koszt 1 taska Manus (kredyty→USD) — SZACUNEK, konfigurowalny sekretem BUD_MANUS_TASK_USD.
const MANUS_TASK_USD = parseFloat(Deno.env.get('BUD_MANUS_TASK_USD') || '') || 0.30
// Wall-clock edge ~400 s (pamięć: „edge-wallclock-niewidzialne-pady") — sweep ma twardy deadline.
const SWEEP_DEADLINE_MS = 300 * 1000
// Karencja na eventual-consistency Manusa: task.detail bywa 'completed'/'done' ZANIM task.listMessages
// pokaże assistant_message.attachments. Nie flipujemy na failed('no_output') zanim minie ta karencja od
// startu tasku — inaczej chwilowa niespójność = fałszywy FAIL bez silnika zastępczego (a bud-ads celowo
// zdaje to na self-heal timeoutem). 'stopped' = realne przerwanie → fail od razu (patrz niżej).
const NO_OUTPUT_GRACE_MS = 5 * 60 * 1000

function json(b: Record<string, unknown>, s: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...c, 'Content-Type': 'application/json' } })
}

// Plan kreacji: iloczyn kątów × formatów → lista {idx, angle, format, filename}.
// Back-compat 1:1: format '45' BEZ sufiksu (ad_<n>_<angle>.png), '916' z sufiksem (…_916.png).
function planCreatives(angles: string[], formats: string[]): Array<{ idx: number; angle: string; format: string; filename: string }> {
  const out: Array<{ idx: number; angle: string; format: string; filename: string }> = []
  let n = 1
  for (const angle of angles) for (const fmt of formats) {
    const suffix = fmt === '45' ? '' : `_${fmt}`
    out.push({ idx: n, angle, format: fmt, filename: `ad_${n}_${angle}${suffix}.png` })
    n++
  }
  return out
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

// ===== MANUS: kompletny brief dla agenta (copy + kreacje) — DNA marki dziedziczone z landingu (D3). =====
// Wygląd produktu NIESIE ZAŁĄCZNIK (product_reference) — słowo = akcja/scena + zakazy, nie recytacja anatomii.
// deno-lint-ignore no-explicit-any
function buildAdsInstruction(
  product: any, ust: any, brandName: string, snapTitle: string,
  refs: { url: string }[], productImageUrl: string, logoUrl: string, reportCtx: string,
  dna: { paleta?: string; fonty?: string; stylMasterUrl?: string; landingUrl?: string; priceInfo?: string },
  plan: Array<{ idx: number; angle: string; format: string; filename: string }>,
  fromTrendy: boolean,
): string {
  const name = String(product?.nazwa || product?.name || snapTitle || 'produkt').slice(0, 120)
  const dla = String(ust?.dla_kogo || '').slice(0, 240)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 240)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const hasloM = String(ust?.haslo || '').slice(0, 120)
  const extraRefs = refs.slice(1, 4).map((r) => r.url).filter(Boolean)
  const paleta = String(dna?.paleta || '').slice(0, 200)
  const fonty = String(dna?.fonty || '').slice(0, 160)
  const stylMaster = String(dna?.stylMasterUrl || '').trim()
  const landingUrl = String(dna?.landingUrl || '').trim()
  const priceInfo = String(dna?.priceInfo || '').slice(0, 240)
  const repCtx = reportCtx
    ? `\n[KONTEKST Z RAPORTU / BRIEFU — oprzyj nagłówki i copy na tych realnych bólach, avatarze i kątach, nie na ogólnikach]\n${reportCtx}\n`
    : ''
  const has916 = plan.some((p) => p.format === '916')
  const fmtLabel = (f: string) => f === '916' ? 'PIONOWY 9:16 (1080×1920 px, Stories/Reels)' : 'PIONOWY 4:5 (1080×1350 px, feed IG/FB)'
  const fileList = plan.map((p) => `  • ${p.filename} — kąt „${p.angle}", ${fmtLabel(p.format)}`).join('\n')
  const nFiles = plan.length
  // Claim „Hit z TikToka"/„Viralowy hit" = PRAWDZIWY tylko gdy produkt realnie pochodzi z radaru /trendy
  // (fromTrendy). Inaczej to zmyślony rodowód (playbook proof §krytyczna, ZG4, polityka Meta 2026) — bramkujemy
  // go tak samo jak liczby na realnych danych: bez /trendy → generyczny dowód społeczny / risk-reversal, zero virala.
  const proofDesc = fromTrendy
    ? 'dowód społeczny: viral z TikToka — BEZ zmyślonych liczb/recenzji'
    : 'dowód społeczny / risk-reversal: „sprawdzony wybór", COD — BEZ claimu virala/TikToka i BEZ zmyślonych liczb/recenzji'
  const badgeList = fromTrendy
    ? '„Płatność przy odbiorze" / „14 dni na zwrot" / „Hit z TikToka" / „Viralowy hit"'
    : '„Płatność przy odbiorze" / „14 dni na zwrot" / „Sprawdzony wybór"'
  const proofArt = fromTrendy
    ? '- proof — VIRAL/SOCIAL: produkt-bohater na CIEMNYM/kontrastowym tle + wyrazista pieczęć „Hit z TikToka" / „Viralowy hit"; surowy socialowy vibe, skondensowana typografia. BEZ gwiazdek/liczb/fałszywych recenzji, BEZ interfejsu/logo TikToka.'
    : '- proof — DOWÓD SPOŁECZNY / RISK-REVERSAL: produkt-bohater na CIEMNYM/kontrastowym tle, surowy socialowy vibe, skondensowana typografia; zamiast virala pieczęć „Sprawdzony wybór" i/lub badge „Płatność przy odbiorze". ZAKAZ „Hit z TikToka"/„Viralowy hit"/jakiegokolwiek claimu virala — produkt NIE pochodzi z radaru /trendy. BEZ gwiazdek/liczb/fałszywych recenzji, BEZ interfejsu/logo TikToka.'
  return `Jesteś full-stack marketerem DTC na rynek polski. Zrobisz KOMPLET ${nFiles} statycznych reklam-banerów na Facebook/Instagram dla jednoproduktowego sklepu (model dropshipping → własna marka, sprzedaż przez landing z PŁATNOŚCIĄ PRZY ODBIORZE / COD).

🎯 PRODUKT — WIERNOŚĆ 1:1 (zasada święta):
W ZAŁĄCZNIKU masz "product_reference" — TO jest dokładny produkt. Użyj go 1:1 na KAŻDEJ grafice: keep the product EXACTLY as in the reference — ten sam kształt, kolor, materiał, detale i branding na produkcie. NIE opisuję wyglądu produktu słowem, bo prawdę niesie ZAŁĄCZNIK; Twoje zadanie to akcja/scena wokół realnych pikseli, nie reinterpretacja ani inny wariant produktu.${productImageUrl ? `\nGdyby załącznik nie doszedł: pobierz ${productImageUrl} i użyj jako referencji.` : ''}${extraRefs.length ? `\nDodatkowe kadry (wierność 3D): ${extraRefs.join('  ')}` : ''}

🏷️ DNA MARKI (message match reklama↔landing — reklama MUSI wyglądać jak z tego samego świata co landing):
${brandName ? `- Mini-marka: ${brandName}` : '- Mini-marka: (brak nazwy — neutralny, spójny branding; NIE wymyślaj nazwy)'}${logoUrl ? `\n- LOGO: pobierz i umieść 1:1 (bez zmiany kształtu/kolorów) w rogu KAŻDEJ grafiki — 8–12% wysokości kadru, NIGDY centralnie: ${logoUrl}` : ''}${paleta ? `\n- Paleta marki (użyj tych kolorów): ${paleta}` : ''}${fonty ? `\n- Typografia/fonty marki: ${fonty}` : ''}${stylMaster ? `\n- STYL-MASTER w ZAŁĄCZNIKU ("styl_master") — referencja tonu wizualnego marki; trzymaj klimat i paletę spójne z nim.` : ''}${landingUrl ? `\n- LANDING LIVE: ${landingUrl} — WEJDŹ na tę stronę, przeanalizuj hero, paletę i ton, i zrób message match: obietnica reklamy = obietnica hero, ten sam key visual/klimat.` : ''}

KONTEKST (z briefu mini-marki — dopasuj DOKŁADNIE):
- Produkt: ${name}${snapTitle ? `\n- Opis z aukcji: „${snapTitle}"` : ''}
- Dla kogo: ${dla || '—'}
- Kąt / obietnica: ${kat || '—'}  (główny hook copy)
- Ton marki: ${ton || '—'}${hasloM ? `\n- HASŁO KLIENTA (jego słowa — użyj 1:1 jako headline JEDNEGO konceptu, „problem" lub „demo"; ≤6 słów): „${hasloM}"` : ''}
${priceInfo ? `- PRAWDZIWE LICZBY (używaj WYŁĄCZNIE tych, z kotwicą; zero zmyślonych): ${priceInfo}` : '- LICZBY: brak zweryfikowanych — NIE podawaj ŻADNYCH liczb/cen/ocen na grafice.'}
${repCtx}
=== ZADANIE 1: COPY (po jednym na kąt) ===
Kąty: "demo" (demonstracja/„wow", mechanizm), "problem" (problem→rozwiązanie), "proof" (${proofDesc}).
Dla każdego: angle, headline (3–6 słów, PL, renderowany na grafice, JEDNA obietnica), badge (≤3 słowa, TYLKO prawdziwy: ${badgeList}), primary_text (2–3 zdania, hak w 1. zdaniu, korzyść, lekkie CTA „Sprawdź"/„Zamów").

=== ZADANIE 2: ${nFiles} KREACJI GRAFICZNYCH (najważniejsze) ===
Wygeneruj DOKŁADNIE te pliki (każdy = inny kąt/format):
${fileList}
⚠️ RÓŻNORODNOŚĆ (test A/B): kąty to RÓŻNE reklamy — inny układ, inne tło/paleta, inny charakter typografii. Dwie podobne = test nic nie mierzy. Art-direction per kąt:
- demo — FULL-BLEED AKCJA: produkt W AKCJI / mid-use wypełnia CAŁY kadr, dynamiczna diagonala, energia ruchu; headline na kontrastowym pasku; mały inset produktu solo dla wierności kształtu; paleta fotograficzna ze sceny — BEZ płaskiego bloku koloru. Najsilniejszy kadr „na zimno".
- problem — PLAKAT DR, EMOCJA↔PRODUKT: pokaż BÓL / stary (nieudany) sposób BEZ NASZEGO PRODUKTU w strefie problemu (irytująca sytuacja, bałagan, frustracja). Nasz produkt pojawia się WYŁĄCZNIE w strefie rozwiązania/CTA jako „naprawa". Duży, gruby headline nazywający ból BEZOSOBOWO (ZAKAZ „Masz problem z…", „Wstydzisz się…" — personal attributes Meta). Płaskie tło w kolorze marki.
${proofArt}${has916 ? `\n⚠️ FORMAT 9:16 (pliki *_916): trzymaj tekst i logo w SAFE-ZONES — góra 14%, dół 35%, boki 6% wolne od tekstu/CTA (inaczej UI Stories/Reels przytnie). Format 4:5 wypełnia kadr normalnie.` : ''}
ZASADY GRAFIK:
- Polski tekst poprawny (z diakrytykami), TYLKO krótki: headline (3–6 słów, JEDNA obietnica) + przycisk-pigułka „Kup teraz" (+ ewentualnie badge). Bez akapitów; tekst ≤~20% płótna.
- „Kup teraz" jako element UI (pigułka), wysoki kontrast do tła; risk-reversal COD: badge „Płatność przy odbiorze" pasuje do problem/proof.
- KOMPOZYCJA BLOKU TEKSTU (twarda): headline, badge i „Kup teraz" NIE MOGĄ na siebie nachodzić ani przycinać się nawzajem — zarezerwuj pionową przestrzeń na PEŁNY headline (obie linie!) ZANIM położysz pigułki; odstęp min. ~4% wysokości między headline a pigułkami. Jeśli brakuje miejsca: skróć headline do jednej linii albo odpuść badge — NIGDY nie nakładaj pigułki na litery. (Lekcja z 1. przebiegu: badge przykrył drugą linię headline.)
- Logo w rogu 8–12% wysokości, niecentralne; branding spójny z landingiem.
- Światło/nastrój wg art-direction danego kąta (NIE jedno oświetlenie na wszystkich); NIE białe studio na żadnej (wygląda jak Allegro); produkt 1:1 z referencji na każdej.
- Jeśli renderowany tekst byłby niepewny/zniekształcony: zostaw SAM headline + „Kup teraz", odpuść badge — nigdy połamanych/przekręconych liter.
ZAKAZY (COD / polityka Meta 2026): zero zmyślonej pilności/countdownów; zero „dostawa 24h"/„magazyn w Polsce"; zero zmyślonych liczb/gwiazdek/recenzji (liczby TYLKO z sekcji „PRAWDZIWE LICZBY" wyżej); zero obcych logo; zero obietnic medycznych/wellness i before/after ciała; zero personal attributes (nie oskarżaj odbiorcy); bez cen na grafice o ile nie podano wyżej.

=== OUTPUT (KONIECZNIE) ===
1. Plik "campaign.json": {"ads":[{"angle":"demo","format":"45","headline":"...","badge":"...","primary_text":"..."}, ... po jednym na kąt]}
2. ${nFiles} obrazów PNG jako ZAŁĄCZNIKI, nazwane DOKŁADNIE: ${plan.map((p) => p.filename).join(', ')}
3. 2–3 zdania podsumowania.
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

// Odczyt briefu mini-marki z kroków 'lp_styl_marka'/'lp_branding'/'branding'/'lp_plan' (data.fields).
// Czytamy tolerancyjnie: pola mogą nie istnieć / leżeć płasko w data zamiast data.fields.
// Merge z priorytetem kroków (fabryka trzyma mini-markę w lp_styl_marka — pole marka_nazwa).
// LOGO (D3/W3.4): najpierw artefakt wf2_artifacts kind='branding'/'brand' odnoszący się do 'logo-combo',
// potem pole logo_url/logo, na końcu brand_dir → logo-combo.png. + paleta/fonty/styl_master z fields.
const BRANDING_STEP_PRIORITY = ['lp_styl_marka', 'lp_branding', 'branding', 'lp_plan']
// deno-lint-ignore no-explicit-any
function readBranding(steps: any[], artifacts: any[] = []): { brandName: string; logoUrl: string; stylMasterUrl: string; paleta: string; fonty: string; ust: Record<string, string>; obietnica: string; hooki: string } {
  const prio = (k: string) => { const i = BRANDING_STEP_PRIORITY.indexOf(k); return i < 0 ? 99 : i }
  const sorted = [...(steps || [])].sort((a, b) => prio(String(a?.step_key || '')) - prio(String(b?.step_key || '')))
  // deno-lint-ignore no-explicit-any
  const f: Record<string, any> = {}
  for (const s of sorted) {
    const d = s?.data || {}
    const fields = (d.fields && typeof d.fields === 'object') ? d.fields : d
    if (!fields || typeof fields !== 'object') continue
    for (const [k, v] of Object.entries(fields)) {
      if (!(k in f) && v != null && String(v).trim()) f[k] = v   // wcześniejszy krok wygrywa per-pole
    }
  }
  const g = (...keys: string[]): string => {
    for (const k of keys) { const v = f[k]; if (v != null && String(v).trim()) return String(v).trim() }
    return ''
  }
  const brandName = g('marka_nazwa', 'nazwa', 'brand', 'marka', 'nazwa_marki', 'chosen_name').slice(0, 60)
  // 1) LOGO z artefaktu brandingu (label/meta wskazujące logo-combo/logo) — tylko URL http(s)
  let logoRaw = ''
  for (const a of (artifacts || [])) {
    const kind = String(a?.kind || '').toLowerCase()
    if (kind !== 'branding' && kind !== 'brand') continue
    const lbl = String(a?.label || '').toLowerCase()
    const metaStr = (() => { try { return JSON.stringify(a?.meta || {}).toLowerCase() } catch { return '' } })()
    const url = String(a?.url || '')
    if (/^https?:\/\//i.test(url) && (lbl.includes('logo-combo') || metaStr.includes('logo-combo') || lbl.includes('logo'))) { logoRaw = url; break }
  }
  // 2) pole logo_url/logo, 3) brand_dir → logo-combo.png
  if (!logoRaw) logoRaw = g('logo_url', 'logo')
  if (!logoRaw) {
    const dir = g('brand_dir')
    if (dir) {
      const base = Deno.env.get('SUPABASE_URL') || ''
      logoRaw = /^https?:\/\//i.test(dir)
        ? dir.replace(/\/+$/, '') + '/logo-combo.png'
        : `${base}/storage/v1/object/public/attachments/${dir.replace(/^\/+|\/+$/g, '')}/logo-combo.png`
    }
  }
  const logoUrl = /^https?:\/\//i.test(logoRaw) ? logoRaw : ''   // inline SVG nie nadaje się jako URL do pobrania
  const stylRaw = g('styl_master_url', 'styl_master', 'style_master_url', 'master_url')
  const stylMasterUrl = /^https?:\/\//i.test(stylRaw) ? stylRaw : ''
  const paleta = g('paleta', 'palette', 'kolory', 'paleta_kolorow', 'kolory_marki')
  const fonty = g('fonty', 'font', 'fonts', 'typografia', 'krój')
  const persona = g('persona', 'dla_kogo', 'avatar')
  const obietnica = g('obietnica', 'kat', 'kąt', 'wyroznik', 'wyróżnik', 'motyw')
  const hooki = g('hooki', 'hook', 'hasla', 'hasło', 'haslo')
  const haslo = (hooki.split(/[\n;•]/).map((x) => x.trim()).filter(Boolean)[0] || '').slice(0, 120)
  const ust: Record<string, string> = { dla_kogo: persona, kat: obietnica, ton_marki: g('ton', 'ton_marki'), haslo }
  return { brandName, logoUrl, stylMasterUrl, paleta, fonty, ust, obietnica, hooki }
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

// Koszt jednostkowy → wf2_costs (rollup per etap/produkt w zakładce Koszty panelu). Tylko kind='manus'.
// deno-lint-ignore no-explicit-any
async function logCost(supabase: any, projectId: string | null, productId: string | null, amountUsd: number, kind: string, note: string): Promise<void> {
  if (!projectId || !(amountUsd > 0)) return
  try {
    await supabase.from('wf2_costs').insert({
      project_id: projectId, product_id: productId, step_key: 'ads_grafiki', stage: 5,
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

// Rejestr kreacji (D5/W3.6b-c): UPSERT wf2_creatives (media_type='image') + refresh wf2_artifacts
// (kind='ad_creative', bez duplikatów po product_id+step_key+label). Blob ads_creatives = źródło panelu.
// deno-lint-ignore no-explicit-any
async function registerCreatives(supabase: any, projectId: string | null, productId: string, slugBase: string, ads: Array<{ angle: string; format: string; headline: string; badge: string; image_url: string }>): Promise<void> {
  if (!projectId) return   // wf2_artifacts.project_id NOT NULL — bez projektu nie rejestrujemy
  const nImg = ads.filter((a) => a.image_url).length
  const perCost = nImg > 0 ? Number((MANUS_TASK_USD / nImg).toFixed(4)) : null
  const base = slugBase || productId
  for (const a of ads) {
    if (!a.image_url) continue
    const creativeSlug = `${base}-ad-${a.angle}-${a.format}`
    try {
      await supabase.from('wf2_creatives').upsert({
        slug: creativeSlug, media_type: 'image', angle: a.angle, format: a.format,
        ai_labeled: true, status: 'ready', public_url: a.image_url,
        project_id: projectId, product_id: productId, cost_usd: perCost,
        meta: { engine: 'manus', headline: a.headline, badge: a.badge },
      }, { onConflict: 'slug' })
    } catch (e) { console.error('[wf2-ads] wf2_creatives upsert err', creativeSlug, e) }
    const label = `AD ${a.angle} ${a.format}`
    try {
      const { data: ex } = await supabase.from('wf2_artifacts').select('id')
        .eq('product_id', productId).eq('step_key', 'ads_grafiki').eq('label', label).limit(1)
      if (ex && ex.length) {
        await supabase.from('wf2_artifacts').update({ url: a.image_url, kind: 'ad_creative', meta: { angle: a.angle, format: a.format } }).eq('id', ex[0].id)
      } else {
        await supabase.from('wf2_artifacts').insert({ project_id: projectId, product_id: productId, step_key: 'ads_grafiki', kind: 'ad_creative', label, url: a.image_url, meta: { angle: a.angle, format: a.format } })
      }
    } catch (e) { console.error('[wf2-ads] wf2_artifacts refresh err', label, e) }
  }
}

// Sprawdź task Manus; gdy skończony — wyciągnij załączniki (PNG + campaign.json), rehostuj do Storage (D6),
// złóż ads_creatives=[{angle,format,headline,primary_text,badge,image_url,approved}], zapisz i zarejestruj
// w wf2_creatives/wf2_artifacts. Zwraca {done, ads?}.
// deno-lint-ignore no-explicit-any
async function manusPollAndPull(supabase: any, productId: string, taskId: string): Promise<{ done: boolean; ads?: unknown[] }> {
  const headers = { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }
  const detRes = await fetch(`${MANUS_BASE}/task.detail?task_id=${taskId}`, { headers })
  const det = await detRes.json().catch(() => null)
  if (!detRes.ok || !det) return { done: false }
  const task = det.task || det
  if (!['completed', 'done', 'stopped'].includes(task.status)) return { done: false }

  // Slug do ścieżki kanonicznej D6 (bud-assets/<slug>/ads/); fallback bez slug → ai-generated/wf2/<pid>/.
  // started_at — do karencji no_output (patrz niżej): mierzymy okno eventual-consistency od startu tasku.
  const { data: prow } = await supabase.from('wf2_products').select('slug, ads_manus_started_at').eq('id', productId).maybeSingle()
  const slug = String((prow as { slug?: string })?.slug || '').trim().replace(/^\/+|\/+$/g, '')
  const startedAt = (prow as { ads_manus_started_at?: string })?.ads_manus_started_at || null

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

  // D2b: task TERMINALNY z ZEROWĄ liczbą obrazów = trigger FAILED ('no_output') — retry nie pomoże
  // (task się skończył, nic nie wyprodukował). ALE Manus miewa eventual-consistency: task.detail wraca
  // 'completed'/'done' ZANIM task.listMessages pokaże załączniki → images=0 w oknie niespójności. Dlatego
  // flip TYLKO gdy (a) task realnie 'stopped' (przerwanie — nic już nie dojdzie), albo (b) minęła karencja
  // NO_OUTPUT_GRACE_MS od startu tasku (okno na propagację listMessages). W karencji zwracamy {done:false}
  // (poll/sweep ponowi), a nie fałszywy FAIL — bud-ads zdaje ten przypadek na self-heal timeoutem 32/40 min.
  // listOk chroni przed fałszywym alarmem, gdy to listMessages padło (transient) → wtedy {done:false} do ponowienia.
  // ODRÓŻNIENIE od „wszystkie uploady padły" (images>0, items puste) — tam retry MA sens (patrz check niżej).
  // Flip atomowy .eq('running') + Slack tylko dla zwycięzcy (poll i sweep mogą wejść równolegle), by nie dublować alertu.
  const listOk = !!(msgRes.ok && msgData && Array.isArray(msgData.messages))
  if (listOk && images.length === 0) {
    const startedMs = startedAt ? Date.parse(String(startedAt)) : 0
    const graceElapsed = startedMs > 0 && (Date.now() - startedMs) > NO_OUTPUT_GRACE_MS
    if (task.status === 'stopped' || graceElapsed) {
      const { data: flipped } = await supabase.from('wf2_products')
        .update({ ads_manus_status: 'failed', ads_manus_step: 'no_output' })
        .eq('id', productId).eq('ads_manus_status', 'running').select('id')
      if (flipped && flipped.length) {
        await postSlackSparing('bud_gen_error', { product_id: productId, stage: 'wf2 reklamy — Manus skończył BEZ grafik (0 obrazów; brak silnika zastępczego)', error: `task ${taskId} zakończony bez żadnej grafiki — sprawdź kredyty/kolejkę Manusa, potem RESET w panelu` })
      }
    }
    return { done: false }
  }

  const copyByAngle: Record<string, { headline: string; primary_text: string; badge: string }> = {}
  if (jsonFiles.length) {
    try {
      const t = await (await fetch(jsonFiles[0].url)).text()
      const parsed = tolerantParse(t)
      // deno-lint-ignore no-explicit-any
      for (const a of (parsed?.ads || [])) if (a && a.angle) copyByAngle[String(a.angle).toLowerCase()] = { headline: String(a.headline || ''), primary_text: String(a.primary_text || ''), badge: String(a.badge || '') }
    } catch { /* */ }
  }

  // Rehost obrazów; kąt+format z nazwy pliku (back-compat: ad_<n>_<angle>[.png] ORAZ ad_<n>_<angle>_<fmt>.png).
  const items: Array<{ angle: string; format: string; image_url: string }> = []
  // Ścieżka D6 jest DETERMINISTYCZNA (regeneracja nadpisuje TEN SAM obiekt, upsert:true) → public_url się
  // nie zmienia. Doklejamy wersję ?v=<stamp> do URL, żeby po „Regeneruj" panel (thumbUrl/render-CDN) i Meta
  // nie serwowały starej klatki z cache (Storage domyślnie cacheControl 3600 s). Ścieżka fizyczna bez zmian.
  const ver = Date.now()
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    try {
      const buf = await (await fetch(img.url)).arrayBuffer()
      const ctI = String(img.content_type || '')
      const ext = ctI.includes('png') ? 'png' : ctI.includes('webp') ? 'webp' : 'jpg'
      const m = String(img.filename || '').match(/ad_\d+_([a-z]+)(?:_(\d+))?\.[a-z0-9]+$/i)
      const ang = (m?.[1] || ANGLES[i] || `ad_${i + 1}`).toLowerCase()
      const fmt = (m?.[2] || '45')
      const path = slug
        ? `bud-assets/${slug}/ads/ad_${ang}_${fmt}.${ext}`
        : `ai-generated/wf2/${productId}/ad_${i + 1}_${ang}${fmt !== '45' ? '_' + fmt : ''}.${ext}`
      const { error } = await supabase.storage.from('attachments').upload(path, buf, { contentType: img.content_type || 'image/png', upsert: true })
      if (error) continue
      const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path)
      if (pub?.publicUrl) items.push({ angle: ang, format: fmt, image_url: `${pub.publicUrl}?v=${ver}` })
    } catch { /* */ }
  }

  // ads_creatives (panel + rejestr): jeden element per (kąt,format), z flagą approved:false do akceptu w panelu.
  const ads = items.map((it) => ({
    angle: it.angle, format: it.format,
    headline: copyByAngle[it.angle]?.headline || '',
    primary_text: copyByAngle[it.angle]?.primary_text || '',
    badge: copyByAngle[it.angle]?.badge || '',
    image_url: it.image_url, approved: false,
  }))
  if (!ads.some((x) => x.image_url)) return { done: false }   // skończony, ale brak grafik → poczekaj kolejny cykl

  // ATOMOWO: poll frontu i sweep crona potrafią wywołać pull RÓWNOLEGLE — update warunkowy na
  // status='running' wygrywa raz; przegrany NIE liczy kosztu ani nie rejestruje drugi raz.
  const { data: won } = await supabase.from('wf2_products')
    .update({ ads_creatives: ads, ads_manus_status: 'completed', ads_manus_completed_at: new Date().toISOString(), ads_manus_step: null })
    .eq('id', productId).eq('ads_manus_status', 'running').select('id, project_id, name, slug')
  if (!won || !won.length) return { done: true, ads }
  const projectId = (won[0] as { project_id?: string }).project_id || null
  const wonName = (won[0] as { name?: string }).name || ''
  const wonSlug = String((won[0] as { slug?: string }).slug || slug || '').trim()
  const nImg = ads.filter((x) => x.image_url).length
  await logActivity(supabase, projectId, 'ads_generated', `${nImg} grafik reklamowych (Manus) gotowe — koszt ~$${MANUS_TASK_USD.toFixed(2)} · task ${taskId}`)
  await logCost(supabase, projectId, productId, MANUS_TASK_USD, 'manus', `${nImg} grafik (task ${taskId})`)
  await registerCreatives(supabase, projectId, productId, wonSlug, ads)
  await postSlackSparing('wf2_ads_ready', { project_id: projectId || '', product: wonName, source: 'Manus' })
  return { done: true, ads }
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c })
  if (req.method !== 'POST') return json({ error: 'metoda_niedozwolona' }, 405, c)
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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

    let body: { product_id?: string; force?: boolean; sweep?: boolean; angles?: unknown; formats?: unknown }
    try { body = await req.json() } catch { return json({ error: 'nieprawidlowy_json' }, 400, c) }

    // ── SWEEP (cron / manus-webhook, x-admin-secret) — dociąga wyniki tasków Manus dla produktów,
    // gdzie panel był zamknięty; oznacza failed taski wiszące >40 min; odblokowuje zawieszone claim-y.
    // Mechanika NIETKNIĘTA (deadline wall-clock, self-heal claim_stuck) — pull rejestruje kreacje.
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
            await postSlackSparing('bud_gen_error', { product_id: p.id as string, stage: 'wf2 reklamy (Manus, timeout >40 min — sweep; brak silnika zastępczego)', error: `task ${p.ads_manus_task_id} nie dowiózł wyniku — sprawdź kredyty, potem RESET w panelu` })
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
      .select('id, project_id, name, slug, platform_page_url, cover_url, tt_product_id, notes, ads_creatives, ads_manus_task_id, ads_manus_status, ads_manus_step, ads_manus_started_at')
      .eq('id', productId).maybeSingle()
    if (!product) return json({ error: 'nieprawidlowy_produkt' }, 404, c)

    // CACHE: komplet już jest i nie wymuszono regeneracji → oddaj gotowe.
    if (!force && Array.isArray(product.ads_creatives) && product.ads_creatives.length &&
      (product.ads_creatives as Array<{ image_url?: string }>).some((a) => a?.image_url)) {
      return json({ ads: product.ads_creatives, cached: true }, 200, c)
    }

    // KILL-SWITCH (D2b „Manus albo nic"): generator = WYŁĄCZNIE Manus. Flaga off / brak klucza →
    // kontrolowany 503 BEZ generacji (żaden silnik zastępczy). Wznowienie: włącz flagę + MANUS_API_KEY.
    if (!MANUS_ENABLED) {
      return json({ error: 'generator_wylaczony', detail: 'Generator grafik reklamowych = WYŁĄCZNIE Manus. Ustaw WF2_ADS_MANUS_ENABLED=1 i MANUS_API_KEY.' }, 503, c)
    }

    const name = String(product.name || 'produkt')

    // ── task Manus już biegnie → sprawdź status i (gdy skończony) dociągnij. Panel poluje.
    if (!force && product.ads_manus_status === 'running' && product.ads_manus_task_id) {
      const res = await manusPollAndPull(supabase, productId, String(product.ads_manus_task_id))
      if (res.done && res.ads) return json({ ads: res.ads }, 200, c)
      const started = product.ads_manus_started_at ? Date.parse(String(product.ads_manus_started_at)) : 0
      if (started && (Date.now() - started) > 32 * 60 * 1000) {
        // >32 min bez wyniku → FAILED (D2b: zero fallbacku). Reset RĘCZNY w panelu po sprawdzeniu kredytów.
        await supabase.from('wf2_products').update({ ads_manus_status: 'failed', ads_manus_step: 'timeout' }).eq('id', productId).eq('ads_manus_status', 'running')
        await postSlackSparing('bud_gen_error', { product_id: productId, stage: 'wf2 reklamy — task Manus >32 min bez wyniku (generator = WYŁĄCZNIE Manus, brak silnika zastępczego)', error: `task ${product.ads_manus_task_id} nie dowiózł wyniku — sprawdź kredyty/kolejkę Manusa, potem RESET w panelu`, product: name })
        return json({ failed: true, manus: 'timeout', detail: 'Task Manus przekroczył 32 min bez wyniku. Sprawdź kredyty i zresetuj generację w panelu.' }, 200, c)
      }
      return json({ pending: true, manus: 'running' }, 202, c)
    }

    // ── BREAKER (D2b): poprzednia generacja padła → STOP. Zero silnika zastępczego — wznowienie
    // WYŁĄCZNIE ręcznym resetem w panelu (po doładowaniu kredytów). force omija breaker (jak dotychczas).
    if (!force && product.ads_manus_status === 'failed') {
      return json({ failed: true, manus: 'failed', step: product.ads_manus_step || null, detail: 'Poprzednia generacja Manus zakończona błędem. Zresetuj w panelu po doładowaniu kredytów (brak silnika zastępczego).' }, 200, c)
    }

    // ── Kontekst produktu (potrzebny tylko do nowej generacji) ──
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

    // Branding (mini-marka) — fabryka trzyma go w 'lp_styl_marka' (marka_nazwa + brand_dir + paleta/fonty);
    // legacy aliasy i lp_plan (motyw jako kąt) jako fallback (priorytet w readBranding).
    const { data: brandingSteps } = await supabase.from('wf2_steps')
      .select('step_key, data').eq('product_id', productId).in('step_key', BRANDING_STEP_PRIORITY)
    // Artefakty brandingu (logo-combo) — D3/W3.4: logo z rejestru artefaktów przed brand_dir-em.
    const { data: brandingArtifacts } = await supabase.from('wf2_artifacts')
      .select('kind, label, url, meta').eq('product_id', productId).in('kind', ['branding', 'brand'])
    const { brandName: brandRaw, logoUrl, stylMasterUrl, paleta, fonty, ust, obietnica, hooki } = readBranding(brandingSteps || [], brandingArtifacts || [])
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
    const name2 = String(product.name || tt?.pl_name || 'produkt')
    const productCtx = { nazwa: name2, kategoria: String(tt?.category || '') }
    const snap = tt?.ali_snapshot || null
    const snapTitle = (snap && String(snap.source || '') !== 'search') ? String(snap.title || '') : ''
    const refs = buildProductRefs(tt, String(product.cover_url || ''))

    // PRAWDZIWE LICZBY (D3): cena z lp_dane.fields.cena_pl; oceny z ali_snapshot TYLKO przy source='detail'.
    let cenaPl = ''
    try {
      const { data: dSteps } = await supabase.from('wf2_steps').select('data').eq('product_id', productId).in('step_key', ['lp_dane', 'dane']).limit(4)
      for (const s of (dSteps || [])) {
        const d = (s as { data?: Record<string, unknown> }).data || {}
        const ff = (d.fields && typeof d.fields === 'object') ? d.fields as Record<string, unknown> : d
        const cand = (ff?.cena_pl ?? ff?.cena)
        if (cand != null && String(cand).trim()) { cenaPl = String(cand).trim(); break }
      }
    } catch { /* cena opcjonalna */ }
    let reviewStats = ''
    if (snap && String(snap.source || '') === 'detail') {
      const rs = (snap.review_stats && typeof snap.review_stats === 'object') ? snap.review_stats : null
      const bits: string[] = []
      if (rs && rs.avg) bits.push(`ocena ${String(rs.avg).replace('.', ',')}/5${rs.numRatings ? ` z ${rs.numRatings} ocen` : ''}`)
      if (snap.sold_volume != null && String(snap.sold_volume).trim()) bits.push(`${snap.sold_volume} zamówień na aukcji`)
      reviewStats = bits.join(', ')
    }
    const priceInfo = [cenaPl ? `Cena PL: ${cenaPl}` : '', reviewStats ? `Realne liczby z aukcji (source=detail): ${reviewStats}` : ''].filter(Boolean).join(' · ')
    const landingUrl = String(product.platform_page_url || '').trim()
    const dna = { paleta, fonty, stylMasterUrl, landingUrl, priceInfo }
    // Rodowód /trendy: produkt ma realny wpis w radarze bud_tt_products (tt) → claim „Hit z TikToka" jest PRAWDZIWY.
    // Bez tt (tt_product_id NULL/nieistniejący) → NIE pozwalamy Manusowi zmyślać virala (bramka lustrzana do liczb).
    const fromTrendy = !!tt

    // Brief = raport (jeśli jest) + obietnica + hooki + notatki produktu → bogatszy materiał na copy.
    const briefParts: string[] = []
    if (obietnica) briefParts.push(`Obietnica mini-marki: ${obietnica}`)
    if (hooki) briefParts.push(`Hooki reklamowe klienta: ${hooki}`)
    if (product.notes) briefParts.push(`Notatki produktu: ${String(product.notes)}`)
    const reportCtx = [reportContextBlock(reportObj), briefParts.join('\n')].filter(Boolean).join('\n').slice(0, 2000)

    // Plan kreacji: angles×formats z body (default 3 kąty × 4:5 = ŁĄCZNIE 3 kreacje).
    const bodyAngles = Array.isArray(body.angles) ? (body.angles as unknown[]).map((x) => String(x || '').toLowerCase().trim()).filter(Boolean) : []
    const angles = bodyAngles.length ? bodyAngles : ANGLES
    const bodyFormats = Array.isArray(body.formats) ? (body.formats as unknown[]).map((x) => String(x || '').trim()).filter((fmt) => ALLOWED_FORMATS.includes(fmt)) : []
    const formats = bodyFormats.length ? bodyFormats : DEFAULT_FORMATS
    const plan = planCreatives(angles, formats)

    // Atomowa rezerwacja slotu (anty-podwójny task przy double-click). Marker = status 'running'
    // z task_id=NULL (sweep/poll wymagają task_id, więc go pomijają). force → nadpisz nawet biegnący.
    // NIE nulujemy tu ads_creatives: gdy task.create padnie (np. brak kredytów), stare kreacje +
    // akcepty muszą zostać widoczne w panelu (wzorzec bud-ads). Blob czyścimy dopiero na sukcesie create.
    const claimSlot = async (): Promise<boolean> => {
      let q = supabase.from('wf2_products')
        .update({ ads_manus_status: 'running', ads_manus_task_id: null, ads_manus_completed_at: null, ads_manus_started_at: new Date().toISOString(), ads_manus_step: 'claim' })
        .eq('id', productId)
      if (!force) q = q.or('ads_manus_status.is.null,ads_manus_status.eq.completed,ads_manus_status.eq.failed')
      const { data, error } = await q.select('id')
      if (error) { console.error('[wf2-ads] claim error', error); return true }   // fail-open: nie blokuj admina
      return !!(data && data.length)
    }

    // ===== MANUS (jedyny silnik — D2b) =====
    if (!(await claimSlot())) return json({ pending: true, manus: 'running' }, 202, c)
    let manusCreateErr = ''
    try {
      const rawRef = refs[0]?.url || ''
      const productImageUrl = rawRef ? await cacheRefToStorage(supabase, productId, rawRef) : ''
      const messagePayload: Record<string, unknown> = { content: buildAdsInstruction(productCtx, ust, brandName, snapTitle, refs, productImageUrl, logoUrl, reportCtx, dna, plan, fromTrendy) }
      // Załączniki: product_reference (wierność 1:1) + styl_master (D3 referencja stylu marki).
      const guessCt = (u: string): string => { const lo = u.toLowerCase(); return lo.includes('.png') ? 'image/png' : lo.includes('.webp') ? 'image/webp' : lo.includes('.avif') ? 'image/avif' : 'image/jpeg' }
      const attachments: Array<Record<string, unknown>> = []
      if (productImageUrl) { const ct = guessCt(productImageUrl); attachments.push({ type: 'image', content_type: ct, filename: 'product_reference.' + (ct.split('/')[1] || 'jpg'), url: productImageUrl }) }
      if (stylMasterUrl) { const ct = guessCt(stylMasterUrl); attachments.push({ type: 'image', content_type: ct, filename: 'styl_master.' + (ct.split('/')[1] || 'jpg'), url: stylMasterUrl }) }
      if (attachments.length) messagePayload.attachments = attachments
      const createRes = await fetch(`${MANUS_BASE}/task.create`, { method: 'POST', headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: messagePayload }) })
      const createData = await createRes.json().catch(() => null)
      if (!createRes.ok || !createData?.ok || !createData?.task_id) {
        manusCreateErr = `HTTP ${createRes.status}: ${JSON.stringify(createData).slice(0, 180)}`
        console.error('[wf2-ads] Manus task.create failed', manusCreateErr)
      } else {
        // Task realnie utworzony → DOPIERO teraz czyścimy stary blob (bud-ads: session_ads=null na sukcesie
        // create). Dzięki temu create-fail zostawia poprzednie kreacje, a nulling nie odsłania cache-hitu
        // przy kolejnych pollach (status='running' + ads_creatives=null → poll idzie ścieżką dociągnięcia).
        await supabase.from('wf2_products').update({ ads_manus_task_id: createData.task_id, ads_manus_status: 'running', ads_manus_started_at: new Date().toISOString(), ads_manus_step: null, ads_creatives: null }).eq('id', productId)
        return json({ pending: true, manus: 'created', task_id: createData.task_id }, 202, c)
      }
    } catch (e) {
      manusCreateErr = String(e).slice(0, 180)
      console.error('[wf2-ads] Manus create error', e)
    }

    // create padł → FAILED + alert. ZERO fallbacku (D2b). Reset ręczny w panelu po doładowaniu kredytów.
    const isCredits = /HTTP 429|resource_exhausted|credit limit/i.test(manusCreateErr)
    await supabase.from('wf2_products').update({ ads_manus_status: 'failed', ads_manus_step: isCredits ? 'credits' : 'create_failed' }).eq('id', productId).eq('ads_manus_status', 'running')
    await postSlackSparing('bud_gen_error', {
      product_id: productId,
      stage: isCredits ? 'wf2 reklamy — SKOŃCZYŁY SIĘ KREDYTY MANUSA (brak silnika zastępczego)' : 'wf2 reklamy — Manus create padł (brak silnika zastępczego)',
      error: isCredits ? 'Manus odrzucił zadanie: limit kredytów wyczerpany. DOŁADUJ KREDYTY i zresetuj generację w panelu.' : manusCreateErr,
      product: name,
    })
    return json({ failed: true, manus: 'create_failed', credits: isCredits, detail: isCredits ? 'Brak kredytów Manusa — doładuj i zresetuj generację w panelu.' : 'Manus create padł — zresetuj generację w panelu.' }, 200, c)
  } catch (e) {
    console.error('[wf2-ads] ERROR:', e)
    return json({ error: 'blad_serwera' }, 500, c)
  }
})
