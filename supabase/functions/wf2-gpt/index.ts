// wf2-gpt — proxy do modeli koderskich dla modułu Sklepy (cross-model review / kod landingów).
// Powód: klucze API żyją wyłącznie w sekretach edge; lokalne skrypty fabryki
// (np. scripts/mockup-tools/wf2gpt-call.py) wołają ten endpoint zamiast trzymać klucz w .env.
// Budżet Tomka: ~15 zł/landing na kod+zdjęcia (decyzja 15.07) — model domyślny gpt-5.6-sol.
//
// PROVIDERY (routing po nazwie modelu):
//   gpt-*  → OpenAI Responses API (OPENAI_API_KEY) — default
//   kimi-* → Moonshot chat/completions (KIMI_API_KEY) — benchmark Kimi K3 (21.07)
// Dodatkowo: POST {list_models:'kimi'} → GET /v1/models Moonshot (odkrycie id modeli).
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (gate w środku: x-wf2-secret == env WF2_GEN_SECRET).
// POST { model?, input: string | messages: [{role,content}], max_output_tokens?, temperature? }
// → zwraca { text, usage, model } (albo błąd 1:1).

const DEFAULT_MODEL = 'gpt-5.6-sol';
const MAX_INPUT_CHARS = 400_000;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'metoda_niedozwolona' }), { status: 405 });
  try {
    const WF2 = Deno.env.get('WF2_GEN_SECRET') || '';
    if (!WF2 || req.headers.get('x-wf2-secret') !== WF2) {
      return new Response(JSON.stringify({ error: 'brak_uprawnien' }), { status: 403 });
    }
    const body = await req.json().catch(() => ({})) as {
      model?: string; input?: string; messages?: { role: string; content: unknown }[];
      max_output_tokens?: number; temperature?: number;
      reasoning?: { effort?: 'minimal' | 'low' | 'medium' | 'high' };
      list_models?: string;
    };

    // Lista modeli providera (odkrycie dokładnych id, np. Kimi K3)
    if (body.list_models === 'kimi') {
      const KKEY = Deno.env.get('KIMI_API_KEY') || '';
      if (!KKEY) return new Response(JSON.stringify({ error: 'brak_klucza_kimi_w_env' }), { status: 500 });
      const r = await fetch('https://api.moonshot.ai/v1/models', { headers: { 'Authorization': `Bearer ${KKEY}` } });
      return new Response(JSON.stringify(await r.json()), { status: r.status, headers: { 'Content-Type': 'application/json' } });
    }

    const isKimi = (body.model || '').startsWith('kimi');
    const KEY = Deno.env.get(isKimi ? 'KIMI_API_KEY' : 'OPENAI_API_KEY') || '';
    if (!KEY) return new Response(JSON.stringify({ error: isKimi ? 'brak_klucza_kimi_w_env' : 'brak_klucza_openai_w_env' }), { status: 500 });

    const input = body.messages ?? body.input;
    if (!input) return new Response(JSON.stringify({ error: 'brak_input' }), { status: 400 });
    if (JSON.stringify(input).length > MAX_INPUT_CHARS) {
      return new Response(JSON.stringify({ error: 'input_za_dlugi', max: MAX_INPUT_CHARS }), { status: 400 });
    }

    if (isKimi) {
      // Moonshot = OpenAI-compatible chat/completions. Mapowanie z formatu Responses:
      // content [{type:input_text,text}] → string; input_image → {type:image_url}.
      const msgs = (Array.isArray(input) ? input : [{ role: 'user', content: String(input) }]).map((m: { role: string; content: unknown }) => {
        if (typeof m.content === 'string') return { role: m.role, content: m.content };
        const parts = (m.content as { type: string; text?: string; image_url?: string }[]) || [];
        const imgs = parts.filter((p) => p.type === 'input_image');
        const txt = parts.filter((p) => p.type === 'input_text').map((p) => p.text).join('\n');
        if (!imgs.length) return { role: m.role, content: txt };
        return { role: m.role, content: [
          ...imgs.map((p) => ({ type: 'image_url', image_url: { url: p.image_url } })),
          { type: 'text', text: txt },
        ] };
      });
      const r = await fetch('https://api.moonshot.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: body.model,
          messages: msgs,
          max_tokens: Math.min(body.max_output_tokens ?? 8000, 32000),
          ...(body.temperature !== undefined ? { temperature: body.temperature } : {}),
        }),
      });
      const j = await r.json();
      if (!r.ok) return new Response(JSON.stringify({ error: 'kimi', detail: j }), { status: r.status });
      const text = j.choices?.[0]?.message?.content ?? '';
      return new Response(JSON.stringify({ text, usage: j.usage ?? null, model: j.model ?? null }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
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
