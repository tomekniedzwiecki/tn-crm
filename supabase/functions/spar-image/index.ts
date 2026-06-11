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
const MAX_IMAGES_PER_SESSION = 3
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
  return [
    `Makieta poglądowa (UI concept) aplikacji webowej SaaS „${s(brief.nazwa) || 'Narzędzie'}".`,
    `Dla kogo: ${s(brief.dla_kogo)}. Problem, który rozwiązuje: ${s(brief.problem)}.`,
    `Co robi: ${s(brief.opis)}.`,
    `Pokaż nowoczesny, czysty interfejs aplikacji w oknie przeglądarki: dashboard z bocznym menu${ekrany ? `, widoczne sekcje: ${ekrany}` : ''}.`,
    'Język interfejsu: polski. Styl: jasny, profesjonalny, minimalistyczny SaaS, realistyczny zrzut ekranu.',
    'Bez ludzi, bez logotypów firm trzecich, bez znaków wodnych.',
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

    return jsonResponse({ url }, 200, corsHeaders)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[spar-image] ERROR:', msg)
    return jsonResponse({ error: msg === 'openai_images_error' ? 'blad_generowania' : 'blad_serwera' }, 502, corsHeaders)
  }
})
