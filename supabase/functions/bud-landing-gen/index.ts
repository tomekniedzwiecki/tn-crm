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
const MAX_OUT = 32000
function json(b: Record<string, unknown>, s: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...c, 'Content-Type': 'application/json' } })
}
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, '').replace(/\s+/g, ' ').trim()

// deno-lint-ignore no-explicit-any
function prompt(product: any, ust: any, snap: any, images: string[], lifestyle: string[] = []): string {
  const name = String(snap?.title || product?.nazwa || product?.name || 'produkt').slice(0, 160)
  const cat = String(product?.kategoria || product?.category || '').slice(0, 60)
  const dla = String(ust?.dla_kogo || '').slice(0, 240)
  const kat = String(ust?.kat || ust?.kąt || ust?.kat_odroznienia || '').slice(0, 240)
  const ton = String(ust?.ton_marki || ust?.ton || '').slice(0, 120)
  const brand = String(ust?.nazwa || ust?.brand || '').slice(0, 80)
  const korz = Array.isArray(ust?.korzysci) ? ust.korzysci.slice(0, 6).join('; ') : (Array.isArray(ust?.korzyści) ? ust.korzyści.slice(0, 6).join('; ') : '')
  const imgList = (images || []).slice(0, 6)
  return `Jesteś elitarnym front-end developerem i copywriterem direct-response, specjalizującym się w WYSOKOKONWERTUJĄCYCH stronach jednoproduktowych w stylu topowych marek DTC z USA. Zbuduj KOMPLETNĄ, produkcyjnie bliską stronę sprzedażową dla „${name}"${cat ? ` (kategoria: ${cat})` : ''} na rynek polski. CEL NADRZĘDNY: maksymalna skuteczność sprzedaży tego JEDNEGO produktu — każdy element ma popychać do zakupu.

USTALENIA (fundament copy — trzymaj się ściśle):${brand ? `\n- Marka: ${brand}` : ''}${dla ? `\n- Dla kogo: ${dla}` : ''}${kat ? `\n- Kąt/wyróżnik: ${kat}` : ''}${ton ? `\n- Ton: ${ton}` : ''}${korz ? `\n- Korzyści: ${korz}` : ''}

ZDJĘCIA DO UŻYCIA (jako <img src="..." loading="lazy">; NIE wymyślaj innych URL-i). Masz DWA rodzaje — używaj ich ZGODNIE Z PRZEZNACZENIEM, oszczędnie, żeby strona wyglądała jak prawdziwa marka, nie „wygenerowana AI":
${lifestyle.length ? `• LIFESTYLE (fotorealistyczne, produkt w realnej scenie) — wstaw w HERO oraz w sekcji „jak działa / w użyciu" (to one budują pożądanie):\n${lifestyle.map((u, i) => `   L${i + 1}. ${u}`).join('\n')}` : ''}
${imgList.length ? `• PRODUKT (realne zdjęcia z AliExpress — DOKŁADNY wygląd produktu) — wstaw tam, gdzie pokazujesz SAM produkt: sekcja produktu, „przed/po", tabela porównania, dowód:\n${imgList.map((u, i) => `   P${i + 1}. ${u}`).join('\n')}` : '(brak realnych zdjęć — użyj placeholderów [ Zdjęcie: … ])'}
ZASADA OBRAZÓW: nie wrzucaj zdjęcia do każdej sekcji — sekcje korzyści/porównania/FAQ/opinii działają lepiej na ikonach/tekście. Maks ~4-5 obrazów na całą stronę. Lifestyle do hero+użycia, realne foto do prezentacji produktu.

WIERNOŚĆ WIZUALNA DO MAKIETY (KRYTYCZNE): ${product?.__hasMockup ? 'Do wiadomości dołączony jest OBRAZ ZATWIERDZONEJ MAKIETY. ODWZORUJ go 1:1 w HTML/CSS: odczytaj i użyj DOKŁADNIE tej palety (kolory jako hex), tej typografii (charakter nagłówków i treści), tego stylu i kształtu przycisków, zaokrągleń, odstępów, nastroju i układu sekcji. Strona ma wyglądać jak ta makieta ożywiona w kodzie — NIE jak inny szablon.' : 'Dobierz spójną, premium paletę i typografię dopasowaną do tonu marki; jeden wyrazisty kolor akcentu na CTA.'}

STRUKTURA KONWERSYJNA (kolejność sekcji; każda ma zadanie sprzedażowe):
1. STICKY DOLNY PASEK CTA (position:fixed na dole, zawsze widoczny zwł. na mobile): cena + przycisk „Kup teraz". KRYTYCZNE — klient nigdy nie szuka przycisku.
2. HERO (test 3 sekund): nagłówek = KORZYŚĆ/transformacja, nie nazwa produktu (wzór „[efekt] — [wyróżnik]", ≤12 słów); 1 zdanie podtytułu; DUŻE realne zdjęcie produktu (najlepiej w użyciu); JEDEN kontrastowy przycisk „Kup teraz"; pod nim mikrocopy „płatność przy odbiorze · 14 dni na zwrot"; widoczna cena; pasek ocen ★★★★★ (np. „4,8/5 — X opinii").
3. PASEK SOCIAL PROOF (zaraz pod hero): ★ ocena + liczba opinii + liczba zadowolonych klientów + uczciwy tag „viralowy hit z TikToka"/„bestseller". (Liczby to przykład — klient podmieni.)
4. PROBLEM → ROZWIĄZANIE: nazwij ból odbiorcy (z ustaleń), pokaż produkt jako rozwiązanie.
5. KORZYŚCI (3-4 — KORZYŚĆ, nie cecha; inline SVG ikony): co klient ZYSKUJE.
6. JAK DZIAŁA / W UŻYCIU (2-3 kroki) + realne zdjęcie lifestyle.
7. PORÓWNANIE „nasza marka vs anonimowy odpowiednik z Allegro/Amazon" (2 kolumny/tabela: jakość, gwarancja, wsparcie, marka) — BEZ oczerniania konkretnych firm.
8. OPINIE KLIENTÓW (4-5: gwiazdki, imię, miejsce na zdjęcie) — szablon do podmiany na realne.
9. RISK-REVERSAL / GWARANCJA przy CTA (z pieczęcią/badge): płatność przy odbiorze (płacisz, gdy kurier przywiezie — zero ryzyka z góry) + 14 dni na zwrot + ikony bezpiecznej płatności. To NASZ najmocniejszy, uczciwy atut — wyeksponuj.
10. FAQ (5-6) — rozbij realne obiekcje (czy pasuje/jak działa, jak płacę, zwrot, wysyłka, dla kogo).
11. KOŃCOWE CTA: powtórz korzyść + cena + co w zestawie + „Kup teraz / Zamów za pobraniem" + mikrocopy zaufania.

ZASADY KONWERSJI:
- Korzyści ZAWSZE przed cechami; copy direct-response (hak → ból → rozwiązanie → dowód → CTA).
- WSZYSTKIE przyciski CTA to linki: <a href="#" data-cta="kup" class="...">Kup teraz</a> (href podmienimy na adres kasy). Sticky pasek też.
- ZERO nawigacji/menu/linków zewnętrznych/stopki z odnośnikami — nic, co wyprowadza ze strony; jedyne klikalne = CTA.
- Trust layering: 2-3 sygnały zaufania nad foldem, kilka w środku, 2-3 przy końcowym CTA. CTA mocno kontrastowy.

TWARDE ZAKAZY (marka Tomka):
- ZAKAZ zmyślonej pilności: żadnych liczników odliczających, „tylko dziś", „zostały 2 sztuki".
- ZAKAZ „dostawa w 24h" i „magazyn w Polsce" (sygnał dropshipu) — pisz neutralnie „wysyłka pod Twój adres".
- Opinie to szablon do podmiany na realne (nie udawaj, że to zweryfikowane recenzje). Bez „pewnego zysku"/gwarantowanych efektów.

TECHNICZNE:
- Jeden plik HTML, SELF-CONTAINED: cały CSS w <style>, zero zewnętrznych bibliotek/fontów/JS (system fonts; sticky CTA czystym CSS position:fixed). Mobile-first, lekka i szybka. Inline SVG do ikon.

Zwróć WYŁĄCZNIE kod HTML (od <!DOCTYPE html> do </html>), bez komentarzy przed/po, bez bloków \`\`\`.`
}

// Generuje 1-2 fotorealistyczne ujęcia LIFESTYLE produktu (gpt-image-2) z WIELOMA
// zdjęciami referencyjnymi z AliExpress (wierność produktu). Tylko kontekst/użycie —
// detal produktu zostaje na realnych zdjęciach Ali. Null gdy się nie uda (HTML i tak ma realne foto).
// deno-lint-ignore no-explicit-any
async function genLifestyle(SUPABASE_URL: string, CRON: string, refUrls: string[], product: any, ust: any): Promise<string[]> {
  const refs = (refUrls || []).filter(Boolean).slice(0, 4).map((u) => ({ url: u, type: 'product' as const }))
  if (!refs.length || !CRON) return []
  const name = String(product?.name || product?.nazwa || '').slice(0, 100)
  const dla = String(ust?.dla_kogo || 'codzienny użytkownik').slice(0, 140)
  const kat = String(ust?.kat || ust?.kąt || '').slice(0, 160)
  const base = `Fotorealistyczne zdjęcie produktowe LIFESTYLE. Pokaż DOKŁADNIE ten produkt z obrazów referencyjnych (ten sam kształt, kolor, zestaw) — nie zmieniaj go, nie wymyślaj wariantu. Produkt: ${name}. Naturalne światło, realna codzienna scena, estetyka jak prawdziwa sesja zdjęciowa marki e-commerce (NIE render 3D, NIE grafika AI, bez tekstu/logo/znaków wodnych/ramek).`
  const scenes = [
    `${base} Ujęcie HERO: produkt w użyciu przez odbiorcę (${dla}) w atrakcyjnym, aspiracyjnym kontekście — tak, by od razu było widać korzyść. Kadr czysty, miejsce na nałożenie nagłówka.`,
    `${base} Ujęcie „w użyciu / jak działa": produkt w działaniu, z bliska w realnym kontekście pokazującym jego rolę${kat ? ` (${kat})` : ''}. Detal sceny, autentycznie.`,
  ]
  const one = async (scenePrompt: string): Promise<string | null> => {
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON },
        body: JSON.stringify({ prompt: scenePrompt, provider: 'gpt-image-2', quality: 'medium', aspect_ratio: '1:1', type: 'lifestyle', count: 1, reference_images: refs }),
      })
      if (!r.ok) { console.error('[bud-landing-gen] lifestyle HTTP', r.status); return null }
      const d = await r.json().catch(() => null)
      const u = d?.images?.[0]?.url
      return (u && typeof u === 'string' && !u.startsWith('data:')) ? u : null
    } catch (e) { console.error('[bud-landing-gen] lifestyle err', e); return null }
  }
  const res = await Promise.all(scenes.map(one))
  return res.filter((u): u is string => !!u)
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
    const CRON = Deno.env.get('SPAR_CRON_SECRET') || ''
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
        // 1-2 fotorealistyczne ujęcia lifestyle z wielu zdjęć Ali (wierność) — do hero+użycia.
        const lifestyle = await genLifestyle(SUPABASE_URL, CRON, images, product, ust)
        const content: any[] = [{ type: 'input_text', text: prompt(product, ust, snap, images, lifestyle) }]
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
