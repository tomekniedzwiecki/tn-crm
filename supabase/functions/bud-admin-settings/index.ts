// bud-admin-settings — podgląd i edycja „źródła prawdy" lejka BUDOWANIA (Sklep / AWE)
// z panelu TN Sklep. KOPIA spar-admin-settings z rejestrem ../_shared/bud-prompts.ts.
// GATE: team_members (publiczna rejestracja sparingu daje rolę `authenticated` każdemu z
// internetu — samo zalogowanie NIE wystarcza; wymagamy wpisu w team_members). Edytowalne
// TYLKO klucze z rejestru ../_shared/bud-prompts.ts. Każdy zapis robi BACKUP poprzedniej
// wartości (<key>_backup_RRRRMMDDHHMMSS) PRZED UPDATE. Panel renderuje się Z REJESTRU
// (get zwraca manifest) → dodanie promptu = wpis w rejestrze.
// Deploy: --no-verify-jwt (własna weryfikacja team_members).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { BUD_PROMPTS, BUD_PROMPTS_BY_KEY } from "../_shared/bud-prompts.ts";

const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tn-crm.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];
function cors(origin: string | null): Record<string, string> {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(body: Record<string, unknown>, status: number, c: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...c, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers: c });
  if (req.method !== 'POST') return json({ error: 'metoda_niedozwolona' }, 405, c);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: 'brak_konfiguracji' }, 500, c);
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── GATE: zalogowany + wpis w team_members ────────────────────────────────
  const m = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
  if (!m) return json({ error: 'wymagane_logowanie' }, 401, c);
  let userId: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser(m[1].trim());
    if (error || !data?.user) return json({ error: 'nieprawidlowy_token' }, 401, c);
    userId = data.user.id;
  } catch {
    return json({ error: 'nieprawidlowy_token' }, 401, c);
  }
  const { data: tm } = await supabase.from('team_members').select('user_id').eq('user_id', userId).maybeSingle();
  if (!tm) return json({ error: 'brak_uprawnien' }, 403, c);

  let body: { action?: string; key?: string; value?: string };
  try { body = await req.json(); } catch { return json({ error: 'nieprawidlowy_json' }, 400, c); }
  const action = (body.action || 'get').trim();
  const keys = BUD_PROMPTS.map((p) => p.key);

  // ── GET: manifest promptów + aktualne wartości + backupy (panel renderuje z tego) ──
  if (action === 'get') {
    const { data: rows } = await supabase.from('settings').select('key, value').in('key', keys);
    const { data: bRows } = await supabase.from('settings').select('key').like('key', '%\_backup\_%');
    const valueOf = (k: string) => (rows || []).find((r: { key: string; value: string }) => r.key === k)?.value ?? '';
    const backupsOf = (k: string) => (bRows || [])
      .map((r: { key: string }) => r.key)
      .filter((bk: string) => bk.startsWith(k + '_backup_'))
      .sort().reverse().slice(0, 8);
    const prompts = BUD_PROMPTS.map((p) => {
      const value = valueOf(p.key);
      return { ...p, value, len: value.length, backups: backupsOf(p.key) };
    });
    return json({ prompts }, 200, c);
  }

  // ── SAVE: backup bieżącej wartości + UPDATE ────────────────────────────────
  if (action === 'save') {
    const key = (body.key || '').trim();
    const value = typeof body.value === 'string' ? body.value : '';
    const rule = BUD_PROMPTS_BY_KEY[key];
    if (!rule || !rule.editable) return json({ error: 'klucz_niedozwolony' }, 400, c);
    if (value.length < rule.min) return json({ error: `Treść za krótka (min ${rule.min} znaków — zabezpieczenie przed wyczyszczeniem).` }, 400, c);
    if (value.length > rule.max) return json({ error: `Treść za długa (max ${rule.max} znaków).` }, 400, c);
    // Klucze celów maili przechowują mapę JSON {kind→cel}. Pilnujemy poprawności,
    // by literówka nie wyzerowała po cichu celów w runtime (loader robi JSON.parse).
    if (key.endsWith('_cele')) {
      try { const o = JSON.parse(value); if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('nie-obiekt'); }
      catch { return json({ error: 'Treść musi być poprawnym JSON-em (obiekt {klucz: "cel"}).' }, 400, c); }
    }
    // SMS „powrotu" MUSZĄ zawierać placeholder linku — inaczej SMS poszedłby bez adresu.
    if (key.startsWith('budowanie_sms_') && !value.includes('{{LINK}}')) {
      return json({ error: 'Treść SMS musi zawierać {{LINK}} (tam wstawiany jest link do panelu).' }, 400, c);
    }

    const { data: cur } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14); // RRRRMMDDHHMMSS
    const backupKey = `${key}_backup_${stamp}`;
    if (cur?.value != null) {
      await supabase.from('settings').upsert([{ key: backupKey, value: cur.value }], { onConflict: 'key' });
    }
    const { error: upErr } = await supabase.from('settings').upsert([{ key, value }], { onConflict: 'key' });
    if (upErr) { console.error('[bud-admin-settings] save error', upErr); return json({ error: 'blad_zapisu' }, 500, c); }
    return json({ ok: true, backupKey, len: value.length }, 200, c);
  }

  return json({ error: 'nieznana_akcja' }, 400, c);
});
