// wfa-partner-mail — wyślij mail do PARTNERA (operatora aplikacji) + zapis do wfa_outbox.
// verify_jwt ON (deploy BEZ --no-verify-jwt).
//
// Gate dwutorowy:
//   (1) Authorization === SUPABASE_SERVICE_ROLE_KEY → actor 'auto' (wywołania z sesji Claude)
//   (2) w innym razie sb.auth.getUser(token) → user → EXISTS w team_members → actor 'admin' (Tomek z panelu)
//   brak → 403.
//
// POST body: { project_id (uuid, wymagane), subject (wymagane), body_text (wymagane),
//              kind? (default 'custom'), to_email? (default customer_email projektu) }
//
// Nadawca/reply-to z tabeli settings (wzorzec send-email/index.ts ~258-270) z fallbackami.
// Wysyłka przez Resend → INSERT do wfa_outbox (sent/failed + resend_id/error).
//
// Deploy: npx supabase functions deploy wfa-partner-mail --project-ref yxmavwkwnfuphjqbelws   (BEZ --no-verify-jwt)

import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API = "https://api.resend.com";

const MAX_SUBJECT = 300;
const MAX_BODY = 50000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// Wyciągnij token Bearer z nagłówka Authorization.
function bearer(req: Request): string | null {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("resend_api_key");
  if (!supabaseUrl || !serviceKey) return json({ error: "server misconfigured" }, 500);

  const supabase = createClient(supabaseUrl, serviceKey);

  // ── Gate dwutorowy ────────────────────────────────────────────────────────
  const token = bearer(req);
  if (!token) return json({ error: "forbidden" }, 403);

  // Czy token to service-role? Klucze systemowe rotują i występują w DWÓCH formatach
  // (legacy JWT service_role oraz nowe sb_secret_*), a projekt może mieć kilka aktywnych
  // sb_secret naraz — dlatego sprawdzamy kolejno:
  //  a) env SUPABASE_SERVICE_ROLE_KEY,
  //  b) wszystkie wartości z env SUPABASE_SECRET_KEYS (JSON, np. {"default":"sb_secret_..."}),
  //  c) claim role=service_role z payloadu JWT — bezpieczne, bo verify_jwt (platforma)
  //     zweryfikował podpis tokena zanim funkcja wystartowała.
  let isServiceRole = token === serviceKey;
  if (!isServiceRole && token.startsWith("sb_secret_")) {
    try {
      const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
      isServiceRole = Object.values(keys).some((k) => k === token);
    } catch (_e) { /* brak/zły format env — zostaje false */ }
  }
  if (!isServiceRole && token.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      isServiceRole = payload?.role === "service_role";
    } catch (_e) { /* nie-JWT / zły format — zostaje false */ }
  }

  let actor: "auto" | "admin";
  if (isServiceRole) {
    // (1) service-role = wywołanie z sesji Claude
    actor = "auto";
  } else {
    // (2) JWT CZŁONKA ZESPOŁU (nie samo 'authenticated' — publiczna rejestracja daje tę rolę każdemu)
    const { data: u } = await supabase.auth.getUser(token);
    if (!u?.user) return json({ error: "forbidden" }, 403);
    const { data: tm } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("user_id", u.user.id)
      .maybeSingle();
    if (!tm) return json({ error: "forbidden" }, 403);
    actor = "admin";
  }

  // ── Body ──────────────────────────────────────────────────────────────────
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const projectId = typeof body?.project_id === "string" ? body.project_id.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const bodyText = typeof body?.body_text === "string" ? body.body_text.trim() : "";
  const kind = typeof body?.kind === "string" && body.kind.trim() ? body.kind.trim() : "custom";
  const toOverride = typeof body?.to_email === "string" ? body.to_email.trim() : "";

  if (!projectId) return json({ error: "project_id wymagane" }, 400);
  if (!subject) return json({ error: "subject wymagane" }, 400);
  if (!bodyText) return json({ error: "body_text wymagane" }, 400);
  if (subject.length > MAX_SUBJECT) return json({ error: `subject > ${MAX_SUBJECT} znaków` }, 400);
  if (bodyText.length > MAX_BODY) return json({ error: `body_text > ${MAX_BODY} znaków` }, 400);
  if (!resendApiKey) return json({ error: "brak resend_api_key" }, 500);

  try {
    // ── Projekt ────────────────────────────────────────────────────────────
    const { data: proj, error: projErr } = await supabase
      .from("wfa_projects")
      .select("id, name, customer_name, customer_email")
      .eq("id", projectId)
      .maybeSingle();
    if (projErr) return json({ error: projErr.message }, 500);
    if (!proj) return json({ error: "nie znaleziono projektu" }, 404);

    const to = toOverride || (proj.customer_email || "").trim();
    if (!to) return json({ error: "brak adresata (to_email oraz customer_email puste)" }, 400);

    // ── Nadawca / reply-to z settings (wzorzec send-email/index.ts ~258-270) ──
    const { data: emailSettings } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["email_from_name_transactional", "email_from_transactional", "email_reply_to"]);

    const map: Record<string, string> = {};
    emailSettings?.forEach((s: any) => { map[s.key] = s.value; });

    const fromName = map.email_from_name_transactional || "Tomek Niedzwiecki";
    const fromEmail = map.email_from_transactional || "biuro@tomekniedzwiecki.pl";
    const fromAddress = `${fromName} <${fromEmail}>`;
    const replyTo = map.email_reply_to || "ceo@tomekniedzwiecki.pl";

    // ── Wysyłka przez Resend ─────────────────────────────────────────────────
    const sendRes = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress,
        to,
        reply_to: replyTo,
        subject,
        text: bodyText,
      }),
    });
    const sendJson = await sendRes.json().catch(() => ({}));

    if (!sendRes.ok) {
      // Rejestruj też nieudaną próbę (status 'failed' + error) — pełny rejestr
      const errMsg = sendJson?.message || `resend ${sendRes.status}`;
      await supabase.from("wfa_outbox").insert({
        project_id: projectId,
        to_email: to,
        subject,
        body_text: bodyText,
        kind,
        actor,
        status: "failed",
        error: errMsg,
      });
      return json({ error: errMsg }, 502);
    }

    const resendId = sendJson?.id ?? null;

    // ── Zapis do rejestru (sukces) ───────────────────────────────────────────
    const { data: inserted, error: insErr } = await supabase
      .from("wfa_outbox")
      .insert({
        project_id: projectId,
        to_email: to,
        subject,
        body_text: bodyText,
        kind,
        actor,
        resend_id: resendId,
        status: "sent",
      })
      .select("id")
      .maybeSingle();
    if (insErr) return json({ error: insErr.message }, 500);

    return json({ ok: true, outbox_id: inserted?.id ?? null, resend_id: resendId });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[wfa-partner-mail] ERROR:", msg);
    return json({ error: msg }, 500);
  }
});
