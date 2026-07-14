// contract-file — zwraca krótkotrwały SIGNED URL do umowy w PRYWATNYM buckecie `contracts`.
// Zastępuje bezpośredni publiczny URL (bucket `attachments` był public → umowy z PESEL
// pobieralne bez logowania). Autoryzacja własna (deploy --no-verify-jwt):
//   * klient portalu: nagłówek x-wf-token == workflows.unique_token danego workflow,
//   * admin: JWT usera będącego w team_members.
// CORS dopuszcza x-wf-token (portal ustawia go globalnie na kliencie Supabase).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wf-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { workflow_id } = await req.json().catch(() => ({}));
    if (!workflow_id) return json({ error: "workflow_id wymagane" }, 400);

    const url = Deno.env.get("SUPABASE_URL")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, svc, { auth: { persistSession: false } });

    const { data: wf, error } = await sb
      .from("workflows")
      .select("unique_token, contract_seller_signed_url")
      .eq("id", workflow_id)
      .maybeSingle();
    if (error) return json({ error: "db" }, 500);
    if (!wf) return json({ error: "nie znaleziono" }, 404);
    if (!wf.contract_seller_signed_url) return json({ error: "brak umowy" }, 404);

    // ── autoryzacja ──
    let authorized = false;
    const wfToken = req.headers.get("x-wf-token");
    if (wfToken && wf.unique_token && wfToken === wf.unique_token) authorized = true;
    if (!authorized) {
      const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (jwt) {
        const { data: u } = await sb.auth.getUser(jwt);
        const uid = u?.user?.id;
        if (uid) {
          const { data: tm } = await sb.from("team_members").select("user_id").eq("user_id", uid).maybeSingle();
          if (tm) authorized = true;
        }
      }
    }
    if (!authorized) return json({ error: "brak dostępu" }, 403);

    // ── ścieżka w prywatnym buckecie ──
    // Stare wiersze: pełny publiczny URL .../attachments/contracts/<wfid>/plik → klucz po markerze.
    // Nowe wiersze (po migracji): sam klucz <wfid>/plik.
    const raw = String(wf.contract_seller_signed_url);
    const marker = "/attachments/contracts/";
    const key = raw.includes(marker)
      ? raw.substring(raw.indexOf(marker) + marker.length)
      : raw.replace(/^\/+/, "");
    if (!key) return json({ error: "nieoczekiwana ścieżka" }, 500);

    const { data: signed, error: signErr } = await sb.storage.from("contracts").createSignedUrl(key, 3600);
    if (signErr || !signed?.signedUrl) return json({ error: "podpis nieudany" }, 500);

    return json({ signedUrl: signed.signedUrl });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
