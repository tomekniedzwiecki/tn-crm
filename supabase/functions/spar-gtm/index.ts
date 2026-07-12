// spar-gtm — go-to-market: playbook pierwszych 50 klientów + pakiet startowy
// (3 reklamy z copy + posty + maile powitalne). Model gpt-5.5.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-gtm --no-verify-jwt
//
// API: stały SYSTEM_PROMPT (zasady + schemat) w roli `system` (cache OpenAI),
// dynamiczny projekt w `user`. Auto-retry ×1 na pustą/niepoprawną/za-słabą
// odpowiedź (jakość: dokładnie 3 reklamy + nagłówki ≤10 słów). Limit 4 gen/sesja.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied, isTrustedInternalCall } from "../_shared/spar-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const ALLOWED_ORIGINS = ['https://tomekniedzwiecki.pl','https://www.tomekniedzwiecki.pl','https://crm.tomekniedzwiecki.pl','https://tn-crm.vercel.app','http://localhost:5500','http://127.0.0.1:5500']
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_GENERATIONS = 4
const OPENAI_MODEL = Deno.env.get('SPAR_GTM_MODEL') || 'gpt-5.6-sol'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.6-sol': { i: 5, c: 0.5, o: 30 }, 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }
// Banery reklam — gpt-image-2 (jak spar-image). Koszt per quality do spar_usage.
const STORAGE_BUCKET = 'attachments'
const IMAGE_MODEL = Deno.env.get('SPAR_IMAGE_MODEL') || 'gpt-image-2'
const IMAGE_MODEL_FALLBACK = 'gpt-image-1'
const IMAGE_QUALITY = Deno.env.get('SPAR_GTM_BANNER_QUALITY') || 'medium'
const IMAGE_COST_USD: Record<string, number> = { low: 0.011, medium: 0.041, high: 0.167 }
function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }) }

// Rozmiar banera wg formatu reklamy
function sizeForFormat(format: string): string {
  const f = (format || '').toLowerCase()
  if (f.includes('9:16') || f.includes('reel') || f.includes('stories') || f.includes('pion')) return '1024x1536'
  return '1024x1024'
}
// Prompt kreacji reklamowej — kreacja BUDOWANA WOKÓŁ realnego ekranu narzędzia
// (ekran idzie jako obraz wejściowy do /images/edits; tu tylko instrukcja kompozycji)
function buildBannerPrompt(reklama: Record<string, unknown>, brief: Record<string, unknown>, nazwa: string): string {
  const s = (v: unknown, max = 400) => (typeof v === 'string' ? v.slice(0, max) : '')
  const design = (brief.design && typeof brief.design === 'object' && !Array.isArray(brief.design)) ? brief.design as Record<string, unknown> : null
  const d = (k: string) => (design && typeof design[k] === 'string' ? (design[k] as string).slice(0, 40) : '')
  const paleta = (d('tlo') && d('akcent')) ? `Paleta marki: tło ${d('tlo')}, akcent ${d('akcent')}${d('akcent2') ? `, drugi akcent ${d('akcent2')}` : ''}. ` : ''
  return [
    `Stwórz PROFESJONALNĄ KREACJĘ REKLAMOWĄ (baner social media) dla polskiego narzędzia SaaS „${nazwa}". Format kanału: ${s(reklama.format, 30) || 'feed 1:1'}.`,
    `Dołączony obraz to PRAWDZIWY EKRAN tej aplikacji. Pokaż go WIERNIE i czytelnie — umieść NA PIERWSZYM PLANIE w czystym, nowoczesnym mockupie urządzenia (telefon lub okno przeglądarki). NIE przeprojektowuj, nie zmieniaj treści ekranu, nie dorysowuj fałszywego interfejsu.`,
    reklama.koncept ? `Kąt reklamy: „${s(reklama.koncept, 60)}".` : '',
    reklama.naglowek ? `Nagłówek na grafice (krótki, duży, czytelny, PO POLSKU, bezbłędnie ortograficznie): „${s(reklama.naglowek, 80)}".` : '',
    paleta + `Styl: czysty, premium — jak reklama dobrego SaaS; tło spójne z paletą marki, dużo oddechu pod nagłówek. Bez stockowych ludzi, bez clipartów, bez znaków wodnych, bez zmyślonego/losowego tekstu. Mocny kontrast, czytelność na małym ekranie telefonu.`,
  ].filter(Boolean).join(' ')
}
// Generacja jednego banera przez /images/edits — REALNY EKRAN jako obraz wejściowy
// (gpt-image-2.0; fallback gpt-image-1 gdy model nie wspiera edits). zwraca bytes + model
async function genBanner(apiKey: string, prompt: string, size: string, screenBytes: Uint8Array): Promise<{ bytes: Uint8Array; usedModel: string }> {
  const call = (model: string) => {
    const fd = new FormData()
    fd.append('model', model)
    fd.append('prompt', prompt)
    fd.append('size', size)
    fd.append('quality', IMAGE_QUALITY)
    fd.append('n', '1')
    fd.append('image', new Blob([screenBytes], { type: 'image/png' }), 'ekran.png')
    // BEZ Content-Type — FormData ustawia multipart boundary samo
    return fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}` }, body: fd,
    })
  }
  let usedModel = IMAGE_MODEL
  let res = await call(IMAGE_MODEL)
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error(`[spar-gtm] ${IMAGE_MODEL} edit error:`, res.status, errText.slice(0, 300))
    // 400/404 → spróbuj fallbackiem (np. gdy gpt-image-2.0 nie wspiera /images/edits)
    if (res.status === 400 || res.status === 404) { res = await call(IMAGE_MODEL_FALLBACK); usedModel = IMAGE_MODEL_FALLBACK; if (!res.ok) { console.error('[spar-gtm] fallback edit error:', res.status, (await res.text().catch(() => '')).slice(0, 300)); throw new Error('img_error') } }
    else throw new Error('img_error')
  }
  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64 || typeof b64 !== 'string') throw new Error('img_no_b64')
  const bin = atob(b64); const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return { bytes, usedModel }
}
// URL ekranu z preview_images (string albo {url})
function screenUrl(v: unknown): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && typeof (v as Record<string, unknown>).url === 'string') return (v as Record<string, unknown>).url as string
  return ''
}
async function fetchScreenBytes(url: string): Promise<Uint8Array | null> {
  try { const r = await fetch(url); if (!r.ok) return null; const ab = await r.arrayBuffer(); return new Uint8Array(ab) } catch { return null }
}
// Tło: generuje do 4 banerów Z REALNYCH EKRANÓW, zapisuje banner_url w gtm.reklamy.
async function generateBanners(supabase: ReturnType<typeof createClient>, apiKey: string, sessionId: string): Promise<void> {
  try {
    const { data: session } = await supabase.from('spar_sessions').select('preview_brief, preview_images, gtm').eq('id', sessionId).maybeSingle()
    if (!session || !session.gtm) { console.error('[spar-gtm] banners: brak gtm'); return }
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    const nazwa = (typeof brief.nazwa === 'string' && brief.nazwa.trim()) ? brief.nazwa.trim() : 'narzędzie'
    const gtm = session.gtm as Record<string, unknown>
    const pakiet = (gtm.pakiet || {}) as Record<string, unknown>
    const reklamy = Array.isArray(pakiet.reklamy) ? pakiet.reklamy as Record<string, unknown>[] : []
    // realne ekrany, w kolejności „najlepsze do reklamy" (główna > panel > dodatkowa > landing > podsumowanie)
    const imgs = (session.preview_images || {}) as Record<string, unknown>
    const screens = ['glowna', 'panel', 'dodatkowa', 'landing', 'podsumowanie'].map((k) => screenUrl(imgs[k])).filter(Boolean)
    if (!screens.length) { console.error('[spar-gtm] banners: brak ekranów — pomijam (edits wymaga obrazu)'); await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm_banners' }); return }
    const bytesCache: Record<string, Uint8Array | null> = {}
    let changed = false
    for (let i = 0; i < reklamy.length && i < 4; i++) {
      const r = reklamy[i]
      if (!r || typeof r !== 'object' || (typeof r.banner_url === 'string' && r.banner_url)) continue
      const scUrl = screens[i % screens.length]
      if (!(scUrl in bytesCache)) bytesCache[scUrl] = await fetchScreenBytes(scUrl)
      const screenBytes = bytesCache[scUrl]
      if (!screenBytes) { console.error('[spar-gtm] banner', i + 1, 'nie pobrano ekranu — pomijam'); continue }
      try {
        const size = sizeForFormat(typeof r.format === 'string' ? r.format : '')
        const { bytes, usedModel } = await genBanner(apiKey, buildBannerPrompt(r, brief, nazwa), size, screenBytes)
        const path = `spar/${sessionId}/reklama-${i + 1}-${Date.now()}.png`
        const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, bytes, { contentType: 'image/png', upsert: true })
        if (upErr) { console.error('[spar-gtm] banner upload error:', upErr); continue }
        const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
        if (pub?.publicUrl) {
          r.banner_url = pub.publicUrl; r.banner_size = size; changed = true
          await supabase.from('spar_usage').insert({ session_id: sessionId, kind: 'image', model: usedModel, images: 1, cost_usd: IMAGE_COST_USD[IMAGE_QUALITY] ?? IMAGE_COST_USD.medium, meta: { view: 'ad_banner', idx: i + 1, quality: IMAGE_QUALITY } })
          // zapisujemy po KAŻDYM banerze — frontend widzi je pojawiające się stopniowo
          await supabase.from('spar_sessions').update({ gtm, updated_at: new Date().toISOString() }).eq('id', sessionId)
        }
      } catch (e) { console.error('[spar-gtm] banner', i + 1, 'error:', e instanceof Error ? e.message : String(e)) }
    }
    await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm_banners' })
    console.log(`[spar-gtm] banners done ${sessionId} changed=${changed}`)
  } catch (err) {
    console.error('[spar-gtm] banners ERROR:', err instanceof Error ? err.message : String(err))
    await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm_banners' })
  }
}

// Model biznesowy — JEDNO źródło (settings.aplikacja_model_biznesowy), ładowane raz w handlerze.
let MODEL_BLOCK = ''

let SYSTEM_PROMPT = ''

// Prompt SAMYCH KANAŁÓW (zakładka „Gdzie szukać klientów") — niezależna regeneracja
let CHANNELS_SYSTEM = ''

// Prompt SAMYCH REKLAM (zakładka „Reklamy") — niezależna regeneracja
let ADS_SYSTEM = ''

// deno-lint-ignore no-explicit-any
function saneChannels(g: any): boolean { const p = g?.playbook; return !!p && typeof p === 'object' && Array.isArray(p.kanaly) && p.kanaly.length >= 2 }
// deno-lint-ignore no-explicit-any
function saneAds(g: any): boolean { const r = g?.reklamy; return Array.isArray(r) && r.length >= 1 && r.every((a: any) => !!a && typeof a.naglowek === 'string' && typeof a.tekst === 'string') }

function buildUser(brief: Record<string, unknown>, karta: Record<string, unknown>, plan: Record<string, unknown> | null, raport: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown) => Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 6).join(', ') : ''
  const fakty: string[] = []
  const nazwa = s(brief.nazwa, 80) || 'Narzędzie'
  fakty.push(`Narzędzie: „${nazwa}" — ${s(brief.opis)}`)
  if (karta.problem) fakty.push(`Problem: ${s(karta.problem)}`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`Grupa docelowa: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.kto_placi) fakty.push(`Kto płaci: ${s(karta.kto_placi)}`)
  if (list(karta.ekrany)) fakty.push(`Główne funkcje: ${list(karta.ekrany)}`)
  if (plan && typeof plan.cena === 'number') fakty.push(`Cena: ${plan.cena} ${s(plan.cena_jednostka, 20) || 'zł/mies.'}`)
  if (raport) {
    if (Array.isArray(raport.konkurenci) && raport.konkurenci.length) { const k = (raport.konkurenci as Record<string, unknown>[]).slice(0, 4).map((c) => s(c.nazwa, 40)).filter(Boolean).join(', '); if (k) fakty.push(`Konkurenci z researchu: ${k}`) }
    if (raport.luka_rynkowa) fakty.push(`Okno rynkowe: ${s(raport.luka_rynkowa, 240)}`)
  }
  return `PROJEKT:\n${fakty.join('\n')}\n\nZwróć JSON dokładnie wg schematu z instrukcji systemowej.`
}

// deno-lint-ignore no-explicit-any
function saneGtm(g: any): boolean {
  if (!g || typeof g !== 'object') return false
  const p = g.playbook, k = g.pakiet
  if (!p || typeof p !== 'object' || !Array.isArray(p.kanaly) || p.kanaly.length < 2) return false
  if (!Array.isArray(p.obiekcje) || p.obiekcje.length < 1) return false
  if (!k || typeof k !== 'object' || !Array.isArray(k.reklamy) || k.reklamy.length < 1) return false
  if (!k.reklamy.every((r: unknown) => !!r && typeof r === 'object' && typeof (r as Record<string, unknown>).naglowek === 'string' && typeof (r as Record<string, unknown>).tekst === 'string')) return false
  if (!Array.isArray(k.maile_powitalne) || k.maile_powitalne.length < 1) return false
  return true
}
// Jakość (do decyzji o retry): dokładnie 4 reklamy + każdy nagłówek ≤10 słów.
// deno-lint-ignore no-explicit-any
function qualityGtm(g: any): boolean {
  const r = g?.pakiet?.reklamy
  if (!Array.isArray(r) || r.length !== 4) return false
  return r.every((a: any) => typeof a?.naglowek === 'string' && a.naglowek.trim().split(/\s+/).length <= 10)
}

async function callOnce(apiKey: string, system: string, user: string, maxTokens: number): Promise<{ obj: Record<string, unknown> | null; usage: { i: number; c: number; o: number } | null }> {
  const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: (MODEL_BLOCK ? MODEL_BLOCK + '\n\n' : '') + system }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: maxTokens, reasoning_effort: 'low' }),
  }, 'spar-gtm')
  if (!res.ok) { console.error('[spar-gtm] openai error:', res.status, (await res.text().catch(() => '')).slice(0, 400)); return { obj: null, usage: null } }
  const data = await res.json()
  const u = data?.usage || {}
  const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
  const content = data?.choices?.[0]?.message?.content
  try { return { obj: JSON.parse(content), usage } }
  catch { console.error('[spar-gtm] zły JSON, finish:', data?.choices?.[0]?.finish_reason, String(content).slice(0, 200)); return { obj: null, usage } }
}

async function logGtmUsage(supabase: ReturnType<typeof createClient>, sessionId: string, usage: { i: number; c: number; o: number } | null): Promise<void> {
  if (!usage) return
  try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.5']; await supabase.from('spar_usage').insert({ session_id: sessionId, kind: 'gtm', model: OPENAI_MODEL, input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o, cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000 }) } catch (uErr) { console.error('[spar-gtm] usage insert error:', uErr) }
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY'); const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)
    let body: { sessionId?: string; force?: boolean; action?: string }
    try { body = await req.json() } catch { return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors) }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, cors)
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    // Bramka właściciela (PRZED jakąkolwiek generacją/odczytem, też 'banners'):
    // sesja przypięta do konta wymaga JWT tego konta — link ?id= przestaje
    // działać jak hasło (lustrzane odbicie spar-chat).
    // Wyjątek: zaufany wywołujący wewnętrzny (spar-drip kluczem serwisowym) omija
    // bramkę — inaczej cron nie wygeneruje artefaktu sesji przypiętej do konta.
    if (!isTrustedInternalCall(req)) {
      const authUser = await verifyAuthUser(req, supabase)
      const { data: own } = await supabase.from('spar_sessions').select('auth_user_id').eq('id', sessionId).maybeSingle()
      if (own && ownerDenied(own.auth_user_id as string | null, authUser)) {
        return jsonResponse({ error: 'wymagane_logowanie' }, 403, cors)
      }
    }
    if (!MODEL_BLOCK) { try { const { data: mb } = await supabase.from('settings').select('value').eq('key', 'aplikacja_model_biznesowy').single(); MODEL_BLOCK = (mb as { value?: string } | null)?.value || '' } catch (_e) { /* fallback: pusty blok */ } }
    if (!SYSTEM_PROMPT) { try { const { data: __pd } = await supabase.from('settings').select('key, value').in('key', ['aplikacja_prompt_gtm_system', 'aplikacja_prompt_gtm_channels', 'aplikacja_prompt_gtm_ads']); const __pv = (k: string) => ((__pd || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''; SYSTEM_PROMPT = __pv('aplikacja_prompt_gtm_system'); CHANNELS_SYSTEM = __pv('aplikacja_prompt_gtm_channels'); ADS_SYSTEM = __pv('aplikacja_prompt_gtm_ads') } catch (_e) { /* fallback: puste prompty */ } }

    // ── action 'banners': wygeneruj 3 kreacje reklam w tle (gpt-image-2) ──
    if (body.action === 'banners') {
      const { data: lock } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'gtm_banners', p_ttl_sec: 300 })
      if (!lock) return jsonResponse({ status: 'pending' }, 202, cors)
      const task = generateBanners(supabase, OPENAI_API_KEY, sessionId)
      // deno-lint-ignore no-explicit-any
      const rt = (globalThis as any).EdgeRuntime
      if (rt?.waitUntil) rt.waitUntil(task); else task.catch(() => {})
      return jsonResponse({ status: 'started' }, 202, cors)
    }

    const { data: session, error: sErr } = await supabase.from('spar_sessions').select('id, preview_brief, problem_summary, business_plan, market_report, gtm').eq('id', sessionId).maybeSingle()
    if (sErr) { console.error('[spar-gtm] session fetch error:', sErr); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, cors)
    const karta = session.problem_summary as Record<string, unknown> | null
    const brief = (session.preview_brief || {}) as Record<string, unknown>
    const plan = session.business_plan as Record<string, unknown> | null
    const raport = session.market_report as Record<string, unknown> | null
    if (!karta) return jsonResponse({ error: 'brak_karty' }, 400, cors)
    const existing = session.gtm as Record<string, unknown> | null
    const meta = (existing && existing._meta) as Record<string, unknown> | null

    // ── action 'regen_channels': SAME kanały + płatne (zakładka „Gdzie szukać klientów"), ZACHOWAJ reklamy ──
    if (body.action === 'regen_channels') {
      const chCount = (meta && typeof meta.gen_ch === 'number') ? meta.gen_ch : 0
      if (chCount >= MAX_GENERATIONS && existing) { const { _meta: _d, ...gtm } = existing; return jsonResponse({ gtm, cached: true }, 200, cors) }
      const { data: lockC } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'gtm_ch', p_ttl_sec: 200 })
      if (!lockC) return jsonResponse({ pending: true }, 202, cors)
      const userC = buildUser(brief, karta, plan, raport)
      let bestC: Record<string, unknown> | null = null
      for (let attempt = 0; attempt < 2; attempt++) {
        const { obj, usage } = await callOnce(OPENAI_API_KEY, CHANNELS_SYSTEM, userC, 3500 + attempt * 1000)
        await logGtmUsage(supabase, sessionId, usage)
        if (obj && saneChannels(obj)) { bestC = obj; break }
      }
      if (!bestC) { await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm_ch' }); return jsonResponse({ error: 'blad_generowania' }, 502, cors) }
      const curC = (existing || {}) as Record<string, unknown>
      const curPb = (curC.playbook && typeof curC.playbook === 'object') ? curC.playbook as Record<string, unknown> : {}
      const npb = (bestC.playbook && typeof bestC.playbook === 'object') ? bestC.playbook as Record<string, unknown> : bestC
      const mergedPb = { ...curPb, kanaly: npb.kanaly, platne: npb.platne, skrypt_dm: npb.skrypt_dm }
      const mergedC = { ...curC, playbook: mergedPb, _meta: { ...(meta || {}), gen_ch: chCount + 1, at_ch: new Date().toISOString() } }
      await supabase.from('spar_sessions').update({ gtm: mergedC, updated_at: new Date().toISOString() }).eq('id', sessionId)
      await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm_ch' })
      const { _meta: _d2, ...gtmC } = mergedC
      return jsonResponse({ gtm: gtmC, cached: false }, 200, cors)
    }

    // ── action 'regen_ads': SAME reklamy (zakładka „Reklamy") + nowe banery, ZACHOWAJ kanały ──
    if (body.action === 'regen_ads') {
      const adCount = (meta && typeof meta.gen_ads === 'number') ? meta.gen_ads : 0
      if (adCount >= MAX_GENERATIONS && existing) { const { _meta: _d, ...gtm } = existing; return jsonResponse({ gtm, cached: true }, 200, cors) }
      const { data: lockA } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'gtm_ads', p_ttl_sec: 200 })
      if (!lockA) return jsonResponse({ pending: true }, 202, cors)
      const userA = buildUser(brief, karta, plan, raport)
      let bestA: Record<string, unknown> | null = null
      for (let attempt = 0; attempt < 2; attempt++) {
        const { obj, usage } = await callOnce(OPENAI_API_KEY, ADS_SYSTEM, userA, 3000 + attempt * 1000)
        await logGtmUsage(supabase, sessionId, usage)
        if (obj && saneAds(obj)) { bestA = obj; if ((obj.reklamy as unknown[]).length === 4) break }
      }
      if (!bestA) { await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm_ads' }); return jsonResponse({ error: 'blad_generowania' }, 502, cors) }
      const curA = (existing || {}) as Record<string, unknown>
      const curPk = (curA.pakiet && typeof curA.pakiet === 'object') ? curA.pakiet as Record<string, unknown> : {}
      const mergedPk = { ...curPk, reklamy: bestA.reklamy }
      const mergedA = { ...curA, pakiet: mergedPk, _meta: { ...(meta || {}), gen_ads: adCount + 1, at_ads: new Date().toISOString() } }
      await supabase.from('spar_sessions').update({ gtm: mergedA, updated_at: new Date().toISOString() }).eq('id', sessionId)
      await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm_ads' })
      const taskA = generateBanners(supabase, OPENAI_API_KEY, sessionId)
      // deno-lint-ignore no-explicit-any
      const rtA = (globalThis as any).EdgeRuntime
      if (rtA?.waitUntil) rtA.waitUntil(taskA); else taskA.catch(() => {})
      const { _meta: _d3, ...gtmA } = mergedA
      return jsonResponse({ gtm: gtmA, cached: false, bannersStarted: true }, 200, cors)
    }

    const genCount = (meta && typeof meta.gen === 'number') ? meta.gen : (existing ? 1 : 0)
    if (existing && !body.force) { const { _meta: _d, ...gtm } = existing; return jsonResponse({ gtm, cached: true }, 200, cors) }
    if (genCount >= MAX_GENERATIONS) { if (existing) { const { _meta: _d, ...gtm } = existing; return jsonResponse({ gtm, cached: true }, 200, cors) } return jsonResponse({ error: 'limit_generacji' }, 429, cors) }
    const { data: lock } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'gtm', p_ttl_sec: 240 })
    if (!lock) return jsonResponse({ pending: true }, 202, cors)

    const user = buildUser(brief, karta, plan, raport)
    const logUsage = async (usage: { i: number; c: number; o: number } | null) => {
      if (!usage) return
      try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.5']; await supabase.from('spar_usage').insert({ session_id: sessionId, kind: 'gtm', model: OPENAI_MODEL, input_tokens: usage.i, cached_tokens: usage.c, output_tokens: usage.o, cost_usd: (Math.max(0, usage.i - usage.c) * p.i + usage.c * p.c + usage.o * p.o) / 1_000_000 }) } catch (uErr) { console.error('[spar-gtm] usage insert error:', uErr) }
    }
    // Auto-retry ×1: ponawiamy gdy odpowiedź niepoprawna LUB nie spełnia jakości
    // (≠3 reklamy / za długi nagłówek). Trzymamy ostatni POPRAWNY jako fallback.
    let best: Record<string, unknown> | null = null
    for (let attempt = 0; attempt < 2; attempt++) {
      const { obj, usage } = await callOnce(OPENAI_API_KEY, SYSTEM_PROMPT, user, 9000 + attempt * 1500)
      await logUsage(usage)
      if (obj && saneGtm(obj)) {
        best = obj
        if (qualityGtm(obj)) break
        if (attempt === 0) console.warn('[spar-gtm] próba 1 poniżej jakości (reklamy/nagłówki) — ponawiam')
      } else if (attempt === 0) {
        console.warn('[spar-gtm] próba 1 niepoprawna — ponawiam')
      }
    }
    if (!best) {
      console.error('[spar-gtm] obie próby nieudane')
      await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm' })
      return jsonResponse({ error: 'blad_generowania' }, 502, cors)
    }
    const toSave = { ...best, _meta: { gen: genCount + 1, at: new Date().toISOString(), model: OPENAI_MODEL } }
    const { error: uErr } = await supabase.from('spar_sessions').update({ gtm: toSave, updated_at: new Date().toISOString() }).eq('id', sessionId)
    if (uErr) console.error('[spar-gtm] save error:', uErr)
    await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'gtm' })
    return jsonResponse({ gtm: best, cached: false }, 200, cors)
  } catch (e) { console.error('[spar-gtm] ERROR:', e); return jsonResponse({ error: 'blad_serwera' }, 500, cors) }
})
