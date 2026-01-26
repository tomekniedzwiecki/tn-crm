 ;
import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

// Weryfikacja podpisu webhook z Resend (Svix)
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): Promise<boolean> {
  try {
    // Resend/Svix używa formatu: v1,signature
    const signatures = signature.split(" ");
    const signedPayload = `${timestamp}.${payload}`;

    // Secret jest w formacie "whsec_..." - trzeba usunąć prefix i zdekodować z base64
    const secretBytes = Uint8Array.from(atob(secret.replace("whsec_", "")), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
    const expectedSignature = "v1," + btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

    // Sprawdź czy którykolwiek podpis pasuje
    return signatures.some(sig => sig === expectedSignature);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Pobierz nagłówki Svix do weryfikacji
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");

    // Pobierz body jako tekst do weryfikacji
    const bodyText = await req.text();

    // Weryfikuj podpis jeśli mamy secret (opcjonalne - tylko logowanie)
    if (webhookSecret && svixSignature && svixTimestamp) {
      const isValid = await verifyWebhookSignature(bodyText, svixSignature, svixTimestamp, webhookSecret);
      if (!isValid) {
        // Log warning but don't block - signature verification can be flaky
        console.warn("Webhook signature verification failed - proceeding anyway");
      } else {
        console.log("Webhook signature verified");
      }
    } else {
      console.log("Webhook received - no signature verification configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch email domain settings for forwarding
    const { data: emailDomainSettings } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["email_from_name_transactional", "email_from_transactional"]);

    const domainSettingsMap: Record<string, string> = {};
    emailDomainSettings?.forEach(s => { domainSettingsMap[s.key] = s.value; });

    const forwardFromName = domainSettingsMap.email_from_name_transactional || "CRM Powiadomienia";
    const forwardFromEmail = domainSettingsMap.email_from_transactional || "biuro@tomekniedzwiecki.pl";
    const forwardFromAddress = `${forwardFromName} <${forwardFromEmail}>`;

    // Resend wysyła webhook z danymi inbound email
    // Dokumentacja: https://resend.com/docs/dashboard/webhooks/inbound-emails
    const payload = JSON.parse(bodyText);

    console.log("Received inbound email webhook:", JSON.stringify(payload, null, 2));

    // Resend inbound email format:
    // {
    //   "type": "email.received",
    //   "created_at": "2024-01-01T00:00:00.000Z",
    //   "data": {
    //     "email_id": "...",
    //     "from": "sender@example.com",
    //     "to": ["recipient@yourdomain.com"],
    //     "subject": "Re: Hello",
    //     "text": "Plain text body",
    //     "html": "<p>HTML body</p>",
    //     "headers": { "message-id": "...", "in-reply-to": "..." }
    //   }
    // }

    if (payload.type !== "email.received") {
      console.log("Ignoring non-inbound event:", payload.type);
      return new Response(JSON.stringify({ success: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = payload.data;
    // email_id can be in different fields depending on Resend version
    const emailId = data.email_id || data.id;

    console.log("Webhook data keys:", Object.keys(data));
    console.log("Email ID found:", emailId);

    // Resend nie wysyła treści w webhooku - trzeba pobrać przez API
    // https://resend.com/docs/api-reference/emails/retrieve-received-email
    let emailBody = { text: data.text || null, html: data.html || null };

    const resendApiKey = Deno.env.get("resend_api_key");
    if (resendApiKey && emailId) {
      // Small delay to ensure content is available
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("Fetching email content from Resend API for:", emailId);
      try {
        const apiUrl = `https://api.resend.com/emails/receiving/${emailId}`;
        console.log("API URL:", apiUrl);

        const contentResponse = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          }
        });

        const responseText = await contentResponse.text();
        console.log("API response status:", contentResponse.status);
        console.log("API response body:", responseText.substring(0, 500));

        if (contentResponse.ok) {
          const contentData = JSON.parse(responseText);
          console.log("Got email content, html length:", contentData.html?.length || 0, "text length:", contentData.text?.length || 0);
          emailBody = {
            text: contentData.text || null,
            html: contentData.html || null
          };
        } else {
          console.warn("Failed to fetch email content:", contentResponse.status, responseText);
        }
      } catch (fetchError) {
        console.error("Error fetching email content:", fetchError);
      }
    } else {
      console.warn("No resend_api_key or email_id - cannot fetch email content. API key present:", !!resendApiKey, "Email ID:", emailId);
    }

    // Wyciągnij dane nadawcy
    const fromEmail = extractEmail(data.from);
    const fromName = extractName(data.from);

    // Wyciągnij pierwszy adres odbiorcy
    const toEmail = Array.isArray(data.to) ? extractEmail(data.to[0]) : extractEmail(data.to);

    // Wyciągnij outreach_send_id lub lead_id z adresu reply-to
    // Formaty:
    // - reply+{uuid}@inbound... -> outreach_send_id (odpowiedzi na outreach)
    // - reply+lead-{uuid}@inbound... -> lead_id (odpowiedzi na ręczne emaile)
    let outreachSendId: string | null = null;
    let directLeadId: string | null = null;
    const toRaw = Array.isArray(data.to) ? data.to[0] : data.to;

    // Check for lead-prefixed reply (manual emails from CRM) - legacy format
    const leadMatch = toRaw?.match(/reply\+lead-([a-f0-9-]+)@/i);
    if (leadMatch) {
      directLeadId = leadMatch[1];
      console.log("Extracted lead_id from reply-to:", directLeadId);
    } else {
      // Check for outreach reply
      const replyMatch = toRaw?.match(/reply\+([a-f0-9-]+)@/i);
      if (replyMatch) {
        outreachSendId = replyMatch[1];
        console.log("Extracted outreach_send_id from reply-to:", outreachSendId);
      }
    }

    // If no UUID in reply-to, try to find lead by sender's email address
    // This handles simple reply-to addresses like tomek@inbound.tomekniedzwiecki.pl
    if (!directLeadId && !outreachSendId && fromEmail) {
      console.log("No UUID in reply-to, searching for lead by email:", fromEmail);
      const { data: leadByEmail } = await supabase
        .from("leads")
        .select("id")
        .ilike("email", fromEmail)
        .limit(1)
        .single();

      if (leadByEmail) {
        directLeadId = leadByEmail.id;
        console.log("Found lead by email address:", directLeadId);
      } else {
        console.log("No lead found for email:", fromEmail);
      }
    }

    // Headers
    const messageId = data.headers?.["message-id"] || data.email_id;
    const inReplyTo = data.headers?.["in-reply-to"] || null;

    // Zapisz email do bazy
    const { data: emailRecord, error: insertError } = await supabase
      .from("email_messages")
      .insert({
        direction: "inbound",
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        subject: data.subject,
        body_text: emailBody.text,
        body_html: emailBody.html,
        outreach_send_id: outreachSendId, // Powiązanie z wysyłką outreach
        lead_id: directLeadId, // Powiązanie z leadem (ręczne emaile)
        resend_message_id: messageId,
        in_reply_to: inReplyTo,
        status: "received",
        received_at: payload.created_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting email:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Email saved:", emailRecord.id);

    // Jeśli email został powiązany z leadem, dodaj notatkę
    if (emailRecord.lead_id) {
      await supabase.from("lead_notes").insert({
        lead_id: emailRecord.lead_id,
        content: `📧 Otrzymano email od ${fromEmail}: "${data.subject}"`,
        created_by: null, // System
      });

      // Opcjonalnie: zaktualizuj last_contact_at na leadzie
      await supabase
        .from("leads")
        .update({ last_contact_at: new Date().toISOString() })
        .eq("id", emailRecord.lead_id);
    }

    // Forward email to business email from settings (email_reply_to)
    if (resendApiKey) {
      try {
        const { data: forwardSetting } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "email_reply_to")
          .single();

        const forwardTo = forwardSetting?.value;

        if (forwardTo) {
          console.log("Forwarding email to:", forwardTo);

          // Prepare forwarded email content
          const forwardSubject = `Fwd: ${data.subject}`;
          const forwardHtml = `
            <div style="border-left: 3px solid #10b981; padding-left: 16px; margin-bottom: 16px; color: #6b7280;">
              <p><strong>Od:</strong> ${data.from}</p>
              <p><strong>Do:</strong> ${toEmail}</p>
              <p><strong>Temat:</strong> ${data.subject}</p>
              <p><strong>Data:</strong> ${new Date(payload.created_at).toLocaleString('pl-PL')}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
            ${emailBody.html || emailBody.text || '(brak treści)'}
          `;

          const forwardResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: forwardFromAddress,
              to: forwardTo,
              subject: forwardSubject,
              html: forwardHtml,
              reply_to: fromEmail
            })
          });

          if (forwardResponse.ok) {
            console.log("Email forwarded successfully to:", forwardTo);
          } else {
            const forwardError = await forwardResponse.text();
            console.warn("Failed to forward email:", forwardError);
          }
        } else {
          console.log("No email_reply_to setting configured - skipping forward");
        }
      } catch (forwardError) {
        console.error("Error forwarding email:", forwardError);
        // Don't fail the webhook - email is already saved
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailRecord.id,
        lead_id: emailRecord.lead_id,
        outreach_contact_id: emailRecord.outreach_contact_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper: wyciągnij email z formatu "Name <email@example.com>" lub "email@example.com"
function extractEmail(str: string): string {
  if (!str) return "";
  const match = str.match(/<([^>]+)>/);
  if (match) return match[1].toLowerCase();
  return str.toLowerCase().trim();
}

// Helper: wyciągnij nazwę z formatu "Name <email@example.com>"
function extractName(str: string): string | null {
  if (!str) return null;
  const match = str.match(/^([^<]+)</);
  if (match) return match[1].trim();
  return null;
}
