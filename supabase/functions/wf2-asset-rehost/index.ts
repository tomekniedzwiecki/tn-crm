// wf2-asset-rehost — upload assetu do Storage przez service role (moduł Sklepy).
// Powód: klucze sb_secret_* nie przechodzą jako Bearer przez storage-api (Invalid Compact JWS),
// a CLI `storage cp` zwraca LegacyStorageUnsupportedOperation na tym projekcie — edge z env
// SUPABASE_SERVICE_ROLE_KEY jest jedyną pewną ścieżką zapisu. Narzędzie fabryczne (wideo MP4
// z /trendy na landingi, przyszłe assety).
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (gate w środku: x-wf2-secret == env WF2_GEN_SECRET).
// POST binarny; nagłówki: x-wf2-secret, x-dest-path (np. bud-videos/123.mp4),
// content-type (np. video/mp4), opcjonalnie x-bucket (default attachments).
// Limity: ścieżka whitelistowana prefiksem, rozmiar ≤ 25 MB.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_PREFIXES = ['bud-videos/', 'bud-assets/', 'wf2/'];
const MAX_BYTES = 25 * 1024 * 1024;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'metoda_niedozwolona' }), { status: 405 });
  try {
    const WF2 = Deno.env.get('WF2_GEN_SECRET') || '';
    if (!WF2 || req.headers.get('x-wf2-secret') !== WF2) {
      return new Response(JSON.stringify({ error: 'brak_uprawnien' }), { status: 403 });
    }
    const path = (req.headers.get('x-dest-path') || '').replace(/^\/+/, '');
    if (!path || path.includes('..') || !ALLOWED_PREFIXES.some((p) => path.startsWith(p))) {
      return new Response(JSON.stringify({ error: 'zla_sciezka', allowed: ALLOWED_PREFIXES }), { status: 400 });
    }
    const bucket = req.headers.get('x-bucket') || 'attachments';
    const contentType = req.headers.get('content-type') || 'application/octet-stream';
    const buf = new Uint8Array(await req.arrayBuffer());
    if (!buf.length || buf.length > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'zly_rozmiar', bytes: buf.length, max: MAX_BYTES }), { status: 400 });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error } = await supabase.storage.from(bucket).upload(path, buf, { contentType, upsert: true, cacheControl: '31536000' });
    if (error) return new Response(JSON.stringify({ error: String(error.message || error) }), { status: 500 });
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return new Response(JSON.stringify({ ok: true, url: pub.publicUrl, bytes: buf.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e).slice(0, 200) }), { status: 500 });
  }
});
