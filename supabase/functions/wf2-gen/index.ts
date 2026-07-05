// wf2-gen — admin proxy generatorów bud-* dla modułu „Sklepy" (workflow v2, plan §6a).
// Panel (team JWT) albo automaty (nagłówek x-wf2-secret == env WF2_GEN_SECRET) odpalają
// generacje deliverables portfela BEZ wystawiania SPAR_CRON_SECRET do przeglądarki:
// proxy dokleja x-admin-secret serwerowo (ścieżka admina w bud-* omija owner-gate i capy)
// i przekazuje odpowiedź 1:1. Generatory odpowiadają 202 (praca w tle) — proxy nie czeka.
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (autoryzacja w środku: adminGate/team lub sekret).
// POST { fn: 'bud-raport'|'bud-brand'|'bud-mockup'|'bud-landing-gen'|'bud-ads', payload: {…} }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

// generate-image: autoryzuje się nagłówkiem x-cron-secret (ten sam SPAR_CRON_SECRET) —
// proxy wysyła OBA nagłówki, więc whitelist obejmuje też bezpośrednie generacje obrazów.
const ALLOWED_FN = ['bud-raport', 'bud-brand', 'bud-mockup', 'bud-landing-gen', 'bud-ads', 'generate-image'];
const ALLOWED_ORIGINS = ['https://crm.tomekniedzwiecki.pl', 'https://tn-crm.vercel.app', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wf2-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'metoda_niedozwolona' }), { status: 405, headers: { ...c, 'Content-Type': 'application/json' } });
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const CRON = Deno.env.get('SPAR_CRON_SECRET') || '';
    const WF2 = Deno.env.get('WF2_GEN_SECRET') || '';

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const okSecret = !!WF2 && req.headers.get('x-wf2-secret') === WF2;   // pusty sekret NIGDY nie autoryzuje
    if (!okSecret && !(await adminGate(req, supabase))) {
      return new Response(JSON.stringify({ error: 'brak_uprawnien' }), { status: 403, headers: { ...c, 'Content-Type': 'application/json' } });
    }

    let body: { fn?: string; payload?: Record<string, unknown> };
    try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'nieprawidlowy_json' }), { status: 400, headers: { ...c, 'Content-Type': 'application/json' } }); }
    const fn = String(body.fn || '');
    if (!ALLOWED_FN.includes(fn) || !body.payload || typeof body.payload !== 'object') {
      return new Response(JSON.stringify({ error: 'nieprawidlowe_wywolanie', allowed: ALLOWED_FN }), { status: 400, headers: { ...c, 'Content-Type': 'application/json' } });
    }
    if (!CRON) return new Response(JSON.stringify({ error: 'brak_konfiguracji' }), { status: 500, headers: { ...c, 'Content-Type': 'application/json' } });

    const r = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': CRON, 'x-cron-secret': CRON },
      body: JSON.stringify(body.payload),
    });
    const txt = await r.text();
    return new Response(txt, { status: r.status, headers: { ...c, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[wf2-gen] ERROR:', e);
    return new Response(JSON.stringify({ error: 'blad_serwera' }), { status: 500, headers: cors(req.headers.get('origin')) });
  }
});
