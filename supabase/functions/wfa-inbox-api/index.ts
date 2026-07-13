// wfa-inbox-api — akcje panelu Skrzynki (verify_jwt ON; wywołania z /tn-app/inbox).
// Gate: JWT usera → team_members (wzorzec wfa-portal verifyTeamMember). Brak → 403.
// Akcje:
//   { action:"reply",      inbox_id, body_text }        → wyślij odpowiedź w wątku (In-Reply-To)
//   { action:"attachment", inbox_id, attachment_id }    → zwróć download_url załącznika (ważny 1h)
// SSOT: SPEC-SKRZYNKI.md
//
// Deploy: npx supabase functions deploy wfa-inbox-api --project-ref yxmavwkwnfuphjqbelws   (BEZ --no-verify-jwt)

import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API = "https://api.resend.com";

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

// Gate: JWT CZŁONKA ZESPOŁU (nie samo 'authenticated' — publiczna rejestracja daje tę rolę każdemu).
async function verifyTeamMember(
  req: Request,
  sb: ReturnType<typeof createClient>,
): Promise<{ id: string } | null> {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const { data: u } = await sb.auth.getUser(m[1].trim());
  if (!u?.user) return null;
  const { data: tm } = await sb.from("team_members").select("user_id").eq("user_id", u.user.id).maybeSingle();
  return tm ? { id: u.user.id } : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("resend_api_key");
  if (!supabaseUrl || !supabaseKey) return json({ error: "server misconfigured" }, 500);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // ── Gate ────────────────────────────────────────────────────────────────────
  const member = await verifyTeamMember(req, supabase);
  if (!member) return json({ error: "forbidden" }, 403);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  const action = body?.action;

  try {
    // ── reply: odpowiedź w wątku ──────────────────────────────────────────────
    if (action === "reply") {
      const inboxId = body?.inbox_id;
      const bodyText = typeof body?.body_text === "string" ? body.body_text.trim() : "";
      if (!inboxId) return json({ error: "inbox_id wymagane" }, 400);
      if (!bodyText) return json({ error: "body_text wymagane" }, 400);
      if (!resendApiKey) return json({ error: "brak resend_api_key" }, 500);

      const { data: row, error: rowErr } = await supabase
        .from("wfa_inbox")
        .select("id, project_id, from_email, to_email, subject, message_id")
        .eq("id", inboxId)
        .maybeSingle();
      if (rowErr) return json({ error: rowErr.message }, 500);
      if (!row) return json({ error: "nie znaleziono maila" }, 404);

      // Nazwa projektu (jeśli przypisany) → display name; adres from = zweryfikowany alias (to_email wiersza)
      let projectName = "";
      if (row.project_id) {
        const { data: proj } = await supabase.from("wfa_projects").select("name").eq("id", row.project_id).maybeSingle();
        projectName = (proj?.name || "").trim();
      }
      const fromDisplay = (projectName || row.to_email).replace(/["\r\n]/g, "").trim() || row.to_email;
      const fromAddr = `"${fromDisplay}" <${row.to_email}>`;

      // Subject: "Re: ..." bez dublowania
      const baseSubject = row.subject || "";
      const replySubject = /^re:/i.test(baseSubject.trim()) ? baseSubject : `Re: ${baseSubject}`;

      // Wątek: In-Reply-To/References = message_id oryginału (jeśli jest)
      const headers: Record<string, string> = {};
      if (row.message_id) {
        headers["In-Reply-To"] = row.message_id;
        headers["References"] = row.message_id;
      }

      const sendRes = await fetch(`${RESEND_API}/emails`, {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromAddr,
          to: row.from_email,
          subject: replySubject,
          text: bodyText,
          ...(Object.keys(headers).length ? { headers } : {}),
        }),
      });
      const sendJson = await sendRes.json().catch(() => ({}));
      if (!sendRes.ok) {
        return json({ error: sendJson?.message || `resend ${sendRes.status}` }, 502);
      }

      await supabase.from("wfa_inbox").update({ replied_at: new Date().toISOString() }).eq("id", row.id);
      return json({ ok: true, id: sendJson?.id ?? null });
    }

    // ── attachment: zwróć krótkotrwały download_url ────────────────────────────
    if (action === "attachment") {
      const inboxId = body?.inbox_id;
      const attachmentId = body?.attachment_id;
      if (!inboxId || !attachmentId) return json({ error: "inbox_id i attachment_id wymagane" }, 400);
      if (!resendApiKey) return json({ error: "brak resend_api_key" }, 500);

      const { data: row, error: rowErr } = await supabase
        .from("wfa_inbox")
        .select("resend_id, attachments")
        .eq("id", inboxId)
        .maybeSingle();
      if (rowErr) return json({ error: rowErr.message }, 500);
      if (!row) return json({ error: "nie znaleziono maila" }, 404);

      // Walidacja: attachment_id musi występować w metadanych wiersza (anti-IDOR na dowolne id)
      const known = Array.isArray(row.attachments)
        && row.attachments.some((a: any) => String(a?.id) === String(attachmentId));
      if (!known) return json({ error: "załącznik nie należy do tego maila" }, 404);

      const metaRes = await fetch(`${RESEND_API}/emails/receiving/${row.resend_id}/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${resendApiKey}` },
      });
      const meta = await metaRes.json().catch(() => ({}));
      if (!metaRes.ok) return json({ error: meta?.message || `resend ${metaRes.status}` }, 502);

      return json({
        ok: true,
        download_url: meta.download_url,   // ważny ~1h — front otwiera bezpośrednio
        filename: meta.filename ?? null,
        content_type: meta.content_type ?? null,
      });
    }

    return json({ error: `nieznana akcja: ${action ?? "(brak)"}` }, 400);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[wfa-inbox-api] ERROR:", msg);
    return json({ error: msg }, 500);
  }
});
