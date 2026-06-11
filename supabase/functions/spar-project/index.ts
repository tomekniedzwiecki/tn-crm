// spar-project — dane panelu projektu /stworze (stworze-projekt.html)
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-project --no-verify-jwt
//
// Akcje (POST JSON):
//   { sessionId, action: 'get' }                  -> sanitized projekt + feedback[]
//   { sessionId, action: 'feedback', text }       -> dodaje uwagę, zwraca feedback[]
//
// Model dostępu: sessionId (uuid z localStorage usera) działa jak token —
// jak linki klienckie w tn-crm. Czytamy/piszemy service_role'em; panel
// dostaje tylko zsanityzowany podzbiór pól (bez ip, bez pełnego e-maila).

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tn-crm.vercel.app',
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_FEEDBACK_PER_SESSION = 30
const MAX_FEEDBACK_LENGTH = 1000

function jsonResponse(body: Record<string, unknown>, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, cors)

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500, cors)

    let body: { sessionId?: string; action?: string; text?: string }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, cors)
    }

    const sessionId = (body.sessionId || '').trim()
    const action = (body.action || 'get').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, cors)
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: session, error: sErr } = await supabase
      .from('spar_sessions')
      .select('id, name, status, verdict, problem_summary, preview_brief, preview_image_url, image_count, lead_id, created_at')
      .eq('id', sessionId)
      .maybeSingle()

    if (sErr) {
      console.error('[spar-project] session fetch error:', sErr)
      return jsonResponse({ error: 'blad_serwera' }, 500, cors)
    }
    // Panel istnieje tylko dla sesji, w których jest już projekt (karta lub brief)
    if (!session || (!session.problem_summary && !session.preview_brief)) {
      return jsonResponse({ error: 'brak_projektu' }, 404, cors)
    }

    if (action === 'feedback') {
      const text = (body.text || '').trim()
      if (!text) return jsonResponse({ error: 'pusta_uwaga' }, 400, cors)
      if (text.length > MAX_FEEDBACK_LENGTH) return jsonResponse({ error: 'uwaga_za_dluga' }, 400, cors)

      const { count } = await supabase
        .from('spar_feedback')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
      if ((count ?? 0) >= MAX_FEEDBACK_PER_SESSION) {
        return jsonResponse({ error: 'limit_uwag' }, 429, cors)
      }

      const { error: insErr } = await supabase
        .from('spar_feedback')
        .insert({ session_id: sessionId, text })
      if (insErr) {
        console.error('[spar-project] feedback insert error:', insErr)
        return jsonResponse({ error: 'blad_serwera' }, 500, cors)
      }
    }

    const { data: feedback, error: fErr } = await supabase
      .from('spar_feedback')
      .select('text, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(MAX_FEEDBACK_PER_SESSION)
    if (fErr) console.error('[spar-project] feedback fetch error:', fErr)

    // Historia czatu współpracy (panel odtwarza rozmowę po odświeżeniu)
    const { data: collabMessages, error: cmErr } = await supabase
      .from('spar_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .eq('channel', 'wspolpraca')
      .order('id', { ascending: true })
      .limit(80)
    if (cmErr) console.error('[spar-project] collab messages fetch error:', cmErr)

    const brief = (session.preview_brief || {}) as Record<string, unknown>
    const karta = (session.problem_summary || null) as Record<string, unknown> | null
    const firstName = typeof session.name === 'string' && session.name
      ? session.name.split(' ')[0]
      : null

    return jsonResponse({
      projekt: {
        nazwa: (brief.nazwa as string) || 'Twoje narzędzie',
        opis: (brief.opis as string) || null,
        dla_kogo: (brief.dla_kogo as string) || null,
        ekrany: Array.isArray(brief.ekrany) ? brief.ekrany : [],
        karta,
        preview_image_url: session.preview_image_url || null,
        image_count: session.image_count || 0,
        verdict: session.verdict || null,
        status: session.status || 'active',
        lead_id: session.lead_id || null,
        imie: firstName,
        created_at: session.created_at,
      },
      feedback: feedback || [],
      wspolpraca: collabMessages || [],
    }, 200, cors)
  } catch (e) {
    console.error('[spar-project] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500, cors)
  }
})
