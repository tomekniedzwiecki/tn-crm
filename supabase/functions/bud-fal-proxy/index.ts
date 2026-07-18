// bud-fal-proxy — cienki proxy do fal.ai (klucz BUD_FAL_API_KEY zostaje server-side).
// Gate: x-tools-secret == BUD_TOOLS_SECRET (jak inne narzędzia bud-*).
// Ops:
//  {op:'submit', model, payload}       -> POST https://queue.fal.run/{model} (zwraca request_id, urls)
//  {op:'status', model, request_id}    -> GET  queue status (?logs=1)
//  {op:'result', model, request_id}    -> GET  wynik po COMPLETED
//  {op:'store',  path, b64, contentType} -> upload do storage attachments/video-factory/{path}, zwraca publicUrl
//     (potrzebne, bo fal wymaga publicznego URL obrazu wejściowego, a klatki generujemy lokalnie)
//  {op:'billing'}                       -> realne saldo konta (USD). Wymaga OSOBNEGO sekretu
//     BUD_FAL_ADMIN_KEY (klucz typu Admin z fal.ai — zwykły klucz nie ma dostępu do billing API).
//     Klucz Admin NIGDY nie schodzi na dysk klienta — na zewnątrz wychodzi tylko liczba salda.
// Deploy: supabase functions deploy bud-fal-proxy --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
import { createClient } from "jsr:@supabase/supabase-js@2";

const FAL_KEY = Deno.env.get("BUD_FAL_API_KEY") ?? "";
const TOOLS_SECRET = Deno.env.get("BUD_TOOLS_SECRET") ?? "";
const BUCKET = "attachments";

const j = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return j(405, { error: "POST only" });
  if (!TOOLS_SECRET || req.headers.get("x-tools-secret") !== TOOLS_SECRET) return j(401, { error: "unauthorized" });
  if (!FAL_KEY) return j(500, { error: "BUD_FAL_API_KEY not set" });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return j(400, { error: "bad json" }); }
  const op = String(body.op ?? "");
  const falHeaders = { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" };

  try {
    if (op === "submit") {
      const model = String(body.model ?? "");
      if (!/^[a-z0-9/._-]+$/i.test(model)) return j(400, { error: "bad model" });
      const r = await fetch(`https://queue.fal.run/${model}`, {
        method: "POST", headers: falHeaders, body: JSON.stringify(body.payload ?? {}),
      });
      return j(r.status, await r.json());
    }
    if (op === "poll") {
      // url = status_url/response_url zwrócony przez submit (modele z pod-ścieżką mają inny base)
      const url = String(body.url ?? "");
      if (!/^https:\/\/queue\.fal\.run\/[a-z0-9/._?=&-]+$/i.test(url)) return j(400, { error: "bad url" });
      const r = await fetch(url, { headers: falHeaders });
      const text = await r.text();
      try { return j(r.status, JSON.parse(text)); }
      catch { return j(r.status === 200 ? 502 : r.status, { raw: text.slice(0, 500), upstream_status: r.status }); }
    }
    if (op === "billing") {
      const admin = Deno.env.get("BUD_FAL_ADMIN_KEY") ?? "";
      if (!admin) return j(500, { error: "BUD_FAL_ADMIN_KEY not set" });
      const r = await fetch("https://api.fal.ai/v1/account/billing?expand=credits", {
        headers: { Authorization: `Key ${admin}` },
      });
      const d = await r.json().catch(() => null);
      return j(r.status, {
        balance: d?.credits?.current_balance ?? null,
        currency: d?.credits?.currency ?? "USD",
      });
    }
    if (op === "store") {
      const rel = String(body.path ?? "").replace(/[^a-z0-9/._-]/gi, "");
      if (!rel || rel.includes("..")) return j(400, { error: "bad path" });
      const b64 = String(body.b64 ?? "");
      const contentType = String(body.contentType ?? "image/jpeg");
      if (!/^(image\/(jpeg|png|webp)|video\/mp4|audio\/mpeg)$/.test(contentType)) return j(400, { error: "bad contentType" });
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      if (bytes.length > 40 * 1024 * 1024) return j(400, { error: "too big" });
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const full = `video-factory/${rel}`;
      const up = await supabase.storage.from(BUCKET).upload(full, bytes, { contentType, upsert: true });
      if (up.error) return j(500, { error: up.error.message });
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(full);
      return j(200, { url: pub.publicUrl });
    }
    return j(400, { error: "unknown op" });
  } catch (e) {
    return j(500, { error: String(e) });
  }
});
