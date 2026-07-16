// wf2-platform — adapter API platformy e-commerce (Trevio / sklepy.niedzwiecki.ai).
// JEDYNE miejsce w systemie znające API platformy (plan §API platformy, WORKFLOW-V2-PLAN.md).
// Klucz partnera = edge secret `ecom_platform_API`, doklejany jako X-Api-Key.
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (autoryzacja w środku: adminGate/team lub x-wf2-secret == WF2_GEN_SECRET).
// POST { action: 'raw', method?: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE', path: '/shops', query?: {…}, body?: {…} }
// Akcje typowane (shops/products/orders/pages/domains) dojdą po rozpoznaniu API — na razie tryb raw.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const BASE_URL = 'https://gateway.trevio.pl/partner/v1';
const ALLOWED_ORIGINS = ['https://crm.tomekniedzwiecki.pl', 'https://tn-crm.vercel.app', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return { 'Access-Control-Allow-Origin': a, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wf2-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'metoda_niedozwolona' }), { status: 405, headers: { ...c, 'Content-Type': 'application/json' } });
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const WF2 = Deno.env.get('WF2_GEN_SECRET') || '';
    const API_KEY = Deno.env.get('ecom_platform_API') || '';

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const okSecret = !!WF2 && req.headers.get('x-wf2-secret') === WF2;   // pusty sekret NIGDY nie autoryzuje
    if (!okSecret && !(await adminGate(req, supabase))) {
      return new Response(JSON.stringify({ error: 'brak_uprawnien' }), { status: 403, headers: { ...c, 'Content-Type': 'application/json' } });
    }
    if (!API_KEY) return new Response(JSON.stringify({ error: 'brak_klucza_platformy' }), { status: 500, headers: { ...c, 'Content-Type': 'application/json' } });

    let body: { action?: string; method?: string; path?: string; query?: Record<string, string>; body?: unknown };
    try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'nieprawidlowy_json' }), { status: 400, headers: { ...c, 'Content-Type': 'application/json' } }); }

    if (body.action !== 'raw') {
      return new Response(JSON.stringify({ error: 'nieznana_akcja', allowed: ['raw'] }), { status: 400, headers: { ...c, 'Content-Type': 'application/json' } });
    }
    const method = String(body.method || 'GET').toUpperCase();
    const path = String(body.path || '');
    if (!ALLOWED_METHODS.includes(method) || !path.startsWith('/') || path.includes('..') || /^\/\//.test(path)) {
      return new Response(JSON.stringify({ error: 'nieprawidlowe_wywolanie' }), { status: 400, headers: { ...c, 'Content-Type': 'application/json' } });
    }

    const url = new URL(BASE_URL + path);
    for (const [k, v] of Object.entries(body.query || {})) url.searchParams.set(k, String(v));

    const init: RequestInit = { method, headers: { 'X-Api-Key': API_KEY, 'Accept': 'application/json' } };
    if (body.body !== undefined && method !== 'GET') {
      (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body.body);
    }
    const r = await fetch(url.toString(), init);
    const txt = await r.text();
    const ct = r.headers.get('content-type') || '';
    let payload: unknown = txt;
    if (ct.includes('application/json')) { try { payload = JSON.parse(txt); } catch { /* zostaje tekst */ } }
    return new Response(JSON.stringify({ status: r.status, content_type: ct, data: payload }), { status: 200, headers: { ...c, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[wf2-platform] ERROR:', e);
    return new Response(JSON.stringify({ error: 'blad_serwera' }), { status: 500, headers: cors(req.headers.get('origin')) });
  }
});
