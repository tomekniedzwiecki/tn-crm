// spar-image — podgląd graficzny narzędzia dla lejka "Stworzę" (tomekniedzwiecki.pl/stworze)
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy spar-image --no-verify-jwt
//
// Flow: spar-chat zapisuje brief z markera <projekt> w spar_sessions.preview_brief
// i emituje event spar_projekt -> frontend woła ten endpoint -> generujemy obraz
// (OpenAI Images API), wrzucamy do storage (bucket attachments, public) i zwracamy URL.
//
// Sekrety:
//   OPENAI_API_KEY     — klucz OpenAI (już ustawiony)
//   SPAR_IMAGE_MODEL   — opcjonalny override modelu (default gpt-image-2;
//                        przy błędzie "model not found" automatyczny fallback gpt-image-1)

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const IMAGE_MODEL = Deno.env.get('SPAR_IMAGE_MODEL') || 'gpt-image-2'
const IMAGE_MODEL_FALLBACK = 'gpt-image-1'
const MAX_IMAGES_PER_SESSION = 5     // pierwszy podgląd + 4 darmowe poprawki
const MAX_IMAGES_PER_IP_PER_DAY = 12 // anty-abuse: mnożenie sesji nie omija limitu kosztów
const STORAGE_BUCKET = 'attachments'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function buildImagePrompt(brief: Record<string, unknown>): string {
  const s = (v: unknown) => (typeof v === 'string' ? v.slice(0, 300) : '')
  const ekrany = Array.isArray(brief.ekrany)
    ? brief.ekrany.filter((e) => typeof e === 'string').slice(0, 6).join(', ')
    : ''
  // Wytyczne wizualne rozmówcy (pole "styl" z markera <projekt>) mają
  // PIERWSZEŃSTWO przed domyślnym dark-mode — user może chcieć jasny motyw,
  // inne kolory, prostszy układ itd.
  const styl = typeof brief.styl === 'string' ? brief.styl.trim().slice(0, 500) : ''
  const designLine = styl
    ? `DESIGN — WYTYCZNE KLIENTA (PRIORYTET, zastosuj je dokładnie): ${styl}. Niezależnie od nich utrzymaj jakość premium SaaS: czysta siatka, spójna paleta, zaokrąglenia 12-16px, dużo światła między elementami, nowoczesna typografia sans-serif (Inter).`
    : 'DESIGN: premium dark-mode SaaS klasy Linear/Stripe/Vercel — tło grafitowo-czarne #0B0D12, panele glassmorphism z subtelnymi obramowaniami rgba(255,255,255,0.08), elektryczny niebieski akcent #4D9FFF na przyciskach, wykresach i aktywnych elementach, zaokrąglenia 12-16px, czysta siatka, dużo światła między elementami, nowoczesna typografia sans-serif (Inter).'
  return [
    `Pełnoekranowy zrzut interfejsu aplikacji webowej SaaS „${s(brief.nazwa) || 'Narzędzie'}" — widok wprost, full-bleed, bez ramki przeglądarki i bez tła dookoła.`,
    `Przeznaczenie: ${s(brief.dla_kogo)}. Rozwiązuje: ${s(brief.problem)}. Funkcja główna: ${s(brief.opis)}.`,
    designLine,
    `LAYOUT: wąski lewy sidebar z liniowymi ikonami i etykietami sekcji${ekrany ? ` (${ekrany})` : ''}; górna belka z wyszukiwarką i awatarem; główny obszar: 3-4 karty KPI z dużymi liczbami, elegancki wykres z gradientowym wypełnieniem, poniżej tabela rekordów ze statusami jako kolorowe badge (niebieski/zielony/bursztynowy).`,
    'TREŚCI: realistyczne polskie dane przykładowe dopasowane do tej branży — prawdziwie brzmiące nazwy, imiona, daty, kwoty w zł; krótkie poprawne polskie etykiety; zero lorem ipsum.',
    'JAKOŚĆ: dopracowanie jak top shot z Dribbble/Behance, pixel-perfect, spójny zestaw ikon liniowych, miękkie cienie i głębia, bez ludzi, bez logotypów firm trzecich, bez znaków wodnych.',
  ].join(' ')
}

// Wywołanie OpenAI Images API; przy błędzie nieznanego modelu — fallback
async function generateImage(apiKey: string, prompt: string): Promise<Uint8Array> {
  const call = async (model: string): Promise<Response> =>
    fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size: '1536x1024',
        quality: 'medium',
        n: 1,
      }),
    })

  let res = await call(IMAGE_MODEL)
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    const modelProblem = res.status === 400 || res.status === 404
    console.error(`[spar-image] ${IMAGE_MODEL} error:`, res.status, errText.slice(0, 500))
    if (modelProblem && IMAGE_MODEL !== IMAGE_MODEL_FALLBACK && /model/i.test(errText)) {
      console.log(`[spar-image] fallback na ${IMAGE_MODEL_FALLBACK}`)
      res = await call(IMAGE_MODEL_FALLBACK)
      if (!res.ok) {
        const fbText = await res.text().catch(() => '')
        console.error(`[spar-image] fallback error:`, res.status, fbText.slice(0, 500))
        throw new Error('openai_images_error')
      }
    } else {
      throw new Error('openai_images_error')
    }
  }

  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64 || typeof b64 !== 'string') {
    console.error('[spar-image] brak b64_json w odpowiedzi')
    throw new Error('openai_images_error')
  }
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'metoda_niedozwolona' }, 405, corsHeaders)
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[spar-image] brak konfiguracji')
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, corsHeaders)
    }

    let body: { sessionId?: string }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, corsHeaders)
    }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, corsHeaders)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: session, error: sessionError } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, image_count')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error('[spar-image] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if (!session) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, corsHeaders)
    }
    const brief = session.preview_brief as Record<string, unknown> | null
    if (!brief) {
      // brief zapisuje spar-chat z markera <projekt> — bez niego nie generujemy
      // (endpoint publiczny: bez tego gate'u każdy mógłby palić obrazki naszym kluczem)
      return jsonResponse({ error: 'brak_projektu' }, 400, corsHeaders)
    }
    const imageCount = (session.image_count as number | null) ?? 0
    if (imageCount >= MAX_IMAGES_PER_SESSION) {
      return jsonResponse({ error: 'limit_podgladow' }, 429, corsHeaders)
    }

    // Limit dzienny per IP — sumujemy podglądy ze wszystkich sesji tego IP,
    // żeby mnożenie sessionId nie omijało limitu per sesja (każdy obraz kosztuje)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    if (ip) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ipRows, error: ipError } = await supabase
        .from('spar_sessions')
        .select('image_count')
        .eq('ip', ip)
        .gte('created_at', dayAgo)
      if (ipError) {
        console.error('[spar-image] ip limit query error:', ipError)
      } else {
        const total = (ipRows || []).reduce((s, r) => s + ((r.image_count as number) || 0), 0)
        if (total >= MAX_IMAGES_PER_IP_PER_DAY) {
          return jsonResponse({ error: 'limit_podgladow_dzienny' }, 429, corsHeaders)
        }
      }
    }

    const bytes = await generateImage(OPENAI_API_KEY, buildImagePrompt(brief))

    const path = `spar/${sessionId}/podglad-${imageCount + 1}.png`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, bytes, { contentType: 'image/png', upsert: true })
    if (uploadError) {
      console.error('[spar-image] upload error:', uploadError)
      return jsonResponse({ error: 'blad_zapisu' }, 500, corsHeaders)
    }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    const url = pub?.publicUrl
    if (!url) {
      return jsonResponse({ error: 'blad_zapisu' }, 500, corsHeaders)
    }

    const { error: updateError } = await supabase
      .from('spar_sessions')
      .update({ preview_image_url: url, image_count: imageCount + 1, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (updateError) console.error('[spar-image] session update error:', updateError)

    // remaining = ile darmowych poprawek zostało (frontend pokazuje licznik)
    return jsonResponse({ url, remaining: MAX_IMAGES_PER_SESSION - (imageCount + 1) }, 200, corsHeaders)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[spar-image] ERROR:', msg)
    return jsonResponse({ error: msg === 'openai_images_error' ? 'blad_generowania' : 'blad_serwera' }, 502, corsHeaders)
  }
})
