// Jednorazowa funkcja testowa (req Tomka 2026-07-09): sprawdzenie dostępu do gpt-5.6
// przez klucz projektu + generacja HTML z realnym zużyciem tokenów (koszt).
// Deploy: npx supabase functions deploy gpt-test --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
Deno.serve(async (req) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Content-Type': 'application/json' }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const key = Deno.env.get('OPENAI_API_KEY')
    if (!key) return new Response(JSON.stringify({ error: 'brak_klucza' }), { status: 500, headers: cors })
    const body = await req.json().catch(() => ({})) as { mode?: string; model?: string; system?: string; prompt?: string; max?: number }
    const mode = body.mode || 'gen'

    if (mode === 'list') {
      const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } })
      const j = await r.json()
      const ids = Array.isArray(j?.data) ? j.data.map((m: { id: string }) => m.id).filter((id: string) => /gpt-5|sol|terra|luna/i.test(id)).sort() : j
      return new Response(JSON.stringify({ status: r.status, models: ids }), { status: 200, headers: cors })
    }

    // mode === 'gen'
    const model = body.model || 'gpt-5.6'
    const payload = {
      model,
      messages: [
        { role: 'system', content: body.system || 'Jesteś ekspertem front-end. Zwracasz WYŁĄCZNIE kompletny, samodzielny plik HTML (inline CSS i JS, bez zewnętrznych zależności). Bez komentarza, bez bloków ```' },
        { role: 'user', content: body.prompt || 'Zrób efektowną, samodzielną stronę HTML.' },
      ],
      max_completion_tokens: body.max || 8000,
    }
    const t0 = Date.now()
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const j = await r.json()
    if (r.status !== 200) return new Response(JSON.stringify({ status: r.status, error: j?.error || j }), { status: 200, headers: cors })
    return new Response(JSON.stringify({
      status: 200,
      model: j.model,
      ms: Date.now() - t0,
      usage: j.usage,
      content: j.choices?.[0]?.message?.content || '',
    }), { status: 200, headers: cors })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors })
  }
})
