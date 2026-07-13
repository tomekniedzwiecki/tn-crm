// wfa-inbox-webhook — odbiór maili przychodzących (Resend Inbound, event email.received)
// dla WSZYSTKICH domen aplikacji. Zapis do wfa_inbox + auto-forward per projekt.
// SSOT: SPEC-SKRZYNKI.md. Wzorzec svix = resend-webhook / email-inbound.
//
// Webhook Resend NIE zawiera treści maila — pełny content pobieramy z:
//   GET https://api.resend.com/emails/receiving/{email_id}
// Załączniki (treść): GET .../attachments/{attachment_id} → download_url (ważny 1h) → fetch.
//
// Deploy: npx supabase functions deploy wfa-inbox-webhook --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const RESEND_API = "https://api.resend.com";
const FORWARD_ATTACH_LIMIT = 8 * 1024 * 1024; // 8 MB — powyżej: pomiń załączniki, dodaj notkę

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Weryfikacja podpisu svix (Resend) — wzorzec resend-webhook ───────────────
async function verifySvixSignature(
  id: string,
  payload: string,
  signature: string,
  timestamp: string,
  secret: string,
): Promise<boolean> {
  try {
    const signatures = signature.split(" ");
    const signedPayload = `${id}.${timestamp}.${payload}`;
    const secretBytes = Uint8Array.from(atob(secret.replace("whsec_", "")), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
    const expected = "v1," + btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
    return signatures.some((sig) => sig === expected);
  } catch (error) {
    console.error("[wfa-inbox-webhook] Signature verification error:", error);
    return false;
  }
}

// ── Helpery ──────────────────────────────────────────────────────────────────
// Wyciągnij goły adres z "Name <mail@x>" lub "mail@x"
function extractEmail(str: string | undefined | null): string {
  if (!str) return "";
  const m = str.match(/<([^>]+)>/);
  return (m ? m[1] : str).toLowerCase().trim();
}
// Wyciągnij nazwę z "Name <mail@x>" (null gdy goły adres)
function extractName(str: string | undefined | null): string | null {
  if (!str) return null;
  const m = str.match(/^\s*"?([^"<]+?)"?\s*</);
  return m ? m[1].trim() : null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Resend bywa zwraca html jako data URI (html_format === 'data_uri'):
// data:text/html;base64,<...> → zdekoduj do czystego HTML przed zapisem do bazy.
function decodeHtmlMaybeDataUri(html: string | null, htmlFormat: string | null): string | null {
  if (!html) return html ?? null;
  if (htmlFormat === "data_uri" || html.startsWith("data:")) {
    try {
      const comma = html.indexOf(",");
      if (comma === -1) return html;
      const meta = html.slice(0, comma);
      const payload = html.slice(comma + 1);
      if (/;base64/i.test(meta)) {
        const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
      }
      return decodeURIComponent(payload);
    } catch (e) {
      console.warn("[wfa-inbox-webhook] data_uri decode failed:", e);
      return html;
    }
  }
  return html;
}

// arrayBuffer → base64 (chunkowane, by nie przepełnić stosu przy dużych plikach)
function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// LOOP GUARD: czy odebrany mail ma nagłówek X-TN-Inbox-Forward (case-insensitive)?
// headers z Resend API bywają obiektem {name:value} albo tablicą [{name,value}].
function hasForwardHeader(headers: unknown): boolean {
  if (!headers) return false;
  const target = "x-tn-inbox-forward";
  if (Array.isArray(headers)) {
    return headers.some((h) => String(h?.name || "").toLowerCase() === target);
  }
  if (typeof headers === "object") {
    return Object.keys(headers as Record<string, unknown>).some((k) => k.toLowerCase() === target);
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase config");

    // Body MUSI być czytane jako text PRZED JSON.parse (weryfikacja podpisu)
    const bodyText = await req.text();

    // ── svix: akceptuj dowolny ze skonfigurowanych sekretów (odporność na „który gdzie").
    //    Nazwy: RESEND_WEBHOOK_SECRET_INBOX (DO ZROBIENIA) + resend_inbox_webhook_secret (SPEC/config).
    const candidateSecrets = [
      Deno.env.get("RESEND_WEBHOOK_SECRET_INBOX"),
      Deno.env.get("resend_inbox_webhook_secret"),
    ].filter((s): s is string => !!s);

    if (candidateSecrets.length) {
      const svixId = req.headers.get("svix-id");
      const svixSig = req.headers.get("svix-signature");
      const svixTs = req.headers.get("svix-timestamp");
      if (!svixId || !svixSig || !svixTs) {
        console.error("[wfa-inbox-webhook] Missing signature headers - rejecting");
        return json({ success: false, error: "Missing signature" }, 401);
      }
      let valid = false;
      for (const secret of candidateSecrets) {
        if (await verifySvixSignature(svixId, bodyText, svixSig, svixTs, secret)) { valid = true; break; }
      }
      if (!valid) {
        console.error(`[wfa-inbox-webhook] Invalid signature (tried ${candidateSecrets.length} secret(s))`);
        return json({ success: false, error: "Invalid signature" }, 401);
      }
    } else {
      // Sekret nieustawiony — przetwarzaj, ale ostrzeż (wzorzec resend-webhook).
      console.warn("[wfa-inbox-webhook] No inbox webhook secret set — processing WITHOUT signature check");
    }

    const payload = JSON.parse(bodyText);
    if (payload?.type !== "email.received") {
      return json({ success: true, ignored: true, type: payload?.type ?? null });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const data = payload.data || {};
    const emailId: string | undefined = data.email_id || data.id;
    if (!emailId) {
      console.error("[wfa-inbox-webhook] Brak email_id w payloadzie");
      return json({ success: false, error: "missing email_id" }, 200);
    }

    // ── Pobierz pełną treść received maila z API Resend ────────────────────────
    const resendApiKey = Deno.env.get("resend_api_key");
    let content: Record<string, any> = {};
    if (resendApiKey) {
      try {
        const r = await fetch(`${RESEND_API}/emails/receiving/${emailId}`, {
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        });
        const txt = await r.text();
        if (r.ok) {
          content = JSON.parse(txt);
        } else {
          console.warn("[wfa-inbox-webhook] content fetch failed:", r.status, txt.slice(0, 300));
        }
      } catch (e) {
        console.error("[wfa-inbox-webhook] content fetch error:", e);
      }
    } else {
      console.warn("[wfa-inbox-webhook] Brak resend_api_key — zapis z samego payloadu webhooka");
    }

    // Nadawca: preferuj wersję z API (może być "Name <mail>"), fallback goły adres z webhooka
    const fromRaw: string = content.from || data.from || "";
    const fromEmail = extractEmail(fromRaw);
    const fromName = extractName(fromRaw);

    // Odbiorca (alias catch-all): pierwszy z data.to, fallback received_for[0], fallback content.to
    const toArr: string[] = Array.isArray(data.to) ? data.to
      : Array.isArray(data.received_for) ? data.received_for
      : Array.isArray(content.to) ? content.to
      : [];
    const toEmail = extractEmail(toArr[0]);

    const subject: string | null = (content.subject ?? data.subject) || null;
    const textBody: string | null = content.text ?? null;
    const htmlBody = decodeHtmlMaybeDataUri(content.html ?? null, content.html_format ?? null);
    const messageId: string | null = content.message_id || data.message_id || content.headers?.["message-id"] || null;

    // Metadata załączników (z size) z API; fallback metadata z webhooka (bez size)
    const attachments: any[] = Array.isArray(content.attachments) ? content.attachments
      : Array.isArray(data.attachments) ? data.attachments
      : [];
    const attachMeta = attachments.map((a) => ({
      id: a.id ?? null,
      filename: a.filename ?? null,
      content_type: a.content_type ?? null,
      size: typeof a.size === "number" ? a.size : null,
    }));

    // ── Match projektu: domena z toEmail == wfa_projects.domain (case-insensitive), nie-test ──
    let project: any = null;
    const domain = toEmail.includes("@") ? toEmail.split("@")[1].toLowerCase() : null;
    if (domain) {
      const { data: rows } = await supabase
        .from("wfa_projects")
        .select("id, name, domain, inbox_enabled, inbox_forward_to, customer_email")
        .ilike("domain", domain)
        .eq("is_test", false)
        .limit(1);
      project = rows?.[0] || null;
    }

    // ── INSERT idempotentny (ON CONFLICT resend_id DO NOTHING) ─────────────────
    // upsert + ignoreDuplicates + .select(): pusta tablica = duplikat (retry svix) → bez forwardu.
    const { data: inserted, error: insErr } = await supabase
      .from("wfa_inbox")
      .upsert({
        project_id: project?.id ?? null,
        resend_id: emailId,
        message_id: messageId,
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        subject,
        text_body: textBody,
        html_body: htmlBody,
        attachments: attachMeta,
        received_at: payload.created_at || new Date().toISOString(),
      }, { onConflict: "resend_id", ignoreDuplicates: true })
      .select("id");

    if (insErr) {
      console.error("[wfa-inbox-webhook] insert error:", insErr);
      return json({ success: false, error: insErr.message }, 200);
    }
    const row = inserted?.[0];
    if (!row) {
      // Duplikat (retry) — nic nie robimy, nie forwardujemy ponownie.
      return json({ success: true, duplicate: true, resend_id: emailId });
    }
    const inboxId = row.id;
    console.log(`[wfa-inbox-webhook] zapisano ${inboxId} (project=${project?.id ?? "—"}, to=${toEmail})`);

    // ── FORWARD (tylko świeży wiersz + projekt + enabled + adres) ──────────────
    // DEFAULT: adres klienta/operatora (customer_email); inbox_forward_to = świadome nadpisanie.
    const forwardTo = (project?.inbox_forward_to || project?.customer_email || "").trim().toLowerCase();
    const shouldForward = !!project && project.inbox_enabled !== false && !!forwardTo;

    if (shouldForward) {
      // LOOP GUARD: mail już przekazany przez nas (nagłówek) lub od adresu docelowego forwardu.
      const isLoop = hasForwardHeader(content.headers) || fromEmail === forwardTo.toLowerCase();
      if (isLoop) {
        await supabase.from("wfa_inbox").update({ forward_error: "loop-guard skip" }).eq("id", inboxId);
        console.log("[wfa-inbox-webhook] loop-guard: pomijam forward");
      } else if (!resendApiKey) {
        await supabase.from("wfa_inbox").update({ forward_error: "brak resend_api_key" }).eq("id", inboxId);
      } else {
        try {
          // Załączniki: dołącz gdy suma znanych rozmiarów < 8 MB, inaczej notka.
          const totalSize = attachMeta.reduce((s, a) => s + (a.size || 0), 0);
          const withinLimit = attachMeta.length > 0 && totalSize > 0 && totalSize < FORWARD_ATTACH_LIMIT;
          const outAttachments: { content: string; filename: string; content_type?: string }[] = [];
          let attachSkippedNote = "";

          if (attachMeta.length > 0 && withinLimit) {
            for (const a of attachMeta) {
              if (!a.id) continue;
              try {
                const metaRes = await fetch(`${RESEND_API}/emails/receiving/${emailId}/attachments/${a.id}`, {
                  headers: { Authorization: `Bearer ${resendApiKey}` },
                });
                if (!metaRes.ok) { console.warn("[wfa-inbox-webhook] attach meta fail:", a.id, metaRes.status); continue; }
                const meta = await metaRes.json();
                if (!meta.download_url) continue;
                const fileRes = await fetch(meta.download_url);
                if (!fileRes.ok) { console.warn("[wfa-inbox-webhook] attach download fail:", a.id); continue; }
                outAttachments.push({
                  content: bufferToBase64(await fileRes.arrayBuffer()),
                  filename: meta.filename || a.filename || "zalacznik",
                  content_type: meta.content_type || a.content_type || undefined,
                });
              } catch (ae) {
                console.warn("[wfa-inbox-webhook] attach error:", a.id, ae);
              }
            }
          } else if (attachMeta.length > 0) {
            attachSkippedNote =
              `<p style="color:#b45309;font-size:13px;margin-top:16px">Załączniki (${attachMeta.length}) dostępne w panelu Skrzynki.</p>`;
          }

          // Treść forwardu: meta (Od/Do/Data) + oryginał (html albo <pre> z tekstu) + ew. notka.
          const dateStr = new Date(payload.created_at || Date.now()).toLocaleString("pl-PL");
          const metaHtml =
            `<div style="border-left:3px solid #10b981;padding-left:12px;margin-bottom:14px;color:#6b7280;font-size:13px">` +
            `<div><strong>Od:</strong> ${escapeHtml(fromName ? `${fromName} <${fromEmail}>` : fromEmail)}</div>` +
            `<div><strong>Do:</strong> ${escapeHtml(toEmail)}</div>` +
            `<div><strong>Data:</strong> ${escapeHtml(dateStr)}</div></div>` +
            `<hr style="border:none;border-top:1px solid #e5e7eb;margin:14px 0">`;
          const bodyHtml = htmlBody
            ? htmlBody
            : `<pre style="white-space:pre-wrap;font-family:inherit;margin:0">${escapeHtml(textBody || "(brak treści)")}</pre>`;
          const forwardHtml = metaHtml + bodyHtml + attachSkippedNote;

          // from: nazwa nadawcy + „(przekazane)", adres = zweryfikowany alias domeny (toEmail)
          const fromDisplay = (fromName || fromEmail).replace(/["\r\n]/g, "").trim() || fromEmail;
          const forwardFrom = `"${fromDisplay} (przekazane)" <${toEmail}>`;
          const forwardSubject = `[${project.domain}] ${subject || "(bez tematu)"}`;

          const sendRes = await fetch(`${RESEND_API}/emails`, {
            method: "POST",
            headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: forwardFrom,
              to: forwardTo,
              reply_to: fromEmail,              // odpowiedź z Gmaila idzie do KLIENTA
              subject: forwardSubject,
              html: forwardHtml,
              headers: { "X-TN-Inbox-Forward": "1" },
              ...(outAttachments.length ? { attachments: outAttachments } : {}),
            }),
          });

          if (sendRes.ok) {
            await supabase.from("wfa_inbox").update({
              forwarded_to: forwardTo,
              forwarded_at: new Date().toISOString(),
              forward_error: null,
            }).eq("id", inboxId);
            console.log(`[wfa-inbox-webhook] forward → ${forwardTo} OK`);
          } else {
            const errTxt = await sendRes.text();
            await supabase.from("wfa_inbox").update({ forward_error: `resend ${sendRes.status}: ${errTxt.slice(0, 300)}` }).eq("id", inboxId);
            console.warn("[wfa-inbox-webhook] forward send failed:", sendRes.status, errTxt.slice(0, 300));
          }
        } catch (fe) {
          const msg = fe instanceof Error ? fe.message : String(fe);
          await supabase.from("wfa_inbox").update({ forward_error: msg.slice(0, 300) }).eq("id", inboxId);
          console.error("[wfa-inbox-webhook] forward error:", msg);
        }
      }
    }

    return json({ success: true, id: inboxId, project_id: project?.id ?? null, forwarded: shouldForward });
  } catch (error: unknown) {
    // Błąd krytyczny — loguj, ale zwróć 200 (svix nie może retry'ować w nieskończoność)
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[wfa-inbox-webhook] ERROR:", msg);
    return json({ success: false, error: msg }, 200);
  }
});
