// wf2-gpt — proxy do OpenAI dla modułu Sklepy (cross-model review kodu / polish copy PL).
// Powód: klucz OPENAI_API_KEY żyje wyłącznie w sekretach edge; lokalne skrypty fabryki
// (np. scripts/landing-gpt-review.mjs) wołają ten endpoint zamiast trzymać klucz w .env.
// Budżet Tomka: ~15 zł/landing na kod+zdjęcia (decyzja 15.07) — model domyślny gpt-5.6-sol.
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (gate w środku: x-wf2-secret == env WF2_GEN_SECRET).
// POST { model?, input: string | messages: [{role,content}], max_output_tokens?, temperature? }
// → przekazuje do OpenAI Responses API i zwraca { text, usage } (albo błąd 1:1).

const DEFAULT_MODEL = 'gpt-5.6-sol';
const MAX_INPUT_CHARS = 400_000;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'metoda_niedozwolona' }), { status: 405 });
  try {
    const WF2 = Deno.env.get('WF2_GEN_SECRET') || '';
    if (!WF2 || req.headers.get('x-wf2-secret') !== WF2) {
      return new Response(JSON.stringify({ error: 'brak_uprawnien' }), { status: 403 });
    }
    const KEY = Deno.env.get('OPENAI_API_KEY') || '';
    if (!KEY) return new Response(JSON.stringify({ error: 'brak_klucza_openai_w_env' }), { status: 500 });

    const body = await req.json().catch(() => ({})) as {
      model?: string; input?: string; messages?: { role: string; content: string }[];
      max_output_tokens?: number; temperature?: number;
      reasoning?: { effort?: 'minimal' | 'low' | 'medium' | 'high' };
    };
    const input = body.messages ?? body.input;
    if (!input) return new Response(JSON.stringify({ error: 'brak_input' }), { status: 400 });
    if (JSON.stringify(input).length > MAX_INPUT_CHARS) {
      return new Response(JSON.stringify({ error: 'input_za_dlugi', max: MAX_INPUT_CHARS }), { status: 400 });
    }

    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: body.model || DEFAULT_MODEL,
        input,
        max_output_tokens: Math.min(body.max_output_tokens ?? 8000, 32000),
        ...(body.temperature !== undefined ? { temperature: body.temperature } : {}),
        ...(body.reasoning?.effort ? { reasoning: { effort: body.reasoning.effort } } : {}),
      }),
    });
    const j = await r.json();
    if (!r.ok) return new Response(JSON.stringify({ error: 'openai', detail: j }), { status: r.status });

    // Responses API: tekst w output[].content[].text
    let text = '';
    try {
      for (const o of (j.output ?? [])) for (const c of (o.content ?? [])) if (c.type === 'output_text') text += c.text;
    } catch (_e) { /* zwróć surowe niżej */ }
    return new Response(JSON.stringify({ text, usage: j.usage ?? null, model: j.model ?? null }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e).slice(0, 300) }), { status: 500 });
  }
});
